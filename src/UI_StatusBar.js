class UI_StatusBar {
    constructor(vizwideTab, vizcore) {
        let scope = this;

        /**
         * StatusBar Message
         * @param {String} text : text
         * @param {Boolean} bool : timeout
         * @example  
         * 
         * let statusBar = vizcore.UIElement.GetRibbonbar();
         * 
         * statusBar.SetMessage("NORMAL", true, vizcore.UIElement.Enum.STATUS_TYPE.NORMAL);
         * statusBar.SetMessage("INFO", true, vizcore.UIElement.Enum.STATUS_TYPE.INFO);
         * statusBar.SetMessage("WARNING", true, vizcore.UIElement.Enum.STATUS_TYPE.WARNING);
         */
        this.SetMessage = function (text, bool, type) {
            vizwideTab.Element.StatusBar.innerText = text;
            vizwideTab.Element.StatusBar.setAttribute("data-language", text);
            vizwideTab.SetLanguage(vizcore.Configuration.Language);
            switch(type){
                case 0: // normal
                    vizwideTab.Element.StatusBar.style.backgroundColor = "";
                    break;
                case 1: // info
                    vizwideTab.Element.StatusBar.style.backgroundColor = "#0000ff";
                    break;
                case 2: // warning
                    vizwideTab.Element.StatusBar.style.backgroundColor = "#ff0000";
                    break;
                default:
                    vizwideTab.Element.StatusBar.style.backgroundColor = "";
                    break;
            }

            if (bool) {
                setTimeout(() => {
                    vizwideTab.Element.StatusBar.innerText = "";
                    vizwideTab.Element.StatusBar.style.backgroundColor = "";
                    vizwideTab.Element.StatusBar.setAttribute("data-language", "");
                    vizwideTab.SetLanguage(vizcore.Configuration.Language);
                }, 5000);
            }
        };

        /**
         * StatusBar 보이기/숨기기
         * @param {Boolean} show : StatusBar Show
         * @example  
         * 
         * let statusbar = vizcore.UIElement.GetStatusbar();
         * 
         * statusbar.Show(true);
         * statusbar.Show(false);
         */
        this.Show = function (show) {
            if (show) {
                vizwideTab.Element.StatusBar.style.display = "block";
            } else {
                vizwideTab.Element.StatusBar.style.display = "none";
            }
        }

        /**
         * StatusBar BackgroundColor
         * @param {Number} r : Red(0~255)
         * @param {Number} g : Green(0~255)
         * @param {Number} b : Blue(0~255)
         * @param {Number} a : Alpha(0~255)
         * @example  
         * 
         */
        this.SetBackgroundColorFromRGBA = function (r, g, b, a) {
            vizwideTab.Element.StatusBar.style.backgroundColor = "rgba(" + r + "," + g + "," + b + "," + a / 255 + ")";
        };
    }
};

export default UI_StatusBar;
