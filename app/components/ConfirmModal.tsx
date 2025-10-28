'use client';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({ open, onClose, onConfirm }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#0b1020] rounded-xl p-6 w-[90%] max-w-md text-center shadow-xl border border-gray-700">
        <h3 className="text-xl font-semibold text-red-400 mb-3">Confirm Delete All</h3>
        <p className="text-sm text-gray-300 mb-6">
          This will permanently delete all patients. Undo available for 10 minutes. Continue?
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={onConfirm} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-semibold">
            Yes, delete all
          </button>
          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
