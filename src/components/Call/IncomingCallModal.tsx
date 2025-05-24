import React from 'react';
import { Dialog } from '@headlessui/react';
import { PhoneIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface IncomingCallModalProps {
  isOpen: boolean;
  scenarioId: string;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  scenarioId,
  onAccept,
  onReject,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={() => {}}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed bottom-4 right-4">
        <Dialog.Panel className="rounded-lg bg-white p-4 shadow-xl w-64">
          <div className="flex flex-col items-center space-y-2">
            <div className="rounded-full bg-blue-100 p-1">
              <PhoneIcon className="h-3 w-3 text-blue-600" />
            </div>

            <Dialog.Title className="text-sm font-medium">
              Incoming Call
            </Dialog.Title>

            <Dialog.Description className="text-xs text-gray-500">
              Scenario ID: {scenarioId}
            </Dialog.Description>

            <div className="flex space-x-2">
              <button
                onClick={onAccept}
                className="rounded-md bg-green-600 px-2 py-1 text-white hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-1 text-xs flex items-center"
              >
                <PhoneIcon className="h-3 w-3" />
                <span className="ml-1">Accept</span>
              </button>

              <button
                onClick={onReject}
                className="rounded-md bg-red-600 px-2 py-1 text-white hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 focus:ring-offset-1 text-xs flex items-center"
              >
                <XMarkIcon className="h-3 w-3" />
                <span className="ml-1">Reject</span>
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 