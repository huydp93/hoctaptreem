/**
 * The single normalized input state consumed by gameplay code.
 * Keyboard / touch / virtual joystick sources all write into this shape,
 * so PlayerController never needs to know which device produced it.
 */
export interface InputState {
  /** -1..1 horizontal movement intent */
  moveX: number;
  /** -1..1 vertical movement intent */
  moveY: number;
  /** true only on the frame the interact action was pressed */
  interactJustPressed: boolean;
}
