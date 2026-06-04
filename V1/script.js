'use strict';

/* ─── LOADER ─── */
(function(){
  var el=document.getElementById('loader'),bar=document.getElementById('loader-bar'),txt=document.querySelector('.loader-txt');
  if(!el||!bar)return;
  var p=0,msgs=['LADEN','BOUWEN','RENDEREN','KLAAR'];
  var iv=setInterval(function(){
    p+=Math.random()*18+5;if(p>100)p=100;
    bar.style.width=p+'%';
    if(txt)txt.textContent=msgs[Math.min(Math.floor(p/100*(msgs.length-1)),msgs.length-1)];
    if(p>=100){clearInterval(iv);setTimeout(function(){
      el.style.transition='opacity .5s';el.style.opacity='0';
      setTimeout(function(){el.style.display='none';if(typeof window.afterLoad==='function')window.afterLoad();},500);
    },200);}
  },55);
})();

/* ─── CURSOR ─── */
(function(){
  var ring=document.getElementById('cur-ring'),dot=document.getElementById('cur-dot');
  if(!ring||!dot)return;
  var rx=0,ry=0,dx=0,dy=0;
  document.addEventListener('mousemove',function(e){
    dx=e.clientX;dy=e.clientY;
    dot.style.left=dx+'px';dot.style.top=dy+'px';
    ring.style.opacity='1';dot.style.opacity='1';
  });
  document.addEventListener('mouseleave',function(){ring.style.opacity='0';dot.style.opacity='0';});
  (function anim(){rx+=(dx-rx)*.12;ry+=(dy-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(anim);})();
  function addHover(sel){document.querySelectorAll(sel).forEach(function(el){
    el.addEventListener('mouseenter',function(){ring.classList.add('h');});
    el.addEventListener('mouseleave',function(){ring.classList.remove('h');});
  });}
  addHover('a,button,.card,.why-item,.dienst-img,.port-item,.calc-item,.ps,.modal-close');
  document.addEventListener('mousedown',function(){ring.classList.add('c');});
  document.addEventListener('mouseup',function(){ring.classList.remove('c');});
})();

/* ─── NAV SCROLL ─── */
(function(){
  var nav=document.getElementById('nav');
  if(!nav)return;
  window.addEventListener('scroll',function(){
    if(window.scrollY>40)nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  },{passive:true});
})();

/* ─── HAMBURGER ─── */
(function(){
  var btn=document.getElementById('ham'),menu=document.getElementById('mob-menu');
  if(!btn||!menu)return;
  btn.addEventListener('click',function(){btn.classList.toggle('open');menu.classList.toggle('open');});
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click',function(){btn.classList.remove('open');menu.classList.remove('open');});
  });
})();

/* ─── SMOOTH SCROLL ─── */
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click',function(e){
    var href=a.getAttribute('href');
    if(!href||href==='#')return;
    var t=document.querySelector(href);
    if(!t)return;
    e.preventDefault();
    window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-70,behavior:'smooth'});
  });
});

/* ─── COMBINED SCROLL REVEAL + COUNTERS ─── */
(function(){
  var els=document.querySelectorAll('.rv,[data-count]');
  if(!els.length)return;
  var ob=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting)return;
      var el=e.target,d=parseInt(el.dataset.delay||'0',10);
      if(el.classList.contains('rv')){setTimeout(function(){el.classList.add('in');},d);}
      if(el.dataset.count){
        var tgt=parseInt(el.dataset.count,10),suf=el.dataset.suffix||'',start=performance.now();
        (function tick(now){
          var p=Math.min((now-start)/1400,1),v=Math.round((1-Math.pow(1-p,3))*tgt);
          el.textContent=v+(p>=1?suf:'');
          if(p<1)requestAnimationFrame(tick);
        })(performance.now());
      }
      ob.unobserve(el);
    });
  },{threshold:.1});
  els.forEach(function(el){ob.observe(el);});
})();

/* ─── CARD TILT ─── */
document.querySelectorAll('.card,.why-item,.ps,.port-item').forEach(function(card){
  card.addEventListener('mousemove',function(e){
    var r=card.getBoundingClientRect();
    var cx=r.width/2,cy=r.height/2;
    var rx2=(e.clientY-r.top-cy)/cy*-3.5,ry2=(e.clientX-r.left-cx)/cx*3.5;
    card.style.transition='transform .08s';
    card.style.transform='perspective(700px) rotateX('+rx2+'deg) rotateY('+ry2+'deg) translateZ(3px)';
  });
  card.addEventListener('mouseleave',function(){
    card.style.transition='transform .5s var(--ease),background .4s,border-color .4s';
    card.style.transform='';
  });
});

