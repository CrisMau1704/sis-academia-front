<template>
  <div class="asistencia-container">
    <!-- HEADER MEJORADO -->
    <div class="header-glass">
      <div class="header-content">
        <div class="header-left">
          <div class="date-display">
            <i class="pi pi-calendar text-primary"></i>
            <div>
              <h1 class="m-0 text-2xl font-bold">Asistencia Diaria</h1>
              <p class="m-0 text-500 flex align-items-center gap-2">
                <span>{{ fechaFormateada }}</span>
                <Badge :value="totalEstudiantes" severity="info" size="small" />
              </p>
            </div>
          </div>
        </div>

        <div class="header-right">
          <ButtonGroup>
            <Button icon="pi pi-chevron-left" severity="secondary" @click="cambiarFecha(-1)" rounded />
            <Button :label="hoyLabel" severity="info" @click="irAHoy" outlined />
            <Button icon="pi pi-chevron-right" severity="secondary" @click="cambiarFecha(1)" :disabled="esHoy"
              rounded />
          </ButtonGroup>

          <!-- Botones de acción en el header -->
          <div class="action-buttons-header">
            <Button icon="pi pi-calendar" @click="mostrarCalendario = !mostrarCalendario"
              :class="{ 'p-button-outlined p-button-primary': mostrarCalendario }" rounded
              tooltip="Mostrar calendario" />
            <Button icon="pi pi-file-excel" severity="help" @click="exportarExcel" rounded tooltip="Exportar a Excel" />
            <Button icon="pi pi-sync" @click="cargarAsistencias" :loading="cargando" outlined rounded
              tooltip="Refrescar datos" />
          </div>
        </div>
      </div>

      <!-- CALENDARIO FLOTANTE -->
      <div v-if="mostrarCalendario" class="calendar-floating">
        <Calendar v-model="fechaSeleccionada" inline :maxDate="hoy" dateFormat="dd/mm/yy"
          @date-select="cargarAsistencias" />
      </div>
    </div>

    <!-- RESUMEN EN CARDS MEJORADO -->
    <div class="summary-section">
      <div class="grid">
        <div class="col-12 md:col-3">
          <Card class="summary-card present">
            <template #content>
              <div class="flex align-items-center justify-content-between">
                <div>
                  <span class="summary-label">Presentes</span>
                  <h2 class="summary-value">{{ estadisticas.asistenciasHoy }}</h2>
                </div>
                <i class="pi pi-check-circle text-5xl opacity-30"></i>
              </div>
              <ProgressBar :value="porcentajePresentes" :showValue="false" class="mt-3" style="height: 6px" />
            </template>
          </Card>
        </div>

        <div class="col-12 md:col-3">
          <Card class="summary-card absent">
            <template #content>
              <div class="flex align-items-center justify-content-between">
                <div>
                  <span class="summary-label">Ausentes</span>
                  <h2 class="summary-value">{{ estadisticas.faltasHoy }}</h2>
                </div>
                <i class="pi pi-times-circle text-5xl opacity-30"></i>
              </div>
              <ProgressBar :value="porcentajeAusentes" :showValue="false" class="mt-3" style="height: 6px" />
            </template>
          </Card>
        </div>

        <div class="col-12 md:col-3">
          <Card class="summary-card justified">
            <template #content>
              <div class="flex align-items-center justify-content-between">
                <div>
                  <span class="summary-label">Justificados</span>
                  <h2 class="summary-value">{{ estadisticas.permisosHoy }}</h2>
                </div>
                <i class="pi pi-exclamation-triangle text-5xl opacity-30"></i>
              </div>
              <ProgressBar :value="porcentajeJustificados" :showValue="false" class="mt-3" style="height: 6px" />
            </template>
          </Card>
        </div>

        <div class="col-12 md:col-3">
          <Card class="summary-card total">
            <template #content>
              <div class="flex align-items-center justify-content-between">
                <div>
                  <span class="summary-label">Total Estudiantes</span>
                  <h2 class="summary-value">{{ estadisticas.totalHoy }}</h2>
                </div>
                <i class="pi pi-users text-5xl opacity-30"></i>
              </div>
              <div class="mt-3">
                <small class="text-500">% Asistencia: {{ porcentajeAsistencia }}%</small>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- BARRA DE FILTROS -->
    <div class="filters-section">
      <div class="flex flex-wrap align-items-center justify-content-between gap-3">
        <div class="flex flex-wrap gap-2">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <InputText v-model="filtroBusqueda" placeholder="Buscar estudiante..." @input="filtrarEstudiantes" />
          </span>

          <Dropdown v-model="filtroEstado" :options="opcionesEstado" optionLabel="label" optionValue="value"
            placeholder="Filtrar por estado" showClear @change="filtrarEstudiantes" />

          <Dropdown v-model="filtroHorario" :options="opcionesHorario" optionLabel="label" optionValue="value"
            placeholder="Todos los horarios" showClear @change="filtrarEstudiantes" />
        </div>


      </div>
    </div>

    <!-- VISTA DE HORARIOS -->
    <div v-if="cargando" class="loading-container">
      <Card class="loading-card">
        <template #content>
          <div class="text-center py-6">
            <ProgressSpinner style="width: 50px; height: 50px" />
            <p class="mt-3 text-500">Cargando estudiantes...</p>
          </div>
        </template>
      </Card>
    </div>

    <div v-else-if="horariosFiltrados.length === 0" class="empty-container">
      <Card class="empty-card">
        <template #content>
          <div class="text-center py-8">
            <i class="pi pi-users text-400" style="font-size: 4rem"></i>
            <h3 class="mt-4">No hay clases programadas</h3>
            <p class="text-500 mb-4">No hay horarios activos para hoy</p>
          </div>
        </template>
      </Card>
    </div>

    <!-- LISTA DE HORARIOS Y ESTUDIANTES -->
    <div v-else class="horarios-container">
      <Accordion :multiple="true" :activeIndex="[0]">
        <AccordionTab v-for="(horario, index) in horariosFiltrados" :key="horario.id">
          <template #header>
            <div class="horario-header">
              <div class="flex align-items-center gap-3">
                <Badge :value="horario.estudiantesFiltrados?.length || 0" severity="info" size="large" />
                <div>
                  <h4 class="m-0">{{ horario.hora_inicio }} - {{ horario.hora_fin }}</h4>
                  <small class="text-500">{{ getDiaCompleto(horario.dia_semana) }}</small>
                </div>
              </div>
              <div class="horario-meta">
                <Tag :value="horario.modalidad?.nombre || 'Clase'" severity="info" rounded />
                <Tag :value="horario.entrenador?.nombres || 'Sin entrenador'" severity="secondary" rounded />
                <Tag :value="horario.sucursal?.nombre || 'General'" severity="success" rounded />
              </div>
            </div>
          </template>

          <div class="estudiantes-grid">
            <div v-for="estudiante in horario.estudiantesFiltrados" :key="estudiante.id" class="estudiante-card"
              :class="getCardClass(estudiante)">
              <div class="estudiante-avatar-section">
                <Avatar :label="getIniciales(estudiante)" size="xlarge" :class="getAvatarClass(estudiante)"
                  shape="circle" />
                <div class="estado-badge" :class="getEstadoBadge(estudiante)">
                  <i :class="getEstadoIcon(estudiante)"></i>
                </div>
              </div>

              <div class="estudiante-info-section">
                <div class="flex justify-content-between align-items-start">
                  <div>
                    <h4 class="m-0">{{ estudiante.nombres }} {{ estudiante.apellidos }}</h4>
                    <small class="text-500">{{ estudiante.ci || 'Sin documento' }}</small>
                  </div>
                  <Tag v-if="estudiante.asistencia_estado" :value="getEstadoLabel(estudiante.asistencia_estado)"
                    :severity="getEstadoSeverity(estudiante.asistencia_estado)" rounded />
                  <span v-else class="text-500">Sin marcar</span>
                </div>

                <div class="estudiante-stats">
                  <div class="stat-item">
                    <i class="pi pi-calendar-check"></i>
                    <span>Asistencias: {{ estudiante.clases_asistidas || 0 }}/{{ estudiante.clases_totales || 12
                    }}</span>
                  </div>
                  <div class="stat-item">
                    <i class="pi pi-ticket"></i>
                    <span>Permisos: {{ estudiante.permisos_disponibles || 3 }} disponibles</span>
                  </div>
                  <div class="stat-item" v-if="estudiante.asistencia_hora">
                    <i class="pi pi-clock"></i>
                    <span>Registrado: {{ formatHora(estudiante.asistencia_hora) }}</span>
                  </div>
                </div>
              </div>

              <div class="estudiante-actions-section">
                <div class="action-buttons">
                  <!-- Botón ASISTIO - siempre mismo color hasta que se marque -->
                  <Button icon="pi pi-check" rounded class="p-button-success p-button-outlined"
                    @click="marcarAsistencia(estudiante, horario.id, 'asistio')" tooltip="Marcar como presente" />

                  <!-- Botón FALTO - siempre mismo color hasta que se marque -->
                  <Button icon="pi pi-times" rounded class="p-button-danger p-button-outlined"
                    @click="marcarAsistencia(estudiante, horario.id, 'falto')" tooltip="Marcar como ausente" />

                  <!-- Botón JUSTIFICAR - solo activo si tiene permisos -->
                  <!-- Botón JUSTIFICAR - abre modal SIEMPRE que tenga permisos -->
                  <Button icon="pi pi-exclamation-triangle" rounded class="p-button-warning p-button-outlined"       
                    @click="abrirModalJustificacion(estudiante, horario.id)"
                    :disabled="(estudiante.permisos_disponibles || 0) <= 0" tooltip="Justificar ausencia" />
                </div>
              </div>
            </div>
          </div>

          <!-- RESUMEN DEL HORARIO -->
          <div class="horario-summary">
            <div class="flex justify-content-between align-items-center">
              <div class="flex gap-3">
                <span class="summary-item">
                  <i class="pi pi-check-circle text-green-500"></i>
                  <span>{{ contarPorEstado(horario, 'asistio') }} presentes</span>
                </span>
                <span class="summary-item">
                  <i class="pi pi-times-circle text-red-500"></i>
                  <span>{{ contarPorEstado(horario, 'falto') }} ausentes</span>
                </span>
                <span class="summary-item">
                  <i class="pi pi-exclamation-triangle text-yellow-500"></i>
                  <span>{{ contarPorEstado(horario, 'permiso') }} justificados</span>
                </span>
              </div>
              <Button icon="pi pi-check" label="Marcar todos presentes" severity="success" size="small" outlined
                @click="marcarTodosEnHorario(horario.id, 'asistio')" />
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </div>

    <!-- MODAL DE JUSTIFICACIÓN MEJORADO -->
    <Dialog v-model:visible="mostrarJustificacionRapida" modal
      :header="`Justificar ausencia - ${estudianteSeleccionado?.nombres}`" :style="{ width: '450px' }">
      <div class="p-fluid">
        <div class="student-info mb-4 p-3 surface-50 border-round">
          <div class="flex align-items-center gap-3">
            <Avatar :label="getIniciales(estudianteSeleccionado)" size="large" />
            <div>
              <h4 class="m-0">{{ estudianteSeleccionado?.nombres }} {{ estudianteSeleccionado?.apellidos }}</h4>
              <div class="flex align-items-center gap-2 mt-1">
                <Tag :value="`${estudianteSeleccionado?.permisos_disponibles || 0}/3 permisos`"
                  :severity="(estudianteSeleccionado?.permisos_disponibles || 0) > 0 ? 'success' : 'danger'" />
                <small class="text-500">Horario: {{ obtenerHorarioEstudiante() }}</small>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="font-bold block mb-2">Motivo de justificación</label>
          <div class="quick-reasons">
            <Button v-for="motivo in motivosComunes" :key="motivo" :label="motivo" severity="secondary" size="small"
              outlined @click="seleccionarMotivo(motivo)"
              :class="{ 'p-button-primary': motivoJustificacion === motivo }" />
          </div>
        </div>

        <div class="mb-4">
          <label class="font-bold block mb-2">Detalles adicionales</label>
          <Textarea v-model="motivoJustificacion" rows="3" placeholder="Describe el motivo de la ausencia..." autoResize
            class="w-full" />
        </div>

        <div class="mb-4" v-if="estudianteSeleccionado?.permisos_disponibles === 0">
          <Message severity="warn" :closable="false">
            <strong>⚠️ Sin permisos disponibles</strong>
            <p>Este estudiante ha agotado sus permisos mensuales.</p>
          </Message>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="cerrarJustificacion" />
        <Button label="Justificar Ausencia" severity="warning" icon="pi pi-check" @click="confirmarJustificacionRapida"
          :loading="procesandoJustificacion"
          :disabled="!motivoJustificacion.trim() || (estudianteSeleccionado?.permisos_disponibles || 0) <= 0" />
      </template>
    </Dialog>

    <!-- SNACKBAR PARA CONFIRMACIÓN -->
    <Toast position="bottom-right" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'

