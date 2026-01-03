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
                    {{ (slotProps.data.clases_totales || 0) - (slotProps.data.clases_restantes_calculadas || 0) }}/{{
                      slotProps.data.clases_totales }}
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

    <!-- Diálogo de nueva inscripción MODAL -->
    <!-- Diálogo de nueva inscripción MODAL -->
    <Dialog v-model:visible="dialogoInscripcion" :header="tituloDialogo" :modal="true"
      :style="{ width: '90vw', maxWidth: '1200px' }" :closable="false">

      <Stepper v-model:activeStep="pasoActual" class="mb-4">
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
                      <Column field="ci" header="ci"></Column>
                      <Column field="telefono" header="Teléfono"></Column>
                      <Column field="correo" header="correo"></Column>
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
                            <!-- Usar el campo calculado en lugar de clases_restantes -->
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
                        <template v-else>
                          Seleccione un estudiante para ver sus inscripciones
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
                <Button label="Cancelar" severity="secondary" @click="cerrarDialogo" />
                <Button label="Siguiente" :disabled="!estudianteSeleccionado" @click="siguientePaso" />
              </div>
            </div>
          </template>
        </StepperPanel>

        <StepperPanel header="Modalidad">
          <template #content="{ prevCallback, nextCallback }">
            <div class="p-3">
              <h4>Seleccionar Modalidad</h4>
              <div class="grid">
                <div v-for="modalidad in modalidades" :key="modalidad.id" class="col-12 md:col-6 lg:col-4">
                  <Card class="modalidad-card" @click="seleccionarModalidad(modalidad)"
                    :class="{ 'selected': inscripcionForm.modalidad_id === modalidad.id }">
                    <template #title>
                      <div class="flex justify-content-between align-items-center">
                        <span>{{ modalidad.nombre }}</span>
                        <Tag :value="`$${modalidad.precio_mensual}`" severity="success" />
                      </div>
                    </template>
                    <template #content>
                      <div class="modalidad-details">
                        <div class="detail-item">
                          <i class="pi pi-calendar text-primary"></i>
                          <span>{{ modalidad.clases_mensuales }} clases/mes</span>
                        </div>
                        <div class="detail-item">
                          <i class="pi pi-clock text-primary"></i>
                          <span>{{ modalidad.duracion_clase || 60 }} min/clase</span>
                        </div>
                        <div class="detail-item">
                          <i class="pi pi-shield text-primary"></i>
                          <span>{{ modalidad.permisos_maximos || 2 }} permisos</span>
                        </div>
                        <div class="detail-item">
                          <i class="pi pi-dollar text-primary"></i>
                          <span>${{ modalidad.precio_mensual }}/mes</span>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>

              <div class="flex justify-content-between mt-4">
                <Button label="Atrás" severity="secondary" @click="prevCallback" />
                <Button label="Siguiente" :disabled="!inscripcionForm.modalidad_id" @click="siguientePaso" />
              </div>
            </div>
          </template>
        </StepperPanel>

        <StepperPanel header="Detalles">
          <template #content="{ prevCallback, nextCallback }">
            <div class="p-3">
              <h4>Información Adicional</h4>

              <div class="grid">
                <div class="col-12 md:col-6">
                  <div class="field mb-3">
                    <label for="fecha_inicio">Fecha de inicio</label>
                    <Calendar v-model="inscripcionForm.fecha_inicio" dateFormat="dd/mm/yy" class="w-full"
                      :minDate="hoy" />
                  </div>

                  <div class="field mb-3">
                    <label for="fecha_fin">Fecha de fin</label>
                    <Calendar v-model="inscripcionForm.fecha_fin" dateFormat="dd/mm/yy" class="w-full"
                      :minDate="inscripcionForm.fecha_inicio || hoy" />
                  </div>

                  <div class="field mb-3">
                    <label for="sucursal">Sucursal *</label>
                    <Dropdown v-model="inscripcionForm.sucursal_id" :options="sucursales" optionLabel="nombre"
                      optionValue="id" placeholder="Seleccione una sucursal" class="w-full" />
                    <small v-if="!inscripcionForm.sucursal_id" class="p-error">Este campo es requerido</small>
                  </div>
                </div>

                <div class="col-12 md:col-6">
                  <div class="field mb-3">
                    <label for="entrenador">Entrenador *</label>
                    <Dropdown v-model="inscripcionForm.entrenador_id" :options="entrenadores" optionLabel="nombres"
                      optionValue="id" placeholder="Seleccione un entrenador" class="w-full" />
                    <small v-if="!inscripcionForm.entrenador_id" class="p-error">Este campo es requerido</small>
                  </div>

                  <div class="field mb-3">
                    <label for="monto_mensual">Monto Mensual ($) *</label>
                    <InputNumber v-model="inscripcionForm.monto_mensual" mode="currency" currency="USD" locale="en-US"
                      class="w-full" :min="0" :max="1000" :fractionDigits="2" />
                    <small v-if="!inscripcionForm.monto_mensual || inscripcionForm.monto_mensual <= 0"
                      class="p-error">Ingrese un monto válido</small>
                  </div>

                  <div class="field mb-3">
                    <label for="clases_totales">Clases Totales</label>
                    <InputNumber v-model="inscripcionForm.clases_totales" class="w-full" :min="1" :max="50" :step="1" />
                  </div>
                </div>
              </div>

              <!-- Horarios opcionales -->
              <!-- En el paso 3, cambia el MultiSelect -->
              <!-- En el paso 3 "Detalles" del diálogo, reemplaza el MultiSelect actual por este: -->
              <div class="field mb-3">
                <label for="horarios">Horarios Disponibles</label>

                <!-- Mensaje cuando no hay horarios -->
                <div v-if="horariosDisponibles.length === 0 && inscripcionForm.modalidad_id"
                  class="p-3 border-round bg-gray-100 mb-2">
                  <div class="flex align-items-center">
                    <i class="pi pi-info-circle text-primary mr-2"></i>
                    <div>
                      <div class="font-medium">No hay horarios disponibles</div>
                      <small class="text-500">
                        {{
                          inscripcionForm.sucursal_id
                            ? 'No hay horarios para esta modalidad en la sucursal seleccionada'
                            : 'Seleccione una modalidad para ver los horarios disponibles'
                        }}
                      </small>
                    </div>
                  </div>
                </div>

                <!-- MultiSelect cuando hay horarios -->
                <MultiSelect v-else-if="horariosDisponibles.length > 0" v-model="horariosSeleccionados"
                  :options="horariosDisponibles" optionLabel="descripcion" optionValue="id"
                  placeholder="Seleccione horarios" :filter="true" display="chip" class="w-full" :maxSelectedLabels="3"
                  :showToggleAll="false">
                  <!-- Template personalizado para las opciones -->
                  <template #option="slotProps">
                    <div class="flex align-items-center p-2">
                      <!-- Círculo de color -->
                      <div class="mr-3" :style="{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: slotProps.option.color || '#3B82F6'
                      }"></div>

                      <!-- Información del horario -->
                      <div class="flex-grow-1">
                        <div class="font-medium">{{ slotProps.option.nombre }}</div>
                        <div class="text-sm text-500">
                          {{ slotProps.option.dia_semana }} {{ slotProps.option.hora_inicio }} - {{
                            slotProps.option.hora_fin }}
                        </div>
                        <div class="text-xs text-500 mt-1">
                          <span class="mr-3">Cupo: {{ slotProps.option.cupo_disponible }}/{{
                            slotProps.option.cupo_maximo }}</span>
                          <span v-if="slotProps.option.entrenador_id">Entrenador: {{
                            getNombreEntrenador(slotProps.option.entrenador_id) }}</span>
                        </div>
                      </div>

                      <!-- Check si está seleccionado -->
                      <i v-if="horariosSeleccionados.includes(slotProps.option.id)"
                        class="pi pi-check text-primary ml-2"></i>
                    </div>
                  </template>

                  <!-- Template para los chips seleccionados -->
                  <template #value="slotProps">
                    <div v-if="slotProps.value && slotProps.value.length > 0" class="flex flex-wrap gap-1">
                      <Chip v-for="horarioId in slotProps.value" :key="horarioId"
                        :label="getHorarioChipLabel(horarioId)" class="mb-1"
                        :style="{ backgroundColor: getHorarioColor(horarioId) + '20', color: getHorarioColor(horarioId) }">
                        <template #removeicon>
                          <i class="pi pi-times text-xs"></i>
                        </template>
                      </Chip>
                    </div>
                    <span v-else>{{ slotProps.placeholder }}</span>
                  </template>
                </MultiSelect>

                <!-- Mensaje cuando no hay modalidad seleccionada -->
                <div v-else class="p-3 border-round bg-gray-100">
                  <div class="flex align-items-center">
                    <i class="pi pi-info-circle text-500 mr-2"></i>
                    <small class="text-500">Seleccione una modalidad primero para ver los horarios disponibles</small>
                  </div>
                </div>

                <!-- Contador -->
                <small v-if="horariosDisponibles.length > 0" class="text-500 mt-1">
                  <i class="pi pi-check-circle mr-1"></i>
                  {{ horariosSeleccionados.length }} de {{ horariosDisponibles.length }} horarios seleccionados
                </small>
              </div>

              <div class="flex justify-content-between mt-4">
                <Button label="Atrás" severity="secondary" @click="prevCallback" />
                <Button label="Siguiente"
                  :disabled="!inscripcionForm.sucursal_id || !inscripcionForm.entrenador_id || !inscripcionForm.monto_mensual"
                  @click="siguientePaso" />
              </div>
            </div>
          </template>
        </StepperPanel>

        <!-- REEMPLAZA el StepperPanel actual "Confirmación" con estos dos pasos -->

        <!-- Paso 4: Pago (NUEVO) -->
        <StepperPanel header="Pago">
          <template #content="{ prevCallback, nextCallback }">
            <div class="p-3">
              <h4>Registro de Pago</h4>

              <Card class="mb-4">
                <template #title>Resumen de Montos</template>
                <template #content>
                  <div class="grid">
                    <div class="col-12 md:col-6">
                      <div class="flex flex-column gap-3">
                        <div class="flex justify-content-between">
                          <span class="text-500">Modalidad:</span>
                          <span class="font-bold">{{ modalidadSeleccionada?.nombre || '--' }}</span>
                        </div>
                        <div class="flex justify-content-between">
                          <span class="text-500">Precio Mensual:</span>
                          <span class="font-bold">${{ modalidadSeleccionada?.precio_mensual || '0.00' }}</span>
                        </div>
                        <div class="flex justify-content-between">
                          <span class="text-500">Monto a Pagar:</span>
                          <span class="font-bold text-green-600">${{ montoAPagar }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="col-12 md:col-6">
                      <div class="flex flex-column gap-3">
                        <div class="field">
                          <label for="monto_pago" class="block mb-2">Monto a Pagar *</label>
                          <InputNumber id="monto_pago" v-model="pagoForm.monto" mode="currency" currency="USD"
                            locale="en-US" class="w-full" :min="0" :max="10000" :fractionDigits="2" />
                        </div>

                        <div class="field">
                          <label for="metodo_pago" class="block mb-2">Método de Pago *</label>
                          <Dropdown id="metodo_pago" v-model="pagoForm.metodo_pago" :options="metodosPago"
                            optionLabel="label" optionValue="value" placeholder="Seleccione método" class="w-full"
                            :class="{ 'p-invalid': !pagoForm.metodo_pago }" />
                          <small v-if="!pagoForm.metodo_pago" class="p-error">Seleccione un método de pago</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Fecha de pago -->
                  <div class="mt-3">
                    <div class="field">
                      <label for="fecha_pago" class="block mb-2">Fecha de Pago</label>
                      <Calendar id="fecha_pago" v-model="pagoForm.fecha_pago" dateFormat="dd/mm/yy" class="w-full"
                        :maxDate="new Date()" showIcon />
                    </div>
                  </div>

                  <!-- Observaciones -->
                  <div class="mt-3">
                    <div class="field">
                      <label for="observacion" class="block mb-2">Observaciones (Opcional)</label>
                      <Textarea id="observacion" v-model="pagoForm.observacion" rows="2" class="w-full"
                        placeholder="Notas sobre el pago..." />
                    </div>
                  </div>
                </template>
              </Card>

              <!-- Resumen de lo que se está pagando -->
              <Card class="mb-4">
                <template #title>Detalles de lo que incluye el pago</template>
                <template #content>
                  <div class="grid">
                    <div class="col-12 md:col-6">
                      <ul class="list-none p-0 m-0">
                        <li class="mb-2 flex align-items-center">
                          <i class="pi pi-check-circle text-green-500 mr-2"></i>
                          <span>{{ modalidadSeleccionada?.clases_mensuales || 0 }} clases mensuales</span>
                        </li>
                        <li class="mb-2 flex align-items-center">
                          <i class="pi pi-check-circle text-green-500 mr-2"></i>
                          <span>Acceso a instalaciones</span>
                        </li>
                        <li class="mb-2 flex align-items-center">
                          <i class="pi pi-check-circle text-green-500 mr-2"></i>
                          <span>Acompañamiento de entrenador</span>
                        </li>
                      </ul>
                    </div>
                    <div class="col-12 md:col-6">
                      <ul class="list-none p-0 m-0">
                        <li class="mb-2 flex align-items-center">
                          <i class="pi pi-check-circle text-green-500 mr-2"></i>
                          <span>{{ modalidadSeleccionada?.permisos_maximos || 2 }} permisos mensuales</span>
                        </li>
                        <li class="mb-2 flex align-items-center">
                          <i class="pi pi-check-circle text-green-500 mr-2"></i>
                          <span>Material básico incluido</span>
                        </li>
                        <li class="mb-2 flex align-items-center">
                          <i class="pi pi-check-circle text-green-500 mr-2"></i>
                          <span>Válido por 1 mes</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </template>
              </Card>

              <div class="flex justify-content-between mt-4">
                <Button label="Atrás" severity="secondary" @click="prevCallback" />
                <Button label="Siguiente" severity="success" @click="validarPago"
                  :disabled="!pagoForm.monto || !pagoForm.metodo_pago" />
              </div>
            </div>
          </template>
        </StepperPanel>

        <!-- Paso 5: Confirmación (actualizado) -->
        <StepperPanel header="Confirmación">
          <template #content="{ prevCallback }">
            <div class="p-3">
              <h4>Confirmar Inscripción y Pago</h4>

              <div class="grid mb-4">
                <div class="col-12 md:col-6">
                  <Card class="mb-3">
                    <template #title>Datos del Estudiante</template>
                    <template #content>
                      <div v-if="estudianteSeleccionado" class="flex flex-column gap-2">
                        <div class="flex align-items-center">
                          <Avatar :label="getIniciales(estudianteSeleccionado)" class="mr-2" />
                          <div>
                            <div class="font-bold">{{ estudianteSeleccionado.nombres }} {{
                              estudianteSeleccionado.apellidos }}</div>
                            <div class="text-sm text-500">CI: {{ estudianteSeleccionado.ci }}</div>
                            <div class="text-sm text-500">Tel: {{ estudianteSeleccionado.telefono }}</div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>

                <div class="col-12 md:col-6">
                  <Card class="mb-3">
                    <template #title>Información de Pago</template>
                    <template #content>
                      <div class="flex flex-column gap-2">
                        <div class="flex justify-content-between">
                          <span class="text-500">Monto:</span>
                          <span class="font-bold text-green-600">${{ pagoForm.monto || '0.00' }}</span>
                        </div>
                        <div class="flex justify-content-between">
                          <span class="text-500">Método:</span>
                          <Tag :value="pagoForm.metodo_pago" :severity="getSeveridadMetodoPago(pagoForm.metodo_pago)" />
                        </div>
                        <div class="flex justify-content-between">
                          <span class="text-500">Fecha:</span>
                          <span class="font-bold">{{ formatFecha(pagoForm.fecha_pago) }}</span>
                        </div>
                        <div v-if="pagoForm.observacion" class="mt-2">
                          <span class="text-500">Observación:</span>
                          <p class="text-sm mt-1">{{ pagoForm.observacion }}</p>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>

              <Card class="mb-4">
                <template #title>Resumen Completo</template>
                <template #content>
                  <div class="grid">
                    <div class="col-12 md:col-6">
                      <div class="flex flex-column gap-3">
                        <div class="flex justify-content-between">
                          <span class="text-500">Modalidad:</span>
                          <span class="font-bold">{{ modalidadSeleccionada?.nombre || '--' }}</span>
                        </div>
                        <div class="flex justify-content-between">
                          <span class="text-500">Sucursal:</span>
                          <span class="font-bold">{{ sucursalSeleccionada?.nombre || '--' }}</span>
                        </div>
                        <div class="flex justify-content-between">
                          <span class="text-500">Entrenador:</span>
                          <span class="font-bold">{{ getNombreEntrenador(inscripcionForm.entrenador_id) || '--'
                          }}</span>
                        </div>
                        <div class="flex justify-content-between">
                          <span class="text-500">Clases:</span>
                          <span class="font-bold">{{ inscripcionForm.clases_totales || 0 }} clases</span>
                        </div>
                      </div>
                    </div>

                    <div class="col-12 md:col-6">
                      <div class="flex flex-column gap-3">
                        <div class="flex justify-content-between">
                          <span class="text-500">Fecha inicio:</span>
                          <span class="font-bold">{{ formatFecha(inscripcionForm.fecha_inicio) }}</span>
                        </div>
                        <div class="flex justify-content-between">
                          <span class="text-500">Fecha fin:</span>
                          <span class="font-bold">{{ formatFecha(inscripcionForm.fecha_fin) }}</span>
                        </div>
                        <div class="flex justify-content-between">
                          <span class="text-500">Monto mensual:</span>
                          <span class="font-bold">${{ inscripcionForm.monto_mensual || '0.00' }}</span>
                        </div>
                        <div class="flex justify-content-between">
                          <span class="text-500">Estado:</span>
                          <Tag value="activa" severity="success" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Horarios seleccionados -->
                  <div v-if="horariosSeleccionados.length > 0" class="mt-4 pt-3 border-top-1 surface-border">
                    <h6 class="mb-2">Horarios Seleccionados:</h6>
                    <div class="flex flex-wrap gap-2">
                      <!-- En el StepperPanel "Confirmación", línea ~2050 -->
                      <Chip v-for="horarioId in horariosSeleccionados" :key="horarioId"
                        :label="getHorarioDescripcionCompleta(horarioId)" class="mb-1" :style="{
                          backgroundColor: getHorarioColor(horarioId) + '20',
                          color: getHorarioColor(horarioId)
                        }" />
                    </div>
                  </div>
                </template>
              </Card>

              <div class="flex justify-content-between mt-4">
                <Button label="Atrás" severity="secondary" @click="prevCallback" />
                <Button label="Confirmar Inscripción y Pago" severity="success" @click="guardarInscripcionYpago"
                  :loading="guardando" />
              </div>
            </div>
          </template>
        </StepperPanel>


      </Stepper>
    </Dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';


