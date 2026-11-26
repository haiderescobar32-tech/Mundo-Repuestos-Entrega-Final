
package com.crud.work.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "compatibilidad")
public class compatibilidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_compatibilidad")
    private Integer id_compatibilidad;

    @Column(nullable = false)
    private Integer id_producto;

    @Column(nullable = false)
    private Integer id_vehiculo;

    @Column(length = 200)
    private String observaciones;

    public compatibilidad() {
    }

    public Integer getId_compatibilidad() {
        return id_compatibilidad;
    }

    public void setId_compatibilidad(Integer id_compatibilidad) {
        this.id_compatibilidad = id_compatibilidad;
    }

    public Integer getId_producto() {
        return id_producto;
    }

    public void setId_producto(Integer id_producto) {
        this.id_producto = id_producto;
    }

    public Integer getId_vehiculo() {
        return id_vehiculo;
    }

    public void setId_vehiculo(Integer id_vehiculo) {
        this.id_vehiculo = id_vehiculo;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}
