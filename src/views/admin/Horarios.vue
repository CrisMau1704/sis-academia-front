<template>
  <div class="horarios-container">
    <!-- Toolbar con filtros -->
    <Toolbar class="mb-4">
      <template #start>
        <Button label="Nuevo Horario" icon="pi pi-plus" severity="success" @click="abrirDialogoNuevo" />
      </template>
      <template #end>
        <div class="flex gap-2">
          <Dropdown v-model="filtroSucursal" :options="sucursales" optionLabel="nombre" optionValue="id" 
                    placeholder="Sucursal" class="w-10rem" @change="filtrarHorarios" />
          <Dropdown v-model="filtroDisciplina" :options="disciplinas" optionLabel="nombre" optionValue="id" 
                    placeholder="Disciplina" class="w-10rem" @change="filtrarHorarios" />
          <Dropdown v-model="filtroDia" :options="diasSemana" placeholder="Día" class="w-10rem" @change="filtrarHorarios" />
          <Button icon="pi pi-filter-slash" label="Limpiar" @click="limpiarFiltros" />
        </div>
      </template>
    </Toolbar>

    <!-- Tabla de Horarios -->
    <div class="card">
      <DataTable :value="horariosFiltrados" :paginator="true" :rows="10" dataKey="id"
                 :loading="cargando" paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                 currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} horarios"
                 :rowsPerPageOptions="[5, 10, 20]">
        
        <template #header>
          <div class="flex align-items-center justify-content-between">
            <h4 class="m-0">Lista de Horarios</h4>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <InputText placeholder="Buscar..." v-model="buscar" @keyup.enter="cargarHorarios" />
            </span>
          </div>
        </template>

        <Column field="id" header="ID" :sortable="true" style="width: 70px"></Column>
        <Column header="Horario" style="width: 150px">
          <template #body="slotProps">
            <div class="flex flex-column">
              <Tag :value="slotProps.data.dia_semana" class="mb-1" />
              <span>{{ slotProps.data.hora_inicio.slice(0,5) }} - {{ slotProps.data.hora_fin.slice(0,5) }}</span>
            </div>
          </template>
        </Column>
        <Column field="nombre" header="Clase" :sortable="true"></Column>
        <Column header="Disciplina">
          <template #body="slotProps">
            <Chip :label="slotProps.data.disciplina?.nombre || '--'" 
                  :style="{ backgroundColor: slotProps.data.color }" />
          </template>
        </Column>
        <Column header="Sucursal">
          <template #body="slotProps">
            {{ slotProps.data.sucursal?.nombre || '--' }}
          </template>
        </Column>
        <Column header="Entrenador">
          <template #body="slotProps">
            {{ slotProps.data.entrenador?.nombres || '--' }}
          </template>
        </Column>
        <Column header="Cupo" style="width: 120px">
          <template #body="slotProps">
            <div class="flex flex-column">
              <ProgressBar :value="(slotProps.data.cupo_actual / slotProps.data.cupo_maximo) * 100" 
                           :showValue="false" class="mb-1" />
              <span>{{ slotProps.data.cupo_actual }}/{{ slotProps.data.cupo_maximo }}</span>
            </div>
          </template>
        </Column>
        <Column header="Estado" style="width: 100px">
          <template #body="slotProps">
            <Tag :severity="getSeverityEstado(slotProps.data.estado)" 
                 :value="slotProps.data.estado" />
          </template>
        </Column>
        <Column header="Acciones" style="width: 120px">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm mr-1" 
                    @click="editarHorario(slotProps.data)" />
            <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm" 
                    @click="confirmarEliminar(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Diálogo Nuevo/Editar Horario -->
    <Dialog v-model:visible="dialogoHorario" :header="tituloDialogo" :modal="true" :style="{ width: '50rem' }">
      <div class="grid p-fluid">
        <div class="col-12">
          <div class="field">
            <label for="nombre">Nombre *</label>
            <InputText id="nombre" v-model="horarioForm.nombre" placeholder="Ej: MMA Principiantes" />
            <small class="text-500">Nombre descriptivo de la clase</small>
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="dia_semana">Día de la Semana *</label>
            <Dropdown id="dia_semana" v-model="horarioForm.dia_semana" :options="diasSemana" 
                      placeholder="Seleccionar día" class="w-full" />
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="field">
            <label>Duración: {{ duracionCalculada }}</label>
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="hora_inicio">Hora Inicio *</label>
            <Calendar id="hora_inicio" v-model="horarioForm.hora_inicio_obj" timeOnly hourFormat="24" 
                      :showTime="true" :showSeconds="false" class="w-full" />
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="hora_fin">Hora Fin *</label>
            <Calendar id="hora_fin" v-model="horarioForm.hora_fin_obj" timeOnly hourFormat="24" 
                      :showTime="true" :showSeconds="false" class="w-full" />
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="disciplina_id">Disciplina *</label>
            <Dropdown id="disciplina_id" v-model="horarioForm.disciplina_id" :options="disciplinas" 
                      optionLabel="nombre" optionValue="id" placeholder="Seleccionar disciplina" class="w-full" />
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="sucursal_id">Sucursal *</label>
            <Dropdown id="sucursal_id" v-model="horarioForm.sucursal_id" :options="sucursales" 
                      optionLabel="nombre" optionValue="id" placeholder="Seleccionar sucursal" class="w-full" />
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="entrenador_id">Entrenador *</label>
            <Dropdown id="entrenador_id" v-model="horarioForm.entrenador_id" :options="entrenadores" 
                      optionLabel="nombre_completo" optionValue="id" placeholder="Seleccionar entrenador" class="w-full" />
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="modalidad_id">Modalidad</label>
            <Dropdown id="modalidad_id" v-model="horarioForm.modalidad_id" :options="modalidades" 
                      optionLabel="nombre" optionValue="id" placeholder="Seleccionar modalidad" class="w-full" />
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="cupo_maximo">Cupo Máximo *</label>
            <InputNumber id="cupo_maximo" v-model="horarioForm.cupo_maximo" :min="1" :max="50" 
                         :showButtons="true" class="w-full" />
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="color">Color</label>
            <ColorPicker id="color" v-model="horarioForm.color" format="hex" :inline="false" />
          </div>
        </div>
        
        <div class="col-12">
          <div class="field">
            <label for="descripcion">Descripción</label>
            <Textarea id="descripcion" v-model="horarioForm.descripcion" rows="3" 
                      placeholder="Descripción opcional de la clase..." class="w-full" />
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="cerrarDialogo" />
        <Button label="Guardar" @click="guardarHorario" :loading="guardando" />
      </template>
    </Dialog>

    <!-- Confirmación Eliminar -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

