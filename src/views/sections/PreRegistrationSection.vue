<template>
  <section id="inscripcion" class="preinscripcion">
    <div class="section-container">
      <div class="preinscripcion-container">
        <div class="preinscripcion-form">
          <div class="form-header">
            <h2 class="section-title">PREINSCRÍBETE <span class="highlight">HOY</span></h2>
            <p class="section-subtitle">Completa el formulario y reserva tu lugar</p>
          </div>

          <!-- Mensaje de éxito con QR y WhatsApp (MONTO REAL) -->
          <div v-if="enviadoExitosamente" class="success-message">
            <div class="success-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <h3>¡Preinscripción enviada con éxito!</h3>
            <p class="success-text">Para completar tu inscripción, realiza el pago y envía el comprobante.</p>
            
            <!-- SECCIÓN DE PAGO QR CON MONTO REAL -->
            <div v-if="datosGuardados" class="pago-section">
              <h4 class="pago-title">
                <i class="pi pi-credit-card"></i>
                Realiza tu pago
              </h4>
              
              <div class="qr-container">
                <!-- Código QR Oficial -->
                <div class="qr-code">
                  <img src="/public/layout/images/imagenqr.png" alt="Código QR para pago" class="qr-image" />
                </div>
                
                <!-- Información del pago con MONTO REAL -->
                <div class="qr-info">
                  <div class="info-item highlight-item">
                    <span class="info-label">Monto TOTAL:</span>
                    <span class="info-value highlight">Bs. {{ formatMonto(datosGuardados.monto) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Duración:</span>
                    <span class="info-value">{{ datosGuardados.meses }} meses</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Precio mensual:</span>
                    <span class="info-value">Bs. {{ formatMonto(datosGuardados.precioMensual) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Modalidad:</span>
                    <span class="info-value">{{ datosGuardados.modalidad }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Beneficiario:</span>
                    <span class="info-value">Alianza Bolivia MMA</span>
                  </div>
                </div>
              </div>

              <!-- Desglose del cálculo -->
              <div class="desglose-pago">
                <h5 class="desglose-titulo">
                  <i class="pi pi-calculator"></i>
                  Desglose del pago:
                </h5>
                <div class="desglose-item">
                  <span>Precio mensual:</span>
                  <span>Bs. {{ formatMonto(datosGuardados.precioMensual) }}</span>
                </div>
                <div class="desglose-item">
                  <span>Duración:</span>
                  <span>{{ datosGuardados.meses }} {{ datosGuardados.meses === 1 ? 'mes' : 'meses' }}</span>
                </div>
                <div class="desglose-item total">
                  <span>TOTAL A PAGAR:</span>
                  <span class="total-monto">Bs. {{ formatMonto(datosGuardados.monto) }}</span>
                </div>
              </div>

              <!-- Instrucciones de pago -->
              <div class="instrucciones-pago">
                <h5 class="instrucciones-titulo">
                  <i class="pi pi-info-circle"></i>
                  Pasos a seguir:
                </h5>
                <ol class="instrucciones-lista">
                  <li>Escanea el código QR con tu aplicación bancaria</li>
                  <li>Confirma el monto de <strong>Bs. {{ formatMonto(datosGuardados.monto) }}</strong></li>
                  <li>Realiza el pago y guarda el comprobante</li>
                  <li>Envía el comprobante por WhatsApp usando el botón de abajo</li>
                </ol>
              </div>

              <!-- Botón de WhatsApp -->
              <div class="whatsapp-section">
                <Button 
                  :label="`Enviar comprobante por WhatsApp`"
                  icon="pi pi-whatsapp"
                  class="whatsapp-button"
                  @click="enviarWhatsApp"
                  severity="success"
                />
                <p class="whatsapp-helper">
                  <i class="pi pi-clock"></i>
                  Te atenderemos en horario de atención: 9:00 AM - 8:00 PM
                </p>
              </div>

              <!-- Datos de contacto alternativos -->
              <div class="contacto-alternativo">
                <p>¿Problemas con el pago?</p>
                <div class="contacto-items">
                  <a :href="`tel:+591${telefonoSoporte}`" class="contacto-link">
                    <i class="pi pi-phone"></i> Llamar
                  </a>
                  <a :href="`https://wa.me/${telefonoSoporte}`" target="_blank" class="contacto-link">
                    <i class="pi pi-whatsapp"></i> Soporte
                  </a>
                </div>
              </div>
            </div>

            <Button 
              label="Enviar otra preinscripción" 
              icon="pi pi-plus"
              @click="resetFormulario"
              class="p-button-outlined mt-4"
            />
          </div>

          <!-- Formulario con Stepper -->
          <div v-else class="form-content">
            
            <!-- Stepper de progreso -->
            <div class="stepper-header">
              <div class="step-item" :class="{ active: pasoActual === 1, completed: pasoActual > 1 }">
                <div class="step-number">1</div>
                <div class="step-label">Datos Personales</div>
              </div>
              <div class="step-line" :class="{ active: pasoActual >= 2 }"></div>
              <div class="step-item" :class="{ active: pasoActual === 2, completed: pasoActual > 2 }">
                <div class="step-number">2</div>
                <div class="step-label">Sucursal y Modalidad</div>
              </div>
              <div class="step-line" :class="{ active: pasoActual >= 3 }"></div>
              <div class="step-item" :class="{ active: pasoActual === 3 }">
                <div class="step-number">3</div>
                <div class="step-label">Horarios</div>
              </div>
            </div>

            <!-- PASO 1: Datos Personales -->
            <div v-if="pasoActual === 1" class="step-content">
              <h3 class="step-title">📋 Datos Personales</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="nombres">Nombres *</label>
                  <InputText id="nombres" v-model="formData.nombres" placeholder="Ingresa tus nombres"
                    :class="{ 'p-invalid': errors.nombres }" :disabled="enviando" />
                  <small v-if="errors.nombres" class="p-error">{{ errors.nombres }}</small>
                </div>
                <div class="form-group">
                  <label for="apellidos">Apellidos *</label>
                  <InputText id="apellidos" v-model="formData.apellidos" placeholder="Ingresa tus apellidos"
                    :class="{ 'p-invalid': errors.apellidos }" :disabled="enviando" />
                  <small v-if="errors.apellidos" class="p-error">{{ errors.apellidos }}</small>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="ci">Carnet de identidad *</label>
                  <InputText id="ci" v-model="formData.ci" placeholder="Ej: 1234567"
                    :class="{ 'p-invalid': errors.ci }" :disabled="enviando" />
                  <small v-if="errors.ci" class="p-error">{{ errors.ci }}</small>
                </div>
                <div class="form-group">
                  <label for="telefono">Teléfono *</label>
                  <InputText id="telefono" v-model="formData.telefono" placeholder="Ej: 71234567"
                    :class="{ 'p-invalid': errors.telefono }" :disabled="enviando" />
                  <small v-if="errors.telefono" class="p-error">{{ errors.telefono }}</small>
                </div>
              </div>

              <div class="form-group">
                <label for="correo">Correo Electrónico *</label>
                <InputText id="correo" v-model="formData.correo" placeholder="correo@ejemplo.com"
                  :class="{ 'p-invalid': errors.correo }" :disabled="enviando" />
                <small v-if="errors.correo" class="p-error">{{ errors.correo }}</small>
              </div>

              <div class="form-navigation">
                <Button label="Siguiente" icon="pi pi-arrow-right" iconPos="right" 
                  @click="irAlPaso2" :disabled="!validarPaso1()" severity="danger" />
              </div>
            </div>

            <!-- PASO 2: Sucursal y Modalidad -->
            <div v-else-if="pasoActual === 2" class="step-content">
              <h3 class="step-title">🏢 Sucursal y Modalidad</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="sucursal_id">Sucursal de preferencia *</label>
                  <Dropdown id="sucursal_id" v-model="formData.sucursal_id" :options="sucursales" 
                    optionLabel="nombre" optionValue="id" placeholder="Selecciona una sucursal"
                    :class="{ 'p-invalid': errors.sucursal_id }" :disabled="enviando || cargandoSucursales"
                    :loading="cargandoSucursales" />
                  <small v-if="errors.sucursal_id" class="p-error">{{ errors.sucursal_id }}</small>
                  <small v-if="formData.sucursal_id && sucursalSeleccionada" class="text-500 block mt-1">
                    <i class="pi pi-map-marker mr-1"></i>
                    {{ sucursalSeleccionada?.direccion }}
                  </small>
                </div>

                <div class="form-group">
                  <label for="modalidad_id">Modalidad de interés *</label>
                  <Dropdown id="modalidad_id" v-model="formData.modalidad_id" :options="modalidades" 
                    optionLabel="nombre" optionValue="id" placeholder="Selecciona una modalidad"
                    :class="{ 'p-invalid': errors.modalidad_id }" :disabled="enviando || cargandoModalidades"
                    :loading="cargandoModalidades" @change="onModalidadChange" />
                  <small v-if="errors.modalidad_id" class="p-error">{{ errors.modalidad_id }}</small>
                </div>
              </div>

              <!-- Información de la modalidad seleccionada -->
              <div v-if="modalidadSeleccionada" class="modalidad-info p-3 border-round bg-blue-50 mt-3">
                <div class="flex align-items-center">
                  <i class="pi pi-info-circle text-blue-500 mr-2" style="font-size: 1.5rem"></i>
                  <div>
                    <h4 class="mt-0 mb-1">{{ modalidadSeleccionada.nombre }}</h4>
                    <div class="flex align-items-center gap-2 flex-wrap">
                      <Tag :value="`Bs. ${formatMonto(modalidadSeleccionada.precio_mensual)}/mes`" severity="success" />
                      <Tag :value="`${modalidadSeleccionada.clases_mensuales || 12} clases/mes`" severity="info" />
                      <Tag :value="`${modalidadSeleccionada.permisos_maximos || 3} permisos`" severity="warning" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-navigation">
                <Button label="Anterior" icon="pi pi-arrow-left" @click="pasoActual = 1" class="p-button-outlined mr-2" />
                <Button label="Siguiente" icon="pi pi-arrow-right" iconPos="right" 
                  @click="irAlPaso3" :disabled="!validarPaso2()" severity="danger" />
              </div>
            </div>

            <!-- PASO 3: Horarios y Fechas -->
            <div v-else-if="pasoActual === 3" class="step-content">
              <h3 class="step-title">⏰ Selecciona tus Horarios y Fechas</h3>
              
              <!-- SELECTOR DE FECHAS -->
              <div class="fechas-container mb-4 p-3 border-round bg-blue-50">
                <h4 class="mt-0 mb-3">📅 Período de Inscripción</h4>
                
                <div class="grid">
                  <div class="col-12 md:col-6">
                    <div class="field mb-3">
                      <label class="font-medium block mb-2">Fecha de inicio *</label>
                      <Calendar 
                        v-model="formData.fecha_inicio" 
                        dateFormat="dd/mm/yy" 
                        class="w-full" 
                        :minDate="new Date()"
                        showIcon
                        :class="{ 'p-invalid': !formData.fecha_inicio }"
                        :disabled="enviando"
                      />
                      <small class="text-500">La inscripción comenzará esta fecha</small>
                    </div>
                  </div>
                  
                  <div class="col-12 md:col-6">
                    <div class="field mb-3">
                      <label class="font-medium block mb-2">Fecha de fin *</label>
                      <Calendar 
                        v-model="formData.fecha_fin" 
                        dateFormat="dd/mm/yy" 
                        class="w-full" 
                        :minDate="formData.fecha_inicio || new Date()"
                        showIcon
                        :class="{ 'p-invalid': !formData.fecha_fin }"
                        :disabled="enviando"
                      />
                      <small class="text-500">La inscripción terminará esta fecha</small>
                    </div>
                  </div>
                </div>
                
                <!-- Mostrar duración calculada -->
                <div v-if="formData.fecha_inicio && formData.fecha_fin" class="p-2 bg-green-100 border-round mt-2">
                  <div class="flex align-items-center">
                    <i class="pi pi-info-circle text-green-600 mr-2"></i>
                    <span class="text-green-700">
                      Duración: {{ mesesDuracion }} {{ mesesDuracion === 1 ? 'mes' : 'meses' }}
                      (Bs. {{ formatMonto(montoRealCalculado) }} total)
                    </span>
                  </div>
                </div>
              </div>

              <!-- Información general de horarios -->
              <div class="mb-4 p-3 border-round bg-green-50 flex justify-content-between align-items-center">
                <div>
                  <i class="pi pi-info-circle text-primary mr-2"></i>
                  <span>Haz clic en los horarios que deseas seleccionar</span>
                </div>
                <div class="flex align-items-center gap-2">
                  <Tag :value="`${horariosSeleccionados.length} seleccionados`" severity="info" />
                </div>
              </div>

              <!-- Lista de horarios en grid -->
              <div v-if="cargandoHorarios" class="p-4 text-center">
                <ProgressSpinner style="width: 50px; height: 50px" />
                <p class="text-500 mt-2">Cargando horarios disponibles...</p>
              </div>

              <div v-else-if="horariosParaInscripcion.length === 0" class="p-4 text-center border-round surface-border">
                <i class="pi pi-calendar-times text-400" style="font-size: 3rem"></i>
                <p class="text-500 mt-2">No hay horarios disponibles para esta modalidad</p>
              </div>

              <div v-else class="horarios-grid">
                <div v-for="horario in horariosParaInscripcion" :key="horario.id" 
                  class="horario-card" :class="{ 'selected': estaSeleccionado(horario.id) }"
                  @click="toggleHorarioSeleccionado(horario)">
                  
                  <div class="horario-header">
                    <div class="horario-dia">{{ horario.dia_semana }}</div>
                    <div class="horario-hora">{{ horario.hora_inicio?.substring(0,5) }} - {{ horario.hora_fin?.substring(0,5) }}</div>
                  </div>
                  
                  <div class="horario-body">
                    <div class="horario-info">
                      <i class="pi pi-user"></i>
                      <span>{{ horario.entrenador_nombre || 'Sin entrenador' }}</span>
                    </div>
                    <div class="horario-info">
                      <i class="pi pi-building"></i>
                      <span>{{ horario.sucursal_nombre || 'Sin sucursal' }}</span>
                    </div>
                    <div class="horario-cupo" :class="{
                      'cupo-disponible': horario.cupo_disponible > 5,
                      'cupo-limitado': horario.cupo_disponible > 0 && horario.cupo_disponible <= 5,
                      'cupo-lleno': horario.cupo_disponible <= 0
                    }">
                      <i class="pi pi-users"></i>
                      <span>{{ horario.cupo_disponible || 0 }} cupos</span>
                    </div>
                  </div>

                  <div class="horario-footer">
                    <i v-if="estaSeleccionado(horario.id)" class="pi pi-check-circle selected-icon"></i>
                  </div>
                </div>
              </div>

              <!-- Horarios seleccionados (resumen) -->
              <div v-if="horariosSeleccionados.length > 0" class="mt-4 p-3 border-round bg-blue-50">
                <h5 class="mt-0 mb-2">✅ Horarios seleccionados ({{ horariosSeleccionados.length }})</h5>
                <div class="flex flex-wrap gap-2">
                  <Chip v-for="horario in horariosSeleccionadosDetalles" :key="horario.id" 
                    :label="`${horario.dia_semana} ${horario.hora_inicio?.substring(0,5)}`" 
                    removable @remove="quitarHorario(horario.id)" />
                </div>
              </div>

              <div class="form-group mt-4">
                <label for="observaciones">Observaciones (opcional)</label>
                <Textarea id="observaciones" v-model="formData.observaciones" rows="2" 
                  placeholder="Alguna preferencia especial, lesiones, etc." :disabled="enviando" />
              </div>

              <div class="form-checkbox">
                <Checkbox v-model="formData.acepta_terminos" id="terminos" binary 
                  :class="{ 'p-invalid': errors.acepta_terminos }" :disabled="enviando" />
                <label for="terminos" class="checkbox-label">
                  Acepto los términos y condiciones y autorizo el tratamiento de mis datos personales
                </label>
                <small v-if="errors.acepta_terminos" class="p-error">{{ errors.acepta_terminos }}</small>
              </div>

              <div class="form-navigation">
                <Button label="Anterior" icon="pi pi-arrow-left" @click="pasoActual = 2" class="p-button-outlined mr-2" />
                <Button :label="enviando ? 'Enviando...' : 'Enviar Preinscripción'" 
                  :icon="enviando ? 'pi pi-spin pi-spinner' : 'pi pi-send'"
                  :loading="enviando" @click="enviarFormulario" severity="danger" 
                  :disabled="enviando || horariosSeleccionados.length === 0 || !formData.acepta_terminos" />
              </div>
            </div>

            <small class="form-note mt-3">
              * Nos contactaremos contigo en 24 horas para confirmar tu inscripción
            </small>
          </div>
        </div>

        <!-- Sección de beneficios -->
        <div class="preinscripcion-benefits">
          <h3>¿Por qué elegirnos?</h3>
          
          <div class="benefits-list">
            <div class="benefit-item">
              <div class="benefit-icon-wrapper">
                <i class="pi pi-check-circle benefit-icon"></i>
              </div>
              <div class="benefit-content">
                <h4>Clase de Prueba Gratis</h4>
                <p>Ven a conocer nuestras instalaciones y metodología sin compromiso</p>
              </div>
            </div>
            
            <div class="benefit-item">
              <div class="benefit-icon-wrapper">
                <i class="pi pi-star benefit-icon"></i>
              </div>
              <div class="benefit-content">
                <h4>Entrenadores Certificados</h4>
                <p>Profesionales con amplia experiencia en artes marciales</p>
              </div>
            </div>
            
            <div class="benefit-item">
              <div class="benefit-icon-wrapper">
                <i class="pi pi-shield benefit-icon"></i>
              </div>
              <div class="benefit-content">
                <h4>Equipo Incluido</h4>
                <p>No necesitas comprar equipo para empezar a entrenar</p>
              </div>
            </div>
            
            <div class="benefit-item">
              <div class="benefit-icon-wrapper">
                <i class="pi pi-calendar benefit-icon"></i>
              </div>
              <div class="benefit-content">
                <h4>Horarios Flexibles</h4>
                <p>Elige los días y horas que mejor se adapten a tu rutina</p>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <i class="pi pi-quote-left" style="font-size: 2rem; color: #f59e0b; opacity: 0.5;"></i>
            <p class="testimonial-text">"Desde que me uní a Alianza Bolivia MMA, mi vida cambió por completo. Los instructores son excelentes y el ambiente es increíble."</p>
            <div class="testimonial-author">
              <Avatar label="CG" shape="circle" class="mr-2" style="background-color: #f59e0b" />
              <div>
                <strong>Carlos Gutiérrez</strong>
                <small>Alumno desde 2023</small>
              </div>
            </div>
          </div>

          <div class="contact-info">
            <h4>📞 Contáctanos</h4>
            <div class="contact-item">
              <i class="pi pi-phone"></i>
              <span>+591 60108969</span>
            </div>
            <div class="contact-item">
              <i class="pi pi-whatsapp"></i>
              <span>WhatsApp: +591 60108969</span>
            </div>
            <div class="contact-item">
              <i class="pi pi-clock"></i>
              <span>Atención: 6:00 AM - 10:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import publicService from '@/services/public.service';
import preinscripcionService from '@/services/preinscripcion.service';

// Componentes PrimeVue
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Chip from 'primevue/chip';
import Avatar from 'primevue/avatar';
import ProgressSpinner from 'primevue/progressspinner';
import Calendar from 'primevue/calendar';

const toast = useToast();

// ============================================
// CONFIGURACIÓN DE PAGO
// ============================================
const telefonoWhatsApp = '59160108969';
const telefonoSoporte = '59160108969';

// ============================================
// DATOS DEL FORMULARIO
// ============================================
const pasoActual = ref(1);
const formData = ref({
  nombres: '',
  apellidos: '',
  ci: '',
  telefono: '',
  correo: '',
  sucursal_id: null,
  modalidad_id: null,
  fecha_inicio: new Date(),
  fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  observaciones: '',
  acepta_terminos: false
});

const horariosSeleccionados = ref([]);
const horariosSeleccionadosDetalles = ref([]);

const errors = ref({});
const enviando = ref(false);
const enviadoExitosamente = ref(false);

// Estados de carga
const cargandoSucursales = ref(false);
const cargandoModalidades = ref(false);
const cargandoHorarios = ref(false);

// ============================================
// DATOS GUARDADOS PARA EL MENSAJE DE ÉXITO
// ============================================
const datosGuardados = ref(null);

// ============================================
// DATOS DESDE EL BACKEND
// ============================================
const sucursales = ref([]);
const modalidades = ref([]);
const horarios = ref([]);

// ============================================
// COMPUTED - CÁLCULOS REALES
// ============================================
const sucursalSeleccionada = computed(() => {
  return sucursales.value.find(s => s.id === formData.value.sucursal_id);
});

const modalidadSeleccionada = computed(() => {
  return modalidades.value.find(m => m.id === formData.value.modalidad_id);
});

const horariosParaInscripcion = computed(() => {
  if (!formData.value.modalidad_id) return [];
  
  return horarios.value
    .filter(h => h.modalidad_id === formData.value.modalidad_id)
    .map(h => ({
      ...h,
      nombre_horario: `${h.dia_semana} ${h.hora_inicio?.substring(0,5)} - ${h.hora_fin?.substring(0,5)}`
    }));
});

// ============================================
// CÁLCULOS DEL MONTO REAL
// ============================================
const mesesDuracion = computed(() => {
  if (!formData.value.fecha_inicio || !formData.value.fecha_fin) return 1;
  
  const inicio = new Date(formData.value.fecha_inicio);
  const fin = new Date(formData.value.fecha_fin);
  
  const meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + 
                (fin.getMonth() - inicio.getMonth());
  
  return Math.max(1, meses);
});

const montoRealCalculado = computed(() => {
  if (!modalidadSeleccionada.value) return 0;
  
  const precioMensual = modalidadSeleccionada.value.precio_mensual || 0;
  const meses = mesesDuracion.value;
  
  return precioMensual * meses;
});

// ============================================
// FUNCIONES DE VALIDACIÓN POR PASOS
// ============================================
function validarPaso1() {
  return formData.value.nombres?.trim() && 
         formData.value.apellidos?.trim() && 
         formData.value.ci?.trim() && 
         formData.value.telefono?.trim() && 
         formData.value.correo?.trim() &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.correo);
}

function validarPaso2() {
  return formData.value.sucursal_id && formData.value.modalidad_id;
}

function validarPaso3() {
  return horariosSeleccionados.value.length > 0 && formData.value.acepta_terminos;
}

// ============================================
// NAVEGACIÓN ENTRE PASOS
// ============================================
function irAlPaso2() {
  if (!validarPaso1()) {
    toast.add({
      severity: 'error',
      summary: 'Error de validación',
      detail: 'Completa todos los campos personales correctamente',
      life: 3000
    });
    return;
  }
  pasoActual.value = 2;
}

function irAlPaso3() {
  if (!validarPaso2()) {
    toast.add({
      severity: 'error',
      summary: 'Error de validación',
      detail: 'Selecciona una sucursal y una modalidad',
      life: 3000
    });
    return;
  }
  pasoActual.value = 3;
}

// ============================================
// MANEJO DE HORARIOS
// ============================================
function estaSeleccionado(horarioId) {
  return horariosSeleccionados.value.includes(horarioId);
}

function toggleHorarioSeleccionado(horario) {
  const index = horariosSeleccionados.value.indexOf(horario.id);
  
  if (index === -1) {
    horariosSeleccionados.value = [...horariosSeleccionados.value, horario.id];
    horariosSeleccionadosDetalles.value = [...horariosSeleccionadosDetalles.value, horario];
    
    toast.add({
      severity: 'success',
      summary: 'Horario agregado',
      detail: `${horario.dia_semana} ${horario.hora_inicio?.substring(0,5)} seleccionado`,
      life: 1500
    });
  } else {
    horariosSeleccionados.value = horariosSeleccionados.value.filter(id => id !== horario.id);
    horariosSeleccionadosDetalles.value = horariosSeleccionadosDetalles.value.filter(h => h.id !== horario.id);
    
    toast.add({
      severity: 'info',
      summary: 'Horario removido',
      detail: `${horario.dia_semana} ${horario.hora_inicio?.substring(0,5)} removido`,
      life: 1500
    });
  }
}

function quitarHorario(horarioId) {
  horariosSeleccionados.value = horariosSeleccionados.value.filter(id => id !== horarioId);
  horariosSeleccionadosDetalles.value = horariosSeleccionadosDetalles.value.filter(h => h.id !== horarioId);
}

function onModalidadChange() {
  horariosSeleccionados.value = [];
  horariosSeleccionadosDetalles.value = [];
}

// ============================================
// CARGAR DATOS INICIALES
// ============================================
onMounted(async () => {
  await Promise.all([
    cargarSucursales(),
    cargarModalidades(),
    cargarHorarios()
  ]);
});

async function cargarSucursales() {
  cargandoSucursales.value = true;
  try {
    const response = await publicService.getSucursales();
    if (response.data?.success) {
      sucursales.value = response.data.data || [];
    }
  } catch (error) {
    console.error('❌ Error cargando sucursales:', error);
    sucursales.value = [
      { id: 1, nombre: 'Oficina Central', direccion: 'Calle 14 de Calacoto', telefono: '60108969' },
      { id: 3, nombre: 'Sucursal 1', direccion: 'San Pedro', telefono: '22256369' }
    ];
  } finally {
    cargandoSucursales.value = false;
  }
}

async function cargarModalidades() {
  cargandoModalidades.value = true;
  try {
    const response = await publicService.getModalidades();
    if (response.data?.success) {
      modalidades.value = response.data.data || [];
    }
  } catch (error) {
    console.error('❌ Error cargando modalidades:', error);
    modalidades.value = [];
  } finally {
    cargandoModalidades.value = false;
  }
}

async function cargarHorarios() {
  cargandoHorarios.value = true;
  try {
    const response = await publicService.getHorarios();
    if (response.data?.success) {
      horarios.value = response.data.data || [];
    }
  } catch (error) {
    console.error('❌ Error cargando horarios:', error);
    horarios.value = [];
  } finally {
    cargandoHorarios.value = false;
  }
}

// ============================================
// FUNCIONES DE CÁLCULO AUXILIARES
// ============================================
function calcularMesesDuracionPreinscripcion() {
  return mesesDuracion.value;
}

function calcularDiasDuracion() {
  if (!formData.value.fecha_inicio || !formData.value.fecha_fin) return 0;
  
  const inicio = new Date(formData.value.fecha_inicio);
  const fin = new Date(formData.value.fecha_fin);
  
  const diffTime = Math.abs(fin - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1;
}

function calcularClasesEstimadas() {
  if (!modalidadSeleccionada.value || horariosSeleccionados.value.length === 0) return 0;
  
  const clasesPorMes = modalidadSeleccionada.value.clases_mensuales || 12;
  return clasesPorMes * mesesDuracion.value;
}

function formatMonto(monto) {
  if (!monto && monto !== 0) return '0.00';
  return parseFloat(monto).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ============================================
// ENVIAR FORMULARIO
// ============================================
async function enviarFormulario() {
  if (!validarPaso3()) {
    toast.add({
      severity: 'error',
      summary: 'Error de validación',
      detail: 'Selecciona horarios y acepta términos',
      life: 3000
    });
    return;
  }
  
  if (!formData.value.fecha_inicio || !formData.value.fecha_fin) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Selecciona fechas de inicio y fin',
      life: 3000
    });
    return;
  }
  
  if (new Date(formData.value.fecha_fin) <= new Date(formData.value.fecha_inicio)) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'La fecha fin debe ser posterior a la fecha inicio',
      life: 3000
    });
    return;
  }
  
  enviando.value = true;
  
  try {
    const datosEnvio = {
      nombres: formData.value.nombres?.trim() || '',
      apellidos: formData.value.apellidos?.trim() || '',
      ci: formData.value.ci?.trim() || '',
      telefono: formData.value.telefono?.trim() || '',
      correo: formData.value.correo?.trim().toLowerCase() || '',
      sucursal_id: Number(formData.value.sucursal_id),
      modalidad_id: Number(formData.value.modalidad_id),
      fecha_inicio: formData.value.fecha_inicio.toISOString().split('T')[0],
      fecha_fin: formData.value.fecha_fin.toISOString().split('T')[0],
      horarios: horariosSeleccionados.value.map(id => Number(id)),
      observaciones: formData.value.observaciones?.trim() || '',
      acepta_terminos: formData.value.acepta_terminos ? 1 : 0
    };

    const response = await preinscripcionService.enviarPreinscripcion(datosEnvio);
    
    if (response.data?.success) {
      // ✅ GUARDAR TODOS LOS DATOS ANTES DE RESETEAR
      datosGuardados.value = {
        nombres: formData.value.nombres,
        apellidos: formData.value.apellidos,
        ci: formData.value.ci,
        telefono: formData.value.telefono,
        correo: formData.value.correo,
        sucursal: sucursalSeleccionada.value?.nombre || 'No especificada',
        modalidad: modalidadSeleccionada.value?.nombre || 'No especificada',
        precioMensual: modalidadSeleccionada.value?.precio_mensual || 0,
        meses: mesesDuracion.value,
        monto: montoRealCalculado.value,
        horarios: horariosSeleccionadosDetalles.value.map(h => ({
          dia: h.dia_semana,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin
        }))
      };
      
      resetFormulario();
      enviadoExitosamente.value = true;
      
      toast.add({
        severity: 'success',
        summary: '✅ ¡Preinscripción exitosa!',
        detail: `${datosGuardados.value.meses} meses - Bs. ${formatMonto(datosGuardados.value.monto)}`,
        life: 5000
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    let mensajeError = 'Error al enviar la preinscripción';
    
    if (error.response?.data?.errors) {
      mensajeError = Object.entries(error.response.data.errors)
        .map(([campo, msgs]) => `${campo}: ${msgs.join(', ')}`)
        .join(' • ');
    } else if (error.response?.data?.message) {
      mensajeError = error.response.data.message;
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensajeError,
      life: 5000
    });
    
  } finally {
    enviando.value = false;
  }
}

// ============================================
// FUNCIÓN PARA ENVIAR WHATSAPP CON DATOS GUARDADOS
// ============================================
function enviarWhatsApp() {
  if (!datosGuardados.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No hay datos de preinscripción',
      life: 3000
    });
    return;
  }
  
  const numero = telefonoWhatsApp.replace(/\D/g, '');
  const mensaje = crearMensajeWhatsApp();
  const mensajeCodificado = encodeURIComponent(mensaje);
  const urlWhatsApp = `https://wa.me/${numero}?text=${mensajeCodificado}`;
  
  window.open(urlWhatsApp, '_blank');
  
  toast.add({
    severity: 'success',
    summary: 'WhatsApp abierto',
    detail: 'Envía el comprobante de pago',
    life: 3000
  });
}

