<template>
  <footer id="contacto" class="footer">
    <div class="footer-container">
      <div class="footer-section">
        <div class="footer-logo">
          <img src="/demo/images/logo1.jpeg" alt="Alianza Bolivia MMA" class="footer-logo-img" />
          <div class="footer-title">
            <h3>ALIANZA BOLIVIA</h3>
            <h4>MMA</h4>
          </div>
        </div>
        <p class="footer-description">
          Academia líder en entrenamiento de artes marciales mixtas en Bolivia.
          Formamos atletas de alto rendimiento y promovemos un estilo de vida saludable.
        </p>
      </div>

      <div class="footer-section">
        <h5>Enlaces Rápidos</h5>
        <ul class="footer-links">
          <li><a href="#presentacion">Gym</a></li>
          <li><a href="#premios">Logros</a></li>
          <li><a href="#peleadores">Peleadores</a></li>
          <li><a href="#instructores">Instructores</a></li>
          <li><a href="#clases-particulares">Clases Particulares</a></li>
          <li><a href="#modalidades">Modalidades</a></li>
          <li><a href="#horarios">Horarios</a></li>
          <li><a href="#sucursales">Sucursales</a></li>
          <li><a href="#tienda">Tienda</a></li>
          <li><a href="#inscripcion">Inscripción</a></li>
          <li><Button label="Acceso Sistema" @click="$emit('open-login')" link /></li>
        </ul>
      </div>

      <div class="footer-section">
        <h5>Contacto</h5>
        <div class="contact-info-footer">
          <p><i class="pi pi-map-marker"></i> Av. Principal #123, Santa Cruz, Bolivia</p>
          <p><i class="pi pi-phone"></i> +591 60108969</p>
          <p><i class="pi pi-envelope"></i> info@alianzaboliviamma.com</p>
        </div>
      </div>

      <div class="footer-section">
        <h5>Síguenos</h5>
        <div class="social-icons">
          <Button icon="pi pi-facebook" class="social-btn" rounded text @click="$emit('social-click', 'facebook')" />
          <Button icon="pi pi-instagram" class="social-btn" rounded text @click="$emit('social-click', 'instagram')" />
          <Button icon="pi pi-youtube" class="social-btn" rounded text @click="$emit('social-click', 'youtube')" />
          <Button icon="pi pi-whatsapp" class="social-btn" rounded text severity="success" @click="$emit('whatsapp-click')" />
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2024 Alianza Bolivia MMA. Todos los derechos reservados.</p>
      <p>Sistema de Gestión Deportiva v1.0</p>
    </div>
  </footer>
</template>

<script setup>
import Button from 'primevue/button';

defineEmits(['open-login', 'social-click', 'whatsapp-click']);
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  padding: 4rem 2rem 2rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-section h5 {
  color: white;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.footer-logo-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dc2626;
}

.footer-title h3 {
  color: #e2e8f0;
  font-size: 1.2rem;
  margin: 0;
}

.footer-title h4 {
  color: #dc2626;
  font-size: 1.4rem;
  margin: 0;
}

.footer-description {
  color: #94a3b8;
  line-height: 1.6;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: #cbd5e1;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #dc2626;
}

.contact-info-footer p {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.contact-info-footer i {
  color: #dc2626;
}

.social-icons {
  display: flex;
  gap: 1rem;
}

.social-btn {
  color: #cbd5e1 !important;
  border: 1px solid #334155 !important;
}

.social-btn:hover {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 2rem;
  border-top: 1px solid #334155;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

.footer-bottom p {
  margin: 0.5rem 0;
}

@media (max-width: 1024px) {
  .footer-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
  }
}
</style>