// Importar servicios
import inscripcionService from '@/services/inscripcion.service';
import estudianteService from '@/services/estudiante.service';
import modalidadService from '@/services/modalidad.service';
import sucursalService from '@/services/sucursal.service';
import entrenadorService from '@/services/entrenador.service';
import horarioService from '@/services/horario.service';
import pagoService from '@/services/pago.service';

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

import MultiSelect from 'primevue/multiselect';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Chip from 'primevue/chip';

const toast = useToast();

// Estados principales
const inscripciones = ref([]);
const estudiantes = ref([]);
const modalidades = ref([]);

// Estados para filtros
const buscar = ref('');
const filtroEstado = ref(null);
const filtroModalidad = ref(null);

// Estados para diálogo de nueva inscripción
const dialogoInscripcion = ref(false);
const pasoActual = ref(0);
const tituloDialogo = ref('Nueva Inscripción');
const estudianteSeleccionado = ref(null);
const buscarEstudiante = ref('');
const inscripcionForm = ref({});
const guardando = ref(false);

// Estados para carga
const cargando = ref(false);
const cargandoEstudiantes = ref(false);

const sucursales = ref([]);
const entrenadores = ref([]);
const horariosDisponibles = ref([]);
const horariosSeleccionados = ref([]);
const hoy = ref(new Date());

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

