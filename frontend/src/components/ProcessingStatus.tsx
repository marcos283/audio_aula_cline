import React from 'react';

type ProcessingStage = 'uploading' | 'transcribing' | 'analyzing' | 'saving' | 'completed' | 'error';

interface ProcessingStatusProps {
  stage: ProcessingStage;
  progress?: number;
  error?: string;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ stage, progress, error }) => {
  const getStageInfo = (currentStage: ProcessingStage) => {
    switch (currentStage) {
      case 'uploading':
        return {
          title: 'Subiendo audio',
          description: 'Enviando la grabación al servidor...',
          color: 'blue'
        };
      case 'transcribing':
        return {
          title: 'Transcribiendo',
          description: 'Convirtiendo audio a texto con Whisper...',
          color: 'indigo'
        };
      case 'analyzing':
        return {
          title: 'Analizando contenido',
          description: 'Identificando alumnos y categorizando la información...',
          color: 'purple'
        };
      case 'saving':
        return {
          title: 'Guardando resultados',
          description: 'Almacenando en Google Sheets...',
          color: 'green'
        };
      case 'completed':
        return {
          title: '¡Procesamiento completado!',
          description: 'La nota de voz ha sido procesada y almacenada correctamente.',
          color: 'green'
        };
      case 'error':
        return {
          title: 'Error en el procesamiento',
          description: error || 'Ha ocurrido un error durante el procesamiento.',
          color: 'red'
        };
      default:
        return {
          title: 'Procesando',
          description: 'Procesando la grabación...',
          color: 'gray'
        };
    }
  };

  const { title, description, color } = getStageInfo(stage);
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-1">{description}</p>
      
      {progress !== undefined && stage !== 'completed' && stage !== 'error' && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${color === 'gray' ? 'bg-gray-600' : `bg-${color}-600`}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-right text-sm mt-1">{progress}%</p>
        </div>
      )}

      {stage === 'completed' && (
        <div className="mt-3 flex items-center text-green-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Procesado correctamente</span>
        </div>
      )}

      {stage === 'error' && (
        <div className="mt-3 flex items-center text-red-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Error en el procesamiento</span>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;
