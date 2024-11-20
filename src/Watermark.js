class Watermark {
    constructor(VIZCore, context) {
        this.VIZCore = VIZCore;
        let scope = this;
        this.WatermarkList = [];
        this.context = context;

        this.Visible = true;

        this.Interface = undefined;

        function setFontOption(ctx, font) {
            // 폰트 설정
            let str = "";
            if(font.bold)
                str += "bold ";
            
            if(font.italic)
                str += "italic ";
            

            ctx.font = str + font.size + "pt " + font.face;
    
            ctx.fillStyle = "rgba(" + font.color.r + "," + font.color.g + ","
                + font.color.b + "," + font.color.glAlpha() + ")";

            ctx.strokeStyle = "rgba(" + font.color.r + "," + font.color.g + ","
                + font.color.b + "," + font.color.glAlpha() + ")";

            ctx.textBaseline = "alphabetic";
        };

        function setBgOption(ctx, item) {
            if (item.style.background.enable) 
            {
                // background color
                ctx.fillStyle = "rgba(" + item.style.background.color.r + "," + item.style.background.color.g + ","
                    + item.style.background.color.b + "," + item.style.background.color.glAlpha() + ")";
            }
            else {
                ctx.fillStyle = "rgba(" + item.style.background.color.r + "," + item.style.background.color.g + ","
                    + item.style.background.color.b + "," + 0 + ")";
            }
    
            if (item.style.border.enable) {
                // border color
                ctx.strokeStyle = "rgba(" + item.style.border.color.r + "," + item.style.border.color.g + ","
                    + item.style.border.color.b + "," + item.style.border.color.glAlpha() + ")";
                ctx.lineWidth = item.style.border.thickness;
            }
            else {
                // border color
                ctx.strokeStyle = "rgba(" + item.style.border.color.r + "," + item.style.border.color.g + ","
                    + item.style.border.color.b + "," + 0 + ")";
                ctx.lineWidth = item.style.border.thickness;
            }
        };

        function getTextMetricsByFont(ctx, arrText, font){
            let metrics = undefined;
    
            let backupFont = ctx.font;
    
            // 폰트 설정
            let str = "";
            if(font.bold)
                str += "bold ";
            
            if(font.italic)
                str += "italic ";
            

            ctx.font = str + font.size + "pt " + font.face;
    
            for (let i = 0; i < arrText.length; i++) {
                let measure = ctx.measureText(arrText[i]);
                if (metrics === undefined)
                    metrics = measure;
                else if (metrics.width < measure.width)
                    metrics = measure;
            }
    
            if (arrText.length > 0) {
                metrics.height = font.size * 1.5;
                metrics.ascent = font.size + font.size * 0.1;
                metrics.descent = font.size * 0.15; // 2022-10-18 높이가 맞지 않아 일부 수정
            }
    
            ctx.font = backupFont;
            return metrics;
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
    
        function draw_RoundRect_Custom(ctx, x, y, w, h, r, back, border, tl, tr, bl, br) {
    
            ctx.beginPath();
            // Top Left
            if(tl)
            {
                ctx.moveTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
            }
            else
            {
                ctx.moveTo(x, y - r);
                ctx.lineTo(x, y);
                ctx.lineTo(x + r, y);
            }
            // Top
            ctx.lineTo(x - r + w, y);
    
            // Top Right
            if(tr)
            {
                ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            }
            else
            {
                ctx.lineTo(x + r + w + r, y);
                ctx.lineTo(x + r + w + r, y + r);
            }
    
            ctx.lineTo(x + w, y + h - r);
    
            // bottom right
            if(br)
            {
                ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            }
            else{
                ctx.lineTo(x + w, y + h);
                ctx.lineTo(x + w - r, y + h);
            }
    
            ctx.lineTo(x + r, y + h);
    
            // bottom left
            if(bl)
            {
                ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            }
            else{
                ctx.lineTo(x, y + h);
                ctx.lineTo(x, y + h - r);
            }
            ctx.lineTo(x , y - r);
                
            ctx.closePath();
    
            if (back)
                ctx.fill();
            if (border)
                ctx.stroke();
        }
    
        function draw_Rect(ctx, x, y, w, h, back, border) {
            if (back)
                ctx.fillRect(x, y, w, h);
            if (border)
                ctx.strokeRect(x, y, w, h);
        }

        function draw_Watermark(item) {
            if (item.text.value.length === 0)
                return;

            if(item.context === undefined)
                item.context = scope.context;

            let repeatCnt = 1;
    
            // box metrics
            const metrics = getTextMetricsByFont(item.context, item.text.value, item.style.font);
    
            let w = metrics.width + item.style.border.offset * 2;
            let h = metrics.height * item.text.value.length + item.style.border.offset * 2;

            let rect = {
                x : item.style.offset.left,
                y : item.style.offset.top,
                width : w,
                height : h,
                repeatOffset : {
                    x : 0,
                    y : 0
                }
            }

           

            // image offset
            let imageOffset = {
                x : 0,
                y :0
            };

            

            let x = rect.x + item.style.border.offset;
            let y = rect.y + item.style.border.offset;

            rect.width = w;
            rect.height = h;

            // image가 있는 경우 위치 변경
            if(item.icon.image !== undefined)
            {
                if(item.icon.align === VIZCore.Enum.ALIGN.TOP_LEFT || item.icon.align === VIZCore.Enum.ALIGN.MIDDLE_LEFT || item.icon.align === VIZCore.Enum.ALIGN.BOTTOM_LEFT)
                {
                    x -= item.icon.size + item.icon.offset * 2;
                    w += item.icon.size + item.icon.offset * 2;
                    rect.width += item.icon.size + item.icon.offset * 2;

                    imageOffset.x += item.icon.offset;
                }
                else if(item.icon.align === VIZCore.Enum.ALIGN.TOP_RIGHT || item.icon.align === VIZCore.Enum.ALIGN.MIDDLE_RIGHT || item.icon.align === VIZCore.Enum.ALIGN.BOTTOM_RIGHT)
                {
                    w += item.icon.size + item.icon.offset * 2;
                    rect.width += item.icon.size + item.icon.offset * 2;
                }
            }

            if(item.style.ratio !== undefined && item.style.ratio.use === true)
            {
                // 화면 비율 적용
                let width = item.context.canvas.width;
                let height = item.context.canvas.height;

                let ratioH = width * item.style.ratio.horizontal;
                let ratioV = height * item.style.ratio.vertical;
                rect.x += ratioH - (rect.width / 2);
                rect.y += ratioV - (rect.height / 2);

                // 정렬
                if(rect.x < 0)
                    rect.x = 0;

                if(rect.y < 0)
                    rect.y = 0;

            }

            //console.log(context.canvas.clientWidth);

            let draw = function(){

                let textOffset = {
                    x : 0,
                    y :0
                };

                // font 설정
                //setFontOption(item.context, item.style.font);
                
                // 박스 그리기
                {
                    if(item.style.rotate !== 0)
                    {
                        item.context.save();
                        let tx = rect.x + (rect.width / 2);
                        let ty = rect.y + (rect.height / 2);
                        // 모델 중심 회전
                        context.translate(tx, ty);
                        //context.rotate(Math.PI/180 * item.style.rotate);
                        item.context.rotate(Math.PI/180 * item.style.rotate);
                        context.translate(-tx, -ty );
                        //context.textAlign = "center";
                        //context.fillText("Your Label Here", labelXposition, 0);
                        //context.restore();
                    }

                    // background 설정
                    setBgOption(item.context,item);

                    if (item.style.border.type === 0)
                        draw_Rect(item.context, rect.x, rect.y, rect.width, rect.height, item.style.background.enable, item.style.border.enable);
                    else if (item.style.border.type === 1)
                        draw_RoundRect(item.context, rect.x, rect.y, rect.width, rect.height, item.style.border.round, item.style.background.enable, item.style.border.enable);


                    // textOffset.x += item.style.border.offset;
                    textOffset.y += item.style.border.offset;

                    //if(0)
                    // Image 그리기
                    {
                        let imgWidth = item.icon.size;
                        let imgHeight = item.icon.size;

                        let width = item.icon.image.width;
                        let height = item.icon.image.height;

                        if(width > height){
                            imgWidth = (item.icon.image.width * item.icon.size) / item.icon.image.height;
                            imgHeight = item.icon.size;
                        } else {
                            imgWidth = item.icon.size;
                            imgHeight = (item.icon.image.height * item.icon.size) / item.icon.image.width;
                        }

                        if (imgWidth <= 0)
                            imgWidth = item.icon.image.width;

                        if (imgHeight <= 0)
                            imgHeight = item.icon.image.height;

                        let x = rect.x;// + item.style.border.offset;
                        let y = rect.y;// + item.style.border.offset;

                        //x += imageOffset.x;

                        
                        // TopLeft
                        //let imgX = x - item.icon.offset - item.icon.size + item.style.border.offset;
                        let imgX = x + item.icon.offset;
                        let imgY = y + item.icon.offset;

                        switch(item.icon.align)
                        {
                            case VIZCore.Enum.ALIGN.TOP_LEFT : {
                                textOffset.x += imgWidth;// + item.icon.offset;
                            }
                            break;
                            case VIZCore.Enum.ALIGN.MIDDLE_LEFT : {
                                imgY = y + (rect.height * 0.5) - (imgHeight / 2);
                                //textOffset.x += imgWidth +item.icon.offset;
                                textOffset.x += imgWidth;
                            }
                            break;
                            case VIZCore.Enum.ALIGN.BOTTOM_LEFT : {
                                imgY = y + rect.height - imgHeight - item.icon.offset;
                                //textOffset.x += imgWidth + item.icon.offset;
                                textOffset.x += imgWidth;
                            }
                            break;
                            case VIZCore.Enum.ALIGN.TOP_RIGHT : {
                                imgX += rect.width - item.icon.size - item.icon.offset * 2 - item.style.border.offset;
                            }
                            break;
                            case VIZCore.Enum.ALIGN.MIDDLE_RIGHT : {
                                imgX += rect.width - item.icon.size - item.icon.offset * 2 - item.style.border.offset;
                                imgY = y + (rect.height * 0.5) - (imgHeight / 2);
                            }
                            break;
                            case VIZCore.Enum.ALIGN.BOTTOM_RIGHT : {
                                imgX += rect.width - item.icon.size - item.icon.offset * 2 - item.style.border.offset;
                                imgY = y + rect.height - imgHeight - item.icon.offset;
                            }
                            break;
                        }

                        item.context.drawImage(item.icon.image, imgX, imgY, imgWidth, imgHeight);
                    }
                }

                // font color
                setFontOption(item.context, item.style.font);

                //console.log("RECT ::", rect.x, rect.y);
                for (let i = 0; i < item.text.value.length; i++) {
                    if(item.style.font.stroke)
                        item.context.strokeText(item.text.value[i], rect.x+ textOffset.x, rect.y+ textOffset.y + (metrics.ascent * i + metrics.ascent + item.style.border.offset * i + metrics.descent));
                    else
                        item.context.fillText(item.text.value[i], rect.x + textOffset.x, rect.y + textOffset.y + (metrics.ascent * i + metrics.ascent + item.style.border.offset * i + metrics.descent));
                }

                if(item.style.rotate !== 0)
                {
                    //context.save();
                    //context.translate(newx, newy);
                    //context.rotate(-Math.PI/2);
                    //context.rotate(item.style.rotate);
                    //context.textAlign = "center";
                    //context.fillText("Your Label Here", labelXposition, 0);
                    item.context.restore();
                }
            };

            let xCnt = 1;
            let yCnt = 1;
            if(item.style.repeat.use)
            {
                xCnt = context.canvas.clientWidth / rect.width;
                yCnt = context.canvas.clientHeight / rect.height;    

                for (let ix = -xCnt; ix < xCnt; ix++) {

                    for (let iy = -yCnt; iy < yCnt; iy++) {
                        {
                            // rect.x = rect.width  * ix + (item.style.repeat.offset.x);
                            // rect.y = rect.height * iy + (item.style.repeat.offset.y);
                            rect.x = (item.style.repeat.offset.x) * ix;
                            rect.y = (item.style.repeat.offset.y)* iy;
                            //console.log(rect.x);
                        }
                        
                        draw();
                    }
                }
            }
            else{
                draw();
            }

           
        }

        this.DrawWatermark = function (item){
            draw_Watermark(item);
        };
    };

    New(){
        let item = {
            // 2D Context
            //context : undefined,
            // Text
            text : {
                value : []
            },
            // Icon
            icon : {
                image : undefined,
                size : 32,
                offset : 2,
                align : this.VIZCore.Enum.ALIGN.MIDDLE_LEFT,
            },
            style: {
                font: {
                    face: "Arial",
                    size: 12,
                    color: new this.VIZCore.Color(),
                    bold : false,
                    italic : false,
                    stroke : false
                },
                border: {
                    enable: true,
                    color: new this.VIZCore.Color(),
                    thickness: 1,
                    type: 0, // 0 : rect, 1 : roundrect
                    round: 5,
                    offset: 5
                },
                background: {
                    enable: true,
                    color: new this.VIZCore.Color()
                },
                // 상대적인 Offset
                offset : {
                    left : 0,
                    top : 0,
                },
                ratio : {
                    use : false,
                    vertical : 0,
                    horizontal : 0
                },
                // 회전 각도
                rotate : 0,
                // 반복
                repeat : {
                    use : false,
                    offset : {
                        x : 50,
                        y : 50
                    }
                }
            },
        };
        return item;
    };

    Add(item){
        this.WatermarkList.push(item);
    };

    Render(){
        //console.log("WaterMark :: ");
        if(this.Visible)
        {
            for (let i = 0; i < this.WatermarkList.length; i++) {
                let item = this.WatermarkList[i];
                this.DrawWatermark(item);
            }
        }
    };

    Show(visible){
        this.Visible = visible;
        if(this.Interface !== undefined)
        {
            if(this.Interface.useDrawing === undefined || this.Interface.useDrawing === false)
            {
                this.Interface.Draw();
            }
            else{
                this.Interface.Drawing.DrawSketch();
            }
        }
    };
}

export default Watermark;