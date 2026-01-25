<template>
  <div class="inscripciones-container">
    <!-- Dashboard rápido -->
    <div class="dashboard-cards mb-4">
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Total Activas</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-users stat-icon text-primary"></i>
                <span class="stat-value">{{ estadisticas.totalActivas }}</span>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Por Vencer (7 días)</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-clock stat-icon text-warning"></i>
                <span class="stat-value">{{ estadisticas.porVencer }}</span>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Clases Hoy</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-calendar stat-icon text-success"></i>
                <span class="stat-value">{{ estadisticas.clasesHoy }}</span>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Ingresos Mes</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-money-bill stat-icon text-green-500"></i>
                <span class="stat-value">${{ estadisticas.ingresosMes }}</span>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Toolbar con más opciones -->
    <Toolbar class="mb-4 custom-toolbar">
      <template #start>
        <div class="flex align-items-center gap-2">
          <Button label="Nueva Inscripción" icon="pi pi-user-plus" severity="success" @click="abrirDialogoNueva" />
          <Button label="Exportar Excel" icon="pi pi-file-excel" severity="help" @click="exportarExcel" />
        </div>
      </template>

      <template #end>
        <div class="flex gap-2 align-items-center">
          <InputText v-model="buscar" placeholder="Buscar estudiante..." class="p-inputtext-sm"
            @keyup.enter="aplicarFiltrosAvanzados" />
          <Dropdown v-model="filtroEstado" :options="opcionesEstado" optionLabel="label" optionValue="value"
            placeholder="Estado" class="w-10rem" />
          <Button icon="pi pi-filter" label="Aplicar Filtros" @click="aplicarFiltrosAvanzados" />
          <Button icon="pi pi-filter-slash" label="Limpiar" severity="secondary" @click="limpiarFiltros" />
        </div>
      </template>
    </Toolbar>

    <!-- Tabs para diferentes vistas -->
    <TabView class="mb-4">
      <TabPanel header="Todas las Inscripciones">
        <DataTable :value="inscripcionesFiltradas" :paginator="true" :rows="10" :loading="cargando"
          class="p-datatable-sm">
          <Column field="id" header="ID" :sortable="true" style="width: 70px"></Column>
          <Column header="Estudiante" :sortable="true">
            <template #body="slotProps">
              <div class="flex align-items-center">
                <div>
                  <div class="font-medium">{{ slotProps.data.estudiante?.nombres }} {{
                    slotProps.data.estudiante?.apellidos }}</div>
                  <small class="text-500">{{ slotProps.data.estudiante?.ci }}</small>
                </div>
              </div>
            </template>
          </Column>
          <Column header="Modalidad" :sortable="true" sortField="modalidad.nombre">
            <template #body="slotProps">
              <div class="flex flex-column">
                <span class="font-medium">{{ slotProps.data.modalidad?.nombre }}</span>
                <small class="text-500">${{ slotProps.data.modalidad?.precio_mensual }}/mes</small>
              </div>
            </template>
          </Column>
          <Column header="Progreso" :sortable="true" sortField="clases_asistidas">
            <template #body="slotProps">
              <div class="flex flex-column gap-1">
                <div class="flex justify-content-between align-items-center mb-1">
                  <div class="flex align-items-center gap-2">
                    <span class="font-medium text-sm">
                      {{ getClasesProgresoConAlerta(slotProps.data).asistidas }}/{{
                        getClasesProgresoConAlerta(slotProps.data).total }}
                    </span>

                    <!-- Indicador de alerta -->
                    <div v-if="getClasesProgresoConAlerta(slotProps.data).tieneAlerta" class="alerta-indicador"
                      v-tooltip="getMensajeProgreso(slotProps.data)">
                      <i :class="getClasesProgresoConAlerta(slotProps.data).alertaInfo.icono + ' ' +
                        getClasesProgresoConAlerta(slotProps.data).alertaInfo.color" style="font-size: 0.9rem"></i>
                    </div>
                  </div>

                  <!-- Porcentaje -->
                  <span class="text-500 text-xs">
                    {{ getClasesProgresoConAlerta(slotProps.data).alertaInfo.datos.porcentaje || 0 }}%
                  </span>
                </div>

                <!-- Barra de progreso con estilo de alerta -->
                <ProgressBar :value="calcularProgresoConEstilo(slotProps.data).valor" :showValue="false"
                  :class="['progreso-clases', calcularProgresoConEstilo(slotProps.data).clase]" />

                <!-- Mensaje de alerta -->
                <div v-if="getClasesProgresoConAlerta(slotProps.data).tieneAlerta" class="mt-1">
                  <small :class="getClasesProgresoConAlerta(slotProps.data).alertaInfo.color + ' font-semibold'">
                    <i :class="getClasesProgresoConAlerta(slotProps.data).alertaInfo.icono + ' mr-1'"
                      style="font-size: 0.8rem"></i>
                    {{ getMensajeProgreso(slotProps.data) }}
                  </small>
                </div>

                <!-- Info adicional -->
                <small v-else class="text-500">
                  {{ getClasesProgresoConAlerta(slotProps.data).restantes ||
                    getClasesProgresoConAlerta(slotProps.data).total -
                    getClasesProgresoConAlerta(slotProps.data).asistidas }} clases restantes
                </small>
              </div>
            </template>
          </Column>
          <Column header="Vencimiento">
            <template #body="slotProps">
              <div class="flex flex-column">
                <!-- Fecha de vencimiento de inscripción -->
                <span :class="getColorVencimiento(slotProps.data.fecha_fin)">
                  {{ formatFecha(slotProps.data.fecha_fin) }}
                </span>
                <small class="text-500">{{ getDiasRestantes(slotProps.data.fecha_fin) }}</small>

                <!-- Mostrar información de pago pendiente si está en mora -->
                <div v-if="slotProps.data.estado === 'en_mora'" class="mt-1">
                  <small class="text-xs text-red-500">
                    <i class="pi pi-exclamation-triangle mr-1"></i>
                    Pago pendiente
                  </small>
                </div>
              </div>
            </template>
          </Column>

          <Column header="Estado" :sortable="true">
            <template #body="slotProps">
              <div class="flex flex-column">
                <!-- Estado principal de la inscripción -->
                <Tag :value="slotProps.data.estado"
                  :severity="obtenerSeveridadEstado(slotProps.data.estado, slotProps.data.fecha_fin)" />

                <!-- Estado detallado si está en mora -->
                <div v-if="slotProps.data.estado === 'en_mora'" class="mt-1">
                  <div class="flex align-items-center gap-1">
                    <i class="pi pi-money-bill text-red-500" style="font-size: 0.8rem"></i>
                    <small class="text-xs text-red-500 font-semibold">
                      Saldo pendiente: ${{ slotProps.data.saldo_pendiente || 0 }}
                    </small>
                  </div>

                  <!-- Mostrar días de mora -->
                  <small v-if="slotProps.data.dias_mora" class="text-xs text-orange-500">
                    <i class="pi pi-clock mr-1"></i>
                    {{ slotProps.data.dias_mora }} día(s) de mora
                  </small>
                </div>

                <!-- Estado de pago si no está en mora -->
                <div v-else-if="slotProps.data.estado_pago" class="mt-1">
                  <small class="text-xs" :class="{
                    'text-green-500': slotProps.data.estado_pago === 'al_dia',
                    'text-blue-500': slotProps.data.estado_pago === 'pagado'
                  }">
                    <i class="pi pi-check-circle mr-1"></i>
                    Pagos al día
                  </small>
                </div>
              </div>
            </template>
          </Column>

          <!-- Columna para Ver Detalles -->
          <Column header="Detalles" style="width: 60px">
            <template #body="slotProps">
              <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm"
                @click="verDetalles(slotProps.data)" v-tooltip="'Ver detalles'" :class="{
                  'text-blue-500 hover:text-blue-600': slotProps.data.estado !== 'en_mora',
                  'text-red-500 hover:text-red-600': slotProps.data.estado === 'en_mora'
                }" />
            </template>
          </Column>

          <!-- NUEVA COLUMNA: Estado de Pago -->
          <Column header="Pagos" style="width: 120px">
            <template #body="slotProps">
              <div class="flex flex-column align-items-center">
                <!-- Indicador visual del estado de pagos -->
                <div class="w-8 h-8 rounded-full flex align-items-center justify-content-center mb-1"
                  :class="getClaseEstadoPago(slotProps.data)">
                  <i :class="getIconoEstadoPago(slotProps.data)"></i>
                </div>

                <!-- Texto del estado -->
                <small class="text-xs font-semibold" :class="getColorTextoEstadoPago(slotProps.data)">
                  {{ getTextoEstadoPago(slotProps.data) }}
                </small>

                <!-- Monto pendiente si hay -->
                <small v-if="slotProps.data.saldo_pendiente > 0" class="text-xs text-red-500 mt-1">
                  ${{ slotProps.data.saldo_pendiente }}
                </small>
              </div>
            </template>
          </Column>

          <!-- NUEVA COLUMNA: Acciones de Pago -->
          <Column header="Acc. Pago" style="width: 100px">
            <template #body="slotProps">
              <div class="flex gap-1">
                <!-- Botón para registrar pago -->
                <Button icon="pi pi-money-bill" class="p-button-rounded p-button-text p-button-sm" :class="{
                  'text-red-500 hover:text-red-600 animate-pulse': slotProps.data.estado === 'en_mora',
                  'text-yellow-500 hover:text-yellow-600': slotProps.data.estado === 'activo' && slotProps.data.saldo_pendiente > 0,
                  'text-gray-400 hover:text-gray-400': slotProps.data.saldo_pendiente <= 0
                }" @click="registrarPago(slotProps.data)" v-tooltip="getTooltipPago(slotProps.data)"
                  :disabled="slotProps.data.saldo_pendiente <= 0 && slotProps.data.estado !== 'en_mora'" />

              
                
              </div>
            </template>
          </Column>

          <!-- Columna para Renovar -->
          <!-- En tu columna de Renovar -->
          <Column header="Renovar" style="width: 80px">
            <template #body="slotProps">
              <div class="flex align-items-center gap-1">
                <Button icon="pi pi-refresh" class="p-button-rounded p-button-text p-button-sm"
                  @click="renovarInscripcion(slotProps.data)" v-tooltip="getTooltipRenovacion(slotProps.data)" :class="{
                    'text-blue-500 hover:text-blue-600': puedeRenovar(slotProps.data) && calcularDiasRestantes(slotProps.data.fecha_fin) > 7,
                    'text-green-500 hover:text-green-600': puedeRenovar(slotProps.data) && calcularDiasRestantes(slotProps.data.fecha_fin) <= 7 && calcularDiasRestantes(slotProps.data.fecha_fin) >= 0,
                    'text-orange-500 hover:text-orange-600': puedeRenovar(slotProps.data) && calcularDiasRestantes(slotProps.data.fecha_fin) < 0,
                    'text-gray-400 hover:text-gray-500 cursor-not-allowed': !puedeRenovar(slotProps.data)
                  }" :disabled="!puedeRenovar(slotProps.data)" />

                <!-- Indicador de estado -->
                <div v-if="puedeRenovar(slotProps.data)" class="w-2 h-2 rounded-full" :class="{
                  'bg-blue-500': calcularDiasRestantes(slotProps.data.fecha_fin) > 7,
                  'bg-green-500 animate-pulse': calcularDiasRestantes(slotProps.data.fecha_fin) <= 7 && calcularDiasRestantes(slotProps.data.fecha_fin) >= 0,
                  'bg-orange-500': calcularDiasRestantes(slotProps.data.fecha_fin) < 0
                }" v-tooltip="getEstadoRenovacion(slotProps.data)"></div>
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <TabPanel header="Próximas a Vencer">
        <DataTable :value="inscripcionesPorVencer" :paginator="true" :rows="10">
          <Column header="Estudiante">
            <template #body="slotProps">
              {{ slotProps.data.estudiante?.nombres }}
            </template>
          </Column>
          <Column header="Modalidad">
            <template #body="slotProps">
              {{ slotProps.data.modalidad?.nombre }}
            </template>
          </Column>
          <Column header="Vence">
            <template #body="slotProps">
              {{ formatFecha(slotProps.data.fecha_fin) }}
            </template>
          </Column>
          <Column header="Días Restantes">
            <template #body="slotProps">
              {{ slotProps.data.dias_restantes }}
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <TabPanel header="Suspensas/Inactivas">
        <DataTable :value="inscripcionesInactivas" :paginator="true" :rows="10">
          <Column header="Estudiante">
            <template #body="slotProps">
              {{ slotProps.data.estudiante?.nombres }}
            </template>
          </Column>
          <Column header="Modalidad">
            <template #body="slotProps">
              {{ slotProps.data.modalidad?.nombre }}
            </template>
          </Column>
          <Column field="estado" header="Estado"></Column>
          <Column header="Última Actividad">
            <template #body="slotProps">
              {{ formatFecha(slotProps.data.updated_at) }}
            </template>
          </Column>
        </DataTable>
      </TabPanel>
    </TabView>

    <!-- Diálogo de nueva inscripción -->
    <Dialog v-model:visible="dialogoInscripcion" :header="tituloDialogo" :modal="true"
      :style="{ width: '90vw', maxWidth: '1200px' }" :closable="false">
      <Stepper v-model:activeStep="pasoActual" class="mb-4">
        <!-- Paso 1: Estudiante -->
        <StepperPanel header="Estudiante">
          <template #content="{ nextCallback }">
            <div class="p-3">
              <h4>Seleccionar Estudiante</h4>
              <div class="grid">
                <div class="col-12 md:col-8">
                  <div class="card">
                    <div class="flex justify-content-between mb-3">
                      <span class="p-input-icon-left w-full mr-2">
                        <i class="pi pi-search"></i>
                        <InputText v-model="buscarEstudiante" placeholder="Buscar por nombre, ci, teléfono o correo..."
                          @input="filtrarEstudiantes" class="w-full" :disabled="estudiantes.length === 0" />
                      </span>
                    </div>
                    <DataTable :value="estudiantesFiltrados" selectionMode="single"
                      v-model:selection="estudianteSeleccionado" dataKey="id" :loading="cargandoEstudiantes"
                      class="p-datatable-sm" :paginator="true" :rows="5">
                      <Column selectionMode="single" headerStyle="width: 3rem"></Column>
                      <Column field="nombres" header="Nombres"></Column>
                      <Column field="apellidos" header="Apellidos"></Column>
                      <Column field="ci" header="CI"></Column>
                      <Column field="telefono" header="Teléfono"></Column>
                      <Column field="correo" header="Correo"></Column>
                      <Column field="estado" header="Estado">
                        <template #body="slotProps">
                          <Tag :value="slotProps.data.estado"
                            :severity="slotProps.data.estado === 'activo' ? 'success' : 'danger'" />
                        </template>
                      </Column>
                    </DataTable>
                  </div>
                </div>
                <div class="col-12 md:col-4">
                  <div v-if="estudianteSeleccionado" class="card">
                    <h5>Estudiante Seleccionado</h5>
                    <div class="info-box">
                      <Avatar :label="getIniciales(estudianteSeleccionado)" size="large" shape="circle" class="mb-2" />
                      <h6>{{ estudianteSeleccionado.nombres }} {{ estudianteSeleccionado.apellidos }}</h6>
                      <p class="text-500 mb-1">{{ estudianteSeleccionado.ci }}</p>
                      <p class="text-500">{{ estudianteSeleccionado.telefono }}</p>
                      <Divider />
                      <h6>Inscripciones Activas</h6>
                      <div v-if="inscripcionesActivasEstudiante.length > 0">
                        <div v-for="insc in inscripcionesActivasEstudiante" :key="insc.id"
                          class="mb-2 p-2 border-round border-1 surface-border">
                          <small class="font-bold">{{ insc.modalidad?.nombre || 'Sin modalidad' }}</small>
                          <div class="text-sm text-500">
                            {{ insc.clases_restantes_calculadas || 0 }} clases restantes
                          </div>
                          <div class="text-xs text-500">
                            Vence: {{ formatFecha(insc.fecha_fin) }}
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-500 text-sm">
                        <template v-if="estudianteSeleccionado">
                          No tiene inscripciones activas
                          <div class="mt-1">
                            <small>Puede crear una nueva inscripción</small>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                  <div v-else class="card text-center p-4">
                    <i class="pi pi-user text-400" style="font-size: 3rem"></i>
                    <p class="text-500 mt-2">Seleccione un estudiante</p>
                  </div>
                </div>
              </div>
              <div class="flex justify-content-between mt-4">
                <Button label="Cancelar" severity="secondary" @click="cerrarDialogoCompleto" />
                <Button label="Siguiente" :disabled="!estudianteSeleccionado"
                  @click="cargarHorariosDisponibles(); pasoActual = 1;" />
              </div>
            </div>
          </template>
        </StepperPanel>



        <StepperPanel header="Modalidad">
          <template #content="{ nextCallback }">
            <div class="p-3">
              <h4>Selecciona un Plan</h4>

              <div v-if="cargandoModalidades" class="p-4 text-center">
                <ProgressSpinner style="width: 50px; height: 50px" />
                <p class="text-500 mt-2">Cargando planes disponibles...</p>
              </div>

              <div v-else-if="modalidades.length === 0" class="p-4 text-center border-round border-1 surface-border">
                <i class="pi pi-box text-400" style="font-size: 3rem"></i>
                <p class="text-500 mt-2">No hay modalidades disponibles</p>
                <Button label="Atrás" severity="secondary" @click="pasoActual = 0;" class="mt-3" />
              </div>

              <div v-else class="grid">
                <div v-for="modalidad in modalidades" :key="modalidad.id" class="col-12 md:col-6 lg:col-4 mb-3">
                  <Card class="modalidad-card" @click="seleccionarModalidad(modalidad)" :class="{
                    'selected': modalidadSeleccionada?.id === modalidad.id,
                    'border-primary border-2': modalidadSeleccionada?.id === modalidad.id,
                    'cursor-pointer': true
                  }">
                    <template #title>
                      <div class="flex justify-content-between align-items-center">
                        <div>
                          <span class="font-bold">{{ modalidad.nombre }}</span>
                          <div class="text-xs text-500">{{ modalidad.descripcion_corta }}</div>
                        </div>
                        <div class="text-xl font-bold text-green-600">
                          ${{ modalidad.precio_mensual }}
                        </div>
                      </div>
                    </template>
                    <template #content>
                      <div class="space-y-2">
                        <div class="flex align-items-center">
                          <i class="pi pi-calendar text-primary mr-2"></i>
                          <div>
                            <div class="font-medium">{{ modalidad.clases_mensuales }} clases/mes</div>
                            <small class="text-500">{{ calcularClasesSemanales(modalidad.clases_mensuales) }} clases por
                              semana</small>
                          </div>
                        </div>
                        <div class="flex align-items-center">
                          <i class="pi pi-shield text-primary mr-2"></i>
                          <div>
                            <div class="font-medium">{{ modalidad.permisos_maximos }} permisos</div>
                            <small class="text-500">Para faltar sin penalización</small>
                          </div>
                        </div>
                        <div v-if="modalidad.disciplina_nombre" class="text-xs text-500 mt-2">
                          <i class="pi pi-tag mr-1"></i>
                          <span>{{ modalidad.disciplina_nombre }}</span>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>

              <div class="flex justify-content-between mt-4">
                <Button label="Atrás" severity="secondary" @click="pasoActual = 0;" />
                <Button label="Siguiente" :disabled="!modalidadSeleccionada"
                  @click="cargarHorariosPorModalidad(modalidadSeleccionada.id); pasoActual = 2;" />
              </div>
            </div>
          </template>
        </StepperPanel>

        <!-- Paso 3: Seleccionar Horarios -->
        <StepperPanel header="Horarios">
          <template #content="{ prevCallback, nextCallback }">
            <div class="p-3">
              <h4>Selecciona tus horarios</h4>

              <!-- Mostrar información de la modalidad seleccionada -->
              <div v-if="modalidadSeleccionada" class="mb-4 p-3 border-round bg-blue-50">
                <div class="flex justify-content-between align-items-center">
                  <div>
                    <h5 class="mt-0 mb-1">{{ modalidadSeleccionada.nombre }}</h5>
                    <div class="flex align-items-center gap-2 flex-wrap">
                      <Tag :value="`${modalidadSeleccionada.clases_mensuales} clases/mes`" severity="info" />
                      <Tag :value="`$${modalidadSeleccionada.precio_mensual}`" severity="success" />
                      <Tag :value="`${modalidadSeleccionada.permisos_maximos} permisos`" severity="warning" />
                      <small class="text-500">Selecciona los horarios que necesites</small>
                    </div>
                  </div>
                  <Button label="Cambiar" severity="secondary" text @click="pasoActual = 1;"
                    v-tooltip="'Seleccionar otra modalidad'" />
                </div>
              </div>

              <!-- Información general -->
              <div class="mb-4 p-3 border-round bg-green-50 flex justify-content-between align-items-center">
                <div>
                  <i class="pi pi-info-circle text-primary mr-2"></i>
                  <span>Haz clic en los horarios que deseas seleccionar</span>
                </div>
                <div class="flex align-items-center gap-2">
                  <Tag :value="`${horariosSeleccionados.length} seleccionados`" severity="info" />
                  <Tag :value="`$${getPrecioTotal()}`" severity="success" />
                </div>
              </div>

              <!-- Lista de horarios -->
              <div v-if="cargandoHorarios" class="p-4 text-center">
                <ProgressSpinner style="width: 50px; height: 50px" />
                <p class="text-500 mt-2">Cargando horarios disponibles...</p>
              </div>

              <div v-else-if="horariosFiltrados.length === 0"
                class="p-4 text-center border-round border-1 surface-border">
                <i class="pi pi-calendar-times text-400" style="font-size: 3rem"></i>
                <p class="text-500 mt-2">
                  No hay horarios disponibles para esta modalidad
                </p>
                <Button label="Cambiar Modalidad" severity="secondary" @click="pasoActual = 1;" class="mt-3" />
              </div>


              <div v-else class="grid">
                <div v-for="horario in horariosFiltrados" :key="horario.id" class="col-12 md:col-6 lg:col-4 mb-3">
                  <Card class="horario-card" @click="toggleHorarioSeleccionado(horario)" :class="{
                    'selected': estaSeleccionado(horario.id),
                    'border-primary border-2': estaSeleccionado(horario.id),
                    'cursor-pointer': true
                  }">
                    <template #title>
                      <div class="flex justify-content-between align-items-center">
                        <div class="flex align-items-center">
                          <div class="selection-indicator mr-2">
                            <i v-if="estaSeleccionado(horario.id)" class="pi pi-check-circle text-primary"></i>
                            <i v-else class="pi pi-circle text-400"></i>
                          </div>
                          <span class="font-bold">{{ horario.nombre_horario }}</span>
                        </div>
                        <Tag :value="`$${horario.precio}`" severity="success" />
                      </div>
                    </template>
                    <template #content>
                      <div class="space-y-3">
                        <div class="flex align-items-center">
                          <i class="pi pi-calendar text-primary mr-2"></i>
                          <div>
                            <div class="font-medium">{{ horario.dia_semana }}</div>
                            <small class="text-500">{{ horario.hora_inicio }} - {{ horario.hora_fin }}</small>
                          </div>
                        </div>
                        <div class="flex align-items-center">
                          <i class="pi pi-user text-primary mr-2"></i>
                          <div>
                            <div class="font-medium">Entrenador</div>
                            <small class="text-500">{{ horario.entrenador_nombre }}</small>
                          </div>
                        </div>
                        <div class="flex align-items-center">
                          <i class="pi pi-building text-primary mr-2"></i>
                          <div>
                            <div class="font-medium">Sucursal</div>
                            <small class="text-500">{{ horario.sucursal_nombre }}</small>
                          </div>
                        </div>
                        <div class="flex align-items-center">
                          <i class="pi pi-users text-primary mr-2"></i>
                          <div>
                            <div class="font-medium">Cupo disponible</div>
                            <small :class="{
                              'text-green-500 font-semibold': horario.cupo_disponible > 5,
                              'text-yellow-500': horario.cupo_disponible > 0 && horario.cupo_disponible <= 5,
                              'text-red-500': horario.cupo_disponible === 0
                            }">
                              {{ horario.cupo_disponible }}/{{ horario.cupo_maximo }}
                            </small>
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>

              <!-- Horarios seleccionados -->
              <div v-if="horariosSeleccionados.length > 0" class="mt-4 p-3 border-round bg-green-50">
                <div class="flex justify-content-between align-items-center mb-3">
                  <h5 class="mt-0 mb-0">✅ Horarios seleccionados ({{ horariosSeleccionados.length }})</h5>>
                  <div class="text-lg font-bold text-green-600">Total: ${{ getPrecioTotal() }}</div>
                </div>

                <div class="grid">
                  <div v-for="(horario, index) in horariosSeleccionadosDetalles" :key="horario.id"
                    class="col-12 md:col-6 lg:col-3 mb-2">
                    <div class="p-2 border-round border-1 surface-border bg-white">
                      <div class="flex justify-content-between align-items-center">
                        <div>
                          <div class="font-bold">{{ horario.nombre_horario }}</div>
                          <small class="text-500">{{ horario.dia_semana }} {{ horario.hora_inicio }}</small>
                        </div>
                        <Button icon="pi pi-times" class="p-button-rounded p-button-text p-button-sm"
                          @click.stop="quitarHorario(horario.id)" v-tooltip="'Quitar'" />
                      </div>
                      <div class="text-xs text-500 mt-1">
                        {{ horario.entrenador_nombre }} • {{ horario.sucursal_nombre }}
                      </div>
                      <div class="text-xs font-semibold mt-1 text-primary">
                        ${{ horario.precio }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botones de navegación -->
              <div class="flex justify-content-between mt-4">
                <Button label="Atrás" severity="secondary" @click="pasoActual = 1;" />
                <Button label="Continuar a Pago" :disabled="horariosSeleccionados.length === 0"
                  @click="validarYContinuar()" icon="pi pi-arrow-right" iconPos="right" />
              </div>
            </div>
          </template>
        </StepperPanel>

        <!-- Paso 4: Confirmar y Pagar -->
        <StepperPanel header="Confirmar y Pagar">
          <template #content="{ prevCallback }">
            <div class="p-3">
              <h4>Confirmar Inscripción y Pago</h4>

              <!-- Mostrar información de la modalidad seleccionada -->
              <div v-if="modalidadSeleccionada" class="mb-4 p-3 border-round bg-blue-50">
                <div class="flex justify-content-between align-items-center">
                  <div>
                    <h5 class="mt-0 mb-1">{{ modalidadSeleccionada.nombre }}</h5>
                    <div class="flex align-items-center gap-2">
                      <Tag :value="`${modalidadSeleccionada.clases_mensuales} clases/mes`" severity="info" />
                      <Tag :value="`$${modalidadSeleccionada.precio_mensual}`" severity="success" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid mb-4">
                <div class="col-12 md:col-7">
                  <Card class="mb-3">
                    <template #title>📋 Resumen de la Inscripción</template>
                    <template #content>
                      <div class="mb-4">
                        <h6 class="mt-0 mb-2">👤 Estudiante</h6>
                        <div class="flex align-items-center">
                          <Avatar :label="getIniciales(estudianteSeleccionado)" class="mr-2" />
                          <div>
                            <div class="font-bold">{{ estudianteSeleccionado?.nombres }} {{
                              estudianteSeleccionado?.apellidos }}</div>
                            <small class="text-500">CI: {{ estudianteSeleccionado?.ci }}</small>
                          </div>
                        </div>
                      </div>

                      <div class="mb-4">
                        <h6 class="mt-0 mb-2">📅 Horarios seleccionados</h6>
                        <div class="grid">
                          <div v-for="(horario, index) in horariosSeleccionadosDetalles" :key="horario.id"
                            class="col-12 md:col-6 mb-2">
                            <div class="p-2 border-round border-1 surface-border bg-gray-50">
                              <div class="flex justify-content-between align-items-center">
                                <div class="font-bold">{{ horario.dia_semana }}</div>
                                <Tag :value="`#${index + 1}`" severity="info" />
                              </div>
                              <div class="text-sm">{{ horario.hora_inicio }} - {{ horario.hora_fin }}</div>
                              <div class="text-xs text-500">
                                {{ horario.entrenador_nombre }} | {{ horario.sucursal_nombre }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Información de cálculo de clases -->
                      <div class="mb-4 p-3 border-round bg-green-50">
                        <h6 class="mt-0 mb-2">📊 Cálculo de Clases</h6>
                        <div class="grid">
                          <div class="col-12 md:col-4">
                            <div class="field">
                              <label class="text-500 block mb-1">Clases por mes</label>
                              <div class="font-bold">{{ modalidadSeleccionada?.clases_mensuales || '--' }}</div>
                            </div>
                          </div>
                          <div class="col-12 md:col-4">
                            <div class="field">
                              <label class="text-500 block mb-1">Duración</label>
                              <div class="font-bold">{{ calcularMesesDuracion() }} meses</div>
                            </div>
                          </div>
                          <div class="col-12 md:col-4">
                            <div class="field">
                              <label class="text-500 block mb-1">Clases totales</label>
                              <div class="font-bold text-green-600">{{ calcularClasesTotales() }}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="grid">
                        <div class="col-12 md:col-6">
                          <div class="field mb-3">
                            <label for="fecha_inicio" class="text-500 block mb-1">Fecha de inicio *</label>
                            <Calendar v-model="inscripcionForm.fecha_inicio" dateFormat="dd/mm/yy" class="w-full"
                              :minDate="hoy" showIcon />
                          </div>
                        </div>
                        <div class="col-12 md:col-6">
                          <div class="field mb-3">
                            <label for="fecha_fin" class="text-500 block mb-1">Fecha de fin *</label>
                            <Calendar v-model="inscripcionForm.fecha_fin" dateFormat="dd/mm/yy" class="w-full"
                              :minDate="inscripcionForm.fecha_inicio || hoy" showIcon />
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>

                <!-- SECCIÓN DE PAGO COMPLETA -->
                <div class="col-12 md:col-5">
                  <Card class="mb-3">
                    <template #title>💰 Información de Pago</template>
                    <template #content>
                      <div class="space-y-4">
                        <!-- Mostrar precio total -->
                        <div>
                          <label class="text-500 block mb-1">Precio Total de la Modalidad</label>
                          <div class="text-2xl font-bold text-green-600">
                            ${{ getPrecioTotal() }}
                          </div>
                          <small class="text-500">{{ calcularMesesDuracion() }} mes(es) × ${{
                            modalidadSeleccionada?.precio_mensual || 0 }}/mes</small>
                        </div>

                        <!-- Opción para dividir pago -->
                        <div class="field-checkbox mb-3">
                          <Checkbox v-model="dividirPago" :binary="true" inputId="dividir_pago"
                            :disabled="pagoForm.monto >= getPrecioTotal()" />
                          <label for="dividir_pago" class="ml-2 cursor-pointer">
                            <span class="font-medium">Dividir pago en 2 partes</span>
                            <small class="text-500 block">Pagar mitad ahora y mitad después</small>
                          </label>
                        </div>

                        <!-- Campo para ingresar el monto del pago -->
                        <div class="field">
                          <label for="monto_pago" class="text-500 block mb-1">
                            <span v-if="dividirPago">Monto a Pagar Ahora *</span>
                            <span v-else>Monto a Pagar *</span>
                          </label>
                          <div class="p-inputgroup">
                            <span class="p-inputgroup-addon">$</span>
                            <InputNumber v-model="pagoForm.monto" :min="0" :max="getPrecioTotal()" :step="10"
                              class="w-full" :class="{
                                'p-invalid': !pagoForm.monto || pagoForm.monto <= 0 || pagoForm.monto > getPrecioTotal(),
                                'border-yellow-300': dividirPago && pagoForm.monto < getPrecioTotal() / 2
                              }" :placeholder="dividirPago ? 'Ej: 300' : 'Ingrese el monto'" />

                            <!-- Botón para sugerir mitad -->
                            <Button v-if="dividirPago" label="Mitad" @click="pagoForm.monto = getPrecioTotal() / 2"
                              class="p-button-outlined p-button-sm" :disabled="pagoForm.monto >= getPrecioTotal()" />
                          </div>

                          <!-- Mensajes de validación y saldo -->
                          <div class="mt-2">
                            <small v-if="!pagoForm.monto || pagoForm.monto <= 0" class="p-error block">
                              Ingrese un monto válido
                            </small>
                            <small v-else-if="pagoForm.monto > getPrecioTotal()" class="p-error block">
                              El monto no puede ser mayor a ${{ getPrecioTotal() }}
                            </small>

                            <!-- Mostrar información de división -->
                            <div v-if="dividirPago && pagoForm.monto > 0" class="text-sm">
                              <div class="flex justify-between text-500 mt-1">
                                <span>Total a pagar:</span>
                                <span class="font-bold">${{ getPrecioTotal() }}</span>
                              </div>
                              <div class="flex justify-between mt-1"
                                :class="pagoForm.monto < getPrecioTotal() / 2 ? 'text-yellow-600' : 'text-green-600'">
                                <span>Pagando ahora:</span>
                                <span class="font-bold">${{ pagoForm.monto }}</span>
                              </div>
                              <div class="flex justify-between mt-1 text-blue-600">
                                <span>Saldo pendiente:</span>
                                <span class="font-bold">${{ (getPrecioTotal() - pagoForm.monto).toFixed(2) }}</span>
                              </div>

                              <!-- Advertencia si paga menos de la mitad -->
                              <div v-if="pagoForm.monto < getPrecioTotal() / 2"
                                class="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                <i class="pi pi-exclamation-triangle text-yellow-600 mr-2"></i>
                                <span class="text-yellow-700 text-xs">
                                  Está pagando menos de la mitad. Se creará una segunda cuota de ${{ (getPrecioTotal() -
                                    pagoForm.monto).toFixed(2) }}
                                </span>
                              </div>
                            </div>

                            <!-- Mostrar si es pago completo -->
                            <div v-else-if="pagoForm.monto > 0" class="text-sm">
                              <div class="flex justify-between mt-1">
                                <span class="text-500">Total:</span>
                                <span class="font-bold text-green-600">${{ getPrecioTotal() }}</span>
                              </div>
                              <div v-if="pagoForm.monto === getPrecioTotal()" class="text-green-600 text-xs mt-1">
                                <i class="pi pi-check-circle mr-1"></i> Pago completo
                              </div>
                              <div v-else-if="pagoForm.monto < getPrecioTotal()" class="text-blue-600 text-xs mt-1">
                                <i class="pi pi-info-circle mr-1"></i> Pago parcial (saldo: ${{ (getPrecioTotal() -
                                  pagoForm.monto).toFixed(2) }})
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Método de pago -->
                        <div class="field">
                          <label for="metodo_pago" class="text-500 block mb-1">Método de Pago *</label>
                          <Dropdown v-model="pagoForm.metodo_pago" :options="metodosPago" optionLabel="label"
                            optionValue="value" placeholder="Seleccione método" class="w-full"
                            :class="{ 'p-invalid': !pagoForm.metodo_pago }" />
                          <small v-if="!pagoForm.metodo_pago" class="p-error">Seleccione un método de pago</small>
                        </div>

                        <!-- Fecha de pago -->
                        <div class="field">
                          <label for="fecha_pago" class="text-500 block mb-1">Fecha de Pago</label>
                          <Calendar v-model="pagoForm.fecha_pago" dateFormat="dd/mm/yy" class="w-full"
                            :maxDate="new Date()" showIcon />
                        </div>

                        <!-- Observaciones -->
                        <div class="field">
                          <label for="observacion" class="text-500 block mb-1">Observaciones (Opcional)</label>
                          <Textarea v-model="pagoForm.observacion" rows="2" class="w-full"
                            :placeholder="getPlaceholderObservacion()" />
                        </div>

                        <!-- Resumen del pago dividido -->
                        <div v-if="dividirPago && pagoForm.monto > 0 && pagoForm.monto < getPrecioTotal()"
                          class="p-3 border-round bg-blue-50 border-1 border-blue-200">
                          <h6 class="mt-0 mb-2 flex align-items-center">
                            <i class="pi pi-calendar-plus text-blue-500 mr-2"></i>
                            <span>Plan de Pago</span>
                          </h6>
                          <div class="grid">
                            <div class="col-12 md:col-6">
                              <div class="text-sm">
                                <div class="font-bold text-blue-700">Primera cuota</div>
                                <div>Monto: ${{ pagoForm.monto }}</div>
                                <div>Fecha: {{ formatFecha(pagoForm.fecha_pago || new Date()) }}</div>
                                <div>Estado:
                                  <Tag value="Pagando ahora" severity="success" class="ml-1" />
                                </div>
                              </div>
                            </div>
                            <div class="col-12 md:col-6">
                              <div class="text-sm">
                                <div class="font-bold text-blue-700">Segunda cuota</div>
                                <div>Monto: ${{ (getPrecioTotal() - pagoForm.monto).toFixed(2) }}</div>
                                <div>Fecha: {{ calcularFechaSegundaCuota() }}</div>
                                <div>Estado:
                                  <Tag value="Pendiente" severity="warning" class="ml-1" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <small class="text-500 block mt-2">
                            <i class="pi pi-info-circle mr-1"></i>
                            La segunda cuota se creará automáticamente como pendiente
                          </small>
                        </div>

                        <Divider />
                        <div class="text-sm">
                          <div class="flex align-items-center mb-2">
                            <i class="pi pi-check-circle text-green-500 mr-2"></i>
                            <span>{{ modalidadSeleccionada?.clases_mensuales || 12 }} clases mensuales</span>
                          </div>
                          <div class="flex align-items-center mb-2">
                            <i class="pi pi-check-circle text-green-500 mr-2"></i>
                            <span>{{ modalidadSeleccionada?.permisos_maximos || 3 }} permisos</span>
                          </div>
                          <div class="flex align-items-center">
                            <i class="pi pi-check-circle text-green-500 mr-2"></i>
                            <span>Acceso a instalaciones</span>
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>

              <!-- Resumen Final -->
              <!-- En el paso 4: Confirmar y Pagar, actualiza esta sección -->
              <Card class="mb-4">
                <template #title>✅ Resumen Final</template>
                <template #content>
                  <div class="grid">
                    <div class="col-12 md:col-4">
                      <div class="flex justify-content-between mb-2">
                        <span class="text-500">Modalidad:</span>
                        <span class="font-bold">{{ modalidadSeleccionada?.nombre || '--' }}</span>
                      </div>
                      <div class="flex justify-content-between mb-2">
                        <span class="text-500">Horarios:</span>
                        <span class="font-bold">{{ horariosSeleccionados.length }}</span>
                      </div>
                    </div>
                    <div class="col-12 md:col-4">
                      <div class="flex justify-content-between mb-2">
                        <span class="text-500">Duración:</span>
                        <span class="font-bold">{{ calcularMesesDuracion() }} meses</span>
                      </div>
                      <div class="flex justify-content-between mb-2">
                        <span class="text-500">Período:</span>
                        <span class="font-bold">{{ formatFecha(inscripcionForm.fecha_inicio) }} - {{
                          formatFecha(inscripcionForm.fecha_fin) }}</span>
                      </div>
                    </div>
                    <div class="col-12 md:col-4">
                      <div class="flex justify-content-between mb-2">
                        <span class="text-500">Clases mod:</span>
                        <span class="font-bold">{{ modalidadSeleccionada?.clases_mensuales || '12' }}/mes</span>
                      </div>
                      <div class="flex justify-content-between mb-2">
                        <span class="text-500">Clases estimadas:</span>
                        <span class="font-bold text-green-600">{{getDistribucionEstimada().reduce((sum, d) => sum +
                          d.clases, 0)}}</span>
                      </div>
                    </div>
                  </div>
                  <Divider />
                  <div class="mt-2">
                    <div class="text-500 mb-1">Distribución real estimada (basada en fechas):</div>
                    <div class="flex flex-wrap gap-2">
                      <Chip v-for="(dist, index) in getDistribucionEstimada()" :key="index"
                        :label="`${dist.horario.dia_semana}: ${dist.clases} clases`" severity="info" />
                    </div>
                    <small class="text-500 mt-1 block">
                      * Clases estimadas para el período seleccionado. La modalidad ofrece {{
                        modalidadSeleccionada?.clases_mensuales || 12 }} clases mensuales.
                    </small>
                  </div>
                </template>
              </Card>

              <div class="flex justify-content-between mt-4">
                <Button label="Atrás" severity="secondary" @click="pasoActual = 2;" />
                <Button label="✅ Confirmar Inscripción y Pago" severity="success" @click="guardarInscripcionYpago"
                  :loading="guardando"
                  :disabled="!pagoForm.metodo_pago || !inscripcionForm.fecha_inicio || !inscripcionForm.fecha_fin || !pagoForm.monto || pagoForm.monto <= 0" />
              </div>
            </div>
          </template>
        </StepperPanel>



      </Stepper>
    </Dialog>

    <!-- Diálogo para Ver Detalles -->
    <Dialog v-model:visible="dialogoDetalles" :header="tituloDetalles" :modal="true"
      :style="{ width: '60rem', maxWidth: '95vw' }">
      <div v-if="inscripcionSeleccionada">
        <div class="grid">
          <!-- Información del Estudiante -->
          <div class="col-12 md:col-6">
            <Card class="mb-3">
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-user text-primary"></i>
                  <span>Estudiante</span>
                </div>
              </template>
              <template #content>
                <div class="flex align-items-center mb-3">
                  <Avatar :label="getIniciales(inscripcionSeleccionada.estudiante)" size="large" class="mr-3" />
                  <div>
                    <h4 class="mt-0 mb-1">{{ inscripcionSeleccionada.estudiante?.nombres }} {{
                      inscripcionSeleccionada.estudiante?.apellidos }}</h4>
                    <p class="text-500 mb-1">CI: {{ inscripcionSeleccionada.estudiante?.ci }}</p>
                    <p class="text-500">{{ inscripcionSeleccionada.estudiante?.telefono }}</p>
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Información de la Modalidad -->
          <div class="col-12 md:col-6">
            <Card class="mb-3">
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-star text-primary"></i>
                  <span>Modalidad</span>
                </div>
              </template>
              <template #content>
                <div class="space-y-2">
                  <div class="flex justify-content-between">
                    <span class="text-500">Nombre:</span>
                    <span class="font-bold">{{ inscripcionSeleccionada.modalidad?.nombre }}</span>
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-500">Precio:</span>
                    <span class="font-bold text-green-600">${{ inscripcionSeleccionada.modalidad?.precio_mensual
                    }}/mes</span>
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-500">Clases por mes:</span>
                    <Tag :value="`${inscripcionSeleccionada.modalidad?.clases_mensuales} clases`" severity="info" />
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Información de Horarios -->
          <div class="col-12">
            <Card class="mb-3">
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-calendar text-primary"></i>
                  <span>Horarios Asignados</span>
                </div>
              </template>
              <template #content>
                <!-- En el diálogo de detalles, dentro de la sección de horarios: -->
                <div v-if="inscripcionSeleccionada.inscripcion_horarios?.length > 0" class="grid">
                  <div v-for="(ih, index) in inscripcionSeleccionada.inscripcion_horarios" :key="ih.id || index"
                    class="col-12 md:col-4 mb-3">
                    <div class="p-3 border-round border-1 surface-border">
                      <div class="flex justify-content-between align-items-center mb-2">
                        <Tag :value="getDiaSemana(ih.horario)" severity="info" />
                        <span class="font-bold">#{{ index + 1 }}</span>
                      </div>
                      <div class="font-bold mb-1">
                        {{ formatHora(ih.horario?.hora_inicio) }} - {{ formatHora(ih.horario?.hora_fin) }}
                      </div>
                      <div class="text-sm text-500 mb-2">
                        {{ ih.horario?.nombre || `Horario ${ih.horario_id}` }}
                      </div>

                      <Divider />

                      <div class="text-sm">
                        <div class="flex justify-content-between mb-1">
                          <span class="text-500">Clases:</span>
                          <span>{{ ih.clases_asistidas || 0 }}/{{ ih.clases_totales || 0 }}</span>
                        </div>
                        <div class="flex justify-content-between">
                          <span class="text-500">Restantes:</span>
                          <span class="font-bold" :class="{
                            'text-green-500': (ih.clases_restantes || ih.clases_totales || 0) > 0,
                            'text-red-500': (ih.clases_restantes || ih.clases_totales || 0) <= 0
                          }">
                            {{ ih.clases_restantes || ih.clases_totales || 0 }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else-if="inscripcionSeleccionada.horarios?.length > 0" class="grid">
                  <!-- Mostrar horarios directos si existen -->
                  <div v-for="(horario, index) in inscripcionSeleccionada.horarios" :key="horario.id || index"
                    class="col-12 md:col-4 mb-3">
                    <div class="p-3 border-round border-1 surface-border">
                      <Tag :value="getDiaSemana(horario)" severity="info" class="mb-2" />
                      <div class="font-bold mb-1">
                        {{ formatHora(horario.hora_inicio) }} - {{ formatHora(horario.hora_fin) }}
                      </div>
                      <div class="text-sm text-500">{{ horario.nombre || `Horario ${horario.id}` }}</div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center p-4">
                  <i class="pi pi-calendar-times text-400" style="font-size: 3rem"></i>
                  <p class="text-500 mt-2">No hay horarios asignados</p>
                </div>
              </template>
            </Card>
          </div>

          <!-- En el diálogo de detalles, dentro del grid -->


          <!-- Información de Pago y Estado -->
          <div class="col-12 md:col-6">
            <Card class="mb-3">
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-money-bill text-primary"></i>
                  <span>Información de Pago</span>
                </div>
              </template>
              <template #content>
                <div class="space-y-2">
                  <div class="flex justify-content-between">
                    <span class="text-500">Monto mensual:</span>
                    <span class="font-bold">${{ inscripcionSeleccionada.monto_mensual }}</span>
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-500">Estado:</span>
                    <Tag :value="inscripcionSeleccionada.estado"
                      :severity="obtenerSeveridadEstado(inscripcionSeleccionada.estado, inscripcionSeleccionada.fecha_fin)" />
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-500">Permisos:</span>
                    <span>{{ inscripcionSeleccionada.permisos_usados || 0 }}/{{
                      inscripcionSeleccionada.permisos_disponibles || 3 }}</span>
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Información de Fechas -->
          <div class="col-12 md:col-6">
            <Card class="mb-3">
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-clock text-primary"></i>
                  <span>Fechas</span>
                </div>
              </template>
              <template #content>
                <div class="space-y-3">
                  <div class="flex justify-content-between">
                    <span class="text-500">Inicio:</span>
                    <span class="font-bold">{{ formatFecha(inscripcionSeleccionada.fecha_inicio) }}</span>
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-500">Fin:</span>
                    <span class="font-bold" :class="getColorVencimiento(inscripcionSeleccionada.fecha_fin)">
                      {{ formatFecha(inscripcionSeleccionada.fecha_fin) }}
                    </span>
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-500">Días restantes:</span>
                    <span class="font-bold" :class="{
                      'text-green-500': inscripcionSeleccionada.dias_restantes > 7,
                      'text-yellow-500': inscripcionSeleccionada.dias_restantes > 0 && inscripcionSeleccionada.dias_restantes <= 7,
                      'text-red-500': inscripcionSeleccionada.dias_restantes <= 0
                    }">
                      {{ inscripcionSeleccionada.dias_restantes || 0 }} días
                    </span>
                  </div>
                </div>
              </template>
            </Card>
          </div>


        </div>
      </div>
    </Dialog>

    <!-- Diálogo para Renovar Inscripción -->
    <Dialog v-model:visible="dialogoRenovacion" header="Renovar Inscripción" :modal="true" :style="{ width: '45rem' }"
      @after-hide="resetearRenovacion">
      <div v-if="inscripcionARenovar">
        <!-- Cabecera con información del estudiante -->
        <div class="mb-4">
          <div class="flex align-items-center mb-3">
            <Avatar :label="getIniciales(inscripcionARenovar.estudiante)" class="mr-2" size="large" shape="circle" />
            <div>
              <div class="font-bold text-lg">{{ inscripcionARenovar.estudiante?.nombres }} {{
                inscripcionARenovar.estudiante?.apellidos }}</div>
              <div class="text-500">CI: {{ inscripcionARenovar.estudiante?.ci }}</div>
              <div class="text-500">Vence: {{ formatFecha(inscripcionARenovar.fecha_fin) }}</div>
            </div>
          </div>

          <!-- Alertas importantes -->
          <div class="p-3 border-round bg-yellow-50 mb-3">
            <div class="flex align-items-center">
              <i class="pi pi-exclamation-triangle text-yellow-500 mr-2" style="font-size: 1.2rem"></i>
              <div>
                <div class="font-medium">La inscripción actual vence en {{ inscripcionARenovar.dias_restantes || 0 }}
                  días
                </div>
                <small class="text-500 block mt-1">
                  Estado actual:
                  <Tag :value="inscripcionARenovar.estado"
                    :severity="obtenerSeveridadEstado(inscripcionARenovar.estado, inscripcionARenovar.fecha_fin)"
                    class="ml-1" />
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- Información de la inscripción actual -->
        <Card class="mb-4">
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-info-circle text-primary"></i>
              <span>Información de la Inscripción Actual</span>
            </div>
          </template>
          <template #content>
            <div class="grid">
              <div class="col-6">
                <div class="text-500 text-sm mb-1">Modalidad</div>
                <div class="font-bold">{{ inscripcionARenovar.modalidad?.nombre }}</div>
              </div>
              <div class="col-6">
                <div class="text-500 text-sm mb-1">Precio Mensual</div>
                <div class="font-bold text-green-600">${{ inscripcionARenovar.modalidad?.precio_mensual }}</div>
              </div>
              <div class="col-6">
                <div class="text-500 text-sm mb-1">Clases por Mes</div>
                <div class="font-bold">{{ inscripcionARenovar.modalidad?.clases_mensuales || 12 }}</div>
              </div>
              <div class="col-6">
                <div class="text-500 text-sm mb-1">Permisos Disponibles</div>
                <div class="font-bold">{{ inscripcionARenovar.permisos_disponibles || 3 }}</div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Formulario de renovación -->
        <div class="mb-4">
          <h5 class="mt-0 mb-3">Configurar Renovación</h5>

          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="field mb-3">
                <label for="fecha_inicio_renovar" class="text-500 block mb-1">
                  <i class="pi pi-calendar text-primary mr-1"></i>
                  Fecha de inicio *
                </label>
                <Calendar id="fecha_inicio_renovar" v-model="renovacionForm.fecha_inicio" dateFormat="dd/mm/yy"
                  class="w-full" :minDate="new Date()" showIcon
                  :class="{ 'p-invalid': !renovacionForm.fecha_inicio }" />
                <small v-if="!renovacionForm.fecha_inicio" class="p-error">Seleccione una fecha de inicio</small>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field mb-3">
                <label for="fecha_fin_renovar" class="text-500 block mb-1">
                  <i class="pi pi-calendar text-primary mr-1"></i>
                  Fecha de fin *
                </label>
                <Calendar id="fecha_fin_renovar" v-model="renovacionForm.fecha_fin" dateFormat="dd/mm/yy" class="w-full"
                  :minDate="renovacionForm.fecha_inicio || new Date()" showIcon
                  :class="{ 'p-invalid': !renovacionForm.fecha_fin }" />
                <small v-if="!renovacionForm.fecha_fin" class="p-error">Seleccione una fecha de fin</small>
                <small v-if="renovacionForm.fecha_inicio && renovacionForm.fecha_fin" class="text-500">
                  Duración: {{ calcularMesesDuracionRenovacion() }} meses
                </small>
              </div>
            </div>

            <div class="col-12">
              <div class="field mb-3">
                <label for="motivo_renovacion" class="text-500 block mb-1">
                  <i class="pi pi-comment text-primary mr-1"></i>
                  Motivo (Opcional)
                </label>
                <Textarea id="motivo_renovacion" v-model="renovacionForm.motivo" rows="2" class="w-full"
                  placeholder="Ej: Renovación mensual, Renovación trimestral, Extensión por vacaciones..." />
              </div>
            </div>

            <!-- Opciones de renovación rápida -->
            <div class="col-12">
              <div class="text-500 mb-2">Opciones rápidas:</div>
              <div class="flex gap-2 mb-3">
                <Button label="1 mes" severity="secondary" @click="aplicarRenovacionRapida(1)" class="p-button-sm" />
                <Button label="3 meses" severity="secondary" @click="aplicarRenovacionRapida(3)" class="p-button-sm" />
                <Button label="6 meses" severity="secondary" @click="aplicarRenovacionRapida(6)" class="p-button-sm" />
                <Button label="12 meses" severity="secondary" @click="aplicarRenovacionRapida(12)"
                  class="p-button-sm" />
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen de la renovación -->
        <Card class="mb-4">
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-check-circle text-success"></i>
              <span>Resumen de la Renovación</span>
            </div>
          </template>
          <template #content>
            <div class="space-y-3">
              <div class="flex justify-content-between">
                <span class="text-500">Modalidad:</span>
                <span class="font-bold">{{ inscripcionARenovar.modalidad?.nombre }}</span>
              </div>

              <div class="flex justify-content-between">
                <span class="text-500">Precio mensual:</span>
                <span class="font-bold text-green-600">${{ inscripcionARenovar.modalidad?.precio_mensual }}</span>
              </div>

              <div class="flex justify-content-between">
                <span class="text-500">Duración renovada:</span>
                <span class="font-bold">{{ calcularMesesDuracionRenovacion() }} meses</span>
              </div>

              <div class="flex justify-content-between">
                <span class="text-500">Nuevo período:</span>
                <span class="font-bold text-primary">
                  {{ formatFecha(renovacionForm.fecha_inicio) }} - {{ formatFecha(renovacionForm.fecha_fin) }}
                </span>
              </div>

              <div v-if="renovacionForm.fecha_inicio && renovacionForm.fecha_fin"
                class="flex justify-content-between mt-3 pt-3 border-top-1">
                <span class="text-500">Total estimado:</span>
                <span class="font-bold text-green-600 text-lg">
                  ${{ calcularTotalRenovacion() }}
                </span>
              </div>

              <div v-if="renovacionForm.motivo" class="mt-3 pt-3 border-top-1">
                <div class="text-500 mb-1">Motivo:</div>
                <div class="text-500">{{ renovacionForm.motivo }}</div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Información adicional -->
        <div class="p-3 border-round bg-blue-50">
          <div class="flex align-items-center">
            <i class="pi pi-info-circle text-blue-500 mr-2"></i>
            <div>
              <div class="font-medium">Importante</div>
              <div class="text-500 text-sm">
                • La renovación extenderá la vigencia de la inscripción actual<br>
                • Se mantendrán todos los horarios y configuraciones actuales<br>
                • El pago correspondiente se registrará por separado
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="renovando" class="text-center p-4">
        <ProgressSpinner style="width: 40px; height: 40px" />
        <p class="text-500 mt-2">Procesando renovación...</p>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" icon="pi pi-times" @click="dialogoRenovacion = false"
          :disabled="renovando" />
        <Button label="Confirmar Renovación" severity="success" icon="pi pi-check" @click="confirmarRenovacion"
          :loading="renovando" :disabled="!renovacionForm.fecha_inicio || !renovacionForm.fecha_fin || renovando" />
      </template>
    </Dialog>

    <Dialog v-model:visible="dialogoRegistroPago" header="Registrar Pago" :modal="true" :style="{ width: '500px' }">
      <div v-if="inscripcionParaPago">
        <!-- Información del estudiante -->
        <div class="mb-4 p-3 border-round bg-blue-50">
          <div class="flex align-items-center">
            <Avatar :label="getIniciales(inscripcionParaPago.estudiante)" class="mr-2" />
            <div>
              <div class="font-bold">{{ inscripcionParaPago.estudiante?.nombres }}
                {{ inscripcionParaPago.estudiante?.apellidos }}</div>
              <small class="text-500">Modalidad: {{ inscripcionParaPago.modalidad?.nombre }}</small>
            </div>
          </div>
        </div>

        <!-- Resumen financiero -->
        <div class="mb-4 grid">
          <div class="col-6">
            <div class="text-500 text-sm mb-1">Total inscripción</div>
            <div class="font-bold">${{ inscripcionParaPago.monto_mensual || 0 }}</div>
          </div>
          <div class="col-6">
            <div class="text-500 text-sm mb-1">Saldo pendiente</div>
            <div class="font-bold" :class="saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'">
              ${{ saldoPendiente.toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- Si es segunda cuota -->
        <div v-if="esSegundaCuota && pagoSeleccionado" class="mb-4 p-3 border-round bg-yellow-50">
          <div class="flex align-items-center">
            <i class="pi pi-info-circle text-yellow-500 mr-2"></i>
            <div>
              <div class="font-medium">Segunda cuota pendiente</div>
              <small class="text-500">Monto: ${{ pagoSeleccionado.monto }} |
                Vence: {{ formatFecha(pagoSeleccionado.fecha_vencimiento) }}</small>
            </div>
          </div>
        </div>

        <!-- Formulario -->
        <div class="mb-4">
          <div class="field mb-3">
            <label class="text-500 block mb-1">Monto a pagar *</label>
            <InputNumber v-model="montoPago" :min="0" :max="saldoPendiente" class="w-full"
              :class="{ 'p-invalid': montoPago <= 0 || montoPago > saldoPendiente }">
              <template #prefix>$</template>
            </InputNumber>
            <small v-if="montoPago <= 0" class="p-error">El monto debe ser mayor a 0</small>
            <small v-if="montoPago > saldoPendiente" class="p-error">
              No puede pagar más de ${{ saldoPendiente.toFixed(2) }}
            </small>
          </div>

          <div class="field mb-3">
            <label class="text-500 block mb-1">Método de pago *</label>
            <Dropdown v-model="metodoPago" :options="metodosPago" optionLabel="label" optionValue="value"
              placeholder="Seleccione método" class="w-full" :class="{ 'p-invalid': !metodoPago }" />
            <small v-if="!metodoPago" class="p-error">Seleccione un método de pago</small>
          </div>

          <div class="field mb-3">
            <label class="text-500 block mb-1">Fecha de pago</label>
            <Calendar v-model="fechaPago" dateFormat="dd/mm/yy" class="w-full" showIcon />
          </div>

          <div class="field mb-3">
            <label class="text-500 block mb-1">Observaciones</label>
            <Textarea v-model="observacion" rows="2" class="w-full" />
          </div>
        </div>

        <!-- Resumen -->
        <div v-if="montoPago > 0" class="p-3 border-round bg-green-50">
          <div class="grid">
            <div class="col-6">
              <div class="text-500 text-sm">Pagando ahora</div>
              <div class="font-bold text-green-600 text-xl">${{ montoPago.toFixed(2) }}</div>
            </div>
            <div class="col-6">
              <div class="text-500 text-sm">Saldo restante</div>
              <div class="font-bold text-blue-600">${{ (saldoPendiente - montoPago).toFixed(2) }}</div>
            </div>
          </div>
          <small class="text-500 block mt-2">
            Estado después del pago:
            <Tag :value="(saldoPendiente - montoPago) <= 0 ? 'Completamente pagado' : 'Pago parcial'"
              :severity="(saldoPendiente - montoPago) <= 0 ? 'success' : 'warning'" />
          </small>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="cancelarRegistroPago" />
        <Button label="Registrar Pago" severity="success" @click="registrarPagoReal"
      :disabled="!montoPago || montoPago <= 0 || !metodoPago" />
      </template>
    </Dialog>


  </div>
  <Toast />
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';

// Importar servicios
import inscripcionService from '@/services/inscripcion.service';
import estudianteService from '@/services/estudiante.service';
import horarioService from '@/services/horario.service';
import pagoService from '@/services/pago.service';
import modalidadService from '@/services/modalidad.service'
import clasesProgramadasService from '@/services/clasesProgramadas.service';


// Importar componentes PrimeVue
import Stepper from 'primevue/stepper';
import StepperPanel from 'primevue/stepperpanel';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Dropdown from 'primevue/dropdown';
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Dialog from 'primevue/dialog';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';
import Chip from 'primevue/chip';

const toast = useToast();

// Estados principales
const inscripciones = ref([]);
const estudiantes = ref([]);

// Estados para filtros
const buscar = ref('');
const filtroEstado = ref(null);

// Estados para diálogo de nueva inscripción
const dialogoInscripcion = ref(false);
const pasoActual = ref(0);
const tituloDialogo = ref('Nueva Inscripción');
const estudianteSeleccionado = ref(null);
const buscarEstudiante = ref('');
const inscripcionForm = ref({
  fecha_inicio: new Date(),
  fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)) // 1 mes por defecto
});
const guardando = ref(false);

