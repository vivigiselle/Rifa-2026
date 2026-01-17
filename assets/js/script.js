document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
      CONFIGURACIÓN
  ===================================================== */
  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeP_d8KKfPPIhAlogHKH0K-Kcy2kxQPoUVphsMl8l_fUUQciA/formResponse";
  
  // URL DE TU APP SCRIPT (la que termina en /exec)
  const URL_LECTURA_OCUPADOS = "https://script.google.com/macros/s/AKfycbx_xJm6tpp-_UsnFtGE7pObWhk6--Qw3ItCy41SwT7o73A1gRZNBsPb1C72L0iVhG479g/exec";

  const FORM_FIELDS = {
    nombre: "entry.1366760904",    
    contacto: "entry.1280154487",  
    numeros: "entry.484085276",    
    telefono: "entry.371280629",   
    premio: "entry.1983088014"     
  };

  const grid = document.getElementById("grid-numeros");
  const btnGuardar = document.getElementById("guardarNumeros");
  const contadorDisponibles = document.getElementById("contadorDisponibles");

  const modalForm = document.getElementById("modalFormUsuario");
  const closeForm = document.getElementById("closeFormModal");
  const formUsuario = modalForm?.querySelector("form");

  const modalTransferencia = document.getElementById("modalTransferencia");
  const btnIconoTransferir = document.getElementById("btnTransferir");
  const linkDatosPagoMenu = document.getElementById("datosPago");
  const btnCerrarTransferencia = document.getElementById("closeModal");
  const btnCopiarDatos = document.getElementById("confirmModal");

  let numerosSeleccionados = [];
  let formLlenado = false;
  let datosUsuario = null;
  let totalDisponibles = 400;

  /* =====================================================
      FUNCIÓN PARA BLOQUEAR NÚMEROS YA VENDIDOS
  ===================================================== */
  async function sincronizarNumerosOcupados() {
    try {
        const response = await fetch(URL_LECTURA_OCUPADOS);
        const ocupados = await response.json(); 

        ocupados.forEach(num => {
            const numeroFormateado = num.toString().padStart(3, "0");
            const todosLosDivs = document.querySelectorAll(".numero");
            
            todosLosDivs.forEach(div => {
                if (div.textContent === numeroFormateado) {
                    div.classList.add("bloqueado");
                    div.style.pointerEvents = "none"; 
                    div.style.backgroundColor = "#d1d5db"; // Gris
                    div.style.color = "#9ca3af";
                }
            });
        });
        
        totalDisponibles = 400 - ocupados.length;
        if (contadorDisponibles) contadorDisponibles.textContent = totalDisponibles;
    } catch (error) {
        console.error("Error al sincronizar:", error);
    }
  }

  /* =====================================================
      CREAR GRID DE 400 NÚMEROS
  ===================================================== */
  for (let i = 1; i <= 400; i++) {
    const btn = document.createElement("div");
    btn.className = "numero";
    btn.textContent = i.toString().padStart(3, "0");

    btn.addEventListener("click", () => {
      if (btn.classList.contains("bloqueado")) return;

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
  formUsuario?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputs = formUsuario.querySelectorAll("input");
    let todoOk = true;
    inputs.forEach(input => {
        if (input.value.trim() === "") {
            input.classList.add("input-error", "shake");
            todoOk = false;
        }
    });

    if (!todoOk) return;

    const nombre = formUsuario.querySelector("input[placeholder='Ingrese su nombre']").value;
    const apellido = formUsuario.querySelector("input[placeholder='Ingrese su apellido']").value;
    const contacto = formUsuario.querySelector("input[placeholder='Ingrese su correo electrónico o Ig']").value;
    const telefono = formUsuario.querySelector("input[placeholder='Ingrese su número de teléfono']").value;
    const premio = document.getElementById("preferencia-premio").value;

    datosUsuario = {
        nombre: `${nombre} ${apellido}`,
        contacto: contacto,
        telefono: telefono,
        premio: premio
    };

    const formData = new FormData();
    formData.append(FORM_FIELDS.nombre, datosUsuario.nombre);
    formData.append(FORM_FIELDS.contacto, datosUsuario.contacto);
    formData.append(FORM_FIELDS.telefono, datosUsuario.telefono); 
    formData.append(FORM_FIELDS.premio, datosUsuario.premio);
    formData.append(FORM_FIELDS.numeros, "REGISTRO_INICIAL"); 

    try {
        await fetch(GOOGLE_FORM_URL, { method: "POST", mode: "no-cors", body: formData });
        formLlenado = true;
        modalForm.style.display = "none";
        document.body.style.overflow = "";
        alert("✅ ¡Datos registrados! Ahora selecciona tus números.");
    } catch (error) {
        alert("❌ Error de conexión.");
    }
  });

  closeForm?.addEventListener("click", () => {
    modalForm.style.display = "none";
    document.body.style.overflow = "";
    formUsuario.reset(); 
  });

  /* =====================================================
      BOTÓN COMPRAR NÚMERO
  ===================================================== */
  btnGuardar.addEventListener("click", async () => {
    if (!datosUsuario || numerosSeleccionados.length === 0) {
      alert("⚠️ Selecciona al menos un número.");
      return;
    }

    const formData = new FormData();
    formData.append(FORM_FIELDS.nombre, datosUsuario.nombre);
    formData.append(FORM_FIELDS.contacto, datosUsuario.contacto);
    formData.append(FORM_FIELDS.telefono, datosUsuario.telefono); 
    formData.append(FORM_FIELDS.premio, datosUsuario.premio);
    formData.append(FORM_FIELDS.numeros, numerosSeleccionados.map(n => n.toString().padStart(3, "0")).join(", "));

    try {
      await fetch(GOOGLE_FORM_URL, { method: "POST", mode: "no-cors", body: formData });
      
      document.querySelectorAll(".numero.seleccionado").forEach(el => {
        el.classList.remove("seleccionado");
        el.classList.add("bloqueado");
      });

      totalDisponibles -= numerosSeleccionados.length;
      contadorDisponibles.textContent = totalDisponibles;
      alert("🎉 ¡Reserva registrada!");
      numerosSeleccionados = []; 
    } catch (error) {
      alert("❌ Error al guardar.");
    }
  });

  /* =====================================================
      MODAL TRANSFERENCIA
  ===================================================== */
  const toggleTransferencia = (e, show) => {
    if(e) e.preventDefault();
    modalTransferencia.style.display = show ? "flex" : "none";
    document.body.style.overflow = show ? "hidden" : "";
  };
  btnIconoTransferir?.addEventListener("click", (e) => toggleTransferencia(e, true));
  linkDatosPagoMenu?.addEventListener("click", (e) => toggleTransferencia(e, true));
  btnCerrarTransferencia?.addEventListener("click", () => toggleTransferencia(null, false));
  btnCopiarDatos?.addEventListener("click", () => {
    const info = "Banco: Mercado Pago\nN° de Cuenta: 1019481756\nTitular: Vivian Roa Tapia";
    navigator.clipboard.writeText(info).then(() => alert("✅ Copiado."));
  });

  /* =====================================================
      INICIO: LLAMAR A LA MEMORIA
  ===================================================== */
  sincronizarNumerosOcupados();

});