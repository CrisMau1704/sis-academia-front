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

        <DataTable ref="dt" :value="estudiantes" dataKey="id" :loading="loading" :paginator="true" :rows="rowsPerPage"
            :totalRecords="totalRecords" @page="onPageChange"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[10, 20, 50, 100]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} estudiantes">

            <template #header>
                <div class="flex align-items-center justify-content-between">
                    <h4 class="m-0">Gestión de Estudiantes</h4>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search"></i>
                        <InputText placeholder="Buscar por nombre, apellido, CI o correo..." v-model="buscar"
                            @keyup.enter="onSearch" @input="onSearchDebounced" />
                    </span>
                </div>
            </template>

            <Column field="id" header="ID" :sortable="true" style="width: 70px">
                <template #body="slotProps">
                    {{ slotProps.data.id }}
                </template>
            </Column>

            <Column field="nombres" header="Nombres" :sortable="true">
                <template #body="slotProps">
                    {{ slotProps.data.nombres }}
                </template>
            </Column>

            <Column field="apellidos" header="Apellidos" :sortable="true">
                <template #body="slotProps">
                    {{ slotProps.data.apellidos }}
                </template>
            </Column>

            <Column field="ci" header="CI" :sortable="true">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.ci" severity="info" />
                </template>
            </Column>

            <Column field="correo" header="Correo" :sortable="true">
                <template #body="slotProps">
                    <a :href="`mailto:${slotProps.data.correo}`" class="text-primary hover:underline">
                        {{ slotProps.data.correo }}
                    </a>
                </template>
            </Column>

            <Column field="telefono" header="Teléfono">
                <template #body="slotProps">
                    <div class="flex align-items-center gap-1">
                        <i class="pi pi-phone text-primary"></i>
                        <span>{{ slotProps.data.telefono || 'No especificado' }}</span>
                    </div>
                </template>
            </Column>

            <Column field="direccion" header="Dirección">
                <template #body="slotProps">
                    <span class="text-500">{{ slotProps.data.direccion || 'No especificada' }}</span>
                </template>
            </Column>

            <Column field="fecha_nacimiento" header="Fecha Nacimiento">
                <template #body="slotProps">
                    {{ formatFecha(slotProps.data.fecha_nacimiento) }}
                </template>
            </Column>
<Column header="Antigüedad" style="width: 200px">
    <template #body="slotProps">
        <div v-if="slotProps.data.antiguedad && slotProps.data.antiguedad.dias_totales > 0" class="flex flex-column">
            <!-- Mostrar días totales y texto amigable -->
            <span class="font-medium text-primary" style="font-size: 1.1rem;">
                {{ slotProps.data.antiguedad.dias_totales }} días
            </span>
            <small class="text-500">
                {{ slotProps.data.antiguedad.texto_amigable }}
            </small>
            <small class="text-500">
                Desde {{ slotProps.data.antiguedad.fecha_inicio }}
            </small>
            <div class="flex gap-2 mt-1">
                <small v-if="slotProps.data.antiguedad.renovaciones > 0" 
                       class="text-green-600 font-semibold">
                    {{ slotProps.data.antiguedad.renovaciones }} renov.
                </small>
                <small class="text-blue-600">
                    {{ slotProps.data.antiguedad.inscripciones_totales }} períodos
                </small>
            </div>
        </div>
        <div v-else-if="slotProps.data.antiguedad" class="text-500">
            Sin inscripción
        </div>
        <span v-else class="text-500">Sin datos</span>
    </template>
