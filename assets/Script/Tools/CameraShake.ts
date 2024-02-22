import { _decorator, Camera, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraShake')

export class CameraShake extends Component {

    private static instance: CameraShake;
    public static get Instance() {
        return this.instance;
    }

    onLoad(): void {
        CameraShake.instance = this;
    }
    //#endregion
    //#region 变量
    //是否正在震动
    private isShake: boolean = false;
    //#endregion
    //#region 操作
    /**
     * 伸缩节点达到类似震动屏幕的效果
     */
    public TweenShake(shakeTimes: number = 8, shakeType: number = 1) {
        if (this.isShake) {
            return;
        }
        //设置抖动开关防止同时调用导致位移
        this.isShake = true;
        //抖动方法（可选择）
        if (shakeType == 1) {
            this.Shake1(shakeTimes);
        }
        else if (shakeType == 2) {
            this.Shake2(shakeTimes);
        }
    }
    /**
     * 抖动方法1（左右抖动）
     */
    private Shake1(shakeTimes: number = 8) {
        tween(this.node)
        .by(0.02, { worldPosition: new Vec3(5, 5) })
        .by(0.02, { worldPosition: new Vec3(-10, -10) })
        .by(0.02, { worldPosition: new Vec3(5, 5) })
        .union()
        .repeat(shakeTimes)
        .call(() => {
            this.isShake = false;
        })
        .start();
    }

    /**
     * 抖动方法2（伸缩抖动）
     */
    private Shake2(shakeTimes: number = 8) {
        let camera: Camera = this.getComponent(Camera);
        let ort: number = camera.orthoHeight;
        tween(camera)
            .to(0.02, { orthoHeight: ort + 5 })
            .to(0.02, { orthoHeight: ort - 5 })
            .to(0.02, { orthoHeight: ort })
            .union()
            .repeat(shakeTimes)
            .call(() => {
                this.isShake = false;
            })
            .start();

    }

    //#endregion
}


