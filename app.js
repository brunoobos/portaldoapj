// ===== DADOS INICIAIS E VARIÁVEIS =====
let equipes = [];
let afastamentos = [];
let feriados = [];
let observacoes = {};
let tarefas = [];

const meses = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

// ===== INÍCIO - INICIALIZAÇÃO =====
function iniciar() {
  equipes = JSON.parse(localStorage.getItem('equipes24x96') || '[]');
  afastamentos = JSON.parse(localStorage.getItem('afastamentos24x96') || '[]');
  feriados = JSON.parse(localStorage.getItem('feriados24x96') || '[]');
  observacoes = JSON.parse(localStorage.getItem('observacoes24x96') || '{}');
  tarefas = JSON.parse(localStorage.getItem('tarefas24x96') || '[]');

  preencherMesAno();
  renderEquipes();
  atualizarSelectEquipe();
  gerarEscala();
  vincularEventos();
}

// ===== VINCULAR EVENTOS AOS BOTÕES =====
function vincularEventos() {
  document.getElementById('btnAddEquipe').onclick = () => {
    equipes.push({ nome:'', dataInicio:'', fixo:'', rotativos:['','',''] });
    renderEquipes();
  };
  document.getElementById('btnSalvar').onclick = () => {
    salvarEquipes();
    salvarNaNuvem();
  };
  document.getElementById('btnVisualizar').onclick = visualizarEquipes;
  document.getElementById('btnExcluir').onclick = excluirEquipe;
  document.getElementById('btnAfastamentos').onclick = () => {
    if (equipes.length === 0) return alert('Cadastre equipes antes.');
    abrirModal('modalAfastamento');
  };
  document.getElementById('btnFeriados').onclick = () => abrirModal('modalFeriado');
  document.getElementById('btnGerarEscala').onclick = () => {
    if (equipes.length === 0) return alert('Cadastre equipes.');
    gerarEscala();
  };
  document.getElementById('btnAddTarefa').onclick = () => abrirModal('modalTarefa');
  document.getElementById('btnExcluirAfastamento').onclick = excluirAfastamento;
  document.getElementById('btnExcluirFeriado').onclick = excluirFeriado;
}

// ===== FUNÇÕES DE SALVAR DADOS LOCAL E REMOTO =====
function salvarEquipes() {
  localStorage.setItem('equipes24x96', JSON.stringify(equipes));
  alert('Equipes salvas!');
}
function salvarObservacoes() {
  localStorage.setItem('observacoes24x96', JSON.stringify(observacoes));
}
function salvarTarefas() {
  localStorage.setItem('tarefas24x96', JSON.stringify(tarefas));
}

function salvarNaNuvem() {
  fetch("https://seusite.com/api.php?acao=salvar", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ equipes, afastamentos, feriados, observacoes, tarefas })
  })
  .then(res => res.json())
  .then(data => alert("Salvo na nuvem!"))
  .catch(err => console.error("Erro ao salvar:", err));
}

// ===== FUNÇÕES DE RENDERIZAÇÃO =====
function preencherMesAno() {
  const selectMes = document.getElementById('selectMes');
  const selectAno = document.getElementById('selectAno');
  selectMes.innerHTML = '';
  meses.forEach((m, i) => selectMes.innerHTML += `<option value="${i}">${m}</option>`);
  let anoAtual = new Date().getFullYear();
  selectAno.innerHTML = '';
  for(let a=anoAtual-5; a <= anoAtual+5; a++){
    selectAno.innerHTML += `<option value="${a}">${a}</option>`;
  }
  selectMes.value = new Date().getMonth();
  selectAno.value = anoAtual;
}

function renderEquipes() {
  const container = document.getElementById('equipes-container');
  container.innerHTML = '';
  equipes.forEach((eq, i) => {
    eq.rotativos = eq.rotativos || ['', '', ''];
    container.innerHTML += `
    <div class="section">
      <h3>Equipe ${i+1}</h3>
      <label>Nome:</label><input type="text" value="${eq.nome}" onchange="equipes[${i}].nome=this.value" /><br/>
      <label>Data Início:</label><input type="date" value="${eq.dataInicio}" onchange="equipes[${i}].dataInicio=this.value" /><br/>
      <label>Fixo:</label><input type="text" value="${eq.fixo}" onchange="equipes[${i}].fixo=this.value" /><br/>
      ${eq.rotativos.map((r,j)=>`<label>R${j+1}:</label><input type="text" value="${r}" onchange="equipes[${i}].rotativos[${j}]=this.value" /><br/>`).join('')}
    </div>`;
  });
  atualizarSelectEquipe();
}

