package com.crud.work.demo.controller;

import com.crud.work.demo.model.detalle_pedidos;
import com.crud.work.demo.repository.detalle_pedidosRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/detalle-pedidos")
public class detalle_pedidosController {

    private final detalle_pedidosRepository detalleRepository;

    public detalle_pedidosController(
            detalle_pedidosRepository detalleRepository) {
        this.detalleRepository = detalleRepository;
    }

    // Consultar todos los detalles
    @GetMapping
    public List<detalle_pedidos> getAllDetalles() {
        return detalleRepository.findAll();
    }

    // Consultar un detalle por ID
    @GetMapping("/{id}")
    public detalle_pedidos getDetalle(@PathVariable Integer id) {
        return detalleRepository.findById(id).orElse(null);
    }

    // Registrar un detalle de pedido
    @PostMapping
    public detalle_pedidos saveDetalle(
            @RequestBody detalle_pedidos detalle) {
        return detalleRepository.save(detalle);
    }

    // Actualizar un detalle
    @PutMapping("/{id}")
    public detalle_pedidos updateDetalle(
            @PathVariable Integer id,
            @RequestBody detalle_pedidos detalleActualizado) {

        return detalleRepository.findById(id).map(detalle -> {

            detalle.setId_pedido(detalleActualizado.getId_pedido());
            detalle.setId_producto(detalleActualizado.getId_producto());
            detalle.setCantidad(detalleActualizado.getCantidad());
            detalle.setPrecio_unitario(detalleActualizado.getPrecio_unitario());
            detalle.setSubtotal(detalleActualizado.getSubtotal());

            return detalleRepository.save(detalle);

        }).orElse(null);
    }

    // Eliminar un detalle
    @DeleteMapping("/{id}")
    public String deleteDetalle(@PathVariable Integer id) {

        detalleRepository.deleteById(id);

        return "Detalle de pedido eliminado correctamente";
    }
}
