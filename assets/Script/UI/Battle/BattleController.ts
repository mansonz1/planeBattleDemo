import { _decorator, Animation, BoxCollider2D, Collider2D, Color, Component, dragonBones, EPhysics2DDrawFlags, EventTouch, gfx, instantiate, isValid, Material, Node, NodePool, PhysicsSystem2D, Pool, ProgressBar, Rect, Sprite, Tween, tween, UIOpacity, UITransform, Vec2, Vec3, view, warn } from 'cc';
import { BattleModule } from './BattleModule';
import { BattleView } from './BattleView';
import { Tools } from '../../Tools/Tools';
import { Bullets } from './Props/Bullets';
import { ClientEventManager } from '../../Manager/ClientEventManager';
import { ClientEventList } from '../../Form/ClientEventList';
import { AnimationClipManager } from '../../Manager/AnimationClipManager';
import { AnimationClipNames, TweenType } from '../../Interface/Local/AnimationType';
import { BulletNameType_Enemy, BulletOwnerType, BulletSingleType, BulletTypeInEnemy, BulletTypeInHero, DamageMsgType, HeroTypeEnum, MissionConfig, MissionConfig_Boss, MissionConfig_Monster, MissionConfig_Solution_Bullet, PropsType } from '../../Interface/Local/BattleType';
import { UIManager } from '../../Manager/UIManager';
import { PrefabConfig } from '../../Config/PrefabConfig';
import { DragonBoneManager } from '../../Manager/DragonBoneManager';
import { NodeMonster } from './Actor/NodeMonster';
import { BulletFactory } from '../../Manager/BulletFactory';
import { Main } from '../../Scene/Main';
import { NodeHero } from './Actor/NodeHero';
import { BattleProps } from './Props/BattleProps';
import { NodeBoss } from './Actor/NodeBoss';
import { AudioManager, AudioNames } from '../../Manager/AudioManager';
import PlayableHtml from '../../Tools/PlayableHtml';
import { GlobalCfg } from '../../Config/GlobalCfg';
import { AIPlay } from './AI/AIPlay';
const { ccclass, property } = _decorator;


@ccclass('BattleController')
export class BattleController {
    private view: BattleView
    private bulletFactory: BulletFactory

    private mission: string;
    private copyMissionData: MissionConfig = null;
    public isPause = false;

    private touchPos = Vec2.ZERO;
    private preTouchPos = Vec2.ZERO;
    /**运行时间 */
    private runningTime = 0;
    /**刷怪时间轴 */
    private creatingTime = 0;
    /**开始倒计时 */
    private countDown = 3;
    private isCountDownFinish = false;
    /**当前形态 */
    private currentPlaneType: HeroTypeEnum = 0;

    // pool[]
    public enemyBulletPools: Map<BulletNameType_Enemy | HeroTypeEnum, NodePool> = new Map();
    public heroBulletsPool:Map</* BulletNameType_Enemy |  */string, NodePool> = new Map();
    // 子弹相关
    // public heroMainBulletPool: NodePool = new NodePool('heroMainBullet');
    private heroMainBulletArr: Node[] = [];

    /**子弹暂停中 技能按钮相关功能失效 */
    private isBulletPause = false;

    // Boss相关
    // round: {time, monster, solution}
    /**当前的怪物队列 */
    private monsterList = 0;

    /**当前飞机的所有子弹计时器 [[time, time, time], [time, time]]*/
    private bulletTimeMap: number[][] = [];
    /**每帧变化的射击角度 */
    private frameAngle = 0;
    private frameAngleSpeed = 1;
    private oppositeFrameAngle = 0;
    private oppositeFrameAngleSpeed = 1;

