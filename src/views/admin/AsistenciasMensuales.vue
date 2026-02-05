<template>
  <div class="asistencias-mensuales-container">
    <!-- HEADER MEJORADO -->
    <div class="header-glass">
      <div class="header-content">
        <div class="header-left">
          <div class="title-section">
            <div class="icon-badge">
              <i class="pi pi-chart-bar"></i>
            </div>
            <div>
              <h1 class="page-title">Reporte de Asistencia Mensual</h1>
              <p class="page-subtitle">Dashboard analítico de rendimiento de estudiantes</p>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <div class="month-navigation">
            <Button icon="pi pi-chevron-left" rounded 
              @click="cambiarMes(-1)" tooltip="Mes anterior" />
            <div class="current-month-display">
              <div class="month-label">MES ACTUAL</div>
              <div class="month-value">{{ mesActualLabel }}</div>
            </div>
            <Button icon="pi pi-chevron-right" rounded 
              @click="cambiarMes(1)" tooltip="Mes siguiente" />
          </div>
          
          <div class="header-actions">
            <Button icon="pi pi-file-excel" severity="help" 
              @click="exportarExcel" tooltip="Exportar a Excel" />
            <Button icon="pi pi-refresh" severity="secondary" 
              @click="cargarDatos" :loading="cargando" tooltip="Refrescar datos" />
          </div>
        </div>
      </div>
    </div>

    <!-- PANEL DE FILTROS MEJORADO -->
    <div class="filters-panel">
      <Card class="filters-card">
        <template #content>
          <div class="filters-grid">
            <div class="filter-item">
              <label class="filter-label">
                <i class="pi pi-calendar"></i>
                <span>Mes y Año</span>
              </label>
              <Calendar v-model="mesSeleccionado" view="month" dateFormat="mm/yy" 
                class="filter-input" @date-select="cambiarMesSeleccionado" showIcon />
            </div>
            
            <div class="filter-item">
              <label class="filter-label">
                <i class="pi pi-star"></i>
                <span>Modalidad</span>
              </label>
              <Dropdown v-model="filtros.modalidad_id" :options="modalidades" 
                optionLabel="nombre" optionValue="id" placeholder="Todas las modalidades" 
                class="filter-input" />
            </div>
            
            <div class="filter-item">
              <label class="filter-label">
                <i class="pi pi-building"></i>
                <span>Sucursal</span>
              </label>
              <Dropdown v-model="filtros.sucursal_id" :options="sucursales" 
                optionLabel="nombre" optionValue="id" placeholder="Todas las sucursales" 
                class="filter-input" />
            </div>
            
            <div class="filter-item">
              <Button label="Aplicar Filtros" icon="pi pi-filter" 
                @click="aplicarFiltros" :loading="cargando" />
              <Button label="Limpiar" severity="secondary" outlined
                @click="limpiarFiltros" class="ml-2" />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- DASHBOARD DE KPI's MEJORADO -->
    <div class="kpi-dashboard">
      <div class="grid">
        <div class="col-12 md:col-3">
          <div class="kpi-card kpi-success">
            <div class="kpi-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ formatNumber(estadisticas.totalAsistencias) }}</div>
              <div class="kpi-label">Total Asistencias</div>
              <div class="kpi-trend">
                <i class="pi pi-arrow-up text-green-500"></i>
                <span class="text-green-500">+12% vs mes anterior</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-12 md:col-3">
          <div class="kpi-card kpi-danger">
            <div class="kpi-icon">
              <i class="pi pi-times-circle"></i>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ formatNumber(estadisticas.totalAusencias) }}</div>
              <div class="kpi-label">Total Ausencias</div>
              <div class="kpi-trend">
                <i class="pi pi-arrow-down text-green-500"></i>
                <span class="text-green-500">-5% vs mes anterior</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-12 md:col-3">
          <div class="kpi-card kpi-primary">
            <div class="kpi-icon">
              <i class="pi pi-percentage"></i>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ estadisticas.porcentajeAsistencia }}%</div>
              <div class="kpi-label">Tasa de Asistencia</div>
              <div class="kpi-progress">
                <ProgressBar :value="estadisticas.porcentajeAsistencia" 
                  :showValue="false" class="custom-progressbar" />
                <small class="text-500">{{ getNivelAsistencia(estadisticas.porcentajeAsistencia) }}</small>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-12 md:col-3">
          <div class="kpi-card kpi-warning">
            <div class="kpi-icon">
              <i class="pi pi-users"></i>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ formatNumber(estadisticas.estudiantesActivos) }}</div>
              <div class="kpi-label">Estudiantes Activos</div>
              <div class="kpi-detail">
                <small class="text-500">
                  <i class="pi pi-chart-line text-blue-500"></i>
                  {{ promedioAsistenciasPorEstudiante }} asistencias/promedio
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SECCIÓN DE GRÁFICOS MEJORADA -->
    <div class="charts-section">
      <div class="grid">
        <!-- Gráfico de Evolución -->
        <div class="col-12 md:col-8">
          <Card class="chart-card">
            <template #title>
              <div class="chart-title">
                <i class="pi pi-chart-line text-primary"></i>
                <span>Evolución de Asistencia - Últimos 6 Meses</span>
              </div>
            </template>
            <template #content>
              <div v-if="cargando" class="chart-loading">
                <ProgressSpinner />
                <p class="text-500 mt-2">Cargando datos de evolución...</p>
              </div>
              <div v-else-if="!tieneDatosGrafico" class="chart-empty">
                <i class="pi pi-chart-line text-400" style="font-size: 3rem"></i>
                <p class="text-500 mt-2">No hay datos disponibles para mostrar</p>
              </div>
              <div v-else class="chart-container">
                <Chart type="line" :data="datosGraficoEvolucion" :options="opcionesGraficoLinea" height="300" />
              </div>
            </template>
          </Card>
        </div>
        
        <!-- Gráficos Lado Derecho -->
        <div class="col-12 md:col-4">
          <div class="grid">
            <div class="col-12">
              <Card class="chart-card-small">
                <template #title>
                  <div class="chart-title-small">
                    <i class="pi pi-chart-pie text-green-500"></i>
                    <span>Por Modalidad</span>
                  </div>
                </template>
                <template #content>
                  <div v-if="tieneDatosModalidad" class="small-chart-container">
                    <Chart type="doughnut" :data="datosGraficoModalidad" :options="opcionesGraficoDona" height="200" />
                  </div>
                  <div v-else class="text-center py-4">
                    <small class="text-500">Sin datos</small>
                  </div>
                </template>
              </Card>
            </div>
            
            <div class="col-12">
              <Card class="chart-card-small">
                <template #title>
                  <div class="chart-title-small">
                    <i class="pi pi-calendar text-blue-500"></i>
                    <span>Por Día de Semana</span>
                  </div>
                </template>
                <template #content>
                  <div v-if="tieneDatosDias" class="small-chart-container">
                    <Chart type="bar" :data="datosGraficoDias" :options="opcionesGraficoBarras" height="200" />
                  </div>
                  <div v-else class="text-center py-4">
                    <small class="text-500">Sin datos</small>
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLA DETALLADA MEJORADA -->
    <div class="detailed-section">
      <Card class="detailed-card">
        <template #title>
          <div class="detailed-title">
            <div class="detailed-title-left">
              <i class="pi pi-table text-primary"></i>
              <div>
                <h3 class="m-0">Reporte Detallado de Asistencias</h3>
                <small class="text-500">Desglose por estudiante y modalidad</small>
              </div>
            </div>
            <div class="detailed-title-right">
              <div class="summary-stats">
                <Tag :value="`${asistenciasDetalladas.length} estudiantes`" severity="info" />
                <Tag :value="`${estadisticas.porcentajeAsistencia}% promedio`" severity="success" />
              </div>
            </div>
          </div>
        </template>
        <template #content>
          <DataTable :value="asistenciasDetalladas" :paginator="true" :rows="15" 
            class="p-datatable-sm detailed-table" :loading="cargando"
            :globalFilterFields="['estudiante_nombre', 'modalidad_nombre']">
            
            <Column header="#" style="width: 60px">
              <template #body="slotProps">
                <div class="text-center">
                  <span class="row-number">{{ slotProps.index + 1 }}</span>
                </div>
              </template>
            </Column>
            
            <Column header="Estudiante" :sortable="true" style="min-width: 200px">
              <template #body="slotProps">
                <div class="student-cell">
                  <Avatar :label="getIniciales(slotProps.data.estudiante_nombre)" 
                    size="small" shape="circle" class="mr-2" />
                  <div>
                    <div class="font-medium">{{ slotProps.data.estudiante_nombre }}</div>
                    <small class="text-500">{{ slotProps.data.modalidad_nombre }}</small>
                  </div>
                </div>
              </template>
            </Column>
            
            <Column header="Asistencias" :sortable="true" style="width: 150px">
              <template #body="slotProps">
                <div class="attendance-cell">
                  <div class="attendance-badges">
                    <Badge :value="slotProps.data.asistencias_mes" 
                      severity="success" size="large" />
                    <Badge :value="slotProps.data.ausencias_mes" 
                      severity="danger" size="large" class="ml-2" />
                  </div>
                  <div class="attendance-detail">
                    <small class="text-500">
                      {{ slotProps.data.total_clases }} clases totales
                    </small>
                  </div>
                </div>
              </template>
            </Column>
            
            <Column header="Rendimiento" :sortable="true" sortField="porcentaje_asistencia" 
              style="width: 200px">
              <template #body="slotProps">
                <div class="performance-cell">
                  <div class="performance-header">
                    <span class="performance-value">{{ slotProps.data.porcentaje_asistencia }}%</span>
                    <Tag :value="getPerformanceLabel(slotProps.data.porcentaje_asistencia)" 
                      :severity="getPerformanceSeverity(slotProps.data.porcentaje_asistencia)" 
                      class="ml-2" />
                  </div>
                  <div class="performance-progress">
                    <ProgressBar :value="slotProps.data.porcentaje_asistencia" 
                      :showValue="false" :style="{ height: '6px' }" 
                      :class="getPerformanceBarClass(slotProps.data.porcentaje_asistencia)" />
                  </div>
                  <div class="performance-footer">
                    <small class="text-500">
                      <i class="pi pi-chart-line mr-1"></i>
                      {{ slotProps.data.promedio_semanal }} asistencias/semana
                    </small>
                  </div>
                </div>
              </template>
            </Column>
            
            <template #empty>
              <div class="empty-table">
                <i class="pi pi-inbox text-400" style="font-size: 3rem"></i>
                <h4 class="mt-3">No hay datos disponibles</h4>
                <p class="text-500">No se encontraron registros de asistencia para el período seleccionado</p>
              </div>
            </template>
          </DataTable>
        </template>
      </Card>
    </div>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';

