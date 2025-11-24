from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Aluno, Bibliotecario, Livro, Exemplar, Reserva, Emprestimo

# Configuração especial para o Usuário Customizado (para não quebrar o hash de senha no admin)
@admin.register(Usuario)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Informações Acadêmicas', {'fields': ('cpf', 'matricula', 'nome_completo')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informações Acadêmicas', {'fields': ('cpf', 'matricula', 'nome_completo')}),
    )
    list_display = ('username', 'email', 'matricula', 'cpf', 'is_staff')

# Registro simples das outras tabelas
admin.site.register(Aluno)
admin.site.register(Bibliotecario)
admin.site.register(Livro)
admin.site.register(Exemplar)
admin.site.register(Reserva)
admin.site.register(Emprestimo)