    constructor(view: BattleView) {
        this.view = view
        this.bulletFactory = new BulletFactory(this);
        this.mission = 'mission2';
        // 初始化敌人子弹对象池
        for (let enemyBulletsName of BattleModule.missionType[this.mission].enemyBullets) {
            this.enemyBulletPools.set(enemyBulletsName, new NodePool(enemyBulletsName));
        }

        // PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb |
        // EPhysics2DDrawFlags.Pair |
        // EPhysics2DDrawFlags.CenterOfMass |
        // EPhysics2DDrawFlags.Joint |
        // EPhysics2DDrawFlags.Shape;

        // init 
        BattleModule.startMapMoveSpeed = 1;
        BattleModule.startWaitTime = 1;
        BattleModule.battleMapMoveSpeed = 50;

        // 初始化子弹计时器 初始化英雄子弹对象池
        for (let key in BattleModule.bulletType) {
            if (!BattleModule.bulletType.hasOwnProperty(key)) continue;
            let timeArr = [];
            let data: BulletSingleType[] = BattleModule.bulletType[key];
            for (let i = 0; i < data.length; i++) {
                timeArr.push(0);
                let poolKeyName = this.getHeroBulletPoolName(key, i);
                if (this.heroBulletsPool.get(poolKeyName) == null) {
                    this.heroBulletsPool.set(poolKeyName, new NodePool(poolKeyName))
                }

            }
            this.bulletTimeMap.push(timeArr);
        }

        /**初始化关卡怪物表 */
        if (!this.copyMissionData) {
            this.copyMissionData = Tools.deepClone(BattleModule.missionType[this.mission]);
            let monsterArr = this.copyMissionData.monster;
            // 按照time来做个快排
            const quickSort = (monsterArr: MissionConfig_Monster[]) => {
                if (monsterArr.length <= 1) {
                    return monsterArr;
                }
             
                const pivotIndex = Math.floor(monsterArr.length / 2);
                const pivot = monsterArr[pivotIndex];
                const leftArr: MissionConfig_Monster[] = [];
                const rightArr: MissionConfig_Monster[] = [];
             
                for (let i = 0; i < monsterArr.length; i++) {
                    if (i !== pivotIndex) {
                        if (monsterArr[i].time < pivot.time) {
                            leftArr.push(monsterArr[i]);
                        } else {
                            rightArr.push(monsterArr[i]);
                        }
                    }
                    
                }
             
                return [...quickSort(leftArr), pivot, ...quickSort(rightArr)];
            }
            this.copyMissionData.monster = quickSort(monsterArr);
        }
    }

    private getHeroBulletPoolName(key: HeroTypeEnum | string, index: number) {
        return 'heroBullet_' + key + '_' + index;
    }

    start() {
        // Tools.onCopyCode('gogoaabb', {
        //     onSuccess: () => {
        //         console.log('copy success')
        //     },
        //     onFail: () => {
        //         console.log('copy fail')
        //     }
        // })
        this.pauseBulletShoot();
        this.view.touchZone.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.view.touchZone.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        /**暂停按钮 */
        this.view.nodePauseBtn.on(Node.EventType.TOUCH_START, () => {
            if (this.isPause) return;
            if (!this.isCountDownFinish) return;
            this.onSetPause(true);
        }, this);
        /**关闭暂停 */
        this.view.nodeClosePause.on(Node.EventType.TOUCH_START, this.onSetPause, this);
        /**技能按钮 */
        this.view.nodeBattleSkill.on(Node.EventType.TOUCH_START, () => {
            if (GlobalCfg.isAIPlayFirst) return;

            if (this.isPause) return;
            if (!this.isCountDownFinish) return;
            this.onclickBattleSkill();
        }, this);
        /**重玩按钮 */
        this.view.nodeRetryBtn.on(Node.EventType.TOUCH_START, this.onclickRetry, this)
        /**下载按钮 */
        this.view.nodeDownloadBtn.on(Node.EventType.TOUCH_START, this.onclickDownload, this)

        /**游戏结束 */
        ClientEventManager.on(ClientEventList.Battle.end, this.onBattleEnd, this);
        /**子弹击中 */
        ClientEventManager.on(ClientEventList.Bullet.hit, this.onBulletHit, this);
        /**命中boss */
        ClientEventManager.on(ClientEventList.Boss.hittenResp, this.onBossHittenResp, this);
        /**boss预备 */
        ClientEventManager.on(ClientEventList.Boss.ready, this.onBossReady, this);
        /**普通敌人死亡 */
        ClientEventManager.on(ClientEventList.Monster.hittenResp, this.onMonsterHittenResp, this);
        /**角色撞击敌方机体 */
        ClientEventManager.on(ClientEventList.Hero.strike, this.onHeroStrike, this);
        /**敌人攻击动作 传参solution名，在bulletFactory内处理 */
        ClientEventManager.on(ClientEventList.Monster.attack, this.onEnemyAttack, this);
        ClientEventManager.on(ClientEventList.Boss.attack, this.onEnemyAttack, this);
        /**英雄死亡 */
        ClientEventManager.on(ClientEventList.Hero.dead, this.onHeroDead, this);
        /**触碰道具 */
        ClientEventManager.on(ClientEventList.Prop.touch, this.onTouchProp, this);
        /**英雄动画状态重置 */
        ClientEventManager.on(ClientEventList.Hero.reset, this.onHeroReset, this);


        this.view.updateCountDown(this.countDown, () => {
            AudioManager.instance.playOneShot(AudioNames.hero_appear);

            this.isCountDownFinish = true;
        });

    }

