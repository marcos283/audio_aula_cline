import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Tipos
export interface ProcessingResult {
  transcription: string;
  analysis: {
    students: {
      name: string;
      content: string;
      category: string;
      actions?: string;
    }[];
  };
}

/**
 * Procesa un archivo de audio: transcribe y analiza su contenido
 * @param audioUrl URL del archivo de audio a procesar
 * @returns Resultado del procesamiento (transcripción y análisis)
 */
export const processAudio = async (audioUrl: string): Promise<ProcessingResult> => {
  try {
    // Descargar el archivo de audio
    const audioFilePath = await downloadAudio(audioUrl);
    
    // Transcribir el audio
    const transcription = await transcribeAudio(audioFilePath);
    
    // Analizar la transcripción
    const analysis = await analyzeTranscription(transcription);
    
    // Eliminar el archivo temporal
    fs.unlinkSync(audioFilePath);
    
    return {
      transcription,
      analysis
    };
  } catch (error) {
    console.error('Error al procesar el audio:', error);
    throw new Error('Error al procesar el audio');
  }
};

/**
 * Descarga un archivo de audio desde una URL
 * @param url URL del archivo de audio
 * @returns Ruta local del archivo descargado
 */
const downloadAudio = async (url: string): Promise<string> => {
  try {
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream'
    });
    
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const fileName = `temp_${Date.now()}.wav`;
    const filePath = path.join(tempDir, fileName);
    
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error al descargar el audio:', error);
    throw new Error('Error al descargar el audio');
  }
};

/**
 * Transcribe un archivo de audio usando OpenAI Whisper
 * @param filePath Ruta local del archivo de audio
 * @returns Texto transcrito
 */
const transcribeAudio = async (filePath: string): Promise<string> => {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      language: 'es',
    });
    
    return transcription.text;
  } catch (error) {
    console.error('Error al transcribir el audio:', error);
    throw new Error('Error al transcribir el audio');
  }
};

/**
 * Analiza una transcripción para identificar alumnos y categorizar la información
 * @param transcription Texto transcrito a analizar
 * @returns Análisis estructurado de la transcripción
 */
const analyzeTranscription = async (transcription: string): Promise<ProcessingResult['analysis']> => {
  try {
    const prompt = `
      Analiza la siguiente nota de voz de un profesor y extrae información sobre los alumnos mencionados.
      Para cada alumno, identifica:
      1. Nombre del alumno
      2. Contenido relacionado con el alumno
      3. Categoría (académico, comportamiento, asistencia, etc.)
      4. Acciones recomendadas (opcional)
      
      Transcripción: "${transcription}"
      
      Devuelve el resultado en formato JSON con la siguiente estructura:
      {
        "students": [
          {
            "name": "Nombre del alumno",
            "content": "Contenido relacionado con el alumno",
            "category": "Categoría",
            "actions": "Acciones recomendadas (si las hay)"
          }
        ]
      }
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Eres un asistente especializado en analizar notas de voz de profesores y extraer información estructurada sobre los alumnos mencionados.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No se recibió respuesta del análisis');
    }
    
    // Extraer el JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error al analizar la transcripción:', error);
    throw new Error('Error al analizar la transcripción');
  }
};
