<template>
  <div class="historial-estudiante-container" v-if="estudiante">
    <!-- Header del estudiante -->
    <div class="header-estudiante card mb-4 p-4">
      <div class="grid">
        <div class="col-12 md:col-8">
          <div class="flex align-items-center gap-3">
            <Avatar :label="getIniciales(estudiante)" size="xlarge" shape="circle" 
                    class="bg-primary text-white" />
            <div>
              <h2 class="m-0">{{ estudiante.nombres_completos }}</h2>
              <div class="flex align-items-center gap-3 mt-2">
                <Tag :value="estudiante.estado" :severity="getSeverityEstado(estudiante.estado)" />
                <span class="text-500">{{ estudiante.documento }}</span>
                <span class="text-500">{{ estudiante.telefono }}</span>
                <span class="text-500">{{ estudiante.email || 'Sin email' }}</span>
              </div>
              <div class="mt-2">
                <small class="text-500">Edad: {{ calcularEdad(estudiante.fecha_nacimiento) }} años</small>
                <small class="text-500 ml-3">Registrado: {{ formatFecha(estudiante.created_at) }}</small>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-12 md:col-4">
          <div class="flex flex-column gap-2">
            <div class="text-right">
              <h5 class="m-0 text-primary">Resumen General</h5>
            </div>
            <div class="stats-summary">
              <div class="stat-item">
                <span class="label">Total Inscripciones:</span>
                <span class="value font-bold">{{ estadisticas.total_inscripciones }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Meses Activo:</span>
                <span class="value font-bold">{{ estadisticas.meses_activo }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Total Pagado:</span>
                <span class="value font-bold text-green-500">${{ estadisticas.total_pagado }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Inscripción Actual:</span>
                <span class="value">{{ inscripcionActual?.modalidad?.nombre || 'Ninguna' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs principales -->
    <TabView class="mb-4">
      <!-- Tab 1: Historial de Inscripciones -->
      <TabPanel header="Inscripciones">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-3">
            <h5 class="m-0">Historial Completo de Inscripciones</h5>
            <div class="flex gap-2">
              <Dropdown v-model="filtroAnio" :options="aniosDisponibles" placeholder="Año" 
                        class="w-10rem" @change="filtrarHistorial" />
              <Button label="Nueva Inscripción" icon="pi pi-user-plus" class="p-button-sm p-button-success" 
                      @click="crearNuevaInscripcion" />
            </div>
          </div>

          <!-- Timeline de inscripciones -->
          <div class="timeline-inscripciones">
            <div v-for="inscripcion in inscripcionesOrdenadas" :key="inscripcion.id" 
                 class="timeline-item" :class="getClaseTimeline(inscripcion)">
              <div class="timeline-marker">
                <i :class="getIconoTimeline(inscripcion)" class="timeline-icon"></i>
              </div>
              
              <div class="timeline-content card">
                <div class="timeline-header">
                  <div class="flex justify-content-between align-items-start">
                    <div>
                      <h6 class="m-0">{{ inscripcion.modalidad?.nombre }}</h6>
                      <div class="flex align-items-center gap-2 mt-1">
                        <Tag :value="inscripcion.estado" :severity="getSeverityEstado(inscripcion.estado)" size="small" />
                        <small class="text-500">{{ formatFecha(inscripcion.fecha_inicio) }} - {{ formatFecha(inscripcion.fecha_fin) }}</small>
                      </div>
                    </div>
                    <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm" 
                            @click="verDetallesInscripcion(inscripcion)" />
                  </div>
                </div>
                
                <div class="timeline-body">
                  <div class="grid">
                    <div class="col-12 md:col-6">
                      <div class="info-line">
                        <i class="pi pi-dollar"></i>
                        <span>Precio: ${{ inscripcion.modalidad?.precio_mensual }}</span>
                      </div>
                      <div class="info-line">
                        <i class="pi pi-calendar"></i>
                        <span>Duración: {{ calcularDiasInscripcion(inscripcion) }} días</span>
                      </div>
                    </div>
                    <div class="col-12 md:col-6">
                      <div class="info-line">
                        <i class="pi pi-users"></i>
                        <span>Clases: {{ inscripcion.clases_tomadas || 0 }}/{{ inscripcion.clases_totales || 0 }}</span>
                      </div>
                      <div class="info-line">
                        <i class="pi pi-shield"></i>
                        <span>Permisos: {{ inscripcion.permisos_usados || 0 }}/{{ inscripcion.permisos_maximos || 3 }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="mt-2">
                    <div class="progress-container">
                      <div class="flex justify-content-between">
                        <small>Progreso</small>
                        <small>{{ calcularProgresoInscripcion(inscripcion) }}%</small>
                      </div>
                      <ProgressBar :value="calcularProgresoInscripcion(inscripcion)" 
                                  :showValue="false" style="height: 4px" />
                    </div>
                  </div>
                </div>
                
                <div class="timeline-footer">
                  <div class="flex justify-content-between">
                    <small class="text-500">ID: #{{ inscripcion.id }}</small>
                    <small class="text-500">Sucursal: {{ inscripcion.sucursal?.nombre }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sin resultados -->
          <div v-if="inscripcionesOrdenadas.length === 0" class="text-center py-6 text-500">
            <i class="pi pi-history text-3xl mb-2"></i>
            <p>No se encontraron inscripciones históricas</p>
            <Button label="Crear primera inscripción" class="mt-2" 
                    @click="crearNuevaInscripcion" />
          </div>
        </div>

        <!-- Estadísticas de inscripciones -->
        <div class="card mt-3">
          <h5 class="mb-3">Estadísticas por Disciplina</h5>
          <div class="grid">
            <div v-for="(stats, disciplina) in estadisticasPorDisciplina" :key="disciplina" 
                 class="col-12 md:col-6 lg:col-3">
              <div class="disciplina-card">
                <div class="disciplina-header">
                  <h6 class="m-0">{{ disciplina }}</h6>
                </div>
                <div class="disciplina-body">
                  <div class="flex justify-content-between">
                    <span>Inscripciones:</span>
                    <span class="font-bold">{{ stats.total }}</span>
                  </div>
                  <div class="flex justify-content-between">
                    <span>Meses:</span>
                    <span>{{ stats.meses }} meses</span>
                  </div>
                  <div class="flex justify-content-between">
                    <span>Total:</span>
                    <span class="font-bold text-green-500">${{ stats.ingresos }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      
      <!-- Tab 2: Historial de Pagos -->
      <TabPanel header="Pagos">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-3">
            <h5 class="m-0">Historial de Pagos</h5>
            <div class="flex gap-2">
              <Dropdown v-model="filtroEstadoPago" :options="estadosPago" placeholder="Estado" 
                        class="w-10rem" @change="filtrarPagos" />
              <Button label="Nuevo Pago" icon="pi pi-plus" class="p-button-sm p-button-success" 
                      @click="registrarNuevoPago" />
            </div>
          </div>

          <DataTable :value="pagosFiltrados" :paginator="true" :rows="10" class="p-datatable-sm">
            <Column header="Fecha" :sortable="true">
              <template #body="slotProps">
                <div class="fecha-pago">
                  <div>{{ formatFecha(slotProps.data.fecha_pago) }}</div>
                  <small class="text-500">{{ getDiaSemana(slotProps.data.fecha_pago) }}</small>
                </div>
              </template>
            </Column>
            
            <Column header="Inscripción">
              <template #body="slotProps">
                <div class="inscripcion-pago">
                  <div class="font-medium">{{ slotProps.data.inscripcion?.modalidad?.nombre || '--' }}</div>
                  <small class="text-500">#{{ slotProps.data.inscripcion_id }}</small>
                </div>
              </template>
            </Column>
            
            <Column header="Monto">
              <template #body="slotProps">
                <div class="monto-pago">
                  <span class="font-bold text-green-500">${{ slotProps.data.monto }}</span>
                  <small class="text-500 block">{{ slotProps.data.metodo_pago }}</small>
                </div>
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
                <Tag v-else value="No" severity="secondary" />
              </template>
            </Column>
            
            <Column header="Acciones" style="width: 100px">
              <template #body="slotProps">
                <div class="flex gap-1">
                  <Button icon="pi pi-print" class="p-button-rounded p-button-text p-button-sm" 
                          @click="imprimirRecibo(slotProps.data)" v-tooltip="'Imprimir recibo'" />
                  <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm" 
                          @click="editarPago(slotProps.data)" v-tooltip="'Editar'" />
                </div>
              </template>
            </Column>
          </DataTable>

          <!-- Resumen financiero -->
          <div class="mt-4 p-3 border-round border-1 surface-border bg-blue-50">
            <h6 class="mb-3">Resumen Financiero del Estudiante</h6>
            <div class="grid">
              <div class="col-6 md:col-3">
                <div class="text-center p-2">
                  <div class="text-xl font-bold">${{ resumenFinanciero.total_pagado }}</div>
                  <small class="text-500">Total Pagado</small>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="text-center p-2">
                  <div class="text-xl font-bold">${{ resumenFinanciero.deuda_actual }}</div>
                  <small class="text-500">Deuda Actual</small>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="text-center p-2">
                  <div class="text-xl font-bold">{{ resumenFinanciero.pagos_realizados }}</div>
                  <small class="text-500">Pagos Realizados</small>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="text-center p-2">
                  <div class="text-xl font-bold">{{ resumenFinanciero.pagos_pendientes }}</div>
                  <small class="text-500">Pagos Pendientes</small>
                </div>
              </div>
            </div>
            
            <!-- Gráfico de pagos por mes -->
            <div class="mt-3">
              <h6 class="mb-2">Pagos por Mes (Últimos 6 meses)</h6>
              <div class="grafico-pagos">
                <div v-for="mes in pagosPorMes" :key="mes.mes" class="barra-mes">
                  <div class="mes-label">{{ mes.mes.slice(0,3) }}</div>
                  <div class="barra-container">
                    <div class="barra" :style="{ height: calcularAlturaBarra(mes.total) }" 
                         :class="getClaseBarra(mes.total)">
                      <div class="barra-valor">${{ mes.total }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      
      <!-- Tab 3: Historial de Asistencias -->
      <TabPanel header="Asistencias">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-3">
            <h5 class="m-0">Historial de Asistencias</h5>
            <div class="flex gap-2">
              <Calendar v-model="filtroFechaAsistencia" placeholder="Mes" :showIcon="true" 
                        view="month" dateFormat="mm/yy" class="w-10rem" />
              <Dropdown v-model="filtroTipoAsistencia" :options="tiposAsistencia" placeholder="Tipo" 
                        class="w-10rem" />
              <Button label="Exportar" icon="pi pi-file-excel" class="p-button-sm" />
            </div>
          </div>

          <!-- Calendario de asistencias -->
          <div class="calendario-asistencias mb-4">
            <h6 class="mb-3">Calendario Mensual</h6>
            <div class="dias-semana">
              <div v-for="dia in diasSemana" :key="dia" class="dia-header">{{ dia.slice(0,3) }}</div>
            </div>
            <div class="dias-mes">
              <div v-for="dia in generarDiasMes()" :key="dia.fecha" 
                   class="dia-calendario" :class="getClaseDiaCalendario(dia)">
                <div class="dia-numero">{{ dia.numero }}</div>
                <div class="dia-eventos">
                  <div v-for="evento in dia.eventos" :key="evento.id" 
                       class="evento-dot" :style="{ backgroundColor: getColorEvento(evento.tipo) }"
                       :title="evento.tipo"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista detallada -->
          <DataTable :value="asistenciasFiltradas" :paginator="true" :rows="10" class="p-datatable-sm">
            <Column header="Fecha" :sortable="true">
              <template #body="slotProps">
                <div class="fecha-asistencia">
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
                <div class="tipo-asistencia">
                  <i :class="getIconoTipoAsistencia(slotProps.data.tipo)" 
                     :style="{ color: getColorTipoAsistencia(slotProps.data.tipo) }" class="mr-2"></i>
                  <Tag :value="slotProps.data.tipo" :severity="getSeverityTipoAsistencia(slotProps.data.tipo)" />
                </div>
              </template>
            </Column>
            
            <Column header="Estado">
              <template #body="slotProps">
                {{ slotProps.data.estado || '--' }}
              </template>
            </Column>
            
            <Column header="Hora Registro">
              <template #body="slotProps">
                {{ slotProps.data.hora_registro?.slice(0,5) || '--:--' }}
              </template>
            </Column>
            
            <Column header="Observaciones">
              <template #body="slotProps">
                <div class="observaciones-asistencia">
                  {{ slotProps.data.observaciones || '--' }}
                </div>
              </template>
            </Column>
          </DataTable>

          <!-- Estadísticas de asistencia -->
          <div class="mt-4 p-3 border-round border-1 surface-border">
            <h6 class="mb-3">Estadísticas de Asistencia</h6>
            <div class="grid">
              <div class="col-12 md:col-6">
                <div class="estadistica-item">
                  <div class="estadistica-valor text-green-500">{{ estadisticasAsistencia.porcentaje_asistencia }}%</div>
                  <div class="estadistica-label">Porcentaje de Asistencia</div>
                  <ProgressBar :value="estadisticasAsistencia.porcentaje_asistencia" 
                              :showValue="false" class="mt-1" />
                </div>
              </div>
              <div class="col-12 md:col-6">
                <div class="grid">
                  <div class="col-6">
                    <div class="text-center">
                      <div class="text-lg font-bold text-green-500">{{ estadisticasAsistencia.asistencias }}</div>
                      <small class="text-500">Asistencias</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center">
                      <div class="text-lg font-bold text-orange-500">{{ estadisticasAsistencia.tardanzas }}</div>
                      <small class="text-500">Tardanzas</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center">
                      <div class="text-lg font-bold text-red-500">{{ estadisticasAsistencia.faltas }}</div>
                      <small class="text-500">Faltas</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center">
                      <div class="text-lg font-bold text-blue-500">{{ estadisticasAsistencia.permisos }}</div>
                      <small class="text-500">Permisos</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      
      <!-- Tab 4: Información Personal -->
      <TabPanel header="Información">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-3">
            <h5 class="m-0">Información Personal del Estudiante</h5>
            <Button label="Editar" icon="pi pi-pencil" class="p-button-sm" @click="editarEstudiante" />
          </div>

          <div class="grid">
            <!-- Información básica -->
            <div class="col-12 lg:col-6">
              <div class="info-section">
                <h6 class="mb-3">Información Básica</h6>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Documento:</span>
                    <span class="value">{{ estudiante.documento }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Fecha Nacimiento:</span>
                    <span class="value">{{ formatFecha(estudiante.fecha_nacimiento) }} ({{ calcularEdad(estudiante.fecha_nacimiento) }} años)</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Género:</span>
                    <span class="value">{{ estudiante.genero || '--' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Estado Civil:</span>
                    <span class="value">{{ estudiante.estado_civil || '--' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Ocupación:</span>
                    <span class="value">{{ estudiante.ocupacion || '--' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Fecha Registro:</span>
                    <span class="value">{{ formatFecha(estudiante.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Contacto -->
            <div class="col-12 lg:col-6">
              <div class="info-section">
                <h6 class="mb-3">Información de Contacto</h6>
                <div class="info-grid">
                  <div class="info-item">
                    <i class="pi pi-phone"></i>
                    <div>
                      <span class="label">Teléfono:</span>
                      <span class="value">{{ estudiante.telefono }}</span>
                    </div>
                  </div>
                  <div class="info-item">
                    <i class="pi pi-envelope"></i>
                    <div>
                      <span class="label">Email:</span>
                      <span class="value">{{ estudiante.email || 'Sin email' }}</span>
                    </div>
                  </div>
                  <div class="info-item">
                    <i class="pi pi-map-marker"></i>
                    <div>
                      <span class="label">Dirección:</span>
                      <span class="value">{{ estudiante.direccion || 'Sin dirección' }}</span>
                    </div>
                  </div>
                  <div class="info-item">
                    <i class="pi pi-building"></i>
                    <div>
                      <span class="label">Ciudad:</span>
                      <span class="value">{{ estudiante.ciudad || '--' }}</span>
                    </div>
                  </div>
                  <div class="info-item">
                    <i class="pi pi-flag"></i>
                    <div>
                      <span class="label">País:</span>
                      <span class="value">{{ estudiante.pais || '--' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Contacto de emergencia -->
            <div class="col-12">
              <div class="info-section mt-3">
                <h6 class="mb-3">Contacto de Emergencia</h6>
                <div class="grid">
                  <div class="col-12 md:col-6">
                    <div class="contacto-emergencia">
                      <h6 class="mb-2">Contacto Principal</h6>
                      <div class="info-item">
                        <span class="label">Nombre:</span>
                        <span class="value">{{ estudiante.contacto_emergencia_nombre || '--' }}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">Parentesco:</span>
                        <span class="value">{{ estudiante.contacto_emergencia_parentesco || '--' }}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">Teléfono:</span>
                        <span class="value">{{ estudiante.contacto_emergencia_telefono || '--' }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 md:col-6">
                    <div class="contacto-emergencia">
                      <h6 class="mb-2">Contacto Secundario</h6>
                      <div class="info-item">
                        <span class="label">Nombre:</span>
                        <span class="value">{{ estudiante.contacto_emergencia_nombre2 || '--' }}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">Parentesco:</span>
                        <span class="value">{{ estudiante.contacto_emergencia_parentesco2 || '--' }}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">Teléfono:</span>
                        <span class="value">{{ estudiante.contacto_emergencia_telefono2 || '--' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Información médica -->
            <div class="col-12">
              <div class="info-section mt-3">
                <h6 class="mb-3">Información Médica</h6>
                <div class="grid">
                  <div class="col-12 md:col-6">
                    <div class="info-item">
                      <span class="label">Alergias:</span>
                      <span class="value">{{ estudiante.alergias || 'Ninguna registrada' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Medicamentos:</span>
                      <span class="value">{{ estudiante.medicamentos || 'Ninguno registrado' }}</span>
                    </div>
                  </div>
                  <div class="col-12 md:col-6">
                    <div class="info-item">
                      <span class="label">Condiciones:</span>
                      <span class="value">{{ estudiante.condiciones_medicas || 'Ninguna registrada' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Seguro médico:</span>
                      <span class="value">{{ estudiante.seguro_medico || 'No especificado' }}</span>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="info-item">
                      <span class="label">Observaciones médicas:</span>
                      <span class="value">{{ estudiante.observaciones_medicas || 'Sin observaciones' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
    </TabView>

    <!-- Botones de acción -->
    <div class="flex justify-content-between gap-2 mt-4">
      <div>
        <Button label="Imprimir Historial" icon="pi pi-print" severity="secondary" 
                @click="imprimirHistorial" />
        <Button label="Exportar PDF" icon="pi pi-file-pdf" severity="secondary" 
                @click="exportarPDF" class="ml-2" />
      </div>
      <div>
        <Button label="Volver" icon="pi pi-arrow-left" @click="$emit('cerrar')" />
      </div>
    </div>
  </div>
  
  <!-- Cargando -->
  <div v-else class="text-center py-6">
    <ProgressSpinner />
    <p class="mt-3 text-500">Cargando información del estudiante...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRoute, useRouter } from 'vue-router';

// Services
import estudianteService from '@/services/estudiante.service';
import inscripcionService from '@/services/inscripcion.service';
import pagoService from '@/services/pago.service';
import asistenciaService from '@/services/asistencia.service';

// Components
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressBar from 'primevue/progressbar';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import ProgressSpinner from 'primevue/progressspinner';

const props = defineProps({
  estudianteId: {
    type: [Number, String],
    required: true
  }
});

const emit = defineEmits(['cerrar']);
const toast = useToast();
const router = useRouter();

// Estados
const estudiante = ref(null);
const inscripciones = ref([]);
const pagos = ref([]);
const asistencias = ref([]);
const cargando = ref(true);

// Filtros
const filtroAnio = ref(new Date().getFullYear());
const filtroEstadoPago = ref(null);
const filtroFechaAsistencia = ref(null);
const filtroTipoAsistencia = ref(null);

// Opciones
const aniosDisponibles = ref([2024, 2023, 2022, 2021]);
const estadosPago = [
  { label: 'Todos', value: null },
  { label: 'Confirmados', value: 'confirmado' },
  { label: 'Pendientes', value: 'pendiente' },
  { label: 'Rechazados', value: 'rechazado' }
];

const tiposAsistencia = [
  { label: 'Todos', value: null },
  { label: 'Asistencias', value: 'asistencia' },
  { label: 'Faltas', value: 'falta' },
  { label: 'Tardanzas', value: 'tardanza' },
  { label: 'Permisos', value: 'permiso' }
];

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Computed
const inscripcionesOrdenadas = computed(() => {
  return [...inscripciones.value].sort((a, b) => 
    new Date(b.fecha_inicio) - new Date(a.fecha_inicio)
  );
});

const inscripcionActual = computed(() => {
  return inscripciones.value.find(insc => insc.estado === 'activo');
});

const pagosFiltrados = computed(() => {
  let filtrados = pagos.value;
  
  if (filtroEstadoPago.value) {
    filtrados = filtrados.filter(p => p.estado === filtroEstadoPago.value);
  }
  
  return filtrados;
});

const asistenciasFiltradas = computed(() => {
  let filtrados = asistencias.value;
  
  if (filtroTipoAsistencia.value) {
    filtrados = filtrados.filter(a => a.tipo === filtroTipoAsacion.value);
  }
  
  return filtrados;
});

const estadisticas = computed(() => {
  const totalInscripciones = inscripciones.value.length;
  const totalPagado = pagos.value
    .filter(p => p.estado === 'confirmado')
    .reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
  
  // Calcular meses activo
  let mesesActivo = 0;
  if (inscripciones.value.length > 0) {
    const primeraInscripcion = new Date(Math.min(...inscripciones.value.map(i => new Date(i.fecha_inicio))));
    const ultimaInscripcion = new Date(Math.max(...inscripciones.value.map(i => new Date(i.fecha_fin))));
    mesesActivo = (ultimaInscripcion.getFullYear() - primeraInscripcion.getFullYear()) * 12 +
                  (ultimaInscripcion.getMonth() - primeraInscripcion.getMonth());
  }
  
  return {
    total_inscripciones: totalInscripciones,
    total_pagado: totalPagado.toFixed(2),
    meses_activo: Math.max(1, mesesActivo)
  };
});

const estadisticasPorDisciplina = computed(() => {
  const stats = {};
  
  inscripciones.value.forEach(inscripcion => {
    const disciplina = inscripcion.modalidad?.disciplina?.nombre || 'Sin disciplina';
    
    if (!stats[disciplina]) {
      stats[disciplina] = {
        total: 0,
        meses: 0,
        ingresos: 0
      };
    }
    
    stats[disciplina].total++;
    stats[disciplina].meses += calcularMesesInscripcion(inscripcion);
    stats[disciplina].ingresos += (inscripcion.modalidad?.precio_mensual || 0);
  });
  
  return stats;
});

const resumenFinanciero = computed(() => {
  const pagosConfirmados = pagos.value.filter(p => p.estado === 'confirmado');
  const pagosPendientes = pagos.value.filter(p => p.estado === 'pendiente');
  
  const totalPagado = pagosConfirmados.reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
  
  // Calcular deuda actual (simplificado)
  const precioMensualActual = inscripcionActual.value?.modalidad?.precio_mensual || 0;
  const deudaActual = pagosPendientes.reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
  
  return {
    total_pagado: totalPagado.toFixed(2),
    deuda_actual: deudaActual.toFixed(2),
    pagos_realizados: pagosConfirmados.length,
    pagos_pendientes: pagosPendientes.length
  };
});

const pagosPorMes = computed(() => {
  const meses = {};
  const hoy = new Date();
  
  // Últimos 6 meses
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    const label = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    meses[key] = { mes: label, total: 0 };
  }
  
  // Sumar pagos por mes
  pagos.value.forEach(pago => {
    if (pago.estado === 'confirmado') {
      const fechaPago = new Date(pago.fecha_pago);
      const key = `${fechaPago.getFullYear()}-${String(fechaPago.getMonth() + 1).padStart(2, '0')}`;
      
      if (meses[key]) {
        meses[key].total += parseFloat(pago.monto);
      }
    }
  });
  
  return Object.values(meses);
});

const estadisticasAsistencia = computed(() => {
  const asistenciasTotal = asistencias.value.filter(a => a.tipo === 'asistencia').length;
  const tardanzasTotal = asistencias.value.filter(a => a.tipo === 'tardanza').length;
  const faltasTotal = asistencias.value.filter(a => a.tipo === 'falta').length;
  const permisosTotal = asistencias.value.filter(a => a.tipo === 'permiso').length;
  
  const totalRegistros = asistenciasTotal + tardanzasTotal + faltasTotal + permisosTotal;
  const porcentajeAsistencia = totalRegistros > 0 
    ? Math.round(((asistenciasTotal + tardanzasTotal) / totalRegistros) * 100)
    : 0;
  
  return {
    asistencias: asistenciasTotal,
    tardanzas: tardanzasTotal,
    faltas: faltasTotal,
    permisos: permisosTotal,
    porcentaje_asistencia: porcentajeAsistencia
  };
});

onMounted(async () => {
  await cargarDatosEstudiante();
});

async function cargarDatosEstudiante() {
  cargando.value = true;
  
  try {
    const [estudianteRes, inscripcionesRes, pagosRes, asistenciasRes] = await Promise.all([
      estudianteService.show(props.estudianteId),
      inscripcionService.historialEstudiante(props.estudianteId),
      pagoService.porEstudiante(props.estudianteId),
      asistenciaService.porEstudiante(props.estudianteId)
    ]);
    
    estudiante.value = estudianteRes.data?.data || estudianteRes.data || estudianteRes;
    inscripciones.value = inscripcionesRes.data?.data || inscripcionesRes.data || inscripcionesRes;
    pagos.value = pagosRes.data?.data || pagosRes.data || pagosRes;
    asistencias.value = asistenciasRes.data?.data || asistenciasRes.data || asistenciasRes;
    
    // Generar años disponibles basados en inscripciones
    generarAniosDisponibles();
    
  } catch (error) {
    console.error('Error cargando datos del estudiante:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos del estudiante',
      life: 3000
    });
  } finally {
    cargando.value = false;
  }
}

function generarAniosDisponibles() {
  const anios = new Set();
  inscripciones.value.forEach(insc => {
    const fecha = new Date(insc.fecha_inicio);
    anios.add(fecha.getFullYear());
  });
  
  aniosDisponibles.value = Array.from(anios).sort((a, b) => b - a);
  if (aniosDisponibles.value.length === 0) {
    aniosDisponibles.value = [new Date().getFullYear()];
  }
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

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return '--';
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
}

function getSeverityEstado(estado) {
  switch (estado) {
    case 'activo': return 'success';
    case 'inactivo': return 'danger';
    case 'suspendido': return 'warning';
    case 'finalizado': return 'info';
    default: return 'info';
  }
}

function getClaseTimeline(inscripcion) {
  return {
    'timeline-item-activo': inscripcion.estado === 'activo',
    'timeline-item-finalizado': inscripcion.estado === 'finalizado',
    'timeline-item-vencido': inscripcion.estado === 'vencido'
  };
}

function getIconoTimeline(inscripcion) {
  switch (inscripcion.estado) {
    case 'activo': return 'pi pi-check-circle';
    case 'finalizado': return 'pi pi-history';
    case 'vencido': return 'pi pi-times-circle';
    default: return 'pi pi-circle';
  }
}

function calcularDiasInscripcion(inscripcion) {
  const inicio = new Date(inscripcion.fecha_inicio);
  const fin = new Date(inscripcion.fecha_fin);
  const diffTime = fin - inicio;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calcularMesesInscripcion(inscripcion) {
  const inicio = new Date(inscripcion.fecha_inicio);
  const fin = new Date(inscripcion.fecha_fin);
  const meses = (fin.getFullYear() - inicio.getFullYear()) * 12;
  return meses + (fin.getMonth() - inicio.getMonth());
}

function calcularProgresoInscripcion(inscripcion) {
  const total = inscripcion.clases_totales || 1;
  const restantes = inscripcion.clases_restantes || 0;
  const tomadas = total - restantes;
  return Math.round((tomadas / total) * 100);
}

function getDiaSemana(fecha) {
  const date = new Date(fecha);
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return dias[date.getDay()];
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

function getSeverityTipoAsistencia(tipo) {
  switch (tipo) {
    case 'asistencia': return 'success';
    case 'tardanza': return 'warning';
    case 'falta': return 'danger';
    case 'permiso': return 'info';
    default: return 'info';
  }
}

function getIconoTipoAsistencia(tipo) {
  switch (tipo) {
    case 'asistencia': return 'pi pi-check-circle';
    case 'tardanza': return 'pi pi-clock';
    case 'falta': return 'pi pi-times-circle';
    case 'permiso': return 'pi pi-info-circle';
    default: return 'pi pi-question-circle';
  }
}

function getColorTipoAsistencia(tipo) {
  switch (tipo) {
    case 'asistencia': return '#10B981';
    case 'tardanza': return '#F59E0B';
    case 'falta': return '#EF4444';
    case 'permiso': return '#3B82F6';
    default: return '#6B7280';
  }
}

function generarDiasMes() {
  const dias = [];
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = hoy.getMonth();
  const primerDia = new Date(año, mes, 1);
  const ultimoDia = new Date(año, mes + 1, 0);
  
  // Días vacíos al inicio
  for (let i = 0; i < primerDia.getDay(); i++) {
    dias.push({ numero: '', fecha: null, eventos: [] });
  }
  
  // Días del mes
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    const fecha = new Date(año, mes, dia);
    const eventos = asistencias.value.filter(a => {
      const fechaAsist = new Date(a.fecha);
      return fechaAsist.toDateString() === fecha.toDateString();
    }).map(a => ({ id: a.id, tipo: a.tipo }));
    
    dias.push({ numero: dia, fecha, eventos });
  }
  
  return dias;
}

function getClaseDiaCalendario(dia) {
  const clases = ['dia-calendario'];
  
  if (!dia.fecha) {
    clases.push('dia-vacio');
  } else {
    const hoy = new Date();
    if (dia.fecha.toDateString() === hoy.toDateString()) {
      clases.push('dia-hoy');
    }
    
    if (dia.eventos.length > 0) {
      clases.push('dia-con-eventos');
    }
  }
  
  return clases.join(' ');
}

function getColorEvento(tipo) {
  switch (tipo) {
    case 'asistencia': return '#10B981';
    case 'tardanza': return '#F59E0B';
    case 'falta': return '#EF4444';
    case 'permiso': return '#3B82F6';
    default: return '#6B7280';
  }
}

function calcularAlturaBarra(total) {
  const max = Math.max(...pagosPorMes.value.map(mes => mes.total), 1);
  return `${(total / max) * 100}%`;
}

function getClaseBarra(total) {
  if (total > 1000) return 'barra-alta';
  if (total > 500) return 'barra-media';
  return 'barra-baja';
}

// Acciones
function verDetallesInscripcion(inscripcion) {
  console.log('Ver detalles inscripción:', inscripcion);
  // Podrías emitir un evento o navegar
  emit('ver-inscripcion', inscripcion.id);
}

function crearNuevaInscripcion() {
  router.push(`/admin/inscripciones/nueva?estudiante_id=${props.estudianteId}`);
}

function registrarNuevoPago() {
  router.push(`/admin/pagos/nuevo?estudiante_id=${props.estudianteId}`);
}

function verComprobante(url) {
  window.open(url, '_blank');
}

function imprimirRecibo(pago) {
  console.log('Imprimir recibo:', pago);
  toast.add({
    severity: 'info',
    summary: 'Imprimir',
    detail: 'Funcionalidad en desarrollo',
    life: 3000
  });
}

function editarPago(pago) {
  console.log('Editar pago:', pago);
}

function editarEstudiante() {
  router.push(`/admin/estudiantes/editar/${props.estudianteId}`);
}

function filtrarHistorial() {
  // Implementar filtrado por año
}

function filtrarPagos() {
  // Ya se maneja en computed
}

function imprimirHistorial() {
  toast.add({
    severity: 'info',
    summary: 'Imprimir',
    detail: 'Funcionalidad en desarrollo',
    life: 3000
  });
}

function exportarPDF() {
  toast.add({
    severity: 'info',
    summary: 'Exportar',
    detail: 'Funcionalidad en desarrollo',
    life: 3000
  });
}
</script>

<style scoped>
.historial-estudiante-container {
  padding: 0.5rem;
}

.header-estudiante {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  border: none;
}

.header-estudiante .text-500 {
  color: rgba(255, 255, 255, 0.8) !important;
}

.stats-summary {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-item .label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.stat-item .value {
  color: white;
}

.timeline-inscripciones {
  position: relative;
  padding: 1rem 0;
}

.timeline-inscripciones::before {
  content: '';
  position: absolute;
  left: 1.5rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e5e7eb;
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
  padding-left: 3rem;
}

.timeline-marker {
  position: absolute;
  left: 1rem;
  top: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: white;
  border: 3px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.timeline-item-activo .timeline-marker {
  border-color: #10B981;
}

.timeline-item-finalizado .timeline-marker {
  border-color: #6B7280;
}

.timeline-item-vencido .timeline-marker {
  border-color: #EF4444;
}

.timeline-icon {
  font-size: 1rem;
}

.timeline-item-activo .timeline-icon {
  color: #10B981;
}

.timeline-item-finalizado .timeline-icon {
  color: #6B7280;
}

.timeline-item-vencido .timeline-icon {
  color: #EF4444;
}

.timeline-content {
  padding: 1rem;
  transition: transform 0.2s;
}

.timeline-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.timeline-header {
  margin-bottom: 0.75rem;
}

.timeline-body {
  margin-bottom: 0.75rem;
}

.info-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.info-line i {
  color: #6B7280;
}

.progress-container {
  background: #f3f4f6;
  padding: 0.5rem;
  border-radius: 4px;
}

.timeline-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.5rem;
}

.disciplina-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  transition: transform 0.2s;
}

.disciplina-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.disciplina-header {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.disciplina-body {
  padding-top: 0.5rem;
}

.fecha-pago, .inscripcion-pago, .monto-pago, .horario-asistencia {
  display: flex;
  flex-direction: column;
}

.grafico-pagos {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  height: 150px;
  margin-top: 1rem;
}

.barra-mes {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mes-label {
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: #6B7280;
}

.barra-container {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: flex-end;
}

.barra {
  width: 100%;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.3s;
}

.barra-alta {
  background: linear-gradient(to top, #10B981, #34D399);
}

.barra-media {
  background: linear-gradient(to top, #F59E0B, #FBBF24);
}

.barra-baja {
  background: linear-gradient(to top, #6B7280, #9CA3AF);
}

.barra-valor {
  position: absolute;
  top: -1.5rem;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.75rem;
  font-weight: bold;
  color: #374151;
}

.calendario-asistencias {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.dias-semana {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.dia-header {
  text-align: center;
  font-weight: 600;
  padding: 0.5rem;
  color: #374151;
}

.dias-mes {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.dia-calendario {
  aspect-ratio: 1;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.dia-vacio {
  background-color: #f9fafb;
  border-color: #f3f4f6;
}

.dia-hoy {
  background-color: #dbeafe;
  border-color: #3b82f6;
}

.dia-con-eventos {
  background-color: #f0f9ff;
}

.dia-numero {
  font-size: 0.875rem;
  font-weight: 600;
}

.dia-eventos {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
}

.evento-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.estadistica-item {
  padding: 1rem;
  border-radius: 8px;
  background: #f9fafb;
}

.estadistica-valor {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
}

.estadistica-label {
  margin-top: 0.5rem;
  color: #6B7280;
}

.info-section {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item i {
  color: #3b82f6;
  margin-top: 0.125rem;
}

.info-item .label {
  display: block;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.125rem;
}

.info-item .value {
  display: block;
  font-size: 0.95rem;
}

.contacto-emergencia {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

::v-deep(.p-tabview-nav) {
  background: white;
  border-bottom: 2px solid #e5e7eb;
}

::v-deep(.p-tabview-nav-link) {
  padding: 1rem 1.5rem;
}
</style>