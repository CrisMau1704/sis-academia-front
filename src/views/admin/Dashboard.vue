<template>
  <div class="dashboard p-4">
    <!-- Filtros rápidos -->
    <div class="flex justify-content-between align-items-center mb-4">
      <div class="text-3xl font-bold text-900">Panel de Control - King Boxi Academy</div>
      <div class="flex gap-2">
        <Button label="Hoy" :class="{'p-button-outlined': activeFilter !== 'today'}" @click="setFilter('today')" />
        <Button label="Esta semana" :class="{'p-button-outlined': activeFilter !== 'week'}" @click="setFilter('week')" />
        <Button label="Este mes" :class="{'p-button-outlined': activeFilter !== 'month'}" @click="setFilter('month')" />
      </div>
    </div>

    <div class="grid">
      <!-- Tarjetas de resumen PRINCIPALES -->
      <div class="col-12 md:col-6 lg:col-3" v-for="card in summaryCards" :key="card.title">
        <Card class="dashboard-card shadow-3 hover:shadow-5 transition-all transition-duration-300">
          <template #title>
            <div class="flex align-items-center gap-2">
              <div class="card-icon" :style="{ backgroundColor: card.color + '20' }">
                <i :class="card.icon" :style="{ color: card.color }"></i>
              </div>
              <span class="text-sm font-medium text-500">{{ card.title }}</span>
            </div>
          </template>
          <template #content>
            <div class="flex justify-content-between align-items-end">
              <div>
                <div class="text-3xl font-bold mb-1">{{ card.value }}</div>
                <div class="text-sm" :class="card.trend === 'up' ? 'text-green-500' : 'text-red-500'">
                  <i :class="card.trend === 'up' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" class="mr-1"></i>
                  {{ card.percentage }}% vs ayer
                </div>
              </div>
              <div v-if="card.subtitle" class="text-right">
                <div class="text-sm text-500">{{ card.subtitle }}</div>
                <div class="text-lg font-semibold">{{ card.subvalue }}</div>
              </div>
            </div>
          </template>
          <template #footer v-if="card.footer">
            <div class="text-xs text-500">{{ card.footer }}</div>
          </template>
        </Card>
      </div>

      <!-- Gráfico principal: Estudiantes por modalidad -->
      <div class="col-12 lg:col-8 mt-4">
        <Card class="shadow-3">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <h3 class="m-0">Distribución de Estudiantes por Modalidad</h3>
              <Dropdown v-model="selectedChartPeriod" :options="chartPeriods" optionLabel="label" optionValue="value" 
                       class="w-10rem" />
            </div>
          </template>
          <template #content>
            <Chart type="bar" :data="studentsByModalityData" :options="barChartOptions" :height="300" />
          </template>
        </Card>
      </div>

      <!-- Estudiantes por vencer -->
      <div class="col-12 lg:col-4 mt-4">
        <Card class="shadow-3 h-full">
          <template #title>
            <h3 class="m-0">Próximos a Vencer (7 días)</h3>
          </template>
          <template #content>
            <div class="flex flex-column gap-3 max-h-30rem overflow-auto">
              <div v-for="student in expiringStudents" :key="student.id" 
                   class="p-3 border-round surface-card border-1 surface-border hover:surface-hover transition-all">
                <div class="flex justify-content-between align-items-start">
                  <div>
                    <div class="font-medium">{{ student.name }}</div>
                    <div class="text-sm text-500">{{ student.modality }}</div>
                    <div class="text-xs mt-1">
                      <i class="pi pi-calendar mr-1"></i>
                      Vence: {{ formatDate(student.expiryDate) }}
                    </div>
                  </div>
                  <div class="text-right">
                    <Tag :value="`${student.daysLeft} días`" 
                         :severity="getDaysSeverity(student.daysLeft)" />
                    <div class="text-xs text-500 mt-1">{{ student.classesRemaining }} clases restantes</div>
                  </div>
                </div>
                <Divider />
                <div class="flex justify-content-between text-xs">
                  <div>
                    <i class="pi pi-whatsapp mr-1 text-green-500"></i>
                    <span class="text-500">Notificado:</span>
                    <span class="ml-1" :class="student.notified ? 'text-green-500' : 'text-red-500'">
                      {{ student.notified ? 'Sí' : 'No' }}
                    </span>
                  </div>
                  <Button icon="pi pi-send" label="Recordar" class="p-button-text p-button-sm" 
                         @click="sendReminder(student)" />
                </div>
              </div>
            </div>
            <div v-if="expiringStudents.length === 0" class="text-center p-4">
              <i class="pi pi-check-circle text-3xl text-green-500 mb-3"></i>
              <p class="text-500">No hay estudiantes próximos a vencer</p>
            </div>
          </template>
        </Card>
      </div>

      <!-- Tabla de inscripciones recientes -->
      <div class="col-12 mt-4">
        <Card class="shadow-3">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <h3 class="m-0">Inscripciones Recientes</h3>
              <Button label="Ver todas" icon="pi pi-list" class="p-button-text" 
                     @click="$router.push('/inscripciones')" />
            </div>
          </template>
          <template #content>
            <DataTable :value="recentRegistrations" :paginator="true" :rows="5" responsiveLayout="scroll" class="p-datatable-sm">
              <Column field="id" header="ID" style="width: 70px"></Column>
              <Column header="Estudiante">
                <template #body="slotProps">
                  <div class="flex align-items-center gap-2">
                    <Avatar :label="getInitials(slotProps.data.student)" size="small" shape="circle" />
                    <div>
                      <div class="font-medium">{{ slotProps.data.student }}</div>
                      <div class="text-xs text-500">{{ slotProps.data.ci }}</div>
                    </div>
                  </div>
                </template>
              </Column>
              <Column field="modality" header="Modalidad">
                <template #body="slotProps">
                  <Tag :value="slotProps.data.modality" 
                       :severity="getModalitySeverity(slotProps.data.modality)" />
                </template>
              </Column>
              <Column header="Clases">
                <template #body="slotProps">
                  <div class="text-center">
                    <div>{{ slotProps.data.classesTaken }}/{{ slotProps.data.totalClasses }}</div>
                    <ProgressBar :value="(slotProps.data.classesTaken / slotProps.data.totalClasses) * 100" 
                               :showValue="false" style="height: 4px" />
                  </div>
                </template>
              </Column>
              <Column header="Permisos">
                <template #body="slotProps">
                  <div class="flex align-items-center gap-1">
                    <i class="pi" :class="slotProps.data.permissionsUsed > 0 ? 'pi-exclamation-circle text-orange-500' : 'pi-check-circle text-green-500'"></i>
                    {{ slotProps.data.permissionsUsed }}/{{ slotProps.data.totalPermissions }}
                  </div>
                </template>
              </Column>
              <Column field="expiryDate" header="Vence">
                <template #body="slotProps">
                  <div :class="getExpiryClass(slotProps.data.expiryDate)">
                    {{ formatDate(slotProps.data.expiryDate) }}
                  </div>
                </template>
              </Column>
              <Column header="Acciones" style="width: 120px">
                <template #body="slotProps">
                  <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm"
                         @click="viewDetails(slotProps.data)" />
                  <Button icon="pi pi-refresh" class="p-button-rounded p-button-text p-button-sm"
                         @click="renewMembership(slotProps.data)" 
                         :disabled="!canRenew(slotProps.data)" />
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>

      <!-- Métricas de asistencia -->
      <div class="col-12 md:col-6 mt-4">
        <Card class="shadow-3 h-full">
          <template #title>
            <h3 class="m-0">Asistencia por Día (Esta semana)</h3>
          </template>
          <template #content>
            <Chart type="line" :data="attendanceData" :options="lineChartOptions" :height="300" />
          </template>
        </Card>
      </div>

      <!-- Horarios con más asistencia -->
      <div class="col-12 md:col-6 mt-4">
        <Card class="shadow-3 h-full">
          <template #title>
            <h3 class="m-0">Horarios Más Solicitados</h3>
          </template>
          <template #content>
            <Chart type="polarArea" :data="popularHoursData" :options="polarChartOptions" :height="300" />
          </template>
        </Card>
      </div>

      <!-- Alertas y notificaciones -->
      <div class="col-12 mt-4">
        <Card class="shadow-3">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <h3 class="m-0">
                <i class="pi pi-bell mr-2 text-yellow-500"></i>
                Alertas del Sistema
              </h3>
              <Button icon="pi pi-refresh" class="p-button-text p-button-sm" @click="loadAlerts" />
            </div>
          </template>
          <template #content>
            <div class="grid">
              <div v-for="alert in systemAlerts" :key="alert.id" class="col-12 md:col-6 lg:col-4">
                <div class="p-3 border-round surface-card border-1 surface-border"
                     :style="{ borderLeft: `4px solid ${alert.severity === 'high' ? '#F44336' : alert.severity === 'medium' ? '#FF9800' : '#4CAF50'}` }">
                  <div class="flex justify-content-between align-items-start">
                    <div>
                      <div class="font-medium">{{ alert.title }}</div>
                      <div class="text-sm text-500 mt-1">{{ alert.description }}</div>
                    </div>
                    <Tag :value="alert.count" :severity="getAlertSeverity(alert.severity)" rounded />
                  </div>
                  <div class="mt-2">
                    <Button label="Resolver" icon="pi pi-check" class="p-button-sm p-button-text" 
                           @click="resolveAlert(alert)" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Quick Actions FAB -->
    <div class="quick-actions">
      <SpeedDial :model="quickActions" direction="up" :radius="80" 
                class="fixed" style="right: 2rem; bottom: 2rem;" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Avatar from 'primevue/avatar';
