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
     <!-- Tabla de Horarios - En tu archivo actual -->
<DataTable :value="horariosFiltrados" :paginator="true" :rows="10" dataKey="id"
           :loading="cargando" 
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

  <!-- COLUMNAS EN ORDEN LÓGICO -->
  <Column field="id" header="ID" :sortable="true" style="width: 70px"></Column>
  
  <!-- 1. Día de la semana -->
  <Column header="Día" style="width: 120px" :sortable="true" sortField="dia_semana">
    <template #body="slotProps">
      <div class="flex flex-column align-items-start">
        <Tag :value="slotProps.data.dia_semana" 
             :severity="getSeverityDia(slotProps.data.dia_semana)" 
             class="mb-1" />
        <small v-if="slotProps.data.es_recurrente" class="text-xs text-500">
          <i class="pi pi-sync mr-1"></i>Recurrente
        </small>
      </div>
    </template>
  </Column>
  
  <!-- 2. Horario (hora inicio - fin) -->
  <Column header="Horario" style="width: 110px">
    <template #body="slotProps">
      <div class="flex flex-column align-items-center">
        <span class="font-bold">{{ slotProps.data.hora_inicio?.slice(0,5) || '--:--' }}</span>
        <i class="pi pi-arrow-down text-xs text-500 my-1"></i>
        <span class="font-bold">{{ slotProps.data.hora_fin?.slice(0,5) || '--:--' }}</span>
        <small class="text-xs text-500 mt-1">
          {{ slotProps.data.duracion_minutos || 60 }} min
        </small>
      </div>
    </template>
  </Column>
  
  <!-- 3. Nombre de la clase -->
  <Column header="Clase" :sortable="true" sortField="nombre" style="min-width: 150px">
    <template #body="slotProps">
      <div class="flex flex-column">
        <span class="font-medium">{{ slotProps.data.nombre }}</span>
        <small v-if="slotProps.data.descripcion" class="text-500 text-xs truncate">
          {{ slotProps.data.descripcion }}
        </small>
      </div>
    </template>
  </Column>
  
  <!-- 4. Disciplina -->
  <Column header="Disciplina" :sortable="true" sortField="disciplina.nombre">
    <template #body="slotProps">
      <Chip :label="slotProps.data.disciplina?.nombre || '--'" 
            :style="{ 
              backgroundColor: slotProps.data.color || '#3B82F6',
              color: 'white'
            }" />
    </template>
  </Column>
  
  <!-- 5. Sucursal -->
  <Column header="Sucursal" :sortable="true" sortField="sucursal.nombre">
    <template #body="slotProps">
      {{ slotProps.data.sucursal?.nombre || '--' }}
    </template>
  </Column>
  
  <!-- 6. Entrenador -->
  <Column header="Entrenador" :sortable="true" sortField="entrenador.nombres">
    <template #body="slotProps">
      <div class="flex align-items-center">
        <Avatar :label="getInicialesEntrenador(slotProps.data.entrenador)" 
                size="small" 
                shape="circle" 
                class="mr-2" 
                :style="{ backgroundColor: slotProps.data.color || '#3B82F6' }" />
        <span>{{ slotProps.data.entrenador?.nombres || '--' }} {{ slotProps.data.entrenador?.apellidos || '--' }}</span>
      </div>
    </template>
  </Column>
  
  <!-- 7. Cupo -->
  <Column header="Cupo" style="width: 130px">
    <template #body="slotProps">
      <div class="flex flex-column">
        <div class="flex justify-content-between align-items-center mb-1">
          <span class="text-sm">{{ slotProps.data.cupo_actual }}/{{ slotProps.data.cupo_maximo }}</span>
          <span class="text-xs font-bold" 
                :class="getColorCupo(slotProps.data.cupo_actual, slotProps.data.cupo_maximo)">
            {{ Math.round((slotProps.data.cupo_actual / slotProps.data.cupo_maximo) * 100) }}%
          </span>
        </div>
        <ProgressBar :value="(slotProps.data.cupo_actual / slotProps.data.cupo_maximo) * 100" 
                     :showValue="false" 
                     :style="{ height: '6px' }" />
      </div>
    </template>
  </Column>
  
  <!-- 8. Estado -->
  <Column header="Estado" style="width: 100px">
    <template #body="slotProps">
      <Tag :severity="getSeverityEstado(slotProps.data.estado)" 
           :value="slotProps.data.estado"
           rounded />
    </template>
  </Column>
  
  <!-- 9. Acciones -->
  <Column header="Acciones" style="width: 100px">
    <template #body="slotProps">
      <div class="flex gap-1">
        <Button icon="pi pi-pencil" 
                class="p-button-rounded p-button-text p-button-sm" 
                @click="editarHorario(slotProps.data)"
                v-tooltip="'Editar'" />
        <Button icon="pi pi-trash" 
                class="p-button-rounded p-button-text p-button-danger p-button-sm" 
                @click="confirmarEliminar(slotProps.data)"
                v-tooltip="'Eliminar'" />
      </div>
    </template>
  </Column>
