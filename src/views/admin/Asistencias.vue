<template>
  <div class="asistencias-simple-container">
    <!-- Header simplificado -->
    <div class="header-section mb-4">
      <div class="flex justify-content-between align-items-center">
        <div>
          <h1 class="text-3xl font-bold m-0">🎯 Asistencia Diaria</h1>
          <p class="text-500 m-0 mt-1">{{ fechaFormateada }}</p>
        </div>
        <div class="flex gap-2">
          <Button icon="pi pi-calendar" @click="toggleCalendar" 
                  :class="{'p-button-outlined': !mostrarCalendario}" />
          <Button icon="pi pi-filter" label="Filtrar" @click="abrirFiltros" />
          <Button icon="pi pi-user-plus" label="Agregar" severity="success" 
                  @click="abrirRegistroRapido" />
        </div>
      </div>
      
      <!-- Calendario simplificado -->
      <div v-if="mostrarCalendario" class="calendar-mini mt-3">
        <Calendar v-model="fechaSeleccionada" dateFormat="dd/mm/yy" inline 
                  :maxDate="hoy" @date-select="cargarAsistencias" />
      </div>
    </div>

    <!-- Tarjetas de resumen rápido -->
    <div class="summary-cards mb-4">
      <div class="grid">
        <div class="col-6 md:col-3">
          <div class="summary-card bg-green-50 border-green-200">
            <i class="pi pi-check-circle text-green-500"></i>
            <div>
              <p class="m-0 text-500">Presentes</p>
              <h3 class="m-0">{{ estadisticas.asistenciasHoy }}</h3>
            </div>
          </div>
        </div>
        <div class="col-6 md:col-3">
          <div class="summary-card bg-red-50 border-red-200">
            <i class="pi pi-times-circle text-red-500"></i>
            <div>
              <p class="m-0 text-500">Ausentes</p>
              <h3 class="m-0">{{ estadisticas.faltasHoy }}</h3>
            </div>
          </div>
        </div>
        <div class="col-6 md:col-3">
          <div class="summary-card bg-yellow-50 border-yellow-200">
            <i class="pi pi-exclamation-triangle text-yellow-500"></i>
            <div>
              <p class="m-0 text-500">Justificados</p>
              <h3 class="m-0">{{ estadisticas.permisosHoy }}</h3>
            </div>
          </div>
        </div>
        <div class="col-6 md:col-3">
          <div class="summary-card bg-blue-50 border-blue-200">
            <i class="pi pi-users text-blue-500"></i>
            <div>
              <p class="m-0 text-500">Total</p>
              <h3 class="m-0">{{ estadisticas.totalHoy }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selector de horarios -->
    <div class="horario-selector mb-4">
      <TabView v-model:activeIndex="horarioActivo" class="custom-tabview">
        <TabPanel v-for="horario in horarios" :key="horario.id">
          <template #header>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-clock"></i>
              <span>{{ horario.hora_inicio }} - {{ horario.hora_fin }}</span>
              <Badge :value="horario.estudiantes.length" severity="info" />
            </div>
          </template>
        </TabPanel>
      </TabView>
    </div>

    <!-- Vista principal de asistencia -->
    <div v-if="cargando" class="loading-state">
      <ProgressSpinner />
      <p>Cargando estudiantes...</p>
    </div>

    <div v-else-if="horarios.length === 0" class="empty-state">
      <i class="pi pi-calendar-times text-400" style="font-size: 4rem"></i>
      <h3>No hay clases programadas</h3>
      <p>No hay horarios activos para hoy</p>
    </div>

    <!-- Lista de estudiantes con check rápido -->
    <div v-else class="estudiantes-list">
      <div v-for="horario in horarios" :key="horario.id" class="horario-section">
        <div class="horario-header">
          <h3>{{ horario.dia_semana }} - {{ horario.hora_inicio }} a {{ horario.hora_fin }}</h3>
          <div class="flex gap-2">
            <span class="chip">{{ horario.modalidad?.nombre || 'Clase' }}</span>
            <span class="chip">{{ horario.entrenador?.nombres || 'Entrenador' }}</span>
            <span class="chip">{{ horario.sucursal?.nombre || 'Sucursal' }}</span>
          </div>
        </div>

        <div class="estudiantes-grid">
          <div v-for="estudiante in horario.estudiantes" :key="estudiante.id" 
               class="estudiante-item" @click="toggleAsistencia(estudiante, horario.id)">
            <div class="estudiante-avatar">
              <Avatar :label="getIniciales(estudiante)" size="large" 
                      :class="getEstadoClass(estudiante)" />
              <div class="estado-indicator" :class="getEstadoColor(estudiante)"></div>
            </div>
            
            <div class="estudiante-info">
              <h4>{{ estudiante.nombres }} {{ estudiante.apellidos }}</h4>
              <p class="text-500 small">{{ estudiante.ci || 'Sin documento' }}</p>
              
              <div class="estudiante-stats">
                <div class="stat">
                  <i class="pi pi-calendar-check"></i>
                  <span>{{ estudiante.clases_asistidas || 0 }}/{{ estudiante.clases_totales || 12 }}</span>
                </div>
                <div class="stat">
                  <i class="pi pi-ticket"></i>
                  <span>{{ estudiante.permisos_disponibles || 3 }} disp.</span>
                </div>
              </div>
            </div>
            
            <div class="estudiante-actions">
              <div class="toggle-buttons">
                <Button icon="pi pi-check" 
                        :class="{'p-button-success': estudiante.asistencia_estado === 'asistio'}"
                        @click.stop="marcarAsistencia(estudiante, horario.id, 'asistio')" />
                <Button icon="pi pi-times" 
                        :class="{'p-button-danger': estudiante.asistencia_estado === 'falto'}"
                        @click.stop="marcarAsistencia(estudiante, horario.id, 'falto')" />
                <!-- En la parte del botón de justificación -->
<Button icon="pi pi-exclamation-triangle" 
        @click.stop="justificarRapido(estudiante, horario.id)" 
        :disabled="(estudiante.permisos_disponibles || 0) <= 0" 
        :severity="(estudiante.permisos_disponibles || 0) > 0 ? 'warning' : 'secondary'"
        :class="{'opacity-50': (estudiante.permisos_disponibles || 0) <= 0}" />
              </div>
              
              <div v-if="estudiante.asistencia_estado" class="estado-label">
                <Tag :value="getEstadoLabel(estudiante.asistencia_estado)" 
                     :severity="getEstadoSeverity(estudiante.asistencia_estado)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón flotante para acciones rápidas -->
    

    <!-- Modal rápido para justificación -->
    <Dialog v-model:visible="mostrarJustificacionRapida" header="Justificar Ausencia" 
            :modal="true" :style="{ width: '400px' }" :closable="false">
      <div class="p-fluid">
        <div class="mb-3">
          <label class="font-bold">{{ estudianteSeleccionado?.nombres }} {{ estudianteSeleccionado?.apellidos }}</label>
          <small class="block text-500">Permisos disponibles: {{ estudianteSeleccionado?.permisos_disponibles || 0 }}/3</small>
        </div>
        
        <div class="mb-3">
          <label>Motivo común:</label>
          <div class="flex flex-wrap gap-2 mt-2">
            <Button v-for="motivo in motivosComunes" :key="motivo" 
                    :label="motivo" severity="secondary" size="small"
                    @click="motivoJustificacion = motivo" />
          </div>
        </div>
        
        <Textarea v-model="motivoJustificacion" rows="2" placeholder="O escribe un motivo personalizado..." 
                  class="w-full" />
      </div>
      
      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="cerrarJustificacion" />
        <Button label="Justificar" severity="warning" @click="confirmarJustificacionRapida"
                :disabled="!motivoJustificacion.trim()" />
      </template>
    </Dialog>

    <!-- Modal de registro rápido -->
    <Dialog v-model:visible="mostrarRegistroRapido" header="Agregar Estudiante" 
            :modal="true" :style="{ width: '500px' }">
      <div class="p-fluid">
        <div class="mb-3">
          <label>Buscar estudiante:</label>
          <AutoComplete v-model="busquedaEstudiante" :suggestions="sugerenciasEstudiantes" 
                        @complete="buscarEstudiantes" field="nombre_completo" 
                        placeholder="Nombre, documento..." class="w-full" />
        </div>
        
        <div v-if="estudianteSeleccionadoRegistro" class="selected-student mb-3">
          <div class="flex align-items-center gap-3 p-3 border-round surface-50">
            <Avatar :label="getIniciales(estudianteSeleccionadoRegistro)" size="large" />
            <div>
              <h4 class="m-0">{{ estudianteSeleccionadoRegistro.nombres }} {{ estudianteSeleccionadoRegistro.apellidos }}</h4>
              <small class="text-500">{{ estudianteSeleccionadoRegistro.ci }}</small>
            </div>
          </div>
        </div>
        
        <div class="grid">
          <div class="col-12">
            <label>Horario:</label>
            <Dropdown v-model="horarioRegistroRapido" :options="horariosDisponiblesRegistro" 
                      optionLabel="label" optionValue="value" class="w-full" />
          </div>
          <div class="col-12 mt-3">
            <label>Estado:</label>
            <div class="flex gap-2">
              <Button v-for="estado in estadosAsistencia" :key="estado.value" 
                      :label="estado.label" :severity="getButtonSeverity(estado.value)"
                      @click="estadoRegistroRapido = estado.value"
                      :class="{'p-button-outlined': estadoRegistroRapido !== estado.value}" />
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="cerrarRegistroRapido" />
        <Button label="Registrar" severity="success" @click="confirmarRegistroRapido"
                :disabled="!estudianteSeleccionadoRegistro || !horarioRegistroRapido" />
      </template>
    </Dialog>
  </div>
 <Toast /> 
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'

// Componentes PrimeVue
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Badge from 'primevue/badge'
import SpeedDial from 'primevue/speeddial'
import AutoComplete from 'primevue/autocomplete'

// Servicios
import asistenciaService from '@/services/asistencia.service'
import estudianteService from '@/services/estudiante.service'

const toast = useToast()

// Estados
const fechaSeleccionada = ref(new Date())
const hoy = ref(new Date())
const mostrarCalendario = ref(false)
const cargando = ref(false)
const horarios = ref([])
const horarioActivo = ref(0)

// Modal justificación
const mostrarJustificacionRapida = ref(false)
const estudianteSeleccionado = ref(null)
const motivoJustificacion = ref('')
const motivosComunes = ref([
  'Enfermedad',
  'Trabajo',
  'Estudios',
  'Viaje',
  'Familiar',
  'Lesión'
])

// Modal registro rápido
const mostrarRegistroRapido = ref(false)
const busquedaEstudiante = ref('')
const sugerenciasEstudiantes = ref([])
const estudianteSeleccionadoRegistro = ref(null)
const horarioRegistroRapido = ref(null)
const estadoRegistroRapido = ref('asistio')
const horariosDisponiblesRegistro = ref([])

// Estados para dropdown
const estadosAsistencia = ref([
  { label: 'Presente', value: 'asistio' },
  { label: 'Ausente', value: 'falto' },
  { label: 'Justificado', value: 'permiso' }
])

// Estadísticas
const estadisticas = ref({
  asistenciasHoy: 0,
  faltasHoy: 0,
  permisosHoy: 0,
  totalHoy: 0
})

// Acciones rápidas
const accionesRapidas = ref([
  {
    label: 'Marcar todos presentes',
    icon: 'pi pi-check',
    command: () => marcarTodosPresentesRapido()
  },
  {
    label: 'Exportar reporte',
    icon: 'pi pi-file-excel',
    command: () => exportarReporte()
  },
  {
    label: 'Ver detalles',
    icon: 'pi pi-chart-bar',
    command: () => verDetalles()
  }
])

// Computed
const fechaFormateada = computed(() => {
  const fecha = new Date(fechaSeleccionada.value)
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return fecha.toLocaleDateString('es-ES', opciones)
})

// Métodos principales
async function cargarAsistencias() {
  cargando.value = true
  try {
    const fecha = fechaSeleccionada.value.toISOString().split('T')[0]
    const response = await asistenciaService.obtenerDia(fecha)
    
    if (response.data?.horarios) {
      // Asegúrate de que cada estudiante tenga los permisos de su inscripción
      horarios.value = response.data.horarios.map(horario => ({
        ...horario,
        estudiantes: horario.estudiantes.map(est => {
          // Si el objeto estudiante no tiene permisos_disponibles, 
          // usar los de la inscripción que viene en la respuesta
          const permisos = est.permisos_disponibles !== undefined 
            ? est.permisos_disponibles 
            : (est.inscripcion?.permisos_disponibles || 3);
            
          return {
            ...est,
            permisos_disponibles: permisos
          };
        })
      }))
      
      calcularEstadisticasRapidas()
    }
  } catch (error) {
    console.error('Error:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las asistencias',
      life: 3000
    })
  } finally {
    cargando.value = false
  }
}

