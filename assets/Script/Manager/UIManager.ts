import { _decorator, AssetManager, Component, instantiate, isValid, Node, Prefab, SpriteAtlas, SpriteFrame } from 'cc';
import { LoadManager } from './LoadManager';
import { AssetsConfig, PrefabConfig, PrefabConfigType } from '../Config/PrefabConfig';
const { ccclass, property } = _decorator;

@ccclass('UIManger')
export class UIManager {

    private static _instance: UIManager = null

    static get instance(): UIManager {
        if (this._instance == null) {
            this._instance = new UIManager()
        }
        return this._instance
    }

    /**血条预制件 */
    public healthPrefab: Prefab;
    /**受击掉血预制件（敌人） */
    public hitHealthPrefab: Prefab;
    /**boss血条图集 */
    public bossHealthBarAtlas: SpriteAtlas;

    public async init(callback: () => void) {
        LoadManager.instance.preloadAllBundle().then(async (value: AssetManager.Bundle[]) => {
            console.log('LoadManager init finished')
            console.log('UIManager init finished')
            this.healthPrefab = await LoadManager.instance.loadAssetFromBundle(PrefabConfig.NodeMonsterHp.bundle, PrefabConfig.NodeMonsterHp.path, PrefabConfig.NodeMonsterHp.type);
            this.hitHealthPrefab = await LoadManager.instance.loadAssetFromBundle(PrefabConfig.LabelHitHealth.bundle, PrefabConfig.LabelHitHealth.path, PrefabConfig.NodeMonsterHp.type);
            this.bossHealthBarAtlas = await LoadManager.instance.loadAssetFromBundle(AssetsConfig.atlasBossHealthBar.bundle, AssetsConfig.atlasBossHealthBar.path, AssetsConfig.atlasBossHealthBar.type);
            callback();
        });
        // config
        // audio
    }

    /**
     * 创建预制体
     * @param parent 父节点
     * @param bundleConfig prefabConfig
     * @param setData 携带参数
     * @returns 
     */
    public async createPrefab(parent: Node, bundleConfig: PrefabConfigType, setData?: any) {
        let prefab = await LoadManager.instance.loadAssetFromBundle(bundleConfig.bundle, bundleConfig.path, bundleConfig.type);
        let node: Node = instantiate(prefab);
        // 如果配置标注了入口脚本 则会对脚本挂载进行检查
        let script: Component;
        if (bundleConfig.component != null) {
            script = node.getComponent(bundleConfig.component);
            if (!script) {
                console.error("component doesn't exist in prefab: " + bundleConfig.bundle + '/' + bundleConfig.path + '! component: ' + bundleConfig.component);
                return null;
            }
        }
        // 对父节点进行检查
        if (!parent || !isValid(parent)) {
            console.error("parent doesn't exist");
            return null;
        }
        node.parent = parent;

        //@ts-ignore
        script['init'] && typeof(script['init']) == 'function' && script.init(setData);

        // 初始坐标检查
        bundleConfig.startPos && node.setPosition(bundleConfig.startPos);
        return node;
    }

    /**从资源管理器中获取实例化预制件 */
    public async getPrefab(bundleConfig: PrefabConfigType): Promise<Node> {
        const node: Node = instantiate(await LoadManager.instance.loadAssetFromBundle(bundleConfig.bundle, bundleConfig.path, bundleConfig.type));
        if (node) {
            return node;
        }
    }

    public nodeDestroy(node: Node, bundle: string, path: string) {
        node.destroy();
        LoadManager.instance.realeaseAsset(bundle, path);
    }

    tips() {}
    ask() {}


}


