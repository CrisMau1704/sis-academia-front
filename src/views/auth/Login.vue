<template>
    <div 
        class="login-container"
        :style="backgroundStyle"
    >
        <!-- Partículas animadas de fondo -->
        <div class="particles"></div>
        
        <!-- Contenido principal -->
        <div class="main-content">
            <!-- Tarjeta principal con efecto vidrio mejorado -->
            <div class="glass-card">
                
                <!-- Logo y branding mejorado -->
                <div class="brand-section">
                    <!-- Logo circular con borde inspirado en dojo -->
                    <div class="logo-wrapper">
                        <img 
                            src="/public/demo/images/logo1.jpeg"
                            alt="Alianza Bolivia MMA"
                            class="academy-logo"
                        />
                        <div class="logo-ring"></div>
                        <div class="logo-ring-2"></div>
                    </div>
                    
                    <!-- Títulos con temática marcial -->
                    <div class="brand-text">
                        <h1 class="academy-title">
                            <span class="title-main">ALIANZA BOLIVIA</span>
                            <span class="title-sub">MMA</span>
                        </h1>
                        <p class="academy-tagline">
                            <i class="pi pi-shield" style="margin-right: 8px;"></i>
                            Disciplina • Fuerza • Excelencia
                        </p>
                    </div>
                </div>

                <!-- Separador temático -->
                <div class="divider">
                    <div class="divider-line"></div>
                    <div class="divider-icon">
                        <i class="pi pi-bolt"></i>
                    </div>
                    <div class="divider-line"></div>
                </div>

                <!-- Formulario de login -->
                <div class="form-section">
                    <h2 class="form-title">
                        <i class="pi pi-lock" style="margin-right: 10px;"></i>
                        Acceso al Sistema
                    </h2>
                    
                    <!-- Campo Email -->
                    <div class="input-group">
                        <div class="input-icon">
                            <i class="pi pi-envelope"></i>
                        </div>
                        <InputText
                            id="email"
                            type="email"
                            v-model="credenciales.email"
                            placeholder="correo@academia.com"
                            class="custom-input"
                            :class="{'p-invalid': errors.email}"
                            autocomplete="username"
                            @keyup.enter="funIngresar"
                        />
                    </div>
                    <small v-if="errors.email" class="error-message">
                        <i class="pi pi-exclamation-triangle" style="margin-right: 5px;"></i>
                        {{ errors.email[0] }}
                    </small>

                    <!-- Campo Contraseña CORREGIDO -->
                    <div class="input-group password-group">
                        <div class="input-icon">
                            <i class="pi pi-key"></i>
                        </div>
                        <div class="password-wrapper">
                            <Password 
                                id="password"
                                v-model="credenciales.password"
                                :toggleMask="true"
                                placeholder="Tu contraseña secreta"
                                :feedback="false"
                                :class="{'p-invalid': errors.password}"
                                autocomplete="current-password"
                                @keyup.enter="funIngresar"
                                inputStyle="
                                    width: 100%;
                                    padding: 16px 16px 16px 48px;
                                    background: rgba(15, 23, 42, 0.8);
                                    border: 1px solid rgba(255, 255, 255, 0.1);
                                    border-radius: 12px;
                                    color: #E2E8F0;
                                    font-size: 1rem;
                                    font-family: inherit;
                                    transition: all 0.3s ease;
                                "
                                :pt="{
                                    root: { class: 'password-root' },
                                    input: { 
                                        style: 'padding-left: 48px !important',
                                        class: 'password-input-field'
                                    }
                                }"
                            />
                        </div>
                    </div>
                    <small v-if="errors.password" class="error-message">
                        <i class="pi pi-exclamation-triangle" style="margin-right: 5px;"></i>
                        {{ errors.password[0] }}
                    </small>

                    <!-- Opciones adicionales -->
                    <div class="form-options">
                        <div class="remember-me">
                            <Checkbox 
                                v-model="checked" 
                                id="rememberme" 
                                binary 
                                class="custom-checkbox"
                            />
                            <!--  <label for="rememberme" class="option-label">
                                <i class="pi pi-bookmark" style="margin-right: 8px;"></i>
                                Recordar sesión
                            </label>-->
                        </div>
                        
                      <a class="forgot-password" @click="showPasswordRecovery">
                            <i class="pi pi-question-circle" style="margin-right: 8px;"></i>
                            ¿Contraseña olvidada?
                        </a>
                    </div>

                     
                    <div class="button-container">
                        <Button
                            label="INICIAR SESIÓN"
                            icon="pi pi-sign-in"
                            iconPos="right"
                            class="login-button"
                            :loading="loading"
                            :disabled="loading"
                            @click="funIngresar"
                        >
                            <template #loading>
                                <i class="pi pi-spin pi-spinner" style="margin-right: 0.5rem"></i>
                                Autenticando...
                            </template>
                        </Button>
                        
                        <!-- Efecto de botón -->
                        <div class="button-glow"></div>
                    </div>

                    <!-- Mensaje de bienvenida -->
                   
                </div>

                <!-- Footer informativo -->
                <div class="footer">
                    <div class="contact-info">
                        <p>
                            <i class="pi pi-phone" style="margin-right: 8px;"></i>
                            Soporte: +591 60108969
                        </p>
                        <p>
                            <i class="pi pi-clock" style="margin-right: 8px;"></i>
                            Horarios: 6:00 AM - 10:00 PM
                        </p>
                    </div>
                    <div class="security-notice">
                        <i class="pi pi-shield" style="margin-right: 8px; color: #10B981;"></i>
                        Sistema seguro • Protegido por autenticación avanzada
                    </div>
                </div>
            </div>
            
            <!-- Indicador de carga global -->
            <div v-if="loading" class="global-loader">
                <ProgressSpinner 
                    style="width: 60px; height: 60px" 
                    strokeWidth="4"
                    animationDuration=".8s"
                />
                <p>Conectando con el dojo digital...</p>
            </div>
        </div>

        <!-- Toast para mensajes -->
        <Toast position="top-right" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from "vue-router";
