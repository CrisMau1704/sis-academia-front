<template>
  <div class="preinscripciones-container">
    <!-- Header con título -->
    <div class="dashboard-header mb-4">
      <h1>📋 PREINSCRIPCIONES</h1>
      <div class="header-actions">
        <Badge :value="preinscripciones.length + ' pendientes'" severity="warning" />
      </div>
    </div>

    <!-- Toolbar -->
    <Toolbar class="mb-4">
      <template #start>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-clock text-yellow-500" style="font-size: 1.5rem"></i>
          <span class="font-bold">{{ preinscripciones.length }} preinscripción(es) pendiente(s)</span>
        </div>
      </template>
      <template #end>
        <div class="flex gap-2">
          <InputText v-model="buscar" placeholder="Buscar por nombre o CI..." class="p-inputtext-sm" />
          <Button icon="pi pi-refresh" severity="info" @click="cargarPreinscripciones" v-tooltip="'Actualizar'" />
        </div>
      </template>
    </Toolbar>

    <!-- DataTable -->
    <DataTable :value="preinscripcionesFiltradas" :paginator="true" :rows="10" :loading="cargando"
      class="p-datatable-sm" dataKey="id">
      
      <Column field="id" header="#" style="width: 70px">
        <template #body="slotProps">
          <span class="font-bold text-yellow-600">#{{ slotProps.data.id }}</span>
        </template>
      </Column>

      <Column header="Estudiante" style="min-width: 200px">
        <template #body="slotProps">
          <div class="flex align-items-center">
            <Avatar :label="obtenerIniciales(slotProps.data)" class="mr-2 bg-yellow-500 text-white" size="normal" />
            <div>
              <div class="font-medium">{{ obtenerNombre(slotProps.data) }}</div>
              <small class="text-500">CI: {{ obtenerCI(slotProps.data) }}</small>
            </div>
          </div>
        </template>
      </Column>

      <Column header="Contacto">
        <template #body="slotProps">
          <div class="flex flex-column">
            <div class="flex align-items-center gap-1">
              <i class="pi pi-phone text-400"></i>
              <small>{{ obtenerTelefono(slotProps.data) }}</small>
            </div>
            <div class="flex align-items-center gap-1">
              <i class="pi pi-envelope text-400"></i>
              <small>{{ obtenerCorreo(slotProps.data) }}</small>
            </div>
          </div>
        </template>
      </Column>

      <Column header="Modalidad">
        <template #body="slotProps">
          <Tag :value="slotProps.data.modalidad?.nombre || 'Sin modalidad'" severity="info" />
        </template>
      </Column>

      <Column header="Fecha Preinscripción">
        <template #body="slotProps">
          {{ formatFecha(slotProps.data.created_at) }}
        </template>
      </Column>

      <Column header="Acciones" style="width: 300px">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button label="COMPLETAR" icon="pi pi-check-circle" severity="success" 
              @click="abrirDialogoCompletar(slotProps.data)" class="p-button-sm" />
            <Button icon="pi pi-eye" severity="info" @click="verDetalles(slotProps.data)" 
              class="p-button-rounded p-button-text" />
            <Button icon="pi pi-times" severity="danger" @click="rechazar(slotProps.data)" 
              class="p-button-rounded p-button-text" />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="text-center p-4">
          <i class="pi pi-inbox text-400" style="font-size: 3rem"></i>
          <p class="text-500 mt-2">No hay preinscripciones pendientes</p>
        </div>
      </template>
    </DataTable>

    <!-- Diálogo para completar - VERSIÓN COMPLETA CON PAGO EDITABLE -->
    <Dialog v-model:visible="dialogoCompletar" header="✅ COMPLETAR INSCRIPCIÓN" :modal="true" :style="{ width: '650px' }" class="completar-dialog">
      <div v-if="preinscripcionSeleccionada" class="p-3">
        
        <!-- Información del estudiante (resumen) -->
        <div class="mb-4 p-3 border-round bg-blue-50">
          <div class="flex align-items-center">
            <Avatar :label="obtenerIniciales(preinscripcionSeleccionada)" class="mr-3 bg-primary" size="xlarge" />
            <div>
              <div class="font-bold text-xl">{{ obtenerNombre(preinscripcionSeleccionada) }}</div>
              <div class="text-sm">CI: {{ obtenerCI(preinscripcionSeleccionada) }} | Tel: {{ obtenerTelefono(preinscripcionSeleccionada) }}</div>
              <div class="text-sm mt-1">
                <Tag :value="preinscripcionSeleccionada.modalidad?.nombre || 'Sin modalidad'" severity="info" />
                <span class="ml-2 font-bold text-green-600">Precio: ${{ preinscripcionSeleccionada.modalidad?.precio_mensual || 0 }}/mes</span>
              </div>
            </div>
          </div>
        </div>

        <!-- FORMULARIO COMPLETO -->
        <div class="grid">
          
          <!-- Columna izquierda: Fechas -->
          <div class="col-12 md:col-6">
            <h5 class="mt-0 mb-3">📅 Período de Inscripción</h5>
            
            <div class="field mb-3">
              <label class="font-medium block mb-2">Fecha de inicio *</label>
              <Calendar 
                v-model="formCompletar.fecha_inicio" 
                dateFormat="dd/mm/yy" 
                class="w-full" 
                :minDate="new Date()"
                showIcon
                :class="{ 'p-invalid': !formCompletar.fecha_inicio }"
              />
            </div>

            <div class="field mb-3">
              <label class="font-medium block mb-2">Fecha de fin *</label>
              <Calendar 
                v-model="formCompletar.fecha_fin" 
                dateFormat="dd/mm/yy" 
                class="w-full" 
                :minDate="formCompletar.fecha_inicio || new Date()"
                showIcon
                :class="{ 'p-invalid': !formCompletar.fecha_fin }"
              />
            </div>

            <div v-if="formCompletar.fecha_inicio && formCompletar.fecha_fin" class="p-2 bg-green-50 border-round">
              <small class="text-green-700">
                <i class="pi pi-info-circle mr-1"></i>
                Duración: {{ calcularMesesDuracion() }} meses
              </small>
            </div>
          </div>

          <!-- Columna derecha: Entrenador y Pago -->
          <div class="col-12 md:col-6">
            
            <!-- Selección de Entrenador -->
            <h5 class="mt-0 mb-3">👤 Entrenador</h5>
            
            <div class="field mb-4">
              <label class="font-medium block mb-2">Seleccionar entrenador *</label>
              <Dropdown 
                v-model="formCompletar.entrenador_id" 
                :options="entrenadores" 
                optionLabel="nombre_completo" 
                optionValue="id"
                placeholder="Seleccione un entrenador"
                class="w-full"
                :loading="cargandoEntrenadores"
                :class="{ 'p-invalid': !formCompletar.entrenador_id }"
                filter
              >
                <template #option="slotProps">
                  <div class="flex align-items-center">
                    <Avatar :label="slotProps.option.nombre_completo?.charAt(0) || '?'" size="small" class="mr-2" />
                    <div>
                      <div>{{ slotProps.option.nombre_completo }}</div>
                      <small class="text-500">{{ slotProps.option.especialidad || 'Entrenador' }}</small>
                    </div>
                  </div>
                </template>
              </Dropdown>
            </div>

            <!-- SECCIÓN DE PAGO (EDITABLE) -->
            <h5 class="mt-0 mb-3">💰 Registrar Pago</h5>
            
            <div class="field mb-3">
              <label class="font-medium block mb-2">Monto pagado *</label>
              <div class="p-inputgroup">
                <span class="p-inputgroup-addon">$</span>
                <InputNumber 
                  v-model="formCompletar.monto_pagado" 
                  :min="1" 
                  :max="calcularMontoMaximo()"
                  class="w-full"
                  :class="{ 'p-invalid': formCompletar.monto_pagado <= 0 }"
                  mode="currency" 
                  currency="USD" 
                  locale="en-US"
                />
              </div>
              <small class="text-500">Monto sugerido: ${{ preinscripcionSeleccionada.modalidad?.precio_mensual || 0 }} (precio mensual)</small>
            </div>

            <div class="field mb-3">
              <label class="font-medium block mb-2">Método de pago *</label>
              <div class="flex flex-wrap gap-3">
                <div v-for="metodo in metodosPago" :key="metodo.value" class="field-radiobutton">
                  <RadioButton :id="'metodo_' + metodo.value" :value="metodo.value" v-model="formCompletar.metodo_pago" />
                  <label :for="'metodo_' + metodo.value">{{ metodo.label }}</label>
                </div>
              </div>
            </div>

            <!-- Observaciones (opcional) -->
            <div class="field">
              <label class="font-medium block mb-2">Observaciones</label>
              <Textarea v-model="formCompletar.observacion" rows="2" class="w-full" placeholder="Notas adicionales sobre el pago..." />
            </div>
          </div>
        </div>

        <!-- Resumen de lo que se creará -->
        <div class="p-3 border-round bg-green-50 mt-3">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-check-circle text-green-500"></i>
            <span class="font-bold">Al completar se creará:</span>
          </div>
          <div class="grid">
            <div class="col-4">
              <small><i class="pi pi-check text-green-500 mr-1"></i> Inscripción activa</small>
            </div>
            <div class="col-4">
              <small><i class="pi pi-check text-green-500 mr-1"></i> Pago registrado</small>
            </div>
            <div class="col-4">
              <small><i class="pi pi-check text-green-500 mr-1"></i> Clases programadas</small>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="dialogoCompletar = false" class="p-button-text" />
        <Button 
          label="✅ COMPLETAR INSCRIPCIÓN" 
          icon="pi pi-check-circle" 
          @click="completarInscripcion" 
          :loading="procesando" 
          :disabled="!formCompletar.fecha_inicio || !formCompletar.fecha_fin || !formCompletar.entrenador_id || !formCompletar.metodo_pago || formCompletar.monto_pagado <= 0" 
          severity="success" 
        />
      </template>
    </Dialog>
  </div>
   <Toast />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import inscripcionService from '@/services/inscripcion.service';
