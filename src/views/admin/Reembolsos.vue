<template>
  <div class="reembolsos-container">
    <!-- Dashboard de estadísticas -->
    <div class="dashboard-cards mb-4">
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Pendientes</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-clock stat-icon text-orange-500"></i>
                <span class="stat-value">{{ estadisticas.pendientes }}</span>
              </div>
              <div class="stat-trend">
                <small class="text-500">Por revisar</small>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Aprobados</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-check-circle stat-icon text-green-500"></i>
                <span class="stat-value">{{ estadisticas.aprobados }}</span>
              </div>
              <div class="stat-trend">
                <small class="text-500">Listos para pago</small>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Rechazados</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-ban stat-icon text-red-500"></i>
                <span class="stat-value">{{ estadisticas.rechazados }}</span>
              </div>
              <div class="stat-trend">
                <small class="text-500">No proceden</small>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Completados</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-check-square stat-icon text-blue-500"></i>
                <span class="stat-value">{{ estadisticas.completados }}</span>
              </div>
              <div class="stat-trend">
                <small class="text-500">Finalizados</small>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <Card class="mb-4">
      <template #title>
        <div class="flex align-items-center">
          <i class="pi pi-filter mr-2"></i>
          <span>Filtros</span>
        </div>
      </template>
      <template #content>
        <div class="flex justify-content-between align-items-center">
          <div class="flex gap-2 flex-wrap">
            <Button label="Todos" :class="['filter-btn', !filtroEstado ? 'filter-btn-active' : '']" 
                    @click="filtroEstado = null" />
            <Button label="Pendientes" :class="['filter-btn', filtroEstado === 'pendiente' ? 'filter-btn-active' : '']" 
                    @click="filtroEstado = 'pendiente'" />
            <Button label="Aprobados" :class="['filter-btn', filtroEstado === 'aprobado' ? 'filter-btn-active' : '']" 
                    @click="filtroEstado = 'aprobado'" />
            <Button label="Rechazados" :class="['filter-btn', filtroEstado === 'rechazado' ? 'filter-btn-active' : '']" 
                    @click="filtroEstado = 'rechazado'" />
            <Button label="Completados" :class="['filter-btn', filtroEstado === 'completado' ? 'filter-btn-active' : '']" 
                    @click="filtroEstado = 'completado'" />
          </div>
          
          <div class="flex align-items-center gap-3">
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <InputText v-model="busqueda" placeholder="Buscar..." class="search-input" />
            </span>
            <Button icon="pi pi-refresh" @click="cargarReembolsos" :loading="cargando" 
                    class="p-button-rounded p-button-text" v-tooltip="'Actualizar datos'" />
          </div>
        </div>
      </template>
    </Card>

    <!-- Toolbar -->
    <Toolbar class="mb-4 custom-toolbar">
      <template #start>
        <div class="flex align-items-center gap-2">
          <Button label="Nuevo Reembolso" icon="pi pi-plus" severity="warning" class="btn-gradient-warning"
                  @click="mostrarModalNuevaSolicitud" />
        </div>
      </template>

      <template #end>
        <div class="flex align-items-center gap-2">
          <span class="text-500 text-sm">
            Mostrando {{ reembolsosFiltrados.length }} de {{ reembolsos.length }} reembolsos
          </span>
        </div>
      </template>
    </Toolbar>

    <!-- DataTable Principal -->
    <Card>
      <template #title>
        <div class="flex align-items-center">
          <i class="pi pi-list text-primary mr-2"></i>
          <span>Lista de Reembolsos</span>
          <Tag :value="reembolsosFiltrados.length" severity="info" class="ml-2" />
        </div>
      </template>
      <template #content>
        <DataTable :value="reembolsosFiltrados" :paginator="true" :rows="10" :loading="cargando" class="p-datatable-sm"
          stripedRows showGridlines responsiveLayout="scroll" dataKey="id">
          
          <!-- ID -->
          <Column header="ID" style="width: 80px">
            <template #body="{ data }">
              <div class="font-mono font-bold">#{{ data.id }}</div>
              <div v-if="data.tipo === 'parcial'" class="mt-1">
                <Badge value="Parcial" severity="warning" size="small" />
              </div>
            </template>
          </Column>

          <!-- ESTUDIANTE -->
          <Column header="Estudiante">
            <template #body="{ data }">
              <div class="flex align-items-center">
                <Avatar v-if="data.estudiante?.nombres" 
                        :label="getIniciales(data.estudiante.nombres)" 
                        size="small" shape="circle" class="mr-3"
                        :class="getAvatarClass(data)" />
                <div class="flex-grow-1">
                  <div class="font-bold">
                    {{ data.estudiante?.nombres || 'N/A' }}
                  </div>
                  <div class="text-500 text-sm">
                    CI: {{ data.estudiante?.ci || 'No disponible' }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <!-- MONTO -->
          <Column header="Monto" style="width: 120px">
            <template #body="{ data }">
              <div class="text-right">
                <div class="font-bold text-lg" :class="getColorMonto(data)">
                  ${{ formatMonto(data.monto_reembolsado) }}
                </div>
                <small class="text-500">{{ data.porcentaje_reembolso }}% ({{ data.tipo }})</small>
              </div>
            </template>
          </Column>

          <!-- MÉTODO -->
          <Column header="Método" style="width: 100px">
            <template #body="{ data }">
              <Tag :value="getMetodoLabel(data.metodo)" 
                   :severity="getSeveridadMetodo(data.metodo)" 
                   class="font-bold" />
            </template>
          </Column>

          <!-- ESTADO -->
          <Column header="Estado" style="width: 120px">
            <template #body="{ data }">
              <div class="flex flex-column gap-1">
                <Tag :value="data.estado" :severity="getSeveridadEstado(data.estado)" class="font-bold" />
              </div>
            </template>
          </Column>

          <!-- FECHA -->
          <Column header="Fecha" style="width: 100px">
            <template #body="{ data }">
              <div class="date-cell">
                {{ formatFecha(data.fecha_solicitud) }}
              </div>
            </template>
          </Column>

          <!-- ACCIONES -->
          <Column header="Acciones" style="width: 150px">
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm action-btn view-btn"
                        @click="verDetalles(data)" v-tooltip="'Ver detalles'" />
                
                <!-- Aprobar solo si está pendiente -->
                <Button v-if="data.estado === 'pendiente'" 
                        icon="pi pi-check" 
                        class="p-button-rounded p-button-text p-button-sm action-btn approve-btn"
                        @click="aprobarReembolso(data)"
                        :disabled="aprobando" 
                        v-tooltip="'Aprobar reembolso'" />
                
                <!-- Rechazar solo si está pendiente -->
                <Button v-if="data.estado === 'pendiente'" 
                        icon="pi pi-times" 
                        class="p-button-rounded p-button-text p-button-sm action-btn reject-btn"
                        @click="rechazarReembolso(data)"
                        :disabled="rechazando"
                        v-tooltip="'Rechazar reembolso'" />
                
                <!-- Completar solo si está aprobado -->
                <Button v-if="data.estado === 'aprobado'" 
                        icon="pi pi-check-square" 
                        class="p-button-rounded p-button-text p-button-sm action-btn complete-btn"
                        @click="completarReembolso(data)"
                        :disabled="completando"
                        v-tooltip="'Marcar como completado'" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- MODAL NUEVO REEMBOLSO -->
    <Dialog v-model:visible="modalNuevo" header="Nuevo Reembolso" 
            :modal="true" :style="{ width: '500px' }" :closable="false">
      
      <!-- Paso 1: Buscar estudiante y pago -->
      <div v-if="paso === 1" class="mb-4">
        <div class="mb-3">
          <label class="block mb-2 font-medium">Buscar estudiante:</label>
          <InputText v-model="buscarEstudiante" placeholder="Nombre o CI" 
                    class="w-full" @input="onBuscarEstudianteInput" />
        </div>
        
        <!-- Resultados de búsqueda de estudiantes -->
        <div v-if="buscandoEstudiantes" class="text-center p-4">
          <i class="pi pi-spin pi-spinner text-2xl"></i>
          <p class="mt-2">Buscando estudiantes...</p>
        </div>
        
        <div v-else-if="estudiantes.length > 0" class="border-round border-1" style="max-height: 200px; overflow-y: auto;">
          <div v-for="est in estudiantes" :key="est.id" 
               class="p-3 hover:bg-gray-100 cursor-pointer border-bottom-1 surface-border"
               @click="seleccionarEstudiante(est)"
               :class="{'bg-blue-50': estudianteSeleccionado?.id === est.id}">
            <div class="font-bold">{{ est.nombres }} {{ est.apellidos }}</div>
            <div class="text-500 text-sm">CI: {{ est.ci }}</div>
          </div>
        </div>
        
        <!-- Resultados de búsqueda de pagos -->
        <div v-if="estudianteSeleccionado && !cargandoPagos">
          <div class="mt-4 mb-2 font-medium">Pagos del estudiante:</div>
          
          <div v-if="pagos.length > 0" class="border-round border-1" style="max-height: 150px; overflow-y: auto;">
            <div v-for="pago in pagos" :key="pago.id" 
                 class="p-3 hover:bg-gray-100 cursor-pointer border-bottom-1 surface-border"
                 @click="seleccionarPago(pago)"
                 :class="{'bg-green-50': pagoSeleccionado?.id === pago.id}">
              <div class="flex justify-content-between">
                <div class="font-bold">${{ formatMonto(pago.monto) }}</div>
                <Tag :value="pago.estado" :severity="getSeveridadPago(pago.estado)" />
              </div>
              <div class="text-500 text-sm">{{ pago.concepto || 'Pago de inscripción' }}</div>
              <div class="text-500 text-xs">{{ formatFecha(pago.fecha_pago) }}</div>
            </div>
          </div>
          
          <div v-else class="text-center p-3 border-round border-1 bg-yellow-50">
            <i class="pi pi-exclamation-triangle text-yellow-500"></i>
            <p class="mt-1 text-sm">Este estudiante no tiene pagos disponibles</p>
          </div>
        </div>
        
        <div v-if="cargandoPagos" class="text-center p-4">
          <i class="pi pi-spin pi-spinner text-2xl"></i>
          <p class="mt-2">Cargando pagos...</p>
        </div>
      </div>

      <!-- Paso 2: Datos del reembolso -->
      <div v-if="paso === 2 && estudianteSeleccionado && pagoSeleccionado" class="mb-4">
        <div class="mb-4 p-3 bg-blue-50 border-round">
          <div class="font-bold">{{ estudianteSeleccionado.nombres }} {{ estudianteSeleccionado.apellidos }}</div>
          <div class="text-500">CI: {{ estudianteSeleccionado.ci }}</div>
          <div class="mt-2 font-bold">Pago seleccionado: ${{ formatMonto(pagoSeleccionado.monto) }}</div>
          <div class="text-500 text-sm">{{ pagoSeleccionado.concepto || 'Pago de inscripción' }}</div>
        </div>

        <div class="grid">
          <div class="col-12 md:col-6">
            <label class="block mb-2 font-medium">Porcentaje:</label>
            <InputNumber v-model="nuevoReembolso.porcentaje_reembolso" 
                        :min="1" :max="100" 
                        suffix="%" class="w-full" 
                        @update:modelValue="calcularMontoReembolsado" />
          </div>
          <div class="col-12 md:col-6">
            <label class="block mb-2 font-medium">Monto a reembolsar:</label>
            <div class="p-inputgroup">
              <span class="p-inputgroup-addon">$</span>
              <InputNumber v-model="nuevoReembolso.monto_reembolsado" 
                          :min="0" :max="pagoSeleccionado.monto"
                          class="w-full" disabled />
            </div>
          </div>
        </div>

        <div class="mb-3">
          <label class="block mb-2 font-medium">Tipo:</label>
          <Dropdown v-model="nuevoReembolso.tipo" :options="tiposReembolso" 
                   optionLabel="label" optionValue="value" class="w-full" />
        </div>

        <div class="mb-3">
          <label class="block mb-2 font-medium">Método:</label>
          <Dropdown v-model="nuevoReembolso.metodo" :options="metodos" 
                   optionLabel="label" optionValue="value" class="w-full" />
        </div>

        <div class="mb-3">
          <label class="block mb-2 font-medium">Motivo:</label>
          <Textarea v-model="nuevoReembolso.motivo" rows="3" class="w-full" 
                   placeholder="Razón del reembolso..." required />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-content-between w-full">
          <Button label="Cancelar" severity="secondary" @click="cerrarModal" />
          <div class="flex gap-2">
            <Button v-if="paso > 1" label="Atrás" severity="secondary" 
                    @click="paso--" />
            <Button v-if="paso < 2" label="Siguiente" severity="warning" 
                    @click="siguientePaso" :disabled="!puedeContinuar" />
            <Button v-if="paso === 2" label="Crear Reembolso" severity="warning" 
                    @click="crearReembolso" :loading="creando" :disabled="!formValido" />
          </div>
        </div>
      </template>
    </Dialog>

    <!-- MODAL RECHAZAR REEMBOLSO -->
    <Dialog v-model:visible="modalRechazar" header="Rechazar Reembolso" 
            :modal="true" :style="{ width: '400px' }">
      <div v-if="reembolsoARechazar">
        <p class="mb-3">¿Rechazar el reembolso #{{ reembolsoARechazar.id }}?</p>
        <label class="block mb-2 font-medium">Razón del rechazo:</label>
        <Textarea v-model="razonRechazo" rows="3" class="w-full" 
                 placeholder="Indique la razón del rechazo..." required />
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="modalRechazar = false" />
        <Button label="Rechazar" severity="danger" @click="confirmarRechazar" 
                :disabled="!razonRechazo.trim()" />
      </template>
    </Dialog>

    <!-- MODAL COMPLETAR REEMBOLSO -->
    <Dialog v-model:visible="modalCompletar" header="Completar Reembolso" 
            :modal="true" :style="{ width: '400px' }">
      <div v-if="reembolsoACompletar">
        <p>¿Marcar como completado el reembolso #{{ reembolsoACompletar.id }}?</p>
        <p class="font-bold mt-2">Estudiante: {{ reembolsoACompletar.estudiante?.nombres }}</p>
        <p class="font-bold">Monto: ${{ formatMonto(reembolsoACompletar.monto_reembolsado) }}</p>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="modalCompletar = false" />
        <Button label="Completar" severity="success" @click="confirmarCompletar" />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import ReembolsoService from '@/services/reembolso.service';
import EstudianteService from '@/services/estudiante.service';
import PagoService from '@/services/pago.service';

const toast = useToast();

// ========== ESTADOS PRINCIPALES ==========
const reembolsos = ref([]);
const cargando = ref(false);
const filtroEstado = ref(null);
const busqueda = ref('');

// ========== MODALES ==========
const modalNuevo = ref(false);
const modalRechazar = ref(false);
const modalCompletar = ref(false);

// ========== NUEVO REEMBOLSO ==========
const paso = ref(1);
const buscarEstudiante = ref('');
const estudiantes = ref([]);
const buscandoEstudiantes = ref(false);
const cargandoPagos = ref(false);
const estudianteSeleccionado = ref(null);
const pagos = ref([]);
const pagoSeleccionado = ref(null);
const creando = ref(false);

const nuevoReembolso = ref({
  pago_id: null,
  estudiante_id: null,
  porcentaje_reembolso: 100,
  monto_reembolsado: 0,
  tipo: 'total',
  metodo: 'efectivo',
  motivo: ''
});

// ========== ACCIONES ==========
const reembolsoARechazar = ref(null);
const reembolsoACompletar = ref(null);
const razonRechazo = ref('');
const aprobando = ref(false);
const rechazando = ref(false);
const completando = ref(false);

// ========== OPCIONES ==========
const metodos = ref([
  { label: '💰 Efectivo', value: 'efectivo' },
  { label: '🏦 Transferencia', value: 'transferencia' },
  { label: '💳 Tarjeta Crédito', value: 'tarjeta_credito' }
]);

const tiposReembolso = ref([
  { label: 'Total (100%)', value: 'total' },
  { label: 'Parcial', value: 'parcial' }
]);

// ========== ESTADÍSTICAS ==========
const estadisticas = ref({
  pendientes: 0,
  aprobados: 0,
  rechazados: 0,
  completados: 0,
  total: 0
});

// ========== COMPUTED ==========
const reembolsosFiltrados = computed(() => {
  let filtrados = reembolsos.value;

  if (filtroEstado.value) {
    filtrados = filtrados.filter(r => r.estado === filtroEstado.value);
  }

  if (busqueda.value.trim()) {
    const search = busqueda.value.toLowerCase();
    filtrados = filtrados.filter(r => {
      const estudiante = r.estudiante || {};
      return (
        estudiante.nombres?.toLowerCase().includes(search) ||
        estudiante.ci?.toString().includes(search) ||
        r.motivo?.toLowerCase().includes(search)
      );
    });
  }

  return filtrados;
});

const puedeContinuar = computed(() => {
  if (paso.value === 1) {
    return estudianteSeleccionado.value && pagoSeleccionado.value;
  }
  return true;
});

const formValido = computed(() => {
  return nuevoReembolso.value.motivo.trim().length > 0 && 
         nuevoReembolso.value.monto_reembolsado > 0;
});

// ========== WATCHERS ==========
watch(() => nuevoReembolso.value.porcentaje_reembolso, (newVal) => {
  if (pagoSeleccionado.value) {
    calcularMontoReembolsado();
  }
});

// ========== FUNCIONES PRINCIPALES ==========
async function cargarReembolsos() {
  cargando.value = true;
  try {
    const response = await ReembolsoService.index();
    
    if (response.data && response.data.success) {
      reembolsos.value = response.data.data?.data || response.data.data || [];
      calcularEstadisticas();
      
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `${reembolsos.value.length} reembolsos cargados`,
        life: 3000
      });
    } else {
      throw new Error('Respuesta inválida del servidor');
    }
  } catch (error) {
    console.error('Error cargando reembolsos:', error);
    
    let mensajeError = 'Error al cargar reembolsos';
    if (error.response?.status === 500) {
      mensajeError = 'Error en el servidor. Verifica los logs.';
    } else if (error.message) {
      mensajeError = error.message;
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensajeError,
      life: 4000
    });
    
    // Cargar datos de ejemplo si hay error (solo para desarrollo)
    if (import.meta.env.DEV) {
      cargarDatosEjemplo();
    }
  } finally {
    cargando.value = false;
  }
}

