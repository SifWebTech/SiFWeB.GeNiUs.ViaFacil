# 🚒 ViaFácil

Aplicativo mobile para escritórios que cuidam de processos junto ao Corpo de Bombeiros (AVCB e similares): cadastro de usuários, login, cadastro de clientes, abertura de processos, relatórios e configurações.

Trabalho da disciplina **Dispositivos Móveis I** — FATEC, 5º semestre.

---

## 🧰 Tecnologias

| Item | Versão |
|------|--------|
| Expo SDK | 54 |
| React Native | 0.81 |
| React | 19.1 |
| TypeScript | 5.9 |
| Firebase (Auth + Realtime Database) | 12 |
| React Navigation (Native Stack) | 7 |
| AsyncStorage (sessão do login) | 2.2 |

---

## 🚀 Como rodar

```bash
# 1. Instalar as dependências (sempre depois de um git pull)
npm install

# 2. Iniciar o Expo (o -c limpa o cache)
npx expo start -c
```

Depois, no celular, abra o **Expo Go** e escaneie o QR code do terminal.

### 📶 O celular não conecta?

- No celular, `localhost` é o próprio celular. Use o QR code ou o IP do computador (`exp://<IP-do-PC>:8081`).
- Redes de laboratório (ex.: `FatecWiLab`) costumam **isolar os aparelhos** e o Windows bloqueia conexões em redes **Públicas**. Nesses casos use o modo túnel:

```bash
npx expo start --tunnel
```

> Na primeira vez o Expo pede para instalar o `@expo/ngrok` — responda **Y**.

---

## 🗺️ Telas e navegação

```
Splash → Main → Login ──► Home ──► Novo cliente
              └► Cadastro      └─► Dashboard ──► Novo cliente
                                             ├─► Novo processo
                                             ├─► Relatórios
                                             └─► Configurações

Splash ──(já logado)──► Home
```

| Tela | Arquivo | O que faz |
|------|---------|-----------|
| Splash | `src/screens/splash_screen.tsx` | Abertura do app (5 s). Vai para a Home se já houver sessão, senão para o Main |
| Main | `src/screens/main_screen.tsx` | Menu principal (consulta de empresa, ITs/normas, solicitar análise) e rodapé com Login/Cadastro |
| Cadastro | `src/screens/register_screen.tsx` | Cria conta no Firebase Auth e salva o perfil em `usuarios/{uid}` |
| Login | `src/screens/login_screen.tsx` | Entra com e-mail e senha e abre a Home |
| Dashboard | `src/screens/dashboard_screen.tsx` | Indicadores, prazos, atalhos e logout. Volta ao Login se não houver sessão |
| Home | `src/screens/home_screen.tsx` | Primeira tela após o login: botões "Novo cliente" e "Abrir painel" |
| Novo cliente | `src/screens/new_client_screen.tsx` | Cadastro de cliente usando o `ClienteService` |
| Novo processo | `src/screens/new_process_screen.tsx` | Abre processo vinculado a um cliente |
| Relatórios | `src/screens/reports_screen.tsx` | Gráficos por situação/tipo e atividade mensal, com filtro de período |
| Configurações | `src/screens/settings_screen.tsx` | Nome do escritório, prazos no dashboard, padrões de cadastro e bases de normas |

---

## 📂 Estrutura

```
ViaFacil/
├── App.tsx                     ← Rotas (Native Stack)
├── src/
│   ├── components/             ← OfficeUI, ScreenHeader, ScreenFooter
│   ├── model/                  ← UserModel, ClienteModel
│   ├── screens/                ← Telas do app
│   └── services/
│       ├── firebaseConfig.tsx  ← Firebase App, Auth (com sessão salva) e Database
│       ├── userService.tsx     ← Cadastro de usuário
│       ├── ClienteService.tsx  ← CRUD, máscaras e validação de clientes
│       └── officeData.ts       ← Processos, configurações e leitura em tempo real
├── assets/                     ← Imagens (GIF do bombeiro)
├── docs/                       ← Documentação das aulas
└── web/                        ← Versão web em HTML puro (porta 8082)
```

---

## 🔥 Firebase

- **Projeto:** `viafacil-fe487`
- **Authentication:** e-mail e senha. A sessão fica salva no aparelho (AsyncStorage) e no navegador (web), então o usuário não é deslogado a cada reload.
- **Realtime Database:** todos os dados ficam dentro do usuário logado:

```
usuarios/
└── {uid}/
    ├── id, nome, celular, email, createdAt   ← perfil
    ├── clients/{id}                          ← clientes
    ├── processes/{id}                        ← processos
    └── settings                              ← configurações
```

### 🔑 Regras de senha

| Tela | Regra |
|------|-------|
| Cadastro | Mínimo 8 caracteres, 1 letra maiúscula, 1 número e 1 símbolo (ex.: `Teste@123`) |
| Login | Só verifica se foi preenchida. Quem valida é o Firebase |

### 🐞 Depurando erros de login/cadastro

O código do erro do Firebase aparece no terminal do Expo:

```
Erro no login: auth/invalid-credential ...
```

| Código | Significado |
|--------|-------------|
| `auth/invalid-credential` | E-mail não cadastrado **ou** senha errada (o Firebase não diz qual) |
| `auth/email-already-in-use` | E-mail já cadastrado |
| `auth/too-many-requests` | Muitas tentativas. Aguarde alguns minutos |
| `auth/network-request-failed` | Sem internet |

Para conferir se a conta existe: **Firebase Console → viafacil-fe487 → Authentication → Users**.

---

## 📚 Documentação

- [`docs/README.md`](docs/README.md) — índice da documentação
- [`docs/HISTORICO_DE_MUDANCAS.md`](docs/HISTORICO_DE_MUDANCAS.md) — o que foi feito em cada aula
- [`docs/MUDANCAS_IMPLEMENTADAS.md`](docs/MUDANCAS_IMPLEMENTADAS.md) — explicação detalhada do cadastro de usuário
- [`web/README.md`](web/README.md) — versão web em HTML