// Componentes PrimeVue
import Button from 'primevue/button'
import ButtonGroup from 'primevue/buttongroup'
import Calendar from 'primevue/calendar'
import Card from 'primevue/card'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import InputText from 'primevue/inputtext'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Message from 'primevue/message'
import Toast from 'primevue/toast'

// Servicios
import asistenciaService from '@/services/asistencia.service'

const toast = useToast()

// Estados principales
const fechaSeleccionada = ref(new Date())
const hoy = ref(new Date())
const mostrarCalendario = ref(false)
const cargando = ref(false)
const horarios = ref([])

// Filtros
const filtroBusqueda = ref('')
const filtroEstado = ref(null)
const filtroHorario = ref(null)

// Estados modales
const mostrarJustificacionRapida = ref(false)
const estudianteSeleccionado = ref(null)
const motivoJustificacion = ref('')
const procesandoJustificacion = ref(false)

// Datos estáticos
const motivosComunes = ref([
  'Enfermedad', 'Consulta médica', 'Trabajo', 'Estudios',
  'Viaje', 'Familiar', 'Lesión deportiva', 'Clima', 'Personal'
])

const opcionesEstado = ref([
  { label: 'Presentes', value: 'asistio' },
  { label: 'Ausentes', value: 'falto' },
  { label: 'Justificados', value: 'permiso' },
  { label: 'Sin registrar', value: null }
])

