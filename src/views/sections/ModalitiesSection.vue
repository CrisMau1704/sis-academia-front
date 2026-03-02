<template>
  <section id="modalidades" class="modalidades">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">NUESTRAS <span class="highlight">MODALIDADES</span></h2>
        <p class="section-subtitle">Elige la disciplina que mejor se adapte a tus objetivos</p>
      </div>

      <div class="modalidades-grid">
        <div v-for="modalidad in modalidades" :key="modalidad.id" class="modalidad-card">
          <div class="modalidad-header">
            <div class="modalidad-icon">
              <i :class="modalidad.icono"></i>
            </div>
            <h3 class="modalidad-title">{{ modalidad.nombre }}</h3>
          </div>
          <div class="modalidad-body">
            <div class="modalidad-info">
              <div class="info-item">
                <i class="pi pi-calendar"></i>
                <span>{{ modalidad.clases_mensuales }} clases/mes</span>
              </div>
              <div class="info-item">
                <i class="pi pi-shield"></i>
                <span>{{ modalidad.permisos_maximos }} permisos/mes</span>
              </div>
              <div class="info-item">
                <i class="pi pi-clock"></i>
                <span>{{ modalidad.duracion_clase }} min/clase</span>
              </div>
            </div>
            <div class="modalidad-price">
              <span class="price-label">Desde</span>
              <h4 class="price">Bs. {{ modalidad.precio_mensual }}</h4>
              <span class="price-period">/mes</span>
            </div>
            <div class="modalidad-features">
              <ul>
                <li v-for="feature in modalidad.features" :key="feature">
                  <i class="pi pi-check"></i> {{ feature }}
                </li>
              </ul>
            </div>
          </div>
          <div class="modalidad-footer">
            <Button 
              label="Ver Horarios" 
              icon="pi pi-clock"
              class="modalidad-btn"
              @click="$emit('ver-horarios', modalidad.id)"
              outlined
              severity="danger"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import Button from 'primevue/button';

const props = defineProps({
  modalidades: {
    type: Array,
    required: true
  }
});

defineEmits(['ver-horarios']);
</script>

<style scoped>
.modalidades {
  background: white;
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

.modalidades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.modalidad-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid #e2e8f0;
}

.modalidad-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.modalidad-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 2rem;
  text-align: center;
}

.modalidad-icon {
  font-size: 3rem;
  color: #dc2626;
  margin-bottom: 1rem;
}

.modalidad-title {
  color: white;
  font-size: 1.5rem;
  margin: 0;
}

.modalidad-body {
  padding: 2rem;
}

.modalidad-info {
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #64748b;
}

.info-item i {
  color: #dc2626;
}

.modalidad-price {
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 10px;
}

.price-label {
  color: #64748b;
  font-size: 0.9rem;
}

.price {
  color: #dc2626;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.price-period {
  color: #94a3b8;
}

.modalidad-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.modalidad-features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #475569;
}

.modalidad-features i {
  color: #10b981;
}

.modalidad-footer {
  padding: 1rem 2rem 2rem;
}

.modalidad-btn {
  width: 100%;
}
</style>