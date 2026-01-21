<template>
  <div class="clases-restantes-container">
    <!-- Header del Reporte -->
    <div class="mb-4">
      <div class="flex align-items-center justify-content-between mb-3">
        <div>
          <h2 class="m-0">
            <i class="pi pi-chart-line mr-2 text-primary"></i>
            Reporte de Clases Restantes
          </h2>
          <p class="text-500 mt-2 m-0">
            Visualiza cuántas clases le quedan a cada estudiante activo
          </p>
        </div>
        <div class="flex gap-2">
          <Button label="Exportar Excel" icon="pi pi-file-excel" severity="help" @click="exportarExcel" />
          <Button label="Imprimir" icon="pi pi-print" severity="secondary" @click="imprimirReporte" />
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <Card class="mb-4">
      <template #content>
        <div class="grid">
          <div class="col-12 md:col-3">
            <div class="field">
              <label class="block mb-2">Modalidad</label>
              <Dropdown v-model="filtros.modalidad_id" :options="modalidades" 
                optionLabel="nombre" optionValue="id" placeholder="Todas" class="w-full" />
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="field">
              <label class="block mb-2">Sucursal</label>
              <Dropdown v-model="filtros.sucursal_id" :options="sucursales" 
                optionLabel="nombre" optionValue="id" placeholder="Todas" class="w-full" />
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="field">
              <label class="block mb-2">Ordenar por</label>
              <Dropdown v-model="filtros.ordenar" :options="opcionesOrden" 
                optionLabel="label" optionValue="value" class="w-full" />
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="field">
              <label class="block mb-2">&nbsp;</label>
              <div class="flex gap-2">
                <Button label="Aplicar" icon="pi pi-filter" @click="aplicarFiltros" 
                  class="w-full" severity="info" />
                <Button label="Limpiar" icon="pi pi-filter-slash" @click="limpiarFiltros" 
                  class="w-full" severity="secondary" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Dashboard de Resumen -->
    <div class="grid mb-4">
      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #title>Total Activos</template>
          <template #content>
            <div class="stat-content">
              <i class="pi pi-users stat-icon text-blue-500"></i>
              <span class="stat-value">{{ estadisticas.totalActivos }}</span>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #title>Pocas Clases (< 5)</template>
          <template #content>
            <div class="stat-content">
              <i class="pi pi-exclamation-triangle stat-icon text-orange-500"></i>
              <span class="stat-value">{{ estadisticas.pocasClases }}</span>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #title>Sin Clases</template>
          <template #content>
            <div class="stat-content">
              <i class="pi pi-times-circle stat-icon text-red-500"></i>
              <span class="stat-value">{{ estadisticas.sinClases }}</span>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #title>Promedio Clases</template>
          <template #content>
            <div class="stat-content">
              <i class="pi pi-calculator stat-icon text-green-500"></i>
              <span class="stat-value">{{ estadisticas.promedioClases }}</span>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Tabla de Clases Restantes -->
    <Card>
      <template #title>
        <div class="flex align-items-center justify-content-between">
          <span>Detalle de Clases por Estudiante</span>
          <Tag :value="`${clasesRestantesFiltradas.length} estudiantes`" severity="info" />
        </div>
      </template>
      <template #content>
        <div v-if="cargando" class="text-center p-4">
          <ProgressSpinner />
          <p class="text-500 mt-2">Cargando reporte...</p>
        </div>

        <div v-else-if="clasesRestantesFiltradas.length === 0" class="text-center p-4">
          <i class="pi pi-inbox text-400" style="font-size: 3rem"></i>
          <p class="text-500 mt-2">No se encontraron registros con los filtros aplicados</p>
        </div>

        <DataTable v-else :value="clasesRestantesFiltradas" :paginator="true" :rows="20"
          class="p-datatable-sm" :scrollable="true" scrollHeight="flex">
          
          <Column field="estudiante_nombre" header="Estudiante" :sortable="true">
            <template #body="slotProps">
              <div class="flex align-items-center">
                <Avatar :label="getIniciales(slotProps.data.estudiante_nombre)" 
                  size="small" shape="circle" class="mr-2" />
                <div>
                  <div class="font-medium">{{ slotProps.data.estudiante_nombre }}</div>
                  <small class="text-500">{{ slotProps.data.estudiante_ci }}</small>
                </div>
              </div>
            </template>
          </Column>
          
          <Column field="modalidad_nombre" header="Modalidad" :sortable="true"></Column>
          
          <Column field="clases_totales" header="Clases Totales" :sortable="true" style="width: 120px">
            <template #body="slotProps">
              <Tag :value="slotProps.data.clases_totales" severity="info" />
            </template>
          </Column>
          
          <Column field="clases_asistidas" header="Asistidas" :sortable="true" style="width: 120px">
            <template #body="slotProps">
              <Tag :value="slotProps.data.clases_asistidas" severity="success" />
            </template>
          </Column>
          
          <Column field="clases_restantes" header="Restantes" :sortable="true" style="width: 120px">
            <template #body="slotProps">
              <Tag :value="slotProps.data.clases_restantes" 
                :severity="getSeveridadClases(slotProps.data.clases_restantes)" />
            </template>
          </Column>
          
          <Column field="progreso" header="Progreso" style="width: 200px">
            <template #body="slotProps">
              <div class="flex flex-column gap-1">
                <div class="flex justify-content-between">
                  <small>{{ getPorcentajeProgreso(slotProps.data) }}%</small>
                  <small>{{ slotProps.data.clases_restantes }}/{{ slotProps.data.clases_totales }}</small>
                </div>
                <ProgressBar :value="getPorcentajeProgreso(slotProps.data)" :showValue="false" 
                  :style="{ height: '6px' }" />
              </div>
            </template>
          </Column>
          
          <Column field="estado" header="Estado Inscripción" style="width: 140px">
            <template #body="slotProps">
              <Tag :value="slotProps.data.estado" 
                :severity="getSeveridadEstado(slotProps.data.estado)" />
            </template>
          </Column>
          
          <Column header="Vencimiento" style="width: 140px">
            <template #body="slotProps">
              <div v-if="slotProps.data.fecha_fin">
                <div :class="getColorVencimiento(slotProps.data.fecha_fin)">
                  {{ formatFecha(slotProps.data.fecha_fin) }}
                </div>
                <small class="text-500">{{ getDiasRestantes(slotProps.data.fecha_fin) }}</small>
              </div>
              <div v-else class="text-500">Sin fecha</div>
            </template>
          </Column>
          
          <Column header="Acciones" style="width: 100px">
            <template #body="slotProps">
              <div class="flex gap-1">
                <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm"
                  @click="verDetallesEstudiante(slotProps.data.inscripcion_id)"
                  v-tooltip="'Ver detalles'" />
                <Button icon="pi pi-send" class="p-button-rounded p-button-text p-button-sm"
                  @click="notificarClases(slotProps.data)"
                  v-tooltip="'Notificar al estudiante'"
                  :severity="slotProps.data.clases_restantes <= 3 ? 'warning' : 'secondary'" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
      
      <template #footer>
        <div class="flex justify-content-between align-items-center">
          <small class="text-500">
            Última actualización: {{ formatFechaHora(ultimaActualizacion) }}
          </small>
          <div class="flex gap-2">
            <small class="text-500">Exportar:</small>
            <Button icon="pi pi-file-pdf" class="p-button-rounded p-button-text p-button-sm"
              @click="exportarPDF" v-tooltip="'Exportar a PDF'" />
            <Button icon="pi pi-file-excel" class="p-button-rounded p-button-text p-button-sm"
              @click="exportarExcel" v-tooltip="'Exportar a Excel'" />
          </div>
        </div>
      </template>
    </Card>

    <!-- Gráfico de Distribución -->
    <Card class="mt-4">
      <template #title>Distribución de Clases Restantes</template>
      <template #content>
        <div class="grid">
          <div class="col-12 md:col-8">
            <Chart type="bar" :data="chartData" :options="chartOptions" />
          </div>
          <div class="col-12 md:col-4">
            <div class="space-y-3">
              <div v-for="(rango, index) in rangosClases" :key="index" class="p-3 border-round border-1 surface-border">
                <div class="flex justify-content-between align-items-center">
                  <div>
                    <div class="font-bold">{{ rango.label }}</div>
                    <small class="text-500">{{ rango.descripcion }}</small>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-lg">{{ rango.cantidad }}</div>
                    <small class="text-500">{{ rango.porcentaje }}%</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

