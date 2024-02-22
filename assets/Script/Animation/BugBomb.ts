import { _decorator, Component, Node } from 'cc';
import { AnimationClipManager } from '../Manager/AnimationClipManager';
const { ccclass, property } = _decorator;

@ccclass('BugBomb')
export class BugBomb extends Component {
    public onAnimCompleted() {
        // 子弹击中 创建击中效果
        AnimationClipManager.getInstance().putAnimation(this.node);

        // AnimationClipManager.getInstance().putAnimation(this.node);
        // let node = AnimationClipManager.getInstance().getAnimation(AnimationClipNames.HeroBulletHit);
        // 掉血
        // 判断死亡
        // 死亡效果
    }
}


