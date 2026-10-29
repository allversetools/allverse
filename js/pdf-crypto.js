'use strict';
// Pure-JS PDF Standard security handler (V=2, R=3, 128-bit RC4) — Algorithms 3.1/3.2/3.3/3.5.
// Browser-safe (no Node deps); in a browser it exposes window.PDFCrypto.
// Supported: V=1 (40-bit RC4) and V=2 (128-bit RC4). AES (V=4 AESV2/AESV3, V=5/R=6) is NOT —
// decryptPdf throws 'unsupported encryption' for those files, so the UI can say so honestly.
// Design: every object is rebuilt from scratch (strings re-escaped, streams RC4'd in place as bytes),
// so length changes are safe. Incremental-update (/Prev) xref chains are followed and merged.

function md5(bytes) {
  function add32(a, b) { return (a + b) | 0; }
  function rol(x, c) { return (x << c) | (x >>> (32 - c)); }
  function F(x, y, z) { return (x & y) | (~x & z); }
  function G(x, y, z) { return (x & z) | (y & ~z); }
  function H(x, y, z) { return x ^ y ^ z; }
  function I(x, y, z) { return y ^ (x | ~z); }
  const S = [7,12,17,22, 7,12,17,22, 7,12,17,22, 7,12,17,22,
             5,9,14,20, 5,9,14,20, 5,9,14,20, 5,9,14,20,
             4,11,16,23, 4,11,16,23, 4,11,16,23, 4,11,16,23,
             6,10,15,21, 6,10,15,21, 6,10,15,21, 6,10,15,21];
  const K = [];
  for (let i = 0; i < 64; i++) K.push(Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0);
  const msg = Array.from(bytes);
  const bitLen = msg.length * 8;
  msg.push(0x80);
  while ((msg.length % 64) !== 56) msg.push(0);
  for (let i = 0; i < 8; i++) msg.push((bitLen / Math.pow(2, i * 8)) & 0xff);
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  for (let off = 0; off < msg.length; off += 64) {
    const M = [];
    for (let i = 0; i < 16; i++) M.push(msg[off + i * 4] | (msg[off + i * 4 + 1] << 8) | (msg[off + i * 4 + 2] << 16) | (msg[off + i * 4 + 3] << 24));
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let f, g;
      if (i < 16) { f = F(B, C, D); g = i; }
      else if (i < 32) { f = G(B, C, D); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = H(B, C, D); g = (3 * i + 5) % 16; }
      else { f = I(B, C, D); g = (7 * i) % 16; }
      f = add32(add32(f, A), add32(K[i], M[g]));
      A = D; D = C; C = B;
      B = add32(B, rol(f, S[i]));
    }
    a0 = add32(a0, A); b0 = add32(b0, B); c0 = add32(c0, C); d0 = add32(d0, D);
  }
  const out = new Uint8Array(16);
  [a0, b0, c0, d0].forEach((v, i) => { out[i * 4] = v & 0xff; out[i * 4 + 1] = (v >>> 8) & 0xff; out[i * 4 + 2] = (v >>> 16) & 0xff; out[i * 4 + 3] = (v >>> 24) & 0xff; });
  return out;
}

function rc4(key, data) {
  const S = new Uint8Array(256);
  for (let i = 0; i < 256; i++) S[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) { j = (j + S[i] + key[i % key.length]) & 0xff; const t = S[i]; S[i] = S[j]; S[j] = t; }
  const out = new Uint8Array(data.length);
  let ii = 0; j = 0;
  for (let n = 0; n < data.length; n++) {
    ii = (ii + 1) & 0xff; j = (j + S[ii]) & 0xff;
    const t = S[ii]; S[ii] = S[j]; S[j] = t;
    out[n] = data[n] ^ S[(S[ii] + S[j]) & 0xff];
  }
  return out;
}

