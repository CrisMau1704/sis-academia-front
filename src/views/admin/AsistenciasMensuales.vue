<template>
  <div class="asistencias-mensuales-container">
    <!-- Header del Reporte -->
    <div class="mb-4">
      <div class="flex align-items-center justify-content-between mb-3">
        <div>
          <h2 class="m-0">
            <i class="pi pi-chart-bar mr-2 text-primary"></i>
            Reporte de Asistencia Mensual
          </h2>
          <p class="text-500 mt-2 m-0">
            Análisis de asistencia por mes, modalidad y sucursal
          </p>
        </div>
        <div class="flex gap-2">
          <Button label="Mes Anterior" icon="pi pi-arrow-left" severity="secondary" 
            @click="cambiarMes(-1)" />
          <Button label="Mes Siguiente" icon="pi pi-arrow-right" severity="secondary" 
            @click="cambiarMes(1)" />
        </div>
      </div>
    </div>

    <!-- Selector de Mes -->
    <Card class="mb-4">
      <template #content>
        <div class="grid">
          <div class="col-12 md:col-4">
            <div class="field">
              <label class="block mb-2">Mes y Año</label>
              <Calendar v-model="mesSeleccionado" view="month" dateFormat="mm/yy" 
                class="w-full" @date-select="cambiarMesSeleccionado" />
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="field">
              <label class="block mb-2">Modalidad</label>
              <Dropdown v-model="filtros.modalidad_id" :options="modalidades" 
                optionLabel="nombre" optionValue="id" placeholder="Todas" class="w-full" />
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="field">
              <label class="block mb-2">Sucursal</label>
              <Dropdown v-model="filtros.sucursal_id" :options="sucursales" 
                optionLabel="nombre" optionValue="id" placeholder="Todas" class="w-full" />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Dashboard de Asistencia -->
    <div class="grid mb-4">
      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #title>Total Asistencias</template>
          <template #content>
            <div class="stat-content">
              <i class="pi pi-check-circle stat-icon text-green-500"></i>
              <span class="stat-value">{{ estadisticas.totalAsistencias }}</span>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #title>Ausencias</template>
          <template #content>
            <div class="stat-content">
              <i class="pi pi-times-circle stat-icon text-red-500"></i>
              <span class="stat-value">{{ estadisticas.totalAusencias }}</span>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #title>Porcentaje Asistencia</template>
          <template #content>
            <div class="stat-content">
              <i class="pi pi-percentage stat-icon text-blue-500"></i>
              <span class="stat-value">{{ estadisticas.porcentajeAsistencia }}%</span>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #title>Estudiantes Activos</template>
          <template #content>
            <div class="stat-content">
              <i class="pi pi-users stat-icon text-purple-500"></i>
              <span class="stat-value">{{ estadisticas.estudiantesActivos }}</span>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- En el template, modifica las secciones de gráficos: -->

<!-- Gráfico Principal -->
<Card class="mb-4">
  <template #title>Evolución de Asistencia</template>
  <template #content>
    <div v-if="cargando" class="text-center p-4">
      <ProgressSpinner />
      <p class="text-500 mt-2">Cargando datos de asistencia...</p>
    </div>
    <div v-else-if="chartDataEvolucion.labels && chartDataEvolucion.labels.length > 0">
      <Chart type="line" :data="chartDataEvolucion" :options="chartOptionsLine" />
    </div>
    <div v-else class="text-center p-4">
      <p class="text-500">No hay datos disponibles para mostrar</p>
    </div>
  </template>
</Card>

<!-- Gráfico por Modalidad -->
<div class="col-12 md:col-6">
  <Card class="mb-4">
    <template #title>Asistencia por Modalidad</template>
    <template #content>
      <div v-if="chartDataModalidad.labels && chartDataModalidad.labels.length > 0">
        <Chart type="doughnut" :data="chartDataModalidad" :options="chartOptionsDoughnut" />
      </div>
      <div v-else class="text-center p-4">
        <p class="text-500">No hay datos por modalidad</p>
      </div>
    </template>
  </Card>
</div>

