/* ============================================================
   IBE MOTION STUDIO — SHARED ENGINE
   Vanilla JS · IIFE modules · Three.js r128 helpers
   ============================================================ */
(function () {
  "use strict";

  var IS_EN = window.location.pathname.indexOf("/EN/") !== -1;
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var TOUCH = window.matchMedia && window.matchMedia("(hover:none),(pointer:coarse)").matches;

  function isMobile() { return window.innerWidth < 768; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function $(s, c) { return (c || document).querySelector(s); }
  function $all(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* expose namespace early */
  var IBE = window.IBE = window.IBE || {};
  IBE.isMobile = isMobile;
  IBE.isEN = IS_EN;

  /* ----------------------------------------------------------
     CUSTOM CURSOR
     ---------------------------------------------------------- */
  (function cursor() {
    if (TOUCH) return;
    var ring = $("#cursor-ring"), dot = $("#cursor-dot");
    if (!ring || !dot) return;

    var word = IS_EN ? "VIEW PROJECT · " : "BEKIJK PROJECT · ";
    var label = document.createElement("div");
    label.className = "cursor-label";
    label.innerHTML =
      '<svg viewBox="0 0 100 100" aria-hidden="true"><defs>' +
      '<path id="ibe-cpath" d="M50,50 m-33,0 a33,33 0 1,1 66,0 a33,33 0 1,1 -66,0"/></defs>' +
      '<text><textPath href="#ibe-cpath" startOffset="0">' + word + word + "</textPath></text></svg>";
    ring.appendChild(label);

    var rx = window.innerWidth / 2, ry = window.innerHeight / 2;
    var tx = rx, ty = ry, on = false;

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = "translate(" + tx + "px," + ty + "px) translate(-50%,-50%)";
      if (!on) { on = true; document.body.classList.add("cursor-on"); }
    }, { passive: true });

    window.addEventListener("mousedown", function () { document.body.classList.add("cursor-down"); });
    window.addEventListener("mouseup", function () { document.body.classList.remove("cursor-down"); });
    window.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-on"); on = false; });

    function frame() {
      rx = lerp(rx, tx, 0.16); ry = lerp(ry, ty, 0.16);
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    function bind() {
      $all('a,button,.btn,input,select,textarea,[data-cursor],.pf-card,.svc-card,.feat,label')
        .forEach(function (el) {
          var view = el.getAttribute("data-cursor") === "view";
          el.addEventListener("mouseenter", function () {
            document.body.classList.add("cursor-hover");
            if (view) document.body.classList.add("cursor-view");
          });
          el.addEventListener("mouseleave", function () {
            document.body.classList.remove("cursor-hover");
            document.body.classList.remove("cursor-view");
          });
        });
    }
    bind();
    IBE._rebindCursor = bind;
  })();

  /* ----------------------------------------------------------
     LOADER
     ---------------------------------------------------------- */
  (function loader() {
    var el = $("#loader");
    if (!el) return;
    var bar = $(".loader-bar", el), count = $(".loader-count b", el);
    var p = 0, done = false;

    function tick() {
      if (done) return;
      p += Math.random() * 9 + 3;
      if (p > 92) p = 92;
      if (bar) bar.style.width = p + "%";
      if (count) count.textContent = Math.floor(p);
      setTimeout(tick, 130 + Math.random() * 120);
    }
    tick();

    function finish() {
      done = true; p = 100;
      if (bar) bar.style.width = "100%";
      if (count) count.textContent = "100";
      setTimeout(function () {
        el.classList.add("done");
        document.body.classList.add("loaded");
        window.dispatchEvent(new CustomEvent("ibe:loaded"));
      }, 360);
    }
    if (document.readyState === "complete") setTimeout(finish, 650);
    else window.addEventListener("load", function () { setTimeout(finish, 550); });
    /* safety */
    setTimeout(function () { if (!done) finish(); }, 5200);
  })();

  /* ----------------------------------------------------------
     VIDEO SCROLL — scrub via scroll, alleen op index.html
     ---------------------------------------------------------- */
  (function vidScroll() {
    var wrap   = document.getElementById('vid-scroll');
    var vid    = document.getElementById('vid-scroll-el');
    var veil   = document.getElementById('vid-scroll-veil');
    var spacer = document.getElementById('vid-scroll-spacer');
    if (!wrap || !vid) return;

    /* Video staat altijd stil — alleen scroll stuurt playback */
    vid.pause();
    vid.currentTime = 0;

    /* Toon de video zodra ibe:loaded vuurt (na loader) */
    window.addEventListener('ibe:loaded', function () {
      wrap.classList.add('active');
      /* Zorg dat video geladen is zodat scrubbing werkt */
      vid.load();
      /* Scroll naar top voor het geval de pagina al gescrold was */
      window.scrollTo(0, 0);
    });

    var done = false;

    window.addEventListener('scroll', function () {
      if (done) return;
      if (!wrap.classList.contains('active')) return;

      var scrollY  = window.pageYOffset;
      var maxScroll = spacer ? spacer.offsetHeight - window.innerHeight : window.innerHeight * 2;
      if (maxScroll <= 0) maxScroll = window.innerHeight * 2;

      var progress = Math.max(0, Math.min(1, scrollY / maxScroll));

      /* Scrub video */
      if (vid.duration && isFinite(vid.duration)) {
        vid.currentTime = progress * vid.duration;
      }

      /* Veil fadet in bij laatste 30% van de scroll */
      var veilProgress = Math.max(0, (progress - 0.7) / 0.3);
      if (veil) veil.style.opacity = veilProgress.toFixed(3);

      /* Als scroll volledig — verberg video en ga naar site */
      if (progress >= 1) {
        done = true;
        wrap.classList.add('done');
        document.body.classList.add('vid-done');
        /* Scroll de gebruiker naar de echte pagina top */
        setTimeout(function () {
          window.scrollTo(0, 0);
          wrap.style.display = 'none';
        }, 520);
      }
    }, { passive: true });

    /* prefers-reduced-motion: sla video over */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      wrap.style.display = 'none';
      document.body.classList.add('vid-done');
    }
  })();

  /* ----------------------------------------------------------
     NAV — scroll state, scramble, hamburger, scroll-top
     ---------------------------------------------------------- */
  (function nav() {
    var bar = $("nav");
    var topBtn = $("#scroll-top");
    var ring = $("#scroll-ring-fill");
    function onScroll() {
      var y = window.pageYOffset;
      if (bar) bar.classList.toggle("scrolled", y > 40);
      if (topBtn) topBtn.classList.toggle("show", y > window.innerHeight * 0.8);
      if (ring) {
        var total = document.documentElement.scrollHeight - window.innerHeight;
        var progress = total > 0 ? y / total : 0;
        ring.style.strokeDashoffset = (156 - 156 * progress).toFixed(2);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (topBtn) topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: REDUCE ? "auto" : "smooth" });
    });

    /* hamburger */
    var burger = $(".hamburger"), menu = $(".mobile-menu");
    if (burger) {
      burger.addEventListener("click", function () {
        var open = document.body.classList.toggle("menu-open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      });
      if (menu) $all("a", menu).forEach(function (a) {
        a.addEventListener("click", function () {
          document.body.classList.remove("menu-open");
          burger.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }

    /* scramble */
    if (!REDUCE) {
      var CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/0123456789";
      $all(".nav-links > li > a").forEach(function (a) {
        var real = a.textContent, raf;
        a.addEventListener("mouseenter", function () {
          var it = 0, len = real.length;
          cancelAnimationFrame(raf);
          (function run() {
            a.textContent = real.split("").map(function (c, i) {
              if (c === " ") return " ";
              return i < it ? real[i] : CH[Math.floor(Math.random() * CH.length)];
            }).join("");
            it += 0.6;
            if (it < len) raf = requestAnimationFrame(run);
            else a.textContent = real;
          })();
        });
        a.addEventListener("mouseleave", function () { cancelAnimationFrame(raf); a.textContent = real; });
      });
    }
  })();

  /* ----------------------------------------------------------
     REVEAL — IntersectionObserver
     ---------------------------------------------------------- */
  (function reveal() {
    var els = $all(".rv,.rv-up,.rv-left,.rv-right,.mask").filter(function (e) {
      return !e.hasAttribute("data-hero");
    });
    if (!els.length) return;
    if (REDUCE || !("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var d = parseFloat(el.getAttribute("data-delay")) || 0;
        setTimeout(function () { el.classList.add("in"); }, d * 1000);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ----------------------------------------------------------
     HERO INTRO — staggered mask reveal after loader
     ---------------------------------------------------------- */
  (function heroIntro() {
    var hero = $(".hero");
    if (!hero) return;
    var lines = $all(".hero-headline .mask", hero);
    var sub = $(".hero-foot p", hero);
    var cta = $(".hero-cta-row", hero);
    function show(el) { if (el) el.classList.add("in"); }
    function play() {
      lines.forEach(function (l, i) { setTimeout(function () { show(l); }, i * 120); });
      setTimeout(function () { show(sub); }, 420);
      setTimeout(function () { show(cta); }, 580);
    }
    if (REDUCE) { lines.forEach(show); show(sub); show(cta); return; }
    if (document.body.classList.contains("loaded")) play();
    else window.addEventListener("ibe:loaded", play);
  })();

  /* ----------------------------------------------------------
     SCROLL CHOREOGRAPHY — zoom, breathe, parallax (single rAF)
     ---------------------------------------------------------- */
  (function choreography() {
    if (REDUCE) return;
    var zoom = $all(".zoom");
    var breath = $all("[data-breath]");
    var para = $all("[data-parallax]");
    if (!zoom.length && !breath.length && !para.length) return;
    var ticking = false;

    function update() {
      var vh = window.innerHeight;
      var i, r, el;
      for (i = 0; i < zoom.length; i++) {
        el = zoom[i]; r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        var zp = (vh - r.top) / (vh - vh * 0.45);
        el.style.setProperty("--zp", clamp(zp, 0, 1).toFixed(3));
      }
      for (i = 0; i < breath.length; i++) {
        el = breath[i]; r = el.getBoundingClientRect();
        var center = r.top + r.height / 2;
        var dist = Math.abs(center - vh / 2) / (vh / 2 + r.height / 2);
        el.style.setProperty("--breath", clamp(1 - dist, 0, 1).toFixed(3));
      }
      for (i = 0; i < para.length; i++) {
        el = para[i]; r = el.getBoundingClientRect();
        if (r.bottom < -300 || r.top > vh + 300) continue;
        var sp = parseFloat(el.getAttribute("data-parallax")) || 0.18;
        var off = ((r.top + r.height / 2) - vh / 2) * -sp;
        el.style.transform = "translate3d(0," + off.toFixed(1) + "px,0)";
      }
      ticking = false;
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req, { passive: true });
    window.addEventListener("ibe:loaded", update);
    update();
  })();

  /* ----------------------------------------------------------
     CARD 3D TILT
     ---------------------------------------------------------- */
  (function tilt() {
    if (TOUCH || REDUCE) return;
    $all("[data-tilt]").forEach(function (card) {
      var raf, trX = 0, trY = 0, cuX = 0, cuY = 0, active = false;
      function loop() {
        cuX = lerp(cuX, trX, 0.12); cuY = lerp(cuY, trY, 0.12);
        card.style.transform = "perspective(900px) rotateX(" + cuY.toFixed(2) + "deg) rotateY(" + cuX.toFixed(2) + "deg)";
        if (active || Math.abs(cuX - trX) > 0.01 || Math.abs(cuY - trY) > 0.01) raf = requestAnimationFrame(loop);
      }
      card.addEventListener("mouseenter", function () { active = true; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); });
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        trX = ((e.clientX - r.left) / r.width - 0.5) * 9;
        trY = -((e.clientY - r.top) / r.height - 0.5) * 9;
      });
      card.addEventListener("mouseleave", function () { active = false; trX = 0; trY = 0; });
    });
  })();

  /* ----------------------------------------------------------
     COUNTERS
     ---------------------------------------------------------- */
  (function counters() {
    var els = $all("[data-count]");
    if (!els.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var dur = 1600, t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = clamp((ts - t0) / dur, 0, 1);
        var e = 1 - Math.pow(1 - p, 3);
        var val = target * e;
        el.firstChild ? (el.childNodes[0].nodeValue = (target % 1 ? val.toFixed(1) : Math.floor(val)).toString())
                      : (el.textContent = Math.floor(val));
        if (p < 1) requestAnimationFrame(step);
        else el.childNodes[0].nodeValue = (target % 1 ? target.toFixed(1) : target).toString();
      }
      requestAnimationFrame(step);
    }
    if (REDUCE || !("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ----------------------------------------------------------
     BUTTON SHAKE ON CLICK
     ---------------------------------------------------------- */
  (function btnShake() {
    $all(".btn").forEach(function (b) {
      b.addEventListener("click", function () {
        b.classList.remove("shake");
        void b.offsetWidth;
        b.classList.add("shake");
        setTimeout(function () { b.classList.remove("shake"); }, 420);
      });
    });
  })();

  /* ----------------------------------------------------------
     AVAILABILITY INDICATOR (Europe/Amsterdam)
     ---------------------------------------------------------- */
  (function availability() {
    var dot = $(".avail-dot"), txt = $(".avail-text");
    if (!dot && !txt) return;
    function compute() {
      var now;
      try {
        now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Amsterdam" }));
      } catch (e) { now = new Date(); }
      var day = now.getDay(), h = now.getHours(), m = now.getMinutes();
      var mins = h * 60 + m;
      var weekday = day >= 1 && day <= 5;
      var open = mins >= 540 && mins <= 1050; /* 09:00–17:30 */
      var state, label;
      if (weekday && open) { state = "online"; label = IS_EN ? "Available now" : "Nu bereikbaar"; }
      else if (weekday) { state = "busy"; label = IS_EN ? "Back at 09:00" : "Terug om 09:00"; }
      else { state = "offline"; label = IS_EN ? "Open Mon–Fri" : "Open ma–vr"; }
      if (dot) { dot.classList.remove("online", "busy", "offline"); dot.classList.add(state); }
      if (txt) txt.textContent = label;
    }
    compute();
    setInterval(compute, 60000);
  })();

  /* ----------------------------------------------------------
     TOAST
     ---------------------------------------------------------- */
  window.IBE_toast = function (msg, type) {
    var wrap = $("#toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.id = "toast-wrap"; document.body.appendChild(wrap); }
    var t = document.createElement("div");
    t.className = "toast " + (type || "");
    t.setAttribute("role", "status");
    t.setAttribute("aria-live", "polite");
    var icon = type === "success"
      ? '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>'
      : type === "error"
      ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16.5" x2="12" y2="16.6"/></svg>'
      : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="12" y1="8" x2="12" y2="8.1"/></svg>';
    t.innerHTML = icon + '<span class="toast-msg">' + msg + "</span>";
    wrap.appendChild(t);
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add("show"); }); });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 520);
    }, 4200);
  };

  /* ----------------------------------------------------------
     afterLoad — Three.js guard
     ---------------------------------------------------------- */
  window.afterLoad = IBE.afterLoad = function (canvasId, fn) {
    var c = document.getElementById(canvasId);
    if (!c) return;
    function go() { if (typeof THREE !== "undefined") fn(c); }
    if (typeof THREE !== "undefined") go();
    else window.addEventListener("load", go);
  };

  /* ============================================================
     THREE.JS HELPERS
     ============================================================ */
  function makeRenderer(canvas, alpha) {
    var r = new THREE.WebGLRenderer({ canvas: canvas, antialias: !isMobile(), alpha: !!alpha, powerPreference: "high-performance" });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    return r;
  }
  function fit(renderer, camera, canvas) {
    var w = canvas.clientWidth || canvas.parentNode.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || canvas.parentNode.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  /* shared wave shaders */
  var WAVE_VERT =
    "uniform float uTime;uniform float uAmp;uniform vec2 uMouse;uniform float uPR;uniform float uSize;" +
    "varying float vH;" +
    "void main(){vec3 p=position;" +
    "float w=sin(p.x*0.42+uTime*0.85)*1.0+cos(p.z*0.40+uTime*0.70)*0.85+sin((p.x+p.z)*0.26+uTime*0.55)*0.55;" +
    "float d=distance(vec2(p.x,p.z),uMouse);w+=exp(-d*0.16)*2.4;" +
    "p.y=w*uAmp;vH=clamp(w*0.35+0.4,0.0,1.0);" +
    "vec4 mv=modelViewMatrix*vec4(p,1.0);" +
    "gl_PointSize=uPR*uSize*(1.6+vH*3.4)*(34.0/-mv.z);" +
    "gl_Position=projectionMatrix*mv;}";
  var WAVE_FRAG =
    "uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;varying float vH;" +
    "void main(){vec2 c=gl_PointCoord-0.5;float dd=dot(c,c);if(dd>0.25)discard;" +
    "float a=smoothstep(0.25,0.0,dd);" +
    "vec3 col=mix(uA,uB,smoothstep(0.0,0.6,vH));col=mix(col,uC,smoothstep(0.62,1.0,vH));" +
    "gl_FragColor=vec4(col,a*(0.5+vH*0.5));}";

  function hexColor(h) { return new THREE.Color(h); }

  /* HERO WAVE — interactive, scroll-damped */
  IBE.initHeroWave = function (canvas, opts) {
    opts = opts || {};
    var mob = isMobile();
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(62, 1, 0.1, 200);
    camera.position.set(0, 8.2, 15);
    camera.lookAt(0, -1, -4);
    var renderer = makeRenderer(canvas, true);
    fit(renderer, camera, canvas);

    var spanX = 46, spanZ = 38;
    var cols = mob ? 70 : 132, rows = mob ? 50 : 96;
    var n = cols * rows;
    var pos = new Float32Array(n * 3), k = 0;
    for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) {
      pos[k++] = (i / (cols - 1) - 0.5) * spanX;
      pos[k++] = 0;
      pos[k++] = (j / (rows - 1) - 0.5) * spanZ;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var uni = {
      uTime: { value: 0 }, uAmp: { value: 1.4 }, uMouse: { value: new THREE.Vector2(0, -40) },
      uPR: { value: renderer.getPixelRatio() }, uSize: { value: mob ? 1.0 : 1.0 },
      uA: { value: hexColor(opts.a || 0x8B0000) },
      uB: { value: hexColor(opts.b || 0xD42B2B) },
      uC: { value: hexColor(opts.c || 0xF7F6F2) }
    };
    var mat = new THREE.ShaderMaterial({
      uniforms: uni, vertexShader: WAVE_VERT, fragmentShader: WAVE_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    var pts = new THREE.Points(geo, mat);
    scene.add(pts);

    var mTX = 0, mTZ = -40, mX = 0, mZ = -40;
    if (!TOUCH) window.addEventListener("mousemove", function (e) {
      mTX = (e.clientX / window.innerWidth - 0.5) * spanX;
      mTZ = (e.clientY / window.innerHeight - 0.5) * spanZ * 0.7 - 6;
    }, { passive: true });

    var clock = new THREE.Clock();
    function render() {
      requestAnimationFrame(render);
      var t = clock.getElapsedTime();
      uni.uTime.value = t;
      mX = lerp(mX, mTX, 0.05); mZ = lerp(mZ, mTZ, 0.05);
      uni.uMouse.value.set(mX, mZ);
      var prog = clamp(window.pageYOffset / (window.innerHeight * 0.9), 0, 1);
      uni.uAmp.value = lerp(1.5, 0.25, prog);
      pts.rotation.y = Math.sin(t * 0.04) * 0.04;
      renderer.render(scene, camera);
    }
    render();
    window.addEventListener("resize", function () { fit(renderer, camera, canvas); uni.uPR.value = renderer.getPixelRatio(); }, { passive: true });
  };

  /* AMBIENT — drifting particle cloud (inner page heroes) */
  IBE.initAmbient = function (canvas, c1, c2, opts) {
    opts = opts || {};
    var mob = isMobile();
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120);
    camera.position.set(0, 0, 22);
    var renderer = makeRenderer(canvas, true);
    fit(renderer, camera, canvas);

    var group = new THREE.Group(); scene.add(group);
    function layer(count, color, size, spread, op) {
      var p = new Float32Array(count * 3);
      for (var i = 0; i < count; i++) {
        p[i * 3] = (Math.random() - 0.5) * spread;
        p[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6;
        p[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.7;
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(p, 3));
      var m = new THREE.PointsMaterial({ color: color, size: size, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false });
      var pt = new THREE.Points(g, m); group.add(pt); return pt;
    }
    var base = mob ? 0.55 : 1;
    layer(Math.floor(420 * base), c1 || 0xD42B2B, 0.13, 44, 0.6);
    layer(Math.floor(300 * base), c2 || 0x8B0000, 0.20, 50, 0.4);
    layer(Math.floor(180 * base), 0xF7F6F2, 0.06, 40, 0.5);

    var mx = 0, my = 0, tx = 0, ty = 0;
    if (!TOUCH) window.addEventListener("mousemove", function (e) {
      tx = (e.clientX / window.innerWidth - 0.5);
      ty = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    var clock = new THREE.Clock();
    function render() {
      requestAnimationFrame(render);
      var t = clock.getElapsedTime();
      mx = lerp(mx, tx, 0.04); my = lerp(my, ty, 0.04);
      group.rotation.y = t * 0.035 + mx * 0.5;
      group.rotation.x = my * 0.3;
      renderer.render(scene, camera);
    }
    render();
    window.addEventListener("resize", function () { fit(renderer, camera, canvas); }, { passive: true });
  };

  /* GRID CANVAS — wavy particle grid (portfolio cards + service media) */
  IBE.initGridCanvas = function (canvas, opts) {
    opts = opts || {};
    var mob = isMobile();
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 5.4, 11);
    camera.lookAt(0, 0, 0);
    var renderer = makeRenderer(canvas, true);
    fit(renderer, camera, canvas);

    var spanX = 26, spanZ = 22;
    var cols = mob ? 36 : 56, rows = mob ? 28 : 44, n = cols * rows;
    var pos = new Float32Array(n * 3), k = 0;
    for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) {
      pos[k++] = (i / (cols - 1) - 0.5) * spanX;
      pos[k++] = 0;
      pos[k++] = (j / (rows - 1) - 0.5) * spanZ;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var uni = {
      uTime: { value: Math.random() * 10 }, uAmp: { value: opts.amp || 1.05 },
      uMouse: { value: new THREE.Vector2(0, -30) }, uPR: { value: renderer.getPixelRatio() },
      uSize: { value: opts.size || 1.0 },
      uA: { value: hexColor(opts.a !== undefined ? opts.a : 0x8B0000) },
      uB: { value: hexColor(opts.b !== undefined ? opts.b : 0xD42B2B) },
      uC: { value: hexColor(opts.c !== undefined ? opts.c : 0xF7F6F2) }
    };
    var mat = new THREE.ShaderMaterial({ uniforms: uni, vertexShader: WAVE_VERT, fragmentShader: WAVE_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    var pts = new THREE.Points(geo, mat); scene.add(pts);

    var clock = new THREE.Clock();
    var spd = opts.speed || 1;
    function render() {
      requestAnimationFrame(render);
      uni.uTime.value = clock.getElapsedTime() * spd + 5;
      pts.rotation.y = Math.sin(uni.uTime.value * 0.06) * 0.16;
      renderer.render(scene, camera);
    }
    render();
    var ro;
    if ("ResizeObserver" in window) { ro = new ResizeObserver(function () { fit(renderer, camera, canvas); uni.uPR.value = renderer.getPixelRatio(); }); ro.observe(canvas); }
    else window.addEventListener("resize", function () { fit(renderer, camera, canvas); }, { passive: true });
  };

  /* MODAL WAVE — bigger, mouse-parallax, stoppable */
  IBE.initModalWave = function (canvas, opts) {
    opts = opts || {};
    var mob = isMobile();
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120);
    camera.position.set(0, 6.5, 13);
    camera.lookAt(0, 0, -2);
    var renderer = makeRenderer(canvas, true);
    fit(renderer, camera, canvas);

    var spanX = 40, spanZ = 30;
    var cols = mob ? 60 : 100, rows = mob ? 40 : 70, n = cols * rows;
    var pos = new Float32Array(n * 3), k = 0;
    for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) {
      pos[k++] = (i / (cols - 1) - 0.5) * spanX;
      pos[k++] = 0;
      pos[k++] = (j / (rows - 1) - 0.5) * spanZ;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var uni = {
      uTime: { value: 0 }, uAmp: { value: 1.25 }, uMouse: { value: new THREE.Vector2(0, -30) },
      uPR: { value: renderer.getPixelRatio() }, uSize: { value: 1.0 },
      uA: { value: hexColor(opts.a !== undefined ? opts.a : 0x8B0000) },
      uB: { value: hexColor(opts.b !== undefined ? opts.b : 0xD42B2B) },
      uC: { value: hexColor(opts.c !== undefined ? opts.c : 0xF7F6F2) }
    };
    var mat = new THREE.ShaderMaterial({ uniforms: uni, vertexShader: WAVE_VERT, fragmentShader: WAVE_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    var pts = new THREE.Points(geo, mat); scene.add(pts);

    var mTX = 0, mX = 0;
    function onMove(e) { mTX = (e.clientX / window.innerWidth - 0.5) * spanX; }
    if (!TOUCH) window.addEventListener("mousemove", onMove, { passive: true });

    var clock = new THREE.Clock(), running = true;
    function render() {
      if (!running) return;
      requestAnimationFrame(render);
      uni.uTime.value = clock.getElapsedTime();
      mX = lerp(mX, mTX, 0.05);
      uni.uMouse.value.set(mX, -20);
      pts.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.1;
      renderer.render(scene, camera);
    }
    function onResize() { fit(renderer, camera, canvas); uni.uPR.value = renderer.getPixelRatio(); }
    window.addEventListener("resize", onResize, { passive: true });
    render();

    return {
      resize: onResize,
      stop: function () {
        running = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("resize", onResize);
        geo.dispose(); mat.dispose(); renderer.dispose();
      }
    };
  };

  /* lazy init helper: run fn(canvas) when canvas scrolls into view */
  IBE.lazy = function (canvasId, fn) {
    var c = document.getElementById(canvasId);
    if (!c) return;
    function go() { if (typeof THREE !== "undefined") fn(c); }
    if (!("IntersectionObserver" in window)) { go(); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { io.disconnect(); go(); } });
    }, { threshold: 0.05 });
    io.observe(c.closest(".pf-card") || c.closest(".svc-media-frame") || c);
  };

})();