function atualizarSelectEquipe() {
  const sel = document.getElementById('selectEquipe');
  sel.innerHTML = '<option value="-1">Todas as equipes</option>';
  equipes.forEach((eq, i) => sel.innerHTML += `<option value="${i}">${eq.nome || 'Equipe '+(i+1)}</option>`);
  atualizarModalEquipe();
}
function atualizarModalEquipe() {
  const sel = document.getElementById('modalEquipe');
  if (!sel) return;
  sel.innerHTML = '';
  equipes.forEach((eq, i) => sel.innerHTML += `<option value="${i}">${eq.nome}</option>`);
}

// ===== FUNÇÕES DE CRUD (Exclusão, visualização, modais) =====
function visualizarEquipes() {
  alert(equipes.map((eq, i) =>
    `Equipe ${i+1}: ${eq.nome}, Fixo: ${eq.fixo}, Rotativos: ${eq.rotativos.join(', ')}`).join('\n\n'));
}

function excluirEquipe() {
  let idx = prompt('Digite o número da equipe para excluir (começando em 0):');
  idx = parseInt(idx);
  if (!isNaN(idx) && idx >= 0 && idx < equipes.length) {
    if (confirm(`Excluir equipe ${equipes[idx].nome}?`)) {
      equipes.splice(idx,1);
      salvarEquipes();
      renderEquipes();
    }
  } else alert('Índice inválido.');
}

function abrirModal(id) { document.getElementById(id).style.display = 'flex'; }
function fecharModal(id) { document.getElementById(id).style.display = 'none'; }

// ===== MODAIS: SALVAR AFASTAMENTOS, FERIADOS, TAREFAS =====
function salvarAfastamento() {
  let eq = parseInt(document.getElementById('modalEquipe').value);
  let membro = document.getElementById('modalMembro').value;
  let tipo = document.getElementById('modalTipo').value;
  let inicio = document.getElementById('modalInicio').value;
  let fim = document.getElementById('modalFim').value;
  if (!inicio || !fim) return alert('Preencha datas.');
  afastamentos.push({ equipe: eq, membro, tipo, inicio, fim });
  localStorage.setItem('afastamentos24x96', JSON.stringify(afastamentos));
  fecharModal('modalAfastamento');
  gerarEscala();
}

function salvarFeriado() {
  let data = document.getElementById('feriadoData').value;
  if (!data) return alert('Selecione a data do feriado.');
  if (!feriados.includes(data)) {
    feriados.push(data);
    localStorage.setItem('feriados24x96', JSON.stringify(feriados));
  } else {
    alert('Feriado já cadastrado.');
  }
  fecharModal('modalFeriado');
  gerarEscala();
}

function salvarNovaTarefa() {
  let nome = document.getElementById('inputNomeTarefa').value.trim();
  let data = document.getElementById('inputDataTarefa').value;
  let descricao = document.getElementById('inputDescricaoTarefa').value.trim();
  if (!nome || !data || !descricao) return alert('Preencha todos os campos da tarefa.');
  tarefas.push({ nome, data, descricao });
  salvarTarefas();
  fecharModal('modalTarefa');
  gerarEscala();
}

// ===== EXCLUSÃO DE AFASTAMENTOS E FERIADOS =====
function excluirAfastamento() {
  if (afastamentos.length === 0) return alert('Nenhum afastamento cadastrado.');
  let lista = 'Afastamentos cadastrados:\n';
  afastamentos.forEach((af, i) => {
    let equipeNome = equipes[af.equipe]?.nome || 'Equipe desconhecida';
    let membroNome = af.membro==='F' ? equipes[af.equipe]?.fixo : equipes[af.equipe]?.rotativos[parseInt(af.membro[1])];
    lista += `${i}: ${equipeNome} - ${membroNome} (${af.tipo}) de ${af.inicio} até ${af.fim}\n`;
  });
  let idx = prompt(lista + '\nDigite o número do afastamento que deseja excluir:');
  idx = parseInt(idx);
  if (!isNaN(idx) && idx >= 0 && idx < afastamentos.length) {
    if (confirm(`Excluir ${lista.split('\n')[idx+1]}?`)) {
      afastamentos.splice(idx,1);
      localStorage.setItem('afastamentos24x96', JSON.stringify(afastamentos));
      gerarEscala();
    }
  }
}

