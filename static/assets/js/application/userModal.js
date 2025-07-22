// userModal.js

import {
  putJSON,
  funcShowLoader,
  funcHideLoader,
  postJSON,
} from "./request.js";

funcShowLoader();

document.addEventListener("DOMContentLoaded", () => {
  const modal = new bootstrap.Modal(document.getElementById("userModal"));
  const form = document.getElementById("userEditForm");
  let currentAction = "create"; // Padrão POST

  document.querySelectorAll(".btn-view-user").forEach((button) => {
    button.addEventListener("click", () => {
      currentAction = button.getAttribute("data-action");
      if (currentAction === "edit") {
        document.getElementById("userModalLabel").textContent =
          "Editar Usuário";
        document.getElementById("userIdInput").value =
          button.getAttribute("data-id");
        document.getElementById("userNameInput").value =
          button.getAttribute("data-name");
        document.getElementById("userEmailInput").value =
          button.getAttribute("data-email");
        document.getElementById("userSetorSelect").value =
          button.getAttribute("data-setor");
        document.getElementById("userStatusCheckbox").checked =
          button.getAttribute("data-status") === "Ativo";
        document.getElementById("userDiariaCheckbox").checked =
          button.getAttribute("data-diaria") === "Sim";
        document.getElementById("userAdminCheckbox").checked =
          button.getAttribute("data-admin") === "Sim";
      } else {
        form.reset();
        document.getElementById("userModalLabel").textContent =
          "Adicionar Usuário";
        document.getElementById("userIdInput").value = "";
      }
      modal.show();
    });
  });

  funcHideLoader();

  document
    .getElementById("userEditForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);
      const jsonData = {};

      formData.forEach((value, key) => {
        const field = form.elements[key];
        jsonData[key] =
          field && field.type === "checkbox" ? field.checked : value;
        console.log(field);
        console.log(field.key);
        console.log(field.type);
        console.log(field.checked);
      });

      var result = "";

      console.log(jsonData);
      if (currentAction === "edit") {
        var result = await putJSON("/users", jsonData);
      } else {
        var result = await postJSON("/users", jsonData);
      }

      if (result.success) {
        modal.hide();
        document.getElementById("userEditForm").reset();

        setInterval(() => {
          location.reload();
        }, 1000);
      } else {
        modal.hide();
        document.getElementById("userEditForm").reset();
      }
      // Toast já será exibido automaticamente
    });
});
