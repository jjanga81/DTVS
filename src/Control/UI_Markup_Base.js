//import $ from 'jquery';
/**
 * @author ssjo@softhills.net
 */

let UIMarkup_Base = function (uiBase, view) {

    this.mouseAction = true;
    this.uiBase = uiBase;
    this.MarkupSubType = 0;   
    
};

    UIMarkup_Base.prototype.Start = function () {
        this.mouseAction = true;
        this.MarkupSubType = 0;
    };
    UIMarkup_Base.prototype.Release = function () {
        // if ($(".ui_message").length > 0) {
        //     $(".ui_message_text").html("");
        //     $(".ui_message").hide();
        // }
        
        this.uiBase.view.UIManager.HideMessage();
        
        this.mouseAction = true;
        this.MarkupSubType = 0;
    };

    UIMarkup_Base.prototype.NextStep = function () { };
    UIMarkup_Base.prototype.PreviousStep = function () { };
    ///**
    //* 측정 Step프로세스
    //* @param {Data.PickDataItem} pickData : 선택 데이터
    //*/
    UIMarkup_Base.prototype.ProcessStep = function (pickData) { };

    UIMarkup_Base.prototype.mouseDown = function (x, y, button) { return this.uiBase.base.prototype.mouseDown.call(this.uiBase, x, y, button); };
    UIMarkup_Base.prototype.mouseMove = function (x, y) { this.uiBase.base.prototype.mouseMove.call(this.uiBase, x, y); };
    UIMarkup_Base.prototype.mouseUp = function (x, y, button) { return this.uiBase.base.prototype.mouseUp.call(this.uiBase, x, y, button); };
    UIMarkup_Base.prototype.mouseDoubleClick = function (x, y, button) { this.uiBase.base.prototype.mouseDoubleClick.call(this.uiBase, x, y, button); };
    UIMarkup_Base.prototype.mouseWheel = function (x, y, delta) {  this.uiBase.base.prototype.mouseWheel.call(this.uiBase, x, y, delta);};

    UIMarkup_Base.prototype.touchStart = function (touches) { this.uiBase.base.prototype.touchStart.call(this.uiBase, touches); };
    UIMarkup_Base.prototype.touchMove = function (touches) { this.uiBase.base.prototype.touchMove.call(this.uiBase, touches); };
    UIMarkup_Base.prototype.touchEnd = function (touches) { this.uiBase.base.prototype.touchEnd.call(this.uiBase, touches); };

    UIMarkup_Base.prototype.keyUp = function (keycode) { return true; };

    UIMarkup_Base.prototype.Render = function () { };
    //ui render
    //context2D
    UIMarkup_Base.prototype.Render2D = function (context) { };

    UIMarkup_Base.prototype.SetSubType = function (subType) {
        this.MarkupSubType = subType;
    };
    
    UIMarkup_Base.prototype.GetProcessFlag = function (flag) {
        return false;
    };

export default UIMarkup_Base;