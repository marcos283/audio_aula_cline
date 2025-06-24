import express from 'express';
import { 
  getAllRecordings, 
  getRecordingById, 
  createRecording, 
  processRecording 
} from '../controllers/recordingController';

const router = express.Router();

// Ruta para obtener todas las grabaciones
router.get('/', getAllRecordings);

// Ruta para obtener una grabación específica
router.get('/:id', getRecordingById);

// Ruta para crear una nueva grabación
router.post('/', createRecording);

// Ruta para procesar una grabación (transcripción y análisis)
router.post('/process', processRecording);

export const recordingRoutes = router;
