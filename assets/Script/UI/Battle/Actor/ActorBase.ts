import { _decorator, Component, Node, Vec3 } from 'cc';
import { ActorType, DamageMsgType } from '../../../Interface/Local/BattleType';
const { ccclass, property } = _decorator;

@ccclass('ActorBase')
export class ActorBase extends Component {
    actorType: ActorType;
    init(data) {}
    protected register?() {}
    protected onHitten?(damageMsg: DamageMsgType, hitPosition?: Vec3, uuid?: string) {}
}


