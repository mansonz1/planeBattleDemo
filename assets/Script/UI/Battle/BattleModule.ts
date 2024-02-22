import { _decorator, Component, Font, instantiate, isValid, Label, Node, NodePool, Prefab, Size, Tween, tween, UIOpacity, UITransform, Vec3, view } from 'cc';
import { BulletNameType_Enemy, BulletTypeInEnemy, BulletTypeInHero, DamageMsgType, HeroConfigType, HeroType, HeroTypeEnum, MissionConfig, MissionConfig_Base, PropsType } from '../../Interface/Local/BattleType';
import { UIManager } from '../../Manager/UIManager';
import { BundleNames, LoadManager } from '../../Manager/LoadManager';
import { AssetsConfig, PrefabConfig } from '../../Config/PrefabConfig';
import { Tools } from '../../Tools/Tools';
import { Bullets } from './Props/Bullets';
const { ccclass, property } = _decorator;

/**子弹附带参数 */
export interface BulletSolutionParams {
    /**子弹速度 */
    speed?: number;
    /**销毁回调 */
    callback?: () => void;
    /**移动角度 */
    moveAngle?: number;
    /**销毁判断 0为不判断， xy只允许一项不为0*/
    judgement?: Vec3

}

@ccclass('BattleModule')
export class BattleModule {

    public static BattleViewSize = {width: 640, height: 1336};

    public static startWaitTime = 1;
    public static startMapMoveSpeed = 1;
    public static battleMapMoveSpeed = 50;

    /**屏幕下方限度 子弹至此消失 */
    private static readonly screenBottomSpec = -0.5 * BattleModule.BattleViewSize.height - 300;

    /**伤害数字对象池 */
    public static hitLabelPool: NodePool = new NodePool('hitHealth');
    /**boss的单条血量转化量 */
    public static BossHealthBarLengthInHealth = 10000;
    /**炸弹技能冷却 */
    public static readonly skillBombCD = 1;

