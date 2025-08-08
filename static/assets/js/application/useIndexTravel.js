document.addEventListener("DOMContentLoaded", function () {
  const cardInfoTravel = document.querySelector(".card-info-travel");
  autoComplete("#entidade", "#entidade-id", "/api/v1/entidade");

  function redirectToEditTravel(travelId) {
    window.location.href = `/travel/edit/${travelId}`;
  }

  // Event delegation para garantir que funcione mesmo com novos elementos
  document.addEventListener("click", function (e) {
    const button = e.target.closest(".bnt-action");
    if (!button) return;

    const currentAction = button.getAttribute("data-action");
    const travelId = button.getAttribute("data-id");

    if (currentAction === "edit") {
      redirectToEditTravel(travelId);
    } else if (currentAction === "delete") {
      if (confirm("Tem certeza que deseja excluir esta viagem?")) {
        fetch(`/travel/delete/${travelId}`, { method: "DELETE" })
          .then((response) => {
            if (response.ok) {
              location.reload();
            } else {
              alert("Erro ao excluir a viagem.");
            }
          })
          .catch(() => alert("Erro na conexão com o servidor."));
      }
    }
  });
});
