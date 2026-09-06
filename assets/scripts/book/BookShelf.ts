// BookShelf.ts
// 书架管理器：构建书架槽位、生成书本、管理排序

import { _decorator, Component, Node, Vec3, tween, instantiate, Prefab, Label, Sprite, Color, UITransform, resources } from 'cc';
import { BookItem, BookSlotInfo } from './BookItem';
import { LevelData, SlotData, BookData } from '../core/LevelManager';

const { ccclass, property } = _decorator;

@ccclass('BookShelf')
export class BookShelf extends Component {
    @property({ type: Prefab })
    public bookPrefab: Prefab = null;

    @property({ type: Node })
    public shelfContainer: Node = null;

    @property({ type: Node })
    public bookSpawnArea: Node = null;

    @property({ type: Node })
    public sortRuleDisplay: Node = null;

    @property({ type: Label })
    public sortRuleLabel: Label = null;

    private _slots: BookSlotInfo[] = [];
    private _books: BookItem[] = [];
    private _levelData: LevelData = null;
    private _placedBookCount: number = 0;

    // 回调
    public onBookPlaced: (bookId: string) => void = null;
    public onBookRevealed: (bookId: string, knowledgeId: string) => void = null;

    // 音频播放器
    public audioPlayer: any = null;

    buildShelf(levelData: LevelData) {
        this._levelData = levelData;
        this._slots = [];
        this._books = [];
        this._placedBookCount = 0;

        // 清空
        this.shelfContainer.removeAllChildren();
        this.bookSpawnArea.removeAllChildren();

        // 显示排序规则提示（Level 3 需要）
        this._showSortRules(levelData);

        // 创建书架槽位
        this._createSlots(levelData.slots);
    }

    private _showSortRules(levelData: LevelData) {
        if (!this.sortRuleDisplay || !this.sortRuleLabel) return;

        const hasSortRules = levelData.slots.some(s => s.sortRule);
        this.sortRuleDisplay.active = hasSortRules;

        if (hasSortRules) {
            let ruleText = '📋 整理规则：\n';
            for (const slot of levelData.slots) {
                if (slot.sortRule) {
                    ruleText += `${slot.icon} ${slot.label}：${slot.sortRule}\n`;
                    if (slot.sortRuleDetail) {
                        ruleText += `  ${slot.sortRuleDetail}\n`;
                    }
                }
            }
            this.sortRuleLabel.string = ruleText;
        }
    }

    private _createSlots(slotDataList: SlotData[]) {
        const shelfWidth = this.shelfContainer.getComponent(UITransform).width;
        const slotCount = slotDataList.length;
        const slotWidth = 120;
        const totalWidth = slotCount * slotWidth;
        const startX = -totalWidth / 2 + slotWidth / 2;

        for (let i = 0; i < slotDataList.length; i++) {
            const slotData = slotDataList[i];
            const slotNode = new Node(`Slot_${slotData.id}`);
            slotNode.setParent(this.shelfContainer);

            // 每个槽位是一个分类区（包含多个排序位置）
            // 对于 Level 1/2，一个槽位放多个书
            // 对于 Level 3，一个槽位内包含多个排序位置

            const x = startX + i * slotWidth;
            const y = 0;
            slotNode.setPosition(new Vec3(x, y, 0));

            const slotWidthForCategory = 140; // 分类槽宽度

            // 添加槽位背景
            const slotBg = new Node(`SlotBg_${slotData.id}`);
            slotBg.setParent(slotNode);
            const bgSprite = slotBg.addComponent(Sprite);
            // 设置半透明背景（颜色由外部图片或代码控制）
            // 这里简化：使用纯色矩形

            // 标签
            const labelNode = new Node(`Label_${slotData.id}`);
            labelNode.setParent(slotNode);
            const label = labelNode.addComponent(Label);
            label.string = `${slotData.icon} ${slotData.label}`;
            label.fontSize = 24;
            label.color = Color.WHITE;
            labelNode.setPosition(new Vec3(0, -80, 0));

            // 存储槽位信息
            const slotInfo: BookSlotInfo = {
                slotId: slotData.id,
                node: slotNode,
                position: slotNode.position.clone(),
                highlight: () => { this._highlightSlot(slotNode, true); },
                unhighlight: () => { this._highlightSlot(slotNode, false); },
                flashError: () => { this._flashSlot(slotNode); },
                setSortOrder: (order: number) => { this._setSlotSortOrder(slotNode, order); }
            };

            this._slots.push(slotInfo);
        }
    }

