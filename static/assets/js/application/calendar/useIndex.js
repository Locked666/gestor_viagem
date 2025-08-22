// import {
//   getJSON,
//   putJSON,
//   postJSON,
//   funcHideLoader,
//   funcShowLoader,
// } from "../request";
// import { autoComplete } from "../autoComplete";

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
            Deseja criar a viagem <b>${startBR}</b></b>?
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
    window.location.href = `/travel/add?date_start=${start}`;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth", // mês por padrão
    themeSystem: "bootstrap5", // usa Bootstrap
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
      alert(`Evento: ${info.event.title}`);
    },
  });
  calendar.setOption("locale", "pt-br");

  calendar.render();
});
