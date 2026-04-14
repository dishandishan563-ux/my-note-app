/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Moon, Sun, StickyNote, Archive, Trash2, Pin, LayoutGrid, Menu, X as CloseIcon, List, Columns } from 'lucide-react';
import { Note, Category, NavTab, CATEGORIES, ViewMode } from './types';
import { storage } from './lib/storage';
import NoteCard from './components/NoteCard';
import NoteModal from './components/NoteModal';
import SearchBar from './components/SearchBar';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [activeTab, setActiveTab] = useState<NavTab>('All');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('viewMode') as ViewMode) || 'grid';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(pre-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    setNotes(storage.getNotes());
  }, []);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const matchesSearch = 
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
        
        let matchesTab = true;
        if (activeTab === 'All') matchesTab = !note.isArchived && !note.isDeleted;
        else if (activeTab === 'Pinned') matchesTab = note.isPinned && !note.isDeleted;
        else if (activeTab === 'Archived') matchesTab = note.isArchived && !note.isDeleted;
        else if (activeTab === 'Trash') matchesTab = note.isDeleted;

        return matchesSearch && matchesCategory && matchesTab;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
  }, [notes, searchQuery, selectedCategory, activeTab]);

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'isDeleted'>) => {
    if (editingNote) {
      storage.updateNote(editingNote.id, noteData);
    } else {
      storage.addNote(noteData);
    }
    setNotes(storage.getNotes());
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    storage.deleteNote(id);
    setNotes(storage.getNotes());
  };

  const handleTogglePin = (id: string) => {
    storage.togglePin(id);
    setNotes(storage.getNotes());
  };

  const handleToggleArchive = (id: string) => {
    storage.toggleArchive(id);
    setNotes(storage.getNotes());
  };

  const handleRestoreNote = (id: string) => {
    storage.restoreNote(id);
    setNotes(storage.getNotes());
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const navItems = [
    { id: 'All', icon: LayoutGrid, label: 'All Notes' },
    { id: 'Pinned', icon: Pin, label: 'Pinned' },
    { id: 'Archived', icon: Archive, label: 'Archived' },
    { id: 'Trash', icon: Trash2, label: 'Trash' },
  ];

  const viewModes = [
    { id: 'grid', icon: LayoutGrid, label: 'Grid' },
    { id: 'list', icon: List, label: 'List' },
    { id: 'compact', icon: Columns, label: 'Compact' },
    { id: 'masonry', icon: StickyNote, label: 'Masonry' },
    { id: 'cards', icon: LayoutGrid, label: 'Cards' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 flex">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:block",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-zinc-900 dark:bg-zinc-100 rounded-xl">
              <StickyNote className="text-white dark:text-zinc-900" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100">
                SMART NOTES
              </h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Efficiency First</p>
            </div>
          </div>

          <nav className="space-y-1 flex-grow overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as NavTab);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                  activeTab === item.id
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-lg shadow-zinc-200 dark:shadow-none"
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}

            <div className="pt-8 pb-4">
              <span className="px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Categories</span>
            </div>
            
            <button
              onClick={() => setSelectedCategory('All')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                selectedCategory === 'All' ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full", selectedCategory === 'All' ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700")} />
              All Categories
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  selectedCategory === cat ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", selectedCategory === cat ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700")} />
                {cat}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="grid grid-cols-5 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              {viewModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as ViewMode)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === mode.id 
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  )}
                  title={mode.label}
                >
                  <mode.icon size={14} className="mx-auto" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center justify-between px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </div>
              <div className={cn(
                "w-10 h-5 rounded-full relative transition-colors duration-300",
                isDarkMode ? "bg-zinc-100" : "bg-zinc-900"
              )}>
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full transition-all duration-300",
                  isDarkMode ? "right-1 bg-zinc-900" : "left-1 bg-zinc-100"
                )} />
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>

            <div className="flex-grow max-w-xl">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            <div className="hidden sm:block">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {activeTab} {selectedCategory !== 'All' && `• ${selectedCategory}`}
              </h2>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {filteredNotes.length > 0 ? (
            <div className={cn(
              "grid gap-4",
              viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : 
              viewMode === 'masonry' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" :
              viewMode === 'cards' ? "grid-cols-1 md:grid-cols-2 gap-8" :
              "grid-cols-1"
            )}>
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    viewMode={viewMode}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                    onToggleArchive={handleToggleArchive}
                    onRestore={handleRestoreNote}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <StickyNote size={32} className="text-zinc-300 dark:text-zinc-700" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No notes found</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xs">
                {searchQuery 
                  ? "Try adjusting your search to find what you're looking for."
                  : `Your ${activeTab.toLowerCase()} is empty.`}
              </p>
            </div>
          )}
        </main>

        {/* Floating Action Button */}
        {activeTab !== 'Trash' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNote}
            className="fixed bottom-8 right-8 z-40 p-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full shadow-2xl shadow-zinc-400 dark:shadow-none flex items-center justify-center group overflow-hidden"
          >
            <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
          </motion.button>
        )}
      </div>

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        initialNote={editingNote}
      />
    </div>
  );
}
