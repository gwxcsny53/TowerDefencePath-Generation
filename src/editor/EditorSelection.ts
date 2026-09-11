import type { GridPosition } from '@/core/model';

export type EditorSelection =
  | { readonly kind: 'path'; readonly position: Readonly<GridPosition> }
  | { readonly kind: 'spawn'; readonly id: string; readonly position: Readonly<GridPosition> }
  | { readonly kind: 'end'; readonly id: string; readonly position: Readonly<GridPosition> }
  | { readonly kind: 'tower'; readonly id: string; readonly position: Readonly<GridPosition> }
  | { readonly kind: 'junction'; readonly position: Readonly<GridPosition> };
