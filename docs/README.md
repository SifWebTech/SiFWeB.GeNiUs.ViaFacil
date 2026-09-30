# 📚 Documentação - SiFWeB.GeNiUs.ViaFacil

Bem-vindo à documentação técnica do projeto ViaFacil!

> Para instalar e rodar o app, veja o [`README.md`](../README.md) da raiz do projeto.

## 📁 Estrutura da Pasta `docs/`

```
docs/
├── README.md                    ← Você está aqui
├── HISTORICO_DE_MUDANCAS.md     ← O que foi feito em cada aula
└── MUDANCAS_IMPLEMENTADAS.md    ← Cadastro de usuário explicado linha por linha
```

## 📄 Arquivos Disponíveis

### 1. **HISTORICO_DE_MUDANCAS.md** 🗓️
Linha do tempo por aula, do mais recente para o mais antigo, com os commits:
- **29/09** — Login corrigido, sessão salva, regras de senha iguais e logs de erro
- **28/09** — `ClienteModel`, `ClienteService` e tela Home
- **22/09** — Dashboard, Novo processo, Relatórios e Configurações
- **21/09** — Publicação do projeto e remoção do template do Expo
- **08/09** — Cadastro de usuário

### 2. **MUDANCAS_IMPLEMENTADAS.md** 📝
Documentação **COMPLETA** do cadastro de usuário (aula de 08/09) com:
- ✅ Código antes/depois para cada mudança
- ✅ Explicações linha por linha
- ✅ Fluxo completo de execução
- ✅ Testes manuais
- ✅ Tratamento de erros

**Conteúdo:**
- Arquivo 1: `src/model/UserModel.tsx`
- Arquivo 2: `src/services/userService.tsx`
- Arquivo 3: `src/screens/register_screen.tsx` (6 mudanças)

---

## 🎯 Situação Atual

| Funcionalidade | Status | Onde |
|----------------|--------|------|
| Cadastro de usuário | ✅ Pronto | `register_screen.tsx`, `userService.tsx` |
| Login | ✅ Pronto | `login_screen.tsx` |
| Manter logado (persistence) | ✅ Pronto | `firebaseConfig.tsx` |
| Logout | ✅ Pronto | `dashboard_screen.tsx` |
| Dashboard | ✅ Pronto | `dashboard_screen.tsx` |
| Cadastro de clientes | ✅ Pronto | `new_client_screen.tsx`, `ClienteService.tsx` |
| Cadastro de processos | ✅ Pronto | `new_process_screen.tsx`, `officeData.ts` |
| Relatórios | ✅ Pronto | `reports_screen.tsx` |
| Configurações | ✅ Pronto | `settings_screen.tsx` |
| Tela Home (abre após o login) | ✅ Pronto | `home_screen.tsx` |
| Verificação de e-mail | ⬜ A fazer | — |
| Reset de senha | ⬜ A fazer | — |
| Listar/editar/excluir clientes na interface | ⬜ A fazer (o `ClienteService` já tem os métodos) | — |

---

## 🔑 Regras de Senha

| Tela | Regra |
|------|-------|
| Cadastro | 8+ caracteres, 1 letra maiúscula, 1 número, 1 símbolo (ex.: `Teste@123`) |
| Login | Só verifica se foi preenchida. Quem valida é o Firebase |

---

## 📖 Como Usar Esta Documentação

### Para Iniciantes:
1. Leia este README primeiro
2. Veja o `HISTORICO_DE_MUDANCAS.md` para entender a evolução
3. Abra `MUDANCAS_IMPLEMENTADAS.md` para o passo a passo do cadastro
4. Compare com o código em seu editor

### Para Desenvolvedores:
1. Use `git show <commit>` com os commits listados no histórico
2. Consulte a seção "🔄 Fluxo Completo" em `MUDANCAS_IMPLEMENTADAS.md`

### Para Professores:
1. O histórico lista, por aula, os arquivos alterados e o commit
2. Abra o arquivo correspondente para conferir o código

---

## 🎓 Conceitos Explicados

- **Segurança em Firebase** - Por que não armazenar senhas
- **Padrão Singleton** - Uma instância única do serviço (`userService`)
- **Métodos estáticos** - `ClienteService.criar()` sem precisar de `new`
- **Try/Catch/Finally** - Tratamento robusto de erros
- **Tipagem TypeScript** - Interfaces `UserModel` e `ClienteModel`
- **Loading States** - Melhor UX com feedback visual
- **Validação em Camadas** - Cliente + Servidor
- **Persistência de sessão** - AsyncStorage no celular
- **Dados por usuário** - Tudo gravado em `usuarios/{uid}/...`
- **Tempo real** - `onValue` atualiza o Dashboard automaticamente

