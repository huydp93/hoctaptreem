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
- 1 Player "Hiệp Sĩ Cáo" (Foxie): 3 sprite thật (fox_front/back/side) ánh xạ theo 4 hướng di chuyển, camera theo dõi, collision với nhà/tháp/hồ + cây/đá trang trí, movement độc lập frame rate (Arcade Physics velocity)
- 1 NPC "Thỏ Thông Thái": sprite thật (rabbit_npc), hội thoại theo cốt truyện Hiệp Sĩ Cáo giải cứu Công Chúa Tri Thức, giao nhiệm vụ
- 6 world object tương tác với icon minh họa thật: bàn, bút, bát (đúng) / cốc, ghế, mèo (decoy)
- Quest "Giải Cứu Công Chúa Tri Thức": +1 sao/từ đúng (thắp sáng 1 trang Sách Phép), chống spam (không cộng sao trùng), phản hồi thân thiện khi sai ("Trang sách này chưa sáng lên đâu!"), màn hình hoàn thành có hiệu ứng sao + nút Tiếp tục/Chơi lại
- HUD: ⭐ số sao, 📖 nhiệm vụ hiện tại, ⚙ cài đặt
- Input: Keyboard (WASD/Arrow/E/Space) + Touch (virtual joystick trái, nút tương tác phải) — cùng chảy qua 1 `InputManager` duy nhất
- Save: `SaveService` (localStorage) — điểm truy cập localStorage duy nhất trong codebase
- Orientation guard: gợi ý xoay ngang trên mobile portrait

## Kiến trúc
```
src/
  main.ts                    # Entry point
  game/
    config/gameConfig.ts     # Phaser.Game config (scale RESIZE, Arcade physics)
    scenes/                  # BootScene → PreloadScene → VillageScene + UIScene
    player/                  # Player (sprite/physics), PlayerController (input→velocity)
    input/                   # InputManager (nguồn sự thật), KeyboardInput, TouchInput, VirtualJoystick
    npc/                     # NPC, NPCManager
    interactions/            # Interactable (contract), InteractionManager, WorldObject
    quests/                  # QuestManager (data-driven engine), QuestState, objectiveEvaluators
    education/               # LessonManager, VocabularyManager
    ui/                      # HUD, DialogueUI, QuestUI, CompletionUI, FeedbackToast
  data/                      # lessons/, vocabulary/, quests/, npc/, worldObjects.ts — nội dung thuần data
  services/SaveService.ts    # Điểm truy cập localStorage duy nhất
  types/                     # Education.ts, Save.ts, Input.ts
public/assets/               # Sẵn thư mục cho art/audio thật sau này
```

**Input flow:** Keyboard / Touch(Joystick) → `InputManager` → `PlayerController` / `InteractionManager`. Gameplay không biết đang chạy trên thiết bị nào.

**Quest flow:** NPC giao quest → `QuestManager.startQuest()` → người chơi tương tác world object → `tryCollectWord()` → `objectiveEvaluators` (theo `type`) quyết định đúng/gần đúng → cập nhật state + `SaveService` → khi đủ số lượng → `quest-completed` → UIScene hiện màn hình hoàn thành.

**Thêm quest mới** (vần "an", thanh sắc, nghe-tìm, ghép chữ...) chỉ cần: thêm data (`data/vocabulary/*.ts`, `data/quests/*.ts`) + (nếu là loại objective mới) 1 evaluator trong `objectiveEvaluators.ts`. Không cần sửa `QuestManager`, `VillageScene`.

## Đồ họa hiện tại — Nâng cấp "Hiệp Sĩ Cáo" 🦊
Sau khi playtest bản placeholder (hình khối màu phẳng), đã thay bằng art thật theo mascot **Foxie** và cốt truyện mới **"Hiệp Sĩ Cáo & Hành Trình Giải Cứu Công Chúa Tri Thức"**:
- `assets/characters/fox_front.png`, `fox_back.png`, `fox_side.png` — 3 pose Foxie (phong cách 3D Pixar, kính, khăn quàng xanh, áo vest thám hiểm)
- `assets/npc/rabbit_npc.png` — Thỏ Thông Thái, người giữ Sách Phép
- `assets/environment/village_map.jpg` — bản đồ làng vẽ tay đầy đủ (nhà nấm, hồ, trường, vườn, tiệm kẹo, tháp tím, sân chơi), thay thế hoàn toàn nền cỏ ô vuông + hình chữ nhật màu cũ
- `assets/environment/tree.png`, `rock.png` — cây/đá trang trí phong cách hoạt hình
- `assets/objects/obj_*.png` — 6 icon đồ vật minh họa (bàn/bút/bát/cốc/ghế/mèo) trên thẻ pastel bo góc

Góc nhìn top-down giữ nguyên (không chuyển isometric) — chỉ nâng cấp chất lượng art, không đổi kiến trúc engine. `placeholderAssets.ts` giờ chỉ còn sinh 1 texture (`particle_star`) cho hiệu ứng hạt; mọi nhân vật/NPC/môi trường/vật thể khác dùng ảnh thật load qua `PreloadScene.preload()`.

## Chưa làm (ngoài phạm vi vertical slice)
- Âm thanh (audio/AudioManager chưa có file thật)
- Animation spritesheet đi bộ thật (hiện dùng 3 pose tĩnh + hiệu ứng bob đơn giản)
- Nhiều quest/lesson khác ngoài chữ B (nội dung Sách Phép của công chúa cho các trang chữ tiếp theo)
- Backend thay localStorage (SaveService đã sẵn sàng để thay)
- Settings panel đầy đủ (hiện chỉ có nút reset progress qua `confirm()`)

## Gợi ý bước tiếp theo
1. Chơi thử trên PC (đã test) rồi trên tablet/phone thật qua URL preview
2. Thêm spritesheet đi bộ thật cho Foxie (hiện chỉ có 3 pose tĩnh)
3. Thêm quest thứ 2 (ví dụ chữ C, mở khóa chương tiếp theo của Sách Phép) để kiểm chứng engine mở rộng không cần sửa code
4. Thêm âm thanh (SFX khi tìm đúng, giọng đọc từ vựng, nhạc nền làng)
