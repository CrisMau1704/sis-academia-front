<template>
  <section id="inicio" class="hero">
    <div class="hero-overlay"></div>
    
    <!-- Carrusel de fondo -->
    <div class="hero-carousel">
      <div 
        v-for="(image, index) in images" 
        :key="index"
        class="carousel-slide"
        :class="{ 'active': currentSlide === index }"
        :style="{ backgroundImage: `url(${image})` }"
      ></div>
    </div>

    <!-- Indicadores del carrusel -->
    <div class="carousel-indicators">
      <button 
        v-for="(image, index) in images" 
        :key="index"
        class="indicator"
        :class="{ 'active': currentSlide === index }"
        @click="goToSlide(index)"
      ></button>
    </div>

    <!-- Controles del carrusel -->
    <button class="carousel-control prev" @click="prevSlide">
      <i class="pi pi-chevron-left"></i>
    </button>
    <button class="carousel-control next" @click="nextSlide">
      <i class="pi pi-chevron-right"></i>
    </button>

    <!-- Contenido principal - CON TUS PALABRAS ORIGINALES -->
    <div class="hero-content">
      <div class="hero-text">
        <h3 class="hero-subtitle">ACADEMIA DE ARTES MARCIALES</h3>
        <h1 class="hero-title">
          FORJA TU <span class="hero-highlight">DISCIPLINA</span><br>
          TRANSFORMA TU <span class="hero-highlight">CUERPO</span>
        </h1>
        <p class="hero-description">
          Entrenamiento profesional en MMA, Jiu-Jitsu, Boxeo y más.<br>
          Clases de prueba gratuitas - ¡Ven y conócenos!
        </p>
        <div class="hero-buttons">
          <Button 
            label="Ver Horarios" 
            icon="pi pi-calendar"
            class="hero-btn-primary"
            @click="$emit('scroll-to-horarios')"
            severity="danger"
          />
          <Button 
            label="Inscríbete Hoy" 
            icon="pi pi-user-plus"
            class="hero-btn-secondary"
            @click="$emit('scroll-to-inscripcion')"
            outlined
          />
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="scroll-indicator" @click="$emit('scroll-to-presentacion')">
      <span class="scroll-text">Descubre más</span>
      <i class="pi pi-chevron-down"></i>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Button from 'primevue/button';

defineEmits(['scroll-to-horarios', 'scroll-to-inscripcion', 'scroll-to-presentacion']);

// Imágenes de alta calidad
const images = ref([
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1626338176640-91b14b3e54c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
]);

const currentSlide = ref(0);
const autoPlayInterval = ref(null);
const autoPlayDelay = 5000;

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % images.value.length;
  resetAutoPlay();
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + images.value.length) % images.value.length;
  resetAutoPlay();
};

const goToSlide = (index) => {
  currentSlide.value = index;
  resetAutoPlay();
};

const startAutoPlay = () => {
  autoPlayInterval.value = setInterval(() => {
    nextSlide();
  }, autoPlayDelay);
};

const stopAutoPlay = () => {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value);
    autoPlayInterval.value = null;
  }
};

const resetAutoPlay = () => {
  stopAutoPlay();
  startAutoPlay();
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<style scoped>
.hero {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

/* Overlay con gradiente mejorado */
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.85) 0%,
    rgba(30, 41, 59, 0.8) 50%,
    rgba(15, 23, 42, 0.85) 100%
  );
  z-index: 1;
}

/* Carrusel */
.hero-carousel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
  animation: zoomEffect 20s infinite;
}

@keyframes zoomEffect {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Indicadores */
.carousel-indicators {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 3;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.5);
}

.indicator.active {
  background: #dc2626;
  transform: scale(1.2);
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
}

/* Controles */
.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 3;
  font-size: 1.5rem;
  backdrop-filter: blur(5px);
}

.carousel-control:hover {
  background: #dc2626;
  border-color: #dc2626;
  transform: translateY(-50%) scale(1.1);
}

.carousel-control.prev {
  left: 30px;
}

.carousel-control.next {
  right: 30px;
}

/* Contenido principal - CON TUS ESTILOS ORIGINALES */
.hero-content {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.hero-text {
  max-width: 800px;
  text-align: center;
  color: white;
  animation: fadeInUp 1s ease-out;
}

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

/* TUS ESTILOS ORIGINALES */
.hero-subtitle {
  color: #94a3b8;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-title {
  color: #e2e8f0;
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 2rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.hero-highlight {
  color: #dc2626;
  text-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
  position: relative;
  display: inline-block;
}

.hero-highlight::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #dc2626, transparent);
}

.hero-description {
  font-size: 1.3rem;
  color: #e2e8f0;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.hero-btn-primary {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important;
  border: none !important;
  padding: 1rem 2.5rem !important;
  font-size: 1.2rem !important;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
  transition: transform 0.3s, box-shadow 0.3s !important;
}

.hero-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4) !important;
}

.hero-btn-secondary {
  background: transparent !important;
  border: 2px solid #dc2626 !important;
  color: white !important;
  padding: 1rem 2.5rem !important;
  font-size: 1.2rem !important;
  backdrop-filter: blur(5px);
  transition: all 0.3s !important;
}

.hero-btn-secondary:hover {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
  transform: translateY(-2px);
}

/* Scroll indicator - NUEVO */
.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: white;
  z-index: 3;
  cursor: pointer;
  animation: bounce 2s infinite;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.scroll-indicator:hover {
  opacity: 1;
}

.scroll-text {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.scroll-indicator i {
  font-size: 1.2rem;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-title {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  .hero {
    height: 100vh;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
    letter-spacing: 2px;
  }

  .hero-description {
    font-size: 1.1rem;
  }

  .hero-buttons {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }

  .carousel-control {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .carousel-control.prev {
    left: 10px;
  }

  .carousel-control.next {
    right: 10px;
  }

  .indicator {
    width: 8px;
    height: 8px;
  }

  .carousel-indicators {
    bottom: 80px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-content {
    padding: 0 1rem;
  }

  .scroll-text {
    font-size: 0.8rem;
  }
}
</style>