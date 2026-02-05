<template>
  <div class="dashboard-container">
    <!-- Header Principal -->
    <div class="dashboard-header">
      <div class="flex align-items-center">
        <i class="pi pi-chart-bar text-primary text-3xl mr-3"></i>
        <div>
          <h1>Dashboard de Gestión Completo</h1>
          <p class="text-500 m-0">Control total del sistema - Estudiantes, Pagos y Reembolsos</p>
        </div>
      </div>
      <div class="header-actions">
        <Button label="Actualizar Todo" icon="pi pi-refresh" severity="info" 
                @click="cargarTodosDatos" :loading="cargandoTodo" />
        <span class="text-500 text-sm">Última actualización: {{ ultimaActualizacion }}</span>
      </div>
    </div>

 

    <!-- TARJETAS PRINCIPALES UNIFICADAS -->
    <div class="dashboard-cards">
      <div class="grid">
        
        <!-- Tarjeta 1: ESTUDIANTES ACTIVOS -->
        <div class="col-12 md:col-6 lg:col-3" :class="{'highlight-card': vistaActiva === 'estudiantes'}">
          <Card class="stat-card student-card">
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
                <div class="flex justify-content-between align-items-center mb-2">
                  <small class="text-500">Total inscritos</small>
                  <small class="font-bold">{{ estadisticas.totalInscripciones }}</small>
                </div>
                <div class="flex justify-content-between align-items-center">
                  <small class="text-500">Tasa renovación</small>
                  <small class="font-bold" :class="getColorTasa(estadisticas.tasaRenovacion)">
                    {{ estadisticas.tasaRenovacion }}%
                  </small>
                </div>
                <Divider />
                <Button label="Ver Estudiantes" icon="pi pi-users" 
                        class="p-button-sm w-full p-button-outlined" 
                        @click="irAEstudiantes" />
              </div>
            </template>
          </Card>
        </div>

        <!-- Tarjeta 2: FINANZAS -->
        <div class="col-12 md:col-6 lg:col-3" :class="{'highlight-card': vistaActiva === 'finanzas'}">
          <Card class="stat-card finance-card">
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
                <div class="flex justify-content-between mb-1">
                  <small class="text-500">Este mes</small>
                  <small class="font-bold text-green-600">Bs.{{ formatMonto(estadisticas.recaudacionMes) }}</small>
                </div>
                <div class="flex justify-content-between mb-1">
                  <small class="text-500">Promedio/pago</small>
                  <small class="font-bold">Bs.{{ formatMonto(estadisticas.promedioPago) }}</small>
                </div>
                <div class="flex justify-content-between">
                  <small class="text-500">Ganancias netas</small>
                  <small class="font-bold text-blue-600">Bs.{{ formatMonto(estadisticas.gananciasNetas) }}</small>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Tarjeta 3: SITUACIÓN DE PAGOS -->
        <div class="col-12 md:col-6 lg:col-3" :class="{'highlight-card': vistaActiva === 'pagos'}">
          <Card class="stat-card payment-card">
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
                <div class="flex justify-content-between mb-1">
                  <small class="text-500">Monto en mora</small>
                  <small class="font-bold text-red-600">Bs.{{ formatMonto(estadisticas.montoEnMora) }}</small>
                </div>
                <div class="flex justify-content-between mb-1">
                  <small class="text-500">Por vencer (7 días)</small>
                  <small class="font-bold">{{ estadisticas.inscripcionesPorVencer }}</small>
                </div>
                <div class="flex justify-content-between">
                  <small class="text-500">Pagos pendientes</small>
                  <small class="font-bold">{{ estadisticas.pagosPendientes }}</small>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Tarjeta 4: REEMBOLSOS -->
        <div class="col-12 md:col-6 lg:col-3" :class="{'highlight-card': vistaActiva === 'reembolsos'}">
          <Card class="stat-card refund-card">
            <template #title>
              <div class="flex align-items-center">
                <div class="card-icon bg-red-100 text-red-600 p-2 rounded-circle mr-2">
                  <i class="pi pi-money-bill-wave"></i>
                </div>
                <div>
                  <div class="text-sm text-500">Reembolsos Pendientes</div>
                  <div class="font-bold text-red-600">{{ estadisticas.reembolsosPendientes }}</div>
                </div>
              </div>
            </template>
            <template #content>
              <div class="mt-2">
                <div class="flex justify-content-between mb-1">
                  <small class="text-500">Monto total</small>
                  <small class="font-bold">Bs.{{ formatMonto(estadisticas.totalReembolsos) }}</small>
                </div>
                <div class="flex justify-content-between mb-1">
                  <small class="text-500">Aprobados</small>
                  <small class="font-bold text-green-600">{{ estadisticas.reembolsosAprobados }}</small>
                </div>
                <div class="flex justify-content-between">
                  <small class="text-500">Monto este mes</small>
                  <small class="font-bold">Bs.{{ formatMonto(estadisticas.reembolsosMes) }}</small>
                </div>
                <Divider />
                <Button label="Gestionar Reembolsos" icon="pi pi-arrow-right" 
                        severity="danger" class="p-button-sm w-full" 
                        @click="irAReembolsos" />
              </div>
            </template>
          </Card>
        </div>

      </div>
    </div>

    <!-- VISIÓN GENERAL EN TIEMPO REAL -->
    <div class="dashboard-section">
      <Card>
        <template #title>
          <div class="flex align-items-center justify-content-between">
            <div class="flex align-items-center">
              <i class="pi pi-eye text-primary mr-2"></i>
              <span>Visión General en Tiempo Real</span>
            </div>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-circle-fill text-green-500"></i>
              <small class="text-500">En línea</small>
              <i class="pi pi-clock ml-3"></i>
              <small class="text-500">{{ horaActual }}</small>
            </div>
          </div>
        </template>
        <template #content>
          <div class="grid">
            
            <!-- Actividad Hoy -->
            <div class="col-12 md:col-6 lg:col-4">
              <div class="real-time-card">
                <div class="real-time-header">
                  <i class="pi pi-calendar text-blue-500"></i>
                  <span class="font-bold ml-2">Actividad Hoy</span>
                </div>
                <div class="real-time-content">
                  <div class="real-time-item">
                    <i class="pi pi-users text-500"></i>
                    <div>
                      <div class="text-sm text-500">Clases programadas</div>
                      <div class="font-bold text-xl">{{ estadisticas.clasesHoy }}</div>
                    </div>
                  </div>
                  <div class="real-time-item">
                    <i class="pi pi-credit-card text-500"></i>
                    <div>
                      <div class="text-sm text-500">Pagos registrados</div>
                      <div class="font-bold text-xl">{{ estadisticas.pagosHoy }}</div>
                    </div>
                  </div>
                  <div class="real-time-item">
                    <i class="pi pi-user-plus text-500"></i>
                    <div>
                      <div class="text-sm text-500">Nuevos estudiantes</div>
                      <div class="font-bold text-xl">{{ estadisticas.nuevosEstudiantesHoy }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Finanzas Rápidas -->
            <div class="col-12 md:col-6 lg:col-4">
              <div class="real-time-card">
                <div class="real-time-header">
                  <i class="pi pi-wallet text-green-500"></i>
                  <span class="font-bold ml-2">Finanzas Rápidas</span>
                </div>
                <div class="real-time-content">
                  <div class="real-time-item">
                    <i class="pi pi-arrow-up-right text-green-500"></i>
                    <div>
                      <div class="text-sm text-500">Ingresos hoy</div>
                      <div class="font-bold text-xl text-green-600">Bs.{{ formatMonto(estadisticas.ingresosHoy) }}</div>
                    </div>
                  </div>
                  <div class="real-time-item">
                    <i class="pi pi-arrow-down-left text-red-500"></i>
                    <div>
                      <div class="text-sm text-500">Reembolsos hoy</div>
                      <div class="font-bold text-xl text-red-600">Bs.{{ formatMonto(estadisticas.reembolsosHoy) }}</div>
                    </div>
                  </div>
                  <div class="real-time-item">
                    <i class="pi pi-chart-line text-blue-500"></i>
                    <div>
                      <div class="text-sm text-500">Balance diario</div>
                      <div class="font-bold text-xl" :class="getColorBalance(estadisticas.balanceDiario)">
                        Bs.{{ formatMonto(estadisticas.balanceDiario) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Estado Reembolsos -->
            <div class="col-12 md:col-6 lg:col-4">
              <div class="real-time-card">
                <div class="real-time-header">
                  <i class="pi pi-sync text-red-500"></i>
                  <span class="font-bold ml-2">Estado Reembolsos</span>
                </div>
                <div class="real-time-content">
                  <div class="real-time-item">
                    <Tag value="Pendientes" severity="warning" class="w-full justify-content-center mb-1" />
                    <div class="text-center">
                      <div class="font-bold text-2xl">{{ estadisticas.reembolsosPendientes }}</div>
                      <small class="text-500">por revisar</small>
                    </div>
                  </div>
                  <div class="real-time-item">
                    <Tag value="En proceso" severity="info" class="w-full justify-content-center mb-1" />
                    <div class="text-center">
                      <div class="font-bold text-2xl">{{ estadisticas.reembolsosProceso }}</div>
                      <small class="text-500">aprobados</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

           

          </div>
        </template>
      </Card>
    </div>

    <!-- GRÁFICOS Y ANÁLISIS -->
    <div class="dashboard-section">
      <div class="grid">
        <!-- Gráfico de Recaudación vs Reembolsos -->
        <div class="col-12 lg:col-8">
          <Card>
            <template #title>
              <div class="flex align-items-center justify-content-between">
                <div class="flex align-items-center">
                  <i class="pi pi-chart-line mr-2 text-primary"></i>
                  <span>Recaudación vs Reembolsos</span>
                </div>
                <Dropdown v-model="periodoGrafico" :options="periodos" 
                          optionLabel="label" optionValue="value" class="w-15rem" />
              </div>
            </template>
            <template #content>
              <div v-if="cargandoGrafico" class="text-center p-5">
                <ProgressSpinner style="width: 50px; height: 50px" />
                <p class="text-500 mt-3">Cargando gráfico...</p>
              </div>
              <Chart v-else :type="'line'" :data="chartDataComparativo" 
                    :options="chartOptionsComparativo" :height="250" />
            </template>
          </Card>
        </div>

        <!-- Distribución de Reembolsos -->
        <div class="col-12 lg:col-4">
          <Card>
            <template #title>
              <div class="flex align-items-center">
                <i class="pi pi-chart-pie mr-2 text-primary"></i>
                <span>Distribución Reembolsos</span>
              </div>
            </template>
            <template #content>
              <Chart type="pie" :data="chartDataReembolsos" :options="chartOptionsPie" :height="250" />
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- TABLAS DINÁMICAS -->
    <div class="dashboard-section">
      <div class="grid">
        
        <!-- Últimos Reembolsos -->
        <div class="col-12 lg:col-6" v-if="vistaActiva === 'reembolsos' || vistaActiva === 'todo'">
          <Card>
            <template #title>
              <div class="flex align-items-center justify-content-between">
                <div class="flex align-items-center">
                  <i class="pi pi-money-bill-wave text-red-500 mr-2"></i>
                  <span>Últimos Reembolsos</span>
                  <Tag :value="ultimosReembolsos.length" severity="danger" class="ml-2" />
                </div>
                <Button label="Ver Todos" icon="pi pi-arrow-right" text @click="irAReembolsos" />
              </div>
            </template>
            <template #content>
              <DataTable :value="ultimosReembolsos" :rows="5" class="p-datatable-sm" stripedRows>
                <Column header="ID" style="width: 70px">
                  <template #body="{ data }">
                    <div class="font-mono">#{{ data.id }}</div>
                  </template>
                </Column>
                <Column header="Estudiante">
                  <template #body="{ data }">
                    <div class="flex align-items-center">
                      <Avatar :label="getIniciales(data.estudiante)" size="small" class="mr-2" />
                      <div>
                        <div class="font-medium">{{ getNombreCompleto(data.estudiante) }}</div>
                        <small class="text-500">CI: {{ data.estudiante?.ci }}</small>
                      </div>
                    </div>
                  </template>
                </Column>
                <Column header="Monto" style="width: 100px">
                  <template #body="{ data }">
                    <div class="text-right font-bold text-red-600">
                      Bs.{{ formatMonto(data.monto_reembolsado) }}
                    </div>
                  </template>
                </Column>
                <Column header="Estado" style="width: 100px">
                  <template #body="{ data }">
                    <Tag :value="data.estado" :severity="getSeveridadEstado(data.estado)" />
                  </template>
                </Column>
                <Column header="Acciones" style="width: 80px">
                  <template #body="{ data }">
                    <Button icon="pi pi-eye" class="p-button-text p-button-sm" 
                            @click="verDetalleReembolso(data)" />
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>
        </div>

        <!-- Últimos Pagos -->
        <div class="col-12 lg:col-6" v-if="vistaActiva === 'pagos' || vistaActiva === 'todo'">
          <Card>
            <template #title>
              <div class="flex align-items-center justify-content-between">
                <div class="flex align-items-center">
                  <i class="pi pi-credit-card text-green-500 mr-2"></i>
                  <span>Últimos Pagos</span>
                  <Tag :value="ultimosPagos.length" severity="success" class="ml-2" />
                </div>
                <Button label="Ver Todos" icon="pi pi-arrow-right" text @click="irAPagos" />
              </div>
            </template>
            <template #content>
              <DataTable :value="ultimosPagos" :rows="5" class="p-datatable-sm" stripedRows>
                <Column header="Estudiante">
                  <template #body="{ data }">
                    <div class="font-medium">{{ getNombreEstudiante(data) }}</div>
                  </template>
                </Column>
                <Column header="Monto" style="width: 100px">
                  <template #body="{ data }">
                    <div class="text-right font-bold text-green-600">
                      Bs.{{ formatMonto(data.monto) }}
                    </div>
                  </template>
                </Column>
                <Column header="Estado" style="width: 100px">
                  <template #body="{ data }">
                    <Tag :value="data.estado" :severity="getSeveridadEstadoPago(data.estado)" />
                  </template>
                </Column>
                <Column header="Fecha" style="width: 100px">
                  <template #body="{ data }">
                    <div class="text-sm">{{ formatFechaCorta(data.fecha_pago) }}</div>
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>
        </div>

        <!-- Inscripciones Recientes -->
        <div class="col-12 lg:col-6" v-if="vistaActiva === 'estudiantes' || vistaActiva === 'todo'">
          <Card>
            <template #title>
              <div class="flex align-items-center justify-content-between">
                <div class="flex align-items-center">
                  <i class="pi pi-user-plus text-blue-500 mr-2"></i>
                  <span>Inscripciones Recientes</span>
                </div>
                <Button label="Ver Todas" icon="pi pi-arrow-right" text @click="irAInscripciones" />
              </div>
            </template>
            <template #content>
              <DataTable :value="ultimasInscripciones" :rows="5" class="p-datatable-sm" stripedRows>
                <Column header="Estudiante">
                  <template #body="{ data }">
                    <div class="flex align-items-center">
                      <Avatar :label="getIniciales(data.estudiante)" size="small" class="mr-2" />
                      <div class="font-medium">{{ getNombreCompleto(data.estudiante) }}</div>
                    </div>
                  </template>
                </Column>
                <Column header="Modalidad">
                  <template #body="{ data }">
                    <div class="font-medium">{{ data.modalidad?.nombre }}</div>
                  </template>
                </Column>
                <Column header="Estado" style="width: 100px">
                  <template #body="{ data }">
                    <Tag :value="data.estado" :severity="getSeveridadEstado(data.estado)" />
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>
        </div>

      </div>
    </div>

    <!-- RESUMEN FINANCIERO DETALLADO -->
    <div class="dashboard-section">
      <Card>
        <template #title>
          <div class="flex align-items-center">
            <i class="pi pi-calculator text-primary mr-2"></i>
            <span>Resumen Financiero Detallado</span>
          </div>
        </template>
        <template #content>
          <div class="grid">
            <div class="col-12 md:col-6 lg:col-3">
              <div class="financial-summary-card">
                <div class="financial-header">
                  <i class="pi pi-arrow-up-right text-green-500"></i>
                  <span>Ingresos Totales</span>
                </div>
                <div class="financial-value text-green-600">
                  Bs.{{ formatMonto(estadisticas.recaudacionTotal) }}
                </div>
                <div class="financial-detail">
                  <span>Este mes: Bs.{{ formatMonto(estadisticas.recaudacionMes) }}</span>
                </div>
              </div>
            </div>
            <div class="col-12 md:col-6 lg:col-3">
              <div class="financial-summary-card">
                <div class="financial-header">
                  <i class="pi pi-arrow-down-left text-red-500"></i>
                  <span>Reembolsos Totales</span>
                </div>
                <div class="financial-value text-red-600">
                  Bs.{{ formatMonto(estadisticas.totalReembolsos) }}
                </div>
                <div class="financial-detail">
                  <span>Este mes: Bs.{{ formatMonto(estadisticas.reembolsosMes) }}</span>
                </div>
              </div>
            </div>
            <div class="col-12 md:col-6 lg:col-3">
              <div class="financial-summary-card">
                <div class="financial-header">
                  <i class="pi pi-chart-line text-blue-500"></i>
                  <span>Ganancias Netas</span>
                </div>
                <div class="financial-value text-blue-600">
                  Bs.{{ formatMonto(estadisticas.gananciasNetas) }}
                </div>
                <div class="financial-detail">
                  <span>Margen: {{ calcularMargen() }}%</span>
                </div>
              </div>
            </div>
            <div class="col-12 md:col-6 lg:col-3">
              <div class="financial-summary-card">
                <div class="financial-header">
                  <i class="pi pi-exclamation-triangle text-orange-500"></i>
                  <span>Deuda Pendiente</span>
                </div>
                <div class="financial-value text-orange-600">
                  Bs.{{ formatMonto(estadisticas.montoEnMora) }}
                </div>
                <div class="financial-detail">
                  <span>{{ estadisticas.inscripcionesEnMora }} inscripciones</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    
    
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

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// Importar servicios
import inscripcionService from '@/services/inscripcion.service';
import pagoService from '@/services/pago.service';
import reembolsoService from '@/services/reembolso.service';
import estudianteService from '@/services/estudiante.service';

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
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import MultiSelect from 'primevue/multiselect';
import Toast from 'primevue/toast';

const router = useRouter();
const toast = useToast();

// ========== ESTADOS PRINCIPALES ==========
const cargandoTodo = ref(false);
const cargandoGrafico = ref(false);
const ultimaActualizacion = ref(new Date().toLocaleString('es-ES'));
const horaActual = ref('');

// ========== FILTROS ==========
const vistaActiva = ref('todo');
const busquedaGlobal = ref('');
const mostrarFiltrosAvanzados = ref(false);
const filtroFechaDesde = ref(null);
const filtroFechaHasta = ref(null);
const filtroEstados = ref([]);
const resumenModalidades = ref([]);

const opcionesEstados = ref([
  { label: 'Activo', value: 'activo' },
  { label: 'En mora', value: 'en_mora' },
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Aprobado', value: 'aprobado' },
  { label: 'Rechazado', value: 'rechazado' },
  { label: 'Completado', value: 'completado' }
]);

// ========== ESTADÍSTICAS COMPLETAS ==========
const estadisticas = ref({
  // Estudiantes
  totalInscripciones: 0,
  inscripcionesActivas: 0,
  inscripcionesEnMora: 0,
  inscripcionesPorVencer: 0,
  tasaRenovacion: 0,
  
  // Finanzas
  recaudacionTotal: 0,
  recaudacionMes: 0,
  promedioPago: 0,
  montoEnMora: 0,
  gananciasNetas: 0,
  
  // Pagos
  pagosPendientes: 0,
  pagosVencidos: 0,
  totalPagos: 0,
  pagosPagados: 0,
  
  // Reembolsos
  reembolsosPendientes: 0,
  reembolsosAprobados: 0,
  totalReembolsos: 0,
  reembolsosMes: 0,
  reembolsosProceso: 0,
  
  // Tiempo real
  clasesHoy: 0,
  pagosHoy: 0,
  nuevosEstudiantesHoy: 0,
  ingresosHoy: 0,
  reembolsosHoy: 0,
  balanceDiario: 0
});

// ========== DATOS ==========
const ultimosReembolsos = ref([]);
const ultimosPagos = ref([]);
const ultimasInscripciones = ref([]);
const alertasUrgentes = ref([]);

// ========== GRÁFICOS ==========
const periodoGrafico = ref('6m');
const periodos = ref([
  { label: 'Últimos 3 meses', value: '3m' },
  { label: 'Últimos 6 meses', value: '6m' },
  { label: 'Último año', value: '1y' }
]);

const chartDataComparativo = ref({});
const chartOptionsComparativo = ref({});
const chartDataReembolsos = ref({});
const chartOptionsPie = ref({});

// ========== FUNCIONES PRINCIPALES CORREGIDAS ==========
async function cargarTodosDatos() {
  cargandoTodo.value = true;
  
  try {
    console.log('🔄 Cargando todos los datos del dashboard...');
    
    // Cargar en paralelo pero con el formato correcto para cada servicio
    await Promise.all([
      cargarEstadisticasCompletas(),
      cargarUltimosReembolsos(),
      cargarUltimosPagos(),
      cargarUltimasInscripciones(),
      cargarAlertasUrgentes(),
      cargarDatosGraficos(),
      cargarResumenModalidades()
    ]);
    
    ultimaActualizacion.value = new Date().toLocaleString('es-ES');
    actualizarHora();
    
    toast.add({
      severity: 'success',
      summary: '✅ Datos actualizados',
      detail: 'Dashboard completo cargado correctamente',
      life: 3000
    });
    
  } catch (error) {
    console.error('❌ Error cargando datos:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar datos completos',
      life: 4000
    });
  } finally {
    cargandoTodo.value = false;
  }
}

// ========== FUNCIONES DE CARGA INDIVIDUALES ==========

// 1. CARGAR ÚLTIMOS REEMBOLSOS (CORREGIDO)
async function cargarUltimosReembolsos() {
  try {
    console.log('🔄 Cargando últimos reembolsos...');
    
    // FORMA CORRECTA para reembolsoService
    const response = await reembolsoService.index(1, 5, {
      sort: 'created_at',
      order: 'desc'
    });
    
    console.log('📊 Respuesta reembolsos:', response);
    
    // Extraer datos
    ultimosReembolsos.value = extraerDatos(response);
    
    console.log('✅ Reembolsos procesados:', ultimosReembolsos.value.length, 'registros');
    
  } catch (error) {
    console.error('❌ Error cargando últimos reembolsos:', error);
    
    // Datos de ejemplo para desarrollo
    if (import.meta.env.DEV) {
      console.log('⚠️ Usando datos de ejemplo para desarrollo');
      ultimosReembolsos.value = [
        {
          id: 4,
          estudiante_id: 12,
          estudiante: {
            id: 12,
            nombres: "Juan",
            apellidos: "Pérez",
            ci: "1234567"
          },
          monto_reembolsado: 240.00,
          porcentaje_reembolso: 100,
          tipo: 'total',
          metodo: 'efectivo',
          estado: 'aprobado',
          motivo: 'devolución',
          fecha_solicitud: '2026-02-04 21:37:02'
        }
      ];
    } else {
      ultimosReembolsos.value = [];
    }
  }
}

// 2. CARGAR ÚLTIMOS PAGOS (CORREGIDO)
async function cargarUltimosPagos() {
  try {
    console.log('🔄 Cargando últimos pagos...');
    
    // FORMA CORRECTA para pagoService
    const response = await pagoService.index(1, 5, {
      sort: 'created_at',
      order: 'desc'
    });
    
    console.log('📊 Respuesta pagos:', response);
    
    ultimosPagos.value = extraerDatos(response);
    
    console.log('✅ Pagos procesados:', ultimosPagos.value.length, 'registros');
    
  } catch (error) {
    console.error('❌ Error cargando últimos pagos:', error);
    ultimosPagos.value = [];
  }
}

// 3. CARGAR ÚLTIMAS INSCRIPCIONES (YA ESTABA BIEN)
async function cargarUltimasInscripciones() {
  try {
    console.log('🔄 Cargando últimas inscripciones...');
    
    // FORMA CORRECTA para inscripcionService
    const response = await inscripcionService.index(1, 5, '');
    
    console.log('📊 Respuesta inscripciones:', response);
    
    ultimasInscripciones.value = extraerDatos(response);
    
    console.log('✅ Inscripciones procesadas:', ultimasInscripciones.value.length, 'registros');
    
  } catch (error) {
    console.error('❌ Error cargando últimas inscripciones:', error);
    ultimasInscripciones.value = [];
  }
}

// 4. CARGAR ESTADÍSTICAS COMPLETAS (CORREGIDO)
async function cargarEstadisticasCompletas() {
  try {
    console.log('📊 Cargando estadísticas completas...');
    
    // Cargar todos los datos necesarios - cada uno con su formato correcto
    const [pagosPromise, inscripcionesPromise, reembolsosPromise] = await Promise.allSettled([
      // Pagos: (page, limit, filtros)
      pagoService.index(1, 1000, {}),
      
      // Inscripciones: (page, limit, q)
      inscripcionService.index(1, 1000, ''),
      
      // Reembolsos: (page, per_page, filtros)
      reembolsoService.index(1, 1000, {})
    ]);
    
    // Procesar pagos
    let datosPagos = [];
    if (pagosPromise.status === 'fulfilled') {
      datosPagos = extraerDatos(pagosPromise.value);
    }
    
    // Procesar inscripciones
    let datosInscripciones = [];
    if (inscripcionesPromise.status === 'fulfilled') {
      datosInscripciones = extraerDatos(inscripcionesPromise.value);
    }
    
    // Procesar reembolsos
    let datosReembolsos = [];
    if (reembolsosPromise.status === 'fulfilled') {
      datosReembolsos = extraerDatos(reembolsosPromise.value);
    }
    
    console.log(`📈 Datos cargados: ${datosPagos.length} pagos, ${datosInscripciones.length} inscripciones, ${datosReembolsos.length} reembolsos`);
    
    // Calcular estadísticas de estudiantes
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    // Estadísticas de estudiantes
    const inscripcionesActivas = datosInscripciones.filter(i => 
      (i.estado || '').toLowerCase() === 'activo'
    );
    
    const inscripcionesPorVencer = datosInscripciones.filter(insc => {
      if (!insc.fecha_fin || (insc.estado || '').toLowerCase() !== 'activo') return false;
      const fechaFin = new Date(insc.fecha_fin);
      const diasRestantes = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));
      return diasRestantes <= 7 && diasRestantes > 0;
    });
    
    // Estadísticas de pagos
    const pagosPagados = datosPagos.filter(p => 
      (p.estado || '').toLowerCase() === 'pagado'
    );
    
    const recaudacionTotal = pagosPagados.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
    const recaudacionMes = pagosPagados.filter(p => {
      if (!p.fecha_pago) return false;
      const fechaPago = new Date(p.fecha_pago);
      return fechaPago >= primerDiaMes && fechaPago <= hoy;
    }).reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
    
    // Estadísticas de reembolsos
    const reembolsosPendientes = datosReembolsos.filter(r => 
      (r.estado || '').toLowerCase() === 'pendiente'
    ).length;
    
    const reembolsosAprobados = datosReembolsos.filter(r => 
      (r.estado || '').toLowerCase() === 'aprobado'
    ).length;
    
    const totalReembolsos = datosReembolsos.reduce((sum, r) => 
      sum + (parseFloat(r.monto_reembolsado) || 0), 0
    );
    
    const reembolsosMes = datosReembolsos.filter(r => {
      if (!r.fecha_solicitud) return false;
      const fecha = new Date(r.fecha_solicitud);
      return fecha >= primerDiaMes && fecha <= hoy;
    }).reduce((sum, r) => sum + (parseFloat(r.monto_reembolsado) || 0), 0);
    
    // Calcular ganancias netas
    const gananciasNetas = recaudacionTotal - totalReembolsos;
    
    // Datos de hoy
    const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const hoyFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);
    
    const pagosHoy = datosPagos.filter(p => {
      if (!p.fecha_pago || p.estado !== 'pagado') return false;
      const fecha = new Date(p.fecha_pago);
      return fecha >= hoyInicio && fecha <= hoyFin;
    }).length;
    
    const ingresosHoy = datosPagos.filter(p => {
      if (!p.fecha_pago || p.estado !== 'pagado') return false;
      const fecha = new Date(p.fecha_pago);
      return fecha >= hoyInicio && fecha <= hoyFin;
    }).reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
    
    const reembolsosHoy = datosReembolsos.filter(r => {
      if (!r.fecha_solicitud) return false;
      const fecha = new Date(r.fecha_solicitud);
      return fecha >= hoyInicio && fecha <= hoyFin;
    }).reduce((sum, r) => sum + (parseFloat(r.monto_reembolsado) || 0), 0);
    
    // Actualizar estadísticas
    estadisticas.value = {
      totalInscripciones: datosInscripciones.length,
      inscripcionesActivas: inscripcionesActivas.length,
      inscripcionesEnMora: datosInscripciones.filter(i => (i.estado || '').toLowerCase() === 'en_mora').length,
      inscripcionesPorVencer: inscripcionesPorVencer.length,
      tasaRenovacion: Math.round((inscripcionesActivas.length / Math.max(datosInscripciones.length, 1)) * 100),
      
      recaudacionTotal,
      recaudacionMes,
      promedioPago: pagosPagados.length > 0 ? recaudacionTotal / pagosPagados.length : 0,
      montoEnMora: datosInscripciones.reduce((sum, i) => {
        if ((i.estado || '').toLowerCase() === 'en_mora') {
          return sum + (parseFloat(i.modalidad?.precio_mensual) || 0);
        }
        return sum;
      }, 0),
      gananciasNetas,
      
      pagosPendientes: datosPagos.filter(p => (p.estado || '').toLowerCase() === 'pendiente').length,
      pagosVencidos: datosPagos.filter(p => (p.estado || '').toLowerCase() === 'vencido').length,
      totalPagos: datosPagos.length,
      pagosPagados: pagosPagados.length,
      
      reembolsosPendientes,
      reembolsosAprobados,
      totalReembolsos,
      reembolsosMes,
      reembolsosProceso: datosReembolsos.filter(r => 
        ['aprobado', 'en_proceso'].includes((r.estado || '').toLowerCase())
      ).length,
      
      clasesHoy: calcularClasesHoy(inscripcionesActivas),
      pagosHoy,
      nuevosEstudiantesHoy: datosInscripciones.filter(i => {
        if (!i.created_at) return false;
        const fecha = new Date(i.created_at);
        return fecha >= hoyInicio && fecha <= hoyFin;
      }).length,
      ingresosHoy,
      reembolsosHoy,
      balanceDiario: ingresosHoy - reembolsosHoy
    };
    
    console.log('✅ Estadísticas completas cargadas:', estadisticas.value);
    
  } catch (error) {
    console.error('❌ Error cargando estadísticas completas:', error);
  }
}

