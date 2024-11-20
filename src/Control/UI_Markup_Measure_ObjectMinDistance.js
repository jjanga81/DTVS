//import $ from 'jquery';
/**
 * @author ssjo@softhills.net
 */

let UIMarkup_Measure_ObjectMinDistance = function (uiBase, view, VIZCore) {
    let scope = this;

    this.base = VIZCore.UIMarkup_Base;
    this.base(uiBase, view);


    let step1_SelectBodyID = -1;
    let step1_Triangles = undefined; //Data.TrigangleItem
    let step1_BBox = new VIZCore.BBox();

    let step2_Triangles = undefined;
    let step2_BBox = new VIZCore.BBox();
    //let step2_SelectBodyID = -1;

    this.Start = function () {
        // if ($(".ui_message").length > 0) {
        //     let textMeasure = "Measures the distance between two object.";
        //     //let message = textMeasure + "<br><p2>*</p2><p1>Press the</p1> <p2>ESC</p2> <p1>key to end the measurement.</p1>";
        //     let message = textMeasure;
        //     $(".ui_message_text").html(message);
        //     $(".ui_message").fadeIn(500);
        // }
        let textMeasure = "MG0009";
        view.UIManager.ShowMessage(textMeasure);

        scope.base.prototype.Start.call(scope);
    };

    this.Release = function () {
        step1_SelectBodyID = -1;
        step1_Triangles = undefined;
        step2_Triangles = undefined;

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

                    //BBox
                    step1_BBox = view.Data.GetBBoxFormMatrix([pickData.body]);

                    step1_Triangles = view.Data.GetTriangles([pickData.body]);
                    step1_SelectBodyID = pickData.body.bodyId;

                    view.Renderer.Render();
                    uiBase.NextStep();
                }
                break;
            case 1:
                {
                    if (pickData === undefined) return;
                    if (!pickData.pick) return;
                    if (pickData.body === undefined) return;

                    //let step2_Triangles = view.Data.GetTriangles([pickBody]);

                    step2_BBox = view.Data.GetBBoxFormMatrix([pickData.body]);
                    step2_Triangles = view.Data.GetTriangles([pickData.body]);

                    let minPtA = new VIZCore.Vector3();
                    let minPtB = new VIZCore.Vector3();

                    view.Data.GetMinDistanceByTriangles(step1_Triangles, step2_Triangles, minPtA, minPtB);

                    let textData = [minPtA, minPtB];

                    uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_OBJECTMINDISTANCE;

                    view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);
                    view.Measure.UpdateReviewText(uiBase.currentReviewItem, textData);

                    uiBase.currentReviewItem.text.position = new VIZCore.Vector3().copy(pickData.position);
                    uiBase.currentReviewItem.drawitem.position[0] = minPtA;
                    uiBase.currentReviewItem.drawitem.position[1] = minPtB;

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
                        let body = view.Renderer.Picking(uiBase.mouse.x, uiBase.mouse.y);
                        if (body !== undefined) {
                            if (step1_SelectBodyID === body.bodyId) {
                                scope.mouseAction = false;
                                break;
                            }

                            //step2_SelectBodyID = body.bodyId;
                            if (body !== undefined) {
                                view.Pick.MakeMeasurePreselectInfoByID(body.bodyId);
                            }
                           
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
            case 2:
                {
                    let colorTri = new VIZCore.Color(100, 255, 0, 255);
                    let colorLine = new VIZCore.Color(100, 200, 0, 255);

                    view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.PHONG);
                    //view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.BASIC2D);
                    view.Shader.SetGLLight();
                    view.Shader.SetClipping(undefined);
                    //view.gl.enable(view.gl.BLEND);
                    view.gl.enable(view.gl.DEPTH_TEST);

                    view.RenderWGL.UpdateRenderProcessByTriangles(step2_Triangles, colorTri);

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

                        let vertices = view.Util.GetBBox2Vertex(step2_BBox);

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
                break;
        }

    };

    this.Render2D = function (context) {
        //switch (uiBase.GetStep()) {
        //    case 1:
        //        {
        //            let vertices = view.Util.GetBBox2Vertex(step1_BBox);
        //            let screenVertices = [];
        //            for (let ii = 0; ii < 8; ii++) {
        //                screenVertices[ii] = view.Camera.World2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(vertices[ii]));
        //            }
        //
        //        }
        //        break;
        //}
    };

    
    this.GetProcessFlag = function (flag) {

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

export default UIMarkup_Measure_ObjectMinDistance;