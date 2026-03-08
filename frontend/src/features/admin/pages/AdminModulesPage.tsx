import { useEffect, useMemo, useState } from 'react';
import {
  type AdminFeatureModule,
  useAdminCreateModuleMutation,
  useAdminModuleHealthQuery,
  useAdminModulesQuery,
  useAdminRequestModuleActivationMutation,
  useAdminToggleModuleMutation,
  useAdminUpdateModuleCredentialsMutation,
  useAdminUpdateModuleMutation,
  useAdminValidateModuleLicenseMutation,
} from '@/features/admin/api';
import { useAppSelector } from '@/lib/utils/hooks';
import { isItUserRole } from '@/features/auth/roleDisplay';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const INTEGRATION_STATUS_OPTIONS = ['not_configured', 'configured', 'healthy', 'degraded', 'failed'] as const;

interface ModuleFormState {
  module_name: string;
  license_type: string;
  license_key: string;
  valid_to: string;
  vendor_name: string;
  notes: string;
  integration_status: (typeof INTEGRATION_STATUS_OPTIONS)[number];
  config_json_text: string;
}

function badgeVariantForStatus(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  if (status === 'healthy' || status === 'configured') return 'success';
  if (status === 'degraded') return 'warning';
  if (status === 'failed') return 'danger';
  return 'default';
}

function getInitialModuleForm(module: AdminFeatureModule | null): ModuleFormState {
  if (!module) {
    return {
      module_name: '',
      license_type: '',
      license_key: '',
      valid_to: '',
      vendor_name: '',
      notes: '',
      integration_status: 'not_configured',
      config_json_text: '{}',
    };
  }

  return {
    module_name: module.module_name ?? '',
    license_type: module.license_type ?? '',
    license_key: module.license_key ?? '',
    valid_to: module.valid_to ?? '',
    vendor_name: module.vendor_name ?? '',
    notes: module.notes ?? '',
    integration_status: module.integration_status ?? 'not_configured',
    config_json_text: JSON.stringify(module.config_json ?? {}, null, 2),
  };
}

