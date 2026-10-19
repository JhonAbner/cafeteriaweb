"use strict";

/* ===== Configurações (ajuste aqui) ===== */
const CONFIG = {
  whatsapp: "5573900000000",   // DDI + DDD + número da cafeteria
  antecedenciaMinutos: 60,     // antecedência mínima para reservar
  // 0 = domingo ... 6 = sábado
  horarios: {
    0: { abre: "08:00", fecha: "14:00" },
    1: { abre: "07:00", fecha: "19:00" },
    2: { abre: "07:00", fecha: "19:00" },
    3: { abre: "07:00", fecha: "19:00" },
    4: { abre: "07:00", fecha: "19:00" },
    5: { abre: "07:00", fecha: "19:00" },
    6: { abre: "08:00", fecha: "14:00" }
  }
};

/* ===== Elementos ===== */
const form = document.getElementById("form-reserva");
const confirmacao = document.getElementById("confirmacao");
const resumo = document.getElementById("resumo");
const linkWhatsapp = document.getElementById("link-whatsapp");
const btnNova = document.getElementById("nova-reserva");
const campos = {
  nome: document.getElementById("nome"),
  email: document.getElementById("email"),
  telefone: document.getElementById("telefone"),
  data: document.getElementById("data"),
  hora: document.getElementById("hora"),
  pessoas: document.getElementById("pessoas"),
  obs: document.getElementById("obs")
};

/* ===== Utilitários ===== */
function dataLocalISO(d) {
  const p = n => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}

function paraMinutos(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function formatarData(iso) {
  const [a, m, d] = iso.split("-");
  return d + "/" + m + "/" + a;
}

function diaDaSemana(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).getDay();
}

/* ===== Máscara do telefone: (99) 99999-9999 ===== */
campos.telefone.addEventListener("input", () => {
  const n = campos.telefone.value.replace(/\D/g, "").slice(0, 11);
  let t = n;
  if (n.length > 10) t = "(" + n.slice(0, 2) + ") " + n.slice(2, 7) + "-" + n.slice(7);
  else if (n.length > 6) t = "(" + n.slice(0, 2) + ") " + n.slice(2, 6) + "-" + n.slice(6);
  else if (n.length > 2) t = "(" + n.slice(0, 2) + ") " + n.slice(2);
  else if (n.length > 0) t = "(" + n;
  campos.telefone.value = t;
});

/* ===== Data mínima = hoje ===== */
campos.data.min = dataLocalISO(new Date());

/* ===== Validações: retornam mensagem de erro ou "" ===== */
const validadores = {
  nome() {
    const v = campos.nome.value.trim();
    if (!v) return "Informe seu nome.";
    if (v.length < 3 || !v.includes(" ")) return "Digite nome e sobrenome.";
    return "";
  },
  email() {
    const v = campos.email.value.trim();
    if (!v) return "Informe seu e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Digite um e-mail válido, como voce@email.com.";
    return "";
  },
  telefone() {
    const n = campos.telefone.value.replace(/\D/g, "");
    if (!n) return "Informe seu WhatsApp.";
    if (n.length < 10 || n.length > 11) return "Digite o DDD e o número, como (73) 91234-5678.";
    if (n.length === 11 && n[2] !== "9") return "Celulares com 11 dígitos começam com 9 depois do DDD.";
    return "";
  },
  data() {
    const v = campos.data.value;
    if (!v) return "Escolha a data da reserva.";
    if (v < dataLocalISO(new Date())) return "Escolha hoje ou uma data futura.";
    return "";
  },
  hora() {
    const v = campos.hora.value;
    if (!v) return "Escolha o horário.";
    if (!campos.data.value || validadores.data()) return "";

    const h = CONFIG.horarios[diaDaSemana(campos.data.value)];
    const min = paraMinutos(v);
    if (min < paraMinutos(h.abre) || min > paraMinutos(h.fecha)) {
      return "Neste dia atendemos das " + h.abre.replace(":", "h") + " às " + h.fecha.replace(":", "h") + ".";
    }

    const [a, m, d] = campos.data.value.split("-").map(Number);
    const [hh, mm] = v.split(":").map(Number);
    const limite = Date.now() + CONFIG.antecedenciaMinutos * 60000;
    if (new Date(a, m - 1, d, hh, mm).getTime() < limite) {
      return "Reserve com pelo menos " + CONFIG.antecedenciaMinutos + " minutos de antecedência.";
    }
    return "";
  },
  pessoas() {
    return campos.pessoas.value ? "" : "Escolha o número de pessoas.";
  }
};

function validarCampo(nome) {
  const msg = validadores[nome]();
  const campo = campos[nome];
  document.getElementById("erro-" + nome).textContent = msg;
  campo.classList.toggle("invalido", Boolean(msg));
  campo.setAttribute("aria-invalid", msg ? "true" : "false");
  campo.setAttribute("aria-describedby", "erro-" + nome);
  return !msg;
}

/* Valida ao sair do campo e revalida enquanto corrige */
Object.keys(validadores).forEach(nome => {
  campos[nome].addEventListener("blur", () => validarCampo(nome));
  campos[nome].addEventListener("input", () => {
    if (campos[nome].classList.contains("invalido")) validarCampo(nome);
  });
});
// Data e horário dependem um do outro
campos.data.addEventListener("change", () => {
  validarCampo("data");
  if (campos.hora.value) validarCampo("hora");
});

/* ===== Envio ===== */
form.addEventListener("submit", evento => {
  evento.preventDefault();

  const resultados = Object.keys(validadores).map(validarCampo);
  if (resultados.includes(false)) {
    const primeiro = Object.keys(validadores).find(n => campos[n].classList.contains("invalido"));
    campos[primeiro].focus();
    return;
  }

  const dados = {
    nome: campos.nome.value.trim(),
    email: campos.email.value.trim(),
    telefone: campos.telefone.value,
    data: formatarData(campos.data.value),
    hora: campos.hora.value,
    pessoas: campos.pessoas.value === "9+" ? "9 ou mais" : campos.pessoas.value,
    obs: campos.obs.value.trim()
  };

  mostrarConfirmacao(dados);
});

function mostrarConfirmacao(d) {
  const linhas = [
    ["Nome", d.nome],
    ["E-mail", d.email],
    ["WhatsApp", d.telefone],
    ["Data", d.data],
    ["Horário", d.hora],
    ["Pessoas", d.pessoas]
  ];
  if (d.obs) linhas.push(["Observações", d.obs]);

  resumo.innerHTML = "";
  linhas.forEach(([rotulo, valor]) => {
    const bloco = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = rotulo;
    dd.textContent = valor; // textContent evita injeção de HTML
    bloco.append(dt, dd);
    resumo.appendChild(bloco);
  });

  const texto =
    "Olá! Gostaria de reservar uma mesa.\n" +
    "Nome: " + d.nome + "\n" +
    "Data: " + d.data + " às " + d.hora + "\n" +
    "Pessoas: " + d.pessoas + "\n" +
    "WhatsApp: " + d.telefone + "\n" +
    "E-mail: " + d.email +
    (d.obs ? "\nObservações: " + d.obs : "");
  linkWhatsapp.href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texto);

  form.hidden = true;
  confirmacao.hidden = false;
  confirmacao.focus();
}

btnNova.addEventListener("click", () => {
  form.reset();
  Object.keys(validadores).forEach(nome => {
    campos[nome].classList.remove("invalido");
    campos[nome].removeAttribute("aria-invalid");
    document.getElementById("erro-" + nome).textContent = "";
  });
  confirmacao.hidden = true;
  form.hidden = false;
  campos.nome.focus();
});
