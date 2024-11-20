import viewFactory from "./View.js";
import VIZCore from "./ValueObject.js";

import ConfigurationManager from "./Configuration.js";

import IAnimation from "./Manager/IAnimationManager.js";
//import IConfiguration from "./Manager/IConfigurationManager.js";
import IModel from "./Manager/IModelManager.js";
import IModelTree from "./Manager/IModelTreeManager.js";
import IPropertyTree from "./Manager/IPropertyTreeManager.js";
import IObject3D from "./Manager/IObject3DManager.js";
import IReview from "./Manager/IReviewManager.js";
import ISection from "./Manager/ISectionManager.js";
// import IToolbar from "./Manager/IToolbarManager.js";
import IShapeDrawing from "./Manager/IShapeDrawingManager.js";
import IDisassembly from "./Manager/IDisassemblyManager.js";
import IGeometryUtility from "./Manager/IGeometryUtilityManager.js";
import IGroup from "./Manager/IGroupManager.js";
import Toolbar from "./Toolbar.js";
import IView from "./Manager/IViewManager.js";
import IFrame from "./Manager/IFrameManager.js";
import Panel from "./Panel.js";
import ReviewPanel from "./ReviewPanel.js";
import ConfigPanel from "./ConfigPanel.js";
import TransformPanel from "./TransformPanel.js";
import ContextMenu from "./ContextMenu.js";
import Player from "./Player.js";
import ModelSearch from "./ModelSearch.js";
import Watermark from "./Watermark.js";
import Coordinate from "./Coordinate.js";
import WalkthroughPanel from "./WalkthroughPanel.js";
import UIElement from "./UI_Element.js";
import Language from "./Language.js";


// Drawing
import Drawing from "./component/drawing/Sketch.js"

// 자동 실행 구문
//let VIZWeb = (function () {
//    let scope = this;
//    let view = viewFactory;
//    // 은닉될 멤버 정의
//    //let privateKey = 0;
//    //function privateMethod() {
//    //    return privateKey++;
//    //}

//    // 공개될 멤버(특권 메서드) 정의
//    return {
//        init: function (viewContainer) {
//            view.init(viewContainer);
//        },
//    };
//})();



