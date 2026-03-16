<template>
  <div class="gastos-container">
    <!-- Dashboard rápido -->
    <div class="dashboard-cards mb-4">
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Total Gastos</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-money-bill stat-icon text-primary"></i>
                <span class="stat-value">Bs.{{ formatNumero(estadisticas.totalGeneral) }}</span>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Gastos Este Mes</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-calendar stat-icon text-warning"></i>
                <span class="stat-value">Bs.{{ formatNumero(estadisticas.totalMes) }}</span>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>vs. Mes Anterior</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-chart-line stat-icon" :class="estadisticas.variacion > 0 ? 'text-danger' : 'text-success'"></i>
                <span class="stat-value" :class="estadisticas.variacion > 0 ? 'text-danger' : 'text-success'">
                  {{ estadisticas.variacion > 0 ? '+' : '' }}{{ estadisticas.variacion.toFixed(1) }}%
                </span>
              </div>
            </template>
          </Card>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="stat-card">
            <template #title>Promedio Mensual</template>
            <template #content>
              <div class="stat-content">
                <i class="pi pi-chart-bar stat-icon text-green-500"></i>
                <span class="stat-value">Bs.{{ formatNumero(estadisticas.promedioMensual) }}</span>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <Toolbar class="mb-4 custom-toolbar">
      <template #start>
        <div class="flex align-items-center gap-2">
          <Button label="Nuevo Gasto" icon="pi pi-plus" severity="success" @click="abrirDialogoNuevo" />
          <Button label="Exportar Excel" icon="pi pi-file-excel" severity="help" @click="exportarExcel" />
        </div>
      </template>

      <template #end>
        <div class="flex gap-2 align-items-center flex-wrap">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <InputText v-model="filtros.buscar" placeholder="Buscar gasto..." @keyup.enter="aplicarFiltros" />
          </span>
          <Dropdown v-model="filtros.categoria" :options="categoriasOptions" optionLabel="label" optionValue="value"
            placeholder="Categoría" class="w-12rem" :showClear="true" />
          <Calendar v-model="filtros.fecha_desde" placeholder="Desde" dateFormat="dd/mm/yy" class="w-8rem" showIcon />
          <Calendar v-model="filtros.fecha_hasta" placeholder="Hasta" dateFormat="dd/mm/yy" class="w-8rem" showIcon />
          <Button icon="pi pi-filter" @click="aplicarFiltros" />
          <Button icon="pi pi-filter-slash" severity="secondary" @click="limpiarFiltros" />
        </div>
      </template>
    </Toolbar>

    <!-- Tabs para diferentes vistas -->
    <TabView class="mb-4">
      <!-- Tab: Lista de Gastos -->
      <TabPanel header="Lista de Gastos">
        <DataTable :value="gastosFiltrados" :paginator="true" :rows="10" :loading="cargando"
          class="p-datatable-sm" v-model:selection="gastosSeleccionados" dataKey="id">
          
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          
          <Column field="id" header="ID" :sortable="true" style="width: 70px"></Column>
          
          <Column header="Categoría" :sortable="true" sortField="categoria">
            <template #body="slotProps">
              <div class="flex align-items-center">
                <i :class="getIconoCategoria(slotProps.data.categoria)" class="mr-2"></i>
                <div>
                  <div class="font-medium">{{ getNombreCategoria(slotProps.data.categoria) }}</div>
                </div>
              </div>
            </template>
          </Column>
          
          <Column field="descripcion" header="Descripción" :sortable="true" style="min-width: 200px"></Column>
          
          <Column header="Monto" :sortable="true" sortField="monto">
            <template #body="slotProps">
              <div class="font-bold text-danger">Bs.{{ formatNumero(slotProps.data.monto) }}</div>
            </template>
          </Column>
          
          <Column field="fecha" header="Fecha" :sortable="true">
            <template #body="slotProps">
              {{ formatFecha(slotProps.data.fecha) }}
            </template>
          </Column>
          
          <Column field="metodo_pago" header="Método" :sortable="true">
            <template #body="slotProps">
              <Tag :value="getMetodoPagoLabel(slotProps.data.metodo_pago)" 
                   :severity="getMetodoPagoSeverity(slotProps.data.metodo_pago)" />
            </template>
          </Column>
          
          <Column header="Acciones" style="width: 100px">
            <template #body="slotProps">
              <div class="flex gap-1">
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm"
                        @click="editarGasto(slotProps.data)" v-tooltip="'Editar'" />
                <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-sm p-button-danger"
                        @click="confirmarEliminar(slotProps.data)" v-tooltip="'Eliminar'" />
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <!-- Tab: Por Categorías -->
      <TabPanel header="Por Categorías">
        <div class="grid">
          <div v-for="(categoria, key) in categoriasAgrupadas" :key="key" class="col-12 md:col-6 lg:col-4 mb-3">
            <Card class="categoria-card">
              <template #title>
                <div class="flex justify-content-between align-items-center">
                  <div class="flex align-items-center">
                    <i :class="getIconoCategoria(key)" class="mr-2" style="font-size: 1.2rem"></i>
                    <span>{{ getNombreCategoriaCompleto(key) }}</span>
                  </div>
                  <Tag :value="`${categoria.items.length} gastos`" severity="info" />
                </div>
              </template>
              <template #content>
                <div class="space-y-2">
                  <div class="flex justify-content-between align-items-center">
                    <span class="text-500">Total:</span>
                    <span class="font-bold text-danger text-xl">Bs.{{ formatNumero(categoria.total) }}</span>
                  </div>
                  
                  <div class="flex justify-content-between text-sm text-500">
                    <span>Este mes:</span>
                    <span>Bs.{{ formatNumero(categoria.mesActual) }}</span>
                  </div>
                  
                  <div class="flex justify-content-between text-sm text-500">
                    <span>Porcentaje:</span>
                    <span>{{ ((categoria.total / (estadisticas.totalGeneral || 1)) * 100).toFixed(1) }}%</span>
                  </div>

                  <Divider />

                  <!-- Últimos 3 gastos de esta categoría -->
                  <div v-for="item in categoria.items.slice(0, 3)" :key="item.id" 
                       class="flex justify-content-between align-items-center p-2 surface-ground border-round">
                    <div class="flex flex-column">
                      <span class="font-medium text-sm">{{ item.descripcion }}</span>
                      <small class="text-500">{{ formatFecha(item.fecha) }}</small>
                    </div>
                    <span class="font-bold text-danger">Bs.{{ formatNumero(item.monto) }}</span>
                  </div>

                  <div v-if="categoria.items.length > 3" class="text-center mt-2">
                    <Button :label="`Ver ${categoria.items.length - 3} más`" text 
                            @click="verCategoriaCompleta(key)" />
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </TabPanel>

      <!-- Tab: Análisis Mensual -->
      <TabPanel header="Análisis Mensual">
        <div class="grid">
          <div class="col-12 md:col-8">
            <Card>
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-chart-line text-primary"></i>
                  <span>Evolución Mensual</span>
                </div>
              </template>
              <template #content>
                <div class="h-20rem flex align-items-center justify-content-center surface-ground border-round">
                  <Chart v-if="datosGrafico.labels?.length" type="line" :data="datosGrafico" :options="opcionesGrafico" />
                  <p v-else class="text-500">No hay datos para mostrar</p>
                </div>
              </template>
            </Card>
          </div>
          
          <div class="col-12 md:col-4">
            <Card>
              <template #title>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-chart-pie text-primary"></i>
                  <span>Distribución</span>
                </div>
              </template>
              <template #content>
                <div class="space-y-3">
                  <div v-for="(categoria, key) in categoriasAgrupadas" :key="key" class="flex flex-column">
                    <div class="flex justify-content-between align-items-center mb-1">
                      <div class="flex align-items-center">
                        <i :class="getIconoCategoria(key)" class="mr-2"></i>
                        <span class="text-sm">{{ getNombreCategoria(key) }}</span>
                      </div>
                      <span class="font-bold text-sm">{{ ((categoria.total / (estadisticas.totalGeneral || 1)) * 100).toFixed(1) }}%</span>
                    </div>
                    <ProgressBar :value="(categoria.total / (estadisticas.totalGeneral || 1)) * 100" :showValue="false" />
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </TabPanel>
    </TabView>

    <!-- Diálogo para Nuevo/Editar Gasto -->
    <Dialog v-model:visible="dialogoVisible" :header="tituloDialogo" :modal="true" 
            :style="{ width: '500px' }" :closable="false">
      
      <div class="p-fluid">
        <!-- Categoría -->
        <div class="field mb-4">
          <label class="font-medium block mb-2">Categoría *</label>
          <Dropdown v-model="form.categoria" :options="categoriasDetalladasOptions" 
                    optionLabel="label" optionValue="value" placeholder="Seleccione categoría" 
                    class="w-full" :class="{ 'p-invalid': enviado && !form.categoria }" />
          <small v-if="enviado && !form.categoria" class="p-error">Seleccione una categoría</small>
        </div>

        <!-- Descripción -->
        <div class="field mb-4">
          <label class="font-medium block mb-2">Descripción *</label>
          <Textarea v-model="form.descripcion" rows="2" class="w-full" 
                    placeholder="Ej: Pago de factura de luz, Compra de pesas, etc."
                    :class="{ 'p-invalid': enviado && !form.descripcion }" />
          <small v-if="enviado && !form.descripcion" class="p-error">Ingrese una descripción</small>
        </div>

        <!-- Monto y Fecha -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label class="font-medium block mb-2">Monto (Bs.) *</label>
              <InputNumber v-model="form.monto" mode="currency" currency="BOB" locale="es-BO"
                          :min="0" :max="1000000" class="w-full"
                          :class="{ 'p-invalid': enviado && (!form.monto || form.monto <= 0) }" />
              <small v-if="enviado && (!form.monto || form.monto <= 0)" class="p-error">Ingrese un monto válido</small>
            </div>
          </div>
          
          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label class="font-medium block mb-2">Fecha *</label>
              <Calendar v-model="form.fecha" dateFormat="dd/mm/yy" class="w-full" 
                        :maxDate="new Date()" showIcon
                        :class="{ 'p-invalid': enviado && !form.fecha }" />
              <small v-if="enviado && !form.fecha" class="p-error">Seleccione una fecha</small>
            </div>
          </div>
        </div>

        <!-- Método de Pago -->
        <div class="field mb-4">
          <label class="font-medium block mb-2">Método de Pago</label>
          <Dropdown v-model="form.metodo_pago" :options="metodosPago" 
                    optionLabel="label" optionValue="value" placeholder="Seleccione método" 
                    class="w-full" :showClear="true" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" icon="pi pi-times" @click="cerrarDialogo" />
        <Button :label="editando ? 'Actualizar' : 'Guardar Gasto'" 
                :severity="editando ? 'warning' : 'success'" 
                icon="pi pi-check" @click="guardarGasto" 
                :loading="guardando" />
      </template>
    </Dialog>

    <!-- Diálogo de confirmación para eliminar -->
    <Dialog v-model:visible="dialogoEliminar" header="Confirmar eliminación" :modal="true"
            :style="{ width: '400px' }">
      <div class="text-center">
        <i class="pi pi-exclamation-triangle text-warning" style="font-size: 3rem"></i>
        <p class="mt-3">¿Está seguro que desea eliminar este gasto?</p>
        <p class="text-500 text-sm">{{ gastoSeleccionado?.descripcion }} - Bs.{{ formatNumero(gastoSeleccionado?.monto) }}</p>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" icon="pi pi-times" @click="dialogoEliminar = false" />
        <Button label="Eliminar" severity="danger" icon="pi pi-trash" @click="eliminarGasto" :loading="eliminando" />
      </template>
    </Dialog>

    <!-- Diálogo para ver detalles de categoría -->
    <Dialog v-model:visible="dialogoCategoria" :header="'Detalles - ' + categoriaSeleccionadaNombre" 
            :modal="true" :style="{ width: '600px' }">
      <div v-if="categoriaSeleccionada">
        <div class="mb-4 p-3 surface-ground border-round">
          <div class="flex justify-content-between align-items-center">
            <div>
              <div class="text-500 text-sm">Total gastado</div>
              <div class="font-bold text-danger text-3xl">Bs.{{ formatNumero(categoriaSeleccionada.total) }}</div>
            </div>
            <div>
              <div class="text-500 text-sm">Cantidad de gastos</div>
              <div class="font-bold text-xl">{{ categoriaSeleccionada.items.length }}</div>
            </div>
          </div>
        </div>

        <DataTable :value="categoriaSeleccionada.items" :paginator="true" :rows="5">
          <Column field="fecha" header="Fecha">
            <template #body="slotProps">
              {{ formatFecha(slotProps.data.fecha) }}
            </template>
          </Column>
          <Column field="descripcion" header="Descripción"></Column>
          <Column field="monto" header="Monto">
            <template #body="slotProps">
              Bs.{{ formatNumero(slotProps.data.monto) }}
            </template>
          </Column>
          <Column field="metodo_pago" header="Método">
            <template #body="slotProps">
              {{ getMetodoPagoLabel(slotProps.data.metodo_pago) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import gastoService from '../../services/gasto.service';
import Chart from 'primevue/chart';

// Componentes PrimeVue
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Dialog from 'primevue/dialog';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Calendar from 'primevue/calendar';
import ProgressBar from 'primevue/progressbar';
import Toast from 'primevue/toast';

const toast = useToast();

// ========== DATOS REACTIVOS ==========
const gastos = ref([]);
const cargando = ref(false);
const guardando = ref(false);
const eliminando = ref(false);
const gastosSeleccionados = ref([]);
const dialogoVisible = ref(false);
const dialogoEliminar = ref(false);
const dialogoCategoria = ref(false);
const editando = ref(false);
const enviado = ref(false);
const gastoSeleccionado = ref(null);
const categoriaSeleccionada = ref(null);
const categoriaSeleccionadaNombre = ref('');
const datosGrafico = ref({
  labels: [],
  datasets: [
    {
      label: 'Gastos',
      data: [],
      fill: false,
      borderColor: '#ef4444',
      tension: 0.4
    }
  ]
});
const opcionesGrafico = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  }
});

