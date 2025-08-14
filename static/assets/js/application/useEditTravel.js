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
const modalEditTravel = new bootstrap.Modal(
  document.getElementById("editTravelModal")
);

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

document.addEventListener("DOMContentLoaded", function () {
  const cardInfoTravel = document.querySelector(".card-info-travel");

  autoComplete("#entidade", "#entidade-id", "/api/v1/entidade");

  document
    .getElementById("btnEditarViagemModal")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      await editTravel();
    });
});
