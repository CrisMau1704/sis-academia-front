<template>
    <div class="layout-topbar">
        <!-- Logo y título -->
        <router-link to="/" class="layout-topbar-logo">
    <div class="logo-container">
        <img src="/public/demo/images/logo1.jpeg" alt="Logo" class="logo-image">
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
                <span>Bienvenido, {{ userName }}</span>
            </div>
        </div>

        <!-- Botón de salir -->
        <div class="topbar-right">
            <button class="logout-btn" @click="onSalir">
                <i class="pi pi-power-off"></i>
                <span>Salir</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';

const { onMenuToggle } = useLayout();
const router = useRouter();

// Datos del usuario
const userName = ref('Administrador');

// Fecha y hora
const currentTime = ref('');
const currentDate = ref('');

// Inicializar fecha y hora
onMounted(() => {
    updateDateTime();
    setInterval(updateDateTime, 60000);
});

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
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
};

// Función de salir
const onSalir = () => {
    localStorage.removeItem("access_token");
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

/* Logo */
.layout-topbar-logo {
    text-decoration: none;
    margin-right: 2rem;
    min-width: 220px;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.logo-icon {
    font-size: 2rem;
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
}

.logo-text {
    display: flex;
    flex-direction: column;
}

.logo-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
    line-height: 1.2;
}

.logo-subtitle {
    font-size: 0.75rem;
    color: #a0aec0;
    opacity: 0.8;
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
    
    &:hover {
        background: rgba(102, 126, 234, 0.3);
        border-color: #667eea;
        transform: scale(1.05);
    }
    
    i {
        font-size: 1.3rem;
    }
}

/* Centro del topbar */
.topbar-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
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
    
    i {
        color: #667eea;
        font-size: 1.1rem;
    }
    
    span {
        font-weight: 500;
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
    
    span {
        font-weight: 500;
    }
}

/* Responsive */
@media (max-width: 768px) {
    .layout-topbar {
        padding: 0 1rem;
    }
    
    .logo-subtitle {
        display: none;
    }
    
    .logo-text {
        display: none;
    }
    
    .logo-icon {
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
    }
    
    .welcome-message span {
        display: none;
    }
    
    .welcome-message {
        padding: 0.5rem;
        background: transparent;
    }
    
    .logout-btn {
        padding: 0.5rem;
        
        span {
            display: none;
        }
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
}
</style>