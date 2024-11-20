/**
 * @author ssjo@softhills.net
 */
let UIBase = function (view, VIZCore) {
    //상속인 경우에는 사용하지 못함
    //scope 로 만들어놓은 경우 상속된 function이 충돌되어 가장 마지막에 생성한 this로 인식함
    //let scope = this;
    this.scope = this;
    this.VIZCore = VIZCore;
    this.view = view;

    // MouseState
    this._state = VIZCore.Enum.MOUSE_STATE.NONE;

    this.mouseLeftDown = false;
    this.mouseDownPosition = new VIZCore.Vector2();
    this.mouseLastPosition = new VIZCore.Vector2();
    this.timeMouseLeftDown = undefined;

    this.mouseMiddleDown = false;
    this.timeMouseMiddleDown = undefined;

    this.mouseRightDown = false;
    //this.mouseDownPosition = new VIZCore.Vector2();
    //this.mouseLastPosition = new VIZCore.Vector2();
    this.timeMouseRightDown = undefined;

    this.mouse = new VIZCore.Vector2();
    this._touchZoomDistanceStart = 0;
    this._touchZoomDistanceEnd = 0;
    this._touchLastCount = 0;   //touch End 
    this._touchLast = undefined; // touch Last position;
    this.delta = 0;

    this.EventCnt = 0;
    this.PivotUpdate = true;

    this.actionEnabled = true;
    //this.actionPivot = new VIZCore.Vector3();

    // KeyState
    this.keyCtrlDown =false;


    this.KeyPress = {
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        keycode: undefined
    };


    //init();
    //function init() {
    //
    //}

    // Long Press 확인
    let longpress = false;
    let presstimer = null;
    let longtarget = null;

    this.longPressStart = function (x, y, scope) {
        longpress = false;
        if (presstimer === null) {
            presstimer = setTimeout(function () {
                //console.log("long press");
                longpress = true;
                if(presstimer === null) return;                

                // body 선택
                let calPickBody = function (scope, body) {
                    if (scope.view.Browser.IsMS) {
                        scope.view.Camera.SetPivot(body.BBox.center);
                    }
                    else {
                        const resultPick = scope.view.Data.GetPickByBody(body.bodyId, x, y);
                        if (resultPick.pick) {
                            scope.view.Camera.SetPivot(resultPick.position);
                        }
                    }

                    scope.view.Camera.RenderPivot = true;
                    scope.view.Renderer.Render();
                };
                let resultPick = scope.view.Renderer.PickingCallback(x, y, scope, calPickBody, undefined);

                // const resultPickPosition = scope.view.Renderer.PickPositionObject(x, y);
                // if(resultPickPosition === undefined)
                // {
                //     let resultPick = scope.view.Renderer.PickingCallback(x, y, scope, calPickBody, undefined);
                // }
                // else
                // {
                //     scope.view.Camera.SetPivot(resultPickPosition);
                //     console.log("Depth:");
                //     console.log(resultPickPosition);

                // }

            }, 1000);
        }

        return false;
    };

    this.longPressEnd = function (x, y, scope) {
        if (presstimer !== null) {
            clearTimeout(presstimer);
            presstimer = null;
        }
    };

    this.longPressCheck = function (x, y, scope) {
        if (presstimer !== null) {
            let mouse = new scope.VIZCore.Vector2(x, y);
            let tmp = new scope.VIZCore.Vector2().subVectors(scope.mouseDownPosition, mouse);

            if (tmp.length() > 5) {
                //console.log("long press cancel!!");
                if (presstimer !== null) {
                    clearTimeout(presstimer);
                    presstimer = null;
                }
            }
        }
    };
    
    this.mousePivotUpdate = function(x, y, scope)
    {
        
        //let body = this.view.Renderer.Picking(this.mouse.x, this.mouse.y);
        //if (body !== undefined) {
        //    if (this.view.Browser.IsMS) {
        //        this.view.Camera.SetPivot(body.BBox.center);
        //    }
        //    else {
        //        //Pick 방식
        //        const resultPick = this.view.Data.GetPickByBody(body.bodyId, x, y);
        //        if (resultPick[0]) {
        //            this.view.Camera.SetPivot(resultPick[1]);
        //        }
        //
        //        //Depth 방식
        //        //let position = this.view.Renderer.PickPositionObject(this.mouse.x, this.mouse.y);
        //        //if (position !== undefined) {
        //        //    // 피벗 이동
        //        //    this.view.Camera.SetPivot(position);
        //        //}
        //    }
        //}

        // body 선택
        let calPickBody = function (scope, body) {
            if (scope.view.Browser.IsMS) {
                scope.view.Camera.SetPivot(body.BBox.center);
            }
            else {
                const resultPick = scope.view.Data.GetPickByBody(body.bodyId, x, y);
                if (resultPick.pick) {
                    scope.view.Camera.SetPivot(resultPick.position);
                }
                else {
                    scope.view.Camera.SetPivot(body.BBox.center);
                }

                //Depth 방식
                //let position = this.view.Renderer.PickPositionObject(this.mouse.x, this.mouse.y);
                //if (position !== undefined) {
                //    // 피벗 이동
                //    this.view.Camera.SetPivot(position);
                //}
            }
        };

        //custom Body 선택
        let calPickCustomBody = function (scope, customObject, body) {

            if (scope.view.Browser.IsMS) {
                scope.view.Camera.SetPivot(body.BBox.center);
            }
            else {
                const resultPick = scope.view.CustomObject.GetPickByBody(customObject.uuid, x, y);
                if (resultPick.pick) {
                    scope.view.Camera.SetPivot(resultPick.position);
                }
                else {
                    scope.view.Camera.SetPivot(body.BBox.center);
                }
            }

        };

        //Pivot을 위치 계산을 위한 부분이기에 속도측면 계산로직 제거
        if(!this.view.Camera.lockPivot) {

            let resultPick = this.view.Renderer.PickingCallback(this.mouse.x, this.mouse.y, this, calPickBody, calPickCustomBody);

            if(!resultPick)
            {
                //기능 편의성을 위해서 기본 Picking을 활용한 위치를 우선적으로 Pivot 으로 처리하며,
                // 선택을 할 수 없는 개체의 경우 
                // 형상위치기반으로 한번더 Pivot 설정
                const resultPickPosition = this.view.Renderer.PickPositionObject(this.mouse.x, this.mouse.y);
                if(resultPickPosition !== undefined)
                {
                    this.view.Camera.SetPivot(resultPickPosition);
                }
            }
            
            // if(resultPickPosition === undefined)
            // {
            //     let resultPick = this.view.Renderer.PickingCallback(this.mouse.x, this.mouse.y, this, calPickBody, calPickCustomBody);
            // }
            // else
            // {
            //     this.view.Camera.SetPivot(resultPickPosition);
            //     console.log("Depth:");
            //     console.log(resultPickPosition);

            // }
        }

    };

    this.update = function (scope) {

        if (this.view.Configuration.Control.Lock === true)
            return;

        if( !this.view.MultiView[this.view.CameraIndex].IsUseControlState(scope._state) )
            return;

        if (this.view.Configuration.Control.Version === 0) {
            scope.action(scope, scope._state);
        }
        else if (this.view.Configuration.Control.Version === 1) {
            //console.log("Mouse State :: ", scope._state);
            // 선택 = 좌측 클릭
            // 화면 이동 = 휠 클릭 + 드래그
            // 화면 회전 = 좌측 클릭 + 드래그
            // 피벗 = 좌측 클릭 (길게)

            //Touch 
            if(scope._state === this.VIZCore.Enum.MOUSE_STATE.TOUCH_ZOOM_PAN)
            {
                scope.action(scope, scope._state);
                return;
            }


            switch (this.view.Control._sub) {
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE:
                    {
                        scope.action(scope, scope._state);
                    }
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_FIXEDZ:
                {
                    
                    if(scope._state === 0 || scope._state === VIZCore.Enum.MOUSE_STATE.TOUCH_ROTATE) // Rotate
                    {
                        // 일반 로테이트, z축 고정
                        //z축고정 후
                        scope.view.FixZAxis = true;
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE);
                        //z축 고정설정 복원
                        scope.view.FixZAxis = false;
                    }
                    else if(scope._state === 2) // Pan
                    {
                        if(scope.KeyPress.shiftKey) // Rotate
                        {
                            //z축고정 후
                            scope.view.FixZAxis = true;
                            scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE);
                            //z축 고정설정 복원
                            scope.view.FixZAxis = false;
                        }
                        else{
                            scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.PAN);    
                        }
                    }
                    else if(scope._state === 1) // zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ZOOM);
                    }
                }
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE:
                {
                    if(scope._state === 0 || scope._state === VIZCore.Enum.MOUSE_STATE.TOUCH_ROTATE) // Rotate
                    {
                        // 피벗 기준 로테이트
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE);
                    }
                    else if(scope._state === 1) // Zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ZOOM);
                    }
                    else if(scope._state === 2) // Pan
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.PAN);
                    }
                    //// 피벗 기준 로테이트
                    //scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE);
                }
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ORBIT:
                {
                    if(scope._state === 0){ //roate
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ORBIT);
                    }
                    else if(scope._state === 1) // Zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ZOOM);
                    }
                    else if(scope._state === 2) // PAN
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.PAN);
                    }

                }
                    break;
                
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_WFIXEDZ:
                {
                    if(scope._state === 0 || scope._state === VIZCore.Enum.MOUSE_STATE.TOUCH_ROTATE) // Rotate
                    {
                        // Z축 기준 회전
                        scope.view.FixZAxis = false;
                        scope.view.Camera.FixWorldAxis = true;
                        scope.view.Camera.WorldAxis = new VIZCore.Vector3(0.0, 0.0, 1.0);
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE);
                        scope.view.Camera.FixWorldAxis = false;
                    }
                    else if(scope._state === 2) // Pan
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.PAN);
                    }
                    else if(scope._state === 1) // zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ZOOM);
                    }
                    
                }
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.PAN:
                {
                    if(scope._state === 0) // Rotate
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE);
                    }
                    else if(scope._state === 2) // Pan
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.PAN);
                    }
                    else if(scope._state === 1) // zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ZOOM);
                    }
                    
                }
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_CAMERA:
                {
                    if(scope._state === 0) // Rotate
                    {
                        if(scope.KeyPress.shiftKey) // Rotate
                        {
                            //z축고정 후
                            scope.view.FixZAxis = true;
                            scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE);
                            //z축 고정설정 복원
                            scope.view.FixZAxis = false;
                        }
                        else
                            scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE_CAMERA);
                    }
                    if(scope._state === 2) // Pan
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.PAN);
                    }
                    else if(scope._state === 1) // zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ZOOM);
                    }
                }
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.SELECT:
                {
                }
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.FLY:
                {
                }
                    break;
                default: {
                    scope.action(scope, this.view.Control._sub);
                }
                break;
            }
        }
        else if (this.view.Configuration.Control.Version === 2) {
            // 선택 = 좌측 클릭
            // 화면 이동 = 휠 클릭 + 좌측 클릭 + 드래그
            // 피벗 = 휠 클릭
            // 화면 회전 = 좌측 클릭 + 드래그

            //Touch 
            if(scope._state === this.VIZCore.Enum.MOUSE_STATE.TOUCH_ZOOM_PAN)
            {
                scope.action(scope, scope._state);
                return;
            }

            switch (this.view.Control._sub) {
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE:
                    {
                        scope.action(scope, scope._state);
                    }
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_FIXEDZ:
                {
                    
                    if(scope._state === this.VIZCore.Enum.MOUSE_STATE.ROTATE
                        || scope._state === VIZCore.Enum.MOUSE_STATE.TOUCH_ROTATE) // Rotate
                    {
                        // 일반 로테이트, z축 고정
                        //z축고정 후
                        scope.view.FixZAxis = true;
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE);
                        //z축 고정설정 복원
                        scope.view.FixZAxis = false;
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.PAN) // Pan
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.PAN);
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.ZOOM) // zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ZOOM);
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM) // Mouse zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM);
                    }
                }
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE:
                {
                    if(scope._state === this.VIZCore.Enum.MOUSE_STATE.ROTATE
                        || scope._state === VIZCore.Enum.MOUSE_STATE.TOUCH_ROTATE) // Rotate
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE);
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.PAN) // Pan
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.PAN);
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.ZOOM) // zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ZOOM);
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM) // Mouse zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM);
                    }
                    //// 피벗 기준 로테이트
                    //scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE);
                }
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ORBIT:
                {
                    //if( this.mouseLeftDown === true && this.mouseRightDown === true){
                    //    scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ORBIT);
                    //    break;
                    //}
                    
                    //if(this.mouseMiddleDown===true && this.mouseLeftDown===true){
                    //    scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ORBIT);
                    //}                    
                    //if(this.mouseMiddleDown===true && this.mouseRightDown===true){
                    //    scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ORBIT);
                    //}
                    
                    if(scope._state === this.VIZCore.Enum.MOUSE_STATE.ROTATE){ //roate
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ORBIT);
                    }
                    else if(scope._state === 1) // Zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ZOOM);
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM) // Zoom
                    {
                        if(this.mouseLeftDown === false && this.mouseRightDown === false && this.mouseMiddleDown === true)
                            scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM);

                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.PAN) // PAN
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.PAN);
                    }
                }
                    break;
                
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_WFIXEDZ:
                {
                    if(scope._state === this.VIZCore.Enum.MOUSE_STATE.ROTATE
                        || scope._state === VIZCore.Enum.MOUSE_STATE.TOUCH_ROTATE) // Rotate
                    {
                        // Z축 기준 회전
                        scope.view.FixZAxis = false;
                        scope.view.Camera.FixWorldAxis = true;
                        scope.view.Camera.WorldAxis = new VIZCore.Vector3(0.0, 0.0, 1.0);
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE);
                        scope.view.Camera.FixWorldAxis = false;
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.PAN) // Pan
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.PAN);
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.ZOOM) // zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ZOOM);
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM) // Mouse zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM);
                    }
                    
                }
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.PAN:
                {
                    if(scope._state === this.VIZCore.Enum.MOUSE_STATE.ROTATE) // Rotate
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE);
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.PAN) // Pan
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.PAN);
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.ZOOM) // zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ZOOM);
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM) // Mouse zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM);
                    }
                    
                }
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_CAMERA:
                {
                    if(scope._state === 0) // Rotate
                    {
                        if(scope.KeyPress.shiftKey) // Rotate
                        {
                            //z축고정 후
                            scope.view.FixZAxis = true;
                            scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE);
                            //z축 고정설정 복원
                            scope.view.FixZAxis = false;
                        }
                        else
                            scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ROTATE_CAMERA);
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.PAN) // Pan
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.PAN);
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.ZOOM) // zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.ZOOM);
                    }
                    else if(scope._state === this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM) // Mouse zoom
                    {
                        scope.action(scope, this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM);
                    }
                }
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.SELECT:
                {
                }
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.FLY:
                {
                }
                    break;
                default: {
                    scope.action(scope, this.view.Control._sub);
                }
                break;
            }
        }
    };

    this.action = function(scope, actionType){
        let bCameraChanged = false;

        if (actionType === this.VIZCore.Enum.MOUSE_STATE.ROTATE) {
            if (scope.mouse.x === scope.mouseLastPosition.x && scope.mouse.y === scope.mouseLastPosition.y) return;

            let dx = scope.mouse.x - scope.mouseLastPosition.x;
            let dy = scope.mouse.y - scope.mouseLastPosition.y;

            
            let viewWidth = view.Renderer.GetSizeWidth();
            let viewHeight = view.Renderer.GetSizeHeight();

            if(this.view.Configuration.Control.RotateScreenRate)
            {
                //둘러보기
                //let xRotateSpeed = 5.5;
                //let yRotateSpeed = 5;

                //궤도
                //기본 값 0.5 에서 속도 맞춤
                let xRotateSpeed = 11.0;
                let yRotateSpeed = 10;

                let rotateFactor = 1.0;
                if(this.view.Configuration.Control.RotateFactor > 0 && this.view.Configuration.Control.RotateFactor <= 100)
                    rotateFactor = this.view.Configuration.Control.RotateFactor / 100;
                if(rotateFactor <= 0)
                    rotateFactor = 0.1;
    
                dx = (dx / viewWidth) * (xRotateSpeed * rotateFactor);
                dy = (dy / viewHeight) * (yRotateSpeed * rotateFactor);
            }
            else
            {
                let fRotateSpeed = 100;
                let rotateFactor = 1.0;
                if(this.view.Configuration.Control.RotateFactor > 0 && this.view.Configuration.Control.RotateFactor <= 100)
                    rotateFactor = this.view.Configuration.Control.RotateFactor / 100;
                 if(rotateFactor <= 0)
                    rotateFactor = 0.1;
    
                let fRotate = fRotateSpeed / rotateFactor;
    
                dx = dx / fRotate;
                dy = dy / fRotate;
            }

            {
                //Pivot 화면 밖에 있는경우 가운데로 변경
                let vRotPivot = new VIZCore.Vector3().copy(this.view.Camera.pivot);
                let matMVP = new VIZCore.Matrix4().copy(this.view.Camera.matMVP);
                let vSreenPivot = this.view.Camera.world2ScreenWithMatrix(matMVP, vRotPivot);

                //Pivot 화면 안에 있는지 확인
                if(!(vSreenPivot.x >= 0.0 && vSreenPivot.x <= viewWidth &&
                    vSreenPivot.y >= 0.0 && vSreenPivot.y <= viewHeight ) )
                {
                    vSreenPivot.x = viewWidth * 0.5; vSreenPivot.y = viewHeight * 0.5; 
                    vRotPivot = this.view.Camera.screen2WorldWithMatrix(matMVP, vSreenPivot);

                    this.view.Camera.SetPivot(vRotPivot);
                }
            }

            if (this.view.FixZAxis) {
                let angle = new this.VIZCore.Vector3(dy, dx, dx);
                this.view.Camera.CameraRotate(angle);
            }
            else {
                let angle = new this.VIZCore.Vector3(dy, dx, 0.0);
                this.view.Camera.CameraRotate(angle);
            }

            this.view.Camera.ResizeGLWindow();
            this.view.Renderer.MainFBClear();
            this.view.Renderer.Render();

            bCameraChanged = true;
        }
        else if (actionType === this.VIZCore.Enum.MOUSE_STATE.ZOOM) {

            let cameraZoomRatio = this.view.Camera.cameraZoomRatio;

            if (this.view.Configuration.Control.Zoom.Ratio !== undefined){
                cameraZoomRatio = this.view.Configuration.Control.Zoom.Ratio;
            }

            let fZoomValue = cameraZoomRatio;
            if (this.view.Camera.perspectiveView) {
                let vPos = new this.VIZCore.Vector3().copy(this.view.Camera.pivot);
                //vPos.applyMatrix4(this.view.Camera.cameraMatrix);

                //let vEye = new this.VIZCore.Vector3();
                //vEye.set(0.0, 0.0, this.view.Camera.viewDistance);
                let vEye = this.view.Camera.GetPerspectiveEyePos();

                let vPosWithEyeSub = new this.VIZCore.Vector3().subVectors(vPos, vEye);
                let subLength = vPosWithEyeSub.length();
                if (subLength < 0.0) subLength = 0;
                let distMul = (subLength - this.view.Camera.nearZoom * 1.5);
                distMul = Math.abs(distMul);

                let fMulVal = distMul * fZoomValue;
                fZoomValue = fMulVal / this.view.Camera.viewDistance;

                let minZoomValue = this.view.Configuration.Control.Zoom.MinZoomValue * 0.0001;
                if (fZoomValue > 0.5) fZoomValue = 0.5;
                //else if (fZoomValue < 0.001) fZoomValue = 0.001;
                else if (fZoomValue < minZoomValue) 
                {
                    fZoomValue = minZoomValue;
                }

                if(this.view.Configuration.Control.Zoom.UseFixed)
                    fZoomValue = cameraZoomRatio; //0.15
            }
            else {
                fZoomValue *= 0.5;
            }

            if (scope.delta > 0) {
                this.view.Camera.MulViewDistance(1.0 - fZoomValue);
            }
            else {
                this.view.Camera.MulViewDistance(1.0 / (1.0 - fZoomValue));
            }

            scope._touchZoomDistanceStart = scope._touchZoomDistanceEnd;

            this.view.Camera.ResizeGLWindow();
            this.view.Renderer.MainFBClear();
            this.view.Renderer.Render();

            bCameraChanged = true;
        }
        else if (actionType === this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM) {
            let fZoomValue = this.view.Camera.cameraZoomRatio;

            let zoomIn = this.mouseLastPosition.y - this.mouse.y;
            if (this.view.Camera.perspectiveView) {
                let vPos = new this.VIZCore.Vector3().copy(this.view.Camera.pivot);
                //vPos.applyMatrix4(this.view.Camera.cameraMatrix);

                //let vEye = new this.VIZCore.Vector3();
                //vEye.set(0.0, 0.0, this.view.Camera.viewDistance);
                let vEye = this.view.Camera.GetPerspectiveEyePos();

                let vPosWithEyeSub = new this.VIZCore.Vector3().subVectors(vPos, vEye);
                let subLength = vPosWithEyeSub.length();
                if (subLength < 0.0) subLength = 0;
                let distMul = (subLength - this.view.Camera.nearZoom * 1.5);
                distMul = Math.abs(distMul);

                let fMulVal = distMul * fZoomValue;
                fZoomValue = fMulVal / this.view.Camera.viewDistance;

                if (fZoomValue > 0.5) fZoomValue = 0.5;
                else if (fZoomValue < 0.001) fZoomValue = 0.001;
            }
            else {
                fZoomValue *= 0.5;
            }

            fZoomValue = fZoomValue * Math.abs(zoomIn) / 15.0;
            if(zoomIn > 0) {
            //if (scope.delta > 0) {
                fZoomValue/= 5;
                this.view.Camera.MulViewDistance(1.0 - fZoomValue);
            }
            else {
                fZoomValue/= 5;
                this.view.Camera.MulViewDistance(1.0 / (1.0 - fZoomValue));
            }

            scope._touchZoomDistanceStart = scope._touchZoomDistanceEnd;

            this.view.Camera.RenderPivot = true;

            this.view.Camera.ResizeGLWindow();
            this.view.Renderer.MainFBClear();
            this.view.Renderer.Render();

            bCameraChanged = true;
        }
        else if (actionType === this.VIZCore.Enum.MOUSE_STATE.PAN) {

            if (scope.mouse.x === scope.mouseLastPosition.x && scope.mouse.y === scope.mouseLastPosition.y) return;

            let dx = scope.mouse.x - scope.mouseLastPosition.x;
            let dy = scope.mouse.y - scope.mouseLastPosition.y;

            let MVPmatrix = new this.VIZCore.Matrix4().multiplyMatrices(this.view.Camera.projectionMatrix, this.view.Camera.cameraMatrix);

            let vZero = this.view.Camera.world2ScreenWithMatrix(MVPmatrix, new this.VIZCore.Vector3().copy(this.view.Camera.pivot));

            let vScreen1 = new this.VIZCore.Vector3(scope.mouseLastPosition.x, scope.mouseLastPosition.y, vZero.z);
            let vScreen2 = new this.VIZCore.Vector3(scope.mouse.x, scope.mouse.y, vZero.z);

            //console.log("Pan Call!!" + vScreen1.x + " " + vScreen1.y + " " + vScreen1.z);

            let world1 = this.view.Camera.screen2WorldWithMatrix(this.view.Camera.projectionMatrix, vScreen1);
            let world2 = this.view.Camera.screen2WorldWithMatrix(this.view.Camera.projectionMatrix, vScreen2);

            let vTrans = new this.VIZCore.Vector3().subVectors(world2, world1);

            if (vZero.z > 1.0)
                vTrans.multiplyScalar(-1);

            if(this.view.Camera.ctrlTranslatePivot)
            {
                const ptWorld1 = this.view.Camera.screen2WorldWithMatrix(MVPmatrix, vScreen1);
                const ptWorld2 = this.view.Camera.screen2WorldWithMatrix(MVPmatrix, vScreen2);
                
                const vPtTrans = new this.VIZCore.Vector3().subVectors(ptWorld2, ptWorld1);
                //조작시 피벗 위치 이동
                this.view.Camera.SetPivot(new VIZCore.Vector3().subVectors(this.view.Camera.pivot, vPtTrans));
            }

            this.view.Camera.CameraTranslate(vTrans);

            //let matTranslation = new this.VIZCore.Matrix4();
            //matTranslation.makeTranslation(vTrans.x, vTrans.y, vTrans.z);            
            ////this.view.Camera.cameraMatrix.multiply(matTranslation);
            //let matModelMatrix = new this.VIZCore.Matrix4().copy(this.view.Camera.cameraMatrix);
            //this.view.Camera.cameraMatrix.multiplyMatrices(matTranslation, matModelMatrix);

            this.view.Camera.ResizeGLWindow();
            this.view.Renderer.MainFBClear();
            this.view.Renderer.Render();

            bCameraChanged = true;
        }
        else if (actionType === this.VIZCore.Enum.MOUSE_STATE.TOUCH_ROTATE) {
            if (scope.mouse.x === scope.mouseLastPosition.x && scope.mouse.y === scope.mouseLastPosition.y) return;

            let dx = scope.mouse.x - scope.mouseLastPosition.x;
            let dy = scope.mouse.y - scope.mouseLastPosition.y;
            
            if(this.view.Configuration.Control.RotateScreenRate)
            {
                //둘러보기
                //궤도
                let xRotateSpeed = 10.0;
                let yRotateSpeed = 10.0;

                let rotateFactor = 1.0;
                if(this.view.Configuration.Control.RotateFactor > 0 && this.view.Configuration.Control.RotateFactor <= 100)
                    rotateFactor = this.view.Configuration.Control.RotateFactor / 100;
                if(rotateFactor <= 0)
                    rotateFactor = 0.1;

                let viewWidth = this.view.Renderer.GetSizeWidth();
                let viewHeight = this.view.Renderer.GetSizeHeight();
    
                dx = (dx / viewWidth) * (xRotateSpeed * rotateFactor);
                dy = (dy / viewHeight) * (yRotateSpeed * rotateFactor);
            }
            else
            {
                let fRotateSpeed = 100;
                let rotateFactor = 1.0;
                if(this.view.Configuration.Control.RotateFactor > 0 && this.view.Configuration.Control.RotateFactor <= 100)
                    rotateFactor = this.view.Configuration.Control.RotateFactor / 100;
                 if(rotateFactor <= 0)
                    rotateFactor = 0.1;
    
                let fRotate = fRotateSpeed / rotateFactor;
    
                dx = dx / fRotate;
                dy = dy / fRotate;
            }

            if (this.view.FixZAxis) {
                let angle = new this.VIZCore.Vector3(dy, dx, dx);
                this.view.Camera.CameraRotate(angle);
            }
            else {
                let matX = new this.VIZCore.Matrix4().makeRotationX(dy);
                let matY = new this.VIZCore.Matrix4().makeRotationY(dx);

                let rotateMatrix = new this.VIZCore.Matrix4().multiplyMatrices(matX, matY);
                this.view.Camera.CameraRotateByMatrix(rotateMatrix);
            }


            // if (this.view.FixZAxis) {
            //     let angle = new this.VIZCore.Vector3(dy / 100.0, dx / 100.0, dx / 100.0);
            //     this.view.Camera.CameraRotate(angle);
            // }
            // else {
            //     let matX = new this.VIZCore.Matrix4().makeRotationX(dy / 100.0);
            //     let matY = new this.VIZCore.Matrix4().makeRotationY(dx / 100.0);

            //     let rotateMatrix = new this.VIZCore.Matrix4().multiplyMatrices(matX, matY);
            //     this.view.Camera.CameraRotateByMatrix(rotateMatrix);
            // }

            this.view.Camera.ResizeGLWindow();
            this.view.Renderer.MainFBClear();
            this.view.Renderer.Render();

            bCameraChanged = true;
        }
        else if (actionType === this.VIZCore.Enum.MOUSE_STATE.TOUCH_ZOOM_PAN) {
            //alert('TouchZoomPan : ' + scope.delta);
            //Zoom
            if (scope.delta !== 0) {
                this.view.Camera.MulViewDistance(scope.delta);
            }

            scope._touchZoomDistanceStart = scope._touchZoomDistanceEnd;

            //Pan
            if (scope.mouse.x !== scope.mouseLastPosition.x && scope.mouse.y !== scope.mouseLastPosition.y) {

                let dx = scope.mouse.x - scope.mouseLastPosition.x;
                let dy = scope.mouse.y - scope.mouseLastPosition.y;

                let MVPmatrix = new this.VIZCore.Matrix4().multiplyMatrices(this.view.Camera.projectionMatrix, this.view.Camera.cameraMatrix);

                let vZero = this.view.Camera.world2ScreenWithMatrix(MVPmatrix, new this.VIZCore.Vector3().copy(this.view.Camera.pivot));

                let vScreen1 = new this.VIZCore.Vector3(scope.mouseLastPosition.x, scope.mouseLastPosition.y, vZero.z);
                let vScreen2 = new this.VIZCore.Vector3(scope.mouse.x, scope.mouse.y, vZero.z);

                let world1 = this.view.Camera.screen2WorldWithMatrix(this.view.Camera.projectionMatrix, vScreen1);
                let world2 = this.view.Camera.screen2WorldWithMatrix(this.view.Camera.projectionMatrix, vScreen2);

                let vTrans = new this.VIZCore.Vector3().subVectors(world2, world1);

                if (vZero.z > 1.0)
                    vTrans.multiplyScalar(-1);

                if(this.view.Camera.ctrlTranslatePivot)
                {
                    const ptWorld1 = this.view.Camera.screen2WorldWithMatrix(MVPmatrix, vScreen1);
                    const ptWorld2 = this.view.Camera.screen2WorldWithMatrix(MVPmatrix, vScreen2);
                    
                    const vPtTrans = new this.VIZCore.Vector3().subVectors(ptWorld2, ptWorld1);
                    //조작시 피벗 위치 이동
                    this.view.Camera.SetPivot(new VIZCore.Vector3().subVectors(this.view.Camera.pivot, vPtTrans));
                }
        

                let matTranslation = new this.VIZCore.Matrix4();
                matTranslation.makeTranslation(vTrans.x, vTrans.y, vTrans.z);
                //this.view.Camera.cameraMatrix.multiply(matTranslation);
                let matModelMatrix = new this.VIZCore.Matrix4().copy(this.view.Camera.cameraMatrix);
                this.view.Camera.cameraMatrix.multiplyMatrices(matTranslation, matModelMatrix);

            }

            this.view.Camera.ResizeGLWindow();
            this.view.Renderer.MainFBClear();
            this.view.Renderer.Render();

            bCameraChanged = true;
        }        
        else if(actionType === this.VIZCore.Enum.MOUSE_STATE.ROTATE_CAMERA) {
            if (scope.mouse.x === scope.mouseLastPosition.x && scope.mouse.y === scope.mouseLastPosition.y) return;

            let dx = scope.mouse.x - scope.mouseLastPosition.x;
            let dy = scope.mouse.y - scope.mouseLastPosition.y;
            
            let viewWidth = view.Renderer.GetSizeWidth();
            let viewHeight = view.Renderer.GetSizeHeight();

            if(this.view.Configuration.Control.RotateScreenRate)
            {
                //둘러보기
                let xRotateSpeed = 5.5;
                let yRotateSpeed = 5;

                //궤도
                //기본 값 0.5 에서 속도 맞춤
                //let xRotateSpeed = 11.0;
                //let yRotateSpeed = 10;

                let rotateFactor = 1.0;
                if(this.view.Configuration.Control.RotateFactor > 0 && this.view.Configuration.Control.RotateFactor <= 100)
                    rotateFactor = this.view.Configuration.Control.RotateFactor / 100;
                if(rotateFactor <= 0)
                    rotateFactor = 0.1;
    
                dx = (dx / viewWidth) * (xRotateSpeed * rotateFactor);
                dy = (dy / viewHeight) * (yRotateSpeed * rotateFactor);
            }
            else
            {
                let fRotateSpeed = 100;
                let rotateFactor = 1.0;
                if(this.view.Configuration.Control.RotateFactor > 0 && this.view.Configuration.Control.RotateFactor <= 100)
                    rotateFactor = this.view.Configuration.Control.RotateFactor / 100;
                 if(rotateFactor <= 0)
                    rotateFactor = 0.1;
    
                let fRotate = fRotateSpeed / rotateFactor;
    
                dx = dx / fRotate;
                dy = dy / fRotate;
            }

            let rotate_camera_pivot = new VIZCore.Vector3(this.view.Camera.pivot);
            if(this.view.Camera.perspectiveView) {
                rotate_camera_pivot.copy(this.view.Camera.GetPerspectiveEyePos()); //원근
            }
            else
                rotate_camera_pivot.copy(this.view.Camera.GetCameraPos()); //평행            

            if (this.view.FixZAxis) {
                let angle = new this.VIZCore.Vector3(dy, dx, dx);
                this.view.Camera.CameraRotate(angle, rotate_camera_pivot);
            }
            else {
                let angle = new this.VIZCore.Vector3(dy, dx, 0.0);
                this.view.Camera.CameraRotate(angle, rotate_camera_pivot);
            }

            this.view.Camera.ResizeGLWindow();
            this.view.Renderer.MainFBClear();
            this.view.Renderer.Render();

            bCameraChanged = true;
        }
        if (actionType === this.VIZCore.Enum.MOUSE_STATE.ORBIT) {
            if (scope.mouse.x === scope.mouseLastPosition.x && scope.mouse.y === scope.mouseLastPosition.y) return;           

            //matRotate.SetMatrixRotateAxis(vUp, -fFovH / 2.0);
            //matRotate.makeRotationAxis2(vUp, -fFovH / 2.0);


            //console.log("orbit_test");
            let rotateMatrix;

            let viewWidth = view.Renderer.GetSizeWidth();
            let viewHeight = view.Renderer.GetSizeHeight();
            let centerX=viewWidth/2;
            let centerY=viewHeight/2;
            let radius=Math.min(centerX*0.6,centerY*0.6); // ->RenderUtil   //limit orbit rotation

            let vCenter =  new VIZCore.Vector3(centerX,centerY,0);
            let vMouse = new VIZCore.Vector3(scope.mouse.x,scope.mouse.y,0);
            let vLMouse = new VIZCore.Vector3(scope.mouseLastPosition.x,scope.mouseLastPosition.y,0);
            let vDir = new VIZCore.Vector3().subVectors(vMouse,vCenter);
            let vLDir = new VIZCore.Vector3().subVectors(vLMouse,vCenter);
            let fMouseLen = vDir.length();
            let nDir=vDir.normalize();
            let nLDir=vLDir.normalize();


            if(true)
            {
                if(vLDir.length()>radius){
                    let vMouse3 = new VIZCore.Vector3().addVectors(vCenter,new VIZCore.Vector3().copy(nLDir).multiplyScalar(radius))//    vCenter + vlDir*radius;
                    vLMouse.x = vMouse3.x;
                    vLMouse.y = vMouse3.y;
                }
                if(fMouseLen>radius){
                    let vMouse2 = new VIZCore.Vector3().addVectors(vCenter,new VIZCore.Vector3().copy(nDir).multiplyScalar(radius))//    vCenter + vDir*radius;                
                    vMouse.x = vMouse2.x;
                    vMouse.y = vMouse2.y;
                }
                let y = (vLMouse.y-centerY)/radius;
                if(y <-1) y=-1;
                if(y > 1) y=1;
                let vAngle1 = Math.asin(y);

                let hSize=Math.cos(vAngle1)*radius;
                let x = (vLMouse.x-centerX)/hSize;
                if(x <-1) x=-1;
                if(x > 1) x=1;
                let hAngle1=Math.asin(x);

                y=(vMouse.y-centerY)/radius;
                if(y<-1)y=-1;
                if(y>1)y=1;
                let vAngle2=Math.asin(y);
                hSize=Math.cos(vAngle2)*radius;
                x=(vMouse.x-centerX)/hSize;
                if(x<-1)x=-1;
                if(x>1)x=1;
                let hAngle2 = Math.asin(x);

                let matVRotate = new VIZCore.Matrix4();
                let matHRotate = new VIZCore.Matrix4();
                let vInit=new VIZCore.Vector3(0,0,1);
                matVRotate.makeRotationX(-vAngle1);
                matHRotate.makeRotationY(-hAngle1);
                let vPos1 = new VIZCore.Matrix4().multiplyMatrices(matHRotate,matVRotate);
                vPos1=vPos1.multiplyVector(vInit);

                matVRotate.makeRotationX(-vAngle2);
                matHRotate.makeRotationY(-hAngle2);
                let vPos2 = new VIZCore.Matrix4().multiplyMatrices(matHRotate,matVRotate);
                vPos2=vPos2.multiplyVector(vInit);

                let vAxis = new VIZCore.Vector3().crossVectors(vPos2,vPos1);
                vAxis=vAxis.normalize();
                
                
                vAxis.z=-vAxis.z;


                vDir=new VIZCore.Vector3().subVectors(vPos2,vPos1);
                vDir=vDir.normalize();

                let fRate=vDir.dot(vAxis);
                fRate = Math.sqrt(1-fRate*fRate);
                let fAngle = fRate*new VIZCore.Vector3().subVectors(vPos2,vPos1).length();

                

                rotateMatrix=new VIZCore.Matrix4().makeRotationAxis(vAxis,fAngle);             
            //this.view.Camera.CameraRotateByWorldAxis(vAxis, fAngle);

            }    
            
            let sz=0;
            if( fMouseLen > radius ){
                let vMouse2 = new VIZCore.Vector3().addVectors(vCenter,nDir.multiplyScalar(radius))//    vCenter + vDir*radius;
                let vMouse3 = new VIZCore.Vector3().addVectors(vCenter,nLDir.multiplyScalar(radius))
                vMouse.x = vMouse2.x;
                vMouse.y = vMouse2.y;
                vLMouse.x = vMouse3.x;
                vLMouse.y = vMouse3.y;

                let mAngle = Math.atan2(vMouse.y-vCenter.y,vMouse.x-vCenter.x);
                let mLAngle = Math.atan2(vLMouse.y-vCenter.y,vLMouse.x-vCenter.x);
                sz = mAngle - mLAngle;
            }            
            this.view.Renderer.SetOrbitMousePos(new VIZCore.Vector3().copy(vMouse));

            
            let dx = vMouse.x - vLMouse.x;
            let dy = vMouse.y - vLMouse.y;

            if(sz<0)
                sz=1;
            else if(sz>0)
                sz=-1;
                

            dx=dx/radius;
            dy=dy/radius;

            /*
            if(this.view.Configuration.Control.RotateScreenRate)
            {
                //둘러보기
                //let xRotateSpeed = 5.5;
                //let yRotateSpeed = 5;

                //궤도
                //기본 값 0.5 에서 속도 맞춤
                let xRotateSpeed = 11.0;
                let yRotateSpeed = 10;

                let rotateFactor = 1.0;
                if(this.view.Configuration.Control.RotateFactor > 0 && this.view.Configuration.Control.RotateFactor <= 100)
                    rotateFactor = this.view.Configuration.Control.RotateFactor / 100;
                if(rotateFactor <= 0)
                    rotateFactor = 0.1;
    
                dx = (dx / viewWidth) * (xRotateSpeed * rotateFactor);
                dy = (dy / viewHeight) * (yRotateSpeed * rotateFactor);
            }
            else
            {
                let fRotateSpeed = 100;
                let rotateFactor = 1.0;
                if(this.view.Configuration.Control.RotateFactor > 0 && this.view.Configuration.Control.RotateFactor <= 100)
                    rotateFactor = this.view.Configuration.Control.RotateFactor / 100;
                 if(rotateFactor <= 0)
                    rotateFactor = 0.1;
    
                let fRotate = fRotateSpeed / rotateFactor;
    
                dx = dx / fRotate;
                dy = dy / fRotate;
            }
            */

            //Pivot 항상 가운데로 변경            
            let vRotPivot = new VIZCore.Vector3().copy(this.view.Camera.pivot);
            let matMVP = new VIZCore.Matrix4().copy(this.view.Camera.matMVP);
            let vSreenPivot = this.view.Camera.world2ScreenWithMatrix(matMVP, vRotPivot);

            vSreenPivot.x = viewWidth * 0.5; vSreenPivot.y = viewHeight * 0.5; 
            vRotPivot = this.view.Camera.screen2WorldWithMatrix(matMVP, vSreenPivot);

            //vRotPivot.x=-vRotPivot.x;
            //vRotPivot.y=-vRotPivot.y;
            //vRotPivot.z=-vRotPivot.z;

            //let bbox = this.view.Data.GetBBox();            
            //vRotPivot.z=bbox.center.z;
            this.view.Camera.SetPivot(vRotPivot);

            //console.log(vRotPivot);

            let angle;
            if(sz===0){
                //let dz = Math.sqrt(dx*dx+dy*dy)*sz;
                //angle = new this.VIZCore.Vector3(dy, dx, 0);
                this.view.Camera.CameraRotateByMatrix(rotateMatrix);
            }
            else{
                let dz = Math.sqrt(dx*dx+dy*dy)*sz;
                angle = new this.VIZCore.Vector3(0, 0, dz);
                this.view.Camera.CameraRotate(angle);  
            }
            
            //let angle = new this.VIZCore.Vector3(dy, dx, 0);

            //this.view.Camera.CameraRotateByMatrix();
                     
            this.view.Camera.ResizeGLWindow();
            this.view.Renderer.MainFBClear();
            if(this.view.Renderer.GetRenderOrbit())
                this.view.Renderer.SetRenderOrbit(true);
            
            
            
            this.view.Renderer.Render();

            bCameraChanged = true;
        }


        const canvas_review = this.view.Canvas_Review;
        if (canvas_review !== undefined && canvas_review !== null) {

            if (actionType === this.VIZCore.Enum.MOUSE_STATE.ROTATE) {
                this.view.Camera.RenderPivot = true;
                canvas_review.style.cursor = `url('${this.view.Control.imageObjects.rotate.src}'), auto`;
            }
            else if (actionType === this.VIZCore.Enum.MOUSE_STATE.PAN) {
                this.view.Camera.RenderPivot = true;
                canvas_review.style.cursor = `url('${this.view.Control.imageObjects.move.src}'), auto`;
            }
            else if (actionType === this.VIZCore.Enum.MOUSE_STATE.ZOOM || actionType === this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM) {
                this.view.Camera.RenderPivot = true;
                canvas_review.style.cursor = `url('${this.view.Control.imageObjects.zoom.src}'), auto`;
            }

            
            const canvas_dual = document.getElementById(scope.view.GetViewID() + 'canvas_multi');
            if (canvas_dual !== undefined && canvas_dual !== null) {
                if (actionType === this.VIZCore.Enum.MOUSE_STATE.ROTATE) {
                    canvas_dual.style.cursor = `url('${this.view.Control.imageObjects.rotate.src}'), auto`;
                }
                else if (actionType === this.VIZCore.Enum.MOUSE_STATE.PAN) {
                    canvas_dual.style.cursor = `url('${this.view.Control.imageObjects.move.src}'), auto`;
                }
                else if (actionType === this.VIZCore.Enum.MOUSE_STATE.ZOOM || actionType === this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM) {
                    canvas_dual.style.cursor = `url('${this.view.Control.imageObjects.zoom.src}'), auto`;
                }

            }
        }

        //this.view.Renderer.Render();
        scope.mouseLastPosition = scope.mouse;

        // 카메라 이벤트 발생
        if (bCameraChanged && this.view.Configuration.Event.EnableCameraChanged) {
            let cameraInfo = this.view.Camera.GetCameraData();
            this.view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Control.Changed, cameraInfo);
        }
    };
};