/* ─── STATUS INDICATOR ─── */
(function(){
  var dot=document.getElementById('status-dot');
  var txt=document.getElementById('status-text');
  if(!dot||!txt)return;
  var now=new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Amsterdam'}));
  var day=now.getDay();
  var mins=now.getHours()*60+now.getMinutes();
  var isWeekday=day>=1&&day<=5;
  var inHours=mins>=540&&mins<1050;
  var almostOpen=isWeekday&&mins>=480&&mins<540;
  var almostClose=isWeekday&&mins>=1020&&mins<1050;
  if(isWeekday&&inHours){
    dot.classList.add('status-open');
    txt.textContent='Nu bereikbaar — Landgraaf, Limburg';
  } else if(almostOpen||almostClose){
    dot.classList.add('status-soon');
    txt.textContent=almostOpen?'Straks bereikbaar — opent om 09:00':'Sluit binnenkort — bereikbaar tot 17:30';
  } else {
    dot.classList.add('status-closed');
    txt.textContent='Motion Design Studio — Landgraaf';
  }
})();

/* ─── TOAST ─── */
function showToast(msg,isError){
  var t=document.createElement('div');
  t.className='toast'+(isError?' toast-error':' toast-success');
  t.textContent=msg;
  document.body.appendChild(t);
  requestAnimationFrame(function(){requestAnimationFrame(function(){t.classList.add('show');});});
  setTimeout(function(){
    t.classList.remove('show');
    setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},400);
  },4000);
}

/* ─── SCROLL TO TOP ─── */
(function(){
  var btn=document.getElementById('scroll-top');
  if(!btn)return;
  window.addEventListener('scroll',function(){
    if(window.scrollY>400)btn.classList.add('visible');
    else btn.classList.remove('visible');
  },{passive:true});
  btn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
})();

/* ─── FORM MEMORY ─── */
(function(){
  var hint=document.getElementById('form-memory-hint');
  var hasSaved=false;
  ['naam','email','bedrijf'].forEach(function(id){
    var el=document.getElementById(id);
    if(!el)return;
    var saved=localStorage.getItem('ibe_form_'+id);
    if(saved){el.value=saved;hasSaved=true;}
    el.addEventListener('input',function(){localStorage.setItem('ibe_form_'+id,el.value);});
  });
  if(hint&&hasSaved)hint.style.display='block';
})();

/* ─── FORMSPREE FORM ─── */
(function(){
  var form=document.getElementById('cform');
  if(!form)return;
  var btn=document.getElementById('sbtn');
  var FORMSPREE_ID='YOUR_FORMSPREE_ID';

  function se(id){var e=document.getElementById(id);if(e)e.classList.add('show');}
  function ce(id){var e=document.getElementById(id);if(e)e.classList.remove('show');}

  ['naam','email','bericht'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.addEventListener('input',function(){ce(id+'Err');});
  });

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var ok=true;
    var naam=document.getElementById('naam'),email=document.getElementById('email'),bericht=document.getElementById('bericht');
    ce('naamErr');ce('emailErr');ce('berichtErr');
    if(!naam||!naam.value.trim()){se('naamErr');ok=false;}
    if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){se('emailErr');ok=false;}
    if(!bericht||!bericht.value.trim()){se('berichtErr');ok=false;}
    if(!ok)return;

    var formData={
      naam:naam.value.trim(),
      email:email.value.trim(),
      bedrijf:(document.getElementById('bedrijf')||{}).value||'',
      dienst:(document.getElementById('dienst')||{}).value||'',
      bericht:bericht.value.trim()
    };

    if(btn){
      btn.disabled=true;
      var arrEl=btn.querySelector('.arr');
      if(arrEl)arrEl.style.opacity='.4';
      var btxt=btn.querySelector('.btn-t');
      if(btxt)btxt.textContent='Versturen...';
    }

    function doSuccess(){
      var t2=btn&&btn.querySelector('.btn-t'),s=btn&&btn.querySelector('.btn-s'),ar=btn&&btn.querySelector('.arr');
      if(t2)t2.classList.add('hidden');if(ar)ar.classList.add('hidden');if(s)s.classList.remove('hidden');
      if(btn)btn.style.cssText='background:#1A1A1A;border-color:rgba(34,197,94,.4);color:#22c55e;';
      form.reset();
      ['naam','email','bedrijf'].forEach(function(id){localStorage.removeItem('ibe_form_'+id);});
      showToast('Aanvraag verstuurd. Je hoort binnen één werkdag van me.');
    }

    if(FORMSPREE_ID==='YOUR_FORMSPREE_ID'){
      setTimeout(doSuccess,600);
      return;
    }

    fetch('https://formspree.io/f/'+FORMSPREE_ID,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(formData)
    }).then(function(r){return r.json();}).then(function(data){
      if(data.ok||data.next){doSuccess();}
      else{
        if(btn){btn.disabled=false;var bt=btn.querySelector('.btn-t');if(bt)bt.textContent='Verstuur aanvraag';}
        showToast('Er ging iets mis. Stuur een mail naar ibemotionmedia@gmail.com',true);
      }
    }).catch(function(){
      if(btn){btn.disabled=false;var bt=btn.querySelector('.btn-t');if(bt)bt.textContent='Verstuur aanvraag';}
      showToast('Geen verbinding. Probeer opnieuw of mail direct.',true);
    });
  });
})();

