<template>
  <section id="tienda" class="tienda">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">NUESTRA <span class="highlight">TIENDA</span></h2>
        <p class="section-subtitle">Equípate con los mejores productos</p>
      </div>

      <div class="tienda-categorias">
        <Button 
          v-for="categoria in categorias" 
          :key="categoria.id"
          :label="categoria.nombre"
          :class="{ 'active-categoria': categoriaSeleccionada === categoria.id }"
          @click="categoriaSeleccionada = categoria.id"
          severity="danger"
          :outlined="categoriaSeleccionada !== categoria.id"
        />
      </div>

      <div class="productos-grid">
        <div v-for="producto in productosFiltrados" :key="producto.id" class="producto-card">
          <div class="producto-imagen">
            <img :src="producto.imagen" :alt="producto.nombre">
            <Tag :value="producto.stock" :severity="producto.stock === 'En stock' ? 'success' : 'danger'" class="producto-stock" />
          </div>
          <div class="producto-body">
            <h3>{{ producto.nombre }}</h3>
            <p class="producto-categoria">{{ producto.categoria_nombre }}</p>
            <p class="producto-descripcion">{{ producto.descripcion }}</p>
            <div class="producto-precio">
              <span class="precio-label">Precio:</span>
              <span class="precio-valor">Bs. {{ producto.precio }}</span>
            </div>
            <div class="producto-acciones">
              <Button 
                label="Consultar por WhatsApp" 
                icon="pi pi-whatsapp"
                class="whatsapp-btn"
                @click="consultarProducto(producto)"
                severity="success"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// ============================================
// DATOS DE CATEGORÍAS
// ============================================
const categorias = ref([
  { id: 1, nombre: 'Ropa' },
  { id: 2, nombre: 'Equipo' },
  { id: 3, nombre: 'Accesorios' },
  { id: 4, nombre: 'Suplementos' }
]);

// ============================================
// DATOS DE PRODUCTOS
// ============================================
const productos = ref([
  {
    id: 1,
    nombre: 'Roberto',
    descripcion: 'Camiseta oficial de la academia, 100% algodón',
    precio: 120,
    imagen: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    categoria_id: 1,
    categoria_nombre: 'Ropa',
    stock: 'En stock'
  },
  {
    id: 2,
    nombre: 'Guantes de Boxeo Profesionales',
    descripcion: 'Guantes de cuero sintético, 10 oz',
    precio: 350,
    imagen: 'https://images.unsplash.com/photo-1517438322307-e67111335449?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    categoria_id: 2,
    categoria_nombre: 'Equipo',
    stock: 'En stock'
  },
  {
    id: 3,
    nombre: 'Vendas para Manos',
    descripcion: 'Vendas elásticas de 4.5m, protección para entrenamiento',
    precio: 45,
    imagen: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    categoria_id: 3,
    categoria_nombre: 'Accesorios',
    stock: 'En stock'
  },
  {
    id: 4,
    nombre: 'Proteína Whey 2lb',
    descripcion: 'Proteína de suero de leche, sabor chocolate',
    precio: 280,
    imagen: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    categoria_id: 4,
    categoria_nombre: 'Suplementos',
    stock: 'En stock'
  },
  {
    id: 5,
    nombre: 'Shorts de MMA',
    descripcion: 'Shorts oficiales para entrenamiento y competencia',
    precio: 180,
    imagen: 'https://images.unsplash.com/photo-1517456837005-d757b959ae2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    categoria_id: 1,
    categoria_nombre: 'Ropa',
    stock: 'En stock'
  },
  {
    id: 6,
    nombre: 'Protector Bucal',
    descripcion: 'Protector bucal moldeable, incluye estuche',
    precio: 60,
    imagen: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    categoria_id: 3,
    categoria_nombre: 'Accesorios',
    stock: 'En stock'
  }
]);

// ============================================
// FILTRO POR CATEGORÍA
// ============================================
const categoriaSeleccionada = ref(1);

const productosFiltrados = computed(() => {
  return productos.value.filter(p => p.categoria_id === categoriaSeleccionada.value);
});

// ============================================
// MÉTODOS
// ============================================
function consultarProducto(producto) {
  const mensaje = `Hola, me interesa el producto: ${producto.nombre} (Bs. ${producto.precio}). ¿Podrían darme más información?`;
  const url = `https://wa.me/59160108969?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
  
  toast.add({
    severity: 'success',
    summary: 'Redirigiendo a WhatsApp',
    detail: `Consultando sobre ${producto.nombre}`,
    life: 3000
  });
}
</script>

<style scoped>
.tienda {
  background: white;
  padding: 4rem 0;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.highlight {
  color: #dc2626;
}

.section-subtitle {
  color: #64748b;
  font-size: 1.2rem;
}

.tienda-categorias {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.tienda-categorias .p-button {
  min-width: 100px;
}

.tienda-categorias .active-categoria {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.producto-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  border: 1px solid #e2e8f0;
}

.producto-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.producto-imagen {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.producto-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.producto-card:hover .producto-imagen img {
  transform: scale(1.1);
}

.producto-stock {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
}

.producto-body {
  padding: 1.5rem;
}

.producto-body h3 {
  color: #1e293b;
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
}

.producto-categoria {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.producto-descripcion {
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.producto-precio {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
}

.precio-label {
  color: #64748b;
}

.precio-valor {
  color: #dc2626;
  font-size: 1.3rem;
  font-weight: 700;
}

.producto-acciones .whatsapp-btn {
  width: 100%;
  background: #25d366 !important;
  border: none !important;
}

.producto-acciones .whatsapp-btn:hover {
  background: #128c7e !important;
}

@media (max-width: 768px) {
  .tienda-categorias {
    flex-direction: column;
    align-items: stretch;
  }
  
  .productos-grid {
    grid-template-columns: 1fr;
  }
}
</style>