---

## 🧪 Testes Manuais

**Cadastro** (detalhes em `MUDANCAS_IMPLEMENTADAS.md`):
✅ Cadastro bem-sucedido · ❌ E-mail duplicado · ❌ Senha fraca · ❌ E-mail inválido

**Login:**
1. Entre com uma conta existente → abre a Home ("Abrir painel" leva ao Dashboard)
2. Recarregue o app (tecla `r` no terminal do Expo) → continua logado
3. Faça logout no Dashboard → volta para o Login
4. Senha errada → "E-mail ou senha incorretos" e o terminal mostra `Erro no login: auth/invalid-credential`

---

## 🔐 Segurança

Consulte a seção "🔐 Segurança Implementada" em `MUDANCAS_IMPLEMENTADAS.md`.
Os dados de cada usuário ficam em `usuarios/{uid}`, e o app só lê o caminho do usuário logado.

---

## 📞 Próximos Passos

1. **Lista de clientes** - listar, editar e excluir usando o `ClienteService`
2. **Reset de Senha** - "Esqueci minha senha"
3. **Verificação de Email** - Confirmar conta
4. **Testes Automatizados** - Jest + React Testing Library

---

## 🆘 Precisa de Ajuda?

- **Não consegue entrar?** → Veja "🐞 Depurando erros de login/cadastro" no `README.md` da raiz
- **Celular não conecta no Expo?** → Use `npx expo start --tunnel`
- **Não entende uma mudança?** → Procure o commit no `HISTORICO_DE_MUDANCAS.md`
- **Quer testar?** → Veja a seção "🧪 Testes Manuais"

---

## 🔗 Links Úteis

**Expo:**
- Documentação SDK 54: https://docs.expo.dev/versions/v54.0.0/
- Firebase com Expo: https://docs.expo.dev/guides/using-firebase/

**Firebase Documentation:**
- Auth: https://firebase.google.com/docs/auth
- Realtime Database: https://firebase.google.com/docs/database

**React Native:**
- ActivityIndicator: https://reactnative.dev/docs/activityindicator
- Alert: https://reactnative.dev/docs/alert

**React Navigation:**
- Native Stack: https://reactnavigation.org/docs/native-stack-navigator

---

## 📊 Estrutura de Pastas do Projeto

```
ViaFacil/
├── src/
│   ├── components/
│   │   ├── OfficeUI.tsx            ← Componentes visuais compartilhados
│   │   ├── ScreenHeader.tsx
│   │   └── ScreenFooter.tsx
│   ├── model/
│   │   ├── UserModel.tsx
│   │   └── ClienteModel.tsx
│   ├── services/
│   │   ├── firebaseConfig.tsx      ← Auth com sessão salva
│   │   ├── userService.tsx
│   │   ├── ClienteService.tsx
│   │   └── officeData.ts           ← Processos e configurações
│   └── screens/
│       ├── splash_screen.tsx
│       ├── main_screen.tsx
│       ├── login_screen.tsx
│       ├── register_screen.tsx
│       ├── home_screen.tsx
│       ├── dashboard_screen.tsx
│       ├── new_client_screen.tsx
│       ├── new_process_screen.tsx
│       ├── reports_screen.tsx
│       └── settings_screen.tsx
├── assets/
│   └── images/
│       └── bombeiro_chamas_subindo_laterais.gif
├── docs/                           ← Você está aqui!
├── web/                            ← Versão web em HTML puro
├── App.tsx                         ← Rotas
├── package.json
└── tsconfig.json
```

---

## 💬 Perguntas Frequentes

**P: Aparece "E-mail ou senha incorretos", mas tenho certeza da senha.**  
R: Confira se o e-mail existe em Firebase Console → Authentication → Users. Se não existir, cadastre de novo.

**P: Onde ficam os clientes no Firebase?**  
R: Em `usuarios/{uid}/clients`. Cada usuário só vê os próprios clientes.

**P: Por que o app não me desloga mais ao recarregar?**  
R: A sessão agora é salva com AsyncStorage (`firebaseConfig.tsx`).

**P: Por que remover password do UserModel?**  
R: Segurança! O Firebase Authentication guarda as senhas criptografadas. Nunca armazene senhas em texto puro.

**P: O que é Singleton?**  
R: Uma única instância do serviço em todo o app. Veja a explicação em `MUDANCAS_IMPLEMENTADAS.md`.

---

**Versão:** 2.0  
**Data:** 2026-09-08  
**Última Atualização:** 2026-09-29
