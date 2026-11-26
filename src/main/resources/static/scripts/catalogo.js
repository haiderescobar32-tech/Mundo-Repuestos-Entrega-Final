
/* ==========================================
   MUNDO REPUESTOS - CATALOGO INTERACTIVO
   CONEXION CON SPRING BOOT Y MYSQL
   ========================================== */


/* 1. DIRECCIONES DE LAS API */

const API_PRODUCTOS_CATALOGO = "/api/productos";
const API_INVENTARIO_CATALOGO = "/api/inventario";
const API_VEHICULOS_CATALOGO = "/api/vehiculos";
const API_COMPATIBILIDAD_CATALOGO = "/api/compatibilidad";


/* 2. VARIABLES PRINCIPALES */

let productosCatalogo = [];
let vehiculosCatalogo = [];
let inventarioCatalogo = [];
let compatibilidadesCatalogo = [];

let vehiculoFiltroActivo = null;


/* 3. ELEMENTOS HTML */

const contenedorCatalogo =
    document.getElementById("catalog-products");

const buscador =
    document.getElementById("search-product");

const filtroPrecio =
    document.getElementById("price-filter");

const valorPrecio =
    document.getElementById("price-value");

const filtroStock =
    document.getElementById("stock-filter");

const ordenarProductos =
    document.getElementById("sort-products");

const contadorProductos =
    document.getElementById("products-count");

const filtroMarcaVehiculo =
    document.getElementById("filtro-marca-vehiculo");

const filtroLineaVehiculo =
    document.getElementById("filtro-linea-vehiculo");

const filtroAnioVehiculo =
    document.getElementById("filtro-anio-vehiculo");

const filtroMotorVehiculo =
    document.getElementById("filtro-motor-vehiculo");

const botonBuscarVehiculo =
    document.getElementById("buscar-por-vehiculo");

const botonLimpiarVehiculo =
    document.getElementById("limpiar-filtro-vehiculo");


/* 4. ICONOS POR CATEGORIA */

const iconosCategorias = {

    "Motor": "fa-gears",
    "Suspensión": "fa-car-side",
    "Suspension": "fa-car-side",
    "Frenos": "fa-compact-disc",
    "Eléctrico": "fa-bolt",
    "Iluminación": "fa-lightbulb",
    "Refrigeración": "fa-temperature-half",
    "Carrocería": "fa-car"

};


/* 5. PROTEGER TEXTOS MOSTRADOS EN HTML */