    // 子弹
    // 形态
    // 碰撞
    // 飞行
    public static bulletType: BulletTypeInHero = {
        [HeroTypeEnum.heroType1]:
            [
                

                {
                    bundle: BundleNames.BundleBattle,
                    speed: 40,// per frame
                    cd: 0.2,
                    atk: [500, 1000],
                    collider: { offset: [0, 40], size: [50, 100], group: 2 },
                    bulletSolution: [{solution: BattleModule.bulletSolution_00}],
                    bullets: [
                        { path: 'Texture/Bullets/Z_04_zidan_1b/spriteFrame', position: new Vec3(-5, 42), scale: new Vec3(0.7, 0.7, 0.7), rotation: 0 },
                        { path: 'Texture/Bullets/Z_04_zidan_1b/spriteFrame', position: new Vec3(5, 42), scale: new Vec3(0.7, 0.7, 0.7), rotation: 0 }
                    ]
                },
                {
                    bundle: BundleNames.BundleBattle,
                    speed: 40,// per frame
                    cd: 0.3,
                    atk: [500, 1000],
                    collider: { offset: [45, 30], size: [20, 100], group: 2 },
                    bulletSolution: [{solution: BattleModule.bulletSolution_00}],
                    bullets: [
                        { path: 'Texture/Bullets/Z_04_zidan_1a/spriteFrame', position: new Vec3(45, 0), scale: new Vec3(0.7, 0.7, 0.7), rotation: 0 }
                    ]
                },
                {
                    bundle: BundleNames.BundleBattle,
                    speed: 40,// per frame
                    cd: 0.3,
                    atk: [500, 1000],
                    collider: { offset: [-45, 30], size: [20, 100], group: 2 },
                    bulletSolution: [{solution: BattleModule.bulletSolution_00}],
                    bullets: [
                        { path: 'Texture/Bullets/Z_04_zidan_1a/spriteFrame', position: new Vec3(-45, 0), scale: new Vec3(0.7, 0.7, 0.7), rotation: 0 }
                    ]
                }
            ],
        [HeroTypeEnum.heroType2]: [
            {
                bundle: BundleNames.BundleBattle,
                speed: 50,// per frame
                cd: 0.15,
                atk: [500, 1000],
                collider: { offset: [0, 40], size: [50, 100], group: 2 },
                bulletSolution: [{solution: BattleModule.bulletSolution_00}],
                bullets: [
                    { path: 'Texture/Bullets/Z_04_zidan_1b/spriteFrame', position: new Vec3(-5, 42), scale: new Vec3(0.7, 0.7, 0.7), rotation: 0 },
                    { path: 'Texture/Bullets/Z_04_zidan_1b/spriteFrame', position: new Vec3(-5, 42), scale: new Vec3(0.7, 0.7, 0.7), rotation: 0 }
                ]
            },
            {
                bundle: BundleNames.BundleBattle,
                speed: 40,// per frame
                cd: 0.15,
                atk: [500, 1000],
                collider: { offset: [45, 30], size: [20, 100], group: 2 },
                bulletSolution: [{solution: BattleModule.bulletSolution_00}],
                bullets: [
                    { path: 'Texture/Bullets/Z_04_zidan_1a/spriteFrame', position: new Vec3(45, 0), scale: new Vec3(0.7, 0.7, 0.7), rotation: 0 }
                ]
            },
            {
                bundle: BundleNames.BundleBattle,
                speed: 40,// per frame
                cd: 0.15,
                atk: [500, 1000],
                collider: { offset: [-45, 30], size: [20, 100], group: 2 },
                bulletSolution: [{solution: BattleModule.bulletSolution_00}],
                bullets: [
                    { path: 'Texture/Bullets/Z_04_zidan_1a/spriteFrame', position: new Vec3(-45, 0), scale: new Vec3(0.7, 0.7, 0.7), rotation: 0 }
                ]
            },
            {
                bundle: BundleNames.BundleBattle,
                speed: 40,// per frame
                cd: 0.15,
                atk: [500, 1000],
                collider: { offset: [0, 30], size: [130, 100], group: 2 },
                bulletSolution: [{solution: BattleModule.bulletSolution_00}],
                bullets: [
                    { path: 'Texture/Bullets/Z_04_zidan_4/spriteFrame', position: new Vec3(0, 57), scale: new Vec3(0.5, 0.5, 0.5), rotation: 0 },
                    { path: 'Texture/Bullets/Z_04_zidan_4/spriteFrame', position: new Vec3(-34, 4), scale: new Vec3(0.3, 0.3, 0.3), rotation: 0 },
                    { path: 'Texture/Bullets/Z_04_zidan_4/spriteFrame', position: new Vec3(34, 4), scale: new Vec3(0.3, 0.3, 0.3), rotation: 0 }
                ]
            },
        ],
        [HeroTypeEnum.heroType3]: [
            {
                bundle: BundleNames.BundleBattle,
                speed: 30,// per frame
                cd: 0.05,
                atk: [150, 400],
                collider: { offset: [0, 40], size: [50, 100], group: 2 },
                bulletSolution: [{solution: BattleModule.bulletSolution_00}],
                bullets: [
                    { path: 'Texture/Bullets/Z_04_zidan_1b/spriteFrame', position: new Vec3(-5, 42), scale: new Vec3(0.7, 0.7, 0.7), rotation: 0 },
                    { path: 'Texture/Bullets/Z_04_zidan_1b/spriteFrame', position: new Vec3(-5, 42), scale: new Vec3(0.7, 0.7, 0.7), rotation: 0 }
                ]
            },
            {
                bundle: BundleNames.BundleBattle,
                speed: 30,// per frame
                cd: 0.05,
                atk: [150, 400],
                collider: { offset: [45, 30], size: [20, 100], group: 2 },
                bulletSolution: [{solution: BattleModule.bulletSolution_00}],
                bullets: [
                    { path: 'Texture/Bullets/Z_04_zidan_1a/spriteFrame', position: new Vec3(45, 0), scale: new Vec3(0.7, 0.7, 0.7), rotation: 0 }
                ]
            },
            {
                bundle: BundleNames.BundleBattle,
                speed: 30,// per frame
                cd: 0.05,
                atk: [150, 400],
                collider: { offset: [-45, 30], size: [20, 100], group: 2 },
                bulletSolution: [{solution: BattleModule.bulletSolution_00}],
                bullets: [
                    { path: 'Texture/Bullets/Z_04_zidan_1a/spriteFrame', position: new Vec3(-45, 0), scale: new Vec3(0.7, 0.7, 0.7), rotation: 0 }
                ]
            },
            {
                bundle: BundleNames.BundleBattle,
                speed: 30,// per frame
                cd: 0.05,
                atk: [150, 400],
                collider: { offset: [0, 30], size: [130, 100], group: 2 },
                bulletSolution: [{solution: BattleModule.bulletSolution_00}],
                bullets: [
                    { path: 'Texture/Bullets/Z_04_zidan_4/spriteFrame', position: new Vec3(0, 57), scale: new Vec3(0.5, 0.5, 0.5), rotation: 0 },
                    { path: 'Texture/Bullets/Z_04_zidan_4/spriteFrame', position: new Vec3(-34, 4), scale: new Vec3(0.3, 0.3, 0.3), rotation: 0 },
                    { path: 'Texture/Bullets/Z_04_zidan_4/spriteFrame', position: new Vec3(34, 4), scale: new Vec3(0.3, 0.3, 0.3), rotation: 0 }
                ]
            },{
                bundle: BundleNames.BundleBattle,
                speed: 30,// per frame
                cd: 0.05,
                atk: [150, 400],
                collider: { offset: [0, 30], size: [130, 100], group: 2 },
                bulletSolution: [{solution: BattleModule.bulletSolution_00}],
                bullets: [
                    { path: 'Texture/Bullets/Z_04_zidan_4/spriteFrame', position: new Vec3(0, 57), scale: new Vec3(0.5, 0.5, 0.5), rotation: 0 },
                    { path: 'Texture/Bullets/Z_04_zidan_4/spriteFrame', position: new Vec3(-34, 4), scale: new Vec3(0.3, 0.3, 0.3), rotation: 0 },
                    { path: 'Texture/Bullets/Z_04_zidan_4/spriteFrame', position: new Vec3(34, 4), scale: new Vec3(0.3, 0.3, 0.3), rotation: 0 }
                ]
            },
            {
                bundle: BundleNames.BundleBattle,
                speed: 30,// per frame
                cd: 0.05,
                atk: [150, 400],
                collider: { offset: [-65, 5], size: [50, 130], group: 2 },
                bulletSolution: [{solution: BattleModule.bulletSolution_00}],
                bullets: [
                    { path: 'Texture/Bullets/Z_04_zidan_4b/spriteFrame', position: new Vec3(-65, 0), scale: new Vec3(0.7, 0.7, 0.7), rotation: 0 }
                ]
            },
            {
                bundle: BundleNames.BundleBattle,
                speed: 30,// per frame
                cd: 0.05,
                atk: [150, 400],
                collider: { offset: [65, 5], size: [50, 130], group: 2 },
                bulletSolution: [{solution: BattleModule.bulletSolution_00}],
                bullets: [
                    { path: 'Texture/Bullets/Z_04_zidan_4b/spriteFrame', position: new Vec3(65, 0), scale: new Vec3(0.7, 0.7, 0.7), rotation: 0 }
                ]
            },
            {
                bundle: BundleNames.BundleBattle,
                speed: 30,// per frame
                cd: 0.05,
                atk: [150, 400],
                collider: { offset: [-65, 50], size: [40, 200], group: 2 },
                bulletSolution: [{solution: BattleModule.bulletSolution_05, params: {moveAngle: -1}}],
                bullets: [
                    { path: 'Texture/Bullets/ziseji02_SPWP/spriteFrame', position: new Vec3(-65, 50), scale: Vec3.ONE, rotation: 0 }
                ]
            },
            {
                bundle: BundleNames.BundleBattle,
                speed: 30,// per frame
                cd: 0.05,
                atk: [150, 400],
                collider: { offset: [65, 50], size: [40, 200], group: 2 },
                bulletSolution: [{solution: BattleModule.bulletSolution_05, params: {moveAngle: 1}}],
                bullets: [
                    { path: 'Texture/Bullets/ziseji02_SPWP/spriteFrame', position: new Vec3(65, 50), scale: Vec3.ONE, rotation: 0 }
                ]
            },
        ],
    }