function excluirFeriado() {
  if (feriados.length === 0) return alert('Nenhum feriado cadastrado.');
  let lista = 'Feriados cadastrados:\n';
  feriados.forEach((f,i)=> lista+=`${i}: ${f}\n`);
  let idx = prompt(lista + '\nDigite o número do feriado a excluir:');
  idx = parseInt(idx);
  if (!isNaN(idx) && idx >=0 && idx < feriados.length) {
    if (confirm(`Confirma excluir ${feriados[idx]}?`)) {
      feriados.splice(idx,1);
      localStorage.setItem('feriados24x96', JSON.stringify(feriados));
      gerarEscala();
    }
  }
}

// ===== EDIÇÃO DE OBSERVAÇÕES E NOMES EXTRAS =====
function adicionarNomeExtra(dataStr) {
  let nome = prompt('Nome para adicionar (extra):');
  if (!nome) return;
  let obs = prompt('Observação para esse nome (opcional):') || nome;
  if (!observacoes[dataStr]) observacoes[dataStr] = {};
  observacoes[dataStr][nome] = obs;
  salvarObservacoes();
  gerarEscala();
}

function editarObs(dataStr, nome) {
  let atual = observacoes[dataStr]?.[nome] || nome;
  let op = prompt(`Editar ou excluir "${nome}" no dia ${dataStr}?\nDigite o novo nome ou deixe vazio para excluir.\nDigite CANCELAR para cancelar.`, atual);
  if (op === null || op.toUpperCase() === 'CANCELAR') return; // cancelar
  if (op === '') {
    if (observacoes[dataStr]) {
      delete observacoes[dataStr][nome];
      if (Object.keys(observacoes[dataStr]).length === 0) delete observacoes[dataStr];
    }
  } else {
    if (!observacoes[dataStr]) observacoes[dataStr] = {};
    observacoes[dataStr][nome] = op;
  }
  salvarObservacoes();
  gerarEscala();
}

// ===== EDIÇÃO DE TAREFAS =====
function editarTarefa(index) {
  let t = tarefas[index];
  if (!t) return;
  let novoNome = prompt("Editar nome da pessoa:", t.nome);
  if (novoNome === null) return;
  if (novoNome === '') {
    if (confirm("Deseja excluir esta tarefa?")) {
      tarefas.splice(index, 1);
      salvarTarefas();
      gerarEscala();
    }
    return;
  }
  let novaDesc = prompt("Editar descrição da tarefa:", t.descricao);
  if (novaDesc === null) return;
  t.nome = novoNome.trim();
  t.descricao = novaDesc.trim();
  salvarTarefas();
  gerarEscala();
}

// ===== EDIÇÃO DE AFASTAMENTOS =====
function editarAfastamento(index) {
  let af = afastamentos[index];
  if (!af) return;
  let novoTipo = prompt(`Editar tipo de afastamento (FERIAS, LICENCA, COMPENSACAO):`, af.tipo);
  if (novoTipo === null) return;
  if (novoTipo === '') {
    if (confirm("Deseja excluir este afastamento?")) {
      afastamentos.splice(index, 1);
      localStorage.setItem('afastamentos24x96', JSON.stringify(afastamentos));
      gerarEscala();
    }
    return;
  }
  let novoInicio = prompt("Editar data início (AAAA-MM-DD):", af.inicio);
  if (novoInicio === null) return;
  let novoFim = prompt("Editar data fim (AAAA-MM-DD):", af.fim);
  if (novoFim === null) return;

  af.tipo = novoTipo.toUpperCase().trim();
  af.inicio = novoInicio.trim();
  af.fim = novoFim.trim();
  localStorage.setItem('afastamentos24x96', JSON.stringify(afastamentos));
  gerarEscala();
}

