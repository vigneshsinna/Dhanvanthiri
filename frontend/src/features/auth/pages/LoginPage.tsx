import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginSchema, type LoginInput } from '@/features/auth/schemas/loginSchema';
import { useAppDispatch } from '@/lib/utils/hooks';
import { setCredentials } from '@/features/auth/store/authSlice';
import { useLoginMutation } from '@/features/auth/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loginMut = useLoginMutation();
  const [serverError, setServerError] = useState('');
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/products';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginInput) => {
    setServerError('');
    try {
      const res = await loginMut.mutateAsync(values);
      const data = res.data ?? res;
      dispatch(setCredentials({
        user: data.user,
        accessToken: data.access_token,
      }));
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Please try again.';
      setServerError(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-brand-700">Dhanvanthiri Foods</Link>
          <p className="mt-2 text-sm text-slate-600">Sign in to your account</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-lg">
          {serverError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="rounded border-slate-300" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-brand-700 hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>Sign in</Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-700 hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
