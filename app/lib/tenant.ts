'use client';

import type { User } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/app/lib/firebaseClient';
import { normalizeEmail } from '@/app/lib/userRoles';

export type TenantRole = 'owner' | 'admin' | 'member';

export interface TenantFeatures {
  franchiseSearchEnabled: boolean;
}

export interface TenantRecord {
  id: string;
  name: string;
  ownerUserId: string;
  ownerEmail: string;
  features: TenantFeatures;
}

export interface TenantMembership {
  id: string;
  tenantId: string;
  userId: string;
  email: string;
  role: TenantRole;
}

export interface TenantInvitation {
  id: string;
  tenantId: string;
  email: string;
  role: TenantRole;
  status: 'pending' | 'accepted' | 'cancelled';
}

export const TENANTS_COLLECTION = 'tenants';
export const TENANT_MEMBERS_COLLECTION = 'tenantMembers';
export const TENANT_INVITATIONS_COLLECTION = 'tenantInvitations';
const USERS_COLLECTION = 'users';

function defaultTenantName(user: User): string {
  const source = (user.displayName?.trim() || user.email?.split('@')[0] || 'Ny bruker').trim();
  return `${source} sin bedrift`;
}

function asTenant(docId: string, data: DocumentData | undefined): TenantRecord | null {
  if (!data) return null;
  const name = typeof data.name === 'string' && data.name.trim() ? data.name.trim() : 'Uten navn';
  const ownerUserId = typeof data.ownerUserId === 'string' ? data.ownerUserId : '';
  const ownerEmail = typeof data.ownerEmail === 'string' ? data.ownerEmail : '';
  const featuresRaw = data.features as Partial<TenantFeatures> | undefined;
  const features: TenantFeatures = {
    franchiseSearchEnabled: Boolean(featuresRaw?.franchiseSearchEnabled),
  };
  return { id: docId, name, ownerUserId, ownerEmail, features };
}

function asMembership(docId: string, data: DocumentData | undefined): TenantMembership | null {
  if (!data) return null;
  if (typeof data.tenantId !== 'string' || typeof data.userId !== 'string') return null;
  const role = (data.role === 'owner' || data.role === 'admin' || data.role === 'member') ? data.role : 'member';
  return {
    id: docId,
    tenantId: data.tenantId,
    userId: data.userId,
    email: typeof data.email === 'string' ? data.email : '',
    role,
  };
}

function asInvitation(docId: string, data: DocumentData | undefined): TenantInvitation | null {
  if (!data) return null;
  if (typeof data.tenantId !== 'string' || typeof data.email !== 'string') return null;
  const role = (data.role === 'owner' || data.role === 'admin' || data.role === 'member') ? data.role : 'member';
  const status = (data.status === 'accepted' || data.status === 'cancelled' || data.status === 'pending') ? data.status : 'pending';
  return {
    id: docId,
    tenantId: data.tenantId,
    email: data.email,
    role,
    status,
  };
}

