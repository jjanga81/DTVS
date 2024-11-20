//import $ from 'jquery';
/**
 * @author ssjo@softhills.net
 */

 let UIMarkup_Measure_LinkedArea = function (uiBase, view, VIZCore) {
    let scope = this;

    this.base = VIZCore.UIMarkup_Base;
    this.base(uiBase, view);

    let measureFinishAddText = false; //측정 완료 후 Text 등록 상태

    this.Start = function () {
        // if ($(".ui_message").length > 0) {
        //     let textMeasure = "Measure the surface area.";
        //     //let message = textMeasure + "<br><p2>*</p2><p1>Press the</p1> <p2>ESC</p2> <p1>key to end the measurement.</p1>";
        //     let message = textMeasure;
        //     $(".ui_message_text").html(message);
        //     $(".ui_message").fadeIn(500);
        // }
        let textMeasure = "MG0008";
        view.UIManager.ShowMessage(textMeasure);

        scope.base.prototype.Start.call(scope);

        uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKEDAREA;
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
            let vCenter;
            let vMin, vMax;
            for (let i = 0; i < uiBase.currentReviewItem.drawitem.position.length; i++) {
                //Min Max Center 구하기
                if (i === 0) {
                    vMin = new VIZCore.Vector3().copy(uiBase.currentReviewItem.drawitem.position[i]);
                    vMax = new VIZCore.Vector3().copy(uiBase.currentReviewItem.drawitem.position[i]);
                }
                else {
                    vMin.min(uiBase.currentReviewItem.drawitem.position[i]);
                    vMax.max(uiBase.currentReviewItem.drawitem.position[i]);
                }
            }

            vCenter = new VIZCore.Vector3((vMin.x + vMax.x) * 0.5, (vMin.y + vMax.y) * 0.5, (vMin.z + vMax.z) * 0.5);
            uiBase.currentReviewItem.text.position = vCenter;

            view.Renderer.Render();
            scope.mouseAction = true;
        }

    };


    this.ProcessStep = function (pickData) {

        if (!measureFinishAddText) {
            //측정중
            if (pickData === undefined) return;
            if (!pickData.pick) return;

            if (uiBase.currentReviewItem.drawitem.position.length < 3)
                uiBase.currentReviewItem.drawitem.position.push(new VIZCore.Vector3().copy(pickData.position));
            else {
                //4번째부터 평면 위에 추가
                let currnetPlane = new VIZCore.Plane().setFromCoplanarPoints(uiBase.currentReviewItem.drawitem.position[0], uiBase.currentReviewItem.drawitem.position[1], uiBase.currentReviewItem.drawitem.position[2]);

                let fDist = Math.abs(currnetPlane.distanceToPoint(pickData.position));
                if (fDist > 0.0001) return; //실패

                uiBase.currentReviewItem.drawitem.position.push(new VIZCore.Vector3().copy(pickData.position));
            }

            if (uiBase.currentReviewItem.drawitem.position.length >= 3) {
                let vCenter;
                let vMin, vMax;
                for (let i = 0; i < uiBase.currentReviewItem.drawitem.position.length; i++) {
                    //Min Max Center 구하기
                    if (i === 0) {
                        vMin = new VIZCore.Vector3().copy(uiBase.currentReviewItem.drawitem.position[i]);
                        vMax = new VIZCore.Vector3().copy(uiBase.currentReviewItem.drawitem.position[i]);
                    }
                    else {
                        vMin.min(uiBase.currentReviewItem.drawitem.position[i]);
                        vMax.max(uiBase.currentReviewItem.drawitem.position[i]);
                    }
                }

                vCenter = new VIZCore.Vector3((vMin.x + vMax.x) * 0.5, (vMin.y + vMax.y) * 0.5, (vMin.z + vMax.z) * 0.5);
                uiBase.currentReviewItem.text.position = vCenter;

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


                // let body = view.Renderer.Picking(uiBase.mouse.x, uiBase.mouse.y);
                // if (body !== undefined) {
                //     view.Data.GetPickByBodyCacheDownload(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);

                //     scope.mouseAction = true;
                // }
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
            if (uiBase.currentReviewItem.drawitem.position.length < 3) return;
            //view.Data.Reviews.push(uiBase.currentReviewItem);

            measureFinishAddText = true;
           
            uiBase.NextStep();
            view.Renderer.Render();
        }
    };

    this.mouseWheel = function (x, y, delta) {
        if (!measureFinishAddText)
            uiBase.base.prototype.mouseWheel.call(uiBase, x, y, delta);
    };

    this.touchStart = function (touches) {

        switch (touches.length) {
            case 1:
                {
                    if (scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.ROTATE) === false) {
                        scope.mouseAction = false;
                        uiBase.actionEnabled = false; //회전 방지
                    }
                }
                break;
            case 2:
                if (scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.ROTATE) === false) {
                    scope.mouseAction = false;
                    uiBase.actionEnabled = false; //회전 방지
                }
                break;
        }

        uiBase.base.prototype.touchStart.call(uiBase, touches);

        uiBase.actionEnabled = false;
        uiBase.base.prototype.mouseDown.call(uiBase, uiBase.mouse.x, uiBase.mouse.y, 0);
        uiBase.actionEnabled = true;
    };

    this.touchMove = function (touches) {
        if (touches.length === 0) return;

        uiBase.base.prototype.touchMove.call(uiBase, touches);

        uiBase.actionEnabled = false;
        scope.mouseMove(uiBase.mouse.x, uiBase.mouse.y);
        uiBase.actionEnabled = true;
    };

    this.touchEnd = function (touches) {

        if (uiBase._touchLastCount === 1) {
            scope.mouseUp(uiBase.mouse.x, uiBase.mouse.y, 0);
        }

        uiBase.actionEnabled = false;
        uiBase.base.prototype.touchEnd.call(uiBase, touches);
        uiBase.actionEnabled = true;
    };
    
    this.keyUp = function(keycode) {

        if(!measureFinishAddText) //ESC
        {
            //등록 실패
            if (uiBase.currentReviewItem.drawitem.position.length < 3) return true;

            //등록 시도
            measureFinishAddText = true;
           
            uiBase.NextStep();
            view.Renderer.Render();

            return false;
        }

        return true;
    };

    this.Render2D = function (context) {

        if (uiBase.currentReviewItem.drawitem.position.length >= 3) return;
        if (measureFinishAddText) return;

        const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

        let pointSize = 3;
        //view.Renderer.Util_SetReviewPointOption(context, uiBase.currentReviewItem);
        context.fillStyle = "rgba(0, 255, 0, 1)";

        for (let i = 0; i < uiBase.currentReviewItem.drawitem.position.length; i++) {
            let v1 = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, uiBase.currentReviewItem.drawitem.position[i]);
            view.Renderer.Util.DrawPoint(context, v1.x, v1.y, pointSize);
        }
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

export default UIMarkup_Measure_LinkedArea;