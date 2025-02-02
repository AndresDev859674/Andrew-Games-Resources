// renderer.js
const { ipcRenderer } = require('electron');

async function applyTheme() {
  const theme = await ipcRenderer.invoke('get-saved-theme');
  if (theme === 'blue') {
    document.body.className = 'blue'; // Aplicar la clase CSS personalizada
  } else {
    document.body.className = theme; // Aplicar temas 'light', 'dark', 'system'
  }
}

// Llamar al inicio de la aplicación
applyTheme();