// Services (usa tus métodos existentes)
import horarioService from '@/services/horario.service';
import sucursalService from '@/services/sucursal.service';
import disciplinaService from '@/services/disciplina.service';
import entrenadorService from '@/services/entrenador.service';
import modalidadService from '@/services/modalidad.service';

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
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import ColorPicker from 'primevue/colorpicker';
import Textarea from 'primevue/textarea';
import ConfirmDialog from 'primevue/confirmdialog';

const toast = useToast();
const confirm = useConfirm();

// Estados
const horarios = ref([]);
const sucursales = ref([]);
const disciplinas = ref([]);
const entrenadores = ref([]);
const modalidades = ref([]);
const cargando = ref(false);
const buscar = ref('');

// Filtros
const filtroSucursal = ref(null);
const filtroDisciplina = ref(null);
const filtroDia = ref(null);
const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Diálogos
const dialogoHorario = ref(false);
const tituloDialogo = ref('Nuevo Horario');
const horarioForm = ref(crearHorarioVacio());
const guardando = ref(false);

// Computed
const horariosFiltrados = computed(() => {
  let filtrados = horarios.value;
  
  if (buscar.value) {
    const search = buscar.value.toLowerCase();
    filtrados = filtrados.filter(h => 
      h.nombre.toLowerCase().includes(search) ||
      (h.disciplina?.nombre || '').toLowerCase().includes(search)
    );
  }
  
  if (filtroSucursal.value) {
    filtrados = filtrados.filter(h => h.sucursal_id === filtroSucursal.value);
  }
  
  if (filtroDisciplina.value) {
    filtrados = filtrados.filter(h => h.disciplina_id === filtroDisciplina.value);
  }
  
  if (filtroDia.value) {
    filtrados = filtrados.filter(h => h.dia_semana === filtroDia.value);
  }
  
  return filtrados;
});

