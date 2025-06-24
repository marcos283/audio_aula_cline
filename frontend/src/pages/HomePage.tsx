import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import AudioRecorder from '../components/AudioRecorder';
import RecordingsList from '../components/RecordingsList';
import ProcessingStatus from '../components/ProcessingStatus';
import { recordingsApi, RecordingResponse } from '../services/api';

type ProcessingStage = 'uploading' | 'transcribing' | 'analyzing' | 'saving' | 'completed' | 'error';

interface ProcessingState {
  isProcessing: boolean;
  stage: ProcessingStage;
  progress?: number;
  error?: string;
}

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [recordings, setRecordings] = useState<RecordingResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    stage: 'uploading',
  });

  // Cargar grabaciones al montar el componente
  useEffect(() => {
    fetchRecordings();
  }, []);

  // Función para cargar las grabaciones
  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const data = await recordingsApi.getAll();
      setRecordings(data);
    } catch (error) {
      console.error('Error al cargar las grabaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la grabación completada
  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      // Iniciar estado de procesamiento
      setProcessingState({
        isProcessing: true,
        stage: 'uploading',
        progress: 0,
      });

      // Simular progreso de carga
      const uploadInterval = setInterval(() => {
        setProcessingState(prev => ({
          ...prev,
          progress: prev.progress && prev.progress < 90 ? prev.progress + 10 : prev.progress,
        }));
      }, 300);

      // Subir la grabación
      const recordingResponse = await recordingsApi.upload(audioBlob);
      clearInterval(uploadInterval);

      // Actualizar estado a transcripción
      setProcessingState({
        isProcessing: true,
        stage: 'transcribing',
        progress: 0,
      });

      // Simular progreso de transcripción
      const transcribeInterval = setInterval(() => {
        setProcessingState(prev => ({
          ...prev,
          progress: prev.progress && prev.progress < 90 ? prev.progress + 5 : prev.progress,
        }));
      }, 500);

      // Procesar la grabación
      await recordingsApi.process(recordingResponse.id);
      clearInterval(transcribeInterval);

      // Actualizar estado a análisis
      setProcessingState({
        isProcessing: true,
        stage: 'analyzing',
        progress: 0,
      });

      // Simular progreso de análisis
      const analyzeInterval = setInterval(() => {
        setProcessingState(prev => ({
          ...prev,
          progress: prev.progress && prev.progress < 90 ? prev.progress + 10 : prev.progress,
        }));
      }, 400);

      // Simular tiempo de análisis
      setTimeout(() => {
        clearInterval(analyzeInterval);
        
        // Actualizar estado a guardado
        setProcessingState({
          isProcessing: true,
          stage: 'saving',
          progress: 0,
        });

        // Simular progreso de guardado
        const saveInterval = setInterval(() => {
          setProcessingState(prev => ({
            ...prev,
            progress: prev.progress && prev.progress < 90 ? prev.progress + 15 : prev.progress,
          }));
        }, 300);

        // Simular tiempo de guardado
        setTimeout(() => {
          clearInterval(saveInterval);
          
          // Completar el procesamiento
          setProcessingState({
            isProcessing: true,
            stage: 'completed',
          });

          // Recargar las grabaciones
          fetchRecordings();

          // Resetear el estado después de un tiempo
          setTimeout(() => {
            setProcessingState({
              isProcessing: false,
              stage: 'uploading',
            });
          }, 3000);
        }, 2000);
      }, 3000);

    } catch (error) {
      console.error('Error al procesar la grabación:', error);
      setProcessingState({
        isProcessing: true,
        stage: 'error',
        error: 'Ha ocurrido un error al procesar la grabación. Por favor, inténtalo de nuevo.',
      });

      // Resetear el estado de error después de un tiempo
      setTimeout(() => {
        setProcessingState({
          isProcessing: false,
          stage: 'uploading',
        });
      }, 5000);
    }
  };

  // Función para reproducir una grabación
  const handlePlayRecording = (recording: RecordingResponse) => {
    const audio = new Audio(recording.audioUrl);
    audio.play();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header 
        isAuthenticated={!!user} 
        userName={user?.displayName || ''} 
        onLogout={logout} 
      />

      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda: Grabador de audio */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Grabar Nota de Voz</h2>
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />

            {/* Mostrar estado de procesamiento si está procesando */}
            {processingState.isProcessing && (
              <div className="mt-6">
                <ProcessingStatus 
                  stage={processingState.stage} 
                  progress={processingState.progress} 
                  error={processingState.error} 
                />
              </div>
            )}
          </div>

          {/* Columna derecha: Lista de grabaciones */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Grabaciones Recientes</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <RecordingsList 
                recordings={recordings} 
                onPlayRecording={handlePlayRecording} 
              />
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white py-4 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Audio Aula &copy; {new Date().getFullYear()} - Aplicación para profesores</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
