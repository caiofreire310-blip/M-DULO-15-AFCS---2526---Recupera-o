/* =========================================================
   DASHBOARD – SEDENTARISMO NA ERA DIGITAL
   Lógica da aplicação
   ========================================================= */

// ---------- 1. DADOS DE EXEMPLO (fictícios) ----------
const DADOS_EXEMPLO = [
  { nome: "Aluno 1",  ecra: 6,   atividade: 30, sono: 7,   passos: 5200 },
  { nome: "Aluno 2",  ecra: 3.5, atividade: 75, sono: 8,   passos: 9800 },
  { nome: "Aluno 3",  ecra: 8,   atividade: 20, sono: 6,   passos: 3900 },
  { nome: "Aluno 4",  ecra: 4,   atividade: 60, sono: 7.5, passos: 8200 },
  { nome: "Aluno 5",  ecra: 7,   atividade: 35, sono: 6.5, passos: 5600 },
  { nome: "Aluno 6",  ecra: 2.5, atividade: 90, sono: 8,   passos: 11500 },
  { nome: "Aluno 7",  ecra: 9,   atividade: 15, sono: 5.5, passos: 3100 },
  { nome: "Aluno 8",  ecra: 5,   atividade: 45, sono: 7,   passos: 6800 },
  { nome: "Aluno 9",  ecra: 6.5, atividade: 25, sono: 6,   passos: 4700 },
  { nome: "Aluno 10", ecra: 3,   atividade: 65, sono: 8.5, passos: 9300 },
  { nome: "Aluno 11", ecra: 7.5, atividade: 40, sono: 6.5, passos: 5900 },
  { nome: "Aluno 12", ecra: 4.5, atividade: 55, sono: 7,   passos: 7400 }
];

// ---------- 2. ESTADO DA APLICAÇÃO ----------
let dados = [...DADOS_EXEMPLO];

// Tenta carregar dados guardados no navegador
try {
  const guardado = localStorage.getItem("dados_sedentarismo");
  if (guardado) dados = JSON.parse(guardado);
} catch (erro) {
  // se não for possível, usa os dados de exemplo
}

// ---------- 3. FUNÇÕES AUXILIARES ----------

// Atalho para obter um elemento pelo id
function $(id) {
  return document.getElementById(id);
}

