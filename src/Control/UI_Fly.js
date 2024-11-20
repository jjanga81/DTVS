/**
 * @author ssjo@softhills.net
 */

let UIFly = function (view, VIZCore) {
    let scope = this;

    //base 호출사용
    this.base = VIZCore.UIBase;
    this.base(view, VIZCore);


    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let moveUp = false;
    let moveDown = false;

    let aroundUp = false;
    let aroundDown = false;
    let aroundLeft = false;
    let aroundRight = false;
    let mouseDragOn = false;
    let mouseWheelOn = false;

    this.movementSpeed = 20000.0//2000.0; //0.5
    this.aroundSpeed = 0.18; //0.05;
    this.aroundWheelFactor = 10;

    this.timeLastUpdate = undefined;

    this.aroundTimer = undefined;

    this.EventCnt = 0;
    let updateEvent = true;
    let lastUpdateEvent = false;

    let mapKeyCode = new Map();

    let updateCnt = 0;

    init();
    function init() {

    }

    function update(x, y) {
        //if (moveForward || (autoForward && !moveBackward))

        scope.movementSpeed = scope.view.Configuration.Control.Fly.MovementSpeed * 1000;//20000.0;//2000.0; //0.5
        scope.aroundSpeed = scope.view.Util.DegToRad(scope.view.Configuration.Control.Fly.AroundSpeed);//0.18; //0.05;
        //console.log("Fly :: ", [scope.movementSpeed, scope.aroundSpeed]);
        scope.aroundWheelFactor = 10;

        let vTranslate = new VIZCore.Vector3();
        let vTranslateUp = new VIZCore.Vector3();

        let dx = 0;
        let dy = 0;

        if (aroundUp) {
            dy = -1 * scope.aroundSpeed;
            if (scope.mouseWheelOn)
                dy *= scope.aroundWheelFactor;
        }
        if (aroundDown) {
            dy = 1 * scope.aroundSpeed;
            if (scope.mouseWheelOn)
                dy *= scope.aroundWheelFactor;
        }


        let timeCurrent = new Date().getTime();
        let timespan = timeCurrent - scope.timeLastUpdate;
        timespan /= 1000.0;

        scope.timeLastUpdate = timeCurrent;

        let walkthroughtSpeed = scope.movementSpeed; //mm
        walkthroughtSpeed = view.Data.GetUnitValue(walkthroughtSpeed);

        if (mouseDragOn) {

            dx = x - scope.mouseDownPosition.x;
            dy = y - scope.mouseDownPosition.y;

            dx = dx * scope.aroundSpeed * timespan;
            dy = dy * scope.aroundSpeed * timespan;
            
            if (dx < 0)
                aroundLeft = true;
            if (dx > 0)
                aroundRight = true;

            //walkthroughtSpeed *= Math.abs(dy) / view.Data.GetWalkthroughUnitValue(10000);
            //dy = 0;
            //if (0)
            {
                if (dy < 0) {
                    aroundUp = true;
                    aroundDown = false;
                }

                if (dy > 0) {
                    aroundUp = false;
                    aroundDown = true;
                }

                //dy = 0;
                moveForward = true;
                moveBackward = false;
            }
        }

        let xAxis = new VIZCore.Vector3(1, 0, 0);
        let yAxis = new VIZCore.Vector3(0, 1, 0);
        let zAxis = new VIZCore.Vector3(0, 0, 1);


        if (moveForward && !moveBackward) {
            vTranslate.add(new VIZCore.Vector3().copy(zAxis).multiplyScalar(scope.movementSpeed).multiplyScalar(timespan));
        }
        if (!moveForward && moveBackward) {
            vTranslate.sub(new VIZCore.Vector3().copy(zAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
        }

        if (moveLeft && !moveRight) {
            vTranslate.add(new VIZCore.Vector3().copy(xAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
        }
        if (!moveLeft && moveRight) {
            vTranslate.sub(new VIZCore.Vector3().copy(xAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
        }

        if (moveUp && !moveDown) {
            vTranslateUp.sub(new VIZCore.Vector3().copy(yAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
            

        }
        if (!moveUp && moveDown) {
            vTranslateUp.add(new VIZCore.Vector3().copy(yAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
        }

        // {
        //     let zWorldAxis = new VIZCore.Vector3(0, 0, 1);
        //     let zeroWorldAxis = new VIZCore.Vector3(0, 0, 0);
        //     let matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
        //     zWorldAxis = matMVMatrix.multiplyVector(zWorldAxis);
        //     zeroWorldAxis = matMVMatrix.multiplyVector(zeroWorldAxis);

        //     let zWorldAxisDir = zWorldAxis.sub(zeroWorldAxis);
        //     zWorldAxisDir.normalize();

        //     let zDotValue = vTranslate.dot(zWorldAxisDir);
        //     zWorldAxisDir.multiplyScalar(zDotValue);

        //     vTranslate.sub(zWorldAxisDir);
        //     //console.log("after nomalized : " + vTranslate.x + " " + vTranslate.y + " " + vTranslate.z);
        //     // vTranslate.multiplyScalar(dirSpeed);

        //     //if (dirSpeed > 1)
        //     //  dirSpeed = 0;
        // }

        // {
        //     let yWorldAxis = new VIZCore.Vector3(0, 1, 0);
        //     let matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
        //     matMVMatrix.setPosition(new VIZCore.Vector3());
        //     yWorldAxis = matMVMatrix.multiplyVector(yWorldAxis);

        //     let yDotValue = vTranslateUp.dot(yWorldAxis);
        //     yWorldAxis.multiplyScalar(yDotValue);

        //     vTranslateUp.sub(yWorldAxis);

        //     vTranslate.add(vTranslateUp);
        // }

        if (aroundUp && !aroundDown) {
        }

        if (!aroundUp && aroundDown) {
        }

        //updateCnt++;
        //view.MeshBlock.Reset();
        if (!moveForward && !moveBackward && !moveLeft && !moveRight && !moveUp && !moveDown
            && !aroundUp && !aroundDown && !aroundLeft && !aroundRight) {
            //if (updateCnt < 0) {
            //    updateCnt = 0;
            //    view.MeshBlock.Reset();
            //}                
        }
        else {
            //updateCnt++;
            if (moveForward || moveBackward || moveLeft || moveRight || moveUp || moveDown) {
                view.Camera.cameraMatrix.translate(vTranslate.x, vTranslate.y, vTranslate.z);
                view.Camera.cameraMatrix.translate(vTranslateUp.x, vTranslateUp.y, vTranslateUp.z);
                
                //view.Camera.ResizeGLWindow();
                //view.MeshBlock.Crash();
                //view.Renderer.MainFBClear();
                //view.Renderer.Render();
            }

            if (aroundUp || aroundDown || aroundLeft || aroundRight) {
                aroundLeft = false;
                aroundRight = false;
                moveForward = false;
                moveBackward = false;
                aroundUp = false;
                aroundDown = false;

                // rotate by pivot
                
                let rotateByPivotMatrix = new VIZCore.Matrix4();
                let rotateZByPivotMatrix = new VIZCore.Matrix4();


                if(view.Configuration.Control.RotateScreenRate)
                {
                    let viewWidth = view.Renderer.GetSizeWidth();
                    let viewHeight = view.Renderer.GetSizeHeight();
        
                    let xRotateSpeed = 10.0;
                    let yRotateSpeed = 10.0;
        
                    dx = (dx / viewWidth) * xRotateSpeed;
                    dy = (dy / viewHeight) * yRotateSpeed;
                }
                else
                {
                    let fRotate = 100;
        
                    dx = dx / fRotate;
                    dy = dy / fRotate;
                }


                {
                    let matX = new VIZCore.Matrix4().makeRotationX(dy);
                    let matY = new VIZCore.Matrix4().makeRotationY(dx);
                    let matZ = new VIZCore.Matrix4().makeRotationZ(dx);

                    {
                        let matModelMatrix = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
                        let vUpPos = new VIZCore.Vector3(0, 0, 1);
                        let vZeroPos = new VIZCore.Vector3(0, 0, 0);
                        vUpPos.applyMatrix4(matModelMatrix);
                        vZeroPos.applyMatrix4(matModelMatrix);

                        if (vUpPos.y < vZeroPos.y)
                            matZ = new VIZCore.Matrix4().makeRotationZ(-dx / 100.0);
                    }

                    let matMV = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
                    let matMVinv = new VIZCore.Matrix4().getInverse(matMV);

                    let cameraViewPos = matMVinv.multiplyVector(view.Camera.cameraPosition);

                    {
                        let matModelMatrix = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
                        let pivotWithModelCenterOffset = new VIZCore.Vector3().copy(cameraViewPos);
                        pivotWithModelCenterOffset.applyMatrix4(matModelMatrix);

                        let translatePivotToZeroMatrix = new VIZCore.Matrix4();
                        let pivotZero = new VIZCore.Vector3().copy(pivotWithModelCenterOffset).multiplyScalar(-1);
                        translatePivotToZeroMatrix.setPosition(pivotZero);

                        //let rotateMatrix = new Matrix4().multiplyMatrices(matX, matY);
                        let rotateMatrix = new VIZCore.Matrix4().copy(matX);

                        let translateZeroToPivotMatrix = new VIZCore.Matrix4().setPosition(pivotWithModelCenterOffset);

                        let tmpMatrix = new VIZCore.Matrix4().multiplyMatrices(rotateMatrix, translatePivotToZeroMatrix);
                        rotateByPivotMatrix = new VIZCore.Matrix4().multiplyMatrices(translateZeroToPivotMatrix, tmpMatrix);
                    }

                    {
                        let pivotWithModelCenterOffset = new VIZCore.Vector3().copy(cameraViewPos);

                        let translatePivotToZeroMatrix = new VIZCore.Matrix4();
                        let pivotZero = new VIZCore.Vector3().copy(pivotWithModelCenterOffset).multiplyScalar(-1);
                        translatePivotToZeroMatrix.setPosition(pivotZero);

                        //let rotateMatrix = new Matrix4().multiplyMatrices(matX, matY);
                        let rotateMatrix = new VIZCore.Matrix4().copy(matZ);

                        let translateZeroToPivotMatrix = new VIZCore.Matrix4().setPosition(pivotWithModelCenterOffset);

                        let tmpMatrix = new VIZCore.Matrix4().multiplyMatrices(rotateMatrix, translatePivotToZeroMatrix);
                        rotateZByPivotMatrix = new VIZCore.Matrix4().multiplyMatrices(translateZeroToPivotMatrix, tmpMatrix);
                    }

                    let tmp2Matrix = new VIZCore.Matrix4().multiplyMatrices(view.Camera.cameraMatrix, rotateZByPivotMatrix);
                    view.Camera.cameraMatrix = new VIZCore.Matrix4().multiplyMatrices(rotateByPivotMatrix, tmp2Matrix);
                }
                
                
                //let matX = new VIZCore.Matrix4().makeRotationX(dy / 100.0);
                //let matY = new VIZCore.Matrix4().makeRotationY(dx / 100.0);
                //let rotateMatrix = new VIZCore.Matrix4().multiplyMatrices(matX, matY);
                //
                //let matMV = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
                //let matMVinv = new VIZCore.Matrix4().getInverse(matMV);
                //
                //let cameraViewPos = matMVinv.multiplyVector(view.Camera.cameraPosition);
                //view.Camera.pivot = cameraViewPos;
                //view.Camera.CameraRotateByMatrix(rotateMatrix);

                //view.Camera.cameraMatrix = new VIZCore.Matrix4().multiplyMatrices(rotateByPivotMatrix, view.Camera.cameraMatrix);

                //view.Camera.cameraMatrix.translate(vTranslate.x, vTranslate.y, vTranslate.z);
            }

            view.Camera.ResizeGLWindow();
            //view.MeshBlock.Crash();
            if (updateCnt % 50 === 0) {
                view.MeshBlock.Reset();
                updateCnt = 0;
            }

            view.Renderer.MainFBClear(false);
            view.Renderer.Render();
            updateCnt++;
        }

        if (!aroundUp && !aroundDown && !aroundLeft && !aroundRight) {
            //view.MeshBlock.Reset();
        }
        else {
            if (0) {
                let matX = new VIZCore.Matrix4().makeRotationX(dy / 100.0);
                let matY = new VIZCore.Matrix4().makeRotationY(dx / 100.0);
                //let matZ = new VIZCore.Matrix4().makeRotationZ(dx / 100.0);

                {
                    //view.Camera.pivot = 
                    let matMV = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
                    let matMVinv = new VIZCore.Matrix4().getInverse(matMV);

                    let oldPivot = new VIZCore.Vector3().copy(view.Camera.pivot);
                    let cameraViewPos = matMVinv.multiplyVector(view.Camera.cameraPosition);

                    let matModelMatrix = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
                    let pivotWithModelCenterOffset = new VIZCore.Vector3().copy(cameraViewPos);
                    pivotWithModelCenterOffset.applyMatrix4(matModelMatrix);

                    let translatePivotToZeroMatrix = new VIZCore.Matrix4();
                    let pivotZero = new VIZCore.Vector3().copy(pivotWithModelCenterOffset).multiplyScalar(-1);
                    translatePivotToZeroMatrix.setPosition(pivotZero);

                    let rotateMatrix;

                    //if (aroundUp || aroundDown)
                    rotateMatrix = new VIZCore.Matrix4().multiplyMatrices(matX, matY);

                    let translateZeroToPivotMatrix = new VIZCore.Matrix4().setPosition(pivotWithModelCenterOffset);

                    let tmpMatrix = new VIZCore.Matrix4().multiplyMatrices(rotateMatrix, translatePivotToZeroMatrix);
                    let rotateByPivotMatrix = new VIZCore.Matrix4().multiplyMatrices(translateZeroToPivotMatrix, tmpMatrix);
                }
            }


        }
    }

    this.UIBegin = function () {
        scope.base.prototype.UIBegin.call(scope);

        updateEvent = false;
        lastUpdateEvent = false;
        scope.timeLastUpdate = new Date().getTime();
        scope.aroundTimer = setInterval(function () {
            if (mouseDragOn) updateEvent = true;

            if (lastUpdateEvent !== updateEvent) scope.timeLastUpdate = new Date().getTime();

            if (updateEvent)
                update(scope.mouse.x, scope.mouse.y);

            lastUpdateEvent = updateEvent;
            //updateEvent = false;
        }, 10);
    };

    this.UIEnd = function () {

        if (scope.aroundTimer !== null) {
            clearInterval(scope.aroundTimer);
            scope.aroundTimer = null;
        }

        scope.base.prototype.UIEnd.call(scope);
    };

    this.mouseDown = function (x, y, button) {
        scope.actionEnabled = false;
        let result = scope.base.prototype.mouseDown.call(scope, x, y, button);
        scope.actionEnabled = true;

        mouseDragOn = true;

        if (view.IsUseProgressive())
            view.Renderer.enableRenderLimit = true;

        return result;
    };

    this.mouseMove = function (x, y) {

        //if (mouseDragOn) {
        //update(x, y);
        //}


        scope.actionEnabled = false;
        scope.base.prototype.mouseMove.call(scope, x, y);
        scope.actionEnabled = true;
    };

    this.mouseUp = function (x, y, button) {
        //scope.actionEnabled = false;
        let result = scope.base.prototype.mouseUp.call(scope, x, y, button);
        //scope.actionEnabled = true;

        moveForward = false;
        moveBackward = false;

        mouseDragOn = false;

        if (view.IsUseProgressive())
            view.Renderer.enableRenderLimit = false;

        //view.MeshBlock.Reset();
        return result;
    };



    this.mouseWheel = function (x, y, delta) {
        //scope.base.prototype.mouseWheel.call(scope, x, y, delta);

        scope.EventCnt++;
        scope.mouseWheelOn = true;
        if (view.IsUseProgressive())
            view.Renderer.enableRenderLimit = true;

        if (delta < 0) {
            aroundDown = true;
            aroundUp = false;
            updateEvent = true;
        }
        else if (delta > 0) {
            aroundDown = false;
            aroundUp = true;
            updateEvent = true;
        }

        setTimeout(function () {
            scope.EventCnt--;
            if (scope.EventCnt === 0) {
                scope.mouseWheelOn = false;
                aroundDown = false;
                aroundUp = false;
                if (view.IsUseProgressive())
                    view.Renderer.enableRenderLimit = false;

                //update();
            }
        }, 30);

    };

    this.mouseOver = function () {
        scope.base.prototype.mouseOver.call(scope);
    };
    this.mouseOut = function (x, y, button) {
        mouseDragOn = false;

        if (view.IsUseProgressive())
            view.Renderer.enableRenderLimit = false;

        scope.actionEnabled = false;
        let result = scope.base.prototype.mouseUp.call(scope, x, y, button);
        scope.actionEnabled = true;

        view.MeshBlock.Reset();
        view.Renderer.MainFBClear();
        view.Renderer.Render();
    };

    this.keyPress = function (keyCode) {
        switch (keyCode) {

            case 38: /*up*/
            case 119:
            case 87: /*W*/
                {
                    mapKeyCode.set(0, true);
                    moveForward = true;
                } break;

            case 37: /*left*/
            case 97:
            case 65: /*A*/
                {
                    mapKeyCode.set(1, true);
                    moveLeft = true;
                } break;

            case 40: /*down*/
            case 115:
            case 83: /*S*/
                {
                    mapKeyCode.set(2, true);
                    moveBackward = true;
                }
                break;

            case 39: /*right*/
            case 100:
            case 68: /*D*/
                {
                    mapKeyCode.set(3, true);
                    moveRight = true;
                } break;

            case 114:
            case 82: /*R*/
                {
                    mapKeyCode.set(4, true);
                    moveUp = true;
                } break;
            case 102:
            case 70: /*F*/
                {
                    mapKeyCode.set(5, true);
                    moveDown = true;
                } break;

        }

        updateEvent = true;
        if (view.IsUseProgressive())
            view.Renderer.enableRenderLimit = true;
        //update();
    };
    this.keyUp = function (keyCode) {
        switch (keyCode) {

            case 38: /*up*/
            case 119:
            case 87: /*W*/
                {
                    mapKeyCode.set(0, false);
                    moveForward = false;
                } break;

            case 37: /*left*/
            case 97:
            case 65: /*A*/
                {
                    mapKeyCode.set(1, false);
                    moveLeft = false;
                }
                break;

            case 40: /*down*/
            case 115:
            case 83: /*S*/
                {
                    mapKeyCode.set(2, false);
                    moveBackward = false;
                } break;

            case 39: /*right*/
            case 100:
            case 68: /*D*/
                {
                    mapKeyCode.set(3, false);
                    moveRight = false;
                } break;

            case 114:
            case 82: /*R*/
                {
                    mapKeyCode.set(4, false);
                    moveUp = false;
                } break;
            case 102:
            case 70: /*F*/
                {
                    mapKeyCode.set(5, false);
                    moveDown = false;
                } break;

        }

        let result = false;
        let check = function (value, key, map) {
            if (value)
                result = true;
        };

        mapKeyCode.forEach(check);
        //console.log("keypress : " + result);

        updateEvent = result;

        if (view.IsUseProgressive())
            view.Renderer.enableRenderLimit = false;

        //update();
        //view.MeshBlock.Reset();

        view.Renderer.MainFBClear();
        view.Renderer.Render();
        view.MeshBlock.Reset();
    };

    this.mouseDoubleClick = function (x, y, button) {

        moveForward = false;
        moveBackward = false;
        moveLeft = false;
        moveRight = false;
        moveUp = false;
        moveDown = false;

        // 선택 모델 포커스 및 보행모드 시선 처리

        // Pickinfo 반환
        //const resultPick = view.Renderer.PickPositionObject(x, y);

        const resultBody = view.Renderer.Picking(x, y);
        if (resultBody === undefined) return;

        const resultPickInfo = view.Data.GetPickByBody(resultBody.bodyId, x, y);
        if (!resultPickInfo.pick) return;
        let resultPick = resultPickInfo.position;

        if (resultPick === undefined)
            return;

        let offset = 1800;// mm
        offset = view.Data.GetUnitValue(offset);

        //resultPick.z += offset;
        //view.Camera.FocusPivot(resultPick);
        view.Camera.pivot = resultPick;
        for (let i = 0; i < 16; i++)
            view.Camera.SetZAxis2Up();

        // 아바타 바운드 박스 처리
        //let bbox = new VIZCore.BBox();
        //bbox.min = new VIZCore.Vector3(resultPick.x - offset / 2, resultPick.y - offset / 2, resultPick.z);
        //bbox.max = new VIZCore.Vector3(resultPick.x + offset / 2, resultPick.y + offset / 2, resultPick.z + offset);
        //bbox.update();

        //scope.cameraMatrix;
        //scope.projectionMatrix

        //let projectionSrcMatrix = new VIZCore.Matrix4().perspective(fieldOfViewRadians, aspect, scope.near, scope.far);

        //let eyePosition = new VIZCore.Vector3(0, 0, scope.viewDistance);
        //eyePosition.add(scope.cameraPosition);
        //cameraTarget = new VIZCore.Vector3(0, 0, 0);
        //cameraUp = new VIZCore.Vector3(0, 1, 0);

        //let lookAtMatrix = new VIZCore.Matrix4().lookAt(eyePosition, scope.cameraTarget, scope.cameraUp);
        //scope.viewMatrix = new VIZCore.Matrix4().getInverse(lookAtMatrix);
        //scope.projectionMatrix.multiply(scope.viewMatrix);

        let matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
        let matMVP = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, matMVMatrix);

        //        let pickScreenPos = view.Camera.cameraMatrix * resultPick;
        let needMoveCamPos = new VIZCore.Vector3().copy(resultPick);
        needMoveCamPos.z += offset;    // 사람 키 높이만큼 올림
        let pickScreenPos = view.Camera.cameraMatrix.multiplyVector(new VIZCore.Vector3().copy(needMoveCamPos));

        view.Camera.cameraMatrix.translate(-pickScreenPos.x, -pickScreenPos.y, -pickScreenPos.z +
            view.Camera.viewDistance);

        view.Camera.pivot = needMoveCamPos;
        view.Camera.ResizeGLWindow();

        //view.Camera.FocusBBox(bbox);
        //view.Camera.FocusPivot(resultPick);

        view.MeshBlock.Reset();
        //scope.ResizeGLWindow();
        view.Renderer.MainFBClear();
        view.Renderer.Render();
    };

    this.MouseLog = function () {
        console.log('UIFly.mouse : ' + scope.mouse.x + ',' + scope.mouse.y);
    };


    //VIZCore.UIBase.prototype.touchStart = function (touches) {
    //    scope.actionEnabled = false;
    //    let result = scope.base.prototype.touchStart.call(scope, touches);
    //    scope.actionEnabled = true;
    //
    //    mouseDragOn = true;
    //
    //    if (view.IsUseProgressive())
    //        view.Renderer.enableRenderLimit = true;
    //
    //    return result;
    //};
    //
    //VIZCore.UIBase.prototype.touchMove = function (touches) {
    //    scope.actionEnabled = false;
    //    scope.base.prototype.touchMove.call(scope, touches);
    //    scope.actionEnabled = true;
    //};
    //
    //VIZCore.UIBase.prototype.touchEnd = function (touches) {
    //    scope.actionEnabled = false;
    //    let result = scope.base.prototype.touchEnd.call(scope, touches);
    //    scope.actionEnabled = true;
    //
    //    moveForward = false;
    //    moveBackward = false;
    //
    //    mouseDragOn = false;
    //
    //    if (view.IsUseProgressive())
    //        view.Renderer.enableRenderLimit = false;
    //};


    this.Render2D = function (context) {
        if (scope.mouseLeftDown) {
            //Line + 
            if (scope.mouseDownPosition.x !== scope.mouse.x &&
                scope.mouseDownPosition.y !== scope.mouse.y) {

                let lineWidth = 5;
                let centerOffset = 2;
                let lineLength = 35;

                context.fillStyle = "rgba(255,255,255,0.6)";
                context.strokeStyle = "rgba(64,64,64,0.3)";
                context.lineWidth = lineWidth;

                //context.strokeRect(scope.mouseDownPosition.x - lineLength, scope.mouseDownPosition.y - lineWidth / 2, lineLength * 2, lineWidth);
                //context.fillRect(scope.mouseDownPosition.x - lineLength, scope.mouseDownPosition.y - lineWidth / 2, lineLength * 2, lineWidth);

                //context.strokeRect(scope.mouseDownPosition.x - lineWidth / 2, scope.mouseDownPosition.y - lineLength, lineWidth, lineLength * 2);
                //context.fillRect(scope.mouseDownPosition.x - lineWidth / 2, scope.mouseDownPosition.y - lineLength, lineWidth, lineLength * 2);

                context.strokeRect(scope.mouseDownPosition.x - lineLength, scope.mouseDownPosition.y - lineWidth / 2, lineLength - lineWidth - centerOffset, lineWidth);
                context.fillRect(scope.mouseDownPosition.x - lineLength, scope.mouseDownPosition.y - lineWidth / 2, lineLength - lineWidth - centerOffset, lineWidth);

                context.strokeRect(scope.mouseDownPosition.x + lineWidth + centerOffset, scope.mouseDownPosition.y - lineWidth / 2, lineLength - lineWidth, lineWidth);
                context.fillRect(scope.mouseDownPosition.x + lineWidth + centerOffset, scope.mouseDownPosition.y - lineWidth / 2, lineLength - lineWidth, lineWidth);

                context.strokeRect(scope.mouseDownPosition.x - lineWidth / 2, scope.mouseDownPosition.y - lineLength, lineWidth, lineLength - lineWidth - centerOffset);
                context.fillRect(scope.mouseDownPosition.x - lineWidth / 2, scope.mouseDownPosition.y - lineLength, lineWidth, lineLength - lineWidth - centerOffset);

                context.strokeRect(scope.mouseDownPosition.x - lineWidth / 2, scope.mouseDownPosition.y + lineWidth + centerOffset, lineWidth, lineLength - lineWidth);
                context.fillRect(scope.mouseDownPosition.x - lineWidth / 2, scope.mouseDownPosition.y + lineWidth + centerOffset, lineWidth, lineLength - lineWidth);


            }
        }
    };
};


//VIZCore.UIFly.prototype = VIZCore.UIBase.prototype; //call방식으로 base Function을 불러올수 없음

//VIZCore.UIFly.prototype = new VIZCore.UIBase(undefined); //call방식으로 base Function을 불러오기 가능
//VIZCore.this.constructor = VIZCore.UIFly;

//VIZCore.UIFly.prototype = Object.create(VIZCore.UIBase.prototype);
//VIZCore.this.constructor = VIZCore.UIFly;

export default UIFly;