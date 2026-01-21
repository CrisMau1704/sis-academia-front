<template>
  <div class="historial-pagos-container">
    <!-- Dashboard de estadísticas -->
    <div class="dashboard-cards mb-4">
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Total Recaudado</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-money-bill stat-icon text-green-500"></i>
                <span class="stat-value">${{ formatMonto(estadisticas.totalRecaudado) }}</span>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Pagos del Mes</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-calendar stat-icon text-blue-500"></i>
                <span class="stat-value">${{ formatMonto(estadisticas.pagosMes) }}</span>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Total Pagos</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-chart-line stat-icon text-purple-500"></i>
                <span class="stat-value">{{ estadisticas.totalPagos }}</span>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Promedio por Pago</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-calculator stat-icon text-orange-500"></i>
                <span class="stat-value">${{ formatMonto(estadisticas.promedioPago) }}</span>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Filtros avanzados -->
    <Card class="mb-4">
      <template #title>
        <div class="flex align-items-center">
          <i class="pi pi-filter mr-2"></i>
          <span>Filtros de Búsqueda</span>
        </div>
      </template>
      <template #content>
        <div class="grid">
          <div class="col-12 md:col-6 lg:col-3">
            <div class="field">
              <label for="fechaDesde" class="block mb-2">Fecha Desde</label>
              <Calendar id="fechaDesde" v-model="filtros.fecha_desde" dateFormat="dd/mm/yy" 
                showIcon class="w-full" :maxDate="filtros.fecha_hasta || hoy" />
            </div>
          </div>
          <div class="col-12 md:col-6 lg:col-3">
            <div class="field">
              <label for="fechaHasta" class="block mb-2">Fecha Hasta</label>
              <Calendar id="fechaHasta" v-model="filtros.fecha_hasta" dateFormat="dd/mm/yy" 
                showIcon class="w-full" :minDate="filtros.fecha_desde" :maxDate="hoy" />
            </div>
          </div>
          <div class="col-12 md:col-6 lg:col-3">
            <div class="field">
              <label for="metodoPago" class="block mb-2">Método de Pago</label>
              <Dropdown id="metodoPago" v-model="filtros.metodo_pago" :options="opcionesMetodoPago" 
                optionLabel="label" optionValue="value" placeholder="Todos" class="w-full" />
            </div>
          </div>
          <div class="col-12 md:col-6 lg:col-3">
            <div class="field">
              <label for="estado" class="block mb-2">Estado</label>
              <Dropdown id="estado" v-model="filtros.estado" :options="opcionesEstado" 
                optionLabel="label" optionValue="value" placeholder="Todos" class="w-full" />
            </div>
          </div>
          <div class="col-12 md:col-8">
            <div class="field">
              <label for="buscar" class="block mb-2">Buscar (Estudiante, CI, Observación)</label>
              <span class="p-input-icon-left w-full">
                <i class="pi pi-search"></i>
                <InputText id="buscar" v-model="filtros.buscar" placeholder="Buscar..." 
                  class="w-full" @keyup.enter="aplicarFiltros" />
              </span>
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="flex gap-2 mt-6">
              <Button label="Aplicar Filtros" icon="pi pi-filter" @click="aplicarFiltros" 
                class="w-full" severity="info" />
              <Button label="Limpiar" icon="pi pi-filter-slash" @click="limpiarFiltros" 
                class="w-full" severity="secondary" />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Toolbar con acciones -->
    <Toolbar class="mb-4 custom-toolbar">
      <template #start>
        <div class="flex align-items-center gap-2">
          <Button label="Nuevo Pago Manual" icon="pi pi-plus" severity="success" 
            @click="abrirDialogoNuevoPago" />
          <Button label="Exportar Excel" icon="pi pi-file-excel" severity="help" 
            @click="exportarExcel" />
          <Button label="Generar Reporte" icon="pi pi-file-pdf" severity="warning" 
            @click="generarReportePDF" />
        </div>
      </template>

      <template #end>
        <div class="flex align-items-center gap-2">
          <span class="text-500">Mostrando {{ pagosFiltrados.length }} de {{ pagos.length }} pagos</span>
          <Button icon="pi pi-refresh" @click="cargarPagos" :loading="cargando" />
        </div>
      </template>
    </Toolbar>

    <!-- Tabs para diferentes vistas -->
    <TabView class="mb-4">
      <TabPanel header="Todos los Pagos">
        <DataTable :value="pagosFiltrados" :paginator="true" :rows="15" :loading="cargando"
          class="p-datatable-sm" :filters="filtrosTabla" @filter="onFilter">
          <Column field="id" header="ID" :sortable="true" style="width: 70px">
            <template #body="slotProps">
              <span class="font-mono">#{{ slotProps.data.id }}</span>
            </template>
          </Column>
          
          <Column header="Estudiante" :sortable="true" sortField="estudiante.nombres">
            <template #body="slotProps">
              <div class="flex align-items-center">
                <Avatar :label="getInicialesEstudiante(slotProps.data.inscripcion?.estudiante)" 
                  size="small" shape="circle" class="mr-2" />
                <div>
                  <div class="font-medium">{{ slotProps.data.inscripcion?.estudiante?.nombres }} 
                    {{ slotProps.data.inscripcion?.estudiante?.apellidos }}</div>
                  <small class="text-500">{{ slotProps.data.inscripcion?.estudiante?.ci }}</small>
                </div>
              </div>
            </template>
          </Column>
          
          <Column header="Inscripción" :sortable="true">
            <template #body="slotProps">
              <div class="flex flex-column">
                <div class="flex align-items-center gap-1">
                  <span class="font-medium">#{{ slotProps.data.inscripcion_id }}</span>
                  <Tag :value="slotProps.data.inscripcion?.estado" 
                    :severity="getSeveridadEstado(slotProps.data.inscripcion?.estado)" 
                    size="small" />
                </div>
                <small class="text-500">
                  {{ slotProps.data.inscripcion?.modalidad?.nombre }}
                </small>
              </div>
            </template>
          </Column>
          
          <Column field="monto" header="Monto" :sortable="true" style="width: 120px">
            <template #body="slotProps">
              <div class="text-right">
                <div class="font-bold text-green-600">${{ formatMonto(slotProps.data.monto) }}</div>
                <small class="text-500">{{ slotProps.data.metodo_pago }}</small>
              </div>
            </template>
            <template #footer>
              <div class="text-right">
                <div class="font-bold text-primary">Total: ${{ formatMonto(totalMontoFiltrado) }}</div>
              </div>
            </template>
          </Column>
          
          <Column field="fecha_pago" header="Fecha Pago" :sortable="true" style="width: 120px">
            <template #body="slotProps">
              {{ formatFecha(slotProps.data.fecha_pago) }}
            </template>
          </Column>
          
          <Column field="estado" header="Estado" :sortable="true" style="width: 100px">
            <template #body="slotProps">
              <Tag :value="slotProps.data.estado" 
                :severity="getSeveridadEstadoPago(slotProps.data.estado)" />
            </template>
          </Column>
          
          <Column field="observacion" header="Observación" style="min-width: 200px">
            <template #body="slotProps">
              <div class="observacion-cell">
                {{ slotProps.data.observacion || 'Sin observación' }}
              </div>
            </template>
          </Column>
          
          <Column header="Acciones" style="width: 100px">
            <template #body="slotProps">
              <div class="flex gap-1">
                <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm"
                  @click="verDetallesPago(slotProps.data)" v-tooltip="'Ver detalles'" />
                <Button icon="pi pi-file-edit" class="p-button-rounded p-button-text p-button-sm"
                  @click="editarPago(slotProps.data)" v-tooltip="'Editar pago'"
                  severity="warning" />
                <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-sm"
                  @click="confirmarEliminarPago(slotProps.data)" v-tooltip="'Eliminar pago'"
                  severity="danger" />
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <TabPanel header="Pagos por Método">
        <div class="grid">
          <div class="col-12 md:col-8">
            <Card>
              <template #title>Distribución por Método de Pago</template>
              <template #content>
                <div v-if="cargando" class="text-center p-4">
                  <ProgressSpinner />
                </div>
                <div v-else>
                  <Chart type="pie" :data="chartDataMetodos" :options="chartOptions" />
                </div>
              </template>
            </Card>
          </div>
          <div class="col-12 md:col-4">
            <Card>
              <template #title>Resumen por Método</template>
              <template #content>
                <div class="space-y-3">
                  <div v-for="(metodo, index) in resumenPorMetodo" :key="index" 
                    class="p-3 border-round border-1 surface-border">
                    <div class="flex justify-content-between align-items-center">
                      <div>
                        <div class="font-bold">{{ metodo.metodo }}</div>
                        <div class="text-500">{{ metodo.cantidad }} pagos</div>
                      </div>
                      <div class="text-right">
                        <div class="font-bold text-green-600">${{ formatMonto(metodo.total) }}</div>
                        <div class="text-500">{{ metodo.porcentaje }}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </TabPanel>

      <TabPanel header="Evolución Mensual">
        <Card>
          <template #title>Evolución de Pagos por Mes</template>
          <template #content>
            <div v-if="cargando" class="text-center p-4">
              <ProgressSpinner />
            </div>
            <div v-else>
              <Chart type="bar" :data="chartDataMensual" :options="chartOptionsBar" />
            </div>
          </template>
        </Card>
      </TabPanel>
    </TabView>

    <!-- Diálogo para detalles del pago -->
    <Dialog v-model:visible="dialogoDetalles" :header="tituloDetalles" :modal="true"
      :style="{ width: '50rem', maxWidth: '95vw' }">
      <div v-if="pagoSeleccionado">
        <div class="grid">
          <!-- Información del Pago -->
          <div class="col-12 md:col-6">
            <Card class="mb-3">
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-money-bill text-primary"></i>
                  <span>Información del Pago</span>
                </div>
              </template>
              <template #content>
                <div class="space-y-3">
                  <div class="flex justify-content-between">
                    <span class="text-500">ID del Pago:</span>
                    <span class="font-bold">#{{ pagoSeleccionado.id }}</span>
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-500">Monto:</span>
                    <span class="font-bold text-green-600 text-lg">
                      ${{ formatMonto(pagoSeleccionado.monto) }}
                    </span>
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-500">Método:</span>
                    <Tag :value="pagoSeleccionado.metodo_pago" 
                      :severity="getSeveridadMetodoPago(pagoSeleccionado.metodo_pago)" />
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-500">Fecha:</span>
                    <span class="font-bold">{{ formatFechaCompleta(pagoSeleccionado.fecha_pago) }}</span>
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-500">Estado:</span>
                    <Tag :value="pagoSeleccionado.estado" 
                      :severity="getSeveridadEstadoPago(pagoSeleccionado.estado)" />
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Información del Estudiante -->
          <div class="col-12 md:col-6">
            <Card class="mb-3">
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-user text-primary"></i>
                  <span>Estudiante</span>
                </div>
              </template>
              <template #content>
                <div v-if="pagoSeleccionado.inscripcion?.estudiante">
                  <div class="flex align-items-center mb-3">
                    <Avatar :label="getInicialesEstudiante(pagoSeleccionado.inscripcion.estudiante)" 
                      size="large" class="mr-3" />
                    <div>
                      <h4 class="mt-0 mb-1">{{ pagoSeleccionado.inscripcion.estudiante.nombres }} 
                        {{ pagoSeleccionado.inscripcion.estudiante.apellidos }}</h4>
                      <p class="text-500 mb-1">CI: {{ pagoSeleccionado.inscripcion.estudiante.ci }}</p>
                      <p class="text-500">{{ pagoSeleccionado.inscripcion.estudiante.telefono }}</p>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center p-4">
                  <i class="pi pi-user text-400" style="font-size: 3rem"></i>
                  <p class="text-500 mt-2">Información del estudiante no disponible</p>
                </div>
              </template>
            </Card>
          </div>

          <!-- Información de la Inscripción -->
          <div class="col-12 md:col-6">
            <Card class="mb-3">
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-id-card text-primary"></i>
                  <span>Inscripción</span>
                </div>
              </template>
              <template #content>
                <div v-if="pagoSeleccionado.inscripcion">
                  <div class="space-y-2">
                    <div class="flex justify-content-between">
                      <span class="text-500">ID Inscripción:</span>
                      <span class="font-bold">#{{ pagoSeleccionado.inscripcion_id }}</span>
                    </div>
                    <div class="flex justify-content-between">
                      <span class="text-500">Modalidad:</span>
                      <span class="font-medium">{{ pagoSeleccionado.inscripcion.modalidad?.nombre || 'No especificada' }}</span>
                    </div>
                    <div class="flex justify-content-between">
                      <span class="text-500">Estado:</span>
                      <Tag :value="pagoSeleccionado.inscripcion.estado" 
                        :severity="getSeveridadEstado(pagoSeleccionado.inscripcion.estado)" />
                    </div>
                    <div class="flex justify-content-between">
                      <span class="text-500">Período:</span>
                      <span class="font-medium">
                        {{ formatFecha(pagoSeleccionado.inscripcion.fecha_inicio) }} - 
                        {{ formatFecha(pagoSeleccionado.inscripcion.fecha_fin) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center p-4">
                  <i class="pi pi-exclamation-circle text-400" style="font-size: 3rem"></i>
                  <p class="text-500 mt-2">Inscripción no encontrada</p>
                </div>
              </template>
            </Card>
          </div>

          <!-- Observaciones -->
          <div class="col-12 md:col-6">
            <Card class="mb-3">
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-comment text-primary"></i>
                  <span>Observaciones</span>
                </div>
              </template>
              <template #content>
                <div class="p-3 border-round bg-gray-50 min-h-6rem">
                  <p v-if="pagoSeleccionado.observacion" class="m-0">
                    {{ pagoSeleccionado.observacion }}
                  </p>
                  <p v-else class="text-500 m-0 text-center">
                    No hay observaciones registradas
                  </p>
                </div>
              </template>
            </Card>
          </div>

          <!-- Información del Sistema -->
          <div class="col-12">
            <Card>
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-info-circle text-primary"></i>
                  <span>Información del Sistema</span>
                </div>
              </template>
              <template #content>
                <div class="grid">
                  <div class="col-12 md:col-6">
                    <div class="flex justify-content-between">
                      <span class="text-500">Creado:</span>
                      <span>{{ formatFechaHora(pagoSeleccionado.created_at) }}</span>
                    </div>
                  </div>
                  <div class="col-12 md:col-6">
                    <div class="flex justify-content-between">
                      <span class="text-500">Última actualización:</span>
                      <span>{{ formatFechaHora(pagoSeleccionado.updated_at) }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Diálogo para nuevo pago manual -->
    <Dialog v-model:visible="dialogoNuevoPago" header="Registrar Pago Manual" :modal="true"
      :style="{ width: '45rem' }">
      <div class="p-fluid">
        <div class="grid">
          <div class="col-12">
            <div class="field">
              <label for="inscripcion_id">Inscripción *</label>
              <Dropdown id="inscripcion_id" v-model="nuevoPago.inscripcion_id" 
                :options="inscripcionesActivas" optionLabel="display" optionValue="id" 
                placeholder="Seleccione inscripción" class="w-full"
                :class="{ 'p-invalid': !nuevoPago.inscripcion_id }" />
              <small v-if="!nuevoPago.inscripcion_id" class="p-error">
                Seleccione una inscripción
              </small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label for="monto">Monto *</label>
              <InputNumber id="monto" v-model="nuevoPago.monto" mode="currency" 
                currency="USD" locale="es-US" class="w-full"
                :class="{ 'p-invalid': !nuevoPago.monto || nuevoPago.monto <= 0 }" />
              <small v-if="!nuevoPago.monto || nuevoPago.monto <= 0" class="p-error">
                Ingrese un monto válido
              </small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label for="metodo_pago">Método de Pago *</label>
              <Dropdown id="metodo_pago" v-model="nuevoPago.metodo_pago" 
                :options="metodosPago" optionLabel="label" optionValue="value" 
                placeholder="Seleccione método" class="w-full"
                :class="{ 'p-invalid': !nuevoPago.metodo_pago }" />
              <small v-if="!nuevoPago.metodo_pago" class="p-error">
                Seleccione un método de pago
              </small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label for="fecha_pago">Fecha de Pago</label>
              <Calendar id="fecha_pago" v-model="nuevoPago.fecha_pago" dateFormat="dd/mm/yy" 
                showIcon class="w-full" :maxDate="hoy" />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label for="estado">Estado</label>
              <Dropdown id="estado" v-model="nuevoPago.estado" 
                :options="opcionesEstadoPago" optionLabel="label" optionValue="value" 
                placeholder="Seleccione estado" class="w-full" />
            </div>
          </div>

          <div class="col-12">
            <div class="field">
              <label for="observacion">Observación</label>
              <Textarea id="observacion" v-model="nuevoPago.observacion" rows="3" 
                class="w-full" placeholder="Observaciones sobre el pago..." />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="cerrarDialogoNuevoPago" 
          severity="secondary" />
        <Button label="Registrar Pago" icon="pi pi-check" @click="guardarPagoManual" 
          severity="success" :loading="guardandoPago" />
      </template>
    </Dialog>

    <!-- Confirmación para eliminar pago -->
    <ConfirmDialog></ConfirmDialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { FilterMatchMode } from 'primevue/api';

// Importar servicios
import pagoService from '@/services/pago.service';
import inscripcionService from '@/services/inscripcion.service';

// Importar componentes PrimeVue
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Chart from 'primevue/chart';
import ProgressSpinner from 'primevue/progressspinner';
import ConfirmDialog from 'primevue/confirmdialog';

const toast = useToast();
const confirm = useConfirm();

// Estados principales
const pagos = ref([]);
const cargando = ref(false);
const hoy = ref(new Date());

// Estados para filtros
const filtros = ref({
  fecha_desde: null,
  fecha_hasta: null,
  metodo_pago: null,
  estado: null,
  buscar: ''
});

const filtrosTabla = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Estados para diálogos
const dialogoDetalles = ref(false);
const dialogoNuevoPago = ref(false);
const pagoSeleccionado = ref(null);
const tituloDetalles = ref('Detalles del Pago');
const guardandoPago = ref(false);

// Estado para nuevo pago manual
const nuevoPago = ref({
  inscripcion_id: null,
  monto: null,
  metodo_pago: null,
  fecha_pago: new Date(),
  estado: 'pagado',
  observacion: ''
});

// Estados para estadísticas
const estadisticas = ref({
  totalRecaudado: 0,
  pagosMes: 0,
  totalPagos: 0,
  promedioPago: 0
});

// Listas de opciones
const opcionesMetodoPago = ref([
  { label: 'Todos', value: null },
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'QR', value: 'qr' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Transferencia', value: 'transferencia' }
]);

const opcionesEstado = ref([
  { label: 'Todos', value: null },
  { label: 'Pagado', value: 'pagado' },
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Cancelado', value: 'cancelado' }
]);

const metodosPago = ref([
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'QR', value: 'qr' },
  { label: 'Tarjeta de Crédito/Débito', value: 'tarjeta' },
  { label: 'Transferencia Bancaria', value: 'transferencia' }
]);

const opcionesEstadoPago = ref([
  { label: 'Pagado', value: 'pagado' },
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Cancelado', value: 'cancelado' }
]);

// Computed properties
const pagosFiltrados = computed(() => {
  let filtrados = pagos.value;

  // Filtro por fechas
  if (filtros.value.fecha_desde) {
    const desde = new Date(filtros.value.fecha_desde);
    desde.setHours(0, 0, 0, 0);
    filtrados = filtrados.filter(p => {
      const fechaPago = new Date(p.fecha_pago);
      fechaPago.setHours(0, 0, 0, 0);
      return fechaPago >= desde;
    });
  }

  if (filtros.value.fecha_hasta) {
    const hasta = new Date(filtros.value.fecha_hasta);
    hasta.setHours(23, 59, 59, 999);
    filtrados = filtrados.filter(p => {
      const fechaPago = new Date(p.fecha_pago);
      return fechaPago <= hasta;
    });
  }

  // Filtro por método de pago
  if (filtros.value.metodo_pago) {
    filtrados = filtrados.filter(p => p.metodo_pago === filtros.value.metodo_pago);
  }

  // Filtro por estado
  if (filtros.value.estado) {
    filtrados = filtrados.filter(p => p.estado === filtros.value.estado);
  }

  // Filtro por búsqueda
  if (filtros.value.buscar) {
    const search = filtros.value.buscar.toLowerCase();
    filtrados = filtrados.filter(p => {
      const estudiante = p.inscripcion?.estudiante || {};
      return (
        estudiante.nombres?.toLowerCase().includes(search) ||
        estudiante.apellidos?.toLowerCase().includes(search) ||
        estudiante.ci?.toLowerCase().includes(search) ||
        p.observacion?.toLowerCase().includes(search)
      );
    });
  }

  return filtrados;
});

const totalMontoFiltrado = computed(() => {
  return pagosFiltrados.value.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
});

const inscripcionesActivas = computed(() => {
  // Esta función debería cargar inscripciones activas desde tu servicio
  return []; // Se llenará cuando carguemos las inscripciones
});

const resumenPorMetodo = computed(() => {
  const metodos = {};
  
  pagos.value.forEach(pago => {
    const metodo = pago.metodo_pago || 'No especificado';
    if (!metodos[metodo]) {
      metodos[metodo] = {
        metodo: metodo,
        cantidad: 0,
        total: 0
      };
    }
    metodos[metodo].cantidad++;
    metodos[metodo].total += parseFloat(pago.monto || 0);
  });

  const totalGeneral = Object.values(metodos).reduce((sum, m) => sum + m.total, 0);
  
  return Object.values(metodos).map(m => ({
    ...m,
    porcentaje: totalGeneral > 0 ? ((m.total / totalGeneral) * 100).toFixed(1) : '0.0'
  })).sort((a, b) => b.total - a.total);
});

// Funciones principales
async function cargarPagos() {
  cargando.value = true;
  try {
    console.log('Cargando historial de pagos...');
    
    // Usar el servicio de pagos
    const response = await pagoService.index(1, 1000, '', {
      include: 'inscripcion.estudiante,inscripcion.modalidad'
    });

    let datosPagos = [];

    // Procesar respuesta según tu estructura de API
    if (response.data) {
      if (response.data.success && Array.isArray(response.data.data)) {
        datosPagos = response.data.data;
      } else if (Array.isArray(response.data)) {
        datosPagos = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        datosPagos = response.data.data;
      }
    }

    console.log(`Cargados ${datosPagos.length} pagos`);

    // Procesar datos
    pagos.value = procesarPagos(datosPagos);

    // Calcular estadísticas
    calcularEstadisticas();
    actualizarGraficos();

  } catch (error) {
    console.error('Error cargando pagos:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los pagos',
      life: 3000
    });
  } finally {
    cargando.value = false;
  }
}

function procesarPagos(datos) {
  return datos.map(pago => {
    // Asegurar que el monto sea número
    const monto = typeof pago.monto === 'string' 
      ? parseFloat(pago.monto) 
      : (pago.monto || 0);

    return {
      ...pago,
      monto: monto,
      // Asegurar que las fechas sean objetos Date
      fecha_pago: pago.fecha_pago ? new Date(pago.fecha_pago) : new Date(),
      created_at: pago.created_at ? new Date(pago.created_at) : new Date(),
      updated_at: pago.updated_at ? new Date(pago.updated_at) : new Date()
    };
  });
}

function calcularEstadisticas() {
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

  let totalRecaudado = 0;
  let pagosMes = 0;
  let totalPagos = pagos.value.length;

  pagos.value.forEach(pago => {
    const monto = parseFloat(pago.monto || 0);
    totalRecaudado += monto;

    // Verificar si el pago es del mes actual
    const fechaPago = new Date(pago.fecha_pago);
    if (fechaPago >= primerDiaMes && fechaPago <= ultimoDiaMes) {
      pagosMes += monto;
    }
  });

  const promedioPago = totalPagos > 0 ? totalRecaudado / totalPagos : 0;

  estadisticas.value = {
    totalRecaudado,
    pagosMes,
    totalPagos,
    promedioPago
  };
}

// Funciones para gráficos
const chartDataMetodos = ref({});
const chartDataMensual = ref({});
const chartOptions = ref({
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
});

const chartOptionsBar = ref({
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '$' + value.toLocaleString();
        }
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
});

