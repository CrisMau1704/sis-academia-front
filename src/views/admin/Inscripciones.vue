<template>
  <div class="inscripciones-container">
    <!-- Header -->
    <div class="header mb-4">
      <h1><i class="pi pi-user-plus mr-2"></i> Inscripciones de Estudiantes</h1>
      <p>Registra nuevas inscripciones y gestiona las existentes</p>
    </div>

    <!-- Toolbar -->
    <Toolbar class="mb-4">
      <template #start>
        <Button label="Nueva Inscripción" icon="pi pi-plus" severity="success" @click="abrirDialogoNueva" />
        <Button label="Renovar Mes" icon="pi pi-refresh" @click="mostrarRenovaciones" class="ml-2" />
      </template>
      <template #end>
        <div class="flex gap-2">
          <Dropdown v-model="filtroEstado" :options="estadosInscripcion" optionLabel="label" optionValue="value"
            placeholder="Estado" class="w-10rem" @change="filtrarInscripciones" />
          <Dropdown v-model="filtroModalidad" :options="modalidades" optionLabel="nombre" optionValue="id"
            placeholder="Modalidad" class="w-10rem" @change="filtrarInscripciones" />
          <Button icon="pi pi-filter-slash" label="Limpiar" @click="limpiarFiltros" />
        </div>
      </template>
    </Toolbar>

    <!-- Tabla de Inscripciones -->
    <div class="card">
      <DataTable :value="inscripcionesFiltradas" :paginator="true" :rows="10" dataKey="id" :loading="cargando"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} inscripciones"
        :rowsPerPageOptions="[5, 10, 20]">

        <template #header>
          <div class="flex align-items-center justify-content-between">
            <h4 class="m-0">Inscripciones Activas</h4>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <InputText placeholder="Buscar estudiante..." v-model="buscar" />
            </span>
          </div>
        </template>

        <Column field="id" header="ID" :sortable="true" style="width: 70px"></Column>
        <Column header="Estudiante" :sortable="true" sortField="estudiante.nombres">
          <template #body="slotProps">
            <div class="flex align-items-center">
              <Avatar :label="slotProps.data.estudiante?.nombres?.charAt(0)" class="mr-2" size="small" shape="circle" />
              <div>
                <div>{{ slotProps.data.estudiante?.nombres }} {{ slotProps.data.estudiante?.apellidos }}</div>
                <small class="text-500">{{ slotProps.data.estudiante?.telefono }}</small>
              </div>
            </div>
          </template>
        </Column>
        <Column header="Modalidad">
          <template #body="slotProps">
            <Chip :label="slotProps.data.modalidad?.nombre" class="mb-1" />
            <div class="text-sm">
              <small>{{ slotProps.data.modalidad?.clases_mensuales }} clases/mes</small>
            </div>
          </template>
        </Column>
        <Column header="Horarios" style="min-width: 200px">
          <template #body="slotProps">
            <div v-if="slotProps.data.horarios && slotProps.data.horarios.length > 0">
              <div v-for="horario in slotProps.data.horarios" :key="horario.id" class="mb-1">
                <Tag :value="horario.dia_semana" class="mr-1" />
                <small>{{ horario.hora_inicio.slice(0, 5) }}</small>
              </div>
            </div>
            <div v-else class="text-500">
              <small>Sin horarios asignados</small>
            </div>
          </template>
        </Column>
        <Column header="Clases" style="width: 150px">
          <template #body="slotProps">
            <div class="flex flex-column">
              <div class="flex justify-content-between">
                <span class="font-bold">{{ slotProps.data.clases_restantes || 0 }}</span>
                <small class="text-500">restantes</small>
              </div>
              <ProgressBar
                :value="((slotProps.data.clases_totales - slotProps.data.clases_restantes) / slotProps.data.clases_totales) * 100"
                :showValue="false" class="mt-1" />
              <small>{{ slotProps.data.clases_totales - slotProps.data.clases_restantes }}/{{
                slotProps.data.clases_totales }} tomadas</small>
            </div>
          </template>
        </Column>
        <Column header="Permisos" style="width: 100px">
          <template #body="slotProps">
            <div class="flex flex-column align-items-center">
              <span class="font-bold" :class="{ 'text-red-500': slotProps.data.permisos_usados >= 3 }">
                {{ slotProps.data.permisos_usados || 0 }}/3
              </span>
              <small class="text-500">usados</small>
            </div>
          </template>
        </Column>
        <Column header="Vencimiento">
          <template #body="slotProps">
            <div class="flex flex-column">
              <div>{{ slotProps.data.fecha_fin ? formatFecha(slotProps.data.fecha_fin) : '--' }}</div>
              <Tag v-if="slotProps.data.fecha_fin" :severity="getSeveridadVencimiento(slotProps.data.fecha_fin)"
                :value="getDiasRestantes(slotProps.data.fecha_fin)" />
            </div>
          </template>
        </Column>
        <Column header="Estado" style="width: 100px">
          <template #body="slotProps">
            <Tag :severity="getSeveridadEstado(slotProps.data.estado)" :value="slotProps.data.estado" />
          </template>
        </Column>
        <Column header="Acciones" style="width: 150px">
          <template #body="slotProps">
            <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm mr-1"
              @click="verDetalles(slotProps.data)" v-tooltip="'Ver detalles'" />
            <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm mr-1"
              @click="editarInscripcion(slotProps.data)" v-tooltip="'Editar'" />
            <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm"
              @click="confirmarEliminar(slotProps.data)" v-tooltip="'Eliminar'" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Diálogo Nueva/Editar Inscripción -->
    <Dialog v-model:visible="dialogoInscripcion" :header="tituloDialogo" :modal="true" :style="{ width: '60rem' }"
      :closable="false">

      <!-- Paso 1: Seleccionar Estudiante -->
      <div v-if="pasoActual === 1" class="paso-1">
        <h3 class="mb-3">1. Seleccionar Estudiante</h3>
        <div class="card">
          <DataTable :value="estudiantes" selectionMode="single" v-model:selection="estudianteSeleccionado" dataKey="id"
            :loading="cargandoEstudiantes" class="p-datatable-sm">
            <Column selectionMode="single" headerStyle="width: 3rem"></Column>
            <Column field="nombres" header="Nombre"></Column>
            <Column field="apellidos" header="Apellidos"></Column>
            <Column field="telefono" header="Teléfono"></Column>
            <Column field="estado" header="Estado">
              <template #body="slotProps">
                <Tag :value="slotProps.data.estado"
                  :severity="slotProps.data.estado === 'activo' ? 'success' : 'danger'" />
              </template>
            </Column>
          </DataTable>
        </div>

        <div class="flex justify-content-between mt-4">
          <Button label="Cancelar" severity="secondary" @click="cerrarDialogo" />
          <Button label="Siguiente" :disabled="!estudianteSeleccionado" @click="siguientePaso" />
        </div>
      </div>

      <!-- En Inscripciones.vue - Paso 2: Modalidades -->
      <div v-else-if="pasoActual === 2" class="paso-2">
        <h3 class="mb-3">2. Seleccionar Modalidad</h3>
        <div class="grid">
          <div v-for="modalidad in modalidades" :key="modalidad.id" class="col-12 md:col-6"
            v-if="modalidad.estado === 'activo'">
            <Card class="modalidad-card" @click="seleccionarModalidad(modalidad)"
              :class="{ 'selected': inscripcionForm.modalidad_id === modalidad.id }">
              <template #title>{{ modalidad.nombre }}</template>
              <template #content>
                <div class="modalidad-info">
                  <div class="feature">
                    <i class="pi pi-calendar mr-2"></i>
                    <span>{{ modalidad.clases_totales }} clases en total</span>
                  </div>
                  <div class="feature">
                    <i class="pi pi-calendar-times mr-2"></i>
                    <span>{{ modalidad.clases_por_semana }} clases por semana</span>
                  </div>
                  <div class="feature">
                    <i class="pi pi-clock mr-2"></i>
                    <span>Duración: {{ modalidad.duracion_dias }} días</span>
                  </div>
                  <div class="feature">
                    <i class="pi pi-check-circle mr-2"></i>
                    <span>{{ modalidad.permisos_maximos }} permisos justificados</span>
                  </div>
                  <div class="feature">
                    <i class="pi pi-info-circle mr-2"></i>
                    <span>{{ calcularClasesPorMes(modalidad) }} aprox. por mes</span>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>

        <div class="flex justify-content-between mt-4">
          <Button label="Atrás" severity="secondary" @click="pasoActual = 1" />
          <Button label="Siguiente" :disabled="!inscripcionForm.modalidad_id" @click="siguientePaso" />
        </div>
      </div>

      <!-- Paso 3: Seleccionar Horarios -->
      <div v-else-if="pasoActual === 3" class="paso-3">
        <h3 class="mb-3">3. Seleccionar Horarios</h3>
        <p class="mb-4">Selecciona los días y horarios que el estudiante asistirá (Máximo: {{ maxHorariosPermitidos }})
        </p>

        <div class="grid">
          <div v-for="dia in diasSemana" :key="dia" class="col-12 md:col-6 lg:col-4">
            <div class="card dia-card">
              <h5 class="mb-3">{{ dia }}</h5>
              <div v-for="horario in horariosPorDia[dia]" :key="horario.id" class="horario-option mb-2">
                <Checkbox :id="`horario-${horario.id}`" :value="horario.id" v-model="horariosSeleccionados"
                  :disabled="!horario.tiene_cupo && !horariosSeleccionados.includes(horario.id)" />
                <label :for="`horario-${horario.id}`" class="ml-2">
                  <div class="horario-info">
                    <div class="horario-hora">{{ horario.hora_inicio.slice(0, 5) }} - {{ horario.hora_fin.slice(0, 5) }}
                    </div>
                    <div class="horario-detalle">
                      <small>{{ horario.nombre }}</small>
                      <small class="text-500">{{ horario.disciplina?.nombre }} - {{ horario.entrenador?.nombres
                        }}</small>
                    </div>
                    <Tag :value="horario.cupo_actual + '/' + horario.cupo_maximo"
                      :severity="horario.tiene_cupo ? 'success' : 'danger'" size="small" />
                  </div>
                </label>
              </div>
              <div v-if="!horariosPorDia[dia]?.length" class="text-center text-500 py-3">
                <small>No hay horarios disponibles</small>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 p-3 border-round border-1 surface-border">
          <h5>Resumen de Selección</h5>
          <div v-if="horariosSeleccionados.length > 0">
            <div v-for="horarioId in horariosSeleccionados" :key="horarioId" class="mb-2">
              <i class="pi pi-check-circle text-green-500 mr-2"></i>
              {{ getHorarioInfo(horarioId) }}
            </div>
          </div>
          <div v-else class="text-500">
            <small>No hay horarios seleccionados</small>
          </div>
        </div>

        <div class="flex justify-content-between mt-4">
          <Button label="Atrás" severity="secondary" @click="pasoActual = 2" />
          <Button label="Siguiente" :disabled="horariosSeleccionados.length === 0" @click="siguientePaso" />
        </div>
      </div>

      <!-- Paso 4: Confirmar y Guardar -->
      <div v-else-if="pasoActual === 4" class="paso-4">
        <h3 class="mb-3">4. Confirmar Inscripción</h3>

        <div class="card mb-4">
          <div class="grid">
            <div class="col-12">
              <h4>Resumen Final</h4>
            </div>

            <div class="col-12 md:col-6">
              <div class="info-group mb-3">
                <label class="font-bold">Estudiante:</label>
                <div>{{ estudianteSeleccionado?.nombres }} {{ estudianteSeleccionado?.apellidos }}</div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="info-group mb-3">
                <label class="font-bold">Modalidad:</label>
                <div>{{ modalidadSeleccionada?.nombre }} - {{ modalidadSeleccionada?.clases_mensuales }} clases/mes
                </div>
              </div>
            </div>

            <div class="col-12">
              <div class="info-group mb-3">
                <label class="font-bold">Horarios Seleccionados:</label>
                <div>
                  <ul class="list-none p-0 m-0">
                    <li v-for="horarioId in horariosSeleccionados" :key="horarioId" class="mb-1">
                      <i class="pi pi-calendar mr-2"></i>{{ getHorarioInfo(horarioId) }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="info-group mb-3">
                <label class="font-bold">Clases Totales:</label>
                <div>{{ modalidadSeleccionada?.clases_mensuales }} por mes</div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="info-group mb-3">
                <label class="font-bold">Permisos:</label>
                <div>{{ modalidadSeleccionada?.permisos_maximos || 3 }} justificados por mes</div>
              </div>
            </div>

            <div class="col-12">
              <div class="info-group mb-3">
                <label class="font-bold">Inicio:</label>
                <div>{{ formatFecha(new Date()) }}</div>
              </div>
            </div>

            <div class="col-12">
              <div class="info-group mb-3">
                <label class="font-bold">Fin:</label>
                <div>{{ formatFecha(calcularFechaFin()) }} (1 mes)</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-content-between mt-4">
          <Button label="Atrás" severity="secondary" @click="pasoActual = 3" />
          <div class="flex gap-2">
            <Button label="Cancelar" severity="secondary" @click="cerrarDialogo" />
            <Button label="Confirmar Inscripción" @click="guardarInscripcion" :loading="guardando" />
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Diálogo Detalles -->
    <Dialog v-model:visible="dialogoDetalles" header="Detalles de Inscripción" :modal="true"
      :style="{ width: '50rem' }">
      <div v-if="inscripcionDetalle" class="detalles-container">
        <!-- Contenido de detalles -->
      </div>
    </Dialog>

    <!-- Confirmación Eliminar -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

// Services
import inscripcionService from '@/services/inscripcion.service';
import estudianteService from '@/services/estudiante.service';
import modalidadService from '@/services/modalidad.service';
import horarioService from '@/services/horario.service';
import sucursalService from '@/services/sucursal.service';

// Components
import Toolbar from 'primevue/toolbar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Chip from 'primevue/chip';
import ProgressBar from 'primevue/progressbar';
import Avatar from 'primevue/avatar';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import ConfirmDialog from 'primevue/confirmdialog';

const toast = useToast();
const confirm = useConfirm();

// Estados
const inscripciones = ref([]);
const estudiantes = ref([]);
const modalidades = ref([]);
const horarios = ref([]);
const sucursales = ref([]);
const cargando = ref(false);
const cargandoEstudiantes = ref(false);
const buscar = ref('');

// Filtros
const filtroEstado = ref(null);
const filtroModalidad = ref(null);
const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Diálogos y pasos
const dialogoInscripcion = ref(false);
const dialogoDetalles = ref(false);
const pasoActual = ref(1);
const tituloDialogo = ref('Nueva Inscripción');
const guardando = ref(false);

// Selecciones
const estudianteSeleccionado = ref(null);
const horariosSeleccionados = ref([]);
const inscripcionForm = ref(crearInscripcionVacia());
const inscripcionDetalle = ref(null);

// Estados disponibles
const estadosInscripcion = [
  { label: 'Activo', value: 'activo' },
  { label: 'Inactivo', value: 'inactivo' },
  { label: 'Vencido', value: 'vencido' },
  { label: 'Finalizado', value: 'finalizado' }
];

// Computed
const inscripcionesFiltradas = computed(() => {
  let filtradas = inscripciones.value;

  if (buscar.value) {
    const search = buscar.value.toLowerCase();
    filtradas = filtradas.filter(i =>
      i.estudiante?.nombres?.toLowerCase().includes(search) ||
      i.estudiante?.apellidos?.toLowerCase().includes(search)
    );
  }

  if (filtroEstado.value) {
    filtradas = filtradas.filter(i => i.estado === filtroEstado.value);
  }

  if (filtroModalidad.value) {
    filtradas = filtradas.filter(i => i.modalidad_id === filtroModalidad.value);
  }

  return filtradas;
});

const horariosPorDia = computed(() => {
  const agrupados = {};
  diasSemana.forEach(dia => {
    agrupados[dia] = horarios.value.filter(h =>
      h.dia_semana === dia &&
      h.estado === 'activo' &&
      h.tiene_cupo
    );
  });
  return agrupados;
});

const modalidadSeleccionada = computed(() => {
  return modalidades.value.find(m => m.id === inscripcionForm.value.modalidad_id);
});

const maxHorariosPermitidos = computed(() => {
  return modalidadSeleccionada.value?.clases_mensuales || 12;
});

// Métodos
function crearInscripcionVacia() {
  return {
    id: null,
    estudiante_id: null,
    modalidad_id: null,
    clases_totales: 12,
    clases_restantes: 12,
    permisos_usados: 0,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: calcularFechaFin(),
    estado: 'activo'
  };
}

function calcularFechaFin() {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() + 1);
  return fecha.toISOString().split('T')[0];
}

