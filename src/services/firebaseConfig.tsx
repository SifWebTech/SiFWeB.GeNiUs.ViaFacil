// Inicializa conexão com o Firebase
import { initializeApp } from 'firebase/app';

// Inicializa conexão com o banco de dados
import { getDatabase } from 'firebase/database';

// Inicializa autenticação do Firebase
import { initializeAuth } from 'firebase/auth';

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

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = initializeAuth(app);

// Realtime Database
export const database = getDatabase(app);