// Servicios
import inscripcionService from '@/services/inscripcion.service';
import sucursalService from '@/services/sucursal.service';
import modalidadService from '@/services/modalidad.service';

// Componentes
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import Chart from 'primevue/chart';

const toast = useToast();
const router = useRouter();

// Estados
const cargando = ref(false);
const inscripciones = ref([]);
const modalidades = ref([]);
const sucursales = ref([]);
const ultimaActualizacion = ref(new Date());

// Filtros
const filtros = ref({
  modalidad_id: null,
  sucursal_id: null,
  ordenar: 'clases_restantes_asc'
});

// Estadísticas
const estadisticas = ref({
  totalActivos: 0,
  pocasClases: 0,
  sinClases: 0,
  promedioClases: 0
});

// Opciones para dropdowns
const opcionesOrden = ref([
  { label: 'Menos clases primero', value: 'clases_restantes_asc' },
  { label: 'Más clases primero', value: 'clases_restantes_desc' },
  { label: 'Nombre A-Z', value: 'nombre_asc' },
  { label: 'Nombre Z-A', value: 'nombre_desc' }
]);

// Computed
const clasesRestantesFiltradas = computed(() => {
  let filtradas = inscripciones.value;

  // Filtrar por modalidad
  if (filtros.value.modalidad_id) {
    filtradas = filtradas.filter(i => i.modalidad_id === filtros.value.modalidad_id);
  }

  // Filtrar por sucursal
  if (filtros.value.sucursal_id) {
    filtradas = filtradas.filter(i => i.sucursal_id === filtros.value.sucursal_id);
  }

  // Ordenar
  switch (filtros.value.ordenar) {
    case 'clases_restantes_asc':
      filtradas.sort((a, b) => a.clases_restantes - b.clases_restantes);
      break;
    case 'clases_restantes_desc':
      filtradas.sort((a, b) => b.clases_restantes - a.clases_restantes);
      break;
    case 'nombre_asc':
      filtradas.sort((a, b) => a.estudiante_nombre.localeCompare(b.estudiante_nombre));
      break;
    case 'nombre_desc':
      filtradas.sort((a, b) => b.estudiante_nombre.localeCompare(a.estudiante_nombre));
      break;
  }

  return filtradas;
});