    onDestroy() {

        ClientEventManager.off(ClientEventList.Battle.end, this.onBattleEnd, this);
        ClientEventManager.off(ClientEventList.Bullet.hit, this.onBulletHit, this);
        ClientEventManager.off(ClientEventList.Boss.hittenResp, this.onBossHittenResp, this);
        ClientEventManager.off(ClientEventList.Monster.hittenResp, this.onMonsterHittenResp, this);
        ClientEventManager.off(ClientEventList.Monster.attack, this.onEnemyAttack, this);
        ClientEventManager.off(ClientEventList.Boss.attack, this.onEnemyAttack, this);
        ClientEventManager.off(ClientEventList.Boss.ready, this.onBossReady, this);
        ClientEventManager.off(ClientEventList.Hero.strike, this.onHeroStrike, this);
        ClientEventManager.off(ClientEventList.Hero.dead, this.onHeroDead, this);
        ClientEventManager.off(ClientEventList.Prop.touch, this.onTouchProp, this);
        ClientEventManager.off(ClientEventList.Hero.reset, this.onHeroReset, this);


        // this.view.node.getComponent(Sprite)
        // this.heroMainBulletPool.clear();
        this.heroBulletsPool.clear();
        this.enemyBulletPools.clear();
        BattleModule.hitLabelPool.clear();

    }

