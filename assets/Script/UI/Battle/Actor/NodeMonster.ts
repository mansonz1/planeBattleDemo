import { _decorator, BoxCollider2D, Component, dragonBones, instantiate, isValid, Node, ProgressBar, tween, UIOpacity, UITransform, Vec2, Vec3, view } from 'cc';
import { ActorBase } from './ActorBase';
import { ActorType, DamageMsgType, MissionConfig_DragonBone_AttackType, MissionConfig_Monster } from '../../../Interface/Local/BattleType';
import { ClientEventManager } from '../../../Manager/ClientEventManager';
import { ClientEventList } from '../../../Form/ClientEventList';
import { UIManager } from '../../../Manager/UIManager';
import { PrefabConfig } from '../../../Config/PrefabConfig';
import { DragonBoneManager } from '../../../Manager/DragonBoneManager';
import { TweenType } from '../../../Interface/Local/AnimationType';
import { BattleModule } from '../BattleModule';
import { Tools } from '../../../Tools/Tools';
import { Main } from '../../../Scene/Main';
import { TweenManager } from '../../../Manager/TweenManager';
const { ccclass, property } = _decorator;


@ccclass('NodeMonster')
export class NodeMonster extends ActorBase {
    public actorType: ActorType = ActorType.MONSTER;
    public uniqueId: string;

    /**当前怪物数据 */
    public data: MissionConfig_Monster;

    private isInited = false;
    
    private nodeHealth: Node;
    private healthProgress: ProgressBar;
    /**最大生命值 */
    public totalHealth = 100000;
    /**当前生命值 */
    private currentHealth = 100000;

    /**受到攻击的时间 受到攻击刷新为0 */
    private hittenTime = 1000;
    /**超出这个时间没有受击 则自动隐藏血条 */
    private readonly hittenSpecTime = 1.5;
    private healthTweening = false;

    private loadFinish = false;

    private logicRunning = true;

    private pauseChangeState = 0;

    private isDead = false;

    private isGod = false;


    /**攻击CD时间 */
    private attackData: MissionConfig_DragonBone_AttackType[];

    constructor() {
        super();
    }

    public init(data: {monsterData: MissionConfig_Monster, planeSolution_callback: () => void}) {
        if (!this.isInited) {
            this.isGod = false;
            this.isInited = true;
            this.register();
            this.data = data.monsterData;
            // uuid
            this.uniqueId = Tools.generateUUID();
            // ADD health
            this.nodeHealth = this.createHealth(data.monsterData.maxHealth);
            // add health progress
            this.healthProgress = this.nodeHealth.getChildByPath('ProgressBar').getComponent(ProgressBar);
            this.updateHealth();
            // ADD dragonBone
            // plane solution
            let planeSolution = data.monsterData.solution.fly[0];
            planeSolution && planeSolution(this.node, () => {
                // is auto destroy
                if (data.monsterData.autoDestroy == true) {
                    data.planeSolution_callback && data.planeSolution_callback();
                }
            });
            // monster类暂不存在变形设定，位置也是通过solution来加载的
            let dragonBone = this.node.getComponent(dragonBones.ArmatureDisplay);
            DragonBoneManager.playAnimationWithCallBack(dragonBone, data.monsterData.dragonBone.show[0], 1, () => {
                DragonBoneManager.playAnimationWithCallBack(dragonBone, data.monsterData.dragonBone.standBy[0], 0)
                this.loadFinish = true;
            })
            // 攻击时间计时器提取
            if (this.data.dragonBone.attack != null) {
                this.attackData = Tools.deepClone(this.data.dragonBone.attack);
                for (let db of this.attackData) {
                    // 时间重置 用于计时
                    db.cd = 0;
                }
            }
            
        }
    }


    /**创建生命值 */
    private createHealth(maxHealth: number): Node {
        let health = instantiate(UIManager.instance.healthPrefab);
        health.getComponent(UIOpacity).opacity = 0;
        health.parent = this.node;
        this.totalHealth = maxHealth;
        this.currentHealth = maxHealth;
        health.setPosition(new Vec3(0, -this.node.getComponent(UITransform).height / 2));
        return health;
    }

    private updateHealth() {
        this.healthProgress.progress = this.currentHealth / this.totalHealth;
    }

    protected register() {
        ClientEventManager.on(ClientEventList.Monster.hitten, this.handler, this);
    }

    protected onDestroy(): void {
        ClientEventManager.off(ClientEventList.Monster.hitten, this.handler, this);
    }