UIBase.prototype.UIBegin = function () {
    this._state = this.VIZCore.Enum.MOUSE_STATE.NONE;
    this.mouseLeftDown = false;
    this.mouseMiddleDown = false;
    this.mouseRightDown = false;
    this.delta = 0;

    this.EventCnt = 0;
    this.PivotUpdate = true;

    //this.view.Renderer.MainFBClear();
    //this.view.Renderer.Render();
    //if (this.view.useFramebuffer) {
    //    this.view.MeshBlock.Reset();
    //}
};

UIBase.prototype.UIEnd = function () {
    this._state = this.VIZCore.Enum.MOUSE_STATE.NONE;
};

UIBase.prototype.SetUIMode = function (mode) { };
UIBase.prototype.IsUIMode = function(mode) { return true; };

UIBase.prototype.mouseDown = function (x, y, button) {
    this.mouse = new this.VIZCore.Vector2(x, y);
    this.mouseDownPosition = new this.VIZCore.Vector2(x, y);
    this.mouseLastPosition = new this.VIZCore.Vector2(x, y);

    let prevMid=false;

    /////이전 버튼    
    if(this.mouseMiddleDown===true){
        prevMid=true;

    }
    



    if(button === 1) //Middle
    {
        this.mouseMiddleDown = true;
        this.timeMouseMiddleDown = new Date().getTime();
    }
    else if(button === 2){
        this.mouseRightDown = true;
        this.timeMouseRightDown = new Date().getTime();

        //this.mouseLeftDown = true;
        //this.timeMouseLeftDown = new Date().getTime();    ///?????
    }
    else {
        this.mouseLeftDown = true;
        this.timeMouseLeftDown = new Date().getTime();
    }

    if (this.actionEnabled === false) return true;

    //this.view.Camera.RenderPivot = true;
    this.longPressStart(x, y, this);

    //if (this._state === this.VIZCore.Enum.MOUSE_STATE.NONE) {
    //    this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
    //}

    if (this.view.Configuration.Control.Version === 0) {
        if (this._state === this.VIZCore.Enum.MOUSE_STATE.NONE) {
            
            this._state = button;
            // wheel down
            if (this._state === 1) {
                //this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;
            }

            switch (this.view.Control._sub) {
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE:
                    {
                        this._state = button;
                        // wheel down
                        if (this._state === 1) {
                            //this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;
                        }
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_FIXEDZ:
                    {
                        if(button === 0) // L : Rotate
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;       
                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }
                        }
                        else if(button === 2) // R : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;       
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }
                        }
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE:
                    {
                        // 자유궤도
                        if(button === 0) // L : Rotate
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;    
                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;  
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }     
                        }else if(button === 2) // R : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;       
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }
                        }
                        
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ORBIT:
                    {                        
                        this.view.Camera.RenderPivot = false;
                        // CLISSIC
                        if(button === 0) // L : Rotate
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;    
                            if(this.KeyPress.ctrlKey) // Pan
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;
                            }  
                            if(this.KeyPress.shiftKey) // Zoom
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ZOOM;
                            }
                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;       
                        }
                        else if(button === 2) // R : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;       
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ORBIT;
                            }
                        }
                    }
                    break;
                
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_WFIXEDZ:
                    {
                        // 제한궤도
                        if(button === 0) // L : Rotate
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;    
                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;  
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }     
                        }
                        else if(button === 2) // R : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;       
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }
                        }
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.PAN:
                    {
                        // PAN
                        if(button === 0) // L : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;    
                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;  
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }     
                        }
                        else if(button === 2) // R : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;       
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }
                        }
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_CAMERA:
                    {
                        if(button === 0) // L : Rotate
                        {
                            this.view.Camera.RenderPivot = false;
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;   
                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;  
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }     
                        }
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.SELECT:
                    {
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.FLY:
                    {
                    }
                    break;
                default: {
                }
                break;
            }

            // Rotate시 Cube에서 할 경우 모델 중심 회전
            if (this._state === this.VIZCore.Enum.MOUSE_STATE.ROTATE) {
                let viewCubePick = this.view.ViewCube.Pick(x, y, false);
                if (viewCubePick) {
                    //let bbox = this.view.Data.GetBBox();
                    //this.view.Camera.SetPivot(bbox.center);
                }
            }
        }
    }
    else if (this.view.Configuration.Control.Version === 1) {
        if (this._state === this.VIZCore.Enum.MOUSE_STATE.NONE) {
            //this._state = button;
            //console.log("Mouse Down ::", button);
            switch (this.view.Control._sub) {
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE:
                    {
                        this._state = button;
                        // wheel down
                        if (this._state === 1) {
                            //this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;
                        }
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_FIXEDZ:
                    {
                        if(button === 0) // L : Rotate
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;       
                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }
                        }
                        else if(button === 2) // R : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;       
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }
                        }
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE:
                    {
                        // 자유궤도
                        if(button === 0) // L : Rotate
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;    
                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;  
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }     
                        }else if(button === 2) // R : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;       
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }
                        }
                        
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ORBIT:
                    {                        
                        this.view.Camera.RenderPivot = false;
                        // CLISSIC
                        if(button === 0) // L : Rotate
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;    
                            if(this.KeyPress.ctrlKey) // Pan
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;
                            }  
                            if(this.KeyPress.shiftKey) // Zoom
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ZOOM;
                            }
                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;       
                        }
                        else if(button === 2) // R : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;       
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ORBIT;
                            }
                        }
                    }
                    break;
                
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_WFIXEDZ:
                    {
                        // 제한궤도
                        if(button === 0) // L : Rotate
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;    
                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;  
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }     
                        }
                        else if(button === 2) // R : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;       
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }
                        }
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.PAN:
                    {
                        // PAN
                        if(button === 0) // L : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;    
                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;  
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }     
                        }
                        else if(button === 2) // R : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;       
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }
                        }
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_CAMERA:
                    {
                        if(button === 0) // L : Rotate
                        {
                            this.view.Camera.RenderPivot = false;
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;   
                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;  
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }     
                        }
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.SELECT:
                    {
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.FLY:
                    {
                    }
                    break;
                default: {
                }
                break;
            }

            // Rotate시 Cube에서 할 경우 모델 중심 회전
            if (this._state === this.VIZCore.Enum.MOUSE_STATE.ROTATE) {
                let viewCubePick = this.view.ViewCube.Pick(x, y, false);
                if (viewCubePick) {
                    //let bbox = this.view.Data.GetBBox();
                    //this.view.Camera.SetPivot(bbox.center);
                }
            }
        }
    }
    else if (this.view.Configuration.Control.Version === 2) {
        if (this._state === this.VIZCore.Enum.MOUSE_STATE.NONE) {
            
            switch (this.view.Control._sub) {
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE:
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_FIXEDZ:
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE:
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_WFIXEDZ:
                    {
                        //this._state = button;

                        // wheel down
                        if (button === 1) {
                            //this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;
                            
                            this.mousePivotUpdate(x, y, this);
                        }
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ORBIT:
                    {          
                        this.view.Camera.RenderPivot = false;
                        // CLISSIC

                        if(button === 0) // L : Rotate
                        {                            //this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;    
                            if(this.KeyPress.ctrlKey) // Pan
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;
                            }  
                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;       
                            if(this.KeyPress.ctrlKey) // zoom
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM;
                            }  
                        }
                        else if(button === 2) // R : Pan
                        {                                
                            if(this.KeyPress.altKey&&this.KeyPress.ctrlKey) {

                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;    
                            }
                            else if(this.KeyPress.altKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;  
                            }  
                        }


                    }
                    break;
                
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.PAN:
                    {



                        // PAN
                        if(button === 0) // L : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN; 
                            


                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;  
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }     
                        }
                        else if(button === 2) // R : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;       
                            // if(this.KeyPress.shiftKey) // Rotate
                            // {
                            //     this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            // }
                        }
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_CAMERA:
                    {
                        if(button === 0) // L : Rotate
                        {
                            this.view.Camera.RenderPivot = false;
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;   
                        }
                        else if(button === 1) // M : Pan
                        {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.PAN;  
                            if(this.KeyPress.shiftKey) // Rotate
                            {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }     
                        }
                        else if(button === 2) // R : Pan
                        {
                            this.view.Camera.RenderPivot = false;
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                        }
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.SELECT:
                    {
                    }
                    break;
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.FLY:
                    {
                    }
                    break;
                default: {
                }
                break;

             
            }
        }
        else if (this._state === this.VIZCore.Enum.MOUSE_STATE.PAN) 
        {
            switch (this.view.Control._sub) {
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE:
                    case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_FIXEDZ:
                    case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE:
                    case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_WFIXEDZ:
                    {
                        this._state = button;
                        // wheel down & left down
                        if (this._state === 0 && this.mouseMiddleDown) {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                        }
                        // wheel down & right down
                        else if (this._state === 2 && this.mouseMiddleDown) {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                        }

                        // Rotate시 Cube에서 할 경우 모델 중심 회전
                        if (this._state === this.VIZCore.Enum.MOUSE_STATE.ROTATE) {
                            let viewCubePick = this.view.ViewCube.Pick(x, y, false);
                            if (viewCubePick) {
                                //let bbox = this.view.Data.GetBBox();
                                //this.view.Camera.SetPivot(bbox.center);
                            }
                        }
                    }
                    case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ORBIT:
                    {                      
                            this._state = button;
                            // wheel down & left down
                            if (this._state === 0 && this.mouseMiddleDown) {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }
                            // wheel down & right down
                            else if (this._state === 2 && this.mouseMiddleDown) {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }

                    }

                    break;
            }
        }
        else if (this._state === this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM){
          
            switch (this.view.Control._sub) {
                case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE:
                    case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_FIXEDZ:
                    case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE:
                    case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_WFIXEDZ:
                    {
                        this._state = button;
                        // wheel down
                        if (this._state === 0 && this.mouseMiddleDown) {
                            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                        }

                        // Rotate시 Cube에서 할 경우 모델 중심 회전
                        if (this._state === this.VIZCore.Enum.MOUSE_STATE.ROTATE) {
                            let viewCubePick = this.view.ViewCube.Pick(x, y, false);
                            if (viewCubePick) {
                                //let bbox = this.view.Data.GetBBox();
                                //this.view.Camera.SetPivot(bbox.center);
                            }
                        }
                    }

                    case this.VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ORBIT:
                    {
                        
                            this._state = button;
                            // wheel down & left down
                            if (this._state === 0 && this.mouseMiddleDown) {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }
                            // wheel down & right down
                            else if (this._state === 2 && this.mouseMiddleDown) {
                                this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
                            }
                            
                    }



                    break;
            }
        }
    }




    return true;
};