function calcularEstadisticasRapidas() {
  let asistencias = 0
  let faltas = 0
  let permisos = 0
  let total = 0
  
  horarios.value.forEach(horario => {
    horario.estudiantes.forEach(est => {
      total++
      if (est.asistencia_estado === 'asistio') asistencias++
      if (est.asistencia_estado === 'falto') faltas++
      if (est.asistencia_estado === 'permiso') permisos++
    })
  })
  
  estadisticas.value = {
    asistenciasHoy: asistencias,
    faltasHoy: faltas,
    permisosHoy: permisos,
    totalHoy: total
  }
}

async function marcarAsistencia(estudiante, horarioId, estado) {
  try {
    const data = {
      inscripcion_id: estudiante.inscripcion_id,
      horario_id: horarioId,
      fecha: fechaSeleccionada.value.toISOString().split('T')[0],
      estado: estado
    };
    
    console.log('📤 Enviando datos:', data);
    
    // IMPORTANTE: Para 'permiso', usar justificar() en lugar de marcar()
    if (estado === 'permiso') {
      // Abre el modal de justificación en lugar de marcar directamente
      justificarRapido(estudiante, horarioId);
      return; // No continuar con marcar()
    }
    
    // Para 'asistio' y 'falto', usar marcar() normalmente
    await asistenciaService.marcar(data);
    
    // Actualizar UI inmediatamente
    estudiante.asistencia_estado = estado;
    
    toast.add({
      severity: 'success',
      summary: 'Registrado',
      detail: `${estudiante.nombres} marcado como ${getEstadoLabel(estado)}`,
      life: 2000
    });
    
    calcularEstadisticasRapidas();
    
  } catch (error) {
    console.error('Error:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo registrar la asistencia',
      life: 3000
    });
  }
}

