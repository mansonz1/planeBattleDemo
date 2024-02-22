import { _decorator, AudioSource, AudioClip, director, find, Node, Button } from 'cc';
import { BundleNames, LoadManager } from './LoadManager';
import { AssetsConfig } from '../Config/PrefabConfig';

const { ccclass, property } = _decorator;

export enum AudioNames {
    baozou = 'baozou',
    blood_cure = 'blood_cure',
    explode_boss = 'explode_boss',
    explode_captain = 'explode_captain',
    explode_skill = 'explode_skill',
    explode_small = 'explode_small',
    weapon_up = 'weapon_up',
    hero_appear = 'hero_appear',
    battle_bk1 = 'battle_bk1',
    battle_lose = 'battle_lose',
    battle_win = 'battle_win',
    boss_come = 'boss_come'

}

@ccclass('AudioManager')
export class AudioManager {
    private static _instance: AudioManager = null
    audioSource: AudioSource
    
    public isCloseMusic: boolean = false
    public isCloseEffect: boolean = false

    public soundList: Map<string, AudioClip> = new Map();

    static get instance(): AudioManager {

        if (this._instance == null) {
            this._instance = new AudioManager()
        }
        return this._instance
    }
    

    async init() {
        let audioNode = find("Audio")
        this.audioSource = audioNode.getComponent(AudioSource)
        director.addPersistRootNode(audioNode)
        // this.close = await LoadManager.instance._loadAsync<AudioClip>(BundleNames.BundleBattle, "Sound/close", AudioClip)
        // this.click = await LoadManager.instance._loadAsync<AudioClip>(BundleNames.BundleBattle, "Sound/click", AudioClip)
        // this.load = await LoadManager.instance._loadAsync<AudioClip>(BundleNames.BundleBattle, "Sound/loginbgm", AudioClip)
        // this.main = await LoadManager.instance._loadAsync<AudioClip>(BundleNames.BundleBattle, "Sound/mainbgm", AudioClip)
        //....
        // this.isCloseMusic = localStorage.getItem("isCloseMusic") == Global.isCloseFlag
        // this.isCloseEffect = localStorage.getItem("isCloseEffect") == Global.isCloseFlag
        //....
        for (let key in AudioNames) {
            let audioClip = await LoadManager.instance.loadAssetFromBundle(BundleNames.BundleBattle, AssetsConfig[key].path, AudioClip);
            // console.log(audioClip)
            this.soundList.set(key, audioClip)
        }
        console.log('AudioManager init finished')

        this.playMusic(AudioNames.battle_bk1);


        if (Button.prototype["touchBeganClone"]) return;

        Button.prototype["touchBeganClone"] = Button.prototype["_onTouchEnded"];

        Button.prototype["_onTouchEnded"] = function (event) {

            if (this.interactable && this.enabledInHierarchy) {

                // AudioManager.instance.playEffectClick()

            }

            this.touchBeganClone(event);

        }
        // this.audioSource.play()

    }

    /**
     * @en
     * play short audio, such as strikes,explosions
     * @zh
     * 播放短音频,比如 打击音效，爆炸音效等
     * @param sound url for the audio
     * @param volume 1.0
     */
    playOneShot(sound: AudioNames, volume: number = 1.0) {
        let audioClip = this.soundList.get(sound);
        this.audioSource.playOneShot(audioClip, volume);
    }

    /**
     * @en
     * play long audio, such as the bg music
     * @zh
     * 播放长音频，比如 背景音乐
     * @param sound url for the sound
     * @param volume 1.0
     */
    playMusic(sound: AudioNames, volume: number = 1.0) {
        this.audioSource.unscheduleAllCallbacks();
        /* this.audioSource.stop(); */

        this.audioSource.clip = this.soundList.get(sound);
        this.audioSource.play();
        this.audioSource.volume = volume;
        this.audioSource.scheduleOnce(() => {
            this.audioSource.play();
        }, this.audioSource.duration)
    }

    /**
     * stop the audio play
     */
    stop() {
        this.audioSource.stop();
    }

    /**
     * pause the audio play
     */
    pause() {
        this.audioSource.pause();
    }

    /**
     * resume the audio play
     */
    resume(){
        this.audioSource.play();
    }

    // playMusicLogin() {
    //     this.audioSource.unscheduleAllCallbacks();
    //     if (this.isCloseMusic) {
    //         this.audioSource.stop()
    //         return
    //     }
    //     this.audioSource.stop();
    //     this.audioSource.clip = this.load;
    //     this.audioSource.play();
    //     this.audioSource.scheduleOnce(() => {
    //         this.audioSource.play();
    //     }, this.audioSource.duration)
    //     this.audioSource.volume = 1;

    // }
    // playMusicMain() {
    //     this.audioSource.unscheduleAllCallbacks();
    //     if (this.isCloseMusic) {
    //         this.audioSource.stop()
    //         return
    //     }
    //     this.audioSource.stop();
    //     this.audioSource.clip = this.main;
    //     this.audioSource.play();
    //     this.audioSource.scheduleOnce(() => {
    //         this.audioSource.play();
    //     }, this.audioSource.duration)
    //     this.audioSource.volume = 1;
    // }

}