// 5. CARGAR DATOS DE GRÁFICOS (CORREGIDO)
async function cargarDatosGraficos() {
  cargandoGrafico.value = true;
  
  try {
    console.log('📊 Cargando datos para gráficos...');
    
    // Cargar datos para gráfico comparativo - cada uno con su formato correcto
    const [pagosPromise, reembolsosPromise] = await Promise.allSettled([
      pagoService.index(1, 1000, {}),
      reembolsoService.index(1, 1000, {})
    ]);
    
    let pagos = [];
    let reembolsos = [];
    
    if (pagosPromise.status === 'fulfilled') {
      pagos = extraerDatos(pagosPromise.value);
    }
    
    if (reembolsosPromise.status === 'fulfilled') {
      reembolsos = extraerDatos(reembolsosPromise.value);
    }
    
    console.log(`📈 Gráficos: ${pagos.length} pagos, ${reembolsos.length} reembolsos`);
    
    // Preparar datos para los últimos 6 meses
    const hoy = new Date();
    const meses = [];
    const datosPagos = [];
    const datosReembolsos = [];
    
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = fecha.toLocaleDateString('es-ES', { month: 'short' });
      meses.push(mes.charAt(0).toUpperCase() + mes.slice(1));
      
      // Calcular pagos del mes
      const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const ultimoDiaMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
      
      const totalPagosMes = pagos
        .filter(p => {
          if (!p.fecha_pago || p.estado !== 'pagado') return false;
          const fechaPago = new Date(p.fecha_pago);
          return fechaPago >= primerDiaMes && fechaPago <= ultimoDiaMes;
        })
        .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
      
      const totalReembolsosMes = reembolsos
        .filter(r => {
          if (!r.fecha_solicitud) return false;
          const fechaReembolso = new Date(r.fecha_solicitud);
          return fechaReembolso >= primerDiaMes && fechaReembolso <= ultimoDiaMes;
        })
        .reduce((sum, r) => sum + (parseFloat(r.monto_reembolsado) || 0), 0);
      
      datosPagos.push(totalPagosMes);
      datosReembolsos.push(totalReembolsosMes);
    }
    
    // Gráfico comparativo
    chartDataComparativo.value = {
      labels: meses,
      datasets: [
        {
          label: 'Recaudación',
          data: datosPagos,
          fill: true,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        },
        {
          label: 'Reembolsos',
          data: datosReembolsos,
          fill: true,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4
        }
      ]
    };
    
    chartOptionsComparativo.value = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return `Bs. ${value.toLocaleString('es-ES')}`;
            }
          }
        }
      }
    };
    
    // Gráfico de distribución de reembolsos
    const estadosReembolsos = reembolsos.reduce((acc, r) => {
      const estado = r.estado || 'desconocido';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});
    
    const estados = Object.keys(estadosReembolsos);
    const cantidades = Object.values(estadosReembolsos);
    const colores = estados.map(e => {
      switch(e) {
        case 'pendiente': return '#f59e0b';
        case 'aprobado': return '#10b981';
        case 'rechazado': return '#ef4444';
        case 'completado': return '#3b82f6';
        default: return '#6b7280';
      }
    });
    
    chartDataReembolsos.value = {
      labels: estados.map(e => e.charAt(0).toUpperCase() + e.slice(1)),
      datasets: [
        {
          data: cantidades,
          backgroundColor: colores,
          hoverBackgroundColor: colores.map(c => c + 'CC')
        }
      ]
    };
    
    chartOptionsPie.value = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };
    
    console.log('✅ Gráficos cargados correctamente');
    
  } catch (error) {
    console.error('❌ Error cargando datos de gráficos:', error);
  } finally {
    cargandoGrafico.value = false;
  }
}

