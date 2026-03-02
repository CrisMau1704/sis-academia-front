<template>
  <section class="stats">
    <div class="stats-container">
      <div class="stat-item">
        <i class="pi pi-users stat-icon"></i>
        <h3 class="stat-number">1000+</h3>
        <p class="stat-label">Estudiantes</p>
      </div>
      <div class="stat-item">
        <i class="pi pi-calendar stat-icon"></i>
        <h3 class="stat-number">50+</h3>
        <p class="stat-label">Clases Semanales</p>
      </div>
      <div class="stat-item">
        <i class="pi pi-shield stat-icon"></i>
        <h3 class="stat-number">10+</h3>
        <p class="stat-label">Modalidades</p>
      </div>
      <div class="stat-item">
        <i class="pi pi-trophy stat-icon"></i>
        <h3 class="stat-number">15+</h3>
        <p class="stat-label">Entrenadores Certificados</p>
      </div>
    </div>
  </section>
</template>

<script setup>
// Sin lógica por ahora, solo estadísticas estáticas
</script>

<style scoped>
.stats {
  background: #f8fafc;
  padding: 4rem 2rem;
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 2rem;
}

.stat-icon {
  font-size: 3rem;
  color: #dc2626;
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0.5rem 0;
}

.stat-label {
  color: #64748b;
  font-size: 1.1rem;
}

@media (max-width: 1024px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .stats {
    padding: 2rem 1rem;
  }
}
</style>