package com.crud.work.demo.controller;

import com.crud.work.demo.model.productos;
import com.crud.work.demo.repository.productosRepository;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.io.IOException;

@RestController
@RequestMapping("/api/productos")
public class productosController {

    private final productosRepository productosRepository;

    public productosController(productosRepository productosRepository) {
        this.productosRepository = productosRepository;
    }

    // Consultar un producto por su identificador
    @GetMapping("/{id}")
    public productos getProducto(@PathVariable Long id) {
        return productosRepository.findById(id).orElse(null);
    }

    // Registrar un nuevo producto
    @PostMapping
    public productos saveProductos(@RequestBody productos productos) {
        return productosRepository.save(productos);
    }

    // Actualizar los datos de un producto
    @PutMapping("/{id}")
    public productos updateProductos(
            @PathVariable Long id,
            @RequestBody productos productoActualizado) {

        return productosRepository.findById(id).map(producto -> {

            producto.setNombre_producto(productoActualizado.getNombre_producto());
            producto.setReferencia(productoActualizado.getReferencia());
            producto.setMarca(productoActualizado.getMarca());
            producto.setCategoria(productoActualizado.getCategoria());
            producto.setDescripcion(productoActualizado.getDescripcion());
            producto.setPrecio_compra(productoActualizado.getPrecio_compra());
            producto.setPrecio_venta(productoActualizado.getPrecio_venta());
            producto.setEstado(productoActualizado.getEstado());

            // Conservamos la fotografía si no se envía una nueva ruta
            if (productoActualizado.getImagen_url() != null) {
                producto.setImagen_url(productoActualizado.getImagen_url());
            }

            return productosRepository.save(producto);

        }).orElse(null);
    }

    // Subir y guardar la fotografía de un producto
    @PostMapping(
        value = "/{id}/imagen",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public productos subirImagen(
            @PathVariable Long id,
            @RequestParam("imagen") MultipartFile archivo) throws IOException {

        // Buscamos el producto al que pertenece la fotografía
        productos producto = productosRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Producto no encontrado")
                );

        // Verificamos que se haya seleccionado una fotografía
        if (archivo.isEmpty()) {
            throw new RuntimeException("No se seleccionó ninguna imagen");
        }

        // Validamos los formatos permitidos
        String tipo = archivo.getContentType();

        if (tipo == null ||
            !tipo.matches("image/(jpeg|png|webp)")) {

            throw new RuntimeException(
                "Formato no permitido. Utiliza JPG, PNG o WEBP."
            );
        }

        // Verificamos que la imagen no supere los 5 MB
        if (archivo.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("La imagen supera los 5 MB");
        }

        // Determinamos la extensión de la fotografía
        String extension;

        switch (tipo) {
            case "image/png":
                extension = ".png";
                break;

            case "image/webp":
                extension = ".webp";
                break;

            default:
                extension = ".jpg";
                break;
        }

        // Generamos un nombre único para evitar reemplazar otras imágenes
        String nombreArchivo = UUID.randomUUID() + extension;

        // Ubicación física de las fotografías
        // Primero buscamos los recursos dentro de la carpeta demo
        Path carpetaBase = Paths.get(
            "demo/src/main/resources/static"
        ).toAbsolutePath().normalize();

        // Si ejecutamos Spring Boot directamente desde demo,
        // utilizamos la carpeta src correspondiente
        if (!Files.isDirectory(carpetaBase)) {

            carpetaBase = Paths.get(
                "src/main/resources/static"
            ).toAbsolutePath().normalize();

        }

        // Creamos la carpeta de fotografías dentro del proyecto
        Path carpeta = carpetaBase.resolve("images/productos");

        Files.createDirectories(carpeta);

        // Guardamos el archivo en la carpeta correspondiente
        Path destino = carpeta.resolve(nombreArchivo).normalize();

        if (!destino.getParent().equals(carpeta)) {
            throw new RuntimeException("Ruta de archivo no válida");
        }

        archivo.transferTo(destino);

        // Guardamos la ruta pública de la fotografía en MySQL
        producto.setImagen_url(
            "/images/productos/" + nombreArchivo
        );

        return productosRepository.save(producto);
    }

    // Eliminar un producto
    @DeleteMapping("/{id}")
    public String deleteProductos(@PathVariable Long id) {
        productosRepository.deleteById(id);
        return "Producto eliminado correctamente";
    }

    // Consultar todos los productos
    @GetMapping
    public java.util.List<productos> getAllProductos() {
        return productosRepository.findAll();
    }
}
