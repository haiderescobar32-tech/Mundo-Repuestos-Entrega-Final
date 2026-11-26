package com.crud.work.demo.repository;

import com.crud.work.demo.model.personas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface personasRepository extends JpaRepository<personas, Integer> {

    @Query("SELECT p FROM personas p WHERE p.numero_documento = :documento")
    Optional<personas> buscarPorDocumento(@Param("documento") String documento);

}
