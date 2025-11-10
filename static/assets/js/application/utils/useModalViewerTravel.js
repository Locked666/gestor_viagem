export function openTravelViewModal(data) {
  try {
    // Faz requisição à API
    // const response = await fetch(
    //   `/api/v1/travel/get/${travelId}?calendar=${true}`
    // );

    // if (!response.ok || response.status === 404) {
    //   alert("Viagem não encontrada, possivelmente foi removida.");

    //   setInterval(() => {
    //     location.reload();
    //   }, 1000);
    //   return;
    // }

    // if (!response.ok) throw new Error("Erro ao buscar viagem.");

    // const result = await response.json();
    // if (!result.success)
    //   throw new Error(result.message || "Erro desconhecido.");

    const travel = data; // <- aqui pega o objeto real

    // Remove modal antigo se existir
    const oldModal = document.getElementById("viewTravelModal");
    if (oldModal) oldModal.remove();

    // Cria HTML do modal dinamicamente
    const modalHTML = `
  <div class="modal fade" id="viewTravelModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content shadow-lg rounded-3">
        
        <!-- Cabeçalho -->
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Detalhes da Viagem #${travel.id}</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
        </div>
        
        <!-- Corpo com abas -->
        <div class="modal-body">
          <!-- Nav Tabs -->
          <ul class="nav nav-tabs" id="travelTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="viagem-tab" data-bs-toggle="tab" data-bs-target="#viagem" type="button" role="tab" aria-controls="viagem" aria-selected="true">Viagem</button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tecnicos-tab" data-bs-toggle="tab" data-bs-target="#tecnicos" type="button" role="tab" aria-controls="tecnicos" aria-selected="false">Técnicos</button>
            </li>
          </ul>
          
          <!-- Conteúdo das Abas -->
          <div class="tab-content mt-3" id="travelTabsContent">
            
            <!-- Aba Viagem -->
            <div class="tab-pane fade show active" id="viagem" role="tabpanel" aria-labelledby="viagem-tab">
              <div class="mb-3"><strong>Destino:</strong> ${
                travel.entidade_destino || "-"
              }</div>
              <div class="row"> 
                <div class="col-md-6"> 
                  <div class="mb-3"><strong>Data de Início:</strong> ${
                    travel.data_inicio || "-"
                  }</div>

                </div>

                <div class="col-md-6"> 
                  <div class="mb-3"><strong>Data de Retorno:</strong> ${
                    travel.data_fim || "-"
                  }</div>

                </div>
              </div>
              <div class="mb-3"><strong>Tipo de Viagem:</strong> ${
                travel.tipo_viagem || "-"
              }</div>
              <div class="mb-3"><strong>Loca:</strong> ${
                travel.local_viagem || "-"
              }</div>
              <div class="mb-3"><strong>Status:</strong> ${
                travel.status || "-"
              }</div>
              <div class="mb-3">
                <strong>Descrição:</strong><br>
                <p class="border rounded p-2 bg-light">${
                  travel.descricao || "-"
                }</p>
              </div>
              
              
            </div>
            
            <!-- Aba Técnicos -->
            <div class="tab-pane fade" id="tecnicos" role="tabpanel" aria-labelledby="tecnicos-tab">
              <div class="table-responsive">
                <table class="table table-bordered align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>ID Usuário</th>
                      <th>Nome</th>
                      <th>Atributo</th>
                      <th>Relatório</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      travel.tecnicos && travel.tecnicos.length > 0
                        ? travel.tecnicos
                            .map(
                              (tec) => `
                          <tr>
                            <td>${tec.id_user}</td>
                            <td>${tec.username}</td>
                            <td class="text-center">
                              ${
                                tec.atribuito
                                  ? '<i class="material-symbols-rounded opacity-5">offline_pin</i>'
                                  : '<i class="material-symbols-rounded opacity-5">offline_pin_off</i>'
                              }
                            </td>
                            <td>${tec.relatorio || "-"}</td>
                          </tr>
                        `
                            )
                            .join("")
                        : `<tr><td colspan="4" class="text-center text-muted">Nenhum técnico vinculado.</td></tr>`
                    }
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
        
        <!-- Rodapé -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
          ${
            travel.status !== "Concluída" && travel.status !== "Cancelada"
              ? `<a href="/travel/edit?idTravel=${travel.id}" class="btn btn-success">Editar Viagem</a>`
              : ""
          }
        </div>
      </div>
    </div>
  </div>
`;

    // Injeta no body
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Inicializa e mostra modal
    const modal = new bootstrap.Modal(
      document.getElementById("viewTravelModal")
    );
    modal.show();
  } catch (error) {
    console.error("Erro:", error);
    alert("Não foi possível carregar os detalhes da viagem." + error.message);
  }
}