<!-- Gráfico por Día de la Semana -->
<div class="col-12 md:col-6">
  <Card class="mb-4">
    <template #title>Asistencia por Día de la Semana</template>
    <template #content>
      <div v-if="chartDataDias.labels && chartDataDias.labels.length > 0">
        <Chart type="bar" :data="chartDataDias" :options="chartOptionsBar" />
      </div>
      <div v-else class="text-center p-4">
        <p class="text-500">No hay datos por día</p>
      </div>
    </template>
  </Card>
</div>

    <!-- Top 10 Estudiantes -->
    <Card class="mb-4">
      <template #title>
        <div class="flex align-items-center justify-content-between">
          <span>Top 10 Estudiantes con Más Asistencia</span>
          <Tag :value="mesActualLabel" severity="info" />
        </div>
      </template>
      <template #content>
        <DataTable :value="topEstudiantes" class="p-datatable-sm">
          <Column header="Posición" style="width: 80px">
            <template #body="slotProps">
              <div class="text-center">
                <span v-if="slotProps.index < 3" class="font-bold text-lg">
                  {{ getMedalla(slotProps.index) }}
                </span>
                <span v-else class="font-medium">#{{ slotProps.index + 1 }}</span>
              </div>
            </template>
          </Column>
          
          <Column header="Estudiante">
            <template #body="slotProps">
              <div class="flex align-items-center">
                <Avatar :label="getIniciales(slotProps.data.estudiante_nombre)" 
                  size="small" shape="circle" class="mr-2" />
                <div>
                  <div class="font-medium">{{ slotProps.data.estudiante_nombre }}</div>
                  <small class="text-500">{{ slotProps.data.modalidad_nombre }}</small>
                </div>
              </div>
            </template>
          </Column>
          
          <Column header="Asistencias" style="width: 120px">
            <template #body="slotProps">
              <div class="text-right">
                <div class="font-bold text-green-600">{{ slotProps.data.asistencias }}</div>
                <ProgressBar :value="(slotProps.data.asistencias / maxAsistencias) * 100" 
                  :showValue="false" :style="{ height: '4px' }" />
              </div>
            </template>
          </Column>
          
          <Column header="Porcentaje" style="width: 120px">
            <template #body="slotProps">
              <div class="text-right">
                <Tag :value="`${slotProps.data.porcentaje}%`" 
                  :severity="getSeveridadPorcentaje(slotProps.data.porcentaje)" />
              </div>
            </template>
          </Column>
          
          <Column header="Última Asistencia" style="width: 140px">
            <template #body="slotProps">
              <div class="text-right">
                <small>{{ formatFecha(slotProps.data.ultima_asistencia) }}</small>
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Tabla Detallada -->
    <Card>
      <template #title>
        <div class="flex align-items-center justify-content-between">
          <span>Detalle de Asistencias por Estudiante</span>
          <div class="flex gap-2">
            <Button label="Exportar Excel" icon="pi pi-file-excel" severity="help" 
              @click="exportarExcel" size="small" />
            <Button label="Ver Todas" icon="pi pi-list" severity="secondary" 
              @click="verTodasAsistencias" size="small" />
          </div>
        </div>
      </template>
      <template #content>
        <DataTable :value="asistenciasDetalladas" :paginator="true" :rows="15" class="p-datatable-sm">
          <Column field="estudiante_nombre" header="Estudiante" :sortable="true"></Column>
          <Column field="modalidad_nombre" header="Modalidad" :sortable="true"></Column>
          <Column field="asistencias_mes" header="Asistencias" :sortable="true" style="width: 100px">
            <template #body="slotProps">
              <Tag :value="slotProps.data.asistencias_mes" 
                :severity="getSeveridadAsistencias(slotProps.data.asistencias_mes)" />
            </template>
          </Column>
          <Column field="ausencias_mes" header="Ausencias" :sortable="true" style="width: 100px">
            <template #body="slotProps">
              <Tag :value="slotProps.data.ausencias_mes" severity="danger" />
            </template>
          </Column>
          <Column field="porcentaje_asistencia" header="% Asistencia" :sortable="true" style="width: 120px">
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <ProgressBar :value="slotProps.data.porcentaje_asistencia" 
                  :showValue="false" :style="{ height: '6px', width: '60px' }" />
                <span>{{ slotProps.data.porcentaje_asistencia }}%</span>
              </div>
            </template>
          </Column>
          <Column field="promedio_semanal" header="Prom. Semanal" style="width: 120px">
            <template #body="slotProps">
              <div class="text-center">
                <span class="font-medium">{{ slotProps.data.promedio_semanal }}</span>
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

