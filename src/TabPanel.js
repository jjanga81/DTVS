class TabPanel {
    constructor(view, vizwide3d, VIZCore) {
        let scope = this;

        this.TabPanel = undefined;

        this.TabPanelLayerContent = [];

        this.LayerItems = new Map();  // key: layerId, value: layer_content_element

        this.GetTabPanelElement = undefined;

        this.TabPanelLayerMap = new Map(); // key: button_element, content_element

        let getTabButtonMap = new Map(); // key: layerId,  value: layer_button

        this.CreateTabPanel = function(tab){
            const color = { r: 240, g: 240, b: 240, a: 255 };
            // 패널 설정

            let panel = new vizwide3d.Panel(view);
            panel.id = tab.id;
            panel.SetTitleText(tab.title);
            panel.SetContentBackgroundColor(color);
            panel.SetSize(tab.width, tab.height);
            panel.SetLocationLeft(tab.left);
            panel.SetLocationTop(tab.top);
            panel.Show(tab.show);

            scope.TabPanel = panel;

            scope.AddLayers(tab.layer);
        };

        this.GetTabPanelObj = function(){
            let item = {
                id: undefined,
                title: undefined,
                top: undefined,
                left: undefined,
                width: undefined,
                height: undefined,
                show : false,
                layer: [],
                usePanel: false
            }
            return item;
        };

        // 레이어 생성 시 필요한 정보
        this.GetLayerObj = function(){
            let layer = {
                id: undefined,
                content: undefined,
                text: undefined,
            }
            return layer;
        };

        // 레이어 추가
        this.AddLayers = function(layers){
            const element = document.createElement('div');

            const layer_buttons = document.createElement('div');
            layer_buttons.className = "VIZWeb SH_tab_panel_button_div";
            element.appendChild(layer_buttons); 

            for (let index = 0; index < layers.length; index++) {
                const layer_id = layers[index].id;
                const layer_text = layers[index].text;
                let layer_content = layers[index].content;

                const layer = document.createElement('div');
                layer.id = vizwide3d.Main.GetViewID() + "_review" + layer_id;
                layer.className = "VIZWeb SH_tab_panel_content_div";

                if (!layer_content) {
                    layer_content = document.createElement('div');
                    layer_content.id = vizwide3d.Main.GetViewID() + "SH_tabPanel_content" + layer_id;
                    layer_content.className = "VIZWeb SH_tab_panel_content";
                }
                layer.appendChild(layer_content);

                scope.TabPanelLayerContent.push(layer);
    
                const layer_button = document.createElement('div');
                layer_button.id = vizwide3d.Main.GetViewID() + "SH_tabPanel_button" + layer_id;
                layer_button.className = "VIZWeb SH_tab_panel_button SH_tab_panel_uncheck";
                layer_button.textContent = layer_text;
                layer_button.setAttribute("data-language", layer_text);
                layer_buttons.appendChild(layer_button);

                const layer_button_sub = document.createElement('div');
                layer_button_sub.className = "VIZWeb SH_tab_panel_side_button";
                layer_button.appendChild(layer_button_sub);

                if(index === 0){
                    layer.style.display = "block";
                    layer_button_sub.style.display = "block";

                    layer_button.classList.replace("SH_tab_panel_uncheck", "SH_tab_panel_check");
                }

                scope.TabPanelLayerMap.set(layer_button, layer);

                getTabButtonMap.set(layer_id, layer_button);

                element.appendChild(layer);

                scope.LayerItems.set(layer_id, layer_content);
            }
            
            layer_buttons.addEventListener('click', function(e){
                if(e.target === layer_buttons) return;
                scope.TabPanelLayerMap.forEach((content, btn) => {
                    // console.log(btn.lastChild)
                    if(btn === e.target){
                        btn.classList.replace("SH_tab_panel_uncheck", "SH_tab_panel_check");
                        if(content){
                            content.style.display = "block";
                        }
                        // btn.lastChild.style.display = "block";
                    } else {
                        btn.classList.replace("SH_tab_panel_check", "SH_tab_panel_uncheck");
                        if(content){
                            content.style.display = "none";
                        }
                        // btn.lastChild.style.display = "";
                    }
                });
            });


            scope.TabPanel.SetContent(element);  

            scope.GetTabPanelElement = element;
        };

        // 보이기/숨기기
        this.Show = function(bool){
            if(bool === true){
                scope.TabPanel.Show(true);
            } else {
                scope.TabPanel.Show(false);
            }
        };

        // X 버튼 
        this.OnCloseButtonEvent = function(event){
            scope.TabPanel.OnCloseButtonEvent(event);
        };

        // Tab 
        this.SetFocusTab = function(id) {
            let tab = getTabButtonMap.get(id);
            scope.TabPanelLayerMap.forEach((content, btn) => {
                if (tab === btn) {
                    btn.classList.replace("SH_tab_panel_uncheck", "SH_tab_panel_check");
                    if (content) {
                        content.style.display = "block";
                    }
                    // btn.lastChild.style.display = "block";
                } else {
                    btn.classList.replace("SH_tab_panel_check", "SH_tab_panel_uncheck");
                    if (content) {
                        content.style.display = "none";
                    }
                    // btn.lastChild.style.display = "";
                }
            });
        }
    }
}
export default TabPanel;