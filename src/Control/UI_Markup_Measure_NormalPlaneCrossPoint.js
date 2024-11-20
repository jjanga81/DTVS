//import $ from 'jquery';
/**
 * @author ssjo@softhills.net
 */

// Normal - 평면 교차점 거리
// 라인 - 평면 교차점 거리
let UIMarkup_Measure_NormalPlaneCrossPoint = function (uiBase, view, VIZCore) {
    let scope = this;

    this.base = VIZCore.UIMarkup_Base;
    this.base(uiBase, view);


    let step1_pickData = undefined;

    this.Start = function () {
        // if ($(".ui_message").length > 0) {
        //     let textMeasure = "Measure the coordinates of a particular point.";
        //     //let message = textMeasure + "<br><p2>*</p2><p1>Press the</p1> <p2>ESC</p2> <p1>key to end the measurement.</p1>";
        //     let message = textMeasure;
        //     $(".ui_message_text").html(message);
        //     $(".ui_message").fadeIn(500);
        // }
        let textMeasure = "MG0004";
        view.UIManager.ShowMessage(textMeasure);

        scope.base.prototype.Start.call(scope);
    };

    this.Release = function () {
        step1_pickData = undefined;

        scope.base.prototype.Release.call(scope);
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
                    //if (pickData.body === undefined) return;

                    if(pickData.body)
                    {
                        step1_pickData = pickData;
                        //uiBase.currentReviewItem.drawitem.position[0] = pickData.position; //선택지점 A
                        //uiBase.currentReviewItem.drawitem.position[2] = pickData.normal; //A Normal
                    }
                    else if(pickData.preselectKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE) {

                        let position1 = new VIZCore.Vector3().copy(pickData.preselect.vData[0]);
                        let position2 = new VIZCore.Vector3().copy(pickData.preselect.vData[1]);

                        let length = new VIZCore.Vector3().subVectors(position2, position1).length();
                        //edge가 아님
                        if(length < 0.00001) return;

                        step1_pickData = pickData;

                        //Edge 선택시 step 1 스킵
                        //uiBase.currentReviewItem.drawitem.position[0] = new VIZCore.Vector3().copy(pickData.preselect.vData[0]);
                        //uiBase.currentReviewItem.drawitem.position[1] = new VIZCore.Vector3().copy(pickData.preselect.vData[1]);
                        //uiBase.currentReviewItem.drawitem.position[2] = pickData.normal; //A Normal
                    }

                    view.Renderer.Render();
                    uiBase.NextStep();
                }
                break;
            case 1:
                {
                    if (pickData === undefined) return;
                    if (!pickData.pick) return;
                    if (pickData.body === undefined) return;

                    
                    let vCrossPos = new VIZCore.Vector3();

                    if(step1_pickData.body) {

                        let lineDir = new VIZCore.Vector3().copy(step1_pickData.normal);
                        let plane = new VIZCore.Plane().setFromNormalAndCoplanarPoint(
                            new VIZCore.Vector3().copy(pickData.normal), new VIZCore.Vector3().copy(pickData.position));
                       
                        let hitResult = view.Util.PlaneVectorCrossPosition(new VIZCore.Vector3().copy(step1_pickData.position), lineDir, plane, vCrossPos);
                        if(!hitResult) return;
                    }
                    else if(step1_pickData.preselectKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE) {

                        let lineDir = new VIZCore.Vector3().subVectors(step1_pickData.preselect.vData[1], step1_pickData.preselect.vData[0]).normalize();
                        let plane = new VIZCore.Plane().setFromNormalAndCoplanarPoint(
                            new VIZCore.Vector3().copy(pickData.normal), new VIZCore.Vector3().copy(pickData.position));

                        let hitResult = view.Util.PlaneVectorCrossPosition(new VIZCore.Vector3().copy(step1_pickData.preselect.vData[0]), lineDir, plane, vCrossPos);
                        if(!hitResult) return;
                    }

                    uiBase.currentReviewItem.drawitem.position[0] = vCrossPos;

                    let textData = [];
                    textData[0] = vCrossPos;
                    uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_NORMAL_PLANE_CROSS_POINT;

                    view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);
                    view.Measure.UpdateReviewText(uiBase.currentReviewItem, textData);

                    uiBase.currentReviewItem.text.position = new VIZCore.Vector3().copy(pickData.position);

                    //등록
                    view.Data.Reviews.push(uiBase.currentReviewItem);

                    view.Renderer.Render();
                    uiBase.NextStep();
                }
                break;
            case 2:
                {
                    uiBase.currentReviewItem = undefined;

                    //view.Control.SetMode(VIZCore.Enum.CONTROL_STATE.MARKUP, REVIEW_TYPES.RK_MEASURE_POS); //다시 시작
                    //view.Control.SetMode(VIZCore.Enum.CONTROL_STATE.NORMAL); //종료
                    view.Control.RestoreMode(); //뒤로

                    view.Renderer.Render();
                }
                break;
        }

    };

    this.mouseDown = function (x, y, button) {

        switch (uiBase.GetStep()) {
            case 2:
                scope.mouseAction = false;
                uiBase.actionEnabled = false; //회전 방지
                break;
        }
        uiBase.base.prototype.mouseDown.call(uiBase, x, y, button);
        uiBase.actionEnabled = true;

        return true;
    };

    this.mouseMove = function (x, y) {
        uiBase.base.prototype.mouseMove.call(uiBase, x, y);
        switch (uiBase.GetStep()) {
            case 2:
                {
                    //let mvpMatrix = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, view.Camera.cameraMatrix);\
                    let mvpMatrix = new VIZCore.Matrix4().copy(view.Camera.matMVP);

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
                    {
                        // let body = view.Renderer.Picking(uiBase.mouse.x, uiBase.mouse.y);
                        // if (body !== undefined) {
                        //     view.Data.GetPickByBodyCacheDownload(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);

                        //     scope.mouseAction = false;
                        // }

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
                // case 1:
                //     {
                //         //Body 선택처리
                //         let body = view.Renderer.Picking(uiBase.mouse.x, uiBase.mouse.y);
                //         if (body !== undefined) {
                //             view.Data.GetPickByBodyCacheDownload(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);

                //             scope.mouseAction = false;
                //         }
                //     }
                //     break;
                case 2:
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
        if (uiBase.GetStep() !== 2)
            uiBase.base.prototype.mouseWheel.call(uiBase, x, y, delta);
    };


    this.Render = function () {

    };

    this.Render2D = function (context) {
        //const matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.matMV);
        const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

        switch (uiBase.GetStep()) {
            case 0:
                break;
            case 1:
                {
                    if(step1_pickData === undefined) return;

                    if(step1_pickData.body) {
                        
                        let pointSize = 3;
                        context.fillStyle = "rgba(0, 255, 0, 1)";

                        let drawPos = new VIZCore.Vector3().copy(step1_pickData.position);

                        let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawPos);
                        
                        context.beginPath();
                        context.arc(pos.x, pos.y, pointSize, 0, Math.PI * 2);
                        context.fill();
                    }
                    else if(step1_pickData.preselectKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE) {
                        context.strokeStyle = "rgba(0, 255, 0, 1)";
                        context.lineWidth = 3;

                        let drawPos1 = new VIZCore.Vector3().copy(step1_pickData.preselect.vData[0]);
                        let drawPos2 = new VIZCore.Vector3().copy(step1_pickData.preselect.vData[1]);

                        let linePos1 = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawPos1);
                        let linePos2 = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawPos2);

                        view.Renderer.Util.DrawLine(context, linePos1.x, linePos1.y, linePos2.x, linePos2.y);

                    }


                }
                break;
            case 2:
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
                    return true;
            }
            break;

            case 1:
                {
                    if(flag === VIZCore.Enum.MARKUP_FLAG.PRESELECT)
                        return false;
    
                    if(flag === VIZCore.Enum.MARKUP_FLAG.ROTATE)
                        return true;
    
                    if(flag === VIZCore.Enum.MARKUP_FLAG.ZOOM)
                        return true;
    
                    if(flag === VIZCore.Enum.MARKUP_FLAG.POINT)
                        return false;
    
                    if(flag === VIZCore.Enum.MARKUP_FLAG.CIRCLE_CENTER)
                        return false;
    
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

export default UIMarkup_Measure_NormalPlaneCrossPoint;