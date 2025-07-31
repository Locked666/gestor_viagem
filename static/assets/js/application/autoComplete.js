export function autoComplete(inputSelector, hiddenInputSelector, apiUrl) {
  const input = document.querySelector(inputSelector);
  const hiddenInput = document.querySelector(hiddenInputSelector);

  let currentFocus = -1;

  input.setAttribute("autocomplete", "off");

  input.addEventListener("input", async function () {
    const val = this.value;
    closeAllLists();

    if (!val) return;

    const container = document.createElement("div");
    container.setAttribute("id", this.id + "-autocomplete-list");
    container.setAttribute(
      "class",
      "list-group position-absolute zindex-dropdown"
    ); // w-100
    this.parentNode.appendChild(container);

    try {
      const res = await fetch(`${apiUrl}?q=${encodeURIComponent(val)}`);
      const data = await res.json();

      data.forEach((item) => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("list-group-item", "list-group-item-action");
        itemDiv.innerHTML = `<strong>${item.nome}</strong>`;
        itemDiv.dataset.id = item.id;
        itemDiv.dataset.nome = item.nome;
        // itemDiv.style.position = "absolute";
        itemDiv.style.zIndex = "9999";
        // itemDiv.style.background = "#fff";
        itemDiv.style.border = "1px solid #ccc";
        itemDiv.style.cursor = "pointer";

        // const rect = input.getBoundingClientRect();
        // itemDiv.style.top = rect.bottom + window.scrollY + "px";
        // itemDiv.style.left = rect.left + window.scrollX + "px";
        // itemDiv.style.width = rect.width + "px";

        itemDiv.addEventListener("click", () => {
          input.value = item.nome;
          hiddenInput.value = item.id;
          closeAllLists();
        });

        container.appendChild(itemDiv);
      });
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
  });

  input.addEventListener("keydown", function (e) {
    let items = document.querySelectorAll(
      `#${this.id}-autocomplete-list .list-group-item`
    );
    if (items.length === 0) return;

    if (e.key === "ArrowDown") {
      currentFocus++;
      addActive(items);
    } else if (e.key === "ArrowUp") {
      currentFocus--;
      addActive(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentFocus > -1) items[currentFocus].click();
    }
  });

  function addActive(items) {
    if (!items) return;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add("active");
  }

  function removeActive(items) {
    items.forEach((item) => item.classList.remove("active"));
  }

  function closeAllLists(elmnt) {
    const lists = document.querySelectorAll(".list-group.position-absolute");
    lists.forEach((list) => {
      if (elmnt !== list && elmnt !== input) list.remove();
    });
    currentFocus = -1;
  }

  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}