function cargarDatosEjemplo() {
  reembolsos.value = [
    {
      id: 1,
      estudiante: { nombres: 'Juan Pérez', ci: '1234567' },
      monto_reembolsado: 100.00,
      porcentaje_reembolso: 50,
      tipo: 'parcial',
      metodo: 'efectivo',
      estado: 'pendiente',
      motivo: 'Cambio de horario',
      fecha_solicitud: new Date().toISOString()
    },
    {
      id: 2,
      estudiante: { nombres: 'María García', ci: '7654321' },
      monto_reembolsado: 200.00,
      porcentaje_reembolso: 100,
      tipo: 'total',
      metodo: 'transferencia',
      estado: 'aprobado',
      motivo: 'Retiro del curso',
      fecha_solicitud: new Date().toISOString()
    }
  ];
  calcularEstadisticas();
}

function calcularEstadisticas() {
  const estados = {
    pendientes: 'pendiente',
    aprobados: 'aprobado', 
    rechazados: 'rechazado',
    completados: 'completado'
  };

  for (const [key, estado] of Object.entries(estados)) {
    estadisticas.value[key] = reembolsos.value.filter(r => r.estado === estado).length;
  }
  
  estadisticas.value.total = reembolsos.value.length;
}

// ========== FUNCIONES NUEVO REEMBOLSO ==========
function mostrarModalNuevaSolicitud() {
  modalNuevo.value = true;
  paso.value = 1;
  resetearFormulario();
}

