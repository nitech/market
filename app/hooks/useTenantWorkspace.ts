'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import {
  inviteToTenant,
  loadTenantWorkspaceForUser,
  updateTenantName,
  type TenantInvitation,
  type TenantMembership,
  type TenantRecord,
} from '@/app/lib/tenant';
import type { TenantRole } from '@/app/lib/tenant';

interface WorkspaceState {
  tenant: TenantRecord | null;
  membership: TenantMembership | null;
  members: TenantMembership[];
  invitations: TenantInvitation[];
}

const EMPTY_STATE: WorkspaceState = {
  tenant: null,
  membership: null,
  members: [],
  invitations: [],
};

export function useTenantWorkspace() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<WorkspaceState>(EMPTY_STATE);

  const refresh = useCallback(async () => {
    if (!user) {
      setState(EMPTY_STATE);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await loadTenantWorkspaceForUser(user);
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke laste bedriftsdata');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  const saveTenantName = useCallback(
    async (name: string) => {
      if (!state.tenant) {
        throw new Error('Fant ingen aktiv bedrift');
      }
      const trimmed = name.trim();
      if (!trimmed) {
        throw new Error('Bedriftsnavn kan ikke være tomt');
      }
      await updateTenantName(state.tenant.id, trimmed);
      await refresh();
    },
    [state.tenant, refresh]
  );

  const sendInvitation = useCallback(
    async (email: string, role: Exclude<TenantRole, 'owner'>) => {
      if (!state.tenant || !state.membership || !user?.email) {
        throw new Error('Mangler aktiv tenant eller bruker');
      }
      if (state.membership.role !== 'owner') {
        throw new Error('Kun eier kan invitere nye brukere');
      }
      await inviteToTenant({
        tenantId: state.tenant.id,
        invitedByUserId: user.uid,
        invitedByEmail: user.email,
        email,
        role,
      });
      await refresh();
    },
    [state.tenant, state.membership, user, refresh]
  );

  return {
    ...state,
    loading: loading || authLoading,
    error,
    refresh,
    saveTenantName,
    sendInvitation,
  };
}
