import {
  postJSON,
  getJSON,
  putJSON,
  funcShowLoader,
  funcHideLoader,
  execToast,
  deleteJSON,
} from "./request.js";


var instaceButton = ""


async function getParamsFilter(s) {
    
    //...(filterDateStart ? { filterDateStart: filterDateStart } : {}),

    const filtroCompetencias = document.getElementById('filtroCompetencias')
    const filtroDataInicio = document.getElementById('filtroDataInicio')
    const filtroDataFim = document.getElementById('filtroDataFim')
    const filtroUser = document.getElementById('filtroUser')

    const payLoadFilter =  {
        reportRequest: s, 
        ...(filtroCompetencias ? { filtroCompetencias: filtroCompetencias.value.trim() } : {}),
        ...(filtroDataInicio.value.trim() ? { filtroDataInicio: filtroDataInicio.value.trim() } : {}),
        ...(filtroDataFim.value.trim() ? { filtroDataFim: filtroDataFim.value.trim() } : {}),
        ...(filtroUser.value.trim() ? { filtroUser: filtroUser.value.trim() } : {}),
    }

    console.log(payLoadFilter)

    const responseReports =  await postJSON('/reports/travel', payLoadFilter)
    ''
    if (responseReports.success){
        console.log(responseReports.data)
    }
    
}


document.addEventListener("DOMContentLoaded", function () {

    const infoModal = document.getElementById('infoModal')
    const modalEl = document.getElementById("modal-filter");

    modalEl.addEventListener("show.bs.modal", function (event) {
    
    // O botão que acionou o modal
    const button = event.relatedTarget;

    // Exemplo: usar um atributo data-source para diferenciar
    const source = button.getAttribute("data-source");
    
    modalEl.setAttribute('source', source)
    
    // console.log("Modal aberto pelo botão:", source);
        
    });
    

    document.getElementById('filtroCompetencias').addEventListener('change', (e) =>{
        e.preventDefault()
        document.getElementById('filtroDataInicio').value = "" ;
        document.getElementById('filtroDataFim').value = "" ; 

    });
    document.getElementById('filtroDataInicio').addEventListener('change', (e) =>{
        e.preventDefault()
        document.getElementById('filtroCompetencias').value = 0
        if (document.getElementById('filtroDataFim').value === ""){
            document.getElementById('filtroDataFim').value = document.getElementById('filtroDataInicio').value.trim()
        }
    });
    document.getElementById('filtroDataFim').addEventListener('change', (e) =>{
        e.preventDefault()
        document.getElementById('filtroCompetencias').value = 0

        if (document.getElementById('filtroDataInicio').value === ""){
            document.getElementById('filtroDataInicio').value = document.getElementById('filtroDataFim').value.trim()
        }

    });

    document.getElementById('bntImprimirModal').addEventListener('click', async  (e) =>{
        e.preventDefault()

        if (document.getElementById('filtroCompetencias').value.trim() === '0' && document.getElementById('filtroDataInicio').value.trim() === ""){
            execToast(
                "Selecione uma Data ou competencia.",
                "Data e competencia Vazia"
            );

            infoModal.innerText =  "Selecione uma Data ou competencia.";
            infoModal.hidden = false;

            return

        } else {
            infoModal.innerText =  "";
            infoModal.hidden = true;
        
            const infSourceModal = modalEl.getAttribute('source') 

            await getParamsFilter(infSourceModal) ;


        }


    })


})