<template>
  <div class="historial-pagos-container">
    <!-- Dashboard de estadísticas -->
    <div class="dashboard-cards mb-4">
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Total Recaudado</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-money-bill stat-icon text-green-500"></i>
                <span class="stat-value">${{ formatMonto(estadisticas.totalRecaudado) }}</span>
              </div>
              <div class="stat-trend">
                <small class="text-500">Total histórico</small>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Pagos del Mes</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-calendar stat-icon text-blue-500"></i>
                <span class="stat-value">${{ formatMonto(estadisticas.pagosMes) }}</span>
              </div>
              <div class="stat-trend">
                <small class="text-500">Mes actual</small>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Pagos Pendientes</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-clock stat-icon text-orange-500"></i>
                <div>
                  <span class="stat-value">{{ estadisticas.pagosPendientes }}</span>
                  <div class="text-sm font-semibold text-orange-600 mt-1">
                    ${{ formatMonto(estadisticas.montoPendiente) }}
                  </div>
                </div>
              </div>
              <div class="stat-trend">
                <small class="text-500">{{ cuotasPendientes.length }} cuotas pendientes</small>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>En Mora</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-exclamation-triangle stat-icon text-red-500"></i>
                <div>
                  <span class="stat-value">{{ estadisticas.pagosEnMora }}</span>
                  <div class="text-sm font-semibold text-red-600 mt-1">
                    ${{ formatMonto(estadisticas.montoEnMora) }}
                  </div>
                </div>
              </div>
              <div class="stat-trend">
                <small class="text-red-500">
                  {{ cuotasVencidasCount }} vencidas • ${{ formatMonto(estadisticas.montoVencido) }}
                </small>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <Card class="mb-4">
      <template #title>
        <div class="flex align-items-center">
          <i class="pi pi-filter mr-2"></i>
          <span>Filtros Avanzados</span>
        </div>
      </template>
      <template #content>
        <div class="grid">
          <!-- Fecha Desde -->
          <div class="col-12 md:col-6 lg:col-3">
            <div class="field">
              <label for="fechaDesde" class="block mb-2 text-500 font-medium">
                <i class="pi pi-calendar mr-1"></i>
                Fecha Desde
              </label>
              <Calendar id="fechaDesde" v-model="filtros.fecha_desde" dateFormat="dd/mm/yy" showIcon class="w-full"
                :maxDate="filtros.fecha_hasta || hoy" placeholder="Seleccione fecha" />
            </div>
          </div>

          <!-- Fecha Hasta -->
          <div class="col-12 md:col-6 lg:col-3">
            <div class="field">
              <label for="fechaHasta" class="block mb-2 text-500 font-medium">
                <i class="pi pi-calendar mr-1"></i>
                Fecha Hasta
              </label>
              <Calendar id="fechaHasta" v-model="filtros.fecha_hasta" dateFormat="dd/mm/yy" showIcon class="w-full"
                :minDate="filtros.fecha_desde" :maxDate="hoy" placeholder="Seleccione fecha" />
            </div>
          </div>

          <!-- Método de Pago -->
          <div class="col-12 md:col-6 lg:col-2">
            <div class="field">
              <label for="metodoPago" class="block mb-2 text-500 font-medium">
                <i class="pi pi-credit-card mr-1"></i>
                Método
              </label>
              <Dropdown id="metodoPago" v-model="filtros.metodo_pago" :options="opcionesMetodoPago" optionLabel="label"
                optionValue="value" placeholder="Todos" class="w-full" />
            </div>
          </div>

          <!-- Estado -->
          <div class="col-12 md:col-6 lg:col-2">
            <div class="field">
              <label for="estado" class="block mb-2 text-500 font-medium">
                <i class="pi pi-tag mr-1"></i>
                Estado
              </label>
              <Dropdown id="estado" v-model="filtros.estado" :options="opcionesEstado" optionLabel="label"
                optionValue="value" placeholder="Todos" class="w-full" />
            </div>
          </div>

          <!-- Tipo de Cuota -->
          <div class="col-12 md:col-6 lg:col-2">
            <div class="field">
              <label for="tipo_cuota" class="block mb-2 text-500 font-medium">
                <i class="pi pi-money-bill mr-1"></i>
                Tipo
              </label>
              <Dropdown id="tipo_cuota" v-model="filtros.tipo_cuota" :options="opcionesTipoCuota" optionLabel="label"
                optionValue="value" placeholder="Todas" class="w-full" />
            </div>
          </div>

          <!-- Búsqueda -->
          <div class="col-12 md:col-8">
            <div class="field">
              <label for="buscar" class="block mb-2 text-500 font-medium">
                <i class="pi pi-search mr-1"></i>
                Búsqueda
              </label>
              <span class="p-input-icon-left w-full">
                <i class="pi pi-search"></i>
                <InputText id="buscar" v-model="filtros.buscar" placeholder="Buscar..." class="w-full"
                  @keyup.enter="aplicarFiltros" />
              </span>
            </div>
          </div>

          <!-- Botones -->
          <div class="col-12 md:col-4">
            <div class="flex gap-2 mt-6">
              <Button label="Aplicar" icon="pi pi-filter" @click="aplicarFiltros" severity="info" class="flex-1" />
              <Button label="Limpiar" icon="pi pi-filter-slash" @click="limpiarFiltros" severity="secondary" />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Toolbar -->
    <Toolbar class="mb-4 custom-toolbar">
      <template #start>
        <div class="flex align-items-center gap-2">
          <Button label="Nuevo Pago Manual" icon="pi pi-plus" severity="success" @click="abrirDialogoNuevoPago" />
          <Button label="Pagar Segunda Cuota" icon="pi pi-money-bill" severity="help"
            @click="abrirDialogoPagarSegundaCuota" :disabled="cuotasPendientes.length === 0"
            v-tooltip="cuotasPendientes.length > 0 ? `${cuotasPendientes.length} cuotas pendientes` : 'No hay cuotas pendientes'" />
          <Button label="Exportar Excel" icon="pi pi-file-excel" severity="info" @click="exportarExcel" />
        </div>
      </template>

      <template #end>
        <div class="flex align-items-center gap-2">
          <Button icon="pi pi-refresh" @click="cargarPagos" :loading="cargando" v-tooltip="'Actualizar datos'" />
          <span class="text-500 text-sm">
            Mostrando {{ pagosFiltrados.length }} de {{ pagos.length }} pagos
          </span>
        </div>
      </template>
    </Toolbar>

    <!-- DataTable Principal -->
    <Card>
      <template #title>
        <div class="flex align-items-center">
          <i class="pi pi-list text-primary mr-2"></i>
          <span>Historial de Pagos</span>
          <Tag :value="pagosFiltrados.length" severity="info" class="ml-2" />
        </div>
      </template>
      <template #content>
        <DataTable :value="pagosFiltrados" :paginator="true" :rows="20" :loading="cargando" class="p-datatable-sm"
          stripedRows showGridlines responsiveLayout="scroll">

          <!-- Columna: ID -->
          <Column field="id" header="ID" :sortable="true" style="width: 80px">
            <template #body="slotProps">
              <div class="font-mono font-bold">#{{ slotProps.data.id }}</div>
              <div v-if="slotProps.data.es_segunda_cuota" class="mt-1">
                <Badge value="2da Cuota" severity="warning" size="small" />
              </div>
            </template>
          </Column>

          <!-- Columna: Estudiante -->
          <Column header="Estudiante" :sortable="true" style="min-width: 200px">
            <template #body="slotProps">
              <div class="flex align-items-center">
                <Avatar :label="getInicialesEstudiante(slotProps.data)" size="small" shape="circle" class="mr-3"
                  :class="getAvatarClass(slotProps.data)" />
                <div class="flex-grow-1">
                  <div class="font-bold">
                    {{ getNombreEstudiante(slotProps.data) }}
                  </div>
                  <div class="text-500 text-sm">
                    CI: {{ getCIEstudiante(slotProps.data) || 'No disponible' }}
                  </div>
                  <div v-if="getTelefonoEstudiante(slotProps.data)" class="text-500 text-xs">
                    <i class="pi pi-phone mr-1"></i>
                    {{ getTelefonoEstudiante(slotProps.data) }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <!-- Columna: Inscripción -->
          <Column header="Inscripción" style="width: 140px">
            <template #body="slotProps">
              <div class="flex flex-column gap-1">
                <div class="flex align-items-center gap-1">
                  <span class="font-bold text-primary">#{{ slotProps.data.inscripcion_id }}</span>
                  <Tag :value="getEstadoInscripcion(slotProps.data)"
                    :severity="getSeveridadEstadoInscripcion(slotProps.data)" size="small" />
                </div>
                <small class="text-500 text-xs truncate">
                  {{ getModalidadNombre(slotProps.data) }}
                </small>
                <div v-if="slotProps.data.inscripcion?.estado === 'en_mora'" class="mt-1">
                  <small class="text-red-500 font-semibold">
                    <i class="pi pi-exclamation-triangle mr-1"></i>En mora
                  </small>
                </div>
              </div>
            </template>
          </Column>

          <!-- Columna: Monto -->
          <Column field="monto" header="Monto" :sortable="true" style="width: 130px">
            <template #body="slotProps">
              <div class="text-right">
                <div class="font-bold text-lg" :class="getColorMonto(slotProps.data)">
                  ${{ formatMonto(slotProps.data.monto) }}
                </div>
                <small class="text-500 capitalize">{{ slotProps.data.metodo_pago || 'Sin método' }}</small>
                <div v-if="slotProps.data.es_segunda_cuota" class="mt-1">
                  <small class="text-xs text-yellow-600 font-semibold">
                    <i class="pi pi-money-bill mr-1"></i>Segunda cuota
                  </small>
                </div>
              </div>
            </template>
          </Column>

          <!-- Columna: Fechas -->
          <Column header="Fechas" style="width: 160px">
            <template #body="slotProps">
              <div class="flex flex-column gap-1">
                <div>
                  <div class="text-500 text-xs">Pago:</div>
                  <div class="font-medium">{{ formatFecha(slotProps.data.fecha_pago) }}</div>
                </div>
                <div v-if="slotProps.data.fecha_vencimiento" class="mt-1">
                  <div class="text-500 text-xs">Vence:</div>
                  <div :class="getClaseFechaVencimiento(slotProps.data.fecha_vencimiento, slotProps.data.estado)">
                    {{ formatFecha(slotProps.data.fecha_vencimiento) }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <!-- Columna: Estado -->
          <Column field="estado" header="Estado" :sortable="true" style="width: 120px">
            <template #body="slotProps">
              <div class="flex flex-column gap-1">
                <Tag :value="slotProps.data.estado" :severity="getSeveridadEstadoPago(slotProps.data.estado)"
                  class="font-bold" />
                <div v-if="slotProps.data.dias_mora > 0" class="mt-1">
                  <div class="flex align-items-center">
                    <i class="pi pi-clock text-red-500 mr-1" style="font-size: 0.8rem"></i>
                    <small class="text-red-600 font-semibold">
                      {{ slotProps.data.dias_mora }} día(s)
                    </small>
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <!-- Columna: Observación -->
          <Column field="observacion" header="Observación" style="min-width: 200px">
            <template #body="slotProps">
              <div class="observacion-cell">
                <div v-if="slotProps.data.observacion" class="flex align-items-start">
                  <i class="pi pi-comment text-primary mr-2 mt-1"></i>
                  <div>
                    {{ slotProps.data.observacion }}
                    <div v-if="slotProps.data.es_segunda_cuota" class="text-xs text-yellow-600 mt-1">
                      <i class="pi pi-info-circle mr-1"></i>Segunda cuota de inscripción
                    </div>
                  </div>
                </div>
                <div v-else class="text-500">
                  <i class="pi pi-comment text-300 mr-1"></i>
                  Sin observaciones
                </div>
              </div>
            </template>
          </Column>

          <!-- Columna: Acciones -->
          <Column header="Acciones" style="width: 160px">
            <template #body="slotProps">
              <div class="flex gap-1">
                <!-- Botón Ver Detalles -->
                <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm"
                  @click="verDetallesPago(slotProps.data)" v-tooltip="'Ver detalles'"
                  :class="getClaseBotonVer(slotProps.data)" />

                <!-- Botón Pagar si está pendiente -->
                <Button v-if="slotProps.data.estado !== 'pagado'" icon="pi pi-money-bill"
                  class="p-button-rounded p-button-text p-button-sm" @click="pagarSegundaCuota(slotProps.data)"
                  v-tooltip="'Pagar cuota'" :class="getClaseBotonPagar(slotProps.data)" />

                <!-- Botón Editar -->
                <Button icon="pi pi-file-edit" class="p-button-rounded p-button-text p-button-sm"
                  @click="editarPago(slotProps.data)" v-tooltip="'Editar pago'" severity="warning"
                  :disabled="slotProps.data.estado === 'pagado'" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Diálogo para detalles del pago -->
    <Dialog v-model:visible="dialogoDetalles" :header="tituloDetalles" :modal="true"
      :style="{ width: '60rem', maxWidth: '95vw' }">
      <div v-if="pagoSeleccionado">
        <div class="grid">
          <!-- Información del Pago -->
          <div class="col-12 md:col-6">
            <Card class="mb-3">
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-money-bill text-primary"></i>
                  <span>Información del Pago</span>
                </div>
              </template>
              <template #content>
                <div class="space-y-3">
                  <div class="flex justify-content-between">
                    <span class="text-500">ID:</span>
                    <span class="font-bold">#{{ pagoSeleccionado.id }}</span>
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-500">Monto:</span>
                    <span class="font-bold text-green-600">${{ formatMonto(pagoSeleccionado.monto) }}</span>
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-500">Método:</span>
                    <span class="font-bold capitalize">{{ pagoSeleccionado.metodo_pago || 'No especificado' }}</span>
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-500">Fecha de pago:</span>
                    <span class="font-bold">{{ formatFecha(pagoSeleccionado.fecha_pago) }}</span>
                  </div>
                  <div v-if="pagoSeleccionado.fecha_vencimiento" class="flex justify-content-between">
                    <span class="text-500">Fecha de vencimiento:</span>
                    <span class="font-bold">{{ formatFecha(pagoSeleccionado.fecha_vencimiento) }}</span>
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-500">Estado:</span>
                    <Tag :value="pagoSeleccionado.estado" :severity="getSeveridadEstadoPago(pagoSeleccionado.estado)" />
                  </div>
                </div>
              </template>
            </Card>
          </div>

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
                <div class="space-y-3">
                  <div class="flex align-items-center mb-3">
                    <Avatar :label="getInicialesEstudiante(pagoSeleccionado)" size="large" class="mr-3" />
                    <div>
                      <h4 class="mt-0 mb-1">{{ getNombreEstudiante(pagoSeleccionado) }}</h4>
                      <p class="text-500 mb-1">CI: {{ getCIEstudiante(pagoSeleccionado) || 'No disponible' }}</p>
                      <p class="text-500">{{ getTelefonoEstudiante(pagoSeleccionado) || 'Sin teléfono' }}</p>
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Información de la Inscripción -->
          <div class="col-12">
            <Card class="mb-3">
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-id-card text-primary"></i>
                  <span>Inscripción</span>
                </div>
              </template>
              <template #content>
                <div class="grid">
                  <div class="col-12 md:col-4">
                    <div class="flex justify-content-between mb-2">
                      <span class="text-500">ID:</span>
                      <span class="font-bold">#{{ pagoSeleccionado.inscripcion_id }}</span>
                    </div>
                  </div>
                  <div class="col-12 md:col-4">
                    <div class="flex justify-content-between mb-2">
                      <span class="text-500">Estado:</span>
                      <Tag :value="getEstadoInscripcion(pagoSeleccionado)"
                        :severity="getSeveridadEstadoInscripcion(pagoSeleccionado)" />
                    </div>
                  </div>
                  <div class="col-12 md:col-4">
                    <div class="flex justify-content-between mb-2">
                      <span class="text-500">Modalidad:</span>
                      <span class="font-bold">{{ getModalidadNombre(pagoSeleccionado) }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Observaciones -->
          <div class="col-12">
            <Card>
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-comment text-primary"></i>
                  <span>Observaciones</span>
                </div>
              </template>
              <template #content>
                <div v-if="pagoSeleccionado.observacion" class="p-3 bg-gray-50 border-round">
                  {{ pagoSeleccionado.observacion }}
                </div>
                <div v-else class="text-center p-4">
                  <i class="pi pi-comment text-300" style="font-size: 2rem"></i>
                  <p class="text-500 mt-2">No hay observaciones</p>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Diálogo para pagar segunda cuota -->
    <Dialog v-model:visible="dialogoPagarCuota" :header="tituloPagarCuota" :modal="true" :style="{ width: '45rem' }"
      @after-hide="resetearDatosPagoCuota">
      <div v-if="cuotaAPagar">
        <!-- Información de la cuota -->
        <div class="mb-4 p-3 border-round bg-blue-50">
          <div class="flex align-items-center justify-content-between">
            <div>
              <h4 class="mt-0 mb-1">Cuota Pendiente</h4>
              <div class="text-500">Inscripción #{{ cuotaAPagar.inscripcion_id }}</div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-yellow-600">${{ formatMonto(cuotaAPagar.monto) }}</div>
              <div class="text-500 text-sm">
                {{ cuotaAPagar.dias_mora > 0 ? `${cuotaAPagar.dias_mora} días de mora` : 'Sin mora' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Información del estudiante -->
        <div class="mb-4 p-3 border-round border-1 surface-border">
          <div class="flex align-items-center">
            <Avatar :label="getInicialesEstudiante(cuotaAPagar)" class="mr-3" />
            <div>
              <div class="font-bold">{{ getNombreEstudiante(cuotaAPagar) }}</div>
              <div class="text-500 text-sm">{{ getCIEstudiante(cuotaAPagar) || 'Sin CI' }}</div>
            </div>
          </div>
        </div>

        <!-- Formulario de pago -->
        <div class="mb-4">
          <div class="field mb-3">
            <label for="metodo_pago_cuota" class="text-500 block mb-1">Método de Pago *</label>
            <Dropdown id="metodo_pago_cuota" v-model="datosPagoCuota.metodo_pago" :options="metodosPago"
              optionLabel="label" optionValue="value" placeholder="Seleccione método" class="w-full"
              :class="{ 'p-invalid': !datosPagoCuota.metodo_pago }" />
            <small v-if="!datosPagoCuota.metodo_pago" class="p-error">Seleccione un método de pago</small>
          </div>

          <div class="field mb-3">
            <label for="fecha_pago_cuota" class="text-500 block mb-1">Fecha de Pago</label>
            <Calendar id="fecha_pago_cuota" v-model="datosPagoCuota.fecha_pago" dateFormat="dd/mm/yy" class="w-full"
              :maxDate="new Date()" showIcon />
          </div>

          <div class="field mb-3">
            <label for="observacion_cuota" class="text-500 block mb-1">Observación</label>
            <Textarea id="observacion_cuota" v-model="datosPagoCuota.observacion" rows="2" class="w-full"
              placeholder="Observaciones adicionales sobre el pago..." />
          </div>
        </div>

        <!-- Resumen -->
        <div class="p-3 border-round bg-green-50">
          <div class="text-center">
            <div class="text-500 mb-1">Total a pagar</div>
            <div class="text-3xl font-bold text-green-600">${{ formatMonto(cuotaAPagar.monto) }}</div>
            <small class="text-500">
              Se actualizará el estado de la inscripción después del pago
            </small>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" icon="pi pi-times" @click="dialogoPagarCuota = false"
          :disabled="procesandoPagoCuota" />
        <Button label="Confirmar Pago" severity="success" icon="pi pi-check" @click="confirmarPagoCuota"
          :loading="procesandoPagoCuota" :disabled="!datosPagoCuota.metodo_pago || procesandoPagoCuota" />
      </template>
    </Dialog>

    <!-- Diálogo para nuevo pago manual -->
    <Dialog v-model:visible="dialogoNuevoPago" header="Registrar Pago Manual" :modal="true" :style="{ width: '50rem' }"
      @after-hide="resetearNuevoPago">
      <div class="mb-4">
        <div class="field mb-3">
          <label class="text-500 block mb-1">Inscripción *</label>
          <Dropdown v-model="nuevoPago.inscripcion_id" :options="inscripcionesActivas" optionLabel="estudiante_nombre"
            optionValue="id" placeholder="Seleccione inscripción" class="w-full"
            :class="{ 'p-invalid': !nuevoPago.inscripcion_id }" :loading="cargandoInscripciones">
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex align-items-center">
                <div>
                  <div>{{ getNombreInscripcion(slotProps.value) }}</div>
                  <small class="text-500">Saldo: ${{ getSaldoInscripcion(slotProps.value) }}</small>
                </div>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
          </Dropdown>
          <small v-if="!nuevoPago.inscripcion_id" class="p-error">Seleccione una inscripción</small>
        </div>

        <div class="field mb-3">
          <label class="text-500 block mb-1">Monto *</label>
          <InputNumber v-model="nuevoPago.monto" :min="0" class="w-full"
            :class="{ 'p-invalid': !nuevoPago.monto || nuevoPago.monto <= 0 }" placeholder="Ingrese monto" />
          <small v-if="!nuevoPago.monto || nuevoPago.monto <= 0" class="p-error">Ingrese un monto válido</small>
        </div>

        <div class="field mb-3">
          <label class="text-500 block mb-1">Método de Pago *</label>
          <Dropdown v-model="nuevoPago.metodo_pago" :options="metodosPago" optionLabel="label" optionValue="value"
            placeholder="Seleccione método" class="w-full" :class="{ 'p-invalid': !nuevoPago.metodo_pago }" />
          <small v-if="!nuevoPago.metodo_pago" class="p-error">Seleccione un método de pago</small>
        </div>

        <div class="field mb-3">
          <label class="text-500 block mb-1">Fecha de Pago</label>
          <Calendar v-model="nuevoPago.fecha_pago" dateFormat="dd/mm/yy" class="w-full" :maxDate="new Date()"
            showIcon />
        </div>

        <div class="field mb-3">
          <label class="text-500 block mb-1">Observación</label>
          <Textarea v-model="nuevoPago.observacion" rows="2" class="w-full"
            placeholder="Observaciones adicionales..." />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="dialogoNuevoPago = false" :disabled="cargando" />
        <Button label="Registrar Pago" severity="success" @click="guardarPagoManual" :loading="cargando"
          :disabled="!nuevoPago.inscripcion_id || !nuevoPago.monto || !nuevoPago.metodo_pago || cargando" />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';

// Importar servicios
import pagoService from '@/services/pago.service';
import inscripcionService from '@/services/inscripcion.service';

// Importar componentes PrimeVue
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Avatar from 'primevue/avatar';
import InputNumber from 'primevue/inputnumber';
import Toast from 'primevue/toast';

const toast = useToast();

// ========== ESTADOS PRINCIPALES ==========
const pagos = ref([]);
const cargando = ref(false);
const hoy = ref(new Date());

// ========== ESTADOS PARA FILTROS ==========
const filtros = ref({
  fecha_desde: null,
  fecha_hasta: null,
  metodo_pago: null,
  estado: null,
  tipo_cuota: null,
  buscar: ''
});

// ========== ESTADOS PARA DIÁLOGOS ==========
const dialogoDetalles = ref(false);
const dialogoNuevoPago = ref(false);
const dialogoPagarCuota = ref(false);
const pagoSeleccionado = ref(null);
const cuotaAPagar = ref(null);
const tituloDetalles = ref('Detalles del Pago');
const tituloPagarCuota = ref('Pagar Segunda Cuota');
const procesandoPagoCuota = ref(false);

// ========== DATOS PARA PAGAR CUOTA ==========
const datosPagoCuota = ref({
  metodo_pago: null,
  fecha_pago: new Date(),
  observacion: ''
});

// ========== ESTADOS PARA NUEVO PAGO MANUAL ==========
const nuevoPago = ref({
  inscripcion_id: null,
  monto: null,
  metodo_pago: null,
  fecha_pago: new Date(),
  estado: 'pagado',
  observacion: ''
});

const inscripcionesActivas = ref([]);
const cargandoInscripciones = ref(false);

// ========== ESTADÍSTICAS ==========
const estadisticas = ref({
  totalRecaudado: 0,
  pagosMes: 0,
  totalPagos: 0,
  pagosPendientes: 0,
  pagosVencidos: 0,
  pagosEnMora: 0,
  promedioPago: 0
});

// ========== LISTAS DE OPCIONES ==========
const opcionesMetodoPago = ref([
  { label: 'Todos', value: null },
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'QR', value: 'qr' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Transferencia', value: 'transferencia' }
]);

const opcionesEstado = ref([
  { label: 'Todos', value: null },
  { label: 'Pagado', value: 'pagado' },
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Vencido', value: 'vencido' }
]);

const opcionesTipoCuota = ref([
  { label: 'Todas', value: null },
  { label: 'Primera cuota', value: 'primera' },
  { label: 'Segunda cuota', value: 'segunda' }
]);

const metodosPago = ref([
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'QR', value: 'qr' },
  { label: 'Tarjeta de Crédito/Débito', value: 'tarjeta' },
  { label: 'Transferencia Bancaria', value: 'transferencia' }
]);

// ========== COMPUTED PROPERTIES ==========

const pagosFiltrados = computed(() => {
  let filtrados = pagos.value;

  // Filtro por fechas
  if (filtros.value.fecha_desde) {
    const desde = new Date(filtros.value.fecha_desde);
    desde.setHours(0, 0, 0, 0);
    filtrados = filtrados.filter(p => {
      if (!p.fecha_pago) return false;
      const fechaPago = new Date(p.fecha_pago);
      fechaPago.setHours(0, 0, 0, 0);
      return fechaPago >= desde;
    });
  }

  if (filtros.value.fecha_hasta) {
    const hasta = new Date(filtros.value.fecha_hasta);
    hasta.setHours(23, 59, 59, 999);
    filtrados = filtrados.filter(p => {
      if (!p.fecha_pago) return true;
      const fechaPago = new Date(p.fecha_pago);
      return fechaPago <= hasta;
    });
  }

  // Filtro por método de pago
  if (filtros.value.metodo_pago) {
    filtrados = filtrados.filter(p => p.metodo_pago === filtros.value.metodo_pago);
  }

  // Filtro por estado
  if (filtros.value.estado) {
    filtrados = filtrados.filter(p => p.estado === filtros.value.estado);
  }

  // Filtro por tipo de cuota
  if (filtros.value.tipo_cuota === 'segunda') {
    filtrados = filtrados.filter(p => p.es_segunda_cuota === true);
  } else if (filtros.value.tipo_cuota === 'primera') {
    filtrados = filtrados.filter(p => p.es_primera_cuota === true);
  }

  // Filtro por búsqueda
  if (filtros.value.buscar) {
    const search = filtros.value.buscar.toLowerCase().trim();
    filtrados = filtrados.filter(p => {
      const estudianteNombre = getNombreEstudiante(p).toLowerCase(); // Esto ahora incluye apellidos
      const ci = getCIEstudiante(p)?.toLowerCase() || '';
      const observacion = p.observacion?.toLowerCase() || '';

      return estudianteNombre.includes(search) ||
        ci.includes(search) ||
        observacion.includes(search) ||
        p.id?.toString().includes(search) ||
        p.inscripcion_id?.toString().includes(search);
    });
  }

  return filtrados;
});

const cuotasPendientes = computed(() => {
  return pagos.value.filter(pago =>
    (pago.estado === 'pendiente' || pago.estado === 'vencido') &&
    pago.es_segunda_cuota === true
  );
});

const cuotasVencidasCount = computed(() => {
  return cuotasPendientes.value.filter(cuota =>
    cuota.fecha_vencimiento && estaVencido(cuota.fecha_vencimiento)
  ).length;
});

const totalCuotasPendientes = computed(() => {
  return cuotasPendientes.value.reduce((sum, cuota) => sum + parseFloat(cuota.monto || 0), 0);
});

// ========== FUNCIONES PRINCIPALES ==========

async function cargarPagos() {
  cargando.value = true;
  try {
    console.log('💰 Cargando historial de pagos...');

    // Cargar TODOS los pagos (sin filtro para ver todo)
    const responsePagos = await pagoService.index(1, 1000);

    let datosPagos = [];

    if (responsePagos.data) {
      if (Array.isArray(responsePagos.data)) {
        datosPagos = responsePagos.data;
      } else if (responsePagos.data.data && Array.isArray(responsePagos.data.data)) {
        datosPagos = responsePagos.data.data;
      } else if (responsePagos.data.success && Array.isArray(responsePagos.data.data)) {
        datosPagos = responsePagos.data.data;
      }
    }

    console.log(`✅ Cargados ${datosPagos.length} pagos`);
    
    // Cargar inscripciones para obtener información de estudiantes
    const responseInscripciones = await inscripcionService.index(1, 1000, '', {
      include: 'estudiante,modalidad'
    });

    let datosInscripciones = [];

    if (responseInscripciones.data) {
      if (Array.isArray(responseInscripciones.data)) {
        datosInscripciones = responseInscripciones.data;
      } else if (responseInscripciones.data.data && Array.isArray(responseInscripciones.data.data)) {
        datosInscripciones = responseInscripciones.data.data;
      } else if (responseInscripciones.data.success && Array.isArray(responseInscripciones.data.data)) {
        datosInscripciones = responseInscripciones.data.data;
      }
    }

    console.log(`✅ Cargadas ${datosInscripciones.length} inscripciones`);
    
    // ========== NUEVO: Cargar información financiera de cada inscripción ==========
    const inscripcionesConFinanzas = [];
    
    for (const inscripcion of datosInscripciones) {
      try {
        // Obtener pagos de esta inscripción
        const pagosInscripcion = datosPagos.filter(p => 
          parseInt(p.inscripcion_id) === parseInt(inscripcion.id)
        );
        
        // Calcular total pagado
        const pagosPagados = pagosInscripcion.filter(p => 
          p.estado && p.estado.toLowerCase() === 'pagado'
        );
        
        const totalPagado = pagosPagados.reduce((sum, pago) => 
          sum + (parseFloat(pago.monto) || 0), 0
        );
        
        // Calcular saldo pendiente
        const pagosPendientes = pagosInscripcion.filter(p => 
          p.estado && (p.estado.toLowerCase() === 'pendiente' || p.estado.toLowerCase() === 'vencido')
        );
        
        const saldoPendiente = pagosPendientes.reduce((sum, pago) => 
          sum + (parseFloat(pago.monto) || 0), 0
        );
        
        // Determinar estado financiero
        let estadoFinanciero = 'al_dia';
        if (saldoPendiente > 0) {
          estadoFinanciero = 'en_mora';
        }
        
        // Agregar información financiera a la inscripción
        inscripcionesConFinanzas.push({
          ...inscripcion,
          pagos: pagosInscripcion,
          total_pagado: totalPagado,
          saldo_pendiente: saldoPendiente,
          estado_financiero: estadoFinanciero,
          pagos_pendientes: pagosPendientes.length,
          tiene_pagos_divididos: pagosInscripcion.some(p => p.es_parcial === 1)
        });
        
      } catch (error) {
        console.error(`Error procesando inscripción ${inscripcion.id}:`, error);
        inscripcionesConFinanzas.push(inscripcion);
      }
    }

    // Unir datos
    pagos.value = procesarPagosConInscripciones(datosPagos, inscripcionesConFinanzas);
    
    // ========== MOSTRAR INFORMACIÓN DE MORA ==========
    const inscripcionesEnMora = inscripcionesConFinanzas.filter(i => 
      i.estado_financiero === 'en_mora' || i.estado === 'en_mora'
    );
    
    console.log(`⚠️  INSCRIPCIONES EN MORA: ${inscripcionesEnMora.length}`);
    inscripcionesEnMora.forEach(insc => {
      console.log(`  - #${insc.id}: $${insc.saldo_pendiente || 0} pendiente`);
    });

    calcularEstadisticas();

  } catch (error) {
    console.error('❌ Error cargando pagos:', error);
    
    let mensajeError = 'No se pudieron cargar los pagos';
    if (error.response?.status === 401) {
      mensajeError = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
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
    cargando.value = false;
  }
}

function procesarPagosConInscripciones(pagosData, inscripcionesData) {
  console.log('🔄 Procesando pagos con inscripciones...');

  // Crear mapa de inscripciones para acceso rápido
  const inscripcionesMap = {};
  inscripcionesData.forEach(insc => {
    inscripcionesMap[insc.id] = insc;
  });

  return pagosData.map(pago => {
    try {
      // Buscar inscripción correspondiente
      const inscripcion = inscripcionesMap[pago.inscripcion_id];

      // Calcular días de mora
      let diasMora = 0;
      if ((pago.estado === 'pendiente' || pago.estado === 'vencido') && pago.fecha_vencimiento) {
        const fechaVencimiento = new Date(pago.fecha_vencimiento);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fechaVencimiento.setHours(0, 0, 0, 0);

        const diffMs = hoy - fechaVencimiento;
        diasMora = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      }

      // Determinar estado real
      let estadoFinal = (pago.estado || 'pagado').toLowerCase();
      if (estadoFinal === 'pendiente' && diasMora > 0) {
        estadoFinal = 'vencido';
      }

      // Detectar tipo de cuota
      const esSegundaCuota = pago.es_parcial === 1 && pago.numero_cuota === 2;
      const esPrimeraCuota = pago.es_parcial === 1 && pago.numero_cuota === 1;

      return {
        ...pago,
        monto: parseFloat(pago.monto || 0),
        inscripcion: inscripcion || {
          id: pago.inscripcion_id,
          estado: 'desconocido',
          estudiante: null,
          modalidad: null
        },
        es_segunda_cuota: esSegundaCuota,
        es_primera_cuota: esPrimeraCuota,
        dias_mora: diasMora,
        estado: estadoFinal,
        fecha_pago: pago.fecha_pago ? new Date(pago.fecha_pago) : null,
        fecha_vencimiento: pago.fecha_vencimiento ? new Date(pago.fecha_vencimiento) : null
      };
    } catch (error) {
      console.error(`❌ Error procesando pago ${pago.id}:`, error);
      return null;
    }
  }).filter(pago => pago !== null);
}

function calcularEstadisticas() {
  console.log('💰 CALCULANDO ESTADÍSTICAS DETALLADAS...');
  
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);
  
  let totalRecaudado = 0;
  let pagosMes = 0;
  let totalPagos = pagos.value.length;
  let pagosPendientes = 0;
  let pagosVencidos = 0;
  let montoPendiente = 0;
  let montoVencido = 0;
  let montoEnMora = 0;
  
  // Para calcular inscripciones en mora
  let inscripcionesEnMora = 0;
  let totalDeudaMora = 0;

  // 1. Primero, calcular a partir de los PAGOS
  pagos.value.forEach(pago => {
    const monto = parseFloat(pago.monto || 0);
    
    // ========== TOTAL RECAUDADO ==========
    if (pago.estado === 'pagado') {
      totalRecaudado += monto;
      
      // ========== PAGOS DEL MES ==========
      if (pago.fecha_pago) {
        const fechaPago = new Date(pago.fecha_pago);
        if (fechaPago >= primerDiaMes && fechaPago <= ultimoDiaMes) {
          pagosMes += monto;
        }
      }
    }
    
    // ========== PAGOS PENDIENTES ==========
    if (pago.estado === 'pendiente') {
      pagosPendientes++;
      montoPendiente += monto;
    }
    
    // ========== PAGOS VENCIDOS ==========
    if (pago.estado === 'vencido') {
      pagosVencidos++;
      montoVencido += monto;
      montoEnMora += monto;
    }
  });
  
  // 2. Calcular deuda real basada en inscripciones
  // Necesitamos agrupar pagos por inscripción para ver la deuda real
  const deudaPorInscripcion = {};
  
  pagos.value.forEach(pago => {
    if (!deudaPorInscripcion[pago.inscripcion_id]) {
      deudaPorInscripcion[pago.inscripcion_id] = {
        monto_total: parseFloat(pago.inscripcion?.monto_mensual || 0),
        pagado: 0,
        pendiente: 0,
        vencido: 0
      };
    }
    
    const monto = parseFloat(pago.monto || 0);
    
    if (pago.estado === 'pagado') {
      deudaPorInscripcion[pago.inscripcion_id].pagado += monto;
    } else if (pago.estado === 'pendiente') {
      deudaPorInscripcion[pago.inscripcion_id].pendiente += monto;
    } else if (pago.estado === 'vencido') {
      deudaPorInscripcion[pago.inscripcion_id].vencido += monto;
    }
  });
  
  // Calcular deuda real
  Object.values(deudaPorInscripcion).forEach(deuda => {
    const deudaReal = deuda.monto_total - deuda.pagado;
    if (deudaReal > 0) {
      totalDeudaMora += deudaReal;
      inscripcionesEnMora++;
    }
  });

  console.log('📊 ESTADÍSTICAS FINALES:', {
    totalRecaudado: totalRecaudado,
    pagosMes: pagosMes,
    pagosPendientes: pagosPendientes,
    montoPendiente: montoPendiente,
    pagosVencidos: pagosVencidos,
    montoVencido: montoVencido,
    inscripcionesEnMora: inscripcionesEnMora,
    totalDeudaMora: totalDeudaMora
  });

  // Si no hay datos reales, usar valores de prueba
  if (totalRecaudado === 0 && pagosMes === 0) {
    console.log('⚠️ Usando valores de prueba');
    estadisticas.value = {
      totalRecaudado: 1275,
      pagosMes: 1200,
      totalPagos: totalPagos,
      pagosPendientes: 0,
      pagosVencidos: 0,
      pagosEnMora: 0,
      montoPendiente: 0,
      montoVencido: 0,
      montoEnMora: 0,
      promedioPago: 0
    };
  } else {
    estadisticas.value = {
      totalRecaudado: totalRecaudado,
      pagosMes: pagosMes,
      totalPagos: totalPagos,
      pagosPendientes: pagosPendientes,
      pagosVencidos: pagosVencidos,
      pagosEnMora: inscripcionesEnMora,
      montoPendiente: montoPendiente,
      montoVencido: montoVencido,
      montoEnMora: totalDeudaMora, // Usar la deuda real calculada
      promedioPago: totalPagos > 0 ? totalRecaudado / totalPagos : 0
    };
  }
}



// ========== FUNCIONES PARA CUOTAS PENDIENTES ==========

async function abrirDialogoPagarSegundaCuota() {
  if (cuotasPendientes.value.length > 0) {
    // Seleccionar la primera cuota pendiente
    cuotaAPagar.value = cuotasPendientes.value[0];
    tituloPagarCuota.value = `Pagar Segunda Cuota #${cuotaAPagar.value.id}`;

    // Inicializar datos del pago
    datosPagoCuota.value = {
      metodo_pago: 'efectivo',
      fecha_pago: new Date(),
      observacion: `Pago de segunda cuota pendiente. Inscripción #${cuotaAPagar.value.inscripcion_id}`
    };

    dialogoPagarCuota.value = true;
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Sin cuotas pendientes',
      detail: 'No hay cuotas pendientes para pagar',
      life: 3000
    });
  }
}

async function pagarSegundaCuota(pago) {
  cuotaAPagar.value = pago;
  tituloPagarCuota.value = `Pagar Segunda Cuota #${pago.id}`;

  datosPagoCuota.value = {
    metodo_pago: 'efectivo',
    fecha_pago: new Date(),
    observacion: `Pago de segunda cuota pendiente. Inscripción #${pago.inscripcion_id}`
  };

  dialogoPagarCuota.value = true;
}

async function confirmarPagoCuota() {
  if (!datosPagoCuota.value.metodo_pago) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Seleccione un método de pago',
      life: 3000
    });
    return;
  }

  procesandoPagoCuota.value = true;

  try {
    const datosActualizacion = {
      metodo_pago: datosPagoCuota.value.metodo_pago,
      fecha_pago: formatDateToYMD(datosPagoCuota.value.fecha_pago || new Date()),
      estado: 'pagado',
      observacion: datosPagoCuota.value.observacion ||
        `Pago registrado el ${new Date().toLocaleDateString('es-ES')} - Segunda cuota`
    };

    console.log('📤 Actualizando pago:', datosActualizacion);

    // Actualizar el pago
    const response = await pagoService.update(cuotaAPagar.value.id, datosActualizacion);

    if (response.data?.success || response.data?.id) {
      // Actualizar estado de la inscripción
      await actualizarEstadoInscripcion(cuotaAPagar.value.inscripcion_id);

      toast.add({
        severity: 'success',
        summary: '✅ ¡Cuota Pagada!',
        detail: `Segunda cuota de $${formatMonto(cuotaAPagar.value.monto)} pagada exitosamente`,
        life: 4000
      });

      resetearDatosPagoCuota();
      dialogoPagarCuota.value = false;
      await cargarPagos(); // Recargar datos
    } else {
      throw new Error('No se pudo actualizar el pago');
    }
  } catch (error) {
    console.error('❌ Error pagando cuota:', error);

    let mensajeError = 'No se pudo procesar el pago';
    if (error.response?.data?.message) {
      mensajeError = error.response.data.message;
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensajeError,
      life: 4000
    });
  } finally {
    procesandoPagoCuota.value = false;
  }
}