// Computed para monto a pagar
const montoAPagar = computed(() => {
  return inscripcionForm.value.monto_mensual || 0;
});

// Watch para auto-completar monto cuando cambie la modalidad
watch(() => inscripcionForm.value.modalidad_id, (newVal) => {
  if (newVal && modalidadSeleccionada.value) {
    pagoForm.value.monto = modalidadSeleccionada.value.precio_mensual || 0;
  }
});

const estudiantesFiltrados = computed(() => {
  console.log('=== estudiantesFiltrados computed ===');
  console.log('buscarEstudiante:', buscarEstudiante.value);
  console.log('Total estudiantes:', estudiantes.value.length);

  if (!buscarEstudiante.value.trim()) {
    console.log('Sin búsqueda, devolviendo todos');
    return estudiantes.value;
  }

  const search = buscarEstudiante.value.toLowerCase().trim();
  console.log('Buscando:', search);

  const resultados = estudiantes.value.filter(est => {
    // Verificar cada campo
    const nombre = est.nombres?.toLowerCase() || '';
    const ci = est.ci?.toLowerCase() || '';
    const telefono = est.telefono?.toLowerCase() || '';
    const correo = est.correo?.toLowerCase() || '';

    const coincide = nombre.includes(search) ||
      ci.includes(search) ||
      telefono.includes(search) ||
      correo.includes(search);

    if (coincide) {
      console.log('Coincidencia encontrada:', est.nombres);
    }

    return coincide;
  });

  console.log('Resultados encontrados:', resultados.length);
  return resultados;
});

