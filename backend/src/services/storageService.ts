import { initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

// Inicializar Firebase Admin
if (!global.firebaseInitialized) {
  initializeApp({
    credential: process.env.FIREBASE_ADMIN_CREDENTIALS 
      ? JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)
      : undefined,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  
  global.firebaseInitialized = true;
}

// Obtener referencia al bucket de almacenamiento
const bucket = getStorage().bucket();

/**
 * Sube un archivo a Firebase Storage
 * @param filePath Ruta local del archivo a subir
 * @param fileName Nombre del archivo en Firebase Storage
 * @returns URL pública del archivo subido
 */
export const uploadToStorage = async (filePath: string, fileName: string): Promise<string> => {
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo ${filePath} no existe`);
    }
    
    // Subir el archivo
    const destination = `recordings/${fileName}`;
    await bucket.upload(filePath, {
      destination,
      metadata: {
        contentType: 'audio/wav',
      },
    });
    
    // Hacer el archivo públicamente accesible
    const file = bucket.file(destination);
    await file.makePublic();
    
    // Obtener la URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    
    console.log(`Archivo subido correctamente: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('Error al subir archivo a Firebase Storage:', error);
    throw new Error('Error al subir archivo a Firebase Storage');
  }
};

/**
 * Elimina un archivo de Firebase Storage
 * @param fileName Nombre del archivo en Firebase Storage
 */
export const deleteFromStorage = async (fileName: string): Promise<void> => {
  try {
    const destination = `recordings/${fileName}`;
    await bucket.file(destination).delete();
    console.log(`Archivo eliminado correctamente: ${destination}`);
  } catch (error) {
    console.error('Error al eliminar archivo de Firebase Storage:', error);
    throw new Error('Error al eliminar archivo de Firebase Storage');
  }
};

// Declaración para TypeScript
declare global {
  var firebaseInitialized: boolean;
}
