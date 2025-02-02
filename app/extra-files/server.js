const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Ruta del directorio %APPDATA%/andrew-games
const appDataPath = path.join(
    process.env.APPDATA || path.join(process.env.HOME, '.config'), 
    'andrew-games'
);

// Crear la carpeta si no existe
if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
}

// Ruta del archivo profileData.json
const profileFilePath = path.join(appDataPath, 'profileData.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ruta para cargar el perfil
app.get('/loadProfile', (req, res) => {
    fs.readFile(profileFilePath, 'utf8', (err, data) => {
        if (err) {
            // Si el archivo no existe, devolvemos un perfil por defecto
            const defaultProfile = {
                name: 'Andrew Games',
                description: 'Passionate about video games and technology.',
                iconUrl: 'profile-pic.png'
            };
            return res.json(defaultProfile);
        }
        res.json(JSON.parse(data));
    });
});

// Ruta para guardar el perfil
app.post('/saveProfile', (req, res) => {
    const profileData = req.body;
    console.log('Profile data received:', profileData);

    fs.writeFile(profileFilePath, JSON.stringify(profileData, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Error saving profile data');
        }
        res.send('Profile saved successfully!');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
