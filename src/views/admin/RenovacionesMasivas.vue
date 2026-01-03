<template>
  <div class="renovaciones-masivas-container">
    <!-- Filtros iniciales -->
    <div class="card mb-4">
      <h5 class="mb-3">Filtrar Inscripciones para Renovación</h5>
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-3">
          <div class="field">
            <label for="sucursal">Sucursal</label>
            <Dropdown id="sucursal" v-model="filtros.sucursal_id" :options="sucursales" 
                      optionLabel="nombre" optionValue="id" placeholder="Todas" 
                      class="w-full" @change="filtrarInscripciones" />
          </div>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <div class="field">
            <label for="modalidad">Modalidad</label>
            <Dropdown id="modalidad" v-model="filtros.modalidad_id" :options="modalidades" 
                      optionLabel="nombre" optionValue="id" placeholder="Todas" 
                      class="w-full" @change="filtrarInscripciones" />
          </div>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <div class="field">
            <label for="estado">Estado de Vencimiento</label>
            <Dropdown id="estado" v-model="filtros.estado_vencimiento" :options="estadosVencimiento" 
                      optionLabel="label" optionValue="value" placeholder="Seleccionar" 
                      class="w-full" @change="filtrarInscripciones" />
          </div>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <div class="field">
            <label for="fecha">Vencen antes de</label>
            <Calendar id="fecha" v-model="filtros.fecha_limite" dateFormat="dd/mm/yy" 
                      :showIcon="true" placeholder="Seleccionar fecha" 
                      class="w-full" @date-select="filtrarInscripciones" />
          </div>
        </div>
      </div>
      
      <div class="flex justify-content-end gap-2 mt-3">
        <Button label="Limpiar Filtros" severity="secondary" @click="limpiarFiltros" />
        <Button label="Buscar" icon="pi pi-search" @click="cargarInscripcionesParaRenovar" />
      </div>
    </div>

    <!-- Resultados -->
    <div v-if="inscripcionesSeleccionables.length > 0" class="card">
      <div class="flex justify-content-between align-items-center mb-3">
        <h5>Inscripciones para Renovar ({{ inscripcionesSeleccionadas.length }} seleccionadas)</h5>
        <div class="flex gap-2">
          <Button label="Seleccionar Todas" icon="pi pi-check-square" severity="secondary" 
                  @click="seleccionarTodas" />
          <Button label="Deseleccionar Todas" icon="pi pi-times-circle" severity="secondary" 
                  @click="deseleccionarTodas" />
        </div>
      </div>

      <DataTable :value="inscripcionesSeleccionables" :paginator="true" :rows="10" 
                 :selection="inscripcionesSeleccionadas" selectionMode="checkbox" 
                 dataKey="id" @row-select="onRowSelect" @row-unselect="onRowUnselect">
        
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        
        <Column header="Estudiante">
          <template #body="slotProps">
            <div class="flex align-items-center">
              <Avatar :label="getIniciales(slotProps.data.estudiante)" size="small" 
                      class="mr-2" shape="circle" />
              <div>
                <div class="font-medium">{{ slotProps.data.estudiante?.nombres_completos }}</div>
                <small class="text-500">{{ slotProps.data.estudiante?.telefono }}</small>
              </div>
            </div>
          </template>
        </Column>
        
        <Column header="Modalidad">
          <template #body="slotProps">
            <div class="flex flex-column">
              <span class="font-medium">{{ slotProps.data.modalidad?.nombre }}</span>
              <small class="text-500">${{ slotProps.data.modalidad?.precio_mensual }}/mes</small>
            </div>
          </template>
        </Column>
        
        <Column header="Vencimiento">
          <template #body="slotProps">
            <div class="flex flex-column">
              <span :class="getColorVencimiento(slotProps.data.fecha_fin)">
                {{ formatFecha(slotProps.data.fecha_fin) }}
              </span>
              <small>{{ getDiasRestantes(slotProps.data.fecha_fin) }}</small>
            </div>
          </template>
        </Column>
        
        <Column header="Clases Restantes">
          <template #body="slotProps">
            <div class="flex flex-column align-items-center">
              <span class="font-bold" :class="{
                'text-green-500': slotProps.data.clases_restantes > 5,
                'text-yellow-500': slotProps.data.clases_restantes > 0 && slotProps.data.clases_restantes <= 5,
                'text-red-500': slotProps.data.clases_restantes === 0
              }">
                {{ slotProps.data.clases_restantes }}
              </span>
              <ProgressBar :value="(slotProps.data.clases_restantes / slotProps.data.clases_totales) * 100" 
                          :showValue="false" style="height: 4px; width: 80px" />
            </div>
          </template>
        </Column>
        
        <Column header="Acción Individual">
          <template #body="slotProps">
            <Button label="Renovar" icon="pi pi-refresh" class="p-button-sm" 
                    @click="renovarIndividual(slotProps.data)" 
                    :disabled="slotProps.data.clases_restantes > 10" />
          </template>
        </Column>
      </DataTable>

      <!-- Configuración de renovación -->
      <Divider />
      
      <div class="configuracion-renovacion mt-4">
        <h5 class="mb-3">Configuración de Renovación</h5>
        
        <div class="grid">
          <div class="col-12 md:col-6 lg:col-3">
            <div class="field">
              <label for="duracion">Duración (meses)</label>
              <InputNumber id="duracion" v-model="configRenovacion.duracion_meses" 
                          :min="1" :max="12" :showButtons="true" class="w-full" />
            </div>
          </div>
          
          <div class="col-12 md:col-6 lg:col-3">
            <div class="field">
              <label for="fecha_inicio">Fecha Inicio</label>
              <Calendar id="fecha_inicio" v-model="configRenovacion.fecha_inicio" 
                        dateFormat="dd/mm/yy" :showIcon="true" class="w-full" />
            </div>
          </div>
          
          <div class="col-12 md:col-6 lg:col-3">
            <div class="field">
              <label for="descuento">Descuento (%)</label>
              <InputNumber id="descuento" v-model="configRenovacion.descuento_porcentaje" 
                          :min="0" :max="50" suffix="%" class="w-full" />
            </div>
          </div>
          
          <div class="col-12 md:col-6 lg:col-3">
            <div class="field">
              <label for="pago_anticipado">Pago Anticipado</label>
              <Dropdown id="pago_anticipado" v-model="configRenovacion.pago_anticipado" 
                        :options="opcionesPago" class="w-full" />
            </div>
          </div>
          
          <div class="col-12">
            <div class="field">
              <label for="observaciones">Observaciones</label>
              <Textarea id="observaciones" v-model="configRenovacion.observaciones" 
                        rows="2" class="w-full" placeholder="Observaciones para todas las renovaciones..." />
            </div>
          </div>
        </div>
        
        <!-- Resumen de costo -->
        <div class="resumen-costo card mt-3 p-3" v-if="inscripcionesSeleccionadas.length > 0">
          <h6 class="mb-2">Resumen de Renovación</h6>
          <div class="grid">
            <div class="col-6 md:col-3">
              <div class="info-item">
                <small class="text-500">Inscripciones</small>
                <div class="font-bold">{{ inscripcionesSeleccionadas.length }}</div>
              </div>
            </div>
            <div class="col-6 md:col-3">
              <div class="info-item">
                <small class="text-500">Total Original</small>
                <div class="font-bold">${{ totalOriginal.toFixed(2) }}</div>
              </div>
            </div>
            <div class="col-6 md:col-3">
              <div class="info-item">
                <small class="text-500">Descuento</small>
                <div class="font-bold text-green-500">-${{ totalDescuento.toFixed(2) }}</div>
              </div>
            </div>
            <div class="col-6 md:col-3">
              <div class="info-item">
                <small class="text-500">Total Final</small>
                <div class="font-bold text-primary">${{ totalFinal.toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-content-end gap-2 mt-4">
          <Button label="Cancelar" severity="secondary" @click="$emit('cancel')" />
          <Button label="Generar Previsualización" icon="pi pi-eye" severity="info" 
                  @click="generarPrevisualizacion" />
          <Button label="Procesar Renovaciones" icon="pi pi-check" severity="success" 
                  :disabled="inscripcionesSeleccionadas.length === 0 || procesando" 
                  @click="procesarRenovaciones" :loading="procesando" />
        </div>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else-if="cargando" class="text-center py-6">
      <ProgressSpinner />
      <p class="mt-3 text-500">Buscando inscripciones...</p>
    </div>
    
    <div v-else-if="cargadoSinResultados" class="text-center py-6">
      <i class="pi pi-info-circle text-3xl text-500 mb-3"></i>
      <h5 class="text-500">No se encontraron inscripciones para renovar</h5>
      <p class="text-500">Ajusta los filtros o inténtalo más tarde</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

// Services
import inscripcionService from '@/services/inscripcion.service';
import sucursalService from '@/services/sucursal.service';
import modalidadService from '@/services/modalidad.service';

// Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Avatar from 'primevue/avatar';
import ProgressBar from 'primevue/progressbar';
import Divider from 'primevue/divider';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';

const emit = defineEmits(['renovaciones-completadas', 'cancel']);
const toast = useToast();
const confirm = useConfirm();

// Estados
const sucursales = ref([]);
const modalidades = ref([]);
const inscripcionesSeleccionables = ref([]);
const inscripcionesSeleccionadas = ref([]);
const cargando = ref(false);
const procesando = ref(false);
const cargadoSinResultados = ref(false);

// Filtros
const filtros = ref({
  sucursal_id: null,
  modalidad_id: null,
  estado_vencimiento: 'proximas_vencer',
  fecha_limite: null
});

// Configuración de renovación
const configRenovacion = ref({
  duracion_meses: 1,
  fecha_inicio: new Date(),
  descuento_porcentaje: 0,
  pago_anticipado: false,
  observaciones: ''
});

// Opciones
const estadosVencimiento = [
  { label: 'Próximas a vencer (7 días)', value: 'proximas_vencer' },
  { label: 'Vencidas', value: 'vencidas' },
  { label: 'Todas las activas', value: 'activas' }
];

const opcionesPago = [
  { label: 'Al contado', value: 'contado' },
  { label: 'Crédito', value: 'credito' },
  { label: 'Transferencia', value: 'transferencia' }
];

// Computed
const totalOriginal = computed(() => {
  return inscripcionesSeleccionadas.value.reduce((total, insc) => {
    return total + (insc.modalidad?.precio_mensual || 0);
  }, 0);
});

const totalDescuento = computed(() => {
  return totalOriginal.value * (configRenovacion.value.descuento_porcentaje / 100);
});

const totalFinal = computed(() => {
  return totalOriginal.value - totalDescuento.value;
});

onMounted(async () => {
  await cargarDatosIniciales();
});

async function cargarDatosIniciales() {
  try {
    const [sucursalesRes, modalidadesRes] = await Promise.all([
      sucursalService.index(1, 100),
      modalidadService.index(1, 100)
    ]);
    
    sucursales.value = sucursalesRes.data?.data || sucursalesRes.data || sucursalesRes;
    modalidades.value = modalidadesRes.data?.data || modalidadesRes.data || modalidadesRes;
    
  } catch (error) {
    console.error('Error cargando datos iniciales:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos iniciales',
      life: 3000
    });
  }
}

async function cargarInscripcionesParaRenovar() {
  cargando.value = true;
  cargadoSinResultados.value = false;
  
  try {
    // Preparar parámetros para la API
    const params = {
      estado: 'activo',
      ...filtros.value
    };
    
    // Remover null/undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });
    
    const response = await inscripcionService.index(1, 100, params);
    inscripcionesSeleccionables.value = response.data?.data || response.data || response;
    
    // Resetear selecciones
    inscripcionesSeleccionadas.value = [];
    
    if (inscripcionesSeleccionables.value.length === 0) {
      cargadoSinResultados.value = true;
    }
    
  } catch (error) {
    console.error('Error cargando inscripciones:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las inscripciones',
      life: 3000
    });
  } finally {
    cargando.value = false;
  }
}