// Computed properties
const fechaFormateada = computed(() => {
  const fecha = new Date(fechaSeleccionada.value)
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return fecha.toLocaleDateString('es-ES', opciones).toUpperCase()
})

const esHoy = computed(() => {
  const hoyStr = hoy.value.toDateString()
  const seleccionadaStr = new Date(fechaSeleccionada.value).toDateString()
  return hoyStr === seleccionadaStr
})

const hoyLabel = computed(() => esHoy.value ? 'HOY' : 'IR A HOY')

const porcentajePresentes = computed(() => {
  if (estadisticas.value.totalHoy === 0) return 0
  return (estadisticas.value.asistenciasHoy / estadisticas.value.totalHoy) * 100
})

const porcentajeAusentes = computed(() => {
  if (estadisticas.value.totalHoy === 0) return 0
  return (estadisticas.value.faltasHoy / estadisticas.value.totalHoy) * 100
})

const porcentajeJustificados = computed(() => {
  if (estadisticas.value.totalHoy === 0) return 0
  return (estadisticas.value.permisosHoy / estadisticas.value.totalHoy) * 100
})

const porcentajeAsistencia = computed(() => {
  if (estadisticas.value.totalHoy === 0) return 0
  const totalRegistrados = estadisticas.value.asistenciasHoy + estadisticas.value.permisosHoy
  return Math.round((totalRegistrados / estadisticas.value.totalHoy) * 100)
})

const totalEstudiantes = computed(() => {
  return horarios.value.reduce((total, horario) => {
    return total + (horario.estudiantes?.length || 0)
  }, 0)
})

const opcionesHorario = computed(() => {
  return horarios.value.map(horario => ({
    label: `${horario.hora_inicio} - ${horario.hora_fin} (${horario.estudiantes?.length || 0})`,
    value: horario.id
  }))
})

const horariosFiltrados = computed(() => {
  return horarios.value.map(horario => {
    let estudiantesFiltrados = horario.estudiantes || []

    // Aplicar filtro de búsqueda
    if (filtroBusqueda.value) {
      const search = filtroBusqueda.value.toLowerCase()
      estudiantesFiltrados = estudiantesFiltrados.filter(est =>
        est.nombres.toLowerCase().includes(search) ||
        est.apellidos.toLowerCase().includes(search) ||
        (est.ci && est.ci.includes(search))
      )
    }

    // Aplicar filtro de estado
    if (filtroEstado.value !== null) {
      estudiantesFiltrados = estudiantesFiltrados.filter(est =>
        est.asistencia_estado === filtroEstado.value
      )
    }

    // Aplicar filtro de horario (si se seleccionó uno específico)
    if (filtroHorario.value && filtroHorario.value !== horario.id) {
      estudiantesFiltrados = []
    }

    return {
      ...horario,
      estudiantesFiltrados,
      tieneEstudiantes: estudiantesFiltrados.length > 0
    }
  }).filter(horario =>
    horario.tieneEstudiantes || (!filtroBusqueda.value && filtroEstado.value === null && !filtroHorario.value)
  )
})

// Estadísticas
const estadisticas = ref({
  asistenciasHoy: 0,
  faltasHoy: 0,
  permisosHoy: 0,
  totalHoy: 0
})

// ========== FUNCIÓN FILTRAR ESTUDIANTES (QUE FALTABA) ==========
function filtrarEstudiantes() {
  // Esta función es llamada por los filtros en el template
  // No necesita hacer nada porque los computed properties ya filtran
  console.log('🔍 Filtros aplicados:', {
    busqueda: filtroBusqueda.value,
    estado: filtroEstado.value,
    horario: filtroHorario.value
  });
}