async function debugReembolsosProfundamente() {
  console.group('🔍 DEBUG PROFUNDO REEMBOLSOS');
  
  try {
    // 1. Probamos la API directamente
    console.log('1️⃣ Probando API de reembolsos...');
    const response = await reembolsoService.index(1, 10, {});
    
    console.log('📊 Respuesta completa:', response);
    console.log('📋 Data:', response.data);
    
    // 2. Verificamos la estructura
    if (response.data) {
      console.log('🔍 Estructura data:');
      console.log('- Tipo:', typeof response.data);
      console.log('- Es array:', Array.isArray(response.data));
      console.log('- Keys:', Object.keys(response.data));
      
      // Si tiene propiedad data
      if (response.data.data) {
        console.log('📦 Data.data encontrado:', response.data.data);
        console.log('- Tipo data.data:', typeof response.data.data);
        console.log('- Es array data.data:', Array.isArray(response.data.data));
        
        if (Array.isArray(response.data.data)) {
          console.log('🔢 Número de reembolsos:', response.data.data.length);
          if (response.data.data.length > 0) {
            console.log('📄 Primer reembolso:', response.data.data[0]);
          }
        }
      }
      
      // Si tiene propiedad success
      if (response.data.success !== undefined) {
        console.log('✅ Success:', response.data.success);
        console.log('📝 Message:', response.data.message);
      }
    }
    
    // 3. Probamos con diferentes parámetros
    console.log('\n2️⃣ Probando con diferentes parámetros...');
    
    // Sin filtros
    const sinFiltros = await reembolsoService.index(1, 10, {});
    console.log('Sin filtros:', sinFiltros.data);
    
    // Con estado pendiente
    const pendientes = await reembolsoService.index(1, 10, { estado: 'pendiente' });
    console.log('Pendientes:', pendientes.data);
    
    // Con estado aprobado
    const aprobados = await reembolsoService.index(1, 10, { estado: 'aprobado' });
    console.log('Aprobados:', aprobados.data);
    
    // Todos los estados
    const todos = await reembolsoService.index(1, 1000, {});
    console.log('Todos (limit 1000):', todos.data);
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
    console.error('❌ Detalles error:', error.response?.data || error.message);
  }
  
  console.groupEnd();
}

