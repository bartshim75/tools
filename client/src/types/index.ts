// 기본 타입 정의
export interface Tool {
  id: string;
  name: string;
  url: string;
  description: string | null;
  order_index: number;
  is_hidden: boolean;
}

export interface NewTool {
  name: string;
  url: string;
  description: string;
}

export interface AlertState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface AuthState {
  isAdmin: boolean;
  email: string;
  password: string;
}

export interface ModalState {
  showLoginModal: boolean;
  showAddEditModal: boolean;
}

export interface ToolFormData {
  name: string;
  url: string;
  description: string;
}

export type DragEndEvent = import('@dnd-kit/core').DragEndEvent; 