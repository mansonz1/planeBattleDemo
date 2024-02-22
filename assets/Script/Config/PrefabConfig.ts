import { AnimationClip, Asset, AudioClip, Font, Prefab, SpriteAtlas, Vec3, VideoClip, __private, animation } from "cc";
import { AnimationClipNames } from "../Interface/Local/AnimationType";
import { BossType, BulletNameType_Enemy, MonsterType } from "../Interface/Local/BattleType";
import { BundleNames } from "../Manager/LoadManager";

interface ConfigTypeBase {
    bundle: BundleNames;
    path: string;
    type: __private._types_globals__Constructor;
}
/**预制件配置类型描述 */
export interface PrefabConfigType extends ConfigTypeBase {
    component: string;
    startPos: Vec3;
}
/**sprite图集资源类型描述 */
export interface SpriteAtlasConfigType extends ConfigTypeBase {
}
/**字体资源类型描述 */
export interface FontConfigType extends ConfigTypeBase {
    fontSize: number
}
/**音频资源类型描述 */
export interface AudioConfigType extends ConfigTypeBase {
    volume: number;
}
/**视频资源类型描述 */
export interface VideoConfigType extends ConfigTypeBase {

}

/**预制体配置 */
export class PrefabConfig {
    /**战斗场景 */
    public static LayerBattle: PrefabConfigType = {bundle: BundleNames.BundleBattle, path: 'Prefab/UI/LayerBattle', type: Prefab, component: 'BattleView', startPos: null};
    /**animation动画类 */
    public static [AnimationClipNames.HeroBulletHit]: PrefabConfigType = {bundle: BundleNames.BundleBattle, path: 'Prefab/Effect/HeroBulletHit', type: Prefab, component: AnimationClipNames.HeroBulletHit, startPos: null};
    public static [AnimationClipNames.IBomb]: PrefabConfigType = {bundle: BundleNames.BundleBattle, path: 'Prefab/Effect/IBomb', type: Prefab, component: AnimationClipNames.IBomb, startPos: null};
    public static [AnimationClipNames.SkillBomb]: PrefabConfigType = {bundle: BundleNames.BundleBattle, path: 'Prefab/Effect/SkillBomb', type: Prefab, component: AnimationClipNames.SkillBomb, startPos: null};
    public static [AnimationClipNames.BBomb]: PrefabConfigType = {bundle: BundleNames.BundleBattle, path: 'Prefab/Effect/BBomb', type: Prefab, component: AnimationClipNames.BBomb, startPos: null};
    public static [AnimationClipNames.BugBomb]: PrefabConfigType = {bundle: BundleNames.BundleBattle, path: 'Prefab/Effect/BugBomb', type: Prefab, component: AnimationClipNames.BugBomb, startPos: null};
    public static [AnimationClipNames.MonsterBulletHit]: PrefabConfigType = {bundle: BundleNames.BundleBattle, path: 'Prefab/Effect/MonsterBulletHit', type: Prefab, component: AnimationClipNames.MonsterBulletHit, startPos: null};
    public static [AnimationClipNames.WeaponUp]: PrefabConfigType = {bundle: BundleNames.BundleBattle, path: 'Prefab/Effect/WeaponUp', type: Prefab, component: 'BattleProps', startPos: null};
    public static [AnimationClipNames.HpUp]: PrefabConfigType = {bundle: BundleNames.BundleBattle, path: 'Prefab/Effect/HpUp', type: Prefab, component: 'BattleProps', startPos: null};
   
    /**战斗UI */
    public static NodeMonsterHp: PrefabConfigType = {bundle: BundleNames.BundleBattle, path: 'Prefab/UI/NodeMonsterHp', type: Prefab, component: null, startPos: null};
    public static LabelHitHealth: PrefabConfigType = {bundle: BundleNames.BundleBattle, path: 'Prefab/UI/LabelHitHealth', type: Prefab, component: null, startPos: null};
    /**演员类 */
    public static [BossType.M_C_BOSS]: PrefabConfigType = {bundle: BundleNames.BundleBattle, path: 'Prefab/Actor/Enemy/NodeBoss_M_C_BOSS', type: Prefab, component: 'NodeBoss', startPos: new Vec3(0, 1000)};
    public static [MonsterType.M_C_C1]: PrefabConfigType = {bundle: BundleNames.BundleBattle, path: 'Prefab/Actor/Enemy/NodeMonster_M_C_C1', type: Prefab, component: 'NodeMonster', startPos: null};
    public static [MonsterType.M_C_XZF]: PrefabConfigType = {bundle: BundleNames.BundleBattle, path: 'Prefab/Actor/Enemy/NodeMonster_M_C_XZF', type: Prefab, component: 'NodeMonster', startPos: null};
}

/**特殊加载资源配置 */
export class AssetsConfig {
    /**boss血条图集 */
    public static atlasBossHealthBar: SpriteAtlasConfigType = {bundle: BundleNames.BundleBattle, path: 'Texture/Effects/Plist/bossHealthBar', type: SpriteAtlas};
    /**战斗伤害字体 */
    public static battleHitFont: FontConfigType = {bundle: BundleNames.BundleBattle, path: 'Font/battle_piaozi_putong', type: Font, fontSize: 26};
    public static battleHitCritFont: FontConfigType = {bundle: BundleNames.BundleBattle, path: 'Font/battle_piaozi_baoji', type: Font, fontSize: 26};
    /**音频 */
    public static baozou: AudioConfigType = {bundle: BundleNames.BundleBattle, path: 'Audio/effect/baozou', type: AudioClip, volume: 1};
    public static blood_cure: AudioConfigType = {bundle: BundleNames.BundleBattle, path: 'Audio/effect/blood_cure', type: AudioClip, volume: 1};
    public static explode_boss: AudioConfigType = {bundle: BundleNames.BundleBattle, path: 'Audio/effect/explode_boss', type: AudioClip, volume: 1};
    public static explode_captain: AudioConfigType = {bundle: BundleNames.BundleBattle, path: 'Audio/effect/explode_captain', type: AudioClip, volume: 1};
    public static explode_skill: AudioConfigType = {bundle: BundleNames.BundleBattle, path: 'Audio/effect/explode_skill', type: AudioClip, volume: 1};
    public static explode_small: AudioConfigType = {bundle: BundleNames.BundleBattle, path: 'Audio/effect/explode_small', type: AudioClip, volume: 1};
    public static weapon_up: AudioConfigType = {bundle: BundleNames.BundleBattle, path: 'Audio/effect/weapon_up', type: AudioClip, volume: 1};
    public static hero_appear: AudioConfigType = {bundle: BundleNames.BundleBattle, path: 'Audio/effect/hero_appear', type: AudioClip, volume: 1};
    public static battle_bk1: AudioConfigType = {bundle: BundleNames.BundleBattle, path: 'Audio/music/battle_bk1', type: AudioClip, volume: 1};
    public static battle_lose: AudioConfigType = {bundle: BundleNames.BundleBattle, path: 'Audio/effect/battle_lose', type: AudioClip, volume: 1};
    public static battle_win: AudioConfigType = {bundle: BundleNames.BundleBattle, path: 'Audio/effect/battle_win', type: AudioClip, volume: 1};
    public static boss_come: AudioConfigType = {bundle: BundleNames.BundleBattle, path: 'Audio/effect/boss_come', type: AudioClip, volume: 1};
    /**视频 */
    public static videoBattle: VideoConfigType = {bundle: BundleNames.BundleBattle, path: 'Video/plane', type: VideoClip};
}