const duracionCalculada = computed(() => {
  if (!horarioForm.value.hora_inicio_obj || !horarioForm.value.hora_fin_obj) return '--:--';
  
  const inicio = new Date(horarioForm.value.hora_inicio_obj);
  const fin = new Date(horarioForm.value.hora_fin_obj);
  const diffMs = fin - inicio;
  const diffMins = Math.round(diffMs / 60000);
  
  return `${diffMins} minutos`;
});

// Métodos
function crearHorarioVacio() {
  return {
    id: null,
    nombre: '',
    dia_semana: null,
    hora_inicio_obj: null,
    hora_fin_obj: null,
    disciplina_id: null,
    sucursal_id: null,
    entrenador_id: null,
    modalidad_id: null,
    cupo_maximo: 15,
    color: '#3B82F6',
    descripcion: ''
  };
}

onMounted(() => {
  cargarDatos();
});

async function cargarDatos() {
  cargando.value = true;
  try {
    const [
      horariosRes,
      sucursalesRes,
      disciplinasRes,
      entrenadoresRes,
      modalidadesRes
    ] = await Promise.all([
      horarioService.index ? horarioService.index() : horarioService.getAll(),
      sucursalService.index(1, 100),
      disciplinaService.index ? disciplinaService.index(1, 100) : disciplinaService.getAll(),
      entrenadorService.index ? entrenadorService.index(1, 100) : entrenadorService.getAll(),
      modalidadService.index ? modalidadService.index(1, 100) : modalidadService.getAll()
    ]);
    
    // Extraer datos
    horarios.value = horariosRes.data?.data || horariosRes.data || horariosRes;
    sucursales.value = sucursalesRes.data?.data || sucursalesRes.data || sucursalesRes;
    disciplinas.value = disciplinasRes.data?.data || disciplinasRes.data || disciplinasRes;
    entrenadores.value = entrenadoresRes.data?.data || entrenadoresRes.data || entrenadoresRes;
    modalidades.value = modalidadesRes.data?.data || modalidadesRes.data || modalidadesRes;
    
    // DEBUG: Ver estructura de entrenadores
    console.log('Entrenadores cargados:', entrenadores.value);
    if (entrenadores.value.length > 0) {
      console.log('Primer entrenador:', entrenadores.value[0]);
      console.log('Campos disponibles:', Object.keys(entrenadores.value[0]));
    }
    
    // Formatear nombre completo para entrenadores - VERIFICA LOS CAMPOS REALES
    entrenadores.value = entrenadores.value.map(e => {
      // Ajusta según los campos reales de tu base de datos
      const nombre = e.nombre || e.nombres || '';
      const apellido = e.apellido || e.apellidos || '';
      
      return {
        ...e,
        // Diferentes opciones según tu estructura
        nombre_completo: `${nombre} ${apellido}`.trim() || 'Sin nombre',
        // También puedes mantener el nombre original
        label: `${nombre} ${apellido}`.trim() || 'Sin nombre'
      };
    });
    
    // DEBUG: Ver entrenadores después de formatear
    console.log('Entrenadores formateados:', entrenadores.value);
    
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
function cargarHorarios() {
  // Recargar horarios si es necesario
  cargarDatos();
}

function abrirDialogoNuevo() {
  tituloDialogo.value = 'Nuevo Horario';
  horarioForm.value = crearHorarioVacio();
  dialogoHorario.value = true;
}

function editarHorario(horario) {
  tituloDialogo.value = 'Editar Horario';
  
  // Convertir horas string a objetos Date para el Calendar
  const horaInicioObj = horario.hora_inicio ? crearFechaDesdeHora(horario.hora_inicio) : null;
  const horaFinObj = horario.hora_fin ? crearFechaDesdeHora(horario.hora_fin) : null;
  
  horarioForm.value = {
    id: horario.id,
    nombre: horario.nombre,
    dia_semana: horario.dia_semana,
    hora_inicio_obj: horaInicioObj,
    hora_fin_obj: horaFinObj,
    disciplina_id: horario.disciplina_id,
    sucursal_id: horario.sucursal_id,
    entrenador_id: horario.entrenador_id,
    modalidad_id: horario.modalidad_id,
    cupo_maximo: horario.cupo_maximo,
    color: horario.color,
    descripcion: horario.descripcion || ''
  };
  
  dialogoHorario.value = true;
}

function crearFechaDesdeHora(horaString) {
  if (!horaString) return null;
  const [hours, minutes] = horaString.split(':');
  const fecha = new Date();
  fecha.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return fecha;
}

async function guardarHorario() {
  // Validaciones básicas
  if (!horarioForm.value.nombre || !horarioForm.value.dia_semana || 
      !horarioForm.value.disciplina_id || !horarioForm.value.sucursal_id || 
      !horarioForm.value.entrenador_id || !horarioForm.value.cupo_maximo) {
    toast.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Por favor complete todos los campos requeridos (*)',
      life: 3000
    });
    return;
  }
  
  guardando.value = true;
  
  try {
    // Preparar datos para enviar - SIN campos temporales
    const datos = {
      nombre: horarioForm.value.nombre,
      dia_semana: horarioForm.value.dia_semana,
      disciplina_id: horarioForm.value.disciplina_id,
      sucursal_id: horarioForm.value.sucursal_id,
      entrenador_id: horarioForm.value.entrenador_id,
      modalidad_id: horarioForm.value.modalidad_id,
      cupo_maximo: horarioForm.value.cupo_maximo,
      color: horarioForm.value.color,
      descripcion: horarioForm.value.descripcion || '',
      estado: 'activo' // Siempre activo al crear
    };
    
    // Convertir horas si existen
    if (horarioForm.value.hora_inicio_obj) {
      datos.hora_inicio = new Date(horarioForm.value.hora_inicio_obj).toTimeString().slice(0, 5);
    }
    
    if (horarioForm.value.hora_fin_obj) {
      datos.hora_fin = new Date(horarioForm.value.hora_fin_obj).toTimeString().slice(0, 5);
    }
    
    // Si es edición, agregar ID
    if (horarioForm.value.id) {
      datos.id = horarioForm.value.id;
    }
    
    console.log('Datos a enviar:', datos); // DEBUG
    
    if (datos.id) {
      // Actualizar
      await horarioService.update(datos.id, datos);
      toast.add({
        severity: 'success',
        summary: 'Actualizado',
        detail: 'Horario actualizado correctamente',
        life: 3000
      });
    } else {
      // Crear nuevo - SOLO campos necesarios
      await horarioService.create(datos);
      toast.add({
        severity: 'success',
        summary: 'Creado',
        detail: 'Horario creado correctamente',
        life: 3000
      });
    }
    
    cerrarDialogo();
    await cargarDatos();
    
  } catch (error) {
    console.error('Error completo:', error);
    console.error('Respuesta del error:', error.response);
    
    // Mostrar error más específico
    let mensajeError = 'Error al guardar el horario';
    if (error.response?.data?.errors) {
      // Si hay errores de validación de Laravel
      const errores = Object.values(error.response.data.errors).flat();
      mensajeError = errores.join(', ');
    } else if (error.response?.data?.error) {
      mensajeError = error.response.data.error;
    } else if (error.response?.data?.message) {
      mensajeError = error.response.data.message;
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensajeError,
      life: 5000
    });
  } finally {
    guardando.value = false;
  }
}

