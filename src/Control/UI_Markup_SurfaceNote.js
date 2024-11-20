//import $ from 'jquery';
/**
 * @author ssjo@softhills.net
 */


let UIMarkup_SurfaceNote = function (uiBase, view, VIZCore) {
    let scope = this;

    this.base = VIZCore.UIMarkup_Base;
    this.base(uiBase, view);

    this.Start = function () {
        // if ($(".ui_message").length > 0) {
        //     let textMeasure = "Note the coordinates of a particular point.";
        //     //let message = textMeasure + "<br><p2>*</p2><p1>Press the</p1> <p2>ESC</p2> <p1>key to end the measurement.</p1>";
        //     let message = textMeasure;
        //     $(".ui_message_text").html(message);
        //     $(".ui_message").fadeIn(500);
        // }
        let textMeasure = "MG0001";
        view.UIManager.ShowMessage(textMeasure);
        
        scope.base.prototype.Start.call(scope);
    };

    this.Release = function () {
        scope.base.prototype.Release.call(scope);
    };

    this.PreviousStep = function () {
        switch (uiBase.GetStep()) {
            case 0:
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

                    uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE;

                    view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);
                    //view.Measure.UpdateReviewText(uiBase.currentReviewItem, textData);

                    uiBase.currentReviewItem.text.position = new VIZCore.Vector3().copy(pickData.position);
                    uiBase.currentReviewItem.drawitem.position[0] = new VIZCore.Vector3().copy(pickData.position);

                    //등록
                    view.Data.Reviews.push(uiBase.currentReviewItem);

                    view.Renderer.Render();
                    uiBase.NextStep();
                }
                break;
            case 1:
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

        if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.ROTATE) === false) {
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
            case 1:
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
                    {
                        //let body = view.Renderer.Picking(uiBase.mouse.x, uiBase.mouse.y);
                        //if (body !== undefined)
                        {
                            //let pickInfo = view.Data.GetPickByBody(body.bodyId, uiBase.mouse.x, uiBase.mouse.y);
                            let pickPos = view.Renderer.PickPositionObject(uiBase.mouse.x, uiBase.mouse.y);
                            //console.log("Step0 : " + pickPos);
                            if (pickPos !== undefined) {
                                //표면노트 모델 선택시 모델 이름 추가
                                if (uiBase.currentReviewItem.text.value.length === 0) {
                                    let body = view.Renderer.Picking(uiBase.mouse.x, uiBase.mouse.y);
                                    if(view.useTree)
                                    {
                                        let node = view.Tree.GetNodeInfo(body.bodyId);
                                        // Part 조회 조건
                                        if(view.Configuration.Model.Selection.Unit === VIZCore.Enum.SELECT_UNIT.Part)
                                        {
                                            node = view.Tree.GetParentNodeInfo(node);
                                            //console.log("Node ::", ni);
                                        }
                                        if(node !== undefined)
                                        {
                                            if (node !== undefined && node.name !== null && node.name.localeCompare("") !== 0) {
                                                uiBase.currentReviewItem.text.value[0] = node.name;
                                            }
                                            else{
                                                uiBase.currentReviewItem.text.value[0] = "Body " + body.bodyId; //이름이 없는경우 공백추가
                                            }
                                        }
                                    }
                                    else{
                                        let node = view.Data.GetNode(body.bodyId);
                                        if (node !== undefined && node.data.name !== null && node.name.localeCompare("") !== 0) {
                                            uiBase.currentReviewItem.text.value[0] = node.data.name;
                                        }
                                        else {
                                            uiBase.currentReviewItem.text.value[0] = "Body " + body.bodyId; //이름이 없는경우 공백추가
                                        }
                                    }
                                }

                                if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.SURFACE)) {
                                    view.Data.GetPickByBodyCacheDownload(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);
                                }

                                scope.mouseAction = false;
                            }
                        }
                    }
                    break;
                case 1:
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
    
    
    this.GetProcessFlag = function (flag) {

        switch(uiBase.GetStep())
        {
            case 0:
            {
                //if(flag === VIZCore.Enum.MARKUP_FLAG.PRESELECT)
                //    return true;

                if(flag === VIZCore.Enum.MARKUP_FLAG.ROTATE)
                    return true;

                if(flag === VIZCore.Enum.MARKUP_FLAG.ZOOM)
                    return true;

                //if(flag === VIZCore.Enum.MARKUP_FLAG.POINT)
                //    return true;

                //if(flag === VIZCore.Enum.MARKUP_FLAG.CIRCLE_CENTER)
                //    return true;

                //if(flag === VIZCore.Enum.MARKUP_FLAG.LINE)
                //    return true;

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

export default UIMarkup_SurfaceNote;