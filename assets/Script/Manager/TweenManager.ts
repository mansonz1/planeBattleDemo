import { _decorator, Component, Node, TweenSystem } from 'cc';
const { ccclass, property } = _decorator;
/**缓动功能扩展  */
@ccclass('TweenManager')
export class TweenManager {

    private static instance: TweenManager = null;
    public static getInstance(): TweenManager {
        if (TweenManager.instance == null) {
            TweenManager.instance = new TweenManager();
        }
        return TweenManager.instance;
    }
    
    
    /**暂停当前节点所有tween动画 */
    public static pauseAllNodeTween(node: Node) {
        TweenSystem.instance.ActionManager.pauseTarget(node);
    }

    /**恢复当前节点所有tween动画 */
    public static resumeAllNodeTween(node: Node) {
        TweenSystem.instance.ActionManager.resumeTarget(node);
    }

}