</Column>

                <Column field="estado" header="Estado">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.estado === 'activo' ? 'Activo' : 'Inactivo'"
                            :severity="slotProps.data.estado === 'activo' ? 'success' : 'danger'" />
                    </template>
                </Column>

                <Column header="Acciones" style="width: 120px">
                    <template #body="slotProps">
                        <div class="flex gap-1">
                            <Button icon="pi pi-pencil" rounded class="p-button-sm p-button-text"
                                @click="editarEstudiante(slotProps.data)" v-tooltip="'Editar'" />
                            <Button icon="pi pi-trash" rounded severity="danger" class="p-button-sm p-button-text"
                                @click="confirmarEliminar(slotProps.data.id, slotProps.data.nombres, slotProps.data.apellidos)"
                                v-tooltip="'Eliminar'" />
                        </div>
                    </template>
                </Column>
        </DataTable>

        <!-- Dialogo para agregar o editar estudiante -->
        <Dialog v-model:visible="dialogoEstudiante" modal :header="dialogoTitulo" :style="{ width: '450px' }">
            <div class="flex flex-column gap-3">
                <div class="field">
                    <label for="nombres" class="font-medium text-900">Nombres *</label>
                    <InputText id="nombres" v-model.trim="estudianteForm.nombres" class="w-full"
                        :class="{ 'p-invalid': errors.nombres }" required />
                    <small v-if="errors.nombres" class="p-error">{{ errors.nombres }}</small>
                </div>

                <div class="field">
                    <label for="apellidos" class="font-medium text-900">Apellidos *</label>
                    <InputText id="apellidos" v-model.trim="estudianteForm.apellidos" class="w-full"
                        :class="{ 'p-invalid': errors.apellidos }" required />
                    <small v-if="errors.apellidos" class="p-error">{{ errors.apellidos }}</small>
                </div>

                <div class="field">
                    <label for="ci" class="font-medium text-900">Carnet de Identidad *</label>
                    <InputText id="ci" v-model.trim="estudianteForm.ci" class="w-full"
                        :class="{ 'p-invalid': errors.ci }" required />
                    <small v-if="errors.ci" class="p-error">{{ errors.ci }}</small>
                </div>

                <div class="field">
                    <label for="correo" class="font-medium text-900">Correo Electrónico *</label>
                    <InputText id="correo" v-model.trim="estudianteForm.correo" class="w-full"
                        :class="{ 'p-invalid': errors.correo }" type="email" required />
                    <small v-if="errors.correo" class="p-error">{{ errors.correo }}</small>
                </div>

                <div class="field">
                    <label for="telefono" class="font-medium text-900">Teléfono</label>
                    <InputText id="telefono" v-model.trim="estudianteForm.telefono" class="w-full" />
                </div>

                <div class="field">
                    <label for="direccion" class="font-medium text-900">Dirección</label>
                    <InputText id="direccion" v-model.trim="estudianteForm.direccion" class="w-full" />
                </div>

                <div class="field">
                    <label for="fecha_nacimiento" class="font-medium text-900">Fecha de Nacimiento</label>
                    <Calendar id="fecha_nacimiento" v-model="estudianteForm.fecha_nacimiento" dateFormat="dd/mm/yy"
                        class="w-full" showIcon />
                </div>

                <div class="field">
                    <label for="estado" class="font-medium text-900">Estado</label>
                    <Dropdown id="estado" v-model="estudianteForm.estado" :options="estados" optionValue="value"
                        optionLabel="label" placeholder="Selecciona estado" class="w-full" />
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" severity="secondary" @click="cerrarDialogo" />
                <Button label="Guardar" icon="pi pi-check" severity="success" @click="guardarEstudiante"
                    :loading="guardando" />
            </template>
        </Dialog>

        <!-- Dialogo de confirmación de eliminación -->
        <Dialog v-model:visible="dialogoEliminar" header="Confirmar Eliminación" :modal="true"
            :style="{ width: '450px' }">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: #f0ad4e;" />
                <span v-if="estudianteAEliminar">
                    ¿Está seguro de que desea eliminar al estudiante
                    <strong>{{ estudianteAEliminar.nombres }} {{ estudianteAEliminar.apellidos }}</strong>?
                    <br><br>
                    <small class="text-500">Esta acción no se puede deshacer.</small>
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" severity="secondary" @click="dialogoEliminar = false" />
                <Button label="Sí, eliminar" icon="pi pi-check" severity="danger" @click="eliminarEstudiante"
                    :loading="eliminando" />
            </template>
        </Dialog>

        <Toast />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Toast from 'primevue/toast';
import estudianteService from '@/services/estudiante.service.js';

const toast = useToast();

// Estados
const estudiantes = ref([]);
const estudianteForm = ref({
    nombres: '',
    apellidos: '',
    ci: '',
    correo: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: null,
    estado: 'activo'
});
const buscar = ref('');
const dialogoEstudiante = ref(false);
const dialogoEliminar = ref(false);
const estudianteAEliminar = ref(null);
const loading = ref(false);
const guardando = ref(false);
const eliminando = ref(false);
const totalRecords = ref(0);
const rowsPerPage = ref(10);
const currentPage = ref(1);
const errors = ref({});
const dialogoTitulo = ref('Nuevo Estudiante');
const dt = ref(null);

// Estados para dropdown
const estados = [
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' }
];

onMounted(() => {
    listarEstudiantes();
});

