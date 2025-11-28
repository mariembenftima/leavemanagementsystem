export interface AuthResponse {
  success: boolean;
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };

  message?: string;
}
