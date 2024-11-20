/**
 * @author mgson
 */

class ColorMap {
    constructor(view, VIZCore) {

        let ColorMapInfoList = new Map();
        let ColorMapWidth = 256;
        this.ColorMapInfoItem = function () {
            let item = {
                IDCount: 0,
                IDOffset: 0,
                IDColorMap: [],
                ColorMapArray: [],
                releaseList: new Set,
                referenceList: new Set,
            };
            return item;
        };

        this.triCountList = []; 
        let colormapTexture = undefined;

        let currentObj = undefined;
        let currentBody = undefined;
        let currentProcess = undefined;
        let currentColorMapInfo = undefined;

        let savetindLen = [];
        let tind = [];
        let tindOffset = 0;

        init();

        function init() {

            if (view.ColorMap !== undefined) {
                ColorMapInfoList.clear();

                ColorMapInfoList = new Map();
            }

            colormapTexture = undefined;
            currentObj = undefined;
            currentBody = undefined;
            currentProcess = undefined;
            //currentMapId=-1; 
            currentColorMapInfo = undefined;
            savetindLen = [];
            tind = [];
            tindOffset = 0;


            if (colormapTexture === undefined) {
                colormapTexture = view.gl.createTexture();
                view.gl.bindTexture(view.gl.TEXTURE_2D, colormapTexture);
                //const pixel = new Uint8Array(4);               
                //view.gl.texImage2D(view.gl.TEXTURE_2D, 0, view.gl.RGBA, 1, 1, 0, view.gl.RGBA, view.gl.UNSIGNED_BYTE, pixel);
                //ColorMapWidth,
                //ColorMapWidth,
                //const pixel = new Float32Array(4);
                view.gl.texImage2D(view.gl.TEXTURE_2D, 0, view.gl.RGBA32F, ColorMapWidth, ColorMapWidth, 0, view.gl.RGBA, view.gl.FLOAT, null);
                view.gl.texParameteri(view.gl.TEXTURE_2D, view.gl.TEXTURE_MIN_FILTER, view.gl.NEAREST);
                view.gl.texParameteri(view.gl.TEXTURE_2D, view.gl.TEXTURE_MAG_FILTER, view.gl.NEAREST);
                view.gl.bindTexture(view.gl.TEXTURE_2D, null);
            }
        }

        //ColorMap 텍스처 크기 반환
        this.GetColorMapWidth = function () {
            return ColorMapWidth;
        };

        //ColorMap 텍스처 크기 반환
        this.SetColorMapWidth = function (width) {
            ColorMapWidth=width;
        };

        this.GetColorMapTexture = function () {
            return colormapTexture;
        };

        // mapId에 해당하는 텍스처 Data 바인딩
        this.SetColorMapTexture = function (mapId) {

            view.gl.bindTexture(view.gl.TEXTURE_2D, colormapTexture);
            // view.gl.texImage2D(view.gl.TEXTURE_2D,
            //     0,
            //     view.gl.RGBA,
            //     ColorMapWidth,
            //     ColorMapWidth,
            //     0,
            //     view.gl.RGBA,
            //     view.gl.UNSIGNED_BYTE,
            //     currentColorMapInfo.ColorMapArray[mapId]
            // );
            view.gl.texSubImage2D(view.gl.TEXTURE_2D,
                 0, 0, 0,
                 ColorMapWidth,
                 ColorMapWidth,                              
                 view.gl.RGBA,
                 view.gl.FLOAT,
                 currentColorMapInfo.ColorMapArray[mapId]
             );
            //view.gl.activeTexture(view.gl.TEXTURE1);
            view.gl.bindTexture(view.gl.TEXTURE_2D, null);


        };

        ////////////////////////////////////////////////////////////////////////

        // mapId번쨰 텍스처맵에 할당하기 위한 배열 생성
        this.CheckColorMapArray = function (mapId) {
            if (currentColorMapInfo.ColorMapArray[mapId] === undefined || currentColorMapInfo.ColorMapArray[mapId].length === 0) {
                //currentColorMapInfo.ColorMapArray[mapId] = new Uint8Array(4 * ColorMapWidth * ColorMapWidth);
                currentColorMapInfo.ColorMapArray[mapId] = new Float32Array(4 * ColorMapWidth * ColorMapWidth);
            }
        };

        ////////////////////////////////////////////////////////////////////////        
        //현재 참조중인 정보 - 업데이트 여부 판별
        this.SetCurrentObject = function (obj) {
            currentObj = obj;
        };
        this.SetCurrentBody = function (body) {
            currentBody = body;
        };
        this.SetCurrentProcess = function (process) {
            currentProcess = process;
        };
        this.SetCurrentColorMapInfo = function (Key) {
            let model = ColorMapInfoList.get(Key);
            if (model === undefined) {
                model = new view.ColorMap.ColorMapInfoItem();
                ColorMapInfoList.set(Key, model);
            }
            currentColorMapInfo = model;
        };
        ///////////////////////////////////////////////////////////////////////

        //IsolateView, Hide 색 변경
        this.SetColorMapArray_Body = function (color) {
            let vcolorIndMap = new Set();
            let prevInd = -1;
            for (let i = currentBody.m_triIdx; i < currentBody.m_triIdx + 1; i = i + 1) {
                let stInd = currentObj.attribs.a_index.array[i];
                if (stInd <= prevInd)
                    continue
                prevInd = stInd;

                //let colInd = (currentObj.attribs.a_color.array[(stInd<<2)]<<24)+(currentObj.attribs.a_color.array[(stInd<<2)+1]<<16)+(currentObj.attribs.a_color.array[(stInd<<2)+2]<<8)+currentObj.attribs.a_color.array[(stInd<<2)+3];
                let colInd = (currentObj.attribs.a_color.array[(stInd << 2)]) + (currentObj.attribs.a_color.array[(stInd << 2) + 1] << 8) + (currentObj.attribs.a_color.array[(stInd << 2) + 2] << 16) + (currentObj.attribs.a_color.array[(stInd << 2) + 3] * 16777216);
                let mapInd = currentColorMapInfo.IDColorMap[currentObj.mapId].get(colInd);
                vcolorIndMap.add(mapInd);
            }
            vcolorIndMap.forEach((value) => {
                //let row = ~~(value/ColorMapWidth);        
                //let col =value%ColorMapWidth;
                //let ind=row*(ColorMapWidth<<2)+(col<<2);

                let ind = value * 4;

                currentColorMapInfo.ColorMapArray[currentObj.mapId][ind] = color.r/255;
                currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 1] = color.g/255;
                currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 2] = color.b/255;
                currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 3] = color.a/255;
            });

        };

        this.SetColorMapArray_Body_2 = function (color) {
            let vcolorIndMap = new Set();
            let prevInd = -1;
            for (let i = currentBody.m_triIdx; i < currentBody.m_triIdx + 1; i = i + 1) {
                let stInd = currentObj.attribs.a_index.array[i];
                if (stInd <= prevInd)
                    continue
                prevInd = stInd;

                //let colInd = (currentObj.attribs.a_color.array[(stInd<<2)]<<24)+(currentObj.attribs.a_color.array[(stInd<<2)+1]<<16)+(currentObj.attribs.a_color.array[(stInd<<2)+2]<<8)+currentObj.attribs.a_color.array[(stInd<<2)+3];
                let colInd = (currentObj.attribs.a_color.array[(stInd << 2)]) + (currentObj.attribs.a_color.array[(stInd << 2) + 1] << 8) + (currentObj.attribs.a_color.array[(stInd << 2) + 2] << 16) + (currentObj.attribs.a_color.array[(stInd << 2) + 3] * 16777216);
                let mapInd = currentColorMapInfo.IDColorMap[currentObj.mapId].get(colInd);
                vcolorIndMap.add(mapInd);
            }
            vcolorIndMap.forEach((value) => {
                //let row = ~~(value/ColorMapWidth);        
                //let col =value%ColorMapWidth;
                //let ind=row*(ColorMapWidth<<2)+(col<<2);

                let ind = value * 4;

                if (color.r === undefined)
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 3] += color/255;
                else {
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind] += color.r/255;
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 1] += color.g/255;
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 2] += color.b/255;
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 3] += color.a/255;
                }
            });

        };
        //Action에 따른 색 변경
        this.SetColorMapArray_Pipeline = function (color) {

            let vcolorIndMap = new Set();
            let prevInd = -1;

            let sum = 0;
            let k = 0
            for (; k < view.ColorMap.triCountList.length; k++) {
                if (sum === currentProcess.start)
                    break;
                sum += view.ColorMap.triCountList[k];
            }
            for (let i = currentProcess.start; i < currentProcess.start + currentProcess.length; i = i + view.ColorMap.triCountList[k], k++) {

                let stInd = currentObj.attribs.a_index.array[i];
                if (stInd <= prevInd)
                    continue
                prevInd = stInd;
                //let colInd = (currentObj.attribs.a_color.array[(stInd<<2)]<<24)+(currentObj.attribs.a_color.array[(stInd<<2)+1]<<16)+(currentObj.attribs.a_color.array[(stInd<<2)+2]<<8)+currentObj.attribs.a_color.array[(stInd<<2)+3];   
                let colInd = (currentObj.attribs.a_color.array[(stInd << 2)]) + (currentObj.attribs.a_color.array[(stInd << 2) + 1] << 8) + (currentObj.attribs.a_color.array[(stInd << 2) + 2] << 16) + (currentObj.attribs.a_color.array[(stInd << 2) + 3] * 16777216);
                let mapInd = currentColorMapInfo.IDColorMap[currentObj.mapId].get(colInd);
                vcolorIndMap.add(mapInd);
            }
            vcolorIndMap.forEach((value) => {
                //let row = ~~(value/ColorMapWidth);        
                //let col =value%ColorMapWidth;
                //let ind=row*(ColorMapWidth<<2)+(col<<2);
                let ind = value * 4;

                if (color.r === undefined)
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 3] = color/255;
                else {
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind] = color.r/255;
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 1] = color.g/255;
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 2] = color.b/255;
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 3] = color.a/255;
                }

            });

        };
        this.SetColorMapArray_Pipeline_v2 = function (color) {

            let vcolorIndMap = new Set();
            let prevInd = -1;

            let sum = 0;
            let k = 0
            for (; k < view.ColorMap.triCountList.length; k++) {
                if (sum === currentProcess.start)
                    break;
                sum += view.ColorMap.triCountList[k];
            }
            for (let i = currentProcess.start; i < currentProcess.start + currentProcess.length; i = i + view.ColorMap.triCountList[k], k++) {

                let stInd = currentObj.attribs.a_index.array[i];
                if (stInd <= prevInd)
                    continue
                prevInd = stInd;
                //let colInd = (currentObj.attribs.a_color.array[(stInd<<2)]<<24)+(currentObj.attribs.a_color.array[(stInd<<2)+1]<<16)+(currentObj.attribs.a_color.array[(stInd<<2)+2]<<8)+currentObj.attribs.a_color.array[(stInd<<2)+3];   
                let colInd = (currentObj.attribs.a_color.array[(stInd << 2)]) + (currentObj.attribs.a_color.array[(stInd << 2) + 1] << 8) + (currentObj.attribs.a_color.array[(stInd << 2) + 2] << 16) + (currentObj.attribs.a_color.array[(stInd << 2) + 3] * 16777216);
                let mapInd = currentColorMapInfo.IDColorMap[currentObj.mapId].get(colInd);
                vcolorIndMap.add(mapInd);
            }
            vcolorIndMap.forEach((value) => {
                //let row = ~~(value/ColorMapWidth);        
                //let col =value%ColorMapWidth;
                //let ind=row*(ColorMapWidth<<2)+(col<<2);
                let ind = value * 4;

                if (color.r === undefined)
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 3] += color/255;
                else {
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind] += color.r/255;
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 1] += color.g/255;
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 2] += color.b/255;
                    currentColorMapInfo.ColorMapArray[currentObj.mapId][ind + 3] += color.a/255;
                }

            });

        };

        this.GetColorMapArray_Pipeline = function () {

            let vcolorIndMap = new Set();
            let prevInd = -1;

            let sum = 0;
            let k = 0
            for (; k < view.ColorMap.triCountList.length; k++) {
                if (sum === currentProcess.start)
                    break;
                sum += view.ColorMap.triCountList[k];
            }
            for (let i = currentProcess.start; i < currentProcess.start + currentProcess.length; i = i + view.ColorMap.triCountList[k], k++) {

                let stInd = currentObj.attribs.a_index.array[i];
                if (stInd <= prevInd)
                    continue
                prevInd = stInd;
                let colInd = (currentObj.attribs.a_color.array[(stInd << 2)]) + (currentObj.attribs.a_color.array[(stInd << 2) + 1] << 8) + (currentObj.attribs.a_color.array[(stInd << 2) + 2] << 16) + (currentObj.attribs.a_color.array[(stInd << 2) + 3] * 16777216);
                let mapInd = currentColorMapInfo.IDColorMap[currentObj.mapId].get(colInd);
                vcolorIndMap.add(mapInd);
                break;
            }
            let color;
            vcolorIndMap.forEach((value) => {
                let ind = value * 4;  
                
                
                color=[currentColorMapInfo.ColorMapArray[currentObj.mapId][ind],currentColorMapInfo.ColorMapArray[currentObj.mapId][ind+1],currentColorMapInfo.ColorMapArray[currentObj.mapId][ind+2],currentColorMapInfo.ColorMapArray[currentObj.mapId][ind+3]];
            });
            
            return color;
        };



        //매쉬 기본 색상 할당
        this.SetColorMapArray_Obj = function (obj) {

            if (currentColorMapInfo.ColorMapArray[obj.mapId] === undefined) {
                //currentColorMapInfo.ColorMapArray[obj.mapId] = (new Uint8Array(4 * ColorMapWidth * ColorMapWidth));
                currentColorMapInfo.ColorMapArray[obj.mapId] = new Float32Array(4 * ColorMapWidth * ColorMapWidth);
                let stInd = 0;

                for (let ii = 0; ii < obj.tag.length; ii++) {
                    let colInd = (obj.attribs.a_color.array[stInd * 4]) + (obj.attribs.a_color.array[stInd * 4 + 1] << 8) + (obj.attribs.a_color.array[stInd * 4 + 2] << 16) + (obj.attribs.a_color.array[stInd * 4 + 3] * 16777216);
                    let mapInd = currentColorMapInfo.IDColorMap[obj.mapId].get(colInd);
                    let ind = mapInd * 4;
                    let color = obj.tag[ii].color;

                    currentColorMapInfo.ColorMapArray[obj.mapId][ind] = color.r/255;
                    currentColorMapInfo.ColorMapArray[obj.mapId][ind + 1] = color.g/255;
                    currentColorMapInfo.ColorMapArray[obj.mapId][ind + 2] = color.b/255;
                    currentColorMapInfo.ColorMapArray[obj.mapId][ind + 3] = color.a/255;

                    stInd = stInd + obj.tag[ii].m_nVtx / 3;

                }
            }

        };

        //메모리 관리 - 해제, 사용중(참조) 리스트
        this.InitList = function () {
            for (let [key, value] of ColorMapInfoList) {
                value.releaseList = new Set;
                value.referenceList = new Set;
            }
        };

        //해제 리스트 추가
        this.AddReleaseList = function (obj) {
            let model = ColorMapInfoList.get(obj.id_file);
            model.releaseList.add(obj.mapId);
        };
        //참조 리스트 추가
        this.AddReferenceList = function (obj) {
            let model = ColorMapInfoList.get(obj.id_file);
            model.referenceList.add(obj.mapId);
        };

        //참조리스트에 없는 메모리 해제
        this.ReleaseColorMap = function () {
            for (let [key, value] of ColorMapInfoList) {

                let diff = value.releaseList.difference(value.referenceList);
                if (diff.size > 0) {
                    for (let item of diff) {
                        value.ColorMapArray[item] = undefined;
                    }
                }
            }
        };

        //메모리 해제
        this.ReleaseIDColorMap = function (obj) {

            
            let model = ColorMapInfoList.get(obj.id_file);
            let ColorMapID = new Set;
            for (let k = 0; k < obj.attribs.a_tInd.array.length; k = k + 1) {
                ColorMapID.add(obj.attribs.a_tInd.array[k]);
            }
            for (let searchValue of ColorMapID) {
                for (let [key, value] of model.IDColorMap[obj.mapId]) {
                    if (value === searchValue)
                        model.IDColorMap[obj.mapId].delete(key);
                }
            }
        };

        //메모리 해제
        this.ClearProcess = function (files) {
            if (files === undefined)
                init();
            else {

                for (let i = 0; i < files.length; i++) {
                    let model = ColorMapInfoList.get(files[i].Key);
                    if (model !== undefined) {
                        model = undefined;
                    }
                    ColorMapInfoList.delete(files[i].Key);
                }
            }
        };

        //파일로드시 인덱스 위치 초기화
        this.InitLoad = function () {
            savetindLen = [];
            tind = [];
            tindOffset = 0;
        };

        //파일로드 시 ColorMap 및 정점 참조 인덱스 설정
        this.LoadAndSetColorMap = function (info, object, j) {
            
            const squareWidth=ColorMapWidth * ColorMapWidth;
            let tindArrLength = info.m_nVtx / 3; //
            savetindLen.push(tindArrLength);

            let mapId = Math.floor((currentColorMapInfo.IDCount + currentColorMapInfo.IDOffset) / (squareWidth));

            if (currentColorMapInfo.IDColorMap[mapId] === undefined) {
                currentColorMapInfo.IDColorMap.push(new Map());
                let iii = 0;
                if ((object.mapId != mapId)) { //obj j+1개가 이전 맵에 있음 -> 새 texture map으로 이동                             
                    for (let ind = squareWidth - j, jnd = 0; ind < squareWidth; ind++, jnd++) {
                        for (let [key, value] of currentColorMapInfo.IDColorMap[mapId - 1].entries()) {
                            if (value === ind) {
                                currentColorMapInfo.IDColorMap[mapId].set(key, jnd);
                                for (let i = 0; i < savetindLen[jnd]; i++, iii++) {
                                    tind[iii] = jnd;
                                }
                            }
                        }
                    }
                    currentColorMapInfo.IDOffset = currentColorMapInfo.IDOffset + j;
                }
            }
            let tIdx=(currentColorMapInfo.IDCount + currentColorMapInfo.IDOffset) % (squareWidth);

            for (let k = 0; k < tindArrLength; k = k + 1) {
                tind[tindOffset + k] = (tIdx);
            }
            object.mapId = mapId;

            let key = currentColorMapInfo.IDColorMap[mapId].get(info.colorIdx);
            if (key === undefined) {
                currentColorMapInfo.IDColorMap[mapId].set(info.colorIdx, tIdx);
                currentColorMapInfo.IDCount++;
            }
            tindOffset += tindArrLength;

        };

        //캐시 저장된 파일 로드시 정점 참조 인덱스 설정
        this.ReLoadAndSetColorMap = function (info, object) {

           
            let tindArrLength = info.m_nVtx / 3;
            for (let i = 0; i < currentColorMapInfo.IDColorMap.length; i++) {
                let key = currentColorMapInfo.IDColorMap[i].get(info.colorIdx);
                if (key !== undefined) {
                    object.mapId = i;
                    for (let k = 0; k < tindArrLength; k = k + 1) {
                        tind[tindOffset + k] = ((key));
                    }
                  
                }
            }


            tindOffset += tindArrLength;

        };

        //정점 ColorMap 참조 인덱스 배열 반환 (obj 할당)
        this.GentIndArray = function () {
            return new Uint32Array(tind, 0, tindOffset); //tind;
        };


    }
}

export default ColorMap;