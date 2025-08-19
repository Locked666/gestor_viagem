export function formatarData(dataISO) {
  try {
    const data = new Date(dataISO);

    if (isNaN(data.getTime())) {
      throw new Error("Data inválida");
    }

    const formato = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return formato.format(data).replace(",", "");
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida";
  }
}
