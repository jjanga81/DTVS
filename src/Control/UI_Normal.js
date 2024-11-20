/**
 * @author ssjo@softhills.net
 */

let UINormal = function (view, VIZCore) {
    let scope = this;

    let currentHandler = undefined;
    let mouseDragingPickReview = undefined;

    //base 호출사용
    this.base = VIZCore.UIBase;
    this.base(view, VIZCore);

    init();
    function init() {

    }

    this.UIBegin = function () {
        scope.base.prototype.UIBegin.call(scope);
    };

    this.UIEnd = function () {
        if (currentHandler !== undefined) {
            view.Handle.ClearStateById(currentHandler.id);
            currentHandler.enable = false;  //끄기
            currentHandler = undefined;
        }

        mouseDragingPickReview = undefined;

        scope.base.prototype.UIEnd.call(scope);
    };

    this.mouseDown = function (x, y, button) {

        if(button === 0)
        {
            if(!scope.KeyPress.ctrlKey && !scope.KeyPress.altKey && scope.KeyPress.shiftKey)
            {
                //SelectBox 진행
                view.Mode.SelectBox();
                let uimode = view.Control.GetUIMode(); 
                uimode.mouseDown(x, y, button);
                return;
            }
            if(scope.KeyPress.ctrlKey && !scope.KeyPress.altKey && scope.KeyPress.shiftKey)
            {
                //SelectBox 진행
                view.Mode.BoxZoom();
                let uimode = view.Control.GetUIMode(); 
                uimode.mouseDown(x, y, button);
                return;
            }
        }

        //핸들러 확인
        if (currentHandler !== undefined) {
            if (currentHandler.enable)
            {
                currentHandler.state = VIZCore.Enum.HANDLE_MOUSE_STATE.DOWN;
                view.Handle.ReleaseInterval();
            }
        }
        else if(button === 0) {
            mouseDragingPickReview = undefined;

            // 리뷰 이동 설정 필요
            if(view.Data.Review.EnableViewReviewMove) {
                let reviewPickID = view.Data.Review.PickMouse(x, y);
                if(reviewPickID !== undefined) {
                    mouseDragingPickReview = view.Data.Review.GetReview(reviewPickID);
                }
            }
        }

        if (view.IsUseProgressive())
            view.Renderer.enableRenderLimit = true;

        return scope.base.prototype.mouseDown.call(scope, x, y, button);
    };

    this.mouseMove = function (x, y) {
        let handler = view.Handle.Handler();
        if (handler.length > 0) {
            
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

            if (currentHandler !== undefined && currentHandler.state === VIZCore.Enum.HANDLE_MOUSE_STATE.DOWN) {
                //Handle Control
                scope.actionEnabled = false;
                if ((x !== scope.mouseLastPosition.x || y !== scope.mouseLastPosition.y)) {
                    let item = currentHandler;

                    switch (item.itemType) {
                        case VIZCore.Enum.HANDLER_TYPE.MODEL:
                            {
                            }
                            break;

                        case VIZCore.Enum.HANDLER_TYPE.CLIPPING:
                            {
                                let clipPlane = item.object;

                                //let dx = x - scope.mouseLastPosition.x;
                                //let dy = y - scope.mouseLastPosition.y;

                                //let vCenter = new VIZCore.Vector3().copy(item.center);
                                //let vScreenCenter = view.Camera.world2ScreenWithMatrix(matMVP, vCenter);
                                //let vMoveScreenCenter = new VIZCore.Vector3(vScreenCenter.x + dx, vScreenCenter.y + dy, vScreenCenter.z);
                                //let vMovePos = view.Camera.screen2WorldWithMatrix(matMVP, vMoveScreenCenter);
                                //let fMoveLen = new VIZCore.Vector3().subVectors(vMovePos, item.center).length();
                                //let vMoveNormal = new VIZCore.Vector3().subVectors(vMovePos, item.center).normalize();

                                if (item.axis.x.enable && item.axis.x.select) {

                                    // let fDot = item.axis.x.normal.dot(vMoveNormal);
                                    // let vTranslate = new VIZCore.Vector3().copy(item.axis.x.normal);
                                    // vTranslate.multiplyScalar(fMoveLen).multiplyScalar(fDot);

                                    let resultTransform = view.Handle.UpdateTransformByMouseMove(item, x, y , scope.mouseLastPosition.x, scope.mouseLastPosition.y, scope.KeyPress.shiftKey);
                                    if(resultTransform) {
                                        clipPlane.center.copy(resultTransform.matrix.multiplyVector(clipPlane.center));
                                    }
                                }
                                else if (item.axis.y.enable && item.axis.y.select) {
                                    // let fDot = item.axis.y.normal.dot(vMoveNormal);
                                    // let vTranslate = new VIZCore.Vector3().copy(item.axis.y.normal);
                                    // vTranslate.multiplyScalar(fMoveLen).multiplyScalar(fDot);

                                    let resultTransform = view.Handle.UpdateTransformByMouseMove(item, x, y , scope.mouseLastPosition.x, scope.mouseLastPosition.y, scope.KeyPress.shiftKey);
                                    if(resultTransform) {
                                        clipPlane.center.copy(resultTransform.matrix.multiplyVector(clipPlane.center));
                                    }
                                }
                                else if (item.axis.z.enable && item.axis.z.select) {
                                    // let fDot = item.axis.z.normal.dot(vMoveNormal);
                                    // let vTranslate = new VIZCore.Vector3().copy(item.axis.z.normal);
                                    // vTranslate.multiplyScalar(fMoveLen).multiplyScalar(fDot);

                                    let resultTransform = view.Handle.UpdateTransformByMouseMove(item, x, y, scope.mouseLastPosition.x, scope.mouseLastPosition.y, scope.KeyPress.shiftKey);
                                    if(resultTransform) {
                                        clipPlane.center.copy(resultTransform.matrix.multiplyVector(clipPlane.center));
                                    }
                                }
                                else if (item.rotate.x.enable && item.rotate.x.select) {

                                    let resultTransform = view.Handle.UpdateTransformByMouseMove(item, x, y , scope.mouseLastPosition.x, scope.mouseLastPosition.y, scope.KeyPress.shiftKey);
                                  
                                    if(resultTransform) {
                                        let matRotate = resultTransform.matrix;
                                        matRotate.setPosition(new VIZCore.Vector3());

                                        item.axis.x.normal.copy(matRotate.multiplyVector(item.axis.x.normal));
                                        item.axis.y.normal.copy(matRotate.multiplyVector(item.axis.y.normal));
                                        item.axis.z.normal.copy(matRotate.multiplyVector(item.axis.z.normal));

                                        clipPlane.normal.copy(matRotate.multiplyVector(clipPlane.normal));
                                    }
                                }
                                else if (item.rotate.y.enable && item.rotate.y.select) {

                                    let resultTransform = view.Handle.UpdateTransformByMouseMove(item, x, y , scope.mouseLastPosition.x, scope.mouseLastPosition.y, scope.KeyPress.shiftKey);

                                    if(resultTransform) {
                                        let matRotate = resultTransform.matrix;
                                        matRotate.setPosition(new VIZCore.Vector3());

                                        item.axis.x.normal.copy(matRotate.multiplyVector(item.axis.x.normal));
                                        item.axis.y.normal.copy(matRotate.multiplyVector(item.axis.y.normal));
                                        item.axis.z.normal.copy(matRotate.multiplyVector(item.axis.z.normal));

                                        clipPlane.normal.copy(matRotate.multiplyVector(clipPlane.normal));
                                    }
                                }
                                else if (item.rotate.z.enable && item.rotate.z.select) {

                                    let resultTransform = view.Handle.UpdateTransformByMouseMove(item, x, y , scope.mouseLastPosition.x, scope.mouseLastPosition.y, scope.KeyPress.shiftKey);

                                    if(resultTransform) {
                                        let matRotate = resultTransform.matrix;
                                        matRotate.setPosition(new VIZCore.Vector3());

                                        item.axis.x.normal.copy(matRotate.multiplyVector(item.axis.x.normal));
                                        item.axis.y.normal.copy(matRotate.multiplyVector(item.axis.y.normal));
                                        item.axis.z.normal.copy(matRotate.multiplyVector(item.axis.z.normal));

                                        clipPlane.normal.copy(matRotate.multiplyVector(clipPlane.normal));
                                    }
                                }

                                                           
                                let eventInfo = view.Data.ClippingEvent(VIZCore.Enum.CLIPPING_TYPE.TRANSFORM, clipPlane);
                                view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Section.Changed, eventInfo);

                                clipPlane.changed = true;

                                view.Clipping.Update();

                                view.Renderer.MainFBClear();
                                view.Renderer.Render();
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
                    currentHandler = view.Handle.Pick(x, y);
                    if (currentHandler !== undefined) {
                        currentHandler.state = VIZCore.Enum.HANDLE_MOUSE_STATE.OVER;
                        view.Renderer.Render();
                    }
                }
            }
        }

        if(scope.actionEnabled && scope.mouseLeftDown &&
            mouseDragingPickReview !== undefined) {
                scope.actionEnabled = false;
                let review = mouseDragingPickReview;

                //2d Review 예외
                if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE) {

                    let offset = new VIZCore.Vector3(x - scope.mouse.x, y - scope.mouse.y, 0);
                    let screen = new VIZCore.Vector3().copy(review.text.position);
                    let currentScreen = new VIZCore.Vector3(screen.x + offset.x, screen.y + offset.y, 0);

//                    review.text.position.set(x, y, 0.5);
                    review.text.position.set(currentScreen.x, currentScreen.y, 0.5);
                    view.Renderer.Render();
                }
                else {
                    let matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
                    let screen = view.Camera.world2ScreenWithMatrix(matMVP, new VIZCore.Vector3().copy(review.text.position));

                    let offset = new VIZCore.Vector3(x - scope.mouse.x, y - scope.mouse.y, 0);
                    let world = view.Camera.screen2WorldWithMatrix(matMVP, new VIZCore.Vector3(screen.x + offset.x, screen.y + offset.y, screen.z));
                    //let world = view.Camera.screen2WorldWithMatrix(matMVP, new VIZCore.Vector3(x, y, screen.z));

                    review.text.position.copy(world);
                    view.Renderer.Render();
                }

            }

        scope.base.prototype.mouseMove.call(scope, x, y);
        scope.actionEnabled = true;
    };

    this.mouseUp = function (x, y, button) {
        if (currentHandler !== undefined) {
            view.Handle.ClearStateById(currentHandler.id);
            currentHandler = undefined;
        }
        if (view.IsUseProgressive())
            view.Renderer.enableRenderLimit = false;

        
        // 리뷰 선택 확인
        let reviewPick = function(scope)
        {
            let result = false;
            
            let view = scope.view;
            let VIZCore = scope.VIZCore;
            
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

            //const clientX = view.Control.CurrentEvent.clientX;
            ///const clientY = view.Control.CurrentEvent.clientY;

            // 리뷰정보 확인
            for(let i = view.Data.Reviews.length - 1 ; i >= 0 ; i--) {
                let review = view.Data.Reviews[i];
                if(!review.visible) continue;

                let bEventCallback = false;

                if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_IMAGE_NOTE
                    && review.drawitem.custom !== undefined)
                {
                    // 좌표 정보 확인
                    if (review.drawitem.custom.image !== undefined)
                    {
                        let offsetX = review.drawitem.custom.size.x / 2;
                        let offsetY = review.drawitem.custom.size.y / 2;

                        let pos = new VIZCore.Vector3().copy(review.drawitem.position[0]);
                        let imgPos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3().copy(pos));

                        //let min = new VIZCore.Vector3(imgPos.x - offsetX, imgPos.y - offsetY, 0);
                        //let max = new VIZCore.Vector3(imgPos.x + offsetX, imgPos.y + offsetY, 0);
                        let min = new VIZCore.Vector3(imgPos.x - offsetX , imgPos.y - offsetY * 2, 0);
                        let max = new VIZCore.Vector3(imgPos.x + offsetX, imgPos.y, 0);

                        if(x > min.x && x < max.x && y > min.y && y < max.y)
                        {
                            result = true;
                            // 이벤트 발생
                            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Selected, review);

                            // 선택 이벤트 통합
                            view.Data.OnEvent(VIZCore.Enum.EVENT_TYPES.Review.Selected, review);

                            //Mouse Position 정보 반환 이벤트 활성화
                            view.Control.MouseEvent = true;
                            view.Control.MouseEventData = review;

                            bEventCallback = true;

                            break;
                        }
                    }
                } 
                if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_HEADER_NOTE
                    && review.header.icon.image !== undefined)
                {
                    let textPosition = new VIZCore.Vector3().copy(review.text.position);
                    let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, textPosition);

                    let posImage = new VIZCore.Vector2(pos.x + review.header.icon.rect.x, pos.y + review.header.icon.rect.y);


                    let min = new VIZCore.Vector3(posImage.x , posImage.y, 0);
                    let max = new VIZCore.Vector3(posImage.x + review.header.icon.rect.width, posImage.y + review.header.icon.rect.height, 0);

                    if(x > min.x && x < max.x && y > min.y && y < max.y)
                    {
                        result = true;
                        // 이벤트 발생
                        //view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Selected, review);
                        // 선택 이벤트 통합
                        //view.Data.OnEvent(VIZCore.Enum.EVENT_TYPES.Review.Selected, review);

                        //Mouse Position 정보 반환 이벤트 활성화
                        view.Control.MouseEvent = true;
                        view.Control.MouseEventData = review;
                        if(review.header.icon.onClick !== undefined)
                        {
                            bEventCallback = true;
                            let obj = view.Data.EventItem();
                            obj.type = VIZCore.Enum.EVENT_TYPES.Review.Click;
                            obj.event = view.Control.CurrentEvent;
                            obj.info = review;
                            review.header.icon.onClick(obj);
                            //review.header.icon.onClick(review);
                        }
                        break;
                    }
                }
                if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE
                    && review.icon.image !== undefined)
                {
                    let textPosition = new VIZCore.Vector3().copy(review.text.position);
                    let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, textPosition);

                    let posImage = new VIZCore.Vector2(pos.x + review.icon.rect.x, pos.y + review.icon.rect.y);


                    let min = new VIZCore.Vector3(posImage.x , posImage.y, 0);
                    let max = new VIZCore.Vector3(posImage.x + review.icon.rect.width, posImage.y + review.icon.rect.height, 0);

                    if(x > min.x && x < max.x && y > min.y && y < max.y)
                    {
                        result = true;
                        // 이벤트 발생
                        //view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Selected, review);

                        // 선택 이벤트 통합
                        //view.Data.OnEvent(VIZCore.Enum.EVENT_TYPES.Review.Selected, review);

                        //Mouse Position 정보 반환 이벤트 활성화
                        view.Control.MouseEvent = true;
                        view.Control.MouseEventData = review;
                        if(review.icon.onClick !== undefined)
                        {
                            bEventCallback = true;
                            let obj = view.Data.EventItem();
                            obj.type = VIZCore.Enum.EVENT_TYPES.Review.Click;
                            obj.event = view.Control.CurrentEvent;
                            obj.info = review;
                            review.icon.onClick(obj);
                            //review.icon.onClick(review);
                        }
                        break;
                    }
                }

                if(bEventCallback === false){
                    for(let j = 0 ; j < review.rect.length ; j++) {
                        let rect = review.rect[j];

                        if(rect.isPointInRect(x, y) === false) continue;
                        //if(rect.isPointInRect(clientX, clientY) === false) continue;

                        result = true;
                        review.selection = true;

                        if(review.onClick !== undefined)
                        {
                            let obj = view.Data.EventItem();
                            obj.type = VIZCore.Enum.EVENT_TYPES.Review.Click;
                            obj.event = view.Control.CurrentEvent;
                            obj.info = review;
                            review.onClick(obj);
                            //review.onClick(review);
                        }
                        else{
                            // 이벤트 발생
                            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Selected, review);

                            // 선택 이벤트 통합
                            view.Data.OnEvent(VIZCore.Enum.EVENT_TYPES.Review.Selected, review);
                        }

                        if(view.Configuration.Event.EnableReviewSelectedPosition)
                        {
                            //Mouse Position 정보 반환 이벤트 활성화
                            view.Control.MouseEvent = true;
                            view.Control.MouseEventData = review;
                        }

                        break;
                    }
                }

                if(result)
                    break;
            }
            return result;
        }

        if (scope.GetMouseClick(x, y)) {

            //selectClear
            if(!scope.KeyPress.ctrlKey)
                view.Data.Review.SelectAll(false);

            let bReviewPick = reviewPick(this);
            if(bReviewPick) {
                view.Renderer.Render();

                scope.actionEnabled = false;
                let eventListener = scope.base.prototype.mouseUp.call(scope, x, y, button);
                scope.actionEnabled = true;

                return eventListener;
            }
        }

        mouseDragingPickReview = undefined;
        
        return scope.base.prototype.mouseUp.call(scope, x, y, button);
    };

    this.mouseWheel = function (x, y, delta) {
        scope.base.prototype.mouseWheel.call(scope, x, y, delta);
    };
    

    this.mouseDoubleClick = function (x, y, button) {
        scope.base.prototype.mouseDoubleClick.call(scope, x, y, button);
    };
    
    this.touchStart = function (touches) {

        if (touches.length > 0) {

            if(touches.length === 1) {

                let pos = this.view.Control.GetCalcTouchPos(touches[0]);
                
                let x = pos.x;
                let y = pos.y;

                let handler = view.Handle.Handler();
                if (handler.length > 0) {
                    //const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
        
                    ///Touch의 경우 start에서 검토
                    if (currentHandler === undefined) {
                        if (!scope.mouseLeftDown) {
                            if (currentHandler !== undefined && currentHandler.state === VIZCore.Enum.HANDLE_MOUSE_STATE.OVER)
                                view.Renderer.Render();
        
                            view.Handle.ClearState();
                            view.Clipping.PickPlane(x, y); //단면 Handle 가시화 확인
                            currentHandler = view.Handle.Pick(x, y);
                            if (currentHandler !== undefined) {
                                currentHandler.state = VIZCore.Enum.HANDLE_MOUSE_STATE.OVER;
                                view.Renderer.Render();
                            }
                        }
                    }
                }

                //핸들러 확인
                if (currentHandler !== undefined) {
                    if (currentHandler.enable)
                        currentHandler.state = VIZCore.Enum.HANDLE_MOUSE_STATE.DOWN;
                }
                else {
                    //리뷰 확인
                    mouseDragingPickReview = undefined;

                    // 리뷰 이동 설정 필요
                    if(view.Data.Review.EnableViewReviewMove) {            
                        let reviewPickID = view.Data.Review.PickMouse(x, y);
                        if(reviewPickID !== undefined) {
                            mouseDragingPickReview = view.Data.Review.GetReview(reviewPickID);
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

        if (touches.length > 0) {

            if(touches.length === 1) {

                let pos = this.view.Control.GetCalcTouchPos(touches[0]);
                
                let x = pos.x;
                let y = pos.y;
                
                let handler = view.Handle.Handler();
                if (handler.length > 0) {
                    const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

                    if (currentHandler !== undefined && currentHandler.state === VIZCore.Enum.HANDLE_MOUSE_STATE.DOWN) {
                        //Handle Control
                        scope.actionEnabled = false; 
                        if ((x !== scope.mouseLastPosition.x || y !== scope.mouseLastPosition.y)) {
                            let item = currentHandler;
        
                            switch (item.itemType) {
                                case VIZCore.Enum.HANDLER_TYPE.MODEL:
                                    {
                                    }
                                    break;
        
                                case VIZCore.Enum.HANDLER_TYPE.CLIPPING:
                                    {
                                        let clipPlane = item.object;
        
                                        // let dx = x - scope.mouseLastPosition.x;
                                        // let dy = y - scope.mouseLastPosition.y;
        
                                        // let vCenter = new VIZCore.Vector3().copy(item.center);
                                        // let vScreenCenter = view.Camera.world2ScreenWithMatrix(matMVP, vCenter);
                                        // let vMoveScreenCenter = new VIZCore.Vector3(vScreenCenter.x + dx, vScreenCenter.y + dy, vScreenCenter.z);
                                        // let vMovePos = view.Camera.screen2WorldWithMatrix(matMVP, vMoveScreenCenter);
                                        // let fMoveLen = new VIZCore.Vector3().subVectors(vMovePos, item.center).length();
                                        // let vMoveNormal = new VIZCore.Vector3().subVectors(vMovePos, item.center).normalize();
        
                                        if (item.axis.x.enable && item.axis.x.select) {

                                            // let fDot = item.axis.x.normal.dot(vMoveNormal);
                                            // let vTranslate = new VIZCore.Vector3().copy(item.axis.x.normal);
                                            // vTranslate.multiplyScalar(fMoveLen).multiplyScalar(fDot);
        
                                            let resultTransform = view.Handle.UpdateTransformByMouseMove(item, x, y , scope.mouseLastPosition.x, scope.mouseLastPosition.y);
                                            if(resultTransform) {
                                                clipPlane.center.copy(resultTransform.matrix.multiplyVector(clipPlane.center));
                                            }
                                        }
                                        else if (item.axis.y.enable && item.axis.y.select) {
                                            // let fDot = item.axis.y.normal.dot(vMoveNormal);
                                            // let vTranslate = new VIZCore.Vector3().copy(item.axis.y.normal);
                                            // vTranslate.multiplyScalar(fMoveLen).multiplyScalar(fDot);
        
                                            let resultTransform = view.Handle.UpdateTransformByMouseMove(item, x, y , scope.mouseLastPosition.x, scope.mouseLastPosition.y);
                                            if(resultTransform) {
                                                clipPlane.center.copy(resultTransform.matrix.multiplyVector(clipPlane.center));
                                            }
                                        }
                                        else if (item.axis.z.enable && item.axis.z.select) {
                                            // let fDot = item.axis.z.normal.dot(vMoveNormal);
                                            // let vTranslate = new VIZCore.Vector3().copy(item.axis.z.normal);
                                            // vTranslate.multiplyScalar(fMoveLen).multiplyScalar(fDot);
        
                                            let resultTransform = view.Handle.UpdateTransformByMouseMove(item, x, y, scope.mouseLastPosition.x, scope.mouseLastPosition.y);
                                            if(resultTransform) {
                                                clipPlane.center.copy(resultTransform.matrix.multiplyVector(clipPlane.center));
                                            }
                                        }
                                        else if (item.rotate.x.enable && item.rotate.x.select) {
        
                                            let resultTransform = view.Handle.UpdateTransformByMouseMove(item, x, y , scope.mouseLastPosition.x, scope.mouseLastPosition.y);
                                          
                                            if(resultTransform) {
                                                let matRotate = resultTransform.matrix;
                                                matRotate.setPosition(new VIZCore.Vector3());
        
                                                item.axis.x.normal.copy(matRotate.multiplyVector(item.axis.x.normal));
                                                item.axis.y.normal.copy(matRotate.multiplyVector(item.axis.y.normal));
                                                item.axis.z.normal.copy(matRotate.multiplyVector(item.axis.z.normal));
        
                                                clipPlane.normal.copy(matRotate.multiplyVector(clipPlane.normal));
                                            }
                                        }
                                        else if (item.rotate.y.enable && item.rotate.y.select) {
        
                                            let resultTransform = view.Handle.UpdateTransformByMouseMove(item, x, y , scope.mouseLastPosition.x, scope.mouseLastPosition.y);
        
                                            if(resultTransform) {
                                                let matRotate = resultTransform.matrix;
                                                matRotate.setPosition(new VIZCore.Vector3());
        
                                                item.axis.x.normal.copy(matRotate.multiplyVector(item.axis.x.normal));
                                                item.axis.y.normal.copy(matRotate.multiplyVector(item.axis.y.normal));
                                                item.axis.z.normal.copy(matRotate.multiplyVector(item.axis.z.normal));
        
                                                clipPlane.normal.copy(matRotate.multiplyVector(clipPlane.normal));
                                            }
                                        }
                                        else if (item.rotate.z.enable && item.rotate.z.select) {
        
                                            let resultTransform = view.Handle.UpdateTransformByMouseMove(item, x, y , scope.mouseLastPosition.x, scope.mouseLastPosition.y);
        
                                            if(resultTransform) {
                                                let matRotate = resultTransform.matrix;
                                                matRotate.setPosition(new VIZCore.Vector3());
        
                                                item.axis.x.normal.copy(matRotate.multiplyVector(item.axis.x.normal));
                                                item.axis.y.normal.copy(matRotate.multiplyVector(item.axis.y.normal));
                                                item.axis.z.normal.copy(matRotate.multiplyVector(item.axis.z.normal));
        
                                                clipPlane.normal.copy(matRotate.multiplyVector(clipPlane.normal));
                                            }
                                        }
        
                                        clipPlane.changed = true;
        
                                        view.Clipping.Update();
                                        view.Renderer.MainFBClear();
                                        view.Renderer.Render();
                                    }
                                    break;
                            } //switch
                        } //item.state === VIZCore.Enum.HANDLE_MOUSE_STATE.DOWN
                    }
                }              
                if(scope.actionEnabled &&
                    mouseDragingPickReview !== undefined) {
                        scope.actionEnabled = false;

                        let review = mouseDragingPickReview;
        
                        //2d Review 예외
                        if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE) {
        
                            let offset = new VIZCore.Vector3(x - scope.mouse.x, y - scope.mouse.y, 0);
                            let screen = new VIZCore.Vector3().copy(review.text.position);
                            let currentScreen = new VIZCore.Vector3(screen.x + offset.x, screen.y + offset.y, 0);
                            
                            review.text.position.set(currentScreen.x, currentScreen.y, 0.5);
                            view.Renderer.Render();
                        }
                        else {
                            let matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
                            let screen = view.Camera.world2ScreenWithMatrix(matMVP, new VIZCore.Vector3().copy(review.text.position));
        
                            let offset = new VIZCore.Vector3(x - scope.mouse.x, y - scope.mouse.y, 0);
                            let world = view.Camera.screen2WorldWithMatrix(matMVP, new VIZCore.Vector3(screen.x + offset.x, screen.y + offset.y, screen.z));
                                    
                            review.text.position.copy(world);
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
            if (currentHandler !== undefined) {
                view.Handle.ClearStateById(currentHandler.id);
                currentHandler = undefined;
            }

            if (view.IsUseProgressive())
                view.Renderer.enableRenderLimit = false;
        }

        // 리뷰 선택 확인
        let reviewPick = function (scope, x, y) {
            let result = false;
             let view = scope.view;
            let VIZCore = scope.VIZCore;
             const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
          
            // 리뷰정보 확인
            for (let i = view.Data.Reviews.length - 1; i >= 0; i--) {
                let review = view.Data.Reviews[i];
                if (!review.visible) continue;
                 let bEventCallback = false;
                 if (review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_IMAGE_NOTE
                    && review.drawitem.custom !== undefined) {
                    // 좌표 정보 확인
                    if (review.drawitem.custom.image !== undefined) {
                        let offsetX = review.drawitem.custom.size.x / 2;
                        let offsetY = review.drawitem.custom.size.y / 2;
                         let pos = new VIZCore.Vector3().copy(review.drawitem.position[0]);
                        let imgPos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3().copy(pos));
                       
                        let min = new VIZCore.Vector3(imgPos.x - offsetX, imgPos.y - offsetY * 2, 0);
                        let max = new VIZCore.Vector3(imgPos.x + offsetX, imgPos.y, 0);
                         if (x > min.x && x < max.x && y > min.y && y < max.y) {
                            result = true;
                            // 이벤트 발생
                            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Selected, review);
                             // 선택 이벤트 통합
                            view.Data.OnEvent(VIZCore.Enum.EVENT_TYPES.Review.Selected, review);
                      
                            bEventCallback = true;
                            break;
                        }
                    }
                }
                if (review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_HEADER_NOTE
                    && review.header.icon.image !== undefined) {
                    let textPosition = new VIZCore.Vector3().copy(review.text.position);
                    let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, textPosition);
                     let posImage = new VIZCore.Vector2(pos.x + review.header.icon.rect.x, pos.y + review.header.icon.rect.y);
                      let min = new VIZCore.Vector3(posImage.x, posImage.y, 0);
                    let max = new VIZCore.Vector3(posImage.x + review.header.icon.rect.width, posImage.y + review.header.icon.rect.height, 0);
                     if (x > min.x && x < max.x && y > min.y && y < max.y) {
                        result = true;
                        
                        if (review.header.icon.onClick !== undefined) {
                            bEventCallback = true;
                            let obj = view.Data.EventItem();
                            obj.type = VIZCore.Enum.EVENT_TYPES.Review.Click;
                            obj.event = view.Control.CurrentEvent;
                            obj.info = review;
                            review.header.icon.onClick(obj);
                            //review.header.icon.onClick(review);
                        }
                        break;
                    }
                }
                if (review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE
                    && review.icon.image !== undefined) {
                    let textPosition = new VIZCore.Vector3().copy(review.text.position);
                    let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, textPosition);
                     let posImage = new VIZCore.Vector2(pos.x + review.icon.rect.x, pos.y + review.icon.rect.y);
                      let min = new VIZCore.Vector3(posImage.x, posImage.y, 0);
                    let max = new VIZCore.Vector3(posImage.x + review.icon.rect.width, posImage.y + review.icon.rect.height, 0);
                     if (x > min.x && x < max.x && y > min.y && y < max.y) {
                        result = true;
                 
                        if (review.icon.onClick !== undefined) {
                            bEventCallback = true;
                            let obj = view.Data.EventItem();
                            obj.type = VIZCore.Enum.EVENT_TYPES.Review.Click;
                            obj.event = view.Control.CurrentEvent;
                            obj.info = review;
                            review.icon.onClick(obj);
                            //review.icon.onClick(review);
                        }
                        break;
                    }
                }
                 if (bEventCallback === false) {
                    for (let j = 0; j < review.rect.length; j++) {
                        let rect = review.rect[j];
                         if (rect.isPointInRect(x, y) === false) continue;
                        //if(rect.isPointInRect(clientX, clientY) === false) continue;
                         result = true;
                        review.selection = true;
                         if (review.onClick !== undefined) {
                            let obj = view.Data.EventItem();
                            obj.type = VIZCore.Enum.EVENT_TYPES.Review.Click;
                            obj.event = view.Control.CurrentEvent;
                            obj.info = review;
                            review.onClick(obj);
                            //review.onClick(review);
                        }
                        else {
                            // 이벤트 발생
                            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Selected, review);
                             // 선택 이벤트 통합
                            view.Data.OnEvent(VIZCore.Enum.EVENT_TYPES.Review.Selected, review);
                        }
                        
                         break;
                    }
                }
                 if (result)
                    break;
            }
            return result;
        }
        
        if (scope._touchLastCount === 1){
            let pos = this.view.Control.GetCalcTouchPos(scope._touchLast[0]);
            let x = pos.x;
            let y = pos.y; 
            
            view.Data.Review.SelectAll(false);
            
            let bReviewPick = reviewPick(this, x, y);
            if (bReviewPick) {
                view.Renderer.Render();    
                
                scope.actionEnabled = false;
                let eventListener = scope.base.prototype.touchEnd.call(scope, touches);
                scope.actionEnabled = true;    
                
                return eventListener;
            }
        }
        
        scope.base.prototype.touchEnd.call(scope, touches);
    };

    this.keyUp = function (keyCode) {

        if(keyCode === 46) { //Delete key
            //선택 reivew 삭제
            view.Data.Review.DeleteSelectedReview();
            
            view.ViewRefresh();
            //view.Renderer.Render();
        }

        if(keyCode === 17){ //ctrlkey

            scope.base.prototype.keyUp(keyCode,this);

        }

        // if(keyCode === 27) //ESC
        // {
        // }
        // else if(keyCode === 8 ) //Backspace
        // {
        // }
    };

    this.MouseLog = function () {
        console.log('UINormal.mouse : ' + scope.mouse.x + ',' + scope.mouse.y);
    };


};

export default UINormal;

//VIZCore.UINormal.prototype = VIZCore.UIBase.prototype; //call방식으로 base Function을 불러올수 없음

//VIZCore.UINormal.prototype = new VIZCore.UIBase(undefined); //call방식으로 base Function을 불러오기 가능
//VIZCore.this.constructor = VIZCore.UINormal;

//VIZCore.UINormal.prototype = Object.create(VIZCore.UIBase.prototype); 
//VIZCore.this.constructor = VIZCore.UINormal;
