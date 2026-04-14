import React from 'react';
import { format } from 'date-fns';
import { Pin, Trash2, Edit3, Archive, RotateCcw } from 'lucide-react';
import { Note, ViewMode } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface NoteCardProps {
  note: Note;
  viewMode: ViewMode;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onRestore?: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  viewMode,
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

  const isCompact = viewMode === 'compact';
  const isList = viewMode === 'list';
  const isMasonry = viewMode === 'masonry';
  const isCards = viewMode === 'cards';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      onClick={handleCardClick}
      className={cn(
        "group relative flex transition-all duration-200 cursor-pointer",
        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
        "hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md dark:hover:shadow-zinc-900/50",
        note.isPinned && "ring-1 ring-zinc-900 dark:ring-zinc-100",
        (isList || isCompact) ? "flex-row items-center p-3 rounded-xl gap-4" : 
        isCards ? "flex-col p-6 rounded-3xl shadow-sm" :
        "flex-col p-5 rounded-2xl",
        isMasonry && "min-h-[150px]"
      )}
    >
      <div className={cn("flex flex-col flex-grow min-w-0", (isList || isCompact) && "flex-row items-center gap-4")}>
        <div className={cn("flex justify-between items-start", (isList || isCompact) ? "w-auto" : "mb-3")}>
          {!isCompact && (
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              isCards ? "text-zinc-500" : "text-zinc-400 dark:text-zinc-500"
            )}>
              {note.category}
            </span>
          )}
          {!note.isDeleted && !isList && !isCompact && (
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

        <div className={cn("flex-grow min-w-0", (isList || isCompact) && "flex flex-row items-center gap-4 flex-grow")}>
          <h3 className={cn(
            "font-bold text-zinc-900 dark:text-zinc-100 truncate",
            isCompact ? "text-sm w-1/3" : isList ? "text-base w-1/4" : isCards ? "text-xl mb-3" : "text-lg mb-2"
          )}>
            {note.title || "Untitled"}
          </h3>
          
          <p className={cn(
            "text-zinc-600 dark:text-zinc-400",
            isCompact ? "text-xs truncate flex-grow" : 
            isList ? "text-sm truncate flex-grow" : 
            isCards ? "text-base line-clamp-4 mb-8" :
            "text-sm line-clamp-3 mb-6"
          )}>
            {note.content}
          </p>
        </div>
      </div>

      <div className={cn(
        "flex items-center justify-between",
        isList || isCompact ? "w-auto gap-4" : "mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800"
      )}>
        {!isCompact && (
          <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
            {format(note.updatedAt, isList ? 'MMM d' : 'MMM d, h:mm a')}
          </span>
        )}
        
        <div className={cn(
          "flex gap-1 transition-opacity",
          !isList && !isCompact && "opacity-0 group-hover:opacity-100"
        )}>
          {note.isDeleted ? (
            <>
              <button
                onClick={(e) => handleActionClick(e, () => onRestore?.(note.id))}
                className="p-1.5 text-zinc-400 hover:text-green-600 rounded-lg transition-colors"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={(e) => handleActionClick(e, () => onDelete(note.id))}
                className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => handleActionClick(e, () => onToggleArchive(note.id))}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  note.isArchived ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800" : "text-zinc-400 hover:text-zinc-900"
                )}
              >
                <Archive size={14} />
              </button>
              <button
                onClick={(e) => handleActionClick(e, () => onDelete(note.id))}
                className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NoteCard;
