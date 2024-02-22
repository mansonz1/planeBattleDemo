export enum AnimationClipNames {
    /**主角子弹击中敌人动画 */
    HeroBulletHit = 'HeroBulletHit',
    /**爆炸IBomb */
    IBomb = 'IBomb',
    /**技能炸弹 */
    SkillBomb = 'SkillBomb',
    /**boss爆炸 */
    BBomb = 'BBomb',
    /**爆炸BugBomb */
    BugBomb = 'BugBomb',
    /**怪物子弹消失 */
    MonsterBulletHit = 'MonsterBulletHit',
    /**武器升级buff */
    WeaponUp = 'WeaponUp',
    /**加血buff */
    HpUp = 'HpUp'
}

/**缓动接口  https://docs.cocos.com/creator/3.7/manual/zh/tween/tween-function.html?h=tween*/
export enum TweenType {
    linear = 'linear',
    smooth = 'smooth',
    fade = 'fade',
    constant = 'constant',
    quadIn = 'quadIn',
    quadOut = 'quadOut',
    quadInOut = 'quadInOut',
    quadOutIn = 'quadOutIn',
    cubicIn = 'cubicIn',
    cubicOut = 'cubicOut',
    cubicInOut = 'cubicInOut',
    cubicOutIn = 'cubicOutIn',
    quartIn = 'quartIn',
    quartOut = 'quartOut',
    quardInOut = 'quardInOut',
    quartOutIn = 'quartOutIn',
    quintIn = 'quintIn',
    quintOut = 'quintOut',
    quintInOut = 'quardInOut',
    quintOutIn = 'quintOutIn',
    sineIn = 'sineIn',
    sineOut = 'sineOut',
    sineInOut = 'sineInOut',
    sineOutIn = 'sineOutIn',
    expoIn = 'expoIn',
    expoOut = 'expoOut',
    expoInOut = 'expoInOut',
    expoOutIn = 'expoOutIn',
    circIn = 'circIn',
    circOut = 'circOut',
    circInOut = 'circInOut',
    circOutIn = 'circOutIn',
    elasticIn = 'elasticIn',
    elasticOut = 'elasticOut',
    elasticInOut = 'elasticInOut',
    elasticOutIn = 'elasticOutIn',
    backIn = 'backIn',
    backOut = 'backOut',
    backInOut = 'backInOut',
    backOutIn = 'backOutIn',
    bounceIn = 'bounceIn',
    bounceOut = 'bounceOut',
    bounceInOut = 'bounceInOut',
    bounceOutIn = 'bounceOutIn',
}