import { CharacterSocketDef, STANDARD_SOCKETS } from '../../types/Character';

/**
 * Shared math for resolving a named socket to world coordinates from any
 * sprite's live display box (center origin). CharacterView uses this for
 * character bodies; WorldObject (a non-character interactable — a static
 * vocabulary prop, not a "body") reuses the exact same STANDARD_SOCKETS
 * contract for its label/prompt/badge instead of hard-coding pixel
 * offsets, so the whole game shares one attachment convention rather
 * than two parallel ones.
 */
export function resolveSocketPosition(
  sprite: { x: number; y: number; displayWidth: number; displayHeight: number },
  socketId: string,
  sockets: CharacterSocketDef[] = STANDARD_SOCKETS
): { x: number; y: number } {
  const socket = sockets.find((s) => s.id === socketId);
  if (!socket) {
    throw new Error(`resolveSocketPosition: unknown socket id "${socketId}"`);
  }
  return {
    x: sprite.x + socket.xOffsetFraction * sprite.displayWidth,
    y: sprite.y + socket.yOffsetFraction * sprite.displayHeight
  };
}