const PADDING = new Uint8Array([0x28,0xbf,0x4e,0x5e,0x4e,0x75,0x8a,0x41,0x64,0x00,0x4e,0x56,0xff,0xfa,0x01,0x08,0x2e,0x2e,0x00,0xb6,0xd0,0x68,0x3e,0x80,0x2f,0x0c,0xa9,0xfe,0x64,0x53,0x69,0x7a]);
function padPw(pw) {
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) out[i] = i < pw.length ? pw[i] : PADDING[i - pw.length];
  return out;
}
function toBytes(s) { return new TextEncoder().encode(s); }
function fromBytes(b) { return new TextDecoder('latin1').decode(b); }
function latin1Bytes(s) {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
  return out;
}
function hex(b) { return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join(''); }
function unhex(s) {
  const out = new Uint8Array(Math.floor(s.length / 2));
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.substr(i * 2, 2), 16);
  return out;
}
function concat(...arrs) {
  const len = arrs.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const a of arrs) { out.set(a, o); o += a.length; }
  return out;
}
function escapeBytes(b) {
  let esc = '';
  for (const x of b) {
    if (x === 40) esc += '\\(';
    else if (x === 41) esc += '\\)';
    else if (x === 92) esc += '\\\\';
    else if (x === 10) esc += '\\n';
    else if (x === 13) esc += '\\r';
    else if (x === 9) esc += '\\t';
    else if (x === 8) esc += '\\b';
    else if (x === 12) esc += '\\f';
    else if (x < 32 || x > 126) esc += '\\' + x.toString(8).padStart(3, '0');
    else esc += String.fromCharCode(x);
  }
  return esc;
}

// Algorithm 3.2 — encryption key from password (R=3, 128-bit, 50 MD5 rounds)
// Spec detail (32000-1 Algorithm 3.2 step f): the 0xFFFFFFFF bytes are appended ONLY when
// document metadata is NOT encrypted. Standard files encrypt metadata, so normally NO 0xFF.
function computeKey(password, O, P, fileId, encryptMetadata) {
  const keyLen = 16;
  let m = md5(concat(padPw(password), O, new Uint8Array([(P & 0xff), ((P >> 8) & 0xff), ((P >> 16) & 0xff), ((P >> 24) & 0xff)]), fileId, encryptMetadata ? new Uint8Array(0) : new Uint8Array([0xff, 0xff, 0xff, 0xff])));
  for (let i = 0; i < 50; i++) m = md5(m.slice(0, keyLen));
  return m.slice(0, keyLen);
}
// Algorithm 3.3 — U value (user-password verification), R=3 (19 XOR rounds — the detail that matters)
function computeU(key, fileId) {
  const base = md5(concat(PADDING, fileId));
  let cur = rc4(key, base);
  for (let i = 1; i <= 19; i++) {
    const k2 = new Uint8Array(key.length);
    for (let j = 0; j < key.length; j++) k2[j] = key[j] ^ i;
    cur = rc4(k2, cur);
  }
  const out = new Uint8Array(32);
  out.set(cur, 0);
  return out;
}
// Algorithm 3.5 — per-object key
function objectKey(fileKey, objNum, genNum) {
  const ext = new Uint8Array([objNum & 0xff, (objNum >> 8) & 0xff, (objNum >> 16) & 0xff, genNum & 0xff, (genNum >> 8) & 0xff]);
  const h = md5(concat(fileKey, ext));
  return h.slice(0, Math.min(fileKey.length + 5, 16));
}

