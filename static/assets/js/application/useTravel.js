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
  const listaTecnicosSelecionados = document.getElementById(
    "listaTecnicosSelecionados"
  );
  const tecnicosEmptyState = document.getElementById("tecnicosEmptyState");
  const addBntSave = document.getElementById("bnt-salvar-principal");
  const stepButtons = Array.from(
    document.querySelectorAll("[data-step-target]")
  );
  const stepPanels = Array.from(
    document.querySelectorAll(".travel-stepper__panel")
  );
  const prevStepBtn = document.getElementById("travelStepperPrev");
  const nextStepBtn = document.getElementById("travelStepperNext");
  const reviewFields = {
    entidade: document.getElementById("reviewEntidade"),
    periodo: document.getElementById("reviewPeriodo"),
    tipoLocal: document.getElementById("reviewTipoLocal"),
    tecnicos: document.getElementById("reviewTecnicos"),
    tecnicosCount: document.getElementById("reviewTecnicosCount"),
    transporte: document.getElementById("reviewTransporte"),
    opcoes: document.getElementById("reviewOpcoes"),
    descricao: document.getElementById("reviewDescricao"),
  };

  window.tecnicosAdicionados = [];
  let currentStepIndex = 0;
  const hasTravelStepper = stepPanels.length > 0 && stepButtons.length > 0;

  autoComplete("#entidade", "#entidade-id", "/api/v1/entidade");

  function getStepIndexById(stepId) {
    return stepPanels.findIndex((panel) => panel.id === stepId);
  }

  function showStep(stepIndex) {
    if (!hasTravelStepper) return;

    const safeIndex = Math.max(0, Math.min(stepIndex, stepPanels.length - 1));
    currentStepIndex = safeIndex;

    stepPanels.forEach((panel, index) => {
      const isActive = index === currentStepIndex;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });

    stepButtons.forEach((button, index) => {
      const isActive = index === currentStepIndex;
      const isCompleted = index < currentStepIndex;
      button.classList.toggle("is-active", isActive);
      button.classList.toggle("is-complete", isCompleted);
      button.setAttribute("aria-selected", String(isActive));
    });

    if (prevStepBtn) prevStepBtn.disabled = currentStepIndex === 0;
    if (nextStepBtn) {
      nextStepBtn.classList.toggle(
        "d-none",
        currentStepIndex === stepPanels.length - 1
      );
    }
    if (addBntSave) {
      addBntSave.classList.toggle(
        "d-none",
        currentStepIndex !== stepPanels.length - 1
      );
    }

    updateReview();
  }

  function showValidation(message, focusElement = null) {
    execToast(message, "danger", "Erro", "Agora", "error");
    if (focusElement) focusElement.focus();
  }

  function validateDadosStep() {
    const entidadeIdInput = document.getElementById("entidade-id");
    const entidadeInput = document.getElementById("entidade");
    const dataSaidaInput = document.getElementById("dataSaida");
    const dataRetornoInput = document.getElementById("dataRetorno");
    const descricaoInput = document.getElementById("descricao");

    if (!entidadeIdInput.value) {
      showValidation(
        "Preencha todos os campos obrigatórios.\n Entidade",
        entidadeInput
      );
      return false;
    }

    if (!dataSaidaInput.value) {
      showValidation(
        "Preencha todos os campos obrigatórios.\n Data Saída",
        dataSaidaInput
      );
      return false;
    }

    if (!dataRetornoInput.value) {
      showValidation(
        "Preencha todos os campos obrigatórios.\n Data de Retorno",
        dataRetornoInput
      );
      return false;
    }

    if (!descricaoInput.value) {
      showValidation(
        "Preencha todos os campos obrigatórios.\n Descrição Viagem",
        descricaoInput
      );
      return false;
    }

    if (new Date(dataSaidaInput.value) > new Date(dataRetornoInput.value)) {
      showValidation(
        "A data de saída não pode ser maior que a data de retorno.",
        dataSaidaInput
      );
      return false;
    }

    return true;
  }

  function validateTecnicosStep() {
    if (getTecnicosSelecionados().length > 0) return true;

    showValidation("Preencha todos os campos obrigatórios.\n Técnicos");
    return false;
  }

  function validateStep(stepIndex) {
    const stepId = stepPanels[stepIndex]?.id;

    if (stepId === "dados") return validateDadosStep();
    if (stepId === "tecnicos") return validateTecnicosStep();

    return true;
  }

  function validateStepsUntil(targetStepIndex) {
    if (targetStepIndex <= currentStepIndex) return true;

    const startStepIndex = currentStepIndex;

    for (let index = startStepIndex; index < targetStepIndex; index += 1) {
      if (index !== currentStepIndex) showStep(index);
      if (!validateStep(index)) return false;
    }

    return true;
  }

  function validateAllSteps() {
    for (let index = 0; index < stepPanels.length; index += 1) {
      if (index !== currentStepIndex) showStep(index);
      if (validateStep(index)) continue;
      return false;
    }

    showStep(stepPanels.length - 1);
    return true;
  }

  function goToStep(targetStepIndex, shouldValidate = true) {
    if (targetStepIndex < 0 || targetStepIndex >= stepPanels.length) return;
    if (shouldValidate && !validateStepsUntil(targetStepIndex)) return;

    showStep(targetStepIndex);
  }

  function formatDateTime(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  }

  function getValueOrFallback(value, fallback = "Não informado") {
    const safeValue = String(value || "").trim();
    return safeValue || fallback;
  }

  function updateReview() {
    const entidade = document.getElementById("entidade")?.value;
    const dataSaida = document.getElementById("dataSaida")?.value;
    const dataRetorno = document.getElementById("dataRetorno")?.value;
    const tipoViagem = document.getElementById("tipoViagem")?.value;
    const localViagem = document.getElementById("localViagem")?.value;
    const descricao = document.getElementById("descricao")?.value;
    const veiculo = document.getElementById("veiculo")?.value;
    const placa = document.getElementById("placa")?.value;
    const kmInicial = document.getElementById("kmInicial")?.value;
    const checkEnviaEmail = document.getElementById("checkEnviaEmail")?.checked;
    const checkAllDay = document.getElementById("checkAllDay")?.checked;
    const tecnicosNames = tecnicosAdicionados.map((tecnico) => tecnico.name);
    const transporte = [
      veiculo && `Veículo: ${veiculo}`,
      placa && `Placa: ${placa}`,
      kmInicial && `KM inicial: ${kmInicial}`,
    ].filter(Boolean);
    const opcoes = [
      checkEnviaEmail ? "Enviar e-mail" : "Não enviar e-mail",
      checkAllDay ? "Dia todo" : "Horário definido",
    ];

    if (reviewFields.entidade) {
      reviewFields.entidade.textContent = getValueOrFallback(entidade);
    }

    if (reviewFields.periodo) {
      const periodo =
        dataSaida || dataRetorno
          ? `${formatDateTime(dataSaida) || "Sem saída"} até ${
              formatDateTime(dataRetorno) || "Sem retorno"
            }`
          : "Não informado";
      reviewFields.periodo.textContent = periodo;
    }

    if (reviewFields.tipoLocal) {
      reviewFields.tipoLocal.textContent = `${getValueOrFallback(
        tipoViagem
      )} / ${getValueOrFallback(localViagem)}`;
    }

    if (reviewFields.tecnicos) {
      reviewFields.tecnicos.textContent =
        tecnicosNames.length > 0
          ? tecnicosNames.join(", ")
          : "Nenhum técnico adicionado";
    }

    if (reviewFields.tecnicosCount) {
      reviewFields.tecnicosCount.textContent = `${tecnicosNames.length} selecionado${
        tecnicosNames.length === 1 ? "" : "s"
      }`;
    }

    if (reviewFields.transporte) {
      reviewFields.transporte.textContent =
        transporte.length > 0 ? transporte.join(" | ") : "Não informado";
    }

    if (reviewFields.opcoes) {
      reviewFields.opcoes.textContent = opcoes.join(" | ");
    }

    if (reviewFields.descricao) {
      reviewFields.descricao.textContent = getValueOrFallback(descricao);
    }
  }

  stepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetIndex = getStepIndexById(button.dataset.stepTarget);
      goToStep(targetIndex);
    });
  });

  if (prevStepBtn) {
    prevStepBtn.addEventListener("click", () => goToStep(currentStepIndex - 1));
  }

  if (nextStepBtn) {
    nextStepBtn.addEventListener("click", () => goToStep(currentStepIndex + 1));
  }

  [
    "entidade",
    "dataSaida",
    "dataRetorno",
    "tipoViagem",
    "localViagem",
    "descricao",
    "veiculo",
    "placa",
    "kmInicial",
    "checkEnviaEmail",
    "checkAllDay",
  ].forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.addEventListener("input", updateReview);
    field.addEventListener("change", updateReview);
  });

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
    if (!validateAllSteps()) return;

    funcShowLoader();
    updateReview();
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
    if (listaTecnicosSelecionados) listaTecnicosSelecionados.innerHTML = "";

    if (tecnicosAdicionados.length === 0) {
      tabelaTecnicos.innerHTML = `<tr><td colspan="2" class="text-center">Nenhum técnico adicionado</td></tr>`;
      if (tecnicosEmptyState) tecnicosEmptyState.hidden = false;
      updateReview();
      return;
    }

    if (tecnicosEmptyState) tecnicosEmptyState.hidden = true;

    tecnicosAdicionados.forEach((tecnico, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${tecnico.name}</td>
          <td class="align-middle text-centers">
            <a class="btn btn-link app-action-link px-3 mb-0" data-index="${index}">
              <i class="material-symbols-rounded me-2"
              
              >delete</i>
            </a>

          </td>
        `;
      tabelaTecnicos.appendChild(row);

      if (listaTecnicosSelecionados) {
        const item = document.createElement("div");
        item.className = "travel-technicians-member";
        item.innerHTML = `
          <div class="travel-technicians-member-avatar" aria-hidden="true">
            ${getInitials(tecnico.name)}
          </div>
          <div class="travel-technicians-member-body">
            <strong>${tecnico.name}</strong>
            <span>Técnico vinculado</span>
          </div>
          <button
            type="button"
            class="travel-technicians-member-remove"
            data-index="${index}"
            aria-label="Remover ${tecnico.name}"
          >
            <i class="material-symbols-rounded">close</i>
          </button>
        `;
        listaTecnicosSelecionados.appendChild(item);
      }
    });

    // Eventos de exclusão individual
    tabelaTecnicos.querySelectorAll("a").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        removerTecnico(index);
      });
    });

    if (listaTecnicosSelecionados) {
      listaTecnicosSelecionados
        .querySelectorAll(".travel-technicians-member-remove")
        .forEach((btn) => {
          btn.addEventListener("click", function () {
            const index = this.getAttribute("data-index");
            removerTecnico(index);
          });
        });
    }

    updateReview();
  }

  function getInitials(name) {
    return String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
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

  if (hasTravelStepper) showStep(0);

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
      document.getElementById("dataSaida").focus();
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
