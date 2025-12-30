<template>
    <div class="card">
        <Toolbar class="mb-4">
            <template #start>
                <Button label="Nueva Modalidad" icon="pi pi-plus" severity="success"
                    @click="abrirDialogoModalidad" />
            </template>
        </Toolbar>

        <DataTable :value="modalidades" :loading="loading" dataKey="id" paginator :rows="10">
            <template #header>
                <h4 class="m-0">Gestión de Modalidades</h4>
            </template>

            <Column field="id" header="ID" sortable />
            <Column field="nombre" header="Nombre" sortable />
            <Column field="disciplina_nombre" header="Disciplina" sortable />
            <Column field="precio_mensual" header="Precio Mensual" sortable>
                <template #body="slotProps">
                    ${{ slotProps.data.precio_mensual }}
                </template>
            </Column>
            <Column field="descripcion" header="Descripción" sortable />
            <Column field="permisos_maximos" header="Permisos" sortable />
            <Column field="estado" header="Estado" sortable>
                <template #body="slotProps">
                    <Tag :value="slotProps.data.estado" 
                         :severity="slotProps.data.estado === 'activo' ? 'success' : 'danger'" />
                </template>
            </Column>

            <Column header="Acciones">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" rounded class="mr-2"
                        @click="editarModalidad(slotProps.data)" />
                    <Button icon="pi pi-trash" rounded severity="danger"
                        @click="confirmarEliminar(slotProps.data.id)" />
                </template>
            </Column>
        </DataTable>

        <Toast ref="toast" />

        <!-- Dialog Crear / Editar -->
        <Dialog v-model:visible="dialogoModalidad" modal header="Modalidad" :style="{ width: '35rem' }">
            <div class="flex flex-column gap-3 mb-3">
                <div class="p-fluid">
                    <div class="field">
                        <label for="disciplina">Disciplina *</label>
                        <Dropdown 
                            v-model="modalidad.disciplina_id" 
                            :options="disciplinas" 
                            optionLabel="nombre" 
                            optionValue="id" 
                            placeholder="Selecciona una disciplina"
                            :filter="true"
                            class="w-full"
                            :class="{ 'p-invalid': errors.disciplina_id }"
                        />
                        <small class="p-error" v-if="errors.disciplina_id">{{ errors.disciplina_id }}</small>
                    </div>

                    <div class="field">
                        <label for="nombre">Nombre de la Modalidad *</label>
                        <InputText 
                            id="nombre" 
                            v-model.trim="modalidad.nombre" 
                            class="w-full"
                            :class="{ 'p-invalid': errors.nombre }"
                        />
                        <small class="p-error" v-if="errors.nombre">{{ errors.nombre }}</small>
                    </div>

                    <div class="field">
                        <label for="precio">Precio Mensual ($) *</label>
                        <InputNumber 
                            id="precio" 
                            v-model="modalidad.precio_mensual" 
                            mode="currency" 
                            currency="USD" 
                            locale="en-US"
                            :min="0" 
                            class="w-full"
                            :class="{ 'p-invalid': errors.precio_mensual }"
                        />
                        <small class="p-error" v-if="errors.precio_mensual">{{ errors.precio_mensual }}</small>
                    </div>

                    <div class="field">
                        <label for="descripcion">Descripción</label>
                        <Textarea 
                            id="descripcion" 
                            v-model.trim="modalidad.descripcion" 
                            rows="3" 
                            class="w-full"
                            placeholder="Describe la modalidad..."
                        />
                    </div>

                    <div class="grid">
                        <div class="col-6">
                            <div class="field">
                                <label for="permisos">Permisos Máximos *</label>
                                <InputNumber 
                                    id="permisos" 
                                    v-model="modalidad.permisos_maximos" 
                                    :min="0" 
                                    :max="10" 
                                    showButtons
                                    class="w-full"
                                    :class="{ 'p-invalid': errors.permisos_maximos }"
                                />
                                <small class="p-error" v-if="errors.permisos_maximos">{{ errors.permisos_maximos }}</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="field">
                                <label for="estado">Estado *</label>
                                <Dropdown 
                                    id="estado"
                                    v-model="modalidad.estado" 
                                    :options="estados" 
                                    optionValue="value" 
                                    optionLabel="label" 
                                    placeholder="Selecciona estado"
                                    class="w-full"
                                    :class="{ 'p-invalid': errors.estado }"
                                />
                                <small class="p-error" v-if="errors.estado">{{ errors.estado }}</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-content-end gap-2">
                <Button label="Cancelar" severity="secondary" text @click="cerrarDialogo" />
                <Button label="Guardar" @click="guardarModalidad" />
            </div>
        </Dialog>

        <!-- Confirmar eliminación -->
        <Dialog v-model:visible="dialogoEliminar" header="Confirmar" modal :style="{ width: '350px' }">
            <p>¿Está seguro de eliminar esta modalidad?</p>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="dialogoEliminar = false" />
                <Button label="Sí" icon="pi pi-check" text severity="danger" @click="eliminarModalidad" />
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
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import modalidadService from '@/services/modalidad.service';
import disciplinaService from '@/services/disciplina.service';