// Servicios (asumiendo que tienes servicio de asistencias)
import asistenciaService from '@/services/asistencia.service';
import inscripcionService from '@/services/inscripcion.service';
import sucursalService from '@/services/sucursal.service';
import modalidadService from '@/services/modalidad.service';

// Componentes
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import Chart from 'primevue/chart';

const toast = useToast();
const router = useRouter();

// Estados
const cargando = ref(false);
const mesSeleccionado = ref(new Date());
const asistencias = ref([]);
const modalidades = ref([]);
const sucursales = ref([]);

// Filtros
const filtros = ref({
  modalidad_id: null,
  sucursal_id: null
});

// Estadísticas
const estadisticas = ref({
  totalAsistencias: 0,
  totalAusencias: 0,
  porcentajeAsistencia: 0,
  estudiantesActivos: 0
});

// Computed
const mesActualLabel = computed(() => {
  return mesSeleccionado.value.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  }).toUpperCase();
});

const asistenciasFiltradas = computed(() => {
  let filtradas = asistencias.value;

  // Filtrar por mes seleccionado
  const mes = mesSeleccionado.value.getMonth() + 1;
  const año = mesSeleccionado.value.getFullYear();
  
  filtradas = filtradas.filter(a => {
    const fecha = new Date(a.fecha);
    return fecha.getMonth() + 1 === mes && fecha.getFullYear() === año;
  });

  // Filtrar por modalidad
  if (filtros.value.modalidad_id) {
    filtradas = filtradas.filter(a => a.modalidad_id === filtros.value.modalidad_id);
  }

  // Filtrar por sucursal
  if (filtros.value.sucursal_id) {
    filtradas = filtradas.filter(a => a.sucursal_id === filtros.value.sucursal_id);
  }

  return filtradas;
});

// En las importaciones, asegúrate de tener:

// import sucursalService from '@/services/sucursal.service'; // Si lo tienes

// Agrega estas funciones después de las otras funciones:
async function cargarModalidades() {
  try {
    const response = await modalidadService.index(1, 100, '', {
      estado: 'activo'
    });

    let datos = [];
    if (response.data?.success && Array.isArray(response.data.data)) {
      datos = response.data.data;
    } else if (Array.isArray(response.data)) {
      datos = response.data;
    }

    modalidades.value = datos.map(m => ({
      id: m.id,
      nombre: m.nombre,
      precio_mensual: m.precio_mensual
    }));

    // Agregar opción "Todas" al principio
    modalidades.value.unshift({ 
      id: null, 
      nombre: 'Todas las modalidades' 
    });

    console.log('Modalidades cargadas para asistencia:', modalidades.value.length);
  } catch (error) {
    console.error('Error cargando modalidades:', error);
  }
}

async function cargarSucursales() {
  try {
    console.log('🔄 Cargando sucursales desde API...');
    
    const response = await sucursalService.index(1, 100);
    
    let datos = [];
    if (response.data?.success && Array.isArray(response.data.data)) {
      datos = response.data.data;
    } else if (Array.isArray(response.data)) {
      datos = response.data;
    } else if (response.data?.items) {
      datos = response.data.items;
    }
    
    console.log(`✅ Sucursales cargadas desde API: ${datos.length}`);
    
    // Agregar opción "Todas" al principio
    sucursales.value = [
      { id: null, nombre: 'Todas las sucursales' },
      ...datos.map(s => ({
        id: s.id,
        nombre: s.nombre,
        direccion: s.direccion,
        telefono: s.telefono
      }))
    ];
    
  } catch (error) {
    console.error('❌ Error cargando sucursales:', error);
    
    // Si falla la API, usar las de asistencias como respaldo
    console.log('🔄 Intentando extraer sucursales de asistencias como respaldo...');
    extraerSucursalesDeAsistencias();
  }
}