// Componentes PrimeVue
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import Chart from 'primevue/chart';
import Badge from 'primevue/badge';
import Toast from 'primevue/toast';

// Servicios
import asistenciaService from '@/services/asistencia.service';
import modalidadService from '@/services/modalidad.service';
import sucursalService from '@/services/sucursal.service';

const toast = useToast();

// Estados
const cargando = ref(false);
const mesSeleccionado = ref(new Date());
const asistencias = ref([]);
const modalidades = ref([]);
const sucursales = ref([]);

// Filtros
const filtros = ref({
  modalidad_id: null,
  sucursal_id: null
});

// Estadísticas
const estadisticas = ref({
  totalAsistencias: 0,
  totalAusencias: 0,
  porcentajeAsistencia: 0,
  estudiantesActivos: 0
});

// Computed properties optimizadas
const fechaGeneracion = computed(() => {
  return new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const mesActualLabel = computed(() => {
  const fecha = new Date(mesSeleccionado.value);
  return fecha.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  }).toUpperCase();
});

const promedioAsistenciasPorEstudiante = computed(() => {
  if (estadisticas.value.estudiantesActivos === 0) return 0;
  const promedio = estadisticas.value.totalAsistencias / estadisticas.value.estudiantesActivos;
  return Math.round(promedio * 10) / 10;
});

