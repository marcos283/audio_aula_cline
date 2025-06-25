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
    console.log(`Iniciando carga de archivo: ${filePath}`);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`Error: El archivo ${filePath} no existe`);
      throw new Error(`El archivo ${filePath} no existe`);
    }
    
    // Verificar que el bucket está configurado correctamente
    if (!bucket || !bucket.name) {
      console.error('Error: El bucket de Firebase Storage no está configurado correctamente');
      throw new Error('El bucket de Firebase Storage no está configurado correctamente');
    }
    
    // Verificar el tamaño del archivo
    const stats = fs.statSync(filePath);
    console.log(`Tamaño del archivo: ${stats.size} bytes`);
    
    if (stats.size === 0) {
      console.error('Error: El archivo está vacío');
      throw new Error('El archivo está vacío');
    }
    
    // Subir el archivo
    const destination = `recordings/${fileName}`;
    console.log(`Subiendo archivo a: ${destination}`);
    
    await bucket.upload(filePath, {
      destination,
      metadata: {
        contentType: 'audio/wav',
      },
      // Opciones para reintentar en caso de error
      resumable: true,
      validation: 'crc32c',
    });
    
    console.log('Archivo subido correctamente, configurando acceso público');
    
    // Hacer el archivo públicamente accesible
    const file = bucket.file(destination);
    await file.makePublic();
    
    // Obtener la URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    
    console.log(`Archivo disponible públicamente en: ${publicUrl}`);
    return publicUrl;
  } catch (error: any) {
    console.error('Error al subir archivo a Firebase Storage:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error.code === 'storage/unauthorized') {
      throw new Error('No tienes permisos para subir archivos a Firebase Storage. Verifica las credenciales.');
    } else if (error.code === 'storage/bucket-not-found') {
      throw new Error('El bucket de Firebase Storage no existe. Verifica la configuración.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('La carga del archivo fue cancelada.');
    } else if (error.code === 'storage/invalid-checksum') {
      throw new Error('El archivo está corrupto o la carga fue interrumpida.');
    } else {
      throw new Error(`Error al subir archivo a Firebase Storage: ${error.message || 'Error desconocido'}`);
    }
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