// Agrega esta función para extraer sucursales de las asistencias:
function extraerSucursalesDeAsistencias() {
  console.log('🔍 Extrayendo sucursales de asistencias...');
  
  const sucursalesMap = {};
  let encontradas = 0;
  
  asistencias.value.forEach((asistencia, index) => {
    const sucursalId = asistencia.sucursal_id;
    const sucursalNombre = asistencia.sucursal_nombre || 'Sin sucursal';
    
    if (sucursalId && sucursalNombre !== 'Sin sucursal') {
      if (!sucursalesMap[sucursalId]) {
        sucursalesMap[sucursalId] = {
          id: sucursalId,
          nombre: sucursalNombre
        };
        encontradas++;
      }
    }
  });

  console.log(`✅ Encontradas ${encontradas} sucursales únicas`);

  // Convertir a array
  const sucursalesArray = Object.values(sucursalesMap);
  
  if (sucursalesArray.length === 0) {
    console.warn('⚠️ No se encontraron sucursales en los datos');
    
    // Agregar opciones de prueba
    sucursales.value = [
      { id: null, nombre: 'Todas las sucursales' },
      { id: 1, nombre: 'Sucursal Principal' },
      { id: 2, nombre: 'Sucursal Secundaria' }
    ];
  } else {
    // Agregar opción "Todas" al principio
    sucursales.value = [
      { id: null, nombre: 'Todas las sucursales' },
      ...sucursalesArray
    ];
  }
}

// Agrega esta función para extraer modalidades de las asistencias (como respaldo):
function extraerModalidadesDeAsistencias() {
  console.log('🔍 Extrayendo modalidades de asistencias...');
  
  const modalidadesMap = {};
  let encontradas = 0;
  
  asistencias.value.forEach(asistencia => {
    const modalidadId = asistencia.modalidad_id;
    const modalidadNombre = asistencia.modalidad_nombre || 'Sin modalidad';
    
    if (modalidadId && modalidadNombre !== 'Sin modalidad') {
      if (!modalidadesMap[modalidadId]) {
        modalidadesMap[modalidadId] = {
          id: modalidadId,
          nombre: modalidadNombre
        };
        encontradas++;
      }
    }
  });

  console.log(`✅ Encontradas ${encontradas} modalidades únicas`);

  // Si ya cargamos modalidades del servicio, no sobrescribir
  if (modalidades.value.length <= 1) { // Solo tiene la opción "Todas"
    const modalidadesArray = Object.values(modalidadesMap);
    
    if (modalidadesArray.length > 0) {
      modalidades.value = [
        { id: null, nombre: 'Todas las modalidades' },
        ...modalidadesArray
      ];
    }
  }
}

const asistenciasDetalladas = computed(() => {
  // Agrupar asistencias por estudiante para el mes actual
  const agrupadas = {};
  
  asistenciasFiltradas.value.forEach(asistencia => {
    const key = asistencia.estudiante_id;
    
    if (!agrupadas[key]) {
      agrupadas[key] = {
        estudiante_id: asistencia.estudiante_id,
        estudiante_nombre: asistencia.estudiante_nombre,
        modalidad_nombre: asistencia.modalidad_nombre,
        asistencias_mes: 0,
        ausencias_mes: 0,
        total_clases: 0
      };
    }
    
    if (asistencia.estado === 'asistio') {
      agrupadas[key].asistencias_mes++;
    } else if (asistencia.estado === 'ausente') {
      agrupadas[key].ausencias_mes++;
    }
    
    agrupadas[key].total_clases = agrupadas[key].asistencias_mes + agrupadas[key].ausencias_mes;
  });

  // Calcular porcentajes y promedios
  return Object.values(agrupadas).map(estudiante => {
    const porcentaje = estudiante.total_clases > 0 
      ? Math.round((estudiante.asistencias_mes / estudiante.total_clases) * 100)
      : 0;
    
    const promedioSemanal = Math.round(estudiante.asistencias_mes / 4); // Aprox 4 semanas
    
    return {
      ...estudiante,
      porcentaje_asistencia: porcentaje,
      promedio_semanal: promedioSemanal
    };
  }).sort((a, b) => b.porcentaje_asistencia - a.porcentaje_asistencia);
});

const topEstudiantes = computed(() => {
  return asistenciasDetalladas.value
    .slice(0, 10) // Top 10
    .map((est, index) => ({
      ...est,
      posicion: index + 1
    }));
});

