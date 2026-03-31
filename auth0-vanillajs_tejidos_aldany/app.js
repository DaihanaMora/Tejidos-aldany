import { createAuth0Client } from '@auth0/auth0-spa-js';

// Elementos del DOM
const loading = document.getElementById('loading');
const app = document.getElementById('app');
const loggedOutSection = document.getElementById('logged-out');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');

let auth0Client;
const LOGO_PATH = './imgs/logo.png'; 
const API_URL = 'http://localhost:3000/api';

async function initAuth0() {
  try {
    showLoading();
    auth0Client = await createAuth0Client({
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      authorizationParams: { 
        redirect_uri: window.location.origin 
      }
    });

    const query = window.location.search;
    if (query.includes('code=') && query.includes('state=')) {
      await auth0Client.handleRedirectCallback();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    await updateUI();
  } catch (err) {
    console.error("Error Auth0:", err);
    hideLoading();
  }
}

async function updateUI() {
  const isAuthenticated = await auth0Client.isAuthenticated();
  if (isAuthenticated) {
    await renderDashboard();
  } else {
    showLoggedOut();
    hideLoading();
  }
}

async function renderDashboard() {
  const user = await auth0Client.getUser();
  const nombreUsuario = user.name || user.nickname || "Admin";
  const iniciales = nombreUsuario.substring(0, 2).toUpperCase();
  
  const avatarHtml = user.picture && !user.picture.includes('gravatar')
    ? `<img src="${user.picture}" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #00ff88;">`
    : `<div style="width: 45px; height: 45px; border-radius: 50%; background: #00ff88; color: #1a1e27; display: flex; align-items: center; justify-content: center; font-weight: 800; border: 2px solid #fff;">${iniciales}</div>`;

  app.innerHTML = `
    <div class="main-card-wrapper" style="max-width: 1000px; width: 95%; padding: 2rem;">
      <header style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 1px solid #2d313c; padding-bottom: 1.5rem; margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <img src="${LOGO_PATH}" style="width: 60px;">
          <div style="text-align: left;">
            <div style="font-weight: 700; color: #fff; font-size: 1.1rem;">${nombreUsuario}</div>
            <div style="font-size: 0.8rem; color: #a0aec0;">${user.email}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 1.2rem;">
          ${avatarHtml}
          <button id="logout-btn" class="button logout" style="padding: 0.5rem 1.2rem; font-size: 0.75rem;">SALIR</button>
        </div>
      </header>

      <main style="display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; width: 100%;">
        
        <section class="action-card" style="padding: 2rem; background: #1a1e27; border: 1px solid #2d313c; border-radius: 12px;">
          <h3 style="color: #00ff88; margin-bottom: 1.5rem; text-align: left;">Registrar Usuario en DB</h3>
          <div style="display: flex; flex-direction: column; gap: 15px;">
            <input type="text" id="db-user-name" placeholder="Nombre Completo" style="padding: 12px; background: #0a0a0f; border: 1px solid #4a5568; color: white; border-radius: 8px;">
            <select id="db-user-rol" style="padding: 12px; background: #0a0a0f; border: 1px solid #4a5568; color: white; border-radius: 8px;">
                <option value="Oficina">Oficina</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Tejedor">Tejedor</option>
            </select>
            <button id="btn-save-user" class="button login" style="width: 100%;">GUARDAR</button>
          </div>
        </section>

        <section class="action-card" style="padding: 2rem; background: #1a1e27; border: 1px solid #2d313c; border-radius: 12px;">
          <h3 style="color: #00ff88; margin-bottom: 1.5rem; text-align: left;">Registrar Cliente en DB</h3>
          <div style="display: flex; flex-direction: column; gap: 15px;">
            <input type="text" id="db-client-name" placeholder="Nombre Empresa / Persona" style="padding: 12px; background: #0a0a0f; border: 1px solid #4a5568; color: white; border-radius: 8px;">
            <input type="text" id="db-client-contact" placeholder="Contacto (WhatsApp/Email)" style="padding: 12px; background: #0a0a0f; border: 1px solid #4a5568; color: white; border-radius: 8px;">
            <button id="btn-save-client" class="button login" style="width: 100%;">GUARDAR</button>
          </div>
        </section>

      </main>

      <section style="margin-top: 2rem; background: #1a1e27; padding: 1.5rem; border-radius: 12px; border: 1px solid #2d313c;">
          <h4 style="color: #a0aec0; margin-bottom: 1rem;">Estado de la Base de Datos</h4>
          <div id="db-preview" style="color: #718096; font-size: 0.85rem;">Sincronizando...</div>
      </section>
    </div>
  `;

  // Listeners de Guardado
  document.getElementById('btn-save-user').onclick = () => saveToPostgres('usuarios', {
    Nombre: document.getElementById('db-user-name').value,
    Rol: document.getElementById('db-user-rol').value
  });

  document.getElementById('btn-save-client').onclick = () => saveToPostgres('clientes', {
    nombre: document.getElementById('db-client-name').value,
    contacto: document.getElementById('db-client-contact').value
  });

  // Listener de Logout (reinstalado)
  document.getElementById('logout-btn').addEventListener('click', () => {
    auth0Client.logout({ 
      logoutParams: { returnTo: window.location.origin } 
    });
  });

  actualizarVistaPrevia();
  hideLoading();
}

async function saveToPostgres(endpoint, data) {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert(`¡Éxito! Registro guardado en la base de datos de Tejidos Aldany ✅`);
      actualizarVistaPrevia();
      if(endpoint === 'usuarios') document.getElementById('db-user-name').value = '';
      if(endpoint === 'clientes') {
        document.getElementById('db-client-name').value = '';
        document.getElementById('db-client-contact').value = '';
      }
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Revisa que el servidor Node (puerto 3000) esté corriendo.");
  }
}

