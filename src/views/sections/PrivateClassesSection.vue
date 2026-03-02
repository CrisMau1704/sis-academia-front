<template>
  <section id="clases-particulares" class="clases-particulares">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">CLASES <span class="highlight">PARTICULARES</span></h2>
        <p class="section-subtitle">Entrenamiento personalizado con nuestros mejores instructores</p>
      </div>

      <div class="clases-particulares-intro">
        <div class="intro-texto">
          <h3>¿Por qué elegir clases particulares?</h3>
          <p>Las clases particulares ofrecen una atención totalmente personalizada, adaptada a tus objetivos específicos y ritmo de aprendizaje.</p>
          <div class="intro-beneficios">
            <div class="beneficio-particular">
              <i class="pi pi-check-circle"></i>
              <span>Atención 100% personalizada</span>
            </div>
            <div class="beneficio-particular">
              <i class="pi pi-check-circle"></i>
              <span>Horarios flexibles</span>
            </div>
            <div class="beneficio-particular">
              <i class="pi pi-check-circle"></i>
              <span>Programas específicos para tu nivel</span>
            </div>
            <div class="beneficio-particular">
              <i class="pi pi-check-circle"></i>
              <span>Seguimiento y evaluación continua</span>
            </div>
          </div>
        </div>
        <div class="intro-imagen">
          <img src="https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Clase particular MMA">
        </div>
      </div>

      <div class="clases-particulares-filters">
        <div class="filter-group">
          <label>Filtrar por disciplina:</label>
          <Dropdown 
            v-model="filtroDisciplina" 
            :options="disciplinas" 
            optionLabel="nombre" 
            optionValue="id"
            placeholder="Todas las disciplinas"
            class="filter-dropdown"
          />
        </div>
        <div class="filter-group">
          <label>Filtrar por instructor:</label>
          <Dropdown 
            v-model="filtroInstructor" 
            :options="instructoresFiltro" 
            optionLabel="nombre" 
            optionValue="id"
            placeholder="Todos los instructores"
            class="filter-dropdown"
          />
        </div>
      </div>

      <div class="clases-particulares-grid">
        <div v-for="clase in clasesFiltradas" :key="clase.id" class="clase-particular-card">
          <div class="clase-particular-imagen">
            <img :src="clase.imagen" :alt="clase.nombre">
            <Tag :value="clase.nivel" :severity="clase.severityNivel" class="clase-nivel" />
          </div>
          <div class="clase-particular-body">
            <h3>{{ clase.nombre }}</h3>
            <p class="clase-instructor">Instructor: {{ clase.instructor_nombre }}</p>
            <p class="clase-descripcion">{{ clase.descripcion }}</p>
            
            <div class="clase-detalles">
              <div class="detalle">
                <i class="pi pi-clock"></i>
                <span>{{ clase.duracion }} minutos</span>
              </div>
              <div class="detalle">
                <i class="pi pi-calendar"></i>
                <span>{{ clase.disponibilidad }}</span>
              </div>
            </div>

            <div class="clase-precio">
              <span class="precio-label">Por sesión</span>
              <span class="precio-valor">Bs. {{ clase.precio }}</span>
            </div>

            <div class="clase-acciones">
              <Button 
                label="Consultar disponibilidad" 
                icon="pi pi-whatsapp"
                class="consultar-whatsapp"
                @click="consultarClase(clase)"
                severity="success"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// ============================================
