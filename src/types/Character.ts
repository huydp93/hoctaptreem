/**
 * Character system data models.
 *
 * These types define a data-driven contract for any 2D character in the
 * game (player body "Foxie", NPC bodies like "Thỏ Thông Thái"). The goal
 * is that CharacterRegistry/AnimationController/CharacterView never
 * hard-code a character name, texture key, or direction — everything is
 * resolved from a CharacterManifest at runtime.
 *
 * Scope note: this game has no equipment/outfit/mount/combat system, so
 * there is no "visual layer" stack here — only a single "body" per
 * character (per the skill's own instruction to size the system to real
 * gameplay). The manifest shape still separates "body definition" from
 * "action timeline" so a layer stack could be added later without
 * reshaping this contract.
 */

/** The four cardinal facing directions used by top-down movement/idle. */
export type CharacterDirection = 'up' | 'down' | 'left' | 'right';

/**
 * A single named action a character can perform (e.g. "idle", "walk",
 * "talk"). Every action MUST declare real frame data — no action may
 * borrow another action's frames, and no action may fake motion with a
 * single static frame stretched across the whole clip (see skill
 * section 5). An action with only 1 frame is a valid *idle* pose (a
 * true one-frame contract), but it must be declared as such explicitly
 * via `frameCount: 1`, never used to stand in for a walk/talk cycle.
 */
export interface CharacterActionDef {
  /** Action id, e.g. 'idle' | 'walk' | 'talk' */
  id: string;
  /** Human label for dev-lab UI */
  label: string;
  /**
   * Per-direction spritesheet frame source. Directions not listed fall
   * back to `mirrorFrom` (see below) or to the registry's direction
   * fallback policy — they never silently reuse a *different action's*
   * frames.
   */
  directions: Partial<Record<CharacterDirection, CharacterDirectionFrames>>;
  /**
   * Declares that a direction's art is derived by horizontally mirroring
   * another authored direction rather than being separately authored.
   * e.g. { right: 'left' } means "right" reuses "left"'s spritesheet
   * with flipX applied. Authored directions (present in `directions`)
   * always take priority over a mirror declaration for the same key.
   */
  mirrorFrom?: Partial<Record<CharacterDirection, CharacterDirection>>;
  /** Milliseconds per frame during playback. */
  frameDurationMs: number;
  /** true = loops forever (walk/idle/talk); false = plays once and holds last frame (not used yet, reserved for future one-shot actions). */
  loop: boolean;
}

export interface CharacterDirectionFrames {
  /** Phaser texture key for the spritesheet (loaded via load.spritesheet). */
  textureKey: string;
  /** Asset path (relative to /public), loaded generically by preloadCharacterAssets(). */
  path: string;
  /** Number of frames authored in this spritesheet (>= 1). */
  frameCount: number;
  /** Native rendered height in px at 1:1 scale (matches art export height). */
  frameHeight: number;
  /** Native rendered width in px at 1:1 scale (matches art export width per frame). */
  frameWidth: number;
}

/**
 * A named attachment point ("socket") on a character, expressed as a
 * SIGNED fraction of the character's current display size relative to
 * its origin. This project's sprites (Player, NPC, WorldObject) all use
 * Phaser's default center origin (0.5, 0.5) — and every existing spawn
 * coordinate (NPCDef.x/y, WorldObjectDef.x/y, VillageScene spawn point)
 * is authored as that center point. Sockets therefore resolve relative
 * to CENTER, not to a "feet" origin, so adopting the socket contract
 * requires zero changes to existing map/spawn data:
 *
 *   worldX = sprite.x + xOffsetFraction * sprite.displayWidth
 *   worldY = sprite.y + yOffsetFraction * sprite.displayHeight
 *
 * (negative yOffsetFraction = above the character, since Phaser's y
 * grows downward — matching the sign of the hard-coded `y - 62` style
 * offsets this replaces).
 *
 * Socket positions are resolved once per frame from the character's
 * LIVE display box (CharacterView.getSocketPosition), so UI elements
 * (name label, interaction prompt, star badge) never hard-code a pixel
 * offset again, and stay correct even if displayHeight/width differ
 * between two characters or two directions of the same character.
 */
export interface CharacterSocketDef {
  id: string;
  /** Signed fraction of displayWidth, 0 = center, negative = left, positive = right */
  xOffsetFraction: number;
  /** Signed fraction of displayHeight, 0 = center, negative = above, positive = below */
  yOffsetFraction: number;
}

export const STANDARD_SOCKETS: CharacterSocketDef[] = [
  // Ground/root reference (bottom edge of the sprite) — used by dev-lab
  // ground-line overlays to catch root/foot drift across frames.
  { id: 'root', xOffsetFraction: 0, yOffsetFraction: 0.5 },
  { id: 'ground', xOffsetFraction: 0, yOffsetFraction: 0.5 },
  // Floating interaction prompt ("💬 Nói chuyện" / "💬 Xem"), above the head.
  { id: 'prompt', xOffsetFraction: 0, yOffsetFraction: -0.68 },
  // Name label / vocabulary label, just above the head.
  { id: 'label', xOffsetFraction: 0, yOffsetFraction: -0.5 },
  // Star / collected badge — reserved separately from `label` so both
  // could be shown together without colliding.
  { id: 'badge', xOffsetFraction: 0, yOffsetFraction: -0.5 },
  // Reserved attachment points (no equipment in this game yet, but the
  // contract is shared so a future outfit/weapon layer can bind here
  // without inventing per-screen offsets).
  { id: 'hand_main', xOffsetFraction: 0.22, yOffsetFraction: 0.08 },
  { id: 'hand_off', xOffsetFraction: -0.18, yOffsetFraction: 0.08 },
  { id: 'back', xOffsetFraction: 0, yOffsetFraction: -0.05 }
];

/**
 * Socket set for non-character interactables (vocabulary world objects —
 * small static icon props, not tall character renders). Proportions
 * differ enough from a character body (label sits BELOW the icon, not
 * above) that reusing STANDARD_SOCKETS verbatim would misplace text —
 * so this is a second explicit, still-shared, still-generic contract
 * rather than a per-object hard-coded offset.
 */
export const WORLD_OBJECT_SOCKETS: CharacterSocketDef[] = [
  { id: 'label', xOffsetFraction: 0, yOffsetFraction: 0.55 },
  { id: 'prompt', xOffsetFraction: 0, yOffsetFraction: -0.72 },
  { id: 'badge', xOffsetFraction: 0, yOffsetFraction: -0.72 }
];

/**
 * Full manifest for one character body. This is the single source of
 * truth CharacterRegistry consumes — no gameplay code should reference a
 * texture key, pixel offset, or direction-mapping outside of this shape.
 */
export interface CharacterManifest {
  /** Unique character id, e.g. 'foxie' | 'wise_rabbit' */
  id: string;
  /** Human label for dev-lab UI */
  label: string;
  /** Rendered height in world pixels (art is scaled uniformly to this). */
  displayHeight: number;
  /** Actions this character supports, keyed by action id. */
  actions: Record<string, CharacterActionDef>;
  /** Attachment sockets available on this character (defaults to STANDARD_SOCKETS if omitted). */
  sockets?: CharacterSocketDef[];
  /**
   * Fraction of the sprite's height (from the bottom) that forms the
   * Arcade Physics collision body — keeps a "feet only" collider on a
   * tall character render, matching this project's existing convention.
   */
  physicsBodyHeightFraction: number;
  physicsBodyWidthFraction: number;
}