import { useToast } from 'primevue/usetoast';
import authService from '../../services/auth.service';

// Components PrimeVue
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Toast from 'primevue/toast';

const router = useRouter();
const toast = useToast();

// Estados
const credenciales = ref({ email: "", password: "" });
const checked = ref(false);
const errors = ref({});
const loading = ref(false);
const backgroundIndex = ref(0);

// Fondos rotativos para el tema deportivo/marcial
const backgrounds = [
    "linear-gradient(135deg, rgba(0, 10, 20, 0.85) 0%, rgba(20, 0, 40, 0.9) 100%), url('/public/demo/images/dojo-bg.jpg')",
    "linear-gradient(135deg, rgba(10, 0, 20, 0.85) 0%, rgba(40, 0, 0, 0.9) 100%), url('/public/demo/images/gym-bg.jpg')",
    "linear-gradient(135deg, rgba(0, 20, 10, 0.85) 0%, rgba(0, 0, 40, 0.9) 100%), url('/public/demo/images/karate-bg.jpg')"
];

const backgroundStyle = computed(() => ({
    background: backgrounds[backgroundIndex.value],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    transition: 'background 1s ease-in-out'
}));

// Funciones
async function funIngresar() {
    // Validación básica
    if (!credenciales.value.email || !credenciales.value.password) {
        showError('Por favor, completa todos los campos requeridos.');
        return;
    }

    loading.value = true;
    errors.value = {};

    try {
        const { data } = await authService.login(credenciales.value);

        // DEBUG: Ver toda la respuesta
        console.log('Respuesta completa del login:', data);

        // Guardar tokens y datos de usuario
        const token = data.access_token || data.token;
        if (token) {
            localStorage.setItem("access_token", token);
        } else {
            console.warn('No se recibió token en la respuesta');
        }

        const usuario = data.usuario || data.user || {};
        localStorage.setItem("user_data", JSON.stringify(usuario));

        const rol = data.rol || usuario.rol;
        if (rol) localStorage.setItem("user_rol", rol);

        // Guardar permisos
        const permisos = data.permisos || data.permissions || [];
        if (permisos && Array.isArray(permisos)) {
            localStorage.setItem("user_permissions", JSON.stringify(permisos));
            console.log('✅ Permisos guardados:', permisos);
        } else {
            console.warn('⚠️ No se recibieron permisos en la respuesta');
            localStorage.setItem("user_permissions", JSON.stringify([]));
        }

        // Mostrar mensaje de éxito
        showSuccess(`¡Bienvenido ${usuario.name || 'Maestro'}!`);

        // Redirigir según PERMISOS con pequeño delay
        setTimeout(() => {
            // Obtener permisos guardados
            const permisosGuardados = JSON.parse(localStorage.getItem("user_permissions") || "[]");
            
            console.log('📋 Permisos disponibles para redirección:', permisosGuardados);
            console.log('👤 Rol del usuario:', rol);

            // ============================================
            // REDIRECCIÓN POR PERMISOS ESPECÍFICOS
            // ============================================
            
            // 1. DASHBOARD Y VISIÓN GENERAL
            if (permisosGuardados.includes('view_dashboard')) {
                console.log('→ Redirigiendo a dashboard (tiene view_dashboard)');
                router.push('/admin/dashboard');
            } 
            
            // 2. GESTIÓN DE ESTUDIANTES
            else if (permisosGuardados.includes('manage_students')) {
                console.log('→ Redirigiendo a estudiantes (tiene manage_students)');
                router.push('/admin/estudiantes');
            }
            else if (permisosGuardados.includes('manage_enrollments')) {
                console.log('→ Redirigiendo a inscripciones (tiene manage_enrollments)');
                router.push('/admin/inscripciones');
            }
            
            // 3. CONTROL DE ASISTENCIAS
            else if (permisosGuardados.includes('manage_attendance')) {
                console.log('→ Redirigiendo a asistencias (tiene manage_attendance)');
                router.push('/admin/asistencias');
            }
            else if (permisosGuardados.includes('manage_class_recovery')) {
                console.log('→ Redirigiendo a recuperaciones (tiene manage_class_recovery)');
                router.push('/admin/recuperarclases');
            }
            
            // 4. PAGOS Y FINANZAS
            else if (permisosGuardados.includes('view_payment_history')) {
                console.log('→ Redirigiendo a pagos (tiene view_payment_history)');
                router.push('/admin/historialpagos');
            }
            else if (permisosGuardados.includes('view_reembolsos')) {
                console.log('→ Redirigiendo a pagos (tiene view_reembolsos)');
                router.push('/admin/reembolsos');
            }
            
            // 5. CONFIGURACIÓN DEL SISTEMA
            else if (permisosGuardados.includes('manage_branches')) {
                console.log('→ Redirigiendo a sucursales (tiene manage_branches)');
                router.push('/admin/sucursales');
            }
            else if (permisosGuardados.includes('manage_disciplines')) {
                console.log('→ Redirigiendo a disciplinas (tiene manage_disciplines)');
                router.push('/admin/disciplinas');
            }
            else if (permisosGuardados.includes('manage_modalities')) {
                console.log('→ Redirigiendo a modalidades (tiene manage_modalities)');
                router.push('/admin/modalidades');
            }
            else if (permisosGuardados.includes('manage_schedules')) {
                console.log('→ Redirigiendo a horarios (tiene manage_schedules)');
                router.push('/admin/horarios');
            }
            else if (permisosGuardados.includes('manage_trainers')) {
                console.log('→ Redirigiendo a entrenadores (tiene manage_trainers)');
                router.push('/admin/entrenadores');
            }
            
            // 6. REPORTES
            else if (permisosGuardados.includes('view_remaining_classes')) {
                console.log('→ Redirigiendo a reporte de clases (tiene view_remaining_classes)');
                router.push('/admin/clasesrestantes');
            }
            else if (permisosGuardados.includes('view_monthly_attendance')) {
                console.log('→ Redirigiendo a reporte de asistencias (tiene view_monthly_attendance)');
                router.push('/admin/asistenciasmensuales');
            }
            
            // 7. ADMINISTRACIÓN DEL SISTEMA
            else if (permisosGuardados.includes('manage_users')) {
                console.log('→ Redirigiendo a usuarios (tiene manage_users)');
                router.push('/admin/usuarios');
            }
            else if (permisosGuardados.includes('manage_roles')) {
                console.log('→ Redirigiendo a roles (tiene manage_roles)');
                router.push('/admin/roles');
            }
            
            // ============================================
            // FALLBACK: SI NO TIENE PERMISOS ESPECÍFICOS
            // ============================================
            else if (rol === 'super_admin' || rol === 'admin') {
                console.log('→ Redirigiendo a dashboard (rol admin - fallback)');
                router.push('/admin/dashboard');
            } 
            else if (rol === 'vendedor' || rol === 'recepcionista') {
                console.log('→ Redirigiendo a pedidos (rol vendedor - fallback)');
                router.push('/admin/pedido');
            } 
            else if (rol === 'entrenador') {
                console.log('→ Redirigiendo a clases (rol entrenador - fallback)');
                router.push('/entrenador/clases');
            } 
            else {
                console.log('→ Redirigiendo a home (sin permisos específicos)');
                toast.add({
                    severity: 'warn',
                    summary: 'Acceso limitado',
                    detail: 'No tienes permisos configurados. Contacta al administrador.',
                    life: 4000
                });
                router.push('/');
            }
        }, 1000);

    } catch (error) {
        handleAuthError(error);
    } finally {
        loading.value = false;
    }
}


