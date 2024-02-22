import { _decorator, BoxCollider2D, Component, instantiate, Label, log, Node, ProgressBar, Sprite, tween, UIOpacity, UITransform, Vec2, Vec3, view } from 'cc';
import { BattleController } from './BattleController';
import { BattleModule, BulletSolutionParams } from './BattleModule';
import { Tools } from '../../Tools/Tools';
import { UIManager } from '../../Manager/UIManager';
import { AudioManager, AudioNames } from '../../Manager/AudioManager';
import PlayableHtml from '../../Tools/PlayableHtml';
const { ccclass, property } = _decorator;

@ccclass('BattleView')
export class BattleView extends Component {
    
    control: BattleController;

    public top: Node;
    public left: Node;
    
    public touchZone: Node;
    public plane: Node;
    public planeCharge: Node;

    public nodeStartMap: Node;
    public nodeBattleBg: Node;
    public nodeCountDown: Node;
    public nodeBulletZone: Node;
    public nodeMonsterZone: Node;
    public nodePropZone: Node;
    // bossMsg
    public nodeBossMsg: Node;
    public labelBossLevel: Label;
    public labelBossName: Label;
    public labelBossLife: Label;
    public progressBossHp: ProgressBar;
    public spriteFrontBossHp: Sprite;
    public spriteBehindBossHp: Sprite;
    // pause
    public nodePauseBtn: Node;
    public nodePauseScene: Node;
    public nodeClosePause: Node;
    public nodePauseLabel: Node;
    private isPauseInited = false;
    // skill
    public nodeBattleSkill: Node;
    // nodeEnemy
    public nodeEnemy: Node;
    // hero hp
    public progressHeroHp: ProgressBar;
    public nodeHeroHit: Node;
    private heroHitTime = 10000;
    private heroHitTimeSpec = 3;
    // enemy bullet
    private nodeEnemyBullet: Node;
    // game over
    public nodeGameOver: Node;
    public nodeRetryBtn: Node;
    public nodeDownloadBtn: Node;


    protected onLoad(): void {
        BattleModule.BattleViewSize = {width: this.node.getComponent(UITransform).width, height: this.node.getComponent(UITransform).height}
        console.log('design size: battleView, ', BattleModule.BattleViewSize)
        this.control = new BattleController(this);
        this.initHitHealthPool();

        this.top = this.node.getChildByPath('top');
        this.left = this.node.getChildByPath('left');
        this.touchZone = this.node.getChildByPath('touchZone');
        this.plane = this.node.getChildByPath('NodeHero');
        this.nodeStartMap = this.node.getChildByPath('nodeStartMap');
        this.nodeBattleBg = this.node.getChildByPath('nodeBattleBg');
        this.nodeCountDown = this.node.getChildByPath('nodeCountDown');

        this.nodeBulletZone = this.node.getChildByPath('bulletZone');
        this.nodeMonsterZone = this.node.getChildByPath('bossZone');
        this.planeCharge = this.node.getChildByPath('NodeHero/charge');
        this.nodePropZone = this.node.getChildByPath('propZone');


        this.nodeBossMsg = this.node.getChildByPath('top/nodeBossMsg');
        this.labelBossLevel = this.node.getChildByPath('top/nodeBossMsg/labelBossLevel').getComponent(Label);
        this.labelBossName = this.node.getChildByPath('top/nodeBossMsg/labelBossName').getComponent(Label);
        this.labelBossLife = this.node.getChildByPath('top/nodeBossMsg/labelBossLife').getComponent(Label);
        this.progressBossHp = this.node.getChildByPath('top/nodeBossMsg/progressBossHp').getComponent(ProgressBar);
        this.spriteFrontBossHp = this.node.getChildByPath('top/nodeBossMsg/progressBossHp/front').getComponent(Sprite);
        this.spriteBehindBossHp = this.node.getChildByPath('top/nodeBossMsg/progressBossHp/behind').getComponent(Sprite);
        // 默认隐藏
        this.nodeBossMsg.active = false;

        this.nodePauseBtn = this.node.getChildByPath('top/heroHpZone/buttonPause');
        this.nodePauseScene = this.node.getChildByPath('nodePause');
        this.nodeClosePause = this.node.getChildByPath('nodePause/blockInputEvents');
        this.nodePauseLabel = this.node.getChildByPath('nodePause/labelContinue');
        this.nodeBattleSkill = this.node.getChildByPath('left/nodeBattleSkill');

        this.progressHeroHp = this.node.getChildByPath('top/heroHpZone/progressHeroHp').getComponent(ProgressBar);
        this.nodeHeroHit = this.node.getChildByPath('heroHit');

        this.nodeEnemyBullet = this.node.getChildByPath('bulletZone/nodeEnemyBullet');
        this.nodeGameOver = this.node.getChildByPath('nodeGameOver');
        this.nodeGameOver.active = false;

        this.nodeRetryBtn = this.node.getChildByPath('nodeGameOver/buttonRetry');
        this.nodeDownloadBtn = this.node.getChildByPath('nodeGameOver/buttonDownload');

        this.setHeroHpProgress(1);
        this.showHeroHit(false);
        /* this.nodeEnemy = this.node.getChildByPath('nodeEnemy_M_C_XZF');
        BattleModule.planeSolution_01(this.nodeEnemy); */
        this.setPause(false);

        tween(this.nodeDownloadBtn)
        .to(0.3, {scale: new Vec3(1.5, 1.5, 1.5)})
        .to(0.3, {scale: Vec3.ONE})
        .delay(0.5)
        .union()
        .repeatForever()
        .start();


        // init playable
        PlayableHtml.set_google_play_url("https://play.google.com/store/apps/details?id=com.unity3d.auicreativetestapp");
        PlayableHtml.set_app_store_url("https://apps.apple.com/us/app/ad-testing/id1463016906");
        if (PlayableHtml.is_hide_download()) {
            this.nodeDownloadBtn.active = false;
            this.nodeRetryBtn.setPosition(0, this.nodeRetryBtn.position.y);
        }
        
    }

