# Làng Chữ Cái — Học tiếng Việt & luyện nói

Sản phẩm giáo dục tiếng Việt cho trẻ **5–7 tuổi** (mẫu giáo lớn / lớp 1).

Định hướng không chỉ **học chữ cái**, mà còn **luyện nói / phát âm**: nghe mẫu, nhận biết âm–vần–dấu, đọc micro, và theo dõi tiến bộ. Gameplay hiện tại là một **làng Phaser** — trẻ điều khiển nhân vật, gặp NPC, làm nhiệm vụ chữ. Các lớp luyện nói, phụ huynh, AI tạo bài nằm trên roadmap, chưa có trong bản chạy.

## Tầm nhìn sản phẩm

Trẻ học tiếng Việt như một hành trình trong làng:

1. **Nghe mẫu** — nghe âm / vần / từ chuẩn
2. **Nhận biết** — nhìn chữ, ghép âm–vần, chọn đúng đồ vật / từ
3. **Luyện nói** — đọc micro, so với mẫu, nhận phản hồi thân thiện
4. **Củng cố** — quest trong làng, sao, huy hiệu
5. **Phụ huynh** — xem tiến bộ, duyệt bài AI (khi có)

Ba vai trò mục tiêu:

| Vai trò | Việc chính |
| --- | --- |
| **Trẻ** | Chơi trong làng, học chữ / âm / vần, luyện nói |
| **Phụ huynh** | Theo dõi báo cáo, duyệt bài do AI tạo (roadmap) |
| **Admin / giáo viên** | Quản lý nội dung bài học (roadmap) |

Phạm vi kiến thức (theo khung sản phẩm):

- Chữ cái, âm đầu, vần, dấu thanh
- Từ ngữ gần gũi (đồ vật, con vật, gia đình…)
- Đọc micro câu ngắn / từ đã học
- **Không** nhắm ngữ pháp phức tạp hay văn bản dài

Cách học: vui, ngắn, có hình / âm thanh, phản hồi nhẹ nhàng. Không thi đua gay gắt, không phạt.

## Repo này đang là gì

Đây là **game Phaser trong trình duyệt** — không phải website bài học, không phải dashboard phụ huynh.

- Engine: Phaser 3 (game loop, render, Arcade Physics, camera, scenes)
- Không dùng React cho gameplay
- Lưu tiến độ local (`localStorage`) — chưa có backend / tài khoản

Stack đang chạy:

- **Phaser 3.90**
- **TypeScript**
- **Vite**
- **Node.js / npm**

> Khung sản phẩm đầy đủ gợi ý Next.js + PostgreSQL + Docker cho web bài học / phụ huynh / AI. **Repo này chưa chuyển sang stack đó.** Làng Phaser là vertical slice để chứng minh vòng chơi + hệ nhân vật. Phần luyện nói / phụ huynh / AI sẽ gắn vào khi làm, không giả định đã có.

