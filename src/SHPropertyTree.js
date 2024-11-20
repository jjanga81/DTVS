class SHPropertyTree {
    constructor(view, VIZCore) {
        let scope = this; // Instance
        this.Visible = true; // 보이기/숨기기 관리

        let div_scroll; // Scroll Element
        let canvas_tree; // Tree Canvas
        let ctx_tree; // Tree Context
        let ctx_scroll; // Scroll Context
        let div_tree; // Tree Element

        let itemMetrics; // 위치 계산용 변수
        let drawCnt = 40; // 화면상에 그려야 하는 수량 관리
        let loadingCompleted = false; // Property 다운로드 상태 관리
        let initialized = false; // 초기화 상태 관리
        let cbClose = undefined; // 닫기 이벤트 콜백

        // Draw Info
        let font = {
            // face: "Arial",
            // size: 12,
            // color: new VIZCore.Color(23, 72, 76, 255)
            face: view.Configuration.Tree.Style.Font.Face,
            size: view.Configuration.Tree.Style.Font.Size,
            color: view.Configuration.Tree.Style.Font.Color
        };
        let drawinfo = {
            width: 24,
            height: 24,
            height_img: 24,
            height_text: 18,
            size_img: 24,
            offset_image: view.Configuration.Tree.Icon.Offset,
            offset_split: 3,
            color: {
                back: new VIZCore.Color(255, 255, 255, 127),
                select: new VIZCore.Color(68, 68, 68, 80),
            },
        };

        // Scroll Info
        let scrollinfo_x = {
            rect: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            space: 30,
            size: 16,
            min: 0,
            max: 100,
            step: 1,
            pos: 16,
            enable: true
        };

        let scrollinfo_y = {
            rect: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            space: 30,
            size: 16,
            min: 0,
            max: 100,
            step: 1,
            pos: 1,
            enable: true
        };

        // Scroll 객체 반환
        let scrollinfo = function () {
            return {
                space: 30,
                enable: false,
                drawlength: 40,
                size: 18,
                // 전체 외각 정보
                rect: {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                },
                // 스크롤 박스 정보
                rect_scroll: {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                },
                // 스크롤 아이템 정보
                scroll: {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    interval: 1,
                    pos: 0,
                    min: 0,
                    max: 100,
                    min_width: 20,
                    min_height: 20,
                    max_height: 0,
                    max_width: 0,
                },
                // 버튼 정보
                button: {
                    size: 18,
                },
                color: {
                    back: new VIZCore.Color(241, 241, 241, 255),//back: new VIZCore.Color(230, 230, 230, 255),
                    box: new VIZCore.Color(241, 241, 241, 127),//box: new VIZCore.Color(54, 175, 184, 127),
                    button: new VIZCore.Color(241, 241, 241, 255),//button: new VIZCore.Color(230, 230, 230, 255),
                    scroll: new VIZCore.Color(193, 193, 193, 255),//scroll: new VIZCore.Color(54, 175, 184, 255),
                }
            };
        };

        // Mouse Event 관리
        let mouseLeftDown = false;
        let mouseDownPosition;
        let mouseLastPosition;
        let mousePressEvent = null;
        let mouseArgs = undefined;

        // Tree Event 상태 관리
        let STATE = {
            NONE: -1,
            TREE_EXPAND: 0,
            TREE_CHECK: 1,
            TREE_NODE: 2,
            SCROLL_UP: 3,
            SCROLL_DOWN: 4,
            SCROLL_LEFT: 5,
            SCROLL_RIGHT: 6,
            SCROLL_MOVE_V: 7,
            SCROLL_MOVE_H: 8
        };

        let _state = STATE.NONE;

        let listTree = []; // 전체 데이터 관리
        let listDraw = []; // 가시화 데이터 관리
        let listTreeVisible = []; // 그려져야 하는 객체 목록만 관리
        let listExpand = []; // 객체 노드 확장 관리     //Index
        let expandLevel = 0;

        let treeItem = function (id, pid, name, level, expand) {
            let obj = {
                id: id,
                pid: pid,
                name: name,
                expand: expand,
                select: false,
                level: level,
                sibling_offset: 0,
                last_offset: 0
            };
            return obj;
        };

        this.Elements = {
            Range: undefined,
            Panel: undefined,
            Content: undefined
        }

        create();
        function create() {
            div_scroll = document.createElement('div');
            div_scroll.id = view.GetViewID() + "div_propertytree_container";
            div_scroll.className = "VIZWeb SH_scrollbar";
            div_tree = document.createElement('div');
            div_tree.id = view.GetViewID() + "div_propertytree";
            div_tree.className = "VIZWeb SH_force_overflow";
            div_scroll.appendChild(div_tree);

            let div_spin = document.createElement('div');
            div_spin.id = view.GetViewID() + "div_propertytree_loader";
            div_spin.className = "VIZWeb SH_loader";
            div_tree.appendChild(div_spin);

            scope.Elements.Spin = div_spin;

            canvas_tree = document.createElement('canvas');
            canvas_tree.id = view.GetViewID() + "canvas_propertytree";
            canvas_tree.className = "VIZWeb SH_canvas_tree";
            div_tree.appendChild(canvas_tree);
            canvas_tree.width = div_scroll.clientWidth;
            // let offset = $("#" + div_tree.id).offset();
            //canvas_tree.height = div_scroll.clientHeight - offset.top;

            div_scroll.onscroll = function () {
                drawCnt = Math.floor(div_scroll.clientHeight / itemMetrics.height);
                let limit = listDraw.length;
                //console.log("scrollTop : " + div_scroll.scrollTop + " : " + limit + " : " + ((div_scroll.scrollTop < limit) ? true : false));
                //div_scroll.scrollTop = 1524288;
                if (div_scroll.scrollTop <= limit) {
                    //canvas_tree.style.marginTop = (div_scroll.scrollTop * drawinfo.height) * -1 + "px";
                    //render();
                }
            };

            canvas_tree.addEventListener('mousedown', mousedown, false);
            canvas_tree.addEventListener('mouseout', mouseout, false);
            canvas_tree.addEventListener('dblclick', dbclick, false);


            canvas_tree.addEventListener('mousewheel', mousewheel, false);

            canvas_tree.addEventListener('touchstart', touchstart, false);

            let panel = new view.Interface.Panel(view.Container);
            panel.SetContent(div_scroll);
            panel.Show(false);
            //panel.SetBorderColorFromRGBA(255, 255, 255, 255);
            //panel.SetContentBackgroundColor(new VIZCore.Color(240, 240, 240, 255));
            panel.SetTitleText("Property Tree");
            let width = view.Container.clientWidth;
            let height = view.Container.clientHeight;

            let width_panel = 300;

            panel.SetLocationLeft(width - width_panel - 50);
            panel.SetSize(width_panel, height - 500);

            panel.SetElementOverflow(false);

            if (false) {
                // range
                let div_range = document.createElement('div');
                div_range.id = view.GetViewID() + "div_propertyrange";
                div_range.className = "VIZWeb SH_tree_header_input";
                let inputRange = document.createElement('input');
                inputRange.id = view.GetViewID() + "input_propertytree_expand";
                inputRange.type = "range";
                inputRange.min = 0;
                inputRange.max = 10;
                inputRange.style.right = '40px';
                inputRange.style.top = '8px';
                inputRange.style.width = '50px';
                inputRange.style.position = 'absolute';

                div_range.appendChild(inputRange);

                inputRange.addEventListener("change", function () {
                    setExpandByLevel(inputRange.value * 1);
                });

                inputRange.addEventListener("input", function () {
                });

                scope.Elements.Range = inputRange;
                panel.SetHeaderContent(div_range);
            }

            let resize = function () {
                scope.Resize();
            }

            panel.OnResizeEvent(resize);

            // let cbClose = ()=>{
            //     scope.Show(false);
            // };
            function PanelClose() {
                if (cbClose !== undefined)
                    cbClose();
            };
            panel.OnCloseButtonEvent(PanelClose);

            scope.Elements.Panel = panel;
            scope.Elements.Content = div_scroll;
        }

        init();
        function init() {
            //canvas_tree = document.getElementById("canvas_tree");
            ctx_tree = canvas_tree.getContext("2d");

            //canvas_scroll = document.getElementById("canvas_tree");
            //ctx_scroll = canvas_scroll.getContext("2d");
            ctx_scroll = ctx_tree;

            let ui_tree_img = document.createElement('div');
            ui_tree_img.id = view.GetViewID() + "ui_display_img";
            ui_tree_img.style.display = "none";
            // ui_tree_img.innerHTML += "<img id=\"ui_tree_img_expand\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAIZGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDMgNzkuMTY0NTI3LCAyMDIwLzEwLzE1LTE3OjQ4OjMyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE0IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTUtMDgtMDVUMTk6MjE6NDMrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTEyLTMxVDA5OjMxOjM0KzA5OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTEyLTMxVDA5OjMxOjM0KzA5OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmJkYjFjZTgzLWM1MDUtYjU0MS05YWE5LWM3MGU1MDljMmYzMCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjgwZWJlNGU2LTcxYTYtYjM0MC04YmViLTk1ZGEyNTRjMDNhYiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjM4N2FmNzA5LWU0NGYtNmQ0Yy1hNTViLTcxODljMWQ2MzM5ZiIgdGlmZjpPcmllbnRhdGlvbj0iMSIgdGlmZjpYUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOllSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiIGV4aWY6Q29sb3JTcGFjZT0iNjU1MzUiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIzMjAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSI5NiI+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPnhtcC5kaWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmIiBzdEV2dDp3aGVuPSIyMDE1LTA4LTA1VDE5OjIxOjQzKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjAxZGE3MzllLTE0NGItMzI0NC04NGNhLTc5MmY4Y2JlY2I1OCIgc3RFdnQ6d2hlbj0iMjAyMC0xMi0wM1QxNjozMDowNiswOTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiZGIxY2U4My1jNTA1LWI1NDEtOWFhOS1jNzBlNTA5YzJmMzAiIHN0RXZ0OndoZW49IjIwMjAtMTItMzFUMDk6MzE6MzQrMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi4xIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7ge+U5AAAAWUlEQVRIiWP8//8/Ay0BE01NH7VgZFjAgk9Su2cSPun/V0vyGAlZQK4PiM485FhAUs4k1QKSsz0pFpBVphBrAdkFFjEWUFQaErKA4qKWcbS4HrVg1ALaWwAAYM8RJIpsTCIAAAAASUVORK5CYII=\" width=\"32px\" >";
            // ui_tree_img.innerHTML += "<img id=\"ui_tree_img_collapse\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAIZGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDMgNzkuMTY0NTI3LCAyMDIwLzEwLzE1LTE3OjQ4OjMyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE0IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTUtMDgtMDVUMTk6MjE6NDMrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTEyLTMxVDA5OjMxOjMwKzA5OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTEyLTMxVDA5OjMxOjMwKzA5OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmUyNzYxNjI5LTAxMzYtZjE0Zi1hMmQxLTY2YzI3MDYzODM4ZiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjY3MWUxMzY4LTZkNDctMDU0Ni05NGJjLTgxZGNjZDQ2YjEyNSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjM4N2FmNzA5LWU0NGYtNmQ0Yy1hNTViLTcxODljMWQ2MzM5ZiIgdGlmZjpPcmllbnRhdGlvbj0iMSIgdGlmZjpYUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOllSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiIGV4aWY6Q29sb3JTcGFjZT0iNjU1MzUiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIzMjAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSI5NiI+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPnhtcC5kaWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmIiBzdEV2dDp3aGVuPSIyMDE1LTA4LTA1VDE5OjIxOjQzKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjAxZGE3MzllLTE0NGItMzI0NC04NGNhLTc5MmY4Y2JlY2I1OCIgc3RFdnQ6d2hlbj0iMjAyMC0xMi0wM1QxNjozMDowNiswOTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDplMjc2MTYyOS0wMTM2LWYxNGYtYTJkMS02NmMyNzA2MzgzOGYiIHN0RXZ0OndoZW49IjIwMjAtMTItMzFUMDk6MzE6MzArMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi4xIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7Kt1c6AAAAa0lEQVRIiWP8//8/Ay0BE01NH7VgZFjAQowi7Z5J/xkYGBjRxa+W5BHUS4oPyMowpAYRyZaQEwckWUJuJBNtCSWpiChLKLEAI1VR0wKiDCfXAqINJ8cCkgwn1QKSDWdgYGBgHK3RRi2gGAAAWDwPK3f419wAAAAASUVORK5CYII=\" width=\"32px\" >";
            // ui_tree_img.innerHTML += "<img id=\"ui_tree_img_check\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAIZGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDMgNzkuMTY0NTI3LCAyMDIwLzEwLzE1LTE3OjQ4OjMyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE0IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTUtMDgtMDVUMTk6MjE6NDMrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTEyLTMxVDA5OjMxOjU2KzA5OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTEyLTMxVDA5OjMxOjU2KzA5OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjAxNWQ5NmRkLWNiNjYtNjA0MC1iN2U1LWVjYmM1OTY2YzhiNCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmY3MGFlMThiLTM4MzAtMmE0OC1iNTcwLTM4NjEzNjJhNDZlNiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjM4N2FmNzA5LWU0NGYtNmQ0Yy1hNTViLTcxODljMWQ2MzM5ZiIgdGlmZjpPcmllbnRhdGlvbj0iMSIgdGlmZjpYUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOllSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiIGV4aWY6Q29sb3JTcGFjZT0iNjU1MzUiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIzMjAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSI5NiI+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPnhtcC5kaWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmIiBzdEV2dDp3aGVuPSIyMDE1LTA4LTA1VDE5OjIxOjQzKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjAxZGE3MzllLTE0NGItMzI0NC04NGNhLTc5MmY4Y2JlY2I1OCIgc3RFdnQ6d2hlbj0iMjAyMC0xMi0wM1QxNjozMDowNiswOTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDowMTVkOTZkZC1jYjY2LTYwNDAtYjdlNS1lY2JjNTk2NmM4YjQiIHN0RXZ0OndoZW49IjIwMjAtMTItMzFUMDk6MzE6NTYrMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi4xIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4ZUbakAAAAh0lEQVRIiWP8//8/Ay0BE01NHxYWsGAT1O6ZRHbEXC3JYyRoARQw4pHDBTAcRo0gwutbSi34j0ZT1QKi4olcC9ANxxlfxFiAbhjRhhNjAXoYk2Q4MRZgs4xow4mxAJchROcRYnyAbhhJGZDYIGJEo6luAVmGk2oBWQBfYUeVqo5xtMoc/hYAAIYRFy6fjtkoAAAAAElFTkSuQmCC\" width=\"32px\" >";
            // ui_tree_img.innerHTML += "<img id=\"ui_tree_img_halfcheck\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAIZGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDMgNzkuMTY0NTI3LCAyMDIwLzEwLzE1LTE3OjQ4OjMyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE0IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTUtMDgtMDVUMTk6MjE6NDMrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTEyLTMxVDA5OjMxOjE0KzA5OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTEyLTMxVDA5OjMxOjE0KzA5OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmFiZGI4OWVlLWNlZGItYzM0My04MTYyLWM3NjQxY2FhODlkZCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmJiM2M4ZjkxLTY0OGUtNzg0Zi04ODI1LTBjNTVhZDJmODNiNyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjM4N2FmNzA5LWU0NGYtNmQ0Yy1hNTViLTcxODljMWQ2MzM5ZiIgdGlmZjpPcmllbnRhdGlvbj0iMSIgdGlmZjpYUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOllSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiIGV4aWY6Q29sb3JTcGFjZT0iNjU1MzUiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIzMjAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSI5NiI+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPnhtcC5kaWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmIiBzdEV2dDp3aGVuPSIyMDE1LTA4LTA1VDE5OjIxOjQzKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjAxZGE3MzllLTE0NGItMzI0NC04NGNhLTc5MmY4Y2JlY2I1OCIgc3RFdnQ6d2hlbj0iMjAyMC0xMi0wM1QxNjozMDowNiswOTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDphYmRiODllZS1jZWRiLWMzNDMtODE2Mi1jNzY0MWNhYTg5ZGQiIHN0RXZ0OndoZW49IjIwMjAtMTItMzFUMDk6MzE6MTQrMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi4xIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7D/jSZAAAAVUlEQVRIiWP8//8/Ay0BE01NHxYWsGAT1O6ZRHbEXC3JYyRoARQw4pHDBTAcNjBBhAaICS6cvh36qWjUglELKAfEZDRyigw4GFAfUKWqYxytMoe/BQDO0A0z7VUHUAAAAABJRU5ErkJggg==\" width=\"32px\" >";
            // ui_tree_img.innerHTML += "<img id=\"ui_tree_img_uncheck\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAIZGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDMgNzkuMTY0NTI3LCAyMDIwLzEwLzE1LTE3OjQ4OjMyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE0IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTUtMDgtMDVUMTk6MjE6NDMrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTEyLTMxVDA5OjMxOjU4KzA5OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTEyLTMxVDA5OjMxOjU4KzA5OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjJkODliNWNmLTMwOWItMmY0YS1iMDA5LTA1ZDhiZmY0ODg1MyIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmMyYmU4MWNkLTc2OGUtMTY0OC04NTJmLTVmOWVhNmNlMGEyYSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjM4N2FmNzA5LWU0NGYtNmQ0Yy1hNTViLTcxODljMWQ2MzM5ZiIgdGlmZjpPcmllbnRhdGlvbj0iMSIgdGlmZjpYUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOllSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiIGV4aWY6Q29sb3JTcGFjZT0iNjU1MzUiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIzMjAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSI5NiI+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPnhtcC5kaWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmIiBzdEV2dDp3aGVuPSIyMDE1LTA4LTA1VDE5OjIxOjQzKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjAxZGE3MzllLTE0NGItMzI0NC04NGNhLTc5MmY4Y2JlY2I1OCIgc3RFdnQ6d2hlbj0iMjAyMC0xMi0wM1QxNjozMDowNiswOTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoyZDg5YjVjZi0zMDliLTJmNGEtYjAwOS0wNWQ4YmZmNDg4NTMiIHN0RXZ0OndoZW49IjIwMjAtMTItMzFUMDk6MzE6NTgrMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi4xIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6awmpWAAAAR0lEQVRIiWP8//8/Ay0BE01NHxYWsGAT1O6ZRHbEXC3JYyRoARQw4pHDBTAcNvTjYNSCUQtGLRgOFuAr7KhS1TGOVpnD3wIAa8QMLnNlN4MAAAAASUVORK5CYII=\" width=\"32px\" >";
            // ui_tree_img.innerHTML += "<img id=\"ui_tree_img_leaf\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAIZGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDg4LCAyMDIwLzA3LzEwLTIyOjA2OjUzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE0IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTUtMDgtMDVUMTk6MjE6NDMrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTEyLTAzVDE2OjMwOjQzKzA5OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTEyLTAzVDE2OjMwOjQzKzA5OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjVjNWVjYjk1LTI5ZTgtM2Q0YS1hOTlhLWZhYjY4MDRjODg3YyIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmI4ZDY1YTJiLTU3NWQtOWI0My1iZWYwLTdlNWYzMzg2NWVkYSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjM4N2FmNzA5LWU0NGYtNmQ0Yy1hNTViLTcxODljMWQ2MzM5ZiIgdGlmZjpPcmllbnRhdGlvbj0iMSIgdGlmZjpYUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOllSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiIGV4aWY6Q29sb3JTcGFjZT0iNjU1MzUiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIzMjAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSI5NiI+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPnhtcC5kaWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmIiBzdEV2dDp3aGVuPSIyMDE1LTA4LTA1VDE5OjIxOjQzKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjAxZGE3MzllLTE0NGItMzI0NC04NGNhLTc5MmY4Y2JlY2I1OCIgc3RFdnQ6d2hlbj0iMjAyMC0xMi0wM1QxNjozMDowNiswOTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1YzVlY2I5NS0yOWU4LTNkNGEtYTk5YS1mYWI2ODA0Yzg4N2MiIHN0RXZ0OndoZW49IjIwMjAtMTItMDNUMTY6MzA6NDMrMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi4wIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4CNobDAAAASElEQVRYhe3QwQkAMQgF0Z/tXBuf7SEeQsII4kl4TIDsblUx+QeygJycb/Lc3WO9BSxgAQtYwAJvFNi9ye0FBAgQIECAgCcAP1b2oAtFm0ueAAAAAElFTkSuQmCC\" width=\"32px\" >";
            // ui_tree_img.innerHTML += "<img id=\"ui_tree_img_line\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAIZGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDg4LCAyMDIwLzA3LzEwLTIyOjA2OjUzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE0IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTUtMDgtMDVUMTk6MjE6NDMrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTEyLTAzVDE2OjMyOjA5KzA5OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTEyLTAzVDE2OjMyOjA5KzA5OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjM5Y2UwZjU3LTIwMmUtMjY0OC1iZDc5LWM5MmIzNDNlM2FhNiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmVkYzNlN2EyLTg4OTctOTM0ZC04ZTE1LThiZWM2MTE4OGU2ZCIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjM4N2FmNzA5LWU0NGYtNmQ0Yy1hNTViLTcxODljMWQ2MzM5ZiIgdGlmZjpPcmllbnRhdGlvbj0iMSIgdGlmZjpYUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOllSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiIGV4aWY6Q29sb3JTcGFjZT0iNjU1MzUiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIzMjAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSI5NiI+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPnhtcC5kaWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmIiBzdEV2dDp3aGVuPSIyMDE1LTA4LTA1VDE5OjIxOjQzKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjAxZGE3MzllLTE0NGItMzI0NC04NGNhLTc5MmY4Y2JlY2I1OCIgc3RFdnQ6d2hlbj0iMjAyMC0xMi0wM1QxNjozMDowNiswOTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozOWNlMGY1Ny0yMDJlLTI2NDgtYmQ3OS1jOTJiMzQzZTNhYTYiIHN0RXZ0OndoZW49IjIwMjAtMTItMDNUMTY6MzI6MDkrMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi4wIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz49EVu4AAAAQklEQVRYhe3QsQkAMAwDQSWb24t/dogLNy9QKRAXIL+tKiZ7IAfIZu5k3N3j9woooIACCiiggAIKKKCAAgoosC7wAPjgtO/IGsYWAAAAAElFTkSuQmCC\" width=\"32px\" >";

            // ui_tree_img.innerHTML += "<img id=\"ui_scroll_img_up\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAhkaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA2LjAtYzAwMyA3OS4xNjQ1MjcsIDIwMjAvMTAvMTUtMTc6NDg6MzIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNS0wOC0wNVQxOToyMTo0MyswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjAtMTItMzFUMDk6MzI6MTgrMDk6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjAtMTItMzFUMDk6MzI6MTgrMDk6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6YjlmOGUxZDAtZTM4ZC0zNjRmLTgxMTctYTJkOWQ0MmY1OTM5IiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZGZlNTg0YTUtZTg0Ny03MDQ4LTg4NTgtNDllMjVhNmRlMzAzIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249IjMyMCIgZXhpZjpQaXhlbFlEaW1lbnNpb249Ijk2Ij4gPHBob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4gPHJkZjpCYWc+IDxyZGY6bGk+eG1wLmRpZDozODdhZjcwOS1lNDRmLTZkNGMtYTU1Yi03MTg5YzFkNjMzOWY8L3JkZjpsaT4gPC9yZGY6QmFnPiA8L3Bob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozODdhZjcwOS1lNDRmLTZkNGMtYTU1Yi03MTg5YzFkNjMzOWYiIHN0RXZ0OndoZW49IjIwMTUtMDgtMDVUMTk6MjE6NDMrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE0IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MDFkYTczOWUtMTQ0Yi0zMjQ0LTg0Y2EtNzkyZjhjYmVjYjU4IiBzdEV2dDp3aGVuPSIyMDIwLTEyLTAzVDE2OjMwOjA2KzA5OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMCAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmI5ZjhlMWQwLWUzOGQtMzY0Zi04MTE3LWEyZDlkNDJmNTkzOSIgc3RFdnQ6d2hlbj0iMjAyMC0xMi0zMVQwOTozMjoxOCswOTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjEgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ppx3SRAAAABoSURBVEhLY/z//z8DLQETlKYZGLWAIBi1gCCguQU4M5p2zyQoCwWAFDNCmAhwtSQPysIEpPgA5hKSsj6xFqAbSrQlxFiAyzCiLCFkASFDCFqCzwJigwGvutHimiAYtYAgGLWAAGBgAACHuhcbznrfYwAAAABJRU5ErkJggg==\" width=\"32px\" >";
            // ui_tree_img.innerHTML += "<img id=\"ui_scroll_img_down\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAhkaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA2LjAtYzAwMyA3OS4xNjQ1MjcsIDIwMjAvMTAvMTUtMTc6NDg6MzIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNS0wOC0wNVQxOToyMTo0MyswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjAtMTItMzFUMDk6MzI6MTgrMDk6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjAtMTItMzFUMDk6MzI6MTgrMDk6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6YjlmOGUxZDAtZTM4ZC0zNjRmLTgxMTctYTJkOWQ0MmY1OTM5IiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZGZlNTg0YTUtZTg0Ny03MDQ4LTg4NTgtNDllMjVhNmRlMzAzIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249IjMyMCIgZXhpZjpQaXhlbFlEaW1lbnNpb249Ijk2Ij4gPHBob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4gPHJkZjpCYWc+IDxyZGY6bGk+eG1wLmRpZDozODdhZjcwOS1lNDRmLTZkNGMtYTU1Yi03MTg5YzFkNjMzOWY8L3JkZjpsaT4gPC9yZGY6QmFnPiA8L3Bob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozODdhZjcwOS1lNDRmLTZkNGMtYTU1Yi03MTg5YzFkNjMzOWYiIHN0RXZ0OndoZW49IjIwMTUtMDgtMDVUMTk6MjE6NDMrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE0IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MDFkYTczOWUtMTQ0Yi0zMjQ0LTg0Y2EtNzkyZjhjYmVjYjU4IiBzdEV2dDp3aGVuPSIyMDIwLTEyLTAzVDE2OjMwOjA2KzA5OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMCAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmI5ZjhlMWQwLWUzOGQtMzY0Zi04MTE3LWEyZDlkNDJmNTkzOSIgc3RFdnQ6d2hlbj0iMjAyMC0xMi0zMVQwOTozMjoxOCswOTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjEgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ppx3SRAAAABnSURBVEhLY/z//z8DLQETlKYZGLWAIBi1gCCguQV4M5p2zySic+HVkjxGKBMFEPIBVk1YAE51xAQRIUvwyhMbB7gMIehDUiIZ3TCChoMAqakIZihRhoPAaHFNEIxaQBCMWkAAMDAAAEgVDS/wXR0aAAAAAElFTkSuQmCC\" width=\"32px\" >";
            // ui_tree_img.innerHTML += "<img id=\"ui_scroll_img_left\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAhkaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA2LjAtYzAwMyA3OS4xNjQ1MjcsIDIwMjAvMTAvMTUtMTc6NDg6MzIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNS0wOC0wNVQxOToyMTo0MyswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjAtMTItMzFUMDk6MzI6MTgrMDk6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjAtMTItMzFUMDk6MzI6MTgrMDk6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6YjlmOGUxZDAtZTM4ZC0zNjRmLTgxMTctYTJkOWQ0MmY1OTM5IiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZGZlNTg0YTUtZTg0Ny03MDQ4LTg4NTgtNDllMjVhNmRlMzAzIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249IjMyMCIgZXhpZjpQaXhlbFlEaW1lbnNpb249Ijk2Ij4gPHBob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4gPHJkZjpCYWc+IDxyZGY6bGk+eG1wLmRpZDozODdhZjcwOS1lNDRmLTZkNGMtYTU1Yi03MTg5YzFkNjMzOWY8L3JkZjpsaT4gPC9yZGY6QmFnPiA8L3Bob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozODdhZjcwOS1lNDRmLTZkNGMtYTU1Yi03MTg5YzFkNjMzOWYiIHN0RXZ0OndoZW49IjIwMTUtMDgtMDVUMTk6MjE6NDMrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE0IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MDFkYTczOWUtMTQ0Yi0zMjQ0LTg0Y2EtNzkyZjhjYmVjYjU4IiBzdEV2dDp3aGVuPSIyMDIwLTEyLTAzVDE2OjMwOjA2KzA5OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMCAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmI5ZjhlMWQwLWUzOGQtMzY0Zi04MTE3LWEyZDlkNDJmNTkzOSIgc3RFdnQ6d2hlbj0iMjAyMC0xMi0zMVQwOTozMjoxOCswOTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjEgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ppx3SRAAAABySURBVEhLY/z//z8DLQETlKYZGLWAIBj6FhCVTLV7JkFZKOD/1ZI8RigbJyDXB0RnHnIsIClnkmoBydmeFAvIKlOItYAsw0GAWAsIphZcgJQgIssSUiOZZEtItQAESLKEHAtAgGhLRms0gmDUAgKAgQEAf7kSJfsIKkMAAAAASUVORK5CYII=\" width=\"32px\" >";
            // ui_tree_img.innerHTML += "<img id=\"ui_scroll_img_right\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAIZGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDMgNzkuMTY0NTI3LCAyMDIwLzEwLzE1LTE3OjQ4OjMyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE0IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTUtMDgtMDVUMTk6MjE6NDMrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTEyLTMxVDA5OjMxOjMwKzA5OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTEyLTMxVDA5OjMxOjMwKzA5OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmUyNzYxNjI5LTAxMzYtZjE0Zi1hMmQxLTY2YzI3MDYzODM4ZiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjY3MWUxMzY4LTZkNDctMDU0Ni05NGJjLTgxZGNjZDQ2YjEyNSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjM4N2FmNzA5LWU0NGYtNmQ0Yy1hNTViLTcxODljMWQ2MzM5ZiIgdGlmZjpPcmllbnRhdGlvbj0iMSIgdGlmZjpYUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOllSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiIGV4aWY6Q29sb3JTcGFjZT0iNjU1MzUiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIzMjAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSI5NiI+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPnhtcC5kaWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmIiBzdEV2dDp3aGVuPSIyMDE1LTA4LTA1VDE5OjIxOjQzKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjAxZGE3MzllLTE0NGItMzI0NC04NGNhLTc5MmY4Y2JlY2I1OCIgc3RFdnQ6d2hlbj0iMjAyMC0xMi0wM1QxNjozMDowNiswOTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDplMjc2MTYyOS0wMTM2LWYxNGYtYTJkMS02NmMyNzA2MzgzOGYiIHN0RXZ0OndoZW49IjIwMjAtMTItMzFUMDk6MzE6MzArMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi4xIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7Kt1c6AAAAa0lEQVRIiWP8//8/Ay0BE01NH7VgZFjAQowi7Z5J/xkYGBjRxa+W5BHUS4oPyMowpAYRyZaQEwckWUJuJBNtCSWpiChLKLEAI1VR0wKiDCfXAqINJ8cCkgwn1QKSDWdgYGBgHK3RRi2gGAAAWDwPK3f419wAAAAASUVORK5CYII=\" width=\"32px\" >";

            // ui_tree_img.innerHTML += "<img id=\"ui_tree_img_assembly\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABYlAAAWJQFJUiTwAAADP0lEQVRYhe2Wb2gbZRzHP5e7/LkkbUMXm9o1mnRbaY2uGU5JpR2uc/hCJvpiuO2F8+V8IeteCOIb6wtfStUXguAo2xARBBXGZKjYTbskbsN1NTJmq7W9tltvlsu/tUkud5IIQ4aYa1YQIR94Xtzzu+f7+96Xu+c5GjRo8L8mGImFKuNenkGsd2EwEhs5+MyesUe6u47MaSU5oyrj9egIdTR+bvdg/+jhHn8ocmOyOpdq7+PEtVuz334XPzafSny+Hj3LCQQjsehj/YMfv/xU/2sDhuF70GvDdVut1lRvOwumy/f00I4DutT6pC55JzOqcsOKbs0EgpGYD3jj6EsvDO93qkhT3+OKDpBahFwZEg4ZX8DDsSPdYP5KJtfJ8Y+WGH3/1DvAm/OphPZv+jYLJqOHCvnhWHEVp2nemUw6ZX7wNXOwv8iBvtydeY/DrF6/9aJ3uLK2lrhkwQABm8Bvx0+hdHSwtmeIq4si+58NE3tUr9azCyazZ8dxNjdTSMdp63Wz7YkInEzW1LaSAGXgpl5mRVG4nDjDK7FfiLSX7rorSyGdJLRTwO1cBvPu+j9jKYGCIOAR4LZh0tpqx+2e5o+LP6Fd3wU2O5I4TWhgC0uTLaBnQZBI50wLyhYTGAvvYEb24pb++mg0JVMd5fR5mvwK93dXXC5Xaxndz+inPt47eWXjEvA8NMS5rl1cmjnH1tw0Do+D7M08xXwRUSyCqYMoczq+yKXPlunbvca+zSJTU/rGGDBLOsacRt4/yI/2KK9/fZ5DD9vZ5ClVGyeut/Dh6SK5gsnQ4SLZkohjoWxF2qIBo4hgt2OkMzh6t3HN3surF+Ls3TSBPVkgJfSwee8+mhJvky1lkWxQWLX2DtTcCVvaOrXC7BWXPfxATGppxya7KS/fQsiJ/O7aibk1Rjo4gG4INKkTdIU1Zr7RGfvAqGxEn2RUZe2eDFQEMqpyVtZXv9BXl3rAFpKaAxgrGjaXB7mzg7zowe8xUJNfcfFLbTw+YT4/n0qcqNW8Ql2HkTO8fdQV2B4SXW10RQPoayorF87Mzl39ed2H0boN/M3IiLzl8aP3ecvMTV5+dz6VGKlXq2424oekQYMG/y3An12KOcToNjmNAAAAAElFTkSuQmCC\" width=\"32px\" >";
            // ui_tree_img.innerHTML += "<img id=\"ui_tree_img_part\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABYlAAAWJQFJUiTwAAABoElEQVRYhWMYBaNgFIyCIQ1ktS0EQJgSPzCTq1FW26IhKtRjua62SsGj1z84P71+coAugSmrbREQl1F4//jJJf///1kAxiA2SAwkR6p5jCRYbKCmrNifnujgEOonwsDw/ymaSdIMqze9YZg5/8CBW3fvFz6+euICMeYykeDYgInRHxyclH/gVACSm5jI6ABSS6yhpDiAQVrhG8O3B4sZHmzbyPD5KS8DAwMfGIPYD3buYmBmPMOg7aZEipEMLKQo/v7+B8OrG28ZBGQuMrw9fYXhwy07BgYmVgYW5jsMCmZCDAw/PzAw/BGmnQNg4MOTTwzMbMwMAgyHGARU1RkERBkYGH6+Isco0qIAGfz99Zfh19dfDMzMvxgY/v8h1xjSHPDjP+EA+/SVtKKFFAdsSJ3MeODSf0kGXnFuTFk2QYbVh4UYgjKugAqkDcQaSnQ5AAOgwsbRlK0/1OSngo7EbwZhbS2Gqy/YGKav+PBg/5FnoPxPtOVkOQDJIQ0hdsz5DGxCDGv2vJ74+OqJBnLNIhtQozIaBaNgFIyCgQUMDAwAxe2IEnNxtyoAAAAASUVORK5CYII=\" width=\"32px\" >";
            // ui_tree_img.innerHTML += "<img id=\"ui_tree_img_body\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABYlAAAWJQFJUiTwAAABPklEQVRYhWMYBaNgFIyCYQVktS0MSPUPCzUCQFbbwkFNmb8exH58lcGRFL1MFFosYOLgOL8wU3f/nnXeDqrK/CSbQXYIyGpbNESFqOTnJGkKyIgzMTD8/0OWOSQ7QFbbIsDRRqo/M1FLwcKAi4HhzycGht9/GRiYxOjjAEsT8fyFk60VGH68YGD4/gEhwfaPPg4QEmJnYPj3k4Hh93tUif9/6eMAqG0MDH9/YorRzQH//zEw/PuF4LPyMzAwsTG8e4fuKFo5AORbUKpn5mBg4FJgOHGFkWH6/OMPjp95OZE+DmBkYWDgkmN48kGIYcrUmx+Wrbkz8fHVEw3kGEWeA1h4GPrn3GdYtubCgpevvxc+vnriAxG6sAJGUjU4+7nvB9G37n5sfHz1xAFyLSYbkFPhjIJRMApGweAFDAwMAJN4WTXZQKmFAAAAAElFTkSuQmCC\" width=\"32px\" >";

            ui_tree_img.innerHTML += "<img id=\"ui_tree_img_expand\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAAY0lEQVRIie3VsQ3AIAxE0Qu7XZ8RUrMPNSMwohGSe7hErmLX6D+EkHyZGSKnhNYTSGA7JO8wgGQFMEIAj7eTszKgxGWA5KPEJcBv3pX4MaA+iwR8iW8B/+ev42tyHyTwewDABAqPFbjvR4LGAAAAAElFTkSuQmCC\" width=\"32px\" >";
            ui_tree_img.innerHTML += "<img id=\"ui_tree_img_collapse\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAAcUlEQVRIie3VUQ2AMAyE4R8wgAcE8IiCqp4C3kAAHjCwlCDhCksg6Qm4L8vatHN3WqZv2p7AfwAz28xsbPmCGVgjiPIHUwRRgCGCqFMkI5ExlZBP7kEFDmAppZxvA1K5CsjlKiCXK8AeKb+TFy2BhwEu9YQpp0DUZOQAAAAASUVORK5CYII=\" width=\"32px\" >";
            ui_tree_img.innerHTML += "<img id=\"ui_tree_img_check\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAA0klEQVRIie2VMQrCMBSGv6qD4BkEwV3cegH/3clDuHgaPYKXiIOrm04eQA/gLEikkKGUNG2wVRHfmITvS/JeXhJrLW1Gp1X6Twh6xQFJLyXFGJMEBb5FdcO3ue9PsqRRawJJW+Asadq4wMEXQB/YNSrIwbvAHZiVrfVWUQ60BFZAaoy5lcCzuWO0QNIcWAMP4CApBTYx8KoT7IELMATGwNXdd204oRy4K5k4SQYdxMKDAo+EWHiloCA5xcKpqqKCpPQxheL97ZoGWnY+/n/yhwXAE757UQEbTF/4AAAAAElFTkSuQmCC\" width=\"32px\" >";
            ui_tree_img.innerHTML += "<img id=\"ui_tree_img_halfcheck\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAAVElEQVRIiWP8//8/Ay0BE01NHxYWsKALuLq6UhQpu3fvZsRrATZFxAJsjqN/ECEDYoMLn49Hk+moBaMWDHROJrdMQgYD4wNKi2xkMFonD7AFDAwMAA/MFjNPnbYIAAAAAElFTkSuQmCC\" width=\"32px\" >";
            ui_tree_img.innerHTML += "<img id=\"ui_tree_img_uncheck\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAASElEQVRIiWP8//8/Ay0BE01NHxYWsKALuLq6UhQpu3fvZsRrATZFxAJsjhuN5FELRi0YtWBEWIC1NKW0yEYGo3XyAFvAwMAAAHjbD/3TV3LjAAAAAElFTkSuQmCC\" width=\"32px\" >";
            ui_tree_img.innerHTML += "<img id=\"ui_tree_img_leaf\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAIZGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDg4LCAyMDIwLzA3LzEwLTIyOjA2OjUzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE0IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTUtMDgtMDVUMTk6MjE6NDMrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTEyLTAzVDE2OjMwOjQzKzA5OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTEyLTAzVDE2OjMwOjQzKzA5OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjVjNWVjYjk1LTI5ZTgtM2Q0YS1hOTlhLWZhYjY4MDRjODg3YyIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmI4ZDY1YTJiLTU3NWQtOWI0My1iZWYwLTdlNWYzMzg2NWVkYSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjM4N2FmNzA5LWU0NGYtNmQ0Yy1hNTViLTcxODljMWQ2MzM5ZiIgdGlmZjpPcmllbnRhdGlvbj0iMSIgdGlmZjpYUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOllSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiIGV4aWY6Q29sb3JTcGFjZT0iNjU1MzUiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIzMjAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSI5NiI+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPnhtcC5kaWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmIiBzdEV2dDp3aGVuPSIyMDE1LTA4LTA1VDE5OjIxOjQzKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjAxZGE3MzllLTE0NGItMzI0NC04NGNhLTc5MmY4Y2JlY2I1OCIgc3RFdnQ6d2hlbj0iMjAyMC0xMi0wM1QxNjozMDowNiswOTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1YzVlY2I5NS0yOWU4LTNkNGEtYTk5YS1mYWI2ODA0Yzg4N2MiIHN0RXZ0OndoZW49IjIwMjAtMTItMDNUMTY6MzA6NDMrMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi4wIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4CNobDAAAASElEQVRYhe3QwQkAMQgF0Z/tXBuf7SEeQsII4kl4TIDsblUx+QeygJycb/Lc3WO9BSxgAQtYwAJvFNi9ye0FBAgQIECAgCcAP1b2oAtFm0ueAAAAAElFTkSuQmCC\" width=\"32px\" >";
            ui_tree_img.innerHTML += "<img id=\"ui_tree_img_line\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAIZGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDg4LCAyMDIwLzA3LzEwLTIyOjA2OjUzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE0IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTUtMDgtMDVUMTk6MjE6NDMrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTEyLTAzVDE2OjMyOjA5KzA5OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTEyLTAzVDE2OjMyOjA5KzA5OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjM5Y2UwZjU3LTIwMmUtMjY0OC1iZDc5LWM5MmIzNDNlM2FhNiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmVkYzNlN2EyLTg4OTctOTM0ZC04ZTE1LThiZWM2MTE4OGU2ZCIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjM4N2FmNzA5LWU0NGYtNmQ0Yy1hNTViLTcxODljMWQ2MzM5ZiIgdGlmZjpPcmllbnRhdGlvbj0iMSIgdGlmZjpYUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOllSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiIGV4aWY6Q29sb3JTcGFjZT0iNjU1MzUiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIzMjAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSI5NiI+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPnhtcC5kaWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Mzg3YWY3MDktZTQ0Zi02ZDRjLWE1NWItNzE4OWMxZDYzMzlmIiBzdEV2dDp3aGVuPSIyMDE1LTA4LTA1VDE5OjIxOjQzKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjAxZGE3MzllLTE0NGItMzI0NC04NGNhLTc5MmY4Y2JlY2I1OCIgc3RFdnQ6d2hlbj0iMjAyMC0xMi0wM1QxNjozMDowNiswOTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozOWNlMGY1Ny0yMDJlLTI2NDgtYmQ3OS1jOTJiMzQzZTNhYTYiIHN0RXZ0OndoZW49IjIwMjAtMTItMDNUMTY6MzI6MDkrMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi4wIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz49EVu4AAAAQklEQVRYhe3QsQkAMAwDQSWb24t/dogLNy9QKRAXIL+tKiZ7IAfIZu5k3N3j9woooIACCiiggAIKKKCAAgoosC7wAPjgtO/IGsYWAAAAAElFTkSuQmCC\" width=\"32px\" >";

            ui_tree_img.innerHTML += "<img id=\"ui_scroll_img_up\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAAgUlEQVRIie3UMQqAIBTG8X91geagtbFbeGqXoKkp8ApdoBsYwhvzaYNNTxBEed/PN2gXY6Tl6JumG2DA/4BzbkyzCSDBZ5pfkKqXLIEBmGXrAlbv/V2qLXbwEo6sQ00nKpAJ/4RkASk8gEmpLyJaBxuwAIN2Q0H23KF91wYY0BoAHqS+INBjEqyEAAAAAElFTkSuQmCC\" width=\"32px\" >";
            ui_tree_img.innerHTML += "<img id=\"ui_scroll_img_down\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAAi0lEQVRIie3UMQoCMRBA0e+yB/Aku3bb2syp5xCr7YKVF7AWJBJIYZFsJkJAYaad4T/S5BBCoOcMXesOOPAfwFhaiMgFmI2dq6qecou9F5yBeyX8ArZ0m50ioKoPYNpBYvwGLOm2DaggpngVKCDmeBzzbyoiR2AFntZ4E/CBYI03A9+Mf3YO/DoAvAFCjzqJ7OXOCwAAAABJRU5ErkJggg==\" width=\"32px\" >";
            ui_tree_img.innerHTML += "<img id=\"ui_scroll_img_left\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAAfklEQVRIie3VvQ2AIBCG4VfjAC7gHE5wUzOEP707WJsYbKioPk4pTLj68j4hgdDFGKk5fdV6A/4LmNloZquyO3jiwA5Myn7RCUrjRYAnLgPeuASk+OKJS0CaC7irACGEE5iBw4NIJ3iDyLfIixS9gwz5HsiQTdlvP1oDXg7wACTYK5c8V5EIAAAAAElFTkSuQmCC\" width=\"32px\" >";
            ui_tree_img.innerHTML += "<img id=\"ui_scroll_img_right\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAAcUlEQVRIie3VUQ2AMAyE4R8wgAcE8IiCqp4C3kAAHjCwlCDhCksg6Qm4L8vatHN3WqZv2p7AfwAz28xsbPmCGVgjiPIHUwRRgCGCqFMkI5ExlZBP7kEFDmAppZxvA1K5CsjlKiCXK8AeKb+TFy2BhwEu9YQpp0DUZOQAAAAASUVORK5CYII=\" width=\"32px\" >";

            ui_tree_img.innerHTML += "<img id=\"ui_tree_img_assembly\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABYlAAAWJQFJUiTwAAADP0lEQVRYhe2Wb2gbZRzHP5e7/LkkbUMXm9o1mnRbaY2uGU5JpR2uc/hCJvpiuO2F8+V8IeteCOIb6wtfStUXguAo2xARBBXGZKjYTbskbsN1NTJmq7W9tltvlsu/tUkud5IIQ4aYa1YQIR94Xtzzu+f7+96Xu+c5GjRo8L8mGImFKuNenkGsd2EwEhs5+MyesUe6u47MaSU5oyrj9egIdTR+bvdg/+jhHn8ocmOyOpdq7+PEtVuz334XPzafSny+Hj3LCQQjsehj/YMfv/xU/2sDhuF70GvDdVut1lRvOwumy/f00I4DutT6pC55JzOqcsOKbs0EgpGYD3jj6EsvDO93qkhT3+OKDpBahFwZEg4ZX8DDsSPdYP5KJtfJ8Y+WGH3/1DvAm/OphPZv+jYLJqOHCvnhWHEVp2nemUw6ZX7wNXOwv8iBvtydeY/DrF6/9aJ3uLK2lrhkwQABm8Bvx0+hdHSwtmeIq4si+58NE3tUr9azCyazZ8dxNjdTSMdp63Wz7YkInEzW1LaSAGXgpl5mRVG4nDjDK7FfiLSX7rorSyGdJLRTwO1cBvPu+j9jKYGCIOAR4LZh0tpqx+2e5o+LP6Fd3wU2O5I4TWhgC0uTLaBnQZBI50wLyhYTGAvvYEb24pb++mg0JVMd5fR5mvwK93dXXC5Xaxndz+inPt47eWXjEvA8NMS5rl1cmjnH1tw0Do+D7M08xXwRUSyCqYMoczq+yKXPlunbvca+zSJTU/rGGDBLOsacRt4/yI/2KK9/fZ5DD9vZ5ClVGyeut/Dh6SK5gsnQ4SLZkohjoWxF2qIBo4hgt2OkMzh6t3HN3surF+Ls3TSBPVkgJfSwee8+mhJvky1lkWxQWLX2DtTcCVvaOrXC7BWXPfxATGppxya7KS/fQsiJ/O7aibk1Rjo4gG4INKkTdIU1Zr7RGfvAqGxEn2RUZe2eDFQEMqpyVtZXv9BXl3rAFpKaAxgrGjaXB7mzg7zowe8xUJNfcfFLbTw+YT4/n0qcqNW8Ql2HkTO8fdQV2B4SXW10RQPoayorF87Mzl39ed2H0boN/M3IiLzl8aP3ecvMTV5+dz6VGKlXq2424oekQYMG/y3An12KOcToNjmNAAAAAElFTkSuQmCC\" width=\"32px\" >";
            ui_tree_img.innerHTML += "<img id=\"ui_tree_img_part\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABYlAAAWJQFJUiTwAAABoElEQVRYhWMYBaNgFIyCIQ1ktS0EQJgSPzCTq1FW26IhKtRjua62SsGj1z84P71+coAugSmrbREQl1F4//jJJf///1kAxiA2SAwkR6p5jCRYbKCmrNifnujgEOonwsDw/ymaSdIMqze9YZg5/8CBW3fvFz6+euICMeYykeDYgInRHxyclH/gVACSm5jI6ABSS6yhpDiAQVrhG8O3B4sZHmzbyPD5KS8DAwMfGIPYD3buYmBmPMOg7aZEipEMLKQo/v7+B8OrG28ZBGQuMrw9fYXhwy07BgYmVgYW5jsMCmZCDAw/PzAw/BGmnQNg4MOTTwzMbMwMAgyHGARU1RkERBkYGH6+Isco0qIAGfz99Zfh19dfDMzMvxgY/v8h1xjSHPDjP+EA+/SVtKKFFAdsSJ3MeODSf0kGXnFuTFk2QYbVh4UYgjKugAqkDcQaSnQ5AAOgwsbRlK0/1OSngo7EbwZhbS2Gqy/YGKav+PBg/5FnoPxPtOVkOQDJIQ0hdsz5DGxCDGv2vJ74+OqJBnLNIhtQozIaBaNgFIyCgQUMDAwAxe2IEnNxtyoAAAAASUVORK5CYII=\" width=\"32px\" >";
            ui_tree_img.innerHTML += "<img id=\"ui_tree_img_body\" alt = \"imgfile\" src = \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABYlAAAWJQFJUiTwAAABPklEQVRYhWMYBaNgFIyCYQVktS0MSPUPCzUCQFbbwkFNmb8exH58lcGRFL1MFFosYOLgOL8wU3f/nnXeDqrK/CSbQXYIyGpbNESFqOTnJGkKyIgzMTD8/0OWOSQ7QFbbIsDRRqo/M1FLwcKAi4HhzycGht9/GRiYxOjjAEsT8fyFk60VGH68YGD4/gEhwfaPPg4QEmJnYPj3k4Hh93tUif9/6eMAqG0MDH9/YorRzQH//zEw/PuF4LPyMzAwsTG8e4fuKFo5AORbUKpn5mBg4FJgOHGFkWH6/OMPjp95OZE+DmBkYWDgkmN48kGIYcrUmx+Wrbkz8fHVEw3kGEWeA1h4GPrn3GdYtubCgpevvxc+vnriAxG6sAJGUjU4+7nvB9G37n5sfHz1xAFyLSYbkFPhjIJRMApGweAFDAwMAJN4WTXZQKmFAAAAAElFTkSuQmCC\" width=\"32px\" >";

            //div_tree.appendChild(ui_tree_img);

            if (view.useJquery) {
                if ($("#" + view.GetViewID() + "ui_tree_visible").length > 0) {
                    if (scope.Visible) {
                        $("#" + view.GetViewID() + "ui_tree_visible").addClass('clck');
                        $("#" + view.GetViewID() + "ui_tree_img").attr("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAA5klEQVRYhe2W/QmDMBDF70oHyQiO4AiO4AZ1BEfoBuIEruAI3aAjOMIrBycESWJjY/9o7wdByH28Z5RwZBg5AHDY4fQDRUIkFYtxOcOkGTADOVyPFB35238DAC2ACcASuI4WjbXFXxZAA+CpQiLSAagBDLpq3Zs0R3KbUuKDNpWn28R6WZs959d8Kt5ro+Cxhgx4sVZrg/F3xCtt0O0YjAroZxGqWE7qHrgR0czM9xzjPlo7a69sA3Ls41Fxj1F7ZRsQHgUMlOjxRWLzzuogNRXl5KzwdiN2zzMzl84RbB4wA8afQ0QvMjtEploo/DAAAAAASUVORK5CYII=");
                    }
                    else {
                        $("#" + view.GetViewID() + "ui_tree_visible").removeClass('clck');
                        $("#" + view.GetViewID() + "ui_tree_img").attr("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABK0lEQVRYhe2WwU0DMRBFH4gCKIGzT+kAOoAOyFZg7cFnwtkH4gpCOggdkA44+UrogA5AI7ySFbTWzm4ikOJ/XI+/39jjWVN18jrTbIDx4Qp4L8VEZ1WeahkfvgqAvWN9Oj8qbQWoAAN0MWbSmGr/t9I2ojlwC9wAl3vDn8Ar8BKdfR7qOQjA+HAHPAHSCTfAFngD7lPIGpgB14DE7oA2OruZDGB8WAGSuWT1GJ3dZWMLftrvIvsmkA/dnOhsU/IvFmFaQIyaoduaABvjg+zSyvjwkQPuq/caGh9mKZNWc6YZiMxpxSN56QAAK0UVnV1qF88glqkw7RiAeSquqVonLzUAqdKn6hAex9Ova9jXZruXTulVpInppP4Z5X1gSsxogEOrAvw5QNWJC/gGzxpfJC2uLCoAAAAASUVORK5CYII=");
                    }
                }
            } else {
                let ui_tree_visible = document.getElementById(view.GetViewID() + "ui_tree_visible");
                let ui_tree_img = document.getElementById(view.GetViewID() + "ui_tree_img");
                if (ui_tree_visible) {
                    if (scope.Visible) {
                        ui_tree_visible.classList.add('clck');
                        ui_tree_img.setAttribute("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAA5klEQVRYhe2W/QmDMBDF70oHyQiO4AiO4AZ1BEfoBuIEruAI3aAjOMIrBycESWJjY/9o7wdByH28Z5RwZBg5AHDY4fQDRUIkFYtxOcOkGTADOVyPFB35238DAC2ACcASuI4WjbXFXxZAA+CpQiLSAagBDLpq3Zs0R3KbUuKDNpWn28R6WZs959d8Kt5ro+Cxhgx4sVZrg/F3xCtt0O0YjAroZxGqWE7qHrgR0czM9xzjPlo7a69sA3Ls41Fxj1F7ZRsQHgUMlOjxRWLzzuogNRXl5KzwdiN2zzMzl84RbB4wA8afQ0QvMjtEploo/DAAAAAASUVORK5CYII=");
                    }
                    else {
                        ui_tree_visible.classList.remove('clck');
                        ui_tree_img.setAttribute.attr("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABK0lEQVRYhe2WwU0DMRBFH4gCKIGzT+kAOoAOyFZg7cFnwtkH4gpCOggdkA44+UrogA5AI7ySFbTWzm4ikOJ/XI+/39jjWVN18jrTbIDx4Qp4L8VEZ1WeahkfvgqAvWN9Oj8qbQWoAAN0MWbSmGr/t9I2ojlwC9wAl3vDn8Ar8BKdfR7qOQjA+HAHPAHSCTfAFngD7lPIGpgB14DE7oA2OruZDGB8WAGSuWT1GJ3dZWMLftrvIvsmkA/dnOhsU/IvFmFaQIyaoduaABvjg+zSyvjwkQPuq/caGh9mKZNWc6YZiMxpxSN56QAAK0UVnV1qF88glqkw7RiAeSquqVonLzUAqdKn6hAex9Ova9jXZruXTulVpInppP4Z5X1gSsxogEOrAvw5QNWJC/gGzxpfJC2uLCoAAAAASUVORK5CYII=");
                    }
                }
            }

            itemMetrics = getTextMetrics("Tmp", font);

            initScrollInfo();
        }

        function initScrollInfo() {
            // y Scroll 정리
            // y Scroll 전체 크기 정보
            canvas_tree.width = div_scroll.clientWidth;

            canvas_tree.height = div_scroll.clientHeight;
            //canvas_tree.height = div_scroll.clientHeight - div_title.clientHeight;

            scrollinfo_y = scrollinfo();
            scrollinfo_y.rect.x = ctx_scroll.canvas.width - scrollinfo_y.size;
            scrollinfo_y.rect.y = 0;
            scrollinfo_y.rect.width = scrollinfo_y.size;
            scrollinfo_y.rect.height = ctx_scroll.canvas.height - scrollinfo_y.size;
            //scrollinfo_y.rect.height = 100;
            // y Scroll 스크롤 박스 정보
            scrollinfo_y.rect_scroll.x = scrollinfo_y.rect.x + 1; // 좌우 1픽셀 여유
            scrollinfo_y.rect_scroll.y = scrollinfo_y.rect.y + scrollinfo_y.button.size + 1; // top 버튼 크기 적용
            scrollinfo_y.rect_scroll.width = scrollinfo_y.rect.width - 2; // 좌우 1픽셀 여유
            scrollinfo_y.rect_scroll.height = scrollinfo_y.rect.height - scrollinfo_y.button.size * 2; // 총 높이에서 버튼 2개 크기 제외



            //scrollinfo_y.rect_scroll.height = 120;
            // y Scroll 아이템 정리
            scrollinfo_y.scroll.x = scrollinfo_y.rect_scroll.x + 1; // 좌우 1픽셀 여유
            scrollinfo_y.scroll.y = scrollinfo_y.rect_scroll.y;
            scrollinfo_y.scroll.width = scrollinfo_y.rect_scroll.width - 2;
            scrollinfo_y.scroll.height = 20;

            drawCnt = Math.floor(scrollinfo_y.rect.height / drawinfo.height);

            // x Scroll 정리
            scrollinfo_x = scrollinfo();
            scrollinfo_x.rect.x = 0;
            scrollinfo_x.rect.y = ctx_scroll.canvas.height - scrollinfo_x.size;
            scrollinfo_x.rect.width = ctx_scroll.canvas.width - scrollinfo_y.size;
            scrollinfo_x.rect.height = scrollinfo_x.size;

            // x Scroll 스크롤 박스 정보
            scrollinfo_x.rect_scroll.x = scrollinfo_x.rect.x + scrollinfo_x.button.size + 1; // left Button 적용
            scrollinfo_x.rect_scroll.y = scrollinfo_x.rect.y + 1; // 
            scrollinfo_x.rect_scroll.width = scrollinfo_x.rect.width - scrollinfo_x.button.size * 2; // 총 넓이에서 버튼 2개 크기 제외
            scrollinfo_x.rect_scroll.height = scrollinfo_x.rect.height - 2; // 상하 1픽셀 여유


            // x Scroll 아이템
            scrollinfo_x.scroll.x = scrollinfo_x.rect_scroll.x; // 좌우 1픽셀 여유
            scrollinfo_x.scroll.y = scrollinfo_x.rect_scroll.y + 1;
            scrollinfo_x.scroll.width = 20;
            scrollinfo_x.scroll.height = scrollinfo_x.rect_scroll.height - 2;

            scrollinfo_x.scroll.max = scrollinfo_x.rect_scroll.width;
        }

        function resizeScrollInfo() {
            canvas_tree.width = div_scroll.clientWidth;
            //canvas_tree.height = div_scroll.clientHeight - div_title.clientHeight;
            canvas_tree.height = div_scroll.clientHeight;

            scrollinfo_y.rect.x = ctx_scroll.canvas.width - scrollinfo_y.size;
            scrollinfo_y.rect.y = 0;
            scrollinfo_y.rect.width = scrollinfo_y.size;
            scrollinfo_y.rect.height = ctx_scroll.canvas.height - (scrollinfo_x.enable === true ? scrollinfo_y.size : 0);
            //scrollinfo_y.rect.height = 100;
            // y Scroll 스크롤 박스 정보
            scrollinfo_y.rect_scroll.x = scrollinfo_y.rect.x + 1; // 좌우 1픽셀 여유
            scrollinfo_y.rect_scroll.y = scrollinfo_y.rect.y + scrollinfo_y.button.size + 1; // top 버튼 크기 적용
            scrollinfo_y.rect_scroll.width = scrollinfo_y.rect.width - 2; // 좌우 1픽셀 여유
            scrollinfo_y.rect_scroll.height = scrollinfo_y.rect.height - scrollinfo_y.button.size * 2; // 총 높이에서 버튼 2개 크기 제외



            //scrollinfo_y.rect_scroll.height = 120;
            // y Scroll 아이템 정리
            scrollinfo_y.scroll.x = scrollinfo_y.rect_scroll.x + 1; // 좌우 1픽셀 여유
            scrollinfo_y.scroll.y = scrollinfo_y.rect_scroll.y;
            scrollinfo_y.scroll.width = scrollinfo_y.rect_scroll.width - 2;

            drawCnt = Math.floor(scrollinfo_y.rect.height / drawinfo.height);

            scrollinfo_y.scroll.max = listTreeVisible.length;
            // 스크롤 크기 조정
            if (scrollinfo_y.rect_scroll.height > scrollinfo_y.scroll.max) {
                scrollinfo_y.scroll.height = scrollinfo_y.rect_scroll.height - scrollinfo_y.scroll.max + drawCnt;
                scrollinfo_y.scroll.interval = 1;
            }
            else {
                scrollinfo_y.scroll.height = scrollinfo_y.rect_scroll.height - scrollinfo_y.scroll.max + drawCnt;
                let calinterval = 1.0 / scrollinfo_y.rect_scroll.height;
                if (scrollinfo_y.scroll.height < 20)
                    scrollinfo_y.scroll.height = 20;
                scrollinfo_y.scroll.interval = Math.ceil(calinterval);
            }

            // x Scroll 정리
            scrollinfo_x.rect.x = 0;
            scrollinfo_x.rect.y = ctx_scroll.canvas.height - scrollinfo_x.size;
            scrollinfo_x.rect.width = ctx_scroll.canvas.width - (scrollinfo_y.enable === true ? scrollinfo_y.size : 0);
            scrollinfo_x.rect.height = scrollinfo_x.size;

            // x Scroll 스크롤 박스 정보
            scrollinfo_x.rect_scroll.x = scrollinfo_x.rect.x + scrollinfo_x.button.size + 1; // left Button 적용
            scrollinfo_x.rect_scroll.y = scrollinfo_x.rect.y + 1; // 
            scrollinfo_x.rect_scroll.width = scrollinfo_x.rect.width - scrollinfo_x.button.size * 2; // 총 넓이에서 버튼 2개 크기 제외
            scrollinfo_x.rect_scroll.height = scrollinfo_x.rect.height - 2; // 상하 1픽셀 여유


            // x Scroll 아이템
            scrollinfo_x.scroll.x = scrollinfo_x.rect_scroll.x; // 좌우 1픽셀 여유
            scrollinfo_x.scroll.y = scrollinfo_x.rect_scroll.y + 1;
            scrollinfo_x.scroll.width = 20;
            scrollinfo_x.scroll.height = scrollinfo_x.rect_scroll.height - 2;

            //scrollinfo_x.scroll.max = scrollinfo_x.rect_scroll.width;
            if (scrollinfo_x.rect_scroll.width > scrollinfo_x.scroll.max) {
                scrollinfo_x.scroll.width = scrollinfo_x.rect_scroll.width - scrollinfo_x.scroll.max + scrollinfo_x.rect_scroll.width;
                scrollinfo_y.scroll.interval = 1;
            }
            else {
                if (scrollinfo_x.rect_scroll.width < 0)
                    scrollinfo_x.rect_scroll.width = 0;
                scrollinfo_x.scroll.width = scrollinfo_x.rect_scroll.width - scrollinfo_x.scroll.max + scrollinfo_x.rect_scroll.width;
                let calinterval = 1.0 / scrollinfo_x.rect_scroll.width;
                if (scrollinfo_x.scroll.width < scrollinfo_x.scroll.min_width)
                    scrollinfo_x.scroll.width = scrollinfo_x.scroll.min_width;
                scrollinfo_x.scroll.interval = Math.ceil(calinterval);

            }


        }

        function makeVisibleTree() {
            // 리스트 초기화
            // listTree.splice(0, listTree.length);
            // listVisible.splice(0, listVisible.length);
            // listSelection.splice(0, listSelection.length);
            // listColor.splice(0, listColor.length);
            // listTransform.splice(0, listTransform.length);
            // listExpand.splice(0, listExpand.length);
            // listNodeID.splice(0, listNodeID.length);

            listTreeVisible.splice(0, listTreeVisible.length);
            listExpand.splice(0, listExpand.length);
            //listNodeID.splice(0, listNodeID.length);
            //listIndexByID.splice(0, listIndexByID.length);

            let metrics = getTextMetrics("가", font);
            let text_ratio = metrics.width;
            //let text_ratio = 1;
            let text_max_length = 0;
            let text_max_level = 0;

            let listTreeOffset = view.Data.ModelFileManager.listDataOffset;

            let list = listTree;
            // 전체 목록을 기준으로 노드 정보 반환
            // 트리 만들기
            //let map = view.Property.GetPropertyMap();
            let map = view.Property.GetPropertyTreeMap();

            //map.treeMap = new Map([...map.treeMap.entries()].sort());

            let setTextInfo = function (index, level, length) {
                if (level <= expandLevel)
                    listExpand[index] = true;

                else
                    listExpand[index] = false;

                if (text_max_level < level)
                    text_max_level = level;

                let textlength = length;
                if (textlength > text_max_length)
                    text_max_length = textlength;
            };


            let addNode = function (value, pNode) {
                let item = treeItem(list.length, pNode.id, value, 2, false);

                list.push(item);
                item.last_offset = list.length - 1;
                item.sibling_offset = list.length - 1;
                item.objectid = item.name;

                setTextInfo(item.id, item.level, value.length);
            }


            // Key 부터 돌기
            let addKeyNode = function (value, key, map) {
                let keyNode = treeItem(list.length, -1, key, 0, false);
                list.push(keyNode);

                setTextInfo(keyNode.id, keyNode.level, key.length);

                let addValueNode = function (value, key, map) {
                    let valueNode = treeItem(list.length, keyNode.id, key, 1, false);
                    list.push(valueNode);
                    setTextInfo(valueNode.id, valueNode.level, key.length);

                    valueNode.last_offset = list.length + value.length - 1;

                    for (let i = 0; i < value.length; i++) {
                        addNode(value[i], valueNode);
                    }

                    valueNode.sibling_offset = list.length - 1;
                };

                //value = new Map([...value.entries()].sort());

                value.forEach(addValueNode);
                keyNode.last_offset = list.length - 1;
                keyNode.sibling_offset = list.length - 1;
            };
            map.treeMap.forEach(addKeyNode);

            // Range
            if (false) {
                scope.Elements.Range.value = expandLevel;
                scope.Elements.Range.max = text_max_level;
            }

            // x 스크롤 최대 길이
            let max = (text_max_level * drawinfo.offset_image) + (drawinfo.offset_image * 2) + (text_max_length * text_ratio) + drawinfo.offset_split * 2;
            scrollinfo_x.scroll.max = max;
            scrollinfo_x.scroll.interval = (scrollinfo_x.rect_scroll.width - scrollinfo_x.scroll.width) / scrollinfo_x.scroll.max; // 전체 목록 대비 화면상의 비율

            // 가시화 대상 분류
            for (let i = 0; i < listTree.length; i++) {
                let item = listTree[i];
                listTreeVisible.push(item);
                if (item.expand === false) {
                    // 인덱스 건너뛰기
                    i = item.last_offset;
                }
            }

            refreshVisibleTree();

            enableScroll();

            render();


        }

        function refreshVisibleTree() {
            setVisibleList();

            enableScroll();

            render();
        }

        function enableScroll() {

            if (scrollinfo_x.rect_scroll.width > scrollinfo_x.scroll.max) {
                scrollinfo_x.scroll.width = scrollinfo_x.rect_scroll.width - scrollinfo_x.scroll.max + scrollinfo_x.rect_scroll.width;
                scrollinfo_y.scroll.interval = 1;
            }
            else {
                scrollinfo_x.scroll.width = scrollinfo_x.rect_scroll.width - scrollinfo_x.scroll.max + scrollinfo_x.rect_scroll.width;
                let calinterval = 1.0 / scrollinfo_x.rect_scroll.width;
                if (scrollinfo_x.scroll.width < scrollinfo_x.scroll.min_width)
                    scrollinfo_x.scroll.width = scrollinfo_x.scroll.min_width;
                scrollinfo_x.scroll.interval = Math.ceil(calinterval);
            }

            // 스크롤 크기 조정
            if (scrollinfo_y.rect_scroll.height > scrollinfo_y.scroll.max) {
                scrollinfo_y.scroll.height = scrollinfo_y.rect_scroll.height - scrollinfo_y.scroll.max + drawCnt;
                scrollinfo_y.scroll.interval = 1;
            }
            else {
                scrollinfo_y.scroll.height = scrollinfo_y.rect_scroll.height - scrollinfo_y.scroll.max + drawCnt;
                let calinterval = 1.0 / scrollinfo_y.rect_scroll.height;
                if (scrollinfo_y.scroll.height < 20)
                    scrollinfo_y.scroll.height = 20;
                scrollinfo_y.scroll.interval = Math.ceil(calinterval);
            }

            if (listTree.length > drawCnt) {
                scrollinfo_y.enable = true;

            }
            else {
                scrollinfo_y.enable = false;
                scrollinfo_y.scroll.pos = 0;
            }


            if (scrollinfo_x.scroll.max > scrollinfo_x.rect.width)
                scrollinfo_x.enable = true;

            else {
                scrollinfo_x.enable = false;
                scrollinfo_x.scroll.pos = 0;
            }


        }

        function getTextMetrics(text, font) {
            let metrics;
            metrics = ctx_tree.measureText(text);
            metrics.height = font.size * 1.5;
            metrics.ascent = font.size + font.size * 0.1;
            return metrics;
        }

        function mousedown(event) {
            //if (scope.enabled === false) return;
            //console.log("SHTree : mousedown!!");

            event.preventDefault();
            event.stopPropagation();

            _state = STATE.NONE
            //console.log("Mouse Down");
            //let offset = $("#" + view.Container.id).offset();

            if (view.useJquery) {
                let offset = $("#" + div_tree.id).offset();
                //// Then refer to 
                let x = event.pageX - offset.left;
                let y = event.pageY - offset.top;

                //console.log(x + " : " + y);
                mouseArgs = event;
                onTreeDownEvent(x, y);
            } else {
                let offset = document.getElementById(div_tree.id).getBoundingClientRect();

                //// Then refer to 
                let x = event.pageX - offset.left;
                let y = event.pageY - offset.top;

                //console.log(x + " : " + y);
                mouseArgs = event;
                onTreeDownEvent(x, y);
            }

            canvas_tree.addEventListener('mousemove', mousemove, false);
            canvas_tree.addEventListener('mouseup', mouseup, false);
        }

        function dbclick(event) {
            //if (scope.enabled === false) return;
            event.preventDefault();
            event.stopPropagation();

            // 선택 정보가 있는경우 개체로 비행
            let cb_FocusedObject = function () {
                // 선택 개체 ID
                let selNode = view.Interface.Object3D.GetSelectedObject3D();
                view.Interface.View.EnableAnimation(true);
                // 포커스
                view.Interface.View.FocusObjectByNodeID(selNode);
                view.Interface.View.EnableAnimation(false);
            };
            if (view.Configuration.Tree.Event.DoubleClick === true)
                cb_FocusedObject();
        }

        function mousemove(event) {
            //if (scope.enabled === false) return;
            event.preventDefault();
            event.stopPropagation();

            //let offset = $("#" + view.Container.id).offset();
            //let offset = $("#" + div_tree_container.id).offset();
            if (view.useJquery) {
                let offset = $("#" + div_tree.id).offset();
                // Then refer to 
                let x = event.pageX - offset.left;
                let y = event.pageY - offset.top;

                onTreeMoveEvent(x, y);
            } else {
                let offset = document.getElementById(div_tree.id).getBoundingClientRect();
                // Then refer to 
                let x = event.pageX - offset.left;
                let y = event.pageY - offset.top;

                onTreeMoveEvent(x, y);
            }
        }

        function mouseup(event) {
            //if (scope.enabled === false) return;
            event.preventDefault();
            event.stopPropagation();

            //let offset = $("#" + view.Container.id).offset();
            //let offset = $("#" + div_tree_container.id).offset();

            if (view.useJquery) {
                let offset = $("#" + div_tree.id).offset();
                // Then refer to 
                let x = event.pageX - offset.left;
                let y = event.pageY - offset.top;

                onTreeUpEvent(x, y);
            } else {
                let offset = document.getElementById(div_tree.id).getBoundingClientRect();
                // Then refer to 
                let x = event.pageX - offset.left;
                let y = event.pageY - offset.top;

                onTreeUpEvent(x, y);
            }

            canvas_tree.removeEventListener('mousemove', mousemove, false);
            canvas_tree.removeEventListener('mouseup', mouseup, false);
        }

        function mousewheel(event) {
            //event.preventDefault();
            //event.stopPropagation();

            let delta = 0;
            if (event.wheelDelta) { // WebKit / Opera / Explorer 9
                delta = event.wheelDelta / 40;
            } else if (event.detail) { // Firefox
                delta = -event.detail / 3;
            }

            if (delta < 0)
                _state = STATE.SCROLL_DOWN;

            else
                _state = STATE.SCROLL_UP;

            scrollAction();
        }

        function mouseout(event) {
            //event.preventDefault();
            //event.stopPropagation();

            //let offset = $("#" + view.Container.id).offset();
            //// Then refer to 
            //let x = event.pageX - offset.left;
            //let y = event.pageY - offset.top;
            //if (scrollinfo_y.rect.x - scrollinfo_y.space > x
            //    || scrollinfo_y.rect.x + scrollinfo_y.rect.width + scrollinfo_y.space < x
            //    || scrollinfo_y.rect.y > y
            //    || scrollinfo_y.rect.y + scrollinfo_y.rect.height < y) {
            //    console.log("mouseout : " + x + " : " + y);
            //    mouseLeftDown = false;
            //    canvas_tree.removeEventListener('mousemove', mousemove, false);
            //    canvas_tree.removeEventListener('mouseup', mouseup, false);
            //}
            mouseLeftDown = false;
            _state = STATE.NONE;
            //canvas_tree.removeEventListener('mousemove', mousemove, false);
            //canvas_tree.removeEventListener('mouseup', mouseup, false);
        }

        function touchstart(event) {
            event.preventDefault();
            event.stopPropagation();

            if (event.touches.length <= 0)
                return;


            if (view.useJquery) {
                let offset = $("#" + div_tree.id).offset();
                //// Then refer to 
                let x = event.touches[0].pageX - offset.left;
                let y = event.touches[0].pageY - offset.top;

                onTreeDownEvent(x, y);
            } else {
                let offset = document.getElementById(div_tree.id).getBoundingClientRect();
                //// Then refer to 
                let x = event.touches[0].pageX - offset.left;
                let y = event.touches[0].pageY - offset.top;

                onTreeDownEvent(x, y);
            }

            canvas_tree.addEventListener('touchend', touchend, false);
            canvas_tree.addEventListener('touchmove', touchmove, false);

        }

        function touchend(event) {
            event.preventDefault();
            event.stopPropagation();

            //let offset = $("#" + div_tree.id).offset();
            ////// Then refer to 
            //let x = event.touches[0].pageX - offset.left;
            //let y = event.touches[0].pageY - offset.top;
            let x = mouseLastPosition.x;
            let y = mouseLastPosition.y;

            onTreeUpEvent(x, y);

            canvas_tree.removeEventListener('touchend', touchend, false);
            canvas_tree.removeEventListener('touchmove', touchmove, false);
        }

        function touchmove(event) {
            event.preventDefault();
            event.stopPropagation();

            if (event.touches.length <= 0)
                return;

            if (view.useJquery) {
                let offset = $("#" + div_tree.id).offset();
                //// Then refer to 
                let x = event.touches[0].pageX - offset.left;
                let y = event.touches[0].pageY - offset.top;

                onTreeMoveEvent(x, y);
            } else {
                let offset = document.getElementById(div_tree.id).getBoundingClientRect();
                //// Then refer to 
                let x = event.touches[0].pageX - offset.left;
                let y = event.touches[0].pageY - offset.top;

                onTreeMoveEvent(x, y);
            }
        }

        function drawScroll() {

            if (scrollinfo_y.enable) {
                let img_up = document.getElementById('ui_scroll_img_up');
                let img_down = document.getElementById('ui_scroll_img_down');

                //ctx_tree.clearRect(0, 0, ctx_tree.canvas.width, ctx_tree.canvas.height);
                ctx_scroll.fillStyle = view.Data.GetColorString(scrollinfo_y.color.back); //"rgba(140, 140, 140, 1)";

                // 스크롤 배경 그리기
                ctx_scroll.fillRect(scrollinfo_y.rect.x, scrollinfo_y.rect.y, scrollinfo_y.rect.width, scrollinfo_y.rect.height);

                // 버튼 박스 그리기
                ctx_scroll.fillStyle = view.Data.GetColorString(scrollinfo_y.color.button); //"rgba(120, 120, 120, 0.2)";
                ctx_scroll.fillRect(scrollinfo_y.rect.x, scrollinfo_y.rect.y, scrollinfo_y.button.size, scrollinfo_y.button.size);
                ctx_scroll.fillRect(scrollinfo_y.rect.x, scrollinfo_y.rect.height - scrollinfo_y.button.size, scrollinfo_y.button.size, scrollinfo_y.button.size);

                // 위, 아래 버튼 그리기
                //ctx_scroll.drawImage(img_up, scrollinfo_y.rect.x, scrollinfo_y.rect.y, scrollinfo_y.button.size, scrollinfo_y.button.size);
                //ctx_scroll.drawImage(img_down, scrollinfo_y.rect.x, scrollinfo_y.rect.height - scrollinfo_y.button.size, scrollinfo_y.button.size, scrollinfo_y.button.size);
                draw_TreeImage(ctx_scroll, img_up, scrollinfo_y.rect.x, scrollinfo_y.rect.y, scrollinfo_y.button.size, scrollinfo_y.button.size);
                draw_TreeImage(ctx_scroll, img_down, scrollinfo_y.rect.x, scrollinfo_y.rect.height - scrollinfo_y.button.size, scrollinfo_y.button.size, scrollinfo_y.button.size);

                // 스크롤 아이템 그리기
                ctx_scroll.fillStyle = view.Data.GetColorString(scrollinfo_y.color.scroll); //"rgba(250, 250, 250, 0.5)";



                //ctx_scroll.fillRect(scrollinfo_y.scroll.x, scrollinfo_y.scroll.y + scrollinfo_y.scroll.pos, scrollinfo_y.scroll.width, scrollinfo_y.scroll.height);
                // 전체 리스트 중 포지션 값 비율
                if (scrollinfo_y.scroll.pos === 0) {
                    ctx_scroll.fillRect(scrollinfo_y.scroll.x, scrollinfo_y.scroll.y, scrollinfo_y.scroll.width, scrollinfo_y.scroll.height);
                }
                else {
                    let stepScroll = ((scrollinfo_y.rect_scroll.height - scrollinfo_y.scroll.height) * scrollinfo_y.scroll.pos / (scrollinfo_y.scroll.max - drawCnt));
                    ctx_scroll.fillRect(scrollinfo_y.scroll.x, scrollinfo_y.scroll.y + stepScroll, scrollinfo_y.scroll.width, scrollinfo_y.scroll.height);
                }
            }
            if (scrollinfo_x.enable) {

                let img_left = document.getElementById('ui_scroll_img_left');
                let img_right = document.getElementById('ui_scroll_img_right');

                ctx_scroll.fillStyle = view.Data.GetColorString(scrollinfo_x.color.back); //"rgba(140, 140, 140, 1)";

                // 스크롤 배경 그리기
                ctx_scroll.fillRect(scrollinfo_x.rect.x, scrollinfo_x.rect.y, scrollinfo_x.rect.width, scrollinfo_x.rect.height);

                // 버튼 박스 그리기
                ctx_scroll.fillStyle = view.Data.GetColorString(scrollinfo_x.color.button); //"rgba(120, 120, 120, 0.2)";
                ctx_scroll.fillRect(scrollinfo_x.rect.x, scrollinfo_x.rect.y, scrollinfo_x.size, scrollinfo_x.size);
                ctx_scroll.fillRect(scrollinfo_x.rect.width - scrollinfo_x.size, scrollinfo_x.rect.y, scrollinfo_x.size, scrollinfo_x.size);

                // 위, 아래 버튼 그리기
                //ctx_scroll.drawImage(img_left, scrollinfo_x.rect.x, scrollinfo_x.rect.y, scrollinfo_x.button.size, scrollinfo_x.button.size);
                //ctx_scroll.drawImage(img_right, scrollinfo_x.rect.width - scrollinfo_x.size, scrollinfo_x.rect.y, scrollinfo_x.button.size, scrollinfo_x.button.size);
                draw_TreeImage(ctx_scroll, img_left, scrollinfo_x.rect.x, scrollinfo_x.rect.y, scrollinfo_x.button.size, scrollinfo_x.button.size);
                draw_TreeImage(ctx_scroll, img_right, scrollinfo_x.rect.width - scrollinfo_x.size, scrollinfo_x.rect.y, scrollinfo_x.button.size, scrollinfo_x.button.size);

                // 스크롤 아이템 그리기
                ctx_scroll.fillStyle = view.Data.GetColorString(scrollinfo_x.color.scroll); //"rgba(250, 250, 250, 0.5)";

                if (scrollinfo_x.pos === 0) {
                    ctx_scroll.fillRect(scrollinfo_x.scroll.x, scrollinfo_x.scroll.y, scrollinfo_x.scroll.width, scrollinfo_x.scroll.height);
                }
                else {
                    //let stepScroll = ((scrollinfo_x.rect_scroll.width - scrollinfo_x.scroll.width) * scrollinfo_x.scroll.pos / (scrollinfo_x.scroll.max - scrollinfo_x.rect.width));
                    ctx_scroll.fillRect(scrollinfo_x.scroll.x + scrollinfo_x.scroll.pos, scrollinfo_x.scroll.y, scrollinfo_x.scroll.width, scrollinfo_x.scroll.height);
                }
            }

            if (scrollinfo_y.enable && scrollinfo_x.enable) {
                // space fill
                ctx_scroll.fillStyle = view.Data.GetColorString(scrollinfo_x.color.back);
                ctx_scroll.fillRect(scrollinfo_x.rect.x + scrollinfo_x.rect.width, scrollinfo_y.rect.y + scrollinfo_y.rect.height, scrollinfo_x.size, scrollinfo_y.size);
            }
        }


        function draw_Rect(ctx, x, y, w, h, back, border) {
            if (back)
                ctx.fillRect(x, y, w, h);
            if (border)
                ctx.strokeRect(x, y, w, h);
        }
        function render_PropertyTree() {
            ctx_tree = canvas_tree.getContext("2d");

            if (ctx_tree === undefined) return;

            ctx_tree.fillStyle = view.Data.GetColorString(drawinfo.color.back); //"rgba(255, 255, 255, 0.5)"; 
            ctx_tree.clearRect(0, 0, ctx_tree.canvas.width, ctx_tree.canvas.height);
            draw_Rect(ctx_tree, 0, 0, ctx_tree.canvas.width, ctx_tree.canvas.height, true, false);


            let height = drawinfo.height;
            //let offsetScroll = Math.floor(scrollinfo_y.scroll.pos * scrollinfo_y.scroll.interval) + drawDetailPos;
            let offsetScroll = scrollinfo_y.scroll.pos;
            let cnt = 0;


            let img_expand = document.getElementById('ui_tree_img_expand');
            let img_collapse = document.getElementById('ui_tree_img_collapse');
            let img_check = document.getElementById('ui_tree_img_check');
            let img_halfcheck = document.getElementById('ui_tree_img_halfcheck');
            let img_uncheck = document.getElementById('ui_tree_img_uncheck');
            let img_leaf = document.getElementById('ui_tree_img_leaf');
            let img_line = document.getElementById('ui_tree_img_line');
            let img_asembly = document.getElementById('ui_tree_img_assembly');
            let img_part = document.getElementById('ui_tree_img_part');
            let img_body = document.getElementById('ui_tree_img_body');

            let drawTree = function (value) {
                let title;
                title = value.name;
                let level = value.level;
                let offset_y = (cnt) * drawinfo.height;
                let hideSpace = scrollinfo_x.scroll.max - scrollinfo_x.rect.width; // 그려지지 않은 영역
                let scrollSpace = (scrollinfo_x.rect_scroll.width - scrollinfo_x.scroll.width); // 스크롤 이동 가능 영역

                // scroll : hide = 1 : x
                let interval_x = hideSpace / scrollSpace; // (전체 목록 대비 화면상의 비율 : 트리 가로 최대 크기 - 스크롤에서 보여지는 화면 크기)
                if (scrollSpace === 0)
                    interval_x = 0;

                let offset_x = level * drawinfo.offset_image - (scrollinfo_x.scroll.pos * interval_x);
                if (level < 1) {
                    if (value.expand)
                        draw_TreeImage(ctx_tree, img_expand, offset_x, offset_y, drawinfo.size_img, drawinfo.size_img);
                    else
                        draw_TreeImage(ctx_tree, img_collapse, offset_x, offset_y, drawinfo.size_img, drawinfo.size_img);
                }
                else {
                    draw_TreeImage(ctx_tree, img_leaf, offset_x, offset_y, drawinfo.size_img, drawinfo.size_img);
                }
                offset_x += drawinfo.offset_image;

                // 노드 Visible 상태 확인
                let select = value.select;
                offset_x += drawinfo.offset_split * 2;
                // Selection
                ctx_tree.font = font.size + "pt " + font.face;
                itemMetrics = getTextMetrics(title, font);

                let offsetTop = (drawinfo.size_img - itemMetrics.height) / 2 + 1;
                if (select) {
                    ctx_tree.fillStyle = view.Data.GetColorString(drawinfo.color.select); //"rgba(54, 175, 184, 0.2)";
                    draw_RoundRect(ctx_tree, offset_x, offset_y + 1, itemMetrics.width + 8, drawinfo.size_img - 2, 4, true, false);
                }
                ctx_tree.fillStyle = view.Data.GetColorString(font.color); //"rgba(0, 0, 0, 1)";
                ctx_tree.textBaseline = 'top';
                ctx_tree.fillText(title, offset_x + 4, (offset_y + offsetTop) + 1);
                cnt++;
            };

            listDraw = getDrawList(offsetScroll);

            resizeScrollInfo();
            //scrollinfo_x.scroll.max = 0;
            for (let i = 0; i < listDraw.length; i++) {
                drawTree(listDraw[i]);
            }
            drawScroll();
        }

        function draw_RoundRect(ctx, x, y, w, h, r, back, border) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();

            if (back)
                ctx.fill();
            if (border)
                ctx.stroke();
        }
        function draw_TreeImage(ctx, image, x, y, w, h) {

            if (image === undefined || image === null || ctx === undefined)
                return;

            ctx.drawImage(image, x, y, w, h);
        }

        function getDrawList(scroll) {
            let list = [];
            let idx_drawStart = scroll;

            for (let i = 0; i < listTreeVisible.length; i++) {
                let item = listTreeVisible[i];
                if (i < idx_drawStart || list.length > drawCnt) {
                    continue;
                }

                list.push(item);
            }

            scrollinfo_y.scroll.max = listTreeVisible.length;

            // 스크롤 크기 조정
            if (scrollinfo_y.rect_scroll.height > scrollinfo_y.scroll.max) {
                scrollinfo_y.scroll.height = scrollinfo_y.rect_scroll.height - scrollinfo_y.scroll.max + drawCnt;
                scrollinfo_y.scroll.interval = 1;
            }
            else {
                scrollinfo_y.scroll.height = scrollinfo_y.rect_scroll.height - scrollinfo_y.scroll.max + drawCnt;
                let calinterval = 1.0 / scrollinfo_y.rect_scroll.height;
                if (scrollinfo_y.scroll.height < 20)
                    scrollinfo_y.scroll.height = 20;

                scrollinfo_y.scroll.interval = Math.ceil(calinterval);

            }
            // drawCount
            drawCnt = Math.floor(scrollinfo_y.rect.height / drawinfo.height);

            if (listDraw.length >= drawCnt)
                scrollinfo_y.enable = true;

            else
                scrollinfo_y.enable = false;



            return list;
        }

        function getExpand(value) {
            return listTree[value.id].expand;
        }

        function setExpand(value, expand) {
            listTree[value.id].expand = expand;

            refreshVisibleTree();
        }

        function checkEvent(x, y) {
            //scrollinfo_y.rect.x = ctx_scroll.canvas.width - scrollinfo_y.size;
            //scrollinfo_y.rect.y = 0;
            //scrollinfo_y.rect.width = scrollinfo_y.size;
            //scrollinfo_y.rect.height = ctx_scroll.canvas.height - scrollinfo_y.size;
            // y scroll 확인
            if (scrollinfo_y.rect.x <= x && scrollinfo_y.rect.x + scrollinfo_y.rect.width > x
                && scrollinfo_y.rect.y <= y && scrollinfo_y.rect.y + scrollinfo_y.rect.height) {

                // 버튼 확인
                if (scrollinfo_y.rect.y + scrollinfo_y.button.size > y) {
                    _state = STATE.SCROLL_UP;
                    //console.log("STATE.SCROLL_UP");
                    return;
                }

                if (scrollinfo_y.rect.height - scrollinfo_y.button.size < y) {
                    _state = STATE.SCROLL_DOWN;
                    //console.log("STATE.SCROLL_DOWN");
                    return;
                }

                // 포지션 확인
                if (scrollinfo_y.scroll.y < y && scrollinfo_y.scroll.y + scrollinfo_y.scroll.pos + scrollinfo_y.scroll.height > y) {
                    _state = STATE.SCROLL_MOVE_V;
                    //console.log("STATE.SCROLL_MOVE_V");
                    return;
                }
            }

            // x scroll 확인
            if (scrollinfo_x.rect.x <= x && scrollinfo_x.rect.x + scrollinfo_x.rect.width > x
                && scrollinfo_x.rect.y <= y && scrollinfo_x.rect.y + scrollinfo_x.rect.height) {

                // 버튼 확인
                if (scrollinfo_x.rect.x + scrollinfo_x.button.size > x) {
                    _state = STATE.SCROLL_LEFT;
                    //console.log("STATE.SCROLL_LEFT");
                    return;
                }

                if (scrollinfo_x.rect.width - scrollinfo_x.button.size < x) {
                    _state = STATE.SCROLL_RIGHT;
                    //console.log("STATE.SCROLL_RIGHT");
                    return;
                }

                // 포지션 확인
                if (scrollinfo_x.scroll.x < x && scrollinfo_x.scroll.x + scrollinfo_x.scroll.pos + scrollinfo_x.scroll.width > x) {
                    _state = STATE.SCROLL_MOVE_H;
                    //console.log("STATE.SCROLL_MOVE_H");
                    return;
                }
            }

            // Node Event
            // Check
            checkTreeEvent(x, y);

            // Select
        }

        function checkTreeEvent(x, y) {
            let drawIndex = Math.floor(y / drawinfo.height);

            if (drawIndex > listDraw.length - 1)
                return;

            // check
            let node = listDraw[drawIndex];

            let offset_x = 0;
            if (scrollinfo_x.enable) {
                // let interval_x = (scrollinfo_x.rect_scroll.width - scrollinfo_x.scroll.width) / (scrollinfo_x.scroll.max - scrollinfo_x.rect.width); // 전체 목록 대비 화면상의 비율
                // offset_x = (scrollinfo_x.scroll.pos * interval_x);

                let hideSpace = scrollinfo_x.scroll.max - scrollinfo_x.rect.width; // 그려지지 않은 영역

                let scrollSpace = (scrollinfo_x.rect_scroll.width - scrollinfo_x.scroll.width); // 스크롤 이동 가능 영역

                //let interval_x = (scrollinfo_x.rect_scroll.width - scrollinfo_x.scroll.width) / (scrollinfo_x.scroll.max - scrollinfo_x.rect.width); // (전체 목록 대비 화면상의 비율 : 트리 가로 최대 크기 - 스크롤에서 보여지는 화면 크기)

                // scroll : hide = 1 : x
                let interval_x = hideSpace / scrollSpace; // (전체 목록 대비 화면상의 비율 : 트리 가로 최대 크기 - 스크롤에서 보여지는 화면 크기)

                //offset_x = node.level * drawinfo.offset_image - (scrollinfo_x.scroll.pos * interval_x);
                offset_x = (scrollinfo_x.scroll.pos * interval_x);
            }

            let xExpandStart = node.level * drawinfo.offset_image - offset_x; // Expand Collipse 박스 시작 위치
            let xExpandEnd = xExpandStart + drawinfo.offset_image;

            if (x > xExpandStart && x < xExpandEnd) {
                //console.log(node.name + " Exapnd!!!");
                let expand = getExpand(node);
                expand = !expand;

                setExpand(node, expand);
                return;
            }

            // let xCheckStart = (node.level * drawinfo.offset_image + drawinfo.offset_image) - offset_x; // 체크 박스 시작 위치
            // let xCheckEnd = xCheckStart + drawinfo.offset_image;

            // if (x > xCheckStart && x < xCheckEnd) {
            //     //console.log(node.name + " Visible!!!");
            //     let currentVisible = getVisible(node, node.node_type === VIZCore.Enum.ENTITY_TYPES.EntBody ? true : false);
            //     let visible = 0;
            //     if (currentVisible === 0)
            //         visible = 1;
            //     else if (currentVisible === 1)
            //         visible = 0;

            //     else
            //         visible = 0;

            //     setVisible(node, visible);
            //     return;
            // }

            let xSelectStart = (node.level * drawinfo.offset_image) - offset_x; // Expand Collipse 박스 시작 위치
            let xSelectEnd = ctx_scroll.canvas.width;

            if (x > xSelectStart && x < xSelectEnd) {
                //console.log(node.name + " Selection!!!");
                if (node.select === false) {
                    let select = true;
                    if (mouseArgs !== undefined) {
                        if (mouseArgs.ctrlKey) {
                            setSelection(node, select, true);
                        }
                        else {
                            setSelection(node, select, false);
                        }
                        mouseArgs = undefined;
                    }
                    else {
                        setSelection(node, select, false);
                    }
                }

                return;
            }
        }

        function getNodeIds(node) {
            let ids = [];
            for (let i = node.id; i <= node.sibling_offset; i++) {
                let item = listTree[i];
                if (item.level !== 2)
                    continue;

                ids.push(item.name);
            }
            return ids;
        }

        function clearSelection() {
            for (let i = 0; i < listTree.length; i++) {
                let item = listTree[i];
                item.select = false;
            }

            setVisibleList();

            render();
        }

        function setSelection(node, select, append) {
            if (append !== undefined && append === false) {
                // 전체 선택 해제
                clearSelection();
            }

            // 노드 정보 반환
            {
                node.select = select;
                let ids = getNodeIds(node);
                view.Interface.Object3D.SelectByNodeID(ids, select, append);
            }

            // 노드 선택 처리
            render();
        }

        function scrollAction() {
            if (_state === STATE.SCROLL_UP) {
                scrollinfo_y.scroll.pos--;

                if (scrollinfo_y.scroll.pos < 0)
                    scrollinfo_y.scroll.pos = 0;

                render();
            }
            else if (_state === STATE.SCROLL_DOWN) {
                scrollinfo_y.scroll.pos++;

                if (scrollinfo_y.scroll.pos > scrollinfo_y.scroll.max - drawCnt)
                    scrollinfo_y.scroll.pos = scrollinfo_y.scroll.max - drawCnt;

                render();
            }

            if (_state === STATE.SCROLL_LEFT) {
                scrollinfo_x.scroll.pos--;

                if (scrollinfo_x.scroll.pos < 0)
                    scrollinfo_x.scroll.pos = 0;

                render();
            }
            else if (_state === STATE.SCROLL_RIGHT) {
                scrollinfo_x.scroll.pos++;

                if (scrollinfo_x.scroll.pos > scrollinfo_x.rect_scroll.width - scrollinfo_x.scroll.width)
                    scrollinfo_x.scroll.pos = scrollinfo_x.rect_scroll.width - scrollinfo_x.scroll.width;

                render();
            }
        }

        function onTreeDownEvent(x, y) {
            checkEvent(x, y);

            mouseLeftDown = true;
            mouseDownPosition = new VIZCore.Vector2(x, y);
            mouseLastPosition = new VIZCore.Vector2(x, y);

            if (_state === STATE.SCROLL_UP || _state === STATE.SCROLL_DOWN
                || _state === STATE.SCROLL_LEFT || _state === STATE.SCROLL_RIGHT) {
                mousePressEvent = setInterval(function () {
                    if (mouseLeftDown === false) {
                        if (mousePressEvent !== null) {
                            clearInterval(mousePressEvent);
                            mousePressEvent = null;
                        }
                    }
                    else {
                        scrollAction();
                    }
                }, 30);
            }
        }

        function onTreeMoveEvent(x, y) {
            if (_state === STATE.SCROLL_MOVE_V) {
                let mouse = new VIZCore.Vector2(x, y);
                // 이동거리
                let move_y = mouse.y - mouseLastPosition.y;
                scrollinfo_y.scroll.interval = (scrollinfo_y.rect_scroll.height - scrollinfo_y.scroll.height) / scrollinfo_y.scroll.max; // 전체 목록 대비 화면상의 비율
                scrollinfo_y.scroll.pos += move_y / scrollinfo_y.scroll.interval;
                if (scrollinfo_y.scroll.pos < 0)
                    scrollinfo_y.scroll.pos = 0;

                if (scrollinfo_y.scroll.pos > scrollinfo_y.scroll.max - drawCnt)
                    scrollinfo_y.scroll.pos = scrollinfo_y.scroll.max - drawCnt;

                mouseLastPosition = new VIZCore.Vector2(x, y);
                render();
            }

            if (_state === STATE.SCROLL_MOVE_H) {
                let mouse = new VIZCore.Vector2(x, y);
                // 이동거리
                let move_x = mouse.x - mouseLastPosition.x;


                scrollinfo_x.scroll.pos += move_x; // / scrollinfo_x.scroll.interval;
                if (scrollinfo_x.scroll.pos < 0)
                    scrollinfo_x.scroll.pos = 0;

                if (scrollinfo_x.scroll.pos > scrollinfo_x.rect_scroll.width - scrollinfo_x.scroll.width)
                    scrollinfo_x.scroll.pos = scrollinfo_x.rect_scroll.width - scrollinfo_x.scroll.width;

                mouseLastPosition = new VIZCore.Vector2(x, y);
                render();
            }
        }

        function onTreeUpEvent(x, y) {
            scrollAction();
            mouseLastPosition = new VIZCore.Vector2(x, y);

            _state = STATE.NONE;
            mouseLeftDown = false;
        }

        function render() {
            render_PropertyTree();
        }

        function setVisibleList() {
            listTreeVisible = [];
            // 가시화 대상 분류
            for (let i = 0; i < listTree.length; i++) {
                let item = listTree[i];
                if (item.level > 1)
                    continue;
                listTreeVisible.push(item);
                if (item.expand === false) {
                    // 인덱스 건너뛰기
                    i = item.last_offset;
                }
            }
        };

        function onPropertyCompleted(val) {
            loadingCompleted = true;
        }

        function showElement(element, visible) {
            if (visible == true) {
                element.style.display = "block";
            }
            else {
                element.style.display = "none";
            }
        }

        this.Init = function () {
            view.EventHandler.addEventListener(VIZCore.Enum.EVENT_TYPES.View.Property_Completed, onPropertyCompleted);
        };

        this.Render = function () {
            render();
        };

        this.Resize = function () {
            resizeScrollInfo();
            drawScroll();
            refreshVisibleTree();
        };

        this.Show = function (visible) {
            scope.Visible = visible;

            if (initialized === false) {
                let tmPropertyLoad = setInterval(() => {
                    if (loadingCompleted) {
                        clearInterval(tmPropertyLoad);
                        makeVisibleTree();
                        initialized = true;
                        showElement(scope.Elements.Spin, false);
                    }
                }, 300);
            }

            if (visible) {
                scope.Resize();
            }

            // scope.Elements.Panel.Show(scope.Visible);

        };

        this.OnCloseButtonEvent = function (callback) {
            cbClose = callback;
        };

        this.Clear = () => {
            listTree = []; // 전체 데이터 관리
            listDraw = []; // 가시화 데이터 관리
            listTreeVisible = []; // 그려져야 하는 객체 목록만 관리
            listExpand = []; // 객체 노드 확장 관리     //Index
            expandLevel = 0;

            loadingCompleted = false; // Property 다운로드 상태 관리
            initialized = false; // 초기화 상태 관리

            render();
            // 강제로 창을 닫으므로 callback 호출
            this.Show(false);
            if (cbClose !== undefined)
                cbClose();
        };
    }
}

export default SHPropertyTree;