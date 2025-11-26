import json
from django.http import JsonResponse
from .models import Usuario
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def realizar_cadastro(request):
    if request.method == 'POST':
        dados = json.loads(request.body)
        try:
            user = Usuario.objects.create_user(
                username=dados['email'],
                first_name=dados['nome'],
                email=dados['email'],
                password=dados['senha'],
                cpf=dados['cpf'],
                matricula=dados['matricula'],
                tipo_usuario='ALUNO'
            )
            return JsonResponse({'mensagem': 'Aluno cadastrado com sucesso!'}, status=201)
        except Exception as e:
            return JsonResponse({'erro': str(e)}, status=400)
    else:
        return JsonResponse({'erro': 'Método não permitido'}, status=405)

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
            return JsonResponse({'erro': 'Credenciais inválidas'}, status=401)
    else:
        return JsonResponse({'erro': 'Método não permitido'}, status=405)