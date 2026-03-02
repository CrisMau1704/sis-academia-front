<template>
  <section id="presentacion" class="presentacion">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">NUESTRO <span class="highlight">GYM</span></h2>
        <p class="section-subtitle">Conoce nuestra historia, misión y valores</p>
      </div>

      <div class="presentacion-content">
        <div class="presentacion-imagenes">
          <div class="imagen-principal">
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Alianza Bolivia MMA">
          </div>
          <div class="imagenes-secundarias">
            <img src="https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Entrenamiento MMA">
            <img src="https://images.unsplash.com/photo-1626338176640-91b14b3e54c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Jiu-Jitsu">
          </div>
        </div>

        <div class="presentacion-texto">
          <div class="historia">
            <h3>Nuestra Historia</h3>
            <p>Alianza Bolivia MMA nació en 2015 con la visión de crear un espacio donde los apasionados de las artes marciales pudieran entrenar al más alto nivel. Fundada por el Maestro Carlos Mendoza, ex peleador profesional, la academia ha crecido hasta convertirse en un referente nacional en la formación de atletas de alto rendimiento.</p>
          </div>

          <div class="mision-vision">
            <div class="mision">
              <i class="pi pi-bullseye"></i>
              <h4>Misión</h4>
              <p>Formar atletas íntegros a través de la práctica de artes marciales, fomentando valores como la disciplina, el respeto y la perseverancia.</p>
            </div>
            <div class="vision">
              <i class="pi pi-eye"></i>
              <h4>Visión</h4>
              <p>Ser la academia líder en Latinoamérica en la formación de peleadores profesionales y en la promoción de un estilo de vida saludable.</p>
            </div>
          </div>

          <div class="valores">
            <h4>Valores</h4>
            <div class="valores-grid">
              <div class="valor-item">
                <i class="pi pi-shield"></i>
                <span>Disciplina</span>
              </div>
              <div class="valor-item">
                <i class="pi pi-heart"></i>
                <span>Respeto</span>
              </div>
              <div class="valor-item">
                <i class="pi pi-star"></i>
                <span>Excelencia</span>
              </div>
              <div class="valor-item">
                <i class="pi pi-users"></i>
                <span>Compañerismo</span>
              </div>
              <div class="valor-item">
                <i class="pi pi-chart-line"></i>
                <span>Superación</span>
              </div>
              <div class="valor-item">
                <i class="pi pi-lock"></i>
                <span>Humildad</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Sin lógica por ahora
</script>

<style scoped>
.presentacion {
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

.presentacion-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.presentacion-imagenes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.imagen-principal {
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.imagen-principal img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.imagen-principal:hover img {
  transform: scale(1.05);
}

.imagenes-secundarias {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.imagenes-secundarias img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.imagenes-secundarias img:hover {
  transform: scale(1.03);
}

.presentacion-texto {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.historia h3,
.valores h4 {
  color: #1e293b;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.historia p {
  color: #475569;
  line-height: 1.8;
  font-size: 1.1rem;
}

.mision-vision {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  background: #f8fafc;
  padding: 2rem;
  border-radius: 15px;
}

.mision,
.vision {
  text-align: center;
}

.mision i,
.vision i {
  font-size: 2.5rem;
  color: #dc2626;
  margin-bottom: 1rem;
}

.mision h4,
.vision h4 {
  color: #1e293b;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.mision p,
.vision p {
  color: #64748b;
  line-height: 1.6;
}

.valores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.valor-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 10px;
  transition: transform 0.3s;
}

.valor-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(220, 38, 38, 0.1);
}

.valor-item i {
  font-size: 1.8rem;
  color: #dc2626;
}

.valor-item span {
  color: #475569;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .presentacion-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .mision-vision {
    grid-template-columns: 1fr;
  }
}
</style>