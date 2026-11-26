package com.crud.work.demo.controller;

import com.crud.work.demo.model.compatibilidad;
import com.crud.work.demo.repository.compatibilidadRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compatibilidad")
public class compatibilidadController {

    private final compatibilidadRepository compatibilidadRepository;

    public compatibilidadController(
            compatibilidadRepository compatibilidadRepository) {
        this.compatibilidadRepository = compatibilidadRepository;
    }

    // Consultar todas las compatibilidades
    @GetMapping
    public List<compatibilidad> getAllCompatibilidades() {
        return compatibilidadRepository.findAll();
    }

    // Consultar una compatibilidad por ID
    @GetMapping("/{id}")
    public compatibilidad getCompatibilidad(@PathVariable Integer id) {
        return compatibilidadRepository.findById(id).orElse(null);
    }

    // Registrar una nueva compatibilidad
    @PostMapping
    public compatibilidad saveCompatibilidad(
            @RequestBody compatibilidad nuevaCompatibilidad) {

        return compatibilidadRepository.save(nuevaCompatibilidad);
    }

    // Actualizar una compatibilidad
    @PutMapping("/{id}")
    public compatibilidad updateCompatibilidad(
            @PathVariable Integer id,
            @RequestBody compatibilidad compatibilidadActualizada) {

        return compatibilidadRepository.findById(id).map(registro -> {

            registro.setId_producto(
                compatibilidadActualizada.getId_producto()
            );

            registro.setId_vehiculo(
                compatibilidadActualizada.getId_vehiculo()
            );

            registro.setObservaciones(
                compatibilidadActualizada.getObservaciones()
            );

            return compatibilidadRepository.save(registro);

        }).orElse(null);
    }

    // Eliminar una compatibilidad
    @DeleteMapping("/{id}")
    public String deleteCompatibilidad(@PathVariable Integer id) {

        compatibilidadRepository.deleteById(id);

        return "Compatibilidad eliminada correctamente";
    }
}