// Filtros
const filtros = ref({
  buscar: '',
  categoria: null,
  fecha_desde: null,
  fecha_hasta: null
});

// Formulario
const form = ref({
  categoria: null,
  descripcion: '',
  monto: null,
  fecha: new Date(),
  metodo_pago: null
});

// Estadísticas
const estadisticas = ref({
  totalGeneral: 0,
  totalMes: 0,
  variacion: 0,
  promedioMensual: 0,
  gastosPorCategoria: [],
  ultimos_6_meses: []
});

// ========== CATEGORÍAS (basado en tu lista) ==========
const CATEGORIAS = {
  servicios_basicos: {
    label: 'Servicios Básicos',
    icon: 'pi pi-bolt',
    color: 'blue',
    items: {
      agua: 'Agua',
      electricidad: 'Electricidad',
      internet: 'Internet',
      gas: 'Gas'
    }
  },
  infraestructura: {
    label: 'Infraestructura',
    icon: 'pi pi-building',
    color: 'orange',
    items: {
      alquiler: 'Alquiler del local',
      mantenimiento: 'Mantenimiento del local',
      limpieza: 'Limpieza'
    }
  },
  equipamiento: {
    label: 'Equipamiento',
    icon: 'pi pi-cog',
    color: 'purple',
    items: {
      compra_maquinas: 'Compra de máquinas',
      reparacion_maquinas: 'Reparación de máquinas',
      compra_pesas: 'Compra de pesas o accesorios',
      colchonetas: 'Colchonetas, guantes, bandas'
    }
  },
  personal: {
    label: 'Personal',
    icon: 'pi pi-users',
    color: 'green',
    items: {
      sueldo_entrenadores: 'Sueldo entrenadores',
      sueldo_recepcionista: 'Sueldo recepcionista',
      sueldo_limpieza: 'Sueldo limpieza'
    }
  },
  operativos: {
    label: 'Operativos',
    icon: 'pi pi-chart-line',
    color: 'yellow',
    items: {
      publicidad: 'Publicidad / marketing',
      software: 'Software o sistemas',
      papeleria: 'Papelería',
      uniformes: 'Uniformes'
    }
  },
  impuestos: {
    label: 'Impuestos',
    icon: 'pi pi-file',
    color: 'red',
    items: {
      impuestos: 'Impuestos',
      licencias: 'Licencias municipales',
      seguridad: 'Seguridad'
    }
  },
  otros: {
    label: 'Otros',
    icon: 'pi pi-question',
    color: 'gray',
    items: {
      otros: 'Otros'
    }
  }
};

