
/* ==========================================
   MUNDO REPUESTOS - DETALLE DE PRODUCTOS
   CONEXION CON SPRING BOOT Y MYSQL
   ========================================== */


/* 1. DIRECCIONES DE LAS API */

const API_PRODUCTOS_DETALLE = "/api/productos";
const API_INVENTARIO_DETALLE = "/api/inventario";
const API_VEHICULOS_DETALLE = "/api/vehiculos";
const API_COMPATIBILIDAD_DETALLE = "/api/compatibilidad";


/* 2. VARIABLES PRINCIPALES */

let productosDetalle = [];
let inventarioDetalle = [];
let vehiculosDetalle = [];
let compatibilidadesDetalle = [];

let productoSeleccionado = null;


/* 3. IDENTIFICAR PRODUCTO SELECCIONADO */

const parametrosDetalle = new URLSearchParams(
    window.location.search
);

const idProductoDetalle = Number(
    parametrosDetalle.get("id")
);


/* 4. ELEMENTOS HTML */

const cantidadInputDetalle = document.getElementById(
    "product-quantity"
);

const botonAgregarDetalle = document.getElementById(
    "add-product-cart"
);

const contenedorDetalle = document.querySelector(
    ".product-detail-page"
);


/* 5. FORMATO DE PRECIOS */

function formatoPrecioDetalle(precio) {

    return new Intl.NumberFormat("es-CO", {

        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0

    }).format(Number(precio) || 0);

}


/* 6. PROTEGER TEXTOS */

function escaparDetalle(texto) {

    return String(texto ?? "").replace(/[&<>"']/g, caracter => {

        const caracteres = {

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"

        };

        return caracteres[caracter];

    });

}


/* 7. ICONOS POR CATEGORIA */

const iconosDetalle = {

    "Motor": "fa-gears",
    "Suspensión": "fa-car-side",
    "Suspension": "fa-car-side",
    "Frenos": "fa-compact-disc",
    "Eléctrico": "fa-bolt",
    "Iluminación": "fa-lightbulb",
    "Refrigeración": "fa-temperature-half",
    "Carrocería": "fa-car"

};


/* 8. RECUPERAR EXISTENCIAS */

function obtenerStockDetalle(idProducto) {

    const registro = inventarioDetalle.find(item =>

        Number(item.id_producto) === Number(idProducto)

    );

    // Si no existe inventario, el producto aparece agotado
    return registro
        ? Number(registro.stock_actual)
        : 0;

}


/* 9. RECUPERAR STOCK MINIMO */

function obtenerStockMinimoDetalle(idProducto) {

    const registro = inventarioDetalle.find(item =>

        Number(item.id_producto) === Number(idProducto)

    );

    return registro
        ? Number(registro.stock_minimo)
        : 0;

}


/* 10. RECUPERAR VEHICULOS COMPATIBLES */

function obtenerVehiculosCompatiblesDetalle(idProducto) {

    const relaciones = compatibilidadesDetalle.filter(relacion =>

        Number(relacion.id_producto) === Number(idProducto)

    );

    return relaciones.map(relacion => {

        const vehiculo = vehiculosDetalle.find(item =>

            Number(item.id_vehiculo) ===
            Number(relacion.id_vehiculo)

        );

        if (!vehiculo) return null;

        return {

            id: vehiculo.id_vehiculo,

            nombre:
                `${vehiculo.marca} ${vehiculo.linea} ${vehiculo.modelo} · ${vehiculo.motor}`,

            observaciones: relacion.observaciones || ""

        };

    }).filter(Boolean);

}


/* 11. CARGAR PRODUCTOS DESDE MYSQL */