import estudianteService from '@/services/estudiante.service';
import pagoService from '@/services/pago.service';
import entrenadorService from '@/services/entrenador.service';

// Componentes PrimeVue
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import RadioButton from 'primevue/radiobutton';
import Textarea from 'primevue/textarea';
import Badge from 'primevue/badge';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';

const toast = useToast();

// ============================================
// ESTADOS
// ============================================
const preinscripciones = ref([]);
const cargando = ref(false);
const buscar = ref('');

const dialogoCompletar = ref(false);
const preinscripcionSeleccionada = ref(null);
const procesando = ref(false);

const entrenadores = ref([]);
const cargandoEntrenadores = ref(false);

// Formulario para completar (con campos de pago EDITABLES)
const formCompletar = ref({
  fecha_inicio: new Date(),
  fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  entrenador_id: null,
  metodo_pago: null,
  monto_pagado: 0,
  observacion: ''
});

const metodosPago = ref([
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'QR', value: 'qr' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Transferencia', value: 'transferencia' }
]);

// ============================================
// COMPUTED
// ============================================
const preinscripcionesFiltradas = computed(() => {
  let filtradas = preinscripciones.value;

  if (buscar.value) {
    const search = buscar.value.toLowerCase().trim();
    filtradas = filtradas.filter(pre => {
      const nombres = (pre.estudiante?.nombres || '').toLowerCase();
      const apellidos = (pre.estudiante?.apellidos || '').toLowerCase();
      const ci = (pre.estudiante?.ci || '').toLowerCase();
      
      return nombres.includes(search) || 
             apellidos.includes(search) || 
             ci.includes(search);
    });
  }

  return filtradas;
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function obtenerNombre(pre) {
  if (pre.estudiante) {
    return `${pre.estudiante.nombres || ''} ${pre.estudiante.apellidos || ''}`.trim() || 'Sin nombre';
  }
  return 'Sin nombre';
}

function obtenerIniciales(pre) {
  if (pre.estudiante) {
    const nombres = pre.estudiante.nombres || '';
    const apellidos = pre.estudiante.apellidos || '';
    if (nombres && apellidos) return (nombres[0] + apellidos[0]).toUpperCase();
    if (nombres) return nombres[0].toUpperCase();
  }
  return '?';
}

function obtenerCI(pre) {
  return pre.estudiante?.ci || 'No especificado';
}

function obtenerTelefono(pre) {
  return pre.estudiante?.telefono || 'No especificado';
}

function obtenerCorreo(pre) {
  return pre.estudiante?.correo || 'No especificado';
}

function formatFecha(fecha) {
  if (!fecha) return '--';
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// ============================================
// FUNCIONES DE CÁLCULO
// ============================================
function calcularMesesDuracion() {
  if (!formCompletar.value?.fecha_inicio || !formCompletar.value?.fecha_fin) return 1;
  
  const inicio = new Date(formCompletar.value.fecha_inicio);
  const fin = new Date(formCompletar.value.fecha_fin);
  
  const meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + 
                (fin.getMonth() - inicio.getMonth());
  
  return Math.max(1, meses);
}

function calcularMontoMaximo() {
  if (!preinscripcionSeleccionada.value) return 10000;
  const precioMensual = preinscripcionSeleccionada.value.modalidad?.precio_mensual || 0;
  const meses = calcularMesesDuracion();
  return precioMensual * meses * 2; // Permitir hasta el doble por si acaso
}

// ============================================
// CARGAR DATOS
// ============================================
async function cargarPreinscripciones() {
  cargando.value = true;
  try {
    const response = await inscripcionService.obtenerPreinscripciones(1, 100);
    
    console.log('📥 Respuesta completa:', response.data);
    
    if (response.data?.success) {
      if (response.data.data && response.data.data.data) {
        preinscripciones.value = response.data.data.data;
      } else if (Array.isArray(response.data.data)) {
        preinscripciones.value = response.data.data;
      } else if (Array.isArray(response.data)) {
        preinscripciones.value = response.data;
      } else {
        preinscripciones.value = [];
      }
    } else {
      preinscripciones.value = [];
    }
    
    toast.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: `${preinscripciones.value.length} preinscripciones pendientes`,
      life: 2000
    });
    
  } catch (error) {
    console.error('❌ Error cargando preinscripciones:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las preinscripciones',
      life: 3000
    });
    preinscripciones.value = [];
  } finally {
    cargando.value = false;
  }
}

