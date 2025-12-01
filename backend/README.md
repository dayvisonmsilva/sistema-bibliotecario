# Backend do Sistema Bibliotecário

Este diretório contém o backend do sistema bibliotecário, desenvolvido com Django e Django Rest Framework.

## Pré-requisitos

- Python 3.8 ou superior
- `pip` (gerenciador de pacotes do Python)

## Configuração do Ambiente

Siga os passos abaixo para configurar e rodar o projeto localmente.

### 1. Criar e Ativar o Ambiente Virtual

Recomendamos o uso de um ambiente virtual para isolar as dependências do projeto.

```bash
# Criar o ambiente virtual (se ainda não existir)
python3 -m venv venv

# Ativar o ambiente virtual (Linux/macOS)
source venv/bin/activate

# Ativar o ambiente virtual (Windows)
venv\Scripts\activate
```

### 2. Instalar Dependências

Com o ambiente virtual ativado, instale as dependências listadas no arquivo `requirements.txt`.

```bash
pip install -r requirements.txt
```

### 3. Aplicar Migrações

Configure o banco de dados aplicando as migrações do Django.

```bash
python manage.py migrate
```

### 4. Criar um Superusuário (Opcional)

Para acessar o painel administrativo do Django (`/admin/`), crie um superusuário.

```bash
python manage.py createsuperuser
```

### 5. Rodar o Servidor

Inicie o servidor de desenvolvimento.

```bash
python manage.py runserver
```

O servidor estará rodando em `http://127.0.0.1:8000/`.

## Endpoints da API

A API pode ser acessada em `http://127.0.0.1:8000/api/`. Os principais endpoints são:

- `/api/usuarios/`
- `/api/alunos/`
- `/api/bibliotecarios/`
- `/api/livros/`
- `/api/exemplares/`
- `/api/reservas/`
- `/api/emprestimos/`
