// GameUI.ts
// 游戏内 UI：关卡信息、进度、完成状态

import { _decorator, Component, Node, Label, ProgressBar, director } from 'cc';
import { LevelData } from '../core/LevelManager';

const { ccclass, property } = _decorator;

@ccclass('GameUI')
export class GameUI extends Component {
    @property({ type: Label })
    public levelNameLabel: Label = null;

    @property({ type: Label })
    public levelDescLabel: Label = null;

    @property({ type: ProgressBar })
    public progressBar: ProgressBar = null;

    @property({ type: Node })
    public completePanel: Node = null;

    @property({ type: Label })
    public completeLabel: Label = null;

    @property({ type: Node })
    public nextButton: Node = null;

    @property({ type: Node })
    public replayButton: Node = null;

    @property({ type: Node })
    public homeButton: Node = null;

    private _onNextLevel: (() => void) = null;
    private _onReplay: (() => void) = null;

    onLoad() {
        if (this.completePanel) {
            this.completePanel.active = false;
        }
        if (this.nextButton) {
            this.nextButton.on(Node.EventType.TOUCH_END, () => {
                if (this._onNextLevel) this._onNextLevel();
            }, this);
        }
        if (this.replayButton) {
            this.replayButton.on(Node.EventType.TOUCH_END, () => {
                if (this._onReplay) this._onReplay();
            }, this);
        }
        if (this.homeButton) {
            this.homeButton.on(Node.EventType.TOUCH_END, () => {
                director.loadScene('Home');
            }, this);
        }
    }

    setLevelInfo(level: LevelData) {
        if (this.levelNameLabel) {
            this.levelNameLabel.string = `第 ${level.id} 关 · ${level.name}`;
        }
        if (this.levelDescLabel) {
            this.levelDescLabel.string = level.description;
        }
    }

    setProgress(placed: number, total: number) {
        if (this.progressBar) {
            this.progressBar.progress = total > 0 ? placed / total : 0;
        }
    }

    showComplete(hasNextLevel: boolean) {
        if (this.completePanel) {
            this.completePanel.active = true;
        }
        if (this.completeLabel) {
            this.completeLabel.string = '✨ 整理完成！';
        }
        if (this.nextButton) {
            this.nextButton.active = hasNextLevel;
        }
    }

    setCallbacks(onNext: () => void, onReplay: () => void) {
        this._onNextLevel = onNext;
        this._onReplay = onReplay;
    }
}