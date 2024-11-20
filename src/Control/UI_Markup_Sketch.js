//import $ from 'jquery';
/**
 * @author jhjang@softhills.net
 */

let UIMarkup_Sketch = function (uiBase, view, VIZCore) {
    let scope = this;

    this.base = VIZCore.UIMarkup_Base;
    this.base(uiBase, view);

    this.SketchItem = function () {
        let item = {
            subType : 0,
            position: [],
            textarea : null
        };
        return item;
    };

    function mouseDownOnTextarea(e) {
        //let x = textarea.offsetLeft - e.clientX,
        //    y = textarea.offsetTop - e.clientY;
        //function drag(e) {
        //    textarea.style.left = e.clientX + x + 'px';
        //    textarea.style.top = e.clientY + y + 'px';
        //}
        //function stopDrag() {
        //    document.removeEventListener('mousemove', drag);
        //    document.removeEventListener('mouseup', stopDrag);
        //}
        //document.addEventListener('mousemove', drag);
        //document.addEventListener('mouseup', stopDrag);
    }

    function getTextMetrics(review) {
        let metrics;

        let font = review.style.font.size + "pt " + review.style.font.face;

        view.ctx_review.font = font;

        for (let i = 0; i < review.text.value.length; i++) {
            let measure = view.ctx_review.measureText(review.text.value[i]);
            if (i === 0)
                metrics = measure;
            else if (metrics.width < measure.width)
                metrics = measure;
        }

        if (review.text.value.length > 0) {
            //let metricsh = getTextHeight(font, review.text.value[0]);
            //metrics.height = metricsh.height;
            //metrics.ascent = metricsh.ascent;
            //metrics.descent = metricsh.descent;
            metrics.height = review.style.font.size * 1.5;
            metrics.ascent = review.style.font.size + review.style.font.size * 0.1;
        }

        return metrics;
    }

    function keyDownOnTextarea(e) {
        if (e.keyCode === 27)//ESC
        {
            let text = uiBase.currentReviewItem.drawitem.custom.textarea.value;
            let split = text.split(/(?:\r\n|\r|\n)/g);
            for (let i = 0; i < split.length; i++) {
                //uiBase.currentReviewItem.text.value.push(split[i]);
                uiBase.currentReviewItem.text.value[i] = split[i];
            }
            uiBase.currentReviewItem.text.position = uiBase.currentReviewItem.drawitem.custom.position[0];
            document.body.removeChild(uiBase.currentReviewItem.drawitem.custom.textarea);

            endProcess();
        }
        else {
            let text = uiBase.currentReviewItem.drawitem.custom.textarea.value;
            let split = text.split(/(?:\r\n|\r|\n)/g);
            for (let i = 0; i < split.length; i++) {
                uiBase.currentReviewItem.text.value[i] = split[i];
            }

            let textarea = uiBase.currentReviewItem.drawitem.custom.textarea;

            const metrics = getTextMetrics(uiBase.currentReviewItem);
            //const metrics = getTextMetricsByText(text, uiBase.currentReviewItem.style.font.size);

            let width = (metrics.width + 10);
            if (width < 100)
                width = 100;
            textarea.style.width = width + 'px';
            let height = uiBase.currentReviewItem.text.value.length * metrics.height;
            if (height < 100)
                height = 100;
            textarea.style.height = height + 'px';
        }
    }

    function endProcess() {
        view.Renderer.Render();
        //등록
        view.Data.Reviews.push(uiBase.currentReviewItem);
        uiBase.PreviousStep();
        let backupSubType = scope.MarkupSubType;
        // Sketch Restart
        view.Review.SetSketchMode(true);
        view.Control.SetSubType(backupSubType);
    }

    this.Start = function () {
        // if ($(".ui_message").length > 0) {
        //    let textMeasure = "";    //Text Delete
        //    //let message = textMeasure + "<br><p2>*</p2><p1>Press the</p1> <p2>ESC</p2> <p1>key to end the measurement.</p1>";
        //    let message = textMeasure;
        //    $(".ui_message_text").html(message);
        //    $(".ui_message").fadeIn(500);
        // }
        let textMeasure = "";    //Text Delete
        view.UIManager.ShowMessage(textMeasure);

        scope.base.prototype.Start.call(scope);
        {
            uiBase.currentReviewItem.itemType = VIZCore.Enum.REVIEW_TYPES.RK_SKETCH;
            uiBase.currentReviewItem.drawitem.custom = scope.SketchItem();
            view.Measure.UpdateReviewStyle(uiBase.currentReviewItem);

            // uiBase.currentReviewItem.style.line.color = view.Configuration.Markup.LineColor;
            // uiBase.currentReviewItem.style.line.thickness = view.Configuration.Markup.LineWidth;
        }
    };

    this.Release = function () {
        scope.base.prototype.Release.call(scope);
    };

    this.PreviousStep = function () {
        //view.Data.DeleteReview(uiBase.currentReviewItem.id);
        //view.Renderer.Render();
        //scope.mouseAction = true;
    };


    this.ProcessStep = function (pickData) {

        switch (uiBase.GetStep()) {
            case 0:
                {
                    if (pickData === undefined) return;

                    
                }
                break;
            case 1:
                {
                    if (pickData === undefined) return;

                }
                break;
            case 2:
                {
                    if (pickData === undefined) return;

                    ////등록
                    //view.Data.Reviews.push(uiBase.currentReviewItem);

                    //view.Renderer.Render();
                    //uiBase.NextStep();
                }
                break;
            case 3:
                {
                    //uiBase.currentReviewItem = undefined;

                    //view.Control.SetMode(VIZCore.Enum.CONTROL_STATE.MARKUP, VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_POS); //다시 시작
                    //view.Control.SetMode(VIZCore.Enum.CONTROL_STATE.NORMAL); //종료
                    //view.Control.RestoreMode(); //뒤로

                    //view.Renderer.Render();
                }
                break;
        }
    };


    this.mouseDown = function (x, y, button) {
        uiBase.actionEnabled = false; //회전 방지
        uiBase.currentReviewItem.drawitem.custom.subType = scope.MarkupSubType;
        uiBase.base.prototype.mouseDown.call(uiBase, x, y, button);

        uiBase.actionEnabled = true;

        uiBase.currentReviewItem.style.line.color = view.Configuration.Markup.LineColor;
        uiBase.currentReviewItem.style.line.thickness = view.Configuration.Markup.LineWidth;

        let world = view.Camera.screen2WorldWithMatrix(view.Camera.matMVP, new VIZCore.Vector3(x, y, 0));

        switch (scope.MarkupSubType) {
            case VIZCore.Enum.SKETCH_TYPES.FREE: 
                {
                    //uiBase.currentReviewItem.drawitem.custom.position.push(new VIZCore.Vector2(x, y)); 
                    uiBase.currentReviewItem.drawitem.custom.position.push(new VIZCore.Vector3().copy(world)); 
                    uiBase.NextStep();
                }
                break;
            case VIZCore.Enum.SKETCH_TYPES.LINE:
            case VIZCore.Enum.SKETCH_TYPES.CIRCLE:
            case VIZCore.Enum.SKETCH_TYPES.RECT:
                {
                    //uiBase.currentReviewItem.drawitem.custom.position.push(new VIZCore.Vector2(x, y));
                    //uiBase.currentReviewItem.drawitem.custom.position.push(new VIZCore.Vector2(x, y));
                    uiBase.currentReviewItem.drawitem.custom.position.push(new VIZCore.Vector3().copy(world)); 
                    uiBase.currentReviewItem.drawitem.custom.position.push(new VIZCore.Vector3().copy(world)); 
                    uiBase.NextStep();
                }
                break;
            case VIZCore.Enum.SKETCH_TYPES.TEXT:
                {
                    //uiBase.currentReviewItem.drawitem.custom.position.push(new VIZCore.Vector2(x, y));
                    uiBase.currentReviewItem.drawitem.custom.position.push(new VIZCore.Vector3().copy(world)); 
                    uiBase.NextStep();
                }
                break;
        }

        return true;
    };

    this.mouseMove = function (x, y) {
        uiBase.base.prototype.mouseMove.call(uiBase, x, y);

        let world = view.Camera.screen2WorldWithMatrix(view.Camera.matMVP, new VIZCore.Vector3(x, y, 0));

        switch (scope.MarkupSubType) {
            case VIZCore.Enum.SKETCH_TYPES.FREE:
                {
                    let step = uiBase.GetStep();
                    if (step === 1) {
                        //uiBase.currentReviewItem.drawitem.custom.position.push(new VIZCore.Vector2(x, y));
                        uiBase.currentReviewItem.drawitem.custom.position.push(new VIZCore.Vector3().copy(world)); 
                        view.Renderer.Render();
                    }
                }
                break;
            case VIZCore.Enum.SKETCH_TYPES.LINE:
            case VIZCore.Enum.SKETCH_TYPES.CIRCLE:
            case VIZCore.Enum.SKETCH_TYPES.RECT:
                {
                    let step = uiBase.GetStep();
                    if (step === 1) {
                        //uiBase.currentReviewItem.drawitem.custom.position[1] = new VIZCore.Vector2(x, y);
                        uiBase.currentReviewItem.drawitem.custom.position[1] = new VIZCore.Vector3().copy(world); 
                        view.Renderer.Render();
                    }
                }
                break;
        }
    };

    this.mouseUp = function (x, y, button) {
        uiBase.actionEnabled = false;
        uiBase.base.prototype.mouseUp.call(uiBase, x, y, button);
        uiBase.actionEnabled = true;

        const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
        let world = view.Camera.screen2WorldWithMatrix(matMVP, new VIZCore.Vector3(x, y, 0));        


        switch (scope.MarkupSubType) {


            case VIZCore.Enum.SKETCH_TYPES.NONE:  //Drawing Mode 가 아닌 선택 처리
                {
                    if (!uiBase.GetMouseClick(x, y)) break;

                    let mousePoint = new VIZCore.Vector3(x, y, 0);
                    let selectMinDistOffset = 10.0;

                    //Sketch 선택 검사
                    for(let r = 0 ; r < view.Data.Reviews.length ; r++ ) {
                        let review = view.Data.Reviews[r];
                        if(!review.visible) continue;
                        if(review.itemType !== VIZCore.Enum.REVIEW_TYPES.RK_SKETCH) continue;                        
                        if(!review.drawitem.custom) continue;

                        //두께 + 선택범위 offset
                        let selectMinDist = review.style.line.thickness + selectMinDistOffset;
                        
                        let currentSelection = false;
                        switch(review.drawitem.custom.subType)
                        {
                            case VIZCore.Enum.SKETCH_TYPES.FREE:
                                {
                                    for (let i = 1; i < review.drawitem.custom.position.length; i++) {

                                        let posW1 = review.drawitem.custom.position[i - 1];
                                        let posW2 = review.drawitem.custom.position[i];
                                        let pos1 = view.Camera.world2ScreenWithMatrix(matMVP, new VIZCore.Vector3().copy(posW1));
                                        let pos2 = view.Camera.world2ScreenWithMatrix(matMVP, new VIZCore.Vector3().copy(posW2));
                                        pos1.z = 0;
                                        pos2.z = 0;

                                        let minPoint = new VIZCore.Vector3();
                                        let minDist = view.Util.Point2LineDistance(mousePoint, pos1, pos2, minPoint);
                                        if(minDist > selectMinDist) continue;

                                        currentSelection = true;
                                        break;
                                    }
                                }
                                break;
                            case VIZCore.Enum.SKETCH_TYPES.LINE:
                                {
                                    for (let i = 1; i < review.drawitem.custom.position.length; i++) {

                                        let posW1 = review.drawitem.custom.position[i - 1];
                                        let posW2 = review.drawitem.custom.position[i];
                                        let pos1 = view.Camera.world2ScreenWithMatrix(matMVP, new VIZCore.Vector3().copy(posW1));
                                        let pos2 = view.Camera.world2ScreenWithMatrix(matMVP, new VIZCore.Vector3().copy(posW2));
                                        pos1.z = 0;
                                        pos2.z = 0;

                                        let minPoint = new VIZCore.Vector3();
                                        let minDist = view.Util.Point2LineDistance(mousePoint, pos1, pos2, minPoint);
                                        if(minDist > selectMinDist) continue;

                                        currentSelection = true;
                                        break;
                                    }
                                }
                                break;
                            case VIZCore.Enum.SKETCH_TYPES.CIRCLE:
                                {
                                    let posW1 = review.drawitem.custom.position[0];
                                    let posW2 = review.drawitem.custom.position[1];
                                    let pos1 = view.Camera.world2ScreenWithMatrix(matMVP, new VIZCore.Vector3().copy(posW1));
                                    let pos2 = view.Camera.world2ScreenWithMatrix(matMVP, new VIZCore.Vector3().copy(posW2));
                                    pos1.z = 0;
                                    pos2.z = 0;
                                   
                                    let centerPos = new VIZCore.Vector2((pos1.x + pos2.x) / 2, (pos1.y + pos2.y) / 2);
                                    let radius = new VIZCore.Vector2().subVectors(pos1, pos2).length() / 2;

                                    let startAngle = 0;
                                    let endAngle = 360;

                                    let meshItem = view.MeshProcess.Get2DCircleVertices(centerPos, radius, radius, startAngle, endAngle);

                                    for (let i = 1; i < meshItem.vertices.length; i++) {

                                        let meshPos1 = meshItem.vertices[i - 1];
                                        let meshPos2 = meshItem.vertices[i];

                                        let minPoint = new VIZCore.Vector3();
                                        let minDist = view.Util.Point2LineDistance(mousePoint, meshPos1, meshPos2, minPoint);
                                        if(minDist > selectMinDist) continue;

                                        currentSelection = true;
                                        break;
                                    }

                                }
                                break;
                            case VIZCore.Enum.SKETCH_TYPES.RECT:
                                {
                                    let posW1 = review.drawitem.custom.position[0];
                                    let posW2 = review.drawitem.custom.position[1];
                                    let pos1 = view.Camera.world2ScreenWithMatrix(matMVP, new VIZCore.Vector3().copy(posW1));
                                    let pos2 = view.Camera.world2ScreenWithMatrix(matMVP, new VIZCore.Vector3().copy(posW2));

                                    let leftTop = new VIZCore.Vector3(pos1.x, pos1.y, 0.0);
                                    let leftBottom = new VIZCore.Vector3(pos1.x, pos2.y, 0.0);
                                    let rightTop = new VIZCore.Vector3(pos2.x, pos1.y, 0.0);
                                    let rightBottom = new VIZCore.Vector3(pos2.x, pos2.y, 0.0);

                                    let minPoint = new VIZCore.Vector3();
                                    //1
                                    {
                                        let minDist = view.Util.Point2LineDistance(mousePoint, leftTop, leftBottom, minPoint);
                                        if(minDist < selectMinDist) {
                                            currentSelection = true;
                                            break;
                                        }
                                    }                                    
                                    //2
                                    {
                                        let minDist = view.Util.Point2LineDistance(mousePoint, leftTop, rightTop, minPoint);
                                        if(minDist < selectMinDist) {
                                            currentSelection = true;
                                            break;
                                        }
                                    }
                                    //3
                                    {
                                        let minDist = view.Util.Point2LineDistance(mousePoint, rightTop, rightBottom, minPoint);
                                        if(minDist < selectMinDist) {
                                            currentSelection = true;
                                            break;
                                        }
                                    }
                                    //4
                                    {
                                        let minDist = view.Util.Point2LineDistance(mousePoint, leftBottom, rightBottom, minPoint);
                                        if(minDist < selectMinDist) {
                                            currentSelection = true;
                                            break;
                                        }
                                    }
                                }
                                break;
                            case VIZCore.Enum.SKETCH_TYPES.TEXT:
                                {
                                    for(let j = 0 ; j < review.rect.length ; j++) {
                                        let rect = review.rect[j];
                                        if(rect.isPointInRect(x, y) === false) continue;

                                        currentSelection = true;
                                        break;
                                    }
                                }
                                break;
                        }


                        if(!currentSelection) continue;

                        review.selection = !review.selection;
                        view.Renderer.Render();
                    }

                }
                break;
            case VIZCore.Enum.SKETCH_TYPES.FREE:
                {
                    let step = uiBase.GetStep();
                    if (step === 1) {
                        //uiBase.currentReviewItem.drawitem.custom.position[1] = new VIZCore.Vector2(x, y);
                        //uiBase.currentReviewItem.drawitem.custom.position.push(new VIZCore.Vector2(x, y));
                        uiBase.currentReviewItem.drawitem.custom.position.push(new VIZCore.Vector3().copy(world)); 
                        endProcess();
                    }
                }
                break;
            case VIZCore.Enum.SKETCH_TYPES.LINE:
            case VIZCore.Enum.SKETCH_TYPES.CIRCLE:
            case VIZCore.Enum.SKETCH_TYPES.RECT:
                {
                    let step = uiBase.GetStep();
                    if (step === 1) {
                        //uiBase.currentReviewItem.drawitem.custom.position[1] = new VIZCore.Vector2(x, y);
                        uiBase.currentReviewItem.drawitem.custom.position[1] = new VIZCore.Vector3().copy(world); 
                        endProcess();
                    }
                }
                break;
            case VIZCore.Enum.SKETCH_TYPES.TEXT:
                {
                    let step = uiBase.GetStep();
                    if (step === 1) {
                        
                        //uiBase.currentReviewItem.drawitem.custom.position[1] = new VIZCore.Vector2(x + 100, y + 100);
                        let pos = view.Camera.screen2WorldWithMatrix(matMVP, new VIZCore.Vector3(x + 100, y + 100, 0));
                        uiBase.currentReviewItem.drawitem.custom.position[1] = new VIZCore.Vector3().copy(pos);
                    }
                    if (!uiBase.currentReviewItem.drawitem.custom.textarea) {
                        //uiBase.currentReviewItem.drawitem.custom.position.push(new VIZCore.Vector2(x, y));
                        uiBase.currentReviewItem.drawitem.custom.position[1] = new VIZCore.Vector3().copy(world); 
                        let textarea = document.createElement('textarea');
                        textarea.className = 'sketch_textarea';
                        

                        textarea.addEventListener('mousedown', mouseDownOnTextarea);
                        textarea.addEventListener('keydown', keyDownOnTextarea);
                        document.body.appendChild(textarea);
                        uiBase.currentReviewItem.drawitem.custom.textarea = textarea;

                        //let pos = uiBase.currentReviewItem.drawitem.custom.position[0];
                        let posWorld = uiBase.currentReviewItem.drawitem.custom.position[0];
                        let pos = view.Camera.world2ScreenWithMatrix(matMVP, new VIZCore.Vector3().copy(posWorld));
                        //textarea.value = "x: " + pos.x + " y: " + pos.y;
                        textarea.style.top = pos.y + 'px';
                        textarea.style.left = pos.x + 'px';
                        textarea.style.width = '100px';
                        textarea.style.height = '100px';
                        textarea.style.background = 'transparent';
                        textarea.style.border = 'solid 1px';
                        textarea.style.fontSize = uiBase.currentReviewItem.style.font.size + 4 + 'px';
                        textarea.style.fontFamily = uiBase.currentReviewItem.style.font.face + '';
                    }
                }
                break;
        }

        return scope.mouseAction;
    };


    this.mouseWheel = function (x, y, delta) {
        //if(scope.GetProcessFlag(VIZCore.Enum.MARKUP_FLAG.ZOOM))
        //  uiBase.base.prototype.mouseWheel.call(uiBase, x, y, delta);
    };

    this.keyUp = function (keyCode) {

        //그리기 모드가 아닌경우에만 적용
        if(scope.MarkupSubType === VIZCore.Enum.SKETCH_TYPES.NONE)
        {
            if(keyCode === 46) { //Delete key
                //선택 Sketch만 삭제

                for(let i = view.Data.Reviews.length - 1 ; i >= 0; i--) {
                    let review = view.Data.Reviews[i];
                    if(review.itemType !== VIZCore.Enum.REVIEW_TYPES.RK_SKETCH) continue;
                    if(!review.selection) continue;

                    view.Data.Review.DeleteReview(review.id);
                }
                view.Renderer.Render();
            }
        }

        return true;
    };

    this.mouseDoubleClick = function (x, y, button) {
        //base 실행 방지
    };

    this.Render2D = function (context) {

        // //현재 그리기
        // view.Data.Review.RenderReviewItem(uiBase.currentReviewItem);
        // return;

        //context.fillStyle = "rgba(0, 255, 0, 1)";
        //context.strokeStyle = "rgba(255, 0, 0, 1)";
        context.fillStyle = "rgba(" + view.Configuration.Markup.LineColor.r + "," + view.Configuration.Markup.LineColor.g + ","
                        + view.Configuration.Markup.LineColor.b + "," + view.Configuration.Markup.LineColor.glAlpha() + ")";
        context.strokeStyle = "rgba(" + view.Configuration.Markup.LineColor.r + "," + view.Configuration.Markup.LineColor.g + ","
                        + view.Configuration.Markup.LineColor.b + "," + view.Configuration.Markup.LineColor.glAlpha() + ")";
        context.lineWidth = view.Configuration.Markup.LineWidth;

        switch (scope.MarkupSubType) {
            case VIZCore.Enum.SKETCH_TYPES.FREE:
                {
                    let step = uiBase.GetStep();
                    if (step !== 0) {
                        context.beginPath();
                        for (let i = 0; i < uiBase.currentReviewItem.drawitem.custom.position.length; i++) {
                            if (i === 0)
                                continue;

                            //let pos1 = uiBase.currentReviewItem.drawitem.custom.position[i-1];
                            //let pos2 = uiBase.currentReviewItem.drawitem.custom.position[i];    
                            let posW1 = uiBase.currentReviewItem.drawitem.custom.position[i-1];
                            let posW2 = uiBase.currentReviewItem.drawitem.custom.position[i];   
                            let pos1 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW1));
                            let pos2 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW2));
                            context.moveTo(pos1.x, pos1.y);
                            context.lineTo(pos2.x, pos2.y);
                        }
                        context.stroke();

                        //endProcess();
                    }
                }
                break;
            case VIZCore.Enum.SKETCH_TYPES.LINE:
                {
                    let step = uiBase.GetStep();
                    if (step !== 0) {
                        //let pos1 = uiBase.currentReviewItem.drawitem.custom.position[0];
                        //let pos2 = uiBase.currentReviewItem.drawitem.custom.position[1];
                        let posW1 = uiBase.currentReviewItem.drawitem.custom.position[0];
                        let posW2 = uiBase.currentReviewItem.drawitem.custom.position[1];   
                        let pos1 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW1));
                        let pos2 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW2));
                        context.beginPath();
                        context.moveTo(pos1.x, pos1.y);
                        context.lineTo(pos2.x, pos2.y);
                        context.stroke();

                        //endProcess();
                    }
                }
                break;
            case VIZCore.Enum.SKETCH_TYPES.CIRCLE:
                {
                    let step = uiBase.GetStep();
                    if (step !== 0) {
                        //let pos1 = uiBase.currentReviewItem.drawitem.custom.position[0];
                        //let pos2 = uiBase.currentReviewItem.drawitem.custom.position[1];
                        let posW1 = uiBase.currentReviewItem.drawitem.custom.position[0];
                        let posW2 = uiBase.currentReviewItem.drawitem.custom.position[1];   
                        let pos1 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW1));
                        let pos2 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW2));
                        let startAngle = 0;
                        let endAngle = 2 * Math.PI;
                        let pos = new VIZCore.Vector2((pos1.x + pos2.x) / 2, (pos1.y + pos2.y) / 2);
                        let sub = new VIZCore.Vector2().subVectors(pos1,pos2);
                        let radius = Math.abs(sub.length() / 2);
                        context.beginPath();
                        context.arc(pos.x, pos.y, radius, startAngle, endAngle, true); 
                        context.stroke();

                        //endProcess();
                    }
                }
                break;
            case VIZCore.Enum.SKETCH_TYPES.RECT:
                {
                    let step = uiBase.GetStep();
                    if (step !== 0) {
                        //let pos1 = uiBase.currentReviewItem.drawitem.custom.position[0];
                        //let pos2 = uiBase.currentReviewItem.drawitem.custom.position[1];
                        let posW1 = uiBase.currentReviewItem.drawitem.custom.position[0];
                        let posW2 = uiBase.currentReviewItem.drawitem.custom.position[1];   
                        let pos1 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW1));
                        let pos2 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW2));
                        let width = pos2.x - pos1.x;
                        let height = pos2.y - pos1.y;
                        context.beginPath();
                        context.rect(pos1.x, pos1.y, width, height);
                        context.stroke();

                        //endProcess();
                    }
                }
                break;
            case VIZCore.Enum.SKETCH_TYPES.TEXT:
                {
                    //let step = uiBase.GetStep();
                    //if (step === 1) {
                    //    let pos1 = uiBase.currentReviewItem.drawitem.custom.position[0];
                    //    let pos2 = uiBase.currentReviewItem.drawitem.custom.position[1];
                    //    let width = pos2.x - pos1.x;
                    //    let height = pos2.y - pos1.y;
                    //    context.beginPath();
                    //    context.rect(pos1.x, pos1.y, width, height);
                    //    context.stroke();
                    //}
                }
                break;
                
        }
    };

    this.GetProcessFlag = function (flag) {

        // if(flag === VIZCore.Enum.MARKUP_FLAG.ROTATE)
        //     return false;

        // if(flag === VIZCore.Enum.MARKUP_FLAG.ZOOM)
        //     return false;

        return false;
    };

    // Mobile 스케치 지원
    this.touchStart = function(touches){
        let viewSize = document.getElementById(view.GetViewID()).getBoundingClientRect();
        let mouse = new VIZCore.Vector2(touches[0].pageX - viewSize.left, touches[0].pageY - viewSize.top);
        scope.mouseDown(mouse.x, mouse.y, 0);
    };

    this.touchMove = function(touches){
        let viewSize = document.getElementById(view.GetViewID()).getBoundingClientRect();
        let mouse = new VIZCore.Vector2(touches[0].pageX - viewSize.left, touches[0].pageY - viewSize.top);
        scope.mouseMove(mouse.x, mouse.y, 0);
    };

    this.touchEnd = function(touches){
        scope.mouseUp(scope.uiBase.mouse.x, scope.uiBase.mouse.y, 0);
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

export default UIMarkup_Sketch;