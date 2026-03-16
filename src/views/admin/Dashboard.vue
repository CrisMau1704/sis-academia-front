<template>
  <div class="dashboard-container">
    <!-- Header Principal -->
    <div class="dashboard-header">
      <div class="flex align-items-center">
        <i class="pi pi-chart-bar text-primary text-3xl mr-3"></i>
        <div>
          <h1>Dashboard de Gestión Completo</h1>
          <p class="text-500 m-0">Control total del sistema - Estudiantes, Pagos, Gastos y Reembolsos</p>
        </div>
      </div>
      <div class="header-actions">
        <Button label="Actualizar Todo" icon="pi pi-refresh" severity="info" @click="cargarTodosDatos"
          :loading="cargandoTodo" />
        <span class="text-500 text-sm">Última actualización: {{ ultimaActualizacion }}</span>
      </div>
    </div>

    <!-- TARJETAS PRINCIPALES UNIFICADAS -->
    <div class="dashboard-cards">
      <div class="grid">

        <!-- Tarjeta 1: ESTUDIANTES ACTIVOS -->
        <div class="col-12 md:col-6 lg:col-3" :class="{ 'highlight-card': vistaActiva === 'estudiantes' }">
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
                <Button label="Ver Estudiantes" icon="pi pi-users" class="p-button-sm w-full p-button-outlined"
                  @click="irAEstudiantes" />
              </div>
            </template>
          </Card>
        </div>

        <!-- Tarjeta 2: FINANZAS (MODIFICADA - AHORA INCLUYE GASTOS) -->
        <div class="col-12 md:col-6 lg:col-3" :class="{ 'highlight-card': vistaActiva === 'finanzas' }">
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
                <!-- NUEVO: Gastos totales -->
                <div class="flex justify-content-between mb-1">
                  <small class="text-500">Gastos totales</small>
                  <small class="font-bold text-red-600">Bs.{{ formatMonto(estadisticas.gastosTotales || 0) }}</small>
                </div>
                <!-- NUEVO: Ganancias netas (recaudación - gastos - reembolsos) -->
                <div class="flex justify-content-between">
                  <small class="text-500">Ganancias netas</small>
                  <small class="font-bold text-blue-600">Bs.{{ formatMonto(estadisticas.gananciasNetas) }}</small>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Tarjeta 3: SITUACIÓN DE PAGOS -->
        <div class="col-12 md:col-6 lg:col-3" :class="{ 'highlight-card': vistaActiva === 'pagos' }">
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
        <div class="col-12 md:col-6 lg:col-3" :class="{ 'highlight-card': vistaActiva === 'reembolsos' }">
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
                <Button label="Gestionar Reembolsos" icon="pi pi-arrow-right" severity="danger"
                  class="p-button-sm w-full" @click="irAReembolsos" />
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

            <!-- Finanzas Rápidas (MODIFICADA - AHORA INCLUYE GASTOS) -->
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
                      <div class="text-sm text-500">Gastos hoy</div>
                      <div class="font-bold text-xl text-red-600">Bs.{{ formatMonto(estadisticas.gastosHoy || 0) }}
                      </div>
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
        <!-- Gráfico de Recaudación vs Reembolsos -->
        <div class="col-12 lg:col-8">
          <Card>
            <template #title>
              <div class="flex align-items-center justify-content-between">
                <div class="flex align-items-center">
                  <i class="pi pi-chart-line mr-2 text-primary"></i>
                  <span>Recaudación vs Reembolsos</span>
                </div>
                <Dropdown v-model="periodoGrafico" :options="periodos" optionLabel="label" optionValue="value"
                  class="w-15rem" />
              </div>
            </template>
            <template #content>
              <div v-if="cargandoGrafico" class="text-center p-5">
                <ProgressSpinner style="width: 50px; height: 50px" />
                <p class="text-500 mt-3">Cargando gráfico...</p>
              </div>
              <div v-else-if="chartDataComparativo.labels && chartDataComparativo.labels.length > 0">
                <Chart type="line" :data="chartDataComparativo" :options="chartOptionsComparativo" :height="250" />
              </div>
              <div v-else class="text-center p-5 text-500">
                <i class="pi pi-chart-line text-400" style="font-size: 3rem"></i>
                <p class="mt-3">No hay datos suficientes para mostrar el gráfico</p>
              </div>
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
              <div v-if="cargandoGrafico" class="text-center p-5">
                <ProgressSpinner style="width: 50px; height: 50px" />
                <p class="text-500 mt-3">Cargando gráfico...</p>
              </div>
              <div v-else-if="chartDataReembolsos.labels && chartDataReembolsos.labels.length > 0">
                <Chart type="pie" :data="chartDataReembolsos" :options="chartOptionsPie" :height="250" />
              </div>
              <div v-else class="text-center p-5 text-500">
                <i class="pi pi-chart-pie text-400" style="font-size: 3rem"></i>
                <p class="mt-3">No hay reembolsos para mostrar</p>
              </div>
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
                    <Button icon="pi pi-eye" class="p-button-text p-button-sm" @click="verDetalleReembolso(data)" />
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

    <!-- RESUMEN FINANCIERO DETALLADO (MODIFICADO - AHORA INCLUYE GASTOS) -->
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
            <!-- NUEVA TARJETA: Gastos Totales -->
            <div class="col-12 md:col-6 lg:col-3">
              <div class="financial-summary-card">
                <div class="financial-header">
                  <i class="pi pi-arrow-down-left text-red-500"></i>
                  <span>Gastos Totales</span>
                </div>
                <div class="financial-value text-red-600">
                  Bs.{{ formatMonto(estadisticas.gastosTotales || 0) }}
                </div>
                <div class="financial-detail">
                  <span>Este mes: Bs.{{ formatMonto(estadisticas.gastosMes || 0) }}</span>
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
                  <span class="ml-2 text-xs">(Ingresos - Gastos - Reembolsos)</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- RESUMEN POR MODALIDADES -->
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// Importar servicios (AGREGAMOS gastoService)
import inscripcionService from '@/services/inscripcion.service';
import pagoService from '@/services/pago.service';
import reembolsoService from '@/services/reembolso.service';
import gastoService from '@/services/gasto.service'; // NUEVO

