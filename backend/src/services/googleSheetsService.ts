import { google } from 'googleapis';
import { ProcessingResult } from './audioProcessingService';

// Configuración de Google Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

/**
 * Guarda los resultados del procesamiento de audio en Google Sheets
 * @param result Resultado del procesamiento (transcripción y análisis)
 */
export const saveToGoogleSheets = async (result: ProcessingResult): Promise<void> => {
  try {
    // Autenticar con Google
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Preparar los datos para guardar
    const rows = prepareRowsFromResult(result);
    
    // Guardar en la hoja de cálculo
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Notas de Voz!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows
      }
    });
    
    console.log('Datos guardados correctamente en Google Sheets');
  } catch (error) {
    console.error('Error al guardar en Google Sheets:', error);
    throw new Error('Error al guardar en Google Sheets');
  }
};

/**
 * Obtiene la autenticación para Google API
 * @returns Cliente autenticado
 */
const getGoogleAuth = async () => {
  try {
    // Verificar si tenemos credenciales en variables de entorno
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('Faltan credenciales de Google Service Account');
    }
    
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: SCOPES
    });
    
    return auth;
  } catch (error) {
    console.error('Error al autenticar con Google:', error);
    throw new Error('Error al autenticar con Google');
  }
};

/**
 * Prepara las filas para guardar en Google Sheets
 * @param result Resultado del procesamiento
 * @returns Filas formateadas para Google Sheets
 */
const prepareRowsFromResult = (result: ProcessingResult): string[][] => {
  const rows: string[][] = [];
  
  // Fecha actual
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES');
  const timeStr = now.toLocaleTimeString('es-ES');
  
  // Procesar cada estudiante
  result.analysis.students.forEach(student => {
    rows.push([
      dateStr,                  // Fecha
      timeStr,                  // Hora
      student.name,             // Nombre del alumno
      student.category,         // Categoría
      student.content,          // Contenido
      student.actions || ''     // Acciones (si existen)
    ]);
  });
  
  return rows;
};
