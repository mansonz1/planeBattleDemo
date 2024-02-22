import { _decorator, CCBoolean, Component, director, find, game, Node, TweenSystem, VideoPlayer } from 'cc';
import { UIManager } from '../Manager/UIManager';
import { ClientEventManager } from '../Manager/ClientEventManager';
import { ClientEventList } from '../Form/ClientEventList';
import { PrefabConfig } from '../Config/PrefabConfig';
import { AnimationClipManager } from '../Manager/AnimationClipManager';
import { AudioManager } from '../Manager/AudioManager';
import PlayableHtml from '../Tools/PlayableHtml';
import { GlobalCfg } from '../Config/GlobalCfg';
const { ccclass, property } = _decorator;
@ccclass('Main')
export class Main extends Component {

    private static instance: Main = null;
    public static getInstance(): Main {
        return Main.instance;
    }

    public layerBattle: Node;
    public nodeBattle: Node;

    public layerVideo: Node;
    public adapter: Node;
    
    public uiManager: UIManager = null;
    public animationClipManager: AnimationClipManager = null;


    /**全局逻辑是否暂停 */
    public isLogicRunning = true;
    
    public constructor() {
        super();
        
        Main.instance = this;
        ClientEventManager.on(ClientEventList.Main.preloadFinish, this.clientEventHandler, this);
        ClientEventManager.on(ClientEventList.Main.restart, this.clientEventHandler, this);
        ClientEventManager.on(ClientEventList.Main.videoCompleted, this.clientEventHandler, this);


    }

    protected onDestroy(): void {
        ClientEventManager.off(ClientEventList.Main.preloadFinish, this.clientEventHandler, this);
        ClientEventManager.off(ClientEventList.Main.restart, this.clientEventHandler, this);
        ClientEventManager.on(ClientEventList.Main.videoCompleted, this.clientEventHandler, this);

    }

    protected onLoad(): void {
        this.layerBattle = find('Canvas').getChildByName('Battle');
        this.layerVideo = find('Canvas').getChildByName('Video');
        this.adapter = find('Canvas').getChildByName('adapter');
        this.uiManager = UIManager.instance;
        UIManager.instance.init(() => {
            if (!GlobalCfg.isShowVideoFirst) {
                this.layerVideo.active = false;
                // 如果不展示广告 则直接启动游戏
                ClientEventManager.dispatchEvent(ClientEventList.Main.preloadFinish);
            }
            else {
                this.layerVideo.active = true;
                this.adapter.active = false;
                // 视频播放完成后再隐藏 并启动游戏
                this.layerVideo.getComponent(VideoPlayer).play();
            }
        });
        // audio
        // time
        // config
        // animation
        this.animationClipManager = AnimationClipManager.getInstance();
        this.animationClipManager.init();
        AudioManager.instance.init();

        
    }

    public clientEventHandler(event: string){
        switch (event) {
            case ClientEventList.Main.preloadFinish:
                this.createBattle();
                break;
            case ClientEventList.Main.restart:
                this.retry();
                break;
            case ClientEventList.Main.videoCompleted:
                this.layerVideo.active = false;
                this.adapter.active = true;
                this.createBattle();
                break;
        }
    }

    private retry() {
        this.nodeBattle.destroy();

        TweenSystem.instance.ActionManager.removeAllActions();
        if (this.layerBattle.children.length > 0) {
            this.nodeBattle.destroy();
        }
        setTimeout(() => {
            this.createBattle();
        });
        
    }

    protected start(): void {

    }

    /**创建战斗场景 */
    private async createBattle() {
        this.isLogicRunning = true;
        this.nodeBattle = await UIManager.instance.createPrefab(this.layerBattle, PrefabConfig.LayerBattle);
    }

}


