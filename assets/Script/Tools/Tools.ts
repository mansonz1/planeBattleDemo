import { _decorator, bezier, Component, find, Label, Mat4, native, Node, Quat, RichText, Sprite, SpriteFrame, sys, Tween, tween, v3, Vec3 } from 'cc';
import { LoadManager } from '../Manager/LoadManager';
import { CameraShake } from './CameraShake';
const { ccclass, property } = _decorator;

@ccclass('Tools')
export class Tools {

    /**
      * 数字左边自动补0
      * @param num  num传入的数字
      * @param n n需要的字符长度
      */
    static PrefixInteger(num, n) {
        return (Array(n).join("0") + num).slice(-n);
    }

    /**
  * 毫秒转换年月日
  * @param time 毫秒时间戳
  * @returns
  */
    static conversionTime(time: number) {
        var timdedetail = time;//假如是10位毫秒需要乘1000
        //获取年份
        var year = new Date(timdedetail).getFullYear();
        //获取月份，获取的月份比实际小1，所以在使用的时候需要+1
        var month = new Date(timdedetail).getMonth() + 1;
        //获取日
        var date = new Date(timdedetail).getDate();

        //获取时
        var hours = new Date(timdedetail).getHours();
        var ss_hours = (hours > 9 ? '' : '0') + hours;


        //获取分
        var minutes = new Date(timdedetail).getMinutes();
        var ss_minutes = (minutes > 9 ? '' : '0') + minutes;

        //获取秒
        var seconds = new Date(timdedetail).getSeconds();
        var ss_seconds = (seconds > 9 ? '' : '0') + seconds;

        // 仅 时分秒 前面 补齐0
        //组合格式为年-月-日 时：分：秒（2021-7-5 21:21:21）
        var Time = year + "-" + month + "-" + date + " " + ss_hours + ":" + ss_minutes + ":" + ss_seconds;
        return Time
    }

    /**秒换算00：00:00 格式*/
    static conversionFormat(time: number) {
        let day = Math.floor(time / (3600 * 24));
        let str = '';
        let rest = 0;
        if (day > 0) {
            str = day + '天  ';
            rest = 3600;
            time -= (3600 * 24) * day;
        } else {
            rest = 3600;
        }
        let hour = Math.floor(time / rest);
        let min = Math.floor((time % rest) / 60);
        let second = Math.floor((time % rest) % 60);
        let timeStr = str + Tools.PrefixInteger(hour, 2) + ":" + Tools.PrefixInteger(min, 2) + ":" + Tools.PrefixInteger(second, 2);
        return timeStr;
    }

    static conversionDayTime(time: number) {
        let day = Math.floor(time / (3600 * 24));
        let str = '';
        let rest = 0;

        let hasDay: boolean = false;
        if (day > 0) {
            str = day + '天';
            rest = 3600;
            time -= (3600 * 24) * day;
            hasDay = true;
        } else {
            rest = 3600;
        }
        let hour = Math.floor(time / rest);
        let min = Math.floor((time % rest) / 60);
        let second = Math.floor((time % rest) % 60);

        let timeStr = str + Tools.PrefixInteger(hour, 2) + "小时" + (hasDay ? '' : Tools.PrefixInteger(min, 2) + "分");

        if (!hasDay && hour == 0) {
            timeStr = Tools.PrefixInteger(min, 2) + "分" + Tools.PrefixInteger(second, 2) + "秒";
        } else if (!hasDay && min == 0 && hour == 0) {
            timeStr = Tools.PrefixInteger(second, 2) + "秒";
        }
        return timeStr;
    }

    /**秒换算00小时00分钟00秒 格式*/
    static SecondConversionFormat(time: number) {
        let str = '';
        let hour = Math.floor(time / 3600);
        if (hour > 0) {
            str += hour + "小时";
        }
        let minute = Math.floor((time % 3600) / 60);
        if (minute > 0) {
            str += minute + "分钟";
        }
        let second = Math.floor((time % 3600) % 60);
        if (second > 0) {
            str += second + "秒";
        }
        return str;
    }

