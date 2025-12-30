<!-- src/views/admin/AsignarDias.vue -->
<template>
  <div class="asignar-dias">
    <h2>Asignar Días de Clase</h2>
    
    <div class="card">
      <DataTable :value="inscripciones" dataKey="id">
        <Column field="estudiante.nombre" header="Estudiante"></Column>
        <Column field="modalidad.nombre" header="Modalidad"></Column>
        <Column field="horario.nombre" header="Horario"></Column>
        <Column header="Días Disponibles">
          <template #body="slotProps">
            <div class="dias-checkbox">
              <div v-for="dia in diasSemana" :key="dia" class="field-checkbox">
                <Checkbox 
                  :id="`dia-${slotProps.data.id}-${dia}`" 
                  :value="dia" 
                  v-model="slotProps.data.diasSeleccionados" 
                />
                <label :for="`dia-${slotProps.data.id}-${dia}`">{{ dia }}</label>
              </div>
            </div>
          </template>
        </Column>
        <Column header="Acciones">
          <template #body="slotProps">
            <Button 
              icon="pi pi-save" 
              label="Guardar" 
              @click="guardarDias(slotProps.data)" 
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const inscripciones = ref([]);
const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

onMounted(async () => {
  await cargarInscripciones();
});

async function cargarInscripciones() {
  try {
    const response = await fetch('/api/inscripciones-pendientes-dias');
    inscripciones.value = await response.json();
    
    // Inicializar días seleccionados
    inscripciones.value.forEach(inscripcion => {
      inscripcion.diasSeleccionados = inscripcion.dias_asignados || [];
    });
  } catch (error) {
    console.error('Error cargando inscripciones:', error);
  }
}

async function guardarDias(inscripcion) {
  try {
    const response = await fetch(`/api/inscripciones/${inscripcion.id}/dias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dias: inscripcion.diasSeleccionados })
    });
    
    if (response.ok) {
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Días asignados correctamente',
        life: 3000
      });
      
      // Actualizar la lista
      await cargarInscripciones();
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron guardar los días',
      life: 3000
    });
  }
}
</script>

<style scoped>
.dias-checkbox {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>