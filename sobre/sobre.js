// ================================================
// Formulário de Contato — validação e feedback
// ================================================

const form = document.getElementById('contato-form');
const feedback = document.getElementById('form-feedback');
const btnEnviar = document.getElementById('btn-enviar');

form.addEventListener('submit', function (e) {
  e.preventDefault(); // impede envio real (não temos servidor)

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const mensagem = document.getElementById('mensagem').value.trim();

  // Validação simples
  if (!nome || !email || !mensagem) {
    feedback.textContent = '⚠️ Por favor, preencha todos os campos.';
    feedback.style.color = '#c0392b';
    return;
  }

  // Simula envio
  btnEnviar.disabled = true;
  btnEnviar.textContent = 'Enviando...';

  setTimeout(function () {
    feedback.textContent = '✅ Mensagem enviada com sucesso! Em breve entraremos em contato.';
    feedback.style.color = '#27ae60';
    form.reset();
    btnEnviar.disabled = false;
    btnEnviar.textContent = 'Enviar Mensagem';
  }, 1200);
});

// ================================================
// Animação de entrada dos cards (ao rolar a página)
// ================================================

function animarAoRolar() {
  const elementos = document.querySelectorAll('.card, .membro, .contato-item, .horario-linha');

  elementos.forEach(function (el) {
    const topo = el.getBoundingClientRect().top;
    const alturaJanela = window.innerHeight;

    if (topo < alturaJanela - 60) {
      el.classList.add('visivel');
    }
  });
}

// Estilo de animação injetado via JS (para manter o HTML/CSS simples)
const estiloAnimacao = document.createElement('style');
estiloAnimacao.textContent = `
  .card, .membro, .contato-item, .horario-linha {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .card.visivel, .membro.visivel, .contato-item.visivel, .horario-linha.visivel {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(estiloAnimacao);

window.addEventListener('scroll', animarAoRolar);
window.addEventListener('load', animarAoRolar);

// ================================================
// Destaque no link ativo da navbar ao rolar
// ================================================

const secoes = document.querySelectorAll('section[id]');
const linksNav = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', function () {
  let atual = '';

  secoes.forEach(function (secao) {
    const topo = secao.offsetTop - 80;
    if (window.scrollY >= topo) {
      atual = secao.getAttribute('id');
    }
  });

  linksNav.forEach(function (link) {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + atual) {
      link.classList.add('active');
    }
  });
});
