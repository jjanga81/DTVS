class UI_DockPanel {
    constructor(UI, vizcore, VIZCore) {
        let scope = this;

        this.Tab = {
            Right: {
                Top: {
                    Side: {
                        Button: undefined,
                        Sub: undefined,
                    },
                    Content: {
                        Title: {
                            Text: undefined,
                            Button: undefined,
                            Pin: undefined
                        },
                        Button: undefined,
                        Element: undefined
                    }
                },
                Bottom: {
                    Side: {
                        Button: undefined,
                        Sub: undefined,
                    },
                    Content: {
                        Title: {
                            Text: undefined,
                            Button: undefined,
                            Pin: undefined
                        },
                        Button: undefined,
                        Element: undefined
                    }
                },
                Dock: {
                    Element: undefined
                }
            },
            Left: {
                Side: {
                    Button: undefined,
                    Sub: undefined,
                },
                Content: {
                    Title: {
                        Text: undefined,
                        Button: undefined,
                        Pin: undefined
                    },
                    Button: undefined,
                    Element: undefined
                },
                Dock: {
                    Element: undefined
                }
            },
            Bottom: {
                Side: {
                    Button: undefined,
                    Sub: undefined,
                },
                Content: {
                    Title: {
                        Text: undefined,
                        Button: undefined,
                        Pin: undefined
                    },
                    Button: undefined,
                    Element: undefined
                },
                Dock: {
                    Element: undefined
                }
            }
        };

        this.ItemsMap = new Map(); // 데이터 관리 key: uuid, value: element object
        this.TabPanelMap = new Map(); // Panel 데이터 관리 key: id, value : panel element
        this.ItemsPanelMap = new Map(); // Panel 데이터 관리 key: id, value: element object

        let dragged = undefined;    // 드래그 하고 있는 아이템 저장
        let left_tab_button_map = new Map(); // key: tab btn에 들어가는 모든 element, value: item?
        let left_tab_element_map = new Map(); // tab선택 시 체크 표시, content element 변경  key: button_sub, value: content

        let right_tab_button_map_top = new Map(); // key: tab btn에 들어가는 모든 element, value: item?
        let right_tab_button_map_bottom = new Map(); // key: tab btn에 들어가는 모든 element, value: item?
        let right_tab_element_map_top = new Map(); // tab선택 시 체크 표시, content element 변경  key: button_sub, value: content
        let right_tab_element_map_bottom = new Map(); // tab선택 시 체크 표시, content element 변경  key: button_sub, value: content

        let bottom_tab_button_map = new Map(); // key: tab btn에 들어가는 모든 element, value: item?
        let bottom_tab_element_map = new Map(); // tab선택 시 체크 표시, content element 변경  key: button_sub, value: content

        let leftItem = undefined;
        let rightItem = undefined;
        let bottomItem = undefined;

        // Tab 생성
        function initTab() {
            initRightTab();
            initLeftTab();

            initBottomTab();

            buttonEvent();
            dockPanelEvent();
        }

        function initLeftTab() {
            // left tab
            let left_tab_button_div = document.createElement('div');
            left_tab_button_div.className = "VIZWeb SH_tab_side_button_div SH_tab_side_button_div_left";
            UI.Element.LeftView.Tab.appendChild(left_tab_button_div);

            scope.Tab.Left.Side.Button = left_tab_button_div;

            let left_tab_button_sub_div = document.createElement('div');
            left_tab_button_sub_div.className = "VIZWeb SH_tab_side_sub_button_div SH_tab_side_sub_button_div_left";
            UI.Element.LeftView.Tab.appendChild(left_tab_button_sub_div);

            scope.Tab.Left.Side.Sub = left_tab_button_sub_div;

            // title
            let left_content_title = document.createElement('div');
            left_content_title.className = "VIZWeb SH_tab_title_div SH_defult_color";
            UI.Element.LeftView.Content.appendChild(left_content_title);

            scope.Tab.Left.Content.Title = left_content_title;

            // title - text
            let left_content_title_text = document.createElement('div');
            left_content_title_text.className = "VIZWeb SH_tab_title_text";
            left_content_title_text.innerText = "TITLE";
            left_content_title.appendChild(left_content_title_text);

            scope.Tab.Left.Content.Title.Text = left_content_title_text;

            // title - X button
            let left_content_title_button = document.createElement('div');
            left_content_title_button.className = "VIZWeb SH_tab_title_button SH_title_button SH_x_icon";
            left_content_title.appendChild(left_content_title_button);

            scope.Tab.Left.Content.Title.Button = left_content_title_button;

            left_content_title_button.addEventListener('click', function () {
                UI.Element.LeftView.style.width = "37px";
                UI.Element.LeftView.Content.style.display = "none";
                let buttonImg = UI.Element.LeftView.Button.querySelector('img');
                if (UI.Type === 2 || UI.Type === 3) {
                    UI.Element.LeftView.Resize.style.left = "37px";
                    buttonImg.style.transform = "rotate( -90deg )";
                } else {
                    UI.Element.LeftView.Button.style.display = "block";
                    UI.Element.LeftView.Button.classList.remove("SH_tab_resize_button_left");
                    UI.Element.LeftView.Button.classList.add("SH_tab_resize_button_left_in");
                    buttonImg.style.transform = "rotate( 90deg )";
                }
            });

            //title - pin
            let left_content_title_pin = document.createElement('div');
            // left_content_title_pin.className = "VIZWeb SH_tab_title_pin SH_pin_icon_white";
            left_content_title_pin.className = "VIZWeb SH_tab_title_button SH_title_button SH_pin_icon_white";
            left_content_title.appendChild(left_content_title_pin);

            scope.Tab.Left.Content.Title.Pin = left_content_title_pin;

            left_content_title_pin.addEventListener('click', function (e) {
                // Pin 상태 변경
                scope.ItemsMap.forEach(value => {
                    if (value.title === scope.Tab.Left.Content.Title.Text.getAttribute('data-language-dock')) {
                        value.fix = !value.fix;
                    }
                });

                resetTab();
            });

            // content
            let left_content_div = document.createElement('div');
            left_content_div.className = "VIZWeb SH_tab_content_div";
            UI.Element.LeftView.Content.appendChild(left_content_div);

            scope.Tab.Left.Content.Element = left_content_div;
        }

        function initRightTab() {
            let right_tab_button_div_top = document.createElement('div');
            right_tab_button_div_top.className = "VIZWeb SH_tab_side_button_div SH_tab_side_button_div_right";
            UI.Element.RightView.Top.Tab.appendChild(right_tab_button_div_top);

            scope.Tab.Right.Top.Side.Button = right_tab_button_div_top;

            let right_tab_button_sub_div_top = document.createElement('div');
            right_tab_button_sub_div_top.className = "VIZWeb SH_tab_side_sub_button_div SH_tab_side_sub_button_div_right";
            UI.Element.RightView.Top.Tab.appendChild(right_tab_button_sub_div_top);

            scope.Tab.Right.Top.Side.Sub = right_tab_button_sub_div_top;

            // title
            let right_content_title_top = document.createElement('div');
            right_content_title_top.className = "VIZWeb SH_tab_title_div SH_defult_color";
            UI.Element.RightView.Top.Content.appendChild(right_content_title_top);

            scope.Tab.Right.Top.Content.Title = right_content_title_top;

            //title - text
            let right_content_title_text_top = document.createElement('div');
            right_content_title_text_top.className = "VIZWeb SH_tab_title_text";
            right_content_title_top.appendChild(right_content_title_text_top);

            scope.Tab.Right.Top.Content.Title.Text = right_content_title_text_top;

            //title - X button
            let right_content_title_button_top = document.createElement('div');
            right_content_title_button_top.className = "VIZWeb SH_tab_title_button SH_title_button SH_x_icon";
            right_content_title_top.appendChild(right_content_title_button_top);

            scope.Tab.Right.Top.Content.Title.Button = right_content_title_button_top;

            right_content_title_button_top.addEventListener('click', function () {
                UI.Element.RightView.style.width = "37px";
                UI.Element.RightView.Top.Content.style.display = "none";
                let buttonImg = UI.Element.RightView.Button.querySelector('img');
                if (UI.Type === 2 || UI.Type === 3) {
                    UI.Element.RightView.ResizeHor.style.right = "37px";
                    buttonImg.style.transform = "rotate( 90deg )";
                } else {
                    UI.Element.RightView.Button.style.display = "block";
                    UI.Element.RightView.Button.classList.remove("SH_tab_resize_button_right");
                    UI.Element.RightView.Button.classList.add("SH_tab_resize_button_right_in");
                    buttonImg.style.transform = "rotate( -90deg )";
                }
            });


            //title - pin
            let right_content_title_pin_top = document.createElement('div');
            // right_content_title_pin_top.className = "VIZWeb SH_tab_title_pin SH_pin_icon_white";
            right_content_title_pin_top.className = "VIZWeb SH_tab_title_button SH_title_button SH_pin_icon_white";
            right_content_title_top.appendChild(right_content_title_pin_top);

            scope.Tab.Right.Top.Content.Title.Pin = right_content_title_pin_top;

            right_content_title_pin_top.addEventListener('click', function (e) {
                // Pin 상태 변경
                scope.ItemsMap.forEach(value => {
                    if (value.title === scope.Tab.Right.Top.Content.Title.Text.getAttribute('data-language-dock')) {
                        value.fix = !value.fix;
                    }
                });

                resetTab();
            });

            // content
            let right_content_div_top = document.createElement('div');
            right_content_div_top.className = "VIZWeb SH_tab_content_div";
            UI.Element.RightView.Top.Content.appendChild(right_content_div_top);

            scope.Tab.Right.Top.Content.Element = right_content_div_top;

            // --------------------------------------------------------------------------------------- Bottom
            let right_tab_button_div_bottom = document.createElement('div');
            right_tab_button_div_bottom.className = "VIZWeb SH_tab_side_button_div SH_tab_side_button_div_right";
            UI.Element.RightView.Bottom.Tab.appendChild(right_tab_button_div_bottom);

            scope.Tab.Right.Bottom.Side.Button = right_tab_button_div_bottom;

            let right_tab_button_sub_div_bottom = document.createElement('div');
            right_tab_button_sub_div_bottom.className = "VIZWeb SH_tab_side_sub_button_div SH_tab_side_sub_button_div_right";
            UI.Element.RightView.Bottom.Tab.appendChild(right_tab_button_sub_div_bottom);

            scope.Tab.Right.Bottom.Side.Sub = right_tab_button_sub_div_bottom;

            // title
            let right_content_title_bottom = document.createElement('div');
            right_content_title_bottom.className = "VIZWeb SH_tab_title_div SH_defult_color";
            UI.Element.RightView.Bottom.Content.appendChild(right_content_title_bottom);

            scope.Tab.Right.Bottom.Content.Title = right_content_title_bottom;

            //title - text
            let right_content_title_text_Bottom = document.createElement('div');
            right_content_title_text_Bottom.className = "VIZWeb SH_tab_title_text";
            right_content_title_bottom.appendChild(right_content_title_text_Bottom);

            scope.Tab.Right.Bottom.Content.Title.Text = right_content_title_text_Bottom;

            //title - X button
            let right_content_title_button_bottom = document.createElement('div');
            right_content_title_button_bottom.className = "VIZWeb SH_tab_title_button SH_title_button SH_x_icon";
            right_content_title_bottom.appendChild(right_content_title_button_bottom);

            scope.Tab.Right.Bottom.Content.Title.Button = right_content_title_button_bottom;

            right_content_title_button_bottom.addEventListener('click', function () {
                UI.Element.RightView.style.width = "37px";
                UI.Element.RightView.Bottom.Content.style.display = "none";
                let buttonImg = UI.Element.RightView.Button.querySelector('img');
                if (UI.Type === 2 || UI.Type === 3) {
                    UI.Element.RightView.ResizeHor.style.right = "37px";
                    buttonImg.style.transform = "rotate( 90deg )";
                } else {
                    UI.Element.RightView.Button.style.display = "block";
                    UI.Element.RightView.Button.classList.remove("SH_tab_resize_button_right");
                    UI.Element.RightView.Button.classList.add("SH_tab_resize_button_right_in");
                    buttonImg.style.transform = "rotate( -90deg )";
                }
            });

            //title - pin
            let right_content_title_pin_bottom = document.createElement('div');
            right_content_title_pin_bottom.className = "VIZWeb SH_tab_title_button SH_title_button SH_pin_icon_white";
            right_content_title_bottom.appendChild(right_content_title_pin_bottom);

            scope.Tab.Right.Bottom.Content.Title.Pin = right_content_title_pin_bottom;

            right_content_title_pin_bottom.addEventListener('click', function (e) {
                let element;
                scope.ItemsMap.forEach(value => {
                    if (value.title === scope.Tab.Right.Bottom.Content.Title.Text.getAttribute('data-language-dock')) {
                        value.fix = !value.fix;

                        element = value;
                    }
                });

                resetTab();

                if (element) {
                    clickRightBottomButton(element);
                }
            });

            // content
            let right_content_div_bottom = document.createElement('div');
            right_content_div_bottom.className = "VIZWeb SH_tab_content_div";
            UI.Element.RightView.Bottom.Content.appendChild(right_content_div_bottom);

            scope.Tab.Right.Bottom.Content.Element = right_content_div_bottom;
        }

        function initBottomTab() {
            UI.Element.BottomView.style.display = "none";

            // bottom tab
            let bottom_tab_button_div = document.createElement('div');
            bottom_tab_button_div.className = "VIZWeb SH_tab_side_button_div SH_tab_side_button_div_bottom";
            UI.Element.BottomView.Tab.appendChild(bottom_tab_button_div);

            scope.Tab.Bottom.Side.Button = bottom_tab_button_div;

            let bottom_tab_button_sub_div = document.createElement('div');
            bottom_tab_button_sub_div.className = "VIZWeb SH_tab_side_sub_button_div SH_tab_side_sub_button_div_bottom";
            UI.Element.BottomView.Tab.appendChild(bottom_tab_button_sub_div);

            scope.Tab.Bottom.Side.Sub = bottom_tab_button_sub_div;

            // title
            let bottom_content_title = document.createElement('div');
            bottom_content_title.className = "VIZWeb SH_tab_title_div SH_defult_color";
            UI.Element.BottomView.Content.appendChild(bottom_content_title);

            scope.Tab.Bottom.Content.Title = bottom_content_title;

            // title - text
            let bottom_content_title_text = document.createElement('div');
            bottom_content_title_text.className = "VIZWeb SH_tab_title_text";
            bottom_content_title_text.innerText = "TITLE";
            bottom_content_title.appendChild(bottom_content_title_text);

            scope.Tab.Bottom.Content.Title.Text = bottom_content_title_text;

            // title - X button
            let bottom_content_title_button = document.createElement('div');
            bottom_content_title_button.className = "VIZWeb SH_tab_title_button SH_title_button SH_x_icon";
            bottom_content_title.appendChild(bottom_content_title_button);

            scope.Tab.Bottom.Content.Title.Button = bottom_content_title_button;

            bottom_content_title_button.addEventListener('click', function () {
                UI.Element.BottomView.style.height = "37px";
                UI.Element.BottomView.Content.style.display = "none";
                let buttonImg = UI.Element.BottomView.Button.querySelector('img');
                if (UI.Type === 2 || UI.Type === 3) {
                    UI.Element.BottomView.Resize.style.bottom = "37px";
                    buttonImg.style.transform = "rotate( 0deg )";
                } else {
                    UI.Element.BottomView.Button.style.display = "block";
                    UI.Element.BottomView.Button.classList.remove("SH_tab_resize_button_bottom");
                    UI.Element.BottomView.Button.classList.add("SH_tab_resize_button_bottom_in");
                    buttonImg.style.transform = "rotate( 180deg )";
                }
            });

            //title - pin
            let bottom_content_title_pin = document.createElement('div');
            bottom_content_title_pin.className = "VIZWeb SH_tab_title_button SH_title_button SH_pin_icon_white";
            bottom_content_title.appendChild(bottom_content_title_pin);

            scope.Tab.Bottom.Content.Title.Pin = bottom_content_title_pin;

            bottom_content_title_pin.addEventListener('click', function (e) {
                // Pin 상태 변경
                scope.ItemsMap.forEach(value => {
                    if (value.title === scope.Tab.Bottom.Content.Title.Text.getAttribute('data-language-dock')) {
                        value.fix = !value.fix;
                    }
                });

                resetTab();
            });

            // content
            let bottom_content_div = document.createElement('div');
            bottom_content_div.className = "VIZWeb SH_tab_content_div";
            UI.Element.BottomView.Content.appendChild(bottom_content_div);

            scope.Tab.Bottom.Content.Element = bottom_content_div;
        }

        // Tab 아이템 생성
        function createTab(tabs) {
            // fix true 먼저 생성
            tabs = tabs.filter((x) => x.fix === true).concat(tabs.filter((x) => x.fix !== true));

            let left_btn_array = [];
            let right_btn_array_top = [];
            let right_btn_array_bottom = [];

            let bottom_btn_array = [];

            // 초기화
            scope.ItemsMap.clear();
            left_tab_button_map.clear();
            left_tab_element_map.clear();

            bottom_tab_button_map.clear();
            bottom_tab_element_map.clear();

            right_tab_element_map_top.clear();
            right_tab_element_map_bottom.clear();

            for (let index = 0; index < tabs.length; index++) {
                const element = tabs[index];

                element.order = index;

                scope.ItemsMap.set(element.uuid, element);

                let tab_button = document.createElement('div');
                tab_button.draggable = true;
                tab_button.className = "VIZWeb SH_tab_side_button";
                tab_button.id = element.id;

                let tab_button_sub = document.createElement('div');
                tab_button_sub.id = element.id + "_sub";
                tab_button_sub.className = "VIZWeb SH_tab_side_sub_button SH_tab_uncheck";

                if (element.icon) {
                    if (UI.UseCSSIcon(element.icon) === true) {
                        tab_button.classList.add(element.icon);
                    } else {
                        tab_button.innerHTML = "<img src='" + element.icon + "' style= 'width: 20px;'/>";
                    }
                }

                switch (element.position) {
                    case 0:
                        // Left Top
                        scope.Tab.Left.Side.Button.appendChild(tab_button);

                        scope.Tab.Left.Side.Sub.appendChild(tab_button_sub);

                        // tooltip
                        let tab_button_tooltip = document.createElement('div');
                        tab_button_tooltip.id = element.id + "_tooltip";
                        tab_button_tooltip.className = "VIZWeb SH_tab_button_tooltip SH_tab_button_tooltip_left SH_font";

                        if (element.tooltip) {
                            tab_button_tooltip.innerText = element.tooltip;
                            tab_button_tooltip.setAttribute("data-language-dock", element.tooltip);
                        } else {
                            tab_button_tooltip.innerText = element.title;
                            tab_button_tooltip.setAttribute("data-language-dock", element.title);
                        }

                        tab_button.appendChild(tab_button_tooltip);

                        // fix
                        if (element.fix) {
                            let tab_button_fix = document.createElement('div');
                            tab_button_fix.className = "VIZWeb SH_tab_button_fix";

                            tab_button.appendChild(tab_button_fix);
                        }

                        left_tab_button_map.set(tab_button, element);

                        for (let index = 0; index < tab_button.childNodes.length; index++) {
                            const child = tab_button.childNodes[index];
                            left_tab_button_map.set(child, element);
                        }

                        if (element.content) {
                            scope.Tab.Left.Content.Element.appendChild(element.content);
                            // element.content.style.display = "none";
                        }

                        left_tab_element_map.set(tab_button_sub, element.content);

                        left_btn_array.push(tab_button);

                        UI.Element.LeftView.style.display = "block";
                        if (UI.Type === 2 || UI.Type === 3) {
                            UI.Element.LeftView.Resize.style.display = "block";
                        }
                        break;
                    case 1:
                        // Left Bottom
                        break;
                    case 2:
                        // Right Top
                        scope.Tab.Right.Top.Side.Button.appendChild(tab_button);
                        scope.Tab.Right.Top.Side.Sub.appendChild(tab_button_sub);

                        // tooltip
                        let tab_button_tooltip_right_top = document.createElement('div');
                        tab_button_tooltip_right_top.id = element.id + "_tooltip";
                        tab_button_tooltip_right_top.className = "VIZWeb SH_tab_button_tooltip SH_tab_button_tooltip_right SH_font";
                        if (element.tooltip) {
                            tab_button_tooltip_right_top.innerText = element.tooltip;
                            tab_button_tooltip_right_top.setAttribute("data-language-dock", element.tooltip);
                        } else {
                            tab_button_tooltip_right_top.innerText = element.title;
                            tab_button_tooltip_right_top.setAttribute("data-language-dock", element.title);
                        }

                        tab_button.appendChild(tab_button_tooltip_right_top);

                        // fix
                        if (element.fix) {
                            let tab_button_fix = document.createElement('div');
                            tab_button_fix.className = "VIZWeb SH_tab_button_fix";

                            tab_button.appendChild(tab_button_fix);
                        }

                        right_tab_button_map_top.set(tab_button, element);

                        for (let index = 0; index < tab_button.childNodes.length; index++) {
                            const child = tab_button.childNodes[index];
                            right_tab_button_map_top.set(child, element);
                        }

                        if (element.content) {
                            scope.Tab.Right.Top.Content.Element.appendChild(element.content);
                        }

                        right_tab_element_map_top.set(tab_button_sub, element.content);

                        right_btn_array_top.push(tab_button);

                        UI.Element.RightView.style.display = "block";
                        if (UI.Type === 2 || UI.Type === 3) {
                            UI.Element.RightView.ResizeHor.style.display = "block";
                        }
                        break;
                    case 3:
                        // Right Bottom
                        scope.Tab.Right.Bottom.Side.Button.appendChild(tab_button);
                        scope.Tab.Right.Bottom.Side.Sub.appendChild(tab_button_sub);

                        // tooltip
                        let tab_button_tooltip_right_bottom = document.createElement('div');
                        tab_button_tooltip_right_bottom.id = element.id + "_tooltip";
                        tab_button_tooltip_right_bottom.className = "VIZWeb SH_tab_button_tooltip SH_tab_button_tooltip_right SH_font";
                        if (element.tooltip) {
                            tab_button_tooltip_right_bottom.innerText = element.tooltip;
                            tab_button_tooltip_right_bottom.setAttribute("data-language-dock", element.tooltip);
                        } else {
                            tab_button_tooltip_right_bottom.innerText = element.title;
                            tab_button_tooltip_right_bottom.setAttribute("data-language-dock", element.title);
                        }

                        tab_button.appendChild(tab_button_tooltip_right_bottom);

                        // fix
                        if (element.fix) {
                            let tab_button_fix = document.createElement('div');
                            tab_button_fix.className = "VIZWeb SH_tab_button_fix";

                            tab_button.appendChild(tab_button_fix);
                        }

                        right_tab_button_map_bottom.set(tab_button, element);

                        for (let index = 0; index < tab_button.childNodes.length; index++) {
                            const child = tab_button.childNodes[index];
                            right_tab_button_map_bottom.set(child, element);
                        }

                        if (element.content) {
                            scope.Tab.Right.Bottom.Content.Element.appendChild(element.content);
                            // element.content.style.display = "none";
                        }

                        right_tab_element_map_bottom.set(tab_button_sub, element.content);

                        right_btn_array_bottom.push(tab_button);

                        UI.Element.RightView.style.display = "block";
                        if (UI.Type === 2 || UI.Type === 3) {
                            UI.Element.RightView.ResizeHor.style.display = "block";
                        }
                        break;
                    case 4:
                        tab_button.style.float = "left";
                        tab_button_sub.className = "VIZWeb SH_tab_side_bottom_sub_button SH_tab_uncheck";
                        // Left Top
                        scope.Tab.Bottom.Side.Button.appendChild(tab_button);

                        scope.Tab.Bottom.Side.Sub.appendChild(tab_button_sub);

                        // tooltip
                        let tab_button_tooltip_bottom = document.createElement('div');
                        tab_button_tooltip_bottom.id = element.id + "_tooltip";
                        tab_button_tooltip_bottom.className = "VIZWeb SH_tab_button_tooltip SH_tab_button_tooltip_bottom SH_font";

                        if (element.tooltip) {
                            tab_button_tooltip_bottom.innerText = element.tooltip;
                            tab_button_tooltip_bottom.setAttribute("data-language-dock", element.tooltip);
                        } else {
                            tab_button_tooltip_bottom.innerText = element.title;
                            tab_button_tooltip_bottom.setAttribute("data-language-dock", element.title);
                        }

                        tab_button.appendChild(tab_button_tooltip_bottom);

                        // fix
                        if (element.fix) {
                            let tab_button_fix = document.createElement('div');
                            tab_button_fix.className = "VIZWeb SH_tab_button_fix";

                            tab_button.appendChild(tab_button_fix);
                        }

                        bottom_tab_button_map.set(tab_button, element);

                        for (let index = 0; index < tab_button.childNodes.length; index++) {
                            const child = tab_button.childNodes[index];
                            bottom_tab_button_map.set(child, element);
                        }

                        if (element.content) {
                            scope.Tab.Bottom.Content.Element.appendChild(element.content);
                        }

                        bottom_tab_element_map.set(tab_button_sub, element.content);

                        bottom_btn_array.push(tab_button);

                        UI.Element.BottomView.style.display = "block";
                        if (UI.Type === 2 || UI.Type === 3) {
                            UI.Element.BottomView.Resize.style.display = "block";
                        }
                        break;
                    default:
                        break
                }

                tab_button.addEventListener('dragstart', function (e) {
                    if (element.fix) {
                        e.preventDefault();
                    } else {
                        tab_button.classList.add("SH_dragging");
                        dragged = tab_button.id;

                        scope.Tab.Left.Dock.style.display = "block";
                        scope.Tab.Right.Dock.style.display = "block";
                        scope.Tab.Bottom.Dock.style.display = "block";
                    }
                });

                tab_button.addEventListener('dragend', function (e) {
                    if (element.fix) {
                        e.preventDefault();
                    } else {
                        tab_button.classList.remove("SH_dragging");
                        dragged = undefined;

                        scope.Tab.Left.Dock.style.display = "none";
                        scope.Tab.Right.Dock.style.display = "none";
                        scope.Tab.Bottom.Dock.style.display = "none";
                    }
                });
            }

            vizcore.Main.Tree.Resize();
            vizcore.Main.PropertyTree.Resize();
            vizcore.Main.MiniView.Resize();

            // RightView
            // Top 만 있을 경우
            if (right_btn_array_top.length > 0 && right_btn_array_bottom.length === 0) {
                UI.Element.RightView.Bottom.style.display = "none";
                UI.Element.RightView.Top.style.height = "100%";
                if (UI.Type === 2 || UI.Type === 3) {
                    UI.Element.RightView.ResizeVer.style.display = "none";
                }
            } else if (right_btn_array_bottom.length > 0 && right_btn_array_top.length === 0) { // Bottom만 있을 경우
                UI.Element.RightView.Top.style.display = "none";
                UI.Element.RightView.Bottom.style.top = "0px";
                UI.Element.RightView.Bottom.style.height = "100%";
                if (UI.Type === 2 || UI.Type === 3) {
                    UI.Element.RightView.ResizeVer.style.display = "none";
                }
            } else { // 둘 다 있을 경우
                UI.Element.RightView.Top.style.display = "block";
                UI.Element.RightView.Top.style.height = "50%";

                UI.Element.RightView.Bottom.style.display = "block";
                UI.Element.RightView.Bottom.style.top = "50%";
                UI.Element.RightView.Bottom.style.height = "50%";

                if (UI.Type === 2 || UI.Type === 3) {
                    UI.Element.RightView.ResizeVer.style.display = "block";
                }
            }

        }

        // Side 버튼 클릭 이벤트
        function buttonEvent() {
            leftButtonEvent();

            rightButtonEvent();

            bottomButtonEvent();
        }

        function leftButtonEvent() {
            scope.Tab.Left.Side.Button.addEventListener('click', function (e) {
                let click_item = left_tab_button_map.get(e.target);
                if (click_item) {
                    
                    let sub_btn = document.getElementById(click_item.id + "_sub");
                    if (UI.Element.LeftView.Content.style.display === "block" && sub_btn.classList.contains("SH_tab_check")) {
                        scope.SetActiveTab(click_item.id, false);
                    } else {
                        scope.SetActiveTab(click_item.id, true);
                    }

                    leftItem = click_item;
                    clickLeftTabButton(click_item);
                }
            });

            scope.Tab.Left.Side.Button.addEventListener('mouseover', function (e) {
                let click_item = left_tab_button_map.get(e.target);
                if (click_item) {
                    let tooltip = document.getElementById(click_item.id + '_tooltip');
                    tooltip.style.display = "block";

                    setTimeout(() => {
                        tooltip.style.display = "none";
                    }, 500);
                }
            });
        }

        function rightButtonEvent() {
            scope.Tab.Right.Top.Side.Button.addEventListener('click', function (e) {
                let click_item = right_tab_button_map_top.get(e.target);
                if (click_item) {
                    let sub_btn = document.getElementById(click_item.id + "_sub");
                    if (UI.Element.RightView.Top.Content.style.display === "block" && sub_btn.classList.contains("SH_tab_check")) {
                        scope.SetActiveTab(click_item.id, false);
                    } else {
                        scope.SetActiveTab(click_item.id, true);
                    }

                    rightItem = click_item;
                    clickRightTopButton(click_item);
                }
            });

            scope.Tab.Right.Top.Side.Button.addEventListener('mouseover', function (e) {
                let click_item = right_tab_button_map_top.get(e.target);
                if (click_item) {
                    let tooltip = document.getElementById(click_item.id + '_tooltip');
                    tooltip.style.display = "block";

                    setTimeout(() => {
                        tooltip.style.display = "none";
                    }, 500);
                }
            });


            // scope.Tab.Right.Top.Side.Button.addEventListener('mouseout', function (e) {
            //     let click_item = right_tab_button_map_top.get(e.target);
            //     if (click_item) {
            //         let tooltip = document.getElementById(click_item.id + '_tooltip');
            //         tooltip.style.display = "none";
            //     }
            // });

            // Bottom?
            scope.Tab.Right.Bottom.Side.Button.addEventListener('click', function (e) {
                let click_item = right_tab_button_map_bottom.get(e.target);
                if (click_item) {
                    let sub_btn = document.getElementById(click_item.id + "_sub");
                    if (UI.Type === 0 || UI.Type === 1) {
                        let buttonImg = UI.Element.RightView.Button.querySelector('img');
                        if (UI.Element.RightView.Bottom.Content.style.display === "block" && sub_btn.classList.contains("SH_tab_check")) {
                            UI.Element.RightView.style.width = "37px";
                            UI.Element.RightView.Top.Content.style.display = "none";
                            UI.Element.RightView.Bottom.Content.style.display = "none";
                            UI.Element.RightView.Button.style.display = "block";
                            UI.Element.RightView.Button.classList.remove("SH_tab_resize_button_right");
                            UI.Element.RightView.Button.classList.add("SH_tab_resize_button_right_in");
                            buttonImg.style.transform = "rotate( -90deg )";
                        } else {
                            UI.Element.RightView.style.width = "350px";
                            UI.Element.RightView.Top.Content.style.display = "block";
                            UI.Element.RightView.Bottom.Content.style.display = "block";
                            UI.Element.RightView.Button.style.display = "none";
                            buttonImg.style.transform = "rotate( 90deg )";
                        }
                    }

                    clickRightBottomButton(click_item);
                }
            });

            scope.Tab.Right.Bottom.Side.Button.addEventListener('mouseover', function (e) {
                let click_item = right_tab_button_map_bottom.get(e.target);
                if (click_item) {
                    let tooltip = document.getElementById(click_item.id + '_tooltip');
                    tooltip.style.display = "block";

                    setTimeout(() => {
                        tooltip.style.display = "none";
                    }, 500);
                }
            });


            // scope.Tab.Right.Bottom.Side.Button.addEventListener('mouseout', function (e) {
            //     let click_item = right_tab_button_map_bottom.get(e.target);
            //     if (click_item) {
            //         let tooltip = document.getElementById(click_item.id + '_tooltip');
            //         tooltip.style.display = "none";
            //     }
            // });
        }

        function bottomButtonEvent() {
            scope.Tab.Bottom.Side.Button.addEventListener('click', function (e) {
                let click_item = bottom_tab_button_map.get(e.target);
                if (click_item) {
                    let sub_btn = document.getElementById(click_item.id + "_sub");
                    if (UI.Element.BottomView.Content.style.display === "block" && sub_btn.classList.contains("SH_tab_check")) {
                        scope.SetActiveTab(click_item.id, false);
                    } else {
                        scope.SetActiveTab(click_item.id, true);
                    }

                    bottomItem = click_item;
                    clickBottomTabButton(click_item);
                }
            });

            scope.Tab.Bottom.Side.Button.addEventListener('mouseover', function (e) {
                let click_item = bottom_tab_button_map.get(e.target);
                if (click_item) {
                    let tooltip = document.getElementById(click_item.id + '_tooltip');
                    tooltip.style.display = "block";

                    setTimeout(() => {
                        tooltip.style.display = "none";
                    }, 500);
                }
            });
        }

        // 왼쪽 패널 버튼 선택 시
        function clickLeftTabButton(click_item) {
            let sub_btn = document.getElementById(click_item.id + "_sub");

            // title text 변경
            if (click_item.title) {
                scope.Tab.Left.Content.Title.Text.innerText = click_item.title;
                scope.Tab.Left.Content.Title.Text.setAttribute("data-language-dock", click_item.title);
                scope.SetLanguage(vizcore.Configuration.Language);
            } else {
                scope.Tab.Left.Content.Title.Text.innerText = "";
            }

            // pin 고정에 따라 ui 변경
            if (click_item.fix) {
                scope.Tab.Left.Content.Title.Pin.style.transform = "rotate(-90deg)";
            } else {
                scope.Tab.Left.Content.Title.Pin.style.transform = "";
            }

            // title content 초기화
            let deleteElemnts = [];
            for (let index = 0; index < scope.Tab.Left.Content.Title.childNodes.length; index++) {
                const element = scope.Tab.Left.Content.Title.childNodes[index];
                if (element !== scope.Tab.Left.Content.Title.Text && element !== scope.Tab.Left.Content.Title.Button && element !== scope.Tab.Left.Content.Title.Pin) {
                    deleteElemnts.push(element);
                }
            }

            ///element 바로 remove시 index가 꼬이는 이슈
            if (deleteElemnts.length > 0) {
                for (let i = 0; i < deleteElemnts.length; i++)
                    deleteElemnts[i].remove();
            }

            // title_content 있는 경우만 추가
            if (click_item.title_content) {
                // 타이틀 버튼이 2개 이상인 경우
                if (click_item.title_content.length > 0) {
                    for (let index = 0; index < click_item.title_content.length; index++) {
                        const element = click_item.title_content[index];
                        if (scope.ItemsPanelMap.size > 0) {
                            scope.ItemsPanelMap.forEach(value => {
                                if (value.title_content !== element) {
                                    scope.Tab.Left.Content.Title.appendChild(element);
                                }
                            });
                        } else {
                            scope.Tab.Left.Content.Title.appendChild(element);
                        }
                    }
                } else {
                    if (scope.ItemsPanelMap.size > 0) {
                        scope.ItemsPanelMap.forEach(value => {
                            if (value.title_content !== click_item.title_content) {
                                scope.Tab.Left.Content.Title.appendChild(click_item.title_content);
                            }
                        });
                    } else {
                        scope.Tab.Left.Content.Title.appendChild(click_item.title_content);
                    }
                }
            }

            // 선택 표시
            left_tab_element_map.forEach((content, button) => {
                if (sub_btn === button) {
                    button.classList.replace("SH_tab_uncheck", "SH_tab_check");
                    if (content) {
                        content.style.display = "block";
                    }
                } else {
                    button.classList.replace("SH_tab_check", "SH_tab_uncheck");
                    if (content) {
                        content.style.display = "none";
                    }
                }
            })

            vizcore.Main.Tree.Resize();
            vizcore.Main.PropertyTree.Resize();
            vizcore.Main.MiniView.Resize();
        }

        // 오른쪽 위 패널 버튼 선택 시
        function clickRightTopButton(click_item) {
            let sub_btn = document.getElementById(click_item.id + "_sub");

            // title text 변경
            if (click_item.title) {
                scope.Tab.Right.Top.Content.Title.Text.innerText = click_item.title;
                scope.Tab.Right.Top.Content.Title.Text.setAttribute("data-language-dock", click_item.title);
                scope.SetLanguage(vizcore.Configuration.Language);
            }

            // pin 고정에 따라 ui 변경
            if (click_item.fix) {
                scope.Tab.Right.Top.Content.Title.Pin.style.transform = "rotate(-90deg)";
            } else {
                scope.Tab.Right.Top.Content.Title.Pin.style.transform = "";
            }

            // title content 초기화
            let deleteElemnts = [];
            for (let index = 0; index < scope.Tab.Right.Top.Content.Title.childNodes.length; index++) {
                const element = scope.Tab.Right.Top.Content.Title.childNodes[index];
                if (element !== scope.Tab.Right.Top.Content.Title.Text && element !== scope.Tab.Right.Top.Content.Title.Button && element !== scope.Tab.Right.Top.Content.Title.Pin) {
                    deleteElemnts.push(element);
                }
            }
            ///element 바로 remove시 index가 꼬이는 이슈
            if (deleteElemnts.length > 0) {
                for (let i = 0; i < deleteElemnts.length; i++)
                    deleteElemnts[i].remove();
            }

            // title_content 있는 경우만 추가
            if (click_item.title_content) {
                if (click_item.title_content.length > 0) {
                    for (let index = 0; index < click_item.title_content.length; index++) {
                        const element = click_item.title_content[index];
                        if (scope.ItemsPanelMap.size > 0) {
                            scope.ItemsPanelMap.forEach(value => {
                                if (value.title_content !== element) {
                                    scope.Tab.Right.Top.Content.Title.appendChild(element);
                                }
                            });
                        } else {
                            scope.Tab.Right.Top.Content.Title.appendChild(element);
                        }
                    }
                } else {
                    if (scope.ItemsPanelMap.size > 0) {
                        scope.ItemsPanelMap.forEach(value => {
                            if (value.title_content !== click_item.title_content) {
                                scope.Tab.Right.Top.Content.Title.appendChild(click_item.title_content);
                            }
                        });
                    } else {
                        scope.Tab.Right.Top.Content.Title.appendChild(click_item.title_content);
                    }
                }
            }

            // 선택 표시
            right_tab_element_map_top.forEach((content, button) => {
                if (sub_btn === button) {
                    button.classList.replace("SH_tab_uncheck", "SH_tab_check");
                    if (content) {
                        content.style.display = "block";
                    }
                } else {
                    button.classList.replace("SH_tab_check", "SH_tab_uncheck");
                    if (content) {
                        content.style.display = "none";
                    }
                }
            })

            vizcore.Main.Tree.Resize();
            vizcore.Main.PropertyTree.Resize();
            vizcore.Main.MiniView.Resize();
        }

        // 오른쪽 아래 패널 버튼 선택 시
        function clickRightBottomButton(click_item) {
            let sub_btn = document.getElementById(click_item.id + "_sub");

            // title text 변경
            if (click_item.title) {
                scope.Tab.Right.Bottom.Content.Title.Text.innerText = click_item.title;
                scope.Tab.Right.Bottom.Content.Title.Text.setAttribute("data-language-dock", click_item.title);
                scope.SetLanguage(vizcore.Configuration.Language);
            }

            // pin 고정에 따라 ui 변경
            if (click_item.fix) {
                scope.Tab.Right.Bottom.Content.Title.Pin.style.transform = "rotate(-90deg)";
            } else {
                scope.Tab.Right.Bottom.Content.Title.Pin.style.transform = "";
            }

            // title content 초기화
            let deleteElemnts = [];
            for (let index = 0; index < scope.Tab.Right.Bottom.Content.Title.childNodes.length; index++) {
                const element = scope.Tab.Right.Bottom.Content.Title.childNodes[index];
                if (element !== scope.Tab.Right.Bottom.Content.Title.Text && element !== scope.Tab.Right.Bottom.Content.Title.Button && element !== scope.Tab.Right.Bottom.Content.Title.Pin) {
                    deleteElemnts.push(element);
                }
            }

            ///element 바로 remove시 index가 꼬이는 이슈
            if (deleteElemnts.length > 0) {
                for (let i = 0; i < deleteElemnts.length; i++)
                    deleteElemnts[i].remove();
            }

            // title_content 있는 경우만 추가
            if (click_item.title_content) {
                if (click_item.title_content.length > 0) {
                    for (let index = 0; index < click_item.title_content.length; index++) {
                        const element = click_item.title_content[index];
                        if (scope.ItemsPanelMap.size > 0) {
                            scope.ItemsPanelMap.forEach(value => {
                                if (value.title_content !== element) {
                                    scope.Tab.Right.Bottom.Content.Title.appendChild(element);
                                }
                            });
                        } else {
                            scope.Tab.Right.Bottom.Content.Title.appendChild(element);
                        }
                    }
                } else {
                    if (scope.ItemsPanelMap.size > 0) {
                        scope.ItemsPanelMap.forEach(value => {
                            if (value.title_content !== click_item.title_content) {
                                scope.Tab.Right.Bottom.Content.Title.appendChild(click_item.title_content);
                            }
                        });
                    } else {
                        scope.Tab.Right.Bottom.Content.Title.appendChild(click_item.title_content);
                    }
                }
            }

            // 선택 표시
            right_tab_element_map_bottom.forEach((content, button) => {
                if (sub_btn === button) {
                    button.classList.replace("SH_tab_uncheck", "SH_tab_check");
                    if (content) {
                        content.style.display = "block";
                    }
                } else {
                    button.classList.replace("SH_tab_check", "SH_tab_uncheck");
                    if (content) {
                        content.style.display = "none";
                    }
                }
            })

            vizcore.Main.Tree.Resize();
            vizcore.Main.PropertyTree.Resize();
            vizcore.Main.MiniView.Resize();
        }

        function clickBottomTabButton(click_item) {
            let sub_btn = document.getElementById(click_item.id + "_sub");

            // title text 변경
            if (click_item.title) {
                scope.Tab.Bottom.Content.Title.Text.innerText = click_item.title;
                scope.Tab.Bottom.Content.Title.Text.setAttribute("data-language-dock", click_item.title);
                scope.SetLanguage(vizcore.Configuration.Language);
            } else {
                scope.Tab.Bottom.Content.Title.Text.innerText = "";
            }

            // pin 고정에 따라 ui 변경
            if (click_item.fix) {
                scope.Tab.Bottom.Content.Title.Pin.style.transform = "rotate(-90deg)";
            } else {
                scope.Tab.Bottom.Content.Title.Pin.style.transform = "";
            }

            // title content 초기화
            let deleteElemnts = [];
            for (let index = 0; index < scope.Tab.Bottom.Content.Title.childNodes.length; index++) {
                const element = scope.Tab.Bottom.Content.Title.childNodes[index];
                if (element !== scope.Tab.Bottom.Content.Title.Text && element !== scope.Tab.Bottom.Content.Title.Button && element !== scope.Tab.Bottom.Content.Title.Pin) {
                    deleteElemnts.push(element);
                }
            }

            ///element 바로 remove시 index가 꼬이는 이슈
            if (deleteElemnts.length > 0) {
                for (let i = 0; i < deleteElemnts.length; i++)
                    deleteElemnts[i].remove();
            }


            // title_content 있는 경우만 추가
            if (click_item.title_content) {
                if (click_item.title_content.length > 0) {
                    for (let index = 0; index < click_item.title_content.length; index++) {
                        const element = click_item.title_content[index];
                        if (scope.ItemsPanelMap.size > 0) {
                            scope.ItemsPanelMap.forEach(value => {
                                if (value.title_content !== element) {
                                    scope.Tab.Bottom.Content.Title.appendChild(element);
                                }
                            });
                        } else {
                            scope.Tab.Bottom.Content.Title.appendChild(element);
                        }
                    }
                } else {
                    if (scope.ItemsPanelMap.size > 0) {
                        scope.ItemsPanelMap.forEach(value => {
                            if (value.title_content !== click_item.title_content) {
                                scope.Tab.Bottom.Content.Title.appendChild(click_item.title_content);
                            }
                        });
                    } else {
                        scope.Tab.Bottom.Content.Title.appendChild(click_item.title_content);
                    }
                }
            }

            // 선택 표시
            bottom_tab_element_map.forEach((content, button) => {
                if (sub_btn === button) {
                    button.classList.replace("SH_tab_uncheck", "SH_tab_check");
                    if (content) {
                        content.style.display = "block";
                    }
                } else {
                    button.classList.replace("SH_tab_check", "SH_tab_uncheck");
                    if (content) {
                        content.style.display = "none";
                    }
                }
            })

            vizcore.Main.Tree.Resize();
            vizcore.Main.PropertyTree.Resize();
            vizcore.Main.MiniView.Resize();
        }

        // 단일 Tab 추가
        function addTab(object) {
            object.uuid = vizcore.Main.Util.NewGUID();
            scope.ItemsMap.set(object.uuid, object);

            resetTab();
        }

        // 다중 Tab 추가
        function addTabs(object) {
            for (let index = 0; index < object.length; index++) {
                const element = object[index];
                element.uuid = vizcore.Main.Util.NewGUID();
                scope.ItemsMap.set(element.uuid, element);
            }
            resetTab();
        }

        // Tab 편집
        function editTab(id, object) {
            scope.ItemsMap.forEach((value) => {
                if (value.id === id) {
                    scope.ItemsMap.set(value.uuid, object);
                }
            });

            resetTab();
        }

        // Tab 삭제
        function deleteTab(id) {
            let element = undefined;
            scope.ItemsMap.forEach((value) => {
                if (value.id === id) {
                    scope.ItemsMap.delete(value.uuid);
                    element = value;
                }
            });

            if (scope.ItemsMap.size === 0) {
                UI.Element.LeftView.style.display = "none";
                UI.Element.RightView.style.display = "none";
                UI.Element.BottomView.style.display = "none";

                if (UI.Type === 2 || UI.Type === 3) {
                    UI.Element.LeftView.Resize.style.display = "none";
                    UI.Element.RightView.ResizeHor.style.display = "none";
                    UI.Element.BottomView.Resize.style.display = "none";
                }
            } else {
                let leftTop = [];
                let leftBottom = [];
                let rightTop = [];
                let rightBottom = [];
                let bottom = [];
                scope.ItemsMap.forEach((value) => {
                    switch (value.position) {
                        case 0:
                            leftTop.push(value);
                            break;
                        case 1:
                            leftBottom.push(value);
                            break;
                        case 2:
                            rightTop.push(value);
                            break;
                        case 3:
                            rightBottom.push(value);
                            break;
                        case 4:
                            bottom.push(value);
                            break;
                        default:
                            break;
                    }
                });

                // left
                if (leftTop.length === 0) {
                    UI.Element.LeftView.style.display = "none";
                    if (UI.Type === 2 || UI.Type === 3) {
                        UI.Element.LeftView.Resize.style.display = "none";
                    }
                } else {
                    if (element.position === 0) {
                        leftItem = leftTop[leftTop.length - 1];
                    }
                }

                if (leftBottom.length === 0) {
                    UI.Element.LeftView.style.display = "none";
                    if (UI.Type === 2 || UI.Type === 3) {
                        UI.Element.LeftView.Resize.style.display = "none";
                    }
                }

                // right
                if (rightTop.length === 0) {
                    UI.Element.RightView.Top.style.display = "none";
                    UI.Element.RightView.Bottom.style.top = "0px";
                    UI.Element.RightView.Bottom.style.height = "100%";
                    if (UI.Type === 2 || UI.Type === 3) {
                        UI.Element.RightView.ResizeHor.style.display = "none";
                    }
                } else {
                    if (element.position === 2) {
                        rightItem = rightTop[rightTop.length - 1];
                    }
                }

                if (rightBottom.length === 0) {
                    UI.Element.RightView.Bottom.style.display = "none";
                    UI.Element.RightView.Top.style.height = "100%";
                    if (UI.Type === 2 || UI.Type === 3) {
                        UI.Element.RightView.ResizeHor.style.display = "none";
                    }
                }

                // bottom
                if (bottom.length === 0) {
                    UI.Element.BottomView.style.display = "none";
                    if (UI.Type === 2 || UI.Type === 3) {
                        UI.Element.BottomView.Resize.style.display = "none";
                    }
                } else {
                    if (element.position === 4) {
                        bottomItem = bottom[bottom.length - 1];
                    }
                }
            }

            resetTab();
        }


        // 초기화 후 다시 생성
        function resetTab() {
            let items = [];
            scope.ItemsMap.forEach((value) => {
                items.push(value);
            })

            if (UI.Type === 2 || UI.Type === 3) {
                // 사이즈 확인 후 
                UI.Element.LeftView.Resize.style.display = "none";
                UI.Element.RightView.ResizeHor.style.display = "none";
                UI.Element.BottomView.Resize.style.display = "none";
            }

            scope.Tab.Left.Side.Button.innerHTML = "";
            scope.Tab.Left.Side.Sub.innerHTML = "";
            scope.Tab.Left.Content.Element.innerHTML = "";

            scope.Tab.Right.Top.Side.Button.innerHTML = "";
            scope.Tab.Right.Top.Side.Sub.innerHTML = "";
            scope.Tab.Right.Top.Content.Element.innerHTML = "";

            scope.Tab.Right.Bottom.Side.Button.innerHTML = "";
            scope.Tab.Right.Bottom.Side.Sub.innerHTML = "";
            scope.Tab.Right.Bottom.Content.Element.innerHTML = "";

            scope.Tab.Bottom.Side.Button.innerHTML = "";
            scope.Tab.Bottom.Side.Sub.innerHTML = "";
            scope.Tab.Bottom.Content.Element.innerHTML = "";

            UI.Element.LeftView.style.display = "none";
            UI.Element.RightView.style.display = "none";
            UI.Element.BottomView.style.display = "none";

            createTab(items);

            if (leftItem) {
                clickLeftTabButton(leftItem);
            }

            if (rightItem) {
                clickRightTopButton(rightItem);
            }

            if (bottomItem) {
                clickBottomTabButton(bottomItem);
            }
        }

        // Drag Drop 이벤트 추가
        function dockPanelEvent() {
            let view = document.getElementById(vizcore.Main.GetViewID());

            // -------------------------------------------------------------------------------left tab
            scope.Tab.Left.Side.Button.addEventListener('dragover', function (e) {
                e.preventDefault();
            });

            scope.Tab.Left.Side.Button.addEventListener('drop', function (e) {
                // 이벤트 버블링 방지
                e.stopPropagation();
                let position = 0;
                if (dragged) {
                    dockingPanel(dragged, position);
                }
            });

            // Drop 시 tab panel 생성
            let left_view = document.createElement('div');
            left_view.id = "SH_tab_drop_button_left";
            left_view.className = "VIZWeb SH_tab_drop_button SH_tab_drop_button_left SH_none";
            left_view.innerHTML = "<img style='padding: 10px;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAA3UlEQVRYhWP8//8/w0ACpgG1fcQ7AARYQISrq+uAJITdu3czDo4QgAGQi+hhKXKID64QGIi0MLhC4Kl3HUmapbc2gWlS086gSgODKwqoDbQmHBZgYGCYwMDAUHCtwPYDXR0AtfwAAwODPlQoAZs6mkQBmuUXQSGASy3VHYDFcgdcwU91B5BqOdUdAE1wsDgPIGQ5LRxQAPU5CGyAhgj9HAD1sQPUEaCQOEDIEVRPhKQ6gibZEIsjJtDVAWiOWIivHKBpUQx1BNYSEAZGa0Nw12xEN8tHO6cD6wAGBgYAZI9ThDufb4cAAAAASUVORK5CYII='>"
            view.appendChild(left_view);

            scope.Tab.Left.Dock = left_view;

            // Drop 시 tab panel 이 생성 되는 영역 
            let left_drop_element = document.createElement('div');
            left_drop_element.id = "SH_tab_drop_element_left";
            left_drop_element.className = "VIZWeb SH_tab_drop_element SH_tab_drop_element_left";
            view.appendChild(left_drop_element);

            scope.Tab.Left.Dock.Element = left_drop_element;

            // panel이 영역에 들어왔을 시 영역 element 보이게
            left_view.addEventListener('dragover', function (e) {
                scope.Tab.Left.Dock.Element.style.display = "block";
            });

            // panel이 영역에 떨어 졌을 시 영역 element 보이지 않게
            left_view.addEventListener('drop', function (e) {
                e.stopPropagation();
                let position = 0;
                if (dragged) {
                    dockingPanel(dragged, position);
                }
                scope.Tab.Left.Dock.Element.style.display = "none";
            });

            // panel이 화면에서 떠날 시 영역 element 보이지 않게
            left_view.addEventListener('dragleave', function (e) {
                scope.Tab.Left.Dock.Element.style.display = "none";
            });

            // MovePanel
            let mouseUpLeftPanel = function (e) {
                e.stopPropagation();
                let position = 0;
                if (dragged) {
                    dockingPanel(dragged, position);
                }
                scope.Tab.Left.Dock.Element.style.display = "none";
            }

            left_view.addEventListener('mouseover', function (e) {
                scope.Tab.Left.Dock.Element.style.display = "block";

                left_view.addEventListener('mouseup', mouseUpLeftPanel);
            });

            left_view.addEventListener('mouseout', function (e) {
                scope.Tab.Left.Dock.Element.style.display = "none";

                left_view.removeEventListener('mouseup', mouseUpLeftPanel);
            });

            // -------------------------------------------------------------------------------right tab
            scope.Tab.Right.Top.Side.Button.addEventListener('dragover', function (e) {
                e.preventDefault();
            });

            scope.Tab.Right.Top.Side.Button.addEventListener('drop', function (e) {
                // 이벤트 버블링 방지
                e.stopPropagation();
                let position = 2;
                if (dragged) {
                    dockingPanel(dragged, position);
                }
            });

            scope.Tab.Right.Bottom.Side.Button.addEventListener('dragover', function (e) {
                e.preventDefault();
            });

            scope.Tab.Right.Bottom.Side.Button.addEventListener('drop', function (e) {
                e.preventDefault();
                let position = 3;
                if (dragged) {
                    dockingPanel(dragged, position);
                }
            });

            // Drop 시 tab panel 생성
            let right_view = document.createElement('div');
            right_view.id = "SH_tab_drop_button_right";
            right_view.className = "VIZWeb SH_tab_drop_button SH_tab_drop_button_right SH_none";
            right_view.innerHTML = "<img style='padding: 10px;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAA4ElEQVRYhWP8//8/w0ACpgG1fcQ7AARYQISrq+uAJITdu3czDo4QgAGQi+hhKXKID64QGIi0MLTTACzEnnrXkWSp9NYmOHu0JGTBJaE14bAAAwPDBAYGhoJrBbYfaOUAfCEAsjyegYHhANQxdHdAAQMDw0UGBgZ9WjoCpwOgwe5Aa0fgTYT0cATBXAB1RACUqw9NG/RzANTHG6Dci9C0QR8HQC0/APU5yHIHamdJnA6gh+V4HQCNa5paDgI4S0KkuKZpSYjTAVBLE2hlMQyM1obgrtmIbpaPdk4H1gEMDAwAhzNTc06a3hUAAAAASUVORK5CYII='>";
            view.appendChild(right_view);

            scope.Tab.Right.Dock = right_view;

            // Drop 시 tab panel 이 생성 되는 영역 
            let right_drop_element = document.createElement('div');
            right_drop_element.id = "SH_tab_drop_element_right";
            right_drop_element.className = "VIZWeb SH_tab_drop_element SH_tab_drop_element_right";
            view.appendChild(right_drop_element);

            scope.Tab.Right.Dock.Element = right_drop_element;

            // panel이 영역에 들어왔을 시 영역 element 보이게
            right_view.addEventListener('dragover', function (e) {
                scope.Tab.Right.Dock.Element.style.display = "block";
            });

            // panel이 영역에 떨어 졌을 시 영역 element 보이지 않게
            right_view.addEventListener('drop', function (e) {
                e.stopPropagation();
                let position = 2;
                if (dragged) {
                    dockingPanel(dragged, position);
                }
                scope.Tab.Right.Dock.Element.style.display = "none";
            });

            // panel이 화면에서 떠날 시 영역 element 보이지 않게
            right_view.addEventListener('dragleave', function (e) {
                scope.Tab.Right.Dock.Element.style.display = "none";
            });

            // MovePanel
            let mouseUpRightPanel = function (e) {
                e.stopPropagation();
                let position = 2;
                if (dragged) {
                    dockingPanel(dragged, position);
                }
                scope.Tab.Right.Dock.Element.style.display = "none";
            }

            right_view.addEventListener('mouseover', function (e) {
                scope.Tab.Right.Dock.Element.style.display = "block";

                right_view.addEventListener('mouseup', mouseUpRightPanel);
            });

            right_view.addEventListener('mouseout', function (e) {
                scope.Tab.Right.Dock.Element.style.display = "none";

                right_view.removeEventListener('mouseup', mouseUpRightPanel);
            });

            //-------------------------------------------------------------------------------bottom view
            scope.Tab.Bottom.Side.Button.addEventListener('dragover', function (e) {
                e.preventDefault();
            });

            scope.Tab.Bottom.Side.Button.addEventListener('drop', function (e) {
                // 이벤트 버블링 방지
                e.stopPropagation();
                let position = 4;
                if (dragged) {
                    dockingPanel(dragged, position);
                }
            });

            // Drop 시 tab panel 생성
            let bottom_view = document.createElement('div');
            bottom_view.id = "SH_tab_drop_button_bottom";
            bottom_view.className = "VIZWeb SH_tab_drop_button SH_tab_drop_button_bottom SH_none";
            bottom_view.innerHTML = "<img style='padding: 10px;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAAyUlEQVRYhWP8//8/w0ACFnS7XV1daeqi3bt3MyLzmQbU+9hCAAbQXUopwBWygzcEaJ0WYGA0DZAUAloTDguAMLnyFDkAavABEMZmCSF5ih2ABPTRLUGyXJ9Uw4h2wLUC2w8MDAwODAwMF5EdgWY5SM4Bqpa6DsDlCEosJ9kBOBxBtuVkOQCLI8i2nGwHoDmCbMtBAGdBRIIjKAKjdQHOEHjqXUdVi6S3NmEVH/AQGHXAqANGHTDqAJwlIa6Si9pgwENgYLvnDAwMAFutWcTUxO0wAAAAAElFTkSuQmCC'>"
            view.appendChild(bottom_view);

            scope.Tab.Bottom.Dock = bottom_view;

            // Drop 시 tab panel 이 생성 되는 영역 
            let bottom_drop_element = document.createElement('div');
            bottom_drop_element.id = "SH_tab_drop_element_bottom";
            bottom_drop_element.className = "VIZWeb SH_tab_drop_element SH_tab_drop_element_bottom";
            view.appendChild(bottom_drop_element);

            scope.Tab.Bottom.Dock.Element = bottom_drop_element;

            // panel이 영역에 들어왔을 시 영역 element 보이게
            bottom_view.addEventListener('dragover', function (e) {
                scope.Tab.Bottom.Dock.Element.style.display = "block";
            });

            // panel이 영역에 떨어 졌을 시 영역 element 보이지 않게
            bottom_view.addEventListener('drop', function (e) {
                e.stopPropagation();
                let position = 4;
                if (dragged) {
                    dockingPanel(dragged, position);
                }
                scope.Tab.Bottom.Dock.Element.style.display = "none";
            });

            // panel이 화면에서 떠날 시 영역 element 보이지 않게
            bottom_view.addEventListener('dragleave', function (e) {
                scope.Tab.Bottom.Dock.Element.style.display = "none";
            });

            // MovePanel
            let mouseUpBottomPanel = function (e) {
                e.stopPropagation();
                let position = 4;
                if (dragged) {
                    dockingPanel(dragged, position);
                }
                scope.Tab.Bottom.Dock.Element.style.display = "none";
            }

            bottom_view.addEventListener('mouseover', function (e) {
                scope.Tab.Bottom.Dock.Element.style.display = "block";

                bottom_view.addEventListener('mouseup', mouseUpBottomPanel);
            });

            bottom_view.addEventListener('mouseout', function (e) {
                scope.Tab.Bottom.Dock.Element.style.display = "none";

                bottom_view.removeEventListener('mouseup', mouseUpBottomPanel);
            });

            //-------------------------------------------------------------------------------view tab
            // view 이벤트 추가 등록
            view.addEventListener('dragover', function (e) {
                e.preventDefault();
            });

            view.addEventListener("drop", function (e) {
                e.preventDefault();
                if (dragged) {
                    createPanel(dragged, e);
                }
            });

            let multiView = document.getElementById(vizcore.Main.GetViewID() + "MultiView");
            multiView.addEventListener('dragover', function (e) {
                e.preventDefault();
            });

            multiView.addEventListener("drop", function (e) {
                e.preventDefault();
                if (dragged) {
                    createPanel(dragged, e);
                }
            });
        }

        // View Drop 시 패널 생성
        function createPanel(id, event, type) {
            let element;
            scope.ItemsMap.forEach((value) => {
                if (value.id === id) {
                    element = scope.ItemsMap.get(value.uuid);
                }
            });

            if (element) {
                deleteTab(id);

                // type 1인 경우 main, 2인경우 multi
                let view = document.getElementById(vizcore.Main.GetViewID());
                if (type === 1) {
                    view = document.getElementById(vizcore.Main.GetViewID());
                } else if (type === 2) {
                    view = document.getElementById(vizcore.Main.GetViewID() + "MultiView");
                } else {
                    view = document.getElementById(vizcore.Main.GetViewID());
                }

                // Panel 생성
                let panel = new vizcore.Panel(view);
                panel.SetTitleText(element.title);
                panel.SetContent(element.content);
                panel.SetSize(340, 500);

                // Tree, Model Tree 스크롤 제어
                if (id === "ModelTreeTab" || id === "PropertyTreeTab") {
                    panel.SetElementOverflow(false);
                }

                element.content.style.display = "block";

                // 마우스 위치에 패널 생성
                let viewSize = view.getBoundingClientRect();

                // 마우스 위치 잡는 경우만
                if (event) {
                    panel.SetLocationLeft(event.clientX - viewSize.left);
                    panel.SetLocationTop(event.clientY - viewSize.top);
                }

                let cbClose = function () {
                    UI.SetCheckButton(id, false);
                };

                panel.OnCloseButtonEvent(cbClose);

                let cbResize = function () {
                    vizcore.Main.Tree.Resize();
                    vizcore.Main.PropertyTree.Resize();
                    vizcore.Main.MiniView.Resize();
                };

                panel.OnResizeEvent(cbResize);

                // title content 있는 경우 추가
                if (element.title_content) {
                    panel.SetHeaderContent(element.title_content);
                }

                scope.TabPanelMap.set(id, panel);
                scope.ItemsPanelMap.set(id, element);

                // 모델 트리 투명도 사용시만
                if (id === "ModelTreeTab") {
                    // UpdateBackground
                    if (vizcore.Main.Configuration.Tree.Option.BgTransparency.Use) {
                        panel.SetHeaderContent(vizcore.Main.Tree.Element.PanelHeader);
                    }
                    vizcore.Main.Tree.UpdateBackground();
                }

                // Move Panel
                let panelMouseMove = function (e) {

                    let title_content = panel.Element.Title.childNodes;
                    for (let index = 0; index < title_content.length; index++) {
                        const element = title_content[index];
                        if (element !== panel.Element.Title.Text) {
                            if (element === e.target) {
                                return;
                            } else {
                                for (let index = 0; index < element.childNodes.length; index++) {
                                    const child = element.childNodes[index];
                                    if (child === e.target) {
                                        return;
                                    }
                                }
                            }
                        }
                    }

                    dragged = id;
                    scope.Tab.Left.Dock.style.display = "block";
                    scope.Tab.Right.Dock.style.display = "block";
                    scope.Tab.Bottom.Dock.style.display = "block";
                }

                let panelMouseUp = function () {
                    panel.Element.Title.removeEventListener("mousemove", panelMouseMove);
                    panel.Element.Title.removeEventListener("mouseup", panelMouseUp);

                    scope.Tab.Left.Dock.style.display = "none";
                    scope.Tab.Right.Dock.style.display = "none";
                    scope.Tab.Bottom.Dock.style.display = "none";
                    dragged = undefined;

                }

                let panelMouseDown = function () {
                    panel.Element.Title.addEventListener("mousemove", panelMouseMove);
                    panel.Element.Title.addEventListener("mouseup", panelMouseUp);
                }

                panel.Element.Title.addEventListener("mousedown", panelMouseDown);
            }

            UI.SetLanguage(vizcore.Configuration.Language);
        }

        function dockingPanel(id, position) {
            let element;
            let leftTop = [];
            let leftBottom = [];
            let rightTop = [];
            let rightBottom = [];
            let bottom = [];

            scope.ItemsMap.forEach((value) => {
                if (value.id === id) {
                    element = scope.ItemsMap.get(value.uuid);
                }
            });

            if (element) {
                scope.ItemsMap.delete(element.uuid);
                element.position = position;
                scope.ItemsMap.set(element.uuid, element);

                resetTab();
            } else {
                element = scope.ItemsPanelMap.get(id);
                let panel = scope.TabPanelMap.get(id);
                if (element) {
                    element.position = position;
                    // UI.Ribbon.SetCheckButton(id, true);                        
                    scope.AddTab(element);
                    if (position === 0) {
                        leftItem = element;
                        clickLeftTabButton(leftItem);
                    } else if (position === 2) {
                        rightItem = element;
                        clickRightTopButton(rightItem);
                    } else if (position === 4) {
                        bottomItem = element;
                        clickBottomTabButton(bottomItem);
                    }
                    panel.Delete();
                    scope.TabPanelMap.delete(id);
                    scope.ItemsPanelMap.delete(id);
                }
            }

            scope.ItemsMap.forEach((value) => {
                switch (value.position) {
                    case 0:
                        leftTop.push(value);
                        break;
                    case 1:
                        leftBottom.push(value);
                        break;
                    case 2:
                        rightTop.push(value);
                        break;
                    case 3:
                        rightBottom.push(value);
                        break;
                    case 4:
                        bottom.push(value);
                        break;
                    default:
                        break;
                }

            });

            // Focus
            let tab_button = document.getElementById(id);

            if (position === 0) {
                let left_click_item = left_tab_button_map.get(tab_button);
                if (left_click_item) {
                    leftItem = left_click_item;
                }

                if (leftItem) {
                    clickLeftTabButton(leftItem);
                }

                if (rightItem) {
                    if (tab_button.id === rightItem.id) {
                        if (rightTop.length > 0) {
                            rightItem = rightTop[rightTop.length - 1];
                        }
                    }
                    clickRightTopButton(rightItem);
                }

                if (bottomItem) {
                    if (tab_button.id === bottomItem.id) {
                        if (bottom.length > 0) {
                            bottomItem = bottom[bottom.length - 1];
                        }
                    }
                    clickBottomTabButton(bottomItem);
                }

            }

            if (position === 2) {
                let right_click_item_top = right_tab_button_map_top.get(tab_button);
                if (right_click_item_top) {
                    rightItem = right_click_item_top;
                }

                if (rightItem) {
                    clickRightTopButton(rightItem);
                }

                if (leftItem) {
                    if (tab_button.id === leftItem.id) {
                        if (leftTop.length > 0) {
                            leftItem = leftTop[leftTop.length - 1];
                        }
                    }
                    clickLeftTabButton(leftItem);
                }

                if (bottomItem) {
                    if (tab_button.id === bottomItem.id) {
                        if (bottom.length > 0) {
                            bottomItem = bottom[bottom.length - 1];
                        }
                    }
                    clickBottomTabButton(bottomItem);
                }
            }

            if (position === 4) {
                let bottom_click_item = bottom_tab_button_map.get(tab_button);
                if (bottom_click_item) {
                    bottomItem = bottom_click_item;
                }

                if (bottomItem) {
                    clickBottomTabButton(bottomItem);
                }

                if (leftItem) {
                    if (tab_button.id === leftItem.id) {
                        if (leftTop.length > 0) {
                            leftItem = leftTop[leftTop.length - 1];
                        }
                    }
                    if (leftItem) {
                        clickLeftTabButton(leftItem);
                    }
                }

                if (rightItem) {
                    if (tab_button.id === rightItem.id) {
                        if (rightTop.length > 0) {
                            rightItem = rightTop[rightTop.length - 1];
                        }
                    }
                    clickRightTopButton(rightItem);
                }
            }

            // Tab Panel 열려있게 설정
            if (element) {
                scope.SetActiveTab(element.id, true);
            }

            scope.Tab.Right.Dock.style.display = "none";
            scope.Tab.Left.Dock.style.display = "none";
            scope.Tab.Bottom.Dock.style.display = "none";

            //dock 이후
            dragged = undefined;
        }

        this.Init = function () {
            initTab();
        };

        this.SetLanguage = function(value){
            let changeList = document.querySelectorAll('[data-language-dock]');

            let language = undefined;

            if(value === 0){
                language = "KR";
            } else {
                language = "EN";
            }

            changeList.forEach(v => {
                let text = vizcore.Language[language][v.dataset.languageDock];
                if(text) {
                    v.innerText = text;
                }
            });
        };


        this.Show = function (bool) {
            if (bool) {
                let left = [];
                let right = [];
                let bottom = [];
                scope.ItemsMap.forEach((value) => {
                    switch (value.position) {
                        case 0:
                            left.push(value);
                            break;
                        case 1:
                            left.push(value);
                            break;
                        case 2:
                            right.push(value);
                            break;
                        case 3:
                            right.push(value);
                            break;
                        case 4:
                            bottom.push(value);
                            break;
                        default:
                            break;
                    }
                });

                // left
                if (left.length === 0) {
                    UI.Element.LeftView.style.display = "none";
                    if (UI.Type === 2 || UI.Type === 3) {
                        UI.Element.LeftView.Resize.style.display = "none";
                    }
                } else {
                    UI.Element.LeftView.style.display = "block";
                    if (UI.Type === 2 || UI.Type === 3) {
                        UI.Element.LeftView.Resize.style.display = "block";
                    }
                }

                // right
                if (right.length === 0) {
                    UI.Element.RightView.style.display = "none";
                    if (UI.Type === 2 || UI.Type === 3) {
                        UI.Element.RightView.ResizeHor.style.display = "none";
                    }
                } else {
                    UI.Element.RightView.style.display = "block";
                    if (UI.Type === 2 || UI.Type === 3) {
                        UI.Element.RightView.ResizeHor.style.display = "block";
                    }
                }

                // bottom
                if (bottom.length === 0) {
                    UI.Element.BottomView.style.display = "none";
                    if (UI.Type === 2 || UI.Type === 3) {
                        UI.Element.BottomView.Resize.style.display = "none";
                    }
                } else {
                    UI.Element.BottomView.style.display = "block";
                    if (UI.Type === 2 || UI.Type === 3) {
                        UI.Element.BottomView.Resize.style.display = "block";
                    }
                }
            } else {
                UI.Element.LeftView.style.display = "none";
                UI.Element.RightView.style.display = "none";
                UI.Element.BottomView.style.display = "none";
            }

            if (UI.Type === 2 || UI.Type === 3) {
                UI.Element.LeftView.Resize.style.display = "none";
                UI.Element.RightView.ResizeHor.style.display = "none";
                UI.Element.BottomView.Resize.style.display = "none";
            }
        }

        /**
         * Tab 정보
         * @param {String} id : tab id
         * @param {String} title : tab title
         * @param {String} icon : tab icon base64
         * @param {Object} content HTML Element
         * @param {Number} position : tab position(0: left, 2: right, 4: bottom)
         * @param {String} tooltip : tooltip
         *  @param {Boolean} focus : focus 여부
         *  @param {Boolean} fix : fix 여부
         *  @param {Boolean} floating : floating 여부
         * 
         * @example  
         * 
         * let tab1_content = document.createElement('div');
         * tab1_content.style = "position: absolute; top:0px; left: 0px; width: 50px; height:50px; background-color: black; z-index: 200;";
         * 
         * let tab1 = scope.GetItemObject();
         * tab1.id = "Tab1";
         * tab1.title = "Tab1";
         * tab1.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABVUlEQVRYhWP8//8/w0ACpgG1fcQ7AARYaG2Bds8kBwYGBgcsUgeuluQdoLkDoJbX45A7MDyjQLtnEixvP2RgYFhAtAO0eyYlMDAwKJBg14OrJXlYLbhakscINbOBKAe4zV6wlIGBISrWyICBl4OdoM2ff/xkWHzuAkif667UhGgSHI3dAU8/fopq9XBlCNDRJFqzhpgoQ/WO3VEMDAz4HHAArzioKAZhre6J/8kBUH0MyBibGC48IgqiBhzlQOPVkryG4REC2j2TDBgYGALQxEA+/0BI7/AIgasleRcYGBguwPjaPZPqQfHLQERBNPxzATQkcIbC4AqBDVeuk1QUg9QTAkQ3SKT5+ZaByvUbr16TVBmB9BFQirdBAncAqEbT7pm0e/G5CyRVx7tSE/DW94QAShTgqtvJAdBGCWkNEmoBWGOEYbQcgAC8DZLRvuEIdwADAwMAJ+rafW77W9UAAAAASUVORK5CYII=";
         * tab1.position = 0;
         * tab1.content = tab1_content;
         */
        this.GetItemObject = function () {
            let item = {
                id: undefined,
                title: undefined,
                title_content: undefined,
                icon: undefined,
                content: undefined,
                position: 0, // 0: left, 1: right
                tooltip: undefined,
                focus: false,
                fix: false,
                floating: false,
                uuid: vizcore.Main.Util.NewGUID(),
                order: 0,
            };

            return item;
        };

        /**
         * Tab 추가
         * @param {Object} object GetItemObject 정보
         * @example  
         * 
         * let tab1_content = document.createElement('div');
         * tab1_content.style = "position: absolute; top:0px; left: 0px; width: 50px; height:50px; background-color: black; z-index: 200;";
         * 
         * let tab1 = scope.GetItemObject();
         * tab1.id = "Tab1";
         * tab1.title = "Tab1";
         * tab1.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABVUlEQVRYhWP8//8/w0ACpgG1fcQ7AARYaG2Bds8kBwYGBgcsUgeuluQdoLkDoJbX45A7MDyjQLtnEixvP2RgYFhAtAO0eyYlMDAwKJBg14OrJXlYLbhakscINbOBKAe4zV6wlIGBISrWyICBl4OdoM2ff/xkWHzuAkif667UhGgSHI3dAU8/fopq9XBlCNDRJFqzhpgoQ/WO3VEMDAz4HHAArzioKAZhre6J/8kBUH0MyBibGC48IgqiBhzlQOPVkryG4REC2j2TDBgYGALQxEA+/0BI7/AIgasleRcYGBguwPjaPZPqQfHLQERBNPxzATQkcIbC4AqBDVeuk1QUg9QTAkQ3SKT5+ZaByvUbr16TVBmB9BFQirdBAncAqEbT7pm0e/G5CyRVx7tSE/DW94QAShTgqtvJAdBGCWkNEmoBWGOEYbQcgAC8DZLRvuEIdwADAwMAJ+rafW77W9UAAAAASUVORK5CYII=";
         * tab1.position = 0;
         * tab1.content = tab1_content;
         * 
         * scope.AddTab(tab1);
         */
        this.AddTab = function (object) {
            addTab(object);

            if (object.floating) {
                createPanel(object.id);
            }
            object.floating = false;
        };

        /**
         * Tab 여러개 추가
         * @param {String} id : tab id
         * @param {String} title : tab title
         * @param {String} icon : tab icon
         * @param {Object} content HTML Element
         * @param {Number} position : tab position(0: left, 2: right, 4: bottom)
         * @example  
         * 
         * let tab1_content = document.createElement('div');
         * tab1_content.style = "position: absolute; top:0px; left: 0px; width: 50px; height:50px; background-color: black; z-index: 200;";
         * 
         * let tab1 = scope.GetItemObject();
         * tab1.id = "Tab1";
         * tab1.title = "Tab1";
         * tab1.position = 0;
         * tab1.content = tab1_content;
         * 
         * let tab2_content = document.createElement('div');
         * tab2_content.style = "position: absolute; top:0px; left: 0px; width: 50px; height:50px; background-color: black; z-index: 200;";
         * 
         * let tab2 = scope.GetItemObject();
         * tab2.id = "Tab2";
         * tab2.title = "Tab2";
         * tab2.position = 0;
         * tab2.content = tab2_content;
         * 
         * scope.AddTabs([tab1, tab2]);
         */
        this.AddTabs = function (array) {
            addTabs(array);
        };

        /**
         * Tab 삭제
         * @param {String} id : tab id
         * @example
         * let tab1_content = document.createElement('div');
         * tab1_content.style = "position: absolute; top:0px; left: 0px; width: 50px; height:50px; background-color: black; z-index: 200;";
         * 
         * let tab1 = scope.GetItemObject();
         * tab1.id = "Tab1";
         * tab1.title = "Tab1";
         * tab1.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABVUlEQVRYhWP8//8/w0ACpgG1fcQ7AARYaG2Bds8kBwYGBgcsUgeuluQdoLkDoJbX45A7MDyjQLtnEixvP2RgYFhAtAO0eyYlMDAwKJBg14OrJXlYLbhakscINbOBKAe4zV6wlIGBISrWyICBl4OdoM2ff/xkWHzuAkif667UhGgSHI3dAU8/fopq9XBlCNDRJFqzhpgoQ/WO3VEMDAz4HHAArzioKAZhre6J/8kBUH0MyBibGC48IgqiBhzlQOPVkryG4REC2j2TDBgYGALQxEA+/0BI7/AIgasleRcYGBguwPjaPZPqQfHLQERBNPxzATQkcIbC4AqBDVeuk1QUg9QTAkQ3SKT5+ZaByvUbr16TVBmB9BFQirdBAncAqEbT7pm0e/G5CyRVx7tSE/DW94QAShTgqtvJAdBGCWkNEmoBWGOEYbQcgAC8DZLRvuEIdwADAwMAJ+rafW77W9UAAAAASUVORK5CYII=";
         * tab1.position = 0;
         * tab1.content = tab1_content;
         * 
         * scope.AddTab(tab1);
         * 
         * scope.DeleteTab(tab1);
         */
        this.DeleteTab = function (id) {
            deleteTab(id);
        };

        /**
         * Tab 편집
         * @param {String} id : tab id
         * @param {Object} object GetItemObject 정보
         * @example
         * let tab1_content = document.createElement('div');
         * tab1_content.style = "position: absolute; top:0px; left: 0px; width: 50px; height:50px; background-color: black; z-index: 200;";
         * 
         * let tab1 = scope.GetItemObject();
         * tab1.id = "Tab1";
         * tab1.title = "Tab1";
         * tab1.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABVUlEQVRYhWP8//8/w0ACpgG1fcQ7AARYaG2Bds8kBwYGBgcsUgeuluQdoLkDoJbX45A7MDyjQLtnEixvP2RgYFhAtAO0eyYlMDAwKJBg14OrJXlYLbhakscINbOBKAe4zV6wlIGBISrWyICBl4OdoM2ff/xkWHzuAkif667UhGgSHI3dAU8/fopq9XBlCNDRJFqzhpgoQ/WO3VEMDAz4HHAArzioKAZhre6J/8kBUH0MyBibGC48IgqiBhzlQOPVkryG4REC2j2TDBgYGALQxEA+/0BI7/AIgasleRcYGBguwPjaPZPqQfHLQERBNPxzATQkcIbC4AqBDVeuk1QUg9QTAkQ3SKT5+ZaByvUbr16TVBmB9BFQirdBAncAqEbT7pm0e/G5CyRVx7tSE/DW94QAShTgqtvJAdBGCWkNEmoBWGOEYbQcgAC8DZLRvuEIdwADAwMAJ+rafW77W9UAAAAASUVORK5CYII=";
         * tab1.position = 0;
         * tab1.content = tab1_content;
         * 
         * scope.AddTab([tab1]);
         * 
         * let tab2 = scope.GetItemObject();
         * tab2.id = "Tab2";
         * tab2.title = "Tab2";
         * tab2.position = 0;
         * 
         * scope.EditTab(tab1.id , tab2);
         */
        this.EditTab = function (id, object) {
            editTab(id, object);
        };

        /**
         * Tab 활성화
         * @param {String} id: Tab id
         * @param {Boolean} active: 활성화 상태
         * @example 
         * 
         * let tab1_content = document.createElement('div');
         * tab1_content.style = "position: absolute; top:0px; left: 0px; width: 50px; height:50px; background-color: black; z-index: 200;";
         * 
         * let tab1 = scope.GetItemObject();
         * tab1.id = "Tab1";
         * tab1.title = "Tab1";
         * tab1.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABVUlEQVRYhWP8//8/w0ACpgG1fcQ7AARYaG2Bds8kBwYGBgcsUgeuluQdoLkDoJbX45A7MDyjQLtnEixvP2RgYFhAtAO0eyYlMDAwKJBg14OrJXlYLbhakscINbOBKAe4zV6wlIGBISrWyICBl4OdoM2ff/xkWHzuAkif667UhGgSHI3dAU8/fopq9XBlCNDRJFqzhpgoQ/WO3VEMDAz4HHAArzioKAZhre6J/8kBUH0MyBibGC48IgqiBhzlQOPVkryG4REC2j2TDBgYGALQxEA+/0BI7/AIgasleRcYGBguwPjaPZPqQfHLQERBNPxzATQkcIbC4AqBDVeuk1QUg9QTAkQ3SKT5+ZaByvUbr16TVBmB9BFQirdBAncAqEbT7pm0e/G5CyRVx7tSE/DW94QAShTgqtvJAdBGCWkNEmoBWGOEYbQcgAC8DZLRvuEIdwADAwMAJ+rafW77W9UAAAAASUVORK5CYII=";
         * tab1.position = 0;
         * tab1.content = tab1_content;
         * 
         * scope.SetActiveTab(tab1.id, true);
         */
        this.SetActiveTab = function (id, active) {
            let item = undefined;
            scope.ItemsMap.forEach((value) => {
                if (value.id === id) {
                    item = value;
                }
            });
            if (item) {
                switch (item.position) {
                    case 0:
                        if (active) {
                            
                            // UI.Element.LeftView.style.width = "350px";
                            // UI.Element.LeftView.Content.style.display = "block";
                            // UI.Element.LeftView.Button.style.display = "none";
                            // if (UI.Type === 2 || UI.Type === 3) {
                            //     UI.Element.LeftView.Resize.style.left = "350px";
                            // }
                            UI.Element.LeftView.style.width = UI.DragData.Left;
                            UI.Element.LeftView.Content.style.display = "block";
                            UI.Element.LeftView.Button.style.display = "none";

                            if (UI.Type === 2 || UI.Type === 3) {
                              UI.Element.LeftView.Resize.style.left = UI.DragData.Left;
                            }
                        } else {
                            let buttonImg = UI.Element.LeftView.Button.querySelector('img');
                            UI.Element.LeftView.style.width = "37px";
                            UI.Element.LeftView.Content.style.display = "none";
                            UI.Element.LeftView.Button.style.display = "block";
                            UI.Element.LeftView.Button.classList.remove("SH_tab_resize_button_left");
                            UI.Element.LeftView.Button.classList.add("SH_tab_resize_button_left_in");
                            buttonImg.style.transform = "rotate( -90deg )";
                            if (UI.Type === 2 || UI.Type === 3) {
                                UI.Element.LeftView.Resize.style.left = "37px";
                            }
                        }
                        leftItem = item;
                        clickLeftTabButton(item);
                        break;
                    case 1:
                        break;
                    case 2:
                        if (active) {
                            UI.Element.RightView.style.width = UI.DragData.Right;
                            UI.Element.RightView.Top.Content.style.display = "block";
                            UI.Element.RightView.Button.style.display = "none";
                            if (UI.Type === 2 || UI.Type === 3) {
                                UI.Element.RightView.ResizeHor.style.right = UI.DragData.Right;
                            }
                        } else {
                            let buttonImg = UI.Element.RightView.Button.querySelector('img');
                            UI.Element.RightView.style.width = "37px";
                            UI.Element.RightView.Top.Content.style.display = "none";
                            UI.Element.RightView.Button.style.display = "block";
                            UI.Element.RightView.Button.classList.remove("SH_tab_resize_button_right");
                            UI.Element.RightView.Button.classList.add("SH_tab_resize_button_right_in");
                            buttonImg.style.transform = "rotate( -90deg )";
                            if (UI.Type === 2 || UI.Type === 3) {
                                UI.Element.RightView.ResizeHor.style.right = "37px";
                            }
                        }
                        rightItem = item;
                        clickRightTopButton(item);
                        break;
                    case 3:
                        if (active) {
                            UI.Element.RightView.style.width = "350px";
                            UI.Element.RightView.Bottom.Content.style.display = "block";
                            UI.Element.RightView.Button.style.display = "none";
                            if (UI.Type === 2 || UI.Type === 3) {
                                UI.Element.RightView.ResizeHor.style.right = "350px";
                            }
                        } else {
                            let buttonImg = UI.Element.RightView.Button.querySelector('img');
                            UI.Element.RightView.style.width = "37px";
                            UI.Element.RightView.Content.Bottom.style.display = "none";
                            UI.Element.RightView.Button.style.display = "block";
                            UI.Element.RightView.Button.classList.remove("SH_tab_resize_button_right");
                            UI.Element.RightView.Button.classList.add("SH_tab_resize_button_right_in");
                            buttonImg.style.transform = "rotate( -90deg )";
                            if (UI.Type === 2 || UI.Type === 3) {
                                UI.Element.RightView.ResizeHor.style.right = "37px";
                            }
                        }
                        clickRightBottomButton(item);
                        break;
                    case 4:
                        if (active) {
                            UI.Element.BottomView.style.height = UI.DragData.Bottom;
                            UI.Element.BottomView.Content.style.display = "block";
                            UI.Element.BottomView.Button.style.display = "none";
                            if (UI.Type === 2) {
                                UI.Element.BottomView.Resize.style.bottom = UI.DragData.Bottom;
                            } else if (UI.Type === 3) {
                                UI.Element.BottomView.Resize.style.bottom = (UI.Element.BottomView.offsetHeight + UI.Element.StatusBar.offsetHeight) + "px";
                            }
                        } else {
                            let buttonImg = UI.Element.BottomView.Button.querySelector('img');
                            UI.Element.BottomView.style.height = "37px";
                            UI.Element.BottomView.Content.style.display = "none";
                            UI.Element.BottomView.Button.style.display = "block";
                            UI.Element.BottomView.Button.classList.remove("SH_tab_resize_button_bottom");
                            UI.Element.BottomView.Button.classList.add("SH_tab_resize_button_bottom_in");
                            buttonImg.style.transform = "rotate( 0deg )";
                            if (UI.Type === 2 || UI.Type === 3) {
                                UI.Element.BottomView.Resize.style.bottom = "37px";
                            }
                        }
                        bottomItem = item;
                        clickBottomTabButton(item);
                    default:
                        break;
                }
            }
        };

        // id로 object 가져오기
        this.GetItemObjectById = function (id) {
            let object = undefined;
            scope.ItemsMap.forEach(value => {
                if (id === value.id) {
                    object = value;
                }
            });
            return object;
        }
    }
};

export default UI_DockPanel;