// ALMACENAMIENTO LOCAL
const guardarAsistenciaLocal = (fecha, estudianteId, horarioId, estado, datos) => {
  const fechaKey = new Date(fecha).toISOString().split('T')[0]
  const storageKey = `asistencia_${fechaKey}`

  let asistenciasDia = JSON.parse(localStorage.getItem(storageKey) || '{}')
  const clave = `${estudianteId}_${horarioId}`

  if (estado) {
    asistenciasDia[clave] = {
      estudianteId,
      horarioId,
      clase_programada_id: datos.clase_programada_id,
      estado,
      datos,
      timestamp: new Date().toISOString()
    }

    localStorage.setItem(storageKey, JSON.stringify(asistenciasDia))
    console.log('💾 Guardado en localStorage:', clave, estado)
  }
}

const cargarAsistenciasLocales = (fecha) => {
  const fechaKey = new Date(fecha).toISOString().split('T')[0]
  const storageKey = `asistencia_${fechaKey}`
  return JSON.parse(localStorage.getItem(storageKey) || '{}')
}

const aplicarAsistenciasLocales = (horariosData, fecha) => {
  const asistenciasLocales = cargarAsistenciasLocales(fecha)

  if (Object.keys(asistenciasLocales).length === 0) {
    return horariosData
  }

  const ahora = new Date()

  return horariosData.map(horario => {
    const estudiantesActualizados = (horario.estudiantes || []).map(estudiante => {
      const clave = `${estudiante.id}_${horario.id}`
      const asistenciaLocal = asistenciasLocales[clave]

      if (asistenciaLocal) {
        const timestamp = new Date(asistenciaLocal.timestamp)
        const diferenciaHoras = (ahora - timestamp) / (1000 * 60 * 60)

        if (diferenciaHoras < 24) {
          return {
            ...estudiante,
            asistencia_estado: asistenciaLocal.estado,
            asistencia_hora: asistenciaLocal.datos?.asistencia_hora || estudiante.asistencia_hora,
            permisos_disponibles: asistenciaLocal.datos?.permisos_disponibles || estudiante.permisos_disponibles,
            clases_asistidas: asistenciaLocal.datos?.clases_asistidas || estudiante.clases_asistidas
          }
        }
      }

      return estudiante
    })

    return {
      ...horario,
      estudiantes: estudiantesActualizados
    }
  })
}

function limpiarCacheAntiguo() {
  const hoy = new Date().toISOString().split('T')[0]
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith('asistencia_')) {
      const fechaKey = key.replace('asistencia_', '')
      if (fechaKey !== hoy) {
        localStorage.removeItem(key)
      }
    }
  }
}

// ========== FUNCIONES PRINCIPALES ==========

onMounted(() => {
  console.log('🚀 Módulo de Asistencias iniciando...')
  const fechaActual = new Date()
  const hoyLocal = new Date(
    fechaActual.getFullYear(),
    fechaActual.getMonth(),
    fechaActual.getDate()
  )

  fechaSeleccionada.value = hoyLocal
  hoy.value = hoyLocal
  limpiarCacheAntiguo()
  cargarAsistencias()
})

async function cargarAsistencias() {
  cargando.value = true;
  try {
    const fecha = new Date(fechaSeleccionada.value);
    const fechaISO = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    const hoyStr = new Date().toISOString().split('T')[0];

    console.log('📅 Cargando asistencias para:', fechaISO);

    const response = await asistenciaService.obtenerDia(fechaISO);

    if (response.data?.success && response.data.horarios) {
      let horariosProcesados = response.data.horarios.map(horario => ({
        id: horario.id,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        dia_semana: horario.dia_semana,
        modalidad: horario.modalidad,
        entrenador: horario.entrenador,
        sucursal: horario.sucursal,
        estudiantes: (horario.estudiantes || []).map(est => ({
          ...est,
          clase_programada_id: null,
          clases_asistidas: est.clases_asistidas || 0,
          clases_totales: est.clases_totales || 0,
          permisos_disponibles: est.permisos_disponibles || 0
        }))
      }));

      if (fechaISO === hoyStr) {
        horariosProcesados = aplicarAsistenciasLocales(horariosProcesados, fechaSeleccionada.value);
      }

      horarios.value = horariosProcesados;
      calcularEstadisticas();
      resetearFiltros();
    } else {
      console.warn('⚠️ No hay asistencias para esta fecha');
      horarios.value = [];
    }
  } catch (error) {
    console.error('❌ Error cargando asistencias:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las asistencias',
      life: 3000
    });
    horarios.value = [];
  } finally {
    cargando.value = false;
  }
}

