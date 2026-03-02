import axios from "axios";

const urlBaseMeta = import.meta.env.VITE_API_URL + "/api";

console.log('VITE_API_URL desde env:', import.meta.env.VITE_API_URL);
console.log('Base URL usada para API:', urlBaseMeta);

// ============================================
// INSTANCIA PRIVADA (CON TOKEN) - Para admin
// ============================================
export const Api = () => {
    let token = localStorage.getItem("access_token");

    const api = axios.create({
        baseURL: urlBaseMeta,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response) {
                if (error.response.status === 401) {
                    console.log("🔒 Error 401: Sesión expirada");
                    localStorage.removeItem("access_token");
                    // Solo redirigir si NO es un endpoint público
                    const requestUrl = error.config?.url || '';
                    if (!requestUrl.includes('/public/')) {
                        console.log("⏭️ Redirigiendo a login");
                        window.location.href = "/login";
                    } else {
                        console.log("⚠️ Error 401 en endpoint público - ignorando");
                    }
                } else {
                    console.error(`Error ${error.response.status}:`, error.response.data.message || "Error desconocido");
                }
            } else {
                console.error("Error de red o servidor no disponible.");
            }
            return Promise.reject(error);
        }
    );
    
    return api;
};

// ============================================
// NUEVO: INSTANCIA PÚBLICA (SIN TOKEN) - Para landing page
// ============================================
export const ApiPublic = () => {
    const api = axios.create({
        baseURL: urlBaseMeta,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        // 👈 NO se envía token
    });

    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response) {
                console.error(`Error en API pública ${error.response.status}:`, error.response.data.message || "Error");
                // ❌ NUNCA redirigir al login
            } else {
                console.error("Error de red en API pública:", error.message);
            }
            return Promise.reject(error);
        }
    );
    
    return api;
};