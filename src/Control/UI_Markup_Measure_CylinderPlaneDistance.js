//import $ from 'jquery';
/**
 * @author ssjo@softhills.net
 */

let UIMarkup_Measure_CylinderPlaneDistance = function (uiBase, view, VIZCore) {
    let scope = this;

    this.base = VIZCore.UIMarkup_Base;
    this.base(uiBase, view);

    let step1_Triangles = undefined; //Data.TrigangleItem
    let step1_CylinderData = undefined;
    let step1_BBox = new VIZCore.BBox();

    this.Start = function () {
        // if ($(".ui_message").length > 0) {
        //     let textMeasure = "Measures the distance between cylinder and plane.";
        //     //let message = textMeasure + "<br><p2>*</p2><p1>Press the</p1> <p2>ESC</p2> <p1>key to end the measurement.</p1>";
        //     let message = textMeasure;
        //     $(".ui_message_text").html(message);
        //     $(".ui_message").fadeIn(500);
        // }
        let textMeasure = "MG0007";
        view.UIManager.ShowMessage(textMeasure);

        scope.base.prototype.Start.call(scope);
    };

    this.Release = function () {
        step1_Triangles = undefined;        
        step1_CylinderData = undefined;

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
                    if (pickData.body === undefined) return;
                  
                    step1_Triangles = view.Data.GetTriangles([pickData.body]);                    
                    let isCylinderData = view.Data.GetCylinderParamByTriangles(pickData.triangle, step1_Triangles, pickData.position);
                    if(!isCylinderData.result) return;

                    step1_CylinderData = isCylinderData.item;
                    step1_BBox = view.Data.GetBBoxFormMatrix([pickData.body]);
                    view.Renderer.Render();
                    uiBase.NextStep();
                }
                break;
            case 1:
                {
                    if (pickData === undefined) return;
                    if (!pickData.pick) return;
                    if (pickData.body === undefined) return;

                    //실패
                    if (Math.abs(pickData.normal.dot(step1_CylinderData.normal)) > 0.001) break;

                    let currentPos1 = step1_CylinderData.center;
                    
                    //거리 구함
                    let fDist = pickData.normal.dot(new VIZCore.Vector3().subVectors(step1_CylinderData.center, pickData.position));
                    let surfacePosition = new VIZCore.Vector3().subVectors(step1_CylinderData.center,
                         new VIZCore.Vector3().copy(pickData.normal).multiplyScalar(fDist));
                    

                    let bSurfaceDistance = true;
                    if( bSurfaceDistance )
                    {
                        // CRMVertex3<float> vNewCenter = pThis->m_vPickPos[0] + pRoot->m_data.m_pick.m_vPickNormal*m_fCylinderRadius;
                        // if( (vNewCenter-fSurfacePos).Length() > (pThis->m_vPickPos[0]-fSurfacePos).Length() )
                        //     vNewCenter = pThis->m_vPickPos[0] - pRoot->m_data.m_pick.m_vPickNormal*m_fCylinderRadius;
    
                        // currentPos1 = vNewCenter;

                        let vNewCenter = new VIZCore.Vector3().addVectors(currentPos1, new VIZCore.Vector3().copy(pickData.normal).multiplyScalar(step1_CylinderData.radius));
                        let len1 = new VIZCore.Vector3().subVectors(vNewCenter, surfacePosition).length();
                        let len2 = new VIZCore.Vector3().subVectors(currentPos1, surfacePosition).length();
                        if(len1 > len2 )
                            vNewCenter = new VIZCore.Vector3().subVectors(currentPos1, new VIZCore.Vector3().copy(pickData.normal).multiplyScalar(step1_CylinderData.radius));

                        currentPos1 = vNewCenter;
                    }
                    uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CYLINDER_PLANE_DISTANCE;

                    //uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE;
                    uiBase.currentReviewItem.drawitem.position[0] = new VIZCore.Vector3().copy(currentPos1);
                    uiBase.currentReviewItem.drawitem.position[1] = new VIZCore.Vector3().copy(surfacePosition);

                    uiBase.currentReviewItem.drawitem.custom = step1_CylinderData;   //Circleitem()

                    uiBase.currentReviewItem.text.position = new VIZCore.Vector3().copy(surfacePosition);

                    let textData = uiBase.currentReviewItem.drawitem.position;

                    view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);
                    view.Measure.UpdateReviewText(uiBase.currentReviewItem, textData);

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
            case 2:
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
                                let body = view.Renderer.Picking(uiBase.mouse.x, uiBase.mouse.y);
                                if (body !== undefined) {
                                    if (uiBase.GetStep() === 1)
                                        view.Pick.MakeMeasurePreselectInfoByID(body.bodyId);

                                    view.Data.GetPickByBodyCacheDownload(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);
                                }
                            }
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
    
    this.Render = function () {

        switch (uiBase.GetStep()) {
            case 1:
            {
                let colorTri = new VIZCore.Color(100, 255, 0, 255);
                let colorLine = new VIZCore.Color(100, 200, 0, 255);

                view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.PHONG);
                //view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.BASIC2D);
                view.Shader.SetGLLight();
                view.Shader.SetClipping(undefined);
                //view.gl.enable(view.gl.BLEND);
                view.gl.enable(view.gl.DEPTH_TEST);

                view.RenderWGL.UpdateRenderProcessByTriangles(step1_Triangles, colorTri);

                view.Shader.EndShader();

                //view.gl.disable(view.gl.BLEND);
                view.gl.disable(view.gl.DEPTH_TEST);

                //BoundBox 그리기
                {
                    view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.BASIC2D);
                    view.Shader.SetMatrix(view.Camera.matMVP, view.Camera.matMV);
                    view.Shader.SetClipping(undefined);

                    let currentColor = colorLine;
                    let currentGLColor = currentColor.glColor();
                    view.Shader.SetGLColor(currentGLColor.r, currentGLColor.g, currentGLColor.b, currentGLColor.a);

                    //BoundBox Line Array 12
                    //let lineIndex = [[0, 4, 5, 1, 0], [2, 6, 7, 3, 2], [0, 2], [4, 6], [1, 3], [5, 7]
                    //];
                    let lineIndex = [[0, 4, 4, 5, 5, 1, 1, 0], [2, 6, 6, 7, 7, 3, 3, 2], [0, 2], [4, 6], [1, 3], [5, 7]
                    ];

                    let vertices = view.Util.GetBBox2Vertex(step1_BBox);

                    let positionBuffer = view.gl.createBuffer();
                    let positionArray = [];
                    view.gl.bindBuffer(view.gl.ARRAY_BUFFER, positionBuffer);
                    view.gl.vertexAttribPointer(view.Shader.positionAttributeLocation, 3, view.gl.FLOAT, false, 0, 0);

                    {
                        let posNum = 0;
                        for (let i = 0; i < lineIndex.length; i++) {
                            for (let j = 0; j < lineIndex[i].length; j++) {
                                positionArray[posNum] = vertices[lineIndex[i][j]].x; posNum++;
                                positionArray[posNum] = vertices[lineIndex[i][j]].y; posNum++;
                                positionArray[posNum] = vertices[lineIndex[i][j]].z; posNum++;
                            }
                        }
                    }

                    //view.gl.bindBuffer(view.gl.ARRAY_BUFFER, positionBuffer);
                    view.gl.bufferData(view.gl.ARRAY_BUFFER, new Float32Array(positionArray), view.gl.STATIC_DRAW);
                    view.gl.drawArrays(view.gl.LINES, 0, positionArray.length);

                    view.gl.deleteBuffer(positionBuffer);
                }

                view.Shader.EndShader();
            }
        }

    };

    this.GetProcessFlag = function (flag) {

        switch(uiBase.GetStep())
        {
            case 0:
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

export default UIMarkup_Measure_CylinderPlaneDistance;