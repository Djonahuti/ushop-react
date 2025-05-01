import { X } from 'lucide-react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="myBox rounded-lg shadow-lg p-6 w-full max-w-lg">
        <button
          className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-2 rounded-full"
          onClick={onClose}
        >
          <X />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;