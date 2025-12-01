import {
  postJSON,
  funcShowLoader,
  funcHideLoader,
  execToast,
} from "./request.js";
import { autoComplete } from "./autoComplete.js";

// Inicializando autocomplete entidade

document.addEventListener("DOMContentLoaded", function () {
  const tecnicoSelect = document.getElementById("tecnicoUser");
  const addBtn = document.getElementById("addTecnicoBtn");
  const addTodosBtn = document.getElementById("addTodosBtn");
  const removerTodosBtn = document.getElementById("removerTodosBtn");
  const tabelaTecnicos = document.getElementById("tabelaTecnicos");
  const addBntSave = document.getElementById("bnt-salvar-principal");

  window.tecnicosAdicionados = [];

  autoComplete("#entidade", "#entidade-id", "/api/v1/entidade");

  // Adiciona um técnico selecionado
  addBtn.addEventListener("click", () => {
    funcShowLoader();
    const selectedOption = tecnicoSelect.options[tecnicoSelect.selectedIndex];
    if (!selectedOption || selectedOption.value === "") {
      alert("Selecione um técnico válido.");
      funcHideLoader();
      return;
    }

    adicionarTecnico(selectedOption.value, selectedOption.text);
    tecnicoSelect.remove(tecnicoSelect.selectedIndex);
    funcHideLoader();
  });

  // Adiciona todos os técnicos do select
  addTodosBtn.addEventListener("click", () => {
    funcShowLoader();
    const options = Array.from(tecnicoSelect.options).filter(
      (opt) => opt.value !== ""
    );
    if (options.length === 0) {
      funcHideLoader();
      return;
    }

    options.forEach((opt) => adicionarTecnico(opt.value, opt.text));
    tecnicoSelect.innerHTML = `<option value="" selected disabled>Selecione um Técnico</option>`;
    funcHideLoader();
  });

  // Remove todos os técnicos e devolve ao select
  removerTodosBtn.addEventListener("click", () => {
    funcShowLoader();
    tecnicosAdicionados.forEach((tecnico) => {
      const opt = document.createElement("option");
      opt.value = tecnico.id;
      opt.text = tecnico.name;
      tecnicoSelect.appendChild(opt);
    });

    sortSelect(tecnicoSelect);
    tecnicosAdicionados = [];
    renderTabela();
    funcHideLoader();
  });

  // Adicionar evento de salvar
  addBntSave.addEventListener("click", async () => {
    funcShowLoader();
    await postData();
    funcHideLoader();
  });

  // Adiciona técnico ao array e re-renderiza
  function adicionarTecnico(id, name) {
    if (tecnicosAdicionados.find((t) => t.id === id)) return;
    tecnicosAdicionados.push({ id, name });
    renderTabela();
  }

  // Remove técnico individual da tabela e devolve ao select
  function removerTecnico(index) {
    const removido = tecnicosAdicionados.splice(index, 1)[0];

    const opt = document.createElement("option");
    opt.value = removido.id;
    opt.text = removido.name;
    tecnicoSelect.appendChild(opt);
    sortSelect(tecnicoSelect);

    renderTabela();
  }

  // Renderiza a tabela com os técnicos adicionados
  function renderTabela() {
    tabelaTecnicos.innerHTML = "";

    if (tecnicosAdicionados.length === 0) {
      tabelaTecnicos.innerHTML = `<tr><td colspan="2" class="text-center">Nenhum técnico adicionado</td></tr>`;
      return;
    }

    tecnicosAdicionados.forEach((tecnico, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${tecnico.name}</td>
          <td class="align-middle text-centers">
            <a class="btn btn-link text-dark px-3 mb-0 " data-index="${index}">
              <i class="material-symbols-rounded me-2"
              
              >delete</i>
            </a>

          </td>
        `;
      tabelaTecnicos.appendChild(row);
    });

    // Eventos de exclusão individual
    tabelaTecnicos.querySelectorAll("a").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        removerTecnico(index);
      });
    });
  }

  // Ordena as opções do select por nome
  function sortSelect(selectElement) {
    const options = Array.from(selectElement.options)
      .filter((opt) => opt.value !== "")
      .sort((a, b) => a.text.localeCompare(b.text));

    const placeholder = selectElement.querySelector("option[value='']");
    selectElement.innerHTML = "";
    if (placeholder) selectElement.appendChild(placeholder);
    options.forEach((opt) => selectElement.appendChild(opt));
  }

  // Exporta IDs selecionados
  window.getTecnicosSelecionados = function () {
    return tecnicosAdicionados.map((t) => t.id);
  };

  // Envia Dados para o Servidor
  async function postData() {
    //funcShowLoader();
    const entidadeId = document.getElementById("entidade-id").value;
    const tecnicosId = getTecnicosSelecionados();
    const dataSaida = document.getElementById("dataSaida").value;
    const dataRetorno = document.getElementById("dataRetorno").value;
    const tipoViagem = document.getElementById("tipoViagem").value;
    const localViagem = document.getElementById("localViagem").value;
    const descricaoViagem = document.getElementById("descricao").value;
    const checkEnviaEmail = document.getElementById("checkEnviaEmail").checked;
    const checkAllDay = document.getElementById("checkAllDay").checked;
    const tabTecnicosSelect = document.getElementById("tecnicoUser-tab");

    // Validação da Entidade
    if (!entidadeId) {
      execToast(
        "Preencha todos os campos obrigatórios.\n Entidade",
        "danger",
        "Erro",
        "Agora",
        "error"
      );
      return;
    }

    // Validação da técnicos
    if (tecnicosId.length === 0) {
      execToast(
        "Preencha todos os campos obrigatórios.\n Técnicos",
        "danger",
        "Erro",
        "Agora",
        "error"
      );
      tabTecnicosSelect.click();
      return;
    }
    // Validação da Data de Sáida
    if (!dataSaida) {
      execToast(
        "Preencha todos os campos obrigatórios.\n Data Sáida",
        "danger",
        "Erro",
        "Agora",
        "error"
      );
      document.getElementById("dataSaida").focus();
      return;
    }
    if (!dataRetorno) {
      execToast(
        "Preencha todos os campos obrigatórios.\n Data de Retorno",
        "danger",
        "Erro",
        "Agora",
        "error"
      );
      document.getElementById("dataSaida").focus();
      return;
    }

    if (!descricaoViagem) {
      execToast(
        "Preencha todos os campos obrigatórios.\n Descrição Viagem ",
        "danger",
        "Warning",
        "Agora",
        "error"
      );
      return;
    }

    if (new Date(dataSaida) > new Date(dataRetorno)) {
      execToast(
        "A data de saída não pode ser maior que a data de retorno.",
        "danger",
        "Erro",
        "Agora",
        "error"
      );
      return;
    }

    const payloadData = {
      entidade_id: entidadeId,
      tecnicos: tecnicosId,
      data_saida: dataSaida,
      tipo_viagem: tipoViagem,
      local_viagem: localViagem,
      descricao: descricaoViagem,
      envia_email: checkEnviaEmail,
      data_retorno: dataRetorno,
      dia_todo: checkAllDay,
    };
    console.log("Payload enviado:", payloadData);
    const sendDataPost = await postJSON("/travel/add", payloadData);

    if (sendDataPost.success) {
      addBntSave.setAttribute("disabled", "true");
      setTimeout(() => {
        window.location.href = `/travel/edit?idTravel=${sendDataPost.id}`;
      }, 1000);
    }
  }
});