    //"2023-11-16 19:28:53" 转化成 "2023年11月16日 19:28:53"
    static MailTimeFormat(timestamp: number) {
        const date = new Date(timestamp); // JavaScript的Date对象接收的是毫秒级的时间戳，因此需要将秒级时间戳乘以1000  
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2); // 月份从0开始，因此需要加1  
        const day = ("0" + date.getDate()).slice(-2);
        const hours = ("0" + date.getHours()).slice(-2);
        const minutes = ("0" + date.getMinutes()).slice(-2);
        const seconds = ("0" + date.getSeconds()).slice(-2);
        return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
    }

    /**判断数字是否为整数 */
    static isInteger(obj) {
        return obj % 1 === 0
    }

    static compareObject(obj1: any, obj2: any) {
        return JSON.stringify(obj1) == JSON.stringify(obj2)
    }

    static setString(label: Label, message: string) {

        label.string = message
    }

    static setRichTextString(Rt: RichText, message: string) {
        Rt.string = message
    }

    static replaceString(desc: string, replaceList: string[] = []) {
        for (let i = 0, len = replaceList.length; i < len; i++) {
            desc = desc.replace("{" + i + "}", replaceList[i])
        }
        return desc
    }

    static setSpriteFrameFromBundle(sprite: Sprite, bundle: string, path: string) {
        LoadManager.instance._loadAsync<SpriteFrame>(bundle, path, SpriteFrame).then((spriteFrame) => {
            sprite.spriteFrame = spriteFrame
        })
    }
    static setSpriteFrame(sprite: Sprite, spriteFrame: SpriteFrame) {
        sprite.spriteFrame = spriteFrame;
    }

    /**
     * 将秒数转换为时分秒格式
     * @param totalSeconds 总秒数
     * @returns 转换后的时分秒格式（XX:XX:XX）
     */
    static convertToHoursMinutesSeconds(totalSeconds: number): string {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    /**
     * 秒的转换，如果满一天则返回天， 满小时不满一天则返回小时，不满小时则返回分钟，不满分钟则返回秒，所有返回值都保留最多两位小数
     * @param seconds 总秒数
     * @returns 转换后的字符串，格式为天、小时、分钟或秒
     */
    static convertSecondsToTime(seconds: number): string {
        if (seconds >= 86400) {
            const days = seconds / 86400;
            return `${days.toFixed(2)} 天`;
        } else if (seconds >= 3600) {
            const hours = seconds / 3600;
            return `${hours.toFixed(2)} 小时`;
        } else if (seconds >= 60) {
            const minutes = seconds / 60;
            return `${minutes.toFixed(2)} 分钟`;
        } else {
            return `${seconds.toFixed(2)} 秒`;
        }
    }

    public static async clipboard(str: string) {
        if (sys.isNative) {
            native.copyTextToClipboard(str);
        } else {
            try {
                let input = document.createElement("input");
                input.readOnly = true;
                input.value = str;
                document.body.appendChild(input);
                input.select();
                input.setSelectionRange(0, input.value.length);
                document.execCommand("Copy");
                document.body.removeChild(input);
            } catch (e) {
                console.log(`[Error] clipboard ${e}`);
            }
        }
    }

    /**簡易排行榜字符串長度限定 */
    public static checkSimpleRankNameLength(val: string, limitLength: number = 7) {
        // 1.asdasdasd
        // 1.好好好好好
        let b = limitLength; // 规定长度
        let init = 0;
        let newVal = '';
        // 获取字符串字节总长度
        let totalLen = 0;
        for (var l = 0; l < val.length; l++) {
            if (val.charCodeAt(l) > 255) {
                totalLen += 2;
            } else {
                totalLen++;
            }
        }
        for (var i = 0; i < val.length; i++) {
            if (init <= b) {
                newVal += val[i]
                if (val.charCodeAt(i) > 255) {
                    init += 2
                } else {
                    init++;
                }
            }
        }
        return newVal + (totalLen > b ? '...' : '')

    }

    /**屏幕震动 一次shake = 0.06s*/
    public static screenShake(shakeTimes: number = 8, shakeType: number = 1) {
        CameraShake.Instance.TweenShake(shakeTimes, shakeType);
    }

    /**两个数之间的随机整数取值 */
    public static getRandomValue(min: number, max: number) {
        return Math.floor((max - min + 1) * Math.random()) + min; // 返回整数部分
    }

    /**深拷贝 */
    public static deepClone(obj: any): any {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        // 处理引擎内置类
        if (obj instanceof Vec3) {
            return new Vec3(obj.x, obj.y, obj.z);
        }

        if (obj instanceof Quat) {
            return new Quat(obj.x, obj.y, obj.z, obj.w);
        }

        if (obj instanceof Mat4) {
            const newMat = new Mat4();
            newMat.set(obj);
            return newMat;
        }

        // 处理数组
        if (Array.isArray(obj)) {
            const newArray: any[] = [];
            for (const item of obj) {
                newArray.push(this.deepClone(item));
            }
            return newArray;
        }

        // 处理一般对象
        const newObj: Record<string, any> = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = this.deepClone(obj[key]);
            }
        }

        return newObj;
    }

    /**
     * 二次贝塞尔曲线运动（单控制点）
     * @param target 目标节点
     * @param duration 运动时间
     * @param c1 起始点
     * @param c2 控制点
     * @param to 目标点
     * @param opts any
     * @returns {Tween<Node>}
     */
    public static bezierTo(target: Node, duration: number, c1: Vec3, c2: Vec3, to: Vec3, opts?: any, callback?: () => void): Tween<Node> {
        opts = opts || Object.create(null);
        /**
        * @desc 三阶阶贝塞尔
        * @param {number} t 当前百分比
        * @param {} p1 起点坐标
        * @param {} cp 控制点
        * @param {} p2 终点坐标
        * @returns {any}
        */
        let twoBezier = (t: number, p1: Vec3, cp: Vec3, p2: Vec3) => {
            let x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
            let y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;
            let z = (1 - t) * (1 - t) * p1.z + 2 * t * (1 - t) * cp.z + t * t * p2.z;
            return v3(x, y, z);
        };
        opts.onUpdate = (arg: Vec3, ratio: number) => {
            target.position = twoBezier(ratio, c1, c2, to);
            if (ratio >= 1) {
                callback && callback();
            }
        };
        return tween(target).to(duration, {}, opts);

    }

    /**
     * 三次贝塞尔曲线运动（两个控制点）
     * @param target 目标节点
     * @param duration 运动时间
     * @param p1 起始点
     * @param cp1 控制点1
     * @param cp2 控制点2
     * @param p2 目标点
     * @param callback 动作完成的回调
     * @returns 
     */
    public static cubicBezierTo(target: Node, duration: number, p1: Vec3, cp1: Vec3, cp2: Vec3, p2: Vec3, callback?: () => void): Tween<Node> {
        let bezierCurve = (t: number, p1: Vec3, cp1: Vec3, cp2: Vec3, p2: Vec3, out: Vec3) => {
            out.x = bezier(p1.x, cp1.x, cp2.x, p2.x, t);
            out.y = bezier(p1.y, cp1.y, cp2.y, p2.y, t);
            out.z = bezier(p1.z, cp1.z, cp2.z, p2.z, t);
        }

        const startPos = p1;
        const controlPos1 = cp1;
        const controlPos2 = cp2;
        const endPos = p2;

        const tempVec3 = v3();

        return tween(target).to(duration, {position: endPos}, {onUpdate: (target: Node, ratio: number) => {
            bezierCurve(ratio, startPos, controlPos1, controlPos2, endPos, tempVec3);
            target.setPosition(tempVec3);
            if (ratio >= 1) {
                callback && callback();
            }
        }}).start();
    }

    private static counter: number = 0;

    /**生成唯一uuid */
    static generateUUID(): string {
        const timestamp = new Date().getTime().toString(16);
        const randomPart = Math.floor(Math.random() * 1000000000).toString(16);
        const counterPart = (Tools.counter++ % 1000000).toString(16);

        return `${timestamp}-${randomPart}-${counterPart}`;
    }

    /**快排 */
    static quickSort(arr: any[]) {
        if (arr.length <= 1) {
            return arr;
        }
     
        const pivotIndex = Math.floor(arr.length / 2);
        const pivot = arr.splice(pivotIndex, 1)[0];
        const left = [];
        const right = [];
     
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] < pivot) {
                left.push(arr[i]);
            } else {
                right.push(arr[i]);
            }
        }
     
        return Tools.quickSort(left).concat([pivot], Tools.quickSort(right));
    }

    /**
     * 复制文本
     * @param copyTxt 复制内容
     */
    static onCopyCode(copyTxt: string, callback?: {
        onSuccess?: () => void,
        onFail?: () => void
    }) {
        let webCopyString = async (str: string) => {
            let input = str + '';
            const el = document.createElement('input');
            el.value = input;
            el.setAttribute('readonly', '');
            el.style.contain = 'strict';
            el.style.position = 'absolute';
            el.style.left = '-100vw';
            el.style.fontSize = '12px'; // Prevent zooming on iOS
            document.body.appendChild(el);
            el.select();
            el.selectionStart = 0;
            el.selectionEnd = input.length;
            let success = false;
            try {
                success = document.execCommand('copy');
                if (!success) {
                    console.log('document.execCommand fail')
                    await navigator.clipboard.writeText(str)
                    callback && callback.onSuccess && callback.onSuccess();

                }
                
            } catch (err) {
                console.log(err)
                callback && callback.onFail && callback.onFail();
            }
     
            document.body.removeChild(el);
            return success;
        }

        webCopyString(copyTxt);

        // console.log('success', success);
    }

}
