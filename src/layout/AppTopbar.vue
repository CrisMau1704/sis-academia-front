<template>
    <div class="layout-topbar">
        <!-- Logo y título -->
        <router-link to="/" class="layout-topbar-logo">
            <div class="logo-container">
                <img src="/demo/images/logo1.jpeg" alt="Logo" class="logo-image">
                <div class="logo-text">
                    <span class="logo-title">Sistema de Control</span>
                </div>
            </div>
        </router-link>

        <!-- Botón del menú lateral -->
        <button class="menu-toggle-btn" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <!-- Espacio central -->
        <div class="topbar-center">
            <div class="welcome-message">
                <i class="pi pi-user"></i>
                <span>Bienvenido, {{ userName || 'Usuario' }}</span>
            </div>
            <div class="datetime-info" v-if="showDateTime">
                <i class="pi pi-calendar"></i>
                <span>{{ currentDate }}</span>
                <span class="time-separator">|</span>
                <i class="pi pi-clock"></i>
                <span>{{ currentTime }}</span>
            </div>
        </div>

        <!-- Botón de salir -->
        <div class="topbar-right">
            <button class="logout-btn" @click="onSalir">
                <i class="pi pi-power-off"></i>
                <span class="logout-text">Salir</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';

const { onMenuToggle } = useLayout();
const router = useRouter();

// Datos del usuario - ahora obtenido del localStorage
const userName = ref('');
const showDateTime = ref(true);

// Fecha y hora
const currentTime = ref('');
const currentDate = ref('');

// Obtener datos del usuario al montar el componente
onBeforeMount(() => {
    loadUserData();
});

// Inicializar fecha y hora
onMounted(() => {
    updateDateTime();
    setInterval(updateDateTime, 60000);
    
    // Escuchar cambios de tamaño de pantalla para responsividad
    window.addEventListener('resize', handleResize);
    handleResize();
});

// Cargar datos del usuario desde localStorage
const loadUserData = () => {
    try {
        // Intenta obtener del localStorage (ajusta según tu implementación)
        const userData = localStorage.getItem('user_data');
        if (userData) {
            const parsedData = JSON.parse(userData);
            userName.value = parsedData.name || parsedData.username || parsedData.email || 'Administrador';
        } else {
            // Si no hay datos, intenta obtener de otras fuentes
            const token = localStorage.getItem('access_token');
            if (token) {
                // Podrías decodificar el JWT si está en ese formato
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    try {
                        const payload = JSON.parse(atob(tokenParts[1]));
                        userName.value = payload.name || payload.username || payload.email || 'Administrador';
                    } catch (e) {
                        console.warn('No se pudo decodificar el token');
                        userName.value = 'Administrador';
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        userName.value = 'Administrador';
    }
};

// Manejar cambio de tamaño de pantalla
const handleResize = () => {
    showDateTime.value = window.innerWidth > 768;
};

const updateDateTime = () => {
    const now = new Date();
    
    // Hora
    currentTime.value = now.toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    // Fecha
    currentDate.value = now.toLocaleDateString('es-BO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// Función de salir
const onSalir = () => {
    // Limpiar datos de sesión
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    sessionStorage.clear();
    
    // Redirigir al login
    router.push({ name: 'Login' });
};
</script>

<style lang="scss" scoped>
.layout-topbar {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
    color: white;
    display: flex;
    align-items: center;
    padding: 0 1.5rem;
    height: 70px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Logo mejorado */
.layout-topbar-logo {
    text-decoration: none;
    margin-right: 2rem;
    min-width: 200px;
    display: flex;
    align-items: center;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
}

.logo-image {
    height: 45px;
    width: auto;
    max-height: 50px;
    object-fit: contain;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.logo-text {
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.logo-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
    line-height: 1.2;
    white-space: nowrap;
}

/* Botón del menú lateral */
.menu-toggle-btn {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1.5rem;
    flex-shrink: 0;
    
    &:hover {
        background: rgba(102, 126, 234, 0.3);
        border-color: #667eea;
        transform: scale(1.05);
    }
    
    i {
        font-size: 1.3rem;
    }
}

/* Centro del topbar mejorado */
.topbar-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    min-width: 0; /* Para evitar overflow */
}

.welcome-message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 20px;
    font-size: 0.95rem;
    color: #e2e8f0;
    white-space: nowrap;
    flex-shrink: 0;
    
    i {
        color: #667eea;
        font-size: 1.1rem;
    }
    
    span {
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
    }
}

.datetime-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    font-size: 0.9rem;
    color: #cbd5e0;
    
    i {
        color: #68d391;
        font-size: 1rem;
    }
    
    .time-separator {
        opacity: 0.5;
        margin: 0 0.25rem;
    }
}

/* Botón de salir */
.topbar-right {
    margin-left: auto;
}

.logout-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(229, 62, 62, 0.4);
    }
    
    &:active {
        transform: translateY(0);
    }
    
    i {
        font-size: 1.1rem;
    }
    
    .logout-text {
        font-weight: 500;
    }
}

/* Responsive mejorado */
@media (max-width: 1024px) {
    .topbar-center {
        gap: 1rem;
    }
    
    .datetime-info {
        padding: 0.75rem 1rem;
        font-size: 0.85rem;
    }
    
    .welcome-message span {
        max-width: 150px;
    }
}

@media (max-width: 768px) {
    .layout-topbar {
        padding: 0 1rem;
        height: 60px;
    }
    
    .layout-topbar-logo {
        min-width: auto;
        margin-right: 1rem;
    }
    
    .logo-image {
        height: 35px;
    }
    
    .logo-text {
        display: none;
    }
    
    .menu-toggle-btn {
        width: 40px;
        height: 40px;
        margin-right: 1rem;
        
        i {
            font-size: 1.2rem;
        }
    }
    
    .topbar-center {
        justify-content: flex-end;
        gap: 0.5rem;
    }
    
    .welcome-message {
        padding: 0.5rem 1rem;
        
        span {
            display: none;
        }
        
        i {
            font-size: 1.2rem;
        }
    }
    
    .datetime-info {
        display: none;
    }
    
    .logout-btn {
        padding: 0.5rem 1rem;
        
        .logout-text {
            display: none;
        }
    }
}

@media (max-width: 480px) {
    .layout-topbar {
        padding: 0 0.75rem;
    }
    
    .logo-image {
        height: 30px;
    }
    
    .menu-toggle-btn {
        width: 36px;
        height: 36px;
        margin-right: 0.75rem;
    }
    
    .welcome-message {
        padding: 0.4rem 0.8rem;
        background: transparent;
        
        i {
            font-size: 1.1rem;
        }
    }
    
    .logout-btn {
        padding: 0.4rem 0.8rem;
    }
}

/* Tema claro */
@media (prefers-color-scheme: light) {
    .layout-topbar {
        background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
        border-bottom: 1px solid #e2e8f0;
        color: #2d3748;
    }
    
    .logo-title {
        color: #2d3748;
    }
    
    .logo-subtitle {
        color: #718096;
    }
    
    .menu-toggle-btn {
        background: rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(0, 0, 0, 0.1);
        color: #4a5568;
        
        &:hover {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
        }
    }
    
    .welcome-message {
        background: rgba(102, 126, 234, 0.1);
        color: #4a5568;
        
        i {
            color: #667eea;
        }
    }
    
    .datetime-info {
        background: rgba(0, 0, 0, 0.05);
        color: #718096;
        
        i {
            color: #48bb78;
        }
    }
}

/* Animaciones */
.logo-image {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>