// Estados para carga
const cargando = ref(false);
const cargandoEstudiantes = ref(false);

const horariosDisponibles = ref([]);
const horariosSeleccionados = ref([]);
const horariosSeleccionadosDetalles = ref([]);
const hoy = ref(new Date());
const filtroDisciplina = ref(null);

const modalidades = ref([])
const filtroModalidad = ref(null)

const dialogoDetalles = ref(false);
const dialogoRenovacion = ref(false);
const inscripcionSeleccionada = ref(null);
const inscripcionARenovar = ref(null);
const tituloDetalles = ref('Detalles de Inscripción');
const renovando = ref(false);

const renovacionForm = ref({
  fecha_inicio: new Date(),
  fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  motivo: 'Renovación mensual'
});


const cargandoHorarios = ref(false);
const cargandoModalidades = ref(false);

const dividirPago = ref(false);

const pagoForm = ref({
  monto: 0,
  metodo_pago: null,
  fecha_pago: new Date(),
  observacion: ''
});

// Opciones para métodos de pago
const metodosPago = ref([
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'QR', value: 'qr' },
  { label: 'Tarjeta de Crédito/Débito', value: 'tarjeta' },
  { label: 'Transferencia Bancaria', value: 'transferencia' }
]);

// Estadísticas
const estadisticas = ref({
  totalActivas: 0,
  porVencer: 0,
  clasesHoy: 0,
  ingresosMes: 0
});

