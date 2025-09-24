function formatDateBR(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2); // pega só os dois últimos dígitos
  return `${day}/${month}/${year}`;
}

function adjustEndDate(dateStr) {
  let date = new Date(dateStr);
  date.setDate(date.getDate() + 1); // subtrai 1 dia
  return date.toISOString().split("T")[0]; // mantém formato ISO (YYYY-MM-DD)
}

async function openTravelViewModal(travelId) {
  try {
    // Faz requisição à API
    const response = await fetch(
      `/api/v1/travel/get/${travelId}?calendar=${true}`
    );

    if (!response.ok || response.status === 404) {
      alert("Viagem não encontrada, possivelmente foi removida.");

      setInterval(() => {
        location.reload();
      }, 1000);
      return;
    }

    if (!response.ok) throw new Error("Erro ao buscar viagem.");

    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Erro desconhecido.");

    const travel = result.data; // <- aqui pega o objeto real

    // Remove modal antigo se existir
    const oldModal = document.getElementById("viewTravelModal");
    if (oldModal) oldModal.remove();

    // Cria HTML do modal dinamicamente
    const modalHTML = `
  <div class="modal fade" id="viewTravelModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content shadow-lg rounded-3">
        
        <!-- Cabeçalho -->
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Detalhes da Viagem #${travel.id}</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
        </div>
        
        <!-- Corpo com abas -->
        <div class="modal-body">
          <!-- Nav Tabs -->
          <ul class="nav nav-tabs" id="travelTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="viagem-tab" data-bs-toggle="tab" data-bs-target="#viagem" type="button" role="tab" aria-controls="viagem" aria-selected="true">Viagem</button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tecnicos-tab" data-bs-toggle="tab" data-bs-target="#tecnicos" type="button" role="tab" aria-controls="tecnicos" aria-selected="false">Técnicos</button>
            </li>
          </ul>
          
          <!-- Conteúdo das Abas -->
          <div class="tab-content mt-3" id="travelTabsContent">
            
            <!-- Aba Viagem -->
            <div class="tab-pane fade show active" id="viagem" role="tabpanel" aria-labelledby="viagem-tab">
              <div class="mb-3"><strong>Destino:</strong> ${
                travel.entidade_destino || "-"
              }</div>
              <div class="row"> 
                <div class="col-md-6"> 
                  <div class="mb-3"><strong>Data de Início:</strong> ${
                    travel.data_inicio || "-"
                  }</div>

                </div>

                <div class="col-md-6"> 
                  <div class="mb-3"><strong>Data de Retorno:</strong> ${
                    travel.data_fim || "-"
                  }</div>

                </div>
              </div>
              <div class="mb-3"><strong>Tipo de Viagem:</strong> ${
                travel.tipo_viagem || "-"
              }</div>
              <div class="mb-3"><strong>Status:</strong> ${
                travel.status || "-"
              }</div>
              <div class="mb-3">
                <strong>Descrição:</strong><br>
                <p class="border rounded p-2 bg-light">${
                  travel.descricao || "-"
                }</p>
              </div>
              
              
            </div>
            
            <!-- Aba Técnicos -->
            <div class="tab-pane fade" id="tecnicos" role="tabpanel" aria-labelledby="tecnicos-tab">
              <div class="table-responsive">
                <table class="table table-bordered align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>ID Usuário</th>
                      <th>Nome</th>
                      <th>Atributo</th>
                      <th>Relatório</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      travel.tecnicos && travel.tecnicos.length > 0
                        ? travel.tecnicos
                            .map(
                              (tec) => `
                          <tr>
                            <td>${tec.id_user}</td>
                            <td>${tec.username}</td>
                            <td class="text-center">
                              ${
                                tec.atribuito
                                  ? '<i class="material-symbols-rounded opacity-5">offline_pin</i>'
                                  : '<i class="material-symbols-rounded opacity-5">offline_pin_off</i>'
                              }
                            </td>
                            <td>${tec.relatorio || "-"}</td>
                          </tr>
                        `
                            )
                            .join("")
                        : `<tr><td colspan="4" class="text-center text-muted">Nenhum técnico vinculado.</td></tr>`
                    }
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
        
        <!-- Rodapé -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
          ${
            travel.status !== "Concluída" && travel.status !== "Cancelada"
              ? `<a href="/travel/edit?idTravel=${travel.id}" class="btn btn-success">Editar Viagem</a>`
              : ""
          }
        </div>
      </div>
    </div>
  </div>
`;

    // Injeta no body
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Inicializa e mostra modal
    const modal = new bootstrap.Modal(
      document.getElementById("viewTravelModal")
    );
    modal.show();
  } catch (error) {
    console.error("Erro:", error);
    alert("Não foi possível carregar os detalhes da viagem." + error.message);
  }
}

function openConfirmModal(start, end) {
  // Remove modal anterior se existir
  const oldModal = document.getElementById("confirmTravelModal");
  if (oldModal) oldModal.remove();

  const fixedStart = adjustEndDate(start);

  // Converte para formato brasileiro
  const startBR = formatDateBR(fixedStart);
  const endBR = formatDateBR(end);

  // Cria o HTML do modal via JS
  const modalHTML = `
    <div class="modal fade" id="confirmTravelModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar criação da viagem</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            Deseja criar a viagem <b>${startBR} a ${endBR}</b></b>?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Não</button>
            <button type="button" class="btn btn-primary" id="btnConfirmYes">Sim</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Insere no body
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Inicializa o modal do Bootstrap
  const modal = new bootstrap.Modal(
    document.getElementById("confirmTravelModal")
  );
  modal.show();

  // Adiciona evento ao botão "Sim"
  document.getElementById("btnConfirmYes").addEventListener("click", () => {
    window.location.href = `/travel/add?date_start=${start}&date_end=${end}`;
  });
}

function getFilterParams() {
  const filterScheduled = document.getElementById("filtro-agendada").checked;
  const filterInProgress = document.getElementById("filtro-andamento").checked;
  const filterCompleted = document.getElementById("filtro-concluida").checked;
  const filterCancelled = document.getElementById("filtro-cancelada").checked;

  return {
    filter: true,
    scheduled: filterScheduled,
    in_progress: filterInProgress,
    completed: filterCompleted,
    cancelled: filterCancelled,
  };
}

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const filterCheckboxes = document.querySelectorAll(
    '#panel-left-calendar-filters input[type="checkbox"]'
  );

  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const filters = getFilterParams();
      console.log("Filtros aplicados:", filters);
      calendar.setOption("events", {
        url: "/api/v1/events/get",
        method: "GET",
        extraParams: filters,
      });
      calendar.refetchEvents();
    });
  });

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth", // mês por padrão
    themeSystem: "bootstrap5", // usa Bootstrap
    locale: "pt-br", // localização em português

    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
    },

    events: "/api/v1/events/get", // rota Flask que retorna os eventos em JSON
    selectable: true,
    select: function (info) {
      // exemplo: abrir modal Bootstrap para cadastrar evento
      openConfirmModal(info.startStr, info.endStr);
    },
    eventClick: function (info) {
      console.log(info.event);
      openTravelViewModal(info.event.id);
      // alert(`Evento: ${info.event.title}`);
    },
  });
  calendar.setOption("locale", "pt-br");

  calendar.render();
});
