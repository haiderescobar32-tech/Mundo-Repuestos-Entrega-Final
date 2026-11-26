
/* ==========================================
   MUNDO REPUESTOS - ADMINISTRACION DE PRODUCTOS
   CONEXION CON SPRING BOOT Y MYSQL
   ========================================== */


/* 1. DIRECCIONES DE LAS API */

const API_URL = "/api/productos";
const API_INVENTARIO = "/api/inventario";

let productosAdmin = [];
let inventariosAdmin = [];

let productoEditando = null;
let imagenSeleccionada = "";


/* 2. ELEMENTOS DEL FORMULARIO */

const formularioProducto = document.getElementById("form-producto");

const inputImagen = document.getElementById("imagen-producto");

const previewImagen = document.getElementById("preview-imagen");

const listaProductos = document.getElementById("lista-productos-admin");

const buscadorProductos = document.getElementById("buscar-producto-admin");

const cantidadRegistrados = document.getElementById("cantidad-registrados");

const mensajeSinProductos = document.getElementById("sin-productos");

const tituloFormulario = document.getElementById("form-title");

const botonGuardar = document.querySelector(".product-save-button");


// Campos correspondientes al inventario
const inputStock = document.getElementById("stock-producto");

const inputStockMinimo = document.getElementById("stock-minimo");


/* ==========================================
   CARGAR VEHICULOS REGISTRADOS
   ========================================== */

function cargarVehiculosCompatibles() {

    const selector = document.getElementById(
        "vehiculos-compatibles"
    );

    // Conservamos la carga de vehículos que ya tenía el proyecto
    let vehiculos = [];

    try {

        vehiculos = JSON.parse(
            localStorage.getItem("vehiculos_mundo_repuestos") || "[]"
        );

    } catch (error) {

        console.error("Error recuperando vehículos:", error);

    }

    selector.innerHTML = "";

    if (vehiculos.length === 0) {

        const opcion = document.createElement("option");

        opcion.textContent = "Primero registra un vehículo";

        opcion.disabled = true;

        selector.appendChild(opcion);

        return;

    }

    vehiculos.forEach(vehiculo => {

        const opcion = document.createElement("option");

        opcion.value = vehiculo.id;

        opcion.textContent =
            `${vehiculo.marca} ${vehiculo.linea} ${vehiculo.anio} · ${vehiculo.motor}`;

        selector.appendChild(opcion);

    });

}


/* 3. FORMATO DE PRECIOS */

function formatoPrecioAdmin(precio) {

    return new Intl.NumberFormat("es-CO", {

        style: "currency",

        currency: "COP",

        maximumFractionDigits: 0

    }).format(Number(precio) || 0);

}


/* 4. PROTEGER TEXTOS MOSTRADOS EN HTML */

