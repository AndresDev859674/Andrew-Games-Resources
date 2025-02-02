const { app, Tray, BrowserWindow, Menu, Notification, systemPreferences, dialog, ipcMain, ipcRenderer, nativeTheme } = require('electron');
console.log(app.getVersion());
const { shell } = require('electron'); // Importa el módulo shell
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os'); // Ensure os module is imported

const appDataPath = process.env.APPDATA || path.join(os.homedir(), '.config');
const FLAG_FILE = path.join(appDataPath, 'andres-games', 'password_flag.agdata');
const CHECK_UPDATE_STOP_FILE = path.join(appDataPath, 'andres-games', 'notification_check_update_stop.agdata');

let mainWindow;
let isNotOn = true; // Variable to track if not on Disqus

let tray = null;

// Variable global de menú
let menu;  // Definir la variable aquí, para que esté accesible en toda la función


// Ruta para guardar la configuración
const configPath = path.join(
  process.env.APPDATA || path.join(os.homedir(), '.config'),
  'andres-games',
  'config.json'
);

// Función para asegurarse de que el archivo de configuración exista
function ensureConfigFile() {
  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(
      configPath,
      JSON.stringify({ theme: 'system', allowThemeSave: true }, null, 2)
    );
  }
}

// Función para leer la configuración desde el archivo JSON
function getConfig() {
  ensureConfigFile();
  const rawData = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(rawData);
}

// Función para guardar la configuración en el archivo JSON
function saveConfig(config) {
  ensureConfigFile();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// **Cargar configuración inicial**
const config = getConfig();
nativeTheme.themeSource = config.theme;

// Create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 854,
    height: 480,
    icon: path.join(__dirname, 'Main Assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      enableBlinkFeatures: 'FluentScrollbars',
      contextIsolation: true,
    },
  });

  mainWindow.loadURL('https://sites.google.com/view/andrew-games/');

  console.log('Tema actual:', nativeTheme.shouldUseDarkColors ? 'Oscuro' : 'Claro');

  // Función para aplicar el tema guardado
function applySavedTheme() {
  const savedTheme = store.get('theme', 'system'); // Valor por defecto: 'system'
  nativeTheme.themeSource = savedTheme;
  console.log(`Aplicando tema guardado: ${savedTheme}`);
}

    // Evitar cerrar completamente la aplicación
    mainWindow.on('close', (event) => {
      if (!app.isQuitting) {
        event.preventDefault(); // Evitar que la ventana principal se cierre
        mainWindow.hide(); // Ocultar la ventana principal
      }
    });

  // Capture when a new window or tab is attempted to be opened
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('youtube.com')) {
      showNotification('Error Al Acceder Esta Pagina', 'No Tienes El Acceso Para Ir Esta Pagina.'); // Notification for blocked page
      return { action: 'deny' };  // Block YouTube
    }

    // Create a new window for all other URLs
    const newWindow = new BrowserWindow({
      width: 854,
      height: 480,
      icon: path.join(__dirname, 'Main Assets/anotherwindowopen.png'),
      webPreferences: {
        contextIsolation: true,
      },
    });

    newWindow.loadURL(url);

    // Check for specific URLs to hide the menu bar
    const blockedUrls = [
      'disqus.com',
      'drive.google.com',
      'https://andresdiazcraft.wixsite.com/andres-games-cy',
      'https://itch.io',
      'https://gemini.google.com/app',
      'https://drive.google.com/drive/my-drive',
      'https://zonacraft.net/',
      'https://photos.google.com/',
      "https://andresdiazcraft.wixsite.com/andres-games-cy",
      "https://google.com"
    ];

    if (blockedUrls.some(blockedUrl => url.includes(blockedUrl))) {
      newWindow.setMenuBarVisibility(false); // Hide the menu bar for the new window
      isNotOn = false; // Set to false when on Disqus or other blocked URLs
    } else {
      isNotOn = true; // Set to true if not on blocked URLs
    }

    // Close the secondary window if it navigates to a blocked URL
    newWindow.webContents.on('will-navigate', (event, navUrl) => {
      if (navUrl.includes('youtube.com')) {
        event.preventDefault();
        newWindow.close();  // Close the secondary window
        showNotification('Error', 'Access to this page is blocked.'); // Notification for blocked page
      }
    });

    return { action: 'deny' };  // Prevent automatic opening; we open manually
  });

  // Function to show notifications
  function showNotification(title, body) {
    const notification = new Notification({
      title: title,
      body: body,
    });
    notification.show();
  }

  // First notification: Welcome
  const welcomeNotification = new Notification({
    title: 'Bievenido!',
    body: 'andres Games Se Ha Iniciado Correctamente',
    icon: path.join(__dirname, 'Main Assets/icon.png'),
  });
  welcomeNotification.show();

  // Second notification: Check Updates
  if (!fs.existsSync(CHECK_UPDATE_STOP_FILE)) {
    const notificationCheckUpdate = new Notification({
      title: 'Revisar Actualizaciones',
      body: 'Porfavor Nota, Si Salio Una Nueva Version de andres Games Verefica En Revisar Actualizaciones en El Menu.',
      icon: path.join(__dirname, 'Main Assets/Update.png'),
    });

    // Show the notification
    notificationCheckUpdate.show();

    // Close the notification after 10 seconds (10000 milliseconds)
    setTimeout(() => {
      console.log('Closing Check Updates notification after 10 seconds');
      notificationCheckUpdate.close();
    }, 10000);

    // Create the file to indicate that the notification was shown
    fs.writeFileSync(CHECK_UPDATE_STOP_FILE, 'Notification for check updates shown');
  }
}