    private _highlightSlot(slotNode: Node, highlighted: boolean) {
        // 高亮槽位：发光效果（实际实现可以使用 Sprite 颜色变化或光效节点）
        const bg = slotNode.getChildByName('SlotBg');
        if (bg) {
            const sprite = bg.getComponent(Sprite);
            if (sprite) {
                sprite.color = highlighted
                    ? new Color(255, 255, 200, 180)
                    : new Color(200, 200, 200, 100);
            }
        }
    }

    private _flashSlot(slotNode: Node) {
        // 闪烁反馈：红色闪烁后恢复
        const bg = slotNode.getChildByName('SlotBg');
        if (bg) {
            const sprite = bg.getComponent(Sprite);
            if (sprite) {
                const originalColor = sprite.color.clone();
                sprite.color = new Color(255, 150, 150, 180);
                this.scheduleOnce(() => {
                    sprite.color = originalColor;
                }, 0.3);
            }
        }

        // 轻微晃动书架
        tween(this.shelfContainer)
            .to(0.05, { position: new Vec3(-5, 0, 0) })
            .to(0.05, { position: new Vec3(5, 0, 0) })
            .to(0.05, { position: new Vec3(0, 0, 0) })
            .start();
    }

    private _setSlotSortOrder(slotNode: Node, order: number) {
        // 在 Level 3 中，记录排序位置已被占用
        // 实际实现需要管理槽位内的排序子位置
    }

    spawnBooks(bookDataList: BookData[], onComplete: () => void) {
        if (!this.bookPrefab) {
            console.error('bookPrefab is null');
            onComplete();
            return;
        }

        const spawnAreaWidth = this.bookSpawnArea.getComponent(UITransform).width;
        const count = bookDataList.length;
        const spacing = Math.min(80, spawnAreaWidth / (count + 1));
        const startX = -spacing * (count - 1) / 2;

        for (let i = 0; i < count; i++) {
            const bookData = bookDataList[i];
            const bookNode = instantiate(this.bookPrefab);
            bookNode.setParent(this.bookSpawnArea);

            // 初始散落位置（带随机偏移，模拟散落感）
            const baseX = startX + i * spacing;
            const randomOffsetX = (Math.random() - 0.5) * 30;
            const randomOffsetY = (Math.random() - 0.5) * 20;
            const targetPos = new Vec3(baseX + randomOffsetX, -50 + randomOffsetY, 0);

            // 从上方掉落动画
            const startPos = new Vec3(targetPos.x, targetPos.y + 200, 0);
            bookNode.setPosition(startPos);

            const bookItem = bookNode.getComponent(BookItem);
            if (bookItem) {
                bookItem.initialize(
                    bookData.id,
                    bookData.title,
                    bookData.color,
                    bookData.icon,
                    bookData.slotId,
                    bookData.knowledgeId,
                    bookData.sortOrder || 0,
                    this._slots,
                    this.shelfContainer.getComponent(UITransform).width
                );

                bookItem.audioPlayer = this.audioPlayer;

                bookItem.onPlaced = (bookId: string) => {
                    this._placedBookCount++;
                    if (this.onBookPlaced) {
                        this.onBookPlaced(bookId);
                    }
                };

                bookItem.onRevealed = (bookId: string, knowledgeId: string) => {
                    if (this.onBookRevealed) {
                        this.onBookRevealed(bookId, knowledgeId);
                    }
                };

                this._books.push(bookItem);
            }

            // 掉落动画
            tween(bookNode)
                .delay(i * 0.08)
                .to(0.4, { position: targetPos }, { easing: 'bounceOut' })
                .start();
        }

        // 全部生成后回调
        this.scheduleOnce(() => {
            onComplete();
        }, count * 0.08 + 0.5);
    }

    onLevelComplete() {
        // 关卡完成庆祝效果
        // 所有书一起轻微跳动
        for (const bookItem of this._books) {
            if (bookItem && bookItem.node) {
                tween(bookItem.node)
                    .to(0.1, { scale: new Vec3(1.05, 1.05, 1) })
                    .to(0.1, { scale: new Vec3(1, 1, 1) })
                    .start();
            }
        }
    }
}