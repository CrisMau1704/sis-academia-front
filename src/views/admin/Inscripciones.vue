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
          <Column header="Progreso">
  <template #body="slotProps">
    <div class="flex flex-column gap-1">
      <div class="flex justify-content-between">
        <small>Clases:
          {{ getClasesProgreso(slotProps.data).asistidas }}/{{ getClasesProgreso(slotProps.data).total }}
        </small>
        <small>Días: {{ slotProps.data.dias_restantes || 0 }}</small>
      </div>
      <ProgressBar :value="calcularProgresoClases(slotProps.data)" :showValue="false" />
    </div>
  </template>
</Column>
          <Column header="Vencimiento">
            <template #body="slotProps">
              <div class="flex flex-column">
                <span :class="getColorVencimiento(slotProps.data.fecha_fin)">
                  {{ formatFecha(slotProps.data.fecha_fin) }}
                </span>
                <small class="text-500">{{ getDiasRestantes(slotProps.data.fecha_fin) }}</small>
              </div>
            </template>
          </Column>
          <Column field="estado" header="Estado" :sortable="true">
            <template #body="slotProps">
              <Tag :value="slotProps.data.estado"
                :severity="obtenerSeveridadEstado(slotProps.data.estado, slotProps.data.fecha_fin)" />
            </template>
          </Column>
          <Column header="Acciones" style="width: 120px">
            <template #body="slotProps">
              <div class="flex gap-1">
                <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm"
                  @click="verDetalles(slotProps.data)" v-tooltip="'Ver detalles'" />
                <Button icon="pi pi-refresh" class="p-button-rounded p-button-text p-button-sm"
                  @click="renovarInscripcion(slotProps.data)" v-tooltip="'Renovar'"
                  :disabled="!puedeRenovar(slotProps.data)" />
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
          <div v-for="modalidad in modalidades" :key="modalidad.id" 
               class="col-12 md:col-6 lg:col-4 mb-3">
            <Card class="modalidad-card" 
                  @click="seleccionarModalidad(modalidad)"
                  :class="{ 
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
                      <small class="text-500">{{ calcularClasesSemanales(modalidad.clases_mensuales) }} clases por semana</small>
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
                <small class="text-500">Máximo {{ maxHorariosPorModalidad }} horarios</small>
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
            <span>Haz clic en los horarios que deseas (máximo {{ maxHorariosPorModalidad }})</span>
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

        <div v-else-if="horariosFiltrados.length === 0" class="p-4 text-center border-round border-1 surface-border">
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
            <h5 class="mt-0 mb-0">✅ Horarios seleccionados ({{ horariosSeleccionados.length }}/{{ maxHorariosPorModalidad }})</h5>
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
                    <div class="font-bold">{{ estudianteSeleccionado?.nombres }} {{ estudianteSeleccionado?.apellidos }}</div>
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
                <!-- Mostrar precio total como referencia -->
                <div>
                  <label class="text-500 block mb-1">Precio de la Modalidad</label>
                  <div class="text-2xl font-bold text-green-600">
                    ${{ getPrecioTotal() }}
                  </div>
                  <small class="text-500">Precio mensual de la modalidad seleccionada</small>
                </div>

                <!-- Campo para ingresar el monto del pago -->
                <div class="field">
                  <label for="monto_pago" class="text-500 block mb-1">Monto a Pagar *</label>
                  <div class="p-inputgroup">
                    <span class="p-inputgroup-addon">$</span>
                    <InputNumber v-model="pagoForm.monto" :min="0" :max="10000" :step="10" class="w-full"
                      :class="{ 'p-invalid': !pagoForm.monto || pagoForm.monto <= 0 }"
                      placeholder="Ingrese el monto" />
                  </div>
                  <small v-if="!pagoForm.monto || pagoForm.monto <= 0" class="p-error">
                    Ingrese un monto válido
                  </small>
                  <small v-else class="text-500">
                    Precio de la modalidad: ${{ getPrecioTotal() }}
                  </small>
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
                    placeholder="Notas sobre el pago..." />
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
                <span class="text-500">Clases totales:</span>
                <span class="font-bold">{{ calcularClasesTotales() }} clases</span>
              </div>
            </div>
            <div class="col-12 md:col-4">
              <div class="flex justify-content-between mb-2">
                <span class="text-500">Total a Pagar:</span>
                <span class="font-bold text-green-600 text-xl">${{ pagoForm.monto || getPrecioTotal() }}</span>
              </div>
              <div class="flex justify-content-between">
                <span class="text-500">Estado:</span>
                <Tag value="Activa" severity="success" />
              </div>
            </div>
          </div>
          <Divider />
          <div class="mt-2">
            <div class="text-500 mb-1">Distribución de clases estimada:</div>
            <div class="flex flex-wrap gap-2">
              <Chip v-for="(clases, index) in getDistribucionEstimada()" :key="index"
                :label="`${horariosSeleccionadosDetalles[index]?.dia_semana || 'Horario'}: ${clases} clases`" 
                severity="info" />
            </div>
            <small class="text-500 mt-1 block">
              * Distribución aproximada basada en {{ calcularClasesTotales() }} clases
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




