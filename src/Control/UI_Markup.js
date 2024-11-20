/**
 * @author ssjo@softhills.net
 */

import UIMarkup_Measure_Pos from "./UI_Markup_Measure_Pos.js";
import UIMarkup_Measure_Angle from "./UI_Markup_Measure_Angle.js";
import UIMarkup_Measure_Distance from "./UI_Markup_Measure_Distance.js";
import UIMarkup_Measure_CircleRadius from "./UI_Markup_Measure_CircleRadius.js";
import UIMarkup_Measure_ObjectMinDistance from "./UI_Markup_Measure_ObjectMinDistance.js";
import UIMarkup_Measure_NormalDistance from "./UI_Markup_Measure_NormalDistance.js";
import UIMarkup_Measure_HorizontalityDistance from "./UI_Markup_Measure_HorizontalityDistance.js";
import UIMarkup_Measure_OrthoDistance from "./UI_Markup_Measure_OrthoDistance.js";
import UIMarkup_Measure_X_Axis_Distance from "./UI_Markup_Measure_X_Axis_Distance.js";
import UIMarkup_Measure_XY_Axis_Distance from "./UI_Markup_Measure_XY_Axis_Distance.js";
import UIMarkup_Measure_Y_Axis_Distance from "./UI_Markup_Measure_Y_Axis_Distance.js";
import UIMarkup_Measure_YZ_Axis_Distance from "./UI_Markup_Measure_YZ_Axis_Distance.js";
import UIMarkup_Measure_Z_Axis_Distance from "./UI_Markup_Measure_Z_Axis_Distance.js";
import UIMarkup_Measure_ZX_Axis_Distance from "./UI_Markup_Measure_ZX_Axis_Distance.js";
import UIMarkup_Measure_Custom_Axis_Distance from "./UI_Markup_Measure_Custom_Axis_Distance.js";
import UIMarkup_Measure_Smart_Axis_Distance from "./UI_Markup_Measure_Smart_Axis_Distance.js";
import UIMarkup_Measure_LinkedArea from "./UI_Markup_Measure_LinkedArea.js";
import UIMarkup_Measure_SurfaceDistance from "./UI_Markup_Measure_SurfaceDistance.js";
import UIMarkup_Measure_LinkedDistance from "./UI_Markup_Measure_LinkedDistance.js";
import UIMarkup_Measure_LinkedAxisDistance from "./UI_Markup_Measure_LinkedAxisDistance.js";
import UIMarkup_Measure_OnePointFixedDistance from "./UI_Markup_Measure_OnePointFixedDistance.js";
import UIMarkup_Measure_CylinderPlaneDistance from "./UI_Markup_Measure_CylinderPlaneDistance.js";
import UIMarkup_Measure_CylinderCylinderCrossPoint from "./UI_Markup_Measure_CylinderCylinderCrossPoint.js";
import UIMarkup_Measure_NormalPlaneCrossPoint from "./UI_Markup_Measure_NormalPlaneCrossPoint.js";
import UIMarkup_Measure_BoundBox from "./UI_Markup_Measure_BoundBox.js";
import UIMarkup_Measure_PickItem from "./UI_Markup_Measure_PickItem.js";

import UIMarkup_Util_Transform from "./UI_Markup_Util_Transform.js";

import UIMarkup_SurfaceNote from "./UI_Markup_SurfaceNote.js";
import UIMarkup_3DNote from "./UI_Markup_3DNote.js";
import UIMarkup_2DNote from "./UI_Markup_2DNote.js";

import UIMarkup_Sketch from "./UI_Markup_Sketch.js";

