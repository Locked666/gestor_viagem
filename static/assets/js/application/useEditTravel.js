import {
  postJSON,
  funcShowLoader,
  funcHideLoader,
  execToast,
} from "./request.js";
import { autoComplete } from "./autoComplete.js";

document.addEventListener("DOMContentLoaded", function () {
  const cardInfoTravel = document.querySelector(".card-info-travel");

  autoComplete("#entidade", "#entidade-id", "/api/v1/entidade");
});
