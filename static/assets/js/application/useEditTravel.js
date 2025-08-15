import {
  postJSON,
  getJSON,
  putJSON,
  funcShowLoader,
  funcHideLoader,
  execToast,
} from "./request.js";
import { autoComplete } from "./autoComplete.js";
const urlAtual = new URL(window.location.href);
const viagemId = urlAtual.searchParams.get("idTravel");

// const modalEditTravel = new bootstrap.Modal(
//   document.getElementById("editTravelModal")
// );

let modalEditTravel = null;
const modalEl = document.getElementById("editTravelModal");

if (modalEl) {
  modalEditTravel = new bootstrap.Modal(modalEl);
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
    console.log(payloadtravel);
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
});
