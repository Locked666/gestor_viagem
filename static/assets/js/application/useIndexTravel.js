import { autoComplete } from "./autoComplete.js";
import { putJSON, deleteJSON, execToast, postJSON } from "./request.js";

// criar linha na tabela
async function creatNewLineTravel(travel) {
  const tableTravel = document.getElementById("tabela-lista-viagens");
  // if (tableTravel.querySelector("tr")) {
  //   tableTravel.innerHTML = "";
  // }

  const newLineTravel = tableTravel.insertRow();
  const isAdmin = travel.isAdmin;

  newLineTravel.innerHTML = `
  <tr>
    <!--ID-->
    <td>
      <div class="d-flex px-2 py-1">
        <div class="d-flex flex-column justify-content-center">
          <h6 class="mb-0 text-sm">${travel.id}</h6>
        </div>
      </div>
    </td>

    <!--Entidade-->  
    <td>
      <div class="d-flex px-2 py-1">
        <div class="d-flex flex-column justify-content-center">
          <h6 class="mb-0 text-sm">${travel.entidade_nome}</h6>
        </div>
      </div>
    </td>

    <!--Data de início-->
    <td>
      <p class="text-xs font-weight-bold mb-0">
        ${travel.data_inicio_convert}
      </p>
    </td>

    <!--Status-->
    <td>
      ${
        travel.status === "Agendada"
          ? `<span class="badge badge-sm bg-gradient-success">${travel.status}</span>`
          : travel.status === "Concluída"
          ? `<span class="badge badge-sm bg-gradient-info">${travel.status}</span>`
          : travel.status === "Cancelada"
          ? `<span class="badge badge-sm bg-gradient-danger">${travel.status}</span>`
          : travel.status === "Em Andamento"
          ? `<span class="badge badge-sm bg-gradient-warning">${travel.status}</span>`
          : `<span class="badge badge-sm bg-gradient-secondary">${travel.status}</span>`
      }
    </td>

    <!--Descrição-->
    <td class="align-middle text-left text-sm text-break" title="${
      travel.descricao
    }">
      <p class="text-xs font-weight-bold text-break mb-0" 
        style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${travel.descricao}
      </p>
    </td>

    <!--Ações-->
    <td class="align-middle text-left text-sm p-0">
      <div class="d-flex align-items-center gap-2">

        <!-- Botão Editar -->
        <i class="material-symbols-rounded bnt-action"
          href="javascript:;"
          data-action="edit"
          data-id="${travel.id}">
          edit
        </i>

        <!-- Botão Visualizar -->
        <i class="material-symbols-rounded bnt-action"
          href="javascript:;"
          data-action="viewer"
          data-id="${travel.id}">
          visibility
        </i>

        <!-- Botão Excluir -->
        ${
          travel.status === "Agendada" && isAdmin
            ? `
        <i class="material-symbols-rounded bnt-action"
          id="delete-travel"
          data-id="${travel.id}"
          href="javascript:;"
          data-action="delete">
          delete
        </i>`
            : ""
        }

        <!-- Dropdown -->
        <div class="dropdown">
          <a href="javascript:;" class="text-dark p-0 m-0" id="dropdownMenuButton${
            travel.id
          }" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fa fa-ellipsis-v text-xs m-0 p-0"></i>
          </a>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${
            travel.id
          }">
            ${
              travel.status === "Agendada"
                ? `
              <li>
                <a class="dropdown-item bnt-action" href="javascript:;" data-action="finish" data-id="${
                  travel.id
                }">
                  Concluir Viagem
                </a>
              </li>
              ${
                isAdmin
                  ? `
              <li>
                <a class="dropdown-item bnt-action" href="javascript:;" data-action="cancel" data-id="${travel.id}">
                  Cancelar
                </a>
              </li>`
                  : ""
              }`
                : ""
            }

            <li>
              <a class="dropdown-item bnt-action" href="javascript:;" data-action="assign" data-id="${
                travel.id
              }">
                Atribuir
              </a>
            </li>
            <li>
              <a class="dropdown-item bnt-action" href="javascript:;" data-action="resend" data-id="${
                travel.id
              }">
                Reenviar E-mail
              </a>
            </li>
          </ul>
        </div>

      </div>
    </td>
  </tr>
  `;
}

// limpar campos do filtro
function clearFieldFiltered() {
  document.getElementById("filtroDataInicio").value = "";
  document.getElementById("filtroDataFim").value = "";

  document.getElementById("filtroStatus").value = "todos";

  document.getElementById("entidade-id").value = "";

  document.getElementById("filtroConcluida").checked = false;
  document.getElementById("filtroCancelada").checked = false;

  document.getElementById("filtroDescricao").value = "";

  document.getElementById("entidade").value = "";
}

