import type { Session } from 'next-auth';

/**
 * Check whether a session belongs to an admin user.
 * Admin list is read from environment variable ADMIN_EMAILS (comma-separated list).
 * Defaults to danayasa2@gmail.com if not set.
 */
export function isSessionAdmin(session: Session | null | undefined) {
  if (!session || !session.user || !session.user.email) return false;
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'danayasa2@gmail.com';
  if (!raw) return false;
  const emails = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return emails.includes((session.user.email || '').toLowerCase());
}

export default isSessionAdmin;
