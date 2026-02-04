<template>
  <div class="recuperaciones-container">
    <!-- HEADER PRINCIPAL -->
    <div class="header-glass">
      <div class="header-content">
        <div class="header-left">
          <div class="date-display">
            <i class="pi pi-history text-primary"></i>
            <div>
              <h1 class="m-0 text-2xl font-bold">Sistema de Recuperaciones</h1>
              <p class="m-0 text-500 flex align-items-center gap-2">
                <span>Recuperar clases justificadas pendientes</span>
                <Badge :value="totalPermisosDisponibles" severity="warning" size="small" />
              </p>
            </div>
          </div>
        </div>

        <div class="header-right">
          <!-- Lista de estudiantes con permisos (en lugar de dropdown) -->
          <div class="estudiantes-lista">
            <div v-if="inscripcionesConPermisos.length === 0" class="no-estudiantes">
              <i class="pi pi-users text-400"></i>
              <span class="text-500 ml-2">No hay estudiantes con permisos pendientes</span>
            </div>
            <div v-else class="estudiantes-grid">
              <div v-for="inscripcion in inscripcionesConPermisos" :key="inscripcion.id" class="estudiante-card"
                :class="{ 'selected': inscripcionSeleccionada === inscripcion.id }"
                @click="seleccionarInscripcion(inscripcion)">
                <div class="estudiante-info">
                  <Avatar :label="getInicialesEstudiante(inscripcion.estudiante)" class="mr-2"
                    :style="{ backgroundColor: getColorEstudiante(inscripcion.id) }" />
                  <div>
                    <div class="estudiante-nombre font-bold">
                      {{ inscripcion.estudiante?.nombres || 'Estudiante' }}
                    </div>
                    <div class="estudiante-detalles text-sm text-500">
                      #{{ inscripcion.id }} • {{ inscripcion.permisos_recuperables || 0 }} permisos
                    </div>
                  </div>
                </div>
                <Badge :value="inscripcion.permisos_recuperables || 0" severity="warning" size="small" />
              </div>
            </div>
          </div>

          <div class="action-buttons-header">
            <Button icon="pi pi-plus" label="Nueva Recuperación" severity="success" @click="abrirModalNuevaRecuperacion"
              :disabled="!inscripcionSeleccionada" />
            <Button icon="pi pi-sync" @click="cargarDatos" :loading="cargando" rounded tooltip="Refrescar datos" />
          </div>
        </div>
      </div>
    </div>

    <!-- PANEL DE RESUMEN -->
    <div v-if="inscripcionSeleccionada" class="summary-section">
      <div class="grid">
        <div class="col-12 md:col-3">
          <Card class="summary-card permisos">
            <template #content>
              <div class="flex align-items-center justify-content-between">
                <div>
                  <span class="summary-label">Permisos Justificados</span>
                  <h2 class="summary-value">{{ estadisticas.permisosJustificados }}</h2>
                </div>
                <i class="pi pi-ticket text-5xl opacity-30"></i>
              </div>
              <ProgressBar :value="porcentajePermisosUsados" :showValue="false" class="mt-3" />
            </template>
          </Card>
        </div>

        <div class="col-12 md:col-3">
          <Card class="summary-card recuperables">
            <template #content>
              <div class="flex align-items-center justify-content-between">
                <div>
                  <span class="summary-label">Disponibles para Recuperar</span>
                  <h2 class="summary-value">{{ estadisticas.permisosRecuperables }}</h2>
                </div>
                <i class="pi pi-history text-5xl opacity-30"></i>
              </div>
              <div class="mt-2">
                <small class="text-500">Vencen en {{ diasParaVencer }} días</small>
              </div>
            </template>
          </Card>
        </div>

        <div class="col-12 md:col-3">
          <Card class="summary-card programadas">
            <template #content>
              <div class="flex align-items-center justify-content-between">
                <div>
                  <span class="summary-label">Recuperaciones Programadas</span>
                  <h2 class="summary-value">{{ estadisticas.recuperacionesProgramadas }}</h2>
                </div>
                <i class="pi pi-calendar-check text-5xl opacity-30"></i>
              </div>
              <div class="mt-2">
                <small class="text-500">{{ estadisticas.recuperacionesEstaSemana }} esta semana</small>
              </div>
            </template>
          </Card>
        </div>

        <div class="col-12 md:col-3">
          <Card class="summary-card completadas">
            <template #content>
              <div class="flex align-items-center justify-content-between">
                <div>
                  <span class="summary-label">Recuperaciones Completadas</span>
                  <h2 class="summary-value">{{ estadisticas.recuperacionesCompletadas }}</h2>
                </div>
                <i class="pi pi-check-circle text-5xl opacity-30"></i>
              </div>
              <div class="mt-2">
                <small class="text-500">% Éxito: {{ porcentajeExitoRecuperaciones }}%</small>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <div v-if="inscripcionSeleccionada" class="content-section">
      <div class="grid">
        <!-- COLUMNA 1: PERMISOS JUSTIFICADOS DISPONIBLES -->
        <div class="col-12 lg:col-6">
          <Card class="permisos-card">
            <template #title>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-exclamation-triangle text-warning"></i>
                <span>Permisos Justificados Disponibles</span>
                <Badge :value="permisosDisponibles.length" severity="warning" />
              </div>
            </template>

            <template #content>
              <div v-if="cargandoPermisos" class="loading-mini">
                <ProgressSpinner style="width: 30px; height: 30px" />
                <span class="ml-2">Cargando permisos...</span>
              </div>

              <div v-else-if="permisosDisponibles.length === 0" class="empty-state">
                <i class="pi pi-check-circle text-green-500" style="font-size: 3rem"></i>
                <h4 class="mt-3 mb-1">No hay permisos pendientes</h4>
                <p class="text-500">Todas las clases justificadas han sido recuperadas</p>
              </div>

              <div v-else class="permisos-list">
                <div v-for="permiso in permisosDisponibles" :key="permiso.id" class="permiso-item"
                  @click="seleccionarPermiso(permiso)">
                  <div class="permiso-header">
                    <div class="permiso-fecha">
                      <i class="pi pi-calendar"></i>
                      <span>{{ formatFecha(permiso.fecha_falta) }}</span>
                    </div>
                    <Tag :value="getEstadoPermisoLabel(permiso.estado)"
                      :severity="getEstadoPermisoSeverity(permiso.estado)" />
                  </div>

                  <div class="permiso-body">
                    <h5 class="mb-1">{{ permiso.motivo }}</h5>
                    <p class="text-500 mb-2">{{ permiso.evidencia || 'Sin detalles adicionales' }}</p>

                    <div class="permiso-info">
                      <div class="info-item">
                        <i class="pi pi-clock"></i>
                        <span>Solicitado: {{ formatFechaHora(permiso.created_at) }}</span>
                      </div>

                      <div v-if="permiso.fecha_limite_recuperacion" class="info-item">
                        <i class="pi pi-calendar-times"></i>
                        <span :class="getClaseVencimiento(permiso.fecha_limite_recuperacion)">
                          Vence: {{ formatFecha(permiso.fecha_limite_recuperacion) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="permiso-footer">
                    <Button icon="pi pi-history" label="Programar Recuperación" size="small" outlined
                      @click.stop="programarRecuperacion(permiso)" :disabled="!puedeRecuperar(permiso)" />
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- COLUMNA 2: RECUPERACIONES PROGRAMADAS -->
        <div class="col-12 lg:col-6">
          <Card class="recuperaciones-card">
            <template #title>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-calendar text-primary"></i>
                <span>Recuperaciones Programadas</span>
                <Badge :value="recuperacionesProgramadas.length" severity="info" />
              </div>
            </template>

            <template #content>
              <div v-if="cargandoRecuperaciones" class="loading-mini">
                <ProgressSpinner style="width: 30px; height: 30px" />
                <span class="ml-2">Cargando recuperaciones...</span>
              </div>

              <div v-else-if="recuperacionesProgramadas.length === 0" class="empty-state">
                <i class="pi pi-calendar-times text-blue-500" style="font-size: 3rem"></i>
                <h4 class="mt-3 mb-1">No hay recuperaciones programadas</h4>
                <p class="text-500">Programa una recuperación desde los permisos disponibles</p>
              </div>

              <div v-else class="recuperaciones-list">
                <div v-for="recuperacion in recuperacionesProgramadas" :key="recuperacion.id" class="recuperacion-item">
                  <div class="recuperacion-header">
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-calendar" :class="getIconoEstadoRecuperacion(recuperacion.estado)"></i>
                      <span class="font-bold">{{ formatFecha(recuperacion.fecha_recuperacion) }}</span>
                    </div>
                    <Tag :value="getEstadoRecuperacionLabel(recuperacion.estado)"
                      :severity="getEstadoRecuperacionSeverity(recuperacion.estado)" />
                  </div>

                  <div class="recuperacion-body">
                    <div class="grid">
                      <div class="col-6">
                        <div class="info-item">
                          <i class="pi pi-clock"></i>
                          <span>{{ recuperacion.horario?.hora_inicio }} - {{ recuperacion.horario?.hora_fin }}</span>
                        </div>
                        <div class="info-item">
                          <i class="pi pi-user"></i>
                          <span>{{ recuperacion.horario?.entrenador_nombre || 'Sin entrenador' }}</span>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="info-item">
                          <i class="pi pi-building"></i>
                          <span>{{ recuperacion.horario?.sucursal_nombre || 'Sin sucursal' }}</span>
                        </div>
                        <div class="info-item">
                          <i class="pi pi-tag"></i>
                          <span>{{ recuperacion.horario?.modalidad_nombre || 'Sin modalidad' }}</span>
                        </div>
                      </div>
                    </div>

                    <div v-if="recuperacion.motivo" class="mt-2">
                      <small class="text-500">Motivo: {{ recuperacion.motivo }}</small>
                    </div>

                    <div v-if="recuperacion.permiso_asociado" class="mt-2 p-2 border-round bg-blue-50">
                      <small class="font-bold">Permiso recuperado:</small>
                      <div class="text-500 text-sm">
                        {{ recuperacion.permiso_asociado.motivo }} -
                        {{ formatFecha(recuperacion.permiso_asociado.fecha_falta) }}
                      </div>
                    </div>
                  </div>

                  <div class="recuperacion-footer">
                    <div class="flex gap-2">
                      <Button icon="pi pi-check" label="Marcar Completada" size="small" severity="success" outlined
                        @click="completarRecuperacion(recuperacion)" v-if="recuperacion.estado === 'programada'" />
                      <Button icon="pi pi-times" label="Cancelar" size="small" severity="danger" outlined
                        @click="cancelarRecuperacion(recuperacion)" v-if="recuperacion.estado === 'programada'" />
                      <Button icon="pi pi-eye" label="Detalles" size="small" severity="info" outlined
                        @click="verDetallesRecuperacion(recuperacion)" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- MODAL DE PROGRAMACIÓN CORREGIDO -->
 <!-- MODAL PARA PROGRAMAR RECUPERACIÓN -->
      <Dialog v-model:visible="mostrarModalProgramacion" modal header="Programar Recuperación" 
            :style="{ width: '600px' }" @after-hide="resetearModalProgramacion">
      <div v-if="permisoSeleccionado">
        <!-- Información del permiso -->
        <div class="mb-4 p-3 border-round bg-yellow-50">
          <div class="flex align-items-center gap-3">
            <i class="pi pi-exclamation-triangle text-yellow-500" style="font-size: 1.5rem"></i>
            <div>
              <h5 class="mt-0 mb-1">Recuperando permiso del {{ formatFecha(permisoSeleccionado.fecha_falta) }}</h5>
              <div class="text-sm">
                <span class="font-bold">Motivo:</span> {{ permisoSeleccionado.motivo }}
              </div>
              <div class="text-sm text-500">
                <span>Fecha límite para recuperar:</span> 
                <span :class="getClaseVencimiento(permisoSeleccionado.fecha_limite_recuperacion)">
                  {{ formatFecha(permisoSeleccionado.fecha_limite_recuperacion) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <h5 class="mt-0 mb-3">Seleccionar horario de recuperación</h5>
          
          <div v-if="cargandoHorarios" class="text-center p-4">
            <ProgressSpinner style="width: 40px; height: 40px" />
            <p class="text-500 mt-2">Buscando horarios disponibles...</p>
          </div>
          
          <div v-else-if="horariosDisponibles.length === 0" class="text-center p-4 border-round border-1 surface-border">
            <i class="pi pi-calendar-times text-400" style="font-size: 3rem"></i>
            <p class="text-500 mt-2">No hay horarios disponibles para recuperación</p>
            <small class="text-500">Contacte con administración para más opciones</small>
          </div>
          
          <div v-else class="horarios-grid">
            <div v-for="horario in horariosDisponibles" :key="horario.id" 
                 class="horario-option" :class="{ 'selected': horarioRecuperacionSeleccionado?.id === horario.id }"
                 @click="seleccionarHorarioRecuperacion(horario)">
              <div class="horario-content">
                <div class="flex justify-content-between align-items-center mb-2">
                  <div class="font-bold">{{ horario.dia_semana }}</div>
                  <Tag :value="`$${horario.precio || 0}`" severity="success" />
                </div>
                
                <div class="text-lg font-bold mb-1">
                  {{ horario.hora_inicio }} - {{ horario.hora_fin }}
                </div>
                
                <div class="text-sm text-500 mb-2">
                  {{ horario.entrenador_nombre }} • {{ horario.sucursal_nombre }}
                </div>
                
                <div class="horario-meta">
                  <div class="meta-item">
                    <i class="pi pi-users"></i>
                    <small>Cupo: {{ horario.cupo_disponible }}/{{ horario.cupo_maximo }}</small>
                  </div>
                  <div class="meta-item">
                    <i class="pi pi-star"></i>
                    <small>{{ horario.modalidad_nombre }}</small>
                  </div>
                </div>
                
                <div v-if="horarioRecuperacionSeleccionado?.id === horario.id" class="selected-indicator">
                  <i class="pi pi-check-circle text-green-500"></i>
                  <span class="text-sm text-green-600">Seleccionado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <h5 class="mt-0 mb-3">Fecha de recuperación</h5>
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 block mb-1">Fecha *</label>
                <Calendar v-model="fechaRecuperacion" :minDate="hoy" :maxDate="fechaLimiteRecuperacion" 
                          dateFormat="dd/mm/yy" class="w-full" :disabledDates="fechasNoDisponibles"
                          :class="{ 'p-invalid': !fechaRecuperacion }" @update:modelValue="onFechaChange" />
                <small v-if="!fechaRecuperacion" class="p-error">Seleccione una fecha</small>
              </div>
            </div>
            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 block mb-1">Período válido</label>
                <div class="p-2 border-round bg-green-50">
                  <div class="text-sm">
                    <div>Desde: {{ formatFecha(hoy) }}</div>
                    <div>Hasta: {{ formatFecha(fechaLimiteRecuperacion) }}</div>
                    <div class="font-bold mt-1" :class="diasRestantesClass">
                      {{ diasRestantesParaRecuperar }} días restantes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <div class="field">
            <label class="text-500 block mb-1">Observaciones (Opcional)</label>
            <Textarea v-model="observacionRecuperacion" rows="3" class="w-full" 
                      placeholder="Detalles adicionales sobre la recuperación..." />
          </div>
        </div>

        <!-- Resumen -->
        <Card class="mb-4">
          <template #title>Resumen de la Recuperación</template>
          <template #content>
            <div class="space-y-2">
              <div class="flex justify-content-between">
                <span class="text-500">Permiso a recuperar:</span>
                <span class="font-bold">{{ permisoSeleccionado.motivo }}</span>
              </div>
              
              <div v-if="horarioRecuperacionSeleccionado" class="flex justify-content-between">
                <span class="text-500">Horario:</span>
                <span class="font-bold">{{ horarioRecuperacionSeleccionado.dia_semana }} {{ horarioRecuperacionSeleccionado.hora_inicio }}</span>
              </div>
              
              <div v-if="fechaRecuperacion" class="flex justify-content-between">
                <span class="text-500">Fecha:</span>
                <span class="font-bold text-primary">{{ formatFecha(fechaRecuperacion) }}</span>
              </div>
              
              <div class="flex justify-content-between">
                <span class="text-500">Estado:</span>
                <Tag value="Programada" severity="info" />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="mostrarModalProgramacion = false" />
        <Button label="Programar Recuperación" severity="success" icon="pi pi-calendar-plus" 
                @click="guardarRecuperacion" :loading="guardandoRecuperacion"
                :disabled="!horarioRecuperacionSeleccionado || !fechaRecuperacion" />
      </template>
    </Dialog>

    <Dialog v-model:visible="mostrarModalDetalles" modal :header="tituloModalDetalles" :style="{ width: '500px' }">
      <template #content>
        <div v-if="recuperacionSeleccionada">
          <div class="grid">
            <div class="col-12">
              <div class="field">
                <label class="font-bold block mb-2">Estado:</label>
                <Tag :value="getEstadoRecuperacionLabel(recuperacionSeleccionada.estado)"
                     :severity="getEstadoRecuperacionSeverity(recuperacionSeleccionada.estado)" />
              </div>
            </div>
            <div class="col-12 md:col-6">
              <div class="field">
                <label class="font-bold block mb-2">Fecha de recuperación:</label>
                <span>{{ formatFecha(recuperacionSeleccionada.fecha_recuperacion) }}</span>
              </div>
            </div>
            <div class="col-12 md:col-6">
              <div class="field">
                <label class="font-bold block mb-2">Horario:</label>
                <span>{{ recuperacionSeleccionada.horario?.hora_inicio }} - {{ recuperacionSeleccionada.horario?.hora_fin }}</span>
              </div>
            </div>
            <div class="col-12">
              <div class="field">
                <label class="font-bold block mb-2">Entrenador:</label>
                <span>{{ recuperacionSeleccionada.horario?.entrenador_nombre || 'Sin entrenador' }}</span>
              </div>
            </div>
            <div class="col-12">
              <div class="field">
                <label class="font-bold block mb-2">Sucursal:</label>
                <span>{{ recuperacionSeleccionada.horario?.sucursal_nombre || 'Sin sucursal' }}</span>
              </div>
            </div>
            <div v-if="recuperacionSeleccionada.motivo" class="col-12">
              <div class="field">
                <label class="font-bold block mb-2">Motivo:</label>
                <p class="mt-0">{{ recuperacionSeleccionada.motivo }}</p>
              </div>
            </div>
            <div v-if="recuperacionSeleccionada.comentarios" class="col-12">
              <div class="field">
                <label class="font-bold block mb-2">Comentarios:</label>
                <p class="mt-0">{{ recuperacionSeleccionada.comentarios }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Dialog>

    <Toast position="bottom-right" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Badge from 'primevue/badge'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import Calendar from 'primevue/calendar'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import Avatar from 'primevue/avatar'
import Toast from 'primevue/toast'

import recuperacionService from '@/services/recuperacion.service'
import inscripcionService from '@/services/inscripcion.service'
import permisoService from '@/services/permiso.service'

const toast = useToast()

// Estados principales
const inscripcionSeleccionada = ref(null)
const inscripcionesConPermisos = ref([])
const cargando = ref(false)
const cargandoPermisos = ref(false)
const cargandoRecuperaciones = ref(false)

// Datos de permisos y recuperaciones
const permisosDisponibles = ref([])
const recuperacionesProgramadas = ref([])

// Estadísticas
const estadisticas = ref({
  permisosJustificados: 0,
  permisosRecuperables: 0,
  recuperacionesProgramadas: 0,
  recuperacionesCompletadas: 0,
  recuperacionesEstaSemana: 0
})

// Modal de programación
const mostrarModalProgramacion = ref(false)
const permisoSeleccionado = ref(null)
const horariosDisponibles = ref([])
const cargandoHorarios = ref(false)
const horarioRecuperacionSeleccionado = ref(null)
const fechaRecuperacion = ref(null)
const observacionRecuperacion = ref('')
const guardandoRecuperacion = ref(false)
const filtroDia = ref('Todos')

const fechasNoDisponibles = ref([])



// Modal de detalles
const mostrarModalDetalles = ref(false)
const recuperacionSeleccionada = ref(null)
const tituloModalDetalles = ref('Detalles de Recuperación')

// Fechas importantes
const hoy = ref(new Date())

// Computed properties
const totalPermisosDisponibles = computed(() => {
  return permisosDisponibles.value.length
})

const porcentajePermisosUsados = computed(() => {
  if (estadisticas.value.permisosJustificados === 0) return 0
  return (estadisticas.value.permisosRecuperables / estadisticas.value.permisosJustificados) * 100
})

const diasParaVencer = computed(() => {
  if (permisosDisponibles.value.length === 0) return 0

  const hoyDate = new Date()
  const fechasLimite = permisosDisponibles.value
    .filter(p => p.fecha_limite_recuperacion)
    .map(p => new Date(p.fecha_limite_recuperacion))

  if (fechasLimite.length === 0) return 30
  const fechaMasCercana = fechasLimite.reduce((closest, fecha) => {
    return fecha < closest ? fecha : closest
  })

  const diffMs = fechaMasCercana - hoyDate
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
})

const porcentajeExitoRecuperaciones = computed(() => {
  const total = estadisticas.value.recuperacionesProgramadas + estadisticas.value.recuperacionesCompletadas
  if (total === 0) return 0
  return Math.round((estadisticas.value.recuperacionesCompletadas / total) * 100)
})

const fechaLimiteRecuperacion = computed(() => {
  if (!permisoSeleccionado.value?.fecha_limite_recuperacion) {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() + 30)
    return fecha
  }
  return new Date(permisoSeleccionado.value.fecha_limite_recuperacion)
})

const diasRestantesParaRecuperar = computed(() => {
  if (!fechaLimiteRecuperacion.value) return 0
  const diffMs = fechaLimiteRecuperacion.value - hoy.value
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
})

const diasRestantesClass = computed(() => {
  const dias = diasRestantesParaRecuperar.value
  if (dias <= 7) return 'text-red-500'
  if (dias <= 14) return 'text-yellow-500'
  return 'text-green-500'
})

const inscripcionSeleccionadaObj = computed(() => {
  return inscripcionesConPermisos.value.find(i => i.id === inscripcionSeleccionada.value)
})

const horariosFiltrados = computed(() => {
  if (filtroDia.value === 'Todos') {
    return horariosDisponibles.value
  }
  return horariosDisponibles.value.filter(horario => 
    horario.dia_semana.toLowerCase() === filtroDia.value.toLowerCase()
  )
})

// Funciones principales
onMounted(async () => {
  await cargarInscripcionesConPermisos()
})

async function cargarInscripcionesConPermisos() {
  cargando.value = true
  try {
    console.log('📋 Cargando estudiantes con permisos...')

    const response = await inscripcionService.index(1, 100, '', {
      estado: 'activo',
      with_estudiante: true,
      with_modalidad: true
    })

    let inscripcionesData = []

    if (response.data) {
      if (response.data.success && Array.isArray(response.data.data)) {
        inscripcionesData = response.data.data
      } else if (Array.isArray(response.data)) {
        inscripcionesData = response.data
      }
    }

    console.log(`✅ ${inscripcionesData.length} inscripciones cargadas`)

    const inscripcionesConInfo = []

    for (const insc of inscripcionesData) {
      if (insc.permisos_usados && insc.permisos_usados > 0) {
        try {
          const permisosResponse = await permisoService.getJustificadosPorInscripcion(insc.id)

          let permisosDetallados = []
          let permisosRecuperables = 0

          if (permisosResponse.data?.success) {
            if (Array.isArray(permisosResponse.data.data)) {
              permisosDetallados = permisosResponse.data.data
            } else if (Array.isArray(permisosResponse.data)) {
              permisosDetallados = permisosResponse.data
            }

            const permisosAprobados = permisosDetallados.filter(p =>
              p.estado === 'aprobado' &&
              (!p.tiene_recuperacion || p.tiene_recuperacion === false)
            )

            permisosRecuperables = permisosAprobados.length
          }

          if (permisosRecuperables > 0) {
            inscripcionesConInfo.push({
              id: insc.id,
              codigo: `INS-${insc.id}`,
              estudiante: insc.estudiante,
              modalidad: insc.modalidad,
              fecha_inicio: insc.fecha_inicio,
              fecha_fin: insc.fecha_fin,
              permisos_usados: insc.permisos_usados || 0,
              permisos_disponibles: insc.permisos_disponibles || 0,
              permisos_recuperables: permisosRecuperables,
              todos_permisos: permisosDetallados,
              tiene_permisos: true
            })
          }

        } catch (error) {
          console.warn(`⚠️ Error cargando permisos para inscripción ${insc.id}:`, error.message)
        }
      }
    }

    inscripcionesConPermisos.value = inscripcionesConInfo
    console.log(`🎯 ${inscripcionesConPermisos.value.length} estudiantes con permisos recuperables`)

  } catch (error) {
    console.error('❌ Error cargando inscripciones:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los estudiantes',
      life: 3000
    })
  } finally {
    cargando.value = false
  }
}

function seleccionarInscripcion(inscripcion) {
  inscripcionSeleccionada.value = inscripcion.id
  cargarPermisosYRecuperaciones()
}

async function cargarPermisosYRecuperaciones() {
  if (!inscripcionSeleccionada.value) return

  try {
    await Promise.all([
      cargarPermisosDisponibles(),
      cargarRecuperacionesProgramadas()
    ])

    calcularEstadisticas()

  } catch (error) {
    console.error('❌ Error cargando datos:', error)
  }
}

async function completarRecuperacion(recuperacion) {
  try {
    const confirmacion = confirm(`¿Marcar la recuperación del ${formatFecha(recuperacion.fecha_recuperacion)} como COMPLETADA?`)

    if (!confirmacion) return

    console.log(`🎯 Completando recuperación ID: ${recuperacion.id}`)

    // Enviar 'comentarios' en lugar de 'observaciones'
    const datosCompletar = {
      comentarios: 'Recuperación completada exitosamente'
    }

    const response = await recuperacionService.completar(recuperacion.id, datosCompletar)

    if (response.data?.success) {
      console.log('✅ Recuperación marcada como completada:', response.data)

      // Actualizar la recuperación localmente
      const index = recuperacionesProgramadas.value.findIndex(r => r.id === recuperacion.id)
      if (index !== -1) {
        recuperacionesProgramadas.value[index] = {
          ...recuperacionesProgramadas.value[index],
          estado: 'completada',
          fecha_completada: new Date().toISOString(),
          asistio_recuperacion: true,
          comentarios: 'Recuperación completada exitosamente'
        }

        recuperacionesProgramadas.value = [...recuperacionesProgramadas.value]
      }

      calcularEstadisticas()

      toast.add({
        severity: 'success',
        summary: '✅ Recuperación Completada',
        detail: `La recuperación ha sido marcada como completada exitosamente`,
        life: 3000
      })

      setTimeout(() => {
        cargarPermisosYRecuperaciones()
      }, 1000)

    } else {
      throw new Error(response.data?.message || 'Error en el servidor')
    }

  } catch (error) {
    console.error('❌ Error al completar recuperación:', error)

    let mensajeError = 'No se pudo completar la recuperación'

    if (error.response?.status === 400) {
      mensajeError = error.response.data?.message || 'La recuperación no se puede completar'
    } else if (error.response?.status === 422) {
      mensajeError = 'Datos inválidos para completar la recuperación'
    } else if (error.response?.status === 404) {
      mensajeError = 'La recuperación no fue encontrada'
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensajeError,
      life: 4000
    })
  }
}

async function cargarPermisosDisponibles() {
  if (!inscripcionSeleccionada.value) return

  cargandoPermisos.value = true
  try {
    console.log(`📋 Cargando permisos para inscripción ${inscripcionSeleccionada.value}...`)

    const response = await permisoService.getRecuperables(inscripcionSeleccionada.value)

    let permisosData = []

    if (response.data) {
      if (response.data.success) {
        if (Array.isArray(response.data.permisos_recuperables)) {
          permisosData = response.data.permisos_recuperables
        } else if (Array.isArray(response.data.data)) {
          permisosData = response.data.data
        } else if (Array.isArray(response.data)) {
          permisosData = response.data
        }
      }
    }

    console.log(`✅ ${permisosData.length} permisos cargados`)

    permisosDisponibles.value = permisosData.map(permiso => {
      const fechaLimite = permiso.fecha_limite_recuperacion ||
        calcularFechaLimite(permiso.fecha_falta)

      return {
        id: permiso.id,
        inscripcion_id: permiso.inscripcion_id || inscripcionSeleccionada.value,
        estudiante_id: permiso.estudiante_id,
        asistencia_id: permiso.asistencia_id,
        fecha_falta: permiso.fecha_falta,
        motivo: permiso.motivo,
        evidencia: permiso.evidencia || permiso.observaciones || '',
        estado: 'aprobado',
        fecha_limite_recuperacion: fechaLimite,
        dias_restantes: calcularDiasRestantes(fechaLimite),
        puede_recuperar: true,
        horario_falta: permiso.horario_falta || {}
      }
    }).filter(p => p.puede_recuperar)

  } catch (error) {
    console.error('❌ Error cargando permisos:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los permisos',
      life: 3000
    })
  } finally {
    cargandoPermisos.value = false
  }
}

function seleccionarPermiso(permiso) {
  try {
    console.log('🔍 Permiso seleccionado:', permiso)

    toast.add({
      severity: 'info',
      summary: 'Permiso Seleccionado',
      detail: `Permiso del ${formatFecha(permiso.fecha_falta)} - ${permiso.motivo}`,
      life: 2000
    })

  } catch (error) {
    console.error('Error en seleccionarPermiso:', error)
  }
}



function puedeRecuperar(permiso) {
  if (!permiso) return false

  if (permiso.estado !== 'aprobado') return false

  if (permiso.fecha_limite_recuperacion) {
    const hoy = new Date()
    const fechaLimite = new Date(permiso.fecha_limite_recuperacion)
    if (hoy > fechaLimite) return false
  }

  return true
}

async function cargarTodosHorariosModalidad() {
  if (!permisoSeleccionado.value || !inscripcionSeleccionada.value) {
    console.error('❌ No hay permiso o inscripción seleccionada')
    return
  }

  cargandoHorarios.value = true
  horariosDisponibles.value = []
  horarioRecuperacionSeleccionado.value = null
  filtroDia.value = 'Todos'

  try {
    const inscripcion = inscripcionesConPermisos.value.find(
      i => i.id === inscripcionSeleccionada.value
    )

    if (!inscripcion) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontró la información de la inscripción',
        life: 3000
      })
      return
    }

    console.log('🎯 Buscando horarios para modalidad:', {
      modalidadId: inscripcion.modalidad?.id,
      modalidadNombre: inscripcion.modalidad?.nombre
    })

    // ========== USAR ENDPOINT DE HORARIOS GENERALES ==========
    
    // IMPORTANTE: Vamos a usar un endpoint diferente
    
    // Opción 1: Intentar con horarios generales (recomendado)
    try {
      console.log('📤 Intentando con endpoint /horarios...')
      
      // Primero, necesitamos crear o usar un servicio de horarios
      // Si no tienes horario.service.js, podemos hacer la petición directamente
      
      // Vamos a usar Axios directamente para este caso
      const axios = require('axios')
      const baseURL = process.env.VUE_APP_API_URL || 'http://localhost:8000/api'
      
      const response = await axios.get(`${baseURL}/horarios`, {
        params: {
          modalidad_id: inscripcion.modalidad?.id,
          estado: 'activo',
          with_entrenador: true,
          with_sucursal: true,
          with_modalidad: true,
          limit: 100
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      console.log('✅ Respuesta de /horarios:', response.data)
      
      if (response.data.success && Array.isArray(response.data.data)) {
        horariosDisponibles.value = response.data.data.map(horario => ({
          id: horario.id,
          hora_inicio: formatHora(horario.hora_inicio),
          hora_fin: formatHora(horario.hora_fin),
          dia_semana: obtenerNombreDia(horario.dia_semana),
          entrenador_nombre: horario.entrenador?.nombres || 'Sin entrenador',
          sucursal_nombre: horario.sucursal?.nombre || 'Sin sucursal',
          modalidad_nombre: horario.modalidad?.nombre || 'Sin modalidad',
          cupos_disponibles: horario.cupo_maximo - (horario.cupo_actual || 0),
          capacidad_maxima: horario.cupo_maximo || 20
        }))
        
        console.log(`✅ ${horariosDisponibles.value.length} horarios cargados desde /horarios`)
      }
      
    } catch (error1) {
      console.log('⚠️ Error con /horarios:', error1.message)
      
      // Opción 2: Intentar con el endpoint de recuperaciones pero SIN fecha
      try {
        console.log('📤 Intentando con endpoint de recuperaciones...')
        
        const modalidadId = inscripcion.modalidad?.id
        
        // Llamar SIN fecha para obtener todos los horarios
        const response = await recuperacionService.getHorariosDisponibles(modalidadId, null)
        
        console.log('📥 Respuesta de recuperaciones/horarios/disponibles:', response.data)
        
        if (response.data) {
          let horariosData = []
          
          // Intentar extraer datos de diferentes estructuras
          if (response.data.success) {
            if (Array.isArray(response.data.data)) {
              horariosData = response.data.data
            } else if (Array.isArray(response.data.horarios)) {
              horariosData = response.data.horarios
            }
          } else if (Array.isArray(response.data)) {
            horariosData = response.data
          }
          
          console.log(`📊 ${horariosData.length} horarios crudos recibidos`)
          
          if (horariosData.length > 0) {
            horariosDisponibles.value = horariosData.map(horario => {
              // Extraer información del horario
              return {
                id: horario.id || horario.horario_id,
                hora_inicio: formatHora(horario.hora_inicio || horario.start_time),
                hora_fin: formatHora(horario.hora_fin || horario.end_time),
                dia_semana: obtenerNombreDia(horario.dia_semana || horario.dia),
                entrenador_nombre: horario.entrenador?.nombres || 
                                  horario.entrenador_nombre || 
                                  'Sin entrenador',
                sucursal_nombre: horario.sucursal?.nombre || 
                                horario.sucursal_nombre || 
                                'Sin sucursal',
                modalidad_nombre: horario.modalidad?.nombre || 
                                 horario.modalidad_nombre || 
                                 'Sin modalidad',
                cupos_disponibles: horario.cupo_disponible || 
                                 (horario.cupo_maximo - horario.cupo_actual) || 
                                 5,
                capacidad_maxima: horario.cupo_maxima || horario.cupo_maximo || 20
              }
            })
            
            console.log(`✅ ${horariosDisponibles.value.length} horarios formateados`)
          }
        }
        
      } catch (error2) {
        console.log('⚠️ Error con recuperaciones/horarios/disponibles:', error2.message)
        
        // Opción 3: Intentar con endpoint específico de modalidad
        try {
          console.log('📤 Intentando con /horarios/modalidad/{id}...')
          
          const modalidadId = inscripcion.modalidad?.id
          
          // Usar Axios directamente para probar
          const axios = require('axios')
          const baseURL = process.env.VUE_APP_API_URL || 'http://localhost:8000/api'
          
          const response = await axios.get(`${baseURL}/horarios/modalidad/${modalidadId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          
          console.log('✅ Respuesta de /horarios/modalidad/{id}:', response.data)
          
          if (response.data.success && Array.isArray(response.data.data)) {
            horariosDisponibles.value = response.data.data.map(horario => ({
              id: horario.id,
              hora_inicio: formatHora(horario.hora_inicio),
              hora_fin: formatHora(horario.hora_fin),
              dia_semana: obtenerNombreDia(horario.dia_semana),
              entrenador_nombre: horario.entrenador?.nombres || 'Sin entrenador',
              sucursal_nombre: horario.sucursal?.nombre || 'Sin sucursal',
              modalidad_nombre: horario.modalidad?.nombre || 'Sin modalidad',
              cupos_disponibles: horario.cupo_maximo - (horario.cupo_actual || 0),
              capacidad_maxima: horario.cupo_maximo || 20
            }))
          }
          
        } catch (error3) {
          console.log('⚠️ Error con /horarios/modalidad/{id}:', error3.message)
          
          // Si todo falla, usar datos de ejemplo
          console.log('🔧 Todos los endpoints fallaron, usando datos de ejemplo')
          usarDatosDeEjemplo(inscripcion)
        }
      }
    }

    // Ordenar y seleccionar horarios
    if (horariosDisponibles.value.length > 0) {
      // Ordenar por día y hora
      const ordenDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
      horariosDisponibles.value.sort((a, b) => {
        const indexA = ordenDias.indexOf(a.dia_semana)
        const indexB = ordenDias.indexOf(b.dia_semana)
        
        if (indexA !== -1 && indexB !== -1 && indexA !== indexB) {
          return indexA - indexB
        }
        
        const horaA = a.hora_inicio.replace(':', '')
        const horaB = b.hora_inicio.replace(':', '')
        return horaA - horaB
      })

      // Seleccionar automáticamente
      if (fechaRecuperacion.value) {
        const diaSeleccionado = obtenerDiaSemana(fechaRecuperacion.value)
        const horarioCompatible = horariosDisponibles.value.find(h => 
          h.dia_semana.toLowerCase() === diaSeleccionado.toLowerCase()
        )
        horarioRecuperacionSeleccionado.value = horarioCompatible || horariosDisponibles.value[0]
      } else {
        horarioRecuperacionSeleccionado.value = horariosDisponibles.value[0]
      }

      console.log('✅ Horarios cargados exitosamente:', horariosDisponibles.value.length)
      toast.add({
        severity: 'success',
        summary: 'Horarios cargados',
        detail: `${horariosDisponibles.value.length} horarios disponibles`,
        life: 3000
      })
      
    } else {
      console.warn('⚠️ No se recibieron horarios')
      usarDatosDeEjemplo(inscripcion)
    }

  } catch (error) {
    console.error('❌ Error crítico cargando horarios:', error)
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los horarios. Usando datos de ejemplo.',
      life: 4000
    })
    
    const inscripcion = inscripcionesConPermisos.value.find(
      i => i.id === inscripcionSeleccionada.value
    )
    usarDatosDeEjemplo(inscripcion)
    
  } finally {
    cargandoHorarios.value = false
  }
}

// También necesitas agregar estas funciones de utilidad:

function obtenerNombreDia(dia) {
  if (!dia) return 'Sin día'
  
  if (typeof dia === 'number') {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    return dias[dia] || `Día ${dia}`
  }
  
  // Convertir a formato estándar
  const diaLower = String(dia).toLowerCase()
  
  if (dialower.includes('lun')) return 'Lunes'
  if (dialower.includes('mar')) return 'Martes'
  if (dialower.includes('mié') || dialower.includes('mier')) return 'Miércoles'
  if (dialower.includes('jue')) return 'Jueves'
  if (dialower.includes('vie')) return 'Viernes'
  if (dialower.includes('sáb') || dialower.includes('sab')) return 'Sábado'
  if (dialower.includes('dom')) return 'Domingo'
  
  return String(dia)
}

function formatHora(horaString) {
  if (!horaString) return '--:--'
  
  // Si es timestamp ISO
  if (horaString.includes && horaString.includes('T')) {
    try {
      const date = new Date(horaString)
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      }
    } catch (e) {
      // Continuar con otros formatos
    }
  }
  
  // Si es string con hora
  if (typeof horaString === 'string') {
    // Extraer números
    const numeros = horaString.match(/\d+/g)
    if (numeros && numeros.length >= 2) {
      const hora = numeros[0].padStart(2, '0')
      const minutos = numeros[1].padStart(2, '0')
      return `${hora}:${minutos}`
    }
    
    // Si ya está en formato HH:MM
    if (horaString.includes(':')) {
      const [hora, minutos] = horaString.split(':')
      return `${hora.padStart(2, '0')}:${minutos.padStart(2, '0')}`
    }
  }
  
  return horaString
}

// Función mejorada de datos de ejemplo
function usarDatosDeEjemplo(inscripcion) {
  console.log('🔧 Usando datos de ejemplo...')
  
  const modalidadNombre = inscripcion?.modalidad?.nombre || 'CrossFit'
  
  const datosEjemplo = [
    {
      id: 118,
      hora_inicio: '08:00',
      hora_fin: '09:00',
      dia_semana: 'Lunes',
      entrenador_nombre: 'Juan Pérez',
      sucursal_nombre: 'Sucursal Centro',
      modalidad_nombre: modalidadNombre,
      cupos_disponibles: 3,
      capacidad_maxima: 15
    },
    {
      id: 119,
      hora_inicio: '10:00',
      hora_fin: '11:00',
      dia_semana: 'Lunes',
      entrenador_nombre: 'María García',
      sucursal_nombre: 'Sucursal Norte',
      modalidad_nombre: modalidadNombre,
      cupos_disponibles: 5,
      capacidad_maxima: 20
    },
    {
      id: 120,
      hora_inicio: '19:00',
      hora_fin: '20:00',
      dia_semana: 'Martes',
      entrenador_nombre: 'Carlos López',
      sucursal_nombre: 'Sucursal Centro',
      modalidad_nombre: modalidadNombre,
      cupos_disponibles: 2,
      capacidad_maxima: 12
    },
    {
      id: 121,
      hora_inicio: '20:00',
      hora_fin: '21:00',
      dia_semana: 'Miércoles',
      entrenador_nombre: 'Ana Martínez',
      sucursal_nombre: 'Sucursal Sur',
      modalidad_nombre: modalidadNombre,
      cupos_disponibles: 4,
      capacidad_maxima: 15
    },
    {
      id: 122,
      hora_inicio: '18:00',
      hora_fin: '19:00',
      dia_semana: 'Jueves',
      entrenador_nombre: 'Pedro Sánchez',
      sucursal_nombre: 'Sucursal Centro',
      modalidad_nombre: modalidadNombre,
      cupos_disponibles: 6,
      capacidad_maxima: 20
    },
    {
      id: 123,
      hora_inicio: '17:00',
      hora_fin: '18:00',
      dia_semana: 'Viernes',
      entrenador_nombre: 'Laura Rodríguez',
      sucursal_nombre: 'Sucursal Norte',
      modalidad_nombre: modalidadNombre,
      cupos_disponibles: 3,
      capacidad_maxima: 15
    },
    {
      id: 124,
      hora_inicio: '09:00',
      hora_fin: '10:00',
      dia_semana: 'Sábado',
      entrenador_nombre: 'Diego Fernández',
      sucursal_nombre: 'Sucursal Sur',
      modalidad_nombre: modalidadNombre,
      cupos_disponibles: 8,
      capacidad_maxima: 25
    }
  ]

  horariosDisponibles.value = datosEjemplo
  
  // Ordenar
  const ordenDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  horariosDisponibles.value.sort((a, b) => {
    const indexA = ordenDias.indexOf(a.dia_semana)
    const indexB = ordenDias.indexOf(b.dia_semana)
    
    if (indexA !== -1 && indexB !== -1 && indexA !== indexB) {
      return indexA - indexB
    }
    
    const horaA = a.hora_inicio.replace(':', '')
    const horaB = b.hora_inicio.replace(':', '')
    return horaA - horaB
  })
  
  if (horariosDisponibles.value.length > 0) {
    horarioRecuperacionSeleccionado.value = horariosDisponibles.value[0]
  }
  
  console.log(`✅ ${horariosDisponibles.value.length} datos de ejemplo cargados`)
  toast.add({
    severity: 'info',
    summary: 'Datos de ejemplo',
    detail: 'Se cargaron horarios de ejemplo para demostración',
    life: 3000
  })
}



function onFechaChange(event) {
  console.log('📅 Fecha cambiada:', event)
  // No necesitas hacer nada aquí porque v-model ya actualiza fechaRecuperacion
}

async function confirmarProgramacionRecuperacion() {
  if (!permisoSeleccionado.value || !horarioRecuperacionSeleccionado.value || !fechaRecuperacion.value) {
    toast.add({
      severity: 'warn',
      summary: 'Datos incompletos',
      detail: 'Selecciona un horario y fecha para la recuperación',
      life: 3000
    })
    return
  }

  // Validar compatibilidad del horario con la fecha
  if (!esHorarioCompatible(horarioRecuperacionSeleccionado.value, fechaRecuperacion.value)) {
    toast.add({
      severity: 'error',
      summary: 'Incompatible',
      detail: 'El horario seleccionado no coincide con el día de la fecha',
      life: 4000
    })
    return
  }

  guardandoRecuperacion.value = true

  try {
    const datosRecuperacion = {
      inscripcion_id: permisoSeleccionado.value.inscripcion_id,
      estudiante_id: permisoSeleccionado.value.estudiante_id,
      permiso_justificado_id: permisoSeleccionado.value.id,
      horario_recuperacion_id: horarioRecuperacionSeleccionado.value.id,
      fecha_recuperacion: fechaRecuperacion.value,
      motivo: observacionRecuperacion.value || 'Recuperación de clase justificada',
      administrador_id: 1
    }

    console.log('📤 Programando recuperación:', datosRecuperacion)

    const response = await recuperacionService.store(datosRecuperacion)

    if (response.data?.success) {
      toast.add({
        severity: 'success',
        summary: '✅ Programación Exitosa',
        detail: 'La recuperación ha sido programada correctamente',
        life: 3000
      })

      resetearModalProgramacion()
      mostrarModalProgramacion.value = false

      await cargarPermisosYRecuperaciones()

    } else {
      throw new Error(response.data?.message || 'Error en el servidor')
    }

  } catch (error) {
    console.error('❌ Error programando recuperación:', error)

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo programar la recuperación',
      life: 3000
    })
  } finally {
    guardandoRecuperacion.value = false
  }
}

async function guardarRecuperacion() {
  if (!permisoSeleccionado.value || !horarioRecuperacionSeleccionado.value || !fechaRecuperacion.value) {
    toast.add({
      severity: 'warn',
      summary: 'Datos incompletos',
      detail: 'Selecciona un horario y fecha para la recuperación',
      life: 3000
    })
    return
  }

  // VALIDACIONES IMPORTANTES (mantén estas):

  // 1. Validar que la fecha no esté en el pasado
  const fechaSeleccionada = new Date(fechaRecuperacion.value)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0) // Solo comparar fechas, no horas
  
  if (fechaSeleccionada < hoy) {
    toast.add({
      severity: 'error',
      summary: 'Fecha inválida',
      detail: 'No puedes seleccionar una fecha pasada',
      life: 4000
    })
    return
  }

  // 2. Validar que no exceda la fecha límite de recuperación
  if (permisoSeleccionado.value.fecha_limite_recuperacion) {
    const fechaLimite = new Date(permisoSeleccionado.value.fecha_limite_recuperacion)
    if (fechaSeleccionada > fechaLimite) {
      toast.add({
        severity: 'error',
        summary: 'Fecha límite excedida',
        detail: `La recuperación debe realizarse antes del ${formatFecha(fechaLimite)}`,
        life: 4000
      })
      return
    }
  }

  guardandoRecuperacion.value = true

  try {
    const datosRecuperacion = {
      inscripcion_id: inscripcionSeleccionada.value,
      estudiante_id: inscripcionSeleccionadaObj.value?.estudiante?.id,
      permiso_justificado_id: permisoSeleccionado.value.id,
      horario_recuperacion_id: horarioRecuperacionSeleccionado.value.id,
      fecha_recuperacion: fechaRecuperacion.value,
      motivo: observacionRecuperacion.value || `Recuperación de permiso del ${formatFecha(permisoSeleccionado.value.fecha_falta)}`,
      estado: 'programada',
      administrador_id: 1 // Cambia esto por el ID real del administrador
    }

    console.log('📤 Enviando datos de recuperación:', datosRecuperacion)

    const response = await recuperacionService.store(datosRecuperacion)

    if (response.data?.success) {
      toast.add({
        severity: 'success',
        summary: '✅ Programación Exitosa',
        detail: 'La recuperación ha sido programada correctamente',
        life: 3000
      })

      mostrarModalProgramacion.value = false
      resetearModalProgramacion()
      
      // Recargar datos
      await cargarPermisosYRecuperaciones()
      
    } else {
      throw new Error(response.data?.message || 'Error en el servidor')
    }
    
  } catch (error) {
    console.error('❌ Error guardando recuperación:', error)
    
    let mensajeError = 'No se pudo programar la recuperación'
    
    if (error.response?.status === 400) {
      mensajeError = error.response.data?.message || 'Datos inválidos'
    } else if (error.response?.status === 422) {
      const errores = error.response.data?.errors
      if (errores) {
        mensajeError = Object.values(errores).flat().join(', ')
      }
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensajeError,
      life: 4000
    })
  } finally {
    guardandoRecuperacion.value = false
  }
}

// También necesitas la función para cargar fechas no disponibles
async function cargarFechasNoDisponibles() {
  try {
    if (!inscripcionSeleccionada.value) return
    
    // Llamar a tu API para obtener fechas ocupadas
    const response = await recuperacionService.getFechasOcupadas(inscripcionSeleccionada.value)
    
    if (response.data?.success) {
      fechasNoDisponibles.value = response.data.data.map(fecha => new Date(fecha))
    }
  } catch (error) {
    console.warn('No se pudieron cargar fechas no disponibles:', error.message)
    // Usar fechas de ejemplo si la API falla
    const hoy = new Date()
    const manana = new Date(hoy)
    manana.setDate(hoy.getDate() + 1)
    const pasadoManana = new Date(hoy)
    pasadoManana.setDate(hoy.getDate() + 2)
    
    fechasNoDisponibles.value = [manana, pasadoManana]
  }
}

// Modifica la función programarRecuperacion para cargar las fechas no disponibles
async function programarRecuperacion(permiso) {
  try {
    console.log('📋 Programando recuperación para permiso:', permiso.id)

    if (!puedeRecuperar(permiso)) {
      toast.add({
        severity: 'warn',
        summary: 'No disponible',
        detail: 'Este permiso ya no está disponible para recuperar',
        life: 3000
      })
      return
    }

    permisoSeleccionado.value = permiso

    // Configurar fecha por defecto (mañana)
    const manana = new Date()
    manana.setDate(manana.getDate() + 1)
    fechaRecuperacion.value = manana

    // Cargar fechas no disponibles
    await cargarFechasNoDisponibles()
    
    // Cargar horarios disponibles
    await cargarTodosHorariosModalidad()

    mostrarModalProgramacion.value = true

  } catch (error) {
    console.error('❌ Error en programarRecuperacion:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo abrir el formulario de programación',
      life: 3000
    })
  }
}


function resetearModalProgramacion() {
  permisoSeleccionado.value = null
  horariosDisponibles.value = []
  horarioRecuperacionSeleccionado.value = null
  fechaRecuperacion.value = null
  observacionRecuperacion.value = ''
  filtroDia.value = 'Todos'
  fechasNoDisponibles.value = [] // Limpiar las fechas no disponibles
}


async function cancelarRecuperacion(recuperacion) {
  try {
    const motivo = prompt('Ingrese el motivo de la cancelación:',
      'Cancelación solicitada por el estudiante')

    if (!motivo || motivo.trim() === '') {
      toast.add({
        severity: 'warn',
        summary: 'Motivo requerido',
        detail: 'Debe ingresar un motivo para cancelar',
        life: 3000
      })
      return
    }

    console.log(`❌ Cancelando recuperación ID: ${recuperacion.id}`)

    const response = await recuperacionService.cancelar(recuperacion.id, {
      motivo: motivo.trim()
    })

    if (response.data?.success) {
      const index = recuperacionesProgramadas.value.findIndex(r => r.id === recuperacion.id)
      if (index !== -1) {
        recuperacionesProgramadas.value[index] = {
          ...recuperacionesProgramadas.value[index],
          estado: 'cancelada',
          motivo_cancelacion: motivo.trim()
        }

        recuperacionesProgramadas.value = [...recuperacionesProgramadas.value]
      }

      calcularEstadisticas()

      toast.add({
        severity: 'info',
        summary: 'Recuperación Cancelada',
        detail: `La recuperación ha sido cancelada`,
        life: 3000
      })

      setTimeout(() => {
        cargarRecuperacionesProgramadas()
      }, 1000)

    } else {
      throw new Error(response.data?.message || 'Error en el servidor')
    }

  } catch (error) {
    console.error('❌ Error al cancelar recuperación:', error)

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cancelar la recuperación',
      life: 4000
    })
  }
}

function verDetallesRecuperacion(recuperacion) {
  recuperacionSeleccionada.value = recuperacion
  tituloModalDetalles.value = `Detalles de Recuperación - ${formatFecha(recuperacion.fecha_recuperacion)}`
  mostrarModalDetalles.value = true
}

async function cargarRecuperacionesProgramadas() {
  if (!inscripcionSeleccionada.value) return

  cargandoRecuperaciones.value = true
  recuperacionesProgramadas.value = []

  try {
    console.log(`🎯 Cargando recuperaciones para inscripción ${inscripcionSeleccionada.value}...`)

    const response = await recuperacionService.getPorInscripcionEspecifico(inscripcionSeleccionada.value)

    console.log('📥 Respuesta API:', {
      status: response.status,
      success: response.data?.success,
      dataLength: response.data?.data?.length || 0
    })

    if (response.data?.success) {
      const recuperacionesData = response.data.data || []
      console.log(`✅ ${recuperacionesData.length} recuperaciones encontradas`)

      recuperacionesProgramadas.value = recuperacionesData.map(rec => ({
        id: rec.id,
        estado: rec.estado || 'programada',
        fecha_recuperacion: rec.fecha_recuperacion,
        fecha_limite: rec.fecha_limite,
        motivo: rec.motivo || 'Recuperación de clase',
        comentarios: rec.comentarios || '',

        horario: rec.horario || {
          id: rec.horario_recuperacion_id,
          hora_inicio: rec.hora_inicio || '--:--',
          hora_fin: rec.hora_fin || '--:--',
          dia_semana: rec.dia_semana || obtenerDiaSemana(rec.fecha_recuperacion),
          entrenador_nombre: rec.entrenador_nombre || 'Sin entrenador',
          sucursal_nombre: rec.sucursal_nombre || 'Sin sucursal',
          modalidad_nombre: rec.modalidad_nombre || 'Sin modalidad'
        },

        permiso_asociado: rec.permiso_justificado || (rec.permiso_justificado_id ? {
          id: rec.permiso_justificado_id,
          motivo: 'Permiso justificado',
          fecha_falta: rec.fecha_falta
        } : null),

        estudiante_id: rec.estudiante_id,
        inscripcion_id: rec.inscripcion_id,
        created_at: rec.created_at
      })).filter(r => r.estado === 'programada' || r.estado === 'pendiente')

    } else {
      console.log('📭 No hay recuperaciones programadas o respuesta sin éxito')
    }

  } catch (error) {
    console.error('❌ Error cargando recuperaciones:', error.message)

    if (error.response?.status === 500) {
      console.error('💥 Error 500 del servidor.')
    }

    usarDatosDePrueba()

  } finally {
    cargandoRecuperaciones.value = false
  }
}

// FUNCIONES DE UTILIDAD

function esHorarioCompatible(horario, fecha) {
  if (!fecha || !horario.dia_semana) return true
  
  const diaFecha = obtenerDiaSemana(fecha).toLowerCase()
  const diaHorario = horario.dia_semana.toLowerCase()
  
  return diaFecha === diaHorario
}



function getSeverityDia(diaSemana) {
  const diasColores = {
    'Lunes': 'primary',
    'Martes': 'success', 
    'Miércoles': 'warning',
    'Jueves': 'help',
    'Viernes': 'danger',
    'Sábado': 'info',
    'Domingo': 'contrast'
  }
  return diasColores[diaSemana] || 'secondary'
}



function getEstadoPermisoLabel(estado) {
  const map = {
    'aprobado': 'Aprobado',
    'pendiente': 'Pendiente',
    'rechazado': 'Rechazado',
    'en_revision': 'En Revisión'
  }
  return map[estado] || estado
}

function getEstadoPermisoSeverity(estado) {
  const map = {
    'aprobado': 'success',
    'pendiente': 'warning',
    'rechazado': 'danger',
    'en_revision': 'info'
  }
  return map[estado] || 'info'
}

function getEstadoRecuperacionLabel(estado) {
  const map = {
    'programada': 'Programada',
    'completada': 'Completada',
    'cancelada': 'Cancelada',
    'pendiente': 'Pendiente'
  }
  return map[estado] || estado
}

function getEstadoRecuperacionSeverity(estado) {
  const map = {
    'programada': 'info',
    'completada': 'success',
    'cancelada': 'danger',
    'pendiente': 'warning'
  }
  return map[estado] || 'info'
}

function getIconoEstadoRecuperacion(estado) {
  const map = {
    'programada': 'text-blue-500',
    'completada': 'text-green-500',
    'cancelada': 'text-red-500',
    'pendiente': 'text-yellow-500'
  }
  return map[estado] || 'text-gray-500'
}

function getClaseVencimiento(fechaLimite) {
  if (!fechaLimite) return ''

  const hoy = new Date()
  const limite = new Date(fechaLimite)
  const diasRestantes = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24))

  if (diasRestantes <= 0) return 'text-red-500 font-bold'
  if (diasRestantes <= 3) return 'text-orange-500 font-bold'
  if (diasRestantes <= 7) return 'text-yellow-500'
  return ''
}

function formatFecha(fecha) {
  if (!fecha) return '--'

  const date = new Date(fecha)
  if (isNaN(date.getTime())) return '--'

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatFechaHora(fecha) {
  if (!fecha) return '--'

  const date = new Date(fecha)
  if (isNaN(date.getTime())) return '--'

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function obtenerDiaSemana(fecha) {
  if (!fecha) return 'Sin fecha'
  try {
    const date = new Date(fecha)
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    return dias[date.getDay()]
  } catch (e) {
    return 'Sin fecha'
  }
}

function calcularFechaLimite(fechaFalta) {
  if (!fechaFalta) return null

  const fecha = new Date(fechaFalta)
  fecha.setDate(fecha.getDate() + 15)

  return fecha.toISOString().split('T')[0]
}

function calcularDiasRestantes(fechaLimite) {
  if (!fechaLimite) return null

  const hoy = new Date()
  const limite = new Date(fechaLimite)
  const diffMs = limite - hoy
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function getColorEstudiante(id) {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
    '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#ec4899'
  ]
  return colors[id % colors.length]
}

function getInicialesEstudiante(estudiante) {
  if (!estudiante || !estudiante.nombres) return '?'
  const nombres = estudiante.nombres.split(' ')
  if (nombres.length >= 2) {
    return (nombres[0][0] + nombres[1][0]).toUpperCase()
  }
  return nombres[0][0].toUpperCase()
}

function calcularEstadisticas() {
  const totalRecuperaciones = recuperacionesProgramadas.value.length

  const completadas = recuperacionesProgramadas.value.filter(
    r => r.estado === 'completada'
  ).length

  const estaSemana = recuperacionesProgramadas.value.filter(recuperacion => {
    if (!recuperacion.fecha_recuperacion) return false
    const fechaRecup = new Date(recuperacion.fecha_recuperacion)
    const hoy = new Date()
    const inicioSemana = new Date(hoy)
    inicioSemana.setDate(hoy.getDate() - hoy.getDay())
    const finSemana = new Date(inicioSemana)
    finSemana.setDate(inicioSemana.getDate() + 6)
    return fechaRecup >= inicioSemana && fechaRecup <= finSemana
  }).length

  estadisticas.value = {
    permisosJustificados: permisosDisponibles.value.length,
    permisosRecuperables: permisosDisponibles.value.length,
    recuperacionesProgramadas: totalRecuperaciones,
    recuperacionesCompletadas: completadas,
    recuperacionesEstaSemana: estaSemana
  }
}

function usarDatosDePrueba() {
  console.log('🎭 Usando datos de prueba...')

  const datosEjemplo = [
    {
      id: 1,
      inscripcion_id: 252,
      estado: 'programada',
      fecha_recuperacion: '2026-03-06',
      motivo: 'Recuperación de permiso del 31/01/2026',
      horario_recuperacion_id: 116,
      permiso_justificado_id: 23
    },
    {
      id: 2,
      inscripcion_id: 253,
      estado: 'programada',
      fecha_recuperacion: '2026-02-10',
      motivo: 'Recuperación por enfermedad',
      horario_recuperacion_id: 120,
      permiso_justificado_id: 25
    }
  ]

  const filtrados = datosEjemplo.filter(r => r.inscripcion_id == inscripcionSeleccionada.value)

  if (filtrados.length > 0) {
    recuperacionesProgramadas.value = filtrados.map(rec => ({
      id: rec.id,
      estado: rec.estado,
      fecha_recuperacion: rec.fecha_recuperacion,
      motivo: rec.motivo,
      horario: {
        id: rec.horario_recuperacion_id,
        hora_inicio: '19:00',
        hora_fin: '20:00',
        dia_semana: 'Viernes',
        entrenador_nombre: 'Entrenador Principal',
        sucursal_nombre: 'Sucursal Centro',
        modalidad_nombre: 'CrossFit'
      },
      permiso_asociado: {
        id: rec.permiso_justificado_id,
        motivo: 'Permiso justificado',
        fecha_falta: '2026-01-30'
      },
      inscripcion_id: rec.inscripcion_id
    }))

    console.log(`✅ ${recuperacionesProgramadas.value.length} recuperaciones de prueba cargadas`)
  }
}

function abrirModalNuevaRecuperacion() {
  if (permisosDisponibles.value.length === 0) {
    toast.add({
      severity: 'info',
      summary: 'Sin permisos disponibles',
      detail: 'No hay permisos pendientes para recuperar',
      life: 3000
    })
    return
  }

  programarRecuperacion(permisosDisponibles.value[0])
}

async function cargarDatos() {
  if (!inscripcionSeleccionada.value) {
    toast.add({
      severity: 'warn',
      summary: 'Seleccionar estudiante',
      detail: 'Seleccione un estudiante primero',
      life: 3000
    })
    return
  }

  await cargarPermisosYRecuperaciones()
  toast.add({
    severity: 'success',
    summary: 'Datos actualizados',
    detail: 'La información ha sido refrescada',
    life: 2000
  })
}
</script>

<style scoped>
.recuperaciones-container {
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
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
}

.estudiantes-lista {
  width: 100%;
}

.no-estudiantes {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px dashed #e5e7eb;
}

.estudiantes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.estudiante-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.estudiante-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.estudiante-card.selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.estudiante-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.estudiante-nombre {
  font-size: 0.9rem;
  line-height: 1.2;
}

.estudiante-detalles {
  font-size: 0.75rem;
}

.action-buttons-header {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* SUMMARY CARDS */
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

.summary-card.permisos {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-left: 4px solid #f59e0b;
}

.summary-card.recuperables {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-left: 4px solid #3b82f6;
}

.summary-card.programadas {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border-left: 4px solid #8b5cf6;
}

.summary-card.completadas {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-left: 4px solid #10b981;
}

.summary-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
  color: #1f2937;
}

/* CARDS PRINCIPALES */
.permisos-card,
.recuperaciones-card {
  height: 600px;
  display: flex;
  flex-direction: column;
}

:deep(.p-card-content) {
  flex: 1;
  overflow-y: auto;
}

.loading-mini {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

/* LISTAS */
.permisos-list,
.recuperaciones-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.permiso-item,
.recuperacion-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.permiso-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #f59e0b;
}

.recuperacion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.permiso-header,
.recuperacion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.permiso-fecha {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.permiso-body h5 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.permiso-info,
.recuperacion-body .info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.permiso-footer,
.recuperacion-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

/* ESTILOS PARA EL MODAL */
.horario-item {
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.horario-item:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.horario-selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.horario-compatible {
  border-left: 4px solid #10b981;
}

.dia-indicator {
  min-width: 70px;
}

.horario-horas {
  font-size: 1.1rem;
}

.cupos-info {
  font-size: 0.9rem;
}

.resumen-seleccion {
  border-left: 4px solid #10b981;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .recuperaciones-container {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-right {
    flex-direction: column;
    width: 100%;
  }

  .estudiantes-grid {
    grid-template-columns: 1fr;
  }

  .permisos-card,
  .recuperaciones-card {
    height: auto;
    max-height: 500px;
  }
  
  .dia-indicator {
    min-width: 60px;
  }
}

@media (max-width: 576px) {
  .summary-section .col-12 {
    margin-bottom: 1rem;
  }

  .permiso-header,
  .recuperacion-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .estudiante-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .action-buttons-header {
    flex-direction: column;
  }
}
</style>