/**
 * VIZCore Measure 인터페이스
 * @copyright © 2013 - 2021 SOFTHILLS Co., Ltd. All rights reserved.
 * @author SOFTHILLS <tech@softhills.net>
 * @param {Object} main Main Instance
 * @param {Object} VIZCore ValueObject Instance
 * @class
 * @memberof Review
 */
class Measure {
    constructor(main, VIZCore) {
        let scope = this;

        this.Main = main;

        /**
         * @memberof Review.Measure
         */
        //=======================================
        // Method
        //=======================================
         /**
         * 측정 전체 삭제
         * @example
         * vizwide3d.Review.Measure.DeleteAll();
         * @todo vizwide3d.Render(); // 화면 다시그리기 호출
         */
         this.DeleteAll = function(){
            scope.Main.Data.Review.DeleteReviewByType(1);
        };
        /**
         * 측정 정보 삭제
         * @param {Object} id 개체 아이디(Number or Array)
         * @example
         * vizwide3d.Review.Measure.DeleteByID(10);
         * @example
         * let ids = [10, 11];
         * vizwide3d.Review.Measure.DeleteByID(ids);
         * @todo vizwide3d.Render(); // 화면 다시그리기 호출
         */
        this.DeleteByID = function (id) {
            //let item = scope.Main.Data.GetReview(id);            
            scope.Main.Data.DeleteReview(id);
        };

        /**
         * 각도 측정 추가
         * @example
         * vizwide3d.Review.Measure.AddAngle();
         */
        this.AddAngle = function () {
            scope.Main.Review.AddAngle();
        };

        /**
         * 거리 측정 추가
         * @example
         * vizwide3d.Review.Measure.AddDistance();
         */
        this.AddDistance = function () {
            scope.Main.Review.AddDistance();
        };

        /**
         * 면적 측정 추가
         * @example
         * vizwide3d.Review.Measure.AddLinkArea();
         */
        this.AddLinkArea = function () {
            scope.Main.Review.AddLinkArea();
        };


        /**
         * 면 거리 측정 (평행한 경우 평행 면 거리 측정)
         * @example
         * vizwide3d.Review.Measure.AddSurfaceDistance();
         */
         this.AddSurfaceDistance = function () {
            scope.Main.Review.AddSurfaceDistance();
        };

        /**
         * 면과 면 최단거리 측정
         * @example
         * vizwide3d.Review.Measure.AddSurfaceMinDistance();
         */
         this.AddSurfaceMinDistance = function () {
            scope.Main.Review.AddSurfaceDistance(1);
        };

        /**
         * 면과 점 최단거리 측정
         * @example
         * vizwide3d.Review.Measure.AddSurfacePointMinDistance();
         */
         this.AddSurfacePointMinDistance = function () {
            scope.Main.Review.AddSurfaceDistance(2);
        };


        /**
         * 개체 최단 거리 측정 추가
         * @example
         * vizwide3d.Review.Measure.AddObjectMinDistance();
         */
        this.AddObjectMinDistance = function () {
            scope.Main.Review.AddObjectMinDistance();
        };

        /**
         * 위치 측정 추가
         * @example
         * vizwide3d.Review.Measure.AddPosition();
         */
        this.AddPosition = function () {
            scope.Main.Review.AddPosition();
        };

        /**
         * Smart 축 거리 측정 추가
         * @example
         * vizwide3d.Review.Measure.AddSmartAxisDistance();
         */
        this.AddSmartAxisDistance = function () {
            scope.Main.Review.AddSmartAxisDistance();
        };

        /**
         * X축 거리 측정
         * @example
         * vizwide3d.Review.Measure.AddXAxisDistance();
         */
        this.AddXAxisDistance = function () {
            scope.Main.Review.AddXAxisDistance();
        };

        /**
         *  XY축 거리 측정
         * @example
         * vizwide3d.Review.Measure.AddXYAxisDistance();
         */
        this.AddXYAxisDistance = function () {
            scope.Main.Review.AddXYAxisDistance();
        };

        /**
         *  Y축 거리 측정
         * @example
         * vizwide3d.Review.Measure.AddYAxisDistance();
         */
        this.AddYAxisDistance = function () {
            scope.Main.Review.AddYAxisDistance();
        };

        /**
         *  YZ축 거리 측정
         * @example
         * vizwide3d.Review.Measure.AddYZAxisDistance();
         */
        this.AddYZAxisDistance = function () {
            scope.Main.Review.AddYZAxisDistance();
        };

        /**
         *  Z축 거리 측정
         * @example
         * vizwide3d.Review.Measure.AddZAxisDistance();
         */
        this.AddZAxisDistance = function () {
            scope.Main.Review.AddZAxisDistance();
        };

        /**
         *  ZX축 거리 측정
         * @example
         * vizwide3d.Review.Measure.AddZXAxisDistance();
         */
        this.AddZXAxisDistance = function () {
            scope.Main.Review.AddZXAxisDistance();
        };

        /**
         * 연속 거리 측정
         * @example
         * vizwide3d.Review.Measure.AddLinkedDistance();
         */
        this.AddLinkedDistance = function () {
            scope.Main.Review.AddLinkedDistance();
        };
        
        /**
         * 연속 X축 거리 측정
         * @example
         * vizwide3d.Review.Measure.AddLinkedXAxisDistance();
         */
         this.AddLinkedXAxisDistance = function () {
            scope.Main.Review.AddLinkedAxisDistance(VIZCore.Enum.Axis.X);
        };

        /**
         * 연속 Y축 거리 측정
         * @example
         * vizwide3d.Review.Measure.AddLinkedYAxisDistance();
         */
        this.AddLinkedYAxisDistance = function () {
            scope.Main.Review.AddLinkedAxisDistance(VIZCore.Enum.Axis.Y);
        };

        /**
         * 연속 Z축 거리 측정
         * @example
         * vizwide3d.Review.Measure.AddLinkedZAxisDistance();
         */
        this.AddLinkedZAxisDistance = function () {
            scope.Main.Review.AddLinkedAxisDistance(VIZCore.Enum.Axis.Z);
        };

        /**
         * 점대 여러점 측정
         * @example
         * vizwide3d.Review.Measure.AddOnePointFixedDistance();
         */
        this.AddOnePointFixedDistance = function () {
            scope.Main.Review.AddOnePointFixedDistance();
        };

        /**
         * 실린더 - 평면 최단 거리
         * @example
         * vizwide3d.Review.Measure.AddCylinderPlaneDistance();
         */
        this.AddCylinderPlaneDistance = function () {
            scope.Main.Review.AddCylinderPlaneDistance();
        };

        /**
         * 수평거리 측정
         * @example
         * vizwide3d.Review.Measure.AddHorizontalityDistance();
         */
        this.AddHorizontalityDistance = function () {
            scope.Main.Review.AddHorizontalityDistance();
        };

        /**
         * 실린더 - 실린더 교차점
         * @example
         * vizwide3d.Review.Measure.AddCylinderCylinderCrossPoint();
         */
        this.AddCylinderCylinderCrossPoint = function () {
            scope.Main.Review.AddCylinderCylinderCrossPoint();
        };

        /**
         * 바운드 박스
         * @example
         * vizwide3d.Review.Measure.AddBoundbox();
         */
        this.AddBoundbox = function () {
            scope.Main.Review.AddBoundbox();
        };

        /**
         * 면 기준 바운드 박스
         * @example
         * vizwide3d.Review.Measure.AddBoundBoxByPlane();
         */
        this.AddBoundBoxByPlane = function() {
            scope.Main.Review.AddBoundBoxByPlane();
        };
        
        /**
         * 반지름 측정
         */
        this.AddCircleRadius = function() {
            scope.Main.Review.AddCircleRadius();
        };

         /**
         * 직경 측정
         */
         this.AddCircleDiameter = function() {
            scope.Main.Review.AddCircleDiameter();
        };

        /**
         * 거리 측정
         * @example
         *  let pos = new VIZCore.Vector3(-11.200, -26.311, 26.888);
         *  let item = vizcore.Review.Measure.AddCustomPosition(pos);
         */
        this.AddCustomPosition = function(position) {

            let item = scope.Main.Measure.AddCustomPosition(position);        
            return item;
        };

        /**
         * 사용자 축 거리측정
        * @example
         *  VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE 
         *  VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Y_AXIS_DISTANCE
         *  VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_Z_AXIS_DISTANCE
         * 
         *  let xPos1 = new VIZCore.Vector3(-17.87, -26.37, 18.06);
         *  let xPos2 = new VIZCore.Vector3(-11.59, -14.87, 26.93);
         *  
         *  let item = vizcore.Review.Measure.AddCustomAxisDistance(VIZCore.Enum.REVIEW_TYPES.RK_MEASURE_X_AXIS_DISTANCE, xPos1, xPos2);
         */
        this.AddCustomAxisDistance = function(axis, pos1 , pos2){

            if (axis === undefined || pos1 === undefined || pos2 === undefined){
                scope.Main.Review.AddCustomAxisDistance();
            }
            else{

                let item = scope.Main.Measure.AddCustomAxisDistance(axis, pos1, pos2);        
                return item;
            }
        };


        /**
         * 각도 측정
         */
        this.AddCustom3PointAngle = function(basePos, pos1, pos2){
           
            let item = scope.Main.Measure.AddCustom3PointAngle(basePos, pos1, pos2);        
            return item;
        };
        
        this.AddCustomMultiPointDistance = function(positions, directions, offsetDirection){
           
            let item = scope.Main.Measure.AddCustomMultiPointDistance(positions, directions, offsetDirection);        
            return item;
        };
        
            
        
        
        /**
         * Triangles1 과 Triangles2 최단 거리 및 위치 반환
         * @param {Data.TriangleItem} triangles1
         * @param {Data.TriangleItem} triangles2
         * @param {VIZCore.Vector3} minPtA : [out] 가장 가까운 위치A
         * @param {VIZCore.Vector3} minPtB : [out] 가장 가까운 위치B
         * @return {Number} : 거리
         */
        this.GetMinDistanceByTriangles = function (triangles1, triangles2, minPtA, minPtB) {
            scope.Main.Data.GetMinDistanceByTriangles(triangles1, triangles2, minPtA, minPtB);
        };

        /**
         * 측정 방식 개체 이동 
         * @param {number} subType 개체 이동에 대한 타입 
         * subType = 0: 점과 점 거리이동 , 1: 면과 면 이동(평행이동), 2:면 접합
         * @example
         * 
         * let subType = 0;
         * vizwide3d.Review.Measure.SetTranslateSubType(subType);
         */
        this.SetTranslateSubType = function(subType) {
            scope.Main.Control.SetMode(VIZCore.Enum.CONTROL_STATE.MARKUP, VIZCore.Enum.REVIEW_TYPES.RK_UTIL_TRANSFORM); 
            scope.Main.Control.SetSubType(subType);
        };

        /**
         * 지정한 노드 중심의 가장 가까운 좌표에서 선택 정보 반환
         * @param {array<number>} nodeIds 개체
         * @return {*} 선택 반환 결과
         * @example
         * 
         * let ids = [];
         * ids.push(100);
         * ids.push(200);
         * ids.push(300);
         * 
         * // item.result = 선택 여부 결과 (true = 성공, false = 실패)
         * // item.position = 좌표
         * // item.normal = 노말
         * const item = vizwide3d.Review.Measure.GetNodeCenterNearsetSurfacePos(ids);
         */
        this.GetNodeCenterNearsetSurfacePos = function(nodeIds)
        {
            const result = scope.Main.Data.GetNodeCenterNearsetSurfacePos(nodeIds);

            return {
                result : result.pick,
                position : result.position,
                normal : result.normal
            }
        };

        //=======================================
        // Event
        //=======================================
    }
}

export default Measure;