class WalkthroughPanel {
    /**
     * WalkthroughPanel 생성
     * @param {Object} element HTML Element
     * @example
     * import { VIZCore } from "./VIZCore3D/VIZCore.js";
     * let vizwide3d = new VIZWide3D(view);
     * let view = document.getElementById("view");
     * let walkthroughPanel = new vizwide3d.WalkthroughPanel(view, vizwide3d, VIZCore);
    */
    constructor(view, vizwide3d, VIZCore) {
        let scope = this;

        this.Element = {
            WalkthroughPanel: {
                Top: undefined,
                Middle: undefined,
                Bottom: undefined
            },
        };

        this.ButtonItem = function (button_Parent, button_Id, button_Class, button_Click, button_Icon) {
            let button = {
                parent: button_Parent,
                id: button_Id,
                class: button_Class,
                event: button_Click,
                icon: button_Icon
            }
            return button;
        }

        function createButtonElement(ButtonItem, cbStart, cbEnd) {
            if(!ButtonItem.class){
                ButtonItem.class = '';
            }
            let button_element = document.createElement('div');
            button_element.id = vizwide3d.Main.GetViewID() + ButtonItem.id;
            button_element.className = "VIZWeb SH_walkthrough_panel_button" + ButtonItem.class;
            button_element.innerHTML = "<img src='" + ButtonItem.icon + "'/>";
            ButtonItem.parent.appendChild(button_element);


            if(ButtonItem.id === "Forward" || ButtonItem.id === "Left" || ButtonItem.id === "Right" || ButtonItem.id === "Backward"){
                button_element.style.backgroundColor = "rgb(64, 64, 64)";
            }

            button_element.addEventListener('mousedown', function (e) {
                cbStart();
            });

            button_element.addEventListener('mouseout', function(e){
                cbEnd(e);
            }, false);
            button_element.addEventListener('mouseup', function (e) {
                cbEnd(e);
            });

            button_element.addEventListener('touchstart', function (e) {
                e.preventDefault();
                cbStart();
            });
            button_element.addEventListener('touchend', function (e) {
                e.preventDefault();
                cbEnd(e);
            });
        }

        create();

        function initMenu(){
            let walkthroughPanel = document.createElement('div');
            walkthroughPanel.id = vizwide3d.Main.GetViewID() + 'walkthroughPanel';
            walkthroughPanel.className = "VIZWeb SH_walkthrough_panel_div";
            view.appendChild(walkthroughPanel);

            scope.Element.WalkthroughPanel = walkthroughPanel;

            let walkthroughPanelTop = document.createElement('div');
            walkthroughPanelTop.id = vizwide3d.Main.GetViewID() + 'walkthroughPanelTop';
            walkthroughPanelTop.className = "VIZWeb SH_walkthrough_panel_button_div";
            walkthroughPanel.appendChild(walkthroughPanelTop);

            scope.Element.WalkthroughPanel.Top = walkthroughPanelTop;

            let walkthroughPanelMiddle = document.createElement('div');
            walkthroughPanelMiddle.id = vizwide3d.Main.GetViewID() + 'walkthroughPanelMiddle';
            walkthroughPanelMiddle.className = "VIZWeb SH_walkthrough_panel_button_div";
            walkthroughPanel.appendChild(walkthroughPanelMiddle);

            scope.Element.WalkthroughPanel.Middle = walkthroughPanelMiddle;

            let walkthroughPanelBottom = document.createElement('div');
            walkthroughPanelBottom.id = vizwide3d.Main.GetViewID() + 'walkthroughPanelBottom';
            walkthroughPanelBottom.className = "VIZWeb SH_walkthrough_panel_button_div";
            walkthroughPanel.appendChild(walkthroughPanelBottom);

            scope.Element.WalkthroughPanel.Bottom = walkthroughPanelBottom;

            // 왼쪽으로 회전
            let cbTurnLeftStart = function () {
                vizwide3d.View.Walkthrough.Action(VIZCore.Enum.ACTION_STATE.TURN_LEFT);
            };
            
            let cbTurnLeftEnd = function () {
                vizwide3d.View.Walkthrough.EndAction(VIZCore.Enum.ACTION_STATE.TURN_LEFT);
            };
    
            let turnLeftButton = scope.ButtonItem();
            turnLeftButton.parent = scope.Element.WalkthroughPanel.Top;
            turnLeftButton.id = 'TurnLeft';
            turnLeftButton.icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAA7klEQVRYhe2XwQ2DMBAEl4h/WkgHaYHP9ZF0QCl0EPq4Vypz5MhYjjHGwthHJPaJEDss5z3RKKUgqYuo+xEA2pSbiOgGoAfQAbjnmjJzkwxARA8AA4BrrnFIUQBj/iphPGlxBkzsQ0lzrVgCfSD2N4CRmccaAJ1vzsz+tWzFjqE/7bu9tavkHtgz9k0ApXQC/McuSBUR2d3u9n1Mx/oEuvtN/1dT65pPi4eI6iYQ2HpFN+AMQFJfAFOzTwkOm4AUxM8nkICYzUBtiOAQ1oRYrGINYfpg05F0aznwbFvT0WNYI4nVHigNcf6cygIA+ACUPkUsIlylfwAAAABJRU5ErkJggg==';
            createButtonElement(turnLeftButton, cbTurnLeftStart, cbTurnLeftEnd);

            // 앞으로
            let cbForwardStart = function () {
                vizwide3d.View.Walkthrough.Action(VIZCore.Enum.ACTION_STATE.FORWARD);
            };

            let cbForwardEnd = function () {
                vizwide3d.View.Walkthrough.EndAction(VIZCore.Enum.ACTION_STATE.FORWARD);
            };

            let frontButton = scope.ButtonItem();
            frontButton.parent = scope.Element.WalkthroughPanel.Top;
            frontButton.id = 'Forward';
            frontButton.icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAAwUlEQVRYhe2WbQqEMAxEx8UDeESP1r3JHqE3iizsh5RamslAETog+Kd5rzEQFzPDyDwC7A1ABpBC/u8OEM9mZtn+SWQdSqCEf0NJqOC0hBJOSajhbole+KsBShGJyM3PAFpCAQ9JqOC0hBJOSajhbonyoALukiiXUa6siyeAnVgz++esexml4M1d9dYL89o7m2a94T8ktQ600mu79BaM/BFJMlzA+wnO6W5zK7fuwNVAujozh3AO4RS43RBKBu8XAAefqW4jgq3JuAAAAABJRU5ErkJggg==';
            createButtonElement(frontButton, cbForwardStart, cbForwardEnd);

            // 오른쪽으로 회전
            let cbTurnRightStart = function () {
                vizwide3d.View.Walkthrough.Action(VIZCore.Enum.ACTION_STATE.TURN_RIGHT);
            };

            let cbTurnRightEnd = function () {
                vizwide3d.View.Walkthrough.EndAction(VIZCore.Enum.ACTION_STATE.TURN_RIGHT);
            };

            let turnRightButton = scope.ButtonItem();
            turnRightButton.parent = scope.Element.WalkthroughPanel.Top;
            turnRightButton.id = 'TurnRight';
            turnRightButton.icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABRElEQVRYhe2X0W2DQBBEx5H/4xLSgdOBnY/pI64gLiElkAqcPuYHKojdQUpIKsA66UCnEwcHWUKkeCQ+Dg7msXe7C6u6rrGk7hZ1/wsA63BA0mI9LgBKAIWkz6HJc0RgC+AFwJnk8xIAje4BnIYgfmMPFCQfUhdN09C/rTt20aU3ScfZAQKQMoK4SHrsmjvXErxH421q4iwAkmKApG6V8AYwphdUAI6SzpYAYyLg8vqD5H4pgEbFVDNXKePesE5NlrQKb3SNxQ+TRWXIvHkGybZWDEbAh5xTTCOdgmHbJZMR6NmQlQFMq7F74NtlgoHvIXsJAn0B2Buk4SHsFUkAvwmfglMbf5iZ9wJ4iDJa81dL80GADtPdxELUaZ4FYBCFpHkWQIfpmCj0mmcDRFGofEb82Nwp+6OUpPuo3HgYM/3zv2MAV9HXe96LVZiIAAAAAElFTkSuQmCC';
            createButtonElement(turnRightButton, cbTurnRightStart, cbTurnRightEnd);

            // 위로
            let cbUpStart = function () {
                vizwide3d.View.Walkthrough.Action(VIZCore.Enum.ACTION_STATE.UP);
            };

            let cbUpEnd = function () {
                vizwide3d.View.Walkthrough.EndAction(VIZCore.Enum.ACTION_STATE.UP);
            };

            let upButton = scope.ButtonItem();
            upButton.parent = scope.Element.WalkthroughPanel.Top;
            upButton.id = 'Up';
            upButton.icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABS0lEQVRYhe2Xy23DMBBEx0EKcCdOCb7sPR1IJbgDIRXEJUQd6L6XlCCX4AqSDhQQWAU0zc9yLVgw4AEECBTBeRxSXGkzTRPW1KvVm4i2AL4BjMzcWsd5udF8B6Ahoq+7AQTms8wQVQAJ85sg1AAFczOECkDMh4h5L5cZovgaZmbez7tfDJvU85yyCWjMneTelEQygZJ57BywJBFNoML84hywJJFagrYQe/IcyEBEU8gtgR9nbOYxpTZmchmyb4E/K+U5gAgEcntAXQ2JaFSYX0GUVHMUjxV91Vr9e8BUjpeU+oOEiP6jYuaNtU+o1RN4AjwBHhNA6kKxbWmAs3d/iDz3207aQWv+jFxl6+S+I6JfaZvNO6/voB20JoFjkMIngB+5fPOT9F0WgJndjN8DiFDOfC99lwUQCFeS3wB8BCDO2LVVmTutW44B/AHSebeDkgCRYwAAAABJRU5ErkJggg=='
            createButtonElement(upButton, cbUpStart, cbUpEnd);

            // 왼쪽
            let cbLeftStart = function () {
                vizwide3d.View.Walkthrough.Action(VIZCore.Enum.ACTION_STATE.LEFT);
            };

            let cbLeftEnd = function () {
                vizwide3d.View.Walkthrough.EndAction(VIZCore.Enum.ACTION_STATE.LEFT);
            };

            let leftButton = scope.ButtonItem();
            leftButton.parent = scope.Element.WalkthroughPanel.Middle;
            leftButton.id = 'Left';
            leftButton.icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAA/ElEQVRYheWX6w3CMAyEDybICGxQRmAURusIsEFGCJt0A6NIiUCiIX6lFeKk/Eorf/Y5qXsgIuyp467RfxUgAEgAZheC3AOCFYgo0Uuz8P2PZQleZYLgWpDLHgFMLmUXWtDKnLawYGjwHkAOHpXB36UCsGZuBmgFj8zSqgFCydDquQrAs+HEAN7dLga4OQYXAdSb8NS4p87lFhwnhgWp7A+1oK7WCZBCqAHgVAkTQM8OKcA3rX6OFwAXAPeVvcltEqrqZNI6nrFjB7sCPQDv08HqgU0huA8Og+DOhLUxHyt7aWQT9iphHss0/4Z1Qs6ZX03ZAyoAV/35zymAJ7BJOdZFbxPSAAAAAElFTkSuQmCC';
            createButtonElement(leftButton, cbLeftStart, cbLeftEnd);

            // 오른쪽
            let cbRightStart = function () {
                vizwide3d.View.Walkthrough.Action(VIZCore.Enum.ACTION_STATE.RIGHT);
            };

            let cbRightEnd = function () {
                vizwide3d.View.Walkthrough.EndAction(VIZCore.Enum.ACTION_STATE.RIGHT);
            };

            let rightButton = scope.ButtonItem();
            rightButton.parent = scope.Element.WalkthroughPanel.Middle;
            rightButton.id = 'Right';
            rightButton.class = '_Right';
            rightButton.icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABGUlEQVRYhe1X7QnDIBS8lg6QTZoNmj/dI6M5QkewG9hNssErBSVCzeOeGgKlB0KIH+/enU/xJCI4EudDo/8SAQfAAxjMMz97oLE5WRFEZLCs1zN4golEqwVj4d/VZEejAkPMuARKiR57oIlE+tDgRWQkSPiNNR6tBBKmyk2ZSBSVsBAIpCUmO0oE8gGz0lezJ7ylDCcA94rSXOLcV6HvFk/NtUQNFnyx71EdLIGFqIQaEtRJmCQNFXZoCFsWIJZcDqYELdk7pgryg6Wn/y4fqxGoVYEOzpwDNSrQwRkCFhVMmbMEchW0S0kLTl1GWhv3yNxCoKvnvQlo1y+1xh4PkyeAmR7dwQJnlT1vlw4ZzxvfFP6P02MJAHgDGxNfozJ7RpEAAAAASUVORK5CYII=';
            createButtonElement(rightButton, cbRightStart, cbRightEnd);

            // 아래로
            let cbDownStart = function () {
                vizwide3d.View.Walkthrough.Action(VIZCore.Enum.ACTION_STATE.DOWN);
            };

            let cbDownEnd = function () {
                vizwide3d.View.Walkthrough.EndAction(VIZCore.Enum.ACTION_STATE.DOWN);
            };

            let downButton = scope.ButtonItem();
            downButton.parent = scope.Element.WalkthroughPanel.Middle;
            downButton.id = 'Down';
            downButton.class = '_Down';
            downButton.icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABT0lEQVRYhcWWy23DMBBER0EKcSpwCT7tXa7ALiGlqASrBJ/3kpSQDlyCO5BBgAwoglzu0voMoItEat7yM2Q3TRP21KfWm4gk0j8AAzPfrLWoR6ACEPQLoGfmpxbgQ9tQqROAH0uHJgBm7sID4AvAPfp8JKLrqgAJzIOZewBj9Pp7M4CC6XFzAMvCWwWAiA67AgCIM+AutJtJHUQl+coHvwWDhlUBKqE0MrM6C5YOImeuzoAlAdxZcLaaO+1+Gi49BWZZjmO3zS7K5uq1sPsIiACual85fEWj1N7rv/q4vxkgGvKLAWJmnvZXA/jzPJ5vDUTOPO6fXRNZAH+3S00kCMk8fM+OgpgDws9iMyjMizuiGkTan7aYO1W3YWHOZwur1dzJci3PmgSgFnMTgACRynQimpLQkgOrAFQgzOZNAAWIJnOnt+4DaQ5sDvC2ALwAduPNCAENNWEAAAAASUVORK5CYII=';
            createButtonElement(downButton, cbDownStart, cbDownEnd);


            // 줌 인
            let cbZoomInStart = function () {
                vizwide3d.View.Walkthrough.Action(VIZCore.Enum.ACTION_STATE.ZOOM_IN);
            };

            let cbZoomInEnd = function () {
                vizwide3d.View.Walkthrough.EndAction(VIZCore.Enum.ACTION_STATE.ZOOM_IN);
            };

            let zoomInButton = scope.ButtonItem();
            zoomInButton.parent = scope.Element.WalkthroughPanel.Bottom;
            zoomInButton.id = 'ZoomIn';
            zoomInButton.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAAvklEQVRYhe3XwQnDMAyF4ZeS1TRHO1o7h4ZzUU+lKMayn+RLdQsEvt8OBPtorWHnnBm2iAytSlWP29blA9gekPIJbGu/n0XkCeDuvZu+Az08PcDBX2UBHq6qj5KAUTwlIILTA6K4De1XPIPbUHZgFqcErODLAav4UgADnw5g4VMBTDwcwMZDARn4cEAWbnPi5ww3cJig4TbdHcjGuwEV+GVAFe4GVOJuQCV+FVCG23wOJJGrFDvgfzXbez0H8AbbBIY3klOrmwAAAABJRU5ErkJggg==";
            createButtonElement(zoomInButton, cbZoomInStart, cbZoomInEnd);

            // 뒤로
            let cbBackwardStart = function () {
                vizwide3d.View.Walkthrough.Action(VIZCore.Enum.ACTION_STATE.BACKWARD);
            };

            let cbBackwardEnd = function () {
                vizwide3d.View.Walkthrough.EndAction(VIZCore.Enum.ACTION_STATE.BACKWARD);
            };

            let backButton = scope.ButtonItem();
            backButton.parent = scope.Element.WalkthroughPanel.Bottom;
            backButton.id = 'Backward';
            //backButton.class = '_Backward';
            backButton.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABTUlEQVRYhcWX323CQAzGv1R95zYJI3QERmAERoAN2g0yAiMwAmzACOWRJ6NIOcmi55w/fDSWLB0kZ//875J0IoIl5YP0LYZeAewBJDYWNgO1my8AvgD8eg2yGahJD+Cb2RAB6JQe1P+b/wLQclXrFbPxM+DU6ocLY6R1D2RxT0MrgLta99NIuiQyhp1arwGcVP1v3iy0ysAZwE79djfi4hl4xxSMMniNtD6KwR7HLcdwTPsP+yzAmIGCDiJyFpFkXGc0TbaG0h7LeZYoRHae5Q/EnPMoxLPzIsRzD6wLVeqnEWNeNtK0p2d7wKLOmfBGb9molmCuFEUDRADuJqxFcTJ6gnZeA6iVI0Wd1wCy4aMD4iXnHoCscxBWvxw9tqMzbUk1chaAgXA7ZwE8EK60RwDmIKzxbA5QgqDSrjXydZzP+/F9cPuqkWU/zwE8AJ9u+9SYcJQUAAAAAElFTkSuQmCC";
            createButtonElement(backButton, cbBackwardStart, cbBackwardEnd);

            // 줌 아웃
            let cbZoomOutStart = function () {
                vizwide3d.View.Walkthrough.Action(VIZCore.Enum.ACTION_STATE.ZOOM_OUT);
            };

            let cbZoomOutEnd = function () {
                vizwide3d.View.Walkthrough.EndAction(VIZCore.Enum.ACTION_STATE.ZOOM_OUT);
            };

            let zoomOutButton = scope.ButtonItem();
            zoomOutButton.parent = scope.Element.WalkthroughPanel.Bottom;
            zoomOutButton.id = 'ZoomOut';
            zoomOutButton.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAA00lEQVRYhe2XYQrDIAxG07KjmXO0N9t2jhzOkWKdOGmVmc/C9oEUf71HjKRO3nsamRnNZuY13UMFmPlBRPfwxQoE6BK2y14JiEAG1zxFZKvCrRMgdrKITBXw2AemFTiDmwrUwM0EauEmAi1wE4EWuJVANVzTZRak1/Ao+RXVwGfB5QR+bxznKc6Cb5qqNf8mLB5BxUjtltMKWMI1hwKlwQITaJ1qXQVQ8KIAEv4hgIZr4iwYAdfM9H4uweFRIDwS9isGg2/RI9iXc25N94g19n+AiF4UgtKswW8lYgAAAABJRU5ErkJggg=="
            createButtonElement(zoomOutButton, cbZoomOutStart, cbZoomOutEnd);
        }

        function create() {
            initMenu();
        }

        function show(bool) {
            if (bool === true) {
                scope.Element.WalkthroughPanel.style.display = 'block';
            } else {
                scope.Element.WalkthroughPanel.style.display = 'none';
            }
        }

        /**
         * WalkthroughPanel 보이기/숨기기
         * @param {Boolean} visible 보이기/숨기기
         * @example
         * import { VIZCore } from "./VIZCore3D/VIZCore.js";
         * let vizwide3d = new VIZWide3D(view);
         * let view = document.getElementById("view");
         * let panel = new WalkthroughPanel(view, vizwide3d, VIZCore);
         * walkthroughPanel.Show();
         */
        this.Show = function (visible) {
            show(visible);
        };



        /**
         * WalkthroughPanel 위치 설정(Top)
         * @param {Number} offset Top Offset
         * @example
         * import { VIZCore } from "./VIZCore3D/VIZCore.js";
         * let vizwide3d = new VIZWide3D(view);
         * let view = document.getElementById("view");
         * let walkthroughPanel = new WalkthroughPanel(view, vizwide3d, VIZCore);
         * walkthroughPanel.SetLocationTop(10);
         */
        this.SetLocationTop = function (top) {
            scope.Element.WalkthroughPanel.style.top = top + "px";
        };

        /**
         * WalkthroughPanel 위치 설정(Left)
         * @param {Number} offset Left Offset
         * @example
         * import { VIZCore } from "./VIZCore3D/VIZCore.js";
         * let vizwide3d = new VIZWide3D(view);
         * let view = document.getElementById("view");
         * let walkthroughPanel = new WalkthroughPanel(view, vizwide3d, VIZCore);
         * walkthroughPanel.SetLocationLeft(10);
         */
        this.SetLocationLeft = function (left) {
            scope.Element.WalkthroughPanel.style.left = left + "px";
        };
    }
};

export default WalkthroughPanel;
