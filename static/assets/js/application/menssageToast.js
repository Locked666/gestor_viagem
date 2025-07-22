function toast(message, type = 'info', title = 'Notificação', time = '', icon = 'notifications') {
    // Verifica e cria o container do toast se não existir
    let toastContainer = document.getElementById('toast-container');

    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'position-fixed top-1 end-1 z-index-2 p-3';
        document.body.appendChild(toastContainer);
    }

    // Cria o elemento de toast
    const toastWrapper = document.createElement('div');
    toastWrapper.className = `toast align-items-center text-bg-${type} border-0 show`;
    toastWrapper.setAttribute('role', 'alert');
    toastWrapper.setAttribute('aria-live', 'assertive');
    toastWrapper.setAttribute('aria-atomic', 'true');

    toastWrapper.innerHTML = `
        <div class="toast-header border-0">
            <i class="material-symbols-rounded text-${type === 'success' ? 'success' : type === 'danger' ? 'danger' : 'info'} me-2">${icon}</i>
            <strong class="me-auto">${title}</strong>
            <small class="text-body">${time}</small>
            
            <i class="fas fa-times text-md text-white ms-3 cursor-pointer" data-bs-dismiss="toast" aria-label="Close"></i>
        </div>
        <hr class="horizontal dark m-0">
        <div class="toast-body bg-white text-dark rounded-bottom">
            ${message}
        </div>
    `;

    // Adiciona o toast ao container e mostra com Bootstrap
    toastContainer.appendChild(toastWrapper);

    const bsToast = new bootstrap.Toast(toastWrapper);
    bsToast.show();

    // Remove o toast após 5 segundos
    setTimeout(() => {
        toastWrapper.remove();
    }, 5000);
}

export default toast;
