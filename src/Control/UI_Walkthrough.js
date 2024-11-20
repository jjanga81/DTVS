/**
 * @author ssjo@softhills.net
 */

let UIWalkthrough = function (view, VIZCore) {
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
    let mouseRightDragOn = false;
    let mouseWheelOn = false;
    let mouseMiddleOn = false;

    this.movementSpeed = 2000.0; //0.5
    this.aroundSpeed = 0.12; //0.05;
    this.aroundKeySpeed = 300.0; //QE 키를 사용하여 회전
    this.aroundWheelFactor = 10;

    //AD 키와 QE 키 동작 변경
    // false = AD 이동, QE 회전
    // true = AD 회전, QE 이동
    this.aroundMoveKeyChanged = true;

    this.timeLastUpdate = undefined;

    this.aroundTimer = undefined;

    this.EventCnt = 0;
    let updateEvent = true;
    let lastUpdateEvent = false;

    let mapKeyCode = new Map();

    let updateCnt = 0;
    let lastUpdateMouse = new VIZCore.Vector2();
    
    init();
    function init() {

    }

    function update(x, y) {
        //if (moveForward || (autoForward && !moveBackward))

        let vTranslate = new VIZCore.Vector3();
        let vTranslateUp = new VIZCore.Vector3();

        let dx = 0;
        let dy = 0;

        let timeCurrent = new Date().getTime();
        let timespan = timeCurrent - scope.timeLastUpdate;
        timespan /= 1000.0;

        scope.timeLastUpdate = timeCurrent;

        let walkthroughtSpeed = scope.movementSpeed; //mm
        walkthroughtSpeed = view.Data.GetUnitValue(walkthroughtSpeed);

        //if (view.Data.Accumulation === VIZCore.Enum.ACCUMULATION_UNIT.cm)
        //    walkthroughtSpeed /= 10;
        //else if (view.Data.Accumulation === VIZCore.Enum.ACCUMULATION_UNIT.m)
        //    walkthroughtSpeed /= 1000;
        //else if (view.Data.Accumulation === VIZCore.Enum.ACCUMULATION_UNIT.inch)
        //    walkthroughtSpeed /= 25.4;

        //아바타 모드
        let walkthroughZoom = false;
        if (view.Avatar.ShowAvatar) {
            //현재 아바타 Zoom
            let avatar = view.Avatar.GetObject();
            if (avatar !== undefined) {

                if (aroundUp) {
                    if (mouseWheelOn) {
                        view.Avatar.SetZoom(view.Avatar.AvatarZoom - view.Avatar.ZoomRate);
                        walkthroughZoom = true;
                        aroundUp = false;
                    }
                    else {
                        dy = -1 * scope.aroundSpeed;
                    }
                }
                if (aroundDown) {
                    if (mouseWheelOn) {
                        view.Avatar.SetZoom(view.Avatar.AvatarZoom + view.Avatar.ZoomRate);
                        walkthroughZoom = true;
                        aroundDown = false;
                    }
                    else {                        
                        dy = 1 * scope.aroundSpeed;
                    }
                }
            }
        }
        else {
            // if (aroundUp) {
            //     dy = -1 * scope.aroundSpeed;
            //     if (mouseWheelOn)
            //         dy *= scope.aroundWheelFactor;
            // }
            // if (aroundDown) {
            //     dy = 1 * scope.aroundSpeed;
            //     if (mouseWheelOn)
            //         dy *= scope.aroundWheelFactor;
            // }

            if (aroundUp) {
                if (mouseWheelOn) {
                    view.Avatar.SetZoom(view.Avatar.AvatarZoom - view.Avatar.ZoomRate);
                    walkthroughZoom = true;
                    aroundUp = false;
                }
                else {
                    dy = -1 * scope.aroundSpeed;
                }
            }
            if (aroundDown) {
                if (mouseWheelOn) {
                    view.Avatar.SetZoom(view.Avatar.AvatarZoom + view.Avatar.ZoomRate);
                    walkthroughZoom = true;
                    aroundDown = false;
                }
                else {                        
                    dy = 1 * scope.aroundSpeed;
                }
            }

        }


        //카메라 뷰 변경
        let cax = 0;
        let cay = 0;
        let cameraRDragRotate = false;
        if (mouseRightDragOn) {
            //cax = x - scope.mouseLastPosition.x;
            //cay = y - scope.mouseLastPosition.y;

            cax = x - lastUpdateMouse.x;
            cay = y - lastUpdateMouse.y;

            if (cax !== 0 || cay !== 0)
                cameraRDragRotate = true;
        }

        if (mouseDragOn) {
            dx = x - scope.mouseDownPosition.x;
            dy = y - scope.mouseDownPosition.y;

            dx = dx * scope.aroundSpeed * timespan;
            dy = dy * walkthroughtSpeed * timespan;

            if (dx < 0) {
                aroundLeft = true;
                aroundRight = false;
            }
            else if (dx > 0) {
                aroundLeft = false;
                aroundRight = true;               
            }
            else {
                aroundLeft = false;
                aroundRight = false;
            }

            if (dy < 0) {
                moveForward = true;
                moveBackward = false;
            }
            else if (dy > 0) {
                moveForward = false;
                moveBackward = true;
            }
            else {
                moveForward = false;
                moveBackward = false;
            }

            walkthroughtSpeed *= Math.abs(dy) / view.Data.GetWalkthroughUnitValue(10000);
            dy = 0;
        }


        let xAxis = new VIZCore.Vector3(1, 0, 0);
        let yAxis = new VIZCore.Vector3(0, 1, 0);
        let zAxis = new VIZCore.Vector3(0, 0, 1);

        let matMV = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
        let matMVinv = new VIZCore.Matrix4().getInverse(matMV);

        let cameraViewPos = matMVinv.multiplyVector(view.Camera.cameraPosition);

        //{
        //    let matMVMatrix = new VIZCore.Matrix4().copy(matMV);
        //    matMVMatrix.setPosition(new VIZCore.Vector3());
        //    let matMVP = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, matMVMatrix);
        //
        //    const viewWidth = view.Renderer.GetSizeWidth();
        //    const viewHeight = view.Renderer.GetSizeHeight();
        //    let vWorldCenter = view.Camera.screen2WorldWithMatrix(matMVP, new VIZCore.Vector3());
        //    let vWorldLeft = view.Camera.screen2WorldWithMatrix(matMVP, new VIZCore.Vector3(viewWidth, 0, 0));
        //    let vWorldUp = view.Camera.screen2WorldWithMatrix(matMVP, new VIZCore.Vector3(0, viewHeight, 0));
        //    let vWorldFront = view.Camera.screen2WorldWithMatrix(matMVP, new VIZCore.Vector3(0, 0, 1));
        //
        //    //let vWorldCenter = view.Camera.screen2WorldWithMatrix(matMVP, new VIZCore.Vector3());
        //    //let vWorldLeft = view.Camera.screen2WorldWithMatrix(matMVP, new VIZCore.Vector3().copy(xAxis));
        //    //let vWorldUp = view.Camera.screen2WorldWithMatrix(matMVP, new VIZCore.Vector3().copy(yAxis));
        //    //let vWorldFront = view.Camera.screen2WorldWithMatrix(matMVP, new VIZCore.Vector3().copy(zAxis));
        //    
        //    xAxis = new VIZCore.Vector3().subVectors(vWorldLeft, vWorldCenter).normalize();
        //    yAxis = new VIZCore.Vector3().subVectors(vWorldUp, vWorldCenter).normalize();
        //    zAxis = new VIZCore.Vector3().subVectors(vWorldFront, vWorldCenter).normalize();
        //}

        //updateCnt++;
        //view.MeshBlock.Reset();
        if (!moveForward && !moveBackward && !moveLeft && !moveRight && !moveUp && !moveDown
            && !aroundUp && !aroundDown && !aroundLeft && !aroundRight) {
            //if (updateCnt < 0) {
            //    updateCnt = 0;
            //    view.MeshBlock.Reset();
            //}
            

            //Avatar 애니메이션 설정
            if (view.Avatar.ShowAvatar) {

                //현재 아바타
                let avatar = view.Avatar.GetObject();
                if (avatar !== undefined) {

                    cameraViewPos.copy(avatar.position);

                    view.Avatar.AvatarCurrentTime += timespan;

                    if (!mouseDragOn && !mouseRightDragOn)
                        view.Avatar.SetAnimationByIndex(avatar.uuid, 0, 0); //idle

                    view.Renderer.MainFBClear(false);
                    view.Renderer.Render();

                    if (cameraRDragRotate) {
                        //카메라만 회전
                        //마우스 우측 회전
                        let angle = new VIZCore.Vector3(cay / 100.0, cax / 150.0, cax / 150.0);
                        //let angle = new VIZCore.Vector3(cay / 100.0, 0, 0);
                        view.Avatar.CameraRotate(angle, cameraViewPos);

                        //아바타 설정
                        let currentPos = new VIZCore.Vector3().copy(avatar.position);
                        let currentDir = new VIZCore.Vector3().copy(avatar.direction);
                        let currentUp = new VIZCore.Vector3().copy(avatar.up);
                        {
                            let matZByAvatar = new VIZCore.Matrix4().makeRotationZ(-cax / 150.0);
                            currentDir.applyMatrix4(matZByAvatar);
                        }

                        //아바타 이동 및 회전 적용
                        view.Avatar.SetPosAndDirection(undefined, currentPos, currentDir, currentUp);

                        //// rotate by pivot
                        //let rotateByPivotMatrix = new VIZCore.Matrix4();
                        //let rotateZByPivotMatrix = new VIZCore.Matrix4();
                        //
                        //let matX = new VIZCore.Matrix4().makeRotationX(angle.x);
                        //let matY = new VIZCore.Matrix4().makeRotationY(angle.y);
                        //let matZ = new VIZCore.Matrix4().makeRotationZ(angle.z);
                        //
                        //{
                        //    {
                        //        let matModelMatrix = new VIZCore.Matrix4().copy(matMV);
                        //        let vUpPos = new VIZCore.Vector3(0, 0, 1);
                        //        let vZeroPos = new VIZCore.Vector3(0, 0, 0);
                        //        vUpPos.applyMatrix4(matModelMatrix);
                        //        vZeroPos.applyMatrix4(matModelMatrix);
                        //
                        //        if (vUpPos.y < vZeroPos.y) {
                        //            matZ = new VIZCore.Matrix4().makeRotationZ(-angle.z);
                        //        }
                        //    }
                        //
                        //    {
                        //        let matModelMatrix = new VIZCore.Matrix4().copy(matMV);
                        //        let pivotWithModelCenterOffset = new VIZCore.Vector3().copy(cameraViewPos);
                        //        pivotWithModelCenterOffset.applyMatrix4(matModelMatrix);
                        //
                        //        let translatePivotToZeroMatrix = new VIZCore.Matrix4();
                        //        let pivotZero = new VIZCore.Vector3().copy(pivotWithModelCenterOffset).multiplyScalar(-1);
                        //        translatePivotToZeroMatrix.setPosition(pivotZero);
                        //
                        //        //let rotateMatrix = new Matrix4().multiplyMatrices(matX, matY);
                        //        let rotateMatrix = new VIZCore.Matrix4().copy(matX);
                        //
                        //        let translateZeroToPivotMatrix = new VIZCore.Matrix4().setPosition(pivotWithModelCenterOffset);
                        //
                        //        let tmpMatrix = new VIZCore.Matrix4().multiplyMatrices(rotateMatrix, translatePivotToZeroMatrix);
                        //        rotateByPivotMatrix = new VIZCore.Matrix4().multiplyMatrices(translateZeroToPivotMatrix, tmpMatrix);
                        //    }
                        //
                        //    {
                        //        let pivotWithModelCenterOffset = new VIZCore.Vector3().copy(cameraViewPos);
                        //
                        //        let translatePivotToZeroMatrix = new VIZCore.Matrix4();
                        //        let pivotZero = new VIZCore.Vector3().copy(pivotWithModelCenterOffset).multiplyScalar(-1);
                        //        translatePivotToZeroMatrix.setPosition(pivotZero);
                        //
                        //        //let rotateMatrix = new Matrix4().multiplyMatrices(matX, matY);
                        //        let rotateMatrix = new VIZCore.Matrix4().copy(matZ);
                        //
                        //        let translateZeroToPivotMatrix = new VIZCore.Matrix4().setPosition(pivotWithModelCenterOffset);
                        //
                        //        let tmpMatrix = new VIZCore.Matrix4().multiplyMatrices(rotateMatrix, translatePivotToZeroMatrix);
                        //        rotateZByPivotMatrix = new VIZCore.Matrix4().multiplyMatrices(translateZeroToPivotMatrix, tmpMatrix);
                        //    }
                        //
                        //    //카메라 설정
                        //    let tmp2Matrix = new VIZCore.Matrix4().multiplyMatrices(matMV, rotateZByPivotMatrix);
                        //    matMV = new VIZCore.Matrix4().multiplyMatrices(rotateByPivotMatrix, tmp2Matrix);
                        //}
                        //
                        ////회전만
                        //view.Camera.cameraMatrix.copy(matMV);
                        //view.Camera.ResizeGLWindow();
                        //view.Avatar.UpdateCamera();
                    }
                }
            }

            //카메라만 회전
            //먼저 아바타인경우에만 적용
            
        }
        else {
            // view.Avatar.ShowAvatar = false;
            //Avatar Walkthrough 설정
            if (view.Avatar.ShowAvatar) {
                //현재 아바타
                let avatar = view.Avatar.GetObject();
                if (avatar !== undefined) {

                    //Avatar 바라보는 설정과 바라보는 방향이 다름..
                    // 모델의 경우 Y-
                    // direction 설정은 X+

                    let vXAxis = new VIZCore.Vector3().copy(avatar.direction);
                    let vObjUp = new VIZCore.Vector3().copy(avatar.up);
                    let vYAxis = new VIZCore.Vector3().crossVectors(vObjUp, vXAxis);

                    let vZAxis = new VIZCore.Vector3().copy(vXAxis);
                    vZAxis.cross(vYAxis);
                    vZAxis.normalize();

                    //let matAxis = new VIZCore.Matrix4().makeBasis(vXAxis, vYAxis, vZAxis);

                    //xAxis.copy(vXAxis);
                    //yAxis.copy(vYAxis);
                    //zAxis.copy(vZAxis);

                    // Avatar 회전..필요

                    cameraViewPos.copy(avatar.position);

                    let currentPos = new VIZCore.Vector3().copy(avatar.position);
                    let currentDir = new VIZCore.Vector3().copy(avatar.direction);
                    let currentUp = new VIZCore.Vector3().copy(avatar.up);

                    let avatarTranslate = new VIZCore.Vector3();
                    let avatarTranslateUp = new VIZCore.Vector3();

                    //이동    
                    {
                        if (moveForward && !moveBackward) {
                            //vTranslate.z = 1 * walkthroughtSpeed * timespan;
                            //vTranslate.add(new VIZCore.Vector3().copy(zAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));

                            //vZAxis
                            vTranslate.add(new VIZCore.Vector3().copy(zAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                            //vTranslate.sub(new VIZCore.Vector3().copy(vYAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                            avatarTranslate.sub(new VIZCore.Vector3().copy(vYAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                        }
                        if (!moveForward && moveBackward) {
                            //vTranslate.z = -1 * walkthroughtSpeed * timespan;
                            //vTranslate.sub(new VIZCore.Vector3().copy(zAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));

                            vTranslate.sub(new VIZCore.Vector3().copy(zAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                            //vTranslate.add(new VIZCore.Vector3().copy(vYAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                            avatarTranslate.add(new VIZCore.Vector3().copy(vYAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                        }

                        if (moveLeft && !moveRight) {
                            //vTranslate.x = 1 * walkthroughtSpeed * timespan;
                            vTranslate.add(new VIZCore.Vector3().copy(xAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));

                            //vTranslate.add(new VIZCore.Vector3().copy(vXAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                            avatarTranslate.add(new VIZCore.Vector3().copy(vXAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));

                        }
                        if (!moveLeft && moveRight) {
                            //vTranslate.x = -1 * walkthroughtSpeed * timespan;
                            vTranslate.sub(new VIZCore.Vector3().copy(xAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));

                            //vTranslate.sub(new VIZCore.Vector3().copy(vXAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                            avatarTranslate.sub(new VIZCore.Vector3().copy(vXAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                        }

                        if (moveUp && !moveDown) {
                            //vTranslate.y = -1 * walkthroughtSpeed * timespan;
                            vTranslateUp.sub(new VIZCore.Vector3().copy(yAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));

                            //vTranslateUp.sub(new VIZCore.Vector3().copy(vYAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                            avatarTranslateUp.add(new VIZCore.Vector3().copy(vZAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));

                        }
                        if (!moveUp && moveDown) {
                            //vTranslate.y = 1 * walkthroughtSpeed * timespan;
                            vTranslateUp.add(new VIZCore.Vector3().copy(yAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));

                            //vTranslateUp.add(new VIZCore.Vector3().copy(vYAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                            avatarTranslateUp.sub(new VIZCore.Vector3().copy(vZAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                        }
                        
                        {
                            let prevTranslate = new VIZCore.Vector3().copy(vTranslate);

                            let zWorldAxis = new VIZCore.Vector3(0, 0, 1);
                            //let zWorldAxis = new VIZCore.Vector3().copy(vYAxis);
                            let zeroWorldAxis = new VIZCore.Vector3(0, 0, 0);
                            let matMVMatrix = new VIZCore.Matrix4().copy(matMV);
                            zWorldAxis = matMVMatrix.multiplyVector(zWorldAxis);
                            zeroWorldAxis = matMVMatrix.multiplyVector(zeroWorldAxis);

                            let zWorldAxisDir = zWorldAxis.sub(zeroWorldAxis);
                            zWorldAxisDir.normalize();

                            let zDotValue = vTranslate.dot(zWorldAxisDir);
                            zWorldAxisDir.multiplyScalar(zDotValue);

                            vTranslate.sub(zWorldAxisDir);


                            //아바타 - 카메라 속도 보정
                            {
                                //let zWorldAxisAvatar = new VIZCore.Vector3(0, 0, 1);
                                //let zWorldAxisAvatar = new VIZCore.Vector3().copy(vZAxis);
                                //let zeroWorldAxisAvatar = new VIZCore.Vector3(0, 0, 0);
                                //zWorldAxisAvatar = matMVMatrix.multiplyVector(zWorldAxisAvatar);
                                //zeroWorldAxisAvatar = matMVMatrix.multiplyVector(zeroWorldAxisAvatar);
                                //
                                //let zWorldAxisDirAvatar = zWorldAxisAvatar.sub(zeroWorldAxisAvatar);
                                //zWorldAxisDirAvatar.normalize();
                                //
                                //let zDotValueAvatar = avatarTranslate.dot(zWorldAxisDirAvatar);
                                //zWorldAxisDirAvatar.multiplyScalar(zDotValueAvatar);

                                //avatarTranslate.sub(zWorldAxisDirAvatar);

                                let cameraOffset = new VIZCore.Vector3().subVectors(vTranslate, prevTranslate);
                                let offsetLength = cameraOffset.length();
                                
                                let avatarMoveDir = new VIZCore.Vector3().copy(avatarTranslate);
                                avatarMoveDir.normalize();
                                avatarMoveDir.multiplyScalar(offsetLength);
                                
                                avatarTranslate.sub(avatarMoveDir);
                            }

                            //let avatarMoveDir = new VIZCore.Vector3().copy(avatarTranslate);
                            //avatarMoveDir.normalize();
                            //avatarMoveDir.multiplyScalar(zDotValue);
                            //avatarTranslate.sub(avatarMoveDir);
                            ////avatarTranslate.sub(zWorldAxisDir);

                            //console.log(zDotValue);
                            //console.log("after nomalized : " + avatarTranslate.x + " " + avatarTranslate.y + " " + avatarTranslate.z);
                            //avatarTranslate.add(zWorldAxisDir);
                            //console.log("after nomalized : " + vTranslate.x + " " + vTranslate.y + " " + vTranslate.z);
                            // vTranslate.multiplyScalar(dirSpeed);

                            //if (dirSpeed > 1)
                            //  dirSpeed = 0;
                        }

                        {
                            let yWorldAxis = new VIZCore.Vector3(0, 1, 0);
                            //let yWorldAxis = new VIZCore.Vector3().copy(vYAxis);
                            let matMVMatrix = new VIZCore.Matrix4().copy(matMV);
                            matMVMatrix.setPosition(new VIZCore.Vector3());
                            yWorldAxis = matMVMatrix.multiplyVector(yWorldAxis);

                            let yDotValue = vTranslateUp.dot(yWorldAxis);
                            yWorldAxis.multiplyScalar(yDotValue);

                            vTranslateUp.sub(yWorldAxis);
                            vTranslate.add(vTranslateUp);

                            //아바타 - 카메라 속도 보정
                            let avatarUpDir = new VIZCore.Vector3().copy(avatarTranslateUp);
                            avatarUpDir.normalize();
                            avatarUpDir.multiplyScalar(yDotValue);
                            avatarTranslateUp.sub(avatarUpDir);
                            avatarTranslate.add(avatarTranslateUp);
                        }

                        //아바타 설정
                        currentPos.add(avatarTranslate);

                        //카메라 설정
                        {
                            if (moveForward || moveBackward || moveLeft || moveRight || moveUp || moveDown) {
                            //    matMV.translate(vTranslate.x, vTranslate.y, vTranslate.z);
                            }
                        }
                    }

                    //aroundLeft = false;
                    //aroundRight = false;
                    //moveForward = false;
                    //moveBackward = false;

                    //회전
                    if (aroundUp || aroundDown || aroundLeft || aroundRight) {

                        if (mouseDragOn) {

                            if (aroundUp) {
                                dy = -1 * scope.aroundSpeed;
                            }
                            if (aroundDown) {
                                dy = 1 * scope.aroundSpeed;
                            }

                        }
                        else {

                            if (aroundLeft) {
                                dx = -scope.aroundKeySpeed * scope.aroundSpeed * timespan;
                            }

                            if (aroundRight) {
                                dx = scope.aroundKeySpeed * scope.aroundSpeed * timespan;
                            }

                        }

                        //aroundLeft = false;
                        //aroundRight = false;
                        //moveForward = false;
                        //moveBackward = false;

                        //if (aroundUp) {
                        //    dy = -1 * scope.aroundSpeed;
                        //}
                        //if (aroundDown) {
                        //    dy = 1 * scope.aroundSpeed;
                        //}

                        aroundUp = false;
                        aroundDown = false;

                        let avatarRotate = dx;
                        // rotate by pivot
                        let rotateByPivotMatrix = new VIZCore.Matrix4();
                        let rotateZByPivotMatrix = new VIZCore.Matrix4();

                        let matX = new VIZCore.Matrix4().makeRotationX(dy / 100.0);
                        let matY = new VIZCore.Matrix4().makeRotationY(dx / 100.0);
                        let matZ = new VIZCore.Matrix4().makeRotationZ(dx / 100.0);

                        {
                            {
                                let matModelMatrix = new VIZCore.Matrix4().copy(matMV);
                                let vUpPos = new VIZCore.Vector3(0, 0, 1);
                                let vZeroPos = new VIZCore.Vector3(0, 0, 0);
                                vUpPos.applyMatrix4(matModelMatrix);
                                vZeroPos.applyMatrix4(matModelMatrix);

                                if (vUpPos.y < vZeroPos.y) {
                                    matZ = new VIZCore.Matrix4().makeRotationZ(-dx / 100.0);
                                    avatarRotate = -dx;
                                }
                            }

                            //let matMV = new VIZCore.Matrix4().copy(matMV);
                            //let matMVinv = new VIZCore.Matrix4().getInverse(matMV);
                            //
                            //let cameraViewPos = matMVinv.multiplyVector(view.Camera.cameraPosition);

                            {
                                let matModelMatrix = new VIZCore.Matrix4().copy(matMV);
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
                        }

                        //아바타 설정
                        {
                            let matZByAvatar = new VIZCore.Matrix4().makeRotationZ(-avatarRotate / 100.0);
                            currentDir.applyMatrix4(matZByAvatar);
                        }

                        //카메라 설정
                        let tmp2Matrix = new VIZCore.Matrix4().multiplyMatrices(matMV, rotateZByPivotMatrix);
                        matMV = new VIZCore.Matrix4().multiplyMatrices(rotateByPivotMatrix, tmp2Matrix);
                    }
                 

                    //회전만
                    view.Camera.cameraMatrix.copy(matMV);
                    view.Camera.ResizeGLWindow();

                    //console.log("pos x: " + currentPos.x + ", y: " + currentPos.y + ", z: " + currentPos.z);
                    //console.log("dir x: " + currentDir.x + ", y: " + currentDir.y + ", z: " + currentDir.z);
                    //console.log("up x: " + currentUp.x + ", y: " + currentUp.y + ", z: " + currentUp.z);

                    //아바타 이동 및 회전 적용
                    view.Avatar.SetPosAndDirection(undefined, currentPos, currentDir, currentUp);

                    view.Avatar.UpdateCamera();
                    //view.Avatar.InitPosAndDirection();

                    //이동 애니메이션
                    //let transAnimationTime = timespan * (walkthroughtSpeed / 500.0);
                    //let rotateAnimationTime = 0;
                    //if (dx !== 0)
                    //    rotateAnimationTime = timespan;
                    //
                    //if (transAnimationTime > rotateAnimationTime)
                    //    view.Avatar.AvatarCurrentTime += timespan * (walkthroughtSpeed / 500.0); // 이동속도 비례
                    //else
                    //    view.Avatar.AvatarCurrentTime += timespan;

                    if (mouseDragOn) {
                        let animationRunLength = 100.0; //걷기 및 뛰기 마우스 거리
                        let mouseLength = Math.abs(x - scope.mouseDownPosition.x) + Math.abs(y - scope.mouseDownPosition.y);
                        view.Avatar.AvatarCurrentTime += timespan;

                        //아바타 애니메이션 설정
                        if (mouseLength < animationRunLength)
                            view.Avatar.SetAnimationByIndex(avatar.uuid, 0, 1); //walk
                        else
                            view.Avatar.SetAnimationByIndex(avatar.uuid, 0, 2); //Run
                    }
                    else if (!mouseRightDragOn) {
                        view.Avatar.AvatarCurrentTime += timespan;
                        view.Avatar.SetAnimationByIndex(avatar.uuid, 0, 2); //Run
                        //view.Avatar.SetAnimationByIndex(avatar.uuid, 0, 3); //Talk
                    }
                    else {
                        view.Avatar.AvatarCurrentTime += timespan;
                        view.Avatar.SetAnimationByIndex(avatar.uuid, 0, 2); //Run
                    }
                }
            }
            else {

                if (moveForward && !moveBackward) {
                    //vTranslate.z = 1 * walkthroughtSpeed * timespan;
                    vTranslate.add(new VIZCore.Vector3().copy(zAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                }
                if (!moveForward && moveBackward) {
                    //vTranslate.z = -1 * walkthroughtSpeed * timespan;
                    vTranslate.sub(new VIZCore.Vector3().copy(zAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                }

                if (moveLeft && !moveRight) {
                    //vTranslate.x = 1 * walkthroughtSpeed * timespan;
                    vTranslate.add(new VIZCore.Vector3().copy(xAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));

                }
                if (!moveLeft && moveRight) {
                    //vTranslate.x = -1 * walkthroughtSpeed * timespan;
                    vTranslate.sub(new VIZCore.Vector3().copy(xAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                }

                if (moveUp && !moveDown) {
                    //vTranslate.y = -1 * walkthroughtSpeed * timespan;
                    vTranslateUp.sub(new VIZCore.Vector3().copy(yAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));

                }
                if (!moveUp && moveDown) {
                    //vTranslate.y = 1 * walkthroughtSpeed * timespan;
                    vTranslateUp.add(new VIZCore.Vector3().copy(yAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                }

                {
                    let zWorldAxis = new VIZCore.Vector3().copy(zAxis);
                    let zeroWorldAxis = new VIZCore.Vector3(0, 0, 0);
                    let matMVMatrix = new VIZCore.Matrix4().copy(matMV);
                    zWorldAxis = matMVMatrix.multiplyVector(zWorldAxis);
                    zeroWorldAxis = matMVMatrix.multiplyVector(zeroWorldAxis);

                    let zWorldAxisDir = zWorldAxis.sub(zeroWorldAxis);
                    zWorldAxisDir.normalize();

                    let zDotValue = vTranslate.dot(zWorldAxisDir);
                    zWorldAxisDir.multiplyScalar(zDotValue);

                    vTranslate.sub(zWorldAxisDir);
                    //console.log("after nomalized : " + vTranslate.x + " " + vTranslate.y + " " + vTranslate.z);
                    // vTranslate.multiplyScalar(dirSpeed);

                    //if (dirSpeed > 1)
                    //  dirSpeed = 0;
                }

                {
                    let yWorldAxis = new VIZCore.Vector3().copy(yAxis);
                    let matMVMatrix = new VIZCore.Matrix4().copy(matMV);
                    matMVMatrix.setPosition(new VIZCore.Vector3());
                    yWorldAxis = matMVMatrix.multiplyVector(yWorldAxis);

                    let yDotValue = vTranslateUp.dot(yWorldAxis);
                    yWorldAxis.multiplyScalar(yDotValue);

                    vTranslateUp.sub(yWorldAxis);

                    vTranslate.add(vTranslateUp);
                }

                if (aroundUp && !aroundDown) {
                    //vTranslate.z = -1 * walkthroughtSpeed;
                    //vTranslateUp.sub(new VIZCore.Vector3().copy(yAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                    //aroundUp = false;
                }

                if (!aroundUp && aroundDown) {
                    //vTranslate.z = 1 * walkthroughtSpeed;
                    //vTranslateUp.add(new VIZCore.Vector3().copy(yAxis).multiplyScalar(walkthroughtSpeed).multiplyScalar(timespan));
                    //aroundDown = false;
                }


                //카메라 설정
                //updateCnt++;
                if (moveForward || moveBackward || moveLeft || moveRight || moveUp || moveDown) {
                    matMV.translate(vTranslate.x, vTranslate.y, vTranslate.z);
                    //view.Camera.ResizeGLWindow();
                    //view.MeshBlock.Crash();
                    //view.Renderer.MainFBClear();
                    //view.Renderer.Render();
                }

                if (aroundUp || aroundDown || aroundLeft || aroundRight) {

                    if (mouseDragOn) {

                        if (aroundUp) {
                            dy = -1 * scope.aroundSpeed;
                        }
                        if (aroundDown) {
                            dy = 1 * scope.aroundSpeed;
                        }

                    }
                    else {

                        if (aroundLeft) {
                            dx = -scope.aroundKeySpeed * scope.aroundSpeed * timespan;
                        }

                        if (aroundRight) {
                            dx = scope.aroundKeySpeed * scope.aroundSpeed * timespan;
                        }

                    }

                    //aroundLeft = false;
                    //aroundRight = false;
                    //moveForward = false;
                    //moveBackward = false;
                    //
                    //if (aroundUp) {
                    //    dy = -1 * scope.aroundSpeed;
                    //
                    //    //dy *= scope.aroundWheelFactor;
                    //}
                    //if (aroundDown) {
                    //    dy = 1 * scope.aroundSpeed;
                    //
                    //    //dy *= scope.aroundWheelFactor;
                    //}
                    
                    aroundUp = false;
                    aroundDown = false;

                    // rotate by pivot
                    let rotateByPivotMatrix = new VIZCore.Matrix4();
                    let rotateZByPivotMatrix = new VIZCore.Matrix4();

                    {
                        let matX = new VIZCore.Matrix4().makeRotationX(dy / 100.0);
                        let matY = new VIZCore.Matrix4().makeRotationY(dx / 100.0);
                        let matZ = new VIZCore.Matrix4().makeRotationZ(dx / 100.0);

                        {
                            let matModelMatrix = new VIZCore.Matrix4().copy(matMV);
                            let vUpPos = new VIZCore.Vector3(0, 0, 1);
                            let vZeroPos = new VIZCore.Vector3(0, 0, 0);
                            vUpPos.applyMatrix4(matModelMatrix);
                            vZeroPos.applyMatrix4(matModelMatrix);

                            if (vUpPos.y < vZeroPos.y)
                                matZ = new VIZCore.Matrix4().makeRotationZ(-dx / 100.0);
                        }

                        //let matMV = new VIZCore.Matrix4().copy(matMV);
                        //let matMVinv = new VIZCore.Matrix4().getInverse(matMV);
                        //
                        //let cameraViewPos = matMVinv.multiplyVector(view.Camera.cameraPosition);

                        {
                            
                            let matModelMatrix = new VIZCore.Matrix4().copy(matMV);
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

                        let tmp2Matrix = new VIZCore.Matrix4().multiplyMatrices(matMV, rotateZByPivotMatrix);
                        matMV = new VIZCore.Matrix4().multiplyMatrices(rotateByPivotMatrix, tmp2Matrix);
                    }

                    //matMV = new VIZCore.Matrix4().multiplyMatrices(rotateByPivotMatrix, matMV); //2번..호출됨..?
                    //matMV.translate(vTranslate.x, vTranslate.y, vTranslate.z);
                }

                view.Camera.cameraMatrix.copy(matMV);
            }

            //이동 완료
            //view.Camera.cameraMatrix.copy(matMV);

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


        lastUpdateMouse.x = x;
        lastUpdateMouse.y = y;
    }

    this.UIBegin = function () {
        scope.base.prototype.UIBegin.call(scope);

        for (let i = 0; i < 16; i++)
            view.Camera.SetZAxis2Up();

        //초기위치 설정
        view.Avatar.InitPosAndDirection();

        //카메라 재설정
        if(view.Avatar.ShowAvatar) {
            view.Camera.ResizeGLWindow();                    
        }

        updateEvent = false;
        lastUpdateEvent = false;
        scope.timeLastUpdate = new Date().getTime();
        scope.aroundTimer = setInterval(function () {
            if (mouseDragOn || mouseRightDragOn) updateEvent = true;
            if (view.Avatar.ShowAvatar) updateEvent = true;

            if (lastUpdateEvent !== updateEvent) scope.timeLastUpdate = new Date().getTime();

            if (updateEvent)
                update(scope.mouse.x, scope.mouse.y);

            lastUpdateEvent = updateEvent;
            // updateEvent = false;
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
        if(button !== 1)
        {
            scope.actionEnabled = false;
        }
        else if(button === 1){
            mouseMiddleOn = true;
        }
            
        let result = scope.base.prototype.mouseDown.call(scope, x, y, button);
        scope.actionEnabled = true;

        if(mouseMiddleOn)
            return result;

        lastUpdateMouse.x = x;
        lastUpdateMouse.y = y;
        if (button === 2) {
            mouseRightDragOn = true;
        }
        else {
            mouseDragOn = true;
        }

        if (view.IsUseProgressive())
            view.Renderer.enableRenderLimit = true;

        return result;
    };

    this.mouseMove = function (x, y) {

        //if (mouseDragOn) {
        //update(x, y);
        //}

        if(mouseMiddleOn !== true)
            scope.actionEnabled = false;
        scope.base.prototype.mouseMove.call(scope, x, y);
        scope.actionEnabled = true;
    };

    this.mouseUp = function (x, y, button) {
        //scope.actionEnabled = false;
        let result = scope.base.prototype.mouseUp.call(scope, x, y, button);
        //scope.actionEnabled = true;

        mouseMiddleOn = false;
        if (button === 2) {
            mouseRightDragOn = false;
        }
        else {
            moveForward = false;
            moveBackward = false;
            aroundLeft = false;
            aroundRight = false;

            mouseDragOn = false;
        }

        if (view.IsUseProgressive())
            view.Renderer.enableRenderLimit = false;

        //view.MeshBlock.Reset();
        return result;
    };



    this.mouseWheel = function (x, y, delta) {
        //scope.base.prototype.mouseWheel.call(scope, x, y, delta);

        scope.EventCnt++;
        mouseWheelOn = true;
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
                mouseWheelOn = false;
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
            case 43: /*zoom in*/
                {
                    scope.mouseWheel(0, 0, 120);
                } break;
            case 45: /*zoom out*/
                {
                    scope.mouseWheel(0, 0, -120);
                } break;
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
                    if (!scope.aroundMoveKeyChanged) {
                        mapKeyCode.set(1, true);
                        moveLeft = true;
                    }
                    else {
                        mapKeyCode.set(6, true);
                        aroundLeft = true;
                    }
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
                    if (!scope.aroundMoveKeyChanged) {
                        mapKeyCode.set(3, true);
                        moveRight = true;
                    }
                    else {
                        mapKeyCode.set(7, true);
                        aroundRight = true;
                    }
                } break;

            case 113:
            case 81: /*Q*/
                {
                    if (!scope.aroundMoveKeyChanged) {
                        mapKeyCode.set(6, true);
                        aroundLeft = true;
                    }
                    else {
                        mapKeyCode.set(1, true);
                        moveLeft = true;
                    }
                }
                break;

            case 101:
            case 69: /*E*/
                {
                    if (!scope.aroundMoveKeyChanged) {
                        mapKeyCode.set(7, true);
                        aroundRight = true;
                    }
                    else {
                        mapKeyCode.set(3, true);
                        moveRight = true;
                    }                  
                }
                break;

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
                    if (!scope.aroundMoveKeyChanged) {
                        mapKeyCode.set(1, false);
                        moveLeft = false;
                    }
                    else {
                        mapKeyCode.set(6, false);
                        aroundLeft = false;
                    }
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
                    if (!scope.aroundMoveKeyChanged) {
                        mapKeyCode.set(3, false);
                        moveRight = false;
                    }
                    else {
                        mapKeyCode.set(7, false);
                        aroundRight = false;
                    }
                } break;

            case 113:
            case 81: /*Q*/
                {
                    if (!scope.aroundMoveKeyChanged) {
                        mapKeyCode.set(6, false);
                        aroundLeft = false;
                    }
                    else {
                        mapKeyCode.set(1, false);
                        moveLeft = false;
                    }
                }
                break;

            case 101:
            case 69: /*E*/
                {
                    if (!scope.aroundMoveKeyChanged) {
                        mapKeyCode.set(7, false);
                        aroundRight = false;
                    }
                    else {
                        mapKeyCode.set(3, false);
                        moveRight = false;
                    }
                }
                break;

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

        aroundUp = false;
        aroundDown = false;
        aroundLeft = false;
        aroundRight = false;
        mouseDragOn = false;
        mouseRightDragOn = false;

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

        let offset = 1680;// mm
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

        //아바타가 있는 경우 위치 변경
        if (view.Avatar.ShowAvatar && view.Avatar.GetObject() !== undefined)
        {
            //let matMV = new VIZCore.Matrix4().copy(view.Camera.matMV);
            //let matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
            //
            //let matMVinv = new VIZCore.Matrix4().getInverse(matMV);
            //let cameraViewPos = matMVinv.multiplyVector(view.Camera.cameraPosition);
            //
            //const viewWidth = view.Renderer.GetSizeWidth();
            //const viewHeight = view.Renderer.GetSizeHeight();
            //
            //let viewZero = new VIZCore.Vector3(viewWidth / 2, viewHeight / 2, 0);
            //let viewDir = new VIZCore.Vector3(viewWidth / 2, viewHeight / 2, 0.5);
            //
            //let viewWorldZero = view.Camera.screen2WorldWithMatrix(matMVP, viewZero);
            //let viewWorldDir = view.Camera.screen2WorldWithMatrix(matMVP, viewDir);
            //
            //let worldDir = new VIZCore.Vector3().subVectors(viewWorldDir, viewWorldZero);
            //worldDir.normalize();
            //
            //let currentPos = new VIZCore.Vector3().subVectors(cameraViewPos, worldDir.multiplyScalar(300));// 해당 거리만큼 위치이동
            //
            ////카메라 위치 재조정
            //view.Camera.cameraMatrix.translate(-currentPos.x, -currentPos.y, -currentPos.z );
            //
            //view.Camera.pivot = resultPick;
            //view.Camera.ResizeGLWindow();

            //초기위치 설정
            view.Avatar.InitPosAndDirection();
        }

        //view.Camera.FocusBBox(bbox);
        //view.Camera.FocusPivot(resultPick);

        view.MeshBlock.Reset();
        //scope.ResizeGLWindow();
        view.Renderer.MainFBClear();
        view.Renderer.Render();
    };

    this.MouseLog = function () {
        console.log('UIWalkthrough.mouse : ' + scope.mouse.x + ',' + scope.mouse.y);
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
        if (scope.mouseLeftDown && mouseDragOn) {
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

export default UIWalkthrough;