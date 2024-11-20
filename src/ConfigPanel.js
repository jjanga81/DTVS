
import TabPanel from "./TabPanel.js";

class ConfigPanel {
    constructor(view, vizwide3d, VIZCore) {
        let scope = this;

        this.ConfigLayer = new Map(); // key: button_element, value:content_element

        this.ConfigLayerItem = new Map(); // key: layerId, value: layer_content_element

        this.GetCofigPanel = undefined; // panel content element

        this.ConfigPanel = undefined;

        let tabPanel = new TabPanel(view, vizwide3d, VIZCore);
        
        function initElement() {
            let home = tabPanel.GetLayerObj();
            home.id = "Home";
            home.text = "CP0002";

            let control = tabPanel.GetLayerObj();
            control.id = "Control";
            control.text = "CP0003";

            // 보류
            let frame = tabPanel.GetLayerObj();
            frame.id = "Frame";
            frame.text = "Frame";

            let model = tabPanel.GetLayerObj();
            model.id = "Model";
            model.text = "CP0004";

            let review = tabPanel.GetLayerObj();
            review.id = "Review";
            review.text = "CP0005";

            let ui = tabPanel.GetLayerObj();
            ui.id = "UI";
            ui.text = "CP0006";

            let tab = tabPanel.GetTabPanelObj();
            tab.id = "Configuration_Panel";
            tab.title = "CP0001";
            tab.top = 500;
            tab.left = 400;
            tab.width = 400;
            tab.height = 570;
            if (vizwide3d.Main.IsVIZWide3DProduct() === true)
                tab.layer = [home, control, model, review, ui];
            else //VIZWeb3D _Fly, Walkthrough 미지원
                tab.layer = [home, model, review, ui];
            tab.show = false;

            tabPanel.CreateTabPanel(tab);

            scope.ConfigLayer = tabPanel.Layer;

            scope.ConfigLayerItem = tabPanel.LayerItems;

            scope.GetCofigPanel = tabPanel.GetTabPanelElement;

            scope.ConfigPanel = tabPanel;

            initPanelHomeItem();
            initPanleControlItem();
            initPanelModelItem();
            initPanelReviewItem();
            initPanelUIItem();
            updateUI();
        }

        function initPanelModelItem() {
            let selection = vizwide3d.Main.Configuration.Model.Selection;

            // LineColor
            let cb_selection_line_color = function (color) {
                selection.LineColor = color;
            };

            let selection_line_color = scope.GetItemObject();
            selection_line_color.id = 'selection_line_color';
            selection_line_color.text = 'CP0034';
            selection_line_color.type = 2;
            selection_line_color.setting = scope.ColorPickSetting(selection.LineColor);
            selection_line_color.callback = cb_selection_line_color;

            // Color
            let cb_selection_color = function (color) {
                selection.Color = color;
            };

            let selection_color = scope.GetItemObject();
            selection_color.id = 'selection_color';
            selection_color.text = 'CP0033';
            selection_color.type = 2;
            selection_color.setting = scope.ColorPickSetting(selection.Color);
            selection_color.callback = cb_selection_color;

            // Thickness
            let cb_selection_thickness = function (value) {
                selection.Thickness = value / 100;
            };

            let selection_thickness = scope.GetItemObject();
            selection_thickness.id = 'selection_thickness';
            selection_thickness.text = 'CP0035';
            selection_thickness.type = 3;
            selection_thickness.setting = scope.SliderSetting(10, 100, selection.Thickness * 100);
            selection_thickness.callback = cb_selection_thickness;

            //Unit
            let cb_selection_unit = function (value) {
                selection.Unit = value;
            };

            let unitItemMap = new Map();

            for (let objKey in VIZCore.Enum.SELECT_UNIT) {
                if (VIZCore.Enum.SELECT_UNIT.hasOwnProperty(objKey)) {
                    unitItemMap.set(VIZCore.Enum.SELECT_UNIT[objKey], objKey);
                }
            }

            let selection_unit = scope.GetItemObject();
            selection_unit.id = 'selection_unit';
            selection_unit.text = 'Unit';
            selection_unit.type = 4;
            selection_unit.setting = scope.SelectboxSetting(unitItemMap.get(selection.Unit), unitItemMap);
            selection_unit.callback = cb_selection_unit;

            //Kind
            let cb_selection_kind = function (value) {
                selection.Kind = value;
            };

            let kindItemMap = new Map();

            for (let objKey in VIZCore.Enum.SelectionObject3DTypes) {
                if (VIZCore.Enum.SelectionObject3DTypes.hasOwnProperty(objKey)) {
                    kindItemMap.set(VIZCore.Enum.SelectionObject3DTypes[objKey], objKey);
                }
            }

            let selection_kind = scope.GetItemObject();
            selection_kind.id = 'selection_kind';
            selection_kind.text = 'kind';
            selection_kind.type = 4;
            selection_kind.setting = scope.SelectboxSetting(kindItemMap.get(selection.Kind), kindItemMap);
            selection_kind.callback = cb_selection_kind;

            //Mode
            let cb_selection_mode = function (value) {
                selection.Mode = value;
                vizwide3d.Object3D.SelectAll(false);
                updateUI(1);          
            };

            let modeItemMap = new Map();
            modeItemMap.set(VIZCore.Enum.SelectionVisibleMode.SHADED, "CP0062");
            modeItemMap.set(VIZCore.Enum.SelectionVisibleMode.EDGE, "CP0063");
            modeItemMap.set(VIZCore.Enum.SelectionVisibleMode.BOUNDBOX, "CP0064");

            let selection_mode = scope.GetItemObject();
            selection_mode.id = 'selection_mode';
            selection_mode.text = 'CP0061';
            selection_mode.type = 4;
            selection_mode.setting = scope.SelectboxSetting(modeItemMap.get(selection.Mode), modeItemMap);
            selection_mode.callback = cb_selection_mode;
        
            let selection_div = scope.GetItemObject();
            selection_div.id = 'Selection';
            selection_div.text = 'CP0032';
            selection_div.type = 0;
            selection_div.tab = "Model";
            selection_div.child = [selection_mode, selection_color, selection_line_color, selection_thickness];

            scope.AddItems(selection_div);

        }

        // type = all = undefined , 1 = selection
        function updateUI(type){
          
            if (type == undefined || type === 1 ){
                let selection = vizwide3d.Main.Configuration.Model.Selection;
                
                let colorGrp = document.getElementById(vizwide3d.Main.GetViewID() + "_config_childselection_color");
                let lineGrp = document.getElementById(vizwide3d.Main.GetViewID() + "_config_childselection_line_color");

                if (colorGrp !== undefined && lineGrp !== undefined){
                    if (selection.Mode == VIZCore.Enum.SelectionVisibleMode.EDGE){
                        colorGrp.style.display = "none";
                        lineGrp.style.display = "block";
                    }
                    else if (selection.Mode == VIZCore.Enum.SelectionVisibleMode.BOUNDBOX){
                        colorGrp.style.display = "block";
                        lineGrp.style.display = "none";
                    }
                    else {
                        colorGrp.style.display = "block";
                        lineGrp.style.display = "block";
                    }
                }
            }

        }

        // 패널 Home에 들어갈 element 생성
        function initPanelHomeItem() {
            let configuration = vizwide3d.Main.Configuration;

            // -----------------------------------------------------Progressive
            let progressive = configuration.Render.Progressive;

            let cb_progressive_limitCount = function (value) {
                let rateVal = (value * 1) / 10000;

                let inputVal = Math.floor(10 * Math.pow(10, 3 * rateVal));

                // 환경설정 변경
                progressive.LimitCount = inputVal;
                // 환경설정 값 적용
                vizwide3d.Main.Renderer.enableRenderLimitCnt = inputVal;
            };

            // 초기 설정 값 구하기
            let inputProgressiveVal = progressive.LimitCount * 1;
            let rateProgressiveVal = Math.floor(Math.log10(inputProgressiveVal / 10) / 3 * 10000);

            vizwide3d.Main.Renderer.enableRenderLimitCnt = inputProgressiveVal;

            let progressive_limitCount = scope.GetItemObject();
            progressive_limitCount.id = 'progressive_limitCount';
            progressive_limitCount.text = 'CP0009';
            progressive_limitCount.type = 3;
            progressive_limitCount.setting = scope.SliderSetting(10, 10000, rateProgressiveVal);
            progressive_limitCount.callback = cb_progressive_limitCount;

            let cb_progressive_enable = function (value) {
                // 환경설정 값 적용
                progressive.Enable = value;
                // 환경설정 변경
                vizwide3d.Main.useRenderLimit = value;
            };

            let progressive_enable = scope.GetItemObject();
            progressive_enable.id = 'progressive_enable';
            progressive_enable.text = 'CP0008';
            progressive_enable.type = 1;
            progressive_enable.callback = cb_progressive_enable;
            progressive_enable.setting = scope.CheckboxSetting(progressive.Enable);

            let progressive_div = scope.GetItemObject();
            progressive_div.id = 'progressive';
            progressive_div.text = 'CP0007';
            progressive_div.type = 0;
            progressive_div.tab = "Home";
            progressive_div.child = [progressive_enable, progressive_limitCount];

            if (vizwide3d.Main.IsVIZWide3DProduct() === true)
                scope.AddItems(progressive_div);

            // -----------------------------------------------------Cache
            let cache = configuration.Render.Cache;

            let cb_cache_limitCount = function (value) {
                let rateVal = (value * 1) / 10000;
                let inputVal = Math.floor(100000 * Math.pow(10, 4 * rateVal));

                // 환경설정 변경
                cache.LimitCount = inputVal;
                // 환경설정 값 적용
                vizwide3d.Main.RenderMeshBlockCacheNum = inputVal;
            };

            // 초기 설정 값 구하기
            let inputVal = cache.LimitCount * 1;
            let rateVal = Math.floor(Math.log10(inputVal / 1000000) / 4 * 10000);

            vizwide3d.Main.RenderMeshBlockCacheNum = inputVal;

            let cache_limitCount = scope.GetItemObject();
            cache_limitCount.id = 'cache_limitCount';
            cache_limitCount.text = 'CP0012';
            cache_limitCount.type = 3;
            cache_limitCount.setting = scope.SliderSetting(1000, 10000, rateVal);
            cache_limitCount.callback = cb_cache_limitCount;

            let cb_cache_enable = function (value) {
                // 환경설정 값 적용
                cache.Enable = value;

                // 환경설정 변경
                vizwide3d.Main.useFramebufferCache = value;
            };

            let cache_enable = scope.GetItemObject();
            cache_enable.id = 'cache_enable';
            cache_enable.text = 'CP0011';
            cache_enable.type = 1;
            cache_enable.callback = cb_cache_enable;
            cache_enable.setting = scope.CheckboxSetting(cache.Enable);

            let cache_div = scope.GetItemObject();
            cache_div.id = 'Cache';
            cache_div.text = 'CP0010';
            cache_div.type = 0;
            cache_div.tab = "Home";
            cache_div.child = [cache_enable, cache_limitCount];

            if (vizwide3d.Main.IsVIZWide3DProduct() === true)
                scope.AddItems(cache_div);

            // -----------------------------------------------------Background
            let background = configuration.Render.Background;

            let cb_background_one_color = function (color) {
                background.OneColor = color;
                vizwide3d.Render();
            };

            let background_one_color = scope.GetItemObject();
            background_one_color.id = 'background_one_color';
            background_one_color.text = 'CP0015';
            background_one_color.type = 2;
            background_one_color.setting = scope.ColorPickSetting(background.OneColor);
            background_one_color.callback = cb_background_one_color;

            let cb_background_two_color = function (color) {
                background.TwoColor = color;
                vizwide3d.Render();
            };

            let background_two_color = scope.GetItemObject();
            background_two_color.id = 'background_two_color';
            background_two_color.text = 'CP0016';
            background_two_color.setting = scope.ColorPickSetting(background.TwoColor);
            background_two_color.type = 2;
            background_two_color.callback = cb_background_two_color;

            let cb_background_mode = function (value) {
                background.Mode = value;
                vizwide3d.Render();
            };

            let backgroundModeMap = new Map();

            
            for (let objKey in VIZCore.Enum.BackgroundModes) {
                switch (objKey) {
                    case 'COLOR_ONE':
                        backgroundModeMap.set(VIZCore.Enum.BackgroundModes[objKey], "RB0110");
                        break;
                    case 'COLOR_TWO_HOR':
                        backgroundModeMap.set(VIZCore.Enum.BackgroundModes[objKey], "RB0111");
                        break;
                    case 'COLOR_TWO_HOR_REVERSE':
                        backgroundModeMap.set(VIZCore.Enum.BackgroundModes[objKey], "RB0112");
                        break;
                    case 'COLOR_TWO_VER':
                        backgroundModeMap.set(VIZCore.Enum.BackgroundModes[objKey], "RB0113");
                        break;
                    case 'COLOR_TWO_VER_REVERSE':
                        backgroundModeMap.set(VIZCore.Enum.BackgroundModes[objKey], "RB0114");
                        break;
                    case 'COLOR_TWO_CHOR':
                        backgroundModeMap.set(VIZCore.Enum.BackgroundModes[objKey], "RB0115");
                        break;
                    case 'COLOR_TWO_CHOR_REVERSE':
                        backgroundModeMap.set(VIZCore.Enum.BackgroundModes[objKey], "RB0116");
                        break;
                    case 'COLOR_TWO_CVER':
                        backgroundModeMap.set(VIZCore.Enum.BackgroundModes[objKey], "RB0117");
                        break;
                    case 'COLOR_TWO_CVER_REVERSE':
                        backgroundModeMap.set(VIZCore.Enum.BackgroundModes[objKey], "RB0118");
                        break;
                    case 'COLOR_TWO_CENTER':
                        backgroundModeMap.set(VIZCore.Enum.BackgroundModes[objKey], "RB0119");
                        break;
                    case 'COLOR_TWO_CORNER':
                        backgroundModeMap.set(VIZCore.Enum.BackgroundModes[objKey], "RB0120");
                        break;
                }
            }

            let background_mode = scope.GetItemObject();
            background_mode.id = 'background_mode';
            background_mode.text = 'CP0014';
            background_mode.type = 4;
            background_mode.setting = scope.SelectboxSetting(backgroundModeMap.get(background.Mode), backgroundModeMap);
            background_mode.callback = cb_background_mode;

            let background_div = scope.GetItemObject();
            background_div.id = 'background';
            background_div.text = 'CP0060';
            background_div.type = 0;
            background_div.tab = "Home";
            background_div.child = [background_mode, background_one_color, background_two_color];

            scope.AddItems(background_div);

            // -----------------------------------------------------Edge
            let edge = configuration.Render.Edge;

            let cb_edge_color = function (color) {
                edge.Color = color;
            };

            let edge_color = scope.GetItemObject();
            edge_color.id = 'edge_color';
            edge_color.text = 'CP0018';
            edge_color.type = 2;
            edge_color.setting = scope.ColorPickSetting(edge.Color);
            edge_color.callback = cb_edge_color;

            let cb_edge_custom_color = function (color) {
                edge.CustomColor = color;
            };

            let edge_custom_color = scope.GetItemObject();
            edge_custom_color.id = 'edge_custom_color';
            edge_custom_color.text = 'CustomColor';
            edge_custom_color.type = 2;
            edge_custom_color.setting = scope.ColorPickSetting(edge.CustomColor);
            edge_custom_color.callback = cb_edge_custom_color;

            let cb_edge_hidden_color = function (color) {
                edge.HiddenColor = color;
            };

            let edge_hidden_color = scope.GetItemObject();
            edge_hidden_color.id = 'edge_hidden_color';
            edge_hidden_color.text = 'HiddenColor';
            edge_hidden_color.type = 2;
            edge_hidden_color.setting = scope.ColorPickSetting(edge.HiddenColor);
            edge_hidden_color.callback = cb_edge_hidden_color;

            let cb_edge_thickness = function (value) {
                edge.Thickness = value / 100;
                vizwide3d.Render();
            };

            let edge_thickness = scope.GetItemObject();
            edge_thickness.id = 'edge_thickness';
            edge_thickness.text = 'CP0019';
            edge_thickness.type = 3;
            edge_thickness.setting = scope.SliderSetting(10, 100, edge.Thickness * 100);
            edge_thickness.callback = cb_edge_thickness;

            let edge_div = scope.GetItemObject();
            edge_div.id = 'Edge';
            edge_div.text = 'CP0017';
            edge_div.type = 0;
            edge_div.tab = "Home";
            edge_div.child = [edge_color, edge_thickness];

            scope.AddItems(edge_div);

            // -----------------------------------------------------Pivot
            let render = vizwide3d.Configuration.Render;

            let cb_pivot_enable_div = function (value) {
                render.Pivot.Visible = value;
            };

            let pivot_enable_div = scope.GetItemObject();
            pivot_enable_div.id = 'pivot_enable_div';
            pivot_enable_div.text = 'CP0021';
            pivot_enable_div.type = 1;
            pivot_enable_div.callback = cb_pivot_enable_div;
            pivot_enable_div.setting = scope.CheckboxSetting(render.Pivot.Visible);

            let cb_pivot_color_div = function (color) {
                render.Pivot.Color = color;
            };

            let pivot_color_div = scope.GetItemObject();
            pivot_color_div.id = 'pivot_color_div';
            pivot_color_div.text = 'CP0022';
            pivot_color_div.type = 2;
            pivot_color_div.setting = scope.ColorPickSetting(render.Pivot.Color);
            pivot_color_div.callback = cb_pivot_color_div;

            let pivot_div = scope.GetItemObject();
            pivot_div.id = 'Pivot_div';
            pivot_div.text = 'CP0020';
            pivot_div.type = 0;
            pivot_div.tab = "Home";
            pivot_div.child = [pivot_enable_div, pivot_color_div];

            scope.AddItems(pivot_div);

            // -----------------------------------------------------Pivot GuideLine
            let cb_pivot_guideline_enable = function (value) {
                render.Pivot.GuideLine.Enable = value;
            };

            let pivot_guideline_enable = scope.GetItemObject();
            pivot_guideline_enable.id = 'pivot_guideline_enable';
            pivot_guideline_enable.text = 'CP0024';
            pivot_guideline_enable.type = 1;
            pivot_guideline_enable.callback = cb_pivot_guideline_enable;
            pivot_guideline_enable.setting = scope.CheckboxSetting(render.Pivot.GuideLine.Enable);

            let cb_pivot_guideline_alpha = function (value) {
                render.Pivot.GuideLine.Alpha = value;
            };

            let pivot_guideline_alpha = scope.GetItemObject();
            pivot_guideline_alpha.id = 'pivot_guideline_alpha';
            pivot_guideline_alpha.text = 'CP0025';
            pivot_guideline_alpha.type = 3;
            pivot_guideline_alpha.setting = scope.SliderSetting(0, 255, render.Pivot.GuideLine.Alpha);
            pivot_guideline_alpha.callback = cb_pivot_guideline_alpha;

            // min, max 임시 1~5
            let cb_pivot_guideline_thickness = function (value) {
                render.Pivot.GuideLine.Thickness = value / 10;
            };

            let pivot_guideline_thickness = scope.GetItemObject();
            pivot_guideline_thickness.id = 'pivot_guideline_thickness';
            pivot_guideline_thickness.text = 'CP0026';
            pivot_guideline_thickness.type = 3;
            pivot_guideline_thickness.setting = scope.SliderSetting(10, 50, render.Pivot.GuideLine.Thickness * 10);
            pivot_guideline_thickness.callback = cb_pivot_guideline_thickness;

            let pivot_guideline_div = scope.GetItemObject();
            pivot_guideline_div.id = 'Pivot_GuideLine_div';
            pivot_guideline_div.text = 'CP0023';
            pivot_guideline_div.type = 0;
            pivot_guideline_div.tab = "Home";
            pivot_guideline_div.child = [pivot_guideline_enable, pivot_guideline_alpha, pivot_guideline_thickness];

            scope.AddItems(pivot_guideline_div);

            // -----------------------------------------------------Compass3D
            let cb_compass3D_enable_div = function (value) {
                render.Compass3D.Visible = value;
            };

            let compass3D_enable_div = scope.GetItemObject();
            compass3D_enable_div.id = 'compass3D_enable_div';
            compass3D_enable_div.text = 'Show';
            compass3D_enable_div.type = 1;
            compass3D_enable_div.callback = cb_compass3D_enable_div;
            compass3D_enable_div.setting = scope.CheckboxSetting(render.Compass3D.Visible);

            let compass3D_div = scope.GetItemObject();
            compass3D_div.id = 'compass3D_div';
            compass3D_div.text = 'Compass3D';
            compass3D_div.type = 0;
            compass3D_div.tab = "Home";
            compass3D_div.child = [compass3D_enable_div];

            // scope.AddItems(compass3D_div);

            // -----------------------------------------------------Compass2D
            let cb_compass2D_enable_div = function (value) {
                render.Compass2D.Visible = value;
            };

            let compass2D_enable_div = scope.GetItemObject();
            compass2D_enable_div.id = 'compass2D_enable_div';
            compass2D_enable_div.text = 'Show';
            compass2D_enable_div.type = 1;
            compass2D_enable_div.callback = cb_compass2D_enable_div;
            compass2D_enable_div.setting = scope.CheckboxSetting(render.Compass2D.Visible);

            let compass2D_div = scope.GetItemObject();
            compass2D_div.id = 'Compass2D_div';
            compass2D_div.text = 'Compass2D';
            compass2D_div.type = 0;
            compass2D_div.tab = "Home";
            compass2D_div.child = [compass2D_enable_div];

            // scope.AddItems(compass2D_div);
        }

        // 패널 Control에 들어갈 element 생성
        function initPanleControlItem() {
            let control = vizwide3d.Main.Configuration.Control;
            // --------------------------------------------Lock
            let cb_control_pivot_lock = function (value) {
                control.Lock = value;
            };

            let control_pivot_lock = scope.GetItemObject();
            control_pivot_lock.id = 'control_pivot_lock';
            control_pivot_lock.text = 'Lock';
            control_pivot_lock.type = 1;
            control_pivot_lock.callback = cb_control_pivot_lock;
            control_pivot_lock.setting = scope.CheckboxSetting(control.Lock);

            let control_pivot = scope.GetItemObject();
            control_pivot.id = 'control_pivot';
            control_pivot.text = 'Pivot';
            control_pivot.type = 0;
            control_pivot.tab = "Control";
            control_pivot.child = [control_pivot_lock];

            //scope.AddItems(control_pivot);

            // --------------------------------------------Rotate
            let cb_rotate_factor = function (value) {
                control.RotateFactor = value;
            };

            let rotate_factor = scope.GetItemObject();
            rotate_factor.id = 'rotate_factor';
            rotate_factor.text = 'Factor';
            rotate_factor.type = 3;
            rotate_factor.callback = cb_rotate_factor;
            rotate_factor.setting = scope.SliderSetting(1, 100, control.RotateFactor);

            let cb_rotate_screenrate = function (value) {
                control.RotateScreenRate = value;
            };

            let rotate_screenrate = scope.GetItemObject();
            rotate_screenrate.id = 'rotate_screenrate';
            rotate_screenrate.text = 'ScreenRate';
            rotate_screenrate.type = 1;
            rotate_screenrate.callback = cb_rotate_screenrate;
            rotate_screenrate.setting = scope.CheckboxSetting(control.RotateScreenRate);

            let rotate_div = scope.GetItemObject();
            rotate_div.id = 'rotate_div';
            rotate_div.text = 'Rotate';
            rotate_div.type = 0;
            rotate_div.tab = "Control";
            rotate_div.child = [rotate_factor, rotate_screenrate];

            // scope.AddItems(rotate_div);

            // --------------------------------------------Fit
            let cb_fit_initfitall = function (value) {
                control.InitFitAll = value;
            };

            let fit_initfitall = scope.GetItemObject();
            fit_initfitall.id = 'fit_initfitall';
            fit_initfitall.text = 'InitFitAll';
            fit_initfitall.type = 1;
            fit_initfitall.callback = cb_fit_initfitall;
            fit_initfitall.setting = scope.CheckboxSetting(control.InitFitAll);

            let cb_fit_marginerate = function (value) {
                control.FitMargineRate = value / 100;
            };

            let fit_marginerate = scope.GetItemObject();
            fit_marginerate.id = 'fit_marginerate';
            fit_marginerate.text = 'FitMargineRate';
            fit_marginerate.type = 3;
            fit_marginerate.callback = cb_fit_marginerate;
            fit_marginerate.setting = scope.SliderSetting(0, 100, control.FitMargineRate * 100);

            let cb_fit_useauto = function (value) {
                control.UseAutoFit = value;
            };

            let fit_useauto = scope.GetItemObject();
            fit_useauto.id = 'fit_useauto';
            fit_useauto.text = 'UseAutoFit';
            fit_useauto.type = 1;
            fit_useauto.callback = cb_fit_useauto;
            fit_useauto.setting = scope.CheckboxSetting(control.UseAutoFit);

            let fit_div = scope.GetItemObject();
            fit_div.id = 'fit_div';
            fit_div.text = 'Fit';
            fit_div.type = 0;
            fit_div.tab = "Control";
            fit_div.child = [fit_useauto, fit_marginerate, fit_initfitall];

            // scope.AddItems(fit_div);

            // --------------------------------------------Fly
            let cb_fly_movementSpeed = function (value) {
                control.Fly.MovementSpeed = value;
            };

            let fly_movementSpeed = scope.GetItemObject();
            fly_movementSpeed.id = 'fly_movementSpeed';
            fly_movementSpeed.text = 'CP0028';
            fly_movementSpeed.type = 3;
            fly_movementSpeed.callback = cb_fly_movementSpeed;
            fly_movementSpeed.setting = scope.SliderSetting(0, 10, control.Fly.MovementSpeed);

            let cb_fly_aroundSpeed = function (value) {
                control.Fly.AroundSpeed = value;
            };

            let fly_aroundSpeed = scope.GetItemObject();
            fly_aroundSpeed.id = 'fly_aroundSpeed';
            fly_aroundSpeed.text = 'CP0029';
            fly_aroundSpeed.type = 3;
            fly_aroundSpeed.callback = cb_fly_aroundSpeed;
            fly_aroundSpeed.setting = scope.SliderSetting(0, 100, control.Fly.AroundSpeed);

            let fly_div = scope.GetItemObject();
            fly_div.id = 'fly_div';
            fly_div.text = 'CP0027';
            fly_div.type = 0;
            fly_div.tab = "Control";
            fly_div.child = [fly_movementSpeed, fly_aroundSpeed];

            scope.AddItems(fly_div);

            // --------------------------------------------Walkthrough
            let cb_walkthrough_enable_div = function (value) {
                vizwide3d.Configuration.Walkthrough.Panel.Visible = value;
            };

            let walkthrough_enable_div = scope.GetItemObject();
            walkthrough_enable_div.id = 'fit_useauto';
            walkthrough_enable_div.text = 'CP0031';
            walkthrough_enable_div.type = 1;
            walkthrough_enable_div.callback = cb_walkthrough_enable_div;
            walkthrough_enable_div.setting = scope.CheckboxSetting(vizwide3d.Configuration.Walkthrough.Panel.Visible);

            let walkthrough_div = scope.GetItemObject();
            walkthrough_div.id = 'Walkthrough_div';
            walkthrough_div.text = 'CP0030';
            walkthrough_div.type = 0;
            walkthrough_div.tab = "Control";
            walkthrough_div.child = [walkthrough_enable_div];

            scope.AddItems(walkthrough_div);

            // --------------------------------------------Zoom
            let cb_zoom_minvalue = function (value) {
                control.Zoom.MinZoomValue = value / 100;
            };

            let zoom_minvalue = scope.GetItemObject();
            zoom_minvalue.id = 'zoom_useFixed';
            zoom_minvalue.text = 'MinZoomValue';
            zoom_minvalue.type = 3;
            zoom_minvalue.callback = cb_zoom_minvalue;
            zoom_minvalue.setting = scope.SliderSetting(0, 100, control.Zoom.MinZoomValue * 100);

            let cb_zoom_ratio = function (value) {
                control.Zoom.Ratio = value / 100;
            };

            let zoom_ratio = scope.GetItemObject();
            zoom_ratio.id = 'zoom_useFixed';
            zoom_ratio.text = 'Ratio';
            zoom_ratio.type = 3;
            zoom_ratio.callback = cb_zoom_ratio;
            zoom_ratio.setting = scope.SliderSetting(0, 100, control.Zoom.Ratio * 100);

            let cb_zoom_useFixed = function (value) {
                control.Zoom.UseFixed = value;
            };

            let zoom_useFixed = scope.GetItemObject();
            zoom_useFixed.id = 'zoom_useFixed';
            zoom_useFixed.text = 'UseFixed';
            zoom_useFixed.type = 1;
            zoom_useFixed.callback = cb_zoom_useFixed;
            zoom_useFixed.setting = scope.CheckboxSetting(control.Zoom.UseFixed);

            let zoom_div = scope.GetItemObject();
            zoom_div.id = 'zoom_div';
            zoom_div.text = 'Zoom';
            zoom_div.type = 0;
            zoom_div.tab = "Control";
            zoom_div.child = [zoom_useFixed, zoom_ratio, zoom_minvalue];

            // scope.AddItems(zoom_div);
        }

        // 패널 Frame에 들어갈 element 생성
        function initPanelFrameItem() {
            let frame = vizwide3d.Main.Configuration.Frame;

            let cb_frame_split_color = function (color) {
                frame.SplitLineColor = color;
            };

            let frame_split_color = scope.GetItemObject();
            frame_split_color.id = 'frame_split_color';
            frame_split_color.text = 'SplitLineColor';
            frame_split_color.type = 2;
            frame_split_color.setting = scope.ColorPickSetting(frame.SplitLineColor);
            frame_split_color.callback = cb_frame_split_color;

            let cb_frame_line_color = function (color) {
                frame.LineColor = color;
            };

            let frame_line_color = scope.GetItemObject();
            frame_line_color.id = 'frame_line_color';
            frame_line_color.text = 'LineColor';
            frame_line_color.type = 2;
            frame_line_color.setting = scope.ColorPickSetting(frame.LineColor);
            frame_line_color.callback = cb_frame_line_color;

            let frame_div = scope.GetItemObject();
            frame_div.id = 'Frame';
            frame_div.text = 'Frame';
            frame_div.type = 0;
            frame_div.tab = "Frame";
            frame_div.child = [];

            scope.AddItems(frame_div);
        }

        // 패널 Review에 들어갈 element 생성
        function initPanelReviewItem() {
            let markUp = vizwide3d.Main.Configuration.Markup;

            let cb_markup_color = function (color) {
                markUp.LineColor = color;
            };

            let markup_color = scope.GetItemObject();
            markup_color.id = 'markup_color';
            markup_color.text = 'CP0037';
            markup_color.type = 2;
            markup_color.setting = scope.ColorPickSetting(markUp.LineColor);
            markup_color.callback = cb_markup_color;

            let cb_markup_width = function (value) {
                markUp.LineWidth = value;
            };

            let markup_width = scope.GetItemObject();
            markup_width.id = 'markup_width';
            markup_width.text = 'CP0038';
            markup_width.type = 3;
            markup_width.setting = scope.SliderSetting(1, 10, markUp.LineWidth);
            markup_width.callback = cb_markup_width;

            let markup_div = scope.GetItemObject();
            markup_div.id = 'markup_div';
            markup_div.text = 'CP0036';
            markup_div.type = 0;
            markup_div.tab = "Review";
            markup_div.child = [markup_color, markup_width];

            scope.AddItems(markup_div);
        }

        // 패널 UI에 들어갈 element 생성
        function initPanelUIItem() {
            let tree = vizwide3d.Main.Configuration.Tree;

            // ui type
            let uiTypeMap = new Map();

            for (let objKey in vizwide3d.UIElement.Enum.UI_TYPE) {
                switch (objKey) {
                    case 'RIBBONBAR':
                        uiTypeMap.set(vizwide3d.UIElement.Enum.UI_TYPE[objKey], "CP0041");
                        break;
                    case 'TOOLBAR':
                        uiTypeMap.set(vizwide3d.UIElement.Enum.UI_TYPE[objKey], "CP0042");
                        break;
                }
            }

            let cb_set_style = function (value) {
                vizwide3d.UIElement.SetType(value);
            };

            let set_style = scope.GetItemObject();
            set_style.id = 'set_style';
            set_style.text = 'CP0040';
            set_style.type = 4;
            set_style.callback = cb_set_style;
            set_style.setting = scope.SelectboxSetting(uiTypeMap.get(vizwide3d.Main.Configuration.Type), uiTypeMap);

            let style_div = scope.GetItemObject();
            style_div.id = 'style_div';
            style_div.text = 'CP0039';
            style_div.type = 0;
            style_div.tab = "UI";
            style_div.child = [set_style];

            scope.AddItems(style_div);

            // theme type
            let themeTypeMap = new Map();

            for (let objKey in vizwide3d.UIElement.Enum.THEME_TYPE) {
                switch (objKey) {
                    case 'LIGHT':
                        themeTypeMap.set(vizwide3d.UIElement.Enum.THEME_TYPE[objKey], "CP0045");
                        break;
                    case 'DARK':
                        themeTypeMap.set(vizwide3d.UIElement.Enum.THEME_TYPE[objKey], "CP0046");
                        break;
                    case 'LIGHT_ORANGE':
                        themeTypeMap.set(vizwide3d.UIElement.Enum.THEME_TYPE[objKey], "CP0047");
                        break;
                    case 'DARK_ORANGE':
                        themeTypeMap.set(vizwide3d.UIElement.Enum.THEME_TYPE[objKey], "CP0048");
                        break;
                }
            }

            let cb_set_theme = function (value) {
                vizwide3d.UIElement.SetMode(value);
            };

            let set_theme = scope.GetItemObject();
            set_theme.id = 'set_theme';
            set_theme.text = 'CP0044';
            set_theme.type = 4;
            set_theme.callback = cb_set_theme;
            set_theme.setting = scope.SelectboxSetting(themeTypeMap.get(0), themeTypeMap);

            let theme_div = scope.GetItemObject();
            theme_div.id = 'theme_div';
            theme_div.text = 'CP0043';
            theme_div.type = 0;
            theme_div.tab = "UI";
            theme_div.child = [set_theme];

            scope.AddItems(theme_div);

            let cb_tree_transparency = function (value) {
                tree.Option.BgTransparency.Value = value;
                vizwide3d.Main.Tree.UpdateBackground();
            };


            let tree_transparency = scope.GetItemObject();
            tree_transparency.id = 'tree_transparency';
            tree_transparency.text = 'CP0050';
            tree_transparency.type = 5;
            tree_transparency.callback = cb_tree_transparency;
            tree_transparency.setting = scope.InputboxrSetting(0, 100, tree.Option.BgTransparency.Value);

            let cb_fontColor = function (value) {
                tree.Style.Font.Color = value;
                vizwide3d.Main.Tree.Render();
            };


            let tree_fontColor = scope.GetItemObject();
            tree_fontColor.id = 'tree_fontColor';
            tree_fontColor.text = 'CP0051';
            tree_fontColor.type = 2;
            tree_fontColor.setting = scope.ColorPickSetting(tree.Style.Font.Color);
            tree_fontColor.callback = cb_fontColor;

            let cb_fontSize = function (value) {
                const maxSize = 20;
                if (value > maxSize)
                    value = maxSize;

                tree.Style.Font.Size = value;
                vizwide3d.Main.Tree.Render();
            };

            let tree_fontSize = scope.GetItemObject();
            tree_fontSize.id = 'tree_fontSize';
            tree_fontSize.text = 'CP0052';
            tree_fontSize.type = 5;
            tree_fontSize.callback = cb_fontSize;
            tree_fontSize.setting = scope.InputboxrSetting(5, 15, tree.Style.Font.Size);

            let modelTree_div = scope.GetItemObject();
            modelTree_div.id = 'modelTree_div';
            modelTree_div.text = 'CP0049';
            modelTree_div.type = 0;
            modelTree_div.tab = "UI";
            modelTree_div.child = [tree_transparency, tree_fontColor, tree_fontSize];


            scope.AddItems(modelTree_div);

            // Ribbon
            let fontsizeMap = new Map();
            fontsizeMap.set(0, "CP0055");
            fontsizeMap.set(1, "CP0056");

            let cb_ribbon_fontSize = function (value) {
                vizwide3d.UIElement.Ribbon.SetFontSize(value);
            };

            let ribbon_fontSize = scope.GetItemObject();
            ribbon_fontSize.id = 'ribbon_fontSize';
            ribbon_fontSize.text = 'CP0054';
            ribbon_fontSize.type = 4;
            ribbon_fontSize.callback = cb_ribbon_fontSize;
            ribbon_fontSize.setting = scope.SelectboxSetting(fontsizeMap.get(0), fontsizeMap);

            let ribbon_div = scope.GetItemObject();
            ribbon_div.id = 'ribbon_div';
            ribbon_div.text = 'CP0053';
            ribbon_div.type = 0;
            ribbon_div.tab = "UI";
            ribbon_div.child = [ribbon_fontSize];

            scope.AddItems(ribbon_div);

            let languageMap = new Map();

            for (let objKey in VIZCore.Enum.LANGUAGE_KEY) {
                switch (objKey) {
                    case "KOREAN":
                        languageMap.set(VIZCore.Enum.LANGUAGE_KEY[objKey], "CP0059");
                        break;
                    case "ENGLISH":
                        languageMap.set(VIZCore.Enum.LANGUAGE_KEY[objKey], "CP0058");
                        break;
                }
            }

            let cb_ui_language = function (value) {
                // console.log(value) // 함수 작동 확인 용 consoleLog
                vizwide3d.UIElement.SetLanguage(value);

            };

            let ui_language = scope.GetItemObject();
            ui_language.id = 'ui_language';
            ui_language.text = 'CP0057';
            ui_language.type = 4;
            ui_language.callback = cb_ui_language;
            ui_language.setting = scope.SelectboxSetting(languageMap.get(vizwide3d.Main.Configuration.Language), languageMap);

            let ui_div = scope.GetItemObject();
            ui_div.id = 'ribbon_div';
            ui_div.text = 'CP0057';
            ui_div.type = 0;
            ui_div.tab = "UI";
            ui_div.child = [ui_language];

            scope.AddItems(ui_div);
        }

        // item type이 1인 경우 checkbox 생성
        function checkBox() {
            let element = document.createElement("div");
            element.type = "button";
            element.className = "VIZWeb SH_config_panel_checkbox SH_check_icon_color";

            return element;
        }

        // item type이 2인 경우 color pick 생성
        function color_picker(setting) {
            // let element = document.createElement("input");
            // element.type = "color";
            // element.value = setting;
            // element.className = "VIZWeb SH_config_panel_colorpicker";

            let element = document.createElement("div");
            element.className = "VIZWeb SH_config_panel_colorpicker";

            let color = document.createElement("div");
            color.className = "VIZWeb SH_config_panel_colorpicker_color";
            color.style.backgroundColor = setting;

            element.appendChild(color);

            return element;
        }

        // item type이 3인 경우 slider 생성
        function slider(setting) {

            let div = document.createElement("div");
            div.className = "VIZWeb SH_config_panel_slider_div";

            let element = document.createElement("input");
            element.type = "range";
            if (setting) {
                element.min = setting.min;
                element.max = setting.max;
                element.value = setting.value;
            } else {
                element.min = 0;
                element.max = 100;
                element.value = 0;
            }
            element.className = "VIZWeb SH_config_panel_slider";
            div.appendChild(element);

            return div;
        }

        // item type이 4인 경우 selectbox 생성
        function selectbox(setting) {
            let field = document.createElement('div');
            field.className = "VIZWeb SH_config_panel_selectbox";

            let field_img = document.createElement('div');
            field_img.id = "config_child_type_select_field_img";
            field_img.className = "VIZWeb SH_config_panel_selectbox_img SH_arrow_icon";
            field.appendChild(field_img);


            let field_text = document.createElement('div');
            field_text.id = "config_child_type_select_field_text";
            field_text.className = "VIZWeb SH_config_panel_selectbox_text";
            field_text.innerText = setting.value;
            field_text.setAttribute("data-language", setting.value);

            field.appendChild(field_text);



            let field_child_group = document.createElement('div');
            field_child_group.id = "config_child_type_select_field_group";
            field_child_group.className = "VIZWeb SH_config_panel_selectbox_group";
            setting.child.forEach(function (value, key) {
                let field_child = document.createElement('div');
                field_child.id = value;
                field_child.value = key;
                field_child.className = "VIZWeb SH_config_panel_selectbox_child";

                // 텍스트
                let field_child_text = document.createElement('div');
                field_child_text.textContent = value;
                field_child_text.setAttribute("data-language", value);
                field_child_text.className = "VIZWeb SH_config_panel_selectbox_child_text";
                field_child.appendChild(field_child_text);

                field_child_group.appendChild(field_child);
            });

            field.appendChild(field_child_group);

            let isclick = false;
            // 체크 박스 이외의 영역 선택 시 체크박스 닫기
            window.addEventListener("click", function (e) {
                if (e.target !== field && e.target !== field_text && e.target !== field_img) {
                    field_child_group.style.display = "";
                    field_img.style.transform = "";
                    isclick = false;
                }
            });


            field.addEventListener('click', function () {
                isclick = !isclick;
                if (isclick) {
                    field_child_group.style.display = "block";
                    field_img.style.transform = "rotate(180deg)";
                }
                else {
                    field_child_group.style.display = "";
                    field_img.style.transform = "";
                }
            });

            return field;
        }

        // item type이 5인 경우 Inputbox 생성
        function inputbox(setting) {

            let element = document.createElement("input");
            element.className = "VIZWeb SH_config_panel_input";

            if (setting) {
                element.min = setting.min;
                element.max = setting.max;
                element.value = setting.value;
            } else {
                element.min = 0;
                element.max = 100;
                element.value = 0;
            }
            element.setAttribute("autocomplete", "off");
            element.setAttribute("type", "number");

            return element;
        }

        // 색상 hex인 경우 rgb로 변경
        function hexToRgb(hexType) {
            //"#" 기호를 삭제
            var hex = hexType.trim().replace("#", "");

            // rgb로 각각 분리해서 배열에 담기
            var rgb = (3 === hex.length) ?
                hex.match(/[a-f\d]/gi) : hex.match(/[a-f\d]{2}/gi);

            rgb.forEach(function (str, x, arr) {
                // rgb 각각의 헥사값이 한자리일 경우, 두자리로 변경
                if (str.length == 1) str = str + str;

                // 10진수로 변환
                arr[x] = parseInt(str, 16);
            });
            // return rgb.join(", ") + ", " + 255; 
            let rgbObject = { r: rgb[0], g: rgb[1], b: rgb[2] };
            return rgbObject;
        }

        // 색상 rgb인 경우 hex로 변경
        function rgbToHex(rgbType) {
            var rgb = rgbType.replace(/[^%,.\d]/g, "").split(",");

            rgb.forEach(function (str, x, arr) {

                /* 컬러값이 "%"일 경우, 변환하기. */
                if (str.indexOf("%") > -1) str = Math.round(parseFloat(str) * 2.55);

                /* 16진수 문자로 변환하기. */
                str = parseInt(str, 10).toString(16);
                if (str.length === 1) str = "0" + str;

                arr[x] = str;
            });

            return "#" + rgb.join("");
        }

        let init = function () {
            initElement();
        };

        /**
         * Checkbox 기본셋팅
         * @param {boolean} value 
         */
        this.CheckboxSetting = function (value) {
            let setItem = {
                value: value
            }

            return setItem;
        };

        /**
         * ColorPick 기본셋팅
         * @param {VIZCore.Color} color
         */
        this.ColorPickSetting = function (color) {
            let setItem = {
                value: color,  // viz rgba
            }

            return setItem;
        };

        /**
         * Slider 기본셋팅
         * @param {Number} min // 최솟값
         * @param {Number} max // 최댓값  
         * @param {Number} value // 초기값
         */
        this.SliderSetting = function (min, max, value) {
            let setItem = {
                min: min,
                max: max,
                value: value
            }

            return setItem;
        };

        /**
         * Selectbox 기본셋팅
         * @param {String} value // 초기값
         * @param {Array} child // selectbox에 들어갈 값
         */
        this.SelectboxSetting = function (value, child) {
            let setItem = {
                value: value,
                child: child
            }
            return setItem;
        };

        /**
        * inputbox 기본셋팅
        * @param {Number} min // 최솟값
        * @param {Number} max // 최댓값  
        * @param {Number} value // 초기값
        */
        this.InputboxrSetting = function (min, max, value) {
            let setItem = {
                min: min,
                max: max,
                value: value
            }

            return setItem;
        };

        /**
         * item object
         * @param {String} id : item id
         * @param {String} text : item text
         * @param {Number} type : item type(0: parent, 1: checkbox, 2: colorpicker 3: slider, 4: selectbox)
         * @param {String} tab : tab id
         * @param {Object} callback : callback
         * @param {Object} setting : item setting
         * @param {Array} child : item child
         * @example
         * 
         * let cb_child = function(value){
         *      console.log(value);
         * }
         * 
         * let child = scope.GetItemObject();
         * child.id = 'Child';
         * child.text = 'Child';
         * child.type = 1;
         * child.setting = scope.CheckboxSetting(false);
         * child.callback = cb_child;
         * 
         * let parent = scope.GetItemObject();
         * parent.id = 'Parent';
         * parent.text = 'Parent';
         * parent.type = 0;
         * parent.tab = "Home";
         * parent.child = [child];
         * 
         * scope.AddItems(parent);
         */
        this.GetItemObject = function () {
            let item = {
                id: undefined,
                text: undefined,
                type: undefined,    // 타입이름
                tab: undefined,   // 탭 아이디
                callback: undefined,
                setting: undefined,
                child: [],
            };

            return item;
        };

        /**
         * ...
         * @param {object} item
         * @example
         * 
         * let cb_child = function(value){
         *      console.log(value);
         * }
         * 
         * let child = scope.GetItemObject();
         * child.id = 'Child';
         * child.text = 'Child';
         * child.type = 1;
         * child.setting = scope.CheckboxSetting(false);
         * child.callback = cb_child;
         * 
         * let parent = scope.GetItemObject();
         * parent.id = 'Parent';
         * parent.text = 'Parent';
         * parent.type = 0;
         * parent.tab = "Home";
         * parent.child = [child];
         * 
         * scope.AddItems(parent);
         */
        this.AddItems = function (item) {
            if (scope.ConfigLayerItem.get(item.tab)) {
                let layer_content = scope.ConfigLayerItem.get(item.tab);

                // 타입이 0 -> 부모
                let parent_content = document.createElement('div');
                parent_content.id = vizwide3d.Main.GetViewID() + "_config" + item.id;
                parent_content.className = "VIZWeb SH_config_panel_group";
                layer_content.appendChild(parent_content);

                let parent_text_content = document.createElement('div');
                parent_text_content.textContent = item.text;
                parent_text_content.setAttribute("data-language", item.text);
                parent_text_content.className = "VIZWeb SH_config_panel_group_text";
                parent_content.appendChild(parent_text_content);

                for (let index = 0; index < item.child.length; index++) {
                    const child = item.child[index];
                    let child_content = document.createElement('div');
                    child_content.id = vizwide3d.Main.GetViewID() + "_config_child" + child.id;
                    child_content.className = "VIZWeb SH_config_panel_item";
                    parent_content.appendChild(child_content);

                    let child_text_content = document.createElement('div');
                    child_text_content.id = vizwide3d.Main.GetViewID() + "_config_child_text" + child.id;
                    child_text_content.textContent = child.text;
                    child_text_content.setAttribute("data-language", child.text);
                    child_text_content.className = "VIZWeb SH_config_panel_item_text";
                    child_content.appendChild(child_text_content);

                    let child_type_content = document.createElement('div');
                    child_type_content.id = vizwide3d.Main.GetViewID() + "_config_child_type" + child.id;
                    child_type_content.className = "VIZWeb SH_config_panel_item_input";
                    child_content.appendChild(child_type_content);

                    switch (child.type) {
                        case 1:
                            let checkBox_element = checkBox();
                            child_type_content.appendChild(checkBox_element);

                            let settingValue = false;

                            if (child.setting) {
                                settingValue = child.setting.value;
                            }

                            if (settingValue) {
                                checkBox_element.className = "VIZWeb SH_config_panel_checkbox SH_check_icon_color";
                            } else {
                                checkBox_element.className = "VIZWeb SH_config_panel_checkbox SH_uncheck_icon_color";
                            }

                            checkBox_element.addEventListener('click', function () {
                                if (settingValue) {
                                    checkBox_element.className = "VIZWeb SH_config_panel_checkbox SH_uncheck_icon_color";
                                } else {
                                    checkBox_element.className = "VIZWeb SH_config_panel_checkbox SH_check_icon_color";
                                }
                                settingValue = !settingValue;
                                child.callback(settingValue);
                            });
                            break;
                        case 2:
                            let settingColor = "#000000";
                            if (child.setting) {
                                let rgb = "rgb(" + child.setting.value.r + "," + child.setting.value.g + "," + child.setting.value.b + ")";
                                settingColor = rgbToHex(rgb);
                            }

                            let colorpicker_element = color_picker(settingColor);
                            child_type_content.appendChild(colorpicker_element);
                            // colorpicker_element.addEventListener('input', function () {
                            //     let rgbColor = hexToRgb(colorpicker_element.value);
                            //     let vizrgbColor = new VIZCore.Color(rgbColor.r, rgbColor.g, rgbColor.b, 255);
                            //     child.callback(vizrgbColor);
                            // });
                            colorpicker_element.addEventListener('click', function () {
                                let cbBackground = function () {
                                    let selectColor = new VIZCore.Color();
                                    selectColor = vizwide3d.Main.ColorPicker.GetPickColor();

                                    child.callback(selectColor);

                                    // 배경색 선택 색상으로 변경
                                    let setColorElement = colorpicker_element.childNodes[0];
                                    setColorElement.style.backgroundColor = "rgb(" + selectColor.r + "," + selectColor.g + "," + selectColor.b + ")";

                                    vizwide3d.Main.ColorPicker.Show(false);
                                    child.setting.value = selectColor;
                                };

                                vizwide3d.Main.ColorPicker.Show(false);
                                vizwide3d.Main.ColorPicker.Show(true);
                                vizwide3d.Main.ColorPicker.SetColor(child.setting.value);
                                vizwide3d.Main.ColorPicker.Callback = cbBackground;

                            });
                            break;
                        case 3:
                            let slider_div = slider(child.setting);
                            child_type_content.appendChild(slider_div);

                            let slider_element = slider_div.childNodes[0];
                            slider_element.addEventListener('change', function () {
                                child.callback(slider_element.value);
                            });
                            break;
                        case 4:
                            if (!child.setting) {
                                break;
                            }
                            let selectbox_element = selectbox(child.setting);
                            child_type_content.appendChild(selectbox_element);

                            let field_text = selectbox_element.childNodes[1];
                            let field_group = selectbox_element.childNodes[2];
                            for (let index = 0; index < field_group.childNodes.length; index++) {
                                const element = field_group.childNodes[index];
                                element.addEventListener('click', function () {
                                    // 선택한 값 추가- 이전 값과 같을 시 이벤트 발생X
                                    if (field_text.textContent.localeCompare(element.value) !== 0) {
                                        field_text.textContent = element.id;
                                        child.callback(element.value);
                                        field_text.setAttribute("data-language", element.id);
                                        vizwide3d.UIElement.SetLanguage(vizwide3d.Configuration.Language);
                                    }
                                });
                            }
                            break;
                        case 5:
                            let inputbox_element = inputbox(child.setting);
                            child_type_content.appendChild(inputbox_element);

                            inputbox_element.addEventListener('change', function () {

                                if (inputbox_element.value > child.setting.max)
                                    inputbox_element.value = child.setting.max;

                                if (inputbox_element.value < child.setting.min)
                                    inputbox_element.value = child.setting.min;

                                child.callback(inputbox_element.value);
                            });
                            break;
                    }
                }
            }
        };

        this.OnCloseButtonEvent = function (event) {
            scope.ConfigPanel.OnCloseButtonEvent(event);
        };

        this.Show = function (bool) {
            scope.ConfigPanel.Show(bool);
        };

        init();
    }
}
export default ConfigPanel;