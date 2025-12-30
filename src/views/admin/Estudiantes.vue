<template>
    <div class="card">
        <Toolbar class="mb-4">
            <template #start>
                <Button label="Nuevo Estudiante" icon="pi pi-plus" severity="success" class="mr-2"
                    @click="abrirDialogoEstudiante" />
            </template>
            <template #end>
                <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV" />
            </template>
        </Toolbar>

        <DataTable ref="dt" :value="estudiantes" dataKey="id" lazy :totalRecords="totalRecords" :loading="loading"
            :paginator="true" :rows="rows" @page="onPage"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[3, 10, 20]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} estudiantes">

            <template #header>
                <div class="flex align-items-center justify-content-between">
                    <h4 class="m-0">Gestión de Estudiantes</h4>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search"></i>
                        <InputText placeholder="Buscar..." v-model="buscar" @keypress.enter="listarEstudiantes" />
                    </span>
                </div>
            </template>

            <Column field="id" header="ID" sortable></Column>
            <Column field="nombres" header="Nombres" sortable></Column>
            <Column field="apellidos" header="Apellidos" sortable></Column>
            <Column field="ci" header="Carnet" sortable></Column>
            <Column field="correo" header="Cooreo" sortable></Column>
            <Column field="telefono" header="Teléfono"></Column>
            <Column field="direccion" header="Direccion" sortable></Column>
            <Column field="fecha_nacimiento" header="Fecha Nacimiento"></Column>
            <Column field="estado" header="Estado">
                <template #body="slotProps">
                    <span v-if="slotProps.data.estado === 'activo'" class="p-tag p-tag-success">Activo</span>
                    <span v-else class="p-tag p-tag-danger">Inactivo</span>
                </template>
            </Column>
            <Column header="Acciones">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" rounded class="mr-2" @click="editarEstudiante(slotProps.data)" />
                    <Button icon="pi pi-trash" rounded severity="danger"
                        @click="confirmarEliminar(slotProps.data.id)" />
                </template>
            </Column>
        </DataTable>

        <Toast ref="toast" />

        <!-- Dialogo para agregar o editar estudiante -->
        <Dialog v-model:visible="dialogoEstudiante" modal header="Estudiante" :style="{ width: '25rem' }">
            <div class="flex flex-column gap-3 mb-3">
                <label>Nombres</label>
                <InputText v-model.trim="estudiante.nombres" required />

                <label>Apellidos</label>
                <InputText v-model.trim="estudiante.apellidos" required />

                <label>Carnet de identidad</label>
                <InputText v-model.trim="estudiante.ci" required />

                <label>Correo electronico</label>
                <InputText v-model.trim="estudiante.correo" required />

                <label>Teléfono</label>
                <InputText v-model.trim="estudiante.telefono" />

                <label>Direccion</label>
                <InputText v-model.trim="estudiante.direccion" />

                <label>Fecha de Nacimiento</label>
                <Calendar v-model="estudiante.fecha_nacimiento" dateFormat="yy-mm-dd" />

                <label>Estado</label>
                <Dropdown v-model="estudiante.estado" :options="estados" optionValue="value" optionLabel="label"
                    placeholder="Selecciona estado" />

            </div>

            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancelar" severity="secondary" text @click="cerrarDialogo" />
                <Button type="button" label="Guardar" @click="guardarEstudiante" />
            </div>
        </Dialog>

        <!-- Dialogo de confirmación de eliminación -->
        <Dialog v-model:visible="dialogoEliminar" header="Confirmar" :modal="true" :style="{ width: '350px' }">
            <p>¿Está seguro de que desea eliminar este estudiante?</p>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="dialogoEliminar = false" />
                <Button label="Sí" icon="pi pi-check" text severity="danger" @click="eliminarEstudiante" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import estudianteService from '@/services/estudiante.service.js';

const estudiantes = ref([]);
const estudiante = ref({ nombres: '', apellidos: '', ci: '', correo: '', telefono: '', direccion: '', fecha_nacimiento: '', estado: 'activo' });
const buscar = ref('');
const dialogoEstudiante = ref(false);
const dialogoEliminar = ref(false);
const estudianteEliminar = ref(null);
const toast = ref(null);
const dt = ref(null);

const loading = ref(false);
const totalRecords = ref(0);
const rows = ref(10);

const estados = [
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' }
];

onMounted(() => {
    listarEstudiantes();
});

const listarEstudiantes = async () => {
    loading.value = true;
    try {
        const { data } = await estudianteService.index(1, rows.value, buscar.value);
        estudiantes.value = data.data;
        totalRecords.value = data.total;
    } catch (error) {
        console.error('Error al listar estudiantes:', error);
    } finally {
        loading.value = false;
    }
};

const abrirDialogoEstudiante = () => {
    estudiante.value = {
        nombres: '',
        apellidos: '',
        ci: '',
        correo: '',
        telefono: '',
        direccion: '',
        fecha_nacimiento: '',
        estado: 'activo'
    };
    dialogoEstudiante.value = true;
};

const cerrarDialogo = () => {
    dialogoEstudiante.value = false;
};

const editarEstudiante = (est) => {
    estudiante.value = { ...est };
    dialogoEstudiante.value = true;
};

const guardarEstudiante = async () => {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(estudiante.value.correo)) {
        toast.value.add({ severity: 'error', summary: 'Error', detail: 'Correo inválido', life: 3000 });
        return;
    }

    try {
        // Clonar el objeto para no modificar el original
        const payload = { ...estudiante.value };

        // Convertir fecha a formato MySQL YYYY-MM-DD
        if (payload.fecha_nacimiento) {
            const d = new Date(payload.fecha_nacimiento);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0'); // meses 0-11
            const dd = String(d.getDate()).padStart(2, '0');
            payload.fecha_nacimiento = `${yyyy}-${mm}-${dd}`;
        }

        if (payload.id) {
            await estudianteService.update(payload.id, payload);
        } else {
            await estudianteService.store(payload);
        }

        toast.value.add({ severity: 'success', summary: 'Éxito', detail: 'Estudiante guardado', life: 3000 });
        cerrarDialogo();
        listarEstudiantes();
    } catch (error) {
        console.error(error);
        toast.value.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar', life: 3000 });
    }
};



const confirmarEliminar = (id) => {
    estudianteEliminar.value = id;
    dialogoEliminar.value = true;
};

const eliminarEstudiante = async () => {
    console.log('ID a eliminar:', estudianteEliminar.value); // verificar valor
    try {
        await estudianteService.delete(estudianteEliminar.value);
        toast.value.add({ severity: 'warn', summary: 'Eliminado', detail: 'Estudiante eliminado', life: 3000 });
        listarEstudiantes();
        dialogoEliminar.value = false;
    } catch (error) {
        console.error(error.response ? error.response.data : error);
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
