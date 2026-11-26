package com.crud.work.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.crud.work.demo.model.productos;
//import org.springframework.stereotype.Repository;

//@Repository

public interface productosRepository extends JpaRepository<productos, Long> {

}