// Métodos de pago
const metodosPago = ref([
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Transferencia', value: 'transferencia' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Cheque', value: 'cheque' },
  { label: 'QR', value: 'qr' }
]);

// ========== COMPUTED PROPERTIES ==========

// Opciones para dropdown de categorías
const categoriasDetalladasOptions = computed(() => {
  const options = [];
  
  Object.entries(CATEGORIAS).forEach(([categoriaKey, categoria]) => {
    Object.entries(categoria.items).forEach(([subKey, subLabel]) => {
      options.push({
        label: `${categoria.label} - ${subLabel}`,
        value: subKey
      });
    });
  });
  
  return options.sort((a, b) => a.label.localeCompare(b.label));
});

// Opciones para filtro por categoría
const categoriasOptions = computed(() => {
  return Object.entries(CATEGORIAS).map(([key, cat]) => ({
    label: cat.label,
    value: key
  }));
});


const gastosFiltrados = computed(() => {
  // Asegurar que gastos.value sea un array
  if (!Array.isArray(gastos.value)) {
    console.warn('gastos.value no es un array:', gastos.value);
    return [];
  }
  
  let filtrados = gastos.value;

  if (filtros.value.buscar) {
    const search = filtros.value.buscar.toLowerCase();
    filtrados = filtrados.filter(g => 
      g.descripcion?.toLowerCase().includes(search) ||
      getNombreCategoria(g.categoria)?.toLowerCase().includes(search)
    );
  }

  if (filtros.value.categoria) {
    filtrados = filtrados.filter(g => 
      getCategoriaPrincipal(g.categoria) === filtros.value.categoria
    );
  }

  if (filtros.value.fecha_desde) {
    const desde = new Date(filtros.value.fecha_desde);
    desde.setHours(0, 0, 0, 0);
    filtrados = filtrados.filter(g => {
      if (!g.fecha) return false;
      const fechaGasto = new Date(g.fecha);
      return !isNaN(fechaGasto) && fechaGasto >= desde;
    });
  }

  if (filtros.value.fecha_hasta) {
    const hasta = new Date(filtros.value.fecha_hasta);
    hasta.setHours(23, 59, 59, 999);
    filtrados = filtrados.filter(g => {
      if (!g.fecha) return false;
      const fechaGasto = new Date(g.fecha);
      return !isNaN(fechaGasto) && fechaGasto <= hasta;
    });
  }

  return filtrados;
});