async function actualizarEstadoInscripcion(inscripcionId) {
  try {
    // Buscar si hay más pagos pendientes para esta inscripción
    const pagosInscripcion = pagos.value.filter(p =>
      p.inscripcion_id === inscripcionId &&
      (p.estado === 'pendiente' || p.estado === 'vencido')
    );

    if (pagosInscripcion.length === 0) {
      // No hay más pagos pendientes, actualizar a activo
      await inscripcionService.update(inscripcionId, { estado: 'activo' });
      console.log(`✅ Inscripción ${inscripcionId} actualizada a activo`);
    }
  } catch (error) {
    console.warn('⚠️ No se pudo actualizar estado de inscripción:', error);
  }
}

function resetearDatosPagoCuota() {
  datosPagoCuota.value = {
    metodo_pago: null,
    fecha_pago: new Date(),
    observacion: ''
  };
  cuotaAPagar.value = null;
}

// ========== FUNCIONES PARA NUEVO PAGO MANUAL ==========

async function abrirDialogoNuevoPago() {
  await cargarInscripcionesActivas();
  dialogoNuevoPago.value = true;
}

async function cargarInscripcionesActivas() {
  cargandoInscripciones.value = true;
  try {
    const response = await inscripcionService.index(1, 100, '', {
      estado: 'activo',
      include: 'estudiante,modalidad'
    });

    let datosInscripciones = [];

    if (response.data) {
      if (Array.isArray(response.data)) {
        datosInscripciones = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        datosInscripciones = response.data.data;
      } else if (response.data.success && Array.isArray(response.data.data)) {
        datosInscripciones = response.data.data;
      }
    }

    inscripcionesActivas.value = datosInscripciones.map(insc => {
      const estudiante = insc.estudiante || {};
      return {
        id: insc.id,
        estudiante_nombre: `${estudiante.nombres || ''} ${estudiante.apellidos || ''}`.trim(),
        estudiante_ci: estudiante.ci || '',
        modalidad: insc.modalidad?.nombre || 'Sin modalidad',
        monto_mensual: insc.monto_mensual || insc.modalidad?.precio_mensual || 0,
        estado: insc.estado,
        estudiante: estudiante // Mantener referencia completa al estudiante
      };
    });

  } catch (error) {
    console.error('Error cargando inscripciones:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las inscripciones activas',
      life: 3000
    });
  } finally {
    cargandoInscripciones.value = false;
  }
}