// Debouncer para búsqueda
let timeoutId = null;
function onBuscarEstudianteInput() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    buscarEstudiantes();
  }, 500);
}

async function buscarEstudiantes() {
  if (!buscarEstudiante.value.trim()) {
    estudiantes.value = [];
    return;
  }
  
  buscandoEstudiantes.value = true;
  
  try {
    const response = await EstudianteService.index(1, 10, buscarEstudiante.value, false);
    
    if (response.data && response.data.success) {
      estudiantes.value = response.data.data?.data || response.data.data || [];
    } else {
      estudiantes.value = [];
    }
  } catch (error) {
    console.error('Error buscando estudiantes:', error);
    estudiantes.value = [];
  } finally {
    buscandoEstudiantes.value = false;
  }
}

async function seleccionarEstudiante(estudiante) {
  estudianteSeleccionado.value = estudiante;
  nuevoReembolso.value.estudiante_id = estudiante.id;
  pagos.value = [];
  pagoSeleccionado.value = null;
  
  // Cargar pagos del estudiante
  cargandoPagos.value = true;
  
  try {
    const response = await PagoService.porEstudiante(estudiante.id);
    
    if (response.data && response.data.success) {
      // Filtrar solo pagos completados que puedan ser reembolsados
      pagos.value = (response.data.data?.data || response.data.data || [])
        .filter(pago => pago.estado === 'pagado' || pago.estado === 'completado');
      
      if (pagos.value.length === 0) {
        toast.add({
          severity: 'warn',
          summary: 'Sin pagos disponibles',
          detail: 'Este estudiante no tiene pagos completados para reembolsar',
          life: 3000
        });
      }
    } else {
      pagos.value = [];
    }
  } catch (error) {
    console.error('Error cargando pagos:', error);
    pagos.value = [];
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los pagos del estudiante',
      life: 3000
    });
  } finally {
    cargandoPagos.value = false;
  }
}

