# 📈 Dashboard de Apostas Esportivas — API REST

API REST desenvolvida em **Spring Boot** e **MySQL** para auxílio no gerenciamento, controle e análise de desempenho de apostas esportivas. A aplicação permite que o usuário registre suas apostas, acompanhe seu histórico paginado, realize o encerramento das bancas (Green, Red, Cash-out) e visualize métricas consolidadas em tempo real.

---

## 📄 Especificação e Requisitos do Sistema

### 1. Diretrizes do Projeto
* **Escopo Financeiro:** O sistema atua puramente como um dashboard de acompanhamento de resultados. Não realiza movimentações ou transações financeiras reais.
* **Autonomia do Usuário:** O usuário possui total liberdade para cadastrar suas próprias apostas, informando a odd e os valores no momento do registro.
* **Ator Principal:** Cliente / Apostador.
* **Fluxo Base:** Autenticação/Identificação → Cadastrar Aposta → Confirmar/Acompanhar → Liquidar Resultado.

---

### 2. Requisitos Funcionais (RF)
* **[RF01] Cadastrar Aposta:** O usuário pode registrar uma aposta informando `userId`, `descricao`, `valorApostado` e `odd`.
* **[RF02] Listar Apostas Paginadas:** O sistema deve retornar o histórico de apostas filtrado por usuário com suporte a paginação (`page`, `size`).
* **[RF03] Liquidar Aposta:** Permite atualizar o status da aposta para `GREEN`, `RED` ou `CASHOUT` (neste último, informando o `valorResgatado`).
* **[RF04] Consolidação do Dashboard:** O sistema calcula em tempo real:
  * **P&L (Profit & Loss):** Lucro ou prejuízo líquido acumulado.
  * **ROI (Return on Investment):** Retorno percentual sobre o capital total investido.
  * **Win Rate:** Taxa percentual de acerto das apostas encerradas.
* **[RF05] Gestão de Usuários:** Endpoints para criação e identificação de perfil no sistema.

---

### 3. Requisitos Não-Funcionais (RNF)
* **[RNF01] Desempenho e Paginação:** Consultas de listagem devem utilizar paginação via `Spring Data Pageable` para otimizar o consumo de memória.
* **[RNF02] Validação de Dados:** Entradas de dados devem ser validadas utilizando `Bean Validation` (ex: proibir valores apostados negativos ou odds inferiores a 1.00).
* **[RNF03] Tratamento de Exceções:** Erros e validações devem retornar respostas padronizadas via `@ControllerAdvice` com códigos HTTP adequados (`400 Bad Request`, `404 Not Found`).
* **[RNF04] Persistência:** Banco de dados relacional MySQL rodando em container Docker ou instância local.

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** Java 21
* **Framework:** Spring Boot 3.x
  * Spring Data JPA / Hibernate
  * Spring Web (REST)
  * Spring Security
  * Bean Validation (`jakarta.validation`)
* **Banco de Dados:** MySQL 8.x (Docker / Local)
* **Gerenciador de Dependências:** Maven
* **Cliente de Banco:** DBeaver / MySQL Workbench
* **Testes de API:** Postman

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* Java JDK 21 instalado.
* Docker ou instância local do MySQL em execução.

### 1. Configurar o Banco de Dados
Certifique-se de que o MySQL está rodando e crie o schema:
```sql
CREATE DATABASE bets_dashboard;