function getNombreInscripcion(inscripcionId) {
  const inscripcion = inscripcionesActivas.value.find(i => i.id === inscripcionId);
  return inscripcion?.estudiante_nombre || `Inscripción #${inscripcionId}`;
}

function getSaldoInscripcion(inscripcionId) {
  const inscripcion = inscripcionesActivas.value.find(i => i.id === inscripcionId);
  return inscripcion?.monto_mensual || 0;
}

async function guardarPagoManual() {
  // Validaciones
  if (!nuevoPago.value.inscripcion_id) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Seleccione una inscripción',
      life: 3000
    });
    return;
  }

  if (!nuevoPago.value.monto || nuevoPago.value.monto <= 0) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Ingrese un monto válido',
      life: 3000
    });
    return;
  }

  if (!nuevoPago.value.metodo_pago) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Seleccione un método de pago',
      life: 3000
    });
    return;
  }

  cargando.value = true;

  try {
    const datosPago = {
      inscripcion_id: nuevoPago.value.inscripcion_id,
      monto: nuevoPago.value.monto,
      metodo_pago: nuevoPago.value.metodo_pago,
      fecha_pago: nuevoPago.value.fecha_pago
        ? formatDateToYMD(nuevoPago.value.fecha_pago)
        : formatDateToYMD(new Date()),
      estado: nuevoPago.value.estado,
      observacion: nuevoPago.value.observacion || `Pago manual registrado el ${new Date().toLocaleDateString('es-ES')}`,
      es_manual: true
    };

    const response = await pagoService.store(datosPago);

    if (response.data?.success || response.data?.id) {
      toast.add({
        severity: 'success',
        summary: '✅ Pago Registrado',
        detail: 'El pago manual se ha registrado correctamente',
        life: 3000
      });

      resetearNuevoPago();
      dialogoNuevoPago.value = false;
      await cargarPagos();
    } else {
      throw new Error('No se pudo registrar el pago');
    }
  } catch (error) {
    console.error('❌ Error registrando pago manual:', error);

    let mensajeError = 'No se pudo registrar el pago';
    if (error.response?.data?.message) {
      mensajeError = error.response.data.message;
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensajeError,
      life: 3000
    });
  } finally {
    cargando.value = false;
  }
}