    private onTouchStart(event: EventTouch) {
        if (GlobalCfg.isAIPlayFirst) return;

        if (this.isPause) return;
        if (!this.isCountDownFinish) return;
        this.touchPos = event.getUILocation();
        this.preTouchPos = event.getUILocation();
    }
    private onTouchMove(event: EventTouch) {
        if (GlobalCfg.isAIPlayFirst) return;

        if (this.isPause) return;
        if (!this.isCountDownFinish) return;
        this.touchPos = event.getUILocation();
        const deltaX = this.touchPos.x - this.preTouchPos.x;
        const deltaY = this.touchPos.y - this.preTouchPos.y;
        if (!this.checkPlaneMoveSpec(this.view.plane.getPosition(), deltaX, deltaY)) {
            return;
        }
        this.view.plane.setPosition(new Vec3(this.view.plane.position.x + deltaX, this.view.plane.position.y + deltaY));

        this.preTouchPos = this.touchPos;
    }
    private async onclickBattleSkill() {
        // 停止攻击期间不允许点击按钮
        if (this.isBulletPause) return;
        AudioManager.instance.playOneShot(AudioNames.explode_skill);
        // 进CD
        tween(this.view.nodeBattleSkill.getComponent(ProgressBar))
            .call(() => {
                this.view.nodeBattleSkill.getChildByPath('bar').active = true;
                this.view.nodeBattleSkill.getComponent(Sprite).grayscale = true;
            })
            .set({ progress: 1 })
            .to(BattleModule.skillBombCD, { progress: 0 })
            .call(() => {
                this.view.nodeBattleSkill.getChildByPath('bar').active = false;
                this.view.nodeBattleSkill.getComponent(Sprite).grayscale = false;
            })
            .start();
        // 9个点的爆炸 view.size 四等分 123的位置
        // 111
        // 222
        // 333
        Tools.screenShake(15);
        const winSize = BattleModule.BattleViewSize;
        const spec = 4; // 屏幕四等分
        const heightSpec = winSize.height / spec;
        const widthSpec = winSize.width / spec;
        let row = 0;
        for (let height = 1; height >= -1; height--) {
            for (let width = -1; width <= 1; width++) {
                let animation: Node = await AnimationClipManager.getInstance().getAnimation(AnimationClipNames.SkillBomb);
                animation.parent = this.view.node;
                animation.setPosition(new Vec3(widthSpec * width, heightSpec * height));
                this.view.scheduleOnce(() => {
                    animation.getComponent(Animation).play();
                }, 0.3 * row)
            }
            row++;
        }
        // boss掉血
        const damageMsg: DamageMsgType = {
            damage: BattleModule.skillType.bbomb.atk,
            isCrit: true
        }
        // bossMsg改变
        // this.updateBossMsgProgress();
        ClientEventManager.dispatchEvent(ClientEventList.Boss.hitten, damageMsg);
        // 小怪
        this.destroyAllMonsters();
        // 全屏子弹
        this.detroyAllBullets();
    }
    /**
     * 修改暂停状态 
     * @param isSetView 暂停游戏逻辑的同时，是否显示暂停界面 默认true
     * */
    private onSetPause(isSetView: boolean = true) {
        this.isPause = !this.isPause;
        if (this.isPause == true) {
            AudioManager.instance.pause();
        }
        else {
            AudioManager.instance.resume();

        }
        Main.getInstance().isLogicRunning = !Main.getInstance().isLogicRunning;
        if (isSetView) {
            this.view.setPause(this.isPause);
        }
        
    }
    /**游戏结束 */
    private onBattleEnd(event: string, data: {position: Vec3, width: number, height: number}, bossNode: Node) {
        this.pauseBulletShoot();
        this.detroyAllBullets();
        // boss爆炸
        Tools.screenShake(40, 2);
        for (let i = 0; i < 10; i++) {
            this.view.scheduleOnce(async () => {
                let position = new Vec3(data.position.x + Math.random() * data.width - data.width / 2, data.position.y + Math.random() * data.height - data.height / 2);
                let iBomb: Node = await AnimationClipManager.getInstance().getAnimation(AnimationClipNames.IBomb);
                if (iBomb) {
                    iBomb.parent = this.view.nodeMonsterZone;
                    iBomb.setPosition(position);

                    AudioManager.instance.playOneShot(AudioNames.explode_boss);
                    iBomb.getComponent(Animation).play();
                }
                if (i == 9) {
                    // enemyNode destroy
                    tween(bossNode.getComponent(UIOpacity)).to(0.5, {opacity: 0}).call(() => {
                        bossNode.destroy();
                    }).start();
                    // bbomb
                    let bbomb: Node = await AnimationClipManager.getInstance().getAnimation(AnimationClipNames.BBomb);
                    bbomb.parent = this.view.nodeMonsterZone;
                    bbomb.setPosition(data.position);
                    bbomb.getComponent(Animation).play();
                    // over
                    this.view.scheduleOnce(() => {
                        AudioManager.instance.playOneShot(AudioNames.battle_win);
                        // ui回收
                        tween(this.view.top)
                            .by(0.3, {position: new Vec3(0, 300)})
                            .start();
                        tween(this.view.left)
                            .by(0.3, {position: new Vec3(-300, 0)})
                            .start();
                        // 飞机喷气
                        this.view.planeCharge.active = true;
                        // 飞机飞走
                        this.view.scheduleOnce(() => {
                            tween(this.view.plane)
                                .by(1, {position: new Vec3(0, BattleModule.BattleViewSize.height + 300)}, {easing: TweenType.sineIn})
                                .call(() => {
                                    // gameOver
                                    this.view.nodeGameOver.active = true;
                                    // playable game end
                                    PlayableHtml.game_end();
                                })
                                .start();
                        }, 0.5)
                        
                        // over
                    }, 0.5)
                }
            }, 0.2 * i);
        }
        // 飞机飞走
    }
    /**子弹击中 */
    private async onBulletHit(event: string, selfCollider: Collider2D, otherCollider: Collider2D) {
        // 击中BOSS
        let bullet = selfCollider.node;
        let bullets = bullet.getComponent(Bullets);
        // 受击点计算
        let bulletUITransform = bullet.getComponent(UITransform);
        let createHitPosition = () => {
            // 这里做个显示优化，boss的骨骼比例和小怪不同 小怪直接渲染在自身position上，boss做随机散射处理
            if (otherCollider.node.name.substring(0, 8) === 'NodeBoss') {
                return new Vec3(bullet.position.x + Math.random() * (bulletUITransform.width) - bulletUITransform.width / 2, bullet.position.y + bulletUITransform.height / 2 + Math.random() * 70);

            }
            else if (otherCollider.node.name.substring(0, 11) === 'NodeMonster') {
                return new Vec3(otherCollider.node.position.x + Math.random() * otherCollider.node.getComponent(UITransform).width / 2 - otherCollider.node.getComponent(UITransform).width / 4, otherCollider.node.position.y + Math.random() * otherCollider.node.getComponent(UITransform).height / 2 - otherCollider.node.getComponent(UITransform).height / 4);
            }
            else if (otherCollider.node.name.substring(0, 8) === 'NodeHero') {
                return bullet.position;
            }
        }
        // 掉血
        const atk = Tools.getRandomValue(bullets.bulletData.atk[0], bullets.bulletData.atk[1]);
        // 暴击判定 20%
        const isCrit = BattleModule.checkCrit(atk, bullets.bulletData.atk[0], bullets.bulletData.atk[1]);
        // 震动
        const damageMsg: DamageMsgType = {
            damage: atk,
            isCrit: isCrit
        }
        if (damageMsg.isCrit) Tools.screenShake(3);
        // 子弹效果 适用：boss，monster
        // hero单独判定
        if (otherCollider.node.name.substring(0, 8) === 'NodeHero' && bullet.getComponent(Bullets).bulletOwnerType == BulletOwnerType.MONSTER) {
            // 算掉血量
            
            let atk = bullets.bulletData.atk;
            let damage = Tools.getRandomValue(atk[0], atk[1]);
            let damageMsg: DamageMsgType = {
                damage: damage,
                isCrit: false
            }
            this.onHeroStrike(ClientEventList.Hero.strike, otherCollider.node.getComponent(NodeHero).getHealthProgress(damageMsg));
            this.putBullet(this.enemyBulletPools.get(bullets.bulletName), bullet)
            // monsterBulletHit
            let node: Node = await AnimationClipManager.getInstance().getAnimation(AnimationClipNames.MonsterBulletHit);
            node.parent = this.view.node;
            node.setPosition(createHitPosition());
            node.getComponent(Animation).play(AnimationClipNames.MonsterBulletHit);
        }
        // boss单独判定
        if (otherCollider.node.name.substring(0, 8) === 'NodeBoss' && bullet.getComponent(Bullets).bulletOwnerType == BulletOwnerType.HERO) {
            // 通信boss
            ClientEventManager.dispatchEvent(ClientEventList.Boss.hitten, damageMsg, createHitPosition());
            if (Math.random() < 0.5) {
                AudioManager.instance.playOneShot(AudioNames.explode_small);
            }
            else {
                AudioManager.instance.playOneShot(AudioNames.explode_captain);
            }

            // 击中敌人
            this.putBullet(bullets.fromPool, bullet);
            // 子弹击中效果
            for (let i = 0; i < 4; i++) {
                let node: Node = await AnimationClipManager.getInstance().getAnimation(AnimationClipNames.HeroBulletHit);
                node.parent = this.view.node;
                node.setPosition(createHitPosition());
                node.getComponent(Animation).play(AnimationClipNames.HeroBulletHit);
            }
        }
        // monster单独判定
        if (otherCollider.node.name.substring(0, 11) === 'NodeMonster' && bullet.getComponent(Bullets).bulletOwnerType == BulletOwnerType.HERO) {
            // 通信enemy
            let uniqueId = otherCollider.node.getComponent(NodeMonster).uniqueId;
            ClientEventManager.dispatchEvent(ClientEventList.Monster.hitten, damageMsg, createHitPosition(), uniqueId);
            AudioManager.instance.playOneShot(AudioNames.explode_small);
            // 击中敌人
            this.putBullet(bullets.fromPool/* this.heroBulletsPool.get(this.getHeroBulletPoolName(this.currentPlaneType, bullets.dataIndex)) */, bullet);
            // 子弹击中效果
            let node: Node = await AnimationClipManager.getInstance().getAnimation(AnimationClipNames.HeroBulletHit);
            node.parent = this.view.node;
            node.setPosition(createHitPosition())
            node.getComponent(Animation).play(AnimationClipNames.HeroBulletHit);
        }
    }

