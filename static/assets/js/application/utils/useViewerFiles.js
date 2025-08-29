function getElementOrThrow(selector) {
  const el = document.getElementById(selector);
  if (!el) {
    throw new Error(`Elemento não encontrado: ${selector}`);
  }
  return el;
}

export async function verDocumento(documentoID) {
  const documentoModal = new bootstrap.Modal(
    getElementOrThrow("documentoModal")
  );
  const documentoViewer = getElementOrThrow("documentoViewer");
  const imagemViewer = getElementOrThrow("imagemViewer");
  const documentoLoader = getElementOrThrow("documentoLoader");
  const documentoFallback = getElementOrThrow("documentoFallback");
  const downloadDocumento = getElementOrThrow("downloadDocumento");
  const modalTitle = getElementOrThrow("documentoModalLabel");

  // Reset estados
  documentoViewer.classList.add("d-none");
  imagemViewer.classList.add("d-none");
  documentoFallback.classList.add("d-none");
  documentoLoader.classList.remove("d-none");
  modalTitle.textContent = "Carregando documento...";
  documentoModal.show();

  try {
    // 1. Buscar metadados
    const response = await fetch(`/api/v1/file/get/info/${documentoID}`);
    if (!response.ok) throw new Error("Documento não encontrado");

    const documentoInfo = await response.json();
    const documentoUrl = `/api/v1/file/get/${documentoID}`;
    const extensao = documentoInfo.extensao;

    // 2. Definir título
    modalTitle.textContent = `Documento #${documentoID}`;

    // 3. Mostrar de acordo com o tipo
    documentoLoader.classList.add("d-none");

    if (extensao === "pdf") {
      documentoViewer.src = documentoUrl;
      documentoViewer.classList.remove("d-none");
    } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(extensao)) {
      imagemViewer.src = documentoUrl;
      imagemViewer.classList.remove("d-none");
    } else {
      documentoFallback.classList.remove("d-none");
    }

    // 4. Configurar download
    downloadDocumento.href = documentoUrl;
    downloadDocumento.download = `documento_${documentoID}.${extensao}`;
  } catch (error) {
    console.error("Erro ao visualizar documento:", error);
    documentoLoader.classList.add("d-none");

    const modalBody = document.querySelector("#documentoModal .modal-body");
    modalBody.innerHTML = `
      <div class="alert alert-danger">
        Erro ao carregar documento:<br>
        ${error.message}
      </div>`;
  }
}
