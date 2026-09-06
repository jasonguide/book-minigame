// GameManager.ts
// 游戏主控制器，管理关卡生命周期、状态切换

import { _decorator, Component, Node, director } from 'cc';
import { LevelManager } from './LevelManager';
import { BookShelf } from '../book/BookShelf';
import { KnowledgeCard } from '../knowledge/KnowledgeCard';

const { ccclass, property } = _decorator;

export enum GameState {
    IDLE,
    PLAYING,
    LEVEL_COMPLETE,
}

@ccclass('GameManager')
export class GameManager extends Component {
    @property({ type: LevelManager })
    public levelManager: LevelManager = null;

    @property({ type: BookShelf })
    public bookShelf: BookShelf = null;

    @property({ type: KnowledgeCard })
    public knowledgeCard: KnowledgeCard = null;

    private _state: GameState = GameState.IDLE;
    private _currentLevelId: number = 1;
    private _bookPlacedCount: number = 0;
    private _totalBookCount: number = 0;

    public get state(): GameState { return this._state; }

    start() {
        this.loadLevel(this._currentLevelId);
    }

    loadLevel(levelId: number) {
        this._state = GameState.PLAYING;
        this._currentLevelId = levelId;
        this._bookPlacedCount = 0;

        this.levelManager.loadLevel(levelId, (levelData) => {
            this._totalBookCount = levelData.books.length;
            this.bookShelf.buildShelf(levelData);
            this.bookShelf.spawnBooks(levelData.books, () => {
                // 书本散落动画完成，可以开始游戏
                this._state = GameState.PLAYING;
            });
        });
    }

    onBookPlaced(bookId: string) {
        this._bookPlacedCount++;
        // 播放归位音效由 BookItem 组件触发
    }

    onBookRevealed(bookId: string, knowledgeId: string) {
        // 书本归位后翻开，展示知识卡片
        if (knowledgeId) {
            this.knowledgeCard.show(knowledgeId, () => {
                this.checkLevelComplete();
            });
        } else {
            this.checkLevelComplete();
        }
    }

    private checkLevelComplete() {
        if (this._bookPlacedCount >= this._totalBookCount) {
            this._state = GameState.LEVEL_COMPLETE;
            this.scheduleOnce(() => {
                this.bookShelf.onLevelComplete();
            }, 0.3);
        }
    }

    onNextLevel() {
        const nextId = this._currentLevelId + 1;
        if (nextId <= 3) {
            this.loadLevel(nextId);
        } else {
            // 所有关卡完成，回到首页
            director.loadScene('Home');
        }
    }

    onReplay() {
        this.loadLevel(this._currentLevelId);
    }
}