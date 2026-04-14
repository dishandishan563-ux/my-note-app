import { Note } from '../types';

const STORAGE_KEY = 'minimalist_notes_data';

export const storage = {
  getNotes: (): Note[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse notes from localStorage', e);
      return [];
    }
  },

  saveNotes: (notes: Note[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },

  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'isDeleted'>): Note => {
    const notes = storage.getNotes();
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      isArchived: false,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    storage.saveNotes([newNote, ...notes]);
    return newNote;
  },

  updateNote: (id: string, updates: Partial<Note>): Note | null => {
    const notes = storage.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return null;

    const updatedNote = {
      ...notes[index],
      ...updates,
      updatedAt: Date.now(),
    };
    notes[index] = updatedNote;
    storage.saveNotes(notes);
    return updatedNote;
  },

  deleteNote: (id: string) => {
    const notes = storage.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return;
    
    if (notes[index].isDeleted) {
      // Permanent delete
      const filtered = notes.filter(n => n.id !== id);
      storage.saveNotes(filtered);
    } else {
      // Move to trash
      notes[index].isDeleted = true;
      notes[index].isPinned = false;
      notes[index].updatedAt = Date.now();
      storage.saveNotes(notes);
    }
  },

  restoreNote: (id: string) => {
    const notes = storage.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return;
    notes[index].isDeleted = false;
    notes[index].updatedAt = Date.now();
    storage.saveNotes(notes);
  },

  toggleArchive: (id: string) => {
    const notes = storage.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return;
    notes[index].isArchived = !notes[index].isArchived;
    if (notes[index].isArchived) notes[index].isPinned = false;
    notes[index].updatedAt = Date.now();
    storage.saveNotes(notes);
  },

  togglePin: (id: string) => {
    const notes = storage.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return;
    notes[index].isPinned = !notes[index].isPinned;
    if (notes[index].isPinned) notes[index].isArchived = false;
    notes[index].updatedAt = Date.now();
    storage.saveNotes(notes);
  }
};