// --- xref parsing (plain xref tables only; object streams rejected) ---
function parseTrailerAt(text, tIdx) {
  const tEnd = text.indexOf('>>', tIdx);
  if (tEnd < 0) return null;
  const tText = text.slice(tIdx, tEnd + 2);
  const getInt = (name) => {
    const m = tText.match(new RegExp('/' + name + '\\s+(\\d+)'));
    return m ? parseInt(m[1], 10) : null;
  };
  const getRef = (name) => {
    const m = tText.match(new RegExp('/' + name + '\\s+(\\d+)\\s+(\\d+)\\s+R'));
    return m ? [parseInt(m[1], 10), parseInt(m[2], 10)] : null;
  };
  const idMatch = tText.match(/\/ID\s*\[\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*\]/);
  const prevMatch = tText.match(/\/Prev\s+(\d+)/);
  return {
    size: getInt('Size'), root: getRef('Root'), info: getRef('Info'),
    id0: idMatch ? unhex(idMatch[1]) : null,
    prev: prevMatch ? parseInt(prevMatch[1], 10) : null,
    text: tText,
  };
}
function parseXrefSection(text, xOff) {
  // xOff points at the 'xref' keyword of a plain table section.
  const tIdx = text.indexOf('trailer', xOff);
  if (tIdx < 0) return null;
  const body = text.slice(xOff + 4, tIdx);
  const lines = body.split(/\r?\n/);
  const map = {};
  let i = 0;
  while (i < lines.length) {
    const h = lines[i].trim().match(/^(\d+)\s+(\d+)$/);
    if (h) {
      const start = parseInt(h[1], 10), count = parseInt(h[2], 10);
      i++;
      for (let k = 0; k < count && i < lines.length; k++, i++) {
        const e = lines[i].trim().match(/^(\d{10})\s+(\d{5})\s+([nf])$/);
        if (e && e[3] === 'n') map[start + k] = { off: parseInt(e[1], 10), gen: parseInt(e[2], 10) };
      }
    } else i++;
  }
  return { map, trailer: parseTrailerAt(text, tIdx) };
}
function parseXrefChain(bytes) {
  const text = fromBytes(bytes);
  // newest section: the LAST 'xref' that is not part of 'startxref'
  let xOff = -1, probe = text.length;
  while (true) {
    const idx = text.lastIndexOf('xref', probe - 1);
    if (idx < 0) break;
    if (text.slice(idx - 5, idx) !== 'start') { xOff = idx; break; }
    probe = idx;
  }
  if (xOff < 0) throw new Error('unsupported xref (object streams)');
  const sections = [];
  let off = xOff, guard = 0;
  while (off !== null && off >= 0 && guard++ < 50) {
    const sec = parseXrefSection(text, off);
    if (!sec) break;
    sections.push(sec);
    off = sec.trailer ? sec.trailer.prev : null;
  }
  if (sections.length === 0) throw new Error('unsupported xref (object streams)');
  const map = {};
  for (const sec of sections.slice().reverse()) Object.assign(map, sec.map);
  return { map, trailer: sections[0].trailer };
}
function findEncryptDict(bytes) {
  const text = fromBytes(bytes);
  const m = text.match(/\/Encrypt\s+(\d+)\s+(\d+)\s+R/);
  if (!m) return null;
  const ref = m[1] + ' ' + m[2] + ' obj';
  const idx = text.indexOf(ref);
  if (idx < 0) return null;
  const end = text.indexOf('endobj', idx);
  if (end < 0) return null;
  return { num: parseInt(m[1], 10), dictText: text.slice(idx, end + 6) };
}
function parseEncryptDict(dictText) {
  const getHex = (name) => {
    const m = dictText.match(new RegExp('/' + name + '\\s*<([0-9a-fA-F]+)>'));
    return m ? unhex(m[1]) : null;
  };
  const getInt = (name) => {
    const m = dictText.match(new RegExp('/' + name + '\\s+(-?\\d+)'));
    return m ? parseInt(m[1], 10) : null;
  };
  return { O: getHex('O'), U: getHex('U'), P: getInt('P'), V: getInt('V'), R: getInt('R'), Length: getInt('Length') };
}

