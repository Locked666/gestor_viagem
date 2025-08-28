export async function useUploadFiles(viagemId, fileInput) {
  try {
    // Verifica se há arquivo selecionado
    if (!fileInput.files || fileInput.files.length === 0) {
      throw new Error("Nenhum arquivo selecionado");
    }

    const arquivo = fileInput.files[0];

    // Valida o tipo do arquivo (opcional)
    const tiposPermitidos = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!tiposPermitidos.includes(arquivo.type)) {
      throw new Error("Tipo de arquivo não permitido. Use PDF, JPEG ou PNG");
    }

    // Cria FormData para envio multipart
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("viagemId", viagemId);
    formData.append(
      "tipoDocumento",
      document.getElementById("tipoDocumento").value
    );
    // Faz o POST manualmente (não via postJSON, pois precisa ser multipart)
    const response = await fetch("/api/v1/upload", {
      method: "POST",
      body: formData, // ⚡ multipart/form-data
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Erro no upload");
    }

    return data.documentoId; // Retorna o ID do documento salvo
  } catch (error) {
    console.error("Erro no upload:", error);
    throw error;
  }
}