function toggleAsistencia(estudiante, horarioId) {
  if (!estudiante.asistencia_estado) {
    marcarAsistencia(estudiante, horarioId, 'asistio')
  } else if (estudiante.asistencia_estado === 'asistio') {
    marcarAsistencia(estudiante, horarioId, 'falto')
  } else {
    marcarAsistencia(estudiante, horarioId, 'asistio')
  }
}

function justificarRapido(estudiante, horarioId) {
  console.log('🎯 Datos recibidos:', {
    estudiante: estudiante.nombres,
    horarioId: horarioId,
    inscripcionId: estudiante.inscripcion_id
  });
  
  // GUARDA EL HORARIO_ID EN EL OBJETO
  estudianteSeleccionado.value = {
    ...estudiante,
    horario_id: horarioId  // ← ¡IMPORTANTE!
  };
  
  motivoJustificacion.value = '';
  mostrarJustificacionRapida.value = true;
}

async function confirmarJustificacionRapida() {
  try {
    if (!estudianteSeleccionado.value?.horario_id) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: '❌ No se pudo obtener el horario.',
        life: 3000
      });
      return;
    }

    // Mostrar loading mientras se procesa
   

    const data = {
      inscripcion_id: estudianteSeleccionado.value.inscripcion_id,
      horario_id: estudianteSeleccionado.value.horario_id,
      fecha: fechaSeleccionada.value.toISOString().split('T')[0],
      motivo: motivoJustificacion.value
    };
    
    console.log('📤 Enviando justificación:', data);

    const response = await asistenciaService.justificar(data);
    
    // Cerrar toast de loading con un pequeño delay para evitar parpadeo
    setTimeout(() => {
      toast.remove(loadingToast);
    }, 100);
    
    if (response.data.success) {
      // Actualizar UI con los datos del servidor
      const { asistencia, permisos_restantes } = response.data.data;
      
      console.log('✅ Respuesta del servidor:', response.data.data);
      
      // Actualizar el estudiante en la lista
      let estudianteActualizado = null;
      horarios.value.forEach(horario => {
        const estudiante = horario.estudiantes.find(
          e => e.inscripcion_id === asistencia.inscripcion_id
        );
        if (estudiante) {
          estudiante.asistencia_estado = 'permiso';
          estudiante.permisos_disponibles = permisos_restantes;
          estudianteActualizado = estudiante;
          
          if (estudiante.inscripcion) {
            estudiante.inscripcion.permisos_disponibles = permisos_restantes;
          }
        }
      });
      
      // Mensaje de éxito CORREGIDO
      toast.add({
        severity: 'success',
        summary: '✅ Justificación Guardada',
        detail: `Justificación registrada para ${estudianteSeleccionado.value.nombres}. Permisos restantes: ${permisos_restantes}/3`,
        life: 4000,
        icon: 'pi pi-check-circle'
      });
      
      cerrarJustificacion();
      calcularEstadisticasRapidas();
      
      // Debug: verificar que se actualizó
      console.log('📝 Estudiante actualizado:', estudianteActualizado);
      
    } else {
      // Mensaje de error del servidor
      toast.add({
        severity: 'error',
        summary: '❌ No se pudo guardar',
        detail: response.data.message || 'Error al procesar la justificación',
        life: 4000,
        icon: 'pi pi-exclamation-triangle'
      });
    }
    
  } catch (error) {
    console.error('💥 Error completo:', error);
    
    // Asegurarnos de cerrar el loading toast en caso de error
    toast.removeAll();
    
    let errorMessage = 'Error al guardar la justificación';
    let errorDetail = '';
    
    // Mensajes de error específicos
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
      
      // Mensajes personalizados para errores comunes
      if (errorMessage.includes('permisos disponibles')) {
        errorDetail = '❌ El estudiante ha agotado sus permisos mensuales.';
      } else if (errorMessage.includes('ya fue justificada')) {
        errorDetail = '⚠️ Esta falta ya tiene una justificación registrada.';
      } else if (errorMessage.includes('Inscripción no encontrada')) {
        errorDetail = '🔍 No se encontró la inscripción del estudiante.';
      } else {
        errorDetail = errorMessage;
      }
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = '🔌 Error de conexión';
      errorDetail = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else if (error.message) {
      errorDetail = error.message;
    }
    
    toast.add({
      severity: 'error',
      summary: errorMessage,
      detail: errorDetail || 'Por favor, inténtalo de nuevo.',
      life: 5000,
      icon: 'pi pi-times-circle'
    });
  }
}

