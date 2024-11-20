/**
 * @author ssjo@softhills.net
 */

let UIObjectTransform = function (view, VIZCore) {
    let scope = this;

    //base 호출사용
    this.base = VIZCore.UIBase;
    this.base(view, VIZCore);

    let currentHandler = undefined;  //축이동 핸들러

    // 선택개체 이동 포함 여부 설정
    let IsModelTransform = true;  //모델 개체 이동 가능 설정
    let IsCustomModelTransform = true; //Custom 개체 이동 가능 설정

    let currentUpdateObjects = []; //이동 갱신 개체
    let currentUpdateObjectsID = []; //이동 갱신 개체 ID
    let lastUpdatePos = new VIZCore.Vector3(); // 마지막 업데이트 위치

    init();
    function init() {

    }


    this.UIBegin = function () {
        scope.base.prototype.UIBegin.call(scope);
        //Text
        // if ($(".ui_message").length > 0) {
        //     let textMeasure = "Select Object Transform.";
        //     let message = textMeasure;
        //     $(".ui_message_text").html(message);
        //     $(".ui_message").fadeIn(500);
        // }

        //Text
        let textMeasure = "MG0012";
        view.UIManager.ShowMessage(textMeasure);

        //Handle 추가
        {
            let modelBBox = view.Data.GetBBox();
            let vHandleCenter = modelBBox.center;
            //listHandlePostion = []; 

            currentHandler = view.Handle.Add(VIZCore.Enum.HANDLER_TYPE.MODEL);
            currentHandler.center = vHandleCenter;
            currentHandler.object = undefined; //=== undefined 인 경우 render 방지..

            //축 이동
            currentHandler.axis.x.enable = true;
            currentHandler.axis.y.enable = true;
            currentHandler.axis.z.enable = true;

            //평면 이동
            currentHandler.panel.xy.enable = true;
            currentHandler.panel.yz.enable = true;
            currentHandler.panel.zx.enable = true;

            //회전
            currentHandler.rotate.x.enable = true;
            currentHandler.rotate.y.enable = true;
            currentHandler.rotate.z.enable = true;

            currentHandler.sphere.enable = false; //선택 방지

            currentHandler.axis.x.visible = true;
            currentHandler.axis.y.visible = true;
            currentHandler.axis.z.visible = true;

            currentHandler.panel.xy.visible = true;
            currentHandler.panel.yz.visible = true;
            currentHandler.panel.zx.visible = true;

            currentHandler.rotate.x.visible = true;
            currentHandler.rotate.y.visible = true;
            currentHandler.rotate.z.visible = true;

            currentHandler.sphere.visible = true;
        }

        //선택되어있는경우 해제
        //view.Data.DeselectAll();

        //자동 연결
        scope.SetSelectObjectHandler();

    };

    this.UIEnd = function () {
        // if ($(".ui_message").length > 0) {
        //     $(".ui_message_text").html("");
        //     $(".ui_message").hide();
        // }
        view.UIManager.HideMessage();
        


        if (currentHandler !== undefined) {
            view.Handle.ClearStateById(currentHandler.id);
            view.Handle.Delete(currentHandler.id);
            //currentHandler.enable = false;  //끄기
            currentHandler = undefined;
        }

        scope.base.prototype.UIEnd.call(scope);

        currentUpdateObjects = []; //초기화
        currentUpdateObjectsID = [];
    };

    //선택 개체 핸들러 설정
    this.SetSelectObjectHandler = function() {
        
        if (currentHandler === undefined) return;

        currentUpdateObjects = []; //초기화
        currentUpdateObjectsID = [];
        currentHandler.object = undefined;

        let firstBBox = true;
        let boundBox = new VIZCore.BBox();
        //선택된 Body
        if (IsModelTransform) {

            if (view.useTree) {
                let selectBodies = view.Data.GetSelection(); //ID

                for (let i = 0; i < selectBodies.length; i++) {
                    currentUpdateObjectsID.push(selectBodies[i]);
                }

                boundBox = view.Tree.GetBBoxArrayID(selectBodies);

                if (currentUpdateObjectsID.length > 0 && boundBox.radius !== 0)
                    firstBBox = false;
            }
            else {
                let selectBodies = view.Data.GetSelection();
                let bodies = view.Data.GetBodies(selectBodies);

                if (bodies.length > 0) {
                    //let bbox = view.Data.GetBBox(bodies);
                    let bbox = view.Data.GetBBoxFormMatrix(bodies);

                    if (firstBBox) {
                        boundBox.min.copy(bbox.min);
                        boundBox.max.copy(bbox.max);
                        firstBBox = false;
                    }
                    else {
                        boundBox.min.min(bbox.min);
                        boundBox.min.min(bbox.max);

                        boundBox.max.min(bbox.min);
                        boundBox.max.max(bbox.max);
                    }

                }

                for (let i = 0; i < bodies.length; i++) {
                    currentUpdateObjects.push(bodies[i]);
                }
            }
        }

        //선택된 Custom 개체
        if (IsCustomModelTransform) {
            let selectObjects = view.CustomObject.GetSelection();
            if (selectObjects.length > 0) {
                for (let i = 0; i < selectObjects.length; i++) {
                    let bodies = view.CustomObject.GetBodyFormObject(selectObjects[i]);
                    let bbox = view.Data.GetBBoxFormMatrix(bodies);

                    if (firstBBox) {
                        boundBox.min.copy(bbox.min);
                        boundBox.max.copy(bbox.max);
                        firstBBox = false;
                    }
                    else {
                        boundBox.min.min(bbox.min);
                        boundBox.min.min(bbox.max);

                        boundBox.max.min(bbox.min);
                        boundBox.max.max(bbox.max);
                    }


                    for (let i = 0; i < bodies.length; i++) {
                        currentUpdateObjects.push(bodies[i]);
                    }
                }
            }
        }

        if (currentHandler !== undefined) {
            if (!firstBBox) {
                currentHandler.object = null;
                boundBox.update();
                currentHandler.center = boundBox.center;
            }
            else {
                currentHandler.object = undefined;
            }

        }
    }

    this.mouseDown = function (x, y, button) {

        //핸들러 확인
        if (currentHandler !== undefined) {
            if (currentHandler.enable && currentHandler.state === VIZCore.Enum.HANDLE_MOUSE_STATE.OVER) {
                currentHandler.state = VIZCore.Enum.HANDLE_MOUSE_STATE.DOWN;
                scope.actionEnabled = false;

                lastUpdatePos.set(0, 0, 0);
                view.Handle.ReleaseInterval();

                //timerUpdateMeasure = setInterval(function () {
                //    updateSmartAxisDistance();
                //}, 250);
            }
        }

        if (view.IsUseProgressive())
            view.Renderer.enableRenderLimit = true;

        let bResult = scope.base.prototype.mouseDown.call(scope, x, y, button);

        return bResult;
    };

    this.mouseMove = function (x, y) {
        let handler = view.Handle.Handler();
        if (handler.length > 0) {

            //const matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
            //const matMVP = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, matMVMatrix);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

            if (currentHandler !== undefined && currentHandler.state === VIZCore.Enum.HANDLE_MOUSE_STATE.DOWN) {
                //Handle Control
                scope.actionEnabled = false;
                if ((x !== scope.mouseLastPosition.x || y !== scope.mouseLastPosition.y)) {
                    let item = currentHandler;

                    switch (item.itemType) {
                        case VIZCore.Enum.HANDLER_TYPE.MODEL:
                            {
                                //let updateTransform = view.Handle.UpdateTransformByMouseMove(currentHandler, x, y, scope.mouseLastPosition.x, scope.mouseLastPosition.y);
                                let updateResult = view.Handle.UpdateTransformByMouseMove(currentHandler, x, y, scope.mouseLastPosition.x, scope.mouseLastPosition.y, scope.KeyPress.shiftKey);

                                if (updateResult !== undefined) {
                                    for (let i = 0; i < currentUpdateObjects.length; i++) {
                                        let body = currentUpdateObjects[i];
                                        let action = view.Data.ShapeAction.GetAction(body.object.id_file, body.origin_id);

                                        action.transform = new VIZCore.Matrix4().multiplyMatrices(
                                            updateResult.matrix, action.transform);

                                        if (action.transInfo === undefined)
                                            action.transInfo = view.Data.TransInfoItem();

                                        action.transInfo.translate.add(updateResult.move);
                                        action.transInfo.rotate.add(updateResult.rotate);

                                        body.object.flag.updateProcess = true;
                                    }

                                    if (view.useTree) {

                                        let updateResultTransformInfoItems = [];

                                        for (let i = 0; i < currentUpdateObjectsID.length; i++) {

                                            let file_id = view.Data.ModelFileManager.GetFileKeyByNodeID(currentUpdateObjectsID[i]);

                                            let origin_id = view.Data.GetOriginNodeID(file_id, currentUpdateObjectsID[i]);

                                            let action = view.Data.ShapeAction.GetAction(file_id, origin_id);

                                            if (action === undefined) continue;

                                            let updateTrans = new VIZCore.Matrix4().multiplyMatrices(
                                                updateResult.matrix, action.transform);

                                            if (action.transInfo === undefined)
                                                action.transInfo = view.Data.TransInfoItem();

                                            action.transInfo.translate.add(updateResult.move);
                                            action.transInfo.rotate.add(updateResult.rotate);

                                            let resultItem = view.Handle.ResultTransformInfoItem(updateTrans, action.transInfo.translate, action.transInfo.rotate);
                                            updateResultTransformInfoItems.push(resultItem);
                                        }

                                        view.Tree.SetMultiObjectFormTransformInfoItem(currentUpdateObjectsID, updateResultTransformInfoItems);
                                    }

                                    view.ViewRefresh();
                                }
                            }
                            break;
                    } //switch
                } //item.state === VIZCore.Enum.HANDLE_MOUSE_STATE.DOWN
            }
            else {
                //view.Handle.ClearState();
                //view.Clipping.PickPlane(x, y); //단면 Handle 가시화 확인
                if (!scope.mouseLeftDown) {
                    if (currentHandler !== undefined && currentHandler.state === VIZCore.Enum.HANDLE_MOUSE_STATE.OVER)
                        view.Renderer.Render();

                    view.Handle.ClearState();
                    view.Clipping.PickPlane(x, y); //단면 Handle 가시화 확인
                    let overHandler = view.Handle.Pick(x, y);
                    if (overHandler !== undefined && currentHandler.id === overHandler.id) {
                        currentHandler.state = VIZCore.Enum.HANDLE_MOUSE_STATE.OVER;
                        view.Renderer.Render();
                    }
                }
            }
        }

        scope.base.prototype.mouseMove.call(scope, x, y);
        scope.actionEnabled = true;
    };

    this.mouseUp = function (x, y, button) {

        if (currentHandler !== undefined) {
            if (currentHandler.state === VIZCore.Enum.HANDLE_MOUSE_STATE.DOWN) {
                scope.actionEnabled = false;
                view.Handle.ClearStateById(currentHandler.id);
                view.Renderer.Render();
            }
            else {
                if (view.IsUseProgressive())
                    view.Renderer.enableRenderLimit = false;
            }
        }

        //마우스 오른쪽 버튼
        if (scope.actionEnabled && button === VIZCore.Enum.MOUSE_STATE.PAN) {
            if (scope.base.prototype.GetMouseClick.call(scope, x, y) === true) {
                let tmp = new VIZCore.Vector2().subVectors(scope.mouseDownPosition, scope.mouse);
                if (tmp.length() < 5) {
                    scope.actionEnabled = false;

                    view.Control.RestoreMode(); //뒤로
                    view.Renderer.Render();
                }
            }
        }

        let bResult = scope.base.prototype.mouseUp.call(scope, x, y, button);

        //선택 처리 확인
        if (scope.actionEnabled) {
            scope.SetSelectObjectHandler();
        }

        scope.actionEnabled = true;


        return bResult;
    };

    this.touchStart = function (touches) {
        //핸들러 확인
        if (touches.length > 0) {

            if(touches.length === 1) {
                let pos = this.view.Control.GetCalcTouchPos(touches[0]);                
                let x = pos.x;
                let y = pos.y;
                let handler = view.Handle.Handler();
                if (handler.length > 0) {  
                    ///Touch의 경우 start에서 검토                                         
                    if (!scope.mouseLeftDown) {
                        if (currentHandler !== undefined && currentHandler.state === VIZCore.Enum.HANDLE_MOUSE_STATE.OVER)
                            view.Renderer.Render();            
                            view.Handle.ClearState();
                            view.Clipping.PickPlane(x, y); //단면 Handle 가시화 확인
                            let pickHandle=view.Handle.Pick(x, y);
                            if(pickHandle!==undefined)
                                currentHandler=pickHandle;
                            else{        
                                scope.base.prototype.touchStart.call(scope, touches);
                                scope.base.prototype.touchEnd.call(scope, touches);
                                scope.SetSelectObjectHandler();
                                view.Renderer.Render();                               
                                
                            }
                            if (currentHandler !== undefined) {
                                currentHandler.state = VIZCore.Enum.HANDLE_MOUSE_STATE.OVER;
                                view.Renderer.Render();
                            }
                        }
                }
            }

            if (view.IsUseProgressive())
                view.Renderer.enableRenderLimit = true;
        }

        scope.base.prototype.touchStart.call(scope, touches);
    };

    this.touchMove = function (touches) {

    let handler = view.Handle.Handler();
        if (handler.length > 0) {

            //const matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
            //const matMVP = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, matMVMatrix);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

            if (currentHandler !== undefined && currentHandler.state === VIZCore.Enum.HANDLE_MOUSE_STATE.OVER ) {
                //Handle Control
                scope.actionEnabled = false;

                let pos = this.view.Control.GetCalcTouchPos(touches[0]);
                
                let x = pos.x;
                let y = pos.y;

                if ((x !== scope.mouseLastPosition.x || y !== scope.mouseLastPosition.y)) {
                    let item = currentHandler;

                    switch (item.itemType) {
                        case VIZCore.Enum.HANDLER_TYPE.MODEL:
                            {
                                //let updateTransform = view.Handle.UpdateTransformByMouseMove(currentHandler, x, y, scope.mouseLastPosition.x, scope.mouseLastPosition.y);
                                let updateResult = view.Handle.UpdateTransformByMouseMove(currentHandler, x, y, scope.mouseLastPosition.x, scope.mouseLastPosition.y, scope.KeyPress.shiftKey);

                                if (updateResult !== undefined) {
                                    for (let i = 0; i < currentUpdateObjects.length; i++) {
                                        let body = currentUpdateObjects[i];
                                        let action = view.Data.ShapeAction.GetAction(body.object.id_file, body.origin_id);

                                        action.transform = new VIZCore.Matrix4().multiplyMatrices(
                                            updateResult.matrix, action.transform);

                                        if (action.transInfo === undefined)
                                            action.transInfo = view.Data.TransInfoItem();

                                        action.transInfo.translate.add(updateResult.move);
                                        action.transInfo.rotate.add(updateResult.rotate);

                                        body.object.flag.updateProcess = true;
                                    }

                                    if (view.useTree) {

                                        let updateResultTransformInfoItems = [];

                                        for (let i = 0; i < currentUpdateObjectsID.length; i++) {

                                            let file_id = view.Data.ModelFileManager.GetFileKeyByNodeID(currentUpdateObjectsID[i]);

                                            let origin_id = view.Data.GetOriginNodeID(file_id, currentUpdateObjectsID[i]);

                                            let action = view.Data.ShapeAction.GetAction(file_id, origin_id);

                                            if (action === undefined) continue;

                                            let updateTrans = new VIZCore.Matrix4().multiplyMatrices(
                                                updateResult.matrix, action.transform);

                                            if (action.transInfo === undefined)
                                                action.transInfo = view.Data.TransInfoItem();

                                            action.transInfo.translate.add(updateResult.move);
                                            action.transInfo.rotate.add(updateResult.rotate);

                                            let resultItem = view.Handle.ResultTransformInfoItem(updateTrans, action.transInfo.translate, action.transInfo.rotate);
                                            updateResultTransformInfoItems.push(resultItem);
                                        }

                                        view.Tree.SetMultiObjectFormTransformInfoItem(currentUpdateObjectsID, updateResultTransformInfoItems);
                                    }

                                    view.ViewRefresh();
                                }
                            }
                            break;
                    } //switch
                } //item.state === VIZCore.Enum.HANDLE_MOUSE_STATE.DOWN
            }
            else {
                //view.Handle.ClearState();
                //view.Clipping.PickPlane(x, y); //단면 Handle 가시화 확인
                if (!scope.mouseLeftDown) {
                    if (currentHandler !== undefined && currentHandler.state === VIZCore.Enum.HANDLE_MOUSE_STATE.OVER)
                        view.Renderer.Render();

                    let pos = this.view.Control.GetCalcTouchPos(touches[0]);
                
                    let x = pos.x;
                    let y = pos.y;

                    view.Handle.ClearState();
                    view.Clipping.PickPlane(x, y); //단면 Handle 가시화 확인
                    let overHandler = view.Handle.Pick(x, y);
                    if (overHandler !== undefined && currentHandler.id === overHandler.id) {
                        currentHandler.state = VIZCore.Enum.HANDLE_MOUSE_STATE.OVER;
                        view.Renderer.Render();
                    }
                }
            }
        }

        scope.base.prototype.touchMove.call(scope, touches);       
        scope.actionEnabled = true; 
    };

    this.touchEnd = function (touches) {
        if (touches.length === 0) {
            if (currentHandler !== undefined ) {
                scope.actionEnabled = false;
                view.Handle.ClearStateById(currentHandler.id);
                view.Renderer.Render();
            }      

            if (view.IsUseProgressive())
                view.Renderer.enableRenderLimit = false;
        }
        if (scope.actionEnabled) {
            scope.SetSelectObjectHandler();
        }
        scope.actionEnabled = true;

        scope._touchLastCount=0;
        scope.base.prototype.touchEnd.call(scope, touches);
    };
    /*
    this.mouseWheel = function (x, y, delta) {
        scope.base.prototype.mouseWheel.call(scope, x, y, delta);
    }
    */

    this.mouseDoubleClick = function (x, y, button) {
        scope.base.prototype.mouseDoubleClick.call(scope, x, y, button);
    };


    this.Render = function () {
        if (currentHandler === undefined) return;

        const matMV = new VIZCore.Matrix4().copy(view.Camera.matMV);
        const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

        view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.BASIC2D);

        view.Shader.SetGLLight();
        view.Shader.SetClipping(undefined); //단면처리 제외
        //view.Shader.SetMatrix(view.Camera.screenProjectionMatrix, new VIZCore.Matrix4());
        //view.Shader.SetMatrix(matMVP, new VIZCore.Matrix4());
        view.Shader.SetMatrix(matMVP, matMV);

        view.Handle.RenderItem(currentHandler);

        view.Shader.EndShader();

    }; 
};

export default UIObjectTransform;
