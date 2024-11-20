//import $ from 'jquery';
/**
 * @author ssjo@softhills.net
 */

let UIMarkup_Measure_Custom_Axis_Distance = function (uiBase, view, VIZCore) {
    let scope = this;

    this.base = VIZCore.UIMarkup_Base;
    this.base(uiBase, view);

    let customAxisPos1;
    let customAxisPos2;

    this.Start = function () {
        // if ($(".ui_message").length > 0) {
        //     let textMeasure = "Measures the distance between two points.";
        //     //let message = textMeasure + "<br><p2>*</p2><p1>Press the</p1> <p2>ESC</p2> <p1>key to end the measurement.</p1>";
        //     let message = textMeasure;
        //     $(".ui_message_text").html(message);
        //     $(".ui_message").fadeIn(500);
        // }
        let textMeasure = "MG0005";
        view.UIManager.ShowMessage(textMeasure);

        scope.base.prototype.Start.call(scope);
    };

    this.Release = function () {
        scope.base.prototype.Release.call(scope);
        
        customAxisPos1 = undefined;
        customAxisPos2 = undefined;
    };

    this.PreviousStep = function () {
        switch (uiBase.GetStep()) {
            case 1:
                {
                    view.Data.DeleteReview(uiBase.currentReviewItem.id);
                    view.Renderer.Render();
                    scope.mouseAction = true;
                }
                break;
        }
    };


    this.ProcessStep = function (pickData) {

        switch (uiBase.GetStep()) {
            case 0:
                {
                    if (pickData === undefined) return;
                    if (!pickData.pick) return;

                    if(pickData.preselectKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE) {
                        //Custom Axis

                        // 방향 검사
                        
                        // uiBase.currentReviewItem.drawitem.position[2] = new VIZCore.Vector3().copy(pickData.preselect.vData[0]);
                        // uiBase.currentReviewItem.drawitem.position[3] = new VIZCore.Vector3().copy(pickData.preselect.vData[1]);
    
                        //let currentCustomAxis =
                        customAxisPos1 = new VIZCore.Vector3().copy(pickData.preselect.vData[0]);
                        customAxisPos2 = new VIZCore.Vector3().copy(pickData.preselect.vData[1]);

                        let currentCustomAxis = new VIZCore.Vector3().subVectors(customAxisPos2, customAxisPos1);
                        currentCustomAxis = currentCustomAxis.normalize();
                        uiBase.currentReviewItem.drawitem.position[2] = currentCustomAxis;

                        uiBase.NextStep();
                        view.Renderer.Render();
                    }
                }
                break;

            case 1:
                {
                    if (pickData === undefined) return;
                    if (!pickData.pick) return;

                    if(pickData.preselectKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE) {
                        //Edge 선택시 step 1 스킵
                        uiBase.currentReviewItem.drawitem.position[0] = new VIZCore.Vector3().copy(pickData.preselect.vData[0]);
                        uiBase.currentReviewItem.drawitem.position[1] = new VIZCore.Vector3().copy(pickData.preselect.vData[1]);
                        uiBase.currentReviewItem.text.position = new VIZCore.Vector3().copy(pickData.preselect.vData[0]);

                        let textData = uiBase.currentReviewItem.drawitem.position;
                        uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CUSTOM_AXIS_DISTANCE;

                        view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);
                        view.Measure.UpdateReviewText(uiBase.currentReviewItem, textData);
    
                        //등록
                        view.Data.Reviews.push(uiBase.currentReviewItem);
                        
                        uiBase.NextStep();
                        uiBase.NextStep();
                        view.Renderer.Render();
                    }
                    else {
                        uiBase.currentReviewItem.drawitem.position[0] = new VIZCore.Vector3().copy(pickData.position);
                        view.Renderer.Render();
                        uiBase.NextStep();
                    }
                }
                break;
            case 2:
                {
                    if (pickData === undefined) return;
                    if (!pickData.pick) return;

                    uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CUSTOM_AXIS_DISTANCE;

                    uiBase.currentReviewItem.drawitem.position[1] = new VIZCore.Vector3().copy(pickData.position);
                    uiBase.currentReviewItem.text.position = new VIZCore.Vector3().copy(pickData.position);


                    let textData = uiBase.currentReviewItem.drawitem.position;

                    view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);
                    view.Measure.UpdateReviewText(uiBase.currentReviewItem, textData);

                    //등록
                    view.Data.Reviews.push(uiBase.currentReviewItem);

                    view.Renderer.Render();
                    uiBase.NextStep();
                }
                break;
            case 3:
                {
                    uiBase.currentReviewItem = undefined;

                    //view.Control.SetMode(VIZCore.Enum.CONTROL_STATE.MARKUP, REVIEW_TYPES.RK_MEASURE_POS); //다시 시작
                    //view.Control.SetMode(VIZCore.Enum.CONTROL_STATE.NORMAL); //종료
                    view.Control.RestoreMode(); //뒤로

                    view.Renderer.Render();
                }
                break;
        }

        if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT)) {
            view.Pick.RefreshPreselectEdgeProcess();
        }
    };


    this.mouseDown = function (x, y, button) {

        if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.ROTATE) === false)
        {
            scope.mouseAction = false;
            uiBase.actionEnabled = false; //회전 방지
        }

        uiBase.base.prototype.mouseDown.call(uiBase, x, y, button);
        uiBase.actionEnabled = true;

        return true;
    };

    this.mouseMove = function (x, y) {
        uiBase.base.prototype.mouseMove.call(uiBase, x, y);
        switch (uiBase.GetStep()) {
            case 3:
                {
                    let mvpMatrix = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, view.Camera.cameraMatrix);

                    let screen = view.Camera.world2ScreenWithMatrix(mvpMatrix, new VIZCore.Vector3().copy(uiBase.currentReviewItem.text.position));
                    let world = view.Camera.screen2WorldWithMatrix(mvpMatrix, new VIZCore.Vector3(x, y, screen.z));

                    uiBase.currentReviewItem.text.position.copy(world);
                    view.Renderer.Render();
                }
                break;
        }
    };

    this.mouseUp = function (x, y, button) {
        uiBase.actionEnabled = false;
        uiBase.base.prototype.mouseUp.call(uiBase, x, y, button);
        uiBase.actionEnabled = true;

        if (button === 0 && uiBase.GetMouseClick(uiBase.mouse.x, uiBase.mouse.y)) {
            switch (uiBase.GetStep()) {
                case 0:
                case 1:
                case 2:
                    {
                        if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT)) {
                            //Preselect 선택 정보 확인
                            let preselectData = view.Pick.GetPreselectDataPick(uiBase.mouse.x, uiBase.mouse.y);
                            if(preselectData !== undefined) {
                                //Preselect 선택으로 처리
                                view.Data.GetPreselectPick(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);
                                scope.mouseAction = false;
                                break;
                            }
                        }

                        let body = view.Renderer.Picking(uiBase.mouse.x, uiBase.mouse.y);
                        if (body !== undefined) {

                            if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT)) {
                                if(view.Pick.GetMakePreselectID() !== body.bodyId) {

                                    let callbackMake = function (bodyId) {
                                        let makePreselect = view.Pick.MakeMeasurePreselectInfoByID(bodyId);
                                        if(makePreselect) {
                                            view.ViewRefresh();
                                        }
                                        else {
                                            if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.SURFACE)) {
                                                view.Data.GetPickByBodyCacheDownload(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);
                                            }
                                        }
                                    };
                                    view.Pick.GetBodyCacheDownload(body.bodyId, callbackMake);
                                    
                                    //view.Pick.MakeMeasurePreselectInfoByBodyCache(body.bodyId);

                                    scope.mouseAction = false;
                                    break;
                                }
                            }

                            //Body Pick
                            if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.SURFACE)) {
                                view.Data.GetPickByBodyCacheDownload(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);
                            }
                            scope.mouseAction = false;
                        }
                    }
                    break;
                case 3:
                    {
                        scope.ProcessStep();
                    }
                    break;

            }
        }
        else
            view.MeshBlock.Reset();

        return scope.mouseAction;
    };


    this.mouseWheel = function (x, y, delta) {
        if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.ZOOM))
            uiBase.base.prototype.mouseWheel.call(uiBase, x, y, delta);
    };

    this.Render2D = function (context) {

       
        const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

        switch (uiBase.GetStep()) {
            case 1:
                {
                    let lineSize = 2;

                    context.strokeStyle = "rgba(0, 255, 0, 1)";
                    context.lineWidth = lineSize;

                    if(customAxisPos1 !== undefined && customAxisPos2 !== undefined) {
                        let vScreenPos1 = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, customAxisPos1);
                        let vScreenPos2 = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, customAxisPos2);
                        view.Renderer.Util.DrawLine(context,
                             vScreenPos1.x, vScreenPos1.y, vScreenPos2.x, vScreenPos2.y);
                    }
                }
                break;
            case 2:
                {
                    {
                        let lineSize = 2;
    
                        context.strokeStyle = "rgba(0, 255, 0, 1)";
                        context.lineWidth = lineSize;
    
                        if(customAxisPos1 !== undefined && customAxisPos2 !== undefined) {
                            let vScreenPos1 = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, customAxisPos1);
                            let vScreenPos2 = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, customAxisPos2);
                            view.Renderer.Util.DrawLine(context,
                                 vScreenPos1.x, vScreenPos1.y, vScreenPos2.x, vScreenPos2.y);
                        }
                    }

                    let pointSize = 3;
                    context.fillStyle = "rgba(0, 255, 0, 1)";

                    let clipspace = new VIZCore.Matrix4().transformVector(matMVP.elements,
                        [uiBase.currentReviewItem.drawitem.position[0].x, uiBase.currentReviewItem.drawitem.position[0].y, uiBase.currentReviewItem.drawitem.position[0].z, 1]);

                    // divide X and Y by W just like the GPU does.
                    clipspace[0] /= clipspace[3];
                    clipspace[1] /= clipspace[3];

                    // convert from clipspace to pixels
                    let pixelX = (clipspace[0] * 0.5 + 0.5) * context.canvas.width;
                    let pixelY = (clipspace[1] * -0.5 + 0.5) * context.canvas.height;

                    //let pos = new VIZCore.Vector2(pixelX, pixelY);
                    context.beginPath();
                    context.arc(pixelX, pixelY, pointSize, 0, Math.PI * 2);
                    context.fill();
                }
                break;
            case 3:
                break;
        }

    };
    
    this.GetProcessFlag = function (flag) {

        switch(uiBase.GetStep())
        {
            case 0:
            {
                if(flag === VIZCore.Enum.MARKUP_FLAG.PRESELECT)
                    return true;

                if(flag === VIZCore.Enum.MARKUP_FLAG.ROTATE)
                    return true;

                if(flag === VIZCore.Enum.MARKUP_FLAG.ZOOM)
                    return true;

                if(flag === VIZCore.Enum.MARKUP_FLAG.POINT)
                    return false;

                if(flag === VIZCore.Enum.MARKUP_FLAG.CIRCLE_CENTER)
                    return false;

                if(flag === VIZCore.Enum.MARKUP_FLAG.LINE)
                    return true;

                //if(flag === VIZCore.Enum.MARKUP_FLAG.CIRCLE)
                //    return true;

                if(flag === VIZCore.Enum.MARKUP_FLAG.SURFACE)
                    return false;
            }
            break;
            case 1:
            {
                if(flag === VIZCore.Enum.MARKUP_FLAG.PRESELECT)
                    return true;

                if(flag === VIZCore.Enum.MARKUP_FLAG.ROTATE)
                    return true;

                if(flag === VIZCore.Enum.MARKUP_FLAG.ZOOM)
                    return true;

                if(flag === VIZCore.Enum.MARKUP_FLAG.POINT)
                    return true;

                if(flag === VIZCore.Enum.MARKUP_FLAG.CIRCLE_CENTER)
                    return true;

                if(flag === VIZCore.Enum.MARKUP_FLAG.LINE)
                    return true;

                //if(flag === VIZCore.Enum.MARKUP_FLAG.CIRCLE)
                //    return true;

                if(flag === VIZCore.Enum.MARKUP_FLAG.SURFACE)
                    return true;
            }
            break;

            case 2:
                {
                    if(flag === VIZCore.Enum.MARKUP_FLAG.PRESELECT)
                        return true;
    
                    if(flag === VIZCore.Enum.MARKUP_FLAG.ROTATE)
                        return true;
    
                    if(flag === VIZCore.Enum.MARKUP_FLAG.ZOOM)
                        return true;
    
                    if(flag === VIZCore.Enum.MARKUP_FLAG.POINT)
                        return true;
    
                    if(flag === VIZCore.Enum.MARKUP_FLAG.CIRCLE_CENTER)
                        return true;
    
                    if(flag === VIZCore.Enum.MARKUP_FLAG.LINE)
                        return false;
    
                    //if(flag === VIZCore.Enum.MARKUP_FLAG.CIRCLE)
                    //    return true;
    
                    if(flag === VIZCore.Enum.MARKUP_FLAG.SURFACE)
                        return true;
                }
                break;

        }

        
        return false;
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

export default UIMarkup_Measure_Custom_Axis_Distance;