const modalidadSeleccionada = computed(() => {
  if (!inscripcionForm.value.modalidad_id) return null;
  return modalidades.value.find(m => m.id === inscripcionForm.value.modalidad_id);
});

const inscripcionesActivasEstudiante = computed(() => {
  console.log('=== inscripcionesActivasEstudiante computed ===');
  console.log('Estudiante seleccionado ID:', estudianteSeleccionado.value?.id);
  console.log('Total inscripciones:', inscripciones.value.length);

  if (!estudianteSeleccionado.value) {
    console.log('No hay estudiante seleccionado');
    return [];
  }

  const estudianteId = estudianteSeleccionado.value.id;

  // Filtrar las inscripciones del estudiante
  const inscripcionesDelEstudiante = inscripciones.value.filter(i => {
    console.log(`Inscripción ${i.id}: estudiante_id = ${i.estudiante_id}, estado = ${i.estado}`);
    return i.estudiante_id === estudianteId && i.estado === 'activa';
  });

  console.log(`Inscripciones activas encontradas: ${inscripcionesDelEstudiante.length}`);

  // Mostrar detalles de cada inscripción encontrada
  inscripcionesDelEstudiante.forEach(insc => {
    console.log(`- Inscripción ${insc.id}: Modalidad: ${insc.modalidad?.nombre}, Clases restantes: ${insc.clases_restantes_calculadas}`);
  });

  return inscripcionesDelEstudiante;
});

// Agrega estas computed properties
const sucursalSeleccionada = computed(() => {
  if (!inscripcionForm.value.sucursal_id) return null;
  return sucursales.value.find(s => s.id === inscripcionForm.value.sucursal_id);
});

const entrenadorSeleccionado = computed(() => {
  if (!inscripcionForm.value.entrenador_id) return null;
  const encontrado = entrenadores.value.find(e => e.id === inscripcionForm.value.entrenador_id);
  return encontrado ? { nombres: encontrado.nombres } : null;
});

// Función para obtener descripción de horario
function getHorarioDescripcion(horarioId) {
  const horario = horariosDisponibles.value.find(h => h.id === horarioId);
  if (!horario) return `Horario ${horarioId}`;

  return `${horario.nombre} - ${horario.dia_semana} ${horario.hora_inicio} a ${horario.hora_fin}`;
}


function getEntrenadorLabel(entrenador) {
  if (!entrenador) return '';

  // Prueba diferentes campos posibles
  if (entrenador.nombre_completo) return entrenador.nombre_completo;
  if (entrenador.nombres && entrenador.apellidos) return `${entrenador.nombres} ${entrenador.apellidos}`;
  if (entrenador.nombre) return entrenador.nombre;
  if (entrenador.nombres) return entrenador.nombres;
  return `Entrenador ${entrenador.id}`;
}
// Actualiza la función crearInscripcionVacia()
// En crearInscripcionVacia(), asegúrate de usar new Date() correctamente
// Modifica la función crearInscripcionVacia para incluir datos del pago
function crearInscripcionVacia() {
  const fechaInicio = new Date();
  const fechaFin = new Date();
  fechaFin.setMonth(fechaFin.getMonth() + 1);

  return {
    // Datos de inscripción
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
    estado: 'activa'
  };
}
function getNombreEntrenador(entrenadorId) {
  if (!entrenadorId) return null;
  const entrenador = entrenadores.value.find(e => e.id === entrenadorId);
  return entrenador ? entrenador.nombres : null;
}

function getLabelEntrenador(entrenador) {
  if (!entrenador) return '';

  // Si tiene ambos campos
  if (entrenador.nombres && entrenador.apellidos) {
    return `${entrenador.nombres} ${entrenador.apellidos}`;
  }
  // Si solo tiene nombres
  return entrenador.nombres || `Entrenador ${entrenador.id}`;
}

// Actualiza la función formatFecha para manejar objetos Date
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

