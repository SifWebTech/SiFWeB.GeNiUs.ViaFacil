// Este arquivo cria e exporta uma única conexão com os serviços do Firebase.
// Importa a função que inicializa o aplicativo Firebase.
import { initializeApp } from 'firebase/app';

// Importa o Realtime Database usado para guardar os dados do sistema.
import { getDatabase } from 'firebase/database';

// Importa a autenticação e os tipos de persistência de sessão.
import {
    browserLocalPersistence,
    // @ts-ignore existe no build React Native do Firebase, mas não nos tipos padrão
    getReactNativePersistence,
    initializeAuth,
} from 'firebase/auth';

// No celular, o AsyncStorage mantém a sessão mesmo depois de fechar o app.
import { Platform } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Identifica o projeto ViaFácil dentro da plataforma Firebase.
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

// Cria o aplicativo Firebase com as configurações acima.
const app = initializeApp(firebaseConfig);

// Na web a sessão fica no navegador; no celular fica no AsyncStorage.
export const auth = initializeAuth(app, {
    persistence: Platform.OS === 'web'
        ? browserLocalPersistence
        : getReactNativePersistence(ReactNativeAsyncStorage),
});

// Exporta o banco para que os serviços possam ler e gravar dados.
export const database = getDatabase(app);
