/**
 * @author ssjo@softhills.net
 */

let UIScreenBox = function (view, VIZCore) {
    let scope = this;
    
    //base 호출사용
    this.base = VIZCore.UIBase;
    this.base(view, VIZCore);


    let boxZoomMode = false; //Zoom Mode
    let selectMode = false; //Select Mode
    let captureMode = false;  

    
    init();
    function init() {

    }


    this.UIBegin = function () {
        scope.base.prototype.UIBegin.call(scope);

        //Text
        // if ($(".ui_message").length > 0) {
        //     let textMeasure = "Drag the mouse to specify the area.";
        //     let message = textMeasure;
        //     $(".ui_message_text").html(message);
        //     $(".ui_message").fadeIn(500);
        // }
        let textMeasure = "MG0013";
        view.UIManager.ShowMessage(textMeasure);

    };

    this.UIEnd = function () {
        // if ($(".ui_message").length > 0) {
        //     $(".ui_message_text").html("");
        //     $(".ui_message").hide();
        // }
        view.UIManager.HideMessage();
        

        scope.base.prototype.UIEnd.call(scope);
    };
    
    this.SetUIMode = function (mode) {

        boxZoomMode = false;
        selectMode = false;

        if(mode !== undefined)
        {
            switch (mode)
            {
                case VIZCore.Enum.SCREENBOX_TYPES.BOXZOOM:
                {
                    boxZoomMode = true;
                }
                    break;
                case VIZCore.Enum.SCREENBOX_TYPES.SELECTBOX:
                {
                    selectMode = true;
                }
                    break;
            }
        }
        else
        {
            selectMode = true;
        }
        
    };

    this.mouseDown = function (x, y, button) {

        scope.actionEnabled = false;
        let bResult = scope.base.prototype.mouseDown.call(scope, x, y, button); 
        scope.actionEnabled = true;

        if (scope.mouseLeftDown) {
            view.Renderer.Render();
        }

        return bResult;
    };

    this.mouseMove = function (x, y) {

        scope.actionEnabled = false;
        scope.base.prototype.mouseMove.call(scope, x, y);
        scope.actionEnabled = true;

        if (scope.mouseLeftDown) {
            view.Renderer.Render();
        }

    };

    this.mouseUp = function (x, y, button) {

        scope.actionEnabled = false;
        let bResult = scope.base.prototype.mouseUp.call(scope, x, y, button);
        scope.actionEnabled = true;

        //동일 위치 제외
        if (scope.mouseDownPosition.x === x &&
            scope.mouseDownPosition.y === y)
            return bResult;

        // 완료
        let minX = Math.min(scope.mouseDownPosition.x, x);
        let minY = Math.min(scope.mouseDownPosition.y, y);
        let maxX = Math.max(scope.mouseDownPosition.x, x);
        let maxY = Math.max(scope.mouseDownPosition.y, y);
        

        if(boxZoomMode) {
            //const viewWidth = view.Renderer.GetSizeWidth();
            //const viewHeight = view.Renderer.GetSizeHeight();

            let matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

            let oldPivot = new VIZCore.Vector3().copy(view.Camera.pivot);
            let bbox = view.Data.GetBBox();
            let modelCenter = bbox.center;
            //new VIZCore.Vector3().copy(view.Camera.pivot);
            let screenPivot = view.Camera.world2ScreenWithMatrix(matMVP, modelCenter);
            //let screenPivot = view.Camera.world2ScreenWithMatrix(matMVP, oldPivot);

            let screenCenter = new VIZCore.Vector3((maxX + minX) / 2.0, (maxY + minY) / 2.0, screenPivot.z);
            let worldPos = view.Camera.screen2WorldWithMatrix(matMVP, screenCenter);

            let screenPosition = [];
            screenPosition[0] = new VIZCore.Vector3((maxX + minX) / 2.0, (maxY + minY) / 2.0, screenPivot.z);
            screenPosition[1] = new VIZCore.Vector3(minX, minY, screenPivot.z);
            screenPosition[2] = new VIZCore.Vector3(maxX, minY, screenPivot.z);
            screenPosition[3] = new VIZCore.Vector3(minX, maxY, screenPivot.z);
            screenPosition[4] = new VIZCore.Vector3(maxX, maxY, screenPivot.z);
            screenPosition[5] = new VIZCore.Vector3((maxX + minX) / 2.0, minY, screenPivot.z);
            screenPosition[6] = new VIZCore.Vector3((maxX + minX) / 2.0, maxY, screenPivot.z);
            screenPosition[7] = new VIZCore.Vector3(minX, (maxY + minY) / 2.0, screenPivot.z);
            screenPosition[8] = new VIZCore.Vector3(maxX, (maxY + minY) / 2.0, screenPivot.z);

            let bPickZoom = false;
            for(let si = 0 ; si < screenPosition.length ; si++) {
                // // body 선택
                let calPickBody = function (scope, body) {
                    if (scope.view.Browser.IsMS) {
                        scope.view.Camera.SetPivot(body.BBox.center);
                        scope.view.Camera.FocusViewBoxZoom(minX, minY, maxX, maxY, body.BBox.center);
                        view.ViewRefresh();
                    }
                    else {
                        // const resultPick = scope.view.Data.GetPickByBody(body.bodyId, screenPosition[si].x,  screenPosition[si].y);
                        // if(resultPick.pick) {
                        //     scope.view.Camera.SetPivot(resultPick.position);
                        //     scope.view.Camera.FocusViewBoxZoom(minX, minY, maxX, maxY, resultPick.position);
                        // }

                        let calPickBodyFocusView = function (resultPick) {
                            if(resultPick) {
                                if(resultPick.pick) {
                                    //scope.view.Camera.SetPivot(resultPick.position);
                                    let pickPosistion = new VIZCore.Vector3().copy(resultPick.position);
                                    let newScreenPivot = scope.view.Camera.world2ScreenWithMatrix(matMVP, pickPosistion);
                                    let newScreenCenter = new VIZCore.Vector3((maxX + minX) / 2.0, (maxY + minY) / 2.0, newScreenPivot.z);
                                    let newFocusPosistion = scope.view.Camera.screen2WorldWithMatrix(matMVP, newScreenCenter);
    
                                    scope.view.Camera.FocusViewBoxZoom(minX, minY, maxX, maxY, newFocusPosistion);
                                }
                                else
                                {
                                    view.Camera.FocusViewBoxZoom(minX, minY, maxX, maxY, worldPos);
                                   
                                }
                            }
                            view.ViewRefresh();
                        }
                        scope.view.Data.GetPickByBodyCacheDownload(screenPosition[si].x,  screenPosition[si].y, calPickBodyFocusView);                        
                    }
                };

                let resultcbPick = view.Renderer.ObjectIDCallback(screenPosition[si].x, screenPosition[si].y, scope, calPickBody, undefined);
                if(resultcbPick)
                {
                    bPickZoom = true;
                    break;
                }
            }

            if(!bPickZoom)
            {
                //view.Camera.ViewBoxZoom(minX, minY, maxX, maxY);
                view.Camera.FocusViewBoxZoom(minX, minY, maxX, maxY, worldPos);
                view.ViewRefresh();
            }
                       
            // let resultPick = scope.view.Renderer.PickingCallback(screenCenter.x, screenCenter.y, scope, calPickBody, undefined);

            // if(!resultPick)
            // {
            //     //현재 상태로
            //     view.Camera.FocusViewBoxZoom(minX, minY, maxX, maxY, worldPos);
            // }
            //view.Camera.FocusPivot(worldPos);

            //view.Camera.ViewBoxZoom(minX, minY, maxX, maxY);
            // if(view.Camera.perspectiveView) {
            //     view.Camera.FocusViewBoxZoom(minX, minY, maxX, maxY, worldPos);
            // }
            // else {
            //     view.Camera.FocusViewBoxZoom(minX, minY, maxX, maxY, worldPos);
            // }

            view.Control.RestoreMode(); //뒤로
            view.MeshBlock.Reset();
            view.Renderer.Render();
            return bResult;
        }
        else
        if(selectMode) {
            let matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

            let bbox = view.Data.GetBBox();
            let modelCenter = bbox.center;
            //new VIZCore.Vector3().copy(view.Camera.pivot);
            let screenPivot = view.Camera.world2ScreenWithMatrix(matMVP, modelCenter);

            let sreenCenter = new VIZCore.Vector3((maxX + minX) / 2.0, (maxY + minY) / 2.0, screenPivot.z);
            //let worldPos = view.Camera.screen2WorldWithMatrix(matMVP, sreenCenter);

            let bInclude = false;
			if (x > scope.mouseDownPosition.x)
				bInclude = true;

            if(view.Configuration.Model.Selection.Kind !== this.VIZCore.Enum.SelectionObject3DTypes.NONE)
            {
                view.Data.ObjectsSelectBox(minX, minY, maxX, maxY, bInclude);

                // 선택 이벤트
                let info = [];
                let ids = view.Data.GetSelection();
                if(ids.length > 0)
                {
                    info = view.Tree.GetDataToNode(ids);
                    view.Tree.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Data.Selected, info);
                }
            }

            view.Control.RestoreMode(); //뒤로
            view.MeshBlock.Reset();
            view.Renderer.Render();
        }

        return bResult;
    };

    /*
    this.mouseWheel = function (x, y, delta) {
        scope.base.prototype.mouseWheel.call(scope, x, y, delta);
    }
    */

    this.mouseDoubleClick = function (x, y, button) {
        //scope.base.prototype.mouseDoubleClick.call(scope, x, y, button);
    };

    
    this.Render2D = function (context) {

        if (!scope.mouseLeftDown) return;


        let w = scope.mouse.x - scope.mouseDownPosition.x;
        let h = scope.mouse.y - scope.mouseDownPosition.y;

        let drawLineColor = new VIZCore.Color(0, 0, 0, 100);

        //Line 색상
        context.fillStyle = "rgba(" + drawLineColor.r + "," + drawLineColor.g + ","
            + drawLineColor.b + "," + drawLineColor.glAlpha() + ")";

        context.strokeStyle = "rgba(" + drawLineColor.r + "," + drawLineColor.g + ","
            + drawLineColor.b + "," + drawLineColor.glAlpha() + ")";
        context.lineWidth = 2;

        view.Renderer.Util.DrawRect(context, scope.mouseDownPosition.x, scope.mouseDownPosition.y, w, h,
            false, true);



    };

    let pos = {};
    this.touchStart = function(touches){
        let viewSize = document.getElementById(view.GetViewID()).getBoundingClientRect();
        pos.x = touches[0].pageX - viewSize.left;
        pos.y = touches[0].pageY - viewSize.top;
        scope.mouseDown(pos.x, pos.y, 0);
    };

    this.touchMove = function(touches){
        let viewSize = document.getElementById(view.GetViewID()).getBoundingClientRect();
        pos.x = touches[0].pageX - viewSize.left;
        pos.y = touches[0].pageY - viewSize.top;
        scope.mouseMove(pos.x, pos.y, 0);
    };

    this.touchEnd = function(touches){
        scope.mouseUp(pos.x, pos.y, 0);
    };
};

export default UIScreenBox;