// En onMounted, hazla disponible globalmente
window.debugReembolsos = debugReembolsosProfundamente;


function extraerDatos(response) {
  console.log('🔄 Procesando respuesta...');
  
  if (!response || !response.data) {
    console.warn('⚠️ Respuesta vacía o sin data');
    return [];
  }
  
  const data = response.data;
  
  // DEBUG ESPECÍFICO PARA REEMBOLSOS
  if (response.config && response.config.url && response.config.url.includes('reembolsos')) {
    console.log('🎯 DEBUG REEMBOLSOS - Estructura completa:');
    console.log('- URL:', response.config.url);
    console.log('- Data:', data);
    console.log('- Tipo data:', typeof data);
    console.log('- Es array:', Array.isArray(data));
    console.log('- Keys:', Object.keys(data));
    
    // Log detallado para estructura anidada
    if (data.data) {
      console.log('- Data.data:', data.data);
      console.log('- Tipo data.data:', typeof data.data);
      console.log('- Es array data.data:', Array.isArray(data.data));
      
      // Si data.data es un objeto con propiedad data
      if (data.data.data && Array.isArray(data.data.data)) {
        console.log('- Data.data.data (¡ESTÁN AQUÍ!):', data.data.data);
        console.log('- Cantidad reembolsos:', data.data.data.length);
        if (data.data.data.length > 0) {
          console.log('- Primer reembolso:', data.data.data[0]);
        }
      }
    }
  }
  
  // CASO ESPECIAL PARA REEMBOLSOS: {success: true, data: {data: [...], meta: {...}}}
  if (data.success && data.data) {
    // Si data.data tiene propiedad data (estructura doble anidada)
    if (data.data.data && Array.isArray(data.data.data)) {
      console.log('🎯 Caso especial reembolsos: data.data.data encontrado');
      console.log('✅ Extrayendo', data.data.data.length, 'reembolsos');
      return data.data.data;
    }
    
    // Si data.data es un array directamente
    if (Array.isArray(data.data)) {
      console.log('✅ Caso 2: data.data es array, tamaño:', data.data.length);
      return data.data;
    }
    
    // Si data.data es un objeto individual
    const datos = data.data;
    const esArray = Array.isArray(datos);
    console.log('✅ Caso 3: Success response, data es array?:', esArray);
    
    if (esArray) {
      return datos;
    } else {
      // Si data es un objeto individual, lo convertimos a array
      console.log('🔄 Convirtiendo objeto individual a array');
      return [datos];
    }
  }
  
  // Resto de casos (mantener igual)...
  // Caso 1: Array directo
  if (Array.isArray(data)) {
    console.log('✅ Caso 1: Array directo, tamaño:', data.length);
    return data;
  }
  
  // Caso 4: { reembolsos: [] } o estructura personalizada
  for (const key in data) {
    if (Array.isArray(data[key])) {
      console.log(`✅ Caso 4: Array en propiedad "${key}", tamaño:`, data[key].length);
      return data[key];
    }
  }
  
  // Caso 5: Objeto individual directamente
  if (typeof data === 'object' && data !== null && !Array.isArray(data) && data.id) {
    console.log('✅ Caso 5: Objeto individual con id, convirtiendo a array');
    return [data];
  }
  
  console.warn('⚠️ Formato no reconocido, retornando array vacío');
  return [];
}