async function cargarDetalleProducto() {

    try {

        // Validamos que exista un identificador en la dirección
        if (!Number.isInteger(idProductoDetalle) ||
            idProductoDetalle <= 0) {

            throw new Error("El identificador del producto no es válido.");

        }

        // Consultamos las cuatro API relacionadas
        const [

            respuestaProductos,
            respuestaInventario,
            respuestaVehiculos,
            respuestaCompatibilidad

        ] = await Promise.all([

            fetch(API_PRODUCTOS_DETALLE),
            fetch(API_INVENTARIO_DETALLE),
            fetch(API_VEHICULOS_DETALLE),
            fetch(API_COMPATIBILIDAD_DETALLE)

        ]);

        if (

            !respuestaProductos.ok ||
            !respuestaInventario.ok ||
            !respuestaVehiculos.ok ||
            !respuestaCompatibilidad.ok

        ) {

            throw new Error("No se pudieron consultar los datos del producto.");

        }

        // Convertimos las respuestas a JSON
        productosDetalle = await respuestaProductos.json();

        inventarioDetalle = await respuestaInventario.json();

        vehiculosDetalle = await respuestaVehiculos.json();

        compatibilidadesDetalle = await respuestaCompatibilidad.json();


        // Buscamos el producto utilizando su ID real de MySQL
        const productoBD = productosDetalle.find(item =>

            Number(item.id) === idProductoDetalle

        );

        if (!productoBD) {

            mostrarProductoNoEncontrado();

            return;

        }


        // Adaptamos los campos de MySQL a los utilizados por la tienda
        productoSeleccionado = {

            id: Number(productoBD.id),

            nombre: productoBD.nombre_producto || "",

            marca: productoBD.marca || "",

            referencia: productoBD.referencia || "",

            categoria: productoBD.categoria || "",

            descripcion: productoBD.descripcion || "",

            precio: Number(productoBD.precio_venta) || 0,

            imagen: productoBD.imagen_url || "",

            imagen_url: productoBD.imagen_url || "",

            stock: obtenerStockDetalle(productoBD.id),

            stockMinimo: obtenerStockMinimoDetalle(productoBD.id),

            icono:
                iconosDetalle[productoBD.categoria] || "fa-gears",

            compatibles: obtenerVehiculosCompatiblesDetalle(productoBD.id)

        };


        // Mostramos la información recuperada
        mostrarDetalleProducto();

        console.log("Producto recuperado desde MySQL:", productoSeleccionado);

    } catch (error) {

        console.error("Error cargando detalle:", error);

        mostrarErrorDetalle();

    }

}


/* 12. MOSTRAR PRODUCTO NO ENCONTRADO */

function mostrarProductoNoEncontrado() {

    contenedorDetalle.innerHTML = `

        <div class="catalog-empty">

            <i class="fa-solid fa-box-open"></i>

            <h2>Producto no encontrado</h2>

            <p>
                El repuesto que buscas no está disponible.
            </p>

            <a href="catalogo.html" class="btn-primary">
                Volver al catálogo
            </a>

        </div>

    `;

}


/* 13. MOSTRAR ERROR DE CONSULTA */

function mostrarErrorDetalle() {

    contenedorDetalle.innerHTML = `

        <div class="catalog-empty">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <h2>No se pudo cargar el producto</h2>

            <p>
                Verifica tu conexión e intenta nuevamente.
            </p>

            <a href="catalogo.html" class="btn-primary">
                Volver al catálogo
            </a>

        </div>

    `;

}


/* 14. MOSTRAR INFORMACION DEL PRODUCTO */

function mostrarDetalleProducto() {

    const producto = productoSeleccionado;

    if (!producto) {

        mostrarProductoNoEncontrado();

        return;

    }


    // Actualizamos el título de la pestaña
    document.title =
        `${producto.nombre} | Mundo Repuestos`;


    // Información principal
    document.getElementById("breadcrumb-product").textContent =
        producto.nombre;

    document.getElementById("product-category").textContent =
        producto.categoria.toUpperCase();

    document.getElementById("product-name").textContent =
        producto.nombre;

    document.getElementById("product-brand").textContent =
        producto.marca || "Sin marca";

    document.getElementById("product-reference").textContent =
        producto.referencia || "Sin referencia";

    document.getElementById("product-price").textContent =
        formatoPrecioDetalle(producto.precio);

    document.getElementById("product-description").textContent =
        producto.descripcion || "Descripción no disponible.";


    // Mostramos disponibilidad
    const stock = Number(producto.stock);

    const stockTexto = document.getElementById("product-stock");

    stockTexto.textContent = stock > 0

        ? `${stock} unidades disponibles`

        : "Producto agotado";

    stockTexto.parentElement.style.color =
        stock > 0 ? "#20c56b" : "#ef4444";


    // Configuramos las cantidades disponibles
    cantidadInputDetalle.min = 1;

    cantidadInputDetalle.max = stock;

    cantidadInputDetalle.value = stock > 0 ? 1 : 0;

    cantidadInputDetalle.disabled = stock <= 0;


    // Habilitamos o deshabilitamos el botón de compra
    botonAgregarDetalle.disabled = stock <= 0;

    botonAgregarDetalle.innerHTML = stock > 0

        ? '<i class="fa-solid fa-cart-shopping"></i> AGREGAR AL CARRITO'

        : "PRODUCTO AGOTADO";


    // Actualizamos las demás secciones
    mostrarVehiculosCompatibles(producto);

    mostrarEspecificaciones(producto);

    mostrarGaleria(producto);

}


