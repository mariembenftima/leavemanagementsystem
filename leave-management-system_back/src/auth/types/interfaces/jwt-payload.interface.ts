export interface JwtPayload {
  id: string;
  sub: string;
  email: string;
  role: string[];
}
