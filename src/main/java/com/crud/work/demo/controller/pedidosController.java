package com.crud.work.demo.controller;

import com.crud.work.demo.model.pedidos;
import com.crud.work.demo.repository.pedidosRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/pedidos")
public class pedidosController {

    private final pedidosRepository pedidosRepository;

    public pedidosController(pedidosRepository pedidosRepository) {
        this.pedidosRepository = pedidosRepository;
    }

    // Consultar todos los pedidos
    @GetMapping
    public List<pedidos> getAllPedidos() {
        return pedidosRepository.findAll();
    }

    // Consultar un pedido por ID
    @GetMapping("/{id}")
    public pedidos getPedido(@PathVariable Integer id) {
        return pedidosRepository.findById(id).orElse(null);
    }

    // Registrar un pedido
    @PostMapping
    public pedidos savePedido(@RequestBody pedidos pedido) {

        if (pedido.getFecha_pedido() == null) {
            pedido.setFecha_pedido(LocalDateTime.now());
        }

        if (pedido.getEstado_pedido() == null) {
            pedido.setEstado_pedido("PENDIENTE");
        }

        return pedidosRepository.save(pedido);
    }

    // Actualizar un pedido
    @PutMapping("/{id}")
    public pedidos updatePedido(
            @PathVariable Integer id,
            @RequestBody pedidos pedidoActualizado) {

        return pedidosRepository.findById(id).map(pedido -> {

            pedido.setNumero_pedido(pedidoActualizado.getNumero_pedido());
            pedido.setId_persona(pedidoActualizado.getId_persona());
            pedido.setFecha_pedido(pedidoActualizado.getFecha_pedido());
            pedido.setDireccion_entrega(pedidoActualizado.getDireccion_entrega());
            pedido.setMetodo_pago(pedidoActualizado.getMetodo_pago());
            pedido.setEstado_pedido(pedidoActualizado.getEstado_pedido());
            pedido.setTotal(pedidoActualizado.getTotal());

            return pedidosRepository.save(pedido);

        }).orElse(null);
    }

    // Eliminar un pedido
    @DeleteMapping("/{id}")
    public String deletePedido(@PathVariable Integer id) {

        pedidosRepository.deleteById(id);

        return "Pedido eliminado correctamente";
    }
}
