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
  cellProps?: { [x: string]: any };
}

export interface TableSortItem<T> {
  key: keyof T;
  order: boolean | 'asc' | 'desc';
}

export interface GrouppedTableRow<T, R, D> {
  task: T,
  rate: R,
  key: string;
  rateFormatted: string;
  amount: number;
  subtotal: number;
  subtotalFormatted: string;
  tracking: D;
}

export interface WidgetInfoItem {
  title: string;
  value: string;
  href?: string;
}