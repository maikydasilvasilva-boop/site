/* Cyber Sky — site
   Para trocar os canais de contato, altere somente o bloco CONTATO abaixo. */
const CONTATO = {
  whatsapp: '5519999454749',                  // DDI + DDD + número, só dígitos
  whatsappExibicao: '(19) 99945-4749',
  email: '',                                  // deixe vazio enquanto o e-mail não existir
  linkedin: 'https://www.linkedin.com/company/cyber-sky-analytics/',
  saudacao: 'Olá, vim pelo site da Cyber Sky e quero conversar sobre um projeto.',
};

/* ---------- canais de contato ---------- */
function linkWhatsApp(texto) {
  return 'https://wa.me/' + CONTATO.whatsapp + '?text=' + encodeURIComponent(texto || CONTATO.saudacao);
}
function linkEmail(assunto, corpo) {
  return 'mailto:' + CONTATO.email + '?subject=' + encodeURIComponent(assunto || 'Contato pelo site') + (corpo ? '&body=' + encodeURIComponent(corpo) : '');
}
document.querySelectorAll('[data-canal]').forEach((a) => {
  const canal = a.dataset.canal;
  if (canal === 'whatsapp') { a.href = linkWhatsApp(); a.target = '_blank'; a.rel = 'noopener'; if (a.dataset.texto === 'numero') a.textContent = CONTATO.whatsappExibicao; }
  if (canal === 'email' && CONTATO.email) { a.href = linkEmail(); if (a.dataset.texto === 'endereco') a.textContent = CONTATO.email; }
  if (canal === 'linkedin') { a.href = CONTATO.linkedin; a.target = '_blank'; }
});

/* sem e-mail configurado: o canal e o botão de e-mail ficam ocultos */
if (!CONTATO.email) {
  document.querySelectorAll('[data-canal="email"]').forEach((a) => { (a.closest('li') || a).hidden = true; });
  const botaoEmail = document.querySelector('[data-envio="email"]'); if (botaoEmail) botaoEmail.hidden = true;
  const nota = document.querySelector('.nota'); if (nota) nota.textContent = 'O formulário abre o seu WhatsApp com a mensagem pronta. O site não guarda nenhum dado.';
}

/* ---------- abas ---------- */
const telas = [...document.querySelectorAll('[data-aba]')];
const links = [...document.querySelectorAll('.abas a')];
document.body.classList.add('com-abas');
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
function abrir(id, focar) {
  const alvo = telas.find((t) => t.id === id) || telas[0];
  telas.forEach((t) => { t.hidden = t !== alvo; });
  links.forEach((l) => { if (l.getAttribute('href') === '#' + alvo.id) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current'); });
  document.body.classList.toggle('interna', alvo.id !== 'inicio');
  window.scrollTo(0, 0);
  setTimeout(() => window.scrollTo(0, 0), 0);
  if (focar) { const h = alvo.querySelector('h1'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
}
window.addEventListener('hashchange', () => abrir(location.hash.slice(1), true));
abrir(location.hash.slice(1), false);

/* ---------- céu em longa exposição ---------- */
const tela = document.getElementById('ceu');
const CORES = [[255, 240, 222, 0.34], [255, 170, 110, 0.22], [255, 96, 36, 0.20], [47, 211, 197, 0.14], [200, 238, 246, 0.10]];
function sorteio(semente) { let a = semente >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function desenharCeu() {
  const L = window.innerWidth, A = window.innerHeight;
  const estreito = L < 640;
  const px = L * (estreito ? 0.78 : 0.72), py = A * (estreito ? 0.74 : 0.6);
  const raio = Math.max(Math.hypot(px, py), Math.hypot(L - px, py), Math.hypot(px, A - py), Math.hypot(L - px, A - py)) + 20;
  const lado = raio * 2;
  const escala = Math.min(window.devicePixelRatio || 1, 2600 / lado, 2);
  tela.width = Math.round(lado * escala); tela.height = Math.round(lado * escala);
  tela.style.width = lado + 'px'; tela.style.height = lado + 'px';
  tela.style.left = (px - raio) + 'px'; tela.style.top = (py - raio) + 'px';
  const c = tela.getContext('2d');
  c.setTransform(escala, 0, 0, escala, 0, 0);
  c.clearRect(0, 0, lado, lado);
  c.globalCompositeOperation = 'lighter';
  c.lineCap = 'round';
  const r = sorteio(7);
  const total = Math.round(Math.min(900, Math.max(380, (L * A) / 1500)));
  for (let i = 0; i < total; i++) {
    const rr = raio * Math.sqrt(r());
    const a0 = r() * Math.PI * 2;
    const arco = (0.62 + r() * 0.22);
    const brilho = Math.min(1, (Math.pow(1 - r(), -1 / 2.2) - 1 + 0.12) * 0.38);
    let s = r(), cor = CORES[0];
    for (const k of CORES) { if (s < k[3]) { cor = k; break; } s -= k[3]; }
    const esp = 0.7 + r() * 2.0 * brilho;
    c.beginPath(); c.arc(raio, raio, rr, a0, a0 + arco);
    c.strokeStyle = `rgba(${cor[0]},${cor[1]},${cor[2]},${(brilho * 0.16).toFixed(3)})`; c.lineWidth = esp * 5; c.stroke();
    c.strokeStyle = `rgba(${cor[0]},${cor[1]},${cor[2]},${brilho.toFixed(3)})`; c.lineWidth = esp; c.stroke();
  }
}
let espera;
window.addEventListener('resize', () => { clearTimeout(espera); espera = setTimeout(desenharCeu, 180); });
desenharCeu();

/* ---------- carrossel das frentes ---------- */
const trilho = document.getElementById('trilho');
const itens = trilho.children.length;
let pos = 0, relogio;
const visiveis = () => (window.innerWidth <= 640 ? 1 : window.innerWidth <= 980 ? 2 : 3);
function mover(n) {
  const max = itens - visiveis();
  pos = n > max ? 0 : n < 0 ? max : n;
  const passo = trilho.children[0].getBoundingClientRect().width + 20;
  trilho.style.transform = 'translateX(' + (-pos * passo) + 'px)';
}
document.getElementById('prox').addEventListener('click', () => { mover(pos + 1); reiniciar(); });
document.getElementById('ant').addEventListener('click', () => { mover(pos - 1); reiniciar(); });
const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function iniciar() { if (!calmo) relogio = setInterval(() => mover(pos + 1), 5000); }
function reiniciar() { clearInterval(relogio); iniciar(); }
const area = document.querySelector('.frentes');
area.addEventListener('mouseenter', () => clearInterval(relogio));
area.addEventListener('mouseleave', reiniciar);
area.addEventListener('focusin', () => clearInterval(relogio));
area.addEventListener('focusout', reiniciar);
window.addEventListener('resize', () => mover(0));
iniciar();

/* ---------- formulário ---------- */
const form = document.getElementById('form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form).entries());
  const erro = document.getElementById('erro');
  const ok = d.nome.trim() && d.mensagem.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim());
  erro.hidden = !!ok;
  if (!ok) return;
  const texto = 'Olá, sou ' + d.nome.trim() + (d.empresa.trim() ? ', da ' + d.empresa.trim() : '') + '.\n\n' + d.mensagem.trim() + '\n\nMeu e-mail: ' + d.email.trim();
  const via = (e.submitter && e.submitter.dataset.envio) || 'whatsapp';
  if (via === 'email') window.location.href = linkEmail('Contato pelo site: ' + d.nome.trim(), texto);
  else window.open(linkWhatsApp(texto), '_blank', 'noopener');
});
