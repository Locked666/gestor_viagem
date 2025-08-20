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
const urlAtual = new URL(window.location.href);
const viagemId = urlAtual.searchParams.get("idTravel");

let modalEditTravel = null;
const modalEl = document.getElementById("editTravelModal");

if (modalEl) {
  modalEditTravel = new bootstrap.Modal(modalEl);
}

// async function loadExpenseForTravel() {
//   const payloadLoadExpense = {
//     id_viagem: viagemId,
//     // ...(tecnicoUserEl && tecnicoUserEl.value.trim()
//     //   ? { id_tecnico: tecnicoUserEl.value.trim() }
//     //   : {}),
//   };
//   const responseLoadExpense = getJSON(
//     "/api/v1/expense/get",
//     payloadLoadExpense
//   );

//   console.table(responseLoadExpense);
// }

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
  const tecnicoUserEl = document.getElementById("tecnicoUser");

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
  clearUpDocumentExpense.value = "";
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

  const upDocumentExpense = document.getElementById("documentoUpload");

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
  };

  try {
    const response = await postJSON("/expense", payloadExpense);
    if (response.success) {
      atualizarTabelaGastos(payloadExpense, response.id, upDocumentExpense);
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

            <button class="btn btn-sm btn-action editar-gasto p-0" title="Editar" data-documento-id="{{ expense.documento_id }}">
              <span class="material-symbols-rounded">edit</span>
            </button>

            <button class="btn btn-sm btn-action excluir-gasto p-0" title="Excluir" data-documento-id="{{ expense.documento_id }}">
              <span class="material-symbols-rounded">delete</span>
            </button>

            ${
              uploadDocumento
                ? `
              <button class="btn btn-sm btn-action ver-documento p-0" title="Ver Documento" data-documento-id="{{ expense.documento_id }}">
                <span class="material-symbols-rounded">description</span>
              </button>
              `
                : ""
            }
          </div>  
        </td>

    `;
  tabelaGastos.appendChild(novaLinha);

  // Adicionar event listeners aos botões
  // novaLinha
  //   .querySelector(".visualizar-gasto")
  //   .addEventListener("click", () => visualizarGasto(idGasto));
  // novaLinha
  //   .querySelector(".editar-gasto")
  //   .addEventListener("click", () => editarGasto(idGasto));
  // novaLinha
  //   .querySelector(".excluir-gasto")
  //   .addEventListener("click", () => excluirGasto(idGasto));
  // if (novaLinha.querySelector(".ver-documento")) {
  //   novaLinha
  //     .querySelector(".ver-documento")
  //     .addEventListener("click", () =>
  //       verDocumento(uploadDocumento.documentoId)
  //     );
  // }
}

document.addEventListener("DOMContentLoaded", function () {
  const cardInfoTravel = document.querySelector(".card-info-travel");
  if (modalEl) {
    autoComplete("#entidade", "#entidade-id", "/api/v1/entidade");
    document
      .getElementById("btnEditarViagemModal")
      .addEventListener("click", async (e) => {
        e.preventDefault();
        await editTravel();
      });
  }

  document
    .getElementById("bnt-salvar-principal")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      await sendDataTravel();
    });
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
});
