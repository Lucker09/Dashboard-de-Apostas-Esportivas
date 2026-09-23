# 📈 Dashboard de Apostas Esportivas — API REST

API REST desenvolvida em **Java 21** com **Spring Boot 4** e **MySQL** para auxílio no gerenciamento, controle e análise estatística de desempenho em apostas esportivas. 

A aplicação permite que o apostador registre suas apostas, acompanhe seu histórico de forma paginada, realize o encerramento das bancas (*Green*, *Red*, *Cash-out*) e visualize métricas financeiras consolidadas (*Profit & Loss*, *ROI* e *Win Rate*) em tempo real.

---

## 📄 Requisitos e Regras de Negócio

### 1. Diretrizes Principais
* **Escopo Analítico:** O sistema atua como um dashboard de acompanhamento de resultados. **Não** processa transações bancárias ou depósitos reais.
* **Autonomia de Registro:** O usuário informa a descrição, o valor apostado e a cotação (*odd*) no momento do cadastro.
* **Ator Principal:** Cliente / Apostador.
* **Fluxo Base:** Cadastrar Usuário $\rightarrow$ Registrar Aposta (Status: `PENDENTE`) $\rightarrow$ Liquidar Aposta (`GREEN`, `RED` ou `CASHOUT`) $\rightarrow$ Consultar Métricas do Dashboard.

---

### 2. Requisitos Funcionais (RF)
* **[RF01] Gestão de Usuários:** Permite cadastrar e identificar usuários na base de dados.
* **[RF02] Cadastrar Aposta:** Permite registrar uma aposta vinculada ao usuário autenticado (obtido do token JWT), informando `descricao`, `valorApostado` e `odd`.
* **[RF03] Listar Apostas Paginadas:** Retorna o histórico de apostas filtrado por usuário com suporte a paginação (`page`, `size`).
* **[RF04] Liquidar Aposta:** Permite atualizar o resultado final da aposta:
  * **GREEN:** Lucro calculado com base no valor apostado e odd (`(valorApostado * odd) - valorApostado`).
  * **RED:** Prejuízo equivalente ao valor total apostado (`-valorApostado`).
  * **CASHOUT:** Encerramento antecipado informando o `valorResgatado` (`valorResgatado - valorApostado`).
  * **ANULADA:** Aposta estornada (`valorResgatado = valorApostado`, P&L zero). Não entra no total apostado nem no ROI.
  * Uma aposta só pode ser liquidada uma vez; novas tentativas retornam `409 Conflict`.
* **[RF05] Consolidação do Dashboard:** Calcula e exibe em tempo real:
  * **P&L (Profit & Loss):** Lucro ou prejuízo líquido acumulado.
  * **ROI (Return on Investment):** Retorno percentual sobre o capital total investido.
  * **Win Rate:** Taxa percentual de vitórias sobre o total de apostas encerradas.

---

### 3. Requisitos Não-Funcionais (RNF)
* **[RNF01] Paginação de Dados:** Consultas de histórico utilizam `Spring Data Pageable` para otimização de performance.
* **[RNF02] Validação de Entradas:** Uso de `jakarta.validation` para impedir odds inferiores a `1.00` e valores negativos.
* **[RNF03] Tratamento de Exceções:** Erros de validação e recursos não encontrados retornam respostas padronizadas via `@ControllerAdvice`.
* **[RNF04] Segurança de Credenciais:** Configuração de acesso ao banco via variáveis de ambiente (`DB_PASSWORD`) e chave do JWT (`JWT_SECRET`).

---

## 🗄️ Modelo de Dados (Entidades)

### `User` (`users`)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `BIGINT` (PK, Auto-increment) | Identificador único do usuário |
| `email` | `VARCHAR` (Unique, Not Null) | E-mail de acesso |
| `password_hash` | `VARCHAR` (Not Null) | Hash da senha de acesso |
| `data_criacao` | `DATETIME` | Data e hora de registro |

---

### `Aposta` (`apostas`)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `BIGINT` (PK, Auto-increment) | Identificador único da aposta |
| `user_id` | `BIGINT` (FK -> `users.id`) | Usuário proprietário da aposta |
| `descricao` | `VARCHAR` (Not Null) | Evento/Mercado (ex: "Flamengo vs Vasco") |
| `valor_apostado` | `DECIMAL(10,2)` | Valor investido na aposta |
| `odd` | `DECIMAL(5,2)` | Cotação da aposta ($\ge 1.01$) |
| `status` | `ENUM` | Estado da aposta (`PENDENTE`, `GREEN`, `RED`, `CASHOUT`, `ANULADA`) |
| `valor_resgatado` | `DECIMAL(10,2)` | Valor obtido em caso de `CASHOUT` |
| `data_criacao` | `DATETIME` | Timestamp de registro da aposta |

---

### `StatusAposta` (Enum)
* `PENDENTE`: Aposta registrada em aberto.
* `GREEN`: Aposta ganha com retorno total (`valorApostado * odd`).
* `RED`: Aposta perdida.
* `CASHOUT`: Aposta encerrada antecipadamente com valor parcial resgatado.
* `ANULADA`: Aposta estornada (valor apostado devolvido).

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** Java 21
* **Framework:** Spring Boot 4.x
  * Spring Data JPA / Hibernate
  * Spring Web (REST)
  * Spring Security + JWT (jjwt)
  * Bean Validation (`jakarta.validation`)
* **Banco de Dados:** MySQL 8.x
* **Gerenciador de Build:** Maven

---

## ⚙️ Configuração e Execução

### Backend (`bets-backend`)
1. Crie o banco `bets_dashboard` no MySQL.
2. Copie `.env.example` para `.env` (na pasta `bets-backend`) e preencha `DB_PASSWORD` e `JWT_SECRET`
   (mínimo de 32 caracteres; sugestão: `openssl rand -base64 48`). O `.env` não é versionado.
   Alternativa: definir as mesmas variáveis de ambiente na configuração de execução da IDE.
3. Execute `./mvnw spring-boot:run` a partir da pasta `bets-backend` (o `.env` é lido da pasta de execução).

Variáveis opcionais: `DB_URL`, `DB_USERNAME`, `JWT_EXPIRATION_MS`, `CORS_ALLOWED_ORIGINS`.

### Frontend (`bets-frontend`)
```
npm install
npm run dev
```
Por padrão a API é acessada em `http://localhost:8080`; para mudar, crie `.env` com `VITE_API_URL` (veja `.env.example`).

### Endpoints
| Método | Rota | Autenticação | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register` | Não | Cadastro de usuário |
| `POST` | `/api/auth/login` | Não | Login (retorna o token JWT) |
| `GET` | `/api/apostas?page=0&size=10` | Sim | Lista paginada (mais recentes primeiro) |
| `POST` | `/api/apostas` | Sim | Cria aposta (`PENDENTE`) |
| `GET` | `/api/apostas/{id}` | Sim | Busca aposta do usuário autenticado |
| `PATCH` | `/api/apostas/{id}/liquidar` | Sim | Liquida (`GREEN`, `RED`, `CASHOUT`, `ANULADA`) |
| `GET` | `/api/apostas/dashboard` | Sim | Métricas consolidadas |

Erros: `400` validação, `401` não autenticado / credenciais inválidas, `404` aposta inexistente (ou de outro usuário), `409` aposta já liquidada.
