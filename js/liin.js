// LIIN Brazil — comportamento comum a todas as páginas
(function(){
  const nav=document.getElementById('nav');
  if(nav) addEventListener('scroll',()=>nav.classList.toggle('up',scrollY>70),{passive:true});

  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
  }),{threshold:.1});
  document.querySelectorAll('.rv').forEach(el=>io.observe(el));

  document.querySelectorAll('.tag').forEach(t=>{
    t.tabIndex=0; t.setAttribute('role','button'); t.setAttribute('aria-pressed','false');
    const alterna=()=>t.setAttribute('aria-pressed', t.classList.toggle('on'));
    t.addEventListener('click',alterna);
    t.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();alterna()}});
  });


  // contadores ascendentes na faixa de números
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nf = n => new Intl.NumberFormat('pt-BR').format(n);
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    co.unobserve(e.target);
    const el = e.target, alvo = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    if (reduz) return;
    const dur = 1100; let t0 = null;
    const passo = ts => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const v = alvo * (1 - Math.pow(1 - p, 3));
      el.textContent = dec ? v.toFixed(dec).replace('.', ',') : nf(Math.round(v));
      if (p < 1) requestAnimationFrame(passo); else el.textContent = dec ? alvo.toFixed(dec).replace('.', ',') : nf(alvo);
    };
    requestAnimationFrame(passo);
  }), { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach(el => co.observe(el));

  // acessibilidade: não animar para quem pediu menos movimento
  const v=document.getElementById('hero-video');
  if(v && matchMedia('(prefers-reduced-motion: reduce)').matches){ v.removeAttribute('autoplay'); v.pause(); }

  const form=document.getElementById('filiacao');
  if(!form) return;
  const status=document.getElementById('status');
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const btn=form.querySelector('.send'), v=id=>document.getElementById(id).value.trim();
    if(!v('instituicao')||!v('nome')||!v('email')||!document.getElementById('consentimento').checked){
      status.style.color='#8C1443';
      status.textContent='Preencha instituição, nome, e-mail e aceite a política de privacidade.'; return;
    }
    const rotulo=btn.textContent; btn.disabled=true; btn.textContent='Enviando…';
    status.style.color='#7C818C'; status.textContent='';
    try{
      const r=await fetch('/api/contato',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({instituicao:v('instituicao'),tipo:document.getElementById('tipo').value,
          nome:v('nome'),cargo:v('cargo'),email:v('email'),telefone:v('telefone'),
          contexto:v('contexto'),website:v('website'),
          temas:[...document.querySelectorAll('#temas .tag.on')].map(t=>t.textContent),
          consentimento:true})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(d.erro||'Falha no envio.');
      form.querySelectorAll('input,select,textarea').forEach(i=>i.type==='checkbox'?i.checked=false:i.value='');
      document.querySelectorAll('#temas .tag.on').forEach(t=>{t.classList.remove('on');t.setAttribute('aria-pressed','false')});
      status.style.color='#14161C'; status.textContent='Solicitação recebida. Retornamos pelo e-mail informado.';
    }catch(err){
      status.style.color='#8C1443';
      status.textContent=err.message+' Se persistir, escreva para kurt@liinbrazil.org.';
    }finally{ btn.disabled=false; btn.textContent=rotulo; }
  });
})();

/* menu ≡ — abre e fecha o índice de páginas */
(function(){
  var nav = document.getElementById('nav'), bg = document.querySelector('.bg');
  if (!nav || !bg) return;
  bg.addEventListener('click', function(){ nav.classList.toggle('open'); });
  nav.querySelectorAll('.menu a').forEach(function(a){
    a.addEventListener('click', function(){ nav.classList.remove('open'); });
  });
})();
