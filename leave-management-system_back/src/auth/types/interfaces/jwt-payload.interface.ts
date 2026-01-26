// ✅ FIXED: Changed "role" to "roles" to match the actual JWT token structure

export interface JwtPayload {
  id: string;
  sub: string;
  email: string;
  roles: string[]; // ✅ FIXED: Changed from "role" to "roles" (plural)
}
