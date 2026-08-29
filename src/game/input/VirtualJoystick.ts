import Phaser from 'phaser';

/**
 * A simple on-screen virtual joystick drawn with Phaser Graphics
 * (no external plugin dependency). Lives in a UI-layer scene so it's
 * always on top and unaffected by world camera movement.
 */
export class VirtualJoystick {
  private scene: Phaser.Scene;
  private baseRadius = 60;
  private thumbRadius = 32;
  private baseX: number;
  private baseY: number;
  private base: Phaser.GameObjects.Arc;
  private thumb: Phaser.GameObjects.Arc;
  private pointerId: number | null = null;
  private vector = { x: 0, y: 0 };
  private zone: Phaser.GameObjects.Zone;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.baseX = x;
    this.baseY = y;

    this.base = scene.add
      .circle(x, y, this.baseRadius, 0xffffff, 0.25)
      .setStrokeStyle(4, 0xffffff, 0.6)
      .setScrollFactor(0)
      .setDepth(1000);

    this.thumb = scene.add
      .circle(x, y, this.thumbRadius, 0xffffff, 0.85)
      .setScrollFactor(0)
      .setDepth(1001);

    // Large invisible hit-zone so touches near the joystick register even
    // if they start slightly outside the visual base circle.
    const zoneSize = this.baseRadius * 3.2;
    this.zone = scene.add
      .zone(x, y, zoneSize, zoneSize)
      .setScrollFactor(0)
      .setDepth(999)
      .setInteractive();

    this.zone.on('pointerdown', this.onPointerDown, this);
    scene.input.on('pointermove', this.onPointerMove, this);
    scene.input.on('pointerup', this.onPointerUp, this);
    scene.input.on('pointerupoutside', this.onPointerUp, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.pointerId !== null) return;
    this.pointerId = pointer.id;
    this.updateThumb(pointer.x, pointer.y);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.pointerId !== pointer.id) return;
    this.updateThumb(pointer.x, pointer.y);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.pointerId !== pointer.id) return;
    this.pointerId = null;
    this.vector = { x: 0, y: 0 };
    this.thumb.setPosition(this.baseX, this.baseY);
  }

  private updateThumb(px: number, py: number): void {
    const dx = px - this.baseX;
    const dy = py - this.baseY;
    const distance = Math.hypot(dx, dy);
    const maxDistance = this.baseRadius;

    if (distance <= maxDistance) {
      this.thumb.setPosition(this.baseX + dx, this.baseY + dy);
      this.vector = { x: dx / maxDistance, y: dy / maxDistance };
    } else {
      const angle = Math.atan2(dy, dx);
      const clampedX = Math.cos(angle) * maxDistance;
      const clampedY = Math.sin(angle) * maxDistance;
      this.thumb.setPosition(this.baseX + clampedX, this.baseY + clampedY);
      this.vector = { x: Math.cos(angle), y: Math.sin(angle) };
    }
  }

  getVector(): { x: number; y: number } {
    return this.vector;
  }

  setVisible(visible: boolean): void {
    this.base.setVisible(visible);
    this.thumb.setVisible(visible);
    this.zone.setVisible(visible);
  }

  /** Reposition anchor point (e.g. on resize) */
  reposition(x: number, y: number): void {
    this.baseX = x;
    this.baseY = y;
    this.base.setPosition(x, y);
    if (this.pointerId === null) {
      this.thumb.setPosition(x, y);
    }
    this.zone.setPosition(x, y);
  }

  destroy(): void {
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
    this.scene.input.off('pointerupoutside', this.onPointerUp, this);
    this.base.destroy();
    this.thumb.destroy();
    this.zone.destroy();
  }
}
