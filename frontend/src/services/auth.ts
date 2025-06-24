import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Tipos
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Convertir User de Firebase a nuestro tipo AuthUser
const mapFirebaseUser = (user: User | null): AuthUser | null => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  };
};

// Servicios de autenticación
export const authService = {
  // Iniciar sesión con Google
  loginWithGoogle: async (): Promise<AuthUser> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Guardar el token de autenticación
      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      
      return mapFirebaseUser(user) as AuthUser;
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  },
  
  // Cerrar sesión
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  },
  
  // Obtener el usuario actual
  getCurrentUser: (): AuthUser | null => {
    const user = auth.currentUser;
    return mapFirebaseUser(user);
  },
  
  // Suscribirse a cambios en el estado de autenticación
  onAuthStateChanged: (callback: (user: AuthUser | null) => void): (() => void) => {
    return onAuthStateChanged(auth, (user) => {
      callback(mapFirebaseUser(user));
    });
  },
  
  // Obtener el token de autenticación actual
  getToken: async (): Promise<string | null> => {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error al obtener el token:', error);
      return null;
    }
  }
};

export default authService;
