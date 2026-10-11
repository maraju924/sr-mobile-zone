export const PLATFORM_SUPER_ADMIN_EMAIL = 'maraju921@gmail.com';

export function isPlatformSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === PLATFORM_SUPER_ADMIN_EMAIL.toLowerCase();
}
