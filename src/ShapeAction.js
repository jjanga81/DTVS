/**
 * VIZCore Shape Action 관리 모듈
 * @copyright © 2013 - 2022 SOFTHILLS Co., Ltd. All rights reserved.
 * @param {Object} view View.js Instance
 * @param {Object} VIZCore ValueObject.js Instance
 * @class
 */
 class ShapeAction {
    constructor(view, VIZCore) {
        let scope = this;

        //action 바이너리 데이터 길이
        let actionBinaryOffset = 0;  //actionItem 전체 바이너리 길이 : actionBoolOffset + (actionFloatOffset * 4)
        let actionBoolOffset = 0; //Uint8Array bool 값 적용 길이
        let actionFloatOffset = 0; //Float32Array Number 값 적용 길이

        //key : File Key, value : Data.ShapeActionBufferItem()
        this.FileActionMap = new Map();

        // Tree 다운로드 중 Action 관리
        //key : file Key, value : Map();
        //sub Key : node orignal ID , ActionItem
        this.DownloadFileActionMap = new Map();

        //this.listAction = [];

        init();
        function init () {
            let arrLength = 0;
            arrLength += 1; //(bool)visible
            arrLength += 1; //(bool)select

            arrLength += 16 * 4; //VIZCore.Matrix4
            arrLength += 16 * 4; //VIZCore.Matrix4
            arrLength += 4; //(int) material
            arrLength += 4 * 4; //VIZCore.Color

            arrLength += 1; //(bool) customColor
            arrLength += 4; //(int) transformIdx
            arrLength += 4; //(int) multiViewIdx
            //arrLength += 1; //(bool) uvAnimation


            actionBoolOffset = 4;
            actionFloatOffset = (16+16+1+4+1+1);

            actionBinaryOffset = arrLength;
        }

        /**
         * 데이터 제거
         */
        this.Clear = function() {
            scope.FileActionMap.clear();
            scope.DownloadFileActionMap.clear();
        };

        /**
         * File Key 기준 Data.Action 등록 (바이너리)
         * 
         * @param {String} fileKey : File Key
         * @param {Array<Number>} listID : node id list
         //* @param {Number} nodeCount : node Num
         */
        this.CreateAddFileAction_v1 = function(fileKey, listID) {

            let saitem = scope.FileActionMap.get(fileKey);
            if(saitem === undefined) {
                //신규
                saitem = view.Data.ShapeActionBufferItem();
                scope.FileActionMap.set(fileKey, saitem);
            }

            let defaultActionItem = view.Data.ActionItem();
            let defaultActionBuffer = getAction2ArrayBuffer(defaultActionItem);

            //let start = new Date();
            let nodeCount = listID.length;
            let arrItem = new ArrayBuffer(actionBinaryOffset * nodeCount);
            saitem.buffer = arrItem;

            let uint8BufferItem = new Uint8Array(arrItem);
            for(let i = 0 ; i < nodeCount ; i++) {

                //let currentAction = defaultActionItem;
                let buffer = defaultActionBuffer;

                //다운로드 중 Action 추가한 경우 적용
                if(scope.DownloadFileActionMap.has(fileKey)) {

                    //아직 세팅 전 인경우
                    let mapLoadingShapeAction = scope.DownloadFileActionMap.get(fileKey);
                    if(mapLoadingShapeAction !== undefined) {
                        let currentAction = mapLoadingShapeAction.get(listID[i]);
                        if(currentAction !== undefined) {
                            mapLoadingShapeAction.delete(listID[i]);

                            buffer = getAction2ArrayBuffer(currentAction);
                        }           
                    }
                }

                let offset = i * actionBinaryOffset;
                //let buffer = getAction2ArrayBuffer(currentAction);
               
                        
                //uint8Buffer.set(buffer, offset);
                let uint8Buffer = new Uint8Array(buffer);

                uint8BufferItem.set(uint8Buffer, offset);

                //listOffset에 [ID] = offset 등록필요
                //saitem.list[nodeCount+i] = offset;
                //saitem.listOffset[nodeCount + i] = offset;

                //saitem.listOffset[listID[i]] = offset;

                //saitem.listOffset[i] = offset;
                saitem.OffsetID.set(listID[i], offset);
            }

            //기존 세팅 정보 제거
            if(scope.DownloadFileActionMap.has(fileKey)) {
                scope.DownloadFileActionMap.delete(fileKey);
            }

        };
        
        /**
         * File Key 기준 Data.Action 등록
         * @param {String} fileKey : File Key
         * @param {Array<Number>} listID : node id list
         //* @param {Number} nodeCount : node Num
         */
         this.CreateAddFileAction = function(fileKey, listID) {

            let saitem = scope.FileActionMap.get(fileKey);
            if(saitem === undefined) {
                //신규
                saitem = view.Data.ShapeActionBufferItem();
                scope.FileActionMap.set(fileKey, saitem);
            }

            //let start = new Date();
            let nodeCount = listID.length;
            //saitem.listAction = Array.apply(null, Array(nodeCount));
            //let numByte = actionBinaryOffset * nodeCount;

            for(let i = 0 ; i < nodeCount ; i++) {

                //let updateCurrentAction = defaultActionItem;
                let updateCurrentAction = undefined;

                //다운로드 중 Action 추가한 경우 적용
                if(scope.DownloadFileActionMap.has(fileKey)) {

                    //아직 세팅 전 인경우
                    let mapLoadingShapeAction = scope.DownloadFileActionMap.get(fileKey);
                    if(mapLoadingShapeAction !== undefined) {
                        let currentAction = mapLoadingShapeAction.get(listID[i]);
                        if(currentAction !== undefined) {
                            mapLoadingShapeAction.delete(listID[i]);

                            //buffer = getAction2ArrayBuffer(currentAction);
                            updateCurrentAction = currentAction;
                        }
                    }
                }

                if(updateCurrentAction === undefined) {
                   updateCurrentAction = view.Data.ActionItem();
                   //updateCurrentAction = view.Data.NodeActionItem();
                }
                
                //saitem.OffsetID.set(listID[i], offset);
                saitem.listAction[i] = updateCurrentAction;
                saitem.mapAction.set(listID[i], updateCurrentAction);
                
                //saitem.listAction[i] = listID[i];
                //saitem.mapAction.set(listID[i], updateCurrentAction);

                //saitem.listAction[i] = updateCurrentAction;
                //saitem.mapAction.set(listID[i], i);
            }

            //기존 세팅 정보 제거
            if(scope.DownloadFileActionMap.has(fileKey)) {
                scope.DownloadFileActionMap.delete(fileKey);
            }

        };
        
        /**
         * File ActionItem 제거
         * @param {*} fileKey 
        */
        this.DeleteFileAction = function (fileKey) {
            if(scope.DownloadFileActionMap.has(fileKey))
            {
                scope.DownloadFileActionMap.delete(fileKey);
                return;
            }

            if(!scope.FileActionMap.has(fileKey)) return;

            scope.FileActionMap.delete(fileKey);
        };

        /**
         * 해당 개체의 ActionItem 반환
         * @param {String} fileKey File Key
         * @param {Number} origin_id origin_id
         * @return {Data.Action}
         */
        this.GetAction = function (fileKey, origin_id) {

            let saitem = scope.FileActionMap.get(fileKey);
            if(saitem !== undefined) {

                // if(saitem.OffsetID.get(origin_id) !== undefined) {
                //     let offset = saitem.OffsetID.get(origin_id);
                //     return getArrayBuffer2Action(saitem.buffer, offset);
                // }

                //if(saitem.mapAction.get(origin_id) !== undefined) {

                    let origin_index = view.Data.ModelFileManager.GetNodeOriginIndex(fileKey, origin_id);
                    if(origin_index === undefined) return undefined;

                    return saitem.listAction[origin_index];

                    //return saitem.mapAction.get(origin_id); //slow
                //}
                return undefined;
            }

            let loadingAction = scope.GetLoadingShapeAction(fileKey, origin_id);

            //아직 세팅 전 인경우
            if(loadingAction !== undefined)
                return loadingAction;

            loadingAction = view.Data.ActionItem();
            scope.SetAction(fileKey, origin_id, loadingAction);
            return loadingAction;
        };
    

        /**
         * 선택여부 반환
         * @param {String} fileKey 
         * @param {Number} origin_id 
         * @returns 
         */
        this.GetSelection = function (fileKey, origin_id) {
           
            let saitem = scope.FileActionMap.get(fileKey);
            if(saitem !== undefined ) {

                let origin_index = view.Data.ModelFileManager.GetNodeOriginIndex(fileKey, origin_id);
                if(origin_index === undefined) return false;

                // if(saitem.OffsetID.get(origin_id) !== undefined) {
                //     let offset = saitem.OffsetID.get(origin_id);
                //     return getArrayBuffer2Selection(saitem.buffer, offset);
                // }

                //if(saitem.mapAction.has(origin_id)) {
                    //return saitem.mapAction.get(origin_id).selection;
                    return saitem.listAction[origin_index].selection;
                //}
            }

            let action = scope.GetLoadingShapeAction(fileKey, origin_id)
            if(action !== undefined) {
                return action.selection;
            }
            return false;
        };

        
        /**
         * 가시화 여부 반환
         * @param {String} fileKey 
         * @param {Number} origin_id 
         * @returns 
         */
         this.GetVisible = function (fileKey, origin_id) {
           
            let saitem = scope.FileActionMap.get(fileKey);
            if(saitem !== undefined) {         
                let origin_index = view.Data.ModelFileManager.GetNodeOriginIndex(fileKey, origin_id);
                if(origin_index === undefined) return false;
      
                // if(saitem.OffsetID.get(origin_id) !== undefined) {
                //     let offset = saitem.OffsetID.get(origin_id);
                //     return getArrayBuffer2Visible(saitem.buffer, offset);
                // }

                //if(saitem.mapAction.has(origin_id)) {
                    
                    //return saitem.mapAction.get(origin_id).visible;
                    return saitem.listAction[origin_index].visible;
                //}
            }

            let action = scope.GetLoadingShapeAction(fileKey, origin_id)
            if(action !== undefined) {
                return action.visible;
            }

            return false;
        };

         /**
         * 해당 개체의 ActionItem 반환
         * @param {String} fileKey File Key
         * @param {Number} origin_id node ID
         * @return {Data.Action}
         */
        this.GetLoadingShapeAction = function(fileKey, origin_id) {

            if(!scope.DownloadFileActionMap.has(fileKey)) {
                //미리 설정된 값에서 찾을 수 없음
                return undefined;
            }

            let mapLoadingShapeAction = scope.DownloadFileActionMap.get(fileKey);
            return mapLoadingShapeAction.get(origin_id);
        };


        /**
         * 해당 개체에 ActionItem 설정
         * @param {String} fileKey 
         * @param {Number} origin_id 
         * @param {Data.ActionItem} action 
          * @return {Boolean} 변경 여부
         */
        this.SetAction = function (fileKey, origin_id, action) {
            let saitem = scope.FileActionMap.get(fileKey);
            if(saitem) {

                //let oldAction = saitem.mapAction.get(origin_id);
                let origin_index = view.Data.ModelFileManager.GetNodeOriginIndex(fileKey, origin_id);
                if(origin_index === undefined) return false;

                if(origin_index >= 0) {

                    let oldAction = saitem.listAction[origin_index];
                    if(scope.EqualAction(oldAction, action)) {
                        return false;
                    }
                    saitem.listAction[origin_index] = action;

                    return true;
                }


                //saitem.mapAction.set(origin_id, action);
               
                // if(saitem.OffsetID.get(origin_id) !== undefined) {
                //     let offset = saitem.OffsetID.get(origin_id);

                //     let buffer = getAction2ArrayBuffer(action);
                //     let uint8Buffer = new Uint8Array(buffer);

                //     let uint8BufferItem = new Uint8Array(saitem.buffer, offset, actionBinaryOffset);
                //     //let currentAction = getArrayBuffer2Action(saitem.buffer, offset);

                //     //동일한 경우 설정 제외
                //     //if(scope.EqualAction(currentAction, action)) {
                //     if(scope.EqualActionUint8Array(uint8Buffer, uint8BufferItem)) {
                //         return false;
                //     };
                    
                //     //let buffer = getAction2ArrayBuffer(action);
                  
                //     uint8BufferItem.set(uint8Buffer, 0);
                //     return true;
                // }

            }

            let mapLoadingShapeAction = scope.DownloadFileActionMap.get(fileKey);
            if(mapLoadingShapeAction === undefined) {
                mapLoadingShapeAction = new Map();
                scope.DownloadFileActionMap.set(fileKey, mapLoadingShapeAction);
            }

            mapLoadingShapeAction.set(origin_id, action);
            return true;
        };

         /**
         * 선택 설정
         * @param {String} fileKey 
         * @param {Number} origin_id 
         * @param {Boolean} selection 
         * @return {Boolean} 변경 여부
         */
        this.SetSelection = function (fileKey, origin_id, selection) {           
            let saitem = scope.FileActionMap.get(fileKey);
            if(saitem) {

                //let oldAction = saitem.mapAction.get(origin_id);
                let origin_index = view.Data.ModelFileManager.GetNodeOriginIndex(fileKey, origin_id);
                if(origin_index === undefined) return false;

                if(origin_index >= 0) {

                    let oldAction = saitem.listAction[origin_index];

                    if(oldAction.selection === selection) {
                        return false;
                    }
                    oldAction.selection = selection;

                    //saitem.mapAction.set(origin_id, oldAction);
                   
                    return true;
                }
                return false;

                if(saitem.OffsetID.get(origin_id) !== undefined) {
                    let offset = saitem.OffsetID.get(origin_id);

                    //let result = setArrayBuffer2Selection(saitem.buffer, offset, selection);

                    if(selection) {

                        
                        let action = scope.GetAction(fileKey, origin_id);
                        action.selection = selection;
                        
                        let action2 = scope.GetAction(fileKey, origin_id);
                        let selectiont = getArrayBuffer2Selection(saitem.buffer, offset);

                        ;
                    }


                    let result = setArrayBuffer2Selection(saitem.buffer, offset, selection);
                    return result;
                }
            }

            let action = scope.GetLoadingShapeAction(fileKey, origin_id)
            if(action !== undefined) {
                if(action.selection === selection)
                    return false;
                    
                action.selection = selection;
                return true;
            }

            return false;
        };

        
        /**
         * 가시화 설정
         * @param {String} fileKey 
         * @param {Number} origin_id 
         * @param {Boolean} visible 
         * @return {Boolean} 변경 여부
         */
        this.SetVisible = function (fileKey, origin_id, visible) {
            let saitem = scope.FileActionMap.get(fileKey);
            if(saitem) {
                let origin_index = view.Data.ModelFileManager.GetNodeOriginIndex(fileKey, origin_id);
                if(origin_index === undefined) return false;

                if(origin_index >= 0) {

                    let oldAction = saitem.listAction[origin_index];

                    if(oldAction.visible === visible) {
                        return false;
                    }
                    oldAction.visible = visible;

                    //saitem.mapAction.set(origin_id, oldAction);
                   
                    return true;
                }
                return false;

                // if(saitem.OffsetID.get(origin_id) !== undefined) {
                //     let offset = saitem.OffsetID.get(origin_id);

                //     let result = setArrayBuffer2Visible(saitem.buffer, offset, visible);
                //     return result;
                // }
            }

            let action = scope.GetLoadingShapeAction(fileKey, origin_id)
            if(action !== undefined) {
                if(action.visible === visible)
                    return false;

                action.visible = visible;
                return true;
            }

            return false;
        };
        
        /**
         * Action 정보 비교
         * @param {Data.ActionItem} source 
         * @param {Data.ActionItem} target 
         * @returns 
         */
        this.EqualAction = function (source, target) {
            
            if (source.visible !== target.visible) {
                return false;
            }

            if (source.selection !== target.selection) {
                return false;
            }

            if (source.material !== target.material) {
                return false;
            }

            if (source.shaderType !== target.shaderType) {
                return false;
            }

            if (source.multiViewIdx !== target.multiViewIdx) {
                return false;
            }
            
            // if (source.uvAnimation !== target.uvAnimation) {
            //     return false;
            // }

            if(source.disableViewDistaceBBox !== target.disableViewDistaceBBox) return false;

            if (source.drawViewDistanceBBox !== target.drawViewDistanceBBox) {
                return false;
            }

            if(source.useEffectMode !== target.useEffectMode) {
                return false;
            }

            if(source.useSelection !== target.useSelection) {
                return false;
            }

            if(source.useCustomEdge !== target.useCustomEdge) {
                return false;
            }

            //Group 단위 적용
            if(source.groupIdx !== target.groupIdx) {
                return false;
            }

            // 색상 비교
            if(source.color === undefined && target.color === undefined )
            {
                //둘 다 커스텀 색상인 경우 패스
            }
            // 커스텀 색상 존재 여부 (undefined 비교 존재 여부 확인)    
            else if ((source.color !== undefined && target.color !== undefined)) {
                if (source.color.equals(target.color) === false)
                    return false;
            } 
            else{
                return false;
            }

            if (view.Shader.GetUseUpdateMatrixManager() === true) {

                if (source.transformIdx !== target.transformIdx) {
                    //group 단위 확인
                    let sourceTransformGroup = view.Shader.GetUpdateMatrixGroup(source.transformIdx);
                    let targetTransformGroup = view.Shader.GetUpdateMatrixGroup(target.transformIdx);

                    if (sourceTransformGroup !== targetTransformGroup)
                        return false;
                }
                //if (source.transformIdx !== target.transformIdx)
                //  return false;
            }
            else {
                if (!source.transform.equals(target.transform))
                    return false;
            }

            return true;
        };

          
        /**
         * Action Buffer 정보 비교
         * @param {Uint8Array} srcBuffer 
         * @param {Uint8Array} trgBuffer
         * @returns 
         */
        this.EqualActionUint8Array = function (srcBuffer, trgBuffer) {
            for(let i = 0 ; i < trgBuffer.length ; i++) {
                if(srcBuffer[i] !== trgBuffer[i] ) 
                    return false;
            }
            return true;
        };
        
        /**
         * Action Buffer 정보 비교
         * @param {String} srcFileKey 
         * @param {Number} srcOrigin_id 
         * @param {String} trgFileKey 
         * @param {Number} trgOrigin_id 
         * @returns 
         */
        this.EqualNodeActionBuffer = function (srcFileKey, srcOrigin_id, trgFileKey, trgOrigin_id) {
            let srcSaitem = scope.FileActionMap.get(srcFileKey);
            let trgSaitem = scope.FileActionMap.get(trgFileKey);

            if(srcSaitem === undefined || trgSaitem === undefined)
                return false;

            if (view.Shader.GetUseUpdateMatrixManager() === true) {
                let srcActionItem = scope.GetAction(srcFileKey, srcOrigin_id);
                let trgActionItem = scope.GetAction(trgFileKey, trgOrigin_id);

                return scope.EqualAction(srcActionItem, trgActionItem);
            }
            else {

                let srcSaitem = scope.FileActionMap.get(srcFileKey);
                let trgSaitem = scope.FileActionMap.get(trgFileKey);

                if(srcSaitem === undefined || trgSaitem === undefined)
                    return false;

                let srcOffset = saitem.OffsetID.get(srcOrigin_id);
                let trgOffset = trgSaitem.OffsetID.get(trgOrigin_id);

                let arrSrcBuffer = new Uint8Array(srcSaitem.buffer, srcOffset, actionBinaryOffset);
                let arrTrgBuffer = new Uint8Array(trgSaitem.buffer, trgOffset, actionBinaryOffset);

                for(let i = 0 ; i < arrTrgBuffer.length ; i++) {
                    if(arrSrcBuffer[i] !== arrTrgBuffer[i] ) 
                        return false;
                }

                return true;
            }

        };

        /**
         * Action 복사
         * @param {Data.ActionItem} source
         * @param {Data.ActionItem} target
        */
        this.CopyAction = function (source, target) {
            source.visible = target.visible;
            source.selection = target.selection;

            source.transform.copy(target.transform);
            source.instance.copy(target.instance);

            source.material = target.material;
            source.shaderType = target.shaderType;

            source.customColor = target.customColor;
            if(source.color !== undefined && target.color !== undefined)
            {
                source.color.copy(target.color);
            }
            else if(source.color === undefined && target.color !== undefined)
            {
                source.color = new VIZCore.Color().copy(target.color);
            }
            else
            {
                source.color = undefined;
            }

            source.transformIdx = target.transformIdx;

            source.multiViewIdx = target.multiViewIdx;

            source.useEffectMode = target.useEffectMode;
            
            source.useSelection = target.useSelection;
            source.useCustomEdge = target.useCustomEdge;

            source.groupIdx = target.groupIdx;

            source.disableViewDistaceBBox = target.disableViewDistaceBBox;
            source.drawViewDistanceBBox = target.drawViewDistanceBBox;

        };
  
        /**
         * Action Buffer 복사
         * @param {String} srcFileKey 
         * @param {Number} srcOrigin_id 
         * @param {String} trgFileKey 
         * @param {Number} trgOrigin_id 
         */
         this.CopyActionBuffer = function (srcFileKey, srcOrigin_id, trgFileKey, trgOrigin_id) {
            let srcSaitem = scope.FileActionMap.get(srcFileKey);
            let trgSaitem = scope.FileActionMap.get(trgFileKey);

            if(srcSaitem === undefined || trgSaitem === undefined)
                return false;

            let srcOffset = saitem.OffsetID.get(srcOrigin_id);
            let trgOffset = trgSaitem.OffsetID.get(trgOrigin_id);
            let arrSrcBuffer = new Uint8Array(srcSaitem.buffer, srcOffset, actionBinaryOffset);
            let arrTrgBuffer = new Uint8Array(trgSaitem.buffer, trgOffset, actionBinaryOffset);

            for(let i = 0 ; i < arrTrgBuffer.length ; i++) {
                arrSrcBuffer[i] = arrTrgBuffer[i];
            }
        };

        /**
         * ActionItem To ArrayBuffer
         * @param {Data.ActionItem} action 
         * @returns {ArrayBuffer} action buffer
         */
        function getAction2ArrayBuffer (action) {

            let offset = 0;
            let buffer = new ArrayBuffer(actionBinaryOffset);

            // let buffer = new Uint8Array(actionBinaryOffset);
            // buffer.set(action.visible, offset); offset += 1;
            // buffer.set(action.selection, offset); offset += 1;       
            // buffer.set(action.transform.elements, offset); offset += 64;
            // buffer.set(action.instance.elements, offset); offset += 64
            // buffer.set(action.material, offset); offset += 4;        
            // buffer.set(action.customColor, offset); offset +=1;
            // if(action.customColor) {
            //     buffer.set(action.color, offset); offset += 16;
            // }
            // else {
            //     buffer.set([0, 0, 0, 0], offset); offset += 16;
            // }
            // buffer.set(action.transformIdx, offset); offset += 4;
            // buffer.set(action.multiViewIdx, offset); offset += 4;
            // buffer.set(action.uvAnimation, offset); offset += 1;

            //let arrBool = new Uint8Array(buffer, offset, actionBoolOffset);
            //arrBool.set([action.visible, action.selection, action.customColor, action.uvAnimation], offset); offset += 4;

            let arrBool = new Uint8Array(buffer, offset, actionBoolOffset);
            arrBool.set([action.visible, action.selection, action.customColor], offset); offset += 3;

            let floatOffset = 0;
            let arrFloat = new Float32Array(buffer, offset, actionFloatOffset);

            //Float
            arrFloat.set(action.transform.elements, floatOffset); floatOffset += 16;
            arrFloat.set(action.instance.elements, floatOffset); floatOffset += 16;
            
            if(action.customColor) {
                arrFloat.set([action.color.r,action.color.g, action.color.b, action.color.a], floatOffset); floatOffset += 4;
            }
            else {
                arrFloat.set([0, 0, 0, 0], floatOffset); floatOffset += 4;
            }

            arrFloat.set([action.material, action.transformIdx, action.multiViewIdx], floatOffset); floatOffset += 3;
            offset += floatOffset * 4;

            return buffer;
        };

        /**
         * File ArrayBuffer To ActionItem
         * @param {ArrayBuffer} buffer ShapeActionBufferItem.buffer
         * @param {Number} offset buffer 읽기 offset
         * @returns {Data.ActionItem} action
         */
        function getArrayBuffer2Action(buffer, offset) {

            let action = view.Data.ActionItem();

            //let uint8Buffer = new Uint8Array(buffer, offset, actionBinaryOffset);
            //const dataView = new DataView(buffer, offset, actionBinaryOffset);

            let arrBool = new Uint8Array(buffer, offset, actionBoolOffset); offset+= 4;
            let arrFloat = new Float32Array(buffer, offset, actionFloatOffset);

            //bool
            action.visible = arrBool[0] === 1 ? true : false;
            action.selection = arrBool[1] === 1 ? true : false;
            action.customColor = arrBool[2] === 1 ? true : false;
            //action.uvAnimation = arrBool[3] === 1 ? true : false;

            //Float
            action.transform.set2(
                arrFloat[0], arrFloat[1], arrFloat[2], arrFloat[3],
                arrFloat[4], arrFloat[5], arrFloat[6], arrFloat[7],
                arrFloat[8], arrFloat[9], arrFloat[10], arrFloat[11],
                arrFloat[12], arrFloat[13], arrFloat[14], arrFloat[15]
            );
            action.instance.set2(
                arrFloat[16], arrFloat[17], arrFloat[18], arrFloat[19],
                arrFloat[20], arrFloat[21], arrFloat[22], arrFloat[23],
                arrFloat[24], arrFloat[25], arrFloat[26], arrFloat[27],
                arrFloat[28], arrFloat[29], arrFloat[30], arrFloat[31]
            );

            if(action.customColor)
                action.color = new VIZCore.Color().set(arrFloat[32], arrFloat[33], arrFloat[34], arrFloat[35]);

            action.material = arrFloat[36];
            action.transformIdx = arrFloat[37];
            action.multiViewIdx = arrFloat[38];

            return action;
        };


        function getArrayBuffer2Selection(buffer, offset) {
            let selection = new Uint8Array(buffer, offset + 1, 1);
            return selection[0] === 1 ? true : false;
        };

        function getArrayBuffer2Visible(buffer, offset) {
            let visible = new Uint8Array(buffer, offset + 0, 1);
            return visible[0] === 1 ? true : false;
        };

        
        function setArrayBuffer2Selection(buffer, offset, selection) {
            //buffer[offset + 1] = selection === true ? 1 : 0;

            let val = new Uint8Array(buffer, offset + 1, 1);
            let binaryVal = selection === true ? 1 : 0;
            if(binaryVal === val[0]) return false;
            val[0] = binaryVal;

            return true;
        };

        function setArrayBuffer2Visible(buffer, offset, visible) {
            //buffer[offset + 0] = visible === true ? 1 : 0;

            let val = new Uint8Array(buffer, offset + 0, 1);
            let binaryVal = visible === true ? 1 : 0;
            if(binaryVal === val[0]) return false;

            val[0] = binaryVal;
            return true;
        };


        
        

    }
}



export default ShapeAction

