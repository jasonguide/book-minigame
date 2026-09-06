// LevelManager.ts
// 关卡加载器：读取 JSON 数据，构造关卡运行时对象

import { _decorator, Component, Node, resources, JsonAsset } from 'cc';

const { ccclass, property } = _decorator;

export interface SlotData {
    id: string;
    label: string;
    icon: string;
    sortRule: string | null;
    sortRuleDetail?: string;
}

export interface BookData {
    id: string;
    title: string;
    slotId: string;
    knowledgeId: string;
    color: string;
    icon: string;
    sortOrder?: number;
}

export interface LevelData {
    id: number;
    name: string;
    description: string;
    unlockHint: string;
    slots: SlotData[];
    books: BookData[];
}

export type LevelsData = { levels: LevelData[] };

@ccclass('LevelManager')
export class LevelManager extends Component {
    private _levels: LevelData[] = [];
    private _currentLevel: LevelData = null;

    public get currentLevel(): LevelData { return this._currentLevel; }

    loadLevel(levelId: number, callback: (level: LevelData) => void) {
        if (this._levels.length > 0) {
            // 缓存已加载
            this._currentLevel = this._levels.find(l => l.id === levelId);
            if (this._currentLevel) {
                callback(this._currentLevel);
                return;
            }
        }

        // 从 assets/data/levels.json 加载
        resources.load('data/levels', JsonAsset, (err, asset) => {
            if (err) {
                console.error('加载关卡数据失败:', err);
                return;
            }
            const data = asset.json as LevelsData;
            this._levels = data.levels;
            this._currentLevel = this._levels.find(l => l.id === levelId);
            if (this._currentLevel) {
                callback(this._currentLevel);
            } else {
                console.error(`未找到关卡 ID: ${levelId}`);
            }
        });
    }

    getLevelCount(): number {
        return this._levels.length;
    }
}