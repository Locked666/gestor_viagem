import toast from "./menssageToast.js";

// Utilitários para exibir e esconder o loader
const showLoader = function showLoader() {
  document.getElementById("globalLoader")?.classList.remove("d-none");
};
const hideLoader = function hideLoader() {
  document.getElementById("globalLoader")?.classList.add("d-none");
};

// Função genérica para requisições HTTP JSON com loader e toast
async function request(method, url, data = null) {
  try {
    showLoader();

    const options = {
      method: method,
      headers: { "Content-Type": "application/json" },
    };

    if (data) options.body = JSON.stringify(data);

    const response = await fetch(url, options);
    const result = await response.json();

    if (result.success) {
      toast(
        result.message || "Operação realizada com sucesso",
        "success",
        "Sucesso",
        "Agora",
        "check_circle"
      );
    } else {
      toast(
        result.message || "Erro ao processar a operação",
        "danger",
        "Erro",
        "Agora",
        "error"
      );
    }

    return result;
  } catch (error) {
    console.error("Erro:", error);
    toast("Erro de conexão com o servidor", "danger", "Erro", "Agora", "error");
    return { success: false, message: "Erro na requisição" };
  } finally {
    hideLoader();
  }
}

// Exports reutilizáveis
export const getJSON = (url) => request("GET", url);
export const postJSON = (url, data) => request("POST", url, data);
export const putJSON = (url, data) => request("PUT", url, data);
export const deleteJSON = (url, data) => request("DELETE", url, data);
export const funcShowLoader = showLoader;
export const funcHideLoader = hideLoader;
