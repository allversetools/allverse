/* ============================================================
   AllVerse — Shared behaviour (vanilla JS, no dependencies)
   1. Mobile sidebar menu   2. Live tool search
   3. Scroll reveal          4. Card tilt + glare (CSS vars)
   5. Button ripple         6. Global SK helpers (copy / download)
   7. Dark mode toggle      8. Spotlight grid tracking
   9. Magnetic buttons     10. Command palette (Ctrl+K)
   11. Favorites + recently used (localStorage)
   ============================================================ */
(function () {
  'use strict';

  var HOVERABLE = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Tool registry (powers palette + favorites) ---------- */
  var TOOLS = [
    { name: 'Image Resizer', href: 'image-resizer.html', cat: 'Image Tools', keys: 'resize photo dimensions tasveer photo chota bara size karo' },
    { name: 'Image Compressor', href: 'image-compressor.html', cat: 'Image Tools', keys: 'compress shrink optimize jpg png tasveer photo halki size kam karo' },
    { name: 'YouTube Thumbnail Resizer', href: 'youtube-thumbnail-resizer.html', cat: 'Image Tools', keys: 'youtube thumbnail 1280 720 resize youtube thumbnail tasveer size banao' },
    { name: 'Word Counter', href: 'word-counter.html', cat: 'Text Tools', keys: 'words characters reading time lafz gino alfaz ginna' },
    { name: 'Case Converter', href: 'case-converter.html', cat: 'Text Tools', keys: 'uppercase lowercase title case bara chota huruf badlo' },
    { name: 'BMI Calculator', href: 'bmi-calculator.html', cat: 'Calculators', keys: 'body mass index weight height wazan sehat motapa hisaab' },
    { name: 'Age Calculator', href: 'age-calculator.html', cat: 'Calculators', keys: 'birthday years months days umar saal paidaish hisaab' },
    { name: 'Unit Converter', href: 'unit-converter.html', cat: 'Converters', keys: 'length weight temperature nap tol tabdeel karo' },
    { name: 'Currency Converter', href: 'currency-converter.html', cat: 'Converters', keys: 'pkr usd eur money exchange paisa dollar rupya tabdeel' },
    { name: 'Password Generator', href: 'password-generator.html', cat: 'Generators', keys: 'strong random secure password banao mazboot' },
    { name: 'QR Generator', href: 'qr-generator.html', cat: 'Generators', keys: 'qr code scan text link qr code banao scan' },
    { name: 'WhatsApp Link Generator', href: 'whatsapp-link-generator.html', cat: 'Generators', keys: 'whatsapp wa.me link message whatsapp link banao bhejo' },
    { name: 'JSON Formatter', href: 'json-formatter.html', cat: 'Developer Tools', keys: 'validate minify beautify code json code theek karo' },
    { name: 'Color Picker', href: 'color-picker.html', cat: 'Developer Tools', keys: 'hex rgb hsl eyedropper rang chuno rangon' },
    { name: 'Palette Generator', href: 'palette-generator.html', cat: 'Color Tools', keys: 'color scheme swatches rangon ka set banao' },
    { name: 'Contrast Checker', href: 'contrast-checker.html', cat: 'Color Tools', keys: 'wcag accessibility ratio rang farq check' },
    { name: 'Countdown Timer', href: 'countdown-timer.html', cat: 'Date & Time', keys: 'countdown days hours ulta gino waqt' },
    { name: 'Date Difference', href: 'date-difference.html', cat: 'Date & Time', keys: 'days between dates tarikh farq din gino' },
    { name: 'Hashtag Generator', href: 'hashtag-generator.html', cat: 'Social Media', keys: 'instagram tiktok tags hashtag banao' },
    { name: 'Bio Maker', href: 'bio-maker.html', cat: 'Social Media', keys: 'profile instagram about bio banao profile' },
    { name: 'Random Picker', href: 'random-picker.html', cat: 'Fun Tools', keys: 'random draw pick winner qismat chuno faisla' },
    { name: 'Dice Roller', href: 'dice-roller.html', cat: 'Fun Tools', keys: 'dice roll game gutti pasa khel' },
    { name: 'Percentage Calculator', href: 'percentage-calculator.html', cat: 'Calculators', keys: 'percent discount increase feesad hisaab nikaalo' },
    { name: 'EMI Calculator', href: 'emi-calculator.html', cat: 'Calculators', keys: 'loan monthly installment interest qist loan mahina hisaab' },
    { name: 'Discount Calculator', href: 'discount-calculator.html', cat: 'Calculators', keys: 'sale price savings off riayat chhoot dam hisaab' },
    { name: 'UTM Link Builder', href: 'utm-builder.html', cat: 'Developer Tools', keys: 'utm campaign url tracking analytics link tracking banao' },
    { name: 'UUID Generator', href: 'uuid-generator.html', cat: 'Developer Tools', keys: 'guid unique id random id banao naya' },
    { name: 'Timestamp Converter', href: 'timestamp-converter.html', cat: 'Developer Tools', keys: 'epoch unix time date time tabdeel karo' },
    { name: 'URL Encoder Decoder', href: 'url-encoder-decoder.html', cat: 'Developer Tools', keys: 'encode decode uri percent link code tabdeel karo' },
    { name: 'Slug Generator', href: 'slug-generator.html', cat: 'Text Tools', keys: 'url slug permalink kebab link naam banao' },
    { name: 'Invoice Generator', href: 'invoice-generator.html', cat: 'Generators', keys: 'invoice bill pdf freelance bill rasid banao' },
    { name: 'Lorem Ipsum Generator', href: 'lorem-ipsum.html', cat: 'Text Tools', keys: 'lorem ipsum dummy placeholder text namuna text likho' },
    { name: 'Meta Tag Generator', href: 'meta-tag-generator.html', cat: 'SEO Tools', keys: 'meta tags generator seo open graph twitter card website meta tag banao' },
    { name: 'Keyword Density Checker', href: 'keyword-density-checker.html', cat: 'SEO Tools', keys: 'keyword density checker seo word frequency lafz ginna seo check' },
    { name: 'Robots.txt Generator', href: 'robots-txt-generator.html', cat: 'SEO Tools', keys: 'robots txt generator allow disallow sitemap website robots banao' },
    { name: 'Open Graph Preview', href: 'open-graph-preview.html', cat: 'SEO Tools', keys: 'open graph preview facebook twitter card link link preview dekho' },
    { name: 'Compound Interest Calculator', href: 'compound-interest-calculator.html', cat: 'Finance Tools', keys: 'compound interest calculator investment growth sood munafa hisaab' },
    { name: 'SIP Calculator', href: 'sip-calculator.html', cat: 'Finance Tools', keys: 'sip calculator systematic investment plan mutual fund mahana bachat hisaab' },
    { name: 'GST Calculator', href: 'gst-calculator.html', cat: 'Finance Tools', keys: 'gst calculator tax add remove rate tax hisaab nikaalo' },
    { name: 'Bill Splitter', href: 'bill-splitter.html', cat: 'Finance Tools', keys: 'bill splitter split tip per person share bill banto hissa karo' },
    { name: 'BMR Calculator', href: 'bmr-calculator.html', cat: 'Health Tools', keys: 'bmr calculator basal metabolic rate tdee calories calories jism hisaab' },
    { name: 'Water Intake Calculator', href: 'water-intake-calculator.html', cat: 'Health Tools', keys: 'water intake calculator daily hydration liters pani piyo sehat hisaab' },
    { name: 'Pregnancy Due Date Calculator', href: 'due-date-calculator.html', cat: 'Health Tools', keys: 'pregnancy due date calculator trimester weeks bacha paidaish tarikh hisaab' },
    { name: 'Body Fat Calculator', href: 'body-fat-calculator.html', cat: 'Health Tools', keys: 'body fat calculator navy method percentage charbi wazan hisaab' },
    { name: 'Readability Checker', href: 'readability-checker.html', cat: 'Writing Tools', keys: 'readability checker flesch reading ease grade parhna asaan check' },
    { name: 'Text Summarizer', href: 'text-summarizer.html', cat: 'Writing Tools', keys: 'text summarizer article summary tldr khulasa banao mukhtasir' },
    { name: 'Citation Generator', href: 'citation-generator.html', cat: 'Writing Tools', keys: 'citation generator apa mla bibliography hawala banao' },
    { name: 'Headline Analyzer', href: 'headline-analyzer.html', cat: 'Writing Tools', keys: 'headline analyzer title score blog seo surkhi check karo' },
    { name: 'ROI Calculator', href: 'roi-calculator.html', cat: 'Marketing Tools', keys: 'roi calculator roas ad spend return profit munafa hisaab nikaalo' },
    { name: 'Engagement Rate Calculator', href: 'engagement-rate-calculator.html', cat: 'Marketing Tools', keys: 'engagement rate calculator instagram followers likes hisaab nikaalo' },
    { name: 'CPC Calculator', href: 'cpc-calculator.html', cat: 'Marketing Tools', keys: 'cpc calculator cpm cost per click impressions click kharcha hisaab' },
    { name: 'A/B Test Calculator', href: 'ab-test-calculator.html', cat: 'Marketing Tools', keys: 'ab test calculator significance conversion uplift test mawazna karo' },
    { name: 'GPA Calculator', href: 'gpa-calculator.html', cat: 'Education Tools', keys: 'gpa calculator grade point average credits number grade hisaab' },
    { name: 'Scientific Calculator', href: 'scientific-calculator.html', cat: 'Education Tools', keys: 'scientific calculator trigonometry log sqrt hisaab kitab karo' },
    { name: 'Pomodoro Timer', href: 'pomodoro-timer.html', cat: 'Education Tools', keys: 'pomodoro timer focus study productivity parhai timer lagao' },
    { name: 'Final Grade Calculator', href: 'final-grade-calculator.html', cat: 'Education Tools', keys: 'final grade calculator exam score needed imtihan number hisaab' },
    { name: 'Merge PDF', href: 'merge-pdf.html', cat: 'PDF Tools', keys: 'merge pdf combine join concatenate pdf joro milao' },
    { name: 'Images to PDF', href: 'images-to-pdf.html', cat: 'PDF Tools', keys: 'images to pdf jpg png photo converter tasveer pdf banao' },
    { name: 'Split PDF', href: 'split-pdf.html', cat: 'PDF Tools', keys: 'split pdf extract pages ranges pdf toro alag karo' },
    { name: 'Password Strength Checker', href: 'password-strength-checker.html', cat: 'Security Tools', keys: 'password strength checker crack time password mazboot check karo' },
    { name: 'Hash Generator', href: 'hash-generator.html', cat: 'Security Tools', keys: 'hash generator sha256 sha512 checksum code hash banao' },
    { name: 'Card Validator', href: 'card-validator.html', cat: 'Security Tools', keys: 'card validator luhn check demo card check karo' },
    { name: 'Profit Margin Calculator', href: 'profit-margin-calculator.html', cat: 'Business Tools', keys: 'profit margin calculator markup pricing munafa hisaab' },
    { name: 'Freelance Rate Calculator', href: 'freelance-rate-calculator.html', cat: 'Business Tools', keys: 'freelance rate calculator hourly day rate mazdoori rate hisaab' },
    { name: 'Break-Even Calculator', href: 'break-even-calculator.html', cat: 'Business Tools', keys: 'break even calculator units revenue kharcha munafa barabar hisaab' },
    { name: 'Business Name Generator', href: 'business-name-generator.html', cat: 'Business Tools', keys: 'business name generator startup brand ideas dukaan naam banao' },
    { name: 'Stopwatch', href: 'stopwatch.html', cat: 'Everyday Tools', keys: 'stopwatch timer laps online ghari waqt napo' },
    { name: 'Coin Flip', href: 'coin-flip.html', cat: 'Everyday Tools', keys: 'coin flip heads tails random toss sikka uchalo faisla' },
    { name: 'Random Number Generator', href: 'random-number-generator.html', cat: 'Everyday Tools', keys: 'random number generator rng unique lottery number qismat nikaalo' },
    { name: 'Device Info', href: 'device-info.html', cat: 'Everyday Tools', keys: 'device info browser screen os specs mobile maloomat dekho' },
    { name: 'Income Tax Calculator', href: 'income-tax-calculator-pakistan.html', cat: 'Pakistan Utilities', keys: 'income tax calculator pakistan salary fbr slab fy 2026-27 monthly yearly tankha tax fbr hisaab' },
    { name: 'Electricity Bill Calculator', href: 'electricity-bill-calculator.html', cat: 'Pakistan Utilities', keys: 'electricity bill calculator pakistan lesco units slab estimate protected unprotected bijli bill wapda hisaab' },
    { name: 'PTA Tax Calculator', href: 'pta-tax-calculator.html', cat: 'Pakistan Utilities', keys: 'pta tax calculator mobile phone dirbs passport cnic import duty registration mobile tax pta hisaab' },
    { name: 'Gold Rate Calculator', href: 'gold-rate-calculator.html', cat: 'Pakistan Utilities', keys: 'gold rate calculator pakistan tola gram ratti sona price value converter sona rate tola hisaab' },
    { name: 'CNIC Photo Maker', href: 'cnic-photo-maker.html', cat: 'Pakistan Utilities', keys: 'cnic photo maker passport photo 35x45mm picture crop resize download cnic tasveer shanakhti photo' },
    { name: 'Roman Urdu → Urdu', href: 'roman-urdu-to-urdu.html', cat: 'Pakistan Utilities', keys: 'roman urdu to urdu converter script transliteration translate urdu likho tabdeel karo' },
    { name: 'Prayer Times', href: 'prayer-times.html', cat: 'Islamic Tools', keys: 'prayer times namaz salah timing karachi lahore islamabad peshawar quetta namaz time auqat dekho' },
    { name: 'Qibla Direction', href: 'qibla-direction.html', cat: 'Islamic Tools', keys: 'qibla direction finder compass mecca makkah kaaba direction qibla rukh dekho' },
    { name: 'Tasbeeh Counter', href: 'tasbeeh-counter.html', cat: 'Islamic Tools', keys: 'tasbeeh counter dhikr tasbih digital counter allahumma tasbeeh ginna zikr karo' },
    { name: 'Hijri Converter', href: 'hijri-converter.html', cat: 'Islamic Tools', keys: 'hijri calendar converter islamic date gregorian to hijri lunar date hijri tarikh chand tabdeel' },
    { name: 'Zakat Calculator', href: 'zakat-calculator.html', cat: 'Islamic Tools', keys: 'zakat calculator 2.5 percent nisab gold silver cash wealth zakat hisaab nikaalo' },
    { name: 'AI Image Generator', href: 'ai-image-generator.html', cat: 'AI Tools', keys: 'ai image generator text to image photo banao tasveer ai se' },
    { name: 'AI Logo Maker', href: 'ai-logo-maker.html', cat: 'AI Tools', keys: 'ai logo maker brand business logo design banao' },
    { name: 'AI Thumbnail Maker', href: 'ai-thumbnail-maker.html', cat: 'AI Tools', keys: 'ai thumbnail maker youtube video thumbnail banao' },
    { name: 'AI Wallpaper Generator', href: 'ai-wallpaper-generator.html', cat: 'AI Tools', keys: 'ai wallpaper generator hd background tasveer banao' },
    { name: 'AI Story Writer', href: 'ai-story-writer.html', cat: 'AI Tools', keys: 'ai story writer kahani likho story generate' },
    { name: 'AI Caption Generator', href: 'ai-caption-generator.html', cat: 'AI Tools', keys: 'ai caption generator instagram tiktok caption hashtag likho' },
    { name: 'AI Name Generator', href: 'ai-name-generator.html', cat: 'AI Tools', keys: 'ai name generator brand baby channel naam ideas banao' },
    { name: 'AI Poetry Generator', href: 'ai-poetry-generator.html', cat: 'AI Tools', keys: 'ai poetry generator poem poems verse' },
    { name: 'AI Business Idea Generator', href: 'ai-business-idea-generator.html', cat: 'AI Tools', keys: 'ai business idea generator startup karobar ideas plan banao' },
    { name: 'AI Interview Questions', href: 'ai-interview-questions.html', cat: 'AI Tools', keys: 'ai interview questions job sawal jawab tayyari' },
    { name: 'AI Text Summarizer', href: 'ai-text-summarizer.html', cat: 'AI Tools', keys: 'ai text summarizer khulasa summarize karo' },
    { name: 'AI Translator', href: 'ai-translator.html', cat: 'AI Tools', keys: 'ai translator tarjuma translate english urdu' },
    { name: 'AI Chat', href: 'ai-chat.html', cat: 'AI Tools', keys: 'ai chat assistant chatbot sawal jawab' },
    { name: 'AI Paraphraser', href: 'ai-paraphraser.html', cat: 'AI Tools', keys: 'ai paraphraser rewrite rephrase dobara likho' },
    { name: 'Text to Speech Studio', href: 'text-to-speech-studio.html', cat: 'AI Tools', keys: 'text to speech studio voice suno awaz banao tts' },
    { name: 'Resume Builder', href: 'resume-builder.html', cat: 'Resume Tools', keys: 'resume builder cv maker curriculum vitae create online cv banao naukri resume' },
    { name: 'ATS Resume Checker', href: 'ats-resume-checker.html', cat: 'Resume Tools', keys: 'ats resume checker score applicant tracking system cv screening ats score check cv' },
    { name: 'Cover Letter Generator', href: 'cover-letter-generator.html', cat: 'Resume Tools', keys: 'cover letter generator job application letter write application cover letter banao job application' },
    { name: 'Resume Templates', href: 'resume-templates.html', cat: 'Resume Tools', keys: 'resume templates cv layout design modern professional cv template design' },
    { name: 'Video to GIF', href: 'video-to-gif.html', cat: 'Video Tools', keys: 'video to gif converter mp4 clip animation maker video se gif banao' },
    { name: 'Video Metadata Viewer', href: 'video-metadata-viewer.html', cat: 'Video Tools', keys: 'video metadata viewer info duration resolution fps bitrate format video details maloom karo' },
    { name: 'YouTube Timestamp Link', href: 'video-timestamp-link.html', cat: 'Video Tools', keys: 'youtube timestamp link generator share start time embed chapters youtube link time share' },
    { name: 'Voice Recorder', href: 'voice-recorder.html', cat: 'Audio Tools', keys: 'voice recorder record audio microphone awaz record karo mic se' },
    { name: 'Audio Trimmer', href: 'audio-trimmer.html', cat: 'Audio Tools', keys: 'audio trimmer cutter mp3 wav cut trim audio trim karo kato mp3' },
    { name: 'Metronome', href: 'metronome.html', cat: 'Audio Tools', keys: 'metronome bpm tempo tap beats music metronome bpm taal tempo' },
    { name: 'Fancy Text Generator', href: 'fancy-text-generator.html', cat: 'Font Tools', keys: 'fancy text generator stylish fonts unicode instagram whatsapp stylish text font banao instagram' },
    { name: 'Font Pairing', href: 'font-pairing.html', cat: 'Font Tools', keys: 'font pairing google fonts combination heading body typography font jori heading body design' },
    { name: 'Text Art Generator', href: 'text-art-generator.html', cat: 'Font Tools', keys: 'text art generator ascii banner figlet ascii art banner text banao' },
    { name: 'Meme Maker', href: 'meme-maker.html', cat: 'Meme Tools', keys: 'meme maker create funny memes caption generator download png meme banao tasveer funny caption' },
    { name: 'Meme Templates', href: 'meme-templates.html', cat: 'Meme Tools', keys: 'meme templates gallery classic formats drake distracted boyfriend meme template gallery funny tasweer format' },
    { name: 'Flight Duration Calculator', href: 'flight-duration-calculator.html', cat: 'Travel Tools', keys: 'flight duration calculator flight time distance airports arrival time zone flight time duration maloom karo hawai safar' },
    { name: 'Packing Checklist', href: 'packing-checklist.html', cat: 'Travel Tools', keys: 'packing checklist travel packing list luggage generator safar saman list packing checklist tayyari' },
    { name: 'Travel Budget Planner', href: 'travel-budget-planner.html', cat: 'Travel Tools', keys: 'travel budget planner trip cost estimator expense breakdown safar kharcha budget plan paisa hisab' },
    { name: 'Plot Area Converter', href: 'plot-area-converter.html', cat: 'Real Estate Tools', keys: 'plot area converter marla kanal acre square feet gaz plot zameen marla kanal acre tabdeel' },
    { name: 'Plot Price Calculator', href: 'plot-price-calculator.html', cat: 'Real Estate Tools', keys: 'plot price calculator per marla kanal rate cost plot keemat hisab qeemat marla' },
    { name: 'Stamp Duty Calculator', href: 'stamp-duty-calculator.html', cat: 'Real Estate Tools', keys: 'stamp duty calculator punjab property transfer tax cvt registration stamp duty registry kharcha tax punjab' },
    { name: 'Rent vs Buy Calculator', href: 'rent-vs-buy-calculator.html', cat: 'Real Estate Tools', keys: 'rent vs buy calculator home purchase mortgage kiraya kharid ghar faisla rent' },
    { name: 'Wedding Budget Planner', href: 'wedding-budget-planner.html', cat: 'Wedding Tools', keys: 'wedding budget planner shaadi cost breakdown shadi budget kharcha shaadi' },
    { name: 'Wedding Expense Splitter', href: 'wedding-expense-splitter.html', cat: 'Wedding Tools', keys: 'wedding expense splitter share settle who owes shadi kharcha taqseem hisab settle' },
    { name: 'Guest List Manager', href: 'guest-list-manager.html', cat: 'Wedding Tools', keys: 'guest list manager shaadi rsvp mehndi barat walima shadi mehman fehrist rsvp' },
    { name: 'Wedding Countdown', href: 'wedding-countdown.html', cat: 'Wedding Tools', keys: 'wedding countdown timer days shaadi date shadi countdown din shaadi' },
    { name: 'Net Run Rate Calculator', href: 'net-run-rate-calculator.html', cat: 'Sports Tools', keys: 'net run rate calculator nrr cricket tournament icc net run rate nrr calculate karo cricket' },
    { name: 'Required Run Rate Calculator', href: 'required-run-rate-calculator.html', cat: 'Sports Tools', keys: 'required run rate calculator chase target cricket rrr required run rate kitna chahiye target chase' },
    { name: 'DLS Par Score Calculator', href: 'dls-par-score.html', cat: 'Sports Tools', keys: 'dls par score calculator duckworth lewis rain rule dls par score barish duckworth lewis' },
    { name: 'Points Table Maker', href: 'points-table-maker.html', cat: 'Sports Tools', keys: 'points table maker cricket league standings tournament table points table banao tournament league' },
    { name: 'Recipe Scaler', href: 'recipe-scaler.html', cat: 'Cooking Tools', keys: 'recipe scaler servings multiplier resize recipe recipe scale karo servings zyada kam' },
    { name: 'Cooking Unit Converter', href: 'cooking-unit-converter.html', cat: 'Cooking Tools', keys: 'cooking unit converter cups grams tablespoons kitchen conversion cup gram convert karo wazan' },
    { name: 'Ingredient Substitution', href: 'ingredient-substitution.html', cat: 'Cooking Tools', keys: 'ingredient substitution chart swaps egg buttermilk baking powder cheez ka badal substitute' },
    { name: 'Cooking Timer', href: 'cooking-timer.html', cat: 'Cooking Tools', keys: 'cooking timer multi timer kitchen alarm egg pasta khana pakane ka timer anda' },
  ];

  /* Expose registry for search.js (Google-style smart search) */
  window.SK_TOOLS = TOOLS;
  function toolByHref(href) {
    for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i].href === href) return TOOLS[i];
    return null;
  }

  /* ---------- 1. Mobile menu ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var sidebar = document.getElementById('sidebar');
  var scrim = null;

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    if (scrim && scrim.parentNode) scrim.parentNode.removeChild(scrim);
    scrim = null;
    document.body.style.overflow = '';
  }

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function () {
      var willOpen = !sidebar.classList.contains('open');
      sidebar.classList.toggle('open', willOpen);
      if (willOpen) {
        scrim = document.createElement('div');
        scrim.className = 'scrim';
        scrim.addEventListener('click', closeSidebar);
        document.body.appendChild(scrim);
        document.body.style.overflow = 'hidden';
      } else {
        closeSidebar();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSidebar();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeSidebar();
    });
  }

  /* ---------- 2. Live tool search ---------- */
  var searchInput = document.getElementById('siteSearch');

  if (searchInput) {
    var deb = null;
    searchInput.addEventListener('input', function () {
      clearTimeout(deb);
      deb = setTimeout(function () {
        var q = searchInput.value.trim().toLowerCase();
        document.querySelectorAll('.tool-card').forEach(function (card) {
          var name = ((card.getAttribute('data-name') || '') + ' ' + (card.getAttribute('data-roman') || '') + ' ' + (card.textContent || '')).toLowerCase();
          card.hidden = q !== '' && name.indexOf(q) === -1;
        });
        document.querySelectorAll('.subcat').forEach(function (h) {
          var grid = h.nextElementSibling;
          var visible = grid ? grid.querySelectorAll('.tool-card:not([hidden])').length : 1;
          h.hidden = q !== '' && visible === 0;
        });
        document.querySelectorAll('.cat-section').forEach(function (section) {
          var visible = section.querySelectorAll('.tool-card:not([hidden])').length;
          section.hidden = q !== '' && visible === 0;
        });
      }, 120);
    });
  }

  /* ---------- 3. Scroll reveal ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- 4. Card tilt + glare (CSS vars, desktop only) ---------- */
  if (HOVERABLE && !REDUCED) {
    document.querySelectorAll('.tool-card.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * 11).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-py * 11).toFixed(2) + 'deg');
        card.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- 5. Button ripple (delegated) ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.btn') : null;
    if (!btn) return;
    var r = btn.getBoundingClientRect();
    var size = Math.max(r.width, r.height);
    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 600);
  });

  /* ---------- 6. Global SK helpers ---------- */
  /* Moved to js/helpers.js (loaded in <head>) so tool scripts can use
     skNum / SK at parse time. main.js no longer defines them. */

  /* ---------- 7. Dark mode (iOS-style switch) ----------
     Switch ON  (checked, knob right) = Light / white screen
     Switch OFF (unchecked, knob left) = Dark  / black screen  */
  var themeSwitches = document.querySelectorAll('.themeToggle, #themeToggle');
  var themeLabel = document.getElementById('themeLabel');
  function currentTheme() {
    /* Site ALWAYS starts light (owner rule) — never restore a saved dark
       theme on load. The toggle still works within the visit. */
    try { localStorage.removeItem('sk_theme_v2'); } catch (e) {}
    return 'light';
  }
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    themeSwitches.forEach(function (s) { s.checked = (t === 'light'); });
    if (themeLabel) themeLabel.textContent = (t === 'light') ? 'Light' : 'Dark';
  }
  applyTheme(currentTheme());
  themeSwitches.forEach(function (sw) {
    sw.addEventListener('change', function () {
      applyTheme(sw.checked ? 'light' : 'dark');
    });
  });

  /* ---------- 7b. Sidebar category tool counts ----------
     True per-category totals (audited from category pages). */
  (function () {
    try {
      var COUNTS = {
        'ai tools': 15, 'image tools': 3, 'text tools': 4, 'calculators': 5,
        'converters': 2, 'generators': 4, 'developer tools': 6, 'color tools': 2,
        'date & time': 2, 'social media': 2, 'fun tools': 2, 'seo tools': 4,
        'finance tools': 4, 'health tools': 4, 'pdf tools': 3, 'writing tools': 4,
        'marketing tools': 4, 'education tools': 4, 'security tools': 3,
        'business tools': 4, 'everyday tools': 4, 'pakistan utilities': 6,
        'islamic tools': 5, 'resume tools': 4, 'video tools': 3, 'audio tools': 3,
        'font tools': 3, 'meme tools': 2, 'travel tools': 3, 'real estate tools': 4,
        'wedding tools': 4, 'sports tools': 4, 'cooking tools': 4
      };
      document.querySelectorAll('.side-link').forEach(function (a) {
        if (a.querySelector('.side-count')) return;
        var label = (a.textContent || '').toLowerCase().trim();
        var n = COUNTS[label] || 0;
        if (n) {
          var s = document.createElement('span');
          s.className = 'side-count';
          s.textContent = n;
          a.appendChild(s);
        }
      });
    } catch (e) {}
  })();

  /* ---------- 8. Spotlight grid tracking (Gemini) ---------- */
  if (HOVERABLE && !REDUCED) {
    document.querySelectorAll('.cards-grid, .tool-grid').forEach(function (grid) {
      grid.addEventListener('mousemove', function (e) {
        var r = grid.getBoundingClientRect();
        grid.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        grid.style.setProperty('--my', (e.clientY - r.top) + 'px');
        grid.classList.add('spotlight-on');
      });
      grid.addEventListener('mouseleave', function () {
        grid.classList.remove('spotlight-on');
      });
    });
  }

  /* ---------- 9. Magnetic buttons (ChatGPT) ---------- */
  if (HOVERABLE && !REDUCED) {
    document.querySelectorAll('.btn.magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var pull = Math.min(5, dist / 12);
        btn.style.transform = 'translate(' + (dx / dist * pull).toFixed(1) + 'px,' + (dy / dist * pull).toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- 10. Command palette (ChatGPT) ---------- */
  var paletteBuilt = false, palOverlay, palInput, palList, palItems = [], palActive = -1;

  function buildPalette() {
    if (paletteBuilt) return;
    paletteBuilt = true;
    palOverlay = document.createElement('div');
    palOverlay.className = 'cmd-overlay';
    palOverlay.innerHTML =
      '<div class="cmd-palette" role="dialog" aria-label="Quick tool search">' +
      '<input class="cmd-input" id="cmdInput" type="text" placeholder="Type a tool name…" autocomplete="off">' +
      '<div class="cmd-list" id="cmdList"></div>' +
      '<div class="cmd-hint"><kbd>↑</kbd><kbd>↓</kbd> navigate &nbsp; <kbd>↵</kbd> open &nbsp; <kbd>esc</kbd> close</div>' +
      '</div>';
    document.body.appendChild(palOverlay);
    palInput = palOverlay.querySelector('#cmdInput');
    palList = palOverlay.querySelector('#cmdList');

    palInput.addEventListener('input', renderPalette);
    palInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); movePal(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); movePal(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); openPal(); }
      else if (e.key === 'Escape') { closePalette(); }
    });
    palOverlay.addEventListener('click', function (e) {
      if (e.target === palOverlay) closePalette();
    });
    renderPalette();
  }

  function renderPalette() {
    var q = (palInput.value || '').trim().toLowerCase();
    palItems = TOOLS.filter(function (t) {
      return !q || t.name.toLowerCase().indexOf(q) !== -1 || t.keys.indexOf(q) !== -1 || t.cat.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 9);
    palActive = palItems.length ? 0 : -1;
    palList.innerHTML = palItems.map(function (t, i) {
      return '<div class="cmd-item' + (i === palActive ? ' active' : '') + '" data-i="' + i + '">' +
        '<span>' + t.name + '</span><span class="cmd-cat">' + t.cat + '</span></div>';
    }).join('') || '<div class="cmd-item"><span>No tools found</span></div>';
    palList.querySelectorAll('.cmd-item[data-i]').forEach(function (el) {
      el.addEventListener('click', function () {
        palActive = parseInt(el.getAttribute('data-i'), 10);
        openPal();
      });
    });
  }

  function movePal(d) {
    if (!palItems.length) return;
    palActive = (palActive + d + palItems.length) % palItems.length;
    palList.querySelectorAll('.cmd-item').forEach(function (el, i) {
      el.classList.toggle('active', i === palActive);
    });
    var active = palList.querySelectorAll('.cmd-item')[palActive];
    if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
  }

  function openPal() {
    if (palActive >= 0 && palItems[palActive]) {
      window.location.href = palItems[palActive].href;
    }
  }

  function openPalette() {
    buildPalette();
    palOverlay.classList.add('open');
    palInput.value = '';
    renderPalette();
    setTimeout(function () { palInput.focus(); }, 30);
  }
  function closePalette() {
    if (palOverlay) palOverlay.classList.remove('open');
  }

  document.addEventListener('keydown', function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    var typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      if (palOverlay && palOverlay.classList.contains('open')) { e.preventDefault(); closePalette(); return; }
      /* Header search bar removed: Ctrl+K now focuses the hero search
         (homepage only). Elsewhere: do nothing, never error. */
      var hero = document.getElementById('smartPasteInput');
      if (hero) { e.preventDefault(); hero.focus(); hero.scrollIntoView({ block: 'center' }); }
    } else if (e.key === '/' && !typing) {
      e.preventDefault();
      openPalette();
    } else if (e.key === 'Escape' && palOverlay && palOverlay.classList.contains('open')) {
      closePalette();
    }
  });

  /* ---------- 11. Favorites + recently used ---------- */
  function lsGet(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  var favs = lsGet('sk_favs', []);

  // Inject favorite buttons into cards on index/category pages
  document.querySelectorAll('.tool-card').forEach(function (card) {
    var href = card.getAttribute('href');
    if (!href) return;
    var btn = document.createElement('button');
    btn.className = 'fav-btn' + (favs.indexOf(href) !== -1 ? ' faved' : '');
    btn.setAttribute('aria-label', 'Toggle favorite');
    btn.setAttribute('title', 'Save to favorites');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var i = favs.indexOf(href);
      if (i === -1) { favs.push(href); btn.classList.add('faved'); SK.toast('Added to favorites'); }
      else { favs.splice(i, 1); btn.classList.remove('faved'); SK.toast('Removed from favorites'); }
      lsSet('sk_favs', favs);
      renderFavSection();
    });
    card.appendChild(btn);
  });

  // Track tool page visits as "recently used"
  (function trackRecent() {
    var path = (window.location.pathname.split('/').pop() || 'index.html');
    if (path === '' ) path = 'index.html';
    var tool = toolByHref(path);
    if (!tool) return;
    var recent = lsGet('sk_recent', []).filter(function (h) { return h !== path; });
    recent.unshift(path);
    lsSet('sk_recent', recent.slice(0, 6));
  })();

  function cardHTML(tool) {
    return '<a class="tool-card tilt" href="' + tool.href + '">' +
      '<h3>' + tool.name + '</h3><p>' + tool.cat + '</p></a>';
  }

  function renderFavSection() {
    var wrap = document.getElementById('favSection');
    if (!wrap) return;
    var items = favs.map(toolByHref).filter(Boolean);
    wrap.hidden = items.length === 0;
    var grid = wrap.querySelector('.cards-grid');
    if (grid) grid.innerHTML = items.map(cardHTML).join('');
  }

  function renderRecentSection() {
    var wrap = document.getElementById('recentSection');
    if (!wrap) return;
    var recent = lsGet('sk_recent', []).map(toolByHref).filter(Boolean).slice(0, 4);
    wrap.hidden = recent.length === 0;
    var grid = wrap.querySelector('.cards-grid');
    if (grid) grid.innerHTML = recent.map(cardHTML).join('');
  }

  renderFavSection();
  renderRecentSection();

  /* ---------- 13. Hero 3D stage parallax (V4) ----------
     Mouse steers the floating card constellation (desktop only). */
  if (HOVERABLE && !REDUCED) {
    var stage = document.getElementById('stageInner');
    var heroEl = document.querySelector('.hero');
    if (stage && heroEl) {
      heroEl.addEventListener('mousemove', function (e) {
        var r = heroEl.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        stage.style.setProperty('--sry', (px * 14).toFixed(2) + 'deg');
        stage.style.setProperty('--srx', (-py * 10).toFixed(2) + 'deg');
      });
      heroEl.addEventListener('mouseleave', function () {
        stage.style.setProperty('--srx', '0deg');
        stage.style.setProperty('--sry', '0deg');
      });
    }
  }
})();

/* ---------- Dynamic copyright year ---------- */
(function () {
  'use strict';
  var y = new Date().getFullYear();
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = '© ' + y;
  });
})();

/* ---------- CapCut-style toggle pills ---------- */
(function () {
  'use strict';
  document.querySelectorAll('.cc-toggle-pills').forEach(function (wrap) {
    wrap.querySelectorAll('.cc-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        wrap.querySelectorAll('.cc-pill').forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        if (pill.dataset.goto) { window.location.href = pill.dataset.goto; }
      });
    });
  });
})();