function calcularEstadisticas() {
  let asistencias = 0
  let faltas = 0
  let permisos = 0
  let total = 0

  horarios.value.forEach(horario => {
    horario.estudiantes?.forEach(est => {
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

function resetearFiltros() {
  filtroBusqueda.value = ''
  filtroEstado.value = null
  filtroHorario.value = null
}

// ========== FUNCIÓN PRINCIPAL CORREGIDA ==========

async function marcarAsistencia(estudiante, horarioId, estado) {
  try {
    console.log('📋 Marcando asistencia para:', estudiante.nombres, estado);
    
    const fecha = fechaSeleccionada.value;
    const fechaISO = new Date(fecha).toISOString().split('T')[0];

    // Si es justificación, abrir modal directamente
    if (estado === 'permiso') {
      justificarRapido(estudiante, horarioId); // Sin claseProgramadaId
      return;
    }

    // Procesar asistencia normal (presente o ausente)
    await procesarAsistenciaCompleta(estudiante, horarioId, estado, fechaISO);

  } catch (error) {
    console.error('❌ Error en marcarAsistencia:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo registrar la asistencia',
      life: 3000
    });
  }
}



async function procesarAsistenciaCompleta(estudiante, horarioId, estado, fechaISO) {
  console.log('🚀 PROCESANDO ASISTENCIA COMPLETA');
  
  // Eliminada la búsqueda de clase programada
  const claseProgramadaId = null; // <-- Simplemente usa null
  
  // 2. Actualizar inscripción principal SI ES ASISTENCIA
  let datosActualizados = null;
  if (estado === 'asistio' && estudiante.inscripcion_id) {
    console.log('🔄 Actualizando inscripción principal...');
    datosActualizados = await actualizarInscripcionPrincipal(estudiante, fechaISO, horarioId, claseProgramadaId);
    
    // También intentar actualizar inscripciones_horarios
    if (datosActualizados && estudiante.inscripcion_id && horarioId) {
      await actualizarInscripcionHorarioSimple(estudiante.inscripcion_id, horarioId);
    }
  }
  
  // 3. Si es justificación, actualizar permisos (esto se maneja en el modal)
  if (estado === 'permiso' && estudiante.inscripcion_id) {
    console.log('📝 Es justificación, se maneja en modal');
  }
  
  // 4. Actualizar clase programada si existe (pero ya sabemos que es null)
  if (claseProgramadaId) {
    await actualizarClaseProgramada(claseProgramadaId, estado, fechaISO, estudiante, horarioId);
  }
  
  // 5. Preparar datos para localStorage
  const datosParaGuardar = {
    clase_programada_id: claseProgramadaId,
    asistencia_hora: new Date().toISOString(),
    permisos_disponibles: datosActualizados?.permisos_disponibles || estudiante.permisos_disponibles || 0,
    clases_asistidas: datosActualizados?.clases_asistidas || 
                      (estudiante.clases_asistidas || 0) + (estado === 'asistio' ? 1 : 0),
    clases_totales: datosActualizados?.clases_totales || estudiante.clases_totales || 0,
    estado: estado
  };
  
  // 6. Guardar en localStorage
  guardarAsistenciaLocal(
    fechaSeleccionada.value,
    estudiante.id,
    horarioId,
    estado,
    datosParaGuardar
  );
  
  // 7. Actualizar UI
  actualizarEstudianteEnUI(
    estudiante.id, 
    horarioId, 
    estado, 
    claseProgramadaId,
    datosActualizados
  );
  
  // 8. Recalcular estadísticas
  calcularEstadisticas();
  
  // 9. Mostrar notificación
  toast.add({
    severity: 'success',
    summary: '✅ Registrado',
    detail: `${estudiante.nombres} marcado como ${getEstadoLabel(estado)}`,
    life: 2000
  });
  
  // 10. Enviar al servidor asíncrono
  enviarAlServidorAsync(estudiante, horarioId, estado, fechaISO, claseProgramadaId, datosActualizados);
}

// ========== FUNCIÓN CORREGIDA PARA ACTUALIZAR INSCRIPCIÓN ==========


async function registrarAsistencia(asistencia) {
  try {
    const response = await fetch('/api/asistencias/marcar', {
      method: 'POST',
      credentials: 'include', // 🔹 muy importante para Sanctum
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(asistencia)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error desconocido');
    }

    const data = await response.json();
    console.log('✅ Asistencia registrada', data);
    return data;
  } catch (error) {
    console.error('❌ Error registrar asistencia:', error.message);
  }
}





async function actualizarInscripcionPrincipal(estudiante, fechaISO, horarioId, claseProgramadaId) {
  try {
    console.log('🚀 INICIANDO REGISTRO DE ASISTENCIA');
    
    const asistenciaData = {
      inscripcion_id: estudiante.inscripcion_id,
      horario_id: horarioId,
      fecha: fechaISO,
      estado: 'asistio' // <- IMPORTANTE: siempre 'asistio' aquí
    };

    console.log('📦 Datos enviados:', asistenciaData);

    // LLAMA DIRECTAMENTE AL SERVICIO
    const response = await asistenciaService.marcar(asistenciaData);
    
    console.log('✅ ÉXITO - Respuesta completa:', response);
    
    if (response.data?.success) {
      return {
        clases_asistidas: (estudiante.clases_asistidas || 0) + 1,
        clases_totales: estudiante.clases_totales || 0,
        permisos_disponibles: estudiante.permisos_disponibles || 0
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('💥 ERROR CRÍTICO:', error);
    
    // SI FALLA, AL MENOS DEVUELVE EL INCREMENTO LOCAL
    return {
      clases_asistidas: (estudiante.clases_asistidas || 0) + 1,
      clases_totales: estudiante.clases_totales || 0,
      permisos_disponibles: estudiante.permisos_disponibles || 0
    };
  }
}
// Función para actualizar inscripción directamente
async function actualizarInscripcionDirectamente(inscripcionId) {
  try {
    console.log('🔄 Actualizando inscripción directamente...');
    
    // 1. Obtener datos actuales
    const responseGet = await fetch(`/api/inscripciones/${inscripcionId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (responseGet.ok) {
      const result = await responseGet.json();
      
      // Verificar si la respuesta es válida
      if (result && (result.data || result.clases_asistidas !== undefined)) {
        const inscripcion = result.data || result;
        console.log('📄 Datos de inscripción:', inscripcion);
        
        const nuevasClasesAsistidas = (inscripcion.clases_asistidas || 0) + 1;
        
        // 2. Actualizar directamente
        const responseUpdate = await fetch(`/api/inscripciones/${inscripcionId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clases_asistidas: nuevasClasesAsistidas
          })
        });

        if (responseUpdate.ok) {
          const updateResult = await responseUpdate.json();
          console.log('✅ Inscripción actualizada directamente');
          
          return {
            clases_asistidas: nuevasClasesAsistidas,
            clases_totales: inscripcion.clases_totales || 0,
            permisos_disponibles: inscripcion.permisos_disponibles || 0
          };
        }
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', result);
      }
    } else {
      console.warn('⚠️ No se pudo obtener datos de inscripción');
    }
    
    return null;
  } catch (error) {
    console.warn('⚠️ Error en actualización directa:', error);
    return null;
  }
}

// ========== FUNCIÓN PARA ACTUALIZAR INSCRIPCIONES_HORARIOS ==========

async function actualizarInscripcionHorarioSimple(inscripcionId, horarioId) {
  console.log('📝 Función actualizarInscripcionHorarioSimple desactivada temporalmente');
  return; // Simplemente retorna sin hacer nada
}

// ========== FUNCIÓN PARA ACTUALIZAR CLASE PROGRAMADA ==========

async function actualizarClaseProgramada(claseProgramadaId, estado, fechaISO, estudiante, horarioId) {
  try {
    console.log('🔄 Actualizando clase programada:', claseProgramadaId);
    
    const estadoClaseMap = {
      'asistio': 'realizada',
      'falto': 'ausente',
      'permiso': 'justificada'
    };
    
    const estadoClase = estadoClaseMap[estado] || 'programada';
    
    const updateData = {
      estado_clase: estadoClase,
      fecha: fechaISO,
      estudiante_id: estudiante.id,
      horario_id: horarioId,
      inscripcion_id: estudiante.inscripcion_id
    };
    
    const updateUrl = `/api/clases-programadas/${claseProgramadaId}/marcar-asistencia`;
    
    const response = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      console.log('✅ Clase programada actualizada');
    } else {
      console.warn('⚠️ No se pudo actualizar clase programada');
    }
  } catch (error) {
    console.warn('⚠️ Error actualizando clase programada:', error);
  }
}

// ========== FUNCIONES DE APOYO ==========

async function enviarAlServidorAsync(estudiante, horarioId, estado, fechaISO, claseProgramadaId, datosActualizados) {
  try {
    const data = {
      clase_programada_id: claseProgramadaId,
      inscripcion_id: estudiante.inscripcion_id,
      estudiante_id: estudiante.id,
      horario_id: horarioId,
      fecha: fechaISO,
      estado: estado,
      hora_registro: new Date().toISOString()
    };
    
    const response = await asistenciaService.marcar(data);
    
    if (response.data?.success) {
      console.log('✅ Asistencia guardada en servidor');
    }
  } catch (error) {
    console.warn('⚠️ Error enviando al servidor:', error);
  }
}

function actualizarEstudianteEnUI(estudianteId, horarioId, estado, claseProgramadaId, datosActualizados = null) {
  const horarioIndex = horarios.value.findIndex(h => h.id === horarioId);
  if (horarioIndex === -1) {
    console.warn('⚠️ Horario no encontrado:', horarioId);
    return;
  }
  
  const estIndex = horarios.value[horarioIndex].estudiantes.findIndex(e => e.id === estudianteId);
  if (estIndex === -1) {
    console.warn('⚠️ Estudiante no encontrado en horario:', estudianteId);
    return;
  }
  
  const estudianteActual = horarios.value[horarioIndex].estudiantes[estIndex];
  
  const estudianteActualizado = {
    ...estudianteActual,
    asistencia_estado: estado,
    clase_programada_id: claseProgramadaId,
    asistencia_hora: new Date().toISOString()
  };
  
  if (datosActualizados) {
    estudianteActualizado.clases_asistidas = datosActualizados.clases_asistidas;
    estudianteActualizado.clases_totales = datosActualizados.clases_totales;
    estudianteActualizado.permisos_disponibles = datosActualizados.permisos_disponibles;
  } else if (estado === 'asistio') {
    // Si no hay datos actualizados, incrementar localmente
    estudianteActualizado.clases_asistidas = (estudianteActual.clases_asistidas || 0) + 1;
  }
  
  // Actualizar en el array
  horarios.value[horarioIndex].estudiantes[estIndex] = estudianteActualizado;
  
  // Forzar reactividad
  horarios.value = [...horarios.value];
}

async function enviarNotificacionClasesBajas(estudiante, inscripcion, clasesRestantes) {
  try {
    const estudianteEmail = estudiante.email || estudiante.correo;
    
    if (!estudianteEmail) {
      console.warn('⚠️ No se puede notificar: estudiante sin email');
      return;
    }

    const response = await fetch('/api/notificaciones/clases-bajas', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        estudiante_id: estudiante.id,
        estudiante_email: estudianteEmail,
        estudiante_nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
        inscripcion_id: estudiante.inscripcion_id,
        clases_restantes: clasesRestantes,
        clases_totales: inscripcion.clases_totales,
        clases_asistidas: inscripcion.clases_asistidas,
        modalidad: estudiante.modalidad?.nombre || 'Sin modalidad',
        sucursal: estudiante.sucursal?.nombre || 'Sin sucursal'
      })
    });

    if (response.ok) {
      console.log(`📧 Notificación enviada - ${clasesRestantes} clases restantes`);
      toast.add({
        severity: 'warn',
        summary: 'Notificación enviada',
        detail: `Se notificó a ${estudiante.nombres} sobre sus ${clasesRestantes} clases restantes`,
        life: 4000
      });
    }
  } catch (error) {
    console.error('Error enviando notificación:', error);
  }
}