function showError(message) {
    toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 5000
    });
}

function showSuccess(message) {
    toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: message,
        life: 3000
    });
}

function handleAuthError(error) {
    if (error.response) {
        switch (error.response.status) {
            case 422:
                errors.value = error.response.data.errors || {};
                showError('Por favor, corrige los errores en el formulario.');
                break;
            case 401:
            case 403:
                showError(error.response.data.message || 'Credenciales incorrectas. Verifica tu correo y contraseña.');
                break;
            case 429:
                showError('Demasiados intentos. Por favor, espera unos minutos.');
                break;
            case 500:
                showError('Error del servidor. Por favor, contacta al soporte técnico.');
                break;
            default:
                showError(error.response.data.message || 'Error de conexión.');
        }
    } else if (error.request) {
        showError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
        showError('Error inesperado: ' + error.message);
    }
}

function showPasswordRecovery() {
    toast.add({
        severity: 'info',
        summary: 'Recuperación de Contraseña',
        detail: 'Por favor, contacta al administrador del sistema.',
        life: 4000
    });
}

// Cambiar fondo cada 10 segundos (opcional)
setInterval(() => {
    backgroundIndex.value = (backgroundIndex.value + 1) % backgrounds.length;
}, 10000);
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    min-width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    font-family: 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
}

