document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     GOOGLE FORM — YA CONFIGURADO
  ===================================================== */
  const GOOGLE_FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSeP_d8KKfPPIhAlogHKH0K-Kcy2kxQPoUVphsMl8l_fUUQciA/formResponse";

  const FORM_FIELDS = {
    nombre: "entry.1366760904",
    contacto: "entry.1280154487",
    numeros: "entry.484085276"
  };

  /* =====================================================
     ELEMENTOS DOM
  ===================================================== */
  const grid = document.getElementById("grid-numeros");
  const btnGuardar = document.getElementById("guardarNumeros");
  const contadorDisponibles = document.getElementById("contadorDisponibles");

  const modalForm = document.getElementById("modalFormUsuario");
  const closeForm = document.getElementById("closeFormModal");
  const formUsuario = modalForm?.querySelector("form");

  /* =====================================================
     ESTADO
  ===================================================== */
  let numerosSeleccionados = [];
  let formLlenado = false;
  let datosUsuario = null;

  let totalDisponibles = 400;
  contadorDisponibles.textContent = totalDisponibles;

  /* =====================================================
     CREAR GRID DE 400 NÚMEROS
  ===================================================== */
  for (let i = 1; i <= 400; i++) {
    const btn = document.createElement("div");
    btn.className = "numero";
    btn.textContent = i.toString().padStart(3, "0");

    btn.addEventListener("click", () => {
      if (!formLlenado) {
        modalForm.style.display = "flex";
        document.body.style.overflow = "hidden";
        return;
      }

      btn.classList.toggle("seleccionado");

      if (btn.classList.contains("seleccionado")) {
        numerosSeleccionados.push(i);
      } else {
        numerosSeleccionados = numerosSeleccionados.filter(n => n !== i);
      }
    });

    grid.appendChild(btn);
  }

  /* =====================================================
     FORMULARIO USUARIO
  ===================================================== */
  formUsuario?.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = formUsuario.querySelector("input[placeholder='Ingrese su nombre']").value;
    const apellido = formUsuario.querySelector("input[placeholder='Ingrese su apellido']").value;
    const contacto = formUsuario.querySelector("input[placeholder='Ingrese su correo electrónico o Ig']").value;

    datosUsuario = {
      nombre: `${nombre} ${apellido}`,
      contacto
    };

    formLlenado = true;
    modalForm.style.display = "none";
    document.body.style.overflow = "";

    alert("Datos guardados. Ahora selecciona tus números.");
  });

  closeForm?.addEventListener("click", () => {
    modalForm.style.display = "none";
    document.body.style.overflow = "";
  });

  /* =====================================================
     GUARDAR / ENVIAR A GOOGLE FORM
  ===================================================== */
  btnGuardar.addEventListener("click", async () => {
    if (!datosUsuario) {
      alert("Debes ingresar tus datos primero.");
      return;
    }

    if (numerosSeleccionados.length === 0) {
      alert("Debes seleccionar al menos un número.");
      return;
    }

    const formData = new FormData();
    formData.append(FORM_FIELDS.nombre, datosUsuario.nombre);
    formData.append(FORM_FIELDS.contacto, datosUsuario.contacto);
    formData.append(
      FORM_FIELDS.numeros,
      numerosSeleccionados.map(n => n.toString().padStart(3, "0")).join(", ")
    );

    await fetch(GOOGLE_FORM_URL, {
      method: "POST",
      mode: "no-cors",
      body: formData
    });

    document.querySelectorAll(".numero.seleccionado").forEach(el => {
      el.classList.remove("seleccionado");
      el.classList.add("bloqueado");
    });

    totalDisponibles -= numerosSeleccionados.length;
    contadorDisponibles.textContent = totalDisponibles;

    alert("Reserva registrada correctamente.");

    numerosSeleccionados = [];
  });

});
