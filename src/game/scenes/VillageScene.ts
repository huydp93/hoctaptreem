import Phaser from 'phaser';
import { Player } from '../player/Player';
import { PlayerController } from '../player/PlayerController';
import { InputManager } from '../input/InputManager';
import { KeyboardInput } from '../input/KeyboardInput';
import { TouchInput } from '../input/TouchInput';
import { InteractionManager } from '../interactions/InteractionManager';
import { WorldObject } from '../interactions/WorldObject';
import { NPCManager } from '../npc/NPCManager';
import { NPC } from '../npc/NPC';
import { QuestManager } from '../quests/QuestManager';
import { VocabularyManager } from '../education/VocabularyManager';
import { wiseRabbitNPC } from '../../data/npc/wiseRabbit';
import { villageWorldObjects } from '../../data/worldObjects';
import { Quest, QuestObjective, VocabularyItem, WorldObjectDef } from '../../types/Education';
import { QuestRuntimeState } from '../quests/QuestState';
import { SaveService } from '../../services/SaveService';

// World now matches the real village_map.jpg illustration pixel-for-pixel
// (1600x1073) instead of the old flat colored-rectangle zone layout.
const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1073;

interface ZoneDef {
  label: string;
  x: number;
  y: number;
}

// The 7 named zones are now just floating label pins hovering above the
// hand-painted landmarks on village_map.jpg (no more colored rect images).
const ZONES: ZoneDef[] = [
  { label: '🍄 Nhà của Cáo', x: 410, y: 60 },
  { label: '🏫 Trường học', x: 1350, y: 60 },
  { label: '🍎 Vườn trái cây', x: 280, y: 320 },
  { label: '💧 Hồ nước lấp lánh', x: 800, y: 40 },
  { label: '🍬 Tiệm kẹo', x: 235, y: 660 },
  { label: '🏰 Tháp Phép Thuật', x: 945, y: 500 },
  { label: '🎠 Sân chơi', x: 1300, y: 610 }
];

// Invisible collision footprints matching the painted buildings/pond so
// the player can't walk through walls or water. Boxes hug BUILDING MASS
// only — stone paths, doors, and grass around landmarks stay open.
// Overlay trees/rocks sit on open grass, never on the painted paths.
interface BlockerDef {
  x: number;
  y: number;
  width: number;
  height: number;
}

const BUILDING_BLOCKERS: BlockerDef[] = [
  { x: 400, y: 195, width: 150, height: 85 }, // mushroom cottage body (door/path free)
  { x: 1390, y: 205, width: 255, height: 125 }, // school walls (front walk free)
  { x: 185, y: 800, width: 195, height: 125 }, // candy shop mass (door/path free)
  { x: 962, y: 730, width: 70, height: 210 }, // tower shaft (left + door paths free)
  { x: 800, y: 165, width: 350, height: 200 } // pond water (south path free)
];

const TREE_POSITIONS: Array<[number, number]> = [
  [470, 560],
  [90, 630],
  [790, 900],
  [1520, 920]
];
const ROCK_POSITIONS: Array<[number, number]> = [
  [430, 680],
  [1550, 640]
];

/**
 * Main gameplay scene: "Làng Chữ Cái" (Letter Village).
 * Owns the world, player, NPCs, world objects, and wires all managers
 * together. This is intentionally an orchestrator — actual behaviour
 * lives in the manager/controller classes it composes.
 */
export class VillageScene extends Phaser.Scene {
  private player!: Player;
  private playerController!: PlayerController;
  private inputManager!: InputManager;
  private keyboardInput!: KeyboardInput;
  private touchInput!: TouchInput;
  private interactionManager!: InteractionManager;
  private npcManager!: NPCManager;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private worldObjects: Map<string, WorldObject> = new Map();

  constructor() {
    super('VillageScene');
  }

