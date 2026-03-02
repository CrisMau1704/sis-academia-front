<template>
  <section id="horarios" class="horarios">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">HORARIOS DE <span class="highlight">CLASES</span></h2>
        <p class="section-subtitle">Planifica tu entrenamiento según tu disponibilidad</p>
      </div>

      <div class="horarios-filters">
        <div class="filter-group">
          <label>Disciplina:</label>
          <Dropdown 
            v-model="filtroDisciplina" 
            :options="disciplinas" 
            optionLabel="nombre" 
            optionValue="id"
            placeholder="Todas las disciplinas"
            class="filter-dropdown"
          />
        </div>
        <div class="filter-group">
          <label>Día:</label>
          <Dropdown 
            v-model="filtroDia" 
            :options="diasSemana" 
            placeholder="Todos los días"
            class="filter-dropdown"
          />
        </div>
        <div class="filter-group">
          <label>Sucursal:</label>
          <Dropdown 
            v-model="filtroSucursal" 
            :options="sucursales" 
            optionLabel="nombre" 
            optionValue="id"
            placeholder="Todas las sucursales"
            class="filter-dropdown"
          />
        </div>
        <Button 
          label="Limpiar Filtros" 
          icon="pi pi-filter-slash"
          class="clear-filters-btn"
          @click="limpiarFiltros"
          text
        />
      </div>

      <div class="horarios-table">
        <DataTable :value="horariosFiltrados" :paginator="true" :rows="10" class="p-datatable-sm" stripedRows>
          <Column header="Día">
            <template #body="slotProps">
              <Tag :value="slotProps.data.dia_semana" :severity="getSeverityDia(slotProps.data.dia_semana)" />
            </template>
          </Column>
          <Column header="Horario">
            <template #body="slotProps">
              <div class="time-slot">
                <span class="time-start">{{ slotProps.data.hora_inicio }}</span>
                <i class="pi pi-arrow-right time-arrow"></i>
                <span class="time-end">{{ slotProps.data.hora_fin }}</span>
              </div>
            </template>
          </Column>
          <Column header="Clase">
            <template #body="slotProps">
              <div class="class-info">
                <h4>{{ slotProps.data.nombre }}</h4>
                <p class="class-disciplina">{{ slotProps.data.disciplina_nombre }}</p>
              </div>
            </template>
          </Column>
          <Column header="Entrenador">
            <template #body="slotProps">
              <div class="trainer-info">
                <Avatar 
                  :label="getIniciales(slotProps.data.entrenador_nombre)" 
                  class="mr-2" 
                  size="small" 
                  shape="circle" 
                />
                {{ slotProps.data.entrenador_nombre || 'Por asignar' }}
              </div>
            </template>
          </Column>
          <Column header="Sucursal">
            <template #body="slotProps">
              <Tag :value="slotProps.data.sucursal_nombre" severity="info" />
            </template>
          </Column>
          <Column header="Cupo">
            <template #body="slotProps">
              <div class="capacity-info">
                <ProgressBar 
                  :value="(slotProps.data.cupo_actual / slotProps.data.cupo_maximo) * 100" 
                  :showValue="false"
                />
                <span class="capacity-text">
                  {{ slotProps.data.cupo_actual }}/{{ slotProps.data.cupo_maximo }}
                </span>
              </div>
            </template>
          </Column>
          <Column header="Acción">
            <template #body="slotProps">
              <Button 
                label="Inscribirse" 
                icon="pi pi-user-plus"
                class="inscribirse-btn"
                @click="$emit('inscribirse', slotProps.data)"
                severity="danger"
                size="small"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import Avatar from 'primevue/avatar';

const props = defineProps({
  horarios: {
    type: Array,
    required: true
  },
  disciplinas: {
    type: Array,
    required: true
  },
  sucursales: {
    type: Array,
    required: true
  }
});

defineEmits(['inscribirse']);

const filtroDisciplina = ref(null);
const filtroDia = ref(null);
const filtroSucursal = ref(null);

const diasSemana = ref(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']);

const horariosFiltrados = computed(() => {
  let filtrados = props.horarios;

  if (filtroDisciplina.value) {
    filtrados = filtrados.filter(h => h.disciplina_id === filtroDisciplina.value);
  }

  if (filtroDia.value) {
    filtrados = filtrados.filter(h => h.dia_semana === filtroDia.value);
  }

  if (filtroSucursal.value) {
    filtrados = filtrados.filter(h => h.sucursal_id === filtroSucursal.value);
  }

  return filtrados;
});

function limpiarFiltros() {
  filtroDisciplina.value = null;
  filtroDia.value = null;
  filtroSucursal.value = null;
}

function getSeverityDia(dia) {
  const severidades = {
    'Lunes': 'info',
    'Martes': 'info',
    'Miércoles': 'info',
    'Jueves': 'info',
    'Viernes': 'info',
    'Sábado': 'warning',
    'Domingo': 'danger'
  };
  return severidades[dia] || 'secondary';
}

function getIniciales(nombreCompleto) {
  if (!nombreCompleto) return '?';
  const nombres = nombreCompleto.split(' ');
  if (nombres.length >= 2) {
    return (nombres[0][0] + nombres[1][0]).toUpperCase();
  }
  return nombres[0][0].toUpperCase();
}
</script>

<style scoped>
.horarios {
  background: #f8fafc;
  padding: 4rem 0;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.highlight {
  color: #dc2626;
}

.section-subtitle {
  color: #64748b;
  font-size: 1.2rem;
}

.horarios-filters {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #475569;
  font-weight: 500;
}

.filter-dropdown {
  width: 100%;
}

.clear-filters-btn {
  align-self: flex-end;
}

.horarios-table {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.time-slot {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-arrow {
  color: #94a3b8;
  font-size: 0.8rem;
}

.class-info h4 {
  margin: 0;
  color: #1e293b;
}

.class-disciplina {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.trainer-info {
  display: flex;
  align-items: center;
}

.capacity-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.capacity-text {
  font-size: 0.9rem;
  color: #64748b;
  text-align: center;
}

.inscribirse-btn {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important;
  border: none !important;
}

@media (max-width: 768px) {
  .horarios-filters {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>