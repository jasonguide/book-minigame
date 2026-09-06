// BookItem.ts
// 书本拖拽组件 - 核心交互
// 触摸反馈链：浮起 → 放大 → 跟随 → 吸附 → 回弹

import { _decorator, Component, Node, EventTouch, Vec3, tween, UITransform, Sprite, Label, Color, AudioClip } from 'cc';

const { ccclass, property } = _decorator;

export interface BookSlotInfo {
    slotId: string;
    node: Node;
    position: Vec3;
    highlight: () => void;
    unhighlight: () => void;
    flashError: () => void;
    setSortOrder: (order: number) => void;
}

@ccclass('BookItem')
export class BookItem extends Component {
    @property({ type: Sprite })
    public bookSprite: Sprite = null;

    @property({ type: Label })
    public titleLabel: Label = null;

    @property({ type: Node })
    public shadowNode: Node = null;

    // ---- 公开属性 ----
    public bookId: string = '';
    public targetSlotId: string = '';
    public knowledgeId: string = '';
    public sortOrder: number = 0;
    public isPlaced: boolean = false;
    public onPlaced: (bookId: string) => void = null;
    public onRevealed: (bookId: string, knowledgeId: string) => void = null;

    // ---- 内部状态 ----
    private _isDragging: boolean = false;
    private _originalPos: Vec3 = new Vec3();
    private _dragOffset: Vec3 = new Vec3();
    private _nearestSlot: BookSlotInfo | null = null;
    private _allSlots: BookSlotInfo[] = [];
    private _shelfAreaWidth: number = 750;
    private _isReturning: boolean = false;

    // 配置参数
    private readonly SCALE_ON_DRAG = 1.1;
    private readonly SNAP_THRESHOLD_RATIO = 0.12;
    private readonly TWEEN_DURATION_SNAP = 0.15;
    private readonly TWEEN_DURATION_RETURN = 0.25;

    // 音效播放器（由外部注入）
    public audioPlayer: {
        playPickup: () => void;
        playSnap: () => void;
        playKnowledge: () => void;
        playError: () => void;
    } = null;

    public initialize(
        bookId: string,
        title: string,
        color: string,
        icon: string,
        targetSlotId: string,
        knowledgeId: string,
        sortOrder: number,
        slots: BookSlotInfo[],
        shelfAreaWidth: number
    ) {
        this.bookId = bookId;
        this.targetSlotId = targetSlotId;
        this.knowledgeId = knowledgeId;
        this.sortOrder = sortOrder;
        this._allSlots = slots;
        this._shelfAreaWidth = shelfAreaWidth;
        this.isPlaced = false;

        // 设置书名
        if (this.titleLabel) {
            this.titleLabel.string = title;
        }

        // 设置书脊颜色
        if (this.bookSprite) {
            this.bookSprite.color = new Color().fromHEX(color.substring(1));
        }

        // 设置图标（放在书脊顶部）
        // 可以通过额外 Sprite 或 Label 显示 icon，这里从简
    }

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch) {
        if (this.isPlaced || this._isReturning) return;

        this._isDragging = true;
        this._originalPos = this.node.position.clone();

        // 计算拖拽偏移（触摸点相对于节点锚点的偏移）
        const touchPos = event.getUILocation();
        const nodePos = this.node.position;
        this._dragOffset = new Vec3(touchPos.x - nodePos.x, touchPos.y - nodePos.y, 0);

        // 放大反馈
        this.node.setScale(this.SCALE_ON_DRAG, this.SCALE_ON_DRAG, 1);

        // 提升层级
        this.node.setSiblingIndex(999);

        // 显示阴影
        if (this.shadowNode) {
            this.shadowNode.active = true;
        }

        // 音效：拿起
        if (this.audioPlayer) {
            this.audioPlayer.playPickup();
        }
    }

    private onTouchMove(event: EventTouch) {
        if (!this._isDragging) return;

        // 跟随手指移动
        const touchPos = event.getUILocation();
        this.node.setPosition(
            touchPos.x - this._dragOffset.x,
            touchPos.y - this._dragOffset.y,
            0
        );

        // 检测最近的槽位
        this._detectNearestSlot();
    }

    private onTouchEnd() {
        if (!this._isDragging) return;
        this._isDragging = false;

        this.node.setScale(1, 1, 1);

        // 隐藏阴影
        if (this.shadowNode) {
            this.shadowNode.active = false;
        }

        if (this._nearestSlot && this._isCorrectSlot(this._nearestSlot)) {
            // ✅ 正确归位
            this._snapToSlot(this._nearestSlot);
        } else {
            // ❌ 放错位置或没放到槽位
            this._bounceBack();
        }
    }

    private _detectNearestSlot() {
        const bookPos = this.node.position;
        const threshold = this._shelfAreaWidth * this.SNAP_THRESHOLD_RATIO;

        let minDist = Infinity;
        let nearest: BookSlotInfo | null = null;

        for (const slot of this._allSlots) {
            const dist = Vec3.distance(bookPos, slot.position);
            if (dist < minDist && dist < threshold) {
                minDist = dist;
                nearest = slot;
            }
        }

        // 高亮/取消高亮
        if (nearest !== this._nearestSlot) {
            if (this._nearestSlot) {
                this._nearestSlot.unhighlight();
            }
            if (nearest) {
                nearest.highlight();
            }
        }
        this._nearestSlot = nearest;
    }

    private _isCorrectSlot(slot: BookSlotInfo): boolean {
        return slot.slotId === this.targetSlotId;
    }

    private _snapToSlot(slot: BookSlotInfo) {
        this.isPlaced = true;
        this._isReturning = true;

        // 取消高亮
        slot.unhighlight();

        // 通知槽位已被占用
        if (this.sortOrder > 0) {
            slot.setSortOrder(this.sortOrder);
        }

        // 吸附动画
        tween(this.node)
            .to(this.TWEEN_DURATION_SNAP, {
                position: slot.position
            }, {
                easing: 'backOut'
            })
            .call(() => {
                if (this.audioPlayer) {
                    this.audioPlayer.playSnap(); // "啪"——最重要的音效
                }

                // 通知 GameManager 书已归位
                if (this.onPlaced) {
                    this.onPlaced(this.bookId);
                }

                // 延迟翻开书本展示知识
                this.scheduleOnce(() => {
                    this._isReturning = false;
                    if (this.audioPlayer) {
                        this.audioPlayer.playKnowledge();
                    }
                    if (this.onRevealed) {
                        this.onRevealed(this.bookId, this.knowledgeId);
                    }
                }, 0.3);
            })
            .start();
    }

    private _bounceBack() {
        this._isReturning = true;

        // 如果靠近某个槽位但类型不对，闪烁提示
        if (this._nearestSlot) {
            this._nearestSlot.unhighlight();
            this._nearestSlot.flashError();
        }

        // 音效：错误回弹
        if (this.audioPlayer) {
            this.audioPlayer.playError();
        }

        // 回弹动画
        tween(this.node)
            .to(this.TWEEN_DURATION_RETURN, {
                position: this._originalPos
            }, {
                easing: 'sineOut'
            })
            .call(() => {
                this._isReturning = false;
            })
            .start();
    }
}