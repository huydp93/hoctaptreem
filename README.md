# Làng Chữ Cái (Letter Village)

Trò chơi giáo dục tiếng Việt cho trẻ 4–8 tuổi. Đây là **game thực sự** chạy trong browser bằng Phaser 3 (game loop/rendering/physics/camera/scenes đều do Phaser quản lý) — không phải website bài học hay dashboard.

## Tech Stack (bắt buộc, đã áp dụng)
- **Phaser 3.90** — game engine (scenes, Arcade Physics, camera, input)
- **TypeScript** — toàn bộ code game
- **Vite** — dev server + build
- **Node.js / npm** — môi trường build thực sự (không CDN, không 1 file HTML)

Không dùng React cho gameplay, không dùng div/button giả lập game.

## Chạy project
```bash
npm install
npm run dev     # http://localhost:3000 (Vite dev server)
npm run build   # build production vào dist/
npm run preview # xem thử bản build
```
Đã test qua PM2 (`pm2 start ecosystem.config.cjs`) — chạy ổn định, không lỗi console.

## Vertical Slice hiện đã hoàn thành ✅
Toàn bộ vòng chơi trong đặc tả mục 15 đã chạy được:
Start → điều khiển Hiệp Sĩ Cáo → gặp Thỏ Thông Thái → nhận nhiệm vụ giải cứu Công Chúa Tri Thức (chữ B) → tìm bàn/bút/bát → nhận sao → màn hình hoàn thành → chơi lại.

Cụ thể:
- 1 map "Làng Chữ Cái" vẽ tay hoàn chỉnh (village_map.jpg, 1600x1073) với 7 khu vực (Nhà Cáo, Trường học, Vườn trái cây, Hồ nước, Tiệm kẹo, Tháp Phép Thuật, Sân chơi) được đánh dấu bằng nhãn nổi trên đúng vị trí công trình vẽ tay
- 1 Player "Hiệp Sĩ Cáo" (Foxie): CharacterView data-driven — idle 1 frame + walk 4 frame thật (contact → passing) theo 4 hướng (right = mirror left), camera theo dõi, collision với **khối nhà/hồ** (không đè đường đá), cây/đá overlay trên cỏ, NPC, movement độc lập frame rate
- 1 NPC "Thỏ Thông Thái": CharacterView (`wise_rabbit`) — idle + talk 4 frame khi hội thoại, giao nhiệm vụ
- 6 world object tương tác với icon minh họa thật: bàn, bút, bát (đúng) / cốc, ghế, mèo (decoy)
- Quest "Giải Cứu Công Chúa Tri Thức": +1 sao/từ đúng (thắp sáng 1 trang Sách Phép), chống spam (không cộng sao trùng), phản hồi thân thiện khi sai ("Trang sách này chưa sáng lên đâu!"), màn hình hoàn thành có hiệu ứng sao + nút Tiếp tục/Chơi lại
- HUD: ⭐ số sao, 📖 nhiệm vụ hiện tại, 🧪 Development Lab, ⚙ cài đặt
- Input: Keyboard (WASD/Arrow/E/Space) + Touch (virtual joystick trái, nút tương tác phải) — cùng chảy qua 1 `InputManager` duy nhất
- Save: `SaveService` (localStorage) — điểm truy cập localStorage duy nhất trong codebase
- Orientation guard: gợi ý xoay ngang trên mobile portrait

## Kiến trúc
```
src/
  main.ts                    # Entry point
  game/
    config/gameConfig.ts     # Phaser.Game config (scale RESIZE, Arcade physics)
    scenes/                  # BootScene → PreloadScene → VillageScene + UIScene + DevLabScene
    character/               # CharacterRegistry, CharacterView, preload/animations/sockets
    player/                  # Player (sprite/physics), PlayerController (input→velocity)
    input/                   # InputManager (nguồn sự thật), KeyboardInput, TouchInput, VirtualJoystick
    npc/                     # NPC, NPCManager
    interactions/            # Interactable (contract), InteractionManager, WorldObject
    quests/                  # QuestManager (data-driven engine), QuestState, objectiveEvaluators
    education/               # LessonManager, VocabularyManager
    ui/                      # HUD, DialogueUI, QuestUI, CompletionUI, FeedbackToast
  data/                      # lessons/, vocabulary/, quests/, npc/, characters/, worldObjects.ts
  services/SaveService.ts    # localStorage duy nhất (+ appearance migration v2)
  types/                     # Education.ts, Save.ts, Input.ts, Character.ts
public/assets/               # characters/ (idle + walk), npc/, environment/, objects/
```

