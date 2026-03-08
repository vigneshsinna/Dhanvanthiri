import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '@/features/auth/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const mutation = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await mutation.mutateAsync({ email });
      setSent(true);
    } catch {
      setError('Could not send reset link. Please check your email.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-brand-700">Dhanvanthiri Foods</Link>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h1 className="mb-2 text-xl font-semibold">Forgot Password</h1>
          {sent ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                If an account with that email exists, we've sent a password reset link.
              </div>
              <Link to="/login" className="block text-center text-sm text-brand-700 hover:underline">Back to login</Link>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-600">Enter your email and we'll send you a reset link.</p>
              {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Button type="submit" className="w-full" loading={mutation.isPending}>Send Reset Link</Button>
              </form>
              <p className="mt-4 text-center text-sm text-slate-600">
                <Link to="/login" className="text-brand-700 hover:underline">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
