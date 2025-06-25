import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { processAudio } from '../services/audioProcessingService';
import { saveToGoogleSheets } from '../services/googleSheetsService';
import { uploadToStorage } from '../services/storageService';
import { 
  getAllRecordings as getRecordings, 
  getRecordingById as getRecording,
  saveRecording,
  updateRecording
} from '../services/recordingStorageService';

// Directorio temporal para almacenar archivos de audio
const TEMP_DIR = path.join(__dirname, '../../temp');

// Asegurarse de que el directorio temporal existe
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Obtener todas las grabaciones
export const getAllRecordings = async (req: Request, res: Response) => {
  try {
    const recordings = await getRecordings();
    res.json(recordings);
  } catch (error) {
    console.error('Error al obtener grabaciones:', error);
    res.status(500).json({ error: 'Error al obtener las grabaciones' });
  }
};

// Obtener una grabación específica
export const getRecordingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const recording = await getRecording(id);
    
    if (!recording) {
      return res.status(404).json({ error: 'Grabación no encontrada' });
    }
    
    res.json(recording);
  } catch (error) {
    console.error(`Error al obtener grabación ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error al obtener la grabación' });
  }
};

// Crear una nueva grabación
export const createRecording = async (req: Request, res: Response) => {
  try {
    // Verificar si se ha enviado un archivo
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ error: 'No se ha enviado ningún archivo de audio' });
    }
    
    const audioFile = req.files.audio as any;
    const fileId = uuidv4();
    const fileName = `${fileId}.wav`;
    const filePath = path.join(TEMP_DIR, fileName);
    
    // Guardar el archivo temporalmente
    await audioFile.mv(filePath);
    
    // Subir el archivo a Firebase Storage
    const audioUrl = await uploadToStorage(filePath, fileName);
    
    // Crear registro de grabación
    const newRecording = await saveRecording({
      date: new Date().toLocaleDateString('es-ES'),
      duration: '00:00', // Se actualizaría con la duración real
      audioUrl,
      status: 'processing'
    });
    
    // Eliminar el archivo temporal
    fs.unlinkSync(filePath);
    
    res.status(201).json(newRecording);
  } catch (error) {
    console.error('Error al crear grabación:', error);
    res.status(500).json({ error: 'Error al crear la grabación' });
  }
};

// Procesar una grabación (transcripción y análisis)
export const processRecording = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Se requiere el ID de la grabación' });
    }
    
    // Obtener la grabación de la base de datos
    const recording = await getRecording(id);
    
    if (!recording) {
      return res.status(404).json({ error: 'Grabación no encontrada' });
    }
    
    // Procesar el audio (transcripción y análisis)
    const processingResult = await processAudio(recording.audioUrl);
    
    // Guardar resultados en Google Sheets
    await saveToGoogleSheets(processingResult);
    
    // Actualizar el estado de la grabación en la base de datos
    await updateRecording(id, {
      transcription: processingResult.transcription,
      status: 'completed'
    });
    
    res.json({
      transcription: processingResult.transcription,
      analysis: processingResult.analysis
    });
  } catch (error) {
    console.error('Error al procesar grabación:', error);
    res.status(500).json({ error: 'Error al procesar la grabación' });
  }
};
