export interface Article {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  createdAt: number;
}
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';
