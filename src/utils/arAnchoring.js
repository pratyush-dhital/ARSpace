/** Minimum plane extent (meters) before we show / accept placement. */
export const MIN_PLANE_WIDTH = 0.28;
export const MIN_PLANE_HEIGHT = 0.28;

/** Reject tiny or unstable plane detections. */
export function isPlaneAnchorUsable(anchor) {
  if (!anchor || anchor.type !== 'plane') return false;
  const width = anchor.width ?? 0;
  const height = anchor.height ?? 0;
  return width >= MIN_PLANE_WIDTH && height >= MIN_PLANE_HEIGHT;
}

/** Merge anchor updates without duplicating anchorId. */
export function upsertPlaneAnchor(planes, anchor) {
  const idx = planes.findIndex((p) => p.anchorId === anchor.anchorId);
  if (idx === -1) return [...planes, anchor];
  const next = [...planes];
  next[idx] = anchor;
  return next;
}

/**
 * Convert a world-space tap to local plane coordinates.
 * Uses anchor center when present; Y uses placement offset so objects sit on the surface.
 */
export function worldToPlaneLocal(worldPosition, planeAnchor, placementYOffset) {
  const center = planeAnchor.center ?? [0, 0, 0];
  const origin = planeAnchor.position ?? [0, 0, 0];

  return [
    worldPosition[0] - origin[0] - center[0],
    placementYOffset,
    worldPosition[2] - origin[2] - center[2],
  ];
}