/* 15. VEHICULOS COMPATIBLES */

function mostrarVehiculosCompatibles(producto) {

    const contenedor = document.getElementById(
        "compatible-vehicles"
    );

    const vehiculos = Array.isArray(producto.compatibles)

        ? producto.compatibles

        : [];

    contenedor.innerHTML = "";

    if (vehiculos.length === 0) {

        contenedor.textContent =
            "No hay vehículos compatibles registrados.";

        return;

    }

    vehiculos.forEach(vehiculo => {

        const fila = document.createElement("div");

        fila.className = "compatible-vehicle";

        const icono = document.createElement("i");

        icono.className = "fa-solid fa-circle-check";

        const texto = document.createElement("span");

        texto.textContent = vehiculo.nombre;

        fila.append(icono, texto);

        contenedor.appendChild(fila);


        // Si existe una observación, también la mostramos
        if (vehiculo.observaciones) {

            const observacion = document.createElement("small");

            observacion.textContent = vehiculo.observaciones;

            observacion.style.display = "block";

            observacion.style.marginLeft = "24px";

            observacion.style.color = "#aeb8c5";

            contenedor.appendChild(observacion);

        }

    });

}


/* 16. ESPECIFICACIONES */

function mostrarEspecificaciones(producto) {

    const contenedor = document.getElementById(
        "product-specifications"
    );

    const especificaciones = {

        "Marca": producto.marca,

        "Referencia": producto.referencia,

        "Categoría": producto.categoria,

        "Precio de venta": formatoPrecioDetalle(producto.precio),

        "Existencias": producto.stock,

        "Stock mínimo": producto.stockMinimo

    };

    contenedor.innerHTML = "";

    Object.entries(especificaciones).forEach(([nombre, valor]) => {

        const fila = document.createElement("div");

        fila.className = "specification-item";

        const etiqueta = document.createElement("span");

        etiqueta.textContent = nombre;

        const contenido = document.createElement("strong");

        contenido.textContent = valor ?? "No definido";

        fila.append(etiqueta, contenido);

        contenedor.appendChild(fila);

    });

}


/* 17. GALERIA DE FOTOGRAFIAS */

function mostrarGaleria(producto) {

    const miniaturas = document.getElementById(
        "product-thumbnails"
    );

    const imagenPrincipal = document.getElementById(
        "product-main-image"
    );

    miniaturas.innerHTML = "";

    imagenPrincipal.innerHTML = "";


    if (producto.imagen_url) {

        // Mostramos la fotografía guardada en el servidor
        const imagen = document.createElement("img");

        imagen.src = producto.imagen_url;

        imagen.alt = producto.nombre;

        imagen.addEventListener("error", function() {

            mostrarImagenProvisional(producto, imagenPrincipal);

            miniaturas.innerHTML = "";

        }, { once: true });

        imagenPrincipal.appendChild(imagen);


        // Creamos la miniatura de la fotografía
        const boton = document.createElement("button");

        boton.type = "button";

        boton.className = "product-thumbnail active";

        const miniatura = document.createElement("img");

        miniatura.src = producto.imagen_url;

        miniatura.alt = producto.nombre;

        boton.appendChild(miniatura);

        miniaturas.appendChild(boton);


    } else {

        // Si todavía no existe fotografía, mostramos un icono
        mostrarImagenProvisional(producto, imagenPrincipal);

    }


    // Etiqueta inferior de la imagen
    const etiqueta = document.createElement("span");

    etiqueta.className = "image-label";

    etiqueta.textContent = producto.imagen_url

        ? "FOTOGRAFÍA DEL PRODUCTO"

        : "IMAGEN PROVISIONAL";

    imagenPrincipal.appendChild(etiqueta);

}


/* 18. MOSTRAR IMAGEN PROVISIONAL */

function mostrarImagenProvisional(producto, contenedor) {

    contenedor.innerHTML = "";

    const icono = document.createElement("div");

    icono.className = "product-image-fallback";

    const iconoInterior = document.createElement("i");

    iconoInterior.className =
        `fa-solid ${producto.icono || "fa-gears"}`;

    icono.appendChild(iconoInterior);

    contenedor.appendChild(icono);

}


