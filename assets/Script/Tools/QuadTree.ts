// QuadTree.ts

import { Rect, Vec2 } from "cc";

// 游戏对象的接口
interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
}

// 四叉树节点类
class QuadTreeNode {
    boundary: Rect;
    objects: GameObject[];
    children: QuadTreeNode[];

    constructor(boundary: Rect) {
        this.boundary = boundary;
        this.objects = [];
        this.children = [null, null, null, null];
    }

    isLeaf(): boolean {
        return this.children[0] === null;
    }

    subdivide(): void {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.width / 2;
        const h = this.boundary.height / 2;

        this.children[0] = new QuadTreeNode(new Rect(x + w, y, w, h));
        this.children[1] = new QuadTreeNode(new Rect(x, y, w, h));
        this.children[2] = new QuadTreeNode(new Rect(x, y + h, w, h));
        this.children[3] = new QuadTreeNode(new Rect(x + w, y + h, w, h));
    }

    insert(obj: GameObject): boolean {
        if (!this.contains(obj)) {
            return false;
        }

        if (this.objects.length < 4 && this.isLeaf()) {
            this.objects.push(obj);
            return true;
        }

        if (this.isLeaf()) {
            this.subdivide();
        }

        for (const child of this.children) {
            if (child.insert(obj)) {
                return true;
            }
        }

        return false;
    }

    contains(obj: GameObject): boolean {
        return this.boundary.contains(new Vec2(obj.x, obj.y));
    }

    queryRange(range: Rect): GameObject[] {
        let objectsInRange: GameObject[] = [];
        if (!this.boundaryIntersectsRange(range)) {
            return objectsInRange;
        }

        for (const obj of this.objects) {
            if (range.contains(new Vec2(obj.x, obj.y))) {
                objectsInRange.push(obj);
            }
        }

        if (!this.isLeaf()) {
            for (const child of this.children) {
                objectsInRange = objectsInRange.concat(child.queryRange(range));
            }
        }

        return objectsInRange;
    }

    boundaryIntersectsRange(range: Rect): boolean {
        return !(
            range.x > this.boundary.x + this.boundary.width ||
            range.x + range.width < this.boundary.x ||
            range.y > this.boundary.y + this.boundary.height ||
            range.y + range.height < this.boundary.y
        );
    }
}

// 四叉树类
export class QuadTree {
    root: QuadTreeNode;

    constructor(width: number, height: number) {
        this.root = new QuadTreeNode(new Rect(0, 0, width, height));
    }

    insert(obj: GameObject): boolean {
        return this.root.insert(obj);
    }

    queryRange(range: Rect): GameObject[] {
        return this.root.queryRange(range);
    }
}