function seleccionarPago(pago) {
  pagoSeleccionado.value = pago;
  nuevoReembolso.value.pago_id = pago.id;
  nuevoReembolso.value.monto_original = pago.monto;
  
  // Calcular monto inicial
  calcularMontoReembolsado();
}

function calcularMontoReembolsado() {
  if (!pagoSeleccionado.value) return;
  
  const porcentaje = nuevoReembolso.value.porcentaje_reembolso || 100;
  const montoOriginal = pagoSeleccionado.value.monto;
  const montoReembolsado = (montoOriginal * porcentaje) / 100;
  
  nuevoReembolso.value.monto_reembolsado = parseFloat(montoReembolsado.toFixed(2));
  
  // Determinar tipo basado en porcentaje
  nuevoReembolso.value.tipo = porcentaje === 100 ? 'total' : 'parcial';
}

function siguientePaso() {
  if (paso.value === 1 && estudianteSeleccionado.value && pagoSeleccionado.value) {
    paso.value = 2;
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Faltan datos',
      detail: 'Debe seleccionar un estudiante y un pago para continuar',
      life: 3000
    });
  }
}

async function crearReembolso() {
  if (!formValido.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Por favor complete todos los campos requeridos',
      life: 3000
    });
    return;
  }

  creando.value = true;
  
  try {
    // Agregar fecha de solicitud
    const datosCompletos = {
      ...nuevoReembolso.value,
      fecha_solicitud: new Date().toISOString()
    };
    
    const response = await ReembolsoService.store(datosCompletos);
    
    if (response.data && response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Reembolso creado exitosamente',
        life: 4000
      });
      
      cerrarModal();
      await cargarReembolsos();
    } else {
      throw new Error(response.data.message || 'Error al crear reembolso');
    }
  } catch (error) {
    console.error('Error creando reembolso:', error);
    
    let mensaje = 'Error al crear reembolso';
    if (error.response?.data?.message) {
      mensaje = error.response.data.message;
    } else if (error.message) {
      mensaje = error.message;
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensaje,
      life: 4000
    });
  } finally {
    creando.value = false;
  }
}