// Componentes PrimeVue
import Card from 'primevue/card';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import ProgressBar from 'primevue/progressbar';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import Chart from 'primevue/chart';
import ProgressSpinner from 'primevue/progressspinner';

const router = useRouter();
const toast = useToast();

// ========== ESTADOS PRINCIPALES ==========
const cargandoTodo = ref(false);
const cargandoGrafico = ref(false);
const ultimaActualizacion = ref(new Date().toLocaleString('es-ES'));
const horaActual = ref('');

// ========== FILTROS ==========
const vistaActiva = ref('todo');
const resumenModalidades = ref([]);

// ========== ESTADÍSTICAS COMPLETAS (AGREGAMOS gastosTotales, gastosMes, gastosHoy) ==========
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

  // Gastos (NUEVOS)
  gastosTotales: 0,
  gastosMes: 0,
  gastosHoy: 0,

  // Ganancias (calculadas)
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

// ========== FUNCIÓN PRINCIPAL (AGREGAMOS CARGA DE GASTOS) ==========
async function cargarTodosDatos() {
  cargandoTodo.value = true;

  try {
    console.log('🔄 Cargando todos los datos del dashboard...');

    // Cargar en paralelo - AGREGAMOS gastoService
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

// ========== CARGAR ESTADÍSTICAS COMPLETAS (AGREGAMOS GASTOS) ==========
async function cargarEstadisticasCompletas() {
  try {
    console.log('📊 Cargando estadísticas completas...');

    // Cargar todos los datos necesarios - CORREGIDO: gastoService.obtenerTodos()
    const [pagosPromise, inscripcionesPromise, reembolsosPromise, gastosPromise] = await Promise.allSettled([
      pagoService.index(1, 1000, {}),
      inscripcionService.index(1, 1000, ''),
      reembolsoService.index(1, 1000, {}),
      gastoService.obtenerTodos() // ✅ CORREGIDO: usar obtenerTodos() en lugar de index con parámetros incorrectos
    ]);

    // Procesar pagos
    let datosPagos = [];
    if (pagosPromise.status === 'fulfilled') {
      datosPagos = extraerDatos(pagosPromise.value);
      console.log(`💰 Pagos: ${datosPagos.length} registros`);
    } else {
      console.error('❌ Error en pagos:', pagosPromise.reason);
    }

    // Procesar inscripciones
    let datosInscripciones = [];
    if (inscripcionesPromise.status === 'fulfilled') {
      datosInscripciones = extraerDatos(inscripcionesPromise.value);
      console.log(`📋 Inscripciones: ${datosInscripciones.length} registros`);
    } else {
      console.error('❌ Error en inscripciones:', inscripcionesPromise.reason);
    }

    // Procesar reembolsos
    let datosReembolsos = [];
    if (reembolsosPromise.status === 'fulfilled') {
      datosReembolsos = extraerDatos(reembolsosPromise.value);
      console.log(`↩️ Reembolsos: ${datosReembolsos.length} registros`);
    } else {
      console.error('❌ Error en reembolsos:', reembolsosPromise.reason);
    }

    // Procesar gastos - AHORA CON LA LLAMADA CORRECTA
    let datosGastos = [];
    if (gastosPromise.status === 'fulfilled') {
      console.log('✅ gastosPromise cumplida');
      datosGastos = extraerDatos(gastosPromise.value);
      console.log(`💰 Gastos: ${datosGastos.length} registros`);

      // Mostrar los gastos encontrados para debug
      if (datosGastos.length > 0) {
        console.log('💰 GASTOS ENCONTRADOS:');
        datosGastos.forEach((g, i) => {
          console.log(`  ${i + 1}. ID:${g.id} | ${g.descripcion} | Bs.${g.monto} | ${g.fecha} | Cat:${g.categoria}`);
        });
      }
    } else {
      console.error('❌ Error en gastos:', gastosPromise.reason);
    }

    console.log(`📈 Resumen final: ${datosPagos.length} pagos, ${datosInscripciones.length} inscripciones, ${datosReembolsos.length} reembolsos, ${datosGastos.length} gastos`);

    // Calcular fechas
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

    // Calcular estadísticas de gastos
    const gastosTotales = datosGastos.reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);
    console.log('💰 Total gastos calculado:', gastosTotales);

    const gastosMes = datosGastos.filter(g => {
      if (!g.fecha) return false;
      const fechaGasto = new Date(g.fecha);
      return fechaGasto >= primerDiaMes && fechaGasto <= hoy;
    }).reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);
    console.log('💰 Gastos mes calculado:', gastosMes);

    // Calcular ganancias netas
    const gananciasNetas = recaudacionTotal - gastosTotales - totalReembolsos;
    console.log('💰 Ganancias netas:', gananciasNetas);

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

    // Gastos de hoy
    const gastosHoy = datosGastos.filter(g => {
      if (!g.fecha) return false;
      const fecha = new Date(g.fecha);
      return fecha >= hoyInicio && fecha <= hoyFin;
    }).reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);
    console.log('💰 Gastos hoy calculado:', gastosHoy);

    // Balance diario
    const balanceDiario = ingresosHoy - gastosHoy - reembolsosHoy;

    // Actualizar estadísticas
    estadisticas.value = {
      // Estudiantes
      totalInscripciones: datosInscripciones.length,
      inscripcionesActivas: inscripcionesActivas.length,
      inscripcionesEnMora: datosInscripciones.filter(i => (i.estado || '').toLowerCase() === 'en_mora').length,
      inscripcionesPorVencer: inscripcionesPorVencer.length,
      tasaRenovacion: Math.round((inscripcionesActivas.length / Math.max(datosInscripciones.length, 1)) * 100),

      // Finanzas
      recaudacionTotal,
      recaudacionMes,
      promedioPago: pagosPagados.length > 0 ? recaudacionTotal / pagosPagados.length : 0,
      montoEnMora: datosInscripciones.reduce((sum, i) => {
        if ((i.estado || '').toLowerCase() === 'en_mora') {
          return sum + (parseFloat(i.modalidad?.precio_mensual) || 0);
        }
        return sum;
      }, 0),

      // Gastos
      gastosTotales,
      gastosMes,
      gastosHoy,

      // Ganancias
      gananciasNetas,

      // Pagos
      pagosPendientes: datosPagos.filter(p => (p.estado || '').toLowerCase() === 'pendiente').length,
      pagosVencidos: datosPagos.filter(p => (p.estado || '').toLowerCase() === 'vencido').length,
      totalPagos: datosPagos.length,
      pagosPagados: pagosPagados.length,

      // Reembolsos
      reembolsosPendientes,
      reembolsosAprobados,
      totalReembolsos,
      reembolsosMes,
      reembolsosProceso: datosReembolsos.filter(r =>
        ['aprobado', 'en_proceso'].includes((r.estado || '').toLowerCase())
      ).length,

      // Tiempo real
      clasesHoy: calcularClasesHoy(inscripcionesActivas),
      pagosHoy,
      nuevosEstudiantesHoy: datosInscripciones.filter(i => {
        if (!i.created_at) return false;
        const fecha = new Date(i.created_at);
        return fecha >= hoyInicio && fecha <= hoyFin;
      }).length,
      ingresosHoy,
      reembolsosHoy,
      balanceDiario
    };

    console.log('✅ Estadísticas completas cargadas:', estadisticas.value);

  } catch (error) {
    console.error('❌ Error cargando estadísticas completas:', error);
  }
}

