import React from 'react';
import { format } from 'date-fns';
import { Pin, Trash2, Edit3, Archive, RotateCcw } from 'lucide-react';
import { Note } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onRestore?: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onEdit, 
  onDelete, 
  onTogglePin, 
  onToggleArchive,
  onRestore 
}) => {
  const handleCardClick = () => {
    if (!note.isDeleted) {
      onEdit(note);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col p-5 rounded-2xl border transition-all duration-300 cursor-pointer",
        "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
        "hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none",
        note.isPinned && "ring-2 ring-zinc-900 dark:ring-zinc-100"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          {note.category}
        </span>
        {!note.isDeleted && (
          <button
            onClick={(e) => handleActionClick(e, () => onTogglePin(note.id))}
            className={cn(
              "p-1.5 rounded-full transition-colors",
              note.isPinned 
                ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800" 
                : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            )}
          >
            <Pin size={14} className={note.isPinned ? "fill-current" : ""} />
          </button>
        )}
      </div>

      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-1">
        {note.title || "Untitled Note"}
      </h3>
      
      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-4 mb-6 flex-grow leading-relaxed">
        {note.content}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
          {format(note.updatedAt, 'MMM d, h:mm a')}
        </span>
        
        <div className="flex gap-1 transition-opacity">
          {note.isDeleted ? (
            <>
              <button
                onClick={(e) => handleActionClick(e, () => onRestore?.(note.id))}
                className="p-2 text-zinc-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="Restore"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={(e) => handleActionClick(e, () => onDelete(note.id))}
                className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete Permanently"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => handleActionClick(e, () => onEdit(note))}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={(e) => handleActionClick(e, () => onToggleArchive(note.id))}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  note.isArchived 
                    ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800" 
                    : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
                title={note.isArchived ? "Unarchive" : "Archive"}
              >
                <Archive size={16} />
              </button>
              <button
                onClick={(e) => handleActionClick(e, () => onDelete(note.id))}
                className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Move to Trash"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NoteCard;