const asistenciasFiltradas = computed(() => {
  const mes = mesSeleccionado.value.getMonth() + 1;
  const año = mesSeleccionado.value.getFullYear();

  return asistencias.value.filter(a => {
    if (!a.fecha) return false;
    const fecha = new Date(a.fecha);
    
    const coincideMes = fecha.getMonth() + 1 === mes && fecha.getFullYear() === año;
    const coincideModalidad = !filtros.value.modalidad_id || a.modalidad_id === filtros.value.modalidad_id;
    const coincideSucursal = !filtros.value.sucursal_id || a.sucursal_id === filtros.value.sucursal_id;
    
    return coincideMes && coincideModalidad && coincideSucursal;
  });
});

const asistenciasDetalladas = computed(() => {
  const agrupadas = asistenciasFiltradas.value.reduce((acc, asistencia) => {
    const key = asistencia.estudiante_id;
    
    if (!acc[key]) {
      acc[key] = {
        estudiante_id: asistencia.estudiante_id,
        estudiante_nombre: asistencia.estudiante_nombre || 'Sin nombre',
        modalidad_nombre: asistencia.modalidad_nombre || 'Sin modalidad',
        asistencias_mes: 0,
        ausencias_mes: 0,
        total_clases: 0
      };
    }
    
    if (asistencia.estado === 'asistio') acc[key].asistencias_mes++;
    else if (asistencia.estado === 'ausente') acc[key].ausencias_mes++;
    
    acc[key].total_clases = acc[key].asistencias_mes + acc[key].ausencias_mes;
    
    return acc;
  }, {});

  return Object.values(agrupadas).map(estudiante => {
    const porcentaje = estudiante.total_clases > 0 
      ? Math.round((estudiante.asistencias_mes / estudiante.total_clases) * 100)
      : 0;
    
    return {
      ...estudiante,
      porcentaje_asistencia: porcentaje,
      promedio_semanal: Math.round(estudiante.asistencias_mes / 4)
    };
  }).sort((a, b) => b.porcentaje_asistencia - a.porcentaje_asistencia);
});

