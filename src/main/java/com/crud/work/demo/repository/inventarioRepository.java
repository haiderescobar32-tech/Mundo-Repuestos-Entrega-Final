
package com.crud.work.demo.repository;

import com.crud.work.demo.model.inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface inventarioRepository extends JpaRepository<inventario, Integer> {

    // Buscar el inventario utilizando el ID del producto
    @Query("SELECT i FROM inventario i WHERE i.id_producto = :idProducto")
    Optional<inventario> buscarPorIdProducto(
        @Param("idProducto") Integer idProducto
    );

}
