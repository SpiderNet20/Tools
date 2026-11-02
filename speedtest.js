/*!
 * Internet Speed Test + وصف الدولة - information-net.com
 * ملف واحد كامل: أداة قياس السرعة + وصف وشركات الاتصالات لـ 22 دولة عربية حسب الزائر.
 *
 * الاستخدام (سطر واحد يكفي):
 *   <script src="https://cdn.jsdelivr.net/gh/SpiderNet20/Tools@main/speedtest/speedtest.js"></script>
 * اختياري لتحديد المكان:
 *   <div id="speedtest"></div>   (الأداة)
 *   <div id="ist-country"></div> (وصف الدولة، وإلا يُضاف تحت الأداة تلقائياً)
 * للتجربة: أضف ?country=SA إلى رابط الصفحة.
 * القياس الحقيقي عبر Cloudflare (speed.cloudflare.com) - مجاني بلا مفاتيح.
 */
(function () {
  "use strict";
  var BASE = "https://speed.cloudflare.com";
  var SITE = "https://www.information-net.com/tools/internet-speed-test/";

  // ---- تحديد مكان الأداة ----
  var script = document.currentScript;
  var host = document.getElementById("speedtest");
  if (!host) {
    host = document.createElement("div");
    if (script && script.parentNode) script.parentNode.insertBefore(host, script);
    else document.body.appendChild(host);
  }
  if (host.getAttribute("data-ist-ready")) return;
  host.setAttribute("data-ist-ready", "1");

  // طلب واحد لمعلومات الاتصال يخدم الأداة ووصف الدولة معاً
  var metaP = fetch(BASE + "/meta", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .catch(function () { return null; });

  // =====================================================================
  // الجزء الأول: أداة قياس السرعة
  // =====================================================================
  var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

  root.innerHTML =
    '<style>' +
    ':host{display:block}*{box-sizing:border-box}' +
    '.w{max-width:640px;margin:0 auto;font-family:Tahoma,Arial,sans-serif;background:#0f172a;color:#fff;border-radius:16px;padding:24px;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.25);direction:rtl}' +
    'h2{margin:0 0 6px;font-size:24px}.sub{margin:0 0 18px;color:#94a3b8;font-size:14px}' +
    '.sp{font-size:64px;font-weight:bold;line-height:1.1}.un{color:#94a3b8;margin-bottom:10px}' +
    '.ph{height:22px;color:#38bdf8;font-size:15px}' +
    '.bg{background:#1e293b;border-radius:8px;height:8px;margin:10px 0 20px;overflow:hidden}' +
    '.br{height:8px;width:0;background:linear-gradient(90deg,#38bdf8,#22c55e);transition:width .3s}' +
    '.g{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}' +
    '.c{flex:1 1 130px;background:#1e293b;border-radius:12px;padding:12px}' +
    '.c .l{color:#94a3b8;font-size:13px}.c .v{font-size:22px;font-weight:bold}.c .u{font-size:12px;color:#64748b}' +
    'button{margin-top:22px;background:#22c55e;color:#04230f;border:0;border-radius:30px;padding:14px 44px;font-size:18px;font-weight:bold;cursor:pointer;font-family:inherit}' +
    'button:disabled{opacity:.6;cursor:default}' +
    '.info{margin-top:16px;color:#94a3b8;font-size:13px}.note{margin:14px 0 0;color:#64748b;font-size:12px}' +
    'a{color:#38bdf8;text-decoration:none;font-size:12px}' +
    '</style>' +
    '<div class="w">' +
    '<h2>اختبار سرعة الإنترنت</h2>' +
    '<p class="sub">مجاني • بدون تسجيل • قياس حقيقي عبر شبكة Cloudflare</p>' +
    '<div class="sp" id="sp">0.0</div><div class="un">ميغابت/ثانية (Mbps)</div>' +
    '<div class="ph" id="ph">جاهز للبدء</div>' +
    '<div class="bg"><div class="br" id="br"></div></div>' +
    '<div class="g">' +
    '<div class="c"><div class="l">⬇ التحميل</div><div class="v" id="dl">--</div><div class="u">Mbps</div></div>' +
    '<div class="c"><div class="l">⬆ الرفع</div><div class="v" id="ul">--</div><div class="u">Mbps</div></div>' +
    '<div class="c"><div class="l">⏱ البينغ</div><div class="v" id="pg">--</div><div class="u">ms</div></div>' +
    '<div class="c"><div class="l">〰 التذبذب</div><div class="v" id="jt">--</div><div class="u">ms</div></div>' +
    '</div>' +
    '<button id="btn">ابدأ الاختبار</button>' +
    '<div class="info" id="info"></div>' +
    '<p class="note">النتائج تتأثر بعدد الأجهزة المتصلة والـ VPN والـ Wi-Fi. أغلق التحميلات الأخرى لأدق نتيجة.</p>' +
    '<p class="note"><a href="' + SITE + '" target="_blank" rel="noopener">أداة اختبار السرعة من information-net.com</a></p>' +
    '</div>';

  function $(id) { return root.querySelector("#" + id); }
  var running = false, ctrl = null;
  function setPhase(t, p) { $("ph").textContent = t; if (p != null) $("br").style.width = p + "%"; }
  function setSpeed(v) { $("sp").textContent = v.toFixed(1); }

  // ---- معلومات الاتصال ----
  metaP.then(function (m) {
    if (!m) return;
    var p = [];
    if (m.clientIp) p.push("IP: " + m.clientIp);
    if (m.asOrganization) p.push("المزود: " + m.asOrganization);
    var city = typeof m.colo === "string" ? m.colo : (m.colo && (m.colo.city || m.colo.iata)) || m.city;
    if (city) p.push("أقرب خادم: " + city);
    $("info").textContent = p.join(" • ");
  });

  // ---- البينغ ----
  async function testPing() {
    var times = [];
    for (var i = 0; i < 12; i++) {
      var t0 = performance.now();
      await fetch(BASE + "/__down?bytes=0&r=" + Math.random(), { cache: "no-store", signal: ctrl.signal });
      var dt = performance.now() - t0;
      if (i > 0) times.push(dt);
      setPhase("قياس زمن الاستجابة...", (i / 12) * 15);
    }
    var min = Math.min.apply(null, times), d = [];
    for (var j = 1; j < times.length; j++) d.push(Math.abs(times[j] - times[j - 1]));
    $("pg").textContent = min.toFixed(0);
    $("jt").textContent = (d.reduce(function (a, b) { return a + b; }, 0) / d.length).toFixed(1);
  }

  // ---- التحميل ----
  async function testDownload() {
    var DUR = 10000, WARM = 1500, N = 4;
    var start = performance.now(), total = 0, warmB = 0, warmT = 0, done = false, endT = 0;
    async function stream() {
      while (!done) {
        var res = await fetch(BASE + "/__down?bytes=50000000&r=" + Math.random(), { cache: "no-store", signal: ctrl.signal });
        var rd = res.body.getReader();
        while (!done) { var o = await rd.read(); if (o.done) break; total += o.value.length; }
        try { rd.cancel(); } catch (e) {}
      }
    }
    for (var i = 0; i < N; i++) stream().catch(function () {});
    await new Promise(function (resolve) {
      var iv = setInterval(function () {
        var el = performance.now() - start;
        if (!warmT && el >= WARM) { warmT = el; warmB = total; }
        if (warmT) setSpeed(((total - warmB) * 8) / ((el - warmT) / 1000) / 1e6);
        setPhase("قياس سرعة التحميل...", 15 + (el / DUR) * 45);
        if (el >= DUR) { endT = el; done = true; clearInterval(iv); resolve(); }
      }, 200);
    });
    var f = ((total - warmB) * 8) / ((endT - warmT) / 1000) / 1e6;
    $("dl").textContent = f.toFixed(1);
    setSpeed(f);
    try { ctrl.abort(); } catch (e) {}
    ctrl = new AbortController();
  }

  // ---- الرفع ----
  function testUpload() {
    return new Promise(function (resolve) {
      var DUR = 8000, WARM = 1500, N = 3;
      var chunk = new Uint8Array(1024 * 1024);
      for (var k = 0; k < chunk.length; k += 65536) crypto.getRandomValues(chunk.subarray(k, k + 65536));
      var blob = new Blob([chunk, chunk, chunk, chunk, chunk, chunk, chunk, chunk]);
      var start = performance.now(), L = [], warmB = 0, warmT = 0, done = false, xs = [];
      function tot() { return L.reduce(function (a, b) { return a + (b || 0); }, 0); }
      function send(i) {
        if (done) return;
        var x = new XMLHttpRequest(); xs.push(x);
        var base = L[i] || 0;
        x.open("POST", BASE + "/__up?r=" + Math.random());
        x.upload.onprogress = function (e) { L[i] = base + e.loaded; };
        x.onload = function () { L[i] = base + blob.size; send(i); };
        x.onerror = function () {};
        x.send(blob);
      }
      for (var i = 0; i < N; i++) { L[i] = 0; send(i); }
      var iv = setInterval(function () {
        var el = performance.now() - start;
        if (!warmT && el >= WARM) { warmT = el; warmB = tot(); }
        if (warmT) setSpeed(((tot() - warmB) * 8) / ((el - warmT) / 1000) / 1e6);
        setPhase("قياس سرعة الرفع...", 60 + (el / DUR) * 40);
        if (el >= DUR) {
          done = true; clearInterval(iv);
          var f = ((tot() - warmB) * 8) / ((el - warmT) / 1000) / 1e6;
          xs.forEach(function (x) { try { x.abort(); } catch (e) {} });
          $("ul").textContent = f.toFixed(1); setSpeed(f); resolve();
        }
      }, 200);
    });
  }

  $("btn").addEventListener("click", async function () {
    if (running) return;
    running = true;
    var b = $("btn"); b.disabled = true; b.textContent = "جارٍ الاختبار...";
    ["dl", "ul", "pg", "jt"].forEach(function (id) { $(id).textContent = "--"; });
    setSpeed(0);
    ctrl = new AbortController();
    try {
      await testPing(); await testDownload(); await testUpload();
      setPhase("اكتمل الاختبار ✓", 100);
    } catch (e) {
      setPhase("تعذّر الاختبار، أوقف الـ VPN/مانع الإعلانات وأعد المحاولة", 0);
    }
    running = false; b.disabled = false; b.textContent = "إعادة الاختبار";
  });

  // =====================================================================
  // الجزء الثاني: وصف الدولة حسب الزائر (22 دولة عربية)
  // =====================================================================
  // ---------------------------------------------------------------
  // بيانات الدول. n: الاسم | i: شركات الاتصالات | t: نوع الخدمات
  // l: ملاحظة محلية | k: كلمات دلالية يبحث عنها المستخدمون
  // أسماء الشركات قد تتغير مع الوقت، راجعها دورياً.
  // ---------------------------------------------------------------
  var D = {
    EG: { n: "مصر", i: ["المصرية للاتصالات (WE)", "فودافون مصر", "أورانج مصر", "اتصالات مصر (e&)"],
      t: "الإنترنت الأرضي (ADSL وVDSL والألياف الضوئية) وإنترنت الجوال 4G و5G",
      l: "يرتبط الإنترنت الأرضي في مصر بالسنترال القريب من منزلك وبجودة الخط الداخلي، فكلما بَعُد السنترال أو ضعف الخط انخفضت السرعة الفعلية عن الباقة.",
      k: ["سرعة النت في مصر", "شكوى بطء النت", "باقات الإنترنت الأرضي", "سرعة النت WE", "سنترال"] },
    SA: { n: "السعودية", i: ["STC", "موبايلي", "زين السعودية", "سلام"],
      t: "الألياف الضوئية للمنازل وإنترنت الجوال 4G و5G",
      l: "تنتشر باقات الألياف الضوئية في المدن الكبرى مثل الرياض وجدة والدمام، إلى جانب شبكات 5G، وتختلف السرعة الفعلية حسب الحي ونوع الباقة.",
      k: ["سرعة النت في السعودية", "سرعة الإنترنت STC", "سرعة موبايلي", "ألياف ضوئية", "بطء النت"] },
    AE: { n: "الإمارات", i: ["اتصالات (e&)", "دو (du)"],
      t: "الألياف الضوئية للمنازل وإنترنت الجوال 4G و5G",
      l: "تتوفر الألياف الضوئية على نطاق واسع في دبي وأبوظبي والشارقة، ويفيد الاختبار في التحقق من أن سرعة باقتك تصل فعلاً إلى جهازك عبر الواي فاي.",
      k: ["سرعة النت في الإمارات", "سرعة إنترنت اتصالات", "سرعة إنترنت دو", "باقات الإنترنت المنزلي", "سرعة الواي فاي"] },
    KW: { n: "الكويت", i: ["زين الكويت", "أوريدو الكويت", "STC الكويت"],
      t: "الإنترنت المنزلي عبر الألياف الضوئية وإنترنت الجوال 4G و5G",
      l: "تتنافس شركات الاتصالات في الكويت بباقات سريعة، وقد تختلف النتيجة بين الواي فاي والكابل بحسب قوة الإشارة داخل المنزل.",
      k: ["سرعة النت في الكويت", "سرعة إنترنت زين", "سرعة إنترنت أوريدو", "باقات الإنترنت المنزلي", "بطء النت"] },
    QA: { n: "قطر", i: ["أوريدو قطر", "فودافون قطر"],
      t: "الألياف الضوئية للمنازل وإنترنت الجوال 4G و5G",
      l: "تتميز قطر بانتشار الألياف الضوئية وشبكات 5G في الدوحة والمدن المحيطة، لذلك يهمك أن تتأكد أن راوترك لا يحدّ من سرعة باقتك.",
      k: ["سرعة النت في قطر", "سرعة إنترنت أوريدو", "سرعة إنترنت فودافون قطر", "ألياف ضوئية", "سرعة الواي فاي"] },
    BH: { n: "البحرين", i: ["بتلكو (beyon)", "زين البحرين", "STC البحرين"],
      t: "الإنترنت المنزلي عبر الألياف الضوئية وإنترنت الجوال 4G و5G",
      l: "تتوفر في البحرين عدة باقات منزلية وللجوال، ويُنصح بإجراء الاختبار في أوقات مختلفة لمعرفة أثر ازدحام الشبكة في المساء.",
      k: ["سرعة النت في البحرين", "سرعة إنترنت بتلكو", "سرعة إنترنت زين", "باقات الإنترنت", "بطء النت"] },
    OM: { n: "عُمان", i: ["عمانتل", "أوريدو عُمان", "فودافون عُمان"],
      t: "الإنترنت المنزلي (الألياف الضوئية) وإنترنت الجوال 4G و5G",
      l: "تتفاوت السرعة بين مسقط والمحافظات الأخرى حسب توفر الألياف الضوئية وقوة تغطية الجوال، فاختبر السرعة في المكان الذي تستخدم فيه الإنترنت فعلاً.",
      k: ["سرعة النت في عمان", "سرعة إنترنت عمانتل", "سرعة إنترنت أوريدو", "ألياف ضوئية", "فحص سرعة الانترنت"] },
    JO: { n: "الأردن", i: ["أورانج الأردن", "زين الأردن", "أمنية", "إنترنت الأردن (Orange Fiber)"],
      t: "الإنترنت الأرضي (ADSL وVDSL والألياف الضوئية) وإنترنت الجوال 4G و5G",
      l: "تتفاوت السرعة بين عمّان والمحافظات حسب توفر الألياف الضوئية وبُعد الخط عن السنترال، وقد تحتاج إلى اختبار بالكابل لمعرفة سرعة الخط الحقيقية.",
      k: ["سرعة النت في الأردن", "سرعة إنترنت أورانج", "سرعة إنترنت زين", "سرعة إنترنت أمنية", "بطء النت"] },
    IQ: { n: "العراق", i: ["زين العراق", "آسياسيل", "كورك", "إيرثلينك (Earthlink)"],
      t: "الإنترنت المنزلي (الألياف الضوئية والاتصال اللاسلكي) وإنترنت الجوال 4G",
      l: "تتنوع خيارات الإنترنت في العراق بين الألياف الضوئية والاتصال اللاسلكي وإنترنت الجوال، وتختلف جودتها من منطقة لأخرى، لذلك قارن نتيجتك بالباقة التي اشتركت فيها.",
      k: ["سرعة النت في العراق", "سرعة إنترنت زين العراق", "سرعة آسياسيل", "سرعة كورك", "بطء الانترنت"] },
    LB: { n: "لبنان", i: ["أوجيرو (Ogero)", "تاتش (Touch)", "ألفا (Alfa)", "IDM"],
      t: "الإنترنت المنزلي عبر الخطوط الأرضية والألياف الضوئية وإنترنت الجوال",
      l: "قد يتأثر استقرار الاتصال في لبنان بانقطاع الكهرباء وجودة الخط، فتأكد من تشغيل الراوتر على مصدر طاقة مستقر عند إجراء الاختبار.",
      k: ["سرعة النت في لبنان", "سرعة إنترنت أوجيرو", "سرعة إنترنت تاتش", "سرعة ألفا", "استقرار الاتصال"] },
    SY: { n: "سوريا", i: ["المؤسسة السورية للاتصالات", "سيريتل (SyriaTel)", "MTN سوريا"],
      t: "الإنترنت الأرضي (ADSL) وإنترنت الجوال 3G و4G",
      l: "تختلف جودة الاتصال في سوريا بحسب المنطقة وجودة الخطوط واستقرار الكهرباء، لذلك كرر الاختبار أكثر من مرة وخذ المتوسط.",
      k: ["سرعة النت في سوريا", "سرعة إنترنت سيريتل", "سرعة إنترنت ADSL", "بطء النت", "فحص سرعة الانترنت"] },
    PS: { n: "فلسطين", i: ["بالتل (Paltel)", "جوال (Jawwal)", "أوريدو فلسطين", "حضارة (Hadara)"],
      t: "الإنترنت الأرضي (ADSL والألياف الضوئية) وإنترنت الجوال",
      l: "تتنوع خدمات الإنترنت في فلسطين بين الخطوط الأرضية والألياف الضوئية وإنترنت الجوال حسب المنطقة، ويفيد الاختبار في مقارنة الخيارات المتاحة لك.",
      k: ["سرعة النت في فلسطين", "سرعة إنترنت بالتل", "سرعة إنترنت جوال", "سرعة أوريدو", "باقات الإنترنت"] },
    YE: { n: "اليمن", i: ["يمن نت (YemenNet)", "سبأفون (Sabafon)", "يمن موبايل", "واي (Y)"],
      t: "الإنترنت الأرضي وإنترنت الجوال 3G و4G",
      l: "تختلف جودة الاتصال في اليمن بين المدن والمناطق، لذلك جرّب الاختبار في أوقات متفرقة من اليوم لمعرفة أفضل وقت للتحميل والمكالمات.",
      k: ["سرعة النت في اليمن", "سرعة يمن نت", "سرعة سبأفون", "سرعة يمن موبايل", "بطء النت"] },
    LY: { n: "ليبيا", i: ["ليبيا للاتصالات والتقنية (LTT)", "ليبيانا", "المدار الجديد (Almadar)", "حاتف ليبيا"],
      t: "الإنترنت المنزلي (ADSL وWiMAX والألياف الضوئية) وإنترنت الجوال 3G و4G",
      l: "تختلف السرعة في ليبيا من مدينة لأخرى ومن مزود لآخر، ويساعدك الاختبار على معرفة الخدمة الأنسب لمنطقتك.",
      k: ["سرعة النت في ليبيا", "سرعة إنترنت ليبيانا", "سرعة المدار", "سرعة LTT", "فحص سرعة النت"] },
    DZ: { n: "الجزائر", i: ["اتصالات الجزائر (Algérie Télécom)", "موبيليس (Mobilis)", "جازي (Djezzy)", "أوريدو الجزائر"],
      t: "الإنترنت الأرضي (ADSL والألياف الضوئية FTTH) وإنترنت الجوال 4G",
      l: "يعتمد كثير من المنازل في الجزائر على ADSL أو الألياف الضوئية FTTH إلى جانب 4G، وتفيدك نتيجة الاختبار عند التواصل مع الشركة لشكوى ضعف التدفق.",
      k: ["سرعة النت في الجزائر", "تدفق الانترنت", "سرعة إنترنت اتصالات الجزائر", "سرعة موبيليس", "سرعة جازي"] },
    MA: { n: "المغرب", i: ["اتصالات المغرب (Maroc Telecom)", "أورانج المغرب", "إنوي (inwi)"],
      t: "الإنترنت الأرضي (ADSL والألياف الضوئية FTTH) وإنترنت الجوال 4G و5G",
      l: "تتوفر الألياف الضوئية FTTH في المدن الكبرى مثل الدار البيضاء والرباط ومراكش، وتختلف السرعة الفعلية بحسب العرض والحي.",
      k: ["سرعة النت في المغرب", "سرعة إنترنت اتصالات المغرب", "سرعة إنترنت أورانج", "سرعة إنوي", "تدفق الانترنت"] },
    TN: { n: "تونس", i: ["اتصالات تونس (Tunisie Telecom)", "أوريدو تونس", "أورنج تونس"],
      t: "الإنترنت الأرضي (ADSL والألياف الضوئية) وإنترنت الجوال 4G",
      l: "تتوفر في تونس باقات ADSL والألياف الضوئية وإنترنت الجوال، وتفيد النتيجة في مقارنة تدفق خطك بما تعاقدت عليه.",
      k: ["سرعة النت في تونس", "تدفق الانترنت", "سرعة إنترنت اتصالات تونس", "سرعة أوريدو", "سرعة أورنج"] },
    SD: { n: "السودان", i: ["زين السودان", "MTN السودان", "سوداني (Sudani)", "كنار (Canar)"],
      t: "إنترنت الجوال 3G و4G والإنترنت المنزلي في بعض المدن",
      l: "يعتمد كثيرون في السودان على إنترنت الجوال، وتتأثر السرعة بقوة التغطية في موقعك، لذلك اختبر السرعة في المكان الذي تستخدم فيه الإنترنت عادة.",
      k: ["سرعة النت في السودان", "سرعة إنترنت زين", "سرعة سوداني", "باقات الإنترنت", "بطء النت"] },
    SO: { n: "الصومال", i: ["هرمود (Hormuud)", "سوم تل (Somtel)", "تيليسوم (Telesom)", "نيشن لينك (NationLink)"],
      t: "إنترنت الجوال 3G و4G وخدمات الألياف الضوئية في بعض المدن",
      l: "ينتشر إنترنت الجوال بشكل واسع في الصومال إلى جانب خدمات الألياف الضوئية في بعض المدن، وتختلف السرعة بحسب الشركة والتغطية.",
      k: ["سرعة النت في الصومال", "سرعة هرمود", "سرعة سوم تل", "سرعة تيليسوم", "فحص سرعة الانترنت"] },
    DJ: { n: "جيبوتي", i: ["اتصالات جيبوتي (Djibouti Telecom)", "إيفوكوم"],
      t: "الإنترنت الأرضي وإنترنت الجوال 4G",
      l: "تُعد جيبوتي نقطة ربط مهمة للكابلات البحرية الدولية، وقد يختلف البينغ بحسب موقع الخادم الذي تتصل به.",
      k: ["سرعة النت في جيبوتي", "سرعة اتصالات جيبوتي", "البينغ", "باقات الإنترنت", "فحص سرعة النت"] },
    KM: { n: "جزر القمر", i: ["اتصالات القمر (Comores Telecom)", "هوري (HURI)", "تلما (Telma)"],
      t: "إنترنت الجوال 3G و4G والإنترنت المنزلي في بعض الجزر",
      l: "قد تختلف جودة الاتصال بين الجزر وبين المدن والمناطق الريفية، فاختبر السرعة في المكان الذي تستخدم فيه الإنترنت.",
      k: ["سرعة النت في جزر القمر", "سرعة اتصالات القمر", "سرعة تلما", "باقات الإنترنت", "بطء النت"] },
    MR: { n: "موريتانيا", i: ["موريتل (Mauritel)", "ماتل (Mattel)", "شنقيتل (Chinguitel)"],
      t: "الإنترنت الأرضي وإنترنت الجوال 3G و4G",
      l: "تختلف السرعة بين نواكشوط وبقية المدن بحسب التغطية والشركة، ويساعدك الاختبار على مقارنة جودة الخدمة بين المزودين.",
      k: ["سرعة النت في موريتانيا", "سرعة موريتل", "سرعة ماتل", "سرعة شنقيتل", "فحص سرعة الانترنت"] }
  };

  // احتياطي: تقدير الدولة من المنطقة الزمنية إذا تعذّر طلب Cloudflare
  var TZ = {
    "Africa/Cairo": "EG", "Asia/Riyadh": "SA", "Asia/Dubai": "AE", "Asia/Kuwait": "KW",
    "Asia/Qatar": "QA", "Asia/Bahrain": "BH", "Asia/Muscat": "OM", "Asia/Amman": "JO",
    "Asia/Baghdad": "IQ", "Asia/Beirut": "LB", "Asia/Damascus": "SY", "Asia/Gaza": "PS",
    "Asia/Hebron": "PS", "Asia/Aden": "YE", "Africa/Tripoli": "LY", "Africa/Algiers": "DZ",
    "Africa/Casablanca": "MA", "Africa/Tunis": "TN", "Africa/Khartoum": "SD",
    "Africa/Mogadishu": "SO", "Africa/Djibouti": "DJ", "Indian/Comoro": "KM",
    "Africa/Nouakchott": "MR"
  };

  // ---------------------------------------------------------------
  // أدوات مساعدة
  // ---------------------------------------------------------------
  function join(a) {
    if (a.length <= 1) return a.join("");
    return a.slice(0, -1).join("، ") + " و" + a[a.length - 1];
  }

  function el(tag, text, parent) {
    var e = document.createElement(tag);
    if (text) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  // يبني محتوى الدولة كقائمة كتل: [نوع, نص]
  function content(code) {
    var d = D[code], b = [];
    if (!d) {
      b.push(["h2", "اختبار سرعة الإنترنت في بلدك"]);
      b.push(["p", "تعمل الأداة مع جميع مزودي خدمة الإنترنت في أي دولة، سواء كنت تستخدم الإنترنت المنزلي أو إنترنت الجوال. اضغط زر الاختبار لتعرف سرعة التحميل والرفع والبينغ الفعلية، ثم قارنها بالباقة المكتوبة في فاتورتك."]);
      return b;
    }
    b.push(["h2", "اختبار سرعة النت في " + d.n]);
    b.push(["p", "أداة مجانية لفحص سرعة الانترنت في " + d.n + " تعمل مع جميع مزودي الخدمة، ومنهم " + join(d.i) + ". وتشمل " + d.t + ". اضغط زر الاختبار لتعرف سرعة التحميل والرفع والبينغ الفعلية."]);
    b.push(["p", d.l]);
    b.push(["h3", "قارن سرعتك بباقة مزودك في " + d.n]);
    b.push(["p", "سواء كنت مشتركاً مع " + d.i[0] + " أو " + d.i[1] + (d.i[2] ? " أو " + d.i[2] : "") + "، قارن نتيجة الاختبار بسرعة الباقة المكتوبة في فاتورتك. ويفيد هذا الاختبار كل من يبحث عن: " + join(d.k) + "."]);
    b.push(["h3", "نصائح لمستخدمي الإنترنت في " + d.n]);
    b.push(["li", "اختبر السرعة بكابل الشبكة مباشرة من الراوتر لتعرف سرعة الخط الحقيقية."]);
    b.push(["li", "جرّب الاختبار في أوقات مختلفة، فازدحام الشبكة مساءً قد يخفض السرعة."]);
    b.push(["li", "إذا كانت السرعة ضعيفة بالـ Wi-Fi فقط فالمشكلة غالباً في مكان الراوتر وليست في الخط."]);
    b.push(["li", "إذا استمر البطء، تواصل مع " + d.i[0] + " أو مزودك وأرسل له نتائج الاختبار في أوقات مختلفة."]);
    b.push(["h3", "هل تعمل الأداة مع " + d.i[0] + " و" + d.i[1] + "؟"]);
    b.push(["p", "نعم، الأداة تقيس اتصالك الفعلي أياً كان مزود الخدمة، سواء على الإنترنت المنزلي أو على بيانات الجوال."]);
    b.push(["h3", "لماذا تختلف سرعة النت في " + d.n + " عن الباقة؟"]);
    b.push(["p", "تتأثر السرعة بازدحام الشبكة وبعدد الأجهزة المتصلة وقوة إشارة الواي فاي وجودة الخط والراوتر. كرر الاختبار وخذ المتوسط قبل تقديم أي شكوى."]);
    return b;
  }

  // ---------------------------------------------------------------
  // العرض (تحت الأداة مباشرة، أو داخل #ist-country إن وُجد)
  // ---------------------------------------------------------------
  var box = document.getElementById("ist-country");
  if (!box) {
    box = document.createElement("div");
    box.id = "ist-country";
    box.setAttribute("dir", "rtl");
    box.style.cssText = "max-width:760px;margin:24px auto;line-height:1.9";
    if (host.parentNode) host.parentNode.insertBefore(box, host.nextSibling);
    else document.body.appendChild(box);
  }

  var current = null, manual = false, body = null, select = null;

  function build() {
    box.innerHTML = "";
    var bar = el("div", "", box);
    bar.style.cssText = "margin-bottom:12px;font-size:14px";
    el("label", "اختر دولتك: ", bar);
    select = el("select", "", bar);
    select.style.cssText = "padding:4px 8px;border-radius:6px";
    var o = el("option", "دولة أخرى", select); o.value = "";
    Object.keys(D).forEach(function (c) {
      var op = el("option", D[c].n, select); op.value = c;
    });
    select.addEventListener("change", function () {
      manual = true;
      draw(select.value);
    });
    body = el("div", "", box);
  }

  function draw(code) {
    current = code || "";
    if (select) select.value = D[current] ? current : "";
    body.innerHTML = "";
    var ul = null;
    content(current).forEach(function (blk) {
      if (blk[0] === "li") {
        if (!ul) ul = el("ul", "", body);
        el("li", blk[1], ul);
      } else {
        ul = null;
        el(blk[0], blk[1], body);
      }
    });
  }

  build();

  // 1) رابط التجربة ?country=SA
  var q = (location.search.match(/[?&]country=([A-Za-z]{2})/) || [])[1];
  if (q) { manual = true; draw(q.toUpperCase()); return; }

  // 2) عرض فوري بتقدير المنطقة الزمنية ثم التصحيح بنتيجة Cloudflare
  var tz = "";
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
  draw(TZ[tz] || "");

  metaP.then(function (m) {
    if (manual || !m || !m.country) return;
    var c = String(m.country).toUpperCase();
    if (c !== current) draw(c);
  });
})();