UIBase.prototype.mouseMove = function (x, y) {
    this.mouse = new this.VIZCore.Vector2(x, y);
    if (this.actionEnabled === false) {
        this.mouseLastPosition = new this.VIZCore.Vector2(x, y);
        return;
    }
    

    if (!this.mouseLeftDown &&
        this.view.ViewCube.Visible &&
        this.view.MultiView[this.view.CameraIndex].ViewEntityInfo.ShowViewCube) {
        let prevID = this.view.ViewCube.GetPickID();
        let viewCubePick = this.view.ViewCube.Pick(x, y, false);
        let currentID = this.view.ViewCube.GetPickID();

        if (prevID !== currentID) {
            this.view.Renderer.Render();
        }
    }
    else{
        if(this.view.Configuration.Control.Update)
        {
            console.log("control Update");
            this.view.ViewRefresh();
            //this.view.Renderer.MainFBClear(true);
            //this.view.Renderer.Render();
            this.view.Renderer.Renderer();

        }
            
    }

    this.longPressCheck(x, y, this);
    //{
    //    let body = this.view.Renderer.Picking(this.mouse.x, this.mouse.y);
    //    if (body !== undefined) {
    //
    //        //Depth 방식
    //        let position = this.view.Renderer.PickPositionObject(this.mouse.x, this.mouse.y);
    //        if (position !== undefined) {
    //
    //            let testMatrix = new this.VIZCore.Matrix4().copy(this.view.Camera.matMVP);
    //            let test = this.view.Camera.world2ScreenWithMatrix(testMatrix, position);
    //
    //            console.log(test.z);
    //        }
    //    }
    //
    //
    //}

    this.update(this);
};

