import React, { useState } from 'react';
import { RecordingResponse, ProcessingResult } from '../services/api';

interface RecordingsListProps {
  recordings: RecordingResponse[];
  onPlayRecording: (recording: RecordingResponse) => void;
  onRefresh?: () => void;
}

interface AnalysisDetailsProps {
  analysis: ProcessingResult['analysis'];
  onClose: () => void;
}

// Componente para mostrar los detalles del análisis
const AnalysisDetails: React.FC<AnalysisDetailsProps> = ({ analysis, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Detalles del Análisis</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {analysis.students.length === 0 ? (
            <p className="text-gray-500">No se encontraron estudiantes en esta grabación.</p>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Estudiantes mencionados:</h4>
              {analysis.students.map((student, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-800">{student.name}</span>
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {student.category}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{student.content}</p>
                  {student.actions && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-700">Acciones recomendadas:</span>
                      <p className="text-sm text-gray-600 mt-1">{student.actions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const RecordingsList: React.FC<RecordingsListProps> = ({ recordings, onPlayRecording, onRefresh }) => {
  const [selectedRecording, setSelectedRecording] = useState<RecordingResponse | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  if (recordings.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay grabaciones disponibles.</p>
        <p className="text-gray-400 text-sm mt-2">Las grabaciones aparecerán aquí una vez que las crees.</p>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Actualizar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Grabaciones Recientes</h2>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
            title="Actualizar grabaciones"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
      <ul className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
        {recordings.map((recording) => (
          <li key={recording.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-gray-900 font-medium">{recording.date}</span>
                  <span className="ml-2 text-sm text-gray-500">({recording.duration})</span>
                  {recording.status === 'processing' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                      Procesando
                    </span>
                  )}
                  {recording.status === 'completed' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Completado
                    </span>
                  )}
                  {recording.status === 'error' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                      Error
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  {recording.status === 'completed' && (
                    <button
                      onClick={() => {
                        setSelectedRecording(recording);
                        setShowAnalysis(true);
                      }}
                      className="p-2 text-green-600 hover:text-green-800 focus:outline-none"
                      title="Ver análisis"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => onPlayRecording(recording)}
                    className="p-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                    disabled={recording.status === 'processing'}
                    title="Reproducir grabación"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              {recording.transcription && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 line-clamp-2">{recording.transcription}</p>
                  {recording.transcription.length > 150 && (
                    <button 
                      onClick={() => {
                        setSelectedRecording(recording);
                        setShowAnalysis(true);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1 focus:outline-none"
                    >
                      Ver más...
                    </button>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Modal para mostrar detalles del análisis */}
      {showAnalysis && selectedRecording && selectedRecording.status === 'completed' && (
        <AnalysisDetails 
          analysis={{
            students: selectedRecording.transcription 
              ? [{ 
                  name: "Análisis pendiente", 
                  content: selectedRecording.transcription, 
                  category: "Transcripción" 
                }] 
              : []
          }} 
          onClose={() => {
            setShowAnalysis(false);
            setSelectedRecording(null);
          }} 
        />
      )}
    </div>
  );
};

export default RecordingsList;
