import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, isValid, Node, NodePool, Vec3, view } from 'cc';
import { ClientEventManager } from '../../../Manager/ClientEventManager';
import { ClientEventList } from '../../../Form/ClientEventList';
import { BulletNameType_Enemy, BulletOwnerType, BulletSingleType, HeroTypeEnum } from '../../../Interface/Local/BattleType';
import { Main } from '../../../Scene/Main';
import { TweenManager } from '../../../Manager/TweenManager';
import { BattleModule } from '../BattleModule';
const { ccclass, property } = _decorator;

@ccclass('Bullets')
export class Bullets extends Component {
    
    public bulletOwnerType: BulletOwnerType;
    public bulletName: BulletNameType_Enemy | HeroTypeEnum;
    public isContacting = false;
    public destroyCallback: () => void;
    public bulletData: BulletSingleType;
    /**碰壁销毁的额外附加距离检查 */
    private readonly checkOffsetDistance = 100;

    private pauseChangeState = 0;
    private logicRunning = true;

    /**子弹数据在data中所占的位置 */
    public dataIndex: number;
    public fromPool: NodePool;


    protected start(): void {
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    public init(destroyCallback: () => void) {
        // 弃用
        this.destroyCallback = destroyCallback;
    }

    /**
     * 刷新子弹的飞行位置
     * @param v 初始速度x y，当flying为true后，变为自身的飞行方向
     */
    public changePosition(v: number[]) {
        if (isValid(this.node)) {
            this.node.setPosition(this.node.position.add(new Vec3(v[0], v[1])));
        }
    }

    /**contact： 在builtin物理模块这个参数为空 */
    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 避免一个子弹碰到多个敌人，导致多次发送事件，把对象池里的其他子弹错误销毁
        if (!this.isContacting && this.bulletOwnerType == BulletOwnerType.HERO) {
            // 击中
            ClientEventManager.dispatchEvent(ClientEventList.Bullet.hit, selfCollider, otherCollider);
            this.isContacting = true;
            return;
        }
        if (this.bulletOwnerType == BulletOwnerType.MONSTER) {
            ClientEventManager.dispatchEvent(ClientEventList.Bullet.hit, selfCollider, otherCollider);
        }
    }
    private onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    }

    /**检查是否应该自动销毁 */
    private checkAutoDestroy(): boolean {
        return this.node.position.x < BattleModule.BattleViewSize.width * -0.5 - this.checkOffsetDistance || this.node.position.x > BattleModule.BattleViewSize.width * 0.5 + this.checkOffsetDistance || this.node.position.y < BattleModule.BattleViewSize.height * -0.5 - this.checkOffsetDistance || this.node.position.y > BattleModule.BattleViewSize.height * 0.5 + this.checkOffsetDistance;
    }

    protected update(dt: number): void {
        if (this.checkAutoDestroy()) {
            this.destroyCallback && this.destroyCallback();
            this.fromPool.put(this.node);
        }
        
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
    }

}


