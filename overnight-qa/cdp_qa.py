#!/usr/bin/env python3
"""CDP QA harness: load a local page, capture console/page errors, screenshot.
Usage: python3 cdp_qa.py <page> [--mobile] [--shot name] [--interact json]
  <page>: path like ai-thumbnail-maker.html (served from site root)
  --mobile: 390x844 viewport, mobile UA
  --shot: screenshot output path (png)
  --interact: JSON list of actions: {"type":"fill","sel":"#id","text":".."},
    {"type":"click","sel":"#id"}, {"type":"wait","ms":3000},
    {"type":"eval","js":"..."} -> returns eval results
Prints JSON: {errors:[...], evals:[...], shot:"..."}
"""
import json, subprocess, time, sys, os, base64, socket, http.server, threading
import websocket

SITE = os.path.expanduser('~/workspace/sabkuch-website')
CHROME = '/opt/meta-chromium/chrome'

def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def serve(port):
    os.chdir(SITE)
    httpd = http.server.HTTPServer(('127.0.0.1', port), Q)
    t = threading.Thread(target=httpd.serve_forever, daemon=True); t.start()
    return httpd

class CDP:
    def __init__(self, ws_url):
        self.ws = websocket.create_connection(ws_url, timeout=30)
        self.i = 0
    def cmd(self, method, params=None, timeout=30):
        self.i += 1
        self.ws.send(json.dumps({"id": self.i, "method": method, "params": params or {}}))
        end = time.time() + timeout
        while time.time() < end:
            m = json.loads(self.ws.recv())
            if m.get('id') == self.i:
                if 'error' in m: raise RuntimeError(m['error'])
                return m.get('result', {})
        raise TimeoutError(method)
    def evts(self, secs):
        out, end = [], time.time() + secs
        self.ws.settimeout(0.5)
        while time.time() < end:
            try: out.append(json.loads(self.ws.recv()))
            except Exception: pass
        self.ws.settimeout(30)
        return out

def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('page'); ap.add_argument('--mobile', action='store_true')
    ap.add_argument('--shot'); ap.add_argument('--interact'); ap.add_argument('--interact-file')
    ap.add_argument('--wait', type=int, default=2500)
    a = ap.parse_args()
    interact_src = a.interact
    if a.interact_file:
        interact_src = open(a.interact_file).read()

    port = free_port(); serve(port)
    dbg = free_port()
    # file:// avoids ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS entirely.
    # (http://127.0.0.1 is blocked even with --disable-features=LocalNetworkAccessChecks)
    import urllib.parse
    start_url = 'file://' + urllib.parse.quote(os.path.join(SITE, a.page))
    # NOTE: pass URL as startup arg
    import urllib.parse as _up
    _proxy = None
    for _k in ('https_proxy', 'HTTPS_PROXY', 'http_proxy', 'HTTP_PROXY'):
        if os.environ.get(_k):
            _p = _up.urlparse(os.environ[_k])
            _proxy = f'{_p.scheme}://{_p.hostname}:{_p.port or 3128}'
            break
    _flags = [CHROME, '--headless=new', '--no-sandbox',
        '--disable-gpu', '--ignore-certificate-errors',
        '--disable-features=LocalNetworkAccessChecks',
        f'--remote-debugging-port={dbg}', '--remote-allow-origins=*',
        f'--user-data-dir=/tmp/cdpqa-{os.getpid()}']
    if _proxy:
        _flags.append(f'--proxy-server={_proxy}')
    _flags.append(start_url)
    chrome = subprocess.Popen(_flags, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        tabs = None
        for _ in range(40):
            try:
                import urllib.request
                tabs = json.loads(urllib.request.urlopen(f'http://127.0.0.1:{dbg}/json/list', timeout=2).read())
                break
            except Exception: time.sleep(0.5)
        ws_url = [t['webSocketDebuggerUrl'] for t in tabs if t['type'] == 'page'][0]
        c = CDP(ws_url)
        c.cmd('Page.enable'); c.cmd('Runtime.enable'); c.cmd('Log.enable')
        if a.mobile:
            c.cmd('Emulation.setDeviceMetricsOverride', {"width": 390, "height": 844,
                "deviceScaleFactor": 2, "mobile": True})
            c.cmd('Emulation.setUserAgentOverride', {"userAgent":
                "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"})
            # reload under mobile emulation (from local page -> local URL is allowed)
            c.cmd('Page.navigate', {"url": start_url})
        # page loading via startup URL; wait for it
        time.sleep(max(a.wait, 3000) / 1000)
        errors, evals = [], []
        for e in c.evts(1.5):
            if e.get('method') == 'Runtime.consoleAPICalled' and e['params']['type'] in ('error',):
                errors.append('console:' + ' '.join(str(x.get('value', x.get('description',''))) for x in e['params']['args'])[:300])
            if e.get('method') == 'Runtime.exceptionThrown':
                errors.append('page:' + str(e['params']['exceptionDetails'].get('text',''))[:300])
            if e.get('method') == 'Log.entryAdded' and e['params']['entry']['level'] == 'error':
                errors.append('log:' + e['params']['entry']['text'][:300])
        if interact_src:
            for act in json.loads(interact_src):
                t = act['type']
                if t == 'fill':
                    c.cmd('Runtime.evaluate', {"expression":
                        f"(function(){{var el=document.querySelector({json.dumps(act['sel'])});if(!el)return 'NOFIELD';el.focus();el.value={json.dumps(act['text'])};el.dispatchEvent(new Event('input',{{bubbles:true}}));return 'ok';}})()"})
                elif t == 'click':
                    c.cmd('Runtime.evaluate', {"expression":
                        f"(function(){{var el=document.querySelector({json.dumps(act['sel'])});if(!el)return 'NOBTN';el.click();return 'clicked';}})()"})
                elif t == 'wait':
                    time.sleep(act['ms'] / 1000)
                elif t == 'eval':
                    r = c.cmd('Runtime.evaluate', {"expression": act['js'], "returnByValue": True})
                    inner = r.get('result', {})
                    if 'exceptionDetails' in inner:
                        evals.append('EVAL-EXC: ' + str(inner['exceptionDetails'].get('text', ''))[:300])
                    else:
                        v = inner.get('value')
                        evals.append(v if not isinstance(v, str) else v[:2000])
                for e in c.evts(0.3):
                    if e.get('method') == 'Runtime.exceptionThrown':
                        errors.append('page:' + str(e['params']['exceptionDetails'].get('text',''))[:300])
        shot = None
        if a.shot:
            shot = os.path.abspath(a.shot)
            r = c.cmd('Page.captureScreenshot', {"format": "png"})
            open(shot, 'wb').write(base64.b64decode(r['data']))
        print(json.dumps({"errors": errors, "evals": evals, "shot": shot}))
    finally:
        chrome.terminate()

if __name__ == '__main__':
    main()