## Chạy project

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # dist/
npm run preview
npm test        # manifest nhân vật + contract + migration + tsc
```

Sandbox: `pm2 start ecosystem.config.cjs` (Vite port 3000).

## Đã có (vertical slice chữ B)

Vòng chơi: Start → điều khiển Hiệp Sĩ Cáo → gặp Thỏ Thông Thái → nhận nhiệm vụ giải cứu Công Chúa Tri Thức (**chữ B**) → tìm bàn / bút / bát → nhận sao → hoàn thành → chơi lại.

- Map **Làng Chữ Cái** vẽ tay (`village_map.jpg`, 1600×1073): Nhà Cáo, Trường học, Vườn trái cây, Hồ nước, Tiệm kẹo, Tháp Phép Thuật, Sân chơi
- Player **Foxie**: CharacterView — idle 1 frame + walk 4 frame × 4 hướng (right = mirror left)
- Collision: khối nhà / hồ **không chặn đường đá**; cây / đá overlay trên cỏ; đồ vật nhặt **không** là tường
- NPC **Thỏ Thông Thái**: idle + talk 4 frame khi hội thoại
- 6 world object: bàn, bút, bát (đúng) / cốc, ghế, mèo (nhiễu)
- Quest data-driven: +1 sao / từ đúng, không cộng trùng, toast khi sai, màn hình hoàn thành
- HUD: sao, nhiệm vụ, Development Lab, cài đặt
- Input: bàn phím (WASD / mũi tên / E / Space) + joystick ảo — cùng `InputManager`
- Save: `SaveService` (điểm localStorage duy nhất)
- Gợi ý xoay ngang trên mobile portrait

**Chưa có trong bản này:** tutorial/hướng dẫn chơi (onboarding), micro, chấm phát âm, giọng đọc mẫu, tài khoản phụ huynh, AI tạo bài, báo cáo.

## Roadmap — luyện nói & sản phẩm đầy đủ

Thứ tự gợi ý (bám khung 5–7 tuổi). Chỉ làm khi được yêu cầu; README không tuyên bố đã xong.

### 0. Onboarding — dạy chơi từ những giây đầu (đã nhận diện, chưa làm)

Vấn đề: trẻ mới vào làng **chưa biết** (1) di chuyển bằng gì, (2) phải đi đâu để nhận
nhiệm vụ bài học. Thỏ Thông Thái spawn sát nhà Cáo (~80px) nhưng trẻ không biết phải
tiến lại gần và bấm nút; nhiệm vụ chỉ lộ ra sau khi tự tìm được Thỏ.

Gói đề xuất (onboarding "học bằng cách làm", chỉ chạy lần đầu):

- **Bước A — di chuyển**: bàn tay động chỉ vào joystick ảo (mobile) / phím WASD/mũi tên
  (PC); qua bước khi `InputManager` có `moveX/moveY ≠ 0`.
- **Bước B — tìm người giao bài**: dấu "❗" nhấp nháy trên đầu Thỏ + mũi tên chỉ hướng ở
  mép màn hình + câu "Đi về phía dấu chấm than vàng nhé".
- **Bước C — nhận nhiệm vụ**: nút 💬 phóng to/nhấp nháy khi đến gần Thỏ → trẻ bấm để mở
  hội thoại cốt truyện và bắt đầu nhiệm vụ.
- **Màn chào mục tiêu** (1 lần): "Công Chúa Tri Thức bị nhốt rồi! Đi gặp Thỏ Thông Thái
  để nhận nhiệm vụ giải cứu."
- Cờ `hasSeenTutorial` trong `SaveService` + nút "❓ Xem lại hướng dẫn".

> Nên làm onboarding này **trước** các mini-game nhận biết — nó quyết định trẻ có vào
> được vòng chơi hay không.

### 1. Nghe & đọc trong làng (gần gameplay hiện tại)

- Âm thanh SFX / nhạc nền
- Giọng đọc mẫu từng chữ / từ (Nghe mẫu)
- Quest chữ C, rồi âm–vần–dấu — chủ yếu thêm data (`vocabulary/`, `quests/`)
- Mini-game nhận biết: nghe → chọn đúng object trong làng

### 2. Luyện nói (trọng tâm định hướng mới)

- Đọc micro: từ / câu ngắn đã học
- So khớp cơ bản với mẫu (độ tương đồng), phản hồi vui (“gần rồi!”, “hay lắm!”)
- Không chấm điểm gay gắt; sai thì nghe lại mẫu rồi thử tiếp
- STT / scoring nâng cao sau khi vòng cơ bản ổn

### 3. Phụ huynh & nội dung

- Báo cáo tiến bộ (chữ đã học, lần luyện nói, sao)
- Xem trước / duyệt bài do AI tạo trước khi trẻ chơi
- Tài khoản + lưu server (thay localStorage)

### 4. AI tạo bài (sau khi có duyệt phụ huynh)

- Sinh bài tập nhận biết / ghép âm / đọc micro theo vốn từ đã học
- Luôn có bước phụ huynh xem trước — không đẩy bài thô cho trẻ

Engine quest hiện tại đã tách data khỏi scene: thêm loại objective (nghe-tìm, ghép chữ, đọc micro) = thêm evaluator, không sửa `VillageScene`.

## Kiến trúc code hiện tại

```
src/
  main.ts
  game/
    config/gameConfig.ts
    scenes/          # Boot → Preload → Village + UI + DevLab
    character/       # CharacterRegistry, CharacterView
    player/
    input/           # InputManager, Keyboard, Touch, Joystick
    npc/
    interactions/    # Interactable, InteractionManager, WorldObject
    quests/          # QuestManager, evaluators
    education/       # LessonManager, VocabularyManager
    ui/
  data/              # lessons, vocabulary, quests, npc, characters, worldObjects
  services/SaveService.ts
  types/
