
export interface UserAccount {
    id: string;
    username: string;
    password?: string; // Optional for security when passing around
    createdAt: string;
  }
  
  const DB_KEY_USERS = 'timemaster_db_users';
  
  // --- DATABASE SIMULATION ---
  
  // 1. Get All Users
  const getUsers = (): UserAccount[] => {
    const usersStr = localStorage.getItem(DB_KEY_USERS);
    return usersStr ? JSON.parse(usersStr) : [];
  };
  
  // 2. Save Users
  const saveUsers = (users: UserAccount[]) => {
    localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));
  };
  
  // --- AUTH ACTIONS ---
  
  export const registerUser = (username: string, password: string): { success: boolean; message: string; user?: UserAccount } => {
    const users = getUsers();
    
    // Validation
    if (username.length < 3) return { success: false, message: 'Username minimal 3 karakter.' };
    if (password.length < 4) return { success: false, message: 'Password minimal 4 karakter.' };
    
    // Check Duplicate
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'Username sudah digunakan.' };
    }
  
    // Create User
    const newUser: UserAccount = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      username,
      password, // In real app, hash this!
      createdAt: new Date().toISOString()
    };
  
    users.push(newUser);
    saveUsers(users);
  
    return { success: true, message: 'Akun berhasil dibuat!', user: newUser };
  };
  
  export const loginUser = (username: string, password: string): { success: boolean; message: string; user?: UserAccount } => {
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  
    if (!user) {
      return { success: false, message: 'Username atau password salah.' };
    }
  
    // Return user without password for session state
    const { password: _, ...safeUser } = user;
    return { success: true, message: 'Login berhasil.', user: safeUser };
  };
  
  // Helper to generate unique storage keys per user
  // Example: user "abc" -> key "tm_user_abc_records"
  export const getUserStorageKey = (userId: string, keyName: string) => {
    return `tm_user_${userId}_${keyName}`;
  };
  