import Divider from 'primevue/divider';
import SpeedDial from 'primevue/speeddial';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

// Estados
const activeFilter = ref('today');
const selectedChartPeriod = ref('week');
const loading = ref(false);

// Filtros de periodo
const chartPeriods = ref([
  { label: 'Esta semana', value: 'week' },
  { label: 'Este mes', value: 'month' },
  { label: 'Este trimestre', value: 'quarter' },
  { label: 'Este año', value: 'year' }
]);

// Tarjetas de resumen adaptadas para gimnasio
const summaryCards = ref([
  { 
    title: 'Estudiantes Activos', 
    value: '156', 
    percentage: 8, 
    trend: 'up', 
    icon: 'pi pi-users', 
    color: '#4CAF50',
    subtitle: 'Nuevos hoy',
    subvalue: '3'
  },
  { 
    title: 'Inscripciones Pendientes', 
    value: '12', 
    percentage: 15, 
    trend: 'down', 
    icon: 'pi pi-clock', 
    color: '#FF9800',
    subtitle: 'Por vencer',
    subvalue: '5',
    footer: 'Próximos 7 días'
  },
  { 
    title: 'Ingresos del Mes', 
    value: 'Bs 24,800', 
    percentage: 12, 
    trend: 'up', 
    icon: 'pi pi-money-bill', 
    color: '#2196F3',
    subtitle: 'Promedio diario',
    subvalue: 'Bs 827'
  },
  { 
    title: 'Asistencia Hoy', 
    value: '78%', 
    percentage: 3, 
    trend: 'up', 
    icon: 'pi pi-calendar-check', 
    color: '#9C27B0',
    subtitle: 'Estudiantes',
    subvalue: '122/156',
    footer: 'Total de clases: 45'
  }
]);