// Gastos agrupados por categoría
const categoriasAgrupadas = computed(() => {
  const agrupado = {};

  Object.keys(CATEGORIAS).forEach(key => {
    agrupado[key] = {
      items: [],
      total: 0,
      mesActual: 0
    };
  });

  gastos.value.forEach(gasto => {
    const categoriaPrincipal = getCategoriaPrincipal(gasto.categoria);
    if (categoriaPrincipal && agrupado[categoriaPrincipal]) {
      agrupado[categoriaPrincipal].items.push(gasto);
      agrupado[categoriaPrincipal].total += Number(gasto.monto) || 0;

      const fechaGasto = new Date(gasto.fecha);
      const hoy = new Date();
      if (fechaGasto.getMonth() === hoy.getMonth() && 
          fechaGasto.getFullYear() === hoy.getFullYear()) {
        agrupado[categoriaPrincipal].mesActual += Number(gasto.monto) || 0;
      }
    }
  });

  Object.keys(agrupado).forEach(key => {
    agrupado[key].items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  });

  return agrupado;
});

const tituloDialogo = computed(() => editando.value ? 'Editar Gasto' : 'Nuevo Gasto');

// ========== FUNCIONES AUXILIARES ==========

function getCategoriaPrincipal(subcategoria) {
  if (!subcategoria) return null;
  for (const [principal, data] of Object.entries(CATEGORIAS)) {
    if (Object.keys(data.items).includes(subcategoria)) {
      return principal;
    }
  }
  return subcategoria;
}