async function cargarAlertasUrgentes() {
  try {
    alertasUrgentes.value = [];
    
    // Alertas de pagos vencidos
    const responsePagos = await pagoService.index(1, 50, '', {
      estado: 'vencido'
    });
    
    const pagosVencidos = extraerDatos(responsePagos);
    if (pagosVencidos.length > 0) {
      alertasUrgentes.value.push({
        tipo: 'pago_vencido',
        titulo: `${pagosVencidos.length} Pago(s) Vencido(s)`,
        descripcion: 'Pagos que requieren atención inmediata',
        accion: '/admin/pagos'
      });
    }
    
    // Alertas de reembolsos pendientes
    if (estadisticas.value.reembolsosPendientes > 5) {
      alertasUrgentes.value.push({
        tipo: 'reembolso_pendiente',
        titulo: `${estadisticas.value.reembolsosPendientes} Reembolso(s) Pendiente(s)`,
        descripcion: 'Reembolsos esperando revisión',
        accion: '/admin/reembolsos'
      });
    }
    
    // Alertas de inscripciones por vencer
    if (estadisticas.value.inscripcionesPorVencer > 0) {
      alertasUrgentes.value.push({
        tipo: 'inscripcion_vencer',
        titulo: `${estadisticas.value.inscripcionesPorVencer} Inscripción(es) por Vencer`,
        descripcion: 'Inscripciones que vencen en 7 días',
        accion: '/admin/inscripciones'
      });
    }
    
  } catch (error) {
    console.error('Error cargando alertas:', error);
    alertasUrgentes.value = [];
  }
}



