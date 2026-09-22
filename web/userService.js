/**
 * UserService - Versão Web
 * Gerencia cadastro de usuários com Firebase
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyACen7PWC0hYfVneL2w_ckqzn3o9ZgK5jQ",
    authDomain: "viafacil-fe487.firebaseapp.com",
    databaseURL: "https://viafacil-fe487-default-rtdb.firebaseio.com",
    projectId: "viafacil-fe487",
    storageBucket: "viafacil-fe487.firebasestorage.app",
    messagingSenderId: "260245468237",
    appId: "1:260245468237:web:0ce5aed0cba8da41129804",
    measurementId: "G-QF75CJV6RS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

/**
 * Serviço de Usuário - Cadastro
 */
class UserService {
    /**
     * Cadastra um novo usuário
     * @param {string} nome - Nome completo
     * @param {string} celular - Celular sem máscara
     * @param {string} email - Email do usuário
     * @param {string} senha - Senha
     * @returns {Promise<Object>} Usuário criado
     */
    async cadastrarUsuario(nome, celular, email, senha) {
        // 1. Criar usuário no Firebase Authentication
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                senha
            );

        // 2. Gerar ID do usuário
        const uid = userCredential.user.uid;

        // 3. Criar objeto do usuário
        const usuario = {
            id: uid,
            nome: nome,
            celular: celular,
            email: email,
            createdAt: new Date().toISOString(),
        };

        // 4. Salvar no Realtime Database
        await set(
            ref(database, `usuarios/${uid}`),
            usuario
        );

        // 5. Retornar usuário criado
        return usuario;
    }
}

// Exportar singleton
export const userService = new UserService();
