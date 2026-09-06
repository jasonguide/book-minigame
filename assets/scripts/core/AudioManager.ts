// AudioManager.ts
// 音效管理器 - 3 个核心音效
// pickup.wav - 拿起书本
// snap.wav - 归位吸附（最重要）
// knowledge.wav - 知识卡片弹出

import { _decorator, Component, resources, AudioClip, AudioSource } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    @property({ type: AudioSource })
    public audioSource: AudioSource = null;

    private _pickupClip: AudioClip = null;
    private _snapClip: AudioClip = null;
    private _knowledgeClip: AudioClip = null;
    private _errorClip: AudioClip = null;

    onLoad() {
        // 预加载音效
        resources.load('audio/pickup', AudioClip, (err, clip) => {
            if (!err) this._pickupClip = clip;
        });
        resources.load('audio/snap', AudioClip, (err, clip) => {
            if (!err) this._snapClip = clip;
        });
        resources.load('audio/knowledge', AudioClip, (err, clip) => {
            if (!err) this._knowledgeClip = clip;
        });
        resources.load('audio/error', AudioClip, (err, clip) => {
            if (!err) this._errorClip = clip;
        });
    }

    playPickup() {
        this._play(this._pickupClip);
    }

    playSnap() {
        this._play(this._snapClip);
    }

    playKnowledge() {
        this._play(this._knowledgeClip);
    }

    playError() {
        this._play(this._errorClip);
    }

    private _play(clip: AudioClip) {
        if (!clip || !this.audioSource) return;
        this.audioSource.playOneShot(clip, 0.8);
    }
}