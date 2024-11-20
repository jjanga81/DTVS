/**
 * @author ssjo@softhills.net
 */


class Handle {
    constructor(view, VIZCore) {
        let scope = this;

        let handlerList; //view.Data.HandlerItem()

        //핸들 일정각격 이동 및 회전
        this.UseHandleInterval = false;

        //일정간격으로 이동
        this.MouseHandleTranslateInterval = 5;
        //일정간격으로 회전
        this.MouseHandleRotateInerval = 15;

        //일정간격 회전 데이터 백업
        let MouseHandlePickTranslate = new VIZCore.Vector3();
        let MouseHandlePickRotate = new VIZCore.Vector3();

        /**
         * Handle 이동 반환 값
         * @returns 
         */
        this.ResultTransformInfoItem = function(m, _move, _rotate) {
            let item = {
                matrix : m,
                move : _move,
                rotate : _rotate
            };
            return item;
        };

        init();
        function init() {
            handlerList = [];
        }

        this.Clear = function () {
            init();
        };

        this.Handler = function () {
            return handlerList;
        };

        /**
        * add Handle
        * @param {Number} handleType: VIZCore.Enum.HANDLER_TYPE
        * @returns {Data.HandlerItem} item
        */
        this.Add = function (handleType) {

            let item = view.Data.HandlerItem();
            item.itemType = handleType;
            handlerList.push(item);

            return item;
        };

        /**
       * get Handle
       * @param {Data.UUIDv4} id: id
       * @returns {Data.HandlerItem} item
       */
        this.GetHandle = function (id) {
            let item = undefined;
            for (let ii = 0; ii < handlerList.length; ii++) {
                if (handlerList[ii].id !== id)
                    continue;

                item = handlerList[ii];
            }
            return item;
        };

        /**
       * delete Handler
       * @param {Data.UUIDv4} id: id
       */
        this.Delete = function (id) {
            let idx = -1;
            for (let ii = 0; ii < handlerList.length; ii++) {
                if (handlerList[ii].id !== id)
                    continue;

                idx = ii;
                break;
            }

            if (idx >= 0) {
                handlerList.splice(idx, 1);
            }
        };

        /**
       * clear State
       * handle.state = VIZCore.Enum.HANDLE_MOUSE_STATE.NONE;
       */
        this.ClearState = function () {
            for (let ii = 0; ii < handlerList.length; ii++) {
                let item = handlerList[ii];

                //초기화.
                item.state = VIZCore.Enum.HANDLE_MOUSE_STATE.NONE;
                //item.visible = false;
                item.axis.x.select = false;
                item.axis.y.select = false;
                item.axis.z.select = false;
                item.panel.xy.select = false;
                item.panel.yz.select = false;
                item.panel.zx.select = false;
                item.rotate.x.select = false;
                item.rotate.y.select = false;
                item.rotate.z.select = false;
                item.sphere.select = false;
            }
        };

        /**
        * clear State By id
        * handle.state = VIZCore.Enum.HANDLE_MOUSE_STATE.NONE;
        * @param {Data.UUIDv4} id: id
        */
        this.ClearStateById = function (id) {

            let item = view.Handle.GetHandle(id);

            if (item === undefined)
                return;

            //초기화.
            item.state = VIZCore.Enum.HANDLE_MOUSE_STATE.NONE;
            //item.visible = false;
            item.axis.x.select = false;
            item.axis.y.select = false;
            item.axis.z.select = false;
            item.panel.xy.select = false;
            item.panel.yz.select = false;
            item.panel.zx.select = false;
            item.rotate.x.select = false;
            item.rotate.y.select = false;
            item.rotate.z.select = false;
            item.sphere.select = false;
        };

        /**
        * Handle VISIBLE
        * @param {Data.UUIDv4()} id: id
        * @param {Boolean} enable: visible Enable (true = 보이기, false = 숨기기)
        * @returns {Number} min Distance
        */
        this.Visible = function (id, enable) {
            let item = view.Handle.GetHandle(id);
            if (item === undefined)
                return;

            item.visible = enable;
        };


        /**
         * 일정간격 핸들이동 데이터 초기화
         */
        this.ReleaseInterval = function() {
            MouseHandlePickTranslate.set(0, 0, 0);
            MouseHandlePickRotate.set(0, 0, 0);
        };

        /**
          * get pick handle
          * @param {Number} x: screen x
          * @param {Number} y: screen y
          * @returns {Data.HandlerItem} true : item, false : undefined
          */
        this.Pick = function (x, y) {

            if (handlerList.length <= 0)
                return undefined;

            //for (let ii = 0; ii < handlerList.length; ii++) {
            for (let ii = handlerList.length - 1; ii >= 0; ii--) {
                let item = handlerList[ii];

                if (item.object === undefined)
                    continue;
                if (!item.enable)
                    continue;

                let resultPick = scope.PickItem(item, x, y);
                if (resultPick !== undefined)
                    return resultPick;

            }
            return undefined;
        };


        /**
          * get pick handle
          * @param {Data.HandlerItem} item: handler
          * @param {Number} x: screen x
          * @param {Number} y: screen y
          * @returns {Data.HandlerItem} true : item, false : undefined
          */
        this.PickItem = function (item, x, y) {

            if (item.object === undefined)
                return undefined;
            if (!item.enable)
                return undefined;

            let matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.matMV);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
            matMVMatrix.setPosition(new VIZCore.Vector3());

            //pick 거리추가
            const pickOffset = 5;

            let mouseScreen = new VIZCore.Vector3(x, y, 0);

            let handleCenter = new VIZCore.Vector3().copy(item.center);
            //handleCenter = view.Camera.world2ScreenWithMatrix(matMVP, handleCenter);
            let viewLength = item.style.length;
            let viewRadius = item.style.radius;

            {
                let worldZero = new VIZCore.Vector3().copy(item.center);
                let itemScreenLength = new VIZCore.Vector3().copy(item.center).add(new VIZCore.Vector3(item.style.length, 0, 0));
                let itemScreenRadius = new VIZCore.Vector3().copy(item.center).add(new VIZCore.Vector3(item.style.radius, 0, 0));
                worldZero = view.Camera.world2ScreenWithMatrix(matMVP, worldZero);

                itemScreenLength = new VIZCore.Vector3().copy(worldZero).add(new VIZCore.Vector3(item.style.length, 0, 0));
                itemScreenRadius = new VIZCore.Vector3().copy(worldZero).add(new VIZCore.Vector3(item.style.radius, 0, 0));

                let itemWorldLength = view.Camera.screen2WorldWithMatrix(matMVP, itemScreenLength);
                let itemWorldRadius = view.Camera.screen2WorldWithMatrix(matMVP, itemScreenRadius);

                viewLength = itemWorldLength.sub(handleCenter).length();
                viewRadius = itemWorldRadius.sub(handleCenter).length();
            }

            //let vXAxis = new VIZCore.Vector3(1.0, 0.0, 0.0);
            let vXAxis = new VIZCore.Vector3().copy(item.axis.x.normal);
            //vXAxis = vXAxis.applyMatrix4(matMVMatrix);
            //vXAxis.y *= -1.0;
            //let vYAxis = new VIZCore.Vector3(0.0, 1.0, 0.0);
            let vYAxis = new VIZCore.Vector3().copy(item.axis.y.normal);
            //vYAxis = vYAxis.applyMatrix4(matMVMatrix);
            //vYAxis.y *= -1.0;
            //let vZAxis = new VIZCore.Vector3(0.0, 0.0, 1.0);
            let vZAxis = new VIZCore.Vector3().copy(item.axis.z.normal);
            //vZAxis = vZAxis.applyMatrix4(matMVMatrix);
            //vZAxis.y *= -1.0;
            const lineLength = viewLength;
            const coneLength = viewLength * 1.2;

            const lineRadius = viewRadius;
            const coneRadius = viewRadius * 1.5;

            const panelLength = viewLength * 0.3;

            const circleLength = viewLength * 0.8;
            const circleRadius = viewRadius * 5.0;

            const sphereRadius = viewRadius * 2.5;

            let screenHandleCenter = new VIZCore.Vector3().copy(item.center);
            screenHandleCenter = view.Camera.world2ScreenWithMatrix(matMVP, screenHandleCenter);
            screenHandleCenter.z = 0;

            let worldRay1, worldRay2;
            {
                let mouse;
                // if (view.Camera.perspectiveView)
                //     mouse = new VIZCore.Vector3(x, y, 0.0);

                // else
                //     mouse = new VIZCore.Vector3(x, y, -1.0);

                mouse = new VIZCore.Vector3(x, y, -1.0);
                let screenRay1 = new VIZCore.Vector3(mouse.x, mouse.y, mouse.z);
                let screenRay2 = new VIZCore.Vector3(mouse.x, mouse.y, 1.0);
                worldRay1 = view.Camera.screen2WorldWithMatrix(view.Camera.matMVP, screenRay1);
                worldRay2 = view.Camera.screen2WorldWithMatrix(view.Camera.matMVP, screenRay2);
            }

            //rotate 3, panel 3
            let itemSelectDistType = [0, 0, 0, 0, 0, 0];
            
            if (item.rotate.x.enable) {
                //item.rotate.x.select = true;
                let vPos = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().copy(vXAxis).multiplyScalar(circleLength));

                let pickResult = view.Util.LineToCircleIntersections(worldRay1, worldRay2, vPos, vXAxis, circleRadius);
                if (pickResult[0] === 1) {
                    itemSelectDistType[0] = pickResult[1].z;
                }
            }
            if (item.rotate.y.enable) {
                //item.rotate.y.select = true;
                let vPos = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().copy(vYAxis).multiplyScalar(circleLength));

