// Este archivo es solo para tipos y puede ser importado por el cliente

// Define tipo para los roles de usuario
export type UserRole = 'USER' | 'DRIVER' | 'ADMIN';

// Define interfaz para credenciales
export interface Credentials {
  email: string;
  password: string;
}

// Define interfaz para datos de usuario
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
} 