//import $ from 'jquery';
/**
 * @author ssjo@softhills.net
 */

//평행 면거리 측정
//수직 최단거리
let UIMarkup_Measure_NormalMinDistance = function (uiBase, view, VIZCore) {
    let scope = this;

    this.base = VIZCore.UIMarkup_Base;
    this.base(uiBase, view);


    this.Start = function () {
        // if ($(".ui_message").length > 0) {
        //     let textMeasure = "Measure the coordinates of a particular point.";
        //     //let message = textMeasure + "<br><p2>*</p2><p1>Press the</p1> <p2>ESC</p2> <p1>key to end the measurement.</p1>";
        //     let message = textMeasure;
        //     $(".ui_message_text").html(message);
        //     $(".ui_message").fadeIn(500);
        // }
        let textMeasure = "MG0004";
        view.UIManager.ShowMessage(textMeasure);

        scope.base.prototype.Start.call(scope);
    };

    this.Release = function () {
        scope.base.prototype.Release.call(scope);
    };

    this.PreviousStep = function () {
        switch (uiBase.GetStep()) {
            case 1:
                {
                    view.Data.DeleteReview(uiBase.currentReviewItem.id);
                    view.Renderer.Render();
                    scope.mouseAction = true;
                }
                break;
        }
    };

    this.ProcessStep = function (pickData) {

        switch (uiBase.GetStep()) {
            case 0:
                {
                    if (pickData === undefined) return;
                    if (!pickData.pick) return;
                    if (pickData.body === undefined) return;

                    uiBase.currentReviewItem.drawitem.position[0] = pickData.position; //선택지점 A
                    uiBase.currentReviewItem.drawitem.position[2] = pickData.normal; //A Normal

                    view.Renderer.Render();
                    uiBase.NextStep();
                }
                break;
            case 1:
                {
                    if (pickData === undefined) return;
                    if (!pickData.pick) return;
                    if (pickData.body === undefined) return;

                    uiBase.currentReviewItem.drawitem.position[1] = pickData.position; //선택지점 B

                    let textData = [
                        uiBase.currentReviewItem.drawitem.position[0],
                        uiBase.currentReviewItem.drawitem.position[1],
                        uiBase.currentReviewItem.drawitem.position[2],
                    ];

                    let currentPlane = new VIZCore.Plane().setFromNormalAndCoplanarPoint(
                        uiBase.currentReviewItem.drawitem.position[2], //A Normal
                        uiBase.currentReviewItem.drawitem.position[0]  //선택지점 A
                    );

                    //let targetPos = currentPlane.projectPoint(pick);
                    //let targetLength = currentPlane.distanceToPoint(pick);
                    let targetLength = currentPlane.distanceToPoint(uiBase.currentReviewItem.drawitem.position[1]);
                    let targetPos = new VIZCore.Vector3().addVectors(
                        uiBase.currentReviewItem.drawitem.position[0],
                        new VIZCore.Vector3().copy(uiBase.currentReviewItem.drawitem.position[2]).multiplyScalar(targetLength)
                    );

                    uiBase.currentReviewItem.drawitem.position[3] = targetPos; // 수직 위치

                    //let distance = new VIZCore.Vector3().subVectors(uiBase.currentReviewItem.drawitem.position[0], targetPos).length();

                    uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_NORMALDISTANCE;

                    view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);
                    view.Measure.UpdateReviewText(uiBase.currentReviewItem, textData);

                    uiBase.currentReviewItem.text.position = new VIZCore.Vector3().copy(pickData.position);

                    //등록
                    view.Data.Reviews.push(uiBase.currentReviewItem);

                    view.Renderer.Render();
                    uiBase.NextStep();
                }
                break;
            case 2:
                {
                    uiBase.currentReviewItem = undefined;

                    //view.Control.SetMode(VIZCore.Enum.CONTROL_STATE.MARKUP, REVIEW_TYPES.RK_MEASURE_POS); //다시 시작
                    //view.Control.SetMode(VIZCore.Enum.CONTROL_STATE.NORMAL); //종료
                    view.Control.RestoreMode(); //뒤로

                    view.Renderer.Render();
                }
                break;
        }

    };

    this.mouseDown = function (x, y, button) {

        switch (uiBase.GetStep()) {
            case 2:
                scope.mouseAction = false;
                uiBase.actionEnabled = false; //회전 방지
                break;
        }
        uiBase.base.prototype.mouseDown.call(uiBase, x, y, button);
        uiBase.actionEnabled = true;

        return true;
    };

    this.mouseMove = function (x, y) {
        uiBase.base.prototype.mouseMove.call(uiBase, x, y);
        switch (uiBase.GetStep()) {
            case 2:
                {
                    let mvpMatrix = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, view.Camera.cameraMatrix);

                    let screen = view.Camera.world2ScreenWithMatrix(mvpMatrix, new VIZCore.Vector3().copy(uiBase.currentReviewItem.text.position));
                    let world = view.Camera.screen2WorldWithMatrix(mvpMatrix, new VIZCore.Vector3(x, y, screen.z));

                    uiBase.currentReviewItem.text.position.copy(world);
                    view.Renderer.Render();
                }
                break;
        }
    };

    this.mouseUp = function (x, y, button) {
        uiBase.actionEnabled = false;
        uiBase.base.prototype.mouseUp.call(uiBase, x, y, button);
        uiBase.actionEnabled = true;

        if (button === 0 && uiBase.GetMouseClick(uiBase.mouse.x, uiBase.mouse.y)) {
            switch (uiBase.GetStep()) {
                case 0:
                    {
                        let body = view.Renderer.Picking(uiBase.mouse.x, uiBase.mouse.y);
                        if (body !== undefined) {
                            view.Data.GetPickByBodyCacheDownload(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);

                            scope.mouseAction = false;
                        }
                    }
                    break;
                case 1:
                    {
                        let body = view.Renderer.Picking(uiBase.mouse.x, uiBase.mouse.y);
                        if (body !== undefined) {
                            view.Data.GetPickByBodyCacheDownload(uiBase.mouse.x, uiBase.mouse.y, scope.ProcessStep);

                            scope.mouseAction = false;
                        }
                    }
                    break;
                case 2:
                    {
                        scope.ProcessStep();
                    }
                    break;

            }
        }
        else
            view.MeshBlock.Reset();

        return scope.mouseAction;
    };

    this.mouseWheel = function (x, y, delta) {
        if (uiBase.GetStep() !== 2)
            uiBase.base.prototype.mouseWheel.call(uiBase, x, y, delta);
    };


    this.Render = function () {

    };

    this.Render2D = function (context) {
        const matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.matMV);
        const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

        switch (uiBase.GetStep()) {
            case 0:
                break;
            case 1:
                {
                    let pointSize = 3;
                    context.fillStyle = "rgba(0, 255, 0, 1)";

                    let clipspace = new VIZCore.Matrix4().transformVector(matMVP.elements,
                        [uiBase.currentReviewItem.drawitem.position[0].x, uiBase.currentReviewItem.drawitem.position[0].y, uiBase.currentReviewItem.drawitem.position[0].z, 1]);

                    // divide X and Y by W just like the GPU does.
                    clipspace[0] /= clipspace[3];
                    clipspace[1] /= clipspace[3];

                    // convert from clipspace to pixels
                    let pixelX = (clipspace[0] * 0.5 + 0.5) * context.canvas.width;
                    let pixelY = (clipspace[1] * -0.5 + 0.5) * context.canvas.height;

                    //let pos = new VIZCore.Vector2(pixelX, pixelY);
                    context.beginPath();
                    context.arc(pixelX, pixelY, pointSize, 0, Math.PI * 2);
                    context.fill();
                }
                break;
            case 2:
                break;
        }
    };

    //VIZCore.UIMarkup_Base.prototype.mouseDown = function (x, y, button) { }
    //VIZCore.UIMarkup_Base.prototype.mouseMove = function (x, y) { }
    //VIZCore.UIMarkup_Base.prototype.mouseUp = function (x, y, button) { }
    //VIZCore.UIMarkup_Base.prototype.mouseWheel = function (x, y, delta) { }
    //
    //VIZCore.UIMarkup_Base.prototype.touchStart = function (touches) { }
    //VIZCore.UIMarkup_Base.prototype.touchMove = function (touches) { }
    //VIZCore.UIMarkup_Base.prototype.touchEnd = function (touches) { }
    //VIZCore.UIMarkup_Base.prototype.Render2D = function (context) { }
};

export default UIMarkup_Measure_NormalMinDistance;