// En la función guardarInscripcion, convierte las fechas a string ISO
// 27. Guardar inscripción
async function guardarInscripcionYpago() {
  // Validar campos requeridos de inscripción
  if (!estudianteSeleccionado.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Seleccione un estudiante',
      life: 3000
    });
    return;
  }

  if (!inscripcionForm.value.modalidad_id) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Seleccione una modalidad',
      life: 3000
    });
    return;
  }

  if (!inscripcionForm.value.sucursal_id) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Seleccione una sucursal',
      life: 3000
    });
    return;
  }

  if (!inscripcionForm.value.entrenador_id) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Seleccione un entrenador',
      life: 3000
    });
    return;
  }

  if (!inscripcionForm.value.monto_mensual || inscripcionForm.value.monto_mensual <= 0) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Ingrese un monto mensual válido',
      life: 3000
    });
    return;
  }

  // Validar campos de pago
  if (!pagoForm.value.monto || pagoForm.value.monto <= 0) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Ingrese un monto de pago válido',
      life: 3000
    });
    return;
  }

  if (!pagoForm.value.metodo_pago) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Seleccione un método de pago',
      life: 3000
    });
    return;
  }

  guardando.value = true;

  try {
    // ========== PASO 1: CREAR LA INSCRIPCIÓN ==========
    console.log('=== CREANDO INSCRIPCIÓN ===');

    // Función para formatear fecha a YYYY-MM-DD
    const formatDateToYMD = (date) => {
      if (!date) return null;
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    // Preparar datos para inscripción principal
    const datosInscripcion = {
      estudiante_id: estudianteSeleccionado.value.id,
      modalidad_id: inscripcionForm.value.modalidad_id,
      sucursal_id: inscripcionForm.value.sucursal_id,
      entrenador_id: inscripcionForm.value.entrenador_id,
      fecha_inicio: formatDateToYMD(inscripcionForm.value.fecha_inicio),
      fecha_fin: formatDateToYMD(inscripcionForm.value.fecha_fin),
      clases_totales: inscripcionForm.value.clases_totales || 
                     modalidadSeleccionada.value?.clases_mensuales || 12,
      monto_mensual: parseFloat(inscripcionForm.value.monto_mensual),
      estado: 'activa',
       horarios: horariosSeleccionados.value // <-- AGREGAR ESTA LÍNEA
    };

    console.log('Datos de inscripción a enviar:', datosInscripcion);

    // Guardar la inscripción
    const responseInscripcion = await inscripcionService.store(datosInscripcion);

    console.log('Respuesta del servidor (inscripción):', responseInscripcion);

    if (!responseInscripcion.data) {
      throw new Error('Respuesta inválida del servidor');
    }

    // Manejar diferentes estructuras de respuesta
    let inscripcionId;
    if (responseInscripcion.data.success) {
      inscripcionId = responseInscripcion.data.data?.id || 
                     responseInscripcion.data.id;
    } else if (responseInscripcion.data.id) {
      inscripcionId = responseInscripcion.data.id;
    }

    if (!inscripcionId) {
      console.error('No se pudo obtener el ID de la inscripción:', responseInscripcion);
      throw new Error('No se obtuvo el ID de la inscripción creada');
    }

    console.log('Inscripción creada con ID:', inscripcionId);

    // ========== PASO 2: CREAR EL PAGO ==========
    console.log('=== CREANDO PAGO ===');

    // Formatear fecha de pago
    const fechaPagoFormateada = formatDateToYMD(pagoForm.value.fecha_pago);

    // Preparar datos para el pago
    const datosPago = {
      inscripcion_id: inscripcionId,
      monto: parseFloat(pagoForm.value.monto),
      metodo_pago: pagoForm.value.metodo_pago,
      fecha_pago: fechaPagoFormateada,
      estado: 'pagado',
      observacion: pagoForm.value.observacion?.trim() || ''
    };

    console.log('Datos de pago a enviar:', datosPago);

    // Validar el pago
    const validacionPago = {
      valido: true,
      errores: []
    };

    if (!datosPago.inscripcion_id) {
      validacionPago.valido = false;
      validacionPago.errores.push('ID de inscripción requerido');
    }

    if (!datosPago.monto || datosPago.monto <= 0) {
      validacionPago.valido = false;
      validacionPago.errores.push('Monto debe ser mayor a 0');
    }

    if (!datosPago.metodo_pago) {
      validacionPago.valido = false;
      validacionPago.errores.push('Método de pago requerido');
    }

    if (!datosPago.fecha_pago) {
      validacionPago.valido = false;
      validacionPago.errores.push('Fecha de pago requerida');
    }

    if (!validacionPago.valido) {
      toast.add({
        severity: 'error',
        summary: 'Error en datos del pago',
        detail: validacionPago.errores.join(', '),
        life: 4000
      });

      // Regresar al paso de pago para corregir
      pasoActual.value = 3;
      guardando.value = false;
      return;
    }

    try {
      // Guardar el pago
      console.log('Enviando pago al servidor...');
      const responsePago = await pagoService.store(datosPago);
      
      console.log('Respuesta del servidor (pago):', responsePago);

      if (responsePago.data) {
        if (responsePago.data.success) {
          toast.add({
            severity: 'success',
            summary: 'Pago Registrado',
            detail: `Pago de $${datosPago.monto} registrado correctamente`,
            life: 3000
          });
        } else {
          // Mostrar mensaje de error específico del servidor
          const errorMsg = responsePago.data.message || 
                         responsePago.data.error || 
                         'Error al registrar el pago';
          throw new Error(errorMsg);
        }
      } else {
        throw new Error('Respuesta inválida del servidor');
      }

    } catch (pagoError) {
      console.error('Error guardando pago:', pagoError);

      let mensajePago = 'Error al registrar el pago';

      if (pagoError.response) {
        console.error('Error response data:', pagoError.response.data);
        
        if (pagoError.response.data?.errors) {
          const errores = Object.values(pagoError.response.data.errors).flat();
          mensajePago = errores.join(', ');
        } else if (pagoError.response.data?.message) {
          mensajePago = pagoError.response.data.message;
        } else if (pagoError.response.data?.error) {
          mensajePago = pagoError.response.data.error;
        }
      } else if (pagoError.message) {
        mensajePago = pagoError.message;
      }

      throw new Error(`Error en pago: ${mensajePago}`);
    }

    // ========== PASO 3: CERRAR Y RECARGAR ==========
    cerrarDialogoCompleto();

    // Recargar datos
    setTimeout(() => {
      cargarDatos();
    }, 500);

    // Mostrar resumen final
    toast.add({
      severity: 'success',
      summary: 'Proceso Completado',
      detail: 'Inscripción y pago registrados exitosamente',
      life: 4000
    });

  } catch (error) {
    console.error('Error en el proceso completo:', error);

    let mensaje = 'Error al procesar la inscripción';
    let detalle = error.message || 'Ocurrió un error inesperado';

    // Mostrar error detallado
    toast.add({
      severity: 'error',
      summary: mensaje,
      detail: detalle,
      life: 6000
    });

    // Si el error es del pago, regresar al paso de pago
    if (error.message?.includes('pago') || detalle.includes('pago')) {
      pasoActual.value = 3;
    }
  } finally {
    guardando.value = false;
  }
}
// Función para cerrar completamente el diálogo
function cerrarDialogoCompleto() {
  dialogoInscripcion.value = false;
  pasoActual.value = 0;
  estudianteSeleccionado.value = null;
  buscarEstudiante.value = '';
  horariosSeleccionados.value = [];
  inscripcionForm.value = crearInscripcionVacia();

  // Resetear formulario de pago
  pagoForm.value = {
    monto: 0,
    metodo_pago: null,
    fecha_pago: new Date(),
    observacion: ''
  };
}

// Actualiza siguientePaso()
function siguientePaso() {

  if (pasoActual.value < 4) {
    pasoActual.value++;
  }
}

// Función para validar pago antes de pasar al siguiente paso
function validarPago() {
  if (!pagoForm.value.monto || pagoForm.value.monto <= 0) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Ingrese un monto válido',
      life: 3000
    });
    return;
  }

  if (!pagoForm.value.metodo_pago) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Seleccione un método de pago',
      life: 3000
    });
    return;
  }

  // Validar también con el servicio
  const datosPagoPrueba = {
    monto: pagoForm.value.monto,
    metodo_pago: pagoForm.value.metodo_pago,
    fecha_pago: pagoForm.value.fecha_pago,
    inscripcion_id: 1 // valor temporal solo para validación
  };

  const validacion = pagoService.validarPago(datosPagoPrueba);
  if (!validacion.valido) {
    toast.add({
      severity: 'error',
      summary: 'Error en pago',
      detail: validacion.errores.join(', '),
      life: 4000
    });
    return;
  }

  // Si todo está bien, pasar al siguiente paso
  pasoActual.value = 4; // Ir al paso de confirmación
}

// Función para obtener severidad del método de pago
function getSeveridadMetodoPago(metodo) {
  const severidades = {
    'efectivo': 'success',
    'qr': 'info',
    'tarjeta': 'warning',
    'transferencia': 'help'
  };
  return severidades[metodo] || 'info';
}
// Función para obtener la descripción completa del horario
function getHorarioDescripcionCompleta(horarioId) {
  const horario = horariosDisponibles.value.find(h => h.id === horarioId);
  if (!horario) return `Horario ${horarioId}`;

  return `${horario.nombre} - ${horario.dia_semana} ${horario.hora_inicio} a ${horario.hora_fin}`;
}



// Función para guardar inscripción y pago


