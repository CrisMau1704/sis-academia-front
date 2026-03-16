<template>
  <section id="modalidades" class="modalidades">
    <div class="section-container">
      <!-- Header con título y subtítulo -->
      <div class="section-header">
        <h2 class="section-title">NUESTRAS <span class="highlight">MODALIDADES</span></h2>
        <p class="section-subtitle">Elige la disciplina que mejor se adapte a tus objetivos</p>
      </div>

      <!-- Estado de carga -->
      <div v-if="cargandoModalidades" class="loading-state">
        <ProgressSpinner style="width: 50px; height: 50px" />
        <p class="text-500 mt-2">Cargando modalidades disponibles...</p>
      </div>

      <!-- Grid de modalidades desde la BD -->
      <div v-else-if="modalidades.length > 0" class="modalidades-grid">
        <div v-for="modalidad in modalidades" :key="modalidad.id" class="modalidad-card">
          
          <!-- Header de la tarjeta -->
          <div class="modalidad-header">
            <div class="modalidad-icon" :style="{ backgroundColor: getColorPorModalidad(modalidad.nombre) }">
              <i :class="getIconoModalidad(modalidad.nombre)"></i>
            </div>
            <h3 class="modalidad-title">{{ modalidad.nombre }}</h3>
          </div>

          <!-- Cuerpo de la tarjeta -->
          <div class="modalidad-body">
            <!-- Información general desde la BD -->
            <div class="modalidad-info">
              <div class="info-item">
                <i class="pi pi-calendar"></i>
                <span>{{ modalidad.clases_mensuales || 12 }} clases/mes</span>
              </div>
              <div class="info-item">
                <i class="pi pi-shield"></i>
                <span>{{ modalidad.permisos_maximos || 3 }} permisos/mes</span>
              </div>
              <div class="info-item">
                <i class="pi pi-clock"></i>
                <span>{{ modalidad.duracion_clase || 60 }} min/clase</span>
              </div>
            </div>

            <!-- Precio desde la BD -->
            <div class="modalidad-price">
              <span class="price-label">Desde</span>
              <h4 class="price">Bs. {{ formatMonto(modalidad.precio_mensual) }}</h4>
              <span class="price-period">/mes</span>
            </div>

            <!-- Descripción de la modalidad si existe -->
            <div v-if="modalidad.descripcion" class="modalidad-descripcion">
              <p>{{ modalidad.descripcion }}</p>
            </div>

            <!-- Características por defecto según tipo (puedes quitarlas si ya vienen de la BD) -->
            <div class="modalidad-features">
              <ul>
                <li v-for="feature in getCaracteristicasPorDefecto(modalidad.nombre)" :key="feature">
                  <i class="pi pi-check"></i> {{ feature }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Footer con botón de horarios -->
          <div class="modalidad-footer">
            <Button 
              label="Ver Horarios" 
              icon="pi pi-clock"
              class="modalidad-btn"
              @click="mostrarHorarios(modalidad)"
              :loading="cargandoHorarios && modalidadCargando === modalidad.id"
              outlined
              severity="danger"
            />
          </div>
        </div>
      </div>

      <!-- Mensaje si no hay modalidades -->
      <div v-else class="empty-state">
        <i class="pi pi-info-circle empty-icon"></i>
        <h3>No hay modalidades disponibles</h3>
        <p>Estamos actualizando nuestra oferta deportiva. Vuelve pronto.</p>
      </div>

      <!-- Diálogo de horarios desde la BD -->
      <Dialog 
        v-model:visible="dialogoHorariosVisible" 
        modal 
        :header="`Horarios de ${modalidadSeleccionada?.nombre || ''}`"
        :style="{ width: '800px' }"
        class="horarios-dialog"
      >
        <!-- Estado de carga de horarios -->
        <div v-if="cargandoHorarios" class="loading-state p-4">
          <ProgressSpinner style="width: 40px; height: 40px" />
          <p class="text-500 mt-2">Cargando horarios desde la base de datos...</p>
        </div>

        <!-- Contenido de horarios desde la BD -->
        <div v-else-if="horarios.length > 0" class="horarios-container">
          
          <!-- Filtros de sucursal (usando datos reales) -->
          <div class="horarios-filtros">
            <div class="filtro-grupo">
              <label for="filtroSucursal" class="filtro-label">Filtrar por sucursal:</label>
              <Dropdown 
                id="filtroSucursal"
                v-model="filtroSucursalId" 
                :options="sucursalesUnicas" 
                optionLabel="nombre" 
                optionValue="id" 
                placeholder="Todas las sucursales"
                class="filtro-dropdown"
                showClear
              />
            </div>
            
            <div class="filtro-grupo">
              <label for="filtroDia" class="filtro-label">Filtrar por día:</label>
              <Dropdown 
                id="filtroDia"
                v-model="filtroDia" 
                :options="diasSemana" 
                placeholder="Todos los días"
                class="filtro-dropdown"
                showClear
              />
            </div>
          </div>

          <!-- Grid de horarios desde la BD -->
          <div class="horarios-grid">
            <div 
              v-for="horario in horariosFiltrados" 
              :key="horario.id" 
              class="horario-item"
            >
              <div class="horario-header">
                <div class="horario-dia">{{ horario.dia_semana }}</div>
                <Tag :value="horario.tipo_clase || 'Regular'" :severity="getSeverityTipoClase(horario.tipo_clase)" />
              </div>
              
              <div class="horario-hora">
                <i class="pi pi-clock"></i>
                <span>{{ formatHora(horario.hora_inicio) }} - {{ formatHora(horario.hora_fin) }}</span>
              </div>
              
              <div class="horario-sucursal">
                <i class="pi pi-building"></i>
                <span>{{ horario.sucursal?.nombre || horario.sucursal_nombre || 'No especificada' }}</span>
              </div>
              
              <div class="horario-entrenador">
                <i class="pi pi-user"></i>
                <span>{{ horario.entrenador?.nombre || horario.entrenador_nombre || 'Por asignar' }}</span>
              </div>
              
              <!-- Cupos disponibles desde la BD -->
              <div class="horario-cupo" :class="getCupoClass(horario.cupo_disponible)">
                <i class="pi pi-users"></i>
                <span>{{ horario.cupo_disponible || 0 }} cupos disponibles</span>
              </div>

              <!-- Etiqueta de disponibilidad -->
              <div class="horario-estado">
                <Tag 
                  :value="(horario.cupo_disponible || 0) > 0 ? 'Disponible' : 'Lleno'" 
                  :severity="(horario.cupo_disponible || 0) > 0 ? 'success' : 'danger'"
                />
              </div>
            </div>
          </div>

          <!-- Resumen de horarios -->
          <div class="horarios-resumen">
            <div class="resumen-item">
              <i class="pi pi-calendar"></i>
              <span>{{ horariosFiltrados.length }} horarios disponibles</span>
            </div>
            <div class="resumen-item">
              <i class="pi pi-building"></i>
              <span>{{ sucursalesUnicas.length }} sucursales</span>
            </div>
          </div>
        </div>

        <!-- Mensaje si no hay horarios -->
        <div v-else class="empty-state">
          <i class="pi pi-calendar-times empty-icon"></i>
          <h3>No hay horarios disponibles</h3>
          <p>Esta modalidad no tiene horarios registrados actualmente en la base de datos.</p>
        </div>

        <!-- Footer del diálogo -->
        <template #footer>
          <Button 
            label="Cerrar" 
            icon="pi pi-times" 
            @click="dialogoHorariosVisible = false" 
            class="p-button-outlined"
          />
          <Button 
            v-if="modalidadSeleccionada"
            label="Inscribirme ahora" 
            icon="pi pi-check" 
            @click="irAInscripcion" 
            severity="danger"
          />
        </template>
      </Dialog>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import publicService from '@/services/public.service';

// Componentes PrimeVue
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import Dropdown from 'primevue/dropdown';

const router = useRouter();
const toast = useToast();

// ============================================
// ESTADOS
// ============================================
const modalidades = ref([]);
const horarios = ref([]);
const cargandoModalidades = ref(false);
const cargandoHorarios = ref(false);
const modalidadCargando = ref(null);
const dialogoHorariosVisible = ref(false);
const modalidadSeleccionada = ref(null);

// Filtros
const filtroSucursalId = ref(null);
const filtroDia = ref(null);

// ============================================
// DATOS ESTÁTICOS (solo para filtros)
// ============================================
const diasSemana = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

// ============================================
// COMPUTED - Datos filtrados desde la BD
// ============================================
const sucursalesUnicas = computed(() => {
  const sucs = new Map();
  horarios.value.forEach(h => {
    const sucursalId = h.sucursal_id;
    const sucursalNombre = h.sucursal?.nombre || h.sucursal_nombre;
    
    if (sucursalId && sucursalNombre && !sucs.has(sucursalId)) {
      sucs.set(sucursalId, {
        id: sucursalId,
        nombre: sucursalNombre
      });
    }
  });
  return Array.from(sucs.values());
});

const horariosFiltrados = computed(() => {
  let filtrados = horarios.value;

  if (filtroSucursalId.value) {
    filtrados = filtrados.filter(h => 
      h.sucursal_id === filtroSucursalId.value || 
      h.sucursal?.id === filtroSucursalId.value
    );
  }

  if (filtroDia.value) {
    filtrados = filtrados.filter(h => h.dia_semana === filtroDia.value);
  }

  // Ordenar por día y hora
  const ordenDias = {
    'Lunes': 1, 'Martes': 2, 'Miércoles': 3,
    'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7
  };
  
  return filtrados.sort((a, b) => {
    if (ordenDias[a.dia_semana] !== ordenDias[b.dia_semana]) {
      return ordenDias[a.dia_semana] - ordenDias[b.dia_semana];
    }
    return (a.hora_inicio || '').localeCompare(b.hora_inicio || '');
  });
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function getIconoModalidad(nombre) {
  const nombreLower = nombre?.toLowerCase() || '';
  
  if (nombreLower.includes('mma') || nombreLower.includes('mixtas')) {
    return 'pi pi-bolt';
  } else if (nombreLower.includes('jiu') || nombreLower.includes('jitsu') || nombreLower.includes('jjb')) {
    return 'pi pi-sun';
  } else if (nombreLower.includes('box')) {
    return 'pi pi-star';
  } else if (nombreLower.includes('kick')) {
    return 'pi pi-bolt';
  } else if (nombreLower.includes('funcional')) {
    return 'pi pi-chart-line';
  } else if (nombreLower.includes('cross')) {
    return 'pi pi-sync';
  } else if (nombreLower.includes('yoga')) {
    return 'pi pi-heart';
  } else {
    return 'pi pi-shield';
  }
}

function getColorPorModalidad(nombre) {
  const nombreLower = nombre?.toLowerCase() || '';
  
  if (nombreLower.includes('mma')) return '#dc2626'; // rojo
  if (nombreLower.includes('jiu')) return '#f59e0b'; // naranja
  if (nombreLower.includes('box')) return '#3b82f6'; // azul
  if (nombreLower.includes('kick')) return '#8b5cf6'; // púrpura
  if (nombreLower.includes('funcional')) return '#10b981'; // verde
  if (nombreLower.includes('cross')) return '#6366f1'; // índigo
  return '#64748b'; // gris
}

function getCaracteristicasPorDefecto(nombre) {
  // Estas son características genéricas, puedes quitarlas si las modalidades
  // ya tienen sus propias características en la BD
  const nombreLower = nombre?.toLowerCase() || '';
  
  if (nombreLower.includes('mma')) {
    return [
      'Entrenamiento completo de striking y grappling',
      'Preparación física especializada',
      'Sparring controlado',
      'Técnicas de defensa personal'
    ];
  } else if (nombreLower.includes('jiu')) {
    return [
      'Técnicas de sumisión',
      'Posicionamiento y control',
      'Defensa personal en el suelo',
      'Rolling supervisado'
    ];
  } else if (nombreLower.includes('box')) {
    return [
      'Técnicas de boxeo básico y avanzado',
      'Trabajo de sombra y costal',
      'Combate controlado',
      'Ejercicios de coordinación'
    ];
  } else {
    return [
      'Clases para todos los niveles',
      'Entrenadores certificados',
      'Ambiente familiar y seguro',
      'Horarios flexibles'
    ];
  }
}

function getSeverityTipoClase(tipo) {
  const tipoLower = tipo?.toLowerCase() || '';
  
  if (tipoLower.includes('principiante') || tipoLower.includes('básico')) return 'info';
  if (tipoLower.includes('intermedio')) return 'warning';
  if (tipoLower.includes('avanzado')) return 'danger';
  return 'info';
}

function getCupoClass(cupo) {
  if (!cupo && cupo !== 0) return '';
  if (cupo > 5) return 'cupo-disponible';
  if (cupo > 0) return 'cupo-limitado';
  return 'cupo-lleno';
}

function formatHora(hora) {
  if (!hora) return '--:--';
  // Si viene en formato HH:MM:SS, tomar solo HH:MM
  if (hora.includes(':')) {
    return hora.substring(0, 5);
  }
  return hora;
}

function formatMonto(monto) {
  if (!monto && monto !== 0) return '0';
  return parseFloat(monto).toFixed(0);
}

// ============================================
// CARGAR DATOS DESDE LA BD
// ============================================
onMounted(async () => {
  await cargarModalidades();
});

async function cargarModalidades() {
  cargandoModalidades.value = true;
  try {
    console.log('📥 Cargando modalidades desde la BD...');
    const response = await publicService.getModalidades();
    console.log('📥 Respuesta modalidades:', response);
    
    if (response.data?.success) {
      modalidades.value = response.data.data || [];
      console.log(`✅ ${modalidades.value.length} modalidades cargadas`);
    } else {
      console.warn('⚠️ La respuesta no tiene formato success:', response);
      modalidades.value = response.data?.data || response.data || [];
    }
  } catch (error) {
    console.error('❌ Error cargando modalidades:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las modalidades',
      life: 3000
    });
    modalidades.value = [];
  } finally {
    cargandoModalidades.value = false;
  }
}

async function cargarHorarios(modalidadId) {
  cargandoHorarios.value = true;
  modalidadCargando.value = modalidadId;
  horarios.value = [];
  
  try {
    console.log(`📥 Cargando horarios para modalidad ID: ${modalidadId}...`);
    const response = await publicService.getHorarios({ modalidad_id: modalidadId });
    console.log('📥 Respuesta horarios:', response);
    
    if (response.data?.success) {
      horarios.value = response.data.data || [];
      console.log(`✅ ${horarios.value.length} horarios cargados`);
    } else {
      console.warn('⚠️ La respuesta no tiene formato success:', response);
      horarios.value = response.data?.data || response.data || [];
    }
    
    if (horarios.value.length === 0) {
      toast.add({
        severity: 'info',
        summary: 'Sin horarios',
        detail: 'Esta modalidad no tiene horarios registrados',
        life: 3000
      });
    }
  } catch (error) {
    console.error('❌ Error cargando horarios:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los horarios',
      life: 3000
    });
    horarios.value = [];
  } finally {
    cargandoHorarios.value = false;
    modalidadCargando.value = null;
  }
}

// ============================================
// FUNCIONES DE INTERACCIÓN
// ============================================
async function mostrarHorarios(modalidad) {
  modalidadSeleccionada.value = modalidad;
  filtroSucursalId.value = null;
  filtroDia.value = null;
  
  await cargarHorarios(modalidad.id);
  
  dialogoHorariosVisible.value = true;
}

function irAInscripcion() {
  dialogoHorariosVisible.value = false;
  
  toast.add({
    severity: 'success',
    summary: 'Redirigiendo',
    detail: 'Completa el formulario de preinscripción',
    life: 3000
  });
  
  // Guardar modalidad seleccionada en localStorage o store si es necesario
  localStorage.setItem('modalidad_seleccionada', JSON.stringify({
    id: modalidadSeleccionada.value.id,
    nombre: modalidadSeleccionada.value.nombre,
    precio: modalidadSeleccionada.value.precio_mensual
  }));
  
  // Scroll a la sección de inscripción
  const element = document.getElementById('inscripcion');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  } else {
    // Si no existe, navegar a la ruta de inscripción
    router.push('/inscripcion');
  }
}
</script>

