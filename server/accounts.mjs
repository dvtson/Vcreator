import { createHash } from 'node:crypto';
export const SUPER_UID = 'FBeRHAsHrNPeuhmfUF6yeF8QmMs2';
const roles = ['admin', 'reviewer'];
export function requireSuper(uid) { if (uid !== SUPER_UID) throw Error('permission-denied'); }
function publicAccount(uid, value) { return { uid, email: value.email, role: value.role, enabled: value.enabled, createdAt: value.createdAt }; }
export function accountHandlers(auth, db) {
  return {
    async create(uid, input) {
      requireSuper(uid);
      const email = String(input.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof input.password !== 'string' || input.password.length < 8 || input.password.length > 128 || !roles.includes(input.role) || !/^[a-f0-9-]{36}$/.test(input.requestId || '')) throw Error('invalid-argument');
      const target = 'staff_' + createHash('sha256').update(input.requestId).digest('hex').slice(0, 32);
      const ref = db.collection('admin_users').doc(target);
      const existing = (await ref.get()).data();
      if (existing) {
        if (existing.email === email && existing.creationRequestId === input.requestId && existing.enabled) return publicAccount(target, existing);
        throw Error('already-exists');
      }
      let created = false;
      try {
        // No sign-in, verification email, email code or password persistence in Firestore.
        await auth.createUser({ uid: target, email, password: input.password, disabled: true, emailVerified: false }); created = true;
        const profile = { email, role: input.role, enabled: false, createdAt: new Date().toISOString(), createdBy: uid, creationRequestId: input.requestId };
        await ref.set(profile);
        await auth.updateUser(target, { disabled: false });
        await ref.update({ enabled: true });
        return publicAccount(target, { ...profile, enabled: true });
      } catch (error) {
        // Fail closed on partial provisioning. A retry uses the same deterministic UID.
        if (created) {
          try { await ref.set({ enabled: false }, { merge: true }); } catch {}
          try { await auth.updateUser(target, { disabled: true }); } catch {}
          try { await auth.deleteUser(target); await ref.delete(); } catch {}
        }
        if (error?.code === 'auth/email-already-exists') throw Error('already-exists');
        throw error;
      }
    },
    async list(uid) {
      requireSuper(uid);
      const snapshot = await db.collection('admin_users').get();
      return snapshot.docs.map(doc => publicAccount(doc.id, doc.data())).filter(row => roles.includes(row.role)).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
    },
    async change(uid, input) {
      requireSuper(uid);
      if (input.uid === SUPER_UID || !/^staff_[a-f0-9]{32}$/.test(input.uid || '') || !roles.includes(input.role) || typeof input.enabled !== 'boolean') throw Error('invalid-argument');
      const ref = db.collection('admin_users').doc(input.uid); const profile = (await ref.get()).data();
      if (!profile || profile.createdBy !== SUPER_UID) throw Error('not-found');
      // Membership is the immediate authorization boundary, including already issued tokens.
      await ref.update({ enabled: false });
      await auth.updateUser(input.uid, { disabled: !input.enabled });
      await auth.revokeRefreshTokens(input.uid);
      const next = { ...profile, role: input.role, enabled: input.enabled, updatedAt: new Date().toISOString() };
      await ref.update(next);
      return publicAccount(input.uid, next);
    },
  };
}
