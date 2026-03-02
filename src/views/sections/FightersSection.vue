<template>
  <section id="peleadores" class="peleadores">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">NUESTROS <span class="highlight">PELEADORES</span></h2>
        <p class="section-subtitle">Conoce a los atletas que representan nuestra academia</p>
      </div>

      <div class="peleadores-grid">
        <div v-for="peleador in peleadores" :key="peleador.id" class="peleador-card">
          <div class="peleador-imagen">
            <img :src="peleador.imagen" :alt="peleador.nombre">
            <div class="peleador-redes">
              <a :href="peleador.instagram" target="_blank" class="red-social">
                <i class="pi pi-instagram"></i>
              </a>
              <a :href="peleador.facebook" target="_blank" class="red-social">
                <i class="pi pi-facebook"></i>
              </a>
            </div>
          </div>
          <div class="peleador-info">
            <h3>{{ peleador.nombre }}</h3>
            <p class="peleador-rango">{{ peleador.rango }}</p>
            <div class="peleador-estadisticas">
              <div class="estadistica">
                <span class="estadistica-valor">{{ peleador.victorias }}</span>
                <span class="estadistica-label">Victorias</span>
              </div>
              <div class="estadistica">
                <span class="estadistica-valor">{{ peleador.derrotas }}</span>
                <span class="estadistica-label">Derrotas</span>
              </div>
              <div class="estadistica">
                <span class="estadistica-valor">{{ peleador.empates }}</span>
                <span class="estadistica-label">Empates</span>
              </div>
            </div>
            <p class="peleador-descripcion">{{ peleador.descripcion }}</p>
            <div class="peleador-logros">
              <Tag v-for="logro in peleador.logros" :key="logro" :value="logro" severity="warning" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import Tag from 'primevue/tag';

// ============================================
// DATOS DE LOS PELEADORES
// ============================================
const peleadores = ref([
  {
    id: 1,
    nombre: 'Carlos "El Toro" Mendoza',
    rango: 'Cinturón Negro 3er Dan',
    imagen: 'https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    victorias: 15,
    derrotas: 2,
    empates: 0,
    descripcion: 'Fundador de la academia y entrenador principal. Especialista en grappling y lucha.',
    logros: ['Campeón Nacional', 'Instructor Certificado UFC'],
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com'
  },
  {
    id: 2,
    nombre: 'Ana "La Fiera" Rodríguez',
    rango: 'Cinturón Marrón Jiu-Jitsu',
    imagen: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    victorias: 10,
    derrotas: 1,
    empates: 1,
    descripcion: 'Campeona sudamericana de Jiu-Jitsu. Especialista en técnicas de sumisión.',
    logros: ['Campeona Sudamericana', 'Medalla de Oro Panamericana'],
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com'
  },
  {
    id: 3,
    nombre: 'Luis "Máquina" Fernández',
    rango: 'Cinturón Negro Boxeo',
    imagen: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    victorias: 20,
    derrotas: 3,
    empates: 2,
    descripcion: 'Ex boxeador profesional con más de 10 años de experiencia en el ring.',
    logros: ['Campeón Nacional Boxeo', 'Entrenador de la Selección'],
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com'
  },
  {
    id: 4,
    nombre: 'Roberto "Thai" Silva',
    rango: 'Cinturón Negro Muay Thai',
    imagen: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    victorias: 12,
    derrotas: 2,
    empates: 0,
    descripcion: 'Especialista en Muay Thai con entrenamiento en Tailandia.',
    logros: ['Campeón Latinoamericano', 'Entrenador Certificado'],
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com'
  },
  {
    id: 5,
    nombre: 'Diego "El Terrible" Vargas',
    rango: 'Cinturón Negro MMA',
    imagen: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    victorias: 18,
    derrotas: 4,
    empates: 1,
    descripcion: 'Peleador de MMA con estilo agresivo. Especialista en striking y knockout.',
    logros: ['Campeón Nacional MMA', 'Mejor KO del Año 2023'],
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com'
  },
  {
    id: 6,
    nombre: 'Sofía "La Guerrera" Méndez',
    rango: 'Cinturón Azul Jiu-Jitsu',
    imagen: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    victorias: 8,
    derrotas: 1,
    empates: 0,
    descripcion: 'Joven promesa del Jiu-Jitsu boliviano. Campeona nacional en su categoría.',
    logros: ['Campeona Nacional Juvenil', 'Revelación del Año'],
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com'
  }
]);
</script>

<style scoped>
.peleadores {
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

.peleadores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.peleador-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.peleador-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.peleador-imagen {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.peleador-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.peleador-card:hover .peleador-imagen img {
  transform: scale(1.1);
}

.peleador-redes {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 2rem 1rem 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.peleador-card:hover .peleador-redes {
  opacity: 1;
}

.red-social {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #dc2626;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: transform 0.3s;
}

.red-social:hover {
  transform: scale(1.1);
}

.peleador-info {
  padding: 1.5rem;
}

.peleador-info h3 {
  color: #1e293b;
  font-size: 1.3rem;
  margin: 0 0 0.5rem;
}

.peleador-rango {
  color: #dc2626;
  font-weight: 500;
  margin-bottom: 1rem;
}

.peleador-estadisticas {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.estadistica {
  flex: 1;
  text-align: center;
}

.estadistica-valor {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.estadistica-label {
  color: #64748b;
  font-size: 0.9rem;
}

.peleador-descripcion {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.peleador-logros {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .peleadores-grid {
    grid-template-columns: 1fr;
  }
}
</style>