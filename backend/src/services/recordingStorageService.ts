import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Ruta al archivo JSON de grabaciones
const RECORDINGS_FILE_PATH = path.join(__dirname, '../data/recordings.json');

// Tipo para las grabaciones
export interface Recording {
  id: string;
  date: string;
  duration: string;
  audioUrl: string;
  transcription?: string;
  status: 'processing' | 'completed' | 'error';
}

// Interfaz para el archivo JSON
interface RecordingsData {
  recordings: Recording[];
}

/**
 * Lee todas las grabaciones del archivo JSON
 * @returns Array de grabaciones
 */
export const getAllRecordings = async (): Promise<Recording[]> => {
  try {
    // Verificar si el archivo existe
    if (!fs.existsSync(RECORDINGS_FILE_PATH)) {
      // Si no existe, crear un archivo vacío
      await saveRecordings({ recordings: [] });
      return [];
    }

    // Leer el archivo
    const data = await fs.promises.readFile(RECORDINGS_FILE_PATH, 'utf8');
    const recordingsData: RecordingsData = JSON.parse(data);
    return recordingsData.recordings;
  } catch (error) {
    console.error('Error al leer las grabaciones:', error);
    throw new Error('Error al leer las grabaciones');
  }
};

/**
 * Obtiene una grabación por su ID
 * @param id ID de la grabación
 * @returns Grabación encontrada o null si no existe
 */
export const getRecordingById = async (id: string): Promise<Recording | null> => {
  try {
    const recordings = await getAllRecordings();
    const recording = recordings.find(rec => rec.id === id);
    return recording || null;
  } catch (error) {
    console.error(`Error al obtener la grabación ${id}:`, error);
    throw new Error(`Error al obtener la grabación ${id}`);
  }
};

/**
 * Guarda una nueva grabación
 * @param recording Datos de la grabación a guardar
 * @returns Grabación guardada con ID generado
 */
export const saveRecording = async (recording: Omit<Recording, 'id'>): Promise<Recording> => {
  try {
    const recordings = await getAllRecordings();
    
    // Generar ID para la nueva grabación
    const newRecording: Recording = {
      ...recording,
      id: uuidv4()
    };
    
    // Añadir la nueva grabación al array
    recordings.push(newRecording);
    
    // Guardar el array actualizado
    await saveRecordings({ recordings });
    
    return newRecording;
  } catch (error) {
    console.error('Error al guardar la grabación:', error);
    throw new Error('Error al guardar la grabación');
  }
};

/**
 * Actualiza una grabación existente
 * @param id ID de la grabación a actualizar
 * @param updatedData Datos actualizados
 * @returns Grabación actualizada o null si no existe
 */
export const updateRecording = async (id: string, updatedData: Partial<Recording>): Promise<Recording | null> => {
  try {
    const recordings = await getAllRecordings();
    const index = recordings.findIndex(rec => rec.id === id);
    
    if (index === -1) {
      return null;
    }
    
    // Actualizar la grabación
    recordings[index] = {
      ...recordings[index],
      ...updatedData
    };
    
    // Guardar el array actualizado
    await saveRecordings({ recordings });
    
    return recordings[index];
  } catch (error) {
    console.error(`Error al actualizar la grabación ${id}:`, error);
    throw new Error(`Error al actualizar la grabación ${id}`);
  }
};

/**
 * Elimina una grabación
 * @param id ID de la grabación a eliminar
 * @returns true si se eliminó correctamente, false si no existía
 */
export const deleteRecording = async (id: string): Promise<boolean> => {
  try {
    const recordings = await getAllRecordings();
    const initialLength = recordings.length;
    
    // Filtrar la grabación a eliminar
    const updatedRecordings = recordings.filter(rec => rec.id !== id);
    
    if (updatedRecordings.length === initialLength) {
      return false; // No se encontró la grabación
    }
    
    // Guardar el array actualizado
    await saveRecordings({ recordings: updatedRecordings });
    
    return true;
  } catch (error) {
    console.error(`Error al eliminar la grabación ${id}:`, error);
    throw new Error(`Error al eliminar la grabación ${id}`);
  }
};

/**
 * Guarda el array de grabaciones en el archivo JSON
 * @param data Datos a guardar
 */
const saveRecordings = async (data: RecordingsData): Promise<void> => {
  try {
    // Asegurarse de que el directorio existe
    const dir = path.dirname(RECORDINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Guardar los datos en el archivo
    await fs.promises.writeFile(
      RECORDINGS_FILE_PATH,
      JSON.stringify(data, null, 2),
      'utf8'
    );
  } catch (error) {
    console.error('Error al guardar las grabaciones:', error);
    throw new Error('Error al guardar las grabaciones');
  }
};
