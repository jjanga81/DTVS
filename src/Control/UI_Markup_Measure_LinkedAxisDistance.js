//import $ from 'jquery';
/**
 * @author ssjo@softhills.net
 */

 let UIMarkup_Measure_LinkedAxisDistance = function (uiBase, view, VIZCore) {
    let scope = this;

    this.base = VIZCore.UIMarkup_Base;
    this.base(uiBase, view);
    
    let measureFinishAddText = false; //측정 완료 후 Text 등록 상태

    //this.AxisKind = 0;  //0 = X Axis, 1 = Y Axis, 2 = Z Axis
    //scope.MarkupSubType = VIZCore.Enum.Axis.X;

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

        if(scope.MarkupSubType === VIZCore.Enum.Axis.X)
            uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE;
        else if(scope.MarkupSubType === VIZCore.Enum.Axis.Y)
            uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE;
        else if(scope.MarkupSubType === VIZCore.Enum.Axis.Z)
            uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE;
        
        view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);

        view.Data.Reviews.push(uiBase.currentReviewItem);
    };

    this.Release = function () {
        scope.base.prototype.Release.call(scope);

        if (uiBase.currentReviewItem !== undefined) {
            view.Data.DeleteReview(uiBase.currentReviewItem.id);
        }

        measureFinishAddText = false;
    };

    this.SetSubType = function (subType) {
        scope.MarkupSubType = subType;

        if(uiBase.currentReviewItem !== undefined) {
            if(scope.MarkupSubType === VIZCore.Enum.Axis.X)
                uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE;
            else if(scope.MarkupSubType === VIZCore.Enum.Axis.Y)
                uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE;
            else if(scope.MarkupSubType === VIZCore.Enum.Axis.Z)
                uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE;
        }
    };

    this.PreviousStep = function () {

        if (!measureFinishAddText) {
            //1개씩 제거
            if (uiBase.currentReviewItem.drawitem.position.length > 0) {
                uiBase.currentReviewItem.drawitem.position.splice(uiBase.currentReviewItem.drawitem.position.length - 1, 1);
                view.Measure.UpdateReviewText(uiBase.currentReviewItem, uiBase.currentReviewItem.drawitem.position);
            }
        }
        else {
            measureFinishAddText = false;

            //텍스트 등록 전 상태
            let textPosition = new VIZCore.Vector3().copy(uiBase.currentReviewItem.drawitem.position[uiBase.currentReviewItem.drawitem.position.length - 1]);

            uiBase.currentReviewItem.text.position = textPosition;

            view.Renderer.Render();
            scope.mouseAction = true;
        }

        // switch (uiBase.GetStep()) {
        //     case 1:
        //         {
        //             view.Data.DeleteReview(uiBase.currentReviewItem.id);
        //             view.Renderer.Render();
        //             scope.mouseAction = true;
        //         }
        //         break;
        // }
    };


    this.ProcessStep = function (pickData) {

        if (!measureFinishAddText) {
            //측정중
            if (pickData === undefined) return;
            if (!pickData.pick) return;

            uiBase.currentReviewItem.drawitem.position.push(new VIZCore.Vector3().copy(pickData.position));           

            if (uiBase.currentReviewItem.drawitem.position.length >= 2) {
                //텍스트 등록 전 상태
                let textPosition = new VIZCore.Vector3().copy(uiBase.currentReviewItem.drawitem.position[uiBase.currentReviewItem.drawitem.position.length - 1]);

                uiBase.currentReviewItem.text.position = textPosition;
                view.Measure.UpdateReviewText(uiBase.currentReviewItem, uiBase.currentReviewItem.drawitem.position);
            }

            uiBase.NextStep();
            view.Renderer.Render();

            if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT)) {
                view.Pick.RefreshPreselectEdgeProcess();
            }
        }
        else {
            //측정 완료

            uiBase.currentReviewItem = undefined;
            view.Control.RestoreMode(); //뒤로

            view.Renderer.Render();
        }

        
        // switch (uiBase.GetStep()) {
        //     case 0:
        //         {
        //             if (pickData === undefined) return;
        //             if (!pickData.pick) return;
                    
        //             if(pickData.preselectKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE) {
        //                 //Edge 선택시 step 1 스킵
        //                 uiBase.currentReviewItem.drawitem.position[0] = new VIZCore.Vector3().copy(pickData.preselect.vData[0]);
        //                 uiBase.currentReviewItem.drawitem.position[1] = new VIZCore.Vector3().copy(pickData.preselect.vData[1]);
        //                 uiBase.currentReviewItem.text.position = new VIZCore.Vector3().copy(pickData.preselect.vData[0]);

        //                 let textData = uiBase.currentReviewItem.drawitem.position;
        //                 uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE;

        //                 view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);
        //                 view.Measure.UpdateReviewText(uiBase.currentReviewItem, textData);
    
        //                 //등록
        //                 view.Data.Reviews.push(uiBase.currentReviewItem);
                        
        //                 //uiBase.NextStep();
        //                 uiBase.NextStep();
        //                 view.Renderer.Render();
        //             }
        //             else {
        //                 //uiBase.currentReviewItem.drawitem.position[0] = new VIZCore.Vector3().copy(pickData.position);
        //                 uiBase.currentReviewItem.drawitem.position.push(new VIZCore.Vector3().copy(pickData.position));
        //                 view.Renderer.Render();
        //                 uiBase.NextStep();
        //             }
        //         }
        //         break;
        //     case 1:
        //         {
        //             if (pickData === undefined) return;
        //             if (!pickData.pick) return;

        //             uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE;

        //             //uiBase.currentReviewItem.drawitem.position[1] = new VIZCore.Vector3().copy(pickData.position);
        //             uiBase.currentReviewItem.drawitem.position.push(new VIZCore.Vector3().copy(pickData.position));
        //             //uiBase.currentReviewItem.text.position = new VIZCore.Vector3().copy(pickData.position);

        //             let textData = uiBase.currentReviewItem.drawitem.position;

        //             view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);
        //             view.Measure.UpdateReviewText(uiBase.currentReviewItem, textData);

        //             //등록
        //             view.Data.Reviews.push(uiBase.currentReviewItem);

        //             view.Renderer.Render();
        //             uiBase.NextStep();
        //         }
        //         break;
        //     case 10:
        //         {
        //             uiBase.currentReviewItem = undefined;

        //             //view.Control.SetMode(VIZCore.Enum.CONTROL_STATE.MARKUP, REVIEW_TYPES.RK_MEASURE_POS); //다시 시작
        //             //view.Control.SetMode(VIZCore.Enum.CONTROL_STATE.NORMAL); //종료
        //             view.Control.RestoreMode(); //뒤로

        //             view.Renderer.Render();
        //         }
        //         break;
        // }

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

        if (measureFinishAddText) {
            let mvpMatrix = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, view.Camera.cameraMatrix);

            let screen = view.Camera.world2ScreenWithMatrix(mvpMatrix, new VIZCore.Vector3().copy(uiBase.currentReviewItem.text.position));
            let world = view.Camera.screen2WorldWithMatrix(mvpMatrix, new VIZCore.Vector3(x, y, screen.z));

            uiBase.currentReviewItem.text.position.copy(world);
            view.Renderer.Render();
        }
    };

    this.mouseUp = function (x, y, button) {
        uiBase.actionEnabled = false;
        uiBase.base.prototype.mouseUp.call(uiBase, x, y, button);
        uiBase.actionEnabled = true;

        if (button === 0 && uiBase.GetMouseClick(uiBase.mouse.x, uiBase.mouse.y)) {
            if (!measureFinishAddText) {

                let bProcessMouseUp = true;

                if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT)) {
                    //Preselect 선택 정보 확인
                    let preselectData = view.Pick.GetPreselectDataPick(uiBase.mouse.x, uiBase.mouse.y);
                    if(preselectData !== undefined) {
                        //Preselect 선택으로 처리
                        view.Data.GetPreselectPick(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);
                        scope.mouseAction = false;
                        bProcessMouseUp = false;
                    }
                }

                if(bProcessMouseUp) {
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
                                bProcessMouseUp = false;
                            }
                        }

                        //Body Pick
                        if(bProcessMouseUp) {
                            if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.SURFACE)) {
                                view.Data.GetPickByBodyCacheDownload(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);
                            }
                            scope.mouseAction = false;
                            bProcessMouseUp = false;
                        }
                    }
                }
            }
            else {
                //측정 완료
                scope.ProcessStep();
            }
        }
        else
            view.MeshBlock.Reset();

        return scope.mouseAction;
    };

    this.mouseDoubleClick = function (x, y, button) {

        if (!measureFinishAddText) {
            //등록 실패
            if (uiBase.currentReviewItem.drawitem.position.length < 2) return;
            measureFinishAddText = true;
           
            uiBase.NextStep();
            view.Renderer.Render();
        }
    };

    this.mouseWheel = function (x, y, delta) {
        if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.ZOOM))
            uiBase.base.prototype.mouseWheel.call(uiBase, x, y, delta);
    };

    this.keyUp = function(keycode) {

        if(!measureFinishAddText) //ESC
        {
            //등록 실패
            if (uiBase.currentReviewItem.drawitem.position.length < 2) return true;

            //등록 시도
            measureFinishAddText = true;
           
            uiBase.NextStep();
            view.Renderer.Render();

            return false;
        }

        return true;
    };

    this.Render2D = function (context) {
        if (uiBase.currentReviewItem.drawitem.position.length >= 2) return;
        if (measureFinishAddText) return;

        const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

        let pointSize = 3;
        context.fillStyle = "rgba(0, 255, 0, 1)";

        for (let i = 0; i < uiBase.currentReviewItem.drawitem.position.length; i++) {
            let v1 = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, uiBase.currentReviewItem.drawitem.position[i]);
            view.Renderer.Util.DrawPoint(context, v1.x, v1.y, pointSize);
        }


        // const matMVMatrix = new VIZCore.Matrix4();
        // matMVMatrix.copy(view.Camera.cameraMatrix);
        // const matMVP = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, matMVMatrix);

        // switch (uiBase.GetStep()) {
        //     case 0:
        //         break;
        //     case 1:
        //         {
        //             let pointSize = 3;
        //             context.fillStyle = "rgba(0, 255, 0, 1)";

        //             let clipspace = new VIZCore.Matrix4().transformVector(matMVP.elements,
        //                 [uiBase.currentReviewItem.drawitem.position[0].x, uiBase.currentReviewItem.drawitem.position[0].y, uiBase.currentReviewItem.drawitem.position[0].z, 1]);

        //             // divide X and Y by W just like the GPU does.
        //             clipspace[0] /= clipspace[3];
        //             clipspace[1] /= clipspace[3];

        //             // convert from clipspace to pixels
        //             let pixelX = (clipspace[0] * 0.5 + 0.5) * context.canvas.width;
        //             let pixelY = (clipspace[1] * -0.5 + 0.5) * context.canvas.height;

        //             //let pos = new VIZCore.Vector2(pixelX, pixelY);
        //             context.beginPath();
        //             context.arc(pixelX, pixelY, pointSize, 0, Math.PI * 2);
        //             context.fill();
        //         }
        //         break;
        //     case 2:
        //         break;
        // }

    };

    this.GetProcessFlag = function (flag) {

        if(!measureFinishAddText) {
            if(flag === VIZCore.Enum.MARKUP_FLAG.PRESELECT)
                return true;
                
            if(flag === VIZCore.Enum.MARKUP_FLAG.ROTATE)
                return true;

            if(flag === VIZCore.Enum.MARKUP_FLAG.ZOOM)
                return true;
                
            if(flag === VIZCore.Enum.MARKUP_FLAG.POINT)
                return true;

            if(flag === VIZCore.Enum.MARKUP_FLAG.CIRCLE_CENTER)
                return false;

            if(flag === VIZCore.Enum.MARKUP_FLAG.SURFACE)
                return true;
        }
        return false;

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

export default UIMarkup_Measure_LinkedAxisDistance;