// Ao filtrar
async function getFilteredTravels() {
  const filterDateStart = document
    .getElementById("filtroDataInicio")
    .value.trim();
  const filterDateEnd = document.getElementById("filtroDataFim").value.trim();

  const filterStatusTravel = document
    .getElementById("filtroStatus")
    .value.trim();
  const filterEntityId = document.getElementById("entidade-id").value.trim();

  const filterCompleted = document.getElementById("filtroConcluida").checked;
  const filterCanceled = document.getElementById("filtroCancelada").checked;

  const filterMyTravel = document.getElementById("filtroMinhasViagens").checked;

  const filterDescription = document
    .getElementById("filtroDescricao")
    .value.trim();

  const payloadFiltered = {
    filter: true,
    filterCompleted: filterCompleted,
    filterCanceled: filterCanceled,
    filterMyTravel: filterMyTravel,

    ...(filterDateStart ? { filterDateStart: filterDateStart } : {}),

    ...(filterDateEnd ? { filterDateEnd: filterDateEnd } : {}),

    ...(filterStatusTravel ? { filterStatusTravel: filterStatusTravel } : {}),

    ...(filterEntityId ? { filterEntityId: filterEntityId } : {}),

    ...(filterDescription ? { filterDescription: filterDescription } : {}),
  };

  //  console.log(payloadFiltered);
  const responseFiltered = await postJSON("/travel", payloadFiltered);

  if (responseFiltered.success) {
    // console.log(responseFiltered.data);
    document.getElementById("tabela-lista-viagens").innerHTML = "";
    responseFiltered.data.forEach((e) => {
      creatNewLineTravel(e);
    });

    setActionForButton();
  }
}

function redirectToEditTravel(travelId) {
  window.location.href = `/travel/edit?idTravel=${travelId}`;
}

function setActionForButton() {
  document.querySelectorAll(".bnt-action").forEach((button) => {
    button.addEventListener("click", function () {
      const currentAction = button.getAttribute("data-action");
      const travelId = button.getAttribute("data-id");

      if (currentAction === "edit") {
        redirectToEditTravel(travelId);
      } else if (currentAction === "delete") {
        if (confirm("Tem certeza que deseja excluir esta viagem?")) {
          deleteJSON(`/api/v1/travel/delete/${travelId}`)
            .then((response) => {
              if (response.success) {
                setInterval(() => {
                  window.location.href = "/travel";
                }, 1000);
              } else {
                alert(response.message || "Erro ao excluir a viagem.");
              }
            })
            .catch(() => alert("Erro na conexão com o servidor."));
        }
      } else if (currentAction === "viewer") {
        alert("Visualização não implementada.");
      } else if (currentAction === "finish") {
        if (confirm("Tem certeza que deseja concluir esta viagem?")) {
          putJSON(`/api/v1/travel/finish/${travelId}`)
            .then((response) => {
              if (response.success) {
                setInterval(() => {
                  window.location.href = "/travel";
                }, 2000);
              } else {
                // alert(response.message || "Erro ao concluir a viagem.");
              }
            })
            .catch(() => alert("Erro na conexão com o servidor."));
        }
      } else if (currentAction === "cancel") {
        if (confirm("Tem certeza que deseja cancelar esta viagem?")) {
          putJSON(`/api/v1/travel/cancel/${travelId}`)
            .then((response) => {
              if (response.success) {
                setInterval(() => {
                  window.location.href = "/travel";
                }, 2000);
              } else {
                alert(response.message || "Erro ao cancelar a viagem.");
              }
            })
            .catch(() => alert("Erro na conexão com o servidor."));
        }
      } else if (currentAction === "assign") {
        // Abrir modal de atribuição de viagem
        const assignModal = document.getElementById("assignTechnicalModal");
        if (assignModal) {
          // Preencher o campo hidden com o id da viagem
          const travelIdInput = assignModal.querySelector("#assign-travel-id");
          if (travelIdInput) {
            travelIdInput.value = travelId;
          }
          // Abrir o modal usando Bootstrap
          const modalInstance = new bootstrap.Modal(assignModal);
          modalInstance.show();
        }
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const cardInfoTravel = document.querySelector(".card-info-travel");
  autoComplete("#entidade", "#entidade-id", "/api/v1/entidade");

  setActionForButton();

  document.getElementById("btnFiltrar").addEventListener("click", async (e) => {
    e.preventDefault();
    await getFilteredTravels();
  });

  document.getElementById("btnLimpar").addEventListener("click", async (e) => {
    e.preventDefault();
    clearFieldFiltered();
    await getFilteredTravels();
  });

  // Ao editar o campo da entidade verificar se esta vazio e limpar o input
  document.getElementById("entidade").addEventListener("change", async (e) => {
    e.preventDefault();
    if (document.getElementById("entidade").value.trim() === "") {
      document.getElementById("entidade-id").value = "";
    }
  });
});
