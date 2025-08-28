// showPdfModal.js
// Vanilla JS, framework-free. Depends only on PDF.js (loaded lazily if absent).
// Exports a single function: showPdfModal(input) where input is a File or a URL string.

/**
 * Open a responsive, accessible modal that renders a PDF with zoom and print.
 * @param {File|string} pdfInput - A File object or a URL string.
 */
export async function showPdfModal(pdfInput) {
  // ---- Utilities -----------------------------------------------------------
  const isFileObject = (v) => typeof File !== "undefined" && v instanceof File;

  // Keep track of disposable URLs to revoke on close
  const revokers = [];
  const makeObjectUrl = (blobOrFile) => {
    const url = URL.createObjectURL(blobOrFile);
    revokers.push(() => URL.revokeObjectURL(url));
    return url;
  };

  // Ensure Google Material Symbols stylesheet exists once
  const ensureMaterialSymbols = () => {
    const id = "spm-material-symbols-outlined";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0";
      document.head.appendChild(link);
    }
  };

  // Load PDF.js if needed (legacy UMD build for broad compatibility)
  const ensurePdfJs = () =>
    new Promise((resolve, reject) => {
      // pdfjsLib is the global exposed by the UMD bundle
      if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions)
        return resolve(window.pdfjsLib);

      const scriptId = "spm-pdfjs-script";
      const workerId = "spm-pdfjs-worker";

      const onReady = () => {
        try {
          // Point worker to CDN if not already configured
          if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          }
          resolve(window.pdfjsLib);
        } catch (err) {
          reject(err);
        }
      };

      if (!document.getElementById(scriptId)) {
        const s = document.createElement("script");
        s.id = scriptId;
        s.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        s.onload = onReady;
        s.onerror = () => reject(new Error("Falha ao carregar PDF.js"));
        document.head.appendChild(s);
      } else {
        onReady();
      }

      // Preload worker too (optional; set by GlobalWorkerOptions above)
      if (!document.getElementById(workerId)) {
        const w = document.createElement("link");
        w.id = workerId;
        w.rel = "preload";
        w.as = "script";
        w.href =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        document.head.appendChild(w);
      }
    });

  // ---- Build modal --------------------------------------------------------
  ensureMaterialSymbols();
  const wrapper = document.createElement("div");
  wrapper.className = "spm-backdrop";
  wrapper.setAttribute("role", "dialog");
  wrapper.setAttribute("aria-modal", "true");
  wrapper.setAttribute("aria-label", "Visualizador de PDF");

  wrapper.innerHTML = `
    <div class="spm-modal" tabindex="-1">
      <div class="spm-header">
        <div class="spm-title">Visualizador de PDF</div>
        <div class="spm-actions">
          <button class="spm-btn" data-action="zoom-out" aria-label="Diminuir zoom" title="Diminuir zoom (Ctrl -)">
            <span class="material-symbols-outlined">zoom_out</span>
          </button>
          <button class="spm-btn" data-action="zoom-in" aria-label="Aumentar zoom" title="Aumentar zoom (Ctrl +)">
            <span class="material-symbols-outlined">zoom_in</span>
          </button>
          <button class="spm-btn" data-action="print" aria-label="Imprimir" title="Imprimir (Ctrl P)">
            <span class="material-symbols-outlined">print</span>
          </button>
          <button class="spm-btn spm-close" data-action="close" aria-label="Fechar" title="Fechar (Esc)">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
      <div class="spm-body">
        <div class="spm-canvas-wrap">
          <canvas class="spm-canvas" aria-label="Conteúdo do PDF"></canvas>
        </div>
      </div>
      <div class="spm-footer">
        <div class="spm-zoom-indicator" aria-live="polite">100%</div>
      </div>
    </div>`;

  // Scoped styles (only affect .spm-*)
  const style = document.createElement("style");
  style.textContent = `
    .spm-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: grid; place-items: center; z-index: 2147483000; }
    .spm-modal { background: #fff; width: min(95vw, 1200px); height: min(90vh, 900px); display: grid; grid-template-rows: auto 1fr auto; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.2); }
    .spm-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 12px; border-bottom: 1px solid #eee; }
    .spm-title { font-size: 16px; font-weight: 600; }
    .spm-actions { display: inline-flex; gap: 6px; }
    .spm-btn { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1px solid #e6e6e6; background: #fafafa; border-radius: 10px; cursor: pointer; transition: background .15s, transform .05s; }
    .spm-btn:focus { outline: 2px solid #4c9ffe; outline-offset: 2px; }
    .spm-btn:hover { background: #f0f0f0; }
    .spm-btn:active { transform: scale(0.98); }
    .spm-close { background: #fff3f3; }
    .spm-close:hover { background: #ffe6e6; }
    .spm-body { overflow: auto; background: #f7f7f9; }
    .spm-canvas-wrap { width: 100%; height: 100%; display: grid; place-items: center; padding: 16px; }
    .spm-canvas { max-width: 100%; height: auto; box-shadow: 0 1px 6px rgba(0,0,0,.08); background: white; }
    .spm-footer { display: flex; align-items: center; justify-content: center; padding: 8px; border-top: 1px solid #eee; font-size: 12px; color: #555; }
    @media (max-width: 600px) { .spm-modal { width: 96vw; height: 92vh; } .spm-header { padding: 8px; } .spm-actions { gap: 4px; } }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    body.spm-no-scroll { overflow: hidden !important; }
  `;

  wrapper.appendChild(style);
  document.body.appendChild(wrapper);
  document.body.classList.add("spm-no-scroll");

  // Focus management
  const modal = wrapper.querySelector(".spm-modal");
  const btnClose = wrapper.querySelector('[data-action="close"]');
  modal.focus();

  // ---- PDF rendering state -------------------------------------------------
  const pdfjsLib = await ensurePdfJs();

  // Accept File or URL
  let pdfUrl = null;
  if (isFileObject(pdfInput)) {
    pdfUrl = makeObjectUrl(pdfInput);
  } else if (typeof pdfInput === "string") {
    pdfUrl = pdfInput;
  } else {
    cleanup();
    throw new Error(
      "showPdfModal: o parâmetro deve ser um File ou uma URL string"
    );
  }

  const canvas = wrapper.querySelector(".spm-canvas");
  const ctx = canvas.getContext("2d");
  const zoomIndicator = wrapper.querySelector(".spm-zoom-indicator");

  let pdfDoc = null;
  let page = null;
  let currentScale = 1.0; // 100%

  const renderPage = async () => {
    if (!page) return;
    const viewport = page.getViewport({ scale: currentScale });
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const renderContext = { canvasContext: ctx, viewport };
    await page.render(renderContext).promise;
    zoomIndicator.textContent = `${Math.round(currentScale * 100)}%`;
  };

  const loadFirstPage = async () => {
    pdfDoc = await pdfjsLib.getDocument({ url: pdfUrl }).promise;
    page = await pdfDoc.getPage(1);
    // Fit-to-width baseline: estimate scale to fit modal body width
    const bodyEl = wrapper.querySelector(".spm-body");
    const rect = bodyEl.getBoundingClientRect();
    const unscaledViewport = page.getViewport({ scale: 1 });
    const fitScale = Math.min(rect.width / unscaledViewport.width, 1.5); // avoid extreme upscaling
    currentScale = Math.max(Math.min(fitScale, 1.5), 0.5);
    await renderPage();
  };

  // ---- Controls ------------------------------------------------------------
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const ZOOM_MIN = 0.25,
    ZOOM_MAX = 3.0,
    ZOOM_STEP = 0.15;

  const onZoomIn = async () => {
    currentScale = clamp(currentScale + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX);
    await renderPage();
  };
  const onZoomOut = async () => {
    currentScale = clamp(currentScale - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX);
    await renderPage();
  };

  const onPrint = async () => {
    try {
      if (!pdfDoc) return;
      // Get binary data and make a Blob URL for the original PDF
      const data = await pdfDoc.getData();
      const blob = new Blob([data], { type: "application/pdf" });
      const url = makeObjectUrl(blob);
      // Create a hidden iframe to load and print
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          setTimeout(() => iframe.remove(), 1000);
        }
      };
    } catch (err) {
      console.error("Falha ao imprimir:", err);
      alert("Não foi possível imprimir este PDF.");
    }
  };

  wrapper.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".spm-btn");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    if (action === "close") cleanup();
    if (action === "zoom-in") onZoomIn();
    if (action === "zoom-out") onZoomOut();
    if (action === "print") onPrint();
  });

  // Keyboard: Esc close, Ctrl/Cmd +/- zoom, Ctrl/Cmd P print
  const keyHandler = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cleanup();
      return;
    }
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && (e.key === "+" || e.key === "=")) {
      e.preventDefault();
      onZoomIn();
    }
    if (ctrl && (e.key === "-" || e.key === "_")) {
      e.preventDefault();
      onZoomOut();
    }
    if (ctrl && e.key.toLowerCase?.() === "p") {
      e.preventDefault();
      onPrint();
    }
  };
  document.addEventListener("keydown", keyHandler, { capture: true });

  // Close by clicking backdrop (but not the modal itself)
  const backdropHandler = (e) => {
    if (e.target === wrapper) cleanup();
  };
  wrapper.addEventListener("mousedown", backdropHandler);

  // Prevent background scroll on touch devices within modal
  wrapper.addEventListener("wheel", (e) => e.stopPropagation(), {
    passive: true,
  });
  wrapper.addEventListener("touchmove", (e) => e.stopPropagation(), {
    passive: true,
  });

  // Load and render
  await loadFirstPage();

  // ---- Cleanup -------------------------------------------------------------
  function cleanup() {
    document.removeEventListener("keydown", keyHandler, { capture: true });
    try {
      pdfDoc?.cleanup?.();
    } catch (_) {}
    try {
      pdfDoc?.destroy?.();
    } catch (_) {}
    revokers.forEach((fn) => {
      try {
        fn();
      } catch (_) {}
    });
    wrapper.remove();
    document.body.classList.remove("spm-no-scroll");
  }
}

// Optional: named export for future extensibility (e.g., to accept options)
export default showPdfModal;