// Computed properties para gráficos optimizados
const tieneDatosGrafico = computed(() => {
  return datosGraficoEvolucion.value?.labels?.length > 0;
});

const tieneDatosModalidad = computed(() => {
  return datosGraficoModalidad.value?.labels?.length > 0;
});

const tieneDatosDias = computed(() => {
  return datosGraficoDias.value?.labels?.length > 0;
});

const datosGraficoEvolucion = computed(() => {
  const ultimos6Meses = getUltimos6Meses();
  const mesesLabels = ultimos6Meses.map(m => m.label);
  
  const datosMensuales = ultimos6Meses.map(fechaMes => {
    const asistenciasMes = asistencias.value.filter(a => 
      a.fecha && esMismoMesYAnio(new Date(a.fecha), fechaMes.fecha)
    );
    
    return {
      asistencias: asistenciasMes.filter(a => a.estado === 'asistio').length,
      ausencias: asistenciasMes.filter(a => a.estado === 'falto').length
    };
  });
  
  return {
    labels: mesesLabels,
    datasets: [
      {
        label: 'Asistencias',
        data: datosMensuales.map(d => d.asistencias),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Ausencias',
        data: datosMensuales.map(d => d.ausencias),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
});

const datosGraficoModalidad = computed(() => {
  const modalidadesMap = asistenciasFiltradas.value.reduce((acc, a) => {
    if (a.estado === 'asistio') {
      const modalidad = a.modalidad_nombre || 'Sin modalidad';
      acc[modalidad] = (acc[modalidad] || 0) + 1;
    }
    return acc;
  }, {});

  return {
    labels: Object.keys(modalidadesMap),
    datasets: [{
      data: Object.values(modalidadesMap),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
        '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
      ],
      borderWidth: 1
    }]
  };
});

const datosGraficoDias = computed(() => {
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const asistenciasPorDia = new Array(7).fill(0);
  
  asistenciasFiltradas.value.forEach(a => {
    if (a.estado === 'asistio' && a.fecha) {
      const fecha = new Date(a.fecha);
      const dia = fecha.getDay();
      const index = dia === 0 ? 6 : dia - 1;
      asistenciasPorDia[index]++;
    }
  });
  
  return {
    labels: diasSemana,
    datasets: [{
      label: 'Asistencias',
      data: asistenciasPorDia,
      backgroundColor: '#3B82F6',
      borderRadius: 4
    }]
  };
});

// Opciones de gráficos optimizadas
const opcionesGraficoLinea = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'nearest'
  }
});

