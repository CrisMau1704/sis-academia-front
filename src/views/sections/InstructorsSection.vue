<template>
  <section id="instructores" class="instructores">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">NUESTROS <span class="highlight">INSTRUCTORES</span></h2>
        <p class="section-subtitle">Profesionales de élite con amplia trayectoria</p>
      </div>

      <div class="instructores-grid">
        <div v-for="instructor in instructores" :key="instructor.id" class="instructor-card">
          <div class="instructor-header">
            <div class="instructor-imagen">
              <img :src="instructor.imagen" :alt="instructor.nombre">
            </div>
            <div class="instructor-titulo">
              <h3>{{ instructor.nombre }}</h3>
              <p class="instructor-rango">{{ instructor.rango }}</p>
            </div>
          </div>
          
          <div class="instructor-cv">
            <div class="cv-seccion">
              <h4><i class="pi pi-briefcase"></i> Experiencia</h4>
              <ul>
                <li v-for="exp in instructor.experiencia" :key="exp">
                  <i class="pi pi-check-circle"></i> {{ exp }}
                </li>
              </ul>
            </div>

            <div class="cv-seccion">
              <h4><i class="pi pi-trophy"></i> Logros</h4>
              <ul>
                <li v-for="logro in instructor.logros" :key="logro">
                  <i class="pi pi-star"></i> {{ logro }}
                </li>
              </ul>
            </div>

            <div class="cv-seccion">
              <h4><i class="pi pi-book"></i> Certificaciones</h4>
              <div class="certificaciones">
                <Tag v-for="cert in instructor.certificaciones" :key="cert" :value="cert" severity="info" />
              </div>
            </div>

            <div class="cv-seccion">
              <h4><i class="pi pi-shield"></i> Especialidades</h4>
              <div class="especialidades">
                <Tag v-for="esp in instructor.especialidades" :key="esp" :value="esp" severity="warning" />
              </div>
            </div>
          </div>

          <div class="instructor-footer">
            <Button 
              label="Agendar clase con este instructor" 
              icon="pi pi-calendar-plus"
              class="agendar-btn"
              @click="agendarClase(instructor)"
              severity="danger"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// ✅ DATOS QUEMADOS DIRECTAMENTE AQUÍ
const instructores = ref([
  {
    id: 1,
    nombre: 'Carlos "El Toro" Mendoza',
    rango: 'Cinturón Negro 3er Dan - MMA',
    imagen: 'https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    experiencia: [
      '15 años de experiencia en artes marciales',
      'Ex peleador profesional de UFC (2010-2015)',
      'Entrenador principal de la selección boliviana de MMA',
      'Más de 100 alumnos formados como instructores'
    ],
    logros: [
      'Campeón Nacional de MMA (5 veces)',
      'Campeón Sudamericano de Jiu-Jitsu',
      'Medalla de Oro en Juegos Bolivarianos',
      'Reconocimiento como Mejor Entrenador 2022'
    ],
    certificaciones: [
      'Certificación UFC Instructor',
      'IBJJF Certified Coach',
      'CrossFit Level 1 Trainer',
      'Nutrición Deportiva'
    ],
    especialidades: ['MMA', 'Jiu-Jitsu', 'Grappling', 'Acondicionamiento Físico']
  },
  {
    id: 2,
    nombre: 'Ana "La Fiera" Rodríguez',
    rango: 'Cinturón Marrón - Jiu-Jitsu',
    imagen: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    experiencia: [
      '10 años de experiencia en Jiu-Jitsu',
      'Ex campeona sudamericana',
      'Instructora de defensa personal femenina',
      'Coordinadora del programa de alto rendimiento'
    ],
    logros: [
      'Campeona Sudamericana de Jiu-Jitsu',
      'Medalla de Oro Panamericana',
      'Campeona Nacional (8 veces)',
      'Cinturón Marrón más joven de Bolivia'
    ],
    certificaciones: [
      'IBJJF Certified Coach',
      'Defensa Personal Femenina',
      'Primeros Auxilios',
      'Psicología Deportiva'
    ],
    especialidades: ['Jiu-Jitsu', 'Defensa Personal', 'Técnicas de Sumisión']
  },
  {
    id: 3,
    nombre: 'Luis "Máquina" Fernández',
    rango: 'Cinturón Negro - Boxeo',
    imagen: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    experiencia: [
      '12 años como boxeador profesional',
      '10 años como entrenador de boxeo',
      'Preparador de peleadores profesionales',
      'Entrenador de la selección nacional'
    ],
    logros: [
      'Campeón Nacional de Boxeo (3 veces)',
      'Retador al título latinoamericano',
      'Mejor técnico del año 2020',
      'Entrenador del año 2023'
    ],
    certificaciones: [
      'Certificación AIBA Coach',
      'Entrenador de Boxeo Olímpico',
      'Preparación Física Especializada',
      'Scouting Deportivo'
    ],
    especialidades: ['Boxeo', 'Kickboxing', 'Acondicionamiento Cardiovascular']
  },

]);

// Método para agendar clase
function agendarClase(instructor) {
  const mensaje = `Hola, me gustaría agendar una clase con el instructor ${instructor.nombre}. ¿Podrían darme información sobre disponibilidad?`;
  const url = `https://wa.me/59160108969?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
  
  toast.add({
    severity: 'success',
    summary: 'Redirigiendo a WhatsApp',
    detail: `Serás redirigido para contactar con ${instructor.nombre}`,
    life: 3000
  });
}
</script>

<style scoped>
/* Todos los estilos que ya teníamos */
.instructores {
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

.instructores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.instructor-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  border: 1px solid #e2e8f0;
}

.instructor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.instructor-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.instructor-imagen {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #dc2626;
}

.instructor-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.instructor-titulo h3 {
  color: white;
  font-size: 1.3rem;
  margin: 0 0 0.5rem;
}

.instructor-rango {
  color: #dc2626;
  font-size: 0.9rem;
  margin: 0;
}

.instructor-cv {
  padding: 2rem;
}

.cv-seccion {
  margin-bottom: 1.5rem;
}

.cv-seccion h4 {
  color: #1e293b;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cv-seccion h4 i {
  color: #dc2626;
}

.cv-seccion ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cv-seccion li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: #475569;
  line-height: 1.5;
}

.cv-seccion li i {
  color: #10b981;
  margin-top: 0.2rem;
}

.certificaciones,
.especialidades {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.instructor-footer {
  padding: 0 2rem 2rem;
}

.agendar-btn {
  width: 100%;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important;
  border: none !important;
}

@media (max-width: 768px) {
  .instructores-grid {
    grid-template-columns: 1fr;
  }
  
  .instructor-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>