    public static enemyBulletType: BulletTypeInEnemy = {
        // 红色圆形 向外扩散 一次位移有judgement， 二次扩散有moveAngle
        [BulletNameType_Enemy.fullboss_3]: {
            bundle: BundleNames.BundleBattle,
            speed: -30,
            atk: [800, 1000],
            collider: {offset: [0, 0], size: [60, 60], group: 2},
            bulletSolution: [{solution: BattleModule.bulletSolution_02, params: {judgement: new Vec3(0, -0.25 * BattleModule.BattleViewSize.height)}}, {solution: BattleModule.bulletSolution_02, params: {moveAngle: 30}}],
            bullets: [
                {path: 'Texture/Bullets/fullboss_3/spriteFrame', position: new Vec3(0, 0), scale: Vec3.ONE, rotation: 0}
            ]
        },
        // 绿色十字标 向下移动
        [BulletNameType_Enemy.Z_00_zidan_3b]: {
            bundle: BundleNames.BundleBattle,
            speed: -50,
            atk: [800, 1000],
            collider: {offset: [0, 0], size: [90, 90], group: 2},
            bulletSolution: [{solution: BattleModule.bulletSolution_04, params: {judgement: new Vec3(0, BattleModule.screenBottomSpec)}}],
            bullets: [
                {path: 'Texture/Bullets/Z_00_zidan_3b/spriteFrame', position: new Vec3(0, 0), scale: Vec3.ONE, rotation: 0}
            ]
        },
        // 红色半圆 向下散射
        [BulletNameType_Enemy.z_06]: {
            bundle: BundleNames.BundleBattle,
            speed: -50,
            atk: [800, 1000],
            collider: {offset: [0, 0], size: [36, 40], group: 2},
            bulletSolution: [{solution: BattleModule.bulletSolution_02, params: {moveAngle: 20}}],
            bullets: [
                {path: 'Texture/Bullets/z_06/spriteFrame', position: new Vec3(0, 0), scale: Vec3.ONE, rotation: 180}
            ]
        }
    }

