# 🗓️ Histórico de Mudanças por Aula

Registro do que foi feito em cada aula, do mais recente para o mais antigo.
Cada item traz o commit correspondente para consulta com `git show <commit>`.

---

## 📅 30/09/2026 — Home após o login

| Arquivo | Mudança |
|---------|---------|
| `src/screens/login_screen.tsx` | Após o login, `navigation.reset` abre a **Home** em vez do Dashboard |
| `src/screens/home_screen.tsx` | Novo botão **"Abrir painel"** que leva ao Dashboard (onde ficam indicadores e logout) |
| `src/screens/splash_screen.tsx` | Ao fim dos 5 s, espera o Firebase recuperar a sessão (`auth.authStateReady()`) e abre a **Home** se já houver usuário logado, ou o **Main** se não houver |

Com isso a pendência de 28/09 (Home sem caminho de navegação) foi resolvida.

---

## 📅 29/09/2026 — Login, sessão salva e documentação

### 🐞 Problema encontrado
Não era possível entrar no app. A investigação mostrou três pontos:

1. **Regras de senha diferentes** entre Cadastro (exigia maiúscula + símbolo) e Login (exigia letra + **número** + símbolo). Uma senha aceita no cadastro podia ser barrada no login antes mesmo de chegar ao Firebase.
2. **Mensagem genérica**: erros do Firebase fora da lista viravam "Não foi possível realizar o login", sem pista da causa.
3. **Sessão não era salva**: `initializeAuth(app)` sem persistência deslogava o usuário a cada reload do Expo.

A mensagem que apareceu no teste foi **"E-mail ou senha incorretos"** (`auth/invalid-credential`), ou seja, o Firebase recusou a combinação. A causa é a conta não existir no projeto `viafacil-fe487` ou a senha estar errada. Confira em **Firebase Console → Authentication → Users**.

### ✅ O que mudou

| Commit | Arquivo | Mudança |
|--------|---------|---------|
| `9a22f2e` | `src/services/firebaseConfig.tsx`, `package.json` | Sessão salva com AsyncStorage (celular) e `browserLocalPersistence` (web) |
| `95a942e` | `src/screens/register_screen.tsx` | Cadastro passa a exigir **número** também |
| `95a942e` | `src/screens/login_screen.tsx` | Login só verifica se a senha foi preenchida |
| `95a942e` | Login e Cadastro | `console.log` com o código do erro do Firebase |
| `8c26c25` | `src/screens/new_client_screen.tsx` | Apenas formatação do botão |

### 🔍 Código — sessão salva (`firebaseConfig.tsx`)

```typescript
import {
    browserLocalPersistence,
    // @ts-ignore existe no build React Native do Firebase, mas não nos tipos padrão
    getReactNativePersistence,
    initializeAuth,
} from 'firebase/auth';
import { Platform } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

export const auth = initializeAuth(app, {
    persistence: Platform.OS === 'web'
        ? browserLocalPersistence
        : getReactNativePersistence(ReactNativeAsyncStorage),
});
```

> 💡 O `@ts-ignore` é necessário porque os tipos do Firebase não declaram `getReactNativePersistence`, mas a função existe no pacote usado pelo celular. O `Platform.OS` garante que cada plataforma use a função certa.

### 🔑 Regras de senha atuais

| Tela | Regra |
|------|-------|
| Cadastro | 8+ caracteres, 1 maiúscula, 1 número, 1 símbolo |
| Login | Só "preenchida" — o Firebase valida |

### 📶 Celular não acessa `localhost:8081`
- `localhost` no celular é o próprio celular. Use o QR code do Expo ou o IP do PC.
- A rede `FatecWiLab-06` está como **Pública** no Windows (firewall bloqueia) e provavelmente isola os aparelhos.
- Solução: `npx expo start --tunnel`.

### ⚠️ Observações
- Depois de `git pull`, rode `npm install` (entrou o pacote `@react-native-async-storage/async-storage`).
- Na web, `Alert.alert` não aparece: o cadastro pode dar certo sem mostrar "Sucesso!".

---

## 📅 28/09/2026 — Clientes com Firebase e tela Home

| Commit | Mudança |
|--------|---------|
| `88ccbe5` | Criados `src/model/ClienteModel.tsx` e `src/services/ClienteService.tsx` |
| `94b05b7` | Tela **Novo cliente** passou a usar o `ClienteService`. Clientes ficam em `usuarios/{uid}/clients` |
| `036ed69` | Criada a **HomeScreen** com botão "Novo cliente" e rota `Home` no `App.tsx` |

### 📦 `ClienteService` (métodos estáticos)

| Método | O que faz |
|--------|-----------|
| `criar(dados)` | Grava um novo cliente com ID gerado pelo `push` |
| `listarTodos()` | Lê todos os clientes do usuário |
| `obterPorId(id)` | Lê um cliente |
| `atualizar(id, dados)` | Atualiza campos (`update`) |
| `excluir(id)` | Remove (`remove`) |
| `aplicarMascaraCpfCnpj`, `aplicarMascaraCelular`, `aplicarMascaraCep`, `aplicarMascaraData` | Formatam o texto enquanto o usuário digita |
| `validarCampos(dados)` | Obrigatórios: nome, CPF (11) / CNPJ (14), celular, cidade e UF. E-mail e data são opcionais, mas validados se preenchidos |

### ⏭️ Pendência (resolvida em 30/09)
A **Home** não era aberta por nenhuma tela. Agora ela é a primeira tela após o login.

---

## 📅 22/09/2026 — Dashboard e telas de ação rápida

Commit `a6e456f`:

- **Dashboard** com indicadores, prazos próximos, atalhos e logout (`signOut`).
- Se não houver usuário logado, o Dashboard volta para o Login (`onAuthStateChanged`).
- Novas telas: **Novo cliente**, **Novo processo**, **Relatórios** e **Configurações**.
- `src/services/officeData.ts`: processos (`usuarios/{uid}/processes`), configurações (`usuarios/{uid}/settings`) e leitura em tempo real (`onValue`).
- `src/components/OfficeUI.tsx`: componentes visuais compartilhados (página, seção, campo, botão).

---

## 📅 21/09/2026 — Publicação do projeto

Commit `443f2b5`:

- Removido o template padrão do Expo Router (`app/`, `components/`, `constants/`).
- Navegação passou a ser feita pelo `App.tsx` com Native Stack.
- Adicionados o GIF do bombeiro e a pasta `docs/`.

---

## 📅 08/09/2026 — Cadastro de usuário

Detalhado em [`MUDANCAS_IMPLEMENTADAS.md`](MUDANCAS_IMPLEMENTADAS.md):
`UserModel`, `userService.cadastrarUsuario()` e integração na tela de Cadastro.

---

## 📅 24/08/2026 — Início

Commit `5d108dc`: projeto criado.