function actualizarGraficos() {
  // Gráfico de métodos de pago
  const metodos = {};
  pagos.value.forEach(pago => {
    const metodo = pago.metodo_pago || 'No especificado';
    if (!metodos[metodo]) {
      metodos[metodo] = 0;
    }
    metodos[metodo] += parseFloat(pago.monto || 0);
  });

  chartDataMetodos.value = {
    labels: Object.keys(metodos),
    datasets: [
      {
        data: Object.values(metodos),
        backgroundColor: [
          '#3B82F6', // azul
          '#10B981', // verde
          '#F59E0B', // amarillo
          '#EF4444', // rojo
          '#8B5CF6', // morado
        ]
      }
    ]
  };

  // Gráfico mensual
  const pagosPorMes = {};
  pagos.value.forEach(pago => {
    const fecha = new Date(pago.fecha_pago);
    const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    if (!pagosPorMes[mesKey]) {
      pagosPorMes[mesKey] = 0;
    }
    pagosPorMes[mesKey] += parseFloat(pago.monto || 0);
  });

  // Ordenar por mes
  const mesesOrdenados = Object.keys(pagosPorMes).sort();
  const labelsMeses = mesesOrdenados.map(mes => {
    const [year, month] = mes.split('-');
    const fecha = new Date(year, month - 1, 1);
    return fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  });

  chartDataMensual.value = {
    labels: labelsMeses,
    datasets: [
      {
        label: 'Monto Recaudado',
        data: mesesOrdenados.map(mes => pagosPorMes[mes]),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1
      }
    ]
  };
}

