const express = require('express');
const path = require('path');
const app = express();
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000; // Use Railway’s assigned port

let docServerProcess = null;
let excelServerProcess = null;
let pptServerProcess = null;
let mainServerProcess = null;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Render HTML files as templates (allows variables)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/index.html'));
});

app.post('/start-doc', (req, res) =>{
    if (docServerProcess) {
        return res.json({ message: 'A conversion is already in progress.' });
    }
    const docServer = spawn('node', ['docServer.js'],{
        cwd: __dirname,
        stdio: 'inherit',
    });
    res.json({ message: 'Running docServer' });
});

app.post('/start-excel', (req, res) =>{
    if (excelServerProcess) {
        return res.json({ message: 'A conversion is already in progress.' });
    }
    const excelServer = spawn('node', ['excelServer.js'],{
        cwd: __dirname,
        stdio: 'inherit',
    });
    res.json({ message: 'Running excelServer' });
});

app.post('/start-ppt', (req, res) =>{
    if (pptServerProcess) {
        return res.json({ message: 'A conversion is already in progress.' });
    }
    const pptServer = spawn('node', ['pptServer.js'],{
        cwd: __dirname,
        stdio: 'inherit',
    });
    res.json({ message: 'Running pptServer' });
});

app.post('/start-server', (req, res) =>{
    if (mainServerProcess) {
        return res.json({ message: 'A conversion is already in progress.' });
    }
    const mainServer = spawn('node', ['server.js'],{
        cwd: __dirname,
        stdio: 'inherit',
    });
    res.json({ message: 'Running server' });
})

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
