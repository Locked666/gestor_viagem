import {
  postJSON,
  getJSON,
  putJSON,
  funcShowLoader,
  funcHideLoader,
  execToast,
  deleteJSON,
} from "./request.js";
import { formatarData } from "./useUtils.js";
import { autoComplete } from "./autoComplete.js";
import { useUploadFiles } from "./utils/useUploadFiles.js";
import { verDocumento } from "./utils/useViewerFiles.js";

const urlAtual = new URL(window.location.href);
const viagemId = urlAtual.searchParams.get("idTravel");
const VALOR_DIARIA = 35.0; // Valor fixo da diária

const debugStatus = true;

let modalEditTravel = null;
const modalEl = document.getElementById("editTravelModal");

if (modalEl) {
  modalEditTravel = new bootstrap.Modal(modalEl);
}

async function deleteLineForTableExpense(idGasto) {
  const linha = document.querySelector(`tr[data-gasto-id="${idGasto}"]`);
  if (linha) linha.remove();

  const tbody = document.getElementById("tabelaGastos");

  // Verifica se ainda restam linhas
  if (tbody.rows.length === 0) {
    const lineNew = tbody.insertRow();
    lineNew.innerHTML = `
      <td colspan="5" class="text-center">
        Nenhum gasto cadastrado
      </td>
    `;
  }
}

async function totalizerExpenseForTravel() {
  const tecnicoUserEl = document.getElementById("tecnicoUser");
  const totalGastoTotalizer = document.getElementById("totalGastos");
  const totalGastoEstornoTotalizer =
    document.getElementById("totalGastosEstorno");
  const url = `/api/v1/expense/get/totalizer?id_viagem=${viagemId}${
    tecnicoUserEl && tecnicoUserEl.value.trim()
      ? `&id_tecnico=${tecnicoUserEl.value.trim()}`
      : ""
  }`;

  try {
    const getResponseTotalizer = await getJSON(url);

    if (getResponseTotalizer.success) {
      totalGastoEstornoTotalizer.innerText = getResponseTotalizer.total_estorno;
      totalGastoTotalizer.innerText = getResponseTotalizer.total;
    }
  } catch (error) {}
}

async function excluirGasto(idGasto) {
  try {
    const payloadDeleteExpense = {
      id_gasto: idGasto,
    };
    const responseDeleteExpense = await deleteJSON(
      "/expense/delete",
      payloadDeleteExpense
    );

    if (responseDeleteExpense.success) {
      // Remove a linha da tabela
      deleteLineForTableExpense(idGasto);
      totalizerExpenseForTravel();
    }
  } catch (error) {}
}

async function reloadInfoTravel() {
  const travelId = viagemId;
  try {
    const response = await getJSON(`/api/v1/travel/get/${travelId}`);
    if (response.success) {
      // Preencher Modal com os dados atuais.
      document.getElementById("entidade").value =
        response.data.entidade_destino;
      document.getElementById("entidade-id").value = response.data.entidade_id;
      document.getElementById("dataSaida-modal").value = response.data_inicio;
      document.getElementById("tipo-travel").value = response.data.tipo_viagem;
      document.getElementById("status").value = response.data.status;
      document.getElementById("descricao").value = response.data.descricao;

      // Preencher Card com os dados atuais.
      document.getElementById("entidadeReadonly").value =
        response.data.entidade_destino;
      document.getElementById("data_inicio").value = response.data.data_inicio;

      document.getElementById("data_fim").value = response.data.data_fim;

      document.getElementById("tipo_viagem").value = response.data.tipo_viagem;
      document.getElementById("status").value = response.data.status;
      document.getElementById("descricao").innerText = response.data.descricao;
    } else {
      console.error(response.message || "Erro ao carregar os dados da viagem.");
    }
  } catch (error) {
    console.error("Erro ao carregar os dados da viagem." + error);
  }
}

