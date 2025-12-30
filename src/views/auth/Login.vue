<template>
    <div 
        class="flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden"
        style="
            background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
                        url('/public/demo/images/fondo4.jpeg') center/cover no-repeat fixed;
        "
    >
        <div class="flex flex-column align-items-center justify-content-center px-3">

            <!-- Tarjeta estilo Glass -->
            <div
                class="p-5 shadow-7 border-round-2xl w-full"
                style="
                    max-width: 420px;
                    background: rgba(255,255,255,0.12);
                    backdrop-filter: blur(18px);
                    border: 1px solid rgba(255,255,255,0.25);
                "
            >
                <!-- Logo + títulos -->
                <div class="text-center mb-5">
                    <img 
                        src="/public/demo/images/images2.jpg"
                        alt="Logo"
                        height="90"
                        class="mb-3 border-circle shadow-4"
                    />

                    <h2 class="text-white text-3xl font-bold mb-1">
                        Acceso Administrativo
                    </h2>

                    <p class="text-gray-300 text-sm">
                        Ingresa tus credenciales para continuar.
                    </p>
                </div>

                <!-- FORM -->
                <div>
                    <!-- Email -->
                    <label class="block text-white text-lg mb-2" for="email1">Correo electrónico</label>
                    <InputText
                        id="email1"
                        type="email"
                        v-model="credenciales.email"
                        placeholder="ejemplo@dominio.com"
                        class="w-full mb-3 text-base"
                        style="padding: 0.9rem; border-radius: 12px;"
                        :class="{'p-invalid': errors.email}"
                    />
                    <small v-if="errors.email" class="p-error block mb-4">{{ errors.email[0] }}</small>

                    <!-- Password -->
                    <label class="block text-white text-lg mb-2" for="password1">Contraseña</label>
                    <Password 
                        id="password1"
                        v-model="credenciales.password"
                        :toggleMask="true"
                        placeholder="••••••••"
                        class="w-full mb-3"
                        inputClass="w-full text-base"
                        inputStyle="padding:0.9rem; border-radius: 12px;"
                        :class="{'p-invalid': errors.password}"
                    />
                    <small v-if="errors.password" class="p-error block mb-4">{{ errors.password[0] }}</small>

                    <!-- Recordarme -->
                    <div class="flex align-items-center justify-content-between mb-5">
                        <div class="flex align-items-center gap-2">
                            <Checkbox v-model="checked" id="rememberme1" binary />
                            <label class="text-gray-200 text-sm" for="rememberme1">Recordarme</label>
                        </div>

                        <a class="text-primary-200 text-sm cursor-pointer hover:underline">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                    <!-- Botón -->
                    <Button
                        label="Ingresar"
                        class="w-full p-button-lg"
                        style="
                            padding: 1rem;
                            border-radius: 14px;
                            font-size: 1.1rem;
                        "
                        :loading="loading"
                        :disabled="loading"
                        @click="funIngresar()"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import authService from '../../services/auth.service';
import { useRouter } from "vue-router";

const credenciales = ref({ email: "", password: "" });
const checked = ref(false);
const errors = ref({});
const loading = ref(false);
const router = useRouter();

async function funIngresar() {
    if (!credenciales.value.email || !credenciales.value.password) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    loading.value = true;
    errors.value = {};

    try {
        const { data } = await authService.login(credenciales.value);

        localStorage.setItem("access_token", data.access_token);

        const rol = data.user?.rol || data.rol;
        if (rol) localStorage.setItem("user_rol", rol);

        if (rol === 'super_admin') router.push('/admin/dashboard');
        else if (rol === 'vendedor') router.push('/admin/pedido');
        else router.push('/');

    } catch (error) {
        if (error.response) {
            if (error.response.status === 422) {
                errors.value = error.response.data.errors || {};
                alert("Corrige los errores del formulario.");
            } else if (error.response.status === 401 || error.response.status === 403) {
                alert(error.response.data.message || "Credenciales incorrectas.");
            } else {
                alert(error.response.data.message || "Error inesperado.");
            }
        } else {
            alert("No hay conexión con el servidor.");
        }
    } finally {
        loading.value = false;
    }
}
</script>
