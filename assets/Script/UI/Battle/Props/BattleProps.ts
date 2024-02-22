import { _decorator, Component, isValid, Node, UITransform, Vec3, view } from 'cc';
import { PropsType } from '../../../Interface/Local/BattleType';
import { Main } from '../../../Scene/Main';
import { TweenManager } from '../../../Manager/TweenManager';
import { Tools } from '../../../Tools/Tools';
import { BattleModule } from '../BattleModule';
const { ccclass, property } = _decorator;

@ccclass('BattleProps')
export class BattleProps extends Component {
    public type: PropsType;

    private moveSpecX: number[] = [];
    private moveSpecY: number[] = [];

    private moveAngle = Math.random() * 360 * Math.PI / 180;
    private readonly speedBase = Math.random() * 3 + 2;
    private speed: Vec3;

    private isInited = false;

    private logicRunning = true;

    private pauseChangeState = 0;
    // 在父节点中自由移动 撞墙反弹
    public init(propType: PropsType, parentPos: Vec3) {
        this.type = propType;
        // 初始位置 height + winsize.height / 2
        this.setOriginPos(parentPos);
        this.isInited = true;
    }

    private setOriginPos(parentPos: Vec3) {
        let nodeSize = this.node.getComponent(UITransform);
        let winsize = BattleModule.BattleViewSize;
        // this.node.setPosition(new Vec3(Math.random() * winsize.width / 2 - winsize.width / 4, nodeSize.height / 2 + winsize.height / 2));
        this.node.setPosition(parentPos);
        this.moveSpecX = [-winsize.width / 2 + nodeSize.width / 2, winsize.width / 2 - nodeSize.width / 2];
        this.moveSpecY = [-winsize.height / 2 + nodeSize.height / 2, winsize.height / 2 - nodeSize.height / 2];
    
        this.speed = new Vec3(this.speedBase * Math.cos(this.moveAngle), this.speedBase * Math.sin(this.moveAngle));
    }

    /**在指定范围内随机每帧移动 */
    private randomMove(dt: number) {
        if (isValid(this.node)) {

            if (this.node.position.x >= this.moveSpecX[1]) {
                this.speed = new Vec3(-Math.abs(this.speed.x), this.speed.y);
            } 
            else if (this.node.position.x <= this.moveSpecX[0]) {
                this.speed = new Vec3(Math.abs(this.speed.x), this.speed.y);
            }

            if (this.node.position.y >= this.moveSpecY[1]) {
                this.speed = new Vec3(this.speed.x, -Math.abs(this.speed.y));

            }
            else if (this.node.position.y <= this.moveSpecY[0]) {
                this.speed = new Vec3(this.speed.x, Math.abs(this.speed.y));

            }
            this.node.setPosition(this.node.position.add(this.speed));
        }
    }

    protected update(dt: number): void {
        if (!this.isInited) return;

        if (!Main.getInstance().isLogicRunning && this.pauseChangeState == 0) {
            this.pauseChangeState = 1;
            TweenManager.pauseAllNodeTween(this.node);
            this.logicRunning = false;
            return;
        }
        if (Main.getInstance().isLogicRunning && this.pauseChangeState == 1) {
            this.pauseChangeState = 0;
            TweenManager.resumeAllNodeTween(this.node);
            this.logicRunning = true;
            return;
        }
        if (!this.logicRunning) return;

        this.randomMove(dt);
    }
}


