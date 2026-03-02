<template>
  <section id="premios" class="premios">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">PREMIOS Y <span class="highlight">LOGROS</span></h2>
        <p class="section-subtitle">Reconocimientos que avalan nuestra trayectoria</p>
      </div>

      <div class="premios-stats">
        <div class="stat-premio">
          <i class="pi pi-trophy"></i>
          <h3>25+</h3>
          <p>Campeonatos Nacionales</p>
        </div>
        <div class="stat-premio">
          <i class="pi pi-star"></i>
          <h3>15</h3>
          <p>Cinturones Internacionales</p>
        </div>
        <div class="stat-premio">
          <i class="pi pi-globe"></i>
          <h3>8</h3>
          <p>Participaciones Mundiales</p>
        </div>
        <div class="stat-premio">
          <i class="pi pi-flag"></i>
          <h3>50+</h3>
          <p>Medallas de Oro</p>
        </div>
      </div>

      <div class="premios-grid">
        <div v-for="premio in premios" :key="premio.id" class="premio-card">
          <div class="premio-icon">
            <i :class="premio.icono"></i>
          </div>
          <div class="premio-content">
            <h4>{{ premio.titulo }}</h4>
            <p class="premio-fecha">{{ premio.fecha }}</p>
            <p class="premio-descripcion">{{ premio.descripcion }}</p>
            <Tag :value="premio.categoria" :severity="premio.severity" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { defineProps } from 'vue';
import Tag from 'primevue/tag';

const props = defineProps({
  premios: {
    type: Array,
    required: true
  }
});
</script>

<style scoped>
.premios {
  background: #f8fafc;
  padding: 4rem 0;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.highlight {
  color: #dc2626;
}

.section-subtitle {
  color: #64748b;
  font-size: 1.2rem;
}

.premios-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-premio {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.stat-premio i {
  font-size: 3rem;
  color: #dc2626;
  margin-bottom: 1rem;
}

.stat-premio h3 {
  font-size: 2.5rem;
  color: #1e293b;
  margin: 0.5rem 0;
}

.stat-premio p {
  color: #64748b;
  font-size: 1.1rem;
}

.premios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.premio-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  transition: transform 0.3s;
}

.premio-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.premio-icon {
  background: #dc2626;
  color: white;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.premio-icon i {
  font-size: 2rem;
}

.premio-content {
  padding: 1.5rem;
  flex: 1;
}

.premio-content h4 {
  color: #1e293b;
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
}

.premio-fecha {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.premio-descripcion {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1rem;
}

@media (max-width: 1024px) {
  .premios-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .premios-stats {
    grid-template-columns: 1fr;
  }
  
  .premios-grid {
    grid-template-columns: 1fr;
  }
}
</style>