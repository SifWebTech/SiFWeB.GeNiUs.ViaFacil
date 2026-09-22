#!/usr/bin/env node

/**
 * Servidor Web Simples - SiFWeB.GeNiUs.ViaFacil
 * Porta: 8082 (Cadastro)
 * Execução: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8082;
const HOSTNAME = 'localhost';

const server = http.createServer((req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Tratamento de requisições OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Log da requisição
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

    // Rotas
    if (req.url === '/' || req.url === '/register') {
        // Página de cadastro
        const filePath = path.join(__dirname, 'register.html');

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 - Página não encontrada</h1>');
                return;
            }

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });

    } else {
        // 404
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>404 - Página não encontrada</title>
            </head>
            <body style="background: #161616; color: #fff; font-family: Arial; text-align: center; padding: 50px;">
                <h1>❌ 404 - Página não encontrada</h1>
                <p>A rota <code>${req.url}</code> não existe.</p>
                <p><a href="/" style="color: #FF5A00; text-decoration: none;">← Voltar para Home</a></p>
            </body>
            </html>
        `);
    }
});

server.listen(PORT, HOSTNAME, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║  🌐 SiFWeB.GeNiUs.ViaFacil - Servidor Web            ║
╠══════════════════════════════════════════════════════╣
║  ✅ Servidor rodando em: http://localhost:${PORT}      ║
║  📝 Página: http://localhost:${PORT}/register         ║
║  🛑 Para parar: Ctrl+C                               ║
╚══════════════════════════════════════════════════════╝
    `);
});

// Tratamento de erros
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Erro: Porta ${PORT} já está em uso!`);
        console.error('Solução: Feche outros servidores ou use outra porta.');
        process.exit(1);
    } else {
        console.error('❌ Erro no servidor:', err);
        process.exit(1);
    }
});

// Tratamento de SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('\n\n🛑 Servidor encerrado.');
    process.exit(0);
});