// Nueva función para guardar el pago
async function guardarPago(inscripcionId) {
  try {
    const datosPago = {
      inscripcion_id: inscripcionId,
      monto: pagoForm.value.monto,
      metodo_pago: pagoForm.value.metodo_pago,
      fecha_pago: pagoForm.value.fecha_pago instanceof Date
        ? pagoForm.value.fecha_pago.toISOString().split('T')[0]
        : pagoForm.value.fecha_pago,
      estado: 'pagado',
      observacion: pagoForm.value.observacion || null
    };

    console.log('Datos del pago a enviar:', datosPago);

    // Asumiendo que tienes un servicio para pagos
    const response = await pagoService.store(datosPago);

    if (response.data && response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Pago Registrado',
        detail: `Pago de $${pagoForm.value.monto} registrado correctamente`,
        life: 3000
      });

      // Cerrar diálogo
      cerrarDialogo();

      // Recargar datos
      await cargarDatos();
    }

  } catch (error) {
    console.error('Error guardando pago:', error);

    let mensaje = 'Error al registrar el pago';
    if (error.response?.data?.message) {
      mensaje = error.response.data.message;
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensaje,
      life: 3000
    });
  }
}

// Variable para almacenar el ID de la inscripción creada
const inscripcionGuardadaId = ref(null);


// Asegúrate de cargar sucursales y entrenadores
async function cargarDatosParaDialogo() {
  try {
    console.log('Cargando datos para diálogo...');

    // Cargar sucursales
    const sucursalesRes = await sucursalService.index(1, 100, "");
    console.log('Respuesta sucursales:', sucursalesRes);

    if (sucursalesRes.data) {
      // Diferentes estructuras posibles
      if (Array.isArray(sucursalesRes.data)) {
        sucursales.value = sucursalesRes.data;
      } else if (sucursalesRes.data.data && Array.isArray(sucursalesRes.data.data)) {
        sucursales.value = sucursalesRes.data.data;
      } else {
        sucursales.value = [];
      }
    }

    // Cargar entrenadores
    const entrenadoresRes = await entrenadorService.index(1, 100, "");
    console.log('Respuesta entrenadores:', entrenadoresRes);

    if (entrenadoresRes.data) {
      if (Array.isArray(entrenadoresRes.data)) {
        entrenadores.value = entrenadoresRes.data;
      } else if (entrenadoresRes.data.data && Array.isArray(entrenadoresRes.data.data)) {
        entrenadores.value = entrenadoresRes.data.data;
      } else {
        entrenadores.value = [];
      }
    }

    // Cargar horarios - prueba diferentes métodos
    try {
      let horariosRes;

      // Intenta primero con la ruta específica
      try {
        horariosRes = await horarioService.disponibles();
        console.log('Horarios disponibles:', horariosRes);
      } catch (error) {
        console.log('Ruta /disponibles no funciona, usando index:', error);
        // Si falla, usa index
        horariosRes = await horarioService.index(1, 100, "");
      }

      if (horariosRes.data) {
        if (Array.isArray(horariosRes.data)) {
          horariosDisponibles.value = horariosRes.data.map(h => ({
            id: h.id,
            descripcion: `${h.dia_semana} ${h.hora_inicio} - ${h.hora_fin} (${h.disciplina?.nombre || ''})`
          }));
        } else if (horariosRes.data.data && Array.isArray(horariosRes.data.data)) {
          horariosDisponibles.value = horariosRes.data.data.map(h => ({
            id: h.id,
            descripcion: `${h.dia_semana} ${h.hora_inicio} - ${h.hora_fin} (${h.disciplina?.nombre || ''})`
          }));
        }
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
      horariosDisponibles.value = [];
    }

    console.log('Datos cargados:', {
      sucursales: sucursales.value.length,
      entrenadores: entrenadores.value.length,
      horarios: horariosDisponibles.value.length
    });

  } catch (error) {
    console.error('Error cargando datos adicionales:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar datos adicionales',
      life: 3000
    });
  }
}

// Llama a esta función cuando abras el diálogo
function abrirDialogoNueva() {
  tituloDialogo.value = 'Nueva Inscripción';
  pasoActual.value = 0;
  estudianteSeleccionado.value = null;
  buscarEstudiante.value = '';
  horariosSeleccionados.value = [];
  inscripcionForm.value = crearInscripcionVacia();
  dialogoInscripcion.value = true;

  // Cargar datos necesarios para el diálogo
  cargarEstudiantesParaDialogo();
  cargarModalidadesParaDialogo();
  cargarDatosParaDialogo(); // <-- Nueva función
}

// FUNCIONES PRINCIPALES