/* ─── CALCULATOR ─── */
(function(){
  var grid=document.getElementById('calc-grid');
  if(!grid)return;
  var daysOut=document.getElementById('calc-days-out');
  var servOut=document.getElementById('calc-services-out');
  var cta=document.getElementById('calc-cta');
  var selected=[];
  grid.querySelectorAll('.calc-item').forEach(function(btn){
    btn.addEventListener('click',function(){
      var dienst=btn.dataset.dienst,days=parseInt(btn.dataset.days,10);
      var idx=selected.findIndex(function(s){return s.name===dienst;});
      if(idx>-1){selected.splice(idx,1);btn.classList.remove('active');}
      else{selected.push({name:dienst,days:days});btn.classList.add('active');}
      updateCalc();
    });
  });
  function updateCalc(){
    if(!selected.length){
      daysOut.textContent='—';servOut.textContent='Selecteer minimaal één dienst';
      if(cta)cta.style.display='none';return;
    }
    var max=Math.max.apply(null,selected.map(function(s){return s.days;}));
    var total=selected.length>1?max+3:max;
    daysOut.textContent=total+' wkd';
    servOut.textContent=selected.map(function(s){return s.name;}).join(' + ')+(selected.length>1?' — gecombineerd traject':'');
    if(cta)cta.style.display='inline-flex';
  }
})();

/* ─── PORTFOLIO MODAL ─── */
(function(){
  var overlay=document.getElementById('modal-overlay');
  if(!overlay)return;
  var box=overlay.querySelector('.modal-box');
  var closeBtn=overlay.querySelector('.modal-close');

  function openModal(data){
    overlay.querySelector('.modal-cat').textContent=data.cat||'';
    overlay.querySelector('.modal-title').textContent=data.title||'';
    overlay.querySelector('.modal-desc').textContent=data.desc||'';
    var tagsEl=overlay.querySelector('.modal-tags');
    tagsEl.innerHTML='';
    (data.tags||[]).forEach(function(tag){
      var span=document.createElement('span');
      span.className='modal-tag';span.textContent=tag;
      tagsEl.appendChild(span);
    });
    var imgEl=overlay.querySelector('.modal-img-el');
    if(imgEl&&data.img){imgEl.src=data.img;imgEl.style.display='block';}
    overlay.classList.add('open');
    document.body.style.overflow='hidden';
  }

  function closeModal(){
    overlay.classList.remove('open');
    document.body.style.overflow='';
  }

  document.querySelectorAll('[data-project]').forEach(function(el){
    el.addEventListener('click',function(e){
      e.preventDefault();
      var id=el.dataset.project;
      var data=window.PROJECTS&&window.PROJECTS[id];
      if(data)openModal(data);
    });
  });

  if(closeBtn)closeBtn.addEventListener('click',closeModal);
  overlay.addEventListener('click',function(e){if(e.target===overlay)closeModal();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();});
})();

/* ─── THREE.JS HERO WAVE ─── */
window.afterLoad=function(){
  if(typeof initHeroWave==='function')initHeroWave();
  if(typeof initAmbient==='function')initAmbient();
};

