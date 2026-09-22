# 🔗 Integração UserService - Web

**Data:** 2026-09-08  
**Objetivo:** Unificar mobile e web usando o mesmo padrão de serviço

---

## 📊 Resumo das Mudanças

A página web (porta 8082) agora chama a **mesma função `userService.cadastrarUsuario()`** que o app mobile usa!

---

## 📁 Arquivos Criados/Modificados

### ✅ Novo Arquivo: `web/userService.js`

**Localização:** `ViaFacil/web/userService.js`

**Tamanho:** ~65 linhas

**O que faz:**
- Importa Firebase SDK
- Define configuração Firebase
- Implementa classe `UserService`
- Método `cadastrarUsuario(nome, celular, email, senha)`
- Exporta singleton `userService`

#### Código Completo

```javascript
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

class UserService {
    async cadastrarUsuario(nome, celular, email, senha) {
        // 1. Criar usuário no Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
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
```

---

### ✅ Modificado: `web/register.html`

**Mudanças Realizadas:**

#### Mudança 1: Import do Serviço
**Antes:**
```javascript
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword } from '...';
import { getDatabase, ref, set } from '...';

const firebaseConfig = { ... };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
```

**Depois:**
```javascript
import { userService } from './userService.js';
```

✅ **Benefício:** Código mais limpo, sem duplicação de Firebase config

---

#### Mudança 2: Função cadastrarUsuario
**Antes:**
```javascript
window.cadastrarUsuario = async function(nome, celularDigits, email, senha) {
    try {
        setLoading(true);
        
        // Criar usuário no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const uid = userCredential.user.uid;
        
        // Criar objeto usuário
        const usuario = { id: uid, nome, celular: celularDigits, email, ... };
        
        // Salvar no Realtime Database
        await set(ref(database, `usuarios/${uid}`), usuario);
        
        // ... resto do código
    } catch (error) { ... }
}
```

**Depois:**
```javascript
window.cadastrarUsuario = async function(nome, celularDigits, email, senha) {
    try {
        setLoading(true);
        
        // Chamar serviço de usuário
        await userService.cadastrarUsuario(
            nome,
            celularDigits,
            email,
            senha
        );
        
        // ... resto do código (igual)
    } catch (error) { ... }
}
```

✅ **Benefício:** Mesma lógica do mobile, mais limpo e reutilizável

---

## 🔄 Fluxo de Cadastro - Web (Porta 8082)

```
┌─────────────────────────────────────────────┐
│ Usuário preenche formulário no register.html│
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ Clica "CADASTRAR" → handleSubmit()          │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ Validações locais (JavaScript)              │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ cadastrarUsuario() → userService.js         │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ userService.cadastrarUsuario()              │
│ └─ createUserWithEmailAndPassword()         │
│ └─ Gera UID                                 │
│ └─ set(ref(database, usuarios/{uid}), ...) │
└──────────────────┬──────────────────────────┘
                   ↓
        ✅ Sucesso ou ❌ Erro
                   ↓
        Alert + Navegação/Tratamento
```

---

## 📊 Comparação: Mobile vs Web

### Mobile (React Native)
```typescript
// Localização: src/screens/register_screen.tsx
import { userService } from '../services/userService';

async function cadastrarUsuario(nome, celular, email, senha) {
    try {
        setCarregando(true);
        await userService.cadastrarUsuario(nome, celular, email, senha);
        // ... resto
    } catch (error) { ... }
    finally { setCarregando(false); }
}
```

### Web (HTML/JS)
```javascript
// Localização: web/register.html + web/userService.js
import { userService } from './userService.js';

window.cadastrarUsuario = async function(nome, celularDigits, email, senha) {
    try {
        setLoading(true);
        await userService.cadastrarUsuario(nome, celularDigits, email, senha);
        // ... resto
    } catch (error) { ... }
    finally { setLoading(false); }
}
```

**Diferenças:**
| Aspecto | Mobile | Web |
|---------|--------|-----|
| Import | TypeScript | ES6 Module |
| Estado | `carregando` | `setLoading()` |
| Alert | React Native | JavaScript |
| Navegação | `navigation.navigate()` | `window.location.href` |

**Similaridades:**
✅ Ambas usam `userService.cadastrarUsuario()`  
✅ Ambas têm try/catch/finally  
✅ Ambas tratam erros Firebase  
✅ Ambas limpam o formulário  

---

## 🔗 Estrutura Unificada

```
Cadastro (Mobile + Web)
│
├── Validação Local
│   ├── Nome
│   ├── Celular
│   ├── Email
│   └── Senha
│
└── userService.cadastrarUsuario()
    │
    ├── userService.ts (React Native)
    │   ├── Firebase Auth
    │   └── Firebase Database
    │
    └── userService.js (Web)
        ├── Firebase Auth
        └── Firebase Database
        
    ↓
    
    Resultado no Firebase (MESMO BANCO)
    └── usuarios/{uid}
        ├── id
        ├── nome
        ├── celular
        ├── email
        └── createdAt
```

---

## ✅ Benefícios Desta Abordagem

1. **Código Duplicado Minimizado** - Serviço centralizado
2. **Manutenção Facilitada** - Mudanças em um lugar
3. **Padrão Único** - Mobile e Web com mesma lógica
4. **Escalabilidade** - Fácil adicionar novas plataformas
5. **Testabilidade** - Serviço isolado e testável
6. **Firebase Unificado** - Mesmo banco para ambas as versões

---

## 📝 Como Testar

### 1. Iniciar o servidor web
```bash
node web/server.js
```

### 2. Abrir no navegador
```
http://localhost:8082
```

### 3. Preencher formulário
```
Nome: Teste Integração
Celular: (11) 99999-8888
Email: integracao@example.com
Senha: Senha12345
```

### 4. Clicar "CADASTRAR"
```
✓ Usuário criado no Firebase Auth
✓ Dados salvos em Firebase Database
✓ Alert de sucesso
✓ Formulário limpo
```

### 5. Verificar no Firebase
```
Firebase Console > Realtime Database > usuarios > {uid}
```

---

## 🔐 Segurança

A integração mantém toda a segurança:

✅ Senhas gerenciadas pelo Firebase Auth  
✅ Validação server-side  
✅ Dados salvos em banco seguro  
✅ CORS habilitado no servidor  
✅ Tratamento de erros Firebase  

---

## 📚 Arquivos Relacionados

| Arquivo | Descrição |
|---------|-----------|
| `src/services/userService.tsx` | Versão mobile (TypeScript) |
| `web/userService.js` | Versão web (JavaScript) |
| `web/register.html` | Página de cadastro web |
| `src/screens/register_screen.tsx` | Tela de cadastro mobile |

---

## 🎯 Próximos Passos

1. **LoginScreen Mobile** - Usar mesmo padrão de serviço
2. **LoginScreen Web** - Integrar autenticação
3. **Verificação de Email** - Ambas as versões
4. **Reset de Senha** - Ambas as versões
5. **Serviço Único** - Criar `webService.js` centralizado

---

**Status:** ✅ Integração Completa  
**Data:** 2026-09-08  
**Versão:** 1.0
