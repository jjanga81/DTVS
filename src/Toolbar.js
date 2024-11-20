/**
 * VIZCore Toolbar 인터페이스
 * @copyright © 2013 - 2021 SOFTHILLS Co., Ltd. All rights reserved.
 * @author SOFTHILLS <tech@softhills.net>
 * @param {Object} vizcore.UIElement  UIElement
 * @class
 */
class Toolbar {
    /**
     * Toolbar 생성
     * @param {Object} vizcore.UIElement  UIElement
     * @example
     * let view = document.getElementById("view");
     * let createtoolbar = new vizwide3d.Toolbar(view, vizwide3d, VIZCore);
     */
    constructor(uiElement, vizcore) {
        let scope = this;

        this.objectElements = new Map();
        this.subButtonGroup = new Map()   // child button의 group 

        let container = undefined;  //toolbar
        let subcontainer = undefined;

        let toolbarVisible = false;

        let view = uiElement.GetViewElement();

        // UI Element Toolbar 추가
        //uiElement.Toolbar = this;


        function initMenu() {

            let divToolbarCtrl = document.createElement('div');
            divToolbarCtrl.id = "VIZCore_Toolbar_control";
            divToolbarCtrl.className = "control_uicontainer";

            view.appendChild(divToolbarCtrl);

            let toolbarContainer = createToolbarContainer();
            divToolbarCtrl.appendChild(toolbarContainer);

            let toolbarSubContainer = createSubToolbarContainer();
            divToolbarCtrl.appendChild(toolbarSubContainer);
        }

        function createToolbarContainer() {

            let divToolbar = document.createElement('div');
            divToolbar.id = "VIZCore_Toolbar";
            divToolbar.draggable = true;
            divToolbar.className = "VIZWeb SH_toolbar_container SH_toolbar_container_horizontal_bottom SH_none";

            let tooltip = document.createElement('div');
            tooltip.className = "VIZWeb SH_toolbar_button_tooltip_V2";
            tooltip.id = 'toolbar_tooltip';
            tooltip.textContent = 'tooltip';
            view.appendChild(tooltip);

            container = divToolbar;

            scope.Show(toolbarVisible);

            scope.objectElements.set(divToolbar.id, divToolbar);
            scope.objectElements.set(tooltip.id, tooltip);

            drag();

            return divToolbar;
        }

        function createSubToolbarContainer() {
            let divSubToolbar = document.createElement('div');
            divSubToolbar.id = "VIZCore_SubToolbar";
            divSubToolbar.draggable = true;
            divSubToolbar.className = "VIZWeb SH_toolbar_sub_container_area SH_toolbar_sub_container_area_horizontal_bottom";

            subcontainer = divSubToolbar;

            scope.objectElements.set(divSubToolbar.id, divSubToolbar);

            return divSubToolbar;
        }

        function drag() {
            let left_view_button = document.createElement('div');
            left_view_button.className = "VIZWeb SH_tab_drop_button SH_tab_drop_button_left SH_none";
            left_view_button.innerHTML = "<img style='padding: 10px;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAA3UlEQVRYhWP8//8/w0ACpgG1fcQ7AARYQISrq+uAJITdu3czDo4QgAGQi+hhKXKID64QGIi0MLhC4Kl3HUmapbc2gWlS086gSgODKwqoDbQmHBZgYGCYwMDAUHCtwPYDXR0AtfwAAwODPlQoAZs6mkQBmuUXQSGASy3VHYDFcgdcwU91B5BqOdUdAE1wsDgPIGQ5LRxQAPU5CGyAhgj9HAD1sQPUEaCQOEDIEVRPhKQ6gibZEIsjJtDVAWiOWIivHKBpUQx1BNYSEAZGa0Nw12xEN8tHO6cD6wAGBgYAZI9ThDufb4cAAAAASUVORK5CYII='>"
            view.appendChild(left_view_button);

            let right_view_button = document.createElement('div');
            right_view_button.className = "VIZWeb SH_tab_drop_button SH_tab_drop_button_right SH_none";
            right_view_button.innerHTML = "<img style='padding: 10px;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAA4ElEQVRYhWP8//8/w0ACpgG1fcQ7AARYQISrq+uAJITdu3czDo4QgAGQi+hhKXKID64QGIi0MLTTACzEnnrXkWSp9NYmOHu0JGTBJaE14bAAAwPDBAYGhoJrBbYfaOUAfCEAsjyegYHhANQxdHdAAQMDw0UGBgZ9WjoCpwOgwe5Aa0fgTYT0cATBXAB1RACUqw9NG/RzANTHG6Dci9C0QR8HQC0/APU5yHIHamdJnA6gh+V4HQCNa5paDgI4S0KkuKZpSYjTAVBLE2hlMQyM1obgrtmIbpaPdk4H1gEMDAwAhzNTc06a3hUAAAAASUVORK5CYII='>";
            view.appendChild(right_view_button);

            let top_view_button = document.createElement('div');
            top_view_button.className = "VIZWeb SH_tab_drop_button SH_tab_drop_button_top SH_none";
            top_view_button.innerHTML = "<img style='padding: 10px;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAAxElEQVRYhWP8//8/w0ACFnS7XV1daeqi3bt3MyLzmQbU+9hCAAbQXUopwBWygzcEaJ0WYGDwhsBT7zqqWiS9tQmr+ICHwKgDRh0w6oBRB+AsCXGVXNQGo+0BikJAa8JhARCmxAyyHQC1+AAIU+IIshyAZLk+FJPtCJIdgGb5RSgm2xEkOQCL5Q5QTLYjiHYANsuvFdh+AGFKHEFOGoBbDhNAcwRJgGgHIFmCYjmx8rgAzoIIjyPIlscGRvsFA9s9Z2BgAABe3FdRZzXhJAAAAABJRU5ErkJggg=='>";
            view.appendChild(top_view_button);

            let bottom_view_button = document.createElement('div');
            bottom_view_button.className = "VIZWeb SH_tab_drop_button SH_tab_drop_button_bottom SH_none";
            bottom_view_button.innerHTML = "<img style='padding: 10px;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAAyUlEQVRYhWP8//8/w0ACFnS7XV1daeqi3bt3MyLzmQbU+9hCAAbQXUopwBWygzcEaJ0WYGA0DZAUAloTDguAMLnyFDkAavABEMZmCSF5ih2ABPTRLUGyXJ9Uw4h2wLUC2w8MDAwODAwMF5EdgWY5SM4Bqpa6DsDlCEosJ9kBOBxBtuVkOQCLI8i2nGwHoDmCbMtBAGdBRIIjKAKjdQHOEHjqXUdVi6S3NmEVH/AQGHXAqANGHTDqAJwlIa6Si9pgwENgYLvnDAwMAFutWcTUxO0wAAAAAElFTkSuQmCC'>"
            view.appendChild(bottom_view_button);

            let dropButtons = [left_view_button, right_view_button, top_view_button, bottom_view_button];

            container.addEventListener('dragstart', function () {
                for (let index = 0; index < dropButtons.length; index++) {
                    const button = dropButtons[index];
                    button.classList.replace('SH_none', 'SH_block');
                }
            });

            container.addEventListener('dragend', function () {
                for (let index = 0; index < dropButtons.length; index++) {
                    const button = dropButtons[index];
                    button.classList.replace('SH_block', 'SH_none');
                }
            });

            for (let index = 0; index < dropButtons.length; index++) {
                const button = dropButtons[index];
                button.addEventListener('dragover', function (e) {
                    e.preventDefault();
                });

                button.addEventListener('drop', function (e) {
                    button.classList.replace('SH_block', 'SH_none');

                    switch (button) {
                        case left_view_button:
                            scope.SetPosition(0);
                            break;
                        case right_view_button:
                            scope.SetPosition(2);
                            break;
                        case top_view_button:
                            scope.SetPosition(1);
                            break;
                        case bottom_view_button:
                            scope.SetPosition(3);
                            break;
                        default:
                            break;
                    }
                });
            }
        }


        function addButton(items) {
            if (items.length > 0) {
                for (let i = 0; i < items.length; i++) {

                    // parentButton
                    let button;
                    if(items[i].type === "custom"){
                        button = createCustomDivElement(items[i]);
                    } else {
                        button = createButtonDivElement(items[i]);
                    }

                    if (button === null || button === undefined)
                        return;

                    items[i].element = button;
                    container.appendChild(button);
                    scope.objectElements.set(items[i].id, items[i]);

                    // subButton
                    if (items[i].subButton !== undefined && items[i].subButton !== null) {
                        addSubButton(button);
                    }

                    setStatus(items[i]);
                }
            }

            // 버튼 초기 설정
            uiElement.InitSetting();
        }

        function editButton(item) {

            let newObj = item;
            let oldObj = getObjectById(item.id);

            if (oldObj === null || oldObj === undefined)
                return;

            // new button element 생성
            newObj.element = createButtonDivElement(newObj)

            let oldElement = document.getElementById(oldObj.element.id);
            oldElement.parentNode.replaceChild(newObj.element, oldObj.element);
            scope.objectElements.set(newObj.id, newObj);

            // subButton
            if (newObj.subButton !== undefined && newObj.subButton !== null) {
                addSubButton(newObj.element);
            }

            setStatus(newObj);
        }

        function addSubButton(parentElement) {

            let item = getObjectById(parentElement.id);

            if (item !== undefined && item !== null) {

                let check = document.createElement('div');
                check.className = "VIZWeb SH_sub_check_button";
                parentElement.appendChild(check);

                let childuibox = document.createElement('div');
                childuibox.id = "SH_toolbar_subButtonGroup" + item.id;
                childuibox.className = "VIZWeb SH_toolbar_sub_container SH_none";

                subcontainer.appendChild(childuibox);
                scope.subButtonGroup.set(childuibox.id, childuibox);

                for (let j = 0; j < item.subButton.length; j++) {
                    let subBtn = createButtonDivElement(item.subButton[j]);

                    childuibox.appendChild(subBtn);

                    item.subButton[j].element = subBtn;

                    setStatus(item.subButton[j]);
                }
            }

        }

        function sh_guid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const randomNumber = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
                var r = randomNumber * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);

