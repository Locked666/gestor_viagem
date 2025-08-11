import { autoComplete } from "./autoComplete.js";
import { putJSON, deleteJSON, execToast } from "./request.js";

document.addEventListener("DOMContentLoaded", function () {
  const cardInfoTravel = document.querySelector(".card-info-travel");
  autoComplete("#entidade", "#entidade-id", "/api/v1/entidade");

  function redirectToEditTravel(travelId) {
    window.location.href = `/travel/edit?idTravel=${travelId}`;
  }
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
                }, 2000);
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
                alert(response.message || "Erro ao concluir a viagem.");
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
        window.location.href = `/travel/assign?idTravel=${travelId}`;
      }
    });
  });
});

// Event delegation para garantir que funcione mesmo com novos elementos
//   document.addEventListener("click", function (e) {
//     const button = e.target.closest(".bnt-action");
//     if (!button) return;

//     const currentAction = button.getAttribute("data-action");
//     const travelId = button.getAttribute("data-id");

//     if (currentAction === "edit") {
//       redirectToEditTravel(travelId);
//     } else if (currentAction === "delete") {
//       if (confirm("Tem certeza que deseja excluir esta viagem?")) {
//         fetch(`/travel/delete/${travelId}`, { method: "DELETE" })
//           .then((response) => {
//             if (response.ok) {
//               location.reload();
//             } else {
//               alert("Erro ao excluir a viagem.");
//             }
//           })
//           .catch(() => alert("Erro na conexão com o servidor."));
//       }
//     }
//   });
// });