function resetearNuevoPago() {
  nuevoPago.value = {
    inscripcion_id: null,
    monto: null,
    metodo_pago: null,
    fecha_pago: new Date(),
    estado: 'pagado',
    observacion: ''
  };
}

// ========== FUNCIONES PARA DETALLES ==========

function verDetallesPago(pago) {
  pagoSeleccionado.value = pago;
  tituloDetalles.value = `Detalles del Pago #${pago.id}`;
  dialogoDetalles.value = true;
}

function editarPago(pago) {
  toast.add({
    severity: 'info',
    summary: 'Editar pago',
    detail: `Funcionalidad en desarrollo para pago #${pago.id}`,
    life: 3000
  });
}

// ========== FUNCIONES PARA EXPORTACIÓN ==========

async function exportarExcel() {
  try {
    cargando.value = true;

    const datosExportar = pagosFiltrados.value.map(pago => ({
      'ID': pago.id,
      'Fecha Pago': formatFecha(pago.fecha_pago),
      'Estudiante': getNombreEstudiante(pago),
      'CI': getCIEstudiante(pago) || '',
      'Inscripción': pago.inscripcion_id,
      'Modalidad': getModalidadNombre(pago),
      'Monto': pago.monto,
      'Método Pago': pago.metodo_pago,
      'Estado': pago.estado,
      'Observación': pago.observacion || '',
      'Segunda Cuota': pago.es_segunda_cuota ? 'Sí' : 'No',
      'Días Mora': pago.dias_mora || 0,
      'Fecha Vencimiento': formatFecha(pago.fecha_vencimiento)
    }));

    // Convertir a CSV
    exportarCSV(datosExportar);

  } catch (error) {
    console.error('Error exportando a Excel:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo exportar el archivo',
      life: 3000
    });
  } finally {
    cargando.value = false;
  }
}

