<template>
    <div class="card">
        <Toolbar class="mb-4">
            <template #start>
                <h4>Gestión de Roles y Permisos</h4>
            </template>
            <template #end>
                <Button label="Nuevo Rol" icon="pi pi-plus" class="mr-2" @click="abrirDialogoNuevoRol" />
                <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV" />
            </template>
        </Toolbar>

        <!-- Tabs para separar Roles y Permisos -->
        <TabView>
            <TabPanel header="Roles de Usuarios">
                <DataTable ref="dt" :value="usuarios" dataKey="id" lazy :totalRecords="totalRecords" :loading="loading"
                    :paginator="true" :rows="rows" @page="onPage"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 20]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios">
                    <template #header>
                        <div class="flex align-items-center justify-content-between">
                            <span class="p-input-icon-left">
                                <i class="pi pi-search"></i>
                                <InputText placeholder="Buscar..." v-model="buscar" @keypress.enter="listarUsuarios" />
                            </span>
                        </div>
                    </template>

                    <Column field="name" header="Nombre" sortable></Column>
                    <Column field="email" header="Email" sortable></Column>
                    <Column header="Roles">
                        <template #body="slotProps">
                            <Chip v-for="role in slotProps.data.roles" :key="role.id" :label="role.nombre"
                                class="mr-2 mb-2" :severity="getRoleSeverity(role.nombre)" />
                        </template>
                    </Column>
                    <Column header="Acciones">
                        <template #body="slotProps">
                            <Button icon="pi pi-user-edit" rounded class="mr-2"
                                @click="abrirDialogoRoles(slotProps.data)" :disabled="slotProps.data.id === 1" />
                            <!-- No editar super_admin -->
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>

            <TabPanel header="Permisos por Rol">
                <div class="grid">
                    <div class="col-12 md:col-4">
                        <Card>
                            <template #title>Roles del Sistema</template>
                            <template #content>
                                <div class="mb-3">
                                    <Button label="Crear Nuevo Rol" icon="pi pi-plus" class="w-full mb-3"
                                        @click="abrirDialogoNuevoRol" />
                                </div>
                                <Listbox v-model="selectedRole" :options="allRoles" optionLabel="nombre" class="w-full"
                                    listStyle="max-height: 400px">
                                    <template #option="slotProps">
                                        <div class="flex align-items-center justify-content-between w-full">
                                            <span>{{ slotProps.option.nombre }}</span>
                                            <Badge v-if="slotProps.option.permisos_count"
                                                :value="slotProps.option.permisos_count" severity="info" />
                                        </div>
                                    </template>
                                </Listbox>
                                <div class="mt-3 text-sm text-color-secondary">
                                    <p><i class="pi pi-info-circle mr-2"></i>Selecciona un rol para gestionar sus
                                        permisos</p>
                                </div>
                            </template>
                        </Card>
                    </div>

                    <div class="col-12 md:col-8">
                        <Card v-if="selectedRole">
                            <template #title>
                                <div class="flex align-items-center justify-content-between">
                                    <span>Permisos para: {{ selectedRole.nombre }}</span>
                                    <div>
                                        <Button icon="pi pi-trash" severity="danger" outlined class="mr-2"
                                            @click="confirmarEliminarRol"
                                            :disabled="selectedRole.nombre === 'super_admin'"
                                            v-tooltip="'Eliminar rol'" />
                                        <Button icon="pi pi-save" label="Guardar" @click="guardarPermisosRol"
                                            :loading="savingPermissions" />
                                    </div>
                                </div>
                            </template>
                            <template #content>
                                <div v-if="selectedRole.nombre === 'super_admin'"
                                    class="mb-4 p-3 border-round bg-blue-50">
                                    <div class="flex align-items-center">
                                        <i class="pi pi-shield text-blue-500 mr-2" style="font-size: 1.5rem"></i>
                                        <div>
                                            <h5 class="mt-0 mb-1">Rol Super Administrador</h5>
                                            <p class="mt-0 mb-0 text-sm">Este rol tiene acceso completo a todos los
                                                módulos del sistema.</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="grid">
                                    <!-- Permisos por categoría -->
                                    <div class="col-12 md:col-6" v-for="category in permissionCategories"
                                        :key="category.name">
                                        <div class="mb-4">
                                            <h5>{{ category.label }}</h5>
                                            <div class="field-checkbox mb-2" v-for="perm in category.permissions"
                                                :key="perm.codigo">
                                                <!-- CORRECCIÓN AQUÍ: Usa :modelValue y @update:modelValue -->
                                                <Checkbox :id="'perm-' + perm.codigo"
                                                    :modelValue="isPermissionSelected(perm.codigo)"
                                                    @update:modelValue="togglePermission(perm.codigo, $event)"
                                                    :binary="true" :disabled="selectedRole?.nombre === 'super_admin'" />
                                                <label :for="'perm-' + perm.codigo" class="ml-2">
                                                    {{ perm.descripcion }}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex justify-content-between mt-4">
                                    <div>
                                        <span class="text-sm text-color-secondary">
                                            {{ selectedRolePermissions.length }} de {{ totalPermisos }} permisos
                                            seleccionados
                                        </span>
                                    </div>
                                    <div class="flex gap-2">
                                        <Button label="Seleccionar Todos" icon="pi pi-check" severity="secondary"
                                            @click="seleccionarTodosPermisos"
                                            :disabled="selectedRole.nombre === 'super_admin'" />
                                        <Button label="Deseleccionar Todos" icon="pi pi-times" severity="secondary"
                                            @click="deseleccionarTodosPermisos"
                                            :disabled="selectedRole.nombre === 'super_admin'" />
                                        <Button label="Guardar Permisos" icon="pi pi-save" @click="guardarPermisosRol"
                                            :loading="savingPermissions"
                                            :disabled="selectedRole.nombre === 'super_admin'" />
                                    </div>
                                </div>
                            </template>
                        </Card>
                        <Card v-else>
                            <template #content>
                                <div class="text-center py-6">
                                    <i class="pi pi-users text-4xl text-color-secondary mb-3"></i>
                                    <h4 class="mt-0 mb-2">Selecciona un rol</h4>
                                    <p class="mt-0 mb-4 text-color-secondary">Selecciona un rol de la lista para
                                        gestionar sus permisos</p>
                                    <Button label="Crear Nuevo Rol" icon="pi pi-plus" @click="abrirDialogoNuevoRol" />
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>
            </TabPanel>
        </TabView>

        <!-- Diálogo para asignar roles a usuario -->
        <Dialog v-model:visible="dialogoRoles" modal header="Asignar Roles" :style="{ width: '25rem' }">
            <div class="mb-3">
                <label class="block mb-2">Usuario: <strong>{{ usuarioSeleccionado?.name }}</strong></label>
                <label class="block mb-2">Email: <strong>{{ usuarioSeleccionado?.email }}</strong></label>
            </div>

            <div class="field-checkbox mb-3" v-for="role in allRoles" :key="role.id">
                <Checkbox :id="'role-' + role.id" name="roles" :value="role.id" v-model="selectedRoles"
                    :disabled="usuarioSeleccionado?.id === 1 && role.nombre === 'super_admin'" />
                <label :for="'role-' + role.id" class="ml-2">
                    {{ role.nombre }}
                    <span v-if="role.detalle" class="text-sm text-color-secondary block">{{ role.detalle }}</span>
                </label>
            </div>

            <div class="flex justify-content-end gap-2 mt-4">
                <Button type="button" label="Cancelar" severity="secondary" text @click="cerrarDialogo" />
                <Button type="button" label="Guardar" @click="guardarRoles" :loading="loading" />
            </div>
        </Dialog>

        <!-- Diálogo para crear nuevo rol -->
        <Dialog v-model:visible="dialogoNuevoRol" modal header="Crear Nuevo Rol" :style="{ width: '30rem' }">
            <div class="grid p-fluid">
                <div class="col-12">
                    <div class="field">
                        <label for="nombreRol">Nombre del Rol *</label>
                        <InputText id="nombreRol" v-model="nuevoRol.nombre"
                            placeholder="Ej: vendedor, asistente, profesor"
                            :class="{ 'p-invalid': submitted && !nuevoRol.nombre }" />
                        <small class="p-error" v-if="submitted && !nuevoRol.nombre">
                            El nombre del rol es requerido
                        </small>
                    </div>
                </div>
                <div class="col-12">
                    <div class="field">
                        <label for="detalleRol">Descripción</label>
                        <Textarea id="detalleRol" v-model="nuevoRol.detalle" rows="3"
                            placeholder="Descripción del rol y sus funciones..." />
                    </div>
                </div>
            </div>

            <div class="flex justify-content-end gap-2 mt-4">
                <Button type="button" label="Cancelar" severity="secondary" text @click="cerrarDialogoNuevoRol" />
                <Button type="button" label="Crear Rol" @click="crearRol" :loading="creandoRol" />
            </div>
        </Dialog>

        <!-- Diálogo de confirmación para eliminar rol -->
        <Dialog v-model:visible="dialogoConfirmarEliminar" modal header="Confirmar Eliminación"
            :style="{ width: '25rem' }">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: #e74c3c" />
                <span>¿Estás seguro de eliminar el rol <strong>{{ selectedRole?.nombre }}</strong>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="dialogoConfirmarEliminar = false" />
                <Button label="Sí" icon="pi pi-check" text @click="eliminarRol" />
            </template>
        </Dialog>
    </div>
    <Toast />
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import usuarioService from '../../services/usuario.service';
import rolesService from '../../services/roles.service';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const usuarios = ref([]);
const allRoles = ref([]);
const selectedRole = ref(null);
const selectedRolePermissions = ref([]);
const selectedRoles = ref([]);
const usuarioSeleccionado = ref(null);
const nuevoRol = ref({ nombre: '', detalle: '' });
const dialogoRoles = ref(false);
const dialogoNuevoRol = ref(false);
const dialogoConfirmarEliminar = ref(false);
const submitted = ref(false);
const loading = ref(false);
const creandoRol = ref(false);
const savingPermissions = ref(false);
const totalRecords = ref(0);
const rows = ref(10);
const buscar = ref('');
const dt = ref(null);