</DataTable>
<Toast ref="toast" />
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
        
        <div class="col-12">
  <div class="field">
    <label for="dias_semana">Días de la Semana *</label>
    
    <!-- MultiSelect para seleccionar múltiples días -->
    <MultiSelect 
      id="dias_semana"
      v-model="horarioForm.dias_semana_seleccionados"
      :options="diasSemana"
      optionLabel="label"
      optionValue="value"
      placeholder="Seleccione días"
      display="chip"
      class="w-full"
      :maxSelectedLabels="3"
      :showToggleAll="false"
    >
      <template #option="slotProps">
        <div class="flex align-items-center">
          <i class="pi pi-calendar mr-2"></i>
          <span>{{ slotProps.option.label }}</span>
        </div>
      </template>
    </MultiSelect>
    
    <small class="text-500">Seleccione uno o más días para este horario</small>
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
import { useConfirm } from 'primevue/useconfirm';
import Toast from 'primevue/toast'; // Importación del componente

// Services
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
import Avatar from 'primevue/avatar';
// No necesitas importar Toast aquí ya que lo importaste arriba

const confirm = useConfirm();

// ========== ESTA ES LA LÍNEA QUE FALTA ==========
const toast = ref(null);
// ================================================

// Estados
const horarios = ref([]);
const sucursales = ref([]);
const disciplinas = ref([]);
const entrenadores = ref([]);
const modalidades = ref([]);
const cargando = ref(false);
const buscar = ref('');

// ... resto de tu código ...

