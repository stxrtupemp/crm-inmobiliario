import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Input }   from '../../components/ui/Input';
import { Button }  from '../../components/ui/Button';

const schema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});
type LoginForm = z.infer<typeof schema>;

export function LoginPage() {
  const { login, isLoggingIn, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin/dashboard';

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-900 p-4">
      {/* Background pattern */}
      <div className="pointer-events-none fixed inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6366f1 0%, transparent 50%)' }} />

      <div className="w-full max-w-sm animate-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg">
            <Building2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CRM Inmobiliario</h1>
          <p className="mt-1 text-sm text-surface-400">Accede a tu cuenta</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-surface-800 p-8 shadow-modal border border-surface-700">
          <form onSubmit={handleSubmit((d) => login(d))} className="space-y-5">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              leftIcon={<Mail size={15}/>}
              {...register('email')}
              error={errors.email?.message}
              className="bg-surface-700 border-surface-600 text-white placeholder:text-surface-500 focus:border-primary-500"
            />
            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              leftIcon={<Lock size={15}/>}
              {...register('password')}
              error={errors.password?.message}
              className="bg-surface-700 border-surface-600 text-white placeholder:text-surface-500 focus:border-primary-500"
            />
            <Button type="submit" className="w-full" loading={isLoggingIn} size="lg">
              Entrar
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-surface-500">
          © {new Date().getFullYear()} CRM Inmobiliario
        </p>
      </div>
    </div>
  );
}