function cerrarJustificacion() {
  mostrarJustificacionRapida.value = false
  estudianteSeleccionado.value = null
  motivoJustificacion.value = ''
}

// Registro rápido
async function abrirRegistroRapido() {
  await cargarHorariosDisponibles()
  mostrarRegistroRapido.value = true
}

async function cargarHorariosDisponibles() {
  try {
    const response = await asistenciaService.obtenerHorariosDisponibles()
    horariosDisponiblesRegistro.value = response.data?.map(h => ({
      label: `${h.dia_semana} ${h.hora_inicio} - ${h.hora_fin} (${h.modalidad})`,
      value: h.id
    })) || []
  } catch (error) {
    console.error('Error cargando horarios:', error)
  }
}

async function buscarEstudiantes(event) {
  try {
    const response = await estudianteService.buscar(event.query)
    sugerenciasEstudiantes.value = response.data?.map(est => ({
      ...est,
      nombre_completo: `${est.nombres} ${est.apellidos}`
    })) || []
  } catch (error) {
    console.error('Error buscando estudiantes:', error)
  }
}

async function confirmarRegistroRapido() {
  try {
    const data = {
      estudiante_id: estudianteSeleccionadoRegistro.value.id,
      horario_id: horarioRegistroRapido.value,
      fecha: fechaSeleccionada.value.toISOString().split('T')[0],
      estado: estadoRegistroRapido.value
    }
    
    await asistenciaService.registrarManual(data)
    
    toast.add({
      severity: 'success',
      summary: 'Agregado',
      detail: 'Estudiante agregado a la clase',
      life: 3000
    })
    
    cerrarRegistroRapido()
    cargarAsistencias()
    
  } catch (error) {
    console.error('Error:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo agregar el estudiante',
      life: 3000
    })
  }
}