/**
* 클릭 여부 반환
* @param {Number} x : screen x
* @param {Number} y : screen y
* @param {Number} buttonType : 0 = left, 1 = middle, 2 = right
* @returns {Boolean} true: 클릭
*/
UIBase.prototype.GetMouseClick = function (x, y, buttonType) {
    let mouse = new this.VIZCore.Vector2(x, y);
    let tmp = new this.VIZCore.Vector2().subVectors(this.mouseDownPosition, mouse);

    if (tmp.length() < 5) {
        //let ticks = (621355968e9 + (new Date()).getTime() * 1e4);
       
        let ms = 500; //max
        if(buttonType === undefined || buttonType === 0)
        {
            let timeCurrent = new Date().getTime() - this.timeMouseLeftDown;
            ms = timeCurrent;
        }
        else if(buttonType === 1)
        {
            let timeCurrent = new Date().getTime() - this.timeMouseMiddleDown;
            ms = timeCurrent;
        }
        else if(buttonType === 2)
        {
            let timeCurrent = new Date().getTime() - this.timeMouseRightDown;
            ms = timeCurrent;
        }

        if (ms < 500) { //250
            return true;
        }
    }
    return false;
};

UIBase.prototype.mouseUp = function (x, y, button) {

    let lastState = this._state;
    this._state = this.VIZCore.Enum.MOUSE_STATE.NONE;

    let mode = this.view.Control.GetMode();
    const canvas_review = document.getElementById(this.view.GetViewID() + "canvas_review");
    if (canvas_review !== undefined && canvas_review !== null) {
        if (mode === this.VIZCore.Enum.CONTROL_STATE.WALKTHROUGH)
            canvas_review.style.cursor = `url('${this.view.Control.imageObjects.walkthrough.src}'), auto`;
        else {
            canvas_review.style.cursor = 'default';
        }

        const canvas_dual = document.getElementById(this.view.GetViewID() + 'canvas_multi');
        if (canvas_dual !== undefined && canvas_dual !== null) {
            if (mode === this.VIZCore.Enum.CONTROL_STATE.WALKTHROUGH)
                canvas_dual.style.cursor = `url('${this.view.Control.imageObjects.walkthrough.src}'), auto`;
            else {
                canvas_dual.style.cursor = 'default';
            }
        }
    }

    //if(button ===0){
    //    if(this.mouseMiddleDown===true&&lastState===this.VIZCore.Enum.MOUSE_STATE.ORBIT)
    //        this._state = this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM;
    //}


    if(button === 1) //Middle
        this.mouseMiddleDown = false;
    if(button === 2) { //Right
        this.mouseRightDown = false;
        this.mouseLeftDown = false;
    }
    else {
        this.mouseLeftDown = false;
    }
    
    this.view.Camera.RenderPivot = false;
    
    this.mouse = new this.VIZCore.Vector2(x, y);
    
    this.longPressEnd(x, y, this);


    if (this.actionEnabled === false) {
        //측정시 매번 불러오는 불편함이 있으므로
        //각각의 측정에서 클릭이 아닌경우에만 불러오도록 개선
        //this.view.MeshBlock.Reset();
        return true;
    }

    ///마우스 동작
    if(this.view.Configuration.Control.Version === 2) {
        if(lastState === this.VIZCore.Enum.MOUSE_STATE.ROTATE && button !== 1) {
            if(this.mouseMiddleDown) {
                this._state = this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM;
                return;
            }
        }
    }
    
    // Picking
    //this.mouse = new this.VIZCore.Vector2(x, y);
    //let tmp = new this.VIZCore.Vector2().subVectors(this.mouseDownPosition, this.mouse);
    //if (tmp.length() < 5) {
    if(button === 0)
    {
        if (this.GetMouseClick(x, y)) {

            let usePickViewCube = true;
            let controlMode = this.view.Control.GetMode();

            if (controlMode === this.VIZCore.Enum.CONTROL_STATE.WALKTHROUGH ||
                controlMode === this.VIZCore.Enum.CONTROL_STATE.FLY) {
                usePickViewCube = false;
            }

            let viewCubePick = false;
            if (usePickViewCube)
                viewCubePick = this.view.ViewCube.Pick(x, y, false);

            if (viewCubePick) {
                //ViewCube Pick
                let currentID = this.view.ViewCube.GetPickID();
                //this.view.ViewCube.ClearPickID();

                //console.log("ViewCube ID : " + currentID);
                let bCameraChanged = false;
                switch (currentID) {
                    case 111: // -x
                        //console.log("-X");
                        this.view.Camera.ViewLeftElevation();
                        bCameraChanged = true;
                        break;
                    case 211: // +x
                        //console.log("+X");
                        this.view.Camera.ViewRightElevation();
                        bCameraChanged = true;
                        break;
                    case 311: // -y
                        //console.log("-Y");
                        this.view.Camera.ViewFrontSection();
                        bCameraChanged = true;
                        break;
                    case 411: // +y
                        //console.log("+Y");
                        this.view.Camera.ViewBackSection();
                        bCameraChanged = true;
                        break;
                    case 511: // -z
                        //console.log("-Z");
                        this.view.Camera.ViewBottomPlan();
                        bCameraChanged = true;
                        break;
                    case 611: //+z
                        //console.log("+Z");
                        this.view.Camera.ViewTopPlan();
                        bCameraChanged = true;
                        break;

                    case 100: // -x -y +z (left, front, top)
                    case 302:
                    case 600:
                        //console.log("-X -Y +Z");
                        this.view.Camera.ViewISOLeftFrontTop();
                        bCameraChanged = true;
                        break;

                    case 120: // -x +y +z (left, back, top)
                    case 400:
                    case 602:
                        //console.log("-X +Y +Z");
                        this.view.Camera.ViewISOLeftBackTop();
                        bCameraChanged = true;
                        break;

                    case 202: // +x -y +z (right, front, top)
                    case 322:
                    case 620:
                        //console.log("+X -Y +Z");
                        this.view.Camera.ViewISORightFrontTop();
                        bCameraChanged = true;
                        break;

                    case 222: // +x +y +z (right, back, top)
                    case 420:
                    case 622:
                        //console.log("+X +Y +Z");
                        this.view.Camera.ViewISORightBackTop();
                        bCameraChanged = true;
                        break;

                    case 102: // -x -y -z (left, front, bottom)
                    case 300:
                    case 502:
                        //console.log("-X -Y -Z");
                        this.view.Camera.ViewISOLeftFrontBottom();
                        bCameraChanged = true;
                        break;

                    case 122: // -x +y -z (left, back, bottom)
                    case 402:
                    case 500:
                        //console.log("-X +Y -Z");
                        this.view.Camera.ViewISOLeftBackBottom();
                        bCameraChanged = true;
                        break;

                    case 200: // +x -y -z (right, front, bottom)
                    case 320:
                    case 522:
                        //console.log("+X -Y -Z");
                        this.view.Camera.ViewISORightFrontBottom();
                        bCameraChanged = true;
                        break;

                    case 220: // +x +y -z (right, back, bottom)
                    case 422:
                    case 520:
                        //console.log("+X +Y -Z");
                        this.view.Camera.ViewISORightBackBottom();
                        bCameraChanged = true;
                        break;

                    case 112:  // -x -z (left, bottom)
                    case 501:
                        //console.log("-X -Z");
                        this.view.Camera.ViewLeftBottomSide();
                        bCameraChanged = true;
                        break;

                    case 101: // -x -y (left, front)
                    case 301:
                        //console.log("-X -Y");
                        this.view.Camera.ViewLeftFrontSide();
                        bCameraChanged = true;
                        break;

                    case 121: // -x +y (left, back)
                    case 401:
                        //console.log("-X +Y");
                        this.view.Camera.ViewLeftBackSide();
                        bCameraChanged = true;
                        break;

                    case 110: // -x +z (left, top)
                    case 601:
                        //console.log("-X +Z");
                        this.view.Camera.ViewLeftTopSide();
                        bCameraChanged = true;
                        break;

                    case 212: // +x +z (right, top)
                    case 621:
                        //console.log("+X +Z");
                        this.view.Camera.ViewRightTopSide();
                        bCameraChanged = true;
                        break;

                    case 201: // +x -y (right, front)
                    case 321:
                        //console.log("+X -Y");
                        this.view.Camera.ViewRightFrontSide();
                        bCameraChanged = true;
                        break;

                    case 221: // +x +y (right, back)
                    case 421:
                        //console.log("+X +Y");
                        this.view.Camera.ViewRightBackSide();
                        bCameraChanged = true;
                        break;

                    case 210: // +x -z (right, bottom)
                    case 521:
                        //console.log("+X -Z");
                        this.view.Camera.ViewRightBottomSide();
                        bCameraChanged = true;
                        break;

                    case 312: // -y +z (back, top)
                    case 610:
                        //console.log("-Y +Z");
                        this.view.Camera.ViewFrontTopSide();
                        bCameraChanged = true;
                        break;

                    case 310: // -y -z (back, bottom)
                    case 512:
                        //console.log("-Y -Z");
                        this.view.Camera.ViewFrontBottomSide();
                        bCameraChanged = true;
                        break;

                    case 410: // +y +z (back, top)
                    case 612:
                        //console.log("+Y +Z");
                        this.view.Camera.ViewBackTopSide();
                        bCameraChanged = true;
                        break;

                    case 412: // +y -z (back, bottom)
                    case 510:
                        //console.log("+Y -Z");
                        this.view.Camera.ViewBackBottomSide();
                        bCameraChanged = true;
                        break;
                }

                // 카메라 이벤트 발생
                if (bCameraChanged && this.view.Configuration.Event.EnableCameraChanged) {
                    let cameraInfo = this.view.Camera.GetCameraData();
                    this.view.EventHandler.dispatchEvent(this.VIZCore.Enum.EVENT_TYPES.Control.Changed, cameraInfo);
                }

            }
            else {

                //let body = this.view.Renderer.Picking(this.mouse.x, this.mouse.y);
                //if (body !== undefined) {
                //
                //    if (this.view.Browser.IsMS) {
                //        this.view.Camera.SetPivot(body.BBox.center);
                //    }
                //    else {
                //
                //        const resultPick = this.view.Data.GetPickByBody(body.bodyId, x, y);
                //        if (resultPick[0]) {
                //            this.view.Camera.SetPivot(resultPick[1]);
                //        }
                //        //if (resultPick[0]) {
                //        //    this.view.Avatar.SetPosAndDirection(this.view.Avatar.GetObject().uuid,
                //        //        resultPick[1],
                //        //        new this.VIZCore.Vector3(-1, 0, 0),
                //        //        new this.VIZCore.Vector3(0, 0, 1)
                //        //    );
                //        //}
                //
                //        //테스트
                //        //if (resultPick[0]) {
                //        //    let fileData = this.view.TestCustomFBX_Player();
                //        //    this.view.CustomObject.AddDownloadInitPosAndDirection(fileData, resultPick[1],
                //        //        new this.VIZCore.Vector3(-1, 0, 0),
                //        //        new this.VIZCore.Vector3(0, 0, 1)
                //        //    );
                //        //}
                //
                //
                //        //Depth 방식
                //        //let position = this.view.Renderer.PickPositionObject(this.mouse.x, this.mouse.y);
                //        //if (position !== undefined) {
                //        //    // 피벗 이동
                //        //    this.view.Camera.SetPivot(position);
                //        //}
                //
                //
                //        //this.view.CustomObject.SetPosAndDirection(this.view.CustomObject.GetObjects()[0].uuid,
                //        //    position,
                //        //    new this.VIZCore.Vector3(-1, 0, 0),
                //        //    new this.VIZCore.Vector3(0, 0, 1)
                //        //);
                //    }
                //
                //
                //    if (this.view.DemoType === 2) {
                //        let bodySrcId = body.bodyId % 10000;
                //        if (bodySrcId === 190) {
                //            ;
                //        }
                //        else if (bodySrcId === 183) {
                //            ;
                //        }
                //        else if (bodySrcId === 185) {
                //            ;
                //        }
                //        else if (bodySrcId === 188) {
                //            ;
                //        }
                //        else {
                //            if (this.KeyPress.ctrlKey)
                //                this.view.Data.Select(body.bodyId, true, true);
                //            else
                //                this.view.Data.Select(body.bodyId, true, false);
                //        }
                //
                //    }
                //    else if (this.view.DemoType === 3) {
                //        if (body.bodyId === 10 || body.bodyId === 12 || body.bodyId === 14 || body.bodyId === 16) {
                //            ;
                //        }
                //        else {
                //            if (this.KeyPress.ctrlKey)
                //                this.view.Data.Select(body.bodyId, true, true);
                //            else
                //                this.view.Data.Select(body.bodyId, true, false);
                //        }
                //    }
                //    else if (this.view.DemoType === 4) {
                //        if (body.bodyId === 87) {
                //            ;
                //        }
                //        else {
                //            if (this.KeyPress.ctrlKey)
                //                this.view.Data.Select(body.bodyId, true, true);
                //            else
                //                this.view.Data.Select(body.bodyId, true, false);
                //        }
                //    }
                //    else {
                //        if (this.KeyPress.ctrlKey)
                //            this.view.Data.Select(body.bodyId, true, true);
                //        else
                //            this.view.Data.Select(body.bodyId, true, false);
                //    }
                //    //this.view.Renderer.InitRenderProcess();
                //    this.view.Renderer.Render();
                //}
                //else {
                //    if (!this.KeyPress.ctrlKey)
                //        this.view.Data.DeselectAll();
                //}

                // 리뷰 선택 확인
                // let reviewPick = function(scope)
                // {
                //     let result = false;
                
                //     return result;
                // }

                // let bReviewPick = reviewPick(this);
                // if(bReviewPick)
                //     return;

                // 선택 정보 가져오기
                let arrSelect = this.view.Data.GetSelection();

                /// 이미 선택되어있는 노드 가져오기(part, assembly 포함)
                let selectedNodes = []; 
                // 선택 정보 비교


            
                //선택 실패
                if (!this.KeyPress.ctrlKey) {
                    if (this.view.DemoType !== 5) {
                        if (this.view.Configuration.Model.Selection.Duplicate === 1)
                            selectedNodes = this.view.Data.GetSelectionNodes();

                        this.view.Data.DeselectAll();
                        this.view.CustomObject.DeselectAll();
                    }
                }

                // body 선택
                let calPickBody = function (scope, body) {
                    if (scope.view.Browser.IsMS) {
                        scope.view.Camera.SetPivot(body.BBox.center);
                    }
                    else {

                        const resultPick = scope.view.Data.GetPickByBody(body.bodyId, x, y);
                        if (resultPick.pick) {
                            //console.log(resultPick.position);
                            scope.view.Camera.SetPivot(resultPick.position);
                            scope.view.EventHandler.dispatchEvent(scope.VIZCore.Enum.EVENT_TYPES.Model.Select_Position, resultPick.position);

                        }
                        else {
                            scope.view.Camera.SetPivot(body.BBox.center);
                        }
                        //if (resultPick[0]) {
                        //    this.view.Avatar.SetPosAndDirection(this.view.Avatar.GetObject().uuid,
                        //        resultPick[1],
                        //        new this.VIZCore.Vector3(-1, 0, 0),
                        //        new this.VIZCore.Vector3(0, 0, 1)
                        //    );
                        //}

                        //테스트
                        //if (resultPick[0]) {
                        //    let fileData = this.view.TestCustomFBX_Player();
                        //    this.view.CustomObject.AddDownloadInitPosAndDirection(fileData, resultPick[1],
                        //        new this.VIZCore.Vector3(-1, 0, 0),
                        //        new this.VIZCore.Vector3(0, 0, 1)
                        //    );
                        //}


                        //Depth 방식
                        //let position = this.view.Renderer.PickPositionObject(this.mouse.x, this.mouse.y);
                        //if (position !== undefined) {
                        //    // 피벗 이동
                        //    this.view.Camera.SetPivot(position);
                        //}


                        //this.view.CustomObject.SetPosAndDirection(this.view.CustomObject.GetObjects()[0].uuid,
                        //    position,
                        //    new this.VIZCore.Vector3(-1, 0, 0),
                        //    new this.VIZCore.Vector3(0, 0, 1)
                        //);
                    }


                    if (scope.view.DemoType === 2) {
                        let bodySrcId = body.bodyId % 10000;
                        if (bodySrcId === 190) {
                            ;
                        }
                        else if (bodySrcId === 183) {
                            ;
                        }
                        else if (bodySrcId === 185) {
                            ;
                        }
                        else if (bodySrcId === 188) {
                            ;
                        }
                        else {
                            if (scope.KeyPress.ctrlKey)
                            scope.view.Data.Select(body.bodyId, true, true);
                            else
                            scope.view.Data.Select(body.bodyId, true, false);
                        }

                    }
                    else if (scope.view.DemoType === 3) {
                        if (body.bodyId === 10 || body.bodyId === 12 || body.bodyId === 14 || body.bodyId === 16) {
                            ;
                        }
                        else {
                            if (scope.KeyPress.ctrlKey)
                            scope.view.Data.Select(body.bodyId, true, true);
                            else
                            scope.view.Data.Select(body.bodyId, true, false);
                        }
                    }
                    else if (scope.view.DemoType === 4) {
                        if (body.bodyId === 87) {
                            ;
                        }
                        else {
                            if (scope.KeyPress.ctrlKey)
                                scope.view.Data.Select(body.bodyId, true, true);
                            else
                                scope.view.Data.Select(body.bodyId, true, false);
                        }
                    }
                    else if (scope.view.DemoType === 5) {
                        // E8ight
                        // 모델 선택 -> 부모 아이디 비교
                        let node = scope.view.Tree.GetNodeInfo(body.bodyId);
                        console.log("Node :: ", node);
                        //node_id
                        //let parent = scope.view.Tree.GetParentNodeInfoByOffset(node.parent_offset);
                        let parent = scope.view.Tree.GetParentNodeInfoByLevel(node.node_id, 2);

                        let id = parent.node_id;
                        if (id === 1441 || id === 1481 || id === 1434 || id === 1430 || id === 1492 || id === 1444 || id == 1487) {
                            // land
                            if (node.node_id === 1444) {
                                scope.view.Data.Select(node.node_id, !node.selection, true);
                            }
                            // APT
                            else if (node.node_id === 1445 || node.node_id === 1454 || node.node_id === 1456 || node.node_id === 1463 || node.node_id === 1474) {
                                scope.view.Tree.SelectMulti([1445, 1454, 1456, 1463, 1474], !node.selection, true);
                            }
                            else {
                                scope.view.Data.Select(parent.node_id, !node.selection, true);
                            }
                        }

                    }
                    else if (scope.view.DemoType === 7){
                        // SmartCity
                        let ids = scope.view.Custom.GetSelectionIds();
                        let find = ids.indexOf(body.bodyId);
                        if(find !== -1)
                        {
                            if (scope.KeyPress.ctrlKey)
                                scope.view.Data.Select(body.bodyId, true, true);
                            else
                                scope.view.Data.Select(body.bodyId, true, false);
                        }
                    }
                    else {
                        // 선택 모델 선택시 해제 적용
                        if (scope.KeyPress.ctrlKey){
                            let found = arrSelect.find(element => element == body.bodyId);
                            if(found !== undefined)
                                scope.view.Data.Select(body.bodyId, false, true);
                            else
                                scope.view.Data.Select(body.bodyId, true, true);
                        }
                        else
                        {
                            // 선택 정보가 있다면 
                            let found = arrSelect.find(element => element == body.bodyId);
                            if(found !== undefined){
                                /// 선택한 모델의 상위 노드 선택
                                if (scope.view.Configuration.Model.Selection.Duplicate === 1){
                                    scope.view.Data.SetSelectionNodes(selectedNodes, true);
                                    scope.view.Data.SelectUpperNode(arrSelect, body.bodyId, true, false);
                                }
                                else{   //선택한 모델 선택해제 
                                    scope.view.Data.Select(body.bodyId, false, false);    
                                }
                            }
                            else
                                scope.view.Data.Select(body.bodyId, true, false);
                        }
                    }

                    //this.view.Renderer.InitRenderProcess();
                    scope.view.Renderer.Render();
                };

                //custom Body 선택
                let calPickCustomBody = function (scope, customObject, body) {

                    if (scope.view.Browser.IsMS) {
                        scope.view.Camera.SetPivot(body.BBox.center);
                    }
                    else {
                        const resultPick = scope.view.CustomObject.GetPickByBody(customObject.uuid, x, y);
                        if (resultPick.pick) {
                            scope.view.Camera.SetPivot(resultPick.position);
                            scope.view.EventHandler.dispatchEvent(scope.VIZCore.Enum.EVENT_TYPES.Model.Select_Position, resultPick.position);
                        }
                        else {
                            scope.view.Camera.SetPivot(body.BBox.center);
                        }
                        
                    }

                    if (scope.KeyPress.ctrlKey)
                        scope.view.CustomObject.Select([customObject.uuid], true, true);
                    else
                        scope.view.CustomObject.Select([customObject.uuid], true, false);

                    //this.view.Renderer.InitRenderProcess();
                    scope.view.Renderer.Render();
                };

                if(this.view.Configuration.Model.Selection.Kind !== this.VIZCore.Enum.SelectionObject3DTypes.NONE)
                {
                    let resultPick = this.view.Renderer.PickingCallback(this.mouse.x, this.mouse.y, this, calPickBody, calPickCustomBody);
                    //선택 실패
                    //if (!resultPick) {
                    //    if (!this.KeyPress.ctrlKey) {
                    //        this.view.Data.DeselectAll();
                    //        this.view.CustomObject.DeselectAll();
                    //    }
                    //}
                }

            }
        }
    }
    else if(button === 1)
    {
        if(this.view.DemoType !== 6)
        if (this.GetMouseClick(x, y, 1)) {
                // body 선택
                let calPickBody = function (scope, body) {
                    if (scope.view.Browser.IsMS) {
                        scope.view.Camera.SetPivot(body.BBox.center);
                    }
                    else {
                        const resultPick = scope.view.Data.GetPickByBody(body.bodyId, x, y);
                        if (resultPick.pick) {
                            //console.log(resultPick.position);
                            scope.view.Camera.SetPivot(resultPick.position);
                        }
                        else {
                            scope.view.Camera.SetPivot(body.BBox.center);
                        }
                    }
                    scope.view.Camera.FocusPivot();
                    scope.view.Renderer.Render();
                };

                //custom Body 선택
                let calPickCustomBody = function (scope, customObject, body) {

                    if (scope.view.Browser.IsMS) {
                        scope.view.Camera.SetPivot(body.BBox.center);
                    }
                    else {
                        const resultPick = scope.view.CustomObject.GetPickByBody(customObject.uuid, x, y);
                        if (resultPick.pick) {
                            scope.view.Camera.SetPivot(resultPick.position);
                        }
                        else {
                            scope.view.Camera.SetPivot(body.BBox.center);
                        }
                    }

                    scope.view.Camera.FocusPivot();
                    scope.view.Renderer.Render();
                };

                if(this.view.Configuration.Model.Selection.Kind !== this.VIZCore.Enum.SelectionObject3DTypes.NONE)
                {
                    let resultPick = this.view.Renderer.PickingCallback(this.mouse.x, this.mouse.y, this, calPickBody, calPickCustomBody);
                }
        }
    }

    if (this.view.useFramebuffer)
        //this.view.MeshBlock.Reset();
        this.view.ViewRefresh();

    return true;
};




