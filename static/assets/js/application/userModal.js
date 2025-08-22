// userModal.js

import {
  putJSON,
  deleteJSON,
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
      });

      var result = "";

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

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("#delete-user").forEach((button) => {
    button.addEventListener("click", async function () {
      const userId = this.getAttribute("data-id");

      if (!userId) {
        console.error("ID do usuário não encontrado.");
        return;
      }

      const confirmDelete = confirm(
        "Tem certeza que deseja excluir este usuário?"
      );
      if (!confirmDelete) return;

      const payload = {
        user_id: userId,
      };

      const deleteUserP = await deleteJSON("/users", payload);
      if (deleteUserP.success) {
        setInterval(() => {
          location.reload();
        }, 1000);
      } else {
        return;
      }
    });
  });

  document.querySelectorAll("#reset-for-password").forEach((button) => {
    button.addEventListener("click", async function () {
      const userId = this.getAttribute("data-id");

      if (!userId) {
        console.error("ID do usuário não encontrado.");
        return;
      }

      const confirmDelete = confirm("Deseja Reiniciar a senha desse usuário ?");
      if (!confirmDelete) return;

      const payload = {
        user_id: userId,
      };

      const deleteUserP = await putJSON("/users/reset_password/key", payload);
      if (deleteUserP.success) {
      } else {
        return;
      }
    });
  });
});
funcHideLoader();

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("passwordChangeForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmNewPassword =
        document.getElementById("confirmNewPassword").value;

      if (newPassword !== confirmNewPassword) {
        alert("As senhas não coincidem.");
        return;
      }

      const payload = {
        current_password: currentPassword,
        new_password: newPassword,
      };

      const resetPasswordRequest = await putJSON(
        "/users/reset_password",
        payload
      );

      if (resetPasswordRequest.success) {
        document.getElementById("passwordChangeForm").reset();
        setInterval(() => {
          location.reload();
        }, 1000);
      }
    });
});
