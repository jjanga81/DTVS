class Message {
    constructor(UI) {
        let scope = this;
        let view = UI.GetViewElement();

        let itemMap = new Map(); // key: id, value: item object

        function create(item){
            if(item.id === undefined || item.text === undefined){
                return;
            }

            let color = item.font.color;

            let message = document.createElement('div');
            message.id = "SH_message" + item.id;
            message.className = "VIZWeb SH_message";
            message.innerText = item.text;

            message.style.left = item.pos.left + "px";
            message.style.top = item.pos.top + "px";
            message.style.fontSize = item.font.size + "px";
            if(color === undefined){
                message.style.color = "rgb(0, 0, 0)";
            } else {
                message.style.color = "rgb(" + color.r + "," + color.g + "," + color.b + ")";
            }
            view.appendChild(message);

            item.element = message;

            itemMap.set(item.id, item);
        };

        /**
        * Message Show
        * @param {Object} object : object
        * @example 
        * let message = vizcore.UIElement.GetMessage();
        * 
        * let item = message.GetObject();
        * item.id = "item";
        * item.text = "TEXT";
        * item.pos.top = 0;
        * item.pos.left = 0;
        * item.font.size = 16;
        * item.font.color = new VIZCore.Color(255, 0, 0, 255);
        * 
        * message.Show(item);
        */
        this.Show = function(item){
            create(item);
        };

        /**
        * Message Clear
        * @param {String} id : id
        * @example 
        * let message = vizcore.UIElement.GetMessage();
        * 
        * let item = message.GetObject();
        * item.id = "item";
        * item.text = "TEXT";
        * item.pos.top = 0;
        * item.pos.left = 0;
        * item.font.size = 16;
        * item.font.color = new VIZCore.Color(255, 0, 0, 255);
        * 
        * message.Clear(item.id);
        */
        this.Clear = function(id){
            let item = itemMap.get(id);
            
            if(item === undefined){
                return;
            }

            item.element.remove();
            itemMap.delete(item.id);

        };

        /**
        * Message Clear All
        * @example 
        * let message = vizcore.UIElement.GetMessage();
        * 
        * message.ClearAll();
        */
        this.ClearAll = function(){

            itemMap.forEach(value =>{
                value.element.remove();
            });


            itemMap.clear();
        };

        /**
        * Message Text Update
        * @param {String} id : id
        * @param {String} text : text
        * @example 
        * let message = vizcore.UIElement.GetMessage();
        * 
        * let item = message.GetObject();
        * item.id = "item";
        * item.text = "TEXT";
        * item.pos.top = 0;
        * item.pos.left = 0;
        * item.font.size = 16;
        * item.font.color = new VIZCore.Color(255, 0, 0, 255);
        * 
        * message.Show(item);
        * 
        * message.UpdateText(item.id, "UPDATE");
        */
        this.UpdateText = function(id, text) {
            let item = itemMap.get(id);
            
            if(item === undefined){
                return;
            }

            item.element.innerText = text;
        }

        /**
        * Message Text Update
        * @param {String} id : id
        * @param {String} text : text
        * @example 
        * let message = vizcore.UIElement.GetMessage();
        * 
        * let item = message.GetObject();
        * item.id = "item";
        * item.text = "TEXT";
        * item.pos.top = 0;
        * item.pos.left = 0;
        * item.font.size = 16;
        * item.font.color = new VIZCore.Color(255, 0, 0, 255);
        * 
        * message.Show(item);
        * 
        * let item2 = message.GetObject();
        * item2.id = "item";
        * item2.text = "UPDATE";
        * item2.pos.top = 0;
        * item2.pos.left = 0;
        * item2.font.size = 20;
        * item2.font.color = new VIZCore.Color(255, 255, 0, 255);
        * 
        * message.Update(item.id, item2);
        */
        this.Update = function (id, object) {
            let item = itemMap.get(id);

            if (item === undefined) {
                return;
            }

            item.element.remove();
            itemMap.delete(item.id);
            create(object);
        }

        /**
        * Message GetObject
        * @example 
        * let message = vizcore.UIElement.GetMessage();
        * 
        * let item = message.GetObject();
        * item.id = "item";
        * item.text = "TEXT";
        * item.pos.top = 0;
        * item.pos.left = 0;
        * item.font.size = 16;
        * item.font.color = new VIZCore.Color(255, 0, 0, 255);
        * 
        * message.Show(item);
        */
        this.GetObject = function(){
            let item = {
                id: undefined,
                text: undefined,
                pos:{
                    top: 0,
                    left: 0,
                },
                font:{
                    size: 16,
                    color: undefined
                },
                element: undefined // 내부관리
            }

            return item;
        };
    }
}
export default Message;