.particles {
    position: absolute;
    width: 100%;
    height: 100%;
     background: radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(212, 175, 55, 0.15) 0%, transparent 50%);
    animation: particles-move 15s ease-in-out infinite alternate;
}

@keyframes particles-move {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(-50px, -50px) scale(1.1); }
}

.main-content {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 480px;
    padding: 20px;
}

.glass-card {
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 40px;
    box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
    transform: translateY(-5px);
    box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.brand-section {
    text-align: center;
    margin-bottom: 30px;
}

.logo-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 20px;
}

.academy-logo {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #60A5FA;
    box-shadow: 
        0 0 30px rgba(99, 102, 241, 0.4),
        inset 0 0 20px rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 2;
}

.logo-ring, .logo-ring-2 {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 2px solid;
    animation: ring-pulse 3s ease-in-out infinite;
}

.logo-ring {
    width: 140px;
    height: 140px;
    border-color: rgba(99, 102, 241, 0.6);
}

.logo-ring-2 {
    width: 160px;
    height: 160px;
    border-color: rgba(255, 87, 87, 0.4);
    animation-delay: 0.5s;
}

@keyframes ring-pulse {
    0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.95); }
    50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); }
}

.brand-text {
    margin-top: 20px;
}

.academy-title {
    margin: 0;
    line-height: 1.2;
}

.title-main {
     display: block;
    font-size: 2.4rem;
    font-weight: 600;
    color: #CBD5E1;
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-top: 5px;
}

.title-sub {
    display: block;
    font-size: 2.4rem;
    font-weight: 600;
    color: #CBD5E1;
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-top: 5px;
}

.academy-tagline {
    color: #94A3B8;
    font-size: 1rem;
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 30px 0;
}

.divider-line {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent);
    flex: 1;
}

.divider-icon {
    margin: 0 20px;
    color: #60A5FA;
    font-size: 1.2rem;
    animation: icon-spin 4s linear infinite;
}

@keyframes icon-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.form-section {
    margin-bottom: 30px;
}

.form-title {
    color: #E2E8F0;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 25px;
    text-align: center;
}

.input-group {
    position: relative;
    margin-bottom: 20px;
}

.password-group {
    position: relative;
}

.input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
    z-index: 20;
}

.custom-input {
    width: 100%;
    padding: 16px 16px 16px 48px !important;
    background: rgba(15, 23, 42, 0.8) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    color: #E2E8F0 !important;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.3s ease;
}

.custom-input:focus {
    outline: none !important;
    border-color: #60A5FA !important;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
    background: rgba(15, 23, 42, 0.9) !important;
}

