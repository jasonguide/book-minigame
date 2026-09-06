// HomeUI.ts
// 首页界面

import { _decorator, Component, Node, Label, director } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('HomeUI')
export class HomeUI extends Component {
    @property({ type: Label })
    public titleLabel: Label = null;

    @property({ type: Node })
    public startButton: Node = null;

    @property({ type: Label })
    public subtitleLabel: Label = null;

    onLoad() {
        if (this.titleLabel) {
            this.titleLabel.string = '书境';
        }
        if (this.subtitleLabel) {
            this.subtitleLabel.string = '整理这本书，发现一个世界';
        }
        if (this.startButton) {
            this.startButton.on(Node.EventType.TOUCH_END, this._onStart, this);
        }
    }

    private _onStart() {
        director.loadScene('Game');
    }
}