<template>
  <section id="sucursales" class="sucursales">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">NUESTRAS <span class="highlight">SUCURSALES</span></h2>
        <p class="section-subtitle">Encuentra la sucursal más cercana a ti</p>
      </div>

      <div class="sucursales-grid">
        <div v-for="sucursal in sucursales" :key="sucursal.id" class="sucursal-card">
          <div class="sucursal-header" :style="{ backgroundImage: `url(${sucursal.imagen})` }">
            <div class="sucursal-overlay">
              <h3>{{ sucursal.nombre }}</h3>
              <Tag :value="sucursal.estado" :severity="sucursal.estado === 'Abierto' ? 'success' : 'danger'" />
            </div>
          </div>
          <div class="sucursal-body">
            <div class="sucursal-info">
              <div class="info-item">
                <i class="pi pi-map-marker"></i>
                <span>{{ sucursal.direccion }}</span>
              </div>
              <div class="info-item">
                <i class="pi pi-phone"></i>
                <span>{{ sucursal.telefono }}</span>
              </div>
              <div class="info-item">
                <i class="pi pi-clock"></i>
                <span>{{ sucursal.horario }}</span>
              </div>
              <div class="info-item">
                <i class="pi pi-envelope"></i>
                <span>{{ sucursal.email }}</span>
              </div>
            </div>
            <div class="sucursal-servicios">
              <h4>Servicios:</h4>
              <div class="servicios-tags">
                <Tag v-for="servicio in sucursal.servicios" :key="servicio" :value="servicio" severity="info" />
              </div>
            </div>
            <div class="sucursal-acciones">
              <Button 
                label="Ver en mapa" 
                icon="pi pi-map"
                class="p-button-outlined"
                @click="verEnMapa(sucursal)"
                severity="danger"
              />
              <Button 
                label="Contactar" 
                icon="pi pi-whatsapp"
                @click="contactarSucursal(sucursal)"
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
import { ref } from 'vue';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// ============================================
// DATOS DE LAS SUCURSALES
// ============================================
const sucursales = ref([
  {
    id: 1,
    nombre: 'Sucursal Centro',
    direccion: 'Av. Principal #123, Santa Cruz',
    telefono: '+591 60108969',
    horario: 'Lun a Vie: 6:00 - 22:00, Sáb: 8:00 - 18:00',
    email: 'centro@alianzaboliviamma.com',
    imagen: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    estado: 'Abierto',
    servicios: ['MMA', 'Jiu-Jitsu', 'Boxeo', 'Muay Thai', 'Gimnasio']
  },
  {
    id: 2,
    nombre: 'Sucursal Norte',
    direccion: 'Av. Norte #456, Santa Cruz',
    telefono: '+591 71234567',
    horario: 'Lun a Vie: 7:00 - 21:00, Sáb: 9:00 - 17:00',
    email: 'norte@alianzaboliviamma.com',
    imagen: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    estado: 'Abierto',
    servicios: ['MMA', 'Jiu-Jitsu', 'Kickboxing', 'Boxeo']
  },
  {
    id: 3,
    nombre: 'Sucursal Sur',
    direccion: 'Av. Sur #789, Santa Cruz',
    telefono: '+591 72345678',
    horario: 'Lun a Vie: 8:00 - 20:00, Sáb: 9:00 - 15:00',
    email: 'sur@alianzaboliviamma.com',
    imagen: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    estado: 'Abierto',
    servicios: ['Boxeo', 'Kickboxing', 'Funcional', 'Gimnasio']
  },
  {
    id: 4,
    nombre: 'Sucursal Este',
    direccion: 'Av. Este #321, Santa Cruz',
    telefono: '+591 73456789',
    horario: 'Lun a Vie: 6:30 - 21:30, Sáb: 8:30 - 17:30',
    email: 'este@alianzaboliviamma.com',
    imagen: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    estado: 'Abierto',
    servicios: ['MMA', 'Jiu-Jitsu', 'Muay Thai', 'CrossFit']
  },
  {
    id: 5,
    nombre: 'Sucursal Oeste',
    direccion: 'Av. Oeste #654, Santa Cruz',
    telefono: '+591 74567890',
    horario: 'Lun a Vie: 7:00 - 22:00, Sáb: 9:00 - 18:00',
    email: 'oeste@alianzaboliviamma.com',
    imagen: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    estado: 'Abierto',
    servicios: ['Boxeo', 'Jiu-Jitsu', 'Funcional', 'Gimnasio']
  },
  {
    id: 6,
    nombre: 'Sucursal Equipetrol',
    direccion: 'Calle Los Olivos #100, Equipetrol, Santa Cruz',
    telefono: '+591 75678901',
    horario: 'Lun a Vie: 5:30 - 23:00, Sáb: 8:00 - 20:00, Dom: 9:00 - 13:00',
    email: 'equipetrol@alianzaboliviamma.com',
    imagen: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    estado: 'Abierto',
    servicios: ['MMA', 'Jiu-Jitsu', 'Boxeo', 'Muay Thai', 'Kickboxing', 'Gimnasio', 'Piscina', 'Sauna']
  }
]);

// ============================================
// MÉTODOS
// ============================================
function verEnMapa(sucursal) {
  toast.add({
    severity: 'info',
    summary: 'Mapa',
    detail: `Abriendo ubicación de ${sucursal.nombre} en Google Maps`,
    life: 3000
  });
  window.open(`https://maps.google.com/?q=${sucursal.direccion}`, '_blank');
}

function contactarSucursal(sucursal) {
  const mensaje = `Hola, me gustaría obtener información sobre la sucursal ${sucursal.nombre}`;
  const telefono = sucursal.telefono.replace('+', '').replace(/\s/g, '');
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
  
  toast.add({
    severity: 'success',
    summary: 'Redirigiendo a WhatsApp',
    detail: `Contactando a ${sucursal.nombre}`,
    life: 3000
  });
}
</script>

<style scoped>
.sucursales {
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

.sucursales-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.sucursal-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.sucursal-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.sucursal-header {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.sucursal-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 2rem 1.5rem 1.5rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.sucursal-overlay h3 {
  font-size: 1.5rem;
  margin: 0;
}

.sucursal-body {
  padding: 1.5rem;
}

.sucursal-info {
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #475569;
}

.info-item i {
  color: #dc2626;
  width: 20px;
}

.sucursal-servicios h4 {
  color: #1e293b;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.servicios-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.sucursal-acciones {
  display: flex;
  gap: 1rem;
}

.sucursal-acciones .p-button {
  flex: 1;
}

@media (max-width: 768px) {
  .sucursal-acciones {
    flex-direction: column;
  }
  
  .sucursales-grid {
    grid-template-columns: 1fr;
  }
}
</style>