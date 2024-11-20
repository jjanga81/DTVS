//import $ from 'jquery';
/**
 * @author ssjo@softhills.net
 */

let UIMarkup_Measure_PickItem = function (uiBase, view, VIZCore) {
    let scope = this;

    this.base = VIZCore.UIMarkup_Base;
    this.base(uiBase, view);

    let mPickType = 0;

    let usePickSurface = true;
    let usePickVertexPos = true;
    let usePickEdge = true;
    
    this.PickItemCallback = undefined;

    this.Start = function () {
        // if ($(".ui_message").length > 0) {
        //     let textMeasure = "Measures the points.";
        //     let message = textMeasure;
        //     $(".ui_message_text").html(message);
        //     $(".ui_message").fadeIn(500);
        // }
        let textMeasure = "MG0010";
        view.UIManager.ShowMessage(textMeasure);

        scope.base.prototype.Start.call(scope);
    };

    this.Release = function () {
        scope.base.prototype.Release.call(scope);
    };

    /**
     * 선택 가능 여부 확인
     * @param {Number} pickType : 0 - 모든 개체, 1 - 모델 개체만, 2 - Custom 개체만
     */
    this.SetProcessPickObjectType = function(pickType) {
        mPickType = pickType;
    };

    /**
     * 사용자 Pick 아이템 반환
     * @param {*} bSurface 
     * @param {*} bVertexPos 
     * @param {*} bEdge 
     */
    this.SetProcessPickItemFlag = function(bSurface, bVertexPos, bEdge) {
        usePickSurface = bSurface;
        usePickVertexPos = bVertexPos;
        usePickEdge = bEdge;
    };

    this.PreviousStep = function () {
        
    };

    this.ProcessStep = function (pickData) {

        switch (uiBase.GetStep()) {
            case 0:
                {
                    if (pickData === undefined) return;
                    if (!pickData.pick) return;
                    
                    let result = {
                        surface : false, 

                        position : [],
                        normal : undefined
                    };
                    
                    if(pickData.preselectKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE) {
                        //Edge 선택시 step 1 스킵
                        result.position[0] = new VIZCore.Vector3().copy(pickData.preselect.vData[0]);
                        result.position[1] = new VIZCore.Vector3().copy(pickData.preselect.vData[1]);


                    }
                    else if(pickData.surface) {
                        result.surface = true;

                        result.position[0] = new VIZCore.Vector3().copy(pickData.position);
                        result.normal = new VIZCore.Vector3().copy(pickData.normal);
                    }
                    else {
                        result.position[0] = new VIZCore.Vector3().copy(pickData.position);
                    }
                    
                    uiBase.currentReviewItem = undefined;
                    view.Control.RestoreMode(); //뒤로
                    view.Renderer.Render();

                    if(scope.PickItemCallback) {
                        
                        scope.PickItemCallback(result);
                    }
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
    };

    this.mouseUp = function (x, y, button) {
        uiBase.actionEnabled = false;
        uiBase.base.prototype.mouseUp.call(uiBase, x, y, button);
        uiBase.actionEnabled = true;

        if (button === 0 && uiBase.GetMouseClick(uiBase.mouse.x, uiBase.mouse.y)) {
            switch (uiBase.GetStep()) {
                case 0:
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

                        if(mPickType === 0 || mPickType === 1 ) {
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
                        if(mPickType === 0 || mPickType === 2) {
                            let pickCustom = view.Renderer.PickingByCustomObject(uiBase.mouse.x, uiBase.mouse.y);
                            if (pickCustom !== undefined) {

                                //CustomObject는 Cache가 아니기에 즉시 적용
                                if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT)) {
                                    if(view.Pick.GetMakePreselectID() !== pickCustom[1].bodyId) {

                                        view.Pick.MakeMeasurePreselectInfo([ pickCustom[1] ]);
                                        view.ViewRefresh();
                                        scope.mouseAction = false;
                                        break;
                                    }
                                }
                                
                                if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.SURFACE)) { 

                                    let pickResult = view.CustomObject.GetPickByBody(pickCustom[0].uuid, uiBase.mouse.x, uiBase.mouse.y);
                                    if(pickResult) {
                                        scope.ProcessStep(pickResult);
                                    }
                                    //view.Data.GetPickByBodyCacheDownload(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);
                                }
                                scope.mouseAction = false;
                            }
                        }
                    }
                    break;
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
        if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.ZOOM))
            uiBase.base.prototype.mouseWheel.call(uiBase, x, y, delta);
    };

    this.Render2D = function (context) {

    };

    
    this.GetProcessFlag = function (flag) {

        switch(uiBase.GetStep())
        {
            case 0:
            {
                if(usePickVertexPos || usePickEdge) {
                    if(flag === VIZCore.Enum.MARKUP_FLAG.PRESELECT)
                        return true;
                }

                if(flag === VIZCore.Enum.MARKUP_FLAG.ROTATE)
                    return true;

                if(flag === VIZCore.Enum.MARKUP_FLAG.ZOOM)
                    return true;

                if(usePickVertexPos) {
                    if(flag === VIZCore.Enum.MARKUP_FLAG.POINT)
                        return true;

                    if(flag === VIZCore.Enum.MARKUP_FLAG.CIRCLE_CENTER)
                        return true;
                }

                if(usePickEdge) {
                    if(flag === VIZCore.Enum.MARKUP_FLAG.LINE)
                        return true;
                }

                if(usePickSurface) {
                    if(flag === VIZCore.Enum.MARKUP_FLAG.SURFACE)
                        return true;
                }
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

export default UIMarkup_Measure_PickItem;