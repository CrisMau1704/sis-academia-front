<template>
  <header class="header" :class="{ 'menu-open': mobileMenuOpen }">
    <div class="header-container">
      <!-- Logo y título -->
      <div class="logo-section">
        <img src="/demo/images/logo1.jpeg" alt="Alianza Bolivia MMA" class="logo" />
        <div class="title-container">
          <h1 class="title-main">ALIANZA BOLIVIA</h1>
          <h2 class="title-sub">MMA</h2>
        </div>
      </div>

      <!-- Botón menú hamburguesa -->
      <button 
        class="mobile-menu-btn" 
        @click="toggleMobileMenu"
        :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
      >
        <span class="hamburger-line" :class="{ 'open': mobileMenuOpen }"></span>
        <span class="hamburger-line" :class="{ 'open': mobileMenuOpen }"></span>
        <span class="hamburger-line" :class="{ 'open': mobileMenuOpen }"></span>
      </button>

      <!-- Navegación escritorio -->
      <nav class="nav-menu desktop-menu">
        <a href="#presentacion" class="nav-link" @click="closeMobileMenu">Gym</a>
        <a href="#premios" class="nav-link" @click="closeMobileMenu">Logros</a>
        <a href="#peleadores" class="nav-link" @click="closeMobileMenu">Peleadores</a>
        <a href="#instructores" class="nav-link" @click="closeMobileMenu">Instructores</a>
        <a href="#clases-particulares" class="nav-link" @click="closeMobileMenu">Clases Particulares</a>
        <a href="#modalidades" class="nav-link" @click="closeMobileMenu">Modalidades</a>
        <a href="#horarios" class="nav-link" @click="closeMobileMenu">Horarios</a>
        <a href="#sucursales" class="nav-link" @click="closeMobileMenu">Sucursales</a>
        <a href="#tienda" class="nav-link" @click="closeMobileMenu">Tienda</a>
        <a href="#inscripcion" class="nav-link" @click="closeMobileMenu">Inscríbete</a>
        <Button 
          label="Acceso Sistema" 
          icon="pi pi-sign-in" 
          class="login-btn"
          @click="$emit('open-login')"
          severity="danger"
        />
      </nav>

      <!-- Menú móvil -->
      <transition name="slide-fade">
        <div v-if="mobileMenuOpen" class="mobile-menu">
          <nav class="mobile-nav">
            <a href="#presentacion" class="mobile-nav-link" @click="closeMobileMenu">
              <i class="pi pi-building"></i> Gym
            </a>
            <a href="#premios" class="mobile-nav-link" @click="closeMobileMenu">
              <i class="pi pi-trophy"></i> Logros
            </a>
            <a href="#peleadores" class="mobile-nav-link" @click="closeMobileMenu">
              <i class="pi pi-users"></i> Peleadores
            </a>
            <a href="#instructores" class="mobile-nav-link" @click="closeMobileMenu">
              <i class="pi pi-star"></i> Instructores
            </a>
            <a href="#clases-particulares" class="mobile-nav-link" @click="closeMobileMenu">
              <i class="pi pi-clock"></i> Clases Particulares
            </a>
            <a href="#modalidades" class="mobile-nav-link" @click="closeMobileMenu">
              <i class="pi pi-shield"></i> Modalidades
            </a>
            <a href="#horarios" class="mobile-nav-link" @click="closeMobileMenu">
              <i class="pi pi-calendar"></i> Horarios
            </a>
            <a href="#sucursales" class="mobile-nav-link" @click="closeMobileMenu">
              <i class="pi pi-map-marker"></i> Sucursales
            </a>
            <a href="#tienda" class="mobile-nav-link" @click="closeMobileMenu">
              <i class="pi pi-shopping-bag"></i> Tienda
            </a>
            <a href="#inscripcion" class="mobile-nav-link" @click="closeMobileMenu">
              <i class="pi pi-user-plus"></i> Inscríbete
            </a>
            <Button 
              label="Acceso Sistema" 
              icon="pi pi-sign-in" 
              class="mobile-login-btn"
              @click="$emit('open-login')"
              severity="danger"
              fluid
            />
          </nav>
        </div>
      </transition>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Button from 'primevue/button';

defineEmits(['open-login']);

const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  if (mobileMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
  document.body.style.overflow = '';
};

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (mobileMenuOpen.value && !e.target.closest('.header-container')) {
      closeMobileMenu();
    }
  });
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  position: relative;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1002;
}

.logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dc2626;
}

.title-container {
  display: flex;
  flex-direction: column;
}

.title-main {
  font-size: 1.8rem;
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: 1px;
  margin: 0;
  line-height: 1;
}

.title-sub {
  font-size: 2rem;
  font-weight: 800;
  color: #dc2626;
  letter-spacing: 2px;
  margin: 0;
  line-height: 1;
  text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1002;
}

.hamburger-line {
  width: 100%;
  height: 3px;
  background-color: #e2e8f0;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.hamburger-line.open:nth-child(1) {
  transform: translateY(10px) rotate(45deg);
}

.hamburger-line.open:nth-child(2) {
  opacity: 0;
}

.hamburger-line.open:nth-child(3) {
  transform: translateY(-10px) rotate(-45deg);
}

.desktop-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  font-size: 0.95rem;
}

.nav-link:hover {
  color: #dc2626;
}

.login-btn {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important;
  border: none !important;
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  z-index: 1001;
  padding: 100px 2rem 2rem;
  overflow-y: auto;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 300px;
  margin: 0 auto;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #e2e8f0;
  text-decoration: none;
  font-size: 1.3rem;
  font-weight: 500;
  padding: 1rem;
  border-radius: 10px;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.05);
}

.mobile-nav-link i {
  color: #dc2626;
  font-size: 1.5rem;
  width: 30px;
}

.mobile-nav-link:hover {
  background: rgba(220, 38, 38, 0.1);
  transform: translateX(10px);
}

.mobile-login-btn {
  margin-top: 1rem;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important;
  border: none !important;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
  }
  
  .desktop-menu {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .logo {
    width: 50px;
    height: 50px;
  }
  
  .title-main {
    font-size: 1.4rem;
  }
  
  .title-sub {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .logo-section {
    gap: 0.5rem;
  }
  
  .logo {
    width: 40px;
    height: 40px;
  }
  
  .title-main {
    font-size: 1.2rem;
  }
  
  .title-sub {
    font-size: 1.4rem;
  }
}
</style>