    /**生命值改变
     * @param progress 生命值进度
     * @param isStrike 生命值的变动原因是否为受到攻击
     */
    private onHeroStrike(event, progress: number, isStrike: boolean = true) {
        // 单纯英雄掉血
        this.view.setHeroHpProgress(progress);
        if (isStrike) {
            this.view.showHeroHit(true);
            Tools.screenShake(5);
        }
    }

    /**英雄死亡 */
    private async onHeroDead(event, hero: Node) {
        // heroDead
        // 播放死亡爆炸
        // node渐隐
        this.gameOver();

        AudioManager.instance.playOneShot(AudioNames.explode_boss);
        
        let bbomb: Node = await AnimationClipManager.getInstance().getAnimation(AnimationClipNames.BBomb);
        bbomb.parent = this.view.node;
        bbomb.setPosition(hero.position);
        bbomb.getComponent(Animation).play();

        tween(hero.getComponent(UIOpacity))
        .to(0.3, {opacity: 0})
        .call(() => {
            hero.active = false;
            this.view.nodeGameOver.active = true;
            AudioManager.instance.playOneShot(AudioNames.battle_lose);
            // 全屏子弹
            this.detroyAllBullets();
            // playable game end
            PlayableHtml.game_end();
        })
        .start();


    }

    /**触碰道具 */
    private onTouchProp(event: string,  propType: PropsType, propNode: Node) {
        switch (propType) {
            case PropsType.WeaponUp: 
                // 触碰武器升级
                AudioManager.instance.playOneShot(AudioNames.weapon_up);
                this.currentPlaneType = this.currentPlaneType < HeroTypeEnum.heroType3 ? this.currentPlaneType + 1 : HeroTypeEnum.heroType3;
                ClientEventManager.dispatchEvent(ClientEventList.Hero.changeState, this.currentPlaneType);
                break;
            case PropsType.HpUp:
                // 触碰回血 不带参数默认回满
                AudioManager.instance.playOneShot(AudioNames.blood_cure);
                ClientEventManager.dispatchEvent(ClientEventList.Hero.restoreHp);
                break;
        }
        propNode.destroy();
    }

    /**英雄状态重置 */
    private onHeroReset(event, heroType: HeroTypeEnum) {
        this.currentPlaneType = heroType;
        
    }

    private gameOver() {
        // 逻辑暂停
        this.onSetPause(false);
        // 所有子弹消失
        this.detroyAllBullets();
        
    }

    /**清除屏幕内所有子弹 */
    private detroyAllBullets() {
        for (let i = 0; i < this.view.nodeBulletZone.children.length; i++) {
            let bullet = this.view.nodeBulletZone.children[i];
            if (bullet && isValid(bullet)) {
                // let bulletName: BulletNameType_Enemy | HeroTypeEnum = bullet.getComponent(Bullets).bulletName;
                // let owner = bullet.getComponent(Bullets).bulletOwnerType;
                // let data = bullet.getComponent(Bullets).bulletData;
                let pool = bullet.getComponent(Bullets).fromPool;// owner == BulletOwnerType.HERO ? this.heroMainBulletPool : this.enemyBulletPools.get(bulletName);
                if (pool) {
                    this.putBullet(pool, bullet);
                }
            } 
        }
        // 强化处理
        this.view.nodeBulletZone.destroyAllChildren();
    }