function getNombreCategoria(key) {
  if (!key) return 'Sin categoría';
  
  for (const [principal, data] of Object.entries(CATEGORIAS)) {
    if (data.items[key]) {
      return data.items[key];
    }
    if (principal === key) {
      return data.label;
    }
  }
  return key;
}

function getNombreCategoriaCompleto(key) {
  if (CATEGORIAS[key]) {
    return CATEGORIAS[key].label;
  }
  return getNombreCategoria(key);
}

function getSubcategoriaNombre(key) {
  if (!key) return '';
  for (const [principal, data] of Object.entries(CATEGORIAS)) {
    if (data.items[key]) {
      return data.items[key];
    }
  }
  return '';
}

function getIconoCategoria(key) {
  if (!key) return 'pi pi-tag';
  
  const principal = getCategoriaPrincipal(key);
  if (principal && CATEGORIAS[principal]) {
    return CATEGORIAS[principal].icon;
  }
  return 'pi pi-tag';
}

function getMetodoPagoLabel(value) {
  const metodo = metodosPago.value.find(m => m.value === value);
  return metodo ? metodo.label : value || 'No especificado';
}

function getMetodoPagoSeverity(value) {
  const severities = {
    efectivo: 'success',
    transferencia: 'info',
    tarjeta: 'warning',
    cheque: 'help',
    qr: 'info'
  };
  return severities[value] || 'info';
}