async function cargarEntrenadores() {
  cargandoEntrenadores.value = true;
  try {
    const response = await entrenadorService.obtenerTodos();
    
    let entrenadoresData = [];
    
    if (response.data) {
      if (Array.isArray(response.data)) {
        entrenadoresData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        entrenadoresData = response.data.data;
      } else if (response.data.success && response.data.data) {
        entrenadoresData = response.data.data;
      }
    }
    
    // Filtrar solo activos
    entrenadoresData = entrenadoresData.filter(e => e.estado === 'activo' || e.estado === undefined);
    
    entrenadores.value = entrenadoresData.map(e => ({
      id: e.id,
      nombres: e.nombres || '',
      apellidos: e.apellidos || '',
      nombre_completo: `${e.nombres || ''} ${e.apellidos || ''}`.trim(),
      especialidad: e.especialidad || 'Entrenador'
    }));
    
    console.log('✅ Entrenadores cargados:', entrenadores.value.length);
    
  } catch (error) {
    console.error('❌ Error cargando entrenadores:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los entrenadores',
      life: 3000
    });
  } finally {
    cargandoEntrenadores.value = false;
  }
}

// ============================================
// ACCIONES DEL DIÁLOGO
// ============================================
function abrirDialogoCompletar(pre) {
  preinscripcionSeleccionada.value = pre;
  
  const hoy = new Date();
  const unMes = new Date();
  unMes.setMonth(unMes.getMonth() + 1);
  
  formCompletar.value = {
    fecha_inicio: hoy,
    fecha_fin: unMes,
    entrenador_id: null,
    metodo_pago: null,
    monto_pagado: pre.modalidad?.precio_mensual || 0, // Sugerir precio mensual
    observacion: ''
  };
  
  dialogoCompletar.value = true;
}

