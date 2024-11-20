//import $ from 'jquery';

class ColorPicker {
    constructor(view, VIZCore) {
        let scope = this;

        this.colorpicker = undefined;
        this.closebtn = undefined;

        //전체 색상 
        this.ctx_color = undefined;
        this.canvas_color = undefined;

        //Pick한 디테일 색상
        this.ctx_detailColor = undefined;
        this.canvas_detailColor = undefined;

        const defaultColor = new VIZCore.Color(255, 0, 0);
        let pickColor = undefined;

        // Color Picker 보이기/숨기기
        this.visible = false;

        /// color 선택시 원형 커서
        let circleCursorX = undefined;
        let circleCursorY = undefined;
        let circleCursorRadius = undefined;

        /// color 채도 선택시 사각형 커서
        let rectangleCursorX = undefined;
        let rectangleCursorY = undefined;

        const rectangleWidth = 10; // 사각형 가로 길이
        const rectangleHeight = 40; // 사각형 세로 길이
        const outerStrokeWidth = 4; // 사각형 테두리 넓이

        const canvasWitdh = 200;   
        const canvasHeight = 130;
        const detailcanvasHeight = 40;

        this.Callback = undefined;

        const CanvasType = {
            Color: 0,  // canvas_color
            DetailColor: 10, //canvas_detailColor
        };

        // Color Picker 보이기/숨기기
        this.Show = function (show) {

            colorpicekrShow(show);
        };

        function colorpicekrShow(show) {

            if (show === true) {
                scope.colorpicker.style.display = "block";
                scope.closebtn.style.display = "block";
                scope.visible = true;
            }
            else {
                scope.colorpicker.style.display = "none";
                scope.closebtn.style.display = "none";
                scope.visible = false;
            }
        };


        this.GetShow = function () {
            return scope.visible;
        }

        // Color Picker 표출될 위치 
        this.SetPosition = function (buttonTop, buttonLeft) {

            //클릭한 버튼을 기준으로 위치계산
            let colorpicker_top = buttonTop - scope.colorpicker.offsetHeight - 2;
            let colorpicker_left = buttonLeft;

            scope.colorpicker.style.top = colorpicker_top + 'px';
            scope.colorpicker.style.left = colorpicker_left + 'px';

            let closebtn_top = colorpicker_top - scope.closebtn.offsetHeight;
            let closebtn_left = (colorpicker_left + scope.colorpicker.offsetWidth) - scope.closebtn.offsetWidth;

            scope.closebtn.style.top = closebtn_top + 'px';
            scope.closebtn.style.left = closebtn_left + 'px';
        };

        let pickCanvasColor = new VIZCore.Color();  // detail color 선택 시 선택한 좌표를 기준으로 사각형을 그림, 선택을 할때마다 canvas를 clear해야한다. 따라서 선택된 색상을 알고있어야한다.
        /// Color 생성
        let initColorPicker = () => {

            let initUI = () => {
                ///Color & Alpha Container
                let div_color = document.createElement('div');
                div_color.style.display = "none";
                div_color.id = "VIZCore_ColorAlpha";
                div_color.className = "VIZWeb SH_color_panel";
                scope.colorpicker = div_color;

                // 전체 색상 Canvas
                // Content1
                let div_color_content1 = document.createElement('div');
                div_color_content1.id = view.GetViewID() + "div_color_content1";
                div_color_content1.className = "VIZWeb SH_color_panel_canvas_div";
                div_color_content1.style.marginTop = '5px';
                div_color.appendChild(div_color_content1);

                // Canvas 
                let canvas = document.createElement('canvas');
                canvas.id = "canvas_colora";
                canvas.className = "VIZWeb SH_color_panel_canvas";
                canvas.width = canvasWitdh;
                canvas.height = canvasHeight;
                canvas.style.border = "1px solid rgba(0, 0, 0, 0.2)";
                canvas.addEventListener('click', function (event) {
                    handleColorPick(event, CanvasType.Color);
                    drawRectangleAtCursor(5);
                });

                let canvas_mousedown = false;
                canvas.addEventListener('mousedown', function (event) {
                    canvas_mousedown = true;
                });

                canvas.addEventListener('mouseup', function (event) {
                    canvas_mousedown = false;
                });

                canvas.addEventListener('mouseout', function (event) {
                    canvas_mousedown = false;
                });

                canvas.addEventListener('mousemove', function (event) {

                    if (canvas_mousedown === true) {
                        handleColorPick(event, CanvasType.Color);
                        drawRectangleAtCursor(5);
                    }
                });

                div_color_content1.appendChild(canvas);

                scope.ctx_color = canvas.getContext("2d");
                scope.canvas_color = canvas;

                // Pick 한 색의 Detail Canvas
                // Content2
                let div_color_content2 = document.createElement('div');
                div_color_content2.id = view.GetViewID() + "div_color_content2";
                div_color_content2.className = "VIZWeb SH_color_panel_canvas_div";
                div_color.appendChild(div_color_content2);

                // Detail Canvas
                let detailCanvas = document.createElement('canvas');
                detailCanvas.id = view.GetViewID() + "canvas_detail_color";
                detailCanvas.className = "VIZWeb SH_color_panel_canvas";
                detailCanvas.width = canvasWitdh;
                detailCanvas.height = detailcanvasHeight;
                detailCanvas.style.border = "1px solid rgba(0, 0, 0, 0.2)";
                div_color_content2.appendChild(detailCanvas);

                detailCanvas.addEventListener('click', function (event) {
                    handleColorPick(event, CanvasType.DetailColor);
                });

                let detailCanvas_mousedown = false;
                detailCanvas.addEventListener('mousedown', function (event) {
                    detailCanvas_mousedown = true;
                });

                detailCanvas.addEventListener('mouseup', function (event) {
                    detailCanvas_mousedown = false;
                });

                detailCanvas.addEventListener('mouseout', function (event) {
                    detailCanvas_mousedown = false;
                });

                detailCanvas.addEventListener('mousemove', function (event) {

                    if (detailCanvas_mousedown === true) {
                        handleColorPick(event, CanvasType.DetailColor);
                    }
                });


                scope.ctx_detailColor = detailCanvas.getContext("2d");
                scope.canvas_detailColor = detailCanvas;

                /// 선택한 색상 미리보기 , 투명도 조절 Slider
                // Content
                let div_color_content3 = document.createElement('div');
                div_color_content3.id = view.GetViewID() + "div_color_content3";
                div_color_content3.className = "VIZWeb SH_color_panel_canvas_trans";
                div_color.appendChild(div_color_content3);

                // Color Preview
                let colorPreview = document.createElement('div');
                colorPreview.id = view.GetViewID() + 'colorPreview';
                colorPreview.className = "VIZWeb SH_color_panel_canvas_preview";
                div_color_content3.appendChild(colorPreview);

                //Slider
                let div_range = document.createElement('div');
                div_range.id = view.GetViewID() + "div_range_transparency";
                div_range.className = "VIZWeb SH_color_panel_transparency_input";
                div_range.style.width = "calc(100% - 8px)";
                div_range.style.height = "25px";
                div_range.style.top = "0px";
                div_range.style.marginLeft = "4px";
                div_range.style.borderRadius = "2px";

                let slider = document.createElement("input");
                slider.type = "range";
                slider.id = view.GetViewID() + "slider";
                slider.min = "0";
                slider.max = "100";
                slider.step = "0.01";
                slider.value = "100";
                div_range.appendChild(slider);
                div_color_content3.appendChild(div_range);

                div_range.addEventListener("change", function () {

                    let transparency = Math.round(slider.value * (255 / 100));
                    let pickedColor = new VIZCore.Color();
                    pickedColor = getPickColor();
                    let vizrgbColor = "rgba(" + pickedColor.r + "," + pickedColor.g + "," + pickedColor.b + "," + transparency / 255 + ")";

                    colorPreview.style.backgroundColor = vizrgbColor;
                    colorPreview.style.borderColor = vizrgbColor;

                    //투명도 지정된 컬러
                    setPickColor(new VIZCore.Color(pickedColor.r, pickedColor.g, pickedColor.b, transparency));
                });

                // X 버튼 생성
                let closeButton = document.createElement('div');
                closeButton.id = view.GetViewID() + "closebutton";
                closeButton.className = 'VIZWeb SH_color_panel_close_button';
                //view.Container.appendChild(closeButton);
                scope.closebtn = closeButton;

                // X 버튼 클릭 이벤트 핸들러
                closeButton.addEventListener('click', function () {
                    colorpicekrShow(false);
                });

                let div_color_content4 = document.createElement('div');
                div_color_content4.id = view.GetViewID() + "div_color_content4";
                div_color_content4.className = "VIZWeb SH_color_panel_canvas_trans";
                div_color_content4.style.display = 'inline-block';
                div_color.appendChild(div_color_content4);


                let btn_Cancel = document.createElement('button');
                btn_Cancel.className = "VIZWeb SH_color_panel_button";
                btn_Cancel.id = view.GetViewID() + "btn_Cancel";
                btn_Cancel.style.float = 'right';
                btn_Cancel.style.backgroundImage = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABU0lEQVRYheWX3YnDMBCEJ67AhQTODQT8YNWRK+2uDr8EroEEUkg6cBCs7pw9749WDwlkQNhga+YzlrXr3bIseKa6p6ZbACmlvjXA8hABUkpfAE4tEDT3RF5+AJpwBPARhSjh5HGUIP4BrMKLqiFYeNEmRMcm8vBqCCFchOjYxEHxNiGM8KJh7fELMM/zDcAI4BKBcIZn75GyHgFaIKLhWZs7YY0hnYfCRYAKiCsd95FwFaACQpManqVuxc41IckMNwEaIFzhWe5yTK/jx3jfoHVx8IRnvXY5LlotRuvpQfe4a4cJEPwS3LXD05BEP0MXhNaQeDeiq3LdhJAaEu9WfKARKmCbALWFpbWK8oYkVNVaIHhDEq5qUQjekJwj4ZUQD+INySeA70i4E0LviAQId7gB4e+I8NchD7XhzKOsK4g+GUAa0zT12nXPyB6az5v/HQO4A7UCRSKrlGEsAAAAAElFTkSuQmCC')";
                div_color_content4.appendChild(btn_Cancel);
                btn_Cancel.addEventListener("click", function () {
                    colorpicekrShow(false);
                });

                let btn_Apply = document.createElement('button');
                btn_Apply.className = "VIZWeb SH_color_panel_button";
                btn_Apply.id = view.GetViewID() + "btn_Apply";
                btn_Apply.style.float = 'right';
                btn_Apply.style.marginRight = '5px';
                btn_Apply.style.backgroundImage = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABC0lEQVRYhe2X2w2CQBBFr8YCrIMfK7AGS9ASLIUSpANKMKEBvmwHM2aXLPucfWU/8Cb7AxvOYSYMcFiWBS1zbErfvcC+BLp+etFqIiDAd1q6RHUBBS6zkag6B7p+GgHcHKeHz/P6qFYBcZcu+JoqApay6/ndPR0rLhADp5wKw309N+CGQNdPZwBvALO+kQEP9dyAU9YWKPCL7XllwNllNwQ0uAxLIge+CljgLAnR82S4KjB79lglUntuFRAbB65EbtnVbEYx58JSqAScYrwLGBK+RMEpxiRktMOVaLhVIFEiCe4UiJRIhnsFmBJZ8KBAQCIbzhJwSBSBU6I+yeQwKgWPFqiR/59RWwEAX4dinIpKvVKbAAAAAElFTkSuQmCC')";
                div_color_content4.appendChild(btn_Apply);
                btn_Apply.addEventListener("click", function () {
                    // applyColor();
                    scope.Callback();
                    colorpicekrShow(false);
                });


                view.Container.appendChild(div_color);
            }


            // Color Picekr UI
            initUI();

            // let pickCanvasColor = new VIZCore.Color(); // detail color 선택 시 선택한 좌표를 기준으로 사각형을 그림, 선택을 할때마다 canvas를 clear해야한다. 따라서 선택된 색상을 알고있어야한다.

            /// type  : 0 = Color Canvas , 1 = Detail Color Canvas
            function handleColorPick(event, type) {
                /// 마우스가 원, 사각형 커서를 선택했을 때 예외처리 
                if (type === CanvasType.Color) {
                    let currentX = event.clientX - scope.canvas_color.getBoundingClientRect().left;
                    let currentY = event.clientY - scope.canvas_color.getBoundingClientRect().top;

                    if (isMouseInsideCircleAtCursor(currentX, currentY, circleCursorX, circleCursorY, circleCursorRadius) === true)
                        return;

                    if (currentX >= canvasWitdh || currentY >= canvasHeight)
                        return;
                }
                else {
                    let currentX = event.clientX - scope.canvas_detailColor.getBoundingClientRect().left;
                    let currentY = event.clientY - scope.canvas_detailColor.getBoundingClientRect().top;

                    if (isMouseInsideRectangleAtCursor(currentX, currentY, rectangleCursorX, rectangleCursorY) === true)
                        return;

                    if (currentX > canvasWitdh || currentY > detailcanvasHeight)
                        return;
                }

                let selectedColor = getColorAtCursor(event, type);
                let vizrgbColor = new VIZCore.Color(selectedColor.r, selectedColor.g, selectedColor.b);

                let colorPreview = document.getElementById(view.GetViewID() + 'colorPreview');
                colorPreview.style.backgroundColor = `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`;
                colorPreview.style.borderColor = `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`;

                if (type === CanvasType.Color) {

                    createColorToBlackGradient(vizrgbColor);

                    // 캔버스에서의 마우스 위치 가져오기
                    let mouseX = event.clientX - scope.canvas_color.getBoundingClientRect().left;
                    let mouseY = event.clientY - scope.canvas_color.getBoundingClientRect().top;

                    drawCircleAtCursor(mouseX, mouseY);
                    pickCanvasColor = vizrgbColor;

                }
                else {
                    let mouseX = event.clientX - scope.canvas_detailColor.getBoundingClientRect().left;
                    drawRectangleAtCursor(mouseX);
                }


                updateSliderBackground(vizrgbColor);
                setPickColor(vizrgbColor);
            };


            function getColorAtCursor(event, type) {

                let x = undefined;
                let y = undefined;
                let imageData = undefined;

                switch (type) {
                    case CanvasType.Color:
                        x = event.clientX - scope.canvas_color.getBoundingClientRect().left;
                        y = event.clientY - scope.canvas_color.getBoundingClientRect().top;
                        scope.ctx_color.imageSmoothingEnabled = true;
                        imageData = scope.ctx_color.getImageData(x, y, 1, 1).data;
                        break;
                    case CanvasType.DetailColor:
                        x = event.clientX - scope.canvas_detailColor.getBoundingClientRect().left;
                        y = event.clientY - scope.canvas_detailColor.getBoundingClientRect().top;
                        scope.ctx_detailColor.imageSmoothingEnabled = true;
                        imageData = scope.ctx_detailColor.getImageData(x, y, 1, 1).data;
                        break;
                    default:
                        break;
                }

                return {
                    r: imageData[0],
                    g: imageData[1],
                    b: imageData[2]
                };
            };

            //// mouseX: 마우스 포인터의 X 좌표
            /// mouseY: 마우스 포인터의 Y 좌표
            /// circleX: 그려진 원 중심 X 좌표
            /// circleY: 그려진 원 상단 Y 좌표
            /// radius: 원의 지름
            function isMouseInsideCircleAtCursor(mouseX, mouseY, circleX, circleY, radius) {

                let enlargedRadius = radius + 2;

                let distance = Math.sqrt((mouseX - circleX) ** 2 + (mouseY - circleY) ** 2);
                return distance < enlargedRadius;
            }


            //// mouseX: 마우스 포인터의 X 좌표
            /// mouseY: 마우스 포인터의 Y 좌표
            /// rectangleX: 그려진 직사각형의 중심 X 좌표
            /// rectangleY: 그려진 직사각형의 상단 Y 좌표
            function isMouseInsideRectangleAtCursor(mouseX, mouseY, rectangleX, rectangleY) {
                let padding = 5;
                let halfWidth = (rectangleWidth + outerStrokeWidth) / 2 + padding;
                let halfHeight = (rectangleHeight + outerStrokeWidth) / 2 + padding;

                // 주어진 위치가 여유를 고려한 직사각형 내부에 있는지 확인
                return mouseX >= rectangleX - halfWidth &&
                    mouseX <= rectangleX + halfWidth &&
                    mouseY >= rectangleY - halfHeight &&
                    mouseY <= rectangleY + rectangleHeight + halfHeight;

            }

            // 초기화 함수 호출
            createColorPicker();
            createColorToBlackGradient(defaultColor);
            setPickColor(new VIZCore.Color(0, 0, 0, 255));

        };

        // 색상으로 위치 값 반환
        function getPositionFromColor(color) {
            let ctx = scope.ctx_color;

            if(ctx === undefined){
                return null;
            }

            let width = ctx.canvas.width;
            let height = ctx.canvas.height;

            let data = ctx.getImageData(0, 0, width, height);
            let buffer = data.data;
            let p, px;

            let r = color[0];
            let g = color[1];
            let b = color[2];

            if(r === 255 && g === 255 && b === 255){
                return [125, 0];
            }
        
            for(let y = 0;  y < height; y++) {
        
                p = y * 4 * width;
        
                for(let x = 0; x < width; x++) {
        
                    px = p + x * 4;

                    // if (buffer[px] === color[0]) {
                    //     if (buffer[px + 1]  === color[1] &&
                    //         buffer[px + 2] === color[2]) {
                    //             console.log(x, y)
                    //         return [x, y];
                    //     }
                    // }

                    
                    // if (buffer[px] === r) {
                    //     if (buffer[px + 1]  === g &&
                    //         buffer[px + 2] === b) {
                    //             console.log(x, y)
                    //         return [x, y];
                    //     }
                    // }

                    // if (r >= buffer[px] / 1.2 && r <= buffer[px] * 1.2) {
                    //     if (g >= buffer[px + 1] / 1.2 && g <= buffer[px + 1] * 1.2 &&
                    //         b >= buffer[px + 2] / 1.2 && b <= buffer[px + 2] * 1.2) {
                    //         console.log(x, y)
                    //         return [x, y];
                    //     }
                    // }

                    // 색상 기준으로 앞 뒤로 30
                    if (buffer[px] >= r - 30 && buffer[px] <= r + 30) {
                        if (buffer[px + 1] >= g - 30 && buffer[px + 1] <= g + 30 &&
                            buffer[px + 2] >= b - 30 && buffer[px + 2] <= b + 30) {
                                // console.log(x, y)
                            return [x, y];
                        }
                    }

                    // if (buffer[px] >= r - 10 && buffer[px] <= r + 10) {
                    //     if (buffer[px + 1] >= g - 10 && buffer[px + 1] <= g + 10 &&
                    //         buffer[px + 2] >= b - 10 && buffer[px + 2] <= b + 10) {
                    //         return [x, y];
                    //     }
                    // }
                }
            }

            return null;
        }

        // 전체 Canvas Clear
        function clearCanvas(type) {
            switch (type) {
                case CanvasType.Color:
                    scope.ctx_color.clearRect(0, 0, scope.canvas_color.width, scope.canvas_color.height);
                    createColorPicker();
                    break;
                case CanvasType.DetailColor:
                    scope.ctx_detailColor.clearRect(0, 0, scope.canvas_detailColor.width, scope.canvas_detailColor.height);
                    createColorToBlackGradient(pickCanvasColor);
                    break;
                default:
                    break;
            }

        }

        function createColorPicker() {
            // 그라데이션 생성
            const gradient = scope.ctx_color.createLinearGradient(0, 0, scope.canvas_color.width, 0);
            gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
            gradient.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
            gradient.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
            gradient.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
            gradient.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
            gradient.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');

            // 그라데이션을 화면에 그리기
            scope.ctx_color.fillStyle = gradient;
            scope.ctx_color.fillRect(0, 0, scope.canvas_color.width, scope.canvas_color.height);

            // 흰색 가로 그라데이션 추가
            const whiteGradient = scope.ctx_color.createLinearGradient(0, scope.canvas_color.height, 0, 0);
            whiteGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            whiteGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            scope.ctx_color.fillStyle = whiteGradient;
            scope.ctx_color.fillRect(0, 0, scope.canvas_color.width, scope.canvas_color.height);

            ///초기화
            circleCursorX = undefined;
            circleCursorY = undefined;
            circleCursorRadius = undefined;
        };


        function createColorToBlackGradient(startColor) {

            // 특정 색상부터 검정색까지의 그라데이션 생성
            const gradient = scope.ctx_detailColor.createLinearGradient(0, 0, scope.canvas_detailColor.width, 0);
            gradient.addColorStop(0, `rgba(${startColor.r}, ${startColor.g}, ${startColor.b} , 1)`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

            // 그라데이션을 캔버스에 적용
            scope.ctx_detailColor.fillStyle = gradient;
            scope.ctx_detailColor.fillRect(0, 0, scope.canvas_detailColor.width, scope.canvas_detailColor.height);

            rectangleCursorX = undefined;
            rectangleCursorY = undefined;
        };

        function updateSliderBackground(value) {

            let vizrgbColor = "rgba(" + value.r + "," + value.g + "," + value.b + "," + 1 + ")";
            let div_range = document.getElementById(view.GetViewID() + "slider");
            if (div_range !== undefined && div_range !== null) {
                div_range.style.background = vizrgbColor;
                div_range.value = "100";
            }

        };

        function drawRectangleAtCursor(mouseX) {


            // 캔버스에서의 마우스 위치 가져오기
            // let mouseX = event.clientX - scope.canvas_detailColor.getBoundingClientRect().left;

            // Canvas Clear - 이전에 그린 도형들을 지우기
            clearCanvas(CanvasType.DetailColor);

            const outerStrokeColor = 'rgba(255, 255, 255, 1)' // 외부 테두리 색상
            const innerStrokeColor = 'rgba(0, 0, 0, 0.9)'; // 내부 테두리 색상

            scope.ctx_detailColor.beginPath();
            scope.ctx_detailColor.rect(mouseX - rectangleWidth / 2, 0, rectangleWidth, rectangleHeight);

            rectangleCursorX = mouseX;
            rectangleCursorY = rectangleHeight / 2;

            // 외부 흰색 테두리 그리기
            scope.ctx_detailColor.strokeStyle = outerStrokeColor;
            scope.ctx_detailColor.lineWidth = 4;
            scope.ctx_detailColor.stroke();

            // 내부 검은색 테두리 그리기
            scope.ctx_detailColor.strokeStyle = innerStrokeColor;
            scope.ctx_detailColor.lineWidth = 2;
            scope.ctx_detailColor.stroke();

            scope.ctx_detailColor.stroke();
            scope.ctx_detailColor.closePath();
        }

        function drawCircleAtCursor(mouseX, mouseY) {
            //Canvas Clear - 이전에 그린 원을 지우기
            clearCanvas(CanvasType.Color);

            // 선택한 색상 주위에 원을 그리기
            let radius = 5; // 원의 반지름
            let outerStrokeColor = 'white'; // 외부 테두리 색상
            let innerStrokeColor = 'rgba(0, 0, 0, 1)'; // 내부 테두리 색상

            scope.ctx_color.beginPath();

            circleCursorX = mouseX;
            circleCursorY = mouseY;
            circleCursorRadius = radius;

            scope.ctx_color.arc(mouseX, mouseY, radius, 0, 2 * Math.PI);

            // 외부 흰색 테두리 그리기
            scope.ctx_color.strokeStyle = outerStrokeColor;
            scope.ctx_color.lineWidth = 4;
            scope.ctx_color.stroke();

            // 내부 검은색 테두리 그리기
            scope.ctx_color.strokeStyle = innerStrokeColor;
            scope.ctx_color.lineWidth = 2;
            scope.ctx_color.stroke();

            // 원 내부를 채우기 위한 코드 
            scope.ctx_color.fillStyle = 'rgba(0, 0, 0, 0)';
            scope.ctx_color.fill();

            scope.ctx_color.closePath();
        }


        this.SetColor = function(color) {
            let pos = getPositionFromColor([color.r, color.g, color.b]);

            let colorPreview = document.getElementById(view.GetViewID() + 'colorPreview');
            colorPreview.style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.glAlpha()})`;
            colorPreview.style.borderColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.glAlpha()})`;

            createColorToBlackGradient(color);

            let mouseX = undefined;
            let mouseY = undefined;

            if(pos === null){
                mouseX = 0;
                mouseY = 0;
            } else {
                mouseX = pos[0];
                mouseY = pos[1];
            }

            // 이전에 그린 원 지움
            clearCanvas(CanvasType.Color);

            // drawCircleAtCursor(mouseX, mouseY);

            pickCanvasColor = color;

            // drawRectangleAtCursor(5);

            updateSliderBackground(color);
            setPickColor(color);

        };


        // 선택한 색상 설정하기
        function setPickColor(color) {
            pickColor = color;
        }

        // 선택한 색상 가져오기
        function getPickColor(color) {
            return pickColor;
        }

        this.GetPickColor = function () {
            return pickColor;
        };

        // 선택 개체 색상 설정하기
        function applyColor() {
            if (pickColor !== undefined) {
                let selObjects = view.Interface.Object3D.GetSelectedObject3D();
                //action color

                let selectColor = new VIZCore.Color();
                selectColor = getPickColor();

                view.Interface.Object3D.Color.SetColorByNodeID(selObjects, selectColor);
            }
        };

        this.Init = function () {

            initColorPicker();
        };

    }
}

export default ColorPicker;