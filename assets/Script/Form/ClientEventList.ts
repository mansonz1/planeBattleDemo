/**客户端本地事件 */
export class ClientEventList {
    public static Main = {
        preloadFinish: 'main-preloadFinish',
        restart: 'main-restart',
        videoCompleted: 'main-video-completed'
    }
    public static Battle = {
        start: 'battle-start',
        end: 'battle-end',
        heroDead: 'battle-heroDead',
        bossDead: 'batle-bossDead'
    }
    public static Bullet = {
        hit: 'bullet-hit'
    }
    public static Boss = {
        hitten: 'boss-hitten',
        hittenResp: 'boss-hittenResp',
        ready: 'boss-ready',
        attack: 'boss-attack'
    }
    public static Monster = {
        hitten: 'monster-hitten',
        hittenResp: 'monster-hittenResp',
        attack: 'monster-attack'
    }
    public static Hero = {
        strike: 'hero-strike',
        dead: 'hero-dead',
        changeState: 'hero-changeState',
        reset: 'hero-reset',
        restoreHp: 'hero-restoreHp'
    }
    public static Prop = {
        touch: 'prop-touch'
    }
}