// ===== GERAR ESCALA =====
function gerarEscala() {
  const mes = parseInt(document.getElementById('selectMes').value);
  const ano = parseInt(document.getElementById('selectAno').value);
  const eqIdx = parseInt(document.getElementById('selectEquipe').value);
  const eqs = eqIdx === -1 ? equipes : [equipes[eqIdx]];

  let html = `<h3>Escala ${meses[mes]}/${ano}</h3><div class="calendar">`;
  ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(d => (html += `<div><b>${d}</b></div>`));

  let primeiroDia = new Date(ano, mes, 1).getDay();
  for (let i = 0; i < primeiroDia; i++) html += '<div class="calendar-day feriado"></div>';

  let diasNoMes = new Date(ano, mes + 1, 0).getDate();

  for (let dia = 1; dia <= diasNoMes; dia++) {
    let dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    let data = new Date(ano, mes, dia);
    let diaSemana = data.getDay();
    let isFeriado = feriados.includes(dataStr);
    let classes = 'calendar-day';
    if (isFeriado || diaSemana === 0 || diaSemana === 6) classes += ' feriado';

    let hoje = new Date();
    if (
      data.getDate() === hoje.getDate() &&
      data.getMonth() === hoje.getMonth() &&
      data.getFullYear() === hoje.getFullYear()
    ) {
      classes += ' hoje';
    }

    let box = `<div class="${classes}"><div class="data-num">${dia} <button onclick="adicionarNomeExtra('${dataStr}')" title="Adicionar nome extra" style="font-weight:bold; font-size:12px; color:#ff66b2; border:none; background:none; cursor:pointer;">+</button></div>`;

    eqs.forEach(eq => {
      if (!eq.dataInicio) return;
      let diasCorridos = Math.floor((data - new Date(eq.dataInicio)) / (1000 * 60 * 60 * 24));
      if (diasCorridos < 0) return;
      if (diasCorridos % 5 === 0) {
        if (eq.fixo) {
          let label = observacoes[dataStr]?.[eq.fixo] || eq.fixo;
          box += `<div class="work" onclick="editarObs('${dataStr}','${eq.fixo}')" style="background:#003366;color:white; cursor:pointer;">${label}</div>`;
        }
        let ciclo = Math.floor(diasCorridos / 5) % 3;
        const rodizio = [
          [0, 1, 2],
          [1, 2, 0],
          [2, 0, 1],
        ];
        rodizio[ciclo].forEach(idx => {
          let nome = eq.rotativos[idx];
          if (nome) {
            let label = observacoes[dataStr]?.[nome] || nome;
            box += `<div class="work" onclick="editarObs('${dataStr}','${nome}')" style="background:#66b0ff;color:white; cursor:pointer;">${label}</div>`;
          }
        });
      }
    });

    // Lista nomes da equipe do dia (fixo + rotativos)
    let nomesEquipeDia = [];
    eqs.forEach(eq => {
      if (!eq.dataInicio) return;
      let diasCorridos = Math.floor((data - new Date(eq.dataInicio)) / (1000 * 60 * 60 * 24));
      if (diasCorridos < 0) return;
      if (diasCorridos % 5 === 0) {
        if (eq.fixo) nomesEquipeDia.push(eq.fixo);
        const ciclo = Math.floor(diasCorridos / 5) % 3;
        const rodizio = [
          [0, 1, 2],
          [1, 2, 0],
          [2, 0, 1],
        ];
        rodizio[ciclo].forEach(idx => {
          let nome = eq.rotativos[idx];
          if (nome) nomesEquipeDia.push(nome);
        });
      }
    });

    // Checar afastamentos e mostrar aviso
    afastamentos.forEach((af, idx) => {
      if (!eqs.some((eq, i) => i === af.equipe)) return;
      let dtInicio = new Date(af.inicio);
      let dtFim = new Date(af.fim);
      if (data >= dtInicio && data <= dtFim) {
        let nomeAf = af.membro === 'F' ? equipes[af.equipe].fixo : equipes[af.equipe].rotativos[parseInt(af.membro[1])];
        if (nomesEquipeDia.includes(nomeAf)) {
          box += `<div class="afastamento" onclick="editarAfastamento(${idx})" title="${af.tipo}">${nomeAf} ausente (${af.tipo})</div>`;
        }
      }
    });

    // Mostrar tarefas do dia
    tarefas.forEach((t, idx) => {
      if (t.data === dataStr) {
        box += `<div class="tarefa" onclick="editarTarefa(${idx})" title="${t.descricao}">${t.nome}</div>`;
      }
    });

    box += '</div>';
    html += box;
  }

  html += '</div>';
  document.getElementById('escala-container').innerHTML = html;
}

// ===== INICIALIZAÇÃO AO CARREGAR =====
window.onload = () => {
  fetch("https://seusite.com/api.php?acao=carregar")
    .then(res => res.json())
    .then(data => {
      if (!data || !data.equipes) return;
      equipes = JSON.parse(data.equipes);
      afastamentos = JSON.parse(data.afastamentos);
      feriados = JSON.parse(data.feriados);
      observacoes = JSON.parse(data.observacoes);
      tarefas = JSON.parse(data.tarefas);
      iniciar();
      console.log("Dados carregados do servidor!");
    })
    .catch(err => {
      console.error("Erro ao carregar da nuvem:", err);
      iniciar(); // continua offline
    });
};