// ============================================
// CREAR MENSAJE DE WHATSAPP CON DATOS GUARDADOS
// ============================================
function crearMensajeWhatsApp() {
  if (!datosGuardados.value) return '';
  
  const fecha = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const horariosTexto = datosGuardados.value.horarios.length > 0 
    ? datosGuardados.value.horarios.map(h => 
        `• ${h.dia} ${h.hora_inicio?.substring(0,5)} - ${h.hora_fin?.substring(0,5)}`
      ).join('\n')
    : 'No especificados';
  
  return `🔴 *NUEVA PREINSCRIPCIÓN - ALIANZA BOLIVIA MMA*
  
📋 *DATOS DEL ESTUDIANTE*
──────────────────────
👤 *Nombre:* ${datosGuardados.value.nombres || ''} ${datosGuardados.value.apellidos || ''}
🆔 *CI:* ${datosGuardados.value.ci || '---'}
📞 *Teléfono:* ${datosGuardados.value.telefono || '---'}
📧 *Correo:* ${datosGuardados.value.correo || '---'}

🏢 *SUCURSAL Y MODALIDAD*
──────────────────────
📍 *Sucursal:* ${datosGuardados.value.sucursal}
🥋 *Modalidad:* ${datosGuardados.value.modalidad}

📅 *HORARIOS SELECCIONADOS*
──────────────────────
${horariosTexto}

💰 *INFORMACIÓN DE PAGO*
──────────────────────
📆 *Duración:* ${datosGuardados.value.meses} ${datosGuardados.value.meses === 1 ? 'mes' : 'meses'}
💵 *Precio mensual:* Bs. ${formatMonto(datosGuardados.value.precioMensual)}
💰 *TOTAL A PAGAR:* *Bs. ${formatMonto(datosGuardados.value.monto)}*

✅ *COMPROBANTE ADJUNTO*
──────────────────────
(Por favor, adjunta la imagen del comprobante de pago)

🕐 *Fecha:* ${fecha}
  
_*Este mensaje fue enviado automáticamente desde el formulario de preinscripción*_`;
}

