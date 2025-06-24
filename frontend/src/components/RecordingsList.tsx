import React from 'react';
import { RecordingResponse } from '../services/api';

interface RecordingsListProps {
  recordings: RecordingResponse[];
  onPlayRecording: (recording: RecordingResponse) => void;
}

const RecordingsList: React.FC<RecordingsListProps> = ({ recordings, onPlayRecording }) => {
  if (recordings.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay grabaciones disponibles.</p>
        <p className="text-gray-400 text-sm mt-2">Las grabaciones aparecerán aquí una vez que las crees.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <h2 className="text-xl font-semibold p-4 border-b">Grabaciones Recientes</h2>
      <ul className="divide-y divide-gray-200">
        {recordings.map((recording) => (
          <li key={recording.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-gray-900 font-medium">{recording.date}</span>
                  <span className="ml-2 text-sm text-gray-500">({recording.duration})</span>
                  {recording.status === 'processing' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                      Procesando
                    </span>
                  )}
                  {recording.status === 'error' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                      Error
                    </span>
                  )}
                </div>
                {recording.transcription && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{recording.transcription}</p>
                )}
              </div>
              <button
                onClick={() => onPlayRecording(recording)}
                className="ml-4 p-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                disabled={recording.status === 'processing'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecordingsList;