async function editTravel() {
  const payload = {
    id_viagem: viagemId,
    entidade: document.getElementById("entidade").value.trim(),
    entidade_destino: document.getElementById("entidade-id").value.trim(),
    data_inicio: document.getElementById("dataSaida-modal").value.trim(),
    data_fim: document.getElementById("dataRetorno-modal").value.trim(),

    tipo_viagem: document.getElementById("tipo-travel").value,
    status: document.getElementById("status-modal").value,
    descricao: document.getElementById("descricao-modal").value.trim(),
  };

  funcShowLoader();

  try {
    const response = await putJSON("/api/v1/travel/edit", payload);
    funcHideLoader();

    if (response.success) {
      modalEditTravel.hide();
      setTimeout(() => {
        reloadInfoTravel();
      }, 2000);
    } else {
      execToast(response.message || "Erro ao editar a viagem.", "error");
    }
  } catch (error) {
    funcHideLoader();
    execToast("Erro na conexão com o servidor.", "error");
  }
}

async function sendDataTravel() {
  const tecnicoUserEl = document.getElementById("tecnicoUserSelectAdmin");
  const statusAtribuido = document.getElementById("statusAtribuido");

  if (document.getElementById("quantidadeDiarias").value.trim() === "") {
    execToast("Informe  a quantidade de diárias", "info");
    return;
  }

  const dataSaida = document.getElementById("dataSaida").value.trim();
  const dataRetorno = document.getElementById("dataRetorno").value.trim();

  if (dataSaida && dataRetorno) {
    const dtSaida = new Date(dataSaida);
    const dtRetorno = new Date(dataRetorno);
    if (dtRetorno < dtSaida) {
      execToast(
        "A data de retorno deve ser maior ou igual à data de saída.",
        "info"
      );
      funcHideLoader();
      return;
    }
  }

  const payloadtravel = {
    id_viagem: viagemId,
    data_saida: document.getElementById("dataSaida").value.trim(),
    data_retorno: document.getElementById("dataRetorno").value.trim(),
    codigo_relatorio: document.getElementById("codigoRelatorio").value.trim(),
    quantidade_diarias: document
      .getElementById("quantidadeDiarias")
      .value.trim(),
    valor_total: document.getElementById("valorDiaria").value.trim(),
    veiculo_utilizado: document.getElementById("veiculo").value.trim(),
    placa_veiculo: document.getElementById("placa").value.trim(),
    km_inical: document.getElementById("kmInicial").value.trim(),
    km_final: document.getElementById("kmFinal").value.trim(),
    ...(tecnicoUserEl && tecnicoUserEl.value.trim()
      ? { tecnico_user: tecnicoUserEl.value.trim() }
      : {}),
  };

  try {
    const response = await putJSON("/travel/edit", payloadtravel);
    funcShowLoader();

    if (response.success) {
      funcHideLoader();
      statusAtribuido.innerHTML = "";
      statusAtribuido.innerHTML = `
      <i class="material-symbols-rounded text-success me-2" title="Dados foram atribuitos">offline_pin</i>
      <span class="text-success ml-4"><strong>Atribuído</strong></Span>
      `;
    } else {
      funcHideLoader();
    }
  } catch (error) {
    console.log(error);
    funcHideLoader();
  }
}

function clearExpenseFields() {
  // Variáveis "clear"
  const clearTecnicoUserEl = document.getElementById("tecnicoUser");
  const clearTipoGasto = document.getElementById("tipoGasto");
  const clearNumeroDocumento = document.getElementById("numeroDocumento");
  const clearValorGasto = document.getElementById("valorGasto");
  const clearDescricaoGasto = document.getElementById("descricaoGasto");
  const clearDataGasto = document.getElementById("dataHoraGasto");
  const clearEstornoGasto = document.getElementById("estorno");
  const clearTipoDocumento = document.getElementById("tipoDocumento");
  const clearUpDocumentExpense = document.getElementById("documentoUpload");

  clearTecnicoUserEl.value = "";
  clearTipoGasto.value = "";
  clearNumeroDocumento.value = "";
  clearValorGasto.value = "";
  clearDescricaoGasto.value = "";
  clearDataGasto.value = "";
  clearEstornoGasto.checked = false;
  clearTipoDocumento.value = "Nota Fiscal";
  // clearUpDocumentExpense.value = "";
}
async function saveExpenseForFile() {
  try {
    const fileInput = document.getElementById("documentoUpload");
    // 1. Faz upload do documento e obtém o ID
    const documentoResponse = await useUploadFiles(viagemId, fileInput);

    if (!documentoResponse) {
      throw new Error("Erro ao fazer upload do documento");
    }
    console.log("ID do documento salvo:", documentoResponse);
    fileInput.value = ""; // Limpa o input após o upload
    return documentoResponse;
  } catch (error) {
    console.error("Erro completo:", error);
    execToast("Erro na conexão com o servidor." + error, "error");
  }
}