function filtrarInscripciones() {
  // Esta función se llama cuando cambian los filtros
  // Podrías implementar filtrado en el cliente aquí si es necesario
}

function limpiarFiltros() {
  filtros.value = {
    sucursal_id: null,
    modalidad_id: null,
    estado_vencimiento: 'proximas_vencer',
    fecha_limite: null
  };
}

function seleccionarTodas() {
  inscripcionesSeleccionadas.value = [...inscripcionesSeleccionables.value];
}

function deseleccionarTodas() {
  inscripcionesSeleccionadas.value = [];
}

function onRowSelect(event) {
  console.log('Seleccionada:', event.data.id);
}

function onRowUnselect(event) {
  console.log('Deseleccionada:', event.data.id);
}

async function renovarIndividual(inscripcion) {
  confirm.require({
    message: `¿Renovar inscripción de ${inscripcion.estudiante?.nombres_completos}?`,
    header: 'Confirmar Renovación Individual',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, renovar',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        const datos = {
          duracion_meses: 1,
          descuento_porcentaje: 0,
          observaciones: 'Renovación individual'
        };
        
        await inscripcionService.renovar(inscripcion.id, datos);
        
        toast.add({
          severity: 'success',
          summary: 'Renovado',
          detail: 'Inscripción renovada individualmente',
          life: 3000
        });
        
        // Actualizar lista
        await cargarInscripcionesParaRenovar();
        
      } catch (error) {
        console.error('Error renovando individual:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo renovar la inscripción',
          life: 3000
        });
      }
    }
  });
}

