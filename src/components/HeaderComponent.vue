<template>
  <header class="header" :class="{ 'scrolled': isScrolled }">
    <div class="header-container">
      <!-- Logo y título -->
      <div class="logo-section">
        <img src="/demo/images/logo1.jpeg" alt="Alianza Bolivia MMA" class="logo" />
        <div class="title-container">
          <span class="title-main">ALIANZA BOLIVIA</span>
          <span class="title-sub">MMA</span>
        </div>
      </div>

      <!-- Botón menú hamburguesa simple -->
      <button 
        class="menu-toggle" 
        @click="toggleMenu"
        :class="{ 'active': menuOpen }"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Menú desktop -->
      <nav class="desktop-menu">
        <a 
          v-for="item in menuItems" 
          :key="item.id"
          :href="item.href" 
          class="nav-link"
          :class="{ 'active': activeSection === item.id }"
        >
          {{ item.label }}
        </a>
        <button class="login-btn" @click="$emit('open-login')">
          <i class="pi pi-sign-in"></i>
          Acceso
        </button>
      </nav>

      <!-- Menú móvil -->
      <transition name="fade">
        <div v-if="menuOpen" class="mobile-menu-overlay" @click="closeMenu"></div>
      </transition>
      
      <transition name="slide-right">
        <div v-if="menuOpen" class="mobile-menu">
          <div class="mobile-menu-header">
            <img src="/demo/images/logo1.jpeg" alt="Alianza Bolivia MMA" class="mobile-logo" />
            <button class="mobile-close" @click="closeMenu">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <nav class="mobile-nav">
            <a 
              v-for="item in menuItems" 
              :key="item.id"
              :href="item.href" 
              class="mobile-link"
              @click="closeMenu"
            >
              <i :class="item.icon"></i>
              <span>{{ item.label }}</span>
            </a>
            <button class="mobile-login-btn" @click="$emit('open-login')">
              <i class="pi pi-sign-in"></i>
              Acceso al Sistema
            </button>
          </nav>
        </div>
      </transition>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineEmits(['open-login']);

const menuOpen = ref(false);
const isScrolled = ref(false);
const activeSection = ref('presentacion');

const menuItems = [
  { id: 'presentacion', href: '#presentacion', label: 'Gym', icon: 'pi pi-building' },
  { id: 'premios', href: '#premios', label: 'Logros', icon: 'pi pi-trophy' },
  { id: 'peleadores', href: '#peleadores', label: 'Peleadores', icon: 'pi pi-users' },
  { id: 'instructores', href: '#instructores', label: 'Instructores', icon: 'pi pi-star' },
  { id: 'clases-particulares', href: '#clases-particulares', label: 'Clases', icon: 'pi pi-clock' },
  { id: 'modalidades', href: '#modalidades', label: 'Modalidades', icon: 'pi pi-shield' },
  { id: 'sucursales', href: '#sucursales', label: 'Sucursales', icon: 'pi pi-map-marker' },
  { id: 'tienda', href: '#tienda', label: 'Tienda', icon: 'pi pi-shopping-bag' },
  { id: 'galeria', href: '#galeria', label: 'Galeria', icon: 'pi pi-shopping-bag' },
  { id: 'inscripcion', href: '#inscripcion', label: 'Inscríbete', icon: 'pi pi-user-plus' }
];

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
  if (menuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const closeMenu = () => {
  menuOpen.value = false;
  document.body.style.overflow = '';
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
  
  // Detectar sección activa
  for (const item of menuItems) {
    const element = document.getElementById(item.id);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        activeSection.value = item.id;
        break;
      }
    }
  }
};

// Cerrar con ESC
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && menuOpen.value) {
    closeMenu();
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: transparent;
  transition: all 0.3s ease;
  padding: 1.2rem 0;
}

.header.scrolled {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 0.8rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

/* Logo */
.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ffffff;
}

.title-container {
  display: flex;
  flex-direction: column;
}

.title-main {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1px;
  line-height: 1.2;
}

.title-sub {
  font-size: 1.1rem;
  font-weight: 500;
  color: #94a3b8;
  letter-spacing: 2px;
  line-height: 1;
}

/* Botón menú hamburguesa simple */
.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.menu-toggle span {
  width: 100%;
  height: 3px;
  background-color: #ffffff;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.menu-toggle.active span:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.menu-toggle.active span:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

/* Menú desktop */
.desktop-menu {
  display: flex;
  align-items: center;
  gap: 1.8rem;
}

.nav-link {
  color: #e2e8f0;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.3s;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #dc2626;
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: #ffffff;
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

.nav-link.active {
  color: #ffffff;
  font-weight: 600;
}

.login-btn {
  background: #dc2626;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.login-btn:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.login-btn i {
  font-size: 1rem;
}

/* Menú móvil */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1001;
}

.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  z-index: 1002;
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.3);
}

.mobile-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #334155;
}

.mobile-logo {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dc2626;
}

.mobile-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1e293b;
  border: none;
  color: #ffffff;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.mobile-close:hover {
  background: #334155;
}

.mobile-nav {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: #e2e8f0;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  font-weight: 500;
}

.mobile-link i {
  width: 24px;
  color: #94a3b8;
  font-size: 1.1rem;
  transition: color 0.3s;
}

.mobile-link:hover {
  background: #1e293b;
  padding-left: 1.5rem;
  color: #ffffff;
}

.mobile-link:hover i {
  color: #dc2626;
}

.mobile-login-btn {
  margin-top: 1rem;
  padding: 1rem;
  background: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  transition: all 0.3s;
}

.mobile-login-btn:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.mobile-login-btn i {
  font-size: 1.1rem;
}

/* Animaciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 1024px) {
  .desktop-menu {
    gap: 1.2rem;
  }
  
  .nav-link {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }
  
  .desktop-menu {
    display: none;
  }
  
  .logo {
    width: 45px;
    height: 45px;
  }
  
  .title-main {
    font-size: 1.1rem;
  }
  
  .title-sub {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 1rem;
  }
  
  .logo-section {
    gap: 0.5rem;
  }
  
  .logo {
    width: 40px;
    height: 40px;
  }
  
  .title-main {
    font-size: 1rem;
  }
  
  .title-sub {
    font-size: 0.9rem;
  }
  
  .mobile-menu {
    width: 100%;
  }
}
</style>