.custom-input::placeholder {
    color: #64748B;
}

.error-message {
    display: block;
    color: #F87171;
    font-size: 0.85rem;
    margin-top: 5px;
    margin-bottom: 15px;
    padding-left: 48px;
}

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 25px 0;
}

.remember-me {
    display: flex;
    align-items: center;
}

.option-label {
    color: #CBD5E1;
    font-size: 0.9rem;
    cursor: pointer;
    user-select: none;
}

.forgot-password {
    color: #60A5FA;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: none;
    transition: color 0.2s ease;
}

.forgot-password:hover {
    color: #3B82F6;
    text-decoration: underline;
}

.button-container {
    position: relative;
    margin: 30px 0;
}

.login-button {
    width: 100% !important;
    padding: 18px !important;
    background: linear-gradient(135deg, #DC2626 0%, #991B1B 50%, #450A0A 100%) !important;
    border: none !important;
    border-radius: 14px !important;
    font-size: 1.1rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.5px !important;
    transition: all 0.3s ease !important;
    position: relative;
    z-index: 2;
}

.login-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4) !important;
}

.login-button:active:not(:disabled) {
    transform: translateY(0);
}

.button-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% + 10px);
    height: calc(100% + 10px);
   background: linear-gradient(135deg, #DC2626 0%, #7F1D1D 50%, #450A0A 100%);
    filter: blur(15px);
    opacity: 0.6;
    border-radius: 16px;
    z-index: 1;
    animation: glow-pulse 2s ease-in-out infinite alternate;
}

@keyframes glow-pulse {
    0% { opacity: 0.4; }
    100% { opacity: 0.7; }
}

.welcome-message {
    text-align: center;
    margin-top: 25px;
    color: #94A3B8;
    font-size: 0.95rem;
    padding: 15px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.footer {
    margin-top: 30px;
    padding-top: 25px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.contact-info {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 15px;
}

.contact-info p {
    color: #CBD5E1;
    font-size: 0.85rem;
    margin: 0;
    display: flex;
    align-items: center;
}

.security-notice {
    text-align: center;
    color: #10B981;
    font-size: 0.8rem;
    padding: 10px;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(16, 185, 129, 0.2);
}

.global-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(10px);
}

.global-loader p {
    color: white;
    margin-top: 20px;
    font-size: 1.1rem;
    animation: text-pulse 2s ease-in-out infinite;
}

@keyframes text-pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
}

/* Responsive */
@media (max-width: 640px) {
    .main-content {
        padding: 15px;
    }
    
    .glass-card {
        padding: 30px 25px;
    }
    
    .title-main {
        font-size: 2.2rem;
    }
    
    .title-sub {
        font-size: 2.2rem;
    }
    
    .form-options {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }
    
    .contact-info {
        flex-direction: column;
        text-align: center;
        gap: 10px;
    }
}

/* Animaciones de entrada */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.glass-card {
    animation: fadeInUp 0.8s ease-out;
}

/* Estilos para el componente Password - CORREGIDOS */
.password-wrapper :deep(.p-password) {
    width: 100%;
    display: block;
}

.password-wrapper :deep(.p-password-input) {
    width: 100%;
    padding: 16px 16px 16px 48px !important;
    background: rgba(15, 23, 42, 0.8) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    color: #E2E8F0 !important;
    font-size: 1rem !important;
    font-family: inherit !important;
    transition: all 0.3s ease !important;
}

.password-wrapper :deep(.p-password-input:focus) {
    outline: none !important;
    border-color: #60A5FA !important;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
    background: rgba(15, 23, 42, 0.9) !important;
}

.password-wrapper :deep(.p-password-input::placeholder) {
    color: #64748B !important;
}

.password-wrapper :deep(.p-icon-wrapper) {
    background: transparent !important;
    border: none !important;
    color: #94A3B8 !important;
    width: auto !important;
    right: 16px !important;
}

.password-wrapper :deep(.p-icon-wrapper:hover) {
    color: #60A5FA !important;
    background: transparent !important;
}

.password-wrapper :deep(.p-icon-wrapper .pi) {
    font-size: 1.2rem !important;
}

/* Estado de error */
.password-wrapper :deep(.p-invalid .p-password-input) {
    border-color: #F87171 !important;
}

.password-wrapper :deep(.p-invalid .p-password-input:focus) {
    box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.2) !important;
}
</style>