/* 19. CONTROL DE CANTIDADES */

document.getElementById("quantity-plus")
    .addEventListener("click", function() {

        if (!productoSeleccionado) return;

        const actual = Number(cantidadInputDetalle.value);

        if (actual < Number(productoSeleccionado.stock)) {

            cantidadInputDetalle.value = actual + 1;

        }

    });


document.getElementById("quantity-minus")
    .addEventListener("click", function() {

        const actual = Number(cantidadInputDetalle.value);

        if (actual > 1) {

            cantidadInputDetalle.value = actual - 1;

        }

    });


cantidadInputDetalle.addEventListener("change", function() {

    if (!productoSeleccionado) return;

    let cantidad = Math.floor(Number(cantidadInputDetalle.value));

    if (!Number.isFinite(cantidad)) cantidad = 1;

    cantidad = Math.max(

        1,

        Math.min(cantidad, Number(productoSeleccionado.stock))

    );

    cantidadInputDetalle.value =
        productoSeleccionado.stock > 0 ? cantidad : 0;

});


/* 20. CONTADOR DEL CARRITO */

function actualizarContadorDetalle() {

    let carrito = [];

    try {

        carrito = JSON.parse(

            localStorage.getItem("carrito_mundo_repuestos") || "[]"

        );

        if (!Array.isArray(carrito)) {

            carrito = [];

        }

    } catch (error) {

        carrito = [];

    }

    const contador = document.querySelector(".cart-count");

    if (contador) {

        contador.textContent = carrito.reduce(

            (total, item) => total + Number(item.cantidad),

            0

        );

    }

}


/* 21. AGREGAR AL CARRITO */

function agregarProductoAlCarrito() {

    if (!productoSeleccionado) return false;

    const producto = productoSeleccionado;

    const cantidad = Number(cantidadInputDetalle.value);

    if (

        !Number.isInteger(cantidad) ||

        cantidad < 1 ||

        cantidad > Number(producto.stock)

    ) {

        alert("Verifica la cantidad seleccionada.");

        return false;

    }


    // Recuperamos el carrito actual
    let carrito = [];

    try {

        carrito = JSON.parse(

            localStorage.getItem("carrito_mundo_repuestos") || "[]"

        );

        if (!Array.isArray(carrito)) {

            carrito = [];

        }

    } catch (error) {

        carrito = [];

    }


    // Comprobamos si el producto ya está agregado
    const existente = carrito.find(item =>

        Number(item.id) === Number(producto.id)

    );

    const cantidadActual = existente

        ? Number(existente.cantidad)

        : 0;


    if (

        cantidadActual + cantidad >

        Number(producto.stock)

    ) {

        alert("No hay suficientes unidades disponibles.");

        return false;

    }


    if (existente) {

        existente.cantidad += cantidad;

    } else {

        carrito.push({

            ...producto,

            cantidad: cantidad

        });

    }


    // Guardamos los productos en el carrito
    localStorage.setItem(

        "carrito_mundo_repuestos",

        JSON.stringify(carrito)

    );


    actualizarContadorDetalle();

    alert("¡Producto agregado al carrito!");

    return true;

}


/* 22. BOTON AGREGAR AL CARRITO */

botonAgregarDetalle.addEventListener(
    "click",
    agregarProductoAlCarrito
);


/* 23. COMPRAR AHORA */

document.querySelector(".product-buy-now")
    .addEventListener("click", function(evento) {

        evento.preventDefault();

        if (agregarProductoAlCarrito()) {

            window.location.href = "carrito.html";

        }

    });


/* 24. PESTAÑAS */

document.querySelectorAll(".product-tab").forEach(boton => {

    boton.addEventListener("click", function() {

        document.querySelectorAll(".product-tab").forEach(tab => {

            tab.classList.remove("active");

        });

        document.querySelectorAll(".product-tab-content").forEach(
            contenido => {

                contenido.classList.add("hidden");

            }
        );

        boton.classList.add("active");

        const contenido = document.getElementById(
            boton.dataset.tab
        );

        if (contenido) {

            contenido.classList.remove("hidden");

        }

    });

});


/* 25. INICIAR FICHA DEL PRODUCTO */

document.addEventListener("DOMContentLoaded", function() {

    // Consultamos los datos reales desde Spring Boot
    cargarDetalleProducto();

    // Actualizamos el contador del carrito
    actualizarContadorDetalle();

});
