import { _decorator, Component, isValid, Node, tween, v3 } from 'cc';
import { Tools } from '../../../Tools/Tools';
const { ccclass, property } = _decorator;

@ccclass('AIPlay')
export class AIPlay {

    private static instance: AIPlay = null;
    public static getInstance(): AIPlay {
        if (AIPlay.instance == null) {
            AIPlay.instance = new AIPlay();
        }
        return AIPlay.instance;
    }
    

    // 计划分6种运动 彼此循环
    // 左 版边
    // 右 版边
    // 贝塞尔左上
    // 下
    // 贝塞尔右上
    // 直接回原点

    public action(plane: Node) {
        if (!isValid(plane)) return;
        let delayTime = 0.25;
        // action0
        const action0 = tween(plane).to(0.5, {position: v3(-200, -400)}).delay(delayTime);
        // action1
        const action1 = tween(plane).to(0.5, {position: v3(200, -400)}).delay(delayTime);
        // action2
        const action2 = Tools.bezierTo(plane, 0.75, v3(200, -400), v3(200, -200), v3(-200, -200)).delay(delayTime);
        // action3
        const action3 = tween(plane).to(0.5, {position: v3(-200, -400)}).delay(delayTime);
        // action4
        const action4 = Tools.bezierTo(plane, 0.75, v3(-200, -400), v3(-200, -200), v3(200, -200)).delay(delayTime);
        // action5
        const action5 = tween(plane).to(0.5, {position: v3(0, -400)}).delay(delayTime);

        tween(plane).
        sequence(
            action0,
            action1,
            action2,
            action3,
            action4,
            action5
        ).repeatForever().start();

    }





}