// Categorías de permisos con íconos
const permissionCategories = ref([
    {
        name: 'dashboard',
        label: 'Dashboard',
        icon: 'pi pi-home',
        permissions: [
            { codigo: 'view_dashboard', descripcion: 'Ver Dashboard' }
        ]
    },
    {
        name: 'configuracion',
        label: 'Configuración General',
        icon: 'pi pi-cog',
        permissions: [
            { codigo: 'manage_branches', descripcion: 'Gestionar Sucursales' },
            { codigo: 'manage_disciplines', descripcion: 'Gestionar Disciplinas' },
            { codigo: 'manage_modalities', descripcion: 'Gestionar Modalidades' },
            { codigo: 'manage_schedules', descripcion: 'Gestionar Horarios' },
            { codigo: 'manage_trainers', descripcion: 'Gestionar Entrenadores' }
        ]
    },
    {
        name: 'gestion_estudiantes',
        label: 'Gestión de Estudiantes',
        icon: 'pi pi-users',
        permissions: [
            { codigo: 'manage_students', descripcion: 'Gestionar Estudiantes' },
            { codigo: 'manage_enrollments', descripcion: 'Gestionar Inscripciones' }
        ]
    },
    {
        name: 'control_asistencia',
        label: 'Control de Asistencia',
        icon: 'pi pi-check-square',
        permissions: [
            { codigo: 'manage_attendance', descripcion: 'Gestionar Asistencias' },
            { codigo: 'manage_class_recovery', descripcion: 'Gestionar Recuperación de Clases' }
        ]
    },
    {
        name: 'pagos',
        label: 'Pagos y Mensualidades',
        icon: 'pi pi-money-bill',
        permissions: [
            { codigo: 'view_payment_history', descripcion: 'Ver Historial de Pagos' }
        ]
    },
    {
        name: 'reportes',
        label: 'Reportes',
        icon: 'pi pi-chart-bar',
        permissions: [
            { codigo: 'view_remaining_classes', descripcion: 'Ver Clases Restantes' },
            { codigo: 'view_monthly_attendance', descripcion: 'Ver Asistencia Mensual' }
        ]
    },
    {
        name: 'administracion',
        label: 'Administración',
        icon: 'pi pi-shield',
        permissions: [
            { codigo: 'manage_users', descripcion: 'Gestionar Usuarios' },
            { codigo: 'manage_roles', descripcion: 'Gestionar Roles y Permisos' }
        ]
    }
]);

