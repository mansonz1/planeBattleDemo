import { _decorator, Collider2D, Contact2DType, dragonBones, IPhysics2DContact, isValid, math } from 'cc';
import { ActorBase } from './ActorBase';
import { ActorType, DamageMsgType, HeroType, HeroTypeEnum } from '../../../Interface/Local/BattleType';
import { ClientEventManager } from '../../../Manager/ClientEventManager';
import { ClientEventList } from '../../../Form/ClientEventList';
import { NodeBoss } from './NodeBoss';
import { NodeMonster } from './NodeMonster';
import { BattleModule } from '../BattleModule';
import { BattleProps } from '../Props/BattleProps';
import { DragonBoneManager } from '../../../Manager/DragonBoneManager';
import { AudioManager, AudioNames } from '../../../Manager/AudioManager';
const { ccclass, property } = _decorator;

enum FuryStateType {
    /**未狂暴 */
    NO = -1,
    /**狂暴开始 */
    START = 0,
    /**狂暴中 */
    FURYING = 1,
    /**狂暴结束 */
    END = 2
}

@ccclass('NodeHero')
export class NodeHero extends ActorBase {
    public actorType: ActorType = ActorType.HERO;

    public currentHealth: number;
    public maxHealth: number;

    private drangonBone: dragonBones.ArmatureDisplay;

    private isFury: boolean = false;
    private furyState: FuryStateType = FuryStateType.NO;
    /**n秒后结束狂暴状态 */
    private furyOverTime = 6;
    private furyTime = 0;

    protected onLoad(): void {
        this.currentHealth = BattleModule.heroType[HeroType.DEFAULT].maxHealth;
        this.maxHealth = BattleModule.heroType[HeroType.DEFAULT].maxHealth;

        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        /**英雄状态改变 */
        ClientEventManager.on(ClientEventList.Hero.changeState, this.changeState, this);
        /**英雄回血 */
        ClientEventManager.on(ClientEventList.Hero.restoreHp, this.restoreHp, this);


        this.drangonBone = this.node.getComponent(dragonBones.ArmatureDisplay);

        this.isFury = false;
        this.setFuryState(FuryStateType.NO)
    }

    protected onDestroy(): void {
        ClientEventManager.off(ClientEventList.Hero.changeState, this.changeState, this);
        ClientEventManager.off(ClientEventList.Hero.restoreHp, this.restoreHp, this);
        
    }

    public init(heroData) {

    }
    public register(): void {
        
    }

    /**飞机变形 */
    public changeState(event: string, state: HeroTypeEnum) {
        // 变形动作
        this.isFury = state == HeroTypeEnum.heroType3;
        // 重置狂暴时间
        this.resetFuryTime();
        // BaoZou_Start
        // BaoZou
        // BaoZou_End
        // putong

        // 变形开始
        // 持续时间
        // 变形结束
        // 普通状态
    }

    /**生命值回复 */
    public restoreHp(event: string, value: number = this.maxHealth) {
        this.currentHealth = this.currentHealth + value >= this.maxHealth ? this.maxHealth : this.currentHealth + value;
        ClientEventManager.dispatchEvent(ClientEventList.Hero.strike, this.currentHealth / this.maxHealth, false);
    }

    /**重置狂暴时间 */
    private resetFuryTime() {
        this.furyTime = 0;
    }

    /**更改狂暴状态 */
    private setFuryState(furyState: FuryStateType) {
        this.furyState = furyState;
    }

    public getHealthProgress(damageMsg: DamageMsgType) {
        this.currentHealth = this.currentHealth - damageMsg.damage < 0 ? 0 : this.currentHealth - damageMsg.damage;
        this.checkHeroDead();
        return this.currentHealth / this.maxHealth;
    }

    protected onHitten(damageMsg: DamageMsgType, hitPosition?: math.Vec3): void {
        this.currentHealth = this.currentHealth - damageMsg.damage < 0 ? 0 : this.currentHealth - damageMsg.damage;
        ClientEventManager.dispatchEvent(ClientEventList.Hero.strike, this.currentHealth / this.maxHealth);
        this.checkHeroDead();
        // 根据hitPosition创建受击点
    }

    /**检查英雄是否死亡 如果死亡，自动通知controller */
    private checkHeroDead() {
        if (this.currentHealth <= 0) {
            ClientEventManager.dispatchEvent(ClientEventList.Hero.dead, this.node);
            return true;
        }
        return false;
    }

    /**contact： 在builtin物理模块这个参数为空 */
    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 这里只作撞击检测，子弹检测统一在bullets处理
        if (otherCollider.node.getComponent(NodeBoss) != null || otherCollider.node.getComponent(NodeMonster) != null) {
            this.onHitten({damage: 1000, isCrit: false});
        }
        if (otherCollider.node.getComponent(BattleProps) != null) {
            // 触碰道具
            let propType = otherCollider.node.getComponent(BattleProps).type;
            ClientEventManager.dispatchEvent(ClientEventList.Prop.touch, propType, otherCollider.node);
            
        }
        // 掉血
    }

    /**检查狂暴状态 */
    private checkFury(dt: number) {
        if (!this.isFury) return;
        if (this.isFury && this.furyState == FuryStateType.NO) {
            AudioManager.instance.playOneShot(AudioNames.weapon_up);
            this.setFuryState(FuryStateType.START);
            DragonBoneManager.playAnimationWithCallBack(this.drangonBone, 'BaoZou_Start', 1, () => {
                this.setFuryState(FuryStateType.FURYING);
                DragonBoneManager.playAnimationWithCallBack(this.drangonBone, 'BaoZou', -1);
            });
        }
        if (this.isFury && this.furyState == FuryStateType.FURYING) {
            if (this.furyTime >= this.furyOverTime) {
                // 狂暴结束
                this.isFury = false;
                this.setFuryState(FuryStateType.END);
                // 放在外面 避免播放结束动画的时候 恰好吃到道具 导致形态改变 子弹未变
                ClientEventManager.dispatchEvent(ClientEventList.Hero.reset, HeroTypeEnum.heroType2);
                this.setFuryState(FuryStateType.NO);
                DragonBoneManager.playAnimationWithCallBack(this.drangonBone, 'BaoZou_End', 1, () => {
                    DragonBoneManager.playAnimationWithCallBack(this.drangonBone, 'putong', 0);
                });
            }
            else {
                this.furyTime += dt;
            }
        }
    }

    protected update(dt: number): void {
        if (isValid(this.node) && this.node.active) {
            this.checkFury(dt);

        }
    }
}


