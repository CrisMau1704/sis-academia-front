<template>
  <section id="presentacion" class="presentacion">
    <div class="section-container">
      <!-- Header estilo premios -->
      <div class="section-header">
        <h2 class="section-title">NUESTRA <span class="highlight">HISTORIA</span></h2>
        <p class="section-subtitle">Más de 8 años formando campeones dentro y fuera del ring</p>
      </div>

      <!-- Stats estilo premios -->
      <div class="presentacion-stats">
        <div class="stat-item">
          <i class="pi pi-calendar"></i>
          <h3>2015</h3>
          <p>Año de Fundación</p>
        </div>
        <div class="stat-item">
          <i class="pi pi-users"></i>
          <h3>500+</h3>
          <p>Atletas Formados</p>
        </div>
        <div class="stat-item">
          <i class="pi pi-trophy"></i>
          <h3>15</h3>
          <p>Títulos Nacionales</p>
        </div>
        <div class="stat-item">
          <i class="pi pi-star"></i>
          <h3>8</h3>
          <p>Años de Trayectoria</p>
        </div>
      </div>

      <!-- Grid de historia estilo premios-card -->
      <div class="presentacion-grid">
        <!-- Tarjeta de Fundador -->
       

        <!-- Tarjeta de Misión -->
        <div class="presentacion-card">
          <div class="card-icon">
            <i class="pi pi-bullseye"></i>
          </div>
          <div class="card-content">
            <h4>Misión</h4>
            <p class="card-descripcion">Transformar vidas a través de la disciplina marcial, formando atletas íntegros dentro y fuera del ring.</p>
            <Tag value="MISIÓN" severity="danger" />
          </div>
        </div>

        <!-- Tarjeta de Visión -->
        <div class="presentacion-card">
          <div class="card-icon">
            <i class="pi pi-eye"></i>
          </div>
          <div class="card-content">
            <h4>Visión</h4>
            <p class="card-descripcion">Ser el gimnasio referente en Latinoamérica en formación de peleadores profesionales y desarrollo personal.</p>
            <Tag value="VISIÓN" severity="danger" />
          </div>
        </div>

        <!-- Tarjeta de Historia -->
        <div class="presentacion-card presentacion-card-large">
          <div class="card-icon">
            <i class="pi pi-book-open"></i>
          </div>
          <div class="card-content">
            <h4>Nacidos para Inspirar</h4>
            <p class="card-fecha">Desde 2015</p>
            <p class="card-descripcion">Alianza Bolivia MMA abrió sus puertas con un sueño claro: crear un espacio donde la pasión por las artes marciales se encuentre con la excelencia profesional. Lo que comenzó como un pequeño gimnasio de 50m², hoy es el epicentro de las artes marciales mixtas en Bolivia.</p>
            <Tag value="HISTORIA" severity="danger" />
          </div>
        </div>
      </div>

      <!-- Valores en grid estilo premios -->
      <div class="valores-section">
        <h3 class="valores-title">Nuestros <span class="highlight">Valores</span></h3>
        <div class="valores-grid">
          <div v-for="valor in valores" :key="valor.nombre" class="valor-card">
            <div class="valor-icon">
              <i :class="valor.icono"></i>
            </div>
            <div class="valor-content">
              <h4>{{ valor.nombre }}</h4>
              <p>{{ valor.descripcion }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import Tag from 'primevue/tag';

const valores = [
  {
    nombre: 'Disciplina',
    descripcion: 'La base de todo logro',
    icono: 'pi pi-shield'
  },
  {
    nombre: 'Respeto',
    descripcion: 'Por uno y por todos',
    icono: 'pi pi-heart'
  },
  {
    nombre: 'Excelencia',
    descripcion: 'Mejoramos cada día',
    icono: 'pi pi-star'
  },
  {
    nombre: 'Comunidad',
    descripcion: 'Juntos somos más fuertes',
    icono: 'pi pi-users'
  },
  {
    nombre: 'Superación',
    descripcion: 'Sin límites ni excusas',
    icono: 'pi pi-chart-line'
  },
  {
    nombre: 'Humildad',
    descripcion: 'Siempre aprendiendo',
    icono: 'pi pi-lock-open'
  }
];
</script>

<style scoped>
.presentacion {
  background: #f8fafc;
  padding: 4rem 0;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header estilo premios */
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

/* Stats estilo premios */
.presentacion-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;
}

.stat-item {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.stat-item i {
  font-size: 2.5rem;
  color: #dc2626;
  margin-bottom: 1rem;
}

.stat-item h3 {
  font-size: 2rem;
  color: #1e293b;
  margin: 0.5rem 0;
  font-weight: 700;
}

.stat-item p {
  color: #64748b;
  font-size: 1rem;
}

/* Grid de tarjetas */
.presentacion-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;
}

.presentacion-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  transition: all 0.3s;
  border: 1px solid #e2e8f0;
}

.presentacion-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(220, 38, 38, 0.1);
  border-color: #dc2626;
}

.presentacion-card-large {
  grid-column: span 2;
}

.card-icon {
  background: #dc2626;
  color: white;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon i {
  font-size: 2rem;
}

.card-content {
  padding: 1.5rem;
  flex: 1;
}

.card-content h4 {
  color: #1e293b;
  font-size: 1.3rem;
  margin: 0 0 0.5rem;
  font-weight: 700;
}

.card-subtitle {
  color: #dc2626;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.card-fecha {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.card-descripcion {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

/* Sección de valores */
.valores-section {
  margin-top: 3rem;
}

.valores-title {
  text-align: center;
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 2rem;
  font-weight: 700;
}

.valores-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.valor-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border: 1px solid #e2e8f0;
}

.valor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(220, 38, 38, 0.1);
  border-color: #dc2626;
}

.valor-icon {
  background: #fee2e2;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
}

.valor-card:hover .valor-icon {
  background: #dc2626;
}

.valor-icon i {
  font-size: 1.5rem;
  color: #dc2626;
  transition: all 0.3s;
}

.valor-card:hover .valor-icon i {
  color: white;
}

.valor-content h4 {
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.valor-content p {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .presentacion-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .presentacion-grid {
    grid-template-columns: 1fr;
  }
  
  .presentacion-card-large {
    grid-column: span 1;
  }
  
  .valores-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }
  
  .presentacion-stats {
    grid-template-columns: 1fr;
  }
  
  .presentacion-card {
    flex-direction: column;
  }
  
  .card-icon {
    width: 100%;
    height: 60px;
  }
  
  .valores-grid {
    grid-template-columns: 1fr;
  }
  
  .valor-card {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .section-container {
    padding: 0 1rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .stat-item {
    padding: 1.5rem;
  }
  
  .stat-item h3 {
    font-size: 1.8rem;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .card-content h4 {
    font-size: 1.2rem;
  }
}
</style>