UIBase.prototype.mouseWheel = function (x, y, delta) {
    this.mouse = new this.VIZCore.Vector2(x, y);

    if (this.actionEnabled === false) return;
    
    if(this.view.Configuration.Control.Version === 2) {
        if(this._state != this.VIZCore.Enum.MOUSE_STATE.NONE) return;
    }


    this.EventCnt++;
    if (this.view.IsUseProgressive())
        this.view.Renderer.enableRenderLimit = true;

    let stateBackup = this._state;
    this._state = this.VIZCore.Enum.MOUSE_STATE.ZOOM;
    this.delta = delta;

    if (this.PivotUpdate) {
        this.mousePivotUpdate(x, y, this);
    }

    let scope = this;
    let scopeCamera = this.view.Camera;

    this.PivotUpdate = false;

    scope.view.Camera.RenderPivot = true;

    this.update(this);

    setTimeout(function () {
        scope.EventCnt--;
        if (scope.EventCnt === 0) {
            scope.PivotUpdate = true;
            if(!scope.mouseLeftDown) {
                // if (scope.view.Camera.RenderPivot)
                //     scope.view.Camera.RenderPivot = false;
                if (scopeCamera.RenderPivot)
                    scopeCamera.RenderPivot = false;
            }
            if (scope.view.IsUseProgressive())
                scope.view.Renderer.enableRenderLimit = false;

            if (!scope.mouseLeftDown && scope.view.useFramebuffer)
                //scope.view.MeshBlock.Reset();
                scope.view.ViewRefresh();

            const canvas_review = document.getElementById(scope.view.GetViewID() + "canvas_review");
            if (canvas_review !== undefined && canvas_review !== null) {
                canvas_review.style.cursor = 'default';

                const canvas_dual = document.getElementById(scope.view.GetViewID() + 'canvas_multi');
                if (canvas_dual !== undefined && canvas_dual !== null) {
                    canvas_dual.style.cursor = 'default';
                }
            }  
        }
        else {
            scope.PivotUpdate = false;
        }
    }, 200);

    this._state = stateBackup;
};