// Estudiantes por vencer
const expiringStudents = ref([
  { id: 1, name: 'Juan Pérez', modality: 'King Boxer', expiryDate: '2024-01-20', daysLeft: 2, classesRemaining: 3, notified: false },
  { id: 2, name: 'María Gómez', modality: 'Karate', expiryDate: '2024-01-21', daysLeft: 3, classesRemaining: 1, notified: true },
  { id: 3, name: 'Carlos Ruiz', modality: 'MMA', expiryDate: '2024-01-22', daysLeft: 4, classesRemaining: 4, notified: false },
  { id: 4, name: 'Ana Fernández', modality: 'King Boxer', expiryDate: '2024-01-23', daysLeft: 5, classesRemaining: 2, notified: true },
]);

// Inscripciones recientes
const recentRegistrations = ref([
  { id: 1001, student: 'Luis Martínez', ci: '78945612', modality: 'King Boxer', classesTaken: 8, totalClasses: 12, permissionsUsed: 1, totalPermissions: 3, expiryDate: '2024-02-15' },
  { id: 1002, student: 'Sofía Vargas', ci: '65412378', modality: 'Karate', classesTaken: 10, totalClasses: 12, permissionsUsed: 0, totalPermissions: 3, expiryDate: '2024-02-10' },
  { id: 1003, student: 'Roberto Paz', ci: '12345678', modality: 'MMA', classesTaken: 5, totalClasses: 12, permissionsUsed: 2, totalPermissions: 3, expiryDate: '2024-02-20' },
  { id: 1004, student: 'Laura Méndez', ci: '87654321', modality: 'King Boxer', classesTaken: 11, totalClasses: 12, permissionsUsed: 3, totalPermissions: 3, expiryDate: '2024-02-05' },
  { id: 1005, student: 'Pedro Castro', ci: '45678912', modality: 'Karate', classesTaken: 7, totalClasses: 12, permissionsUsed: 1, totalPermissions: 3, expiryDate: '2024-02-12' },
]);