function confirmarEliminar(horario) {
  confirm.require({
    message: `¿Está seguro de eliminar el horario "${horario.nombre}"?`,
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await horarioService.delete(horario.id);
        toast.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Horario eliminado correctamente',
          life: 3000
        });
        await cargarDatos();
      } catch (error) {
        const mensajeError = error.response?.data?.error || 'No se pudo eliminar el horario';
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: mensajeError,
          life: 3000
        });
      }
    }
  });
}

function cerrarDialogo() {
  dialogoHorario.value = false;
  horarioForm.value = crearHorarioVacio();
}

function filtrarHorarios() {
  // Los filtros se aplican automáticamente en el computed
}

function limpiarFiltros() {
  filtroSucursal.value = null;
  filtroDisciplina.value = null;
  filtroDia.value = null;
  buscar.value = '';
}

function getSeverityEstado(estado) {
  switch (estado) {
    case 'activo': return 'success';
    case 'inactivo': return 'danger';
    case 'completo': return 'warning';
    default: return 'info';
  }
}
</script>

<style scoped>
.horarios-container {
  padding: 1rem;
}

::v-deep(.p-datatable-thead > tr > th) {
  background-color: #65a8d4;
  color: white;
  font-weight: bold;
}

::v-deep(.p-paginator) {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
}

::v-deep(.p-datatable) {
  border: 1px solid #dee2e6;
  border-radius: 6px;
}

.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
</style>