async function actualizarVistaPrevia() {
    const preview = document.getElementById('db-preview');
    try {
        // 1. Cargamos ambos datos en paralelo
        const [resU, resC] = await Promise.all([
            fetch(`${API_URL}/usuarios`),
            fetch(`${API_URL}/clientes`)
        ]);
        
        const users = await resU.json();
        const clients = await resC.json();

        // 2. Construimos el resumen de conteo
        let html = `
            <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px dashed #2d313c;">
                <p><strong>Resumen:</strong> Usuarios: ${users.length} | Clientes: ${clients.length}</p>
            </div>
            
            <h4 style="color: #00ff88; margin-bottom: 10px;">Gestión de Usuarios</h4>
            <table style="width: 100%; color: white; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 1px solid #4a5568; text-align: left; font-size: 0.85rem; color: #a0aec0;">
                        <th style="padding: 10px;">Nombre</th>
                        <th style="padding: 10px;">Rol</th>
                        <th style="padding: 10px; text-align: center;">Acciones</th>
                    </tr>
                </thead>
                <tbody>`;

        // 3. Generamos las filas de la tabla de usuarios
        if (users.length === 0) {
            html += `<tr><td colspan="3" style="padding: 20px; text-align: center; color: #718096;">No hay usuarios registrados</td></tr>`;
        } else {
            users.forEach(user => {
              const nombre = user.nombre || user.Nombre || 'Sin nombre';
              const rol = user.rol || user.Rol || 'Sin rol';
              const id = user.idusuario || user.idUsuario || user.id;

                html += `
                    <tr style="border-bottom: 1px solid #2d313c;">
                        <td style="padding: 10px;">${nombre}</td>
                        <td style="padding: 10px;"><span style="color: #00ff88;">${rol}</span></td>
                        <td style="padding: 10px; text-align: center;">
                            <button onclick="window.eliminarRegistro('usuarios', ${id})" style="background: #e53e3e; color: white; border: none; border-radius: 4px; cursor: pointer; padding: 4px 10px; margin-right: 5px; font-size: 0.7rem;">BORRAR</button>
                            <button onclick="window.editarRegistro('usuarios', ${id}, '${nombre}')" style="background: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer; padding: 4px 10px; font-size: 0.7rem;">EDITAR</button>
                        </td>
                    </tr>`;
            });
        }

        html += `
                </tbody>
            </table>
            <p style="margin-top: 15px; color: #00ff88; font-size: 0.75rem; text-align: right;">📍 BD: tejidos_aldany_db</p>
        `;
        
        preview.innerHTML = html;
    } catch (e) {
        console.error("Error en vista previa:", e);
        preview.innerHTML = `<span style="color: #fc8181;">⚠️ Error: Servidor CRUD no detectado.</span>`;
    }
}

// --- Auth Helpers ---
const login = async () => await auth0Client.loginWithRedirect();
const signup = async () => await auth0Client.loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } });

const showLoading = () => { loading.style.display = 'block'; app.style.display = 'none'; };
const hideLoading = () => { loading.style.display = 'none'; app.style.display = 'flex'; };
const showLoggedOut = () => { loggedOutSection.style.display = 'flex'; app.style.display = 'none'; };

loginBtn.addEventListener('click', login);
signupBtn.addEventListener('click', signup);

initAuth0();