const form = document.getElementById("formPresupuesto");
const resultado = document.getElementById("resultado");
const historialDiv = document.getElementById("historial");

let historial = JSON.parse(localStorage.getItem("presupuestos")) || [];

function mostrarHistorial() {
    historialDiv.innerHTML = "";
    historial.forEach((item, index) => {
        const div = document.createElement("div");
        div.textContent = `${index + 1}. Cliente: ${item.cliente}, Superficie: ${item.superficie} m², Costo/m²: $${item.costo}, Total: $${item.total}`;
        historialDiv.appendChild(div);
    });
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const cliente = document.getElementById("cliente").value;
    const superficie = parseFloat(document.getElementById("superficie").value);
    const costo = parseFloat(document.getElementById("costo").value);

    if (superficie > 0 && costo > 0) {
        const total = superficie * costo;
        resultado.textContent = `Presupuesto para ${cliente}: $${total}`;

        const nuevoPresupuesto = { cliente, superficie, costo, total };
        historial.push(nuevoPresupuesto);
        localStorage.setItem("presupuestos", JSON.stringify(historial));

        mostrarHistorial();
        form.reset();
    } else {
        resultado.textContent = "Ingrese valores válidos.";
    }
});

mostrarHistorial();