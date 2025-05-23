
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md'; // Added size prop
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClass = size === 'sm' ? 'max-w-sm' : 'max-w-md';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full ${sizeClass} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