async function sendDataExpense() {
  const tecnicoUserEl = document.getElementById("tecnicoUser");
  const tipoGasto = document.getElementById("tipoGasto").value.trim();
  const numeroDocumento = document
    .getElementById("numeroDocumento")
    .value.trim();
  const valorGasto = document.getElementById("valorGasto").value.trim();
  const descricaoGasto = document.getElementById("descricaoGasto").value.trim();
  const dataGasto = document.getElementById("dataHoraGasto").value.trim();
  const estornoGasto = document.getElementById("estorno").checked;
  const tipoDocumento = document.getElementById("tipoDocumento").value.trim();

  if (tipoGasto === "") {
    execToast(
      "Tipo do Gasto Não pode estar Vazio",
      "info",
      "Aviso",
      "Agora",
      "error"
    );
    return;
  }
  if (valorGasto === "") {
    execToast(
      "Valor do Gasto Não pode estar Vazio",
      "info",
      "Aviso",
      "Agora",
      "error"
    );
    return;
  }
  if (descricaoGasto === "") {
    execToast(
      "Descriçao Não pode estar Vazio",
      "info",
      "Aviso",
      "Agora",
      "error"
    );
    return;
  }
  if (dataGasto === "") {
    execToast("Data Não pode estar Vazio", "info", "Aviso", "Agora", "error");
    return;
  }

  const upDocumentExpense =
    document.getElementById("documentoUpload").files.length > 0
      ? await saveExpenseForFile()
      : null; // ID do documento, se houver
  const documentoUploadId = (await upDocumentExpense)
    ? upDocumentExpense
    : null;

  const payloadExpense = {
    id_viagem: viagemId,
    ...(tecnicoUserEl && tecnicoUserEl.value.trim()
      ? { tecnico_user: tecnicoUserEl.value.trim() }
      : {}),
    tipo: tipoGasto,
    n_documento: numeroDocumento,
    tipo_documento: tipoDocumento,
    descricao: descricaoGasto,
    valor: valorGasto,
    status: "Pendente",
    data_gasto: dataGasto,
    estorno: estornoGasto,
    arquivo: await documentoUploadId,
  };

  try {
    const response = await postJSON("/expense", payloadExpense);
    if (response.success) {
      atualizarTabelaGastos(payloadExpense, response.id, documentoUploadId);
      funcHideLoader();
      clearExpenseFields();
    }
  } catch (error) {
    funcHideLoader();
  }
}

async function atualizarTabelaGastos(data, idGasto, uploadDocumento) {
  // Atualiza a tabela de gastos
  const tabelaGastos = document.getElementById("tabelaGastos");
  const novaLinha = tabelaGastos.insertRow();
  novaLinha.setAttribute("data-gasto-id", idGasto);
  if (tabelaGastos.querySelector('tr td[colspan="5"]')) {
    tabelaGastos.innerHTML = "";
  }

  // const vlrGasto = frmdata.get("valorGasto");
  novaLinha.innerHTML = `
        <td>${idGasto}</td>
        <td>${await formatarData(data.data_gasto)}</td>
        <td>${data.tipo}</td>
        <td>R$ ${Number(data.valor).toFixed(2)}</td>
        <td class="d-flex align-items-center gap-2">
          <div class="align-middle text-left text-sm p-0">
            <button class="btn btn-sm btn-action visualizar-gasto p-0" title="Visualizar" data-documento-id="{{ expense.documento_id }}">
              <span class="material-symbols-rounded">visibility</span>
            </button>

            <button class="btn btn-sm btn-action editar-gasto p-0" title="Editar">
              <span class="material-symbols-rounded">edit</span>
            </button>

            <button class="btn btn-sm btn-action excluir-gasto p-0" title="Excluir">
              <span class="material-symbols-rounded">delete</span>
            </button>

            ${
              uploadDocumento
                ? `
              <button class="btn btn-sm btn-action ver-documento p-0" title="Ver Documento" data-documento-id="${uploadDocumento}">
                <span class="material-symbols-rounded">description</span>
              </button>
              `
                : `<button class="btn btn-sm btn-action add-documento p-0" title="Adicione o Documento">
                    <span class="material-symbols-rounded">upload_file</span>
                  </button>
                `
            }
          </div>  
        </td>

    `;
  tabelaGastos.appendChild(novaLinha);
  totalizerExpenseForTravel();
  // window.location.reload();
}

