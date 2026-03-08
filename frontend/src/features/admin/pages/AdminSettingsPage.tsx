import { useState, useEffect } from 'react';
import { useAdminSettingsQuery, useAdminUpdateSettingsMutation } from '@/features/admin/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const SETTING_GROUPS = [
  { key: 'general', label: 'General' },
  { key: 'store', label: 'Store' },
  { key: 'payment', label: 'Payment' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'email', label: 'Email' },
  { key: 'seo', label: 'SEO' },
];

export function AdminSettingsPage() {
  const [activeGroup, setActiveGroup] = useState('general');
  const { data, isLoading } = useAdminSettingsQuery(activeGroup);
  const updateMut = useAdminUpdateSettingsMutation();

  const settings: Record<string, string> = data?.data?.settings ?? data?.data ?? {};
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings && typeof settings === 'object') {
      setValues(settings);
    }
  }, [data]);

  const handleSave = () => {
    updateMut.mutate(values);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex gap-6">
        {/* Group nav */}
        <nav className="w-48 shrink-0 space-y-1">
          {SETTING_GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                activeGroup === g.key ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {g.label}
            </button>
          ))}
        </nav>

        {/* Settings form */}
        <div className="flex-1 rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold capitalize">{activeGroup} Settings</h2>
          <div className="space-y-4">
            {Object.entries(values).map(([key, value]) => (
              <Input
                key={key}
                label={key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                value={value}
                onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            ))}
            {Object.keys(values).length === 0 && (
              <p className="text-sm text-slate-400">No settings found for this group.</p>
            )}
          </div>
          {Object.keys(values).length > 0 && (
            <div className="mt-6">
              <Button onClick={handleSave} loading={updateMut.isPending}>
                Save Settings
              </Button>
              {updateMut.isSuccess && (
                <span className="ml-3 text-sm text-green-600">Saved!</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
