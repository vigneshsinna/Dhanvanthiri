import { useState } from 'react';
import { useChangePasswordMutation } from '@/features/auth/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link } from 'react-router-dom';

export function SecurityPage() {
  const changePwdMut = useChangePasswordMutation();
  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match');
      return;
    }
    try {
      await changePwdMut.mutateAsync(form);
      setMsg('Password changed successfully!');
      setForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err: unknown) {
      const apiMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password.';
      setError(apiMsg);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Security</h1>
        <Link to="/profile" className="text-sm text-brand-700 hover:underline">Back to Profile</Link>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-medium">Change Password</h2>
        {msg && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{msg}</div>}
        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={form.current_password}
            onChange={(e) => setForm({ ...form, current_password: e.target.value })}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <p className="text-xs text-slate-500">Min 8 characters, 1 uppercase letter, 1 number</p>
          <Input
            label="Confirm New Password"
            type="password"
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            required
          />
          <Button type="submit" loading={changePwdMut.isPending}>Update Password</Button>
        </form>
      </div>
    </div>
  );
}
