'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import {
  getTenantDetailsForAdmin,
  listAllTenantsForAdmin,
  setTenantFranchiseFeature,
  type TenantInvitation,
  type TenantMembership,
  type TenantRecord,
} from '@/app/lib/tenant';

interface SelectedTenantState {
  tenant: TenantRecord | null;
  members: TenantMembership[];
  invitations: TenantInvitation[];
}

function roleLabel(role: string) {
  if (role === 'owner') return 'Eier';
  if (role === 'admin') return 'Admin';
  return 'Medlem';
}

export function AdminTenantsPanel() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedTenantState>({
    tenant: null,
    members: [],
    invitations: [],
  });

  const filteredTenants = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return tenants;
    return tenants.filter((tenant) => tenant.name.toLowerCase().includes(normalized) || tenant.ownerEmail.toLowerCase().includes(normalized));
  }, [query, tenants]);

  const refreshList = async () => {
    const data = await listAllTenantsForAdmin();
    setTenants(data);
    if (data.length > 0 && !selectedTenantId) {
      setSelectedTenantId(data[0].id);
    }
  };

  const refreshDetails = async (tenantId: string) => {
    const details = await getTenantDetailsForAdmin(tenantId);
    setSelected(details);
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listAllTenantsForAdmin();
        if (cancelled) return;
        setTenants(data);
        if (data.length > 0) {
          const firstId = data[0].id;
          setSelectedTenantId(firstId);
          const details = await getTenantDetailsForAdmin(firstId);
          if (cancelled) return;
          setSelected(details);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Kunne ikke laste kundelisten');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedTenantId) return;
    void (async () => {
      try {
        const details = await getTenantDetailsForAdmin(selectedTenantId);
        setSelected(details);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kunne ikke laste bedriftsdetaljer');
      }
    })();
  }, [selectedTenantId]);

  if (!isAdmin) {
    return (
      <div className="rounded-xl p-6" style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}>
        <p className="text-sm" style={{ color: 'var(--gs-accent-red)' }}>
          Denne siden er kun tilgjengelig for administrator.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl p-6" style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}>
        <p className="text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
          Laster kunder...
        </p>
      </div>
    );
  }

  const activeTenant = selected.tenant;

  const toggleFranchise = async () => {
    if (!activeTenant) return;
    const nextValue = !activeTenant.features.franchiseSearchEnabled;
    setSaving(true);
    setError(null);
    try {
      await setTenantFranchiseFeature(activeTenant.id, nextValue);
      await refreshList();
      await refreshDetails(activeTenant.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke oppdatere funksjonalitet');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <aside className="rounded-xl p-4" style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}>
        <h3 className="text-base font-semibold" style={{ color: 'var(--gs-text-primary)' }}>
          Kunder (bedrifter)
        </h3>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Søk i kunder..."
          className="mt-3 w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{
            background: 'var(--gs-bg-tertiary)',
            border: '1px solid var(--gs-border-default)',
            color: 'var(--gs-text-primary)',
          }}
        />
        <div className="mt-3 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {filteredTenants.map((tenant) => {
            const active = tenant.id === selectedTenantId;
            return (
              <button
                key={tenant.id}
                onClick={() => setSelectedTenantId(tenant.id)}
                className="w-full text-left rounded-lg p-3"
                style={{
                  background: active ? 'rgba(163, 230, 53, 0.12)' : 'var(--gs-bg-secondary)',
                  border: `1px solid ${active ? 'rgba(163, 230, 53, 0.35)' : 'var(--gs-border-default)'}`,
                }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--gs-text-primary)' }}>{tenant.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--gs-text-tertiary)' }}>{tenant.ownerEmail}</p>
              </button>
            );
          })}
          {filteredTenants.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
              Ingen kunder matcher søket.
            </p>
          )}
        </div>
      </aside>

      <div className="rounded-xl p-4 sm:p-5" style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}>
        {!activeTenant ? (
          <p className="text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
            Velg en bedrift fra listen.
          </p>
        ) : (
          <>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--gs-text-primary)' }}>
              {activeTenant.name}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--gs-text-tertiary)' }}>
              Eier: {activeTenant.ownerEmail}
            </p>

            <div className="mt-4 rounded-lg p-4" style={{ background: 'var(--gs-bg-secondary)', border: '1px solid var(--gs-border-default)' }}>
              <h4 className="text-sm font-semibold" style={{ color: 'var(--gs-text-primary)' }}>
                Funksjonalitet
              </h4>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: 'var(--gs-text-secondary)' }}>Franchise-søk</p>
                  <p className="text-xs" style={{ color: 'var(--gs-text-tertiary)' }}>
                    Styrer om Franchise-menyen er tilgjengelig for denne bedriften.
                  </p>
                </div>
                <button
                  onClick={toggleFranchise}
                  disabled={saving}
                  className="px-3 py-2 rounded-lg text-xs font-semibold"
                  style={{
                    background: activeTenant.features.franchiseSearchEnabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                    color: activeTenant.features.franchiseSearchEnabled ? 'var(--gs-accent-green)' : 'var(--gs-accent-red)',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {activeTenant.features.franchiseSearchEnabled ? 'På' : 'Av'}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg p-4" style={{ background: 'var(--gs-bg-secondary)', border: '1px solid var(--gs-border-default)' }}>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--gs-text-primary)' }}>
                  Brukere i bedriften
                </h4>
                <div className="mt-2 space-y-2">
                  {selected.members.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>Ingen brukere funnet.</p>
                  ) : (
                    selected.members.map((member) => (
                      <div key={member.id} className="rounded-md px-3 py-2 text-sm flex items-center justify-between" style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}>
                        <span style={{ color: 'var(--gs-text-secondary)' }}>{member.email || member.userId}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--gs-bg-tertiary)', color: 'var(--gs-text-secondary)' }}>
                          {roleLabel(member.role)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-lg p-4" style={{ background: 'var(--gs-bg-secondary)', border: '1px solid var(--gs-border-default)' }}>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--gs-text-primary)' }}>
                  Ventende invitasjoner
                </h4>
                <div className="mt-2 space-y-2">
                  {selected.invitations.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>Ingen ventende invitasjoner.</p>
                  ) : (
                    selected.invitations.map((invite) => (
                      <div key={invite.id} className="rounded-md px-3 py-2 text-sm flex items-center justify-between" style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}>
                        <span style={{ color: 'var(--gs-text-secondary)' }}>{invite.email}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--gs-bg-tertiary)', color: 'var(--gs-text-secondary)' }}>
                          {roleLabel(invite.role)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="mt-4 text-sm" style={{ color: 'var(--gs-accent-red)' }}>
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