UIBase.prototype.mouseOver = function () {
    let mode = this.view.Control.GetMode();
    const canvas_review = document.getElementById(this.view.GetViewID() + "canvas_review");
    if(canvas_review === undefined || canvas_review === null) return;

    if (mode === this.VIZCore.Enum.CONTROL_STATE.WALKTHROUGH) {
        canvas_review.style.cursor = `url('${this.view.Control.imageObjects.walkthrough.src}'), auto`;
    }
    else {
        canvas_review.style.cursor = 'default';
    }

    const canvas_dual = document.getElementById(this.view.GetViewID() + 'canvas_multi');

    if (canvas_dual === undefined || canvas_dual === null) return;
   
    if (mode === this.VIZCore.Enum.CONTROL_STATE.WALKTHROUGH) {
        canvas_dual.style.cursor = `url('${this.view.Control.imageObjects.walkthrough.src}'), auto`;
    }
    else {
        canvas_dual.style.cursor = 'default';
    }
};

UIBase.prototype.mouseOut = function (x, y, button) {
    this._state = this.VIZCore.Enum.MOUSE_STATE.NONE;
    this.mouseLeftDown = false;
};

UIBase.prototype.mouseDoubleClick = function (x, y, button) {
    if (this.view.Configuration.Control.UseAutoFit)
    {
        // Picking
        this.mouse = new this.VIZCore.Vector2(x, y);
        //let tmp = new this.VIZCore.Vector2().subVectors(this.mouseDownPosition, this.mouse);
        //if (tmp.length() < 5) {
        {

            let usePickViewCube = true;
            let controlMode = this.view.Control.GetMode();

            if (controlMode === this.VIZCore.Enum.CONTROL_STATE.WALKTHROUGH) {
                usePickViewCube = false;
            }

            let viewCubePick = false;
            if (usePickViewCube)
                viewCubePick = this.view.ViewCube.Pick(x, y, false);

            if (viewCubePick) {
                //ViewCube Pick
                let currentID = this.view.ViewCube.GetPickID();
                //this.view.ViewCube.ClearPickID();

                //console.log("ViewCube ID : " + currentID);
                let bCameraChanged = false;
                switch (currentID) {
                    case 111: // -x
                        //console.log("-X");
                        this.view.Camera.ViewLeftElevation();
                        bCameraChanged = true;
                        break;
                    case 211: // +x
                        //console.log("+X");
                        this.view.Camera.ViewRightElevation();
                        bCameraChanged = true;
                        break;
                    case 311: // -y
                        //console.log("-Y");
                        this.view.Camera.ViewFrontSection();
                        bCameraChanged = true;
                        break;
                    case 411: // +y
                        //console.log("+Y");
                        this.view.Camera.ViewBackSection();
                        bCameraChanged = true;
                        break;
                    case 511: // -z
                        //console.log("-Z");
                        this.view.Camera.ViewBottomPlan();
                        bCameraChanged = true;
                        break;
                    case 611: //+z
                        //console.log("+Z");
                        this.view.Camera.ViewTopPlan();
                        bCameraChanged = true;
                        break;

                    case 100: // -x -y +z (left, front, top)
                    case 302:
                    case 600:
                        //console.log("-X -Y +Z");
                        this.view.Camera.ViewISOLeftFrontTop();
                        bCameraChanged = true;
                        break;

                    case 120: // -x +y +z (left, back, top)
                    case 400:
                    case 602:
                        //console.log("-X +Y +Z");
                        this.view.Camera.ViewISOLeftBackTop();
                        bCameraChanged = true;
                        break;

                    case 202: // +x -y +z (right, front, top)
                    case 322:
                    case 620:
                        //console.log("+X -Y +Z");
                        this.view.Camera.ViewISORightFrontTop();
                        bCameraChanged = true;
                        break;

                    case 222: // +x +y +z (right, back, top)
                    case 420:
                    case 622:
                        //console.log("+X +Y +Z");
                        this.view.Camera.ViewISORightBackTop();
                        bCameraChanged = true;
                        break;

                    case 102: // -x -y -z (left, front, bottom)
                    case 300:
                    case 502:
                        //console.log("-X -Y -Z");
                        this.view.Camera.ViewISOLeftFrontBottom();
                        bCameraChanged = true;
                        break;

                    case 122: // -x +y -z (left, back, bottom)
                    case 402:
                    case 500:
                        //console.log("-X +Y -Z");
                        this.view.Camera.ViewISOLeftBackBottom();
                        bCameraChanged = true;
                        break;

                    case 200: // +x -y -z (right, front, bottom)
                    case 320:
                    case 522:
                        //console.log("+X -Y -Z");
                        this.view.Camera.ViewISORightFrontBottom();
                        bCameraChanged = true;
                        break;

                    case 220: // +x +y -z (right, back, bottom)
                    case 422:
                    case 520:
                        //console.log("+X +Y -Z");
                        this.view.Camera.ViewISORightBackBottom();
                        bCameraChanged = true;
                        break;

                    case 112:  // -x -z (left, bottom)
                    case 501:
                        //console.log("-X -Z");
                        this.view.Camera.ViewLeftBottomSide();
                        bCameraChanged = true;
                        break;

                    case 101: // -x -y (left, front)
                    case 301:
                        //console.log("-X -Y");
                        this.view.Camera.ViewLeftFrontSide();
                        bCameraChanged = true;
                        break;

                    case 121: // -x +y (left, back)
                    case 401:
                        //console.log("-X +Y");
                        this.view.Camera.ViewLeftBackSide();
                        bCameraChanged = true;
                        break;

                    case 110: // -x +z (left, top)
                    case 601:
                        //console.log("-X +Z");
                        this.view.Camera.ViewLeftTopSide();
                        bCameraChanged = true;
                        break;

                    case 212: // +x +z (right, top)
                    case 621:
                        //console.log("+X +Z");
                        this.view.Camera.ViewRightTopSide();
                        bCameraChanged = true;
                        break;

                    case 201: // +x -y (right, front)
                    case 321:
                        //console.log("+X -Y");
                        this.view.Camera.ViewRightFrontSide();
                        bCameraChanged = true;
                        break;

                    case 221: // +x +y (right, back)
                    case 421:
                        //console.log("+X +Y");
                        this.view.Camera.ViewRightBackSide();
                        bCameraChanged = true;
                        break;

                    case 210: // +x -z (right, bottom)
                    case 521:
                        //console.log("+X -Z");
                        this.view.Camera.ViewRightBottomSide();
                        bCameraChanged = true;
                        break;

                    case 312: // -y +z (back, top)
                    case 610:
                        //console.log("-Y +Z");
                        this.view.Camera.ViewFrontTopSide();
                        bCameraChanged = true;
                        break;

                    case 310: // -y -z (back, bottom)
                    case 512:
                        //console.log("-Y -Z");
                        this.view.Camera.ViewFrontBottomSide();
                        bCameraChanged = true;
                        break;

                    case 410: // +y +z (back, top)
                    case 612:
                        //console.log("+Y +Z");
                        this.view.Camera.ViewBackTopSide();
                        bCameraChanged = true;
                        break;

                    case 412: // +y -z (back, bottom)
                    case 510:
                        //console.log("+Y -Z");
                        this.view.Camera.ViewBackBottomSide();
                        bCameraChanged = true;
                        break;
                }

                // 카메라 이벤트 발생
                if (bCameraChanged && this.view.Configuration.Event.EnableCameraChanged) {
                    let cameraInfo = this.view.Camera.GetCameraData();
                    this.view.EventHandler.dispatchEvent(this.VIZCore.Enum.EVENT_TYPES.Control.Changed, cameraInfo);
                }

            }
            else {
                // body 선택
                let calPickBody = function (scope, body) {
                    if (scope.view.Browser.IsMS) {
                        scope.view.Camera.SetPivot(body.BBox.center);
                    }
                    else {

                        const resultPick = scope.view.Data.GetPickByBody(body.bodyId, x, y);
                        if (resultPick.pick) {
                            //console.log(resultPick.position);
                            scope.view.Camera.SetPivot(resultPick.position);
                        }
                        else {
                            scope.view.Camera.SetPivot(body.BBox.center);
                        }
                    }
                    // 선택
                    {

                        if (scope.view.Configuration.Model.Selection.Duplicate === 1){
                            let nodes = []; 
                            nodes  = scope.view.Data.GetSelectionNodes();
                           
                            // 선택된 모델 정보 가져오기 
                            let arrSelect = scope.view.Data.GetSelection();
                            scope.view.Data.SetSelectionNodes(nodes, true);

                            // 선택한 모델 상위 노드 선택
                            scope.view.Data.SelectUpperNode(arrSelect, body.bodyId, true, false);
                            
                        }
                        else{
                            scope.view.Data.Select(body.bodyId, true, false);
                        }
                      
                    }
                    scope.view.Renderer.Render();
                };

                //custom Body 선택
                let calPickCustomBody = function (scope, customObject, body) {

                    if (scope.view.Browser.IsMS) {
                        scope.view.Camera.SetPivot(body.BBox.center);
                    }
                    else {
                        const resultPick = scope.view.CustomObject.GetPickByBody(customObject.uuid, x, y);
                        if (resultPick.pick) {
                            scope.view.Camera.SetPivot(resultPick.position);
                        }
                        else {
                            scope.view.Camera.SetPivot(body.BBox.center);
                        }
                    }

                    if (scope.KeyPress.ctrlKey)
                        scope.view.CustomObject.Select([customObject.uuid], true, true);
                    else
                        scope.view.CustomObject.Select([customObject.uuid], true, false);

                    //this.view.Renderer.InitRenderProcess();
                    scope.view.Renderer.Render();
                };

                if(this.view.Configuration.Model.Selection.Kind !== this.VIZCore.Enum.SelectionObject3DTypes.NONE) {
                    let resultPick = this.view.Renderer.PickingCallback(this.mouse.x, this.mouse.y, this, calPickBody, calPickCustomBody);
                }
            }
        }

        this.view.Data.ZoomSelection();
    }
        
};



