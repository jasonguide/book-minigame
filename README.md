# 《书境》Prototype 0.1

> 整理型知识探索游戏 - 微信小游戏 MVP
> 引擎：Cocos Creator 3.x + 2D

---

## 项目结构

```
book-minigame/
├── project.json                         # 项目配置
├── assets/
│   ├── data/
│   │   ├── levels.json                  # 3 个关卡数据
│   │   └── knowledge.json               # 19 张知识卡片
│   ├── scripts/
│   │   ├── core/
│   │   │   ├── GameManager.ts           # 游戏主控制器
│   │   │   ├── LevelManager.ts          # 关卡加载器
│   │   │   └── AudioManager.ts          # 音效管理器
│   │   ├── book/
│   │   │   ├── BookItem.ts              # 书本拖拽组件（核心交互）
│   │   │   └── BookShelf.ts             # 书架管理器
│   │   ├── knowledge/
│   │   │   └── KnowledgeCard.ts         # 知识卡片弹出组件
│   │   ├── ui/
│   │   │   ├── HomeUI.ts                # 首页
│   │   │   └── GameUI.ts               # 游戏内 UI
│   │   └── GameScene.ts                 # 游戏场景主控制器
│   └── resources/
│       ├── audio/                       # 3 个音效文件（需手动加入）
│       │   ├── pickup.wav
│       │   ├── snap.wav
│       │   ├── knowledge.wav
│       │   └── error.wav
│       └── textures/                    # 贴图资源（需手动加入）
│           ├── shelf.png
│           ├── book_icon_animal.png
│           ├── book_icon_universe.png
│           ├── book_icon_history.png
│           ├── book_icon_science.png
│           └── knowledge_card.png
```

## 3 个关卡

| 关卡 | 名称 | 书本数 | 分类维度 | 验证目标 |
|:----:|:----|:-----:|:--------|:--------|
| 1 | 认识书架 | 6 本 | 动物/宇宙/历史 | 10 秒内理解拖拽 |
| 2 | 为什么？ | 6 本 | 科学/动物/宇宙 | 书名有迷惑性但仍可常识判断 |
| 3 | 整理大师 | 10 本 | 动物(从小到大) + 太阳系(从近到远) | 分类+排序的双层任务是否愿意完成 |

## 核心交互反馈链

```
TouchStart → 放大 1.1x + 阴影 + pickup.wav
TouchMove → 跟随手指 + 接近槽位时发光
TouchEnd (正确) → 吸附动画 0.15s + snap.wav + 0.3s 后翻开 + knowledge.wav
TouchEnd (错误) → 回弹 0.25s + 书架晃动 + error.wav
```

## 知识卡片

19 张知识卡片，手工打磨，事实校验过。

## 需要手动完成的工作

1. **Cocos Creator 编辑器操作**：
   - 新建项目，复制此目录结构
   - 创建场景：Boot.scene, Home.scene, Game.scene
   - 将脚本挂载到对应节点
   - 创建 BookPrefab 预制体（Sprite + Label + 阴影节点）
   - 关联各组件之间的属性引用

2. **美术资源**（约 30KB）：
   - 书架背景图 1 张（简约绘本风）
   - 书脊预制体 1 个（程序化生成颜色）
   - 槽位图标 4 个（🐾🌌📜🔬）
   - 知识卡片模板 1 张

3. **音效资源**（约 20KB）：
   - pickup.wav（0.15s，轻快"哒"）
   - snap.wav（0.2s，清脆"啪"——最重要）
   - knowledge.wav（0.5s，柔和"叮"）
   - error.wav（0.3s，低沉"唔"）

## 验证指标

| 指标 | 目标 |
|:----|:---:|
| 首次理解时间 | ≤10 秒 |
| 连续整理率 | ≥80% |
| 知识卡片阅读率 | ≥70% |
| Level 3 排序完成率 | ≥60% |
| "再来一次"意愿 | ≥50% |

## 设计决策记录

- ✅ 吸附阈值使用比例 (`shelfWidth * 0.12`)，而非固定像素
- ✅ 错误反馈使用"书架晃动"而非红色闪烁
- ✅ Level 3 排序规则明确显示在 UI 中，不让玩家猜
- ✅ 知识卡片数量为 19 张，Level 3 部分书共享知识卡（如蜜蜂、猫、地球）
- ✅ 不使用物理引擎，纯距离判断
- ✅ 不使用后端/云存储/数据库
- ✅ Cocos Creator 3.x + 2D Renderer