    /**清除屏幕内除boss外所有敌人 */
    private destroyAllMonsters() {
        for (let i = 0; i < this.view.nodeMonsterZone.children.length; i++) {
            let monster = this.view.nodeMonsterZone.children[i];
            if (monster && isValid(monster)) {
                let script = monster.getComponent(NodeMonster);
                let isBoss = monster.getComponent(NodeBoss);
                if (script) {
                    let damageMsg: DamageMsgType = {
                        damage: script.totalHealth,
                        isCrit: false
                    }

                    ClientEventManager.dispatchEvent(ClientEventList.Monster.hitten, damageMsg, monster.getPosition(), script.uniqueId);
                }
                else if (!isBoss) {
                    /* let isDead = true;
                    let hitPos = monster.getPosition();
                    console.log('no script')
                    this.onMonsterHittenResp(ClientEventList.Monster.hittenResp, isDead, hitPos, monster);
                    monster.destroy(); */
                }

            }
        }
    } 

    /**boss可以开始战斗了 */
    private async onBossReady(event, missionData) {
        // 显示bossMsg
        Tools.setString(this.view.labelBossLevel, 'LV.' + missionData.level);
        Tools.setString(this.view.labelBossName, missionData.name);
        Tools.setString(this.view.labelBossLife, 'Life × ' + missionData.maxHealth / 10000 + '');
        // show
        tween(this.view.nodeBossMsg)
            .call(() => {
                this.view.nodeBossMsg.scale = Vec3.ZERO;
                this.view.nodeBossMsg.active = true;
            })
            .to(0.2, { scale: new Vec3(1.2, 1.2, 1.2) })
            .to(0.07, { scale: Vec3.ONE })
            .start();

        // 
        // 子弹开始发射
        this.recoverBulletShoot();
    }
    /**boss受到伤害的返回信息 */
    private onBossHittenResp(event, currentHealth: number) {
        this.updateBossMsgProgress(currentHealth);
    }
    /**monster受到伤害的返回信息 */
    private async onMonsterHittenResp(event, isDead: boolean, hitPos: Vec3, monster: Node) {
        if (isDead) {
            this.monsterList--;
            // bugbomb
            let bbomb: Node = await AnimationClipManager.getInstance().getAnimation(AnimationClipNames.BugBomb);
            if (bbomb && isValid(bbomb)) {
                bbomb.parent = this.view.nodeMonsterZone;
                bbomb.setPosition(hitPos);
                bbomb.getComponent(Animation).play();
                if (!!monster.getComponent(NodeMonster) && !!monster.getComponent(NodeMonster).data.carryProp) {
                    this.createBuff(monster.getComponent(NodeMonster).data.carryProp, monster.position);

                }
            }
            
        }
    }

    /**更新boss血量进度条逻辑 */
    private updateBossMsgProgress(currentHealth: number) {
        // 血条图集
        const bossHealthBarAtlas = UIManager.instance.bossHealthBarAtlas;
        // 血量spec
        const healthSpec = BattleModule.BossHealthBarLengthInHealth;
        if (currentHealth <= healthSpec) {
            this.view.spriteBehindBossHp.node.active = false;
        }
        let spriteFrames = bossHealthBarAtlas.getSpriteFrames();
        const remainLife = Math.ceil(currentHealth / BattleModule.BossHealthBarLengthInHealth);
        // life
        Tools.setString(this.view.labelBossLife, 'Life ×' + remainLife)
        // sprite of bar
        let frontIndex = remainLife % spriteFrames.length;
        let behindIndex = frontIndex <= 0 ? 6 : frontIndex - 1;

        Tools.setSpriteFrame(this.view.spriteFrontBossHp, spriteFrames[frontIndex]);
        Tools.setSpriteFrame(this.view.spriteBehindBossHp, spriteFrames[behindIndex]);

        this.view.progressBossHp.progress = currentHealth % healthSpec / healthSpec;
    }

    /**检查移动边界 */
    private checkPlaneMoveSpec(planePos: Vec3, deltaX: number, deltaY: number) {
        if (planePos.x <= (-BattleModule.BattleViewSize.width / 2 + 50) && deltaX < 0) {
            return false;
        }
        if (planePos.x >= (BattleModule.BattleViewSize.width / 2 - 50) && deltaX > 0) {
            return false;
        }
        if (planePos.y <= (-BattleModule.BattleViewSize.height / 2 + 50) && deltaY < 0) {
            return false;
        }
        if (planePos.y >= (BattleModule.BattleViewSize.height / 2 - 50) && deltaY > 0) {
            return false;
        }
        return true;
    }


