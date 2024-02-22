import { _decorator, Component, isValid, Node, Vec3 } from 'cc';
import { BattleView } from '../UI/Battle/BattleView';
import { BattleController } from '../UI/Battle/BattleController';
import { BulletNameType_Enemy, BulletOwnerType, BulletSingleType, HeroTypeEnum } from '../Interface/Local/BattleType';
import { BattleModule } from '../UI/Battle/BattleModule';
const { ccclass, property } = _decorator;


/**用于创建子弹对象的工厂类， 逻辑路径： missionType关卡配置 -> monster -> solution + bulletType.params -> 根据效果在工厂中创建子弹加载形式和表现  */
@ccclass('BulletFactory')
export class BulletFactory {
    
    public static controller: BattleController;
    
    constructor(controller: BattleController) {
        BulletFactory.controller = controller;
    }

    /**
     * 创建子弹方案: 子弹向指定点移动，到达后炸开散放
     * @param bulletName BattleModule中配置的子弹名
     * @param owner 子弹拥有者
     * @param parent 父节点，默认bulletZone
     */
    public solution_02(bulletName: BulletNameType_Enemy | HeroTypeEnum, owner:BulletOwnerType, targetPos: Vec3, parent: Node) {
        const monsterBulletData: BulletSingleType = BattleModule.enemyBulletType[bulletName];
        let pool = /* owner == BulletOwnerType.HERO ? BulletFactory.controller.heroMainBulletPool :  */BulletFactory.controller.enemyBulletPools.get(bulletName);

        let monsterBulletNode = BulletFactory.controller.getBullet(pool, BulletOwnerType.MONSTER, bulletName);
        if (!!monsterBulletNode && monsterBulletNode.isValid) {
            monsterBulletNode.parent = parent;
            monsterBulletNode.setPosition(targetPos);
            let solutionData = monsterBulletData.bulletSolution;


            solutionData[0].solution(monsterBulletNode, {
                judgement: solutionData[0].params.judgement,
                callback: () => {
                    // monsterBulletNode.active = false;
                    pool.put(monsterBulletNode);
                    for (let i = 1; i <= 12; i++) {
                        let node = BulletFactory.controller.getBullet(pool, BulletOwnerType.MONSTER, bulletName);
                        node.setPosition(monsterBulletNode.position);
                        node.parent = parent;
                        node.active = true;
                        solutionData[1].solution(node, {
                            moveAngle: solutionData[1].params.moveAngle * i,
                            callback: () => {
                                // console.log('finish....')
                                pool.put(monsterBulletNode);
                            }
                        })
                    }
                }
            })
        }
    }

    /**创建子弹方案: 散弹枪形状 分裂：6*/
    public solution_03(bulletName: BulletNameType_Enemy | HeroTypeEnum, owner:BulletOwnerType, targetPos: Vec3, parent: Node) {
        for (let i = 0; i < 6; i++) {
            const monsterBulletData: BulletSingleType = BattleModule.enemyBulletType[bulletName];
            let pool = /* owner == BulletOwnerType.HERO ? BulletFactory.controller.heroMainBulletPool :  */BulletFactory.controller.enemyBulletPools.get(bulletName);
            let monsterBulletNode = BulletFactory.controller.getBullet(pool, BulletOwnerType.MONSTER, bulletName);

            if (!!monsterBulletNode && monsterBulletNode.isValid) {
                monsterBulletNode.parent = parent;
                monsterBulletNode.setPosition(targetPos);
                let solutionData = monsterBulletData.bulletSolution;
                //210~330
                solutionData[0].solution(monsterBulletNode, {
                    moveAngle: i * solutionData[0].params.moveAngle + 45,
                    callback: () => {
                        pool.put(monsterBulletNode);
                    }
                })
            }
        }
    }

    /**创建子弹方案： 回旋镖向下移动 */
    public solution_04(bulletName: BulletNameType_Enemy | HeroTypeEnum, owner:BulletOwnerType, targetPos: Vec3, parent: Node) {
        const monsterBulletData: BulletSingleType = BattleModule.enemyBulletType[bulletName];
        let pool = /* owner == BulletOwnerType.HERO ? BulletFactory.controller.heroMainBulletPool :  */BulletFactory.controller.enemyBulletPools.get(bulletName);
        let monsterBulletNode = BulletFactory.controller.getBullet(pool, BulletOwnerType.MONSTER, bulletName);

        if (!!monsterBulletNode && monsterBulletNode.isValid) {
            monsterBulletNode.parent = parent;
            monsterBulletNode.setPosition(targetPos);
            let solutionData = monsterBulletData.bulletSolution;
    
            solutionData[0].solution(monsterBulletNode, {
                judgement: solutionData[0].params.judgement,
                callback: () => {
                    pool.put(monsterBulletNode)
                }
            })
        }
    }

    /**创建子弹方案 hero 子弹有规律向周边散射 */
}


