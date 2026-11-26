
/* ==========================================
   MUNDO REPUESTOS - PRODUCTOS DESTACADOS
   CONEXION CON SPRING BOOT Y MYSQL
   ========================================== */


/* 1. DIRECCIONES DE LAS API */

const API_PRODUCTOS = "/api/productos";
const API_INVENTARIO = "/api/inventario";


/* 2. VARIABLES PRINCIPALES */

let productos = [];

let inventarios = [];


// Formato de precios colombianos
function formatoPrecio(precio) {

    return new Intl.NumberFormat("es-CO", {

        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0

    }).format(Number(precio) || 0);

}


/* 3. PROTEGER TEXTOS MOSTRADOS EN HTML */

function escaparTexto(texto) {

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


/* 4. ICONOS POR CATEGORIA */

const iconosProductos = {

    "Motor": "fa-gears",
    "Suspensión": "fa-car-side",
    "Suspension": "fa-car-side",
    "Frenos": "fa-compact-disc",
    "Filtracion": "fa-filter",
    "Filtración": "fa-filter",
    "Carrocería": "fa-car",
    "Eléctrico": "fa-bolt",
    "Iluminación": "fa-lightbulb"

};


/* 5. CONSULTAR INVENTARIO DE CADA PRODUCTO */

function obtenerStockProducto(idProducto) {

    const registro = inventarios.find(item =>

        Number(item.id_producto) === Number(idProducto)

    );

    return registro
        ? Number(registro.stock_actual)
        : 0;

}


/* 6. CARGAR PRODUCTOS DESDE MYSQL */

async function cargarProductos() {

    const contenedor = document.getElementById(
        "featured-products"
    );

    if (!contenedor) return;

    try {

        // Consultamos productos e inventario simultáneamente
        const [respuestaProductos, respuestaInventario] =
            await Promise.all([

                fetch(API_PRODUCTOS),

                fetch(API_INVENTARIO)

            ]);

        if (!respuestaProductos.ok || !respuestaInventario.ok) {

            throw new Error(
                "No se pudieron consultar los productos."
            );

        }

        // Recuperamos la información de MySQL
        const datosProductos = await respuestaProductos.json();

        inventarios = await respuestaInventario.json();

        // Adaptamos los campos del backend al frontend
        productos = datosProductos

            .filter(producto =>

                producto.estado === "ACTIVO"

            )

            .map(producto => ({

                id: Number(producto.id),

                nombre: producto.nombre_producto || "",

                marca: producto.marca || "",

                referencia: producto.referencia || "",

                precio: Number(producto.precio_venta) || 0,

                stock: obtenerStockProducto(producto.id),

                imagen_url: producto.imagen_url || "",

                icono:
                    iconosProductos[producto.categoria] || "fa-gears"

            }))

            // Mostramos hasta cuatro productos destacados
            .slice(0, 4);


        // Mostramos los productos en pantalla
        mostrarProductos();

        console.log(
            "Productos destacados cargados desde MySQL:",
            productos
        );

    } catch (error) {

        console.error(
            "Error cargando productos destacados:",
            error
        );

        contenedor.innerHTML = `

            <p class="featured-error">

                No se pudieron cargar los productos.
                Intenta nuevamente.

            </p>

        `;

    }

}


/* 7. MOSTRAR PRODUCTOS EN PANTALLA */

function mostrarProductos() {

    const contenedor = document.getElementById(
        "featured-products"
    );

    if (!contenedor) return;

    if (productos.length === 0) {

        contenedor.innerHTML = `

            <div class="featured-empty">

                <i class="fa-solid fa-box-open"></i>

                <p>No hay productos destacados disponibles.</p>

            </div>

        `;

        return;

    }


    contenedor.innerHTML = productos.map(producto => {

        // Si existe fotografía, mostramos la imagen real
        const imagenHTML = producto.imagen_url

            ? `

                <img
                    src="${escaparTexto(producto.imagen_url)}"
                    alt="${escaparTexto(producto.nombre)}"
                    loading="lazy">

            `

            : `

                <i class="fa-solid ${producto.icono}"></i>

            `;


        // Verificamos las existencias disponibles
        const disponible = producto.stock > 0;

        return `

            <article class="product-card">

                <div class="product-image-placeholder">

                    ${imagenHTML}

                </div>

                <div class="product-info">

                    <h3>
                        ${escaparTexto(producto.nombre)}
                    </h3>

                    <p class="product-brand">
                        ${escaparTexto(producto.marca)}
                    </p>

                    <p class="product-reference">
                        Ref: ${escaparTexto(producto.referencia)}
                    </p>

                    <span class="product-price">

                        ${formatoPrecio(producto.precio)}

                    </span>

                    <p class="product-stock">

                        <i class="fa-solid fa-circle-check"></i>

                        ${disponible
                            ? `${producto.stock} unidades disponibles`
                            : "Producto agotado"}

                    </p>

                    <button
                        class="btn-primary"
                        data-producto="${producto.id}"
                        ${!disponible ? "disabled" : ""}>

                        <i class="fa-solid fa-cart-shopping"></i>

                        ${disponible
                            ? "Agregar al carrito"
                            : "Producto agotado"}

                    </button>

                </div>

            </article>

        `;

    }).join("");


    // Si una fotografía no carga, mostramos un icono provisional
    contenedor.querySelectorAll("img").forEach(imagen => {

        imagen.addEventListener("error", function() {

            const tarjeta = this.closest(
                ".product-image-placeholder"
            );

            if (tarjeta) {

                tarjeta.innerHTML = `

                    <i class="fa-solid fa-gears"></i>

                `;

            }

        }, { once: true });

    });

}


/* 8. RECUPERAR CARRITO GUARDADO */

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


/* 9. ACTUALIZAR CONTADOR */

function actualizarContador() {

    const contador = document.querySelector(".cart-count");

    if (contador) {

        contador.textContent = carrito.reduce(

            (total, item) =>

                total + Number(item.cantidad),

            0

        );

    }

}


/* 10. GUARDAR CARRITO */

function guardarCarrito() {

    localStorage.setItem(

        "carrito_mundo_repuestos",

        JSON.stringify(carrito)

    );

}


/* 11. AGREGAR PRODUCTO AL CARRITO */

document.addEventListener("click", function(event) {

    const boton = event.target.closest("[data-producto]");

    if (!boton) return;

    const id = Number(boton.dataset.producto);

    const producto = productos.find(item =>

        Number(item.id) === id

    );

    if (!producto) return;


    // Verificamos que haya existencias
    if (producto.stock <= 0) {

        alert("Este producto está agotado.");

        return;

    }


    // Buscamos si el producto ya está en el carrito
    const existente = carrito.find(item =>

        Number(item.id) === id

    );


    // Evitamos agregar más unidades que las disponibles
    const cantidadActual = existente

        ? Number(existente.cantidad)

        : 0;

    if (cantidadActual >= producto.stock) {

        alert("No hay más unidades disponibles.");

        return;

    }


    // Agregamos o aumentamos la cantidad
    if (existente) {

        existente.cantidad++;

    } else {

        carrito.push({

            ...producto,

            cantidad: 1

        });

    }


    // Guardamos el carrito
    guardarCarrito();

    actualizarContador();


    // Confirmamos la operación
    const textoAnterior = boton.innerHTML;

    boton.innerHTML = `

        <i class="fa-solid fa-check"></i>

        Agregado

    `;

    setTimeout(() => {

        if (boton.isConnected) {

            boton.innerHTML = textoAnterior;

        }

    }, 1200);

});


/* 12. INICIALIZAR CARRUSEL */

function iniciarCarrusel() {

    const carrusel = document.getElementById(
        "featured-products"
    );

    const anterior = document.getElementById(
        "products-prev"
    );

    const siguiente = document.getElementById(
        "products-next"
    );

    if (carrusel && anterior && siguiente) {

        anterior.addEventListener("click", function() {

            carrusel.scrollBy({

                left: -carrusel.clientWidth * 0.85,

                behavior: "smooth"

            });

        });

        siguiente.addEventListener("click", function() {

            carrusel.scrollBy({

                left: carrusel.clientWidth * 0.85,

                behavior: "smooth"

            });

        });

    }

}


/* 13. INICIALIZAR PAGINA */

document.addEventListener("DOMContentLoaded", function() {

    // Cargamos los productos reales desde Spring Boot
    cargarProductos();

    // Actualizamos el contador del carrito
    actualizarContador();

    // Activamos los controles del carrusel
    iniciarCarrusel();

});
