package com.crud.work.demo.controller;

import com.crud.work.demo.model.personas;
import com.crud.work.demo.repository.personasRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personas")
public class personasController {

    private final personasRepository personasRepository;

    public personasController(personasRepository personasRepository) {
        this.personasRepository = personasRepository;
    }

    // Consultar todas las personas
    @GetMapping
    public List<personas> getAllPersonas() {
        return personasRepository.findAll();
    }

    // Consultar una persona por ID
    @GetMapping("/{id}")
    public personas getPersona(@PathVariable Integer id) {
        return personasRepository.findById(id).orElse(null);
    }

    // Registrar una persona
    @PostMapping
    public personas savePersona(@RequestBody personas persona) {
        return personasRepository.save(persona);
    }

    // Actualizar una persona
    @PutMapping("/{id}")
    public personas updatePersona(
            @PathVariable Integer id,
            @RequestBody personas personaActualizada) {

        return personasRepository.findById(id).map(persona -> {

            persona.setNombres(personaActualizada.getNombres());
            persona.setApellidos(personaActualizada.getApellidos());
            persona.setTipo_documento(personaActualizada.getTipo_documento());
            persona.setNumero_documento(personaActualizada.getNumero_documento());
            persona.setTelefono(personaActualizada.getTelefono());
            persona.setCorreo(personaActualizada.getCorreo());
            persona.setDireccion(personaActualizada.getDireccion());
            persona.setTipo_persona(personaActualizada.getTipo_persona());
            persona.setEstado(personaActualizada.getEstado());

            return personasRepository.save(persona);

        }).orElse(null);
    }

    // Eliminar una persona
    @DeleteMapping("/{id}")
    public String deletePersona(@PathVariable Integer id) {

        personasRepository.deleteById(id);

        return "Persona eliminada correctamente";
    }


    // Buscar persona por numero de documento
    @GetMapping("/documento/{documento}")
    public personas buscarPorDocumento(@PathVariable String documento) {

        return personasRepository.buscarPorDocumento(documento)
                .orElse(null);
    }

}


