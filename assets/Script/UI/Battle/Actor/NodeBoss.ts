import { _decorator, BoxCollider2D, Component, director, dragonBones, instantiate, isValid, Node, ProgressBar, tween, TweenSystem, UIOpacity, UITransform, Vec2, Vec3, view } from 'cc';
import { ActorBase } from './ActorBase';
import { ActorType, DamageMsgType, MissionConfig_Boss, MissionConfig_DragonBone_AttackType } from '../../../Interface/Local/BattleType';
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


@ccclass('NodeBoss')
export class NodeBoss extends ActorBase {
    public actorType: ActorType = ActorType.BOSS;
    private isInited = false;

    private data: MissionConfig_Boss;
    
    private nodeHealth: Node;
    private healthProgress: ProgressBar;
    private totalHealth = 100000;
    private currentHealth = 100000;

    /**受到攻击的时间 受到攻击刷新为0 */
    private hittenTime = 0;
    /**超出这个时间没有受击 则自动隐藏血条 */
    private readonly hittenSpecTime = 1.5;
    private healthTweening = false;

    private loadFinish = false;

    /**boss初始坐标记录 */
    private originPos: Vec3;

    private logicRunning = true;

    private pauseChangeState = 0;

    private isSendGameEnd = false;

    private isGod = false;

    /**攻击CD时间 */
    private attackData: MissionConfig_DragonBone_AttackType[];

    constructor() {
        super();
    }

    public init(missionData: MissionConfig_Boss) {
        if (!this.isInited) {
            this.isGod = false;
            this.isInited = true;
            this.register();
            this.data = missionData;
            // ADD health
            this.nodeHealth = this.createHealth(missionData.maxHealth);
            // add health progress
            // this.healthProgress = this.nodeHealth.getChildByPath('ProgressBar').getComponent(ProgressBar);
            // this.updateHealth();
            // ADD dragonBone
            this.originPos = missionData.position;
            let dragonBone = this.node.getComponent(dragonBones.ArmatureDisplay);
            tween(this.node)
            .to(1, {position: missionData.position}, {easing: TweenType.quadOut})
            // 变形动画
            .call(() => {
                DragonBoneManager.playAnimationWithCallBack(dragonBone, missionData.dragonBone.show[0], 1, () => {
                    DragonBoneManager.playAnimationWithCallBack(dragonBone, missionData.dragonBone.standBy[0], 0)
                    this.loadFinish = true;
                    ClientEventManager.dispatchEvent(ClientEventList.Boss.ready, missionData);

                })
            })
            .start();

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

    // private updateHealth() {
    //     this.healthProgress.progress = this.currentHealth / this.totalHealth;
    // }

    protected register() {
        ClientEventManager.on(ClientEventList.Boss.hitten, this.handler, this);
        // 这里也听一下英雄死亡 死了就变无敌 避免又通关又失败
        ClientEventManager.on(ClientEventList.Hero.dead, this.handler, this);

    }

    protected onDestroy(): void {
        ClientEventManager.off(ClientEventList.Boss.hitten, this.handler, this);
        ClientEventManager.off(ClientEventList.Hero.dead, this.handler, this);
        
    }

    private handler(event: string, data, data2) {
        switch (event) {
            case ClientEventList.Boss.hitten:
                this.onHitten(data, data2);
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
    protected onHitten(damageMsg: DamageMsgType, hitPosition?: Vec3) {
        if (this.isGod) return;
        this.hittenTime = 0;
        this.currentHealth = this.currentHealth - damageMsg.damage <= 0 ? 0 : this.currentHealth - damageMsg.damage;
        // this.updateHealth();
        // 掉血效果
        let offsetHealth = this.currentHealth - damageMsg.damage <= 0 ? this.currentHealth : damageMsg.damage;
        let _hitPostion = hitPosition == null ? new Vec3(0, 0) : hitPosition;
        BattleModule.createLabelHitHealth(damageMsg, damageMsg.damage, _hitPostion, this.node.parent);
        // 更新ui上方血条显示 在controller控制
        ClientEventManager.dispatchEvent(ClientEventList.Boss.hittenResp, this.currentHealth);
        if (this.currentHealth <= 0) {
            // 停止发射子弹
            this.logicRunning = false;
            if (!this.isSendGameEnd) {
                this.isSendGameEnd = true;
                ClientEventManager.dispatchEvent(ClientEventList.Battle.end, {position: new Vec3(this.node.position.x + this.node.getComponent(BoxCollider2D).offset.x, this.node.position.y + this.node.getComponent(BoxCollider2D).offset.y), width: this.node.getComponent(BoxCollider2D).size.width, height: this.node.getComponent(BoxCollider2D).size.height}, this.node);
            }
        }
    }
    

    /**改变下方血条状态 */
    // private changeNodeHealthState(isShow: boolean) {
    //     if (isShow) {
    //         tween(this.nodeHealth.getComponent(UIOpacity))
    //         .to(0.13, {opacity: 255})
    //         .call(() => {
    //             this.healthTweening = false;
    //         })
    //         .start();
    //     }
    //     else {
    //         // hide
    //         tween(this.nodeHealth.getComponent(UIOpacity))
    //         .to(0.13, {opacity: 0})
    //         .call(() => {
    //             this.healthTweening = false;
    //         })
    //         .start();
    //     }
    // }

    private maxScale = 0.9;
    private minScale = 0.7;
    private moveOffsetX = [-75, 75];
    private moveOffsetY = [-75, 75];
    private scaleDir = 0;
    // 随机移动
    private clamp(value: number, range: number[]): number {
        const [min, max] = range;
        return Math.min(Math.max(value, min), max);
    }

    getRandomOffset(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    private randomMove() {
        
        const moveAmountX = this.getRandomOffset(-3, 3);
        const moveAmountY = this.getRandomOffset(-3, 3);

        const newPosition = new Vec3(
            this.clamp(this.node.position.x + moveAmountX, [this.originPos.x + this.moveOffsetX[0], this.originPos.x + this.moveOffsetX[1]]),
            this.clamp(this.node.position.y + moveAmountY, [this.originPos.y + this.moveOffsetY[0], this.originPos.y + this.moveOffsetY[1]]),
            this.node.position.z
        );
        // console.log(this.node.position.y, newPosition.y, moveAmountY);

        this.node.setPosition(newPosition);
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
        if (!this.logicRunning) return;    // 主逻辑停止

        this.hittenTime += dt;

        // 动态效果
        if (this.node.scale.x >= this.maxScale) {
            this.scaleDir = 1;
            // 缩小
        }
        if (this.node.scale.x <= this.minScale) {
            this.scaleDir = 0;
            // 放大
        }
        if (this.scaleDir == 1) {
            let copyScale = Tools.deepClone(this.node.scale);
            this.node.setScale(copyScale.add(new Vec3(-0.003, -0.003)))
        }
        else {
            let copyScale = Tools.deepClone(this.node.scale);
            this.node.setScale(copyScale.add(new Vec3(0.003, 0.003)))
        }
        // 放大缩小 位移
        this.randomMove();

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
                    ClientEventManager.dispatchEvent(ClientEventList.Boss.attack, this.node, this.data.solution.bullet[i]);
                }
            }
        }

    }

    
}


