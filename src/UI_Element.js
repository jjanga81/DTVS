import DockPanel from "./UI_DockPanel.js";
import RibbonBar from "./UI_RibbonBar.js";
import ConfigPanel from "./ConfigPanel.js";
import ReviewPanel from "./ReviewPanel.js";
import Toolbar from "./Toolbar.js";
import StatusBar from "./UI_StatusBar.js";
import Message from "./Message.js";

class UI_Element {
    constructor(vizcore, VIZCore) {
        let view = document.getElementById(vizcore.Main.GetViewID());
        let scope = this;

        this.Color = {
            OneColor: "rgb(68, 68, 68)",
            TwoColor: "rgb(80, 80, 80)",
        }

        // Drawer Type -> 밖으로 도출?
        this.Type = 3; // 0: Overlay, 1: Push, 2: Overlay Drawer, 3: Push Drawer

        // RibbonBar, DockPanel 참조
        this.Ribbon = undefined;
        this.DockPanel = undefined;

        // this.Toolbar = undefined;

        let statusbar = undefined;
        let toolbar = undefined;
        let message = undefined;

        let noteType = undefined;

        let reviewPanel = undefined;
        let reviewPanelTab = undefined;

        let controlMode = vizcore.Configuration.Control.Version; // 초기 컨트롤 모드 저장

        this.Element = {
            RibbonBar: {
                Tab: undefined,
                Content: undefined,
                Button: undefined
            },
            LeftView: {
                Drop: undefined,
                Tab: undefined,
                Content: undefined,
                Button: undefined,
                Resize: undefined
            },
            RightView: {
                Top: {
                    Tab: undefined,
                    Content: undefined,
                    Resize: undefined
                },
                Bottom: {
                    Tab: undefined,
                    Content: undefined,
                    Resize: undefined
                },
                Button: undefined,
                ResizeHor: undefined,
                ResizeVer: undefined
            },
            BottomView: {
                Drop: undefined,
                Tab: undefined,
                Content: undefined,
                Button: undefined,
                Resize: undefined
            },
            StatusBar: undefined,
            Note: {
                Title: undefined,
                TextArea: undefined,
                Button_OK: undefined,
                Button_Surface: undefined
            },
        };

        this.Enum = {
            OBJECT_TYPE : {
                TAB : 0,
                GROUP : 1,
                BUTTON :2,
            },
            OBJECT_SIZE : {
                SMALL: 0,
                LARGE: 1,
                ALL : 2,    //small, large
            },
            BUTTON_STYLE :{
                NORMAL: 0,
                CHECK: 1,
                COMBO: 2,
                CUSTOM: 3
            },
            STATUS_TYPE: {
                NORMAL: 0,
                INFO: 1,
                WARNING: 2,
            },
            TOOLBAR_POS: {
                LEFT: 0,
                TOP: 1,
                RIGHT: 2,
                BOTTOM: 3,
            },
            UI_TYPE: {
                RIBBONBAR: 0,
                TOOLBAR: 1,
            },
            THEME_TYPE: {
                LIGHT: 0,
                DARK: 1,
                LIGHT_ORANGE: 2,
                DARK_ORANGE:3
            },
            EXPAND_BUTTON_POS: {
                LEFT: 0,
                CENTER: 1,
                RIGHT: 2,
            },

        };


        this.DragData = {
            Left: "350px",
            Right: "350px",
            Bottom: "350px"
        }

        function initElement() {
            topElement();
            dockPanelElement();
            statusBarElement();    // status bar
        }

        function dockPanelElement() {
            leftElement();
            rightElement();
            bottomElement();
        }

        function topElement() {
            let top_view = document.createElement('div');
            top_view.id = "SH_tab_view_top";
            top_view.className = "VIZWeb SH_tab_view SH_tab_view_top";
            // if (scope.Type === 1) {
            view.parentNode.appendChild(top_view);
            // } else {
            //     view.appendChild(top_view);
            // }

            let top_view_element = document.createElement('div');
            top_view_element.id = "SH_ribbon_div";
            top_view_element.className = "VIZWeb SH_ribbon SH_ribbon_div SH_ribbon_font_small SH_block";
            top_view.appendChild(top_view_element);

            scope.Element.RibbonBar = top_view_element;

            top_view_element.addEventListener('contextmenu', function (e) {
                e.preventDefault();
            });

            let top_tab_element = document.createElement('div');
            top_tab_element.id = "SH_ribbon_side_div";
            top_tab_element.className = "VIZWeb SH_ribbon_side_div";
            top_view_element.appendChild(top_tab_element);

            scope.Element.RibbonBar.Tab = top_tab_element;

            let top_content_element = document.createElement('div');
            top_content_element.id = "SH_ribbon_content_div";
            top_content_element.className = "VIZWeb SH_tab_div SH_ribbon_content_div";
            top_view_element.appendChild(top_content_element);

            scope.Element.RibbonBar.Content = top_content_element;

            let top_risize_button_element = document.createElement('div');
            top_risize_button_element.id = "SH_ribbon_resize_button";
            top_risize_button_element.className = "VIZWeb SH_view_resize_button SH_ribbon_resize_button";
            top_risize_button_element.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAbrAAAG6wFMMZ5KAAAApElEQVQ4je3UsQ3CQAxA0R+UPiOwAiPQuGeDMBrZgN5NRmCVTHAoyImSI5zvRDpwcYVlP1mWdVUIgT3jsKv2m2A9PiJyAu7ARVUfJUDcO014BY5AbwUlWG+9o8F8NiJyA1pgAM7epAusATpVfYHzDi3RWUFy0k8Y8dnkoCnsDfRQD1vtcGOS1U4tncSS4AaKh7lghOJhWeACxcOywZL4f19fBvAEgzJii/2qZnYAAAAASUVORK5CYII=" style="position : absolute; transform: rotate(180deg); width: 15px;" />';
            view.appendChild(top_risize_button_element);

            scope.Element.RibbonBar.Button = top_risize_button_element;

            top_risize_button_element.addEventListener("contextmenu", function (e) {
                e.preventDefault();
            });

            const top_view_element_resize_event = new ResizeObserver(entries => {
                cbResizeAll();
            });
            top_view_element_resize_event.observe(scope.Element.RibbonBar);

            // tab 까지만 보이게
            scope.Element.RibbonBar.style.height = "135px";
            top_risize_button_element.addEventListener('click', function () {
                let ribbon_showhide_btn_img = document.getElementById("SH_ribbon_showhide_button");
                let img = top_risize_button_element.childNodes[0];
                if (scope.Element.RibbonBar.classList.contains('SH_none')) {
                    scope.Element.RibbonBar.style.height = "135px";
                    scope.Element.RibbonBar.classList.replace("SH_none", "SH_block");
                    scope.Element.RibbonBar.Content.style = "block";
                    img.style.transform = "rotate(180deg)";
                    ribbon_showhide_btn_img.style.transform = "rotate(180deg)"; //ribbon_showhide_btn도 동일하게 icon 회전 맞춤
                } else if(scope.Element.RibbonBar.classList.contains('SH_block')) {
                    scope.Element.RibbonBar.style.height = "0px";
                    scope.Element.RibbonBar.classList.replace("SH_block", "SH_none");
                    scope.Element.RibbonBar.Content.style = "none";
                    img.style.transform = "";
                    ribbon_showhide_btn_img.style.transform = ""; //ribbon_showhide_btn도 동일하게 icon 회전 맞춤
                }
            });
        }

        function statusBarElement() {
            // bottom
            let bottom_view = document.createElement('div');
            bottom_view.id = "SH_statusbar";
            bottom_view.className = "VIZWeb SH_statusbar";
            view.parentNode.appendChild(bottom_view);

            let bottom_view_element = document.createElement('div');
            bottom_view_element.id = "SH_statusbar_div";
            bottom_view_element.className = "VIZWeb SH_dock_panel_div SH_statusbar_div";
            bottom_view.appendChild(bottom_view_element);

            scope.Element.StatusBar = bottom_view_element;

            const resize_event = new ResizeObserver(entries => {
                cbResizeAll();
            });
            resize_event.observe(scope.Element.StatusBar);
        }

        function leftElement() {
            // left
            // let left_view = document.createElement('div');
            // left_view.id = "SH_tab_view_left";
            // left_view.className = "VIZWeb SH_tab_view SH_tab_view_left";
            // view.appendChild(left_view);

            // scope.Element.LeftView.Drop = left_view;

            let left_view_element = document.createElement('div');
            left_view_element.id = "SH_dock_panel_left";
            left_view_element.className = "VIZWeb SH_dock_panel SH_dock_panel_left";
            if (scope.Type === 1 || scope.Type === 3) {
                view.parentNode.appendChild(left_view_element);
            } else {
                view.appendChild(left_view_element);
            }

            scope.Element.LeftView = left_view_element;

            let left_tab_element = document.createElement('div');
            left_tab_element.id = "SH_tab_side_div_left";
            left_tab_element.className = "VIZWeb SH_dock_panel_side_div SH_dock_panel_side_div_left";
            left_view_element.appendChild(left_tab_element);

            scope.Element.LeftView.Tab = left_tab_element;

            left_tab_element.addEventListener("contextmenu", function (e) {
                e.preventDefault();
            });

            let left_content_element = document.createElement('div');
            left_content_element.id = "SH_tab_div_left";
            left_content_element.className = "VIZWeb SH_dock_panel_content_div SH_dock_panel_content_div_left";
            left_view_element.appendChild(left_content_element);

            scope.Element.LeftView.Content = left_content_element;

            left_content_element.addEventListener("contextmenu", function (e) {
                e.preventDefault();
            });

            let left_resize_button_element = document.createElement('div');
            left_resize_button_element.id = "SH_tab_resize_button_left";
            left_resize_button_element.className = "VIZWeb SH_view_resize_button SH_tab_resize_button_left";
            left_resize_button_element.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAbrAAAG6wFMMZ5KAAAApElEQVQ4je3UsQ3CQAxA0R+UPiOwAiPQuGeDMBrZgN5NRmCVTHAoyImSI5zvRDpwcYVlP1mWdVUIgT3jsKv2m2A9PiJyAu7ARVUfJUDcO014BY5AbwUlWG+9o8F8NiJyA1pgAM7epAusATpVfYHzDi3RWUFy0k8Y8dnkoCnsDfRQD1vtcGOS1U4tncSS4AaKh7lghOJhWeACxcOywZL4f19fBvAEgzJii/2qZnYAAAAASUVORK5CYII=" style="position : absolute; transform: rotate(-90deg); width: 15px; height: 15px; " />';
            left_view_element.appendChild(left_resize_button_element);

            scope.Element.LeftView.Button = left_resize_button_element;

            // tab 까지만 보이게
            left_resize_button_element.addEventListener('click', function () {
                let img = left_resize_button_element.childNodes[0];
                if (scope.Element.LeftView.style.width === "0px" || scope.Element.LeftView.style.width === "" || scope.Element.LeftView.style.width === "350px") {
                    scope.Element.LeftView.style.width = "37px";
                    img.style.transform = "rotate(90deg)";
                    left_resize_button_element.className = "VIZWeb SH_view_resize_button SH_tab_resize_button_left_in";
                } else {
                    scope.Element.LeftView.style.width = "0px";
                    img.style.transform = "rotate(-90deg)";
                    left_resize_button_element.className = "VIZWeb SH_view_resize_button SH_tab_resize_button_left";
                }
                scope.Element.LeftView.Content.style.display = "none";
            });

            const left_view_element_resize_event = new ResizeObserver(entries => {
                cbResizeAll();
            });
            left_view_element_resize_event.observe(scope.Element.LeftView);

            if (scope.Type === 2 || scope.Type === 3) {

                let left_view_resize = document.createElement('div');
                left_view_resize.className = "VIZWeb SH_resize_horizontal";
                if (scope.Type === 1 || scope.Type === 3) {
                    view.parentNode.appendChild(left_view_resize);
                } else {
                    view.appendChild(left_view_resize);
                }

                scope.Element.LeftView.Resize = left_view_resize;

                left_resize_button_element.style.display = "none";

                resizeHorizontal(scope.Element.LeftView.Resize);
            }
        }

        function rightElement() {
            let right_view_element = document.createElement('div');
            right_view_element.id = "SH_dock_panel_right";
            right_view_element.className = "VIZWeb SH_dock_panel SH_dock_panel_right";
            if (scope.Type === 1 || scope.Type === 3) {
                view.parentNode.appendChild(right_view_element);
            } else {
                view.appendChild(right_view_element);
            }

            scope.Element.RightView = right_view_element;

            // Top
            let right_view_element_top = document.createElement('div');
            right_view_element_top.className = "VIZWeb SH_dock_panel_right_top";
            right_view_element.appendChild(right_view_element_top);

            scope.Element.RightView.Top = right_view_element_top;

            right_view_element_top.addEventListener('contextmenu', function (e) {
                e.preventDefault();
            });

            let right_side_element_top = document.createElement('div');
            right_side_element_top.id = "SH_dock_panel_side_div_right";
            right_side_element_top.className = "VIZWeb SH_dock_panel_side_div SH_dock_panel_side_div_right";
            right_view_element_top.appendChild(right_side_element_top);

            scope.Element.RightView.Top.Tab = right_side_element_top;

            let right_content_element_top = document.createElement('div');
            right_content_element_top.id = "SH_dock_panel_content_div_right";
            right_content_element_top.className = "VIZWeb SH_dock_panel_content_div SH_dock_panel_content_div_right";
            right_view_element_top.appendChild(right_content_element_top);

            scope.Element.RightView.Top.Content = right_content_element_top;

            // Bottom
            let right_view_element_bottom = document.createElement('div');
            right_view_element_bottom.className = "VIZWeb SH_dock_panel_right_bottom";
            right_view_element.appendChild(right_view_element_bottom);

            scope.Element.RightView.Bottom = right_view_element_bottom;

            let right_side_element_bottom = document.createElement('div');
            right_side_element_bottom.id = "SH_dock_panel_side_div_right";
            right_side_element_bottom.className = "VIZWeb SH_dock_panel_side_div SH_dock_panel_side_div_right";
            right_view_element_bottom.appendChild(right_side_element_bottom);

            scope.Element.RightView.Bottom.Tab = right_side_element_bottom;

            let right_content_element_bottom = document.createElement('div');
            right_content_element_bottom.id = "SH_dock_panel_content_div_right";
            right_content_element_bottom.className = "VIZWeb SH_dock_panel_content_div SH_dock_panel_content_div_right";
            right_view_element_bottom.appendChild(right_content_element_bottom);

            scope.Element.RightView.Bottom.Content = right_content_element_bottom;

            let right_risize_button_element = document.createElement('div');
            right_risize_button_element.id = "SH_tab_resize_button_right";
            right_risize_button_element.className = "VIZWeb SH_view_resize_button SH_tab_resize_button_right";
            right_risize_button_element.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAbrAAAG6wFMMZ5KAAAApElEQVQ4je3UsQ3CQAxA0R+UPiOwAiPQuGeDMBrZgN5NRmCVTHAoyImSI5zvRDpwcYVlP1mWdVUIgT3jsKv2m2A9PiJyAu7ARVUfJUDcO014BY5AbwUlWG+9o8F8NiJyA1pgAM7epAusATpVfYHzDi3RWUFy0k8Y8dnkoCnsDfRQD1vtcGOS1U4tncSS4AaKh7lghOJhWeACxcOywZL4f19fBvAEgzJii/2qZnYAAAAASUVORK5CYII=" style="position: absolute; transform: rotate(90deg); width: 15px; height: 15px;" />';
            right_view_element.appendChild(right_risize_button_element);

            scope.Element.RightView.Button = right_risize_button_element;

            const right_view_element_resize_event = new ResizeObserver(entries => {
                cbResizeAll();
            });
            right_view_element_resize_event.observe(scope.Element.RightView);

            // tab 까지만 보이게
            right_risize_button_element.addEventListener('click', function () {
                let img = right_risize_button_element.childNodes[0];
                if (scope.Element.RightView.style.width === "0px" || scope.Element.RightView.style.width === "" || scope.Element.RightView.style.width === "350px") {
                    scope.Element.RightView.style.width = "37px";
                    right_risize_button_element.className = "VIZWeb SH_view_resize_button SH_tab_resize_button_right_in";
                    img.style.transform = "rotate(-90deg)";
                } else {
                    scope.Element.RightView.style.width = "0px";
                    img.style.transform = "rotate(90deg)";
                    right_risize_button_element.className = "VIZWeb SH_view_resize_button SH_tab_resize_button_right";
                }

                // scope.Element.RightView.Content.style.display = "none";
            });

            // Resize
            if (scope.Type === 2 || scope.Type === 3) {
                let right_view_resize = document.createElement('div');
                right_view_resize.className = "VIZWeb SH_resize_horizontal SH_resize_horizontal_right";
                if (scope.Type === 1 || scope.Type === 3) {
                    view.parentNode.appendChild(right_view_resize);
                } else {
                    view.appendChild(right_view_resize);
                }

                scope.Element.RightView.ResizeHor = right_view_resize;

                right_risize_button_element.style.display = "none";

                resizeHorizontal(scope.Element.RightView.ResizeHor);

                let right_view_resize_ver = document.createElement('div');
                right_view_resize_ver.className = "VIZWeb SH_resize_vertical";
                scope.Element.RightView.appendChild(right_view_resize_ver);

                scope.Element.RightView.ResizeVer = right_view_resize_ver;

                resizeVerticalRight(scope.Element.RightView.ResizeVer);
            }
        }

        function bottomElement() {
            let bottom_view_element = document.createElement('div');
            bottom_view_element.id = "SH_dock_panel_bottom";
            bottom_view_element.className = "VIZWeb SH_dock_panel SH_dock_panel_bottom";
            if (scope.Type === 1 || scope.Type === 3) {
                view.parentNode.appendChild(bottom_view_element);
            } else {
                view.appendChild(bottom_view_element);
            }

            scope.Element.BottomView = bottom_view_element;

            let bottom_tab_element = document.createElement('div');
            bottom_tab_element.id = "SH_dock_panel_side_div_bottom";
            bottom_tab_element.className = "VIZWeb SH_dock_panel_side_div SH_dock_panel_side_div_bottom";
            bottom_view_element.appendChild(bottom_tab_element);

            scope.Element.BottomView.Tab = bottom_tab_element;

            bottom_tab_element.addEventListener("contextmenu", function (e) {
                e.preventDefault();
            });

            let bottom_content_element = document.createElement('div');
            bottom_content_element.id = "SH_dock_panel_content_div_bottom";
            bottom_content_element.className = "VIZWeb SH_dock_panel_content_div SH_dock_panel_content_div_bottom";
            bottom_view_element.appendChild(bottom_content_element);

            scope.Element.BottomView.Content = bottom_content_element;

            bottom_content_element.addEventListener("contextmenu", function (e) {
                e.preventDefault();
            });

            let bottom_resize_button_element = document.createElement('div');
            bottom_resize_button_element.id = "SH_tab_resize_button_bottom";
            bottom_resize_button_element.className = "VIZWeb SH_view_resize_button SH_tab_resize_button_bottom";
            bottom_resize_button_element.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAbrAAAG6wFMMZ5KAAAApElEQVQ4je3UsQ3CQAxA0R+UPiOwAiPQuGeDMBrZgN5NRmCVTHAoyImSI5zvRDpwcYVlP1mWdVUIgT3jsKv2m2A9PiJyAu7ARVUfJUDcO014BY5AbwUlWG+9o8F8NiJyA1pgAM7epAusATpVfYHzDi3RWUFy0k8Y8dnkoCnsDfRQD1vtcGOS1U4tncSS4AaKh7lghOJhWeACxcOywZL4f19fBvAEgzJii/2qZnYAAAAASUVORK5CYII=" style="position : absolute; width: 15px; height: 15px; " />';
            bottom_view_element.appendChild(bottom_resize_button_element);

            scope.Element.BottomView.Button = bottom_resize_button_element;

            // tab 까지만 보이게
            bottom_resize_button_element.addEventListener('click', function () {
                let img = bottom_resize_button_element.childNodes[0];
                if (scope.Element.BottomView.style.height === "0px" || scope.Element.BottomView.style.height === "" || scope.Element.BottomView.style.height === "350px") {
                    scope.Element.BottomView.style.height = "37px";
                    img.style.transform = "rotate(0deg)";
                    bottom_resize_button_element.className = "VIZWeb SH_view_resize_button SH_tab_resize_button_bottom_in";
                } else {
                    scope.Element.BottomView.style.height = "0px";
                    img.style.transform = "rotate(180deg)";
                    bottom_resize_button_element.className = "VIZWeb SH_view_resize_button SH_tab_resize_button_bottom";
                }
                scope.Element.BottomView.Content.style.display = "none";
            });

            const bottom_view_element_resize_event = new ResizeObserver(entries => {
                cbResizeAll();
            });
            bottom_view_element_resize_event.observe(scope.Element.BottomView);

            if (scope.Type === 2 || scope.Type === 3) {

                let bottom_view_resize = document.createElement('div');
                bottom_view_resize.className = "VIZWeb SH_resize_horizontal SH_resize_horizontal_bottom";
                if (scope.Type === 1 || scope.Type === 3) {
                    view.parentNode.appendChild(bottom_view_resize);
                } else {
                    view.appendChild(bottom_view_resize);
                }

                scope.Element.BottomView.Resize = bottom_view_resize;

                bottom_resize_button_element.style.display = "none";

                resizeVertical(scope.Element.BottomView.Resize);
            }
        }

        // View 크기 변경 시 이벤트
        // 프레임이 사용자에게 표시되기 전 크기 조정 이벤트를 호출 -> 많은 이벤트 호출....
        // Resize 여러번 호출 되면서 검정화면 발생...
        const view_element_resize_event = new ResizeObserver(entries => {
            setTimeout(()=>{
                vizcore.Main.Resize();
            }, 0);
            // vizcore.View.ResizeGLWindow();
            //vizcore.Render();
            // console.log("VIEWRESIZE")

        });
        view_element_resize_event.observe(view);
        // view_element_resize_event.unobserve(view);

        // 크기 조절 시
        let cbResizeAll = function () {
            let mainView = view;
            let statusBar = scope.Element.StatusBar;
            let topView = scope.Element.RibbonBar;
            let leftView = scope.Element.LeftView;
            let rightView = scope.Element.RightView;
            let bottomView = scope.Element.BottomView;
            let multiView = document.getElementById(vizcore.Main.GetViewID() + "MultiView");
            let dockPanel = scope.DockPanel;

            if (scope.Type === 1 || scope.Type === 3) {
                leftView.style.height = "calc(100% - " + (topView.offsetHeight + statusBar.offsetHeight + bottomView.offsetHeight) + "px)";
                leftView.style.top = topView.offsetHeight + "px";

                rightView.style.height = "calc(100% - " + (topView.offsetHeight + statusBar.offsetHeight + bottomView.offsetHeight) + "px)";
                rightView.style.top = topView.offsetHeight + "px";

                mainView.style.top = topView.offsetHeight + "px";
                mainView.style.height = "calc(100% - " + (topView.offsetHeight + bottomView.offsetHeight + statusBar.offsetHeight) + "px)";
                mainView.style.left = leftView.offsetWidth + "px";

                if(multiView !== null){
                    let viewsize = (mainView.offsetWidth + multiView.offsetWidth) / 2;

                    if (multiView.offsetWidth === 0) {
                        mainView.style.width = "calc(100% - " + (leftView.offsetWidth + rightView.offsetWidth) + "px)";
                        if (dockPanel) {
                            mainView.appendChild(dockPanel.Tab.Right.Dock);
                            mainView.appendChild(dockPanel.Tab.Right.Dock.Element);
                        }
                    } else {
                        mainView.style.width = "calc(100% - " + (leftView.offsetWidth + rightView.offsetWidth + viewsize) + "px)";
                        if (dockPanel) {
                            multiView.appendChild(dockPanel.Tab.Right.Dock);
                            multiView.appendChild(dockPanel.Tab.Right.Dock.Element);
                        }
                    }
    
                    multiView.style.top = topView.offsetHeight + "px";
                    multiView.style.height = "calc(100% - " + (topView.offsetHeight + bottomView.offsetHeight + statusBar.offsetHeight) + "px)";
                    multiView.style.left = (mainView.offsetWidth + leftView.offsetWidth) + "px";
                    multiView.style.width = "calc(100% - " + (leftView.offsetWidth + rightView.offsetWidth + mainView.offsetWidth) + "px)";
                } else {
                    mainView.style.width = "calc(100% - " + (leftView.offsetWidth + rightView.offsetWidth) + "px)";
                }

                topView.style.top = "0px";

                bottomView.style.bottom = statusBar.offsetHeight + "px";

                if (scope.Element.LeftView.Resize) {
                    scope.Element.LeftView.Resize.style.top = topView.offsetHeight + "px";
                    scope.Element.LeftView.Resize.style.height = "calc(100% - " + (topView.offsetHeight + statusBar.offsetHeight + bottomView.offsetHeight) + "px)";
                }

                if (scope.Element.RightView.ResizeHor) {
                    scope.Element.RightView.ResizeHor.style.top = topView.offsetHeight + "px";
                    scope.Element.RightView.ResizeHor.style.height = "calc(100% - " + (topView.offsetHeight + statusBar.offsetHeight + bottomView.offsetHeight) + "px)";
                }

                if (scope.Element.BottomView.Resize) {
                    scope.Element.BottomView.Resize.style.bottom = (bottomView.offsetHeight + statusBar.offsetHeight) + "px";
                }
            } else {
                leftView.style.height = "calc(100% - " + (bottomView.offsetHeight) + "px)";

                rightView.style.height = "calc(100% - " + (bottomView.offsetHeight) + "px)";

                if (multiView !== null) {
                    // 멀티 뷰인 경우 오른쪽 패널 멀티 뷰로 생성
                    if (multiView.offsetWidth !== 0) {
                        multiView.appendChild(rightView);

                        if (dockPanel) {
                            multiView.appendChild(dockPanel.Tab.Right.Dock);
                            multiView.appendChild(dockPanel.Tab.Right.Dock.Element);
                        }
                    } else {
                        mainView.appendChild(rightView);

                        if (dockPanel) {
                            mainView.appendChild(dockPanel.Tab.Right.Dock);
                            mainView.appendChild(dockPanel.Tab.Right.Dock.Element);
                        }
                    }

                    if (scope.Element.RightView.ResizeHor) {
                        // 멀티 뷰인 경우 오른쪽 Resizer 멀티 뷰로 생성
                        if (multiView.offsetWidth !== 0) {
                            multiView.appendChild(scope.Element.RightView.ResizeHor);
                        } else {
                            mainView.appendChild(scope.Element.RightView.ResizeHor);
                        }
                    }

                    multiView.style.top = topView.offsetHeight + "px";
                    multiView.style.height = "calc(100% - " + (topView.offsetHeight + statusBar.offsetHeight) + "px)";
                } else {
                    mainView.appendChild(rightView);

                    if (dockPanel) {
                        mainView.appendChild(dockPanel.Tab.Right.Dock);
                        mainView.appendChild(dockPanel.Tab.Right.Dock.Element);
                    }

                    if (scope.Element.RightView.ResizeHor) {
                        mainView.appendChild(scope.Element.RightView.ResizeHor);
                    }
                }

                mainView.style.top = topView.offsetHeight + "px";
                mainView.style.height = "calc(100% - " + (topView.offsetHeight + statusBar.offsetHeight) + "px)";

                if (scope.Element.LeftView.Resize) {
                    scope.Element.LeftView.Resize.style.top = "0px";
                    scope.Element.LeftView.Resize.style.height = "calc(100% - " + (bottomView.offsetHeight) + "px)";
                }

                if (scope.Element.RightView.ResizeHor) {
                    scope.Element.RightView.ResizeHor.style.top = "0px";
                    scope.Element.RightView.ResizeHor.style.height = "calc(100% - " + (bottomView.offsetHeight) + "px)";
                }
            }

            // vizcore.Main.Resize();
            // vizcore.View.ResizeGLWindow();
            // vizcore.Render();
        };

        // Resize 시
        let resizeHorizontal = function (resizer) {
            const prevSibling = resizer.previousElementSibling;

            //  마우스의 위치값 저장을 위해 선언
            let x = 0;
            let prevSiblingWidth = 0;

            // resizer에 마우스 이벤트가 발생하면 실행하는 Handler
            const mouseDownHandler = function (e) {
                // 마우스 위치값을 가져와 할당
                x = e.clientX;
                // 대상 Element에 위치 정보를 가져옴
                const rect = prevSibling.getBoundingClientRect();
                // 기존 너비 할당
                prevSiblingWidth = rect.width;

                // 마우스 이동과 해제 이벤트를 등록
                document.addEventListener("mousemove", mouseMoveHandler);
                document.addEventListener("mouseup", mouseUpHandler);
            };

            const mouseMoveHandler = function (e) {
                // 마우스가 움직이면 기존 초기 마우스 위치에서 현재 위치값과의 차이를 계산
                const dx = e.clientX - x;

                // 기본 동작은 동일하게 기존 크기에 마우스 드래그 거리를 더한 뒤 상위요소(container)를 이용해 퍼센티지를 구함
                const rect = prevSibling.getBoundingClientRect();
                if (resizer === scope.Element.LeftView.Resize) {
                    let w = ((prevSiblingWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;

                    if (w < 0) {
                        w = 0;
                    }

                    resizer.style.left = `${w}%`;

                    scope.DragData.Left = resizer.style.left;
                } else {
                    let w = ((prevSiblingWidth - dx) * 100) / resizer.parentNode.getBoundingClientRect().width;

                    if (w < 0) {
                        w = 0;
                    }

                    resizer.style.right = `${w}%`;

                    scope.DragData.Right = resizer.style.right;
                }

                prevSibling.style.userSelect = "none";
                prevSibling.style.pointerEvents = "none";

                // vizcore.Main.Resize();
            };

            const mouseUpHandler = function () {
                prevSibling.style.removeProperty("user-select");
                prevSibling.style.removeProperty("pointer-events");


                if (resizer === scope.Element.LeftView.Resize) {
                    prevSibling.style.width = resizer.style.left;

                    const rect = prevSibling.getBoundingClientRect();

                    if (rect.width > 47) {
                        scope.Element.LeftView.Content.style.display = "block";
                    } else {
                        scope.Element.LeftView.Content.style.display = "none";
                    }

                } else {
                    prevSibling.style.width = resizer.style.right;

                    const rect = prevSibling.getBoundingClientRect();

                    if (rect.width > 47) {
                        scope.Element.RightView.Top.Content.style.display = "block";
                        scope.Element.RightView.Bottom.Content.style.display = "block";
                    } else {
                        scope.Element.RightView.Top.Content.style.display = "none";
                        scope.Element.RightView.Bottom.Content.style.display = "none";
                    }
                }

                vizcore.Main.Tree.Resize();
                vizcore.Main.PropertyTree.Resize();
                vizcore.Main.MiniView.Resize();

                document.removeEventListener("mousemove", mouseMoveHandler);
                document.removeEventListener("mouseup", mouseUpHandler);
            };

            resizer.addEventListener("mousedown", mouseDownHandler);
        };

        let resizeVertical = function (resizer) {
            const prevSibling = resizer.previousElementSibling;

            //  마우스의 위치값 저장을 위해 선언
            let y = 0;
            let prevSiblingHeight = 0;

            const mouseDownHandler = function (e) {
                // 마우스 위치값을 가져와 할당
                y = e.clientY;
                // 대상 Element에 위치 정보를 가져옴
                const rect = prevSibling.getBoundingClientRect();
                // 기존 높이 할당
                if (scope.Type === 2) {
                    prevSiblingHeight = rect.height;
                } else {
                    prevSiblingHeight = rect.height + 30;
                }
                // 마우스 이동과 해제 이벤트를 등록
                document.addEventListener("mousemove", mouseMoveHandler);
                document.addEventListener("mouseup", mouseUpHandler);
            };

            const mouseMoveHandler = function (e) {
                // 마우스가 움직이면 기존 초기 마우스 위치에서 현재 위치값과의 차이를 계산
                const dy = e.clientY - y;

                let h = ((prevSiblingHeight - dy) * 100) / resizer.parentNode.getBoundingClientRect().height;

                if (h < 2) {
                    h = 2;
                }

                resizer.style.bottom = `${h}%`;

                scope.DragData.Bottom = resizer.style.bottom;

                prevSibling.style.userSelect = "none";
                prevSibling.style.pointerEvents = "none";

                vizcore.Main.Tree.Resize();
                vizcore.Main.PropertyTree.Resize();
                vizcore.Main.MiniView.Resize();

                vizcore.Main.Resize();
            };

            const mouseUpHandler = function () {
                prevSibling.style.removeProperty("user-select");
                prevSibling.style.removeProperty("pointer-events");

                if (scope.Type === 3) {
                    prevSibling.style.height = "calc( " + resizer.style.bottom + " - 30px)";
                } else {
                    prevSibling.style.height = resizer.style.bottom;
                }

                const rect = prevSibling.getBoundingClientRect();
                if (rect.height > 47) {
                    scope.Element.BottomView.Content.style.display = "block";
                } else {
                    scope.Element.BottomView.Content.style.display = "none";
                }

                document.removeEventListener("mousemove", mouseMoveHandler);
                document.removeEventListener("mouseup", mouseUpHandler);
            };

            resizer.addEventListener("mousedown", mouseDownHandler);
        }

        // Right Top/Bottom
        let resizeVerticalRight = function (resizer) {
            const prevSibling = scope.Element.RightView.Top;
            const nextSibling = scope.Element.RightView.Bottom;

            //  마우스의 위치값 저장을 위해 선언
            let x = 0;
            let y = 0;
            let prevSiblingHeight = 0;
            let prevSiblingWidth = 0;

            // resizer에 마우스 이벤트가 발생하면 실행하는 Handler
            const mouseDownHandler = function (e) {
                // 마우스 위치값을 가져와 x, y에 할당
                x = e.clientX;
                y = e.clientY;
                // 대상 Element에 위치 정보를 가져옴
                const rect = prevSibling.getBoundingClientRect();
                // 기존 높이와 너비를 각각 할당함
                prevSiblingHeight = rect.height;
                prevSiblingWidth = rect.width;

                // 마우스 이동과 해제 이벤트를 등록
                document.addEventListener("mousemove", mouseMoveHandler);
                document.addEventListener("mouseup", mouseUpHandler);
            };

            const mouseMoveHandler = function (e) {
                // 마우스가 움직이면 기존 초기 마우스 위치에서 현재 위치값과의 차이를 계산
                const dy = e.clientY - y;

                const h =
                    ((prevSiblingHeight + dy) * 100) /
                    resizer.parentNode.getBoundingClientRect().height;
                prevSibling.style.height = `${h}%`;

                resizer.style.top = `${h}%`;

                nextSibling.style.height = (100 - h) + "%";
                nextSibling.style.top = `${h}%`;

                prevSibling.style.userSelect = "none";
                prevSibling.style.pointerEvents = "none";

                nextSibling.style.userSelect = "none";
                nextSibling.style.pointerEvents = "none";

                vizcore.Main.Tree.Resize();
                vizcore.Main.PropertyTree.Resize();
                vizcore.Main.MiniView.Resize();
            };

            const mouseUpHandler = function () {
                prevSibling.style.removeProperty("user-select");
                prevSibling.style.removeProperty("pointer-events");

                nextSibling.style.removeProperty("user-select");
                nextSibling.style.removeProperty("pointer-events");

                // 등록한 마우스 이벤트를 제거
                document.removeEventListener("mousemove", mouseMoveHandler);
                document.removeEventListener("mouseup", mouseUpHandler);
            };

            // 마우스 down 이벤트를 등록
            resizer.addEventListener("mousedown", mouseDownHandler);
        };

        // Note Element 생성
        function noteElement() {
            let note_element = document.createElement('div');
            note_element.className = "VIZWeb SH_note_div";
            view.appendChild(note_element);

            scope.Element.Note = note_element;

            let note_title_element = document.createElement('div');
            note_title_element.className = "VIZWeb SH_note_title_div";
            note_element.appendChild(note_title_element);

            let note_title_text = document.createElement('div');
            note_title_text.className = "VIZWeb SH_note_title_text SH_title_text";
            note_title_text.innerText = "Surface Note";
            note_title_element.appendChild(note_title_text);

            scope.Element.Note.Title = note_title_text;

            let note_title_button = document.createElement('div');
            note_title_button.className = "VIZWeb SH_note_title_button SH_title_button SH_x_icon";
            note_title_element.appendChild(note_title_button);

            note_title_button.addEventListener('click', function () {
                note_element.style.display = "none";

                //Text 초기화
                note_element.TextArea.value = "";
            });

            let note_content_element = document.createElement('div');
            note_content_element.className = "VIZWeb SH_note_content_div";
            note_element.appendChild(note_content_element);

            let note_content_textarea = document.createElement('textarea');
            note_content_textarea.className = "VIZWeb SH_note_content_textarea";
            note_content_textarea.placeholder = "Text...";
            note_content_element.appendChild(note_content_textarea);

            scope.Element.Note.TextArea = note_content_textarea;

            let note_content_ok_button = document.createElement('div');
            note_content_ok_button.className = "VIZWeb SH_note_content_button";
            note_content_ok_button.innerText = "OK";
            note_content_ok_button.style.width = "50px";
            note_content_element.appendChild(note_content_ok_button);

            note_content_ok_button.setAttribute("data-language", "TP0005");

            scope.Element.Note.Button_OK = note_content_ok_button;

            note_content_ok_button.addEventListener("click", function () {
                cbNoteButtonEvent();
            });

            let note_content_button = document.createElement('div');
            note_content_button.className = "VIZWeb SH_note_content_button";
            note_content_button.innerText = "Select Model";
            note_content_button.style.left = "70px";
            note_content_button.style.display = "none";
            note_content_element.appendChild(note_content_button);

            note_content_button.setAttribute("data-language", "NP0001")

            note_content_button.addEventListener("click", function () {
                scope.Element.Note.style.display = "none";
                vizcore.Review.Note.AddNoteSurface();

                //Text 초기화
                scope.Element.Note.TextArea.value = "";
            });

            scope.Element.Note.Button_Surface = note_content_button;
        }

        // review panel 열기
        function cbReviewPanel(bool) {
            let tab = scope.DockPanel;
            let ribbon = scope.Ribbon;

            let reviewPanelObject = scope.GetTabObjectByID("ReviewTab");

            if (bool) {
                if (tab.TabPanelMap.has(reviewPanelObject.id)) {
                    let panel = tab.TabPanelMap.get(reviewPanelObject.id);
                    panel.Show(true);
                } else {
                    let item = undefined;
                    tab.ItemsMap.forEach(element => {
                        if (element.id === reviewPanelObject.id) {
                            item = element;
                        }
                    });
                    if (!item) {
                        tab.AddTab(reviewPanelObject);
                        tab.SetActiveTab(reviewPanelObject.id, bool);
                    }
                }

                if (reviewPanelTab) {
                    reviewPanel.SetFocusTab(reviewPanelTab);
                }

                ribbon.SetCheckButtons(["MeasureReviewButton", "NoteReviewButton", "UserViewReviewButton", reviewPanelObject.id], true);
            } else {
                if (tab.TabPanelMap.has(reviewPanelObject.id)) {
                    let panel = tab.TabPanelMap.get(reviewPanelObject.id);
                    panel.Show(false);
                } else {
                    tab.DeleteTab(reviewPanelObject.id);
                }

                ribbon.SetCheckButtons(["MeasureReviewButton", "NoteReviewButton", "UserViewReviewButton", reviewPanelObject.id], false);
            }
        }

        let count = 22;
        let allMenuItems = [];
        allMenuItems.size = count;

        function home() {
            let ribbon = scope.Ribbon;
            let tab = scope.DockPanel;

            // ----------------------------------------------------------------------------------------------Panel
            // Model Tree
            let tree = tab.GetItemObject();
            tree.id = "ModelTreeTab";
            tree.title = "RB0001";
            tree.tooltip = "RB0001";
            tree.icon = 'SH_btn_icon_tree';
            tree.position = 0;
            tree.fix = false;
            tree.floating = false;

            if (!vizcore.Main.Configuration.Tree.Option.BgTransparency.Use) {
                tree.title_content = vizcore.Main.Tree.Element.PanelHeader;
            }
            tree.content = vizcore.Main.Tree.Element.Content;

            let treeRibbon = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            treeRibbon.id = tree.id;
            treeRibbon.text = tree.title;
            treeRibbon.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            treeRibbon.event.click = ribbon.CallbackTabPanel(tree);
            treeRibbon.icon.normal = tree.icon;

            allMenuItems[0] = treeRibbon;

            // Property Tree
            let propertyTree = tab.GetItemObject();
            propertyTree.id = "PropertyTreeTab";
            propertyTree.title = "RB0002";
            propertyTree.tooltip = "RB0002";
            propertyTree.icon = 'SH_btn_icon_property_tree';
            propertyTree.position = 0;
            propertyTree.fix = false;
            propertyTree.content = vizcore.Main.PropertyTree.Elements.Content;

            let cbTabPanel = ribbon.CallbackTabPanel(propertyTree);

            let cbPropertyTab = function(bool){

                cbTabPanel(bool);
                vizcore.PropertyTree.Show(bool);    
            };


            let propertyTreeRibbon = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            propertyTreeRibbon.id = propertyTree.id;
            propertyTreeRibbon.text = propertyTree.title;
            propertyTreeRibbon.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            propertyTreeRibbon.event.click = cbPropertyTab;
            propertyTreeRibbon.icon.normal = propertyTree.icon;

            allMenuItems[1] = propertyTreeRibbon;

            // Property
            let property = tab.GetItemObject();
            property.id = "PropertyTab";
            property.title = "RB0003";
            property.tooltip = "RB0003";
            property.icon = 'SH_btn_icon_property';
            property.position = 2;
            property.fix = false;
            property.content = vizcore.Main.Property.Element.Content;

            let propertyRibbon = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            propertyRibbon.id = property.id;
            propertyRibbon.text = property.title;
            propertyRibbon.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            propertyRibbon.event.click = ribbon.CallbackTabPanel(property);
            propertyRibbon.icon.normal = property.icon;

            allMenuItems[2] = propertyRibbon;

            // Review
            reviewPanel = new ReviewPanel(view, vizcore, VIZCore);

            let reivewDeleteButton = document.createElement('div');
            reivewDeleteButton.className = 'VIZWeb SH_tab_title_button SH_title_button SH_delete_icon';
            reivewDeleteButton.addEventListener('click', function () {
                reviewPanel.ReviewDelete();
            });

            let review = scope.DockPanel.GetItemObject();
            review.id = "ReviewTab";
            review.title = "RB0004";
            review.icon = 'SH_btn_icon_review';
            review.position = 2;
            review.fix = false;
            review.content = reviewPanel.GetReviewPanel;
            review.title_content = reivewDeleteButton;

            let reviewRibbon = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            reviewRibbon.id = review.id;
            reviewRibbon.text = review.title;
            reviewRibbon.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            reviewRibbon.event.click = ribbon.CallbackTabPanel(review);
            reviewRibbon.icon.normal = review.icon;

            allMenuItems[3] = reviewRibbon;

            // MiniView 보류 -> 일단 PopUp으로 구성
            let miniMap = tab.GetItemObject();
            miniMap.id = "MiniMapTab";
            miniMap.title = "RB0005";
            miniMap.icon = 'SH_btn_icon_miniMap';
            miniMap.position = 0;
            miniMap.fix = false;
            miniMap.content = vizcore.Main.MiniView.Element.Content;

            // 미니 맵 X 버튼 선택 시
            let cbCloseMiniView = function () {
                scope.SetCheckButton(miniMap.id, false);
            }

            vizcore.Main.MiniView.OnCloseButtonEvent(cbCloseMiniView);

            let cbMiniView = function (bool) {
                vizcore.Main.MiniView.Show(bool);
            }

            let miniViewRibbon = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            miniViewRibbon.id = miniMap.id;
            miniViewRibbon.text = miniMap.title;
            miniViewRibbon.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            miniViewRibbon.event.click = cbMiniView;
            miniViewRibbon.icon.normal = miniMap.icon;

            allMenuItems[4] = miniViewRibbon;

            // Search
            let modelSearch = new vizcore.Search(view, vizcore);
            let search = tab.GetItemObject();
            search.id = "ModelSearchTab";
            search.title = "RB0006";
            search.tooltip = "RB0006";
            search.icon = 'SH_btn_icon_search';
            search.position = 2;
            search.fix = false;
            search.content = modelSearch.GetModelSearchPanel;

            let searchRibbon = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            searchRibbon.id = search.id;
            searchRibbon.text = search.title;
            searchRibbon.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            searchRibbon.event.click = ribbon.CallbackTabPanel(search);
            searchRibbon.icon.normal = search.icon;

            allMenuItems[7] = searchRibbon;

            let panelGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            panelGroup.id = "PanelGroup";
            panelGroup.text = "RG0001";
            panelGroup.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            panelGroup.buttons = [treeRibbon, propertyTreeRibbon, propertyRibbon, reviewRibbon, miniViewRibbon, searchRibbon];

            // -----------------------------------------------------------------------------------------------------Select
            // 선택 박스
            let cbSelectBox = function () {
                vizcore.Main.Mode.SelectBox();
            }
            let selectBoxButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            selectBoxButton.id = "SelectBoxButton";
            selectBoxButton.text = "RB0007";
            selectBoxButton.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            selectBoxButton.event.click = cbSelectBox;
            selectBoxButton.icon.normal= 'SH_btn_icon_select_box';
        
            // 선택 반전
            let cbSelectInverse = function () {
                vizcore.Object3D.InvertSelection();
            }
            let selectInverse = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            selectInverse.id = "SelectInverseButton";
            selectInverse.text = "RB0008";
            selectInverse.icon.normal = 'SH_btn_icon_select_inverse';
            selectInverse.event.click = cbSelectInverse;

            // 전체 선택
            let cbSelectAll = function () {
                vizcore.Object3D.SelectAll(true);
            }
            let selectAll = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            selectAll.id = "SelectAllButton";
            selectAll.text = "RB0009";
            selectAll.event.click = cbSelectAll;
            selectAll.icon.normal = 'SH_btn_icon_select_all';

            // 전체 선택 취소
            let cbSelectDelete = function () {
                vizcore.Object3D.SelectAll(false);
            }
            let selectCancelButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            selectCancelButton.id = "SelectCancelButton";
            selectCancelButton.text = "RB0010";
            selectCancelButton.event.click = cbSelectDelete;
            selectCancelButton.icon.normal = 'SH_btn_icon_select_cancel';

            let selectGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            selectGroup.id = "SelectGroup";
            selectGroup.text = "RG0002";
            selectGroup.style.size = scope.Enum.OBJECT_SIZE.ALL;
            selectGroup.buttons = [selectBoxButton, selectInverse, selectAll, selectCancelButton];
            // -----------------------------------------------------------------------------------------------------Show/Hide
            // 선택 숨기기
            let cbSelectHide = function () {
                let selObjects = vizcore.Object3D.GetSelectedObject3D();
                if (selObjects.length === 0) {
                    vizcore.Main.UIManager.ShowMessage("MG0015", true, vizcore.UIElement.Enum.STATUS_TYPE.WARNING);
                    scope.SetCheckButton("SelectHideButton", false);
                    return;
                }
                vizcore.Object3D.ShowSelectedObject(false);
            }
            let selectHideButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            selectHideButton.id = "SelectHideButton";
            selectHideButton.text = "RB0012";
            selectHideButton.event.click = cbSelectHide;
            selectHideButton.icon.normal= 'SH_btn_icon_select_hide';

            //  비 선택 숨기기
            let cbUnSelectHide = function () {
                vizcore.Object3D.HideUnselectedObject();
            }
            let unSelectHideButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            unSelectHideButton.id = "UnSelectHideButton";
            unSelectHideButton.text = "RB0013";
            unSelectHideButton.icon.normal = 'SH_btn_icon_unSelect_hide';
            unSelectHideButton.event.click = cbUnSelectHide;

            // 전체 숨기기
            let cbHideAll = function () {
                vizcore.Object3D.ShowAll(false);
            }
            let hideAllButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            hideAllButton.id = "HideAllButton";
            hideAllButton.text = "RB0014";
            hideAllButton.event.click = cbHideAll;
            hideAllButton.icon.normal= 'SH_btn_icon_hide_all';

            // 전체 보이기
            let cbShowAll = function () {
                vizcore.Object3D.ShowAll(true);
            }
            let showAllButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            showAllButton.id = "ShowAllButton";
            showAllButton.text = "RB0011";
            showAllButton.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            showAllButton.event.click = cbShowAll;
            showAllButton.icon.normal = 'SH_btn_icon_show_all';

            let showhideGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            showhideGroup.id = "ShowHideGroup";
            showhideGroup.text = "RG0003";
            showhideGroup.style.size = scope.Enum.OBJECT_SIZE.ALL;
            showhideGroup.buttons = [showAllButton, selectHideButton, unSelectHideButton, hideAllButton];

            let showhideButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            showhideButton.id = "ShowhideButton";
            showhideButton.text = "TG0001";
            showhideButton.style.type = scope.Enum.BUTTON_STYLE.NORMAL;
            showhideButton.icon.normal = 'SH_btn_icon_show_hide';
            showhideButton.subButton = [selectHideButton, unSelectHideButton, selectInverse,  showAllButton];

            allMenuItems[5] = showhideButton;
            // -----------------------------------------------------------------------------------------------------View
            // 좌표축
            let cbViewCoordinateAxis = function () {
                vizcore.Configuration.Render.CoordinateAxis.Visible = !vizcore.Configuration.Render.CoordinateAxis.Visible;
                vizcore.Render();
            }
            let viewCoordinateAxisButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            viewCoordinateAxisButton.id = "ViewCoordinateAxisButton";
            viewCoordinateAxisButton.text = "RB0015";
            viewCoordinateAxisButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            viewCoordinateAxisButton.event.click = cbViewCoordinateAxis;
            viewCoordinateAxisButton.icon.normal = 'SH_btn_icon_coordinateAxis';

            // 뷰 큐브
            let cbViewToolbar = function () {
                if (vizcore.View.ViewCube.IsVisible()) {
                    vizcore.View.ViewCube.Show(false);
                } else {
                    vizcore.View.ViewCube.Show(true);
                }
            }
            let viewCubeButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            viewCubeButton.id = "ViewCubeButton";
            viewCubeButton.text = "RB0016";
            viewCubeButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            viewCubeButton.event.click = cbViewToolbar;
            viewCubeButton.icon.normal = 'SH_btn_icon_viewCube';

            // 프레임
            let cbViewCoordinateSystem = function (bool) {
                vizcore.Frame.XYPlane(bool);
                vizcore.Frame.YZPlane(bool);
                vizcore.Frame.ZXPlane(bool);
                vizcore.Render();
            }
            let viewFrameButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            viewFrameButton.id = "ViewFrameButton";
            viewFrameButton.text = "RB0017";
            viewFrameButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            viewFrameButton.event.click = cbViewCoordinateSystem;
            viewFrameButton.icon.normal  = 'SH_btn_icon_viewFrame';

            let viewRenderGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            viewRenderGroup.id = "ViewRenderGroup";
            viewRenderGroup.text = "RG0004";
            viewRenderGroup.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            viewRenderGroup.buttons = [viewCoordinateAxisButton, viewCubeButton, viewFrameButton];

            // -----------------------------------------------------------------------------------------------------Config Panel
            let configPanel = new ConfigPanel(view, vizcore, VIZCore);

            let config = tab.GetItemObject();
            config.id = "ConfigPanelButton";
            config.title = "RB0018";
            config.tooltip = "RB0018";
            config.icon = 'SH_btn_icon_config';
            config.position = 2;
            config.fix = false;
            config.content = configPanel.GetCofigPanel;

            let configButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            configButton.id = config.id;
            configButton.text = config.title;
            configButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            configButton.event.click = ribbon.CallbackTabPanel(config);
            configButton.icon.normal = config.icon;

            allMenuItems[21] = configButton;

            let configGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            configGroup.id = "ConfigPanelGroup";
            configGroup.text = "RG0005";
            configGroup.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            configGroup.buttons = [configButton];
            
            
            let homeTab = scope.GetObject(scope.Enum.OBJECT_TYPE.TAB);
            homeTab.id = "HomeTab";
            homeTab.text = "RT0001";
            homeTab.groups = [panelGroup, selectGroup, showhideGroup, viewRenderGroup, configGroup];
 
            ribbon.Add(scope.Enum.OBJECT_TYPE.TAB, homeTab);
        }

        // view
        function look() {
            let ribbon = scope.Ribbon;
            // --------------------------------------------------------------------------------------------Default
            // 초기위치로
            let cbDefaultHome = function () {
                vizcore.View.ResetView();
            }
            let defaultHomeButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            defaultHomeButton.id = "DefaulInitialPositionButton";
            defaultHomeButton.text = "RB0019";
            defaultHomeButton.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            defaultHomeButton.event.click = cbDefaultHome;
            defaultHomeButton.icon.normal= 'SH_btn_icon_home';

            // 화면에 맞춤
            let cbDefaultFitAll = function () {
                vizcore.View.FitAll();
            }
            let defaultFitAllButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            defaultFitAllButton.id = "DefaultFitAllButton";
            defaultFitAllButton.text = "RB0020";
            defaultFitAllButton.event.click = cbDefaultFitAll;
            defaultFitAllButton.icon.normal  = 'SH_btn_icon_fit_all';

            allMenuItems[10] = defaultFitAllButton;

            // 개체로 중심이동
            let cbDefaultCenter = function () {
                //vizcore.View.FocusPivot();
                let selObjects = vizcore.Object3D.GetSelectedObject3D();
                vizcore.View.FocusScreenObject(selObjects);
                vizcore.Render();
            }
            let defaultCenterButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            defaultCenterButton.id = "DefaultCenterButton";
            defaultCenterButton.text = "RB0021";
            defaultCenterButton.event.click = cbDefaultCenter;
            defaultCenterButton.icon.normal = 'SH_btn_icon_focus_object';

            // 개체로 비행
            let cbDefaultZoom = function () {
                let selObjects = vizcore.Object3D.GetSelectedObject3D();
                if (selObjects.length === 0) {
                    vizcore.Main.UIManager.ShowMessage("MG0015", true, vizcore.UIElement.Enum.STATUS_TYPE.WARNING);
                    return;
                }
                vizcore.View.ZoomSelectedObject(0, 0.2);
            }
            let defaultZoomButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            defaultZoomButton.id = "DefaultFlytoObject";
            defaultZoomButton.text = "RB0022";
            defaultZoomButton.event.click = cbDefaultZoom;
            defaultZoomButton.icon.normal = 'SH_btn_icon_fly_object';

            let basicGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            basicGroup.id = "BasicGroup";
            basicGroup.text = "RG0006";
            basicGroup.style.size = scope.Enum.OBJECT_SIZE.ALL;
            basicGroup.buttons = [defaultHomeButton, defaultFitAllButton, defaultCenterButton, defaultZoomButton];

            // -------------------------------------------------------------------------------------------- DualView
            //  듀얼 뷰
            let cbDualView = function (bool) {
                let multiView = document.getElementById(vizcore.Main.GetViewID() + "MultiView");

                let canvas_multi = document.getElementById(vizcore.Main.GetViewID() + 'canvas_multi');

                if (bool) {
                    view.style.width = "50%";
                    multiView.style.left = " 50%";
                    multiView.style.width = "50%";
                    multiView.style.display = "block";

                    let addView = vizcore.View.MultiCamera.Add(canvas_multi);
                    vizcore.View.MultiCamera.Enable(addView, true);
                } else {
                    view.style.width = "100%";
                    multiView.style.left = "0%";
                    multiView.style.width = "0%";
                    multiView.style.display = "none";

                    vizcore.View.MultiCamera.Remove(canvas_multi);
                }

                cbResizeAll();

                vizcore.Main.Resize();
                vizcore.View.ResizeGLWindow();
                vizcore.Render();
            };
            let dualViewButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            dualViewButton.id = "DualViewButton";
            dualViewButton.text = "RB0023";
            dualViewButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            dualViewButton.event.click = cbDualView;
            dualViewButton.icon.normal = "SH_btn_icon_dual_view";

            // -------------------------------------------------------------------------------------------- IsolateView
            // IsolateView
            let cbIsolateView = function (bool) {
                let selObjects = vizcore.Object3D.GetSelectedObject3D();
                if (selObjects.length === 0 && bool) {
                    vizcore.Main.UIManager.ShowMessage("MG0015", true, vizcore.UIElement.Enum.STATUS_TYPE.WARNING);
                    scope.SetCheckButton("IsolateViewButton", false);
                    return;
                }

                vizcore.Main.Mode.ShowIsolateView(bool);
            };
            let isolateViewButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            isolateViewButton.id = "IsolateViewButton";
            isolateViewButton.text = "RB0024";
            isolateViewButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            isolateViewButton.event.click = cbIsolateView;
            isolateViewButton.icon.normal = "SH_btn_icon_isolate_view";


            let multiViewGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            multiViewGroup.id = "MultiViewGroup";
            multiViewGroup.text = "RG0007";
            multiViewGroup.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            multiViewGroup.buttons = [dualViewButton, isolateViewButton];

            allMenuItems[9] = isolateViewButton;
            // -------------------------------------------------------------------------------------------- Control
            // 이동
            let cbControlPan = function (bool) {
                if (bool) {
                    vizcore.View.Control.EnablePan(true);
                } else {
                    viewControlResetMode();
                }
            }
            let controlPanButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            controlPanButton.id = "ControlPanButton";
            controlPanButton.text = "RB0026";
            controlPanButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            controlPanButton.event.click = cbControlPan;
            controlPanButton.icon.normal= "SH_btn_icon_control_pan";


            // 회전
            let cbControlFree = function (bool) {
                if (bool) {
                    vizcore.View.Control.EnableFreeRotate(true);
                } else {
                    viewControlResetMode();
                }
            }
            let controlFreeButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            controlFreeButton.id = "ControlFreeButton";
            controlFreeButton.text = "RB0025";
            controlFreeButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            controlFreeButton.event.click = cbControlFree;
            controlFreeButton.icon.normal  = "SH_btn_icon_control_free";

            // Z축 고정 회전
            let cbControlLimite = function (bool) {
                if (bool) {
                    vizcore.View.Control.EnableLimitRotate(true);
                } else {
                    viewControlResetMode();
                }
            }

            let controlLimiteButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            controlLimiteButton.id = "ControlConstrainedeOrbitButton";
            controlLimiteButton.text = "RB0027";
            controlLimiteButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            controlLimiteButton.event.click = cbControlLimite;
            controlLimiteButton.icon.normal = "SH_btn_icon_control_constrained_orbit";


            // Z축 제한 회전
            let cbControlZ = function (bool) {
                if (bool) {
                    vizcore.View.Control.EnablePivotRotate(true);
                } else {
                    viewControlResetMode();
                }
            }
            let controlZButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            controlZButton.id = "ControlFixingZButton";
            controlZButton.text = "RB0028";
            controlZButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            controlZButton.event.click = cbControlZ;
            controlZButton.icon.normal = "SH_btn_icon_control_z";


            // Orbit
            let cbControlOrbit = function (bool) {
                if (bool) {
                    vizcore.View.Control.EnableClassicRotate(true);
                } else {
                    viewControlResetMode();
                }
            }
            let controlOrbitButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            controlOrbitButton.id = "ControlOrbitButton";
            controlOrbitButton.text = "RB0029";
            controlOrbitButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            controlOrbitButton.event.click = cbControlOrbit;
            controlOrbitButton.icon.normal = "SH_btn_icon_control_orbit";

            let controlGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            controlGroup.id = "ControlGroup";
            controlGroup.text = "RG0008";
            controlGroup.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            controlGroup.buttons = [controlFreeButton, controlPanButton, controlLimiteButton, controlZButton, controlOrbitButton];

            let controlButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            controlButton.id = "ControlButton";
            controlButton.text = "TG0003";
            controlButton.style.type = scope.Enum.BUTTON_STYLE.NORMAL;
            controlButton.icon.normal = 'SH_btn_icon_control';
            controlButton.subButton = [controlFreeButton, controlLimiteButton, controlPanButton,  controlZButton, controlOrbitButton];

            allMenuItems[8] = controlButton;
            // -------------------------------------------------------------------------------------------- 확대/축소
            // 확대
            let cbZoomIn = function () {
                vizcore.View.CameraZoomIn(1.0);
            }
            let zoomInButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            zoomInButton.id = "ZoomInButton";
            zoomInButton.text = "RB0031";
            zoomInButton.event.click = cbZoomIn;
            zoomInButton.icon.normal = "SH_btn_icon_zoom_in";


            // 축소
            let cbZoomOut = function () {
                vizcore.View.CameraZoomOut(1.0);
            }
            let zoomOutButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            zoomOutButton.id = "ZoomOutButton";
            zoomOutButton.text = "RB0032";
            zoomOutButton.event.click = cbZoomOut;
            zoomOutButton.icon.normal = "SH_btn_icon_zoom_out";

            // 박스 줌
            let cbZoomBox = function () {
                vizcore.Main.Mode.BoxZoom();
            }
            let zoomBoxButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            zoomBoxButton.id = "ZoomWindowButton";
            zoomBoxButton.text = "RB0030";
            zoomBoxButton.event.click = cbZoomBox;
            zoomBoxButton.icon.normal = "SH_btn_icon_zoom_window";


            let zoomGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            zoomGroup.id = "ZoomGroup";
            zoomGroup.text = "RG0009";
            zoomGroup.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            zoomGroup.buttons = [zoomBoxButton, zoomInButton, zoomOutButton];
            // -------------------------------------------------------------------------------------------- Camera
            // X+
            let cbCameraXPlus = function () {
                vizcore.View.MoveCamera(VIZCore.Enum.CameraDirection.X_PLUS);
            }
            let cameraXPlusButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            cameraXPlusButton.id = "CameraXPlusButton";
            cameraXPlusButton.text = "RB0033";
            cameraXPlusButton.event.click = cbCameraXPlus;
            cameraXPlusButton.icon.normal = "SH_btn_icon_camera_plus_x";

            // X-
            let cbCameraXMinus = function () {
                vizcore.View.MoveCamera(VIZCore.Enum.CameraDirection.X_MINUS);
            }
            let cameraXMinusButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            cameraXMinusButton.id = "CameraXMinusButton";
            cameraXMinusButton.text = "RB0034";
            cameraXMinusButton.event.click = cbCameraXMinus;
            cameraXMinusButton.icon.normal = "SH_btn_icon_camera_minus_x";

            // Y+
            let cbCameraYPlus = function () {
                vizcore.View.MoveCamera(VIZCore.Enum.CameraDirection.Y_PLUS);
            }
            let cameraYPlusButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            cameraYPlusButton.id = "CameraYPlusButton";
            cameraYPlusButton.text = "RB0035";
            cameraYPlusButton.event.click = cbCameraYPlus;
            cameraYPlusButton.icon.normal = "SH_btn_icon_camera_plus_y";

            // Y-
            let cbCameraYMinus = function () {
                vizcore.View.MoveCamera(VIZCore.Enum.CameraDirection.Y_MINUS);
            }
            let cameraYMinusButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            cameraYMinusButton.id = "cameraYMinusButton";
            cameraYMinusButton.text = "RB0036";
            cameraYMinusButton.event.click = cbCameraYMinus;
            cameraYMinusButton.icon.normal = "SH_btn_icon_camera_minus_y";

            // Z+
            let cbCameraZPlus = function () {
                vizcore.View.MoveCamera(VIZCore.Enum.CameraDirection.Z_PLUS);
            }
            let cameraZPlusButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            cameraZPlusButton.id = "CameraZPlusButton";
            cameraZPlusButton.text = "RB0037";
            cameraZPlusButton.event.click = cbCameraZPlus;
            cameraZPlusButton.icon.normal = "SH_btn_icon_camera_plus_z";

            // Z-
            let cbCameraZMinus = function () {
                vizcore.View.MoveCamera(VIZCore.Enum.CameraDirection.Z_MINUS);
            }
            let cameraZMinusButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            cameraZMinusButton.id = "CameraZMinusButton";
            cameraZMinusButton.text = "RB0038";
            cameraZMinusButton.event.click = cbCameraZMinus;
            cameraZMinusButton.icon.normal = "SH_btn_icon_camera_minus_z";

            // ISO+
            let cbCameraISOPlus = function () {
                vizcore.View.MoveCamera(VIZCore.Enum.CameraDirection.ISO_PLUS);
            }
            let cameraISOPlusButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            cameraISOPlusButton.id = "CameraISOPlusButton";
            cameraISOPlusButton.text = "RB0039";
            cameraISOPlusButton.event.click = cbCameraISOPlus;
            cameraISOPlusButton.icon.normal = "SH_btn_icon_camera_plus_iso";

            // ISO-
            let cbCameraISOMinus = function () {
                vizcore.View.MoveCamera(VIZCore.Enum.CameraDirection.ISO_MINUS);
            }
            let cameraISOMinusButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            cameraISOMinusButton.id = "CameraISOMinusButton";
            cameraISOMinusButton.text = "RB0040";
            cameraISOMinusButton.event.click = cbCameraISOMinus;
            cameraISOMinusButton.icon.normal = "SH_btn_icon_camera_minus_iso";


            let cameraGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            cameraGroup.id = "CameraGroup";
            cameraGroup.text = "RG0010";
            cameraGroup.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            cameraGroup.buttons = [cameraXPlusButton, cameraXMinusButton, cameraYPlusButton, cameraYMinusButton, cameraZPlusButton, cameraZMinusButton, cameraISOPlusButton, cameraISOMinusButton];

            let cameraButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            cameraButton.id = "CameraButton";
            cameraButton.text = "TG0006";
            cameraButton.style.type = scope.Enum.BUTTON_STYLE.NORMAL;
            cameraButton.icon.normal = "SH_btn_icon_camera";
            cameraButton.subButton = [cameraXPlusButton, cameraXMinusButton, cameraYPlusButton, cameraYMinusButton, cameraZPlusButton, cameraZMinusButton, cameraISOPlusButton, cameraISOMinusButton];

            allMenuItems[14] = cameraButton;
            // -------------------------------------------------------------------------------------------- Snapshot
            // 스냅샷
            let cbSnapshot = function () {
                vizcore.Review.Snapshot.Add();
            }
            
            let snapshotButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            snapshotButton.id = "SnapshotButton";
            snapshotButton.text = "RB0041";
            snapshotButton.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            snapshotButton.event.click = cbSnapshot;
            snapshotButton.icon.normal = "SH_btn_icon_snapshot";


            let snapshotGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            snapshotGroup.id = "SnapshotGroup";
            snapshotGroup.text = "RG0011";
            snapshotGroup.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            snapshotGroup.buttons = [snapshotButton];

            allMenuItems[20] = snapshotButton;

            let cbReview = function (bool) {
                reviewPanelTab = "UserView";
                cbReviewPanel(bool);
            }

            let reviewPanelObject = scope.GetTabObjectByID("ReviewTab");

            let userViewReviewRibbon = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            userViewReviewRibbon.id = "UserViewReviewButton";
            userViewReviewRibbon.text = "RB0042";
            userViewReviewRibbon.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            userViewReviewRibbon.event.click = cbReview;
            userViewReviewRibbon.icon.normal = reviewPanelObject.icon;

            let reviewPanelGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            reviewPanelGroup.id = "UserViewPanelGroup";
            reviewPanelGroup.text = "RG0012";
            reviewPanelGroup.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            reviewPanelGroup.buttons = [userViewReviewRibbon];

            let viewTab = scope.GetObject(scope.Enum.OBJECT_TYPE.TAB);
            viewTab.id = "viewTab";
            viewTab.text = "RT0002";
            viewTab.groups = [basicGroup, multiViewGroup, controlGroup, zoomGroup, cameraGroup, snapshotGroup, reviewPanelGroup];

            ribbon.Add(scope.Enum.OBJECT_TYPE.TAB, viewTab);
        }

        function navigation() {
            let ribbon = scope.Ribbon;
            // -------------------------------------------------------------------------------------------- 고급
            // 보행 탐색
            let cbWalkthrough = function (bool) {
                vizcore.View.Fly.Enable(false);
                vizcore.View.Walkthrough.Enable(bool);
                vizcore.View.Walkthrough.Avatar(false);
                ribbon.SetCheckButtons(["AvatarButton", "FlyButton"], false);
            }
            let walkthroughButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            walkthroughButton.id = "WalkthroughButton";
            walkthroughButton.text = "RB0043";
            walkthroughButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            walkthroughButton.event.click = cbWalkthrough;
            walkthroughButton.icon.normal = "SH_btn_icon_advanced_walk";


            // 비행 탐색
            let cbFly = function (bool) {
                vizcore.View.Walkthrough.Enable(false);
                vizcore.View.Walkthrough.Avatar(false);
                vizcore.View.Fly.Enable(bool);
                ribbon.SetCheckButtons(["AvatarButton", "WalkthroughButton"], false);
            }
            let flyButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            flyButton.id = "FlyButton";
            flyButton.text = "RB0044";
            flyButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            flyButton.event.click = cbFly;
            flyButton.icon.normal = "SH_btn_icon_advanced_fly";


            // 아바타
            let cbAvatar = function (bool) {
                vizcore.View.Fly.Enable(false);
                vizcore.View.Walkthrough.Enable(bool);
                vizcore.View.Walkthrough.Avatar(true);
                ribbon.SetEnableButton("CameraGroup", !bool)
                ribbon.SetCheckButtons(["FlyButton", "WalkthroughButton"], false);
            }

            let avatarButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            avatarButton.id = "AvatarButton";
            avatarButton.text = "RB0045";
            avatarButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            avatarButton.event.click = cbAvatar;
            avatarButton.icon.normal = "SH_btn_icon_advanced_avatar";


            let advanceGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            advanceGroup.id = "AdvanceGroup";
            advanceGroup.text = "RG0013";
            advanceGroup.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            advanceGroup.buttons = [walkthroughButton, flyButton, avatarButton];
            // -------------------------------------------------------------------------------------------- 모델 보기
            // 원근/평행
            let cbProjection = function (bool) {
                if (bool) {
                    vizcore.View.SetProjection(VIZCore.Enum.PROJECTION_MODES.Orthographic); // 평행
                } else {
                    vizcore.View.SetProjection(VIZCore.Enum.PROJECTION_MODES.Perspective);  // 원근
                }
            }
            let projectionButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            projectionButton.id = "ProjectionButton";
            projectionButton.text = "RB0046";
            projectionButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            projectionButton.event.click = cbProjection;
            projectionButton.icon.normal = "SH_btn_icon_projection";

            allMenuItems[13] = projectionButton;

            let modelShowGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            modelShowGroup.id = "ProjectionGroup";
            modelShowGroup.text = "RG0014";
            modelShowGroup.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            modelShowGroup.buttons = [projectionButton];
            // -------------------------------------------------------------------------------------------- 입력
            // CATIA
            let cbCATIAMode = function (bool) {
                if (bool) {                    
                    vizcore.Configuration.Control.Version = 2;
                } else {
                    vizcore.Configuration.Control.Version = 1;
                }
            }
            let CATIAModeButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            CATIAModeButton.id = "CATIAModeButton";
            CATIAModeButton.text = "RB0047";
            CATIAModeButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            CATIAModeButton.event.click = cbCATIAMode;
            CATIAModeButton.icon.normal = "SH_btn_icon_catia";


            let inputGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            inputGroup.id = "InputGroup";
            inputGroup.text = "RG0015";
            inputGroup.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            inputGroup.buttons = [CATIAModeButton];

            let navigationTab = scope.GetObject(scope.Enum.OBJECT_TYPE.TAB);
            navigationTab.id = "NavigationTab";
            navigationTab.text = "RT0003";

            if (vizcore.Main.IsVIZWide3DProduct() === true)
                navigationTab.groups = [advanceGroup, modelShowGroup, inputGroup];
            else
                navigationTab.groups = [ modelShowGroup, inputGroup];
 
            
            ribbon.Add(scope.Enum.OBJECT_TYPE.TAB, navigationTab);
        }

        function control() {
            let ribbon = scope.Ribbon;

            // --------------------------------------------------------------------------------------------------- RenderMode
            // Smooth
            let cbRenderSmooth = function () {
                vizcore.View.SetRenderMode(VIZCore.Enum.RENDER_MODES.Smooth);
                ribbon.SetCheckButtons(["RenderXrayButton", "RenderPlasticButton", "RenderSelectedXrayButton", "RendeHidelineButton", "RendeGrayscaleButton", "RenderWireFrameButton"], false);
            };
            let renderSmoothButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            renderSmoothButton.id = "RenderSmoothButton";
            renderSmoothButton.text = "RB0048";
            renderSmoothButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            renderSmoothButton.event.click = cbRenderSmooth;
            renderSmoothButton.icon.normal = "SH_btn_icon_render_smooth";


            // X-ray
            let cbRenderXray = function (bool) {
                if (bool) {
                    vizcore.View.SetRenderMode(VIZCore.Enum.RENDER_MODES.Xray);
                    ribbon.SetCheckButtons(["RenderSmoothButton", "RenderPlasticButton", "RenderSelectedXrayButton", "RendeHidelineButton", "RendeGrayscaleButton", "RenderWireFrameButton"], false);
                } else {
                    vizcore.View.SetRenderMode(VIZCore.Enum.RENDER_MODES.Smooth);
                }
            };
            let renderXrayButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            renderXrayButton.id = "RenderXrayButton";
            renderXrayButton.text = "RB0049";
            renderXrayButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            renderXrayButton.event.click = cbRenderXray;
            renderXrayButton.icon.normal = "SH_btn_icon_render_xray";

            // X-ray(Selected)
            let cbRenderSelectedXray = function (bool) {
                // if (bool) {
                //선택 개체 반환
                let selNode = vizcore.Object3D.FromFilter(VIZCore.Enum.OBJECT3D_FILTER.SELECTED_TOP);

                if (selNode.length > 0) {
                    vizcore.View.SetRenderMode(VIZCore.Enum.RENDER_MODES.Xray);

                    let ids = [];
                    for (let i = 0; i < selNode.length; i++) {
                        ids[i] = selNode[i].id;
                    }

                    //선택 개체만 X-ray
                    vizcore.View.SetSelectionXrayMode(ids);
                    vizcore.Render();

                    vizcore.Object3D.SelectAll(false);

                    ribbon.SetCheckButtons(["RenderSmoothButton", "RenderXrayButton", "RenderPlasticButton", "RendeHidelineButton", "RendeGrayscaleButton", "RenderWireFrameButton"], false);
                }
                else {
                    vizcore.Main.UIManager.ShowMessage("MG0015", true, vizcore.UIElement.Enum.STATUS_TYPE.WARNING);
                    return;
                }

            };
            let renderSelectedXrayButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            renderSelectedXrayButton.id = "RenderSelectedXrayButton";
            renderSelectedXrayButton.text = "RB0050";
            renderSelectedXrayButton.event.click = cbRenderSelectedXray;
            renderSelectedXrayButton.icon.normal  = "SH_btn_icon_render_xray_selected";

            // Plastic
            let cbRenderPlastic = function (bool) {
                if (bool) {
                    vizcore.View.SetRenderMode(VIZCore.Enum.RENDER_MODES.Plastic);
                    ribbon.SetCheckButtons(["RenderSmoothButton", "RenderXrayButton", "RenderSelectedXrayButton", "RendeHidelineButton", "RendeGrayscaleButton", "RenderWireFrameButton"], false);
                } else {
                    vizcore.View.SetRenderMode(VIZCore.Enum.RENDER_MODES.Smooth);
                }
            };
            let renderPlasticButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            renderPlasticButton.id = "RenderPlasticButton";
            renderPlasticButton.text = "RB0051";
            renderPlasticButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            renderPlasticButton.event.click = cbRenderPlastic;
            renderPlasticButton.icon.normal  = "SH_btn_icon_render_plastic";

            // Hideline
            let cbRendeHideline = function (bool) {
                if (bool) {
                    vizcore.View.SetRenderMode(VIZCore.Enum.RENDER_MODES.HiddenLine);
                    ribbon.SetCheckButtons(["RenderSmoothButton", "RenderXrayButton", "RenderPlasticButton", "RenderSelectedXrayButton", "RendeGrayscaleButton", "RenderWireFrameButton"], false);
                } else {
                    vizcore.View.SetRenderMode(VIZCore.Enum.RENDER_MODES.Smooth);
                }
            };
            let rendeHidelineButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            rendeHidelineButton.id = "RendeHidelineButton";
            rendeHidelineButton.text = "RB0052";
            rendeHidelineButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            rendeHidelineButton.event.click = cbRendeHideline;
            rendeHidelineButton.icon.normal = "SH_btn_icon_render_hideline";

            // Grayscale
            let cbRendeGrayscale = function (bool) {
                if (bool) {
                    vizcore.View.SetRenderMode(VIZCore.Enum.RENDER_MODES.GrayScale);
                    ribbon.SetCheckButtons(["RenderSmoothButton", "RenderXrayButton", "RenderPlasticButton", "RenderSelectedXrayButton", "RendeHidelineButton", "RenderWireFrameButton"], false);
                } else {
                    vizcore.View.SetRenderMode(VIZCore.Enum.RENDER_MODES.Smooth);
                }
            };
            let rendeGrayscaleButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            rendeGrayscaleButton.id = "RendeGrayscaleButton";
            rendeGrayscaleButton.text = "RB0053";
            rendeGrayscaleButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            rendeGrayscaleButton.event.click = cbRendeGrayscale;
            rendeGrayscaleButton.icon.normal = "SH_btn_icon_render_grayscale";

            // WireFrame
            let cbRenderWireFrame = function (bool) {
                if (bool) {
                    vizcore.View.SetRenderMode(VIZCore.Enum.RENDER_MODES.WireFrame);
                    ribbon.SetCheckButtons(["RenderSmoothButton", "RenderXrayButton", "RenderPlasticButton", "RenderSelectedXrayButton", "RendeHidelineButton", "RendeGrayscaleButton"], false);
                } else {
                    vizcore.View.SetRenderMode(VIZCore.Enum.RENDER_MODES.Smooth);
                }
            };
            let renderWireFrameButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            renderWireFrameButton.id = "RenderWireFrameButton";
            renderWireFrameButton.text = "RB0054";
            renderWireFrameButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            renderWireFrameButton.event.click = cbRenderWireFrame;
            renderWireFrameButton.icon.normal = "SH_btn_icon_render_wireframe";

            // Edge
            let cbRenderEffectEdge = function (bool) {
                vizcore.View.ShowEdge(bool);
            };
            let renderEffectEdgeButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            renderEffectEdgeButton.id = "RenderEffectEdgeButton";
            renderEffectEdgeButton.text = "RB0055";
            renderEffectEdgeButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            renderEffectEdgeButton.event.click = cbRenderEffectEdge;
            renderEffectEdgeButton.icon.normal = "SH_btn_icon_render_edge";

            let renderGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            renderGroup.id = "RenderGroup";
            renderGroup.text = "RG0016";
            renderGroup.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            renderGroup.buttons = [renderSmoothButton, renderXrayButton, renderSelectedXrayButton, renderPlasticButton, rendeHidelineButton, rendeGrayscaleButton, renderWireFrameButton, renderEffectEdgeButton];

            let renderButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            renderButton.id = "RenderButton";
            renderButton.text = "TG0004";
            renderButton.style.type = scope.Enum.BUTTON_STYLE.NORMAL;
            renderButton.icon.normal = "SH_btn_icon_render";
            renderButton.subButton = [renderSmoothButton, renderXrayButton, renderPlasticButton,  rendeHidelineButton, renderWireFrameButton, rendeGrayscaleButton];

            allMenuItems[11] = renderButton;

            let renderEdgeButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            renderEdgeButton.id = "RenderEdgeButton";
            renderEdgeButton.text = "TG0005";
            renderEdgeButton.style.type = scope.Enum.BUTTON_STYLE.NORMAL;
            renderEdgeButton.icon.normal = "SH_btn_icon_render_edge";
            renderEdgeButton.subButton = [renderEffectEdgeButton];

            allMenuItems[12] = renderEdgeButton;
            // -------------------------------------------------------------------------------------------------------------------------------- Effect  
            // 그림자
            let cbShadowEffect = function (bool) {
                vizcore.View.EnableShadow(bool);
            };
            let shadowEffectButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            shadowEffectButton.id = "ShadowEffectButton";
            shadowEffectButton.text = "RB0056";
            shadowEffectButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            shadowEffectButton.event.click = cbShadowEffect;
            shadowEffectButton.icon.normal = "SH_btn_icon_effect_shadow";

            let shadowGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            shadowGroup.id = "ShadowGroup";
            shadowGroup.text = "RG0017";
            shadowGroup.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            shadowGroup.buttons = [shadowEffectButton];
 
            // -------------------------------------------------------------------------------------------------------------------------------- Background  
            // 그라데이션
            let cbBackgroundGradation = function (combo) {
                for (let objKey in VIZCore.Enum.BackgroundModes) {
                    if (VIZCore.Enum.BackgroundModes.hasOwnProperty(objKey)) {
                        if (objKey === combo.id) {
                            vizcore.Configuration.Render.Background.Mode = VIZCore.Enum.BackgroundModes[objKey];
                            vizcore.Render();
                        }
                    }
                }
            };
            let oneColor = ribbon.GetComboSetting("COLOR_ONE", "RB0110", "SH_btn_icon_bg_color_one", cbBackgroundGradation);
            let twoHor = ribbon.GetComboSetting("COLOR_TWO_HOR", "RB0111", "SH_btn_icon_bg_color_two_hor", cbBackgroundGradation);
            let twoHorRe = ribbon.GetComboSetting("COLOR_TWO_HOR_REVERSE", "RB0112", "SH_btn_icon_bg_color_two_hor_reverse", cbBackgroundGradation);
            let twoVer = ribbon.GetComboSetting("COLOR_TWO_VER", "RB0113", "SH_btn_icon_bg_color_two_ver", cbBackgroundGradation);
            let twoVerRe = ribbon.GetComboSetting("COLOR_TWO_VER_REVERSE", "RB0114", "SH_btn_icon_bg_color_two_ver_reverse", cbBackgroundGradation);
            let twoChor = ribbon.GetComboSetting("COLOR_TWO_CHOR", "RB0115", "SH_btn_icon_bg_color_two_chor", cbBackgroundGradation);
            let twoChorRe = ribbon.GetComboSetting("COLOR_TWO_CHOR_REVERSE", "RB0116", "SH_btn_icon_bg_color_two_chor_reverse", cbBackgroundGradation);
            let twoCver = ribbon.GetComboSetting("COLOR_TWO_CVER", "RB0117", "SH_btn_icon_bg_color_two_cver", cbBackgroundGradation);
            let twoCverRe = ribbon.GetComboSetting("COLOR_TWO_CVER_REVERSE", "RB0118", "SH_btn_icon_bg_color_two_cver_reverse", cbBackgroundGradation);
            let twoCenter = ribbon.GetComboSetting("COLOR_TWO_CENTER", "RB0119", "SH_btn_icon_bg_color_two_center", cbBackgroundGradation);
            let twoCorner = ribbon.GetComboSetting("COLOR_TWO_CORNER", "RB0120", "SH_btn_icon_bg_color_two_corner", cbBackgroundGradation);
            let backgroundGradationComboItems = [oneColor, twoHor, twoHorRe, twoVer, twoVerRe, twoChor, twoChorRe, twoCver, twoCverRe, twoCenter, twoCorner];

            let backgroundGradationCombo = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            backgroundGradationCombo.id = "BackgroundColorButton";
            backgroundGradationCombo.text = "RB0109";
            backgroundGradationCombo.style.type = scope.Enum.BUTTON_STYLE.COMBO;
            backgroundGradationCombo.subButton = backgroundGradationComboItems;
            backgroundGradationCombo.icon.normal = "SH_btn_icon_bg_color";

            // OneColor
            let cbBackgroundOneColor = function () {
                let selectColor = new VIZCore.Color();
                selectColor = vizcore.Main.ColorPicker.GetPickColor();

                vizcore.Configuration.Render.Background.OneColor = selectColor;
                vizcore.Render();
            };
            let cbOneColorPick = function () {
                vizcore.Main.ColorPicker.Show(true);
                vizcore.Main.ColorPicker.SetColor(vizcore.Configuration.Render.Background.OneColor);
                vizcore.Main.ColorPicker.Callback = cbBackgroundOneColor;
            };
            let backgroundOneColorButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            backgroundOneColorButton.id = "BackgroundOneColorButton";
            backgroundOneColorButton.text = "RB0057";
            backgroundOneColorButton.event.click = cbOneColorPick;
            backgroundOneColorButton.icon.normal = "SH_btn_icon_bg_color_1";

            //  TwoColor
            let cbBackgroundTwoColor = function () {
                let selectColor = new VIZCore.Color();
                selectColor = vizcore.Main.ColorPicker.GetPickColor();

                vizcore.Configuration.Render.Background.TwoColor = selectColor;
                vizcore.Render();
            };
            let cbTwoColorPick = function () {
                vizcore.Main.ColorPicker.Show(true);
                vizcore.Main.ColorPicker.SetColor(vizcore.Configuration.Render.Background.TwoColor);
                vizcore.Main.ColorPicker.Callback = cbBackgroundTwoColor;
            };
            let backgroundTwoColorButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            backgroundTwoColorButton.id = "BackgroundTwoColorButton";
            backgroundTwoColorButton.text = "RB0058";
            backgroundTwoColorButton.event.click = cbTwoColorPick;
            backgroundTwoColorButton.icon.normal = "SH_btn_icon_bg_color_2";


            let backgroundGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            backgroundGroup.id = "BackgroundGroup";
            backgroundGroup.text = "RG0018";
            backgroundGroup.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            backgroundGroup.buttons = [backgroundGradationCombo, backgroundOneColorButton, backgroundTwoColorButton];
            
            // -------------------------------------------------------------------------------------------------------------------------------- Color  
            // 색상 변경
            let cbColorPick = function () {
                let selObjects = vizcore.Object3D.GetSelectedObject3D();
                let selectColor = new VIZCore.Color();
                selectColor = vizcore.Main.ColorPicker.GetPickColor();

                vizcore.Object3D.Color.SetColorByNodeID(selObjects, selectColor);

                vizcore.Object3D.SelectAll(false);
            }
            let cbColorPickShow = function () {
                let selObjects = vizcore.Object3D.GetSelectedObject3D();
                if (selObjects.length === 0) {
                    vizcore.Main.UIManager.ShowMessage("MG0015", true, vizcore.UIElement.Enum.STATUS_TYPE.WARNING);
                    return;
                }

                vizcore.Main.ColorPicker.Show(true);
                let getObjColor = vizcore.Object3D.Color.Getcolor(selObjects);
                // 멀티선택일 경우 검정색
                if (getObjColor !== undefined ){
                    if (getObjColor.length >1 ){
                        let defaultColor = new VIZCore.Color(0, 0, 0);
                        vizcore.Main.ColorPicker.SetColor(defaultColor);
                    }
                    else{
                        vizcore.Main.ColorPicker.SetColor(getObjColor[0]);
                    }
                }

            

                vizcore.Main.ColorPicker.Callback = cbColorPick;
            };
            let colorPickButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            colorPickButton.id = "ColorPickButton";
            colorPickButton.text = "RB0059";
            colorPickButton.event.click = cbColorPickShow;
            colorPickButton.icon.normal = "SH_btn_icon_color_pick";

            // 선택 삭제
            let cbColorDelete = function () {
                let selObjects = vizcore.Object3D.GetSelectedObject3D();
                if (selObjects.length === 0) {
                    vizcore.Main.UIManager.ShowMessage("MG0015", true, vizcore.UIElement.Enum.STATUS_TYPE.WARNING);
                    scope.SetCheckButton("ColorDeletebutton", false);
                    return;
                }

                vizcore.Object3D.Color.ClearByBodyID(selObjects);
            };
            let colorDeletebutton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            colorDeletebutton.id = "ColorDeletebutton";
            colorDeletebutton.text = "RB0060";
            colorDeletebutton.event.click = cbColorDelete;
            colorDeletebutton.icon.normal = "SH_btn_icon_color_delete";

            // 전체 삭제
            let cbColorDeleteAll = function () {
                vizcore.Object3D.Color.ClearAll();
                vizcore.Render();
            };
            let colorDeleteAllButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            colorDeleteAllButton.id = "ColorDeleteAllButton";
            colorDeleteAllButton.text = "RB0061";
            colorDeleteAllButton.event.click = cbColorDeleteAll;
            colorDeleteAllButton.icon.normal = "SH_btn_icon_color_delete_all";

            let colorGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            colorGroup.id = "ColorGroup";
            colorGroup.text = "RG0019";
            colorGroup.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            colorGroup.buttons = [colorPickButton, colorDeletebutton, colorDeleteAllButton];

            let colorButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            colorButton.id = "ColorButton";
            colorButton.text = "TG0002";
            colorButton.style.type = scope.Enum.BUTTON_STYLE.NORMAL;
            colorButton.icon.normal = "SH_btn_icon_color_pick";
            colorButton.subButton = [colorPickButton, colorDeletebutton];

            allMenuItems[6] = colorButton;
            // -------------------------------------------------------------------------------------------------------------------------------- Transform
            // 이동 핸들
            let cbTransformHandle = function (bool) {
                vizcore.Object3D.Transform.SetEnableHandle(bool);
            };
            let transformHandleButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            transformHandleButton.id = "TransformHandleButton";
            transformHandleButton.text = "RB0062";
            transformHandleButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            transformHandleButton.event.click = cbTransformHandle;
            transformHandleButton.icon.normal = "SH_btn_icon_transform_handle";

            let cbTransformPanelClose = function () {
                scope.SetCheckButton("TransformPanelButton", false);
                cbTransformPanel(false);
            };
            vizcore.TransformPanel.OnCloseButtonEvent(cbTransformPanelClose);

            // 이동 패널
            let cbTransformPanel = function (bool) {
                vizcore.TransformPanel.Show(bool);
            };
            let transformPanelButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            transformPanelButton.id = "TransformPanelButton";
            transformPanelButton.text = "RB0063";
            transformPanelButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            transformPanelButton.event.click = cbTransformPanel;
            transformPanelButton.icon.normal = "SH_btn_icon_transform_panel";


            // 점과 점
            let cbPointToPoint = function () {
                vizcore.Review.Measure.SetTranslateSubType(0);
            };
            let transformPointToPointButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            transformPointToPointButton.id = "TransformPointToPointButton";
            transformPointToPointButton.text = "RB0064";
            transformPointToPointButton.event.click = cbPointToPoint;
            transformPointToPointButton.icon.normal = "SH_btn_icon_transform_point_to_point";

            // 면과 면
            let cbFaceToFaceParallel = function () {
                vizcore.Review.Measure.SetTranslateSubType(1);
            };
            let transformFaceToFaceParallelButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            transformFaceToFaceParallelButton.id = "TransformFaceToFaceParallelButton";
            transformFaceToFaceParallelButton.text = "RB0065";
            transformFaceToFaceParallelButton.event.click = cbFaceToFaceParallel;
            transformFaceToFaceParallelButton.icon.normal = "SH_btn_icon_transform_parallel_face";


            // 면 접합
            let cbSurfaceContact = function () {
                vizcore.Review.Measure.SetTranslateSubType(2);
            };
            let transformSurfaceContactButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            transformSurfaceContactButton.id = "TransformFaceJunctionButton";
            transformSurfaceContactButton.text = "RB0066";
            transformSurfaceContactButton.event.click = cbSurfaceContact;
            transformSurfaceContactButton.icon.normal = "SH_btn_icon_transform_face_junction";


            // 선택 되돌리기
            let cbTransformRestore = function () {
                let selObjects = vizcore.Object3D.GetSelectedObject3D();
                if (selObjects.length === 0) {
                    vizcore.Main.UIManager.ShowMessage("MG0015", true, vizcore.UIElement.Enum.STATUS_TYPE.WARNING);
                    scope.SetCheckButton("TransformRestoreButton", false);
                    return;
                }
                vizcore.Object3D.Transform.RestoreTransformByNodeID(selObjects);
                vizcore.Render();
            };
            let transformRestoreButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            transformRestoreButton.id = "TransformInitializeSelectedButton";
            transformRestoreButton.text = "RB0067";
            transformRestoreButton.event.click = cbTransformRestore;
            transformRestoreButton.icon.normal = "SH_btn_icon_transform_initialize_selected";


            let cbTransformRestoreAll = function () {
                vizcore.Object3D.Transform.RestoreTransformAll();
            };
            let transformRestoreAllButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            transformRestoreAllButton.id = "TransformRestoreAllButton";
            transformRestoreAllButton.text = "RB0068";
            transformRestoreAllButton.event.click = cbTransformRestoreAll;
            transformRestoreAllButton.icon.normal = "SH_btn_icon_transform_initialize_all";

            let transformGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            transformGroup.id = "TransformGroup";
            transformGroup.text = "RG0020";
            transformGroup.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            transformGroup.buttons = [transformHandleButton, transformPanelButton, transformPointToPointButton, transformFaceToFaceParallelButton, transformSurfaceContactButton, transformRestoreButton, transformRestoreAllButton];

            let transformButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            transformButton.id = "TransformButton";
            transformButton.text = "TG0007";
            transformButton.style.type = scope.Enum.BUTTON_STYLE.NORMAL;
            transformButton.icon.normal = "SH_btn_icon_transform";
            transformButton.subButton = [transformHandleButton, transformPanelButton, transformRestoreButton];

            allMenuItems[15] = transformButton;

            let controlTab = scope.GetObject(scope.Enum.OBJECT_TYPE.TAB);
            controlTab.id = "ControlTab";
            controlTab.text = "RT0004";
            controlTab.groups = [renderGroup, shadowGroup, backgroundGroup, colorGroup, transformGroup];
 
            ribbon.Add(scope.Enum.OBJECT_TYPE.TAB, controlTab);
        }

        function note() {
            let ribbon = scope.Ribbon;

            // --------------------------------------------------------------------------------------------------- Note
            // 2D 노트
            let cbNote2D = function () {
                scope.AddNote(VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE);
            };
            let note2DButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            note2DButton.id = "Note2DButton";
            note2DButton.text = "RB0071";
            note2DButton.event.click = cbNote2D;
            note2DButton.icon.normal = "SH_btn_icon_note_2d";


            // 3D 노트
            let cbNote3D = function () {
                scope.AddNote(VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE);
            };
            let note3DButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            note3DButton.id = "Note3DButton";
            note3DButton.text = "RB0070";
            note3DButton.event.click = cbNote3D;
            note3DButton.icon.normal = "SH_btn_icon_note_3d";


            // 표면 노트
            let cbNoteSurface = function () {
                scope.AddNote(VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE);
            };
            let noteSurfaceButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            noteSurfaceButton.id = "NoteSurfaceButton";
            noteSurfaceButton.text = "RB0069";
            noteSurfaceButton.event.click = cbNoteSurface;
            noteSurfaceButton.icon.normal = "SH_btn_icon_note_surface";


            // 노트 삭제
            let cbNoteDelete = function () {
                vizcore.Main.Data.Review.DeleteSelectedReview();
                vizcore.Main.UIManager.HideMessage();
                vizcore.Render();
            };
            let noteDeleteButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            noteDeleteButton.id = "NoteDeleteButton";
            noteDeleteButton.text = "RB0072";
            noteDeleteButton.event.click = cbNoteDelete;
            noteDeleteButton.icon.normal = "SH_btn_icon_note_delete";


            // 노트 전체 삭제
            let cbNoteDeleteAll = function () {
                vizcore.Review.Note.DeleteAll();
                vizcore.Main.UIManager.HideMessage();
                vizcore.Render();
            };
            let noteDeleteAllButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            noteDeleteAllButton.id = "NoteDeleteAllButton";
            noteDeleteAllButton.text = "RB0073";
            noteDeleteAllButton.event.click = cbNoteDeleteAll;
            noteDeleteAllButton.icon.normal = "SH_btn_icon_note_delete_all";

            let noteGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            noteGroup.id = "NoteGroup";
            noteGroup.text = "RG0021";
            noteGroup.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            noteGroup.buttons = [noteSurfaceButton, note3DButton, note2DButton, noteDeleteButton, noteDeleteAllButton];

            let noteButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            noteButton.id = "NoteButton";
            noteButton.text = "TG0009";
            noteButton.style.type = scope.Enum.BUTTON_STYLE.NORMAL;
            noteButton.icon.normal = "SH_btn_icon_note";
            noteButton.subButton = [note2DButton, note3DButton, noteSurfaceButton,  noteDeleteAllButton];

            allMenuItems[18] = noteButton;
 
            // --------------------------------------------------------------------------------------------------- Draw
            // 자유선
            let cbDrawFree = function () {
                vizcore.Review.DrawingMarkup.EnterDrawMode();
                vizcore.Review.DrawingMarkup.Add(VIZCore.Enum.SKETCH_TYPES.FREE);
            };
            let drawFreeButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            drawFreeButton.id = "DrawFreeButton";
            drawFreeButton.text = "RB0074";
            drawFreeButton.event.click = cbDrawFree;
            drawFreeButton.icon.normal =  "SH_btn_icon_draw_free";


            // 원
            let cbDrawCircle = function () {
                vizcore.Review.DrawingMarkup.EnterDrawMode();
                vizcore.Review.DrawingMarkup.Add(VIZCore.Enum.SKETCH_TYPES.CIRCLE);
            };
            let drawCircleButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            drawCircleButton.id = "DrawCircleButton";
            drawCircleButton.text = "RB0075";
            drawCircleButton.event.click = cbDrawCircle;
            drawCircleButton.icon.normal = "SH_btn_icon_draw_circle";

            // 선
            let cbDrawLine = function () {
                vizcore.Review.DrawingMarkup.EnterDrawMode();
                vizcore.Review.DrawingMarkup.Add(VIZCore.Enum.SKETCH_TYPES.LINE);
            };
            let drawLineButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            drawLineButton.id = "DrawLineButton";
            drawLineButton.text = "RB0076";
            drawLineButton.event.click = cbDrawLine;
            drawLineButton.icon.normal = "SH_btn_icon_draw_line";

            // 사각형
            let cbDrawRect = function () {
                vizcore.Review.DrawingMarkup.EnterDrawMode();
                vizcore.Review.DrawingMarkup.Add(VIZCore.Enum.SKETCH_TYPES.RECT);
            };
            let drawRectButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            drawRectButton.id = "DrawRectButton";
            drawRectButton.text = "RB0077";
            drawRectButton.event.click = cbDrawRect;
            drawRectButton.icon.normal = "SH_btn_icon_draw_rect";


            // 선택
            let cbDrawSelect = function () {
                vizcore.Review.DrawingMarkup.EnterDrawMode();
                vizcore.Review.DrawingMarkup.Add(VIZCore.Enum.SKETCH_TYPES.NONE);
            };
            let drawSelectButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            drawSelectButton.id = "DrawSelectButton";
            drawSelectButton.text = "RB0078";
            drawSelectButton.event.click = cbDrawSelect;
            drawSelectButton.icon.normal = "SH_btn_icon_draw_select";


            // 선택 삭제
            let cbDrawDelete = function () {
                vizcore.Main.Data.Review.DeleteSelectedReview();
                vizcore.Render();
            };
            let drawDeleteButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            drawDeleteButton.id = "DrawDeleteButton";
            drawDeleteButton.text = "RB0079";
            drawDeleteButton.event.click = cbDrawDelete;
            drawDeleteButton.icon.normal = "SH_btn_icon_draw_delete";


            // 전체 삭제
            let cbDrawDeleteAll = function () {
                vizcore.Review.DrawingMarkup.ExitDrawMode();
            };
            let drawDeleteAllButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            drawDeleteAllButton.id = "DrawDeleteAll";
            drawDeleteAllButton.text = "RB0080";
            drawDeleteAllButton.event.click = cbDrawDeleteAll;
            drawDeleteAllButton.icon.normal = "SH_btn_icon_draw_delete_all";


            let drawGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            drawGroup.id = "DrawGroup";
            drawGroup.text = "RG0022";
            drawGroup.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            drawGroup.buttons = [drawFreeButton, drawCircleButton, drawLineButton, drawRectButton, drawSelectButton, drawDeleteButton, drawDeleteAllButton];

            let drawButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            drawButton.id = "DrawButton";
            drawButton.text = "TG0010";
            drawButton.style.type = scope.Enum.BUTTON_STYLE.NORMAL;
            drawButton.icon.normal = "SH_btn_icon_draw";
            drawButton.subButton = [drawSelectButton, drawFreeButton, drawCircleButton, drawLineButton, drawRectButton,  drawDeleteAllButton];
            
            allMenuItems[19] = drawButton;

            let cbReview = function (bool) {
                reviewPanelTab = "Note";
                cbReviewPanel(bool);
            }

            let reviewPanelObject = scope.GetTabObjectByID("ReviewTab");

            let NoteReviewRibbon = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            NoteReviewRibbon.id = "NoteReviewButton";
            NoteReviewRibbon.text = "RB0081";
            NoteReviewRibbon.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            NoteReviewRibbon.event.click = cbReview;
            NoteReviewRibbon.icon.normal = reviewPanelObject.icon;

            let reviewPanelGroup = vizcore.UIElement.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            reviewPanelGroup.id = "NotePanelGroup";
            reviewPanelGroup.text = "RG0023";
            reviewPanelGroup.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            reviewPanelGroup.buttons = [NoteReviewRibbon];

            let noteTab = scope.GetObject(scope.Enum.OBJECT_TYPE.TAB);
            noteTab.id = "NoteTab";
            noteTab.text = "RT0005";
            noteTab.groups = [noteGroup, drawGroup, reviewPanelGroup];

            ribbon.Add(scope.Enum.OBJECT_TYPE.TAB, noteTab);
        }

        function measure() {
            let ribbon = scope.Ribbon;

            // ----------------------------------------------------------------------------------------------Measure
            // 단일 측정
            let cbMeasureCoordinate = function () {
                vizcore.Review.Measure.AddPosition();
            };
            let measureCoordinate = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measureCoordinate.id = "PositionButton";
            measureCoordinate.text = "RB0082";
            if (scope.IsMobile()) {
                measureCoordinate.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            } else {
                measureCoordinate.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            }
            measureCoordinate.event.click = cbMeasureCoordinate;
            measureCoordinate.icon.normal = "SH_btn_icon_measure_position";


            // 거리 측정
            let cbMeasure2posdistance = function () {
                vizcore.Review.Measure.AddDistance();
            };
            let measure2posdistance = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measure2posdistance.id = "DistanceButton";
            measure2posdistance.text = "RB0083";
            measure2posdistance.event.click = cbMeasure2posdistance;
            measure2posdistance.icon.normal = "SH_btn_icon_measure_distance";


            // 각도 측정
            let cbMeasureAngle = function () {
                vizcore.Review.Measure.AddAngle();
            };
            let measureAngle = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measureAngle.id = "AngleButton";
            measureAngle.text = "RB0084";
            measureAngle.event.click = cbMeasureAngle;
            measureAngle.icon.normal ="SH_btn_icon_measure_angle";


            // 면적 측정
            let cbMeasurLinkarea = function () {
                vizcore.Review.Measure.AddLinkArea();
            };
            let measureLinkarea = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measureLinkarea.id = "LinkAreaButton";
            measureLinkarea.text = "RB0085";
            measureLinkarea.event.click = cbMeasurLinkarea;
            measureLinkarea.icon.normal = "SH_btn_icon_measure_link_area";


            let measureGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            measureGroup.id = "MeasureGroup";
            measureGroup.text = "RG0024";
            measureGroup.style.size = scope.Enum.OBJECT_SIZE.ALL;
            if(scope.IsMobile()){
                measureGroup.buttons = [measureCoordinate, measure2posdistance, measureAngle];
            } else {
                measureGroup.buttons = [measureCoordinate, measure2posdistance, measureAngle, measureLinkarea];
            }
            // ---------------------------------------------------------------------------------------------- 정밀 측정
            // 최단 거리
            let cbMeasureMinDistance = function () {
                vizcore.Review.Measure.AddObjectMinDistance();
            };
            let measureMinDistance = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measureMinDistance.id = "MeasureMinDistanceButton";
            measureMinDistance.text = "RB0095";
            measureMinDistance.event.click = cbMeasureMinDistance;
            measureMinDistance.icon.normal = "SH_btn_icon_measure_min_distance";

            //  실린더 교차점
            let cbMeasureCylinderCylinderCrossPoint = function () {
                vizcore.Review.Measure.AddCylinderCylinderCrossPoint();
            };
            let measureCylinderCylinderCrossPoint = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measureCylinderCylinderCrossPoint.id = "MeasureCylinderCylinderCrossPointButton";
            measureCylinderCylinderCrossPoint.text = "RB0092";
            measureCylinderCylinderCrossPoint.event.click = cbMeasureCylinderCylinderCrossPoint;
            measureCylinderCylinderCrossPoint.icon.normal = "SH_btn_icon_measure_cylinder_cross";

            // 실린더 면 거리
            let cbMeasureCylinderPlaneDistance = function () {
                vizcore.Review.Measure.AddCylinderPlaneDistance();
            };
            let measureCylinderPlaneDistance = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measureCylinderPlaneDistance.id = "MeasureCylinderPlaneDistanceButton";
            measureCylinderPlaneDistance.text = "RB0093";
            measureCylinderPlaneDistance.event.click = cbMeasureCylinderPlaneDistance;
            measureCylinderPlaneDistance.icon.normal ="SH_btn_icon_measure_min_BOP";

            // 수평거리
            let cbHorizontalityDistance = function () {
                vizcore.Review.Measure.AddHorizontalityDistance();
            };
            let horizontalityDistance = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            horizontalityDistance.id = "HorizontalityDistanceButton";
            horizontalityDistance.text = "RB0091";
            horizontalityDistance.event.click = cbHorizontalityDistance;
            horizontalityDistance.icon.normal = "SH_btn_icon_measure_horizontality";

            // 연속거리
            let cbLinkedDistance = function () {
                vizcore.Review.Measure.AddLinkedDistance();
            };
            let linkedDistance = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            linkedDistance.id = "MeasureLinkedDistanceButton";
            linkedDistance.text = "RB0089";
            linkedDistance.event.click = cbLinkedDistance;
            linkedDistance.icon.normal = "SH_btn_icon_measure_linked";

            // 면 거리 측정
            let cbSurfaceDistance = function () {
                vizcore.Review.Measure.AddSurfaceDistance();
            };
            let measuresurfaceDistanceButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measuresurfaceDistanceButton.id = "MeasureSurfaceDistanceButton";
            measuresurfaceDistanceButton.text = "RB0094";
            measuresurfaceDistanceButton.event.click = cbSurfaceDistance;
            measuresurfaceDistanceButton.icon.normal = "SH_btn_icon_measure_planes";

            // 점 - 여러점 거리
            let cbOnePointFixedDistance = function () {
                vizcore.Review.Measure.AddOnePointFixedDistance();
            };
            let measureOnePointFixedDistanceButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measureOnePointFixedDistanceButton.id = "MeasureOnePointFixedDistanceButton";
            measureOnePointFixedDistanceButton.text = "RB0090";
            measureOnePointFixedDistanceButton.event.click = cbOnePointFixedDistance;
            measureOnePointFixedDistanceButton.icon.normal ="SH_btn_icon_measure_point_to_point";

            // X축 방향 거리
            let cbXAxisDistance = function () {
                vizcore.Review.Measure.AddXAxisDistance();
            };
            let measureXAxisDistanceButtom = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measureXAxisDistanceButtom.id = "MeasureXAxisDistanceButtom";
            measureXAxisDistanceButtom.text = "RB0086";
            measureXAxisDistanceButtom.event.click = cbXAxisDistance;
            measureXAxisDistanceButtom.icon.normal = "SH_btn_icon_measure_x_dir";

            // Y축 방향 거리
            let cbYAxisDistance = function () {
                vizcore.Review.Measure.AddYAxisDistance();
            };
            let measureYAxisDistanceButtom = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measureYAxisDistanceButtom.id = "MeasureYAxisDistanceButtom";
            measureYAxisDistanceButtom.text = "RB0087";
            measureYAxisDistanceButtom.event.click = cbYAxisDistance;
            measureYAxisDistanceButtom.icon.normal = "SH_btn_icon_measure_y_dir";

            // Z축 방향 거리
            let cbMeasureZAxisDistance = function () {
                vizcore.Review.Measure.AddZAxisDistance();
            };
            let measureZAxisDistanceButtom = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measureZAxisDistanceButtom.id = "MeasureZAxisDistanceButton";
            measureZAxisDistanceButtom.text = "RB0088";
            measureZAxisDistanceButtom.event.click = cbMeasureZAxisDistance;
            measureZAxisDistanceButtom.icon.normal = "SH_btn_icon_measure_z_dir";

            // 자동 측정
            let cbMeasureSmartAxisDistance = function () {
                vizcore.Review.Measure.AddSmartAxisDistance();
            };
            let measureSmartAxisDistanceButtom = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measureSmartAxisDistanceButtom.id = "MeasureSmartAxisDistanceButtom";
            measureSmartAxisDistanceButtom.text = "RB0096";
            measureSmartAxisDistanceButtom.event.click = cbMeasureSmartAxisDistance;
            measureSmartAxisDistanceButtom.icon.normal ="SH_btn_icon_measure_smart";

            // 선택 삭제
            let cbDelete = function () {
                vizcore.Main.Data.Review.DeleteSelectedReview();
                vizcore.Main.UIManager.HideMessage();
                vizcore.Render();
            };
            let measureDeleteButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measureDeleteButton.id = "MeasureDeleteButton";
            measureDeleteButton.text = "RB0097";
            measureDeleteButton.event.click = cbDelete;
            measureDeleteButton.icon.normal = "SH_btn_icon_measure_delete";

            // 전체 삭제
            let cbDeleteAll = function () {
                vizcore.Review.Measure.DeleteAll();
                vizcore.Main.UIManager.HideMessage();
                vizcore.Render();
            };
            let measureDeleteAllButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measureDeleteAllButton.id = "MeasureDeleteAllButton";
            measureDeleteAllButton.text = "RB0098";
            measureDeleteAllButton.event.click = cbDeleteAll;
            measureDeleteAllButton.icon.normal ="SH_btn_icon_measure_delete_all";

            // 면과 면 최단거리
            let cbMeasureSurfaceMinDistance = function () {
                vizcore.Review.Measure.AddSurfaceMinDistance();
            };
            let measureSurfaceMinDistanceButton = scope.GetObject(scope.Enum.OBJECT_SIZE.BUTTON);
            measureSurfaceMinDistanceButton.id = "MeasureSurfaceMinDistanceButton";
            measureSurfaceMinDistanceButton.text = "RB0121";
            measureSurfaceMinDistanceButton.event.click = cbMeasureSurfaceMinDistance;
            measureSurfaceMinDistanceButton.icon.normal ="SH_btn_icon_measure_face_to_face";

            // 면과 점 최단거리
            let cbMeasureSurfacePointMinDistance = function () {
                vizcore.Review.Measure.AddSurfacePointMinDistance();
            };
            let measureSurfacePointMinDistanceButton = scope.GetObject(scope.Enum.OBJECT_SIZE.BUTTON);
            measureSurfacePointMinDistanceButton.id = "MeasureSurfacePointMinDistanceButton";
            measureSurfacePointMinDistanceButton.text = "RB0122";
            measureSurfacePointMinDistanceButton.event.click = cbMeasureSurfacePointMinDistance;
            measureSurfacePointMinDistanceButton.icon.normal ="SH_btn_icon_measure_face_to_point";

            let detaileMeasureGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            detaileMeasureGroup.id = "DetaileMeasureGroup";
            detaileMeasureGroup.text = "RG0025";
            detaileMeasureGroup.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            if(scope.IsMobile()){
                detaileMeasureGroup.buttons = [measureXAxisDistanceButtom, measureYAxisDistanceButtom, measureZAxisDistanceButtom, horizontalityDistance, measureCylinderCylinderCrossPoint, measureCylinderPlaneDistance, measuresurfaceDistanceButton, measureMinDistance, measureDeleteButton, measureDeleteAllButton];
            } else {
                detaileMeasureGroup.buttons = [measureXAxisDistanceButtom, measureYAxisDistanceButtom, measureZAxisDistanceButtom, linkedDistance, measureOnePointFixedDistanceButton, horizontalityDistance, measureCylinderCylinderCrossPoint, measureCylinderPlaneDistance, measuresurfaceDistanceButton, measureSurfaceMinDistanceButton, measureSurfacePointMinDistanceButton, measureMinDistance, measureSmartAxisDistanceButtom, measureDeleteButton, measureDeleteAllButton];
            }

            let cbReview = function (bool) {
                reviewPanelTab = "Measure";
                cbReviewPanel(bool);
            }

            let reviewPanelObject = scope.GetTabObjectByID("ReviewTab");
            let MeasureReviewRibbon = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            MeasureReviewRibbon.id = "MeasureReviewButton";
            MeasureReviewRibbon.text = "RB0099";
            MeasureReviewRibbon.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            MeasureReviewRibbon.event.click = cbReview;
            MeasureReviewRibbon.icon.normal = reviewPanelObject.icon;

            let reviewPanelGroup = vizcore.UIElement.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            reviewPanelGroup.id = "MeasurePanelGroup";
            reviewPanelGroup.text = "RG0026";
            reviewPanelGroup.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            reviewPanelGroup.buttons = [MeasureReviewRibbon];

            let measureButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            measureButton.id = "MeasureButton";
            measureButton.text = "RT0006";
            measureButton.style.type = scope.Enum.BUTTON_STYLE.NORMAL;
            measureButton.icon.normal = "SH_btn_icon_measure";
            measureButton.subButton = [measureCoordinate, measure2posdistance, measureAngle,  measureLinkarea, measureMinDistance, measureDeleteAllButton];

            allMenuItems[17] = measureButton;

            let measureTab = scope.GetObject(scope.Enum.OBJECT_TYPE.TAB);
            measureTab.id = "MeasurementTab";
            measureTab.text = "RT0006";
            measureTab.groups = [measureGroup, detaileMeasureGroup, reviewPanelGroup];
 
            ribbon.Add(scope.Enum.OBJECT_TYPE.TAB, measureTab);
        }

        function section() {
            let ribbon = scope.Ribbon;
            // ---------------------------------------------------------------------------------------------------Clipping
            // Clipping X
            let cbClippingYZ = function () {
                vizcore.Section.Create(VIZCore.Enum.CLIPPING_MODES.X);
                scope.SetCheckButton("ClippingShowButton", true);
            };
            let clippingYZButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            clippingYZButton.id = "ClippingYZButton";
            clippingYZButton.text = "RB0100";
            clippingYZButton.event.click = cbClippingYZ;
            clippingYZButton.icon.normal = "SH_btn_icon_clipping_x";

            // Clipping Y
            let cbClippingZX = function () {
                vizcore.Section.Create(VIZCore.Enum.CLIPPING_MODES.Y);
                scope.SetCheckButton("ClippingShowButton", true);
            };
            let clippingZXButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            clippingZXButton.id = "ClippingZXButton";
            clippingZXButton.text = "RB0101";
            clippingZXButton.event.click = cbClippingZX;
            clippingZXButton.icon.normal = "SH_btn_icon_clipping_y";

            // Clipping Z
            let cbClippingXY = function () {
                vizcore.Section.Create(VIZCore.Enum.CLIPPING_MODES.Z);
                scope.SetCheckButton("ClippingShowButton", true);

            };
            let clippingXYButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            clippingXYButton.id = "ClippingXYButton";
            clippingXYButton.text = "RB0102";
            clippingXYButton.event.click = cbClippingXY;
            clippingXYButton.icon.normal = "SH_btn_icon_clipping_z";

            // Clipping Select Box
            let cbClippingSelectBox = function () {
                let selObjects = vizcore.Object3D.GetSelectedObject3D();
                if (selObjects.length === 0) {
                    vizcore.Main.UIManager.ShowMessage("MG0015", true, vizcore.UIElement.Enum.STATUS_TYPE.WARNING);
                    scope.SetCheckButton("ClippingShowButton", false);
                    return;
                }
                ribbon.SetCheckButton("ClippingShowButton", true);
                vizcore.Section.Create(VIZCore.Enum.CLIPPING_MODES.SELECTBOX);
            };
            let clippingSelectBoxButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            clippingSelectBoxButton.id = "ClippingSelectBoxButton";
            clippingSelectBoxButton.text = "RB0103";
            clippingSelectBoxButton.event.click = cbClippingSelectBox;
            clippingSelectBoxButton.icon.normal = "SH_btn_icon_clipping_select_box";

            // Clipping Box
            let cbClippingBox = function () {
                vizcore.Section.Create(VIZCore.Enum.CLIPPING_MODES.BOX);
                scope.SetCheckButton("ClippingShowButton", true);
            };
            let clippingBoxButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            clippingBoxButton.id = "ClippingBoxButton";
            clippingBoxButton.text = "RB0104";
            clippingBoxButton.event.click = cbClippingBox;
            clippingBoxButton.icon.normal = "SH_btn_icon_clipping_box";

            let clippingGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            clippingGroup.id = "SectioningGroup";
            clippingGroup.text = "RG0027";
            clippingGroup.style.size = scope.Enum.OBJECT_SIZE.SMALL;
            clippingGroup.buttons = [clippingYZButton, clippingZXButton, clippingXYButton, clippingSelectBoxButton, clippingBoxButton];
            // ---------------------------------------------------------------------------------------------------Inverse
            // Inverse
            let cbClippingInverse = function () {
                if (!vizcore.Section.IsClipping()) {
                    vizcore.Main.UIManager.ShowMessage("MG0016", true, vizcore.UIElement.Enum.STATUS_TYPE.WARNING);
                    scope.SetCheckButton("ClippingShowButton", false);
                    return;
                }

                vizcore.Section.Inverse();
            };
            let clippingInverseButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            clippingInverseButton.id = "ClippingInverseButton";
            clippingInverseButton.text = "RB0105";
            clippingInverseButton.event.click = cbClippingInverse;
            clippingInverseButton.icon.normal = "SH_btn_icon_clipping_inverse";

            let clippingInverseGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            clippingInverseGroup.id = "ClippingInverseGroup";
            clippingInverseGroup.text = "RG0028";
            clippingInverseGroup.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            clippingInverseGroup.buttons = [clippingInverseButton];
            // ---------------------------------------------------------------------------------------------------옵션
            // 단면 전체 보이기/숨기기
            let cbClippingShow = function (bool) {
                if (!vizcore.Section.IsClipping()) {
                    vizcore.Main.UIManager.ShowMessage("MG0016", true, vizcore.UIElement.Enum.STATUS_TYPE.WARNING);
                    scope.SetCheckButton("ClippingShowButton", false);
                    return;
                }

                vizcore.Section.Show(bool);
            };
            let clippingShowButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            clippingShowButton.id = "ClippingShowButton";
            clippingShowButton.text = "RB0106";
            clippingShowButton.style.type = scope.Enum.BUTTON_STYLE.CHECK;
            clippingShowButton.event.click = cbClippingShow;
            clippingShowButton.icon.normal = "SH_btn_icon_clipping_visible";

            // 색상
            let cbSetColorClipping = function () {
                let selectColor = new VIZCore.Color();
                selectColor = vizcore.Main.ColorPicker.GetPickColor();

                vizcore.Configuration.Section.Style.Color = selectColor;
                vizcore.Section.ChangeColor();
            };
            let cbShowColorPicker = function () {
                vizcore.Main.ColorPicker.Show(true);
                vizcore.Main.ColorPicker.Callback = cbSetColorClipping;

                // vizcore.Render();
            };
            let clippingColorButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            clippingColorButton.id = "ClippingColorButton";
            clippingColorButton.text = "RB0107";
            clippingColorButton.event.click = cbShowColorPicker;
            clippingColorButton.icon.normal = "SH_btn_icon_clipping_color";

            let clippingOptionGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            clippingOptionGroup.id = "ClippingOptionGroup";
            clippingOptionGroup.text = "RG0029";
            clippingOptionGroup.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            clippingOptionGroup.buttons = [clippingShowButton, clippingColorButton];
            // --------------------------------------------------------------------------------------------------- 삭제
            // 단면 삭제
            let cbSectionDelete = function () {
                vizcore.Section.Clear();
                scope.SetCheckButton("ClippingShowButton", false);
                scope.SetCheckButton("ClippingShowPlaneButton", false);
                scope.SetCheckButton("ClippingShowLineButton", false);
            };
            let sectionDeleteButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            sectionDeleteButton.id = "SectionDeleteButton";
            sectionDeleteButton.text = "RB0108";
            sectionDeleteButton.event.click = cbSectionDelete;
            sectionDeleteButton.icon.normal  = "SH_btn_icon_clipping_delete";

            let sectionDeleteGroup = scope.GetObject(scope.Enum.OBJECT_TYPE.GROUP);
            sectionDeleteGroup.id = "SectionDelete";
            sectionDeleteGroup.text = "RG0030";
            sectionDeleteGroup.style.size = scope.Enum.OBJECT_SIZE.LARGE;
            sectionDeleteGroup.buttons = [sectionDeleteButton];

            let sectionTab = scope.GetObject(scope.Enum.OBJECT_TYPE.TAB);
            sectionTab.id = "SectionTab";
            sectionTab.text = "RT0007";
            sectionTab.groups = [clippingGroup, clippingInverseGroup, clippingOptionGroup, sectionDeleteGroup];

            let sectionButton = scope.GetObject(scope.Enum.OBJECT_TYPE.BUTTON);
            sectionButton.id = "SectionButton";
            sectionButton.text = "TG0008";
            sectionButton.style.type = scope.Enum.BUTTON_STYLE.NORMAL;
            sectionButton.icon.normal = "SH_btn_icon_clipping";
            sectionButton.subButton = [clippingYZButton, clippingZXButton, clippingXYButton, clippingSelectBoxButton, clippingBoxButton, clippingInverseButton, sectionDeleteButton];

            allMenuItems[16] = sectionButton;
 
            ribbon.Add(scope.Enum.OBJECT_TYPE.TAB, sectionTab);
        }

        function viewControlResetMode(){
            vizcore.View.Control.InitialState();

            if(vizcore.Configuration.Control.Version === 2){
                scope.SetCheckButton("CATIAModeButton", true);
                scope.SetCheckButton("ControlFreeButton", true);
            }
        }

        // 초기 리본 바 설정
        this.InitSetting = function () {
            let viewCoodVisible = vizcore.Configuration.Render.CoordinateAxis.Visible;
            scope.SetCheckButton("ViewCoordinateAxisButton", viewCoodVisible);

            let viewCubeVisible = vizcore.View.ViewCube.IsVisible();
            scope.SetCheckButton("ViewCubeButton", viewCubeVisible);

            viewControlResetMode();

            scope.SetLanguage(vizcore.Configuration.Language);
        }

        let onCameraModeChangedEvent = function (e) {
            scope.Ribbon.SetCheckButtons(["ControlFixingZButton", "ControlFreeButton", "ControlConstrainedeOrbitButton", "ControlPanButton", "ControlOrbitButton"], false);

            switch (e.data) {
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_FIXEDZ:
                    scope.SetCheckButton("ControlFixingZButton", true);
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ORBIT:
                    scope.SetCheckButton("ControlOrbitButton", true);
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE:
                    scope.SetCheckButton("ControlFreeButton", true);
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.ROTATE_WFIXEDZ:
                    scope.SetCheckButton("ControlConstrainedeOrbitButton", true);
                    break;
                case VIZCore.Enum.MOUSE_CONTROL_SUB_TYPE.PAN:
                    scope.SetCheckButton("ControlPanButton", true);
                    break;
            }
        }

        vizcore.View.Control.OnCameraModeChangedEvent(onCameraModeChangedEvent);

        // 노트 element 설정
        this.AddNote = function (type) {
            scope.Element.Note.style.display = "block";
            if (type === VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE) {
                scope.Element.Note.Title.innerText = "2D Note";
                this.Element.Note.Button_Surface.style.display = "none";
                noteType = VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE;
                scope.Element.Note.Title.setAttribute("data-language", "RB0071");
            }
            else if (type === VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE) {
                scope.Element.Note.Title.innerText = "3D Note";
                this.Element.Note.Button_Surface.style.display = "none";
                noteType = VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE;
                scope.Element.Note.Title.setAttribute("data-language", "RB0070");
            }
            else if (type === VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE) {
                scope.Element.Note.Title.innerText = "Surface Note";
                this.Element.Note.Button_Surface.style.display = "block";
                noteType = VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE;
                scope.Element.Note.Title.setAttribute("data-language", "RB0069");
            }

            scope.SetLanguage(vizcore.Configuration.Language);
        };

        function cbNoteButtonEvent() {
            let text = scope.Element.Note.TextArea.value;
            let arr = text.split('\n');

            // 텍스트 생성
            if (text.length === 0) {
                vizcore.Main.UIManager.ShowMessage("MG0017", true, vizcore.UIElement.Enum.STATUS_TYPE.WARNING);
                return;
            }

            scope.Element.Note.style.display = "none";

            if (noteType === VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE) {
                vizcore.Review.Note.AddNote2D(arr);
            }
            else if (noteType === VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE) {
                vizcore.Review.Note.AddNote3D(arr);
            }
            else if (noteType === VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE) {
                vizcore.Review.Note.AddNoteSurface(arr);
            }

            scope.Element.Note.TextArea.value = "";
        }

        this.Init = function () {
            initElement();

            scope.Ribbon = new RibbonBar(scope);
            scope.Ribbon.Show(true);

            scope.DockPanel = new DockPanel(scope, vizcore, VIZCore);
            scope.DockPanel.Init();

            statusbar = new StatusBar(scope, vizcore);

            toolbar = new Toolbar(scope, vizcore);

            message = new Message(scope);

            noteElement();
        
            home();
            look();
            navigation();
            control();
            note();
            measure();
            section();

            toolbar.Add(allMenuItems);

            let walkbtn = scope.Ribbon.GetMenuById("WalkthroughButton");
            let flybtn = scope.Ribbon.GetMenuById("FlyButton");

            if (vizcore.Main.IsVIZWide3DProduct() === true)
                toolbar.AddSub("ControlButton", [walkbtn, flybtn]);

            let treeVisible = vizcore.Configuration.Tree.Visible;
            if (treeVisible) {
                let tree = scope.GetTabObjectByID("ModelTreeTab");
                tree.floating = true;

                vizcore.UIElement.DockPanel.AddTab(tree);
                vizcore.UIElement.DockPanel.SetActiveTab(tree.id, treeVisible);

                scope.SetCheckButton(tree.id, treeVisible);
            }

            if (vizcore.Configuration.Type === undefined)
                vizcore.Configuration.Type = VIZCore.Enum.UI_TYPE.RIBBONBAR;

            scope.SetType(vizcore.Configuration.Type);
        };

        this.IsMobile = () => {
            // return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const { userAgent, maxTouchPoints } = window.navigator;

            if (maxTouchPoints > 0) return true;

            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi|mobi/i.test(
                userAgent
            );

        };


        this.GetViewElement = () =>{
            return view;
        };

        /**
         * Toolbar 가져오기
         * @returns {Object} Toolbar
         * @example  
         * 
         * let toolbar = vizcore.UIElement.GetToolbar();
         */
        this.GetToolbar = function () {
            return toolbar;
        }

        /**
         * Ribbonbar 가져오기
         * @returns {Object} Ribbonbar
         * @example  
         * 
         * let ribbonbar = vizcore.UIElement.GetRibbonbar();
         */
        this.GetRibbonbar = function(){
            return scope.Ribbon;
        }

        /**
         * Statusbar 가져오기
         * @returns {Object} Statusbar
         * @example  
         * 
         * let statusbar = vizcore.UIElement.GetStatusbar();
         */
        this.GetStatusbar = function(){
            return statusbar;
        }

        this.GetMessage = function(){
            return message;
        }

        /**
         * UI 전체 보이기/숨기기(RibbonBar, StatusBar, DockPanel)
         * @param {Boolean} show : show
         * @example  
         * 
         * vizcore.UIElement.Show(true);
         * vizcore.UIElement.Show(false);
         */
        this.Show = function (show) {
            scope.DockPanel.Show(show);
            scope.Ribbon.Show(show);
            scope.GetStatusbar().Show(show);
        }

        /**
         * id로 Dock Paenl object 가져오기
         * @param {String} id : id
         * @example  
         * 
         * vizcore.UIElement.GetTabObjectByID("ModelTreeTab");
         */
        this.GetTabObjectByID = function(id) {
            let obj = scope.Ribbon.TabItemObject.get(id);

            return obj;
        }

        /**
         * Id로 Toolbar, Ribbonbar 버튼 on/off 설정
         * @param {String} id : id
         * @param {Boolean} check : show
         * @example  
         * 
         * vizcore.UIElement.SetCheckButton(id, true);
         * vizcore.UIElement.SetCheckButton(id, false);
         */
        this.SetCheckButton = function (id, check) {
            if (scope.Ribbon) {
                scope.Ribbon.SetCheckButton(id, check);
            }

            if (toolbar) {
                toolbar.SetCheckButton(id, check);
            }
        };

        /**
         * Id로 Toolbar, Ribbonbar 버튼 enable/disable 설정
         * @param {String} id : id
         * @param {Boolean} enable : enable/disable
         * @example  
         * 
         * vizcore.UIElement.SetEnableButton(id, true);
         * vizcore.UIElement.SetEnableButton(id, false);
         */
        this.SetEnableButton = function(id, enable) {
            if (scope.Ribbon) {
                scope.Ribbon.SetEnableButton(id, enable);
            }

            if (toolbar) {
                toolbar.SetEnableButton(id, enable);
            }
        }

        this.SetVisibleButton = function(id, visible){
            if (scope.Ribbon) {
                scope.Ribbon.SetVisibleButton(id, visible);
            }

            if (toolbar) {
                toolbar.SetVisibleButton(id, visible);
            }
        }

        /**
         * type에 따른 object 반환
         * @param {vizcore.UIElement.Enum.OBJECT_TYPE} type : Tab / Group/ Button
         * @example  
         * 
         * vizcore.UIElement.GetObject(vizcore.UIElement.Enum.OBJECT_TYPE.TAB);
         * vizcore.UIElement.GetObject(vizcore.UIElement.Enum.OBJECT_TYPE.GROUP);
         * vizcore.UIElement.GetObject(vizcore.UIElement.Enum.OBJECT_TYPE.BUTTON);
         */
        this.GetObject = function (type) {

            if (type === undefined)
                type = scope.Enum.OBJECT_TYPE.BUTTON;

            let object = {};

            if (type === scope.Enum.OBJECT_TYPE.TAB){
                object = {
                    id: undefined,
                    text: undefined,
                    groups: undefined,  //tab 하위 group
                };
            }
            else if (type === scope.Enum.OBJECT_TYPE.GROUP){
                object = {
                    id: undefined,
                    text: undefined,
                    style: {
                        size: scope.Enum.OBJECT_SIZE.SMALL,   
                    },
                    buttons: undefined,  // group 하위 button
                };
            }
            else if (type === scope.Enum.OBJECT_TYPE.BUTTON){
                object = {
                    id: undefined,
                    text: undefined,
                    icon: {
                        normal: undefined,
                        check: undefined,
                    },
                    event: {
                        click: undefined,
                    },
                    style: {
                        type: scope.Enum.BUTTON_STYLE.NORMAL,   //버튼 기본, check, radio, custom
                        size: scope.Enum.OBJECT_SIZE.SMALL,   // ribbonbar 전용 버튼 크기 
                    },
                    status: {
                        visible: true,
                        enable: true, //활성 or 비활성화
                        check: false, //style.type = check or radio 
                    },
                    subButton: undefined,   //toolbar 전용 subbutton
                    content: undefined, // custom element
                };
            }

            return object;
        };


        this.IsCheckButton = function (type) {

            let checkBtn = false;

            if (type === scope.Enum.BUTTON_STYLE.CHECK)
                checkBtn = true;

            return checkBtn;
        }

        this.GetButtonStyleType = function (checkBtn) {

            let type = scope.Enum.BUTTON_STYLE.NORMAL;

            if (checkBtn === true)
                type = scope.Enum.BUTTON_STYLE.CHECK;

            return type;
        }

        this.UseCSSIcon = function (text){
            let result = false;
            if(!text){
                return result;
            }

            if (text.includes('SH_btn_icon') === true)
                result = true;

                return result;
        }

        // toolbar 위치 변경 이벤트
        this.OnToolbarMoveEvent = function(pos) {

        }
        
        /**
         * UI Type 설정
         * @param {VIZCore.Enum.UI_TYPE} type : VIZCore.Enum.UI_TYPE.RIBBONBAR
         * @example  
         * 
         * vizcore.UIElement.SetType(VIZCore.Enum.UI_TYPE.RIBBONBAR);
         * vizcore.UIElement.SetType(VIZCore.Enum.UI_TYPE.TOOLBAR);
         */
        this.SetType = function (value) {
            switch (value){
                case VIZCore.Enum.UI_TYPE.RIBBONBAR:{
                    scope.GetToolbar().Show(false);
                    scope.Ribbon.Show(true);
                    scope.GetStatusbar().Show(true);
                }
                break;
                case VIZCore.Enum.UI_TYPE.TOOLBAR:{
                    scope.GetToolbar().Show(true);
                    scope.Ribbon.Show(false);
                    scope.GetStatusbar().Show(false);
                }
                break;
                default:{
                    scope.GetToolbar().Show(false);
                    scope.Ribbon.Show(false);
                    scope.GetStatusbar().Show(false);
                }
                break;
            }
            vizcore.Main.Configuration.Type = value;
        }

        /**
         * UI theme 설정
         * @param {VIZCore.Enum.UI_TYPE} type : timeout
         * @example  
         * 
         * vizcore.UIElement.SetMode(vizcore.UIElement.Enum.THEME_TYPE.LIGHT);
         * vizcore.UIElement.SetMode(vizcore.UIElement.Enum.THEME_TYPE.DARK);
         * vizcore.UIElement.SetMode(vizcore.UIElement.Enum.THEME_TYPE.LIGHT_ORANGE);
         * vizcore.UIElement.SetMode(vizcore.UIElement.Enum.THEME_TYPE.DARK_ORANGE);
         */
        this.SetMode = function (value) {
            //테마 변경
            switch (value) {
                case 0:
                    document.body.setAttribute('data-light-orange', 'false');
                    document.body.setAttribute('data-dark', 'false');
                    document.body.setAttribute('data-dark-orange', 'false');
                    break;
                case 1:
                    document.body.setAttribute('data-light-orange', 'false');
                    document.body.setAttribute('data-dark', 'true');
                    document.body.setAttribute('data-dark-orange', 'false');
                    break;
                case 2:
                    document.body.setAttribute('data-light-orange', 'true');
                    document.body.setAttribute('data-dark', 'false');
                    document.body.setAttribute('data-dark-orange', 'false');
                    break;
                case 3:
                    document.body.setAttribute('data-light-orange', 'false');
                    document.body.setAttribute('data-dark', 'false');
                    document.body.setAttribute('data-dark-orange', 'true');
                    break;
            }


        }

        this.SetLanguage = function (value) {
            let changeList = document.querySelectorAll('[data-language]');

            let language = undefined;

            if(value === 0){
                language = "KR";
            } else {
                language = "EN";
            }

            changeList.forEach(v => {
                let text = vizcore.Language[language][v.dataset.language];
                if(text) {
                    v.innerText = text;
                }
            });

            if (value === 0)
                vizcore.Configuration.ViewCube.Language = VIZCore.Enum.LANGUAGE_KEY.KOREAN;
            else if (value === 1)
                vizcore.Configuration.ViewCube.Language = VIZCore.Enum.LANGUAGE_KEY.ENGLISH;

            vizcore.Render();

            scope.DockPanel.SetLanguage(value);

            toolbar.SetLanguage(value);

            vizcore.Main.Configuration.Language = value;
        }
    }
};

export default UI_Element;