function formatNumero(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) return '0.00';
  return Number(valor).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatFecha(fecha) {
  if (!fecha) return '--';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatDateToYMD(date) {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ========== FUNCIONES PRINCIPALES ==========

async function cargarGastos() {
  cargando.value = true;
  try {
    const response = await gastoService.index(1, 100, filtros.value.buscar, {
      categoria: filtros.value.categoria,
      fecha_desde: filtros.value.fecha_desde ? formatDateToYMD(filtros.value.fecha_desde) : null,
      fecha_hasta: filtros.value.fecha_hasta ? formatDateToYMD(filtros.value.fecha_hasta) : null
    });
    
    console.log('Respuesta del servidor:', response.data);
    
    // Variable para almacenar los gastos extraídos
    let datosExtraidos = [];
    
    // Manejar diferentes estructuras de respuesta
    if (response.data) {
      
      // CASO 1: response.data es un array directamente
      if (Array.isArray(response.data)) {
        datosExtraidos = response.data;
        console.log('✅ CASO 1: Array directo, longitud:', datosExtraidos.length);
      }
      
      // CASO 2: response.data tiene propiedad 'gastos'
      else if (response.data.gastos) {
        if (Array.isArray(response.data.gastos)) {
          datosExtraidos = response.data.gastos;
          console.log('✅ CASO 2a: response.data.gastos es array, longitud:', datosExtraidos.length);
        } else if (response.data.gastos.data && Array.isArray(response.data.gastos.data)) {
          datosExtraidos = response.data.gastos.data;
          console.log('✅ CASO 2b: response.data.gastos.data es array, longitud:', datosExtraidos.length);
        }
      }
      
      // CASO 3: response.data tiene propiedad 'data'
      else if (response.data.data) {
        if (Array.isArray(response.data.data)) {
          datosExtraidos = response.data.data;
          console.log('✅ CASO 3a: response.data.data es array, longitud:', datosExtraidos.length);
        } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          datosExtraidos = response.data.data.data;
          console.log('✅ CASO 3b: response.data.data.data es array, longitud:', datosExtraidos.length);
        }
      }
      
      // CASO 4: Buscar cualquier propiedad que sea array
      else {
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            datosExtraidos = response.data[key];
            console.log(`✅ CASO 4: response.data.${key} es array, longitud:`, datosExtraidos.length);
            break;
          }
        }
      }
    }
    
    // 👉 SIEMPRE asignar un array a gastos.value
    gastos.value = datosExtraidos;
    
    console.log('💰 Gastos asignados:', gastos.value.length, 'registros');
    
    // Calcular estadísticas
    if (gastos.value.length > 0) {
      const totalGeneral = gastos.value.reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
      const hoy = new Date();
      const mesActual = hoy.getMonth() + 1;
      const añoActual = hoy.getFullYear();
      
      const gastosMes = gastos.value.filter(g => {
        if (!g.fecha) return false;
        const fecha = new Date(g.fecha);
        return !isNaN(fecha) && fecha.getMonth() + 1 === mesActual && fecha.getFullYear() === añoActual;
      });
      
      const totalMes = gastosMes.reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
      
      // Gastos por categoría
      const gastosPorCategoria = [];
      Object.keys(CATEGORIAS).forEach(key => {
        const total = gastos.value
          .filter(g => getCategoriaPrincipal(g.categoria) === key)
          .reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
        
        if (total > 0) {
          gastosPorCategoria.push({
            categoria: key,
            total: total
          });
        }
      });
      
      estadisticas.value = {
        totalGeneral: totalGeneral,
        totalMes: totalMes,
        variacion: 0,
        promedioMensual: totalGeneral / 12,
        gastosPorCategoria: gastosPorCategoria,
        ultimos_6_meses: response.data?.estadisticas?.ultimos_6_meses || []
      };
    } else {
      // Si no hay gastos, reiniciar estadísticas
      estadisticas.value = {
        totalGeneral: 0,
        totalMes: 0,
        variacion: 0,
        promedioMensual: 0,
        gastosPorCategoria: [],
        ultimos_6_meses: []
      };
    }
    
    prepararGrafico();
    
  } catch (error) {
    console.error('Error cargando gastos:', error);
    
    // En caso de error, asegurar que gastos.value sea un array vacío
    gastos.value = [];
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los gastos',
      life: 3000
    });
  } finally {
    cargando.value = false;
  }
}

