const path = require('path');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  // Configuración del empaquetador (Packager)
  packagerConfig: {
    asar: false,  // No usar ASAR, para copiar archivos externos directamente
    icon: './Main Assets/icon.ico',  // Icono principal de la aplicación
    extraFiles: [
      {
        from: path.join(__dirname, 'extra-files'),  // Ruta absoluta a 'extra-files'
        to: path.join(__dirname, 'out/andrew-games-win32-x64'),  // Ruta de destino dentro del paquete
      },
      {
        from: path.join(__dirname, 'server.js'),  // Ruta absoluta a 'server.js'
        to: path.join(__dirname, 'out/andrew-games-win32-x64'),
      },
      {
        from: path.join(__dirname, 'bat1_start.bat'),
        to: path.join(__dirname, 'out/andrew-games-win32-x64'),
      },
      {
        from: path.join(__dirname, 'batruns'),
        to: path.join(__dirname, 'out/andrew-games-win32-x64'),
      },
      {
        from: path.join(__dirname, 'extra-files'),  // Ruta a 'extra-files'
        to: path.join(__dirname, 'out/andrew-games-win32-x64/resources/'),  // Copiar dentro de 'resources/'
      },
    ],
  },
  
  rebuildConfig: {},

  // Configuración del instalador
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'andres_games',
        productName: 'Andres Games',
        description: 'Un Lanzador de Juegos que Compite Steam y itch y Xbox, pero es el Mas Rapidos del Todos',
        exe: 'andres-games.exe',
        setupExe: 'AndresGamesSetup.exe',
        setupIcon: './Main Assets/icon.ico',
        noMsi: true,
        createDesktopShortcut: true,
      },
    },
  ],  

  // Plugins para la configuración de los fusibles
  plugins: [
    {
      name: '@electron-forge/plugin-fuses',
      config: {
        version: FuseVersion.V1,
        setFuses: {
          [FuseV1Options.RunAsNode]: false,
          [FuseV1Options.EnableCookieEncryption]: true,
          [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
          [FuseV1Options.EnableNodeCliInspectArguments]: false,
          [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
          [FuseV1Options.OnlyLoadAppFromAsar]: false,
        },
      },
    },
  ],
};
