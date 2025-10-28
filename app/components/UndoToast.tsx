'use client';
import { Patient } from '../types';

interface Props {
  deletedBackup: Patient[];
  singleDeleted: Patient | null;
  countdown: number;
  formatSeconds: (s: number) => string;
  undoDeleteAll: () => void;
  undoSingleDelete: () => void;
  clearUndo: () => void;
}

export default function UndoToast({
  deletedBackup,
  singleDeleted,
  countdown,
  formatSeconds,
  undoDeleteAll,
  undoSingleDelete,
  clearUndo
}: Props) {
  return (
    <>
      {deletedBackup.length > 0 && (
        <div className="fixed left-4 bottom-4 z-50 bg-[#0f172a] border border-gray-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-4">
          <div>
            <div className="text-sm text-yellow-400 font-semibold">Deleted all patients</div>
            <div className="text-xs text-gray-300">Undo available for {formatSeconds(countdown)}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={undoDeleteAll} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-md text-sm">Undo</button>
            <button onClick={clearUndo} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm">Dismiss</button>
          </div>
        </div>
      )}

      {singleDeleted && (
        <div className="fixed right-4 bottom-4 z-50 bg-[#0f172a] border border-gray-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-4">
          <div>
            <div className="text-sm text-yellow-400 font-semibold">Patient deleted</div>
            <div className="text-xs text-gray-300">Undo available for {formatSeconds(countdown)}</div>
          </div>
          <button onClick={undoSingleDelete} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-md text-sm">Undo</button>
        </div>
      )}
    </>
  );
}