    /**创建子弹 */
    private createBullet(bulletType: HeroTypeEnum | BulletNameType_Enemy, owner: BulletOwnerType, dataIndex: number) {
        let bulletData: BulletSingleType = owner == BulletOwnerType.HERO ? BattleModule.bulletType[bulletType][dataIndex] : BattleModule.enemyBulletType[bulletType];
        let pool: NodePool = owner == BulletOwnerType.HERO ? this.heroBulletsPool.get(this.getHeroBulletPoolName(bulletType, dataIndex)) : this.enemyBulletPools.get(bulletType);
        // 通用
        let node = new Node('nodeBullet');
        // collider
        const collider = node.addComponent(BoxCollider2D);
        collider.offset = new Vec2(bulletData.collider.offset[0], bulletData.collider.offset[1]);
        collider.size.width = bulletData.collider.size[0];
        collider.size.height = bulletData.collider.size[1];
        collider.group = bulletData.collider.group;
        // script
        let bulletsComponent = node.addComponent(Bullets);
        bulletsComponent.bulletOwnerType = owner;
        bulletsComponent.isContacting = false;
        bulletsComponent.bulletName = bulletType;
        bulletsComponent.bulletData = bulletData;
        bulletsComponent.dataIndex = dataIndex;
        bulletsComponent.fromPool = pool;
        if (owner == BulletOwnerType.HERO) {
            /* bulletsComponent.init(() => {
                this.putBullet(pool, node);
            }) */
        }
        
        // sprites
        for (let data of bulletData.bullets) {
            let sprite = new Node('bulletSprite').addComponent(Sprite);
            Tools.setSpriteFrameFromBundle(sprite, bulletData.bundle, data.path);
            sprite.node.setPosition(data.position);
            sprite.node.scale = data.scale;
            sprite.node.angle = data.rotation;
            node.addChild(sprite.node);
        }
        // uitransform
        let uiTransform = node.addComponent(UITransform);
        uiTransform.anchorX = 0.5;
        uiTransform.anchorY = 0.5;
        uiTransform.width = bulletData.collider.size[0];
        uiTransform.height = bulletData.collider.size[1];

        return node;
    }

    /**获取子弹 */
    public getBullet(pool: NodePool, owner: BulletOwnerType, bulletName: HeroTypeEnum | BulletNameType_Enemy, dataIndex = 0) {
        let bullet: Node;
        if (pool.size() > 0) {
            bullet = pool.get();
        }
        else {
            bullet = this.createBullet(bulletName, owner, dataIndex);
        }
        if (bullet && isValid(bullet)) {
            if (owner == BulletOwnerType.HERO) {
                this.heroMainBulletArr.push(bullet);
            }
            bullet.active = true;
            // 避免一弹打到多目标导致把错误的对象放进了对象池
            bullet.getComponent(Bullets).isContacting = false;
            bullet.getComponent(Bullets).bulletOwnerType = owner;
            Tween.stopAllByTarget(bullet);
            // solution
            return bullet;
        }
    }

    /**销毁子弹 */
    public putBullet(pool: NodePool, bullet: Node) {
        let owner = bullet.getComponent(Bullets).bulletOwnerType;
        if (owner == BulletOwnerType.HERO) {
            this.heroMainBulletArr.splice(this.heroMainBulletArr.indexOf(bullet), 1);
        }
        Tween.stopAllByTarget(bullet);
        bullet.removeFromParent();
        pool.put(bullet);
    }

    /**创建Boss 附带关卡信息*/
    private createBoss(bossData: MissionConfig_Boss) {
        UIManager.instance.createPrefab(this.view.nodeMonsterZone, PrefabConfig.M_C_BOSS, bossData);
    }
    /**怪物攻击 */
    private onEnemyAttack(event, monsterNode: Node, monsterBulletConfig: MissionConfig_Solution_Bullet) {
        if (!this.bulletFactory) return;
        let func: Function = this.bulletFactory[monsterBulletConfig.function];
        func && func(monsterBulletConfig.bulletName, BulletOwnerType.MONSTER, monsterNode.position, this.view.nodeBulletZone)
        // TEST
        // this.bulletFactory.solution_02(BulletNameType_Enemy.fullboss_3, BulletOwnerType.MONSTER, new Vec3(0, 300));
    }

    /**暂停子弹发射 */
    private pauseBulletShoot() {
        this.isBulletPause = true;
    }
    /**恢复子弹发射 */
    private recoverBulletShoot() {
        this.isBulletPause = false;
    }