function calcularDiasEDiaria() {
  const quantidadeDiarias = document.getElementById("quantidadeDiarias");
  const valorDiaria = document.getElementById("valorDiaria");

  if (quantidadeDiarias.value) {
    const diarias = parseInt(quantidadeDiarias.value);
    valorDiaria.value = `R$ ${(diarias * VALOR_DIARIA).toFixed(2)}`;
  }
}

async function sendDatafinace() {
  const tecnicoUserEl = document.getElementById("tecnicoUser");
  const dataLancamento = document.getElementById("dataLancamento");

  if (document.getElementById("tipoLancamento").value.trim() === "") {
    execToast(
      "Selecione o tipo do Lançamento",
      "info",
      "Aviso",
      "Agora",
      "error"
    );
    return;
  }

  const tipoLançamento =
    document.getElementById("tipoLancamento").value.trim() === "Débito"
      ? "D"
      : "C";
  const valorLancamento = document.getElementById("valorlancamento");
  const descricaoLancamento = document.getElementById("descricaoLancamento");

  if (dataLancamento.value.trim() === "") {
    execToast(
      "Data do Lançamento Não pode estar Vazio",
      "info",
      "Aviso",
      "Agora",
      "error"
    );
    return;
  }

  if (descricaoLancamento.value.trim() === "") {
    execToast(
      "Descricao do Lançamento Não pode estar Vazio",
      "info",
      "Aviso",
      "Agora",
      "error"
    );
    return;
  }

  if (valorLancamento.value.trim() === "") {
    execToast(
      "Valor do Lançamento Não pode estar Vazio ou ser zero",
      "info",
      "Aviso",
      "Agora",
      "error"
    );
    return;
  }

  const payLoadFinance = {
    id_viagem: viagemId,
    ...(tecnicoUserEl && tecnicoUserEl.value.trim()
      ? { tecnico_user: tecnicoUserEl.value.trim() }
      : {}),
    data_lancamento: dataLancamento.value.trim(),
    tipo: tipoLançamento,
    descricao: descricaoLancamento.value.trim(),
    valor: valorLancamento.value.trim(),
  };

  try {
    const response = await postJSON("/finance/travel/", payLoadFinance);

    if (response.success) {
      // limpar campos
      dataLancamento.value = "";
      descricaoLancamento.value = "";
      valorLancamento.value = "";
      console.log(response.data);
      creatLineForTableFinance(response.data);
      return;
    }
  } catch (error) {
    console.log(error);
    execToast("Erro na conexão com o servidor.", "error");
  }
}

function creatLineForTableFinance(data) {
  const tabelaFinanceiro = document.getElementById("tabelaFinanceiro");
  const novaLinha = tabelaFinanceiro.insertRow();
  novaLinha.setAttribute("data-movimento-id", data.id);
  if (tabelaFinanceiro.querySelector('tr td[colspan="5"]')) {
    tabelaFinanceiro.innerHTML = "";
  }
  novaLinha.innerHTML = `
        <td>${data.data_lancamento}</td>
        <td>${data.tipo}</td>
        <td>${data.descricao}</td>
        <td>${data.valor}</td>
        <td class="d-flex align-items-center gap-2">
          <div class="align-middle text-left text-sm p-0">
            <button class="btn btn-sm btn-action editar-movimento p-0" title="Editar">
              <span class="material-symbols-rounded">edit</span>
            </button>
            <button class="btn btn-sm btn-action excluir-movimento p-0" title="Excluir">
              <span class="material-symbols-rounded">delete</span>
            </button>
          </div>
        </td>
    `;
  tabelaFinanceiro.appendChild(novaLinha);
  // adicionar evento aos botoes
}

