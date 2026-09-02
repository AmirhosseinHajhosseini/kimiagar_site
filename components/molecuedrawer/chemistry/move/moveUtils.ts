export interface Point {
  x: number;
  y: number;
}

export function getDragDelta(
  start: Point,
  current: Point,
): { dx: number; dy: number } {
  return {
    dx: current.x - start.x,
    dy: current.y - start.y,
  };
}

export function isElementWithTarget(
  target: EventTarget | null,
): target is HTMLElement {
  return target instanceof HTMLElement;
}

export function getMoveTargetFromElement(
  element: HTMLElement | null,
): { type: string; id: string } | null {
  if (!element) return null;

  const targetElement =
    element.closest<HTMLElement>("[data-move-id]") ?? null;

  if (!targetElement) return null;

  const id = targetElement.dataset.moveId;
  const type = targetElement.dataset.moveType;

  if (!id || !type) return null;

  return { type, id };
}