  create(): void {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.drawBackground();
    this.drawZones();
    this.obstacles = this.createObstacles();

    // --- Player ---
    // Foxie starts just outside his mushroom-house home, on the grass
    // path, ready to head out on the letter-collecting adventure.
    this.player = new Player(this, 430, 420);
    this.physics.add.collider(this.player.sprite, this.obstacles);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.cameras.main.setZoom(1);

    // --- Input ---
    this.inputManager = new InputManager();
    this.keyboardInput = new KeyboardInput(this);
    this.inputManager.registerSource(this.keyboardInput);
    // TouchInput draws its own on-screen controls (scrollFactor 0, high
    // depth) directly in this scene. It's registered as a second input
    // source so PlayerController stays 100% device-agnostic.
    this.touchInput = new TouchInput(this);
    this.inputManager.registerSource(this.touchInput);

    this.playerController = new PlayerController(this.player, this.inputManager);

    // --- Interactions ---
    this.interactionManager = new InteractionManager();

    // --- NPC ---
    this.npcManager = new NPCManager();
    this.npcManager.spawnFromDefs(this, [wiseRabbitNPC], this.interactionManager, (npc) =>
      this.handleNPCInteract(npc)
    );
    this.npcManager.getAll().forEach((npc) => {
      this.physics.add.collider(this.player.sprite, npc.sprite);
    });
    this.events.on('movement-lock-requested', (locked: boolean) => {
      this.inputManager.setMovementLocked(locked);
    });

    // --- World objects for the letter-B quest ---
    villageWorldObjects.forEach((def) => this.spawnWorldObject(def));

    // --- Quest events ---
    this.registerQuestListeners();

    // Notify UIScene of initial state
    this.events.emit('scene-ready', {
      stars: SaveService.getStars()
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  update(_time: number, delta: number): void {
    this.inputManager.update();
    this.playerController.update(delta);
    this.interactionManager.update(this.player, this.inputManager);

    this.player.sprite.setDepth(10 + this.player.sprite.y);
    this.npcManager.getAll().forEach((npc) => npc.sprite.setDepth(10 + npc.sprite.y));
    this.worldObjects.forEach((obj) => obj.sprite.setDepth(10 + obj.sprite.y));

    const target = this.interactionManager.getCurrentTarget();
    this.touchInput.setInteractButtonVisible(!!target && !this.inputManager.isMovementLocked());
  }

  // ---------------------------------------------------------------------
  // World construction
  // ---------------------------------------------------------------------

  /** Draws the full hand-painted village map as the world background.
   * The image is exactly WORLD_WIDTH x WORLD_HEIGHT so it lines up 1:1
   * with world/camera bounds — no tiling or scaling needed. */
  private drawBackground(): void {
    this.add.image(0, 0, 'village_map').setOrigin(0, 0).setDepth(0);
  }

  private drawZones(): void {
    ZONES.forEach((zone) => {
      this.add
        .text(zone.x, zone.y, zone.label, {
          fontSize: '20px',
          fontFamily: 'Baloo 2, Comic Sans MS, sans-serif',
          color: '#2e2e2e',
          backgroundColor: '#ffffffcc',
          padding: { x: 10, y: 4 }
        })
        .setOrigin(0.5)
        .setDepth(2);
    });
  }

  private createObstacles(): Phaser.Physics.Arcade.StaticGroup {
    const group = this.physics.add.staticGroup();

    BUILDING_BLOCKERS.forEach((b) => {
      const zone = this.add.zone(b.x, b.y, b.width, b.height);
      this.physics.add.existing(zone, true);
      group.add(zone);
    });

    TREE_POSITIONS.forEach(([x, y]) => {
      this.addSceneryProp(group, 'env_tree', x, y, 110, 72, 0.28, 0.22, 0.72);
    });
    ROCK_POSITIONS.forEach(([x, y]) => {
      this.addSceneryProp(group, 'env_rock', x, y, 64, 64, 0.5, 0.4, 0.5);
    });

    return group;
  }

  /** Places a decorative prop on grass with a small grounded collider. */
  private addSceneryProp(
    group: Phaser.Physics.Arcade.StaticGroup,
    key: string,
    x: number,
    y: number,
    displayW: number,
    displayH: number,
    bodyWFrac: number,
    bodyHFrac: number,
    bodyTopFrac: number
  ): void {
    const sprite = group.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
    sprite.setDisplaySize(displayW, displayH);
    sprite.setDepth(10 + y);
    // Sync the static body to the new display size FIRST. refreshBody()
    // resets size/offset to the full sprite, so custom trunk/rock
    // footprints must be applied after it — never before.
    sprite.refreshBody();
    const srcW = sprite.width;
    const srcH = sprite.height;
    const scaleX = displayW / srcW;
    const scaleY = displayH / srcH;
    const bodySrcW = (displayW * bodyWFrac) / scaleX;
    const bodySrcH = (displayH * bodyHFrac) / scaleY;
    sprite.body?.setSize(bodySrcW, bodySrcH);
    sprite.body?.setOffset((srcW - bodySrcW) / 2, (displayH * bodyTopFrac) / scaleY);
  }

  // ---------------------------------------------------------------------
  // NPC + dialogue flow
  // ---------------------------------------------------------------------

  private handleNPCInteract(npc: NPC): void {
    const def = npc.getDef();
    const questId = def.questId;

    // Play the NPC's real "talk" animation for the duration of the
    // dialogue box, returning to idle when it closes — wraps every
    // dialogue branch below so no branch can forget to reset it.
    const withTalkAnimation = (onComplete: () => void) => {
      npc.setTalking(true);
      this.inputManager.setMovementLocked(true);
      return () => {
        npc.setTalking(false);
        this.inputManager.setMovementLocked(false);
        onComplete();
      };
    };

    if (questId && SaveService.isQuestCompleted(questId)) {
      this.events.emit(
        'dialogue-requested',
        def.name,
        ['Con giỏi lắm! Nhờ con mà Công Chúa Tri Thức đã được giải cứu rồi đó!'],
        withTalkAnimation(() => {})
      );
      return;
    }

    const isQuestActive = questId ? QuestManager.isQuestActive(questId) : false;

    if (questId && !isQuestActive) {
      // First meeting: greet, then give the quest.
      const lines = [...def.greetLines, ...def.questGiveLines];
      this.events.emit(
        'dialogue-requested',
        def.name,
        lines,
        withTalkAnimation(() => QuestManager.startQuest(questId))
      );
    } else {
      // Already has the quest active — gentle reminder.
      this.events.emit(
        'dialogue-requested',
        def.name,
        [def.questGiveLines[0] ?? 'Cố lên con nhé, Công Chúa đang chờ con đó!'],
        withTalkAnimation(() => {})
      );
    }
  }

  // ---------------------------------------------------------------------
  // World objects + quest wiring
  // ---------------------------------------------------------------------

  private spawnWorldObject(def: WorldObjectDef): void {
    const vocab = VocabularyManager.getById(def.vocabularyId);
    const displayLabel = vocab?.displayText ?? '?';

    const worldObject = new WorldObject(this, def, displayLabel, (objDef) =>
      this.handleWorldObjectInteract(objDef)
    );
    this.worldObjects.set(def.id, worldObject);
    this.interactionManager.register(worldObject);
    // Collectibles use proximity (InteractionManager), not solid physics —
    // a 96×96 icon must never wall-off a painted path.

    // If this word was already learned in a previous session, show it as collected.
    if (SaveService.isWordLearned(def.vocabularyId)) {
      worldObject.markCollected(this);
    }
  }

  private handleWorldObjectInteract(def: WorldObjectDef): void {
    const activeQuest = QuestManager.getActiveQuest();
    if (!activeQuest) {
      this.events.emit(
        'dialogue-requested',
        'Thỏ Thông Thái',
        ['Con hãy đi tìm Thỏ Thông Thái để nhận nhiệm vụ trước nhé!'],
        () => {}
      );
      return;
    }
    QuestManager.tryCollectWord(def.vocabularyId);
  }

  private registerQuestListeners(): void {
    QuestManager.on('quest-started', (quest: Quest, state: QuestRuntimeState) => {
      const objective = quest.objectives[0];
      this.events.emit('quest-ui-show', quest, objective, state.collectedWordIds.size);
    });

    QuestManager.on(
      'word-correct',
      (item: VocabularyItem, _objective: QuestObjective, collectedCount: number, stars: number) => {
        const worldObject = this.findWorldObjectByVocabId(item.id);
        worldObject?.markCollected(this);
        this.events.emit('toast', `Tuyệt vời! Con vừa thắp sáng một trang sách phép: ${item.displayText}!`, 'success');
        this.events.emit('stars-updated', stars);
        const activeQuest = QuestManager.getActiveQuest();
        const objective = activeQuest?.objectives[0];
        if (objective) {
          this.events.emit('quest-progress-updated', collectedCount, objective.requiredCount);
        }
      }
    );

    QuestManager.on('word-incorrect', (_item: VocabularyItem) => {
      this.events.emit(
        'toast',
        `Trang sách này chưa sáng lên đâu! Con thử tìm đồ vật bắt đầu bằng chữ B nhé.`,
        'gentle'
      );
    });

    QuestManager.on('word-already-collected', (item: VocabularyItem) => {
      this.events.emit('toast', `Trang sách "${item.displayText}" đã sáng rồi! Con tìm đồ vật khác nhé.`, 'gentle');
    });

    QuestManager.on('quest-completed', (quest: Quest) => {
      this.events.emit('quest-completed', quest);
    });

    // UIScene asks the world scene to restart the quest (play-again button).
    // Restarting the whole scene is the simplest reliable way to reset all
    // visual "collected" markers for this MVP vertical slice.
    this.events.on('restart-quest-requested', () => {
      QuestManager.restartActiveQuest();
      this.scene.restart();
      this.scene.get('UIScene').events.emit('village-restarted');
    });
  }

  private findWorldObjectByVocabId(vocabId: string): WorldObject | undefined {
    for (const obj of this.worldObjects.values()) {
      if (obj.getDef().vocabularyId === vocabId) return obj;
    }
    return undefined;
  }

  private cleanup(): void {
    QuestManager.removeAllListeners();
    this.touchInput?.destroy();
  }
}