const cargandoHorarios = ref(false);
const cargandoModalidades = ref(false);



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
const maxHorariosPorModalidad = 4; // o lo que definas

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

async function cargarModalidadesParaInscripcion() {
  cargandoModalidades.value = true;
  try {
    const response = await modalidadService.getActivas();
    
    // Procesar modalidades con información adicional
    modalidades.value = response.data.map(mod => ({
      ...mod,
      descripcion_corta: mod.descripcion ? 
        (mod.descripcion.length > 30 ? mod.descripcion.substring(0, 30) + '...' : mod.descripcion) : 
        'Sin descripción',
      // Agregar disciplina_nombre si viene en la respuesta
      disciplina_nombre: mod.disciplina?.nombre || 'Sin disciplina'
    }));
    
  } catch (error) {
    console.error('Error cargando modalidades:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las modalidades',
      life: 3000
    });
  } finally {
    cargandoModalidades.value = false;
  }
}



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

function calcularClasesTotales() {
  if (!modalidadSeleccionada.value) return 12;
  
  const meses = calcularMesesDuracion();
  return modalidadSeleccionada.value.clases_mensuales * meses;
}

function getDistribucionEstimada() {
  const clasesTotales = calcularClasesTotales();
  const totalHorarios = horariosSeleccionadosDetalles.value.length;
  
  if (totalHorarios === 0) return [];
  
  const base = Math.floor(clasesTotales / totalHorarios);
  const extra = clasesTotales % totalHorarios;
  
  const distribucion = [];
  for (let i = 0; i < totalHorarios; i++) {
    distribucion.push(i < extra ? base + 1 : base);
  }
  
  return distribucion;
}

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
  
  // Continuar al paso de confirmación
  pasoActual.value = 3;
}

// FUNCIONES PRINCIPALES
async function cargarDatos() {
  cargando.value = true;
  try {
    console.log('Cargando inscripciones...');
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

    console.log(`Datos extraídos: ${datosInscripciones.length} inscripciones`);

    // Procesar datos
    inscripciones.value = procesarInscripciones(datosInscripciones);

    // Calcular estadísticas
    calcularEstadisticas();

  } catch (error) {
    console.error('Error cargando datos:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las inscripciones',
      life: 3000
    });
  } finally {
    cargando.value = false;
  }
}

