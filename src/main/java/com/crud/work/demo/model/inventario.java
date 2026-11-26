
package com.crud.work.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventario")
public class inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_inventario;

    @Column(name = "id_producto", nullable = false, unique = true)
    private Integer id_producto;

    @Column(name = "stock_actual")
    private Integer stock_actual;

    @Column(name = "stock_minimo")
    private Integer stock_minimo;

    @Column(name = "ubicacion", length = 100)
    private String ubicacion;

    @Column(name = "fecha_actualizacion",
            insertable = false, updatable = false)
    private LocalDateTime fecha_actualizacion;

    public inventario() {
    }

    public Integer getId_inventario() {
        return id_inventario;
    }

    public void setId_inventario(Integer id_inventario) {
        this.id_inventario = id_inventario;
    }

    public Integer getId_producto() {
        return id_producto;
    }

    public void setId_producto(Integer id_producto) {
        this.id_producto = id_producto;
    }

    public Integer getStock_actual() {
        return stock_actual;
    }

    public void setStock_actual(Integer stock_actual) {
        this.stock_actual = stock_actual;
    }

    public Integer getStock_minimo() {
        return stock_minimo;
    }

    public void setStock_minimo(Integer stock_minimo) {
        this.stock_minimo = stock_minimo;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public LocalDateTime getFecha_actualizacion() {
        return fecha_actualizacion;
    }
}