                return v.toString(16);
            });
        }

        function createButtonDivElement(item) {
            let button = document.createElement('div');

            // Button Id
            if (item.id !== undefined && item.id !== null) {
                button.id = item.id;
            } else {
                button.id = "button" + sh_guid();
            }

            button.className = "VIZWeb SH_toolbar_button SH_toolbar_uncheck_button SH_enable_button SH_toolbar_block";
            button.style.backgroundColor = item.backgroundColor;

            // Button Image
            if (item.imagesrc !== undefined && item.imagesrc !== null) {
                // CSS 정의된 Icon 사용 유무
                if (uiElement.UseCSSIcon(item.imagesrc) === true) {
                    button.classList.add(item.imagesrc);
                }
                else {
                    button.style.backgroundImage = "url(" + item.imagesrc + ")";
                }
            }

            // Button callback
            if (item.callback !== undefined) {
                button.addEventListener('click', function () {
                    if (item.checked === true) {
                        if (button.classList.contains("SH_toolbar_uncheck_button")) {
                            uiElement.SetCheckButton(item.id, true);
                            item.callback(true);
                        } else {
                            uiElement.SetCheckButton(item.id, false);
                            item.callback(false);
                        }
                    } else {
                        item.callback();
                    }
                });
            } else {
                if (item.subButton) {
                    button.addEventListener('click', function () {
                        let element = scope.subButtonGroup.get('SH_toolbar_subButtonGroup' + item.id);
                        if (element.classList.contains('SH_toolbar_sub_container')) {
                            if (element.classList.contains('SH_none')) {
                                element.classList.replace('SH_none', 'SH_display_table');
                                setSubContentPosition(button, element);
                                showSubContainer(true);
                            } else {
                                element.classList.replace('SH_display_table', 'SH_none');
                                showSubContainer(false);
                            }
                        }

                    });
                }
            }

            // 버튼 외에 다른 영역 선택 시 서브 버튼 숨기기
            window.addEventListener('click', function (e) {
                if (e.target !== button) {
                    scope.subButtonGroup.forEach((value, key) => {
                        if (key === 'SH_toolbar_subButtonGroup' + e.target.id)
                            return;

                        // showSubContainer(false);
                        if (value.classList.contains('SH_toolbar_sub_container')) {
                            value.classList.replace('SH_display_table', 'SH_none');
                        }
                    });
                }
            });


            ///Tootip 설정
            let tooltip = scope.objectElements.get('toolbar_tooltip');
            let timeout;
            if (tooltip !== undefined && tooltip !== null) {

                button.addEventListener('mouseover', function () {
                    timeout = setTimeout(function () {
                        tooltip.textContent = item.tooltip;
                        tooltip.className = 'VIZWeb SH_toolbar_button_tooltip_V2 SH_toolbar_button_tooltip_V2_show';
                        setTooltipPosition(button, tooltip);
                        tooltip.setAttribute("data-language-tooltip", item.tooltip);
                        scope.SetLanguage(vizcore.Configuration.Language);
                    }, 500); // 0.5초 후에 툴팁을 표시
                });

                button.addEventListener('mouseout', function () {
                    clearTimeout(timeout);
                    tooltip.className = 'VIZWeb SH_toolbar_button_tooltip_V2 SH_toolbar_button_tooltip_V2_hide';
                });
            }

            return button;
        }

        function createCustomDivElement(item) {
            let custom = item.content;

            if (custom) {
                // Button Id
                if (item.id !== undefined && item.id !== null) {
                    custom.id = item.id;
                } else {
                    custom.id = "custom" + sh_guid();
                }
            }

            return custom;
        }

        function setSubContentPosition(button, sub) {

            if (container === undefined || container === null)
                return;

            let toolbarType = container.className;

            let ribbonRect = uiElement.Element.RibbonBar.getBoundingClientRect();

            let leftPanelRect = uiElement.Element.LeftView.getBoundingClientRect();

            let main = document.getElementsByClassName("VIZWeb_Main")[0];

            let mainRect = main.getBoundingClientRect();
            let buttonRect = button.getBoundingClientRect();

            let gap = 3;
            if (toolbarType.includes("SH_toolbar_container_horizontal_top")) {
                sub.style.top = '';
                sub.style.left = (buttonRect.left - leftPanelRect.width - gap - mainRect.left) + 'px';
            }
            else if (toolbarType.includes("SH_toolbar_container_horizontal_bottom")) {
                sub.style.top = '0px';
                sub.style.left = (buttonRect.left - leftPanelRect.width - gap - mainRect.left) + 'px';
            }
            else if (toolbarType.includes("SH_toolbar_container_vertical_left")) {
                sub.style.top = (buttonRect.top - gap - ribbonRect.height - mainRect.top) + 'px';
                sub.style.left = '';
            }
            else if (toolbarType.includes("SH_toolbar_container_vertical_right")) {
                sub.style.top = (buttonRect.top - gap - ribbonRect.height - mainRect.top) + 'px';
                sub.style.left = '';
            }
        }

        // button object 반환
        function getObjectById(id) {

            //parent
            let button = scope.objectElements.get(id);

            //child
            if (button === undefined || button === null) {
                let withSubButtons = Array.from(scope.objectElements.values()).filter(button => button.subButton !== null && button.subButton !== undefined);

                for (let i = 0; i < withSubButtons.length; i++) {
                    let parentButton = withSubButtons[i];

                    for (let j = 0; j < parentButton.subButton.length; j++) {
                        if (id === parentButton.subButton[j].id) {
                            button = parentButton.subButton[j];
                            break;
                        }
                    }
                }
            }

            return button;
        }

        // tooltip 위치 변경
        function setTooltipPosition(button, tooltip) {

            if (container === undefined || container === null)
                return;

            let toolbarType = container.className;

            let buttonRect = button.getBoundingClientRect();
            let tooltipRect = tooltip.getBoundingClientRect();
            let gap = 5; //여백

            if (toolbarType.includes("SH_toolbar_container_horizontal_top")) {
                tooltip.style.top = (buttonRect.bottom + gap) + 'px';
                tooltip.style.left = (buttonRect.left) + 'px';
            }
            else if (toolbarType.includes("SH_toolbar_container_horizontal_bottom")) {
                tooltip.style.top = (buttonRect.top - tooltipRect.height - gap) + 'px';
                tooltip.style.left = (buttonRect.left) + 'px';
            }
            else if (toolbarType.includes("SH_toolbar_container_vertical_left")) {
                tooltip.style.top = (buttonRect.top + gap) + 'px';
                tooltip.style.left = (buttonRect.right + gap) + 'px';

            }
            else if (toolbarType.includes("SH_toolbar_container_vertical_right")) {
                tooltip.style.top = (buttonRect.top + gap) + 'px';
                tooltip.style.left = (buttonRect.left - tooltipRect.width - gap) + 'px';
            }
        }

        // 버튼 보이기 & 활성화
        function setStatus(item){
            if(item){
                if (item.visible) {
                    scope.SetVisibleButton(item.id, item.visible);
    
                    // 타입이 체크인 경우만
                    if (item.checked) {
                        scope.SetCheckButton(item.id, item.selected);
                    }
    
                    scope.SetEnableButton(item.id, item.enable);
                } else {
                    scope.SetVisibleButton(item.id, item.visible);
                }
            }
        }

        function showSubContainer(bool){
            if(bool){
                subcontainer.classList.replace("SH_none" , "SH_block");
            } else {
                subcontainer.classList.replace("SH_block" , "SH_none");
            }
        }

        this.SetLanguage = function(value) {
            // data-language-tooltip
            let changeList = document.querySelectorAll('[data-language-tooltip]');

            let language = undefined;

            if(value === 0){
                language = "KR";
            } else {
                language = "EN";
            }

            changeList.forEach(v => {
                let text = vizcore.Language[language][v.dataset.languageTooltip];
                if(text) {
                    v.innerText = text;
                }
            });
        }

        /**
        * 툴바 위치
        * @param {VIZCore.Enum.TOOLBAR_POS} pos : vizcore.UIElement.Enum.TOOLBAR_POS
        * @example
        * let toolbar = vizcore.UIElement.GetToolbar();
        * toolbar.SetPosition(vizcore.UIElement.Enum.TOOLBAR_POS.TOP);
        */
        this.SetPosition = function (pos) {
            let toolbarElements = document.getElementsByClassName("VIZWeb SH_toolbar_container");

            let subToolbarElements = document.getElementsByClassName("VIZWeb SH_toolbar_sub_container_area");

            uiElement.OnToolbarMoveEvent(pos);

            switch (pos) {
                case 0:
                    if (toolbarElements.length > 0) {
                        for (let i = 0; i < toolbarElements.length; i++) {
                            let toolbar = toolbarElements[i];
                            toolbar.className = "VIZWeb SH_toolbar_container SH_toolbar_container_vertical_left";
                        }
                    }

                    if(subToolbarElements.length > 0){
                        for (let i = 0; i < subToolbarElements.length; i++) {
                            let toolbar = subToolbarElements[i];
                            toolbar.className = "VIZWeb SH_toolbar_sub_container_area SH_toolbar_sub_container_area_vertical_left SH_none";
                        }
                    }
                    break;
                case 1:
                    if (toolbarElements.length > 0) {
                        for (let i = 0; i < toolbarElements.length; i++) {
                            let toolbar = toolbarElements[i];
                            toolbar.className = "VIZWeb SH_toolbar_container SH_toolbar_container_horizontal_top";
                        }
                    }

                    if(subToolbarElements.length > 0){
                        for (let i = 0; i < subToolbarElements.length; i++) {
                            let toolbar = subToolbarElements[i];
                            toolbar.className = "VIZWeb SH_toolbar_sub_container_area SH_toolbar_sub_container_area_horizontal_top SH_none";
                        }
                    }
                    break;
                case 2:
                    if (toolbarElements.length > 0) {
                        for (let i = 0; i < toolbarElements.length; i++) {
                            let toolbar = toolbarElements[i];
                            toolbar.className = "VIZWeb SH_toolbar_container SH_toolbar_container_vertical_right";
                        }
                    }

                    if(subToolbarElements.length > 0){
                        for (let i = 0; i < subToolbarElements.length; i++) {
                            let toolbar = subToolbarElements[i];
                            toolbar.className = "VIZWeb SH_toolbar_sub_container_area SH_toolbar_sub_container_area_vertical_right SH_none";
                        }
                    }
                    break;
                case 3:
                    if (toolbarElements.length > 0) {
                        for (let i = 0; i < toolbarElements.length; i++) {
                            let toolbar = toolbarElements[i];
                            toolbar.className = "VIZWeb SH_toolbar_container SH_toolbar_container_horizontal_bottom";
                        }
                    }

                    if(subToolbarElements.length > 0){
                        for (let i = 0; i < subToolbarElements.length; i++) {
                            let toolbar = subToolbarElements[i];
                            toolbar.className = "VIZWeb SH_toolbar_sub_container_area SH_toolbar_sub_container_area_horizontal_bottom SH_none";
                        }
                    }
                    break;
                default:
                    break;
            }

            let subElements = document.querySelectorAll(".VIZWeb.SH_toolbar_sub_container");
            if (subElements.length > 0) {
                subElements.forEach(toolbar => {
                    toolbar.className = "VIZWeb SH_toolbar_sub_container SH_none";
                });
            }
        }

        /**
        * 전체 메뉴 object 반환
        * @returns {Array} Toolbar Menu Object 
        * @example 
        * let toolbar = vizcore.UIElement.GetToolbar();
        * let menus = toolbar.GetMenu();
        */
        this.GetMenu = function () {
            let allMenuObjects = [];

            // menu들만
            for (let value of scope.objectElements.values()) {
                if (value.id !== "VIZCore_Toolbar"
                    && value.id !== "toolbar_tooltip"  && value.id !== "VIZCore_SubToolbar") {    //Toolbar
                    let commonObj = convertCommonBtnObj(value);
                    allMenuObjects.push(commonObj);
                }
            }

            return allMenuObjects;
        }

        /**
        * ID를 통한 object 반환
        * @param {String} id : button Id
        * @returns {Object} Toolbar Menu Object 
        * @example 
        * let toolbar = vizcore.UIElement.GetToolbar();
        * let button = toolbar.GetMenuById(vizcore.Main.GetViewID() + "ui_tree_visible");
        * button.subButton = [subbutton];
        * 
        */
        this.GetMenuById = function (id) {

            let button = getObjectById(id);
            return convertCommonBtnObj(button);
        }


        /**
        * Custom Toolbar Menu
        * @param {Array} menuObjects : button object
        * @example 
        * let toolbar = vizcore.UIElement.GetToolbar();
        * let menus = toolbar.GetMenu();
        * let button = toolbar.GetMenuById(vizcore.Main.GetViewID() + "ui_color");
        * button.subButton = undefined;
        * 
        * createtoolbar.SetMenu(menus);
        */
        this.SetMenu = function (menuObjects) {

            // 기존 map clear
            scope.objectElements = new Map();
            scope.subButtonGroup = new Map();

            let toolbar = document.getElementById("VIZCore_Toolbar_control");
            toolbar.innerHTML = "";

            // create
            let toolbarContainer = createToolbarContainer();
            toolbar.appendChild(toolbarContainer);

            let toolbarSubContainer = createSubToolbarContainer();
            toolbar.appendChild(toolbarSubContainer);

            //Button Object
            let toolbarObjs = [];
            for (let i = 0; i < menuObjects.length; i++) {
                let object = convertToolbarBtnObj(menuObjects[i]);
                toolbarObjs.push(object);
            }

            addButton(toolbarObjs);
        }

        /**
        * Custom Toolbar Menu
        * @param {Array} menuObjects : button object
        * @example 
        * let toolbar = vizcore.UIElement.GetToolbar();
        * let button = toolbar.GetMenuById(vizcore.Main.GetViewID() + "ui_color");
        * button.status.enable = false;
        * button.text = "change";
        * button.icon.normal = 'A/A.png';
        * 
        * toolbar.UpdateMenu([button]);
        */
        this.UpdateMenu = function (menuObjects) {

            if (menuObjects === undefined || menuObjects.length < 0)
                return;

            for (let i = 0; i < menuObjects.length; i++) {
                let object = convertToolbarBtnObj(menuObjects[i]);
                editButton(object);
            }
        }

        /**
        * 버튼 생성
        * @param {Array} Item : button object
        * @example 
        * let toolbar = vizcore.UIElement.GetToolbar();
        * let button = toolbar.GetButtonObj();
        * button.id = "button";
        * button.checked = true;
        * button.subButton = [subButton];
        * button.callback = callback;
        * 
        * toolbar.Add([button]);
        */
        this.Add = function (Items) {

            let toolbarObjs = [];

            for (let i = 0; i < Items.length; i++) {
                let object = convertToolbarBtnObj(Items[i]);
                toolbarObjs.push(object);
            }

            addButton(toolbarObjs);
        }


        /// Common Button object -> Toolbar Button object 변환
        let convertToolbarBtnObj = function (item) {

            if (item === undefined || item === null)
                return;

            let object = {};

            if(item.style.type === uiElement.Enum.BUTTON_STYLE.CUSTOM){
                object = GetCustomObj();

                object.id = item.id;
                object.callback = item.event.click;
                object.content = item.content;
                object.selected = item.status.check;
                object.visible = item.status.visible;
                object.enable = item.status.enable;
            } else {
                object = GetButtonObj();

                object.id = item.id;
                object.tooltip = item.text;
                object.imagesrc = item.icon.normal;
                object.imagesrc_checked = item.icon.check;
                object.callback = item.event.click;
                object.checked = uiElement.IsCheckButton(item.style.type);
                object.selected = item.status.check;
                object.visible = item.status.visible;
                object.enable = item.status.enable;
    
                if (item.subButton !== undefined) {
                    if (item.subButton.length > 0)
                        object.subButton = [];
    
                    for (let i = 0; i < item.subButton.length; i++) {
                        let btnObj = convertToolbarBtnObj(item.subButton[i]);
                        object.subButton.push(btnObj);
                    }
                }
            }

            return object;
        };

        /// Toolbar Button object -> Common Button object  변환
        let convertCommonBtnObj = function (item) {

            if (item === undefined || item === null)
                return;

            let object = uiElement.GetObject(uiElement.Enum.OBJECT_TYPE.BUTTON);

            if(item.type === "button"){
                object.id = item.id;
                object.text = item.tooltip;
                object.icon.normal = item.imagesrc;
                object.icon.check = item.imagesrc_checked;
                object.event.click = item.callback;
                object.style.type = uiElement.GetButtonStyleType(item.checked);
                object.status.check = item.selected;
                object.status.visible = item.visible;
                object.status.enable = item.enable;
    
                if (item.subButton !== undefined) {
                    if (item.subButton.length > 0)
                        object.subButton = [];
    
                    for (let i = 0; i < item.subButton.length; i++) {
                        let btnObj = convertCommonBtnObj(item.subButton[i]);
                        object.subButton.push(btnObj);
                    }
                }
            } else if(item.type === "custom") {
                object.id = item.id;
                object.content = item.content;
                object.event.click = item.callback;
                object.style.type = uiElement.Enum.BUTTON_STYLE.CUSTOM;
                object.status.check = item.selected;
                object.status.visible = item.visible;
                object.status.enable = item.enable;
            }

            return object;
        };


        /**
        * 서브 버튼 추가
        * @param {String} parentID : 서브 버튼 추가할 부모 버튼 id
        * @param {Object} childInfo : subbutton info
        * @param {Number} Position : subbutton 순서
        * @example 
        * let toolbar = vizcore.UIElement.GetToolbar();
        * 
        * let button = toolbar.GetButtonObj();
        * button.id = "button";
        * button.checked = true;
        * button.callback = callback;
        * 
        * toolbar.AddButton([button]);
        * 
        * let subbutton = toolbar.GetButtonObj();
        * subbutton.id = "button";
        * subbutton.checked = true;
        * subbutton.callback = callback;
        * 
        * toolbar.AddSub(button.id ,subbutton, 0);
        */
        this.AddSub = function (parentId, childInfo, position) {
            let childuibox = scope.subButtonGroup.get("SH_toolbar_subButtonGroup" + parentId);

            //부모 버튼
            let parentObject = getObjectById(parentId);
            if (parentObject === undefined || parentObject === null)
                return;

            //기존 자식 버튼
            let child = parentObject.subButton;

            if (child === undefined || child === null) {
                child = [];
            }
            else {
                subcontainer.removeChild(childuibox);
            }

            // 위치 정보에 따라 배열 재구성
            if (childInfo.length > 0) {
                for (let i = 0; i < childInfo.length; i++) {
                    if (position) {
                        child.splice(position, 0, convertToolbarBtnObj(childInfo[i]));
                        position++;
                    } else {
                        child.push(convertToolbarBtnObj(childInfo[i]));
                    }
                }
            }


            parentObject.subButton = child;
            scope.objectElements.set(parentId, parentObject);

            addSubButton(parentObject.element)
        }

        /**
        * 버튼 object
        * @param {String} id : button id
        * @param {String} imagesrc : button image
        * @param {String} backgroundColor : button backgroundCOlor
        * @param {Boolean} checked : button checked
        * @param {Object} callback : button callback
        * @param {Array} subButton : button sub
        * @param {String} tooltip : button tooltip text
        * @example
        * let toolbar = vizcore.UIElement.GetToolbar();
        *
        * let subbutton = toolbar.GetButtonObj();
        * subbutton.id = "subbutton";
        * subbutton.checked = fasle;
        * subbutton.callback = subcallback;
        *
        * let button = toolbar.GetButtonObj();
        * button.id = "button";
        * button.checked = true;
        * button.subButton = [subButton];
        * button.callback = callback;
        */
        let GetButtonObj = function () {
            let button = {
                id: undefined,
                imagesrc: undefined,
                imagesrc_checked: undefined,
                backgroundColor: undefined,
                checked: false,
                callback: undefined,
                subButton: undefined,
                tooltip: undefined,
                element: undefined,
                selected: false, // 선택 상태 관리
                visible: true,
                enable: true,
                type: 'button'
            };
            return button;
        };


        let GetCustomObj = function () {
            let button = {
                id: undefined,
                callback: undefined,
                content: undefined,
                element: undefined,
                selected: false, // 선택 상태 관리
                visible: true,
                enable: true,
                type: 'custom'
            };
            return button;
        };

        /**
        * Toolbar Button Check
        * @param {String} id : button id
        * @param {boolean} check : button check
        * @example 
        * let toolbar = vizcore.UIElement.GetToolbar();
        * let button = toolbar.GetButtonObj();
        * button.id = "button";
        * button.checked = true;
        * button.callback = callback;
        * 
        * toolbar.SetCheckButton(button.id, true);
        */
        this.SetCheckButton = function (id, check) {
            let button = getObjectById(id);
            if (button === undefined || button === null)
                return;
            if (check === true) {
                button.element.classList.replace("SH_toolbar_uncheck_button", "SH_toolbar_check_button");
            }
            else {
                button.element.classList.replace("SH_toolbar_check_button", "SH_toolbar_uncheck_button");
            }

            button.selected = check;
            scope.SetCheckButtonImg(id, check);
        };

        /**
        * Toolbar Buttons Check
        * @param {Array} ids : button ids
        * @param {Boolean} check : button check
        * @example 
        * let callback = function(){
        *   console.log("callback");
        * }
        * 
        * let toolbar = vizcore.UIElement.GetToolbar();
        * let button = toolbar.GetButtonObj();
        * button.id = "button";
        * button.checked = true;
        * button.callback = callback;
        * 
        * let button2 = toolbar.GetButtonObj();
        * button2.id = "button2";
        * button2.checked = true;
        * button2.callback = callback;
        * 
        * toolbar.SetCheckButtons(["button", "button2"], true);
        * toolbar.SetCheckButtons(["button", "button2"], false);
        */
        this.SetCheckButtons = function (ids, check) {
            for (let index = 0; index < ids.length; index++) {
                const id = ids[index];
                let button = getObjectById(id);

                if (button === undefined || button === null)
                    return;

                if (check === true) {
                    button.element.classList.replace("SH_toolbar_uncheck_button", "SH_toolbar_check_button");
                }
                else {
                    button.element.classList.replace("SH_toolbar_check_button", "SH_toolbar_uncheck_button");
                }

                button.selected = check;
                scope.SetCheckButtonImg(id, check);
            }
        };

        /**
        * Toolbar Button Enable
        * @param {String} ids : button ids
        * @param {Boolean} enable : button enable
        * @example 
        * 
        * toolbar.SetEnableButton("ModelTreeTab", true);
        * toolbar.SetEnableButton("ModelTreeTab", false);
        */
        this.SetEnableButton = function (id, enable) {
            let button = getObjectById(id);

            if (button === undefined || button === null)
                return;
            if (enable === true) {
                button.element.classList.replace("SH_disable_button", "SH_enable_button");
            }
            else {
                button.element.classList.replace("SH_enable_button", "SH_disable_button");
            }

            button.enable = enable;
        }

        /**
        * Toolbar Button Visible
        * @param {String} ids : button ids
        * @param {Boolean} visible : button visible
        * @example 
        * 
        * toolbar.SetVisibleButton("ModelTreeTab", true);
        * toolbar.SetVisibleButton("ModelTreeTab", false);
        */
        this.SetVisibleButton = function (id, visible) {
            let button = getObjectById(id);

            if (button === undefined || button === null)
                return;
            if (visible === true) {
                button.element.classList.replace("SH_toolbar_none", "SH_toolbar_block");
            }
            else {
                button.element.classList.replace("SH_toolbar_block", "SH_toolbar_none");
            }

            button.visible = visible;
        }

        /**
        * Toolbar Button Check
        * @param {String} parentID : parent button ID
        * @param {String} exceptSubId : except Sub button ID
        * @param {boolean} check : button check
        * @example 
        * let toolbar = vizcore.UIElement.GetToolbar();
        * let parentbutton = toolbar.GetButtonObj();
        * parentbutton.id = "button";
        * parentbutton.checked = true;
        * parentbutton.callback = callback;
        * 
        * let exceptbutton = toolbar.GetButtonObj();
        * 
        * toolbar.SetCheckSubButtons(parentbutton.id , true, exceptbutton.id);
        */
        this.SetCheckSubButtons = function (parentID, check, exceptSubId) {
            let parentButton = getObjectById(parentID);
            if (parentButton === null || parentButton === undefined)
                return;

            // 서브버튼
            if (parentButton.subButton.length !== 0) {
                for (let i = 0; i < parentButton.subButton.length; i++) {

                    let subButton = parentButton.subButton[i];
                    if (subButton !== undefined && exceptSubId !== subButton.id) {
                        if (check === true) {
                            uiElement.SetCheckButton(subButton.id, true);
                        }
                        else {
                            uiElement.SetCheckButton(subButton.id, false);
                        }
                        scope.SetCheckButtonImg(subButton.id, check);
                    }
                }
            }
        };

        /**
        * Button Check Image
        * @param {String} id : button id
        * @param {boolean} check : button check
        * @example 
        * let toolbar = vizcore.UIElement.GetToolbar();
        * let button = toolbar.GetButtonObj();
        * button.id = "button";
        * button.checked = true;
        * button.callback = callback;
        * 
        * toolbar.SetCheckButtonImg(id, true);
        */
        this.SetCheckButtonImg = function (id, check) {

            let object = getObjectById(id);
            if (object === undefined || object === null)
                return;

            let button = object.element;
            let enableCheckImage = undefined;

            if (check) {
                if (object.imagesrc_checked === undefined)
                    enableCheckImage = false;
                else
                    enableCheckImage = true;
            }
            else {
                enableCheckImage = false;
            }

            ///  Image 설정
            if (enableCheckImage === true) {
                if (uiElement.UseCSSIcon(object.imagesrc_checked) === true) {
                    button.classList.add(object.imagesrc_checked);
                    button.classList.remove(object.imagesrc);
                }
                else {
                    button.style.backgroundImage = "url(" + object.imagesrc + ");";
                    // button.querySelector('img').src = checkimage;
                }
            }
            else if (enableCheckImage === false) {
                if (uiElement.UseCSSIcon(object.imagesrc) === true) {
                    button.classList.add(object.imagesrc);
                    button.classList.remove(object.imagesrc_checked);
                }
                else {
                    button.style.backgroundImage = "url(" + object.imagesrc + ");";
                    // button.querySelector('img').src = checkimage;
                }
            }

        };

        /**
        * Toolbar 보이기/숨기기
        * @param {Boolean} show : Toolbar show/hide
        * @example 
        * let toolbar = vizcore.UIElement.GetToolbar();
        * toolbar.Show(true);
        * toolbar.Show(false);
        */
        this.Show = function (show) {

            if (show === true) {
                container.style.display = "block";
                toolbarVisible = true;
            } else {
                container.style.display = "none";
                toolbarVisible = false;
            }
        }

        initMenu();
    }

}
export default Toolbar