// Opciones para filtros
const opcionesEstado = ref([
  { label: 'Activo', value: 'activo' },
  { label: 'Suspendido', value: 'suspendido' },
  { label: 'Vencido', value: 'vencido' },
  { label: 'Inactivo', value: 'inactivo' }
]);

const configAlertas = {
  umbrales: [3, 2, 1], // Clases restantes que activan alerta
  mostrarToast: true,   // Mostrar notificaciones toast
  mostrarEnTabla: true, // Mostrar indicadores en tabla
  enviarCorreo: false   // Activar para enviar correos automáticos
};

const alertasMostradas = ref({});

const dialogoRegistroPago = ref(false);
const inscripcionParaPago = ref(null);
const pagosPendientes = ref([]);
const pagoSeleccionado = ref(null);
const montoPago = ref(0);
const metodoPago = ref(null);
const fechaPago = ref(new Date());
const observacion = ref('');
const saldoPendiente = ref(0);
const esSegundaCuota = ref(false);


const montoTotalInscripcion = ref(0);
const totalPagado = ref(0);
const saldoPendienteCalculado = ref(0);
const cargandoPago = ref(false);

// Computed properties
const inscripcionesFiltradas = computed(() => {
  let filtradas = inscripciones.value;

  // Filtro por búsqueda
  if (buscar.value) {
    const search = buscar.value.toLowerCase();
    filtradas = filtradas.filter(i => {
      const estudiante = i.estudiante || {};
      return (
        estudiante.nombres?.toLowerCase().includes(search) ||
        estudiante.ci?.toLowerCase().includes(search)
      );
    });
  }

  // Filtro por estado
  if (filtroEstado.value) {
    filtradas = filtradas.filter(i => i.estado === filtroEstado.value);
  }

  return filtradas;
});

const inscripcionesPorVencer = computed(() => {
  return inscripciones.value.filter(i =>
    i.estado === 'activo' && i.dias_restantes <= 7 && i.dias_restantes > 0
  );
});

const inscripcionesInactivas = computed(() => {
  return inscripciones.value.filter(i =>
    ['suspendido', 'inactivo', 'vencido'].includes(i.estado)
  );
});



const estudiantesFiltrados = computed(() => {
  if (!buscarEstudiante.value.trim()) {
    return estudiantes.value;
  }

  const search = buscarEstudiante.value.toLowerCase().trim();
  return estudiantes.value.filter(est => {
    const nombre = est.nombres?.toLowerCase() || '';
    const ci = est.ci?.toLowerCase() || '';
    const telefono = est.telefono?.toLowerCase() || '';
    const correo = est.correo?.toLowerCase() || '';

    return nombre.includes(search) ||
      ci.includes(search) ||
      telefono.includes(search) ||
      correo.includes(search);
  });
});

const inscripcionesActivasEstudiante = computed(() => {
  if (!estudianteSeleccionado.value) {
    return [];
  }

  const estudianteId = estudianteSeleccionado.value.id;
  return inscripciones.value.filter(i =>
    i.estudiante_id === estudianteId && i.estado === 'activo'
  );
});

// Variables reactivas nuevas
const modalidadSeleccionada = ref(null);
const maxHorariosPorModalidad = null; // o lo que definas

// Funciones nuevas
function seleccionarModalidad(modalidad) {
  modalidadSeleccionada.value = modalidad;
  // Resetear horarios seleccionados cuando cambia modalidad
  horariosSeleccionados.value = [];
  horariosSeleccionadosDetalles.value = [];
}

function calcularClasesSemanales(clasesMensuales) {
  // 4.33 semanas promedio por mes
  return Math.round(clasesMensuales / 4.33);
}

async function renovacionCompleta(inscripcionId, datosRenovacion) {
  // DATOS DE ENTRADA
  const {
    fecha_inicio: fechaInicioNueva,
    fecha_fin: fechaFinNueva,
    motivo
  } = datosRenovacion;

  // 1. OBTENER INSCRIPCIÓN ACTUAL CON SUS RELACIONES
  const inscripcionActual = await Inscripcion
    .with(['estudiante', 'modalidad', 'inscripcion_horarios.horario'])
    .find(inscripcionId);

  if (!inscripcionActual) {
    throw new Error('Inscripción no encontrada');
  }

  // 2. CREAR NUEVA INSCRIPCIÓN (NUEVO REGISTRO)
  const nuevaInscripcion = await Inscripcion.create({
    // Datos del estudiante y modalidad (copiados)
    estudiante_id: inscripcionActual.estudiante_id,
    modalidad_id: inscripcionActual.modalidad_id,
    sucursal_id: inscripcionActual.sucursal_id,
    entrenador_id: inscripcionActual.entrenador_id,

    // Nuevas fechas del período renovado
    fecha_inicio: fechaInicioNueva,
    fecha_fin: fechaFinNueva,

    // Clases COMPLETAMENTE NUEVAS según modalidad
    clases_totales: inscripcionActual.modalidad.clases_mensuales,
    clases_asistidas: 0, // ¡CERO porque es NUEVA!
    permisos_usados: 0,  // ¡CERO porque es NUEVA!
    permisos_disponibles: inscripcionActual.modalidad.permisos_maximos,

    // Precio
    monto_mensual: inscripcionActual.modalidad.precio_mensual,

    // Estado
    estado: 'activo',

    // Relación con inscripción anterior (opcional, para historial)
    // Nota: Tu tabla no tiene estos campos, puedes agregarlos o usar un campo "observaciones"
    observaciones: `Renovación de inscripción #${inscripcionId}. Motivo: ${motivo}`
  });

  // 3. COPIAR HORARIOS DE LA INSCRIPCIÓN ANTERIOR
  for (const inscripcionHorario of inscripcionActual.inscripcion_horarios) {
    // Crear NUEVO registro en inscripcion_horarios
    const nuevoInscripcionHorario = await InscripcionHorario.create({
      inscripcion_id: nuevaInscripcion.id,
      horario_id: inscripcionHorario.horario_id,

      // Clases TOTALMENTE NUEVAS (basadas en modalidad)
      clases_totales: Math.floor(
        inscripcionActual.modalidad.clases_mensuales /
        inscripcionActual.inscripcion_horarios.length
      ),
      clases_asistidas: 0,  // ¡CERO!
      clases_restantes: Math.floor(
        inscripcionActual.modalidad.clases_mensuales /
        inscripcionActual.inscripcion_horarios.length
      ),

      permisos_usados: 0,  // ¡CERO!
      fecha_inicio: fechaInicioNueva,
      fecha_fin: fechaFinNueva,
      estado: 'activo'
    });

    // 4. GENERAR NUEVAS CLASES PROGRAMADAS para este horario
    await generarClasesProgramadasParaHorario(
      nuevaInscripcion.id,
      nuevoInscripcionHorario.id,
      inscripcionHorario.horario_id,
      inscripcionActual.estudiante_id,
      fechaInicioNueva,
      fechaFinNueva,
      inscripcionHorario.horario
    );
  }

  // 5. ACTUALIZAR INSCRIPCIÓN ANTERIOR (NO eliminar, solo marcar)
  await Inscripcion.update(inscripcionId, {
    estado: 'renovado',  // Cambiar de 'activo' a 'renovado'
    // Puedes agregar: fecha_renovacion: new Date(),
    observaciones: `Renovada el ${new Date().toISOString().split('T')[0]}. Nueva inscripción: #${nuevaInscripcion.id}`
  });

  // 6. REGISTRAR NUEVO PAGO (OBLIGATORIO - NUEVO REGISTRO)
  const mesesDuracion = calcularMesesDuracion(fechaInicioNueva, fechaFinNueva);
  const nuevoPago = await Pago.create({
    inscripcion_id: nuevaInscripcion.id,
    estudiante_id: inscripcionActual.estudiante_id,
    monto: inscripcionActual.modalidad.precio_mensual * mesesDuracion,
    metodo_pago: datosRenovacion.metodo_pago || 'efectivo',
    fecha_pago: new Date(),
    observacion: `Pago por renovación de inscripción #${inscripcionId} a #${nuevaInscripcion.id}. Período: ${fechaInicioNueva} al ${fechaFinNueva}`,
    estado: 'pagado',
    referencia: `REN-${inscripcionId}-${nuevaInscripcion.id}-${Date.now()}`
  });

  return {
    success: true,
    mensaje: '✅ Renovación completada exitosamente',
    datos: {
      inscripcion_anterior_id: inscripcionId,
      nueva_inscripcion_id: nuevaInscripcion.id,
      nuevo_pago_id: nuevoPago.id,
      fecha_inicio_nueva: fechaInicioNueva,
      fecha_fin_nueva: fechaFinNueva,
      monto_pagado: nuevoPago.monto,
      clases_generadas: inscripcionActual.modalidad.clases_mensuales,
      horarios_mantenidos: inscripcionActual.inscripcion_horarios.length
    }
  };
}


async function generarClasesProgramadasParaHorario(
  inscripcionId,
  inscripcionHorarioId,
  horarioId,
  estudianteId,
  fechaInicio,
  fechaFin,
  horario
) {
  const clasesGeneradas = [];
  let fechaActual = new Date(fechaInicio);
  const fechaFinDate = new Date(fechaFin);

  // Mapeo de días de la semana
  const diasMap = {
    'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4,
    'viernes': 5, 'sábado': 6, 'domingo': 0
  };

  const diaSemanaHorario = diasMap[horario.dia_semana.toLowerCase()];

  // Generar clases para cada día del período
  while (fechaActual <= fechaFinDate) {
    if (fechaActual.getDay() === diaSemanaHorario) {
      const claseProgramada = await ClaseProgramada.create({
        inscripcion_horario_id: inscripcionHorarioId,
        horario_id: horarioId,
        inscripcion_id: inscripcionId,
        estudiante_id: estudianteId,
        fecha: fechaActual.toISOString().split('T')[0],
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        estado_clase: 'programada',
        es_recuperacion: false,
        cuenta_para_asistencia: true
      });

      clasesGeneradas.push(claseProgramada);
    }

    // Siguiente día
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return clasesGeneradas;
}




// Agrega esta función para calcular días reales
function calcularClasesPorHorario() {
  if (horariosSeleccionadosDetalles.value.length === 0) return [];

  const inicio = inscripcionForm.value.fecha_inicio;
  const fin = inscripcionForm.value.fecha_fin;

  if (!inicio || !fin) return [];

  const fechaInicio = new Date(inicio);
  const fechaFin = new Date(fin);

  // Mapeo de días de semana a números
  const diasSemana = {
    'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'domingo': 0
  };

  // Contador para cada horario
  const contador = {};
  horariosSeleccionadosDetalles.value.forEach(h => {
    contador[h.id] = {
      dia_semana: h.dia_semana.toLowerCase(),
      dia_numero: diasSemana[h.dia_semana.toLowerCase()] || 0,
      clases: 0,
      horario: h
    };
  });

  // Recorrer cada día del período
  let fechaActual = new Date(fechaInicio);
  while (fechaActual <= fechaFin) {
    const diaNumero = fechaActual.getDay(); // 0=Domingo, 1=Lunes, etc.

    // Verificar si este día coincide con algún horario seleccionado
    horariosSeleccionadosDetalles.value.forEach(horario => {
      const diaHorario = diasSemana[horario.dia_semana.toLowerCase()] || 0;
      if (diaNumero === diaHorario) {
        contador[horario.id].clases++;
      }
    });

    // Avanzar al siguiente día
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  // Convertir a array y retornar solo las clases
  return horariosSeleccionadosDetalles.value.map(h => {
    return {
      horario: h,
      clases: contador[h.id]?.clases || 0
    };
  });
}

// 2. Reemplaza la función getDistribucionEstimada() con esta versión mejorada:
function getDistribucionEstimada() {
  const distribucionReal = calcularClasesPorHorario();
  const clasesTotales = calcularClasesTotales();

  console.log('📊 Distribución real calculada:', distribucionReal);
  console.log('📊 Clases totales de modalidad:', clasesTotales);

  // Si no hay distribución real (fechas no seleccionadas), usar cálculo proporcional
  if (distribucionReal.length === 0 || distribucionReal.every(d => d.clases === 0)) {
    const totalHorarios = horariosSeleccionadosDetalles.value.length;
    if (totalHorarios === 0) return [];

    const base = Math.floor(clasesTotales / totalHorarios);
    const extra = clasesTotales % totalHorarios;

    return horariosSeleccionadosDetalles.value.map((h, i) => {
      return {
        horario: h,
        clases: i < extra ? base + 1 : base
      };
    });
  }

  return distribucionReal;
}

// 3. Actualiza la función getDistribucionArray() para usar el cálculo real:

function validarYContinuar() {
  if (!modalidadSeleccionada.value) {
    toast.add({
      severity: 'error',
      summary: 'Seleccione modalidad',
      detail: 'Debe seleccionar una modalidad primero',
      life: 3000
    });
    return;
  }

  if (horariosSeleccionados.value.length === 0) {
    toast.add({
      severity: 'error',
      summary: 'Seleccione horarios',
      detail: 'Debe seleccionar al menos un horario',
      life: 3000
    });
    return;
  }

  // Verificar que los horarios pertenezcan a la modalidad seleccionada
  const horariosInvalidos = horariosSeleccionadosDetalles.value.filter(
    h => h.modalidad_id !== modalidadSeleccionada.value.id
  );

  if (horariosInvalidos.length > 0) {
    toast.add({
      severity: 'warn',
      summary: 'Horarios no válidos',
      detail: 'Algunos horarios no pertenecen a la modalidad seleccionada',
      life: 4000
    });
    return;
  }

  // ========== NUEVA VALIDACIÓN: Verificar inscripciones previas ==========
  const verificacionInscripciones = verificarInscripcionesPrevias();

  if (verificacionInscripciones.tieneConflictos) {
    // Mostrar todos los conflictos encontrados
    const mensajeConflictos = verificacionInscripciones.conflictos.map(c => c.mensaje).join('\n');

    toast.add({
      severity: 'error',
      summary: 'Estudiante ya inscrito',
      detail: `El estudiante ya tiene inscripciones en:\n${mensajeConflictos}\n\nSeleccione otros horarios.`,
      life: 8000
    });
    return;
  }

  // Continuar al paso de confirmación
  pasoActual.value = 3;
}

// FUNCIONES PRINCIPALES
async function cargarDatos() {
  cargando.value = true;
  try {
    console.log('=== CARGANDO INSCRIPCIONES ===');
    const response = await inscripcionService.index(1, 100, "");

    let datosInscripciones = [];

    if (response.data && response.data.success) {
      if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        datosInscripciones = response.data.data.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        datosInscripciones = response.data.data;
      } else if (Array.isArray(response.data.data)) {
        datosInscripciones = response.data.data;
      }
    } else if (Array.isArray(response.data)) {
      datosInscripciones = response.data;
    }

    console.log(`📥 Datos extraídos: ${datosInscripciones.length} inscripciones`);

    // Procesar datos básicos
    inscripciones.value = procesarInscripciones(datosInscripciones);

    // ========== NUEVO: CARGAR PAGOS PENDIENTES ==========
    console.log('💰 Cargando pagos pendientes para todas las inscripciones...');
    
    // Usar Promise.all para cargar pagos en paralelo (más rápido)
    const promesasPagos = inscripciones.value.map(async (inscripcion) => {
      await cargarPagosPendientesParaInscripcion(inscripcion);
    });
    
    await Promise.all(promesasPagos);
    
    console.log(`✅ Pagos cargados para ${inscripciones.value.length} inscripciones`);

    // ========== NUEVO: VERIFICAR ALERTAS ==========
    console.log('🔍 Verificando alertas de clases...');

    const inscripcionesConAlerta = [];

    inscripciones.value.forEach(inscripcion => {
      const verificacion = verificarEstadoClases(inscripcion);

      if (verificacion.necesitaAlerta) {
        inscripcionesConAlerta.push({
          inscripcion: inscripcion,
          verificacion: verificacion
        });

        console.log(`🚨 ALERTA: ${inscripcion.estudiante?.nombres || 'Estudiante'} - ${verificacion.mensaje}`);
      }
    });

    // Mostrar alertas en UI
    if (inscripcionesConAlerta.length > 0) {
      mostrarAlertasUI(inscripciones.value);

      // También mostrar en consola para debug
      console.log('📊 RESUMEN ALERTAS:');
      inscripcionesConAlerta.forEach((item, index) => {
        const estudiante = item.inscripcion.estudiante;
        console.log(`${index + 1}. ${estudiante?.nombres || 'Estudiante'}: ${item.verificacion.mensaje}`);
        console.log(`   📊 ${item.verificacion.datos.asistidas}/${item.verificacion.datos.total} clases (${item.verificacion.datos.restantes} restantes)`);
      });
    } else {
      console.log('✅ No hay alertas de clases pendientes');
    }

    // Calcular estadísticas
    calcularEstadisticas();

    // Mostrar resumen final
    console.log('🎉 CARGA COMPLETADA:', {
      totalInscripciones: inscripciones.value.length,
      activas: estadisticas.value.totalActivas,
      enMora: inscripciones.value.filter(i => i.estado === 'en_mora').length,
      porVencer: estadisticas.value.porVencer,
      alertas: inscripcionesConAlerta.length
    });

  } catch (error) {
    console.error('❌ Error cargando datos:', error);
    
    let mensajeError = 'No se pudieron cargar las inscripciones';
    if (error.response) {
      console.error('📥 Detalles del error:', {
        status: error.response.status,
        data: error.response.data
      });
      
      if (error.response.status === 401) {
        mensajeError = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
      } else if (error.response.status === 500) {
        mensajeError = 'Error interno del servidor';
      } else if (error.response.data?.message) {
        mensajeError = error.response.data.message;
      }
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensajeError,
      life: 5000
    });
    
    // Si hay error pero tenemos datos viejos, mantenerlos
    if (inscripciones.value.length > 0) {
      console.warn('⚠️ Usando datos almacenados debido a error de carga');
      toast.add({
        severity: 'warn',
        summary: 'Datos limitados',
        detail: 'Mostrando datos almacenados localmente',
        life: 3000
      });
    }
  } finally {
    cargando.value = false;
  }
}

// ========== FUNCIONES AUXILIARES PARA CARGAR PAGOS ==========