    public static heroType: HeroConfigType = {
        [HeroType.DEFAULT]: {maxHealth: 15000}
    }

    public static missionType: MissionConfig_Base = {
        'mission2': {
            enemyBullets: [BulletNameType_Enemy.fullboss_3, BulletNameType_Enemy.Z_00_zidan_3b, BulletNameType_Enemy.z_06],
            boss: { resource: PrefabConfig.M_C_BOSS, name: 'parasitized commander', level: 50, maxHealth: 500000, dragonBone: { show: ['start'], standBy: ['start'], attack: [{animation: 'attack1', cd: 2}, {animation: 'attack2', cd: 3}] }, position: new Vec3(0, 200), solution: {bullet: [{function: 'solution_02', bulletName: BulletNameType_Enemy.fullboss_3}, {function: 'solution_03', bulletName: BulletNameType_Enemy.z_06}]}},
            monster: [
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []}, time: 1, solution: {fly: [BattleModule.planeSolution_01], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 1.5, solution: {fly: [BattleModule.planeSolution_01], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 2, solution: {fly: [BattleModule.planeSolution_01], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 2.5, solution: {fly: [BattleModule.planeSolution_01], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 3, solution: {fly: [BattleModule.planeSolution_01], bullet: []}, carryProp: PropsType.WeaponUp},

                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 3, solution: {fly: [BattleModule.planeSolution_02], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 3.5, solution: {fly: [BattleModule.planeSolution_02], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 4, solution: {fly: [BattleModule.planeSolution_02], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 4.5, solution: {fly: [BattleModule.planeSolution_02], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 5, solution: {fly: [BattleModule.planeSolution_02], bullet: []}, carryProp: PropsType.WeaponUp},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 3.5, solution: {fly: [BattleModule.planeSolution_12], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 4, solution: {fly: [BattleModule.planeSolution_12], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 4.5, solution: {fly: [BattleModule.planeSolution_12], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 5, solution: {fly: [BattleModule.planeSolution_12], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 5.5, solution: {fly: [BattleModule.planeSolution_12], bullet: []}, carryProp: PropsType.WeaponUp},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 1.5, solution: {fly: [BattleModule.planeSolution_13], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 2, solution: {fly: [BattleModule.planeSolution_13], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 2.5, solution: {fly: [BattleModule.planeSolution_13], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 3, solution: {fly: [BattleModule.planeSolution_13], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 3.5, solution: {fly: [BattleModule.planeSolution_13], bullet: []}},

                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 6, solution: {fly: [BattleModule.planeSolution_08], bullet: []}, carryProp: PropsType.HpUp},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 6.5, solution: {fly: [BattleModule.planeSolution_08], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 7, solution: {fly: [BattleModule.planeSolution_08], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 7.5, solution: {fly: [BattleModule.planeSolution_08], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 8, solution: {fly: [BattleModule.planeSolution_08], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 7, solution: {fly: [BattleModule.planeSolution_09], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 7.5, solution: {fly: [BattleModule.planeSolution_09], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 8, solution: {fly: [BattleModule.planeSolution_09], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 8.5, solution: {fly: [BattleModule.planeSolution_09], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 9, solution: {fly: [BattleModule.planeSolution_09], bullet: []}},

                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 7.5, solution: {fly: [BattleModule.planeSolution_14], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 8, solution: {fly: [BattleModule.planeSolution_14], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 8.5, solution: {fly: [BattleModule.planeSolution_14], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 9, solution: {fly: [BattleModule.planeSolution_14], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 9.5, solution: {fly: [BattleModule.planeSolution_14], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 7.5, solution: {fly: [BattleModule.planeSolution_15], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 8, solution: {fly: [BattleModule.planeSolution_15], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 8.5, solution: {fly: [BattleModule.planeSolution_15], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 9, solution: {fly: [BattleModule.planeSolution_15], bullet: []}},
                {resource: PrefabConfig.M_C_C1, name: '', level: 5, autoDestroy: true, maxHealth: 1000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 9.5, solution: {fly: [BattleModule.planeSolution_15], bullet: []}},
            
                {resource: PrefabConfig.M_C_XZF, name: '', level: 5, autoDestroy: true, maxHealth: 3000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 8, solution: {fly: [BattleModule.planeSolution_10], bullet: []}},
                {resource: PrefabConfig.M_C_XZF, name: '', level: 5, autoDestroy: true, maxHealth: 3000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 9, solution: {fly: [BattleModule.planeSolution_10], bullet: []}},
                {resource: PrefabConfig.M_C_XZF, name: '', level: 5, autoDestroy: true, maxHealth: 3000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 10, solution: {fly: [BattleModule.planeSolution_10], bullet: []}, carryProp: PropsType.WeaponUp},
                {resource: PrefabConfig.M_C_XZF, name: '', level: 5, autoDestroy: true, maxHealth: 3000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 11, solution: {fly: [BattleModule.planeSolution_10], bullet: []}},
                {resource: PrefabConfig.M_C_XZF, name: '', level: 5, autoDestroy: true, maxHealth: 3000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 12, solution: {fly: [BattleModule.planeSolution_10], bullet: []}},

                {resource: PrefabConfig.M_C_XZF, name: '', level: 5, autoDestroy: true, maxHealth: 3000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 8.5, solution: {fly: [BattleModule.planeSolution_11], bullet: []}},
                {resource: PrefabConfig.M_C_XZF, name: '', level: 5, autoDestroy: true, maxHealth: 3000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 9.5, solution: {fly: [BattleModule.planeSolution_11], bullet: []}},
                {resource: PrefabConfig.M_C_XZF, name: '', level: 5, autoDestroy: true, maxHealth: 3000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 10.5, solution: {fly: [BattleModule.planeSolution_11], bullet: []}, carryProp: PropsType.HpUp},
                {resource: PrefabConfig.M_C_XZF, name: '', level: 5, autoDestroy: true, maxHealth: 3000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 11.5, solution: {fly: [BattleModule.planeSolution_11], bullet: []}},
                {resource: PrefabConfig.M_C_XZF, name: '', level: 5, autoDestroy: true, maxHealth: 3000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: []},  time: 12.5, solution: {fly: [BattleModule.planeSolution_11], bullet: []}},

                {resource: PrefabConfig.M_C_XZF, name: '', level: 5, autoDestroy: false, maxHealth: 20000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: [{animation: 'attack_1', cd: 2}]},  time: 8, solution: {fly: [BattleModule.planeSolution_05], bullet: [{function: 'solution_04', bulletName: BulletNameType_Enemy.Z_00_zidan_3b}]}},
                {resource: PrefabConfig.M_C_XZF, name: '', level: 5, autoDestroy: false, maxHealth: 20000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: [{animation: 'attack_1', cd: 2}]},  time: 8, solution: {fly: [BattleModule.planeSolution_06], bullet: [{function: 'solution_04', bulletName: BulletNameType_Enemy.Z_00_zidan_3b}]}, carryProp: PropsType.HpUp},
                {resource: PrefabConfig.M_C_XZF, name: '', level: 5, autoDestroy: false, maxHealth: 20000, dragonBone: {show: ['start_1'], standBy: ['start_1'], attack: [{animation: 'attack_1', cd: 2}]},  time: 8, solution: {fly: [BattleModule.planeSolution_07], bullet: [{function: 'solution_04', bulletName: BulletNameType_Enemy.Z_00_zidan_3b}]}},

            ],
            props: {}
        }
    }

    public static skillType = {
        'bbomb': {
            atk: 5000
        }
    }

    /**
     * （敌人）创建受到攻击对话
     * @param damageMsg 伤害信息
     * @param offsetHealth 伤害量
     * @param position 创建位置
     * @param parent 父节点
     */
    public static async createLabelHitHealth(damageMsg: DamageMsgType, offsetHealth: number, position: Vec3, parent: Node) {
        // console.log(BattleModule.hitLabelPool)
        const node = BattleModule.hitLabelPool.size() > 0 ? BattleModule.hitLabelPool.get() : instantiate(UIManager.instance.hitHealthPrefab);//instantiate(UIManager.instance.hitHealthPrefab);
        // node init
        node.scale = Vec3.ONE;
        node.getComponent(UIOpacity).opacity = 255;
        const data = damageMsg.isCrit ? AssetsConfig.battleHitCritFont : AssetsConfig.battleHitFont;

        const font: Font = await LoadManager.instance.loadAssetFromBundle(data.bundle, data.path, Font);
        node.getComponent(Label).font = font;
        node.getComponent(Label).fontSize = data.fontSize;
        node.getComponent(Label).lineHeight = data.fontSize;

        node.parent = parent;
        node.setPosition(new Vec3(position.x + 25, position.y + 25));
        node.getComponent(Label).string = offsetHealth + '';


        // animation
        tween(node)
            .by(0.3, { position: new Vec3(0, 50) }, {
                onUpdate: (target: Vec3, ratio: number) => {
                    if (ratio > 0.5) {
                        node.getComponent(UIOpacity).opacity = 255 * (1.5 - ratio);
                    }
                    if (ratio == 1) {
                        BattleModule.hitLabelPool.put(node);

                    }
                }
            })
            .start();
    }

    /**
     * 检测本次伤害是否暴击
     * @param damage 
     * @param min 伤害最小值
     * @param max 伤害最大值
     * @param critRate 暴击概率
     * @returns 
     */
    public static checkCrit(damage: number, min: number, max: number, critRate: number = 0.2) {
        return damage > (max - min) * (1 - critRate) + min;
    }

    /**飞机从左侧飞入，贝泽尔曲线右下角飞出 */
    public static planeSolution_01(node: Node, callback: () => void) {
        const startPos = new Vec3(-1 * BattleModule.BattleViewSize.width * 0.5 - 100, BattleModule.BattleViewSize.height * (3 / 4));
        const finishPos = new Vec3(BattleModule.BattleViewSize.width * 0.5 + 100, -1 * BattleModule.BattleViewSize.height * (1 / 4));
        const cp = new Vec3(-1 * BattleModule.BattleViewSize.width * 0.5, 0);
        Tools.bezierTo(node, 5, startPos, cp, finishPos, null, callback).start();
    }
    /**飞机从右侧飞入，贝泽尔曲线左下角飞出 */
    public static planeSolution_02(node: Node, callback: () => void) {
        const startPos = new Vec3(BattleModule.BattleViewSize.width * 0.5 + 100, BattleModule.BattleViewSize.height * (3 / 4));
        const finishPos = new Vec3(-1 * BattleModule.BattleViewSize.width * 0.5 - 100, -1 * BattleModule.BattleViewSize.height * (1 / 4));
        const cp = new Vec3(BattleModule.BattleViewSize.width * 0.5, 0);
        Tools.bezierTo(node, 5, startPos, cp, finishPos, null, callback).start();
    }
    /**飞机从左侧飞入，到右侧直线向下 */
    public static planeSolution_03(node: Node, callback: () => void) {
        const startPos = new Vec3(-1 * BattleModule.BattleViewSize.width * 0.5 - 100, BattleModule.BattleViewSize.height * (3 / 4));
        const cp = new Vec3(-200, startPos.y);
        const finishPos = new Vec3(cp.x, -1000);
        tween(node).set({position: startPos}).to(2, {position: cp}).delay(2).to(4, {position: finishPos}).call(() => {
            callback && callback();
        }).start();
    }
    /**飞机从右侧飞入，到左侧直线向下 */
    public static planeSolution_04(node: Node, callback: () => void) {
        const startPos = new Vec3(BattleModule.BattleViewSize.width * 0.5 + 100, BattleModule.BattleViewSize.height * (3 / 4));
        const cp = new Vec3(200, startPos.y);
        const finishPos = new Vec3(cp.x, -1000);
        tween(node).set({position: startPos}).to(2, {position: cp}).delay(2).to(4, {position: finishPos}).call(() => {
            callback && callback();
        }).start();
    }
    /**飞机从左侧飞入，悬停 */
    public static planeSolution_05(node: Node, callback: () => void) {
        const startPos = new Vec3(-1 * BattleModule.BattleViewSize.width * 0.5 - 100, BattleModule.BattleViewSize.height * (1 / 4));
        const cp = new Vec3(-200, startPos.y);
        tween(node).set({position: startPos}).to(1, {position: cp}).start();
    }
    /**飞机从右侧飞入，悬停 */
    public static planeSolution_06(node: Node, callback: () => void) {
        const startPos = new Vec3(BattleModule.BattleViewSize.width * 0.5 + 100, BattleModule.BattleViewSize.height * (1 / 4));
        const cp = new Vec3(200, startPos.y);
        tween(node).set({position: startPos}).to(1, {position: cp}).start();
    }
    /**飞机从中上方飞入，悬停 */
    public static planeSolution_07(node: Node, callback: () => void) {
        const startPos = new Vec3(0, BattleModule.BattleViewSize.height * 0.5 + 100);
        const cp = new Vec3(0, BattleModule.BattleViewSize.height * 0.25);
        tween(node).set({position: startPos}).to(1, {position: cp}).start();
    }
    /**左侧飞入，上方飞出 */
    public static planeSolution_08(node: Node, callback: () => void) {
        const startPos = new Vec3(-1 * BattleModule.BattleViewSize.width * 0.5 - 100, 0);
        const cp1 = new Vec3(0, 0);
        const cp2 = new Vec3(BattleModule.BattleViewSize.width / 5, BattleModule.BattleViewSize.height / 4);
        const endPos = new Vec3(BattleModule.BattleViewSize.width * 0.5 + 100, BattleModule.BattleViewSize.height / 4)
        Tools.cubicBezierTo(node, 5, startPos, cp1, cp2, endPos, callback);
    }
    /**右侧飞入 上方飞出 */
    public static planeSolution_09(node: Node, callback: () => void) {
        const startPos = new Vec3(BattleModule.BattleViewSize.width * 0.5 + 100, 0);
        const cp1 = new Vec3(0, 0);
        const cp2 = new Vec3(-BattleModule.BattleViewSize.width / 5, BattleModule.BattleViewSize.height / 4);
        const endPos = new Vec3(-1 * BattleModule.BattleViewSize.width * 0.5 - 100, BattleModule.BattleViewSize.height / 4)
        Tools.cubicBezierTo(node, 5, startPos, cp1, cp2, endPos, callback);
    }
    /**左上方飞入 直线向下飞出 */
    public static planeSolution_10(node: Node, callback: () => void) {
        const startPos = new Vec3(BattleModule.BattleViewSize.width * -0.3, BattleModule.BattleViewSize.height * 0.5 + 100);
        const endPos = new Vec3(startPos.x, BattleModule.BattleViewSize.height * -0.5 - 100);
        tween(node).set({position: startPos}).to(4, {position: endPos}).call(() => {
            callback && callback();
        }).start();
    }
    /**右上方飞入 直线向下飞出 */
    public static planeSolution_11(node: Node, callback: () => void) {
        const startPos = new Vec3(BattleModule.BattleViewSize.width * 0.3, BattleModule.BattleViewSize.height * 0.5 + 100);
        const endPos = new Vec3(startPos.x, BattleModule.BattleViewSize.height * -0.5 - 100);
        tween(node).set({position: startPos}).to(4, {position: endPos}).call(() => {
            callback && callback();
        }).start();
    }
    /**左上飞入 横向飞出 */
    public static planeSolution_12(node: Node, callback: () => void) {
        const startPos = new Vec3(BattleModule.BattleViewSize.width * -0.5 - 100, BattleModule.BattleViewSize.height * 0.3);
        const endPos = new Vec3(BattleModule.BattleViewSize.width * 0.5 + 100, startPos.y);
        tween(node).set({position: startPos}).to(4, {position: endPos}).call(() => {
            callback && callback();
        }).start();
    }
    /**右上飞入 横向飞出 */
    public static planeSolution_13(node: Node, callback: () => void) {
        const startPos = new Vec3(BattleModule.BattleViewSize.width * 0.5 + 100, BattleModule.BattleViewSize.height * 0.3);
        const endPos = new Vec3(BattleModule.BattleViewSize.width * -0.5 - 100, startPos.y);
        tween(node).set({position: startPos}).to(4, {position: endPos}).call(() => {
            callback && callback();
        }).start();
    }
    /**左下飞入 横向飞出 */
    public static planeSolution_14(node: Node, callback: () => void) {
        const startPos = new Vec3(BattleModule.BattleViewSize.width * -0.5 - 100, BattleModule.BattleViewSize.height * -0.3);
        const endPos = new Vec3(BattleModule.BattleViewSize.width * 0.5 + 100, startPos.y);
        tween(node).set({position: startPos}).to(4, {position: endPos}).call(() => {
            callback && callback();
        }).start();
    }
    /**右下飞入 横向飞出 */
    public static planeSolution_15(node: Node, callback: () => void) {
        const startPos = new Vec3(BattleModule.BattleViewSize.width * 0.5 + 100, BattleModule.BattleViewSize.height * -0.3);
        const endPos = new Vec3(BattleModule.BattleViewSize.width * -0.5 - 100, startPos.y);
        tween(node).set({position: startPos}).to(4, {position: endPos}).call(() => {
            callback && callback();
        }).start();
    }
    //-------------------------------------------bullets
    /**hero bullet 直线向上 */
    public static bulletSolution_00(node: Node, params?: BulletSolutionParams, speed = 50) {
        if (!params) params = {};
        let callback = params.callback || null;
        // 直接往上走一个屏幕
        let t = tween(node).by(10, {position: new Vec3(0, speed * 60 * 10)}).call(() => {
            callback && callback();
        }).start();
    }
    /**enemy bullet 直线向下 */
    public static bulletSolution_01(node: Node, params?: BulletSolutionParams) {
        if (!params) params = {};
        let speed = params.speed || -50;
        let callback = params.callback || null;
        // 直接往下走一个屏幕
        let t = tween(node).by(10, {position: new Vec3(0, speed * 60)}, {
            onUpdate: (target: Node, ratio: number) => {
                let destroy = target.position.y < BattleModule.screenBottomSpec;
                if (destroy) {
                    callback && callback();
                    t.stop();
                }
            }
        }).repeatForever().start();
    }
    /**向指定角度的方向移动 必传判断条件*/
    public static bulletSolution_02(node: Node, params?: BulletSolutionParams) {
        // tween(node).by(0.1, {position})
        if (!params) params = {};
        let speed = params.speed || -80;
        let callback = params.callback || null;
        let moveAngle = params.moveAngle || 90;
        let judgement = params.judgement || null;
        // z换弧度
        moveAngle = moveAngle * Math.PI / 180;
        // 直接往下走一个屏幕
        let t = tween(node).by(10, {position: new Vec3(speed * 60 * Math.cos(moveAngle), speed * 60 * Math.sin(moveAngle))}, {
            onUpdate: (target: Node, ratio: number) => {
                let destroy = ratio >= 1;
                if (judgement) {
                    if (judgement.x != 0 && judgement.y != 0) {
                        console.error('x和y的判断条件只允许一项不为0,  否则以Y为准');
                    }
                    if (judgement.x != 0) {
                        destroy = judgement.x < 0 ? target.position.x < judgement.x : target.position.x > judgement.x;
                    }
                    if (judgement.y != 0) {
                        destroy = judgement.y < 0 ? target.position.y < judgement.y : target.position.y > judgement.y;
                    }
                }
                if (destroy) {
                    callback && callback();
                    t.stop();
                }
            }
        }).repeatForever().start();

        
    }
    /**一点向外散射 */
    public static bulletSolution_03(node: Node, params?: BulletSolutionParams) {

    }
    /**enemy bullet 直线向下 附带旋转*/
    public static bulletSolution_04(node: Node, params?: BulletSolutionParams) {
        if (!params) params = {};
        const speed = params.speed || -50;
        const callback = params.callback || null;
        const rotateSpeed = 20;
        let judgement = params.judgement || null;
        // 直接往下走一个屏幕
        let t = tween(node).by(10, {position: new Vec3(0, speed * 6 * 10), angle: rotateSpeed * 6 * 10}, {
            onUpdate: (target: Node, ratio: number) => {
                let destroy = target.position.y < judgement.y;
                // console.log(judgement.y)
                if (destroy) {
                    callback && callback();
                    t.stop();
                }
            }
        }).repeatForever().start();
    }
    /**hero bullet 向上，带有角度范围的扫射 moveAngle必传*/
    public static bulletSolution_05(node: Node, params?: BulletSolutionParams, speed = 50) {
        if (!params) params = {};
        let _speed = speed || 50;
        const callback = params.callback || null;
        const moveAngle = (params.moveAngle) * Math.PI / 180;
        // console.log(10 * Math.cos(moveAngle), moveAngle)
        node.getChildByName('bulletSprite').angle = params.moveAngle - 90;

        let t = tween(node).by(10, {position: new Vec3(_speed * 60 * 10 * Math.cos(moveAngle), _speed * 60 * 10 * Math.sin(moveAngle))}).call(() => {
            callback && callback();
        }).start();
    }
    /**像指定角度的方向移动 */
}


