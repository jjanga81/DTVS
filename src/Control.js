//import $ from 'jquery';

/**
 * @author jhjang@softhills.net
 */
import UIBase from "./Control/UI_Base.js";
import UINormal from "./Control/UI_Normal.js";
import UIMarkup from "./Control/UI_Markup.js";
import UIMarkupBase from "./Control/UI_Markup_Base.js";
import UIWalkthrough from "./Control/UI_Walkthrough.js";
import UIFly from "./Control/UI_Fly.js";
import UIObjectTransform from "./Control/UI_ObjectTransform.js";
import UIScreenBox from "./Control/UI_ScreenBox.js";

let Control = function (view, VIZCore) {
    let scope = this;

    // Control Mode State
    let _modeState = VIZCore.Enum.CONTROL_STATE.NORMAL;
    let _lastModeState = VIZCore.Enum.CONTROL_STATE.NORMAL;
    this._sub = VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE; // 사용자 정의 컨트롤 사용시 조작 설정 값

    let _UIModeList = [];

    let delta = 0;
    this.enabled = false;

    this.MouseEvent = false;
    this.MouseEventData = undefined;
    this.CurrentEvent = undefined; // 마우스 및 터치 이벤트 관리 객체
    this.ToolbarEvent = undefined;

    this.ControlCam = undefined;

    let cursorimagePaths = {
        move: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAhNAAAITQEhiCGBAAACM0lEQVRIibVWsWsaYRT/LkQoFFSwkEkaFIqIoEP9OjS66KTCLU6K3j/Qk3TKIiktDm5CHXVS3L0lm4PSDj0COjhlkAQTyJGKp6W14HDlJ164XNLcZ1p/8MmPd99773vvfe99Ep/Pl0omk2VCyL6maeSxRSmNYFntM65dr9d7kE6nj+Lx+JEgCFeKolwuFovTbrf7jhhQLBZfEkJOwDmOc2uaphJG7FcqFU1HrVb7FYlEjs0nCQQC19PpVMMCZ41g9ZPP5y+1R4yHw2G53+/fHgI8GAx+YXGwgyBVVb2p1+uLRqNR7vV6n4yBp1Kpst/vDzudzlsZeCgUehuNRo+tkqQ7+Nputz+bjQMOh6Nnt9vfV6tVRZeBQ+Z2u08tq8CaS1EUz/UUrTmT3g7rTXgq7jlAXrPZbGJTe9B5qCZ3HFBKZY/H89Hlcr3a1AF0oAsbRjmHPKGJJEn61mw293BDUMTlcvnbuJHn+RexWOw5eKfT+SlJ0nfjd5vN9kwUxT1VVUkul1N4nn9TKpUuSCaTSVBKf6CB/hdgCzYxVrZe5K2laDgc+lbzyjwSBEHAPT/ctA+gA13zCLmTIlmW6Wg0+jCZTM42TQV0oDsYDA6M8l3zxofGBQtardaJPs6N2HqR70VgBjoUTYQi6p/AC4XCIdKyPvlfYRnBbDaLzufzCm6ILgOHbDwev7YMgWUi/suDwzyun/pkrhqNBRzHOSmlY3BZlpkffeZbtDaIMZ5g/kdBCPkDEon+zHQfYBwAAAAASUVORK5CYII=",
        rotate: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAhNAAAITQEhiCGBAAACuklEQVRIiWPQ0NDw8fb27mBgYFD4//8/A7UxI8jwkJCQ8g8fPjCcP3/+6cuXL598//79zMGDB3MYqABYtm7dOsPFxaW8oKAAxJeeM2eO0KJFi7bBzGZkZBTw8vJK/PPnjz0/P78ASOzly5dXfvz4sfLkyZOHCboB5I24uLgn/////z979uxvtra2dSAxBgYGAVNT01Pp6emf1q9f/x8Z3L9////8+fP/+/v7vwCFAL5gBRN+fn7nkQ2PiYlJcXFx+QAyiBDYv3//fxMTk7sgB2GzgBFE2NvbT+Hl5f2yZcuWitjY2JT///9PXbJkCRvMlxs2bGDYsmXLGy4urq8fP35kkZWVFQkJCWE3MDAAy4PiLzw8/O6uXbtM/v///wEjiGDYz89PLzg4+C3M0efPn/9va2v73NzcPA3F2wwMAm5ubhvCw8M/v3//HqwW5FsHB4drWIMIht3d3U/ANIAMd3R0PIgvfM3MzGxBDoLpAcWLm5tbBE4LrKysdkVGRt7t7+//7+Xl9YiYPAGyJDs7+wfM125ubndwWoAUBArEZDwNDY0Zfn5+O1RVVT/DLAAlltzc3AdSUlI/QUGJoQmWkojBILXd3d3f0RMaKFl7eXkVYvjAzs5uCih4QEFFiiUgV8MMB8WHtbX1BYwgAqWg8vLyD7DI0tfXP0KsJeHh4ZNAekAAFOnIeQKuCJTEYKkBZgkpPklKSpoTHx8PDxoUC0BBA8qR6KC+vv4/SCMhwxkYGAxAtI6OTglGTgalFhERkcuRkZFv5eTkxEtKSjjApZ609C8VFZXZcnJyFxYvXjwHV1lmbm5uKyoquldGRubHmzdvnrCzsy9bunRpC9acjJ7RQHxSMxpGrkfm0KKoYIRqgAOaFnYwXFRUFE6t4hpfyhAA5QVKKxyMIEIHlFaZBC2gFDDR1HQGBgYAornB5bs3jwwAAAAASUVORK5CYII=",
        zoom: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAhNAAAITQEhiCGBAAACNklEQVRIibVUMW/aQBR+rpDAFggkbrCMUUH9A0ywMLAwM5JMDIwRIhvdYMg/6NoBtrQLSCyRkLD5BWZgYQpZIBFYBslESG161bNyVlrso7TuJz2d/Gzf93137z2BUgr/E+/89hYEoZpOpw1CyDNGKpXaEULuBEEonqPnyAFuLMtyz7btcL1eh1KpBIlEAhaLBei6Dr1eDxRFeVoulwVK6cNJBiRgAQCfJUmi7Xab+sGyLFqpVGgsFvsBANW3/3uF6wCVS5J022g0IBKJuAI6nY6zooNut+vmZ7MZTCaTl81m84HrhLHKsnxA5RiYZsGgadoveXwuFotUVVWD54AdTTUajTpbMQI/MCJcDcOgoihSHoFTRaqqfsQLPRe5XA6y2Swe7zX3iJLJ5HO/3/dVzUOz2URHOtcBAkvxb3DqP4cgHA5/wyph1YL17oftduu8x5V9DwDWqSO6q9VqZ18yQlEUyusHx4FpmjfYoUwVAlW+dcKUT6dTNzcYDGC/3yPPF64DDEVRHrFD/7QPhsMh9gCVZfmWV6YhRoSzZTwe34dCIUHTtCMhWJIsb9s2tFotOBwO2/V6fcG95d9mUZUQ8h07FJvIC1jOqJwQYomi+HJqHnlN0/eqqg5M08xhE5XLZXeajkYj58xFUfy6Wq0uCoXC1Xw+/7Tb7S5974E7RwCwQ/XX6HupzefzVzhZcfWdRf8aSOw3vgMhYE7i8fgRSWAEfiSBEniRBE7ASDKZzL1nmQYKAPgJ0vPy7X0gtJwAAAAASUVORK5CYII=",
        walkthrough: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAABCbAAAQmwF0iZxLAAAB00lEQVRIia1VMW7CQBBcJQ/ADUJCFG4jJERH4eYKGhqoXNG4QulyT7gfWH6Bwwt4wj3BFbVrKlOmu2iSc3Qcax8RHsmyZK93d+Zm16+z2SyP4/j9crm80S+uRPRFQ2GxWJyMMaZpGqO1NlJKQ0TlYAWISCF5WyRJkoqIoiELCHTekXyQQhFk8ZLnh8OhUUqZNE0bIsqeLVI6yVVVVcZFlmU4l/jZIj9A58YD5AMrJlzt9/vaYapC+WMEc9hut5UXm5VleROJs5xOp/0O7CqA526cEEJzcXmeI060cS9+gfP5fOUKj0Yj3JYhCaSUmK2Pvpi8nQufvtsZyNZ1zbK1wxqxDIioKIoi1CjweTwe2Re73Y68Zm4xHo+1z8I66cYl2GNdLDpc9wfBHbYdRhfRarViK6Rpqnv5TyaTk8/C1TbUjI3tRYzhcT+C72EU5qM7qaytg7ssg6/RDda63UmCWRsR1okLxnWdEPZSm82mBgusE38mMMGtpGBj91dwboClEMK4EiARzsiPQ1JrBOk0FgaS+RpbyXwgYTafzzWkxTp5qAA0xmxAHof+XXfr9bpxV33QqpxcdtjYf4Nv1/8weAgwQZvcuoiz9FOAITSkwRohIvoG/zJCYBtj4+sAAAAASUVORK5CYII=",
    };

    this.imageObjects = {};

    // 이미지 로드 함수
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    // Cursor 모든 이미지 로드
    Promise.all(Object.values(cursorimagePaths).map(loadImage)).then((images) => {
        // 이미지 로드 완료 후 객체에 할당
        Object.keys(cursorimagePaths).forEach((key, index) => {
            this.imageObjects[key] = images[index];
        });

    })
    
    init();
    function init() {
        //setScreen();

        VIZCore.namespace("VIZCore.UIBase");
        VIZCore.UIBase = UIBase;
        VIZCore.namespace("VIZCore.UINormal");
        VIZCore.UINormal = UINormal;
        VIZCore.namespace("VIZCore.UIMarkup");
        VIZCore.UIMarkup = UIMarkup;
        VIZCore.namespace("VIZCore.UIMarkup_Base");
        VIZCore.UIMarkup_Base = UIMarkupBase;
        VIZCore.namespace("VIZCore.UIWalkthrough");
        VIZCore.UIWalkthrough = UIWalkthrough;
        VIZCore.namespace("VIZCore.UIFly");
        VIZCore.UIFly = UIFly;
        VIZCore.namespace("VIZCore.UIObjectTransform");
        VIZCore.UIObjectTransform = UIObjectTransform;
        VIZCore.namespace("VIZCore.UIScreenBox");
        VIZCore.UIScreenBox = UIScreenBox;

        //if (view.DEBUG)
        {
            _modeState = VIZCore.Enum.CONTROL_STATE.NORMAL;

            //VIZCore.UINormal.prototype = Object.create(VIZCore.UIBase.prototype);
            VIZCore.UINormal.prototype = new VIZCore.UIBase(undefined, VIZCore);
            VIZCore.UINormal.prototype.constructor = VIZCore.UINormal;
            _UIModeList[VIZCore.Enum.CONTROL_STATE.NORMAL] = new VIZCore.UINormal(view, VIZCore);

            //VIZCore.UIMarkup.prototype = Object.create(VIZCore.UIBase.prototype);
            VIZCore.UIMarkup.prototype = new VIZCore.UIBase(undefined, VIZCore);
            VIZCore.UIMarkup.prototype.constructor = VIZCore.UIMarkup;
            _UIModeList[VIZCore.Enum.CONTROL_STATE.MARKUP] = new VIZCore.UIMarkup(view, VIZCore);

            VIZCore.UIWalkthrough.prototype = new VIZCore.UIBase(undefined, VIZCore);
            VIZCore.UIWalkthrough.prototype.constructor = VIZCore.UIWalkthrough;
            _UIModeList[VIZCore.Enum.CONTROL_STATE.WALKTHROUGH] = new VIZCore.UIWalkthrough(view, VIZCore);

            VIZCore.UIFly.prototype = new VIZCore.UIBase(undefined, VIZCore);
            VIZCore.UIFly.prototype.constructor = VIZCore.UIFly;
            _UIModeList[VIZCore.Enum.CONTROL_STATE.FLY] = new VIZCore.UIFly(view, VIZCore);

            VIZCore.UIObjectTransform.prototype = new VIZCore.UIBase(undefined, VIZCore);
            VIZCore.UIObjectTransform.prototype.constructor = VIZCore.UIObjectTransform;
            _UIModeList[VIZCore.Enum.CONTROL_STATE.OBJECTTRANSFORM] = new VIZCore.UIObjectTransform(view, VIZCore);

            VIZCore.UIScreenBox.prototype = new VIZCore.UIBase(undefined, VIZCore);
            VIZCore.UIScreenBox.prototype.constructor = VIZCore.UIScreenBox;
            _UIModeList[VIZCore.Enum.CONTROL_STATE.SCREENBOX] = new VIZCore.UIScreenBox(view, VIZCore);
        }


        scope.enabled = true;
        //eventUnlock();
    }

    /**
    * 컨트롤 잠금
    */
    this.Lock = function () {
        view.MultiView[view.CameraIndex].Lock();
    };

    /**
    * 컨트롤 잠금해제
    */
    this.Unlock = function () {
        view.MultiView[view.CameraIndex].Unlock();
    };


    function eventCheck(event) {

        for (let mv = 0; mv < view.MultiView.length; mv++) {
            if (event.target === view.MultiView[mv].domElement)
                return true;
        }


        return false;


        if (event.target !== view.Canvas_Review && event.target !== view.Canvas_Dual) {
            //console.log("Control : mismach!!");
            return false;
        }
        else
            return true;
    }

    function calcPos(event) {
        // let offset = $("#" + view.Container.id).offset();
        // if(offset === undefined) return;

        // // Then refer to 
        // let x = event.pageX - offset.left;
        // let y = event.pageY - offset.top;
        // if (event.target == view.Canvas_Dual) {
        //     // DualView Left Offset 처리
        //     let offsetDual = $("#" + view.Canvas_Dual.id).offset();
        //     x = x - offsetDual.left;
        // }

        // console.log("viewIndex : " + view.CameraIndex);

        // console.log("viewIndex : " + view.CameraIndex);
        // console.log("pick X :" + x + " , Y : " + y);
        // console.log("page X :" + event.pageX + " , Y : " + event.pageY);
        // console.log("offset X :" + offset.left + " , Y : " + offset.top);

        let x = event.layerX;
        let y = event.layerY;

        return { x: x, y: y };
    }

    /**
     * Touch Offset 
     * @param {*} touch 
     * @returns 
     */
    this.GetCalcTouchPos = function (touch) {

        let rect = touch.target.getBoundingClientRect();
        let x = touch.pageX - rect.left;
        let y = touch.pageY - rect.top;

        return { x: x, y: y };
    };


    function mouseout(event) {
        if (scope.enabled === false) return;

        event.preventDefault();
        event.stopPropagation();

        if (!eventCheck(event))
            return;

        let pos = calcPos(event);
        let x = pos.x;
        let y = pos.y;

        _UIModeList[_modeState].mouseOut(x, y, event.button);
    }

    function mouseover() {
        _UIModeList[_modeState].mouseOver();
    }

    function contextmenu(event) {
        if (scope.enabled === false) return;

        // ES6 Event bubbling Check
        // CSS z-index Event bubbling 이 정상적으로 실행 되지 않고 전달됨
        if (!eventCheck(event))
            return;

        //기본 상태에서만 가능.
        if (_modeState !== VIZCore.Enum.CONTROL_STATE.NORMAL) return;

        let callContextEvent = false;
        //버튼 눌려져있는지 확인
        if(_UIModeList[_modeState].mouseLeftDown || _UIModeList[_modeState].mouseMiddleDown)
            return;
        
        if (view.Configuration.Control.Version === 0) {
            let isClick = _UIModeList[_modeState].GetMouseClick(_UIModeList[_modeState].mouse.x, _UIModeList[_modeState].mouse.y, 2);
            if (isClick) {
                callContextEvent = true;
            }
        }
        else {
            let isClick = _UIModeList[_modeState].GetMouseClick(_UIModeList[_modeState].mouse.x, _UIModeList[_modeState].mouse.y, 2);
            if(isClick)
            {
                callContextEvent = true;
            }
        }

        if (callContextEvent)
            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Mouse.ContextMenu, event);
        event.preventDefault();
    }

    function mousedown(event) {
        if (scope.enabled === false) return;

        // ES6 Event bubbling Check
        // CSS z-index Event bubbling 이 정상적으로 실행 되지 않고 전달됨
        if (!eventCheck(event))
            return;

        scope.CurrentEvent = event;
        view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Mouse.Down, event);

        //console.log("Control : mousedown!!");

        scope.ControlCam=view.CameraIndex;

        event.preventDefault();
        event.stopPropagation();

        //let offset = $("#" + view.Container.id).offset();
        //// Then refer to 
        //let x = event.pageX - offset.left;
        //let y = event.pageY - offset.top;
        let pos = calcPos(event);
        let x = pos.x;
        let y = pos.y;
        //if (view.DEBUG)
        {

            _UIModeList[_modeState].KeyPress.ctrlKey = event.ctrlKey;
            _UIModeList[_modeState].KeyPress.altKey = event.altKey;
            _UIModeList[_modeState].KeyPress.shiftKey = event.shiftKey;


            let eventListener = _UIModeList[_modeState].mouseDown(x, y, event.button);

            if (eventListener) {
                //scope.domElement.addEventListener('mousemove', mousemove, false);
                //scope.domElement.addEventListener('mouseup', mouseup, false);
            }
            return;
        }
    }

    function mousemove(event) {
        if (scope.enabled === false) return;

        if (!eventCheck(event))
            return;

        event.preventDefault();

        //Panel 유지를 위해 다운 상태가 아닌경우 mouse event 유지
        if (_UIModeList[_modeState].mouseLeftDown)
            event.stopPropagation();

        scope.ControlCam=view.CameraIndex ;

        scope.CurrentEvent = event;
        view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Mouse.Move, event);

        let pos = calcPos(event);
        let x = pos.x;
        let y = pos.y;

        //if (view.DEBUG)
        {
            _UIModeList[_modeState].KeyPress.ctrlKey = event.ctrlKey;
            _UIModeList[_modeState].KeyPress.altKey = event.altKey;
            _UIModeList[_modeState].KeyPress.shiftKey = event.shiftKey;
            _UIModeList[_modeState].mouseMove(x, y);


            return;
        }
    };

    function mouseup(event) {

        if (scope.enabled === false) return;

        if (!eventCheck(event))
            return;

        event.preventDefault();

        //Panel 유지를 위해 다운 상태가 아닌경우 mouse event 유지
        if (_UIModeList[_modeState].mouseLeftDown)
            event.stopPropagation();

        scope.CurrentEvent = event;
        view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Mouse.Up, event);

        //let offset = $("#" + view.Container.id).offset();
        //// Then refer to 
        //let x = event.pageX - offset.left;
        //let y = event.pageY - offset.top;
        scope.ControlCam=view.CameraIndex;

        let pos = calcPos(event);
        let x = pos.x;
        let y = pos.y;

        //if (view.DEBUG)
        {

            _UIModeList[_modeState].KeyPress.ctrlKey = event.ctrlKey;
            _UIModeList[_modeState].KeyPress.altKey = event.altKey;
            _UIModeList[_modeState].KeyPress.shiftKey = event.shiftKey;

            let eventListener = _UIModeList[_modeState].mouseUp(x, y, event.button);

            if (eventListener) {
                //scope.domElement.removeEventListener('mousemove', mousemove);
                //scope.domElement.removeEventListener('mouseup', mouseup);
            }

            if (scope.MouseEvent) {
                scope.MouseEvent = false;
                view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.SelectedPosition, { event: event, info: scope.MouseEventData });
                scope.MouseEventData = undefined;
            }
            return;
        }
    }

    function mousewheel(event) {

        if (scope.enabled === false) return;

        event.preventDefault();
        event.stopPropagation();

        if (!eventCheck(event))
            return;

        view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Mouse.Wheel, event);

        //delta = 0;
        if (event.wheelDelta) { // WebKit / Opera / Explorer 9
            delta = event.wheelDelta / 40;
        } else if (event.detail) { // Firefox
            delta = -event.detail / 3;
        }

        scope.ControlCam=view.CameraIndex;

        let pos = calcPos(event);
        let x = pos.x;
        let y = pos.y;

        //if (view.DEBUG)
        {
            _UIModeList[_modeState].mouseWheel(x, y, delta);
            return;
        }
    }

    function dbclick(event) {
        //event.preventDefault();
        event.stopPropagation();

        let pos = calcPos(event);
        let x = pos.x;
        let y = pos.y;

        //if (event.target !== view.Canvas_Review && event.target !== view.Canvas_Dual) {
        //    //console.log("Control : mismach!!");
        //    return;
        //}      

        scope.CurrentEvent = event;
        view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Mouse.DbClick, event);

        _UIModeList[_modeState].mouseDoubleClick(x, y, event.button);
    }

    function touchstart(event) {
        if (scope.enabled === false) return;

        if (!eventCheck(event))
            return;

        event.preventDefault();
        event.stopPropagation();

        //if (view.DEBUG)
        {
            _UIModeList[_modeState].touchStart(event.touches);
            scope.CurrentEvent = event;
            //scope.dispatchEvent(startEvent);
            return;
        }

    }

    function touchmove(event) {
        if (scope.enabled === false) return;

        if (!eventCheck(event))
            return;

        event.preventDefault();
        event.stopPropagation();

        //event.preventDefault();
        //if (view.DEBUG)
        {
            _UIModeList[_modeState].touchMove(event.touches);
            scope.CurrentEvent = event;
            return;
        }
    }

    function touchend(event) {
        if (scope.enabled === false) return;

        if (!eventCheck(event))
            return;

        //event.preventDefault();
        event.stopPropagation();

        // console.log("touchend :: ", event);
        //if (view.DEBUG)
        {
            _UIModeList[_modeState].touchEnd(event.touches);
            //_UIModeList[_modeState].touchEnd(event.changedTouches);
            scope.CurrentEvent = event;
            if(scope.ToolbarEvent){
                scope.ToolbarEvent(event);
            }
            //scope.dispatchEvent(endEvent);
            return;
        }
    }

    function keydown(event) {
        if (scope.enabled === false) return;

        //event.preventDefault();
        //event.stopPropagation();

        {
            let eventListener = _UIModeList[_modeState].keyDown(event.keyCode);

        //    if (eventListener) {
        //    }

        //    window.removeEventListener('keydown', keydown, false);

            return;
        }
    }

    function keypress(event) {
        if (scope.enabled === false) return;

        //if (!eventCheck(event))
        //    return;

        //event.preventDefault();
        //event.stopPropagation();

        {
            let eventListener = _UIModeList[_modeState].keyPress(event.keyCode);

            return;
        }
    }

    function keyup(event) {
        if (scope.enabled === false) return;

        // if (!eventCheck(event))
        //     return;

        // event.preventDefault();
        // event.stopPropagation();

       

        view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Keyboard.Up, event);
        {
            let eventListener = _UIModeList[_modeState].keyUp(event.keyCode);

            return;
        }
    }

    let getMouseOnCircle = (function () {

        let vector = new VIZCore.Vector2();

        return function (pageX, pageY) {

            vector.set(
                ((pageX - scope.screen.width * 0.5 - scope.screen.left) / (scope.screen.width * 0.5)),
                ((scope.screen.height + 2 * (scope.screen.top - pageY)) / scope.screen.width) // screen.width intentional
            );

            return vector;
        };

    }());


    this.BackupMode = function () {
        if (_modeState === VIZCore.Enum.CONTROL_STATE.MARKUP) return; //측정 모드는 저장하지 않음

        _lastModeState = _modeState;
    }

    this.RestoreMode = function () {
        scope.SetMode(_lastModeState, undefined);
    }

    this.IsControlMode = function (mode, subMode) {
        if (mode === undefined) return false;

        if (_modeState !== mode) return false;

        if (subMode !== undefined) {
            let sub = _UIModeList[_modeState].IsUIMode(subMode);
            return sub;
        }

        return true;
    };

    function setModeState(mode) {

        //scope.domElement.removeEventListener('mousemove', mousemove);
        //scope.domElement.removeEventListener('mouseup', mouseup);

        if (mode === undefined) return;
        if (_modeState === mode) return;

        scope.BackupMode();

        _UIModeList[_modeState].UIEnd();
        _modeState = mode;
        _UIModeList[_modeState].UIBegin();
    }

    function setUIMode(subMode) {
        _UIModeList[_modeState].SetUIMode(subMode);
    }

    /**
    * 컨트롤 모드 반환
    * @returns {Number} mode 반환 VIZCore.Enum.CONTROL_STATE.NORMAL, VIZCore.Enum.CONTROL_STATE.MARKUP
    */
    this.GetMode = function () {
        return _modeState;
    };


    this.GetUIMode = function () {
        return _UIModeList[_modeState];
    };

    /**
    * 컨트롤 모드설정
    * @param {Number} mode: VIZCore.Enum.CONTROL_STATE.NORMAL, VIZCore.Enum.CONTROL_STATE.MARKUP
    * @param {Number} subMode:  
    *       VIZCore.Enum.CONTROL_STATE.NORMAL일 경우에는 undefined, 
    *       VIZCore.Enum.CONTROL_STATE.MARKUP일 경우에는 REVIEW_TYPES.RK_MEASURE_POS
    */
    this.SetMode = function (mode, subMode) {

        setModeState(mode);
        setUIMode(subMode);

        if (mode !== VIZCore.Enum.CONTROL_STATE.MARKUP || subMode !== VIZCore.Enum.REVIEW_TYPES.RK_SKETCH) {
            // 스케치 삭제
            view.Data.Review.DeleteReviewByKind(VIZCore.Enum.REVIEW_TYPES.RK_SKETCH);

            // for (let i = view.Data.Reviews.length - 1; i >= 0; i--) {
            //     let review = view.Data.Reviews[i];
            //     if (review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_SKETCH)
            //         view.Data.Reviews.splice(i, 1);
            // }
        }

        //view.Camera.ResizeGLWindow();

        //setMode > 측정시 reset 불필요
        if (mode !== VIZCore.Enum.CONTROL_STATE.MARKUP) {
            view.MeshBlock.Reset();
            //view.Renderer.MainFBClear();
        }

        if (view.Interface.WalkthroughPanel !== undefined) {
            if (mode === VIZCore.Enum.CONTROL_STATE.WALKTHROUGH) {
                if (view.Configuration.Walkthrough.Panel.Visible) {
                    view.Interface.WalkthroughPanel.Show(true);
                }
            }
            else {
                view.Interface.WalkthroughPanel.Show(false);
            }
        }

        view.Renderer.Render();
    };

    /**
     * 현재 컨트롤 모드 에서 세부모드를 설정
     * @param {Number} subType 
     */
    this.SetSubType = function (subType) {
        _UIModeList[_modeState].SetSubType(subType);
    };

    /**
   * 모드별 가시화 그리기
   */
    this.Render = function () {
        _UIModeList[_modeState].Render();
    };

    /**
    * 모드별 review 2D 그리기
    */
    this.Render2D = function (context) {
        _UIModeList[_modeState].Render2D(context);
    };

    this.MouseDown = function (event) {
        if (view.Configuration.Control.Version === 0) {
            mousedown(event);
        }
        else if (view.Configuration.Control.Version === 2) {
            mousedown(event);
        }
        else {

            mousedown(event);
            // if (event.button !== 2) {
            //     mousedown(event);
            // }
            // else if (event.button === 2 && view.Configuration.ContextMenu.Use === false) {
            //     mousedown(event);
            // }
            // else if (event.button === 2 && view.Configuration.ContextMenu.Use === true)
            // {
            //     _UIModeList[_modeState].actionEnabled = false;
            //     mousedown(event);
            //     _UIModeList[_modeState].actionEnabled = true;
            // }
        }
    };

    this.MouseMove = function (event) {
        mousemove(event);
    };

    this.MouseUp = function (event) {
        if (view.Configuration.Control.Version === 0) {
            mouseup(event);
        }
        else if (view.Configuration.Control.Version === 2) {
            mouseup(event);
        }
        else {
            mouseup(event);
            // if (event.button !== 2) {
            //     mouseup(event);
            // }
            // else if (event.button === 2 && view.Configuration.ContextMenu.Use === false) {
            //     mouseup(event);
            // }
            // else if (event.button === 2 && view.Configuration.ContextMenu.Use === true)
            // {
            //     _UIModeList[_modeState].actionEnabled = false;
            //     mouseup(event);
            //     _UIModeList[_modeState].actionEnabled = true;
            // }
        }
    };

    this.MouseWheel = function (event) {
        mousewheel(event);
    };

    this.MouseOver = function (event) {
        mouseover(event);
    };

    this.MouseOut = function (event) {
        mouseout(event);
    };

    this.MouseEnter = function (event) {

    };

    this.DoubleClick = function (event) {
        dbclick(event);
    };

    this.TouchStart = function (event) {
        touchstart(event);
    };

    this.TouchEnd = function (event) {
        touchend(event);
    };

    this.TouchMove = function (event) {
        touchmove(event);
    };

    this.Keydown = function (event) {
        keydown(event);
    };

    this.Keypress = function (event) {
        keypress(event);
    };

    this.Keyup = function (event) {
        keyup(event);
    };

    this.Contextmenu = function (event) {
        contextmenu(event);
    };

    /**
     * 마우스 클릭 상태 반환
     */
    this.IsMouseDown = function () {
        return _UIModeList[_modeState].mouseLeftDown;
    };

    /**
     * 마우스 클릭 상태 및 마우스 휠 동작 상태 확인
     */
    this.UnderControl = function () {
        let down = _UIModeList[_modeState].mouseLeftDown;
        let wheel = !_UIModeList[_modeState].PivotUpdate;

        if (down || wheel) return true;
        return false;
    }


};

export default Control;