// GameScene.ts
// 游戏场景主控制器 - 串联所有组件

import { _decorator, Component, Node, director } from 'cc';
import { GameManager, GameState } from './core/GameManager';
import { LevelManager, LevelData } from './core/LevelManager';
import { BookShelf } from './book/BookShelf';
import { KnowledgeCard } from './knowledge/KnowledgeCard';
import { AudioManager } from './core/AudioManager';
import { GameUI } from './ui/GameUI';

const { ccclass, property } = _decorator;

@ccclass('GameScene')
export class GameScene extends Component {
    @property({ type: GameManager })
    public gameManager: GameManager = null;

    @property({ type: LevelManager })
    public levelManager: LevelManager = null;

    @property({ type: BookShelf })
    public bookShelf: BookShelf = null;

    @property({ type: KnowledgeCard })
    public knowledgeCard: KnowledgeCard = null;

    @property({ type: AudioManager })
    public audioManager: AudioManager = null;

    @property({ type: GameUI })
    public gameUI: GameUI = null;

    private _currentLevel: LevelData = null;
    private _bookPlacedCount: number = 0;
    private _totalBookCount: number = 0;
    private _isProcessingBook: boolean = false;

    onLoad() {
        // 注入音频播放器到 BookShelf
        if (this.bookShelf && this.audioManager) {
            this.bookShelf.audioPlayer = {
                playPickup: () => this.audioManager.playPickup(),
                playSnap: () => this.audioManager.playSnap(),
                playKnowledge: () => this.audioManager.playKnowledge(),
                playError: () => this.audioManager.playError(),
            };
        }

        // 设置回调
        this.bookShelf.onBookPlaced = (bookId: string) => {
            this._onBookPlaced(bookId);
        };

        this.bookShelf.onBookRevealed = (bookId: string, knowledgeId: string) => {
            this._onBookRevealed(bookId, knowledgeId);
        };

        this.gameUI.setCallbacks(
            () => this._onNextLevel(),
            () => this._onReplay()
        );
    }

    start() {
        this._loadLevel(1);
    }

    private _loadLevel(levelId: number) {
        this._bookPlacedCount = 0;
        this._isProcessingBook = false;

        this.levelManager.loadLevel(levelId, (level) => {
            this._currentLevel = level;
            this._totalBookCount = level.books.length;

            // 更新 UI
            this.gameUI.setLevelInfo(level);
            this.gameUI.setProgress(0, this._totalBookCount);

            // 构建书架和书本
            this.bookShelf.buildShelf(level);
            this.bookShelf.spawnBooks(level.books, () => {
                // 准备就绪，等待玩家操作
            });
        });
    }

    private _onBookPlaced(bookId: string) {
        this._bookPlacedCount++;
        this.gameUI.setProgress(this._bookPlacedCount, this._totalBookCount);
    }

    private _onBookRevealed(bookId: string, knowledgeId: string) {
        if (this._isProcessingBook) return;
        this._isProcessingBook = true;

        // 展示知识卡片
        this.knowledgeCard.show(knowledgeId, () => {
            this._isProcessingBook = false;

            // 检查是否全部完成
            if (this._bookPlacedCount >= this._totalBookCount) {
                this._onLevelComplete();
            }
        });
    }

    private _onLevelComplete() {
        const hasNext = this._currentLevel.id < 3;
        this.gameUI.showComplete(hasNext);

        // 书架完成动画
        this.bookShelf.onLevelComplete();
    }

    private _onNextLevel() {
        const nextId = this._currentLevel.id + 1;
        if (nextId <= 3) {
            this._loadLevel(nextId);
        }
    }

    private _onReplay() {
        this._loadLevel(this._currentLevel.id);
    }
}