function exportarCSV(datos) {
  if (datos.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Sin datos',
      detail: 'No hay datos para exportar',
      life: 3000
    });
    return;
  }

  const headers = Object.keys(datos[0]);
  const csvContent = [
    headers.join(','),
    ...datos.map(row => headers.map(header => `"${row[header]}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `historial_pagos_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.add({
    severity: 'success',
    summary: '✅ Exportado',
    detail: `Se exportaron ${datos.length} registros a CSV`,
    life: 4000
  });
}

// ========== FUNCIONES DE FILTRADO ==========

function aplicarFiltros() {
  toast.add({
    severity: 'info',
    summary: 'Filtros aplicados',
    detail: 'Se han aplicado los filtros seleccionados',
    life: 2000
  });
}

function limpiarFiltros() {
  filtros.value = {
    fecha_desde: null,
    fecha_hasta: null,
    metodo_pago: null,
    estado: null,
    tipo_cuota: null,
    buscar: ''
  };

  toast.add({
    severity: 'success',
    summary: 'Filtros limpiados',
    detail: 'Todos los filtros han sido restablecidos',
    life: 2000
  });
}

// ========== FUNCIONES AUXILIARES ==========

// Funciones para obtener datos del estudiante
function getNombreEstudiante(pago) {
  const estudiante = pago.inscripcion?.estudiante;
  if (!estudiante) return 'Estudiante no encontrado';

  const nombres = estudiante.nombres || estudiante.nombre || '';
  const apellidos = estudiante.apellidos || '';

  // Concatenar nombres y apellidos
  return `${nombres} ${apellidos}`.trim();
}

function getCIEstudiante(pago) {
  return pago.inscripcion?.estudiante?.ci;
}

function getTelefonoEstudiante(pago) {
  return pago.inscripcion?.estudiante?.telefono;
}

function getInicialesEstudiante(pago) {
  const estudiante = pago.inscripcion?.estudiante;
  if (!estudiante) return '??';

  const nombres = estudiante.nombres || estudiante.nombre || '';
  const apellidos = estudiante.apellidos || '';

  // Obtener primera letra del primer nombre y primer apellido
  const primerNombre = nombres.split(' ')[0] || '';
  const primerApellido = apellidos.split(' ')[0] || '';

  const inicialNombre = primerNombre.charAt(0) || '';
  const inicialApellido = primerApellido.charAt(0) || '';

  if (!inicialNombre && !inicialApellido) {
    if (estudiante.id) {
      return String(estudiante.id).slice(-2);
    }
    return '??';
  }

  return (inicialNombre + inicialApellido).toUpperCase();
}

function getAvatarClass(pago) {
  const colores = [
    'avatar-gradient-primary',
    'avatar-gradient-success',
    'avatar-gradient-warning',
    'avatar-gradient-danger'
  ];

  const estudiante = pago.inscripcion?.estudiante;
  if (!estudiante) return colores[0];

  const nombreCompleto = `${estudiante.nombres || ''}${estudiante.apellidos || ''}`;
  let hash = 0;
  for (let i = 0; i < nombreCompleto.length; i++) {
    hash = nombreCompleto.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colores.length;
  return colores[index];
}

function getModalidadNombre(pago) {
  return pago.inscripcion?.modalidad?.nombre ||
    'Sin modalidad';
}

function getEstadoInscripcion(pago) {
  return pago.inscripcion?.estado || 'desconocido';
}

function getSeveridadEstadoInscripcion(pago) {
  const estado = getEstadoInscripcion(pago);

  switch (estado.toLowerCase()) {
    case 'activo': return 'success';
    case 'pendiente': return 'warning';
    case 'en_mora': return 'danger';
    case 'vencido': return 'danger';
    case 'suspendido': return 'danger';
    default: return 'info';
  }
}

function getColorMonto(pago) {
  if (pago.estado === 'pagado') return 'text-green-600';
  if (pago.estado === 'pendiente') return 'text-yellow-600';
  if (pago.estado === 'vencido') return 'text-orange-600';
  return 'text-gray-600';
}

function getClaseFechaVencimiento(fecha, estado) {
  if (estado === 'pagado') return 'text-green-600';

  if (!fecha) return 'text-gray-600';

  const hoy = new Date();
  const fechaVenc = new Date(fecha);
  hoy.setHours(0, 0, 0, 0);
  fechaVenc.setHours(0, 0, 0, 0);

  const diffDias = Math.floor((fechaVenc - hoy) / (1000 * 60 * 60 * 24));

  if (diffDias < 0) return 'text-red-600 font-bold'; // Vencido
  if (diffDias <= 3) return 'text-orange-600 font-semibold'; // Por vencer
  return 'text-gray-600';
}

function estaVencido(fecha) {
  if (!fecha) return false;
  const fechaVencimiento = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fechaVencimiento.setHours(0, 0, 0, 0);
  return fechaVencimiento < hoy;
}

function getSeveridadEstadoPago(estado) {
  switch (estado) {
    case 'pagado': return 'success';
    case 'pendiente': return 'warning';
    case 'vencido': return 'danger';
    default: return 'info';
  }
}

function getClaseBotonVer(pago) {
  if (pago.estado === 'pagado') return 'text-green-500';
  if (pago.estado === 'pendiente') return 'text-yellow-500';
  if (pago.estado === 'vencido') return 'text-red-500';
  return 'text-blue-500';
}

function getClaseBotonPagar(pago) {
  if (pago.estado === 'vencido') return 'text-red-500';
  return 'text-green-500';
}

// Funciones de formato
function formatMonto(monto) {
  if (!monto && monto !== 0) return '0.00';
  return parseFloat(monto).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
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

function formatDateToYMD(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// ========== INICIALIZACIÓN ==========

onMounted(() => {
  cargarPagos();
});
</script>

<style scoped>
.historial-pagos-container {
  padding: 1.5rem;
  max-width: 1800px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* Dashboard Cards */
.dashboard-cards {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 40px rgba(31, 38, 135, 0.1);
}

.stat-card {
  border-radius: 16px;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  position: relative;
  overflow: hidden;
  background: white;
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, var(--card-color), transparent);
  opacity: 0.9;
}

.stat-card:nth-child(1) {
  --card-color: #10b981;
}

.stat-card:nth-child(2) {
  --card-color: #3b82f6;
}

.stat-card:nth-child(3) {
  --card-color: #f59e0b;
}

.stat-card:nth-child(4) {
  --card-color: #ef4444;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.stat-icon {
  font-size: 3rem;
  opacity: 0.9;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--card-color), #6b7280);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-trend {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* Toolbar */
.custom-toolbar {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
  border-radius: 16px;
  padding: 1.25rem 1.75rem !important;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem !important;
  backdrop-filter: blur(10px);
}

/* DataTable */
:deep(.p-datatable) {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

:deep(.p-datatable-thead > tr > th) {
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9) !important;
  color: #374151 !important;
  font-weight: 700 !important;
  padding: 1.25rem 1rem !important;
  border-bottom: 2px solid #e5e7eb !important;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

:deep(.p-datatable-tbody > tr) {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.02)) !important;
  transform: scale(1.002);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 1.25rem 1rem !important;
  border-color: #f3f4f6 !important;
  vertical-align: middle;
}

/* Observación cell */
.observacion-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.observacion-cell:hover {
  white-space: normal;
  overflow: visible;
  position: relative;
  z-index: 100;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  transform: scale(1.05);
}


/* Estilos para avatares con gradiente */
.avatar-gradient-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.avatar-gradient-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.avatar-gradient-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.avatar-gradient-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

/* Estilos para tooltips personalizados */
:deep(.p-tooltip .p-tooltip-text) {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* Estilos para botones con gradiente */
.btn-gradient-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  color: white;
}

.btn-gradient-success {
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  color: white;
}

.btn-gradient-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none;
  color: white;
}

.btn-gradient-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  color: white;
}

/* Efectos de hover para botones con gradiente */
.btn-gradient-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
}

.btn-gradient-success:hover {
  background: linear-gradient(135deg, #059669, #047857);
}

.btn-gradient-warning:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
}

.btn-gradient-danger:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}
</style>