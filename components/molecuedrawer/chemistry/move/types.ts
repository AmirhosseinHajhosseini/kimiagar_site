export type MoveTargetType =
  | "atom"
  | "bond"
  | "ring"
  | "arrow"
  | "text"
  | "brush-path"
  | "group";

export interface MoveTarget {
  type: MoveTargetType;
  id: string;
}

export interface MoveDragState {
  pointerId: number;
  target: MoveTarget;
  startX: number;
  startY: number;
}
