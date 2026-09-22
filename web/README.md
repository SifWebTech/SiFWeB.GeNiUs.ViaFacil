# 🌐 SiFWeB.GeNiUs.ViaFacil - Versão Web

Versão web do aplicativo ViaFacil rodando na **porta 8082**.

---

## 📁 Estrutura

```
web/
├── README.md          ← Você está aqui
├── register.html      ← Página de cadastro (HTML puro)
└── server.js          ← Servidor Node.js
```

---

## 🚀 Como Executar

### Opção 1: Com Node.js

```bash
# 1. Abra o terminal na pasta ViaFacil
cd D:\0 - FATEC\...\ViaFacil

# 2. Execute o servidor
node web/server.js

# 3. Abra no navegador
http://localhost:8082
```

**Resultado esperado:**
```
╔══════════════════════════════════════════════════════╗
║  🌐 SiFWeB.GeNiUs.ViaFacil - Servidor Web            ║
╠══════════════════════════════════════════════════════╣
║  ✅ Servidor rodando em: http://localhost:8082       ║
║  📝 Página: http://localhost:8082/register          ║
║  🛑 Para parar: Ctrl+C                              ║
╚══════════════════════════════════════════════════════╝
```

### Opção 2: Com Python

```bash
# Python 3
python -m http.server 8082 --directory web

# Python 2
python -m SimpleHTTPServer 8082
```

### Opção 3: Com Live Server (VSCode)

1. Instale a extensão "Live Server" no VSCode
2. Clique direito em `register.html`
3. Selecione "Open with Live Server"
4. Mude a porta para 8082 (se necessário)

---

## 📝 Funcionalidades

✅ **Cadastro de Usuários**
- Nome
- Celular (com formatação automática)
- Email
- Senha (com toggle mostrar/ocultar)
- Confirmação de senha

✅ **Validações**
- Validação local (cliente)
- Validação Firebase (servidor)
- Mensagens de erro em tempo real

✅ **Integração Firebase**
- Firebase Authentication (criar usuário)
- Firebase Realtime Database (salvar dados)
- Tratamento de erros Firebase

✅ **UX/UI**
- Design idêntico ao app mobile
- Loading state (spinner)
- Alertas de sucesso/erro
- Responsivo (mobile-friendly)

---

## 🎨 Design

- **Cores:**
  - Fundo: #161616 (cinza escuro)
  - Primária: #FF5A00 (laranja)
  - Texto: #FFFFFF (branco)
  - Erro: #FF0000 (vermelho)

- **Tipografia:**
  - Font: System fonts (-apple-system, Roboto, etc)
  - Peso: 700 para labels, 400 para inputs

- **Componentes:**
  - Inputs com borda laranja
  - Botão com hover effect
  - Spinner loading
  - Alertas deslizantes

---

## 🔒 Firebase Integration

### Configuração
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyACen7PWC0hYfVneL2w_ckqzn3o9ZgK5jQ",
    authDomain: "viafacil-fe487.firebaseapp.com",
    databaseURL: "https://viafacil-fe487-default-rtdb.firebaseio.com",
    projectId: "viafacil-fe487",
    // ... mais configs
};
```

### Fluxo de Cadastro
```
1. Usuário preenche formulário
2. Validações locais
3. createUserWithEmailAndPassword() - Firebase Auth
4. Salva dados em Realtime Database (/usuarios/{uid})
5. Alert de sucesso
6. Redireciona para home
```

---

## ✅ Validações

| Campo | Regra | Mensagem |
|-------|-------|----------|
| **Nome** | Obrigatório | "Digite o nome." |
| **Celular** | Obrigatório, 10+ dígitos | "Digite um celular válido." |
| **Email** | Obrigatório, válido | "Digite um e-mail válido." |
| **Senha** | Obrigatório, 8+ chars | "A senha deve ter pelo menos 8 caracteres." |
| **Confirmar** | Obrigatório, igual à senha | "As senhas não conferem." |

---

## ❌ Possíveis Erros

### Erro: Porta 8082 já está em uso
```
❌ Erro: Porta 8082 já está em uso!
Solução: Feche outros servidores ou use outra porta.
```

**Como resolver:**
```bash
# Windows - Encontrar processo usando porta 8082
netstat -ano | findstr :8082

# Matar processo
taskkill /PID <PID> /F

