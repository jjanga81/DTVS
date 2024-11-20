class UI_RibbonBar {
    constructor(vizwideTab) {
        let scope = this;

        this.ItemsMapAll = new Map(); // key: id, value: object 

        this.ItemsMap = new Map();  // 데이터 관리 key: id, value: object

        let ButtonItemsMap = new Map(); // key: id, object

        let tab_button_map = new Map();

        let itemActiveMap = new Map(); // key: id, value: state

        this.TabItemObject = new Map(); // 디폴트 탭 정보 저장

        // GUID 생성
        function sh_guid() {
            return 'vizweb_xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        function create(items) {
            vizwideTab.Element.RibbonBar.Tab.innerHTML = "";
            vizwideTab.Element.RibbonBar.Content.innerHTML = "";

            // Tab Show/Hide 버튼
            let top_tab_showhide_button = document.createElement('div');
            top_tab_showhide_button.id = "SH_ribbon_showhide_button";
            top_tab_showhide_button.className = "VIZWeb SH_ribbon_showhide_button SH_arrow_icon";
            vizwideTab.Element.RibbonBar.Tab.appendChild(top_tab_showhide_button);

            top_tab_showhide_button.addEventListener('click', function () {
                if (vizwideTab.Element.RibbonBar.style.height === "135px") {
                    vizwideTab.Element.RibbonBar.style.height = "31px";
                    vizwideTab.Element.RibbonBar.Content.style.display = "none";
                    top_tab_showhide_button.style.transform = "rotate( 0deg )";
                } else {
                    vizwideTab.Element.RibbonBar.style.height = "135px";
                    vizwideTab.Element.RibbonBar.Content.style.display = "block";
                    top_tab_showhide_button.style.transform = "rotate( 180deg )";
                }
            });

            scope.ItemsMapAll.clear();
            scope.ItemsMap.clear();
            ButtonItemsMap.clear();

            tab_button_map.clear();

            let top_tab_button_div = document.createElement('div');
            top_tab_button_div.className = "VIZWeb SH_ribbon_tab_button_div";
            vizwideTab.Element.RibbonBar.Tab.appendChild(top_tab_button_div);

            for (let index = 0; index < items.length; index++) {
                const element = items[index];
                element.uuid = sh_guid();

                let top_tab_button = document.createElement('div');
                top_tab_button.id = element.id + "_" + element.uuid;
                top_tab_button.innerText = element.text;
                top_tab_button.className = "VIZWeb SH_ribbon_tab_button SH_ribbon_tab_uncheck_button SH_inline_block SH_enable_button";
                top_tab_button.setAttribute("data-language", element.text); 
                top_tab_button_div.appendChild(top_tab_button);

                let top_content = document.createElement('div');
                top_content.className = "VIZWeb SH_ribbon_content";
                vizwideTab.Element.RibbonBar.Content.appendChild(top_content);


                element.element.tab = top_tab_button;
                element.element.content = top_content;

                if (index === 0) {
                    top_content.style.display = "block";
                    top_tab_button.classList.replace("SH_ribbon_tab_uncheck_button", "SH_ribbon_tab_check_button");
                }

                for (let index = 0; index < element.group.length; index++) {
                    const group = element.group[index];

                    group.uuid = sh_guid();
                    group.tabId = element.id + "_" + element.uuid;

                    let group_div = document.createElement('div');
                    if (group.id) {
                        group_div.id = group.id + "_" + group.uuid;
                    }
                    group_div.className = "VIZWeb SH_ribbon_group_div SH_inline_block SH_enable_button";
                    top_content.appendChild(group_div);

                    createButton(group, group_div);

                    let group_text_div = document.createElement('div');
                    group_text_div.className = "VIZWeb SH_ribbon_group_text_div";
                    group_text_div.innerText = group.text;
                    group_text_div.setAttribute("data-language", group.text); 
                    group_div.appendChild(group_text_div);

                    let group_section_div = document.createElement('div');
                    group_section_div.className = "VIZWeb SH_ribbon_group_section_div";
                    top_content.appendChild(group_section_div);

                    group.element = group_div;

                    scope.ItemsMapAll.set(group.id, group);
                }

                tab_button_map.set(top_tab_button, top_content);

                scope.ItemsMapAll.set(element.id, element);
                scope.ItemsMap.set(element.uuid, element);
            }

            top_tab_button_div.addEventListener('click', function (e) {
                selectTab(e.target);
            });

            vizwideTab.InitSetting();

            if (itemActiveMap.size > 0) {
                itemActiveMap.forEach((state, id) => {
                    scope.SetEnableButton(id, state);
                })
            }
        }

        function createButton(group, group_div) {
            switch (group.style) {
                case vizwideTab.Enum.OBJECT_SIZE.LARGE:
                    for (let index = 0; index < group.button.length; index++) {
                        const button = group.button[index];
                        if (button.combo) {
                            createItem([button], group, group_div);
                        } else {
                            createLargeButton(button, group, group_div);
                        }
                    }
                    break;
                case vizwideTab.Enum.OBJECT_SIZE.SMALL:
                    let groupArray = [];
                    for (let index = 0; index < group.button.length; index += 3) {
                        let currentArray;

                        currentArray = group.button.slice(index, index + 3);

                        groupArray.push(currentArray);
                    }

                    for (let index = 0; index < groupArray.length; index++) {
                        const buttonArray = groupArray[index];

                        createItem(buttonArray, group, group_div);
                    }
                    break;
                case vizwideTab.Enum.OBJECT_SIZE.ALL:
                    let samllArray = [];
                    let btnMap = new Map(); // key: order, value: group
                    for (let index = 0; index < group.button.length; index++) {
                        const button = group.button[index];
                        button.order = index;
                        if (button.type === "custom") {
                            createCustom(button, group, group_div);
                        } else {
                            if (button.large !== vizwideTab.Enum.OBJECT_SIZE.LARGE) {
                                samllArray.push(button);
                            }
                            else {
                                btnMap.set(button.order, button);
                            }
                        }
                    }

                    for (let index = 0; index < samllArray.length; index += 3) {
                        let currentArray;

                        currentArray = samllArray.slice(index, index + 3);

                        btnMap.set(currentArray[0].order, currentArray);
                    }

                    // 순서정렬
                    const mapType_array = [...btnMap];
                    mapType_array.sort();
                    btnMap = new Map(mapType_array);

                    // 버튼 생성
                    btnMap.forEach(value => {
                        // 배열이 아닌 경우 큰 버튼
                        if (value.length) {
                            createItem(value, group, group_div);
                        } else {
                            createLargeButton(value, group, group_div);
                        }
                    });
                    break;
                default:
                    break;
            }
        }

        function createItem(itemArray, group, group_div) {
            let group_content_button_div1 = document.createElement('div');
            group_content_button_div1.className = "VIZWeb SH_ribbon_group_small_button_div_area";
            group_div.appendChild(group_content_button_div1);

            for (let index = 0; index < itemArray.length; index++) {
                const button = itemArray[index];

                button.groupId = group.id + "_" + group.uuid;
                button.uuid = sh_guid();

                let group_content_button_div = document.createElement('div');
                group_content_button_div.id = button.id + "_" + button.uuid;
                group_content_button_div.className = "VIZWeb SH_ribbon_group_small_button_div SH_enable_button SH_block SH_ribbon_uncheck_button";
                group_content_button_div1.appendChild(group_content_button_div);

                let group_content_button_img_div = document.createElement('div');
                group_content_button_img_div.id = group.id + "img_" + group.uuid;
                group_content_button_img_div.className = "VIZWeb SH_ribbon_group_small_button_img_div";

                if (button.uncheck_icon) {
                    if (vizwideTab.UseCSSIcon(button.uncheck_icon) === true) {
                        group_content_button_img_div.classList.add(button.uncheck_icon);
                    }
                    else {
                        group_content_button_img_div.style.backgroundImage = "url(" + button.uncheck_icon + ")";
                        group_content_button_img_div.style.backgroundSize = "100%";
                    }
                }

                button.img_div = group_content_button_img_div;

                group_content_button_div.appendChild(group_content_button_img_div);

                if (button.text) {
                    let group_content_button_text_div = document.createElement('div');
                    group_content_button_text_div.className = "VIZWeb SH_ribbon_group_small_button_text_div";
                    group_content_button_text_div.innerText = button.text;
                    group_content_button_text_div.setAttribute("data-language", button.text);
                    group_content_button_div.appendChild(group_content_button_text_div);
                }

                switch (button.type) {
                    case "button": // 버튼
                        createSamllButton(button, group_content_button_div);
                        break;
                    case "combo": // 콤보
                        createCombo(button, group_content_button_div, group_content_button_div1);
                        break;
                    default:
                        break;
                }

                scope.ItemsMapAll.set(button.id, button);

                ButtonItemsMap.set(button.uuid, button);

                setStatus(button);

            }
        }

        function createLargeButton(button, group, group_div) {
            button.groupId = group.id + group.uuid;
            button.uuid = sh_guid();

            let group_content_button_div = document.createElement('div');
            if (button.id) {
                group_content_button_div.id = button.id + "_" + button.uuid;
            }
            group_content_button_div.className = "VIZWeb SH_ribbon_group_large_button_div SH_enable_button SH_ribbon_uncheck_button SH_block";
            group_div.appendChild(group_content_button_div);

            let group_content_button_img_div = document.createElement('div');
            group_content_button_img_div.className = "VIZWeb SH_ribbon_group_large_button_img_div";
            group_content_button_img_div.id = group.id + "img_" + group.uuid;

            // CSS 정의된 Icon 사용 유무
            if (button.uncheck_icon) {
                if (vizwideTab.UseCSSIcon(button.uncheck_icon) === true) {
                    group_content_button_img_div.classList.add(button.uncheck_icon);
                }
                else {
                    group_content_button_img_div.style.backgroundImage = "url(" + button.uncheck_icon + ")";
                }
            }

            button.img_div = group_content_button_img_div;

            group_content_button_div.appendChild(group_content_button_img_div);

            if (button.text) {
                let group_content_button_text_div = document.createElement('div');
                group_content_button_text_div.className = "VIZWeb SH_ribbon_group_large_button_text_div";
                group_content_button_text_div.innerText = button.text;
                group_content_button_text_div.setAttribute("data-language", button.text);
                group_content_button_div.appendChild(group_content_button_text_div);
            }

            if (button.click) {
                let click = false;
                group_content_button_div.addEventListener('click', function () {
                    if (button.checked) {
                        if (group_content_button_div.classList.contains("SH_ribbon_check_button")) {
                            click = false;
                        } else {
                            click = true
                        }
                        vizwideTab.SetCheckButton(button.id, click);

                        button.click(click, button);
                    } else {
                        button.click(button);
                    }
                });
            }


            button.element = group_content_button_div;

            scope.ItemsMapAll.set(button.id, button);

            ButtonItemsMap.set(button.uuid, button);


            setStatus(button);
        }

        function createSamllButton(button, group_content_button_div) {
            if (button.click) {
                let click = false;
                group_content_button_div.addEventListener('click', function () {
                    if (button.checked) {
                        if (group_content_button_div.classList.contains("SH_ribbon_check_button")) {
                            click = false;
                        } else {
                            click = true;
                        }
                        vizwideTab.SetCheckButton(button.id, click);

                        button.click(click, button);
                    } else {
                        button.click(button);
                    }
                });
            }

            button.element = group_content_button_div;
        }

        function createCombo(button, group_content_button_div, group_content_button_div1) {
            let group_content_combo_div = document.createElement('div');
            let group_content_button_combo_img_div = document.createElement('div');

            // 콤보박스 생성
            if (button.combo) {
                // 이미지 삭제
                group_content_button_div.classList.replace("SH_ribbon_group_small_button_div", "SH_ribbon_combo_button_div");

                // 체크 활성화
                group_content_button_combo_img_div.className = "VIZWeb SH_ribbon_group_small_combo_img_div SH_arrow_icon";
                group_content_button_div.appendChild(group_content_button_combo_img_div);

                group_content_combo_div.className = "VIZWeb SH_ribbon_group_combo_div SH_none";
                group_content_button_div1.appendChild(group_content_combo_div);

                for (let index = 0; index < button.combo.length; index++) {
                    const combo = button.combo[index];
                    let group_content_combo = document.createElement('div');
                    group_content_combo.id = combo.id;
                    group_content_combo.className = "VIZWeb SH_ribbon_group_combo";
                    group_content_combo_div.appendChild(group_content_combo);

                    let group_content_combo_img_div = document.createElement('div');
                    group_content_combo_img_div.className = "VIZWeb SH_ribbon_group_small_button_img_div";
                    group_content_combo.appendChild(group_content_combo_img_div);

                    if (combo.icon) {
                        if (vizwideTab.UseCSSIcon(combo.icon) === true) {
                            group_content_combo_img_div.classList.add(combo.icon);
                        }
                        else {
                            group_content_combo_img_div.style.backgroundImage = "url(" + combo.icon + ")";
                            group_content_combo_img_div.style.backgroundSize = "100%";
                        }
                    }

                    let group_content_combo_text_div = document.createElement('div');
                    group_content_combo_text_div.className = "VIZWeb SH_ribbon_group_small_button_text_div";
                    group_content_combo_text_div.style.fontSize = "7pt";
                    group_content_combo_text_div.innerText = combo.text;
                    group_content_combo_text_div.setAttribute("data-language", combo.text);
                    group_content_combo.appendChild(group_content_combo_text_div);

                    if (combo.click) {
                        group_content_combo.addEventListener('click', function () {
                            group_content_button_div.classList.replace("SH_ribbon_check_button", "SH_ribbon_uncheck_button");
                            group_content_combo_div.classList.replace("SH_block", "SH_none");
                            group_content_button_combo_img_div.style.transform = "";
                            combo.click(combo);
                        });
                    }
                }
            }

            //  콤보 선택 시 박스 열고, 닫기
            if (button.combo) {
                group_content_button_div.addEventListener('click', function () {
                    if (group_content_combo_div.classList.contains("SH_block")) {
                        group_content_button_div.classList.replace("SH_ribbon_check_button", "SH_ribbon_uncheck_button");
                        group_content_combo_div.classList.replace("SH_block", "SH_none");
                        group_content_button_combo_img_div.style.transform = "";
                    } else {
                        group_content_button_div.classList.replace("SH_ribbon_uncheck_button", "SH_ribbon_check_button");
                        group_content_combo_div.classList.replace("SH_none", "SH_block");
                        group_content_button_combo_img_div.style.transform = "rotate(180deg)";
                    }
                });
            }

            button.element = group_content_button_div;
        }

        function createCustom(button, group, group_div) {
            if (button.content) {
                button.groupId = group.id + group.uuid;
                button.uuid = sh_guid();

                let element = button.content;

                if (button.id) {
                    element.id = button.id + "_" + button.uuid;
                }

                group_div.appendChild(element);

                button.element = button.content;

                scope.ItemsMapAll.set(button.id, button);

                if (button.click) {
                    element.addEventListener('click', function () {
                        button.click();
                    });
                }
            }
        }

        function selectTab(element) {
            if (tab_button_map.get(element)) {
                tab_button_map.forEach((content, button) => {
                    if (element === button) {
                        content.style.display = "block";
                        button.classList.replace("SH_ribbon_tab_uncheck_button", "SH_ribbon_tab_check_button");
                        // Tab 열림
                        let top_tab_showhide_button = document.getElementById('SH_ribbon_showhide_button');
                        vizwideTab.Element.RibbonBar.style.height = "135px";
                        vizwideTab.Element.RibbonBar.Content.style.display = "block";
                        top_tab_showhide_button.style.transform = "rotate( 180deg )";
                    } else {
                        content.style.display = "none";
                        button.classList.replace("SH_ribbon_tab_check_button", "SH_ribbon_tab_uncheck_button");
                    }
                });
            }
        }

        // 상태 변경
        function setStatus(item) {
            if (item) {
                if (item.visible) {
                    scope.SetVisibleButton(item.id, item.visible);

                    if (item.checked) {
                        scope.SetCheckButton(item.id, item.selected);
                    }

                    scope.SetEnableButton(item.id, item.enable);
                } else {
                    scope.SetVisibleButton(item.id, item.visible);
                }
            }
        }


        /// Common Tab/Group/Button object -> Ribbonbar Tab/Group/Button object 변환
        let convertRibbonObj = function (type, item) {

            let object = undefined;

            if (type === vizwideTab.Enum.OBJECT_TYPE.TAB) {
                object = getTabObject();

                object.id = item.id;
                object.text = item.text;

                if (item.groups.length > 0)
                    object.group = [];

                for (let i = 0; i < item.groups.length; i++) {
                    let groupObj = convertRibbonObj(vizwideTab.Enum.OBJECT_TYPE.GROUP, item.groups[i]);
                    object.group.push(groupObj);
                }
            }
            else if (type === vizwideTab.Enum.OBJECT_TYPE.GROUP) {
                object = getGroupObject();

                object.id = item.id;
                object.text = item.text;
                object.style = item.style.size;
                if (item.buttons.length > 0)
                    object.button = [];

                for (let i = 0; i < item.buttons.length; i++) {
                    let buttonObj = convertRibbonObj(vizwideTab.Enum.OBJECT_TYPE.BUTTON, item.buttons[i]);
                    object.button.push(buttonObj);
                }
            }
            else if (type === vizwideTab.Enum.OBJECT_TYPE.BUTTON) {
                if (item.style.type === vizwideTab.Enum.BUTTON_STYLE.COMBO) {
                    object = getComboObject();

                    object.id = item.id;
                    object.text = item.text;
                    object.uncheck_icon = item.icon.normal;
                    object.combo = item.subButton;
                    object.click = item.event.click;
                    object.visible = item.status.visible;
                    object.enable = item.status.enable;
                }
                else if (item.style.type === vizwideTab.Enum.BUTTON_STYLE.CUSTOM) {
                    object = getCustomObject();

                    object.id = item.id;
                    object.click = item.event.click;
                    object.content = item.content;
                    object.visible = item.status.visible;
                    object.enable = item.status.enable;
                    object.selected = item.status.check;
                }
                else {
                    object = getButtonObject();

                    object.id = item.id;
                    object.text = item.text;
                    object.uncheck_icon = item.icon.normal;
                    object.check_icon = item.icon.check;
                    object.checked = vizwideTab.IsCheckButton(item.style.type);
                    object.click = item.event.click;
                    object.large = item.style.size;
                    object.visible = item.status.visible;
                    object.enable = item.status.enable;
                    object.selected = item.status.check;
                }

            }
            return object;
        }


        /// Ribbonbar Tab/Group/Button object -> Common Tab/Group/Button  object  변환
        let convertCommonObj = function (type, item) {

            let object = vizwideTab.GetObject(type);

            if (type === vizwideTab.Enum.OBJECT_TYPE.TAB) {
                object.id = item.id;
                object.text = item.text;

                if (item.group.length > 0)
                    object.groups = [];

                for (let i = 0; i < item.group.length; i++) {
                    let groupObj = convertCommonObj(vizwideTab.Enum.OBJECT_TYPE.GROUP, item.group[i]);
                    object.groups.push(groupObj);
                }
            }
            else if (type === vizwideTab.Enum.OBJECT_TYPE.GROUP) {
                object.id = item.id;
                object.text = item.text;
                object.style.size = item.style;

                if (item.button.length > 0)
                    object.buttons = [];

                for (let i = 0; i < item.button.length; i++) {
                    let buttonObj = convertCommonObj(vizwideTab.Enum.OBJECT_TYPE.BUTTON, item.button[i]);
                    object.buttons.push(buttonObj);
                }

            }
            else if (type === vizwideTab.Enum.OBJECT_TYPE.BUTTON) {
                if (item.type === 'combo') {
                    object.id = item.id;
                    object.text = item.text;
                    object.event.click = item.click;
                    object.icon.normal = item.uncheck_icon;
                    object.subButton = item.combo;
                    object.style.type = vizwideTab.Enum.BUTTON_STYLE.COMBO;
                    object.status.enable = item.enable;
                    object.status.visible = item.visible;
                    object.status.check = item.selected;
                }
                else if (item.type === 'custom') {
                    object.id = item.id;
                    object.event.click = item.click;
                    object.content = item.content;
                    object.status.enable = item.enable;
                    object.status.visible = item.visible;
                    object.status.check = item.selected;
                }
                else {
                    object.id = item.id;
                    object.text = item.text;
                    object.icon.normal = item.uncheck_icon;
                    object.icon.check = item.check_icon;
                    object.event.click = item.click;
                    object.style.type = vizwideTab.GetButtonStyleType(item.checked);
                    object.style.size = item.large;
                    object.status.enable = item.enable;
                    object.status.visible = item.visible;
                    object.status.check = item.selected;
                }
            }

            return object;
        }


        let getOjbectType = function (object) {

            let type = undefined;

            if (object.type === "Tab")
                type = vizwideTab.Enum.OBJECT_TYPE.TAB;
            else if (object.type === "Group")
                type = vizwideTab.Enum.OBJECT_TYPE.GROUP;
            else
                type = vizwideTab.Enum.OBJECT_TYPE.BUTTON;

            return type;
        }

        /**
         *  
         * @param {String} id : id
         * @example  
         * @returns {Object} item
         * let object = ribbon.GetMenuById("id");
         */
        this.GetMenuById = function (id) {
            // let element = undefined;
            // scope.ItemsMapAll.forEach(value => {
            //     if(value.id === id) {
            //         element = value;
            //     }
            // });

            let element = scope.ItemsMapAll.get(id);

            if (element === undefined)
                return;

            let type = getOjbectType(element);

            let commonObj = convertCommonObj(type, element);

            return commonObj;
        };


        this.Show = function (bool) {
            if (bool) {
                vizwideTab.Element.RibbonBar.classList.replace('SH_none', 'SH_block');
                vizwideTab.Element.RibbonBar.Button.style.display = "block";
            } else {
                vizwideTab.Element.RibbonBar.classList.replace('SH_block', 'SH_none');
                vizwideTab.Element.RibbonBar.Button.style.display = "none";
            }
        };

        /**
         * Tab Add
         * @param {Object} object : object
         * @example  
         * let cb1 = function (bool) {
         *      console.log("Click");
         * }
         * 
         * let button = ribbon.GetButtonObject("Button1", "Button1", true, undefined, undefined, cb1);
         * 
         * let group = ribbon.GetGroupObject("Group", "Group", 1, [button]);
         * 
         * let tab = scope.GetTabObject("Tab", "Tab", [group]);
         * 
         * scope.AddTab(tab);
         */
        let addTab = function (object) {

            scope.ItemsMap.set(object.uuid, object);

            let items = [];
            scope.ItemsMap.forEach((value) => {
                items.push(value);
            });

            create(items);
        };

        /**
         * Add Insert Tab
         * @param {Object} object : tab object
         * @example  
         * let cb1 = function (bool) {
         *      console.log("Click");
         * }
         * 
         * let button = ribbon.GetButtonObject("Button1", "Button1", true, undefined, undefined, cb1);
         * 
         * let group = ribbon.GetGroupObject("Group", "Group", 1, [button]);
         * 
         * let tab = scope.GetTabObject("Tab", "Tab", [group]);
         * 
         * scope.AddInsertTab(tab);
         */
        this.AddInsertTab = function (object) {

            let ribbonObj = convertRibbonObj(vizwideTab.Enum.OBJECT_TYPE.TAB, object);
            if (ribbonObj.type === "Tab") {
                let items = [];

                items.push(ribbonObj);

                scope.ItemsMap.forEach(value => {
                    items.push(value);
                });

                create(items);
            }
        }

        /**
         * Group Add
         * @param {String} tabId : Tab ID
         * @param {Object} object : object
         * @example  
         */
        let addGroup = function (tabId, object) {
            let items = [];
            scope.ItemsMap.forEach((value) => {
                if (value.id === tabId) {
                    value.group.push(object);
                }
                items.push(value);
            });

            create(items);
        };

        /**
         * Tab /Group/ Button Add
         * @param {vizcore.UIElement.Enum.OBJECT_TYPE} type : tab/group/button type
         * @param {Object} object : object
         * @param {String} parentId : groupID or tabID
         * @example  
         */
        this.Add = function (type, object, parentId) {

            let ribbonObj = undefined;

            ribbonObj = convertRibbonObj(type, object);

            if (type === vizwideTab.Enum.OBJECT_TYPE.TAB) {
                addTab(ribbonObj);
            }
            else if (type === vizwideTab.Enum.OBJECT_TYPE.GROUP) {
                addGroup(parentId, ribbonObj);
            }
            else if (type === vizwideTab.Enum.OBJECT_TYPE.BUTTON) {
                addButton(parentId, ribbonObj);
            }
        };

        /**
         * Button Add
         * @param {String} groupId : Group ID
         * @param {Object} object : object
         * @example  
         */
        let addButton = function (groupId, object) {
            let items = [];
            scope.ItemsMap.forEach((value) => {
                for (let index = 0; index < value.group.length; index++) {
                    const element = value.group[index];
                    if (element.id === groupId) {
                        element.button.push(object);
                    }
                }

                items.push(value);
            });

            create(items);
        };


        /**
         * Tab Edit
         * @param {String} tabId : Tab ID
         * @param {Object} object : object
         * @example  
         */
        let editTab = function (tabId, object) {
            let items = [];
            scope.ItemsMap.forEach((value, key) => {
                if (value.id === tabId) {
                    scope.ItemsMap.set(key, object);
                }
            });

            scope.ItemsMap.forEach((value) => {
                items.push(value);
            });

            create(items);
        };

        /**
         * Group Edit
         * @param {String} tabId : Tab ID
         * @param {String} groupId : Group ID
         * @param {Object} object : object
         * @example  
         */
        let editGroup = function (tabID, groupId, object) {
            let items = [];
            let groupArray = [];
            scope.ItemsMap.forEach((value) => {
                if (tabID === value.id) {
                    for (let index = 0; index < value.group.length; index++) {
                        const group = value.group[index];
                        if (group.id === groupId) {
                            groupArray.push(object);
                        } else {
                            groupArray.push(group);
                        }
                    }
                    value.group = groupArray;
                }
                items.push(value);
            });

            create(items);
        };

        /**
         * Button Edit
         * @param {String} groupId : Group ID
         * @param {String} buttonId : Button ID
         * @param {Object} object : object
         * @example  
         */
        let editButton = function (groupId, buttonId, object) {
            let items = [];
            let buttonArray = [];
            scope.ItemsMap.forEach((value) => {
                for (let index = 0; index < value.group.length; index++) {
                    const group = value.group[index];
                    if (groupId === group.id) {
                        for (let index = 0; index < group.button.length; index++) {
                            const button = group.button[index];
                            if (button.id === buttonId) {
                                buttonArray.push(object);
                            } else {
                                buttonArray.push(button);
                            }
                        }
                        group.button = buttonArray;
                    }
                }
                items.push(value);
            });

            create(items);
        };

        /**
         * Tab /Group/ Button Edit
         * @param {vizcore.UIElement.Enum.OBJECT_TYPE} type : tab/group/button type
         * @param {Object} object : object
         * @param {String} parentId : groupID or tabID
         * @example  
         */
        this.Edit = function (type, object, parentId) {
            let ribbonObj = undefined;

            ribbonObj = convertRibbonObj(type, object);

            if (type === vizwideTab.Enum.OBJECT_TYPE.TAB) {
                editTab(ribbonObj.id, ribbonObj);
            }
            else if (type === vizwideTab.Enum.OBJECT_TYPE.GROUP) {
                editGroup(parentId, ribbonObj.id, ribbonObj);
            }
            else if (type === vizwideTab.Enum.OBJECT_TYPE.BUTTON) {
                editButton(parentId, ribbonObj.id, ribbonObj);
            }
        };

        /**
         * Tab Delete
         * @param {String} tabId : 삭제 할 Tab ID
         * @example  
         */
        let deleteTab = function (tabId) {
            let items = [];
            scope.ItemsMap.forEach((value) => {
                if (tabId === value.id) {
                    scope.ItemsMap.delete(value.uuid);
                }
            });

            scope.ItemsMap.forEach((value) => {
                items.push(value);
            });

            create(items);
        };

        /**
         * Group Delete
         * @param {String} groupId : 삭제 할 Group ID
         * @example  
         */
        let deleteGroup = function (groupId) {
            let items = [];
            scope.ItemsMap.forEach((value) => {
                for (let index = 0; index < value.group.length; index++) {
                    const element = value.group[index];
                    if (element.id === groupId) {
                        value.group.splice(index, 1);
                        index--;
                    }
                }
            });

            scope.ItemsMap.forEach((value) => {
                items.push(value);
            });

            create(items);
        };

        /**
         * Button Delete
         * @param {String} buttonId : 삭제 할 Button ID
         * @example  
         */
        let deleteButton = function (buttonId) {
            let items = [];
            scope.ItemsMap.forEach((value) => {
                for (let index = 0; index < value.group.length; index++) {
                    const group = value.group[index];
                    for (let index = 0; index < group.button.length; index++) {
                        const button = group.button[index];
                        if (button.id === buttonId) {
                            group.button.splice(index, 1);
                            index--;
                        }
                    }
                }
            });

            scope.ItemsMap.forEach((value) => {
                items.push(value);
            });

            create(items);
        };

        /**
        * Tab /Group/ Button Delete
        * @param {vizcore.UIElement.Enum.OBJECT_TYPE} type : tab/group/button type
        * @param {String} objectId 
        * @example  
        */
        this.Delete = function (type, objectId) {

            if (type === vizwideTab.Enum.OBJECT_TYPE.TAB) {
                deleteTab(objectId);
            }
            else if (type === vizwideTab.Enum.OBJECT_TYPE.GROUP) {
                deleteGroup(objectId);
            }
            else if (type === vizwideTab.Enum.OBJECT_TYPE.BUTTON) {
                deleteButton(objectId);
            }
        };

        /**
         * Ribbon Tab Info
         * @param {String} id : tab id
         * @param {String} text : tab text
         * @param {Array} group : tab group
         * @example  
         */
        let getTabObject = function () {
            let item = {
                id: undefined,
                text: undefined,
                group: undefined,
                uuid: sh_guid(),
                element: {
                    tab: undefined,
                    content: undefined
                },
                type: "Tab",
            };

            return item;
        };

        /**
         * Ribbon Group Info
         * @param {String} id : group id
         * @param {String} text : group text
         * @param {Numer} groupStyle : group type  0: large, 1: small, 2:large, small
         * @param {Array} button group button
         * @example  
         */
        let getGroupObject = function () {
            let item = {
                id: undefined,
                text: undefined,
                style: vizwideTab.Enum.OBJECT_SIZE.LARGE,
                button: undefined,
                element: undefined,
                tabId: undefined,
                uuid: sh_guid(),
                type: "Group",
            };

            return item;
        };

        /**
         * Ribbon Button Info
         * @param {String} id : button id
         * @param {String} text : button text
         * @param {Boolean} checked : button checked
         * @param {String} uncheck_icon : button uncheck icon
         * @param {String} check_icon : button check icon
         * @param {Function} click : button callback
         * @param {Boolean} large : large button (group type == 2)
         * @example  
         */
        let getButtonObject = function () {
            let item = {
                id: undefined,
                text: undefined,
                click: undefined,
                checked: false,
                check_icon: undefined,
                uncheck_icon: undefined,
                large: vizwideTab.Enum.OBJECT_SIZE.SMALL,
                uuid: sh_guid(),
                element: undefined,
                groupId: undefined,
                img_div: undefined,
                type: "button",
                selected: false, // 선택 상태 관리
                enable: true,
                visible: true
            };

            return item;
        };


        /**
         * Ribbon Button Info
         * @param {String} id : button id
         * @param {String} text : button text
         * @param {String} uncheck_icon : button uncheck icon
         * @param {Array} combo : button combo items
         * @example  
         */
        let getComboObject = function () {
            let item = {
                id: undefined,
                text: undefined,
                uncheck_icon: undefined,
                combo: undefined,
                uuid: sh_guid(),
                element: undefined,
                groupId: undefined,
                img_div: undefined,
                type: "combo",
                enable: true,
                visible: true
            };

            return item;
        }


        /**
         * Ribbon Button Info
         * @param {String} id : button id
         * @param {String} text : button text
         * @param {Boolean} checked : button checked
         * @param {String} uncheck_icon : button uncheck icon
         * @param {String} check_icon : button check icon
         * @param {Function} click : button callback
         * @param {Boolean} large : large button (group type == 2)
         * @example  
         */
        let getCustomObject = function () {
            let item = {
                id: undefined,
                content: undefined,
                click: undefined,
                uuid: sh_guid(),
                element: undefined,
                groupId: undefined,
                img_div: undefined,
                type: "custom",
                enable: true,
                visible: true
            };

            return item;
        };

        /**
         * Ribbon Combo Info
         * @param {String} id : combo id
         * @param {String} text : combo text
         * @param {String} icon : combo icon
         * @param {Object} click : combo click
         * @example  
         */
        this.GetComboSetting = function (id, text, icon, click) {
            let item = {
                id: id,
                text: text,
                icon: icon,
                click: click,
            };

            return item;
        }

        /**
        * Ribbonbar Button Check
        * @param {String} ids : button ids
        * @param {boolean} check : button check
        * @example 
        * 
        * let ribbonbar = vizcore.UIElement.GetRibbonbar();
        * ribbonbar.SetCheckButton("ModelTreeTab", true);
        * ribbonbar.SetCheckButton("ModelTreeTab", false);
        */
        this.SetCheckButton = function (id, check) {
            let item = undefined;
            ButtonItemsMap.forEach(value => {
                if (value.id === id) {
                    item = value;
                }
            });

            if (item) {
                let enableCheckImage = undefined;

                if (check) {
                    // item.element.style.backgroundColor = "rgba(225, 225, 225, 1)";
                    item.element.classList.replace("SH_ribbon_uncheck_button", "SH_ribbon_check_button");
                    if (item.check_icon) {
                        enableCheckImage = true;
                    } else {
                        enableCheckImage = false;
                    }
                    item.selected = true;
                }
                else {
                    item.element.classList.replace("SH_ribbon_check_button", "SH_ribbon_uncheck_button");
                    if (item.uncheck_icon) {
                        enableCheckImage = false;
                    }

                    item.selected = false;
                }

                ///  Image 설정
                if (enableCheckImage === true) {
                    if (vizwideTab.UseCSSIcon(item.check_icon) === true) {
                        item.img_div.classList.add(item.check_icon);
                        item.img_div.classList.remove(item.uncheck_icon);
                    }
                    else {
                        item.img_div.style.backgroundImage = "url(" + item.check_icon + ")";
                    }
                }
                else if (enableCheckImage === false) {
                    if (vizwideTab.UseCSSIcon(item.uncheck_icon) === true) {
                        item.img_div.classList.add(item.uncheck_icon);
                        item.img_div.classList.remove(item.check_icon);
                    }
                    else {
                        item.img_div.style.backgroundImage = "url(" + item.uncheck_icon + ")";
                    }
                }
                else {   //undefined
                    item.img_div.style.backgroundImage = "";
                }
            }
        };

        /**
        * Ribbonbar Buttons Check
        * @param {Array} ids : button ids
        * @param {boolean} check : button check
        * @example 
        * 
        * let ribbonbar = vizcore.UIElement.GetRibbonbar();
        * ribbonbar.SetCheckButtons(["ModelTreeTab", "PropertyTreeTab"], true);
        * ribbonbar.SetCheckButtons(["ModelTreeTab", "PropertyTreeTab"], true);
        */
        this.SetCheckButtons = function (ids, check) {
            for (let index = 0; index < ids.length; index++) {
                const id = ids[index];
                vizwideTab.SetCheckButton(id, check);
            }
        };

        /**
         * Ribbonbar Tab Visible
         * @param {String} id Tab id
         * @param {Boolean} visible Tab visible
         * @example
         * 
         * let ribbonbar = vizcore.UIElement.GetRibbonbar();
         * ribbonbar.SetVisibleTab(SectionTab, true); 탭 보이기
         * ribbonbar.SetVisibleTab(SectionTab, false); 탭 숨기기
         */
        this.SetVisibleTab = function (id, visible) {
            let element = scope.ItemsMapAll.get(id);
            if (element) {
                if (element.element.tab) {
                    if (visible) {
                        element.element.tab.classList.replace("SH_none", "SH_inline_block");
                    } else {
                        element.element.tab.classList.replace("SH_inline_block", "SH_none");
                    }
                }

                element.visible = visible;
            }
        }

        /**
         * Ribbonbar Tab Enable
         * @param {String} id Tab id
         * @param {Boolean} enable Tab enable
         * 
         * let ribbonbar = vizcore.UIElement.GetRibbonbar();
         * ribbonbar.SetEnableTab(SectionTab, true); 탭 활성화
         * ribbonbar.SetEnableTab(SectionTab, false); 탭 비활성화
         */
        this.SetEnableTab = function (id, enable) {
            let element = scope.ItemsMapAll.get(id);

            if (element) {
                if (element.element.tab) {
                    if (enable) {
                        element.element.tab.classList.replace("SH_disable_button", "SH_enable_button");
                    } else {
                        element.element.tab.classList.replace("SH_enable_button", "SH_disable_button");
                    }
                }

                element.enable = enable;
            }
        }

        /**
         * Ribbonbar Group Visible
         * @param {String} id Group id
         * @param {Boolean} visible Group visible
         * @example
         * 
         * let ribbonbar = vizcore.UIElement.GetRibbonbar();
         * ribbonbar.SetVisibleGroup(PanelGroup, true); 그룹 보이기
         * ribbonbar.SetVisibleGroup(PanelGroup, false); 그룹 숨기기
         */
        this.SetVisibleGroup = function (id, visible) {
            let element = scope.ItemsMapAll.get(id);

            if (element) {
                let parentElement = element.element.parentElement;
                let groupSection = undefined // 그룹 구분선 

                for (let i = 0; i < parentElement.childNodes.length; i++) {
                    if (parentElement.childNodes[i] == element.element) {
                        groupSection = parentElement.childNodes[i + 1];  // 부모의 자식노드들 중에서 자기자신 다음에 위치한 childNodes(구분선) 찾아서 할당
                    }
                }

                if (element.element) {
                    if (visible) {
                        element.element.classList.replace("SH_none", "SH_inline_block");
                        groupSection.style.display = ' ';
                    } else {
                        element.element.classList.replace("SH_inline_block", "SH_none");
                        groupSection.style.display = 'none';
                    }
                }

                element.visible = visible;
            }
        }

        /**
        * Ribbonbar Group&Button Enable
        * @param {String} id : Group&Button id
        * @param {boolean} enable : Group&Button enable
        * @example 
        * 
        * let ribbonbar = vizcore.UIElement.GetRibbonbar();
        * ribbonbar.SetEnableButton("ModelTreeTab", true);
        * ribbonbar.SetEnableButton("ModelTreeTab", false);
        */
        this.SetEnableButton = function (id, enable) {
            let element = scope.ItemsMapAll.get(id);

            if (element) {
                if (element.element) {
                    if (enable) {
                        element.element.classList.replace("SH_disable_button", "SH_enable_button");
                    } else {
                        element.element.classList.replace("SH_enable_button", "SH_disable_button");
                    }

                }

                element.enable = enable;
            }
        };

        /**
        * Ribbonbar Button Visible
        * @param {String} id : button id
        * @param {boolean} visible : button visible
        * @example 
        * 
        * let ribbonbar = vizcore.UIElement.GetRibbonbar();
        * ribbonbar.SetVisibleButton("ModelTreeTab", true);
        * ribbonbar.SetVisibleButton("ModelTreeTab", false);
        */
        this.SetVisibleButton = function (id, visible) {
            let element = scope.ItemsMapAll.get(id);
            if (element) {
                if (element.element) {
                    if (visible) {
                        element.element.classList.replace("SH_none", "SH_block");
                    } else {
                        element.element.classList.replace("SH_block", "SH_none");
                    }
                }

                element.visible = visible;
            }
        };

        /**
         * Ribbonbar Tab Selcet
         * @param {String} id : Tab id
         * @example 
         * 
         * let ribbonbar = vizcore.UIElement.GetRibbonbar();
         * ribbonbar.SelectTab("ControlTab");
         */
        this.SelectTab = function (id) {
            let element = scope.ItemsMapAll.get(id);

            if (element === undefined)
                return;

            if (element.element === undefined)
                return;

            if (element.element.tab === undefined)
                return;

            selectTab(element.element.tab);
        }


        /**
         * 리본 폰트 사이즈 설정
         * @param {Number} type 0: small(11px), 1: large(13px)
         * @example  
         * 
         * let ribbonbar = vizcore.UIElement.GetRibbonbar();
         * ribbonbar.SetFontSize(0);
         * ribbonbar.SetFontSize(1);
         */
        this.SetFontSize = function (type) {
            let ribbonbar = vizwideTab.Element.RibbonBar;
            if (type === 0) {
                ribbonbar.className = "VIZWeb SH_ribbon SH_ribbon_div SH_ribbon_font_small SH_block";
            } else {
                ribbonbar.className = "VIZWeb SH_ribbon SH_ribbon_div SH_ribbon_font_large SH_block";
            }
        }

        this.CallbackTabPanel = function (item) {
            let cbTabpanel = function (bool) {
                if (bool) {
                    if (vizwideTab.DockPanel.TabPanelMap.has(item.id)) {
                        let panel = vizwideTab.DockPanel.TabPanelMap.get(item.id);
                        panel.Show(true);
                    } else {
                        if (!vizwideTab.DockPanel.ItemsMap.has(item.uuid)) {
                            vizwideTab.DockPanel.AddTab(item);
                            vizwideTab.DockPanel.SetActiveTab(item.id, bool);
                        }
                    }
                } else {
                    if (vizwideTab.DockPanel.TabPanelMap.has(item.id)) {
                        let panel = vizwideTab.DockPanel.TabPanelMap.get(item.id);
                        panel.Show(false);
                    } else {
                        vizwideTab.DockPanel.DeleteTab(item.id);
                    }
                }
                //scope.TabItemObject.set(item.id, item);
            }

            scope.TabItemObject.set(item.id, item);

            return cbTabpanel;
        };

        /**
         * 버튼 메뉴 object 반환
         * @returns {Array} Ribbon Menu Object 
         * @example
         * 
         * let ribbonbar = vizcore.UIElement.GetRibbonbar();
         * let menus = ribbonbar.GetMenu();
         */
        this.GetMenu = function () {
            let allMenuObjects = [];
            ButtonItemsMap.forEach(value => {

                let type = getOjbectType(value);
                let commonObj = convertCommonObj(type, value);
                allMenuObjects.push(commonObj);
            });

            return allMenuObjects;
        }

        /**
         * 리본바 접기 여부 설정
         * @param {Boolean} expand RibbonBar expand
         * @example
         * 
         * let ribbonbar = vizcore.UIElement.GetRibbonbar();
         * ribbonbar.ExpandRibbon(true); 리본UI 확장(기본값)
         * ribbonbar.ExpandRibbon(false); 리본UI 접힘
         */
        this.ExpandRibbon = function (expand) {
            let ribbonbar = vizwideTab.Element.RibbonBar;
            let expandBtn = vizwideTab.Element.RibbonBar.Button;
            
            if(ribbonbar == undefined || expandBtn == undefined) return;
            
            let img = expandBtn.childNodes[0];

            if (expand) {
                ribbonbar.classList.replace('SH_none', 'SH_block');
                img.style.transform = "rotate(180deg)";
            } else {
                ribbonbar.classList.replace('SH_block', 'SH_none');
                img.style.transform = "";
            }
        }

        /**
         * 리본바 확대/축소 버튼 위치(pos,x) 설정
         * @param {vizcore.UIElement.Enum.EXPAND_BUTTON_POS} pos expandBtn sort position
         * @param {Number} x expandBtn x position px
         * @example
         * 
         * let ribbonbar = vizcore.UIElement.GetRibbonbar();
         * ribbonbar.SetExpandBtnPosition(vizcore.UIElement.Enum.EXPAND_BUTTON_POS.LEFT, 100); LEFT:왼쪽정렬 / CENTER:가운데정렬 / RIGHT:오른쪽정렬 , x축으로 해당 px만큼 이동 
         */
        this.SetExpandBtnPosition = function (pos, x) {
            let expandBtn = vizwideTab.Element.RibbonBar.Button;
            x  = (x !== undefined) ? x : 0; // x가 입력되지 않았을 경우 0값으로 설정

            if(expandBtn == undefined) return;

            if (pos == vizwideTab.Enum.EXPAND_BUTTON_POS.LEFT) {
                expandBtn.style.left = `calc(0% + ${x}px)`;
            } else if (pos == vizwideTab.Enum.EXPAND_BUTTON_POS.CENTER) {
                expandBtn.style.left = `calc(50% + ${x - 16}px)`; // 버튼 위치를 가운데 맞추기 위해서 -16px 적용
            } else if (pos == vizwideTab.Enum.EXPAND_BUTTON_POS.RIGHT) {
                expandBtn.style.left = `calc(100% - ${x + 32}px)`; // 버튼 위치를 오른쪽에 맞추기 위해서 +32px 적용
            }
        }

        /**
         * 리본바 확대/축소 시에 마우스 hover 효과 설정
         * @param {Boolean} enalble 
         * @example
         * 
         * let ribbonbar = vizcore.UIElement.GetRibbonbar();
         * ribbonbar.SetExpandBtnHoverEffect(true); 버튼 효과 적용
         * ribbonbar.SetExpandBtnHoverEffect(false); 버튼 효과 미적용
         */
        this.SetExpandBtnHoverEffect = function (enalble) {
            let expandBtn = vizwideTab.Element.RibbonBar.Button;

            if(expandBtn == undefined) return;

            if (enalble) {
                expandBtn.classList.replace("SH_ribbon_resize_button", "SH_ribbon_resize_button_effect");

            } else {
                expandBtn.classList.replace("SH_ribbon_resize_button_effect", "SH_ribbon_resize_button");
            }
        }
    }
};

export default UI_RibbonBar;