function resetearFormulario() {
  estudiantes.value = [];
  pagos.value = [];
  estudianteSeleccionado.value = null;
  pagoSeleccionado.value = null;
  buscarEstudiante.value = '';
  razonRechazo.value = '';
  buscandoEstudiantes.value = false;
  cargandoPagos.value = false;
  
  nuevoReembolso.value = {
    pago_id: null,
    estudiante_id: null,
    porcentaje_reembolso: 100,
    monto_reembolsado: 0,
    tipo: 'total',
    metodo: 'efectivo',
    motivo: ''
  };
}

function cerrarModal() {
  modalNuevo.value = false;
  paso.value = 1;
  resetearFormulario();
}

// ========== ACCIONES SOBRE REEMBOLSOS ==========
async function aprobarReembolso(reembolso) {
  if (!confirm(`¿Está seguro de aprobar el reembolso #${reembolso.id} por $${formatMonto(reembolso.monto_reembolsado)}?`)) {
    return;
  }
  
  aprobando.value = true;
  
  try {
    const response = await ReembolsoService.aprobar(reembolso.id);
    
    if (response.data && response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Aprobado',
        detail: 'Reembolso aprobado correctamente',
        life: 3000
      });
      
      await cargarReembolsos();
    } else {
      throw new Error(response.data.message || 'Error al aprobar');
    }
  } catch (error) {
    console.error('Error aprobando reembolso:', error);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo aprobar el reembolso',
      life: 3000
    });
  } finally {
    aprobando.value = false;
  }
}

