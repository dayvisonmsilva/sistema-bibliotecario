from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Informações Acadêmicas', {'fields': ('cpf', 'matricula', 'tipo_usuario')}),
    )
    list_display = ('username', 'email', 'first_name', 'cpf','tipo_usuario', 'matricula')

admin.site.register(Usuario, CustomUserAdmin)