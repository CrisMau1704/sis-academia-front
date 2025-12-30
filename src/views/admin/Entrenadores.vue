<template>
    <div class="card">
        <Toolbar class="mb-4">
            <template #start>
                <Button label="Nuevo Entrenador" icon="pi pi-plus" severity="success" class="mr-2"
                    @click="abrirDialogoEntrenador" />
            </template>
            <template #end>
                <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV" />
            </template>
        </Toolbar>

        <DataTable ref="dt" :value="entrenadores" dataKey="id" lazy :totalRecords="totalRecords" :loading="loading"
            :paginator="true" :rows="rows" @page="onPage"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[3, 10, 20]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} entrenadores">

            <template #header>
                <div class="flex align-items-center justify-content-between">
                    <h4 class="m-0">Gestión de Entrenadores</h4>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search"></i>
                        <InputText placeholder="Buscar..." v-model="buscar" @keypress.enter="listarEntrenadores" />
                    </span>
                </div>
            </template>

            <Column field="id" header="ID" sortable></Column>
            <Column field="nombres" header="Nombres" sortable></Column>
            <Column field="apellidos" header="Apellidos" sortable></Column>
            <Column field="telefono" header="Telefono" sortable></Column>
            <Column field="especialidad" header="Especialidad" sortable></Column>
            <Column field="fecha_contrato_inicio" header="Contrato inicio" sortable></Column>
            <Column field="fecha_contrato_fin" header="Contrato fin" sortable></Column>
            <Column header="Días restantes">
                <template #body="slotProps">
                    <span v-if="slotProps.data.fecha_contrato_fin">
                        {{
                            Math.max(
                                Math.ceil(
                                    (new Date(slotProps.data.fecha_contrato_fin) - new Date()) /
                                    (1000 * 60 * 60 * 24)
                        ),
                        0
                        )
                        }}
                    </span>
                    <span v-else>-</span>
                </template>
            </Column>


            <Column field="estado" header="Estado">
                <template #body="slotProps">
                    <span v-if="slotProps.data.estado === 'activo'" class="p-tag p-tag-success">Activo</span>
                    <span v-else class="p-tag p-tag-danger">Inactivo</span>
                </template>
            </Column>
            <Column header="Acciones">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" rounded class="mr-2" @click="editarEntrenador(slotProps.data)" />
                    <Button icon="pi pi-trash" rounded severity="danger"
                        @click="confirmarEliminar(slotProps.data.id)" />
                </template>
            </Column>
        </DataTable>

        <Toast ref="toast" />


        <Dialog v-model:visible="dialogoEntrenador" modal header="Entrenador" :style="{ width: '25rem' }">
            <div class="flex flex-column gap-3 mb-3">
                <label>Nombres</label>
                <InputText v-model.trim="entrenador.nombres" required />
                <label>Apellidos</label>
                <InputText v-model.trim="entrenador.apellidos" required />

                <label>Teléfono</label>
                <InputText v-model.trim="entrenador.telefono" />

                <label>Especialidad</label>
                <InputText v-model.trim="entrenador.especialidad" />
                <label>Fecha de inicio</label>
                <Calendar v-model="entrenador.fecha_contrato_inicio" dateFormat="yy-mm-dd" />
                <label>Fecha de final</label>
                <Calendar v-model="entrenador.fecha_contrato_fin" dateFormat="yy-mm-dd" />
                <!-- Mostrar número de días entre fechas -->
                <div v-if="diasContrato !== null" class="mt-2">
                    <strong>Días de contrato:</strong> {{ diasContrato }}
                </div>


                <label>Estado</label>
                <Dropdown v-model="entrenador.estado" :options="estados" optionValue="value" optionLabel="label"
                    placeholder="Selecciona estado" />

            </div>

            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancelar" severity="secondary" text @click="cerrarDialogo" />
                <Button type="button" label="Guardar" @click="guardarEntrenador" />
            </div>
        </Dialog>

        <!-- Dialogo de confirmación de eliminación -->
        <Dialog v-model:visible="dialogoEliminar" header="Confirmar" :modal="true" :style="{ width: '350px' }">
            <p>¿Está seguro de que desea eliminar esta entrenador?</p>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="dialogoEliminar = false" />
                <Button label="Sí" icon="pi pi-check" text severity="danger" @click="eliminarEntrenador" />
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