// Funciones de formato
function formatMonto(monto) {
  if (!monto) return '0.00';
  return parseFloat(monto).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
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

function formatFechaCompleta(fecha) {
  if (!fecha) return '--';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function formatFechaHora(fecha) {
  if (!fecha) return '--';
  const date = new Date(fecha);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getInicialesEstudiante(estudiante) {
  if (!estudiante || !estudiante.nombres) return '?';
  const nombres = estudiante.nombres.split(' ');
  if (nombres.length >= 2) {
    return (nombres[0][0] + nombres[1][0]).toUpperCase();
  }
  return nombres[0][0].toUpperCase();
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

function getSeveridadEstadoPago(estado) {
  switch (estado) {
    case 'pagado': return 'success';
    case 'pendiente': return 'warning';
    case 'cancelado': return 'danger';
    default: return 'info';
  }
}

function getSeveridadMetodoPago(metodo) {
  switch (metodo) {
    case 'efectivo': return 'success';
    case 'qr': return 'info';
    case 'tarjeta': return 'warning';
    case 'transferencia': return 'help';
    default: return 'info';
  }
}

// Funciones para filtros
function aplicarFiltros() {
  // Los filtros se aplican automáticamente a través de computed properties
  toast.add({
    severity: 'success',
    summary: 'Filtros aplicados',
    detail: `Mostrando ${pagosFiltrados.value} pagos`,
    life: 2000
  });
}

function limpiarFiltros() {
  filtros.value = {
    fecha_desde: null,
    fecha_hasta: null,
    metodo_pago: null,
    estado: null,
    buscar: ''
  };
  filtrosTabla.value.global.value = null;
}

function onFilter(event) {
  // Manejar filtro global de la tabla
  filtrosTabla.value.global.value = event.filters.global.value;
}

// Funciones para acciones
function verDetallesPago(pago) {
  pagoSeleccionado.value = pago;
  tituloDetalles.value = `Detalles del Pago #${pago.id}`;
  dialogoDetalles.value = true;
}

function editarPago(pago) {
  // Implementar lógica de edición
  toast.add({
    severity: 'info',
    summary: 'Editar Pago',
    detail: `Funcionalidad de edición para pago #${pago.id}`,
    life: 3000
  });
}

function confirmarEliminarPago(pago) {
  confirm.require({
    message: `¿Está seguro de eliminar el pago #${pago.id} por $${formatMonto(pago.monto)}?`,
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: () => {
      eliminarPago(pago.id);
    }
  });
}

async function eliminarPago(pagoId) {
  try {
    await pagoService.destroy(pagoId);
    toast.add({
      severity: 'success',
      summary: 'Pago Eliminado',
      detail: 'El pago ha sido eliminado correctamente',
      life: 3000
    });
    cargarPagos();
  } catch (error) {
    console.error('Error eliminando pago:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el pago',
      life: 3000
    });
  }
}

function abrirDialogoNuevoPago() {
  // Cargar inscripciones activas para el dropdown
  cargarInscripcionesActivas();
  dialogoNuevoPago.value = true;
}

async function cargarInscripcionesActivas() {
  try {
    const response = await inscripcionService.index(1, 100, '', {
      estado: 'activo',
      include: 'estudiante,modalidad'
    });

    let datosInscripciones = [];

    if (response.data) {
      if (response.data.success && Array.isArray(response.data.data)) {
        datosInscripciones = response.data.data;
      } else if (Array.isArray(response.data)) {
        datosInscripciones = response.data;
      }
    }

    // Formatear para el dropdown
    inscripcionesActivas.value = datosInscripciones.map(insc => ({
      id: insc.id,
      display: `#${insc.id} - ${insc.estudiante?.nombres || 'Sin estudiante'} (${insc.modalidad?.nombre || 'Sin modalidad'})`
    }));

  } catch (error) {
    console.error('Error cargando inscripciones:', error);
  }
}

async function guardarPagoManual() {
  // Validaciones
  if (!nuevoPago.value.inscripcion_id) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Seleccione una inscripción',
      life: 3000
    });
    return;
  }

  if (!nuevoPago.value.monto || nuevoPago.value.monto <= 0) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Ingrese un monto válido',
      life: 3000
    });
    return;
  }

  if (!nuevoPago.value.metodo_pago) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Seleccione un método de pago',
      life: 3000
    });
    return;
  }

  guardandoPago.value = true;

  try {
    const datosPago = {
      inscripcion_id: nuevoPago.value.inscripcion_id,
      monto: nuevoPago.value.monto,
      metodo_pago: nuevoPago.value.metodo_pago,
      fecha_pago: nuevoPago.value.fecha_pago 
        ? formatDateToYMD(nuevoPago.value.fecha_pago) 
        : formatDateToYMD(new Date()),
      estado: nuevoPago.value.estado,
      observacion: nuevoPago.value.observacion
    };

    await pagoService.store(datosPago);

    toast.add({
      severity: 'success',
      summary: 'Pago Registrado',
      detail: 'El pago manual se ha registrado correctamente',
      life: 3000
    });

    cerrarDialogoNuevoPago();
    cargarPagos();

  } catch (error) {
    console.error('Error registrando pago manual:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo registrar el pago',
      life: 3000
    });
  } finally {
    guardandoPago.value = false;
  }
}

