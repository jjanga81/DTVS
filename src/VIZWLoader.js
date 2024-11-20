//import $ from 'jquery';
/**
 * @author jhjang@softhills.net
 */

let VIZWLoader = function (view, VIZCore) {

    let scope = this;

    const ContentsType = {
        CTUnknown: 0,				//!< [사용안함, 기본값]알수없는 블럭
        CTGeneralBinaryBlock: 1,	//!< [사용안함]
        CTStructure: 2,			//!< 어셈블리/파트 구조정보
        CTMeshBlock: 3,			//!< [사용안함] 메시블럭
        CTClashTestData: 4,		//!< [간섭검사전용] 클래시테스트 데이터
        CTImageData: 5,			//!< [간섭검사전용] 이미지 데이터
        CTImageIdxTable: 6,		//!< [간섭검사전용] 이미지 인덱스 테이블
        CTMeshBlockTable: 7,		//!< [사용안함] 메시블럭 테이블
        CTEntityBinaryBlock: 8,	//!< [그래픽코어] 추가 바이너리 블럭
        CTBodyMeshData: 9,			//!< 바디 메시 데이터. 구조와 별도로 저장됨
        CTPropDic: 10,				//!< 여러 노드에서 공유되는 프로퍼티
        CTUserDefGroups: 11,		//!< 사용자지정 그룹
        CTFileMetaData: 12,			//!< 파일메타데이터
        CTAuthority: 13,			//!< 오쏘리티데이터

        // 2015. 3. 10 - 지연 로딩 지원을 위한 컨텐츠
        CTNodePropTable: 14,		//!< 노드별 프로퍼티. 프로퍼티 지연로딩 지원
        CTNodePropTableIndices: 15, //!< 노드별 프로퍼티 인덱스목록. 프로퍼티 지연로딩 지원
        CTInitialInfo: 16,			//!< 초기에 보여줄 정보 관련 (계획만됨. 현재 사용되지 않음)

        CTUserCustom: 17,			//!< CT 타입 upper bound 로만 사용됨.
        CTEdgeTable: 18,            //!< Mobile EdgeTable
        CTThumbnail: 19,            //!< Thumbnail Image -  2016.03.22
        CTMisc: 20,                 //!< folder, point, curve, clircle 등 기타 데이타 저장 - 2016.03.28  
        CTStructureHeader: 21,       //!< 어셈블리/파트 신규 구조정보
        CTMeshBlockSub: 22,			//!< 메시블럭내 데이터 초과시 추가적으로 저장
        CTStructureNameData: 24,			//!< NameStructure

        CTSplitStructureMeshBlockFile: 34,     //!< 구조정보와 메시블럭 분리된 파일 - 2020.10.05
        CTSplitAreaMeshBlockList: 35,     //!< 영역별 메시블럭 리스트 - 2020.10.19
        CTTreeInfo: 38
    };
    function encodeURI(str) {
        let dom = "";
        let domExp = {
            dom: /(http(s)?:\/\/|www.)([a-z0-9\w]+\.*)+[a-z0-9]{2,4}\//gi,
            par: /(http(s)?:\/\/|www.)([a-z0-9\w]+\.*)+[a-z0-9]{2,4}([\/a-z0-9-%#?&=\w])+(\.[a-z0-9]{2,4}(\?[\/a-z0-9-%#?&=\w]+)*)*/gi
        };
        str.replace(domExp.dom, function (n) {
            dom = n;
        });
        let par = str.replace(domExp.dom, "");
        let encode = encodeURIComponent(par);
        let url = dom + encode;
        return url;
    }
    this.parsetype = 1;
    this.load = function (data, onLoad, onProgress) {
        scope.parse(data, onLoad, onProgress);
    };

    this.parse = function (data, onload, onProgress, vizwType, array) {
        let parseOnload = onload;
        let startID = 0;
        let file = data;

        if (array !== undefined) {
            parseData_lod(array);
            return;
        }

        async function asyncParse(result, vizwType) {
            //if (type === undefined)
            //parseData_v303(result, dataId);
            //else

            //if (view.DataSplit !== 0)
            //    parseData_split(result)
            //else
            parseData_lod(result);
        }

        function newPos(vec, offset, max) {
            if (vec.z + offset <= max)
                vec.z += offset;
            else if (vec.y + offset <= max) {
                vec.y += offset;
                vec.z = 0;
            }
            else {
                vec.x += offset;
                vec.y = 0;
                vec.z = 0;
            }

            return this;
        }

        const BigInt = window.BigInt, bigThirtyTwo = BigInt(32), bigZero = BigInt(0);
        function getUint64BigInt(dataView, byteOffset, littleEndian) {
            // split 64-bit number into two 32-bit (4-byte) parts
            const left = BigInt(dataView.getUint32(byteOffset | 0, !!littleEndian) >>> 0);
            const right = BigInt(dataView.getUint32((byteOffset | 0) + 4 | 0, !!littleEndian) >>> 0);

            // combine the two 32-bit values and return
            return littleEndian ? (right << bigThirtyTwo) | left : (left << bigThirtyTwo) | right;
        }

        function getUint64(dataView, byteOffset, littleEndian) {
            // 22.06.07 ssjo
            // 예제 Toycar.vizw 오픈 문제로 코드 복원
            if (1) {
                // split 64-bit number into two 32-bit parts
                const left = dataView.getUint32(byteOffset, littleEndian);
                const right = dataView.getUint32(byteOffset + 4, littleEndian);

                // combine the two 32-bit values
                const combined = littleEndian ? left + 2 ** 32 * right : 2 ** 32 * left + right;

                if (!Number.isSafeInteger(combined))
                    console.warn(combined, 'exceeds MAX_SAFE_INTEGER. Precision may be lost');

                return combined;
            }
            return getUint64BigInt(view, byteOffset, littleEndian);
        }

        function parseData_v303(result) {

            console.log("Data Loading Start");
            let dataView = new DataView(result);
            let offset = 0;
            let header = {
                typeStr: null, // 16
                version: null, // 4
                sizeTocItem: null, //4
                nToc: null, //4
                tocPos: null //8
            };
            let buffer = new Uint8Array(result, offset, 16);
            header.typeStr = String.fromCharCode.apply(null, buffer);
            offset += 16;
            header.version = dataView.getInt32(offset, true);
            offset += 4;
            header.sizeTocItem = dataView.getInt32(offset, true);
            offset += 4;
            header.nToc = dataView.getInt32(offset, true);
            offset += 4;
            header.tocPos = getUint64(dataView, offset, true);
            offset += 8;

            let m_toc = [];
            // read toc
            let nTocOfThisSeg = 0;
            let nextPos = 0;
            let m_StreamCurrentPosition = header.tocPos;

            nTocOfThisSeg = dataView.getInt32(m_StreamCurrentPosition, true);
            m_StreamCurrentPosition += 4;
            nextPos = getUint64(dataView, m_StreamCurrentPosition, true);
            m_StreamCurrentPosition += 8;

            for (let i = 0; i < nTocOfThisSeg; i++) {
                ReadTocItem(i);
            }

            function ReadTocItem(tocIdx) {
                let itemPos = header.tocPos + 12 + (tocIdx * header.sizeTocItem);

                // Core에서 8ㅠyte로 써짐 뒤 4byte는 더미데이터
                let itemType = dataView.getInt32(itemPos, true);
                itemPos += 8;
                let position = getUint64(dataView, itemPos, true);
                itemPos += 8;
                let dataSize = dataView.getUint32(itemPos, true);
                itemPos += 4;
                let uncompSize = dataView.getUint32(itemPos, true);
                itemPos += 4;
                let parsetype = 0;
                if (view.Loader.parsetype === 1) {
                    parsetype = dataView.getUint32(itemPos, true);
                    itemPos += 4;
                }

                let toc = {
                    itemType: itemType,
                    position: position,
                    datasize: dataSize,
                    uncompsize: uncompSize,
                    parsetype: parsetype
                };
                m_toc.push(toc);
            }

            function FindLast(ctt) {
                let tocIdx = -1;
                for (let i = m_toc.length - 1; i >= 0; i--) {
                    if (m_toc[i].itemType === ctt) {
                        tocIdx = i;
                        break;
                    }
                }
                return tocIdx;
            }

            function FindFirst(ctt) {
                let tocIdx = -1;
                for (let i = 0; i < m_toc.length; i++) {
                    if (m_toc[i].itemType === ctt) {
                        tocIdx = i;
                        break;
                    }
                }
                return tocIdx;
            }

            // MeshData
            function ReadDataBlock(ti, buffer) {
                try {
                    let m_StreamCurrentPosition = ti.position;
                    let dataView;
                    if (buffer === undefined) {
                        dataView = new DataView(result, m_StreamCurrentPosition, ti.datasize);
                        return dataView;
                    }
                    else {
                        view = new DataView(buffer, m_StreamCurrentPosition, ti.datasize);
                        return view;
                    }

                } catch (e) {
                    return undefined;
                }
            }

            //let ti = FindLast(3);
            let ti = FindLast(ContentsType.CTMeshBlock);
            let tocData = m_toc[ti];

            function ImportMeshBlock(view, tiStruct) {
                //let vnElemsSize = 15;
                //let triElemsSize = 2 * 3;
                let meshoffset = 0;
                let MeshBlockSize;
                MeshBlockSize = view.getInt32(meshoffset, true);
                meshoffset += 4;

                for (let i = 0; i < MeshBlockSize; i++) {
                    let color = new VIZCore.Color();
                    color.r = view.getUint8(meshoffset, true);
                    color.g = view.getUint8(meshoffset + 1, true);
                    color.b = view.getUint8(meshoffset + 2, true);
                    color.a = view.getUint8(meshoffset + 3, true);

                    //let color = {
                    //    R: view.getUint8(meshoffset, true),
                    //    G: view.getUint8(meshoffset + 1, true),
                    //    B: view.getUint8(meshoffset + 2, true),
                    //    A: view.getUint8(meshoffset + 3, true)
                    //};
                    meshoffset += 4;
                    let nVtx = view.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nNormal = view.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nTri = view.getUint32(meshoffset, true);
                    meshoffset += 4;
                    //cntTriAll += nTri;
                    if (view.Loader.parsetype === 1) {
                        let ptype = view.getUint32(meshoffset, true);
                        meshoffset += 4;
                    }

                    let cnt = nVtx / 15;
                    let vtArray = new Float32Array(result, meshoffset + view.byteOffset, nVtx);

                    meshoffset += nVtx * 4;
                    let vnArray = new Float32Array(result, meshoffset + view.byteOffset, nNormal);
                    meshoffset += nNormal * 4;
                    let triArray = new Uint32Array(result, meshoffset + view.byteOffset, nTri);
                    meshoffset += nTri * 4;

                    let object = view.Data.Object3D();
                    object.id_file = file.Key;

                    // 데이터 추출
                    object.attribs.a_index.array = triArray;
                    object.numElements = object.attribs.a_index.array.length;

                    object.attribs.a_position.array = vtArray;
                    object.attribs.a_normal.array = vnArray;

                    let MeshSize = view.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let datas = [];
                    let colors = [];
                    let colorsOffset = 0;
                    for (let j = 0; j < MeshSize; j++) {
                        let partid = view.getUint32(meshoffset, true);
                        meshoffset += 4;
                        let bodyid = view.getUint32(meshoffset, true);
                        meshoffset += 4;

                        let origin_id = bodyid; //원본 Body ID

                        let m_vnIdx = view.getUint32(meshoffset, true);
                        meshoffset += 4;
                        let m_triIdx = view.getUint32(meshoffset, true);
                        meshoffset += 4;

                        let MnVtx = view.getUint16(meshoffset, true);
                        meshoffset += 2;
                        let MnTri = view.getUint16(meshoffset, true);
                        meshoffset += 2;

                        let bbox = new Float32Array(dataView.buffer, meshoffset + view.byteOffset, 6);
                        meshoffset += 24;


                        let data = {
                            partId: partid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                            bodyId: bodyid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                            origin_id: origin_id,

                            color: color,
                            material: undefined,//material.id,
                            m_vnIdx: m_vnIdx * 3,
                            m_triIdx: m_triIdx * 3,
                            m_nVtx: MnVtx * 3,
                            m_nTris: MnTri * 3,

                            BBox: new VIZCore.BBox(bbox),
                            //action: view.Data.ActionItem(),
                            colorIdx: null,
                            object: null
                        };

                        // 색상 ID 재설정
                        view.Data.IDColor.new();
                        //data.action.transform.setPosition(view.Data.TmpTransform);
                        //rgb
                        //data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16);
                        //rgba
                        data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16) + (view.Data.IDColor.a * 16777216); //<< 24
                        //let colorArrLength = data.m_nVtx;
                        let colorArrLength = data.m_nVtx / 3 * 4; //vectex 3, color는 4
                        //for (let k = data.m_vnIdx; k < (data.m_vnIdx + data.m_nVtx) / 3 * 3; k = k+3) {
                        for (let k = 0; k < colorArrLength; k = k + 4) {
                            colors[colorsOffset + k + 0] = view.Data.IDColor.r;
                            colors[colorsOffset + k + 1] = view.Data.IDColor.g;
                            colors[colorsOffset + k + 2] = view.Data.IDColor.b;
                            colors[colorsOffset + k + 3] = view.Data.IDColor.a;
                        }
                        colorsOffset += colorArrLength;

                        data.object = object;
                        datas.push(data);
                        view.Data.AddBody(data);


                        let bodyAction = view.Data.ShapeAction.GetAction(file.Key, origin_id);
                        if (bodyAction === undefined) {
                            bodyAction = view.Data.ActionItem();
                        }

                        //Action 데이터 설정
                        {
                            //파일 읽는 부분에서 material 등록이 있기때문에 등록 필요
                            view.Data.ShapeAction.SetAction(file.Key, origin_id, bodyAction);
                        }
                    }
                    //newPos(view.Data.TmpTransform, 30, 300);

                    object.attribs.a_color.array = new Uint8Array(colors, 0, colorsOffset);
                    //object.attribs.a_color.array = new Float32Array(colors, 0, vtArray.length); 

                    view.Data.Objects.push(object);
                    object.tag = datas;
                }
            }

            // tree
            let tiStructure = FindLast(ContentsType.CTStructure);
            let tocStructure = m_toc[tiStructure];
            let viewStructure = ReadDataBlock(tocStructure);

            function ImportStructure(view, toc) {
                let offset = 0;
                let m_Unit = view.getUint32(offset, true);
                offset += 4;
                let nEnts = view.getUint32(offset, true);
                offset += 4;
                let vdBlockSize = view.getUint32(offset, true);
                offset += 4;

                let m_vecPropHeaderDic = []; // 136 Byte
                for (let i = 0; i < vdBlockSize; i++) {
                    let HeaderTocTableItem = {
                        index: -1,
                        itemType: 0,
                        entFlags: 0,
                        iNameIndex: -1,
                        attFlags: 0,
                        transfrom: [],
                        bBox: [],
                        BBox: null,
                        cCount: -1,
                        pIndex: -1,
                        orgNodeID: -1,
                        pNameBuff: null,
                        tocId: 0,
                        btype: 0,
                        name: null
                    };

                    let index = view.getUint32(offset, true);
                    HeaderTocTableItem.index = index === -1 ? index : index + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                    offset += 4;
                    HeaderTocTableItem.itemType = view.getInt32(offset, true);
                    offset += 4;
                    HeaderTocTableItem.entFlags = view.getUint16(offset, true);
                    offset += 4;
                    HeaderTocTableItem.iNameIndex = view.getInt32(offset, true);
                    offset += 4;
                    HeaderTocTableItem.attFlags = view.getUint16(offset, true);
                    offset += 4;
                    HeaderTocTableItem.transfrom = [];
                    for (let j = 0; j < 16; j++) {
                        HeaderTocTableItem.transfrom[j] = view.getFloat32(offset, true);
                        offset += 4;
                    }
                    HeaderTocTableItem.bBox = [];
                    for (let k = 0; k < 6; k++) {
                        HeaderTocTableItem.bBox[k] = view.getFloat32(offset, true);
                        offset += 4;
                    }

                    HeaderTocTableItem.BBox = new VIZCore.BBox(HeaderTocTableItem.bBox);

                    HeaderTocTableItem.cCount = view.getInt32(offset, true);
                    offset += 4;
                    let pIndex = view.getInt32(offset, true);
                    HeaderTocTableItem.pIndex = pIndex === -1 ? pIndex : pIndex + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                    offset += 4;
                    HeaderTocTableItem.orgNodeID = view.getInt32(offset, true);
                    offset += 4;
                    //byte * pNameBuff;
                    if (header.version < 302)
                        offset += 8;

                    HeaderTocTableItem.tocId = view.getInt32(offset, true); //Binary Block용 
                    offset += 4;
                    HeaderTocTableItem.btype = view.getInt32(offset, true);//Binary Block용 
                    offset += 4;

                    // add
                    if (HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntAssembly
                        && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntPart
                        && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntBody) {
                        nEnts--;
                        continue;
                    }

                    m_vecPropHeaderDic.push(HeaderTocTableItem);
                }

                view.Data.AddNodes(m_vecPropHeaderDic);

                // NodeName
                let nNameNum = view.getInt32(offset, true);
                offset += 4;
                let decode_utf8 = function (s) {
                    try {
                        return decodeURIComponent(escape(s));
                    }
                    catch (e) {
                        return s;
                    }
                };
                let m_vecPropNodeNameDic = [];
                let pos = 0;
                for (let l = 0; l < nEnts; l++) {
                    if (m_vecPropHeaderDic[l].iNameIndex <= 0)
                        continue;

                    let NameTocTableItem = {
                        nStringNum: 0,
                        pos: 0,
                        name: null
                    };

                    NameTocTableItem.pos = pos;
                    NameTocTableItem.nStringNum = m_vecPropHeaderDic[l].iNameIndex;

                    let bodyNameBuffer = new Uint8Array(NameTocTableItem.nStringNum);
                    for (let m = 0; m < NameTocTableItem.nStringNum; m++) {
                        // Multibyte
                        //if(m%2 ===0)
                        //    bodyNameBuffer[m/2] = view.getUint8(pos + offset + m, true);
                        bodyNameBuffer[m] = view.getUint8(pos + offset + m, true);
                    }

                    let bodyName = String.fromCharCode.apply(null, bodyNameBuffer);
                    bodyName = decode_utf8(bodyName);


                    //[정규식 이용해서 gi 로 감싸기]
                    //감싼 따옴표를 슬래시로 대체하고 뒤에 gi 를 붙이면 
                    //replaceAll 과 같은 결과를 볼 수 있다.
                    //* g : 발생할 모든 pattern에 대한 전역 검색
                    //* i : 대 / 소문자 구분 안함
                    //* m: 여러 줄 검색(참고)

                    m_vecPropHeaderDic[l].name = bodyName.replace(/\0/gi, '');
                    NameTocTableItem.name = bodyName.replace(/\0/gi, '');
                    pos += m_vecPropHeaderDic[l].iNameIndex;

                    m_vecPropNodeNameDic.push(NameTocTableItem);
                }

                offset += nNameNum;

                let LoadProperty = function () {

                    // Property
                    let vdBodyBlockSize = view.getUint32(offset, true);
                    offset += 4;

                    for (let pb = 0; pb < vdBlockSize; pb++) {
                        let BodyTocTableItem = {
                            nodeTreeOrderID: -1,
                            hasColor: false,
                            color: [],
                            cacheidx: -1,
                            hasLayerNumber: false,
                            layerNum: -1,
                            attrCount: -1,
                            attrType: [],
                            volume: 0,       //volume 
                            area: 0,         //Area
                            centroid: [],  //centroid (center of gravity)
                            desbyteLength: -1,
                            fdensity: -1,
                            edgeStartidx: -1,
                            edgeIdxNum: -1,
                        };
                        BodyTocTableItem.nodeTreeOrderID = view.getInt32(offset, true);
                        offset += 4;
                        BodyTocTableItem.hasColor = view.getUint8(offset, true);
                        offset += 4;
                        for (let i = 0; i < 4; i++) {
                            BodyTocTableItem.color[i] = view.getFloat32(offset, true);
                            offset += 4;
                        }

                        BodyTocTableItem.cacheidx = view.getInt32(offset, true);
                        offset += 4;
                        BodyTocTableItem.hasLayerNumber = view.getUint8(offset, true);
                        offset += 4;
                        BodyTocTableItem.layerNum = view.getInt32(offset, true);
                        offset += 4;
                        BodyTocTableItem.attrCount = view.getInt32(offset, true);
                        offset += 4;
                        for (let i = 0; i < 2; i++) {
                            BodyTocTableItem.attrType[i] = view.getInt32(offset, true);
                            offset += 4;
                        }
                        BodyTocTableItem.volume = getUint64(view, offset, true);//view.getInt32(offset, true);
                        offset += 8;
                        BodyTocTableItem.area = getUint64(view, offset, true);//view.getInt32(offset, true);
                        offset += 8;
                        for (let i = 0; i < 3; i++) { //centroid (center of gravity)
                            BodyTocTableItem.centroid[i] = getUint64(view, offset, true);//view.getInt32(offset, true);
                            offset += 8;
                        }
                        BodyTocTableItem.desbyteLength = view.getInt32(offset, true);
                        offset += 4;
                        BodyTocTableItem.fdensity = view.getInt32(offset, true);
                        offset += 4;
                        BodyTocTableItem.edgeStartidx = view.getInt32(offset, true);
                        offset += 4;
                        BodyTocTableItem.edgeIdxNum = view.getInt32(offset, true);
                        offset += 4;
                    }
                };

                //LoadProperty();
            }

            function GetNodeMaxID(view, toc) {
                let offset = 8;
                let vdBlockSize = view.getUint32(offset, true);
                offset += 4;
                let max = 0;
                for (let i = 0; i < vdBlockSize; i++) {
                    let index = view.getUint32(offset, true);
                    if (max < index)
                        max = index;

                    offset += 32;
                    //offset += 4;
                    //offset += 4;
                    //offset += 4;
                    //offset += 4;
                    //offset += 4;
                    //for (let j = 0; j < 16; j++) {
                    //    offset += 4;
                    //}
                    //for (let k = 0; k < 6; k++) {
                    //    offset += 4;
                    //}
                    //offset += 4;
                    //offset += 4;
                    //offset += 4;
                    //offset += 4;
                    //offset += 4;

                    if (header.version < 302)
                        offset += 8;
                }
                return max;
            }

            // Property
            let tiPropertyIndices = FindLast(ContentsType.CTNodePropTableIndices);
            let tocPropertyIndices = m_toc[tiPropertyIndices];
            let viewPropertyIndices = ReadDataBlock(tocPropertyIndices);

            function LoadPropTableIndices(view, toc) {
                let offsetIndices = 0;
                let nTables = view.getUint32(offsetIndices, true);
                offsetIndices += 4;

                let m_nodePropTables = [];

                for (let p = 0; p < nTables; p++) {
                    let tidx = view.getUint32(offsetIndices, true);
                    offsetIndices += 4;

                    let PropTocTableItem = {
                        tableTocIdx: tidx,
                        nLoadedNodes: 0
                    };

                    m_nodePropTables.push(PropTocTableItem);
                }

                for (let pi = 0; pi < m_nodePropTables.length; pi++) {
                    let pti = m_nodePropTables[pi];
                    let tocProperty = m_toc[pti.tableTocIdx];
                    if (tocProperty === undefined) {
                        setTimeout(function () {
                            parseOnload(null, data);
                        }, 1);
                        return;
                    }
                    else {
                        let viewProperty = ReadDataBlock(tocProperty, dataView.buffer);
                        LoadPropTableItem(viewProperty, tocProperty, pti);
                    }
                }

                function LoadPropTableItem(view, toc, pti) {
                    let offset = 0;
                    let nNodesPerTable = view.getUint32(offset, true);
                    offset += 4;
                    if (pti.nLoadedNodes === nNodesPerTable)
                        return false;
                    let arrProperty = [];
                    for (let i = 0; i < nNodesPerTable; i++) {
                        let Property = {
                            nodeId: -1,
                            nNodeProps: 0,
                            items: []
                        };
                        arrProperty.push(Property);

                        Property.nodeId = view.getUint32(offset, true);
                        Property.nodeId += startID;//view.Data.GetStartID();
                        offset += 4;
                        Property.nNodeProps = view.getInt16(offset, true);
                        offset += 2;

                        let encode_utf8 = function (s) {
                            return unescape(encodeURIComponent(s));
                        };

                        let decode_utf8 = function (s) {
                            return decodeURIComponent(escape(s));
                        };

                        for (let pi = 0; pi < Property.nNodeProps; pi++) {
                            let item = {
                                key: null,
                                value: null
                                //valueType: null
                            };
                            let len = view.getUint32(offset, true);
                            offset += 4;

                            let keyBuffer = new Uint8Array(len);
                            for (let m = 0; m < len; m++) {
                                keyBuffer[m] = view.getUint8(offset + m, true);
                            }

                            item.key = String.fromCharCode.apply(null, keyBuffer);
                            item.key = decode_utf8(item.key);

                            offset += len;

                            len = view.getUint16(offset, true);
                            offset += 2;

                            len = view.getUint32(offset, true);
                            offset += 4;

                            let valueBuffer = new Uint8Array(len);
                            for (let m = 0; m < len; m++) {
                                valueBuffer[m] = view.getUint8(offset + m, true);
                            }
                            item.value = String.fromCharCode.apply(null, valueBuffer);
                            item.value = decode_utf8(item.value);

                            offset += len;

                            //item.valType = view.getUint16(offset, true);
                            offset += 2;

                            Property.items.push(item);
                        }
                    }

                    view.Data.AddUserProperty(arrProperty);

                    // ID 재조정
                    //view.Data.ResetID();

                    setTimeout(function () {
                        parseOnload(null, data);
                    }, 1);
                }
            }

            if (tocData === undefined) {
                if (!view.useFramebuffer)
                    onProgress(1, 1);
                result = null;

                if (tocStructure === undefined) {
                    setTimeout(function () {
                        parseOnload(null, data);
                    }, 1);
                }
                else {
                    setTimeout(function () {
                        ImportStructure(viewStructure, tocStructure);

                        if (tocPropertyIndices === undefined) {
                            setTimeout(function () {
                                parseOnload(null, data);
                            }, 1);
                        }
                        else {
                            setTimeout(function () {
                                LoadPropTableIndices(viewPropertyIndices, tocPropertyIndices);
                            }, 1);
                        }

                    }, 1);
                }
            }
            else {
                // ID
                let maxID = GetNodeMaxID(viewStructure, tocStructure);
                view.Data.SetStartID(file.Key, maxID);
                //startID = view.Data.GetStartID(dataId);

                let dataReadView = ReadDataBlock(tocData);

                offset = 0;
                let meshBlockNum = dataReadView.getInt32(offset, true);
                offset += 4;

                let curload = 0;
                let loading = function () {
                    for (let i = curload; i < meshBlockNum; i++) {
                        let percent = curload / meshBlockNum;
                        if (percent === Infinity)
                            percent = 0;
                        if (!view.useFramebuffer)
                            onProgress(1, percent);
                        console.log("ReadMeshBlock : " + i);
                        let cachTocIdx = 0;
                        cachTocIdx = view.getInt32(offset, true);
                        offset += 4;

                        //let tocIdx = FindToc(ContentsType.CTMeshBlockSub, cachTocIdx);//FindLast(22);
                        //toc = m_toc[tocIdx];
                        let toc = m_toc[cachTocIdx];
                        //toc = FindTocItem(cachTocIdx);

                        let viewSub = ReadDataBlock(toc);

                        ImportMeshBlock(viewSub, cachTocIdx);
                        //ImportMeshBlock_body(viewSub, cachTocIdx);
                        curload++;
                        if (curload !== meshBlockNum) {
                            setTimeout(function () {
                                if (!view.useFramebuffer)
                                    onProgress(1, percent);
                                loading();
                            }, 1);
                            break;
                        }
                        else {
                            setTimeout(function () {
                                if (!view.useFramebuffer)
                                    onProgress(1, 1);
                                result = null;

                                //setTimeout(function () {
                                //    parseOnload(view.Data.Objects, data);
                                //}, 1);

                                if (tocStructure === undefined) {
                                    setTimeout(function () {
                                        parseOnload(null, data);
                                    }, 1);
                                }
                                else {
                                    setTimeout(function () {
                                        ImportStructure(viewStructure, tocStructure);

                                        if (tocPropertyIndices === undefined) {
                                            setTimeout(function () {
                                                parseOnload(null, data);
                                            }, 1);
                                        }
                                        else {
                                            setTimeout(function () {
                                                LoadPropTableIndices(viewPropertyIndices, tocPropertyIndices);
                                            }, 1);
                                        }

                                    }, 1);
                                }
                            }, 1);
                        }
                    }
                };

                setTimeout(function () {
                    if (!view.useFramebuffer)
                        onProgress(1, 0);
                    loading();
                }, 1);
            }
        }

        function parseData_lod(result, data) {

            //console.log("Data Loading Start");
            let loaded_Structure = false;
            let loaded_MeshBlock = false;
            let loaded_Property = false;
            let meshBlockId = 0;

            let dataView = new DataView(result);
            let offset = 0;
            let header = {
                typeStr: null, // 16
                version: null, // 4
                sizeTocItem: null, //4
                nToc: null, //4
                tocPos: null //8
            };
            let buffer = new Uint8Array(result, offset, 16);
            header.typeStr = String.fromCharCode.apply(null, buffer);
            offset += 16;
            header.version = dataView.getInt32(offset, true);
            offset += 4;
            header.sizeTocItem = dataView.getInt32(offset, true);
            offset += 4;
            header.nToc = dataView.getInt32(offset, true);
            offset += 4;
            header.tocPos = getUint64(dataView, offset, true);
            offset += 8;

            let m_toc = [];
            // read toc
            let nTocOfThisSeg = 0;
            let nextPos = 0;
            let m_StreamCurrentPosition = header.tocPos;

            nTocOfThisSeg = dataView.getInt32(m_StreamCurrentPosition, true);
            m_StreamCurrentPosition += 4;
            nextPos = getUint64(dataView, m_StreamCurrentPosition, true);
            m_StreamCurrentPosition += 8;

            for (let i = 0; i < nTocOfThisSeg; i++) {
                ReadTocItem(i);
            }

            function ReadTocItem(tocIdx) {
                let itemPos = header.tocPos + 12 + (tocIdx * header.sizeTocItem);

                // Core에서 8ㅠyte로 써짐 뒤 4byte는 더미데이터
                let itemType = dataView.getInt32(itemPos, true);
                itemPos += 8;
                let position = getUint64(dataView, itemPos, true);
                itemPos += 8;
                let dataSize = dataView.getUint32(itemPos, true);
                itemPos += 4;
                let uncompSize = dataView.getUint32(itemPos, true);
                itemPos += 4;
                let parsetype = 0;
                if (view.Loader.parsetype === 1) {
                    parsetype = dataView.getUint32(itemPos, true);
                    itemPos += 4;
                }

                let toc = {
                    itemType: itemType,
                    position: position,
                    datasize: dataSize,
                    uncompsize: uncompSize,
                    parsetype: parsetype
                };
                m_toc.push(toc);
            }

            function FindLast(ctt) {
                let tocIdx = -1;
                for (let i = m_toc.length - 1; i >= 0; i--) {
                    if (m_toc[i].itemType === ctt) {
                        tocIdx = i;
                        break;
                    }
                }
                return tocIdx;
            }

            function FindFirst(ctt) {
                let tocIdx = -1;
                for (let i = 0; i < m_toc.length; i++) {
                    if (m_toc[i].itemType === ctt) {
                        tocIdx = i;
                        break;
                    }
                }
                return tocIdx;
            }

            // MeshData
            function ReadDataBlock(ti, buffer) {
                try {
                    if (ti === undefined)
                        return undefined;

                    let m_StreamCurrentPosition = ti.position;
                    let dataView;
                    if (buffer === undefined) {
                        dataView = new DataView(result, m_StreamCurrentPosition, ti.datasize);
                        return dataView;
                    }
                    else {
                        dataView = new DataView(buffer, m_StreamCurrentPosition, ti.datasize);
                        return dataView;
                    }

                } catch (e) {
                    return undefined;
                }
            }

            function ImportMeshBlock(dataView, tiStruct) {
                //let vnElemsSize = 15;
                //let triElemsSize = 2 * 3;
                let meshoffset = 0;
                let MeshBlockSize;
                MeshBlockSize = dataView.getInt32(meshoffset, true);
                meshoffset += 4;

                let readUV = false;

                if (header.version >= 305 ||
                    (file.headerVersion !== undefined && file.headerVersion >= 0x00010011)) {
                    readUV = true;
                }

                for (let i = 0; i < MeshBlockSize; i++) {

                    let bUseMaterialFlag = false;
                    if (file.headerVersion !== undefined && file.headerVersion >= 0x00010011) {
                        let nUseMaterial = dataView.getInt32(meshoffset, true);
                        if (nUseMaterial === 1)
                            bUseMaterialFlag = true;
                        meshoffset += 4;
                    }

                    let materialID = -1;
                    let color = new VIZCore.Color();

                    if (bUseMaterialFlag) {
                        color.set(255, 255, 255, 255);

                        let mr = dataView.getUint8(meshoffset, true);
                        let mg = dataView.getUint8(meshoffset + 1, true);
                        let mb = dataView.getUint8(meshoffset + 2, true);
                        let ma = dataView.getUint8(meshoffset + 3, true);

                        materialID = ma + (mb << 8) + (mg << 16) + (mr * 16777216); //<< 24
                    }
                    else {
                        color.r = dataView.getUint8(meshoffset, true);
                        color.g = dataView.getUint8(meshoffset + 1, true);
                        color.b = dataView.getUint8(meshoffset + 2, true);
                        color.a = dataView.getUint8(meshoffset + 3, true);
                    }
                    //let color = {
                    //    R: dataView.getUint8(meshoffset, true),
                    //    G: dataView.getUint8(meshoffset + 1, true),
                    //    B: dataView.getUint8(meshoffset + 2, true),
                    //    A: dataView.getUint8(meshoffset + 3, true)
                    //};
                    meshoffset += 4;

                    //material 등록
                    //let materialItem;
                    //let roughness = 0.5;
                    //let metallic = 0;
                    //let materialId = view.Shader.FindMaterial(color, roughness, metallic, [], []);
                    //if (materialId === 0) {
                    //    materialItem = view.Data.MaterialGLItem();
                    //    materialItem.color.copy(color);

                    //    view.Shader.AddMaterial(materialItem);
                    //}
                    //else
                    //    materialItem = view.Shader.GetMaterial(materialId);

                    let nVtx = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nNormal = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nTri = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nUV = 0;
                    if (readUV) {
                        nUV = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                    }

                    //material 등록
                    let materialItem;
                    let roughness = 0.5;
                    let metallic = 0.0;
                    //let materialId = 0;
                    //if (materialId === 0) {
                    if (view.DemoType === 4 && materialItem === undefined) {
                        materialItem = view.Data.MaterialGLItem(VIZCore.Enum.SHADER_TYPES.PBR);
                        //let materialCurrentItemId = view.Shader.AddMaterial(materialItem);
                        //let materialCurrentItemId = materialItem.id;
                        //materialItem.color.copy(color);

                        //rgb (255,255,255) - texture_mold.jpg / normal_mold.jpg
                        //rgb(254, 254, 254) - texture_armNwheel.jpg / normal_armNwheel.jpg
                        //rgb(253, 253, 253) - texture_leather.jpg / normal_leather.jpg
                        //rgb(252, 252, 252) - texture_steel.jpg / normal_steel.jpg
                        //rgb(204, 204, 204) - PlaneShadow.png
                        //rgb(150, 150, 150) - texture_wheel.jpg / normal_wheel.jpg                  

                        if (nUV > 0) {
                            //uv Texture

                            let uvTextureType = -1;
                            if (color.r === 255) {
                                uvTextureType = 100;
                                //uvTextureType = 150;
                                //uvTextureType = -1;

                                roughness = 0.8;
                                metallic = 0.0;

                                //roughness = 0.0;
                                //metallic = 0.0;

                                //roughness = 0.0;
                                //metallic = 1.0;

                                materialItem.tiling.x = 10.0;//4
                                materialItem.tiling.y = -10.0;//4

                                materialItem.offset.x = -2.0;
                                materialItem.offset.y = 2.0;

                                color.r = 255;
                                color.g = 255;
                                color.b = 255;
                                color.a = 255;
                            }
                            else if (color.r === 254) {
                                uvTextureType = 101;

                                roughness = 0.3;
                                metallic = 0.05;

                                //roughness = 0.0;
                                //metallic = 0.05;

                                //roughness = 0.0;
                                //metallic = 1.0;

                                //materialItem.roughness = 0.5;
                                //materialItem.metallic = 0.0;

                                materialItem.tiling.x = 3.0;
                                materialItem.tiling.y = -3.0;

                                materialItem.offset.x = -4.0;
                                materialItem.offset.y = -4.0;

                                color.r = 255;
                                color.g = 255;
                                color.b = 255;
                                color.a = 255;
                            }
                            else if (color.r === 253) {
                                uvTextureType = 102;

                                roughness = 0.3; // roughness = 0.6;
                                metallic = 0.05;

                                //materialItem.roughness = 0.5;
                                //materialItem.metallic = 0.0;

                                materialItem.tiling.x = 30.0;
                                materialItem.tiling.y = -30.0;

                                materialItem.offset.x = 0.0;
                                materialItem.offset.y = 0.0;

                                //uvTextureType = 152;

                                //materialItem.tiling.x = 10.0;
                                //materialItem.tiling.y = 10.0;
                                //
                                //materialItem.offset.x = 0.0;
                                //materialItem.offset.y = 0.0;

                                color.r = 255;
                                color.g = 255;
                                color.b = 255;
                                color.a = 255;
                            }
                            else if (color.r === 252) {
                                uvTextureType = 103;

                                roughness = 0.3;
                                metallic = 0.4;

                                //roughness = 0.5;
                                //metallic = 0.0;

                                materialItem.tiling.x = 20.0; //10
                                materialItem.tiling.y = -20.0;

                                materialItem.offset.x = -4.5;
                                materialItem.offset.y = -4.5;

                                color.r = 255;
                                color.g = 255;
                                color.b = 255;
                                color.a = 255;
                            }
                            else if (color.r === 150) {
                                uvTextureType = 104;

                                roughness = 0.3;
                                metallic = 0.05;

                                //roughness = 0.5;
                                //metallic = 0.0;

                                materialItem.tiling.x = 10.0;
                                materialItem.tiling.y = -10.0;

                                materialItem.offset.x = 0.0;
                                materialItem.offset.y = 0.0;

                                color.r = 255;
                                color.g = 255;
                                color.b = 255;
                                color.a = 255;
                            }
                            else if (color.r === 204) {
                                uvTextureType = 105;

                                roughness = 0;
                                metallic = 0;

                                materialItem.tiling.x = 1.0;
                                materialItem.tiling.y = -1.0;

                                materialItem.offset.x = 0.0;
                                materialItem.offset.y = 0.0;

                                color.r = 255;
                                color.g = 255;
                                color.b = 255;
                                color.a = 100;
                            }
                            else {
                                //console.log("color r : " + color.r);
                            }

                            materialItem.color.copy(color);
                            materialItem.tag.u_Roughness.value = roughness;
                            materialItem.tag.u_Metallic.value = metallic;

                            let textureSrc = view.Util.GetTESTTextureData64Src(uvTextureType);
                            let normalTextureSrc = view.Util.GetTESTTextureData64Src(uvTextureType + 100);

                            if (textureSrc.localeCompare("") !== 0) {
                                let imageTextureSrc = new Image();
                                imageTextureSrc.src = textureSrc;
                                imageTextureSrc.onload = function () {
                                    materialItem.diffuseSrc = imageTextureSrc;

                                    materialItem.diffuseWidth = imageTextureSrc.width;
                                    materialItem.diffuseHeight = imageTextureSrc.height;


                                    setTimeout(function () {
                                        view.MeshBlock.Reset();
                                        view.Renderer.Render();
                                    }, 10);
                                    //view.MeshBlock.Reset();
                                    ////view.Renderer.MainFBClear();
                                    //view.Renderer.Render();
                                }
                            }

                            if (normalTextureSrc.localeCompare("") !== 0) {
                                let imageNormalTextureSrc = new Image();
                                imageNormalTextureSrc.src = normalTextureSrc;
                                imageNormalTextureSrc.onload = function () {
                                    materialItem.normalSrc = imageNormalTextureSrc;

                                    materialItem.normalWidth = imageNormalTextureSrc.width;
                                    materialItem.normalHeight = imageNormalTextureSrc.height;

                                    setTimeout(function () {
                                        view.MeshBlock.Reset();
                                        view.Renderer.Render();
                                    }, 10);

                                    //view.MeshBlock.Reset();
                                    ////view.Renderer.MainFBClear();
                                    //view.Renderer.Render();
                                }
                            }
                        }

                        //imageTextureSrc, imageNormalTextureSrc;
                        //나중에 바이너리 데이터 비교로 변경필요
                        //materialId = view.Shader.FindMaterial(color, roughness, metallic, [], []);

                        if (materialId === 0)
                            view.Shader.AddMaterial(materialItem);
                        else
                            materialItem = view.Shader.GetMaterial(materialId);
                    }
                    else if (view.DemoType === 3) {
                        //materialItem = view.Data.MaterialGLItem();
                        //let materialCurrentItemId = view.Shader.AddMaterial(materialItem);
                        //
                        //roughness = 0.0;
                        //metallic = 0.0;
                        //
                        //materialItem.tiling.x = 1.0;
                        //materialItem.tiling.y = 1.0;
                        //
                        //materialItem.offset.x = 0.0;
                        //materialItem.offset.y = 0.0;
                        //
                        //color.r = 255;
                        //color.g = 255;
                        //color.b = 255;
                        //color.a = 255
                        //
                        //materialItem.color.copy(color);
                        //materialItem.roughness = roughness;
                        //materialItem.metallic = metallic;
                        //
                        //{
                        //    let imageTextureSrc = new Image();
                        //    imageTextureSrc.src = "";
                        //    imageTextureSrc.onload = function () {
                        //        materialItem.diffuseSrc = imageTextureSrc;
                        //
                        //        materialItem.diffuseWidth = imageTextureSrc.width;
                        //        materialItem.diffuseHeight = imageTextureSrc.height;
                        //
                        //        view.MeshBlock.Reset();
                        //        view.Renderer.Render();
                        //    }
                        //}

                        ////imageTextureSrc, imageNormalTextureSrc;
                        ////나중에 바이너리 데이터 비교로 변경필요
                        //materialId = view.Shader.FindMaterial(color, roughness, metallic, [], []);

                        //if (materialId === 0)
                        //    view.Shader.AddMaterial(materialItem);
                        //else
                        //    materialItem = view.Shader.GetMaterial(materialId);
                    }
                    else if (view.UV_DEBUG) {
                        //materialItem = view.Data.MaterialGLItem();
                        //
                        //materialItem.color.copy(color);
                        //materialItem.roughness = roughness;
                        //materialItem.metallic = metallic;
                        //
                        ////let materialCurrentItemId = view.Shader.AddMaterial(materialItem);
                        //
                        ////materialId = view.Shader.FindMaterial(color, roughness, metallic, [], []);
                        //materialId = view.Shader.FindMaterialFromItem(materialItem);
                        //
                        //if (materialId === 0)
                        //    view.Shader.AddMaterial(materialItem);
                        //else
                        //    materialItem = view.Shader.GetMaterial(materialId);
                    }

                    //cntTriAll += nTri;
                    if (view.Loader.parsetype === 1) {
                        let ptype = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                    }

                    //let cnt = nVtx / 15;
                    // (meshoffset + dataView.byteOffset)가 4의 배수여야 함
                    let vtArray = new Float32Array(result, meshoffset + dataView.byteOffset, nVtx);
                    meshoffset += nVtx * 4;
                    let vnArray = new Float32Array(result, meshoffset + dataView.byteOffset, nNormal);
                    meshoffset += nNormal * 4;
                    let triArray = new Uint32Array(result, meshoffset + dataView.byteOffset, nTri);
                    meshoffset += nTri * 4;

                    let uvArray;
                    //if (header.version >= 305 && nUV > 0) {
                    if (nUV > 0) {
                        //uvArray = new Float64Array(result, meshoffset + dataView.byteOffset, nUV);
                        //meshoffset += nUV * 8;
                        uvArray = new Float32Array(result, meshoffset + dataView.byteOffset, nUV);
                        meshoffset += nUV * 4;
                    }

                    let object = view.Data.Object3D();
                    object.index = meshBlockId;

                    object.id_file = file.Key;
                    object.link = file.Url;
                    // 데이터 추출
                    object.attribs.a_index.array = triArray;
                    object.numElements = object.attribs.a_index.array.length;

                    object.attribs.a_position.array = vtArray;
                    object.attribs.a_normal.array = vnArray;

                    //Matrix Index 기본값으로 등록
                    if (view.DemoType === 2) {
                        let matrixIdxArray = new Uint16Array(vnArray.length);
                        for (let j = 0; j < vnArray.length; j++) {
                            matrixIdxArray[j] = 0;
                        }

                        object.attribs.a_matrixIndex.array = matrixIdxArray;
                    }

                    if (nUV > 0 && view.UV_DEBUG) {
                        object.attribs.a_uv.array = uvArray;
                    }

                    //데이터 제외 테스트
                    //object.numElements = 0;
                    //object.attribs.a_index.array = [];
                    //object.attribs.a_position.array = [];
                    //object.attribs.a_normal.array = [];
                    //object.attribs.a_color.array = [];
                    let MeshSize = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let datas = [];
                    let colors = [];
                    let colorsOffset = 0;
                    for (let j = 0; j < MeshSize; j++) {
                        let partid = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                        let bodyid = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;

                        let origin_id = bodyid; //원본 Body ID

                        let m_vnIdx = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                        let m_triIdx = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;

                        let m_uvIdx = 0;
                        if (readUV) {
                            m_uvIdx = dataView.getUint32(meshoffset, true);
                            meshoffset += 4;
                        }

                        let MnVtx = dataView.getUint16(meshoffset, true);
                        meshoffset += 2;
                        let MnTri = dataView.getUint16(meshoffset, true);
                        meshoffset += 2;

                        let MnUV = 0;
                        if (readUV) {
                            MnUV = dataView.getUint32(meshoffset, true);
                            meshoffset += 4;
                        }

                        // (meshoffset + dataView.byteOffset)가 4의 배수여야 함
                        let bbox = new Float32Array(dataView.buffer, meshoffset + dataView.byteOffset, 6);
                        //let bbox = new Float32Array(dataView.buffer, meshoffset, 6);
                        meshoffset += 24;


                        //test 형상 제거
                        //m_vnIdx = 0;
                        //m_triIdx = 0;
                        //MnVtx = 0;
                        //MnTri = 0;

                        let data;
                        let bodyAction;
                        if (view.UV_DEBUG) {

                            let bboxTmp = new VIZCore.BBox(bbox);
                            data = {
                                partId: partid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                                bodyId: bodyid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                                origin_id: origin_id,

                                color: color,
                                material: -1,
                                m_vnIdx: m_vnIdx * 3,
                                m_triIdx: m_triIdx * 3,
                                m_uvIdx: m_uvIdx * 2,

                                m_nVtx: MnVtx * 3,
                                m_nTris: MnTri * 3,
                                m_nUV: MnUV * 2,

                                BBox: bboxTmp,

                                colorIdx: null,
                                object: null
                            };

                            //if (view.DemoType === 4) {
                            //    data.action.material = materialItem.id;
                            //}
                            //if (materialItem !== undefined)
                            //    data.action.material = materialItem.id;

                            bodyAction = view.Data.ShapeAction.GetAction(file.Key, origin_id);
                            if (bodyAction === undefined) {
                                bodyAction = view.Data.ActionItem();
                            }

                            bodyAction.material = materialID;

                        }
                        else if (view.DemoType === 3) {
                            //let action = view.Data.ActionItem();
                            let bboxTmp = new VIZCore.BBox(bbox);
                            
                            if (file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/BIKE.vizw") === 0
                                || file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/BUS.vizw") === 0
                                || file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/CAR_A.vizw") === 0
                                || file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/CAR_B.vizw") === 0
                            ) {
                                //action.transform.translate(5568841, 2850092, 50573);
                                //bboxTmp.min.x += 5568841;
                                //bboxTmp.min.y += 2850092;
                                //bboxTmp.min.z += 50573;
                                //bboxTmp.max.x += 5568841;
                                //bboxTmp.max.y+= 2850092;
                                //bboxTmp.max.z += 50573;
                                //bboxTmp.update();
                            }
                            data = {
                                partId: partid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                                bodyId: bodyid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                                origin_id: origin_id,

                                color: color,
                                material: -1,
                                m_vnIdx: m_vnIdx * 3,
                                m_triIdx: m_triIdx * 3,
                                //m_uvIdx: m_uvIdx * 2,

                                m_nVtx: MnVtx * 3,
                                m_nTris: MnTri * 3,
                                //m_nUV: MnUV * 2,

                                BBox: bboxTmp,
                                //action: action,

                                colorIdx: null,
                                object: null
                            };

                            bodyAction = view.Data.ShapeAction.GetAction(file.Key, origin_id);
                            if (bodyAction === undefined) {
                                bodyAction = view.Data.ActionItem();
                            }

                        }
                        else {
                            data = {
                                partId: partid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                                bodyId: bodyid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                                origin_id: origin_id,

                                color: color,
                                //material: materialItem.id,
                                m_vnIdx: m_vnIdx * 3,
                                m_triIdx: m_triIdx * 3,
                                //m_uvIdx: m_uvIdx * 2,

                                m_nVtx: MnVtx * 3,
                                m_nTris: MnTri * 3,
                                //m_nUV: MnUV * 2,

                                BBox: new VIZCore.BBox(bbox),
                                //action: view.Data.ActionItem(),

                                colorIdx: null,
                                object: null
                            };

                            bodyAction = view.Data.ShapeAction.GetAction(file.Key, origin_id);
                            if (bodyAction === undefined) {
                                bodyAction = view.Data.ActionItem();
                            }

                        }

                        if (bodyAction !== undefined && bodyAction.customColor) {
                            //비어있는 사용자 색상 및 투명도 설정
                            if (bodyAction.color !== undefined) {
                                if (bodyAction.color.r === undefined) {
                                    bodyAction.color.r = color.r;
                                }
                                if (bodyAction.color.g === undefined) {
                                    bodyAction.color.g = color.g;
                                }
                                if (bodyAction.color.b === undefined) {
                                    bodyAction.color.b = color.b;
                                }
                                if (bodyAction.color.a === undefined) {
                                    bodyAction.color.a = color.a;
                                }
                            }
                        }

                        if (file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/BIKE.vizw") === 0) {
                            data.partid = view.Animation.GetAnimationBodyID(file.Url);
                            data.bodyId = view.Animation.GetAnimationBodyID(file.Url);
                        }
                        else if (file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/BUS.vizw") === 0) {
                            data.partid = view.Animation.GetAnimationBodyID(file.Url);
                            data.bodyId = view.Animation.GetAnimationBodyID(file.Url);
                        }
                        else if (file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/CAR_A.vizw") === 0) {
                            data.partid = view.Animation.GetAnimationBodyID(file.Url);
                            data.bodyId = view.Animation.GetAnimationBodyID(file.Url);
                            if (data.bodyId < 200020)
                                console.log("");
                        }
                        else if (file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/CAR_B.vizw") === 0) {
                            data.partid = view.Animation.GetAnimationBodyID(file.Url);
                            data.bodyId = view.Animation.GetAnimationBodyID(file.Url);
                        }

                        // 색상 ID 재설정
                        view.Data.IDColor.new();
                        //data.action.transform.setPosition(view.Data.TmpTransform);
                        //rgb
                        //data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16);
                        //rgba
                        data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16) + (view.Data.IDColor.a * 16777216); //<< 24

                        //let colorArrLength = data.m_nVtx;
                        let colorArrLength = data.m_nVtx / 3 * 4; //vectex 3, color는 4
                        for (let k = 0; k < colorArrLength; k = k + 4) {
                            colors[colorsOffset + k + 0] = view.Data.IDColor.r;
                            colors[colorsOffset + k + 1] = view.Data.IDColor.g;
                            colors[colorsOffset + k + 2] = view.Data.IDColor.b;
                            colors[colorsOffset + k + 3] = view.Data.IDColor.a;
                        }
                        colorsOffset += colorArrLength;

                        data.object = object;
                        datas.push(data);
                        view.Data.AddBody(data);

                        //Action 데이터 설정
                        {
                            //파일 읽는 부분에서 material 등록이 있기때문에 등록 필요
                            view.Data.ShapeAction.SetAction(file.Key, origin_id, bodyAction);
                        }

                        if (view.DemoType === 2) {
                            //Hyundai vizw 바운드 박스 크기가 달라 새로 구함

                            let aabb = view.MeshProcess.GetAABBFromMatrix([data]);
                            data.BBox = aabb;
                        }
                    }
                    //newPos(view.Data.TmpTransform, 30, 300);

                    object.attribs.a_color.array = new Uint8Array(colors, 0, colorsOffset);
                    //object.attribs.a_color.array = new Float32Array(colors, 0, vtArray.length); 

                    view.Data.Objects.push(object);
                    object.tag = datas;

                    if (view.DataSplit !== 0) {
                        let fileAreaData = view.Data.ModelFileManager.GetFileAreaData(file.Key, file.Url);
                        fileAreaData.objects.push(object);
                    }

                    meshBlockId++;
                }
            }

            function copyMeshBlock(dataView, idOffset) {

                // 파일 아이디 재설정
                file.ID += idOffset;

                let meshoffset = 0;
                let MeshBlockSize;
                MeshBlockSize = dataView.getInt32(meshoffset, true);
                meshoffset += 4;

                for (let i = 0; i < MeshBlockSize; i++) {
                    let color = new VIZCore.Color();
                    color.r = dataView.getUint8(meshoffset, true);
                    color.g = dataView.getUint8(meshoffset + 1, true);
                    color.b = dataView.getUint8(meshoffset + 2, true);
                    color.a = dataView.getUint8(meshoffset + 3, true);

                    meshoffset += 4;

                    let nVtx = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nNormal = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nTri = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nUV = 0;
                    if (header.version >= 305) {
                        nUV = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                    }

                    //material 등록
                    let materialItem;
                    let roughness = 0.5;
                    let metallic = 0;
                    let materialId = 0;

                    if (view.Loader.parsetype === 1) {
                        let ptype = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                    }

                    //let cnt = nVtx / 15;
                    // (meshoffset + dataView.byteOffset)가 4의 배수여야 함
                    let vtArray = new Float32Array(result, meshoffset + dataView.byteOffset, nVtx);
                    meshoffset += nVtx * 4;
                    let vnArray = new Float32Array(result, meshoffset + dataView.byteOffset, nNormal);
                    meshoffset += nNormal * 4;
                    let triArray = new Uint32Array(result, meshoffset + dataView.byteOffset, nTri);
                    meshoffset += nTri * 4;

                    let uvArray;
                    if (header.version >= 305 && nUV > 0) {
                        //uvArray = new Float64Array(result, meshoffset + dataView.byteOffset, nUV);
                        //meshoffset += nUV * 8;
                        uvArray = new Float32Array(result, meshoffset + dataView.byteOffset, nUV);
                        meshoffset += nUV * 4;
                    }

                    let object = view.Data.Object3D();
                    object.index = meshBlockId;
                    //object.link = file.Url;
                    // 데이터 추출
                    object.attribs.a_index.array = triArray;
                    object.numElements = object.attribs.a_index.array.length;

                    object.attribs.a_position.array = vtArray;
                    object.attribs.a_normal.array = vnArray;

                    if (nUV > 0 && view.UV_DEBUG) {
                        object.attribs.a_uv.array = uvArray;
                    }

                    let MeshSize = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let datas = [];
                    let colors = [];
                    let colorsOffset = 0;
                    for (let j = 0; j < MeshSize; j++) {
                        let partid = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                        let bodyid = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;

                        let m_vnIdx = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                        let m_triIdx = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;

                        let m_uvIdx = 0;
                        if (header.version >= 305) {
                            m_uvIdx = dataView.getUint32(meshoffset, true);
                            meshoffset += 4;
                        }

                        let MnVtx = dataView.getUint16(meshoffset, true);
                        meshoffset += 2;
                        let MnTri = dataView.getUint16(meshoffset, true);
                        meshoffset += 2;

                        let MnUV = 0;
                        if (header.version >= 305) {
                            MnUV = dataView.getUint32(meshoffset, true);
                            meshoffset += 4;
                        }

                        // (meshoffset + dataView.byteOffset)가 4의 배수여야 함
                        let bbox = new Float32Array(dataView.buffer, meshoffset + dataView.byteOffset, 6);
                        //let bbox = new Float32Array(dataView.buffer, meshoffset, 6);
                        meshoffset += 24;

                        if (view.UV_DEBUG) {
                            let data = {
                                partId: partid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                                bodyId: bodyid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),

                                color: color,
                                material: materialItem.id,
                                m_vnIdx: m_vnIdx * 3,
                                m_triIdx: m_triIdx * 3,
                                m_uvIdx: m_uvIdx * 2,

                                m_nVtx: MnVtx * 3,
                                m_nTris: MnTri * 3,
                                m_nUV: MnUV * 2,

                                BBox: new VIZCore.BBox(bbox),
                                //action: view.Data.ActionItem(),

                                colorIdx: null,
                                object: null
                            };

                            // 색상 ID 재설정
                            view.Data.IDColor.new();
                            //data.action.transform.setPosition(view.Data.TmpTransform);
                            //rgb
                            //data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16);
                            //rgba
                            data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16) + (view.Data.IDColor.a * 16777216); //<< 24

                            //let colorArrLength = data.m_nVtx;
                            let colorArrLength = data.m_nVtx / 3 * 4; //vectex 3, color는 4
                            for (let k = 0; k < colorArrLength; k = k + 4) {
                                colors[colorsOffset + k + 0] = view.Data.IDColor.r;
                                colors[colorsOffset + k + 1] = view.Data.IDColor.g;
                                colors[colorsOffset + k + 2] = view.Data.IDColor.b;
                                colors[colorsOffset + k + 3] = view.Data.IDColor.a;
                            }
                            colorsOffset += colorArrLength;

                            data.object = object;
                            datas.push(data);
                            view.Data.AddBody(data);
                        }
                        else {
                            let data = {
                                partId: partid + view.Data.GetStartID(file.Key) + idOffset * 10000,//view.Data.GetMaxID(),
                                bodyId: bodyid + view.Data.GetStartID(file.Key) + idOffset * 10000,//view.Data.GetMaxID(),
                                color: color,
                                //material: materialItem.id,
                                m_vnIdx: m_vnIdx * 3,
                                m_triIdx: m_triIdx * 3,
                                //m_uvIdx: m_uvIdx * 2,

                                m_nVtx: MnVtx * 3,
                                m_nTris: MnTri * 3,
                                //m_nUV: MnUV * 2,

                                BBox: new VIZCore.BBox(bbox),
                                //action: view.Data.ActionItem(),

                                colorIdx: null,
                                object: null
                            };

                            // 색상 ID 재설정
                            view.Data.IDColor.new();
                            let tmpPosition;
                            let offsetX = 0;
                            let offsetY = 0;
                            let offValueX = 1;
                            let offValueY = 1;
                            if (idOffset < 5) {
                                offsetX = 20000;
                                offsetY = 0;
                                offValueX = idOffset;
                                offValueY = 1;
                            }
                            else {
                                offsetX = 20000;
                                offsetY = 90000;
                                offValueX = idOffset % 5;
                                offValueY = 1;
                            }

                            tmpPosition = new VIZCore.Vector3(offsetX * offValueX, offsetY * offValueY, 0);

                            //rgb
                            //data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16);
                            //rgba
                            data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16) + (view.Data.IDColor.a * 16777216); //<< 24

                            //let colorArrLength = data.m_nVtx;
                            let colorArrLength = data.m_nVtx / 3 * 4; //vectex 3, color는 4
                            for (let k = 0; k < colorArrLength; k = k + 4) {
                                colors[colorsOffset + k + 0] = view.Data.IDColor.r;
                                colors[colorsOffset + k + 1] = view.Data.IDColor.g;
                                colors[colorsOffset + k + 2] = view.Data.IDColor.b;
                                colors[colorsOffset + k + 3] = view.Data.IDColor.a;
                            }
                            colorsOffset += colorArrLength;

                            data.object = object;
                            datas.push(data);
                            view.Data.AddBody(data);

                            //if (data.bodyId % 10000 === 298)
                            if (view.DemoType === 2) {
                                //Hyundai vizw 바운드 박스 크기가 달라 새로 구함

                                let aabb = view.MeshProcess.GetAABBFormMatrix([data]);
                                data.BBox = aabb;
                            }

                            //data.BBox.min.add(tmpPosition);
                            //data.BBox.max.add(tmpPosition);

                            //action 로직 수정
                            //data.action.transform.setPosition(tmpPosition);
                            //data.action.instance.setPosition(tmpPosition);
                        }


                    }
                    //newPos(view.Data.TmpTransform, 30, 300);

                    object.attribs.a_color.array = new Uint8Array(colors, 0, colorsOffset);
                    //object.attribs.a_color.array = new Float32Array(colors, 0, vtArray.length); 

                    view.Data.Objects.push(object);
                    object.tag = datas;

                    if (view.DataSplit !== 0) {
                        let fileAreaData = view.Data.ModelFileManager.GetFileAreaData(file.Key, file.Url);
                        fileAreaData.objects.push(object);
                    }

                    meshBlockId++;
                }
            }

            function ImportStructure(dataView, toc) {
                let offset = 0;
                let m_Unit = dataView.getUint32(offset, true);
                offset += 4;
                let nEnts = dataView.getUint32(offset, true);
                offset += 4;
                let vdBlockSize = dataView.getUint32(offset, true);
                offset += 4;

                let m_vecPropHeaderDic = []; // 136 Byte
                let m_vecPropHeaderNameIndexDic = [];
                for (let i = 0; i < vdBlockSize; i++) {
                    //HeaderTocTableItem = {
                    //    index: -1,
                    //    itemType: 0,
                    //    entFlags: 0,
                    //    iNameIndex: -1,
                    //    attFlags: 0,
                    //    transfrom: [],
                    //    bBox: [],
                    //    BBox: null,
                    //    cCount: -1,
                    //    pIndex: -1,
                    //    orgNodeID: -1,
                    //    pNameBuff: null,
                    //    tocId: 0,
                    //    btype: 0,
                    //    name: null
                    //};

                    //간소화
                    let HeaderTocTableItem = view.Data.NodeItem();

                    let index = dataView.getUint32(offset, true);
                    HeaderTocTableItem.origin_id = index;
                    HeaderTocTableItem.index = index === -1 ? index : index + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                    offset += 4;
                    HeaderTocTableItem.itemType = dataView.getInt32(offset, true);
                    offset += 4;
                    //HeaderTocTableItem.entFlags = dataView.getUint16(offset, true);
                    offset += 4;
                    //HeaderTocTableItem.iNameIndex = dataView.getInt32(offset, true);
                    let iNameIndex = dataView.getInt32(offset, true);
                    offset += 4;
                    //HeaderTocTableItem.attFlags = dataView.getUint16(offset, true);
                    offset += 4;
                    //HeaderTocTableItem.transfrom = [];
                    for (let j = 0; j < 16; j++) {
                        //HeaderTocTableItem.transfrom[j] = dataView.getFloat32(offset, true);
                        offset += 4;
                    }
                    //HeaderTocTableItem.bBox = [];
                    for (let k = 0; k < 6; k++) {
                        //HeaderTocTableItem.bBox[k] = dataView.getFloat32(offset, true);
                        offset += 4;
                    }

                    //HeaderTocTableItem.BBox = new VIZCore.BBox(HeaderTocTableItem.bBox);

                    //HeaderTocTableItem.cCount = dataView.getInt32(offset, true);
                    offset += 4;
                    let pIndex = dataView.getInt32(offset, true);
                    HeaderTocTableItem.origin_pid = pIndex;
                    HeaderTocTableItem.pIndex = pIndex === -1 ? pIndex : pIndex + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                    offset += 4;
                    //HeaderTocTableItem.orgNodeID = dataView.getInt32(offset, true);
                    offset += 4;
                    //byte * pNameBuff;
                    if (header.version < 302)
                        offset += 8;

                    //HeaderTocTableItem.tocId = dataView.getInt32(offset, true); //Binary Block용 
                    offset += 4;
                    //HeaderTocTableItem.btype = dataView.getInt32(offset, true);//Binary Block용 
                    offset += 4;

                    // add
                    if (HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntAssembly
                        && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntPart
                        && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntBody) {
                        nEnts--;
                        continue;
                    }

                    m_vecPropHeaderDic.push(HeaderTocTableItem);
                    m_vecPropHeaderNameIndexDic.push(iNameIndex);
                }

                //ModelFileManager 방식으로 변경
                //view.Data.AddNodes(m_vecPropHeaderDic);

                // NodeName
                let nNameNum = dataView.getInt32(offset, true);
                offset += 4;
                let decode_utf8 = function (s) {
                    try {
                        return decodeURIComponent(escape(s));
                    }
                    catch (e) {
                        return s;
                    }
                };
                let m_vecPropNodeNameDic = [];

                let stNameOffset = offset;
                let pos = 0;
                //이름 적용
                for (let l = 0; l < nEnts; l++) {
                    if (m_vecPropHeaderNameIndexDic[l] <= 0)
                        continue;

                    let NameTocTableItem = {
                        nStringNum: 0,
                        pos: 0,
                        name: null
                    };

                    NameTocTableItem.pos = pos;
                    NameTocTableItem.nStringNum = m_vecPropHeaderNameIndexDic[l];

                    let bodyNameBuffer = new Uint8Array(NameTocTableItem.nStringNum);
                    for (let m = 0; m < NameTocTableItem.nStringNum; m++) {
                        // Multibyte
                        //if(m%2 ===0)
                        //    bodyNameBuffer[m/2] = dataView.getUint8(pos + stNameOffset + m, true);
                        bodyNameBuffer[m] = dataView.getUint8(pos + stNameOffset + m, true);
                    }

                    let bodyName = String.fromCharCode.apply(null, bodyNameBuffer);
                    bodyName = decode_utf8(bodyName);

                    //[정규식 이용해서 gi 로 감싸기]
                    //감싼 따옴표를 슬래시로 대체하고 뒤에 gi 를 붙이면 
                    //replaceAll 과 같은 결과를 볼 수 있다.
                    //* g : 발생할 모든 pattern에 대한 전역 검색
                    //* i : 대 / 소문자 구분 안함
                    //* m: 여러 줄 검색(참고)

                    m_vecPropHeaderDic[l].name = bodyName.replace(/\0/gi, '');
                    NameTocTableItem.name = bodyName.replace(/\0/gi, '');
                    pos += m_vecPropHeaderNameIndexDic[l];

                    //기존
                    //m_vecPropNodeNameDic.push(NameTocTableItem);

                    //
                    m_vecPropNodeNameDic[l] = NameTocTableItem;
                }
                offset += nNameNum;

                //Binary 방식으로 적용하여 header vizw와 동일하게 사용하도록 변경
                {
                    // // 하위에서 부모 노드를 찾기 위한 Offset
                    // Tree_Parent_Offset: 0,
                    // // 최하위 자식 노드 Offset
                    // Tree_Last_Offset: 4,
                    // // 동일레벨 마지막 노드 Offset
                    // Tree_Sibling_Offset: 8,
                    // // 트리 레벨
                    // Tree_Level: 12,
                    // // 트리 확장 정보
                    // //Tree_Expand: 16,
                    // // 트리 이름 Offset
                    // Tree_Neme_Offset: 16,
                    // // 트리 이름 크기
                    // Tree_Name_Lengh: 20,
                    // // 노드 아이디
                    // Node_ID: 24,
                    // // 노드 타입
                    // Node_Type: 28

                    let getTreeBufferInfoItem = function () {
                        let item = {
                            readIdx: -1,   //읽은 데이터

                            index: -1,
                            offset: -1,

                            parentOffset: -1,
                            lastOffset: -1,
                            siblingOffset: -1,
                            level: 0,

                            expand: 0,

                            nameOffset: 0,
                            nameLength: 0,

                            node_id: 0,
                            node_type: 0,


                            //검색용
                            parent: undefined,
                            child: []
                        }

                        return item;
                    };

                    let currentListNodeID = [];
                    let currentListIndexByID = [];

                    let treeSize = 8; // 트리정보 Size_0x00010000 초기 버전으로 적용
                    let treeBufferSize = 32;


                    let mapBufferInfo = new Map();  //nodeID, idx
                    let listBufferInfo = [];

                    //BufferInfo 초기값 설정
                    for (let i = 0; i < vdBlockSize; i++) {
                        let headerTocTableItem = m_vecPropHeaderDic[i];
                        if (headerTocTableItem === undefined)
                            continue;

                        let bufferInfo = getTreeBufferInfoItem();
                        bufferInfo.readIdx = i;

                        bufferInfo.node_id = headerTocTableItem.origin_id;
                        bufferInfo.node_type = headerTocTableItem.itemType;

                        //treeOffset += treeSize;
                        listBufferInfo[i] = bufferInfo;

                        mapBufferInfo.set(bufferInfo.node_id, i);
                    }

                    //상위, 하위 구조 연결
                    for (let i = 0; i < vdBlockSize; i++) {
                        let headerTocTableItem = m_vecPropHeaderDic[i];

                        if (headerTocTableItem === undefined)
                            continue;

                        let bufferInfo = listBufferInfo[i];

                        //부모 연결 및 하위 연결
                        if (mapBufferInfo.has(headerTocTableItem.origin_pid)) {
                            let parentBufferInfo = listBufferInfo[mapBufferInfo.get(headerTocTableItem.origin_pid)];

                            bufferInfo.parent = parentBufferInfo;
                            //bufferInfo.parentOffset = parentBufferInfo.offset;

                            parentBufferInfo.child.push(bufferInfo);
                        }
                    }

                    //순서 정렬
                    {
                        let listSortBufferInfo = [];
                        let sortBufferInfo = function (bufferInfo) {
                            listSortBufferInfo.push(bufferInfo);

                            for (let i = 0; i < bufferInfo.child.length; i++)
                                sortBufferInfo(bufferInfo.child[i]);
                        };

                        for (let i = 0; i < listBufferInfo.length; i++) {
                            let bufferInfo = listBufferInfo[i];
                            if (bufferInfo.parent !== undefined) continue;

                            sortBufferInfo(bufferInfo);
                        }

                        listBufferInfo = listSortBufferInfo;
                    }

                    //정렬된 개체 index 및 Offset
                    for (let i = 0; i < listBufferInfo.length; i++) {
                        let bufferInfo = listBufferInfo[i];

                        bufferInfo.index = i;
                        bufferInfo.offset = i * treeBufferSize;
                    }


                    let findInfoLevel = function (bufferInfo, parentBufferInfo) {
                        if (parentBufferInfo.parent === undefined) return;

                        bufferInfo.level++;
                        findInfoLevel(bufferInfo, parentBufferInfo.parent);
                    };

                    let findLastChildBufferOffset = function (bufferInfo) {

                        if (bufferInfo.child.length > 0) {
                            return findLastChildBufferOffset(bufferInfo.child[bufferInfo.child.length - 1]);
                        }
                        else {
                            return bufferInfo.offset;
                        }
                    };

                    //상위 계산
                    //하위 Buffer 계산
                    for (let i = 0; i < listBufferInfo.length; i++) {
                        let bufferInfo = listBufferInfo[i];

                        //상위 Offset
                        if (bufferInfo.parent !== undefined)
                            bufferInfo.parentOffset = bufferInfo.parent.offset;

                        findInfoLevel(bufferInfo, bufferInfo);

                        if (bufferInfo.child.length > 0) {
                            bufferInfo.siblingOffset = bufferInfo.child[bufferInfo.child.length - 1].offset;
                            bufferInfo.lastOffset = findLastChildBufferOffset(bufferInfo);
                        }
                        else {
                            bufferInfo.siblingOffset = bufferInfo.offset;
                            bufferInfo.lastOffset = bufferInfo.offset;
                        }
                    }

                    //이름 버퍼 입력
                    let treeNameBufferOffset = 0;

                    //트리구조 버퍼 생성
                    let treeOffset = 0;
                    let treeBuffer = new ArrayBuffer(vdBlockSize * treeBufferSize);
                    let arrInt = new Int32Array(treeBuffer, 0, vdBlockSize * treeSize); //4 * 9

                    treeNameBufferOffset = 0;
                    let treeNameBuffer = new ArrayBuffer(nNameNum);
                    let arrNameInt8 = new Uint8Array(treeNameBuffer, 0, nNameNum);

                    for (let i = 0; i < listBufferInfo.length; i++) {
                        let bufferInfo = listBufferInfo[i];
                        //let bodyNameBuffer = new Uint8Array(bufferInfo.nameLength);
                        //let bodyNameBuffer = new Uint8Array(dataView.buffer, treeNameBufferOffset + stNameOffset, bufferInfo.nameLength);

                        if (m_vecPropNodeNameDic[bufferInfo.readIdx] !== undefined) {
                            let vecNodeName = m_vecPropNodeNameDic[bufferInfo.readIdx];
                            let utf8 = unescape(encodeURIComponent(vecNodeName.name));

                            let bodyNameBuffer = new ArrayBuffer(utf8.length); // 2 bytes for each char
                            let bufView = new Uint8Array(bodyNameBuffer);
                            for (let j = 0, strLen = utf8.length; j < strLen; j++) {
                                bufView[j] = utf8.charCodeAt(j);
                            }

                            //UTF-8 아닌경우가 있어서 재 계산 하여 추가

                            //재 계산된 offset
                            bufferInfo.nameOffset = treeNameBufferOffset;
                            bufferInfo.nameLength = utf8.length;

                            arrNameInt8.set(bufView, treeNameBufferOffset);
                            treeNameBufferOffset += bufferInfo.nameLength;
                        }

                        arrInt.set([
                            bufferInfo.parentOffset,
                            bufferInfo.lastOffset,
                            bufferInfo.siblingOffset,
                            bufferInfo.level,

                            bufferInfo.nameOffset,
                            bufferInfo.nameLength,
                            bufferInfo.node_id,
                            bufferInfo.node_type
                        ], treeOffset);
                        treeOffset += treeSize;

                        currentListNodeID[i] = bufferInfo.node_id;
                        currentListIndexByID[bufferInfo.node_id] = i;
                    }

                    //Structure 추가 완료
                    {
                        let fileInfo = view.Data.ModelFileManager.GetFileInfo(file.Key);
                        //let fileDataInfo = view.Data.ModelFileManager.AddFileDataInfo(fileInfo, VIZCore.Enum.FILEINFOTYPE.STRUCTURE, VIZCore.Enum.FILEINFOTYPE.STRUCTURE);
                        let fileDataInfo = view.Data.ModelFileManager.AddFileDataInfo(fileInfo, file.Key, VIZCore.Enum.FILEINFOTYPE.STRUCTURE);

                        if (fileDataInfo !== undefined) {
                            let binaryInfo = view.Data.TreeBinaryInfoItem();

                            binaryInfo.key = file.Key;
                            //binaryInfo.idx_start = nodeCnt;
                            //binaryInfo.idx_end = nodeCnt + cnt;
                            binaryInfo.idx_start = 0;
                            binaryInfo.idx_end = vdBlockSize;
                            binaryInfo.offset_start = 0;
                            //binaryInfo.info = viewStructureInfo;
                            binaryInfo.structure = new DataView(treeBuffer);
                            binaryInfo.name = new DataView(treeNameBuffer);
                            binaryInfo.size = treeBufferSize;

                            binaryInfo.listNodeID = currentListNodeID;
                            binaryInfo.listIndexByID = currentListIndexByID;

                            fileDataInfo.tag = binaryInfo;

                            fileInfo.listNodeID = currentListNodeID;
                            fileInfo.listIndexByID = currentListIndexByID;

                            //노드 Index 갱신
                            fileDataInfo.Download = true;
                        }
                    }

                }

                loaded_Structure = true;
                checkLoaded();
            }

            function ImportSplitStructure(dataView, toc) {
                let offset = 0;
                let vdBlockSize = dataView.getUint32(offset, true);
                offset += 4;

                let decode_utf8 = function (s) {
                    try {
                        return decodeURIComponent(escape(s));
                    }
                    catch (e) {
                        return s;
                    }
                };

                let m_vecPropHeaderDic = []; // 136 Byte

                switch (view.DataSplit) {
                    //간소화 분할구조
                    case 2:
                        {
                            for (let i = 0; i < vdBlockSize; i++) {
                                //HeaderTocTableItem = {
                                //    index: -1,
                                //    itemType: 0,
                                //    entFlags: 0,
                                //    iNameIndex: -1,
                                //    attFlags: 0,
                                //    transfrom: [],
                                //    bBox: [],
                                //    BBox: null,
                                //    cCount: -1,
                                //    pIndex: -1,
                                //    orgNodeID: -1,
                                //    pNameBuff: null,
                                //    tocId: 0,
                                //    btype: 0,
                                //    name: null
                                //};

                                let HeaderTocTableItem = view.Data.NodeItem();
                                //let HeaderTocTableItem = {
                                //    index: -1,
                                //    itemType: 0,
                                //    pIndex: -1,
                                //    name: null,
                                //    sub: [],
                                //};

                                //let HeaderTocTableItem = new view.Data.StructureItem();

                                //let HeaderTocTableItem = new view.Data.TableItem(-1, 0, -1, null);

                                let index = dataView.getUint32(offset, true);
                                HeaderTocTableItem.index = index === -1 ? index : index + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                                offset += 4;
                                HeaderTocTableItem.itemType = dataView.getInt32(offset, true);
                                offset += 4;

                                let pIndex = dataView.getInt32(offset, true);
                                HeaderTocTableItem.pIndex = pIndex === -1 ? pIndex : pIndex + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                                offset += 4;

                                // add
                                if (HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntAssembly
                                    && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntPart
                                    && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntBody) {
                                    //nEnts--;
                                    continue;
                                }

                                //m_vecPropHeaderDic.push(HeaderTocTableItem);
                                view.Data.AddNode(HeaderTocTableItem);
                            }
                        }
                        break;

                    //분할구조
                    default:
                        {
                            for (let i = 0; i < vdBlockSize; i++) {
                                //HeaderTocTableItem = {
                                //    index: -1,
                                //    itemType: 0,
                                //    entFlags: 0,
                                //    iNameIndex: -1,
                                //    attFlags: 0,
                                //    transfrom: [],
                                //    bBox: [],
                                //    BBox: null,
                                //    cCount: -1,
                                //    pIndex: -1,
                                //    orgNodeID: -1,
                                //    pNameBuff: null,
                                //    tocId: 0,
                                //    btype: 0,
                                //    name: null
                                //};

                                //간소화.
                                let HeaderTocTableItem = view.Data.NodeItem();
                                //let HeaderTocTableItem = {
                                //    index: -1,
                                //    itemType: 0,
                                //    pIndex: -1,
                                //    name: null,
                                //    sub: []
                                //};

                                let index = dataView.getUint32(offset, true);
                                HeaderTocTableItem.index = index === -1 ? index : index + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                                offset += 4;
                                HeaderTocTableItem.itemType = dataView.getInt32(offset, true);
                                offset += 4;
                                //HeaderTocTableItem.entFlags = dataView.getUint16(offset, true);
                                offset += 2;

                                //HeaderTocTableItem.iNameIndex = dataView.getInt32(offset, true);
                                let iNameIndex = dataView.getInt32(offset, true);
                                offset += 4;

                                //Name
                                if (iNameIndex > 0) {
                                    let bodyNameBuffer = new Uint8Array(iNameIndex);
                                    for (let m = 0; m < iNameIndex; m++) {
                                        // Multibyte
                                        //if(m%2 ===0)
                                        //    bodyNameBuffer[m/2] = dataView.getUint8(pos + offset + m, true);
                                        bodyNameBuffer[m] = dataView.getUint8(offset + m, true);
                                    }

                                    let bodyName = String.fromCharCode.apply(null, bodyNameBuffer);
                                    bodyName = decode_utf8(bodyName);

                                    //[정규식 이용해서 gi 로 감싸기]
                                    //감싼 따옴표를 슬래시로 대체하고 뒤에 gi 를 붙이면 
                                    //replaceAll 과 같은 결과를 볼 수 있다.
                                    //* g : 발생할 모든 pattern에 대한 전역 검색
                                    //* i : 대 / 소문자 구분 안함
                                    //* m: 여러 줄 검색(참고)

                                    HeaderTocTableItem.name = bodyName.replace(/\0/gi, '');
                                }
                                offset += iNameIndex;

                                //HeaderTocTableItem.attFlags = dataView.getUint16(offset, true);
                                offset += 2;
                                //HeaderTocTableItem.transfrom = [];
                                for (let j = 0; j < 16; j++) {
                                    //HeaderTocTableItem.transfrom[j] = dataView.getFloat32(offset, true);
                                    offset += 4;
                                }
                                //HeaderTocTableItem.bBox = [];
                                for (let k = 0; k < 6; k++) {
                                    //HeaderTocTableItem.bBox[k] = dataView.getFloat32(offset, true);
                                    offset += 4;
                                }

                                //HeaderTocTableItem.BBox = new VIZCore.BBox(HeaderTocTableItem.bBox);

                                //HeaderTocTableItem.cCount = dataView.getInt32(offset, true);
                                offset += 4;
                                let pIndex = dataView.getInt32(offset, true);
                                HeaderTocTableItem.pIndex = pIndex === -1 ? pIndex : pIndex + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                                offset += 4;
                                //HeaderTocTableItem.orgNodeID = dataView.getInt32(offset, true);
                                offset += 4;
                                //byte * pNameBuff;
                                if (header.version < 302)
                                    offset += 8;

                                //HeaderTocTableItem.tocId = dataView.getInt32(offset, true); //Binary Block용 
                                offset += 4;
                                //HeaderTocTableItem.btype = dataView.getInt32(offset, true);//Binary Block용 
                                offset += 4;

                                // add
                                if (HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntAssembly
                                    && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntPart
                                    && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntBody) {
                                    //nEnts--;
                                    continue;
                                }

                                //m_vecPropHeaderDic.push(HeaderTocTableItem);
                                view.Data.AddNode(HeaderTocTableItem);
                            }
                        }
                        break;
                }

                //view.Data.AddNodes(m_vecPropHeaderDic);

                loaded_Structure = true;
                checkLoaded();
            }

            /**
            * ImportSplitFile
            * @returns {[]} [0]:splitType, [1]:structureNum, [2]:meshBlockNum, [3]:UDANum, [4]:unit
            */
            function ImportSplitFile(dataView, toc) {
                let offset = 0;

                let split_version = dataView.getInt32(offset, true);
                offset += 4;
                let split_type = dataView.getInt32(offset, true);
                //split_type = 1;
                offset += 4;

                let split_Structure = dataView.getInt32(offset, true);
                offset += 4;
                let split_MeshBlock = dataView.getInt32(offset, true);
                offset += 4;
                let split_UDA = dataView.getInt32(offset, true);
                offset += 4;
                let split_unit = dataView.getInt32(offset, true);
                offset += 4;

                return [split_type, split_Structure, split_MeshBlock, split_UDA, split_unit];
            }

            function ImportSplitAreaList(dataView, toc) {
                let offset = 0;

                let areaNum = dataView.getInt32(offset, true);
                offset += 4;

                let items = [];
                for (let ii = 0; ii < areaNum; ii++) {
                    let areaBBox = new Float32Array(dataView.buffer, offset + view.byteOffset, 6);
                    offset += 24;

                    let areaListNum = dataView.getInt32(offset, true);
                    offset += 4;

                    let areaList = new Int32Array(dataView.buffer, offset + view.byteOffset, areaListNum);
                    offset += 4 * areaListNum;

                    let AreaItem = {
                        bbox: new VIZCore.BBox(areaBBox),
                        list: areaList
                    };

                    items[ii] = AreaItem;
                }
                view.Data.AddAreaListMap(file.Url, items);
            }

            function GetNodeMaxID(dataView, toc) {
                let offset = 8;
                let vdBlockSize = dataView.getUint32(offset, true);
                offset += 4;
                let max = 0;
                for (let i = 0; i < vdBlockSize; i++) {
                    let index = dataView.getUint32(offset, true);
                    if (max < index)
                        max = index;

                    //offset += 32;
                    offset += 4;
                    offset += 4;
                    offset += 4;
                    offset += 4;
                    offset += 4;
                    for (let j = 0; j < 16; j++) {
                        offset += 4;
                    }
                    for (let k = 0; k < 6; k++) {
                        offset += 4;
                    }
                    offset += 4;
                    offset += 4;
                    offset += 4;
                    if (header.version < 302)
                        offset += 8;
                    offset += 4;
                    offset += 4;


                }
                return max;
            }

            function GetSplitFileNodeMaxID(dataView, toc) {
                let offset = 0;
                let vdBlockSize = dataView.getUint32(offset, true);
                offset += 4;
                let max = 0;

                switch (view.DataSplit) {
                    //간소화 분할구조
                    case 2:
                        {
                            for (let i = 0; i < vdBlockSize; i++) {
                                let index = dataView.getUint32(offset, true);
                                if (max < index)
                                    max = index;

                                offset += 12;
                            }
                        }
                        break;

                    //분할구조
                    default:
                        {
                            for (let i = 0; i < vdBlockSize; i++) {
                                let index = dataView.getUint32(offset, true);
                                if (max < index)
                                    max = index;

                                offset += 10;

                                let nNameNum = dataView.getInt32(offset, true);
                                offset += 4;
                                //byte * pNameBuff;
                                offset += nNameNum;

                                offset += 110;

                                //offset += 2;

                                //offset += 64;
                                //offset += 24;
                                //offset += 20;
                                if (header.version < 302)
                                    offset += 8;
                            }
                        }
                        break;
                }
                return max;
            }

            function LoadPropTableIndices(dataView, toc) {
                let offsetIndices = 0;
                let nTables = dataView.getUint32(offsetIndices, true);
                offsetIndices += 4;

                let m_nodePropTables = [];

                for (let p = 0; p < nTables; p++) {
                    let tidx = dataView.getUint32(offsetIndices, true);
                    offsetIndices += 4;

                    let PropTocTableItem = {
                        tableTocIdx: tidx,
                        nLoadedNodes: 0
                    };

                    m_nodePropTables.push(PropTocTableItem);
                }

                for (let pi = 0; pi < m_nodePropTables.length; pi++) {
                    let pti = m_nodePropTables[pi];
                    let tocProperty = m_toc[pti.tableTocIdx];
                    if (tocProperty === undefined) {
                        setTimeout(function () {
                            parseOnload(null, data);
                        }, 1);
                        return;
                    }
                    else {
                        let viewProperty = ReadDataBlock(tocProperty, dataView.buffer);
                        LoadPropTableItem(viewProperty, tocProperty, pti);
                    }
                }

                function LoadPropTableItem(dataView, toc, pti) {
                    let offset = 0;
                    let nNodesPerTable = dataView.getUint32(offset, true);
                    offset += 4;
                    if (pti.nLoadedNodes === nNodesPerTable)
                        return false;

                    let arrProperty = [];
                    for (let i = 0; i < nNodesPerTable; i++) {
                        let Property = {
                            nodeId: -1,
                            nNodeProps: 0,
                            items: [],
                            key: file.ID, // nodeId와 byteArray 연계 정보
                            offset: -1,
                            id_file: file.Key
                        };

                        //arrProperty.push(Property);
                        arrProperty[i] = Property;

                        let nodeId = dataView.getUint32(offset, true);
                        //Property.nodeId += startID;//view.Data.GetStartID();
                        Property.nodeId = nodeId + view.Data.GetStartID(file.Key);
                        offset += 4;

                        Property.nNodeProps = dataView.getInt16(offset, true);
                        offset += 2;

                        // offset 관리
                        Property.offset = offset;

                        let encode_utf8 = function (s) {
                            return unescape(encodeURIComponent(s));
                        };

                        let decode_utf8 = function (s) {
                            try {
                                return decodeURIComponent(escape(s));
                            }
                            catch (e) {
                                return s;
                            }
                        };

                        if (view.Configuration.Property.UseArrayBuffer) {
                            for (let pi = 0; pi < Property.nNodeProps; pi++) {
                                let len = dataView.getUint32(offset, true);
                                offset += 4;
                                offset += len;
                                //len = dataView.getUint16(offset, true);
                                offset += 2;
                                len = dataView.getUint32(offset, true);
                                offset += 4;
                                offset += len;
                                //item.valType = dataView.getUint16(offset, true);
                                offset += 2;
                            }
                        }
                        else {
                            for (let pi = 0; pi < Property.nNodeProps; pi++) {
                                let item = {
                                    key: null,
                                    value: null
                                    //valueType: null
                                };
                                let len = dataView.getUint32(offset, true);
                                offset += 4;

                                let keyBuffer = new Uint8Array(len);
                                for (let m = 0; m < len; m++) {
                                    keyBuffer[m] = dataView.getUint8(offset + m, true);
                                }

                                item.key = String.fromCharCode.apply(null, keyBuffer);
                                item.key = decode_utf8(item.key);

                                offset += len;

                                //len = dataView.getUint16(offset, true);
                                offset += 2;

                                len = dataView.getUint32(offset, true);
                                offset += 4;

                                let valueBuffer = new Uint8Array(len);
                                for (let m = 0; m < len; m++) {
                                    valueBuffer[m] = dataView.getUint8(offset + m, true);
                                }
                                item.value = String.fromCharCode.apply(null, valueBuffer);
                                item.value = decode_utf8(item.value);

                                offset += len;

                                //item.valType = dataView.getUint16(offset, true);
                                offset += 2;

                                Property.items.push(item);
                            }
                        }
                    }

                    //view.Data.AddUserProperty(arrProperty);
                    view.Property.Add(arrProperty, file.ID, dataView, file);

                    //Property 추가 완료
                    {
                        let fileInfo = view.Data.ModelFileManager.GetFileInfo(file.Key);
                        let fileDataInfo = view.Data.ModelFileManager.AddFileDataInfo(fileInfo, VIZCore.Enum.FILEINFOTYPE.PROPERTY, VIZCore.Enum.FILEINFOTYPE.PROPERTY);
                        fileDataInfo.Download = true;
                        //view.Data.ModelFileManager.SetDownloadFileData(file.Key, file);
                    }

                    loaded_Property = true;
                    checkLoaded();
                }
            }

            // SplitFile
            let tiSplitFile = FindLast(ContentsType.CTSplitStructureMeshBlockFile);
            if (tiSplitFile !== -1 && header.version >= 303) {
                let tocSplitFile = m_toc[tiSplitFile];
                let viewSplitFile = ReadDataBlock(tocSplitFile);

                let splitInfo = ImportSplitFile(viewSplitFile, tocSplitFile);
                let splitType = splitInfo[0];
                if (splitType !== 0) {
                    let structureNum = splitInfo[1];
                    let meshBlockNum = splitInfo[2];
                    let udaNum = splitInfo[3];
                    let unitInfo = splitInfo[4];

                    let filePath = view.Data.GetStringLeft(file.Url, 0, file.Url.length - 5);

                    let structureCnt = 0;
                    let meshBlockCnt = 0;
                    let udaCnt = 0;

                    //다운로드 추가 갱신
                    let splitNum = 0;
                    let splitfiles = [];
                    let splitMax = Math.max(Math.max(structureNum, meshBlockNum), udaNum);
                    //let splitMax = Math.max(structureNum, meshBlockNum);

                    for (let ii = 0; ii < splitMax; ++ii) {
                        //교차하면서 다운로드하기 위함
                        if (structureCnt < structureNum) {
                            splitfiles[splitNum++] = `${filePath}_s_${structureCnt}.vizw`;
                            structureCnt++;
                        }

                        if (udaCnt < udaNum) {
                            splitfiles[splitNum++] = `${filePath}_u_${udaCnt}.vizw`;
                            udaCnt++;
                        }

                        if (meshBlockCnt < meshBlockNum) {
                            splitfiles[splitNum++] = `${filePath}_${meshBlockCnt}.vizw`;
                            meshBlockCnt++;
                        }
                    }


                    //for (let ii = 0; ii < structureNum; ++ii) {
                    //    if (structureCnt < structureNum) {
                    //        splitfiles[splitNum++] = filePath + "_s_" + structureCnt + ".vizw";
                    //        structureCnt++;
                    //    }
                    //}

                    // UDA는 완료 후 추가
                    //for (let ii = 0; ii < udaNum; ++ii) {
                    //    splitfiles[splitNum++] = `${filePath}_u_${udaCnt}.vizw`;
                    //    udaCnt++;
                    //}

                    //for (let ii = 0; ii < meshBlockNum; ++ii) {
                    //    splitfiles[splitNum++] = `${filePath}_${meshBlockCnt}.vizw`;
                    //    meshBlockCnt++;
                    //}

                    //구역 List map 추출
                    if (!view.useLOD) {
                        let tiSplitAreaFile = FindLast(ContentsType.CTSplitAreaMeshBlockList);
                        if (tiSplitAreaFile !== -1) {
                            let tocSplitArea = m_toc[tiSplitAreaFile];
                            let viewSplitArea = ReadDataBlock(tocSplitArea);
                            ImportSplitAreaList(viewSplitArea, tocSplitArea);
                        }
                    }
                    view.DataSplit = splitType;
                    view.resizeGLWindowSkip = true;
                    view.currentSplitDownloadCnt = 0;
                    view.totalSplitDownloadCnt = structureNum + meshBlockNum + udaNum;
                    //view.totalSplitDownloadCnt = meshBlockNum;

                    view.Data.ApplyStartID();
                    view.Model.SplitAdd(splitfiles);

                    //result = null;
                    parseOnload(null, file);
                    return;
                }
            }

            // Structure
            let tiStructure = FindLast(ContentsType.CTStructure);
            let tocStructure = m_toc[tiStructure];
            let viewStructure = ReadDataBlock(tocStructure);

            // MeshBlock
            let tiMeshBlock = FindLast(ContentsType.CTMeshBlock);
            let tocMeshBlock = m_toc[tiMeshBlock];
            let viewMeshBlock = ReadDataBlock(tocMeshBlock);

            // Property
            let tiPropertyIndices = FindLast(ContentsType.CTNodePropTableIndices);
            let tocPropertyIndices = m_toc[tiPropertyIndices];
            let viewPropertyIndices = ReadDataBlock(tocPropertyIndices);

            //Set ModelFileManager
            {
                //header 가 없는 파일이기에 임의로 생성
                let fileInfo = view.Data.ModelFileManager.CreateFileInfoEmpty(file);
                view.Data.ModelFileManager.AddFileInfo(file.Key, fileInfo);
            }

            // ID
            if (tocStructure !== undefined) {
                if (view.DataSplit === 0) {
                    let maxID = GetNodeMaxID(viewStructure, tocStructure);
                    view.Data.SetStartID(file.Key, maxID);
                }
                else {
                    let maxID = GetSplitFileNodeMaxID(viewStructure, tocStructure);
                    view.Data.SetCurrentStartID(maxID);
                }
            }

            if (tocStructure === undefined && tocMeshBlock === undefined && tocPropertyIndices === undefined) {
                if (!view.useFramebuffer)
                    onProgress(1, 1);
                result = null;
                parseOnload(null, file);
            }
            else {
                if (tocStructure !== undefined) {
                    setTimeout(function () {
                        if (view.DataSplit === 0) {
                            ImportStructure(viewStructure, tocStructure);
                        }
                        else {
                            ImportSplitStructure(viewStructure, tocStructure);
                        }
                    }, 1);
                }
                else {
                    loaded_Structure = true;
                    checkLoaded();
                }
                if (tocMeshBlock !== undefined) {
                    setTimeout(function () {
                        offset = 0;
                        let meshBlockNum = viewMeshBlock.getInt32(offset, true);
                        offset += 4;

                        let curload = 0;
                        let loading = function () {
                            for (let i = curload; i < meshBlockNum; i++) {
                                let percent = curload / meshBlockNum;
                                if (percent === Infinity)
                                    percent = 0;

                                //console.log("ReadMeshBlock : " + i);
                                let cachTocIdx = 0;
                                cachTocIdx = viewMeshBlock.getInt32(offset, true);
                                offset += 4;

                                let toc = m_toc[cachTocIdx];

                                let viewSub = ReadDataBlock(toc);

                                ImportMeshBlock(viewSub, cachTocIdx);

                                if (view.DemoType === 3) {

                                    if (file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/BIKE.vizw") === 0
                                        || file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/BUS.vizw") === 0
                                        || file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/CAR_A.vizw") === 0
                                        || file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/CAR_B.vizw") === 0
                                    ) {
                                        for (let c = 1; c < 20; c++) {
                                            view.Animation.BackupUrl = "";
                                            ImportMeshBlock(viewSub, cachTocIdx);
                                        }
                                    }
                                }

                                //// 노드 복사 테스트
                                if (view.DemoType == 2) {
                                    for (let c = 1; c < 10; c++) {
                                        // copyMeshBlock(viewSub, c);
                                        view.MeshProcess.Copy(viewSub, c, result, file, header, meshBlockId);
                                    }
                                }

                                curload++;
                                if (curload !== meshBlockNum) {
                                    setTimeout(function () {
                                        if (!view.useFramebuffer)
                                            onProgress(1, percent);
                                        loading();
                                    }, 1);
                                    break;
                                }
                                else {
                                    setTimeout(function () {
                                        if (!view.useFramebuffer)
                                            onProgress(1, 1);
                                        loaded_MeshBlock = true;
                                        checkLoaded();
                                    }, 1);
                                }
                            }
                        };

                        setTimeout(function () {
                            if (!view.useFramebuffer)
                                onProgress(1, 0);
                            loading();
                        }, 1);
                    }, 1);
                }
                else {
                    loaded_MeshBlock = true;
                    checkLoaded();
                }
                if (tocPropertyIndices !== undefined) {
                    setTimeout(function () {
                        LoadPropTableIndices(viewPropertyIndices, tocPropertyIndices);
                    }, 1);
                }
                else {
                    loaded_Property = true;
                    checkLoaded();
                }
            }
            function checkLoaded() {
                if (loaded_Structure && loaded_MeshBlock && loaded_Property)
                    parseOnload(null, file);
            }
        }


        // 옵션별 url 반환
        function getRequestUrl(url, useCache) {
            let urlEncode = view.Configuration.Default.EncodeURI.Enable === true ? encodeURI(url) : url;
            let requestParam = "";
            if (view.Configuration.Default.File !== undefined && view.Configuration.Default.File.EnableCache === true) {
                if (useCache === undefined || useCache === false)
                    requestParam = view.Configuration.Default.File.RequestParam + new Date().getTime();
            }

            return urlEncode + requestParam;
        };

        function downFetch(data, onLoad, onProgress, callback, onDownloaded) {
            let url = getRequestUrl(data.Url);
            //let url = data.Url;

            let success = function (result) {
                let startTime = new Date();
                //if (data.Header !== undefined && data.Header.compressed)
                 {
                    let decompress = (source, callback) => {
                        let startTime = new Date();
                        let bytes = new Uint8Array(source);
                        const arrayLength = bytes.byteLength;               // Byte 배열의 길이
                        const inputPointer = view.ShdCore._malloc(arrayLength);   // 다운로드된 압축 바이너리 크기 만큼 메모리 할당
                        var byteArray = new Uint8Array(bytes);              // ArrayBuffer 형식을 Uint8Array (Unsigned Int 8 Bit Array) 변경
                        view.ShdCore.HEAPU8.set(byteArray, inputPointer);         // ByteArray를 할당된 메모리에 복사

                        // WebAssembly API 호출 :: GetDecompressedSize (압축해제된 예상 크기 반환)
                        // 압축된 Byte 배열이 해제되었을 경우의 예상되는 크기를 확인
                        // 실제 압축하기전 Byte의 크기와 다를수 있음

                        // if(data.Url.localeCompare('./VIZCore3D/Model/DLENC/vizw/vizw/View1_wm_00_0000.vizw')=== 0)
                        // {
                        //     console.log("");
                        // }
                        const decompressedSize = view.ShdCore.ccall(
                            'GetDecompressedSize',
                            'BigInt',
                            ['number', 'number'],
                            [inputPointer, arrayLength]);

                        if (decompressedSize <= 0) {
                            console.log("Decompressed :: It is not a compressed file.");
                            // 메모리 해제
                            view.ShdCore._free(inputPointer);
                            callback(source, data);
                            return;
                        }


                        // 압축이 해제된 데이터를 전달받기 위해서
                        // 해당 크기로 메모리를 할당
                        const outputPointer = view.ShdCore._malloc(decompressedSize);

                        // WebAssembly API 호출 :: Decompress (압축해제)
                        // 압축된 바이트의 메모리 포인터
                        // 압축된 바이트의 길이
                        // 압축 해제된 바이트가 저장될 메모리 포인터
                        // 압축 해제된 바이트의 예상 크기
                        const result = view.ShdCore.ccall(
                            'Decompress',
                            'number',
                            ['number', 'number', 'number', 'number'],
                            [inputPointer, arrayLength, outputPointer, decompressedSize]);

                        // 압축해제 결과 조회
                        // 메모리에 저장된 데이터 복사
                        // CASE 1 - Uint8Array
                        //const decompressedByte = new Uint8Array(wasmMemory.buffer, outputPointer, result);
                        //const decompressedByte = new Uint8Array(view.ShdCore.asm.memory.buffer, outputPointer, result);

                        // CASE 2 - ArrayBuffer
                        // CASE 2 - ArrayBuffer
                        try {
                            var arrayUint8 = new Uint8Array(result);
                            if (view.useAssemblyLoader) {
                                arrayUint8.set(new Uint8Array(view.ShdCore.wasmMemory.buffer, outputPointer, result), 0);
                            }
                            else {
                                arrayUint8.set(new Uint8Array(view.ShdCore.asm.memory.buffer, outputPointer, result), 0);
                            }

                            //bytes = arrayUint8.buffer; // ArrayBuffer
                            source = arrayUint8.buffer; // ArrayBuffer
                        } catch (e) {
                            console.log("allocation :: ", e);
                            // 메모리 해제
                            view.ShdCore._free(inputPointer);
                            view.ShdCore._free(outputPointer);
                            callback(undefined, data);
                            return;
                        }

                        // 메모리 해제
                        view.ShdCore._free(inputPointer);
                        view.ShdCore._free(outputPointer);

                        callback(source, data);

                    }

                    if (onDownloaded !== undefined) {
                        let cb = (source, data) => {
                            callback(source, data);
                            result = null;
                        };
                        setTimeout(() => {
                            decompress(result, cb);
                        }, 1);

                        //console.log("Download Completed :: ", data.Url);
                        onDownloaded(data, undefined);

                    }
                    else {
                        decompress(result, callback);
                    }
                }
                // else {
                //     let currentTime = new Date();
                //     let span = currentTime.getTime() - startTime.getTime();
                //     //console.log("Time Span ::", span);
                //     if (onDownloaded !== undefined) {
                //         //setTimeout(, 1);
                //         //console.log("Download Completed :: ", data.Url);
                //         onDownloaded(data, undefined);
                //     }
                //     callback(result, data);
                // }

                if (onDownloaded === undefined)
                    result = null;
            };

            fetch(url, {
                method: 'GET', // *GET, POST, PUT, DELETE 등
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                //headers: {
                // 'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
                //},
                //redirect: 'follow', // manual, *follow, error
                //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                //body: JSON.stringify(data), // body의 데이터 유형은 반드시 "Content-Type" 헤더와 일치해야 함
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error, status = ${response.status}`);
                    }
                    return response.arrayBuffer();
                })
                .then((buffer) => success(buffer));
        }

        

        function down() {
            if (view.useJquery === false) {
                //downXHR(data, onLoad, onProgress, callback, onDownloaded);

                let cb = (output) => {
                    if (output.byteLength === 0) {
                        console.log("File Loading Error : " + file.Url);
                        file.Status = 3;
                        onload(undefined, file);
                    }
                    else {
                        try {
                            asyncParse(output, file, undefined);
                            //result.slice(0, result.length);
                            output = null;
                        }
                        catch (e) {
                            console.log("File Loading Error : " + file.Url);
                            file.Status = 3;
                            onload(undefined, file);
                        }
                    }
                };

                downFetch(data, onload, onProgress, cb, undefined);
            }
            else {
                $.ajax({
                    complete: function () {
                        onProgress(2, 1);
                    },

                    //headers: {
                    //    'Cache-Control': 'max-age=600'
                    //},

                    //Url 특수문자오류
                    //escape() 한글폴더 경로 오류
                    //url: encodeURI(data.Url),
                    url: data.Url, //특수문자 오류 발생
                    //url: escape(data.Url), //아스키코드가 아닌경우 인코딩
                    //url: encodeURI(data.Url), //URL에 사용되는 특수문자 (?/;=?&)를 제외하고 인코딩


                    type: "GET",
                    //xhrFields: {  //response 데이터를 바이너리로 처리한다.
                    //    //dataType: 'binary'
                    //    //responseType: 'arraybuffer'
                    //    //responseType: 'blob'
                    //},
                    beforeSend: function () {  //ajax 호출전 progress 초기화
                        onProgress(2, 0, 0, 0);
                    },
                    xhr: function () {  //XMLHttpRequest 재정의 가능
                        let me = this;
                        let xhr = $.ajaxSettings.xhr();
                        xhr.responseType = "arraybuffer";
                        //xhr.setRequestHeader('AllowedOrigin', '*');
                        xhr.onprogress = function (e) {
                            let percent = e.loaded / e.total;
                            onProgress(2, percent, e.loaded, e.total);
                        };

                        xhr.addEventListener('load', function () {
                            let jQueryVer = $().jquery;
                            let res = jQueryVer.split(".");
                            let major = res[0] * 1;
                            let minor = res[1] * 1;
                            if (major <= 2 && minor < 2)
                                me.success(xhr.response);
                        });

                        return xhr;
                    },
                    //dataType: 'binary',
                    responseType: 'arraybuffer',
                    processData: false, // arraybuffer -> need
                    async: true,
                    //cache: false, 
                    success: function (result) {
                        //console.log("File Downloading Finish");
                        function arrayBufferToBase64(buffer) {
                            var binary = '';
                            var bytes = new Uint8Array(buffer);
                            var len = bytes.byteLength;
                            for (var i = 0; i < len; i++) {
                                binary += String.fromCharCode(bytes[i]);
                            }
                            return window.btoa(binary);
                        }

                        function base64ToArrayBuffer(base64) {
                            var binary_string = window.atob(base64);
                            var len = binary_string.length;
                            var bytes = new Uint8Array(len);
                            for (var i = 0; i < len; i++) {
                                bytes[i] = binary_string.charCodeAt(i);
                            }
                            return bytes.buffer;
                        }

                        //var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(result)));
                        //let base64String = arrayBufferToBase64(result);

                        //console.log(base64String);
                        //var b64 = window.btoa(unescape(encodeURIComponent(base64String)))

                        //t arr = base64ToArrayBuffer(base64String);

                        // 압축 버전 확인 및 해제
                        let decompress = (source, callback) => {
                            let startTime = new Date();
                            let bytes = new Uint8Array(source);
                            const arrayLength = bytes.byteLength;               // Byte 배열의 길이
                            const inputPointer = view.ShdCore._malloc(arrayLength);   // 다운로드된 압축 바이너리 크기 만큼 메모리 할당
                            var byteArray = new Uint8Array(bytes);              // ArrayBuffer 형식을 Uint8Array (Unsigned Int 8 Bit Array) 변경
                            view.ShdCore.HEAPU8.set(byteArray, inputPointer);         // ByteArray를 할당된 메모리에 복사

                            // WebAssembly API 호출 :: GetDecompressedSize (압축해제된 예상 크기 반환)
                            // 압축된 Byte 배열이 해제되었을 경우의 예상되는 크기를 확인
                            // 실제 압축하기전 Byte의 크기와 다를수 있음

                            // if(data.Url.localeCompare('./VIZCore3D/Model/DLENC/vizw/vizw/View1_wm_00_0000.vizw')=== 0)
                            // {
                            //     console.log("");
                            // }
                            const decompressedSize = view.ShdCore.ccall(
                                'GetDecompressedSize',
                                'BigInt',
                                ['number', 'number'],
                                [inputPointer, arrayLength]);

                            if (decompressedSize <= 0) {
                                console.log("Decompressed :: It is not a compressed file.");
                                // 메모리 해제
                                view.ShdCore._free(inputPointer);
                                callback(source, data);
                                return;
                            }
                            // 압축이 해제된 데이터를 전달받기 위해서
                            // 해당 크기로 메모리를 할당
                            const outputPointer = view.ShdCore._malloc(decompressedSize);

                            // WebAssembly API 호출 :: Decompress (압축해제)
                            // 압축된 바이트의 메모리 포인터
                            // 압축된 바이트의 길이
                            // 압축 해제된 바이트가 저장될 메모리 포인터
                            // 압축 해제된 바이트의 예상 크기
                            const result = view.ShdCore.ccall(
                                'Decompress',
                                'number',
                                ['number', 'number', 'number', 'number'],
                                [inputPointer, arrayLength, outputPointer, decompressedSize]);

                            // 압축해제 결과 조회
                            // 메모리에 저장된 데이터 복사
                            // CASE 1 - Uint8Array
                            //const decompressedByte = new Uint8Array(wasmMemory.buffer, outputPointer, result);
                            //const decompressedByte = new Uint8Array(view.ShdCore.asm.memory.buffer, outputPointer, result);

                            // CASE 2 - ArrayBuffer
                            try {
                                var arrayUint8 = new Uint8Array(result);
                                arrayUint8.set(new Uint8Array(view.ShdCore.asm.memory.buffer, outputPointer, result), 0);
                                //bytes = arrayUint8.buffer; // ArrayBuffer
                                source = arrayUint8.buffer; // ArrayBuffer
                            } catch (e) {
                                console.log("allocation :: ", e);
                                // 메모리 해제
                                view.ShdCore._free(inputPointer);
                                view.ShdCore._free(outputPointer);
                                //callback(undefined, data);
                                callback(source, data);
                                return;
                            }

                            // 메모리 해제
                            view.ShdCore._free(inputPointer);
                            view.ShdCore._free(outputPointer);

                            callback(source, data);

                        }

                        let cb = (output) => {
                            if (output.byteLength === 0) {
                                console.log("File Loading Error : " + file.Url);
                                file.Status = 3;
                                onload(undefined, file);
                            }
                            else {
                                try {
                                    asyncParse(output, file, undefined);
                                    //result.slice(0, result.length);
                                    result = null;
                                }
                                catch (e) {
                                    console.log("File Loading Error : " + file.Url);
                                    file.Status = 3;
                                    onload(undefined, file);
                                }
                            }
                        };

                        decompress(result, cb);

                        // if (result.byteLength === 0) {
                        //     console.log("File Loading Error : " + file.Url);
                        //     file.Status = 3;
                        //     onload(undefined, file);
                        // }
                        // else {
                        //     try {
                        //         asyncParse(result, file, undefined);
                        //         //result.slice(0, result.length);
                        //         result = null;
                        //     }
                        //     catch (e) {
                        //         console.log("File Loading Error : " + file.Url);
                        //         file.Status = 3;
                        //         onload(undefined, file);
                        //     }
                        // }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr.status);
                        console.log(thrownError);
                        file.Status = 3;
                        onload(undefined, file);
                    }

                });
            }
        }
        function down_Edge() {
            $.ajax({
                //url: data.Url,
                //url: escape(data.Url), //아스키코드가 아닌경우 인코딩
                url: encodeURIComponent(data.Url), //URL에 사용되는 특수문자까지 인코딩
                type: "GET",
                dataType: 'binary',
                responseType: 'arraybuffer',
                processData: false,
                async: false,
                success: function (result) {
                    asyncParse(result);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
                }
            });
        }

        down();

        function down_cors() {
            const body = '<?xml version="1.0"?><person><name>Arun</name></person>';

            let xhr = new XMLHttpRequest();
            let url = 'http://VIZCoredaelim.s3-website.ap-northeast-2.amazonaws.com/Daelim.vizw';
            //let url = 'http://VIZCoredaelim.s3-website.ap-northeast-2.amazonaws.com/';

            xhr.open('POST', url, true);
            //xhr.open('POST', url, true);
            //xhr.setRequestHeader('AllowedOrigin', '*');
            //xhr.setRequestHeader('Custom-Header', 'cws');
            xhr.setRequestHeader('Ping-Other', 'pingpong');
            xhr.setRequestHeader('Content-Type', 'application/xml');
            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    down();
                }
            };

            xhr.onload = function () {
                if (this.readyState === 4 && this.status === 200) {
                    let person = JSON.parse(xhr.response);
                }
            };
            xhr.send(body);
        }

        //down_cors()
    };

    this.SetData = function(result, data, onLoad, onProgress, callback, onDownloaded, )
    {
        let parseOnload = onLoad;
        let startID = 0;
        let file = data;
        async function asyncParse(result, vizwType) {
            //if (type === undefined)
            //parseData_v303(result, dataId);
            //else

            //if (view.DataSplit !== 0)
            //    parseData_split(result)
            //else
            parseData_lod(result);
        }

        function newPos(vec, offset, max) {
            if (vec.z + offset <= max)
                vec.z += offset;
            else if (vec.y + offset <= max) {
                vec.y += offset;
                vec.z = 0;
            }
            else {
                vec.x += offset;
                vec.y = 0;
                vec.z = 0;
            }

            return this;
        }

        const BigInt = window.BigInt, bigThirtyTwo = BigInt(32), bigZero = BigInt(0);
        function getUint64BigInt(dataView, byteOffset, littleEndian) {
            // split 64-bit number into two 32-bit (4-byte) parts
            const left = BigInt(dataView.getUint32(byteOffset | 0, !!littleEndian) >>> 0);
            const right = BigInt(dataView.getUint32((byteOffset | 0) + 4 | 0, !!littleEndian) >>> 0);

            // combine the two 32-bit values and return
            return littleEndian ? (right << bigThirtyTwo) | left : (left << bigThirtyTwo) | right;
        }

        function getUint64(dataView, byteOffset, littleEndian) {
            // 22.06.07 ssjo
            // 예제 Toycar.vizw 오픈 문제로 코드 복원
            if (1) {
                // split 64-bit number into two 32-bit parts
                const left = dataView.getUint32(byteOffset, littleEndian);
                const right = dataView.getUint32(byteOffset + 4, littleEndian);

                // combine the two 32-bit values
                const combined = littleEndian ? left + 2 ** 32 * right : 2 ** 32 * left + right;

                if (!Number.isSafeInteger(combined))
                    console.warn(combined, 'exceeds MAX_SAFE_INTEGER. Precision may be lost');

                return combined;
            }
            return getUint64BigInt(view, byteOffset, littleEndian);
        }

        function parseData_v303(result) {

            console.log("Data Loading Start");
            let dataView = new DataView(result);
            let offset = 0;
            let header = {
                typeStr: null, // 16
                version: null, // 4
                sizeTocItem: null, //4
                nToc: null, //4
                tocPos: null //8
            };
            let buffer = new Uint8Array(result, offset, 16);
            header.typeStr = String.fromCharCode.apply(null, buffer);
            offset += 16;
            header.version = dataView.getInt32(offset, true);
            offset += 4;
            header.sizeTocItem = dataView.getInt32(offset, true);
            offset += 4;
            header.nToc = dataView.getInt32(offset, true);
            offset += 4;
            header.tocPos = getUint64(dataView, offset, true);
            offset += 8;

            let m_toc = [];
            // read toc
            let nTocOfThisSeg = 0;
            let nextPos = 0;
            let m_StreamCurrentPosition = header.tocPos;

            nTocOfThisSeg = dataView.getInt32(m_StreamCurrentPosition, true);
            m_StreamCurrentPosition += 4;
            nextPos = getUint64(dataView, m_StreamCurrentPosition, true);
            m_StreamCurrentPosition += 8;

            for (let i = 0; i < nTocOfThisSeg; i++) {
                ReadTocItem(i);
            }

            function ReadTocItem(tocIdx) {
                let itemPos = header.tocPos + 12 + (tocIdx * header.sizeTocItem);

                // Core에서 8ㅠyte로 써짐 뒤 4byte는 더미데이터
                let itemType = dataView.getInt32(itemPos, true);
                itemPos += 8;
                let position = getUint64(dataView, itemPos, true);
                itemPos += 8;
                let dataSize = dataView.getUint32(itemPos, true);
                itemPos += 4;
                let uncompSize = dataView.getUint32(itemPos, true);
                itemPos += 4;
                let parsetype = 0;
                if (view.Loader.parsetype === 1) {
                    parsetype = dataView.getUint32(itemPos, true);
                    itemPos += 4;
                }

                let toc = {
                    itemType: itemType,
                    position: position,
                    datasize: dataSize,
                    uncompsize: uncompSize,
                    parsetype: parsetype
                };
                m_toc.push(toc);
            }

            function FindLast(ctt) {
                let tocIdx = -1;
                for (let i = m_toc.length - 1; i >= 0; i--) {
                    if (m_toc[i].itemType === ctt) {
                        tocIdx = i;
                        break;
                    }
                }
                return tocIdx;
            }

            function FindFirst(ctt) {
                let tocIdx = -1;
                for (let i = 0; i < m_toc.length; i++) {
                    if (m_toc[i].itemType === ctt) {
                        tocIdx = i;
                        break;
                    }
                }
                return tocIdx;
            }

            // MeshData
            function ReadDataBlock(ti, buffer) {
                try {
                    let m_StreamCurrentPosition = ti.position;
                    let dataView;
                    if (buffer === undefined) {
                        dataView = new DataView(result, m_StreamCurrentPosition, ti.datasize);
                        return dataView;
                    }
                    else {
                        view = new DataView(buffer, m_StreamCurrentPosition, ti.datasize);
                        return view;
                    }

                } catch (e) {
                    return undefined;
                }
            }

            //let ti = FindLast(3);
            let ti = FindLast(ContentsType.CTMeshBlock);
            let tocData = m_toc[ti];

            function ImportMeshBlock(view, tiStruct) {
                //let vnElemsSize = 15;
                //let triElemsSize = 2 * 3;
                let meshoffset = 0;
                let MeshBlockSize;
                MeshBlockSize = view.getInt32(meshoffset, true);
                meshoffset += 4;

                for (let i = 0; i < MeshBlockSize; i++) {
                    let color = new VIZCore.Color();
                    color.r = view.getUint8(meshoffset, true);
                    color.g = view.getUint8(meshoffset + 1, true);
                    color.b = view.getUint8(meshoffset + 2, true);
                    color.a = view.getUint8(meshoffset + 3, true);

                    //let color = {
                    //    R: view.getUint8(meshoffset, true),
                    //    G: view.getUint8(meshoffset + 1, true),
                    //    B: view.getUint8(meshoffset + 2, true),
                    //    A: view.getUint8(meshoffset + 3, true)
                    //};
                    meshoffset += 4;
                    let nVtx = view.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nNormal = view.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nTri = view.getUint32(meshoffset, true);
                    meshoffset += 4;
                    //cntTriAll += nTri;
                    if (view.Loader.parsetype === 1) {
                        let ptype = view.getUint32(meshoffset, true);
                        meshoffset += 4;
                    }

                    let cnt = nVtx / 15;
                    let vtArray = new Float32Array(result, meshoffset + view.byteOffset, nVtx);

                    meshoffset += nVtx * 4;
                    let vnArray = new Float32Array(result, meshoffset + view.byteOffset, nNormal);
                    meshoffset += nNormal * 4;
                    let triArray = new Uint32Array(result, meshoffset + view.byteOffset, nTri);
                    meshoffset += nTri * 4;

                    let object = view.Data.Object3D();
                    object.id_file = file.Key;

                    // 데이터 추출
                    object.attribs.a_index.array = triArray;
                    object.numElements = object.attribs.a_index.array.length;

                    object.attribs.a_position.array = vtArray;
                    object.attribs.a_normal.array = vnArray;

                    let MeshSize = view.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let datas = [];
                    let colors = [];
                    let colorsOffset = 0;
                    for (let j = 0; j < MeshSize; j++) {
                        let partid = view.getUint32(meshoffset, true);
                        meshoffset += 4;
                        let bodyid = view.getUint32(meshoffset, true);
                        meshoffset += 4;

                        let origin_id = bodyid; //원본 Body ID

                        let m_vnIdx = view.getUint32(meshoffset, true);
                        meshoffset += 4;
                        let m_triIdx = view.getUint32(meshoffset, true);
                        meshoffset += 4;

                        let MnVtx = view.getUint16(meshoffset, true);
                        meshoffset += 2;
                        let MnTri = view.getUint16(meshoffset, true);
                        meshoffset += 2;

                        let bbox = new Float32Array(dataView.buffer, meshoffset + view.byteOffset, 6);
                        meshoffset += 24;


                        let data = {
                            partId: partid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                            bodyId: bodyid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                            origin_id: origin_id,

                            color: color,
                            material: undefined,//material.id,
                            m_vnIdx: m_vnIdx * 3,
                            m_triIdx: m_triIdx * 3,
                            m_nVtx: MnVtx * 3,
                            m_nTris: MnTri * 3,

                            BBox: new VIZCore.BBox(bbox),
                            //action: view.Data.ActionItem(),
                            colorIdx: null,
                            object: null
                        };

                        // 색상 ID 재설정
                        view.Data.IDColor.new();
                        //data.action.transform.setPosition(view.Data.TmpTransform);
                        //rgb
                        //data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16);
                        //rgba
                        data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16) + (view.Data.IDColor.a * 16777216); //<< 24
                        //let colorArrLength = data.m_nVtx;
                        let colorArrLength = data.m_nVtx / 3 * 4; //vectex 3, color는 4
                        //for (let k = data.m_vnIdx; k < (data.m_vnIdx + data.m_nVtx) / 3 * 3; k = k+3) {
                        for (let k = 0; k < colorArrLength; k = k + 4) {
                            colors[colorsOffset + k + 0] = view.Data.IDColor.r;
                            colors[colorsOffset + k + 1] = view.Data.IDColor.g;
                            colors[colorsOffset + k + 2] = view.Data.IDColor.b;
                            colors[colorsOffset + k + 3] = view.Data.IDColor.a;
                        }
                        colorsOffset += colorArrLength;

                        data.object = object;
                        datas.push(data);
                        view.Data.AddBody(data);


                        let bodyAction = view.Data.ShapeAction.GetAction(file.Key, origin_id);
                        if (bodyAction === undefined) {
                            bodyAction = view.Data.ActionItem();
                        }

                        //Action 데이터 설정
                        {
                            //파일 읽는 부분에서 material 등록이 있기때문에 등록 필요
                            view.Data.ShapeAction.SetAction(file.Key, origin_id, bodyAction);
                        }
                    }
                    //newPos(view.Data.TmpTransform, 30, 300);

                    object.attribs.a_color.array = new Uint8Array(colors, 0, colorsOffset);
                    //object.attribs.a_color.array = new Float32Array(colors, 0, vtArray.length); 

                    view.Data.Objects.push(object);
                    object.tag = datas;
                }
            }

            // tree
            let tiStructure = FindLast(ContentsType.CTStructure);
            let tocStructure = m_toc[tiStructure];
            let viewStructure = ReadDataBlock(tocStructure);

            function ImportStructure(view, toc) {
                let offset = 0;
                let m_Unit = view.getUint32(offset, true);
                offset += 4;
                let nEnts = view.getUint32(offset, true);
                offset += 4;
                let vdBlockSize = view.getUint32(offset, true);
                offset += 4;

                let m_vecPropHeaderDic = []; // 136 Byte
                for (let i = 0; i < vdBlockSize; i++) {
                    let HeaderTocTableItem = {
                        index: -1,
                        itemType: 0,
                        entFlags: 0,
                        iNameIndex: -1,
                        attFlags: 0,
                        transfrom: [],
                        bBox: [],
                        BBox: null,
                        cCount: -1,
                        pIndex: -1,
                        orgNodeID: -1,
                        pNameBuff: null,
                        tocId: 0,
                        btype: 0,
                        name: null
                    };

                    let index = view.getUint32(offset, true);
                    HeaderTocTableItem.index = index === -1 ? index : index + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                    offset += 4;
                    HeaderTocTableItem.itemType = view.getInt32(offset, true);
                    offset += 4;
                    HeaderTocTableItem.entFlags = view.getUint16(offset, true);
                    offset += 4;
                    HeaderTocTableItem.iNameIndex = view.getInt32(offset, true);
                    offset += 4;
                    HeaderTocTableItem.attFlags = view.getUint16(offset, true);
                    offset += 4;
                    HeaderTocTableItem.transfrom = [];
                    for (let j = 0; j < 16; j++) {
                        HeaderTocTableItem.transfrom[j] = view.getFloat32(offset, true);
                        offset += 4;
                    }
                    HeaderTocTableItem.bBox = [];
                    for (let k = 0; k < 6; k++) {
                        HeaderTocTableItem.bBox[k] = view.getFloat32(offset, true);
                        offset += 4;
                    }

                    HeaderTocTableItem.BBox = new VIZCore.BBox(HeaderTocTableItem.bBox);

                    HeaderTocTableItem.cCount = view.getInt32(offset, true);
                    offset += 4;
                    let pIndex = view.getInt32(offset, true);
                    HeaderTocTableItem.pIndex = pIndex === -1 ? pIndex : pIndex + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                    offset += 4;
                    HeaderTocTableItem.orgNodeID = view.getInt32(offset, true);
                    offset += 4;
                    //byte * pNameBuff;
                    if (header.version < 302)
                        offset += 8;

                    HeaderTocTableItem.tocId = view.getInt32(offset, true); //Binary Block용 
                    offset += 4;
                    HeaderTocTableItem.btype = view.getInt32(offset, true);//Binary Block용 
                    offset += 4;

                    // add
                    if (HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntAssembly
                        && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntPart
                        && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntBody) {
                        nEnts--;
                        continue;
                    }

                    m_vecPropHeaderDic.push(HeaderTocTableItem);
                }

                view.Data.AddNodes(m_vecPropHeaderDic);

                // NodeName
                let nNameNum = view.getInt32(offset, true);
                offset += 4;
                let decode_utf8 = function (s) {
                    try {
                        return decodeURIComponent(escape(s));
                    }
                    catch (e) {
                        return s;
                    }
                };
                let m_vecPropNodeNameDic = [];
                let pos = 0;
                for (let l = 0; l < nEnts; l++) {
                    if (m_vecPropHeaderDic[l].iNameIndex <= 0)
                        continue;

                    let NameTocTableItem = {
                        nStringNum: 0,
                        pos: 0,
                        name: null
                    };

                    NameTocTableItem.pos = pos;
                    NameTocTableItem.nStringNum = m_vecPropHeaderDic[l].iNameIndex;

                    let bodyNameBuffer = new Uint8Array(NameTocTableItem.nStringNum);
                    for (let m = 0; m < NameTocTableItem.nStringNum; m++) {
                        // Multibyte
                        //if(m%2 ===0)
                        //    bodyNameBuffer[m/2] = view.getUint8(pos + offset + m, true);
                        bodyNameBuffer[m] = view.getUint8(pos + offset + m, true);
                    }

                    let bodyName = String.fromCharCode.apply(null, bodyNameBuffer);
                    bodyName = decode_utf8(bodyName);


                    //[정규식 이용해서 gi 로 감싸기]
                    //감싼 따옴표를 슬래시로 대체하고 뒤에 gi 를 붙이면 
                    //replaceAll 과 같은 결과를 볼 수 있다.
                    //* g : 발생할 모든 pattern에 대한 전역 검색
                    //* i : 대 / 소문자 구분 안함
                    //* m: 여러 줄 검색(참고)

                    m_vecPropHeaderDic[l].name = bodyName.replace(/\0/gi, '');
                    NameTocTableItem.name = bodyName.replace(/\0/gi, '');
                    pos += m_vecPropHeaderDic[l].iNameIndex;

                    m_vecPropNodeNameDic.push(NameTocTableItem);
                }

                offset += nNameNum;

                let LoadProperty = function () {

                    // Property
                    let vdBodyBlockSize = view.getUint32(offset, true);
                    offset += 4;

                    for (let pb = 0; pb < vdBlockSize; pb++) {
                        let BodyTocTableItem = {
                            nodeTreeOrderID: -1,
                            hasColor: false,
                            color: [],
                            cacheidx: -1,
                            hasLayerNumber: false,
                            layerNum: -1,
                            attrCount: -1,
                            attrType: [],
                            volume: 0,       //volume 
                            area: 0,         //Area
                            centroid: [],  //centroid (center of gravity)
                            desbyteLength: -1,
                            fdensity: -1,
                            edgeStartidx: -1,
                            edgeIdxNum: -1,
                        };
                        BodyTocTableItem.nodeTreeOrderID = view.getInt32(offset, true);
                        offset += 4;
                        BodyTocTableItem.hasColor = view.getUint8(offset, true);
                        offset += 4;
                        for (let i = 0; i < 4; i++) {
                            BodyTocTableItem.color[i] = view.getFloat32(offset, true);
                            offset += 4;
                        }

                        BodyTocTableItem.cacheidx = view.getInt32(offset, true);
                        offset += 4;
                        BodyTocTableItem.hasLayerNumber = view.getUint8(offset, true);
                        offset += 4;
                        BodyTocTableItem.layerNum = view.getInt32(offset, true);
                        offset += 4;
                        BodyTocTableItem.attrCount = view.getInt32(offset, true);
                        offset += 4;
                        for (let i = 0; i < 2; i++) {
                            BodyTocTableItem.attrType[i] = view.getInt32(offset, true);
                            offset += 4;
                        }
                        BodyTocTableItem.volume = getUint64(view, offset, true);//view.getInt32(offset, true);
                        offset += 8;
                        BodyTocTableItem.area = getUint64(view, offset, true);//view.getInt32(offset, true);
                        offset += 8;
                        for (let i = 0; i < 3; i++) { //centroid (center of gravity)
                            BodyTocTableItem.centroid[i] = getUint64(view, offset, true);//view.getInt32(offset, true);
                            offset += 8;
                        }
                        BodyTocTableItem.desbyteLength = view.getInt32(offset, true);
                        offset += 4;
                        BodyTocTableItem.fdensity = view.getInt32(offset, true);
                        offset += 4;
                        BodyTocTableItem.edgeStartidx = view.getInt32(offset, true);
                        offset += 4;
                        BodyTocTableItem.edgeIdxNum = view.getInt32(offset, true);
                        offset += 4;
                    }
                };

                //LoadProperty();
            }

            function GetNodeMaxID(view, toc) {
                let offset = 8;
                let vdBlockSize = view.getUint32(offset, true);
                offset += 4;
                let max = 0;
                for (let i = 0; i < vdBlockSize; i++) {
                    let index = view.getUint32(offset, true);
                    if (max < index)
                        max = index;

                    offset += 32;
                    //offset += 4;
                    //offset += 4;
                    //offset += 4;
                    //offset += 4;
                    //offset += 4;
                    //for (let j = 0; j < 16; j++) {
                    //    offset += 4;
                    //}
                    //for (let k = 0; k < 6; k++) {
                    //    offset += 4;
                    //}
                    //offset += 4;
                    //offset += 4;
                    //offset += 4;
                    //offset += 4;
                    //offset += 4;

                    if (header.version < 302)
                        offset += 8;
                }
                return max;
            }

            // Property
            let tiPropertyIndices = FindLast(ContentsType.CTNodePropTableIndices);
            let tocPropertyIndices = m_toc[tiPropertyIndices];
            let viewPropertyIndices = ReadDataBlock(tocPropertyIndices);

            function LoadPropTableIndices(view, toc) {
                let offsetIndices = 0;
                let nTables = view.getUint32(offsetIndices, true);
                offsetIndices += 4;

                let m_nodePropTables = [];

                for (let p = 0; p < nTables; p++) {
                    let tidx = view.getUint32(offsetIndices, true);
                    offsetIndices += 4;

                    let PropTocTableItem = {
                        tableTocIdx: tidx,
                        nLoadedNodes: 0
                    };

                    m_nodePropTables.push(PropTocTableItem);
                }

                for (let pi = 0; pi < m_nodePropTables.length; pi++) {
                    let pti = m_nodePropTables[pi];
                    let tocProperty = m_toc[pti.tableTocIdx];
                    if (tocProperty === undefined) {
                        setTimeout(function () {
                            parseOnload(null, data);
                        }, 1);
                        return;
                    }
                    else {
                        let viewProperty = ReadDataBlock(tocProperty, dataView.buffer);
                        LoadPropTableItem(viewProperty, tocProperty, pti);
                    }
                }

                function LoadPropTableItem(view, toc, pti) {
                    let offset = 0;
                    let nNodesPerTable = view.getUint32(offset, true);
                    offset += 4;
                    if (pti.nLoadedNodes === nNodesPerTable)
                        return false;
                    let arrProperty = [];
                    for (let i = 0; i < nNodesPerTable; i++) {
                        let Property = {
                            nodeId: -1,
                            nNodeProps: 0,
                            items: []
                        };
                        arrProperty.push(Property);

                        Property.nodeId = view.getUint32(offset, true);
                        Property.nodeId += startID;//view.Data.GetStartID();
                        offset += 4;
                        Property.nNodeProps = view.getInt16(offset, true);
                        offset += 2;

                        let encode_utf8 = function (s) {
                            return unescape(encodeURIComponent(s));
                        };

                        let decode_utf8 = function (s) {
                            return decodeURIComponent(escape(s));
                        };

                        for (let pi = 0; pi < Property.nNodeProps; pi++) {
                            let item = {
                                key: null,
                                value: null
                                //valueType: null
                            };
                            let len = view.getUint32(offset, true);
                            offset += 4;

                            let keyBuffer = new Uint8Array(len);
                            for (let m = 0; m < len; m++) {
                                keyBuffer[m] = view.getUint8(offset + m, true);
                            }

                            item.key = String.fromCharCode.apply(null, keyBuffer);
                            item.key = decode_utf8(item.key);

                            offset += len;

                            len = view.getUint16(offset, true);
                            offset += 2;

                            len = view.getUint32(offset, true);
                            offset += 4;

                            let valueBuffer = new Uint8Array(len);
                            for (let m = 0; m < len; m++) {
                                valueBuffer[m] = view.getUint8(offset + m, true);
                            }
                            item.value = String.fromCharCode.apply(null, valueBuffer);
                            item.value = decode_utf8(item.value);

                            offset += len;

                            //item.valType = view.getUint16(offset, true);
                            offset += 2;

                            Property.items.push(item);
                        }
                    }

                    view.Data.AddUserProperty(arrProperty);

                    // ID 재조정
                    //view.Data.ResetID();

                    setTimeout(function () {
                        parseOnload(null, data);
                    }, 1);
                }
            }

            if (tocData === undefined) {
                if (!view.useFramebuffer)
                    onProgress(1, 1);
                result = null;

                if (tocStructure === undefined) {
                    setTimeout(function () {
                        parseOnload(null, data);
                    }, 1);
                }
                else {
                    setTimeout(function () {
                        ImportStructure(viewStructure, tocStructure);

                        if (tocPropertyIndices === undefined) {
                            setTimeout(function () {
                                parseOnload(null, data);
                            }, 1);
                        }
                        else {
                            setTimeout(function () {
                                LoadPropTableIndices(viewPropertyIndices, tocPropertyIndices);
                            }, 1);
                        }

                    }, 1);
                }
            }
            else {
                // ID
                let maxID = GetNodeMaxID(viewStructure, tocStructure);
                view.Data.SetStartID(file.Key, maxID);
                //startID = view.Data.GetStartID(dataId);

                let dataReadView = ReadDataBlock(tocData);

                offset = 0;
                let meshBlockNum = dataReadView.getInt32(offset, true);
                offset += 4;

                let curload = 0;
                let loading = function () {
                    for (let i = curload; i < meshBlockNum; i++) {
                        let percent = curload / meshBlockNum;
                        if (percent === Infinity)
                            percent = 0;
                        if (!view.useFramebuffer)
                            onProgress(1, percent);
                        console.log("ReadMeshBlock : " + i);
                        let cachTocIdx = 0;
                        cachTocIdx = view.getInt32(offset, true);
                        offset += 4;

                        //let tocIdx = FindToc(ContentsType.CTMeshBlockSub, cachTocIdx);//FindLast(22);
                        //toc = m_toc[tocIdx];
                        let toc = m_toc[cachTocIdx];
                        //toc = FindTocItem(cachTocIdx);

                        let viewSub = ReadDataBlock(toc);

                        ImportMeshBlock(viewSub, cachTocIdx);
                        //ImportMeshBlock_body(viewSub, cachTocIdx);
                        curload++;
                        if (curload !== meshBlockNum) {
                            setTimeout(function () {
                                if (!view.useFramebuffer)
                                    onProgress(1, percent);
                                loading();
                            }, 1);
                            break;
                        }
                        else {
                            setTimeout(function () {
                                if (!view.useFramebuffer)
                                    onProgress(1, 1);
                                result = null;

                                //setTimeout(function () {
                                //    parseOnload(view.Data.Objects, data);
                                //}, 1);

                                if (tocStructure === undefined) {
                                    setTimeout(function () {
                                        parseOnload(null, data);
                                    }, 1);
                                }
                                else {
                                    setTimeout(function () {
                                        ImportStructure(viewStructure, tocStructure);

                                        if (tocPropertyIndices === undefined) {
                                            setTimeout(function () {
                                                parseOnload(null, data);
                                            }, 1);
                                        }
                                        else {
                                            setTimeout(function () {
                                                LoadPropTableIndices(viewPropertyIndices, tocPropertyIndices);
                                            }, 1);
                                        }

                                    }, 1);
                                }
                            }, 1);
                        }
                    }
                };

                setTimeout(function () {
                    if (!view.useFramebuffer)
                        onProgress(1, 0);
                    loading();
                }, 1);
            }
        }

        function parseData_lod(result, data) {

            //console.log("Data Loading Start");
            let loaded_Structure = false;
            let loaded_MeshBlock = false;
            let loaded_Property = false;
            let meshBlockId = 0;

            let dataView = new DataView(result);
            let offset = 0;
            let header = {
                typeStr: null, // 16
                version: null, // 4
                sizeTocItem: null, //4
                nToc: null, //4
                tocPos: null //8
            };
            let buffer = new Uint8Array(result, offset, 16);
            header.typeStr = String.fromCharCode.apply(null, buffer);
            offset += 16;
            header.version = dataView.getInt32(offset, true);
            offset += 4;
            header.sizeTocItem = dataView.getInt32(offset, true);
            offset += 4;
            header.nToc = dataView.getInt32(offset, true);
            offset += 4;
            header.tocPos = getUint64(dataView, offset, true);
            offset += 8;

            let m_toc = [];
            // read toc
            let nTocOfThisSeg = 0;
            let nextPos = 0;
            let m_StreamCurrentPosition = header.tocPos;

            nTocOfThisSeg = dataView.getInt32(m_StreamCurrentPosition, true);
            m_StreamCurrentPosition += 4;
            nextPos = getUint64(dataView, m_StreamCurrentPosition, true);
            m_StreamCurrentPosition += 8;

            for (let i = 0; i < nTocOfThisSeg; i++) {
                ReadTocItem(i);
            }

            function ReadTocItem(tocIdx) {
                let itemPos = header.tocPos + 12 + (tocIdx * header.sizeTocItem);

                // Core에서 8ㅠyte로 써짐 뒤 4byte는 더미데이터
                let itemType = dataView.getInt32(itemPos, true);
                itemPos += 8;
                let position = getUint64(dataView, itemPos, true);
                itemPos += 8;
                let dataSize = dataView.getUint32(itemPos, true);
                itemPos += 4;
                let uncompSize = dataView.getUint32(itemPos, true);
                itemPos += 4;
                let parsetype = 0;
                if (view.Loader.parsetype === 1) {
                    parsetype = dataView.getUint32(itemPos, true);
                    itemPos += 4;
                }

                let toc = {
                    itemType: itemType,
                    position: position,
                    datasize: dataSize,
                    uncompsize: uncompSize,
                    parsetype: parsetype
                };
                m_toc.push(toc);
            }

            function FindLast(ctt) {
                let tocIdx = -1;
                for (let i = m_toc.length - 1; i >= 0; i--) {
                    if (m_toc[i].itemType === ctt) {
                        tocIdx = i;
                        break;
                    }
                }
                return tocIdx;
            }

            function FindFirst(ctt) {
                let tocIdx = -1;
                for (let i = 0; i < m_toc.length; i++) {
                    if (m_toc[i].itemType === ctt) {
                        tocIdx = i;
                        break;
                    }
                }
                return tocIdx;
            }

            // MeshData
            function ReadDataBlock(ti, buffer) {
                try {
                    if (ti === undefined)
                        return undefined;

                    let m_StreamCurrentPosition = ti.position;
                    let dataView;
                    if (buffer === undefined) {
                        dataView = new DataView(result, m_StreamCurrentPosition, ti.datasize);
                        return dataView;
                    }
                    else {
                        dataView = new DataView(buffer, m_StreamCurrentPosition, ti.datasize);
                        return dataView;
                    }

                } catch (e) {
                    return undefined;
                }
            }

            function ImportMeshBlock(dataView, tiStruct) {
                //let vnElemsSize = 15;
                //let triElemsSize = 2 * 3;
                let meshoffset = 0;
                let MeshBlockSize;
                MeshBlockSize = dataView.getInt32(meshoffset, true);
                meshoffset += 4;

                let readUV = false;

                if (header.version >= 305 ||
                    (file.headerVersion !== undefined && file.headerVersion >= 0x00010011)) {
                    readUV = true;
                }

                for (let i = 0; i < MeshBlockSize; i++) {

                    let bUseMaterialFlag = false;
                    if (file.headerVersion !== undefined && file.headerVersion >= 0x00010011) {
                        let nUseMaterial = dataView.getInt32(meshoffset, true);
                        if (nUseMaterial === 1)
                            bUseMaterialFlag = true;
                        meshoffset += 4;
                    }

                    let materialID = -1;
                    let color = new VIZCore.Color();

                    if (bUseMaterialFlag) {
                        color.set(255, 255, 255, 255);

                        let mr = dataView.getUint8(meshoffset, true);
                        let mg = dataView.getUint8(meshoffset + 1, true);
                        let mb = dataView.getUint8(meshoffset + 2, true);
                        let ma = dataView.getUint8(meshoffset + 3, true);

                        materialID = ma + (mb << 8) + (mg << 16) + (mr * 16777216); //<< 24
                    }
                    else {
                        color.r = dataView.getUint8(meshoffset, true);
                        color.g = dataView.getUint8(meshoffset + 1, true);
                        color.b = dataView.getUint8(meshoffset + 2, true);
                        color.a = dataView.getUint8(meshoffset + 3, true);
                    }
                    //let color = {
                    //    R: dataView.getUint8(meshoffset, true),
                    //    G: dataView.getUint8(meshoffset + 1, true),
                    //    B: dataView.getUint8(meshoffset + 2, true),
                    //    A: dataView.getUint8(meshoffset + 3, true)
                    //};
                    meshoffset += 4;

                    //material 등록
                    //let materialItem;
                    //let roughness = 0.5;
                    //let metallic = 0;
                    //let materialId = view.Shader.FindMaterial(color, roughness, metallic, [], []);
                    //if (materialId === 0) {
                    //    materialItem = view.Data.MaterialGLItem();
                    //    materialItem.color.copy(color);

                    //    view.Shader.AddMaterial(materialItem);
                    //}
                    //else
                    //    materialItem = view.Shader.GetMaterial(materialId);

                    let nVtx = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nNormal = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nTri = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nUV = 0;
                    if (readUV) {
                        nUV = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                    }

                    //material 등록
                    let materialItem;
                    let roughness = 0.5;
                    let metallic = 0.0;
                    //let materialId = 0;
                    //if (materialId === 0) {
                    if (view.DemoType === 4 && materialItem === undefined) {
                        materialItem = view.Data.MaterialGLItem(VIZCore.Enum.SHADER_TYPES.PBR);
                        //let materialCurrentItemId = view.Shader.AddMaterial(materialItem);
                        //let materialCurrentItemId = materialItem.id;
                        //materialItem.color.copy(color);

                        //rgb (255,255,255) - texture_mold.jpg / normal_mold.jpg
                        //rgb(254, 254, 254) - texture_armNwheel.jpg / normal_armNwheel.jpg
                        //rgb(253, 253, 253) - texture_leather.jpg / normal_leather.jpg
                        //rgb(252, 252, 252) - texture_steel.jpg / normal_steel.jpg
                        //rgb(204, 204, 204) - PlaneShadow.png
                        //rgb(150, 150, 150) - texture_wheel.jpg / normal_wheel.jpg                  

                        if (nUV > 0) {
                            //uv Texture

                            let uvTextureType = -1;
                            if (color.r === 255) {
                                uvTextureType = 100;
                                //uvTextureType = 150;
                                //uvTextureType = -1;

                                roughness = 0.8;
                                metallic = 0.0;

                                //roughness = 0.0;
                                //metallic = 0.0;

                                //roughness = 0.0;
                                //metallic = 1.0;

                                materialItem.tiling.x = 10.0;//4
                                materialItem.tiling.y = -10.0;//4

                                materialItem.offset.x = -2.0;
                                materialItem.offset.y = 2.0;

                                color.r = 255;
                                color.g = 255;
                                color.b = 255;
                                color.a = 255;
                            }
                            else if (color.r === 254) {
                                uvTextureType = 101;

                                roughness = 0.3;
                                metallic = 0.05;

                                //roughness = 0.0;
                                //metallic = 0.05;

                                //roughness = 0.0;
                                //metallic = 1.0;

                                //materialItem.roughness = 0.5;
                                //materialItem.metallic = 0.0;

                                materialItem.tiling.x = 3.0;
                                materialItem.tiling.y = -3.0;

                                materialItem.offset.x = -4.0;
                                materialItem.offset.y = -4.0;

                                color.r = 255;
                                color.g = 255;
                                color.b = 255;
                                color.a = 255;
                            }
                            else if (color.r === 253) {
                                uvTextureType = 102;

                                roughness = 0.3; // roughness = 0.6;
                                metallic = 0.05;

                                //materialItem.roughness = 0.5;
                                //materialItem.metallic = 0.0;

                                materialItem.tiling.x = 30.0;
                                materialItem.tiling.y = -30.0;

                                materialItem.offset.x = 0.0;
                                materialItem.offset.y = 0.0;

                                //uvTextureType = 152;

                                //materialItem.tiling.x = 10.0;
                                //materialItem.tiling.y = 10.0;
                                //
                                //materialItem.offset.x = 0.0;
                                //materialItem.offset.y = 0.0;

                                color.r = 255;
                                color.g = 255;
                                color.b = 255;
                                color.a = 255;
                            }
                            else if (color.r === 252) {
                                uvTextureType = 103;

                                roughness = 0.3;
                                metallic = 0.4;

                                //roughness = 0.5;
                                //metallic = 0.0;

                                materialItem.tiling.x = 20.0; //10
                                materialItem.tiling.y = -20.0;

                                materialItem.offset.x = -4.5;
                                materialItem.offset.y = -4.5;

                                color.r = 255;
                                color.g = 255;
                                color.b = 255;
                                color.a = 255;
                            }
                            else if (color.r === 150) {
                                uvTextureType = 104;

                                roughness = 0.3;
                                metallic = 0.05;

                                //roughness = 0.5;
                                //metallic = 0.0;

                                materialItem.tiling.x = 10.0;
                                materialItem.tiling.y = -10.0;

                                materialItem.offset.x = 0.0;
                                materialItem.offset.y = 0.0;

                                color.r = 255;
                                color.g = 255;
                                color.b = 255;
                                color.a = 255;
                            }
                            else if (color.r === 204) {
                                uvTextureType = 105;

                                roughness = 0;
                                metallic = 0;

                                materialItem.tiling.x = 1.0;
                                materialItem.tiling.y = -1.0;

                                materialItem.offset.x = 0.0;
                                materialItem.offset.y = 0.0;

                                color.r = 255;
                                color.g = 255;
                                color.b = 255;
                                color.a = 100;
                            }
                            else {
                                //console.log("color r : " + color.r);
                            }

                            materialItem.color.copy(color);
                            materialItem.tag.u_Roughness.value = roughness;
                            materialItem.tag.u_Metallic.value = metallic;

                            let textureSrc = view.Util.GetTESTTextureData64Src(uvTextureType);
                            let normalTextureSrc = view.Util.GetTESTTextureData64Src(uvTextureType + 100);

                            if (textureSrc.localeCompare("") !== 0) {
                                let imageTextureSrc = new Image();
                                imageTextureSrc.src = textureSrc;
                                imageTextureSrc.onload = function () {
                                    materialItem.diffuseSrc = imageTextureSrc;

                                    materialItem.diffuseWidth = imageTextureSrc.width;
                                    materialItem.diffuseHeight = imageTextureSrc.height;


                                    setTimeout(function () {
                                        view.MeshBlock.Reset();
                                        view.Renderer.Render();
                                    }, 10);
                                    //view.MeshBlock.Reset();
                                    ////view.Renderer.MainFBClear();
                                    //view.Renderer.Render();
                                }
                            }

                            if (normalTextureSrc.localeCompare("") !== 0) {
                                let imageNormalTextureSrc = new Image();
                                imageNormalTextureSrc.src = normalTextureSrc;
                                imageNormalTextureSrc.onload = function () {
                                    materialItem.normalSrc = imageNormalTextureSrc;

                                    materialItem.normalWidth = imageNormalTextureSrc.width;
                                    materialItem.normalHeight = imageNormalTextureSrc.height;

                                    setTimeout(function () {
                                        view.MeshBlock.Reset();
                                        view.Renderer.Render();
                                    }, 10);

                                    //view.MeshBlock.Reset();
                                    ////view.Renderer.MainFBClear();
                                    //view.Renderer.Render();
                                }
                            }
                        }

                        //imageTextureSrc, imageNormalTextureSrc;
                        //나중에 바이너리 데이터 비교로 변경필요
                        //materialId = view.Shader.FindMaterial(color, roughness, metallic, [], []);

                        if (materialId === 0)
                            view.Shader.AddMaterial(materialItem);
                        else
                            materialItem = view.Shader.GetMaterial(materialId);
                    }
                    else if (view.DemoType === 3) {
                        //materialItem = view.Data.MaterialGLItem();
                        //let materialCurrentItemId = view.Shader.AddMaterial(materialItem);
                        //
                        //roughness = 0.0;
                        //metallic = 0.0;
                        //
                        //materialItem.tiling.x = 1.0;
                        //materialItem.tiling.y = 1.0;
                        //
                        //materialItem.offset.x = 0.0;
                        //materialItem.offset.y = 0.0;
                        //
                        //color.r = 255;
                        //color.g = 255;
                        //color.b = 255;
                        //color.a = 255
                        //
                        //materialItem.color.copy(color);
                        //materialItem.roughness = roughness;
                        //materialItem.metallic = metallic;
                        //
                        //{
                        //    let imageTextureSrc = new Image();
                        //    imageTextureSrc.src = "";
                        //    imageTextureSrc.onload = function () {
                        //        materialItem.diffuseSrc = imageTextureSrc;
                        //
                        //        materialItem.diffuseWidth = imageTextureSrc.width;
                        //        materialItem.diffuseHeight = imageTextureSrc.height;
                        //
                        //        view.MeshBlock.Reset();
                        //        view.Renderer.Render();
                        //    }
                        //}

                        ////imageTextureSrc, imageNormalTextureSrc;
                        ////나중에 바이너리 데이터 비교로 변경필요
                        //materialId = view.Shader.FindMaterial(color, roughness, metallic, [], []);

                        //if (materialId === 0)
                        //    view.Shader.AddMaterial(materialItem);
                        //else
                        //    materialItem = view.Shader.GetMaterial(materialId);
                    }
                    else if (view.UV_DEBUG) {
                        //materialItem = view.Data.MaterialGLItem();
                        //
                        //materialItem.color.copy(color);
                        //materialItem.roughness = roughness;
                        //materialItem.metallic = metallic;
                        //
                        ////let materialCurrentItemId = view.Shader.AddMaterial(materialItem);
                        //
                        ////materialId = view.Shader.FindMaterial(color, roughness, metallic, [], []);
                        //materialId = view.Shader.FindMaterialFromItem(materialItem);
                        //
                        //if (materialId === 0)
                        //    view.Shader.AddMaterial(materialItem);
                        //else
                        //    materialItem = view.Shader.GetMaterial(materialId);
                    }

                    //cntTriAll += nTri;
                    if (view.Loader.parsetype === 1) {
                        let ptype = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                    }

                    //let cnt = nVtx / 15;
                    // (meshoffset + dataView.byteOffset)가 4의 배수여야 함
                    let vtArray = new Float32Array(result, meshoffset + dataView.byteOffset, nVtx);
                    meshoffset += nVtx * 4;
                    let vnArray = new Float32Array(result, meshoffset + dataView.byteOffset, nNormal);
                    meshoffset += nNormal * 4;
                    let triArray = new Uint32Array(result, meshoffset + dataView.byteOffset, nTri);
                    meshoffset += nTri * 4;

                    let uvArray;
                    //if (header.version >= 305 && nUV > 0) {
                    if (nUV > 0) {
                        //uvArray = new Float64Array(result, meshoffset + dataView.byteOffset, nUV);
                        //meshoffset += nUV * 8;
                        uvArray = new Float32Array(result, meshoffset + dataView.byteOffset, nUV);
                        meshoffset += nUV * 4;
                    }

                    let object = view.Data.Object3D();
                    object.index = meshBlockId;

                    object.id_file = file.Key;
                    object.link = file.Url;
                    // 데이터 추출
                    object.attribs.a_index.array = triArray;
                    object.numElements = object.attribs.a_index.array.length;

                    object.attribs.a_position.array = vtArray;
                    object.attribs.a_normal.array = vnArray;

                    //Matrix Index 기본값으로 등록
                    if (view.DemoType === 2) {
                        let matrixIdxArray = new Uint16Array(vnArray.length);
                        for (let j = 0; j < vnArray.length; j++) {
                            matrixIdxArray[j] = 0;
                        }

                        object.attribs.a_matrixIndex.array = matrixIdxArray;
                    }

                    if (nUV > 0 && view.UV_DEBUG) {
                        object.attribs.a_uv.array = uvArray;
                    }

                    //데이터 제외 테스트
                    //object.numElements = 0;
                    //object.attribs.a_index.array = [];
                    //object.attribs.a_position.array = [];
                    //object.attribs.a_normal.array = [];
                    //object.attribs.a_color.array = [];
                    let MeshSize = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let datas = [];
                    let colors = [];
                    let colorsOffset = 0;
                    for (let j = 0; j < MeshSize; j++) {
                        let partid = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                        let bodyid = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;

                        let origin_id = bodyid; //원본 Body ID

                        let m_vnIdx = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                        let m_triIdx = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;

                        let m_uvIdx = 0;
                        if (readUV) {
                            m_uvIdx = dataView.getUint32(meshoffset, true);
                            meshoffset += 4;
                        }

                        let MnVtx = dataView.getUint16(meshoffset, true);
                        meshoffset += 2;
                        let MnTri = dataView.getUint16(meshoffset, true);
                        meshoffset += 2;

                        let MnUV = 0;
                        if (readUV) {
                            MnUV = dataView.getUint32(meshoffset, true);
                            meshoffset += 4;
                        }

                        // (meshoffset + dataView.byteOffset)가 4의 배수여야 함
                        let bbox = new Float32Array(dataView.buffer, meshoffset + dataView.byteOffset, 6);
                        //let bbox = new Float32Array(dataView.buffer, meshoffset, 6);
                        meshoffset += 24;


                        //test 형상 제거
                        //m_vnIdx = 0;
                        //m_triIdx = 0;
                        //MnVtx = 0;
                        //MnTri = 0;

                        let data;
                        let bodyAction;
                        if (view.UV_DEBUG) {

                            let bboxTmp = new VIZCore.BBox(bbox);
                            data = {
                                partId: partid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                                bodyId: bodyid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                                origin_id: origin_id,

                                color: color,
                                material: -1,
                                m_vnIdx: m_vnIdx * 3,
                                m_triIdx: m_triIdx * 3,
                                m_uvIdx: m_uvIdx * 2,

                                m_nVtx: MnVtx * 3,
                                m_nTris: MnTri * 3,
                                m_nUV: MnUV * 2,

                                BBox: bboxTmp,

                                colorIdx: null,
                                object: null
                            };

                            //if (view.DemoType === 4) {
                            //    data.action.material = materialItem.id;
                            //}
                            //if (materialItem !== undefined)
                            //    data.action.material = materialItem.id;

                            bodyAction = view.Data.ShapeAction.GetAction(file.Key, origin_id);
                            if (bodyAction === undefined) {
                                bodyAction = view.Data.ActionItem();
                            }

                            bodyAction.material = materialID;

                        }
                        else if (view.DemoType === 3) {
                            //let action = view.Data.ActionItem();
                            let bboxTmp = new VIZCore.BBox(bbox);
                            
                            if (file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/BIKE.vizw") === 0
                                || file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/BUS.vizw") === 0
                                || file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/CAR_A.vizw") === 0
                                || file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/CAR_B.vizw") === 0
                            ) {
                                //action.transform.translate(5568841, 2850092, 50573);
                                //bboxTmp.min.x += 5568841;
                                //bboxTmp.min.y += 2850092;
                                //bboxTmp.min.z += 50573;
                                //bboxTmp.max.x += 5568841;
                                //bboxTmp.max.y+= 2850092;
                                //bboxTmp.max.z += 50573;
                                //bboxTmp.update();
                            }
                            data = {
                                partId: partid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                                bodyId: bodyid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                                origin_id: origin_id,

                                color: color,
                                material: -1,
                                m_vnIdx: m_vnIdx * 3,
                                m_triIdx: m_triIdx * 3,
                                //m_uvIdx: m_uvIdx * 2,

                                m_nVtx: MnVtx * 3,
                                m_nTris: MnTri * 3,
                                //m_nUV: MnUV * 2,

                                BBox: bboxTmp,
                                //action: action,

                                colorIdx: null,
                                object: null
                            };

                            bodyAction = view.Data.ShapeAction.GetAction(file.Key, origin_id);
                            if (bodyAction === undefined) {
                                bodyAction = view.Data.ActionItem();
                            }

                        }
                        else {
                            data = {
                                partId: partid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                                bodyId: bodyid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                                origin_id: origin_id,

                                color: color,
                                //material: materialItem.id,
                                m_vnIdx: m_vnIdx * 3,
                                m_triIdx: m_triIdx * 3,
                                //m_uvIdx: m_uvIdx * 2,

                                m_nVtx: MnVtx * 3,
                                m_nTris: MnTri * 3,
                                //m_nUV: MnUV * 2,

                                BBox: new VIZCore.BBox(bbox),
                                //action: view.Data.ActionItem(),

                                colorIdx: null,
                                object: null
                            };

                            bodyAction = view.Data.ShapeAction.GetAction(file.Key, origin_id);
                            if (bodyAction === undefined) {
                                bodyAction = view.Data.ActionItem();
                            }

                        }

                        if (bodyAction !== undefined && bodyAction.customColor) {
                            //비어있는 사용자 색상 및 투명도 설정
                            if (bodyAction.color !== undefined) {
                                if (bodyAction.color.r === undefined) {
                                    bodyAction.color.r = color.r;
                                }
                                if (bodyAction.color.g === undefined) {
                                    bodyAction.color.g = color.g;
                                }
                                if (bodyAction.color.b === undefined) {
                                    bodyAction.color.b = color.b;
                                }
                                if (bodyAction.color.a === undefined) {
                                    bodyAction.color.a = color.a;
                                }
                            }
                        }

                        if (file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/BIKE.vizw") === 0) {
                            data.partid = view.Animation.GetAnimationBodyID(file.Url);
                            data.bodyId = view.Animation.GetAnimationBodyID(file.Url);
                        }
                        else if (file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/BUS.vizw") === 0) {
                            data.partid = view.Animation.GetAnimationBodyID(file.Url);
                            data.bodyId = view.Animation.GetAnimationBodyID(file.Url);
                        }
                        else if (file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/CAR_A.vizw") === 0) {
                            data.partid = view.Animation.GetAnimationBodyID(file.Url);
                            data.bodyId = view.Animation.GetAnimationBodyID(file.Url);
                            if (data.bodyId < 200020)
                                console.log("");
                        }
                        else if (file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/CAR_B.vizw") === 0) {
                            data.partid = view.Animation.GetAnimationBodyID(file.Url);
                            data.bodyId = view.Animation.GetAnimationBodyID(file.Url);
                        }

                        // 색상 ID 재설정
                        view.Data.IDColor.new();
                        //data.action.transform.setPosition(view.Data.TmpTransform);
                        //rgb
                        //data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16);
                        //rgba
                        data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16) + (view.Data.IDColor.a * 16777216); //<< 24

                        //let colorArrLength = data.m_nVtx;
                        let colorArrLength = data.m_nVtx / 3 * 4; //vectex 3, color는 4
                        for (let k = 0; k < colorArrLength; k = k + 4) {
                            colors[colorsOffset + k + 0] = view.Data.IDColor.r;
                            colors[colorsOffset + k + 1] = view.Data.IDColor.g;
                            colors[colorsOffset + k + 2] = view.Data.IDColor.b;
                            colors[colorsOffset + k + 3] = view.Data.IDColor.a;
                        }
                        colorsOffset += colorArrLength;

                        data.object = object;
                        datas.push(data);
                        view.Data.AddBody(data);

                        //Action 데이터 설정
                        {
                            //파일 읽는 부분에서 material 등록이 있기때문에 등록 필요
                            view.Data.ShapeAction.SetAction(file.Key, origin_id, bodyAction);
                        }

                        if (view.DemoType === 2) {
                            //Hyundai vizw 바운드 박스 크기가 달라 새로 구함

                            let aabb = view.MeshProcess.GetAABBFromMatrix([data]);
                            data.BBox = aabb;
                        }
                    }
                    //newPos(view.Data.TmpTransform, 30, 300);

                    object.attribs.a_color.array = new Uint8Array(colors, 0, colorsOffset);
                    //object.attribs.a_color.array = new Float32Array(colors, 0, vtArray.length); 

                    view.Data.Objects.push(object);
                    object.tag = datas;

                    if (view.DataSplit !== 0) {
                        let fileAreaData = view.Data.ModelFileManager.GetFileAreaData(file.Key, file.Url);
                        fileAreaData.objects.push(object);
                    }

                    meshBlockId++;
                }
            }

            function copyMeshBlock(dataView, idOffset) {

                // 파일 아이디 재설정
                file.ID += idOffset;

                let meshoffset = 0;
                let MeshBlockSize;
                MeshBlockSize = dataView.getInt32(meshoffset, true);
                meshoffset += 4;

                for (let i = 0; i < MeshBlockSize; i++) {
                    let color = new VIZCore.Color();
                    color.r = dataView.getUint8(meshoffset, true);
                    color.g = dataView.getUint8(meshoffset + 1, true);
                    color.b = dataView.getUint8(meshoffset + 2, true);
                    color.a = dataView.getUint8(meshoffset + 3, true);

                    meshoffset += 4;

                    let nVtx = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nNormal = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nTri = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let nUV = 0;
                    if (header.version >= 305) {
                        nUV = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                    }

                    //material 등록
                    let materialItem;
                    let roughness = 0.5;
                    let metallic = 0;
                    let materialId = 0;

                    if (view.Loader.parsetype === 1) {
                        let ptype = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                    }

                    //let cnt = nVtx / 15;
                    // (meshoffset + dataView.byteOffset)가 4의 배수여야 함
                    let vtArray = new Float32Array(result, meshoffset + dataView.byteOffset, nVtx);
                    meshoffset += nVtx * 4;
                    let vnArray = new Float32Array(result, meshoffset + dataView.byteOffset, nNormal);
                    meshoffset += nNormal * 4;
                    let triArray = new Uint32Array(result, meshoffset + dataView.byteOffset, nTri);
                    meshoffset += nTri * 4;

                    let uvArray;
                    if (header.version >= 305 && nUV > 0) {
                        //uvArray = new Float64Array(result, meshoffset + dataView.byteOffset, nUV);
                        //meshoffset += nUV * 8;
                        uvArray = new Float32Array(result, meshoffset + dataView.byteOffset, nUV);
                        meshoffset += nUV * 4;
                    }

                    let object = view.Data.Object3D();
                    object.index = meshBlockId;
                    //object.link = file.Url;
                    // 데이터 추출
                    object.attribs.a_index.array = triArray;
                    object.numElements = object.attribs.a_index.array.length;

                    object.attribs.a_position.array = vtArray;
                    object.attribs.a_normal.array = vnArray;

                    if (nUV > 0 && view.UV_DEBUG) {
                        object.attribs.a_uv.array = uvArray;
                    }

                    let MeshSize = dataView.getUint32(meshoffset, true);
                    meshoffset += 4;
                    let datas = [];
                    let colors = [];
                    let colorsOffset = 0;
                    for (let j = 0; j < MeshSize; j++) {
                        let partid = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                        let bodyid = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;

                        let m_vnIdx = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;
                        let m_triIdx = dataView.getUint32(meshoffset, true);
                        meshoffset += 4;

                        let m_uvIdx = 0;
                        if (header.version >= 305) {
                            m_uvIdx = dataView.getUint32(meshoffset, true);
                            meshoffset += 4;
                        }

                        let MnVtx = dataView.getUint16(meshoffset, true);
                        meshoffset += 2;
                        let MnTri = dataView.getUint16(meshoffset, true);
                        meshoffset += 2;

                        let MnUV = 0;
                        if (header.version >= 305) {
                            MnUV = dataView.getUint32(meshoffset, true);
                            meshoffset += 4;
                        }

                        // (meshoffset + dataView.byteOffset)가 4의 배수여야 함
                        let bbox = new Float32Array(dataView.buffer, meshoffset + dataView.byteOffset, 6);
                        //let bbox = new Float32Array(dataView.buffer, meshoffset, 6);
                        meshoffset += 24;

                        if (view.UV_DEBUG) {
                            let data = {
                                partId: partid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),
                                bodyId: bodyid + view.Data.GetStartID(file.Key),//view.Data.GetMaxID(),

                                color: color,
                                material: materialItem.id,
                                m_vnIdx: m_vnIdx * 3,
                                m_triIdx: m_triIdx * 3,
                                m_uvIdx: m_uvIdx * 2,

                                m_nVtx: MnVtx * 3,
                                m_nTris: MnTri * 3,
                                m_nUV: MnUV * 2,

                                BBox: new VIZCore.BBox(bbox),
                                //action: view.Data.ActionItem(),

                                colorIdx: null,
                                object: null
                            };

                            // 색상 ID 재설정
                            view.Data.IDColor.new();
                            //data.action.transform.setPosition(view.Data.TmpTransform);
                            //rgb
                            //data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16);
                            //rgba
                            data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16) + (view.Data.IDColor.a * 16777216); //<< 24

                            //let colorArrLength = data.m_nVtx;
                            let colorArrLength = data.m_nVtx / 3 * 4; //vectex 3, color는 4
                            for (let k = 0; k < colorArrLength; k = k + 4) {
                                colors[colorsOffset + k + 0] = view.Data.IDColor.r;
                                colors[colorsOffset + k + 1] = view.Data.IDColor.g;
                                colors[colorsOffset + k + 2] = view.Data.IDColor.b;
                                colors[colorsOffset + k + 3] = view.Data.IDColor.a;
                            }
                            colorsOffset += colorArrLength;

                            data.object = object;
                            datas.push(data);
                            view.Data.AddBody(data);
                        }
                        else {
                            let data = {
                                partId: partid + view.Data.GetStartID(file.Key) + idOffset * 10000,//view.Data.GetMaxID(),
                                bodyId: bodyid + view.Data.GetStartID(file.Key) + idOffset * 10000,//view.Data.GetMaxID(),
                                color: color,
                                //material: materialItem.id,
                                m_vnIdx: m_vnIdx * 3,
                                m_triIdx: m_triIdx * 3,
                                //m_uvIdx: m_uvIdx * 2,

                                m_nVtx: MnVtx * 3,
                                m_nTris: MnTri * 3,
                                //m_nUV: MnUV * 2,

                                BBox: new VIZCore.BBox(bbox),
                                //action: view.Data.ActionItem(),

                                colorIdx: null,
                                object: null
                            };

                            // 색상 ID 재설정
                            view.Data.IDColor.new();
                            let tmpPosition;
                            let offsetX = 0;
                            let offsetY = 0;
                            let offValueX = 1;
                            let offValueY = 1;
                            if (idOffset < 5) {
                                offsetX = 20000;
                                offsetY = 0;
                                offValueX = idOffset;
                                offValueY = 1;
                            }
                            else {
                                offsetX = 20000;
                                offsetY = 90000;
                                offValueX = idOffset % 5;
                                offValueY = 1;
                            }

                            tmpPosition = new VIZCore.Vector3(offsetX * offValueX, offsetY * offValueY, 0);

                            //rgb
                            //data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16);
                            //rgba
                            data.colorIdx = view.Data.IDColor.r + (view.Data.IDColor.g << 8) + (view.Data.IDColor.b << 16) + (view.Data.IDColor.a * 16777216); //<< 24

                            //let colorArrLength = data.m_nVtx;
                            let colorArrLength = data.m_nVtx / 3 * 4; //vectex 3, color는 4
                            for (let k = 0; k < colorArrLength; k = k + 4) {
                                colors[colorsOffset + k + 0] = view.Data.IDColor.r;
                                colors[colorsOffset + k + 1] = view.Data.IDColor.g;
                                colors[colorsOffset + k + 2] = view.Data.IDColor.b;
                                colors[colorsOffset + k + 3] = view.Data.IDColor.a;
                            }
                            colorsOffset += colorArrLength;

                            data.object = object;
                            datas.push(data);
                            view.Data.AddBody(data);

                            //if (data.bodyId % 10000 === 298)
                            if (view.DemoType === 2) {
                                //Hyundai vizw 바운드 박스 크기가 달라 새로 구함

                                let aabb = view.MeshProcess.GetAABBFormMatrix([data]);
                                data.BBox = aabb;
                            }

                            //data.BBox.min.add(tmpPosition);
                            //data.BBox.max.add(tmpPosition);

                            //action 로직 수정
                            //data.action.transform.setPosition(tmpPosition);
                            //data.action.instance.setPosition(tmpPosition);
                        }


                    }
                    //newPos(view.Data.TmpTransform, 30, 300);

                    object.attribs.a_color.array = new Uint8Array(colors, 0, colorsOffset);
                    //object.attribs.a_color.array = new Float32Array(colors, 0, vtArray.length); 

                    view.Data.Objects.push(object);
                    object.tag = datas;

                    if (view.DataSplit !== 0) {
                        let fileAreaData = view.Data.ModelFileManager.GetFileAreaData(file.Key, file.Url);
                        fileAreaData.objects.push(object);
                    }

                    meshBlockId++;
                }
            }

            function ImportStructure(dataView, toc) {
                let offset = 0;
                let m_Unit = dataView.getUint32(offset, true);
                offset += 4;
                let nEnts = dataView.getUint32(offset, true);
                offset += 4;
                let vdBlockSize = dataView.getUint32(offset, true);
                offset += 4;

                let m_vecPropHeaderDic = []; // 136 Byte
                let m_vecPropHeaderNameIndexDic = [];
                for (let i = 0; i < vdBlockSize; i++) {
                    //HeaderTocTableItem = {
                    //    index: -1,
                    //    itemType: 0,
                    //    entFlags: 0,
                    //    iNameIndex: -1,
                    //    attFlags: 0,
                    //    transfrom: [],
                    //    bBox: [],
                    //    BBox: null,
                    //    cCount: -1,
                    //    pIndex: -1,
                    //    orgNodeID: -1,
                    //    pNameBuff: null,
                    //    tocId: 0,
                    //    btype: 0,
                    //    name: null
                    //};

                    //간소화
                    let HeaderTocTableItem = view.Data.NodeItem();

                    let index = dataView.getUint32(offset, true);
                    HeaderTocTableItem.origin_id = index;
                    HeaderTocTableItem.index = index === -1 ? index : index + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                    offset += 4;
                    HeaderTocTableItem.itemType = dataView.getInt32(offset, true);
                    offset += 4;
                    //HeaderTocTableItem.entFlags = dataView.getUint16(offset, true);
                    offset += 4;
                    //HeaderTocTableItem.iNameIndex = dataView.getInt32(offset, true);
                    let iNameIndex = dataView.getInt32(offset, true);
                    offset += 4;
                    //HeaderTocTableItem.attFlags = dataView.getUint16(offset, true);
                    offset += 4;
                    //HeaderTocTableItem.transfrom = [];
                    for (let j = 0; j < 16; j++) {
                        //HeaderTocTableItem.transfrom[j] = dataView.getFloat32(offset, true);
                        offset += 4;
                    }
                    //HeaderTocTableItem.bBox = [];
                    for (let k = 0; k < 6; k++) {
                        //HeaderTocTableItem.bBox[k] = dataView.getFloat32(offset, true);
                        offset += 4;
                    }

                    //HeaderTocTableItem.BBox = new VIZCore.BBox(HeaderTocTableItem.bBox);

                    //HeaderTocTableItem.cCount = dataView.getInt32(offset, true);
                    offset += 4;
                    let pIndex = dataView.getInt32(offset, true);
                    HeaderTocTableItem.origin_pid = pIndex;
                    HeaderTocTableItem.pIndex = pIndex === -1 ? pIndex : pIndex + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                    offset += 4;
                    //HeaderTocTableItem.orgNodeID = dataView.getInt32(offset, true);
                    offset += 4;
                    //byte * pNameBuff;
                    if (header.version < 302)
                        offset += 8;

                    //HeaderTocTableItem.tocId = dataView.getInt32(offset, true); //Binary Block용 
                    offset += 4;
                    //HeaderTocTableItem.btype = dataView.getInt32(offset, true);//Binary Block용 
                    offset += 4;

                    // add
                    if (HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntAssembly
                        && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntPart
                        && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntBody) {
                        nEnts--;
                        continue;
                    }

                    m_vecPropHeaderDic.push(HeaderTocTableItem);
                    m_vecPropHeaderNameIndexDic.push(iNameIndex);
                }

                //ModelFileManager 방식으로 변경
                //view.Data.AddNodes(m_vecPropHeaderDic);

                // NodeName
                let nNameNum = dataView.getInt32(offset, true);
                offset += 4;
                let decode_utf8 = function (s) {
                    try {
                        return decodeURIComponent(escape(s));
                    }
                    catch (e) {
                        return s;
                    }
                };
                let m_vecPropNodeNameDic = [];

                let stNameOffset = offset;
                let pos = 0;
                //이름 적용
                for (let l = 0; l < nEnts; l++) {
                    if (m_vecPropHeaderNameIndexDic[l] <= 0)
                        continue;

                    let NameTocTableItem = {
                        nStringNum: 0,
                        pos: 0,
                        name: null
                    };

                    NameTocTableItem.pos = pos;
                    NameTocTableItem.nStringNum = m_vecPropHeaderNameIndexDic[l];

                    let bodyNameBuffer = new Uint8Array(NameTocTableItem.nStringNum);
                    for (let m = 0; m < NameTocTableItem.nStringNum; m++) {
                        // Multibyte
                        //if(m%2 ===0)
                        //    bodyNameBuffer[m/2] = dataView.getUint8(pos + stNameOffset + m, true);
                        bodyNameBuffer[m] = dataView.getUint8(pos + stNameOffset + m, true);
                    }

                    let bodyName = String.fromCharCode.apply(null, bodyNameBuffer);
                    bodyName = decode_utf8(bodyName);

                    //[정규식 이용해서 gi 로 감싸기]
                    //감싼 따옴표를 슬래시로 대체하고 뒤에 gi 를 붙이면 
                    //replaceAll 과 같은 결과를 볼 수 있다.
                    //* g : 발생할 모든 pattern에 대한 전역 검색
                    //* i : 대 / 소문자 구분 안함
                    //* m: 여러 줄 검색(참고)

                    m_vecPropHeaderDic[l].name = bodyName.replace(/\0/gi, '');
                    NameTocTableItem.name = bodyName.replace(/\0/gi, '');
                    pos += m_vecPropHeaderNameIndexDic[l];

                    //기존
                    //m_vecPropNodeNameDic.push(NameTocTableItem);

                    //
                    m_vecPropNodeNameDic[l] = NameTocTableItem;
                }
                offset += nNameNum;

                //Binary 방식으로 적용하여 header vizw와 동일하게 사용하도록 변경
                {
                    // // 하위에서 부모 노드를 찾기 위한 Offset
                    // Tree_Parent_Offset: 0,
                    // // 최하위 자식 노드 Offset
                    // Tree_Last_Offset: 4,
                    // // 동일레벨 마지막 노드 Offset
                    // Tree_Sibling_Offset: 8,
                    // // 트리 레벨
                    // Tree_Level: 12,
                    // // 트리 확장 정보
                    // //Tree_Expand: 16,
                    // // 트리 이름 Offset
                    // Tree_Neme_Offset: 16,
                    // // 트리 이름 크기
                    // Tree_Name_Lengh: 20,
                    // // 노드 아이디
                    // Node_ID: 24,
                    // // 노드 타입
                    // Node_Type: 28

                    let getTreeBufferInfoItem = function () {
                        let item = {
                            readIdx: -1,   //읽은 데이터

                            index: -1,
                            offset: -1,

                            parentOffset: -1,
                            lastOffset: -1,
                            siblingOffset: -1,
                            level: 0,

                            expand: 0,

                            nameOffset: 0,
                            nameLength: 0,

                            node_id: 0,
                            node_type: 0,


                            //검색용
                            parent: undefined,
                            child: []
                        }

                        return item;
                    };

                    let currentListNodeID = [];
                    let currentListIndexByID = [];

                    let treeSize = 8; // 트리정보 Size_0x00010000 초기 버전으로 적용
                    let treeBufferSize = 32;


                    let mapBufferInfo = new Map();  //nodeID, idx
                    let listBufferInfo = [];

                    //BufferInfo 초기값 설정
                    for (let i = 0; i < vdBlockSize; i++) {
                        let headerTocTableItem = m_vecPropHeaderDic[i];
                        if (headerTocTableItem === undefined)
                            continue;

                        let bufferInfo = getTreeBufferInfoItem();
                        bufferInfo.readIdx = i;

                        bufferInfo.node_id = headerTocTableItem.origin_id;
                        bufferInfo.node_type = headerTocTableItem.itemType;

                        //treeOffset += treeSize;
                        listBufferInfo[i] = bufferInfo;

                        mapBufferInfo.set(bufferInfo.node_id, i);
                    }

                    //상위, 하위 구조 연결
                    for (let i = 0; i < vdBlockSize; i++) {
                        let headerTocTableItem = m_vecPropHeaderDic[i];

                        if (headerTocTableItem === undefined)
                            continue;

                        let bufferInfo = listBufferInfo[i];

                        //부모 연결 및 하위 연결
                        if (mapBufferInfo.has(headerTocTableItem.origin_pid)) {
                            let parentBufferInfo = listBufferInfo[mapBufferInfo.get(headerTocTableItem.origin_pid)];

                            bufferInfo.parent = parentBufferInfo;
                            //bufferInfo.parentOffset = parentBufferInfo.offset;

                            parentBufferInfo.child.push(bufferInfo);
                        }
                    }

                    //순서 정렬
                    {
                        let listSortBufferInfo = [];
                        let sortBufferInfo = function (bufferInfo) {
                            listSortBufferInfo.push(bufferInfo);

                            for (let i = 0; i < bufferInfo.child.length; i++)
                                sortBufferInfo(bufferInfo.child[i]);
                        };

                        for (let i = 0; i < listBufferInfo.length; i++) {
                            let bufferInfo = listBufferInfo[i];
                            if (bufferInfo.parent !== undefined) continue;

                            sortBufferInfo(bufferInfo);
                        }

                        listBufferInfo = listSortBufferInfo;
                    }

                    //정렬된 개체 index 및 Offset
                    for (let i = 0; i < listBufferInfo.length; i++) {
                        let bufferInfo = listBufferInfo[i];

                        bufferInfo.index = i;
                        bufferInfo.offset = i * treeBufferSize;
                    }


                    let findInfoLevel = function (bufferInfo, parentBufferInfo) {
                        if (parentBufferInfo.parent === undefined) return;

                        bufferInfo.level++;
                        findInfoLevel(bufferInfo, parentBufferInfo.parent);
                    };

                    let findLastChildBufferOffset = function (bufferInfo) {

                        if (bufferInfo.child.length > 0) {
                            return findLastChildBufferOffset(bufferInfo.child[bufferInfo.child.length - 1]);
                        }
                        else {
                            return bufferInfo.offset;
                        }
                    };

                    //상위 계산
                    //하위 Buffer 계산
                    for (let i = 0; i < listBufferInfo.length; i++) {
                        let bufferInfo = listBufferInfo[i];

                        //상위 Offset
                        if (bufferInfo.parent !== undefined)
                            bufferInfo.parentOffset = bufferInfo.parent.offset;

                        findInfoLevel(bufferInfo, bufferInfo);

                        if (bufferInfo.child.length > 0) {
                            bufferInfo.siblingOffset = bufferInfo.child[bufferInfo.child.length - 1].offset;
                            bufferInfo.lastOffset = findLastChildBufferOffset(bufferInfo);
                        }
                        else {
                            bufferInfo.siblingOffset = bufferInfo.offset;
                            bufferInfo.lastOffset = bufferInfo.offset;
                        }
                    }

                    //이름 버퍼 입력
                    let treeNameBufferOffset = 0;

                    //트리구조 버퍼 생성
                    let treeOffset = 0;
                    let treeBuffer = new ArrayBuffer(vdBlockSize * treeBufferSize);
                    let arrInt = new Int32Array(treeBuffer, 0, vdBlockSize * treeSize); //4 * 9

                    treeNameBufferOffset = 0;
                    let treeNameBuffer = new ArrayBuffer(nNameNum);
                    let arrNameInt8 = new Uint8Array(treeNameBuffer, 0, nNameNum);

                    for (let i = 0; i < listBufferInfo.length; i++) {
                        let bufferInfo = listBufferInfo[i];
                        //let bodyNameBuffer = new Uint8Array(bufferInfo.nameLength);
                        //let bodyNameBuffer = new Uint8Array(dataView.buffer, treeNameBufferOffset + stNameOffset, bufferInfo.nameLength);

                        if (m_vecPropNodeNameDic[bufferInfo.readIdx] !== undefined) {
                            let vecNodeName = m_vecPropNodeNameDic[bufferInfo.readIdx];
                            let utf8 = unescape(encodeURIComponent(vecNodeName.name));

                            let bodyNameBuffer = new ArrayBuffer(utf8.length); // 2 bytes for each char
                            let bufView = new Uint8Array(bodyNameBuffer);
                            for (let j = 0, strLen = utf8.length; j < strLen; j++) {
                                bufView[j] = utf8.charCodeAt(j);
                            }

                            //UTF-8 아닌경우가 있어서 재 계산 하여 추가

                            //재 계산된 offset
                            bufferInfo.nameOffset = treeNameBufferOffset;
                            bufferInfo.nameLength = utf8.length;

                            arrNameInt8.set(bufView, treeNameBufferOffset);
                            treeNameBufferOffset += bufferInfo.nameLength;
                        }

                        arrInt.set([
                            bufferInfo.parentOffset,
                            bufferInfo.lastOffset,
                            bufferInfo.siblingOffset,
                            bufferInfo.level,

                            bufferInfo.nameOffset,
                            bufferInfo.nameLength,
                            bufferInfo.node_id,
                            bufferInfo.node_type
                        ], treeOffset);
                        treeOffset += treeSize;

                        currentListNodeID[i] = bufferInfo.node_id;
                        currentListIndexByID[bufferInfo.node_id] = i;
                    }

                    //Structure 추가 완료
                    {
                        let fileInfo = view.Data.ModelFileManager.GetFileInfo(file.Key);
                        //let fileDataInfo = view.Data.ModelFileManager.AddFileDataInfo(fileInfo, VIZCore.Enum.FILEINFOTYPE.STRUCTURE, VIZCore.Enum.FILEINFOTYPE.STRUCTURE);
                        let fileDataInfo = view.Data.ModelFileManager.AddFileDataInfo(fileInfo, file.Key, VIZCore.Enum.FILEINFOTYPE.STRUCTURE);

                        if (fileDataInfo !== undefined) {
                            let binaryInfo = view.Data.TreeBinaryInfoItem();

                            binaryInfo.key = file.Key;
                            //binaryInfo.idx_start = nodeCnt;
                            //binaryInfo.idx_end = nodeCnt + cnt;
                            binaryInfo.idx_start = 0;
                            binaryInfo.idx_end = vdBlockSize;
                            binaryInfo.offset_start = 0;
                            //binaryInfo.info = viewStructureInfo;
                            binaryInfo.structure = new DataView(treeBuffer);
                            binaryInfo.name = new DataView(treeNameBuffer);
                            binaryInfo.size = treeBufferSize;

                            binaryInfo.listNodeID = currentListNodeID;
                            binaryInfo.listIndexByID = currentListIndexByID;

                            fileDataInfo.tag = binaryInfo;

                            fileInfo.listNodeID = currentListNodeID;
                            fileInfo.listIndexByID = currentListIndexByID;

                            //노드 Index 갱신
                            fileDataInfo.Download = true;
                        }
                    }

                }

                loaded_Structure = true;
                checkLoaded();
            }

            function ImportSplitStructure(dataView, toc) {
                let offset = 0;
                let vdBlockSize = dataView.getUint32(offset, true);
                offset += 4;

                let decode_utf8 = function (s) {
                    try {
                        return decodeURIComponent(escape(s));
                    }
                    catch (e) {
                        return s;
                    }
                };

                let m_vecPropHeaderDic = []; // 136 Byte

                switch (view.DataSplit) {
                    //간소화 분할구조
                    case 2:
                        {
                            for (let i = 0; i < vdBlockSize; i++) {
                                //HeaderTocTableItem = {
                                //    index: -1,
                                //    itemType: 0,
                                //    entFlags: 0,
                                //    iNameIndex: -1,
                                //    attFlags: 0,
                                //    transfrom: [],
                                //    bBox: [],
                                //    BBox: null,
                                //    cCount: -1,
                                //    pIndex: -1,
                                //    orgNodeID: -1,
                                //    pNameBuff: null,
                                //    tocId: 0,
                                //    btype: 0,
                                //    name: null
                                //};

                                let HeaderTocTableItem = view.Data.NodeItem();
                                //let HeaderTocTableItem = {
                                //    index: -1,
                                //    itemType: 0,
                                //    pIndex: -1,
                                //    name: null,
                                //    sub: [],
                                //};

                                //let HeaderTocTableItem = new view.Data.StructureItem();

                                //let HeaderTocTableItem = new view.Data.TableItem(-1, 0, -1, null);

                                let index = dataView.getUint32(offset, true);
                                HeaderTocTableItem.index = index === -1 ? index : index + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                                offset += 4;
                                HeaderTocTableItem.itemType = dataView.getInt32(offset, true);
                                offset += 4;

                                let pIndex = dataView.getInt32(offset, true);
                                HeaderTocTableItem.pIndex = pIndex === -1 ? pIndex : pIndex + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                                offset += 4;

                                // add
                                if (HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntAssembly
                                    && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntPart
                                    && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntBody) {
                                    //nEnts--;
                                    continue;
                                }

                                //m_vecPropHeaderDic.push(HeaderTocTableItem);
                                view.Data.AddNode(HeaderTocTableItem);
                            }
                        }
                        break;

                    //분할구조
                    default:
                        {
                            for (let i = 0; i < vdBlockSize; i++) {
                                //HeaderTocTableItem = {
                                //    index: -1,
                                //    itemType: 0,
                                //    entFlags: 0,
                                //    iNameIndex: -1,
                                //    attFlags: 0,
                                //    transfrom: [],
                                //    bBox: [],
                                //    BBox: null,
                                //    cCount: -1,
                                //    pIndex: -1,
                                //    orgNodeID: -1,
                                //    pNameBuff: null,
                                //    tocId: 0,
                                //    btype: 0,
                                //    name: null
                                //};

                                //간소화.
                                let HeaderTocTableItem = view.Data.NodeItem();
                                //let HeaderTocTableItem = {
                                //    index: -1,
                                //    itemType: 0,
                                //    pIndex: -1,
                                //    name: null,
                                //    sub: []
                                //};

                                let index = dataView.getUint32(offset, true);
                                HeaderTocTableItem.index = index === -1 ? index : index + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                                offset += 4;
                                HeaderTocTableItem.itemType = dataView.getInt32(offset, true);
                                offset += 4;
                                //HeaderTocTableItem.entFlags = dataView.getUint16(offset, true);
                                offset += 2;

                                //HeaderTocTableItem.iNameIndex = dataView.getInt32(offset, true);
                                let iNameIndex = dataView.getInt32(offset, true);
                                offset += 4;

                                //Name
                                if (iNameIndex > 0) {
                                    let bodyNameBuffer = new Uint8Array(iNameIndex);
                                    for (let m = 0; m < iNameIndex; m++) {
                                        // Multibyte
                                        //if(m%2 ===0)
                                        //    bodyNameBuffer[m/2] = dataView.getUint8(pos + offset + m, true);
                                        bodyNameBuffer[m] = dataView.getUint8(offset + m, true);
                                    }

                                    let bodyName = String.fromCharCode.apply(null, bodyNameBuffer);
                                    bodyName = decode_utf8(bodyName);

                                    //[정규식 이용해서 gi 로 감싸기]
                                    //감싼 따옴표를 슬래시로 대체하고 뒤에 gi 를 붙이면 
                                    //replaceAll 과 같은 결과를 볼 수 있다.
                                    //* g : 발생할 모든 pattern에 대한 전역 검색
                                    //* i : 대 / 소문자 구분 안함
                                    //* m: 여러 줄 검색(참고)

                                    HeaderTocTableItem.name = bodyName.replace(/\0/gi, '');
                                }
                                offset += iNameIndex;

                                //HeaderTocTableItem.attFlags = dataView.getUint16(offset, true);
                                offset += 2;
                                //HeaderTocTableItem.transfrom = [];
                                for (let j = 0; j < 16; j++) {
                                    //HeaderTocTableItem.transfrom[j] = dataView.getFloat32(offset, true);
                                    offset += 4;
                                }
                                //HeaderTocTableItem.bBox = [];
                                for (let k = 0; k < 6; k++) {
                                    //HeaderTocTableItem.bBox[k] = dataView.getFloat32(offset, true);
                                    offset += 4;
                                }

                                //HeaderTocTableItem.BBox = new VIZCore.BBox(HeaderTocTableItem.bBox);

                                //HeaderTocTableItem.cCount = dataView.getInt32(offset, true);
                                offset += 4;
                                let pIndex = dataView.getInt32(offset, true);
                                HeaderTocTableItem.pIndex = pIndex === -1 ? pIndex : pIndex + view.Data.GetStartID(file.Key);//view.Data.GetMaxID();
                                offset += 4;
                                //HeaderTocTableItem.orgNodeID = dataView.getInt32(offset, true);
                                offset += 4;
                                //byte * pNameBuff;
                                if (header.version < 302)
                                    offset += 8;

                                //HeaderTocTableItem.tocId = dataView.getInt32(offset, true); //Binary Block용 
                                offset += 4;
                                //HeaderTocTableItem.btype = dataView.getInt32(offset, true);//Binary Block용 
                                offset += 4;

                                // add
                                if (HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntAssembly
                                    && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntPart
                                    && HeaderTocTableItem.itemType !== VIZCore.Enum.ENTITY_TYPES.EntBody) {
                                    //nEnts--;
                                    continue;
                                }

                                //m_vecPropHeaderDic.push(HeaderTocTableItem);
                                view.Data.AddNode(HeaderTocTableItem);
                            }
                        }
                        break;
                }

                //view.Data.AddNodes(m_vecPropHeaderDic);

                loaded_Structure = true;
                checkLoaded();
            }

            /**
            * ImportSplitFile
            * @returns {[]} [0]:splitType, [1]:structureNum, [2]:meshBlockNum, [3]:UDANum, [4]:unit
            */
            function ImportSplitFile(dataView, toc) {
                let offset = 0;

                let split_version = dataView.getInt32(offset, true);
                offset += 4;
                let split_type = dataView.getInt32(offset, true);
                //split_type = 1;
                offset += 4;

                let split_Structure = dataView.getInt32(offset, true);
                offset += 4;
                let split_MeshBlock = dataView.getInt32(offset, true);
                offset += 4;
                let split_UDA = dataView.getInt32(offset, true);
                offset += 4;
                let split_unit = dataView.getInt32(offset, true);
                offset += 4;

                return [split_type, split_Structure, split_MeshBlock, split_UDA, split_unit];
            }

            function ImportSplitAreaList(dataView, toc) {
                let offset = 0;

                let areaNum = dataView.getInt32(offset, true);
                offset += 4;

                let items = [];
                for (let ii = 0; ii < areaNum; ii++) {
                    let areaBBox = new Float32Array(dataView.buffer, offset + view.byteOffset, 6);
                    offset += 24;

                    let areaListNum = dataView.getInt32(offset, true);
                    offset += 4;

                    let areaList = new Int32Array(dataView.buffer, offset + view.byteOffset, areaListNum);
                    offset += 4 * areaListNum;

                    let AreaItem = {
                        bbox: new VIZCore.BBox(areaBBox),
                        list: areaList
                    };

                    items[ii] = AreaItem;
                }
                view.Data.AddAreaListMap(file.Url, items);
            }

            function GetNodeMaxID(dataView, toc) {
                let offset = 8;
                let vdBlockSize = dataView.getUint32(offset, true);
                offset += 4;
                let max = 0;
                for (let i = 0; i < vdBlockSize; i++) {
                    let index = dataView.getUint32(offset, true);
                    if (max < index)
                        max = index;

                    //offset += 32;
                    offset += 4;
                    offset += 4;
                    offset += 4;
                    offset += 4;
                    offset += 4;
                    for (let j = 0; j < 16; j++) {
                        offset += 4;
                    }
                    for (let k = 0; k < 6; k++) {
                        offset += 4;
                    }
                    offset += 4;
                    offset += 4;
                    offset += 4;
                    if (header.version < 302)
                        offset += 8;
                    offset += 4;
                    offset += 4;


                }
                return max;
            }

            function GetSplitFileNodeMaxID(dataView, toc) {
                let offset = 0;
                let vdBlockSize = dataView.getUint32(offset, true);
                offset += 4;
                let max = 0;

                switch (view.DataSplit) {
                    //간소화 분할구조
                    case 2:
                        {
                            for (let i = 0; i < vdBlockSize; i++) {
                                let index = dataView.getUint32(offset, true);
                                if (max < index)
                                    max = index;

                                offset += 12;
                            }
                        }
                        break;

                    //분할구조
                    default:
                        {
                            for (let i = 0; i < vdBlockSize; i++) {
                                let index = dataView.getUint32(offset, true);
                                if (max < index)
                                    max = index;

                                offset += 10;

                                let nNameNum = dataView.getInt32(offset, true);
                                offset += 4;
                                //byte * pNameBuff;
                                offset += nNameNum;

                                offset += 110;

                                //offset += 2;

                                //offset += 64;
                                //offset += 24;
                                //offset += 20;
                                if (header.version < 302)
                                    offset += 8;
                            }
                        }
                        break;
                }
                return max;
            }

            function LoadPropTableIndices(dataView, toc) {
                let offsetIndices = 0;
                let nTables = dataView.getUint32(offsetIndices, true);
                offsetIndices += 4;

                let m_nodePropTables = [];

                for (let p = 0; p < nTables; p++) {
                    let tidx = dataView.getUint32(offsetIndices, true);
                    offsetIndices += 4;

                    let PropTocTableItem = {
                        tableTocIdx: tidx,
                        nLoadedNodes: 0
                    };

                    m_nodePropTables.push(PropTocTableItem);
                }

                for (let pi = 0; pi < m_nodePropTables.length; pi++) {
                    let pti = m_nodePropTables[pi];
                    let tocProperty = m_toc[pti.tableTocIdx];
                    if (tocProperty === undefined) {
                        setTimeout(function () {
                            parseOnload(null, data);
                        }, 1);
                        return;
                    }
                    else {
                        let viewProperty = ReadDataBlock(tocProperty, dataView.buffer);
                        LoadPropTableItem(viewProperty, tocProperty, pti);
                    }
                }

                function LoadPropTableItem(dataView, toc, pti) {
                    let offset = 0;
                    let nNodesPerTable = dataView.getUint32(offset, true);
                    offset += 4;
                    if (pti.nLoadedNodes === nNodesPerTable)
                        return false;

                    let arrProperty = [];
                    for (let i = 0; i < nNodesPerTable; i++) {
                        let Property = {
                            nodeId: -1,
                            nNodeProps: 0,
                            items: [],
                            key: file.ID, // nodeId와 byteArray 연계 정보
                            offset: -1,
                            id_file: file.Key
                        };

                        //arrProperty.push(Property);
                        arrProperty[i] = Property;

                        let nodeId = dataView.getUint32(offset, true);
                        //Property.nodeId += startID;//view.Data.GetStartID();
                        Property.nodeId = nodeId + view.Data.GetStartID(file.Key);
                        offset += 4;

                        Property.nNodeProps = dataView.getInt16(offset, true);
                        offset += 2;

                        // offset 관리
                        Property.offset = offset;

                        let encode_utf8 = function (s) {
                            return unescape(encodeURIComponent(s));
                        };

                        let decode_utf8 = function (s) {
                            try {
                                return decodeURIComponent(escape(s));
                            }
                            catch (e) {
                                return s;
                            }
                        };

                        if (view.Configuration.Property.UseArrayBuffer) {
                            for (let pi = 0; pi < Property.nNodeProps; pi++) {
                                let len = dataView.getUint32(offset, true);
                                offset += 4;
                                offset += len;
                                //len = dataView.getUint16(offset, true);
                                offset += 2;
                                len = dataView.getUint32(offset, true);
                                offset += 4;
                                offset += len;
                                //item.valType = dataView.getUint16(offset, true);
                                offset += 2;
                            }
                        }
                        else {
                            for (let pi = 0; pi < Property.nNodeProps; pi++) {
                                let item = {
                                    key: null,
                                    value: null
                                    //valueType: null
                                };
                                let len = dataView.getUint32(offset, true);
                                offset += 4;

                                let keyBuffer = new Uint8Array(len);
                                for (let m = 0; m < len; m++) {
                                    keyBuffer[m] = dataView.getUint8(offset + m, true);
                                }

                                item.key = String.fromCharCode.apply(null, keyBuffer);
                                item.key = decode_utf8(item.key);

                                offset += len;

                                //len = dataView.getUint16(offset, true);
                                offset += 2;

                                len = dataView.getUint32(offset, true);
                                offset += 4;

                                let valueBuffer = new Uint8Array(len);
                                for (let m = 0; m < len; m++) {
                                    valueBuffer[m] = dataView.getUint8(offset + m, true);
                                }
                                item.value = String.fromCharCode.apply(null, valueBuffer);
                                item.value = decode_utf8(item.value);

                                offset += len;

                                //item.valType = dataView.getUint16(offset, true);
                                offset += 2;

                                Property.items.push(item);
                            }
                        }
                    }

                    //view.Data.AddUserProperty(arrProperty);
                    view.Property.Add(arrProperty, file.ID, dataView, file);

                    //Property 추가 완료
                    {
                        let fileInfo = view.Data.ModelFileManager.GetFileInfo(file.Key);
                        let fileDataInfo = view.Data.ModelFileManager.AddFileDataInfo(fileInfo, VIZCore.Enum.FILEINFOTYPE.PROPERTY, VIZCore.Enum.FILEINFOTYPE.PROPERTY);
                        fileDataInfo.Download = true;
                        //view.Data.ModelFileManager.SetDownloadFileData(file.Key, file);
                    }

                    loaded_Property = true;
                    checkLoaded();
                }
            }

            // SplitFile
            let tiSplitFile = FindLast(ContentsType.CTSplitStructureMeshBlockFile);
            if (tiSplitFile !== -1 && header.version >= 303) {
                let tocSplitFile = m_toc[tiSplitFile];
                let viewSplitFile = ReadDataBlock(tocSplitFile);

                let splitInfo = ImportSplitFile(viewSplitFile, tocSplitFile);
                let splitType = splitInfo[0];
                if (splitType !== 0) {
                    let structureNum = splitInfo[1];
                    let meshBlockNum = splitInfo[2];
                    let udaNum = splitInfo[3];
                    let unitInfo = splitInfo[4];

                    let filePath = view.Data.GetStringLeft(file.Url, 0, file.Url.length - 5);

                    let structureCnt = 0;
                    let meshBlockCnt = 0;
                    let udaCnt = 0;

                    //다운로드 추가 갱신
                    let splitNum = 0;
                    let splitfiles = [];
                    let splitMax = Math.max(Math.max(structureNum, meshBlockNum), udaNum);
                    //let splitMax = Math.max(structureNum, meshBlockNum);

                    for (let ii = 0; ii < splitMax; ++ii) {
                        //교차하면서 다운로드하기 위함
                        if (structureCnt < structureNum) {
                            splitfiles[splitNum++] = `${filePath}_s_${structureCnt}.vizw`;
                            structureCnt++;
                        }

                        if (udaCnt < udaNum) {
                            splitfiles[splitNum++] = `${filePath}_u_${udaCnt}.vizw`;
                            udaCnt++;
                        }

                        if (meshBlockCnt < meshBlockNum) {
                            splitfiles[splitNum++] = `${filePath}_${meshBlockCnt}.vizw`;
                            meshBlockCnt++;
                        }
                    }


                    //for (let ii = 0; ii < structureNum; ++ii) {
                    //    if (structureCnt < structureNum) {
                    //        splitfiles[splitNum++] = filePath + "_s_" + structureCnt + ".vizw";
                    //        structureCnt++;
                    //    }
                    //}

                    // UDA는 완료 후 추가
                    //for (let ii = 0; ii < udaNum; ++ii) {
                    //    splitfiles[splitNum++] = `${filePath}_u_${udaCnt}.vizw`;
                    //    udaCnt++;
                    //}

                    //for (let ii = 0; ii < meshBlockNum; ++ii) {
                    //    splitfiles[splitNum++] = `${filePath}_${meshBlockCnt}.vizw`;
                    //    meshBlockCnt++;
                    //}

                    //구역 List map 추출
                    if (!view.useLOD) {
                        let tiSplitAreaFile = FindLast(ContentsType.CTSplitAreaMeshBlockList);
                        if (tiSplitAreaFile !== -1) {
                            let tocSplitArea = m_toc[tiSplitAreaFile];
                            let viewSplitArea = ReadDataBlock(tocSplitArea);
                            ImportSplitAreaList(viewSplitArea, tocSplitArea);
                        }
                    }
                    view.DataSplit = splitType;
                    view.resizeGLWindowSkip = true;
                    view.currentSplitDownloadCnt = 0;
                    view.totalSplitDownloadCnt = structureNum + meshBlockNum + udaNum;
                    //view.totalSplitDownloadCnt = meshBlockNum;

                    view.Data.ApplyStartID();
                    view.Model.SplitAdd(splitfiles);

                    //result = null;
                    parseOnload(null, file);
                    return;
                }
            }

            // Structure
            let tiStructure = FindLast(ContentsType.CTStructure);
            let tocStructure = m_toc[tiStructure];
            let viewStructure = ReadDataBlock(tocStructure);

            // MeshBlock
            let tiMeshBlock = FindLast(ContentsType.CTMeshBlock);
            let tocMeshBlock = m_toc[tiMeshBlock];
            let viewMeshBlock = ReadDataBlock(tocMeshBlock);

            // Property
            let tiPropertyIndices = FindLast(ContentsType.CTNodePropTableIndices);
            let tocPropertyIndices = m_toc[tiPropertyIndices];
            let viewPropertyIndices = ReadDataBlock(tocPropertyIndices);

            //Set ModelFileManager
            {
                //header 가 없는 파일이기에 임의로 생성
                let fileInfo = view.Data.ModelFileManager.CreateFileInfoEmpty(file);
                view.Data.ModelFileManager.AddFileInfo(file.Key, fileInfo);
            }

            // ID
            if (tocStructure !== undefined) {
                if (view.DataSplit === 0) {
                    let maxID = GetNodeMaxID(viewStructure, tocStructure);
                    view.Data.SetStartID(file.Key, maxID);
                }
                else {
                    let maxID = GetSplitFileNodeMaxID(viewStructure, tocStructure);
                    view.Data.SetCurrentStartID(maxID);
                }
            }

            if (tocStructure === undefined && tocMeshBlock === undefined && tocPropertyIndices === undefined) {
                if (!view.useFramebuffer)
                    onProgress(1, 1);
                result = null;
                parseOnload(null, file);
            }
            else {
                if (tocStructure !== undefined) {
                    setTimeout(function () {
                        if (view.DataSplit === 0) {
                            ImportStructure(viewStructure, tocStructure);
                        }
                        else {
                            ImportSplitStructure(viewStructure, tocStructure);
                        }
                    }, 1);
                }
                else {
                    loaded_Structure = true;
                    checkLoaded();
                }
                if (tocMeshBlock !== undefined) {
                    setTimeout(function () {
                        offset = 0;
                        let meshBlockNum = viewMeshBlock.getInt32(offset, true);
                        offset += 4;

                        let curload = 0;
                        let loading = function () {
                            for (let i = curload; i < meshBlockNum; i++) {
                                let percent = curload / meshBlockNum;
                                if (percent === Infinity)
                                    percent = 0;

                                //console.log("ReadMeshBlock : " + i);
                                let cachTocIdx = 0;
                                cachTocIdx = viewMeshBlock.getInt32(offset, true);
                                offset += 4;

                                let toc = m_toc[cachTocIdx];

                                let viewSub = ReadDataBlock(toc);

                                ImportMeshBlock(viewSub, cachTocIdx);

                                if (view.DemoType === 3) {

                                    if (file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/BIKE.vizw") === 0
                                        || file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/BUS.vizw") === 0
                                        || file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/CAR_A.vizw") === 0
                                        || file.Url.localeCompare(view.Configuration.Default.Path + "Model/Sejong/Transportation/CAR_B.vizw") === 0
                                    ) {
                                        for (let c = 1; c < 20; c++) {
                                            view.Animation.BackupUrl = "";
                                            ImportMeshBlock(viewSub, cachTocIdx);
                                        }
                                    }
                                }

                                //// 노드 복사 테스트
                                if (view.DemoType == 2) {
                                    for (let c = 1; c < 10; c++) {
                                        // copyMeshBlock(viewSub, c);
                                        view.MeshProcess.Copy(viewSub, c, result, file, header, meshBlockId);
                                    }
                                }

                                curload++;
                                if (curload !== meshBlockNum) {
                                    setTimeout(function () {
                                        if (!view.useFramebuffer)
                                            onProgress(1, percent);
                                        loading();
                                    }, 1);
                                    break;
                                }
                                else {
                                    setTimeout(function () {
                                        if (!view.useFramebuffer)
                                            onProgress(1, 1);
                                        loaded_MeshBlock = true;
                                        checkLoaded();
                                    }, 1);
                                }
                            }
                        };

                        setTimeout(function () {
                            if (!view.useFramebuffer)
                                onProgress(1, 0);
                            loading();
                        }, 1);
                    }, 1);
                }
                else {
                    loaded_MeshBlock = true;
                    checkLoaded();
                }
                if (tocPropertyIndices !== undefined) {
                    setTimeout(function () {
                        LoadPropTableIndices(viewPropertyIndices, tocPropertyIndices);
                    }, 1);
                }
                else {
                    loaded_Property = true;
                    checkLoaded();
                }
            }
            function checkLoaded() {
                if (loaded_Structure && loaded_MeshBlock && loaded_Property)
                    parseOnload(null, file);
            }
        }


        // 옵션별 url 반환
        function getRequestUrl(url, useCache) {
            let urlEncode = view.Configuration.Default.EncodeURI.Enable === true ? encodeURI(url) : url;
            let requestParam = "";
            if (view.Configuration.Default.File !== undefined && view.Configuration.Default.File.EnableCache === true) {
                if (useCache === undefined || useCache === false)
                    requestParam = view.Configuration.Default.File.RequestParam + new Date().getTime();
            }

            return urlEncode + requestParam;
        };

        let success = function (binary) {
            let startTime = new Date();
            if (data.Header !== undefined && data.Header.compressed) {
                let decompress = (source, callback) => {
                    let startTime = new Date();
                    let bytes = new Uint8Array(source);
                    const arrayLength = bytes.byteLength;               // Byte 배열의 길이
                    const inputPointer = view.ShdCore._malloc(arrayLength);   // 다운로드된 압축 바이너리 크기 만큼 메모리 할당
                    var byteArray = new Uint8Array(bytes);              // ArrayBuffer 형식을 Uint8Array (Unsigned Int 8 Bit Array) 변경
                    view.ShdCore.HEAPU8.set(byteArray, inputPointer);         // ByteArray를 할당된 메모리에 복사

                    // WebAssembly API 호출 :: GetDecompressedSize (압축해제된 예상 크기 반환)
                    // 압축된 Byte 배열이 해제되었을 경우의 예상되는 크기를 확인
                    // 실제 압축하기전 Byte의 크기와 다를수 있음

                    // if(data.Url.localeCompare('./VIZCore3D/Model/DLENC/vizw/vizw/View1_wm_00_0000.vizw')=== 0)
                    // {
                    //     console.log("");
                    // }
                    const decompressedSize = view.ShdCore.ccall(
                        'GetDecompressedSize',
                        'BigInt',
                        ['number', 'number'],
                        [inputPointer, arrayLength]);

                    // 압축이 해제된 데이터를 전달받기 위해서
                    // 해당 크기로 메모리를 할당
                    const outputPointer = view.ShdCore._malloc(decompressedSize);

                    // WebAssembly API 호출 :: Decompress (압축해제)
                    // 압축된 바이트의 메모리 포인터
                    // 압축된 바이트의 길이
                    // 압축 해제된 바이트가 저장될 메모리 포인터
                    // 압축 해제된 바이트의 예상 크기
                    const result = view.ShdCore.ccall(
                        'Decompress',
                        'number',
                        ['number', 'number', 'number', 'number'],
                        [inputPointer, arrayLength, outputPointer, decompressedSize]);

                    // 압축해제 결과 조회
                    // 메모리에 저장된 데이터 복사
                    // CASE 1 - Uint8Array
                    //const decompressedByte = new Uint8Array(wasmMemory.buffer, outputPointer, result);
                    //const decompressedByte = new Uint8Array(view.ShdCore.asm.memory.buffer, outputPointer, result);

                    // CASE 2 - ArrayBuffer
                    try {
                        var arrayUint8 = new Uint8Array(result);
                        arrayUint8.set(new Uint8Array(view.ShdCore.asm.memory.buffer, outputPointer, result), 0);
                        //bytes = arrayUint8.buffer; // ArrayBuffer
                        source = arrayUint8.buffer; // ArrayBuffer
                    } catch (e) {
                        console.log("allocation :: ", e);
                        // 메모리 해제
                        view.ShdCore._free(inputPointer);
                        view.ShdCore._free(outputPointer);
                        callback(undefined, data);
                        return;
                    }

                    // 메모리 해제
                    view.ShdCore._free(inputPointer);
                    view.ShdCore._free(outputPointer);

                    callback(source, data);

                }

                if (onDownloaded !== undefined) {
                    let cb = (source, data) => {
                        callback(source, data);
                        result = null;
                    };
                    setTimeout(() => {
                        decompress(result, cb);
                    }, 1);

                    //console.log("Download Completed :: ", data.Url);
                    onDownloaded(data, undefined);

                }
                else {
                    decompress(result, callback);
                }
            }
            else {
                let currentTime = new Date();
                let span = currentTime.getTime() - startTime.getTime();
                //console.log("Time Span ::", span);
                if (onDownloaded !== undefined) {
                    //setTimeout(, 1);
                    //console.log("Download Completed :: ", data.Url);
                    onDownloaded(data, undefined);
                }
                //callback(result, data);
                asyncParse(binary, data, undefined);
            }

            if (onDownloaded === undefined)
            binary = null;
        };

        success(result);
    }


};

export default VIZWLoader;