UIBase.prototype.touchStart = function (touches) {

    let pos = this.view.Control.GetCalcTouchPos(touches[0]);

    this.mouse = new this.VIZCore.Vector2(pos.x, pos.y);
    this.mouseDownPosition = new this.VIZCore.Vector2().copy(this.mouse);
    this.mouseLastPosition = new this.VIZCore.Vector2().copy(this.mouse);
    this.mouseLeftDown = true;
    this.timeMouseLeftDown = new Date().getTime();

    this._touchLastCount = touches.length;
    this._touchLast = touches;

    if (this.actionEnabled === false) return;

    /*
    let yourDate = new Date();  // for example
    // the number of .net ticks at the unix epoch
    let epochTicks = 621355968000000000;
    // there are 10000 .net ticks per millisecond
    let ticksPerMillisecond = 10000;
    // calculate the total number of .net ticks for your date
    let yourTicks = epochTicks + (yourDate.getTime() * ticksPerMillisecond);
    */
    //let ticks = (621355968e9 + (new Date()).getTime() * 1e4);
    //alert(scope._state);
    switch (touches.length) {

        //case 1: this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
        case 1: this._state = this.VIZCore.Enum.MOUSE_STATE.TOUCH_ROTATE;
            //mouseDownPosition = new this.VIZCore.Vector2(touches[0].pageX, touches[0].pageY);
            //mouseLastPosition = new this.VIZCore.Vector2(touches[0].pageX, touches[0].pageY);
            this.mouse = new this.VIZCore.Vector2(pos.x, pos.y);
            this.mouseDownPosition = new this.VIZCore.Vector2(pos.x, pos.y);
            break;
        //case 2: this._state = this.VIZCore.Enum.MOUSE_STATE.ZOOM;
        case 2: this._state = this.VIZCore.Enum.MOUSE_STATE.TOUCH_ZOOM_PAN;
        {
            let pos1 = this.view.Control.GetCalcTouchPos(touches[0]);
            let pos2 = this.view.Control.GetCalcTouchPos(touches[1]);

            let x = (pos1.x + pos2.x) / 2;
            let y = (pos1.y + pos2.y) / 2;
            this.mouse = new this.VIZCore.Vector2(x, y);
            this.mouseDownPosition = new this.VIZCore.Vector2(x, y);
            this.mouseLastPosition = new this.VIZCore.Vector2(x, y);

            let dx = pos1.x - pos2.x;
            let dy = pos1.y - pos2.y;
            this._touchZoomDistanceEnd = this._touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);
        }
            break;
    }
};

UIBase.prototype.touchMove = function (touches) {

    this._touchLast = touches;

    switch (touches.length) {
        case 1:
            {
            let pos = this.view.Control.GetCalcTouchPos(touches[0]);
            this.mouse = new this.VIZCore.Vector2(pos.x, pos.y);
            }
            break;

        case 2:
            {
                let pos1 = this.view.Control.GetCalcTouchPos(touches[0]);
                let pos2 = this.view.Control.GetCalcTouchPos(touches[1]);

                let x = (pos1.x + pos2.x) / 2;
                let y = (pos1.y + pos2.y) / 2;
                this.mouse = new this.VIZCore.Vector2(x, y);

                let dx = pos1.x - pos2.x;
                let dy = pos1.y - pos2.y;
                //this._touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);

                //this.delta = Math.sqrt(dx * dx + dy * dy) / 1000;                
                //this.delta = this._touchZoomDistanceEnd - this._touchZoomDistanceStart;

                this._touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);
                //this.delta = this._touchZoomDistanceEnd - this._touchZoomDistanceStart;
                if (this._touchZoomDistanceStart !== 0)
                    this.delta = this._touchZoomDistanceStart / this._touchZoomDistanceEnd;
                else
                    this.delta = 0;
                //this.delta = this.delta / 100;
            }
            break;

        default: break;
    }

    if (this.actionEnabled === false) {
        this.mouseLastPosition = new this.VIZCore.Vector2().copy(this.mouse);
        return;
    }

    if (this._state === this.VIZCore.Enum.MOUSE_STATE.TOUCH_ZOOM_PAN && this.delta !== 0) {
        this.EventCnt++;
        if (this.PivotUpdate) {
            //Pick 방식
            let pivotChange = false;
            let body = this.view.Renderer.Picking(this.mouse.x, this.mouse.y);
            if (body !== undefined) {
                let pickInfo;
                pickInfo = this.view.Data.GetPickByBody(body.bodyId, this.mouse.x, this.mouse.y);

                if (pickInfo.pick) {
                    // 피벗 이동
                    this.view.Camera.SetPivot(pickInfo.position);
                    pivotChange = true;
                }
            }
        }

        let scope = this;
        scope.PivotUpdate = false;

        setTimeout(function () {
            scope.EventCnt--;
            if (scope.EventCnt === 0) {
                scope.PivotUpdate = true;
                if (scope.view.IsUseProgressive())
                scope.view.Renderer.enableRenderLimit = false;

                if (!scope.mouseLeftDown && scope.view.useFramebuffer)
                    scope.view.MeshBlock.Reset();
            }
            else {
                scope.PivotUpdate = false;
            }
        }, 300);
    }

    // delta 적용필요

    this.update(this);    
};


