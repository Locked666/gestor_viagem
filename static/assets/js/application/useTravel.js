import {
    putJSON,
    deleteJSON,
    funcShowLoader,
    funcHideLoader,
    postJSON,
  } from "./request.js";
import { autoComplete } from "./autoComplete.js";  


  // Inicializando autocomplete entidade
  

  document.addEventListener("DOMContentLoaded", function () {
    const tecnicoSelect = document.getElementById("tecnicoUser");
    const addBtn = document.getElementById("addTecnicoBtn");
    const addTodosBtn = document.getElementById("addTodosBtn");
    const removerTodosBtn = document.getElementById("removerTodosBtn");
    const tabelaTecnicos = document.getElementById("tabelaTecnicos");
  
    let tecnicosAdicionados = [];

    autoComplete("#entidade", "#entidade-id", "/api/v1/entidade");
  
    // Adiciona um técnico selecionado
    addBtn.addEventListener("click", () => {
      funcShowLoader();
      const selectedOption = tecnicoSelect.options[tecnicoSelect.selectedIndex];
      if (!selectedOption || selectedOption.value === "") {
        alert("Selecione um técnico válido.");
        funcHideLoader();
        return;
      }
  
      adicionarTecnico(selectedOption.value, selectedOption.text);
      tecnicoSelect.remove(tecnicoSelect.selectedIndex);
      funcHideLoader();
    });
  
    // Adiciona todos os técnicos do select
    addTodosBtn.addEventListener("click", () => {
        funcShowLoader();
      const options = Array.from(tecnicoSelect.options).filter(opt => opt.value !== "");
      if (options.length === 0) {
        funcHideLoader();
        return;

      } 
  
      options.forEach(opt => adicionarTecnico(opt.value, opt.text));
      tecnicoSelect.innerHTML = `<option value="" selected disabled>Selecione um Técnico</option>`;
      funcHideLoader();
    });
  
    // Remove todos os técnicos e devolve ao select
    removerTodosBtn.addEventListener("click", () => {
        funcShowLoader();
      tecnicosAdicionados.forEach(tecnico => {
        const opt = document.createElement("option");
        opt.value = tecnico.id;
        opt.text = tecnico.name;
        tecnicoSelect.appendChild(opt);
        
      });
  
      sortSelect(tecnicoSelect);
      tecnicosAdicionados = [];
      renderTabela();
      funcHideLoader();
    });
  
    // Adiciona técnico ao array e re-renderiza
    function adicionarTecnico(id, name) {
      if (tecnicosAdicionados.find(t => t.id === id)) return;
      tecnicosAdicionados.push({ id, name });
      renderTabela();
    }
  
    // Remove técnico individual da tabela e devolve ao select
    function removerTecnico(index) {
      const removido = tecnicosAdicionados.splice(index, 1)[0];
  
      const opt = document.createElement("option");
      opt.value = removido.id;
      opt.text = removido.name;
      tecnicoSelect.appendChild(opt);
      sortSelect(tecnicoSelect);
  
      renderTabela();
    }
  
    // Renderiza a tabela com os técnicos adicionados
    function renderTabela() {
      tabelaTecnicos.innerHTML = "";
  
      if (tecnicosAdicionados.length === 0) {
        tabelaTecnicos.innerHTML = `<tr><td colspan="2" class="text-center">Nenhum técnico adicionado</td></tr>`;
        return;
      }
  
      tecnicosAdicionados.forEach((tecnico, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${tecnico.name}</td>
          <td class="align-middle">
            <button class="btn btn-sm btn-outline-danger" data-index="${index}">
              <i class="material-symbols-rounded ">delete_forever</i>
            </button>
          </td>
        `;
        tabelaTecnicos.appendChild(row);
      });
  
      // Eventos de exclusão individual
      tabelaTecnicos.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", function () {
          const index = this.getAttribute("data-index");
          removerTecnico(index);
        });
      });
    }
  
    // Ordena as opções do select por nome
    function sortSelect(selectElement) {
      const options = Array.from(selectElement.options)
        .filter(opt => opt.value !== "")
        .sort((a, b) => a.text.localeCompare(b.text));
  
      const placeholder = selectElement.querySelector("option[value='']");
      selectElement.innerHTML = "";
      if (placeholder) selectElement.appendChild(placeholder);
      options.forEach(opt => selectElement.appendChild(opt));
    }
  
    // Exporta IDs selecionados
    window.getTecnicosSelecionados = function () {
      return tecnicosAdicionados.map(t => t.id);
    };
  });
  