async function editarMovimentoFinance(idMovimento) {
  const linha = document.querySelector(
    `tr[data-movimento-id="${idMovimento}"]`
  );
  if (!linha) return;
  alert("Funcionalidade em desenvolvimento");
}
async function excluirMovimentoFinance(idMovimento) {
  try {
    const responseDeleteFinance = await deleteJSON(
      `/finance/travel/delete/${idMovimento}`
    );
    if (responseDeleteFinance.success) {
      const linha = document.querySelector(
        `tr[data-movimento-id="${idMovimento}"]`
      );
      if (linha) linha.remove();
      const tbody = document.getElementById("tabelaFinanceiro");
      // Verifica se ainda restam linhas
      if (tbody.rows.length === 0) {
        const lineNew = tbody.insertRow();
        lineNew.innerHTML = `
          <td colspan="5" class="text-center">
            Nenhum lançamento financeiro cadastrado
          </td>
        `;
      }
    }
  } catch (error) {}
}

function openModalAssingTech() {
  const assignModal = document.getElementById("assignTechnicalModal");
  if (assignModal) {
    // Preencher o campo hidden com o id da viagem
    const travelIdInput = assignModal.querySelector("#assign-travel-id");
    if (travelIdInput) {
      travelIdInput.value = viagemId;
    }
    // Abrir o modal usando Bootstrap
    const modalInstance = new bootstrap.Modal(assignModal);
    modalInstance.show();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const cardInfoTravel = document.querySelector(".card-info-travel");
  document
    .getElementById("quantidadeDiarias")
    .addEventListener("change", calcularDiasEDiaria);
  if (modalEl) {
    autoComplete("#entidade", "#entidade-id", "/api/v1/entidade");
    document
      .getElementById("btnEditarViagemModal")
      .addEventListener("click", async (e) => {
        e.preventDefault();
        await editTravel();
      });
  }

  // event lancar aba principal
  document
    .getElementById("bnt-salvar-principal")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      await sendDataTravel();
    });

  // event listener para o botao lancar financeiro
  document
    .getElementById("bnt-lancar-financeiro")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      await sendDatafinace();
    });

  //event button adicionar gasto
  document
    .getElementById("bntAddGasto")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      await sendDataExpense();
    });

  // Delegação de eventos para os botões da tabela
  document
    .getElementById("tabelaGastos")
    .addEventListener("click", function (event) {
      const target = event.target.closest("button"); // Garante que pegamos o botão e não o <span>
      if (!target) return;

      const linha = target.closest("tr");
      const idGasto = linha.getAttribute("data-gasto-id");

      if (target.classList.contains("visualizar-gasto")) {
        visualizarGasto(idGasto);
      } else if (target.classList.contains("editar-gasto")) {
        editarGasto(idGasto);
      } else if (target.classList.contains("excluir-gasto")) {
        excluirGasto(idGasto);
      } else if (target.classList.contains("ver-documento")) {
        // Se precisar passar o documento, você pode colocar um data-atributo no botão também
        const documentoId = target.getAttribute("data-documento-id");
        verDocumento(documentoId);
      }
    });

  // adicionar evento aos botoes da tabela financeiro
  document
    .getElementById("tabelaFinanceiro")
    .addEventListener("click", function (event) {
      const target = event.target.closest("button"); // Garante que pegamos o botão e não o <span>
      if (!target) return;
      const linha = target.closest("tr");
      const idMovimento = linha.getAttribute("data-movimento-id");
      if (target.classList.contains("editar-movimento")) {
        editarMovimentoFinance(idMovimento);
      } else if (target.classList.contains("excluir-movimento")) {
        excluirMovimentoFinance(idMovimento);
      }
    });
  document
    .getElementById("assingTechForTravel")
    .addEventListener("click", function (event) {
      openModalAssingTech();
    });
});
