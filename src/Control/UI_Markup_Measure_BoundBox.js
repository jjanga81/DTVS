/**
 * @author ssjo@softhills.net
 */

let UIMarkup_Measure_BoundBox = function (uiBase, view, VIZCore) {
    let scope = this;

    this.base = VIZCore.UIMarkup_Base;
    this.base(uiBase, view);


    //let step1_SelectBodyID = -1;
    //let step1_Triangles = undefined; //Data.TrigangleItem
    let step1_PickData = undefined;
    let step1_BBox = undefined; // new VIZCore.BBox();

    //바운드박스 (면) 데이터
    let step1_bodiesID = undefined;

    this.Start = function () {
        // if ($(".ui_message").length > 0) {
        //     let textMeasure = "Measure the boundbox distance.";
        //     //let message = textMeasure + "<br><p2>*</p2><p1>Press the</p1> <p2>ESC</p2> <p1>key to end the measurement.</p1>";
        //     let message = textMeasure;
        //     $(".ui_message_text").html(message);
        //     $(".ui_message").fadeIn(500);
        // }
        let textMeasure = "MG0003";
        view.UIManager.ShowMessage(textMeasure);

        scope.base.prototype.Start.call(scope);        
    };

    this.Release = function () {
        step1_PickData = undefined;
        step1_BBox = undefined;

        step1_bodiesID = undefined;

        scope.base.prototype.Release.call(scope);
    };

    
    this.SetSubType = function (subType) {
        // 0 = 바운드 박스
        // 1 = 바운드 박스(면)
        scope.MarkupSubType = subType;

        if(scope.MarkupSubType === 0)
        {
            //선택된 개체가 있는경우 해당 개체의 바운드 박스로 계산
            let bodiesID = view.Data.GetSelection();
            if(bodiesID.length > 0) {
                let bodies = view.Data.GetBodies(bodiesID);
                //BBox
                step1_BBox = view.Data.GetBBoxFormMatrix(bodies);

                uiBase.currentReviewItem.drawitem.custom = step1_BBox;
                uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_BOUNDBOX;

                view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);

                //등록
                view.Data.Reviews.push(uiBase.currentReviewItem);
                
                //완료
                uiBase.currentReviewItem = undefined;
                view.Control.RestoreMode(); //뒤로

                view.Renderer.Render();
                //uiBase.NextStep();
            }
        }
        else {
            step1_bodiesID = view.Data.GetSelection();
        }
    };



    this.PreviousStep = function () {
        if(scope.MarkupSubType === 1)
        {
        switch (uiBase.GetStep()) {
            case 1:
                {
                    view.Data.DeleteReview(uiBase.currentReviewItem.id);
                    view.Renderer.Render();
                    scope.mouseAction = true;
                }
                break;
        }
        }
    };

    this.ProcessStep = function (pickData) {

        if(scope.MarkupSubType === 0)
        {
            //축 기반 바운드 박스 측정
            switch (uiBase.GetStep()) {
                case 0:
                    {
                        if (pickData === undefined) return;
                        if (!pickData.pick) return;
                        if (pickData.body === undefined) return;
        
                        //BBox
                        step1_PickData = pickData;
                        step1_BBox = view.Data.GetBBoxFormMatrix([pickData.body]);
    
                        uiBase.currentReviewItem.drawitem.custom = step1_BBox;
    
                        //step1_Triangles = view.Data.GetTriangles([pickData.body]);
                        //step1_SelectBodyID = pickData.body.bodyId;
    
                        //let textData = [];
                        //textData[0] = vCrossPos;
                        uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_BOUNDBOX;
    
                        view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);
                        //view.Measure.UpdateReviewText(uiBase.currentReviewItem, textData);
    
                        //uiBase.currentReviewItem.text.position = new VIZCore.Vector3().copy(pickData.position);
    
                        //등록
                        view.Data.Reviews.push(uiBase.currentReviewItem);
    
                        //완료
                        uiBase.currentReviewItem = undefined;
                        view.Control.RestoreMode(); //뒤로
    
                        view.Renderer.Render();
                        //uiBase.NextStep();
                    }
                    break;
            }
        }
        else if(scope.MarkupSubType === 1)
        {
             // 바운드 박스(면) 측정
            switch (uiBase.GetStep()) {
                case 0:
                    {
                        if (pickData === undefined) return;
                        if (!pickData.pick) return;
                        if (pickData.body === undefined) return;

                        step1_PickData = pickData;

                        view.Renderer.Render();
                                               
                        if(!step1_bodiesID || step1_bodiesID.length === 0)
                        {
                            uiBase.NextStep();
                            break;
                        }
                        //선택상태에서 진입시 계속 진행
                    }
                case 1:
                    {
                        if (pickData === undefined) return;
                        if (!pickData.pick) return;
                        if (pickData.body === undefined) return;
        
                        //BBox
                        let bboxParam = undefined;
                        if(step1_bodiesID && step1_bodiesID.length > 0)
                            bboxParam = view.Data.GetMeasureBoundBoxParamByNode(step1_bodiesID, new VIZCore.Vector3().copy(pickData.normal));
                        else
                            bboxParam = view.Data.GetMeasureBoundBoxParamByNode([pickData.body.bodyId], new VIZCore.Vector3().copy(pickData.normal));

                        if(!bboxParam.result) break;

                        //step1_BBox = view.Data.GetBBoxFormMatrix([pickData.body]);
                        //uiBase.currentReviewItem.drawitem.custom = step1_BBox;
    
                        //let textData = [];
                        //textData[0] = vCrossPos;
                        uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_BOUNDBOX;

                        //바운드 박스(면)의 경우 VIZCore3D.NET에서 구현된 Base위치에서 방향으로 그리기 정보를 넣기
                        uiBase.currentReviewItem.drawitem.position[0] = bboxParam.vXAxis;
                        uiBase.currentReviewItem.drawitem.position[1] = bboxParam.vYAxis;
                        uiBase.currentReviewItem.drawitem.position[2] = bboxParam.vZAxis;

                        uiBase.currentReviewItem.drawitem.position[3] = bboxParam.vBase;
                        uiBase.currentReviewItem.drawitem.position[4] = bboxParam.vOffset;
    
                        view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);
                        //view.Measure.UpdateReviewText(uiBase.currentReviewItem, textData);
    
                        //등록
                        view.Data.Reviews.push(uiBase.currentReviewItem);
    
                        //완료
                        uiBase.currentReviewItem = undefined;
                        view.Control.RestoreMode(); //뒤로
    
                        view.Renderer.Render();
                        //uiBase.NextStep();
                    }
                    break;
            }
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
        // switch (uiBase.GetStep()) {
        //     case 1:
        //         {
        //             let mvpMatrix = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, view.Camera.cameraMatrix);

        //             let screen = view.Camera.world2ScreenWithMatrix(mvpMatrix, new VIZCore.Vector3().copy(uiBase.currentReviewItem.text.position));
        //             let world = view.Camera.screen2WorldWithMatrix(mvpMatrix, new VIZCore.Vector3(x, y, screen.z));

        //             uiBase.currentReviewItem.text.position.copy(world);
        //             view.Renderer.Render();
        //         }
        //         break;
        // }
    };

    this.mouseUp = function (x, y, button) {
        uiBase.actionEnabled = false;
        uiBase.base.prototype.mouseUp.call(uiBase, x, y, button);
        uiBase.actionEnabled = true;

        if(scope.MarkupSubType === 0)
        {
            if (button === 0 && uiBase.GetMouseClick(uiBase.mouse.x, uiBase.mouse.y)) {
                switch (uiBase.GetStep()) {
                    case 0:
                        {
                            let body = view.Renderer.Picking(uiBase.mouse.x, uiBase.mouse.y);
                            if (body !== undefined) {
                                view.Data.GetPickByBodyCacheDownload(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);
    
                                scope.mouseAction = false;
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
        }
        else if(scope.MarkupSubType === 1)
        {
            if(uiBase.GetMouseClick(uiBase.mouse.x, uiBase.mouse.y) && button === 0)
            {
                switch (uiBase.GetStep()) {
                    case 0:
                    case 1:
                        {
                            let body = view.Renderer.Picking(uiBase.mouse.x, uiBase.mouse.y);
                            if (body !== undefined) {
                                view.Data.GetPickByBodyCacheDownload(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);
    
                                scope.mouseAction = false;
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
            {
                view.MeshBlock.Reset();
            }
            
        }      

        return scope.mouseAction;
    };

    this.mouseWheel = function (x, y, delta) {
        if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.ZOOM))
            uiBase.base.prototype.mouseWheel.call(uiBase, x, y, delta);
    };


    this.Render = function () {

    };

    this.Render2D = function (context) {

        if(scope.MarkupSubType === 1)
        {
            const matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.matMV);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            switch (uiBase.GetStep()) {
                case 0:
                    break;
                case 1:
                    {
                        let pointSize = 3;
                        context.fillStyle = "rgba(0, 255, 0, 1)";
                        context.strokeStyle = "rgba(255, 255, 255, 1)";
                        context.lineWidth = 1;
    
                        let clipspace = new VIZCore.Matrix4().transformVector(matMVP.elements,
                            [step1_PickData.position.x, step1_PickData.position.y, step1_PickData.position.z, 1]);
    
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
            }
        }
        
    };

    
    this.GetProcessFlag = function (flag) {

        if(scope.MarkupSubType === 0)
        {
            switch(uiBase.GetStep())
            {
                case 0:
                {
                    if(flag === VIZCore.Enum.MARKUP_FLAG.ROTATE)
                        return true;

                    if(flag === VIZCore.Enum.MARKUP_FLAG.ZOOM)
                        return true;

                    //if(flag === VIZCore.Enum.MARKUP_FLAG.CIRCLE)
                    //    return true;

                    if(flag === VIZCore.Enum.MARKUP_FLAG.SURFACE)
                        return true;
                }
                break;

            }
        }
        else if(scope.MarkupSubType === 1)
        {
            switch(uiBase.GetStep())
            {
                case 0:
                case 1:
                {
                    if(flag === VIZCore.Enum.MARKUP_FLAG.ROTATE)
                        return true;

                    if(flag === VIZCore.Enum.MARKUP_FLAG.ZOOM)
                        return true;

                    if(flag === VIZCore.Enum.MARKUP_FLAG.SURFACE)
                        return true;
                }
                break;
            }
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

export default UIMarkup_Measure_BoundBox;