<style scoped>
/* ===== ESTILOS PRINCIPALES ===== */
.modalidades {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  padding: 4rem 0;
  min-height: 80vh;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ===== HEADER ===== */
.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.highlight {
  color: #dc2626;
  position: relative;
  display: inline-block;
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 100%;
  height: 8px;
  background: rgba(220, 38, 38, 0.2);
  z-index: -1;
}

.section-subtitle {
  color: #64748b;
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
}

/* ===== ESTADOS DE CARGA Y VACÍO ===== */
.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 20px;
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

/* ===== GRID DE MODALIDADES ===== */
.modalidades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

/* ===== TARJETA DE MODALIDAD ===== */
.modalidad-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.modalidad-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

/* Header de la tarjeta */
.modalidad-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modalidad-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dc2626;
  flex-shrink: 0;
}

.modalidad-icon i {
  font-size: 2rem;
  color: white;
}

.modalidad-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
}

/* Cuerpo de la tarjeta */
.modalidad-body {
  padding: 1.5rem;
  flex: 1;
}

.modalidad-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.3rem;
}

.info-item i {
  color: #dc2626;
  font-size: 1.2rem;
}

.info-item span {
  color: #475569;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Precio */
.modalidad-price {
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%);
  border-radius: 12px;
  border: 1px solid #fecaca;
}