function initHeroWave(){
  var canvas=document.getElementById('hero-canvas');
  if(!canvas||typeof THREE==='undefined')return;
  var W=window.innerWidth,H=window.innerHeight;
  var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:false,alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  renderer.setSize(W,H);
  renderer.setClearColor(0x0A0A0A,1);
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(60,W/H,.1,1000);
  camera.position.set(0,2,28);
  var rl=new THREE.PointLight(0xD42B2B,4,60);rl.position.set(0,10,20);scene.add(rl);
  var rl2=new THREE.PointLight(0x8B0000,2,40);rl2.position.set(-15,-8,10);scene.add(rl2);
  scene.add(new THREE.AmbientLight(0x0A0A0A,.5));
  var COLS=70,ROWS=42,COUNT=COLS*ROWS,SP=.68;
  var pos=new Float32Array(COUNT*3);
  var k=0;
  for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){pos[k*3]=(c-COLS/2)*SP;pos[k*3+1]=0;pos[k*3+2]=(r-ROWS/2)*SP;k++;}
  var geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  var mat=new THREE.ShaderMaterial({
    uniforms:{uT:{value:0},uM:{value:new THREE.Vector2(0,0)},uAmp:{value:1.0},uR:{value:new THREE.Color(0xD42B2B)},uD:{value:new THREE.Color(0x8B0000)},uK:{value:new THREE.Color(0x1A0808)}},
    vertexShader:'uniform float uT;uniform vec2 uM;uniform float uAmp;varying float vH;varying float vD;void main(){float nx=position.x*.12+uT*.3;float nz=position.z*.12+uT*.18;float w=(sin(nx)*cos(nz)*2.2+sin(nx*1.7+uT*.5)*1.1+cos(nz*2.1-uT*.4)*.7)*uAmp;float dx=position.x-uM.x*14.;float dz=position.z-uM.y*9.;float d=sqrt(dx*dx+dz*dz);float mi=exp(-d*.08)*3.*uAmp;float y=w+mi;vH=(y+3.5)/7.;vD=d;gl_Position=projectionMatrix*modelViewMatrix*vec4(position.x,y,position.z,1.);gl_PointSize=clamp(2.5-d*.03,.5,2.5);}',
    fragmentShader:'uniform vec3 uR;uniform vec3 uD;uniform vec3 uK;varying float vH;varying float vD;void main(){vec2 uv=gl_PointCoord-.5;if(length(uv)>.5)discard;float a=smoothstep(.5,.1,length(uv));vec3 c=mix(uK,uD,vH);c=mix(c,uR,clamp((vH-.5)*2.,0.,1.));c+=uR*exp(-vD*.05)*.5;gl_FragColor=vec4(c,a*clamp(.3+vH*.7,.1,1.));}',
    transparent:true,blending:THREE.AdditiveBlending,depthWrite:false
  });
  var pts=new THREE.Points(geo,mat);pts.rotation.x=-.35;scene.add(pts);
  var mx=0,my=0;
  window.addEventListener('mousemove',function(e){mx=(e.clientX/window.innerWidth)*2-1;my=-((e.clientY/window.innerHeight)*2-1);},{passive:true});
  var cx2=0,cy2=0,clock=new THREE.Clock();
  (function anim(){
    requestAnimationFrame(anim);
    var t=clock.getElapsedTime();
    var scrollPct=Math.min(window.scrollY/(window.innerHeight*.8),1);
    var waveAmp=1-scrollPct*.75;
    mat.uniforms.uT.value=t;mat.uniforms.uM.value.set(mx,my);mat.uniforms.uAmp.value=waveAmp;
    cx2+=(mx*1.5-cx2)*.03;cy2+=(my*.8-cy2)*.03;
    camera.position.x=cx2;camera.position.y=2+cy2;
    rl.intensity=3.5+Math.sin(t*2.1)*.5+Math.sin(t*5.7)*.2;
    renderer.render(scene,camera);
  })();
  window.addEventListener('resize',function(){
    camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
  },{passive:true});
}

/* ─── AMBIENT PARTICLES (inner pages bg) ─── */
function initAmbient(){
  document.querySelectorAll('.ambient-canvas').forEach(function(canvas){
    if(typeof THREE==='undefined')return;
    var parent=canvas.parentElement;
    var W=parent.offsetWidth||800,H=parent.offsetHeight||400;
    var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:false,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.2));
    renderer.setSize(W,H);
    var scene=new THREE.Scene();
    var camera=new THREE.PerspectiveCamera(60,W/H,.1,100);
    camera.position.z=20;
    var cnt=800,geo2=new THREE.BufferGeometry(),pos2=new Float32Array(cnt*3);
    for(var i=0;i<cnt;i++){pos2[i*3]=(Math.random()-.5)*50;pos2[i*3+1]=(Math.random()-.5)*30;pos2[i*3+2]=(Math.random()-.5)*15;}
    geo2.setAttribute('position',new THREE.BufferAttribute(pos2,3));
    var mat2=new THREE.PointsMaterial({color:0xD42B2B,size:.06,transparent:true,opacity:.5,blending:THREE.AdditiveBlending});
    scene.add(new THREE.Points(geo2,mat2));
    var clock2=new THREE.Clock();
    (function a2(){requestAnimationFrame(a2);var t2=clock2.getElapsedTime();scene.rotation.y=t2*.04;scene.rotation.x=Math.sin(t2*.02)*.06;renderer.render(scene,camera);})();
    new ResizeObserver(function(){var W2=parent.offsetWidth,H2=parent.offsetHeight;if(W2&&H2){camera.aspect=W2/H2;camera.updateProjectionMatrix();renderer.setSize(W2,H2);}}).observe(parent);
  });
}