function cerrarDialogoNuevoPago() {
  dialogoNuevoPago.value = false;
  nuevoPago.value = {
    inscripcion_id: null,
    monto: null,
    metodo_pago: null,
    fecha_pago: new Date(),
    estado: 'pagado',
    observacion: ''
  };
}

function formatDateToYMD(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

function exportarExcel() {
  toast.add({
    severity: 'info',
    summary: 'Exportar Excel',
    detail: 'Funcionalidad de exportación en desarrollo',
    life: 3000
  });
}

function generarReportePDF() {
  toast.add({
    severity: 'info',
    summary: 'Generar Reporte PDF',
    detail: 'Funcionalidad de reporte PDF en desarrollo',
    life: 3000
  });
}

onMounted(() => {
  cargarPagos();
});
</script>

<style scoped>
.historial-pagos-container {
  padding: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* Reutilizar estilos similares a inscripciones */
.dashboard-cards {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
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
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
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

.stat-card:nth-child(1) { --card-color: #10b981; }
.stat-card:nth-child(2) { --card-color: #3b82f6; }
.stat-card:nth-child(3) { --card-color: #8b5cf6; }
.stat-card:nth-child(4) { --card-color: #f59e0b; }

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

.custom-toolbar {
  background: white !important;
  border-radius: 12px;
  padding: 1rem 1.5rem !important;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem !important;
}

.observacion-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.observacion-cell:hover {
  white-space: normal;
  overflow: visible;
  position: relative;
  z-index: 10;
  background: white;
  padding: 0.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.min-h-6rem {
  min-height: 6rem;
}

/* Responsive */
@media (max-width: 768px) {
  .historial-pagos-container {
    padding: 1rem;
  }

  .dashboard-cards {
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

@media (max-width: 576px) {
  .custom-toolbar {
    flex-direction: column;
    gap: 1rem;
  }

  .observacion-cell {
    max-width: 150px;
  }
}
</style>