export interface UiAlert {
  title: string;
  message: string;
  icon?: string;
}

export interface UiTableHeaderCell {
  key: string;
  title?: string;
  align?: 'start' | 'end' | 'center';
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
}