function escaparHTML(texto) {

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


/* 5. CONSULTAR PRODUCTOS E INVENTARIO DESDE MYSQL */

async function cargarProductosAdmin() {

    try {

        // Consultamos PRODUCTOS e INVENTARIO al mismo tiempo
        const [respuestaProductos, respuestaInventario] =
            await Promise.all([

                fetch(API_URL),

                fetch(API_INVENTARIO)

            ]);

        if (!respuestaProductos.ok || !respuestaInventario.ok) {

            throw new Error("Error al consultar productos o inventario.");

        }

        // Recuperamos los registros de ambas tablas
        productosAdmin = await respuestaProductos.json();

        inventariosAdmin = await respuestaInventario.json();

        // Mostramos los productos con sus existencias correspondientes
        mostrarProductosAdmin(buscadorProductos.value);

        console.log("Productos cargados desde MySQL:", productosAdmin);

        console.log("Inventarios cargados desde MySQL:", inventariosAdmin);

    } catch (error) {

        console.error("Error al cargar productos:", error);

        alert("No se pudieron consultar los productos y el inventario.");

    }

}


/* 6. BUSCAR INVENTARIO DE UN PRODUCTO */

function obtenerInventarioAdmin(idProducto) {

    return inventariosAdmin.find(registro =>

        Number(registro.id_producto) === Number(idProducto)

    ) || null;

}


/* 7. PREPARAR Y COMPRIMIR FOTOGRAFIAS */

function comprimirImagen(archivo) {

    return new Promise((resolve, reject) => {

        const lector = new FileReader();

        lector.onload = function(evento) {

            const imagen = new Image();

            imagen.onload = function() {

                const canvas = document.createElement("canvas");

                const MAXIMO = 1000;

                let ancho = imagen.width;

                let alto = imagen.height;

                if (ancho > alto && ancho > MAXIMO) {

                    alto = alto * (MAXIMO / ancho);

                    ancho = MAXIMO;

                } else if (alto > MAXIMO) {

                    ancho = ancho * (MAXIMO / alto);

                    alto = MAXIMO;

                }

                canvas.width = ancho;

                canvas.height = alto;

                const contexto = canvas.getContext("2d");

                contexto.drawImage(imagen, 0, 0, ancho, alto);

                const imagenComprimida = canvas.toDataURL(
                    "image/jpeg",
                    0.75
                );

                resolve(imagenComprimida);

            };

            imagen.onerror = () => reject(
                new Error("No se pudo procesar la fotografía.")
            );

            imagen.src = evento.target.result;

        };

        lector.onerror = () => reject(
            new Error("No se pudo leer el archivo.")
        );

        lector.readAsDataURL(archivo);

    });

}


/* 8. SELECCIONAR Y MOSTRAR FOTOGRAFIA */

inputImagen.addEventListener("change", async function() {

    const archivo = inputImagen.files[0];

    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {

        alert("Selecciona un archivo de imagen válido.");

        inputImagen.value = "";

        return;

    }

    if (archivo.size > 5 * 1024 * 1024) {

        alert("La fotografía no debe superar los 5 MB.");

        inputImagen.value = "";

        return;

    }

    try {

        // Comprimimos la imagen para mostrar una vista previa
        imagenSeleccionada = await comprimirImagen(archivo);

        previewImagen.innerHTML = `

            <img
                src="${imagenSeleccionada}"
                alt="Vista previa del producto">

        `;

    } catch (error) {

        alert(error.message);

        imagenSeleccionada = "";

    }

});


/* 9. RESTAURAR VISTA PREVIA */

function restaurarImagen() {

    imagenSeleccionada = "";

    inputImagen.value = "";

    previewImagen.innerHTML = `

        <i class="fa-solid fa-cloud-arrow-up"></i>

        <strong>Seleccionar fotografía</strong>

        <span>
            Haz clic para buscar una imagen en tu computador.
        </span>

    `;

}


/* 10. MOSTRAR PRODUCTOS EN LA TABLA */

function mostrarProductosAdmin(filtro = "") {

    const texto = filtro.trim().toLowerCase();

    const resultados = productosAdmin.filter(producto => {

        return (

            (producto.nombre_producto || "").toLowerCase().includes(texto) ||

            (producto.referencia || "").toLowerCase().includes(texto) ||

            (producto.marca || "").toLowerCase().includes(texto)

        );

    });

    cantidadRegistrados.textContent =
        `${productosAdmin.length} productos`;

    mensajeSinProductos.style.display =
        productosAdmin.length === 0 ? "block" : "none";

    if (resultados.length === 0) {

        listaProductos.innerHTML = "";

        return;

    }

    listaProductos.innerHTML = resultados.map(producto => {

        // Recuperamos el inventario asociado al producto
        const inventario = obtenerInventarioAdmin(producto.id);

        const stock = inventario
            ? Number(inventario.stock_actual)
            : 0;

        // Mostramos la fotografía real si existe
        const imagenHTML = producto.imagen_url

            ? `

                <img
                    src="${escaparHTML(producto.imagen_url)}"
                    alt="${escaparHTML(producto.nombre_producto)}"
                    style="width:45px;height:45px;object-fit:contain;">

            `

            : `

                <i class="fa-solid fa-gears"></i>

            `;

        return `

            <tr>

                <td>

                    <div class="admin-product-image">

                        ${imagenHTML}

                    </div>

                </td>

                <td>${escaparHTML(producto.nombre_producto)}</td>

                <td>${escaparHTML(producto.referencia)}</td>

                <td>${escaparHTML(producto.marca)}</td>

                <td class="admin-product-price">

                    ${formatoPrecioAdmin(producto.precio_venta)}

                </td>

                <td>

                    <strong>${stock} unidades</strong>

                </td>

                <td>

                    <div class="admin-product-actions">

                        <button
                            type="button"
                            class="edit-product"
                            data-action="edit"
                            data-id="${producto.id}">

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button
                            type="button"
                            class="delete-product"
                            data-action="delete"
                            data-id="${producto.id}">

                            <i class="fa-solid fa-trash-can"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `;

    }).join("");


    // Si una fotografía no carga, mostramos un icono provisional
    listaProductos.querySelectorAll("img").forEach(imagen => {

        imagen.addEventListener("error", function() {

            this.replaceWith(

                Object.assign(document.createElement("i"), {

                    className: "fa-solid fa-gears"

                })

            );

        });

    });

}


/* 11. MOSTRAR FOTOGRAFIA EXISTENTE AL EDITAR */

function mostrarImagenExistente(ruta) {

    if (!ruta) {

        restaurarImagen();

        return;

    }

    // Mostramos la fotografía que ya tiene el producto en MySQL
    previewImagen.innerHTML = `

        <img
            src="${escaparHTML(ruta)}"
            alt="Fotografía actual del producto">

        <span>Fotografía actual del producto</span>

    `;

    // No seleccionamos un archivo nuevo
    imagenSeleccionada = "";

    inputImagen.value = "";

}


/* 12. REGISTRAR O ACTUALIZAR PRODUCTO, INVENTARIO Y FOTOGRAFIA */

formularioProducto.addEventListener("submit", async function(evento) {

    evento.preventDefault();

    // Recuperamos los datos comerciales del formulario
    const producto = {

        nombre_producto: document.getElementById("nombre-producto").value.trim(),

        referencia: document.getElementById("referencia-producto").value.trim(),

        marca: document.getElementById("marca-producto").value.trim(),

        categoria: document.getElementById("categoria-producto").value,

        descripcion: document.getElementById("descripcion-producto").value.trim(),

        precio_compra: Number(document.getElementById("precio-compra").value),

        precio_venta: Number(document.getElementById("precio-producto").value),

        estado: document.getElementById("estado-producto").value

    };


    // Recuperamos las existencias y el stock mínimo
    const stockActual = Number(inputStock.value);

    const stockMinimo = Number(inputStockMinimo.value);

    if (

        !Number.isInteger(stockActual) ||

        stockActual < 0 ||

        !Number.isInteger(stockMinimo) ||

        stockMinimo < 0

    ) {

        alert("Verifica que las existencias y el stock mínimo sean números enteros positivos.");

        return;

    }


    // Recuperamos la fotografía original seleccionada
    const archivoImagen = inputImagen.files[0];

    // Recuperamos la ubicación existente para no perderla al editar
    const inventarioAnterior = productoEditando

        ? obtenerInventarioAdmin(productoEditando)

        : null;

    const ubicacion = inventarioAnterior
        ? inventarioAnterior.ubicacion || ""
        : "";

    try {

        botonGuardar.disabled = true;

        botonGuardar.textContent = "Guardando...";


        /* 12.1. GUARDAR DATOS DEL PRODUCTO */

        const respuesta = await fetch(

            productoEditando

                ? `${API_URL}/${productoEditando}`

                : API_URL,

            {

                method: productoEditando ? "PUT" : "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(producto)

            }

        );

        if (!respuesta.ok) {

            throw new Error("No se pudo guardar el producto.");

        }

        // Recuperamos el producto y su identificador de MySQL
        const productoGuardado = await respuesta.json();

        const idProducto = Number(productoGuardado.id);

        console.log("Producto guardado:", productoGuardado);


        /* 12.2. GUARDAR O ACTUALIZAR INVENTARIO */

        const datosInventario = {

            id_producto: idProducto,

            stock_actual: stockActual,

            stock_minimo: stockMinimo,

            ubicacion: ubicacion

        };

        // Este endpoint crea el inventario si no existe
        // o actualiza el registro si ya estaba creado
        const respuestaInventario = await fetch(

            `${API_INVENTARIO}/producto/${idProducto}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(datosInventario)

            }

        );

        if (!respuestaInventario.ok) {

            throw new Error(
                "El producto se guardó, pero no se pudo actualizar su inventario."
            );

        }

        const inventarioGuardado = await respuestaInventario.json();

        console.log("Inventario guardado:", inventarioGuardado);


        /* 12.3. SUBIR FOTOGRAFIA AL SERVIDOR */

        if (archivoImagen) {

            // Preparamos la fotografía para enviarla al backend
            const formularioImagen = new FormData();

            formularioImagen.append("imagen", archivoImagen);

            // Enviamos la fotografía al producto correspondiente
            const respuestaImagen = await fetch(

                `${API_URL}/${idProducto}/imagen`,

                {

                    method: "POST",

                    body: formularioImagen

                }

            );

            if (!respuestaImagen.ok) {

                throw new Error(
                    "El producto y el inventario se guardaron, pero no se pudo subir la fotografía."
                );

            }

            const productoConImagen = await respuestaImagen.json();

            console.log(
                "Fotografía guardada:",
                productoConImagen.imagen_url
            );

        }


        /* 12.4. LIMPIAR FORMULARIO */

        alert(

            productoEditando

                ? "Producto e inventario actualizados correctamente."

                : "Producto e inventario registrados correctamente."

        );

        formularioProducto.reset();

        productoEditando = null;

        restaurarImagen();

        // Recuperamos el valor predeterminado del stock mínimo
        inputStockMinimo.value = 3;

        botonGuardar.innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i> GUARDAR PRODUCTO';

        tituloFormulario.innerHTML =
            '<i class="fa-solid fa-circle-plus"></i> Registrar nuevo producto';

        // Consultamos nuevamente PRODUCTOS e INVENTARIO
        await cargarProductosAdmin();

    } catch (error) {

        console.error("Error al guardar producto, inventario o fotografía:", error);

        alert(error.message || "No se pudo completar el registro.");

        // Actualizamos los datos para mostrar lo que sí se alcanzó a guardar
        await cargarProductosAdmin();

    } finally {

        botonGuardar.disabled = false;

    }

});


/* 13. EDITAR Y ELIMINAR PRODUCTOS */

listaProductos.addEventListener("click", async function(evento) {

    const boton = evento.target.closest("[data-action]");

    if (!boton) return;

    const id = Number(boton.dataset.id);

    const producto = productosAdmin.find(item =>

        Number(item.id) === id

    );

    if (!producto) return;


    /* EDITAR PRODUCTO */

    if (boton.dataset.action === "edit") {

        productoEditando = id;

        // Recuperamos los datos comerciales del producto
        document.getElementById("nombre-producto").value =
            producto.nombre_producto || "";

        document.getElementById("referencia-producto").value =
            producto.referencia || "";

        document.getElementById("marca-producto").value =
            producto.marca || "";

        document.getElementById("categoria-producto").value =
            producto.categoria || "";

        document.getElementById("descripcion-producto").value =
            producto.descripcion || "";

        document.getElementById("precio-compra").value =
            producto.precio_compra ?? "";

        document.getElementById("precio-producto").value =
            producto.precio_venta ?? "";

        document.getElementById("estado-producto").value =
            producto.estado || "ACTIVO";


        // Recuperamos el inventario asociado al producto
        let inventario = obtenerInventarioAdmin(id);


        
        // Si no está en la lista, consultamos directamente su API
        if (!inventario) {

            try {

                const respuestaInventario = await fetch(
                    `${API_INVENTARIO}/producto/${id}`
                );

                // Si no existe el inventario, permitimos crearlo después
                if (respuestaInventario.ok) {

                    // Leemos la respuesta como texto para evitar
                    // errores cuando Spring Boot devuelve un cuerpo vacío
                    const textoInventario = await respuestaInventario.text();

                    inventario = textoInventario.trim()
                        ? JSON.parse(textoInventario)
                        : null;

                } else if (respuestaInventario.status === 404) {

                    inventario = null;

                } else {

                    throw new Error("No se pudo consultar el inventario.");

                }

            } catch (error) {

                console.error("Error consultando inventario:", error);

                alert("No se pudo recuperar el inventario del producto.");

                return;

            }

        }



        // Si el producto tiene inventario, cargamos sus cantidades
        inputStock.value = inventario

            ? Number(inventario.stock_actual)

            : 0;

        inputStockMinimo.value = inventario

            ? Number(inventario.stock_minimo)

            : 3;


        // Mostramos la fotografía que ya tiene el producto
        mostrarImagenExistente(producto.imagen_url);


        // Actualizamos el título del formulario
        tituloFormulario.innerHTML = `

            <i class="fa-solid fa-pen"></i>

            Editar producto

        `;

        botonGuardar.innerHTML = `

            <i class="fa-solid fa-floppy-disk"></i>

            ACTUALIZAR PRODUCTO

        `;


        // Desplazamos la pantalla hacia el formulario
        formularioProducto.scrollIntoView({

            behavior: "smooth"

        });

    }


    /* ELIMINAR PRODUCTO */

    if (boton.dataset.action === "delete") {

        const confirmar = confirm(

            `¿Seguro que deseas eliminar "${producto.nombre_producto}"?`

        );

        if (!confirmar) return;

        try {

            const respuesta = await fetch(

                `${API_URL}/${id}`,

                {

                    method: "DELETE"

                }

            );

            if (!respuesta.ok) {

                throw new Error("No se pudo eliminar el producto.");

            }

            alert("Producto eliminado correctamente.");

            await cargarProductosAdmin();

        } catch (error) {

            console.error("Error al eliminar:", error);

            alert("No se pudo eliminar el producto.");

        }

    }

});


/* 14. BUSCADOR */

buscadorProductos.addEventListener("input", function() {

    mostrarProductosAdmin(buscadorProductos.value);

});


/* 15. LIMPIAR FORMULARIO */

document.getElementById("cancelar-producto")
    .addEventListener("click", function() {

        // Salimos del modo edición
        productoEditando = null;

        // Limpiamos la fotografía seleccionada
        restaurarImagen();

        // Restablecemos el stock mínimo predeterminado
        inputStockMinimo.value = 3;

        tituloFormulario.innerHTML = `

            <i class="fa-solid fa-circle-plus"></i>

            Registrar nuevo producto

        `;

        botonGuardar.innerHTML = `

            <i class="fa-solid fa-floppy-disk"></i>

            GUARDAR PRODUCTO

        `;

    });


/* 16. INICIAR ADMINISTRADOR */

document.addEventListener("DOMContentLoaded", function() {

    // Cargamos los vehículos y los datos de MySQL
    cargarVehiculosCompatibles();

    cargarProductosAdmin();

});
