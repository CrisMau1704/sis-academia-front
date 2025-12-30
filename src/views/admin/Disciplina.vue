<template>
    <div class="card">
        <Toolbar class="mb-4">
            <template #start>
                <Button label="Nueva Disciplina" icon="pi pi-plus" severity="success" class="mr-2"
                    @click="abrirDialogoDisciplina" />
            </template>
            <template #end>
                <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV" />
            </template>
        </Toolbar>

        <DataTable ref="dt" :value="disciplinas" dataKey="id" lazy :totalRecords="totalRecords" :loading="loading"
            :paginator="true" :rows="rows" @page="onPage"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[3, 10, 20]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} disciplia">

            <template #header>
                <div class="flex align-items-center justify-content-between">
                    <h4 class="m-0">Gestión de Disciplinas</h4>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search"></i>
                        <InputText placeholder="Buscar..." v-model="buscar" @keypress.enter="listarDisciplinas" />
                    </span>
                </div>
            </template>

            <Column field="id" header="ID" sortable></Column>
            <Column field="nombre" header="Nombres" sortable></Column>
            <Column field="descripcion" header="Descripcion" sortable></Column>
            
            


            
            <Column header="Acciones">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" rounded class="mr-2" @click="editarDisciplina(slotProps.data)" />
                    <Button icon="pi pi-trash" rounded severity="danger"
                        @click="confirmarEliminar(slotProps.data.id)" />
                </template>
            </Column>
        </DataTable>

        <Toast ref="toast" />


        <Dialog v-model:visible="dialogoDisciplina" modal header="Disciplina" :style="{ width: '25rem' }">
            <div class="flex flex-column gap-3 mb-3">
                <label>Nombre de la disciplina</label>
                <InputText v-model.trim="disciplina.nombre" required />
                <label>Descripcion</label>
                <InputText v-model.trim="disciplina.descripcion" required />

               


                
            </div>

            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancelar" severity="secondary" text @click="cerrarDialogo" />
                <Button type="button" label="Guardar" @click="guardarDisciplina" />
            </div>
        </Dialog>

        <!-- Dialogo de confirmación de eliminación -->
        <Dialog v-model:visible="dialogoEliminar" header="Confirmar" :modal="true" :style="{ width: '350px' }">
            <p>¿Está seguro de que desea eliminar esta Disciplina?</p>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="dialogoEliminar = false" />
                <Button label="Sí" icon="pi pi-check" text severity="danger" @click="eliminarDisciplina" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';

import disciplinaService  from '@/services/disciplina.service.js';




const disciplinas = ref([]);
const disciplina = ref({
    nombre: '',
    descripcion: '',
    
});
const buscar = ref('');
const dialogoDisciplina = ref(false);
const dialogoEliminar = ref(false);
const disciplinaEliminar = ref(null);
const toast = ref(null);
const dt = ref(null);

const loading = ref(false);
const totalRecords = ref(0);
const rows = ref(10);





onMounted(() => {
    listarDisciplinas();
});

const listarDisciplinas = async () => {
    loading.value = true;
    try {
        const { data } = await disciplinaService.index(1, rows.value, buscar.value);
        disciplinas.value = data.data;
        totalRecords.value = data.total;
    } catch (error) {
        console.error('Error al listar Disciplinas:', error);
    } finally {
        loading.value = false;
    }
};

const abrirDialogoDisciplina = () => {
    disciplina.value = {
        nombre: '',
        descripcion: '',
        
    };
    dialogoDisciplina.value = true;
};

const cerrarDialogo = () => {
    dialogoDisciplina.value = false;
};

const editarDisciplina = (est) => {
    disciplina.value = { ...est };
    dialogoDisciplina.value = true;
};

async function guardarDisciplina() {
    try {
        if (disciplina.value.id) {
            // Actualiza la disciplina existente
            await disciplinaService.update(disciplina.value.id, disciplina.value);
        } else {
            // Crea una nueva disciplina
            await disciplinaService.store(disciplina.value);
        }

        toast.value.add({ severity: 'success', summary: 'Éxito', detail: 'Disciplina guardada', life: 3000 });
        listarDisciplinas();
        cerrarDialogo();
    } catch (error) {
        console.error(error);
        toast.value.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar', life: 3000 });
    }
}





const confirmarEliminar = (id) => {
    disciplinaEliminar.value = id;
    dialogoEliminar.value = true;
};

const eliminarDisciplina = async () => {
    try {
        await disciplinaService.delete(disciplinaEliminar.value);
        toast.value.add({ severity: 'warn', summary: 'Eliminado', detail: 'Disciplina eliminado', life: 3000 });
        listarDisciplinas();
        dialogoEliminar.value = false;
    } catch (error) {
        toast.value.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar', life: 3000 });
    }
};

const onPage = (event) => {
    // Para paginación futura si implementas lazy loading
};
const exportCSV = () => {
    if (dt.value) dt.value.exportCSV();
};
</script>

<style scoped>
::v-deep(.p-datatable-thead > tr > th) {
    background-color: #65a8d4;
    color: white;
    font-weight: bold;
}
</style>
