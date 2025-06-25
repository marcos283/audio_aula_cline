import { google } from 'googleapis';
import { ProcessingResult } from './audioProcessingService';

// Configuración de Google Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

/**
 * Guarda los resultados del procesamiento de audio en Google Sheets
 * @param result Resultado del procesamiento (transcripción y análisis)
 */
export const saveToGoogleSheets = async (result: ProcessingResult): Promise<void> => {
  try {
    console.log('Iniciando guardado en Google Sheets...');
    
    // Verificar que tenemos un ID de hoja de cálculo
    if (!SPREADSHEET_ID) {
      console.error('Error: ID de Google Sheets no configurado');
      throw new Error('ID de Google Sheets no configurado');
    }
    
    // Verificar que el resultado tiene la estructura esperada
    if (!result.analysis || !result.analysis.students) {
      console.error('Error: El resultado no tiene la estructura esperada');
      throw new Error('El resultado no tiene la estructura esperada');
    }
    
    console.log(`Procesando datos para ${result.analysis.students.length} estudiantes`);
    
    // Autenticar con Google
    console.log('Autenticando con Google...');
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Preparar los datos para guardar
    const rows = prepareRowsFromResult(result);
    console.log(`Preparadas ${rows.length} filas para guardar`);
    
    // Guardar en la hoja de cálculo
    console.log(`Guardando datos en la hoja de cálculo ${SPREADSHEET_ID}...`);
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Notas de Voz!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows
      }
    });
    
    console.log(`Datos guardados correctamente en Google Sheets. Filas actualizadas: ${response.data.updates?.updatedRows || 0}`);
  } catch (error: any) {
    console.error('Error al guardar en Google Sheets:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error.message.includes('authentication')) {
      throw new Error('Error de autenticación con Google Sheets. Verifica las credenciales.');
    } else if (error.code === 404) {
      throw new Error('La hoja de cálculo no existe. Verifica el ID de la hoja.');
    } else if (error.code === 403) {
      throw new Error('No tienes permisos para acceder a la hoja de cálculo. Verifica los permisos.');
    } else if (error.message.includes('range')) {
      throw new Error('Error en el rango especificado. Verifica que la hoja "Notas de Voz" existe.');
    } else {
      throw new Error(`Error al guardar en Google Sheets: ${error.message || 'Error desconocido'}`);
    }
  }
};

/**
 * Obtiene la autenticación para Google API
 * @returns Cliente autenticado
 */
const getGoogleAuth = async () => {
  try {
    // Verificar si tenemos credenciales en variables de entorno
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      console.error('Error: Falta la variable de entorno GOOGLE_CLIENT_EMAIL');
      throw new Error('Falta la variable de entorno GOOGLE_CLIENT_EMAIL');
    }
    
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      console.error('Error: Falta la variable de entorno GOOGLE_PRIVATE_KEY');
      throw new Error('Falta la variable de entorno GOOGLE_PRIVATE_KEY');
    }
    
    console.log(`Creando cliente JWT con email: ${process.env.GOOGLE_CLIENT_EMAIL}`);
    
    // Crear cliente JWT
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: SCOPES
    });
    
    // Verificar que la autenticación funciona
    console.log('Verificando credenciales...');
    await auth.authorize();
    console.log('Credenciales verificadas correctamente');
    
    return auth;
  } catch (error: any) {
    console.error('Error al autenticar con Google:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error.message.includes('invalid_grant')) {
      throw new Error('Credenciales de Google inválidas. Verifica el email y la clave privada.');
    } else if (error.message.includes('private_key')) {
      throw new Error('Formato de clave privada incorrecto. Asegúrate de que está correctamente formateada.');
    } else {
      throw new Error(`Error al autenticar con Google: ${error.message || 'Error desconocido'}`);
    }
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
  
  console.log(`Preparando datos con fecha: ${dateStr} ${timeStr}`);
  
  // Si no hay estudiantes, añadir una fila con la transcripción
  if (result.analysis.students.length === 0) {
    console.log('No se encontraron estudiantes en el análisis. Añadiendo fila con transcripción general.');
    rows.push([
      dateStr,                  // Fecha
      timeStr,                  // Hora
      'General',                // Nombre (General)
      'Transcripción',          // Categoría
      result.transcription,     // Contenido (transcripción completa)
      ''                        // Acciones (vacío)
    ]);
    return rows;
  }
  
  // Procesar cada estudiante
  result.analysis.students.forEach((student, index) => {
    console.log(`Procesando estudiante ${index + 1}: ${student.name}`);
    
    // Validar y limpiar los datos
    const name = student.name || 'Sin nombre';
    const category = student.category || 'Sin categoría';
    const content = student.content || 'Sin contenido';
    const actions = student.actions || '';
    
    rows.push([
      dateStr,      // Fecha
      timeStr,      // Hora
      name,         // Nombre del alumno
      category,     // Categoría
      content,      // Contenido
      actions       // Acciones (si existen)
    ]);
  });
  
  return rows;
};