// Computed para total de permisos
const totalPermisos = computed(() => {
    return permissionCategories.value.reduce((total, category) => {
        return total + category.permissions.length;
    }, 0);
});

onMounted(() => {
    listarUsuarios();
    obtenerRoles();
});

const listarUsuarios = async () => {
    loading.value = true;
    try {
        const response = await rolesService.getUsersWithRoles();

        // Asegúrate de que usuarios.value sea un array
        // Dependiendo de tu API, puede que necesites ajustar esto:

        // Opción 1: Si response es directamente el array
        if (Array.isArray(response)) {
            usuarios.value = response;
        }
        // Opción 2: Si response es un objeto con data
        else if (response && Array.isArray(response.data)) {
            usuarios.value = response.data;
        }
        // Opción 3: Si response es un objeto con otra propiedad
        else if (response && response.usuarios && Array.isArray(response.usuarios)) {
            usuarios.value = response.usuarios;
        }
        // Opción 4: Fallback a array vacío
        else {
            console.warn('La respuesta no es un array:', response);
            usuarios.value = [];
        }

        console.log('Usuarios cargados:', usuarios.value);

    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar usuarios',
            life: 5000
        });
        usuarios.value = []; // Asegurar array vacío en caso de error
    } finally {
        loading.value = false;
    }
};