// Filtros
const filtroSucursal = ref(null);
const filtroDisciplina = ref(null);
const filtroDia = ref(null);
const diasSemana = ref([
  { label: 'Lunes', value: 'Lunes' },
  { label: 'Martes', value: 'Martes' },
  { label: 'Miércoles', value: 'Miércoles' },
  { label: 'Jueves', value: 'Jueves' },
  { label: 'Viernes', value: 'Viernes' },
  { label: 'Sábado', value: 'Sábado' },
  { label: 'Domingo', value: 'Domingo' }
]);

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
    dias_semana_seleccionados: [], // ← Array para múltiples días
    dia_semana: null, // ← Mantener para compatibilidad
    hora_inicio_obj: null,
    hora_fin_obj: null,
    disciplina_id: null,
    sucursal_id: null,
    entrenador_id: null,
    modalidad_id: null,
    cupo_maximo: 15,
    color: '#3B82F6',
    descripcion: '',
    es_recurrente: false // ← Nuevo campo
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
    toast.value.add({
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
  
  // Convertir horas string a objetos Date
  const horaInicioObj = horario.hora_inicio ? crearFechaDesdeHora(horario.hora_inicio) : null;
  const horaFinObj = horario.hora_fin ? crearFechaDesdeHora(horario.hora_fin) : null;
  
  // Para edición, solo mostramos el día actual (por simplicidad)
  horarioForm.value = {
    id: horario.id,
    nombre: horario.nombre.replace(/\s*\([^)]*\)$/, ''), // Remover "(Día)" si existe
    dias_semana_seleccionados: [horario.dia_semana], // Array con un solo día
    dia_semana: horario.dia_semana, // Mantener para compatibilidad
    hora_inicio_obj: horaInicioObj,
    hora_fin_obj: horaFinObj,
    disciplina_id: horario.disciplina_id,
    sucursal_id: horario.sucursal_id,
    entrenador_id: horario.entrenador_id,
    modalidad_id: horario.modalidad_id,
    cupo_maximo: horario.cupo_maximo,
    color: horario.color || '#3B82F6',
    descripcion: horario.descripcion || '',
    es_recurrente: false
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
  if (!horarioForm.value.nombre || 
      !horarioForm.value.dias_semana_seleccionados || 
      horarioForm.value.dias_semana_seleccionados.length === 0 ||
      !horarioForm.value.disciplina_id || 
      !horarioForm.value.sucursal_id || 
      !horarioForm.value.entrenador_id || 
      !horarioForm.value.cupo_maximo) {
    toast.value.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Por favor complete todos los campos requeridos (*)',
      life: 3000
    });
    return;
  }

  // Validar horas
  if (!horarioForm.value.hora_inicio_obj || !horarioForm.value.hora_fin_obj) {
    toast.value.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Por favor seleccione hora de inicio y fin',
      life: 3000
    });
    return;
  }

  // Validar que hora fin sea mayor que hora inicio
  const inicio = new Date(horarioForm.value.hora_inicio_obj);
  const fin = new Date(horarioForm.value.hora_fin_obj);
  if (fin <= inicio) {
    toast.value.add({
      severity: 'error',
      summary: 'Error en horario',
      detail: 'La hora de fin debe ser mayor que la hora de inicio',
      life: 3000
    });
    return;
  }

  // ========== NUEVA VALIDACIÓN: Verificar conflictos con horarios existentes ==========
  const tieneConflictos = verificarConflictosFrontend();
  if (tieneConflictos) {
    // El mensaje de error ya se mostró en la función verificarConflictosFrontend
    return;
  }

  guardando.value = true;
  
  try {
    // Preparar datos base
    const datosBase = {
      nombre: horarioForm.value.nombre,
      disciplina_id: horarioForm.value.disciplina_id,
      sucursal_id: horarioForm.value.sucursal_id,
      entrenador_id: horarioForm.value.entrenador_id,
      modalidad_id: horarioForm.value.modalidad_id || null,
      cupo_maximo: horarioForm.value.cupo_maximo,
      cupo_actual: 0,
      color: horarioForm.value.color,
      descripcion: horarioForm.value.descripcion || '',
      estado: 'activo',
      es_recurrente: horarioForm.value.dias_semana_seleccionados.length > 1
    };

    // Convertir horas
    const horaInicio = new Date(horarioForm.value.hora_inicio_obj).toTimeString().slice(0, 5);
    const horaFin = new Date(horarioForm.value.hora_fin_obj).toTimeString().slice(0, 5);
    
    // Calcular duración
    const duracionMinutos = Math.round((fin - inicio) / 60000);
    
    datosBase.hora_inicio = horaInicio;
    datosBase.hora_fin = horaFin;
    datosBase.duracion_minutos = duracionMinutos;
    
    console.log('Datos base:', datosBase);
    console.log('Días seleccionados:', horarioForm.value.dias_semana_seleccionados);
    
    let resultados = [];
    
    if (horarioForm.value.id) {
      // EDICIÓN: Solo actualizar un horario existente
      datosBase.dia_semana = horarioForm.value.dias_semana_seleccionados[0];
      const response = await horarioService.update(horarioForm.value.id, datosBase);
      resultados.push(response);
      
      toast.value.add({
        severity: 'success',
        summary: 'Actualizado',
        detail: 'Horario actualizado correctamente',
        life: 3000
      });
    } else {
      // CREACIÓN: Crear un horario para CADA día seleccionado
      // Usamos Promise.allSettled para manejar errores individuales
      const promesas = horarioForm.value.dias_semana_seleccionados.map(dia => {
        const datosHorario = {
          ...datosBase,
          nombre: `${horarioForm.value.nombre} (${dia})`,
          dia_semana: dia
        };
        
        console.log(`Creando horario para ${dia}:`, datosHorario);
        
        return horarioService.store(datosHorario);
      });
      
      // ========== NUEVO: Manejo mejorado de errores ==========
      const resultadosSettled = await Promise.allSettled(promesas);
      
      const exitosos = resultadosSettled.filter(r => r.status === 'fulfilled');
      const fallidos = resultadosSettled.filter(r => r.status === 'rejected');
      
      resultados = exitosos.map(r => r.value);
      
      if (fallidos.length > 0) {
        // Extraer mensajes de error específicos
        const errores = fallidos.map((f, index) => {
          const dia = horarioForm.value.dias_semana_seleccionados[index];
          const mensaje = f.reason?.response?.data?.error || 
                          f.reason?.response?.data?.message || 
                          'Error desconocido';
          return `${dia}: ${mensaje}`;
        });
        
        // Mostrar errores específicos
        if (exitosos.length > 0) {
          // Algunos se crearon, otros no
          toast.value.add({
            severity: 'warn',
            summary: 'Resultado parcial',
            detail: `Se crearon ${exitosos.length} horarios. Errores: ${errores.join('; ')}`,
            life: 6000
          });
        } else {
          // Todos fallaron
          toast.value.add({
            severity: 'error',
            summary: 'Error',
            detail: `No se pudo crear ningún horario: ${errores.join('; ')}`,
            life: 6000
          });
        }
      } else {
        // Todos exitosos
        toast.value.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `${resultados.length} horario(s) creado(s) correctamente`,
          life: 4000
        });
      }
    }
    
    console.log('Resultados:', resultados);
    
    cerrarDialogo();
    await cargarDatos();
    
  } catch (error) {
    console.error('Error completo:', error);
    console.error('Respuesta del error:', error.response?.data);
    
    // ========== MEJOR MANEJO DE ERRORES ==========
    let mensajeError = 'Error al guardar el horario';
    let detalles = '';
    
    if (error.response?.data?.error) {
      mensajeError = error.response.data.error;
      
      // Mensajes específicos para errores conocidos
      if (mensajeError.includes('entrenador ya tiene un horario')) {
        detalles = 'El entrenador seleccionado ya tiene una clase asignada en ese horario. Por favor, verifique la disponibilidad.';
      } else if (mensajeError.includes('intervalo de tiempo')) {
        detalles = 'Conflicto de horarios. Verifique que el entrenador no tenga otras clases asignadas en el mismo horario.';
      }
    } else if (error.response?.data?.errors) {
      const errores = Object.values(error.response.data.errors).flat();
      mensajeError = errores.join(', ');
    } else if (error.response?.data?.message) {
      mensajeError = error.response.data.message;
    }
    
    toast.value.add({
      severity: 'error',
      summary: 'Error',
      detail: detalles || mensajeError,
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
        toast.value.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Horario eliminado correctamente',
          life: 3000
        });
        await cargarDatos();
      } catch (error) {
        const mensajeError = error.response?.data?.error || 'No se pudo eliminar el horario';
        toast.value.add({
          severity: 'error',
          summary: 'Error',
          detail: mensajeError,
          life: 3000
        });
      }
    }
  });
}

