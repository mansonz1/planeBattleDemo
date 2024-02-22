import { Vec3 } from "cc";
import { PrefabConfig, PrefabConfigType } from "../../Config/PrefabConfig";
import { BulletSolutionParams } from "../../UI/Battle/BattleModule";

export enum ActorType {
    BOSS = 'BOSS',
    MONSTER = 'MONSTER',
    HERO = 'HERO'
}

export enum BulletOwnerType {
    MONSTER = 'MONSTER',
    HERO = 'HERO'
}

export enum BulletNameType_Enemy {
    fullboss_3 = 'fullboss_3',
    Z_00_zidan_3b = 'Z_00_zidan_3b',
    z_06 = 'z_06'
}

export enum PropsType {
    WeaponUp = 'WeaponUp',
    HpUp = 'HpUp',
}

export enum BossType {
    M_C_BOSS = 'M_C_BOSS'
}

export enum MonsterType {
    M_C_XZF = 'M_C_XZF',
    M_C_C1 = 'M_C_C1'
}

export enum HeroType {
    DEFAULT = 'DEFAULT'
}

// -------------hero形态类型----------------
export enum HeroTypeEnum {
    heroType1 = 0,
    heroType2 = 1,
    heroType3 = 2,
    heroType4 = 3
}
export type BulletTypeInHero<HeroEnum extends number = HeroTypeEnum> = {
    [key in HeroEnum]?: BulletSingleType[]
}

export type BulletTypeInEnemy<EnemyBullet extends string = BulletNameType_Enemy> = {
    [key in EnemyBullet]?: BulletSingleType
}
// ----------------------------
//----------------子弹类型---------------
// export enum BulletNames {
//     NORMAL_1 = 'NORMAL_1'
// }
// export type BulletType = {
//     [key in BulletNames]: BulletSingleType
    
// }
export interface BulletSingleType {
    bundle: string;
    speed: number;
    cd?: number;
    atk: [number, number];
    collider: BulletColliderType;
    bulletSolution: {solution: Function, params?: BulletSolutionParams}[];
    bullets: BulletSpriteType[];
}
interface BulletColliderType {
    offset: [number, number];
    size: [number, number];
    group: number;
}
interface BulletSpriteType {
    path: string;
    position: Vec3;
    scale: Vec3;
    rotation: number;
}
//-------------关卡配置---------------
/**英雄属性类型 */
export type HeroConfigType<HeroEnum extends string = HeroType> = {
        [key in HeroEnum]?: HeroProperty
}
/**英雄属性 */
export interface HeroProperty {
    maxHealth: number
}
/**Boss关卡配置 */
export interface MissionConfig_Boss {
    resource: PrefabConfigType,
    name: string,
    level: number,
    maxHealth: number,
    dragonBone: MissionConfig_DragonBone,
    position: Vec3,
    solution: MissionConfig_Solution
} 
export interface MissionConfig_DragonBone {
    show: string[],
    standBy: string[],
    attack: MissionConfig_DragonBone_AttackType[]
}
export interface MissionConfig_DragonBone_AttackType {
    animation: string,
    cd: number
}
/**monster关卡配置 */
export interface MissionConfig_Monster {
    resource: PrefabConfigType,
    name: string,
    level: number,
    autoDestroy: boolean,
    maxHealth: number,
    dragonBone: MissionConfig_DragonBone,
    time: number,
    carryProp?: PropsType,
    solution: MissionConfig_Solution
}
export interface MissionConfig_Solution {
    fly?: Function[],
    bullet: MissionConfig_Solution_Bullet[]
}
export interface MissionConfig_Solution_Bullet {
    function: string,
    bulletName: BulletNameType_Enemy | HeroTypeEnum
}
/**道具关卡配置 */
export interface MissionConfig_Prop {

}
/**关卡总配置 */
export interface MissionConfig_Base {
    [mission: string]: MissionConfig
}
export interface MissionConfig {
    boss?: MissionConfig_Boss,
    monster?: MissionConfig_Monster[],
    props?: MissionConfig_Prop,
    enemyBullets?: BulletNameType_Enemy[]
}

//--------------------战斗信息------------
/**单次伤害信息 */
export interface DamageMsgType {
    damage: number,
    isCrit: boolean
}

