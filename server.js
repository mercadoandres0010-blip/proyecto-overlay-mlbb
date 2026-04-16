const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Servir archivos estáticos del overlay
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Endpoint para el detector de IA (Python) o Panel
app.post('/api/pick', (req, res) => {
    const { team, index, hero } = req.body;
    console.log(`[DETECTADO] Pick de ${hero} para el jugador ${index} del equipo ${team}`);
    
    // Enviar señal en tiempo real al navegador (overlay)
    io.emit('hero-picked', { team, index, hero });
    
    res.status(200).send('OK');
});

io.on('connection', (socket) => {
    console.log('Overlay conectado y listo para recibir picks.');
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor de Overlay Profesional corriendo en http://localhost:${PORT}`);
    console.log(`📡 Esperando datos de 'Ojo de Águila' o del panel...`);
});
