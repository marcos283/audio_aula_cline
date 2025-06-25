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
    console.log(`Iniciando procesamiento de audio: ${audioUrl}`);
    
    // Verificar que la URL es válida
    if (!audioUrl || !audioUrl.startsWith('http')) {
      console.error('Error: URL de audio inválida');
      throw new Error('URL de audio inválida');
    }
    
    // Verificar que la API key de OpenAI está configurada
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: API key de OpenAI no configurada');
      throw new Error('API key de OpenAI no configurada');
    }
    
    console.log('Descargando archivo de audio...');
    // Descargar el archivo de audio
    const audioFilePath = await downloadAudio(audioUrl);
    console.log(`Archivo descargado en: ${audioFilePath}`);
    
    console.log('Transcribiendo audio...');
    // Transcribir el audio
    const transcription = await transcribeAudio(audioFilePath);
    console.log(`Transcripción completada (${transcription.length} caracteres)`);
    
    console.log('Analizando transcripción...');
    // Analizar la transcripción
    const analysis = await analyzeTranscription(transcription);
    console.log(`Análisis completado. Se identificaron ${analysis.students.length} estudiantes`);
    
    // Eliminar el archivo temporal
    fs.unlinkSync(audioFilePath);
    console.log('Archivo temporal eliminado');
    
    return {
      transcription,
      analysis
    };
  } catch (error: any) {
    console.error('Error al procesar el audio:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error.message.includes('download')) {
      throw new Error(`Error al descargar el audio: ${error.message}`);
    } else if (error.message.includes('transcribe')) {
      throw new Error(`Error al transcribir el audio: ${error.message}`);
    } else if (error.message.includes('analizar')) {
      throw new Error(`Error al analizar la transcripción: ${error.message}`);
    } else {
      throw new Error(`Error al procesar el audio: ${error.message || 'Error desconocido'}`);
    }
  }
};

/**
 * Descarga un archivo de audio desde una URL
 * @param url URL del archivo de audio
 * @returns Ruta local del archivo descargado
 */
const downloadAudio = async (url: string): Promise<string> => {
  try {
    console.log(`Descargando audio desde: ${url}`);
    
    // Configurar timeout y reintentos
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream',
      timeout: 30000, // 30 segundos de timeout
      maxContentLength: 50 * 1024 * 1024, // 50MB máximo
      validateStatus: (status) => status >= 200 && status < 300
    });
    
    // Verificar el tipo de contenido
    const contentType = response.headers['content-type'];
    if (contentType && !contentType.includes('audio/')) {
      console.warn(`Advertencia: El tipo de contenido no es audio (${contentType})`);
    }
    
    // Crear directorio temporal si no existe
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const fileName = `temp_${Date.now()}.wav`;
    const filePath = path.join(tempDir, fileName);
    
    console.log(`Guardando archivo en: ${filePath}`);
    
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        // Verificar que el archivo se creó correctamente
        if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
          console.log(`Archivo descargado correctamente (${fs.statSync(filePath).size} bytes)`);
          resolve(filePath);
        } else {
          const error = new Error('El archivo descargado está vacío o no se creó correctamente');
          console.error(error.message);
          reject(error);
        }
      });
      writer.on('error', (err) => {
        console.error(`Error al escribir el archivo: ${err.message}`);
        reject(err);
      });
    });
  } catch (error: any) {
    console.error('Error al descargar el audio:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout al descargar el audio');
    } else if (error.response) {
      throw new Error(`Error al descargar el audio: Código de estado ${error.response.status}`);
    } else if (error.request) {
      throw new Error('Error al descargar el audio: No se recibió respuesta del servidor');
    } else {
      throw new Error(`Error al descargar el audio: ${error.message || 'Error desconocido'}`);
    }
  }
};

/**
 * Transcribe un archivo de audio usando OpenAI Whisper
 * @param filePath Ruta local del archivo de audio
 * @returns Texto transcrito
 */