async function completarInscripcion() {
  // Validaciones
  if (!formCompletar.value.fecha_inicio) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Seleccione fecha de inicio', life: 3000 });
    return;
  }
  if (!formCompletar.value.fecha_fin) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Seleccione fecha de fin', life: 3000 });
    return;
  }
  if (!formCompletar.value.entrenador_id) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Seleccione un entrenador', life: 3000 });
    return;
  }
  if (!formCompletar.value.metodo_pago) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Seleccione método de pago', life: 3000 });
    return;
  }
  if (formCompletar.value.monto_pagado <= 0) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Ingrese un monto válido', life: 3000 });
    return;
  }

  procesando.value = true;
  
  try {
    const pre = preinscripcionSeleccionada.value;
    
    const datosAprobar = {
      metodo_pago: formCompletar.value.metodo_pago,
      monto_pagado: formCompletar.value.monto_pagado,
      fecha_inicio: formCompletar.value.fecha_inicio.toISOString().split('T')[0],
      fecha_fin: formCompletar.value.fecha_fin.toISOString().split('T')[0],
      entrenador_id: formCompletar.value.entrenador_id,
      observacion_pago: formCompletar.value.observacion || 'Pago de inscripción'
    };

    console.log('📤 Enviando datos:', datosAprobar);

    const response = await inscripcionService.aprobarPreinscripcion(pre.id, datosAprobar);
    
    if (response.data?.success) {
      toast.add({
        severity: 'success',
        summary: '✅ INSCRIPCIÓN COMPLETADA',
        detail: `${obtenerNombre(pre)} ahora está activo. Pago: $${formCompletar.value.monto_pagado}`,
        life: 6000
      });

      dialogoCompletar.value = false;
      await cargarPreinscripciones();
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'No se pudo completar',
      life: 5000
    });
  } finally {
    procesando.value = false;
  }
}

function verDetalles(pre) {
  toast.add({
    severity: 'info',
    summary: 'Detalles',
    detail: `${obtenerNombre(pre)} - ${obtenerCI(pre)}`,
    life: 4000
  });
}

async function rechazar(pre) {
  const confirmar = window.confirm(`¿Rechazar preinscripción de ${obtenerNombre(pre)}?`);
  
  if (confirmar) {
    try {
      await inscripcionService.update(pre.id, { estado: 'rechazado' });
      await cargarPreinscripciones();
      
      toast.add({
        severity: 'warn',
        summary: 'Preinscripción rechazada',
        detail: `#${pre.id} rechazada`,
        life: 3000
      });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo rechazar',
        life: 3000
      });
    }
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================
onMounted(() => {
  cargarPreinscripciones();
  cargarEntrenadores();
});
</script>

<style scoped>
.preinscripciones-container {
  padding: 1.5rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border-left: 5px solid #f59e0b;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #92400e;
}
</style>