    protected start(): void {
        this.control.start();

        if (!AudioManager.instance.audioSource.playing) {
            AudioManager.instance.playMusic(AudioNames.battle_bk1);
        }
        // AudioManager.instance.playMusic(AudioNames.battle_bk1);
    }

    protected onDestroy(): void {
        this.control.onDestroy();
    }
    /**初始化伤害数字对象池 */
    private initHitHealthPool() {
        for (let i = 0; i < 10; i++) {
            const node = instantiate(UIManager.instance.hitHealthPrefab);
            BattleModule.hitLabelPool.put(node);
        }
    }
    /**展示英雄受击动画 默认3秒后自动结束*/
    public showHeroHit(isShow: boolean, showTime = 3) {
        this.nodeHeroHit.active = isShow;
        if (isShow) {
            this.heroHitTime = 0;
            this.heroHitTimeSpec = showTime;
        }
        
    }

    /**变更英雄hp */
    public setHeroHpProgress(progress: number) {
        this.progressHeroHp.progress = progress;
    }

    /**设置暂停 */
    public setPause(isShow: boolean) {
        if (!this.isPauseInited) {
            // opacity 
            tween(this.nodePauseLabel.getComponent(UIOpacity))
            .to(0.5, {opacity: 0})
            .to(0.5, {opacity: 255})
            .union()
            .repeatForever()
            .start();
            this.isPauseInited = true;
        }
        this.nodePauseScene.active = isShow;
    }

    /**开始倒计时 */
    public updateCountDown(countDown: number, onTweenCompleted: () => void) {
        this.nodeCountDown.active = countDown > 0;
        if (this.nodeCountDown.active) {
            tween(this.nodeCountDown)
            .parallel(
                tween(this.nodeCountDown).to(0.15, {scale: new Vec3(1, 1, 1)}).delay(0.75).to(0.15, {scale: Vec3.ZERO}),
                tween(this.nodeCountDown).call(() => {
                    countDown--;
                    Tools.setString(this.nodeCountDown.getComponent(Label), Math.round(countDown) + ''); 
                    if (countDown <= 0) {
                        onTweenCompleted();
                    }
                })
            )
            .repeat(3)
            .start();
        }
    }

    /**战斗地图移动 */
    public battleMapMove() {
        for (let i = 0; i < this.nodeBattleBg.children.length; i++) {
            let node = this.nodeBattleBg.children[i];
            node.setPosition(new Vec3(0, node.position.y - BattleModule.battleMapMoveSpeed));
            if (node.position.y <= -1400) {
                node.setPosition(new Vec3(0, 2800))
            }
        }
    }

    update(deltaTime: number) {
        this.control.update(deltaTime);
        this.heroHitTime += deltaTime;
        if (this.heroHitTime >= this.heroHitTimeSpec) {
            this.heroHitTimeSpec = 3;
            this.showHeroHit(false)
        }
    }
}