const opcionesGraficoDona = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
});

const opcionesGraficoBarras = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
});

// Funciones de utilidad
function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('es-ES').format(num);
}

function getNivelAsistencia(porcentaje) {
  if (porcentaje >= 90) return 'Excelente';
  if (porcentaje >= 80) return 'Bueno';
  if (porcentaje >= 70) return 'Regular';
  return 'Necesita mejorar';
}

function getPerformanceLabel(porcentaje) {
  if (porcentaje >= 90) return 'Excelente';
  if (porcentaje >= 80) return 'Bueno';
  if (porcentaje >= 70) return 'Regular';
  if (porcentaje >= 60) return 'Aceptable';
  return 'Bajo';
}

function getPerformanceSeverity(porcentaje) {
  if (porcentaje >= 90) return 'success';
  if (porcentaje >= 80) return 'info';
  if (porcentaje >= 70) return 'warning';
  return 'danger';
}

function getPerformanceBarClass(porcentaje) {
  if (porcentaje >= 90) return 'progress-excellent';
  if (porcentaje >= 80) return 'progress-good';
  if (porcentaje >= 70) return 'progress-regular';
  return 'progress-poor';
}

function getIniciales(nombre) {
  if (!nombre) return '?';
  const partes = nombre.split(' ');
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return partes[0][0].toUpperCase();
}

// Funciones auxiliares para gráficos
function getUltimos6Meses() {
  const meses = [];
  const hoy = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    meses.push({
      fecha: fecha,
      label: fecha.toLocaleDateString('es-ES', { 
        month: 'short' 
      }).toUpperCase()
    });
  }
  
  return meses;
}

function esMismoMesYAnio(fecha1, fecha2) {
  return fecha1.getMonth() === fecha2.getMonth() && 
         fecha1.getFullYear() === fecha2.getFullYear();
}

// Funciones principales
async function cargarDatos() {
  cargando.value = true;
  try {
    await Promise.all([
      cargarModalidades(),
      cargarSucursales(),
      cargarAsistencias()
    ]);

    calcularEstadisticas();
    
    toast.add({
      severity: 'success',
      summary: 'Datos cargados',
      detail: `Se cargaron ${asistencias.value.length} registros de asistencia`,
      life: 3000
    });

  } catch (error) {
    console.error('Error cargando datos:', error);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos de asistencia',
      life: 3000
    });
  } finally {
    cargando.value = false;
  }
}

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

    modalidades.value = [
      { id: null, nombre: 'Todas las modalidades' },
      ...datos.map(m => ({
        id: m.id,
        nombre: m.nombre
      }))
    ];

  } catch (error) {
    console.error('Error cargando modalidades:', error);
    modalidades.value = [{ id: null, nombre: 'Todas las modalidades' }];
  }
}

