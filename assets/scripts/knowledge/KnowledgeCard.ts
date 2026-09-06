// KnowledgeCard.ts
// 知识卡片弹出组件
// 书归位后翻开，展示知识内容

import { _decorator, Component, Node, Label, Sprite, Color, tween, Vec3, resources, JsonAsset, director } from 'cc';

const { ccclass, property } = _decorator;

interface KnowledgeEntry {
    id: string;
    title: string;
    content: string;
    bookTitle: string;
    shareText: string;
}

@ccclass('KnowledgeCard')
export class KnowledgeCard extends Component {
    @property({ type: Node })
    public cardRoot: Node = null;

    @property({ type: Label })
    public bookTitleLabel: Label = null;

    @property({ type: Label })
    public contentLabel: Label = null;

    @property({ type: Label })
    public shareTextLabel: Label = null;

    @property({ type: Node })
    public continueButton: Node = null;

    private _knowledgeData: Record<string, KnowledgeEntry> = {};
    private _onDismiss: (() => void) = null;
    private _isShowing: boolean = false;

    public get isShowing(): boolean { return this._isShowing; }

    onLoad() {
        // 初始隐藏
        if (this.cardRoot) {
            this.cardRoot.active = false;
            this.cardRoot.scale = new Vec3(0, 0, 0);
        }

        // 加载知识数据
        resources.load('data/knowledge', JsonAsset, (err, asset) => {
            if (err) {
                console.error('加载知识数据失败:', err);
                return;
            }
            this._knowledgeData = asset.json as Record<string, KnowledgeEntry>;
        });

        // 绑定继续按钮
        if (this.continueButton) {
            this.continueButton.on(Node.EventType.TOUCH_END, this._onContinue, this);
        }
    }

    show(knowledgeId: string, onDismiss: () => void) {
        if (this._isShowing) return;

        const entry = this._knowledgeData[knowledgeId];
        if (!entry) {
            // 没有知识卡片，直接继续
            if (onDismiss) onDismiss();
            return;
        }

        this._isShowing = true;
        this._onDismiss = onDismiss;

        // 填充内容
        if (this.bookTitleLabel) {
            this.bookTitleLabel.string = entry.bookTitle;
        }
        if (this.contentLabel) {
            this.contentLabel.string = entry.content;
        }
        if (this.shareTextLabel) {
            this.shareTextLabel.string = `📖 ${entry.shareText}`;
        }

        // 弹入动画
        this.cardRoot.active = true;
        tween(this.cardRoot)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
    }

    private _onContinue() {
        if (!this._isShowing) return;

        // 弹出动画
        tween(this.cardRoot)
            .to(0.2, { scale: new Vec3(0, 0, 0) }, { easing: 'sineIn' })
            .call(() => {
                this.cardRoot.active = false;
                this._isShowing = false;
                if (this._onDismiss) {
                    this._onDismiss();
                    this._onDismiss = null;
                }
            })
            .start();
    }
}