async function cargarHorariosDisponibles() {
  try {
    console.log('⏰ Cargando horarios disponibles...');
    
    // Usar el service correcto con parámetros
    const response = await horarioService.index(1, 100, '', {
      estado: 'activo',
      with_cupo: true // si tu API soporta este parámetro
    });
    
    console.log('📥 Respuesta horarios:', response.data);
    
    let datosHorarios = [];
    
    // Manejar diferentes estructuras de respuesta
    if (response.data) {
      // Estructura con success y data
      if (response.data.success && response.data.data) {
        if (response.data.data.data && Array.isArray(response.data.data.data)) {
          datosHorarios = response.data.data.data; // Paginación
        } else if (Array.isArray(response.data.data)) {
          datosHorarios = response.data.data; // Array directo
        }
      }
      // Estructura con paginación
      else if (response.data.data && Array.isArray(response.data.data)) {
        datosHorarios = response.data.data;
      }
      // Array directo
      else if (Array.isArray(response.data)) {
        datosHorarios = response.data;
      }
    }
    
    // Filtrar por cupo disponible
    datosHorarios = datosHorarios.filter(horario => {
      const cupoMaximo = horario.cupo_maximo || 15;
      const cupoActual = horario.cupo_actual || 0;
      return cupoMaximo > cupoActual;
    });
    
    console.log(`✅ ${datosHorarios.length} horarios disponibles`);
    
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
// También asegúrate de tener esta función:
function procesarHorariosParaVista(datosHorarios) {
  console.log('🔄 Procesando horarios para vista:', datosHorarios.length);
  
  horariosDisponibles.value = datosHorarios.map(horario => {
    // Debug: ver qué modalidad tiene cada horario
    console.log(`Procesando horario ${horario.id}: modalidad_id = ${horario.modalidad_id}`);
    
    // Calcular cupo disponible
    const cupoMaximo = horario.cupo_maximo || 15;
    const cupoActual = horario.cupo_actual || 0;
    const cupoDisponible = Math.max(0, cupoMaximo - cupoActual);
    
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

function toggleHorarioSeleccionado(horario) {
  const index = horariosSeleccionados.value.indexOf(horario.id);

  if (index === -1) {
    if (horariosSeleccionados.value.length < 4) {
      horariosSeleccionados.value = [...horariosSeleccionados.value, horario.id];
      horariosSeleccionadosDetalles.value = [...horariosSeleccionadosDetalles.value, horario];
      toast.add({
        severity: 'success',
        summary: 'Horario agregado',
        detail: `${horario.dia_semana} ${horario.hora_inicio} seleccionado`,
        life: 1500
      });
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Límite alcanzado',
        detail: 'Máximo 4 horarios por inscripción',
        life: 3000
      });
    }
  } else {
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







// Función para verificar datos antes de enviar
function verificarDatosInscripcion() {
  if (horariosSeleccionadosDetalles.value.length === 0) {
    return { valido: false, error: 'No hay horarios seleccionados' };
  }

  const primerHorario = horariosSeleccionadosDetalles.value[0];

  const verificaciones = [
    { campo: 'estudiante_id', valor: estudianteSeleccionado.value?.id, requerido: true },
    { campo: 'modalidad_id', valor: primerHorario.modalidad_id, requerido: true },
    { campo: 'sucursal_id', valor: primerHorario.sucursal_id, requerido: true },
    { campo: 'entrenador_id', valor: primerHorario.entrenador_id, requerido: true },
    { campo: 'fecha_inicio', valor: inscripcionForm.value.fecha_inicio, requerido: true },
    { campo: 'monto_mensual', valor: getPrecioTotal(), requerido: true },
    { campo: 'horarios', valor: horariosSeleccionados.value, requerido: true }
  ];

  const errores = [];

  for (const ver of verificaciones) {
    if (ver.requerido && (!ver.valor || ver.valor === '' || ver.valor === 0)) {
      errores.push(`${ver.campo} es requerido`);
    }
  }

  return {
    valido: errores.length === 0,
    errores: errores,
    datos: {
      estudiante_id: estudianteSeleccionado.value?.id,
      modalidad_id: primerHorario.modalidad_id,
      sucursal_id: primerHorario.sucursal_id,
      entrenador_id: primerHorario.entrenador_id,
      fecha_inicio: inscripcionForm.value.fecha_inicio,
      monto_mensual: getPrecioTotal(),
      horarios: horariosSeleccionados.value
    }
  };
}

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

async function guardarInscripcionYpago() {
  // Validación de estudiante
  if (!estudianteSeleccionado.value || !estudianteSeleccionado.value.id) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Debe seleccionar un estudiante',
      life: 4000
    });
    return;
  }

  // Validación de modalidad
  if (!modalidadSeleccionada.value || !modalidadSeleccionada.value.id) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Debe seleccionar una modalidad',
      life: 4000
    });
    return;
  }

  // Validación de horarios
  if (!horariosSeleccionados.value.length || !horariosSeleccionadosDetalles.value.length) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Debe seleccionar al menos un horario',
      life: 4000
    });
    return;
  }

  // Validación de fechas
  if (!inscripcionForm.value.fecha_inicio) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Debe seleccionar una fecha de inicio',
      life: 4000
    });
    return;
  }

  // FUNCIÓN CORREGIDA PARA FORMATO DE FECHA
  const formatDateToYMD = (date) => {
    if (!date) return null;
    
    const d = new Date(date);
    
    // Verificar si la fecha es válida
    if (isNaN(d.getTime())) {
      console.error('❌ Fecha inválida recibida:', date);
      // Si la fecha es inválida, usar hoy
      const hoy = new Date();
      const year = hoy.getFullYear();
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const day = String(hoy.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Usar componentes locales para evitar problemas de zona horaria
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    const fechaFormateada = `${year}-${month}-${day}`;
    
    console.log(`📅 Formateando fecha: ${date} -> ${fechaFormateada}`);
    console.log(`   - Original: ${d}`);
    console.log(`   - UTC: ${d.toISOString()}`);
    console.log(`   - Local: ${d.toLocaleDateString('es-ES')}`);
    console.log(`   - Timezone Offset: ${d.getTimezoneOffset()} minutos`);
    
    return fechaFormateada;
  };

  // Debug: Mostrar información de zona horaria
  console.log('🕒 Zona horaria del navegador:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Obtener fechas formateadas para validación
  const fechaInicioFormateada = formatDateToYMD(inscripcionForm.value.fecha_inicio);
  const fechaFinFormateada = formatDateToYMD(inscripcionForm.value.fecha_fin);
  
  // Para validación, usar el objeto Date original
  const fechaInicioDate = new Date(inscripcionForm.value.fecha_inicio);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Asegurar que sea inicio del día
  
  // DEBUG: Mostrar fechas para validación
  console.log('📊 DEBUG VALIDACIÓN FECHAS:');
  console.log('Fecha inicio Date:', fechaInicioDate);
  console.log('Fecha inicio formateada:', fechaInicioFormateada);
  console.log('Fecha inicio local:', fechaInicioDate.toLocaleDateString('es-ES'));
  console.log('Hoy:', hoy.toLocaleDateString('es-ES'));
  console.log('Hoy Date:', hoy);
  
  // Comparar fechas usando componentes locales (no horas)
  const fechaInicioComparar = new Date(fechaInicioDate);
  fechaInicioComparar.setHours(0, 0, 0, 0);
  
  if (fechaInicioComparar < hoy) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `La fecha de inicio (${fechaInicioDate.toLocaleDateString('es-ES')}) no puede ser anterior a hoy (${hoy.toLocaleDateString('es-ES')})`,
      life: 4000
    });
    return;
  }

  // Validación de fecha fin (si está presente)
  if (inscripcionForm.value.fecha_fin) {
    const fechaFinDate = new Date(inscripcionForm.value.fecha_fin);
    fechaFinDate.setHours(0, 0, 0, 0);
    
    if (fechaFinDate <= fechaInicioComparar) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: `La fecha fin (${fechaFinDate.toLocaleDateString('es-ES')}) debe ser posterior a la fecha inicio (${fechaInicioDate.toLocaleDateString('es-ES')})`,
        life: 4000
      });
      return;
    }
  }

  // Validación de pago
  if (pagoForm.value.monto <= 0) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'El monto del pago debe ser mayor a 0',
      life: 4000
    });
    return;
  }

  // Validar que el monto no sea mayor al precio total
  const precioTotal = getPrecioTotal();
  if (parseFloat(pagoForm.value.monto) > parseFloat(precioTotal)) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: `El monto del pago (${pagoForm.value.monto}) es mayor al precio total (${precioTotal})`,
      life: 5000
    });
    // Continuar de todos modos, solo es advertencia
  }

  guardando.value = true;

  try {
    // Obtener el primer horario para sucursal y entrenador
    const primerHorario = horariosSeleccionadosDetalles.value[0];
    
    // Validar que el horario tenga sucursal y entrenador
    if (!primerHorario?.sucursal_id) {
      throw new Error('El horario seleccionado no tiene sucursal asignada');
    }
    
    if (!primerHorario?.entrenador_id) {
      throw new Error('El horario seleccionado no tiene entrenador asignado');
    }

    // Obtener mes y año de la fecha de inicio
    const mesInicio = fechaInicioDate.getMonth() + 1;
    const anioInicio = fechaInicioDate.getFullYear();

    // Preparar datos de inscripción con fechas corregidas
    const datosInscripcion = {
      estudiante_id: Number(estudianteSeleccionado.value.id),
      modalidad_id: Number(modalidadSeleccionada.value.id),
      sucursal_id: primerHorario.sucursal_id ? Number(primerHorario.sucursal_id) : null,
      entrenador_id: primerHorario.entrenador_id ? Number(primerHorario.entrenador_id) : null,
      fecha_inicio: fechaInicioFormateada,
      fecha_fin: fechaFinFormateada,
      monto_mensual: Number(getPrecioTotal()),
      horarios: horariosSeleccionados.value.map(id => Number(id)),
      // Campos adicionales para validación en backend
      mes_inicio: mesInicio,
      anio_inicio: anioInicio
    };

    console.log('📤 Enviando datos de inscripción:', datosInscripcion);
    console.log('📊 Fecha inicio que se envía:', datosInscripcion.fecha_inicio);
    console.log('📊 Fecha fin que se envía:', datosInscripcion.fecha_fin);

    // Crear inscripción
    const responseInscripcion = await inscripcionService.store(datosInscripcion);
    console.log('📥 Respuesta inscripción:', responseInscripcion.data);

    if (!responseInscripcion.data.success) {
      throw new Error(responseInscripcion.data.message || 'Error al crear la inscripción');
    }

    const inscripcionId = responseInscripcion.data.inscripcion_id;
    
    if (!inscripcionId) {
      throw new Error('No se recibió el ID de la inscripción');
    }

    // CREAR PAGO - Usar la fecha actual formateada
    const fechaPagoFormateada = formatDateToYMD(new Date());
    
    const datosPago = {
      inscripcion_id: inscripcionId,
      monto: parseFloat(pagoForm.value.monto || getPrecioTotal()),
      metodo_pago: pagoForm.value.metodo_pago || 'efectivo',
      fecha_pago: fechaPagoFormateada,
      estado: 'pagado',
      observacion: pagoForm.value.observacion || '',
      // Campos para control interno
      mes_correspondiente: mesInicio,
      anio_correspondiente: anioInicio,
      tipo_pago: 'inscripcion' // Para identificar que es pago de inscripción
    };

    console.log('📤 Enviando datos de pago:', datosPago);
    console.log('📊 Fecha pago que se envía:', datosPago.fecha_pago);

    const responsePago = await pagoService.store(datosPago);
    console.log('📥 Respuesta pago:', responsePago.data);

    if (!responsePago.data.success) {
      // Si el pago falla, podrías querer revertir la inscripción
      console.warn('⚠️ Pago creado pero con advertencias:', responsePago.data.message);
      // No hacemos throw aquí para no revertir la inscripción exitosa
    }

    // ÉXITO - Cerrar diálogo y recargar datos
    cerrarDialogoCompleto();
    
    // Mensaje de éxito principal con información clara
    const fechaInicioMostrar = fechaInicioDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    toast.add({
      severity: 'success',
      summary: '✅ Inscripción y Pago Registrados',
      detail: `Inscripción #${inscripcionId} creada exitosamente para el ${fechaInicioMostrar}`,
      life: 5000
    });

    // Mostrar distribución de clases si está disponible
    if (responseInscripcion.data.data?.distribucion) {
      const distrib = responseInscripcion.data.data.distribucion;
      const totalClases = responseInscripcion.data.data.clases_totales;
      
      // Mensaje adicional con información de distribución
      setTimeout(() => {
        toast.add({
          severity: 'info',
          summary: '📋 Distribución de Clases',
          detail: `Total: ${totalClases} clases (${distrib.clases_por_horario_base} base + ${distrib.horarios_con_extra} extra)`,
          life: 6000
        });
      }, 1000);
    }

    // Recargar datos después de un breve delay
    setTimeout(() => {
      cargarDatos();
    }, 800);

  } catch (error) {
    console.error('❌ Error completo:', error);
    
    let detalle = error.message;
    let summary = 'Error al procesar';
    
    // Manejo de errores específicos
    if (error.response) {
      // Error de respuesta HTTP
      if (error.response.status === 422) {
        summary = 'Error de validación';
        detalle = error.response.data.message || 'Datos inválidos';
        
        // Mostrar errores de validación específicos
        if (error.response.data.errors) {
          const errores = Object.values(error.response.data.errors).flat();
          detalle = errores.join(', ');
        }
      } else if (error.response.status === 409) {
        summary = 'Conflicto';
        detalle = error.response.data.message || 'El estudiante ya tiene una inscripción activa';
      } else if (error.response.status === 404) {
        summary = 'No encontrado';
        detalle = error.response.data.message || 'Recurso no encontrado';
      } else if (error.response.data?.message) {
        detalle = error.response.data.message;
      }
      
      // Log detallado de la respuesta del servidor
      console.error('📥 Respuesta del servidor:', error.response.data);
    } else if (error.request) {
      // Error de red o timeout
      summary = 'Error de conexión';
      detalle = 'No se pudo conectar con el servidor. Verifique su conexión.';
    }

    // Mostrar error al usuario
    toast.add({
      severity: 'error',
      summary: summary,
      detail: detalle,
      life: 7000
    });

    // Log adicional para depuración
    console.error('Detalles del error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
  } finally {
    guardando.value = false;
  }
}

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