UIBase.prototype.touchEnd = function (touches) {
    this._state = this.VIZCore.Enum.MOUSE_STATE.NONE;
    this.mouseLeftDown = false;

    if (this.actionEnabled === false) {
        this._touchLastCount = touches.length;

        if(this._touchLastCount === 0)
            this.view.Camera.RenderPivot = false;
        return;
    }

    switch (this._touchLastCount) {

        case 1:
            // Picking
            //this.mouse = new this.VIZCore.Vector2(touches[0].pageX, touches[0].pageY);
            //let tmp = new this.VIZCore.Vector2().subVectors(this.mouseDownPosition, this.mouse);

            let x = this.mouse.x;
            let y = this.mouse.y;

            /*
            if (this.GetMouseClick(x, y)) {
                let body = this.view.Renderer.Picking(this.mouse.x, this.mouse.y);
                if (body !== undefined) {

                    if (this.view.Browser.IsMS) {
                        this.view.Camera.SetPivot(body.BBox.center);
                    }
                    else {
                        const resultPick = this.view.Data.GetPickByBody(body.bodyId, x, y);
                        if (resultPick.pick) {
                            this.view.Camera.SetPivot(resultPick.position);
                        }
                    }

                    if (this.KeyPress.ctrlKey)
                        this.view.Data.Select(body.bodyId, true, true);
                    else
                        this.view.Data.Select(body.bodyId, true, false);
                    //this.view.Renderer.InitRenderProcess();
                    this.view.Renderer.Render();
                }
                else {
                    if (!this.KeyPress.ctrlKey)
                        this.view.Data.DeselectAll();
                }
                if (this.view.useFramebuffer)
                    this.view.MeshBlock.Reset();
            }
            */

            let usePickViewCube = true;
            let viewCubePick = false;

            if (usePickViewCube)
                viewCubePick = this.view.ViewCube.Pick(x, y, false);

            if (viewCubePick) {
                //ViewCube Pick
                let currentID = this.view.ViewCube.GetPickID();
                //this.view.ViewCube.ClearPickID();

                //console.log("ViewCube ID : " + currentID);
                let bCameraChanged = false;
                switch (currentID) {
                    case 111: // -x
                        //console.log("-X");
                        this.view.Camera.ViewLeftElevation();
                        bCameraChanged = true;
                        break;
                    case 211: // +x
                        //console.log("+X");
                        this.view.Camera.ViewRightElevation();
                        bCameraChanged = true;
                        break;
                    case 311: // -y
                        //console.log("-Y");
                        this.view.Camera.ViewFrontSection();
                        bCameraChanged = true;
                        break;
                    case 411: // +y
                        //console.log("+Y");
                        this.view.Camera.ViewBackSection();
                        bCameraChanged = true;
                        break;
                    case 511: // -z
                        //console.log("-Z");
                        this.view.Camera.ViewBottomPlan();
                        bCameraChanged = true;
                        break;
                    case 611: //+z
                        //console.log("+Z");
                        this.view.Camera.ViewTopPlan();
                        bCameraChanged = true;
                        break;

                    case 100: // -x -y +z (left, front, top)
                    case 302:
                    case 600:
                        //console.log("-X -Y +Z");
                        this.view.Camera.ViewISOLeftFrontTop();
                        bCameraChanged = true;
                        break;

                    case 120: // -x +y +z (left, back, top)
                    case 400:
                    case 602:
                        //console.log("-X +Y +Z");
                        this.view.Camera.ViewISOLeftBackTop();
                        bCameraChanged = true;
                        break;

                    case 202: // +x -y +z (right, front, top)
                    case 322:
                    case 620:
                        //console.log("+X -Y +Z");
                        this.view.Camera.ViewISORightFrontTop();
                        bCameraChanged = true;
                        break;

                    case 222: // +x +y +z (right, back, top)
                    case 420:
                    case 622:
                        //console.log("+X +Y +Z");
                        this.view.Camera.ViewISORightBackTop();
                        bCameraChanged = true;
                        break;

                    case 102: // -x -y -z (left, front, bottom)
                    case 300:
                    case 502:
                        //console.log("-X -Y -Z");
                        this.view.Camera.ViewISOLeftFrontBottom();
                        bCameraChanged = true;
                        break;

                    case 122: // -x +y -z (left, back, bottom)
                    case 402:
                    case 500:
                        //console.log("-X +Y -Z");
                        this.view.Camera.ViewISOLeftBackBottom();
                        bCameraChanged = true;
                        break;

                    case 200: // +x -y -z (right, front, bottom)
                    case 320:
                    case 522:
                        //console.log("+X -Y -Z");
                        this.view.Camera.ViewISORightFrontBottom();
                        bCameraChanged = true;
                        break;

                    case 220: // +x +y -z (right, back, bottom)
                    case 422:
                    case 520:
                        //console.log("+X +Y -Z");
                        this.view.Camera.ViewISORightBackBottom();
                        bCameraChanged = true;
                        break;

                    case 112:  // -x -z (left, bottom)
                    case 501:
                        //console.log("-X -Z");
                        this.view.Camera.ViewLeftBottomSide();
                        bCameraChanged = true;
                        break;

                    case 101: // -x -y (left, front)
                    case 301:
                        //console.log("-X -Y");
                        this.view.Camera.ViewLeftFrontSide();
                        bCameraChanged = true;
                        break;

                    case 121: // -x +y (left, back)
                    case 401:
                        //console.log("-X +Y");
                        this.view.Camera.ViewLeftBackSide();
                        bCameraChanged = true;
                        break;

                    case 110: // -x +z (left, top)
                    case 601:
                        //console.log("-X +Z");
                        this.view.Camera.ViewLeftTopSide();
                        bCameraChanged = true;
                        break;

                    case 212: // +x +z (right, top)
                    case 621:
                        //console.log("+X +Z");
                        this.view.Camera.ViewRightTopSide();
                        bCameraChanged = true;
                        break;

                    case 201: // +x -y (right, front)
                    case 321:
                        //console.log("+X -Y");
                        this.view.Camera.ViewRightFrontSide();
                        bCameraChanged = true;
                        break;

                    case 221: // +x +y (right, back)
                    case 421:
                        //console.log("+X +Y");
                        this.view.Camera.ViewRightBackSide();
                        bCameraChanged = true;
                        break;

                    case 210: // +x -z (right, bottom)
                    case 521:
                        //console.log("+X -Z");
                        this.view.Camera.ViewRightBottomSide();
                        bCameraChanged = true;
                        break;

                    case 312: // -y +z (back, top)
                    case 610:
                        //console.log("-Y +Z");
                        this.view.Camera.ViewFrontTopSide();
                        bCameraChanged = true;
                        break;

                    case 310: // -y -z (back, bottom)
                    case 512:
                        //console.log("-Y -Z");
                        this.view.Camera.ViewFrontBottomSide();
                        bCameraChanged = true;
                        break;

                    case 410: // +y +z (back, top)
                    case 612:
                        //console.log("+Y +Z");
                        this.view.Camera.ViewBackTopSide();
                        bCameraChanged = true;
                        break;

                    case 412: // +y -z (back, bottom)
                    case 510:
                        //console.log("+Y -Z");
                        this.view.Camera.ViewBackBottomSide();
                        bCameraChanged = true;
                        break;
                }

                // 카메라 이벤트 발생
                if (bCameraChanged && this.view.Configuration.Event.EnableCameraChanged) {
                    let cameraInfo = this.view.Camera.GetCameraData();
                    this.view.EventHandler.dispatchEvent(this.VIZCore.Enum.EVENT_TYPES.Control.Changed, cameraInfo);
                }
            }
            else {
                if (this.GetMouseClick(x, y)) {
                    // 선택 정보 가져오기
                    let arrSelect = this.view.Data.GetSelection();
                    // 선택 정보 비교

                    //선택 실패
                    if (!this.KeyPress.ctrlKey) {
                        if (this.view.DemoType !== 5) {
                            this.view.Data.DeselectAll();
                            this.view.CustomObject.DeselectAll();
                        }
                    }

                    // body 선택
                    let calPickBody = function (scope, body) {
                        if (scope.view.Browser.IsMS) {
                            scope.view.Camera.SetPivot(body.BBox.center);
                        }
                        else {
                            const resultPick = scope.view.Data.GetPickByBody(body.bodyId, x, y);
                            if (resultPick.pick) {
                                //console.log(resultPick.position);
                                scope.view.Camera.SetPivot(resultPick.position);
                            }
                            else {
                                scope.view.Camera.SetPivot(body.BBox.center);
                            }
                        }

                        {
                            // 선택 모델 선택시 해제 적용
                            if (scope.KeyPress.ctrlKey) {
                                let found = arrSelect.find(element => element == body.bodyId);
                                if (found !== undefined)
                                    scope.view.Data.Select(body.bodyId, false, true);
                                else
                                    scope.view.Data.Select(body.bodyId, true, true);
                            }
                            else {
                                // 선택 정보가 있다면 해제
                                let found = arrSelect.find(element => element == body.bodyId);
                                if (found !== undefined)
                                    scope.view.Data.Select(body.bodyId, false, false);
                                else
                                    scope.view.Data.Select(body.bodyId, true, false);
                            }
                        }

                        //this.view.Renderer.InitRenderProcess();
                        scope.view.Renderer.Render();
                    };

                    //custom Body 선택
                    let calPickCustomBody = function (scope, customObject, body) {

                        if (scope.view.Browser.IsMS) {
                            scope.view.Camera.SetPivot(body.BBox.center);
                        }
                        else {
                            const resultPick = scope.view.CustomObject.GetPickByBody(customObject.uuid, x, y);
                            if (resultPick.pick) {
                                scope.view.Camera.SetPivot(resultPick.position);
                            }
                            else {
                                scope.view.Camera.SetPivot(body.BBox.center);
                            }
                        }

                        if (scope.KeyPress.ctrlKey)
                            scope.view.CustomObject.Select([customObject.uuid], true, true);
                        else
                            scope.view.CustomObject.Select([customObject.uuid], true, false);

                        //this.view.Renderer.InitRenderProcess();
                        scope.view.Renderer.Render();
                    };

                    if (this.view.Configuration.Model.Selection.Kind !== this.VIZCore.Enum.SelectionObject3DTypes.NONE) {
                        let resultPick = this.view.Renderer.PickingCallback(this.mouse.x, this.mouse.y, this, calPickBody, calPickCustomBody);
                        //선택 실패
                        //if (!resultPick) {
                        //    if (!this.KeyPress.ctrlKey) {
                        //        this.view.Data.DeselectAll();
                        //        this.view.CustomObject.DeselectAll();
                        //    }
                        //}
                    }

                }
            }    
            
            //if (this.view.useFramebuffer)
            ///    this.view.MeshBlock.Reset();

            this.view.ViewRefresh();
            break;
        case 2:
            this._touchZoomDistanceStart = this._touchZoomDistanceEnd = 0;
            break;

    }

    //this.dispatchEvent(endEvent);
    this._touchLastCount = touches.length;

    if(this._touchLastCount === 0)
        this.view.Camera.RenderPivot = false;
};


UIBase.prototype.Render = function () { };
UIBase.prototype.Render2D = function (context) { };

UIBase.prototype.keyDown = function (keycode) { 
  
    if(keycode==17){
        if(this.mouseMiddleDown===true && this._state !== this.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM && this.view.Configuration.Control.Version === 2 )
        {
            this._state = this.VIZCore.Enum.MOUSE_STATE.ROTATE;
        }
    }
};
UIBase.prototype.keyPress = function (keycode) { };
UIBase.prototype.keyUp = function (keycode,tmp) {
    if(keycode===17){        
        if(tmp.mouseMiddleDown===true && (tmp._state === tmp.VIZCore.Enum.MOUSE_STATE.ROTATE||tmp._state === tmp.VIZCore.Enum.MOUSE_STATE.MOUSE_ZOOM )&& tmp.view.Configuration.Control.Version === 2  )
        {
            //this.keyCtrlDown=true;
            tmp._state = tmp.VIZCore.Enum.MOUSE_STATE.PAN;
        }
    }
    

 };


UIBase.prototype.SetSubType = function (subType) { };
UIBase.prototype.GetUIControl = function () { return undefined; };
UIBase.prototype.ShowPivot = function (visible) {
    this.view.Camera.RenderPivot = visible;

    this.view.Camera.ResizeGLWindow();
    this.view.Renderer.MainFBClear();
    this.view.Renderer.Render();
 };

export default UIBase;