onMounted(() => {
  cargarDatos();
});

// En Inscripciones.vue - método cargarDatos()
async function cargarDatos() {
  cargando.value = true;
  try {
    const [inscripcionesRes, estudiantesRes, modalidadesRes] = await Promise.all([
      // Usa index() o el método que tengas en cada service
      inscripcionService.index ? inscripcionService.index() : inscripcionService.getAll(),
      estudianteService.index(1, 100),  // TU método index con paginación
      modalidadService.index ? modalidadService.index(1, 100) : modalidadService.getAll()
    ]);

    // Extraer datos según tu estructura
    inscripciones.value = inscripcionesRes.data?.data || inscripcionesRes.data || inscripcionesRes;
    estudiantes.value = estudiantesRes.data?.data || estudiantesRes.data || estudiantesRes;
    modalidades.value = modalidadesRes.data?.data || modalidadesRes.data || modalidadesRes;

  } catch (error) {
    console.error('Error cargando datos:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos',
      life: 3000
    });
  } finally {
    cargando.value = false;
  }
}

function abrirDialogoNueva() {
  tituloDialogo.value = 'Nueva Inscripción';
  pasoActual.value = 1;
  estudianteSeleccionado.value = null;
  horariosSeleccionados.value = [];
  inscripcionForm.value = crearInscripcionVacia();
  dialogoInscripcion.value = true;
}

