
package com.crud.work.demo.controller;

import com.crud.work.demo.model.inventario;
import com.crud.work.demo.repository.inventarioRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
public class inventarioController {

    private final inventarioRepository inventarioRepository;

    public inventarioController(inventarioRepository inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    // Consultar todos los registros de inventario
    @GetMapping
    public List<inventario> getAllInventario() {
        return inventarioRepository.findAll();
    }

    // Consultar un registro por su ID de inventario
    @GetMapping("/{id}")
    public inventario getInventario(@PathVariable Integer id) {
        return inventarioRepository.findById(id).orElse(null);
    }

    // NUEVO: Consultar inventario utilizando el ID del producto
    @GetMapping("/producto/{idProducto}")
    public inventario getInventarioPorProducto(
            @PathVariable Integer idProducto) {

        return inventarioRepository
                .buscarPorIdProducto(idProducto)
                .orElse(null);
    }

    // Registrar inventario
    @PostMapping
    public inventario saveInventario(@RequestBody inventario inventario) {
        return inventarioRepository.save(inventario);
    }

    // Actualizar inventario por su ID de inventario
    @PutMapping("/{id}")
    public inventario updateInventario(
            @PathVariable Integer id,
            @RequestBody inventario inventarioActualizado) {

        return inventarioRepository.findById(id).map(registro -> {

            registro.setId_producto(inventarioActualizado.getId_producto());
            registro.setStock_actual(inventarioActualizado.getStock_actual());
            registro.setStock_minimo(inventarioActualizado.getStock_minimo());
            registro.setUbicacion(inventarioActualizado.getUbicacion());

            return inventarioRepository.save(registro);

        }).orElse(null);
    }

    // NUEVO: Registrar o actualizar inventario por ID del producto
    @PutMapping("/producto/{idProducto}")
    public inventario guardarInventarioPorProducto(
            @PathVariable Integer idProducto,
            @RequestBody inventario datosInventario) {

        // Buscamos si el producto ya tiene un registro de inventario
        inventario registro = inventarioRepository
                .buscarPorIdProducto(idProducto)
                .orElseGet(inventario::new);

        // Asociamos las existencias al producto correspondiente
        registro.setId_producto(idProducto);

        // Actualizamos las cantidades
        registro.setStock_actual(datosInventario.getStock_actual());
        registro.setStock_minimo(datosInventario.getStock_minimo());

        // Actualizamos la ubicación
        registro.setUbicacion(datosInventario.getUbicacion());

        // Guardamos el registro nuevo o actualizado
        return inventarioRepository.save(registro);
    }

    // Eliminar inventario
    @DeleteMapping("/{id}")
    public String deleteInventario(@PathVariable Integer id) {

        inventarioRepository.deleteById(id);

        return "Registro de inventario eliminado correctamente";
    }
}
