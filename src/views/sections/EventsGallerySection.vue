<template>
  <section id="galeria" class="galeria">
    <div class="section-container">
      <!-- Header de la sección -->
      <div class="section-header">
        <span class="section-badge">MOMENTOS INOLVIDABLES</span>
        <h2 class="section-title">
          GALERÍA DE <span class="highlight">EVENTOS</span>
        </h2>
        <p class="section-subtitle">
          Revive los mejores momentos de nuestros eventos, competencias y actividades
        </p>
      </div>

      <!-- Filtros por categoría -->
      <div class="gallery-filters">
        <Button 
          v-for="cat in categorias" 
          :key="cat.value"
          :label="cat.label"
          :class="['filter-btn', { active: filtroActivo === cat.value }]"
          @click="filtroActivo = cat.value"
          :outlined="filtroActivo !== cat.value"
          severity="danger"
          size="small"
        />
      </div>

      <!-- Estado de carga -->
      <div v-if="cargando" class="loading-state">
        <ProgressSpinner style="width: 50px; height: 50px" />
        <p class="text-500 mt-2">Cargando galería de eventos...</p>
      </div>

      <!-- Grid de fotos -->
      <div v-else class="gallery-grid">
        <div 
          v-for="(foto, index) in fotosFiltradas" 
          :key="foto.id"
          class="gallery-item"
          :class="{ 'featured': foto.destacada }"
          @click="abrirLightbox(index)"
        >
          <div class="image-container">
            <img 
              :src="foto.url" 
              :alt="foto.titulo"
              loading="lazy"
            >
            
            <!-- Overlay con información -->
            <div class="image-overlay">
              <div class="overlay-content">
                <h4>{{ foto.titulo }}</h4>
                <p>{{ foto.fecha }}</p>
                <span class="event-badge" :class="foto.categoria">
                  {{ getCategoriaLabel(foto.categoria) }}
                </span>
              </div>
            </div>

            <!-- Ícono de zoom -->
            <div class="zoom-icon">
              <i class="pi pi-search-plus"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón ver más -->
      <div v-if="tieneMasFotos" class="load-more">
        <Button 
          label="Ver más fotos" 
          icon="pi pi-images"
          @click="cargarMasFotos"
          :loading="cargandoMas"
          outlined
          severity="danger"
        />
      </div>

      <!-- Mensaje si no hay fotos -->
      <div v-if="!cargando && fotosFiltradas.length === 0" class="empty-state">
        <i class="pi pi-images empty-icon"></i>
        <h3>No hay fotos disponibles</h3>
        <p>Pronto estaremos subiendo la galería de nuestros eventos.</p>
      </div>
    </div>

    <!-- Lightbox para ver imágenes ampliadas -->
    <Dialog 
      v-model:visible="lightboxVisible" 
      modal 
      :style="{ width: '90vw', maxWidth: '1200px' }"
      :closable="true"
      class="lightbox-dialog"
    >
      <div v-if="fotoActual" class="lightbox-container">
        <!-- Imagen principal -->
        <div class="lightbox-image-container">
          <img 
            :src="fotoActual.url" 
            :alt="fotoActual.titulo"
            class="lightbox-image"
          >
        </div>

        <!-- Información de la imagen -->
        <div class="lightbox-info">
          <h3>{{ fotoActual.titulo }}</h3>
          <p class="lightbox-fecha">{{ fotoActual.fecha }}</p>
          <p class="lightbox-descripcion">{{ fotoActual.descripcion }}</p>
          
          <!-- Tags -->
          <div class="lightbox-tags">
            <Tag :value="getCategoriaLabel(fotoActual.categoria)" :severity="getTagSeverity(fotoActual.categoria)" />
            <Tag v-if="fotoActual.evento" :value="fotoActual.evento" severity="info" />
          </div>

          <!-- Contador y navegación -->
          <div class="lightbox-navigation">
            <div class="image-counter">
              {{ indiceActual + 1 }} / {{ fotosFiltradas.length }}
            </div>
            <div class="nav-buttons">
              <Button 
                icon="pi pi-chevron-left" 
                @click="navegarImagen('anterior')"
                :disabled="indiceActual === 0"
                rounded
                text
              />
              <Button 
                icon="pi pi-chevron-right" 
                @click="navegarImagen('siguiente')"
                :disabled="indiceActual === fotosFiltradas.length - 1"
                rounded
                text
              />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';