function prepararGrafico() {
  const ultimos6Meses = estadisticas.value.ultimos_6_meses || [];
  
  if (ultimos6Meses.length > 0) {
    datosGrafico.value = {
      labels: ultimos6Meses.map(item => {
        const fecha = new Date(item.year, item.month - 1, 1);
        return fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      }).reverse(),
      datasets: [
        {
          label: 'Gastos',
          data: ultimos6Meses.map(item => Number(item.total) || 0).reverse(),
          fill: false,
          borderColor: '#ef4444',
          tension: 0.4
        }
      ]
    };
  }
}

function abrirDialogoNuevo() {
  editando.value = false;
  form.value = {
    categoria: null,
    descripcion: '',
    monto: null,
    fecha: new Date(),
    metodo_pago: null
  };
  enviado.value = false;
  dialogoVisible.value = true;
}

function editarGasto(gasto) {
  editando.value = true;
  gastoSeleccionado.value = gasto;
  form.value = {
    categoria: gasto.categoria,
    descripcion: gasto.descripcion,
    monto: gasto.monto,
    fecha: new Date(gasto.fecha),
    metodo_pago: gasto.metodo_pago
  };
  enviado.value = false;
  dialogoVisible.value = true;
}

async function guardarGasto() {
  enviado.value = true;

  if (!form.value.categoria || !form.value.descripcion || !form.value.monto || !form.value.fecha) {
    toast.add({
      severity: 'error',
      summary: 'Validación',
      detail: 'Complete todos los campos requeridos',
      life: 3000
    });
    return;
  }

  guardando.value = true;

  try {
    const datos = {
      categoria: form.value.categoria,
      descripcion: form.value.descripcion,
      monto: form.value.monto,
      fecha: formatDateToYMD(form.value.fecha),
      metodo_pago: form.value.metodo_pago || null
    };

    let response;
    if (editando.value) {
      response = await gastoService.update(gastoSeleccionado.value.id, datos);
    } else {
      response = await gastoService.store(datos);
    }

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: editando.value ? 'Gasto actualizado' : 'Gasto registrado',
      life: 3000
    });

    cerrarDialogo();
    await cargarGastos();

  } catch (error) {
    console.error('Error guardando gasto:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Error al guardar',
      life: 3000
    });
  } finally {
    guardando.value = false;
  }
}

