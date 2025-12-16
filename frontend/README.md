# Frontend do Sistema de Biblioteca

Este é o frontend da aplicação Sistema de Biblioteca, construído com [Next.js](https://nextjs.org).

## Como Rodar o Frontend

Para colocar o frontend em funcionamento, siga os passos abaixo:

1.  **Pré-requisitos:**
    *   Certifique-se de ter o [Node.js](https://nodejs.org/) (versão 18 ou superior) e o [npm](https://www.npmjs.com/) instalados em sua máquina.
    *   O **backend** da aplicação (servidor Django) deve estar em execução. Consulte o `README.md` na pasta `backend/` para instruções sobre como configurá-lo e iniciá-lo. Por padrão, o frontend espera que o backend esteja acessível em `http://127.0.0.1:8000/api`.

2.  **Navegue até a pasta do frontend:**

    ```bash
    cd frontend/
    ```

3.  **Instale as dependências:**

    ```bash
    npm install
    ```

4.  **Inicie o servidor de desenvolvimento:**

    ```bash
    npm run dev
    ```

5.  **Acesse a aplicação:**
    Abra seu navegador e acesse [http://localhost:3000](http://localhost:3000).

A aplicação será recarregada automaticamente a cada alteração no código-fonte.

## Scripts Disponíveis

No diretório do projeto, você pode executar:

*   `npm run dev`: Inicia a aplicação em modo de desenvolvimento.
*   `npm run build`: Compila a aplicação para produção.
*   `npm run start`: Inicia a aplicação em modo de produção (após rodar `npm run build`).
*   `npm run lint`: Executa o linter para verificar problemas de código.

## Saiba Mais

Para aprender mais sobre Next.js, você pode consultar os seguintes recursos:

*   [Next.js Documentation](https://nextjs.org/docs) - Aprenda sobre os recursos e API do Next.js.
*   [Learn Next.js](https://nextjs.org/learn) - Um tutorial interativo de Next.js.