async function cargarPagosPendientesParaInscripcion(inscripcion) {
  try {
    console.log(`💰 Cargando pagos para inscripción ${inscripcion.id}...`);
    
    // DEBUG: Mostrar información de la inscripción
    console.log('📊 Info inscripción:', {
      id: inscripcion.id,
      estado: inscripcion.estado,
      monto_mensual: inscripcion.monto_mensual,
      estudiante_id: inscripcion.estudiante_id
    });

    // Llamada directa a la API si el servicio no funciona
    let response;
    try {
      // Intento 1: Usar el servicio
      response = await pagoService.index(1, 100, {
        inscripcion_id: inscripcion.id
      });
    } catch (serviceError) {
      console.log('🔄 Servicio falló, intentando API directa...');
      // Intento 2: Llamada directa a la API
      const token = localStorage.getItem('token') || '';
      const apiResponse = await fetch(`/api/pagos?inscripcion_id=${inscripcion.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!apiResponse.ok) throw new Error('API falló');
      response = { data: await apiResponse.json() };
    }

    console.log('📥 Respuesta de pagos:', response);

    let todosLosPagos = [];
    
    // Extraer datos con más opciones
    if (response && response.data) {
      // Opción 1: Respuesta estándar Laravel
      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        todosLosPagos = response.data.data;
      }
      // Opción 2: Array directo en data
      else if (Array.isArray(response.data.data)) {
        todosLosPagos = response.data.data;
      }
      // Opción 3: Array directo en raíz
      else if (Array.isArray(response.data)) {
        todosLosPagos = response.data;
      }
      // Opción 4: Con paginación Laravel
      else if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        todosLosPagos = response.data.data.data;
      }
      // Opción 5: Respuesta directa de API
      else if (Array.isArray(response)) {
        todosLosPagos = response;
      }
    }

    console.log(`💰 Encontrados ${todosLosPagos.length} pagos para inscripción ${inscripcion.id}`);

    if (todosLosPagos.length > 0) {
      console.log('📋 Detalles de pagos:', todosLosPagos.map(p => ({
        id: p.id,
        monto: p.monto,
        estado: p.estado,
        metodo_pago: p.metodo_pago,
        fecha_vencimiento: p.fecha_vencimiento,
        observacion: p.observacion
      })));
    }

    // Filtrar pagos pendientes y vencidos
    const pagosPendientes = todosLosPagos.filter(pago => 
      pago.estado === 'pendiente' || pago.estado === 'vencido'
    );

    // Calcular total pagado
    const pagosPagados = todosLosPagos.filter(pago => pago.estado === 'pagado');
    const totalPagado = pagosPagados.reduce((total, pago) => {
      return total + (parseFloat(pago.monto) || 0);
    }, 0);

    // Calcular saldo pendiente
    const saldoPendiente = pagosPendientes.reduce((total, pago) => {
      return total + (parseFloat(pago.monto) || 0);
    }, 0);

    console.log(`💰 Resumen financiero inscripción ${inscripcion.id}:`, {
      totalPagos: todosLosPagos.length,
      pagosPendientes: pagosPendientes.length,
      totalPagado: totalPagado,
      saldoPendiente: saldoPendiente,
      montoMensual: inscripcion.monto_mensual
    });

    // Buscar la inscripción en el array
    const index = inscripciones.value.findIndex(i => i.id === inscripcion.id);
    if (index === -1) {
      console.warn(`⚠️ Inscripción ${inscripcion.id} no encontrada en el array`);
      return;
    }

    // Determinar si hay segunda cuota pendiente
    const segundaCuota = pagosPendientes.find(p => 
      p.es_parcial === true || 
      p.numero_cuota === 2 ||
      (p.observacion && (
        p.observacion.toLowerCase().includes('segunda') ||
        p.observacion.toLowerCase().includes('cuota') ||
        p.observacion.toLowerCase().includes('saldo')
      ))
    );

    // Determinar estado
    let nuevoEstado = inscripciones.value[index].estado;
    if (saldoPendiente > 0 && nuevoEstado === 'activo') {
      nuevoEstado = 'en_mora';
      console.log(`🔴 Marcando inscripción ${inscripcion.id} como EN MORA por saldo pendiente`);
    }

    // Calcular días de mora
    const diasMora = calcularDiasMoraPorPagos(pagosPendientes);

    // Actualizar la inscripción
    inscripciones.value[index] = {
      ...inscripciones.value[index],
      estado: nuevoEstado,
      saldo_pendiente: saldoPendiente,
      pagos_pendientes: pagosPendientes,
      dias_mora: diasMora,
      total_pagado: totalPagado,
      tiene_segunda_cuota: !!segundaCuota,
      segunda_cuota: segundaCuota || null,
      estado_pago: saldoPendiente > 0 ? 'pendiente' : 'al_dia',
      pagos_cargados: true,
      error_carga_pagos: false
    };

    console.log(`✅ Inscripción ${inscripcion.id} actualizada:`, {
      estado: inscripciones.value[index].estado,
      saldo: inscripciones.value[index].saldo_pendiente,
      tieneSegundaCuota: inscripciones.value[index].tiene_segunda_cuota,
      diasMora: inscripciones.value[index].dias_mora
    });

  } catch (error) {
    console.error(`❌ Error cargando pagos para inscripción ${inscripcion.id}:`, error);
    
    // Marcar como error en la inscripción
    const index = inscripciones.value.findIndex(i => i.id === inscripcion.id);
    if (index !== -1) {
      inscripciones.value[index] = {
        ...inscripciones.value[index],
        pagos_cargados: false,
        error_carga_pagos: true,
        error_mensaje: error.message
      };
    }
  }
}

function calcularDiasMoraPorPagos(pagosPendientes) {
  if (!pagosPendientes || pagosPendientes.length === 0) return 0;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let mayorDiasMora = 0;

  pagosPendientes.forEach(pago => {
    let fechaReferencia = null;
    
    // Usar fecha_vencimiento si existe, sino usar fecha_creacion
    if (pago.fecha_vencimiento) {
      fechaReferencia = new Date(pago.fecha_vencimiento);
    } else if (pago.created_at) {
      fechaReferencia = new Date(pago.created_at);
      // Asumir que si no tiene fecha_vencimiento, vence 15 días después de creado
      fechaReferencia.setDate(fechaReferencia.getDate() + 15);
    } else {
      return; // No hay fecha de referencia
    }
    
    fechaReferencia.setHours(0, 0, 0, 0);
    
    const diffMs = hoy - fechaReferencia;
    const diasMora = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diasMora > mayorDiasMora) {
      mayorDiasMora = diasMora;
    }
  });

  return Math.max(0, mayorDiasMora);
}

// ========== FUNCIÓN MEJORADA PARA PROCESAR INSCRIPCIONES ==========

function procesarInscripciones(data) {
  if (!Array.isArray(data)) {
    console.error('Datos de inscripciones no es un array:', data);
    return [];
  }

  return data.map(insc => {
    try {
      // Calcular días restantes
      const diasRestantes = calcularDiasRestantes(insc.fecha_fin);

      // Extraer campos de pago del objeto original
      const saldoPendiente = parseFloat(insc.saldo_pendiente) || 0;
      const diasMora = parseInt(insc.dias_mora) || 0;
      const totalPagado = parseFloat(insc.total_pagado) || 0;

      // Determinar estado inicial
      let estadoFinal = (insc.estado || 'activo').toLowerCase();
      
      // Si el backend ya indica que está en mora, respetarlo
      if (estadoFinal === 'en_mora' || estadoFinal === 'mora') {
        estadoFinal = 'en_mora';
      }
      // Si tiene saldo pendiente pero está marcado como activo, cambiar a en_mora
      else if (saldoPendiente > 0 && estadoFinal === 'activo') {
        estadoFinal = 'en_mora';
      }

      // Determinar estado de pago
      let estadoPago = 'al_dia';
      if (saldoPendiente > 0) {
        estadoPago = 'pendiente';
      } else if (totalPagado > 0) {
        estadoPago = 'pagado';
      }

      // Calcular clases restantes
      let clasesRestantesCalculadas = 0;
      if (insc.clases_restantes_calculadas !== undefined) {
        clasesRestantesCalculadas = parseInt(insc.clases_restantes_calculadas) || 0;
      } else if (insc.clases_restantes !== undefined) {
        clasesRestantesCalculadas = parseInt(insc.clases_restantes) || 0;
      }

      // Calcular clases asistidas y totales
      const clasesAsistidas = parseInt(insc.clases_asistidas) || 0;
      let clasesTotales = parseInt(insc.clases_totales) || 0;
      
      // Si no tiene clases_totales, calcular basado en modalidad
      if (clasesTotales === 0 && insc.modalidad?.clases_mensuales) {
        const mesesDuracion = calcularMesesDuracionInscripcion(insc);
        clasesTotales = insc.modalidad.clases_mensuales * mesesDuracion;
      }

      // Si clasesRestantesCalculadas es 0 pero debería tener, calcularlo
      if (clasesRestantesCalculadas === 0 && clasesTotales > 0) {
        clasesRestantesCalculadas = Math.max(0, clasesTotales - clasesAsistidas);
      }

      // Verificar si es segunda cuota
      const esSegundaCuota = insc.es_segunda_cuota || 
        (insc.observaciones && insc.observaciones.toLowerCase().includes('segunda')) ||
        false;

      return {
        ...insc,
        // Campos principales
        id: parseInt(insc.id) || 0,
        estudiante_id: parseInt(insc.estudiante_id) || 0,
        modalidad_id: parseInt(insc.modalidad_id) || 0,
        
        // Fechas
        fecha_inicio: insc.fecha_inicio || null,
        fecha_fin: insc.fecha_fin || null,
        dias_restantes: diasRestantes,
        
        // Estado
        estado: estadoFinal,
        estado_pago: estadoPago,
        
        // Información financiera
        monto_mensual: parseFloat(insc.monto_mensual) || 0,
        saldo_pendiente: saldoPendiente,
        total_pagado: totalPagado,
        dias_mora: diasMora,
        es_segunda_cuota: esSegundaCuota,
        
        // Clases
        clases_totales: clasesTotales,
        clases_asistidas: clasesAsistidas,
        clases_restantes_calculadas: clasesRestantesCalculadas,
        
        // Permisos
        permisos_usados: parseInt(insc.permisos_usados) || 0,
        permisos_disponibles: parseInt(insc.permisos_disponibles) || 
          (insc.modalidad?.permisos_maximos || 3),
        
        // Relaciones (asegurar que existan)
        estudiante: insc.estudiante || { 
          nombres: 'Desconocido', 
          apellidos: '', 
          ci: '',
          telefono: '',
          correo: ''
        },
        modalidad: insc.modalidad || { 
          nombre: 'Sin modalidad', 
          clases_mensuales: 12, 
          precio_mensual: 0,
          permisos_maximos: 3
        },
        
        // Arrays
        horarios: Array.isArray(insc.horarios) ? insc.horarios : [],
        inscripcion_horarios: Array.isArray(insc.inscripcion_horarios) ? insc.inscripcion_horarios : [],
        pagos_pendientes: Array.isArray(insc.pagos_pendientes) ? insc.pagos_pendientes : [],
        
        // Metadata
        created_at: insc.created_at || null,
        updated_at: insc.updated_at || null,
        observaciones: insc.observaciones || ''
      };
      
    } catch (error) {
      console.error(`❌ Error procesando inscripción ${insc.id}:`, error);
      return null;
    }
  }).filter(insc => insc !== null); // Filtrar nulos
}

async function enviarCorreoAlertaClases(inscripcion, verificacion) {
  if (!configAlertas.enviarCorreo) return;

  try {
    const estudianteEmail = inscripcion.estudiante?.correo || inscripcion.estudiante?.email;

    if (!estudianteEmail) {
      console.warn(`⚠️ No se puede notificar: estudiante sin email`);
      return;
    }

    const datosCorreo = {
      estudiante_id: inscripcion.estudiante_id,
      estudiante_email: estudianteEmail,
      estudiante_nombre: `${inscripcion.estudiante?.nombres || ''} ${inscripcion.estudiante?.apellidos || ''}`.trim(),
      inscripcion_id: inscripcion.id,
      clases_restantes: verificacion.datos.restantes,
      clases_totales: verificacion.datos.total,
      clases_asistidas: verificacion.datos.asistidas,
      nivel_alerta: verificacion.nivel,
      fecha_vencimiento: inscripcion.fecha_fin,
      modalidad: inscripcion.modalidad?.nombre || 'Sin modalidad'
    };

    console.log('📧 Enviando correo de alerta:', datosCorreo);

    // Aquí pondrías tu llamada a la API para enviar el correo
    /*
    const response = await fetch('/api/notificaciones/clases-bajas', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosCorreo)
    });
    */

  } catch (error) {
    console.error('❌ Error enviando correo:', error);
  }
}

function mostrarAlertasEnUI(inscripcionesParaNotificar) {
  // Crear mensaje consolidado
  let mensajeConsolidado = `📢 ${inscripcionesParaNotificar.length} estudiante(s) cerca de completar sus clases:\n\n`;

  inscripcionesParaNotificar.forEach((item, index) => {
    const estudiante = item.inscripcion.estudiante;
    const nombre = estudiante ? `${estudiante.nombres} ${estudiante.apellidos}` : 'Estudiante';

    mensajeConsolidado += `${index + 1}. ${nombre}: ${item.verificacion.mensaje}\n`;
    mensajeConsolidado += `   📅 Clases: ${item.verificacion.datos.asistidas}/${item.verificacion.datos.total} (${item.verificacion.datos.restantes} restantes)\n\n`;
  });

  // Mostrar toast
  toast.add({
    severity: 'warn',
    summary: 'Alerta de Clases',
    detail: mensajeConsolidado,
    life: 8000
  });

  // También mostrar en consola para debug
  console.log('📢 Alertas de clases bajas:');
  console.log(mensajeConsolidado);
}

async function verDetalles(inscripcion) {
  try {
    cargando.value = true;

    // Limpiar selección previa
    inscripcionSeleccionada.value = null;

    // Mostrar mensaje de carga
    toast.add({
      severity: 'info',
      summary: 'Cargando...',
      detail: 'Obteniendo detalles de la inscripción',
      life: 2000
    });

    // Cargar datos completos de la inscripción
    const response = await inscripcionService.show(inscripcion.id);

    let datosCompletos = null;

    // Procesar la respuesta según tu API
    if (response.data) {
      if (response.data.success && response.data.data) {
        datosCompletos = response.data.data;
      } else if (response.data.data) {
        datosCompletos = response.data.data;
      } else if (Array.isArray(response.data)) {
        datosCompletos = response.data[0];
      } else {
        datosCompletos = response.data;
      }
    }

    if (!datosCompletos) {
      throw new Error('No se obtuvieron datos de la inscripción');
    }

    // Procesar los datos para la vista
    datosCompletos = procesarInscripcionParaDetalles(datosCompletos);

    // Asegurar que tenga los campos necesarios
    if (!datosCompletos.dias_restantes) {
      datosCompletos.dias_restantes = calcularDiasRestantes(datosCompletos.fecha_fin);
    }

    // Asignar los datos procesados
    inscripcionSeleccionada.value = datosCompletos;

    // Configurar título
    tituloDetalles.value = `Inscripción #${inscripcion.id} - ${datosCompletos.estudiante?.nombres || 'Estudiante'}`;

    // Abrir diálogo
    dialogoDetalles.value = true;

    console.log('✅ Detalles cargados:', datosCompletos);

  } catch (error) {
    console.error('❌ Error al ver detalles:', error);

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudieron cargar los detalles: ${error.message}`,
      life: 4000
    });

    // Fallback: usar datos básicos si hay error
    inscripcionSeleccionada.value = procesarInscripcionParaDetalles(inscripcion);
    tituloDetalles.value = `Inscripción #${inscripcion.id}`;
    dialogoDetalles.value = true;
  } finally {
    cargando.value = false;
  }
}

// Funciones para manejar estados de clases programadas
function getEstadoClaseLabel(estado) {
  const map = {
    'programada': 'Programada',
    'realizada': 'Realizada',
    'ausente': 'Ausente',
    'justificada': 'Justificada',
    'cancelada': 'Cancelada',
    'feriado': 'Feriado',
    'recuperacion': 'Recuperación'
  };
  return map[estado] || estado;
}

function getEstadoClaseSeverity(estado) {
  const map = {
    'programada': 'info',
    'realizada': 'success',
    'ausente': 'danger',
    'justificada': 'warning',
    'cancelada': 'secondary',
    'feriado': 'help',
    'recuperacion': 'info'
  };
  return map[estado] || 'info';
}

// Función para generar clases para una inscripción específica
async function generarClasesParaInscripcion(inscripcionId) {
  try {
    const response = await axios.post(
      `/api/inscripciones/${inscripcionId}/generar-clases-programadas`,
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );

    if (response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Clases generadas',
        detail: `Se generaron ${response.data.total_clases} clases programadas`,
        life: 3000
      });

      // Recargar los detalles si estamos viendo esta inscripción
      if (inscripcionSeleccionada.value?.id === inscripcionId) {
        await verDetalles(inscripcionSeleccionada.value);
      }
    }
  } catch (error) {
    console.error('Error generando clases:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron generar las clases programadas',
      life: 3000
    });
  }
}


function procesarInscripcionParaDetalles(inscripcion) {
  console.log('🔄 Procesando inscripción para detalles:', inscripcion.id);

  // Calcular total de clases asistidas si no existe
  let clasesAsistidas = 0;

  // Si hay inscripcion_horarios, sumar las clases asistidas
  if (inscripcion.inscripcion_horarios && inscripcion.inscripcion_horarios.length > 0) {
    clasesAsistidas = inscripcion.inscripcion_horarios.reduce((sum, ih) => {
      return sum + (parseInt(ih.clases_asistidas) || 0);
    }, 0);
  } else if (inscripcion.clases_asistidas !== undefined) {
    // Usar el campo directo si existe
    clasesAsistidas = parseInt(inscripcion.clases_asistidas) || 0;
  }

  // Calcular clases totales
  let clasesTotales = 0;
  if (inscripcion.clases_totales !== undefined) {
    clasesTotales = parseInt(inscripcion.clases_totales) || 0;
  } else if (inscripcion.modalidad?.clases_mensuales) {
    const meses = calcularMesesDuracionInscripcion(inscripcion);
    clasesTotales = parseInt(inscripcion.modalidad.clases_mensuales) * meses;
  } else {
    clasesTotales = 12 * calcularMesesDuracionInscripcion(inscripcion);
  }

  // Calcular clases restantes
  let clasesRestantes = 0;
  if (inscripcion.clases_restantes_calculadas !== undefined) {
    clasesRestantes = parseInt(inscripcion.clases_restantes_calculadas) || 0;
  } else if (inscripcion.clases_restantes !== undefined) {
    clasesRestantes = parseInt(inscripcion.clases_restantes) || 0;
  } else {
    clasesRestantes = Math.max(0, clasesTotales - clasesAsistidas);
  }

  console.log('📊 Cálculos finales:', {
    clasesAsistidas,
    clasesTotales,
    clasesRestantes,
    calculadoDesdeHorarios: inscripcion.inscripcion_horarios?.length > 0
  });

  // Asegurar que todos los campos existan
  const procesada = {
    ...inscripcion,
    dias_restantes: calcularDiasRestantes(inscripcion.fecha_fin),

    // Agregar campos calculados
    clases_asistidas: clasesAsistidas,
    clases_totales: clasesTotales,
    clases_restantes_calculadas: clasesRestantes,

    // Asegurar arrays
    horarios: Array.isArray(inscripcion.horarios) ? inscripcion.horarios : [],
    inscripcion_horarios: Array.isArray(inscripcion.inscripcion_horarios)
      ? procesarInscripcionHorarios(inscripcion.inscripcion_horarios)
      : [],

    // Asegurar objetos
    estudiante: inscripcion.estudiante || null,
    modalidad: inscripcion.modalidad || null,
    sucursal: inscripcion.sucursal || null,
    entrenador: inscripcion.entrenador || null
  };

  // Si no hay inscripcion_horarios pero sí hay horarios, crear una estructura básica
  if (procesada.horarios.length > 0 && procesada.inscripcion_horarios.length === 0) {
    procesada.inscripcion_horarios = procesada.horarios.map((horario, index) => ({
      id: index + 1,
      horario_id: horario.id,
      inscripcion_id: procesada.id,
      clases_asistidas: 0,
      clases_totales: Math.floor(procesada.clases_totales / procesada.horarios.length),
      clases_restantes: Math.floor(procesada.clases_restantes_calculadas / procesada.horarios.length),
      horario: horario
    }));
  }

  // DEBUG: Log de lo que tenemos
  console.log('📊 Datos procesados:', {
    id: procesada.id,
    totalHorarios: procesada.horarios.length,
    totalInscripcionHorarios: procesada.inscripcion_horarios.length,
    clases_asistidas: procesada.clases_asistidas,
    clases_totales: procesada.clases_totales,
    clases_restantes: procesada.clases_restantes_calculadas
  });

  return procesada;
}


function procesarInscripcionHorarios(inscripcionHorarios) {
  if (!Array.isArray(inscripcionHorarios)) return [];

  return inscripcionHorarios.map(ih => ({
    ...ih,
    // Asegurar que horario tenga la estructura esperada
    horario: ih.horario || {
      id: ih.horario_id,
      dia_semana: ih.dia_semana || 'Sin día',
      hora_inicio: ih.hora_inicio || '00:00',
      hora_fin: ih.hora_fin || '00:00',
      nombre: ih.nombre_horario || `Horario ${ih.horario_id}`
    },
    // Asegurar valores numéricos
    clases_asistidas: parseInt(ih.clases_asistidas) || 0,
    clases_totales: parseInt(ih.clases_totales) || 12,
    clases_restantes: parseInt(ih.clases_restantes) || (parseInt(ih.clases_totales) || 12)
  }));
}


// Computed para calcular fecha de segunda cuota
function calcularFechaSegundaCuota() {
  const fecha = new Date(pagoForm.value.fecha_pago || new Date());
  fecha.setDate(fecha.getDate() + 15); // 15 días después por defecto
  return formatFecha(fecha);
}

// Placeholder dinámico para observaciones
function getPlaceholderObservacion() {
  if (dividirPago.value && pagoForm.value.monto > 0 && pagoForm.value.monto < getPrecioTotal()) {
    return `Ej: Pago parcial. Primera cuota de $${pagoForm.value.monto} de $${getPrecioTotal()}. Saldo pendiente: $${(getPrecioTotal() - pagoForm.value.monto).toFixed(2)}`;
  }
  return 'Notas sobre el pago...';
}

// Watch para cuando cambie dividirPago
watch(dividirPago, (newVal) => {
  if (newVal) {
    // Sugerir la mitad automáticamente
    if (!pagoForm.value.monto || pagoForm.value.monto === getPrecioTotal()) {
      pagoForm.value.monto = getPrecioTotal() / 2;
    }
  }
});

// Watch para cuando cambie el monto total
watch(() => getPrecioTotal(), (newTotal) => {
  if (dividirPago.value && (!pagoForm.value.monto || pagoForm.value.monto > newTotal)) {
    pagoForm.value.monto = newTotal / 2;
  }
});

// Función para cargar horarios de una inscripción específica
async function cargarHorariosDeInscripcion(inscripcionId) {
  try {
    // Si tu API tiene un endpoint para esto
    const response = await inscripcionService.getHorarios(inscripcionId);

    if (response.data) {
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    }
    return [];
  } catch (error) {
    console.error('Error cargando horarios:', error);
    return [];
  }
}

async function obtenerHorariosManualmente(inscripcionId) {
  try {
    // Primero intentar obtener desde inscripcion_horarios
    const response = await fetch(`/api/inscripcion-horarios?inscripcion_id=${inscripcionId}`);

    if (response.ok) {
      const data = await response.json();

      if (data.success && data.data) {
        // Si necesitas más detalles de los horarios, puedes cargarlos por separado
        const horariosConDetalles = await Promise.all(
          data.data.map(async (ih) => {
            try {
              const horarioResponse = await fetch(`/api/horarios/${ih.horario_id}`);
              if (horarioResponse.ok) {
                const horarioData = await horarioResponse.json();
                return {
                  ...ih,
                  horario: horarioData.data || horarioData
                };
              }
              return ih;
            } catch {
              return ih;
            }
          })
        );

        return horariosConDetalles;
      }
    }
    return [];
  } catch (error) {
    console.error('Error obteniendo horarios manualmente:', error);
    return [];
  }
}



async function cargarHorariosDisponibles() {
  try {
    console.log('⏰ Cargando horarios disponibles...');

    const response = await horarioService.index(1, 100, '', {
      estado: 'activo',
      with_cupo: true
    });

    console.log('📥 Respuesta horarios:', response.data);

    let datosHorarios = [];

    // Manejar diferentes estructuras de respuesta (tu código existente)
    if (response.data) {
      if (response.data.success && response.data.data) {
        if (response.data.data.data && Array.isArray(response.data.data.data)) {
          datosHorarios = response.data.data.data;
        } else if (Array.isArray(response.data.data)) {
          datosHorarios = response.data.data;
        }
      } else if (response.data.data && Array.isArray(response.data.data)) {
        datosHorarios = response.data.data;
      } else if (Array.isArray(response.data)) {
        datosHorarios = response.data;
      }
    }

    // ========== CORRECCIÓN IMPORTANTE ==========
    // Filtrar solo horarios con cupo REALMENTE disponible
    datosHorarios = datosHorarios.filter(horario => {
      const cupoMaximo = horario.cupo_maximo || 15;
      const cupoActual = horario.cupo_actual || 0;
      const cupoDisponible = cupoMaximo - cupoActual;

      // SOLO mostrar horarios que tengan CUPO DISPONIBLE REAL
      // Es decir: cupoActual DEBE SER MENOR que cupoMaximo
      // Para cupo máximo 2: 0/2 y 1/2 sí, 2/2 NO
      const tieneCupoReal = cupoActual < cupoMaximo;

      console.log(`Horario ${horario.id}: ${cupoActual}/${cupoMaximo} - ¿Tiene cupo? ${tieneCupoReal}`);

      return tieneCupoReal;
    });

    console.log(`✅ ${datosHorarios.length} horarios con cupo REALMENTE disponible`);

    // Procesar para la vista
    procesarHorariosParaVista(datosHorarios);

  } catch (error) {
    console.error('❌ Error cargando horarios:', error);

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los horarios disponibles',
      life: 3000
    });

    horariosDisponibles.value = [];
  }
}
// Y actualiza tu función cargarHorariosPorModalidad:
async function cargarHorariosPorModalidad(modalidadId) {
  cargandoHorarios.value = true;

  try {
    console.log(`🎯 Cargando horarios EXCLUSIVOS para modalidad ID: ${modalidadId}`);

    // OPCIÓN A: Si tu backend tiene endpoint para filtrar por modalidad
    try {
      const response = await horarioService.getPorModalidad(modalidadId);
      console.log('📥 Respuesta por modalidad:', response.data);

      let datosHorarios = [];

      if (response.data) {
        if (response.data.success && Array.isArray(response.data.data)) {
          datosHorarios = response.data.data;
        } else if (Array.isArray(response.data)) {
          datosHorarios = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          datosHorarios = response.data.data;
        }
      }

      console.log(`✅ ${datosHorarios.length} horarios de modalidad ${modalidadId}`);
      procesarHorariosParaVista(datosHorarios);

    } catch (apiError) {
      console.log('🔄 Falló endpoint específico, usando filtro manual...');

      // OPCIÓN B: Cargar todos y filtrar manualmente
      await cargarTodosHorariosYFiltrar(modalidadId);
    }

  } catch (error) {
    console.error('❌ Error cargando horarios:', error);

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los horarios',
      life: 3000
    });

  } finally {
    cargandoHorarios.value = false;
  }
}

async function cargarTodosHorariosYFiltrar(modalidadId) {
  try {
    const response = await horarioService.index(1, 100, '', {
      estado: 'activo',
      with_cupo: true,
      include: 'modalidad'
    });

    let todosHorarios = [];

    // Extraer datos
    if (response.data) {
      if (response.data.success && Array.isArray(response.data.data)) {
        todosHorarios = response.data.data;
      } else if (Array.isArray(response.data)) {
        todosHorarios = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        todosHorarios = response.data.data;
      }
    }

    console.log(`📊 Total horarios cargados: ${todosHorarios.length}`);

    // FILTRAR SOLO LOS DE LA MODALIDAD SELECCIONADA
    const horariosFiltrados = todosHorarios.filter(horario => {
      const horarioModalidadId = horario.modalidad_id ||
        (horario.modalidad ? horario.modalidad.id : null);

      console.log(`Horario ${horario.id}: modalidad_id = ${horarioModalidadId}, buscamos: ${modalidadId}`);

      return Number(horarioModalidadId) === Number(modalidadId);
    });

    console.log(`✅ ${horariosFiltrados.length} horarios después del filtro`);

    // Debug: mostrar qué horarios se encontraron
    horariosFiltrados.forEach(h => {
      console.log(`- ${h.nombre} (ID: ${h.id}, Modalidad ID: ${h.modalidad_id})`);
    });

    if (horariosFiltrados.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Sin horarios',
        detail: 'No hay horarios disponibles para esta modalidad',
        life: 3000
      });
    }

    procesarHorariosParaVista(horariosFiltrados);

  } catch (error) {
    console.error('Error en filtro manual:', error);
    throw error;
  }
}

function getTooltipPago(inscripcion) {
  if (inscripcion.estado === 'en_mora') {
    return `¡EN MORA! Click para pagar saldo pendiente`;
  }
  
  if (inscripcion.saldo_pendiente > 0) {
    // Verificar si probablemente es segunda cuota
    const montoMensual = parseFloat(inscripcion.monto_mensual) || 0;
    const saldoPendiente = parseFloat(inscripcion.saldo_pendiente) || 0;
    
    if (saldoPendiente < montoMensual && saldoPendiente > 0) {
      return `Pagar segunda cuota: $${saldoPendiente.toFixed(2)}`;
    }
    
    return `Pagar saldo pendiente: $${saldoPendiente.toFixed(2)}`;
  }
  
  return '✅ Pagos al día';
}
// También asegúrate de tener esta función:
function procesarHorariosParaVista(datosHorarios) {
  console.log('🔄 Procesando horarios para vista:', datosHorarios.length);

  horariosDisponibles.value = datosHorarios.map(horario => {
    // Calcular cupo disponible
    const cupoMaximo = horario.cupo_maximo || 15;
    const cupoActual = horario.cupo_actual || 0;
    const cupoDisponible = Math.max(0, cupoMaximo - cupoActual);

    // Determinar si está lleno
    const estaLleno = cupoActual >= cupoMaximo;

    // Obtener datos de relaciones
    const modalidad = horario.modalidad || {};
    const entrenador = horario.entrenador || {};
    const sucursal = horario.sucursal || {};

    return {
      id: horario.id,
      nombre_horario: horario.nombre || `Horario ${horario.id}`,
      modalidad_id: horario.modalidad_id || modalidad.id,
      modalidad_nombre: modalidad.nombre || 'Sin modalidad',
      disciplina_id: horario.disciplina_id,
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio?.substring(0, 5) || '00:00',
      hora_fin: horario.hora_fin?.substring(0, 5) || '00:00',
      duracion_minutos: horario.duracion_minutos || 60,
      entrenador_id: horario.entrenador_id,
      entrenador_nombre: entrenador.nombres && entrenador.apellidos
        ? `${entrenador.nombres} ${entrenador.apellidos}`.trim()
        : 'Sin entrenador',
      sucursal_id: horario.sucursal_id,
      sucursal_nombre: sucursal.nombre || 'Sin sucursal',
      cupo_maximo: cupoMaximo,
      cupo_actual: cupoActual,
      cupo_disponible: cupoDisponible,
      esta_lleno: estaLleno, // ← NUEVO CAMPO
      precio: parseFloat(modalidad.precio_mensual) || 0,
      permisos_maximos: modalidad.permisos_maximos || 3,
      estado: horario.estado || 'activo',
      color: horario.color || '#3B82F6',
      descripcion: horario.descripcion || ''
    };
  });

  console.log('✅ Horarios procesados:', horariosDisponibles.value);
}

// Y la computed property para horarios filtrados:
const horariosFiltrados = computed(() => {
  // Ahora no necesitamos filtrar por modalidad porque ya cargamos solo los de esa modalidad
  return horariosDisponibles.value;
});

async function cargarHorariosConIndex() {
  try {
    console.log('Cargando horarios con método index...');
    const response = await horarioService.index(1, 100, '', {
      estado: 'activo',
      include: 'modalidad,entrenador,sucursal'
    });

    let datosHorarios = [];

    if (response.data) {
      if (Array.isArray(response.data)) {
        datosHorarios = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        datosHorarios = response.data.data;
      }
    }

    // Filtrar por cupo disponible
    datosHorarios = datosHorarios.filter(h =>
      h.estado === 'activo' &&
      (h.cupo_maximo || 15) > (h.cupo_actual || 0)
    );

    procesarHorariosParaVista(datosHorarios);

  } catch (error) {
    console.error('Error cargando horarios con index:', error);
    horariosDisponibles.value = obtenerHorariosDeEjemplo();
    toast.add({
      severity: 'info',
      summary: 'Modo demostración',
      detail: 'Mostrando datos de ejemplo',
      life: 3000
    });
  }
}

// Agrega esta función en tu script
function verificarInscripcionesPrevias() {
  if (!estudianteSeleccionado.value || horariosSeleccionadosDetalles.value.length === 0) {
    return { tieneConflictos: false, conflictos: [] };
  }

  const estudianteId = estudianteSeleccionado.value.id;
  const conflictos = [];

  // Buscar inscripciones activas del estudiante
  const inscripcionesActivasEstudiante = inscripciones.value.filter(i =>
    i.estudiante_id === estudianteId && i.estado === 'activo'
  );

  // Recorrer cada inscripción activa
  inscripcionesActivasEstudiante.forEach(inscripcion => {
    // Verificar si esta inscripción tiene horarios
    if (inscripcion.horarios && Array.isArray(inscripcion.horarios)) {
      // Comparar con horarios seleccionados
      inscripcion.horarios.forEach(horarioInscrito => {
        // Buscar si alguno de los horarios seleccionados coincide
        const conflicto = horariosSeleccionadosDetalles.value.find(horarioSeleccionado =>
          horarioSeleccionado.id === horarioInscrito.id ||
          (horarioSeleccionado.dia_semana === horarioInscrito.dia_semana &&
            horarioSeleccionado.hora_inicio === horarioInscrito.hora_inicio)
        );

        if (conflicto) {
          conflictos.push({
            horario: conflicto,
            inscripcionExistente: inscripcion,
            mensaje: `Ya inscrito en ${conflicto.dia_semana} ${conflicto.hora_inicio} (Inscripción #${inscripcion.id})`
          });
        }
      });
    }
  });

  return {
    tieneConflictos: conflictos.length > 0,
    conflictos: conflictos
  };
}