function cerrarDialogo() {
  dialogoVisible.value = false;
  form.value = {
    categoria: null,
    descripcion: '',
    monto: null,
    fecha: new Date(),
    metodo_pago: null
  };
  enviado.value = false;
  gastoSeleccionado.value = null;
}

function confirmarEliminar(gasto) {
  gastoSeleccionado.value = gasto;
  dialogoEliminar.value = true;
}

async function eliminarGasto() {
  eliminando.value = true;
  try {
    await gastoService.delete(gastoSeleccionado.value.id);
    
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Gasto eliminado',
      life: 3000
    });

    dialogoEliminar.value = false;
    await cargarGastos();

  } catch (error) {
    console.error('Error eliminando gasto:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Error al eliminar',
      life: 3000
    });
  } finally {
    eliminando.value = false;
  }
}

function verCategoriaCompleta(categoriaKey) {
  categoriaSeleccionada.value = categoriasAgrupadas.value[categoriaKey];
  categoriaSeleccionadaNombre.value = getNombreCategoriaCompleto(categoriaKey);
  dialogoCategoria.value = true;
}

function aplicarFiltros() {
  cargarGastos();
}

function limpiarFiltros() {
  filtros.value = {
    buscar: '',
    categoria: null,
    fecha_desde: null,
    fecha_hasta: null
  };
  cargarGastos();
}

function exportarExcel() {
  toast.add({
    severity: 'info',
    summary: 'Exportar',
    detail: 'Función de exportación en desarrollo',
    life: 3000
  });
}

// Carga inicial
onMounted(() => {
  cargarGastos();
});
</script>

<style scoped>
.gastos-container {
  padding: 1.5rem;
  background: #f8fafc;
  min-height: 100vh;
}

.dashboard-cards {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.stat-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
}

.categoria-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  height: 100%;
}

.categoria-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

:deep(.p-datatable) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  padding: 1rem;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: #f9fafb;
}

:deep(.p-toolbar) {
  border-radius: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 1rem;
}

:deep(.p-button) {
  border-radius: 8px;
}

:deep(.p-inputtext) {
  border-radius: 8px;
}

:deep(.p-dropdown) {
  border-radius: 8px;
}

:deep(.p-dialog-content) {
  padding: 1.5rem;
}

.text-primary { color: #3b82f6; }
.text-warning { color: #f59e0b; }
.text-success { color: #10b981; }
.text-danger { color: #ef4444; }
.text-green-500 { color: #10b981; }
.text-blue-500 { color: #3b82f6; }

@media (max-width: 768px) {
  .gastos-container {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stat-icon {
    font-size: 2rem;
  }
}
</style>