import json
from django.http import JsonResponse
from .models import Usuario, Livro
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def realizar_cadastro(request):
    if request.method == 'POST':
        dados = json.loads(request.body)
        try:
            user = Usuario.objects.create_user(
                username = dados['email'],
                first_name = dados['nome'],
                email = dados['email'],
                password = dados['senha'],
                cpf = dados['cpf'],
                matricula = dados['matricula'],
                tipo_usuario = 'ALUNO'
            )
            return JsonResponse({'mensagem': 'Aluno cadastrado com sucesso!'}, status=201)
        except Exception as e:
            return JsonResponse({'erro': str(e)}, status=400)
    else:
        return JsonResponse({'erro': 'Método não permitido!'}, status=405)

@csrf_exempt
def realizar_login(request):
    if request.method == 'POST':
        dados = json.loads(request.body)
        email = dados.get('email')
        senha = dados.get('senha')

        user = authenticate(request, username=email, password=senha)

        if user is not None:
            login(request, user)
            return JsonResponse({
                'mensagem': 'Login realizado com sucesso!',
                'usuario': user.first_name,
                'tipo': user.tipo_usuario
            })
        else:
            return JsonResponse({'erro': 'Credenciais inválidas!'}, status=401)
    else:
        return JsonResponse({'erro': 'Método não permitido!'}, status=405)

@csrf_exempt
def listar_livros(request):
    if request.method == 'GET':
        livros = Livro.objects.all()
        dados = []

        for livro in livros:
            dados.append({
                'id': livro.id,
                'titulo': livro.titulo,
                'autor': livro.autor,
                'ano': livro.ano,
                'editora': livro.editora,
                'numero_paginas': livro.numero_paginas,
                'quantidade_total': livro.quantidade_total,
                'quantidade_disponivel': livro.quantidade_disponivel
            })
        return JsonResponse(dados, safe=False)
    else:
        return JsonResponse({'erro': 'Método não permitido!'}, status=405)

@csrf_exempt
def cadastrar_livro(request):
    usuario = request.user

    if not usuario.is_authenticated:
        return JsonResponse({'erro': 'Você precisa fazer login para realizar esta ação.'}, status=401)

    if usuario.tipo_usuario != 'BIBLIOTECARIO':
        return JsonResponse({'erro': 'Acesso negado. Apenas bibliotecários podem cadastrar livros.'}, status=403)

    if request.method == 'POST':
        dados = json.loads(request.body)
        
        try:
            livro = Livro.objects.create(
                titulo = dados['titulo'],
                autor = dados['autor'],
                ano = dados['ano'],
                editora = dados['editora'],
                numero_paginas = dados['numero_paginas'],
                quantidade_total = 0,
                quantidade_disponivel = 0
            )
            return JsonResponse({'mensagem': 'Livro cadastrado com sucesso!'}, status=201)
        except Exception as e:
            return JsonResponse({'erro': str(e)}, status=400)
    else:
        return JsonResponse({'erro': 'Método não permitido!'}, status=405)