// En el script, agrega estas funciones:
async function cargarModalidades() {
  try {
    const response = await modalidadService.index(1, 100, '', {
      estado: 'activo'
    });

    let datos = [];
    if (response.data?.success && Array.isArray(response.data.data)) {
      datos = response.data.data;
    } else if (Array.isArray(response.data)) {
      datos = response.data;
    }

    modalidades.value = datos.map(m => ({
      id: m.id,
      nombre: m.nombre,
      precio_mensual: m.precio_mensual
    }));

    console.log('Modalidades cargadas:', modalidades.value.length);
  } catch (error) {
    console.error('Error cargando modalidades:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las modalidades',
      life: 3000
    });
  }
}

async function cargarSucursales() {
  try {
    // Primero intenta cargar desde el endpoint si existe
    try {
      const response = await fetch('/api/sucursales', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        let datos = [];
        
        if (data.success && Array.isArray(data.data)) {
          datos = data.data;
        } else if (Array.isArray(data)) {
          datos = data;
        }

        sucursales.value = datos.map(s => ({
          id: s.id,
          nombre: s.nombre,
          direccion: s.direccion
        }));

        console.log('Sucursales cargadas desde API:', sucursales.value.length);
        return;
      }
    } catch (apiError) {
      console.log('API de sucursales no disponible, usando datos de inscripciones');
    }

    // Si falla la API, espera a que se carguen las inscripciones
    // Esta función se llamará después en el flujo
    
  } catch (error) {
    console.error('Error en cargarSucursales:', error);
  }
}