let UIMarkup = function (view, VIZCore) {
    let scope = this;

    //base 호출사용
    this.base = VIZCore.UIBase;
    this.base(view, VIZCore);   

    let markupList = [];
    let subMode;

    let modeStep;
    this.currentReviewItem = undefined;
        
    let colPick = new VIZCore.Color(0, 255, 0, 255);
    let lastPreselectData = undefined;
      
    let controlPickerDown = false; //control Picker - touch down확인


    init();
    function init() {
        subMode = 0;


        //const startTime = new Date().getTime(); // 시작시간
        initMarkup();
        //const endTime = new Date().getTime(); // 종료

        //
    }

    function initMarkup() {
        //Measure

        UIMarkup_Measure_Pos.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_Pos.prototype.constructor = UIMarkup_Measure_Pos;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_POS] = new UIMarkup_Measure_Pos(scope, view, VIZCore);

        UIMarkup_Measure_Distance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_Distance.prototype.constructor = UIMarkup_Measure_Distance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE] = new UIMarkup_Measure_Distance(scope, view, VIZCore);

        UIMarkup_Measure_Angle.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_Angle.prototype.constructor = UIMarkup_Measure_Angle;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ANGLE] = new UIMarkup_Measure_Angle(scope, view, VIZCore);

        UIMarkup_Measure_ObjectMinDistance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_ObjectMinDistance.prototype.constructor = UIMarkup_Measure_ObjectMinDistance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_OBJECTMINDISTANCE] = new UIMarkup_Measure_ObjectMinDistance(scope, view, VIZCore);

        UIMarkup_Measure_NormalDistance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_NormalDistance.prototype.constructor = UIMarkup_Measure_NormalDistance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_NORMALDISTANCE] = new UIMarkup_Measure_NormalDistance(scope, view, VIZCore);

        UIMarkup_Measure_HorizontalityDistance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_HorizontalityDistance.prototype.constructor = UIMarkup_Measure_HorizontalityDistance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_HORIZONTALITYDISTANCE] = new UIMarkup_Measure_HorizontalityDistance(scope, view, VIZCore);

        UIMarkup_Measure_OrthoDistance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_OrthoDistance.prototype.constructor = UIMarkup_Measure_OrthoDistance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ORTHODISTANCE] = new UIMarkup_Measure_OrthoDistance(scope, view, VIZCore);        

        UIMarkup_Measure_X_Axis_Distance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_X_Axis_Distance.prototype.constructor = UIMarkup_Measure_X_Axis_Distance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE] = new UIMarkup_Measure_X_Axis_Distance(scope, view, VIZCore);

        UIMarkup_Measure_Y_Axis_Distance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_Y_Axis_Distance.prototype.constructor = UIMarkup_Measure_Y_Axis_Distance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE] = new UIMarkup_Measure_Y_Axis_Distance(scope, view, VIZCore);

        UIMarkup_Measure_Z_Axis_Distance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_Z_Axis_Distance.prototype.constructor = UIMarkup_Measure_Z_Axis_Distance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE] = new UIMarkup_Measure_Z_Axis_Distance(scope, view, VIZCore);

        UIMarkup_Measure_XY_Axis_Distance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_XY_Axis_Distance.prototype.constructor = UIMarkup_Measure_XY_Axis_Distance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_XY_AXIS_DISTANCE] = new UIMarkup_Measure_XY_Axis_Distance(scope, view, VIZCore);

        UIMarkup_Measure_YZ_Axis_Distance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_YZ_Axis_Distance.prototype.constructor = UIMarkup_Measure_YZ_Axis_Distance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_YZ_AXIS_DISTANCE] = new UIMarkup_Measure_YZ_Axis_Distance(scope, view, VIZCore);

        UIMarkup_Measure_ZX_Axis_Distance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_ZX_Axis_Distance.prototype.constructor = UIMarkup_Measure_ZX_Axis_Distance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ZX_AXIS_DISTANCE] = new UIMarkup_Measure_ZX_Axis_Distance(scope, view, VIZCore);

        UIMarkup_Measure_Custom_Axis_Distance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_Custom_Axis_Distance.prototype.constructor = UIMarkup_Measure_Custom_Axis_Distance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CUSTOM_AXIS_DISTANCE] = new UIMarkup_Measure_Custom_Axis_Distance(scope, view, VIZCore);

        UIMarkup_Measure_Smart_Axis_Distance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_Smart_Axis_Distance.prototype.constructor = UIMarkup_Measure_Smart_Axis_Distance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_SMART_AXIS_DISTANCE] = new UIMarkup_Measure_Smart_Axis_Distance(scope, view, VIZCore);

        UIMarkup_Measure_LinkedArea.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_LinkedArea.prototype.constructor = UIMarkup_Measure_LinkedArea;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKEDAREA] = new UIMarkup_Measure_LinkedArea(scope, view, VIZCore);

        UIMarkup_Measure_SurfaceDistance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_SurfaceDistance.prototype.constructor = UIMarkup_Measure_SurfaceDistance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_SURFACEDISTANCE] = new UIMarkup_Measure_SurfaceDistance(scope, view, VIZCore);

        UIMarkup_Measure_LinkedDistance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_LinkedDistance.prototype.constructor = UIMarkup_Measure_LinkedDistance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_DISTANCE] = new UIMarkup_Measure_LinkedDistance(scope, view, VIZCore);
                
        UIMarkup_Measure_LinkedAxisDistance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_LinkedAxisDistance.prototype.constructor = UIMarkup_Measure_LinkedAxisDistance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_AXIS_DISTANCE] = new UIMarkup_Measure_LinkedAxisDistance(scope, view, VIZCore);        

        UIMarkup_Measure_OnePointFixedDistance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_OnePointFixedDistance.prototype.constructor = UIMarkup_Measure_OnePointFixedDistance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ONE_POINT_FIXED_DISTANCE] = new UIMarkup_Measure_OnePointFixedDistance(scope, view, VIZCore);

        UIMarkup_Measure_CylinderPlaneDistance.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_CylinderPlaneDistance.prototype.constructor = UIMarkup_Measure_CylinderPlaneDistance;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CYLINDER_PLANE_DISTANCE] = new UIMarkup_Measure_CylinderPlaneDistance(scope, view, VIZCore);

        UIMarkup_Measure_CylinderCylinderCrossPoint.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_CylinderCylinderCrossPoint.prototype.constructor = UIMarkup_Measure_CylinderCylinderCrossPoint;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CYLINDER_CYLINDER_CROSS_POINT] = new UIMarkup_Measure_CylinderCylinderCrossPoint(scope, view, VIZCore);

        UIMarkup_Measure_NormalPlaneCrossPoint.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_NormalPlaneCrossPoint.prototype.constructor = UIMarkup_Measure_NormalPlaneCrossPoint;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_NORMAL_PLANE_CROSS_POINT] = new UIMarkup_Measure_NormalPlaneCrossPoint(scope, view, VIZCore);

        UIMarkup_Measure_BoundBox.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_BoundBox.prototype.constructor = UIMarkup_Measure_BoundBox;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_BOUNDBOX] = new UIMarkup_Measure_BoundBox(scope, view, VIZCore);

        UIMarkup_Measure_PickItem.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);        
        UIMarkup_Measure_PickItem.prototype.constructor = UIMarkup_Measure_PickItem;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_PICKITEM] = new UIMarkup_Measure_PickItem(scope, view, VIZCore);

        UIMarkup_Measure_CircleRadius.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Measure_CircleRadius.prototype.constructor = UIMarkup_Measure_CircleRadius;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CIRCLE_RADIUS] = new UIMarkup_Measure_CircleRadius(scope, view, VIZCore);
        //Note

        UIMarkup_SurfaceNote.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_SurfaceNote.prototype.constructor = UIMarkup_SurfaceNote;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE] = new UIMarkup_SurfaceNote(scope, view, VIZCore);

        UIMarkup_2DNote.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_2DNote.prototype.constructor = UIMarkup_2DNote;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE] = new UIMarkup_2DNote(scope, view, VIZCore);

        UIMarkup_3DNote.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_3DNote.prototype.constructor = UIMarkup_3DNote;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE] = new UIMarkup_3DNote(scope, view, VIZCore);

        UIMarkup_Sketch.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);
        UIMarkup_Sketch.prototype.constructor = UIMarkup_Sketch;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_SKETCH] = new UIMarkup_Sketch(scope, view, VIZCore);


        //Util.
        UIMarkup_Util_Transform.prototype = new VIZCore.UIMarkup_Base(undefined, undefined);        
        UIMarkup_Util_Transform.prototype.constructor = UIMarkup_Util_Transform;
        markupList[VIZCore.Enum.REVIEW_TYPES.RK_UTIL_TRANSFORM] = new UIMarkup_Util_Transform(scope, view, VIZCore);


        //markupList[REVIEW_TYPES.RK_MEASURE_DISTANCE];
        //markupList[REVIEW_TYPES.RK_MEASURE_ANGLE];
        //markupList[REVIEW_TYPES.RK_SURFACE_NOTE];
        //markupList[REVIEW_TYPES.RK_2D_NOTE];
        //markupList[REVIEW_TYPES.RK_3D_NOTE];
    }

    this.UIBegin = function () {
        scope.base.prototype.UIBegin.call(scope);
        
        view.Pick.ReleaseMeasurePreselectInfo();
        lastPreselectData = undefined;
    };

    this.UIEnd = function () {
        if (scope.currentReviewItem !== undefined) {
            view.Data.DeleteReview(scope.currentReviewItem.id);
        }

        if (markupList[subMode] !== undefined)
            markupList[subMode].Release();
   
        view.Pick.ReleaseMeasurePreselectInfo();
        lastPreselectData = undefined;

        subMode = 0;
        scope.base.prototype.UIEnd.call(scope);
    };

    this.SetUIMode = function (mode) {

        ///Drawing시 초기화되는 이슈
         if(subMode > 0 && mode !== VIZCore.Enum.REVIEW_TYPES.RK_SKETCH)
         {
            scope.UIEnd();
            view.Renderer.Render();
         }
     
        subMode = mode;
        modeStep = 0;
        scope.currentReviewItem = view.Data.ReviewItem();

        markupList[subMode].Start();
    };

    this.IsUIMode = function (mode) {
        if(mode === undefined) return false;
        if(subMode !== mode) return false;
        return true;
    };
    
    this.GetStep = function () {
        return modeStep;
    };
    
    this.SetStep = function (step) {
        modeStep = step;
    };


    this.NextStep = function () {
        modeStep++;
    };

    this.PreviousStep = function () {
        modeStep--;

        if (modeStep < 0) {
            modeStep = 0;

            //종료
            //view.Control.SetMode(VIZCore.Enum.CONTROL_STATE.NORMAL);
            view.Control.RestoreMode(); //뒤로

            view.Renderer.Render();
            return;
        }

        markupList[subMode].PreviousStep();
        if(markupList[subMode].GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT)) {
            view.Pick.RefreshPreselectEdgeProcess();
            lastPreselectData = undefined;
        }

        view.Renderer.Render();
    };

    this.mouseDown = function (x, y, button) {
        //scope.base.prototype.mouseDown.call(scope, x, y, button);
        view.Pick.EnableControlPicker = false;

        return markupList[subMode].mouseDown(x, y, button);
    };

    this.mouseMove = function (x, y) {
        //scope.base.prototype.mouseMove.call(scope, x, y);

        if(markupList[subMode].GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT)) {
            let current = view.Pick.GetPreselectDataPick(x, y);
            let bUpdate = false;

            //preselect 선택
            if(current === lastPreselectData)
                bUpdate = false; //undefined 비교
            else if((current === undefined && lastPreselectData !== undefined ) ||
                current !== undefined && lastPreselectData === undefined) {
                bUpdate = true;
            }
            //개체가 다른 경우
            else if(current.index !== lastPreselectData.index || current.pickKind !== lastPreselectData.pickKind)
                bUpdate = true;

            lastPreselectData = current;
            if(bUpdate)
                view.Renderer.Render();
        }

        ////////////////////////////////////////////////////////////////////////////////
        // 진행 처리
        ////////////////////////////////////////////////////////////////////////////////
        markupList[subMode].mouseMove(x, y);

    };

    this.mouseUp = function (x, y, button) {
        //scope.enable = false;
        //scope.base.prototype.mouseUp.call(scope, x, y, button);
        //markupList[subMode].mouseUp(x, y, button);
        //scope.enable = true;

        let eventListener = markupList[subMode].mouseUp(x, y, button);

        //취소
        if (button === VIZCore.Enum.MOUSE_STATE.PAN) {
            if (scope.base.prototype.GetMouseClick.call(scope, x, y, button) === true) {
                let tmp = new VIZCore.Vector2().subVectors(scope.mouseDownPosition, scope.mouse);
                if (tmp.length() < 5) {
                    scope.PreviousStep();
                    eventListener = true;
                }
            }
        }
        return eventListener;
    };
    
    this.mouseDoubleClick = function (x, y, button) {
        //scope.base.prototype.ZoomSelection.call(scope, x, y, button);
        markupList[subMode].mouseDoubleClick(x, y, button);
    };

    this.mouseWheel = function (x, y, delta) {
        markupList[subMode].mouseWheel(x, y, delta);
    };

   
    this.touchStart = function (touches) {

        if(subMode > 0){
            if (subMode !== VIZCore.Enum.REVIEW_TYPES.RK_SKETCH && 
                subMode !== VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE && 
                subMode !== VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE && 
                subMode !== VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE )
            view.Pick.EnableControlPicker = true;
        }
        
        let pos = this.view.Control.GetCalcTouchPos(touches[0]);
        
        const pickDownControl = view.Pick.IsMouseDownControlPicker(pos.x, pos.y);
        if (pickDownControl.kind === 1)
            controlPickerDown = true;
        else
            controlPickerDown = false;

        markupList[subMode].touchStart(touches);
    };



    this.touchMove = function (touches) {
        if (view.Pick.EnableControlPicker &&
            markupList[subMode].uiBase.mouseLeftDown) {
            if (touches.length === 1) {

                let pos = this.view.Control.GetCalcTouchPos(touches[0]);
                if (controlPickerDown === true) //pickDownControl.pick)
                {
                    this.view.Pick.EnableControlOk = false;
                    this.view.Pick.EnableControlCancel = false;

                    this.view.Pick.SetControlPickerPositon(new VIZCore.Vector3(pos.x, pos.y, 0));
                   
                    // Control Picker 가리키는 위치
                    let pickerPos = view.Pick.GetControlPickerPickPos(pos.x, pos.y);
                    let validResult = scope.IsValidPosition(pickerPos.x, pickerPos.y);
                    if (validResult.valid === true) {
                        if (markupList[subMode].GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT)) {
                            let current = view.Pick.GetPreselectDataPick(pickerPos.x, pickerPos.y);
                            lastPreselectData = current;
                        }
                    }
                    
                    this.view.Renderer.Render();

                    markupList[subMode].uiBase.actionEnabled = false;
                    markupList[subMode].touchMove(touches);
                    markupList[subMode].uiBase.actionEnabled = true;
                    return;
                }

            }
        }

        markupList[subMode].touchMove(touches);
    };

    this.touchEnd = function (touches) {
        if (view.Pick.EnableControlPicker) {
            if (touches.length === 0 ) {

                // Cancel Control 표출
                view.Pick.EnableControlCancel = true;
                
               
                touches =  markupList[subMode].uiBase._touchLast;

                // 터치 position
                let pos = view.Control.GetCalcTouchPos(touches[0]);
                let result = view.Pick.IsMouseDownControlPicker(pos.x, pos.y);
                
                // Control Picker 가리키는 위치
                let pickerPos = view.Pick.GetControlPickerPickPos(pos.x, pos.y);
                let validResult = scope.IsValidPosition(pickerPos.x, pickerPos.y);
                if (validResult.valid === true) {
                    view.Pick.EnableControlOk = true;

                    if (markupList[subMode].GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT)) {
                        let current = view.Pick.GetPreselectDataPick(pickerPos.x, pickerPos.y);
                        let bUpdate = false;

                        //preselect 선택
                        if (current === lastPreselectData)
                            bUpdate = false; //undefined 비교
                        else if ((current === undefined && lastPreselectData !== undefined) ||
                            current !== undefined && lastPreselectData === undefined) {
                            bUpdate = true;
                        }
                        //개체가 다른 경우
                        else if (current.index !== lastPreselectData.index || current.pickKind !== lastPreselectData.pickKind)
                            bUpdate = true;

                        lastPreselectData = current;
                        if (bUpdate)
                            view.Renderer.Render();
                    }
                }
                else {
                    lastPreselectData = undefined;
                }

                ///Control 이벤트
                if (result.pick === true) {
                    if (result.kind === 2) {  // OK Control 선택시
                        if (view.Pick.EnableControlMove === true){
                            markupList[subMode].uiBase.actionEnabled = false;
                            markupList[subMode].uiBase.base.prototype.touchEnd.call(markupList[subMode].uiBase, touches);
                            markupList[subMode].uiBase.actionEnabled = true;
    
    
                            scope.mouseDown(pickerPos.x, pickerPos.y, 0);
                            scope.mouseUp(pickerPos.x, pickerPos.y, 0);
                            markupList[subMode].uiBase.ShowPivot(false);
                        }
                        else
                            markupList[subMode].touchEnd(touches);

                        return;
                    }
                    else if (result.kind === 3) {    // 취소 Control 선택시
                        view.Control.RestoreMode();
                        view.Renderer.Render();
                        if(subMode > 0)
                            markupList[subMode].uiBase.ShowPivot(false);

                        return;
                    }
                    else if (result.kind === 1) {    // 이동 Control 선택시
                        view.Renderer.Render();
                        markupList[subMode].uiBase.ShowPivot(false);
                        return;
                    }
                }
                else {
                    let cursorResult = scope.IsValidPosition(pos.x, pos.y);
                    if(view.Pick.GetMakePreselectID() === cursorResult.bodyId){
                        markupList[subMode].uiBase.ShowPivot(false);
                        return;
                    }
                }
            }

         
            markupList[subMode].touchEnd(touches);
  

        }
        else{
            markupList[subMode].touchEnd(touches);
        }
      
    }

    this.IsValidPosition = function (x, y) {
        const resultItem = {
            valid: false,   //유효한 좌표인지
            bodyId: undefined, // 선택된 bodyId
        };

        let body = view.Renderer.Picking(x, y);
        if (body !== undefined) {
            resultItem.valid = true;
            resultItem.bodyId = body.bodyId;
        }

        return resultItem;
    }

    this.keyUp = function (keyCode) {

        let baseKeyUp = markupList[subMode].keyUp(keyCode);
        if (!baseKeyUp) return;

        if (keyCode === 27) //ESC
        {
            //취소
            view.Control.RestoreMode();
            view.Renderer.Render();
        }
        else if (keyCode === 8) //Backspace
        {
            if (subMode !== VIZCore.Enum.REVIEW_TYPES.RK_SKETCH)
                scope.PreviousStep();
        }
    };


    this.Render = function () {
        markupList[subMode].Render();

        if (markupList[subMode].GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.PRESELECT)) {
            view.Pick.RenderPreselectData(lastPreselectData);
        }
    };

    this.Render2D = function (context) {
        markupList[subMode].Render2D(context);
    };

    this.MouseLog = function () {
        console.log('UIMarkup.mouse : ' + scope.mouse.x + ',' + scope.mouse.y);
    };

    this.SetSubType = function (subType) {
        markupList[subMode].SetSubType(subType);
    };

    this.GetUIControl = function () {
        return markupList[subMode];
    };
}

export default UIMarkup;
//VIZCore.UIMarkup.prototype = VIZCore.UIBase.prototype; //call방식으로 base Function을 불러올수 없음

//VIZCore.UIMarkup.prototype = new VIZCore.UIBase(undefined); //call방식으로 base Function을 불러오기 가능
//VIZCore.this.constructor = VIZCore.UIMarkup;
