export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  settings?: {
    defaultTheme: 'light' | 'dark' | 'system';
  };
  createdAt: string;
}

export interface Dashboard {
  id: string;
  userId: string;
  name: string;
  slug: string;
  layoutConfig?: {
    columns: number;
  };
  themeOverride?: any;
  widgets?: WidgetInstance[];
  createdAt: string;
}

export interface WidgetInstance {
  id: string;
  dashboardId: string;
  type: string;
  title?: string;
  position: number;
  size: 'small' | 'medium' | 'large';
  config: any;
  createdAt: string;
}

export interface WidgetDefinition {
  id: string;
  type: string;
  name: string;
  description?: string;
  icon?: string;
  defaultConfig: any;
  minSize: string;
  maxSize: string;
}

export interface Note {
  id: string;
  widgetInstanceId: string;
  content: string;
  color?: string;
  position: number;
  createdAt: string;
}

export interface Task {
  id: string;
  widgetInstanceId: string;
  text: string;
  completed: boolean;
  position: number;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  widgetInstanceId: string;
  title: string;
  url: string;
  icon?: string;
  position: number;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