// Y en la función cargarDatos, llama a estas funciones:
async function cargarDatos() {
  cargando.value = true;
  try {
    // Cargar modalidades primero
    await cargarModalidades();

    // Cargar inscripciones
    const response = await inscripcionService.index(1, 1000, '', {
      estado: 'activo',
      include: 'estudiante,modalidad,sucursal',
      with_clases_restantes: true
    });

    let datos = [];
    if (response.data?.success && Array.isArray(response.data.data)) {
      datos = response.data.data;
    } else if (Array.isArray(response.data)) {
      datos = response.data;
    }

    // Procesar datos para el reporte
    inscripciones.value = datos.map(insc => {
      const clasesTotales = parseInt(insc.clases_totales) || 0;
      const clasesAsistidas = parseInt(insc.clases_asistidas) || 0;
      const clasesRestantes = Math.max(0, clasesTotales - clasesAsistidas);

      return {
        inscripcion_id: insc.id,
        estudiante_id: insc.estudiante_id,
        estudiante_nombre: `${insc.estudiante?.nombres || ''} ${insc.estudiante?.apellidos || ''}`.trim(),
        estudiante_ci: insc.estudiante?.ci || '',
        modalidad_id: insc.modalidad_id,
        modalidad_nombre: insc.modalidad?.nombre || 'Sin modalidad',
        sucursal_id: insc.sucursal_id,
        sucursal_nombre: insc.sucursal?.nombre || 'Sin sucursal', // <-- IMPORTANTE
        clases_totales: clasesTotales,
        clases_asistidas: clasesAsistidas,
        clases_restantes: clasesRestantes,
        estado: insc.estado,
        fecha_fin: insc.fecha_fin,
        monto_mensual: insc.monto_mensual
      };
    });

    // ¡AHORA SÍ! Extraer sucursales únicas de las inscripciones
    extraerSucursalesDeInscripciones();
    
    // Calcular estadísticas
    calcularEstadisticas();
    actualizarGrafico();

    toast.add({
      severity: 'success',
      summary: 'Datos cargados',
      detail: `Se cargaron ${inscripciones.value.length} inscripciones activas`,
      life: 3000
    });

  } catch (error) {
    console.error('Error cargando datos:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos del reporte',
      life: 3000
    });
  } finally {
    cargando.value = false;
  }
}

// Agrega esta nueva función:
function extraerSucursalesDeInscripciones() {
  const sucursalesMap = {};
  
  inscripciones.value.forEach(insc => {
    if (insc.sucursal_id && insc.sucursal_nombre) {
      if (!sucursalesMap[insc.sucursal_id]) {
        sucursalesMap[insc.sucursal_id] = {
          id: insc.sucursal_id,
          nombre: insc.sucursal_nombre
        };
      }
    }
  });

  // Convertir a array y agregar opción "Todas"
  sucursales.value = Object.values(sucursalesMap);
  
  // Agregar opción "Todas" al principio
  sucursales.value.unshift({ 
    id: null, 
    nombre: 'Todas las sucursales' 
  });

  // También asegurar que modalidades tenga opción "Todas"
  if (modalidades.value.length > 0 && modalidades.value[0].id !== null) {
    modalidades.value.unshift({ 
      id: null, 
      nombre: 'Todas las modalidades' 
    });
  }

  console.log('Sucursales extraídas:', sucursales.value.length);
  console.log('Modalidades disponibles:', modalidades.value.length);
}

const rangosClases = computed(() => {
  const rangos = [
    { label: 'Sin Clases', min: 0, max: 0, color: '#EF4444', descripcion: 'Necesitan renovar' },
    { label: '1-3 Clases', min: 1, max: 3, color: '#F59E0B', descripcion: 'Pocas clases' },
    { label: '4-10 Clases', min: 4, max: 10, color: '#3B82F6', descripcion: 'Clases suficientes' },
    { label: '+10 Clases', min: 11, max: 999, color: '#10B981', descripcion: 'Muchas clases' }
  ];

  return rangos.map(rango => {
    const cantidad = inscripciones.value.filter(i => 
      i.clases_restantes >= rango.min && i.clases_restantes <= rango.max
    ).length;
    
    const porcentaje = inscripciones.value.length > 0 
      ? ((cantidad / inscripciones.value.length) * 100).toFixed(1)
      : '0.0';

    return {
      ...rango,
      cantidad,
      porcentaje
    };
  });
});

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Estudiantes',
      data: [],
      backgroundColor: '#3B82F6'
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
});

// Funciones


function calcularEstadisticas() {
  const totalActivos = inscripciones.value.length;
  const pocasClases = inscripciones.value.filter(i => i.clases_restantes > 0 && i.clases_restantes <= 3).length;
  const sinClases = inscripciones.value.filter(i => i.clases_restantes === 0).length;
  
  const totalClases = inscripciones.value.reduce((sum, i) => sum + i.clases_restantes, 0);
  const promedioClases = totalActivos > 0 ? (totalClases / totalActivos).toFixed(1) : 0;

  estadisticas.value = {
    totalActivos,
    pocasClases,
    sinClases,
    promedioClases
  };
}

