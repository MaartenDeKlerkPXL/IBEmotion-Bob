'use strict';

/* ─── LOADER ─── */
(function initLoader() {
  var loader = document.getElementById('loader');
  var bar = document.getElementById('loaderBar');
  var text = document.getElementById('loaderText');
  if (!loader || !bar) return;
  var progress = 0;
  var messages = ['LOADING', 'BUILDING', 'RENDERING', 'READY'];
  var interval = setInterval(function() {
    progress += Math.random() * 18 + 4;
    if (progress > 100) progress = 100;
    bar.style.width = progress + '%';
    var msgIdx = Math.floor((progress / 100) * (messages.length - 1));
    if (text) text.textContent = messages[msgIdx];
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(function() {
        loader.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        loader.style.opacity = '0';
        loader.style.transform = 'translateY(-20px)';
        setTimeout(function() {
          loader.style.display = 'none';
          startHeroAnimations();
        }, 600);
      }, 300);
    }
  }, 60);
})();

function startHeroAnimations() {
  var els = [
    { id: 'heroEye', delay: 100 },
    { id: 'htLine1', delay: 300 },
    { id: 'htLine2', delay: 500 },
    { id: 'heroSub', delay: 700 },
    { id: 'heroActions', delay: 900 }
  ];
  els.forEach(function(item) {
    setTimeout(function() {
      var el = document.getElementById(item.id);
      if (el) el.classList.add('visible');
    }, item.delay);
  });
}

/* ─── CURSOR ─── */
(function initCursor() {
  var ring = document.getElementById('cursorRing');
  var dot = document.getElementById('cursorDot');
  if (!ring || !dot) return;
  var rx = 0, ry = 0, dx = 0, dy = 0, visible = false;
  document.addEventListener('mousemove', function(e) {
    dx = e.clientX; dy = e.clientY;
    dot.style.left = dx + 'px'; dot.style.top = dy + 'px';
    if (!visible) { visible = true; ring.style.opacity = '1'; dot.style.opacity = '1'; }
  });
  document.addEventListener('mouseleave', function() { ring.style.opacity='0'; dot.style.opacity='0'; visible=false; });
  (function anim() {
    rx += (dx - rx) * 0.12; ry += (dy - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(anim);
  })();
  document.querySelectorAll('a,button,.dienst-card,.werk-item,.tool-tag,.prijs-card').forEach(function(el) {
    el.addEventListener('mouseenter', function() { ring.classList.add('hovered'); });
    el.addEventListener('mouseleave', function() { ring.classList.remove('hovered'); });
  });
  document.addEventListener('mousedown', function() { ring.classList.add('clicking'); });
  document.addEventListener('mouseup', function() { ring.classList.remove('clicking'); });
})();

/* ─── NAV ─── */
(function initNav() {
  var navbar = document.getElementById('navbar');
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (!navbar) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }, { passive: true });
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }
})();