function obtenerHorariosDeEjemplo() {
  return [
    {
      id: 28,
      modalidad_id: 11,
      modalidad_nombre: 'Jujitsu para principiantes',
      disciplina_id: 1,
      dia_semana: 'Lunes',
      hora_inicio: '15:00',
      hora_fin: '16:00',
      duracion_minutos: 60,
      entrenador_id: 1,
      entrenador_nombre: 'Carlos López',
      sucursal_id: 1,
      sucursal_nombre: 'Sucursal Centro',
      cupo_maximo: 15,
      cupo_actual: 5,
      cupo_disponible: 10,
      precio: 180,
      permisos_maximos: 3,
      estado: 'activo',
      color: '#3B82F6'
    },
    {
      id: 31,
      modalidad_id: 12,
      modalidad_nombre: 'King boxing avanzado',
      disciplina_id: 2,
      dia_semana: 'Lunes',
      hora_inicio: '17:00',
      hora_fin: '19:00',
      duracion_minutos: 120,
      entrenador_id: 1,
      entrenador_nombre: 'Ana García',
      sucursal_id: 3,
      sucursal_nombre: 'Sucursal Norte',
      cupo_maximo: 15,
      cupo_actual: 8,
      cupo_disponible: 7,
      precio: 250,
      permisos_maximos: 3,
      estado: 'activo',
      color: '#10B981'
    }
  ];
}

// Funciones para horarios
function estaSeleccionado(horarioId) {
  if (!Array.isArray(horariosSeleccionados.value)) {
    horariosSeleccionados.value = [];
    return false;
  }
  return horariosSeleccionados.value.includes(horarioId);
}



function calcularMesesDuracionRenovacion() {
  if (!renovacionForm.value.fecha_inicio || !renovacionForm.value.fecha_fin) {
    return 1;
  }

  const inicio = new Date(renovacionForm.value.fecha_inicio);
  const fin = new Date(renovacionForm.value.fecha_fin);
  const diffMeses = (fin.getFullYear() - inicio.getFullYear()) * 12 +
    (fin.getMonth() - inicio.getMonth());

  return Math.max(1, diffMeses);
}

// En tu función confirmarRenovacion()
async function confirmarRenovacion() {
  renovando.value = true;

  try {
    // Preparar datos COMPLETOS para la renovación
    const datosRenovacion = {
      fecha_inicio: formatDateToYMD(renovacionForm.value.fecha_inicio),
      fecha_fin: formatDateToYMD(renovacionForm.value.fecha_fin),
      motivo: renovacionForm.value.motivo || 'Renovación mensual',
      metodo_pago: 'efectivo', // O agrega un campo en el formulario
      monto_pago: calcularTotalRenovacion(),
      // Incluir IDs importantes
      modalidad_id: inscripcionARenovar.value.modalidad_id ||
        inscripcionARenovar.value.modalidad?.id,
      estudiante_id: inscripcionARenovar.value.estudiante_id ||
        inscripcionARenovar.value.estudiante?.id
    };

    console.log('📤 Enviando renovación completa:', datosRenovacion);

    const response = await inscripcionService.renovar(
      inscripcionARenovar.value.id,
      datosRenovacion
    );

    if (response.data.success) {
      toast.add({
        severity: 'success',
        summary: '✅ Renovación Completa Exitosa',
        detail: `Nueva inscripción #${response.data.data.nueva_inscripcion_id} creada con ${response.data.data.clases_generadas} clases programadas y pago registrado.`,
        life: 6000
      });

      dialogoRenovacion.value = false;

      // Recargar datos
      setTimeout(() => cargarDatos(), 1000);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    toast.add({
      severity: 'error',
      summary: 'Error en Renovación',
      detail: error.response?.data?.message || error.message || 'Error al renovar',
      life: 5000
    });
  } finally {
    renovando.value = false;
  }
}

// Función de fallback para crear renovación manualmente
async function crearRenovacionManual(datosRenovacion) {
  try {
    console.log('🔄 Creando renovación manualmente...');

    // 1. Crear nueva inscripción
    const nuevaInscripcionData = {
      estudiante_id: inscripcionARenovar.value.estudiante_id || inscripcionARenovar.value.estudiante?.id,
      modalidad_id: inscripcionARenovar.value.modalidad_id || inscripcionARenovar.value.modalidad?.id,
      fecha_inicio: datosRenovacion.fecha_inicio,
      fecha_fin: datosRenovacion.fecha_fin,
      monto_mensual: inscripcionARenovar.value.monto_mensual || inscripcionARenovar.value.modalidad?.precio_mensual,
      clases_totales: inscripcionARenovar.value.modalidad?.clases_mensuales || 12,
      clases_asistidas: 0,
      permisos_usados: 0,
      permisos_disponibles: inscripcionARenovar.value.modalidad?.permisos_maximos || 3,
      estado: 'activo',
      observaciones: `Renovación de inscripción #${inscripcionARenovar.value.id}. ${datosRenovacion.motivo}`
    };

    const response = await inscripcionService.store(nuevaInscripcionData);

    if (!response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }

    const nuevaInscripcionId = response.data.id || response.data.data?.id || response.data.inscripcion_id;

    if (!nuevaInscripcionId) {
      throw new Error('No se pudo obtener el ID de la nueva inscripción');
    }

    console.log('✅ Nueva inscripción creada:', nuevaInscripcionId);

    // 2. Actualizar inscripción anterior (marcar como renovada)
    try {
      await inscripcionService.update(inscripcionARenovar.value.id, {
        estado: 'renovado',
        observaciones: `Renovada el ${new Date().toISOString().split('T')[0]}. Nueva inscripción: #${nuevaInscripcionId}`
      });
    } catch (updateError) {
      console.warn('⚠️ No se pudo actualizar la inscripción anterior:', updateError.message);
      // Continuar aunque falle esta parte
    }

    // 3. Registrar pago (opcional)
    try {
      const pagoData = {
        inscripcion_id: nuevaInscripcionId,
        estudiante_id: nuevaInscripcionData.estudiante_id,
        monto: nuevaInscripcionData.monto_mensual * calcularMesesDuracionRenovacion(),
        metodo_pago: datosRenovacion.metodo_pago || 'efectivo',
        fecha_pago: formatDateToYMD(new Date()),
        observacion: `Pago por renovación de inscripción #${inscripcionARenovar.value.id} a #${nuevaInscripcionId}`,
        estado: 'pagado',
        referencia: `REN-${inscripcionARenovar.value.id}-${nuevaInscripcionId}`
      };

      await pagoService.store(pagoData);
      console.log('✅ Pago registrado');
    } catch (pagoError) {
      console.warn('⚠️ No se pudo registrar el pago:', pagoError.message);
      // El pago se puede registrar manualmente después
    }

    toast.add({
      severity: 'success',
      summary: '✅ Renovación Manual Exitosa',
      detail: `Nueva inscripción #${nuevaInscripcionId} creada exitosamente`,
      life: 5000
    });

  } catch (error) {
    console.error('❌ Error en renovación manual:', error);
    throw error; // Re-lanzar para manejar en la función principal
  }
}

// Función auxiliar para formatear fecha (si no la tienes)
function formatDateToYMD(date) {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


function toggleHorarioSeleccionado(horario) {
  console.log('🔄 Toggle horario:', horario.id, horario.dia_semana);

  // Verificar si el estudiante ya está inscrito en este horario
  if (estudianteSeleccionado.value) {
    const horariosEstudiante = obtenerHorariosEstudiante(estudianteSeleccionado.value.id);
    const yaInscrito = horariosEstudiante.some(h =>
      h.id === horario.id ||
      (h.dia_semana === horario.dia_semana && h.hora_inicio === horario.hora_inicio)
    );

    if (yaInscrito) {
      toast.add({
        severity: 'error',
        summary: 'Ya inscrito',
        detail: `El estudiante ya está inscrito en ${horario.dia_semana} ${horario.hora_inicio}`,
        life: 4000
      });
      return;
    }
  }

  // Verificar si el horario está lleno
  if (horario.esta_lleno || horario.cupo_disponible <= 0) {
    toast.add({
      severity: 'error',
      summary: 'Cupo lleno',
      detail: `El horario ${horario.dia_semana} ${horario.hora_inicio} ya está completo`,
      life: 3000
    });
    return;
  }

  // ========== ELIMINAR LÍMITE ==========
  const index = horariosSeleccionados.value.indexOf(horario.id);

  if (index === -1) {
    // SIN LÍMITE - siempre permitir agregar
    horariosSeleccionados.value = [...horariosSeleccionados.value, horario.id];
    horariosSeleccionadosDetalles.value = [...horariosSeleccionadosDetalles.value, horario];

    toast.add({
      severity: 'success',
      summary: 'Horario agregado',
      detail: `${horario.dia_semana} ${horario.hora_inicio} seleccionado`,
      life: 1500
    });
  } else {
    // Remover horario si ya está seleccionado
    horariosSeleccionados.value = horariosSeleccionados.value.filter(id => id !== horario.id);
    horariosSeleccionadosDetalles.value = horariosSeleccionadosDetalles.value.filter(h => h.id !== horario.id);
    toast.add({
      severity: 'info',
      summary: 'Horario removido',
      detail: `${horario.dia_semana} ${horario.hora_inicio} removido`,
      life: 1500
    });
  }
}

// Agrega esta función para obtener horarios del estudiante
function obtenerHorariosEstudiante(estudianteId) {
  const horariosEstudiante = [];

  inscripciones.value.forEach(inscripcion => {
    if (inscripcion.estudiante_id === estudianteId && inscripcion.estado === 'activo') {
      if (inscripcion.horarios && Array.isArray(inscripcion.horarios)) {
        inscripcion.horarios.forEach(horario => {
          horariosEstudiante.push({
            ...horario,
            inscripcion_id: inscripcion.id
          });
        });
      }
    }
  });

  return horariosEstudiante;
}


function quitarHorario(horarioId) {
  horariosSeleccionados.value = horariosSeleccionados.value.filter(id => id !== horarioId);
  horariosSeleccionadosDetalles.value = horariosSeleccionadosDetalles.value.filter(h => h.id !== horarioId);
}

function getPrecioTotal() {
  if (!modalidadSeleccionada.value) return 0;

  const meses = calcularMesesDuracion();
  return modalidadSeleccionada.value.precio_mensual * meses;
}

function getModalidadNombre() {
  if (horariosSeleccionadosDetalles.value.length === 0) return '';
  return horariosSeleccionadosDetalles.value[0]?.modalidad_nombre || '';
}

function getEntrenadorNombre() {
  if (horariosSeleccionadosDetalles.value.length === 0) return '';
  return horariosSeleccionadosDetalles.value[0]?.entrenador_nombre || '';
}

function getSucursalNombre() {
  if (horariosSeleccionadosDetalles.value.length === 0) return '';
  return horariosSeleccionadosDetalles.value[0]?.sucursal_nombre || '';
}

function getPermisosMaximos() {
  if (horariosSeleccionadosDetalles.value.length === 0) return 3;
  return horariosSeleccionadosDetalles.value[0]?.permisos_maximos || 3;
}

function getDistribucionArray() {
  const totalHorarios = horariosSeleccionadosDetalles.value.length;
  if (totalHorarios === 0) return [];

  const clasesTotales = 12;
  const base = Math.floor(clasesTotales / totalHorarios);
  const extra = clasesTotales % totalHorarios;

  const distribucion = [];
  for (let i = 0; i < totalHorarios; i++) {
    distribucion.push(i < extra ? base + 1 : base);
  }

  return distribucion;
}

function getDistribucionClases() {
  const distribucion = getDistribucionArray();
  if (distribucion.length === 0) return '';

  let texto = '12 clases distribuidas: ';
  distribucion.forEach((clases, index) => {
    const horario = horariosSeleccionadosDetalles.value[index];
    texto += `${horario.dia_semana} (${clases} clases)`;
    if (index < distribucion.length - 1) texto += ', ';
  });

  return texto;
}


// Agrega estas funciones en tu script

// Función para aplicar renovación rápida
function aplicarRenovacionRapida(meses) {
  const fechaInicio = new Date();
  const fechaFin = new Date();
  fechaFin.setMonth(fechaFin.getMonth() + meses);

  renovacionForm.value = {
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    motivo: `Renovación por ${meses} ${meses === 1 ? 'mes' : 'meses'}`
  };
}

// Función para calcular el total de la renovación
function calcularTotalRenovacion() {
  if (!inscripcionARenovar.value || !inscripcionARenovar.value.modalidad) {
    return 0;
  }

  const meses = calcularMesesDuracionRenovacion();
  const precioMensual = inscripcionARenovar.value.modalidad.precio_mensual || 0;

  return (precioMensual * meses).toFixed(2);
}

// Función para resetear el formulario de renovación
function resetearRenovacion() {
  renovacionForm.value = {
    fecha_inicio: null,
    fecha_fin: null,
    motivo: ''
  };
  renovando.value = false;
}

// Actualiza la función renovarInscripcion para usar fechas más realistas
function renovarInscripcion(inscripcion) {
  console.log('🔄 Intentando renovar inscripción:', inscripcion.id);

  // Verificar si puede renovar
  if (!puedeRenovar(inscripcion)) {
    const diasRestantes = calcularDiasRestantes(inscripcion.fecha_fin);
    const clasesRestantes = parseInt(inscripcion.clases_restantes_calculadas) ||
      parseInt(inscripcion.clases_restantes) ||
      0;

    let mensaje = 'No se puede renovar todavía. ';

    if (diasRestantes > 7) {
      mensaje += `Faltan ${diasRestantes} días para el vencimiento. `;
    }

    if (clasesRestantes > 5) {
      mensaje += `Aún quedan ${clasesRestantes} clases. `;
    }

    mensaje += 'Puede renovar cuando falten 7 días o menos, o cuando queden 5 clases o menos.';

    toast.add({
      severity: 'info',
      summary: 'Renovación no disponible',
      detail: mensaje,
      life: 5000
    });

    return;
  }

  // Si puede renovar, proceder
  inscripcionARenovar.value = inscripcion;

  // Calcular fechas inteligentes
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaFinActual = inscripcion.fecha_fin ? new Date(inscripcion.fecha_fin) : hoy;
  fechaFinActual.setHours(0, 0, 0, 0);

  let fechaInicio = hoy;

  // Si la fecha actual de fin es futura, empezar al día siguiente
  if (fechaFinActual > hoy) {
    fechaInicio = new Date(fechaFinActual);
    fechaInicio.setDate(fechaInicio.getDate() + 1);
  }

  // Calcular fecha de fin (1 mes después por defecto)
  const fechaFin = new Date(fechaInicio);
  fechaFin.setMonth(fechaFin.getMonth() + 1);

  // Obtener información para el motivo
  const diasRestantes = calcularDiasRestantes(inscripcion.fecha_fin);
  const clasesRestantes = parseInt(inscripcion.clases_restantes_calculadas) ||
    parseInt(inscripcion.clases_restantes) ||
    0;

  let motivo = 'Renovación mensual';

  if (diasRestantes <= 7 && diasRestantes >= 0) {
    motivo = `Renovación por vencimiento (${diasRestantes} días restantes)`;
  } else if (clasesRestantes <= 5) {
    motivo = `Renovación por agotamiento de clases (${clasesRestantes} clases restantes)`;
  }

  // Configurar formulario
  renovacionForm.value = {
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    motivo: motivo
  };

  console.log('📅 Renovación configurada:', {
    inscripcion: inscripcion.id,
    inicio: fechaInicio.toISOString().split('T')[0],
    fin: fechaFin.toISOString().split('T')[0],
    motivo: motivo
  });

  // Abrir diálogo
  dialogoRenovacion.value = true;
}




// Función para verificar datos antes de enviar


function crearInscripcionVacia() {
  const fechaInicio = new Date();
  const fechaFin = new Date();
  fechaFin.setMonth(fechaFin.getMonth() + 1);

  return {
    estudiante_id: null,
    modalidad_id: null,
    sucursal_id: null,
    entrenador_id: null,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    clases_totales: 12,
    clases_asistidas: 0,
    permisos_usados: 0,
    monto_mensual: 0,
    estado: 'activo'
  };
}
// Función para formatear hora
function formatHora(hora) {
  if (!hora) return '--:--';

  // Si la hora ya está en formato HH:MM, devolverla
  if (typeof hora === 'string' && hora.includes(':')) {
    return hora.length > 5 ? hora.substring(0, 5) : hora;
  }

  // Si es un objeto Date
  if (hora instanceof Date) {
    return hora.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return '--:--';
}

// Función para obtener día de semana
function getDiaSemana(horario) {
  if (!horario) return 'Sin día';

  if (horario.dia_semana) return horario.dia_semana;

  // Intentar extraer de otras propiedades
  if (horario.dia) return horario.dia;
  if (horario.nombre && horario.nombre.includes('Lunes')) return 'Lunes';
  if (horario.nombre && horario.nombre.includes('Martes')) return 'Martes';
  if (horario.nombre && horario.nombre.includes('Miércoles')) return 'Miércoles';
  if (horario.nombre && horario.nombre.includes('Jueves')) return 'Jueves';
  if (horario.nombre && horario.nombre.includes('Viernes')) return 'Viernes';
  if (horario.nombre && horario.nombre.includes('Sábado')) return 'Sábado';
  if (horario.nombre && horario.nombre.includes('Domingo')) return 'Domingo';

  return 'Sin día';
}

async function guardarInscripcionYpago() {
  // ========== GUARDAR REFERENCIAS ANTES DE LIMPIAR ==========
  const estudianteBackup = { ...estudianteSeleccionado.value };
  const modalidadBackup = { ...modalidadSeleccionada.value };
  const horariosBackup = [...horariosSeleccionadosDetalles.value];
  const montoBackup = pagoForm.value.monto;
  const metodoPagoBackup = pagoForm.value.metodo_pago;

  // ========== VALIDACIONES INICIALES ==========
  if (!estudianteSeleccionado.value || !estudianteSeleccionado.value.id) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Debe seleccionar un estudiante',
      life: 4000
    });
    return;
  }

  if (!modalidadSeleccionada.value || !modalidadSeleccionada.value.id) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Debe seleccionar una modalidad',
      life: 4000
    });
    return;
  }

  if (!horariosSeleccionados.value.length || !horariosSeleccionadosDetalles.value.length) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Debe seleccionar al menos un horario',
      life: 4000
    });
    return;
  }

  if (!inscripcionForm.value.fecha_inicio) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Debe seleccionar una fecha de inicio',
      life: 4000
    });
    return;
  }

  // ========== VALIDACIÓN ESPECIAL PARA PAGOS DIVIDIDOS ==========
  if (dividirPago.value) {
    if (!pagoForm.value.monto || pagoForm.value.monto <= 0) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe ingresar el monto de la primera cuota',
        life: 4000
      });
      return;
    }

    if (pagoForm.value.monto >= getPrecioTotal()) {
      toast.add({
        severity: 'warn',
        summary: '¿Seguro?',
        detail: 'Si paga el monto completo, no es necesario dividir el pago',
        life: 4000
      });
      dividirPago.value = false;
    }
  }

  // ========== FUNCIÓN PARA FORMATO DE FECHAS ==========
  const formatDateToYMD = (date) => {
    if (!date) return null;

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      console.error('❌ Fecha inválida:', date);
      const hoy = new Date();
      const year = hoy.getFullYear();
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const day = String(hoy.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // ========== OBTENER Y VALIDAR FECHAS ==========
  const fechaInicioFormateada = formatDateToYMD(inscripcionForm.value.fecha_inicio);

  // En la función que calcula la fecha de fin por defecto:
  const calcularFechaFinPorDefecto = (fechaInicio) => {
    const fecha = new Date(fechaInicio);

    // Verificar si hay horarios de domingo seleccionados
    const tieneHorariosDomingo = horariosSeleccionadosDetalles.value.some(h =>
      h.dia_semana?.toLowerCase().includes('domingo')
    );

    if (tieneHorariosDomingo) {
      // Para domingos, asegurar al menos 7 días
      fecha.setDate(fecha.getDate() + 7);
    } else {
      // Para otros casos, 1 mes por defecto
      fecha.setMonth(fecha.getMonth() + 1);
    }

    fecha.setDate(fecha.getDate() - 1); // Ajustar para que sea exacto
    return fecha;
  };

  const fechaFinFormateada = inscripcionForm.value.fecha_fin
    ? formatDateToYMD(inscripcionForm.value.fecha_fin)
    : formatDateToYMD(calcularFechaFinPorDefecto(inscripcionForm.value.fecha_inicio));

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaInicioDate = new Date(inscripcionForm.value.fecha_inicio);
  fechaInicioDate.setHours(0, 0, 0, 0);

  if (fechaInicioDate < hoy) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `La fecha de inicio (${fechaInicioDate.toLocaleDateString('es-ES')}) no puede ser anterior a hoy (${hoy.toLocaleDateString('es-ES')})`,
      life: 4000
    });
    return;
  }

  if (inscripcionForm.value.fecha_fin) {
    const fechaFinDate = new Date(inscripcionForm.value.fecha_fin);
    fechaFinDate.setHours(0, 0, 0, 0);

    if (fechaFinDate <= fechaInicioDate) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: `La fecha fin (${fechaFinDate.toLocaleDateString('es-ES')}) debe ser posterior a la fecha inicio (${fechaInicioDate.toLocaleDateString('es-ES')})`,
        life: 4000
      });
      return;
    }
  }

  // ========== VALIDACIÓN DE PAGO ==========
  if (!pagoForm.value.monto || pagoForm.value.monto <= 0) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'El monto del pago debe ser mayor a 0',
      life: 4000
    });
    return;
  }

  if (pagoForm.value.monto > getPrecioTotal()) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `El monto no puede ser mayor a $${getPrecioTotal()}`,
      life: 4000
    });
    return;
  }

  if (!pagoForm.value.metodo_pago) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Debe seleccionar un método de pago',
      life: 4000
    });
    return;
  }

  // ========== INICIAR PROCESO ==========
  guardando.value = true;

  let inscripcionId = null;
  let totalClasesGeneradas = 0;
  let pagoRegistrado = false;
  let pagoGrupoId = null;
  let estadoInscripcion = 'activo'; // Estado inicial

  try {
    // ========== PASO 1: DETERMINAR ESTADO INICIAL ==========
    console.log('🔄 PASO 1: Determinando estado inicial...');

    // IMPORTANTE: Si paga menos del total, la inscripción queda EN MORA
    if (dividirPago.value && pagoForm.value.monto < getPrecioTotal()) {
      estadoInscripcion = 'en_mora';
      console.log('⚠️ Inscripción quedará en estado: EN MORA (pago dividido)');

      // Informar al usuario
      toast.add({
        severity: 'warn',
        summary: 'Estado de Inscripción',
        detail: 'La inscripción quedará en "EN MORA" hasta pagar la segunda cuota',
        life: 5000
      });
    } else if (pagoForm.value.monto < getPrecioTotal()) {
      // Si paga parcial pero no marcó "dividir pago", también queda en mora
      estadoInscripcion = 'en_mora';
      console.log('⚠️ Inscripción quedará en estado: EN MORA (pago parcial)');
    } else {
      estadoInscripcion = 'activo';
      console.log('✅ Inscripción quedará en estado: ACTIVO (pago completo)');
    }

    // ========== PASO 2: CREAR INSCRIPCIÓN ==========
    console.log('🔄 PASO 2: Creando inscripción...');

    // Calcular clases totales
    const clasesReales = calcularClasesReales(
      fechaInicioFormateada,
      fechaFinFormateada,
      horariosSeleccionadosDetalles.value
    );

    // Si no se pudo calcular, usar un mínimo
    const clasesTotales = clasesReales > 0 ?
      clasesReales :
      Math.min(
        calcularClasesTotales(),
        modalidadSeleccionada.value.clases_mensuales || 12
      );

    console.log('📊 Clases calculadas:', {
      modalidad: modalidadSeleccionada.value.clases_mensuales,
      calculadasPorModalidad: calcularClasesTotales(),
      realesPorFechas: clasesReales,
      final: clasesTotales
    });

    // ========== PASO 2.1: CALCULAR DISTRIBUCIÓN POR HORARIO ==========
    console.log('🔄 Calculando distribución por horario...');

    let distribucionClases = [];
    try {
      distribucionClases = calcularDistribucionPorHorario(
        fechaInicioFormateada,
        fechaFinFormateada,
        horariosSeleccionadosDetalles.value
      );

      // Validar que la distribución sea válida
      if (!distribucionClases || distribucionClases.length === 0) {
        throw new Error('No se pudo calcular la distribución de clases');
      }

      // Verificar que todos los horarios tengan al menos 1 clase
      const horariosSinClases = distribucionClases.filter(d => d.clases_totales < 1);
      if (horariosSinClases.length > 0) {
        const mensajeHorarios = horariosSinClases.map(d => {
          const horario = horariosSeleccionadosDetalles.value.find(h => h.id === d.horario_id);
          return `"${horario?.dia_semana || 'Sin día'}" (ID: ${d.horario_id})`;
        }).join(', ');

        throw new Error(`Los siguientes horarios no tienen clases en el período seleccionado: ${mensajeHorarios}. Por favor, extienda la fecha de fin.`);
      }

      console.log('📊 Distribución calculada:', distribucionClases);

      // Mostrar resumen en consola
      distribucionClases.forEach((dist, index) => {
        console.log(`📅 Horario ${index + 1}: ${dist.horario_id} - ${dist.clases_totales} clases`);
      });
    } catch (distError) {
      console.error('❌ Error en distribución:', distError);

      // Mostrar error específico al usuario
      if (distError.message.includes('Período insuficiente') || distError.message.includes('no tienen clases')) {
        toast.add({
          severity: 'error',
          summary: 'Período insuficiente',
          detail: distError.message,
          life: 8000
        });
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error en distribución',
          detail: distError.message || 'No se pudo calcular la distribución de clases',
          life: 5000
        });
      }

      guardando.value = false;
      return;
    }

    // ========== PASO 2.2: VALIDAR QUE EL PERÍODO SEA SUFICIENTE ==========
    const validacionPeriodo = validarPeriodoSuficiente(
      fechaInicioFormateada,
      fechaFinFormateada,
      horariosSeleccionadosDetalles.value
    );

    if (!validacionPeriodo.valido) {
      toast.add({
        severity: 'error',
        summary: 'Período insuficiente',
        detail: validacionPeriodo.mensaje,
        life: 6000
      });
      guardando.value = false;
      return;
    }

    // ========== PASO 2.3: PREPARAR DATOS DE INSCRIPCIÓN ==========
    console.log('🔄 Preparando datos de inscripción...');

    // Asegurar que distribucionClases tenga el formato correcto para el backend
    const distribucionParaBackend = distribucionClases.map(d => ({
      horario_id: d.horario_id,
      clases_totales: d.clases_totales,
      clases_asistidas: 0,
      clases_restantes: d.clases_totales,
      estado: 'activo'
    }));

    // Verificar nuevamente que todos tengan al menos 1 clase
    const tieneCeroClases = distribucionParaBackend.some(d => d.clases_totales < 1);
    if (tieneCeroClases) {
      console.error('❌ ERROR CRÍTICO: Algunos horarios tienen 0 clases después del mapeo');
      distribucionParaBackend.forEach((d, i) => {
        if (d.clases_totales < 1) {
          console.error(`  - Índice ${i}: horario_id=${d.horario_id}, clases_totales=${d.clases_totales}`);
        }
      });

      toast.add({
        severity: 'error',
        summary: 'Error en cálculo',
        detail: 'No se pudieron calcular correctamente las clases para todos los horarios',
        life: 5000
      });
      guardando.value = false;
      return;
    }

    const datosInscripcion = {
      estudiante_id: estudianteSeleccionado.value.id,
      modalidad_id: modalidadSeleccionada.value.id,
      fecha_inicio: fechaInicioFormateada,
      fecha_fin: fechaFinFormateada,
      monto_mensual: modalidadSeleccionada.value.precio_mensual,
      clases_totales: clasesTotales,
      clases_asistidas: 0,
      permisos_usados: 0,
      permisos_disponibles: modalidadSeleccionada.value.permisos_maximos || 3,
      estado: estadoInscripcion, // ← ESTADO CORREGIDO (activo o en_mora)
      horarios: horariosSeleccionados.value,
      distribucion_horarios: distribucionParaBackend,
      sucursal_id: horariosSeleccionadosDetalles.value[0]?.sucursal_id,
      entrenador_id: horariosSeleccionadosDetalles.value[0]?.entrenador_id,
      observaciones: dividirPago.value ? 'Pago dividido en 2 cuotas' : 'Pago completo'
    };

    console.log('📤 Enviando datos de inscripción...', datosInscripcion);
    console.log('📊 Distribución enviada:', distribucionParaBackend);

    // ========== PASO 2.4: CREAR INSCRIPCIÓN ==========
    const responseInscripcion = await inscripcionService.store(datosInscripcion);

    console.log('📥 Respuesta del servidor (inscripción):', responseInscripcion.data);

    if (!responseInscripcion.data) {
      throw new Error('No se recibió respuesta del servidor al crear la inscripción');
    }

    if (responseInscripcion.data.success === false) {
      // Verificar si es error de validación específico
      if (responseInscripcion.data.message?.includes('clases_totales field must be at least 1')) {
        throw new Error('Error de validación: Algunos horarios tienen 0 clases. Por favor, extienda el período.');
      }
      throw new Error(responseInscripcion.data.message || 'Error al crear la inscripción');
    }

    // Obtener ID de la inscripción
    inscripcionId = responseInscripcion.data.inscripcion_id ||
      responseInscripcion.data.id ||
      (responseInscripcion.data.data && responseInscripcion.data.data.id);

    if (!inscripcionId) {
      throw new Error('No se recibió el ID de la inscripción creada');
    }

    console.log('✅ Inscripción creada con ID:', inscripcionId);

    // Obtener datos de clases generadas desde la respuesta
    totalClasesGeneradas = responseInscripcion.data.data?.clases_generadas || 0;

    // ========== PASO 3: VERIFICAR SI SE GENERARON CLASES PROGRAMADAS ==========
    console.log('🔄 PASO 3: Verificando clases programadas...');

    if (totalClasesGeneradas > 0) {
      console.log(`✅ ${totalClasesGeneradas} clases ya generadas automáticamente por el backend`);
    } else {
      console.log('⚠️ No se detectaron clases generadas en la respuesta del backend');
      // El resto del código de verificación se mantiene igual...
    }

    // ========== PASO 4: CREAR PAGO(S) ==========
    console.log('🔄 PASO 4: Creando pago(s)...');

    // Generar ID único para grupo de pagos (si es dividido)
    pagoGrupoId = Date.now().toString(); // Convertir a string

    // PRIMER PAGO (siempre se crea)
    const datosPagoPrimero = {
      inscripcion_id: inscripcionId,
      estudiante_id: estudianteSeleccionado.value.id,
      monto: parseFloat(pagoForm.value.monto),
      metodo_pago: pagoForm.value.metodo_pago,
      fecha_pago: pagoForm.value.fecha_pago ?
        formatDateToYMD(pagoForm.value.fecha_pago) :
        formatDateToYMD(new Date()),
      observacion: pagoForm.value.observacion ||
        (dividirPago.value && pagoForm.value.monto < getPrecioTotal() ?
          `Primera cuota de $${pagoForm.value.monto} de $${getPrecioTotal()}` :
          `Pago por inscripción #${inscripcionId}`),
      estado: 'pagado',
      referencia: `PAGO-INSCRIPCION-${inscripcionId}-${Date.now().toString().slice(-6)}`
    };

    // Agregar campos para pagos divididos
    if (dividirPago.value && pagoForm.value.monto < getPrecioTotal()) {
      datosPagoPrimero.es_parcial = true;
      datosPagoPrimero.pago_grupo_id = String(pagoGrupoId); 
      datosPagoPrimero.numero_cuota = 1;
    }

    console.log('💰 Enviando datos del primer pago...', datosPagoPrimero);

    const responsePago = await pagoService.store(datosPagoPrimero);

    console.log('📥 Respuesta del servidor (primer pago):', responsePago.data);

    if (responsePago.data) {
      if (responsePago.data.success === true || responsePago.data.id) {
        pagoRegistrado = true;
        console.log('✅ Primer pago registrado exitosamente');
      } else if (responsePago.data.success === false) {
        console.warn('⚠️ El pago no se registró correctamente:', responsePago.data.message);
      }
    }

    // SEGUNDO PAGO (solo si es dividido y hay saldo)
    if (dividirPago.value && pagoForm.value.monto < getPrecioTotal()) {
      const saldoPendiente = getPrecioTotal() - pagoForm.value.monto;

      // Calcular fecha de vencimiento (15 días después por defecto)
      const fechaVencimiento = new Date(pagoForm.value.fecha_pago || new Date());
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);

      const datosPagoSegundo = {
        inscripcion_id: inscripcionId,
        estudiante_id: estudianteSeleccionado.value.id,
        monto: saldoPendiente,
        metodo_pago: null,
        fecha_pago: null,
        fecha_vencimiento: formatDateToYMD(fechaVencimiento), // ← FECHA DE VENCIMIENTO
        observacion: `Segunda cuota pendiente. Vence el ${formatFecha(fechaVencimiento)}. Total: $${getPrecioTotal()}, Pagado: $${pagoForm.value.monto}`,
        estado: 'pendiente', // ← ESTADO PENDIENTE (NO 'vencido' todavía)
        referencia: `SALDO-${inscripcionId}-${pagoGrupoId}`,
        es_parcial: true,
        pago_grupo_id: pagoGrupoId,
        numero_cuota: 2
      };

      console.log('💰 Creando segundo pago pendiente...', datosPagoSegundo);

      try {
        await pagoService.store(datosPagoSegundo);
        console.log('✅ Segundo pago (pendiente) registrado');

        // Agregar al contador de pagos registrados
        pagoRegistrado = true;

        // Mostrar información específica sobre el pago pendiente
        toast.add({
          severity: 'info',
          summary: 'Segunda cuota creada',
          detail: `Cuota pendiente de $${saldoPendiente.toFixed(2)} con vencimiento ${formatFecha(fechaVencimiento)}`,
          life: 6000
        });
      } catch (pagoError) {
        console.warn('⚠️ No se pudo registrar el segundo pago pendiente:', pagoError.message);
        // Continuar aunque falle el segundo pago
      }
    }

    // ========== PASO 5: VERIFICAR Y ACTUALIZAR ESTADO FINAL ==========
    console.log('🔄 PASO 5: Verificando estado final...');

    // Si hay saldo pendiente pero no se marcó como dividido, también actualizar estado
    if (!dividirPago.value && pagoForm.value.monto < getPrecioTotal()) {
      const saldoPendiente = getPrecioTotal() - pagoForm.value.monto;

      // Crear pago pendiente automáticamente
      const datosPagoPendiente = {
        inscripcion_id: inscripcionId,
        estudiante_id: estudianteSeleccionado.value.id,
        monto: saldoPendiente,
        metodo_pago: null,
        fecha_pago: null,
        fecha_vencimiento: formatDateToYMD(new Date(new Date().setDate(new Date().getDate() + 7))), // 7 días
        observacion: `Saldo pendiente de pago parcial. Total: $${getPrecioTotal()}, Pagado: $${pagoForm.value.monto}`,
        estado: 'pendiente',
        referencia: `SALDO-PARCIAL-${inscripcionId}`,
        es_parcial: true,
        numero_cuota: 1
      };

      try {
        await pagoService.store(datosPagoPendiente);
        console.log('✅ Pago pendiente registrado para saldo parcial');
      } catch (error) {
        console.warn('⚠️ No se pudo registrar pago pendiente:', error.message);
      }
    }

    // ========== ÉXITO - PROCESO COMPLETADO ==========
    cerrarDialogoCompleto();

    // Preparar mensaje de éxito detallado
    let mensajeDetalle = `✅ Inscripción #${inscripcionId} creada exitosamente para ${estudianteBackup?.nombres || 'el estudiante'}.`;

    if (totalClasesGeneradas > 0) {
      mensajeDetalle += ` ${totalClasesGeneradas} clases programadas generadas.`;
    } else {
      mensajeDetalle += ` Las clases se generarán automáticamente.`;
    }

    // Mensaje específico según tipo de pago y estado
    const saldoPendiente = getPrecioTotal() - pagoForm.value.monto;

    if (saldoPendiente > 0) {
      mensajeDetalle += `\n💰 Estado: <span class="font-bold text-red-500">EN MORA</span>`;
      mensajeDetalle += `\n💳 Pagado: $${pagoForm.value.monto} (${metodoPagoBackup})`;
      mensajeDetalle += `\n📅 Saldo pendiente: <span class="font-bold text-red-500">$${saldoPendiente.toFixed(2)}</span>`;

      if (dividirPago.value) {
        mensajeDetalle += `\n📋 Segunda cuota vence en 15 días`;
      }
    } else {
      mensajeDetalle += `\n💰 Estado: <span class="font-bold text-green-500">ACTIVO</span>`;
      mensajeDetalle += `\n💳 Pago completo: $${montoBackup} (${metodoPagoBackup})`;
    }

    // Mostrar mensaje de éxito principal
    toast.add({
      severity: saldoPendiente > 0 ? 'warn' : 'success',
      summary: saldoPendiente > 0 ? '¡Inscripción creada (EN MORA)!' : '¡Registro Completado!',
      detail: mensajeDetalle,
      life: 8000
    });

    // Mostrar resumen en consola
    console.log('🎉 RESUMEN DEL REGISTRO:', {
      inscripcionId: inscripcionId,
      estudiante: estudianteBackup ? `${estudianteBackup.nombres} ${estudianteBackup.apellidos}` : 'Desconocido',
      modalidad: modalidadBackup?.nombre || 'Desconocida',
      horarios: horariosBackup.length,
      periodo: `${fechaInicioFormateada} al ${fechaFinFormateada}`,
      clasesTotales: clasesTotales,
      clasesGeneradas: totalClasesGeneradas,
      montoPagado: montoBackup,
      saldoPendiente: saldoPendiente,
      estadoInscripcion: estadoInscripcion,
      metodoPago: metodoPagoBackup,
      pagoDividido: dividirPago.value,
      pagoGrupoId: pagoGrupoId,
      pagoRegistrado: pagoRegistrado,
      fecha: new Date().toLocaleString()
    });

    // ========== RECARGAR DATOS DESPUÉS DE 2 SEGUNDOS ==========
    setTimeout(() => {
      cargarDatos();
      console.log('🔄 Datos recargados después del registro');
    }, 2000);

  } catch (error) {
    console.error('❌ ERROR EN EL PROCESO:', error);

    let mensajeError = 'Error al procesar la solicitud';
    let detallesError = '';

    if (error.response) {
      console.error('📥 Datos del error del servidor:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });

      if (error.response.data) {
        if (error.response.data.errors) {
          const errores = Object.values(error.response.data.errors).flat();
          mensajeError = 'Errores de validación:';
          detallesError = errores.join(', ');
        }
        else if (error.response.data.conflictos || error.response.data.horarios_llenos) {
          mensajeError = error.response.data.message || 'Conflicto detectado';
          if (error.response.data.conflictos) {
            detallesError = 'El estudiante ya está inscrito en alguno de los horarios seleccionados';
          } else if (error.response.data.horarios_llenos) {
            detallesError = 'Algunos horarios ya están llenos';
          }
        }
        else if (error.response.data.message) {
          mensajeError = error.response.data.message;
        } else if (error.response.data.error) {
          mensajeError = error.response.data.error;
        }
      }

      // Mensajes específicos por código de error
      if (error.response.status === 422) {
        mensajeError = 'Datos inválidos en el formulario';
      } else if (error.response.status === 401) {
        mensajeError = 'Sesión expirada. Por favor inicie sesión nuevamente';
      } else if (error.response.status === 403) {
        mensajeError = 'No tiene permisos para realizar esta acción';
      } else if (error.response.status === 404) {
        mensajeError = 'Recurso no encontrado';
      } else if (error.response.status === 409) {
        mensajeError = 'Conflicto: ' + (error.response.data.message || 'Recurso ya existe');
      } else if (error.response.status === 500) {
        mensajeError = 'Error interno del servidor';
      }

    } else if (error.request) {
      mensajeError = 'Error de conexión con el servidor';
      detallesError = 'Verifique su conexión a internet e intente nuevamente';
    } else {
      mensajeError = error.message || 'Error desconocido en el proceso';
    }

    const mensajeFinal = detallesError ? `${mensajeError}: ${detallesError}` : mensajeError;

    toast.add({
      severity: 'error',
      summary: 'Error en el Proceso',
      detail: mensajeFinal,
      life: 8000
    });

    // Si hay un ID de inscripción pero falló algo después, mostrar opción para continuar
    if (inscripcionId && !pagoRegistrado) {
      console.warn(`⚠️ Inscripción #${inscripcionId} creada pero pago no registrado. Se puede registrar después.`);

      setTimeout(() => {
        toast.add({
          severity: 'warn',
          summary: 'Acción pendiente',
          detail: `La inscripción #${inscripcionId} se creó pero el pago no se registró. Puede registrar el pago manualmente.`,
          life: 10000
        });
      }, 2000);
    }

  } finally {
    // ========== FINALIZAR ==========
    guardando.value = false;
    console.log('🏁 Proceso de guardado finalizado');
  }
}

