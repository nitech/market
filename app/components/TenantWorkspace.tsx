'use client';

import { useMemo, useState } from 'react';
import { useTenantWorkspace } from '@/app/hooks/useTenantWorkspace';

type InviteRole = 'admin' | 'member';

function roleLabel(role: string): string {
  if (role === 'owner') return 'Eier';
  if (role === 'admin') return 'Admin';
  return 'Medlem';
}

export function TenantWorkspace() {
  const { tenant, membership, members, invitations, loading, error, refresh, saveTenantName, sendInvitation } = useTenantWorkspace();
  const [companyName, setCompanyName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InviteRole>('member');
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canManage = membership?.role === 'owner';
  const roleText = useMemo(() => roleLabel(membership?.role ?? 'member'), [membership?.role]);

  if (loading) {
    return (
      <div className="rounded-xl p-6" style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}>
        <p className="text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
          Laster bedriftsprofil...
        </p>
      </div>
    );
  }

  if (!tenant || !membership) {
    return (
      <div className="rounded-xl p-6" style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}>
        <p className="text-sm" style={{ color: 'var(--gs-accent-red)' }}>
          Fant ingen aktiv bedrift. Prøv å logge inn på nytt.
        </p>
        {error && (
          <p className="text-xs mt-2" style={{ color: 'var(--gs-text-tertiary)' }}>
            Teknisk detalj: {error}
          </p>
        )}
        <button
          onClick={() => void refresh()}
          className="mt-3 px-3 py-2 rounded-lg text-xs font-semibold"
          style={{ background: 'var(--gs-bg-tertiary)', border: '1px solid var(--gs-border-default)', color: 'var(--gs-text-secondary)' }}
        >
          Prøv igjen
        </button>
      </div>
    );
  }

  const currentName = companyName || tenant.name;

  const handleSaveName = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveTenantName(currentName);
      setCompanyName('');
      setMessage('Bedriftsprofil oppdatert.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Kunne ikke lagre bedriftsprofil.');
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async () => {
    setInviting(true);
    setMessage(null);
    try {
      await sendInvitation(inviteEmail, inviteRole);
      setInviteEmail('');
      setMessage('Invitasjon sendt.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Kunne ikke sende invitasjon.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-xl p-4 sm:p-5" style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--gs-text-primary)' }}>
          Bedriftsprofil
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
          Rolle i tenant: <span style={{ color: 'var(--gs-accent-lime)' }}>{roleText}</span>
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={currentName}
            onChange={(event) => setCompanyName(event.target.value)}
            disabled={!canManage}
            placeholder="Bedriftsnavn"
            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
            style={{
              background: 'var(--gs-bg-tertiary)',
              border: '1px solid var(--gs-border-default)',
              color: canManage ? 'var(--gs-text-primary)' : 'var(--gs-text-tertiary)',
            }}
          />
          <button
            onClick={handleSaveName}
            disabled={!canManage || saving}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{
              background: 'var(--gs-gradient-lime)',
              color: 'var(--gs-bg-primary)',
              opacity: !canManage || saving ? 0.55 : 1,
            }}
          >
            {saving ? 'Lagrer...' : 'Lagre profil'}
          </button>
        </div>
        {!canManage && (
          <p className="mt-2 text-xs" style={{ color: 'var(--gs-text-tertiary)' }}>
            Kun eier kan redigere bedriftsprofilen.
          </p>
        )}
      </div>

      <div className="rounded-xl p-4 sm:p-5" style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}>
        <h3 className="text-base font-semibold" style={{ color: 'var(--gs-text-primary)' }}>
          Inviter brukere
        </h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
          Eier kan invitere nye brukere inn i bedriften.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_160px_auto]">
          <input
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            disabled={!canManage}
            placeholder="epost@bedrift.no"
            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
            style={{
              background: 'var(--gs-bg-tertiary)',
              border: '1px solid var(--gs-border-default)',
              color: canManage ? 'var(--gs-text-primary)' : 'var(--gs-text-tertiary)',
            }}
          />
          <select
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value as InviteRole)}
            disabled={!canManage}
            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
            style={{
              background: 'var(--gs-bg-tertiary)',
              border: '1px solid var(--gs-border-default)',
              color: canManage ? 'var(--gs-text-primary)' : 'var(--gs-text-tertiary)',
            }}
          >
            <option value="member">Medlem</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleInvite}
            disabled={!canManage || !inviteEmail.trim() || inviting}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{
              background: 'var(--gs-gradient-lime)',
              color: 'var(--gs-bg-primary)',
              opacity: !canManage || !inviteEmail.trim() || inviting ? 0.55 : 1,
            }}
          >
            {inviting ? 'Sender...' : 'Inviter'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl p-4 sm:p-5" style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--gs-text-primary)' }}>
            Medlemmer
          </h3>
          <div className="mt-3 space-y-2">
            {members.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>Ingen medlemmer enda.</p>
            ) : (
              members.map((item) => (
                <div key={item.id} className="rounded-lg px-3 py-2 text-sm flex items-center justify-between" style={{ background: 'var(--gs-bg-secondary)', border: '1px solid var(--gs-border-default)' }}>
                  <span style={{ color: 'var(--gs-text-secondary)' }}>{item.email || item.userId}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(163, 230, 53, 0.15)', color: 'var(--gs-accent-lime)' }}>
                    {roleLabel(item.role)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl p-4 sm:p-5" style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--gs-text-primary)' }}>
            Ventende invitasjoner
          </h3>
          <div className="mt-3 space-y-2">
            {invitations.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>Ingen ventende invitasjoner.</p>
            ) : (
              invitations.map((item) => (
                <div key={item.id} className="rounded-lg px-3 py-2 text-sm flex items-center justify-between" style={{ background: 'var(--gs-bg-secondary)', border: '1px solid var(--gs-border-default)' }}>
                  <span style={{ color: 'var(--gs-text-secondary)' }}>{item.email}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--gs-bg-tertiary)', color: 'var(--gs-text-secondary)' }}>
                    {roleLabel(item.role)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {(message || error) && (
        <div
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            background: error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            border: `1px solid ${error ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
            color: error ? 'var(--gs-accent-red)' : 'var(--gs-accent-green)',
          }}
        >
          {error || message}
        </div>
      )}
    </section>
  );
}
