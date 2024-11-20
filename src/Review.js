
/**
 * VIZCore Review 관리 모듈
 * @copyright © 2021 - 2022 SOFTHILLS Co., Ltd. All rights reserved.
 * @param {Object} view View.js Instance
 * @param {Object} VIZCore ValueObject.js Instance
 * @class
 */
class Review {
    constructor(view, VIZCore) {
        let scope = this;

        //이전 배포된 코드를 동일하게 사용하기 위해 reviewItem은 Data에서 관리함. 
        //view.Data.Reviews

        // 리뷰 이동여부 설정
        this.EnableViewReviewMove = true;

        // 스냅샷 정보 저장
        this.GetSnapshotList = [];
        
        // 단면 적용시 리뷰 반영 여부 설정
        // 24-10-21 노트만 적용
        this.EnableClippingNoteReview = false;
        
        //review Text box item
        function drawTextBoxItem() {
            let item = {
                rect: new VIZCore.Rect(),
                position: [],
                text: []
            };
            return item;
        }


        this.Init = function() {

        };

        this.Clear = function() {

        };

        /**
         * Data.Reviewitem().tag 의 정보 반환
         * @param {VIZCore.Enum.REVIEW_TYPES} itemKind 
         */
        this.GetReviewItemTag = function(itemKind) {
            if(itemKind === VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE){

                //심볼 
                let item = {
                    text : "",
                    radius : 10,
                    style : {
                        font: {
                            face: "Arial",
                            size: 12,
                            color: new VIZCore.Color()
                        },
                        background: {
                            enable: true,
                            color: new VIZCore.Color()
                        },
                    }
                };
                return item;
            }
            else if(itemKind === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE
                || itemKind === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE
                || itemKind === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE){
                //vertex 
                let item = {
                    vertex_position : undefined
                };
                return item;
            }
            else if(itemKind === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE
                || itemKind === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE
                || itemKind === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE){
                //target_2_support_position 
                let item = {
                    target_2_support_position : undefined
                };
                return item;
            }
            else if(itemKind === VIZCore.Enum.REVIEW_TYPES.RK_SNAPSHOT){
                //
                let item = {
                    title : "",
                    description :"",
                    cameraId : -1,
                    thumbnail : undefined,
                    selectedIds : [],
                    drawitem : [],
                    section : []

                    }
                return item;
            };
               
            

            return undefined;
        };

        /**
         * json 읽기
         * @param {*} data 
         * @returns 
         */
        function parseJSON(data){
            if(data === undefined) return;

            // Text 줄바꿈 적용
            let textSplitLine = function(text) {
                let arrText = text.split('\r\n');
                if(arrText.length === 1)
                    arrText = text.split('\n');
                return arrText;
            };

            //리뷰의 Style 적용
            let setReviewStyle = function(review, aitem) {
                
                if(aitem.style === undefined) return;

                if(aitem.style.font !== undefined) {
                    if(aitem.style.font.size !== undefined)
                        review.style.font.size = aitem.style.font.size;
                        
                    if(aitem.style.font.color !== undefined) {
                        let hex = view.Util.GetColorByHex(aitem.style.font.color);
                        if(hex)
                            review.style.font.color.copy(hex);
                    }
                }

                if(aitem.style.border !== undefined) {
                    if(aitem.style.border.enable !== undefined)
                        review.style.border.enable = aitem.style.border.enable;
                        
                    if(aitem.style.border.color !== undefined) {
                        let hex = view.Util.GetColorByHex(aitem.style.border.color);
                        if(hex)
                            review.style.border.color.copy(hex);
                    }
                }

                if(aitem.style.background !== undefined) {
                    if(aitem.style.background.enable !== undefined)
                        review.style.background.enable = aitem.style.background.enable;
                        
                    if(aitem.style.background.color !== undefined) {
                        let hex = view.Util.GetColorByHex(aitem.style.background.color);
                        if(hex)
                            review.style.background.color.copy(hex);
                    }
                }

                if(aitem.style.arrow !== undefined) {
                    if(aitem.style.arrow.size !== undefined)
                        review.style.arrow.size = aitem.style.arrow.size;
                        
                    if(aitem.style.arrow.color !== undefined) {
                        let hex = view.Util.GetColorByHex(aitem.style.arrow.color);
                        if(hex) {
                            review.style.arrow.color.copy(hex);

                            //arrow point 포함하여 색상 변경
                            review.style.point.color.copy(hex);
                        }
                    }
                }

                if(aitem.style.line !== undefined) {
                    if(aitem.style.line.thickness !== undefined)
                        review.style.line.thickness = aitem.style.line.thickness;
                        
                    if(aitem.style.line.color !== undefined) {
                        let hex = view.Util.GetColorByHex(aitem.style.line.color);
                        if(hex)
                            review.style.line.color.copy(hex);
                    }
                }

                if(aitem.style.surface !== undefined) {
                    
                    if(aitem.style.surface.color !== undefined) {
                        let hex = view.Util.GetColorByHex(aitem.style.surface.color);
                        if(hex)
                            review.style.triangle.color.copy(hex);
                    }
                }
            };

            if(data.note) {
                for(let i = 0 ; i < data.note.length ; i++) {
                    let aitem = data.note[i];
                    let item = view.Data.ReviewItem();

                    item.origin_id = aitem.id;

                    if(aitem.kind === undefined) continue;

                    if(typeof aitem.kind !== "string") {
                        continue;                        
                    }

                    // title 필드가 없는경우 오류 발생 처리
                    if(aitem.title === undefined)
                        aitem.title = "";

                    //kind
                    //리뷰별 정보 등력
                    if(aitem.kind.localeCompare("RK_2D_NOTE") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        const viewWidth = view.Renderer.GetSizeWidth();
                        const viewHeight = view.Renderer.GetSizeHeight();

                        let screenRatio = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);
                        item.text.position = new VIZCore.Vector3(screenRatio.x * viewWidth, screenRatio.y * viewHeight, 0);
                    }
                    else if(aitem.kind.localeCompare("RK_3D_NOTE") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);
                    }
                    else if(aitem.kind.localeCompare("RK_SURFACE_NOTE") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);

                        item.drawitem.position.push(new VIZCore.Vector3(aitem.target_position.x, aitem.target_position.y, aitem.target_position.z));


                        //심볼 추가
                        if(aitem.symbol !== undefined) {
                            item.tag = scope.GetReviewItemTag(VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE);

                            item.tag.text = aitem.symbol.text;
                            item.tag.radius = aitem.symbol.radius;

                            if(aitem.symbol.color !== undefined) {
                                let hex = view.Util.GetColorByHex(aitem.symbol.color);
                                if(hex)
                                    item.tag.style.font.color.copy(hex);
                            }
                            if(aitem.symbol.bgcolor !== undefined) {
                                let hex = view.Util.GetColorByHex(aitem.symbol.bgcolor);
                                if(hex)
                                    item.tag.style.background.color.copy(hex);
                            }
                        }
                    }
                    else {
                        continue;
                    }

                    //스타일 적용
                    setReviewStyle(item, aitem);
 
                    // 보이기/ 숨기기 적용
                    if (aitem.visible !== undefined)
                        item.visible = aitem.visible;

                    //등록
                    view.Data.Reviews.push(item);
                }
            }

            if(data.measure) {
                for(let i = 0 ; i < data.measure.length ; i++) {
                    let aitem = data.measure[i];
                    let item = view.Data.ReviewItem();

                    item.origin_id = aitem.id;

                    if(aitem.kind === undefined) continue;

                    if(typeof aitem.kind !== "string") {
                        continue;                        
                    }

                    item.itemRealType = aitem.kind;

                     //kind
                    //리뷰별 정보 등력
                    if(aitem.kind.localeCompare("RK_MEASURE_POS") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_POS;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        
                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);

                        item.drawitem.position.push(new VIZCore.Vector3(aitem.target_position.x, aitem.target_position.y, aitem.target_position.z));
                    }
                    else if(aitem.kind.localeCompare("RK_MEASURE_EDGE_LENGTH") === 0 ||
                        aitem.kind.localeCompare("RK_MEASURE_DISTANCE") === 0 ||
                        aitem.kind.localeCompare("RK_MEASURE_POINT_DISTANCE") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);
                        
                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);

                        item.drawitem.position.push(new VIZCore.Vector3(aitem.target_1_position.x, aitem.target_1_position.y, aitem.target_1_position.z));
                        item.drawitem.position.push(new VIZCore.Vector3(aitem.target_2_position.x, aitem.target_2_position.y, aitem.target_2_position.z));
                    }
                    else if(aitem.kind.localeCompare("RK_MEASURE_ANGLE") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ANGLE;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);

                        item.drawitem.position.push(new VIZCore.Vector3(aitem.base_position.x, aitem.base_position.y, aitem.base_position.z));
                        item.drawitem.position.push(new VIZCore.Vector3(aitem.target_1_position.x, aitem.target_1_position.y, aitem.target_1_position.z));
                        item.drawitem.position.push(new VIZCore.Vector3(aitem.target_2_position.x, aitem.target_2_position.y, aitem.target_2_position.z));
                    }
                    else if(aitem.kind.localeCompare("RK_MEASURE_SURFACE_ANGLE") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ANGLE;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);

                        item.drawitem.position.push(new VIZCore.Vector3(aitem.angular_point_position.x, aitem.angular_point_position.y, aitem.angular_point_position.z));
                        item.drawitem.position.push(new VIZCore.Vector3(aitem.surface_1_base_position.x, aitem.surface_1_base_position.y, aitem.surface_1_base_position.z));
                        item.drawitem.position.push(new VIZCore.Vector3(aitem.surface_2_base_position.x, aitem.surface_2_base_position.y, aitem.surface_2_base_position.z));
                        // 부가정보
                        item.drawitem.position.push(new VIZCore.Vector3(aitem.surface_1_normal.x, aitem.surface_1_normal.y, aitem.surface_1_normal.z));
                        item.drawitem.position.push(new VIZCore.Vector3(aitem.surface_2_normal.x, aitem.surface_2_normal.y, aitem.surface_2_normal.z));
                    }
                    else if(aitem.kind.localeCompare("RK_MEASURE_X_AXIS_POINT_DISTANCE") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);

                        item.drawitem.position.push(new VIZCore.Vector3(aitem.target_1_position.x, aitem.target_1_position.y, aitem.target_1_position.z));
                        item.drawitem.position.push(new VIZCore.Vector3(aitem.target_2_position.x, aitem.target_2_position.y, aitem.target_2_position.z));

                        // 부가정보
                        item.tag = scope.GetReviewItemTag(item.itemType);
                        item.tag.target_2_support_position = aitem.target_2_support_position;
                    }
                    else if(aitem.kind.localeCompare("RK_MEASURE_Y_AXIS_POINT_DISTANCE") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);

                        item.drawitem.position.push(new VIZCore.Vector3(aitem.target_1_position.x, aitem.target_1_position.y, aitem.target_1_position.z));
                        item.drawitem.position.push(new VIZCore.Vector3(aitem.target_2_position.x, aitem.target_2_position.y, aitem.target_2_position.z));

                        // 부가정보
                        item.tag = scope.GetReviewItemTag(item.itemType);
                        item.tag.target_2_support_position = aitem.target_2_support_position;
                    }
                    else if(aitem.kind.localeCompare("RK_MEASURE_Z_AXIS_POINT_DISTANCE") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);

                        item.drawitem.position.push(new VIZCore.Vector3(aitem.target_1_position.x, aitem.target_1_position.y, aitem.target_1_position.z));
                        item.drawitem.position.push(new VIZCore.Vector3(aitem.target_2_position.x, aitem.target_2_position.y, aitem.target_2_position.z));

                        // 부가정보
                        item.tag = scope.GetReviewItemTag(item.itemType);
                        item.tag.target_2_support_position = aitem.target_2_support_position;
                    }
                    else if(aitem.kind.localeCompare("RK_MEASURE_LINKED_AREA") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKEDAREA;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);

                        for(let j = 0 ; j < aitem.vertex_position.length ; j++)
                        {
                            item.drawitem.position.push(new VIZCore.Vector3(aitem.vertex_position[j].x, aitem.vertex_position[j].y, aitem.vertex_position[j].z));                            
                        }

                    }
                    else if(aitem.kind.localeCompare("RK_MEASURE_LINKED_DISTANCE") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_DISTANCE;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);

                        for(let j = 0 ; j < aitem.vertex_position.length ; j++)
                        {
                            item.drawitem.position.push(new VIZCore.Vector3(aitem.vertex_position[j].x, aitem.vertex_position[j].y, aitem.vertex_position[j].z));                            
                        }
                    }
                    else if(aitem.kind.localeCompare("RK_MEASURE_X_AXIS_LINKED_DISTANCE") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);

                        for(let j = 0 ; j < aitem.vertex_position.length ; j++)
                        {
                            //item.drawitem.position.push(new VIZCore.Vector3(aitem.vertex_position[j].x, aitem.vertex_position[j].y, aitem.vertex_position[j].z));

                            if(j === 0) {
                                item.drawitem.position.push(new VIZCore.Vector3(aitem.vertex_position[j].target_1_position.x, aitem.vertex_position[j].target_1_position.y, aitem.vertex_position[j].target_1_position.z));
                                item.drawitem.position.push(new VIZCore.Vector3(aitem.vertex_position[j].target_2_position.x, aitem.vertex_position[j].target_2_position.y, aitem.vertex_position[j].target_2_position.z));
                            }
                            else {
                                item.drawitem.position.push(new VIZCore.Vector3(aitem.vertex_position[j].target_2_position.x, aitem.vertex_position[j].target_2_position.y, aitem.vertex_position[j].target_2_position.z));
                            }
                        }

                        // 부가정보
                        item.tag = scope.GetReviewItemTag(item.itemType);
                        item.tag.vertex_position = aitem.vertex_position;
                    }
                    else if(aitem.kind.localeCompare("RK_MEASURE_Y_AXIS_LINKED_DISTANCE") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);

                        for(let j = 0 ; j < aitem.vertex_position.length ; j++)
                        {
                            //item.drawitem.position.push(new VIZCore.Vector3(aitem.vertex_position[j].x, aitem.vertex_position[j].y, aitem.vertex_position[j].z));

                            if(j === 0) {
                                item.drawitem.position.push(new VIZCore.Vector3(aitem.vertex_position[j].target_1_position.x, aitem.vertex_position[j].target_1_position.y, aitem.vertex_position[j].target_1_position.z));
                                item.drawitem.position.push(new VIZCore.Vector3(aitem.vertex_position[j].target_2_position.x, aitem.vertex_position[j].target_2_position.y, aitem.vertex_position[j].target_2_position.z));
                            }
                            else {
                                item.drawitem.position.push(new VIZCore.Vector3(aitem.vertex_position[j].target_2_position.x, aitem.vertex_position[j].target_2_position.y, aitem.vertex_position[j].target_2_position.z));
                            }
                        }

                         // 부가정보
                         item.tag = scope.GetReviewItemTag(item.itemType);
                         item.tag.vertex_position = aitem.vertex_position;
                    }
                    else if(aitem.kind.localeCompare("RK_MEASURE_Z_AXIS_LINKED_DISTANCE") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);

                        for(let j = 0 ; j < aitem.vertex_position.length ; j++)
                        {
                            //item.drawitem.position.push(new VIZCore.Vector3(aitem.vertex_position[j].x, aitem.vertex_position[j].y, aitem.vertex_position[j].z));

                            if(j === 0) {
                                item.drawitem.position.push(new VIZCore.Vector3(aitem.vertex_position[j].target_1_position.x, aitem.vertex_position[j].target_1_position.y, aitem.vertex_position[j].target_1_position.z));
                                item.drawitem.position.push(new VIZCore.Vector3(aitem.vertex_position[j].target_2_position.x, aitem.vertex_position[j].target_2_position.y, aitem.vertex_position[j].target_2_position.z));
                            }
                            else {
                                item.drawitem.position.push(new VIZCore.Vector3(aitem.vertex_position[j].target_2_position.x, aitem.vertex_position[j].target_2_position.y, aitem.vertex_position[j].target_2_position.z));
                            }
                        }

                         // 부가정보
                         item.tag = scope.GetReviewItemTag(item.itemType);
                         item.tag.vertex_position = aitem.vertex_position;
                    }
                    else if(aitem.kind.localeCompare("RK_MEASURE_CUSTOM_AXIS_DISTANCE") === 0) {
                        item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CUSTOM_AXIS_DISTANCE;

                        let arrText = textSplitLine(aitem.title);
                        item.text.value.push(...arrText);

                        item.text.position = new VIZCore.Vector3(aitem.text_position.x, aitem.text_position.y, aitem.text_position.z);

                        item.drawitem.position.push(new VIZCore.Vector3(aitem.target_1_position.x, aitem.target_1_position.y, aitem.target_1_position.z));
                        item.drawitem.position.push(new VIZCore.Vector3(aitem.target_2_position.x, aitem.target_2_position.y, aitem.target_2_position.z));
                        item.drawitem.position.push(new VIZCore.Vector3(aitem.axis_direction.x, aitem.axis_direction.y, aitem.axis_direction.z));
                    }
                    else {
                        continue;
                    }


                    //스타일 적용
                    setReviewStyle(item, aitem);

                    // 보이기/ 숨기기 적용
                    if (aitem.visible !== undefined)
                        item.visible = aitem.visible;

                    //등록
                    view.Data.Reviews.push(item);
                }

            }

            if(data.snapShot) {
                for(let i = 0 ; i < data.snapShot.length ; i++) {
                    let aitem = data.snapShot[i];
                    let item = view.Data.CameraDataItem();

                    if(aitem.perspective !== undefined)
                        item.perspectiveView = aitem.perspective;
                    
                    if(aitem.cameraMatrix !== undefined)
                        item.matrix_camera.setArray(aitem.cameraMatrix);

                    if(aitem.cameraZoom !== undefined)
                        item.zoom = aitem.cameraZoom;

                    if(aitem.cameraDistance !== undefined)
                        item.distance = aitem.cameraDistance;

                    if(aitem.thumbnail !== undefined)
                        item.thumbnail = aitem.thumbnail;
                    
                    if(aitem.cameraDepth !== undefined)
                        item.CameraDepth = aitem.cameraDepth;
                    
                    if(aitem.cameraPivot !== undefined)
                        item.pivot = aitem.cameraPivot;

                    if (aitem.title !== undefined)
                        item.title = aitem.title;

                    // VIZWide3D에서는 CameraPivot가 아닌 pivot로 사용
                    //if (aitem.pivot !== undefined)
                        //item.pivot = new VIZCore.Vector3().copy(aitem.pivot);

                    //min max
                    if (aitem.cameraMin && aitem.cameraMax)
                    {
                        item.cameraMin.set(aitem.cameraMin.x, aitem.cameraMin.y, aitem.cameraMin.z);
                        item.cameraMax.set(aitem.cameraMax.x, aitem.cameraMax.y, aitem.cameraMax.z);
                    }

                    view.Camera.SetBackup(item);

                    let review = view.Interface.Review.Snapshot.New();
                    //let thumbnail = view.Interface.View.GetCurrentImage(true);
                    //review.tag.thumbnail = thumbnail.replace('data:image/png;base64,', '');
                    review.tag.thumbnail = item.thumbnail;
                    review.tag.cameraId = item.id;

                    // origin id 
                    review.origin_id = aitem.id;
                    
                    if (aitem.title !== undefined)
                        review.tag.title = aitem.title;

                    if (aitem.description !== undefined)
                        review.tag.description = aitem.description;

                    if(aitem.selectedIds !== undefined)
                    {
                        review.tag.selectedIds = aitem.selectedIds;
                    }

                    if(aitem.drawitem !== undefined)
                    {
                        review.tag.drawitem = [];
                        for(let j = 0; j < aitem.drawitem.length; j++)
                        {
                            let itemDraw = aitem.drawitem[j];
                            let itemReview = view.Data.ReviewItem();
                            setReviewStyle(itemReview, itemDraw);
                            itemReview.itemType = VIZCore.Enum.REVIEW_TYPES.RK_SKETCH;

                            itemReview.drawitem = itemDraw.drawitem;

                            review.tag.drawitem.push(itemReview);
                        }
                    }

                    //단면정보 snapshot 등록
                    if(aitem.section !== undefined)
                    {
                        let xClipAxis, yClipAxis, zClipAxis;
	                    xClipAxis = new VIZCore.Vector3(1.0, 0.0, 0.0);
	                    yClipAxis = new VIZCore.Vector3(0.0, 1.0, 0.0);
	                    zClipAxis = new VIZCore.Vector3(0.0, 0.0, 1.0);
                        for(let j = 0 ; j < aitem.section.length ; j++)
                        {
                            let clipItem = view.Data.ClipItem();

                            let bSectionEnable = aitem.section[j].enable;
                            if(!bSectionEnable) continue;

                            if(aitem.section[j].type === 0) {

                                //단면 단방향 적용하지 않은경우 패스
                                if(aitem.section[j].plane[0].clip === 0) continue;

                                //회전한 단면은 개선필요
                                if(Math.abs(xClipAxis.dot(aitem.section[j].plane[0].normal)) > 0.9999) {
                                    //x축 방향
                                    clipItem.itemType = VIZCore.Enum.CLIPPING_MODES.X;
                                }
                                else if(Math.abs(yClipAxis.dot(aitem.section[j].plane[0].normal)) > 0.9999) {
                                    //y축 방향
                                    clipItem.itemType = VIZCore.Enum.CLIPPING_MODES.Y;
                                }
                                else if(Math.abs(zClipAxis.dot(aitem.section[j].plane[0].normal)) > 0.9999) {
                                    //z축 방향
                                    clipItem.itemType = VIZCore.Enum.CLIPPING_MODES.Z;
                                }
                                else 
                                    continue;

                                clipItem.clip = aitem.section[j].clip;
                                clipItem.enable = aitem.section[j].enable;

                                let planeItem = view.Data.ClipPlane();
                                planeItem.normal.set(aitem.section[j].plane[0].normal.x, aitem.section[j].plane[0].normal.y, aitem.section[j].plane[0].normal.z);
                                planeItem.center.set(aitem.section[j].plane[0].center.x, aitem.section[j].plane[0].center.y, aitem.section[j].plane[0].center.z);

                                clipItem.planes[0] = planeItem;
                            }
                            else if(aitem.section[j].type === 1) {
                                clipItem.itemType = VIZCore.Enum.CLIPPING_MODES.BOX;
                                for(let k = 0; k < aitem.section[j].plane.length ; k++)
                                {
                                    let planeItem = view.Data.ClipPlane();
                                    planeItem.normal.set(aitem.section[j].plane[k].normal.x, aitem.section[j].plane[k].normal.y, aitem.section[j].plane[k].normal.z);
                                    planeItem.center.set(aitem.section[j].plane[k].center.x, aitem.section[j].plane[k].center.y, aitem.section[j].plane[k].center.z);

                                    clipItem.planes[k] = planeItem;
                                }
                            }
                            else if(aitem.section[j].type === 2) {
                                //인박스
                                continue;
                            }
                            else if(aitem.section[j].sectionType === 3) {
                                //박스 리버스
                                continue;
                            }
                            else continue;

                            //VIZWide3D에서는 1개만 등록
                            review.tag.section.push(clipItem);
                            break;
                           
                        }
                    }

                    //스타일 적용
                    setReviewStyle(item, aitem);

                    // 보이기/ 숨기기 적용
                    if (aitem.visible !== undefined)
                        item.visible = aitem.visible;

                    view.Interface.Review.Snapshot.AddItem(review);
                }
            }
            
            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Changed, view.Data.Reviews);
            view.Renderer.Render();
        }

        this.ParseJSON = function(data){
            parseJSON(data);
        }

        /**
         * Review Item Type 구분
         * @param {*} VIZCore.Enum.REVIEW_TYPES itemType
         * @returns -1 : Unknown, 0 : Note, 1 : Measure, 2 : Snapshot, 3 : DrawItem
         */
        this.GetReviewType = (itemType)=>{
            let result = -1;
            switch(itemType)
            {
                case VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE : 
                case VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE : 
                case VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE : 
                case VIZCore.Enum.REVIEW_TYPES.RK_TOOLTIP_NOTE : 
                case VIZCore.Enum.REVIEW_TYPES.RK_HEADER_NOTE : 
                case VIZCore.Enum.REVIEW_TYPES.RK_IMAGE_NOTE : 
                case VIZCore.Enum.REVIEW_TYPES.RK_CUSTOM:
                {
                    result = 0;
                }
                break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_POS: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ANGLE:
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_OBJECTMINDISTANCE:
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_NORMALDISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_HORIZONTALITYDISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ORTHOMINDISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_XY_AXIS_DISTANCE:
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_YZ_AXIS_DISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ZX_AXIS_DISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_SMART_AXIS_DISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKEDAREA: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_SURFACEDISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_DISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_AXIS_DISTANCE:
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ONE_POINT_FIXED_DISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CUSTOM_AXIS_DISTANCE: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CYLINDER_PLANE_DISTANCE:
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CYLINDER_CYLINDER_CROSS_POINT:
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_NORMAL_PLANE_CROSS_POINT: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_BOUNDBOX: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_PICKITEM: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CIRCLE_RADIUS: 
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CIRCLE_DIAMETER: 
                
                {
                    result = 1;
                }
                break;
                case VIZCore.Enum.REVIEW_TYPES.RK_SNAPSHOT: {
                    result = 2;
                }
                break;
                case VIZCore.Enum.REVIEW_TYPES.RK_PATH:
                case VIZCore.Enum.REVIEW_TYPES.RK_SKETCH:
                {
                    result = 3;
                }
                break;
                default : {
                    result = -1;
                }
            }

            return result;
        };

        /**
         * JSON File Review Json
         * @param {string} path Url
         * @returns 
         */
        this.AddFile = function(path, callback) {
            let fileData = view.Data.FileData();
            //fileData.Url = './VIZCore3D/Model/toycar/vizw/toycar.json';
            fileData.Url = path;
            fileData.DataType = -1;
            view.Loader.LoadReview(fileData, function (data) {
                //console.log("JSON :: ", data);
                if(data === null)
                {
                    if(callback !== undefined)
                    {
                        callback(false);
                    }
                    return;
                }
                    

                parseJSON(data);
                if(callback !== undefined)
                {
                    callback(true);
                }
            }, undefined);

            return fileData;
        };

        this.ExportJSON = function(){
            let objExport = {
                note : [],
                measure : [],
                snapShot : []
            };

            let getExportReviewItem = function(){
                let item = {

                };
                return item;
            };

            let setReviewStyle = function(source, target){
                if(source.style === undefined) return;
                
                target.style = {};

                if(source.style.font !== undefined) {
                    target.style.font = {};
                    if(source.style.font.size !== undefined)
                        target.style.font.size = source.style.font.size;
                        
                    if(source.style.font.color !== undefined) {
                        target.style.font.color = source.style.font.color.toHexARGB();
                    }
                }

                if(source.style.border !== undefined) {
                    target.style.border = {};
                    if(source.style.border.enable !== undefined)
                        target.style.border.enable = source.style.border.enable;
                        
                    if(source.style.border.color !== undefined) {
                        target.style.border.color = source.style.border.color.toHexARGB();
                    }
                }

                if(source.style.background !== undefined) {
                    target.style.background = {};
                    if(source.style.background.enable !== undefined)
                        target.style.background.enable = source.style.background.enable;
                        
                    if(source.style.background.color !== undefined) {
                        target.style.background.color = source.style.background.color.toHexARGB();
                    }
                }

                if(source.style.arrow !== undefined) {
                    target.style.arrow = {};
                    if(source.style.arrow.size !== undefined)
                        target.style.arrow.size = source.style.arrow.size;
                    
                    if(source.style.arrow.color !== undefined) {
                        target.style.arrow.color = source.style.arrow.color.toHexARGB();
                    }
                }

                if(source.style.line !== undefined) {
                    target.style.line = {};
                    if(source.style.line.thickness !== undefined)
                        target.style.line.thickness = source.style.line.thickness;
                        
                    if(source.style.line.color !== undefined) {
                        target.style.line.color = source.style.line.color.toHexARGB();
                    }
                }

                if(source.style.triangle !== undefined)
                {
                    target.style.surface = {};
                    if(source.style.triangle.color !== undefined)
                    {
                        target.style.surface.color = source.style.triangle.color.toHexARGB();
                    }
                }

                
                
            };

            let setPosition = function(propname, obj, pos){
                obj[propname] = {};
                if(Array.isArray(pos))
                {
                    obj[propname] = [];
                    for(let i = 0 ; i < pos.length ; i++)
                    {
                        obj[propname].push({x : pos[i].x, y : pos[i].y, z : pos[i].z});
                    }
                }
                else{
                    obj[propname].x = pos.x;
                    obj[propname].y = pos.y;
                    obj[propname].z = pos.z;
                }
            };

            let setType = function(review, obj){
                switch(review.itemType)
                {
                    case VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE : {
                        obj.kind = "RK_2D_NOTE";
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE : {
                        obj.kind = "RK_3D_NOTE";
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE : {
                        obj.kind = "RK_SURFACE_NOTE";
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_POS : {
                        obj.kind = "RK_MEASURE_POS";
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE : 
                    {
                        obj.kind = "RK_MEASURE_DISTANCE";

                        if(review.itemRealType !== undefined)
                        {
                            obj.kind = review.itemRealType;
                        }
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ANGLE : 
                    {
                        obj.kind = "RK_MEASURE_ANGLE";

                        if(review.itemRealType !== undefined)
                        {
                            obj.kind = review.itemRealType;
                        }
                    }break;

                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE : 
                    {
                        obj.kind = "RK_MEASURE_X_AXIS_POINT_DISTANCE";
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE : {
                        obj.kind = "RK_MEASURE_Y_AXIS_POINT_DISTANCE";
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE : {
                        obj.kind = "RK_MEASURE_Z_AXIS_POINT_DISTANCE";
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKEDAREA : {
                        obj.kind = "RK_MEASURE_LINKED_AREA";
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_DISTANCE : {
                        obj.kind = "RK_MEASURE_LINKED_DISTANCE";
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE : {
                        obj.kind = "RK_MEASURE_X_AXIS_LINKED_DISTANCE";
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE : {
                        obj.kind = "RK_MEASURE_Y_AXIS_LINKED_DISTANCE";
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE : {
                        obj.kind = "RK_MEASURE_Z_AXIS_LINKED_DISTANCE";
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_SKETCH : {
                        obj.kind = "RK_SKETCH";
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CUSTOM_AXIS_DISTANCE : {
                        obj.kind = "RK_MEASURE_CUSTOM_AXIS_DISTANCE";
                    }break;
                    default : break;
                }
            };

            let setExportReviewItem = function(review)
            {
                let obj = getExportReviewItem();

                // id 적용
                obj.id = review.id;
                // 타이틀 적용
                obj.title = review.text.value.join('\r\n');
                // 타입 적용
                setType(review, obj);

                // 스타일 적용
                setReviewStyle(review, obj);

                // 타입별 리뷰 정보 등록
                switch(review.itemType)
                {
                    case VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE : {
                        if(review.text.position !== undefined)
                        {
                            // 화면 비율 계산
                            const viewWidth = view.Renderer.GetSizeWidth();
                            const viewHeight = view.Renderer.GetSizeHeight();

                            let pos = new VIZCore.Vector3().copy(review.text.position);
                            pos.x = pos.x / viewWidth;
                            pos.y = pos.y / viewHeight;

                            setPosition("text_position", obj, pos);
                        }
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE : {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE : {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                        if(review.drawitem.position !== undefined)
                        {
                            setPosition("target_position", obj, review.drawitem.position[0]);
                        }
                        if(review.tag !== undefined)
                        {
                            obj.symbol = {};
                            obj.symbol.text = review.tag.text;
                            obj.symbol.radius = review.tag.radius;

                            if(review.tag.style !== undefined)
                            {
                                if(review.tag.style.font !== undefined && review.tag.style.font.color !== undefined)
                                    obj.symbol.color = review.tag.style.font.color.toHexARGB();

                                if(review.tag.style.background !== undefined && review.tag.style.background.color !== undefined)
                                    obj.symbol.bgcolor = review.tag.style.background.color.toHexARGB();

                            }
                        }
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_POS : {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                        if(review.drawitem.position !== undefined)
                        {
                            setPosition("target_position", obj, review.drawitem.position[0]);
                        }
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE : 
                    {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                        if(review.drawitem.position !== undefined)
                        {
                            if(review.drawitem.position.length !== undefined && review.drawitem.position.length === 2)
                            {
                                setPosition("target_1_position", obj, review.drawitem.position[0]);
                                setPosition("target_2_position", obj, review.drawitem.position[1]);
                            }
                            else
                            {
                                setPosition("target_position", obj, review.drawitem.position);
                            }
                        }
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ANGLE : 
                    {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }

                        if(review.itemRealType !== undefined)
                        {
                            if(review.itemRealType.localeCompare("RK_MEASURE_ANGLE") === 0) {
                                // RK_MEASURE_ANGLE
                                if(review.drawitem.position.length !== undefined && review.drawitem.position.length === 3)
                                {
                                    setPosition("base_position", obj, review.drawitem.position[0]);
                                    setPosition("target_1_position", obj, review.drawitem.position[1]);
                                    setPosition("target_2_position", obj, review.drawitem.position[2]);
                                }
                                else
                                {
                                    setPosition("target_position", obj, review.drawitem.position);
                                }
                            }
                            else if(review.itemRealType.localeCompare("RK_MEASURE_SURFACE_ANGLE") === 0) {
                                //RK_MEASURE_SURFACE_ANGLE
                                if(review.drawitem.position.length !== undefined && review.drawitem.position.length === 5)
                                {
                                    setPosition("angular_point_position", obj, review.drawitem.position[0]);
                                    setPosition("surface_1_base_position", obj, review.drawitem.position[1]);
                                    setPosition("surface_2_base_position", obj, review.drawitem.position[2]);
                                    setPosition("surface_1_normal", obj, review.drawitem.position[3]);
                                    setPosition("surface_2_normal", obj, review.drawitem.position[4]);
                                }
                                else
                                {
                                    setPosition("target_position", obj, review.drawitem.position);
                                }
                            }
                        }
                        else{
                            if(review.drawitem.position !== undefined)
                            {
                                if(review.drawitem.position.length !== undefined && review.drawitem.position.length === 3)
                                {
                                    setPosition("base_position", obj, review.drawitem.position[0]);
                                    setPosition("target_1_position", obj, review.drawitem.position[1]);
                                    setPosition("target_2_position", obj, review.drawitem.position[2]);
                                }
                                else
                                {
                                    setPosition("target_position", obj, review.drawitem.position[0]);
                                }
                            }
                        }
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE : 
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE : 
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE : 
                    {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                        if(review.drawitem.position !== undefined)
                        {
                            if(review.drawitem.position.length !== undefined && review.drawitem.position.length === 2)
                            {
                                setPosition("target_1_position", obj, review.drawitem.position[0]);
                                setPosition("target_2_position", obj, review.drawitem.position[1]);
                            }
                            else
                            {
                                setPosition("target_position", obj, review.drawitem.position);
                            }
                        }
                        if(review.tag !== undefined)
                        {
                            obj.target_2_support_position = review.tag.target_2_support_position;
                        }
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKEDAREA : 
                    {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                        if(review.drawitem.position !== undefined)
                        {
                            if(review.drawitem.position.length !== undefined)
                            {
                                setPosition("vertex_position", obj, review.drawitem.position);
                            }
                            else
                            {
                                setPosition("target_position", obj, review.drawitem.position);
                            }
                        }
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_DISTANCE : 
                    {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                        if(review.drawitem.position !== undefined)
                        {
                            if(review.drawitem.position.length !== undefined)
                            {
                                setPosition("vertex_position", obj, review.drawitem.position);
                            }
                            else
                            {
                                setPosition("target_position", obj, review.drawitem.position);
                            }
                        }
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE : 
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE : 
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE : 
                    {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }

                         if(review.tag !== undefined)
                         {
                            obj.vertex_position = review.tag;
                         }
                         else{
                            // Viewer에서 만들어진 데이터 기반으로 생성
                            if(review.drawitem.position !== undefined)
                            {
                                if(review.drawitem.position.length !== undefined)
                                {
                                    obj.vertex_position = [];
                                    for(let i = 1; i <review.drawitem.position.length; i++)
                                    {
                                        let objSub = {
                                            text_position : {},
                                            target_1_position : {},
                                            target_2_position : {},
                                            target_2_support_position : {},
                                        };

                                        objSub.text_position.x = review.drawitem.position[i-1].x;
                                        objSub.text_position.y = review.drawitem.position[i-1].y;
                                        objSub.text_position.z = review.drawitem.position[i-1].z;

                                        objSub.target_1_position.x = review.drawitem.position[i-1].x;
                                        objSub.target_1_position.y = review.drawitem.position[i-1].y;
                                        objSub.target_1_position.z = review.drawitem.position[i-1].z;

                                        objSub.target_2_position.x = review.drawitem.position[i].x;
                                        objSub.target_2_position.y = review.drawitem.position[i].y;
                                        objSub.target_2_position.z = review.drawitem.position[i].z;

                                        // 축별 변경
                                        if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE)
                                        {
                                            objSub.target_2_support_position.x = review.drawitem.position[i].x;
                                            objSub.target_2_support_position.y = review.drawitem.position[0].y;
                                            objSub.target_2_support_position.z = review.drawitem.position[0].z;
                                        }
                                        if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE)
                                        {
                                            objSub.target_2_support_position.x = review.drawitem.position[0].x;
                                            objSub.target_2_support_position.y = review.drawitem.position[i].y;
                                            objSub.target_2_support_position.z = review.drawitem.position[0].z;
                                        }
                                        if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE)
                                        {
                                            objSub.target_2_support_position.x = review.drawitem.position[0].x;
                                            objSub.target_2_support_position.y = review.drawitem.position[0].y;
                                            objSub.target_2_support_position.z = review.drawitem.position[i].z;
                                        }

                                        obj.vertex_position.push(objSub);
                                        
                                        //setPosition("target_1_position", obj, review.drawitem.position);    
                                    }
                                }
                                else
                                {
                                    setPosition("target_position", obj, review.drawitem.position);
                                }
                            }
                        }
                    }break;

                    case VIZCore.Enum.REVIEW_TYPES.RK_SNAPSHOT : {
                        let snapshot = view.Camera.GetCameraData(review.tag.cameraId);
                        let item = getExportReviewItem();
                        
                        // id 적용
                        if (review.origin_id !== undefined){
                            item.id = review.origin_id;
                        }
                        else{   
                            item.id = i;
                        } 
                        item.Perspective = snapshot.perspectiveView;
                        item.CameraMatrix = snapshot.matrix_camera.elements;
                        item.CameraDistance = snapshot.distance;
                        item.CameraZoom = snapshot.zoom;
                        item.Thumbnail = review.tag.thumbnail;
                        item.CameraDepth = snapshot.CameraDepth;
                        item.CameraPivot = snapshot.CameraPivot;
                        item.title = review.tag.title;
                        item.description = review.tag.description;

                        item.drawitem = review.tag.drawitem;
                        item.selectedIds = review.tag.selectedIds;
                        item.section = review.tag.section;                    
                        
                        
                    }break;

                    case VIZCore.Enum.REVIEW_TYPES.RK_SKETCH : {
                        console.log(review);
                    }break;
                    
                    default : break;
                }

                return obj;
            }

            // Note, Measure
            for(let i = 0 ; i < view.Data.Reviews.length ; i++) {
                let review = view.Data.Reviews[i];

                let obj = getExportReviewItem();

                // id 적용
                if (review.origin_id !== undefined){
                    obj.id = review.origin_id;
                }
                else{   
                    obj.id = i;
                }
              
                // 타이틀 적용
                obj.title = review.text.value.join('\r\n');
                // 타입 적용
                setType(review, obj);

                // 스타일 적용
                setReviewStyle(review, obj);

                // 보이기/ 숨기기 적용
                obj.visible = review.visible;
                
                // 타입별 리뷰 정보 등록
                switch(review.itemType)
                {
                    case VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE : {
                        if(review.text.position !== undefined)
                        {
                            // 화면 비율 계산
                            const viewWidth = view.Renderer.GetSizeWidth();
                            const viewHeight = view.Renderer.GetSizeHeight();

                            let pos = new VIZCore.Vector3().copy(review.text.position);
                            pos.x = pos.x / viewWidth;
                            pos.y = pos.y / viewHeight;

                            setPosition("text_position", obj, pos);
                        }
                        
                        objExport.note.push(obj);
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE : {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                        
                        objExport.note.push(obj);
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE : {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                        if(review.drawitem.position !== undefined)
                        {
                            setPosition("target_position", obj, review.drawitem.position[0]);
                        }
                        if(review.tag !== undefined)
                        {
                            obj.symbol = {};
                            obj.symbol.text = review.tag.text;
                            obj.symbol.radius = review.tag.radius;

                            if(review.tag.style !== undefined)
                            {
                                if(review.tag.style.font !== undefined && review.tag.style.font.color !== undefined)
                                    obj.symbol.color = review.tag.style.font.color.toHexARGB();

                                if(review.tag.style.background !== undefined && review.tag.style.background.color !== undefined)
                                    obj.symbol.bgcolor = review.tag.style.background.color.toHexARGB();

                            }
                        }
                        
                        objExport.note.push(obj);
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_POS : {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                        if(review.drawitem.position !== undefined)
                        {
                            setPosition("target_position", obj, review.drawitem.position[0]);
                        }
                        
                        objExport.measure.push(obj);
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE : 
                    {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                        if(review.drawitem.position !== undefined)
                        {
                            if(review.drawitem.position.length !== undefined && review.drawitem.position.length === 2)
                            {
                                setPosition("target_1_position", obj, review.drawitem.position[0]);
                                setPosition("target_2_position", obj, review.drawitem.position[1]);
                            }
                            else
                            {
                                setPosition("target_position", obj, review.drawitem.position);
                            }
                        }
                        
                        objExport.measure.push(obj);
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ANGLE : 
                    {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }

                        if(review.itemRealType !== undefined)
                        {
                            if(review.itemRealType.localeCompare("RK_MEASURE_ANGLE") === 0) {
                                // RK_MEASURE_ANGLE
                                if(review.drawitem.position.length !== undefined && review.drawitem.position.length === 3)
                                {
                                    setPosition("base_position", obj, review.drawitem.position[0]);
                                    setPosition("target_1_position", obj, review.drawitem.position[1]);
                                    setPosition("target_2_position", obj, review.drawitem.position[2]);
                                }
                                else
                                {
                                    setPosition("target_position", obj, review.drawitem.position);
                                }
                            }
                            else if(review.itemRealType.localeCompare("RK_MEASURE_SURFACE_ANGLE") === 0) {
                                //RK_MEASURE_SURFACE_ANGLE
                                if(review.drawitem.position.length !== undefined && review.drawitem.position.length === 5)
                                {
                                    setPosition("angular_point_position", obj, review.drawitem.position[0]);
                                    setPosition("surface_1_base_position", obj, review.drawitem.position[1]);
                                    setPosition("surface_2_base_position", obj, review.drawitem.position[2]);
                                    setPosition("surface_1_normal", obj, review.drawitem.position[3]);
                                    setPosition("surface_2_normal", obj, review.drawitem.position[4]);
                                }
                                else
                                {
                                    setPosition("target_position", obj, review.drawitem.position);
                                }
                            }
                        }
                        else{
                            if(review.drawitem.position !== undefined)
                            {
                                if(review.drawitem.position.length !== undefined && review.drawitem.position.length === 3)
                                {
                                    setPosition("base_position", obj, review.drawitem.position[0]);
                                    setPosition("target_1_position", obj, review.drawitem.position[1]);
                                    setPosition("target_2_position", obj, review.drawitem.position[2]);
                                }
                                else
                                {
                                    setPosition("target_position", obj, review.drawitem.position[0]);
                                }
                            }
                        }
                        
                        objExport.measure.push(obj);
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE : 
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE : 
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE : 
                    {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                        if(review.drawitem.position !== undefined)
                        {
                            if(review.drawitem.position.length !== undefined && review.drawitem.position.length === 2)
                            {
                                setPosition("target_1_position", obj, review.drawitem.position[0]);
                                setPosition("target_2_position", obj, review.drawitem.position[1]);
                            }
                            else
                            {
                                setPosition("target_position", obj, review.drawitem.position);
                            }
                        }
                        if(review.tag !== undefined)
                        {
                            obj.target_2_support_position = review.tag.target_2_support_position;
                        }
                        
                        objExport.measure.push(obj);
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKEDAREA : 
                    {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                        if(review.drawitem.position !== undefined)
                        {
                            if(review.drawitem.position.length !== undefined)
                            {
                                setPosition("vertex_position", obj, review.drawitem.position);
                            }
                            else
                            {
                                setPosition("target_position", obj, review.drawitem.position);
                            }
                        }
                        
                        objExport.measure.push(obj);
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_DISTANCE : 
                    {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                        if(review.drawitem.position !== undefined)
                        {
                            if(review.drawitem.position.length !== undefined)
                            {
                                setPosition("vertex_position", obj, review.drawitem.position);
                            }
                            else
                            {
                                setPosition("target_position", obj, review.drawitem.position);
                            }
                        }
                        
                        objExport.measure.push(obj);
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE : 
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE : 
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE : 
                    {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }

                         if(review.tag !== undefined)
                         {
                            obj.vertex_position = review.tag;
                         }
                         else{
                            // Viewer에서 만들어진 데이터 기반으로 생성
                            if(review.drawitem.position !== undefined)
                            {
                                if(review.drawitem.position.length !== undefined)
                                {
                                    obj.vertex_position = [];
                                    for(let i = 1; i <review.drawitem.position.length; i++)
                                    {
                                        let objSub = {
                                            text_position : {},
                                            target_1_position : {},
                                            target_2_position : {},
                                            target_2_support_position : {},
                                        };

                                        objSub.text_position.x = review.drawitem.position[i-1].x;
                                        objSub.text_position.y = review.drawitem.position[i-1].y;
                                        objSub.text_position.z = review.drawitem.position[i-1].z;

                                        objSub.target_1_position.x = review.drawitem.position[i-1].x;
                                        objSub.target_1_position.y = review.drawitem.position[i-1].y;
                                        objSub.target_1_position.z = review.drawitem.position[i-1].z;

                                        objSub.target_2_position.x = review.drawitem.position[i].x;
                                        objSub.target_2_position.y = review.drawitem.position[i].y;
                                        objSub.target_2_position.z = review.drawitem.position[i].z;

                                        // 축별 변경
                                        if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE)
                                        {
                                            objSub.target_2_support_position.x = review.drawitem.position[i].x;
                                            objSub.target_2_support_position.y = review.drawitem.position[0].y;
                                            objSub.target_2_support_position.z = review.drawitem.position[0].z;
                                        }
                                        if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE)
                                        {
                                            objSub.target_2_support_position.x = review.drawitem.position[0].x;
                                            objSub.target_2_support_position.y = review.drawitem.position[i].y;
                                            objSub.target_2_support_position.z = review.drawitem.position[0].z;
                                        }
                                        if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE)
                                        {
                                            objSub.target_2_support_position.x = review.drawitem.position[0].x;
                                            objSub.target_2_support_position.y = review.drawitem.position[0].y;
                                            objSub.target_2_support_position.z = review.drawitem.position[i].z;
                                        }

                                        obj.vertex_position.push(objSub);
                                        
                                        //setPosition("target_1_position", obj, review.drawitem.position);    
                                    }
                                }
                                else
                                {
                                    setPosition("target_position", obj, review.drawitem.position);
                                }
                            }
                        }
                        
                        objExport.measure.push(obj);
                    }break;
                    case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CUSTOM_AXIS_DISTANCE : 
                    {
                        if(review.text.position !== undefined)
                        {
                            setPosition("text_position", obj, review.text.position);
                        }
                        if(review.drawitem.position !== undefined)
                        {
                            if(review.drawitem.position.length !== undefined && review.drawitem.position.length === 3)
                            {
                                setPosition("target_1_position", obj, review.drawitem.position[0]);
                                setPosition("target_2_position", obj, review.drawitem.position[1]);
                                setPosition("axis_direction", obj, review.drawitem.position[2]);
                            }
                            else
                            {
                                setPosition("target_position", obj, review.drawitem.position);
                            }
                        }
                        
                        objExport.measure.push(obj);
                    }break;

                    case VIZCore.Enum.REVIEW_TYPES.RK_SNAPSHOT : {
                        let snapshot = view.Camera.GetBackupData(review.tag.cameraId);
                        let item = getExportReviewItem();

                        // id 적용
                        if (review.origin_id !== undefined){
                            item.id = review.origin_id;
                        }
                        else{   
                            item.id = i;
                        } 

                        item.perspective = snapshot.perspectiveView;
                        item.cameraMatrix = snapshot.matrix_camera.elements;
                        item.cameraDistance = snapshot.distance;
                        item.cameraZoom = snapshot.zoom;
                        item.cameraDepth = snapshot.CameraDepth;
                        item.cameraPivot = snapshot.pivot;
                        item.title = review.tag.title;
                        item.description = review.tag.description;

                        item.drawitem = review.tag.drawitem;

                        
                        // item.cameraMin = {};
                        // item.cameraMin.x = review.drawitem.position[0].x;
                        // item.cameraMin.y = review.drawitem.position[0].y;
                        // item.cameraMin.z = review.drawitem.position[0].z;

                           // item.cameraMax = {};
                        // item.cameraMax.x = review.drawitem.position[1].x;
                        // item.cameraMax.y = review.drawitem.position[1].y;
                        // item.cameraMax.z = review.drawitem.position[1].z;
                        
                        // item.drawitem = [];
                        // for(let j = 0; j < review.tag.drawitem.length; j++)
                        // {
                        //     let tmp = review.tag.drawitem[j];
                        //     let exportItem = setExportReviewItem(review.tag.drawitem[j]);
                        //     item.drawitem.push(exportItem);
                        // }
                        
                        item.selectedIds = review.tag.selectedIds;
                        item.thumbnail = review.tag.thumbnail;

                     

                        let sectionItem = {
                            type : undefined,
                            enable : undefined,
                            plane : [],
                        };

                        let getType = function(itemType)
                        {
                            if (itemType === VIZCore.Enum.CLIPPING_MODES.X ||
                                itemType === VIZCore.Enum.CLIPPING_MODES.Y ||
                                itemType === VIZCore.Enum.CLIPPING_MODES.Z ){
                                    return 0;
                            }
                            else if (itemType === VIZCore.Enum.CLIPPING_MODES.BOX){
                                return 1;
                            }
                        }

                        //단면정보 snapshot 등록
                        if (review.tag.section !== undefined)
                        {
                            for(let i = 0; i < review.tag.section.length; i++)
                            {
                                sectionItem.type = getType(review.tag.section[i].itemType);
                                sectionItem.enable = review.tag.section[i].enable;

                                let planeItemArray = []; // 배열로 초기화
                                if (review.tag.section[i].planes.length !== undefined)
                                {
                                    for (let j = 0; j < review.tag.section[i].planes.length; j++)
                                    {
                                        let plane = {
                                            clip: review.tag.section[i].clip, 
                                            normal: review.tag.section[i].planes[j].normal,
                                            center: review.tag.section[i].planes[j].center,
                                          };
    
                                          planeItemArray.push(plane); // 배열에 추가
                                    }
                                    sectionItem.plane = planeItemArray;
                                }

                                item.section = [];
                                item.section.push(sectionItem);
                            }
                        }
                        objExport.snapShot.push(item);
                    }break;
                    
                    default : break;
                }


            }

            // Snapshot
            // let listSnapshot = view.Camera.GetBackupCameraList();
            // let listSnapshot = scope.GetSnapshotList;
            // for(let i = 0; i < listSnapshot.length; i++)
            // {
            //     let snapshot = listSnapshot[i];
            //     let item = getExportReviewItem();
            //     item.Perspective = snapshot.perspectiveView;
            //     item.CameraMatrix = snapshot.matrix_camera;
            //     item.CameraDistance = snapshot.distance;
            //     item.CameraZoom = snapshot.zoom;
            //     item.Thumbnail = snapshot.thumbnail;
            //     item.CameraDepth = snapshot.CameraDepth;
            //     item.CameraPivot = snapshot.CameraPivot;
            //     item.title = snapshot.title;
                
            //     objExport.snapShot.push(item);
            // }


            let result = JSON.stringify(objExport);
            view.Util.ExportTextFile(result);
            
            return result;
        };

        /**
         * 리뷰 정보 반환
         * @param {Number} id 개체 아이디
         * @return {Data.ReviewItem} 리뷰 객체
         */
        this.GetReview = function (id) {
            return view.Data.Reviews.find(
                function (item) {
                    return item.id === id;
                });
        };

        /**
         * 리뷰 정보 반환
         * @param {Number} id 개체 아이디
         * @return {Data.ReviewItem} 리뷰 객체
         */
        this.GetReviewByOriginId = function (id) {
            return view.Data.Reviews.find(
                function (item) {
                    return item.origin_id === id;
                });
        };

        /**
         * 리뷰 정보 반환
         * @param {VIZCore.Enum.REVIEW_TYPES} reviewKind 리뷰 타입
         * @return {Array} 리뷰 객체 목록
         */
        this.GetReviewByType = (reviewKind)=>{
            let result = [];
            
            if (reviewKind === undefined)
                result = view.Data.Reviews;

            for(let i = view.Data.Reviews.length - 1 ; i >= 0 ; i--) {
                if(view.Data.Reviews[i].itemType !== reviewKind) continue;
                result.push(view.Data.Reviews[i]);
            }
            return result;
        };

        /**
         * 전체 리뷰 정보 삭제
         */
        this.DeleteReivewAll = function () {
            view.Data.Reviews = [];
            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Changed, view.Data.Reviews);
        };
        
        /**
         * 리뷰 정보 삭제
         * @param {Number} id 개체 아이디
         */
        this.DeleteReview = function (id) {
            let deleteFunc = function(input){
                const idx = view.Data.Reviews.findIndex(
                    function (item) {
                        return item.id === input;
                    });
    
                if (idx >= 0)
                    view.Data.Reviews.splice(idx, 1);
            }

            if(Array.isArray(id))
            {
                for(let i = 0; i < id.length; i++)
                {
                    let idTmp = id[i];
                    deleteFunc(idTmp);
                }
            }
            else
            {
                deleteFunc(id);
            }
            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Changed, view.Data.Reviews);
        };

        /**
         * 특정 유형의 리뷰 정보 삭제
         * @param {VIZCore.Enum.REVIEW_TYPES} reviewKind VIZCore.Enum.REVIEW_TYPES 리뷰 타입
         */
        this.DeleteReviewByKind = function (reviewKind) {
            for(let i = view.Data.Reviews.length - 1 ; i >= 0 ; i--) {
                if(view.Data.Reviews[i].itemType !== reviewKind) continue;

                view.Data.Reviews.splice(i, 1);
            }
            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Changed, view.Data.Reviews);
        };

        let getReviewTypes = (reviewType)=>{
            let target = [];
            if(reviewType === 0)
            {
                // Note
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_TOOLTIP_NOTE);

                target.push(VIZCore.Enum.REVIEW_TYPES.RK_HEADER_NOTE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_CUSTOM);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_IMAGE_NOTE);
                
            }
            else if(reviewType === 1)
            {
                // Measure
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_POS);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ANGLE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_OBJECTMINDISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_NORMALDISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_HORIZONTALITYDISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ORTHOMINDISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_XY_AXIS_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_YZ_AXIS_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ZX_AXIS_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_SMART_AXIS_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKEDAREA);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_SURFACEDISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_AXIS_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ONE_POINT_FIXED_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CUSTOM_AXIS_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CYLINDER_PLANE_DISTANCE);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CYLINDER_CYLINDER_CROSS_POINT);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_NORMAL_PLANE_CROSS_POINT);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_BOUNDBOX);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_PICKITEM);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CIRCLE_RADIUS);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CIRCLE_DIAMETER);
              
            }
            else if(reviewType === 2)
            {
                // Snapshot
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_SNAPSHOT);
            }
            else if(reviewType === 3)
            {
                // Drawing
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_PATH);
                target.push(VIZCore.Enum.REVIEW_TYPES.RK_SKETCH);
            }
            return target;
        };
        
        /**
         * 기능별 리뷰 정보 삭제
         * @param {Number} reviewType 0 : Note, 1 : Measure, 2 : Snapshot, 3 : Drawing
         */
        this.DeleteReviewByType = function (reviewType)
        {
            let target = getReviewTypes(reviewType);

            for(let i = view.Data.Reviews.length - 1 ; i >= 0 ; i--) {
                if(!target.includes(view.Data.Reviews[i].itemType)) continue;

                view.Data.Reviews.splice(i, 1);
            }
            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Changed, view.Data.Reviews);
        };

        /**
         * 선택 리뷰 정보 삭제
         */
        this.DeleteSelectedReview = function () {
            for(let i = view.Data.Reviews.length - 1 ; i >= 0 ; i--) {
                if(!view.Data.Reviews[i].selection) continue;

                view.Data.Reviews.splice(i, 1);
            }
            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Changed, view.Data.Reviews);
        };

        /**
         * 노트 리뷰 정보 여부 반환
         * @param {Data.ReviewItem} reviewItem 
         * @returns
         */
        this.IsReviewNoteItem = function (reviewItem) 
        {
            if(reviewItem.itemType === VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE ||
                reviewItem.itemType === VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE ||
                reviewItem.itemType === VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE )
                return true;

            return false;
        };

        /**
         * 측정 리뷰 정보 여부 반환
         * @param {Data.ReviewItem} reviewItem 
         * @returns 
         */
        this.IsReviewMeasureItem = function (reviewItem) 
        {
            if(reviewItem.itemType !== VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE &&
                reviewItem.itemType !== VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE &&
                reviewItem.itemType !== VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE )
                return true;
                
            return false;
        };


        /**
         * 사용자 뷰 리뷰 화면 복원
         * @param {Number} id review ID
         */
        this.RestoreSnapShotReview = function (id) {
            let item = scope.GetReview(id);
            if(item === undefined) return;

             // 카메라 수정
             if(item.tag.cameraId !== undefined)             
                view.Camera.Rollback(item.tag.cameraId);

            // 선택 정보 복원
            if(item.tag.selectedIds !== undefined && item.tag.selectedIds.length > 0)
                view.Interface.Object3D.SelectByNodeID(item.tag.selectedIds, true, false);
            else
                view.Interface.Object3D.SelectAll(false);

            //단면 복원
            view.Clipping.Clear();
            if(item.tag.section !== undefined) {

                let xClipAxis, yClipAxis, zClipAxis;
                xClipAxis = new VIZCore.Vector3(1.0, 0.0, 0.0);
                yClipAxis = new VIZCore.Vector3(0.0, 1.0, 0.0);
                zClipAxis = new VIZCore.Vector3(0.0, 0.0, 1.0);
                
                for (let i = 0; i < item.tag.section.length; i++)
                {
                    let clipItem = view.Clipping.CreateClipping(item.tag.section[i].itemType);

                    if(item.tag.section[i].itemType === VIZCore.Enum.CLIPPING_MODES.X ||
                        item.tag.section[i].itemType === VIZCore.Enum.CLIPPING_MODES.Y ||
                        item.tag.section[i].itemType === VIZCore.Enum.CLIPPING_MODES.Z)
                        {
                            for (let ii = 0; ii < clipItem.planes.length; ii++) {
                                clipItem.planes[ii].normal.copy(item.tag.section[i].planes[ii].normal);        
                                clipItem.planes[ii].center.copy(item.tag.section[i].planes[ii].center);
            
                                if(clipItem.planes[ii].handle === undefined) continue;
            
                                clipItem.planes[ii].handle.center.copy(item.tag.section[i].planes[ii].center);
    
                                //회전한 단면은 개선필요
                                if(Math.abs(xClipAxis.dot(clipItem.planes[ii].normal)) > 0.9999) {
                                    //x축 방향
                                    clipItem.planes[ii].handle.axis.x.normal.copy(clipItem.planes[ii].normal);
                                    clipItem.planes[ii].handle.axis.x.normal.multiplyScalar(-1);
                                }
                                else if(Math.abs(yClipAxis.dot(clipItem.planes[ii].normal)) > 0.9999) {
                                    //y축 방향
                                    clipItem.planes[ii].handle.axis.y.normal.copy(clipItem.planes[ii].normal);
                                    clipItem.planes[ii].handle.axis.y.normal.multiplyScalar(-1);
                                }
                                else if(Math.abs(zClipAxis.dot(clipItem.planes[ii].normal)) > 0.9999) {
                                    //z축 방향
                                    clipItem.planes[ii].handle.axis.z.normal.copy(clipItem.planes[ii].normal);
                                    clipItem.planes[ii].handle.axis.z.normal.multiplyScalar(-1);
                                }
                                else 
                                    continue;
                               
                            }
            
                        }
                    else if(item.tag.section[i].itemType === VIZCore.Enum.CLIPPING_MODES.BOX){
                        for (let ii = 0; ii < clipItem.planes.length; ii++) {
    
                            //지정된 축에 추가
                            for (let jj = 0; jj < item.tag.section[i].planes.length; jj++) {
    
                                if(clipItem.planes[ii].normal.dot(item.tag.section[i].planes[jj].normal) < 0.9999)
                                    continue;
    
                                clipItem.planes[ii].normal.copy(item.tag.section[i].planes[jj].normal);
                                clipItem.planes[ii].center.copy(item.tag.section[i].planes[jj].center);
            
                                if(clipItem.planes[ii].handle === undefined) continue;
            
                                clipItem.planes[ii].handle.center.copy(item.tag.section[i].planes[jj].center);
    
                                //회전한 단면은 개선필요
                                if(Math.abs(xClipAxis.dot(clipItem.planes[ii].normal)) > 0.9999) {
                                    //x축 방향
                                    clipItem.planes[ii].handle.axis.x.normal.copy(clipItem.planes[ii].normal);
                                    clipItem.planes[ii].handle.axis.x.normal.multiplyScalar(-1);
                                }
                                else if(Math.abs(yClipAxis.dot(clipItem.planes[ii].normal)) > 0.9999) {
                                    //y축 방향
                                    clipItem.planes[ii].handle.axis.y.normal.copy(clipItem.planes[ii].normal);
                                    clipItem.planes[ii].handle.axis.y.normal.multiplyScalar(-1);
                                }
                                else if(Math.abs(zClipAxis.dot(clipItem.planes[ii].normal)) > 0.9999) {
                                    //z축 방향
                                    clipItem.planes[ii].handle.axis.z.normal.copy(clipItem.planes[ii].normal);
                                    clipItem.planes[ii].handle.axis.z.normal.multiplyScalar(-1);
                                }
                                else 
                                    continue;
                            }
                        }
        
                    }
                }

                
                view.Clipping.Update();
            }

            // 그리기 마크업 복원
            if(item.tag.drawitem !== undefined && item.tag.drawitem.length > 0)
            {
                view.Interface.Review.DrawingMarkup.ExitDrawMode();
                view.Interface.Review.DrawingMarkup.EnterDrawMode();
                //vizwide3d.Main.Data.Reviews = vizwide3d.Main.Data.Reviews.concat(review.tag.drawitem);
                view.Data.Reviews = view.Data.Reviews.concat(item.tag.drawitem);
                //vizwide3d.Render();

                view.ViewRefresh();
            }
            else{
                view.Interface.Review.DrawingMarkup.ExitDrawMode();
            }
        };
        
        /**
         * 리뷰 선택 설정
         * @param {Number} id 
         * @param {boolean} select 
         */
         this.Select = function (id, select) {
            let item = scope.GetReview(id);
            if(item === undefined) return;

            item.selection = select;
            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Changed, view.Data.Reviews);
        };

        /**
         * 전체 리뷰 선택 설정
         * @param {boolean} select 선택/선택해제
         */
        this.SelectAll = function (select) {
            for(let i = 0 ; i < view.Data.Reviews.length ; i++) {
                view.Data.Reviews[i].selection = select;
            }
        };

        
        /**
         * 리뷰 종류 별 선택/선택해제 설정
         * @param {boolean} select 선택/선택해제
         * @param {VIZCore.Enum.REVIEW_TYPES} reviewKind VIZCore.Enum.REVIEW_TYPES 리뷰 타입
         */
         this.SelectByKind = function (select, reviewKind) {
            for(let i = 0 ; i < view.Data.Reviews.length ; i++) {
                if(view.Data.Reviews[i].itemType === reviewKind)
                {
                    view.Data.Reviews[i].selection = select;
                }
            }
            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Changed, view.Data.Reviews);
        };

        /**
         * 리뷰 보이기/숨기기 설정
         * @param {Number} id 
         * @param {boolean} visible 
         */
        this.Show = function (id, visible) {
            let item = scope.GetReview(id);
            if(item === undefined) return;
            
            item.visible = visible;
            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Changed, view.Data.Reviews);
        };

        /**
         * 전체 리뷰 보이기/숨기기 설정
         * @param {boolean} visible 
         */
        this.ShowAll = function (visible) {
            for(let i = 0 ; i < view.Data.Reviews.length ; i++) {
                view.Data.Reviews[i].visible = visible;
            }
            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Changed, view.Data.Reviews);
        };

        /**
         * 리뷰 종류 별 보이기/숨기기 설정
         * @param {boolean} visible 보이기/숨기기
         * @param {VIZCore.Enum.REVIEW_TYPES} reviewKind VIZCore.Enum.REVIEW_TYPES 리뷰 타입
         */
        this.ShowByKind = function (visible, reviewKind) {
            for(let i = 0 ; i < view.Data.Reviews.length ; i++) {
                if(view.Data.Reviews[i].itemType === reviewKind)
                {
                    view.Data.Reviews[i].visible = visible;
                }
            }
            view.EventHandler.dispatchEvent(VIZCore.Enum.EVENT_TYPES.Review.Changed, view.Data.Reviews);
        };

        /**
         * 마우스 Pick 여부 확인
         * @param {number} x 
         * @param {number} y 
         * @returns {*} review ID == undefined 인경우 선택되지 않음
         */
        this.PickMouse = function(x, y) {

            // 리뷰정보 확인
            for(let i = view.Data.Reviews.length - 1 ; i >= 0 ; i--) {
                let review = view.Data.Reviews[i];
                if(!review.visible) continue;

                for(let j = 0 ; j < review.rect.length ; j++) {
                    let rect = review.rect[j];
                    if(rect.isPointInRect(x, y) === false) continue;

                    return review.id;
                }
            }

            return undefined;
        };

        //#region Review Render 

        /**
        * 리뷰 아이템 2D
        * 리뷰 캔버스에 그림
        * @param {Context} ctx Context
        * @param {Data.ReviewItem} review 
         */
        this.RenderReviewItem = function (ctx, review) {
            if(review === undefined) return;
            if (!review.visible) return;

            let nearPlaneCurrent = view.Renderer.GetReviewNearPlane();

            switch (review.itemType) {
                //#region Note
    
                case VIZCore.Enum.REVIEW_TYPES.RK_SURFACE_NOTE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if(scope.EnableClippingNoteReview &&
                        view.Clipping.IsClippingPosition(review.drawitem.position[0])) break;

                    draw_SurfaceNote(ctx, review);
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_2D_NOTE:
                    draw_2DNote(ctx, review);
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_3D_NOTE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if(scope.EnableClippingNoteReview &&
                        view.Clipping.IsClippingPosition(review.text.position)) break;

                    draw_3DNote(ctx, review);
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_HEADER_NOTE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if(scope.EnableClippingNoteReview &&
                        view.Clipping.IsClippingPosition(review.text.position)) break;

                    draw_HeaderNote(ctx, review);
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_TOOLTIP_NOTE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if(scope.EnableClippingNoteReview &&
                        view.Clipping.IsClippingPosition(review.text.position)) break;

                    draw_UserTooltip(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_IMAGE_NOTE:
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;

                    draw_ImageNote(ctx, review);
                    break;
    
    
                //#endregion Note
    
                //#region Measure
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_POS:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
    
                    draw_MeasurePos(ctx, review);
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
    
                    draw_MeasureDistance_v2(ctx, review);
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ANGLE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[2], nearPlaneCurrent)) break;
    
                    draw_MeasureAngle(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_OBJECTMINDISTANCE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
    
                    draw_MeasureObjectMinDistance(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_NORMALDISTANCE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
    
                    draw_MeasureNormalDistance(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_HORIZONTALITYDISTANCE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
    
                    draw_MeasureHorizontalityDistance(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ORTHODISTANCE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
    
                    draw_MeasureOrthoDistance(ctx, review);
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
    
                    draw_MeasureXAxisDistance(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
    
                    draw_MeasureYAxisDistance(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
    
                    draw_MeasureZAxisDistance(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_XY_AXIS_DISTANCE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
    
                    draw_MeasureXYAxisDistance(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_YZ_AXIS_DISTANCE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
    
                    draw_MeasureYZAxisDistance(ctx, review);
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ZX_AXIS_DISTANCE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
    
                    draw_MeasureZXAxisDistance(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CUSTOM_AXIS_DISTANCE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
    
                    draw_MeasureCustomAxisDistance(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKEDAREA:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    //if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
    
                    draw_MeasureLinkArea(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_SURFACEDISTANCE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
    
                    draw_MeasureDistance_v2(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_DISTANCE:
                    {
                        if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                        let renderNearPlane = false;
                        for(let i = 0 ; i < review.drawitem.position.length ; i++)
                        {
                            if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[i], nearPlaneCurrent)) 
                            {
                                renderNearPlane = true;
                                break;
                            }
                        }
                        if(renderNearPlane) break;
    
                        draw_MeasureLinkDistance(ctx, review);
                    }
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE:
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE:
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE:
                    {
                        if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                        let renderNearPlane = false;
                        for(let i = 0 ; i < review.drawitem.position.length ; i++)
                        {
                            if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[i], nearPlaneCurrent)) 
                            {
                                renderNearPlane = true;
                                break;
                            }
                        }
                        if(renderNearPlane) break;
    
                        draw_MeasureLinkAxisDistance(ctx, review);
                    }
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CYLINDER_PLANE_DISTANCE:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[1], nearPlaneCurrent)) break;
                    draw_MeasureCylinderPlaneDistance(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CYLINDER_CYLINDER_CROSS_POINT:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    draw_MeasureCylinderCylinderCross(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_NORMAL_PLANE_CROSS_POINT:
                    if (view.Util.IsRenderReivewNearPlane(review.text.position, nearPlaneCurrent)) break;
                    if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[0], nearPlaneCurrent)) break;
                    draw_MeasureNormalPlaneDistance(ctx, review);
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_BOUNDBOX:

                    //기존 방식
                    if(review.drawitem.custom)
                    {
                        draw_MeasureBoundBox(ctx, review);
                    }
                    else 
                    {
                        draw_MeasureBoundBoxByPlane(ctx, review);
                    }
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CIRCLE_RADIUS:

                    draw_MeasureCircle(ctx, review, true);
                    

                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CIRCLE_DIAMETER:
                    draw_MeasureCircle(ctx, review, false);
                    break;
                //#endregion Measure
    
                case VIZCore.Enum.REVIEW_TYPES.RK_PATH:
                    for(let i = 0; i < review.drawitem.position.length; i++)
                    {
                        if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[i].start, nearPlaneCurrent)) break;
                        if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[i].end, nearPlaneCurrent)) break;
                    }
                    
                    draw_Path(ctx, review);
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_CUSTOM:
                    draw_Custom(ctx, review);
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_SKETCH:
                    draw_Sketch(ctx, review);
                    break;
                default:
                    break;
            }
    
            //리뷰 선택 추가 그리기
            if(review.selection) {
                // select Rect 설정
                ctx.strokeStyle = "rgba(255, 0, 0, 1)"; 
                ctx.lineWidth = review.style.border.thickness + 2; //선택 영역 두껍게 표시
    
                for(let i = 0 ; i < review.rect.length ; i++) {
    
                    // 박스 그리기
                    if (review.style.border.type === 0)
                        view.Renderer.Util.DrawRect(ctx, review.rect[i].left, review.rect[i].top, review.rect[i].getWidth(), review.rect[i].getHeight(),
                             false, true);
                    else if (review.style.border.type === 1)
                        view.Renderer.Util.DrawRoundRect(ctx, review.rect[i].left, review.rect[i].top, review.rect[i].getWidth(), review.rect[i].getHeight(),
                             review.style.border.round, false, true);
                }
            }
        };

        this.RenderReviewItems = function(ctx, reviews){

            let positions = [];

            let map = new Map();

            let nearPlaneCurrent = view.Renderer.GetReviewNearPlane();
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
            for(let i = 0; i < reviews.length; i++)
            {
                let review = reviews[i];    
                if(review === undefined) continue;
                if (!review.visible) continue;

                switch (review.itemType) {
                    //#region Note
                    case VIZCore.Enum.REVIEW_TYPES.RK_PATH:
                       

                        for(let i = 0; i < review.drawitem.position.length; i++)
                        {
                            if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[i].start, nearPlaneCurrent)) break;
                            if (view.Util.IsRenderReivewNearPlane(review.drawitem.position[i].end, nearPlaneCurrent)) break;

                            let path = review.drawitem.position[i];
                            // let key = view.Renderer.Util.GetLineOptionKey(review);
                            // key += path.drawType;
    
                            // let positions = [];
                            // let info = map.get(key);
                            // if(info === undefined)
                            // {
                            //     map.set(key,{option : review, positions : positions})
                            // }
                            // else
                            // {
                            //     positions = info.positions;
                            // }

                            let lineStart = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, path.start);
                            let lineEnd = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, path.end);

                            let item = {s : lineStart, e : lineEnd};
                            positions.push(item);
                        }
                default : break;
                }
            }
            
            let draw = function(items) {
                ctx.beginPath();
                for(let i = 0; i < items.length; i++){
                    let item = items[i];
                    
                    ctx.moveTo(item.s.x, item.s.y);
                    ctx.lineTo(item.e.x, item.e.y);
                }
                ctx.stroke();
            };

            // let drawLines = function(value, key, map){
            //     //view.Renderer.Util.SetReviewLineOption(ctx, value.option);
            //     draw(value.positions);
            // };
            
            //map.forEach(drawLines);

            draw(positions );
        };
        
        /**
         * 리뷰 아이템 3D
         * 모델과 동일한 위치 buffer에 그림
         * @param {Data.ReviewItem} review 
         * @returns 
         */
        this.Render3DReviewItem = function(review) {
            if (!review.visible) return;

            switch (review.itemType) {
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_BOUNDBOX:
                {
                    if(review.drawitem.custom)
                        draw3D_MeasureBoundBox(review);
                    else
                        draw3D_MeasureBoundBoxByPlane(review);
                }
                break;
            }
        };

        /**
         * 리뷰 변경 이벤트
         * @param {Object} listener Event Listener
         */
        this.OnChangedEvent = function(listener){
            view.EventHandler.addEventListener(VIZCore.Enum.EVENT_TYPES.Review.Changed, listener);
        };

        function draw_Path(ctx_review, review) {
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

            let nearPlaneCurrent = view.Renderer.GetReviewNearPlane();
    
            for (let i = 0; i < review.drawitem.position.length; i++) {
                let path = review.drawitem.position[i];
    
                if (view.Util.IsRenderReivewNearPlane(path.start, nearPlaneCurrent)) continue;
                if (view.Util.IsRenderReivewNearPlane(path.end, nearPlaneCurrent)) continue;
    
                let lineStart = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, path.start);
                let lineEnd = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, path.end);
    
                switch (path.drawType) {
                    case VIZCore.Enum.LINE_TYPES.SOLID:
                        {
                            view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                            view.Renderer.Util.DrawLine(ctx_review, lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
                        }
                        break;
                    case VIZCore.Enum.LINE_TYPES.SHORT_DASHED:
                        {
                            view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                            ctx_review.setLineDash([4, 4]);
                            view.Renderer.Util.DrawLine(ctx_review, lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
                            ctx_review.setLineDash([]);
                        }
                        break;
                    case VIZCore.Enum.LINE_TYPES.SOLID_ARROW:
                        {
                            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
                            view.Renderer.Util.DrawArrow(ctx_review, lineEnd.x, lineEnd.y, lineStart.x, lineStart.y, review.style.arrow.size);
                        }
                        break;
                    case VIZCore.Enum.LINE_TYPES.SHORT_DASHED_ARROW:
                        {
                            view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                            ctx_review.setLineDash([4, 4]);
                            view.Renderer.Util.DrawLine(ctx_review, lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
                            ctx_review.setLineDash([]);
                            ctx_review.lineWidth = 1;
    
                            // arrow color
                            ctx_review.strokeStyle = "rgba(" + review.style.arrow.color.r + "," + review.style.arrow.color.g + ","
                                + review.style.arrow.color.b + "," + review.style.arrow.color.glAlpha() + ")";
    
                                view.Renderer.Util.DrawTriangle(ctx_review, lineEnd.x, lineEnd.y, lineStart.x, lineStart.y, review.style.arrow.size);
                        }
                        break;
    
                    case VIZCore.Enum.LINE_TYPES.POINT:
                        {
                            view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                            view.Renderer.Util.DrawPoint(ctx_review, lineStart.x, lineStart.y, review.style.point.size);
                        }
                        break;
    
                    case VIZCore.Enum.LINE_TYPES.USER:
                        {
                            view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                            ctx_review.setLineDash(review.style.line.dash);
                            view.Renderer.Util.DrawLine(ctx_review, lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
                            ctx_review.setLineDash([]);
                        }
                        break;
                    case VIZCore.Enum.LINE_TYPES.USER_ARROW:
                        {
                            //Dash 처리를 위해 분리
                            //view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
                            //view.Renderer.Util.DrawArrow(ctx_review, lineEnd.x, lineEnd.y, lineStart.x, lineStart.y, review.style.arrow.size);
    
                            view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                            ctx_review.setLineDash(review.style.line.dash);
                            view.Renderer.Util.DrawLine(ctx_review, lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
                            ctx_review.setLineDash([]);
    
                            // arrow color
                            ctx_review.strokeStyle = "rgba(" + review.style.arrow.color.r + "," + review.style.arrow.color.g + ","
                                + review.style.arrow.color.b + "," + review.style.arrow.color.glAlpha() + ")";
                                ctx_review.lineWidth = 1;
    
                            // arrow color
                            ctx_review.fillStyle = "rgba(" + review.style.arrow.color.r + "," + review.style.arrow.color.g + ","
                                + review.style.arrow.color.b + "," + review.style.arrow.color.glAlpha() + ")";
                            view.Renderer.Util.DrawTriangle(ctx_review, lineEnd.x, lineEnd.y, lineStart.x, lineStart.y, review.style.arrow.size);
                        }
                        break;
                }
            }
        }
    
        function draw_Custom(ctx_review, review) {
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let nearPlaneCurrent = view.Renderer.GetReviewNearPlane();

            let pos = review.drawitem.position[0];
            if (view.Util.IsRenderReivewNearPlane(pos, nearPlaneCurrent)) return;
    
            let w = 124;
            let h = 60;
    
            let posScreen = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, pos);
    
            view.Renderer.Util.SetReviewBgOption(ctx_review, review);
            view.Renderer.Util.SetReviewLineOption(ctx_review, review);
    
            if (review.drawitem.custom !== undefined) {
                let level = 100 / 7;
                let offsetX = 10;
                let offsetY = 10;
    
                const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
                w = metrics.width + offsetX * 2;
    
                if (review.drawitem.custom.battery !== undefined) {
                    h += 20; //텍스트추가로 높이 추가
                }
    
                //Bottom Center
                {
                    posScreen.y -= h / 2;
                }
    
                if (review.drawitem.custom.progress !== undefined) {
                    view.Renderer.Util.DrawRoundRect(ctx_review, posScreen.x - w / 2, posScreen.y - h / 2, w, h, 10, review.style.background.enable, review.style.border.enable);
                    // font 설정
                    view.Renderer.Util.SetReviewFontOption(ctx_review, review);
                    for (let i = 0; i < review.text.value.length; i++) {
                        ctx_review.fillText(review.text.value[i], (posScreen.x - w / 2) + offsetX, (posScreen.y - h / 2) + offsetY + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                    }
    
                    offsetY += metrics.ascent + 6;
                    // 공정률
                    let progress = view.Drawing.GetCustomImage('progress');
                    let idxProgress = Math.floor(review.drawitem.custom.progress / level);
                    //ctx_review.drawImage(progress[0], (posScreen.x - w / 2) + offsetX, (posScreen.y - h / 2) + offsetY, w - 20, 18);
    
                    ctx_review.fillStyle = "rgba(" + 255 + "," + 255 + ","
                        + 255 + "," + 1 + ")";
                    //ctx_review.fillStyle = "rgba(" + 41 + "," + 143 + ","
                    //    + 194 + "," + 0.8 + ")";
                    view.Renderer.Util.DrawRect(ctx_review, (posScreen.x - w / 2) + offsetX, (posScreen.y - h / 2) + offsetY, (w - 20 - 2), 18, true, false);
    
                    ctx_review.strokeStyle = "rgba(" + 41 + "," + 143 + "," + 194 + "," + 0.8 + ")";
                    view.Renderer.Util.DrawRect(ctx_review, (posScreen.x - w / 2) + offsetX, (posScreen.y - h / 2) + offsetY, (w - 20 - 2), 18, false, true);
    
                    //ctx_review.fillStyle = "rgba(" + 255 + "," + 255 + ","
                    //    + 255 + "," + 1 + ")";
                    ctx_review.fillStyle = "rgba(" + 41 + "," + 143 + ","
                        + 194 + "," + 0.8 + ")";
                        view.Renderer.Util.DrawRect(ctx_review, (posScreen.x - w / 2) + offsetX + 1, (posScreen.y - h / 2) + offsetY + 1, (w - 20 - 2 - 2) / 100 * review.drawitem.custom.progress, 16, true, false);
    
                    //ctx_review.drawImage(progress[idxProgress], (posScreen.x - w / 2) + offsetX, (posScreen.y - h / 2) + offsetY, w - 20, 18);
                }
                if (review.drawitem.custom.battery !== undefined) {
    
                    //h += 20; //텍스트추가로 높이 추가
    
                    view.Renderer.Util.DrawRoundRect(ctx_review, posScreen.x - w / 2, posScreen.y - h / 2, w, h + 10, 10, review.style.background.enable, review.style.border.enable);
                    h = metrics.ascent * (review.text.value.length) + 30;
    
                    //name
                    // 폰트 설정
                    //ctx_review.textAlign = "center";
                    view.Renderer.Util.SetReviewFontOption(ctx_review, review);
                    ctx_review.font = "bold " + review.style.font.size + "pt " + review.style.font.face;
                    ctx_review.fillText(review.text.value[0], (posScreen.x - w / 2) + offsetX, (posScreen.y - h / 2) + offsetY + (metrics.ascent * 0 + metrics.ascent + review.style.border.offset * 0));
                    offsetY += 2;
                    //ctx_review.textAlign = "left";
    
                    // 배터리잔량
                    // 좌표
                    // font 설정
                    view.Renderer.Util.SetReviewFontOption(ctx_review, review);
                    for (let i = 1; i < review.text.value.length - 1; i++) {
                        ctx_review.fillText(review.text.value[i], (posScreen.x - w / 2) + offsetX, (posScreen.y - h / 2) + offsetY + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                    }
                    //offsetY += metrics.ascent * (review.text.value.length -1 ) + 12;
                    offsetY += metrics.ascent * (review.text.value.length - 1) + 12 + 2;
    
                    let battery = view.Drawing.GetCustomImage('battery');
                    let idxBattery = Math.floor(review.drawitem.custom.battery / level);
                    if (idxBattery > battery.length - 1)
                        idxBattery = battery.length - 1;
                        ctx_review.strokeStyle = "rgba(" + 41 + "," + 143 + ","
                        + 194 + "," + 0.8 + ")";
                        ctx_review.fillStyle = "rgba(" + 41 + "," + 143 + ","
                        + 194 + "," + 0.8 + ")";
                        view.Renderer.Util.DrawRect(ctx_review, (posScreen.x - w / 2) + offsetX, (posScreen.y - h / 2) + offsetY, w - 20, 18, false, true);
                    //ctx_review.drawImage(battery[0], (posScreen.x - w / 2) + offsetX, (posScreen.y - h / 2) + offsetY, w - 20, 18);
                    ctx_review.drawImage(battery[idxBattery], (posScreen.x - w / 2) + offsetX, (posScreen.y - h / 2) + offsetY, w - 20, 18);
                    ctx_review.strokeStyle = "rgba(" + 120 + "," + 120 + ","
                        + 120 + "," + 1 + ")";
                        ctx_review.fillText(review.text.value[3], (posScreen.x - 20) + offsetX, (posScreen.y - h / 2) + offsetY + (metrics.ascent) + 2);
    
    
                }
    
                if (review.drawitem.custom.sign !== undefined) {
                    if (!view.Animation.ShowAnimationReview)
                        return;
                    let offsetX = 2;
                    let offsetY = 2;
    
                    //const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
                    //w = metrics.width + offsetX * 2;
                    w = 28;
                    h = 28;
                    //Bottom Center
                    {
                        posScreen.y -= h / 2;
                    }
    
                    if (review.drawitem.custom.sign.image !== undefined) {
                        let image;
                        if (review.drawitem.custom.sign.image === 0) {
                            image = view.Drawing.GetCustomImage('car');
                        }
                        else if (review.drawitem.custom.sign.image === 1) {
                            image = view.Drawing.GetCustomImage('bike');
                        }
    
                        view.Renderer.Util.DrawRoundRect(ctx_review, posScreen.x - w / 2, posScreen.y - h / 2, w, h, 10, review.style.background.enable, review.style.border.enable);
                        //h = metrics.ascent * (review.text.value.length) + 30;
    
                        view.Renderer.Util.SetReviewFontOption(ctx_review, review);
                        ctx_review.font = "bold " + review.style.font.size + "pt " + review.style.font.face;
    
                        // font 설정
                        view.Renderer.Util.SetReviewFontOption(ctx_review, review);
                        ctx_review.drawImage(image[0], (posScreen.x - w / 2) + offsetX, (posScreen.y - h / 2) + offsetY, 24, 24);
                        ctx_review.strokeStyle = "rgba(" + 120 + "," + 120 + ","
                            + 120 + "," + 1 + ")";
                    }
                }
                //view.Renderer.Util.DrawPoint(ctx_review, oldPosScreen.x, oldPosScreen.y, 3);
            }
    
    
        }
    
        function draw_Sketch(ctx_review, review) {
            view.Renderer.Util.SetReviewLineOption(ctx_review, review);
    
            let drawFirst = true;
            let drawMin, drawMax;
    
            switch (review.drawitem.custom.subType) {
                case VIZCore.Enum.SKETCH_TYPES.FREE:
                    {
                        ctx_review.beginPath();
                        for (let i = 0; i < review.drawitem.custom.position.length; i++) {
                            if (i === 0)
                                continue;
    
                            //let pos1 = review.drawitem.custom.position[i - 1];
                            //let pos2 = review.drawitem.custom.position[i];
                            let posW1 = review.drawitem.custom.position[i - 1];
                            let posW2 = review.drawitem.custom.position[i];
                            let pos1 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW1));
                            let pos2 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW2));
                            ctx_review.moveTo(pos1.x, pos1.y);
                            ctx_review.lineTo(pos2.x, pos2.y);
    
                            //범위 계산
                            if(drawFirst) {
                                drawFirst = false;
                                drawMin = new VIZCore.Vector3().copy(pos1);
                                drawMax = new VIZCore.Vector3().copy(pos1);
    
                                drawMin.min(pos2);
                                drawMax.max(pos2);
                            }
                            else {
                                drawMin.min(pos1);
                                drawMax.max(pos1);
    
                                drawMin.min(pos2);
                                drawMax.max(pos2);
                            }
                        }
                        ctx_review.stroke();     
                        
                    }
                    break;
                case VIZCore.Enum.SKETCH_TYPES.LINE:
                    {
                            //let pos1 = review.drawitem.custom.position[0];
                            //let pos2 = review.drawitem.custom.position[1];
                            let posW1 = review.drawitem.custom.position[0];
                            let posW2 = review.drawitem.custom.position[1];
                            let pos1 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW1));
                            let pos2 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW2));
    
                            ctx_review.beginPath();
                            ctx_review.moveTo(pos1.x, pos1.y);
                            ctx_review.lineTo(pos2.x, pos2.y);
                            ctx_review.stroke();
    
                            //선택 범위 계산
                            if(drawFirst) {
                                drawFirst = false;
                                drawMin = new VIZCore.Vector3().copy(pos1);
                                drawMax = new VIZCore.Vector3().copy(pos1);
    
                                drawMin.min(pos2);
                                drawMax.max(pos2);
                            }
                            else {
                                drawMin.min(pos1);
                                drawMax.max(pos1);
    
                                drawMin.min(pos2);
                                drawMax.max(pos2);
                            }
                    }
                    break;
                case VIZCore.Enum.SKETCH_TYPES.CIRCLE:
                    {
                        
                            //let pos1 = review.drawitem.custom.position[0];
                            //let pos2 = review.drawitem.custom.position[1];
                            let posW1 = review.drawitem.custom.position[0];
                            let posW2 = review.drawitem.custom.position[1];
                            let pos1 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW1));
                            let pos2 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW2));
                            let startAngle = 0;
                            let endAngle = 2 * Math.PI;
                            let centerPos = new VIZCore.Vector2((pos1.x + pos2.x) / 2, (pos1.y + pos2.y) / 2);
                            let sub = new VIZCore.Vector2().subVectors(pos1, pos2);
                            let radius = Math.abs(sub.length() / 2);
                            ctx_review.beginPath();
                            ctx_review.arc(centerPos.x, centerPos.y, radius, startAngle, endAngle, true);
                            ctx_review.stroke();
    
                            //선택 범위 계산
                            {
                                startAngle = 0;
                                endAngle = 360;
    
                                let meshItem = view.MeshProcess.Get2DCircleVertices(centerPos, radius, radius, startAngle, endAngle);
    
                                for (let i = 1; i < meshItem.vertices.length; i++) {
    
                                    let meshPos1 = meshItem.vertices[i - 1];
                                    let meshPos2 = meshItem.vertices[i];
    
                                    if(drawFirst) {
                                        drawFirst = false;
                                        drawMin = new VIZCore.Vector3().copy(meshPos1);
                                        drawMax = new VIZCore.Vector3().copy(meshPos1);
        
                                        drawMin.min(meshPos2);
                                        drawMax.max(meshPos2);
                                    }
                                    else {
                                        drawMin.min(meshPos1);
                                        drawMax.max(meshPos1);
        
                                        drawMin.min(meshPos2);
                                        drawMax.max(meshPos2);
                                    }
                                }
                            }
                    }
                    break;
                case VIZCore.Enum.SKETCH_TYPES.RECT:
                    {
                            //let pos1 = review.drawitem.custom.position[0];
                            //let pos2 = review.drawitem.custom.position[1];
                            let posW1 = review.drawitem.custom.position[0];
                            let posW2 = review.drawitem.custom.position[1];
                            let pos1 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW1));
                            let pos2 = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW2));
                            let width = pos2.x - pos1.x;
                            let height = pos2.y - pos1.y;
                            ctx_review.beginPath();
                            ctx_review.rect(pos1.x, pos1.y, width, height);
                            ctx_review.stroke();
    
                            //선택 범위 계산
                            if(drawFirst) {
                                drawFirst = false;
                                drawMin = new VIZCore.Vector3().copy(pos1);
                                drawMax = new VIZCore.Vector3().copy(pos1);
    
                                drawMin.min(pos2);
                                drawMax.max(pos2);
                            }
                            else {
                                drawMin.min(pos1);
                                drawMax.max(pos1);
    
                                drawMin.min(pos2);
                                drawMax.max(pos2);
                            }
                    }
                    break;
                case VIZCore.Enum.SKETCH_TYPES.TEXT:
                    {
                        if (review.text.value.length === 0)
                            return;
                        if (review.text.position === undefined)
                            return;
    
                        // font 설정
                        view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                        // box metrics
                        const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
    
                        //const matMVMatrix = new VIZCore.Matrix4();
                        //matMVMatrix.copy(view.Camera.cameraMatrix);
                        //const matMVP = new VIZCore.Matrix4().multiplyMatrices(view.Camera.projectionMatrix, matMVMatrix);
                        //// compute a clipspace position
                        //// using the matrix we computed for the F
                        //let clipspace = new VIZCore.Matrix4().transformVector(matMVP.elements, [review.text.position.x, review.text.position.y, review.text.position.z, 1]);
    
                        //// divide X and Y by W just like the GPU does.
                        //clipspace[0] /= clipspace[3];
                        //clipspace[1] /= clipspace[3];
    
                        //// convert from clipspace to pixels
                        //let pixelX = (clipspace[0] * 0.5 + 0.5) * gl.canvas.width;
                        //let pixelY = (clipspace[1] * -0.5 + 0.5) * gl.canvas.height;
    
                        //let pos = review.text.position;
                        let posW =  review.text.position;
                        let pos = view.Camera.world2ScreenWithMatrix(view.Camera.matMVP, new VIZCore.Vector3().copy(posW));
                          
                        let w = metrics.width + review.style.border.offset * 2;
                        let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
                        //text center offset
                        //pos.x -= w * 0.5;
                        //pos.y -= h * 0.5;
    
                        // 박스 그리기
                        if(0)
                        {
                            let x = pos.x - review.style.border.offset;
                            let y = pos.y - review.style.border.offset;
    
                            // background 설정
                            view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                            if (review.style.border.type === 0)
                            view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                            else if (review.style.border.type === 1)
                            view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
    
                            //선택 범위 등록
                            review.rect = [];
                            review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
                        }
                        else
                        {
                            let x = pos.x - review.style.border.offset;
                            let y = pos.y - review.style.border.offset;
    
                            //선택 범위 등록
                            review.rect = [];
                            review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
                        }
    
                        // font color
                        ctx_review.fillStyle = "rgba(" + review.style.font.color.r + "," + review.style.font.color.g + ","
                            + review.style.font.color.b + "," + review.style.font.color.glAlpha() + ")";
    
                        for (let i = 0; i < review.text.value.length; i++) {
                            ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                        }
                    }
                    break;
            }
    
            if(!drawFirst) 
            {
                //선택 범위 등록
                review.rect = [];
                //review.rect.push(new VIZCore.Rect(x, y, x + w, y + h));
                review.rect[0] = new VIZCore.Rect(drawMin.x, drawMax.y, drawMax.x, drawMin.y);
            }
        }

        
        function draw_Text(ctx_review, review, x, y, metrics){

            let textOffset = new VIZCore.Vector2();
            if (review.action !== undefined) {
                //2D Note의 경우 Matrix로 계산하지 않음
                //textPosition = review.action.text.transform.multiplyVector(textPosition);
    
                textOffset.copy(review.action.text.offset);
                textOffset.x *= view.Camera.clientWidth;
                textOffset.y *= view.Camera.clientHeight * -1;
            }

            view.Renderer.Util.SetReviewFontOption(ctx_review, review);

            // let color = review.style.border.color;
            // ctx_review.strokeStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + 0 + ")";

            let getDrawInfo = (text)=>{
                let result = [];
                let getInfo = ()=>{
                    let info = {
                        text : "",
                        color : undefined,
                        offset : 0
                    };
                    return info;
                }
                
                let measure = undefined;
                // Custom Style 확인
                let count = (text.match(/<fa/g) || []).length;
                if(count > 0)
                {
                    let arr = text.split("</fa>");
                    let calcText = "";
                    for(let i = 0; i < arr.length; i++)
                    {
                        let str = arr[i];
                        let indexTagStart = text.indexOf("<fa");
                        let indexTagEnd = str.indexOf(">");
                        let indexTextEnd = str.length;
                        let tmpText = str.substring(indexTagEnd + 1, indexTextEnd);
                        
                        let strStyle = str.substring(indexTagStart, indexTagEnd);
                        strStyle = strStyle.replace('<fa style=', '');
                        strStyle = strStyle.replace('color:rgb', '');
                        strStyle = strStyle.replaceAll('\"', '');
                        strStyle = strStyle.replaceAll('(', '');
                        strStyle = strStyle.replaceAll(')', '');
                        strStyle = strStyle.trim();
        
                        let arrColor = strStyle.split(',');

                        calcText+=tmpText;
                        

                        let info = getInfo();
                        info.text = tmpText;
                        info.color = "rgba(" + arrColor[0] + "," + arrColor[1] + "," + arrColor[2] + "," + 1 + ")";

                        if(measure === undefined){
                            measure = ctx_review.measureText(calcText);
                            info.offset = 0;
                        }
                        else{
                            measure = ctx_review.measureText(result[i-1].text);
                            info.offset = result[i-1].offset + measure.width;
                        }

                        result.push(info);
                    }
                }
                return result;                
            };
    

            let drawCustomStyleText = function(text, idxText){
                let arrCustom = getDrawInfo(text);
                if(arrCustom.length === 0)
                {
                    ctx_review.fillText(text, x + textOffset.x, y + textOffset.y +
                        (metrics.ascent * idxText + metrics.ascent + review.style.border.offset * idxText));
                }
                else{
                    for(let i = 0; i < arrCustom.length;i++)
                    {
                        let info = arrCustom[i];
                        ctx_review.fillStyle = info.color;

                        ctx_review.fillText(info.text, x + textOffset.x + info.offset, y + textOffset.y +
                            (metrics.ascent * idxText + metrics.ascent + review.style.border.offset * idxText));
                    }
                }
            };

            for (let i = 0; i < review.text.value.length; i++) {
                drawCustomStyleText(review.text.value[i], i);
            }
        }
    
    
        function draw_SurfaceNote(ctx_review, review) {
            if (review.text.value.length === 0)
                return;

            if (review.text.position === undefined)
                return;
    
            let textPosition = new VIZCore.Vector3().copy(review.text.position);
            let drawPosition = [];
            drawPosition[0] = new VIZCore.Vector3().copy(review.drawitem.position[0]);
            let textOffset = new VIZCore.Vector3();
            let drawOffset = new VIZCore.Vector3();
    
            //Action Update
            if (review.action !== undefined) {
                textPosition = review.action.text.transform.multiplyVector(textPosition);
                textOffset.copy(review.action.text.offset);
                textOffset.x *= view.Camera.clientWidth;
                textOffset.y *= view.Camera.clientHeight * -1;
                
                drawPosition[0] = review.action.drawitem.transform.multiplyVector(drawPosition[0]);
                drawOffset.copy(review.action.drawitem.offset);
                drawOffset.x *= view.Camera.clientWidth;
                drawOffset.y *= view.Camera.clientHeight * -1;
            }
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics =  view.Renderer.Util.GetTextMetrics(ctx_review, review);
    
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, textPosition);
    
            // arrow, point
            if(review.tag === undefined)
            {
                if (review.text.value[0] === "")
                    return;
                
                let linePos =  view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawPosition[0]);
    
                view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x + drawOffset.x, linePos.y + drawOffset.y,
                    pos.x + drawOffset.x, pos.y + drawOffset.y,
                    review.style.arrow.size);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
    
                    view.Renderer.Util.DrawPoint(ctx_review, linePos.x + drawOffset.x, linePos.y + drawOffset.y,
                        review.style.point.size);
                }
            }
            else {
                //tag 가 있는경우 심볼

                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawPosition[0]);
    
                if (review.text.value[0] !== ""){
                    view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
                    view.Renderer.Util.DrawLine(ctx_review, linePos.x + drawOffset.x, linePos.y + drawOffset.y,
                        pos.x + drawOffset.x, pos.y + drawOffset.y);
                }

                // symbol bg color
                ctx_review.fillStyle = "rgba(" + review.tag.style.background.color.r + "," + review.tag.style.background.color.g + ","
                    + review.tag.style.background.color.b + "," + review.tag.style.background.color.glAlpha() + ")";
                view.Renderer.Util.DrawPoint(ctx_review, linePos.x + drawOffset.x, linePos.y + drawOffset.y,
                        review.tag.radius);

                
                // font 설정
                //view.Renderer.Util.SetReviewFontOption(ctx_review, review);
              
                // symbol text color
                ctx_review.font = review.tag.style.font.size + "pt " + review.tag.style.font.face;
                ctx_review.fillStyle = "rgba(" + review.tag.style.font.color.r + "," + review.tag.style.font.color.g + ","
                + review.tag.style.font.color.b + "," + review.tag.style.font.color.glAlpha() + ")";


                {
                    const symbolMetrics = view.Renderer.Util.GetTextMetricsByFont(ctx_review, review.tag.text, review.tag.style.font);

                    let syw = symbolMetrics.width;
                    let syh = symbolMetrics.height;
            
                    //text center offset
                    let symbolLinePosX = linePos.x - syw * 0.5;
                    let symbolLinePosY = linePos.y - syh * 0.5;

                    ctx_review.fillText(review.tag.text, symbolLinePosX + drawOffset.x, symbolLinePosY + drawOffset.y +
                        symbolMetrics.ascent);

                    // for (let i = 0; i < review.text.value.length; i++) {
                    //     ctx_review.fillText(review.text.value[i], pos.x + textOffset.x, pos.y + textOffset.y +
                    //         (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                    // }
                }


            }
    
            if (review.text.value[0] === "")
                return;

            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            // background
            {
                let x = pos.x - review.style.border.offset + textOffset.x;
                let y = pos.y - review.style.border.offset + textOffset.y;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
    
                //draw_ToolTipRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
            
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // 회전 테스트
                //if(review.text.rotate !== undefined)
                if(false)
                {
                    let transX = pos.x + textOffset.x;
                    let transY = pos.y + textOffset.y;
                    ctx_review.save();
                    ctx_review.translate(transX + w/2, transY + h/2);
                    let rotateValue = 55;
                    let angle = 0;
                    let dir = new VIZCore.Vector3(1,0,0);
    
                    //let targetPos = new VIZCore.Vector3(-1634023,1172350,220);
                    let targetPos = new VIZCore.Vector3(-1426114, 1288620, textPosition.z);
                    dir = new VIZCore.Vector3().subVectors(targetPos, textPosition).normalize();
    
                    function getAngle(x1, y1, x2, y2) {
                        let rad = Math.atan2(y2 - y1, x2 - x1);
                        return (rad * 180) / Math.PI;
                    }
    
                    let matRotateMV = new VIZCore.Matrix4().copy(view.Camera.matMV);
                    matRotateMV.setPosition(new VIZCore.Vector3());                
                    //dir = matRotateMV.multiplyVector(dir);
    
                    let viewPos = new VIZCore.Vector3().addVectors(new VIZCore.Vector3().copy(textPosition), new VIZCore.Vector3().copy(dir).multiplyScalar(100));
                    let screenViewPos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, viewPos);
                    let viewPosSource = new VIZCore.Vector3().copy(textPosition);
                    let screenViewPosSource = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, viewPosSource);
                    angle = getAngle(screenViewPosSource.x, screenViewPosSource.y, screenViewPos.x, screenViewPos.y);
    
                    //ctx_review.rotate(Math.PI/180 * (angle + rotateValue));
                    //ctx_review.rotate(Math.PI/180 * (angle + 90));
                    ctx_review.rotate(Math.PI/180 * (angle));
    
                    //ctx_review.fillText("Your Label Here", 0, 0);
    
                    for (let i = 0; i < review.text.value.length; i++) {
                        ctx_review.fillText(review.text.value[i], textOffset.x - w/2, textOffset.y +
                            (metrics.ascent * i + metrics.ascent + review.style.border.offset * i) - h/2);
                        //ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + review.style.border.offset * i));
                    }
                    ctx_review.restore();
                }
                else
                {
                    // // text
                    // for (let i = 0; i < review.text.value.length; i++) {
                    //     ctx_review.fillText(review.text.value[i], pos.x + textOffset.x, pos.y + textOffset.y +
                    //         (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                    //     //ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + review.style.border.offset * i));
                    // }

                    draw_Text(ctx_review, review, pos.x, pos.y, metrics);
                }
            }
        }
    
        function draw_2DNote(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
            if (review.text.position === undefined)
                return;
                    
            let textPosition = new VIZCore.Vector3().copy(review.text.position);
    
            //Action Update
            let textOffset = new VIZCore.Vector2();
            if (review.action !== undefined) {
                //2D Note의 경우 Matrix로 계산하지 않음
                //textPosition = review.action.text.transform.multiplyVector(textPosition);
    
                textOffset.copy(review.action.text.offset);
                textOffset.x *= view.Camera.clientWidth;
                textOffset.y *= view.Camera.clientHeight * -1;
            }
    
            // 폰트 설정
            ctx_review.font = review.style.font.size + "pt " + review.style.font.face;
    
            if (review.style.background.enable) {
                // background color
                ctx_review.fillStyle = "rgba(" + review.style.background.color.r + "," + review.style.background.color.g + ","
                    + review.style.background.color.b + "," + review.style.background.color.glAlpha() + ")";
            }
            else {
                ctx_review.fillStyle = "rgba(" + review.style.background.color.r + "," + review.style.background.color.g + ","
                    + review.style.background.color.b + "," + 0 + ")";
            }
    
            if (review.style.border.enable) {
                // border color
                ctx_review.strokeStyle = "rgba(" + review.style.border.color.r + "," + review.style.border.color.g + ","
                    + review.style.border.color.b + "," + review.style.border.color.glAlpha() + ")";
                    ctx_review.lineWidth = review.style.border.thickness;
            }
            else {
                // border color
                ctx_review.strokeStyle = "rgba(" + review.style.border.color.r + "," + review.style.border.color.g + ","
                    + review.style.border.color.b + "," + 0 + ")";
                    ctx_review.lineWidth = review.style.border.thickness;
            }
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);    

            let pos = new VIZCore.Vector3().copy(textPosition);
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            // background
            {
                let x = pos.x - review.style.border.offset + textOffset.x;
                let y = pos.y - review.style.border.offset + textOffset.y;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
            
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            // 글자 그리기
            // font color
            // ctx_review.fillStyle = "rgba(" + review.style.font.color.r + "," + review.style.font.color.g + ","
            //     + review.style.font.color.b + "," + review.style.font.color.glAlpha() + ")";
            // font 설정

            draw_Text(ctx_review, review, pos.x, pos.y, metrics);
            // view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // for (let i = 0; i < review.text.value.length; i++) {
            //     ctx_review.fillText(review.text.value[i], pos.x + textOffset.x, pos.y + textOffset.y +
            //         (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
            // }


        }

        function draw_3DNote(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
            if (review.text.position === undefined)
                return;
    
            let textPosition = new VIZCore.Vector3().copy(review.text.position);
            let textOffset = new VIZCore.Vector3();
    
            //Action Update
            if (review.action !== undefined) {
                textPosition = review.action.text.transform.multiplyVector(textPosition);
                textOffset.copy(review.action.text.offset);
                textOffset.x *= view.Camera.clientWidth;
                textOffset.y *= view.Camera.clientHeight * -1;
            }
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, textPosition);
            let posTextTmp = new VIZCore.Vector2().copy(pos);
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            // 박스 그리기
            {
                let x = pos.x - review.style.border.offset + textOffset.x;
                let y = pos.y - review.style.border.offset + textOffset.y;
    
                // image가 있는 경우 위치 변경
                if(review.icon.image !== undefined)
                {
                    if(review.icon.align === VIZCore.Enum.ALIGN.TOP_LEFT || review.icon.align === VIZCore.Enum.ALIGN.MIDDLE_LEFT || review.icon.align === VIZCore.Enum.ALIGN.BOTTOM_LEFT)
                    {
                        x -= review.icon.size + review.icon.offset * 2;
                        w += review.icon.size + review.icon.offset * 2;
                    }
                    else if(review.icon.align === VIZCore.Enum.ALIGN.TOP_RIGHT || review.icon.align === VIZCore.Enum.ALIGN.MIDDLE_RIGHT || review.icon.align === VIZCore.Enum.ALIGN.BOTTOM_RIGHT)
                    {
                        w += review.icon.size + review.icon.offset * 2;
                    }
                    
                }
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
            
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
    
                // Image 그리기
                if(review.icon.image !== undefined)
                {
                    let imgWidth = review.icon.size;
                    let imgHeight = review.icon.size;
    
                    if (imgWidth <= 0)
                        imgWidth = review.icon.image.width;
    
                    if (imgHeight <= 0)
                        imgHeight = review.icon.image.height;
    
                    let x = pos.x - review.style.border.offset + textOffset.x;
                    let y = pos.y - review.style.border.offset + textOffset.y;
    
                    let imgOffsetX = 0;
                    let imgOffsetY = 0;
                    // TopLeft
                    let imgX = x - review.icon.offset - review.icon.size + review.style.border.offset;
                    let imgY = y + review.icon.offset;
    
                    switch(review.icon.align)
                    {
                        case VIZCore.Enum.ALIGN.TOP_LEFT : {
                            
                        }
                        break;
                        case VIZCore.Enum.ALIGN.MIDDLE_LEFT : {
                            imgY = y + (h * 0.5) - (imgHeight / 2);
                        }
                        break;
                        case VIZCore.Enum.ALIGN.BOTTOM_LEFT : {
                            imgY = y + h - imgHeight - review.icon.offset;
                        }
                        break;
                        case VIZCore.Enum.ALIGN.TOP_RIGHT : {
                            imgX += w + review.icon.offset * 4 - review.icon.size;
                        }
                        break;
                        case VIZCore.Enum.ALIGN.MIDDLE_RIGHT : {
                            imgX += w + review.icon.offset * 4 - review.icon.size;
                            imgY = y + (h * 0.5) - (imgHeight / 2);
                        }
                        break;
                        case VIZCore.Enum.ALIGN.BOTTOM_RIGHT : {
                            imgX += w + review.icon.offset * 4 - review.icon.size;
                            imgY = y + h - imgHeight - review.icon.offset;
                        }
                        break;
                    }
    
                    ctx_review.drawImage(review.icon.image, imgX, imgY, imgWidth, imgHeight);
                    // 이미지 좌표 계산
                    review.icon.rect.x = imgX - posTextTmp.x;
                    review.icon.rect.y = imgY - posTextTmp.y;
                    review.icon.rect.width = imgWidth;
                    review.icon.rect.height = imgHeight;
    
                }
            }
    
            // font color
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
            // ctx_review.fillStyle = "rgba(" + review.style.font.color.r + "," + review.style.font.color.g + ","
            //     + review.style.font.color.b + "," + review.style.font.color.glAlpha() + ")";
    
            // for (let i = 0; i < review.text.value.length; i++) {
            //     ctx_review.fillText(review.text.value[i], pos.x + textOffset.x, pos.y + textOffset.y +
            //         (metrics.ascent * i + metrics.ascent + review.style.border.offset * i + metrics.descent));
            // }

            draw_Text(ctx_review, review, pos.x, pos.y, metrics);
        }
    
        function draw_HeaderNote(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
            if (review.text.position === undefined)
                return;
    
            let textPosition = new VIZCore.Vector3().copy(review.text.position);
            let textOffset = new VIZCore.Vector3();
    
            //Action Update
            if (review.action !== undefined) {
                textPosition = review.action.text.transform.multiplyVector(textPosition);
                textOffset.copy(review.action.text.offset);
                textOffset.x *= view.Camera.clientWidth;
                textOffset.y *= view.Camera.clientHeight * -1;
            }
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            //const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const metrics = view.Renderer.Util.GetTextMetricsByFont(ctx_review, review.text.value, review.style.font);
    
    
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
            // // compute a clipspace position
    
            // // using the matrix we computed for the F
            // let clipspace = new VIZCore.Matrix4().transformVector(matMVP.elements, [textPosition.x, textPosition.y, textPosition.z, 1]);
    
            // // divide X and Y by W just like the GPU does.
            // clipspace[0] /= clipspace[3];
            // clipspace[1] /= clipspace[3];
    
            // // convert from clipspace to pixels
            // let pixelX = (clipspace[0] * 0.5 + 0.5) * gl.canvas.width;
            // let pixelY = (clipspace[1] * -0.5 + 0.5) * gl.canvas.height;
    
            // let pos = new VIZCore.Vector2(pixelX, pixelY);
            
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, textPosition);        
            let posTextTmp = new VIZCore.Vector2().copy(pos);
    
            let w = metrics.width + review.style.border.offset * 2;
    
            // header 사이즈 추가
            let metHeader = undefined;
            if(review.header.text.value.length > 0)
            {
                metHeader = view.Renderer.Util.GetTextMetricsByFont(ctx_review, review.header.text.value, review.header.style.font);
                    if(metrics.width < metHeader.width)
                    w = metHeader.width + review.style.border.offset * 2;
            }
            // 아이콘 사이즈 추가
            if(review.header.icon.image !== undefined)
            {
                w += review.header.icon.size + review.header.icon.offset * 2;
            }
    
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            // 헤더 높이 추가
            h += review.header.height;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            // 박스 그리기
            {
    
                if(true)
                {
                    ctx_review.shadowColor = 'rgba(0, 0, 0, 0.1)'; // 투명도 20%의 검정색
                    //ctx_review.shadowColor = "rgba(" + color.r + "," + color.g + "," + color.b + "," + 0.8 + ")";
                    ctx_review.shadowOffsetX = 4;
                    ctx_review.shadowOffsetY = 4;
                    ctx_review.shadowBlur = 2;
                }
    
                let x = pos.x - review.style.border.offset + textOffset.x;
                let y = pos.y - review.style.border.offset + textOffset.y;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
    
                if(true)
                {
                    ctx_review.shadowOffsetX = 0;
                    ctx_review.shadowOffsetY = 0;
                    ctx_review.shadowBlur = 0;
                }
            }
    
            // 본문 텍스트
            // font color
            ctx_review.fillStyle = "rgba(" + review.style.font.color.r + "," + review.style.font.color.g + ","
                + review.style.font.color.b + "," + review.style.font.color.glAlpha() + ")";
    
                // 헤더 높이 계산
            let textSize = view.Renderer.Util.GetTextSizeByFont(ctx_review, review.text.value, review.style.font);
            for (let i = 0; i < review.text.value.length; i++) {
                if(Array.isArray(review.text.value[i]))
                {
                    let arr = review.text.value[i];
                    let offsetText = " ";
                    //let offsetColumn = w / arr.length;
                    let offsetColumn = 0;
                    let startTextX = pos.x + textOffset.x;
                    for(let j = 0; j < arr.length; j++)
                    {
                        let text = arr[j];
                        //let startX = (offsetColumn * j) + pos.x + textOffset.x;
                        let textSpace = 0;
                        if(j !== 0)
                        {
                            textSpace = textSize[j - 1];
                        }
                        let startX = (offsetColumn + textSpace) + pos.x + textOffset.x;
                        let startY = pos.y + textOffset.y + review.header.height + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i);
                        ctx_review.fillText(text, startX, startY);
    
                        //view.Renderer.Util.DrawRect(ctx_review, startX - review.style.border.offset, startY - metrics.height + review.style.border.offset - 3, textSize[j], metrics.height + 1, false, true);
    
                        offsetColumn += textSpace;
                    }
    
                    let lineY = pos.y + textOffset.y + review.header.height + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i) + 2;
                    // Row
                    view.Renderer.Util.DrawLine(ctx_review, pos.x, lineY, pos.x + w, lineY);
    
                    let lineSpace = 0;
                    for(let j = 0; j < textSize.length - 1; j++)
                    {
                        let lineX = lineSpace + textSize[j] + pos.x - review.style.border.offset;
                        // Column
                        view.Renderer.Util.DrawLine(ctx_review, lineX, pos.y + textOffset.y + review.header.height - review.style.border.offset, lineX, lineY);
                        lineSpace += textSize[j];
                    }
                }
                else{
                    ctx_review.fillText(review.text.value[i], pos.x + textOffset.x, pos.y + textOffset.y + review.header.height +
                        (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
    
            // 헤더 그리기
            {
                let x = pos.x - review.style.border.offset + textOffset.x;
                let y = pos.y - review.style.border.offset + textOffset.y;
                // background 설정
                //view.Renderer.Util.SetReviewBgOption(ctx_review, review);
                if (review.header.style.background.enable) {
                    // background color
                    ctx_review.fillStyle = "rgba(" + review.header.style.background.color.r + "," + review.header.style.background.color.g + ","
                        + review.header.style.background.color.b + "," + review.header.style.background.color.glAlpha() + ")";
                }
                else {
                    ctx_review.fillStyle = "rgba(" + review.header.style.background.color.r + "," + review.header.style.background.color.g + ","
                        + review.header.style.background.color.b + "," + 0 + ")";
                }
        
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, review.header.height, review.style.background.enable, false);
                else if (review.style.border.type === 1)                 
                    view.Renderer.Util.DrawRoundRect_Custom(ctx_review, x, y, w, review.header.height, review.style.border.round, review.style.background.enable, review.style.border.enable, true, true, false, false);
            }
    
            // 헤더 텍스트
            // 폰트 설정
            //ctx_review.font = review.header.style.font.bold? "bold" : "" + review.header.style.font.size + "pt " + review.header.style.font.face;
            let bold = review.header.style.font.bold? "bold " : "";
            ctx_review.font = bold + review.header.style.font.size + "pt " + review.header.style.font.face;
    
            ctx_review.fillStyle = "rgba(" + review.header.style.font.color.r + "," + review.header.style.font.color.g + ","
                + review.header.style.font.color.b + "," + review.header.style.font.color.glAlpha() + ")";            
    
            // 헤더 높이 계산
            for (let i = 0; i < review.header.text.value.length; i++) {
                
                ctx_review.fillText(review.header.text.value[i], pos.x + textOffset.x, pos.y + textOffset.y +
                        (metHeader.ascent * i + metHeader.ascent + review.style.border.offset * i));
                
            }
    
            // Image 그리기
            if (review.header.icon.image !== undefined)
            {
                let imgWidth = review.header.icon.size;
                let imgHeight = review.header.icon.size;
    
                if (imgWidth <= 0)
                    imgWidth = review.header.icon.image.width;
    
                if (imgHeight <= 0)
                    imgHeight = review.header.icon.image.height;
    
                // switch (review.drawitem.custom.align) {
                //     case 1: //Left Top                    
                //         break;
                //     case 2: //Top
                //         {
                //             imgPosition.x = imgPosition.x - imgWidth / 2;
                //         }
                //         break;
                //     case 3:
                //         break;
                //     case 4:
                //         break;
                //     case 6:
                //         break;
                //     case 7:
                //         break;
                //     case 8: //Bottom
                //         {
                //             imgPosition.x = imgPosition.x - imgWidth / 2;
                //             imgPosition.y = imgPosition.y - imgHeight;
                //         }
                //         break;
                //     case 9:
                //         break;
                    
                //     default: //Center
                //         {
                //             imgPosition.x = imgPosition.x - imgWidth / 2;
                //             imgPosition.y = imgPosition.y - imgHeight / 2;
                //         }
                //         break;
                // }
                let x = pos.x - review.style.border.offset + textOffset.x;
                let y = pos.y - review.style.border.offset + textOffset.y;
    
                let imgX = w - review.header.icon.size - review.header.icon.offset + x;
                let imgY = y + review.header.icon.offset;
    
                ctx_review.drawImage(review.header.icon.image, imgX, imgY, imgWidth, imgHeight);
                // 이미지 좌표 계산
                review.header.icon.rect.x = imgX - posTextTmp.x;
                review.header.icon.rect.y = imgY - posTextTmp.y;
                review.header.icon.rect.width = imgWidth;
                review.header.icon.rect.height = imgHeight;
    
            }
        }
    
        function draw_Text2D(text, position, color) {
            view.Renderer.Util.DrawText2D(view.ctx_review, text, position, color)
        }
    
        function draw_UserTooltip(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
            if (review.text.position === undefined)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
    
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

            let textPosition = new VIZCore.Vector3().copy(review.text.position);
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, textPosition);
                   
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            //pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            // background
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                //if (review.style.border.type === 0)
                //    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                //else if (review.style.border.type === 1)
                //    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
    
                view.Renderer.Util.DrawToolTipRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                    //ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + review.style.border.offset * i));
                }
            }
        }
    
        function draw_ImageNote(ctx_review, review) {
            //if (review.text.value.length === 0)
            //    return;
            //if (review.text.position === undefined)
            //    return;
            if (review.drawitem.custom === undefined) return;
    
            let textPosition = new VIZCore.Vector3().copy(review.text.position); //2D Offset
            let drawPosition = [];
            drawPosition[0] = new VIZCore.Vector3().copy(review.drawitem.position[0]);
            let textOffset = new VIZCore.Vector3();
            let drawOffset = new VIZCore.Vector3();
    
            let shadowNum = 1;
    
            // 그림자 효과
            if(view.Renderer.useNoteEffect == true && review.drawitem.custom.effect !== undefined && review.drawitem.custom.effect.use)
            {
                shadowNum = 4;
                let ecolor = 'rgba(255, 0, 0, 1.0)'; 
                if(review.drawitem.custom.effect.color !== undefined)
                {
                    ecolor = "rgba(" + review.drawitem.custom.effect.color.r + "," + review.drawitem.custom.effect.color.g + ","
                            + review.drawitem.custom.effect.color.b + "," + review.drawitem.custom.effect.color.glAlpha() + ")";
                }
                ctx_review.shadowColor = ecolor; 
                
                ctx_review.shadowOffsetX = 0;
                ctx_review.shadowOffsetY = 0;
                if(review.drawitem.custom.effectVal === undefined)
                    review.drawitem.custom.effectVal = 0;
                else{
                    review.drawitem.custom.effectVal += 0.5;
                    if(review.drawitem.custom.effectVal > 20)
                        review.drawitem.custom.effectVal = 0;
                }
                
                ctx_review.shadowBlur = review.drawitem.custom.effectVal;
            }
    
            for(let si = 0 ; si < shadowNum ; si++)
            {
                //Action Update
                if (review.action !== undefined) {
                    textOffset.copy(review.action.text.offset);
                    textOffset.x *= view.Camera.clientWidth;
                    textOffset.y *= view.Camera.clientHeight * -1;
    
                    drawPosition[0] = review.action.drawitem.transform.multiplyVector(drawPosition[0]);
                    drawOffset.copy(review.action.drawitem.offset);
                    drawOffset.x *= view.Camera.clientWidth;
                    drawOffset.y *= view.Camera.clientHeight * -1;
                }
    
                const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
                let imgPosition = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3().copy(drawPosition[0]));
    
                let imgWidth = 0;
                let imgHeight = 0;
                let imageSpaceX = 0;
                let imageSpaceY = 0;
                
                    
                        
                 // Image 위치 조정
                 if (review.drawitem.custom.image !== undefined)
                    {
                        imgWidth = review.drawitem.custom.size.x;
                        imgHeight = review.drawitem.custom.size.y;
        
                        if (imgWidth <= 0)
                            imgWidth = review.drawitem.custom.image.width;
        
                        if (imgHeight <= 0)
                            imgHeight = review.drawitem.custom.image.height;
        
                        switch (review.drawitem.custom.align) {
                            case 1: //Left Top                    
                                break;
                            case 2: //Top
                                {
                                    imgPosition.x = imgPosition.x - imgWidth / 2;
                                }
                                break;
                            case 3:
                                break;
                            case 4:
                                break;
                            case 6:
                                break;
                            case 7:
                                break;
                            case 8: //Bottom
                                {
                                    imgPosition.x = imgPosition.x - imgWidth / 2;
                                    imgPosition.y = imgPosition.y - imgHeight;
                                }
                                break;
                            case 9:
                                break;
                            
                            default: //Center
                                {
                                    imgPosition.x = imgPosition.x - imgWidth / 2;
                                    imgPosition.y = imgPosition.y - imgHeight / 2;
                                }
                                break;
                        }
        
                        if(review.drawitem.custom.offset !== undefined)
                        {
                            imageSpaceX = review.drawitem.custom.offset.x;
                            imageSpaceY = review.drawitem.custom.offset.y;

                            if(review.style.border.offset_x !== undefined)
                                imageSpaceX += review.style.border.offset_x;
                        }
                    }
    
                // font 설정
                if (review.text.value.length !== 0) {
                    view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                    // box metrics
                    const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
    
                    //let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3().copy(textPosition));
                    let pos = new VIZCore.Vector2(imgPosition.x + textPosition.x, imgPosition.y + textPosition.y);
    
                    let w = metrics.width + review.style.border.offset * 2;
                    let h = metrics.height * review.text.value.length + review.style.border.offset * 2;

                    if (review.drawitem.custom.image !== undefined)
                    {
                        w += imgWidth + imageSpaceX;
                        
                        // if(review.style.border.offset_x !== undefined)
                        //     w += review.style.border.offset_x;
                        // if(review.style.border.offset_y !== undefined)
                        //     h += review.style.border.offset_y;
                    }

                    if(review.style.border.offset_x !== undefined)
                        w += review.style.border.offset_x;
                    if(review.style.border.offset_y !== undefined)
                        h += review.style.border.offset_y;

                    {
                        //text center offset
                        pos.x -= w * 0.5;
                        pos.y -= h * 0.5;
                    }

                    // background
                    if(review.style.border.fixed)
                    {
                        let x = pos.x - review.style.border.offset + textOffset.x;
                        let y = pos.y - review.style.border.offset + textOffset.y;
                        // background 설정
                        view.Renderer.Util.SetReviewBgOption(ctx_review, review);

                        // 박스 그리기
                        if (review.style.border.type === 0)
                        view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                        else if (review.style.border.type === 1)
                        view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w , h, review.style.border.round, review.style.background.enable, review.style.border.enable);
                    }
                    else
                    {
                        let x = pos.x - review.style.border.offset + textOffset.x;
                        let y = pos.y - review.style.border.offset + textOffset.y;
    
                        // background 설정
                        view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                        // 박스 그리기
                        if (review.style.border.type === 0)
                        view.Renderer.Util.DrawRect(ctx_review, x, y, w , h, review.style.background.enable, review.style.border.enable);
                        else if (review.style.border.type === 1)
                        view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
                    }

                    if (review.drawitem.custom.image !== undefined)
                    {
                        let x = imgPosition.x + drawOffset.x + imageSpaceX - (w * 0.5) - review.style.border.offset;
                        let y = imgPosition.y + drawOffset.y + imageSpaceY - (h * 0.5) + imgHeight / 2;
                        ctx_review.drawImage(review.drawitem.custom.image, x, y, imgWidth, imgHeight);
                    }
                        
    
                    {
                        // font 설정
                        view.Renderer.Util.SetReviewFontOption(ctx_review, review);

                        let offsetX = 0;
                        let offsetY = 0;
                        if(review.text.offset_x !== undefined)
                            offsetX = review.text.offset_x;

                        if(review.text.offset_y !== undefined)
                            offsetY = review.text.offset_y;

                        // text
                        for (let i = 0; i < review.text.value.length; i++) {
                            // ctx_review.fillText(review.text.value[i], pos.x + textOffset.x, pos.y + textOffset.y +
                            //     (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                            ctx_review.fillText(review.text.value[i], pos.x + textOffset.x + offsetX + imageSpaceX, pos.y + textOffset.y + offsetY+
                                (metrics.ascent * i + metrics.ascent + review.style.border.offset / 2));
                        }
                    }
                }

               
            }
    
            if(review.drawitem.custom.effect)
            {
                ctx_review.shadowOffsetX = 0;
                ctx_review.shadowOffsetY = 0;
                ctx_review.shadowBlur = 0;
            }
        }
    
        function draw_MeasurePos(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            let textPosition = new VIZCore.Vector3().copy(review.text.position);
            let drawPosition = [];
            drawPosition[0] = new VIZCore.Vector3().copy(review.drawitem.position[0]);
            let textOffset = new VIZCore.Vector3();
            let drawOffset = new VIZCore.Vector3();
    
            //Action Update
            //if (review.action !== undefined) {
            //    textPosition = review.action.text.transform.multiplyVector(textPosition);
            //    textOffset.copy(review.action.text.offset);
            //    textOffset.x *= gl.canvas.width;
            //    textOffset.y *= gl.canvas.height * -1;
            //
            //    drawPosition[0] = review.action.drawitem.transform.multiplyVector(drawPosition[0]);
            //    drawOffset.copy(review.action.drawitem.offset);
            //    drawOffset.x *= gl.canvas.width;
            //    drawOffset.y *= gl.canvas.height * -1;
            //}
          
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
            
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
     
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            // arrow, point
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawPosition[0]);
    
                view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x + drawOffset.x, linePos.y + drawOffset.y,
                    pos.x + drawOffset.x, pos.y + drawOffset.y, review.style.arrow.size);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos.x + drawOffset.x, linePos.y + drawOffset.y, review.style.point.size);
                }
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset + textOffset.x;
                let y = pos.y - review.style.border.offset + textOffset.y;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
            
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x + textOffset.x, pos.y + textOffset.y +
                        (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
    
        function draw_MeasureDistance(ctx_review,  review) {
            if (review.text.value.length === 0)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);    
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);

            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            let drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[0], review.drawitem.position[1]);
            drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
    
            //let textNormal = new VIZCore.Vector3().subVectors(drawCenter, review.text.position);
            //let textLength = textNormal.length();
            //textNormal.normalize();
    
            let textCoord = new VIZCore.Vector3().subVectors(review.text.position, drawCenter);
    
            let lineUpPos = [];
            lineUpPos[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[0], textCoord);
            lineUpPos[1] = new VIZCore.Vector3().addVectors(review.drawitem.position[1], textCoord);
    
            // line1
            {
                let linePos = [];
    
                for (let ii = 0; ii < 2; ii++) {
                    let newPos = review.drawitem.position[0];
    
                    if (ii == 1)
                        newPos = lineUpPos[0];
    
                    let line = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, newPos);
                    linePos[ii] = line;
                }
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // line2
            {
                let linePos = [];
    
                for (let ii = 0; ii < 2; ii++) {
                    let newPos = review.drawitem.position[1];
    
                    if (ii === 1)
                        newPos = lineUpPos[1];
    
                    let line = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, newPos);
                    linePos[ii] = line;
                }
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);

            // length Arrow1
            {    
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            // length Arrow2
            {    
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
    
        //XYZ 축 가시화 추가
        function draw_MeasureDistance_v2(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[0], review.drawitem.position[1]);
            drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
    
            //let textNormal = new VIZCore.Vector3().subVectors(drawCenter, review.text.position);
            //let textLength = textNormal.length();
            //textNormal.normalize();
    
            let textCoord = new VIZCore.Vector3().subVectors(review.text.position, drawCenter);
    
            let lineUpPos = [];
            lineUpPos[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[0], textCoord);
            lineUpPos[1] = new VIZCore.Vector3().addVectors(review.drawitem.position[1], textCoord);
    
            // line1
            {
                let linePos = [];
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // line2
            {
                let linePos = [];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // Axis line        
            if (review.drawitem.axis) {
                let axisLinePos = []; //Screen Pos
                let lineDash = [10, 10];
                axisLinePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                axisLinePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(review.drawitem.position[1].x, review.drawitem.position[0].y, review.drawitem.position[0].z));
                axisLinePos[2] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(review.drawitem.position[1].x, review.drawitem.position[1].y, review.drawitem.position[0].z));
                axisLinePos[3] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
    
                for (let ii = 0; ii < 3; ii++) {
                    view.Renderer.Util.SetReviewAxisLineOption(ctx_review, review, ii);
                    view.Renderer.Util.DrawLineDash(ctx_review, axisLinePos[ii].x, axisLinePos[ii].y, axisLinePos[ii + 1].x, axisLinePos[ii + 1].y, lineDash);
                }
            }
    
            let arrowPos = new VIZCore.Vector2();
    
            //그려야 하는 텍스트 및 박스
            let textBoxItems = [];
    
            // 기본 font 및 박스 생성
            {
                let txtItem = drawTextBoxItem();
    
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // box metrics
                const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
                let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
                arrowPos.set(pos.x, pos.y);
    
                let w = metrics.width + review.style.border.offset * 2;
                let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
                //text center offset
                pos.x -= w * 0.5;
                pos.y -= h * 0.5;
    
                //bg
                {
                    let x = pos.x - review.style.border.offset;
                    let y = pos.y - review.style.border.offset;
    
                    txtItem.rect.set(x, y, x + w, y + h);
                }
    
                // text
                {
                    for (let i = 0; i < review.text.value.length; i++) {
                        txtItem.position[i] = new VIZCore.Vector2(pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                        txtItem.text[i] = review.text.value[i];
                    }
                }
    
                textBoxItems[0] = txtItem;
            }
    
            // Axis line Text 및 박스 생성
            if (review.drawitem.axis) {
                let axisLinePos = []; //world
                axisLinePos[0] = review.drawitem.position[0];
                axisLinePos[1] = new VIZCore.Vector3(review.drawitem.position[1].x, review.drawitem.position[0].y, review.drawitem.position[0].z);
                axisLinePos[2] = new VIZCore.Vector3(review.drawitem.position[1].x, review.drawitem.position[1].y, review.drawitem.position[0].z);
                axisLinePos[3] = review.drawitem.position[1];
    
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
                for (let ii = 0; ii < 3; ii++) {
                    let txtItem = drawTextBoxItem();
    
                    let drawAxisCenter = new VIZCore.Vector3().addVectors(axisLinePos[ii], axisLinePos[ii + 1]);
                    drawAxisCenter.x *= 0.5; drawAxisCenter.y *= 0.5; drawAxisCenter.z *= 0.5;
                    let drawAxisTextPos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawAxisCenter);
    
                    let axisType;
    
                    if (ii === 0)
                        axisType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE;
                    else if (ii === 1)
                        axisType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE;
                    else
                        axisType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE;
    
                    let axisData = [review.drawitem.position[0], review.drawitem.position[1]];
                    let customAxisText = [];
                    view.Measure.UpdateReviewTextByType(axisType, customAxisText, axisData);
    
                    // box metrics
                    const axisMetrics = view.Renderer.Util.GetTextMetricsByText(ctx_review, customAxisText, review.style.font.size);
                    let w = axisMetrics.width + review.style.border.offset * 2;
                    let h = axisMetrics.height * customAxisText.length + review.style.border.offset * 2;
    
                    //text center offset
                    drawAxisTextPos.x -= w * 0.5;
                    drawAxisTextPos.y -= h * 0.5;
    
                    //bg
                    {
                        let x = drawAxisTextPos.x - review.style.border.offset;
                        let y = drawAxisTextPos.y - review.style.border.offset;
    
                        txtItem.rect.set(x, y, x + w, y + h);
                    }
    
                    {
                        // text
                        for (let i = 0; i < customAxisText.length; i++) {
                            txtItem.position[i] = new VIZCore.Vector2(drawAxisTextPos.x, drawAxisTextPos.y + (axisMetrics.ascent * i + axisMetrics.ascent + review.style.border.offset * i));
                            txtItem.text[i] = customAxisText[i];
                            //ctx_review.fillText(customAxisText[i], drawAxisTextPos.x, drawAxisTextPos.y + (axisMetrics.ascent * i + axisMetrics.ascent + review.style.border.offset * i));
                        }
                    }
    
                    textBoxItems[ii + 1] = txtItem;
                }
    
                // Text 겹침 현상으로 인한 통합 텍스트 여부
                let bReviewTextAll = false;
    
                //겹침 현상 검사
                for (let i = 0; i < textBoxItems.length; i++) {
                    for (let j = 0; j < textBoxItems.length; j++) {
                        if (i === j) continue;
                        if (textBoxItems[i].rect.isRectInRect(textBoxItems[j].rect)) {
                            bReviewTextAll = true;
                            break;
                        }
                    }
    
                    if (bReviewTextAll) break;
                }
    
                //텍스트 하나로 통합
                if (bReviewTextAll) {
                    let tempTextBoxItems = [];
                    let txtItem = drawTextBoxItem();
    
                    for (let i = 0; i < textBoxItems.length; i++) {
                        for (let j = 0; j < textBoxItems[i].text.length; j++) {
                            txtItem.text.push(textBoxItems[i].text[j]);
                        }
                    }
    
                    view.Renderer.Util.SetReviewFontOption(ctx_review, review);
                    const metrics = view.Renderer.Util.GetTextMetricsByText(ctx_review, txtItem.text, review.style.font.size);
    
                    let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
                    let w = metrics.width + review.style.border.offset * 2;
                    let h = metrics.height * txtItem.text.length + review.style.border.offset * 2;
    
                    //text center offset
                    pos.x -= w * 0.5;
                    pos.y -= h * 0.5;
    
                    //bg
                    {
                        let x = pos.x - review.style.border.offset;
                        let y = pos.y - review.style.border.offset;
    
                        txtItem.rect.set(x, y, x + w, y + h);
                    }
    
                    // text
                    {
                        for (let i = 0; i < txtItem.text.length; i++) {
                            txtItem.position[i] = new VIZCore.Vector2(pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                        }
                    }
    
                    tempTextBoxItems[0] = txtItem;
                    textBoxItems = tempTextBoxItems;
                }
            }
    
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
            // length Arrow1
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, arrowPos.x, arrowPos.y, review.style.arrow.size);
            }
    
            // length Arrow2
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, arrowPos.x, arrowPos.y, review.style.arrow.size);
            }
    
            for (let i = 0; i < textBoxItems.length; i++) {
                // background 설정
                {
                    view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                    // 박스 그리기
                    if (review.style.border.type === 0)
                        view.Renderer.Util.DrawRect(ctx_review, textBoxItems[i].rect.left, textBoxItems[i].rect.top,
                            textBoxItems[i].rect.right - textBoxItems[i].rect.left, textBoxItems[i].rect.bottom - textBoxItems[i].rect.top,
                            review.style.background.enable, review.style.border.enable);
                    else if (review.style.border.type === 1)
                        view.Renderer.Util.DrawRoundRect(ctx_review, textBoxItems[i].rect.left, textBoxItems[i].rect.top,
                            textBoxItems[i].rect.right - textBoxItems[i].rect.left, textBoxItems[i].rect.bottom - textBoxItems[i].rect.top,
                            review.style.background.enable, review.style.border.enable);
                }
    
                // font 설정
                {
                    view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                    // text
                    for (let j = 0; j < textBoxItems[i].text.length; j++) {
                        ctx_review.fillText(textBoxItems[i].text[j], textBoxItems[i].position[j].x, textBoxItems[i].position[j].y);
                    }
                }
            }
    
            //선택 범위 등록
            review.rect = [];
            for (let i = 0; i < textBoxItems.length; i++) {
                review.rect[i] = textBoxItems[i].rect;
            }
    
        }
    
        function draw_MeasureAngle(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics =  view.Renderer.Util.GetTextMetrics(ctx_review, review);
    
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            // line, point
            {
                let linePos = [];
    
                for (let ii = 0; ii < 3; ii++) {
    
                    let newPos = review.drawitem.position[ii];
                    let screenLinePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, newPos);
                    linePos[ii] = screenLinePos;
                }
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[2].x, linePos[2].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[1].x, linePos[1].y, review.style.point.size);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[2].x, linePos[2].y, review.style.point.size);
                }
            }
    
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
            //angle
            let angleCenter = view.Renderer.Util.DrawAngle(ctx_review, review.drawitem.position[0], review.drawitem.position[1], review.drawitem.position[2], review.style.arrow.size, false);
    
            //line center2Text
            {
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
    
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, angleCenter);
                view.Renderer.Util.DrawLine(ctx_review, linePos.x, linePos.y, pos.x, pos.y);
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
            
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
        
        function draw_MeasureObjectMinDistance(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
            
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);       
    
            let drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[0], review.drawitem.position[1]);
            drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
    
            //let textNormal = new VIZCore.Vector3().subVectors(drawCenter, review.text.position);
            //let textLength = textNormal.length();
            //textNormal.normalize();
    
            let textCoord = new VIZCore.Vector3().subVectors(review.text.position, drawCenter);
    
            let lineUpPos = [];
            lineUpPos[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[0], textCoord);
            lineUpPos[1] = new VIZCore.Vector3().addVectors(review.drawitem.position[1], textCoord);
    
            // line1
            {
                let linePos = [];
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // line2
            {
                let linePos = [];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // Axis line        
            if (review.drawitem.axis) {
                let axisLinePos = []; //Screen Pos
                let lineDash = [10, 10];
                axisLinePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                axisLinePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(review.drawitem.position[1].x, review.drawitem.position[0].y, review.drawitem.position[0].z));
                axisLinePos[2] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(review.drawitem.position[1].x, review.drawitem.position[1].y, review.drawitem.position[0].z));
                axisLinePos[3] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
    
                for (let ii = 0; ii < 3; ii++) {
                    view.Renderer.Util.SetReviewAxisLineOption(ctx_review, review, ii);
                    view.Renderer.Util.DrawLineDash(ctx_review, axisLinePos[ii].x, axisLinePos[ii].y, axisLinePos[ii + 1].x, axisLinePos[ii + 1].y, lineDash);
                }
            }
    
            let arrowPos = new VIZCore.Vector2();
    
            //그려야 하는 텍스트 및 박스
            let textBoxItems = [];
    
            // 기본 font 및 박스 생성
            {
                let txtItem = drawTextBoxItem();
    
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // box metrics
                const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
                let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
                arrowPos.set(pos.x, pos.y);
    
                let w = metrics.width + review.style.border.offset * 2;
                let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
                //text center offset
                pos.x -= w * 0.5;
                pos.y -= h * 0.5;
    
                //bg
                {
                    let x = pos.x - review.style.border.offset;
                    let y = pos.y - review.style.border.offset;
    
                    txtItem.rect.set(x, y, x + w, y + h);
                }
    
                // text
                {
                    for (let i = 0; i < review.text.value.length; i++) {
                        txtItem.position[i] = new VIZCore.Vector2(pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                        txtItem.text[i] = review.text.value[i];
                    }
                }
    
                textBoxItems[0] = txtItem;
            }
    
            // Axis line Text 및 박스 생성
            if (review.drawitem.axis) {
                let axisLinePos = []; //world
                axisLinePos[0] = review.drawitem.position[0];
                axisLinePos[1] = new VIZCore.Vector3(review.drawitem.position[1].x, review.drawitem.position[0].y, review.drawitem.position[0].z);
                axisLinePos[2] = new VIZCore.Vector3(review.drawitem.position[1].x, review.drawitem.position[1].y, review.drawitem.position[0].z);
                axisLinePos[3] = review.drawitem.position[1];
    
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
                for (let ii = 0; ii < 3; ii++) {
                    let txtItem = drawTextBoxItem();
    
                    let drawAxisCenter = new VIZCore.Vector3().addVectors(axisLinePos[ii], axisLinePos[ii + 1]);
                    drawAxisCenter.x *= 0.5; drawAxisCenter.y *= 0.5; drawAxisCenter.z *= 0.5;
                    let drawAxisTextPos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawAxisCenter);
    
                    let axisType;
    
                    if (ii === 0)
                        axisType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE;
                    else if (ii === 1)
                        axisType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE;
                    else
                        axisType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE;
    
                    let axisData = [review.drawitem.position[0], review.drawitem.position[1]];
                    let customAxisText = [];
                    view.Measure.UpdateReviewTextByType(axisType, customAxisText, axisData);
                    
                    // box metrics
                    const axisMetrics = view.Renderer.Util.GetTextMetricsByText(ctx_review, customAxisText, review.style.font.size);
                    let w = axisMetrics.width + review.style.border.offset * 2;
                    let h = axisMetrics.height * customAxisText.length + review.style.border.offset * 2;
    
                    //text center offset
                    drawAxisTextPos.x -= w * 0.5;
                    drawAxisTextPos.y -= h * 0.5;
    
                    //bg
                    {
                        let x = drawAxisTextPos.x - review.style.border.offset;
                        let y = drawAxisTextPos.y - review.style.border.offset;
    
                        txtItem.rect.set(x, y, x + w, y + h);
                    }
    
                    {
                        // text
                        for (let i = 0; i < customAxisText.length; i++) {
                            txtItem.position[i] = new VIZCore.Vector2(drawAxisTextPos.x, drawAxisTextPos.y + (axisMetrics.ascent * i + axisMetrics.ascent + review.style.border.offset * i));
                            txtItem.text[i] = customAxisText[i];
                            //ctx_review.fillText(customAxisText[i], drawAxisTextPos.x, drawAxisTextPos.y + (axisMetrics.ascent * i + axisMetrics.ascent + review.style.border.offset * i));
                        }
                    }
    
                    textBoxItems[ii + 1] = txtItem;
                }
    
                // Text 겹침 현상으로 인한 통합 텍스트 여부
                let bReviewTextAll = false;
    
                //겹침 현상 검사
                for (let i = 0; i < textBoxItems.length; i++) {                
                    for (let j = 0; j < textBoxItems.length; j++) {
                        if (i === j) continue;
                        if (textBoxItems[i].rect.isRectInRect(textBoxItems[j].rect)) {
                            bReviewTextAll = true;
                            break;
                        }
                    }
    
                    if (bReviewTextAll) break;
                }
    
                //텍스트 하나로 통합
                if (bReviewTextAll) {
                    let tempTextBoxItems = [];
                    let txtItem = drawTextBoxItem();
                    
                    for (let i = 0; i < textBoxItems.length; i++) {
                        for (let j = 0; j < textBoxItems[i].text.length; j++) {
                            txtItem.text.push(textBoxItems[i].text[j]);
                        }
                    }
    
                    view.Renderer.Util.SetReviewFontOption(ctx_review, review);
                    const metrics = view.Renderer.Util.GetTextMetricsByText(ctx_review, txtItem.text, review.style.font.size);
    
                    let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
                    let w = metrics.width + review.style.border.offset * 2;
                    let h = metrics.height * txtItem.text.length + review.style.border.offset * 2;
    
                    //text center offset
                    pos.x -= w * 0.5;
                    pos.y -= h * 0.5;
    
                    //bg
                    {
                        let x = pos.x - review.style.border.offset;
                        let y = pos.y - review.style.border.offset;
    
                        txtItem.rect.set(x, y, x + w, y + h);
                    }
    
                    // text
                    {
                        for (let i = 0; i < txtItem.text.length; i++) {
                            txtItem.position[i] = new VIZCore.Vector2(pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                        }
                    }
    
                    tempTextBoxItems[0] = txtItem;
                    textBoxItems = tempTextBoxItems;
                }
            }
            
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
            // length Arrow1
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, arrowPos.x, arrowPos.y, review.style.arrow.size);
            }
    
            // length Arrow2
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, arrowPos.x, arrowPos.y, review.style.arrow.size);
            }
    
            for (let i = 0; i < textBoxItems.length; i++) {
                // background 설정
                {
                    view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                    // 박스 그리기
                    if (review.style.border.type === 0)
                        view.Renderer.Util.DrawRect(ctx_review, textBoxItems[i].rect.left, textBoxItems[i].rect.top,
                            textBoxItems[i].rect.right - textBoxItems[i].rect.left, textBoxItems[i].rect.bottom - textBoxItems[i].rect.top,
                            review.style.background.enable, review.style.border.enable);
                    else if (review.style.border.type === 1)
                        view.Renderer.Util.DrawRoundRect(ctx_review, textBoxItems[i].rect.left, textBoxItems[i].rect.top,
                            textBoxItems[i].rect.right - textBoxItems[i].rect.left, textBoxItems[i].rect.bottom - textBoxItems[i].rect.top,
                            review.style.background.enable, review.style.border.enable);
                }
    
                // font 설정
                {
                    view.Renderer.Util.SetReviewFontOption(ctx_review, review);
                
                    // text
                    for (let j = 0; j < textBoxItems[i].text.length; j++) {
                        ctx_review.fillText(textBoxItems[i].text[j], textBoxItems[i].position[j].x, textBoxItems[i].position[j].y);
                    }
                }
            }
    
            //선택 범위 등록
            review.rect = [];
            for (let i = 0; i < textBoxItems.length; i++) {
                review.rect[i] = textBoxItems[i].rect;
            }
        }
        
        function draw_MeasureNormalDistance(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
    
            //const matMVMatrix = new VIZCore.Matrix4();
            //matMVMatrix.copy(view.Camera.cameraMatrix);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
            
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            let drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[0], review.drawitem.position[3]);
            drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
    
            //let textNormal = new VIZCore.Vector3().subVectors(drawCenter, review.text.position);
            //let textLength = textNormal.length();
            //textNormal.normalize();
    
            let textCoord = new VIZCore.Vector3().subVectors(review.text.position, drawCenter);
    
            let lineUpPos = [];
            lineUpPos[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[0], textCoord);
            lineUpPos[1] = new VIZCore.Vector3().addVectors(review.drawitem.position[3], textCoord);
    
            // line1
            {
                let linePos = [];
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // line2
            {
                let linePos = [];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[3]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            //assistLine
            {
                let linePos = [];
                let lineDash = [10, 10];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(review.drawitem.position[3].x, review.drawitem.position[1].y, review.drawitem.position[1].z));
                linePos[2] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(review.drawitem.position[3].x, review.drawitem.position[3].y, review.drawitem.position[1].z));
                linePos[3] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[3]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                for (let ii = 0; ii < 3; ii++) {
                    view.Renderer.Util.DrawLineDash(ctx_review, linePos[ii].x, linePos[ii].y, linePos[ii + 1].x, linePos[ii + 1].y, lineDash);
                }
            }
    
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
            // length Arrow1
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            // length Arrow2
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
                
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
        
        function draw_MeasureHorizontalityDistance(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
    
            //const matMVMatrix = new VIZCore.Matrix4();
            //matMVMatrix.copy(view.Camera.cameraMatrix);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            let drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[0], review.drawitem.position[3]);
            drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
    
            //let textNormal = new VIZCore.Vector3().subVectors(drawCenter, review.text.position);
            //let textLength = textNormal.length();
            //textNormal.normalize();
    
            let textCoord = new VIZCore.Vector3().subVectors(review.text.position, drawCenter);
    
            let lineUpPos = [];
            lineUpPos[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[0], textCoord);
            lineUpPos[1] = new VIZCore.Vector3().addVectors(review.drawitem.position[3], textCoord);
    
            // line1
            {
                let linePos = [];
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // line2
            {
                let linePos = [];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[3]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            //assistLine
            {
                let linePos = [];
                let lineDash = [10, 10];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(review.drawitem.position[3].x, review.drawitem.position[1].y, review.drawitem.position[1].z));
                linePos[2] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(review.drawitem.position[3].x, review.drawitem.position[3].y, review.drawitem.position[1].z));
                linePos[3] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[3]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                for (let ii = 0; ii < 3; ii++) {
                    view.Renderer.Util.DrawLineDash(ctx_review, linePos[ii].x, linePos[ii].y, linePos[ii + 1].x, linePos[ii + 1].y, lineDash);
                }
            }
    
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
            // length Arrow1
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            // length Arrow2
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
                
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
        
        function draw_MeasureOrthoDistance(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
    
            //const matMVMatrix = new VIZCore.Matrix4();
            //matMVMatrix.copy(view.Camera.cameraMatrix);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            let drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[0], review.drawitem.position[3]);
            drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
    
            //let textNormal = new VIZCore.Vector3().subVectors(drawCenter, review.text.position);
            //let textLength = textNormal.length();
            //textNormal.normalize();
    
            let textCoord = new VIZCore.Vector3().subVectors(review.text.position, drawCenter);
    
            let lineUpPos = [];
            lineUpPos[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[0], textCoord);
            lineUpPos[1] = new VIZCore.Vector3().addVectors(review.drawitem.position[3], textCoord);
    
            // line1
            {
                let linePos = [];
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // line2
            {
                let linePos = [];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[3]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            //assistLine
            {
                let linePos = [];
                let lineDash = [10, 10];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(review.drawitem.position[3].x, review.drawitem.position[1].y, review.drawitem.position[1].z));
                linePos[2] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(review.drawitem.position[3].x, review.drawitem.position[3].y, review.drawitem.position[1].z));
                linePos[3] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[3]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                for (let ii = 0; ii < 3; ii++) {
                    view.Renderer.Util.DrawLineDash(ctx_review, linePos[ii].x, linePos[ii].y, linePos[ii + 1].x, linePos[ii + 1].y, lineDash);
                }
            }
    
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
            // length Arrow1
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            // length Arrow2
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
                
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
    
        function draw_MeasureXAxisDistance(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            //Assist Pos
            let currentDist = review.drawitem.position[1].x - review.drawitem.position[0].x;
            let vAssistPos = new VIZCore.Vector3().addVectors(review.drawitem.position[0],
                new VIZCore.Vector3(1.0, 0.0, 0.0).multiplyScalar(currentDist)
            );
    
            let drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[0], vAssistPos);
            drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
    
            let textCoord = new VIZCore.Vector3().subVectors(review.text.position, drawCenter);
    
            let lineUpPos = [];
            lineUpPos[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[0], textCoord);
            lineUpPos[1] = new VIZCore.Vector3().addVectors(vAssistPos, textCoord);
    
            // line1
            {
                let linePos = [];
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // line2
            {
                let linePos = [];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistPos);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            //assistLine
            {
                let linePos = [];
                let lineDash = [10, 10];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(vAssistPos.x, review.drawitem.position[1].y, review.drawitem.position[1].z));
                linePos[2] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(vAssistPos.x, vAssistPos.y, review.drawitem.position[1].z));
                linePos[3] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistPos);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                for (let ii = 0; ii < 3; ii++) {
                    view.Renderer.Util.DrawLineDash(ctx_review, linePos[ii].x, linePos[ii].y, linePos[ii + 1].x, linePos[ii + 1].y, lineDash);
                }
            }
    
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
            // length Arrow1
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            // length Arrow2
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
            
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
    
        function draw_MeasureYAxisDistance(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            //Assist Pos
            let currentDist = review.drawitem.position[1].y - review.drawitem.position[0].y;
            let vAssistPos = new VIZCore.Vector3().addVectors(review.drawitem.position[0],
                new VIZCore.Vector3(0.0, 1.0, 0.0).multiplyScalar(currentDist)
            );
    
            let drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[0], vAssistPos);
            drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
    
            let textCoord = new VIZCore.Vector3().subVectors(review.text.position, drawCenter);
    
            let lineUpPos = [];
            lineUpPos[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[0], textCoord);
            lineUpPos[1] = new VIZCore.Vector3().addVectors(vAssistPos, textCoord);
    
            // line1
            {
                let linePos = [];
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // line2
            {
                let linePos = [];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistPos);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            //assistLine
            {
                let linePos = [];
                let lineDash = [10, 10];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(vAssistPos.x, review.drawitem.position[1].y, review.drawitem.position[1].z));
                linePos[2] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(vAssistPos.x, vAssistPos.y, review.drawitem.position[1].z));
                linePos[3] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistPos);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                for (let ii = 0; ii < 3; ii++) {
                    view.Renderer.Util.DrawLineDash(ctx_review, linePos[ii].x, linePos[ii].y, linePos[ii + 1].x, linePos[ii + 1].y, lineDash);
                }
            }
    
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
            // length Arrow1
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            // length Arrow2
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
                
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
    
        function draw_MeasureZAxisDistance(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            //Assist Pos
            let currentDist = review.drawitem.position[1].z - review.drawitem.position[0].z;
            let vAssistPos = new VIZCore.Vector3().addVectors(review.drawitem.position[0],
                new VIZCore.Vector3(0.0, 0.0, 1.0).multiplyScalar(currentDist)
            );
    
            let drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[0], vAssistPos);
            drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
    
            let textCoord = new VIZCore.Vector3().subVectors(review.text.position, drawCenter);
    
            let lineUpPos = [];
            lineUpPos[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[0], textCoord);
            lineUpPos[1] = new VIZCore.Vector3().addVectors(vAssistPos, textCoord);
    
            // line1
            {
                let linePos = [];
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // line2
            {
                let linePos = [];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistPos);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            //assistLine
            {
                let linePos = [];
                let lineDash = [10, 10];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(vAssistPos.x, review.drawitem.position[1].y, review.drawitem.position[1].z));
                linePos[2] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(vAssistPos.x, vAssistPos.y, review.drawitem.position[1].z));
                linePos[3] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistPos);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                for (let ii = 0; ii < 3; ii++) {
                    view.Renderer.Util.DrawLineDash(ctx_review, linePos[ii].x, linePos[ii].y, linePos[ii + 1].x, linePos[ii + 1].y, lineDash);
                }
            }
    
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
            // length Arrow1
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            // length Arrow2
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
           
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
    
        function draw_MeasureXYAxisDistance(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            //Assist Pos
            let vCurrentDist = new VIZCore.Vector3().subVectors(review.drawitem.position[1], review.drawitem.position[0]);
            vCurrentDist.z = 0;
            let currentDist = vCurrentDist.length();        
            let vAssistPos = new VIZCore.Vector3().addVectors(review.drawitem.position[0],
                //new VIZCore.Vector3().copy(vCurrentDist).multiplyScalar(currentDist)
                vCurrentDist
            );
    
            let drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[0], vAssistPos);
            drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
    
            let textCoord = new VIZCore.Vector3().subVectors(review.text.position, drawCenter);
    
            let lineUpPos = [];
            lineUpPos[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[0], textCoord);
            lineUpPos[1] = new VIZCore.Vector3().addVectors(vAssistPos, textCoord);
    
            // line1
            {
                let linePos = [];
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // line2
            {
                let linePos = [];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistPos);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            //assistLine
            {
                let linePos = [];
                let lineDash = [10, 10];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(vAssistPos.x, review.drawitem.position[1].y, review.drawitem.position[1].z));
                linePos[2] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(vAssistPos.x, vAssistPos.y, review.drawitem.position[1].z));
                linePos[3] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistPos);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                for (let ii = 0; ii < 3; ii++) {
                    view.Renderer.Util.DrawLineDash(ctx_review, linePos[ii].x, linePos[ii].y, linePos[ii + 1].x, linePos[ii + 1].y, lineDash);
                }
            }
    
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
            // length Arrow1
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            // length Arrow2
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
                
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
    
        function draw_MeasureYZAxisDistance(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            //Assist Pos
            let vCurrentDist = new VIZCore.Vector3().subVectors(review.drawitem.position[1], review.drawitem.position[0]);
            vCurrentDist.x = 0;
            //let currentDist = vCurrentDist.length();
            let vAssistPos = new VIZCore.Vector3().addVectors(review.drawitem.position[0],
                //new VIZCore.Vector3().copy(vCurrentDist).multiplyScalar(currentDist)
                vCurrentDist
            );
    
            let drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[0], vAssistPos);
            drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
    
            let textCoord = new VIZCore.Vector3().subVectors(review.text.position, drawCenter);
    
            let lineUpPos = [];
            lineUpPos[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[0], textCoord);
            lineUpPos[1] = new VIZCore.Vector3().addVectors(vAssistPos, textCoord);
    
            // line1
            {
                let linePos = [];
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // line2
            {
                let linePos = [];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistPos);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.setReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            //assistLine
            {
                let linePos = [];
                let lineDash = [10, 10];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(vAssistPos.x, review.drawitem.position[1].y, review.drawitem.position[1].z));
                linePos[2] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(vAssistPos.x, vAssistPos.y, review.drawitem.position[1].z));
                linePos[3] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistPos);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                for (let ii = 0; ii < 3; ii++) {
                    view.Renderer.Util.DrawLineDash(ctx_review, linePos[ii].x, linePos[ii].y, linePos[ii + 1].x, linePos[ii + 1].y, lineDash);
                }
            }
    
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
            // length Arrow1
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            // length Arrow2
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
            
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
    
        function draw_MeasureZXAxisDistance(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            //Assist Pos
            let vCurrentDist = new VIZCore.Vector3().subVectors(review.drawitem.position[1], review.drawitem.position[0]);
            vCurrentDist.y = 0;
            let currentDist = vCurrentDist.length();
            let vAssistPos = new VIZCore.Vector3().addVectors(review.drawitem.position[0],
                //new VIZCore.Vector3().copy(vCurrentDist).multiplyScalar(currentDist)
                vCurrentDist
            );
    
            let drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[0], vAssistPos);
            drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
    
            let textCoord = new VIZCore.Vector3().subVectors(review.text.position, drawCenter);
    
            let lineUpPos = [];
            lineUpPos[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[0], textCoord);
            lineUpPos[1] = new VIZCore.Vector3().addVectors(vAssistPos, textCoord);
    
            // line1
            {
                let linePos = [];
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // line2
            {
                let linePos = [];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistPos);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            //assistLine
            {
                let linePos = [];
                let lineDash = [10, 10];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(vAssistPos.x, review.drawitem.position[1].y, review.drawitem.position[1].z));
                linePos[2] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(vAssistPos.x, vAssistPos.y, review.drawitem.position[1].z));
                linePos[3] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistPos);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                for (let ii = 0; ii < 3; ii++) {
                    view.Renderer.Util.DrawLineDash(ctx_review, linePos[ii].x, linePos[ii].y, linePos[ii + 1].x, linePos[ii + 1].y, lineDash);
                }
            }
    
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
            // length Arrow1
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            // length Arrow2
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
                
                //선택 범위 등록
                review.rect = [];
                review.rect[0] =new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
    
        function draw_MeasureCustomAxisDistance(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            //Assist Pos
            let vAssistPos;
    
            //가까운 보조 지시선 위치찾기
            {
                let currentDist = review.drawitem.position[2].dot(new VIZCore.Vector3().subVectors(review.drawitem.position[0], review.drawitem.position[1]));
               
    
                if(currentDist < 0) {
                    vAssistPos = new VIZCore.Vector3().addVectors(review.drawitem.position[0],
                        new VIZCore.Vector3().copy(review.drawitem.position[2]).multiplyScalar(Math.abs(currentDist))
                    );
                }
                else {
                    vAssistPos = new VIZCore.Vector3().addVectors(review.drawitem.position[0],
                        new VIZCore.Vector3().copy(review.drawitem.position[2]).multiplyScalar(Math.abs(currentDist) * -1)
                    );
                }
            }
    
            let drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[0], vAssistPos);
            drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
    
            let textCoord = new VIZCore.Vector3().subVectors(review.text.position, drawCenter);
    
            let lineUpPos = [];
            lineUpPos[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[0], textCoord);
            lineUpPos[1] = new VIZCore.Vector3().addVectors(vAssistPos, textCoord);
    
            // line1
            {
                let linePos = [];
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // line2
            {
                let linePos = [];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistPos);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            //assistLine
            {
                let linePos = [];
                let lineDash = [10, 10];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(vAssistPos.x, review.drawitem.position[1].y, review.drawitem.position[1].z));
                linePos[2] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, new VIZCore.Vector3(vAssistPos.x, vAssistPos.y, review.drawitem.position[1].z));
                linePos[3] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistPos);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                for (let ii = 0; ii < 3; ii++) {
                    view.Renderer.Util.DrawLineDash(ctx_review, linePos[ii].x, linePos[ii].y, linePos[ii + 1].x, linePos[ii + 1].y, lineDash);
                }
            }
    
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
            // length Arrow1
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            // length Arrow2
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
            
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
            
    
            {
                // font 설정
                 view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
        
        function draw_MeasureLinkArea(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            //면을 이루지 못함
            if (review.drawitem.position.length < 3)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            let vPosList = [];
    
            let vCenter;
            let vMin, vMax;
    
            for (let i = 0; i < review.drawitem.position.length; i++) {
                vPosList[i] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[i]);
    
                //Min Max Center 구하기
                if (i === 0) {
                    vMin = new VIZCore.Vector3().copy(review.drawitem.position[i]);
                    vMax = new VIZCore.Vector3().copy(review.drawitem.position[i]);
                }
                else {
                    vMin.min(review.drawitem.position[i]);
                    vMax.max(review.drawitem.position[i]);
                }
            }
    
            vCenter = new VIZCore.Vector3((vMin.x + vMax.x) * 0.5, (vMin.y + vMax.y) * 0.5, (vMin.z + vMax.z) * 0.5);
            
            //내부
            view.Renderer.Util.SetReviewTriangleOption(ctx_review, review);
            view.Renderer.Util.DrawTrianglesFan(ctx_review, vPosList);
        
            //라인 그리기
            {
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
    
                view.Renderer.Util.DrawLines(ctx_review, vPosList);
                //마지막
                view.Renderer.Util.DrawLine(ctx_review, vPosList[0].x, vPosList[0].y, vPosList[vPosList.length - 1].x, vPosList[vPosList.length - 1].y);
            }
    
            //점 그리기
            {
                view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                for (let i = 0; i < vPosList.length; i++) {
                    view.Renderer.Util.DrawPoint(ctx_review, vPosList[i].x, vPosList[i].y, review.style.point.size);
                }
            }
    
    
            //텍스트
        
            // line1 (center to text)
            {
                let linePos = [];
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vCenter);
                linePos[1] = pos;
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
                
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
    
        function draw_MeasureLinkDistance(ctx_review, review) {
    
            if (review.text.value.length === 0)
                return;
    
            //선을 이루지 못함
            if (review.drawitem.position.length < 2)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            let vPosList = [];
    
            //그리기 좌표 계산
            for (let i = 0; i < review.drawitem.position.length; i++) {
                vPosList[i] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[i]);
    
            }
    
            //라인 그리기
            {
                //연속 거리 표시
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                for (let i = 0; i < vPosList.length - 1; i++) {
                    view.Renderer.Util.DrawLine(ctx_review, vPosList[i].x, vPosList[i].y, vPosList[i + 1].x, vPosList[i + 1].y);
                }
            }
    
            //점 그리기
            {
                view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                for (let i = 0; i < vPosList.length; i++) {
                    view.Renderer.Util.DrawPoint(ctx_review, vPosList[i].x, vPosList[i].y, review.style.point.size);
                }
            }
    
            // line1 (center to text)
            if (vPosList.length > 1) {
                let linePos = [];
                linePos[0] = vPosList[vPosList.length - 1]
                linePos[1] = pos;
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
            }
    
            
            //중간지점 텍스트
            {           
                let linkPosition = [];
                for (let i = 0; i < vPosList.length - 1; i++) {
    
                    let cpos = vPosList[i + 1];
    
                    //각 거리를 표시
                    // let linkPosition = [];
                    // linkPosition[0] = review.drawitem.position[i];
                    // linkPosition[1] = review.drawitem.position[i + 1];
    
                    // let linkText = [];
                    // view.Measure.UpdateReviewTextByType(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE, linkText, linkPosition);
                    
                    //각 거리의 합으로 표시
                    linkPosition[i] = review.drawitem.position[i];
                    linkPosition[i + 1] = review.drawitem.position[i + 1];
    
                    let linkText = [];
                    view.Measure.UpdateReviewTextByType(review.itemType, linkText, linkPosition);
                    
                    const linkMetrics = view.Renderer.Util.GetTextMetricsByText(ctx_review, linkText, review.style.font.size);
    
                    let cw = linkMetrics.width + review.style.border.offset * 2;
                    let ch = linkMetrics.height * linkText.length + review.style.border.offset * 2;
            
                    //text offset
                    //cpos.x -= cw * 0.5;
                    cpos.x += 10;
                    //cpos.y -= ch * 0.5;
            
                    //bg
                    {
                        let x = cpos.x - review.style.border.offset;
                        let y = cpos.y - review.style.border.offset;
            
                        // background 설정
                        view.Renderer.Util.SetReviewBgOption(ctx_review, review);
            
                        // 박스 그리기
                        if (review.style.border.type === 0)
                            view.Renderer.Util.DrawRect(ctx_review, x, y, cw, ch, review.style.background.enable, review.style.border.enable);
                        else if (review.style.border.type === 1)
                            view.Renderer.Util.DrawRoundRect(ctx_review, x, y, cw, ch, review.style.border.round, review.style.background.enable, review.style.border.enable);
                    }
    
                    // text
                    // font 설정
                    view.Renderer.Util.SetReviewFontOption(ctx_review, review);
                    for (let j = 0; j < linkText.length; j++) {
                        ctx_review.fillText(linkText[j], cpos.x, cpos.y +
                             (linkMetrics.ascent * j + linkMetrics.ascent + review.style.border.offset * j));
                    }
    
                }
            }
    
            // 결과 텍스트
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
                
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
    
    
        }
        
        function draw_MeasureLinkAxisDistance(ctx_review, review) {
    
            if (review.text.value.length === 0)
                return;
    
            //선을 이루지 못함
            if (review.drawitem.position.length < 2)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            let vPosList = [];  //선택 위치
            
            let vAssistantPosWorldList = [];  //축 보정 위치 (World)
            let vAssistantPosList = [];  //축 보정 위치 (Srceen)
    
            //그리기 좌표 계산
            for (let i = 0; i < review.drawitem.position.length; i++) {
                vAssistantPosWorldList[i] = new VIZCore.Vector3().copy(review.drawitem.position[i]);
    
                if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE) {
                    vAssistantPosWorldList[i].y = vAssistantPosWorldList[0].y;
                    vAssistantPosWorldList[i].z = vAssistantPosWorldList[0].z;
                }
                else if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE) {
                    vAssistantPosWorldList[i].x = vAssistantPosWorldList[0].x;
                    vAssistantPosWorldList[i].z = vAssistantPosWorldList[0].z;
                }
                else if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE) {
                    vAssistantPosWorldList[i].x = vAssistantPosWorldList[0].x;
                    vAssistantPosWorldList[i].y = vAssistantPosWorldList[0].y;
                }
    
                vPosList[i] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[i]);
                vAssistantPosList[i] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, vAssistantPosWorldList[i]);
    
            }
    
            //축 좌표 위치 보정
            // if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE) {
            //     for (let i = 0; i < review.drawitem.position.length; i++) {
            //         vAssistantPosList[i] = new VIZCore.Vector3().copy(vPosList[i]);
            //         vAssistantPosList[i].x = vAssistantPosList[0].x;
            //     }
            // }
            // else if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE) {
            //     for (let i = 0; i < review.drawitem.position.length; i++) {
            //         vAssistantPosList[i] = new VIZCore.Vector3().copy(vPosList[i]);
            //         vAssistantPosList[i].y = vAssistantPosList[0].y;
            //     }
            // }
            // else if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE) {
            //     for (let i = 0; i < review.drawitem.position.length; i++) {
            //         vAssistantPosList[i] = new VIZCore.Vector3().copy(vPosList[i]);
            //         vAssistantPosList[i].z = vAssistantPosList[0].z;
            //     }
            // }
            
            //assistLine
            {
                let lineDash = [10, 10];
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                for (let ii = 0; ii < vPosList.length; ii++) {
                    view.Renderer.Util.DrawLineDash(ctx_review, vPosList[ii].x, vPosList[ii].y, vAssistantPosList[ii].x, vAssistantPosList[ii].y, lineDash);
                }
            }
    
            
            //라인 그리기
            {
                //연속 거리 표시
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                for (let i = 0; i < vPosList.length - 1; i++) {
                    view.Renderer.Util.DrawLine(ctx_review, vAssistantPosList[i].x, vAssistantPosList[i].y, vAssistantPosList[i + 1].x, vAssistantPosList[i + 1].y);
                }
            }
    
            //점 그리기
            {
                view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                for (let i = 0; i < vPosList.length; i++) {
                    view.Renderer.Util.DrawPoint(ctx_review, vAssistantPosList[i].x, vAssistantPosList[i].y, review.style.point.size);
                }
            }
    
            // line1 (center to text)
            if (vAssistantPosList.length > 1) {
                let linePos = [];
                linePos[0] = vAssistantPosList[vAssistantPosList.length - 1]
                linePos[1] = pos;
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
            }
    
            
            //중간지점 텍스트
            {
                let linkPosition = [];
                for (let i = 0; i < vAssistantPosList.length - 1; i++) {
    
                    let cpos = vAssistantPosList[i + 1];
    
                    //각 거리를 표시
                    // let linkPosition = [];
                    // linkPosition[0] = review.drawitem.position[i];
                    // linkPosition[1] = review.drawitem.position[i + 1];
    
                    //let linkText = [];
                    // if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE) {
                    //     view.Measure.UpdateReviewTextByType(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE, linkText, linkPosition);
                    // }
                    //     else if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE) {
                    //     view.Measure.UpdateReviewTextByType(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE, linkText, linkPosition);
                    // }
                    //     else if(review.itemType === VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE) {
                    //     view.Measure.UpdateReviewTextByType(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE, linkText, linkPosition);
                    // }
    
                    
                    //각 거리의 합으로 표시
                    linkPosition[i] = review.drawitem.position[i];
                    linkPosition[i + 1] = review.drawitem.position[i + 1];
    
                    let linkText = [];
                    view.Measure.UpdateReviewTextByType(review.itemType, linkText, linkPosition);
                    
                    const linkMetrics = view.Renderer.Util.GetTextMetricsByText(ctx_review, linkText, review.style.font.size);
    
                    let cw = linkMetrics.width + review.style.border.offset * 2;
                    let ch = linkMetrics.height * linkText.length + review.style.border.offset * 2;
            
                    //text offset
                    //cpos.x -= cw * 0.5;
                    cpos.x += 10;
                    //cpos.y -= ch * 0.5;
            
                    //bg
                    {
                        let x = cpos.x - review.style.border.offset;
                        let y = cpos.y - review.style.border.offset;
            
                        // background 설정
                        view.Renderer.Util.SetReviewBgOption(ctx_review, review);
            
                        // 박스 그리기
                        if (review.style.border.type === 0)
                            view.Renderer.Util.DrawRect(ctx_review, x, y, cw, ch, review.style.background.enable, review.style.border.enable);
                        else if (review.style.border.type === 1)
                            view.Renderer.Util.DrawRoundRect(ctx_review, x, y, cw, ch, review.style.border.round, review.style.background.enable, review.style.border.enable);
                    }
    
                    // text
                    // font 설정
                    view.Renderer.Util.SetReviewFontOption(ctx_review, review);
                    for (let j = 0; j < linkText.length; j++) {
                        ctx_review.fillText(linkText[j], cpos.x, cpos.y +
                             (linkMetrics.ascent * j + linkMetrics.ascent + review.style.border.offset * j));
                    }
    
                }
            }
    
            // 결과 텍스트
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
                
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
    
    
        }
    
        function draw_MeasureCylinderPlaneDistance(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
    
            let drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[0], review.drawitem.position[1]);
            drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
    
            //let textNormal = new VIZCore.Vector3().subVectors(drawCenter, review.text.position);
            //let textLength = textNormal.length();
            //textNormal.normalize();
    
            let textCoord = new VIZCore.Vector3().subVectors(review.text.position, drawCenter);
    
            let lineUpPos = [];
            lineUpPos[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[0], textCoord);
            lineUpPos[1] = new VIZCore.Vector3().addVectors(review.drawitem.position[1], textCoord);
    
            // line1
            {
                let linePos = [];
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            // line2
            {
                let linePos = [];
    
                linePos[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[1]);
                linePos[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                view.Renderer.Util.DrawLine(ctx_review, linePos[0].x, linePos[0].y, linePos[1].x, linePos[1].y);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos[0].x, linePos[0].y, review.style.point.size);
                }
            }
    
            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
    
             // length Arrow1
             {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[0]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            // length Arrow2
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, lineUpPos[1]);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x, linePos.y, pos.x, pos.y, review.style.arrow.size);
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
                
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h); 
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
    
        function draw_MeasureCylinderCylinderCross(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            let textPosition = new VIZCore.Vector3().copy(review.text.position);
            let drawPosition = [];
            drawPosition[0] = new VIZCore.Vector3().copy(review.drawitem.position[0]);
            let textOffset = new VIZCore.Vector3();
            let drawOffset = new VIZCore.Vector3();
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
            
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, textPosition);
    
             //assistLine
            {
                let lineDash = [10, 10]; 
                let vAssistantPosList = [];  //축 보정 위치 (Srceen)
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawPosition[0]);
                vAssistantPosList[0] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.custom[0].center);
                vAssistantPosList[1] = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.custom[1].center);
    
    
                view.Renderer.Util.SetReviewLineOption(ctx_review, review);
                //circle
                {
                    view.Renderer.Util.DrawCircle(ctx_review, review.drawitem.custom[0].center, review.drawitem.custom[0].normal, review.drawitem.custom[0].radius);
                    view.Renderer.Util.DrawCircle(ctx_review, review.drawitem.custom[1].center, review.drawitem.custom[1].normal, review.drawitem.custom[1].radius);
                }
                           
                view.Renderer.Util.DrawLineDash(ctx_review, linePos.x, linePos.y, vAssistantPosList[0].x, vAssistantPosList[0].y, lineDash);
                view.Renderer.Util.DrawLineDash(ctx_review, linePos.x, linePos.y, vAssistantPosList[1].x, vAssistantPosList[1].y, lineDash);
            }
    
            // arrow, point
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawPosition[0]);
    
                view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x + drawOffset.x, linePos.y + drawOffset.y,
                    pos.x + drawOffset.x, pos.y + drawOffset.y, review.style.arrow.size);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos.x + drawOffset.x, linePos.y + drawOffset.y, review.style.point.size);
                }
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset + textOffset.x;
                let y = pos.y - review.style.border.offset + textOffset.y;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
            
                //선택 범위 등록
                review.rect = [];
                review.rect[0] =new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x + textOffset.x, pos.y + textOffset.y +
                        (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
        
        function draw_MeasureNormalPlaneDistance(ctx_review, review) {
            if (review.text.value.length === 0)
                return;
    
            let textPosition = new VIZCore.Vector3().copy(review.text.position);
            let drawPosition = [];
            drawPosition[0] = new VIZCore.Vector3().copy(review.drawitem.position[0]);
            let textOffset = new VIZCore.Vector3();
            let drawOffset = new VIZCore.Vector3();
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
            
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, textPosition);
    
            // arrow, point
            {
                let linePos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawPosition[0]);
    
                view.Renderer.Util.SetReviewArrowOption(ctx_review, review);
                view.Renderer.Util.DrawArrow(ctx_review, linePos.x + drawOffset.x, linePos.y + drawOffset.y,
                    pos.x + drawOffset.x, pos.y + drawOffset.y, review.style.arrow.size);
    
                if (review.style.point.enable) {
                    view.Renderer.Util.SetReviewPointOption(ctx_review, review);
                    view.Renderer.Util.DrawPoint(ctx_review, linePos.x + drawOffset.x, linePos.y + drawOffset.y, review.style.point.size);
                }
            }
    
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;
    
            //bg
            {
                let x = pos.x - review.style.border.offset + textOffset.x;
                let y = pos.y - review.style.border.offset + textOffset.y;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
            
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h);
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x + textOffset.x, pos.y + textOffset.y +
                        (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }    
        
        function draw_MeasureBoundBox(ctx_review, review) {
            //if (review.text.value.length === 0)
            //    return;
            //boundbox 정보가 없는경우 그리기 패스
            if(!review.drawitem.custom) return;
    
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            //let textPosition = new VIZCore.Vector3().copy(review.text.position);
            //let drawPosition = [];z
            //drawPosition[0] = new VIZCore.Vector3().copy(review.drawitem.position[0]);
    
            //0, 1 = x축
            //1, 2 = y축 
            //2, 3 = z축
            let axisLinePos = [];
            axisLinePos[0] = new VIZCore.Vector3().copy(review.drawitem.custom.min);
            axisLinePos[1] = new VIZCore.Vector3(review.drawitem.custom.max.x, review.drawitem.custom.min.y, review.drawitem.custom.min.z);
            axisLinePos[2] = new VIZCore.Vector3(review.drawitem.custom.max.x, review.drawitem.custom.max.y, review.drawitem.custom.min.z);
            axisLinePos[3] = new VIZCore.Vector3(review.drawitem.custom.max.x, review.drawitem.custom.max.y, review.drawitem.custom.max.z);
                
            // boundbox는 xyz 각각 표시
            let textBoxItems = [];
    
            {
                //xyz 축 거리 계산
                for(let ii = 0 ; ii < 3 ; ii++) {
                    let txtItem = drawTextBoxItem();
    
                    let drawAxisCenter = new VIZCore.Vector3().addVectors(axisLinePos[ii], axisLinePos[ii + 1]);
                    drawAxisCenter.x *= 0.5; drawAxisCenter.y *= 0.5; drawAxisCenter.z *= 0.5;
                    let drawAxisTextPos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawAxisCenter);
                    
                    let axisType;
                    if (ii === 0)
                        axisType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE;
                    else if (ii === 1)
                        axisType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE;
                    else
                        axisType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE;
    
                    let axisData = [review.drawitem.custom.min, review.drawitem.custom.max];
                    let customAxisText = [];
                    view.Measure.UpdateReviewTextByType(axisType, customAxisText, axisData);
    
                    // box metrics
                    const axisMetrics = view.Renderer.Util.GetTextMetricsByText(ctx_review, customAxisText, review.style.font.size);
                    let w = axisMetrics.width + review.style.border.offset * 2;
                    let h = axisMetrics.height * customAxisText.length + review.style.border.offset * 2;
    
                    //text center offset
                    drawAxisTextPos.x -= w * 0.5;
                    drawAxisTextPos.y -= h * 0.5;
    
                    //bg
                    {
                        let x = drawAxisTextPos.x - review.style.border.offset;
                        let y = drawAxisTextPos.y - review.style.border.offset;
    
                        txtItem.rect.set(x, y, x + w, y + h);
                    }
    
                    {
                        // text
                        for (let i = 0; i < customAxisText.length; i++) {
                            txtItem.position[i] = new VIZCore.Vector2(drawAxisTextPos.x, drawAxisTextPos.y + (axisMetrics.ascent * i + axisMetrics.ascent + review.style.border.offset * i));
                            txtItem.text[i] = customAxisText[i];
                        }
                    }
    
                    textBoxItems[ii] = txtItem;
                }
            }
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            for (let i = 0; i < textBoxItems.length; i++) {
                // background 설정
                {
                    view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                    // 박스 그리기
                    if (review.style.border.type === 0)
                        view.Renderer.Util.DrawRect(ctx_review, textBoxItems[i].rect.left, textBoxItems[i].rect.top,
                            textBoxItems[i].rect.getWidth(), textBoxItems[i].rect.getHeight(),
                            review.style.background.enable, review.style.border.enable);
                    else if (review.style.border.type === 1)
                        view.Renderer.Util.DrawRoundRect(ctx_review, textBoxItems[i].rect.left, textBoxItems[i].rect.top,
                            textBoxItems[i].rect.getWidth(), textBoxItems[i].rect.getHeight(),
                            review.style.background.enable, review.style.border.enable);
                }
    
                // font 설정
                {
                    view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                    // text
                    for (let j = 0; j < textBoxItems[i].text.length; j++) {
                        ctx_review.fillText(textBoxItems[i].text[j], textBoxItems[i].position[j].x, textBoxItems[i].position[j].y);
                    }
                }
            }
    
            //선택 범위 등록
            review.rect = [];
            for (let i = 0; i < textBoxItems.length; i++) {
                review.rect[i] = textBoxItems[i].rect;
            }
        }
    
        
        function draw_MeasureBoundBoxByPlane(ctx_review, review) {
            //if (review.text.value.length === 0)
            //    return;
            //boundbox 정보가 없는경우 그리기 패스
            if(review.drawitem.position.length === 0) return;

            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            //let textPosition = new VIZCore.Vector3().copy(review.text.position);
            //let drawPosition = [];z
            //drawPosition[0] = new VIZCore.Vector3().copy(review.drawitem.position[0]);
    
            //0, 1 = x축
            //1, 2 = y축 
            //2, 3 = z축

            let vXAxis = new VIZCore.Vector3();
            let vYAxis = new VIZCore.Vector3();
            let vZAxis = new VIZCore.Vector3();
            let vOffset = new VIZCore.Vector3();
            let vBase = new VIZCore.Vector3();

            vXAxis.copy(review.drawitem.position[0]);
            vYAxis.copy(review.drawitem.position[1]);
            vZAxis.copy(review.drawitem.position[2]);
            
            vBase.copy(review.drawitem.position[3]);
            vOffset.copy(review.drawitem.position[4]);
                
            // boundbox는 xyz 각각 표시
            let textBoxItems = [];
    
            {
                //xyz 거리 계산
                for(let ii = 0 ; ii < 3 ; ii++)
                {
                    let txtItem = drawTextBoxItem();    
                   
                    let drawAxisTextPos = new VIZCore.Vector3().copy(vBase);

                    let customAxisText = [];
                    if (ii === 0)
                    {
                        //let v1 = new VIZCore.Vector3().copy(vBase);
                        //let v2 = new VIZCore.Vector3().addVectors(vBase, new VIZCore.Vector3().copy(vXAxis).multiplyScalar(vOffset.x * 0.5));

                        //let drawAxisCenter = new VIZCore.Vector3().addVectors(v1, v2);
                        //drawAxisCenter = drawAxisCenter.multiplyScalar(0.5);
                        let drawAxisCenter = new VIZCore.Vector3().addVectors(vBase, new VIZCore.Vector3().copy(vXAxis).multiplyScalar(vOffset.x * 0.5));

                        drawAxisTextPos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawAxisCenter);

                        let axisData = [new VIZCore.Vector3(), vOffset];
                        view.Measure.UpdateReviewTextByType(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE, 
                            customAxisText, axisData);
                    }
                    else if (ii === 1)
                    {
                        //let v1 = new VIZCore.Vector3().copy(vBase);
                        //let v2 = new VIZCore.Vector3().addVectors(vBase, new VIZCore.Vector3().copy(vYAxis).multiplyScalar(vOffset.y));
                        
                        //let drawAxisCenter = new VIZCore.Vector3().addVectors(v1, v2);
                        //drawAxisCenter = drawAxisCenter.multiplyScalar(0.5);
                        let drawAxisCenter = new VIZCore.Vector3().addVectors(vBase, new VIZCore.Vector3().copy(vYAxis).multiplyScalar(vOffset.y * 0.5));
                        drawAxisTextPos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawAxisCenter);

                        let axisData = [new VIZCore.Vector3(), vOffset];
                        view.Measure.UpdateReviewTextByType(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE, 
                            customAxisText, axisData);
                    }
                    else
                    {
                        //let v1 = new VIZCore.Vector3().copy(vBase);
                        //let v2 = new VIZCore.Vector3().addVectors(vBase, new VIZCore.Vector3().copy(vZAxis).multiplyScalar(vOffset.z));                        
                        //let drawAxisCenter = new VIZCore.Vector3().addVectors(v1, v2);
                        //drawAxisCenter = drawAxisCenter.multiplyScalar(0.5);
                        let drawAxisCenter = new VIZCore.Vector3().addVectors(vBase, new VIZCore.Vector3().copy(vZAxis).multiplyScalar(vOffset.z * 0.5));
                        drawAxisTextPos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawAxisCenter);

                        let axisData = [new VIZCore.Vector3(), vOffset];
                        view.Measure.UpdateReviewTextByType(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE, 
                            customAxisText, axisData);
                    }
    
                    // box metrics
                    const axisMetrics = view.Renderer.Util.GetTextMetricsByText(ctx_review, customAxisText, review.style.font.size);
                    let w = axisMetrics.width + review.style.border.offset * 2;
                    let h = axisMetrics.height * customAxisText.length + review.style.border.offset * 2;
    
                    //text center offset
                    drawAxisTextPos.x -= w * 0.5;
                    drawAxisTextPos.y -= h * 0.5;
    
                    //bg
                    {
                        let x = drawAxisTextPos.x - review.style.border.offset;
                        let y = drawAxisTextPos.y - review.style.border.offset;
    
                        txtItem.rect.set(x, y, x + w, y + h);
                    }
    
                    {
                        // text
                        for (let i = 0; i < customAxisText.length; i++) {
                            txtItem.position[i] = new VIZCore.Vector2(drawAxisTextPos.x, drawAxisTextPos.y + (axisMetrics.ascent * i + axisMetrics.ascent + review.style.border.offset * i));
                            txtItem.text[i] = customAxisText[i];
                        }
                    }
    
                    textBoxItems[ii] = txtItem;
                }
            }
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            for (let i = 0; i < textBoxItems.length; i++) {
                // background 설정
                {
                    view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                    // 박스 그리기
                    if (review.style.border.type === 0)
                        view.Renderer.Util.DrawRect(ctx_review, textBoxItems[i].rect.left, textBoxItems[i].rect.top,
                            textBoxItems[i].rect.getWidth(), textBoxItems[i].rect.getHeight(),
                            review.style.background.enable, review.style.border.enable);
                    else if (review.style.border.type === 1)
                        view.Renderer.Util.DrawRoundRect(ctx_review, textBoxItems[i].rect.left, textBoxItems[i].rect.top,
                            textBoxItems[i].rect.getWidth(), textBoxItems[i].rect.getHeight(),
                            review.style.background.enable, review.style.border.enable);
                }
    
                // font 설정
                {
                    view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                    // text
                    for (let j = 0; j < textBoxItems[i].text.length; j++) {
                        ctx_review.fillText(textBoxItems[i].text[j], textBoxItems[i].position[j].x, textBoxItems[i].position[j].y);
                    }
                }
            }
    
            //선택 범위 등록
            review.rect = [];
            for (let i = 0; i < textBoxItems.length; i++) {
                review.rect[i] = textBoxItems[i].rect;
            }
        }
    

        function draw3D_MeasureBoundBox(review) {
            const gl = view.gl;
            //boundbox 정보가 없는경우 그리기 패스
            if(!review.drawitem.custom) return;
    
             //BoundBox 그리기
             view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.BASIC2D);
                                
             view.gl.disable(gl.BLEND);
             view.gl.enable(gl.DEPTH_TEST);
     
             const matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.matMV);
             const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
     
             view.Shader.SetGLLight();
             view.Shader.SetClipping(undefined); //단면처리 제외
    
             view.Shader.SetMatrix(matMVP, matMVMatrix);
    
             let currentColor = new VIZCore.Color().copy(review.style.line.color);
             let currentGLColor = currentColor.glColor();
             view.Shader.SetGLColor(currentGLColor.r, currentGLColor.g, currentGLColor.b, currentGLColor.a);
    
             view.Renderer.Util.DrawBoundBox3D(review.drawitem.custom, review.style.line.thickness);
    
             view.Shader.EndShader();
        }

        
        function draw3D_MeasureBoundBoxByPlane(review) {
            const gl = view.gl;
            if(review.drawitem.position.length === 0) return;
                        
            let vXAxis = new VIZCore.Vector3();
            let vYAxis = new VIZCore.Vector3();
            let vZAxis = new VIZCore.Vector3();
            let vOffset = new VIZCore.Vector3();
            let vBase = new VIZCore.Vector3();

            vXAxis.copy(review.drawitem.position[0]);
            vYAxis.copy(review.drawitem.position[1]);
            vZAxis.copy(review.drawitem.position[2]);
            
            vBase.copy(review.drawitem.position[3]);
            vOffset.copy(review.drawitem.position[4]);
            
            //BoundBox 그리기
            view.Shader.BeginShader(VIZCore.Enum.SHADER_TYPES.BASIC2D);
                            
            view.gl.disable(gl.BLEND);
            view.gl.enable(gl.DEPTH_TEST);
    
            const matMVMatrix = new VIZCore.Matrix4().copy(view.Camera.matMV);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            view.Shader.SetGLLight();
            view.Shader.SetClipping(undefined); //단면처리 제외

            view.Shader.SetMatrix(matMVP, matMVMatrix);

            let currentColor = new VIZCore.Color().copy(review.style.line.color);
            let currentGLColor = currentColor.glColor();
            view.Shader.SetGLColor(currentGLColor.r, currentGLColor.g, currentGLColor.b, currentGLColor.a);
            
            let drawLinesPos = [];
            //CRMVertex3<float> vBox[8] = { vBase, vBase + vXAxis*vOffset.x, vBase + vXAxis*vOffset.x + vYAxis*vOffset.y, vBase + vYAxis*vOffset.y, 
			//	vBase + vZAxis*vOffset.z, vBase + vZAxis*vOffset.z + vXAxis*vOffset.x, vBase + vZAxis*vOffset.z + vXAxis*vOffset.x + vYAxis*vOffset.y, vBase + vZAxis*vOffset.z + vYAxis*vOffset.y };
            //int lineIndex[12][2] = { {0,1}, {1,2}, {2,3}, {3,0}, {4,5}, {5,6}, {6,7}, {7,4}, {0,4}, {1,5}, {2,6}, {3,7} };

            let vBox = [
                new VIZCore.Vector3().copy(vBase),
                new VIZCore.Vector3().addVectors(vBase, new VIZCore.Vector3().copy(vXAxis).multiplyScalar(vOffset.x)),
                new VIZCore.Vector3().addVectors(vBase, new VIZCore.Vector3().addVectors(
                    new VIZCore.Vector3().copy(vXAxis).multiplyScalar(vOffset.x), new VIZCore.Vector3().copy(vYAxis).multiplyScalar(vOffset.y))),
                new VIZCore.Vector3().addVectors(vBase, new VIZCore.Vector3().copy(vYAxis).multiplyScalar(vOffset.y)),
                new VIZCore.Vector3().addVectors(vBase, new VIZCore.Vector3().copy(vZAxis).multiplyScalar(vOffset.z)),
                new VIZCore.Vector3().addVectors(vBase, new VIZCore.Vector3().addVectors(
                    new VIZCore.Vector3().copy(vZAxis).multiplyScalar(vOffset.z), new VIZCore.Vector3().copy(vXAxis).multiplyScalar(vOffset.x))),
                new VIZCore.Vector3().addVectors(vBase, new VIZCore.Vector3().addVectors(new VIZCore.Vector3().addVectors(
                        new VIZCore.Vector3().copy(vZAxis).multiplyScalar(vOffset.z), new VIZCore.Vector3().copy(vXAxis).multiplyScalar(vOffset.x)), new VIZCore.Vector3().copy(vYAxis).multiplyScalar(vOffset.y))),
                new VIZCore.Vector3().addVectors(vBase, new VIZCore.Vector3().addVectors(
                    new VIZCore.Vector3().copy(vZAxis).multiplyScalar(vOffset.z), new VIZCore.Vector3().copy(vYAxis).multiplyScalar(vOffset.y))),
            ];
            //[12][2]
            let lineIndex = [ [0,1], [1,2], [2,3], [3,0], [4,5], [5,6], [6,7], [7,4], [0,4], [1,5], [2,6], [3,7] ];
            for(let i = 0 ; i < 12; i++) {
                let vPos1 = new VIZCore.Vector3().copy(vBox[lineIndex[i][0]]);
                let vPos2 = new VIZCore.Vector3().copy(vBox[lineIndex[i][1]]);

                drawLinesPos.push(vPos1);
                drawLinesPos.push(vPos2);
            }

            view.Renderer.Util.DrawLines3D(drawLinesPos, review.style.line.thickness);

    
            view.Shader.EndShader();
        }


        /**
         * 
         * @param {*} ctx_review 
         * @param {*} review 
         * @param {boolean} bRadius true = 반지름 , false = 지름
         * @returns 
         */
        function draw_MeasureCircle(ctx_review, review, bRadius) {
            //if (review.text.value.length === 0)
            //    return;

            //측정된 Cicle 표현

            //반지지름 표현

            //텍스트 출력
    
            if (review.text.value.length === 0)
                return;
    
            // font 설정
            view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
            // box metrics
            const metrics = view.Renderer.Util.GetTextMetrics(ctx_review, review);
            const matMVP = new VIZCore.Matrix4().copy(view.Camera.matMVP);
    
            let pos = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.text.position);
                    
            let circlePt = [];
            let fRadius = new VIZCore.Vector3().subVectors(review.drawitem.position[2], review.drawitem.position[0] ).length();

            let drawCenter = undefined;

            if(bRadius)
            {
                circlePt[0] = new VIZCore.Vector3().copy(review.drawitem.position[2]); //center
                circlePt[1] = new VIZCore.Vector3().copy(review.drawitem.position[0]); //circle pt 

                //center 와 circle pt 의 중심
                drawCenter = new VIZCore.Vector3().addVectors(review.drawitem.position[2], review.drawitem.position[0]);
                drawCenter.x /= 2; drawCenter.y /= 2; drawCenter.z /= 2;
            }
            else 
            {
                //let ptDir = new VIZCore.Vector3().addVectors(review.drawitem.position[2], review.drawitem.position[0]); //center
                //ptDir.normalize();
                let ptDir = new VIZCore.Vector3().copy(review.drawitem.position[4]);

                circlePt[0] = new VIZCore.Vector3().addVectors(review.drawitem.position[2], new VIZCore.Vector3().copy(ptDir).multiplyScalar(fRadius)); //center
                circlePt[1] = new VIZCore.Vector3().addVectors(review.drawitem.position[2], new VIZCore.Vector3().copy(ptDir).multiplyScalar(-fRadius)); //circle pt 

                drawCenter = new VIZCore.Vector3().copy(review.drawitem.position[2]);
            }
            let drawCenterScreen = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, drawCenter);
        

            view.Renderer.Util.SetReviewArrowOption(ctx_review, review);

            // length Arrow1
            {
                let vPos1 = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, circlePt[0]);
                let vPos2 = drawCenterScreen;
                view.Renderer.Util.DrawArrow(ctx_review, vPos1.x, vPos1.y, vPos2.x, vPos2.y, review.style.arrow.size);
            }

            // length Arrow2
            {
                let vPos1 = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, circlePt[1]);
                let vPos2 = drawCenterScreen;
                view.Renderer.Util.DrawArrow(ctx_review, vPos1.x, vPos1.y, vPos2.x, vPos2.y, review.style.arrow.size);
            }
    
    
            view.Renderer.Util.SetReviewLineOption(ctx_review, review);

            //Circle 의 기준되는 원을 그린다. 
            view.Renderer.Util.DrawCircle(ctx_review, review.drawitem.position[2], //center
                 review.drawitem.position[3], //normal
                 fRadius
                ); 


            // 양 방향 Arrow의 중심에서 Text로 연결된 Line
            {
                //let vPos1 = view.Renderer.Util.GetScreenPositionByMatrix(matMVP, review.drawitem.position[0]);
                let vPos2 = drawCenterScreen;
    
                view.Renderer.Util.DrawLine(ctx_review, pos.x, pos.y, vPos2.x, vPos2.y);
            }
            
            let w = metrics.width + review.style.border.offset * 2;
            let h = metrics.height * review.text.value.length + review.style.border.offset * 2;
    
            //text center offset
            pos.x -= w * 0.5;
            pos.y -= h * 0.5;

            //bg
            {
                let x = pos.x - review.style.border.offset;
                let y = pos.y - review.style.border.offset;
    
                // background 설정
                view.Renderer.Util.SetReviewBgOption(ctx_review, review);
    
                // 박스 그리기
                if (review.style.border.type === 0)
                    view.Renderer.Util.DrawRect(ctx_review, x, y, w, h, review.style.background.enable, review.style.border.enable);
                else if (review.style.border.type === 1)
                    view.Renderer.Util.DrawRoundRect(ctx_review, x, y, w, h, review.style.border.round, review.style.background.enable, review.style.border.enable);
                
                //선택 범위 등록
                review.rect = [];
                review.rect[0] = new VIZCore.Rect(x, y, x + w, y + h); 
            }
    
            {
                // font 설정
                view.Renderer.Util.SetReviewFontOption(ctx_review, review);
    
                // text
                for (let i = 0; i < review.text.value.length; i++) {
                    ctx_review.fillText(review.text.value[i], pos.x, pos.y + (metrics.ascent * i + metrics.ascent + review.style.border.offset * i));
                }
            }
        }
    
    

        //#endregion Review Render

    }
}
export default Review;