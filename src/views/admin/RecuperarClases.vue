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
          <!-- Selector de inscripción -->
          <div class="inscripcion-selector">
            <Dropdown v-model="inscripcionSeleccionada" :options="inscripcionesConPermisos" 
                      optionLabel="codigo_display" optionValue="id" placeholder="Seleccionar inscripción"
                      :filter="true" filterPlaceholder="Buscar inscripción..."
                      @change="cargarPermisosYRecuperaciones" />
          </div>

          <div class="action-buttons-header">
            <Button icon="pi pi-plus" label="Nueva Recuperación" severity="success" 
                    @click="abrirModalNuevaRecuperacion" :disabled="!inscripcionSeleccionada" />
            <Button icon="pi pi-sync" @click="cargarDatos" :loading="cargando" rounded 
                    tooltip="Refrescar datos" />
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
                <div v-for="permiso in permisosDisponibles" :key="permiso.id" 
                     class="permiso-item" @click="seleccionarPermiso(permiso)">
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
                    <Button icon="pi pi-history" label="Programar Recuperación" 
                            size="small" outlined @click.stop="programarRecuperacion(permiso)"
                            :disabled="!puedeRecuperar(permiso)" />
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
                <div v-for="recuperacion in recuperacionesProgramadas" :key="recuperacion.id" 
                     class="recuperacion-item">
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
                      <Button icon="pi pi-check" label="Marcar Completada" size="small" 
                              severity="success" outlined @click="completarRecuperacion(recuperacion)"
                              v-if="recuperacion.estado === 'programada'" />
                      <Button icon="pi pi-times" label="Cancelar" size="small" 
                              severity="danger" outlined @click="cancelarRecuperacion(recuperacion)"
                              v-if="recuperacion.estado === 'programada'" />
                      <Button icon="pi pi-eye" label="Detalles" size="small" 
                              severity="info" outlined @click="verDetallesRecuperacion(recuperacion)" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

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
                          :class="{ 'p-invalid': !fechaRecuperacion }" />
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

    <!-- MODAL DE DETALLES DE RECUPERACIÓN -->
    <Dialog v-model:visible="mostrarModalDetalles" modal :header="tituloModalDetalles" 
            :style="{ width: '500px' }">
      <div v-if="recuperacionSeleccionada">
        <div class="space-y-4">
          <div class="flex align-items-center gap-3">
            <Avatar :label="getInicialesEstudiante(recuperacionSeleccionada.estudiante)" 
                    :class="getClaseAvatarRecuperacion(recuperacionSeleccionada.estado)" />
            <div>
              <h4 class="mt-0 mb-1">Recuperación #{{ recuperacionSeleccionada.id }}</h4>
              <Tag :value="getEstadoRecuperacionLabel(recuperacionSeleccionada.estado)" 
                   :severity="getEstadoRecuperacionSeverity(recuperacionSeleccionada.estado)" />
            </div>
          </div>

          <Divider />

          <div class="grid">
            <div class="col-6">
              <div class="text-500 text-sm mb-1">Fecha programada</div>
              <div class="font-bold">{{ formatFecha(recuperacionSeleccionada.fecha_recuperacion) }}</div>
            </div>
            <div class="col-6">
              <div class="text-500 text-sm mb-1">Horario</div>
              <div class="font-bold">
                {{ recuperacionSeleccionada.horario?.hora_inicio }} - 
                {{ recuperacionSeleccionada.horario?.hora_fin }}
              </div>
            </div>
            <div class="col-6">
              <div class="text-500 text-sm mb-1">Entrenador</div>
              <div>{{ recuperacionSeleccionada.horario?.entrenador_nombre || 'No asignado' }}</div>
            </div>
            <div class="col-6">
              <div class="text-500 text-sm mb-1">Sucursal</div>
              <div>{{ recuperacionSeleccionada.horario?.sucursal_nombre || 'No asignada' }}</div>
            </div>
          </div>

          <div v-if="recuperacionSeleccionada.motivo">
            <div class="text-500 text-sm mb-1">Motivo de recuperación</div>
            <div class="p-2 border-round bg-blue-50">{{ recuperacionSeleccionada.motivo }}</div>
          </div>

          <div v-if="recuperacionSeleccionada.permiso_asociado">
            <Divider />
            <h5 class="mt-0 mb-2">Permiso asociado</h5>
            <div class="p-2 border-round bg-yellow-50">
              <div class="font-bold mb-1">{{ recuperacionSeleccionada.permiso_asociado.motivo }}</div>
              <div class="text-sm text-500">
                Fecha de falta: {{ formatFecha(recuperacionSeleccionada.permiso_asociado.fecha_falta) }}
              </div>
              <div class="text-sm">
                {{ recuperacionSeleccionada.permiso_asociado.evidencia }}
              </div>
            </div>
          </div>

          <div v-if="recuperacionSeleccionada.administrador">
            <Divider />
            <div class="text-500 text-sm mb-1">Autorizado por</div>
            <div class="flex align-items-center gap-2">
              <Avatar :label="getInicialesPersona(recuperacionSeleccionada.administrador)" size="small" />
              <div>
                <div>{{ recuperacionSeleccionada.administrador.nombres }}</div>
                <small class="text-500">{{ formatFechaHora(recuperacionSeleccionada.created_at) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- TOAST PARA NOTIFICACIONES -->
    <Toast position="bottom-right" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'

// Componentes PrimeVue
import Button from 'primevue/button'
import Card from 'primevue/card'
import Badge from 'primevue/badge'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import Calendar from 'primevue/calendar'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import Avatar from 'primevue/avatar'
import Divider from 'primevue/divider'
import Toast from 'primevue/toast'

// Servicios
import recuperacionService from '@/services/recuperacion.service'
import inscripcionService from '@/services/inscripcion.service'
import horarioService from '@/services/horario.service'
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
  
  if (fechasLimite.length === 0) return 30 // Valor por defecto
  
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
    // Por defecto, 30 días desde hoy
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

const fechasNoDisponibles = computed(() => {
  // Excluir fines de semana por defecto
  const fechas = []
  const fechaActual = new Date(hoy.value)
  const fechaFin = new Date(fechaLimiteRecuperacion.value)
  
  while (fechaActual <= fechaFin) {
    const diaSemana = fechaActual.getDay()
    if (diaSemana === 0 || diaSemana === 6) { // Domingo = 0, Sábado = 6
      fechas.push(new Date(fechaActual))
    }
    fechaActual.setDate(fechaActual.getDate() + 1)
  }
  
  return fechas
})

// Funciones principales
onMounted(async () => {
  await cargarInscripcionesConPermisos()
})

async function cargarInscripcionesConPermisos() {
  cargando.value = true
  try {
    console.log('📋 Cargando inscripciones con permisos...')
    
    // 1. Cargar TODAS las inscripciones activas
    const response = await inscripcionService.index(1, 100, '', {
      estado: 'activo',
      with_estudiante: true,
      with_modalidad: true
      // NOTA: with_permisos_justificados puede no estar funcionando
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
    
    // 2. Para cada inscripción, verificar si tiene permisos USADOS
    const inscripcionesConInfo = []
    
    for (const insc of inscripcionesData) {
      // Verificar si tiene permisos usados (columna en la tabla inscripciones)
      if (insc.permisos_usados && insc.permisos_usados > 0) {
        console.log(`🔍 Inscripción ${insc.id} tiene ${insc.permisos_usados} permisos usados`)
        
        try {
          // 3. Obtener los permisos justificados DETALLADOS usando el endpoint específico
          const permisosResponse = await permisoService.getJustificadosPorInscripcion(insc.id)
          
          let permisosDetallados = []
          let permisosRecuperables = 0
          
          if (permisosResponse.data && permisosResponse.data.success) {
            // Extraer los permisos aprobados
            if (Array.isArray(permisosResponse.data.data)) {
              permisosDetallados = permisosResponse.data.data
            } else if (Array.isArray(permisosResponse.data)) {
              permisosDetallados = permisosResponse.data
            }
            
            // Filtrar solo los aprobados y sin recuperación
            const permisosAprobados = permisosDetallados.filter(p => 
              p.estado === 'aprobado' && 
              (!p.tiene_recuperacion || p.tiene_recuperacion === false)
            )
            
            permisosRecuperables = permisosAprobados.length
            
            console.log(`   📊 Permisos detallados: ${permisosDetallados.length} total, ${permisosAprobados.length} aprobados sin recuperación`)
          }
          
          // 4. Si tiene permisos recuperables, agregar a la lista
          if (permisosRecuperables > 0) {
            inscripcionesConInfo.push({
              id: insc.id,
              codigo: `INS-${insc.id}`,
              codigo_display: `#${insc.id} - ${insc.estudiante?.nombres || 'Estudiante'} (${permisosRecuperables} recuperables)`,
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
          
        } catch (permisoError) {
          console.warn(`⚠️ Error cargando permisos para inscripción ${insc.id}:`, permisoError.message)
        }
      }
    }
    
    // 5. Si no encontramos con el método anterior, probar método alternativo
    if (inscripcionesConInfo.length === 0) {
      console.log('🔄 Intentando método alternativo...')
      
      // Usar el endpoint específico para permisos recuperables
      try {
        const recuperablesResponse = await permisoService.getRecuperables()
        
        if (recuperablesResponse.data && recuperablesResponse.data.success) {
          // Procesar la respuesta
          const permisosData = recuperablesResponse.data.data || 
                              recuperablesResponse.data.permisos_recuperables || []
          
          // Agrupar por inscripción
          const inscripcionesMap = new Map()
          
          permisosData.forEach(permiso => {
            const inscId = permiso.inscripcion_id
            
            if (!inscripcionesMap.has(inscId)) {
              // Buscar la inscripción en los datos ya cargados
              const inscOriginal = inscripcionesData.find(i => i.id === inscId)
              
              inscripcionesMap.set(inscId, {
                id: inscId,
                estudiante: inscOriginal?.estudiante || { nombres: 'Estudiante' },
                modalidad: inscOriginal?.modalidad,
                fecha_inicio: inscOriginal?.fecha_inicio,
                fecha_fin: inscOriginal?.fecha_fin,
                permisos_recuperables: []
              })
            }
            
            inscripcionesMap.get(inscId).permisos_recuperables.push(permiso)
          })
          
          // Convertir a array
          inscripcionesConInfo.push(...Array.from(inscripcionesMap.values()).map(insc => ({
            id: insc.id,
            codigo: `INS-${insc.id}`,
            codigo_display: `#${insc.id} - ${insc.estudiante?.nombres || 'Estudiante'} (${insc.permisos_recuperables.length} recuperables)`,
            estudiante: insc.estudiante,
            modalidad: insc.modalidad,
            fecha_inicio: insc.fecha_inicio,
            fecha_fin: insc.fin,
            permisos_recuperables: insc.permisos_recuperables.length,
            todos_permisos: insc.permisos_recuperables,
            tiene_permisos: true
          })))
        }
      } catch (altError) {
        console.error('❌ Error en método alternativo:', altError)
      }
    }
    
    // 6. Asignar el resultado
    inscripcionesConPermisos.value = inscripcionesConInfo
    
    console.log(`🎯 ${inscripcionesConPermisos.value.length} inscripciones con permisos recuperables`)
    
    // 7. Si aún no hay nada, mostrar un mensaje
    if (inscripcionesConPermisos.value.length === 0) {
      console.warn('⚠️ No se encontraron inscripciones con permisos recuperables')
      
      // DEPURACIÓN: Mostrar cuáles inscripciones tienen permisos_usados
      const inscripcionesConPermisosUsados = inscripcionesData.filter(i => 
        i.permisos_usados && i.permisos_usados > 0
      )
      
      console.log('📊 Inscripciones con permisos_usados > 0:', inscripcionesConPermisosUsados)
      
      toast.add({
        severity: 'info',
        summary: 'Sin recuperaciones disponibles',
        detail: `No se encontraron permisos pendientes de recuperación. ${inscripcionesConPermisosUsados.length} inscripciones tienen permisos usados pero pueden estar recuperados o no aprobados.`,
        life: 5000
      })
    }
    
  } catch (error) {
    console.error('❌ Error cargando inscripciones:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las inscripciones',
      life: 3000
    })
  } finally {
    cargando.value = false
  }
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


// En cargarPermisosDisponibles() - VERSIÓN CORREGIDA
async function cargarPermisosDisponibles() {
  if (!inscripcionSeleccionada.value) return
  
  cargandoPermisos.value = true
  try {
    console.log(`📋 Cargando permisos recuperables para inscripción ${inscripcionSeleccionada.value}...`)
    
    // USAR EL MÉTODO CORRECTO DE TU SERVICE
    const response = await permisoService.getRecuperables(inscripcionSeleccionada.value)
    
    let permisosData = []
    
    // Verificar estructura de respuesta según tu controlador
    if (response.data) {
      if (response.data.success) {
        // Formato 1: data.permisos_recuperables
        if (Array.isArray(response.data.permisos_recuperables)) {
          permisosData = response.data.permisos_recuperables
        }
        // Formato 2: data.data
        else if (Array.isArray(response.data.data)) {
          permisosData = response.data.data
        }
        // Formato 3: data directamente
        else if (Array.isArray(response.data)) {
          permisosData = response.data
        }
      }
    }
    
    console.log(`✅ ${permisosData.length} permisos recuperables cargados`)
    
    // Mapear datos correctamente
    permisosDisponibles.value = permisosData.map(permiso => {
      // Asegurar que tenga fecha límite de recuperación
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
        dias_restantes: permiso.dias_restantes || calcularDiasRestantes(fechaLimite),
        puede_recuperar: permiso.puede_recuperar !== false && 
                        (!permiso.tiene_recuperacion || permiso.tiene_recuperacion === false),
        horario_falta: permiso.horario_falta || permiso.horario || {}
      }
    }).filter(p => p.puede_recuperar)
    
  } catch (error) {
    console.error('❌ Error cargando permisos recuperables:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los permisos recuperables',
      life: 3000
    })
  } finally {
    cargandoPermisos.value = false
  }
}

// En cargarRecuperacionesProgramadas() - VERSIÓN CORREGIDA
async function cargarRecuperacionesProgramadas() {
  if (!inscripcionSeleccionada.value) return
  
  cargandoRecuperaciones.value = true
  try {
    console.log(`📅 Cargando recuperaciones para inscripción ${inscripcionSeleccionada.value}...`)
    
    // USAR TU MÉTODO getPorInscripcion del recuperacionService
    const response = await recuperacionService.getPorInscripcion(inscripcionSeleccionada.value)
    
    let recuperacionesData = []
    
    if (response.data) {
      if (response.data.success && Array.isArray(response.data.data)) {
        recuperacionesData = response.data.data
      } else if (response.data.success && Array.isArray(response.data)) {
        recuperacionesData = response.data
      } else if (Array.isArray(response.data)) {
        recuperacionesData = response.data
      }
    }
    
    console.log(`📊 ${recuperacionesData.length} recuperaciones obtenidas del servidor`)
    
    // Filtrar y formatear recuperaciones
    recuperacionesProgramadas.value = recuperacionesData
      .filter(r => r.estado === 'programada' || r.estado === 'pendiente')
      .map(recuperacion => ({
        ...recuperacion,
        // Asegurar que el horario tenga los campos necesarios
        horario: {
          id: recuperacion.horario_recuperacion_id,
          hora_inicio: recuperacion.horario?.hora_inicio || 
                      recuperacion.hora_inicio || '--:--',
          hora_fin: recuperacion.horario?.hora_fin || 
                   recuperacion.hora_fin || '--:--',
          entrenador_nombre: recuperacion.horario?.entrenador_nombre || 
                           recuperacion.horario?.entrenador?.nombres || 
                           recuperacion.entrenador_nombre || 'Sin entrenador',
          sucursal_nombre: recuperacion.horario?.sucursal_nombre || 
                         recuperacion.horario?.sucursal?.nombre || 
                         recuperacion.sucursal_nombre || 'Sin sucursal',
          modalidad_nombre: recuperacion.horario?.modalidad_nombre || 
                          recuperacion.horario?.modalidad?.nombre || 
                          recuperacion.modalidad_nombre || 'Sin modalidad'
        },
        // Asegurar el permiso asociado
        permiso_asociado: recuperacion.permisoJustificado || 
                         recuperacion.permiso_asociado || 
                         (recuperacion.permiso_justificado_id ? {
                           id: recuperacion.permiso_justificado_id,
                           motivo: recuperacion.motivo_permiso || 'Permiso justificado',
                           fecha_falta: recuperacion.fecha_falta_permiso
                         } : null)
      }))
    
    console.log(`✅ ${recuperacionesProgramadas.value.length} recuperaciones programadas`)
    
  } catch (error) {
    console.error('❌ Error cargando recuperaciones:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las recuperaciones programadas',
      life: 3000
    })
  } finally {
    cargandoRecuperaciones.value = false
  }
}

// En cargarHorariosDisponiblesParaRecuperacion() - VERSIÓN CORREGIDA
// Agrega esto temporalmente en tu función cargarHorariosDisponiblesParaRecuperacion()
async function cargarHorariosDisponiblesParaRecuperacion() {
  if (!inscripcionSeleccionada.value || !permisoSeleccionado.value) return
  
  cargandoHorarios.value = true
  
  // DEBUG: Ver qué datos tienes
  const inscripcion = inscripcionesConPermisos.value.find(
    i => i.id === inscripcionSeleccionada.value
  )
  
  console.log('🔍 DATOS DE DEPURACIÓN:', {
    inscripcion_id: inscripcionSeleccionada.value,
    estudiante_id: inscripcion?.estudiante?.id || 'NO ENCONTRADO',
    modalidad_id: inscripcion?.modalidad?.id || 'NO ENCONTRADO',
    permiso_seleccionado: permisoSeleccionado.value
  })
  
  try {
    // Envía SOLO los parámetros que tengas
    const params = {}
    
    // Solo agregar parámetros si existen
    if (inscripcion?.modalidad?.id) {
      params.modalidad_id = inscripcion.modalidad.id
    }
    
    if (inscripcion?.estudiante?.id) {
      params.estudiante_id = inscripcion.estudiante.id
    }
    
    // Este es opcional, pero lo incluimos
    params.excluir_horarios_estudiante = true
    
    console.log('📤 Parámetros a enviar:', params)
    
    const response = await recuperacionService.getHorariosDisponibles(params)
    // ... resto del código
  } catch (error) {
    console.error('❌ Error completo:', error)
    // Añadir para ver los detalles del error 422
    if (error.response) {
      console.log('📋 Detalles del error 422:', {
        status: error.response.status,
        data: error.response.data,
        errors: error.response.data?.errors || error.response.data
      })
    }
  }
}

// Funciones auxiliares para calcular fechas
function calcularFechaLimite(fechaFalta) {
  if (!fechaFalta) return null
  
  const fecha = new Date(fechaFalta)
  // 15 días después de la fecha de falta
  fecha.setDate(fecha.getDate() + 15)
  
  return fecha.toISOString().split('T')[0]
}

function calcularDiasRestantes(fechaLimite) {
  if (!fechaLimite) return null
  
  const hoy = new Date()
  const limite = new Date(fechaLimite)
  const diffMs = limite - hoy
  const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  return dias
}

// Función mejorada para validar si puede recuperar
function puedeRecuperar(permiso) {
  if (!permiso) return false
  
  // 1. Debe estar aprobado
  if (permiso.estado !== 'aprobado') return false
  
  // 2. No debe tener recuperación ya asignada
  if (permiso.tiene_recuperacion === true) return false
  
  // 3. Verificar fecha límite
  if (permiso.fecha_limite_recuperacion) {
    const hoy = new Date()
    const fechaLimite = new Date(permiso.fecha_limite_recuperacion)
    if (hoy > fechaLimite) return false
  }
  
  // 4. Verificar que no esté en una recuperación ya existente
  const tieneRecuperacionExistente = recuperacionesProgramadas.value.some(
    r => r.permiso_justificado_id === permiso.id
  )
  
  return !tieneRecuperacionExistente
}

function calcularEstadisticas() {
  estadisticas.value = {
    permisosJustificados: permisosDisponibles.value.length,
    permisosRecuperables: permisosDisponibles.value.length,
    recuperacionesProgramadas: recuperacionesProgramadas.value.length,
    recuperacionesCompletadas: 0, // Necesitarías cargar las completadas también
    recuperacionesEstaSemana: calcularRecuperacionesEstaSemana()
  }
}

function calcularRecuperacionesEstaSemana() {
  const hoy = new Date()
  const inicioSemana = new Date(hoy)
  inicioSemana.setDate(hoy.getDate() - hoy.getDay())
  const finSemana = new Date(inicioSemana)
  finSemana.setDate(inicioSemana.getDate() + 6)
  
  return recuperacionesProgramadas.value.filter(recuperacion => {
    const fechaRecup = new Date(recuperacion.fecha_recuperacion)
    return fechaRecup >= inicioSemana && fechaRecup <= finSemana
  }).length
}

// Funciones para el modal de programación
async function programarRecuperacion(permiso) {
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
  await cargarHorariosDisponiblesParaRecuperacion()
  mostrarModalProgramacion.value = true
}



function seleccionarHorarioRecuperacion(horario) {
  horarioRecuperacionSeleccionado.value = horario
}

async function guardarRecuperacion() {
  if (!permisoSeleccionado.value || !horarioRecuperacionSeleccionado.value || !fechaRecuperacion.value) {
    toast.add({
      severity: 'error',
      summary: 'Datos incompletos',
      detail: 'Complete todos los campos requeridos',
      life: 3000
    })
    return
  }
  
  guardandoRecuperacion.value = true
  try {
    // Obtener información de la inscripción
    const inscripcion = inscripcionesConPermisos.value.find(
      i => i.id === inscripcionSeleccionada.value
    )
    
    const datosRecuperacion = {
      inscripcion_id: inscripcionSeleccionada.value,
      estudiante_id: inscripcion?.estudiante?.id || permisoSeleccionado.value.estudiante_id,
      permiso_justificado_id: permisoSeleccionado.value.id,
      asistencia_id: permisoSeleccionado.value.asistencia_id,
      horario_recuperacion_id: horarioRecuperacionSeleccionado.value.id,
      fecha_recuperacion: formatDateToYMD(fechaRecuperacion.value),
      motivo: observacionRecuperacion.value || 
             `Recuperación de permiso del ${formatFecha(permisoSeleccionado.value.fecha_falta)}`,
      estado: 'programada',
      fecha_limite: formatDateToYMD(fechaLimiteRecuperacion.value),
      administrador_id: obtenerAdministradorId(),
      comentarios: observacionRecuperacion.value
    }
    
    console.log('📤 Guardando recuperación:', datosRecuperacion)
    
    // Usar tu servicio correctamente
    const response = await recuperacionService.store(datosRecuperacion)
    
    if (response.data?.success) {
      toast.add({
        severity: 'success',
        summary: '✅ Recuperación programada',
        detail: `Recuperación programada para el ${formatFecha(fechaRecuperacion.value)}`,
        life: 4000
      })
      
      // Cerrar modal y recargar datos
      mostrarModalProgramacion.value = false
      resetearModalProgramacion()
      await cargarPermisosYRecuperaciones()
      
    } else {
      throw new Error(response.data?.message || 'Error al guardar la recuperación')
    }
    
  } catch (error) {
    console.error('❌ Error guardando recuperación:', error)
    
    let mensajeError = 'Error al programar la recuperación'
    if (error.response?.data?.errors) {
      const errores = Object.values(error.response.data.errors).flat()
      mensajeError = errores.join(', ')
    } else if (error.response?.data?.message) {
      mensajeError = error.response.data.message
    } else if (error.message) {
      mensajeError = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensajeError,
      life: 5000
    })
    
  } finally {
    guardandoRecuperacion.value = false
  }
}

function resetearModalProgramacion() {
  permisoSeleccionado.value = null
  horariosDisponibles.value = []
  horarioRecuperacionSeleccionado.value = null
  fechaRecuperacion.value = null
  observacionRecuperacion.value = ''
}

// Funciones para gestionar recuperaciones
async function completarRecuperacion(recuperacion) {
  try {
    const confirmacion = await confirmarAccion(
      'Completar Recuperación',
      `¿Marcar la recuperación del ${formatFecha(recuperacion.fecha_recuperacion)} como completada?`
    )
    
    if (!confirmacion) return
    
    const response = await recuperacionService.updateEstado(recuperacion.id, 'completada')
    
    if (response.data?.success) {
      toast.add({
        severity: 'success',
        summary: '✅ Recuperación completada',
        detail: 'La recuperación ha sido marcada como completada',
        life: 3000
      })
      
      await cargarRecuperacionesProgramadas()
      
    } else {
      throw new Error('Error al completar la recuperación')
    }
    
  } catch (error) {
    console.error('❌ Error completando recuperación:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo completar la recuperación',
      life: 3000
    })
  }
}

async function cancelarRecuperacion(recuperacion) {
  try {
    const confirmacion = await confirmarAccion(
      'Cancelar Recuperación',
      `¿Cancelar la recuperación programada para el ${formatFecha(recuperacion.fecha_recuperacion)}?`,
      'Esta acción no se puede deshacer.'
    )
    
    if (!confirmacion) return
    
    const response = await recuperacionService.updateEstado(recuperacion.id, 'cancelada')
    
    if (response.data?.success) {
      toast.add({
        severity: 'info',
        summary: 'Recuperación cancelada',
        detail: 'La recuperación ha sido cancelada',
        life: 3000
      })
      
      await cargarRecuperacionesProgramadas()
      
    } else {
      throw new Error('Error al cancelar la recuperación')
    }
    
  } catch (error) {
    console.error('❌ Error cancelando recuperación:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cancelar la recuperación',
      life: 3000
    })
  }
}

function verDetallesRecuperacion(recuperacion) {
  recuperacionSeleccionada.value = recuperacion
  tituloModalDetalles.value = `Recuperación #${recuperacion.id}`
  mostrarModalDetalles.value = true
}

// Funciones auxiliares
// Función CORREGIDA para validar si puede recuperar


function getEstadoPermisoLabel(estado) {
  const map = {
    'aprobado': 'Aprobado',
    'pendiente': 'Pendiente',
    'rechazado': 'Rechazado'
  }
  return map[estado] || estado
}

function getEstadoPermisoSeverity(estado) {
  const map = {
    'aprobado': 'success',
    'pendiente': 'warning',
    'rechazado': 'danger'
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

function getClaseAvatarRecuperacion(estado) {
  const map = {
    'programada': 'bg-blue-100 text-blue-800',
    'completada': 'bg-green-100 text-green-800',
    'cancelada': 'bg-red-100 text-red-800',
    'pendiente': 'bg-yellow-100 text-yellow-800'
  }
  return map[estado] || 'bg-gray-100 text-gray-800'
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

// Funciones de formato
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

function formatDateToYMD(date) {
  if (!date) return null
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return null
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

function getInicialesEstudiante(estudiante) {
  if (!estudiante || !estudiante.nombres) return '?'
  const nombres = estudiante.nombres.split(' ')
  if (nombres.length >= 2) {
    return (nombres[0][0] + nombres[1][0]).toUpperCase()
  }
  return nombres[0][0].toUpperCase()
}

function getInicialesPersona(persona) {
  if (!persona || !persona.nombres) return 'A'
  return persona.nombres.charAt(0).toUpperCase()
}

function obtenerAdministradorId() {
  // Esta función debería obtener el ID del administrador logueado
  // Por ahora, devolvemos un valor por defecto
  return 1 // Cambiar según tu sistema de autenticación
}

async function confirmarAccion(titulo, mensaje, detalle = '') {
  return new Promise((resolve) => {
    // Usar el diálogo de confirmación de PrimeVue
    // En una implementación real, usarías p-confirm-dialog
    const confirmar = window.confirm(`${titulo}\n\n${mensaje}${detalle ? '\n\n' + detalle : ''}`)
    resolve(confirmar)
  })
}

// Funciones de UI
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
  
  // Seleccionar el primer permiso disponible
  programarRecuperacion(permisosDisponibles.value[0])
}

async function cargarDatos() {
  if (!inscripcionSeleccionada.value) {
    toast.add({
      severity: 'warn',
      summary: 'Seleccionar inscripción',
      detail: 'Seleccione una inscripción primero',
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
  gap: 1rem;
  align-items: center;
}

.inscripcion-selector {
  min-width: 300px;
}

.action-buttons-header {
  display: flex;
  gap: 0.5rem;
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

/* HORARIOS DISPONIBLES */
.horarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.horario-option {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.horario-option:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.horario-option.selected {
  border-color: #10b981;
  background: #f0fdf4;
}

.horario-content {
  position: relative;
}

.horario-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
}

.selected-indicator {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
  
  .inscripcion-selector {
    min-width: 100%;
  }
  
  .horarios-grid {
    grid-template-columns: 1fr;
  }
  
  .permisos-card,
  .recuperaciones-card {
    height: auto;
    max-height: 500px;
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
}
</style>