function actualizarGrafico() {
  // Agrupar por rango de clases
  const labels = rangosClases.value.map(r => r.label);
  const data = rangosClases.value.map(r => r.cantidad);
  const colors = rangosClases.value.map(r => r.color);

  chartData.value = {
    labels: labels,
    datasets: [
      {
        label: 'Estudiantes',
        data: data,
        backgroundColor: colors
      }
    ]
  };
}

function aplicarFiltros() {
  // Los filtros se aplican automáticamente por computed
  toast.add({
    severity: 'info',
    summary: 'Filtros aplicados',
    detail: `Mostrando ${clasesRestantesFiltradas.value.length} estudiantes`,
    life: 2000
  });
}

function limpiarFiltros() {
  filtros.value = {
    modalidad_id: null,
    sucursal_id: null,
    ordenar: 'clases_restantes_asc'
  };
}

function getSeveridadClases(clases) {
  if (clases === 0) return 'danger';
  if (clases <= 3) return 'warning';
  if (clases <= 10) return 'info';
  return 'success';
}

function getSeveridadEstado(estado) {
  switch (estado) {
    case 'activo': return 'success';
    case 'suspendido': return 'warning';
    case 'en_mora': return 'danger';
    case 'vencido': return 'danger';
    default: return 'info';
  }
}

function getPorcentajeProgreso(data) {
  if (data.clases_totales === 0) return 0;
  const porcentaje = (data.clases_asistidas / data.clases_totales) * 100;
  return Math.min(100, Math.max(0, porcentaje)).toFixed(0);
}

function getColorVencimiento(fechaFin) {
  if (!fechaFin) return '';
  const dias = calcularDiasRestantes(fechaFin);
  if (dias <= 0) return 'text-red-500 font-bold';
  if (dias <= 3) return 'text-orange-500 font-bold';
  if (dias <= 7) return 'text-yellow-500';
  return '';
}

function calcularDiasRestantes(fechaFin) {
  if (!fechaFin) return 999;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fechaFin);
  fin.setHours(0, 0, 0, 0);
  const diffMs = fin.getTime() - hoy.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getDiasRestantes(fechaFin) {
  const dias = calcularDiasRestantes(fechaFin);
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return '1 día';
  if (dias > 0) return `${dias} días`;
  return `Hace ${Math.abs(dias)} días`;
}

function formatFecha(fecha) {
  if (!fecha) return '--';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatFechaHora(fecha) {
  const date = new Date(fecha);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getIniciales(nombre) {
  if (!nombre) return '?';
  const partes = nombre.split(' ');
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return partes[0][0].toUpperCase();
}

function verDetallesEstudiante(inscripcionId) {
  router.push(`/admin/inscripciones?detalle=${inscripcionId}`);
}

function notificarClases(data) {
  toast.add({
    severity: 'info',
    summary: 'Notificación',
    detail: `Enviar notificación a ${data.estudiante_nombre} sobre sus ${data.clases_restantes} clases restantes`,
    life: 3000
  });
}

function exportarExcel() {
  toast.add({
    severity: 'info',
    summary: 'Exportar Excel',
    detail: 'Funcionalidad de exportación en desarrollo',
    life: 3000
  });
}

function exportarPDF() {
  toast.add({
    severity: 'info',
    summary: 'Exportar PDF',
    detail: 'Funcionalidad de PDF en desarrollo',
    life: 3000
  });
}

function imprimirReporte() {
  window.print();
}

onMounted(() => {
  cargarDatos();
});
</script>

<style scoped>
.clases-restantes-container {
  padding: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

.stat-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
  height: 100%;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--card-color), transparent);
  opacity: 0.7;
}

.stat-card:nth-child(1) { --card-color: #3b82f6; }
.stat-card:nth-child(2) { --card-color: #f59e0b; }
.stat-card:nth-child(3) { --card-color: #ef4444; }
.stat-card:nth-child(4) { --card-color: #10b981; }

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: bold;
  background: linear-gradient(135deg, var(--card-color), #6b7280);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media print {
  .clases-restantes-container {
    background: white !important;
  }
  
  .stat-card, .p-card {
    box-shadow: none !important;
    border: 1px solid #ddd !important;
  }
  
  .p-button {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .clases-restantes-container {
    padding: 1rem;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .stat-icon {
    font-size: 2rem;
  }
  
  .stat-value {
    font-size: 1.8rem;
  }
}
</style>