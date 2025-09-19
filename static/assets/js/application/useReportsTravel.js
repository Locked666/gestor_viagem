import {
  postJSON,
  getJSON,
  putJSON,
  funcShowLoader,
  funcHideLoader,
  execToast,
  deleteJSON,
} from "./request.js";

var instaceButton = "";

function showReportModal(htmlContent) {
  document.getElementById("modalReportContent").innerHTML = htmlContent;
  const modal = new bootstrap.Modal(document.getElementById("reportModal"));
  modal.show();
}

function printReport() {
  const style = document.createElement("style");
  style.innerHTML = `
    @media print {
      @page {
        margin: 0;
        size: A4 landscape;
      }

      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
      }

      body * {
        visibility: hidden !important;
      }

      #modalReportContent, #modalReportContent * {
        visibility: visible !important;
      }

      #modalReportContent {
        position: fixed !important;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100% !important;
        height: 100% !important;
        margin: 5 !important;
        padding: 5 !important;
        box-sizing: border-box !important;
        background: white !important;
      }

      /* Elimina padding lateral se estiver usando Bootstrap container */
      .container, .container-fluid, .row {
        padding-left: 2 !important;
        padding-right: 2 !important;
        margin-left: 2 !important;
        margin-right: 2 !important;
        max-width: 100% !important;
      }
    }
  `;
  document.head.appendChild(style);

  window.print();

  setTimeout(() => {
    document.head.removeChild(style);
  }, 1000);
}

async function saveReportAsPDF() {
  const element = document.getElementById("modalReportContent");
  const opt = {
    margin: 0, // Zero margem
    filename: "relatorio.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
    },
    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "landscape",
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  html2pdf().set(opt).from(element).save();
  funcHideLoader();
}

function saveReport() {
  const content = document.getElementById("modalReportContent").innerHTML;
  const blob = new Blob([content], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  console.log("cliquei no save report");
  const a = document.createElement("a");
  a.href = url;
  a.download = "relatorio.html";
  a.click();

  URL.revokeObjectURL(url);
}

// function setEventForButtons() {
//   const bntPrintReport = document.getElementById("bntSaveReport");
//   const bntSaveReport = document.getElementById("bntSaveReport");

//   bntPrintReport.addEventListener("click", (e) => {
//     e.preventDefault();
//     printReport();
//   });

//   bntSaveReport.addEventListener("click", (e) => {
//     e.preventDefault();
//     saveReportAsPDF();
//   });
// }

async function getParamsFilter(s) {
  //...(filterDateStart ? { filterDateStart: filterDateStart } : {}),

  const filtroCompetencias = document.getElementById("filtroCompetencias");
  const filtroDataInicio = document.getElementById("filtroDataInicio");
  const filtroDataFim = document.getElementById("filtroDataFim");
  const filtroUser = document.getElementById("filtroUser");

  const payLoadFilter = {
    reportRequest: s,
    ...(filtroCompetencias
      ? { filtroCompetencias: filtroCompetencias.value.trim() }
      : {}),
    ...(filtroDataInicio.value.trim()
      ? { filtroDataInicio: filtroDataInicio.value.trim() }
      : {}),
    ...(filtroDataFim.value.trim()
      ? { filtroDataFim: filtroDataFim.value.trim() }
      : {}),
    ...(filtroUser ? { filtroUser: filtroUser.value.trim() } : {}),
  };

  console.log(payLoadFilter);

  const responseReports = await postJSON("/reports/travel", payLoadFilter);
  if (responseReports.success) {
    // console.log(responseReports.data);
    showReportModal(responseReports.data);
    // setEventForButtons();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const infoModal = document.getElementById("infoModal");
  const modalEl = document.getElementById("modal-filter");

  const bntPrintReport = document.getElementById("bntPrintReport");
  const bntSaveReport = document.getElementById("bntSaveReport");

  bntPrintReport.addEventListener("click", (e) => {
    e.preventDefault();
    printReport();
  });

  bntSaveReport.addEventListener("click", (e) => {
    e.preventDefault();
    funcShowLoader();
    saveReportAsPDF();
  });

  modalEl.addEventListener("show.bs.modal", function (event) {
    // O botão que acionou o modal
    const button = event.relatedTarget;

    // Exemplo: usar um atributo data-source para diferenciar
    const source = button.getAttribute("data-source");

    modalEl.setAttribute("source", source);

    // console.log("Modal aberto pelo botão:", source);
  });

  document
    .getElementById("filtroCompetencias")
    .addEventListener("change", (e) => {
      e.preventDefault();
      document.getElementById("filtroDataInicio").value = "";
      document.getElementById("filtroDataFim").value = "";
    });
  document
    .getElementById("filtroDataInicio")
    .addEventListener("change", (e) => {
      e.preventDefault();
      document.getElementById("filtroCompetencias").value = 0;
      if (document.getElementById("filtroDataFim").value === "") {
        document.getElementById("filtroDataFim").value = document
          .getElementById("filtroDataInicio")
          .value.trim();
      }
    });
  document.getElementById("filtroDataFim").addEventListener("change", (e) => {
    e.preventDefault();
    document.getElementById("filtroCompetencias").value = 0;

    if (document.getElementById("filtroDataInicio").value === "") {
      document.getElementById("filtroDataInicio").value = document
        .getElementById("filtroDataFim")
        .value.trim();
    }
  });

  document
    .getElementById("bntImprimirModal")
    .addEventListener("click", async (e) => {
      e.preventDefault();

      if (
        document.getElementById("filtroCompetencias").value.trim() === "0" &&
        document.getElementById("filtroDataInicio").value.trim() === ""
      ) {
        execToast(
          "Selecione uma Data ou competencia.",
          "Data e competencia Vazia"
        );

        infoModal.innerText = "Selecione uma Data ou competencia.";
        infoModal.hidden = false;

        return;
      } else {
        infoModal.innerText = "";
        infoModal.hidden = true;

        const infSourceModal = modalEl.getAttribute("source");

        await getParamsFilter(infSourceModal);
      }
    });
});