function rechazarReembolso(reembolso) {
  reembolsoARechazar.value = reembolso;
  razonRechazo.value = '';
  modalRechazar.value = true;
}

async function confirmarRechazar() {
  if (!razonRechazo.value.trim()) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Debe ingresar una razón para rechazar',
      life: 3000
    });
    return;
  }
  
  rechazando.value = true;
  
  try {
    const response = await ReembolsoService.rechazar(reembolsoARechazar.value.id, {
      razon_rechazo: razonRechazo.value
    });
    
    if (response.data && response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Rechazado',
        detail: 'Reembolso rechazado correctamente',
        life: 3000
      });
      
      modalRechazar.value = false;
      razonRechazo.value = '';
      await cargarReembolsos();
    } else {
      throw new Error(response.data.message || 'Error al rechazar');
    }
  } catch (error) {
    console.error('Error rechazando reembolso:', error);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo rechazar el reembolso',
      life: 3000
    });
  } finally {
    rechazando.value = false;
  }
}

function completarReembolso(reembolso) {
  if (!confirm(`¿Marcar como completado el reembolso #${reembolso.id}?`)) {
    return;
  }
  
  reembolsoACompletar.value = reembolso;
  modalCompletar.value = true;
}

async function confirmarCompletar() {
  completando.value = true;
  
  try {
    const response = await ReembolsoService.completar(reembolsoACompletar.value.id);
    
    if (response.data && response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Completado',
        detail: 'Reembolso completado correctamente',
        life: 3000
      });
      
      modalCompletar.value = false;
      await cargarReembolsos();
    } else {
      throw new Error(response.data.message || 'Error al completar');
    }
  } catch (error) {
    console.error('Error completando reembolso:', error);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo completar el reembolso',
      life: 3000
    });
  } finally {
    completando.value = false;
  }
}

