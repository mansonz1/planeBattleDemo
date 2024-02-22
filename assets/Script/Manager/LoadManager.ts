import { __private, _decorator, Asset, AssetManager, assetManager, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

/**资源bundle名称 */
export enum BundleNames {
    BundleBattle = 'BundleBattle',
    BundleUI = 'BundleUI'
}

@ccclass('LoadManager')
export class LoadManager {
    private static _instance: LoadManager = null

    /**资源缓存 */
    private assetMap: Map<string, any> = new Map()
    /**bundle缓存 */
    private bundleMap: Map<string, AssetManager.Bundle> = new Map()

    private readonly bundleList: BundleNames[] = [
        BundleNames.BundleUI,
        BundleNames.BundleBattle
    ]

    static get instance(): LoadManager {

        if (this._instance == null) {
            this._instance = new LoadManager()
        }
        return this._instance
    }

    /**手动加载bundle内资源 */
    _loadAsync<T extends Asset>(bundle: string, path: string, assetType: __private._types_globals__Constructor<T>): Promise<any> {
        let key = bundle + "/" + path
        return new Promise((resolve, reject) => {
            let oAsset = this.assetMap.get(key)
            if (oAsset) {
                oAsset.addRef()
                resolve(oAsset)
            } else {
                assetManager.loadBundle(bundle, (err, bundle) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    } else {
                        if (typeof(assetType) != 'function') {
                            console.error('error assetType: ', assetType)
                            return;
                        }
                        bundle.load(path, assetType, (err, asset) => {
                            if (err) {
                                console.log(err)
                                reject(err)
                            } else {
                                this.assetMap.set(key, asset)
                                asset.addRef()
                                resolve(asset)
                            }
                        })
                    }
                });
            }
        })
    }

    /**预加载bundle */
    _preloadBundleAsync(bundleName: string): Promise<AssetManager.Bundle> {

        return new Promise((resolve, reject) => {
            let oAsset = this.bundleMap.get(bundleName)
            if (oAsset) {
                resolve(oAsset)
            } else {
                assetManager.loadBundle(bundleName, (err, bundle) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    } else {
                        this.bundleMap.set(bundleName, bundle);
                        resolve(bundle)
                    }
                });
            }
        })
    }


    /**对bundle内容进行预加载 */
    public preloadAllBundle() {
        let promiseList: Promise<AssetManager.Bundle>[] = [];
        for (let i = 0; i < this.bundleList.length; i++) {
            const bundleName = this.bundleList[i];
            promiseList.push(this._preloadBundleAsync(bundleName));
        }
        return Promise.all(promiseList)
    }

    /**加载指定bundle下的资源 */
    public async loadAssetFromBundle(bundle: BundleNames, path: string, type: any) {
        if (!this.bundleList.includes(bundle)) {
            console.error("bundle dosen't exist :" + bundle);
            return null;
        }
        const asset = await this._loadAsync(bundle, path, type);
        return asset;
    }

    
    /**
     * 释放资源接口
     * @param bundle bundle名
     * @param path 资源路径
     * @param isClear 是否清理所有引用资源及其依赖
     */
    public realeaseAsset(bundle: string, path: string, isClear = false) {
        const key = bundle + '/' + path;
        if (this.assetMap.has(key)) {
            let asset = this.assetMap.get(key);
            asset?.decRef();
            if (isClear) {
                assetManager.releaseAsset(asset);
                this.assetMap.delete(key);
            }
        }
    }

    clear() {
        this.assetMap.clear();
        this.bundleMap.clear();
    }
}