function siguientePaso() {
  if (pasoActual.value === 1 && estudianteSeleccionado.value) {
    inscripcionForm.value.estudiante_id = estudianteSeleccionado.value.id;
    pasoActual.value = 2;
  } else if (pasoActual.value === 2 && inscripcionForm.value.modalidad_id) {
    pasoActual.value = 3;
  } else if (pasoActual.value === 3 && horariosSeleccionados.value.length > 0) {
    pasoActual.value = 4;
  }
}

function seleccionarModalidad(modalidad) {
  inscripcionForm.value.modalidad_id = modalidad.id;
  inscripcionForm.value.clases_totales = modalidad.clases_mensuales;
  inscripcionForm.value.clases_restantes = modalidad.clases_mensuales;
}

function getHorarioInfo(horarioId) {
  const horario = horarios.value.find(h => h.id === horarioId);
  if (!horario) return 'Horario no encontrado';
  return `${horario.dia_semana} ${horario.hora_inicio.slice(0, 5)} - ${horario.nombre}`;
}

async function guardarInscripcion() {
  guardando.value = true;
  
  try {
    // Validar que se seleccionaron horarios
    if (horariosSeleccionados.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debe seleccionar al menos un horario',
        life: 3000
      });
      return;
    }
    
    // Validar según modalidad
    if (modalidadSeleccionada.value) {
      const maxRecomendado = modalidadSeleccionada.value.clases_por_semana;
      if (horariosSeleccionados.value.length > maxRecomendado * 2) {
        toast.add({
          severity: 'warn',
          summary: 'Validación',
          detail: `Para ${modalidadSeleccionada.value.nombre} se recomienda máximo ${maxRecomendado * 2} horarios`,
          life: 3000
        });
        return;
      }
    }
    
    // Preparar datos
    const datos = {
      estudiante_id: inscripcionForm.value.estudiante_id,
      modalidad_id: inscripcionForm.value.modalidad_id,
      horarios: horariosSeleccionados.value
    };
    
    console.log('Datos a enviar:', datos);
    
    // Enviar al backend
    const response = await inscripcionService.create(datos);
    
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Inscripción creada para ${modalidadSeleccionada.value.nombre}`,
      life: 3000
    });
    
    cerrarDialogo();
    await cargarDatos();
    
  } catch (error) {
    console.error('Error guardando inscripción:', error);
    const mensajeError = error.response?.data?.error || 'Error al guardar la inscripción';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensajeError,
      life: 3000
    });
  } finally {
    guardando.value = false;
  }
}

function cerrarDialogo() {
  dialogoInscripcion.value = false;
  pasoActual.value = 1;
  estudianteSeleccionado.value = null;
  horariosSeleccionados.value = [];
  inscripcionForm.value = crearInscripcionVacia();
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

  if (diffDays < 0) return 'Vencido';
  if (diffDays === 0) return 'Hoy vence';
  return `${diffDays} días`;
}

function getSeveridadVencimiento(fechaFin) {
  const hoy = new Date();
  const fin = new Date(fechaFin);
  const diffTime = fin - hoy;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'danger';
  if (diffDays <= 7) return 'warning';
  return 'success';
}

function getSeveridadEstado(estado) {
  switch (estado) {
    case 'activo': return 'success';
    case 'inactivo': return 'danger';
    case 'vencido': return 'warning';
    case 'finalizado': return 'info';
    default: return 'info';
  }
}

function editarInscripcion(inscripcion) {
  // Implementar edición
}

function verDetalles(inscripcion) {
  inscripcionDetalle.value = inscripcion;
  dialogoDetalles.value = true;
}

function confirmarEliminar(inscripcion) {
  confirm.require({
    message: `¿Está seguro de eliminar la inscripción de ${inscripcion.estudiante?.nombres}?`,
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await inscripcionService.delete(inscripcion.id);
        toast.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Inscripción eliminada correctamente',
          life: 3000
        });
        await cargarDatos();
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar la inscripción',
          life: 3000
        });
      }
    }
  });
}

function filtrarInscripciones() {
  // Los filtros se aplican en computed
}

function limpiarFiltros() {
  filtroEstado.value = null;
  filtroModalidad.value = null;
  buscar.value = '';
}

function mostrarRenovaciones() {
  // Implementar renovaciones masivas
}
</script>

<style scoped>
.inscripciones-container {
  padding: 1rem;
}

.header h1 {
  color: var(--primary-color);
  margin: 0;
}

.modalidad-card {
  cursor: pointer;
  transition: all 0.2s;
}

.modalidad-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modalidad-card.selected {
  border: 2px solid var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.modalidad-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature {
  display: flex;
  align-items: center;
}

.dia-card {
  height: 100%;
  min-height: 200px;
}

.horario-option {
  display: flex;
  align-items: flex-start;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.horario-option:hover {
  background-color: #f8f9fa;
}

.horario-info {
  flex: 1;
}

.horario-hora {
  font-weight: 600;
  margin-bottom: 0.125rem;
}

.horario-detalle {
  display: flex;
  flex-direction: column;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-group label {
  color: #6b7280;
  font-size: 0.875rem;
}

::v-deep(.p-datatable-thead > tr > th) {
  background-color: #65a8d4;
  color: white;
  font-weight: bold;
}

::v-deep(.p-progressbar) {
  height: 0.5rem;
}
</style>