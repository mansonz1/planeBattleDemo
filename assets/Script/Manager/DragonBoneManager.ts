import { dragonBones } from "cc";

export class DragonBoneManager {
    
    private static instance: DragonBoneManager = null;
    public static getInstance(): DragonBoneManager {
        if (DragonBoneManager.instance == null) {
            DragonBoneManager.instance = new DragonBoneManager();
        }
        return DragonBoneManager.instance;
    }
    
    /**
     * 播放附带一次回调的龙骨动画,不传入callback则不添加回调信息则不注册监听
     * @param dragonBone 骨骼组件
     * @param animationName 动画名
     * @param playTimes 播放次数。-1 为使用配置文件中的次数。 0 为无限循环播放
     * @param callback 回调
     */                                     
    public static playAnimationWithCallBack(dragonBone: dragonBones.ArmatureDisplay, animationName: string, playTimes: number = -1, callback?: () => void) {
        callback && dragonBone.once(dragonBones.EventObject.COMPLETE, callback, dragonBone);
        dragonBone.playAnimation(animationName, playTimes);
    }
}


