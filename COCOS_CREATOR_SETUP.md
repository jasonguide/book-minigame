# 《书境》Cocos Creator 3.x 编辑器操作步骤

> 适用版本：Cocos Creator 3.8+（当前最新稳定版）
> 目标：把 `book-minigame` 项目代码搭建成可运行的游戏

---

## 目录

- [第一步：安装 Cocos Creator](#第一步安装-cocos-creator)
- [第二步：新建项目](#第二步新建项目)
- [第三步：导入代码和数据](#第三步导入代码和数据)
- [第四步：创建场景](#第四步创建场景)
- [第五步：创建 BookPrefab（最关键）](#第五步创建-bookprefab最关键)
- [第六步：搭建 Game 场景](#第六步搭建-game-场景)
- [第七步：搭建 Home 场景](#第七步搭建-home-场景)
- [第八步：关联属性引用](#第八步关联属性引用)
- [第九步：添加音效和美术资源](#第九步添加音效和美术资源)
- [第十步：预览运行](#第十步预览运行)
- [第十一步：构建微信小游戏](#第十一步构建微信小游戏)
- [常见问题排查](#常见问题排查)

---

## 第一步：安装 Cocos Creator

### 1.1 下载

从 Cocos 官网下载 **Cocos Creator 3.8+**（当前最新版）：

👉 https://www.cocos.com/creator-download

### 1.2 安装

- 下载 Windows 安装包
- 双击安装，建议安装在 `C:\CocosDashboard\` 或默认路径
- 安装过程中可以选择安装 **Cocos Dashboard**（推荐，用于管理版本和项目）

### 1.3 确认安装

打开 Cocos Dashboard，确保能看到 Cocos Creator 3.x 的版本信息。

---

## 第二步：新建项目

### 2.1 打开 Cocos Creator

双击桌面图标打开 Cocos Creator。

### 2.2 新建空项目

```
Cocos Dashboard → 项目 → 新建
  → 选择「空项目」（Empty Project）
  → 项目名称：book-minigame
  → 项目路径：E:\AI-workspace\dsh\book-minigame
  → 渲染模式：2D（默认）
  → 点击「创建」
```

> ⚠️ 注意：**不要勾选「3D」**，我们只需要 2D 渲染。

### 2.3 确认项目结构

创建完成后，Cocos Creator 会自动生成以下目录：

```
book-minigame/
├── assets/          # 资源目录（你的代码和资源放这里）
├── settings/        # 编辑器设置（自动生成）
├── extensions/      # 扩展
└── project.json     # 项目配置
```

---

## 第三步：导入代码和数据

### 3.1 定位 assets 目录

在 Cocos Creator 编辑器左侧的 **资源管理器（Assets）** 面板中，右键 `assets` → **在文件管理器中打开**。

### 3.2 复制项目文件

把你从 GitHub 拉下来的代码复制进去：

```
从仓库复制：
  📁 assets/scripts/     → 粘贴到 Cocos 项目的 assets/ 下
  📁 assets/data/        → 粘贴到 Cocos 项目的 assets/ 下
```

### 3.3 确认文件显示

回到 Cocos Creator 编辑器，**资源管理器面板**应该能看到：

```
assets/
├── data/
│   ├── levels.json         ← 关卡数据
│   └── knowledge.json      ← 知识卡片数据
└── scripts/
    ├── GameScene.ts        ← 主场景控制器
    ├── core/
    │   ├── GameManager.ts
    │   ├── LevelManager.ts
    │   └── AudioManager.ts
    ├── book/
    │   ├── BookItem.ts
    │   └── BookShelf.ts
    ├── knowledge/
    │   └── KnowledgeCard.ts
    └── ui/
        ├── HomeUI.ts
        └── GameUI.ts
```

> 如果文件没显示，右键 `assets` → **刷新**。

---

## 第四步：创建场景

我们需要 3 个场景：`Boot`（启动）、`Home`（首页）、`Game`（游戏主场景）。

### 4.1 创建 Boot 场景

```
资源管理器 → 右键 assets → 新建 → 场景
  → 重命名为：Boot
```

### 4.2 创建 Home 场景

```
资源管理器 → 右键 assets → 新建 → 场景
  → 重命名为：Home
```

### 4.3 创建 Game 场景

```
资源管理器 → 右键 assets → 新建 → 场景
  → 重命名为：Game
```

最终应该是：

```
assets/
├── scenes/
│   ├── Boot.scene
│   ├── Home.scene
│   └── Game.scene          ← 最主要的工作场景
├── data/
└── scripts/
```

---

## 第五步：创建 BookPrefab（最关键）

这是整个游戏最核心的预制体，每本书都由它实例化。

### 5.1 创建节点结构

```
资源管理器 → 右键 assets → 新建 → 文件夹 → 名称：prefabs

层次管理器（Hierarchy）：
  右键 → 创建 → 空节点 → 名称：BookPrefab
```

### 5.2 添加子节点

给 `BookPrefab` 添加以下子节点：

```
BookPrefab (Node)
├── BookSprite (Sprite)        ← 书脊背景图
├── TitleLabel (Label)         ← 书名文字
├── IconLabel (Label)          ← 书脊顶部图标（🐧☀️🐾等）
└── ShadowNode (Node)          ← 拖拽时显示的阴影
    └── ShadowSprite (Sprite)  ← 阴影图片
```

### 5.3 设置每个节点的属性

#### BookPrefab（根节点）

```
属性检查器（Inspector）：
  Node 组件：
    └── Name: BookPrefab
  
  UI 变换组件（UITransform）：
    └── Content Size: Width=80, Height=120
    └── Anchor: (0.5, 0.5)
  
  Widget 组件：
    └── 不需要
```

#### BookSprite（子节点）

```
选中 BookSprite：
  Sprite 组件：
    └── SpriteFrame: 暂时不选（稍后添加白色占位图）
    └── Color: 白色（代码中动态修改）
  UITransform：
    └── Content Size: Width=80, Height=120
    └── Anchor: (0.5, 0.5)
  Widget (对齐)：
    └── Top: 0, Bottom: 0, Left: 0, Right: 0（填满父节点）
```

#### TitleLabel（子节点）

```
选中 TitleLabel：
  Label 组件：
    └── String: （空，代码中动态设置）
    └── Font Size: 14
    └── Line Height: 16
    └── Horizontal Align: CENTER
    └── Vertical Align: MIDDLE
    └── Overflow: CLAMP
    └── Color: #FFFFFF
  UITransform：
    └── Content Size: Width=70, Height=80
    └── Anchor: (0.5, 0.5)
  Widget (对齐到父节点中心)：
    └── 水平居中，垂直居中
```

#### IconLabel（子节点）

```
选中 IconLabel：
  Label 组件：
    └── String: （空，代码中动态设置）
    └── Font Size: 20
    └── Horizontal Align: CENTER
    └── Vertical Align: TOP
    └── Color: #FFFFFF
  UITransform：
    └── Content Size: Width=40, Height=30
    └── Anchor: (0.5, 1.0)
  Widget (对齐到顶部)：
    └── Top: 5
```

#### ShadowNode & ShadowSprite

```
选中 ShadowNode：
  → 默认 active = false（代码中在拖拽时显示）
  
选中 ShadowSprite（ShadowNode 的子节点）：
  Sprite 组件：
    └── SpriteFrame: 稍后添加阴影图片
    └── Color: rgba(0,0,0,80)
  UITransform：
    └── Content Size: Width=90, Height=130
    └── Anchor: (0.5, 0.5)
  Position: (5, -5, 0)  ← 偏移，模拟阴影
```

### 5.4 挂载 BookItem 脚本

```
选中 BookPrefab 根节点 → 属性检查器 → 添加组件 → 自定义脚本 → 选择 BookItem

然后关联属性：
  BookItem 组件：
    └── BookSprite: 拖入 BookSprite 节点
    └── TitleLabel: 拖入 TitleLabel 节点
    └── ShadowNode: 拖入 ShadowNode 节点
```

### 5.5 保存为预制体

```
层次管理器 → 选中 BookPrefab
  → 拖入资源管理器的 assets/prefabs/ 文件夹
  → 弹出对话框，点击「创建预制体（Create Prefab）」
  → 层次管理器中的 BookPrefab 节点变为蓝色（表示已关联预制体）
```

---

## 第六步：搭建 Game 场景

这是最复杂的场景，需要串联所有组件。

### 6.1 创建节点结构

在 Game 场景中创建以下节点层次：

```
Canvas (Canvas)
├── GameUI (Node)                    ← 游戏 UI（关卡信息、进度条、完成面板）
│   ├── TopBar (Node)
│   │   ├── LevelNameLabel (Label)   ← "第 1 关 · 认识书架"
│   │   ├── LevelDescLabel (Label)   ← "把书放回正确的类别"
│   │   └── ProgressBar (ProgressBar) ← 进度条
│   ├── SortRuleDisplay (Node)       ← 排序规则提示（Level 3 显示）
│   │   └── SortRuleLabel (Label)
│   ├── CompletePanel (Node)         ← 通关面板（初始隐藏）
│   │   ├── CompleteLabel (Label)    ← "✨ 整理完成！"
│   │   ├── NextButton (Button)      ← "下一关"
│   │   ├── ReplayButton (Button)    ← "重玩"
│   │   └── HomeButton (Button)      ← "返回首页"
│   └── BookCountLabel (Label)       ← 书本计数（可选）
│
├── ShelfArea (Node)                 ← 书架区域
│   └── ShelfContainer (Node)        ← 槽位容器（BookShelf.shelfContainer）
│
├── BookSpawnArea (Node)             ← 书本散落区域（BookShelf.bookSpawnArea）
│
├── KnowledgeCard (Node)             ← 知识卡片弹出层
│   ├── CardRoot (Node)              ← 卡片主体（初始 scale=0）
│   │   ├── BookTitleLabel (Label)   ← 书名
│   │   ├── ContentLabel (Label)     ← 知识内容
│   │   ├── ShareTextLabel (Label)   ← 分享语
│   │   └── ContinueButton (Button)  ← "继续整理"
│   └── (背景遮罩 Node)
│
└── AudioManager (Node)              ← 音效管理器
```

### 6.2 设置场景分辨率

```
选中 Canvas → 属性检查器 → Canvas 组件：
  └── Design Resolution: Width=750, Height=1334
  └── Fit Height: ✅ 勾选
  └── Fit Width: ❌ 不勾选
```

### 6.3 设置 ShelfArea 和 BookSpawnArea 位置

```
ShelfArea (Node)：
  Position: (0, 200, 0)
  UITransform: Width=600, Height=200

BookSpawnArea (Node)：
  Position: (0, -200, 0)
  UITransform: Width=600, Height=200
```

### 6.4 设置 CompletePanel 初始隐藏

```
选中 CompletePanel → 属性检查器 → Node 组件 → Active: ❌ 取消勾选
```

### 6.5 设置 KnowledgeCard 初始隐藏

```
选中 CardRoot → 属性检查器 → Node 组件 → Active: ❌ 取消勾选
```

### 6.6 挂载脚本到对应节点

| 节点 | 挂载脚本 | 说明 |
|:----|:---------|:-----|
| Canvas | GameScene.ts | 场景主控制器，串联所有组件 |
| Canvas | GameManager.ts | 游戏主控制器 |
| Canvas | LevelManager.ts | 关卡加载器 |
| ShelfContainer | BookShelf.ts | 书架管理器 |
| KnowledgeCard | KnowledgeCard.ts | 知识卡片弹出 |
| AudioManager | AudioManager.ts | 音效管理器 |
| GameUI | GameUI.ts | 游戏内 UI |
| ProgressBar | 不需要挂脚本，直接引用 | |

---

## 第七步：搭建 Home 场景

### 7.1 创建节点结构

```
Canvas (Canvas)
├── TitleLabel (Label)            ← "书境"
├── SubtitleLabel (Label)         ← "整理这本书，发现一个世界"
├── StartButton (Button)          ← "开始整理"
└── VersionLabel (Label)          ← "v0.1.0"
```

### 7.2 挂载脚本

```
Canvas → 添加组件 → HomeUI.ts
  └── 关联属性：
      TitleLabel → TitleLabel 节点
      StartButton → StartButton 节点
      SubtitleLabel → SubtitleLabel 节点
```

### 7.3 设置场景启动

```
项目设置 → 项目数据 → 启动场景：
  └── 选择 Home.scene
```

---

## 第八步：关联属性引用

这是最容易被忽略的步骤。所有脚本之间的引用需要手动拖拽关联。

### 8.1 GameScene 组件引用

选中 Canvas（Game 场景中）→ 属性检查器 → GameScene 组件：

| 属性 | 拖拽目标 |
|:----|:---------|
| gameManager | Canvas 节点自身（或 GameManager 组件所在节点） |
| levelManager | Canvas 节点自身（或 LevelManager 组件所在节点） |
| bookShelf | ShelfContainer 节点（挂载了 BookShelf 组件） |
| knowledgeCard | KnowledgeCard 节点 |
| audioManager | AudioManager 节点 |
| gameUI | GameUI 节点 |

### 8.2 GameManager 组件引用

| 属性 | 拖拽目标 |
|:----|:---------|
| levelManager | Canvas 节点（LevelManager 组件） |
| bookShelf | ShelfContainer 节点（BookShelf 组件） |
| knowledgeCard | KnowledgeCard 节点 |

### 8.3 BookShelf 组件引用

| 属性 | 拖拽目标 |
|:----|:---------|
| bookPrefab | assets/prefabs/BookPrefab（预制体） |
| shelfContainer | ShelfContainer 节点（自身） |
| bookSpawnArea | BookSpawnArea 节点 |
| sortRuleDisplay | SortRuleDisplay 节点 |
| sortRuleLabel | SortRuleLabel 节点 |

### 8.4 KnowledgeCard 组件引用

| 属性 | 拖拽目标 |
|:----|:---------|
| cardRoot | CardRoot 节点 |
| bookTitleLabel | BookTitleLabel 节点 |
| contentLabel | ContentLabel 节点 |
| shareTextLabel | ShareTextLabel 节点 |
| continueButton | ContinueButton 节点 |

### 8.5 AudioManager 组件引用

| 属性 | 拖拽目标 |
|:----|:---------|
| audioSource | AudioManager 节点上的 AudioSource 组件（需要先添加 AudioSource 组件） |

### 8.6 GameUI 组件引用

| 属性 | 拖拽目标 |
|:----|:---------|
| levelNameLabel | LevelNameLabel 节点 |
| levelDescLabel | LevelDescLabel 节点 |
| progressBar | ProgressBar 节点 |
| completePanel | CompletePanel 节点 |
| completeLabel | CompleteLabel 节点 |
| nextButton | NextButton 节点 |
| replayButton | ReplayButton 节点 |
| homeButton | HomeButton 节点 |

---

## 第九步：添加音效和美术资源

### 9.1 音效资源

**准备音效文件**（你可以自己找，或者先跳过用默认音效）：

```
assets/resources/audio/
├── pickup.wav        ← 拿起书本（0.15s，轻快"哒"）
├── snap.wav          ← 归位吸附（0.2s，清脆"啪"——最重要）
├── knowledge.wav     ← 知识卡片弹出（0.5s，柔和"叮"）
└── error.wav         ← 错误回弹（0.3s，低沉"唔"）
```

**临时替代方案**：如果找不到音效，可以先注释掉音效调用，不影响核心功能测试。

### 9.2 美术资源（临时方案）

**在没有美术资源的情况下，可以用 Cocos 内置的白色方块 + 代码着色替代：**

```
1. 资源管理器 → 右键 → 新建 → SpriteFrame → 命名为 "white_block"
2. 在编辑器中打开 white_block，设置为纯白色 4x4 像素图片
3. 这个白色方块可以通过 Sprite 的 Color 属性变任意颜色
```

**书脊颜色**：代码中 `BookItem.initialize()` 通过 `bookSprite.color = new Color().fromHEX(color.substring(1))` 动态设置颜色，不需要单独的图片资源。

**槽位图标**：可以用 emoji 文字替代图片（Label 显示 🐾🌌📜🔬），不需要图片资源。

### 9.3 最终资源清单

```
assets/resources/
└── textures/
    ├── shelf.png              ← 书架背景（可选，没有也可以）
    ├── knowledge_card.png     ← 知识卡片背景（可选）
    └── (其他装饰资源)
```

**没有美术资源也能跑**：代码中所有视觉元素都有程序化生成的替代方案。

---

## 第十步：预览运行

### 10.1 启动场景设置

```
项目 → 项目设置 → 项目数据 → 启动场景：
  └── 选择 Home.scene
```

### 10.2 编辑器预览

点击编辑器顶部工具栏的 **▶ 播放按钮**：

```
Cocos Creator 编辑器 → 顶部工具栏 → ▶ 播放（或按 Ctrl+P）
```

浏览器会自动打开，你应该能看到：

```
┌──────────────────────┐
│                      │
│      书境            │
│                      │
│ 整理这本书，发现一个世界 │
│                      │
│   [开始整理]          │
│                      │
│      v0.1.0          │
└──────────────────────┘
```

点击「开始整理」→ 进入 Game 场景 → 书本掉落 → 可以拖拽。

### 10.3 浏览器调试

```
按 F12 打开开发者工具 → Console 面板
  → 查看是否有报错信息
  → 如果有，根据报错信息排查
```

---

## 第十一步：构建微信小游戏

### 11.1 安装微信开发者工具

从微信官方下载并安装：

👉 https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### 11.2 设置微信小游戏 AppID

```
项目 → 项目设置 → 服务 → 微信小游戏：
  └── AppID: 你的微信小游戏 AppID（在微信公众平台注册后获取）
```

### 11.3 构建

```
菜单 → 项目 → 构建发布
  → 发布平台：微信小游戏（WeChat Mini Game）
  → 构建路径：build/wechatgame
  → 点击「构建」
```

### 11.4 打开微信开发者工具

```
构建完成后 → 点击「运行」
  → 自动打开微信开发者工具
  → 扫码登录
  → 点击「预览」→ 生成二维码
  → 手机扫码 → 真机运行
```

---

## 常见问题排查

### Q1：脚本报错 "Cannot find module ..."

**原因**：TypeScript 编译路径问题。

**解决**：
```
项目 → 项目设置 → 脚本编译：
  └── 确保 target 设置为 es6 或更高
  └── 确保 module 设置为 commonjs 或 es2015
```

### Q2：拖拽没反应

**原因**：节点没有正确接收触摸事件。

**解决**：
```
选中 BookPrefab 根节点 → 属性检查器 → Node 组件：
  └── 确保没有禁用交互（Interactable 为勾选状态）
  
选中 Canvas → 属性检查器：
  └── Canvas 组件 → 确保 Event Dispatcher 已启用
```

### Q3：知识卡片不显示

**原因**：knowledge.json 加载失败。

**解决**：
```
检查 resources/data/knowledge.json 是否在 paths 中注册
  项目 → 资源管理 → 确保 resources 目录已勾选
  检查 Console 是否有 "加载知识数据失败" 错误
```

### Q4：微信小游戏构建报错

**原因**：微信小游戏包名限制。

**解决**：
```
项目设置 → 微信小游戏 → 配置 AppID
  确保 AppID 正确
  确保微信开发者工具已登录
```

### Q5：大小写问题

**原因**：Windows 不区分大小写，但微信小游戏构建环境区分。

**解决**：
```
确保所有 import 路径的大小写与文件名完全一致。
例如：import { BookItem } from './book/BookItem';
文件名是 BookItem.ts，不是 bookitem.ts 或 bookItem.ts。
```

---

## 附录：验证清单

完成所有步骤后，对照检查：

- [ ] Cocos Creator 3.x 已安装
- [ ] 项目已创建，代码已导入
- [ ] 3 个场景已创建（Boot, Home, Game）
- [ ] BookPrefab 已创建并挂载 BookItem 脚本
- [ ] Game 场景中所有节点已创建
- [ ] 所有脚本已挂载到对应节点
- [ ] 所有属性引用已关联
- [ ] 启动场景设置为 Home.scene
- [ ] 点击播放按钮能正常显示首页
- [ ] 点击「开始整理」能进入游戏
- [ ] 书本能拖拽、吸附、回弹
- [ ] 知识卡片能弹出
- [ ] 3 个关卡能正常切换
- [ ] 微信小游戏构建成功

---

*完成这些步骤后，你就能在浏览器和手机上体验到《书境》Prototype 0.1 的核心玩法了。*