// Función para listar estudiantes con paginación
// Función para listar estudiantes con paginación
const listarEstudiantes = async () => {
    loading.value = true;
    try {
        const response = await estudianteService.index(
            currentPage.value,
            rowsPerPage.value,
            buscar.value,
            true
        );

        if (response.data) {
            let datosEstudiantes = [];

            if (response.data.data && Array.isArray(response.data.data)) {
                datosEstudiantes = response.data.data;
                totalRecords.value = response.data.meta?.total || response.data.total || 0;
            } else if (response.data.success && Array.isArray(response.data.data)) {
                datosEstudiantes = response.data.data;
                totalRecords.value = response.data.meta?.total || response.data.total || 0;
            }

            // Procesar estudiantes para calcular antigüedad
            estudiantes.value = datosEstudiantes.map(est => ({
                ...est,
                antiguedad: calcularAntiguedadFrontend(est)
            }));

            console.log(`📊 ${estudiantes.value.length} estudiantes cargados con antigüedad`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        loading.value = false;
    }
};


const calcularAntiguedadFrontend = (estudiante) => {
    console.log(`📊 Calculando para estudiante ${estudiante.id}`, estudiante.inscripciones);
    
    // Si NO tiene inscripciones
    if (!estudiante.inscripciones || !Array.isArray(estudiante.inscripciones) || estudiante.inscripciones.length === 0) {
        return {
            texto: 'Sin inscripción',
            fecha_inicio: null,
            dias_totales: 0,
            renovaciones: 0,
            inscripciones_totales: 0
        };
    }
    
    // Ordenar por fecha (más antigua primero)
    const inscripcionesOrdenadas = [...estudiante.inscripciones]
        .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
    
    let diasTotales = 0;
    let primeraFecha = null;
    let detallesPeriodos = [];
    
    // **CALCULAR EXACTAMENTE CADA PERÍODO**
    inscripcionesOrdenadas.forEach((inscripcion, index) => {
        const inicio = new Date(inscripcion.fecha_inicio);
        const fin = new Date(inscripcion.fecha_fin);
        
        if (index === 0) {
            primeraFecha = inicio;
        }
        
        if (!isNaN(inicio.getTime()) && !isNaN(fin.getTime())) {
            // **CORRECCIÓN: Calcular días EXACTOS entre dos fechas**
            // Diferencia en milisegundos
            const diferenciaMs = fin.getTime() - inicio.getTime();
            // Convertir a días (redondear hacia arriba)
            const diasPeriodo = Math.max(1, Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24)));
            
            diasTotales += diasPeriodo;
            
            detallesPeriodos.push({
                numero: index + 1,
                inicio: inscripcion.fecha_inicio,
                fin: inscripcion.fecha_fin,
                dias: diasPeriodo,
                estado: inscripcion.estado
            });
            
            console.log(`📅 Período ${index + 1}: ${inscripcion.fecha_inicio} a ${inscripcion.fecha_fin} = ${diasPeriodo} días`);
        }
    });
    
    console.log(`✅ Total días sumados: ${diasTotales}`);
    console.log('📋 Detalles períodos:', detallesPeriodos);
    
    // Formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return null;
        const d = new Date(fecha);
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const anio = d.getFullYear();
        return `${dia}/${mes}/${anio}`;
    };
    
    // Calcular meses y años aproximados
    const mesesAprox = Math.floor(diasTotales / 30.44);
    const anosAprox = Math.floor(diasTotales / 365.25);
    
    // Formatear texto según duración
    let textoAmigable = '';
    if (diasTotales < 30) {
        textoAmigable = `${diasTotales} día${diasTotales !== 1 ? 's' : ''}`;
    } else if (diasTotales < 365) {
        const meses = Math.floor(diasTotales / 30);
        const diasRestantes = diasTotales % 30;
        textoAmigable = `${meses} mes${meses !== 1 ? 'es' : ''}`;
        if (diasRestantes > 0) {
            textoAmigable += ` ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`;
        }
    } else {
        const anos = Math.floor(diasTotales / 365);
        const mesesRestantes = Math.floor((diasTotales % 365) / 30);
        textoAmigable = `${anos} año${anos !== 1 ? 's' : ''}`;
        if (mesesRestantes > 0) {
            textoAmigable += ` ${mesesRestantes} mes${mesesRestantes !== 1 ? 'es' : ''}`;
        }
    }
    
    const resultado = {
        // Textos para mostrar
        texto: `${diasTotales} días`,
        texto_amigable: textoAmigable,
        
        // Datos numéricos
        dias_totales: diasTotales,
        dias: diasTotales,
        meses_aprox: mesesAprox,
        anos_aprox: anosAprox,
        
        // Fechas
        fecha_inicio: primeraFecha ? formatearFecha(primeraFecha) : null,
        
        // Conteos
        renovaciones: Math.max(0, inscripcionesOrdenadas.length - 1),
        inscripciones_totales: estudiante.inscripciones.length,
        
        // Estado actual
        estado_actual: estudiante.inscripciones.find(ins => 
            ins.estado === 'activo' || ins.estado === 'en_mora'
        )?.estado || 'finalizado',
        
        // Para debug
        _detalles_periodos: detallesPeriodos,
        _periodos_calculados: detallesPeriodos.length
    };
    
    console.log(`🎯 RESULTADO FINAL para ${estudiante.id}:`, {
        dias_totales: resultado.dias_totales,
        texto: resultado.texto,
        renovaciones: resultado.renovaciones,
        periodos: resultado.inscripciones_totales
    });
    
    return resultado;
};