async function cargarSucursales() {
  try {
    const response = await sucursalService.index(1, 100);
    
    let datos = [];
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      datos = response.data.data;
    } else if (Array.isArray(response.data)) {
      datos = response.data;
    } else if (response.data?.items && Array.isArray(response.data.items)) {
      datos = response.data.items;
    }
    
    sucursales.value = [
      { id: null, nombre: 'Todas las sucursales' },
      ...datos.map(s => ({
        id: s.id || s.sucursal_id || s.codigo,
        nombre: s.nombre || s.nombre_sucursal || s.descripcion || s.titulo || 'Sin nombre'
      })).filter(s => s.id !== undefined && s.id !== null)
    ];

  } catch (error) {
    console.error('Error cargando sucursales:', error);
    
    if (process.env.NODE_ENV === 'development') {
      sucursales.value = [
        { id: null, nombre: 'Todas las sucursales' },
        { id: 1, nombre: 'Sucursal Principal' },
        { id: 2, nombre: 'Sucursal Norte' },
        { id: 3, nombre: 'Sucursal Sur' }
      ];
    } else {
      sucursales.value = [{ id: null, nombre: 'Todas las sucursales' }];
    }
  }
}

async function cargarAsistencias() {
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

  const response = await asistenciaService.index(1, 1000, '', {
    fecha_desde: seisMesesAtras.toISOString().split('T')[0],
    include: 'estudiante,modalidad,sucursal'
  });

  let datos = [];
  if (response.data?.success && Array.isArray(response.data.data)) {
    datos = response.data.data;
  } else if (Array.isArray(response.data)) {
    datos = response.data;
  } else if (response.data?.items) {
    datos = response.data.items;
  }

  asistencias.value = datos.map(a => ({
    id: a.id,
    estudiante_id: a.estudiante_id,
    estudiante_nombre: a.estudiante_nombre ||
      `${a.estudiante?.nombres || ''} ${a.estudiante?.apellidos || ''}`.trim() ||
      'Sin nombre',
    modalidad_id: a.modalidad_id,
    modalidad_nombre: a.modalidad_nombre || a.modalidad?.nombre || 'Sin modalidad',
    sucursal_id: a.sucursal_id,
    sucursal_nombre: a.sucursal_nombre || a.sucursal?.nombre || 'Sin sucursal',
    fecha: a.fecha,
    estado: a.estado || 'sin estado',
    hora_entrada: a.hora_entrada,
    hora_salida: a.hora_salida
  }));
}

function calcularEstadisticas() {
  const asistenciasMes = asistenciasFiltradas.value;

  const totalAsistencias = asistenciasMes.filter(a => a.estado === 'asistio').length;
  const totalAusencias = asistenciasMes.filter(a => a.estado === 'falto').length;
  const totalRegistros = totalAsistencias + totalAusencias;
  
  const porcentajeAsistencia = totalRegistros > 0 
    ? Math.round((totalAsistencias / totalRegistros) * 100)
    : 0;

  const estudiantesUnicos = new Set(
    asistenciasMes
      .filter(a => a.estudiante_id)
      .map(a => a.estudiante_id)
  );

  estadisticas.value = {
    totalAsistencias,
    totalAusencias,
    porcentajeAsistencia,
    estudiantesActivos: estudiantesUnicos.size
  };
}

function cambiarMes(incremento) {
  const nuevaFecha = new Date(mesSeleccionado.value);
  nuevaFecha.setMonth(nuevaFecha.getMonth() + incremento);
  mesSeleccionado.value = nuevaFecha;
  
  calcularEstadisticas();
}

function cambiarMesSeleccionado() {
  calcularEstadisticas();
}

function aplicarFiltros() {
  calcularEstadisticas();
}

function limpiarFiltros() {
  filtros.value.modalidad_id = null;
  filtros.value.sucursal_id = null;
  calcularEstadisticas();
}

function exportarExcel() {
  toast.add({
    severity: 'info',
    summary: 'Exportar Excel',
    detail: 'Funcionalidad de exportación Excel en desarrollo',
    life: 3000
  });
}