// 1. Cargar datos principales
// En tu componente Vue, en la función cargarDatos()
async function cargarDatos() {
  cargando.value = true;
  try {
    console.log('Cargando inscripciones...');
    const response = await inscripcionService.index(1, 100, "");

    console.log('Respuesta completa del backend:', response);
    console.log('response.data:', response.data);
    console.log('response.data?.data:', response.data?.data);

    let datosInscripciones = [];

    if (response.data && response.data.success) {
      // CASO 1: Con paginación Laravel (la estructura ACTUAL)
      if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        datosInscripciones = response.data.data.data;
        console.log('Estructura: Laravel pagination (data.data.data)');
      }
      // CASO 2: Sin paginación (get())
      else if (response.data.data && Array.isArray(response.data.data)) {
        datosInscripciones = response.data.data;
        console.log('Estructura: Sin paginación (data.data)');
      }
      // CASO 3: Array directo
      else if (Array.isArray(response.data.data)) {
        datosInscripciones = response.data.data;
        console.log('Estructura: Array directo en data.data');
      }
    } else if (Array.isArray(response.data)) {
      // CASO 4: Si response.data es array directamente
      datosInscripciones = response.data;
      console.log('Estructura: response.data es array');
    }

    console.log(`Datos extraídos: ${datosInscripciones.length} inscripciones`);

    if (datosInscripciones.length > 0) {
      console.log('Primera inscripción procesada:', datosInscripciones[0]);
      console.log('Tiene estudiante?:', !!datosInscripciones[0].estudiante);
      console.log('Tiene modalidad?:', !!datosInscripciones[0].modalidad);
    }

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

// 2. Función para abrir diálogo de nueva inscripción


// 3. Crear inscripción vacía


// 4. Cargar estudiantes para diálogo
async function cargarEstudiantesParaDialogo() {
  cargandoEstudiantes.value = true;
  try {
    console.log('=== CARGANDO ESTUDIANTES ===');
    const response = await estudianteService.obtenerTodos();

    // DEPURACIÓN DETALLADA
    console.log('Respuesta completa:', response);
    console.log('response.data:', response.data);
    console.log('¿Es array?:', Array.isArray(response.data));

    if (response.data && Array.isArray(response.data)) {
      estudiantes.value = response.data;
      console.log('Cargados', estudiantes.value.length, 'estudiantes');

      if (estudiantes.value.length > 0) {
        console.log('Primer estudiante:', {
          id: estudiantes.value[0].id,
          nombre: estudiantes.value[0].nombres,
          ci: estudiantes.value[0].ci,
          telefono: estudiantes.value[0].telefono,
          correo: estudiantes.value[0].correo
        });
      }
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

// 5. Cargar modalidades para diálogo
async function cargarModalidadesParaDialogo() {
  try {
    const response = await modalidadService.obtenerTodas();
    modalidades.value = response.data || response || [];
  } catch (error) {
    console.error('Error cargando modalidades:', error);
  }
}

// 6. Procesar datos de inscripciones
function procesarInscripciones(data) {
  if (!Array.isArray(data)) {
    console.error('Datos de inscripciones no es un array:', data);
    return [];
  }

  return data.map(insc => {
    // Calcular días restantes
    const diasRestantes = calcularDiasRestantes(insc.fecha_fin);

    // Asegurar que monto_mensual sea número
    let montoMensual = insc.monto_mensual;
    if (typeof montoMensual === 'string') {
      montoMensual = parseFloat(montoMensual);
    }
    if (isNaN(montoMensual)) {
      montoMensual = 0;
    }

    return {
      ...insc,
      dias_restantes: diasRestantes,
      monto_mensual: montoMensual, // Asegurar que sea número
      // Agregar campo calculado para mostrar en la tabla
      clases_restantes_calculadas: insc.clases_restantes_calculadas || 
                                  insc.clases_restantes || 
                                  0
    };
  });
}

// 7. Calcular progreso de clases
// 7. Calcular progreso de clases CORREGIDO
function calcularProgresoClases(inscripcion) {
  // Opción 1: Si viene con datos de inscripcionHorarios
  if (inscripcion.inscripcion_horarios && inscripcion.inscripcion_horarios.length > 0) {
    const totalRestantes = inscripcion.inscripcion_horarios.reduce((sum, ih) => {
      return sum + (ih.clases_restantes || 0);
    }, 0);
    
    const totalClases = inscripcion.inscripcion_horarios.reduce((sum, ih) => {
      return sum + (ih.clases_totales || 0);
    }, 0);
    
    if (totalClases === 0) return 0;
    
    const asistidas = totalClases - totalRestantes;
    return (asistidas / totalClases) * 100;
  }
  
  // Opción 2: Si viene con datos directos
  const total = inscripcion.clases_totales || 1;
  // Suponiendo que el backend envía clases_restantes_calculadas
  const restantes = inscripcion.clases_restantes_calculadas || 0;
  const asistidas = total - restantes;
  
  return (asistidas / total) * 100;
}

// 8. Calcular si se puede renovar
function puedeRenovar(inscripcion) {
  if (inscripcion.estado !== 'activo') return false;

  const diasRestantes = calcularDiasRestantes(inscripcion.fecha_fin);
  return diasRestantes <= 7; // Se puede renovar si quedan 7 días o menos
}

// 9. Calcular días restantes
function calcularDiasRestantes(fechaFin) {
  if (!fechaFin) return 0;

  const hoy = new Date();
  const fin = new Date(fechaFin);
  const diffTime = fin - hoy;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 10. Obtener severidad del estado
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

// 11. Formatear fecha


// 12. Obtener color de vencimiento
function getColorVencimiento(fechaFin) {
  const dias = calcularDiasRestantes(fechaFin);
  if (dias <= 0) return 'text-red-500 font-bold';
  if (dias <= 3) return 'text-orange-500 font-bold';
  if (dias <= 7) return 'text-yellow-500';
  return '';
}

// 13. Obtener días restantes como texto
function getDiasRestantes(fechaFin) {
  const dias = calcularDiasRestantes(fechaFin);
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return '1 día';
  if (dias > 0) return `${dias} días`;
  return `Hace ${Math.abs(dias)} días`;
}

// 14. Renovar inscripción
async function renovarInscripcion(inscripcion) {
  try {
    const datosRenovacion = {
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: calcularNuevaFechaFin(),
      motivo: 'Renovación mensual'
    };

    // USAR renovar() en lugar del método anterior
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

// 15. Calcular nueva fecha fin
function calcularNuevaFechaFin() {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() + 1);
  return fecha.toISOString().split('T')[0];
}

// Funciones auxiliares para horarios
function getHorarioChipLabel(horarioId) {
  const horario = horariosDisponibles.value.find(h => h.id == horarioId);
  if (!horario) return `H-${horarioId}`;

  // Formato corto: "Lun 18:00"
  const diaCorto = horario.dia_semana?.substring(0, 3) || horario.dia_semana || 'Sin';
  const hora = horario.hora_inicio?.substring(0, 5) || '';
  return `${diaCorto} ${hora}`;
}

function getHorarioColor(horarioId) {
  const horario = horariosDisponibles.value.find(h => h.id == horarioId);
  return horario?.color || '#3B82F6';
}



// 16. Ver detalles
function verDetalles(inscripcion) {
  toast.add({
    severity: 'info',
    summary: 'Detalles',
    detail: `Mostrando detalles de inscripción #${inscripcion.id}`,
    life: 3000
  });
  // Aquí puedes implementar un diálogo de detalles
}

// 17. Exportar a Excel
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

// 18. Manejo de errores
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

// 19. Calcular estadísticas
function calcularEstadisticas() {
  console.log('=== CALCULANDO ESTADÍSTICAS ===');
  console.log('Total inscripciones:', inscripciones.value.length);
  
  // Mostrar datos para depuración
  if (inscripciones.value.length > 0) {
    console.log('Primera inscripción:', {
      id: inscripciones.value[0].id,
      estado: inscripciones.value[0].estado,
      monto_mensual: inscripciones.value[0].monto_mensual,
      tipo_monto: typeof inscripciones.value[0].monto_mensual
    });
  }

  const totalActivas = inscripciones.value.filter(i => 
    i.estado === 'activa' || i.estado === 'activo'
  ).length;
  
  const porVencer = inscripciones.value.filter(i => {
    const estadoActivo = i.estado === 'activa' || i.estado === 'activo';
    const diasRestantes = i.dias_restantes || 0;
    return estadoActivo && diasRestantes <= 7 && diasRestantes > 0;
  }).length;

  // Clases hoy (ejemplo simple)
  const hoy = new Date().toISOString().split('T')[0];
  const clasesHoy = inscripciones.value.filter(i => {
    // Lógica básica: inscripciones activas hoy
    const estadoActivo = i.estado === 'activa' || i.estado === 'activo';
    return estadoActivo;
  }).length;
  
  // Calcular ingresos con validación robusta
  const ingresosMes = inscripciones.value.reduce((sum, inscripcion) => {
    try {
      let monto = inscripcion.monto_mensual;
      
      // Si es null/undefined
      if (monto === null || monto === undefined) {
        return sum;
      }
      
      // Si es string, convertir a número
      if (typeof monto === 'string') {
        monto = parseFloat(monto.replace(/[^0-9.-]+/g, ''));
      }
      
      // Si no es número válido
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
// 20. Aplicar filtros avanzados
function aplicarFiltrosAvanzados() {
  cargarDatos();
}

// 21. Limpiar filtros
function limpiarFiltros() {
  buscar.value = '';
  filtroEstado.value = null;
  filtroModalidad.value = null;
  cargarDatos();
}

// 22. Cerrar diálogo
function cerrarDialogo() {
  dialogoInscripcion.value = false;
  pasoActual.value = 0;
  estudianteSeleccionado.value = null;
  buscarEstudiante.value = '';
  inscripcionForm.value = crearInscripcionVacia();

  // Resetear formulario de pago
  pagoForm.value = {
    monto: 0,
    metodo_pago: null,
    fecha_pago: new Date(),
    observacion: ''
  };

  inscripcionGuardadaId.value = null;
}

// 23. Siguiente paso en el diálogo


// 24. Seleccionar modalidad
async function seleccionarModalidad(modalidad) {
  inscripcionForm.value.modalidad_id = modalidad.id;
  inscripcionForm.value.clases_totales = modalidad.clases_mensuales || 12;

  // ¡REMOVER ESTA LÍNEA! `clases_restantes` no existe en `inscripciones`
  // inscripcionForm.value.clases_restantes = modalidad.clases_mensuales || 12;

  // Establecer monto mensual por defecto
  if (!inscripcionForm.value.monto_mensual || inscripcionForm.value.monto_mensual === 0) {
    inscripcionForm.value.monto_mensual = modalidad.precio_mensual || 0;
  }

  // Cargar horarios de esta modalidad
  await cargarHorariosPorModalidad(modalidad.id);
}

// Para obtener horarios por modalidad
async function cargarHorariosPorModalidad(modalidadId) {
  try {
    console.log('Cargando horarios para modalidad ID:', modalidadId);

    // Verificar que tengamos una modalidad seleccionada
    if (!modalidadId) {
      console.warn('No hay modalidad seleccionada');
      horariosDisponibles.value = [];
      return;
    }

    // Limpiar selección anterior
    horariosSeleccionados.value = [];

    // Construir parámetros de búsqueda
    const params = {
      estado: 'activo',
      con_cupo: 'true' // Solo horarios con cupo disponible
    };

    // Si ya se seleccionó una sucursal, agregar filtro
    if (inscripcionForm.value.sucursal_id) {
      params.sucursal_id = inscripcionForm.value.sucursal_id;
      console.log('Filtrando también por sucursal:', inscripcionForm.value.sucursal_id);
    }

    // Opción 1: Usando la ruta específica /horarios/modalidad/{id}
    let horariosRes;
    try {
      horariosRes = await Api().get(`/horarios/modalidad/${modalidadId}`, { params });
      console.log('Respuesta ruta específica:', horariosRes);
    } catch (error) {
      console.log('Ruta específica falló, intentando con index:', error);
      // Opción 2: Usando el index con filtros
      params.modalidad_id = modalidadId;
      horariosRes = await horarioService.index(1, 100, '', params);
    }

    // Procesar la respuesta
    console.log('Respuesta horarios:', horariosRes);

    let horariosData = [];

    if (horariosRes.data) {
      // Diferentes estructuras posibles
      if (Array.isArray(horariosRes.data)) {
        horariosData = horariosRes.data;
        console.log('Estructura: Array directo');
      } else if (horariosRes.data.data && Array.isArray(horariosRes.data.data)) {
        horariosData = horariosRes.data.data;
        console.log('Estructura: data.data (Laravel pagination)');
      } else if (horariosRes.data.success && Array.isArray(horariosRes.data.data)) {
        horariosData = horariosRes.data.data;
        console.log('Estructura: {success: true, data: []}');
      } else {
        console.warn('Estructura no reconocida:', horariosRes.data);
      }
    }

    // Formatear los datos para el dropdown
    horariosDisponibles.value = horariosData.map(h => {
      // Obtener nombres de relaciones si existen
      const disciplinaNombre = h.disciplina?.nombre || 'Sin disciplina';
      const entrenadorNombre = h.entrenador?.nombres || 'Sin entrenador';
      const sucursalNombre = h.sucursal?.nombre || 'Sin sucursal';

      return {
        id: h.id,
        nombre: h.nombre || `Horario ${h.id}`,
        dia_semana: h.dia_semana,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        descripcion: `${h.nombre} - ${h.dia_semana} ${h.hora_inicio} a ${h.hora_fin}`,
        descripcion_completa: `${h.nombre} | ${h.dia_semana} ${h.hora_inicio}-${h.hora_fin} | ${disciplinaNombre} | ${entrenadorNombre} | ${sucursalNombre}`,
        disciplina_id: h.disciplina_id,
        sucursal_id: h.sucursal_id,
        entrenador_id: h.entrenador_id,
        modalidad_id: h.modalidad_id,
        cupo_maximo: h.cupo_maximo,
        cupo_actual: h.cupo_actual,
        cupo_disponible: (h.cupo_maximo - h.cupo_actual) || 0,
        color: h.color || '#3B82F6'
      };
    });

    console.log('Horarios disponibles formateados:', horariosDisponibles.value.length);

    if (horariosDisponibles.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Sin horarios',
        detail: 'No hay horarios disponibles para esta modalidad' +
          (inscripcionForm.value.sucursal_id ? ' en la sucursal seleccionada' : ''),
        life: 3000
      });
    } else {
      toast.add({
        severity: 'success',
        summary: 'Horarios cargados',
        detail: `${horariosDisponibles.value.length} horario(s) disponible(s)`,
        life: 2000
      });
    }

  } catch (error) {
    console.error('Error cargando horarios por modalidad:', error);

    let mensajeError = 'Error al cargar los horarios';
    if (error.response?.status === 404) {
      mensajeError = 'La ruta para horarios por modalidad no existe';
    } else if (error.response?.data?.message) {
      mensajeError = error.response.data.message;
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensajeError,
      life: 3000
    });

    horariosDisponibles.value = [];
  }
}

// 25. Filtrar estudiantes
function filtrarEstudiantes() {
  // La búsqueda se maneja automáticamente con la computed property
}


// 27. Guardar inscripción


// 28. Obtener iniciales
function getIniciales(estudiante) {
  if (!estudiante || !estudiante.nombres) return '?';
  const nombres = estudiante.nombres.split(' ');
  if (nombres.length >= 2) {
    return (nombres[0][0] + nombres[1][0]).toUpperCase();
  }
  return nombres[0][0].toUpperCase();
}

// Ciclo de vida
onMounted(() => {
  cargarDatos();
});
</script>

<style scoped>
.inscripciones-container {
  padding: 1rem;
}

.dashboard-cards {
  .stat-card {
    height: 100%;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .stat-icon {
        font-size: 2rem;
        opacity: 0.8;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: bold;
      }
    }
  }
}

.modalidad-card {
  cursor: pointer;
  transition: all 0.2s;
  height: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border: 2px solid var(--primary-color);
    background-color: rgba(var(--primary-color-rgb), 0.05);
  }

  .modalidad-details {
    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
  }
}

.info-box {
  text-align: center;

  h6 {
    margin: 0.5rem 0;
  }
}

.text-red-500 {
  color: #f87171 !important;
}

.text-orange-500 {
  color: #fb923c !important;
}

.text-yellow-500 {
  color: #fbbf24 !important;
}

.text-green-500 {
  color: #10b981 !important;
}
</style>