// Función para cambiar de página
const onPageChange = (event) => {
    console.log('🔄 Cambiando página:', event);

    // IMPORTANTE: PrimeVue usa base 0, pero tu API usa base 1
    currentPage.value = event.page + 1;

    // Actualizar el número de filas por página si cambió
    rowsPerPage.value = event.rows;

    listarEstudiantes();
};

// Función para búsqueda con debounce
let searchTimeout = null;
const onSearchDebounced = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage.value = 1; // Volver a la primera página al buscar
        listarEstudiantes();
    }, 500);
};

// Función para búsqueda con Enter
const onSearch = () => {
    currentPage.value = 1; // Volver a la primera página al buscar
    listarEstudiantes();
};

// Función para formatear fecha
const formatFecha = (fecha) => {
    if (!fecha) return 'No especificada';

    try {
        const d = new Date(fecha);
        if (isNaN(d.getTime())) return fecha;

        return d.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch {
        return fecha;
    }
};

// Funciones para el diálogo
const abrirDialogoEstudiante = () => {
    resetForm();
    dialogoTitulo.value = 'Nuevo Estudiante';
    dialogoEstudiante.value = true;
};

const editarEstudiante = (estudiante) => {
    resetForm();
    estudianteForm.value = {
        ...estudiante,
        fecha_nacimiento: estudiante.fecha_nacimiento ? new Date(estudiante.fecha_nacimiento) : null
    };
    dialogoTitulo.value = 'Editar Estudiante';
    dialogoEstudiante.value = true;
};

const cerrarDialogo = () => {
    dialogoEstudiante.value = false;
    resetForm();
};

const resetForm = () => {
    estudianteForm.value = {
        nombres: '',
        apellidos: '',
        ci: '',
        correo: '',
        telefono: '',
        direccion: '',
        fecha_nacimiento: null,
        estado: 'activo'
    };
    errors.value = {};
};

// Validación del formulario
const validarFormulario = () => {
    errors.value = {};
    let isValid = true;

    if (!estudianteForm.value.nombres.trim()) {
        errors.value.nombres = 'Los nombres son requeridos';
        isValid = false;
    }

    if (!estudianteForm.value.apellidos.trim()) {
        errors.value.apellidos = 'Los apellidos son requeridos';
        isValid = false;
    }

    if (!estudianteForm.value.ci.trim()) {
        errors.value.ci = 'El carnet de identidad es requerido';
        isValid = false;
    }

    if (!estudianteForm.value.correo.trim()) {
        errors.value.correo = 'El correo es requerido';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(estudianteForm.value.correo)) {
        errors.value.correo = 'El correo no es válido';
        isValid = false;
    }

    return isValid;
};

const guardarEstudiante = async () => {
    if (!validarFormulario()) {
        return;
    }

    guardando.value = true;

    try {
        // Preparar datos
        const payload = { ...estudianteForm.value };

        // Formatear fecha si existe
        if (payload.fecha_nacimiento) {
            if (payload.fecha_nacimiento instanceof Date) {
                const d = payload.fecha_nacimiento;
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                payload.fecha_nacimiento = `${yyyy}-${mm}-${dd}`;
            }
        }

        // Guardar o actualizar
        if (payload.id) {
            await estudianteService.update(payload.id, payload);
            toast.add({
                severity: 'success',
                summary: 'Actualizado',
                detail: 'Estudiante actualizado exitosamente',
                life: 3000
            });
        } else {
            await estudianteService.store(payload);
            toast.add({
                severity: 'success',
                summary: 'Creado',
                detail: 'Estudiante creado exitosamente',
                life: 3000
            });
        }

        cerrarDialogo();
        listarEstudiantes(); // Recargar lista

    } catch (error) {
        console.error('❌ Error al guardar estudiante:', error);

        let mensajeError = 'Error al guardar estudiante';
        if (error.response?.data?.errors) {
            // Mostrar errores de validación del backend
            const erroresBackend = error.response.data.errors;
            Object.keys(erroresBackend).forEach(key => {
                errors.value[key] = erroresBackend[key][0];
            });
        } else if (error.response?.data?.message) {
            mensajeError = error.response.data.message;
        }

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: mensajeError,
            life: 3000
        });
    } finally {
        guardando.value = false;
    }
};