/* ─── THREE.JS HERO PARTICLE WAVE ─── */
(function initHero3D() {
  var canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0A0A0A, 1);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 28);

  var redL = new THREE.PointLight(0xD42B2B, 4, 60);
  redL.position.set(0, 10, 20);
  scene.add(redL);
  scene.add(new THREE.PointLight(0x8B0000, 2, 40, 0).position.set(-15, -8, 10));
  var pl2 = new THREE.PointLight(0x8B0000, 2, 40);
  pl2.position.set(-15, -8, 10);
  scene.add(pl2);
  scene.add(new THREE.AmbientLight(0x0A0A0A, 0.5));

  var COLS = 75, ROWS = 45, COUNT = COLS * ROWS, SPACING = 0.65;
  var positions = new Float32Array(COUNT * 3);
  var k = 0;
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      positions[k*3] = (c - COLS/2) * SPACING;
      positions[k*3+1] = 0;
      positions[k*3+2] = (r - ROWS/2) * SPACING;
      k++;
    }
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  var mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0,0) },
      uRed: { value: new THREE.Color(0xD42B2B) },
      uDeep: { value: new THREE.Color(0x8B0000) },
      uDim: { value: new THREE.Color(0x1A0808) }
    },
    vertexShader: [
      'uniform float uTime; uniform vec2 uMouse;',
      'varying float vH; varying float vD;',
      'void main(){',
      '  float nx=position.x*0.12+uTime*0.3;',
      '  float nz=position.z*0.12+uTime*0.18;',
      '  float w=sin(nx)*cos(nz)*2.2+sin(nx*1.7+uTime*0.5)*1.1+cos(nz*2.1-uTime*0.4)*0.7;',
      '  float dx=position.x-uMouse.x*14.0;',
      '  float dz=position.z-uMouse.y*9.0;',
      '  float d=sqrt(dx*dx+dz*dz);',
      '  float mi=exp(-d*0.08)*3.0;',
      '  float y=w+mi; vH=(y+3.5)/7.0; vD=d;',
      '  gl_Position=projectionMatrix*modelViewMatrix*vec4(position.x,y,position.z,1.0);',
      '  gl_PointSize=clamp(2.5-d*0.03,0.5,2.5);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uRed; uniform vec3 uDeep; uniform vec3 uDim;',
      'varying float vH; varying float vD;',
      'void main(){',
      '  vec2 uv=gl_PointCoord-0.5; float r=length(uv);',
      '  if(r>0.5) discard;',
      '  float a=smoothstep(0.5,0.1,r);',
      '  vec3 c=mix(uDim,uDeep,vH);',
      '  c=mix(c,uRed,clamp((vH-0.5)*2.0,0.0,1.0));',
      '  float g=exp(-vD*0.05)*0.5; c+=uRed*g;',
      '  gl_FragColor=vec4(c,a*clamp(0.3+vH*0.7,0.1,1.0));',
      '}'
    ].join('\n'),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  });

  var pts = new THREE.Points(geo, mat);
  pts.rotation.x = -0.35;
  scene.add(pts);

  var mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', function(e) {
    mouse.x = (e.clientX/window.innerWidth)*2-1;
    mouse.y = -((e.clientY/window.innerHeight)*2-1);
  }, { passive: true });

  var camX = 0, camY = 0;
  var clock = new THREE.Clock();
  (function anim() {
    requestAnimationFrame(anim);
    var t = clock.getElapsedTime();
    mat.uniforms.uTime.value = t;
    mat.uniforms.uMouse.value.set(mouse.x, mouse.y);
    var p = geo.attributes.position.array;
    for (var ri = 0; ri < ROWS; ri++) {
      for (var ci = 0; ci < COLS; ci++) {
        var pi = ri*COLS+ci;
        var px = p[pi*3], pz = p[pi*3+2];
        var nx = px*0.12+t*0.3, nz = pz*0.12+t*0.18;
        var w = Math.sin(nx)*Math.cos(nz)*2.2+Math.sin(nx*1.7+t*0.5)*1.1+Math.cos(nz*2.1-t*0.4)*0.7;
        var mdx = px - mouse.x*14, mdz = pz - mouse.y*9;
        var md = Math.sqrt(mdx*mdx+mdz*mdz);
        p[pi*3+1] = w + Math.exp(-md*0.08)*3.0;
      }
    }
    geo.attributes.position.needsUpdate = true;
    camX += (mouse.x*1.5 - camX)*0.03;
    camY += (mouse.y*0.8 - camY)*0.03;
    camera.position.x = camX; camera.position.y = 2 + camY;
    redL.intensity = 3.5 + Math.sin(t*2.1)*0.5 + Math.sin(t*5.7)*0.2;
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });
})();