const maxAsistencias = computed(() => {
  if (topEstudiantes.value.length === 0) return 1;
  return Math.max(...topEstudiantes.value.map(e => e.asistencias_mes));
});

// Datos para gráficos
// En el script, inicializa los datos de gráficos como objetos vacíos:
const chartDataEvolucion = ref({
  labels: [],
  datasets: []
});

const chartDataModalidad = ref({
  labels: [],
  datasets: []
});

const chartDataDias = ref({
  labels: [],
  datasets: []
});

const chartOptionsLine = ref({
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    }
  }
});

const chartOptionsDoughnut = ref({
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
});

const chartOptionsBar = ref({
  responsive: true,
  scales: {
    y: {
      beginAtZero: true
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
});

// Funciones
async function cargarDatos() {
  cargando.value = true;
  try {
    // 1. Cargar modalidades primero
    await cargarModalidades();

    await cargarSucursales();
    
    // 2. Cargar asistencias
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
    
    const response = await asistenciaService.index(1, 1000, '', {
      fecha_desde: seisMesesAtras.toISOString().split('T')[0],
      include: 'estudiante,modalidad,sucursal'
    });

    let datos = [];
    if (response.data?.success && Array.isArray(response.data.data)) {
      datos = response.data.data;
    } else if (Array.isArray(response.data)) {
      datos = response.data;
    }

    // 3. Procesar asistencias
    // En tu función cargarDatos(), modifica el mapeo de asistencias:
asistencias.value = datos.map(a => {
  console.log('📋 Registro crudo para debug:', a); // Agrega esto para ver la estructura
  
  return {
    id: a.id,
    estudiante_id: a.estudiante_id,
    estudiante_nombre: a.estudiante_nombre || `${a.estudiante?.nombres || ''} ${a.estudiante?.apellidos || ''}`.trim(),
    modalidad_id: a.modalidad_id,
    modalidad_nombre: a.modalidad_nombre || a.modalidad?.nombre || 'Sin modalidad',
    sucursal_id: a.sucursal_id,
    sucursal_nombre: a.sucursal_nombre || a.sucursal?.nombre || 'Sin sucursal',
    fecha: a.fecha,
    estado: a.estado,
    hora_entrada: a.hora_entrada,
    hora_salida: a.hora_salida
  };
});

    console.log('📊 Asistencias cargadas:', asistencias.value.length);

    // 4. Extraer sucursales y asegurar modalidades
    extraerSucursalesDeAsistencias();
    extraerModalidadesDeAsistencias();

    // 5. Calcular estadísticas
    calcularEstadisticas();
    actualizarGraficos();

    toast.add({
      severity: 'success',
      summary: 'Datos cargados',
      detail: `Se cargaron ${asistencias.value.length} registros de asistencia`,
      life: 3000
    });

  } catch (error) {
    console.error('Error cargando asistencias:', error);
    
    // Si el servicio de asistencias no funciona, usa datos de prueba
    if (!asistenciaService || error.message.includes('asistenciaService')) {
      cargarDatosDePrueba();
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los datos de asistencia',
        life: 3000
      });
    }
  } finally {
    cargando.value = false;
  }
}

function calcularEstadisticas() {
  const asistenciasMes = asistenciasFiltradas.value;
  
  const totalAsistencias = asistenciasMes.filter(a => a.estado === 'asistio').length;
  const totalAusencias = asistenciasMes.filter(a => a.estado === 'ausente').length;
  const totalRegistros = totalAsistencias + totalAusencias;
  
  const porcentajeAsistencia = totalRegistros > 0 
    ? Math.round((totalAsistencias / totalRegistros) * 100)
    : 0;
  
  // Contar estudiantes únicos con asistencia este mes
  const estudiantesUnicos = new Set(asistenciasMes.map(a => a.estudiante_id));
  
  estadisticas.value = {
    totalAsistencias,
    totalAusencias,
    porcentajeAsistencia,
    estudiantesActivos: estudiantesUnicos.size
  };
}