function generarPrevisualizacion() {
  if (inscripcionesSeleccionadas.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Selecciona al menos una inscripción',
      life: 3000
    });
    return;
  }
  
  // Aquí podrías abrir un modal con la previsualización
  console.log('Generando previsualización para:', inscripcionesSeleccionadas.value);
  
  toast.add({
    severity: 'info',
    summary: 'Previsualización',
    detail: `Se renovarán ${inscripcionesSeleccionadas.value.length} inscripciones`,
    life: 3000
  });
}

async function procesarRenovaciones() {
  if (inscripcionesSeleccionadas.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Selecciona al menos una inscripción',
      life: 3000
    });
    return;
  }
  
  confirm.require({
    message: `¿Procesar ${inscripcionesSeleccionadas.value.length} renovaciones? Total: $${totalFinal.toFixed(2)}`,
    header: 'Confirmar Procesamiento Masivo',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, procesar',
    rejectLabel: 'Cancelar',
    accept: async () => {
      procesando.value = true;
      
      try {
        const renovaciones = inscripcionesSeleccionadas.value.map(insc => ({
          inscripcion_id: insc.id,
          duracion_meses: configRenovacion.value.duracion_meses,
          descuento_porcentaje: configRenovacion.value.descuento_porcentaje,
          fecha_inicio: configRenovacion.value.fecha_inicio,
          observaciones: configRenovacion.value.observaciones
        }));
        
        // En un sistema real, tendrías un endpoint para renovaciones masivas
        // Por ahora, hacemos una por una
        const promises = renovaciones.map(renovacion => 
          inscripcionService.renovar(renovacion.inscripcion_id, renovacion)
        );
        
        await Promise.all(promises);
        
        toast.add({
          severity: 'success',
          summary: '¡Éxito!',
          detail: `${renovaciones.length} inscripciones renovadas correctamente`,
          life: 5000
        });
        
        // Emitir evento para notificar al componente padre
        emit('renovaciones-completadas');
        
        // Limpiar
        inscripcionesSeleccionadas.value = [];
        inscripcionesSeleccionables.value = [];
        
      } catch (error) {
        console.error('Error procesando renovaciones:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Hubo un error al procesar las renovaciones',
          life: 3000
        });
      } finally {
        procesando.value = false;
      }
    }
  });
}