// Variables reactivas
const modalidades = ref([]);
const disciplinas = ref([]);
const modalidad = ref({
    disciplina_id: null,
    nombre: '',
    precio_mensual: 0,
    descripcion: '',
    permisos_maximos: 3,
    estado: 'activo'
});

const estados = [
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' }
];

const dialogoModalidad = ref(false);
const dialogoEliminar = ref(false);
const modalidadEliminar = ref(null);
const toast = ref(null);
const loading = ref(false);
const errors = ref({});

onMounted(async () => {
    await Promise.all([
        listarModalidades(),
        cargarDisciplinas()
    ]);
});

const listarModalidades = async () => {
    loading.value = true;
    try {
        const response = await modalidadService.index();
        modalidades.value = response.data.map(mod => ({
            ...mod,
            disciplina_nombre: mod.disciplina ? mod.disciplina.nombre : 'Sin asignar'
        }));
    } finally {
        loading.value = false;
    }
};

const cargarDisciplinas = async () => {
    try {
        console.log('Cargando disciplinas...');
        const response = await disciplinaService.index(1, 100);
        
        // Quita el filtro por estado ya que no existe en tus datos
        disciplinas.value = response.data.data || response.data;
        
        console.log('Disciplinas cargadas:', disciplinas.value);
        
    } catch (error) {
        console.error('Error cargando disciplinas:', error);
        toast.value?.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'No se pudieron cargar las disciplinas', 
            life: 3000 
        });
    }
};

const abrirDialogoModalidad = () => {
    modalidad.value = {
        disciplina_id: null,
        nombre: '',
        precio_mensual: 0,
        descripcion: '',
        permisos_maximos: 3,
        estado: 'activo'
    };
    errors.value = {};
    dialogoModalidad.value = true;
};

const editarModalidad = (row) => {
    modalidad.value = { 
        ...row,
        disciplina_id: row.disciplina_id || (row.disciplina ? row.disciplina.id : null)
    };
    errors.value = {};
    dialogoModalidad.value = true;
};

const cerrarDialogo = () => {
    dialogoModalidad.value = false;
};

const validarFormulario = () => {
    errors.value = {};
    let isValid = true;

    if (!modalidad.value.disciplina_id) {
        errors.value.disciplina_id = 'La disciplina es requerida';
        isValid = false;
    }

    if (!modalidad.value.nombre || modalidad.value.nombre.trim() === '') {
        errors.value.nombre = 'El nombre es requerido';
        isValid = false;
    }

    if (!modalidad.value.precio_mensual || modalidad.value.precio_mensual <= 0) {
        errors.value.precio_mensual = 'El precio debe ser mayor a 0';
        isValid = false;
    }

    if (modalidad.value.permisos_maximos === null || modalidad.value.permisos_maximos < 0) {
        errors.value.permisos_maximos = 'Los permisos deben ser un número válido';
        isValid = false;
    }

    if (!modalidad.value.estado) {
        errors.value.estado = 'El estado es requerido';
        isValid = false;
    }

    return isValid;
};

const guardarModalidad = async () => {
    if (!validarFormulario()) return;

    try {
        if (modalidad.value.id) {
            await modalidadService.update(modalidad.value.id, modalidad.value);
            toast.value.add({ 
                severity: 'success', 
                summary: 'Éxito', 
                detail: 'Modalidad actualizada', 
                life: 3000 
            });
        } else {
            await modalidadService.store(modalidad.value);
            toast.value.add({ 
                severity: 'success', 
                summary: 'Éxito', 
                detail: 'Modalidad creada', 
                life: 3000 
            });
        }
        cerrarDialogo();
        await listarModalidades();
    } catch (error) {
        console.error('Error guardando modalidad:', error);
        const message = error.response?.data?.message || 'No se pudo guardar la modalidad';
        toast.value.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: message, 
            life: 3000 
        });
    }
};

const confirmarEliminar = (id) => {
    modalidadEliminar.value = id;
    dialogoEliminar.value = true;
};

const eliminarModalidad = async () => {
    try {
        await modalidadService.delete(modalidadEliminar.value);
        toast.value.add({ 
            severity: 'warn', 
            summary: 'Eliminado', 
            detail: 'Modalidad eliminada', 
            life: 3000 
        });
        await listarModalidades();
        dialogoEliminar.value = false;
        modalidadEliminar.value = null;
    } catch (error) {
        console.error('Error eliminando modalidad:', error);
        const message = error.response?.data?.message || 'No se pudo eliminar la modalidad';
        toast.value.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: message, 
            life: 3000 
        });
    }
};
</script>

<style scoped>
.field {
    margin-bottom: 1.5rem;
}

.p-fluid .field label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.p-error {
    font-size: 0.875rem;
}

.grid {
    margin-left: -0.5rem;
    margin-right: -0.5rem;
}

.col-6 {
    padding: 0 0.5rem;
}
</style>