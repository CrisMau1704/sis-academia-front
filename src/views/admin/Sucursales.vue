<template>
    <div class="card">
        <Toolbar class="mb-4">
            <template #start>
                <Button label="Nueva Sucursal" icon="pi pi-plus" severity="success" class="mr-2"
                    @click="abrirDialogoSucursal" />
            </template>
            <template #end>
                <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV" />
            </template>
        </Toolbar>

        <DataTable ref="dt" :value="sucursales" dataKey="id" lazy :totalRecords="totalRecords" :loading="loading"
            :paginator="true" :rows="rows" @page="onPage"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[3, 10, 20]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} sucursales">

            <template #header>
                <div class="flex align-items-center justify-content-between">
                    <h4 class="m-0">Gestión de Sucursales</h4>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search"></i>
                        <InputText placeholder="Buscar..." v-model="buscar" @keypress.enter="listarSucursales" />
                    </span>
                </div>
            </template>

            <Column field="id" header="ID" sortable></Column>
            <Column field="nombre" header="Nombres" sortable></Column>
            <Column field="direccion" header="Direccion" sortable></Column>
            <Column field="estado" header="Estado">
                <template #body="slotProps">
                    <span v-if="slotProps.data.estado === 'activa'" class="p-tag p-tag-success">Activo</span>
                    <span v-else class="p-tag p-tag-danger">Inactivo</span>
                </template>
            </Column>
            <Column header="Acciones">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" rounded class="mr-2" @click="editarSucursal(slotProps.data)" />
                    <Button icon="pi pi-trash" rounded severity="danger"
                        @click="confirmarEliminar(slotProps.data.id)" />
                </template>
            </Column>
        </DataTable>

        <Toast ref="toast" />


        <Dialog v-model:visible="dialogoSucursal" modal header="Sucursal" :style="{ width: '25rem' }">
            <div class="flex flex-column gap-3 mb-3">
                <label>Nombres</label>
                <InputText v-model.trim="sucursal.nombre" required />

                <label>Direccion</label>
                <InputText v-model.trim="sucursal.direccion" />            

                <label>Teléfono</label>
                <InputText v-model.trim="sucursal.telefono" />


                <label>Estado</label>
                <Dropdown v-model="sucursal.estado" :options="estados" optionValue="value" optionLabel="label"
                    placeholder="Selecciona estado" />

            </div>

            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancelar" severity="secondary" text @click="cerrarDialogo" />
                <Button type="button" label="Guardar" @click="guardarSucursal" />
            </div>
        </Dialog>

        <!-- Dialogo de confirmación de eliminación -->
        <Dialog v-model:visible="dialogoEliminar" header="Confirmar" :modal="true" :style="{ width: '350px' }">
            <p>¿Está seguro de que desea eliminar esta sucursal?</p>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="dialogoEliminar = false" />
                <Button label="Sí" icon="pi pi-check" text severity="danger" @click="eliminarSucursal" />
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

import sucursalService from '@/services/sucursal.service.js';


const sucursales = ref([]);
const sucursal = ref({ nombres: '', direccion: '', telefono: '',  estado: 'activo' });
const buscar = ref('');
const dialogoSucursal = ref(false);
const dialogoEliminar = ref(false); 
const sucursalEliminar = ref(null);
const toast = ref(null);
const dt = ref(null);

const loading = ref(false);
const totalRecords = ref(0);
const rows = ref(10);

const estados = [
    { label: 'Activo', value: 'activa' },
    { label: 'Inactivo', value: 'inactiva' }
];

onMounted(() => {
    listarSucursales();
});

const listarSucursales = async () => {
    loading.value = true;
    try {
        const { data } = await sucursalService.index(1, rows.value, buscar.value);
     sucursales.value = data.data;
        totalRecords.value = data.total;
    } catch (error) {
        console.error('Error al listar sucursales:', error);
    } finally {
        loading.value = false;
    }
};

const abrirDialogoSucursal = () => {
    sucursal.value = {
        nombres: '',
        direccion: '',
        telefono: '',
        estado: 'activa'
    };
    dialogoSucursal.value = true;
};

const cerrarDialogo = () => {
    dialogoSucursal.value = false;
};

const editarSucursal = (est) => {
    sucursal.value = { ...est };
    dialogoSucursal.value = true;
};

async function guardarSucursal() {
    try {
        const payload = {
            ...sucursal.value,
            // Si es un objeto {label, value}, toma value; si ya es string, lo deja
            estado: typeof sucursal.value.estado === 'object' ? sucursal.value.estado.value : sucursal.value.estado
        };

        if (sucursal.value.id) {
            await sucursalService.update(sucursal.value.id, payload);
        } else {
            await sucursalService.store(payload);
        }

        toast.value.add({ severity: 'success', summary: 'Éxito', detail: 'Sucursal guardada', life: 3000 });
        listarSucursales();
        cerrarDialogo();
    } catch (error) {
        console.error(error); // Esto es clave para ver el mensaje real del backend
        toast.value.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar', life: 3000 });
    }
};





const confirmarEliminar = (id) => {
    sucursalEliminar.value = id;
    dialogoEliminar.value = true;
};

const eliminarSucursal = async () => {
    try {
        await sucursalService.delete(sucursalEliminar.value);
        toast.value.add({ severity: 'warn', summary: 'Eliminado', detail: 'Sucursal eliminado', life: 3000 });
        listarSucursales();
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