    /**开始按照时间轴来创建怪物 */
    private startCreating(deltaTime: number) {
        
        
        if (!this.copyMissionData) return console.error('no missionData in startCreating!');
        if (!this.copyMissionData.monster) return console.error('no monster in missionData!');
        this.creatingTime += deltaTime;
        // create monster
        if (this.copyMissionData.monster.length > 0) {
            if (this.creatingTime >= this.copyMissionData.monster[0].time) {
                
                let monsterArr: MissionConfig_Monster[] = this.copyMissionData.monster;
                let monsterData = monsterArr.splice(0, 1)[0];
                // 飞入回调
                let planeSolution_callback = () => {
                    this.monsterList--;
                }
                UIManager.instance.createPrefab(this.view.nodeMonsterZone, monsterData.resource, {monsterData: monsterData, planeSolution_callback: planeSolution_callback});
                this.monsterList++;
                return;
            }
        }
        // create boss        
        if (this.copyMissionData.monster.length <= 0 && this.monsterList <= 0) {
            // 有配置boss
            if (this.copyMissionData.boss != null) {
                AudioManager.instance.playOneShot(AudioNames.boss_come);
                this.createBoss(this.copyMissionData.boss);
                // 加载完毕后直接置空
                this.copyMissionData.boss = null;
            }

            
        }
    }

    private onclickRetry() {

        ClientEventManager.dispatchEvent(ClientEventList.Main.restart);

    }
    private onclickDownload() {
        PlayableHtml.download();
    }

    /**创建指定name的飞行道具（buff） */
    private async createBuff(buffName: PropsType, parentPos: Vec3) {
        let node: Node = await AnimationClipManager.getInstance().getAnimation(AnimationClipNames[buffName]);
        node.getComponent(BattleProps).init(buffName, parentPos);
        node.parent = this.view.nodePropZone;
    }

    private changeFrameAngle(min: number = -10, max: number = 10) {
        if (this.frameAngle <= min) {
            this.frameAngleSpeed = 1;
        }
        else if (this.frameAngle >= max) {
            this.frameAngleSpeed = -1;
        }

        this.frameAngle += 0.5 * this.frameAngleSpeed;

        if (this.oppositeFrameAngle <= min) {
            this.oppositeFrameAngleSpeed = 1;
        }
        else if (this.oppositeFrameAngle >= max) {
            this.oppositeFrameAngleSpeed = -1;
        }

        this.oppositeFrameAngle = 0.5 * this.oppositeFrameAngleSpeed;
        
    }

    update(deltaTime: number) {
        // battlemap
        this.view.battleMapMove();
        if (this.isPause) return;
        this.runningTime += deltaTime;

        if (!this.isCountDownFinish) {
            
            return;
        }
        if (this.view.nodeStartMap.active) {
            this.view.nodeStartMap.setPosition(new Vec3(0, this.view.nodeStartMap.position.y - BattleModule.startMapMoveSpeed));
        }

        // startMap
        if (this.view.nodeStartMap.active) {
            
            // 冲刺
            this.view.planeCharge.active = true;
            BattleModule.startMapMoveSpeed += 1;
            if (this.view.nodeStartMap.position.y <= -10000) {
                this.view.nodeStartMap.active = false;
                this.view.scheduleOnce(() => {
                    this.view.planeCharge.active = false;
                    // 技能区域按钮
                    tween(this.view.nodeBattleSkill)
                        .to(0.25, { position: new Vec3(0, -350) })
                        .call(() => {
                            this.recoverBulletShoot();

                            // 如果允许ai ai此时开始动作
                            if (GlobalCfg.isAIPlayFirst) {
                                AIPlay.getInstance().action(this.view.plane);
                            }
                        })
                        .start();
                }, 0.5);
            }
        }
        else {
            // 刷怪直接放在生命周期里去算 统一可以通过暂停来控制
            this.startCreating(deltaTime);
            if (this.isBulletPause) return;
            this.changeFrameAngle();
            // console.log(Math.floor(this.frameAngle))
            const bulletData: BulletSingleType[] = BattleModule.bulletType[this.currentPlaneType];
            // [time, time, time]
            let timeArr: number[] = this.bulletTimeMap[this.currentPlaneType]; 
            for (let i = 0; i < bulletData.length; i++) {
                timeArr[i] += deltaTime;
                if (timeArr[i] > bulletData[i].cd) {
                    timeArr[i] = 0;
                    let pool = this.heroBulletsPool.get(this.getHeroBulletPoolName(this.currentPlaneType, i));
                    const bullet = this.getBullet(pool, BulletOwnerType.HERO, this.currentPlaneType, i);
                    if (isValid(bullet)) {
                        bullet.parent = this.view.nodeBulletZone;
                        bullet.setPosition(this.view.plane.position.x, this.view.plane.position.y + 100);
                        // bullet应该去执行solution了
                        let moveAngle = bullet.getComponent(Bullets).bulletData.bulletSolution[0].params?.moveAngle || 0;
                        let paramsAngle = 90;
                        if (moveAngle < 0) {
                            paramsAngle = 90 - this.frameAngle;
                        }
                        else if (moveAngle > 0) {
                            paramsAngle = 90 + this.frameAngle;
                        }
                        bulletData[i].bulletSolution[0].solution(bullet, {
                            moveAngle: paramsAngle
                        }, bulletData[i].speed);
                        // () => {
                        //     // tween destroy后的行为
                        //     // this.putBullet(this.heroMainBulletPool, bullet);
                        // }
                    }
                    
                }
            }
        }
    }
}


