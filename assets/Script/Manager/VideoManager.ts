import { _decorator, Component, Node, NodeEventType, VideoPlayer } from 'cc';
import { ClientEventManager } from './ClientEventManager';
import { ClientEventList } from '../Form/ClientEventList';
const { ccclass, property } = _decorator;

@ccclass('VideoManager')
export class VideoManager extends Component {
    private onVideoEvent(videoPlayer: VideoPlayer, event: string) {
        if (event == VideoPlayer.EventType.COMPLETED) {
            // 视频播放完毕
            console.log('video playing completed')
            ClientEventManager.dispatchEvent(ClientEventList.Main.videoCompleted);
        }
    }
}