# Ou usar outra porta
node web/server.js --port 8083
```

### Erro: Firebase Connection Refused
```
❌ Falha ao conectar ao Firebase
```

**Soluções:**
- Verifique internet
- Verifique se as chaves Firebase estão corretas
- Verifique se Firebase está habilitado no Console

### Erro: Email já cadastrado
```
Este e-mail já está cadastrado
```

**Solução:** Use outro email ou faça login

---

## 🧪 Testes Manuais

### Teste 1: Cadastro Bem-Sucedido ✅
```
Nome: João Silva
Celular: 11987654321
Email: joao@example.com
Senha: Senha12345
Confirmar: Senha12345

Resultado: ✓ Mensagem de sucesso
```

### Teste 2: Email Duplicado ❌
```
(Use email de um cadastro anterior)

Resultado: Erro "Este e-mail já está cadastrado"
```

### Teste 3: Senhas não conferem ❌
```
Senha: Senha12345
Confirmar: Senha54321

Resultado: Erro "As senhas não conferem."
```

### Teste 4: Email inválido ❌
```
Email: email-sem-arroba.com

Resultado: Erro "Digite um e-mail válido."
```

---

## 📊 Estrutura de Dados no Firebase

Após cadastro bem-sucedido:

```json
{
  "usuarios": {
    "K7mP3nQ9xLp2wRs5": {
      "id": "K7mP3nQ9xLp2wRs5",
      "nome": "João Silva",
      "celular": "11987654321",
      "email": "joao@example.com",
      "createdAt": "2026-09-08T10:30:00.000Z"
    }
  }
}
```

**Localização no Firebase Console:**
1. Abra https://console.firebase.google.com
2. Selecione `viafacil-fe487`
3. Vá para `Realtime Database`
4. Verifique em `usuarios`

---

## 🔗 Rotas Disponíveis

| Rota | Descrição | Status |
|------|-----------|--------|
| `/` | Home / Cadastro | ✅ Funciona |
| `/register` | Cadastro (alias) | ✅ Funciona |
| Outras | 404 Not Found | ❌ Erro |

---

## 🆚 Comparação: Mobile vs Web

| Aspecto | Mobile | Web |
|--------|--------|-----|
| **Plataforma** | React Native + Expo | HTML + JavaScript |
| **Firebase** | Mesmo Firebase | Mesmo Firebase |
| **Design** | Nativo iOS/Android | Responsivo (web) |
| **Validações** | Idênticas | Idênticas |
| **Cadastro** | userService.tsx | Firebase SDK (web) |

---

## 📱 Responsividade

A página funciona em:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px+)
- ✅ Mobile (320px+)

```css
@media (max-width: 600px) {
    .container {
        max-width: 100%;
    }
}
```

---

## 🔐 Segurança

✅ **Implementado:**
- Firebase Authentication gerencia senhas
- Validação client-side
- Validação server-side (Firebase)
- Sem armazenamento de senha em plain text

⚠️ **Não implementado ainda:**
- HTTPS (só HTTP em localhost)
- Verificação de email
- Rate limiting
- CSRF protection

---

## 📚 Referências

- **Firebase Web SDK:** https://firebase.google.com/docs/web
- **MDN HTML:** https://developer.mozilla.org/pt-BR/docs/Web/HTML
- **Firebase Auth Errors:** https://firebase.google.com/docs/auth/troubleshooting

---

## 🆘 Troubleshooting

**P: A página não carrega no navegador**
R: Verifique se o servidor está rodando (`node web/server.js`)

**P: Cadastro não funciona**
R: Verifique:
- Internet está conectada?
- Firebase config está correto?
- Console do navegador mostra erros? (F12)

**P: Dados não aparecem no Firebase**
R: Verifique:
- Usuário foi criado em Firebase > Authentication?
- Verifique em Firebase > Realtime Database > usuarios

**P: Como parar o servidor?**
R: Pressione `Ctrl+C` no terminal

---

## 🚀 Próximos Passos

1. **Página de Login** - Implementar autenticação
2. **Página Principal** - Mostrar features do app
3. **Dashboard** - Após login, mostrar dados do usuário
4. **Perfil** - Editar dados da conta

---

**Versão:** 1.0  
**Data:** 2026-09-08  
**Status:** ✅ Funcional