/**
* VIZCore Main Class
* @param {Object} viewContainer HTML Div. (Division) Element
* @example
* // Defalt Example
* <!DOCTYPE html>
* <html xmlns="http://www.w3.org/1999/xhtml">
* <head>
*     <meta charset="utf-8" />
*     <title>VIZWide3D :: SOFTHILLS</title>
*     <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0,user-scalable=no" />
*     <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
*     <link rel="stylesheet" href="VIZCore3D/Resource/css/VIZCore.css">
*     <script type="module">
*         import VIZWide3D from "./VIZCore3D/VIZCore.js";
*         import { VIZCore } from "./VIZCore3D/VIZCore.js";
* 
*         let viewElement = document.getElementById("view");
*         viewElement.className = "VIZCore";
*         let vizwide3d = new VIZWide3D(viewElement);
*         let statusInit = vizwide3d.Init();
* 
*         // When initialization is successful, basic operation is performed
*         if (statusInit === true) {
*             loadModel();
*         }
* 
*         //=======================================
*         // Function :: Load Model (*.vizw)
*         //=======================================
*         function loadModel() {
*             vizwide3d.Model.OpenHeader("./VIZCore3D/Model/WebModel_wh.vizw");
*         }
*     </script>
* </head>
* <body>
*     <div id="view"></div>
* </body>
* </html>
* 
* 
* 
* 
* 
* 
* // Defalt Event Example
* <!DOCTYPE html>
* <html xmlns="http://www.w3.org/1999/xhtml">
* <head>
*     <meta charset="utf-8" />
*     <title>VIZWide3D :: SOFTHILLS</title>
*     <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0,user-scalable=no" />
*     <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
*     <link rel="stylesheet" href="VIZCore3D/Resource/css/VIZCore.css">
*     <script type="module">
*         import VIZWide3D from "./VIZCore3D/VIZCore.js";
*         import { VIZCore } from "./VIZCore3D/VIZCore.js";
* 
*         let viewElement = document.getElementById("view");
*         viewElement.className = "VIZCore";
*         let vizwide3d = new VIZWide3D(viewElement);
*         let statusInit = vizwide3d.Init();
* 
*         //=======================================
*         // Event :: OnModelOpenedEvent
*         //=======================================
*         let OnModelOpenedEvent = function (event) {
*             console.log('Model Opend.');
*         }
* 
*         //=======================================
*         // Event :: OnObject3DSelectedEvent
*         //=======================================
*         let OnObject3DSelected = function (event) {
*             // No Object Selected.
*             if (event.data.id == -1) {
*                 console.log('No Object Selected.');
*             }
*             // Object Selected.
*             else {
*                 // Get Data By Selected Object.
*                 let node = vizwide3d.Object3D.FromID(event.data.id);
*                 let parent = vizwide3d.Object3D.FromID(node.parentId);
* 
*                 let id = node.id;
*                 let index = node.index;
*                 let nodeKind = node.kind;
*                 let nodeKindStr = node.kindStr;
*                 let parentId = node.parentId;
*                 let name = node.name;
*                 let level = node.level;
*                 let boundBox = node.boundBox;
* 
*                 // Get Structure Data
*                 let nodes = vizwide3d.Object3D.GetNodeStructure(
*                     event.data.id   // Node ID
*                     , false         // Direction - True(Top Down), False(Bottom Up) 
*                 );
* 
*                 for (let i = 0; i < nodes.length; i++) {
*                     console.log('Node Name : ' + nodes[i].name);
*                     }
*                 }
*             }
*         }
* 
*         // When initialization is successful, basic operation is performed
*         if (statusInit === true) {
*             initEvent();
* 
*             loadModel();
*         }
*         
* 
*         //=======================================
*         // Function :: Add Event Handler
*         //=======================================
*         function initEvent() {
*             // Add Event Handler : Loading Completed Event 
*             vizwide3d.Model.OnModelOpenedEvent(OnModelOpenedEvent);
* 
*             // Add Event Handler : Object Selected Event
*             vizwide3d.Object3D.OnObject3DSelected(OnObject3DSelected);
*         }
* 
*         //=======================================
*         // Function :: Load Model (*.vizw)
*         //=======================================
*         function loadModel() {
*             vizwide3d.Model.OpenHeader("./VIZCore3D/Model/WebModel_wh.vizw");
*         }
*     </script>
* </head>
* <body>
*     <div id="view"></div>
* </body>
* </html>
*/
class VIZWeb {
    constructor(viewContainer) {
        let scope = this;
        this.Container = viewContainer;
        //this.Main = new viewFactory(viewContainer);
        this.Main = undefined;
        this.Animation = undefined;
        this.Model = undefined;
        this.ModelTree = undefined;
        this.PropertyTree = undefined;
        this.Object3D = undefined;
        this.Review = undefined;
        this.Section = undefined;
        this.Toolbar = Toolbar;
        this.View = undefined;
        this.ConfigurationManager = ConfigurationManager;
        this.Configuration = undefined;
        this.ShapeDrawing = undefined;
        this.Panel = Panel;
        this.ReviewPanel = ReviewPanel;
        this.ConfigPanel = ConfigPanel;
        this.TransformPanel = TransformPanel;
        this.ContextMenu = ContextMenu;
        this.Player = Player;
        this.Search = ModelSearch;
        this.Drawing = undefined;
        this.Watermark = undefined;

        this.useDrawing = false;

        this.Coordinate = Coordinate;
        this.WalkthroughPanel = undefined;
        this.UIElement = undefined;
        this.Language = undefined;
        this.Group = undefined;

        //=======================================
        // Method
        //=======================================
        this.Init = function (option, callback) { 

            let obj = {
                useDrawing : false,
                event : {
                    onInit : undefined,
                    onBefore : undefined,
                    onConfiguration : undefined
                }
            }

            if(typeof(option) === "object")
            {
                if(option.useDrawing !== undefined)
                {
                    this.useDrawing = useDrawing;
                }
                if(option.event !== undefined)
                {
                    if(option.event.onInit !== undefined)
                    {
                        obj.event.onInit = option.event.onInit;
                        if(callback !== undefined)
                            obj.event.onInit = callback;
                    }
                    if(option.event.onBefore){
                        obj.event.onBefore = option.event.onBefore;
                    }

                    if(option.event.onConfiguration){
                        obj.event.onConfiguration = option.event.onConfiguration;
                    }
                }
            }
            else{
                this.useDrawing = option;
            }

            if(this.useDrawing === undefined || this.useDrawing === false)
                {
                    scope.Main = new viewFactory(this.Container);
    
                    scope.Main.Interface = scope;
                    scope.Main.lockDownload = true;
                    scope.Main.onInitCallback.onBefore = obj.event.onBefore;
                    scope.Main.onInitCallback.onInit = obj.event.onInit;
                    scope.Main.onInitCallback.onConfiguration = obj.event.onConfiguration;
                    
                    let resultInit = scope.Main.Init(callback);

                    scope.Language = new Language(VIZCore);

                    scope.Animation = new IAnimation(scope.Main, VIZCore);
                    scope.View = new IView(scope.Main, VIZCore);
                    scope.Model = new IModel(scope.Main, VIZCore);
                    scope.ModelTree = new IModelTree(scope.Main, VIZCore);
                    scope.PropertyTree = new IPropertyTree(scope.Main, VIZCore);
                    scope.Object3D = new IObject3D(scope.Main, VIZCore);
                    scope.Review = new IReview(scope.Main, VIZCore);
                    scope.Section = new ISection(scope.Main, VIZCore);
                    scope.Disassembly = new IDisassembly(scope.Main, VIZCore);
                    //scope.Toolbar = new IToolbar(scope.Main, VIZCore);
                    scope.Frame = new IFrame(scope.Main, VIZCore);
                    scope.ShapeDrawing = new IShapeDrawing(scope.Main, VIZCore);
                    scope.GeometryUtility = new IGeometryUtility(scope.Main, VIZCore);
                    scope.Group = new IGroup(scope.Main, VIZCore);
                    
                    scope.Main.InitMultiView();
                    scope.Main.lockDownload = false;
    
                    scope.Watermark = new Watermark(VIZCore, scope.Main.ctx_review);
                    scope.Watermark.Interface = scope;
    
                    // Walkthrought Panel
                    scope.WalkthroughPanel = new WalkthroughPanel(this.Container, scope, VIZCore);

                    // Transform Panel
                    scope.TransformPanel = new TransformPanel(this.Container, scope, VIZCore);

                    scope.Configuration = scope.Main.Configuration;

                    // UIElement
                    if(scope.Main.DemoType !== 6) {
                        scope.UIElement = new UIElement(scope, VIZCore);
                        scope.UIElement.Init();
                    }

                    return resultInit;
                }
                else
                {
                    scope.Main = undefined;
                    scope.Animation = undefined;
                    scope.Model = undefined;
                    scope.ModelTree = undefined;
                    scope.PropertyTree = undefined;
                    scope.Object3D = undefined;
                    scope.Review = undefined;
                    scope.Section = undefined;
                    scope.Disassembly = undefined;
                    scope.Toolbar = undefined;
                    scope.ReviewPanel = undefined;
                    scope.ConfigPanel = undefined;
                    scope.TransformPanel = undefined;
                    scope.View = undefined;
                    scope.Configuration = undefined;
                    scope.ShapeDrawing = undefined;
                    scope.Panel = undefined;
                    scope.ContextMenu = undefined;
                    scope.Player = undefined;
                    scope.Search = undefined;
                    scope.Coordinate = undefined;
                    scope.Group = undefined;
    
                    
                    scope.Drawing = new Drawing(scope.Container);
                    scope.Drawing.Interface = scope;
                    let context = scope.Drawing.GetContext();
                    scope.Watermark = new Watermark(VIZCore, context);
                    scope.Watermark.Interface = scope;
                    let resultInit = scope.Drawing.Init();
                    
                    return resultInit;
                }
        };

        /**
         * 3D 화면 Rendering 차단
         */
        this.BeginUpdate = function () {
            scope.Main.Renderer.Lock();
        };

        /**
         * 3D 화면 Rendering 차단해제
         */
        this.EndUpdate = function () {
            scope.Main.Renderer.Unlock();
            //scope.Render();
            scope.Main.ViewRefresh(false);
        };

        this.Refresh = function () {
            scope.Main.Renderer.Unlock(0);
        };

        /**
         * 3D 화면 크기 갱신
         */
        this.Resize = function(){
            scope.Main.Resize();
        };

        /**
         * 3D 화면 갱신
         */
        this.Draw = function () {
            scope.Main.Renderer.Render();
        };

        /**
         * 3D 화면 모델 Render
         */
        this.Render = function () {
            scope.Main.ViewRefresh();
        };
        
        /**
         * 화면 반복 그리기 설정
         *  주의) 잦은 렌더링으로 성능 영향이 있습니다.
         * @param {boolean} enable true : 반복그리기, false : Render 시 그리기
         */
        this.SetRepeatRender = function(enable) {
            scope.Main.Renderer.SetRepeatRender(enable);
        };

        /**
         * 화면 반복 그리기 설정 반환
         * @returns {boolean} true : 반복그리기, false : Render 시 그리기
         */
        this.GetRepeatRender = function() {
            return scope.Main.Renderer.GetRepeatRender();
        };

        /**
         * VIZWide3D Element Clear
         * 인스턴스를 새로 생성하기 전 호출해야 함.
         * @example
         * vizwide3d.Clear();
         */
        this.Clear = function() {
            scope.Main.ReleaseViewContainer();
            return;
            //release
            //scope.Main.Renderer.Lock(); //가시화 잠금

            scope.Main.Shader.ReleaseCanvas();



            let element = scope.Main.Container;
            if(element !== undefined)
            {
                while (element.firstChild) {
                    element.removeChild(element.lastChild);
                }
            }

            //scope.Main.Renderer.Unlock();
        };

        /**
         * VIZCore 라이선스 서버 연결
         * 라이선스 서버 연결 상태라면 동작하지 않음
         * @example
         * vizwide3d.Connect();
         */
        this.Connect = function(){
            let connected = scope.Main.Data.IsConnected();
            if(!connected)
            {
                scope.Main.Connect();
                scope.Draw();
            }
        };

        /**
         * VIZCore 라이선스 서버 연결 해제
         * @example
         * vizwide3d.Disconnect();
         */
        this.Disconnect = function () {
            scope.Main.Disconnect();
        };

        this.GetUserInfo = () => {
            let obj = {
                UserName : undefined
            };
            return obj;
        };

        this.SetUserInfo = function(info){
            scope.Main.SetLicenseInfo(info);
        };

    }
}


export default VIZWeb;
export { VIZCore };