/* ─── PORTFOLIO CANVAS PREVIEWS ─── */
(function(){
  document.querySelectorAll('.port-canvas[data-hue]').forEach(function(canvas,idx){
    if(typeof THREE==='undefined')return;
    var parent=canvas.parentElement;
    var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:false,alpha:false});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.2));
    var W=parent.offsetWidth||400,H=parent.offsetHeight||300;
    renderer.setSize(W,H);
    renderer.setClearColor(0x0A0A0A,1);
    var scene=new THREE.Scene();
    var camera=new THREE.PerspectiveCamera(60,W/H,.1,100);
    camera.position.z=8;
    var rl3=new THREE.PointLight(0xD42B2B,3,20);rl3.position.set(2,2,4);scene.add(rl3);
    scene.add(new THREE.AmbientLight(0x0A0A0A,.5));
    var cnt2=500,geo3=new THREE.BufferGeometry(),pos3=new Float32Array(cnt2*3);
    for(var i=0;i<cnt2;i++){pos3[i*3]=(i%25-12)*0.42;pos3[i*3+1]=(Math.floor(i/25)-10)*0.42;pos3[i*3+2]=0;}
    geo3.setAttribute('position',new THREE.BufferAttribute(pos3,3));
    var mat3=new THREE.PointsMaterial({color:0xD42B2B,size:.055,transparent:true,opacity:.7,blending:THREE.AdditiveBlending});
    scene.add(new THREE.Points(geo3,mat3));
    var clock3=new THREE.Clock();var off=idx*1.2;
    (function a3(){requestAnimationFrame(a3);var t3=clock3.getElapsedTime()+off;
      var p3=geo3.attributes.position.array;
      for(var r2=0;r2<20;r2++)for(var c2=0;c2<25;c2++){var pi=r2*25+c2;p3[pi*3+2]=Math.sin(p3[pi*3]*.5+t3*.8)*Math.cos(p3[pi*3+1]*.5+t3*.6)*1.5;}
      geo3.attributes.position.needsUpdate=true;
      rl3.position.x=Math.sin(t3*.7)*4;rl3.position.y=Math.cos(t3*.5)*3;
      renderer.render(scene,camera);
    })();
    new ResizeObserver(function(){var W2=parent.offsetWidth,H2=parent.offsetHeight;if(W2&&H2){camera.aspect=W2/H2;camera.updateProjectionMatrix();renderer.setSize(W2,H2);}}).observe(parent);
  });
})();

/* ─── DIENST CARDS LINK THROUGH ─── */
(function(){
  var map={'card-pv':'diensten.html#product-visuals','card-cm':'diensten.html#content-marketing','card-ai':'diensten.html#ai-systemen','card-sf':'diensten.html#short-form'};
  Object.keys(map).forEach(function(id){
    var el=document.getElementById(id);
    if(!el)return;
    el.style.cursor='none';
    el.addEventListener('click',function(){window.location.href=map[id];});
  });
})();

/* ─── PARALLAX ON SCROLL ─── */
(function(){
  var parallaxEls=document.querySelectorAll('[data-parallax]');
  if(!parallaxEls.length)return;
  window.addEventListener('scroll',function(){
    var sy=window.scrollY;
    parallaxEls.forEach(function(el){
      var speed=parseFloat(el.dataset.parallax||'.15');
      el.style.transform='translateY('+(sy*speed)+'px)';
    });
  },{passive:true});
})();

/* ─── TEXT SCRAMBLE EFFECT ─── */
(function(){
  var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  document.querySelectorAll('[data-scramble]').forEach(function(el){
    var original=el.textContent;
    el.addEventListener('mouseenter',function(){
      var iter=0,total=original.length*2,iv2=setInterval(function(){
        el.textContent=original.split('').map(function(ch,i){
          if(i<iter/2)return original[i];
          return chars[Math.floor(Math.random()*chars.length)];
        }).join('');
        iter++;if(iter>total){clearInterval(iv2);el.textContent=original;}
      },30);
    });
  });
})();