/* ─── THREE.JS OVER SPHERE ─── */
(function initOver3D() {
  var canvas = document.getElementById('overCanvas');
  if (!canvas || typeof THREE === 'undefined') return;
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(canvas.clientWidth || 500, canvas.clientHeight || 500);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 4.5;

  var rl = new THREE.PointLight(0xD42B2B, 3.5, 20); rl.position.set(3, 2, 3); scene.add(rl);
  scene.add(new THREE.PointLight(0x8B0000, 1.5, 15));
  scene.add(new THREE.AmbientLight(0x141414, 1));

  var sGeo = new THREE.IcosahedronGeometry(1.2, 4);
  var sMat = new THREE.MeshPhongMaterial({ color:0x1A0808, shininess:80, specular:0xD42B2B, transparent:true, opacity:0.9 });
  var sphere = new THREE.Mesh(sGeo, sMat); scene.add(sphere);
  var wire = new THREE.Mesh(sGeo.clone(), new THREE.MeshBasicMaterial({ color:0xD42B2B, wireframe:true, transparent:true, opacity:0.14 }));
  scene.add(wire);

  var pCount = 600, pGeo = new THREE.BufferGeometry(), pPos = new Float32Array(pCount*3);
  for (var i = 0; i < pCount; i++) {
    var th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1), rad = 1.6+Math.random()*0.8;
    pPos[i*3]=rad*Math.sin(ph)*Math.cos(th); pPos[i*3+1]=rad*Math.sin(ph)*Math.sin(th); pPos[i*3+2]=rad*Math.cos(ph);
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color:0xD42B2B, size:0.025, transparent:true, opacity:0.6, blending:THREE.AdditiveBlending })));

  var mouse = { x:0, y:0 };
  var wrap = canvas.closest('.over-visual-wrap');
  if (wrap) wrap.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX-rect.left)/rect.width)*2-1;
    mouse.y = -((e.clientY-rect.top)/rect.height)*2+1;
  });

  var clock = new THREE.Clock();
  (function anim() {
    requestAnimationFrame(anim);
    var t = clock.getElapsedTime();
    sphere.rotation.y = t*0.25+mouse.x*0.5; sphere.rotation.x = mouse.y*0.3+Math.sin(t*0.3)*0.1;
    wire.rotation.y = t*0.3-mouse.x*0.3; wire.rotation.x = sphere.rotation.x;
    rl.position.x = Math.sin(t*0.8)*4; rl.position.y = Math.cos(t*0.6)*3;
    renderer.render(scene, camera);
  })();
})();

/* ─── QUOTE CANVAS ─── */
(function initQuote3D() {
  var canvas = document.getElementById('quoteCanvas');
  if (!canvas || typeof THREE === 'undefined') return;
  var parent = canvas.parentElement;
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(parent.offsetWidth, parent.offsetHeight);
  renderer.setClearColor(0x141414, 1);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, parent.offsetWidth/parent.offsetHeight, 0.1, 100);
  camera.position.z = 20;
  var cnt = 2000, geo = new THREE.BufferGeometry(), pos = new Float32Array(cnt*3);
  for (var i = 0; i < cnt; i++) {
    pos[i*3]=(Math.random()-0.5)*60; pos[i*3+1]=(Math.random()-0.5)*40; pos[i*3+2]=(Math.random()-0.5)*20;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color:0xD42B2B, size:0.06, transparent:true, opacity:0.5, blending:THREE.AdditiveBlending })));
  var clock = new THREE.Clock();
  (function anim() {
    requestAnimationFrame(anim);
    var t = clock.getElapsedTime();
    scene.rotation.y = t*0.04; scene.rotation.x = Math.sin(t*0.02)*0.08;
    renderer.render(scene, camera);
  })();
  window.addEventListener('resize', function() {
    var W = parent.offsetWidth, H = parent.offsetHeight;
    camera.aspect = W/H; camera.updateProjectionMatrix(); renderer.setSize(W, H);
  }, { passive: true });
})();