function verDetalles(reembolso) {
  toast.add({
    severity: 'info',
    summary: 'Detalles del Reembolso',
    detail: `ID: ${reembolso.id} | Estudiante: ${reembolso.estudiante?.nombres || 'N/A'} | Monto: $${formatMonto(reembolso.monto_reembolsado)} | Estado: ${reembolso.estado}`,
    life: 5000
  });
}

// ========== FUNCIONES AUXILIARES ==========
function getIniciales(nombre) {
  if (!nombre) return '??';
  const nombres = nombre.split(' ');
  return (nombres[0][0] + (nombres[1] ? nombres[1][0] : nombres[0][1])).toUpperCase();
}

function formatMonto(monto) {
  if (!monto) return '0.00';
  return parseFloat(monto).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatFecha(fecha) {
  if (!fecha) return '--';
  return new Date(fecha).toLocaleDateString('es-ES');
}

function getSeveridadEstado(estado) {
  const map = {
    pendiente: 'warning',
    aprobado: 'success',
    rechazado: 'danger',
    completado: 'info'
  };
  return map[estado] || 'info';
}

function getSeveridadPago(estado) {
  const map = {
    pagado: 'success',
    pendiente: 'warning',
    anulado: 'danger',
    completado: 'info'
  };
  return map[estado] || 'info';
}

function getSeveridadMetodo(metodo) {
  const map = {
    efectivo: 'success',
    transferencia: 'info',
    tarjeta_credito: 'warning'
  };
  return map[metodo] || 'info';
}

function getMetodoLabel(metodo) {
  const map = {
    efectivo: '💰 Efectivo',
    transferencia: '🏦 Transferencia',
    tarjeta_credito: '💳 Tarjeta Crédito',
    devolucion_tarjeta: '↩️ Devolución Tarjeta',
    credito_futuro: '📅 Crédito Futuro'
  };
  return map[metodo] || metodo;
}

function getAvatarClass(reembolso) {
  const colores = [
    'avatar-gradient-primary',
    'avatar-gradient-success',
    'avatar-gradient-warning',
    'avatar-gradient-danger'
  ];

  const estudiante = reembolso.estudiante;
  if (!estudiante) return colores[0];

  const nombreCompleto = estudiante.nombres || '';
  let hash = 0;
  for (let i = 0; i < nombreCompleto.length; i++) {
    hash = nombreCompleto.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colores.length;
  return colores[index];
}

function getColorMonto(reembolso) {
  if (reembolso.estado === 'completado') return 'text-green-600';
  if (reembolso.estado === 'aprobado') return 'text-blue-600';
  if (reembolso.estado === 'pendiente') return 'text-yellow-600';
  if (reembolso.estado === 'rechazado') return 'text-red-600';
  return 'text-orange-600';
}

// ========== INICIALIZACIÓN ==========
onMounted(() => {
  cargarReembolsos();
});
</script>

<style scoped>
.reembolsos-container {
  padding: 1.5rem;
  max-width: 1800px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* Dashboard Cards */
.dashboard-cards {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 40px rgba(31, 38, 135, 0.1);
}

.stat-card {
  border-radius: 16px;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  position: relative;
  overflow: hidden;
  background: white;
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, var(--card-color), transparent);
  opacity: 0.9;
}

.stat-card:nth-child(1) {
  --card-color: #f59e0b;
}

.stat-card:nth-child(2) {
  --card-color: #10b981;
}

.stat-card:nth-child(3) {
  --card-color: #ef4444;
}

.stat-card:nth-child(4) {
  --card-color: #3b82f6;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.stat-icon {
  font-size: 3rem;
  opacity: 0.9;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--card-color), #6b7280);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-trend {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* Toolbar */
.custom-toolbar {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
  border-radius: 16px;
  padding: 1.25rem 1.75rem !important;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem !important;
  backdrop-filter: blur(10px);
}

/* DataTable */
:deep(.p-datatable) {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

:deep(.p-datatable-thead > tr > th) {
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9) !important;
  color: #374151 !important;
  font-weight: 700 !important;
  padding: 1.25rem 1rem !important;
  border-bottom: 2px solid #e5e7eb !important;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

:deep(.p-datatable-tbody > tr) {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: linear-gradient(to right, rgba(245, 158, 11, 0.05), rgba(245, 158, 11, 0.02)) !important;
  transform: scale(1.002);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 1.25rem 1rem !important;
  border-color: #f3f4f6 !important;
  vertical-align: middle;
}

/* Observación cell */
.observacion-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.observacion-cell:hover {
  white-space: normal;
  overflow: visible;
  position: relative;
  z-index: 100;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  transform: scale(1.05);
}

/* Estilos para avatares con gradiente */
.avatar-gradient-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.avatar-gradient-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.avatar-gradient-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.avatar-gradient-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

/* Estilos para tooltips personalizados */
:deep(.p-tooltip .p-tooltip-text) {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* Estilos para botones con gradiente */
.btn-gradient-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  border: none !important;
  color: white !important;
}

.btn-gradient-warning:hover {
  background: linear-gradient(135deg, #d97706, #b45309) !important;
}

/* Efectos de hover para botones con gradiente */
.btn-gradient-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
}

.btn-gradient-success:hover {
  background: linear-gradient(135deg, #059669, #047857);
}

.btn-gradient-warning:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
}

.btn-gradient-danger:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

/* Botones de filtro */
.filter-btn {
  border-radius: 20px !important;
  padding: 0.5rem 1.25rem !important;
  transition: all 0.2s ease !important;
}

.filter-btn-active {
  background: #f59e0b !important;
  color: white !important;
  border-color: #f59e0b !important;
  font-weight: 600 !important;
}

.search-input {
  border-radius: 20px !important;
  padding-left: 2.5rem !important;
}

/* Botones de acción */
.action-btn {
  width: 2.25rem;
  height: 2.25rem;
}

.view-btn {
  color: #3b82f6 !important;
}

.view-btn:hover {
  background: rgba(59, 130, 246, 0.1) !important;
}

.approve-btn {
  color: #10b981 !important;
}

.approve-btn:hover {
  background: rgba(16, 185, 129, 0.1) !important;
}

.reject-btn {
  color: #ef4444 !important;
}

.reject-btn:hover {
  background: rgba(239, 68, 68, 0.1) !important;
}

.complete-btn {
  color: #3b82f6 !important;
}

.complete-btn:hover {
  background: rgba(59, 130, 246, 0.1) !important;
}

.date-cell {
  color: #6b7280;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .reembolsos-container {
    padding: 1rem;
  }
  
  .dashboard-cards {
    padding: 1rem;
  }
  
  .stat-icon {
    font-size: 2rem;
  }
  
  .stat-value {
    font-size: 1.75rem;
  }
  
  .custom-toolbar {
    padding: 1rem !important;
  }
  
  .filter-btn {
    padding: 0.5rem 1rem !important;
    font-size: 0.875rem;
  }
}

@media (max-width: 576px) {
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .stat-icon {
    font-size: 2.5rem;
  }
  
  .custom-toolbar .flex {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start !important;
  }
}
</style>