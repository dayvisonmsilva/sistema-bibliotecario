# Guia de Integração: Autenticação JWT (Frontend)

Este documento orienta a integração do Frontend com a API de Autenticação do Sistema Bibliotecário.

## 1. Endpoint de Login

Para autenticar um usuário, envie uma requisição POST com as credenciais.

- **URL:** `/api/token/`
- **Método:** `POST`
- **Body (JSON):**
  ```json
  {
    "username": "seu_usuario",
    "password": "sua_senha"
  }
  ```

## 2. Resposta da API

A API retorna os tokens de acesso e atualização, além de dados essenciais do usuário para personalização da interface.

**Exemplo de Resposta (200 OK):**

```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "id": 1,
    "nome_completo": "Fulano de Tal",
    "tipo_usuario": "aluno"
}
```

### Detalhes dos Campos

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `access` | `string` | **Token de Acesso**. Deve ser enviado no Header de todas as requisições autenticadas. Validade curta (ex: 30 min). |
| `refresh` | `string` | **Token de Atualização**. Usado para obter um novo `access` token sem exigir login novamente. Validade longa (ex: 1 dia). |
| `id` | `integer` | ID único do usuário no banco de dados. Útil para buscar dados do perfil. |
| `nome_completo` | `string` | Nome de exibição do usuário. Use para saudações na UI (ex: "Olá, Fulano"). |
| `tipo_usuario` | `string` | Define o perfil de acesso. Valores possíveis: `'aluno'` ou `'bibliotecario'`. |

## 3. Sugestão de Implementação (React)

### Armazenamento
Recomendamos armazenar os tokens de forma segura. Para simplicidade em SPAs, `localStorage` ou `sessionStorage` são comuns, mas Cookies `HttpOnly` são mais seguros contra XSS.

```javascript
// Exemplo salvando no localStorage
const handleLoginSuccess = (data) => {
  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);
  localStorage.setItem('user', JSON.stringify({
    id: data.id,
    name: data.nome_completo,
    role: data.tipo_usuario
  }));
};
```

### Lógica de Redirecionamento
Use o campo `tipo_usuario` para direcionar o usuário à área correta após o login.

```javascript
// Exemplo de redirecionamento
if (data.tipo_usuario === 'bibliotecario') {
  navigate('/admin/dashboard'); // Área administrativa
} else {
  navigate('/meus-emprestimos'); // Área do aluno
}
```

### Enviando Requisições Autenticadas
Inclua o token no cabeçalho `Authorization` com o prefixo `Bearer`.

```javascript
// Exemplo com Axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 4. Renovação de Token (Refresh)

Quando a API retornar erro `401 Unauthorized` com código de token expirado, use o endpoint de refresh.

- **URL:** `/api/token/refresh/`
- **Método:** `POST`
- **Body:** `{ "refresh": "seu_token_de_refresh" }`

Se o refresh falhar (ex: token expirado ou revogado), redirecione o usuário para a tela de Login.