// Agrega estas funciones en tu script
function getSeverityDia(dia) {
  const severidades = {
    'Lunes': 'info',
    'Martes': 'info',
    'Miércoles': 'info',
    'Jueves': 'info',
    'Viernes': 'info',
    'Sábado': 'warning',
    'Domingo': 'danger'
  };
  return severidades[dia] || 'secondary';
}

function getInicialesEntrenador(entrenador) {
  if (!entrenador) return '?';
  const nombres = entrenador.nombres || '';
  const apellidos = entrenador.apellidos || '';
  
  if (nombres && apellidos) {
    return (nombres[0] + apellidos[0]).toUpperCase();
  } else if (nombres) {
    return nombres.substring(0, 2).toUpperCase();
  }
  return '?';
}

function getColorCupo(actual, maximo) {
  const porcentaje = (actual / maximo) * 100;
  if (porcentaje >= 90) return 'text-red-500';
  if (porcentaje >= 75) return 'text-orange-500';
  if (porcentaje >= 50) return 'text-yellow-500';
  return 'text-green-500';
}

// Asegúrate de importar Avatar si no lo tienes


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

// Función para verificar si dos intervalos de tiempo se solapan
function horasSeSolapan(horaInicio1, horaFin1, horaInicio2, horaFin2) {
  const inicio1 = new Date(horaInicio1).getTime();
  const fin1 = new Date(horaFin1).getTime();
  const inicio2 = new Date(horaInicio2).getTime();
  const fin2 = new Date(horaFin2).getTime();
  
  // Se solapan si un intervalo empieza antes de que termine el otro
  return (inicio1 < fin2 && fin1 > inicio2);
}

// Función para verificar conflictos en el frontend
function verificarConflictosFrontend() {
  if (!horarioForm.value.entrenador_id || !horarioForm.value.hora_inicio_obj || !horarioForm.value.hora_fin_obj) {
    return false;
  }

  // Obtener horarios existentes del mismo entrenador
  const horariosDelEntrenador = horarios.value.filter(
    h => h.entrenador_id === horarioForm.value.entrenador_id && 
    h.id !== horarioForm.value.id // Excluir el actual en edición
  );

  let conflictos = [];

  // Verificar cada día seleccionado
  horarioForm.value.dias_semana_seleccionados.forEach(diaSeleccionado => {
    // Buscar horarios del entrenador en el mismo día
    const horariosMismoDia = horariosDelEntrenador.filter(
      h => h.dia_semana === diaSeleccionado
    );

    horariosMismoDia.forEach(horarioExistente => {
      // Convertir horas existentes a objetos Date para comparar
      const inicioExistente = crearFechaDesdeHora(horarioExistente.hora_inicio);
      const finExistente = crearFechaDesdeHora(horarioExistente.hora_fin);
      
      if (horasSeSolapan(
        horarioForm.value.hora_inicio_obj,
        horarioForm.value.hora_fin_obj,
        inicioExistente,
        finExistente
      )) {
        conflictos.push({
          dia: diaSeleccionado,
          horarioExistente: horarioExistente,
          mensaje: `El ${diaSeleccionado} de ${horarioExistente.hora_inicio.slice(0,5)} a ${horarioExistente.hora_fin.slice(0,5)} (${horarioExistente.nombre})`
        });
      }
    });
  });

  if (conflictos.length > 0) {
    // Mostrar todos los conflictos encontrados
    const mensajeConflictos = conflictos.map(c => c.mensaje).join('\n');
    
    toast.value.add({
      severity: 'error',
      summary: 'Conflicto de horarios',
      detail: `El entrenador ya tiene clases asignadas en:\n${mensajeConflictos}\n\nPor favor, seleccione otro horario o día.`,
      life: 7000
    });
    
    return true;
  }
  
  return false;
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