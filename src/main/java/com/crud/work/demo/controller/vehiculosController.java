package com.crud.work.demo.controller;

import com.crud.work.demo.model.vehiculos;
import com.crud.work.demo.repository.vehiculosRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehiculos")
public class vehiculosController {

    private final vehiculosRepository vehiculosRepository;

    public vehiculosController(vehiculosRepository vehiculosRepository) {
        this.vehiculosRepository = vehiculosRepository;
    }

    // Consultar todos los vehiculos
    @GetMapping
    public List<vehiculos> getAllVehiculos() {
        return vehiculosRepository.findAll();
    }

    // Consultar un vehiculo por ID
    @GetMapping("/{id}")
    public vehiculos getVehiculo(@PathVariable Integer id) {
        return vehiculosRepository.findById(id).orElse(null);
    }

    // Registrar un vehiculo
    @PostMapping
    public vehiculos saveVehiculo(@RequestBody vehiculos vehiculo) {
        return vehiculosRepository.save(vehiculo);
    }

    // Actualizar un vehiculo
    @PutMapping("/{id}")
    public vehiculos updateVehiculo(
            @PathVariable Integer id,
            @RequestBody vehiculos vehiculoActualizado) {

        return vehiculosRepository.findById(id).map(vehiculo -> {

            vehiculo.setMarca(vehiculoActualizado.getMarca());
            vehiculo.setLinea(vehiculoActualizado.getLinea());
            vehiculo.setModelo(vehiculoActualizado.getModelo());
            vehiculo.setMotor(vehiculoActualizado.getMotor());
            vehiculo.setCilindraje(vehiculoActualizado.getCilindraje());
            vehiculo.setCombustible(vehiculoActualizado.getCombustible());

            return vehiculosRepository.save(vehiculo);

        }).orElse(null);
    }

    // Eliminar un vehiculo
    @DeleteMapping("/{id}")
    public String deleteVehiculo(@PathVariable Integer id) {

        vehiculosRepository.deleteById(id);

        return "Vehiculo eliminado correctamente";
    }
}