// ========== CARGAR DATOS DE GRÁFICOS (AHORA INCLUYE GASTOS) ==========
async function cargarDatosGraficos() {
  cargandoGrafico.value = true;

  try {
    console.log('📊 Cargando datos para gráficos...');

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

    // Preparar datos para los últimos 6 meses
    const hoy = new Date();
    const meses = [];
    const datosPagos = [];
    const datosReembolsos = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = fecha.toLocaleDateString('es-ES', { month: 'short' });
      meses.push(mes.charAt(0).toUpperCase() + mes.slice(1));

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

    // SOLO actualizar los datos del gráfico si hay labels
    if (meses.length > 0) {
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
          legend: { position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `Bs. ${value.toLocaleString('es-ES')}`
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

      if (estados.length > 0) {
        const colores = estados.map(e => {
          switch (e) {
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
      }
    }

  } catch (error) {
    console.error('❌ Error cargando gráficos:', error);
  } finally {
    cargandoGrafico.value = false;
  }
}

// ========== EL RESTO DE TUS FUNCIONES SE MANTIENEN IGUAL ==========

function extraerDatos(response) {
  if (!response || !response.data) return [];
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data.success && data.data) {
    if (Array.isArray(data.data)) return data.data;
    if (data.data.data && Array.isArray(data.data.data)) return data.data.data;
  }
  if (data.data && Array.isArray(data.data)) return data.data;
  return [];
}

function calcularClasesHoy(inscripciones) {
  try {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const diaHoy = diasSemana[diaSemana];

    let clasesHoy = 0;
    inscripciones.forEach(inscripcion => {
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
  } catch {
    return 0;
  }
}

async function cargarUltimosReembolsos() {
  try {
    const response = await reembolsoService.index(1, 5, { sort: 'created_at', order: 'desc' });
    ultimosReembolsos.value = extraerDatos(response);
  } catch {
    ultimosReembolsos.value = [];
  }
}

async function cargarUltimosPagos() {
  try {
    const response = await pagoService.index(1, 5, { sort: 'created_at', order: 'desc' });
    ultimosPagos.value = extraerDatos(response);
  } catch {
    ultimosPagos.value = [];
  }
}

async function cargarUltimasInscripciones() {
  try {
    const response = await inscripcionService.index(1, 5, '');
    ultimasInscripciones.value = extraerDatos(response);
  } catch {
    ultimasInscripciones.value = [];
  }
}

async function cargarResumenModalidades() {
  try {
    const response = await inscripcionService.index(1, 1000, '');
    let datos = extraerDatos(response);

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
      modalidadesMap.get(modalidad.id).inscripciones++;
    });

    const totalInscripciones = datos.length;
    resumenModalidades.value = Array.from(modalidadesMap.values()).map(modalidad => ({
      ...modalidad,
      porcentaje: totalInscripciones > 0 ? Math.round((modalidad.inscripciones / totalInscripciones) * 100) : 0
    })).slice(0, 4);
  } catch {
    resumenModalidades.value = [];
  }
}

async function cargarAlertasUrgentes() {
  try {
    alertasUrgentes.value = [];

    const responsePagos = await pagoService.index(1, 50, '', { estado: 'vencido' });
    const pagosVencidos = extraerDatos(responsePagos);
    if (pagosVencidos.length > 0) {
      alertasUrgentes.value.push({
        tipo: 'pago_vencido',
        titulo: `${pagosVencidos.length} Pago(s) Vencido(s)`,
        descripcion: 'Pagos que requieren atención inmediata',
        accion: '/admin/pagos'
      });
    }

    if (estadisticas.value.reembolsosPendientes > 5) {
      alertasUrgentes.value.push({
        tipo: 'reembolso_pendiente',
        titulo: `${estadisticas.value.reembolsosPendientes} Reembolso(s) Pendiente(s)`,
        descripcion: 'Reembolsos esperando revisión',
        accion: '/admin/reembolsos'
      });
    }

    if (estadisticas.value.inscripcionesPorVencer > 0) {
      alertasUrgentes.value.push({
        tipo: 'inscripcion_vencer',
        titulo: `${estadisticas.value.inscripcionesPorVencer} Inscripción(es) por Vencer`,
        descripcion: 'Inscripciones que vencen en 7 días',
        accion: '/admin/inscripciones'
      });
    }

  } catch {
    alertasUrgentes.value = [];
  }
}

function actualizarHora() {
  const ahora = new Date();
  horaActual.value = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
    case 'en_mora': case 'vencido': case 'rechazado': return 'danger';
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
  if (typeof estudiante === 'object') {
    const nombres = estudiante.nombres || '';
    const apellidos = estudiante.apellidos || '';
    if (nombres && apellidos) return (nombres[0] + apellidos[0]).toUpperCase();
    if (nombres) return nombres.slice(0, 2).toUpperCase();
  }
  return '??';
}

function getNombreCompleto(estudiante) {
  if (!estudiante) return 'Desconocido';
  if (typeof estudiante === 'object') {
    const nombre = `${estudiante.nombres || ''} ${estudiante.apellidos || ''}`.trim();
    return nombre || 'Desconocido';
  }
  return `Estudiante #${estudiante}`;
}

function getNombreEstudiante(pago) {
  if (pago.inscripcion?.estudiante) return getNombreCompleto(pago.inscripcion.estudiante);
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
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

function calcularMargen() {
  const ingresos = estadisticas.value.recaudacionTotal;
  const gastos = estadisticas.value.gastosTotales || 0;
  const reembolsos = estadisticas.value.totalReembolsos;
  const ganancias = ingresos - gastos - reembolsos;
  if (ingresos === 0) return 0;
  return Math.round((ganancias / ingresos) * 100);
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
  if (alerta.accion) router.push(alerta.accion);
}

function verDetalleReembolso(reembolso) {
  router.push(`/admin/reembolsos/${reembolso.id}`);
}

// ========== NAVEGACIÓN ==========
function irAEstudiantes() { router.push('/admin/estudiantes'); }
function irAInscripciones() { router.push('/admin/inscripciones'); }
function irAPagos() { router.push('/admin/pagos'); }
function irAReembolsos() { router.push('/admin/reembolsos'); }

// ========== INICIALIZACIÓN ==========
onMounted(() => {
  cargarTodosDatos();
  setInterval(actualizarHora, 1000);
  setInterval(() => {
    if (!cargandoTodo.value) cargarTodosDatos();
  }, 5 * 60 * 1000);
});
</script>

<style scoped>
/* TUS ESTILOS EXISTENTES - IGUALES */
.dashboard-container {
  padding: 1.5rem;
  max-width: 1920px;
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

.student-card {
  --highlight-color: #3b82f6;
}

.finance-card {
  --highlight-color: #10b981;
}

.payment-card {
  --highlight-color: #f59e0b;
}

.refund-card {
  --highlight-color: #ef4444;
}

.card-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

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