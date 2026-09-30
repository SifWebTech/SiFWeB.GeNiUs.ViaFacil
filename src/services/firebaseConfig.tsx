// Inicializa conexão com o Firebase
import { initializeApp } from 'firebase/app';

// Inicializa conexão com o banco de dados
import { getDatabase } from 'firebase/database';

// Inicializa autenticação do Firebase
import {
    browserLocalPersistence,
    // @ts-ignore existe no build React Native do Firebase, mas não nos tipos padrão
    getReactNativePersistence,
    initializeAuth,
} from 'firebase/auth';

// Guarda a sessão no dispositivo para o usuário não ser deslogado a cada reload
import { Platform } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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
export const auth = initializeAuth(app, {
    persistence: Platform.OS === 'web'
        ? browserLocalPersistence
        : getReactNativePersistence(ReactNativeAsyncStorage),
});

// Realtime Database
export const database = getDatabase(app);