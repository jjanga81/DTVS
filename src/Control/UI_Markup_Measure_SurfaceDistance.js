/**
 * @author ssjo@softhills.net
 */

let UIMarkup_Measure_SurfaceDistance = function (uiBase, view, VIZCore) {

    //노멀 방향에 따른 거리 측정
    // 평행 > 평행 최단거리
    // 그 외 > 면 최단 거리

    let scope = this;

    this.base = VIZCore.UIMarkup_Base;
    this.base(uiBase, view);

    let step1_SelectBodyID = -1;
    let step1_Triangles = undefined; //Data.TrigangleItem
    let step1_BBox = new VIZCore.BBox();
    let step1_normal = new VIZCore.Vector3();

    let step2_Triangles = undefined;

    let surfaceBais = 0.07;

    this.Start = function () {
        // if ($(".ui_message").length > 0) {
        //     let textMeasure = "Measure the coordinates of a particular point.";
        //     let message = textMeasure;
        //     $(".ui_message_text").html(message);
        //     $(".ui_message").fadeIn(500);
        // }
        let textMeasure = "MG0004";
        view.UIManager.ShowMessage(textMeasure);

        scope.base.prototype.Start.call(scope);
    };

    this.Release = function () {
        step1_SelectBodyID = -1;
        step1_Triangles = undefined;
        step2_Triangles = undefined;

        scope.base.prototype.Release.call(scope);
    };

    
    this.SetSubType = function (subType) {
        // 0 = 기존 평행면 거리측정
        // 1 = (유한) 면과 면 거리 측정
        // 2 = (유한) 면과 점 거리 측정
        scope.MarkupSubType = subType;

        if(scope.MarkupSubType === 0)
        {
            surfaceBais = undefined;
        }
        else {
            //정밀도로 검토
            surfaceBais = 0.99;
        }
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
                    if (!pickData.surface) return;

                    uiBase.currentReviewItem.drawitem.position[0] = pickData.position; //선택지점 A                    
                    step1_normal = pickData.normal; //A Normal

                    let triangles = view.Data.GetTriangles([pickData.body], false);

                    if(scope.MarkupSubType === 0)
                        step1_Triangles = view.Data.GetSurfaceTriangles(pickData.triangle, triangles);
                    else if(scope.MarkupSubType === 1)
                        step1_Triangles = view.Data.GetSurfaceTriangles(pickData.triangle, triangles, surfaceBais);
                    else if(scope.MarkupSubType === 2)
                        step1_Triangles = view.Data.GetSurfaceTriangles(pickData.triangle, triangles, surfaceBais);

                    step1_BBox = view.Util.GetTrianglesBBox(step1_Triangles);

                    step1_SelectBodyID = pickData.body.bodyId;

                    view.Renderer.Render();
                    uiBase.NextStep();
                }
                break;
            case 1:
                {
                    if (pickData === undefined) return;
                    if (!pickData.pick) return;
                    if (!pickData.surface) return;

                    //uiBase.currentReviewItem.drawitem.position[1] = pickData.position; //선택지점 B

                    //기존 평행면 거리측정
                    if(scope.MarkupSubType === 0)
                    {
                        let fDot = pickData.normal.dot(step1_normal);
                        if (Math.abs(fDot) > 0.999) {
                            //동일 면 방향
    
                            let currentPlane = new VIZCore.Plane().setFromNormalAndCoplanarPoint(
                                step1_normal, //A Normal
                                uiBase.currentReviewItem.drawitem.position[0]  //선택지점 A
                            );
    
                            let targetLength = currentPlane.distanceToPoint(pickData.position);
                            let targetPos = new VIZCore.Vector3().addVectors(
                                uiBase.currentReviewItem.drawitem.position[0],
                                new VIZCore.Vector3().copy(step1_normal).multiplyScalar(targetLength)
                            );
    
                            uiBase.currentReviewItem.drawitem.position[1] = targetPos;  // 수직 위치
                        }
                        else {
                            //Surface 가장 가까운 거리 찾기
    
                            let triangles = view.Data.GetTriangles([pickData.body], false);
                            step2_Triangles = view.Data.GetSurfaceTriangles(pickData.triangle, triangles);
    
                            let minPtA = new VIZCore.Vector3();
                            let minPtB = new VIZCore.Vector3();
    
                            view.Data.GetMinDistanceByTriangles(step1_Triangles, step2_Triangles, minPtA, minPtB);
    
                            // 가까운 위치로 갱신
                            uiBase.currentReviewItem.drawitem.position[0] = minPtA;
                            uiBase.currentReviewItem.drawitem.position[1] = minPtB;
                        }
                    }
                    //유한 면과 면 거리 측정(정밀도)
                    else if(scope.MarkupSubType === 1)
                    {
                        let triangles = view.Data.GetTriangles([pickData.body], false);
                        step2_Triangles = view.Data.GetSurfaceTriangles(pickData.triangle, triangles, surfaceBais);

                        let minPtA = new VIZCore.Vector3();
                        let minPtB = new VIZCore.Vector3();

                        view.Data.GetMinDistanceByTriangles(step1_Triangles, step2_Triangles, minPtA, minPtB);

                        // 가까운 위치로 갱신
                        uiBase.currentReviewItem.drawitem.position[0] = minPtA;
                        uiBase.currentReviewItem.drawitem.position[1] = minPtB;
                    }
                    else if(scope.MarkupSubType === 2)
                    {
                        let minPtA = new VIZCore.Vector3();
                        view.Data.GetMinDistancePosByTriangles(step1_Triangles, pickData.position, minPtA);

                        // 가까운 위치로 갱신
                        uiBase.currentReviewItem.drawitem.position[0] = minPtA;
                        uiBase.currentReviewItem.drawitem.position[1] = pickData.position;
                    }

                    let textData = [
                        uiBase.currentReviewItem.drawitem.position[0],
                        uiBase.currentReviewItem.drawitem.position[1]
                    ];


                    uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_SURFACEDISTANCE;

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
                {
                    scope.mouseAction = false;
                    uiBase.actionEnabled = false; //회전 방지
                }
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
                            view.Pick.MakeMeasurePreselectInfoByID(body.bodyId);
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
        else {
            view.MeshBlock.Reset();
        }

        return scope.mouseAction;
    };

    this.mouseWheel = function (x, y, delta) {
        if (uiBase.GetStep() !== 2) {
            uiBase.base.prototype.mouseWheel.call(uiBase, x, y, delta);
        }
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
                        let lineIndex = [[0, 4, 4, 5, 5, 1, 1, 0], [2, 6, 6, 7, 7, 3, 3, 2], [0, 2], [4, 6], [1, 3], [5, 7]];

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
        const matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.matMV);
        const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

        switch (uiBase.GetStep()) {
            case 0:
                break;
            case 1:
                {
                    let pointSize = 3;
                    context.fillStyle = "rgba(0, 255, 0, 1)";

                    let screenPos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, uiBase.currentReviewItem.drawitem.position[0]);

                    context.beginPath();
                    context.arc(screenPos.x, screenPos.y, pointSize, 0, Math.PI * 2);
                    context.fill();
                }
                break;
            case 2:
                break;
            default : 
                break;
        }
    };
    
};

export default UIMarkup_Measure_SurfaceDistance;