import toast from './menssageToast.js';

function handleResponse() {
    console.log('Response received:');
    let toastMessage = toast('Operação realizada com sucesso', 'danger', 'Sucesso', 'Agora', 'campaign');
   
}