function procesarInscripciones(data) {
  if (!Array.isArray(data)) {
    console.error('Datos de inscripciones no es un array:', data);
    return [];
  }

  return data.map(insc => {
    const diasRestantes = calcularDiasRestantes(insc.fecha_fin);
    let montoMensual = insc.monto_mensual;

    if (typeof montoMensual === 'string') {
      montoMensual = parseFloat(montoMensual);
    }

    if (isNaN(montoMensual)) {
      montoMensual = 0;
    }

    // Calcular progreso una sola vez
    const progreso = getClasesProgreso(insc);
    const porcentaje = calcularProgresoClases(insc);

    return {
      ...insc,
      dias_restantes: diasRestantes,
      monto_mensual: montoMensual,
      clases_restantes_calculadas: insc.clases_restantes_calculadas ||
        insc.clases_restantes ||
        0,
      clases_progreso: progreso, // ← Nuevo
      progreso_porcentaje: porcentaje // ← Nuevo
    };
  });
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
  // Si tiene inscripcion_horarios
  if (inscripcion.inscripcion_horarios && inscripcion.inscripcion_horarios.length > 0) {
    const totalClases = inscripcion.inscripcion_horarios.reduce((sum, ih) => {
      return sum + (ih.clases_totales || 0);
    }, 0);
    
    const totalRestantes = inscripcion.inscripcion_horarios.reduce((sum, ih) => {
      return sum + (ih.clases_restantes || 0);
    }, 0);
    
    const asistidas = Math.max(0, totalClases - totalRestantes);
    return { asistidas, total: totalClases };
  }
  
  // Si no, usar los campos directos
  const total = inscripcion.clases_totales || 12;
  const restantes = inscripcion.clases_restantes_calculadas || 
                    inscripcion.clases_restantes || 
                    total;
  
  const asistidas = Math.max(0, total - restantes);
  return { asistidas, total };
}


