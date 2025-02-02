const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Path to the %APPDATA%/andrew-games or ~/.config/andrew-games directory
const appDataPath = path.join(
    process.env.APPDATA || path.join(process.env.HOME, '.config'), 
    'andrew-games'
);

// Ensure the folder exists
if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
}

// Path to the profileData.json file
const profileFilePath = path.join(appDataPath, 'profileData.json');

// Middleware
app.use(cors()); // Allow requests from any origin
app.use(bodyParser.json()); // Parse JSON in requests
app.use(express.static('public')); // Serve static files (like images)

// Route to load the profile
app.get('/loadProfile', (req, res) => {
    fs.readFile(profileFilePath, 'utf8', (err, data) => {
        if (err) {
            console.log('No existing profile found, sending default profile.');
            const defaultProfile = {
                name: 'Andrew Games',
                description: 'Passionate about video games and technology.',
                iconUrl: 'profile-pic.png'
            };
            return res.json(defaultProfile);
        }
        try {
            res.json(JSON.parse(data));
        } catch (error) {
            console.error('Error parsing the profile:', error);
            res.status(500).send('Error loading the profile.');
        }
    });
});

// Route to save the profile
app.post('/saveProfile', (req, res) => {
    const profileData = req.body;
    console.log('Received profile data:', profileData);

    fs.writeFile(profileFilePath, JSON.stringify(profileData, null, 2), (err) => {
        if (err) {
            console.error('Error saving the profile:', err);
            return res.status(500).send('Error saving the profile.');
        }
        res.send('Profile saved successfully!');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