// Alertas del sistema
const systemAlerts = ref([
  { id: 1, title: 'Estudiantes por vencer', description: 'Membresías que expiran en menos de 7 días', count: 4, severity: 'medium' },
  { id: 2, title: 'Permisos agotados', description: 'Estudiantes sin permisos restantes', count: 3, severity: 'low' },
  { id: 3, title: 'Clases pendientes', description: 'Estudiantes con menos de 2 clases restantes', count: 7, severity: 'low' },
  { id: 4, title: 'Pagos pendientes', description: 'Inscripciones con pagos atrasados', count: 2, severity: 'high' },
  { id: 5, title: 'Notificaciones fallidas', description: 'Recordatorios no enviados', count: 1, severity: 'medium' },
  { id: 6, title: 'Cupos completos', description: 'Horarios sin disponibilidad', count: 3, severity: 'low' },
]);

// Acciones rápidas
const quickActions = ref([
  {
    label: 'Nueva Inscripción',
    icon: 'pi pi-user-plus',
    command: () => router.push('/inscripciones/nueva')
  },
  {
    label: 'Registrar Pago',
    icon: 'pi pi-money-bill',
    command: () => router.push('/pagos/nuevo')
  },
  {
    label: 'Tomar Asistencia',
    icon: 'pi pi-check-square',
    command: () => router.push('/asistencia')
  },
  {
    label: 'Generar Reporte',
    icon: 'pi pi-file-excel',
    command: () => generateReport()
  }
]);

// Datos para gráficos
const studentsByModalityData = ref({});
const attendanceData = ref({});
const popularHoursData = ref({});