const toast = useToast();

// ============================================
// PROPS
// ============================================
const props = defineProps({
  limiteInicial: {
    type: Number,
    default: 12
  },
  mostrarFiltros: {
    type: Boolean,
    default: true
  }
});

// ============================================
// ESTADOS
// ============================================
const fotos = ref([]);
const cargando = ref(false);
const cargandoMas = ref(false);
const filtroActivo = ref('todos');
const lightboxVisible = ref(false);
const indiceActual = ref(0);
const totalFotos = ref(20); // 👈 AGREGADO

// ============================================
// DATOS DE EJEMPLO
// ============================================
const categorias = [
  { label: 'Todos', value: 'todos' },
  { label: 'Competencias', value: 'competencia' },
  { label: 'Entrenamientos', value: 'entrenamiento' },
  { label: 'Eventos Sociales', value: 'social' },
  { label: 'Graduaciones', value: 'graduacion' },
  { label: 'Seminarios', value: 'seminario' }
];

function getCategoriaLabel(categoria) {
  const cat = categorias.find(c => c.value === categoria);
  return cat ? cat.label : categoria;
}

function getTagSeverity(categoria) {
  const severities = {
    competencia: 'danger',
    entrenamiento: 'info',
    social: 'success',
    graduacion: 'warning',
    seminario: 'help'
  };
  return severities[categoria] || 'info';
}

// ============================================
// COMPUTED
// ============================================
const fotosFiltradas = computed(() => {
  if (filtroActivo.value === 'todos') return fotos.value;
  return fotos.value.filter(foto => foto.categoria === filtroActivo.value);
});

const fotoActual = computed(() => {
  if (fotosFiltradas.value.length === 0) return null;
  return fotosFiltradas.value[indiceActual.value];
});

const tieneMasFotos = computed(() => {
  return fotos.value.length < totalFotos.value; // 👈 AHORA FUNCIONA
});

// ============================================
// FUNCIONES
// ============================================
async function cargarFotos(reset = true) {
  if (reset) {
    cargando.value = true;
    fotos.value = [];
  } else {
    cargandoMas.value = true;
  }

  try {
    // 🔥 AQUÍ CONECTARÁS CON TU API
    // const response = await publicService.getEventos();
    // if (response.data?.success) {
    //   fotos.value = response.data.data;
    //   totalFotos.value = response.data.total || fotos.value.length;
    // }

    // 🔥 MIENTRAS TANTO, DATOS DE EJEMPLO
    setTimeout(() => {
      fotos.value = generarFotosEjemplo();
      cargando.value = false;
      cargandoMas.value = false;
    }, 1000);

  } catch (error) {
    console.error('Error cargando fotos:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las fotos',
      life: 3000
    });
    cargando.value = false;
    cargandoMas.value = false;
  }
}

function generarFotosEjemplo() {
  const fotosEjemplo = [];
  const categorias = ['competencia', 'entrenamiento', 'social', 'graduacion', 'seminario'];
  const eventos = ['Torneo Nacional 2024', 'Sparring Day', 'Convivencia', 'Entrega de Cinturones', 'Clínica con Invitado'];
  
  for (let i = 1; i <= 20; i++) {
    const categoria = categorias[Math.floor(Math.random() * categorias.length)];
    const evento = eventos[Math.floor(Math.random() * eventos.length)];
    const fecha = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    fotosEjemplo.push({
      id: i,
      titulo: `${evento} - Sesión ${i}`,
      descripcion: `Momento especial durante ${evento} en nuestras instalaciones. Atletas demostrando su progreso y dedicación.`,
      fecha: fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
      categoria: categoria,
      evento: evento,
      url: `https://picsum.photos/800/600?random=${i}`,
      destacada: i === 1 || i === 5 || i === 10
    });
  }
  
  return fotosEjemplo;
}

function abrirLightbox(index) {
  indiceActual.value = index;
  lightboxVisible.value = true;
}