// ============================================
// RESETEAR FORMULARIO
// ============================================
function resetFormulario() {
  formData.value = {
    nombres: '',
    apellidos: '',
    ci: '',
    telefono: '',
    correo: '',
    sucursal_id: null,
    modalidad_id: null,
    fecha_inicio: new Date(),
    fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    observaciones: '',
    acepta_terminos: false
  };
  horariosSeleccionados.value = [];
  horariosSeleccionadosDetalles.value = [];
  errors.value = {};
  pasoActual.value = 1;
  enviadoExitosamente.value = false;
  // NOTA: NO reseteamos datosGuardados aquí porque se usa en el mensaje de éxito
}

// ============================================
// RESETEAR COMPLETO (CUANDO SE QUIERE OTRA PREINSCRIPCIÓN)
// ============================================
function resetCompleto() {
  resetFormulario();
  datosGuardados.value = null;
}
</script>

<style scoped>
/* ===== ESTILOS PRINCIPALES ===== */
.preinscripcion {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 4rem 0;
  min-height: 100vh;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.preinscripcion-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
}

/* ===== FORMULARIO PRINCIPAL ===== */
.preinscripcion-form {
  background: white;
  padding: 2.5rem;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.highlight {
  color: #dc2626;
  position: relative;
  display: inline-block;
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 100%;
  height: 8px;
  background: rgba(220, 38, 38, 0.2);
  z-index: -1;
}

.section-subtitle {
  color: #64748b;
  font-size: 1.2rem;
}

/* ===== STEPPER ===== */
.stepper-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 50px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  cursor: pointer;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 2px solid #cbd5e1;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.step-item.active .step-number {
  background: #dc2626;
  border-color: #dc2626;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.2);
}

