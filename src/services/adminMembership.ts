export async function getMemberProfile(uid: string): Promise<{ enabled?: boolean; role?: string; email?: string } | null> {
  const [{ doc, getDocFromServer }, { db }] = await Promise.all([import('firebase/firestore'), import('./firestoreClient')]);
  if (!db) return null;
  return (await getDocFromServer(doc(db, 'admin_users', uid))).data() || null;
}