function navegarImagen(direccion) {
  if (direccion === 'anterior' && indiceActual.value > 0) {
    indiceActual.value--;
  } else if (direccion === 'siguiente' && indiceActual.value < fotosFiltradas.value.length - 1) {
    indiceActual.value++;
  }
}

function cargarMasFotos() {
  toast.add({
    severity: 'info',
    summary: 'Cargando más fotos',
    detail: 'Funcionalidad en desarrollo',
    life: 2000
  });
}

// ============================================
// LIFECYCLE
// ============================================
onMounted(() => {
  cargarFotos();
});
</script>

<style scoped>
.events-gallery {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  padding: 5rem 0;
  position: relative;
  overflow: hidden;
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-badge {
  display: inline-block;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  box-shadow: 0 4px 10px rgba(220, 38, 38, 0.2);
}

.section-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.highlight {
  color: #dc2626;
  position: relative;
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 100%;
  height: 8px;
  background: rgba(220, 38, 38, 0.15);
  z-index: -1;
}

.section-subtitle {
  color: #475569;
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto;
}

/* Filtros */
.gallery-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 3rem;
}

.filter-btn {
  border-radius: 50px !important;
  padding: 0.5rem 1.2rem !important;
  font-weight: 500 !important;
}

.filter-btn.active {
  background: #dc2626 !important;
  color: white !important;
  border-color: #dc2626 !important;
}

/* Grid de galería */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.gallery-item {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  aspect-ratio: 4/3;
}

.gallery-item.featured {
  grid-column: span 2;
  grid-row: span 2;
  aspect-ratio: 16/9;
}

.gallery-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(220, 38, 38, 0.2);
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

/* Overlay */
.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  color: white;
  padding: 1.5rem 1rem 1rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.gallery-item:hover .image-overlay {
  transform: translateY(0);
}

.overlay-content h4 {
  font-size: 1.1rem;
  margin: 0 0 0.3rem;
  font-weight: 600;
}

.overlay-content p {
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
  opacity: 0.9;
}

.event-badge {
  display: inline-block;
  padding: 0.2rem 0.8rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.event-badge.competencia {
  background: #dc2626;
  color: white;
}

.event-badge.entrenamiento {
  background: #3b82f6;
  color: white;
}

.event-badge.social {
  background: #10b981;
  color: white;
}

.event-badge.graduacion {
  background: #f59e0b;
  color: white;
}

.event-badge.seminario {
  background: #8b5cf6;
  color: white;
}

/* Ícono de zoom */
.zoom-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(5px);
}

.gallery-item:hover .zoom-icon {
  opacity: 1;
}

/* Botón ver más */
.load-more {
  text-align: center;
  margin-top: 2rem;
}

/* Estados de carga y vacío */
.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 4rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #1e293b;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
}

/* Lightbox */
.lightbox-dialog :deep(.p-dialog-header) {
  background: #0f172a;
  color: white;
  padding: 1rem 1.5rem;
}

.lightbox-dialog :deep(.p-dialog-title) {
  color: white;
  font-weight: 600;
}

.lightbox-dialog :deep(.p-dialog-header-icon) {
  color: white;
}

.lightbox-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  padding: 0.5rem;
}

.lightbox-image-container {
  background: #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.lightbox-info {
  padding: 1rem;
}

.lightbox-info h3 {
  color: #0f172a;
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
}

.lightbox-fecha {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lightbox-fecha::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  background: #dc2626;
  border-radius: 50%;
}

.lightbox-descripcion {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.lightbox-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.lightbox-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.image-counter {
  color: #64748b;
  font-weight: 500;
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .section-title {
    font-size: 2.3rem;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .events-gallery {
    padding: 3rem 0;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .gallery-item.featured {
    grid-column: span 1;
    grid-row: span 1;
  }
  
  .gallery-filters {
    overflow-x: auto;
    padding-bottom: 1rem;
    justify-content: flex-start;
    flex-wrap: nowrap;
  }
  
  .filter-btn {
    white-space: nowrap;
  }
  
  .lightbox-container {
    grid-template-columns: 1fr;
  }
  
  .lightbox-image-container {
    min-height: 300px;
  }
}

@media (max-width: 480px) {
  .section-container {
    padding: 0 1rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .section-badge {
    font-size: 0.8rem;
    padding: 0.4rem 1rem;
  }
  
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
</style>