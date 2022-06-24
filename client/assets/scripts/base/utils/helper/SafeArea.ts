
import * as cc from 'cc';
import { platform } from '../../platform/platform';
const { ccclass, property, requireComponent } = cc._decorator;

@ccclass('SafeArea')
@requireComponent(cc.Widget)
export class SafeArea extends cc.Component {
    public onEnable () {
        this.updateArea();
        cc.view.on('canvas-resize', this.updateArea, this);
    }

    public onDisable () {
        cc.view.off('canvas-resize', this.updateArea, this);
    }

    /**
     * @en Adapt to safe area
     * @zh 立即适配安全区域
     * @method updateArea
     * @example
     * let safeArea = this.node.addComponent(cc.SafeArea);
     * safeArea.updateArea();
     */
    public updateArea () {
        let widget = this.node.getComponent(cc.Widget) as cc.Widget;
        if (!widget) {
            return;
        }
        let winSize = cc.view.getVisibleSize();
        let screenWidth = winSize.width;
        let screenHeight = winSize.height;
        let safeArea = platform.getInstance().getSafeArea();

        widget.top = screenHeight - safeArea.y - safeArea.height;
        widget.bottom = safeArea.y;
        widget.left = safeArea.x;
        widget.right = screenWidth - safeArea.x - safeArea.width;
        widget.updateAlignment();
    }
}