// Watch para cambios en los filtros
watch([() => filtros.value.modalidad_id, () => filtros.value.sucursal_id], () => {
  calcularEstadisticas();
}, { deep: true });

// Cargar datos al montar el componente
onMounted(() => {
  cargarDatos();
});
</script>

<style scoped>
.asistencias-mensuales-container {
  padding: 1.5rem;
  max-width: 1800px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* HEADER GLASSMORPHISM */
.header-glass {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-badge {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-badge i {
  font-size: 2rem;
  color: white;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.page-subtitle {
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.current-month-display {
  text-align: center;
  min-width: 200px;
}

.month-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.month-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* PANEL DE FILTROS */
.filters-panel {
  margin-bottom: 2rem;
}

.filters-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: white;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #4b5563;
  font-weight: 500;
}

.filter-label i {
  color: #3b82f6;
}

.filter-input {
  width: 100%;
}

/* KPI CARDS */
.kpi-dashboard {
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  height: 100%;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.kpi-success {
  border-left: 4px solid #10b981;
}

.kpi-danger {
  border-left: 4px solid #ef4444;
}

.kpi-primary {
  border-left: 4px solid #3b82f6;
}

.kpi-warning {
  border-left: 4px solid #f59e0b;
}

.kpi-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-success .kpi-icon {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #10b981;
}

.kpi-danger .kpi-icon {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #ef4444;
}

.kpi-primary .kpi-icon {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #3b82f6;
}

.kpi-warning .kpi-icon {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #f59e0b;
}

.kpi-icon i {
  font-size: 2rem;
}

.kpi-content {
  flex: 1;
}

.kpi-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.kpi-label {
  color: #6b7280;
  margin: 0.5rem 0;
  font-size: 0.875rem;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
}

.kpi-progress {
  margin-top: 0.5rem;
}

.custom-progressbar {
  height: 6px !important;
  border-radius: 3px !important;
}

.kpi-detail {
  margin-top: 0.5rem;
}

/* CHARTS SECTION */
.charts-section {
  margin-bottom: 2rem;
}

.chart-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: white;
  height: 100%;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.chart-loading,
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #9ca3af;
}

.chart-container {
  position: relative;
  height: 320px;
  padding: 0.5rem;
}

.chart-card-small {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: white;
  height: 100%;
}

.chart-title-small {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.small-chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* DETAILED TABLE */
.detailed-section {
  margin-bottom: 2rem;
}

.detailed-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: white;
}

.detailed-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detailed-title-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detailed-title-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-stats {
  display: flex;
  gap: 0.5rem;
}

.detailed-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.row-number {
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  background: #f3f4f6;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
}

.student-cell {
  display: flex;
  align-items: center;
}

.attendance-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.attendance-badges {
  display: flex;
  gap: 0.5rem;
}

.performance-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.performance-header {
  display: flex;
  align-items: center;
}

.performance-value {
  font-weight: 600;
  color: #1f2937;
}

.performance-progress {
  width: 100%;
}

.progress-excellent :deep(.p-progressbar-value) {
  background: #10b981 !important;
}

.progress-good :deep(.p-progressbar-value) {
  background: #3b82f6 !important;
}

.progress-regular :deep(.p-progressbar-value) {
  background: #f59e0b !important;
}

.progress-poor :deep(.p-progressbar-value) {
  background: #ef4444 !important;
}

.empty-table {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .asistencias-mensuales-container {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .month-navigation {
    width: 100%;
    justify-content: space-between;
  }
  
  .current-month-display {
    min-width: auto;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .kpi-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .detailed-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .chart-container {
    height: 250px;
  }
}

@media (max-width: 576px) {
  .kpi-value {
    font-size: 2rem;
  }
  
  .kpi-icon {
    width: 50px;
    height: 50px;
  }
  
  .kpi-icon i {
    font-size: 1.5rem;
  }
}
</style>