/* ─── CTA CANVAS ─── */
(function initCta3D() {
  var canvas = document.getElementById('ctaCanvas');
  if (!canvas || typeof THREE === 'undefined') return;
  var parent = canvas.parentElement;
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(parent.offsetWidth, parent.offsetHeight);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, parent.offsetWidth/parent.offsetHeight, 0.1, 100);
  camera.position.z = 15;
  var COLS = 40, ROWS = 20, cnt = COLS*ROWS;
  var geo = new THREE.BufferGeometry(), pos = new Float32Array(cnt*3);
  var i2 = 0;
  for (var row = 0; row < ROWS; row++) for (var col = 0; col < COLS; col++) {
    pos[i2*3]=(col-COLS/2)*0.7; pos[i2*3+1]=0; pos[i2*3+2]=(row-ROWS/2)*0.7; i2++;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var pts = new THREE.Points(geo, new THREE.PointsMaterial({ color:0xF7F6F2, size:0.05, transparent:true, opacity:0.5, blending:THREE.AdditiveBlending }));
  pts.rotation.x = -0.3; scene.add(pts);
  var clock = new THREE.Clock();
  (function anim() {
    requestAnimationFrame(anim);
    var t = clock.getElapsedTime();
    var p = geo.attributes.position.array;
    for (var r2 = 0; r2 < ROWS; r2++) for (var c2 = 0; c2 < COLS; c2++) {
      var idx = r2*COLS+c2;
      p[idx*3+1] = Math.sin(p[idx*3]*0.3+t*0.8)*Math.cos(p[idx*3+2]*0.3+t*0.5)*1.5;
    }
    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  })();
})();

/* ─── WERK CANVASES ─── */
(function initWerk3D() {
  var canvases = document.querySelectorAll('.wi-canvas');
  if (!canvases.length || typeof THREE === 'undefined') return;
  var palettes = [
    [0xD42B2B, 0x1A0808], [0xD42B2B, 0x0A0A0A],
    [0xE83030, 0x1A0000], [0x8B0000, 0x0A0808]
  ];
  canvases.forEach(function(canvas, idx) {
    var parent = canvas.parentElement;
    var pal = palettes[idx % palettes.length];
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
    renderer.setSize(parent.offsetWidth || 400, parent.offsetHeight || 300);
    renderer.setClearColor(pal[1], 1);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, (parent.offsetWidth||400)/(parent.offsetHeight||300), 0.1, 100);
    camera.position.z = 8;
    var rl = new THREE.PointLight(pal[0], 3, 20); rl.position.set(2,2,4); scene.add(rl);
    scene.add(new THREE.AmbientLight(pal[1], 0.5));
    var cnt = 600, geo = new THREE.BufferGeometry(), pos = new Float32Array(cnt*3);
    for (var i = 0; i < cnt; i++) {
      pos[i*3]=(i%30-15)*0.4; pos[i*3+1]=(Math.floor(i/30)-10)*0.4; pos[i*3+2]=0;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color:pal[0], size:0.06, transparent:true, opacity:0.7, blending:THREE.AdditiveBlending })));
    var clock = new THREE.Clock();
    var offset = idx*1.3;
    (function anim() {
      requestAnimationFrame(anim);
      var t = clock.getElapsedTime()+offset;
      var p = geo.attributes.position.array;
      for (var r = 0; r < 20; r++) for (var c = 0; c < 30; c++) {
        var pi = r*30+c;
        p[pi*3+2] = Math.sin(p[pi*3]*0.5+t*0.8)*Math.cos(p[pi*3+1]*0.5+t*0.6)*1.5;
      }
      geo.attributes.position.needsUpdate = true;
      rl.position.x=Math.sin(t*0.7)*4; rl.position.y=Math.cos(t*0.5)*3;
      renderer.render(scene, camera);
    })();
    new ResizeObserver(function() {
      var nW = parent.offsetWidth, nH = parent.offsetHeight;
      if (nW && nH) { camera.aspect=nW/nH; camera.updateProjectionMatrix(); renderer.setSize(nW, nH); }
    }).observe(parent);
  });
})();

/* ─── SCROLL REVEAL ─── */
(function initReveal() {
  var els = document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right');
  if (!els.length) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var d = parseInt(el.getAttribute('data-delay')||'0', 10);
      setTimeout(function() { el.classList.add('visible'); }, d);
      obs.unobserve(el);
    });
  }, { threshold: 0.12 });
  els.forEach(function(el) { obs.observe(el); });
})();

