//import $ from 'jquery';
/**
 * @author ssjo@softhills.net
 */

let UIMarkup_Measure_Smart_Axis_Distance = function (uiBase, view, VIZCore) {
    let scope = this;

    this.base = VIZCore.UIMarkup_Base;
    this.base(uiBase, view);


    let currentHandler = undefined; //축이동 핸들러
    //listHandlePostion = []; 

    let smartPickList = []; //smartAxisDistance 관리 리스트

    let lastUpdatePos = new VIZCore.Vector3(); // 마지막 업데이트 위치
    let timerUpdateMeasure = undefined; // 일정 간격으로 업데이트

    //관리 Item
    function smartAxisDistanceItem (dir) {
        let item = {
            direction: new VIZCore.Vector3().copy(dir),

            use: true,  //해당 방향 검사 여부
            pick: false, //개체 충돌 여부
            
            startPosition: new VIZCore.Vector3(), //충돌 검사 위치

            pickBodyID: 0, //충돌 개체 ID
            pickPosition: new VIZCore.Vector3(), //충돌 위치
            pickDistance: 0, // 충돌 개체 거리
        };
        return item;
    }

    // Item 측정
    function updateSmartAxisDistance() {
        if (currentHandler === undefined) return;

        if (lastUpdatePos.equals(currentHandler.center)) return;

        for (let i = 0; i < 6; i++) {
            smartPickList[i].pick = false;
            if (smartPickList[i].use === false) continue;

            smartPickList[i].startPosition.copy(currentHandler.center);

            let minFirst = true;
            let minDistance = 0;
            let minPickPosition = undefined;
            let minPickBodyId = -1;

            //let dirAxis = new VIZCore.Vector3(-1, 0, 0);
            let dirAxis = new VIZCore.Vector3().copy(smartPickList[i].direction);

            let v1 = new VIZCore.Vector3().copy(smartPickList[i].startPosition);
            let v2;
            let bodyPickProcess = function (bodies, key, map) {

                let bbox = view.Data.GetBBox(bodies);
                let direction = new VIZCore.Vector3().subVectors(bbox.center, currentHandler.center);
                let distance = direction.length();

                //direction.normalize();
                //direction = new VIZCore.Vector3(-1, 0, 0);
                direction = dirAxis;

                distance += bbox.radius;

                v2 = new VIZCore.Vector3().addVectors(v1,
                    new VIZCore.Vector3().copy(direction).multiplyScalar(distance)
                );

                let result = view.Data.GetWorldPickByID(key, v1, v2);

                if (result.pick) {
                    let minDist = new VIZCore.Vector3().subVectors(result.position, v1).length();

                    if (minFirst) {
                        minFirst = false;
                        minDistance = minDist;
                        minPickPosition = result.position;
                        minPickBodyId = key; //bodies[b].bodyId
                    }
                    else if (minDist < minDistance) {
                        minDistance = minDist;
                        minPickPosition = result.position;
                        minPickBodyId = key; //bodies[b].bodyId
                    }
                }
            };

            view.Data.BodyMap.forEach(bodyPickProcess);

            if (!minFirst) {
                //console.log("ID : " + minPickBodyId +
                //    ", posX : " + minPickPosition.x + ", posY : " + minPickPosition.y + ", posZ : " + minPickPosition.z +
                //    ", dis : " + minDistance);

                smartPickList[i].pick = true;
                smartPickList[i].pickBodyID = minPickBodyId;
                smartPickList[i].pickPosition = minPickPosition;
                smartPickList[i].pickDistance = minDistance;
            }
        }

        lastUpdatePos.copy(currentHandler.center);
    }

    this.Start = function () {
        // if ($(".ui_message").length > 0) {
        //     let textMeasure = "Measures the axis distance between that position and the object.";
        //     //let message = textMeasure + "<br><p2>*</p2><p1>Press the</p1> <p2>ESC</p2> <p1>key to end the measurement.</p1>";
        //     let message = textMeasure;
        //     $(".ui_message_text").html(message);
        //     $(".ui_message").fadeIn(500);
        // }

        let textMeasure = "MG0011";
        view.UIManager.ShowMessage(textMeasure);

        //Handle 추가
        {
            let modelBBox = view.Data.GetBBox();
            let vHandleCenter = modelBBox.center;
            //listHandlePostion = []; 

            currentHandler = view.Handle.Add(VIZCore.Enum.HANDLER_TYPE.MEASURE);
            currentHandler.center = vHandleCenter;
            currentHandler.object = null; //=== undefined 인 경우 render 방지..

            currentHandler.axis.x.enable = true;
            currentHandler.axis.y.enable = true;
            currentHandler.axis.z.enable = true;

            currentHandler.panel.xy.enable = true;
            currentHandler.panel.yz.enable = true;
            currentHandler.panel.zx.enable = true;
            
            currentHandler.sphere.enable = false; //선택 방지

            currentHandler.axis.x.visible = true;
            currentHandler.axis.y.visible = true;
            currentHandler.axis.z.visible = true;

            currentHandler.panel.xy.visible = true;
            currentHandler.panel.yz.visible = true;
            currentHandler.panel.zx.visible = true;
            
            currentHandler.sphere.visible = true;
        }

        //Smart Pick 리스트 추가
        {
            smartPickList = [];
            smartPickList[0] = smartAxisDistanceItem(new VIZCore.Vector3(-1, 0, 0));
            smartPickList[1] = smartAxisDistanceItem(new VIZCore.Vector3(1, 0, 0));
            smartPickList[2] = smartAxisDistanceItem(new VIZCore.Vector3(0, -1, 0));
            smartPickList[3] = smartAxisDistanceItem(new VIZCore.Vector3(0, 1, 0));
            smartPickList[4] = smartAxisDistanceItem(new VIZCore.Vector3(0, 0, -1));
            smartPickList[5] = smartAxisDistanceItem(new VIZCore.Vector3(0, 0, 1));
        }

        //측정 설정값 등록
        view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);

        scope.base.prototype.Start.call(scope);
    };

    this.Release = function () {

        if (currentHandler !== undefined) {
            view.Handle.ClearStateById(currentHandler.id);
            view.Handle.Delete(currentHandler.id);
            //currentHandler.enable = false;  //끄기
            currentHandler = undefined;
        }

        smartPickList = []; // 데이터 제거
        if (timerUpdateMeasure !== undefined)
            clearInterval(timerUpdateMeasure);
        timerUpdateMeasure = undefined;
        lastUpdatePos.set(0, 0, 0);

        scope.base.prototype.Release.call(scope);        
    };

    this.PreviousStep = function () {
        //switch (uiBase.GetStep()) {
        //    case 0:
        //        {
        //            view.Data.DeleteReview(uiBase.currentReviewItem.id);
        //            view.Renderer.Render();
        //            scope.mouseAction = true;
        //        }
        //        break;
        //}
    };


    this.ProcessStep = function (pickData) {

        if (pickData === undefined) return;
    };


    this.mouseDown = function (x, y, button) {

        if (currentHandler !== undefined) {
            if (currentHandler.enable && currentHandler.state === VIZCore.Enum.HANDLE_MOUSE_STATE.OVER) {
                currentHandler.state = VIZCore.Enum.HANDLE_MOUSE_STATE.DOWN;
                uiBase.actionEnabled = false;

                if (timerUpdateMeasure !== undefined)
                    clearInterval(timerUpdateMeasure);
                timerUpdateMeasure = undefined;
                lastUpdatePos.set(0, 0, 0);

                //timerUpdateMeasure = setInterval(function () {
                //    updateSmartAxisDistance();
                //}, 250);
                view.Handle.ReleaseInterval();
            }
        }

        uiBase.base.prototype.mouseDown.call(uiBase, x, y, button);
        uiBase.actionEnabled = true;

        return true;
    };

    this.mouseMove = function (x, y) {


        if (currentHandler !== undefined && currentHandler.state === VIZCore.Enum.HANDLE_MOUSE_STATE.DOWN) {
            //Handle Control

            uiBase.actionEnabled = false;
            if ((x !== uiBase.mouseLastPosition.x || y !== uiBase.mouseLastPosition.y)) {                
                //view.Handle.UpdateTransformByMouseMove(currentHandler, x, y, uiBase.mouseLastPosition.x, uiBase.mouseLastPosition.y, scope.KeyPress.shiftKey);
                view.Handle.UpdateTransformByMouseMove(currentHandler, x, y, uiBase.mouseLastPosition.x, uiBase.mouseLastPosition.y);
                view.Renderer.Render();
            }
        }
        else {
            if (!uiBase.mouseLeftDown) {
                if (currentHandler !== undefined && currentHandler.state === VIZCore.Enum.HANDLE_MOUSE_STATE.OVER)
                    view.Renderer.Render();

                view.Handle.ClearStateById(currentHandler.id);
                let overHandler = view.Handle.Pick(x, y);
                if (overHandler !== undefined && currentHandler.id === overHandler.id) {
                    currentHandler.state = VIZCore.Enum.HANDLE_MOUSE_STATE.OVER;
                    view.Renderer.Render();
                }
            }
        }

        uiBase.base.prototype.mouseMove.call(uiBase, x, y);
        uiBase.actionEnabled = true;
    };

    this.mouseUp = function (x, y, button) {

        if (currentHandler !== undefined) {
            if (currentHandler.state === VIZCore.Enum.HANDLE_MOUSE_STATE.DOWN) {
                uiBase.actionEnabled = false;
                view.Handle.ClearStateById(currentHandler.id);
                view.Renderer.Render();

                updateSmartAxisDistance();

                if (timerUpdateMeasure !== undefined)
                    clearInterval(timerUpdateMeasure);
                timerUpdateMeasure = undefined;
            }
            else {
            }
        }

        uiBase.base.prototype.mouseUp.call(uiBase, x, y, button);
        uiBase.actionEnabled = true;

        return scope.mouseAction;
    };


    this.mouseWheel = function (x, y, delta) {
        uiBase.base.prototype.mouseWheel.call(uiBase, x, y, delta);
    };


    this.Render = function () {

        if (currentHandler === undefined) return;

        const matMV = new VIZCore.Matrix4().copy(view.Camera.matMV);
        const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

        view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.BASIC2D);

        view.Shader.SetGLLight();
        view.Shader.SetClipping(undefined); //단면처리 제외
        //view.Shader.SetMatrix(view.Camera.screenProjectionMatrix, new VIZCore.Matrix4());
        //view.Shader.SetMatrix(matMVP, new VIZCore.Matrix4());
        view.Shader.SetMatrix(matMVP, matMV);

        view.Handle.RenderItem(currentHandler);

        view.Shader.EndShader();

    };

    this.Render2D = function (context) {

        //return;
        let nearPlane = view.Renderer.GetReviewNearPlane();

        let matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
       
        for (let i = 0; i < 6; i++) {
            if (smartPickList[i].use === false) continue;
            if (smartPickList[i].pick === false) continue;

            if (view.Util.IsRenderReivewNearPlane(smartPickList[i].startPosition, nearPlane)) continue;
            if (view.Util.IsRenderReivewNearPlane(smartPickList[i].pickPosition, nearPlane)) continue;

            let v1, v2;
            let vCenter;

            {
                v1 = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, smartPickList[i].startPosition);
                v2 = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, smartPickList[i].pickPosition);

                let vPickCenter = new VIZCore.Vector3().addVectors(smartPickList[i].startPosition, smartPickList[i].pickPosition).multiplyScalar(0.5);

                vCenter = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vPickCenter);
            }

            //draw
            {
                //Line Option
                view.Renderer.Util.SetReviewLineOption(context, uiBase.currentReviewItem);

                //Draw Line
                view.Renderer.Util.DrawLine(context, v1.x, v1.y, v2.x, v2.y);

                //Point 
                if (uiBase.currentReviewItem.style.point.enable) {
                    //Point Option
                    view.Renderer.Util.SetReviewPointOption(context, uiBase.currentReviewItem);

                    //Draw Point
                    view.Renderer.Util.DrawPoint(context, v2.x, v2.y, uiBase.currentReviewItem.style.point.size);
                }

                let measureTextData = [smartPickList[i].startPosition, smartPickList[i].pickPosition];
                let customText = [];
                view.Measure.UpdateReviewTextByType(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE, customText, measureTextData);

                let metrics = view.Renderer.Util.GetTextMetricsByText(context, customText, uiBase.currentReviewItem.style.font.size);
                let w = metrics.width + uiBase.currentReviewItem.style.border.offset * 2;
                let h = metrics.height * customText.length + uiBase.currentReviewItem.style.border.offset * 2;

                //bg
                {
                    let x = vCenter.x - uiBase.currentReviewItem.style.border.offset;
                    let y = vCenter.y - uiBase.currentReviewItem.style.border.offset;

                    //bg option
                    view.Renderer.Util.SetReviewBgOption(context, uiBase.currentReviewItem);

                    // 박스 그리기
                    if (uiBase.currentReviewItem.style.border.type === 0)
                        view.Renderer.Util.DrawRect(context, x, y, w, h, uiBase.currentReviewItem.style.background.enable, uiBase.currentReviewItem.style.border.enable);
                    else if (uiBase.currentReviewItem.style.border.type === 1)
                        view.Renderer.Util.DrawRoundRect(context, x, y, w, h, uiBase.currentReviewItem.style.border.round, uiBase.currentReviewItem.style.background.enable, uiBase.currentReviewItem.style.border.enable);
                }

                // font 설정
                view.Renderer.Util.SetReviewFontOption(context, uiBase.currentReviewItem);

                //Draw text
                for (let k = 0; k < customText.length; k++) {
                    context.fillText(customText[k], vCenter.x, vCenter.y + (metrics.ascent * k + metrics.ascent + uiBase.currentReviewItem.style.border.offset * k));
                }
            }

        }


    };
    

    //VIZCore.UIMarkup_Base.prototype.mouseDown = function (x, y, button) { }
    //VIZCore.UIMarkup_Base.prototype.mouseMove = function (x, y) { }
    //VIZCore.UIMarkup_Base.prototype.mouseUp = function (x, y, button) { }
    //VIZCore.UIMarkup_Base.prototype.mouseWheel = function (x, y, delta) { }
    //
    //VIZCore.UIMarkup_Base.prototype.touchStart = function (touches) { }
    //VIZCore.UIMarkup_Base.prototype.touchMove = function (touches) { }
    //VIZCore.UIMarkup_Base.prototype.touchEnd = function (touches) { }
    //VIZCore.UIMarkup_Base.prototype.Render2D = function (context) { }
};

export default UIMarkup_Measure_Smart_Axis_Distance;