async function marcarInscripcionCompletada(inscripcionId) {
  try {
    const response = await fetch(`/api/inscripciones/${inscripcionId}/completar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Inscripción marcada como completada');
      toast.add({
        severity: 'success',
        summary: '¡Felicidades!',
        detail: 'El estudiante ha completado todas sus clases',
        life: 4000
      });
    }
  } catch (error) {
    console.error('Error marcando inscripción como completada:', error);
  }
}

// ========== FUNCIONES DE JUSTIFICACIÓN ==========

function justificarRapido(estudiante, horarioId) {
  estudianteSeleccionado.value = {
    ...estudiante,
    horario_id: horarioId
    
  };
  motivoJustificacion.value = '';
  mostrarJustificacionRapida.value = true;
}

async function confirmarJustificacionRapida() {
  if (!estudianteSeleccionado.value?.horario_id) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo obtener el horario',
      life: 3000
    });
    return;
  }

  if (!motivoJustificacion.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Campo requerido',
      detail: 'Debe especificar un motivo para la justificación',
      life: 3000
    });
    return;
  }

  procesandoJustificacion.value = true;

  try {
    const fecha = new Date(fechaSeleccionada.value).toISOString().split('T')[0];
    const estudiante = estudianteSeleccionado.value;
    const horarioId = estudiante.horario_id;
    
    console.log('📝 Iniciando justificación para:', {
      estudiante: estudiante.nombres,
      horario: horarioId,
      fecha: fecha,
      motivo: motivoJustificacion.value
    });

    // 1. Preparar datos básicos (SIN clase_programada_id)
    const datosJustificacion = {
      inscripcion_id: estudiante.inscripcion_id,
      estudiante_id: estudiante.id,
      horario_id: horarioId,
      fecha: fecha,
      motivo: motivoJustificacion.value.trim(),
      estado: 'permiso'
    };

    // 2. Enviar al servidor
    console.log('📤 Enviando justificación al servidor:', datosJustificacion);
    const response = await asistenciaService.justificar(datosJustificacion);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error en el servidor');
    }

    console.log('✅ Servidor respondió:', response.data);

    // 3. Actualizar permisos en localStorage y UI
    const nuevosPermisosDisponibles = Math.max(0, (estudiante.permisos_disponibles || 0) - 1);
    
    // Guardar en localStorage
    guardarAsistenciaLocal(
      fechaSeleccionada.value,
      estudiante.id,
      horarioId,
      'permiso',
      {
        asistencia_hora: new Date().toISOString(),
        permisos_disponibles: nuevosPermisosDisponibles,
        permisos_usados: (estudiante.permisos_usados || 0) + 1,
        motivo: motivoJustificacion.value.trim()
      }
    );

    // 4. Actualizar UI
    const horarioIndex = horarios.value.findIndex(h => h.id === horarioId);
    if (horarioIndex !== -1) {
      const estudianteIndex = horarios.value[horarioIndex].estudiantes.findIndex(
        e => e.id === estudiante.id
      );
      if (estudianteIndex !== -1) {
        horarios.value[horarioIndex].estudiantes[estudianteIndex] = {
          ...horarios.value[horarioIndex].estudiantes[estudianteIndex],
          asistencia_estado: 'permiso',
          asistencia_hora: new Date().toISOString(),
          permisos_disponibles: nuevosPermisosDisponibles
        };
        
        // Forzar reactividad
        horarios.value = [...horarios.value];
      }
    }

    // 5. Actualizar estadísticas
    calcularEstadisticas();

    // 6. Mostrar notificación de éxito
    toast.add({
      severity: 'success',
      summary: '✅ Justificación registrada',
      detail: `Permisos restantes: ${nuevosPermisosDisponibles}/3`,
      life: 3000
    });

    // 7. Cerrar modal
    cerrarJustificacion();

  } catch (error) {
    console.error('❌ Error justificando:', error);
    
    // Verificar si es error de JSON (HTML en lugar de JSON)
    if (error.message.includes('Unexpected token') || error.message.includes('<!DOCTYPE')) {
      toast.add({
        severity: 'error',
        summary: 'Error del servidor',
        detail: 'El servidor devolvió una respuesta no válida. Verifica la API.',
        life: 5000
      });
    } else if (error.response?.status === 500) {
      toast.add({
        severity: 'error',
        summary: 'Error 500 del servidor',
        detail: 'Error interno del servidor. Contacta al administrador.',
        life: 5000
      });
    } else if (error.response?.status === 422) {
      toast.add({
        severity: 'error',
        summary: 'Datos inválidos',
        detail: 'Verifica los datos enviados al servidor.',
        life: 4000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar la justificación',
        life: 3000
      });
    }
  } finally {
    procesandoJustificacion.value = false;
  }
}



function cerrarJustificacion() {
  mostrarJustificacionRapida.value = false;
  estudianteSeleccionado.value = null;
  motivoJustificacion.value = '';
}

function abrirModalJustificacion(estudiante, horarioId) {
  if (estudiante.asistencia_estado === 'permiso') {
    if (confirm(`${estudiante.nombres} ya está justificado.\n¿Quieres cambiar a otro estado o modificar la justificación?`)) {
      estudianteSeleccionado.value = {
        ...estudiante,
        horario_id: horarioId,
        ya_justificado: true
      };
      motivoJustificacion.value = '';
      mostrarJustificacionRapida.value = true;
    }
  } else {
    justificarRapido(estudiante, horarioId);
  }
}

// ========== FUNCIONES DE AYUDA ==========

function getIniciales(estudiante) {
  if (!estudiante) return '?';
  const nombres = (estudiante.nombres || '').split(' ');
  const apellidos = (estudiante.apellidos || '').split(' ');
  const inicial1 = nombres[0]?.[0] || '';
  const inicial2 = apellidos[0]?.[0] || '';
  return (inicial1 + inicial2).toUpperCase();
}

function getAvatarClass(estudiante) {
  const estado = estudiante.asistencia_estado;
  if (!estado) return 'bg-blue-100 text-blue-800 border-2 border-blue-200';
  if (estado === 'asistio') return 'bg-green-100 text-green-800 border-2 border-green-200';
  if (estado === 'falto') return 'bg-red-100 text-red-800 border-2 border-red-200';
  if (estado === 'permiso') return 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200';
  return 'bg-blue-100 text-blue-800';
}

function getCardClass(estudiante) {
  const estado = estudiante.asistencia_estado;
  if (estado === 'asistio') return 'card-present';
  if (estado === 'falto') return 'card-absent';
  if (estado === 'permiso') return 'card-justified';
  return 'card-pending';
}

function getEstadoBadge(estudiante) {
  const estado = estudiante.asistencia_estado;
  if (!estado) return 'badge-pending';
  if (estado === 'asistio') return 'badge-present';
  if (estado === 'falto') return 'badge-absent';
  if (estado === 'permiso') return 'badge-justified';
  return 'badge-pending';
}

function getEstadoIcon(estudiante) {
  const estado = estudiante.asistencia_estado;
  if (!estado) return 'pi pi-clock';
  if (estado === 'asistio') return 'pi pi-check';
  if (estado === 'falto') return 'pi pi-times';
  if (estado === 'permiso') return 'pi pi-exclamation-triangle';
  return 'pi pi-clock';
}

function getEstadoLabel(estado) {
  const map = {
    'asistio': 'Presente',
    'falto': 'Ausente',
    'permiso': 'Justificado'
  };
  return map[estado] || 'Sin registro';
}

function getEstadoSeverity(estado) {
  const map = {
    'asistio': 'success',
    'falto': 'danger',
    'permiso': 'warning'
  };
  return map[estado] || 'info';
}

function getDiaCompleto(dia) {
  const dias = {
    'monday': 'Lunes',
    'tuesday': 'Martes',
    'wednesday': 'Miércoles',
    'thursday': 'Jueves',
    'friday': 'Viernes',
    'saturday': 'Sábado',
    'sunday': 'Domingo'
  };
  return dias[dia?.toLowerCase()] || dia;
}

function formatHora(hora) {
  if (!hora) return '--:--';
  const date = new Date(hora);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function contarPorEstado(horario, estado) {
  return (horario.estudiantes || []).filter(e => e.asistencia_estado === estado).length;
}

function obtenerHorarioEstudiante() {
  if (!estudianteSeleccionado.value?.horario_id) return '';
  const horario = horarios.value.find(h => h.id === estudianteSeleccionado.value.horario_id);
  return horario ? `${horario.hora_inicio} - ${horario.hora_fin}` : '';
}

// ========== FUNCIONES DE ACCIÓN ==========

function cambiarFecha(dias) {
  const nuevaFecha = new Date(fechaSeleccionada.value);
  nuevaFecha.setDate(nuevaFecha.getDate() + dias);
  fechaSeleccionada.value = nuevaFecha;
  cargarAsistencias();
}

function irAHoy() {
  fechaSeleccionada.value = new Date();
  cargarAsistencias();
}

function seleccionarMotivo(motivo) {
  motivoJustificacion.value = motivo;
}

function marcarTodosEnHorario(horarioId, estado) {
  const horario = horarios.value.find(h => h.id === horarioId);
  if (!horario) return;

  const sinRegistrar = horario.estudiantes.filter(e => !e.asistencia_estado);
  sinRegistrar.forEach(est => {
    marcarAsistencia(est, horarioId, estado);
  });
}

function marcarTodosPresentes() {
  horarios.value.forEach(horario => {
    marcarTodosEnHorario(horario.id, 'asistio');
  });
}

async function exportarExcel() {
  try {
    const fecha = new Date(fechaSeleccionada.value).toISOString().split('T')[0];
    const response = await asistenciaService.exportarReporte(fecha);

    if (response.data) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `asistencias_${fecha}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    toast.add({
      severity: 'success',
      summary: 'Exportando',
      detail: 'El reporte se descargará en breve',
      life: 3000
    });
  } catch (error) {
    console.error('Error exportando:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo exportar el reporte',
      life: 3000
    });
  }
}
</script>