// DATOS DE CLASES PARTICULARES
// ============================================
const clasesParticulares = ref([
  {
    id: 1,
    nombre: 'Clase Personalizada de MMA',
    instructor_id: 1,
    instructor_nombre: 'Carlos "El Toro" Mendoza',
    disciplina: 'MMA',
    nivel: 'Todos los niveles',
    severityNivel: 'info',
    duracion: 60,
    precio: 250,
    disponibilidad: 'Lunes a Viernes, 8:00 - 20:00',
    descripcion: 'Entrenamiento personalizado enfocado en tus objetivos específicos: competencia, defensa personal o acondicionamiento.',
    imagen: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    nombre: 'Clase Privada de Jiu-Jitsu',
    instructor_id: 2,
    instructor_nombre: 'Ana "La Fiera" Rodríguez',
    disciplina: 'Jiu-Jitsu',
    nivel: 'Intermedio/Avanzado',
    severityNivel: 'warning',
    duracion: 75,
    precio: 220,
    disponibilidad: 'Martes, Jueves y Sábados',
    descripcion: 'Perfecciona tus técnicas de suelo y sumisiones con una de las mejores exponentes del país.',
    imagen: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    nombre: 'Boxeo Profesional',
    instructor_id: 3,
    instructor_nombre: 'Luis "Máquina" Fernández',
    disciplina: 'Boxeo',
    nivel: 'Todos los niveles',
    severityNivel: 'success',
    duracion: 60,
    precio: 200,
    disponibilidad: 'Lunes a Viernes, 7:00 - 21:00',
    descripcion: 'Técnica de boxeo profesional, mejora tu golpeo, juego de pies y condición física.',
    imagen: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    nombre: 'Muay Thai Intensivo',
    instructor_id: 4,
    instructor_nombre: 'Roberto "Thai" Silva',
    disciplina: 'Muay Thai',
    nivel: 'Todos los niveles',
    severityNivel: 'danger',
    duracion: 75,
    precio: 230,
    disponibilidad: 'Miércoles, Viernes y Sábados',
    descripcion: 'Aprende el arte de las 8 extremidades con un instructor entrenado en Tailandia.',
    imagen: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
]);

// ============================================
// DATOS PARA FILTROS
// ============================================
const instructores = ref([
  { id: 1, nombre: 'Carlos "El Toro" Mendoza' },
  { id: 2, nombre: 'Ana "La Fiera" Rodríguez' },
  { id: 3, nombre: 'Luis "Máquina" Fernández' },
  { id: 4, nombre: 'Roberto "Thai" Silva' }
]);

const disciplinas = ref([
  { id: 1, nombre: 'MMA' },
  { id: 2, nombre: 'Jiu-Jitsu' },
  { id: 3, nombre: 'Boxeo' },
  { id: 4, nombre: 'Muay Thai' }
]);

// ============================================
// FILTROS
// ============================================
const filtroDisciplina = ref(null);
const filtroInstructor = ref(null);

const instructoresFiltro = computed(() => {
  return instructores.value.map(i => ({ id: i.id, nombre: i.nombre }));
});

const clasesFiltradas = computed(() => {
  let filtradas = clasesParticulares.value;

  if (filtroDisciplina.value) {
    const disciplina = disciplinas.value.find(d => d.id === filtroDisciplina.value);
    if (disciplina) {
      filtradas = filtradas.filter(c => c.disciplina === disciplina.nombre);
    }
  }

  if (filtroInstructor.value) {
    filtradas = filtradas.filter(c => c.instructor_id === filtroInstructor.value);
  }

  return filtradas;
});

// ============================================
// MÉTODOS
// ============================================
function consultarClase(clase) {
  const mensaje = `Hola, me interesa la clase particular: ${clase.nombre} con ${clase.instructor_nombre}. ¿Podrían darme más información sobre disponibilidad?`;
  const url = `https://wa.me/59160108969?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
  
  toast.add({
    severity: 'success',
    summary: 'Redirigiendo a WhatsApp',
    detail: `Serás redirigido para consultar sobre ${clase.nombre}`,
    life: 3000
  });
}
</script>

<style scoped>
.clases-particulares {
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

.clases-particulares-intro {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.intro-texto h3 {
  color: #1e293b;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.intro-texto p {
  color: #475569;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.intro-beneficios {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.beneficio-particular {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
}

.beneficio-particular i {
  color: #10b981;
}

.intro-imagen {
  border-radius: 10px;
  overflow: hidden;
}

.intro-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.clases-particulares-filters {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #475569;
  font-weight: 500;
}

.filter-dropdown {
  width: 100%;
}

.clases-particulares-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.clase-particular-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.clase-particular-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.clase-particular-imagen {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.clase-particular-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.clase-particular-card:hover .clase-particular-imagen img {
  transform: scale(1.05);
}

.clase-nivel {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
}

.clase-particular-body {
  padding: 1.5rem;
}

.clase-particular-body h3 {
  color: #1e293b;
  font-size: 1.3rem;
  margin: 0 0 0.5rem;
}

.clase-instructor {
  color: #dc2626;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.clase-descripcion {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.clase-detalles {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.detalle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
}

.detalle i {
  color: #dc2626;
}

.clase-precio {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
}

.precio-label {
  color: #64748b;
}

.precio-valor {
  color: #dc2626;
  font-size: 1.5rem;
  font-weight: 700;
}

.clase-acciones {
  display: flex;
  gap: 0.5rem;
}

.consultar-whatsapp {
  width: 100%;
  background: #25d366 !important;
  border: none !important;
}

.consultar-whatsapp:hover {
  background: #128c7e !important;
}

@media (max-width: 1024px) {
  .clases-particulares-intro {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .intro-beneficios {
    grid-template-columns: 1fr;
  }
  
  .clases-particulares-filters {
    flex-direction: column;
  }
  
  .clases-particulares-grid {
    grid-template-columns: 1fr;
  }
}
</style>