.price-label {
  color: #64748b;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.3rem;
}

.price {
  color: #dc2626;
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  line-height: 1;
  display: inline-block;
}

.price-period {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-left: 0.3rem;
}

/* Descripción (si viene de la BD) */
.modalidad-descripcion {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #dc2626;
}

.modalidad-descripcion p {
  color: #475569;
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
}

/* Características */
.modalidad-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.modalidad-features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: #475569;
  border-bottom: 1px dashed #e2e8f0;
}

.modalidad-features li:last-child {
  border-bottom: none;
}

.modalidad-features i {
  color: #10b981;
  font-size: 1rem;
  flex-shrink: 0;
}

/* Footer de la tarjeta */
.modalidad-footer {
  padding: 0 1.5rem 1.5rem;
}

.modalidad-btn {
  width: 100%;
  border-radius: 50px !important;
  padding: 0.8rem !important;
  font-weight: 600 !important;
}

/* ===== DIÁLOGO DE HORARIOS ===== */
.horarios-dialog :deep(.p-dialog-header) {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  padding: 1.5rem;
}

.horarios-dialog :deep(.p-dialog-title) {
  color: white;
  font-weight: 700;
  font-size: 1.3rem;
}

.horarios-dialog :deep(.p-dialog-header-icon) {
  color: white;
}