function calcularProgresoClases(inscripcion) {
  console.log('📊 Calculando progreso para inscripción:', inscripcion.id);
  
  // CASO 1: Si tiene inscripcion_horarios (relación cargada)
  if (inscripcion.inscripcion_horarios && inscripcion.inscripcion_horarios.length > 0) {
    console.log('📅 Usando datos de inscripcion_horarios');
    
    const totalRestantes = inscripcion.inscripcion_horarios.reduce((sum, ih) => {
      return sum + (ih.clases_restantes || 0);
    }, 0);

    const totalClases = inscripcion.inscripcion_horarios.reduce((sum, ih) => {
      return sum + (ih.clases_totales || 0);
    }, 0);

    console.log(`📊 Total clases: ${totalClases}, Restantes: ${totalRestantes}`);
    
    if (totalClases === 0) return 0;

    const asistidas = Math.max(0, totalClases - totalRestantes);
    const porcentaje = (asistidas / totalClases) * 100;
    
    console.log(`📊 Asistidas: ${asistidas}, Porcentaje: ${porcentaje}%`);
    return Math.min(100, Math.max(0, porcentaje));
  }

  // CASO 2: Si tiene clases_totales directamente
  const total = inscripcion.clases_totales || 12; // Default 12 clases/mes
  const restantes = inscripcion.clases_restantes_calculadas || 
                    inscripcion.clases_restantes || 
                    inscripcion.clases_totales || 12;
  
  const asistidas = Math.max(0, total - restantes);
  const porcentaje = (asistidas / total) * 100;
  
  console.log(`📊 Caso 2 - Total: ${total}, Restantes: ${restantes}, Asistidas: ${asistidas}, Porcentaje: ${porcentaje}%`);
  return Math.min(100, Math.max(0, porcentaje));
}