// Agrega esta función en tu script
async function actualizarEstadoInscripcionPorPagos(inscripcionId) {
  try {
    // Obtener todos los pagos de la inscripción
    const response = await pagoService.getPorInscripcion(inscripcionId);
    const pagos = response.data.data || response.data || [];

    // Verificar si hay pagos pendientes o vencidos
    const pagosPendientes = pagos.filter(p =>
      p.estado === 'pendiente' || p.estado === 'vencido'
    );

    const pagosVencidos = pagos.filter(p =>
      p.estado === 'vencido' ||
      (p.estado === 'pendiente' && p.fecha_vencimiento && new Date(p.fecha_vencimiento) < new Date())
    );

    let nuevoEstado = 'activo';

    if (pagosVencidos.length > 0) {
      nuevoEstado = 'en_mora'; // Pagos vencidos = MORA
    } else if (pagosPendientes.length > 0) {
      nuevoEstado = 'en_mora'; // Pagos pendientes = MORA
    } else {
      nuevoEstado = 'activo'; // Todos los pagos al día
    }

    // Actualizar estado de la inscripción
    await inscripcionService.updateEstado(inscripcionId, nuevoEstado);

    console.log(`🔄 Inscripción #${inscripcionId} actualizada a: ${nuevoEstado}`);

    return nuevoEstado;

  } catch (error) {
    console.error('Error actualizando estado por pagos:', error);
    return null;
  }
}

// Agrega esta función en tu sección de funciones, cerca de getTooltipRenovacion
function getEstadoRenovacion(inscripcion) {
  if (!inscripcion) return 'Sin información';

  // Si no puede renovar
  if (!puedeRenovar(inscripcion)) {
    return 'No puede renovar';
  }

  const diasRestantes = calcularDiasRestantes(inscripcion.fecha_fin);

  if (diasRestantes > 7) {
    return 'Renovación disponible';
  } else if (diasRestantes >= 0) {
    return '¡Pronto a vencer!';
  } else {
    return `Vencida hace ${Math.abs(diasRestantes)} días`;
  }
}



function verificarEstadoClases(inscripcion) {
  try {
    if (!inscripcion || inscripcion.estado !== 'activo') {
      return { necesitaAlerta: false };
    }

    // Asegurar valores numéricos
    const total = parseInt(inscripcion.clases_totales) || 0;
    const asistidas = parseInt(inscripcion.clases_asistidas) || 0;

    if (total <= 0) {
      return { necesitaAlerta: false };
    }

    const restantes = total - asistidas;

    // Verificar si está en umbral de alerta
    const enUmbral = configAlertas.umbrales.includes(restantes);

    if (!enUmbral) {
      return {
        necesitaAlerta: false,
        datos: {
          total,
          asistidas,
          restantes,
          porcentaje: Math.round((asistidas / total) * 100)
        }
      };
    }

    // Determinar nivel de alerta
    let nivel = 'info';
    let icono = 'pi-info-circle';
    let color = 'text-blue-500';
    let claseCSS = 'alerta-info';

    if (restantes === 1) {
      nivel = 'critico';
      icono = 'pi-exclamation-triangle';
      color = 'text-red-500';
      claseCSS = 'alerta-critica';
    } else if (restantes === 2) {
      nivel = 'advertencia';
      icono = 'pi-exclamation-circle';
      color = 'text-yellow-500';
      claseCSS = 'alerta-advertencia';
    } else if (restantes === 3) {
      nivel = 'info';
      icono = 'pi-info-circle';
      color = 'text-blue-500';
      claseCSS = 'alerta-info';
    }

    // Generar mensajes
    const mensajes = {
      critico: `¡ÚLTIMA CLASE! Solo queda 1 clase`,
      advertencia: `¡ATENCIÓN! Solo quedan ${restantes} clases`,
      info: `Quedan ${restantes} clases restantes`
    };

    return {
      necesitaAlerta: true,
      nivel,
      icono,
      color,
      claseCSS,
      mensaje: mensajes[nivel] || `Quedan ${restantes} clases`,
      datos: {
        total,
        asistidas,
        restantes,
        porcentaje: Math.round((asistidas / total) * 100),
        inscripcion_id: inscripcion.id,
        estudiante_nombre: inscripcion.estudiante?.nombres || 'Estudiante',
        modalidad: inscripcion.modalidad?.nombre || 'Sin modalidad'
      }
    };

  } catch (error) {
    console.error('Error verificando estado de clases:', error);
    return { necesitaAlerta: false };
  }
}

function mostrarAlertasUI(inscripciones) {
  if (!configAlertas.mostrarToast || !inscripciones.length) return;

  // Filtrar solo las que necesitan alerta
  const alertas = inscripciones
    .map(insc => ({
      inscripcion: insc,
      verificacion: verificarEstadoClases(insc)
    }))
    .filter(item => item.verificacion.necesitaAlerta);

  if (alertas.length === 0) return;

  // Evitar mostrar la misma alerta repetidamente
  const alertasNuevas = alertas.filter(item => {
    const key = `${item.inscripcion.id}_${item.verificacion.datos.restantes}`;
    if (alertasMostradas.value[key]) {
      return false;
    }
    alertasMostradas.value[key] = true;
    return true;
  });

  if (alertasNuevas.length === 0) return;

  // Mostrar cada alerta individualmente
  alertasNuevas.forEach((item, index) => {
    setTimeout(() => {
      const estudiante = item.inscripcion.estudiante;
      const nombre = estudiante ? `${estudiante.nombres} ${estudiante.apellidos}`.trim() : 'Estudiante';

      let severity = 'info';
      if (item.verificacion.nivel === 'critico') severity = 'error';
      if (item.verificacion.nivel === 'advertencia') severity = 'warn';

      toast.add({
        severity: severity,
        summary: `📢 Alerta de Clases - ${nombre}`,
        detail: `${item.verificacion.mensaje}\nClases: ${item.verificacion.datos.asistidas}/${item.verificacion.datos.total}`,
        life: 5000
      });
    }, index * 1000); // Espaciar las notificaciones
  });

  // También mostrar un resumen
  setTimeout(() => {
    if (alertasNuevas.length > 1) {
      toast.add({
        severity: 'info',
        summary: '📊 Resumen de Alertas',
        detail: `${alertasNuevas.length} estudiante(s) cerca de completar sus clases`,
        life: 4000
      });
    }
  }, (alertasNuevas.length + 1) * 1000);
}


function getClasesProgresoConAlerta(inscripcion) {
  const base = getClasesProgreso(inscripcion);
  const alerta = verificarEstadoClases(inscripcion);

  // Asegurar que alerta.datos.porcentaje exista
  const alertaConPorcentaje = {
    ...alerta,
    datos: {
      ...alerta.datos,
      porcentaje: alerta.datos?.porcentaje || base.porcentaje || 0
    }
  };

  return {
    ...base,
    tieneAlerta: alertaConPorcentaje.necesitaAlerta,
    alertaInfo: alertaConPorcentaje,
    // También incluir porcentaje directamente por si acaso
    porcentaje: base.porcentaje || 0
  };
}

function calcularProgresoConEstilo(inscripcion) {
  const progreso = calcularProgresoClases(inscripcion);
  const alerta = verificarEstadoClases(inscripcion);

  return {
    valor: progreso,
    clase: alerta.claseCSS || '',
    tieneAlerta: alerta.necesitaAlerta
  };
}

function getMensajeProgreso(inscripcion) {
  const alerta = verificarEstadoClases(inscripcion);

  if (alerta.necesitaAlerta) {
    return alerta.mensaje;
  }

  const progreso = getClasesProgreso(inscripcion);
  return `${progreso.asistidas}/${progreso.total} clases (${progreso.restantes || progreso.total - progreso.asistidas} restantes)`;
}
// Agrega estas funciones en tu script

function debeMostrarAlerta(inscripcion) {
  const verificacion = verificarUmbralClases(inscripcion);
  return verificacion.necesitaNotificar;
}

function getTooltipAlerta(inscripcion) {
  const verificacion = verificarUmbralClases(inscripcion);
  return verificacion.mensaje;
}

function getMensajeAlerta(inscripcion) {
  const verificacion = verificarUmbralClases(inscripcion);
  return verificacion.mensaje;
}

function getClaseProgreso(inscripcion) {
  const verificacion = verificarUmbralClases(inscripcion);

  if (verificacion.nivel === 'CRÍTICO') return 'progressbar-critico';
  if (verificacion.nivel === 'ÚLTIMA') return 'progressbar-ultima';
  if (verificacion.necesitaNotificar) return 'progressbar-alerta';

  return '';
}

// ========== FUNCIONES AUXILIARES NECESARIAS ==========

// Función para validar que el período sea suficiente
function validarPeriodoSuficiente(fechaInicio, fechaFin, horarios) {
  if (!fechaInicio || !fechaFin || !horarios?.length) {
    return { valido: false, mensaje: 'Datos insuficientes para validar el período' };
  }

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    return { valido: false, mensaje: 'Fechas inválidas' };
  }

  // Calcular días del período
  const diasTotales = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));

  // ========== CORRECCIÓN IMPORTANTE ==========
  // Si hay horarios de domingo, necesitamos al menos 7 días para asegurar que haya un domingo
  const tieneDomingo = horarios.some(h =>
    h.dia_semana?.toLowerCase().includes('domingo')
  );

  if (tieneDomingo && diasTotales < 7) {
    return {
      valido: false,
      mensaje: `El período seleccionado (${diasTotales} días) es muy corto. Se necesitan al menos 7 días para incluir un día domingo.`
    };
  }

  // Para otros días, al menos 1 semana
  const diasMinimosRecomendados = 7;

  if (diasTotales < diasMinimosRecomendados) {
    return {
      valido: false,
      mensaje: `El período seleccionado (${diasTotales} días) es muy corto. Se recomiendan al menos ${diasMinimosRecomendados} días para asegurar que todos los horarios tengan clases.`
    };
  }

  return { valido: true, mensaje: '' };
}

// Función calcularDistribucionPorHorario corregida
function calcularDistribucionPorHorario(fechaInicio, fechaFin, horarios) {
  console.log('🔄 Calculando distribución REAL...');
  console.log('📅 Fechas:', fechaInicio, 'al', fechaFin);
  console.log('⏰ Horarios seleccionados:', horarios.map(h => `${h.id}: ${h.dia_semana}`));

  // ========== MAPEO COMPLETO Y ROBUSTO ==========
  const diasSemanaMap = {
    // Minúsculas
    'lunes': 1,
    'martes': 2,
    'miércoles': 3,
    'miercoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sábado': 6,
    'sabado': 6,
    'domingo': 0,

    // Con mayúscula inicial
    'Lunes': 1,
    'Martes': 2,
    'Miércoles': 3,
    'Miercoles': 3,
    'Jueves': 4,
    'Viernes': 5,
    'Sábado': 6,
    'Sabado': 6,
    'Domingo': 0,

    // Todo mayúsculas
    'LUNES': 1,
    'MARTES': 2,
    'MIÉRCOLES': 3,
    'MIERCOLES': 3,
    'JUEVES': 4,
    'VIERNES': 5,
    'SÁBADO': 6,
    'SABADO': 6,
    'DOMINGO': 0
  };

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  // DEBUG: Mostrar información del período
  console.log('📊 DEBUG del período:');
  console.log(`  Inicio: ${inicio.toLocaleDateString('es-ES')}`);
  console.log(`  Fin: ${fin.toLocaleDateString('es-ES')}`);

  const diasTotales = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
  console.log(`  Días totales: ${diasTotales}`);

  // Mostrar todos los días del período para debug
  console.log('📅 Días del período:');
  let fechaDebug = new Date(inicio);
  for (let i = 0; i < diasTotales; i++) {
    const diaNum = fechaDebug.getDay();
    const diaNombre = fechaDebug.toLocaleDateString('es-ES', { weekday: 'long' });
    console.log(`  ${i + 1}. ${diaNombre} (${diaNum}): ${fechaDebug.toLocaleDateString('es-ES')}`);
    fechaDebug.setDate(fechaDebug.getDate() + 1);
  }

  // Calcular para cada horario
  const distribucionCalculada = horarios.map(horario => {
    const diaOriginal = horario.dia_semana;
    const diaLower = diaOriginal?.toLowerCase() || '';

    // Buscar en el mapa
    let diaHorario = diasSemanaMap[diaOriginal] ||
      diasSemanaMap[diaLower] ||
      -1;

    console.log(`\n📊 Analizando horario ${horario.id}:`);
    console.log(`  Día original: "${diaOriginal}"`);
    console.log(`  Día lower: "${diaLower}"`);
    console.log(`  Día mapeado a JS: ${diaHorario}`);

    // Si aún no encontramos el día, hacer búsqueda parcial
    if (diaHorario === -1) {
      if (diaLower.includes('domingo')) diaHorario = 0;
      else if (diaLower.includes('sabado') || diaLower.includes('sábado')) diaHorario = 6;
      else if (diaLower.includes('viernes')) diaHorario = 5;
      else if (diaLower.includes('jueves')) diaHorario = 4;
      else if (diaLower.includes('miercoles') || diaLower.includes('miércoles')) diaHorario = 3;
      else if (diaLower.includes('martes')) diaHorario = 2;
      else if (diaLower.includes('lunes')) diaHorario = 1;

      if (diaHorario !== -1) {
        console.log(`  🔍 Encontrado por búsqueda parcial: ${diaHorario}`);
      }
    }

    let clases = 0;
    let fechaActual = new Date(inicio);
    let diasCoincidentes = [];

    // Contar días coincidentes
    while (fechaActual <= fin) {
      const diaActual = fechaActual.getDay();
      const fechaStr = fechaActual.toLocaleDateString('es-ES');

      if (diaHorario === diaActual) {
        clases++;
        diasCoincidentes.push(fechaStr);
      }

      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    console.log(`  Clases encontradas: ${clases}`);
    if (diasCoincidentes.length > 0) {
      console.log(`  Fechas: ${diasCoincidentes.join(', ')}`);
    } else {
      console.warn(`  ⚠️ NO SE ENCONTRARON CLASES para este día en el período`);
    }

    return {
      horario_id: horario.id,
      dia_semana: diaOriginal,
      dia_numero_js: diaHorario,
      clases_totales: clases
    };
  });

  // Validar que todos los horarios tengan al menos 1 clase
  const horariosSinClases = distribucionCalculada.filter(d => d.clases_totales === 0);  // <-- ¡CORREGIDO!

  if (horariosSinClases.length > 0) {
    const mensajeHorarios = horariosSinClases.map((d, i) => {
      return `"${d.dia_semana || 'Sin día'}" (ID: ${d.horario_id})`;
    }).join(', ');

    // DEBUG adicional: mostrar qué días sí hay en el período
    console.error('\n❌ HORARIOS SIN CLASES DETECTADOS:');
    horariosSinClases.forEach(d => {
      console.error(`  - Horario ${d.horario_id} (${d.dia_semana}):`);
      console.error(`    * Buscaba día JS: ${d.dia_numero_js}`);
    });

    throw new Error(`Los siguientes horarios no tienen clases en el período seleccionado: ${mensajeHorarios}. Por favor, extienda la fecha de fin o verifique las fechas.`);
  }

  // Formato para backend
  return distribucionCalculada.map(d => ({
    horario_id: d.horario_id,
    clases_totales: d.clases_totales,
    clases_asistidas: 0,
    clases_restantes: d.clases_totales,
    estado: 'activo'
  }));
}
// Función para calcular clases reales
function calcularClasesReales(fechaInicio, fechaFin, horarios) {
  if (!fechaInicio || !fechaFin || !horarios?.length) {
    return 0;
  }

  // Mismo mapeo corregido
  const diasSemanaMap = {
    'lunes': 1,
    'martes': 2,
    'miércoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sábado': 6,
    'sabado': 6,
    'domingo': 0,
    'domingos': 0
  };

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    console.error('❌ Fechas inválidas en calcularClasesReales');
    return 0;
  }

  let totalClases = 0;
  let fechaActual = new Date(inicio);

  console.log('📊 Calculando clases reales:');
  console.log(`  Período: ${inicio.toLocaleDateString()} al ${fin.toLocaleDateString()}`);

  while (fechaActual <= fin) {
    const diaActual = fechaActual.getDay();
    const diaNombre = fechaActual.toLocaleDateString('es-ES', { weekday: 'long' });

    horarios.forEach(horario => {
      const diaHorario = diasSemanaMap[horario.dia_semana?.toLowerCase()] || -1;
      if (diaHorario === diaActual) {
        totalClases++;
        console.log(`  ✓ ${diaNombre} ${fechaActual.toLocaleDateString()}: ${horario.dia_semana} ${horario.hora_inicio}`);
      }
    });

    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  console.log(`  Total clases reales: ${totalClases}`);
  return totalClases;
}

// Agrega esta función en el script de inscripciones.vue
function verificarUmbralClases(inscripcion) {
  console.log('🔍 Verificando inscripción:', inscripcion.id);

  const total = parseInt(inscripcion.clases_totales) || 0;
  const asistidas = parseInt(inscripcion.clases_asistidas) || 0;

  console.log(`   Total: ${total}, Asistidas: ${asistidas}`);

  // Umbrales de alerta (2 o 3 clases antes del total)
  const umbralAlerta = 3;
  const umbralCritico = 2;

  const restantes = total - asistidas;

  let necesitaNotificar = false;
  let nivel = '';
  let mensaje = '';

  if (restantes <= umbralAlerta && restantes > 0) {
    necesitaNotificar = true;

    if (restantes === umbralCritico) {
      nivel = 'CRÍTICO';
      mensaje = `¡CRÍTICO! Solo quedan ${restantes} clases`;
    } else if (restantes === 1) {
      nivel = 'ÚLTIMA';
      mensaje = `¡ÚLTIMA CLASE! Solo queda 1 clase`;
    } else {
      nivel = 'ALERTA';
      mensaje = `Quedan ${restantes} clases`;
    }

    console.log(`🚨 ${nivel}: ${mensaje} (Inscripción #${inscripcion.id})`);
  }

  return {
    necesitaNotificar,
    nivel,
    mensaje,
    datos: {
      id: inscripcion.id,
      estudiante_id: inscripcion.estudiante_id,
      total: total,
      asistidas: asistidas,
      restantes: restantes,
      porcentaje: total > 0 ? Math.round((asistidas / total) * 100) : 0
    }
  };
}

// Función para calcular clases totales
function calcularClasesTotales() {
  if (!modalidadSeleccionada.value) return 12;

  const meses = calcularMesesDuracion();
  return modalidadSeleccionada.value.clases_mensuales * meses;
}

// Función para calcular meses de duración
function calcularMesesDuracion() {
  if (!inscripcionForm.value.fecha_inicio || !inscripcionForm.value.fecha_fin) {
    return 1;
  }

  const inicio = new Date(inscripcionForm.value.fecha_inicio);
  const fin = new Date(inscripcionForm.value.fecha_fin);
  const diffMeses = (fin.getFullYear() - inicio.getFullYear()) * 12 +
    (fin.getMonth() - inicio.getMonth());

  return Math.max(1, diffMeses);
}

async function verClasesProgramadas(inscripcionId) {
  try {
    console.log('📅 Cargando clases programadas para inscripción:', inscripcionId);

    const response = await axios.get(`/api/clases-programadas`, {
      params: {
        inscripcion_id: inscripcionId,
        fecha_desde: new Date().toISOString().split('T')[0],
        sort: 'fecha_asc'
      },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    if (response.data?.success) {
      return response.data.clases.data || [];
    }
    return [];
  } catch (error) {
    console.error('Error cargando clases programadas:', error);
    return [];
  }
}

// Agrega esta función en tu script


function cerrarDialogoCompleto() {
  dialogoInscripcion.value = false;
  pasoActual.value = 0;
  estudianteSeleccionado.value = null;
  buscarEstudiante.value = '';
  horariosSeleccionados.value = [];
  horariosSeleccionadosDetalles.value = [];
  modalidadSeleccionada.value = null;
  modalidades.value = [];
  horariosDisponibles.value = [];

  // Resetear formularios
  inscripcionForm.value = {
    fecha_inicio: new Date(),
    fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1))
  };

  pagoForm.value = {
    monto: 0,
    metodo_pago: null,
    fecha_pago: new Date(),
    observacion: ''
  };
}

async function cargarEstudiantesParaDialogo() {
  cargandoEstudiantes.value = true;
  try {
    console.log('=== CARGANDO ESTUDIANTES ===');
    const response = await estudianteService.obtenerTodos();

    console.log('Respuesta completa:', response);
    console.log('response.data:', response.data);
    console.log('¿Es array?:', Array.isArray(response.data));

    if (response.data && Array.isArray(response.data)) {
      estudiantes.value = response.data;
      console.log('Cargados', estudiantes.value.length, 'estudiantes');
    } else if (Array.isArray(response)) {
      estudiantes.value = response;
      console.log('Cargados (array directo):', estudiantes.value.length, 'estudiantes');
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      estudiantes.value = response.data.data;
      console.log('Cargados (data.data):', estudiantes.value.length, 'estudiantes');
    } else {
      estudiantes.value = [];
      console.warn('No se pudieron cargar estudiantes, estructura desconocida');
    }

  } catch (error) {
    console.error('Error cargando estudiantes:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los estudiantes',
      life: 3000
    });
  } finally {
    cargandoEstudiantes.value = false;
  }
}