// Funciones de utilidad
function getIniciales(estudiante) {
  if (!estudiante) return '?';
  const nombres = estudiante.nombres || '';
  const apellidos = estudiante.apellidos || '';
  return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
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

function getDiasRestantes(fechaFin) {
  const hoy = new Date();
  const fin = new Date(fechaFin);
  const diffTime = fin - hoy;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return `${Math.abs(diffDays)} días vencido`;
  if (diffDays === 0) return 'Hoy vence';
  return `${diffDays} días restantes`;
}

function getColorVencimiento(fechaFin) {
  const hoy = new Date();
  const fin = new Date(fechaFin);
  const diffTime = fin - hoy;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'text-red-500';
  if (diffDays <= 3) return 'text-orange-500';
  if (diffDays <= 7) return 'text-yellow-500';
  return 'text-green-500';
}
</script>

<style scoped>
.renovaciones-masivas-container {
  padding: 0.5rem;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.configuracion-renovacion {
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
}

.resumen-costo {
  background: linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%);
  border: 1px solid #e5e7eb;
}

.info-item {
  text-align: center;
  padding: 0.5rem;
}

::v-deep(.p-datatable) {
  font-size: 0.875rem;
}

::v-deep(.p-datatable .p-column-header-content) {
  font-size: 0.875rem;
  font-weight: 600;
}
</style>