function puedeRenovar(inscripcion) {
  if (inscripcion.estado !== 'activo') return false;
  const diasRestantes = calcularDiasRestantes(inscripcion.fecha_fin);
  return diasRestantes <= 7;
}

function calcularDiasRestantes(fechaFin) {
  if (!fechaFin) return 0;
  const hoy = new Date();
  const fin = new Date(fechaFin);
  const diffTime = fin - hoy;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function obtenerSeveridadEstado(estado, fechaFin) {
  const diasRestantes = calcularDiasRestantes(fechaFin);

  switch (estado) {
    case 'activo':
      if (diasRestantes <= 0) return 'danger';
      if (diasRestantes <= 3) return 'warning';
      return 'success';
    case 'suspendido':
      return 'warning';
    case 'vencido':
      return 'danger';
    default:
      return 'info';
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

async function renovarInscripcion(inscripcion) {
  try {
    const datosRenovacion = {
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: calcularNuevaFechaFin(),
      motivo: 'Renovación mensual'
    };

    await inscripcionService.renovar(inscripcion.id, datosRenovacion);

    toast.add({
      severity: 'success',
      summary: 'Renovación exitosa',
      detail: `Inscripción renovada hasta ${formatFecha(datosRenovacion.fecha_fin)}`,
      life: 3000
    });

    await cargarDatos();

  } catch (error) {
    manejarError('Error renovando inscripción', error);
  }
}

function calcularNuevaFechaFin() {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() + 1);
  return fecha.toISOString().split('T')[0];
}

function verDetalles(inscripcion) {
  toast.add({
    severity: 'info',
    summary: 'Detalles',
    detail: `Mostrando detalles de inscripción #${inscripcion.id}`,
    life: 3000
  });
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

function abrirDialogoNueva() {
  tituloDialogo.value = 'Nueva Inscripción';
  pasoActual.value = 0;
  estudianteSeleccionado.value = null;
  buscarEstudiante.value = '';
  filtroDisciplina.value = null;
  inscripcionForm.value = crearInscripcionVacia();
  dialogoInscripcion.value = true;

  cargarEstudiantesParaDialogo();
}

onMounted(() => {
  cargarDatos();
  cargarModalidades()
});

</script>

<style scoped>
.inscripciones-container {
  padding: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* HEADER GLASSMORPHISM */
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

.stat-card:nth-child(1) { --card-color: #3b82f6; }
.stat-card:nth-child(2) { --card-color: #f59e0b; }
.stat-card:nth-child(3) { --card-color: #10b981; }
.stat-card:nth-child(4) { --card-color: #8b5cf6; }

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

/* TOOLBAR MEJORADO */
.custom-toolbar {
  background: white !important;
  border-radius: 12px;
  padding: 1rem 1.5rem !important;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem !important;
}

/* TABVIEW MODERNO */
:deep(.p-tabview) {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.p-tabview-nav) {
  background: #f8fafc !important;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 1rem;
}

:deep(.p-tabview-nav-link) {
  padding: 1rem 1.5rem !important;
  font-weight: 600 !important;
  color: #6b7280 !important;
  transition: all 0.2s;
}

:deep(.p-tabview-nav-link:hover) {
  background: #f1f5f9 !important;
  color: #3b82f6 !important;
}

:deep(.p-tabview-selected .p-tabview-nav-link) {
  color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}

/* DATATABLE MEJORADO */
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

/* DIALOGO DE NUEVA INSCRIPCIÓN */
:deep(.p-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.p-dialog-header) {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 1.5rem;
}

:deep(.p-dialog-title) {
  color: white !important;
  font-weight: 600;
}

:deep(.p-dialog-content) {
  background: #f8fafc;
  padding: 0 !important;
}

/* STEPPER MEJORADO */
:deep(.p-stepper) {
  background: transparent;
}

:deep(.p-stepper-header) {
  background: white;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.p-stepper-step .p-stepper-number) {
  background: #e5e7eb;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

:deep(.p-stepper-step.p-highlight .p-stepper-number) {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

:deep(.p-stepper-step .p-stepper-title) {
  color: #6b7280;
  font-weight: 500;
}

:deep(.p-stepper-step.p-highlight .p-stepper-title) {
  color: #3b82f6;
  font-weight: 600;
}

/* CARDS DE MODALIDAD MEJORADAS */
.modalidad-card {
  border: 2px solid transparent;
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
  cursor: pointer;
  overflow: hidden;
}

.modalidad-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.modalidad-card.selected {
  border-color: #3b82f6;
  background: linear-gradient(to bottom right, rgba(59, 130, 246, 0.05), white);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.2);
}

.modalidad-card :deep(.p-card-title) {
  color: #1f2937;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.modalidad-card :deep(.p-card-content) {
  padding-top: 0.5rem;
}

/* HORARIO CARD */
.horario-card {
  border: 2px solid transparent;
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
  cursor: pointer;
}

.horario-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.horario-card.selected {
  border-color: #10b981;
  background: linear-gradient(to bottom right, rgba(16, 185, 129, 0.05), white);
}

.selection-indicator {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* CHIPS Y TAGS MEJORADOS */
:deep(.p-chip) {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}

:deep(.p-tag) {
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
}

/* BADGES DE ESTADO */
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

/* PROGRESS BAR MEJORADO */
:deep(.p-progressbar) {
  border-radius: 10px;
  height: 8px;
  background: #e5e7eb;
}

:deep(.p-progressbar-value) {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 10px;
}

/* AVATAR CIRCULAR */
:deep(.p-avatar) {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-weight: 600;
}

/* BOTONES MEJORADOS */
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

/* INPUTS MEJORADOS */
:deep(.p-inputtext) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.2s;
  padding: 0.75rem 1rem;
}

:deep(.p-inputtext:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

:deep(.p-dropdown) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

:deep(.p-calendar) {
  border-radius: 8px;
}

:deep(.p-calendar .p-inputtext) {
  border-radius: 8px 0 0 8px !important;
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

/* BORDES REDONDEADOS */
.border-round {
  border-radius: 12px;
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

/* GRID MEJORADO */
.grid {
  margin: 0 -0.75rem;
}

.grid .col {
  padding: 0.75rem;
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

.modalidad-card, .horario-card {
  animation: fadeIn 0.3s ease-out;
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

/* RESPONSIVE */
@media (max-width: 768px) {
  .inscripciones-container {
    padding: 1rem;
  }
  
  .dashboard-cards {
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
  
  :deep(.p-toolbar) {
    flex-direction: column;
    gap: 1rem;
  }
  
  :deep(.p-toolbar-start),
  :deep(.p-toolbar-end) {
    width: 100%;
    justify-content: center;
  }
  
  :deep(.p-tabview-nav) {
    flex-wrap: wrap;
  }
}

@media (max-width: 576px) {
  .dashboard-cards .grid .col {
    margin-bottom: 1rem;
  }
  
  :deep(.p-dialog) {
    width: 95vw !important;
    margin: 0.5rem;
  }
  
  :deep(.p-stepper) {
    flex-direction: column;
  }
}

/* LOADING STATES */
:deep(.p-progress-spinner) {
  color: #3b82f6;
}

/* HOVER EFFECTS PARA FILAS DE TABLA */
:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}

:deep(.p-datatable-tbody > tr:hover td) {
  background: linear-gradient(to right, rgba(59, 130, 246, 0.02), transparent);
}

/* DROPDOWN MEJORADO */
:deep(.p-dropdown-panel) {
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

:deep(.p-dropdown-item) {
  padding: 0.75rem 1rem;
  border-radius: 4px;
}

:deep(.p-dropdown-item:hover) {
  background: #f3f4f6;
}

/* CALENDAR MEJORADO */
:deep(.p-datepicker) {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* ESTILOS ESPECÍFICOS PARA ÍCONOS */
.pi-users { color: #3b82f6; }
.pi-clock { color: #f59e0b; }
.pi-calendar { color: #10b981; }
.pi-money-bill { color: #8b5cf6; }
.pi-search { color: #9ca3af; }
.pi-filter { color: #6b7280; }
.pi-eye { color: #3b82f6; }
.pi-refresh { color: #10b981; }
.pi-user-plus { color: #10b981; }
.pi-file-excel { color: #059669; }
.pi-check { color: #10b981; }
.pi-times { color: #ef4444; }
.pi-info-circle { color: #3b82f6; }
.pi-tag { color: #8b5cf6; }
.pi-shield { color: #f59e0b; }
.pi-building { color: #6b7280; }
.pi-user { color: #3b82f6; }
.pi-calendar-check { color: #10b981; }
.pi-ticket { color: #f59e0b; }
.pi-ellipsis-h { color: #6b7280; }
.pi-arrow-right { color: white; }
.pi-bug { color: #8b5cf6; }
.pi-calendar-plus { color: #059669; }
</style>