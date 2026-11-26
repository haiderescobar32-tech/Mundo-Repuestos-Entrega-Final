
/* ==========================================
   MUNDO REPUESTOS - CARRITO DE COMPRAS
   ========================================== */


/* 1. RECUPERAR PRODUCTOS GUARDADOS */

let carrito = JSON.parse(
    localStorage.getItem("carrito_mundo_repuestos") || "[]"
);


/* 2. FORMATO DE PRECIOS */

function formatoPrecioCarrito(precio) {

    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(precio);

}


/* 3. GUARDAR CARRITO */

function guardarCarrito() {

    localStorage.setItem(
        "carrito_mundo_repuestos",
        JSON.stringify(carrito)
    );

}


/* 4. ACTUALIZAR CONTADOR */

function actualizarContadorCarrito() {

    const contador = document.querySelector(".cart-count");

    const total = carrito.reduce(
        (suma, producto) => suma + Number(producto.cantidad),
        0
    );

    if (contador) {
        contador.textContent = total;
    }

}


/* 5. CALCULAR SUBTOTAL */

function calcularSubtotal() {

    return carrito.reduce(
        (suma, producto) => {

            return suma +
                (Number(producto.precio) * Number(producto.cantidad));

        },
        0
    );

}


/* 6. MOSTRAR PRODUCTOS */

function mostrarCarrito() {

    const contenedor = document.getElementById("cart-items");

    if (!contenedor) return;

    const cantidadProductos = carrito.reduce(
        (suma, producto) => suma + Number(producto.cantidad),
        0
    );

    document.getElementById("cart-items-count").textContent =
        `${cantidadProductos} productos`;

    document.getElementById("cart-products-total").textContent =
        `${cantidadProductos} artículos`;


    /* CARRITO VACIO */

    if (carrito.length === 0) {

        contenedor.innerHTML = `

            <div class="cart-empty">

                <i class="fa-solid fa-cart-shopping"></i>

                <h2>Tu carrito está vacío</h2>

                <p>
                    Todavía no has agregado repuestos.
                    Explora nuestro catálogo y encuentra lo que necesitas.
                </p>

                <a href="catalogo.html" class="btn-primary">
                    Explorar catálogo
                </a>

            </div>

        `;

        actualizarResumen();

        return;

    }


    /* MOSTRAR CADA PRODUCTO */

    contenedor.innerHTML = carrito.map(producto => `

        <article class="cart-item">

            <div class="cart-item-image">

                <i class="fa-solid ${producto.icono || "fa-gears"}"></i>

            </div>


            <div class="cart-item-info">

                <h3>${producto.nombre}</h3>

                <p>${producto.marca || "Sin marca"}</p>

                <p class="cart-reference">
                    Ref: ${producto.referencia || "Sin referencia"}
                </p>

            </div>


            <div class="cart-item-price">

                ${formatoPrecioCarrito(producto.precio)}

            </div>


            <div class="cart-quantity">

                <button
                    type="button"
                    data-action="decrease"
                    data-id="${producto.id}"
                    aria-label="Disminuir cantidad">

                    <i class="fa-solid fa-minus"></i>

                </button>

                <span>${producto.cantidad}</span>

                <button
                    type="button"
                    data-action="increase"
                    data-id="${producto.id}"
                    aria-label="Aumentar cantidad">

                    <i class="fa-solid fa-plus"></i>

                </button>

            </div>


            <button
                class="cart-remove"
                type="button"
                data-action="remove"
                data-id="${producto.id}"
                aria-label="Eliminar producto">

                <i class="fa-solid fa-trash-can"></i>

            </button>

        </article>

    `).join("");


    actualizarResumen();

}


/* 7. ACTUALIZAR RESUMEN */

function actualizarResumen() {

    const subtotal = calcularSubtotal();

    document.getElementById("cart-subtotal").textContent =
        formatoPrecioCarrito(subtotal);

    document.getElementById("cart-shipping").textContent =
        "Por calcular";

    /* El envío se confirmará según el destino.
       Por ahora el total corresponde al subtotal. */

    document.getElementById("cart-total").textContent =
        formatoPrecioCarrito(subtotal);


    const botonFinalizar = document.getElementById(
        "checkout-button"
    );

    if (carrito.length === 0) {

        botonFinalizar.classList.add("disabled");
        botonFinalizar.setAttribute("aria-disabled", "true");

    } else {

        botonFinalizar.classList.remove("disabled");
        botonFinalizar.removeAttribute("aria-disabled");

    }

}


/* 8. MODIFICAR CANTIDADES Y ELIMINAR */

document.getElementById("cart-items").addEventListener(
    "click",
    function(event) {

        const boton = event.target.closest("[data-action]");

        if (!boton) return;

        const id = Number(boton.dataset.id);

        const producto = carrito.find(
            item => Number(item.id) === id
        );

        if (!producto) return;


        /* AUMENTAR */

        if (boton.dataset.action === "increase") {

            const stock = Number(producto.stock);

            if (stock > 0 && producto.cantidad < stock) {

                producto.cantidad++;

            } else {

                alert("No hay más unidades disponibles.");

            }

        }


        /* DISMINUIR */

        if (boton.dataset.action === "decrease") {

            if (producto.cantidad > 1) {

                producto.cantidad--;

            }

        }


        /* ELIMINAR */

        if (boton.dataset.action === "remove") {

            carrito = carrito.filter(
                item => Number(item.id) !== id
            );

        }


        guardarCarrito();

        mostrarCarrito();

        actualizarContadorCarrito();

    }
);


/* 9. INICIAR CARRITO */

document.addEventListener("DOMContentLoaded", function() {

    mostrarCarrito();

    actualizarContadorCarrito();

});
