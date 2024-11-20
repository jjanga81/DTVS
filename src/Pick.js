/**
 * @author ssjo@softhills.net
 */

 class Pick {
    constructor(view, VIZCore) {

        
        // Private
        let scope = this;

        //Preselect 개체 
        // [0] = 개체, [1] = Point, [2] = Line, [3] = Circle
        this.PreselectObjects = [];
        
        this.PreselectEdges = [];   //Data.PreselectEdgeItem
        let tablePreselectData = [];    //해당하는 색상의 데이터 값 관리 Data.PreselectEdgeColorTableItem 


        //Preselect render Option
        let renderPreselectColor = new VIZCore.Color(0, 0, 0, 255);
        let renderPreselectPickColor = new VIZCore.Color(0, 200, 0, 255);
        let renderPointSize = 10.0;
        let renderLineWidth = 3.0;


        //Control
        this.EnableControlPicker = false;   //컨트롤 선택 활성화 여부
        let drawingControlPicker = false;   //화면에 그려져 있는지 확인
        let controlPickerPosition = new VIZCore.Vector3(); //위치

        let controlPickerScale = 1.0;
        let controlPickerFixSize = 72; //고정형 크기 (-1 인 경우 화면 비례)
        let controlPickerGap = 80; // Picker gap

        //Texture 로딩 완료 여부확인
        let setUpPickerImageLoad = false;
        let pickerTexture = undefined;

        this.EnableControlMove = true;  // Move control
        this.EnableControlOk = false;   // OK control
        this.EnableControlCancel = false; //Cancel control



        init();
        /**
        * 코드 초기화
        */
        function init() {

            for(let i = 0 ; i < 4 ; i++) {            
                scope.PreselectObjects[i] = view.Data.Object3D();
            }

            
        };
        
        // Get Body Pick Screen Point
        // @param {Number} id : body id
        // @param {Number} x : screen x
        // @param {Number} y : screen y
        // @returns {Data.PickDataItem()} 
        this.GetPickByBody = function (id, x, y) {       
            let mouse;
            if (view.Camera.perspectiveView)
                mouse = new VIZCore.Vector3(x, y, 0.0);
            else
                mouse = new VIZCore.Vector3(x, y, -1.0);

            //let screenRay1 = new VIZCore.Vector3(event.clientX, gl.canvas.height - event.clientY, mouse.z);
            //let screenRay2 = new VIZCore.Vector3(event.clientX, gl.canvas.height - event.clientY, 1.0);

            let screenRay1 = new VIZCore.Vector3(mouse.x, mouse.y, mouse.z);
            let screenRay2 = new VIZCore.Vector3(mouse.x, mouse.y, 1.0);

            //const matMVMatrix = new VIZCore.Matrix4();
            //matMVMatrix.copy(view.Camera.cameraMatrix);
            //const matMVP = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, matMVMatrix);

            let worldRay1, worldRay2;
            worldRay1 = view.Camera.screen2WorldWithMatrix(view.Camera.matMVP, screenRay1);
            worldRay2 = view.Camera.screen2WorldWithMatrix(view.Camera.matMVP, screenRay2);

            let result = scope.GetWorldPickByID(id, worldRay1, worldRay2);
            return result;
        };   

        /**
         * Body의 Cache 정보 확인 후 Process 실행
         * @param {Number} bodyId  : bodyId
         * @param {Function(Number)}} process (bodyId)
         */
        this.GetBodyCacheDownload = function (bodyId, process) {
            if (view.MeshBlock.IsCacheBlockDownloading()) return;
            if (process === undefined) return;

            let bodies = view.Data.GetBody(bodyId);
            if(bodies === undefined || bodies.length === 0) return;

            //다중 화면 화면 Control Unlock 해제
            let lastCameraIdx = view.CameraIndex;
            let funLastCameraControlUnlock = function() {
                view.MultiView[lastCameraIdx].Unlock();
            };

            let body = bodies[0];
            //다운로드 완료시 콜백
            let callPick = function (objects) {
              
                //다운로드 종료시 process실행
                if (view.MeshBlock.IsCacheBlockDownloading() === false) {
                    process(bodyId);
                    //view.Control.Unlock(); //control 잠금해제.
                    funLastCameraControlUnlock();
                }
            };
            
            //control 잠금.
            view.Control.Lock();

            //Cache가 없는 경우 재다운로드
            let listFindUrl = [];
            if (!body.object.flag.cache || body.object.attribs.a_index.buffer === null) {
                let getObjectUrl = function (value, key, map) {
                    for (let ii = 0; ii < value.length; ii++) {
                        if (body.object.uuid !== value[ii].uuid) continue;

                        listFindUrl.push(key);
                        break;
                    }
                };
                view.Data.ObjectMap.forEach(getObjectUrl);

                if (listFindUrl.length > 1)
                    console.log('[Shw3DCore] URL cache Num : ' + listFindUrl.length);

                view.MeshBlock.CacheBlock(listFindUrl, callPick);
            } else {
                //데이터가 존재함으로 기존 방식 그래도 처리
                setTimeout(callPick, 1);
            }
        };

        // 해당 위치의 Body를 찾고, Cache 데이터가 없는 경우
        // 다시 다운로드하여 pickProcess 실행 (위치 반환)
        // @param {Number} x : screen x
        // @param {Number} y : screen y
        // @param {function(Data.PickDataItem())} pickProcess : pick 처리 후 프로세스 콜백 (pos, normal, body)
        this.GetPickByBodyCacheDownload = function (x, y, pickProcess) {
            if (view.MeshBlock.IsCacheBlockDownloading()) return;
            if (pickProcess === undefined) return;
            
            //다운로드해서 정확한 위치 찾기
            const matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);
            const matMVP = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, matMVMatrix);

            let bPicking = false;
            let minScreenPick = undefined;
            let minPickData = undefined;
        
            //가시화 id로 body 추출
            //let body = view.Renderer.Picking(x, y);
            let body = undefined;

            let calPickBody = function (scope, b) {
                body = b;
            };

            let resultPicking = view.Renderer.PickingCallback(x, y, scope, calPickBody, undefined);
            if(!resultPicking) {
                return;
            }

            //다운로드 완료시 콜백
            let callPick = function (objects) {
                const resultPick = scope.GetPickByBody(body.bodyId, x, y);
                //console.log("callPick : " + resultPick[0]);
                if (resultPick.pick) {
                    bPicking = true;

                    let pickPos = new VIZCore.Vector3().copy(resultPick.position);
                    const screenPos = view.Camera.world2ScreenWithMatrix(matMVP, pickPos);

                    //가장 가까운 곳으로 처리
                    if (minPickData === undefined) {
                        minPickData = resultPick;
                        minScreenPick = screenPos;
                    }
                    else if (screenPos.z < minScreenPick.z) {
                        minPickData = resultPick;
                        minScreenPick = screenPos;
                    }
                }

                //다운로드 종료시 process실행
                if (view.MeshBlock.IsCacheBlockDownloading() === false) {
                    if(bPicking)
                        pickProcess(minPickData);

                    view.Control.Unlock(); //control 잠금해제.
                }
                    
            };
            
            //control 잠금.
            view.Control.Lock();

            //Cache가 없는 경우 재다운로드
            let listFindUrl = [];
            if (!body.object.flag.cache || body.object.attribs.a_index.buffer === null) {
                let getObjectUrl = function (value, key, map) {
                    for (let ii = 0; ii < value.length; ii++) {
                        if (body.object.uuid !== value[ii].uuid) continue;

                        listFindUrl.push(key);
                        break;
                    }
                };
                view.Data.ObjectMap.forEach(getObjectUrl);

                //실패처리시 이미지 기법으로 처리
                if (listFindUrl.length === 0) {
                    let faileURL = function () {
                        const resultPick = view.Renderer.PickPositionObject(x, y);

                        if (resultPick !== undefined)
                            pickProcess(minPickData);

                        view.Control.Unlock(); //control 잠금해제.
                    };
                    setTimeout(faileURL, 1);
                    return;
                }

                if (listFindUrl.length > 1)
                    console.log('[Shw3DCore] URL cache Num : ' + listFindUrl.length);

                view.MeshBlock.CacheBlock(listFindUrl, callPick);
            } else {
                //데이터가 존재함으로 기존 방식 그래도 처리
                setTimeout(callPick, 1);
            }
        };
      
        // Get Body Pick Point
        // @param {Number} id : bodyid
        // @param {VIZCore.Vector3()} v1 : world Pos 1
        // @param {VIZCore.Vector3()} v2 : world Pos 2
        // @returns {Data.PickDataItem()}
        this.GetWorldPickByID = function (id, v1, v2) {
            let bodies = view.Data.GetBody(id);
            return scope.GetWorldPick(bodies, v1, v2);
        };

        // Get Body Pick Point
        // @param {Number} id : bodyid
        // @param {VIZCore.Vector3()} v1 : world Pos 1
        // @param {VIZCore.Vector3()} v2 : world Pos 2
        // @returns {Data.PickDataItem()}
        this.GetWorldPick = function (bodies, v1, v2) {
            
            if (bodies === undefined) return view.Data.PickDataItem();

            let worldRay1, worldRay2;
            worldRay1 = new VIZCore.Vector3().copy(v1);
            worldRay2 = new VIZCore.Vector3().copy(v2);
                    
            let bHit = false;
            //let minDist, minPick, minNormal;
            let minDist;
            let pickData = view.Data.PickDataItem();
            for (let k = 0; k < bodies.length; k++) {
                let body = bodies[k];

                let bodyAction = view.Data.ShapeAction.GetAction(body.object.id_file, body.origin_id);

                let bbMin = body.BBox.min;
                let bbMax = body.BBox.max;

                //array[8]
                let vBox = [
                    new VIZCore.Vector3(bbMin.x, bbMin.y, bbMin.z),
                    new VIZCore.Vector3(bbMin.x, bbMin.y, bbMax.z),
                    new VIZCore.Vector3(bbMin.x, bbMax.y, bbMin.z),
                    new VIZCore.Vector3(bbMin.x, bbMax.y, bbMax.z),
                    new VIZCore.Vector3(bbMax.x, bbMin.y, bbMin.z),
                    new VIZCore.Vector3(bbMax.x, bbMin.y, bbMax.z),
                    new VIZCore.Vector3(bbMax.x, bbMax.y, bbMin.z),
                    new VIZCore.Vector3(bbMax.x, bbMax.y, bbMax.z)
                ];

                //array[12][3]
                let triIndex = [[0, 1, 2], [1, 2, 3], [4, 5, 6], [5, 6, 7], [0, 2, 4], [2, 4, 6], [1, 3, 5], [3, 5, 7],
                [2, 3, 6], [3, 6, 7], [0, 1, 4], [1, 4, 5]
                ];

                //Transfom 변경 확인
                let matidentity = new VIZCore.Matrix4();
                let changeTransform = false;
                if (bodyAction.transform.equals(matidentity) === false)
                    changeTransform = true;

                //bound box Transform 
                //Bound Box가 이동계산된 경우 제외 필요.
                if (changeTransform) {
                    for (let i = 0; i < 8; ++i) {
                        vBox[i].applyMatrix4(bodyAction.transform);
                    }
                }

                // bound box Pick checking
                //if (view.useFramebuffer) {
                if (view.useFramebuffer && body.object.attribs.a_index.array.length <= 0) {
                    //데이터가 없을경우 boundBox로만 처리
                    for (let i = 0; i < 12; ++i) {
                        let result = view.Util.LineToTriangleIntersections(worldRay1, worldRay2, vBox[triIndex[i][0]], vBox[triIndex[i][1]], vBox[triIndex[i][2]]);

                        if (result[0] === 1) {
                            let pickLength = (new VIZCore.Vector3().subVectors(worldRay1, result[1])).length();
                            if (bHit === false) {
                                bHit = true;
                                minDist = pickLength;

                                pickData.pick = true;
                                pickData.position = result[1];
                                pickData.normal = new VIZCore.Plane().setFromCoplanarPoints(vBox[triIndex[i][0]], vBox[triIndex[i][1]], vBox[triIndex[i][2]]).normal;

                                pickData.body = body;
                            
                            }
                            else if (pickLength < minDist) {
                                minDist = pickLength;

                                pickData.pick = true;
                                pickData.position = result[1];
                                pickData.normal = new VIZCore.Plane().setFromCoplanarPoints(vBox[triIndex[i][0]], vBox[triIndex[i][1]], vBox[triIndex[i][2]]).normal;

                                pickData.body = body;
                            }
                        }
                    }

                    continue;
                }
                else {
                    let boundBoxPick = false;
                    for (let i = 0; i < 12; ++i) {
                        let result = view.Util.LineToTriangleIntersections(worldRay1, worldRay2, vBox[triIndex[i][0]], vBox[triIndex[i][1]], vBox[triIndex[i][2]]);

                        if (result[0] === 1) {
                            boundBoxPick = true;
                            break;
                        }
                    }
                    if (!boundBoxPick) { continue; }
                }

                // check triangle
                for (let i = body.m_triIdx; i < body.m_triIdx + body.m_nTris; i += 3) {

                    let idx1, idx2, idx3;
                    idx1 = body.object.attribs.a_index.array[i];
                    idx2 = body.object.attribs.a_index.array[i + 1];
                    idx3 = body.object.attribs.a_index.array[i + 2];

                    let vs1 = new VIZCore.Vector3(
                        body.object.attribs.a_position.array[idx1 * 3 + 0],
                        body.object.attribs.a_position.array[idx1 * 3 + 1],
                        body.object.attribs.a_position.array[idx1 * 3 + 2]
                    );
                    let vs2 = new VIZCore.Vector3(
                        body.object.attribs.a_position.array[idx2 * 3 + 0],
                        body.object.attribs.a_position.array[idx2 * 3 + 1],
                        body.object.attribs.a_position.array[idx2 * 3 + 2]
                    );

                    let vs3 = new VIZCore.Vector3(
                        body.object.attribs.a_position.array[idx3 * 3 + 0],
                        body.object.attribs.a_position.array[idx3 * 3 + 1],
                        body.object.attribs.a_position.array[idx3 * 3 + 2]
                    );

                    let vt1 = new VIZCore.Vector3().copy(vs1);
                    let vt2 = new VIZCore.Vector3().copy(vs2);
                    let vt3 = new VIZCore.Vector3().copy(vs3);

                    if (changeTransform) {
                        vt1.applyMatrix4(bodyAction.transform);
                        vt2.applyMatrix4(bodyAction.transform);
                        vt3.applyMatrix4(bodyAction.transform);
                    }

                    let result = view.Util.LineToTriangleIntersections(worldRay1, worldRay2, vt1, vt2, vt3);

                    if (result[0] === 1) {

                        if (!view.Clipping.IsClippingPosition(result[1])) { //단면 검사
                            let pickLength = (new VIZCore.Vector3().subVectors(worldRay1, result[1])).length();
                            if (bHit === false) {
                                bHit = true;
                                minDist = pickLength;

                                pickData.pick = true;
                                pickData.position = result[1];
                                pickData.normal = new VIZCore.Plane().setFromCoplanarPoints(vt1, vt2, vt3).normal;

                                pickData.surface = true;
                                pickData.triangle.vertex.v1 = vt1;
                                pickData.triangle.vertex.v2 = vt2;
                                pickData.triangle.vertex.v3 = vt3;

                                if(body.object.attribs.a_normal.array === undefined || body.object.attribs.a_normal.array.length === 0) {
                                    pickData.triangle.normal.v1.copy(pickData.normal);
                                    pickData.triangle.normal.v2.copy(pickData.normal);
                                    pickData.triangle.normal.v3.copy(pickData.normal);
                                }
                                else
                                {
                                    pickData.triangle.normal.v1.set( 
                                        body.object.attribs.a_normal.array[idx1 * 3 + 0],
                                        body.object.attribs.a_normal.array[idx1 * 3 + 1],
                                        body.object.attribs.a_normal.array[idx1 * 3 + 2]);
                                    pickData.triangle.normal.v2.set(
                                        body.object.attribs.a_normal.array[idx2 * 3 + 0],
                                        body.object.attribs.a_normal.array[idx2 * 3 + 1],
                                        body.object.attribs.a_normal.array[idx2 * 3 + 2]);
                                    pickData.triangle.normal.v3.set(
                                        body.object.attribs.a_normal.array[idx3 * 3 + 0],
                                        body.object.attribs.a_normal.array[idx3 * 3 + 1],
                                        body.object.attribs.a_normal.array[idx3 * 3 + 2]);

                                    if(changeTransform) {
                                        let rotateMatrix = new VIZCore.Matrix4().copy(bodyAction.transform);
                                        rotateMatrix.setPosition(new VIZCore.Vector3());

                                        pickData.triangle.normal.v1 = rotateMatrix.multiplyVector(pickData.triangle.normal.v1);
                                        pickData.triangle.normal.v2 = rotateMatrix.multiplyVector(pickData.triangle.normal.v2);
                                        pickData.triangle.normal.v3 = rotateMatrix.multiplyVector(pickData.triangle.normal.v3);
                                    }
                                }
                                
                                pickData.triangle.index[0] = idx1;
                                pickData.triangle.index[1] = idx2;
                                pickData.triangle.index[2] = idx3;

                                pickData.body = body;
                            }
                            else if (pickLength < minDist) {
                                minDist = pickLength;

                                pickData.pick = true;
                                pickData.position = result[1];
                                pickData.normal = new VIZCore.Plane().setFromCoplanarPoints(vt1, vt2, vt3).normal;

                                pickData.surface = true;
                                pickData.triangle.vertex.v1 = vt1;
                                pickData.triangle.vertex.v2 = vt2;
                                pickData.triangle.vertex.v3 = vt3;

                                if(body.object.attribs.a_normal.array === undefined || body.object.attribs.a_normal.array.length === 0) {
                                    pickData.triangle.normal.v1.copy(pickData.normal);
                                    pickData.triangle.normal.v2.copy(pickData.normal);
                                    pickData.triangle.normal.v3.copy(pickData.normal);
                                }
                                else
                                {
                                    pickData.triangle.normal.v1.set( 
                                        body.object.attribs.a_normal.array[idx1 * 3 + 0],
                                        body.object.attribs.a_normal.array[idx1 * 3 + 1],
                                        body.object.attribs.a_normal.array[idx1 * 3 + 2]);
                                    pickData.triangle.normal.v2.set(
                                        body.object.attribs.a_normal.array[idx2 * 3 + 0],
                                        body.object.attribs.a_normal.array[idx2 * 3 + 1],
                                        body.object.attribs.a_normal.array[idx2 * 3 + 2]);
                                    pickData.triangle.normal.v3.set(
                                        body.object.attribs.a_normal.array[idx3 * 3 + 0],
                                        body.object.attribs.a_normal.array[idx3 * 3 + 1],
                                        body.object.attribs.a_normal.array[idx3 * 3 + 2]);

                                    if(changeTransform) {
                                        let rotateMatrix = new VIZCore.Matrix4().copy(bodyAction.transform);
                                        rotateMatrix.setPosition(new VIZCore.Vector3());

                                        pickData.triangle.normal.v1 = rotateMatrix.multiplyVector(pickData.triangle.normal.v1);
                                        pickData.triangle.normal.v2 = rotateMatrix.multiplyVector(pickData.triangle.normal.v2);
                                        pickData.triangle.normal.v3 = rotateMatrix.multiplyVector(pickData.triangle.normal.v3);
                                    }
                                }

                                pickData.triangle.index[0] = idx1;
                                pickData.triangle.index[1] = idx2;
                                pickData.triangle.index[2] = idx3;

                                pickData.body = body;
                            }
                        }
                    }
                }
            }
            
            return pickData;
        };
      

        //#region Preselect 

        /**
        * 해당 위치의 Preselect 정보 확인 후
        * pickProcess 실행 (선택 정보) 반환)
        // @param {Number} x : screen x
        // @param {Number} y : screen y
        // @param {function(Data.PickDataItem())} pickProcess : pick 처리 후 프로세스 콜백 (pos, normal, body)
        // @returns {Data.PickDataItem()} : 선택 정보 반환
        */
        this.GetPreselectPick = function (x, y, pickProcess) {

            // result = Data.PreselectEdgeColorTableItem
            let resultPicking = view.Renderer.PickingPreselectData(x, y);
            if(resultPicking === undefined) return undefined;

            let edgeItem = scope.PreselectEdges[resultPicking.index];

            let pickData = view.Data.PickDataItem();
            pickData.pick = true;
            pickData.surface = false;

            pickData.body = undefined;

            pickData.preselectKind = resultPicking.pickKind;
            //pickData.preselect = edgeItem;

            //copy
            pickData.preselect = view.Data.PreselectEdgeItem();
            pickData.preselect.id = edgeItem.id;
            pickData.preselect.kind = edgeItem.kind;
            for(let i = 0 ; i < edgeItem.vData.length ; i++)
            {
                pickData.preselect.vData[i] = new VIZCore.Vector3().copy(edgeItem.vData[i]);
            }
            pickData.preselect.fValue = edgeItem.fValue;

            
            let currentTransform = new VIZCore.Matrix4();
            {
                let bodies = undefined;
                if(view.useTree)
                    bodies = view.Tree.GetBodies([ scope.PreselectObjects[0].index ]);
                else
                {
                    bodies = view.Data.GetBodies([ scope.PreselectObjects[0].index ]);
                }

                //위치 값 가져오기
                if(bodies !== undefined && bodies.length > 0) {
                    let action = view.Data.ShapeAction.GetAction(bodies[0].object.id_file, bodies[0].origin_id);

                    if(action.transform !== undefined) {
                        currentTransform.copy(action.transform);
                    }
                }
            }

            if(resultPicking.pickKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE)
            {
                //Point가 아님

                pickData.preselect.vData[0] = currentTransform.multiplyVector(pickData.preselect.vData[0]);
                pickData.preselect.vData[1] = currentTransform.multiplyVector(pickData.preselect.vData[1]);                
            }
            else if(resultPicking.pickKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE_START)
            {
                pickData.preselect.vData[0] = currentTransform.multiplyVector(pickData.preselect.vData[0]);
                pickData.preselect.vData[1] = currentTransform.multiplyVector(pickData.preselect.vData[1]);

                pickData.position.copy(pickData.preselect.vData[0]);
            }
            else if(resultPicking.pickKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE_END)
            {
                pickData.preselect.vData[0] = currentTransform.multiplyVector(pickData.preselect.vData[0]);
                pickData.preselect.vData[1] = currentTransform.multiplyVector(pickData.preselect.vData[1]);

                pickData.position.copy(pickData.preselect.vData[1]);
            }
            else if(resultPicking.pickKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE_MID)
            {
                pickData.preselect.vData[0] = currentTransform.multiplyVector(pickData.preselect.vData[0]);
                pickData.preselect.vData[1] = currentTransform.multiplyVector(pickData.preselect.vData[1]);

                pickData.position = new VIZCore.Vector3().addVectors(pickData.preselect.vData[0], pickData.preselect.vData[1]).multiplyScalar(0.5);
            }
            else if(resultPicking.pickKind === VIZCore.Enum.PRESELECT_PICK_KIND.CIRCLE_CENTER)
            {
                let currentRotate = new VIZCore.Matrix4().copy(currentTransform);
                currentRotate.setPosition(new VIZCore.Vector3());

                pickData.preselect.vData[0] = currentRotate.multiplyVector(pickData.preselect.vData[0]);
                pickData.preselect.vData[1] = currentRotate.multiplyVector(pickData.preselect.vData[1]);
                pickData.preselect.vData[2] = currentTransform.multiplyVector(pickData.preselect.vData[2]);
                pickData.preselect.vData[3] = currentRotate.multiplyVector(pickData.preselect.vData[3]);

                pickData.position.copy(pickData.preselect.vData[2]);
                pickData.normal.copy(pickData.preselect.vData[3]);
            }
            else if(resultPicking.pickKind === VIZCore.Enum.PRESELECT_PICK_KIND.CIRCLE)
            {
                let currentRotate = new VIZCore.Matrix4().copy(currentTransform);
                currentRotate.setPosition(new VIZCore.Vector3());

                pickData.preselect.vData[0] = currentRotate.multiplyVector(pickData.preselect.vData[0]);
                pickData.preselect.vData[1] = currentRotate.multiplyVector(pickData.preselect.vData[1]);
                pickData.preselect.vData[2] = currentTransform.multiplyVector(pickData.preselect.vData[2]);
                pickData.preselect.vData[3] = currentRotate.multiplyVector(pickData.preselect.vData[3]);

                //Point가 아님
                //pickData.position.copy(edgeItem.vData[2]);
                pickData.normal.copy(pickData.preselect.vData[3]);
            }

            if(pickProcess !== undefined) {
                pickProcess(pickData);
            }

            return pickData;
        };

        /**
         * 해당 위치의 Preselect 정보 반환
         * @param {Number} x : screen x
         * @param {Number} y : screen y
         * @returns {Data.PreselectEdgeColorTableItem()} : 선택한 preselect의 정보
         */
        this.GetPreselectDataPick = function (x, y) {

            // result = Data.PreselectEdgeColorTableItem
            let resultPicking = view.Renderer.PickingPreselectData(x, y);
            //if(resultPicking === undefined) return undefined;
            return resultPicking;
        };

        /**
         * preselect data 반환
         * @param {Number} id : 색상 ID 
         * @returns Data.PreselectEdgeColorTableItem 
         */
        this.GetPreselectDataByID = function (id) {

            for(let i = 0 ; i < tablePreselectData.length ; i++) {
                if (tablePreselectData[i].id !== id ) continue;
                
                return tablePreselectData[i];
            }

            //찾기 실패
            return undefined;
        };

        /**
         * 생성된 Preselect 개체의 ID 반환
         * @returns {Number}
         */
        this.GetMakePreselectID = function() {
            //등록된 정보가 있는경우 해당 ID로 생성함.
            for(let i = 0 ; i < scope.PreselectObjects.length ; i++) {
                return scope.PreselectObjects[i].index; //bodyID
            }
            return -1;
        };

        /**
         * Preselect 정보 생성 (Cache 확인 후 처리)
         * @param {Number} id : body
         */
        this.MakeMeasurePreselectInfoByBodyCache = function(id) {
            scope.GetBodyCacheDownload(id, scope.MakeMeasurePreselectInfoByID);
        };

        /**
         * Preselect 정보 생성
         * @param {Number} id 
         * @returns {Boolean} 생성 성공 여부
         */
        this.MakeMeasurePreselectInfoByID = function(id) {
            let bodies = undefined;
            if(view.useTree)
            {
                bodies = view.Tree.GetBodies([ id ]);
            }
            else
            {
                bodies = view.Data.GetBodies([ id ]);
            }
            return scope.MakeMeasurePreselectInfo(bodies);
        };

        /**
         * Preselect 정보 생성
         * @param {Data.Object} bodies 
         * @returns {Boolean} 생성 성공 여부
         */
        this.MakeMeasurePreselectInfo = function(bodies) {
          
            let triangles = view.Data.GetTriangles(bodies); //Data.TriangleItem

            scope.ReleaseMeasurePreselectInfo();
            if(bodies.length === 0)
            {
                return false;
            }

            for(let i = 0 ; i < scope.PreselectObjects.length ; i++) {
                scope.PreselectObjects[i].index = bodies[0].bodyId;
                scope.PreselectObjects[i].id_file = bodies[0].object.id_file;
            }

            //PreselectObjects[0] 에 개체형상 복사
            {
                let obj = scope.PreselectObjects[0];
                                
                let arrayNum = 0;
                let idxNum = 0;
                for (let i = 0; i < triangles.length; i++) {
                    let posNum = arrayNum;

                    obj.attribs.a_position.array[posNum] = triangles[i].vertex.v1.x; posNum++;
                    obj.attribs.a_position.array[posNum] = triangles[i].vertex.v1.y; posNum++;
                    obj.attribs.a_position.array[posNum] = triangles[i].vertex.v1.z; posNum++;
                    obj.attribs.a_index.array[idxNum] = idxNum; idxNum++;

                    obj.attribs.a_position.array[posNum] = triangles[i].vertex.v2.x; posNum++;
                    obj.attribs.a_position.array[posNum] = triangles[i].vertex.v2.y; posNum++;
                    obj.attribs.a_position.array[posNum] = triangles[i].vertex.v2.z; posNum++;
                    obj.attribs.a_index.array[idxNum] = idxNum; idxNum++;

                    obj.attribs.a_position.array[posNum] = triangles[i].vertex.v3.x; posNum++;
                    obj.attribs.a_position.array[posNum] = triangles[i].vertex.v3.y; posNum++;
                    obj.attribs.a_position.array[posNum] = triangles[i].vertex.v3.z; posNum++;
                    obj.attribs.a_index.array[idxNum] = idxNum; idxNum++;

                    arrayNum = posNum; // arrayNum += 9;
                }

                 //ArrayBuffer로 변경
                 if(idxNum > 0)
                 {
                    obj.attribs.a_position.array = new Float32Array(obj.attribs.a_position.array, 0, obj.attribs.a_position.array.length);
                    obj.attribs.a_index.array = new Uint32Array(obj.attribs.a_index.array, 0, obj.attribs.a_index.array.length);
                }
            }   

            // 접힌 삼각형 삭제
            {
                for (let i = triangles.length - 1; i >= 0 ; i--)
                {
                    let triangle = triangles[i];

                    // if (triangle.v1.equals(triangle.v2) || triangle.v2.equals(triangle.v3) ||
                    //     triangle.v3.equals(triangle.v1))
                    if (triangle.vertex.v1.equals(triangle.vertex.v2) || triangle.vertex.v2.equals(triangle.vertex.v3) ||
                        triangle.vertex.v3.equals(triangle.vertex.v1))
                    {
                        triangles.splice(i, 1);
                    }
                }
            }

            let triNum = triangles.length;

            //if (triNum > 100000) //VIZCore.NET
            if (triNum > 30000)
            {
                scope.ReleaseMeasurePreselectInfo();
                return false;
            }

            let makeTriInfoItem = function (_triangle) {
                let item = {
                    triangle : _triangle,
                    
                    closedTriangleIndex : [],  //[3][2]
                    fValue : 0
                };

                for(let i = 0 ; i < 3 ; i++) {
                    item.closedTriangleIndex[i] = [ -1, -1 ];
                }

                return item;
            };

            let id = 1;
            let sameErr = 1.0E-5;
            let arrTriInfo = [];

            //생성 시작
            if( triangles.length > 0 )
            {
                // 삼각형 중심의 xyz 합한 값으로 정렬
                for (let i = triangles.length - 1; i = 0 ; i--)
                {
                    let triangle = triangles[i];
                    triangle.fValue = triangle.vertex.v1.x + triangle.vertex.v1.y + triangle.vertex.v1.z + 
                                        triangle.vertex.v2.x + triangle.vertex.v2.y + triangle.vertex.v2.z + 
                                        triangle.vertex.v3.x + triangle.vertex.v3.y + triangle.vertex.v3.z;
                }
                
                triangles.sort(function(tri1, tri2)
                {
                    if(tri1.fValue > tri2.fValue)
                        return 1;
                    if(tri1.fValue < tri2.fValue)
                        return -1
                    return 0;
                });

                // 삼각형 인접정보 만든다
                for(let i = 0 ; i < triNum ; i++) {
                    arrTriInfo[i] = makeTriInfoItem(triangles[i]);
                }

                //찾는다.
                for(let i = 0 ; i < triNum ; i++)
                {
                    let triInfo = arrTriInfo[i];

                    for( let j=0 ; j<3 ; j++ )
                    {
                        // 이미 인접 정보가 있으면 스킵
                        if( triInfo.closedTriangleIndex[j][0] >= 0 )
                            continue;

                        let vBaseNormal = new VIZCore.Vector3().copy(triInfo.triangle.normal);
                        let vSrc = [triInfo.triangle.vertex.v1, triInfo.triangle.vertex.v2, triInfo.triangle.vertex.v3 ];

                        let bFind = false;

                        for( let triIndex=i+1 ; triIndex<triNum ; triIndex++ )
                        {
                            let targetTriInfo = arrTriInfo[triIndex];

                            let vTargetNormal = new VIZCore.Vector3().copy(targetTriInfo.triangle.normal);
                            let vTarget = [targetTriInfo.triangle.vertex.v1, targetTriInfo.triangle.vertex.v2, targetTriInfo.triangle.vertex.v3 ];

                            for( let m=0 ; m<3 ; m++ )
                            {
                                // 이미 인접 정보가 있으면 스킵
                                if( targetTriInfo.closedTriangleIndex[m][0] >= 0 )
                                    continue;

                                // 인덱스로 검사 
                                //if( pTriangle[i].blockIndex != pTriangle[triIndex].blockIndex )
                                //    continue;

                                if((triangles[i].index[j] === triangles[triIndex].index[m] && triangles[i].index[(j + 1) % 3] === triangles[triIndex].index[(m + 1) % 3]) ||
                                (triangles[i].index[j] === triangles[triIndex].index[(m + 1) % 3] && triangles[i].index[(j + 1) % 3] === triangles[triIndex].index[m]))
                                {
                                    //인접정보 
                                    bFind = true;

                                    arrTriInfo[i].closedTriangleIndex[j][0] = triIndex;
                                    arrTriInfo[i].closedTriangleIndex[j][1] = m;

                                    arrTriInfo[triIndex].closedTriangleIndex[m][0] = i;
                                    arrTriInfo[triIndex].closedTriangleIndex[m][1] = j;

                                    console.log("findCount!!");
                                    break;

                                }

                            }

                            
                            if( bFind ) { break; }
                        }
                    }

                }

            }
            
            // 검사
            let totalCnt = 0, edgeCnt = 0;
            for( let i = 0 ; i < triNum ; i++ )
            {
                let triInfo = arrTriInfo[i];

                for( let j = 0 ; j < 3 ; j++ )
                {
                    totalCnt++;

                    if( triInfo.closedTriangleIndex[j][0] < 0 )
                        edgeCnt++;
                }
            }

            if( edgeCnt === 0 )
            {
                //생성 실패
                return false;
            }

            let makeEdgeItem = function () {
                let item = {
                        vPos : [], //[2]
                        vNormal : [], //[2]

                        blockIndex : 0,
                        index : [], //[2]

                        linkedEdgeIndex : [],  // [2][2]
                        bProcessed : false,
                        fLength : 0,
                        fCosAngle : 0
                    };

                //배열 정보 등록
                for(let i = 0 ; i < 2 ; i++) {
                    item.vPos[i] = new VIZCore.Vector3();
                    item.vNormal[i] = new VIZCore.Vector3();

                    item.index[i] = -1;

                    item.linkedEdgeIndex[i] = [];
                    for(let j = 0 ; j < 2 ; j++) {
                        item.linkedEdgeIndex[i][j] = -1;
                    }
                }
                    
                return item;
            };
           
            //설정
            let m_bForcesPreselectEdgeAsPoint = false;
            let m_bMakPreselectInfoForcedCircleToLine = false;
            let m_bCreateCircleEdgePreselectPoint = false;
            let bForcedResistAsPoint = false;


            let pEdgeRaw = []; //edgeCnt 만큼 존재 필요
            let cnt = 0;
            for (let i = 0; i < triNum; i++) {
                let triInfo = arrTriInfo[i];

                for (let j = 0; j < 3; j++) {
                    if( triInfo.closedTriangleIndex[j][0] < 0 )
                    {
                        let edgeRaw = makeEdgeItem();
                      
                        edgeRaw.vPos[0] = view.Util.GetTrianglePos(triInfo.triangle, j);
                        edgeRaw.vPos[1] = view.Util.GetTrianglePos(triInfo.triangle, (j+1)%3);

                        edgeRaw.vNormal[0] = view.Util.GetTriangleItemIdxNormal(triInfo.triangle, j);
                        edgeRaw.vNormal[1] =  view.Util.GetTriangleItemIdxNormal(triInfo.triangle, (j+1)%3);

                        //edgeRaw.blockIndex = pTriangle[i].blockIndex;
                        edgeRaw.index[0] = triInfo.triangle.index[j];
                        edgeRaw.index[1] = triInfo.triangle.index[(j+1)%3];

                        for( let k=0 ; k<2 ; k++ )
                            for( let l=0 ; l<2 ; l++ )
                                edgeRaw.linkedEdgeIndex[k][l] = -1;

                        edgeRaw.bProcessed = false;
                        edgeRaw.fLength = new VIZCore.Vector3().subVectors(edgeRaw.vPos[0], edgeRaw.vPos[1]).length();
                        
                        pEdgeRaw[cnt] = edgeRaw;
                        cnt++;
                    }
                }

            }

            // 엣지 연결
	        let linkCnt = 0;
            for (let i = 0; i < edgeCnt; i++) {                
                for( let j = 0 ; j < 2 ; j++ )
                {
                    if( pEdgeRaw[i].linkedEdgeIndex[j][0] >= 0 )
                        continue;
        
                    let bFind = false;
        
                    for( let k=i+1 ; k<edgeCnt ; k++ )
                    {
                        if( pEdgeRaw[i].blockIndex !== pEdgeRaw[k].blockIndex )
                            continue;
        
                        for( let l=0 ; l<2 ; l++ )
                        {
                            if( pEdgeRaw[k].linkedEdgeIndex[l][0] >= 0 )
                                continue;
        
                            //Not Bevel
                            if (pEdgeRaw[i].index[j] === pEdgeRaw[k].index[l])
                            {
                                bFind = true;
    
                                pEdgeRaw[i].linkedEdgeIndex[j][0] = k;
                                pEdgeRaw[i].linkedEdgeIndex[j][1] = l;
    
                                pEdgeRaw[k].linkedEdgeIndex[l][0] = i;
                                pEdgeRaw[k].linkedEdgeIndex[l][1] = j;
    
                                linkCnt++;
    
                                break;
                            }
                        }
        
                        if( bFind ) break;
                    }
                }
            }

            let fSkipRadius = 5000;

            //엣지 등록
            let edgeEdgeNum = 0;
            let edgeCircleNum = 0;

            for( let i=0 ; i<edgeCnt ; i++ ) {
                if( pEdgeRaw[i].bProcessed )
                    continue;
                    
                // 혼자 있는거면 등록하고 스킵
                if( (pEdgeRaw[i].linkedEdgeIndex[0][0] < 0 && pEdgeRaw[i].linkedEdgeIndex[1][0] < 0) || bForcedResistAsPoint || m_bForcesPreselectEdgeAsPoint)
                {
                    //AddPreselectEdge( id, 0, pEdgeRaw[i].vPos[0], pEdgeRaw[i].vPos[1], 0, pNode ); id++;
                    scope.AddPreselectEdgeByLine(id, pEdgeRaw[i].vPos[0], pEdgeRaw[i].vPos[1], 0); id++;
                    pEdgeRaw[i].bProcessed = true;
                    edgeEdgeNum++;

                    continue;
                }

                // 최상단 찾는다
                let firstIndex = i;
                let startIndex = pEdgeRaw[i].linkedEdgeIndex[0][0];
                let startPos = pEdgeRaw[i].linkedEdgeIndex[0][1];
                if( startIndex < 0 )
                {
                    startIndex = pEdgeRaw[i].linkedEdgeIndex[1][0];
                    startPos = pEdgeRaw[i].linkedEdgeIndex[1][1];
                }

                let linkCnt = 0;
                for( let j=0 ; j<edgeCnt ; j++ ) {
                    let nextIndex = pEdgeRaw[startIndex].linkedEdgeIndex[1-startPos][0];
                    let nextPos = pEdgeRaw[startIndex].linkedEdgeIndex[1-startPos][1];
                    
                    if( nextIndex < 0 || nextIndex === firstIndex )
                        break;

                    startIndex = nextIndex;
                    startPos = nextPos;

                    linkCnt++;
                }

                // 뒤로 가면서 전체 개수 세고 코사인값 넣는다
                linkCnt = 1;
                startPos = pEdgeRaw[startIndex].linkedEdgeIndex[0][1];
                if( pEdgeRaw[startIndex].linkedEdgeIndex[0][0] < 0 )
                    startPos = pEdgeRaw[startIndex].linkedEdgeIndex[1][1];
                let nextIndex, nextPos;
                nextIndex = startIndex;
                nextPos = startPos;
                

                //CRMVertex3<float> vLastVector3, vCurrentVector3;
                let vLastVector3, vCurrentVector3;
                let fLastLength, fCurrentLength;
                let pLastEdge;

                vLastVector3 = new VIZCore.Vector3().subVectors(pEdgeRaw[nextIndex].vPos[nextPos], pEdgeRaw[nextIndex].vPos[1-nextPos]);
                fLastLength = pEdgeRaw[nextIndex].fLength;
                pLastEdge = pEdgeRaw[nextIndex];
                
                for( let j=0 ; j<edgeCnt ; j++ )
                {
                    let tmp1 = pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][0];
                    let tmp2 = 1-pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][1];

                    nextIndex = tmp1;
                    nextPos = tmp2;

                    if( nextIndex < 0 || nextIndex === startIndex )
                        break;

                    vCurrentVector3 = new VIZCore.Vector3().subVectors(pEdgeRaw[nextIndex].vPos[nextPos], pEdgeRaw[nextIndex].vPos[1-nextPos]);
                    fCurrentLength = pEdgeRaw[nextIndex].fLength;

                    if( fCurrentLength > 0.0000001 && fLastLength > 0.0000001 )
                    {
                        // 사이각 계산
                        pLastEdge.fCosAngle = vCurrentVector3.dot(vLastVector3) / fCurrentLength / fLastLength;
                    }

                    vLastVector3 = vCurrentVector3;
                    fLastLength = fCurrentLength;
                    pLastEdge = pEdgeRaw[nextIndex];
                    linkCnt++;
                }

                nextIndex = startIndex;
                nextPos = startPos;

                for( let j=0 ; j<linkCnt ; j++ )
                {
                    // 4개 이하면 각각 등록
                    if( j > linkCnt-4  || m_bMakPreselectInfoForcedCircleToLine)
                    {
                        for( let k=j ; k<linkCnt ; k++ )
                        {
                            if( nextPos > 0 )
                            {
                                //AddPreselectEdge( id, 0, pEdgeRaw[nextIndex].vPos[nextPos-1], pEdgeRaw[nextIndex].vPos[nextPos], 0, pNode ); id++;
                                scope.AddPreselectEdgeByLine(id, pEdgeRaw[nextIndex].vPos[nextPos-1], pEdgeRaw[nextIndex].vPos[nextPos], 0); id++;
                                pEdgeRaw[nextIndex].bProcessed = true;
                                edgeEdgeNum++;

                                nextIndex = pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][0];
                                nextPos = 1-pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][1];

                                if( nextIndex < 0 || nextIndex === startIndex )
                                    break;
                            }
                        }

                        break; // 등록 완료
                    }

                    // 간격과 각도가 같이 연속된 놈들 조사
                    let repeatCnt = 1;
                    {
                        let fAngle, fLength;
                        let tmpNextIndex = nextIndex;
                        let tmpNextPos = nextPos;

                        for( let k=j ; k<linkCnt-1 ; k++ )
                        {
                            if( k === j )
                            {
                                fAngle = pEdgeRaw[tmpNextIndex].fCosAngle;
                                fLength = pEdgeRaw[tmpNextIndex].fLength;
                                if( fAngle < 0.7071 || fAngle > 0.9999 ) break;	// 45도 이상이면 원으로 취급 한함
                                repeatCnt++;
                            }
                            else
                            {
                                if( Math.abs( fAngle - pEdgeRaw[tmpNextIndex].fCosAngle ) > 0.005 ) break;
                                if( Math.abs( fLength - pEdgeRaw[tmpNextIndex].fLength ) > Math.max( fLength*0.01, pEdgeRaw[tmpNextIndex].fLength*0.01 ) ) break;
                                repeatCnt++;
                            }
                            
                            tmpNextIndex = pEdgeRaw[tmpNextIndex].linkedEdgeIndex[tmpNextPos][0];
                            tmpNextPos = 1 - pEdgeRaw[tmpNextIndex].linkedEdgeIndex[tmpNextPos][1];

                            if( tmpNextIndex < 0 || tmpNextIndex === startIndex )
                                break;
                        }

                        //Sleep(0);
                    }

                    // 원 반지름으로 채크, fSkipRadius 이상이면 스킵
                    {
                        let tmpNextIndex = pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][0];
                        let tmpNextPos = 1 - pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][1];

                        //3점이 같은 위치가 존재하는 경우 스킵
                        if (pEdgeRaw[nextIndex].vPos[1 - nextPos] != pEdgeRaw[nextIndex].vPos[nextPos] && pEdgeRaw[nextIndex].vPos[nextPos] != pEdgeRaw[tmpNextIndex].vPos[tmpNextPos] &&
                            pEdgeRaw[nextIndex].vPos[1 - nextPos] != pEdgeRaw[tmpNextIndex].vPos[tmpNextPos])
                        {
                            let vCenter = view.Util.GetCircleCenterPTFrom3Pt(pEdgeRaw[nextIndex].vPos[1 - nextPos], pEdgeRaw[nextIndex].vPos[nextPos], pEdgeRaw[tmpNextIndex].vPos[tmpNextPos]);
                            let fRadius = new VIZCore.Vector3().subVectors(vCenter, pEdgeRaw[nextIndex].vPos[nextPos]).length();

                            if (fRadius > fSkipRadius)
                                repeatCnt = 0;
                        }
                        else
                            repeatCnt = 0;
                    }

                    // 연속된게 4개 이상이면 원으로 등록
                    if( repeatCnt >= 4 )
                    {
                        let tmpNextIndex = pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][0];
                        let tmpNextPos = 1-pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][1];

                        // 원 정보 얻기
                        let vCenter = view.Util.GetCircleCenterPTFrom3Pt(pEdgeRaw[nextIndex].vPos[ 1-nextPos ], pEdgeRaw[nextIndex].vPos[ nextPos ], pEdgeRaw[tmpNextIndex].vPos[ tmpNextPos ] );
                        let fRadius = new VIZCore.Vector3().subVectors(vCenter, pEdgeRaw[nextIndex].vPos[ nextPos ] ).length();
                        fRadius = new VIZCore.Vector3().subVectors(vCenter, pEdgeRaw[nextIndex].vPos[ 1-nextPos ] ).length();
                        fRadius = new VIZCore.Vector3().subVectors(vCenter, pEdgeRaw[tmpNextIndex].vPos[ tmpNextPos ] ).length();
                        let vDir = new VIZCore.Vector3().subVectors(pEdgeRaw[nextIndex].vPos[ 1-nextPos ], pEdgeRaw[nextIndex].vPos[ nextPos ]);
                        vDir =  new VIZCore.Vector3().crossVectors(vDir,  
                            new VIZCore.Vector3().subVectors(pEdgeRaw[tmpNextIndex].vPos[ tmpNextPos ],pEdgeRaw[nextIndex].vPos[ nextPos ] ));
                        vDir.normalize();

                        if (m_bCreateCircleEdgePreselectPoint)
                        {
                            // 포인트도 등록한다
                            {
                                //AddPreselectEdge(id, 0, pEdgeRaw[nextIndex].vPos[1 - nextPos], pEdgeRaw[nextIndex].vPos[nextPos], 0, pNode); id++;
                                scope.AddPreselectEdgeByLine(id, pEdgeRaw[nextIndex].vPos[1 - nextPos], pEdgeRaw[nextIndex].vPos[nextPos], 0); id++;
                                pEdgeRaw[nextIndex].bProcessed = true;
                                edgeEdgeNum++;

                                nextIndex = pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][0];
                                nextPos = 1 - pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][1];
                            }

                            // 중심 등록
                            //AddPreselectEdge(id, 0, vCenter, vCenter, 0, pNode); id++;
                            scope.AddPreselectEdgeByLine(id, vCenter, vCenter, 0); id++;
                        }
                        else
                        {
                            // 원 등록하고 처리완료 플래그 세팅
                            edgeCircleNum++;

                            for (let k = 0; k < repeatCnt; k++)
                            {
                                //AddPreselectEdge(id, 1, pEdgeRaw[nextIndex].vPos[1 - nextPos], pEdgeRaw[nextIndex].vPos[nextPos], vCenter, vDir, fRadius, pNode);
                                scope.AddPreselectEdgeByCircle(id, pEdgeRaw[nextIndex].vPos[1 - nextPos], pEdgeRaw[nextIndex].vPos[nextPos], vCenter, vDir, fRadius);
                                pEdgeRaw[nextIndex].bProcessed = true;

                                nextIndex = pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][0];
                                nextPos = 1 - pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][1];

                                if (nextIndex < 0 || nextIndex === startIndex)
                                    break;
                            }

                            id++;
                        }
                        
                        //Sleep(0);
                    }
                    else
                    {
                        // 하나 엣지로 등록
                        if( nextPos > 0 )
                        {
                            //AddPreselectEdge( ID, 0, pEdgeRaw[nextIndex].vPos[1-nextPos], pEdgeRaw[nextIndex].vPos[nextPos], 0, pNode ); ID++;
                            scope.AddPreselectEdgeByLine(id, pEdgeRaw[nextIndex].vPos[1-nextPos], pEdgeRaw[nextIndex].vPos[nextPos], 0); id++;
                            pEdgeRaw[nextIndex].bProcessed = true;
                            edgeEdgeNum++;

                            nextIndex = pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][0];
                            nextPos = 1-pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][1];
                        }
                    }

                    if( nextIndex < 0 || nextIndex == startIndex )
                        break;
                }

                
                vLastVector3 =  new VIZCore.Vector3().subVectors(pEdgeRaw[nextIndex].vPos[nextPos], pEdgeRaw[nextIndex].vPos[1-nextPos]);
                fLastLength = pEdgeRaw[nextIndex].fLength;
                pLastEdge = (pEdgeRaw[nextIndex]);
                
                for( let j=0 ; j<edgeCnt ; j++ )
                {
                    let tmp1 = pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][0];
                    let tmp2 = 1-pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][1];

                    nextIndex = tmp1;
                    nextPos = tmp2;

                    if( nextIndex < 0 || nextIndex === startIndex )
                        break;

                    vCurrentVector3 =  new VIZCore.Vector3().subVectors(pEdgeRaw[nextIndex].vPos[nextPos], pEdgeRaw[nextIndex].vPos[1-nextPos]);
                    fCurrentLength = pEdgeRaw[nextIndex].fLength;

                    if( fCurrentLength > 0.0000001 && fLastLength > 0.0000001 )
                    {
                        // 사이각 계산
                        //pLastEdge->fCosAngle = vCurrentVector3.Dot(vLastVector3) / fCurrentLength / fLastLength;
                        pLastEdge.fCosAngle = vCurrentVector3.dot(vLastVector3) / fCurrentLength / fLastLength;
                    }

                    vLastVector3 = vCurrentVector3;
                    fLastLength = fCurrentLength;
                    pLastEdge = pEdgeRaw[nextIndex];
                    linkCnt++;
                }

                nextIndex = startIndex;
                nextPos = startPos;

                for( let j=0 ; j<linkCnt ; j++ )
                {
                    // 4개 이하면 각각 등록
                    if( j > linkCnt-4  || m_bMakPreselectInfoForcedCircleToLine)
                    {
                        for( let k=j ; k<linkCnt ; k++ )
                        {
                            if( nextPos > 0 )
                            {
                                //AddPreselectEdge( id, 0, pEdgeRaw[nextIndex].vPos[nextPos-1], pEdgeRaw[nextIndex].vPos[nextPos], 0, pNode ); id++;
                                scope.AddPreselectEdgeByLine(id, pEdgeRaw[nextIndex].vPos[nextPos-1], pEdgeRaw[nextIndex].vPos[nextPos], 0); id++;

                                pEdgeRaw[nextIndex].bProcessed = true;
                                edgeEdgeNum++;

                                nextIndex = pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][0];
                                nextPos = 1-pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][1];

                                if( nextIndex < 0 || nextIndex === startIndex )
                                    break;
                            }
                        }

                        break; // 등록 완료
                    }

                    // 간격과 각도가 같이 연속된 놈들 조사
                    let repeatCnt = 1;
                    {
                        let fAngle, fLength;
                        let tmpNextIndex = nextIndex;
                        let tmpNextPos = nextPos;

                        for( let k=j ; k<linkCnt-1 ; k++ )
                        {
                            if( k == j )
                            {
                                fAngle = pEdgeRaw[tmpNextIndex].fCosAngle;
                                fLength = pEdgeRaw[tmpNextIndex].fLength;
                                if( fAngle < 0.7071 || fAngle > 0.9999 ) break;	// 45도 이상이면 원으로 취급 한함
                                repeatCnt++;
                            }
                            else
                            {
                                if( Math.abs( fAngle - pEdgeRaw[tmpNextIndex].fCosAngle ) > 0.005 ) break;
                                if( Math.abs( fLength - pEdgeRaw[tmpNextIndex].fLength ) > Math.max( fLength*0.01, pEdgeRaw[tmpNextIndex].fLength*0.01 ) ) break;
                                repeatCnt++;
                            }
                            
                            tmpNextIndex = pEdgeRaw[tmpNextIndex].linkedEdgeIndex[tmpNextPos][0];
                            tmpNextPos = 1-pEdgeRaw[tmpNextIndex].linkedEdgeIndex[tmpNextPos][1];

                            if( tmpNextIndex < 0 || tmpNextIndex === startIndex )
                                break;
                        }

                        //Sleep(0);
                    }

                    // 원 반지름으로 채크, fSkipRadius 이상이면 스킵
                    {
                        let tmpNextIndex = pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][0];
                        let tmpNextPos = 1 - pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][1];

                        //3점이 같은 위치가 존재하는 경우 스킵
                        if (!pEdgeRaw[nextIndex].vPos[1 - nextPos].equals(pEdgeRaw[nextIndex].vPos[nextPos]) && !pEdgeRaw[nextIndex].vPos[nextPos].equals(pEdgeRaw[tmpNextIndex].vPos[tmpNextPos]) &&
                            !pEdgeRaw[nextIndex].vPos[1 - nextPos].equals(pEdgeRaw[tmpNextIndex].vPos[tmpNextPos]) )
                        {
                            let vCenter = view.Util.GetCircleCenterPTFrom3Pt(pEdgeRaw[nextIndex].vPos[1 - nextPos], pEdgeRaw[nextIndex].vPos[nextPos], pEdgeRaw[tmpNextIndex].vPos[tmpNextPos]);
                            let fRadius = new VIZCore.Vector3().subVectors(vCenter, pEdgeRaw[nextIndex].vPos[nextPos]).length();

                            if (fRadius > fSkipRadius)
                                repeatCnt = 0;
                        }
                        else
                            repeatCnt = 0;
                    }

                    // 연속된게 4개 이상이면 원으로 등록
                    if( repeatCnt >= 4 )
                    {
                        let tmpNextIndex = pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][0];
                        let tmpNextPos = 1-pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][1];

                        // 원 정보 얻기
                        //CRMVertex3<float> vCenter = CRMVertex3<float>::GetCircleCenterPTFrom3Pt( 
                        let vCenter = view.Util.GetCircleCenterPTFrom3Pt(pEdgeRaw[nextIndex].vPos[ 1-nextPos ], pEdgeRaw[nextIndex].vPos[ nextPos ], pEdgeRaw[tmpNextIndex].vPos[ tmpNextPos ] );
                        let fRadius = new VIZCore.Vector3().subVectors(vCenter, pEdgeRaw[nextIndex].vPos[ nextPos ] ).length();
                        fRadius = new VIZCore.Vector3().subVectors(vCenter, pEdgeRaw[nextIndex].vPos[ 1-nextPos ] ).length();
                        fRadius = new VIZCore.Vector3().subVectors(vCenter, pEdgeRaw[tmpNextIndex].vPos[ tmpNextPos ] ).length();
                        let vDir = new VIZCore.Vector3().subVectors(pEdgeRaw[nextIndex].vPos[ 1-nextPos ], pEdgeRaw[nextIndex].vPos[ nextPos ]);
                        vDir =  new VIZCore.Vector3().crossVectors(vDir,  
                            new VIZCore.Vector3().subVectors(pEdgeRaw[tmpNextIndex].vPos[ tmpNextPos ], pEdgeRaw[nextIndex].vPos[ nextPos ] ));
                        vDir.normalize();

                        if (m_bCreateCircleEdgePreselectPoint)
                        {
                            // 포인트도 등록한다
                            {
                                //AddPreselectEdge(id, 0, pEdgeRaw[nextIndex].vPos[1 - nextPos], pEdgeRaw[nextIndex].vPos[nextPos], 0, pNode); id++;
                                scope.AddPreselectEdgeByLine(id, pEdgeRaw[nextIndex].vPos[nextPos-1], pEdgeRaw[nextIndex].vPos[nextPos], 0); id++;
                                pEdgeRaw[nextIndex].bProcessed = true;
                                edgeEdgeNum++;

                                nextIndex = pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][0];
                                nextPos = 1 - pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][1];
                            }

                            // 중심 등록
                            //AddPreselectEdge(id, 0, vCenter, vCenter, 0, pNode); id++;
                            scope.AddPreselectEdgeByLine(id, vCenter, vCenter, 0); id++;
                        }
                        else
                        {
                            // 원 등록하고 처리완료 플래그 세팅
                            edgeCircleNum++;

                            for (let k = 0; k < repeatCnt; k++)
                            {
                                //AddPreselectEdge(ID, 1, pEdgeRaw[nextIndex].vPos[1 - nextPos], pEdgeRaw[nextIndex].vPos[nextPos], vCenter, vDir, fRadius, pNode);
                                scope.AddPreselectEdgeByCircle(id, pEdgeRaw[nextIndex].vPos[1 - nextPos], pEdgeRaw[nextIndex].vPos[nextPos], vCenter, vDir, fRadius);
                                pEdgeRaw[nextIndex].bProcessed = true;

                                nextIndex = pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][0];
                                nextPos = 1 - pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][1];

                                if (nextIndex < 0 || nextIndex === startIndex)
                                    break;
                            }

                            id++;
                        }
                        
                        //Sleep(0);
                    }
                    else
                    {
                        // 하나 엣지로 등록
                        if( nextPos > 0 )
                        {
                            //AddPreselectEdge( id, 0, pEdgeRaw[nextIndex].vPos[1-nextPos], pEdgeRaw[nextIndex].vPos[nextPos], 0, pNode ); id++;
                            scope.AddPreselectEdgeByLine(id, pEdgeRaw[nextIndex].vPos[1-nextPos], pEdgeRaw[nextIndex].vPos[nextPos], 0); id++;
                            pEdgeRaw[nextIndex].bProcessed = true;
                            edgeEdgeNum++;

                            nextIndex = pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][0];
                            nextPos = 1-pEdgeRaw[nextIndex].linkedEdgeIndex[nextPos][1];
                        }
                    }

                    if( nextIndex < 0 || nextIndex === startIndex )
                        break;
                }

            }

            //scope.PreselectObjects 업데이트
            if(scope.PreselectEdges.length > 0)
            {
                for(let i = 0 ; i < scope.PreselectObjects.length ; i++) {
                    scope.PreselectObjects[i].flag.updateProcess = true;
                }

                return true;
            }

            return false;
        };

        /**
         * Preselect 정보 초기화
         */
        this.ReleaseMeasurePreselectInfo = function() {

            //데이터 제거
            for(let i = 0 ; i < scope.PreselectObjects.length ; i++) {
                view.RenderWGL.ReleaseDataByObject(scope.PreselectObjects[i]);
                scope.PreselectObjects[i].index = -1;

                scope.PreselectObjects[i].id_file = "";
            }

            //scope.PreselectObjects = [];
            scope.PreselectEdges = [];
            tablePreselectData = [];
        };

        /**
         * Preselect Edge 추가 (Line)
         * @param {Number} edgeID : id
         * @param {VIZCore.Vector3} v1 : edge point 1
         * @param {VIZCore.Vector3} v2 : edge point 2
         * @param {Number} fValue 
         */
        this.AddPreselectEdgeByLine = function(edgeID, v1, v2, fValue) {

            let edgeData = view.Data.PreselectEdgeItem();

            edgeData.id = edgeID;
            edgeData.kind = VIZCore.Enum.PRESELECT_EDGE_KIND.EDGE;
            edgeData.vData[0] = v1;
            edgeData.vData[1] = v2;
            edgeData.fValue = fValue;

            scope.PreselectEdges.push(edgeData);
        };

        /**
         * Preselect Edge 추가 (Circle)
         * @param {Number} edgeID : id
         * @param {VIZCore.Vector3} v1 : Circle Point 1  
         * @param {VIZCore.Vector3} v2 : Circle Point 2
         * @param {VIZCore.Vector3} vCenter : Circle Center
         * @param {VIZCore.Vector3} vDir : Circle 방향
         * @param {Number} fValue : 반지름
         */
        this.AddPreselectEdgeByCircle = function(edgeID, v1, v2, vCenter, vDir, fValue) {

            let edgeData = view.Data.PreselectEdgeItem();

            edgeData.id = edgeID;
            edgeData.kind = VIZCore.Enum.PRESELECT_EDGE_KIND.CIRCLE;
            edgeData.vData[0] = v1;
            edgeData.vData[1] = v2;
            edgeData.vData[2] = vCenter;
            edgeData.vData[3] = vDir;
            edgeData.fValue = fValue;

            {
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

                edgeData.vData[4] = vXAxis;
                edgeData.vData[5] = vYAxis;
            }

            scope.PreselectEdges.push(edgeData);
        };
       
        /**
         * Preselect Pipeline 초기화
         * @param {*} uiControl : UI_Base
         * @returns 
         */
        function initPreselectEdgeRenderProcess(uiControl) {
            if(scope.PreselectObjects.length <= 0) return;

            let bUpdate = false;
            for(let presel = 0 ; presel < scope.PreselectObjects.length ; presel++) {
                let obj = scope.PreselectObjects[presel];
                if(!obj.flag.updateProcess) break;

                bUpdate = true;
                break;
            }

            if(!bUpdate) return;

            // Preselect 설정값
            let bOnlyPickPoint = false;
            let bUseIntersectionInfo = false;
            let b2SideClipping = false;
            let bCirclePtAsPoint = false;
            
            //bOnlyPickPoint = uiControl.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.POINT);
            //bCirclePtAsPoint = uiControl.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.POINT);

            //b2SideClipping = pLib->m_MISList.IsTwoSideClipPlane();

            // Preselect rendering 분류
            let bPickPoint = false, bPickEdge = false, bPickCircle = false, bPickSurface = false, bMidPoint = false;
            let bLineCurveNearPoint = false, bCircleCenter = false, bCircleQuadrantPoint = false, bOnSurfacePoint = false, bAxisCenter = false;

            if(uiControl.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.POINT)) {
                bPickPoint = true;
                bMidPoint = true;
                bLineCurveNearPoint = true;
                //bCircleCenter = true;
                //bCircleQuadrantPoint = true;
                //bAxisCenter = true;
                
                //사용자 설정
                // bPickPoint = pMarkup->m_measureSnap.bPoint;
                // bMidPoint = pMarkup->m_measureSnap.bMidPoint;
                // bLineCurveNearPoint = pMarkup->m_measureSnap.bLineCurveNearPoint;
                // bCircleCenter = pMarkup->m_measureSnap.bCircleCenter;
                // bCircleQuadrantPoint = pMarkup->m_measureSnap.bCircleQuadrantPoint;
                // bAxisCenter = pMarkup->m_measureSnap.bAxisCenter;
            }
            if(uiControl.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.CIRCLE_CENTER)) {
				bCircleCenter = true;
            }
            if(uiControl.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.AXIS_CENTER)) {
				bAxisCenter = true;
            }
            if(uiControl.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.SURFACE)) {
				bPickSurface = true;
            }
            if(uiControl.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.LINE)) {
                bPickEdge = true;
            }
            if(uiControl.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.CIRCLE)) {
				bPickCircle = true;
            }

            //색상 정보 초기화
            tablePreselectData = [];
            let itemColorID = new VIZCore.Color(0, 0, 0, 1);
            //info.colorIdx = itemColorID.r + (itemColorID.g << 8) + (itemColorID.b << 16) + (itemColorID.a * 16777216); //<< 24
            let cnt = scope.PreselectEdges.length;
                        
            // 0 개체 형상 복사
            {
                let obj = scope.PreselectObjects[0];
                if(obj.flag.updateProcess){
                    //기존 GL 데이터 제거
                    view.RenderWGL.RemoveGLBuffer(obj, true);
                    view.RenderWGL.DeletePipeline(obj.uuid);

                    view.RenderWGL.SetDataByObject(obj);
                    view.RenderWGL.InitRenderPipelineSample(obj);
                }
            }

            // [1] = Point, [2] = Line, [3] = Circle
            for(let presel = 1 ; presel < scope.PreselectObjects.length ; presel++) {
                let obj = scope.PreselectObjects[presel];
                if(!obj.flag.updateProcess) continue;

                //기존 GL 데이터 제거
                view.RenderWGL.ReleaseDataByObject(obj);
                view.RenderWGL.DeletePipeline(obj.uuid);

                //idx 관리
                let posNum = 0;
                let colorNum = 0;
                let idxNum = 0;

                for(let i = 0 ; i < cnt ; i++) {
                    let edgeData = scope.PreselectEdges[i];
    
                    if(edgeData.kind === VIZCore.Enum.PRESELECT_EDGE_KIND.EDGE) {

                        if(bPickPoint && presel === 1) {  //Point
                            //시작점
                            itemColorID.new();                            
                            obj.attribs.a_position.array[posNum] = edgeData.vData[0].x; 
                            obj.attribs.a_position.array[posNum+1] = edgeData.vData[0].y;
                            obj.attribs.a_position.array[posNum+2] = edgeData.vData[0].z;
                            posNum +=3;

                            obj.attribs.a_color.array[colorNum] = itemColorID.r; 
                            obj.attribs.a_color.array[colorNum + 1] = itemColorID.g; 
                            obj.attribs.a_color.array[colorNum + 2] = itemColorID.b; 
                            obj.attribs.a_color.array[colorNum + 3] = itemColorID.a;
                            colorNum += 4;

                            obj.attribs.a_index.array[idxNum] = idxNum;
                            idxNum += 1;

                            addPreselectColorTable(itemColorID, i, VIZCore.Enum.PRESELECT_PICK_KIND.EDGE_START);

                             // 선 중심
                            itemColorID.new();
                            let centerPos = new VIZCore.Vector3().addVectors(edgeData.vData[0], edgeData.vData[1]).multiplyScalar(0.5);
                            obj.attribs.a_position.array[posNum] = centerPos.x; 
                            obj.attribs.a_position.array[posNum+1] = centerPos.y;
                            obj.attribs.a_position.array[posNum+2] = centerPos.z;
                            posNum +=3;

                            obj.attribs.a_color.array[colorNum] = itemColorID.r; 
                            obj.attribs.a_color.array[colorNum + 1] = itemColorID.g; 
                            obj.attribs.a_color.array[colorNum + 2] = itemColorID.b; 
                            obj.attribs.a_color.array[colorNum + 3] = itemColorID.a;
                            colorNum += 4;

                            obj.attribs.a_index.array[idxNum] = idxNum;
                            idxNum += 1;

                            addPreselectColorTable(itemColorID, i, VIZCore.Enum.PRESELECT_PICK_KIND.EDGE_MID);

                            //끝점
                            itemColorID.new();
                             
                            obj.attribs.a_position.array[posNum] = edgeData.vData[1].x; 
                            obj.attribs.a_position.array[posNum+1] = edgeData.vData[1].y;
                            obj.attribs.a_position.array[posNum+2] = edgeData.vData[1].z;
                            posNum +=3;

                            obj.attribs.a_color.array[colorNum] = itemColorID.r; 
                            obj.attribs.a_color.array[colorNum + 1] = itemColorID.g; 
                            obj.attribs.a_color.array[colorNum + 2] = itemColorID.b; 
                            obj.attribs.a_color.array[colorNum + 3] = itemColorID.a;
                            colorNum += 4;

                            obj.attribs.a_index.array[idxNum] = idxNum;
                            idxNum += 1;

                            addPreselectColorTable(itemColorID, i, VIZCore.Enum.PRESELECT_PICK_KIND.EDGE_END);
                        }
                        else if(bPickEdge && presel === 2) { //Line
                            itemColorID.new();

                            obj.attribs.a_position.array[posNum] = edgeData.vData[0].x; 
                            obj.attribs.a_position.array[posNum+1] = edgeData.vData[0].y;
                            obj.attribs.a_position.array[posNum+2] = edgeData.vData[0].z;
                            obj.attribs.a_position.array[posNum+3] = edgeData.vData[1].x; 
                            obj.attribs.a_position.array[posNum+4] = edgeData.vData[1].y;
                            obj.attribs.a_position.array[posNum+5] = edgeData.vData[1].z;
                            posNum +=6;

                            obj.attribs.a_color.array[colorNum] = itemColorID.r; 
                            obj.attribs.a_color.array[colorNum + 1] = itemColorID.g; 
                            obj.attribs.a_color.array[colorNum + 2] = itemColorID.b; 
                            obj.attribs.a_color.array[colorNum + 3] = itemColorID.a;
                            obj.attribs.a_color.array[colorNum + 4] = itemColorID.r; 
                            obj.attribs.a_color.array[colorNum + 5] = itemColorID.g; 
                            obj.attribs.a_color.array[colorNum + 6] = itemColorID.b; 
                            obj.attribs.a_color.array[colorNum + 7] = itemColorID.a;
                            colorNum += 8;

                            obj.attribs.a_index.array[idxNum] = idxNum;
                            obj.attribs.a_index.array[idxNum + 1] = idxNum + 1;
                            idxNum += 2;
                            
                            // let meshItem = view.MeshProcess.GetCylinderSide3DVertices(edgeData.vData[0], edgeData.vData[1], renderLineWidth);

                            // for(let v = 2 ; v < meshItem.vertices.length; v++) {
                            //     for(let n = 2 ; n >= 0; n--) {
                                
                            //         obj.attribs.a_position.array[posNum] = meshItem.vertices[v - n].x; 
                            //         obj.attribs.a_position.array[posNum+1] = meshItem.vertices[v - n].y;
                            //         obj.attribs.a_position.array[posNum+2] = meshItem.vertices[v - n].z;
                            //         posNum +=3;
        
                            //         obj.attribs.a_color.array[colorNum] = itemColorID.r; 
                            //         obj.attribs.a_color.array[colorNum + 1] = itemColorID.g; 
                            //         obj.attribs.a_color.array[colorNum + 2] = itemColorID.b; 
                            //         obj.attribs.a_color.array[colorNum + 3] = itemColorID.a;
                            //         colorNum += 4;

                            //         obj.attribs.a_index.array[idxNum] = idxNum;
                            //         idxNum += 1;
                            //     }
                            // }

                            addPreselectColorTable(itemColorID, i, VIZCore.Enum.PRESELECT_PICK_KIND.EDGE);

                            //obj.attribs.a_position.array.push(edgeData.vData[0]); //시작점
                            //obj.attribs.a_position.array.push(edgeData.vData[1]); //끝점
                        }

                    }
                    else if( edgeData.kind === VIZCore.Enum.PRESELECT_EDGE_KIND.CIRCLE) {
                        
                        if(bCircleCenter && presel === 1) { //Point
                            itemColorID.new();
                            //원 중심
                            obj.attribs.a_position.array[posNum] = edgeData.vData[2].x; 
                            obj.attribs.a_position.array[posNum+1] = edgeData.vData[2].y;
                            obj.attribs.a_position.array[posNum+2] = edgeData.vData[2].z;
                            posNum +=3;

                            obj.attribs.a_color.array[colorNum] = itemColorID.r; 
                            obj.attribs.a_color.array[colorNum + 1] = itemColorID.g; 
                            obj.attribs.a_color.array[colorNum + 2] = itemColorID.b; 
                            obj.attribs.a_color.array[colorNum + 3] = itemColorID.a;
                            colorNum += 4;

                            obj.attribs.a_index.array[idxNum] = idxNum;
                            idxNum += 1;

                            addPreselectColorTable(itemColorID, i, VIZCore.Enum.PRESELECT_PICK_KIND.CIRCLE_CENTER);
                        }
                        if(bPickCircle && presel === 3) { //Circle
                            itemColorID.new();
                            //obj.attribs.a_position.array.push(edgeData.v1); //시작점
                            //obj.attribs.a_position.array.push(edgeData.v2); //끝점

                            let circleVertices = view.MeshProcess.Get2D3DCircleVertices(edgeData.vData[2], edgeData.vData[4], edgeData.vData[5], edgeData.fValue, 0, 360);

                            for(let v = 1 ; v < circleVertices.vertices.length; v++) {
                                for(let n = 1 ; n >= 0; n--) {
                                    obj.attribs.a_position.array[posNum] = circleVertices.vertices[v - n].x; 
                                    obj.attribs.a_position.array[posNum+1] = circleVertices.vertices[v - n].y;
                                    obj.attribs.a_position.array[posNum+2] = circleVertices.vertices[v - n].z;
                                    posNum +=3;
        
                                    obj.attribs.a_color.array[colorNum] = itemColorID.r; 
                                    obj.attribs.a_color.array[colorNum + 1] = itemColorID.g; 
                                    obj.attribs.a_color.array[colorNum + 2] = itemColorID.b; 
                                    obj.attribs.a_color.array[colorNum + 3] = itemColorID.a;
                                    colorNum += 4;

                                    obj.attribs.a_index.array[idxNum] = idxNum;
                                    idxNum += 1;
                                }
                            }

                            // for(let cv = 1 ; cv < circleVertices.vertices.length; cv++) {
                            //     let meshItem = view.MeshProcess.GetCylinderSide3DVertices(circleVertices.vertices[cv - 1], circleVertices.vertices[cv],
                            //         renderCircleWidth);

                            //     for(let v = 2 ; v < meshItem.vertices.length; v++) {
                            //         for(let n = 2 ; n >= 0; n--) {
                                    
                            //             obj.attribs.a_position.array[posNum] = meshItem.vertices[v - n].x; 
                            //             obj.attribs.a_position.array[posNum+1] = meshItem.vertices[v - n].y;
                            //             obj.attribs.a_position.array[posNum+2] = meshItem.vertices[v - n].z;
                            //             posNum +=3;
            
                            //             obj.attribs.a_color.array[colorNum] = itemColorID.r; 
                            //             obj.attribs.a_color.array[colorNum + 1] = itemColorID.g; 
                            //             obj.attribs.a_color.array[colorNum + 2] = itemColorID.b; 
                            //             obj.attribs.a_color.array[colorNum + 3] = itemColorID.a;
                            //             colorNum += 4;
    
                            //             obj.attribs.a_index.array[idxNum] = idxNum;
                            //             idxNum += 1;
                            //         }
                            //     }
                            // }

                            addPreselectColorTable(itemColorID, i, VIZCore.Enum.PRESELECT_PICK_KIND.CIRCLE);
                        }
                    }
                }

                //생성된 정보가 존재
                if(idxNum > 0) {

                    //ArrayBuffer로 변경
                    {
                        obj.attribs.a_position.array = new Float32Array(obj.attribs.a_position.array, 0, obj.attribs.a_position.array.length);
                        obj.attribs.a_color.array = new Uint8Array(obj.attribs.a_color.array, 0, obj.attribs.a_color.array.length);
                        obj.attribs.a_index.array = new Uint32Array(obj.attribs.a_index.array, 0, obj.attribs.a_index.array.length);
                    }

                    view.RenderWGL.SetDataByObject(obj);
                    view.RenderWGL.InitRenderPipelineSample(obj);
                }
            }

        }
    
        /**
         * preselect 선택 key관리 테이블 추가
         * @param {VIZCore.Color} color : color ID
         * @param {Number} index : Preselect index
         * @param {VIZCore.Enum.PRESELECT_PICK_KIND} kind : VIZCore.Enum.PRESELECT_PICK_KIND
         */
        function addPreselectColorTable (color, index, pickKind) {
            //colorItem.id = itemColorID.r + (itemColorID.g << 8) + (itemColorID.b << 16) + (itemColorID.a * 16777216); //<< 24

            let colorItem = view.Data.PreselectEdgeColorTableItem();
            
            colorItem.id = color.r + (color.g << 8) + (color.b << 16) + (color.a * 16777216);
            colorItem.index = index;
            colorItem.pickKind = pickKind;

            tablePreselectData.push(colorItem);
        };

        /**
         * Preselect Edge 색상 ID 재등록
         */
        this.RefreshPreselectEdgeProcess = function() {

            for(let presel = 0 ; presel < scope.PreselectObjects.length ; presel++) {
                let obj = scope.PreselectObjects[presel];
                obj.flag.updateProcess = true;
            }

        }

        /**
         * Preselect Edge 색상 ID 그리기
         */
        this.RenderPreselectEdgeColor = function() {

            let mode = view.Control.GetMode();

            // 측정 모드가 아닌경우 제외
            if(mode !== VIZCore.Enum.CONTROL_STATE.MARKUP)
                return;

            let uimode = view.Control.GetUIMode();
            let uiControl = uimode.GetUIControl();
            //Preselect 가능 여부 확인을 위한 Control
            if(uiControl === undefined) return;

            //Preselect를 사용여부 확인
            if(!uiControl.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT) ) return;
            if(scope.PreselectObjects.length <= 0) return;

            //Preselect가 생성 전
            if(scope.GetMakePreselectID() < 0) return;

            initPreselectEdgeRenderProcess(uiControl);
            
            let currentTransform = new VIZCore.Matrix4();
            let bodies = undefined;
            if(view.useTree)
                bodies = view.Tree.GetBodies([ scope.PreselectObjects[0].index ]);
            else
            {
                bodies = view.Data.GetBodies([ scope.PreselectObjects[0].index ]);
            }

            //위치 값 가져오기
            if(bodies !== undefined && bodies.length > 0) {
                let action = view.Data.ShapeAction.GetAction(bodies[0].object.id_file, bodies[0].origin_id);

                if(action.transform !== undefined) {
                    currentTransform.copy(action.transform);
                }
            }

            //위치값 변경
            for(let i = 0 ; i < scope.PreselectObjects.length ; i++) {
                let pipelineItem = view.RenderWGL.GetPipeline(scope.PreselectObjects[i].uuid);
                if(pipelineItem === undefined) continue;
                if (pipelineItem.listProcess.length <= 0) continue;

                for(let j = 0 ; j < pipelineItem.listProcess.length ; j++) {
                    pipelineItem.listProcess[j].action.transform.copy(currentTransform);
                }
            }

            let matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);

            //OneColor
            {
                view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.BASIC2D);
                view.Shader.SetGLCameraData();
                //let blackColor = new VIZCore.Color(0, 0, 0, 0);
                let blackColor = new VIZCore.Color();
                blackColor.set(0,0,0,0);
                view.Shader.SetClipping(matMVMatrix);
                                
                view.RenderWGL.UpdateRenderProcessByObjectOneColor_v2(scope.PreselectObjects[0], blackColor);

                view.Shader.EndShader();
            }

            //Preslect Render
            {
                let fPointSize = renderPointSize;
                let fLineWidth = renderLineWidth;
                let fCircleWidth = renderLineWidth;

                view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.PICKING);
                view.Shader.SetPointSize(fPointSize);
                view.Shader.SetGLCameraData();
                
                //Point
                view.RenderWGL.SetGLDrawMode(view.gl.POINTS);
                view.Shader.SetClipping(matMVMatrix);

                view.RenderWGL.UpdateRenderProcessByColorID_v2(scope.PreselectObjects[1]);
                
                view.Shader.EndShader();

                view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.PICKING);
                //view.Shader.SetPointSize(fPointSize);
                view.Shader.SetGLCameraData();
                //Line
                view.RenderWGL.SetGLDrawMode(view.gl.LINES);
                view.Shader.SetClipping(matMVMatrix);

                view.RenderWGL.UpdateRenderProcessByColorID_v2(scope.PreselectObjects[2]);

                //Circle
                view.RenderWGL.SetGLDrawMode(view.gl.LINES);
                view.Shader.SetClipping(matMVMatrix);
                view.Shader.SetGLCameraData();
                view.RenderWGL.UpdateRenderProcessByColorID_v2(scope.PreselectObjects[3]);

                view.RenderWGL.SetGLDrawMode(view.gl.TRIANGLES);

                view.Shader.EndShader();
            }

        };

        /**
         * Preselect Edge 그리기
         */
        this.RenderPreselectEdge = function() {

            let mode = view.Control.GetMode();

            // 측정 모드가 아닌경우 제외
            if(mode !== VIZCore.Enum.CONTROL_STATE.MARKUP)
                return;

            let uimode = view.Control.GetUIMode();
            let uiControl = uimode.GetUIControl();
            //Preselect 가능 여부 확인을 위한 Control
            if(uiControl === undefined) return;

            //Preselect를 사용여부 확인
            if(!uiControl.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT) ) return;
            if(scope.PreselectObjects.length <= 0) return;

            //Preselect가 생성 전
            if(scope.GetMakePreselectID() < 0) return;

            initPreselectEdgeRenderProcess(uiControl);
            
            let currentTransform = new VIZCore.Matrix4();
            let bodies = undefined;
            if(view.useTree)
                bodies = view.Tree.GetBodies([ scope.PreselectObjects[0].index ]);
            else
                bodies = view.Data.GetBodies([ scope.PreselectObjects[0].index ]);

           //위치 값 가져오기
           if(bodies !== undefined && bodies.length > 0) {
                let action = view.Data.ShapeAction.GetAction(bodies[0].object.id_file, bodies[0].origin_id);

                if(action.transform !== undefined) {
                    currentTransform.copy(action.transform);
                }
            }

            //위치값 변경
            for(let i = 0 ; i < scope.PreselectObjects.length ; i++) {
                let pipelineItem = view.RenderWGL.GetPipeline(scope.PreselectObjects[i].uuid);
                if(pipelineItem === undefined) continue;
                if (pipelineItem.listProcess.length <= 0) continue;

                for(let j = 0 ; j < pipelineItem.listProcess.length ; j++) {
                    pipelineItem.listProcess[j].action.transform.copy(currentTransform);
                }
            }

            //Render
            {
                //let colPoint = new VIZCore.Color(0, 0, 0, 255);
                //let colLine = new VIZCore.Color(0, 0, 0, 255);
                //let colCircle = new VIZCore.Color(0, 0, 0, 255);

                let matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.cameraMatrix);

                let colPoint = renderPreselectColor;
                let colLine = renderPreselectColor;
                let colCircle = renderPreselectColor;

                view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.BASIC3D);
                view.Shader.SetPointSize(renderPointSize);
                view.Shader.SetGLCameraData();
                
                //Point
                view.RenderWGL.SetGLDrawMode(view.gl.POINTS);
                view.Shader.SetClipping(matMVMatrix);

                view.RenderWGL.UpdateRenderProcessByObjectOneColor_v2(scope.PreselectObjects[1], colPoint);

                view.Shader.EndShader();

                //view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.BASICLINES2D);
                view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.BASIC3D);
                view.Shader.SetGLCameraData();
                view.Shader.SetLineThickness(renderLineWidth);                
                view.Shader.SetClipping(matMVMatrix);

                //Line
                view.RenderWGL.SetGLDrawMode(view.gl.LINES);
                view.Shader.SetLineThickness(renderLineWidth);
                view.Shader.SetResolutionData();

                //view.RenderWGL.UpdateRenderProcessByLinesOneColor_v2(scope.PreselectObjects[2], colLine);
                view.RenderWGL.UpdateRenderProcessByObjectOneColor_v2(scope.PreselectObjects[2], colLine);

                //Circle
                view.RenderWGL.SetGLDrawMode(view.gl.LINES);

                view.RenderWGL.UpdateRenderProcessByObjectOneColor_v2(scope.PreselectObjects[3], colCircle);

                view.RenderWGL.SetGLDrawMode(view.gl.TRIANGLES);
                view.Shader.EndShader();

                
            }
        };

        /**
         * 해당하는 Preselect Data 그리기
         * @param {Data.PreselectEdgeColorTableItem} preselectData 
         */
        this.RenderPreselectData = function(preselectData) {
            if(preselectData === undefined) return;

            let edgeData = scope.PreselectEdges[preselectData.index];
            if(edgeData === undefined) return;

            let vertices = [];
            let glDrawMode = view.gl.TRIANGLES;
            
            //그리기 정보 생성
            if(preselectData.pickKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE) {
                glDrawMode = view.gl.LINES;
                //drawLength = 2;

                vertices[0] = new VIZCore.Vector3().copy(edgeData.vData[0]);
                vertices[1] = new VIZCore.Vector3().copy(edgeData.vData[1]);

                // let meshItem = view.MeshProcess.GetCylinderSide3DVertices(edgeData.vData[0], edgeData.vData[1], renderLineWidth);
                // let posNum = 0;
                // for(let v = 2 ; v < meshItem.vertices.length; v++) {
                //     for(let n = 2 ; n >= 0; n--) {
                //         position[posNum] = meshItem.vertices[v - n].x; 
                //         position[posNum+1] = meshItem.vertices[v - n].y;
                //         position[posNum+2] = meshItem.vertices[v - n].z;
                //         posNum +=3;

                //         drawLength++;
                //     }
                // }

            }
            else if(preselectData.pickKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE_START) {
                glDrawMode = view.gl.POINTS;                
                //drawLength = 1;

                vertices[0] = new VIZCore.Vector3().copy(edgeData.vData[0]);
                // position[0] = edgeData.vData[0].x;
                // position[1] = edgeData.vData[0].y;
                // position[2] = edgeData.vData[0].z;
            }
            else if(preselectData.pickKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE_END) {
                glDrawMode = view.gl.POINTS;

                vertices[0] = new VIZCore.Vector3().copy(edgeData.vData[1]);
                // position[0] = edgeData.vData[1].x;
                // position[1] = edgeData.vData[1].y;
                // position[2] = edgeData.vData[1].z;
            }
            else if(preselectData.pickKind === VIZCore.Enum.PRESELECT_PICK_KIND.EDGE_MID) {
                glDrawMode = view.gl.POINTS;

                let vMid = new VIZCore.Vector3().addVectors(edgeData.vData[0], edgeData.vData[1]).multiplyScalar(0.5);

                vertices[0] = new VIZCore.Vector3().copy(vMid);
                // position[0] = vMid.x;
                // position[1] = vMid.y;
                // position[2] = vMid.z;
            }
            else if(preselectData.pickKind === VIZCore.Enum.PRESELECT_PICK_KIND.CIRCLE_CENTER) {
                glDrawMode = view.gl.POINTS;
                view.Shader.SetPointSize(renderPointSize);
                //drawLength = 1;

                vertices[0] = new VIZCore.Vector3().copy(edgeData.vData[2]);

                //position[0] = edgeData.vData[2].x;
                //position[1] = edgeData.vData[2].y;
                //position[2] = edgeData.vData[2].z;

            }
            else if(preselectData.pickKind === VIZCore.Enum.PRESELECT_PICK_KIND.CIRCLE) {
                //glDrawMode = view.gl.LINE_STRIP;
                //glDrawMode = view.gl.TRIANGLES;
                glDrawMode = view.gl.LINES;

                let circleVertices = view.MeshProcess.Get2D3DCircleVertices(edgeData.vData[2], edgeData.vData[4], edgeData.vData[5], edgeData.fValue, 0, 360);

                let verticesNum = vertices.length;
                let posNum = 0;
                for(let v = 1 ; v < circleVertices.vertices.length; v++) {
                    for(let n = 1 ; n >= 0; n--) {
                        // position[posNum] = circleVertices.vertices[v - n].x; 
                        // position[posNum+1] = circleVertices.vertices[v - n].y;
                        // position[posNum+2] = circleVertices.vertices[v - n].z;

                        vertices[verticesNum] = new VIZCore.Vector3().copy(circleVertices.vertices[v - n]);
                        //posNum +=3;
                        verticesNum++;
                    }
                }
            }

            //view.RenderWGL.UpdateRenderProcessByObjectOneColor_v2(scope.PreselectObjects[0], colPoint);
            if(vertices.length > 0) {

                //이동값 계산
                let currentTransform = new VIZCore.Matrix4();
                if(scope.PreselectObjects.length > 0)
                {
                    let bodies = undefined;
                    if(view.useTree)
                        bodies = view.Tree.GetBodies([ scope.PreselectObjects[0].index ]);
                    else
                    {
                        bodies = view.Data.GetBodies([ scope.PreselectObjects[0].index ]);
                    }

                    //위치 값 가져오기
                    if(bodies !== undefined && bodies.length > 0) {
                        let action = view.Data.ShapeAction.GetAction(bodies[0].object.id_file, bodies[0].origin_id);

                        if(action.transform !== undefined) {
                            currentTransform.copy(action.transform);
                        }
                    }

                    for(let i = 0 ; i < vertices.length ; i ++) {
                        vertices[i] = currentTransform.multiplyVector(vertices[i]);
                    }
                }

                view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.BASIC2D);
                view.Shader.SetPointSize(renderPointSize);

                //const matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.matMV);
                const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
                const matScreenMVP = new VIZCore.Matrix4().copy(view.Camera.screenProjectionMatrix);
                
                view.Shader.SetMatrix(matScreenMVP, undefined);

                //Screen 으로 가시화로 변경
                //let matScreen = new VIZCore.Matrix4();
                //view.Shader.SetMatrix(matScreen, matScreen);
    
                let currentGLColor = new VIZCore.Color().copy(renderPreselectPickColor).glColor();
                view.Shader.SetGLColor(currentGLColor.r, currentGLColor.g, currentGLColor.b, currentGLColor.a);
    
                if(glDrawMode === view.gl.LINES) {

                    //Screen 으로 그리기 때문에 두께 비율 변경
                    let screenWidth = renderLineWidth;
                    if(false)
                    {
                        //Screen
                        //let v1 = view.Camera.world2ScreenWithMatrix(matScreenMVP, new VIZCore.Vector3());
                        //let v2 = view.Camera.world2ScreenWithMatrix(matScreenMVP, new VIZCore.Vector3(renderLineWidth, 0, 0));

                        //let v1 = new VIZCore.Vector3().applyMatrix4(matScreenMVP);
                        //let v2 = new VIZCore.Vector3(renderLineWidth, 0, 0).applyMatrix4(matScreenMVP);
                        screenWidth = new VIZCore.Vector3().subVectors(v2, v1).length();
                    }

                    //Panel 생성
                    let drawVertices = [];
                    for(let i = 0 ; i < vertices.length ; i += 2) {
                        let v1 = view.Camera.world2ScreenWithMatrix(matMVP, vertices[i]);
                        let v2 = view.Camera.world2ScreenWithMatrix(matMVP, vertices[i + 1]);

                        //let v1 = vertices[i].applyMatrix4(matMVP);
                        //let v2 = vertices[i + 1].applyMatrix4(matMVP);

                        v1.z = 0;
                        v2.z = 0;
                        let item = view.MeshProcess.GetLine(v1, v2, screenWidth);
                        
                        for(let v = 0 ; v < item.vertices.length ; v++) {
                            //item.vertices[v].z = 0;
                            drawVertices.push(item.vertices[v]);
                        }
                    }

                    vertices = drawVertices;

                    //Line은 두께처리가 안되므로 Tri로 변경하여 그리기
                    glDrawMode = view.gl.TRIANGLES;
                }
                else {
                    for(let i = 0 ; i < vertices.length ; i++) {
                        let screenPos = view.Camera.world2ScreenWithMatrix(matMVP, vertices[i]);
                        //let screenPos = vertices[i].applyMatrix4(matMVP);
                        //screenPos.z = 0;
                        vertices[i] = screenPos;
                    }
                }

                let drawLength = 0;
                let position = [];

                let posNum = 0;
                for(let v = 0 ; v < vertices.length; v++) {
                    position[posNum] = vertices[v].x; 
                    position[posNum+1] = vertices[v].y;
                    //position[posNum+2] = vertices[v].z;
                    position[posNum+2] = 0;
                    posNum +=3;

                    drawLength++;
                }

                let positionBuffer = view.gl.createBuffer();
                view.gl.bindBuffer(view.gl.ARRAY_BUFFER, positionBuffer);
                view.gl.bufferData(view.gl.ARRAY_BUFFER, new Float32Array(position), view.gl.STATIC_DRAW);
                view.gl.vertexAttribPointer(view.Shader.positionAttributeLocation, 3, view.gl.FLOAT, false, 0, 0);

                view.gl.drawArrays(glDrawMode, 0, drawLength);

                view.gl.deleteBuffer(positionBuffer);
            }

            view.Shader.EndShader();
        };

        //#endregion


        //#region Select Marker

        /**
         * Control Picker 가 가르키는 위치 반환
         * @param {number} x 
         * @param {number} y 
         * @returns {VIZCore.Vector2} 화면 좌표
         */
        this.GetControlPickerPickPos = function(x, y) {
            
            if(!scope.EnableControlPicker || !drawingControlPicker)
                return new VIZCore.Vector2(x, y);

            let fPickerSideSize = (view.Camera.clientWidth / 15.0) * controlPickerScale;
            if(controlPickerFixSize > 0)
                fPickerSideSize = controlPickerFixSize * controlPickerScale;
            else
                fPickerSideSize = (view.Camera.clientWidth / 15.0) * controlPickerScale;

            //선택 위치
            //렌더링 좌표 + (이미지 좌표) / 이미지 크기 * 렌더링 크기
            const arrowX = controlPickerPosition.x + (-150 + 38) / 256.0 * fPickerSideSize;
            const arrowY = controlPickerPosition.y + (-150 + 15) / 256.0 * fPickerSideSize;

            return new VIZCore.Vector2(arrowX, arrowY);
        };
        
        /**
         * 선택 마커 그리기
         */
        this.RenderControlPicker = function() {
            const lastDrawing = drawingControlPicker;

            drawingControlPicker = false;
            if(!scope.EnableControlPicker ) return;

            const mode = view.Control.GetMode();

            // 측정 모드가 아닌경우 제외
            if(mode !== VIZCore.Enum.CONTROL_STATE.MARKUP)
                return;

            const uimode = view.Control.GetUIMode();
            const uiControl = uimode.GetUIControl();
            //Preselect 가능 여부 확인을 위한 Control
            if(uiControl === undefined) return;

            //Preselect를 사용여부 확인
            //if(!uiControl.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT) ) return;
            scope.EnableControlMove = true;
            if (!uiControl.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT)) {
                scope.EnableControlMove = false;
            }
            
            if(scope.PreselectObjects.length <= 0) return;
            if(scope.PreselectEdges.length <= 0) return;

            if(pickerTexture === undefined)
            {
                pickerTexture = view.gl.createTexture();
                view.gl.bindTexture(view.gl.TEXTURE_2D, pickerTexture);

                let disableTextureData = new Uint8Array(2 * 2 * 4);
                for(let i = 0 ; i < disableTextureData.length ; i++)
                    disableTextureData[i] = 0;

                view.gl.texImage2D(view.gl.TEXTURE_2D, 0, view.gl.RGBA,
                    2, 2, 0,
                    view.gl.RGBA, view.gl.UNSIGNED_BYTE, disableTextureData);

                const img = new Image();
                img.src = view.Shader.DefaultTexture.SelectMarker;

                img.onload = function () {
                    setUpPickerImageLoad = true;
                    view.gl.bindTexture(view.gl.TEXTURE_2D, pickerTexture);
                    view.gl.texImage2D(view.gl.TEXTURE_2D, 0, view.gl.RGBA, view.gl.RGBA, view.gl.UNSIGNED_BYTE, img); //Image
                    view.gl.bindTexture(view.gl.TEXTURE_2D, null);

                    view.Renderer.Render();
                };

                view.gl.texParameteri(view.gl.TEXTURE_2D, view.gl.TEXTURE_MIN_FILTER, view.gl.LINEAR);
                view.gl.texParameteri(view.gl.TEXTURE_2D, view.gl.TEXTURE_MAG_FILTER, view.gl.LINEAR);
                view.gl.texParameteri(view.gl.TEXTURE_2D, view.gl.TEXTURE_WRAP_S, view.gl.REPEAT);
                view.gl.texParameteri(view.gl.TEXTURE_2D, view.gl.TEXTURE_WRAP_T, view.gl.REPEAT);

                view.gl.bindTexture(view.gl.TEXTURE_2D, null);
                
                return;
            }

            if(!setUpPickerImageLoad) return;

            drawingControlPicker = true;

            //화면 내 좌표 여부 확인
            {
                const screenBox = new VIZCore.BBox();
                screenBox.set(new VIZCore.Vector3(), new VIZCore.Vector3(view.Camera.clientWidth, view.Camera.clientHeight, 0));
                if( !screenBox.isInBoundBox2D(controlPickerPosition, 1) || lastDrawing != drawingControlPicker)
                {
                    //화면 가운데로 변경
                    scope.SetControlPickerPositon(new VIZCore.Vector3(view.Camera.clientWidth * 0.5, view.Camera.clientHeight * 0.8, 0));
                }
            }

            //Control Picker 
            {
                const matMVPMatrix = new VIZCore.Matrix4();

                view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.TEXTURE2D);
                
                view.Shader.SetMatrix(matMVPMatrix, undefined);
                view.Shader.SetGLColor(1.0, 1.0, 1.0, 1.0);
                //view.Shader.SetCurrentTexture("u_Texture", view.gl.TEXTURE_2D, pickerTexture);

                let drawControl = function(posX, type){

                    let fPickerSideSize = (view.Camera.clientWidth / 15.0) * controlPickerScale;
                    if(controlPickerFixSize > 0)
                        fPickerSideSize = controlPickerFixSize * controlPickerScale;
                    else
                        fPickerSideSize = (view.Camera.clientWidth / 15.0) * controlPickerScale;

                    /// move, picker control
                    if (type === 0){
                        view.Renderer.Util.TextureByScreenCoord(posX, fPickerSideSize, fPickerSideSize, pickerTexture,
                            new VIZCore.Vector2(0.0, 0.0), new VIZCore.Vector2(0.25, 0.5));
                    }// Ok
                    else if (type === 1){
                        view.Renderer.Util.TextureByScreenCoord(new VIZCore.Vector3(posX, controlPickerPosition.y, controlPickerPosition.z), fPickerSideSize, fPickerSideSize, pickerTexture,
                        new VIZCore.Vector2(0.25, 0.0), new VIZCore.Vector2(0.5, 0.5));
                    } //cancel 
                    else if (type === 2){
                        view.Renderer.Util.TextureByScreenCoord(new VIZCore.Vector3(posX, controlPickerPosition.y, controlPickerPosition.z), fPickerSideSize, fPickerSideSize, pickerTexture,
                        new VIZCore.Vector2(0.5, 0.0), new VIZCore.Vector2(0.75, 0.5));
                    }
                }
  

                //// type 0 : move +picker  / 1: ok   / 2: cancel
                if (scope.EnableControlMove === true) {
                        drawControl(controlPickerPosition, 0);

                    if (scope.EnableControlOk === true && scope.EnableControlCancel === true) {

                        let okbtnPos =  controlPickerPosition.x + controlPickerGap;
                        let cancelbtnPos = controlPickerPosition.x + (controlPickerGap * 2);

                        ///OK btn
                        if (view.Camera.clientWidth < okbtnPos){
                            drawControl(controlPickerPosition.x - controlPickerGap, 1)
                        }
                        else{
                            drawControl(controlPickerPosition.x + controlPickerGap, 1)
                        }

                        ///Cancel btn
                        if (view.Camera.clientWidth < cancelbtnPos){
                             if (view.Camera.clientWidth < okbtnPos)
                                drawControl(controlPickerPosition.x - (controlPickerGap * 2), 2)
                            else 
                                drawControl(controlPickerPosition.x - controlPickerGap, 2)
                        }
                        else{
                            drawControl(controlPickerPosition.x + (controlPickerGap * 2), 2)
                        }
                    }
                    else if (scope.EnableControlCancel === true) {

                        let cancelbtnPos = controlPickerPosition.x + controlPickerGap;

                        if (view.Camera.clientWidth < cancelbtnPos){
                            drawControl(controlPickerPosition.x - controlPickerGap, 2)
                        }
                        else{
                            drawControl(controlPickerPosition.x + controlPickerGap, 2)
                        }

                    }
                }
                else {
                    ///OK btn
                    drawControl(controlPickerPosition.x + controlPickerGap, 1)
                    ///Cancel btn
                    drawControl(controlPickerPosition.x + (controlPickerGap * 2), 2)
                }

                view.Shader.EndShader();
            }
        };

        /**
         * 선택마커 mouse down이 해당 영역 안에 되었는지 확인
         * @param {number} gap controlPickerGap
         * @param {number} x 화면 좌표
         * @param {number} y 화면 좌표
         * @param {number} sizeHalf 마커 size * .5
         * @returns {boolean} 마커가 내부에 있는지 확인
         */
        function checkMouseDownArea (gap, x, y, sizeHalf) { 
            const screenBBox = new VIZCore.BBox();
            screenBBox.min.x = controlPickerPosition.x + gap - sizeHalf;
            screenBBox.min.y = controlPickerPosition.y - sizeHalf;

            screenBBox.max.x = controlPickerPosition.x + gap + sizeHalf;
            screenBBox.max.y = controlPickerPosition.y + sizeHalf;
            screenBBox.update();

            if(screenBBox.isInBoundBox2D( new VIZCore.Vector3(x, y, 0), 0))
            {
                return true;
            }
            
            return false;
        }


        /**
         * 화면 내 선택마커 Down 여부 확인
         * @param {number} x 
         * @param {number} y 
         */
        this.IsMouseDownControlPicker = function(x, y) {
            //Control Picker 선택여부
            const resultItem = {
                pick : false,   //선택여부
                kind : 0,        //선택된 Pick  1 : picker, 2: ok, 3 : cancel
            };
            if(!scope.EnableControlPicker || !drawingControlPicker) return resultItem;

            let fPickerSideSize = (view.Camera.clientWidth / 15.0) * controlPickerScale;
            if(controlPickerFixSize > 0)
                fPickerSideSize = controlPickerFixSize * controlPickerScale;
            else
                fPickerSideSize = (view.Camera.clientWidth / 15.0) * controlPickerScale;


            const sizeHalf = fPickerSideSize * 0.5;

            // mouse down이 해당 영역 안에 되었는지 확인
            if (scope.EnableControlMove === true) {
                if (checkMouseDownArea(0, x, y, sizeHalf) === true) {
                    resultItem.pick = true;
                    resultItem.kind = 1;
                    return resultItem;
                }

                if (scope.EnableControlOk === true) {
                     
                    let okbtnPos =  controlPickerPosition.x + controlPickerGap;
                    let cancelbtnPos = controlPickerPosition.x + (controlPickerGap * 2);
                   
                    /// OK버튼
                    if (view.Camera.clientWidth < okbtnPos){
                        if (checkMouseDownArea(-controlPickerGap, x, y, sizeHalf) === true){
                            resultItem.pick = true;
                            resultItem.kind = 2;
                            return resultItem;
                        } 
                    }
                    else {
                        if (checkMouseDownArea(+controlPickerGap, x, y, sizeHalf) === true){
                                resultItem.pick = true;
                                resultItem.kind = 2;
                                return resultItem;
                        }
                    }

                
                    ///Cancel 버튼
                    if (view.Camera.clientWidth < cancelbtnPos){
                        if (view.Camera.clientWidth < okbtnPos) {
                            if (checkMouseDownArea(-(controlPickerGap*2), x, y, sizeHalf) === true) {
                                resultItem.pick = true;
                                resultItem.kind = 3;
                                return resultItem;
                            }
                        }
                       else {
                            if (checkMouseDownArea(-controlPickerGap, x, y, sizeHalf) === true) {
                                resultItem.pick = true;
                                resultItem.kind = 3;
                                return resultItem;
                            }
                       }
                   }
                   else{
                        if (checkMouseDownArea(controlPickerGap*2, x, y, sizeHalf) === true) {
                            resultItem.pick = true;
                            resultItem.kind = 3;
                            return resultItem;
                        }
                   }
                }
                else { /// only cancel
                    let cancelbtnPos = controlPickerPosition.x + controlPickerGap;
                    if (view.Camera.clientWidth < cancelbtnPos){
                        if (checkMouseDownArea(-controlPickerGap, x, y, sizeHalf) === true) {
                            resultItem.pick = true;
                            resultItem.kind = 3;
                            return resultItem;
                        }
                    }
                    else{
                        if (checkMouseDownArea(controlPickerGap, x, y, sizeHalf) === true) {
                            resultItem.pick = true;
                            resultItem.kind = 3;
                            return resultItem;
                        }
                    }
                }

            }
            else {
                if (checkMouseDownArea(controlPickerGap, x, y, sizeHalf) === true) {
                    resultItem.pick = true;
                    resultItem.kind = 2;
                    return resultItem;
                }
                else if (checkMouseDownArea(controlPickerGap * 2, x, y, sizeHalf) === true) {
                    resultItem.pick = true;
                    resultItem.kind = 3;
                    return resultItem;
                }
                   
            }

            return resultItem;
        };

        
        /**
         * 컨트롤 선택 위치 설정
         * @param {VIZCore.Vector3} pos 화면 위치
         */
        this.SetControlPickerPositon = function(pos) {
            controlPickerPosition.copy(pos);
        };
        
        /**
         * 컨트롤 선택 크기 설정 (-1 인경우 화면크기 자동)
         * @param {number} size 고정 크기 
         */
        this.SetControlPickerSize = function(size) {
            controlPickerFixSize = size;
        };

        /**
         * 컨트롤 선택 크기 설정
         * @returns {number} size 고정 크기
         */
        this.GetControlPickerSize = function() {
            return controlPickerFixSize;
        };



        //#endregion

        
        /**
         * 지정한 개체를 선택가능 목록에 설정
         * @param {Array<number>} nodeLists 선택가능한 body
         * @param {boolean} bEnable 선택가능 여부 설정
         */
        this.SetPickDefinedObjects = function (nodeLists, bEnable) {
            view.Tree.EnableUseSelectionMulti(nodeLists, bEnable);
        };

        /**
         * 지정한 선택가능 개체 초기화
         */
        this.ClearDefinedObjects = function () {
            view.Tree.EnableUseSelectionMulti(undefined, true);
        };
        
    }
}

export default Pick;