function escaparCatalogo(texto) {

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


/* 6. FORMATO DE PRECIOS */

function formatoPrecioCatalogo(precio) {

    return new Intl.NumberFormat("es-CO", {

        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0

    }).format(Number(precio) || 0);

}


/* 7. RECUPERAR EXISTENCIAS DE INVENTARIO */

function obtenerStockProducto(idProducto) {

    const registro = inventarioCatalogo.find(item =>

        Number(item.id_producto) === Number(idProducto)

    );

    // Si el producto no tiene inventario, se considera agotado
    return registro ? Number(registro.stock_actual) : 0;

}


/* 8. OBTENER VEHICULOS COMPATIBLES */

function obtenerCompatibilidadesProducto(idProducto) {

    return compatibilidadesCatalogo.filter(relacion =>

        Number(relacion.id_producto) === Number(idProducto)

    );

}


/* 9. ADAPTAR LOS DATOS DE MYSQL AL CATALOGO */

function prepararProductosCatalogo(datosProductos) {

    return datosProductos

        // Solo mostramos productos activos
        .filter(producto =>

            String(producto.estado || "").toUpperCase() === "ACTIVO"

        )

        .map(producto => {

            const id = Number(producto.id);

            const relaciones = obtenerCompatibilidadesProducto(id);

            const vehiculosCompatibles = relaciones.map(relacion => {

                const vehiculo = vehiculosCatalogo.find(item =>

                    Number(item.id_vehiculo) ===
                    Number(relacion.id_vehiculo)

                );

                if (!vehiculo) return null;

                return {

                    id: Number(vehiculo.id_vehiculo),

                    nombre:
                        `${vehiculo.marca} ${vehiculo.linea} ${vehiculo.modelo} · ${vehiculo.motor}`

                };

            }).filter(Boolean);

            return {

                // Identificador original de MySQL
                id: id,

                // Datos comerciales
                nombre: producto.nombre_producto || "",
                marca: producto.marca || "",
                referencia: producto.referencia || "",
                categoria: producto.categoria || "",
                descripcion: producto.descripcion || "",

                // Precio de venta
                precio: Number(producto.precio_venta) || 0,

                // Fotografía guardada en MySQL
                imagen: producto.imagen_url || "",
                imagen_url: producto.imagen_url || "",

                // Existencias reales
                stock: obtenerStockProducto(id),

                // Stock mínimo
                stockMinimo: (() => {

                    const registro = inventarioCatalogo.find(item =>
                        Number(item.id_producto) === id
                    );

                    return registro
                        ? Number(registro.stock_minimo)
                        : 0;

                })(),

                // Icono provisional cuando no hay fotografía
                icono:
                    iconosCategorias[producto.categoria] ||
                    "fa-gears",

                // Compatibilidad de vehículos
                compatibilidadIds: vehiculosCompatibles.map(item => item.id),

                compatibles: vehiculosCompatibles.map(item => item.nombre)

            };

        });

}


/* 10. ACTUALIZAR FILTROS DE CATEGORIAS Y MARCAS */

function actualizarFiltrosDinamicos() {

    const categorias = [...new Set(

        productosCatalogo
            .map(producto => producto.categoria)
            .filter(Boolean)

    )].sort((a, b) => a.localeCompare(b, "es"));

    const marcas = [...new Set(

        productosCatalogo
            .map(producto => producto.marca)
            .filter(Boolean)

    )].sort((a, b) => a.localeCompare(b, "es"));


    // Actualizamos las categorías según MySQL
    const grupoCategorias = [...document.querySelectorAll(".filter-group")]
        .find(grupo =>

            grupo.querySelector("h3")?.textContent.trim() === "Categoría"

        );

    if (grupoCategorias) {

        grupoCategorias.querySelectorAll("label").forEach(label => {
            label.remove();
        });

        categorias.forEach(categoria => {

            const label = document.createElement("label");

            const input = document.createElement("input");

            input.type = "checkbox";
            input.value = categoria;
            input.className = "category-filter";

            label.append(input, document.createTextNode(" " + categoria));

            grupoCategorias.appendChild(label);

            input.addEventListener("change", aplicarFiltros);

        });

    }


    // Actualizamos las marcas según MySQL
    const grupoMarcas = [...document.querySelectorAll(".filter-group")]
        .find(grupo =>

            grupo.querySelector("h3")?.textContent.trim() === "Marca"

        );

    if (grupoMarcas) {

        grupoMarcas.querySelectorAll("label").forEach(label => {
            label.remove();
        });

        marcas.forEach(marca => {

            const label = document.createElement("label");

            const input = document.createElement("input");

            input.type = "checkbox";
            input.value = marca;
            input.className = "brand-filter";

            label.append(input, document.createTextNode(" " + marca));

            grupoMarcas.appendChild(label);

            input.addEventListener("change", aplicarFiltros);

        });

    }

}


/* 11. CARGAR DATOS DESDE SPRING BOOT */

async function cargarCatalogo() {

    try {

        // Consultamos las cuatro tablas relacionadas
        const [

            respuestaProductos,
            respuestaInventario,
            respuestaVehiculos,
            respuestaCompatibilidad

        ] = await Promise.all([

            fetch(API_PRODUCTOS_CATALOGO),
            fetch(API_INVENTARIO_CATALOGO),
            fetch(API_VEHICULOS_CATALOGO),
            fetch(API_COMPATIBILIDAD_CATALOGO)

        ]);

        if (

            !respuestaProductos.ok ||
            !respuestaInventario.ok ||
            !respuestaVehiculos.ok ||
            !respuestaCompatibilidad.ok

        ) {

            throw new Error("No se pudieron consultar todas las API.");

        }


        // Convertimos las respuestas a JSON
        const datosProductos = await respuestaProductos.json();

        inventarioCatalogo = await respuestaInventario.json();

        vehiculosCatalogo = await respuestaVehiculos.json();

        compatibilidadesCatalogo = await respuestaCompatibilidad.json();


        // Organizamos los productos utilizando los datos de MySQL
        productosCatalogo = prepararProductosCatalogo(datosProductos);


        // Actualizamos los filtros
        actualizarFiltrosDinamicos();

        actualizarPrecioMaximo();

        // Mostramos los productos
        aplicarFiltros();

        // Cargamos los vehículos del buscador
        inicializarFiltroVehiculo();

        // Actualizamos el contador del carrito
        actualizarContadorCatalogo();

        console.log("Productos cargados desde MySQL:", productosCatalogo);

        console.log("Inventario:", inventarioCatalogo);

        console.log("Vehículos:", vehiculosCatalogo);

        console.log("Compatibilidades:", compatibilidadesCatalogo);

    } catch (error) {

        console.error("Error cargando el catálogo:", error);

        contenedorCatalogo.innerHTML = `

            <div class="catalog-empty">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>No se pudo cargar el catálogo</h3>

                <p>
                    Verifica que Spring Boot esté funcionando
                    e intenta actualizar la página.
                </p>

            </div>

        `;

    }

}


/* 12. ACTUALIZAR PRECIO MAXIMO */

function actualizarPrecioMaximo() {

    if (productosCatalogo.length === 0) return;

    const precios = productosCatalogo.map(producto =>

        Number(producto.precio)

    );

    const precioMaximo = Math.max(...precios, 25000);

    const precioMinimo = Math.min(...precios, 25000);

    filtroPrecio.min = Math.floor(precioMinimo / 1000) * 1000;

    filtroPrecio.max = Math.ceil(precioMaximo / 1000) * 1000;

    filtroPrecio.value = filtroPrecio.max;

    valorPrecio.textContent = formatoPrecioCatalogo(filtroPrecio.value);

}


/* 13. MOSTRAR PRODUCTOS */

function mostrarCatalogo(lista) {

    if (!contenedorCatalogo) return;

    contadorProductos.textContent =
        `${lista.length} productos`;

    if (lista.length === 0) {

        contenedorCatalogo.innerHTML = `

            <div class="catalog-empty">

                <i class="fa-solid fa-magnifying-glass"></i>

                <h3>No encontramos repuestos</h3>

                <p>
                    Intenta cambiar los filtros
                    o realizar otra búsqueda.
                </p>

            </div>

        `;

        return;

    }


    contenedorCatalogo.innerHTML = lista.map(producto => `

        <article class="catalog-product-card">

            <div class="catalog-product-image">

                ${
                    producto.imagen_url

                    ? `

                        <img
                            src="${escaparCatalogo(producto.imagen_url)}"
                            alt="${escaparCatalogo(producto.nombre)}"
                            loading="lazy"
                        >

                    `

                    : `

                        <div class="catalog-product-placeholder">

                            <i class="fa-solid ${producto.icono}"></i>

                        </div>

                    `
                }

            </div>


            <div class="catalog-product-info">

                <h3>${escaparCatalogo(producto.nombre)}</h3>

                <p class="catalog-product-brand">
                    ${escaparCatalogo(producto.marca)}
                </p>

                <p class="catalog-product-reference">
                    Ref: ${escaparCatalogo(producto.referencia)}
                </p>

                <span class="catalog-product-price">
                    ${formatoPrecioCatalogo(producto.precio)}
                </span>

                <p class="catalog-product-stock">

                    ${
                        producto.stock > 0

                        ? `

                            <i class="fa-solid fa-circle-check"></i>
                            ${producto.stock} unidades disponibles

                        `

                        : `

                            <i class="fa-solid fa-circle-xmark"></i>
                            Producto agotado

                        `
                    }

                </p>

                <button
                    class="catalog-add-btn"
                    data-producto="${producto.id}"
                    ${producto.stock <= 0 ? "disabled" : ""}>

                    <i class="fa-solid fa-cart-shopping"></i>

                    ${
                        producto.stock > 0
                            ? "Agregar al carrito"
                            : "Producto agotado"
                    }

                </button>

                <a
                    class="catalog-detail-btn"
                    href="producto.html?id=${producto.id}">

                    <i class="fa-solid fa-eye"></i>

                    Ver detalle

                </a>

            </div>

        </article>

    `).join("");


    // Mostramos una imagen provisional si alguna fotografía no carga
    contenedorCatalogo.querySelectorAll(".catalog-product-image img")
        .forEach(imagen => {

            imagen.addEventListener("error", function() {

                const contenedor = this.parentElement;

                contenedor.innerHTML = `

                    <div class="catalog-product-placeholder">

                        <i class="fa-solid fa-gears"></i>

                    </div>

                `;

            });

        });

}


/* 14. APLICAR FILTROS */

function aplicarFiltros() {

    let resultado = [...productosCatalogo];


    // 1. BUSQUEDA POR NOMBRE, MARCA O REFERENCIA
    const texto = buscador.value.trim().toLowerCase();

    if (texto) {

        resultado = resultado.filter(producto => {

            return (

                producto.nombre.toLowerCase().includes(texto) ||

                producto.marca.toLowerCase().includes(texto) ||

                producto.referencia.toLowerCase().includes(texto)

            );

        });

    }


    // 2. FILTRO POR CATEGORIA
    const categoriasSeleccionadas = [

        ...document.querySelectorAll(".category-filter:checked")

    ].map(input => input.value);

    if (categoriasSeleccionadas.length > 0) {

        resultado = resultado.filter(producto =>

            categoriasSeleccionadas.includes(producto.categoria)

        );

    }


    // 3. FILTRO POR MARCA
    const marcasSeleccionadas = [

        ...document.querySelectorAll(".brand-filter:checked")

    ].map(input => input.value);

    if (marcasSeleccionadas.length > 0) {

        resultado = resultado.filter(producto =>

            marcasSeleccionadas.includes(producto.marca)

        );

    }


    // 4. FILTRO POR PRECIO
    const precioMaximo = Number(filtroPrecio.value);

    resultado = resultado.filter(producto =>

        Number(producto.precio) <= precioMaximo

    );


    // 5. FILTRO POR EXISTENCIAS
    if (filtroStock.checked) {

        resultado = resultado.filter(producto =>

            Number(producto.stock) > 0

        );

    }


    // 6. FILTRO POR VEHICULO COMPATIBLE
    if (vehiculoFiltroActivo) {

        resultado = resultado.filter(producto =>

            producto.compatibilidadIds.includes(
                vehiculoFiltroActivo.id
            )

        );

    }


    // 7. ORDENAR PRODUCTOS
    switch (ordenarProductos.value) {

        case "price-low":

            resultado.sort((a, b) => a.precio - b.precio);

            break;

        case "price-high":

            resultado.sort((a, b) => b.precio - a.precio);

            break;

        case "name":

            resultado.sort((a, b) =>

                a.nombre.localeCompare(b.nombre, "es")

            );

            break;

    }


    // 8. MOSTRAR RESULTADOS
    mostrarCatalogo(resultado);

}


/* 15. ACTUALIZAR PRECIO */

function actualizarPrecio() {

    valorPrecio.textContent =
        formatoPrecioCatalogo(Number(filtroPrecio.value));

    aplicarFiltros();

}


/* 16. LIMPIAR FILTROS */

document.getElementById("clear-filters")
    .addEventListener("click", function() {

        buscador.value = "";

        document.querySelectorAll(
            ".category-filter, .brand-filter"
        ).forEach(input => {

            input.checked = false;

        });

        filtroPrecio.value = filtroPrecio.max;

        filtroStock.checked = false;

        ordenarProductos.value = "default";

        vehiculoFiltroActivo = null;

        actualizarPrecio();

    });


/* 17. EVENTOS DE LOS FILTROS */

buscador.addEventListener("input", aplicarFiltros);

filtroPrecio.addEventListener("input", actualizarPrecio);

filtroStock.addEventListener("change", aplicarFiltros);

ordenarProductos.addEventListener("change", aplicarFiltros);


/* 18. AGREGAR AL CARRITO */

let carritoCatalogo = [];

try {

    carritoCatalogo = JSON.parse(

        localStorage.getItem("carrito_mundo_repuestos") || "[]"

    );

    if (!Array.isArray(carritoCatalogo)) {

        carritoCatalogo = [];

    }

} catch (error) {

    carritoCatalogo = [];

}


/* 19. ACTUALIZAR CONTADOR DEL CARRITO */

function actualizarContadorCatalogo() {

    const contador = document.querySelector(".cart-count");

    if (!contador) return;

    const cantidad = carritoCatalogo.reduce(

        (total, producto) =>

            total + Number(producto.cantidad),

        0

    );

    contador.textContent = cantidad;

}


/* 20. EVENTO AGREGAR PRODUCTO */

document.addEventListener("click", function(event) {

    const boton = event.target.closest("[data-producto]");

    if (!boton) return;

    const id = Number(boton.dataset.producto);

    const producto = productosCatalogo.find(item =>

        Number(item.id) === id

    );

    if (!producto) return;

    if (producto.stock <= 0) {

        alert("Este producto no tiene existencias disponibles.");

        return;

    }

    const existente = carritoCatalogo.find(item =>

        Number(item.id) === id

    );

    if (existente) {

        if (Number(existente.cantidad) >= producto.stock) {

            alert("No hay más unidades disponibles.");

            return;

        }

        existente.cantidad++;

    } else {

        carritoCatalogo.push({

            ...producto,

            cantidad: 1

        });

    }

    localStorage.setItem(

        "carrito_mundo_repuestos",

        JSON.stringify(carritoCatalogo)

    );

    actualizarContadorCatalogo();

    boton.innerHTML =
        '<i class="fa-solid fa-check"></i> Agregado';

});


/* 21. OBTENER VEHICULOS REGISTRADOS */

function obtenerVehiculosParaBusqueda() {

    return vehiculosCatalogo;

}


/* 22. OBTENER VALORES SIN REPETIR */

function valoresUnicosVehiculo(vehiculos, campo) {

    return [...new Set(

        vehiculos

            .map(vehiculo => String(vehiculo[campo] ?? "").trim())

            .filter(Boolean)

    )].sort((a, b) =>

        a.localeCompare(b, "es", { numeric: true })

    );

}


/* 23. LLENAR SELECT */

function llenarSelectVehiculo(selector, textoInicial, valores) {

    selector.innerHTML = "";

    const opcionInicial = document.createElement("option");

    opcionInicial.value = "";

    opcionInicial.textContent = textoInicial;

    selector.appendChild(opcionInicial);

    valores.forEach(valor => {

        const opcion = document.createElement("option");

        opcion.value = valor;

        opcion.textContent = valor;

        selector.appendChild(opcion);

    });

    selector.disabled = valores.length === 0;

}


/* 24. REINICIAR FILTROS INFERIORES */

function reiniciarFiltrosInferiores() {

    llenarSelectVehiculo(

        filtroLineaVehiculo,

        "Selecciona línea",

        []

    );

    llenarSelectVehiculo(

        filtroAnioVehiculo,

        "Selecciona año",

        []

    );

    llenarSelectVehiculo(

        filtroMotorVehiculo,

        "Selecciona motor",

        []

    );

    botonBuscarVehiculo.disabled = true;

}


/* 25. CARGAR MARCAS DE VEHICULOS */

function inicializarFiltroVehiculo() {

    llenarSelectVehiculo(

        filtroMarcaVehiculo,

        "Selecciona marca",

        valoresUnicosVehiculo(
            vehiculosCatalogo,
            "marca"
        )

    );

    reiniciarFiltrosInferiores();

}


/* 26. CAMBIAR MARCA DEL VEHICULO */

filtroMarcaVehiculo.addEventListener("change", function() {

    vehiculoFiltroActivo = null;

    const filtrados = vehiculosCatalogo.filter(vehiculo =>

        vehiculo.marca === this.value

    );

    llenarSelectVehiculo(

        filtroLineaVehiculo,

        "Selecciona línea",

        valoresUnicosVehiculo(filtrados, "linea")

    );

    llenarSelectVehiculo(

        filtroAnioVehiculo,

        "Selecciona año",

        []

    );

    llenarSelectVehiculo(

        filtroMotorVehiculo,

        "Selecciona motor",

        []

    );

    botonBuscarVehiculo.disabled = true;

    aplicarFiltros();

});


/* 27. CAMBIAR LINEA */

filtroLineaVehiculo.addEventListener("change", function() {

    vehiculoFiltroActivo = null;

    const filtrados = vehiculosCatalogo.filter(vehiculo =>

        vehiculo.marca === filtroMarcaVehiculo.value &&

        vehiculo.linea === this.value

    );

    llenarSelectVehiculo(

        filtroAnioVehiculo,

        "Selecciona año",

        valoresUnicosVehiculo(filtrados, "modelo")

    );

    llenarSelectVehiculo(

        filtroMotorVehiculo,

        "Selecciona motor",

        []

    );

    botonBuscarVehiculo.disabled = true;

    aplicarFiltros();

});


/* 28. CAMBIAR AÑO */

filtroAnioVehiculo.addEventListener("change", function() {

    vehiculoFiltroActivo = null;

    const filtrados = vehiculosCatalogo.filter(vehiculo =>

        vehiculo.marca === filtroMarcaVehiculo.value &&

        vehiculo.linea === filtroLineaVehiculo.value &&

        String(vehiculo.modelo) === this.value

    );

    llenarSelectVehiculo(

        filtroMotorVehiculo,

        "Selecciona motor",

        valoresUnicosVehiculo(filtrados, "motor")

    );

    botonBuscarVehiculo.disabled = true;

    aplicarFiltros();

});


/* 29. CAMBIAR MOTOR */

filtroMotorVehiculo.addEventListener("change", function() {

    vehiculoFiltroActivo = null;

    botonBuscarVehiculo.disabled = !this.value;

    aplicarFiltros();

});


/* 30. BUSCAR REPUESTOS COMPATIBLES */

botonBuscarVehiculo.addEventListener("click", function() {

    const marca = filtroMarcaVehiculo.value;

    const linea = filtroLineaVehiculo.value;

    const modelo = filtroAnioVehiculo.value;

    const motor = filtroMotorVehiculo.value;

    if (!marca || !linea || !modelo || !motor) {

        alert("Selecciona todos los datos de tu vehículo.");

        return;

    }

    const vehiculo = vehiculosCatalogo.find(item =>

        item.marca === marca &&

        item.linea === linea &&

        String(item.modelo) === modelo &&

        item.motor === motor

    );

    if (!vehiculo) {

        alert("No se encontró el vehículo seleccionado.");

        return;

    }

    vehiculoFiltroActivo = {

        id: Number(vehiculo.id_vehiculo),

        nombre:
            `${vehiculo.marca} ${vehiculo.linea} ${vehiculo.modelo} · ${vehiculo.motor}`

    };

    aplicarFiltros();

});


/* 31. LIMPIAR BUSQUEDA POR VEHICULO */

botonLimpiarVehiculo.addEventListener("click", function() {

    vehiculoFiltroActivo = null;

    filtroMarcaVehiculo.value = "";

    reiniciarFiltrosInferiores();

    aplicarFiltros();

});


/* 32. INICIAR CATALOGO */

document.addEventListener("DOMContentLoaded", function() {

    // Cargamos todos los datos desde Spring Boot y MySQL
    cargarCatalogo();

});
