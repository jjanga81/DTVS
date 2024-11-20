/**
 * VIZCore Control 인터페이스
 * @copyright © 2013 - 2022 SOFTHILLS Co., Ltd. All rights reserved.
 * @author SOFTHILLS <tech@softhills.net>
 * @param {Object} main Main Instance
 * @param {Object} VIZCore ValueObject Instance
 * @class
 */
 class Control {
    constructor(main, VIZCore) {
        let scope = this;

        this.Main = main;

        let controlMode = scope.Main.Configuration.Control.Version;

        //=======================================
        // Method
        //=======================================
        /**
         * 궤도(회전) 사용 설정
         * Z축 고정 회전
         * @param {boolean} enable 사용/미사용
         * @example
         * vizwide3d.View.Control.EnablePivotRotate(true);
         */
        this.EnablePivotRotate = function (enable) {
            if(enable) {
                scope.Main.Control._sub = VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_FIXEDZ;
                scope.Main.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Control_Mode.Changed, scope.Main.Control._sub);
                //z축으로 변경                
                for (let i = 0; i < 16; i++)
                  scope.Main.Camera.SetZAxis2Up();
                  
                //scope.Main.Camera.ViewTopPlan();
                scope.Main.ViewRefresh();
            }
            else {
                scope.Main.Control._sub = VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE;
                scope.Main.Mode.Normal();
            }
        };

        /**
         * Orbit (회전) 사용 설정
         * @param {boolean} enable 사용/미사용
         * @example
         * vizwide3d.View.Control.EnableClassicRotate(true);
         */
        this.EnableClassicRotate = function (enable) {
            if(enable) {
                scope.Main.Control._sub = VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ORBIT;
                scope.Main.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Control_Mode.Changed, scope.Main.Control._sub);
            }
            else {
                scope.Main.Control._sub = VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE;
                scope.Main.Mode.Normal();
            }
        };

        /**
         * 자유 궤도(회전) 사용 설정
         * @param {boolean} enable 사용/미사용
         * @example
         * vizwide3d.View.Control.EnableFreeRotate(true);
         */
        this.EnableFreeRotate = function (enable) {
            if(enable) {
                scope.Main.Control._sub = VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE;
                scope.Main.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Control_Mode.Changed, scope.Main.Control._sub);
            }
            else {
                scope.Main.Control._sub = VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE;
                scope.Main.Mode.Normal();
            }
        };

        /**
         * 제한 궤도(회전) 사용 설정
         * @param {boolean} enable 사용/미사용
         * @example
         * vizwide3d.View.Control.EnableLimitRotate(true);
         */
        this.EnableLimitRotate = function (enable) {
            if(enable) {
                scope.Main.Control._sub = VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_WFIXEDZ;
                scope.Main.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Control_Mode.Changed, scope.Main.Control._sub);
            }
            else {
                scope.Main.Control._sub = VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE;
                scope.Main.Mode.Normal();
            }
        };

         /**
         * 카메라(회전) 사용 설정
         * @param {boolean} enable 사용/미사용
         * @example
         * vizwide3d.View.Control.EnableCameraRotate(true);
         */
        this.EnableCameraRotate = function (enable) {
            if(enable) {
                scope.Main.Control._sub = VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_CAMERA;
                scope.Main.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Control_Mode.Changed, scope.Main.Control._sub);
            }
            else {
                scope.Main.Control._sub = VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE;
                scope.Main.Mode.Normal();
            }
        };

        /**
         * Pan 사용 설정
         * @param {boolean} enable 사용/미사용
         * @example
         * vizwide3d.View.Control.EnablePan(true);
         */
        this.EnablePan = function (enable) {
            if(enable) {
                scope.Main.Control._sub = VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.PAN;
                scope.Main.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Control_Mode.Changed, scope.Main.Control._sub);
            }
            else {
                scope.Main.Control._sub = VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE;
                scope.Main.Mode.Normal();
            }
        };

        /**
         * 확대 비율 고정 설정
         * @param {boolean} enable 사용/미사용
         * @example
         * vizwide3d.View.Control.FixedZoomRatio(true);
         */
        this.FixedZoomRatio = function(enable)
        {
            scope.Main.Configuration.Control.Zoom.UseFixed = enable;
        };

        /**
         * 확대 비율 고정 값 설정
         * @param {Number} value 0.0 ~ 1.0 : 낮을수록 느리게 반응
         * @example
         * vizwide3d.View.Control.FixedZoomValue(0.5);
         */
        this.FixedZoomValue = function(value)
        {
            scope.Main.Configuration.Control.Zoom.Ratio = value;
        };

        /**
         * 회전 감도 설정
         * @param {Number} value 1 ~ 100 : 낮을수록 느리게 반응
         * @example
         * vizwide3d.View.Control.RotateValue(0.5);
         */
        this.RotateValue = function(value)
        {
            scope.Main.Configuration.Control.RotateFactor = value;
        };

        
        /**
         * 초기 모드 설정
         * @example
         * vizwide3d.View.Control.InitialState();
         */
        this.InitialState = function() {
            // free
            if(controlMode === 0) {
                scope.EnableFreeRotate(true);
            } else if(controlMode === 1) {  // z축 고정
                scope.EnablePivotRotate(true);
            }
        }

        
        /**
         * Control 초기화
         * @example
         * vizwide3d.View.Control.Disable(true);
         */
        this.Disable = function() {
            scope.Main.Control._sub = VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.NONE;
            scope.Main.Mode.Normal();
        };

        //=======================================
        // Event
        //=======================================

        this.OnCameraModeChangedEvent = function(listener) {
            scope.Main.EventHandler.addEventListener(VIZCore.Enum.EVENT_TYPES.Control_Mode.Changed, listener);
        };
    }
}

export default Control;