// --- object transform: rebuild one object, RC4-ing its strings and streams with `okey` ---
// Returns the new object bytes (header 'N G obj' ... 'endobj'), or null if the object has no transformable content.
// Stream bytes come from the ORIGINAL file bytes (latin1 text index == byte offset).
function transformObject(inputBytes, objText, objOff, okey) {
  const chunks = []; // Uint8Array pieces
  const pushText = (s) => { if (s.length) chunks.push(latin1Bytes(s)); };
  let pos = 0;
  const len = objText.length;
  while (pos < len) {
    const ch = objText[pos];
    if (ch === '%') {
      // comment to end of line — verbatim
      const nl = objText.indexOf('\n', pos);
      const end = nl < 0 ? len : nl + 1;
      pushText(objText.slice(pos, end)); pos = end; continue;
    }
    if (ch === '(') {
      // literal string: parse escapes + nesting -> raw bytes -> RC4 -> re-escape
      let p = pos + 1, depth = 1;
      const raw = [];
      while (p < len && depth > 0) {
        const c = objText[p];
        if (c === '\\') {
          const n = objText[p + 1];
          if (n === 'n') { raw.push(10); p += 2; }
          else if (n === 'r') { raw.push(13); p += 2; }
          else if (n === 't') { raw.push(9); p += 2; }
          else if (n === 'b') { raw.push(8); p += 2; }
          else if (n === 'f') { raw.push(12); p += 2; }
          else if (n === '(' || n === ')' || n === '\\') { raw.push(n.charCodeAt(0)); p += 2; }
          else if (n >= '0' && n <= '7') {
            let oct = '', q = p + 1;
            while (q < p + 4 && objText[q] >= '0' && objText[q] <= '7') { oct += objText[q]; q++; }
            raw.push(parseInt(oct, 8) & 0xff); p = q;
          } else if (n === '\r' || n === '\n') { p += 2; if (n === '\r' && objText[p] === '\n') p++; }
          else if (n === undefined) { p++; }
          else { raw.push(n.charCodeAt(0)); p += 2; }
        } else if (c === '(') { depth++; raw.push(40); p++; }
        else if (c === ')') { depth--; if (depth > 0) raw.push(41); p++; }
        else { raw.push(c.charCodeAt(0) & 0xff); p++; }
      }
      pushText('(' + escapeBytes(rc4(okey, new Uint8Array(raw))) + ')');
      pos = p; continue;
    }
    if (ch === '<' && objText[pos + 1] !== '<') {
      // hex string -> bytes -> RC4 -> hex (same byte length, hex chars double — fine in rebuild)
      // BUT only if the content is actually hex: a dict '<<' followed by names must NOT be
      // mistaken for a hex string (that corruption broke object dicts in the first test).
      const close = objText.indexOf('>', pos + 1);
      if (close < 0) { pushText(objText.slice(pos)); break; }
      const hexStr = objText.slice(pos + 1, close).replace(/\s+/g, '');
      if (!/^[0-9a-fA-F]*$/.test(hexStr)) { pushText('<'); pos++; continue; }
      const raw = unhex(hexStr.length % 2 ? hexStr + '0' : hexStr);
      pushText('<' + hex(rc4(okey, raw)) + '>');
      pos = close + 1; continue;
    }
    if (objText.startsWith('stream', pos) && !/[A-Za-z0-9]/.test(objText[pos + 6] || '')) {
      // stream keyword: copy it + EOL, then RC4 the raw stream bytes in place (same length)
      let dataStart = pos + 6;
      if (objText[dataStart] === '\r' && objText[dataStart + 1] === '\n') dataStart += 2;
      else if (objText[dataStart] === '\n' || objText[dataStart] === '\r') dataStart += 1;
      const eIdx = objText.indexOf('endstream', dataStart);
      if (eIdx < 0) { pushText(objText.slice(pos)); break; }
      let dataEnd = eIdx;
      if (objText[dataEnd - 1] === '\n') dataEnd--;
      if (objText[dataEnd - 1] === '\r') dataEnd--;
      pushText(objText.slice(pos, dataStart));
      const raw = new Uint8Array(inputBytes.buffer, inputBytes.byteOffset + objOff + dataStart, dataEnd - dataStart);
      chunks.push(rc4(okey, raw));
      pushText(objText.slice(dataEnd, eIdx));
      pos = eIdx; continue;
    }
    // ordinary character — copy one char (dicts, numbers, names, whitespace, 'endobj', etc.)
    pushText(ch); pos++;
  }
  const total = chunks.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const b of chunks) { out.set(b, o); o += b.length; }
  return out;
}