const obtenerRoles = async () => {
    try {
        const response = await rolesService.getRolesWithPermissions();

        // Asegúrate de que allRoles.value sea un array
        if (Array.isArray(response)) {
            allRoles.value = response;
        }
        else if (response && Array.isArray(response.data)) {
            allRoles.value = response.data;
        }
        else if (response && response.roles && Array.isArray(response.roles)) {
            allRoles.value = response.roles;
        }
        else {
            console.warn('La respuesta de roles no es un array:', response);
            allRoles.value = [];
        }

        console.log('Roles cargados:', allRoles.value);

    } catch (error) {
        console.error('Error al cargar roles:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los roles',
            life: 3000
        });
        allRoles.value = []; // Asegurar array vacío
    }
};

// Cuando se selecciona un rol, cargar sus permisos
watch(selectedRole, async (newRole) => {
    if (newRole) {
        try {
            // Si es super_admin, seleccionar todos los permisos
            if (newRole.nombre === 'super_admin') {
                selectedRolePermissions.value = permissionCategories.value.flatMap(
                    category => category.permissions.map(p => p.codigo)
                );
            } else {
                // Obtener permisos del rol desde la API
                const response = await rolesService.getPermissionsByRole(newRole.id);
                if (response.data && Array.isArray(response.data.permisos)) {
                    selectedRolePermissions.value = response.data.permisos;
                } else if (response.permisos && Array.isArray(response.permisos)) {
                    selectedRolePermissions.value = response.permisos;
                } else if (response.data && Array.isArray(response.data)) {
                    selectedRolePermissions.value = response.data;
                } else {
                    selectedRolePermissions.value = [];
                }
            }
        } catch (error) {
            console.error('Error al cargar permisos del rol:', error);
            selectedRolePermissions.value = [];
        }
    } else {
        selectedRolePermissions.value = [];
    }
});

const guardarPermisosRol = async () => {
    if (!selectedRole.value) return;
    
    savingPermissions.value = true;
    try {
        // Asegurar que estamos enviando un array de códigos (strings)
        const permisosArray = Array.isArray(selectedRolePermissions.value) 
            ? selectedRolePermissions.value 
            : [];
        
        console.log('Enviando permisos (array):', permisosArray);
        
        await rolesService.updateRolePermissions(
            selectedRole.value.id, 
            permisosArray  // ← El servicio lo convertirá a { permisos: permisosArray }
        );
        
        // Mensaje de éxito SÍ debería aparecer ahora
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Permisos actualizados correctamente',
            life: 3000
        });
        
        await obtenerRoles();
        
    } catch (error) {
        console.error('Error completo:', error);
        
        let mensajeError = 'No se pudieron actualizar los permisos';
        if (error.response?.data?.message) {
            mensajeError = error.response.data.message;
        }
        
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: mensajeError,
            life: 5000
        });
    } finally {
        savingPermissions.value = false;
    }
};

// Corrección en watch de selectedRole
watch(selectedRole, async (newRole) => {
    if (newRole) {
        try {
            // Limpiar permisos primero
            selectedRolePermissions.value = [];
            
            // Si es super_admin, seleccionar todos
            if (newRole.nombre === 'super_admin') {
                seleccionarTodosPermisos();
                return;
            }
            
            // Obtener permisos del rol
            const response = await rolesService.getPermissionsByRole(newRole.id);
            console.log('Respuesta permisos rol:', response);
            
            // Extraer array de códigos de permisos
            let permisosArray = [];
            
            if (response && response.permisos && Array.isArray(response.permisos)) {
                permisosArray = response.permisos;
            } else if (response && response.data && Array.isArray(response.data)) {
                permisosArray = response.data.map(p => p.codigo || p);
            } else if (Array.isArray(response)) {
                permisosArray = response.map(p => p.codigo || p);
            }
            
            console.log('Permisos extraídos:', permisosArray);
            selectedRolePermissions.value = permisosArray;
            
        } catch (error) {
            console.error('Error al cargar permisos del rol:', error);
            selectedRolePermissions.value = [];
        }
    } else {
        selectedRolePermissions.value = [];
    }
});

