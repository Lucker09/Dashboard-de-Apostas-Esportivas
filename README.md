# 📈 Dashboard de Apostas Esportivas — API REST

API REST desenvolvida em **Java 21** com **Spring Boot 3** e **MySQL** para auxílio no gerenciamento, controle e análise estatística de desempenho em apostas esportivas. 

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
* **[RF02] Cadastrar Aposta:** Permite registrar uma aposta vinculada a um usuário, informando `userId`, `descricao`, `valorApostado` e `odd`.
* **[RF03] Listar Apostas Paginadas:** Retorna o histórico de apostas filtrado por usuário com suporte a paginação (`page`, `size`).
* **[RF04] Liquidar Aposta:** Permite atualizar o resultado final da aposta:
  * **GREEN:** Lucro calculado com base no valor apostado e odd (`(valorApostado * odd) - valorApostado`).
  * **RED:** Prejuízo equivalente ao valor total apostado (`-valorApostado`).
  * **CASHOUT:** Encerramento antecipado informando o `valorResgatado` (`valorResgatado - valorApostado`).
* **[RF05] Consolidação do Dashboard:** Calcula e exibe em tempo real:
  * **P&L (Profit & Loss):** Lucro ou prejuízo líquido acumulado.
  * **ROI (Return on Investment):** Retorno percentual sobre o capital total investido.
  * **Win Rate:** Taxa percentual de vitórias sobre o total de apostas encerradas.

---

### 3. Requisitos Não-Funcionais (RNF)
* **[RNF01] Paginação de Dados:** Consultas de histórico utilizam `Spring Data Pageable` para otimização de performance.
* **[RNF02] Validação de Entradas:** Uso de `jakarta.validation` para impedir odds inferiores a `1.00` e valores negativos.
* **[RNF03] Tratamento de Exceções:** Erros de validação e recursos não encontrados retornam respostas padronizadas via `@ControllerAdvice`.
* **[RNF04] Segurança de Credenciais:** Configuração de acesso ao banco via variáveis de ambiente (`DB_PASSWORD`).

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
| `odd` | `DECIMAL(10,2)` | Cotação da aposta ($\ge 1.00$) |
| `status` | `ENUM` | Estado da aposta (`PENDENTE`, `GREEN`, `RED`, `CASHOUT`) |
| `valor_resgatado` | `DECIMAL(10,2)` | Valor obtido em caso de `CASHOUT` |
| `data_criacao` | `DATETIME` | Timestamp de registro da aposta |

---

### `StatusAposta` (Enum)
* `PENDENTE`: Aposta registrada em aberto.
* `GREEN`: Aposta ganha com retorno total (`valorApostado * odd`).
* `RED`: Aposta perdida.
* `CASHOUT`: Aposta encerrada antecipadamente com valor parcial resgatado.

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** Java 21
* **Framework:** Spring Boot 3.x
  * Spring Data JPA / Hibernate
  * Spring Web (REST)
  * Spring Security
  * Bean Validation (`jakarta.validation`)
* **Banco de Dados:** MySQL 8.x
* **Gerenciador de Build:** Maven
