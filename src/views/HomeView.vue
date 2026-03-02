<template>
  <div class="landing-page">
    <HeaderComponent @open-login="goToLogin" />
    
    <!-- SECCIONES -->
    <HeroSection />
    <StatsSection />
    <GymPresentation />
    <AchievementsSection />
    <FightersSection />
    <InstructorsSection />
    <PrivateClassesSection />
    <ModalitiesSection />
    <ScheduleSection />
    <BranchesSection />
    <StoreSection />
    <PreRegistrationSection />
    
    <FooterComponent 
      @open-login="goToLogin"
      @social-click="abrirRedSocial"
      @whatsapp-click="abrirWhatsAppGeneral"
    />

    <!-- Botón flotante de WhatsApp -->
    <div class="whatsapp-float" @click="abrirWhatsAppGeneral">
      <i class="pi pi-whatsapp"></i>
    </div>

    <Toast />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';

// Components
import HeaderComponent from '@/components/HeaderComponent.vue';
import FooterComponent from '@/components/FooterComponent.vue';

// Sections
import HeroSection from '@/views/sections/HeroSection.vue';
import StatsSection from '@/views/sections/StatsSection.vue';
import GymPresentation from '@/views/sections/GymPresentation.vue';
import AchievementsSection from '@/views/sections/AchievementsSection.vue';
import FightersSection from '@/views/sections/FightersSection.vue';
import InstructorsSection from '@/views/sections/InstructorsSection.vue';
import PrivateClassesSection from '@/views/sections/PrivateClassesSection.vue';
import ModalitiesSection from '@/views/sections/ModalitiesSection.vue';
import ScheduleSection from '@/views/sections/ScheduleSection.vue';
import BranchesSection from '@/views/sections/BranchesSection.vue';
import StoreSection from '@/views/sections/StoreSection.vue';
import PreRegistrationSection from '@/views/sections/PreRegistrationSection.vue';

const router = useRouter();
const toast = useToast();

// ============================================
// MÉTODOS GLOBALES
// ============================================
function goToLogin() {
  router.push('/login');
}

function abrirWhatsAppGeneral() {
  const mensaje = 'Hola, me gustaría obtener más información sobre la academia.';
  const url = `https://wa.me/59160108969?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

function abrirRedSocial(red) {
  const urls = {
    facebook: 'https://facebook.com/alianzaboliviamma',
    instagram: 'https://instagram.com/alianzaboliviamma',
    youtube: 'https://youtube.com/alianzaboliviamma'
  };
  window.open(urls[red], '_blank');
}
</script>

<style scoped>
.landing-page {
  font-family: 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
  color: #333;
}

.whatsapp-float {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #25d366;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: 0 5px 20px rgba(37, 211, 102, 0.3);
  z-index: 999;
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
}

.whatsapp-float:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.4);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(37, 211, 102, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
  }
}
</style>