<style scoped>
.asistencia-container {
  padding: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* HEADER ESTILO GLASSMORPHISM */
.header-glass {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  position: relative;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-left .date-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-display i {
  font-size: 2.5rem;
  color: #3b82f6;
}

.header-right {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.action-buttons-header {
  display: flex;
  gap: 0.5rem;
}

.calendar-floating {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border: 1px solid #e5e7eb;
}

/* SUMMARY CARDS MEJORADAS */
.summary-section {
  margin-bottom: 2rem;
}

.summary-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
  height: 100%;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.summary-card.present {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-left: 4px solid #10b981;
}

.summary-card.absent {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-left: 4px solid #ef4444;
}

.summary-card.justified {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-left: 4px solid #f59e0b;
}

.summary-card.total {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-left: 4px solid #3b82f6;
}

.summary-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
  color: #1f2937;
}

/* FILTERS SECTION */
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* HORARIOS CONTAINER */
.horarios-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.p-accordion .p-accordion-header) {
  background: #f8fafc !important;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.p-accordion .p-accordion-header:hover) {
  background: #f1f5f9 !important;
}

.horario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0;
}

.horario-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* ESTUDIANTE CARD */
.estudiantes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.estudiante-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  background: white;
  position: relative;
}

.estudiante-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
  border-color: #3b82f6;
}

