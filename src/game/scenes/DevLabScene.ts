import Phaser from 'phaser';
import { CharacterRegistry } from '../character/CharacterRegistry';
import { CharacterView } from '../character/CharacterView';
import { auditCharacterManifests } from '../character/registerCharacterAnimations';
import { CharacterDirection, CharacterManifest } from '../../types/Character';

/**
 * Development Lab — uses the SAME CharacterView / CharacterRegistry /
 * AnimationManager / socket resolver as VillageScene. There is no
 * parallel "demo renderer". Opened from the HUD 🧪 button; ESC returns
 * to the village without restarting the world.
 */
export class DevLabScene extends Phaser.Scene {
  private view: CharacterView | null = null;
  private overlay!: Phaser.GameObjects.Graphics;
  private statusText!: Phaser.GameObjects.Text;
  private auditText!: Phaser.GameObjects.Text;
  private bodyIndex = 0;
  private actionIndex = 0;
  private directionIndex = 0;
  private showSockets = true;
  private bodies: CharacterManifest[] = [];
  private actions: string[] = [];
  private directions: CharacterDirection[] = [];

  constructor() {
    super('DevLabScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1a2433');
    this.bodies = CharacterRegistry.getAll();
    this.bodyIndex = 0;

    this.add
      .text(20, 16, '🧪 Development Lab  —  runtime CharacterView / Registry', {
        fontSize: '22px',
        fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
        color: '#fff8e1'
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.add
      .text(
        20,
        48,
        [
          'B body    ← / → action    ↑ / ↓ hướng',
          'P play/pause    , . frame    S socket    ESC làng'
        ].join('\n'),
        {
          fontSize: '15px',
          fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
          color: '#b0bec5'
        }
      )
      .setScrollFactor(0)
      .setDepth(10);

    this.statusText = this.add
      .text(20, 110, '', {
        fontSize: '18px',
        fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
        color: '#ffe082'
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.auditText = this.add
      .text(20, 0, '', {
        fontSize: '14px',
        fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
        color: '#c8e6c9',
        wordWrap: { width: 520 }
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.overlay = this.add.graphics().setDepth(5);

    this.refreshActionList();
    this.spawnView();
    this.runAudit();
    this.bindKeys();

    this.scale.on('resize', this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.layout, this);
      this.view?.destroy();
    });
    this.layout();
  }

  update(): void {
    this.drawOverlays();
    this.refreshStatus();
  }

  private layout(): void {
    const { height } = this.scale;
    this.auditText.setY(height - 140);
    if (this.view) {
      this.view.sprite.setPosition(this.scale.width * 0.62, this.scale.height * 0.52);
    }
  }

  private currentBody(): CharacterManifest {
    return this.bodies[this.bodyIndex];
  }

  private currentActionId(): string {
    return this.actions[this.actionIndex];
  }

  private currentDirection(): CharacterDirection {
    return this.directions[this.directionIndex];
  }

  private refreshActionList(): void {
    const body = this.currentBody();
    this.actions = Object.keys(body.actions);
    this.actionIndex = Phaser.Math.Clamp(this.actionIndex, 0, this.actions.length - 1);
    this.directions = CharacterRegistry.getSupportedDirections(body.id, this.currentActionId());
    this.directionIndex = Phaser.Math.Clamp(this.directionIndex, 0, this.directions.length - 1);
  }

  private spawnView(): void {
    this.view?.destroy();
    const body = this.currentBody();
    const x = this.scale.width * 0.62;
    const y = this.scale.height * 0.52;
    this.view = new CharacterView(
      this,
      CharacterRegistry,
      body.id,
      x,
      y,
      this.currentActionId(),
      this.currentDirection()
    );
    this.view.sprite.setDepth(4);
  }

  private applySelection(): void {
    this.refreshActionList();
    if (!this.view || this.view.characterId !== this.currentBody().id) {
      this.spawnView();
      return;
    }
    this.view.play(this.currentActionId(), this.currentDirection());
  }

  private bindKeys(): void {
    const kb = this.input.keyboard!;
    kb.on('keydown-ESC', () => this.leave());
    kb.on('keydown-LEFT', () => {
      this.actionIndex = (this.actionIndex - 1 + this.actions.length) % this.actions.length;
      this.directionIndex = 0;
      this.applySelection();
    });
    kb.on('keydown-RIGHT', () => {
      this.actionIndex = (this.actionIndex + 1) % this.actions.length;
      this.directionIndex = 0;
      this.applySelection();
    });
    kb.on('keydown-UP', () => {
      this.directionIndex = (this.directionIndex - 1 + this.directions.length) % this.directions.length;
      this.applySelection();
    });
    kb.on('keydown-DOWN', () => {
      this.directionIndex = (this.directionIndex + 1) % this.directions.length;
      this.applySelection();
    });
    kb.on('keydown-B', () => {
      this.bodyIndex = (this.bodyIndex + 1) % this.bodies.length;
      this.actionIndex = 0;
      this.directionIndex = 0;
      this.applySelection();
    });
    kb.on('keydown-P', () => {
      if (!this.view) return;
      this.view.setPaused(!this.view.isPaused());
    });
    kb.on('keydown-S', () => {
      this.showSockets = !this.showSockets;
    });
    kb.on('keydown-COMMA', () => this.nudgeFrame(-1));
    kb.on('keydown-PERIOD', () => this.nudgeFrame(1));
  }

  private nudgeFrame(delta: number): void {
    if (!this.view) return;
    this.view.setPaused(true);
    const next = this.view.getCurrentFrameIndex() + delta;
    const count = this.view.getCurrentFrameCount();
    this.view.seekFrame(((next % count) + count) % count);
  }

  private refreshStatus(): void {
    if (!this.view) return;
    const paused = this.view.isPaused() ? 'PAUSE' : 'PLAY';
    this.statusText.setText(
      [
        `body: ${this.currentBody().label}  (${this.currentBody().id})`,
        `action: ${this.currentActionId()}   direction: ${this.currentDirection()}`,
        `frame: ${this.view.getCurrentFrameIndex() + 1} / ${this.view.getCurrentFrameCount()}   [${paused}]`,
        `flipX: ${this.view.sprite.flipX ? 'yes' : 'no'}   sockets: ${this.showSockets ? 'on' : 'off'}`
      ].join('\n')
    );
  }

  private drawOverlays(): void {
    this.overlay.clear();
    if (!this.view) return;
    const sprite = this.view.sprite;
    const groundY = this.view.getGroundLineY();

    this.overlay.lineStyle(2, 0xffeb3b, 0.9);
    this.overlay.lineBetween(sprite.x - 90, groundY, sprite.x + 90, groundY);

    this.overlay.lineStyle(1, 0x4fc3f7, 0.7);
    this.overlay.strokeRect(
      sprite.x - sprite.displayWidth / 2,
      sprite.y - sprite.displayHeight / 2,
      sprite.displayWidth,
      sprite.displayHeight
    );

    this.overlay.fillStyle(0xff5252, 0.95);
    this.overlay.fillCircle(sprite.x, sprite.y, 3);

    if (this.showSockets) {
      const sockets = CharacterRegistry.getSockets(this.view.characterId);
      sockets.forEach((socket) => {
        const pos = this.view!.getSocketPosition(socket.id);
        this.overlay.fillStyle(0x69f0ae, 0.95);
        this.overlay.fillCircle(pos.x, pos.y, 4);
      });
    }
  }

  private runAudit(): void {
    const problems = auditCharacterManifests(CharacterRegistry);
    if (problems.length === 0) {
      this.auditText.setColor('#c8e6c9');
      this.auditText.setText('AUDIT  PASS  —  mọi body/action/direction resolve được, không hard-gate.');
    } else {
      this.auditText.setColor('#ff8a80');
      this.auditText.setText(['AUDIT  FAIL', ...problems.map((p) => '• ' + p)].join('\n'));
    }
  }

  private leave(): void {
    this.scene.stop('DevLabScene');
    const village = this.scene.get('VillageScene');
    const ui = this.scene.get('UIScene');
    if (village && this.scene.isPaused('VillageScene')) this.scene.resume('VillageScene');
    if (ui && this.scene.isPaused('UIScene')) this.scene.resume('UIScene');
    if (!this.scene.isActive('VillageScene') && !this.scene.isPaused('VillageScene')) {
      this.scene.start('VillageScene');
      this.scene.start('UIScene');
    }
  }
}
