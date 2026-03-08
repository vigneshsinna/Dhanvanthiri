import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '@/features/auth/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetMut = useResetPasswordMutation();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [form, setForm] = useState({ email: emailParam, password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    try {
      await resetMut.mutateAsync({ token, ...form });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setError('Reset failed. The link may have expired.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-brand-700">Dhanvanthiri Foods</Link>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h1 className="mb-4 text-xl font-semibold">Reset Password</h1>
          {success ? (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              Password reset successfully! Redirecting to login...
            </div>
          ) : (
            <>
              {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <Input label="New Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <Input label="Confirm Password" type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} required />
                <Button type="submit" className="w-full" loading={resetMut.isPending}>Reset Password</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