function cerrarRegistroRapido() {
  mostrarRegistroRapido.value = false
  busquedaEstudiante.value = ''
  sugerenciasEstudiantes.value = []
  estudianteSeleccionadoRegistro.value = null
  horarioRegistroRapido.value = null
  estadoRegistroRapido.value = 'asistio'
}

// Funciones de ayuda
function getIniciales(estudiante) {
  if (!estudiante) return '?'
  const nombres = (estudiante.nombres || '').split(' ')
  const apellidos = (estudiante.apellidos || '').split(' ')
  const inicial1 = nombres[0]?.[0] || ''
  const inicial2 = apellidos[0]?.[0] || ''
  return (inicial1 + inicial2).toUpperCase()
}

function getEstadoClass(estudiante) {
  const estado = estudiante.asistencia_estado
  if (!estado) return 'bg-blue-100 text-blue-800'
  if (estado === 'asistio') return 'bg-green-100 text-green-800'
  if (estado === 'falto') return 'bg-red-100 text-red-800'
  if (estado === 'permiso') return 'bg-yellow-100 text-yellow-800'
  return 'bg-blue-100 text-blue-800'
}

function getEstadoColor(estudiante) {
  const estado = estudiante.asistencia_estado
  if (!estado) return 'bg-blue-500'
  if (estado === 'asistio') return 'bg-green-500'
  if (estado === 'falto') return 'bg-red-500'
  if (estado === 'permiso') return 'bg-yellow-500'
  return 'bg-blue-500'
}

