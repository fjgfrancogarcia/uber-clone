// Mock session for testing without authentication

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'DRIVER' | 'ADMIN';
  image?: string | null;
}

// Default mock users for testing
export const mockUsers = [
  {
    id: 'user-1',
    name: 'Usuario Pasajero',
    email: 'pasajero@ejemplo.com',
    role: 'USER'
  },
  {
    id: 'driver-1',
    name: 'Usuario Conductor',
    email: 'conductor@ejemplo.com',
    role: 'DRIVER'
  },
  {
    id: 'admin-1',
    name: 'Administrador',
    email: 'admin@ejemplo.com',
    role: 'ADMIN'
  }
];

// Get the current mock session from localStorage
export const getMockSession = () => {
  if (typeof window === 'undefined') return null;
  
  const sessionData = localStorage.getItem('mockSession');
  if (!sessionData) return null;
  
  try {
    return JSON.parse(sessionData);
  } catch (e) {
    return null;
  }
};

// Set a mock user session
export const setMockSession = (user: MockUser) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('mockSession', JSON.stringify({
    user,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() // 24 hours
  }));
  
  // Trigger a storage event to notify other tabs/components
  window.dispatchEvent(new Event('storage'));
};

// Clear the mock session
export const clearMockSession = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('mockSession');
  
  // Trigger a storage event to notify other tabs/components
  window.dispatchEvent(new Event('storage'));
};

// Helper hook to use mock session
export const useMockSession = () => {
  if (typeof window === 'undefined') return null;
  
  // Get session initially
  const session = getMockSession();
  
  return {
    data: session,
    status: session ? 'authenticated' : 'unauthenticated',
    user: session?.user || null
  };
}; 