public/assets/       # characters/, npc/, environment/, objects/
```

**Input:** Keyboard / Touch → `InputManager` → `PlayerController` / `InteractionManager`.

**Quest:** NPC giao việc → tương tác object → `tryCollectWord()` → evaluator theo `type` → `SaveService` → `quest-completed`.

Thêm quest (vần “an”, thanh sắc, nghe-tìm, đọc micro…) ≈ thêm file data + evaluator nếu loại mới.

## Hệ thống nhân vật 2D

Mọi nhân vật đi qua `CharacterView` + `CharacterRegistry`. Thêm body/action = thêm manifest `src/data/characters/`.

| Body | Actions | Hướng |
| --- | --- | --- |
| `foxie` | idle (1), walk (4, gait contact→passing) | down / up / left; right = mirror |
| `wise_rabbit` | idle (1), talk (4) | down (NPC đứng yên) |

- Walk: `public/assets/characters/foxie_walk_{down,side,up}.png` — 4 khung 192×220
- Idle cùng kích thước walk (không giật neo idle↔walk)
- Socket chung: `root`, `ground`, `prompt`, `label`, `badge`, `hand_main`, `hand_off`, `back`
- Save v2: `appearance.bodyId` (migrate từ v1)

**Development Lab:** HUD 🧪 hoặc `/?lab=1`. Phím: B body, ←/→ action, ↑/↓ hướng, P play/pause, `,` `.` frame, S socket, ESC làng.

```bash
npm test
npm run test:manifest
npm run test:attachment
npm run test:migration
```

## Đồ họa

- `assets/characters/foxie_idle_*.png`, `foxie_walk_*.png`
- `assets/npc/rabbit_idle_down.png`, `rabbit_talk.png`
- `assets/environment/village_map.jpg` — 1600×1073
- `assets/environment/tree.png`, `rock.png`
- `assets/objects/obj_*.png`

## Việc chưa làm (tóm tắt)

| Hạng mục | Trạng thái |
| --- | --- |
| Làng + quest chữ B + nhân vật | Đã có |
| Onboarding / tutorial (di chuyển → tìm Thỏ → nhận nhiệm vụ) | Chưa — đã nhận diện, ưu tiên cao |
| Âm thanh / giọng đọc mẫu | Chưa |
| Quest chữ C / âm–vần–dấu | Chưa (engine sẵn) |
| **Luyện nói / micro / chấm phát âm** | **Chưa — định hướng chính tiếp theo** |
| Dashboard phụ huynh / báo cáo | Chưa |
| AI tạo bài + duyệt trước | Chưa |
| Backend / tài khoản | Chưa (đang localStorage) |
| Settings panel đầy đủ | Chưa |
| Visual trang bị (socket đã có) | Chưa gắn gameplay |

## Gợi ý bước tiếp

1. **Onboarding** — dạy di chuyển + tìm Thỏ Thông Thái + nhận nhiệm vụ (xem Roadmap mục 0)
2. Chơi walk-cycle 4 hướng (PC / tablet); đường đá phải đi được
3. Development Lab (`/?lab=1`) soi gait / socket
4. Quest chữ C (chỉ data) — kiểm chứng engine
5. Giọng đọc mẫu cho chữ / từ đã học
6. Vòng luyện nói đầu tiên: micro + so khớp đơn giản + phản hồi vui