function getEstadoLabel(estado) {
  const map = {
    'asistio': 'Presente',
    'falto': 'Ausente',
    'permiso': 'Justificado'
  }
  return map[estado] || 'Sin registro'
}

function getEstadoSeverity(estado) {
  const map = {
    'asistio': 'success',
    'falto': 'danger',
    'permiso': 'warning'
  }
  return map[estado] || 'info'
}

function getButtonSeverity(estado) {
  const map = {
    'asistio': 'success',
    'falto': 'danger',
    'permiso': 'warning'
  }
  return map[estado] || 'secondary'
}

// Funciones de acción masiva
async function marcarTodosPresentesRapido() {
  const horarioActual = horarios.value[horarioActivo.value]
  if (!horarioActual) return
  
  const sinRegistro = horarioActual.estudiantes.filter(e => !e.asistencia_estado)
  
  for (const estudiante of sinRegistro) {
    await marcarAsistencia(estudiante, horarioActual.id, 'asistio')
  }
}

function abrirFiltros() {
  // Implementar filtros simples si es necesario
  toast.add({
    severity: 'info',
    summary: 'Filtros',
    detail: 'Funcionalidad de filtros próximamente',
    life: 3000
  })
}

function toggleCalendar() {
  mostrarCalendario.value = !mostrarCalendario.value
}