const abrirDialogoRoles = (usuario) => {
    usuarioSeleccionado.value = usuario;
    selectedRoles.value = usuario.roles.map(role => role.id);
    dialogoRoles.value = true;
};

const guardarRoles = async () => {
    loading.value = true;
    try {
        await rolesService.assignUserRoles(usuarioSeleccionado.value.id, selectedRoles.value);
        listarUsuarios();
        dialogoRoles.value = false;

        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Roles actualizados correctamente',
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron actualizar los roles',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const abrirDialogoNuevoRol = () => {
    nuevoRol.value = { nombre: '', detalle: '' };
    submitted.value = false;
    dialogoNuevoRol.value = true;
};

const crearRol = async () => {
    submitted.value = true;

    if (!nuevoRol.value.nombre.trim()) {
        return;
    }

    creandoRol.value = true;
    try {
        const response = await rolesService.createRole(nuevoRol.value);

        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Rol creado exitosamente',
            life: 3000
        });

        // Actualizar lista de roles y seleccionar el nuevo
        await obtenerRoles();

        // Buscar y seleccionar el nuevo rol
        const nuevoRolCreado = allRoles.value.find(r => r.nombre === nuevoRol.value.nombre);
        if (nuevoRolCreado) {
            selectedRole.value = nuevoRolCreado;
        }

        dialogoNuevoRol.value = false;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Error al crear el rol',
            life: 3000
        });
    } finally {
        creandoRol.value = false;
    }
};

const confirmarEliminarRol = () => {
    if (selectedRole.value.nombre === 'super_admin') {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se puede eliminar el rol super_admin',
            life: 3000
        });
        return;
    }
    dialogoConfirmarEliminar.value = true;
};

const eliminarRol = async () => {
    try {
        await rolesService.deleteRole(selectedRole.value.id);

        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Rol eliminado exitosamente',
            life: 3000
        });

        // Actualizar lista y limpiar selección
        await obtenerRoles();
        selectedRole.value = null;
        dialogoConfirmarEliminar.value = false;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Error al eliminar el rol',
            life: 3000
        });
    }
};

// Métodos para manejar permisos
const isPermissionSelected = (permisoCodigo) => {
    return selectedRolePermissions.value.includes(permisoCodigo);
};

const togglePermission = (permisoCodigo, checked) => {
    if (checked) {
        if (!selectedRolePermissions.value.includes(permisoCodigo)) {
            selectedRolePermissions.value.push(permisoCodigo);
        }
    } else {
        const index = selectedRolePermissions.value.indexOf(permisoCodigo);
        if (index > -1) {
            selectedRolePermissions.value.splice(index, 1);
        }
    }
};

const seleccionarTodosPermisos = () => {
    // Crear nuevo array con todos los códigos
    selectedRolePermissions.value = permissionCategories.value.flatMap(
        category => category.permissions.map(p => p.codigo)
    );
};

const deseleccionarTodosPermisos = () => {
    selectedRolePermissions.value = [];
};

const cerrarDialogo = () => {
    dialogoRoles.value = false;
    selectedRoles.value = [];
    usuarioSeleccionado.value = null;
};

const cerrarDialogoNuevoRol = () => {
    dialogoNuevoRol.value = false;
    nuevoRol.value = { nombre: '', detalle: '' };
    submitted.value = false;
};

const getRoleSeverity = (roleName) => {
    switch (roleName) {
        case 'super_admin': return 'danger';
        case 'admin': return 'warning';
        case 'vendedor': return 'success';
        case 'profesor': return 'info';
        default: return 'secondary';
    }
};

// Métodos restantes...
const exportCSV = () => {
    dt.value.exportCSV();
};

const onPage = (event) => {
    // Implementar paginación si es necesario
};
</script>

<style scoped>
.confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
}

::v-deep(.p-datatable-thead > tr > th) {
    background-color: #65a8d4;
    color: white;
    font-weight: bold;
}

/* Estilos para checkboxes */
.field-checkbox {
    display: flex;
    align-items: flex-start;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.field-checkbox:hover {
    background-color: #f8f9fa;
}
</style>