.step-item.completed .step-number {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.step-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
}

.step-item.active .step-label {
  color: #dc2626;
  font-weight: 600;
}

.step-line {
  height: 3px;
  flex: 1;
  background: #cbd5e1;
  margin: 0 0.5rem;
  transition: all 0.3s ease;
}

.step-line.active {
  background: #dc2626;
}

/* ===== CONTENIDO DE PASOS ===== */
.step-content {
  animation: fadeIn 0.3s ease-out;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

/* ===== FORMULARIOS ===== */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #475569;
  font-weight: 500;
}

.form-navigation {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* ===== HORARIOS GRID ===== */
.horarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.horario-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.horario-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: #94a3b8;
}

.horario-card.selected {
  border-color: #dc2626;
  background: linear-gradient(135deg, #fff 0%, #fff5f5 100%);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
}

.horario-header {
  margin-bottom: 1rem;
}

.horario-dia {
  font-weight: 700;
  font-size: 1.1rem;
  color: #1e293b;
}

.horario-hora {
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.horario-body {
  margin-bottom: 1rem;
}

.horario-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 0.5rem;
}

.horario-info i {
  color: #dc2626;
  font-size: 0.9rem;
  width: 16px;
}

.horario-cupo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  background: #f1f5f9;
}

.cupo-disponible {
  color: #059669;
}