async function createFreshTenantForUser(user: User) {
  const tenantRef = doc(collection(db, TENANTS_COLLECTION));
  const memberRef = doc(db, TENANT_MEMBERS_COLLECTION, `${tenantRef.id}_${user.uid}`);
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const emailLower = normalizeEmail(user.email);

  await runTransaction(db, async (tx) => {
    tx.set(tenantRef, {
      name: defaultTenantName(user),
      ownerUserId: user.uid,
      ownerEmail: user.email,
      features: {
        franchiseSearchEnabled: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    tx.set(memberRef, {
      tenantId: tenantRef.id,
      userId: user.uid,
      email: user.email,
      emailLower,
      role: 'owner',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    tx.set(
      userRef,
      {
        primaryTenantId: tenantRef.id,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  return tenantRef.id;
}

export async function ensureTenantForUser(user: User): Promise<void> {
  if (!user?.uid || !user?.email) {
    return;
  }

  const membershipQuery = query(
    collection(db, TENANT_MEMBERS_COLLECTION),
    where('userId', '==', user.uid),
    limit(1)
  );
  const existingMembership = await getDocs(membershipQuery);
  if (!existingMembership.empty) {
    return;
  }

  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const emailLower = normalizeEmail(user.email);

  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    const currentPrimaryTenantId = userSnap.data()?.primaryTenantId;

    if (typeof currentPrimaryTenantId === 'string' && currentPrimaryTenantId.trim()) {
      const existingTenantId = currentPrimaryTenantId.trim();
      const existingMemberRef = doc(db, TENANT_MEMBERS_COLLECTION, `${existingTenantId}_${user.uid}`);
      const existingMemberSnap = await tx.get(existingMemberRef);

      // Legacy recovery: user had tenantId, but membership was missing.
      // We avoid reading tenant doc here because it may fail on old/broken references.
      if (!existingMemberSnap.exists()) {
        tx.set(existingMemberRef, {
          tenantId: existingTenantId,
          userId: user.uid,
          email: user.email,
          emailLower,
          role: 'owner',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return;
      }

      return;
    }

    // New users with no legacy tenant reference.
    const tenantRef = doc(collection(db, TENANTS_COLLECTION));
    const memberRef = doc(db, TENANT_MEMBERS_COLLECTION, `${tenantRef.id}_${user.uid}`);

    tx.set(tenantRef, {
      name: defaultTenantName(user),
      ownerUserId: user.uid,
      ownerEmail: user.email,
      features: {
        franchiseSearchEnabled: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    tx.set(memberRef, {
      tenantId: tenantRef.id,
      userId: user.uid,
      email: user.email,
      emailLower,
      role: 'owner',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    tx.set(
      userRef,
      {
        primaryTenantId: tenantRef.id,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });
}

export async function loadTenantWorkspaceForUser(user: User) {
  await ensureTenantForUser(user);

  const membershipsSnap = await getDocs(
    query(collection(db, TENANT_MEMBERS_COLLECTION), where('userId', '==', user.uid))
  );

  const memberships = membershipsSnap.docs
    .map((item) => asMembership(item.id, item.data()))
    .filter((item): item is TenantMembership => item !== null);

  const userSnap = await getDoc(doc(db, USERS_COLLECTION, user.uid));
  const preferredTenantId =
    typeof userSnap.data()?.primaryTenantId === 'string' ? userSnap.data()?.primaryTenantId : null;

  const selectedMembership =
    memberships.find((item) => item.tenantId === preferredTenantId) ||
    memberships.find((item) => item.role === 'owner') ||
    memberships[0] ||
    null;

  if (!selectedMembership) {
    return {
      tenant: null as TenantRecord | null,
      membership: null as TenantMembership | null,
      members: [] as TenantMembership[],
      invitations: [] as TenantInvitation[],
    };
  }

  const tenantSnap = await getDoc(doc(db, TENANTS_COLLECTION, selectedMembership.tenantId));
  let tenant = asTenant(tenantSnap.id, tenantSnap.data());

  // Legacy repair: membership points to missing/deleted tenant.
  // Create a fresh tenant and load again.
  if (!tenant) {
    const repairedTenantId = await createFreshTenantForUser(user);
    const repairedTenantSnap = await getDoc(doc(db, TENANTS_COLLECTION, repairedTenantId));
    tenant = asTenant(repairedTenantSnap.id, repairedTenantSnap.data());
  }

  const tenantMembersSnap = await getDocs(
    query(collection(db, TENANT_MEMBERS_COLLECTION), where('tenantId', '==', tenant?.id ?? selectedMembership.tenantId))
  );
  const members = tenantMembersSnap.docs
    .map((item) => asMembership(item.id, item.data()))
    .filter((item): item is TenantMembership => item !== null);

  const invitesSnap = await getDocs(
    query(collection(db, TENANT_INVITATIONS_COLLECTION), where('tenantId', '==', tenant?.id ?? selectedMembership.tenantId))
  );
  const invitations = invitesSnap.docs
    .map((item) => asInvitation(item.id, item.data()))
    .filter((item): item is TenantInvitation => item !== null)
    .filter((item) => item.status === 'pending');

  return {
    tenant,
    membership: selectedMembership,
    members,
    invitations,
  };
}

export async function updateTenantName(tenantId: string, name: string) {
  await updateDoc(doc(db, TENANTS_COLLECTION, tenantId), {
    name: name.trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function setTenantFranchiseFeature(tenantId: string, enabled: boolean) {
  await updateDoc(doc(db, TENANTS_COLLECTION, tenantId), {
    features: {
      franchiseSearchEnabled: enabled,
    },
    updatedAt: serverTimestamp(),
  });
}

export async function inviteToTenant(params: {
  tenantId: string;
  invitedByUserId: string;
  invitedByEmail: string;
  email: string;
  role: Exclude<TenantRole, 'owner'>;
}) {
  const normalized = normalizeEmail(params.email);
  if (!normalized) {
    throw new Error('Ugyldig e-postadresse');
  }

  await addDoc(collection(db, TENANT_INVITATIONS_COLLECTION), {
    tenantId: params.tenantId,
    email: params.email.trim(),
    emailLower: normalized,
    role: params.role,
    status: 'pending',
    invitedByUserId: params.invitedByUserId,
    invitedByEmail: params.invitedByEmail,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function listAllTenantsForAdmin(): Promise<TenantRecord[]> {
  const snap = await getDocs(collection(db, TENANTS_COLLECTION));
  return snap.docs
    .map((item) => asTenant(item.id, item.data()))
    .filter((item): item is TenantRecord => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name, 'no'));
}

export async function getTenantDetailsForAdmin(tenantId: string) {
  const [tenantSnap, membersSnap, invitesSnap] = await Promise.all([
    getDoc(doc(db, TENANTS_COLLECTION, tenantId)),
    getDocs(query(collection(db, TENANT_MEMBERS_COLLECTION), where('tenantId', '==', tenantId))),
    getDocs(query(collection(db, TENANT_INVITATIONS_COLLECTION), where('tenantId', '==', tenantId))),
  ]);

  const tenant = asTenant(tenantSnap.id, tenantSnap.data());
  const members = membersSnap.docs
    .map((item) => asMembership(item.id, item.data()))
    .filter((item): item is TenantMembership => item !== null);
  const invitations = invitesSnap.docs
    .map((item) => asInvitation(item.id, item.data()))
    .filter((item): item is TenantInvitation => item !== null)
    .filter((item) => item.status === 'pending');

  return { tenant, members, invitations };
}