**Input flow:** Keyboard / Touch(Joystick) → `InputManager` → `PlayerController` / `InteractionManager`. Gameplay không biết đang chạy trên thiết bị nào.

**Quest flow:** NPC giao quest → `QuestManager.startQuest()` → người chơi tương tác world object → `tryCollectWord()` → `objectiveEvaluators` (theo `type`) quyết định đúng/gần đúng → cập nhật state + `SaveService` → khi đủ số lượng → `quest-completed` → UIScene hiện màn hình hoàn thành.

**Thêm quest mới** (vần "an", thanh sắc, nghe-tìm, ghép chữ...) chỉ cần: thêm data (`data/vocabulary/*.ts`, `data/quests/*.ts`) + (nếu là loại objective mới) 1 evaluator trong `objectiveEvaluators.ts`. Không cần sửa `QuestManager`, `VillageScene`.

## Hệ thống nhân vật 2D

Mọi nhân vật đi qua **một runtime chung** (`CharacterView` + `CharacterRegistry`). Thêm body/action mới = thêm manifest trong `src/data/characters/`, không sửa Player/NPC/Village.

| Body | Actions | Hướng |
| --- | --- | --- |
| `foxie` | idle (1 frame), walk (4 frame, gait contact→passing) | down / up / left authored, right = mirror left |
| `wise_rabbit` | idle (1 frame), talk (4 frame) | down only (NPC đứng yên) |

- Walk sheets: `public/assets/characters/foxie_walk_{down,side,up}.png` — 4 khung 192×220, chân cùng ground line
- Idle sheets padded cùng kích thước walk để không giật neo khi đổi idle↔walk
- Socket dùng chung (`root`, `ground`, `prompt`, `label`, `badge`, `hand_main`, `hand_off`, `back`) — mirror theo `flipX`
- Save v2: `appearance.bodyId` (migrate từ v1, body lạ bị làm sạch về `foxie`)

**Development Lab:** nút 🧪 trên HUD, hoặc `/?lab=1`. Dùng đúng CharacterView/Registry. Phím: B body, ←/→ action, ↑/↓ hướng, P play/pause, `,` `.` frame, S socket, ESC làng.

**Kiểm thử:**
```bash
npm test              # manifest + attachment + migration + tsc
npm run test:manifest
npm run test:attachment
npm run test:migration
```

## Đồ họa hiện tại
- `assets/characters/foxie_idle_*.png` + `foxie_walk_*.png` — Foxie (kính, khăn xanh, vest, sách ENGLISH)
- `assets/npc/rabbit_idle_down.png` + `rabbit_talk.png` — Thỏ Thông Thái
- `assets/environment/village_map.jpg` — bản đồ làng vẽ tay 1600×1073
- `assets/environment/tree.png`, `rock.png` — cây/đá
- `assets/objects/obj_*.png` — 6 icon đồ vật

## Chưa làm
- Âm thanh (SFX / giọng đọc / nhạc nền)
- Nhiều quest/lesson khác ngoài chữ B
- Backend thay localStorage
- Settings panel đầy đủ
- Visual layer trang bị (outfit/weapon) — socket đã dành sẵn, gameplay hiện không có trang bị

## Gợi ý bước tiếp theo
1. Chơi thử walk-cycle 4 hướng trên PC rồi tablet
2. Mở Development Lab (`/?lab=1`) để soi gait / socket / audit
3. Thêm quest chữ C (chỉ data) để kiểm chứng engine mở rộng
4. Thêm âm thanh