/* ─── COUNTERS ─── */
(function initCounters() {
  var els = document.querySelectorAll('.ostat-num');
  if (!els.length) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var target = parseInt(el.getAttribute('data-target')||'0', 10);
      var start = performance.now();
      (function tick(now) {
        var p = Math.min((now-start)/1400, 1);
        var val = Math.round((1-Math.pow(1-p,3))*target);
        el.textContent = val;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target + (target===100 ? '%' : '+');
      })(performance.now());
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(function(el) { obs.observe(el); });
})();

/* ─── PARALLAX QUOTE ─── */
(function() {
  var lines = document.querySelectorAll('.pq-line');
  if (!lines.length) return;
  window.addEventListener('scroll', function() {
    var section = document.querySelector('.parallax-quote');
    if (!section) return;
    var rect = section.getBoundingClientRect();
    var vh = window.innerHeight;
    if (rect.bottom < 0 || rect.top > vh) return;
    var progress = (vh - rect.top) / (vh + rect.height);
    lines.forEach(function(line) {
      var speed = parseFloat(line.getAttribute('data-speed')||'0');
      line.style.transform = 'translateY(' + (progress - 0.5) * speed * 300 + 'px)';
    });
  }, { passive: true });
})();

/* ─── FORM ─── */
(function initForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;
  var submitBtn = document.getElementById('submitBtn');
  function showErr(id) { var el=document.getElementById(id); if(el) el.classList.add('show'); }
  function clearErr(id) { var el=document.getElementById(id); if(el) el.classList.remove('show'); }
  form.querySelectorAll('input,textarea').forEach(function(inp) {
    inp.addEventListener('input', function() { clearErr(inp.id+'Err'); });
  });
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var valid = true;
    var naam = document.getElementById('naam');
    var email = document.getElementById('email');
    var bericht = document.getElementById('bericht');
    clearErr('naamErr'); clearErr('emailErr'); clearErr('berichtErr');
    if (!naam||!naam.value.trim()) { showErr('naamErr'); valid=false; }
    if (!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showErr('emailErr'); valid=false; }
    if (!bericht||!bericht.value.trim()) { showErr('berichtErr'); valid=false; }
    if (!valid) return;
    if (submitBtn) {
      submitBtn.disabled = true;
      var btnText = submitBtn.querySelector('.btn-text');
      var btnSuccess = submitBtn.querySelector('.btn-success');
      var btnArrow = submitBtn.querySelector('.btn-arrow');
      if (btnText) btnText.classList.add('hidden');
      if (btnArrow) btnArrow.classList.add('hidden');
      if (btnSuccess) btnSuccess.classList.remove('hidden');
      submitBtn.style.background = '#1A1A1A';
      submitBtn.style.borderColor = 'rgba(212,43,43,0.4)';
      submitBtn.style.color = '#D42B2B';
    }
    form.reset();
  });
})();

/* ─── SMOOTH SCROLL ─── */
document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    var href = link.getAttribute('href');
    if (!href || href === '#') return;
    var target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
  });
});

/* ─── CARD TILT ─── */
document.querySelectorAll('.dienst-card').forEach(function(card) {
  card.addEventListener('mousemove', function(e) {
    var rect = card.getBoundingClientRect();
    var cx = rect.width/2, cy = rect.height/2;
    var rotX = (e.clientY-rect.top-cy)/cy*-4;
    var rotY = (e.clientX-rect.left-cx)/cx*4;
    card.style.transition = 'transform 0.08s, background 0.4s';
    card.style.transform = 'perspective(600px) rotateX('+rotX+'deg) rotateY('+rotY+'deg) translateZ(4px)';
  });
  card.addEventListener('mouseleave', function() {
    card.style.transition = 'transform 0.5s ease, background 0.4s';
    card.style.transform = '';
  });
});
