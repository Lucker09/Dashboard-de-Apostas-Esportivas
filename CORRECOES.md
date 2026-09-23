# Correções aplicadas

## Fluxo de uso
1. **Cadastro** – `Register.jsx` chamava `/register`; agora usa `/api/register` (via `authService`) e mostra os erros de validação do backend.
2. **Token expirado/inválido** – o filtro JWT não derruba mais a requisição; o backend responde **401** (antes 403/500) e o frontend limpa a sessão e volta ao `/login`.
3. **Login** – e-mail inexistente e senha errada agora retornam o mesmo **401** "Credenciais inválidas" (antes 500 e 400).
4. **Lista de apostas** – ordenada da mais recente para a mais antiga; ao criar uma aposta a tela volta à página 1.

## Lógica e dados
5. **Liquidação** – só o dono pode liquidar (404 caso contrário, sem revelar que a aposta existe); aposta já liquidada retorna **409**; linha bloqueada durante a liquidação. A verificação saiu do controller e foi para o service.
6. **Gráfico de pizza** – cada status tem sua própria cor (antes a cor dependia da posição após o filtro).
7. **Métricas** – `ANULADA` não entra no total apostado/ROI; `CASHOUT` e `ANULADA` aparecem no resumo e no gráfico (novos campos `apostasCashout` e `apostasAnuladas` no DTO). Taxa de acerto continua sendo GREEN / (GREEN + RED).
8. **GREEN** – retorno arredondado para 2 casas (`HALF_UP`).
9. **Pendentes** – Retorno e P&L mostram "—" em vez de R$ 0,00.

## Segurança e configuração
10. **Segredos fora do código** – senha do banco e chave JWT vêm de `DB_PASSWORD` / `JWT_SECRET` (variáveis de ambiente ou arquivo `.env`, ver `bets-backend/.env.example`). A aplicação não inicia sem elas; a chave JWT precisa ter no mínimo 32 caracteres.
11. **Rotas públicas** – apenas `/api/auth/**` e `/api/register`.
12. **CORS e URL da API configuráveis** – `CORS_ALLOWED_ORIGINS` no backend e `VITE_API_URL` no frontend; removido o `@CrossOrigin` redundante.

## Limpeza
- Removidos arquivos sem uso: `pages/Login.jsx` (versão escura), `components/ProtectedRoute.jsx`, `pages/Dashboard.jsx`, `App.css`, `bets-backend/package-lock.json`.
- Login movido para `pages/` e Register no mesmo visual claro; botão de login com estado de carregamento; quem já está logado é redirecionado de `/login` e `/register`.
- Lógica de login unificada em `authService` (o `AuthContext` só usa ele); `formatMoney` compartilhado em `utils/format.js`.
- `pom.xml` sem a dependência de segurança duplicada; `.gitignore` corrigido (`target/`, `.env`) e criado na raiz.
- README atualizado (Spring Boot 4, usuário vindo do token, `ANULADA`, variáveis de ambiente, endpoints). `index.html` com título e idioma corretos.

## Atenção ao rodar
- Crie `bets-backend/.env` a partir do `.env.example` antes de subir o backend.
- Trocar a chave JWT invalida os tokens antigos: faça login novamente.
- `mvn test` (`contextLoads`) também precisa do MySQL e dessas variáveis.