function actualizarGraficos() {
  // Gráfico de evolución (últimos 6 meses)
  const meses = [];
  const asistenciasPorMes = [];
  const ausenciasPorMes = [];
  
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - i);
    
    const mes = fecha.toLocaleDateString('es-ES', { month: 'short' });
    meses.push(mes.charAt(0).toUpperCase() + mes.slice(1));
    
    const asistenciasMes = asistencias.value.filter(a => {
      const fechaAsistencia = new Date(a.fecha);
      return fechaAsistencia.getMonth() === fecha.getMonth() && 
             fechaAsistencia.getFullYear() === fecha.getFullYear();
    });
    
    asistenciasPorMes.push(asistenciasMes.filter(a => a.estado === 'asistio').length);
    ausenciasPorMes.push(asistenciasMes.filter(a => a.estado === 'ausente').length);
  }
  
  chartDataEvolucion.value = {
    labels: meses,
    datasets: [
      {
        label: 'Asistencias',
        data: asistenciasPorMes,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true
      },
      {
        label: 'Ausencias',
        data: ausenciasPorMes,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true
      }
    ]
  };

  // Gráfico por modalidad (doughnut)
  const modalidadesMap = {};
  asistenciasFiltradas.value.forEach(a => {
    const modalidad = a.modalidad_nombre;
    if (!modalidadesMap[modalidad]) modalidadesMap[modalidad] = 0;
    if (a.estado === 'asistio') modalidadesMap[modalidad]++;
  });
  
  chartDataModalidad.value = {
    labels: Object.keys(modalidadesMap),
    datasets: [{
      data: Object.values(modalidadesMap),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
        '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
      ]
    }]
  };

  // Gráfico por día de la semana
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const asistenciasPorDia = [0, 0, 0, 0, 0, 0, 0];
  
  asistenciasFiltradas.value.forEach(a => {
    if (a.estado === 'asistio') {
      const fecha = new Date(a.fecha);
      const dia = fecha.getDay(); // 0=Dom, 1=Lun, ...
      const index = dia === 0 ? 6 : dia - 1; // Ajustar para que Lun=0
      asistenciasPorDia[index]++;
    }
  });
  
  chartDataDias.value = {
    labels: diasSemana,
    datasets: [{
      label: 'Asistencias',
      data: asistenciasPorDia,
      backgroundColor: '#3B82F6'
    }]
  };
}

function cambiarMes(incremento) {
  const nuevaFecha = new Date(mesSeleccionado.value);
  nuevaFecha.setMonth(nuevaFecha.getMonth() + incremento);
  mesSeleccionado.value = nuevaFecha;
  
  calcularEstadisticas();
  actualizarGraficos();
}

function cambiarMesSeleccionado() {
  calcularEstadisticas();
  actualizarGraficos();
}

function getMedalla(posicion) {
  switch (posicion) {
    case 0: return '🥇';
    case 1: return '🥈';
    case 2: return '🥉';
    default: return `#${posicion + 1}`;
  }
}

function getSeveridadPorcentaje(porcentaje) {
  if (porcentaje >= 90) return 'success';
  if (porcentaje >= 70) return 'info';
  if (porcentaje >= 50) return 'warning';
  return 'danger';
}

function getSeveridadAsistencias(cantidad) {
  if (cantidad >= 16) return 'success';
  if (cantidad >= 12) return 'info';
  if (cantidad >= 8) return 'warning';
  return 'danger';
}

function getIniciales(nombre) {
  if (!nombre) return '?';
  const partes = nombre.split(' ');
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return partes[0][0].toUpperCase();
}

function formatFecha(fecha) {
  if (!fecha) return '--';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit'
  });
}

function exportarExcel() {
  toast.add({
    severity: 'info',
    summary: 'Exportar Excel',
    detail: 'Funcionalidad de exportación en desarrollo',
    life: 3000
  });
}

function verTodasAsistencias() {
  router.push('/admin/asistencias');
}

onMounted(() => {
  cargarDatos();
});
</script>

<style scoped>
.asistencias-mensuales-container {
  padding: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

.stat-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
  height: 100%;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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

.stat-card:nth-child(1) { --card-color: #10b981; }
.stat-card:nth-child(2) { --card-color: #ef4444; }
.stat-card:nth-child(3) { --card-color: #3b82f6; }
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

@media (max-width: 768px) {
  .asistencias-mensuales-container {
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
</style>