function createMenu() {
  const menuTemplate = [
    {
      label: 'Andres Games',
      submenu: [
        // Abrir nueva ventana
        {
          label: 'Nueva Ventana',
          click: () => {
            const newWindow = new BrowserWindow({
              width: 854,
              height: 480,
              icon: path.join(__dirname, 'Main Assets/icon.png'),
              webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false
              }
            });
            newWindow.loadURL('https://sites.google.com/view/andrew-games');
          }
        },
        
        { type: 'separator' }, // Separador
        
        // Navegación
        {
          label: 'Volver Al Menu Principal',
          accelerator: 'Ctrl+M',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL('https://sites.google.com/view/andrew-games');
            }
          }
        },
        {
          label: 'Ahorro de Memoria (Bajos Recursos)',
          icon: 'resources/extra-files/icons/560187716.png',
          accelerator: 'Ctrl+S',
          click: () => {
            if (mainWindow) {
              mainWindow.loadFile('saving memory.html');
            }
          }
        },
        {
          label: 'Comunidad de Andres Games',
          accelerator: 'Ctrl+N',
            click: () => {
            if (mainWindow) {
              mainWindow.loadURL('https://andresdiazcraft.wixsite.com/andres-games-cy');
            }
          }
        },      
      
        {
          label: 'AG Plus (Wiki y Mas)',
          accelerator: 'Ctrl+Shift+P',
          click: () => {
             if (mainWindow) {
               mainWindow.loadURL('https://andrewgamesplus.blogspot.com/');
             }
           }
         },       
        
        { type: 'separator' }, // Separador

        {
          label: 'Cuentas de Andres Games',
          icon: 'resources/extra-files/icons/profile-pic_32pixels.png', // Asegúrate de que la ruta sea correcta
          submenu: [
            {
              label: 'Abrir (Pero Saltar el LocalHost)',
              click: () => {
                                    // Abrir nueva ventana de navegador con "account.html"
                                    const newWindow = new BrowserWindow({
                                      width: 854,
                                      height: 480,
                                      icon: path.join(__dirname, 'Main Assets/icon.png'),
                                      webPreferences: {
                                        preload: path.join(__dirname, 'preload.js'),
                                        contextIsolation: true,
                                        enableRemoteModule: false,
                                        nodeIntegration: false
                                      }
                                    });
                                    newWindow.loadFile('account.html');
                                    newWindow.setMenuBarVisibility(false);
              }
            },
            {
              label: 'Abrir Normalmente (Recomendado)',
              click: () => {
                                    // Opción "No, I Already Have It": Ejecutar openserver.bat
                                    const serverScriptPath = path.join(__dirname, 'openserver.bat');
                                    exec(`start "" "${serverScriptPath}"`, (err) => {
                                      if (err) {
                                        console.error('Error al ejecutar openserver.bat:', err);
                                      }
                                    });

                                    // Abrir nueva ventana de navegador con "account.html"
                                    const newWindow = new BrowserWindow({
                                      width: 854,
                                      height: 480,
                                      icon: path.join(__dirname, 'Main Assets/icon.png'),
                                      webPreferences: {
                                        preload: path.join(__dirname, 'preload.js'),
                                        contextIsolation: true,
                                        enableRemoteModule: false,
                                        nodeIntegration: false
                                      }
                                    });
                                    newWindow.loadFile('account.html');
                                    newWindow.setMenuBarVisibility(false);
              }
            }
          ]
        },                    
        
        { type: 'separator' }, // Separador      

        {
            label: 'Biblioteca',
          submenu: [
            {
              label: 'Juegos de Internet',
              icon: 'resources/extra-files/icons/play_32pixels.png', // Asegúrate de que la ruta sea correcta
              click: () => {
                const newWindow = new BrowserWindow({
                  width: 854,
                  height: 480,
                  icon: path.join(__dirname, 'Main Assets/play.png'),
                  webPreferences: {
                    preload: path.join(__dirname, 'preload.js'),
                    contextIsolation: true,
                    enableRemoteModule: false,
                    nodeIntegration: false
                  }
                });
    
                // Cargar la página HTML para Internet Games
                newWindow.loadFile('playinternetgames.html').then(() => {
                  // Crear el menú específico para la ventana de Internet Games
                  createInternetGamesMenu(newWindow);
                }).catch(err => {
                  console.error('Failed to load HTML file:', err);
                  dialog.showErrorBox('Load Error', 'Failed to load the specified HTML file.');
                });
              }
            }
          ]
        },

        { type: 'separator' }, // Separador
        
        // Configuración
        {
          label: 'Configuración',
          submenu: [
            {
              label: 'Ocultar/Mostrar menú principal',
              accelerator: 'CmdOrCtrl+Tab',
              click: () => {
                if (mainWindow) {
                  const isMenuBarVisible = mainWindow.isMenuBarVisible();
                  mainWindow.setMenuBarVisibility(!isMenuBarVisible);
                }
              }
            },
            {
              label: 'Tema',
              submenu: [
                {
                  label: 'Permitir Que Andres Games Guarde El Tema',
                  type: 'checkbox',
                  checked: config.allowThemeSave, // Reflejar el estado actual de la configuración
                  click: (menuItem) => {
                    config.allowThemeSave = menuItem.checked; // Actualizar configuración
                    saveConfig(config); // Guardar cambios
                    console.log(
                      `Guardar tema ${
                        config.allowThemeSave ? 'habilitado' : 'deshabilitado'
                      }`
                    );
                  },
                },
                { type: 'separator' }, // Separador visual
                {
                  label: 'Dependiendo del Sistema',
                  icon: 'resources/extra-files/icons/3659036.png',
                  type: 'radio',
                  checked: config.theme === 'system', // Marcar como seleccionado si es el tema actual
                  click: () => {
                    nativeTheme.themeSource = 'system';
                    console.log('Tema establecido a seguir el sistema');
                    if (config.allowThemeSave) {
                      config.theme = 'system';
                      saveConfig(config);
                    }
                    updateThemeMenu(); // Actualizar menú dinámicamente
                  },
                },
                {
                  label: 'Claro',
                  icon: 'resources/extra-files/icons/3659036.png',
                  type: 'radio',
                  checked: config.theme === 'light', // Marcar como seleccionado si es el tema actual
                  click: () => {
                    nativeTheme.themeSource = 'light';
                    console.log('Tema establecido a Claro');
                    if (config.allowThemeSave) {
                      config.theme = 'light';
                      saveConfig(config);
                    }
                    updateThemeMenu(); // Actualizar menú dinámicamente
                  },
                },
                {
                  label: 'Oscuro',
                  icon: 'resources/extra-files/icons/3659036.png',
                  type: 'radio',
                  checked: config.theme === 'dark', // Marcar como seleccionado si es el tema actual
                  click: () => {
                    nativeTheme.themeSource = 'dark';
                    console.log('Tema establecido a Oscuro');
                    if (config.allowThemeSave) {
                      config.theme = 'dark';
                      saveConfig(config);
                    }
                    updateThemeMenu(); // Actualizar menú dinámicamente
                  },
                },
              ],
            },
          ]
        },
        {
          label: 'Configuracion de Datos',
          submenu: [
            {
              label: 'Eliminar Los Datos Basicos',
              click: () => {
                const appDataPath = process.env.APPDATA || path.join(os.homedir(), '.config');
                const directoryPath = path.join(appDataPath, 'andres-games');
                const filesToDelete = ['notification_check_update_stop.agdata', 'password_flag.agdata', "profileData.json", "config.json"];
        
                // Mostrar cuadro de diálogo de confirmación
                const options = {
                  type: 'question',
                  buttons: ['Yes', 'No'],
                  defaultId: 1,
                  title: 'Confirmacion',
                    message: '¿Quieres eliminar los datos básicos?',
                  icon: path.join(__dirname, 'Main Assets/question.png')
                };
        
                dialog.showMessageBox(null, options).then((response) => {
                  if (response.response === 0) { // El usuario seleccionó "Yes"
                    filesToDelete.forEach(file => {
                      const filePath = path.join(directoryPath, file);
                      if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`Deleted: ${filePath}`);
                      } else {
                        console.log(`File not found: ${filePath}`);
                      }
                    });
        
                    // Mostrar notificación de reinicio necesario
                    const notification = new Notification({
                      title: 'Es Requerido Reiniciar',
                      body: 'Es necesario reiniciar para aplicar los cambios.',
                      icon: path.join(__dirname, 'Main Assets/restart.png'),
                    });
                    notification.show();
        
                    // Mostrar cuadro de diálogo informando que es necesario reiniciar
                    dialog.showMessageBox({
                      type: 'info',
                      buttons: ['OK'],
                        title: 'Es Requerido Reiniciar',
                        message: 'Es necesario reiniciar para aplicar los cambios.',
                      icon: path.join(__dirname, 'Main Assets/info.png')
                    });
                  } else {
                    console.log('User canceled basic data deletion');
                  }
                });
              }
            },
            {
              label: 'Eliminar Cache',
              click: () => {
                const appDataPath = process.env.APPDATA || path.join(os.homedir(), '.config');
                const directoryPath = path.join(appDataPath, 'andres-games');
                const cacheFolders = ['Cache', 'Code Cache'];
            
                // Mostrar cuadro de diálogo de confirmación
                const options = {
                  type: 'question',
                  buttons: ['Yes', 'No'],
                  defaultId: 1,
                    title: 'Confirmacion',
                    message: '¿Quieres eliminar la caché? Algunos sitios pueden tardar más en cargarse en tu próxima visita',
                  icon: path.join(__dirname, 'Main Assets/question.png')
                };
            
                dialog.showMessageBox(null, options).then((response) => {
                  if (response.response === 0) { // El usuario seleccionó "Yes"
                    cacheFolders.forEach(folder => {
                      const folderPath = path.join(directoryPath, folder);
                      try {
                        if (fs.existsSync(folderPath)) {
                          // Utilizar fs.rm con manejo de errores para archivos en uso
                          fs.rm(folderPath, { recursive: true, force: true }, (err) => {
                            if (err) {
                              console.error(`Error deleting folder ${folderPath}:`, err);
                              dialog.showMessageBox({
                                type: 'error',
                                buttons: ['OK'],
                                title: 'Error',
                                message: `Error deleting cache: ${err.message}`,
                              });
                            } else {
                              console.log(`Deleted folder: ${folderPath}`);
                            }
                          });
                        } else {
                          console.log(`Folder not found: ${folderPath}`);
                        }
                      } catch (err) {
                        console.error(`Unexpected error:`, err);
                      }
                    });
            
                    // Mostrar notificación de reinicio necesario
                    const notification = new Notification({
                        title: 'Es Requerido Reiniciar',
                        body: 'Es necesario reiniciar para aplicar los cambios.',
                      icon: path.join(__dirname, 'Main Assets/restart.png'),
                    });
                    notification.show();
            
                    // Mostrar cuadro de diálogo informando que es necesario reiniciar
                    dialog.showMessageBox({
                      type: 'info',
                      buttons: ['OK'],
                        title: 'Es Requerido Reiniciar',
                        message: 'Es necesario reiniciar para aplicar los cambios.',
                      icon: path.join(__dirname, 'Main Assets/info.png')
                    });
                  } else {
                    console.log('User canceled cache deletion');
                  }
                });
              }
            },
            {
              label: 'Eliminar Todos Los Datos (ADVANZADO)',
              click: () => {
                const batPath = path.join(__dirname, 'open_bat1.bat');
                shell.openPath(batPath) // Abre el archivo .bat
                  .then(() => {
                    app.isQuitting = true; // Marcar la aplicación como saliendo
                    app.quit(); // Cierra la aplicación después de abrir el archivo
                  });
              },
            },  
          ]
        },

        { type: 'separator' }, // Separador
        
        
        // Recargar aplicación
        {
            label: 'Reniciar aplicación (Reniciar Andres Games)',
          click: () => {
            const notificationRestart = new Notification({
              title: 'Andres Games',
                body: 'La Aplicación Se Esta Reiniciando...',
              icon: path.join(__dirname, 'Main Assets/icon.png')
            });
            notificationRestart.show();

            app.isQuitting = true; // Marcar la aplicación como saliendo
            app.relaunch();
            app.quit();
          }
        },
        
        { type: 'separator' }, // Separador
        
        // Editar página
        {
            label: 'Editar página (requiere contraseña)',
          click: () => {
            if (fs.existsSync(FLAG_FILE)) {
              openNewPostPage(); // Abrir la página de 'New Post'
            } else {
              // Si el archivo no existe, abrir la ventana de contraseña
              createPasswordWindow();
    
              const notificationRestart = new Notification({
                title: 'Andres Games, Contraseña',
                  body: 'Por favor, introduzca una contraseña para continuar',
                icon: path.join(__dirname, 'Main Assets/password.png')
              });
              notificationRestart.show(); // Mostrar la notificación
            }
          }
        },
        
        { type: 'separator' }, // Separador
        
        // Salir
        {
          label: 'Salir',
          click: () => {
            const notificationClosing = new Notification({
              title: 'Adios!',
              body: 'Andres Games Te Esperara Que Vuelvas!',
              icon: path.join(__dirname, 'Main Assets/icon.png')
            });
            notificationClosing.show();
    
            // Eliminar el archivo de flag al salir
            if (fs.existsSync(FLAG_FILE)) {
              fs.unlinkSync(FLAG_FILE);
            }
    
             app.isQuitting = true; // Marcar la aplicación como saliendo
             app.quit(); // Salir completamente
          }
        }
      ]
    },    
      {
          label: 'Editar',
          submenu: [
              { role: 'undo', label: 'Deshacer' },
              { role: 'redo', label: 'Rehacer' },
              { type: 'separator' },
              { role: 'cut', label: 'Cortar' },
              { role: 'copy', label: 'Copiar' },
              { role: 'paste', label: 'Pegar' },
              { role: 'selectAll', label: 'Seleccionar Todo' }
          ]
      },
      {
          label: 'Ver',
          submenu: [
              { role: 'reload', label: 'Recargar' },
              { role: 'forcereload', label: 'Forzar Recarga' },
              { type: 'separator' },
              { role: 'resetzoom', label: 'Restablecer Zoom' },
              { role: 'zoomin', label: 'Acercar' },
              { role: 'zoomout', label: 'Alejar' },
              { type: 'separator' },
              {
                  label: 'Atrás',
                  click: () => {
                      if (mainWindow && mainWindow.webContents.canGoBack()) {
                          mainWindow.webContents.goBack();
                      }
                  }
              },
              {
                  label: 'Adelante',
                  click: () => {
                      if (mainWindow && mainWindow.webContents.canGoForward()) {
                          mainWindow.webContents.goForward();
                      }
                  }
              },
              { type: 'separator' },
              { role: 'togglefullscreen', label: 'Pantalla Completa' }
          ]
      },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'La Historia de Andres Games',
          icon: 'resources/extra-files/icons/history32.png', // Asegúrate de que la ruta sea correcta
          click: () => {
            if (mainWindow) {
                mainWindow.loadURL('https://andresdev859674.github.io/Andrew-Games-Resources/links/history_of_andrewgames.html');
            }
          }
        },
        {
          label: 'Reportar Abuso',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL('https://andresdev859674.github.io/Andrew-Games-Resources/links/report_abuse.html')
                .catch(err => {
                  console.error('Failed to load URL:', err);
                  dialog.showErrorBox('Load Error', 'Failed to load the specified URL.');
                });
            }
          }
        }
      ]
    },
    {
      label: 'Otros',
      submenu: [
        {
          label: 'Pagina de Andres Studios',
          click: () => {
            const studiesWindow = new BrowserWindow({
              width: 854,
              height: 480,
              title: 'Pagina de Andres Studios',
              icon: path.join(__dirname, 'Main Assets/icon2.png')
            });
            studiesWindow.loadURL('https://sites.google.com/view/andrew-studies/inicio');
            studiesWindow.setMenuBarVisibility(false);
          }
        }
      ]
    },
    {
      label: 'Desarrollo',
      submenu: [
        {
          label: 'Activar DevTools',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
      ]
    },
    {
        label: 'Versión',
      submenu: [
        {
          label: 'Revisor de Actualizaciones',
          icon: 'resources/extra-files/icons/Update_32pixels.png', // Asegúrate de que la ruta sea correcta
          submenu: [
            {
              label: 'Forma Simple (Recomendado)',
              click: () => {
                dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: 'Revisor de Actualizaciones',
                    message: '¿Cómo comprobar si hay una actualización? Vaya a la aplicación AG Vs AG y compruebe las actualizaciones. ¡Es muy fácil!',
                  buttons: ['OK']
                });
              }
            },
            {
              label: 'Forma Directa',
              click: () => {
                  mainWindow.loadURL("https://andresdev859674.github.io/Andrew-Games-Resources/links/checkupdates.html");
              }
            }
          ]
        },
        {
          label: 'Acerca de Andres Games',
          click: () => {
            const versionWindow = new BrowserWindow({
              width: 854,
              height: 480,
                title: 'Acerca de Andres Games',
              icon: path.join(__dirname, 'Main Assets/anotherwindowopen.png')
            });
            versionWindow.loadFile(path.join(__dirname, 'about_andrewgames.html'));
            versionWindow.setMenuBarVisibility(false);
          }
        }
      ]
    },
    {
      label: '| ',
      click: () => {
        console.log('why do you press this button :/');
      }
    },
    {
      label: '<',
      click: () => {
        if (mainWindow && mainWindow.webContents.navigationHistory.canGoBack) {
          mainWindow.webContents.goBack();
        }
      }
    },
    {
      label: '>',
      click: () => {
        if (mainWindow && mainWindow.webContents.navigationHistory.canGoForward) {
          mainWindow.webContents.goForward();
        }
      }
    },
    {
      label: '↻',
      click: (menuItem, browserWindow) => {
        if (browserWindow) {
          browserWindow.reload(); // Método para recargar la ventana
        }
      }
    }    
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