const confirmarEliminar = (id, nombres, apellidos) => {
    estudianteAEliminar.value = {
        id,
        nombres,
        apellidos
    };
    dialogoEliminar.value = true;
};

const eliminarEstudiante = async () => {
    if (!estudianteAEliminar.value) return;

    eliminando.value = true;

    try {
        await estudianteService.delete(estudianteAEliminar.value.id);

        toast.add({
            severity: 'warn',
            summary: 'Eliminado',
            detail: `Estudiante ${estudianteAEliminar.value.nombres} ${estudianteAEliminar.value.apellidos} eliminado`,
            life: 3000
        });

        // Si eliminamos el último elemento de la página, volver a la anterior
        if (estudiantes.value.length === 1 && currentPage.value > 1) {
            currentPage.value--;
        }

        listarEstudiantes();
        dialogoEliminar.value = false;

    } catch (error) {
        console.error('❌ Error al eliminar estudiante:', error);

        let mensajeError = 'Error al eliminar estudiante';
        if (error.response?.data?.message) {
            mensajeError = error.response.data.message;
        }

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: mensajeError,
            life: 3000
        });
    } finally {
        eliminando.value = false;
        estudianteAEliminar.value = null;
    }
};

const exportCSV = () => {
    if (dt.value) {
        dt.value.exportCSV();
    }
};
</script>

<style scoped>
.card {
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

::v-deep(.p-datatable-thead > tr > th) {
    background-color: #65a8d4 !important;
    color: white !important;
    font-weight: bold !important;
}

::v-deep(.p-datatable-tbody > tr:hover) {
    background-color: #f8fafc !important;
}

.confirmation-content {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
}

.p-field {
    margin-bottom: 1.5rem;
}

::v-deep(.p-calendar .p-inputtext) {
    width: 100%;
}

/* Estilos para la tabla */
::v-deep(.p-datatable) {
    font-size: 0.9rem;
}

::v-deep(.p-datatable .p-paginator) {
    border-top: 1px solid #e5e7eb;
    padding: 1rem 0;
}

/* Estilos para diálogos */
::v-deep(.p-dialog .p-dialog-header) {
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
}

::v-deep(.p-dialog .p-dialog-content) {
    padding: 1.5rem;
}

/* Estilos para botones */
::v-deep(.p-button) {
    font-weight: 500;
}

/* Estilos para campos de formulario */
::v-deep(.p-inputtext) {
    width: 100%;
}

::v-deep(.p-inputtext:focus) {
    box-shadow: 0 0 0 2px rgba(101, 168, 212, 0.2);
}

/* Estilos para dropdown */
::v-deep(.p-dropdown) {
    width: 100%;
}

/* Estilos para tags */
::v-deep(.p-tag) {
    font-size: 0.85rem;
    padding: 0.25rem 0.75rem;
}

/* Estilos para el paginador */
::v-deep(.p-paginator .p-paginator-pages .p-paginator-page) {
    min-width: 2.5rem;
    height: 2.5rem;
    margin: 0 0.125rem;
    border-radius: 6px;
}

::v-deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
    background: #65a8d4 !important;
    border-color: #65a8d4 !important;
    color: white !important;
}

::v-deep(.p-paginator .p-dropdown) {
    height: 2.5rem;
}

/* Estilos responsivos */
@media (max-width: 768px) {
    .card {
        padding: 1rem;
    }

    ::v-deep(.p-datatable) {
        font-size: 0.85rem;
    }

    ::v-deep(.p-paginator .p-paginator-pages .p-paginator-page) {
        min-width: 2rem;
        height: 2rem;
    }
}
</style>