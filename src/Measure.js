/**
 * @author ssjo@softhills.net
 */

class Measure {
    constructor(view, VIZCore) {
        // Private
        let scope = this;

        let sizeText = 12;
        let sizeArrow = 8;

        let unit = VIZCore.Enum.MEASURE_UNIT.mm;
        let positionalNum = 2;

        let colLine = new VIZCore.Color(255, 255, 255, 255);
        let colArrow = new VIZCore.Color(255, 0, 0, 255);
        let colPoint = new VIZCore.Color(255, 0, 0, 255);

        let colBack = new VIZCore.Color(255, 255, 255, 255);
        let colBorder = new VIZCore.Color(41, 143, 194, 255);
        let colText = new VIZCore.Color(0, 0, 0, 255);

        let colArea = new VIZCore.Color(255, 255, 255, 128);

        let distanceAxis = true; //거리 측정 축 가시화 보이기/숨기기


        //reviewItem, data = []
        this.UpdateReviewText = function (review, data) {
            if (review === undefined)
                return;

            /*
            switch (review.itemType) {
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_POS:
                    {
                        review.text.value.length = 0; //초기화
                        review.text.value.push("X = " + data[0].x.toFixed(positionalNum));
                        review.text.value.push("Y = " + data[0].y.toFixed(positionalNum));
                        review.text.value.push("Z = " + data[0].z.toFixed(positionalNum));
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE:
                    {
                        review.text.value.length = 0; //초기화
                        let distance = new VIZCore.Vector3().subVectors(data[0], data[1]).length();
                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();
    
                        review.text.value.push(text);
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ANGLE:
                    {
                        review.text.value.length = 0; //초기화
                        let dir1 = new VIZCore.Vector3().subVectors(data[1], data[0]).normalize();
                        let dir2 = new VIZCore.Vector3().subVectors(data[2], data[0]).normalize();
                        let theta = dir1.dot(dir2);
                        //let degree = Math.acos(theta) * (180 / Math.PI);
                        let degree = view.Util.RadToDeg(Math.acos(theta));
    
                        let text = degree.toFixed(positionalNum);
                        text = text + " °";
    
                        review.text.value.push(text);
                    }
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_OBJECTMINDISTANCE: //개체 간 최소 거리
                    {
                        review.text.value.length = 0; //초기화
                        let distance = new VIZCore.Vector3().subVectors(data[0], data[1]).length();
                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();
    
                        review.text.value.push(text);
                    }
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_NORMALDISTANCE: //Normal 거리
                    {
                        review.text.value.length = 0; //초기화
    
                        let currentPlane = new VIZCore.Plane().setFromNormalAndCoplanarPoint(
                            data[2],
                            data[0]
                        );
    
                        let targetLength = currentPlane.distanceToPoint(data[1]);
                        let targetPos = new VIZCore.Vector3().addVectors(
                            data[0],
                            new VIZCore.Vector3().copy(data[2]).multiplyScalar(targetLength)
                        );
    
                        let distance = new VIZCore.Vector3().subVectors(data[0], targetPos).length();
    
                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();
    
                        review.text.value.push(text);
                    }
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_HORIZONTALITYDISTANCE: //수평 거리
                    {
                        review.text.value.length = 0; //초기화
    
                        let targetDist = new VIZCore.Vector3().subVectors(data[1], data[0]);
                        //let fDist = fabs(vDist.Dot(vPos[2]));
                        //let distance = new VIZCore.Vector3().subVectors(data[0], targetPos).length();
                        let distance = Math.abs(targetDist.dot(data[2]));
    
                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();
    
                        review.text.value.push(text);
                    }
                    break;
    
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ORTHODISTANCE: //직교 거리
                    {
                        review.text.value.length = 0; //초기화
    
                        let currentPlane = new VIZCore.Plane().setFromNormalAndCoplanarPoint(
                            data[2], //A Normal
                            data[0]  //선택지점 A
                        );
    
                        let targetPos = currentPlane.projectPoint(data[1]);
                        //let distance = Math.abs(currentPlane.distanceToPoint(data[1]));
                        let distance = new VIZCore.Vector3().subVectors(data[0], targetPos).length();
                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();
    
                        review.text.value.push(text);
                    }
                    break;
            }
            */
            scope.UpdateReviewTextByType(review.itemType, review.text.value, data);
        };

        ///**
        // * //type , [out] StringArray, data
        // * @param {VIZCore.Enum.REVIEW_TYPES} reviewType
        // * @param {String} textValue : [output] text
        // * @param {[VIZCore.Vector3]} data
        // */
        this.UpdateReviewTextByType = function (reviewType, textValue, data) {

            switch (reviewType) {
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_POS:
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CYLINDER_CYLINDER_CROSS_POINT:
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_NORMAL_PLANE_CROSS_POINT:
                    {
                        textValue.length = 0; //초기화
                        if (view.Grid.ShowFrameNumber) {
                            let snapStringX = undefined;
                            let snapStringY = undefined;
                            let snapStringZ = undefined;

                            let x = view.Grid.GetSnapItem(VIZCore.Enum.Axis.X, data[0].x);
                            let y = view.Grid.GetSnapItem(VIZCore.Enum.Axis.Y, data[0].y);
                            let z = view.Grid.GetSnapItem(VIZCore.Enum.Axis.Z, data[0].z);


                            if (x) {
                                let szOperator = x.Offset >= 0 ? " +" : " ";
                                snapStringX = x.Label + szOperator + x.Offset.toFixed(positionalNum);
                            }
                            if (y) {
                                let szOperator = y.Offset >= 0 ? " +" : " ";
                                snapStringY = y.Label + szOperator + y.Offset.toFixed(positionalNum);
                            }
                            if (z) {
                                let szOperator = z.Offset >= 0 ? " +" : " ";
                                snapStringZ = z.Label + szOperator + z.Offset.toFixed(positionalNum);
                            }


                            if (snapStringX) textValue.push(snapStringX);
                            else textValue.push("X = " + data[0].x.toFixed(positionalNum));

                            if (snapStringY) textValue.push(snapStringY);
                            else textValue.push("Y = " + data[0].y.toFixed(positionalNum));

                            if (snapStringZ) textValue.push(snapStringZ);
                            else textValue.push("Z = " + data[0].z.toFixed(positionalNum));
                        }

                        if (textValue.length === 0) {
                            textValue.push("X = " + data[0].x.toFixed(positionalNum) + " " + view.Data.GetUnitString());
                            textValue.push("Y = " + data[0].y.toFixed(positionalNum) + " " + view.Data.GetUnitString());
                            textValue.push("Z = " + data[0].z.toFixed(positionalNum) + " " + view.Data.GetUnitString());
                        }

                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE:
                    {
                        textValue.length = 0; //초기화
                        let distance = new VIZCore.Vector3().subVectors(data[0], data[1]).length();
                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ANGLE:
                    {
                        textValue.length = 0; //초기화
                        let dir1 = new VIZCore.Vector3().subVectors(data[1], data[0]).normalize();
                        let dir2 = new VIZCore.Vector3().subVectors(data[2], data[0]).normalize();
                        let theta = dir1.dot(dir2);
                        //let degree = Math.acos(theta) * (180 / Math.PI);
                        let degree = view.Util.RadToDeg(Math.acos(theta));

                        let text = degree.toFixed(positionalNum);
                        text = text + " °";

                        textValue.push(text);
                    }
                    break;

                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_OBJECTMINDISTANCE: //개체 간 최소 거리
                    {
                        textValue.length = 0; //초기화
                        let distance = new VIZCore.Vector3().subVectors(data[0], data[1]).length();
                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;

                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_NORMALDISTANCE: //Normal 거리
                    {
                        textValue.length = 0; //초기화

                        let currentPlane = new VIZCore.Plane().setFromNormalAndCoplanarPoint(
                            data[2],
                            data[0]
                        );

                        let targetLength = currentPlane.distanceToPoint(data[1]);
                        let targetPos = new VIZCore.Vector3().addVectors(
                            data[0],
                            new VIZCore.Vector3().copy(data[2]).multiplyScalar(targetLength)
                        );

                        let distance = new VIZCore.Vector3().subVectors(data[0], targetPos).length();

                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;

                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_HORIZONTALITYDISTANCE: //수평 거리
                    {
                        textValue.length = 0; //초기화

                        let targetDist = new VIZCore.Vector3().subVectors(data[1], data[0]);
                        //let fDist = fabs(vDist.Dot(vPos[2]));
                        //let distance = new VIZCore.Vector3().subVectors(data[0], targetPos).length();
                        let distance = Math.abs(targetDist.dot(data[2]));

                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;

                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ORTHODISTANCE: //직교 거리
                    {
                        textValue.length = 0; //초기화

                        let currentPlane = new VIZCore.Plane().setFromNormalAndCoplanarPoint(
                            data[2],
                            data[0] //선택지점 A
                        );

                        let targetPos = currentPlane.projectPoint(data[1]);
                        //let distance = Math.abs(currentPlane.distanceToPoint(data[1]));
                        let distance = new VIZCore.Vector3().subVectors(data[0], targetPos).length();
                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE: // X축 거리
                    {
                        textValue.length = 0; //초기화

                        //let distance = new VIZCore.Vector3().subVectors(data[0], data[1]).length();
                        let distance = Math.abs(data[0].x - data[1].x);
                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = "X = " + text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE: // Y축 거리
                    {
                        textValue.length = 0; //초기화

                        //let distance = new VIZCore.Vector3().subVectors(data[0], data[1]).length();
                        let distance = Math.abs(data[0].y - data[1].y);
                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = "Y = " + text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE: // Z축 거리
                    {
                        textValue.length = 0; //초기화

                        //let distance = new VIZCore.Vector3().subVectors(data[0], data[1]).length();
                        let distance = Math.abs(data[0].z - data[1].z);
                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = "Z = " + text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_XY_AXIS_DISTANCE: // XY축 거리
                    {
                        textValue.length = 0; //초기화
                        let currentDist = new VIZCore.Vector3().subVectors(data[0], data[1]);
                        currentDist.z = 0;
                        let distance = currentDist.length();

                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = "XY = " + text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_YZ_AXIS_DISTANCE: // YZ축 거리
                    {
                        textValue.length = 0; //초기화
                        let currentDist = new VIZCore.Vector3().subVectors(data[0], data[1]);
                        currentDist.x = 0;
                        let distance = currentDist.length();

                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = "YZ = " + text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ZX_AXIS_DISTANCE: // ZX축 거리
                    {
                        textValue.length = 0; //초기화
                        let currentDist = new VIZCore.Vector3().subVectors(data[0], data[1]);
                        currentDist.y = 0;
                        let distance = currentDist.length();

                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = "ZX = " + text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;

                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CUSTOM_AXIS_DISTANCE:
                    {
                        textValue.length = 0; //초기화
                        let currentDist = new VIZCore.Vector3().subVectors(data[0], data[1]);
                        //float fDist = fabs( vPos[2].Dot((vPos[0] - vPos[1])) );
                        //let distance = currentDist.length();
                        let distance = Math.abs(data[2].dot(currentDist));

                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;

                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKEDAREA: //면적
                    {
                        textValue.length = 0; //초기화
                        let fArea = 0;

                        let v1, v2, v3;
                        for (let i = 0; i < data.length - 2; i++) {
                            v1 = data[0];
                            v2 = data[i + 1];
                            v3 = data[i + 2];

                            fArea += view.Util.GetPolygonArea(v1, v2, v3);
                        }

                        fArea = view.Data.GetCustomUnitValue(fArea);
                        let text = fArea.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString() + "²";
                        textValue.push(text);

                    }
                    break;

                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_SURFACEDISTANCE:
                    {
                        textValue.length = 0; //초기화
                        let distance = new VIZCore.Vector3().subVectors(data[0], data[1]).length();
                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;

                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_DISTANCE:
                    {
                        textValue.length = 0; //초기화

                        let currentDist = 0;
                        for (let i = 0; i < data.length - 1; i++) {
                            let distance = new VIZCore.Vector3().subVectors(data[i], data[i + 1]).length();
                            distance = view.Data.GetCustomUnitValue(distance);

                            currentDist += distance;
                        }

                        let text = currentDist.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();
                        textValue.push(text);
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_X_AXIS_DISTANCE:
                    {
                        textValue.length = 0; //초기화

                        let currentDist = 0;

                        for (let i = 0; i < data.length - 1; i++) {
                            let distance = Math.abs(data[i].x - data[i + 1].x);
                            currentDist += view.Data.GetCustomUnitValue(distance);
                        }

                        let text = currentDist.toFixed(positionalNum);
                        text = "X = " + text + " " + view.Data.GetUnitString();
                        textValue.push(text);
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Y_AXIS_DISTANCE:
                    {
                        textValue.length = 0; //초기화

                        let currentDist = 0;

                        for (let i = 0; i < data.length - 1; i++) {
                            let distance = Math.abs(data[i].y - data[i + 1].y);
                            currentDist += view.Data.GetCustomUnitValue(distance);
                        }

                        let text = currentDist.toFixed(positionalNum);
                        text = "Y = " + text + " " + view.Data.GetUnitString();
                        textValue.push(text);
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKED_Z_AXIS_DISTANCE:
                    {
                        textValue.length = 0; //초기화

                        let currentDist = 0;

                        for (let i = 0; i < data.length - 1; i++) {
                            let distance = Math.abs(data[i].z - data[i + 1].z);
                            currentDist += view.Data.GetCustomUnitValue(distance);
                        }

                        let text = currentDist.toFixed(positionalNum);
                        text = "Z = " + text + " " + view.Data.GetUnitString();
                        textValue.push(text);
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CYLINDER_PLANE_DISTANCE:
                    {
                        textValue.length = 0; //초기화
                        let distance = new VIZCore.Vector3().subVectors(data[0], data[1]).length();
                        distance = view.Data.GetCustomUnitValue(distance);
                        let text = distance.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;

                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CIRCLE_RADIUS:
                    {
                        textValue.length = 0; //초기화
                        let fRadius = new VIZCore.Vector3().subVectors(data[0], data[1]).length();

                        let text = fRadius.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CIRCLE_DIAMETER:
                    {
                        textValue.length = 0; //초기화
                        let fDiameter = new VIZCore.Vector3().subVectors(data[0], data[1]).length() * 2.0;

                        let text = fDiameter.toFixed(positionalNum);
                        text = text + " " + view.Data.GetUnitString();

                        textValue.push(text);
                    }
                    break;
            }
        };

        this.UpdateReviewStyle = function (review) {

            review.style.font.color.copy(colText);
            review.style.font.size = sizeText;

            review.style.border.color.copy(colBorder);

            review.style.background.color.copy(colBack);

            review.style.arrow.color.copy(colArrow);
            review.style.arrow.size = sizeArrow;

            review.style.line.color.copy(colLine);

            review.style.point.color.copy(colPoint);


            switch (review.itemType) {
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE:
                    {
                        review.drawitem.axis = distanceAxis;
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_OBJECTMINDISTANCE:
                    {
                        review.drawitem.axis = distanceAxis;
                    }
                    break;
                case VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_LINKEDAREA:
                    {
                        review.style.triangle.color.copy(colArea);
                    }
                    break;
            }
        };


        this.AddCustomPosition = function (position) {

            if (position === undefined) return;

            let item = view.Data.ReviewItem();
            item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_POS;

            // default 스타일 및 text 정의
            let textData = [];
            textData[0] = position;

            scope.UpdateReviewStyle(item);
            scope.UpdateReviewText(item, textData);

            item.text.position = new VIZCore.Vector3().copy(position);
            item.drawitem.position[0] = new VIZCore.Vector3().copy(position);

            view.Data.Reviews.push(item);

            return item;
        }

        this.AddCustomAxisDistance = function (axis, pos1, pos2) {

            if (axis === undefined || pos1 === undefined || pos2 === undefined) return;

            if (axis !== VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE &&
                axis !== VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE &&
                axis !== VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE)
                return;

            let item = view.Data.ReviewItem();
            item.itemType = axis;

            // default 스타일 및 text 정의
            item.drawitem.position[0] = new VIZCore.Vector3().copy(pos1);
            item.drawitem.position[1] = new VIZCore.Vector3().copy(pos2);
            item.text.position = new VIZCore.Vector3().copy(pos1);

            let textData = item.drawitem.position;

            scope.UpdateReviewStyle(item);
            scope.UpdateReviewText(item, textData);

            view.Data.Reviews.push(item);

            return item;
        }


        this.AddCustom3PointAngle = function (basePos, pos1, pos2) {

            if (basePos === undefined || pos1 === undefined || pos2 === undefined) return;

            let item = view.Data.ReviewItem();
            item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_ANGLE;

            // default 스타일 및 text 정의
            item.drawitem.position[0] = new VIZCore.Vector3().copy(basePos);
            item.drawitem.position[1] = new VIZCore.Vector3().copy(pos1);
            item.drawitem.position[2] = new VIZCore.Vector3().copy(pos2);

            item.text.position = new VIZCore.Vector3().copy(pos2);

            let textData = item.drawitem.position;

            scope.UpdateReviewStyle(item);
            scope.UpdateReviewText(item, textData);

            view.Data.Reviews.push(item);

            return item;
        }

        this.AddCustomMultiPointDistance = function (positions, directions, offsetDirection) {

            if (positions === undefined || positions.length % 2 !== 0) return;

            let allItem = [];

            for (let i = 0; i < positions.length/2; i++ ) {
                
                let item = view.Data.ReviewItem();

                if (directions === undefined)
                    item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_DISTANCE;
                else
                    item.itemType = VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_CUSTOM_AXIS_DISTANCE;

                item.drawitem.position[0] =  new VIZCore.Vector3().copy(positions[i * 2 + 0]);
                item.drawitem.position[1] =  new VIZCore.Vector3().copy(positions[i * 2 + 1]);
                if (directions)
                    item.drawitem.position[2] = directions[0];

                item.text.position = new VIZCore.Vector3().copy(positions[i * 2 + 1]);
                
                let textData = item.drawitem.position;

                scope.UpdateReviewStyle(item);
                scope.UpdateReviewText(item, textData);

                view.Data.Reviews.push(item);
                allItem.push(item);

            }

            return allItem;
        }

    }
}

export default Measure;