// ========== FUNCIONES AUXILIARES ==========
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

function actualizarHora() {
  const ahora = new Date();
  horaActual.value = ahora.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit' 
  });
}

function getColorTasa(tasa) {
  if (tasa >= 80) return 'text-green-600';
  if (tasa >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function getColorBalance(balance) {
  if (balance > 0) return 'text-green-600';
  if (balance < 0) return 'text-red-600';
  return 'text-500';
}

function getSeveridadEstado(estado) {
  switch ((estado || '').toLowerCase()) {
    case 'activo': return 'success';
    case 'en_mora': 
    case 'vencido': 
    case 'rechazado': return 'danger';
    case 'pendiente': return 'warning';
    case 'aprobado': return 'info';
    case 'completado': return 'success';
    default: return 'info';
  }
}

function getSeveridadEstadoPago(estado) {
  switch ((estado || '').toLowerCase()) {
    case 'pagado': return 'success';
    case 'pendiente': return 'warning';
    case 'vencido': return 'danger';
    default: return 'info';
  }
}

function getIniciales(estudiante) {
  if (!estudiante) return '??';
  
  // Si es un objeto con propiedades
  if (typeof estudiante === 'object') {
    const nombres = estudiante.nombres || '';
    const apellidos = estudiante.apellidos || '';
    
    if (nombres && apellidos) {
      return (nombres[0] + apellidos[0]).toUpperCase();
    } else if (nombres) {
      return nombres.slice(0, 2).toUpperCase();
    }
  }
  
  // Si es solo un ID
  return '??';
}

function getNombreCompleto(estudiante) {
  if (!estudiante) return 'Desconocido';
  
  // Si es un objeto con propiedades
  if (typeof estudiante === 'object') {
    const nombre = `${estudiante.nombres || ''} ${estudiante.apellidos || ''}`.trim();
    return nombre || 'Desconocido';
  }
  
  // Si es solo un ID
  return `Estudiante #${estudiante}`;
}

function getNombreEstudiante(pago) {
  if (pago.inscripcion?.estudiante) {
    return getNombreCompleto(pago.inscripcion.estudiante);
  }
  return `Estudiante #${pago.estudiante_id || pago.inscripcion_id}`;
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

function calcularMargen() {
  const ingresos = estadisticas.value.recaudacionTotal;
  const reembolsos = estadisticas.value.totalReembolsos;
  if (ingresos === 0) return 0;
  return Math.round(((ingresos - reembolsos) / ingresos) * 100);
}

function getClaseAlerta(tipo) {
  switch (tipo) {
    case 'pago_vencido': return 'alerta-urgente-pago';
    case 'reembolso_pendiente': return 'alerta-urgente-reembolso';
    case 'inscripcion_vencer': return 'alerta-urgente-inscripcion';
    default: return 'alerta-urgente-info';
  }
}

function getIconoAlerta(tipo) {
  switch (tipo) {
    case 'pago_vencido': return 'pi pi-exclamation-triangle text-red-500';
    case 'reembolso_pendiente': return 'pi pi-money-bill-wave text-orange-500';
    case 'inscripcion_vencer': return 'pi pi-calendar-times text-yellow-500';
    default: return 'pi pi-info-circle text-blue-500';
  }
}

function ejecutarAccionAlerta(alerta) {
  if (alerta.accion) {
    router.push(alerta.accion);
  }
}

function verDetalleReembolso(reembolso) {
  router.push(`/admin/reembolsos/${reembolso.id}`);
}

// ========== NAVEGACIÓN ==========
function irAEstudiantes() {
  router.push('/admin/estudiantes');
}

function irAInscripciones() {
  router.push('/admin/inscripciones');
}

function irAPagos() {
  router.push('/admin/pagos');
}

function irAReembolsos() {
  router.push('/admin/reembolsos');
}

// ========== ACCIONES RÁPIDAS ==========
function nuevoPago() {
  router.push('/admin/pagos/nuevo');
}

function nuevoReembolso() {
  router.push('/admin/reembolsos/nuevo');
}

function nuevaInscripcion() {
  router.push('/admin/inscripciones/nueva');
}

function generarReporte() {
  toast.add({
    severity: 'info',
    summary: 'Reporte',
    detail: 'Generando reporte diario...',
    life: 3000
  });
  // Aquí iría la lógica para generar el reporte
}

function aplicarFiltros() {
  toast.add({
    severity: 'success',
    summary: 'Filtros aplicados',
    detail: 'Filtros aplicados correctamente',
    life: 3000
  });
}

function limpiarFiltros() {
  filtroFechaDesde.value = null;
  filtroFechaHasta.value = null;
  filtroEstados.value = [];
  busquedaGlobal.value = '';
  
  toast.add({
    severity: 'info',
    summary: 'Filtros limpiados',
    detail: 'Todos los filtros han sido limpiados',
    life: 3000
  });
}

function filtrarDatosGlobales() {
  // Lógica de filtrado global
  console.log('Buscando:', busquedaGlobal.value);
}

// ========== INICIALIZACIÓN ==========
onMounted(() => {
  cargarTodosDatos();
  
  // Actualizar hora cada segundo
  setInterval(actualizarHora, 1000);
  
  // Actualizar datos automáticamente cada 5 minutos
  setInterval(() => {
    if (!cargandoTodo.value) {
      cargarTodosDatos();
    }
  }, 5 * 60 * 1000);
});
</script>

<style scoped>
.dashboard-container {
  padding: 1.5rem;
  max-width: 1920px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* Header */
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

/* Tarjetas */
.dashboard-cards {
  margin-bottom: 2rem;
}

.stat-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.highlight-card {
  transform: scale(1.02);
  box-shadow: 0 0 0 2px var(--highlight-color) !important;
  z-index: 10;
}

.student-card { --highlight-color: #3b82f6; }
.finance-card { --highlight-color: #10b981; }
.payment-card { --highlight-color: #f59e0b; }
.refund-card { --highlight-color: #ef4444; }

.card-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Filtros */
.filtros-rapidos {
  margin-bottom: 2rem;
}

.view-btn {
  border-radius: 20px !important;
  padding: 0.5rem 1.25rem !important;
  transition: all 0.2s ease !important;
}

.view-btn-active {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
  color: white !important;
  border-color: transparent !important;
  font-weight: 600 !important;
}

.search-input {
  border-radius: 20px !important;
  padding-left: 2.5rem !important;
}

/* Tiempo Real */
.real-time-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 1rem;
  height: 100%;
  transition: all 0.3s ease;
}

.real-time-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.real-time-header {
  display: flex;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 1rem;
}

.real-time-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.real-time-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.alert-card {
  border: 1px solid #fecaca !important;
  background: linear-gradient(to right, #fef2f2, white);
}

.alerta-urgente {
  background: white;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.alerta-urgente:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.alerta-urgente-pago {
  border-left: 4px solid #ef4444;
}

.alerta-urgente-reembolso {
  border-left: 4px solid #f59e0b;
}

.alerta-urgente-inscripcion {
  border-left: 4px solid #3b82f6;
}

/* Resumen Financiero */
.financial-summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  height: 100%;
  transition: all 0.3s ease;
}

.financial-summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.financial-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.financial-value {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.financial-detail {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Acciones Rápidas */
.quick-action-btn {
  border-radius: 12px !important;
  padding: 1rem !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
}

.quick-action-btn:hover {
  transform: translateY(-3px);
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
  
  .view-btn {
    padding: 0.5rem 1rem !important;
    font-size: 0.875rem;
  }
}
</style>