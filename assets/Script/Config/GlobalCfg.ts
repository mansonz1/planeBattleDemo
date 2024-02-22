/**全局配置类 */
export class GlobalCfg {
    private static instance: GlobalCfg = null;
    public static getInstance(): GlobalCfg {
        if (GlobalCfg.instance == null) {
            GlobalCfg.instance = new GlobalCfg();
        }
        return GlobalCfg.instance;
    }
    
    /**用户打开后是否先展示一遍试玩视频 */
    public static isShowVideoFirst: boolean = true;
    /**是否先播放一次ai操作 */
    public static isAIPlayFirst: boolean = false;
}