const transcribeAudio = async (filePath: string): Promise<string> => {
  try {
    console.log(`Transcribiendo archivo: ${filePath}`);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`Error: El archivo ${filePath} no existe`);
      throw new Error(`El archivo ${filePath} no existe`);
    }
    
    // Verificar el tamaño del archivo
    const stats = fs.statSync(filePath);
    console.log(`Tamaño del archivo a transcribir: ${stats.size} bytes`);
    
    if (stats.size === 0) {
      console.error('Error: El archivo de audio está vacío');
      throw new Error('El archivo de audio está vacío');
    }
    
    if (stats.size > 25 * 1024 * 1024) {
      console.error('Error: El archivo de audio excede el límite de 25MB de Whisper');
      throw new Error('El archivo de audio excede el límite de 25MB de Whisper');
    }
    
    // Crear stream de lectura
    const fileStream = fs.createReadStream(filePath);
    
    // Llamar a la API de OpenAI
    console.log('Enviando archivo a OpenAI Whisper...');
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      language: 'es',
    });
    
    console.log('Transcripción recibida de OpenAI');
    
    if (!transcription.text || transcription.text.trim() === '') {
      console.warn('Advertencia: La transcripción está vacía');
    }
    
    return transcription.text;
  } catch (error: any) {
    console.error('Error al transcribir el audio:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error.response?.status === 401) {
      throw new Error('Error al transcribir el audio: API key de OpenAI inválida');
    } else if (error.response?.status === 429) {
      throw new Error('Error al transcribir el audio: Límite de rate de OpenAI excedido');
    } else if (error.response?.data?.error) {
      throw new Error(`Error al transcribir el audio: ${error.response.data.error.message}`);
    } else {
      throw new Error(`Error al transcribir el audio: ${error.message || 'Error desconocido'}`);
    }
  }
};

/**
 * Analiza una transcripción para identificar alumnos y categorizar la información
 * @param transcription Texto transcrito a analizar
 * @returns Análisis estructurado de la transcripción
 */
const analyzeTranscription = async (transcription: string): Promise<ProcessingResult['analysis']> => {
  try {
    console.log('Analizando transcripción con GPT-4...');
    
    // Verificar que la transcripción no está vacía
    if (!transcription || transcription.trim() === '') {
      console.error('Error: La transcripción está vacía');
      throw new Error('La transcripción está vacía');
    }
    
    // Limitar la longitud de la transcripción si es muy larga
    const maxLength = 4000; // Aproximadamente 1000 tokens
    let trimmedTranscription = transcription;
    if (transcription.length > maxLength) {
      console.warn(`Advertencia: Transcripción truncada de ${transcription.length} a ${maxLength} caracteres`);
      trimmedTranscription = transcription.substring(0, maxLength) + '...';
    }
    
    const prompt = `
      Analiza la siguiente nota de voz de un profesor y extrae información sobre los alumnos mencionados.
      Para cada alumno, identifica:
      1. Nombre del alumno
      2. Contenido relacionado con el alumno
      3. Categoría (académico, comportamiento, asistencia, etc.)
      4. Acciones recomendadas (opcional)
      
      Transcripción: "${trimmedTranscription}"
      
      Devuelve el resultado en formato JSON con la siguiente estructura exacta:
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
      
      Si no se menciona ningún alumno, devuelve un array vacío de students.
      Asegúrate de que el resultado sea un JSON válido.
    `;
    
    console.log('Enviando solicitud a OpenAI GPT-4...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Eres un asistente especializado en analizar notas de voz de profesores y extraer información estructurada sobre los alumnos mencionados.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }, // Solicitar formato JSON
    });
    
    console.log('Respuesta recibida de OpenAI GPT-4');
    
    const content = response.choices[0].message.content;
    if (!content) {
      console.error('Error: No se recibió respuesta del análisis');
      throw new Error('No se recibió respuesta del análisis');
    }
    
    try {
      // Intentar parsear directamente el contenido como JSON
      const result = JSON.parse(content);
      
      // Verificar que el resultado tiene la estructura esperada
      if (!result.students || !Array.isArray(result.students)) {
        console.error('Error: El resultado no tiene la estructura esperada');
        throw new Error('El resultado no tiene la estructura esperada');
      }
      
      console.log(`Análisis completado. Se identificaron ${result.students.length} estudiantes`);
      return result;
    } catch (parseError) {
      console.error('Error al parsear el JSON:', parseError);
      
      // Intentar extraer el JSON de la respuesta si el parseo directo falló
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Error: No se pudo extraer JSON de la respuesta');
        throw new Error('No se pudo extraer JSON de la respuesta');
      }
      
      try {
        const extractedResult = JSON.parse(jsonMatch[0]);
        console.log(`Análisis completado (extracción). Se identificaron ${extractedResult.students.length} estudiantes`);
        return extractedResult;
      } catch (extractError) {
        console.error('Error al parsear el JSON extraído:', extractError);
        throw new Error('No se pudo parsear el JSON extraído de la respuesta');
      }
    }
  } catch (error: any) {
    console.error('Error al analizar la transcripción:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error.response?.status === 401) {
      throw new Error('Error al analizar la transcripción: API key de OpenAI inválida');
    } else if (error.response?.status === 429) {
      throw new Error('Error al analizar la transcripción: Límite de rate de OpenAI excedido');
    } else if (error.response?.data?.error) {
      throw new Error(`Error al analizar la transcripción: ${error.response.data.error.message}`);
    } else {
      throw new Error(`Error al analizar la transcripción: ${error.message || 'Error desconocido'}`);
    }
  }
};
