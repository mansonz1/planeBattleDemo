import { _decorator, AnimationClip, Component, Enum, instantiate, isValid, Node, NodePool } from 'cc';
import { UIManager } from './UIManager';
import { PrefabConfig } from '../Config/PrefabConfig';
import { AnimationClipNames } from '../Interface/Local/AnimationType';
const { ccclass } = _decorator;


@ccclass('AnimationClipManager')
export class AnimationClipManager {
    private static instance: AnimationClipManager = null;
    public static getInstance(): AnimationClipManager {
        if (AnimationClipManager.instance == null) {
            AnimationClipManager.instance = new AnimationClipManager();
        }
        return AnimationClipManager.instance;
    }
    private animationList: AnimationClipNames[] = []
    
    private poolList: Map<string, NodePool> = new Map();

    private animationArr: Node[] = [];

    /**清除所有动画缓存 */
    public clear() {

    }

    public async init() {
        for (let key in AnimationClipNames) {
            // @ts-ignore
            this.animationList.push(key)
        }
        for (let i = 0; i < this.animationList.length; i++) {
            // 创建对象池
            const animation = this.animationList[i];
            let pool = new NodePool(animation);
            this.poolList.set(animation, pool);
            // 创建对象池内初始化内容
            for (let i = 0; i < 10; i++) {
                let node = await this._createNewAnimation(animation);
                if (node) {
                    pool.put(node)
                }
            }
        }
        console.log('AnimationClipManager init finished :');
    }

    /**获取对象池 */
    private _getNodePool(animation: string) {
        if (this.poolList.has(animation)) {
            return this.poolList.get(animation);
        }
        return null;
    }

    /**从资源管理器中创建动画对象 */
    private _createNewAnimation(animation: string): Promise<Node> {
        return UIManager.instance.getPrefab(PrefabConfig[animation]);
    }

    /**获取指定动画名的动画对象 */
    public async getAnimation(animation: string) {
        const pool = this._getNodePool(animation);
        let node;
        if (!!pool) {
            if (pool.size() > 0) {
                node = pool.get();
            }
            else {
                node = await this._createNewAnimation(animation);
            }
            if (node && isValid(node)) {
                this.animationArr.push(node);
                return node;
            }
        }
    }

    /**动画存入对象池 */
    public putAnimation(animation: Node, animationName: string = animation.name) {
        if (animationName !== animation.name) {
            console.error('animationName !== animation.name, it may cause wrong nodePool, please check!!!')
            return;
        }
        const pool = this._getNodePool(animation.name);
        
        if (!!pool) {
            this.animationArr.splice(this.animationArr.indexOf(animation), 1);
            pool.put(animation);
        }
    }
}