// Opciones de gráficos
const barChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${context.raw} estudiantes`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
});

const lineChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
});

const polarChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
});

// Funciones auxiliares
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

function getModalitySeverity(modality) {
  const severities = {
    'King Boxer': 'danger',
    'Karate': 'info',
    'MMA': 'warning'
  };
  return severities[modality] || 'info';
}

function getDaysSeverity(days) {
  if (days <= 2) return 'danger';
  if (days <= 5) return 'warning';
  return 'success';
}

function getAlertSeverity(severity) {
  const map = { high: 'danger', medium: 'warning', low: 'info' };
  return map[severity] || 'info';
}

function getExpiryClass(dateString) {
  const expiryDate = new Date(dateString);
  const today = new Date();
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 'text-red-500 font-bold';
  if (diffDays <= 3) return 'text-orange-500 font-bold';
  if (diffDays <= 7) return 'text-yellow-500';
  return '';
}

function canRenew(registration) {
  const expiryDate = new Date(registration.expiryDate);
  const today = new Date();
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

// Funciones de acción
function setFilter(filter) {
  activeFilter.value = filter;
  loadDashboardData();
}

function sendReminder(student) {
  toast.add({
    severity: 'info',
    summary: 'Recordatorio enviado',
    detail: `Se envió recordatorio a ${student.name}`,
    life: 3000
  });
  student.notified = true;
}

function viewDetails(data) {
  router.push(`/estudiantes/${data.id}`);
}

function renewMembership(data) {
  toast.add({
    severity: 'success',
    summary: 'Renovación iniciada',
    detail: `Renovando membresía de ${data.student}`,
    life: 3000
  });
}

function resolveAlert(alert) {
  toast.add({
    severity: 'success',
    summary: 'Alerta resuelta',
    detail: alert.title,
    life: 3000
  });
  systemAlerts.value = systemAlerts.value.filter(a => a.id !== alert.id);
}

function generateReport() {
  toast.add({
    severity: 'info',
    summary: 'Generando reporte',
    detail: 'El reporte se descargará en breve',
    life: 3000
  });
}

function loadDashboardData() {
  // Cargar datos según el filtro activo
  loading.value = true;
  
  // Simular carga de datos
  setTimeout(() => {
    // Gráfico de estudiantes por modalidad
    studentsByModalityData.value = {
      labels: ['King Boxer', 'Karate', 'MMA', 'Combinado'],
      datasets: [
        {
          label: 'Estudiantes Activos',
          backgroundColor: ['#EF5350', '#42A5F5', '#FFA726', '#66BB6A'],
          borderColor: ['#EF5350', '#42A5F5', '#FFA726', '#66BB6A'],
          data: [68, 45, 32, 11]
        }
      ]
    };
    
    // Gráfico de asistencia
    attendanceData.value = {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      datasets: [
        {
          label: 'Asistencia',
          data: [85, 78, 92, 88, 76, 45],
          fill: true,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        }
      ]
    };
    
    // Gráfico de horarios populares
    popularHoursData.value = {
      labels: ['7:00 AM', '9:00 AM', '5:00 PM', '7:00 PM', '8:00 PM'],
      datasets: [
        {
          data: [15, 25, 35, 45, 30],
          backgroundColor: [
            'rgba(239, 83, 80, 0.7)',
            'rgba(66, 165, 245, 0.7)',
            'rgba(255, 167, 38, 0.7)',
            'rgba(102, 187, 106, 0.7)',
            'rgba(171, 71, 188, 0.7)'
          ]
        }
      ]
    };
    
    loading.value = false;
  }, 500);
}

function loadAlerts() {
  toast.add({
    severity: 'info',
    summary: 'Actualizando alertas',
    detail: 'Buscando nuevas alertas del sistema',
    life: 2000
  });
}

onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.dashboard {
  background-color: var(--surface-ground);
  min-height: 100vh;
}

.dashboard-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.max-h-30rem {
  max-height: 30rem;
}

.surface-hover:hover {
  background-color: var(--surface-hover);
  cursor: pointer;
}

.quick-actions {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

/* Responsive */
@media (max-width: 768px) {
  .text-3xl {
    font-size: 1.5rem;
  }
  
  .quick-actions {
    bottom: 1rem;
    right: 1rem;
  }
}

/* Animaciones */
.transition-all {
  transition-property: all;
}

.transition-duration-300 {
  transition-duration: 300ms;
}

.hover\:shadow-5:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
}
</style>