// Evita que texto escrito pelo utilizador estrague o HTML
function limparTexto(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Calcula a média de um campo (ex.: "ecra")
function media(campo) {
  if (dados.length === 0) return 0;
  const soma = dados.reduce((total, aluno) => total + aluno[campo], 0);
  return soma / dados.length;
}

// Classifica o aluno: Ativo, Intermédio ou Sedentário
function classificar(aluno) {
  if (aluno.atividade >= 60 && aluno.ecra <= 4) {
    return { nome: "Ativo", cor: "var(--verde)" };
  }
  if (aluno.atividade < 30 || aluno.ecra >= 7) {
    return { nome: "Sedentário", cor: "var(--vermelho)" };
  }
  return { nome: "Intermédio", cor: "var(--laranja)" };
}

// ---------- 4. DESENHAR O DASHBOARD ----------

// Cria um gráfico de barras horizontais
function desenharBarras(idElemento, campo, maximo, unidade, escolherCor) {
  let html = "";
  for (const aluno of dados) {
    const largura = Math.min(100, (aluno[campo] / maximo) * 100);
    html += `
      <div class="linha">
        <span class="nome">${limparTexto(aluno.nome)}</span>
        <span class="barra"><i style="width:${largura}%; background:${escolherCor(aluno)}"></i></span>
        <span class="valor">${aluno[campo]} ${unidade}</span>
      </div>`;
  }
  $(idElemento).innerHTML = html;
}

// Indicadores no topo
function desenharIndicadores() {
  const total = dados.length;
  const cumprem = dados.filter(a => a.atividade >= 60).length;
  const percentagem = total ? Math.round((cumprem / total) * 100) : 0;

  const indicadores = [
    ["Alunos", total],
    ["Ecrã médio", media("ecra").toFixed(1) + " h"],
    ["Atividade média", Math.round(media("atividade")) + " min"],
    ["Sono médio", media("sono").toFixed(1) + " h"],
    ["Cumprem 60 min", percentagem + "%"],
    ["Passos médios", Math.round(media("passos")).toLocaleString("pt-PT")]
  ];

  $("indicadores").innerHTML = indicadores
    .map(i => `<div class="card indicador"><b>${i[1]}</b><span>${i[0]}</span></div>`)
    .join("");
}

// Gráfico do perfil da turma (Ativo / Intermédio / Sedentário)
function desenharPerfil() {
  const contagem = { "Ativo": 0, "Intermédio": 0, "Sedentário": 0 };
  const cores = {
    "Ativo": "var(--verde)",
    "Intermédio": "var(--laranja)",
    "Sedentário": "var(--vermelho)"
  };

  dados.forEach(aluno => contagem[classificar(aluno).nome]++);

  let html = "";
  for (const perfil in contagem) {
    const largura = dados.length ? (contagem[perfil] / dados.length) * 100 : 0;
    html += `
      <div class="linha">
        <span class="nome">${perfil}</span>
        <span class="barra"><i style="width:${largura}%; background:${cores[perfil]}"></i></span>
        <span class="valor">${contagem[perfil]}</span>
      </div>`;
  }
  html += `<small>Ativo: ≥60 min e ≤4 h de ecrã · Sedentário: &lt;30 min ou ≥7 h de ecrã.</small>`;
  $("grafico-perfil").innerHTML = html;
}

// Tabela com todos os registos
function desenharTabela() {
  let html = `<tr><th>Nome</th><th>Ecrã</th><th>Atividade</th><th>Sono</th><th>Passos</th><th>Perfil</th></tr>`;
  for (const aluno of dados) {
    const perfil = classificar(aluno);
    html += `
      <tr>
        <td>${limparTexto(aluno.nome)}</td>
        <td>${aluno.ecra} h</td>
        <td>${aluno.atividade} min</td>
        <td>${aluno.sono} h</td>
        <td>${aluno.passos}</td>
        <td><span class="etiqueta" style="background:${perfil.cor}">${perfil.nome}</span></td>
      </tr>`;
  }
  $("tabela").innerHTML = html;
}

// Atualiza tudo e guarda no navegador
function atualizar() {
  desenharIndicadores();

  desenharBarras("grafico-ecra", "ecra", 12, "h", a =>
    a.ecra >= 7 ? "var(--vermelho)" : a.ecra >= 4 ? "var(--laranja)" : "var(--verde)");

  desenharBarras("grafico-atividade", "atividade", 120, "min", a =>
    a.atividade >= 60 ? "var(--verde)" : a.atividade >= 30 ? "var(--laranja)" : "var(--vermelho)");

  desenharBarras("grafico-sono", "sono", 10, "h", a =>
    a.sono >= 8 ? "var(--verde)" : a.sono >= 7 ? "var(--laranja)" : "var(--vermelho)");

  desenharPerfil();
  desenharTabela();

  try {
    localStorage.setItem("dados_sedentarismo", JSON.stringify(dados));
  } catch (erro) {
    // ignora se o navegador não permitir guardar
  }
}

// ---------- 5. BOTÕES ----------

// Adicionar um novo registo
$("btn-adicionar").onclick = function () {
  const aluno = {
    nome: $("nome").value.trim() || "Aluno " + (dados.length + 1),
    ecra: Number($("ecra").value),
    atividade: Number($("atividade").value),
    sono: Number($("sono").value),
    passos: Number($("passos").value)
  };

  const campos = ["ecra", "atividade", "sono", "passos"];
  const vazio = campos.some(c => $(c).value === "" || isNaN(aluno[c]));
  if (vazio) {
    alert("Preenche todos os campos numéricos.");
    return;
  }

  dados.push(aluno);
  ["nome", "ecra", "atividade", "sono", "passos"].forEach(c => $(c).value = "");
  atualizar();
};

// Repor dados de exemplo
$("btn-exemplo").onclick = function () {
  dados = [...DADOS_EXEMPLO];
  atualizar();
};

// Importar CSV
$("btn-importar").onclick = function () {
  $("ficheiro-csv").click();
};

$("ficheiro-csv").onchange = function (evento) {
  const ficheiro = evento.target.files[0];
  if (!ficheiro) return;

  const leitor = new FileReader();
  leitor.onload = function () {
    const linhas = leitor.result.trim().split(/\r?\n/).slice(1); // ignora o cabeçalho
    const novos = [];

    for (const linha of linhas) {
      const c = linha.split(/[,;]/);
      const aluno = {
        nome: c[0],
        ecra: Number(c[1]),
        atividade: Number(c[2]),
        sono: Number(c[3]),
        passos: Number(c[4])
      };
      const valido = aluno.nome && ![aluno.ecra, aluno.atividade, aluno.sono, aluno.passos].some(isNaN);
      if (valido) novos.push(aluno);
    }

    if (novos.length > 0) {
      dados = novos;
      atualizar();
    } else {
      alert("CSV inválido. Usa: nome,ecra,atividade,sono,passos");
    }
  };
  leitor.readAsText(ficheiro);
};

// Exportar CSV
$("btn-exportar").onclick = function () {
  let csv = "nome,ecra,atividade,sono,passos\n";
  csv += dados.map(a => [a.nome, a.ecra, a.atividade, a.sono, a.passos].join(",")).join("\n");

  const link = document.createElement("a");
  link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  link.download = "habitos.csv";
  link.click();
};

// ---------- 6. ARRANQUE ----------
atualizar();
