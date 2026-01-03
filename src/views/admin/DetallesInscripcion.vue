<template>
  <div class="detalles-inscripcion-container">
    <!-- Header con información principal -->
    <div class="header-card card mb-4 p-4">
      <div class="grid">
        <div class="col-12 md:col-8">
          <div class="flex align-items-center gap-3">
            <Avatar :label="getIniciales(inscripcion.estudiante)" size="xlarge" shape="circle" 
                    class="bg-primary text-white" />
            <div>
              <h3 class="m-0">{{ inscripcion.estudiante?.nombres_completos || 'Estudiante no encontrado' }}</h3>
              <div class="flex align-items-center gap-3 mt-2">
                <Tag :value="inscripcion.estado" :severity="getSeverityEstado(inscripcion.estado)" />
                <span class="text-500">{{ inscripcion.estudiante?.documento || 'Sin documento' }}</span>
                <span class="text-500">{{ inscripcion.estudiante?.telefono || 'Sin teléfono' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-12 md:col-4">
          <div class="flex flex-column gap-2">
            <div class="flex justify-content-between">
              <span class="text-500">ID Inscripción:</span>
              <span class="font-bold">#{{ inscripcion.id }}</span>
            </div>
            <div class="flex justify-content-between">
              <span class="text-500">Creada:</span>
              <span>{{ formatFecha(inscripcion.created_at) }}</span>
            </div>
            <div class="flex justify-content-between">
              <span class="text-500">Última modificación:</span>
              <span>{{ formatFecha(inscripcion.updated_at) }}</span>
            </div>
            <div class="flex justify-content-between">
              <span class="text-500">Sucursal:</span>
              <span class="font-bold">{{ inscripcion.sucursal?.nombre || '--' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs principales -->
    <TabView class="mb-4">
      <!-- Pestaña 1: Información General -->
      <TabPanel header="Información General">
        <div class="grid">
          <!-- Columna 1: Modalidad -->
          <div class="col-12 lg:col-6">
            <div class="card h-full">
              <div class="flex justify-content-between align-items-center mb-3">
                <h5 class="m-0">Información de Modalidad</h5>
                <Button label="Cambiar Modalidad" icon="pi pi-exchange" class="p-button-sm" 
                        @click="mostrarCambioModalidad" />
              </div>
              
              <div class="info-grid">
                <div class="info-item">
                  <i class="pi pi-briefcase text-primary mr-2"></i>
                  <div>
                    <span class="label">Modalidad:</span>
                    <span class="value font-bold">{{ inscripcion.modalidad?.nombre || '--' }}</span>
                  </div>
                </div>
                
                <div class="info-item">
                  <i class="pi pi-star text-primary mr-2"></i>
                  <div>
                    <span class="label">Disciplina:</span>
                    <span class="value">{{ inscripcion.modalidad?.disciplina?.nombre || '--' }}</span>
                  </div>
                </div>
                
                <div class="info-item">
                  <i class="pi pi-dollar text-primary mr-2"></i>
                  <div>
                    <span class="label">Precio Mensual:</span>
                    <span class="value text-green-500 font-bold">${{ inscripcion.modalidad?.precio_mensual || '0.00' }}</span>
                  </div>
                </div>
                
                <div class="info-item">
                  <i class="pi pi-shield text-primary mr-2"></i>
                  <div>
                    <span class="label">Permisos Máximos:</span>
                    <span class="value">
                      {{ inscripcion.permisos_usados || 0 }}/{{ inscripcion.modalidad?.permisos_maximos || 3 }} usados
                    </span>
                  </div>
                </div>
                
                <div class="info-item">
                  <i class="pi pi-calendar text-primary mr-2"></i>
                  <div>
                    <span class="label">Clases por Mes:</span>
                    <span class="value">{{ inscripcion.modalidad?.clases_mensuales || 12 }}</span>
                  </div>
                </div>
                
                <div class="info-item">
                  <i class="pi pi-clock text-primary mr-2"></i>
                  <div>
                    <span class="label">Duración Clase:</span>
                    <span class="value">{{ inscripcion.modalidad?.duracion_clase || 60 }} min</span>
                  </div>
                </div>
              </div>
              
              <div class="mt-4">
                <h6>Descripción:</h6>
                <p class="text-500">{{ inscripcion.modalidad?.descripcion || 'Sin descripción' }}</p>
              </div>
            </div>
          </div>
          
          <!-- Columna 2: Período y Estado -->
          <div class="col-12 lg:col-6">
            <div class="card h-full">
              <div class="flex justify-content-between align-items-center mb-3">
                <h5 class="m-0">Período y Estado</h5>
                <div class="flex gap-2">
                  <Button label="Suspender" icon="pi pi-pause" class="p-button-sm p-button-warning" 
                          @click="suspenderInscripcion" v-if="inscripcion.estado === 'activo'" />
                  <Button label="Renovar" icon="pi pi-refresh" class="p-button-sm p-button-success" 
                          @click="renovarInscripcion" />
                </div>
              </div>
              
              <div class="info-grid">
                <div class="info-item">
                  <i class="pi pi-calendar-plus text-primary mr-2"></i>
                  <div>
                    <span class="label">Fecha Inicio:</span>
                    <span class="value">{{ formatFecha(inscripcion.fecha_inicio) }}</span>
                  </div>
                </div>
                
                <div class="info-item">
                  <i class="pi pi-calendar-minus text-primary mr-2"></i>
                  <div>
                    <span class="label">Fecha Fin:</span>
                    <span class="value" :class="getColorVencimiento(inscripcion.fecha_fin)">
                      {{ formatFecha(inscripcion.fecha_fin) }}
                    </span>
                  </div>
                </div>
                
                <div class="info-item">
                  <i class="pi pi-clock text-primary mr-2"></i>
                  <div>
                    <span class="label">Días Restantes:</span>
                    <span class="value font-bold" :class="getColorVencimiento(inscripcion.fecha_fin)">
                      {{ getDiasRestantes(inscripcion.fecha_fin) }}
                    </span>
                  </div>
                </div>
                
                <div class="info-item">
                  <i class="pi pi-info-circle text-primary mr-2"></i>
                  <div>
                    <span class="label">Estado Actual:</span>
                    <span class="value">
                      <Tag :value="inscripcion.estado" :severity="getSeverityEstado(inscripcion.estado)" />
                    </span>
                  </div>
                </div>
                
                <div class="info-item">
                  <i class="pi pi-history text-primary mr-2"></i>
                  <div>
                    <span class="label">Días Activos:</span>
                    <span class="value">{{ calcularDiasActivos() }} días</span>
                  </div>
                </div>
                
                <div class="info-item">
                  <i class="pi pi-calendar text-primary mr-2"></i>
                  <div>
                    <span class="label">Próximo Corte:</span>
                    <span class="value">{{ calcularProximoCorte() }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Timeline de estado -->
              <div class="mt-4">
                <h6>Historial de Estado:</h6>
                <div class="timeline">
                  <div v-for="evento in historialEstado" :key="evento.id" class="timeline-item">
                    <div class="timeline-date">{{ formatFechaCorta(evento.fecha) }}</div>
                    <div class="timeline-content">
                      <span class="font-bold">{{ evento.estado }}</span>
                      <small class="text-500">{{ evento.descripcion }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Estadísticas de Uso -->
          <div class="col-12">
            <div class="card mt-3">
              <h5 class="mb-3">Estadísticas de Uso</h5>
              <div class="grid">
                <div class="col-6 md:col-3">
                  <div class="stat-card text-center p-3">
                    <div class="stat-value text-primary">{{ inscripcion.clases_totales || 0 }}</div>
                    <div class="stat-label text-500">Clases Totales</div>
                  </div>
                </div>
                <div class="col-6 md:col-3">
                  <div class="stat-card text-center p-3">
                    <div class="stat-value text-green-500">{{ inscripcion.clases_restantes || 0 }}</div>
                    <div class="stat-label text-500">Clases Restantes</div>
                  </div>
                </div>
                <div class="col-6 md:col-3">
                  <div class="stat-card text-center p-3">
                    <div class="stat-value text-orange-500">{{ (inscripcion.clases_totales || 0) - (inscripcion.clases_restantes || 0) }}</div>
                    <div class="stat-label text-500">Clases Tomadas</div>
                  </div>
                </div>
                <div class="col-6 md:col-3">
                  <div class="stat-card text-center p-3">
                    <div class="stat-value" :class="getColorPermisos()">{{ inscripcion.permisos_usados || 0 }}/{{ inscripcion.permisos_maximos || 3 }}</div>
                    <div class="stat-label text-500">Permisos Usados</div>
                  </div>
                </div>
              </div>
              
              <!-- Barras de progreso -->
              <div class="mt-4">
                <div class="mb-3">
                  <div class="flex justify-content-between mb-1">
                    <span>Progreso de Clases</span>
                    <span>{{ calcularProgresoClases() }}%</span>
                  </div>
                  <ProgressBar :value="calcularProgresoClases()" :showValue="false" />
                </div>
                
                <div>
                  <div class="flex justify-content-between mb-1">
                    <span>Uso de Permisos</span>
                    <span>{{ calcularProgresoPermisos() }}%</span>
                  </div>
                  <ProgressBar :value="calcularProgresoPermisos()" :showValue="false" 
                              :severity="calcularProgresoPermisos() > 70 ? 'warn' : 'info'" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      
      <!-- Pestaña 2: Horarios Asignados -->
      <TabPanel header="Horarios Asignados">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-3">
            <h5 class="m-0">Horarios Registrados</h5>
            <Button label="Agregar Horario" icon="pi pi-plus" class="p-button-sm" 
                    @click="mostrarDialogoHorario" />
          </div>
          
          <DataTable :value="horariosAsignados" :paginator="true" :rows="5" class="p-datatable-sm">
            <Column header="Día">
              <template #body="slotProps">
                <Tag :value="slotProps.data.dia_semana" class="dia-tag" />
              </template>
            </Column>
            
            <Column header="Horario">
              <template #body="slotProps">
                <div class="horario-cell">
                  <span class="font-bold">{{ slotProps.data.hora_inicio?.slice(0,5) || '--:--' }}</span>
                  <span class="mx-1">-</span>
                  <span class="font-bold">{{ slotProps.data.hora_fin?.slice(0,5) || '--:--' }}</span>
                </div>
              </template>
            </Column>
            
            <Column header="Sucursal">
              <template #body="slotProps">
                <Chip :label="slotProps.data.sucursal?.nombre || '--'" class="sucursal-chip" />
              </template>
            </Column>
            
            <Column header="Entrenador">
              <template #body="slotProps">
                <div class="entrenador-cell">
                  <Avatar :label="getInicialesEntrenador(slotProps.data.entrenador)" size="small" 
                          class="mr-2" shape="circle" />
                  <span>{{ slotProps.data.entrenador?.nombres || '--' }}</span>
                </div>
              </template>
            </Column>
            
            <Column header="Cupo">
              <template #body="slotProps">
                <div class="cupo-cell">
                  <div class="flex align-items-center gap-2">
                    <span>{{ slotProps.data.cupo_actual || 0 }}/{{ slotProps.data.cupo_maximo || 0 }}</span>
                    <ProgressBar :value="calcularPorcentajeCupo(slotProps.data)" 
                                :showValue="false" style="height: 6px; width: 60px" />
                  </div>
                  <small class="text-500">{{ slotProps.data.nombre || 'Clase' }}</small>
                </div>
              </template>
            </Column>
            
            <Column header="Acciones" style="width: 100px">
              <template #body="slotProps">
                <div class="flex gap-1">
                  <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm" 
                          @click="verDetallesHorario(slotProps.data)" v-tooltip="'Ver detalles'" />
                  <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm" 
                          @click="confirmarEliminarHorario(slotProps.data)" v-tooltip="'Eliminar'" />
                </div>
              </template>
            </Column>
          </DataTable>
          
          <div v-if="horariosAsignados.length === 0" class="text-center py-4 text-500">
            <i class="pi pi-clock text-3xl mb-2"></i>
            <p>No hay horarios asignados</p>
            <Button label="Asignar Primer Horario" icon="pi pi-plus" class="mt-2" 
                    @click="mostrarDialogoHorario" />
          </div>
        </div>
      </TabPanel>
      
      <!-- Pestaña 3: Historial de Asistencias -->
      <TabPanel header="Asistencias">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-3">
            <h5 class="m-0">Registro de Asistencias</h5>
            <div class="flex gap-2">
              <Calendar v-model="filtroFechaAsistencia" placeholder="Filtrar por fecha" 
                        :showIcon="true" dateFormat="dd/mm/yy" class="w-10rem" 
                        @date-select="filtrarAsistencias" />
              <Button label="Exportar" icon="pi pi-file-excel" class="p-button-sm" />
              <Button label="Registrar Asistencia" icon="pi pi-check" class="p-button-sm p-button-success" 
                      @click="registrarAsistenciaManual" />
            </div>
          </div>
          
          <DataTable :value="asistenciasFiltradas" :paginator="true" :rows="10" class="p-datatable-sm">
            <Column header="Fecha" :sortable="true">
              <template #body="slotProps">
                <div class="fecha-cell">
                  <div>{{ formatFecha(slotProps.data.fecha) }}</div>
                  <small class="text-500">{{ getDiaSemana(slotProps.data.fecha) }}</small>
                </div>
              </template>
            </Column>
            
            <Column header="Horario">
              <template #body="slotProps">
                <div class="horario-asistencia">
                  <div>{{ slotProps.data.horario?.hora_inicio?.slice(0,5) || '--:--' }}</div>
                  <small class="text-500">{{ slotProps.data.horario?.nombre || '--' }}</small>
                </div>
              </template>
            </Column>
            
            <Column header="Tipo">
              <template #body="slotProps">
                <Tag :value="slotProps.data.tipo" 
                     :severity="getSeverityTipoAsistencia(slotProps.data.tipo)" />
              </template>
            </Column>
            
            <Column header="Estado">
              <template #body="slotProps">
                <div class="flex align-items-center gap-2">
                  <i :class="getIconoEstadoAsistencia(slotProps.data.estado)" 
                     :style="{ color: getColorEstadoAsistencia(slotProps.data.estado) }"></i>
                  <span>{{ slotProps.data.estado || '--' }}</span>
                </div>
              </template>
            </Column>
            
            <Column header="Hora Registro">
              <template #body="slotProps">
                {{ slotProps.data.hora_registro?.slice(0,5) || '--:--' }}
              </template>
            </Column>
            
            <Column header="Observaciones">
              <template #body="slotProps">
                <div class="observaciones-cell">
                  {{ slotProps.data.observaciones || 'Sin observaciones' }}
                  <small v-if="slotProps.data.justificacion" class="text-500 block">
                    Justificación: {{ slotProps.data.justificacion }}
                  </small>
                </div>
              </template>
            </Column>
            
            <Column header="Acciones" style="width: 100px">
              <template #body="slotProps">
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm mr-1" 
                        @click="editarAsistencia(slotProps.data)" v-if="slotProps.data.tipo !== 'asistencia'" />
                <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm" 
                        @click="eliminarAsistencia(slotProps.data)" />
              </template>
            </Column>
          </DataTable>
          
          <!-- Estadísticas de asistencias -->
          <div class="mt-4 p-3 border-round border-1 surface-border">
            <h6>Resumen Mensual</h6>
            <div class="grid">
              <div class="col-6 md:col-3">
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-500">{{ estadisticas.asistencias }}</div>
                  <small class="text-500">Asistencias</small>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="text-center">
                  <div class="text-2xl font-bold text-orange-500">{{ estadisticas.tardanzas }}</div>
                  <small class="text-500">Tardanzas</small>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="text-center">
                  <div class="text-2xl font-bold text-red-500">{{ estadisticas.faltas }}</div>
                  <small class="text-500">Faltas</small>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-500">{{ estadisticas.permisos }}</div>
                  <small class="text-500">Permisos</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      
      <!-- Pestaña 4: Pagos -->
      <TabPanel header="Pagos">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-3">
            <h5 class="m-0">Historial de Pagos</h5>
            <Button label="Registrar Pago" icon="pi pi-plus" class="p-button-sm p-button-success" 
                    @click="registrarPago" />
          </div>
          
          <DataTable :value="pagos" :paginator="true" :rows="10" class="p-datatable-sm">
            <Column header="Fecha" :sortable="true">
              <template #body="slotProps">
                {{ formatFecha(slotProps.data.fecha_pago) }}
              </template>
            </Column>
            
            <Column header="Monto">
              <template #body="slotProps">
                <span class="font-bold text-green-500">${{ slotProps.data.monto }}</span>
              </template>
            </Column>
            
            <Column header="Método">
              <template #body="slotProps">
                <Tag :value="slotProps.data.metodo_pago" :severity="getSeverityMetodoPago(slotProps.data.metodo_pago)" />
              </template>
            </Column>
            
            <Column header="Período">
              <template #body="slotProps">
                {{ formatFecha(slotProps.data.mes_cubierto) }}
              </template>
            </Column>
            
            <Column header="Estado">
              <template #body="slotProps">
                <Tag :value="slotProps.data.estado" :severity="getSeverityEstadoPago(slotProps.data.estado)" />
              </template>
            </Column>
            
            <Column header="Comprobante">
              <template #body="slotProps">
                <div v-if="slotProps.data.comprobante_url">
                  <Button label="Ver" icon="pi pi-eye" class="p-button-sm" 
                          @click="verComprobante(slotProps.data.comprobante_url)" />
                </div>
                <span v-else class="text-500">Sin comprobante</span>
              </template>
            </Column>
            
            <Column header="Acciones" style="width: 100px">
              <template #body="slotProps">
                <Button icon="pi pi-print" class="p-button-rounded p-button-text p-button-sm mr-1" 
                        @click="imprimirRecibo(slotProps.data)" />
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm" 
                        @click="editarPago(slotProps.data)" />
              </template>
            </Column>
          </DataTable>
          
          <!-- Resumen financiero -->
          <div class="mt-4 p-3 border-round border-1 surface-border bg-blue-50">
            <h6>Resumen Financiero</h6>
            <div class="grid">
              <div class="col-6 md:col-3">
                <div class="text-center">
                  <div class="text-lg font-bold">${{ resumenFinanciero.total_pagado }}</div>
                  <small class="text-500">Total Pagado</small>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="text-center">
                  <div class="text-lg font-bold">${{ resumenFinanciero.deuda_actual }}</div>
                  <small class="text-500">Deuda Actual</small>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="text-center">
                  <div class="text-lg font-bold">{{ resumenFinanciero.pagos_realizados }}</div>
                  <small class="text-500">Pagos Realizados</small>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="text-center">
                  <div class="text-lg font-bold">{{ resumenFinanciero.pagos_pendientes }}</div>
                  <small class="text-500">Pagos Pendientes</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
    </TabView>

    <!-- Botones de acción generales -->
    <div class="flex justify-content-end gap-2 mt-4">
      <Button label="Imprimir Resumen" icon="pi pi-print" severity="secondary" 
              @click="imprimirResumen" />
      <Button label="Exportar PDF" icon="pi pi-file-pdf" severity="secondary" 
              @click="exportarPDF" />
      <Button label="Volver" icon="pi pi-arrow-left" @click="$emit('cerrar')" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

// Services
import inscripcionService from '@/services/inscripcion.service';
import horarioService from '@/services/horario.service';
import asistenciaService from '@/services/asistencia.service';
import pagoService from '@/services/pago.service';

// Components
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressBar from 'primevue/progressbar';
import Calendar from 'primevue/calendar';
import Chip from 'primevue/chip';

const props = defineProps({
  inscripcion: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['cerrar', 'actualizado', 'renovar', 'suspender']);

const toast = useToast();
const confirm = useConfirm();

// Estados
const horariosAsignados = ref([]);
const asistencias = ref([]);
const pagos = ref([]);
const historialEstado = ref([]);
const filtroFechaAsistencia = ref(null);
const cargando = ref(false);

// Estadísticas
const estadisticas = ref({
  asistencias: 0,
  tardanzas: 0,
  faltas: 0,
  permisos: 0
});

const resumenFinanciero = ref({
  total_pagado: 0,
  deuda_actual: 0,
  pagos_realizados: 0,
  pagos_pendientes: 0
});

// Computed
const asistenciasFiltradas = computed(() => {
  if (!filtroFechaAsistencia.value) return asistencias.value;
  
  const fechaFiltro = new Date(filtroFechaAsistencia.value);
  return asistencias.value.filter(asist => {
    const fechaAsist = new Date(asist.fecha);
    return fechaAsist.toDateString() === fechaFiltro.toDateString();
  });
});

onMounted(async () => {
  await cargarDatosAdicionales();
  calcularEstadisticas();
  calcularResumenFinanciero();
});

async function cargarDatosAdicionales() {
  cargando.value = true;
  
  try {
    const [horariosRes, asistenciasRes, pagosRes] = await Promise.all([
      horarioService.porInscripcion(props.inscripcion.id),
      asistenciaService.porInscripcion(props.inscripcion.id),
      pagoService.porInscripcion(props.inscripcion.id)
    ]);
    
    horariosAsignados.value = horariosRes.data?.data || horariosRes.data || horariosRes;
    asistencias.value = asistenciasRes.data?.data || asistenciasRes.data || asistenciasRes;
    pagos.value = pagosRes.data?.data || pagosRes.data || pagosRes;
    
    // Generar historial de estado simulado
    generarHistorialEstado();
    
  } catch (error) {
    console.error('Error cargando datos adicionales:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos adicionales',
      life: 3000
    });
  } finally {
    cargando.value = false;
  }
}

function generarHistorialEstado() {
  historialEstado.value = [
    {
      id: 1,
      fecha: props.inscripcion.fecha_inicio,
      estado: 'Creada',
      descripcion: 'Inscripción inicial'
    },
    {
      id: 2,
      fecha: props.inscripcion.updated_at,
      estado: props.inscripcion.estado,
      descripcion: 'Última actualización'
    }
  ];
}

function calcularEstadisticas() {
  estadisticas.value = {
    asistencias: asistencias.value.filter(a => a.tipo === 'asistencia').length,
    tardanzas: asistencias.value.filter(a => a.tipo === 'tardanza').length,
    faltas: asistencias.value.filter(a => a.tipo === 'falta').length,
    permisos: asistencias.value.filter(a => a.tipo === 'permiso').length
  };
}

function calcularResumenFinanciero() {
  const pagosConfirmados = pagos.value.filter(p => p.estado === 'confirmado');
  
  resumenFinanciero.value = {
    total_pagado: pagosConfirmados.reduce((total, pago) => total + parseFloat(pago.monto), 0),
    deuda_actual: calcularDeudaActual(),
    pagos_realizados: pagosConfirmados.length,
    pagos_pendientes: pagos.value.filter(p => p.estado === 'pendiente').length
  };
}

function calcularDeudaActual() {
  const precioMensual = props.inscripcion.modalidad?.precio_mensual || 0;
  const mesesTranscurridos = calcularMesesDesdeInicio();
  const totalDeber = mesesTranscurridos * precioMensual;
  const totalPagado = resumenFinanciero.value.total_pagado;
  
  return Math.max(0, totalDeber - totalPagado);
}

function calcularMesesDesdeInicio() {
  const inicio = new Date(props.inscripcion.fecha_inicio);
  const hoy = new Date();
  const meses = (hoy.getFullYear() - inicio.getFullYear()) * 12;
  return meses + (hoy.getMonth() - inicio.getMonth());
}

// Funciones de utilidad
function getIniciales(estudiante) {
  if (!estudiante) return '?';
  const nombres = estudiante.nombres || '';
  const apellidos = estudiante.apellidos || '';
  return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
}

function getInicialesEntrenador(entrenador) {
  if (!entrenador) return '?';
  const nombres = entrenador.nombres || '';
  const apellidos = entrenador.apellidos || '';
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

function formatFechaCorta(fecha) {
  if (!fecha) return '--';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short'
  });
}

function getDiasRestantes(fechaFin) {
  if (!fechaFin) return 'Sin fecha';
  
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

function getSeverityEstado(estado) {
  switch (estado) {
    case 'activo': return 'success';
    case 'suspendido': return 'warning';
    case 'vencido': return 'danger';
    case 'finalizado': return 'info';
    default: return 'info';
  }
}

function calcularDiasActivos() {
  const inicio = new Date(props.inscripcion.fecha_inicio);
  const hoy = new Date();
  const diffTime = hoy - inicio;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calcularProximoCorte() {
  const fin = new Date(props.inscripcion.fecha_fin);
  return formatFecha(fin);
}

function calcularProgresoClases() {
  const total = props.inscripcion.clases_totales || 1;
  const restantes = props.inscripcion.clases_restantes || 0;
  return ((total - restantes) / total) * 100;
}

function calcularProgresoPermisos() {
  const max = props.inscripcion.permisos_maximos || 3;
  const usados = props.inscripcion.permisos_usados || 0;
  return (usados / max) * 100;
}

function getColorPermisos() {
  const porcentaje = calcularProgresoPermisos();
  if (porcentaje >= 100) return 'text-red-500';
  if (porcentaje >= 70) return 'text-orange-500';
  return 'text-green-500';
}

function calcularPorcentajeCupo(horario) {
  const actual = horario.cupo_actual || 0;
  const maximo = horario.cupo_maximo || 1;
  return (actual / maximo) * 100;
}

function getDiaSemana(fecha) {
  const date = new Date(fecha);
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dias[date.getDay()];
}

function getSeverityTipoAsistencia(tipo) {
  switch (tipo) {
    case 'asistencia': return 'success';
    case 'tardanza': return 'warning';
    case 'falta': return 'danger';
    case 'permiso': return 'info';
    default: return 'info';
  }
}

function getIconoEstadoAsistencia(estado) {
  switch (estado) {
    case 'confirmada': return 'pi pi-check-circle';
    case 'pendiente': return 'pi pi-clock';
    case 'justificada': return 'pi pi-info-circle';
    default: return 'pi pi-question-circle';
  }
}

function getColorEstadoAsistencia(estado) {
  switch (estado) {
    case 'confirmada': return '#10B981';
    case 'pendiente': return '#F59E0B';
    case 'justificada': return '#3B82F6';
    default: return '#6B7280';
  }
}

function getSeverityMetodoPago(metodo) {
  switch (metodo) {
    case 'efectivo': return 'success';
    case 'tarjeta': return 'warning';
    case 'transferencia': return 'info';
    case 'yape': return 'help';
    default: return 'info';
  }
}

function getSeverityEstadoPago(estado) {
  switch (estado) {
    case 'confirmado': return 'success';
    case 'pendiente': return 'warning';
    case 'rechazado': return 'danger';
    case 'anulado': return 'info';
    default: return 'info';
  }
}

// Acciones
function suspenderInscripcion() {
  confirm.require({
    message: '¿Está seguro de suspender esta inscripción?',
    header: 'Confirmar Suspensión',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, suspender',
    rejectLabel: 'Cancelar',
    accept: () => {
      emit('suspender', props.inscripcion.id);
      toast.add({
        severity: 'success',
        summary: 'Suspendida',
        detail: 'Inscripción suspendida temporalmente',
        life: 3000
      });
    }
  });
}

function renovarInscripcion() {
  emit('renovar', props.inscripcion);
}

function mostrarCambioModalidad() {
  toast.add({
    severity: 'info',
    summary: 'Cambio de Modalidad',
    detail: 'Funcionalidad en desarrollo',
    life: 3000
  });
}

function mostrarDialogoHorario() {
  toast.add({
    severity: 'info',
    summary: 'Agregar Horario',
    detail: 'Funcionalidad en desarrollo',
    life: 3000
  });
}

function verDetallesHorario(horario) {
  console.log('Ver detalles horario:', horario);
}

function confirmarEliminarHorario(horario) {
  confirm.require({
    message: `¿Eliminar horario ${horario.dia_semana} ${horario.hora_inicio}?`,
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    accept: () => {
      toast.add({
        severity: 'success',
        summary: 'Eliminado',
        detail: 'Horario eliminado',
        life: 3000
      });
    }
  });
}

function filtrarAsistencias() {
  // Ya se maneja en el computed
}

function registrarAsistenciaManual() {
  toast.add({
    severity: 'info',
    summary: 'Registrar Asistencia',
    detail: 'Funcionalidad en desarrollo',
    life: 3000
  });
}

function editarAsistencia(asistencia) {
  console.log('Editar asistencia:', asistencia);
}

function eliminarAsistencia(asistencia) {
  confirm.require({
    message: '¿Eliminar registro de asistencia?',
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    accept: () => {
      toast.add({
        severity: 'success',
        summary: 'Eliminado',
        detail: 'Asistencia eliminada',
        life: 3000
      });
    }
  });
}

function registrarPago() {
  toast.add({
    severity: 'info',
    summary: 'Registrar Pago',
    detail: 'Funcionalidad en desarrollo',
    life: 3000
  });
}

function verComprobante(url) {
  window.open(url, '_blank');
}

function imprimirRecibo(pago) {
  console.log('Imprimir recibo:', pago);
  toast.add({
    severity: 'info',
    summary: 'Imprimir Recibo',
    detail: 'Funcionalidad en desarrollo',
    life: 3000
  });
}

function editarPago(pago) {
  console.log('Editar pago:', pago);
}

function imprimirResumen() {
  toast.add({
    severity: 'info',
    summary: 'Imprimir Resumen',
    detail: 'Funcionalidad en desarrollo',
    life: 3000
  });
}

function exportarPDF() {
  toast.add({
    severity: 'info',
    summary: 'Exportar PDF',
    detail: 'Funcionalidad en desarrollo',
    life: 3000
  });
}
</script>

<style scoped>
.detalles-inscripcion-container {
  padding: 0.5rem;
}

.header-card {
  background: linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%);
  border: 1px solid #e5e7eb;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  display: block;
  color: #6b7280;
  font-size: 0.875rem;
}

.info-item .value {
  display: block;
  font-size: 0.95rem;
}

.stat-card {
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.dia-tag {
  min-width: 80px;
  text-align: center;
}

.horario-cell {
  display: flex;
  align-items: center;
}

.sucursal-chip {
  background-color: #dbeafe;
  color: #1e40af;
}

.entrenador-cell {
  display: flex;
  align-items: center;
}

.cupo-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.fecha-cell {
  display: flex;
  flex-direction: column;
}

.horario-asistencia {
  display: flex;
  flex-direction: column;
}

.observaciones-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.observaciones-cell .block {
  display: block;
  white-space: normal;
}

.timeline {
  position: relative;
  padding-left: 1.5rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e5e7eb;
}

.timeline-item {
  position: relative;
  margin-bottom: 1rem;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 0.25rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #3b82f6;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #3b82f6;
}

.timeline-date {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.timeline-content {
  background: white;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

::v-deep(.p-tabview-nav) {
  background: white;
  border-bottom: 2px solid #e5e7eb;
}

::v-deep(.p-tabview-nav-link) {
  padding: 1rem 1.5rem;
}

::v-deep(.p-progressbar) {
  height: 0.5rem;
}
</style>