async function cargarModalidades() {
  cargandoModalidades.value = true;
  try {
    console.log('📦 Cargando modalidades...');

    // Opción 1: Usar el método index con filtros
    const response = await modalidadService.index(1, 100, '', {
      estado: 'activo'
    });

    console.log('📥 Respuesta completa:', response);
    console.log('📥 Datos recibidos:', response.data);

    let datosModalidades = [];

    // Manejar diferentes estructuras de respuesta
    if (response.data) {
      // Estructura 1: Laravel con paginación
      if (response.data.data && Array.isArray(response.data.data)) {
        datosModalidades = response.data.data;
      }
      // Estructura 2: Array directo
      else if (Array.isArray(response.data)) {
        datosModalidades = response.data;
      }
      // Estructura 3: Con success wrapper
      else if (response.data.success && response.data.data) {
        if (Array.isArray(response.data.data)) {
          datosModalidades = response.data.data;
        } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          datosModalidades = response.data.data.data; // Paginación anidada
        }
      }
    }

    // Asegurar que sea array
    if (!Array.isArray(datosModalidades)) {
      console.warn('⚠️ Los datos no son un array, convirtiendo:', datosModalidades);
      datosModalidades = [];
    }

    // Filtrar por estado activo (por si acaso)
    modalidades.value = datosModalidades.filter(m =>
      m.estado === 'activo' || m.estado === undefined || m.estado === null
    );

    console.log(`✅ ${modalidades.value.length} modalidades cargadas:`,
      modalidades.value.map(m => ({ id: m.id, nombre: m.nombre, estado: m.estado }))
    );

    // Mostrar toast si no hay modalidades
    if (modalidades.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Sin modalidades',
        detail: 'No se encontraron modalidades activas',
        life: 3000
      });
    }

  } catch (error) {
    console.error('❌ Error cargando modalidades:', error);

    // Intentar método alternativo
    try {
      console.log('🔄 Intentando método alternativo...');
      const responseAlt = await modalidadService.obtenerTodas();

      if (responseAlt.data) {
        let datosAlt = [];

        if (Array.isArray(responseAlt.data)) {
          datosAlt = responseAlt.data;
        } else if (responseAlt.data.data && Array.isArray(responseAlt.data.data)) {
          datosAlt = responseAlt.data.data;
        }

        modalidades.value = datosAlt.filter(m =>
          m.estado === 'activo' || m.estado === undefined || m.estado === null
        );

        console.log(`🔄 ${modalidades.value.length} modalidades cargadas (método alternativo)`);
      }
    } catch (secondError) {
      console.error('❌ Error en método alternativo:', secondError);

      toast.add({
        severity: 'error',
        summary: 'Error de conexión',
        detail: 'No se pudo conectar con el servidor de modalidades',
        life: 4000
      });

      modalidades.value = [];
    }
  } finally {
    cargandoModalidades.value = false;
  }
}

// Computed para modalidades con emoji y precio formateado
const modalidadesConInfo = computed(() => {
  const emojisPorDisciplina = {
    1: '🥋', // Jujitsu
    2: '🥊', // Boxing
    8: '🏋️'  // Gimnasio
  }

  return modalidades.value.map(modalidad => {
    const emoji = emojisPorDisciplina[modalidad.disciplina_id] || '🎯'

    return {
      ...modalidad,
      emoji: emoji,
      precio_formateado: `$${modalidad.precio_mensual}`,
      descripcion_corta: modalidad.descripcion ?
        (modalidad.descripcion.length > 30 ?
          modalidad.descripcion.substring(0, 30) + '...' :
          modalidad.descripcion) :
        'Sin descripción'
    }
  })
})


// Al seleccionar una modalidad, mostrar información
const modalidadSeleccionadaInfo = computed(() => {
  if (filtroModalidad.value === null) return null
  return modalidades.value.find(m => m.id === filtroModalidad.value)
})

function getClasesProgreso(inscripcion) {
  console.log('📋 Obteniendo progreso de clases para inscripción:', inscripcion.id);

  // DEBUG: Ver qué datos tenemos
  console.log('📋 Datos disponibles:', {
    clases_asistidas: inscripcion.clases_asistidas,
    clases_totales: inscripcion.clases_totales,
    clases_restantes_calculadas: inscripcion.clases_restantes_calculadas,
    inscripcion_horarios: inscripcion.inscripcion_horarios?.length
  });

  // CASO 1: Usar campos directos si existen
  const asistidasDirectas = parseInt(inscripcion.clases_asistidas) || 0;
  const totalDirecto = parseInt(inscripcion.clases_totales) || 0;
  const restantesDirectos = parseInt(inscripcion.clases_restantes_calculadas) || 0;

  if (totalDirecto > 0) {
    console.log(`📋 Usando datos directos: Asistidas=${asistidasDirectas}, Total=${totalDirecto}, Restantes=${restantesDirectos}`);
    return {
      asistidas: asistidasDirectas,
      total: totalDirecto,
      restantes: restantesDirectos
    };
  }

  // CASO 2: Si tiene inscripcion_horarios
  if (inscripcion.inscripcion_horarios && inscripcion.inscripcion_horarios.length > 0) {
    console.log('📅 Calculando desde inscripcion_horarios');

    let totalClases = 0;
    let totalAsistidas = 0;
    let totalRestantes = 0;

    inscripcion.inscripcion_horarios.forEach(ih => {
      const clasesTotales = parseInt(ih.clases_totales) || 0;
      const clasesAsistidas = parseInt(ih.clases_asistidas) || 0;
      const clasesRestantes = parseInt(ih.clases_restantes) || 0;

      totalClases += clasesTotales;
      totalAsistidas += clasesAsistidas;
      totalRestantes += clasesRestantes;
    });

    console.log(`📋 Progreso desde horarios: Asistidas=${totalAsistidas}, Total=${totalClases}, Restantes=${totalRestantes}`);
    return {
      asistidas: totalAsistidas,
      total: totalClases,
      restantes: totalRestantes
    };
  }

  // CASO 3: Calcular basado en modalidad y duración
  const mesesDuracion = calcularMesesDuracionInscripcion(inscripcion);
  const clasesPorMes = parseInt(inscripcion.modalidad?.clases_mensuales) || 12;
  const totalCalculado = clasesPorMes * mesesDuracion;

  // Si tenemos clases restantes, calcular asistidas
  const restantes = restantesDirectos || totalCalculado;
  const asistidas = Math.max(0, totalCalculado - restantes);

  console.log(`📋 Progreso calculado: Asistidas=${asistidas}, Total=${totalCalculado}, Restantes=${restantes}`);

  return {
    asistidas: asistidas,
    total: totalCalculado,
    restantes: restantes
  };
}


function calcularProgresoClases(inscripcion) {
  console.log('📊 Calculando progreso para inscripción:', inscripcion.id);

  // CASO 1: Si tiene inscripcion_horarios con datos de progreso
  if (inscripcion.inscripcion_horarios && inscripcion.inscripcion_horarios.length > 0) {
    console.log('📅 Usando datos de inscripcion_horarios:', inscripcion.inscripcion_horarios);

    let totalClases = 0;
    let totalAsistidas = 0;
    let totalRestantes = 0;

    // Calcular totales a partir de inscripcion_horarios
    inscripcion.inscripcion_horarios.forEach(ih => {
      const clasesTotales = parseInt(ih.clases_totales) || 0;
      const clasesAsistidas = parseInt(ih.clases_asistidas) || 0;
      const clasesRestantes = parseInt(ih.clases_restantes) || 0;

      totalClases += clasesTotales;
      totalAsistidas += clasesAsistidas;
      totalRestantes += clasesRestantes;
    });

    console.log(`📊 Totales: Clases=${totalClases}, Asistidas=${totalAsistidas}, Restantes=${totalRestantes}`);

    // Si hay totalClases, calcular porcentaje
    if (totalClases > 0) {
      const porcentaje = (totalAsistidas / totalClases) * 100;
      console.log(`📊 Porcentaje calculado: ${porcentaje}%`);
      return Math.min(100, Math.max(0, porcentaje));
    }
  }

  // CASO 2: Si tiene campos directos en la inscripción
  const totalClasesDirecto = parseInt(inscripcion.clases_totales) ||
    (parseInt(inscripcion.modalidad?.clases_mensuales) || 12) *
    calcularMesesDuracionInscripcion(inscripcion);

  const clasesRestantesDirecto = parseInt(inscripcion.clases_restantes_calculadas) ||
    parseInt(inscripcion.clases_restantes) ||
    totalClasesDirecto;

  const clasesAsistidasDirecto = Math.max(0, totalClasesDirecto - clasesRestantesDirecto);

  console.log(`📊 Datos directos: Total=${totalClasesDirecto}, Restantes=${clasesRestantesDirecto}, Asistidas=${clasesAsistidasDirecto}`);

  if (totalClasesDirecto > 0) {
    const porcentajeDirecto = (clasesAsistidasDirecto / totalClasesDirecto) * 100;
    console.log(`📊 Porcentaje directo: ${porcentajeDirecto}%`);
    return Math.min(100, Math.max(0, porcentajeDirecto));
  }

  // CASO 3: Default
  console.log('📊 Usando valor default: 0%');
  return 0;
}

// Función auxiliar para determinar la severidad según las clases restantes
function getClasesRestantesSeverity(clasesRestantes) {
  if (clasesRestantes === undefined || clasesRestantes === null) {
    return 'info'; // Valor por defecto si no hay datos
  }

  if (clasesRestantes > 10) return 'success';
  if (clasesRestantes > 5) return 'info';
  if (clasesRestantes > 0) return 'warning';
  return 'danger';
}

function calcularMesesDuracionInscripcion(inscripcion) {
  if (!inscripcion.fecha_inicio || !inscripcion.fecha_fin) {
    return 1;
  }

  const inicio = new Date(inscripcion.fecha_inicio);
  const fin = new Date(inscripcion.fecha_fin);

  // Calcular diferencia en meses
  const meses = (fin.getFullYear() - inicio.getFullYear()) * 12 +
    (fin.getMonth() - inicio.getMonth());

  return Math.max(1, meses);
}

function puedeRenovar(inscripcion) {
  console.log('🔍 VERIFICANDO RENOVACIÓN para inscripción:', inscripcion.id);

  // 1. Validar datos básicos
  if (!inscripcion || !inscripcion.id) {
    console.log('❌ Inscripción no válida');
    return false;
  }

  // 2. Solo permitir renovar inscripciones ACTIVAS
  if (inscripcion.estado !== 'activo') {
    console.log('❌ No puede renovar - Estado:', inscripcion.estado);
    return false;
  }

  // 3. Verificar que no esté ya vencida (opcional, puedes quitarlo si quieres permitir renovar vencidas)
  const diasRestantes = calcularDiasRestantes(inscripcion.fecha_fin);
  const yaVencida = diasRestantes < 0;

  if (yaVencida) {
    console.log('⚠️ Inscripción vencida hace', Math.abs(diasRestantes), 'días');
    // Puedes decidir si permitir renovar vencidas o no
    // return false; // Si NO quieres permitir renovar vencidas
  }

  // 4. SIEMPRE permitir renovar si está activa
  console.log('✅ SIEMPRE ACTIVO - Puede renovar');
  return true;
}


function getTooltipRenovacion(inscripcion) {
  if (!inscripcion) return 'Información no disponible';

  const diasRestantes = calcularDiasRestantes(inscripcion.fecha_fin);
  const clasesRestantes = parseInt(inscripcion.clases_restantes_calculadas) ||
    parseInt(inscripcion.clases_restantes) ||
    0;

  if (inscripcion.estado !== 'activo') {
    return `No puede renovar - Estado: ${inscripcion.estado}`;
  }

  let mensaje = '🔄 Renovar inscripción';

  // Mostrar información pero sin bloquear
  if (diasRestantes > 0) {
    mensaje += `\nVence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`;
  } else if (diasRestantes === 0) {
    mensaje += '\nVence hoy';
  } else {
    mensaje += `\nVencida hace ${Math.abs(diasRestantes)} días`;
  }

  if (clasesRestantes > 0) {
    mensaje += `\n${clasesRestantes} clase${clasesRestantes !== 1 ? 's' : ''} restante${clasesRestantes !== 1 ? 's' : ''}`;
  }

  return mensaje;
}

function calcularDiasRestantes(fechaFin) {
  console.log('📅 calcularDiasRestantes - Entrada:', fechaFin);

  if (!fechaFin) {
    console.log('❌ No hay fecha fin');
    return 999; // Valor alto para que no active la renovación
  }

  try {
    // Crear fecha de hoy (sin horas)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Convertir fechaFin a Date
    let fin;

    // DEBUG: Ver formato exacto
    console.log('📅 Tipo de fechaFin:', typeof fechaFin);
    console.log('📅 Valor fechaFin:', fechaFin);

    if (typeof fechaFin === 'string') {
      // Si ya es una fecha en formato YYYY-MM-DD
      if (fechaFin.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = fechaFin.split('-').map(Number);
        fin = new Date(year, month - 1, day);
        console.log('📅 Parseado como YYYY-MM-DD:', fin);
      }
      // Si tiene formato ISO con T
      else if (fechaFin.includes('T')) {
        fin = new Date(fechaFin);
        console.log('📅 Parseado como ISO:', fin);
      }
      // Si tiene formato DD/MM/YYYY
      else if (fechaFin.includes('/')) {
        const [day, month, year] = fechaFin.split('/').map(Number);
        fin = new Date(year, month - 1, day);
        console.log('📅 Parseado como DD/MM/YYYY:', fin);
      }
      else {
        // Intentar parsear como fecha directa
        fin = new Date(fechaFin);
        console.log('📅 Parseado directo:', fin);
      }
    } else if (fechaFin instanceof Date) {
      fin = new Date(fechaFin);
      console.log('📅 Ya es Date:', fin);
    } else {
      console.log('❌ Formato de fecha no reconocido:', typeof fechaFin, fechaFin);
      return 999;
    }

    // Verificar si la fecha es válida
    if (isNaN(fin.getTime())) {
      console.log('❌ Fecha inválida después de parsear:', fechaFin);
      return 999;
    }

    // Establecer horas a 0 para comparar solo fechas
    fin.setHours(0, 0, 0, 0);

    // Calcular diferencia en días
    const diffMs = fin.getTime() - hoy.getTime();
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    console.log('📅 Cálculo completo:', {
      hoy: hoy.toISOString().split('T')[0],
      fin: fin.toISOString().split('T')[0],
      diffMs: diffMs,
      dias: dias
    });

    return dias;
  } catch (error) {
    console.error('❌ Error en calcularDiasRestantes:', error);
    return 999;
  }
}

// Función para formatear fecha en formato más legible



function obtenerSeveridadEstado(estado, fechaFin) {
  const diasRestantes = calcularDiasRestantes(fechaFin);

  // Prioridad: 1. Mora > 2. Vencimiento > 3. Estado normal
  if (estado === 'en_mora') return 'danger';

  switch (estado) {
    case 'activo':
      if (diasRestantes <= 0) return 'danger';
      if (diasRestantes <= 3) return 'warning';
      if (diasRestantes <= 7) return 'info';
      return 'success';

    case 'suspendido':
      return 'warning';

    case 'vencido':
      return 'danger';

    case 'finalizado':
      return 'success';

    case 'renovado':
      return 'info';

    default:
      return 'info';
  }
}

function getClaseEstadoPago(inscripcion) {
  if (inscripcion.estado === 'en_mora') {
    return 'bg-red-100 border-2 border-red-300';
  }

  if (inscripcion.saldo_pendiente > 0) {
    return 'bg-yellow-100 border-2 border-yellow-300';
  }

  return 'bg-green-100 border-2 border-green-300';
}

function getIconoEstadoPago(inscripcion) {
  if (inscripcion.estado === 'en_mora') {
    return 'pi pi-exclamation-triangle text-red-600';
  }

  if (inscripcion.saldo_pendiente > 0) {
    return 'pi pi-clock text-yellow-600';
  }

  return 'pi pi-check-circle text-green-600';
}

function getTextoEstadoPago(inscripcion) {
  if (inscripcion.estado === 'en_mora') {
    return 'En mora';
  }

  if (inscripcion.saldo_pendiente > 0) {
    return 'Pendiente';
  }

  return 'Al día';
}

function getColorTextoEstadoPago(inscripcion) {
  if (inscripcion.estado === 'en_mora') {
    return 'text-red-600';
  }

  if (inscripcion.saldo_pendiente > 0) {
    return 'text-yellow-600';
  }

  return 'text-green-600';
}

// 3. Función para calcular días de mora
function calcularDiasMora(inscripcion) {
  if (inscripcion.estado !== 'en_mora') return 0;

  // Buscar el pago más antiguo vencido
  const hoy = new Date();
  let diasMora = 0;

  // Esto asume que tienes datos de pagos vencidos
  if (inscripcion.pagos_vencidos && inscripcion.pagos_vencidos.length > 0) {
    const pagoMasViejo = inscripcion.pagos_vencidos.reduce((oldest, current) => {
      const oldestDate = new Date(oldest.fecha_vencimiento);
      const currentDate = new Date(current.fecha_vencimiento);
      return oldestDate < currentDate ? oldest : current;
    });

    const fechaVencimiento = new Date(pagoMasViejo.fecha_vencimiento);
    const diffMs = hoy - fechaVencimiento;
    diasMora = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  return Math.max(0, diasMora);
}

// 4. Función para procesar datos de inscripciones con información de pagos
async function procesarInscripcionesConPagos(data) {
  if (!Array.isArray(data)) return [];

  return data.map(inscripcion => {
    // Calcular días restantes
    const diasRestantes = calcularDiasRestantes(inscripcion.fecha_fin);

    // Calcular saldo pendiente (deberías obtener esto de tu backend)
    const saldoPendiente = calcularSaldoPendiente(inscripcion.id) || 0;

    // Determinar si está en mora basado en pagos pendientes
    const enMoraPorPagos = saldoPendiente > 0;

    // Actualizar estado si está en mora por pagos
    let estadoFinal = inscripcion.estado;
    if (enMoraPorPagos && estadoFinal === 'activo') {
      estadoFinal = 'en_mora';
    }

    // Calcular días de mora si aplica
    const diasMora = estadoFinal === 'en_mora' ? calcularDiasMora(inscripcion) : 0;

    return {
      ...inscripcion,
      dias_restantes: diasRestantes,
      estado: estadoFinal,
      saldo_pendiente: saldoPendiente,
      dias_mora: diasMora,
      estado_pago: saldoPendiente > 0 ? 'pendiente' : 'al_dia'
    };
  });
}

// 5. Funciones para los botones de acción
async function registrarPago(inscripcion) {
  console.log('💰 Registrar pago para inscripción:', inscripcion.id);

  try {
    cargando.value = true;
    
    // Primero asegurarnos de tener datos frescos
    await cargarPagosPendientesParaInscripcion(inscripcion);
    
    // Buscar la inscripción actualizada
    const inscripcionActualizada = inscripciones.value.find(i => i.id === inscripcion.id);
    
    if (!inscripcionActualizada) {
      throw new Error('Inscripción no encontrada');
    }
    
    console.log('📊 Inscripción actualizada:', {
      estado: inscripcionActualizada.estado,
      saldo: inscripcionActualizada.saldo_pendiente,
      tieneSegundaCuota: inscripcionActualizada.tiene_segunda_cuota
    });
    
    // Llamar a la función mejorada
    abrirDialogoRegistroPago(inscripcionActualizada);

  } catch (error) {
    console.error('❌ Error al obtener información de pagos:', error);
    
    // Fallback: abrir diálogo con datos disponibles
    toast.add({
      severity: 'warn',
      summary: 'Datos limitados',
      detail: 'Mostrando información básica de pago',
      life: 3000
    });
    
    abrirDialogoRegistroPago(inscripcion);
    
  } finally {
    cargando.value = false;
  }
}

// REEMPLAZA la función abrirDialogoRegistroPago con esta versión CORREGIDA:

async function abrirDialogoRegistroPago(inscripcion) {
  console.log('💰 Abriendo diálogo para inscripción #', inscripcion.id);
  
  try {
    cargandoPago.value = true;
    inscripcionParaPago.value = inscripcion;
    
    // 1. Obtener la inscripción completa
    const response = await inscripcionService.show(inscripcion.id);
    let inscripcionData = response.data.data || response.data;
    
    montoTotalInscripcion.value = parseFloat(inscripcionData?.monto_mensual) || 0;
    console.log('📊 Monto total de inscripción #' + inscripcion.id + ':', montoTotalInscripcion.value);
    
    // 2. Obtener TODOS los pagos (sin filtro para debug)
    console.log('🔍 Obteniendo TODOS los pagos...');
    const pagosResponse = await pagoService.index(1, 200, '');
    
    let todosPagos = [];
    
    // Extraer datos
    if (pagosResponse.data) {
      if (pagosResponse.data.success && Array.isArray(pagosResponse.data.data)) {
        todosPagos = pagosResponse.data.data;
      } else if (Array.isArray(pagosResponse.data.data)) {
        todosPagos = pagosResponse.data.data;
      } else if (Array.isArray(pagosResponse.data)) {
        todosPagos = pagosResponse.data;
      }
    }
    
    console.log(`📊 ${todosPagos.length} pagos en total en la BD`);
    
    // 3. Filtrar MANUALMENTE los pagos de ESTA inscripción
    const pagosDeEstaInscripcion = todosPagos.filter(pago => {
      const pagoInscripcionId = parseInt(pago.inscripcion_id) || pago.inscripcion_id;
      const buscaInscripcionId = parseInt(inscripcion.id) || inscripcion.id;
      
      const esDeEstaInscripcion = pagoInscripcionId == buscaInscripcionId;
      
      if (esDeEstaInscripcion) {
        console.log(`✅ Pago ${pago.id} ($${pago.monto}) pertenece a inscripción ${inscripcion.id}`);
      }
      
      return esDeEstaInscripcion;
    });
    
    console.log(`🎯 ${pagosDeEstaInscripcion.length} pagos encontrados para inscripción ${inscripcion.id}`);
    
    // Mostrar solo los pagos de esta inscripción
    pagosDeEstaInscripcion.forEach((pago, i) => {
      console.log(`  Pago ${i+1}: ID=${pago.id}, Monto=$${pago.monto}, Estado="${pago.estado}", Obs="${pago.observacion}"`);
    });
    
    // 4. Filtrar SOLO pagos PAGADOS de esta inscripción
    const pagosPagados = pagosDeEstaInscripcion.filter(p => {
      const estado = p.estado?.toString().toLowerCase() || '';
      return estado === 'pagado';
    });
    
    console.log(`💰 ${pagosPagados.length} pagos PAGADOS para inscripción ${inscripcion.id}`);
    
    // 5. Sumar montos de pagos pagados de ESTA inscripción
    totalPagado.value = pagosPagados.reduce((sum, pago) => {
      const monto = parseFloat(pago.monto) || 0;
      console.log(`  + Sumando pago ${pago.id} de inscripción ${inscripcion.id}: $${monto}`);
      return sum + monto;
    }, 0);
    
    console.log('💰 Total pagado para inscripción #' + inscripcion.id + ':', totalPagado.value);
    
    // 6. Calcular saldo pendiente
    saldoPendiente.value = montoTotalInscripcion.value - totalPagado.value;
    console.log('📊 Saldo pendiente para inscripción #' + inscripcion.id + ':', saldoPendienteCalculado.value);
    
    // Para inscripción #202 debería mostrar:
    // Monto total: $250
    // Total pagado: $50 (solo el pago ID=173)
    // Saldo pendiente: $200
    
    // 7. Configurar el monto sugerido
    montoPago.value = Math.max(0, saldoPendienteCalculado.value);
    
    // 8. Mostrar información
    toast.add({
      severity: 'info',
      summary: 'Datos cargados',
      detail: `Inscripción #${inscripcion.id}: Total: $${montoTotalInscripcion.value} | Pagado: $${totalPagado.value} | Saldo: $${saldoPendienteCalculado.value}`,
      life: 5000
    });
    
    dialogoRegistroPago.value = true;
    
  } catch (error) {
    console.error('❌ Error:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error cargando datos',
      life: 4000
    });
  } finally {
    cargandoPago.value = false;
  }
}


