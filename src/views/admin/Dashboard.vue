<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="flex align-items-center">
        <i class="pi pi-chart-bar text-primary text-3xl mr-3"></i>
        <div>
          <h1>Dashboard de Gestión</h1>
          <p class="text-500 m-0">Resumen completo del sistema</p>
        </div>
      </div>
      <div class="header-actions">
        <Button label="Actualizar" icon="pi pi-refresh" severity="info" 
                @click="cargarDatos" :loading="cargando" />
        <span class="text-500 text-sm">Última actualización: {{ ultimaActualizacion }}</span>
      </div>
    </div>

    <!-- TARJETAS PRINCIPALES MEJORADAS -->
    <div class="dashboard-cards">
      <div class="grid">
        
        <!-- Tarjeta 1: CLIENTES ACTIVOS -->
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>
              <div class="flex align-items-center">
                <div class="card-icon bg-blue-100 text-blue-600 p-2 rounded-circle mr-2">
                  <i class="pi pi-users"></i>
                </div>
                <div>
                  <div class="text-sm text-500">Estudiantes Activos</div>
                  <div class="font-bold">{{ estadisticas.inscripcionesActivas }}</div>
                </div>
              </div>
            </template>
            <template #content>
              <div class="mt-2">
                <small class="text-500">Total inscritos: {{ estadisticas.totalInscripciones }}</small>
                <div class="flex justify-content-between align-items-center mt-2">
                  <span class="text-sm">Tasa de renovación</span>
                  <span class="font-bold" :class="estadisticas.tasaRenovacion >= 70 ? 'text-green-600' : 'text-orange-600'">
                    {{ estadisticas.tasaRenovacion }}%
                  </span>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Tarjeta 2: FINANZAS -->
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>
              <div class="flex align-items-center">
                <div class="card-icon bg-green-100 text-green-600 p-2 rounded-circle mr-2">
                  <i class="pi pi-money-bill"></i>
                </div>
                <div>
                  <div class="text-sm text-500">Recaudación Total</div>
                  <div class="font-bold text-green-600">Bs.{{ formatMonto(estadisticas.recaudacionTotal) }}</div>
                </div>
              </div>
            </template>
            <template #content>
              <div class="mt-2">
                <div class="flex justify-content-between">
                  <small class="text-500">Este mes</small>
                  <small class="font-bold text-green-600">Bs.{{ formatMonto(estadisticas.recaudacionMes) }}</small>
                </div>
                <div class="flex justify-content-between mt-1">
                  <small class="text-500">Promedio/pago</small>
                  <small class="font-bold">Bs.{{ formatMonto(estadisticas.promedioPago) }}</small>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Tarjeta 3: SITUACIÓN DE PAGOS -->
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>
              <div class="flex align-items-center">
                <div class="card-icon bg-orange-100 text-orange-600 p-2 rounded-circle mr-2">
                  <i class="pi pi-exclamation-triangle"></i>
                </div>
                <div>
                  <div class="text-sm text-500">Situación de Pagos</div>
                  <div class="font-bold text-orange-600">{{ estadisticas.inscripcionesEnMora }}</div>
                </div>
              </div>
            </template>
            <template #content>
              <div class="mt-2">
                <div class="flex justify-content-between mb-2">
                  <small class="text-500">Pagos en mora:</small>
                  <small class="font-bold text-red-600">Bs.{{ formatMonto(estadisticas.pagosVencidosMonto || estadisticas.montoEnMora) }}</small>
                </div>
                <div class="flex justify-content-between">
                  <small class="text-500">Por vencer (7 días):</small>
                  <small class="font-bold">{{ estadisticas.inscripcionesPorVencer }}</small>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Tarjeta 4: ACTIVIDAD HOY -->
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>
              <div class="flex align-items-center">
                <div class="card-icon bg-purple-100 text-purple-600 p-2 rounded-circle mr-2">
                  <i class="pi pi-calendar"></i>
                </div>
                <div>
                  <div class="text-sm text-500">Actividad Hoy</div>
                  <div class="font-bold text-purple-600">{{ estadisticas.clasesHoy }}</div>
                </div>
              </div>
            </template>
            <template #content>
              <div class="mt-2">
                <small class="text-500">Clases programadas</small>
                <div class="mt-2">
                  <div class="flex justify-content-between">
                    <span class="text-sm">Pagados total</span>
                    <span class="font-bold">{{ estadisticas.pagosPagados }}</span>
                  </div>
                  <div class="flex justify-content-between mt-1">
                    <span class="text-sm">Pagos totales</span>
                    <span class="font-bold">{{ estadisticas.totalPagos }}</span>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- SECCIÓN DE ESTADO GENERAL -->
    <div class="dashboard-section">
      <Card>
        <template #title>
          <div class="flex align-items-center">
            <i class="pi pi-chart-pie mr-2 text-primary"></i>
            <span>Estado General del Sistema</span>
          </div>
        </template>
        <template #content>
          <div class="grid">
            
            <!-- Panel de Inscripciones -->
            <div class="col-12 md:col-6">
              <div class="panel-estado">
                <div class="panel-header">
                  <i class="pi pi-users text-blue-500 mr-2"></i>
                  <span class="font-bold">Inscripciones</span>
                </div>
                <div class="panel-content">
                  <div class="estado-item" v-for="(item, key) in [
                    { label: 'Activas', value: estadisticas.inscripcionesActivas, color: 'bg-green-500', icon: 'pi pi-check' },
                    { label: 'En mora', value: estadisticas.inscripcionesEnMora, color: 'bg-red-500', icon: 'pi pi-exclamation-triangle' },
                    { label: 'Por vencer', value: estadisticas.inscripcionesPorVencer, color: 'bg-orange-500', icon: 'pi pi-clock' },
                    { label: 'Total', value: estadisticas.totalInscripciones, color: 'bg-blue-500', icon: 'pi pi-chart-bar' }
                  ]" :key="key">
                    <div class="flex align-items-center">
                      <div class="estado-icon" :class="item.color">
                        <i :class="item.icon"></i>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm text-500">{{ item.label }}</div>
                        <div class="font-bold text-lg">{{ item.value }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Panel de Finanzas -->
            <div class="col-12 md:col-6">
              <div class="panel-estado">
                <div class="panel-header">
                  <i class="pi pi-wallet text-green-500 mr-2"></i>
                  <span class="font-bold">Finanzas</span>
                </div>
                <div class="panel-content">
                  <div class="estado-item" v-for="(item, key) in [
                    { label: 'Recaudación total', value: `Bs.${formatMonto(estadisticas.recaudacionTotal)}`, color: 'bg-green-500', icon: 'pi pi-money-bill' },
                    { label: 'Recaudación mes', value: `Bs.${formatMonto(estadisticas.recaudacionMes)}`, color: 'bg-teal-500', icon: 'pi pi-calendar' },
                    { label: 'Monto en mora', value: `Bs.${formatMonto(estadisticas.montoEnMora)}`, color: 'bg-red-500', icon: 'pi pi-exclamation-circle' },
                    { label: 'Promedio pago', value: `Bs.${formatMonto(estadisticas.promedioPago)}`, color: 'bg-blue-500', icon: 'pi pi-chart-line' }
                  ]" :key="key">
                    <div class="flex align-items-center">
                      <div class="estado-icon" :class="item.color">
                        <i :class="item.icon"></i>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm text-500">{{ item.label }}</div>
                        <div class="font-bold text-lg">{{ item.value }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </template>
      </Card>
    </div>

    <!-- Sección de gráficos y estadísticas detalladas -->
    <div class="dashboard-section">
      <div class="grid">
        <!-- Gráfico de Recaudación por Mes -->
        <div class="col-12 lg:col-8">
          <Card>
            <template #title>
              <div class="flex align-items-center justify-content-between">
                <div class="flex align-items-center">
                  <i class="pi pi-chart-line mr-2 text-primary"></i>
                  <span>Recaudación Mensual</span>
                </div>
                <Dropdown v-model="periodoGrafico" :options="periodos" optionLabel="label" optionValue="value"
                  placeholder="Últimos 6 meses" class="w-15rem" />
              </div>
            </template>
            <template #content>
              <div v-if="cargandoGrafico" class="text-center p-5">
                <ProgressSpinner style="width: 50px; height: 50px" />
                <p class="text-500 mt-3">Cargando datos del gráfico...</p>
              </div>
              
              <!-- CORRECCIÓN PRINCIPAL: Usar div con v-else-if y verificar datos -->
              <div v-else-if="chartDataRecaudacion.labels && chartDataRecaudacion.labels.length > 0">
                <Chart 
                  :key="chartKey"
                  :type="'line'" 
                  :data="chartDataRecaudacion" 
                  :options="chartOptions" 
                  :height="250" />
              </div>
              
              <div v-else class="text-center p-5">
                <p class="text-500">No hay datos para mostrar</p>
              </div>
            </template>
          </Card>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="col-12 lg:col-4">
          <Card class="h-full">
            <template #title>
              <div class="flex align-items-center">
                <i class="pi pi-chart-bar mr-2 text-primary"></i>
                <span>Estadísticas Rápidas</span>
              </div>
            </template>
            <template #content>
              <div class="quick-stats">
                <div class="quick-stat-item">
                  <div class="flex justify-content-between">
                    <span class="text-500">Promedio por pago:</span>
                    <span class="font-bold text-green-600">Bs.{{ formatMonto(estadisticas.promedioPago) }}</span>
                  </div>
                  <ProgressBar :value="calcularProgresoPromedio()" :showValue="false" class="mt-2" />
                </div>

                <Divider />

                <div class="quick-stat-item">
                  <div class="flex justify-content-between">
                    <span class="text-500">Clases hoy:</span>
                    <span class="font-bold text-blue-600">{{ estadisticas.clasesHoy }}</span>
                  </div>
                  <ProgressBar :value="calcularProgresoClases()" :showValue="false" class="mt-2" />
                </div>

                <Divider />

                <div class="quick-stat-item">
                  <div class="flex justify-content-between">
                    <span class="text-500">Por vencer (7 días):</span>
                    <span class="font-bold text-orange-600">{{ estadisticas.inscripcionesPorVencer }}</span>
                  </div>
                  <ProgressBar :value="calcularProgresoVencimientos()" :showValue="false" class="mt-2" />
                </div>

                <Divider />

                <div class="quick-stat-item">
                  <div class="flex justify-content-between">
                    <span class="text-500">Tasa de renovación:</span>
                    <span class="font-bold" :class="getColorTasaRenovacion()">
                      {{ estadisticas.tasaRenovacion }}%
                    </span>
                  </div>
                  <ProgressBar :value="estadisticas.tasaRenovacion" :showValue="false"
                    :class="getClaseProgressBarRenovacion()" class="mt-2" />
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Sección de últimas inscripciones y pagos -->
    <div class="dashboard-section">
      <div class="grid">
        <!-- Últimas Inscripciones -->
        <div class="col-12 lg:col-6">
          <Card>
            <template #title>
              <div class="flex align-items-center justify-content-between">
                <div class="flex align-items-center">
                  <i class="pi pi-user-plus mr-2 text-primary"></i>
                  <span>Últimas Inscripciones</span>
                </div>
                <Button label="Ver todas" icon="pi pi-arrow-right" text @click="irAInscripciones" />
              </div>
            </template>
            <template #content>
              <DataTable :value="ultimasInscripciones" :loading="cargandoInscripciones" class="p-datatable-sm"
                :rows="5">
                <Column header="Estudiante">
                  <template #body="slotProps">
                    <div class="flex align-items-center">
                      <Avatar :label="getIniciales(slotProps.data.estudiante)" size="small" shape="circle"
                        class="mr-2" />
                      <div>
                        <div class="font-medium">{{ getNombreCompleto(slotProps.data.estudiante) }}</div>
                        <small class="text-500">{{ slotProps.data.estudiante?.ci }}</small>
                      </div>
                    </div>
                  </template>
                </Column>
                <Column header="Modalidad">
                  <template #body="slotProps">
                    <div class="font-medium">{{ slotProps.data.modalidad?.nombre }}</div>
                    <small class="text-500">Bs.{{ slotProps.data.modalidad?.precio_mensual }}/mes</small>
                  </template>
                </Column>
                <Column header="Estado" style="width: 100px">
                  <template #body="slotProps">
                    <Tag :value="slotProps.data.estado" :severity="getSeveridadEstado(slotProps.data.estado)" />
                  </template>
                </Column>
                <Column header="Fecha" style="width: 100px">
                  <template #body="slotProps">
                    <div class="text-sm">{{ formatFechaCorta(slotProps.data.created_at) }}</div>
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>
        </div>

        <!-- Últimos Pagos -->
        <div class="col-12 lg:col-6">
          <Card>
            <template #title>
              <div class="flex align-items-center justify-content-between">
                <div class="flex align-items-center">
                  <i class="pi pi-credit-card mr-2 text-primary"></i>
                  <span>Últimos Pagos</span>
                </div>
                <Button label="Ver todos" icon="pi pi-arrow-right" text @click="irAPagos" />
              </div>
            </template>
            <template #content>
              <DataTable :value="ultimosPagos" :loading="cargandoPagos" class="p-datatable-sm" :rows="5">
                <Column header="Estudiante">
                  <template #body="slotProps">
                    <div class="flex align-items-center">
                      <div>
                        <div class="font-medium">{{ getNombreEstudiante(slotProps.data) }}</div>
                        <small class="text-500">Inscripción #{{ slotProps.data.inscripcion_id }}</small>
                      </div>
                    </div>
                  </template>
                </Column>
                <Column header="Monto" style="width: 100px">
                  <template #body="slotProps">
                    <div class="text-right">
                      <div class="font-bold text-green-600">Bs.{{ formatMonto(slotProps.data.monto) }}</div>
                      <small class="text-500 capitalize">{{ slotProps.data.metodo_pago }}</small>
                    </div>
                  </template>
                </Column>
                <Column header="Fecha" style="width: 100px">
                  <template #body="slotProps">
                    <div class="text-sm">{{ formatFechaCorta(slotProps.data.fecha_pago) }}</div>
                  </template>
                </Column>
                <Column header="Estado" style="width: 100px">
                  <template #body="slotProps">
                    <Tag :value="slotProps.data.estado" :severity="getSeveridadEstadoPago(slotProps.data.estado)" />
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Resumen por modalidades -->
    <div class="dashboard-section">
      <Card>
        <template #title>
          <div class="flex align-items-center">
            <i class="pi pi-star mr-2 text-primary"></i>
            <span>Resumen por Modalidades</span>
          </div>
        </template>
        <template #content>
          <div class="grid">
            <div v-for="modalidad in resumenModalidades" :key="modalidad.id" class="col-12 md:col-6 lg:col-3">
              <div class="modalidad-card">
                <div class="flex justify-content-between align-items-center mb-2">
                  <div class="font-bold">{{ modalidad.nombre }}</div>
                  <Tag :value="modalidad.inscripciones" severity="info" />
                </div>
                <div class="text-500 mb-1">{{ modalidad.clases_mensuales }} clases/mes</div>
                <div class="text-green-600 font-bold mb-2">Bs.{{ formatMonto(modalidad.precio_mensual) }}</div>
                <ProgressBar :value="modalidad.porcentaje" :showValue="false" class="mb-2" />
                <small class="text-500">{{ modalidad.inscripciones }} inscripciones ({{ modalidad.porcentaje
                }}%)</small>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Alertas importantes -->
    <div class="dashboard-section" v-if="alertasImportantes.length > 0">
      <Card>
        <template #title>
          <div class="flex align-items-center">
            <i class="pi pi-bell mr-2 text-red-500"></i>
            <span>Alertas Importantes</span>
            <Badge :value="alertasImportantes.length" severity="danger" class="ml-2" />
          </div>
        </template>
        <template #content>
          <div class="grid">
            <div v-for="(alerta, index) in alertasImportantes" :key="index" class="col-12 md:col-6 lg:col-4">
              <div class="alerta-card" :class="getClaseAlerta(alerta.tipo)">
                <div class="flex align-items-center mb-2">
                  <i :class="getIconoAlerta(alerta.tipo) + ' mr-2'"></i>
                  <div class="font-bold">{{ alerta.titulo }}</div>
                </div>
                <div class="mb-2">{{ alerta.descripcion }}</div>
                <div class="flex justify-content-between">
                  <small class="text-500">{{ alerta.fecha }}</small>
                  <Button v-if="alerta.accion" :label="alerta.accion.texto" :icon="alerta.accion.icono"
                    class="p-button-sm" @click="ejecutarAccionAlerta(alerta)" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// Importar servicios
import inscripcionService from '@/services/inscripcion.service';
import pagoService from '@/services/pago.service';

// Importar componentes PrimeVue
import Card from 'primevue/card';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import ProgressBar from 'primevue/progressbar';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import Badge from 'primevue/badge';
import Chart from 'primevue/chart';
import ProgressSpinner from 'primevue/progressspinner';

const router = useRouter();
const toast = useToast();
const chartKey = ref(0);

// ========== ESTADOS PRINCIPALES ==========
const cargando = ref(false);
const cargandoInscripciones = ref(false);
const cargandoPagos = ref(false);
const cargandoGrafico = ref(false);
const ultimaActualizacion = ref(new Date().toLocaleString('es-ES'));

// ========== DATOS REALES ==========
const estadisticas = ref({
  // Inscripciones
  totalInscripciones: 0,
  inscripcionesActivas: 0,
  inscripcionesEnMora: 0,
  inscripcionesPorVencer: 0,

  // Pagos
  recaudacionTotal: 0,
  recaudacionMes: 0,
  pagosPendientes: 0,
  pagosVencidos: 0,
  pagosVencidosMonto: 0,
  promedioPago: 0,

  // Otros
  clasesHoy: 0,
  tasaRenovacion: 0,
  montoEnMora: 0,
  totalPagos: 0,
  pagosPagados: 0
});

// ========== DATOS PARA LISTAS ==========
const ultimasInscripciones = ref([]);
const ultimosPagos = ref([]);
const resumenModalidades = ref([]);
const alertasImportantes = ref([]);

// ========== CONFIGURACIÓN GRÁFICO ==========
const periodoGrafico = ref('6m');
const periodos = ref([
  { label: 'Últimos 3 meses', value: '3m' },
  { label: 'Últimos 6 meses', value: '6m' },
  { label: 'Último año', value: '1y' },
  { label: 'Todo el tiempo', value: 'all' }
]);

const chartDataRecaudacion = ref({
  labels: [],
  datasets: [
    {
      label: 'Recaudación (Bs.)',
      data: [],
      fill: true,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      borderWidth: 2
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `Bs. ${context.parsed.y.toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return `Bs. ${value.toLocaleString('es-ES')}`;
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    }
  }
});

// ========== FUNCIONES PRINCIPALES ==========
async function cargarDatos() {
  cargando.value = true;

  try {
    console.log('📊 Cargando datos del dashboard...');

    // Inicializar datos del gráfico primero
    inicializarDatosGrafico();
    
    // Cargar todos los datos
    await cargarEstadisticasGenerales();
    await cargarUltimasInscripciones();
    await cargarUltimosPagos();
    await cargarResumenModalidades();
    await cargarAlertasImportantes();
    
    // Cargar datos del gráfico al final
    await cargarDatosGrafico();

    ultimaActualizacion.value = new Date().toLocaleString('es-ES');

    toast.add({
      severity: 'success',
      summary: '✅ Datos actualizados',
      detail: 'Dashboard actualizado correctamente',
      life: 3000
    });

  } catch (error) {
    console.error('❌ Error cargando datos del dashboard:', error);

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar todos los datos del dashboard',
      life: 4000
    });
  } finally {
    cargando.value = false;
  }
}

// ========== FUNCIÓN NUEVA: Inicializar datos del gráfico ==========
function inicializarDatosGrafico() {
  chartDataRecaudacion.value = {
    labels: [],
    datasets: [
      {
        label: 'Recaudación (Bs.)',
        data: [],
        fill: true,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        borderWidth: 2
      }
    ]
  };
  chartKey.value++; // Forzar re-render del chart
}

async function cargarEstadisticasGenerales() {
  try {
    console.log('📊 CARGANDO ESTADÍSTICAS DEL SISTEMA...');
    
    const [responsePagos, responseInscripciones] = await Promise.all([
      pagoService.index(1, 1000),
      inscripcionService.index(1, 1000, '', {
        include: 'estudiante,modalidad'
      })
    ]);
    
    let datosPagos = [];
    if (responsePagos.data) {
      if (Array.isArray(responsePagos.data)) {
        datosPagos = responsePagos.data;
      } else if (responsePagos.data.data && Array.isArray(responsePagos.data.data)) {
        datosPagos = responsePagos.data.data;
      } else if (responsePagos.data.success && Array.isArray(responsePagos.data.data)) {
        datosPagos = responsePagos.data.data;
      }
    }
    
    let datosInscripciones = [];
    if (responseInscripciones.data) {
      if (Array.isArray(responseInscripciones.data)) {
        datosInscripciones = responseInscripciones.data;
      } else if (responseInscripciones.data.data && Array.isArray(responseInscripciones.data.data)) {
        datosInscripciones = responseInscripciones.data.data;
      } else if (responseInscripciones.data.success && Array.isArray(responseInscripciones.data.data)) {
        datosInscripciones = responseInscripciones.data.data;
      }
    }
    
    console.log(`✅ Cargados ${datosPagos.length} pagos y ${datosInscripciones.length} inscripciones`);
    
    // Procesar datos
    const inscripcionesMap = {};
    datosInscripciones.forEach(insc => {
      inscripcionesMap[insc.id] = insc;
    });
    
    const pagosProcesados = datosPagos.map(pago => {
      try {
        const inscripcion = inscripcionesMap[pago.inscripcion_id];
        
        let diasMora = 0;
        if ((pago.estado === 'pendiente' || pago.estado === 'vencido') && pago.fecha_vencimiento) {
          const fechaVencimiento = new Date(pago.fecha_vencimiento);
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          fechaVencimiento.setHours(0, 0, 0, 0);
          diasMora = Math.max(0, Math.floor((hoy - fechaVencimiento) / (1000 * 60 * 60 * 24)));
        }
        
        let estadoFinal = (pago.estado || 'pagado').toLowerCase();
        if (estadoFinal === 'pendiente' && diasMora > 0) {
          estadoFinal = 'vencido';
        }
        
        return {
          ...pago,
          monto: parseFloat(pago.monto || 0),
          inscripcion: inscripcion || {
            id: pago.inscripcion_id,
            estado: 'desconocido',
            monto_mensual: 0
          },
          dias_mora: diasMora,
          estado: estadoFinal
        };
      } catch (error) {
        console.error(`Error procesando pago ${pago.id}:`, error);
        return null;
      }
    }).filter(pago => pago !== null);
    
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);
    
    let totalRecaudado = 0;
    let pagosMes = 0;
    let totalPagos = pagosProcesados.length;
    let pagosPendientes = 0;
    let pagosVencidos = 0;
    let montoPendiente = 0;
    let montoVencido = 0;
    let montoEnMora = 0;
    let inscripcionesEnMora = 0;
    let totalDeudaMora = 0;
    
    pagosProcesados.forEach(pago => {
      const monto = parseFloat(pago.monto || 0);
      
      if (pago.estado === 'pagado') {
        totalRecaudado += monto;
        
        if (pago.fecha_pago) {
          const fechaPago = new Date(pago.fecha_pago);
          if (fechaPago >= primerDiaMes && fechaPago <= ultimoDiaMes) {
            pagosMes += monto;
          }
        }
      }
      
      if (pago.estado === 'pendiente') {
        pagosPendientes++;
        montoPendiente += monto;
      }
      
      if (pago.estado === 'vencido') {
        pagosVencidos++;
        montoVencido += monto;
        montoEnMora += monto;
      }
    });
    
    const deudaPorInscripcion = {};
    
    pagosProcesados.forEach(pago => {
      if (!deudaPorInscripcion[pago.inscripcion_id]) {
        deudaPorInscripcion[pago.inscripcion_id] = {
          monto_total: parseFloat(pago.inscripcion?.monto_mensual || 0),
          pagado: 0,
          pendiente: 0,
          vencido: 0
        };
      }
      
      const monto = parseFloat(pago.monto || 0);
      
      if (pago.estado === 'pagado') {
        deudaPorInscripcion[pago.inscripcion_id].pagado += monto;
      } else if (pago.estado === 'pendiente') {
        deudaPorInscripcion[pago.inscripcion_id].pendiente += monto;
      } else if (pago.estado === 'vencido') {
        deudaPorInscripcion[pago.inscripcion_id].vencido += monto;
      }
    });
    
    Object.entries(deudaPorInscripcion).forEach(([inscId, deuda]) => {
      const deudaReal = deuda.monto_total - deuda.pagado;
      if (deudaReal > 0) {
        totalDeudaMora += deudaReal;
        inscripcionesEnMora++;
      }
    });
    
    const inscripcionesActivas = datosInscripciones.filter(i => 
      (i.estado || '').toLowerCase() === 'activo'
    );
    
    const inscripcionesPorVencer = datosInscripciones.filter(insc => {
      if (!insc.fecha_fin || (insc.estado || '').toLowerCase() !== 'activo') return false;
      const fechaFin = new Date(insc.fecha_fin);
      const diasRestantes = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));
      return diasRestantes <= 7 && diasRestantes > 0;
    });
    
    estadisticas.value = {
      totalInscripciones: datosInscripciones.length,
      inscripcionesActivas: inscripcionesActivas.length,
      inscripcionesEnMora: inscripcionesEnMora,
      inscripcionesPorVencer: inscripcionesPorVencer.length,
      
      montoEnMora: totalDeudaMora,
      pagosVencidos: pagosVencidos,
      pagosVencidosMonto: montoVencido,
      
      recaudacionTotal: totalRecaudado,
      recaudacionMes: pagosMes,
      promedioPago: totalPagos > 0 ? totalRecaudado / totalPagos : 0,
      
      totalPagos: totalPagos,
      pagosPagados: pagosProcesados.filter(p => p.estado === 'pagado').length,
      pagosPendientes: pagosPendientes,
      
      clasesHoy: calcularClasesHoy(inscripcionesActivas),
      tasaRenovacion: Math.round((inscripcionesActivas.length / 
        Math.max(datosInscripciones.length, 1)) * 100)
    };
    
    console.log('✅ ESTADÍSTICAS FINALES DEL DASHBOARD:', estadisticas.value);
    
  } catch (error) {
    console.error('❌ ERROR cargando estadísticas:', error);
  }
}

async function cargarDatosGrafico() {
  cargandoGrafico.value = true;
  chartKey.value++; // Incrementar key para forzar re-render
  
  try {
    // 1. Obtener todos los pagos
    const response = await pagoService.index(1, 1000);
    let todosPagos = [];
    
    if (response.data) {
      if (Array.isArray(response.data)) {
        todosPagos = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        todosPagos = response.data.data;
      } else if (response.data.success && Array.isArray(response.data.data)) {
        todosPagos = response.data.data;
      }
    }
    
    console.log(`📊 ${todosPagos.length} pagos cargados para gráfico`);
    
    // 2. Filtrar solo pagos pagados
    const pagosPagados = todosPagos.filter(p => 
      (p.estado || '').toLowerCase() === 'pagado' && p.fecha_pago
    );
    
    // 3. Determinar el rango de fechas según el periodo seleccionado
    const hoy = new Date();
    let fechaInicio = new Date();
    
    switch (periodoGrafico.value) {
      case '3m':
        fechaInicio.setMonth(hoy.getMonth() - 3);
        break;
      case '1y':
        fechaInicio.setFullYear(hoy.getFullYear() - 1);
        break;
      case 'all':
        if (pagosPagados.length > 0) {
          const fechas = pagosPagados.map(p => new Date(p.fecha_pago));
          fechaInicio = new Date(Math.min(...fechas));
        } else {
          fechaInicio.setMonth(hoy.getMonth() - 6);
        }
        break;
      default: // '6m'
        fechaInicio.setMonth(hoy.getMonth() - 6);
    }
    
    // 4. Agrupar pagos por mes
    const datosPorMes = {};
    
    pagosPagados.forEach(pago => {
      const fechaPago = new Date(pago.fecha_pago);
      
      if (fechaPago >= fechaInicio && fechaPago <= hoy) {
        const año = fechaPago.getFullYear();
        const mes = fechaPago.getMonth();
        
        const clave = `${año}-${mes}`;
        
        if (!datosPorMes[clave]) {
          datosPorMes[clave] = {
            año: año,
            mes: mes,
            total: 0
          };
        }
        
        datosPorMes[clave].total += parseFloat(pago.monto || 0);
      }
    });
    
    // 5. Ordenar por fecha
    const mesesOrdenados = Object.values(datosPorMes)
      .sort((a, b) => {
        if (a.año !== b.año) return a.año - b.año;
        return a.mes - b.mes;
      });
    
    // 6. Preparar datos para el gráfico
    const labels = [];
    const datos = [];
    
    mesesOrdenados.forEach(item => {
      const fecha = new Date(item.año, item.mes, 1);
      const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'short' });
      const nombreMesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
      
      labels.push(`${nombreMesCapitalizado} ${item.año}`);
      datos.push(item.total);
    });
    
    // 7. Actualizar datos reactivamente
    if (labels.length === 0) {
      chartDataRecaudacion.value = {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Recaudación (Bs.)',
          data: [0],
          fill: true,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          borderWidth: 2
        }]
      };
    } else {
      chartDataRecaudacion.value = {
        labels: [...labels],
        datasets: [{
          label: 'Recaudación (Bs.)',
          data: [...datos],
          fill: true,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          borderWidth: 2
        }]
      };
    }
    
    // 8. IMPORTANTE: Esperar a que Vue actualice el DOM
    await nextTick();
    
    console.log(`✅ Gráfico con ${labels.length} meses de datos`);
    
  } catch (error) {
    console.error('❌ Error cargando datos del gráfico:', error);
    
    // Datos de fallback
    chartDataRecaudacion.value = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        label: 'Recaudación (Bs.)',
        data: [1500, 1800, 1200, 2100, 1900, 2200],
        fill: true,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        borderWidth: 2
      }]
    };
    
    await nextTick();
    
  } finally {
    cargandoGrafico.value = false;
  }
}

// ========== WATCHERS ==========
watch(periodoGrafico, async () => {
  await cargarDatosGrafico();
});

// Función simplificada para calcular clases hoy
function calcularClasesHoy(inscripciones) {
  try {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const diaHoy = diasSemana[diaSemana];

    let clasesHoy = 0;

    const inscripcionesActivas = inscripciones.filter(i => {
      const estado = (i.estado || '').toLowerCase().trim();
      return estado === 'activo';
    });

    inscripcionesActivas.forEach(inscripcion => {
      if (inscripcion.horarios && Array.isArray(inscripcion.horarios)) {
        inscripcion.horarios.forEach(horario => {
          if (horario.dia_semana) {
            const diaHorario = horario.dia_semana.toLowerCase();
            if (diaHorario.includes(diaHoy) || diaHoy.includes(diaHorario)) {
              clasesHoy++;
            }
          }
        });
      }
    });

    return clasesHoy;
  } catch (error) {
    console.error('Error calculando clases hoy:', error);
    return 0;
  }
}

async function cargarUltimasInscripciones() {
  cargandoInscripciones.value = true;
  try {
    const response = await inscripcionService.index(1, 5, '', {
      sort: 'created_at',
      order: 'desc',
      include: 'estudiante,modalidad'
    });

    let datos = [];

    if (response.data) {
      if (Array.isArray(response.data)) {
        datos = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        datos = response.data.data;
      } else if (response.data.success && Array.isArray(response.data.data)) {
        datos = response.data.data;
      }
    }

    ultimasInscripciones.value = datos.slice(0, 5);

  } catch (error) {
    console.error('Error cargando últimas inscripciones:', error);
    ultimasInscripciones.value = [];
  } finally {
    cargandoInscripciones.value = false;
  }
}

async function cargarUltimosPagos() {
  cargandoPagos.value = true;
  try {
    const response = await pagoService.index(1, 5, '', {
      sort: 'fecha_pago',
      order: 'desc'
    });

    let datos = [];

    if (response.data) {
      if (Array.isArray(response.data)) {
        datos = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        datos = response.data.data;
      } else if (response.data.success && Array.isArray(response.data.data)) {
        datos = response.data.data;
      }
    }

    ultimosPagos.value = datos.slice(0, 5);

  } catch (error) {
    console.error('Error cargando últimos pagos:', error);
    ultimosPagos.value = [];
  } finally {
    cargandoPagos.value = false;
  }
}

async function cargarResumenModalidades() {
  try {
    const response = await inscripcionService.index(1, 1000, '', {
      include: 'modalidad'
    });

    let datos = [];

    if (response.data) {
      if (Array.isArray(response.data)) {
        datos = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        datos = response.data.data;
      } else if (response.data.success && Array.isArray(response.data.data)) {
        datos = response.data.data;
      }
    }

    const modalidadesMap = new Map();

    datos.forEach(inscripcion => {
      const modalidad = inscripcion.modalidad;
      if (!modalidad) return;

      if (!modalidadesMap.has(modalidad.id)) {
        modalidadesMap.set(modalidad.id, {
          id: modalidad.id,
          nombre: modalidad.nombre,
          precio_mensual: modalidad.precio_mensual || 0,
          clases_mensuales: modalidad.clases_mensuales || 12,
          inscripciones: 0
        });
      }

      const modalidadData = modalidadesMap.get(modalidad.id);
      modalidadData.inscripciones++;
    });

    const totalInscripciones = datos.length;
    resumenModalidades.value = Array.from(modalidadesMap.values()).map(modalidad => ({
      ...modalidad,
      porcentaje: totalInscripciones > 0 ?
        Math.round((modalidad.inscripciones / totalInscripciones) * 100) : 0
    })).slice(0, 4);

  } catch (error) {
    console.error('❌ Error cargando resumen de modalidades:', error);
    resumenModalidades.value = [];
  }
}

async function cargarAlertasImportantes() {
  try {
    const hoy = new Date();

    const responsePagos = await pagoService.index(1, 50, '', {
      estado: 'pendiente'
    });

    let pagosPendientes = [];
    if (responsePagos.data) {
      if (Array.isArray(responsePagos.data)) {
        pagosPendientes = responsePagos.data;
      } else if (responsePagos.data.data && Array.isArray(responsePagos.data.data)) {
        pagosPendientes = responsePagos.data.data;
      }
    }

    const pagosVencidos = pagosPendientes.filter(pago => {
      if (!pago.fecha_vencimiento) return false;
      const fechaVencimiento = new Date(pago.fecha_vencimiento);
      return fechaVencimiento < hoy;
    });

    const responseInscripciones = await inscripcionService.index(1, 50, '', {
      estado: 'activo'
    });

    let inscripcionesActivas = [];
    if (responseInscripciones.data) {
      if (Array.isArray(responseInscripciones.data)) {
        inscripcionesActivas = responseInscripciones.data;
      } else if (responseInscripciones.data.data && Array.isArray(responseInscripciones.data.data)) {
        inscripcionesActivas = responseInscripciones.data.data;
      }
    }

    const inscripcionesPorVencer = inscripcionesActivas.filter(insc => {
      if (!insc.fecha_fin) return false;
      const fechaFin = new Date(insc.fecha_fin);
      const diffDias = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));
      return diffDias <= 3 && diffDias >= 0;
    });

    alertasImportantes.value = [];

    if (pagosVencidos.length > 0) {
      alertasImportantes.value.push({
        tipo: 'pago_vencido',
        titulo: `${pagosVencidos.length} Pago(s) Vencido(s)`,
        descripcion: `Hay ${pagosVencidos.length} pagos que han vencido y necesitan atención`,
        fecha: 'Urgente',
        accion: {
          texto: 'Ver pagos',
          icono: 'pi pi-credit-card',
          ruta: '/admin/historialpagos'
        }
      });
    }

    if (inscripcionesPorVencer.length > 0) {
      alertasImportantes.value.push({
        tipo: 'inscripcion_por_vencer',
        titulo: `${inscripcionesPorVencer.length} Inscripción(es) por Vencer`,
        descripcion: `${inscripcionesPorVencer.length} inscripciones vencen en los próximos 3 días`,
        fecha: 'Próximamente',
        accion: {
          texto: 'Renovar',
          icono: 'pi pi-refresh',
          ruta: '/admin/inscripciones'
        }
      });
    }

    if (estadisticas.value.inscripcionesEnMora > 5) {
      alertasImportantes.value.push({
        tipo: 'mora_alta',
        titulo: 'Alta Morosidad',
        descripcion: `${estadisticas.value.inscripcionesEnMora} inscripciones están en mora`,
        fecha: 'Requiere acción',
        accion: {
          texto: 'Gestionar',
          icono: 'pi pi-exclamation-triangle',
          ruta: '/admin/inscripciones?estado=en_mora'
        }
      });
    }

  } catch (error) {
    console.error('Error cargando alertas:', error);
    alertasImportantes.value = [];
  }
}

// ========== FUNCIONES AUXILIARES ==========
function calcularProgresoPromedio() {
  const max = 500;
  return Math.min(100, (estadisticas.value.promedioPago / max) * 100);
}

function calcularProgresoClases() {
  const max = 50;
  return Math.min(100, (estadisticas.value.clasesHoy / max) * 100);
}

function calcularProgresoVencimientos() {
  const max = 20;
  return Math.min(100, (estadisticas.value.inscripcionesPorVencer / max) * 100);
}

function getColorTasaRenovacion() {
  if (estadisticas.value.tasaRenovacion >= 80) return 'text-green-600';
  if (estadisticas.value.tasaRenovacion >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function getClaseProgressBarRenovacion() {
  if (estadisticas.value.tasaRenovacion >= 80) return 'bg-green-100';
  if (estadisticas.value.tasaRenovacion >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
}

function getIniciales(estudiante) {
  if (!estudiante) return '?';
  const nombres = (estudiante.nombres || '').split(' ');
  const apellidos = (estudiante.apellidos || '').split(' ');

  const inicialNombre = nombres[0] ? nombres[0][0] : '';
  const inicialApellido = apellidos[0] ? apellidos[0][0] : '';

  if (!inicialNombre && !inicialApellido) {
    if (estudiante.id) {
      return String(estudiante.id).slice(-2);
    }
    return '??';
  }

  return (inicialNombre + inicialApellido).toUpperCase();
}

function getNombreCompleto(estudiante) {
  if (!estudiante) return 'Desconocido';
  return `${estudiante.nombres || ''} ${estudiante.apellidos || ''}`.trim() || 'Desconocido';
}

function getNombreEstudiante(pago) {
  return `Estudiante #${pago.estudiante_id || pago.inscripcion_id}`;
}

function getSeveridadEstado(estado) {
  switch (estado?.toLowerCase()) {
    case 'activo': return 'success';
    case 'en_mora': return 'danger';
    case 'pendiente': return 'warning';
    case 'vencido': return 'danger';
    case 'suspendido': return 'secondary';
    default: return 'info';
  }
}

function getSeveridadEstadoPago(estado) {
  switch (estado?.toLowerCase()) {
    case 'pagado': return 'success';
    case 'pendiente': return 'warning';
    case 'vencido': return 'danger';
    default: return 'info';
  }
}

function getClaseAlerta(tipo) {
  switch (tipo) {
    case 'pago_vencido': return 'alerta-pago-vencido';
    case 'inscripcion_por_vencer': return 'alerta-inscripcion-vencer';
    case 'mora_alta': return 'alerta-mora-alta';
    default: return 'alerta-info';
  }
}

function getIconoAlerta(tipo) {
  switch (tipo) {
    case 'pago_vencido': return 'pi pi-exclamation-triangle text-red-500';
    case 'inscripcion_por_vencer': return 'pi pi-calendar-times text-orange-500';
    case 'mora_alta': return 'pi pi-money-bill text-red-500';
    default: return 'pi pi-info-circle text-blue-500';
  }
}

function ejecutarAccionAlerta(alerta) {
  if (alerta.accion && alerta.accion.ruta) {
    router.push(alerta.accion.ruta);
  }
}

function formatMonto(monto) {
  if (!monto && monto !== 0) return '0.00';
  return parseFloat(monto).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatFechaCorta(fecha) {
  if (!fecha) return '--';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit'
  });
}

function irAInscripciones() {
  router.push('/admin/inscripciones');
}

function irAPagos() {
  router.push('/admin/historialpagos');
}

// ========== INICIALIZACIÓN ==========
onMounted(() => {
  // Inicializar datos del gráfico primero
  inicializarDatosGrafico();
  
  // Pequeño delay para asegurar que Chart.js esté listo
  setTimeout(() => {
    cargarDatos();
  }, 100);
  
  setInterval(() => {
    if (!cargando.value) {
      cargarDatos();
    }
  }, 5 * 60 * 1000);
});
</script>

<style scoped>
.dashboard-container {
  padding: 1.5rem;
  max-width: 1800px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border-left: 5px solid #3b82f6;
}

.dashboard-header h1 {
  margin: 0;
  color: #1f2937;
  font-size: 1.8rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

/* Tarjetas mejoradas */
.stat-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
  height: 100%;
  background: white;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--card-gradient));
}

.stat-card:nth-child(1) { --card-gradient: #3b82f6, #60a5fa; }
.stat-card:nth-child(2) { --card-gradient: #10b981, #34d399; }
.stat-card:nth-child(3) { --card-gradient: #f59e0b, #fbbf24; }
.stat-card:nth-child(4) { --card-gradient: #8b5cf6, #a78bfa; }

.card-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Paneles de estado */
.panel-estado {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.panel-header {
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 1.1rem;
}

.panel-content {
  padding: 1rem;
}

.estado-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.estado-item:last-child {
  border-bottom: none;
}

.estado-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.estado-icon i {
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-actions {
    align-items: center;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
}
</style>