import entrenadorService from '@/services/entrenador.service.js';



const entrenadores = ref([]);
const entrenador = ref({
    nombres: '',
    apellidos: '',
    telefono: '',
    especialidad: '',
    fecha_contrato_inicio: null,
    fecha_contrato_fin: null,
    estado: 'activo'
});
const buscar = ref('');
const dialogoEntrenador = ref(false);
const dialogoEliminar = ref(false);
const entrenadorEliminar = ref(null);
const toast = ref(null);
const dt = ref(null);

const loading = ref(false);
const totalRecords = ref(0);
const rows = ref(10);

const estados = [
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' }
];


const diasContrato = computed(() => {
    if (entrenador.value.fecha_contrato_fin) {
        const hoy = new Date(); // fecha actual
        const fin = new Date(entrenador.value.fecha_contrato_fin);
        const diffTime = fin - hoy; // diferencia en milisegundos
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // convertir a días
        return diffDays >= 0 ? diffDays : 0; // si ya pasó, mostrar 0
    }
    return null; // no mostrar si no hay fecha de fin
});


onMounted(() => {
    listarEntrenadores();
});

const listarEntrenadores = async () => {
    loading.value = true;
    try {
        const { data } = await entrenadorService.index(1, rows.value, buscar.value);
        entrenadores.value = data.data;
        totalRecords.value = data.total;
    } catch (error) {
        console.error('Error al listar entrenadores:', error);
    } finally {
        loading.value = false;
    }
};

const abrirDialogoEntrenador = () => {
    entrenador.value = {
        nombres: '',
        apellidos: '',
        telefono: '',
        especialidad: '',
        fecha_contrato_inicio: '',
        fecha_contrato_fin: '',
        estado: 'activo'
    };
    dialogoEntrenador.value = true;
};

const cerrarDialogo = () => {
    dialogoEntrenador.value = false;
};

const editarEntrenador = (est) => {
    entrenador.value = { ...est };
    dialogoEntrenador.value = true;
};

async function guardarEntrenador() {
    try {
        // Clonar el objeto para no modificar el original
        const payload = { ...entrenador.value };

        // Estado: si es objeto {label, value}, tomar value
        payload.estado = typeof payload.estado === 'object' ? payload.estado.value : payload.estado;

        // Convertir fechas a formato YYYY-MM-DD
        if (payload.fecha_contrato_inicio) {
            const d = new Date(payload.fecha_contrato_inicio);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            payload.fecha_contrato_inicio = `${yyyy}-${mm}-${dd}`;
        }

        if (payload.fecha_contrato_fin) {
            const d = new Date(payload.fecha_contrato_fin);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            payload.fecha_contrato_fin = `${yyyy}-${mm}-${dd}`;
        }

        if (payload.id) {
            await entrenadorService.update(payload.id, payload);
        } else {
            await entrenadorService.store(payload);
        }

        toast.value.add({ severity: 'success', summary: 'Éxito', detail: 'Entrenador guardado', life: 3000 });
        listarEntrenadores();
        cerrarDialogo();
    } catch (error) {
        console.error(error);
        toast.value.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar', life: 3000 });
    }
};




const confirmarEliminar = (id) => {
    entrenadorEliminar.value = id;
    dialogoEliminar.value = true;
};

const eliminarEntrenador = async () => {
    try {
        await entrenadorService.delete(entrenadorEliminar.value);
        toast.value.add({ severity: 'warn', summary: 'Eliminado', detail: 'Entrenador eliminado', life: 3000 });
        listarEntrenadores();
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