// Agrega esta función para consultar pagos de forma confiable
async function consultarPagosReales(inscripcionId) {
  console.log(`🔍 Consultando pagos REALES para inscripción ${inscripcionId}...`);
  
  const endpoints = [
    // Intenta diferentes endpoints
    `/api/pagos?inscripcion_id=${inscripcionId}`,
    `/api/pagos/inscripcion/${inscripcionId}`,
    `/api/inscripciones/${inscripcionId}/pagos`
  ];
  
  for (const endpoint of endpoints) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Éxito en endpoint: ${endpoint}`, data);
        
        // Extraer pagos según estructura
        let pagos = [];
        
        if (Array.isArray(data)) {
          pagos = data;
        } else if (data.data && Array.isArray(data.data)) {
          pagos = data.data;
        } else if (data.success && Array.isArray(data.data)) {
          pagos = data.data;
        }
        
        return pagos;
      }
    } catch (error) {
      console.log(`⚠️ Falló endpoint ${endpoint}:`, error.message);
      // Continuar con siguiente endpoint
    }
  }
  
  // Si todos fallan, devolver array vacío
  console.warn('❌ Todos los endpoints fallaron');
  return [];
}


// En el frontend, antes de enviar el pago
async function validarSegundaCuota() {
  if (!esSegundaCuota.value || !pagoSeleccionado.value) return true;
  
  try {
    // Obtener datos actualizados de la inscripción
    const response = await axios.get(`/api/inscripciones/${inscripcionParaPago.value.id}/estado-financiero`);
    
    const { total_inscripcion, total_pagado, saldo_pendiente } = response.data;
    
    // Validar que el monto sea el correcto
    if (Math.abs(montoPago.value - saldo_pendiente) > 0.01) {
      toast.add({
        severity: 'error',
        summary: 'Monto incorrecto',
        detail: `El saldo pendiente es $${saldo_pendiente.toFixed(2)}. Ajuste el monto.`,
        life: 5000
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validando segunda cuota:', error);
    return true; // Continuar si hay error en validación
  }
}


async function cargarTodosPagosInscripcion(inscripcionId) {
  try {
    console.log(`💰 Cargando pagos para inscripción ${inscripcionId}...`);
    
    // USAR EL ENDPOINT CORRECTO
    const response = await pagoService.porInscripcion(inscripcionId, 1, 100);
    
    console.log('📥 Respuesta:', response.data);
    
    let todosPagos = [];
    
    // Extraer según estructura
    if (response.data?.success && Array.isArray(response.data.data)) {
      todosPagos = response.data.data;
    } else if (Array.isArray(response.data?.data)) {
      todosPagos = response.data.data;
    } else if (Array.isArray(response.data)) {
      todosPagos = response.data;
    }
    
    console.log(`✅ ${todosPagos.length} pagos cargados`);
    
    // Calcular total pagado
    const pagosPagados = todosPagos.filter(p => 
      p.estado && p.estado.toString().toLowerCase() === 'pagado'
    );
    
    const totalPagado = pagosPagados.reduce((sum, pago) => {
      return sum + (parseFloat(pago.monto) || 0);
    }, 0);
    
    return {
      todosPagos,
      totalPagado,
      pagosPendientes: todosPagos.filter(p => 
        p.estado && p.estado.toString().toLowerCase() === 'pendiente'
      )
    };
    
  } catch (error) {
    console.error('Error cargando pagos:', error);
    return { todosPagos: [], totalPagado: 0, pagosPendientes: [] };
  }
}


async function calcularPagosCorrectos(inscripcionId) {
  console.log(`🔍 Calculando pagos CORRECTOS para inscripción ${inscripcionId}`);
  
  try {
    // 1. Obtener SOLO los pagos de ESTA inscripción
    const response = await pagoService.index(1, 100, '', {
      inscripcion_id: inscripcionId  // ← FILTRO CRÍTICO
    });
    
    let todosPagos = [];
    
    // Extraer datos correctamente
    if (response.data?.success && Array.isArray(response.data.data)) {
      todosPagos = response.data.data;
    } else if (Array.isArray(response.data)) {
      todosPagos = response.data;
    }
    
    console.log(`📊 PAGOS ENCONTRADOS para ${inscripcionId}:`, todosPagos.length);
    
    // 2. MOSTRAR CADA PAGO PARA DEBUG
    todosPagos.forEach((pago, i) => {
      console.log(`  ${i+1}. ID: ${pago.id} | $${pago.monto} | Estado: "${pago.estado}" | Cuota: ${pago.numero_cuota || 'N/A'}`);
    });
    
    // 3. FILTRAR CORRECTAMENTE
    const pagosPagados = todosPagos.filter(p => 
      p.estado && p.estado.toString().toLowerCase() === 'pagado'
    );
    
    const pagosPendientes = todosPagos.filter(p => 
      p.estado && p.estado.toString().toLowerCase() === 'pendiente'
    );
    
    // 4. CALCULAR TOTAL PAGADO CORRECTO
    const totalPagado = pagosPagados.reduce((sum, pago) => {
      return sum + (parseFloat(pago.monto) || 0);
    }, 0);
    
    // 5. BUSCAR SEGUNDA CUOTA PENDIENTE
    const segundaCuotaPendiente = pagosPendientes.find(p => 
      p.numero_cuota === 2 || 
      (p.observacion && p.observacion.toLowerCase().includes('segunda'))
    );
    
    // 6. BUSCAR PRIMERA CUOTA (para referencia)
    const primeraCuota = pagosPagados.find(p => 
      p.numero_cuota === 1 ||
      (p.observacion && p.observacion.toLowerCase().includes('primera'))
    );abrirDialogoRegistroPago
    
    return {
      todosPagos,
      pagosPagados,
      pagosPendientes,
      totalPagado,
      segundaCuotaPendiente,
      primeraCuota,
      tienePagosDivididos: todosPagos.some(p => p.es_parcial == 1)
    };
    
  } catch (error) {
    console.error('❌ Error calculando pagos:', error);
    return {
      todosPagos: [],
      pagosPagados: [],
      pagosPendientes: [],
      totalPagado: 0,
      segundaCuotaPendiente: null,
      primeraCuota: null,
      tienePagosDivididos: false
    };
  }
}

// En tu script, después de la función abrirDialogoRegistroPago, agrega:

async function registrarPagoReal() {
  console.log('💰 EJECUTANDO registrarPagoReal...');
  
  if (!inscripcionParaPago.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No hay inscripción seleccionada', life: 3000 });
    return;
  }
  
  // Validaciones básicas
  if (!montoPago.value || montoPago.value <= 0) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Monto inválido', life: 3000 });
    return;
  }
  
  if (!metodoPago.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Seleccione método de pago', life: 3000 });
    return;
  }
  
  try {
    // 1. PREPARAR DATOS PARA LA API
    const pagoData = {
      inscripcion_id: inscripcionParaPago.value.id,
      monto: montoPago.value,
      metodo_pago: metodoPago.value,
      fecha_pago: fechaPago.value ? 
        new Date(fechaPago.value).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0],
      estado: 'pagado',
      observacion: observacion.value || `Pago para inscripción #${inscripcionParaPago.value.id}`
    };
    
    // 2. SI ES SEGUNDA CUOTA, AGREGAR CAMPOS ESPECIALES
    if (esSegundaCuota.value && pagoSeleccionado.value) {
      pagoData.es_parcial = 1;
      pagoData.numero_cuota = 2;
      pagoData.pago_grupo_id = pagoSeleccionado.value.pago_grupo_id || Date.now().toString();
      
      // Buscar la primera cuota para mantener consistencia
      if (!pagoData.pago_grupo_id && inscripcionParaPago.value.id == 200) {
        pagoData.pago_grupo_id = '1769136664062'; // Del registro que ya tienes
      }
      
      pagoData.observacion = `Segunda cuota de $${montoPago.value}. ${pagoData.observacion}`;
    }
    
    console.log('📤 Enviando datos REALES a la API:', pagoData);
    
    // 3. LLAMAR AL SERVICIO
    const response = await pagoService.store(pagoData);
    
    console.log('📥 Respuesta del servidor:', response.data);
    
    // 4. VERIFICAR RESPUESTA
    if (response.data?.success || response.data?.id) {
      // Éxito
      toast.add({
        severity: 'success',
        summary: '✅ Pago registrado',
        detail: `Pago de $${montoPago.value} registrado exitosamente`,
        life: 4000
      });
      
      // 5. CERRAR DIÁLOGO
      dialogoRegistroPago.value = false;
      
      // 6. LIMPIAR FORMULARIO
      limpiarFormularioPago();
      
      // 7. RECARGAR DATOS
      setTimeout(() => {
        cargarDatos(); // Esto recargará las inscripciones y sus pagos
      }, 1000);
      
    } else {
      throw new Error(response.data?.message || 'No se pudo registrar el pago');
    }
    
  } catch (error) {
    console.error('❌ Error registrando pago REAL:', error);
    
    let mensajeError = 'Error al registrar pago';
    
    if (error.response?.data) {
      console.error('Detalles del error:', error.response.data);
      
      if (error.response.data.errors) {
        // Errores de validación de Laravel
        const errores = Object.values(error.response.data.errors).flat();
        mensajeError = errores.join(', ');
      } else if (error.response.data.message) {
        mensajeError = error.response.data.message;
      }
    } else if (error.message) {
      mensajeError = error.message;
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensajeError,
      life: 6000
    });
  }
}

// REEMPLAZA la función configurarFormularioPago con esta versión:



// ========== FUNCIÓN AUXILIAR PARA CALCULAR ESTADO FINANCIERO ==========
async function calcularEstadoFinancieroLocal(inscripcion) {
  try {
    console.log('🔄 Calculando estado financiero localmente para inscripción:', inscripcion.id);
    
    let todosPagos = [];
    
    // USAR SOLO EL MÉTODO INDEX QUE SÍ FUNCIONA
    try {
      const response = await pagoService.index(1, 100, '', {
        inscripcion_id: inscripcion.id
      });
      
      console.log('📥 Respuesta de pagos index:', response.data);
      
      // Extraer datos según tu estructura API
      if (response.data) {
        // Estructura común: { data: [], success: true }
        if (response.data.success && Array.isArray(response.data.data)) {
          todosPagos = response.data.data;
        }
        // Estructura: { data: { data: [] } }
        else if (response.data.data && Array.isArray(response.data.data)) {
          todosPagos = response.data.data;
        }
        // Estructura: Array directo
        else if (Array.isArray(response.data)) {
          todosPagos = response.data;
        }
        // Estructura Laravel paginado
        else if (response.data.data && Array.isArray(response.data.data.data)) {
          todosPagos = response.data.data.data;
        }
      }
      
      console.log(`✅ ${todosPagos.length} pagos encontrados`);
      
    } catch (apiError) {
      console.log('⚠️ Método index falló:', apiError.message);
      // Dejar array vacío si falla
    }
    
    // ========== CALCULAR TOTALES CORRECTAMENTE ==========
    
    // Filtrar SOLO pagos con estado 'pagado' (no 'Pagado' con mayúscula)
    const pagosPagados = todosPagos.filter(p => 
      p.estado && p.estado.toLowerCase() === 'pagado'
    );
    
    console.log('💰 Pagos pagados encontrados:', pagosPagados);
    
    // Calcular total pagado - IMPORTANTE: sumar solo montos de pagos PAGADOS
    const totalPagado = pagosPagados.reduce((sum, pago) => {
      const monto = parseFloat(pago.monto) || 0;
      console.log(`  + Pago ${pago.id}: $${monto} (estado: ${pago.estado})`);
      return sum + monto;
    }, 0);
    
    // Identificar pagos pendientes
    const pagosPendientes = todosPagos.filter(p => 
      p.estado && (p.estado.toLowerCase() === 'pendiente' || p.estado.toLowerCase() === 'vencido')
    );
    
    console.log('📋 Pagos pendientes:', pagosPendientes.length);
    
    // Buscar primera cuota (pagada)
    const primeraCuota = pagosPagados.find(p => 
      p.es_parcial === true || 
      p.numero_cuota === 1 ||
      (p.observacion && p.observacion.toLowerCase().includes('primera'))
    );
    
    // Buscar segunda cuota pendiente
    const segundaCuotaPendiente = pagosPendientes.find(p => 
      p.es_parcial === true || 
      p.numero_cuota === 2 ||
      (p.observacion && p.observacion.toLowerCase().includes('segunda'))
    );
    
    // Obtener monto total de la inscripción
    const montoTotal = parseFloat(inscripcion.monto_mensual) || 
                      parseFloat(inscripcion.modalidad?.precio_mensual) || 0;
    
    // Calcular saldo pendiente CORRECTO
    const saldoPendiente = Math.max(0, montoTotal - totalPagado);
    
    console.log('📊 Cálculo local CORREGIDO:', {
      montoTotal,
      totalPagado,
      saldoPendiente,
      tienePrimeraCuota: !!primeraCuota,
      tieneSegundaCuotaPendiente: !!segundaCuotaPendiente,
      pagosEncontrados: todosPagos.length,
      pagosPagados: pagosPagados.length,
      pagosPendientes: pagosPendientes.length
    });
    
    return {
      total_inscripcion: montoTotal,
      total_pagado: totalPagado,
      saldo_pendiente: saldoPendiente,
      pagos_pendientes: pagosPendientes,
      primera_cuota: primeraCuota,
      segunda_cuota_pendiente: segundaCuotaPendiente,
      calculado_localmente: true
    };
    
  } catch (error) {
    console.error('❌ Error calculando estado financiero local:', error);
    
    // Fallback extremo - usar datos básicos de la inscripción
    const montoTotal = parseFloat(inscripcion.monto_mensual) || 0;
    
    // Si la inscripción tiene saldo_pendiente, usarlo
    let saldoPendiente = parseFloat(inscripcion.saldo_pendiente) || 0;
    
    // Si no tiene saldo_pendiente pero está en mora, usar monto total
    if (saldoPendiente === 0 && inscripcion.estado === 'en_mora') {
      saldoPendiente = montoTotal;
    }
    
    return {
      total_inscripcion: montoTotal,
      total_pagado: montoTotal - saldoPendiente,
      saldo_pendiente: saldoPendiente,
      pagos_pendientes: [],
      calculado_localmente: true,
      error: error.message
    };
  }
}


function formatFechaParaBackend(fecha) {
  if (!fecha) return null;

  const d = new Date(fecha);
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}





// Función para cancelar el registro de pago
function cancelarRegistroPago() {
  console.log('❌ Cancelando registro de pago...');

  try {
    // Verificar que dialogoRegistroPago existe antes de asignarle
    if (typeof dialogoRegistroPago !== 'undefined' && dialogoRegistroPago.value !== undefined) {
      dialogoRegistroPago.value = false;
      console.log('✅ Diálogo cerrado');
    } else {
      console.error('❌ dialogoRegistroPago no está definido');
    }

    // Limpiar formulario
    limpiarFormularioPago();

  } catch (error) {
    console.error('❌ Error al cancelar registro de pago:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cancelar el registro',
      life: 3000
    });
  }
}

// Función para limpiar el formulario
function limpiarFormularioPago() {
  console.log('🧹 Limpiando formulario de pago...');
  
  if (inscripcionParaPago) inscripcionParaPago.value = null;
  if (pagosPendientes) pagosPendientes.value = [];
  if (pagoSeleccionado) pagoSeleccionado.value = null;
  if (montoPago) montoPago.value = 0;
  if (metodoPago) metodoPago.value = null;
  if (fechaPago) fechaPago.value = new Date();
  if (observacion) observacion.value = '';
  if (saldoPendiente) saldoPendiente.value = 0;
  if (esSegundaCuota) esSegundaCuota.value = false;
}




// 6. Función auxiliar para calcular saldo pendiente (ejemplo)
async function calcularSaldoPendiente(inscripcionId) {
  try {
    // Esto debería venir de tu backend
    const response = await pagoService.getSaldoPendiente(inscripcionId);
    return response.data.saldo || 0;
  } catch {
    return 0;
  }
}

function formatFecha(fecha) {
  if (!fecha) return '--';

  let date;
  if (fecha instanceof Date) {
    date = fecha;
  } else if (typeof fecha === 'string') {
    date = new Date(fecha);
  } else {
    return '--';
  }

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getColorVencimiento(fechaFin) {
  const dias = calcularDiasRestantes(fechaFin);
  if (dias <= 0) return 'text-red-500 font-bold';
  if (dias <= 3) return 'text-orange-500 font-bold';
  if (dias <= 7) return 'text-yellow-500';
  return '';
}

function getDiasRestantes(fechaFin) {
  const dias = calcularDiasRestantes(fechaFin);
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return '1 día';
  if (dias > 0) return `${dias} días`;
  return `Hace ${Math.abs(dias)} días`;
}



function calcularNuevaFechaFin() {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() + 1);
  return fecha.toISOString().split('T')[0];
}



async function exportarExcel() {
  try {
    toast.add({
      severity: 'info',
      summary: 'Exportar',
      detail: 'Función de exportación en desarrollo',
      life: 3000
    });
  } catch (error) {
    manejarError('Error exportando a Excel', error);
  }
}

function manejarError(mensaje, error) {
  console.error(mensaje, error);

  let detalle = 'Error desconocido';
  if (error.response?.data?.message) {
    detalle = error.response.data.message;
  } else if (error.response?.data?.error) {
    detalle = error.response.data.error;
  } else if (error.message) {
    detalle = error.message;
  }

  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: `${mensaje}: ${detalle}`,
    life: 5000
  });
}

function calcularEstadisticas() {
  console.log('=== CALCULANDO ESTADÍSTICAS ===');
  console.log('Total inscripciones:', inscripciones.value.length);

  const totalActivas = inscripciones.value.filter(i =>
    i.estado === 'activo' || i.estado === 'activo'
  ).length;

  const porVencer = inscripciones.value.filter(i => {
    const estadoActivo = i.estado === 'activo' || i.estado === 'activo';
    const diasRestantes = i.dias_restantes || 0;
    return estadoActivo && diasRestantes <= 7 && diasRestantes > 0;
  }).length;

  const hoy = new Date().toISOString().split('T')[0];
  const clasesHoy = inscripciones.value.filter(i => {
    const estadoActivo = i.estado === 'activo' || i.estado === 'activo';
    return estadoActivo;
  }).length;

  const ingresosMes = inscripciones.value.reduce((sum, inscripcion) => {
    try {
      let monto = inscripcion.monto_mensual;

      if (monto === null || monto === undefined) {
        return sum;
      }

      if (typeof monto === 'string') {
        monto = parseFloat(monto.replace(/[^0-9.-]+/g, ''));
      }

      if (isNaN(monto) || !isFinite(monto)) {
        console.warn(`Monto inválido en inscripción ${inscripcion.id}:`, inscripcion.monto_mensual);
        return sum;
      }

      return sum + monto;
    } catch (error) {
      console.error(`Error procesando monto de inscripción ${inscripcion.id}:`, error);
      return sum;
    }
  }, 0);

  estadisticas.value = {
    totalActivas,
    porVencer,
    clasesHoy,
    ingresosMes: ingresosMes.toFixed(2)
  };

  console.log('Estadísticas finales:', estadisticas.value);
}

function aplicarFiltrosAvanzados() {
  cargarDatos();
}

function limpiarFiltros() {
  buscar.value = '';
  filtroEstado.value = null;
  cargarDatos();
}

function filtrarEstudiantes() {
  // La búsqueda se maneja automáticamente con la computed property
}

function getIniciales(estudiante) {
  if (!estudiante || !estudiante.nombres) return '?';
  const nombres = estudiante.nombres.split(' ');
  if (nombres.length >= 2) {
    return (nombres[0][0] + nombres[1][0]).toUpperCase();
  }
  return nombres[0][0].toUpperCase();
}

async function abrirDialogoNueva() {
  tituloDialogo.value = 'Nueva Inscripción';
  pasoActual.value = 0;
  estudianteSeleccionado.value = null;
  buscarEstudiante.value = '';
  filtroDisciplina.value = null;
  inscripcionForm.value = crearInscripcionVacia();
  dialogoInscripcion.value = true;

  // ========== NUEVO: Cargar estudiantes Y modalidades ==========
  await Promise.all([
    cargarEstudiantesParaDialogo(),
    cargarModalidades()  // ← ¡FALTA ESTA LÍNEA!
  ]);

  console.log('✅ Estudiantes y modalidades cargadas para nueva inscripción');
}

onMounted(async () => {
  try {
    console.log('🚀 Iniciando carga de datos...');
    
    // Primero cargar modalidades (necesario para diálogo de nueva inscripción)
    await cargarModalidades();
    console.log('✅ Modalidades cargadas');
    
    // Luego cargar inscripciones (que también carga pagos pendientes)
    await cargarDatos();
    console.log('✅ Datos de inscripciones cargados');
    
    console.log('🎉 Carga inicial completada');
    
  } catch (error) {
    console.error('❌ Error en carga inicial:', error);
    toast.add({
      severity: 'error',
      summary: 'Error de carga',
      detail: 'No se pudieron cargar todos los datos iniciales',
      life: 5000
    });
  }
});

</script>

<style scoped>
.dashboard-container {
  padding: 1.5rem;
  max-width: 1800px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border-left: 5px solid #3b82f6;
}

.dashboard-header h1 {
  margin: 0;
  color: #1f2937;
  font-size: 1.8rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

/* Tarjetas mejoradas - HEADER GLASSMORPHISM */
.dashboard-cards {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
}

/* STAT CARDS MEJORADAS */
.stat-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: white;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--card-color), transparent);
  opacity: 0.7;
}

.stat-card:nth-child(1) {
  --card-color: #3b82f6;
}

.stat-card:nth-child(2) {
  --card-color: #10b981;
}

.stat-card:nth-child(3) {
  --card-color: #f59e0b;
}

.stat-card:nth-child(4) {
  --card-color: #8b5cf6;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--card-gradient));
}

.stat-card:nth-child(1) { 
  --card-gradient: #3b82f6, #60a5fa; 
  --card-color: #3b82f6;
}
.stat-card:nth-child(2) { 
  --card-gradient: #10b981, #34d399; 
  --card-color: #10b981;
}
.stat-card:nth-child(3) { 
  --card-gradient: #f59e0b, #fbbf24; 
  --card-color: #f59e0b;
}
.stat-card:nth-child(4) { 
  --card-gradient: #8b5cf6, #a78bfa; 
  --card-color: #8b5cf6;
}

.card-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* CONTENIDO DE TARJETAS */
.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: bold;
  background: linear-gradient(135deg, var(--card-color), #6b7280);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Paneles de estado */
.dashboard-section {
  margin-bottom: 2rem;
}

.panel-estado {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.panel-header {
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 1.1rem;
}

.panel-content {
  padding: 1rem;
}

.estado-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.estado-item:last-child {
  border-bottom: none;
}

.estado-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.estado-icon i {
  font-size: 1.2rem;
}

/* Estilos para alertas */
.alerta-card {
  padding: 1rem;
  border-radius: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.alerta-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.alerta-pago-vencido {
  border-left: 4px solid #ef4444;
  background: linear-gradient(to right, rgba(239, 68, 68, 0.05), white);
}

.alerta-inscripcion-vencer {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(to right, rgba(245, 158, 11, 0.05), white);
}

.alerta-mora-alta {
  border-left: 4px solid #dc2626;
  background: linear-gradient(to right, rgba(220, 38, 38, 0.05), white);
}

/* Tarjetas de modalidades */
.modalidad-card {
  padding: 1rem;
  border-radius: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.modalidad-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Progress bar mejorado */
:deep(.p-progressbar) {
  border-radius: 10px;
  height: 8px;
  background: #e5e7eb;
}

:deep(.p-progressbar-value) {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 10px;
}

/* Badges de estado */
:deep(.p-tag.p-tag-success) {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

:deep(.p-tag.p-tag-warning) {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

:deep(.p-tag.p-tag-danger) {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

:deep(.p-tag.p-tag-info) {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

/* Botones mejorados */
:deep(.p-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

:deep(.p-button-success) {
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
}

:deep(.p-button-success:hover) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

:deep(.p-button-primary) {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
}

:deep(.p-button-primary:hover) {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

:deep(.p-button-help) {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
}

:deep(.p-button-help:hover) {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

/* Card styles */
:deep(.p-card) {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.p-card-header) {
  border-bottom: 1px solid #f3f4f6;
}

/* Datatable mejorado */
:deep(.p-datatable) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.p-datatable-thead > tr > th) {
  background: #f8fafc !important;
  color: #374151 !important;
  font-weight: 600 !important;
  padding: 1rem !important;
  border-bottom: 2px solid #e5e7eb !important;
}

:deep(.p-datatable-tbody > tr) {
  transition: background-color 0.2s;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: #f9fafb !important;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 1rem !important;
  border-color: #f3f4f6 !important;
}

/* Quick stats */
.quick-stats {
  padding: 0.5rem 0;
}

.quick-stat-item {
  margin-bottom: 1rem;
}

.quick-stat-item:last-child {
  margin-bottom: 0;
}

/* Dropdown mejorado */
:deep(.p-dropdown) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

:deep(.p-dropdown-panel) {
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

/* Avatar circular */
:deep(.p-avatar) {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-weight: 600;
}

/* SECTIONS CON COLORES SUAVES */
.bg-blue-50 {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.1));
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.bg-green-50 {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.1));
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.bg-gray-50 {
  background: linear-gradient(135deg, rgba(243, 244, 246, 0.8), rgba(249, 250, 251, 0.9));
  border: 1px solid rgba(209, 213, 219, 0.3);
}

/* TEXTO MEJORADO */
.text-green-600 {
  color: #059669 !important;
  font-weight: 600;
}

.text-yellow-500 {
  color: #d97706 !important;
  font-weight: 500;
}

.text-red-500 {
  color: #dc2626 !important;
  font-weight: 500;
}

.text-primary {
  color: #3b82f6 !important;
}

/* ANIMACIONES */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: fadeIn 0.3s ease-out;
}

/* Animación para estado en mora */
@keyframes pulse-mora {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse-mora 2s infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-actions {
    align-items: center;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
  
  .dashboard-container {
    padding: 1rem;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .stat-icon {
    font-size: 2rem;
  }
  
  .stat-value {
    font-size: 1.8rem;
  }
}

@media (max-width: 576px) {
  .dashboard-cards .grid .col {
    margin-bottom: 1rem;
  }
}

/* SCROLLBAR PERSONALIZADO */
:deep(.p-datatable-wrapper) {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

:deep(.p-datatable-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(.p-datatable-wrapper::-webkit-scrollbar-track) {
  background: #f1f5f9;
  border-radius: 3px;
}

:deep(.p-datatable-wrapper::-webkit-scrollbar-thumb) {
  background: #d1d5db;
  border-radius: 3px;
}

:deep(.p-datatable-wrapper::-webkit-scrollbar-thumb:hover) {
  background: #9ca3af;
}

/* TOOLTIPS MEJORADOS */
:deep(.p-tooltip-text) {
  font-size: 0.8rem;
  padding: 0.5rem;
  border-radius: 6px;
}

/* LOADING STATES */
:deep(.p-progress-spinner) {
  color: #3b82f6;
}

/* GRID MEJORADO */
.grid {
  margin: 0 -0.75rem;
}

.grid .col {
  padding: 0.75rem;
}

/* BORDES REDONDEADOS */
.border-round {
  border-radius: 12px;
}

/* ESTILOS ESPECÍFICOS PARA ÍCONOS */
.pi-users {
  color: #3b82f6;
}

.pi-clock {
  color: #f59e0b;
}

.pi-calendar {
  color: #10b981;
}

.pi-money-bill {
  color: #8b5cf6;
}

.pi-chart-bar {
  color: #3b82f6;
}

.pi-chart-pie {
  color: #8b5cf6;
}

.pi-chart-line {
  color: #10b981;
}

.pi-user-plus {
  color: #10b981;
}

.pi-credit-card {
  color: #8b5cf6;
}

.pi-star {
  color: #f59e0b;
}

.pi-bell {
  color: #ef4444;
}

.pi-check {
  color: #10b981;
}

.pi-exclamation-triangle {
  color: #ef4444;
}

.pi-refresh {
  color: #3b82f6;
}

.pi-arrow-right {
  color: white;
}

.pi-eye {
  color: #3b82f6;
}

.pi-wallet {
  color: #10b981;
}

.pi-info-circle {
  color: #3b82f6;
}

/* Progress bar para tasa de renovación */
:deep(.p-progressbar.bg-green-100 .p-progressbar-value) {
  background: linear-gradient(90deg, #10b981, #34d399);
}

:deep(.p-progressbar.bg-yellow-100 .p-progressbar-value) {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

:deep(.p-progressbar.bg-red-100 .p-progressbar-value) {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

/* Chip styles */
:deep(.p-chip) {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}
</style>