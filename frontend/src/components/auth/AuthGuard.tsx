"use client";

import { useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

type Role = 'aluno' | 'bibliotecario';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const { user, isAuthenticated, accessToken } = useAuth();
  const router = useRouter();

  // O `accessToken` é a fonte mais rápida para saber se há uma sessão.
  // O `user` pode demorar um pouco mais para ser populado.
  const isChecking = accessToken && !user;

  const userRole: Role | null = useMemo(() => {
    if (!user) return null;
    return user.is_staff ? 'bibliotecario' : 'aluno';
  }, [user]);

  useEffect(() => {
    // Não faça nada enquanto o usuário estiver sendo verificado após um refresh
    if (isChecking) {
      return;
    }

    // Se não estiver autenticado, redireciona para o login.
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Se estiver autenticado, mas o papel não for permitido, redireciona.
    if (userRole && !allowedRoles.includes(userRole)) {
      router.replace('/livros'); // Redireciona para uma página segura, como o catálogo
    }
  }, [isAuthenticated, userRole, allowedRoles, router, isChecking]);
  
  // Exibe um loader enquanto verifica a autenticação/autorização
  if (!isAuthenticated || !userRole || !allowedRoles.includes(userRole)) {
    return <p className="text-center p-8">Verificando autorização...</p>;
  }

  // Se tudo estiver OK, renderiza o conteúdo protegido
  return <>{children}</>;
};

export default AuthGuard;