export function AdminModulesPage() {
  const user = useAppSelector((s) => s.auth.user);
  const isItUser = isItUserRole(user?.role);

  const { data, isLoading, refetch } = useAdminModulesQuery();
  const createMut = useAdminCreateModuleMutation();
  const updateMut = useAdminUpdateModuleMutation();
  const toggleMut = useAdminToggleModuleMutation();
  const validateMut = useAdminValidateModuleLicenseMutation();
  const credentialsMut = useAdminUpdateModuleCredentialsMutation();
  const requestActivationMut = useAdminRequestModuleActivationMutation();

  const modules: AdminFeatureModule[] = useMemo(() => {
    return data?.data?.data ?? data?.data ?? [];
  }, [data]);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedModule = useMemo(
    () => modules.find((module) => module.id === selectedId) ?? null,
    [modules, selectedId]
  );

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [newModule, setNewModule] = useState({
    module_code: '',
    module_name: '',
    license_type: 'annual',
  });
  const [form, setForm] = useState<ModuleFormState>(getInitialModuleForm(null));

  const {
    data: healthData,
    refetch: refetchHealth,
    isFetching: isHealthChecking,
  } = useAdminModuleHealthQuery(selectedId ?? 0, false);

  useEffect(() => {
    if (!modules.length) {
      setSelectedId(null);
      return;
    }

    if (selectedId === null || !modules.some((module) => module.id === selectedId)) {
      setSelectedId(modules[0].id);
    }
  }, [modules, selectedId]);

  useEffect(() => {
    setForm(getInitialModuleForm(selectedModule));
  }, [selectedModule]);

  if (isLoading) return <PageLoader />;

  async function handleCreateModule() {
    if (!newModule.module_code.trim() || !newModule.module_name.trim()) {
      setError('Module code and name are required.');
      return;
    }

    setError('');
    setMessage('');
    try {
      await createMut.mutateAsync({
        module_code: newModule.module_code.trim(),
        module_name: newModule.module_name.trim(),
        license_type: newModule.license_type,
      });
      setNewModule({ module_code: '', module_name: '', license_type: 'annual' });
      setMessage('Module license created.');
      await refetch();
    } catch {
      setError('Unable to create module license.');
    }
  }

  async function handleSaveDetails() {
    if (!selectedModule) return;

    setError('');
    setMessage('');
    try {
      await updateMut.mutateAsync({
        id: selectedModule.id,
        module_name: form.module_name,
        license_type: form.license_type,
        license_key: form.license_key,
        valid_to: form.valid_to || null,
        vendor_name: form.vendor_name || null,
        notes: form.notes || null,
        integration_status: form.integration_status,
      });
      setMessage('Module details updated.');
      await refetch();
    } catch {
      setError('Unable to update module details.');
    }
  }

  async function handleToggleModule() {
    if (!selectedModule) return;

    setError('');
    setMessage('');
    try {
      await toggleMut.mutateAsync({
        id: selectedModule.id,
        is_enabled: !selectedModule.is_enabled,
      });
      setMessage(!selectedModule.is_enabled ? 'Module activated.' : 'Module deactivated.');
      await refetch();
    } catch {
      setError('Unable to update module status.');
    }
  }

  async function handleValidateLicense() {
    if (!selectedModule) return;

    setError('');
    setMessage('');
    try {
      const response = await validateMut.mutateAsync({
        id: selectedModule.id,
        license_key: form.license_key || undefined,
      });
      const isValid = Boolean(response?.data?.valid);
      setMessage(isValid ? 'License validated successfully.' : 'License validation failed. Check details.');
      await refetch();
    } catch {
      setError('Unable to validate module license.');
    }
  }

  async function handleSaveCredentials() {
    if (!selectedModule) return;

    let configJson: Record<string, unknown>;
    try {
      configJson = JSON.parse(form.config_json_text);
    } catch {
      setError('Credentials JSON is invalid.');
      return;
    }

    setError('');
    setMessage('');
    try {
      await credentialsMut.mutateAsync({
        id: selectedModule.id,
        config_json: configJson,
        integration_status: form.integration_status,
      });
      setMessage('Integration credentials updated.');
      await refetch();
    } catch {
      setError('Unable to update integration credentials.');
    }
  }

  async function handleHealthCheck() {
    if (!selectedModule) return;

    setError('');
    setMessage('');
    try {
      await refetchHealth();
      setMessage('Health check completed.');
      await refetch();
    } catch {
      setError('Unable to run health check.');
    }
  }

  async function handleRequestActivation(module: AdminFeatureModule) {
    const reason = window.prompt(`Why do you need activation for "${module.module_name}"?`) ?? '';
    if (!reason.trim()) return;

    setError('');
    setMessage('');
    try {
      await requestActivationMut.mutateAsync({ id: module.id, reason: reason.trim() });
      setMessage('Activation request submitted to IT User.');
    } catch {
      setError('Unable to submit activation request.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isItUser ? 'Module License Management' : 'Module Availability'}
          </h1>
          <p className="text-sm text-slate-500">
            {isItUser
              ? 'IT User controls licensing, activation, and integration credentials.'
              : 'Admin can view module state and request activation.'}
          </p>
        </div>
        <Badge variant={isItUser ? 'info' : 'default'}>{isItUser ? 'IT User' : 'Admin View'}</Badge>
      </div>

      {message && <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {isItUser && (
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-base font-semibold">Create Module License</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Module Code"
              value={newModule.module_code}
              onChange={(e) => setNewModule((prev) => ({ ...prev, module_code: e.target.value }))}
              placeholder="recommendation_engine"
            />
            <Input
              label="Module Name"
              value={newModule.module_name}
              onChange={(e) => setNewModule((prev) => ({ ...prev, module_name: e.target.value }))}
              placeholder="Recommendation Engine"
            />
            <label className="text-sm font-medium text-slate-700">
              License Type
              <select
                value={newModule.license_type}
                onChange={(e) => setNewModule((prev) => ({ ...prev, license_type: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="trial">Trial</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </label>
          </div>
          <div className="mt-3">
            <Button onClick={handleCreateModule} loading={createMut.isPending}>
              Create Module
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="border-b px-4 py-3">
            <h2 className="text-base font-semibold">Modules</h2>
          </div>
          <div className="divide-y">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setSelectedId(module.id)}
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                  module.id === selectedId ? 'bg-brand-50' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{module.module_name}</p>
                  <Badge variant={module.is_enabled ? 'success' : 'default'}>
                    {module.is_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">{module.module_code}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant={badgeVariantForStatus(module.integration_status)}>
                    {module.integration_status}
                  </Badge>
                  <Badge variant={badgeVariantForStatus(module.health_status)}>{module.health_status}</Badge>
                </div>
                {!isItUser && !module.is_enabled && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestActivation(module);
                      }}
                      loading={requestActivationMut.isPending}
                    >
                      Request Activation
                    </Button>
                  </div>
                )}
              </button>
            ))}
            {modules.length === 0 && (
              <div className="px-4 py-6 text-sm text-slate-500">
                No module licenses found. {isItUser ? 'Create one to begin.' : 'Ask IT User to add modules.'}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          {!selectedModule ? (
            <p className="text-sm text-slate-500">Select a module to view details.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{selectedModule.module_name}</h2>
                <Badge variant={selectedModule.is_enabled ? 'success' : 'default'}>
                  {selectedModule.is_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  label="Module Name"
                  value={form.module_name}
                  disabled={!isItUser}
                  onChange={(e) => setForm((prev) => ({ ...prev, module_name: e.target.value }))}
                />
                <Input
                  label="License Type"
                  value={form.license_type}
                  disabled={!isItUser}
                  onChange={(e) => setForm((prev) => ({ ...prev, license_type: e.target.value }))}
                />
                <Input
                  label="License Key"
                  value={form.license_key}
                  disabled={!isItUser}
                  onChange={(e) => setForm((prev) => ({ ...prev, license_key: e.target.value }))}
                />
                <Input
                  label="Expiry Date"
                  type="date"
                  value={form.valid_to}
                  disabled={!isItUser}
                  onChange={(e) => setForm((prev) => ({ ...prev, valid_to: e.target.value }))}
                />
                <Input
                  label="Vendor Name"
                  value={form.vendor_name}
                  disabled={!isItUser}
                  onChange={(e) => setForm((prev) => ({ ...prev, vendor_name: e.target.value }))}
                />
                <label className="text-sm font-medium text-slate-700">
                  Integration Status
                  <select
                    value={form.integration_status}
                    disabled={!isItUser}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      integration_status: e.target.value as ModuleFormState['integration_status'],
                    }))}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  >
                    {INTEGRATION_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Notes
                <textarea
                  value={form.notes}
                  disabled={!isItUser}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                />
              </label>

              {isItUser && (
                <>
                  <label className="block text-sm font-medium text-slate-700">
                    Integration Credentials (JSON)
                    <textarea
                      value={form.config_json_text}
                      onChange={(e) => setForm((prev) => ({ ...prev, config_json_text: e.target.value }))}
                      rows={6}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleSaveDetails} loading={updateMut.isPending}>Save Details</Button>
                    <Button variant="secondary" onClick={handleToggleModule} loading={toggleMut.isPending}>
                      {selectedModule.is_enabled ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="secondary" onClick={handleValidateLicense} loading={validateMut.isPending}>
                      Validate License
                    </Button>
                    <Button variant="secondary" onClick={handleSaveCredentials} loading={credentialsMut.isPending}>
                      Save Credentials
                    </Button>
                    <Button variant="outline" onClick={handleHealthCheck} loading={isHealthChecking}>
                      Check Health
                    </Button>
                  </div>
                </>
              )}

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <div>Activated by: {selectedModule.activated_by_name ?? 'N/A'}</div>
                <div>Activated on: {selectedModule.activated_on ? new Date(selectedModule.activated_on).toLocaleString() : 'N/A'}</div>
                <div>Updated by: {selectedModule.updated_by_name ?? 'N/A'}</div>
                <div>Last validated: {selectedModule.last_validated_at ? new Date(selectedModule.last_validated_at).toLocaleString() : 'Never'}</div>
              </div>

              {healthData?.data && (
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                  <p className="font-medium text-slate-800">Latest Health Check: {healthData.data.status}</p>
                  <ul className="mt-2 space-y-1 text-slate-600">
                    {(healthData.data.checks ?? []).map((check: { name: string; status: string; message: string }) => (
                      <li key={check.name}>
                        <span className="font-medium">{check.name}:</span> {check.status} ({check.message})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