function createPasswordWindow() {
  passwordWindow = new BrowserWindow({
    width: 854,
    height: 480,
      title: 'Introducir contraseña',
    icon: path.join(__dirname, 'Main Assets/password.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

function createPasswordWindow() {
  passwordWindow = new BrowserWindow({
    width: 854,
    height: 480,
      title: 'Introducir contraseña',
    icon: path.join(__dirname, 'Main Assets/password.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  passwordWindow.loadFile(path.join(__dirname, 'password.html'));
  passwordWindow.setMenuBarVisibility(false);
}

function openNewPostPage() {
  // Mostrar notificación de error
  const notification = new Notification({
      title: 'Acceso a la página de edición',
      body: 'Tienes acceso para editar la página.',
      icon: path.join(__dirname, 'Main Assets/8001514.png'),
  });
      notification.show(); // Mostrar la notificación
  const editWindow = new BrowserWindow({
    width: 854,
    height: 480,
    title: 'Editar Pagina',
    icon: path.join(__dirname, 'Main Assets/edit.png'),
  });
  editWindow.loadFile('password_menu.html');
  editWindow.setMenuBarVisibility(false);
}


ipcMain.on('password-submitted', (event, password) => {
  const correctPassword1 = '137958246';
  const correctPassword2 = '987456123';
  const correctPassword3 = '12457893258741';
  const correctPassword4 = '19731973';

  if (password === correctPassword1 || password === correctPassword2 || password === correctPassword3 || password === correctPassword4) {
    // Crear el archivo de flag
    fs.writeFileSync(FLAG_FILE, 'Password flag created');
    openNewPostPage(); // Abrir la página de 'New Post'
  } else {
    // Mostrar notificación de error
    const notification = new Notification({
        title: 'Contraseña incorrecta',
      body: 'La contraseña ingresada es incorrecta',
      icon: path.join(__dirname, 'Main Assets/error.png'),
    });
    notification.show(); // Mostrar la notificación
  }
  
  passwordWindow.close(); // Cerrar la ventana de contraseña
});

// Función para crear el menú específico de Internet Games
function createInternetGamesMenu(newWindow) {
  const internetGamesMenuTemplate = [
    {
      label: 'AG Jugar',
      submenu: [
        // Configuración
        {
          label: 'Volver Al Menu Principal',
          accelerator: 'Ctrl+M',
          click: () => {
            if (newWindow) {
              newWindow.loadFile('playinternetgames.HTML');
            }
          }
        },
        {
          label: 'Configuración',
          submenu: [
            {
                  label: 'Ocultar/Mostrar menú principal',
              accelerator: 'CmdOrCtrl+Tab',
              click: () => {
                // Asegúrate de que newWindow esté definido y accesible
                if (newWindow) {
                  const isMenuBarVisible = newWindow.isMenuBarVisible(); // Cambiado a newWindow
                  newWindow.setMenuBarVisibility(!isMenuBarVisible);
                } else {
                  console.warn('newWindow is not defined.');
                }
              }
            }
          ]
        },
      ]
    },    
    {
      label: 'Editar',
      submenu: [
          { role: 'undo', label: 'Deshacer' },
          { role: 'redo', label: 'Rehacer' },
          { type: 'separator' },
          { role: 'cut', label: 'Cortar' },
          { role: 'copy', label: 'Copiar' },
          { role: 'paste', label: 'Pegar' },
          { role: 'selectAll', label: 'Seleccionar Todo' }
      ]
  },
  {
      label: 'Ver',
      submenu: [
          { role: 'reload', label: 'Recargar' },
          { role: 'forcereload', label: 'Forzar Recarga' },
          { type: 'separator' },
          { role: 'resetzoom', label: 'Restablecer Zoom' },
          { role: 'zoomin', label: 'Acercar' },
          { role: 'zoomout', label: 'Alejar' },
          { type: 'separator' },
          {
              label: 'Atrás',
              click: () => {
                  if (mainWindow && mainWindow.webContents.canGoBack()) {
                      mainWindow.webContents.goBack();
                  }
              }
          },
          {
              label: 'Adelante',
              click: () => {
                  if (mainWindow && mainWindow.webContents.canGoForward()) {
                      mainWindow.webContents.goForward();
                  }
              }
          },
          { type: 'separator' },
          { role: 'togglefullscreen', label: 'Pantalla Completa' }
      ]
  },
    {
      label: 'Salir',
      click: () => {
        newWindow.close(); // Cerrar la ventana
      }
    }
  ];

  const internetGamesMenu = Menu.buildFromTemplate(internetGamesMenuTemplate);
  newWindow.setMenu(internetGamesMenu); // Establecer el menú en la nueva ventana
}

app.on('ready', () => {
  const iconPath = path.join(__dirname, 'Main Assets/icon.png');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
            {
          label: 'Revisar Actualizaciones',
          icon: 'resources/extra-files/icons/Update_32pixels.png', // Asegúrate de que la ruta sea correcta
          submenu: [
            {
              label: 'Forma Simple (Recomendado)',
              click: () => {
                dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: 'Revisar Actualizaciones',
                    message: '¿Cómo comprobar si hay una actualización? Vaya a la aplicación AG Vs AG y compruebe las actualizaciones. ¡Es muy fácil!',
                  buttons: ['OK']
                });
              }
            },
            {
              label: 'Forma Directa',
              click: () => {
                mainWindow.show(); // Mostrar la ventana principal
                  mainWindow.loadURL("https://andresdev859674.github.io/Andrew-Games-Resources/links/checkupdates.html");
              }
            }
          ]
        },

    {
      label: 'Acerca de Andres Games',
      click: () => {
        const versionWindow = new BrowserWindow({
          width: 854,
          height: 480,
            title: 'Acerca de Andres Games',
          icon: path.join(__dirname, 'Main Assets/anotherwindowopen.png'),
        });
        versionWindow.loadFile(path.join(__dirname, 'about_andrewgames.html'));
        versionWindow.setMenuBarVisibility(false);
      },
    },

{
  label: 'Ahorro de Memoria (Bajos Recursos)',
  icon: 'resources/extra-files/icons/560187716.png',
  click: () => {
    const notificationMemory = new Notification({
        title: 'Ahorro de memoria',
        body: 'Estás cargando memoria (Modo de alto rendimiento)',
      icon: path.join(__dirname, 'Main Assets/5601877.png') // Asegúrate de que la ruta sea correcta
    });
    
    notificationMemory.show(); // Corregido el error tipográfico aquí

    if (mainWindow) {
      mainWindow.loadFile('saving memory.html');
    }
  }
},

    {
      label: 'Mostrar Aplicacion',
      click: () => {
        if (mainWindow) {
          mainWindow.show(); // Mostrar la ventana principal
        }
      },
    },

    { type: 'separator' }, // Separador

    {
      label: 'Mas Opciones (Menu Andres Games en Segundo Plano)',
      submenu: [
        // Recargar aplicación
        {
          label: 'Reniciar aplicación (Reniciar Andres Games)',
          click: () => {
          const notificationRestart = new Notification({
            title: 'Andres Games',
              body: 'La Aplicación Se Esta Reiniciando...',
            icon: path.join(__dirname, 'Main Assets/icon.png')
          });
          notificationRestart.show();

          app.isQuitting = true; // Marcar la aplicación como saliendo
          app.relaunch();
          app.quit();
        }
      },
      {
        label: 'Biblioteca',
      submenu: [
        {
          label: 'Juegos de Internet',
          icon: 'resources/extra-files/icons/play_32pixels.png', // Asegúrate de que la ruta sea correcta
          click: () => {
            const newWindow = new BrowserWindow({
              width: 854,
              height: 480,
              icon: path.join(__dirname, 'Main Assets/play.png'),
              webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false
              }
            });

            // Cargar la página HTML para Internet Games
            newWindow.loadFile('playinternetgames.html').then(() => {
              // Crear el menú específico para la ventana de Internet Games
              createInternetGamesMenu(newWindow);
            }).catch(err => {
              console.error('Failed to load HTML file:', err);
              dialog.showErrorBox('Load Error', 'Failed to load the specified HTML file.');
            });
          }
        }
      ]
    }
      ]
    },

    {
      label: 'Salir de Andres Games',
      click: () => {
        app.isQuitting = true; // Marcar la aplicación como saliendo
        app.quit(); // Salir completamente
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Andres Games');
});

// Función para actualizar dinámicamente el estado del menú
function updateThemeMenu() {
  // Asegurarse de que `menu` esté correctamente inicializado
  if (!menu) {
    console.error("El menú no está inicializado.");
    return;
  }

  const menuItems = menu.items[0].submenu.items; // Obtener los items del submenú "Tema"

  const themes = ['system', 'light', 'dark'];

  // Recorremos todos los elementos de tema y actualizamos el estado
  themes.forEach((theme) => {
    const menuItem = menuItems.find((item) => item.label.toLowerCase().includes(theme));
    if (menuItem) {
      menuItem.checked = config.theme === theme; // Marcar solo el tema actual
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createMenu();
  app.on('activate', () => {
    if (!mainWindow) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});