// --- rebuild a whole file from transformed objects ---
function rebuildFile(inputBytes, map, trailer, transformFn, extraTrailer) {
  const text = fromBytes(inputBytes);
  const headerEnd = text.indexOf('\n');
  const header = headerEnd >= 0 ? text.slice(0, headerEnd + 1) : '%PDF-1.7\n';
  const nums = Object.keys(map).map(Number).sort((a, b) => a - b);
  const parts = [latin1Bytes(header)];
  const newMap = {};
  let cursor = parts[0].length;
  for (const num of nums) {
    const { off, gen } = map[num];
    const objText = text.slice(off, text.indexOf('endobj', off) + 6);
    const made = transformFn(num, gen, objText, off);
    if (made === null) continue; // skipped object (e.g. the encrypt dict on decrypt)
    newMap[num] = { off: cursor, gen };
    parts.push(made);
    cursor += made.length;
    if (made[made.length - 1] !== 10) { parts.push(latin1Bytes('\n')); cursor += 1; }
  }
  const xrefOff = cursor;
  const size = (nums.length ? Math.max(...nums) : 0) + 1;
  let xrefText = 'xref\n0 ' + size + '\n0000000000 65535 f \n';
  for (let n = 1; n < size; n++) {
    if (newMap[n]) xrefText += String(newMap[n].off).padStart(10, '0') + ' ' + String(newMap[n].gen).padStart(5, '0') + ' n \n';
    else xrefText += '0000000000 65535 f \n';
  }
  const rootRef = trailer.root ? trailer.root[0] + ' ' + trailer.root[1] + ' R' : '1 0 R';
  const infoRef = trailer.info ? ' /Info ' + trailer.info[0] + ' ' + trailer.info[1] + ' R' : '';
  const idPart = trailer.id0 ? ' /ID [<' + hex(trailer.id0) + '><' + hex(trailer.id0) + '>]' : '';
  xrefText += 'trailer\n<< /Size ' + size + ' /Root ' + rootRef + infoRef + extraTrailer + idPart + ' >>\nstartxref\n' + xrefOff + '\n%%EOF\n';
  parts.push(latin1Bytes(xrefText));
  const total = parts.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const b of parts) { out.set(b, o); o += b.length; }
  return out;
}

// --- encrypt: input = UNencrypted PDF bytes (pdf-lib output with useObjectStreams:false) ---
function encryptPdf(inputBytes, password) {
  const pw = toBytes(password);
  // Algorithm 3.7 (R=3): O value from owner password (owner == user here) with 19 XOR rounds.
  let m = md5(padPw(pw));
  for (let i = 0; i < 50; i++) m = md5(m);
  const ownerKey = m.slice(0, 16);
  let cur = padPw(pw);
  for (let i = 19; i >= 0; i--) {
    const k2 = new Uint8Array(16);
    for (let j = 0; j < 16; j++) k2[j] = ownerKey[j] ^ i;
    cur = rc4(k2, cur);
  }
  const O = cur;
  const id0 = md5(inputBytes);
  const P = -3904; // print + copy allowed, modify/extract denied
  const fileKey = computeKey(pw, O, P, id0, true);
  const U = computeU(fileKey, id0);
  const { map, trailer } = parseXrefChain(inputBytes);
  const nums = Object.keys(map).map(Number);
  const newObjNum = (nums.length ? Math.max(...nums) : 0) + 1;
  const encObjText = newObjNum + ' 0 obj\n<< /Filter /Standard /V 2 /R 3 /Length 128 /O <' + hex(O) + '> /U <' + hex(U) + '> /P ' + P + ' >>\nendobj\n';
  const encObjBytes = latin1Bytes(encObjText);
  // rebuild: transformed objects + encrypt dict appended, trailer gains /Encrypt
  const text = fromBytes(inputBytes);
  const headerEnd = text.indexOf('\n');
  const header = headerEnd >= 0 ? text.slice(0, headerEnd + 1) : '%PDF-1.7\n';
  const parts = [latin1Bytes(header)];
  const newMap = {};
  let cursor = parts[0].length;
  const sorted = nums.sort((a, b) => a - b);
  for (const num of sorted) {
    const { off, gen } = map[num];
    const objText = text.slice(off, text.indexOf('endobj', off) + 6);
    const made = transformObject(inputBytes, objText, off, objectKey(fileKey, num, gen));
    newMap[num] = { off: cursor, gen };
    parts.push(made); cursor += made.length;
    if (made[made.length - 1] !== 10) { parts.push(latin1Bytes('\n')); cursor += 1; }
  }
  newMap[newObjNum] = { off: cursor, gen: 0 };
  parts.push(encObjBytes); cursor += encObjBytes.length;
  const xrefOff = cursor;
  const size = newObjNum + 1;
  let xrefText = 'xref\n0 ' + size + '\n0000000000 65535 f \n';
  for (let n = 1; n < size; n++) {
    if (newMap[n]) xrefText += String(newMap[n].off).padStart(10, '0') + ' ' + String(newMap[n].gen).padStart(5, '0') + ' n \n';
    else xrefText += '0000000000 65535 f \n';
  }
  const rootRef = trailer.root ? trailer.root[0] + ' ' + trailer.root[1] + ' R' : '1 0 R';
  const infoRef = trailer.info ? ' /Info ' + trailer.info[0] + ' ' + trailer.info[1] + ' R' : '';
  xrefText += 'trailer\n<< /Size ' + size + ' /Root ' + rootRef + infoRef + ' /Encrypt ' + newObjNum + ' 0 R /ID [<' + hex(id0) + '><' + hex(id0) + '>] >>\nstartxref\n' + xrefOff + '\n%%EOF\n';
  parts.push(latin1Bytes(xrefText));
  const total = parts.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const b of parts) { out.set(b, o); o += b.length; }
  return out;
}

