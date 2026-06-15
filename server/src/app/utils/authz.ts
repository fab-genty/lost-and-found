type AuthUser = { id?: string; role?: string; [key: string]: unknown } | undefined;

export function isAdmin(user: AuthUser): boolean {
  return user?.role === "ADMIN";
}

export function canMutate(user: AuthUser, ownerId: string): boolean {
  if (!user) return false;
  return user.role === "ADMIN" || user.id === ownerId;
}