.card-present {
  border-left: 4px solid #10b981;
  background: linear-gradient(to right, #f0fdf4, white);
}

.card-absent {
  border-left: 4px solid #ef4444;
  background: linear-gradient(to right, #fef2f2, white);
}

.card-justified {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(to right, #fffbeb, white);
}

.card-pending {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(to right, #eff6ff, white);
}

.estudiante-avatar-section {
  position: relative;
}

.estado-badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.badge-present {
  background: #10b981;
  color: white;
}

.badge-absent {
  background: #ef4444;
  color: white;
}

.badge-justified {
  background: #f59e0b;
  color: white;
}

.badge-pending {
  background: #3b82f6;
  color: white;
}

.estudiante-info-section {
  flex: 1;
  min-width: 0;
}

.estudiante-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-item i {
  font-size: 0.875rem;
}

.estudiante-actions-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* HORARIO SUMMARY */
.horario-summary {
  padding: 1rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  margin-top: 1rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 20px;
  font-size: 0.875rem;
  border: 1px solid #e5e7eb;
}

/* QUICK REASONS */
.quick-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* LOADING & EMPTY STATES */
.loading-container,
.empty-container {
  padding: 2rem;
}

.loading-card,
.empty-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .asistencia-container {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .estudiantes-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .estudiante-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .estudiante-actions-section {
    width: 100%;
  }

  .horario-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .horario-meta {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 576px) {
  .summary-section .col-12 {
    margin-bottom: 1rem;
  }

  .filters-section .flex-wrap {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }

  .header-right {
    flex-wrap: wrap;
  }
}

/* ANIMATIONS */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.estudiante-card {
  animation: fadeIn 0.3s ease-out;
}
</style>