package com.crud.work.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.math.BigDecimal;

@Entity
public class productos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long id;

    private String nombre_producto;
    private String referencia;
    private String marca;
    private String categoria;
    private String descripcion;
    private BigDecimal precio_compra;
    private BigDecimal precio_venta;
    private String estado;

    // Nueva propiedad para almacenar la ruta de la fotografía
    @Column(name = "imagen_url", length = 500)
    private String imagen_url;

    public productos() {}

    public productos(String nombre_producto, String referencia, String marca,
                     String categoria, String descripcion, BigDecimal precio_compra,
                     BigDecimal precio_venta, String estado) {

        this.nombre_producto = nombre_producto;
        this.referencia = referencia;
        this.marca = marca;
        this.categoria = categoria;
        this.descripcion = descripcion;
        this.precio_compra = precio_compra;
        this.precio_venta = precio_venta;
        this.estado = estado;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre_producto() {
        return nombre_producto;
    }

    public void setNombre_producto(String nombre_producto) {
        this.nombre_producto = nombre_producto;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimal getPrecio_compra() {
        return precio_compra;
    }

    public void setPrecio_compra(BigDecimal precio_compra) {
        this.precio_compra = precio_compra;
    }

    public BigDecimal getPrecio_venta() {
        return precio_venta;
    }

    public void setPrecio_venta(BigDecimal precio_venta) {
        this.precio_venta = precio_venta;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    // Obtener la ruta de la fotografía
    public String getImagen_url() {
        return imagen_url;
    }

    // Guardar la ruta de la fotografía
    public void setImagen_url(String imagen_url) {
        this.imagen_url = imagen_url;
    }

}