// --- decrypt: input = encrypted PDF bytes ---
function decryptPdf(inputBytes, password) {
  const enc = findEncryptDict(inputBytes);
  if (!enc) throw new Error('not encrypted');
  const dictText = enc.dictText;
  if (/\/V\s+5/.test(dictText) || /AESV3/.test(dictText) || /AESV2/.test(dictText)) throw new Error('unsupported encryption');
  const d = parseEncryptDict(dictText);
  if (!d.O || !d.U || d.P === null) throw new Error('bad encrypt dict');
  const { map, trailer } = parseXrefChain(inputBytes);
  const fileId = trailer.id0;
  if (!fileId) throw new Error('no file id');
  const pw = toBytes(password);
  const keyLen = (d.Length || 128) / 8;
  const fileKey = computeKey(pw, d.O, d.P, fileId, true).slice(0, keyLen);
  const expectU = computeU(fileKey, fileId);
  let ok = true;
  for (let i = 0; i < 16; i++) if (expectU[i] !== d.U[i]) { ok = false; break; }
  if (!ok) throw new Error('incorrect password');
  const text = fromBytes(inputBytes);
  const headerEnd = text.indexOf('\n');
  const header = headerEnd >= 0 ? text.slice(0, headerEnd + 1) : '%PDF-1.7\n';
  const parts = [latin1Bytes(header)];
  const newMap = {};
  let cursor = parts[0].length;
  const nums = Object.keys(map).map(Number).sort((a, b) => a - b);
  for (const num of nums) {
    if (num === enc.num) continue; // drop the encrypt dict itself
    const { off, gen } = map[num];
    const objText = text.slice(off, text.indexOf('endobj', off) + 6);
    const made = transformObject(inputBytes, objText, off, objectKey(fileKey, num, gen));
    newMap[num] = { off: cursor, gen };
    parts.push(made); cursor += made.length;
    if (made[made.length - 1] !== 10) { parts.push(latin1Bytes('\n')); cursor += 1; }
  }
  const xrefOff = cursor;
  const size = (nums.length ? Math.max(...nums) : 0) + 1;
  let xrefText = 'xref\n0 ' + size + '\n0000000000 65535 f \n';
  for (let n = 1; n < size; n++) {
    if (newMap[n]) xrefText += String(newMap[n].off).padStart(10, '0') + ' ' + String(newMap[n].gen).padStart(5, '0') + ' n \n';
    else xrefText += '0000000000 65535 f \n';
  }
  const rootRef = trailer.root ? trailer.root[0] + ' ' + trailer.root[1] + ' R' : '1 0 R';
  const infoRef = trailer.info ? ' /Info ' + trailer.info[0] + ' ' + trailer.info[1] + ' R' : '';
  const idPart = trailer.id0 ? ' /ID [<' + hex(trailer.id0) + '><' + hex(trailer.id0) + '>]' : '';
  xrefText += 'trailer\n<< /Size ' + size + ' /Root ' + rootRef + infoRef + idPart + ' >>\nstartxref\n' + xrefOff + '\n%%EOF\n';
  parts.push(latin1Bytes(xrefText));
  const total = parts.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const b of parts) { out.set(b, o); o += b.length; }
  return out;
}

if (typeof module !== 'undefined' && module.exports) { module.exports = { md5, rc4, encryptPdf, decryptPdf, hex }; }
if (typeof window !== 'undefined') { window.PDFCrypto = { encryptPdf: encryptPdf, decryptPdf: decryptPdf }; }
