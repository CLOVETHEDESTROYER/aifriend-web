import React, { useState } from 'react';
import { PageContainer } from '../components/Layout/PageContainer';

// Temporary mock data until we have real transcripts
interface CallNote {
  id: string;
  phoneNumber: string;
  date: string;
  transcript: string;
}

const mockNotes: CallNote[] = [
  {
    id: '1',
    phoneNumber: '(555) 123-4567',
    date: '2024-03-20 14:30',
    transcript: 'This is a sample transcript for the first call...'
  },
  {
    id: '2',
    phoneNumber: '(555) 234-5678',
    date: '2024-03-19 15:45',
    transcript: 'Another sample transcript for the second call...'
  },
  // Add more mock data as needed
];

export const CallNotes: React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<CallNote | null>(null);

  return (
    <PageContainer>
      <div className="border-b border-border-light dark:border-border-dark px-6 pb-6 pt-4">
        <h1 className="text-2xl font-semibold text-text-light dark:text-text-dark">
          Call Notes
        </h1>
      </div>

      <div className="flex h-[calc(100vh-12rem)]">
        {/* Sidebar */}
        <div className="w-80 border-r border-border-light dark:border-border-dark p-4 overflow-y-auto">
          <div className="space-y-2">
            {mockNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedNote?.id === note.id
                    ? 'bg-accent/10 text-accent'
                    : 'hover:bg-background-dark/5 dark:hover:bg-background-light/5'
                }`}
              >
                <div className="font-medium">{note.phoneNumber}</div>
                <div className="text-sm text-text-light/60 dark:text-text-dark/60">
                  {note.date}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedNote ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">
                    {selectedNote.phoneNumber}
                  </h2>
                  <p className="text-sm text-text-light/60 dark:text-text-dark/60">
                    {selectedNote.date}
                  </p>
                </div>
              </div>
              <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{selectedNote.transcript}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-text-light/60 dark:text-text-dark/60">
              Select a call from the sidebar to view its transcript
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}; 