.horarios-container {
  padding: 1.5rem;
}

/* Filtros */
.horarios-filtros {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
}

.filtro-grupo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.filtro-label {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.filtro-dropdown {
  width: 100%;
}

/* Grid de horarios */
.horarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  max-height: 500px;
  overflow-y: auto;
  padding: 0.5rem;
}

.horario-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.2rem;
  transition: all 0.2s;
  position: relative;
}

.horario-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #dc2626;
}

.horario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f1f5f9;
}

.horario-dia {
  font-weight: 700;
  font-size: 1.1rem;
  color: #1e293b;
}

.horario-hora,
.horario-sucursal,
.horario-entrenador {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  color: #475569;
}

.horario-hora i,
.horario-sucursal i,
.horario-entrenador i {
  color: #dc2626;
  width: 20px;
  font-size: 0.9rem;
}

.horario-cupo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.cupo-disponible {
  background: #e6f7e6;
  color: #059669;
}

.cupo-limitado {
  background: #fff3cd;
  color: #d97706;
}

.cupo-lleno {
  background: #fee2e2;
  color: #dc2626;
}

.horario-estado {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

/* Resumen de horarios */
.horarios-resumen {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border-top: 1px solid #e2e8f0;
}

.resumen-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
}

.resumen-item i {
  color: #dc2626;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .modalidades-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }
  
  .modalidades-grid {
    grid-template-columns: 1fr;
  }
  
  .modalidad-header {
    flex-direction: column;
    text-align: center;
  }
  
  .modalidad-info {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .info-item {
    flex-direction: row;
    justify-content: center;
  }
  
  .horarios-filtros {
    grid-template-columns: 1fr;
  }
  
  .horarios-resumen {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .section-container {
    padding: 0 1rem;
  }
  
  .modalidad-card {
    margin: 0;
  }
  
  .modalidad-header {
    padding: 1.5rem;
  }
  
  .modalidad-body {
    padding: 1rem;
  }
  
  .price {
    font-size: 2rem;
  }
  
  .horarios-grid {
    grid-template-columns: 1fr;
  }
}
</style>