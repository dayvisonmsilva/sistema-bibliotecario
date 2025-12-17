# Sistema de Gerenciamento Bibliotecário API

Uma API RESTful robusta desenvolvida para a gestão acadêmica de bibliotecas, oferecendo controle total sobre acervo, circulação de livros e gestão de usuários.

## 🚀 Tecnologias Utilizadas

O projeto foi construído com uma stack moderna e sólida em Python:

*   **Python:** Linguagem base.
*   **Django:** Framework web de alto nível.
*   **Django Rest Framework (DRF):** Construção da API REST.
*   **SimpleJWT:** Autenticação segura via JSON Web Tokens.
*   **drf-yasg:** Documentação automática com Swagger/OpenAPI.
*   **SQLite:** Banco de dados relacional (padrão desenvolvimento).

## ✨ Destaques & Funcionalidades

### 🔐 Autenticação & Segurança
*   **Login JWT Customizado:** Retorna tokens de acesso/refresh e payloads enriquecidos com ID e Tipo de Usuário (`aluno` ou `bibliotecario`).
*   **Controle de Acesso Granular:**
    *   **Bibliotecários:** Acesso total à gestão de Acervo (Livros, Exemplares) e Circulação (Empréstimos).
    *   **Alunos:** Acesso à consulta de acervo, realização de reservas e visualização de histórico.

### 📚 Controle de Estoque Inteligente
*   **Garantia Física:** A criação de uma `Reserva` decrementa imediatamente a `quantidade_disponivel` do livro, garantindo que o exemplar esteja separado.
*   **Ciclo de Vida Integrado:** O registro de um `Empréstimo` detecta e consome automaticamente a `Reserva` do aluno, evitando duplicidade no decremento de estoque.

### ⚖️ Sistema de Punição Automático
*   **Regra de Negócio Crítica:** Devoluções realizadas após a `data_limite` acionam o sistema de punição.
*   **Bloqueio:** O aluno inadimplente recebe um bloqueio automático de **30 dias**, sendo impedido de realizar novos empréstimos ou reservas durante este período.

### 🔎 Busca e Organização
*   **Filtros de Pesquisa:** Endpoints otimizados para busca de livros por Título e Autor.
*   **Organização de Exemplares:** Gestão de cópias físicas individuais através de códigos de barras únicos.

## 🛠️ Como Rodar o Projeto

Siga os passos abaixo para executar a API em seu ambiente local:

1.  **Clone o Repositório**
    ```bash
    git clone https://github.com/dayvisonmsilva/sistema-bibliotecario.git
    cd sistema-bibliotecario
    ```

2.  **Configure o Ambiente Virtual**
    ```bash
    python -m venv backend/venv
    source backend/venv/bin/activate  # Linux/Mac
    # ou backend\venv\Scripts\activate no Windows
    ```

3.  **Instale as Dependências**
    ```bash
    pip install -r backend/requirements.txt
    ```

4.  **Execute as Migrações**
    ```bash
    python backend/manage.py migrate
    ```

5.  **Inicie o Servidor**
    ```bash
    python backend/manage.py runserver
    ```

A API estará acessível em: `http://127.0.0.1:8000/`

## 📖 Documentação da API

A documentação interativa completa (endpoints, parâmetros, schemas) está disponível através do Swagger UI.

*   Acesse: **[http://127.0.0.1:8000/swagger/](http://127.0.0.1:8000/swagger/)**

Para visualizar os diagramas de arquitetura e fluxos de negócio, consulte a pasta `/docs` neste repositório.

---
Desenvolvido como parte do projeto de APS (Análise e Projeto de Sistemas) - UFERSA 2025.2