    private handler(event: string, data, data2, data3) {
        switch (event) {
            case ClientEventList.Monster.hitten:
                this.onHitten(data, data2, data3);
                break;
            case ClientEventList.Hero.dead:
                this.god(true);
                break;
        }
    }

    private god(isGod: boolean) {
        this.isGod = isGod;
    }

    /**受到攻击 */
    protected onHitten(damageMsg: DamageMsgType, hitPosition?: Vec3, uniqueId?: string) {
        if (!uniqueId || this.uniqueId != uniqueId) {
            return;
        }
        if (this.isGod) return;

        if (this.currentHealth <= 0) return;
        this.hittenTime = 0;
        this.currentHealth = this.currentHealth - damageMsg.damage <= 0 ? 0 : this.currentHealth - damageMsg.damage;
        this.updateHealth();
        // 掉血效果
        let offsetHealth = this.currentHealth - damageMsg.damage <= 0 ? this.currentHealth : damageMsg.damage;

        
        let _hitPostion = hitPosition == null ? new Vec3(0, 0) : hitPosition;
        if (damageMsg.damage > 0) {
            BattleModule.createLabelHitHealth(damageMsg, damageMsg.damage, _hitPostion, this.node.parent);
        }
        if (this.currentHealth <= 0) {
            this.logicRunning = false;
            if (!this.isDead) {
                this.isDead = true;
                ClientEventManager.dispatchEvent(ClientEventList.Monster.hittenResp, this.currentHealth <= 0, _hitPostion, this.node);
                this.node.destroy();
            }
        }
    }

    /**改变下方血条状态 */
    private changeNodeHealthState(isShow: boolean) {
        if (isShow) {
            tween(this.nodeHealth.getComponent(UIOpacity))
            .to(0.13, {opacity: 255})
            .call(() => {
                this.healthTweening = false;
            })
            .start();
        }
        else {
            // hide
            tween(this.nodeHealth.getComponent(UIOpacity))
            .to(0.13, {opacity: 0})
            .call(() => {
                this.healthTweening = false;
            })
            .start();
        }
    }

    /**检查并控制血条显隐时机 */
    public checkHealthBar() {
        if (this.hittenTime >= this.hittenSpecTime && this.nodeHealth.getComponent(UIOpacity).opacity > 0 && !this.healthTweening) {
            this.healthTweening = true;
            // 血条自动隐藏
            this.changeNodeHealthState(false);
            // 同一帧下只做一种状态的检测，避免可能出现的tween冲突
            return;
        }
        // show health
        if (this.hittenTime < this.hittenSpecTime && this.nodeHealth.getComponent(UIOpacity).opacity <= 0 && !this.healthTweening) {
            this.healthTweening = true;
            // 血条显示
            this.changeNodeHealthState(true);
        }
    }

    protected update(dt: number): void {
        if (!this.loadFinish) return; // 还没初始化完毕
        
        if (!Main.getInstance().isLogicRunning && this.pauseChangeState == 0) {
            this.pauseChangeState = 1;
            TweenManager.pauseAllNodeTween(this.node);
            this.logicRunning = false;
            return;
        }
        if (Main.getInstance().isLogicRunning && this.pauseChangeState == 1) {
            this.pauseChangeState = 0;
            TweenManager.resumeAllNodeTween(this.node);
            this.logicRunning = true;
            return;
        }
        if (!this.logicRunning) return;

        this.hittenTime += dt;

        // hide health
        this.checkHealthBar();

        // 轮询攻击动作
        if (this.attackData != null) {
            for (let i = 0; i < this.attackData.length; i++) {
                this.attackData[i].cd += dt;
                if (this.attackData[i].cd >= this.data.dragonBone.attack[i].cd) {
                    this.attackData[i].cd = 0;
                    // run dragoneBone
                    if (isValid(this.node)) {
                        let dbComponent = this.node.getComponent(dragonBones.ArmatureDisplay);
                        DragonBoneManager.playAnimationWithCallBack(dbComponent, this.attackData[i].animation, 1, () => {
                            DragonBoneManager.playAnimationWithCallBack(dbComponent, this.data.dragonBone.standBy[0], 0)
                        })
                    }
                    
                    // create attack bullet
                    // 发送的是方法名，对应bulletFactory内
                    ClientEventManager.dispatchEvent(ClientEventList.Monster.attack, this.node, this.data.solution.bullet[i]);
                }
            }
        }
    }

    
}


