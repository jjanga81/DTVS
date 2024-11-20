//import $ from 'jquery';
/**
 * @author ssjo@softhills.net
 */

let UI_Markup_Measure_CircleRadius = function (uiBase, view, VIZCore) {
    let scope = this;

    this.base = VIZCore.UIMarkup_Base;
    this.base(uiBase, view);

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
        scope.base.prototype.Release.call(scope);
    };

    
    
    this.SetSubType = function (subType) {
        // 0 = 반경 측정
        // 1 = 직경 측정
        scope.MarkupSubType = subType;
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
            case 1:
                {
                    if (pickData === undefined) return;
                    if (!pickData.pick) return;

                    if(pickData.preselectKind === VIZCore.Enum.PRESELECT_PICK_KIND.CIRCLE)
                    {
                        //마무리
                        
                        let textData = [];
                        textData[0] = pickData.preselect.vData[2];
                        textData[1] = pickData.preselect.vData[1];

                        if(scope.MarkupSubType === 0)
                            uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CIRCLE_RADIUS;
                        else if(scope.MarkupSubType === 1)
                            uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CIRCLE_DIAMETER;
                            
                        view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);
                        view.Measure.UpdateReviewText(uiBase.currentReviewItem, textData);
    
                        uiBase.currentReviewItem.text.position = new VIZCore.Vector3().copy(pickData.preselect.vData[0]);
                        uiBase.currentReviewItem.drawitem.position[0] = new VIZCore.Vector3().copy(pickData.preselect.vData[0]);
                        uiBase.currentReviewItem.drawitem.position[1] = new VIZCore.Vector3().copy(pickData.preselect.vData[1]);
                        uiBase.currentReviewItem.drawitem.position[2] = new VIZCore.Vector3().copy(pickData.preselect.vData[2]);
                        uiBase.currentReviewItem.drawitem.position[3] = new VIZCore.Vector3().copy(pickData.preselect.vData[3]);
                        uiBase.currentReviewItem.drawitem.position[4] = new VIZCore.Vector3().copy(pickData.preselect.vData[4]);
                        uiBase.currentReviewItem.drawitem.position[5] = new VIZCore.Vector3().copy(pickData.preselect.vData[5]);
                        
                        //등록
                        view.Data.Reviews.push(uiBase.currentReviewItem);
                        
                        view.Renderer.Render();
                        uiBase.NextStep();
                        uiBase.NextStep();
                        uiBase.NextStep();
                    }
                    else if(pickData.surface)
                    {
                        //면 선택시
                    }
                    else 
                    {
                        //EDGE_START: 1,
                        //EDGE_END: 2,
                        //EDGE_MID: 3,
                        //CIRCLE_CENTER: 5
                        const itemStep = uiBase.GetStep();

                        uiBase.currentReviewItem.drawitem.position[itemStep] = new VIZCore.Vector3().copy(pickData.position);
                        
                        view.Renderer.Render();
                        uiBase.NextStep();
                    }
                }
                break;
            case 2:
                {
                    if (pickData === undefined) return;
                    if (!pickData.pick) return;

                    const itemStep = uiBase.GetStep();
                    uiBase.currentReviewItem.drawitem.position[itemStep] = new VIZCore.Vector3().copy(pickData.position);

                    //3점 데이터 저장됨
                    let v1 = new VIZCore.Vector3().copy(uiBase.currentReviewItem.drawitem.position[0]);
                    let v2 = new VIZCore.Vector3().copy(uiBase.currentReviewItem.drawitem.position[1]);
                    let v3 = new VIZCore.Vector3().copy(uiBase.currentReviewItem.drawitem.position[2]);

                    //circle 구성
                    
                    // 세점으로 원만든다
                    let vCenter = view.Util.GetCircleCenterPTFrom3Pt( v1, v2, v3 );

                    //let fRadius = new VIZCore.Vector3().subVectors(vCenter, uiBase.currentReviewItem.drawitem.position[0] ).length();
                    let vDir = new VIZCore.Vector3().subVectors(uiBase.currentReviewItem.drawitem.position[1], uiBase.currentReviewItem.drawitem.position[0]);
                    vDir =  new VIZCore.Vector3().crossVectors(vDir,  
                        new VIZCore.Vector3().subVectors(uiBase.currentReviewItem.drawitem.position[2], uiBase.currentReviewItem.drawitem.position[0] ));
                    vDir.normalize();
 
                    // x, y축 만든다
                    let vXAxis = new VIZCore.Vector3( 0.0, 0.0, 1.0 );
                    let vYAxis;
                    if( vXAxis.dot(vDir) > 0.9 )
                        vXAxis.set(1.0, 0.0, 0.0 );
                    vXAxis = new VIZCore.Vector3().crossVectors( vXAxis, vDir );
                    vXAxis.normalize();
                    vYAxis = new VIZCore.Vector3().copy(vXAxis);
                    vYAxis = new VIZCore.Vector3().crossVectors( vYAxis, vDir );
                    vYAxis.normalize();

                    //Circle 데이터 적용

                    //리뷰 아이템 구성
                    let textData = [];
                    textData[0] = vCenter;
                    textData[1] = uiBase.currentReviewItem.drawitem.position[0];
                    
                    if(scope.MarkupSubType === 0)
                        uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CIRCLE_RADIUS;
                    else if(scope.MarkupSubType === 1)
                        uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CIRCLE_DIAMETER;
                    
                    view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);
                    view.Measure.UpdateReviewText(uiBase.currentReviewItem, textData);

                    uiBase.currentReviewItem.text.position = new VIZCore.Vector3().copy(vCenter);
                    uiBase.currentReviewItem.drawitem.position[0] = new VIZCore.Vector3().copy(v1);    //left
                    uiBase.currentReviewItem.drawitem.position[1] = new VIZCore.Vector3().copy(v2);    //right
                    uiBase.currentReviewItem.drawitem.position[2] = new VIZCore.Vector3().copy(vCenter);    //Center
                    uiBase.currentReviewItem.drawitem.position[3] = new VIZCore.Vector3().copy(vDir);    //normal ㅋ
                    uiBase.currentReviewItem.drawitem.position[4] = new VIZCore.Vector3().copy(vXAxis);    //normal X
                    uiBase.currentReviewItem.drawitem.position[5] = new VIZCore.Vector3().copy(vYAxis);    //normal Y
                    
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
                    //if (view.useFramebuffer)
                    //    view.MeshBlock.Reset();
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
                    const mvpMatrix = new VIZCore.Matrix4().copy(view.Camera.matMVP);
                    const screen = view.Camera.world2ScreenWithMatrix(mvpMatrix, new VIZCore.Vector3().copy(uiBase.currentReviewItem.text.position));
                    const world = view.Camera.screen2WorldWithMatrix(mvpMatrix, new VIZCore.Vector3(x, y, screen.z));

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
                        //let body = view.Renderer.Picking(uiBase.mouse.x, uiBase.mouse.y);
                        //if (body !== undefined)
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

                        //if (view.useFramebuffer)
                        //    view.MeshBlock.Reset();
                    }
                    break;
                case 3:
                    {
                        scope.ProcessStep();

                        //uiBase.currentReviewItem = undefined;
                        //
                        ////view.Control.SetMode(VIZCore.Enum.CONTROL_STATE.MARKUP, REVIEW_TYPES.RK_MEASURE_POS); //다시 시작
                        //view.Control.SetMode(VIZCore.Enum.CONTROL_STATE.NORMAL); //종료
                        //
                        //view.Renderer.Render();
                    }
                    break;

            }
        }
        else
            view.MeshBlock.Reset();

        return scope.mouseAction;
    };

    this.mouseWheel = function (x, y, delta) {
        //if (uiBase.GetStep() !== 1)
        if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.ZOOM))
            uiBase.base.prototype.mouseWheel.call(uiBase, x, y, delta);
    };

    
    this.touchStart = function (touches) {

        switch(touches.length)
        {
            case 1: 
            {
                if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.ROTATE) === false)
                {
                    scope.mouseAction = false;
                    uiBase.actionEnabled = false; //회전 방지
                }
            }
            break;
            case 2:
                if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.ROTATE) === false)
                {
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
        if(touches.length === 0) return;

        uiBase.base.prototype.touchMove.call(uiBase, touches);

        uiBase.actionEnabled = false;
        scope.mouseMove(uiBase.mouse.x, uiBase.mouse.y);
        uiBase.actionEnabled = true;
    };

    this.touchEnd = function (touches) { 

        if(uiBase._touchLastCount === 1)
        {
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

                //if(flag === VIZCore.Enum.MARKUP_FLAG.LINE)
                //    return true;

                if(flag === VIZCore.Enum.MARKUP_FLAG.CIRCLE)
                    return true;

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

                //if(flag === VIZCore.Enum.MARKUP_FLAG.LINE)
                //    return true;

                //if(flag === VIZCore.Enum.MARKUP_FLAG.SURFACE)
                //    return true;
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

                //if(flag === VIZCore.Enum.MARKUP_FLAG.LINE)
                //    return true;

                //if(flag === VIZCore.Enum.MARKUP_FLAG.SURFACE)
                //    return true;
            }
            break;
        }
        
        return false;
    };
};

export default UI_Markup_Measure_CircleRadius;