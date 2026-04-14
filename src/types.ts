export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
}

export type Category = 'Personal' | 'Work' | 'Ideas' | 'Important' | 'Others';

export const CATEGORIES: Category[] = ['Personal', 'Work', 'Ideas', 'Important', 'Others'];

export type NavTab = 'All' | 'Pinned' | 'Archived' | 'Trash';