                let pickResult = view.Util.LineToCircleIntersections(worldRay1, worldRay2, vPos, vYAxis, circleRadius);
                if (pickResult[0] === 1) {
                    itemSelectDistType[1] = pickResult[1].z;
                }
            }
            if (item.rotate.z.enable) {
                //item.rotate.z.select = true;
                let vPos = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().copy(vZAxis).multiplyScalar(circleLength));

                let pickResult = view.Util.LineToCircleIntersections(worldRay1, worldRay2, vPos, vZAxis, circleRadius);
                if (pickResult[0] === 1) {
                    itemSelectDistType[2] = pickResult[1].z;
                }
            }

            if (item.panel.xy.enable) {
                let vPos = [];
                let vPosIdx = [0, 3, 2, 3, 2, 1];

                vPos[0] = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().copy(vXAxis).multiplyScalar(panelLength));
                vPos[1] = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().copy(vYAxis).multiplyScalar(panelLength));
                vPos[2] = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().addVectors(
                        new VIZCore.Vector3().copy(vXAxis).multiplyScalar(panelLength),
                        new VIZCore.Vector3().copy(vYAxis).multiplyScalar(panelLength)
                    ));
                vPos[3] = new VIZCore.Vector3().copy(handleCenter);

                for (let i = 0; i < 2; i++) {
                    let pickResult = view.Util.LineToTriangleIntersections(worldRay1, worldRay2,
                        vPos[vPosIdx[(i * 3) + 0]], vPos[vPosIdx[(i * 3) + 1]], vPos[vPosIdx[(i * 3) + 2]]);
                    if (pickResult[0] === 1) {
                        ///let pickLength = (new VIZCore.Vector3().subVectors(worldRay1, result[1])).length();
                        //item.panel.xy.select = true;
                        //return item;
                        itemSelectDistType[3] = pickResult[1].z;
                    }
                }
            }

            if (item.panel.yz.enable) {
                let vPos = [];
                let vPosIdx = [0, 3, 2, 3, 2, 1];

                vPos[0] = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().copy(vYAxis).multiplyScalar(panelLength));
                vPos[1] = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().copy(vZAxis).multiplyScalar(panelLength));
                vPos[2] = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().addVectors(
                        new VIZCore.Vector3().copy(vYAxis).multiplyScalar(panelLength),
                        new VIZCore.Vector3().copy(vZAxis).multiplyScalar(panelLength)
                    ));
                vPos[3] = new VIZCore.Vector3().copy(handleCenter);

                for (let i = 0; i < 2; i++) {
                    let pickResult = view.Util.LineToTriangleIntersections(worldRay1, worldRay2,
                        vPos[vPosIdx[(i * 3) + 0]], vPos[vPosIdx[(i * 3) + 1]], vPos[vPosIdx[(i * 3) + 2]]);
                    if (pickResult[0] === 1) {
                        ///let pickLength = (new VIZCore.Vector3().subVectors(worldRay1, result[1])).length();
                        //item.panel.yz.select = true;
                        //return item;
                        itemSelectDistType[4] = pickResult[1].z;
                    }
                }
            }

            if (item.panel.zx.enable) {
                let vPos = [];
                let vPosIdx = [0, 3, 2, 3, 2, 1];

                vPos[0] = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().copy(vZAxis).multiplyScalar(panelLength));
                vPos[1] = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().copy(vXAxis).multiplyScalar(panelLength));
                vPos[2] = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().addVectors(
                        new VIZCore.Vector3().copy(vZAxis).multiplyScalar(panelLength),
                        new VIZCore.Vector3().copy(vXAxis).multiplyScalar(panelLength)
                    ));
                vPos[3] = new VIZCore.Vector3().copy(handleCenter);

                for (let i = 0; i < 2; i++) {
                    let pickResult = view.Util.LineToTriangleIntersections(worldRay1, worldRay2,
                        vPos[vPosIdx[(i * 3) + 0]], vPos[vPosIdx[(i * 3) + 1]], vPos[vPosIdx[(i * 3) + 2]]);
                    if (pickResult[0] === 1) {
                        ///let pickLength = (new VIZCore.Vector3().subVectors(worldRay1, result[1])).length();
                        // item.panel.zx.select = true;
                        // return item;
                        itemSelectDistType[5] = pickResult[1].z;

                    }
                }
            }

            //회전 및 패널 이동 중 가장 가까운 개체 검색하여 선택처리
            {
                let minDistTypeIdx = -1;
                for(let i = 0 ; i < 6; i++) {
                    if(itemSelectDistType[i] === 0) continue;
                    if(minDistTypeIdx < 0)
                        minDistTypeIdx = i;
                    else if(itemSelectDistType[i] > itemSelectDistType[minDistTypeIdx])
                        minDistTypeIdx = i;
                }

                if(minDistTypeIdx >= 0) {
                    if(minDistTypeIdx === 0) {
                        item.rotate.x.select = true;
                        return item;
                    }
                    else if(minDistTypeIdx === 1) {
                        item.rotate.y.select = true;
                        return item;
                    }
                    else if(minDistTypeIdx === 2) {
                        item.rotate.z.select = true;
                        return item;
                    }
                    else if(minDistTypeIdx === 3) {
                        item.panel.xy.select = true;
                        return item;
                    }
                    else if(minDistTypeIdx === 4) {
                        item.panel.yz.select = true;
                        return item;
                    }
                    else if(minDistTypeIdx === 5) {
                        item.panel.zx.select = true;
                        return item;
                    }
                }
            }
            
            if (item.axis.x.enable) {
                //let vAxisPos = new VIZCore.Vector3().addVectors(handleCenter,
                //    new VIZCore.Vector3().copy(vXAxis).multiplyScalar(lineLength));
                let vAxisConePos = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().copy(vXAxis).multiplyScalar(coneLength));
                vAxisConePos = view.Camera.world2ScreenWithMatrix(matMVP, vAxisConePos);
                vAxisConePos.z = 0;

                if (view.Util.Point2LineDistance(mouseScreen, screenHandleCenter, vAxisConePos) < item.style.radius + pickOffset) {
                    item.axis.x.select = true;
                    return item;
                }
            }
            if (item.axis.y.enable) {
                let vAxisConePos = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().copy(vYAxis).multiplyScalar(coneLength));
                vAxisConePos = view.Camera.world2ScreenWithMatrix(matMVP, vAxisConePos);
                vAxisConePos.z = 0;

                if (view.Util.Point2LineDistance(mouseScreen, screenHandleCenter, vAxisConePos) < item.style.radius + pickOffset) {
                    item.axis.y.select = true;
                    return item;
                }
            }
            if (item.axis.z.enable) {
                let vAxisConePos = new VIZCore.Vector3().addVectors(handleCenter,
                    new VIZCore.Vector3().copy(vZAxis).multiplyScalar(coneLength));
                vAxisConePos = view.Camera.world2ScreenWithMatrix(matMVP, vAxisConePos);
                vAxisConePos.z = 0;

                if (view.Util.Point2LineDistance(mouseScreen, screenHandleCenter, vAxisConePos) < item.style.radius + pickOffset) {
                    item.axis.z.select = true;
                    return item;
                }
            }

            if (item.sphere.enable) {
                if (new VIZCore.Vector3(x, y, 0).sub(screenHandleCenter).length() < item.style.radius) {

                    item.sphere.select = true;
                    return item;
                }
            }

            return undefined;
        };

        /**
         * 마우스 이동 값으로 핸들 이동
         * @param {Data.HandlerItem} item: handler
         * @param {Number} x: screen x
         * @param {Number} y: screen y
         * @param {Number} prevX: 이동 전 screen x
         * @param {Number} prevY: 이동 전 screen y
         * @param {boolean} bInterval : 핸들 이동 간격단위 적용 여부
         * @returns {scope.ResultTransformInfoItem}
         */
        this.UpdateTransformByMouseMove = function (item, x, y, prevX, prevY, bInterval) {
            let dx = x - prevX;
            let dy = y - prevY;

            if (dx === 0 && dy === 0)
                return undefined;

            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

            let vCenter = new VIZCore.Vector3().copy(item.center);
            let vScreenCenter = view.Camera.world2ScreenWithMatrix(matMVP, vCenter);
            let vMoveScreenCenter = new VIZCore.Vector3(vScreenCenter.x + dx, vScreenCenter.y + dy, vScreenCenter.z);
            let vMovePos = view.Camera.screen2WorldWithMatrix(matMVP, vMoveScreenCenter);
            let vMoveVector = new VIZCore.Vector3().subVectors(vMovePos, item.center);
            let fMoveLen = new VIZCore.Vector3().copy(vMoveVector).length();
            let vMoveNormal = new VIZCore.Vector3().copy(vMoveVector).normalize();

            let vXAxis = new VIZCore.Vector3().copy(item.axis.x.normal);
            let vYAxis = new VIZCore.Vector3().copy(item.axis.y.normal);
            let vZAxis = new VIZCore.Vector3().copy(item.axis.z.normal);

            let matTransform = new VIZCore.Matrix4();
            let vObjectMove = new VIZCore.Vector3();
            let vObjectRotate = new VIZCore.Vector3();

            if (item.axis.x.enable && item.axis.x.select) {

                let fDot = vXAxis.dot(vMoveNormal);
                let vTranslate = new VIZCore.Vector3().copy(vXAxis);
                let fCurrentLen = fMoveLen * fDot;
                //vTranslate.multiplyScalar(fMoveLen).multiplyScalar(fDot);
               
                if(scope.UseHandleInterval && bInterval) {
                    let fValue = Math.round((MouseHandlePickTranslate.x + fCurrentLen) / scope.MouseHandleTranslateInterval);
                    fValue *= scope.MouseHandleTranslateInterval;
                    
                    MouseHandlePickTranslate.x += (fCurrentLen - fValue);
                    fCurrentLen = fValue;
                }
                vTranslate.multiplyScalar(fCurrentLen);

                item.center.add(vTranslate);
                matTransform.makeTranslation(vTranslate.x, vTranslate.y, vTranslate.z);

                vObjectMove.copy(vTranslate);
            }
            else if (item.axis.y.enable && item.axis.y.select) {
                let fDot = vYAxis.dot(vMoveNormal);
                let vTranslate = new VIZCore.Vector3().copy(vYAxis);
                //vTranslate.multiplyScalar(fMoveLen).multiplyScalar(fDot);
                let fCurrentLen = fMoveLen * fDot;
               
                if(scope.UseHandleInterval && bInterval) {
                    let fValue = Math.round((MouseHandlePickTranslate.y + fCurrentLen) / scope.MouseHandleTranslateInterval);
                    fValue *= scope.MouseHandleTranslateInterval;
                    
                    MouseHandlePickTranslate.y += (fCurrentLen - fValue);
                    fCurrentLen = fValue;
                }
                vTranslate.multiplyScalar(fCurrentLen);

                item.center.add(vTranslate);
                matTransform.makeTranslation(vTranslate.x, vTranslate.y, vTranslate.z);

                vObjectMove.copy(vTranslate);
            }
            else if (item.axis.z.enable && item.axis.z.select) {
                let fDot = vZAxis.dot(vMoveNormal);
                let vTranslate = new VIZCore.Vector3().copy(vZAxis);
                let fCurrentLen = fMoveLen * fDot;
                //vTranslate.multiplyScalar(fMoveLen).multiplyScalar(fDot);
               
                if(scope.UseHandleInterval && bInterval) {
                    let fValue = Math.round((MouseHandlePickTranslate.z + fCurrentLen) / scope.MouseHandleTranslateInterval);
                    fValue *= scope.MouseHandleTranslateInterval;
                    
                    MouseHandlePickTranslate.x += (fCurrentLen - fValue);
                    fCurrentLen = fValue;
                }
                vTranslate.multiplyScalar(fCurrentLen);

                item.center.add(vTranslate);
                matTransform.makeTranslation(vTranslate.x, vTranslate.y, vTranslate.z);

                vObjectMove.copy(vTranslate);
            }
            else if (item.panel.xy.enable && item.panel.xy.select) {
                let currentPlane = new VIZCore.Plane(vZAxis, vZAxis.dot(item.center));

                let targetPos = new VIZCore.Vector3();
                let targetMovePos = new VIZCore.Vector3();
                currentPlane.projectPoint(new VIZCore.Vector3().copy(item.center), targetPos);
                currentPlane.projectPoint(new VIZCore.Vector3().copy(vMovePos), targetMovePos);
                let vTranslate = new VIZCore.Vector3(targetMovePos.x - targetPos.x, targetMovePos.y - targetPos.y, targetMovePos.z - targetPos.z);

                item.center.add(vTranslate);
                matTransform.makeTranslation(vTranslate.x, vTranslate.y, vTranslate.z);

                vObjectMove.copy(vTranslate);
            }
            else if (item.panel.yz.enable && item.panel.yz.select) {
                let currentPlane = new VIZCore.Plane(vXAxis, vXAxis.dot(item.center));

                let targetPos = new VIZCore.Vector3();
                let targetMovePos = new VIZCore.Vector3();
                currentPlane.projectPoint(new VIZCore.Vector3().copy(item.center), targetPos);
                currentPlane.projectPoint(new VIZCore.Vector3().copy(vMovePos), targetMovePos);
                let vTranslate = new VIZCore.Vector3(targetMovePos.x - targetPos.x, targetMovePos.y - targetPos.y, targetMovePos.z - targetPos.z);

                item.center.add(vTranslate);
                matTransform.makeTranslation(vTranslate.x, vTranslate.y, vTranslate.z);

                vObjectMove.copy(vTranslate);
            }
            else if (item.panel.zx.enable && item.panel.zx.select) {
                let currentPlane = new VIZCore.Plane(vYAxis, vYAxis.dot(item.center));

                let targetPos = new VIZCore.Vector3();
                let targetMovePos = new VIZCore.Vector3();
                currentPlane.projectPoint(new VIZCore.Vector3().copy(item.center), targetPos);
                currentPlane.projectPoint(new VIZCore.Vector3().copy(vMovePos), targetMovePos);
                let vTranslate = new VIZCore.Vector3(targetMovePos.x - targetPos.x, targetMovePos.y - targetPos.y, targetMovePos.z - targetPos.z);

                item.center.add(vTranslate);
                matTransform.makeTranslation(vTranslate.x, vTranslate.y, vTranslate.z);

                vObjectMove.copy(vTranslate);
            }
            else if (item.rotate.x.enable && item.rotate.x.select) {

                let fRotate = (dx + dy) / 100.0;

                if(scope.UseHandleInterval && bInterval) {
                    let fAngle = fRotate / Math.PI * 180.0;
                    let fValue = Math.round((MouseHandlePickRotate.x + fAngle) / scope.MouseHandleRotateInerval);
                    fValue *= scope.MouseHandleRotateInerval;
                    fRotate = fValue * Math.PI / 180.0;

                    MouseHandlePickRotate.x += (fAngle - fValue);
                }

                //matPreTrans.SetTranslate(-m_vRotateCenter.x, -m_vRotateCenter.y, -m_vRotateCenter.z);
                //matRotate.SetMatrixRotateAxis(m_vSelHMAxisDir, fRotate);
                //matPostTrans.SetTranslate(m_vRotateCenter.x, m_vRotateCenter.y, m_vRotateCenter.z);
                //matTrans = matPostTrans * matRotate*matPreTrans;

                //matTransform.makeRotationAxis2(vXAxis, fRotate);

                let matZero = new VIZCore.Matrix4().makeTranslation(-item.center.x, -item.center.y, -item.center.z);
                let matCetner = new VIZCore.Matrix4().makeTranslation(item.center.x, item.center.y, item.center.z);
                let matRotate = new VIZCore.Matrix4().makeRotationAxis2(vXAxis, fRotate);
                
                //matTransform = matTranslate * matRotate * matZero;
                let matTrans = new VIZCore.Matrix4().multiplyMatrices(matCetner, matRotate);
                matTransform = new VIZCore.Matrix4().multiplyMatrices(matTrans, matZero);

                vObjectRotate.x = fRotate;
            }
            else if (item.rotate.y.enable && item.rotate.y.select) {

                let fRotate = (dx + dy) / 100.0;

                if(scope.UseHandleInterval && bInterval) {
                    let fAngle = fRotate / Math.PI * 180.0;
                    let fValue = Math.round((MouseHandlePickRotate.y + fAngle) / scope.MouseHandleRotateInerval);
                    fValue *= scope.MouseHandleRotateInerval;
                    fRotate = fValue * Math.PI / 180.0;

                    MouseHandlePickRotate.y += (fAngle - fValue);
                }

                let matZero = new VIZCore.Matrix4().makeTranslation(-item.center.x, -item.center.y, -item.center.z);
                let matCetner = new VIZCore.Matrix4().makeTranslation(item.center.x, item.center.y, item.center.z);
                let matRotate = new VIZCore.Matrix4().makeRotationAxis2(vYAxis, fRotate);
                
                //matTransform = matTranslate * matRotate * matZero;
                let matTrans = new VIZCore.Matrix4().multiplyMatrices(matCetner, matRotate);
                matTransform = new VIZCore.Matrix4().multiplyMatrices(matTrans, matZero);

                vObjectRotate.y = fRotate;
            }
            else if (item.rotate.z.enable && item.rotate.z.select) {

                let fRotate = (dx + dy) / 100.0;

                if(scope.UseHandleInterval && bInterval) {
                    let fAngle = fRotate / Math.PI * 180.0;
                    let fValue = Math.round((MouseHandlePickRotate.z + fAngle) / scope.MouseHandleRotateInerval);
                    fValue *= scope.MouseHandleRotateInerval;
                    fRotate = fValue * Math.PI / 180.0;

                    MouseHandlePickRotate.z += (fAngle - fValue);
                }

                let matZero = new VIZCore.Matrix4().makeTranslation(-item.center.x, -item.center.y, -item.center.z);
                let matCetner = new VIZCore.Matrix4().makeTranslation(item.center.x, item.center.y, item.center.z);
                let matRotate = new VIZCore.Matrix4().makeRotationAxis2(vZAxis, fRotate);
                
                //matTransform = matTranslate * matRotate * matZero;
                let matTrans = new VIZCore.Matrix4().multiplyMatrices(matCetner, matRotate);
                matTransform = new VIZCore.Matrix4().multiplyMatrices(matTrans, matZero);

                vObjectRotate.z = fRotate;
            }

            return scope.ResultTransformInfoItem(matTransform, vObjectMove, vObjectRotate);
        };


        this.Render = function () {
            //Control 기본 상태가 아닌경우 Handler를 그리지 않음.
            if (view.Control.GetMode() !== VIZCore.Enum.CONTROL_STATE.NORMAL)
                return;
            if (handlerList.length <= 0)
                return;

            //let matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
            //const matMVP = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, matMVMatrix);
            //matMVMatrix.setPosition(new VIZCore.Vector3());
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

            //view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.PHONG);
            view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.BASIC2D);

            //gl.enable(gl.DEPTH_TEST);
            //gl.enable(gl.BLEND);
            view.gl.enable(view.gl.BLEND);

            view.Shader.SetGLLight();
            view.Shader.SetClipping(undefined); //단면처리 제외

            //view.Shader.SetMatrix(view.Camera.screenProjectionMatrix, new VIZCore.Matrix4());
            view.Shader.SetMatrix(matMVP, new VIZCore.Matrix4());

            for (let ii = 0; ii < handlerList.length; ii++) {
                //for (let ii = handlerList.length -1 ; ii >= 0; ii--) {
                if (!handlerList[ii].enable)
                    continue;
                if (!handlerList[ii].visible)
                    continue;
                if (handlerList[ii].object === undefined)
                    continue;

                const item = handlerList[ii];

                scope.RenderItem(item);
            } //for (let ii = 0; ii < handlerList.length; ii++)




            //gl.disable(gl.DEPTH_TEST);
            //gl.disable(gl.BLEND);
            view.Shader.EndShader();

        };

        ///**
        // * 
        // * @param {Data.HandlerItem()} item : handler
        // */
        this.RenderItem = function (item) {

            if (!item.enable)
                return;
            if (!item.visible)
                return;
            if (item.object === undefined)
                return;

            //let matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
            //const matMVP = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, matMVMatrix);
            //matMVMatrix.setPosition(new VIZCore.Vector3());
            let matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.matMV);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
            //matMVMatrix.setPosition(new VIZCore.Vector3());
            //view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.PHONG);
            //view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.BASIC2D);
            ////gl.enable(gl.DEPTH_TEST);
            ////gl.enable(gl.BLEND);
            //view.Shader.SetGLLight();
            //view.Shader.SetClipping(undefined); //단면처리 제외
            ////view.Shader.SetMatrix(view.Camera.screenProjectionMatrix, new VIZCore.Matrix4());
            //view.Shader.SetMatrix(matMVP, new VIZCore.Matrix4());
            let handleCenter = new VIZCore.Vector3().copy(item.center);
            //handleCenter = view.Camera.world2ScreenWithMatrix(matMVP, handleCenter);
            let viewLength = item.style.length;
            let viewRadius = item.style.radius;

            {
                let worldZero = new VIZCore.Vector3().copy(item.center);
                let itemScreenLength = new VIZCore.Vector3().copy(item.center).add(new VIZCore.Vector3(item.style.length, 0, 0));
                let itemScreenRadius = new VIZCore.Vector3().copy(item.center).add(new VIZCore.Vector3(item.style.radius, 0, 0));
                worldZero = view.Camera.world2ScreenWithMatrix(matMVP, worldZero);

                itemScreenLength = new VIZCore.Vector3().copy(worldZero).add(new VIZCore.Vector3(item.style.length, 0, 0));
                itemScreenRadius = new VIZCore.Vector3().copy(worldZero).add(new VIZCore.Vector3(item.style.radius, 0, 0));

                let itemWorldLength = view.Camera.screen2WorldWithMatrix(matMVP, itemScreenLength);
                let itemWorldRadius = view.Camera.screen2WorldWithMatrix(matMVP, itemScreenRadius);

                viewLength = itemWorldLength.sub(handleCenter).length();
                viewRadius = itemWorldRadius.sub(handleCenter).length();
            }

            //let vXAxis = new VIZCore.Vector3(1.0, 0.0, 0.0);
            let vXAxis = new VIZCore.Vector3().copy(item.axis.x.normal);
            //vXAxis = vXAxis.applyMatrix4(matMVMatrix);
            //vXAxis.y *= -1.0;
            //let vYAxis = new VIZCore.Vector3(0.0, 1.0, 0.0);
            let vYAxis = new VIZCore.Vector3().copy(item.axis.y.normal);
            //vYAxis = vYAxis.applyMatrix4(matMVMatrix);
            //vYAxis.y *= -1.0;
            //let vZAxis = new VIZCore.Vector3(0.0, 0.0, 1.0);
            let vZAxis = new VIZCore.Vector3().copy(item.axis.z.normal);
            //vZAxis = vZAxis.applyMatrix4(matMVMatrix);
            //vZAxis.y *= -1.0;
            const lineLength = viewLength;
            const coneLength = viewLength * 1.2;

            const lineRadius = viewRadius;
            const coneRadius = viewRadius * 1.5;

            const circleLength = viewLength * 0.8;
            const circleRadius = viewRadius * 5.0;

            const panelLength = viewLength * 0.3;

            const sphereRadius = viewRadius * 2.5;

            //Axis
            {
                if (item.axis.x.enable || item.axis.x.visible) {
                    let itemColor = new VIZCore.Color(255, 0, 0, 255);
                    //if (item.state !== VIZCore.Enum.HANDLE_MOUSE_STATE.NONE) {
                    if (item.axis.x.select) {
                        itemColor.g += 127;
                        itemColor.b += 127;
                    }

                    let currentGLColor = itemColor.glColor();
                    view.Shader.SetGLColor(currentGLColor.r, currentGLColor.g, currentGLColor.b, currentGLColor.a);

                    let vAxisPos = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vXAxis).multiplyScalar(lineLength));
                    let vAxisConePos = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vXAxis).multiplyScalar(coneLength));

                    view.Renderer.Util.DrawCylinder3D(handleCenter, vAxisPos, lineRadius);
                    view.Renderer.Util.DrawCone3D(vAxisPos, vAxisConePos, coneRadius);
                }

                if (item.axis.y.enable || item.axis.y.visible) {
                    let itemColor = new VIZCore.Color(0, 255, 0, 255);
                    //if (item.state !== VIZCore.Enum.HANDLE_MOUSE_STATE.NONE) {
                    if (item.axis.y.select) {
                        itemColor.r += 127;
                        itemColor.b += 127;
                    }

                    let currentGLColor = itemColor.glColor();
                    view.Shader.SetGLColor(currentGLColor.r, currentGLColor.g, currentGLColor.b, currentGLColor.a);

                    let vAxisPos = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vYAxis).multiplyScalar(lineLength));
                    let vAxisConePos = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vYAxis).multiplyScalar(coneLength));

                    view.Renderer.Util.DrawCylinder3D(handleCenter, vAxisPos, lineRadius);
                    view.Renderer.Util.DrawCone3D(vAxisPos, vAxisConePos, coneRadius);
                }

                if (item.axis.z.enable || item.axis.z.visible) {
                    let itemColor = new VIZCore.Color(100, 100, 255, 255);
                    //if (item.state !== VIZCore.Enum.HANDLE_MOUSE_STATE.NONE) {
                    if (item.axis.z.select) {
                        itemColor.r += 80;
                        itemColor.g += 80;
                    }

                    let currentGLColor = itemColor.glColor();
                    view.Shader.SetGLColor(currentGLColor.r, currentGLColor.g, currentGLColor.b, currentGLColor.a);

                    let vAxisPos = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vZAxis).multiplyScalar(lineLength));
                    let vAxisConePos = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vZAxis).multiplyScalar(coneLength));

                    view.Renderer.Util.DrawCylinder3D(handleCenter, vAxisPos, lineRadius);
                    view.Renderer.Util.DrawCone3D(vAxisPos, vAxisConePos, coneRadius);

                }
            }

            
            //rotate
            {
                if (item.rotate.x.enable || item.rotate.x.visible) {
                    let itemColor = new VIZCore.Color(255, 0, 0, 100);
                    if (item.itemType === VIZCore.Enum.HANDLER_TYPE.CLIPPING)
                        itemColor.a = 200;

                    if (item.rotate.x.select) {
                        itemColor.g += 127;
                        itemColor.b += 127;
                    }

                    let currentGLColor = itemColor.glColor();
                    view.Shader.SetGLColor(currentGLColor.r, currentGLColor.g, currentGLColor.b, currentGLColor.a);

                    let vPos1 = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vXAxis).multiplyScalar(circleLength));

                    view.Renderer.Util.DrawCircle3D(vPos1, vXAxis, circleRadius);
                }

                if (item.rotate.y.enable || item.rotate.y.visible) {
                    let itemColor = new VIZCore.Color(0, 255, 0, 100);
                    if (item.itemType === VIZCore.Enum.HANDLER_TYPE.CLIPPING)
                        itemColor.a = 200;

                    if (item.rotate.y.select) {
                        itemColor.r += 127;
                        itemColor.b += 127;
                    }

                    let currentGLColor = itemColor.glColor();
                    view.Shader.SetGLColor(currentGLColor.r, currentGLColor.g, currentGLColor.b, currentGLColor.a);

                    let vPos1 = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vYAxis).multiplyScalar(circleLength));

                    view.Renderer.Util.DrawCircle3D(vPos1, vYAxis, circleRadius);
                }

                if (item.rotate.z.enable || item.rotate.z.visible) {
                    let itemColor = new VIZCore.Color(100, 100, 255, 100);         
                    if (item.itemType === VIZCore.Enum.HANDLER_TYPE.CLIPPING)
                        itemColor.a = 200;

                    //if (item.state !== VIZCore.Enum.HANDLE_MOUSE_STATE.NONE) {
                    if (item.rotate.z.select) {
                        itemColor.r += 80;
                        itemColor.g += 80;
                    }

                    let currentGLColor = itemColor.glColor();
                    view.Shader.SetGLColor(currentGLColor.r, currentGLColor.g, currentGLColor.b, currentGLColor.a);

                    let vPos1 = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vZAxis).multiplyScalar(circleLength));

                    view.Renderer.Util.DrawCircle3D(vPos1, vZAxis, circleRadius);
                }
            }

            //panel
            {
                if (item.panel.xy.enable || item.panel.xy.visible) {
                    let itemColor = new VIZCore.Color(100, 100, 255, 100);
                    //if (item.state !== VIZCore.Enum.HANDLE_MOUSE_STATE.NONE) {
                    if (item.panel.xy.select) {
                        itemColor.r += 80;
                        itemColor.g += 80;
                        itemColor.a += 100;
                    }

                    let currentGLColor = itemColor.glColor();
                    view.Shader.SetGLColor(currentGLColor.r, currentGLColor.g, currentGLColor.b, currentGLColor.a);

                    let vPos1 = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vXAxis).multiplyScalar(panelLength));
                    let vPos2 = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vYAxis).multiplyScalar(panelLength));
                    let vPos3 = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().addVectors(
                            new VIZCore.Vector3().copy(vXAxis).multiplyScalar(panelLength),
                            new VIZCore.Vector3().copy(vYAxis).multiplyScalar(panelLength)
                        ));
                    let vPos4 = new VIZCore.Vector3().copy(handleCenter);

                    view.Renderer.Util.DrawRectangle3D(vPos1, vPos4, vPos3, vPos2);
                }

                if (item.panel.yz.enable || item.panel.yz.visible) {
                    let itemColor = new VIZCore.Color(255, 0, 0, 100);
                    //if (item.state !== VIZCore.Enum.HANDLE_MOUSE_STATE.NONE) {
                    if (item.panel.yz.select) {
                        itemColor.g += 127;
                        itemColor.b += 127;
                        itemColor.a += 100;
                    }

                    let currentGLColor = itemColor.glColor();
                    view.Shader.SetGLColor(currentGLColor.r, currentGLColor.g, currentGLColor.b, currentGLColor.a);

                    let vPos1 = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vYAxis).multiplyScalar(panelLength));
                    let vPos2 = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vZAxis).multiplyScalar(panelLength));
                    let vPos3 = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().addVectors(
                            new VIZCore.Vector3().copy(vYAxis).multiplyScalar(panelLength),
                            new VIZCore.Vector3().copy(vZAxis).multiplyScalar(panelLength)
                        ));
                    let vPos4 = new VIZCore.Vector3().copy(handleCenter);

                    view.Renderer.Util.DrawRectangle3D(vPos1, vPos4, vPos3, vPos2);
                }

                if (item.panel.zx.enable || item.panel.zx.visible) {
                    let itemColor = new VIZCore.Color(0, 255, 0, 100);
                    //if (item.state !== VIZCore.Enum.HANDLE_MOUSE_STATE.NONE) {
                    if (item.panel.zx.select) {
                        itemColor.r += 127;
                        itemColor.b += 127;
                        itemColor.a += 100;
                    }

                    let currentGLColor = itemColor.glColor();
                    view.Shader.SetGLColor(currentGLColor.r, currentGLColor.g, currentGLColor.b, currentGLColor.a);

                    let vPos1 = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vZAxis).multiplyScalar(panelLength));
                    let vPos2 = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().copy(vXAxis).multiplyScalar(panelLength));
                    let vPos3 = new VIZCore.Vector3().addVectors(handleCenter,
                        new VIZCore.Vector3().addVectors(
                            new VIZCore.Vector3().copy(vZAxis).multiplyScalar(panelLength),
                            new VIZCore.Vector3().copy(vXAxis).multiplyScalar(panelLength)
                        ));
                    let vPos4 = new VIZCore.Vector3().copy(handleCenter);

                    view.Renderer.Util.DrawRectangle3D(vPos1, vPos4, vPos3, vPos2);
                }
            }


            //sphere
            if ( item.sphere.enable ||
                (item.axis.x.enable && item.axis.y.enable && item.axis.z.enable) || (item.axis.x.visible && item.axis.y.visible && item.axis.z.visible)) {
                let sphereColor = new VIZCore.Color(127, 127, 127, 255);
                //if (item.state !== VIZCore.Enum.HANDLE_MOUSE_STATE.NONE) {
                if (item.sphere.select) {
                    sphereColor.r += 80;
                    sphereColor.g += 80;
                    sphereColor.b += 80;
                }
                let currentGLColor = sphereColor.glColor();
                view.Shader.SetGLColor(currentGLColor.r, currentGLColor.g, currentGLColor.b, currentGLColor.a);

                view.Renderer.Util.DrawSphere3D(handleCenter, sphereRadius);
            }

            //gl.disable(gl.DEPTH_TEST);
            //gl.disable(gl.BLEND);
            //view.Shader.EndShader();
        };
    }
}

export default Handle;