async function exportarReporte() {
  try {
    const fecha = fechaSeleccionada.value.toISOString().split('T')[0]
    window.open(`/api/asistencias/exportar/${fecha}`, '_blank')
  } catch (error) {
    console.error('Error exportando:', error)
  }
}

function verDetalles() {
  // Redirigir o mostrar estadísticas detalladas
  toast.add({
    severity: 'info',
    summary: 'Detalles',
    detail: 'Vista de detalles próximamente',
    life: 3000
  })
}

// Inicialización
onMounted(() => {
  cargarAsistencias()
})
</script>

<style scoped>
.asistencias-simple-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.calendar-mini {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.summary-cards {
  .summary-card {
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 2px solid;
    
    i {
      font-size: 2rem;
    }
    
    h3 {
      font-size: 1.75rem;
    }
  }
}

.horario-selector {
  :deep(.p-tabview-nav) {
    background: transparent;
    border: none;
    
    .p-tabview-nav-link {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-right: 0.5rem;
      
      &:hover {
        background: #f3f4f6;
      }
    }
    
    .p-highlight .p-tabview-nav-link {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
  }
}

.estudiantes-list {
  .horario-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .horario-header {
    margin-bottom: 1.5rem;
    
    h3 {
      margin: 0 0 0.5rem 0;
    }
    
    .chip {
      background: #f3f4f6;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      color: #6b7280;
    }
  }
}

.estudiantes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.estudiante-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .estudiante-avatar {
    position: relative;
    
    .estado-indicator {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
    }
  }
  
  .estudiante-info {
    flex: 1;
    
    h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
    }
    
    .small {
      font-size: 0.875rem;
    }
    
    .estudiante-stats {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      
      .stat {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.875rem;
        color: #6b7280;
        
        i {
          font-size: 0.875rem;
        }
      }
    }
  }
  
  .estudiante-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    
    .toggle-buttons {
      display: flex;
      gap: 0.25rem;
      
      button {
        padding: 0.5rem;
        
        &:not(.p-button-success):not(.p-button-danger):not(.p-button-warning) {
          background: #f3f4f6;
          border-color: #f3f4f6;
          color: #6b7280;
        }
      }
    }
    
    .estado-label {
      margin-top: 0.25rem;
    }
  }
}

.loading-state {
  text-align: center;
  padding: 4rem;
  
  p {
    margin-top: 1rem;
    color: #6b7280;
  }
}

.empty-state {
  text-align: center;
  padding: 4rem;
  
  h3 {
    margin: 1rem 0 0.5rem 0;
  }
  
  p {
    color: #6b7280;
  }
}

.speed-dial-bottom-right {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.selected-student {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .asistencias-simple-container {
    padding: 1rem;
  }
  
  .estudiantes-grid {
    grid-template-columns: 1fr;
  }
  
  .estudiante-item {
    flex-direction: column;
    text-align: center;
    
    .estudiante-info {
      width: 100%;
    }
    
    .estudiante-actions {
      width: 100%;
      flex-direction: row;
      justify-content: space-between;
    }
  }
  
  .summary-cards .summary-card {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}
</style>