.cupo-limitado {
  color: #d97706;
}

.cupo-lleno {
  color: #dc2626;
}

.horario-footer {
  display: flex;
  justify-content: flex-end;
}

.selected-icon {
  color: #dc2626;
  font-size: 1.5rem;
}

/* ===== MODALIDAD INFO ===== */
.modalidad-info {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border: 1px solid #c7d2fe;
  margin: 1.5rem 0;
}

/* ===== FORM CHECKBOX ===== */
.form-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin: 2rem 0 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
}

.checkbox-label {
  color: #475569;
  line-height: 1.5;
  flex: 1;
}

/* ===== MENSAJE DE ÉXITO MEJORADO ===== */
.success-message {
  text-align: center;
  padding: 2rem;
  animation: fadeIn 0.5s ease-out;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.success-icon i {
  color: white;
  font-size: 3rem;
}

.success-message h3 {
  color: #1e293b;
  font-size: 2rem;
  margin: 0 0 0.5rem;
}

.success-text {
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

/* ===== SECCIÓN DE PAGO ===== */
.pago-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.pago-title {
  font-size: 1.3rem;
  color: #1e293b;
  margin: 0 0 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pago-title i {
  color: #10b981;
}

/* ===== QR CONTAINER ===== */
.qr-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.qr-code {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed #cbd5e1;
}

.qr-image {
  max-width: 200px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.qr-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  background: #f1f5f9;
  padding: 1.5rem;
  border-radius: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #64748b;
  font-weight: 500;
}

.info-value {
  color: #1e293b;
  font-weight: 600;
}

.info-value.highlight {
  color: #10b981;
  font-size: 1.4rem;
  font-weight: 700;
}

.highlight-item {
  background: #e6f7e6;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin: -0.5rem -0.5rem 0.5rem -0.5rem;
}

/* ===== DESGLOSE DE PAGO ===== */
.desglose-pago {
  background: #fff9e6;
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  border: 1px solid #ffe58f;
}

.desglose-titulo {
  color: #b85c00;
  font-size: 1rem;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.desglose-titulo i {
  color: #f59e0b;
}

.desglose-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px dashed #ffe58f;
}

.desglose-item.total {
  border-top: 2px solid #f59e0b;
  border-bottom: none;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-weight: 700;
  font-size: 1.1rem;
}

.total-monto {
  color: #b85c00;
  font-size: 1.3rem;
  font-weight: 800;
}

/* ===== INSTRUCCIONES DE PAGO ===== */
.instrucciones-pago {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  border: 1px solid #e2e8f0;
}

.instrucciones-titulo {
  color: #1e293b;
  font-size: 1.1rem;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.instrucciones-titulo i {
  color: #3b82f6;
}

.instrucciones-lista {
  margin: 0;
  padding-left: 1.5rem;
  color: #475569;
  line-height: 1.8;
}

.instrucciones-lista li {
  margin-bottom: 0.5rem;
}

.instrucciones-lista strong {
  color: #10b981;
}

/* ===== WHATSAPP SECTION ===== */
.whatsapp-section {
  margin: 2rem 0 1rem;
}

.whatsapp-button {
  background: linear-gradient(135deg, #25D366, #128C7E) !important;
  border: none !important;
  padding: 1rem !important;
  font-size: 1.2rem !important;
  font-weight: 600 !important;
  width: 100%;
  border-radius: 50px !important;
  box-shadow: 0 10px 20px rgba(37, 211, 102, 0.3) !important;
  transition: all 0.3s ease !important;
}

.whatsapp-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(37, 211, 102, 0.4) !important;
}

.whatsapp-button i {
  font-size: 1.5rem;
}

.whatsapp-helper {
  margin-top: 1rem;
  color: #94a3b8;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.whatsapp-helper i {
  color: #f59e0b;
}

/* ===== CONTACTO ALTERNATIVO ===== */
.contacto-alternativo {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.contacto-alternativo p {
  color: #64748b;
  margin-bottom: 1rem;
}

.contacto-items {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.contacto-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border-radius: 30px;
  color: #475569;
  text-decoration: none;
  transition: all 0.2s;
}

.contacto-link:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.contacto-link i {
  font-size: 1rem;
}

/* ===== SECCIÓN DE BENEFICIOS ===== */
.preinscripcion-benefits {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 2.5rem;
  border-radius: 24px;
  color: white;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.preinscripcion-benefits h3 {
  color: white;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  position: relative;
}

.preinscripcion-benefits h3::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 60px;
  height: 4px;
  background: #dc2626;
  border-radius: 2px;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.benefit-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: transform 0.2s;
}

.benefit-item:hover {
  transform: translateX(5px);
}

.benefit-icon-wrapper {
  background: rgba(220, 38, 38, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.benefit-icon {
  color: #dc2626;
  font-size: 1.2rem;
}

.benefit-content h4 {
  color: white;
  margin: 0 0 0.3rem;
  font-size: 1.1rem;
}

.benefit-content p {
  color: #cbd5e1;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* ===== TESTIMONIAL ===== */
.testimonial-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 16px;
  margin: 2rem 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.testimonial-text {
  font-style: italic;
  color: #e2e8f0;
  line-height: 1.6;
  margin: 1rem 0;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ===== CONTACTO INFO ===== */
.contact-info {
  border-top: 1px solid #334155;
  padding-top: 2rem;
  margin-top: 2rem;
}

.contact-info h4 {
  color: white;
  margin-bottom: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #cbd5e1;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.contact-item i {
  color: #dc2626;
  width: 20px;
}

/* ===== ANIMACIONES ===== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .preinscripcion-container {
    grid-template-columns: 1fr;
  }
  
  .preinscripcion-benefits {
    position: static;
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .stepper-header {
    flex-direction: column;
    gap: 1rem;
    background: transparent;
  }
  
  .step-line {
    display: none;
  }
  
  .horarios-grid {
    grid-template-columns: 1fr;
  }
  
  .preinscripcion-form,
  .preinscripcion-benefits {
    padding: 1.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .qr-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .qr-code {
    order: 2;
  }
  
  .qr-info {
    order: 1;
  }
  
  .contacto-items {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .preinscripcion {
    padding: 2rem 0;
  }
  
  .step-item {
    width: 100%;
  }
  
  .step-number {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }
  
  .step-label {
    font-size: 0.8rem;
  }
}
</style>