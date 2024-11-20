class ModelSearch {

    constructor(view, vizwide3d) {
        let scope = this;

        this.GetModelSearchPanel = undefined;

        let cbClose = undefined;
        let panel = new vizwide3d.Panel(view);
        panel.id = "Model_Search_Panel";
        panel.SetLocationCenter();
        // 조회할 모델 입력 박스
        let inputElement = document.createElement('input');
        inputElement.id = "inputElement";
        inputElement.className = "VIZWeb SH_search_panel_input";

        // 조회버튼
        let bt_ModelSearch = document.createElement('button');
        bt_ModelSearch.className = "VIZWeb SH_search_panel_button";
        bt_ModelSearch.id = panel.id + "bt_ModelSearch";
        // bt_ModelSearch.textContent = "조회";
        bt_ModelSearch.textContent = "Search";
        bt_ModelSearch.setAttribute("data-language", "RB0006");

        //조회 조건
        let SearchCondition = document.createElement('label');
        // SearchCondition.textContent = "조회 조건 : ";
        if(vizwide3d.Configuration.Language === 0) {
            SearchCondition.textContent = "조회 조건 : ";
        } else {
            SearchCondition.textContent = "Search Word : ";
        }
        SearchCondition.className = "VIZWeb SH_search_panel_condition_label";
        SearchCondition.setAttribute("data-language", "SP0001");

        let checkboxArea = document.createElement('div');
        checkboxArea.className = "VIZWeb SH_search_panel_checkbox_area";

        // 속성포함 체크박스
        let includeAttElement = document.createElement('div');
        includeAttElement.className = "VIZWeb SH_search_panel_checkbox_div";

        let cb_IncludeAtt = document.createElement('div');
        cb_IncludeAtt.id = "cb_IncludeAtt";
        cb_IncludeAtt.className = "VIZWeb SH_search_panel_checkbox SH_uncheck_icon_color";
        cb_IncludeAtt.checked = false;
        includeAttElement.appendChild(cb_IncludeAtt);

        let label_IncludeAtt = document.createElement('label');
        // label_IncludeAtt.textContent = "속성 포함";
        label_IncludeAtt.textContent = "Attribute Value";
        label_IncludeAtt.setAttribute("for", "cb_IncludeAtt");
        label_IncludeAtt.className = "VIZWeb SH_search_panel_checkbox_label";
        includeAttElement.appendChild(label_IncludeAtt);
        label_IncludeAtt.setAttribute("data-language", "SP0002");

        checkboxArea.appendChild(includeAttElement);

        let cbIncludeAtt = function(){
            cb_IncludeAtt.checked = !cb_IncludeAtt.checked;

            if(cb_IncludeAtt.checked){
                cb_IncludeAtt.className = "VIZWeb SH_search_panel_checkbox SH_check_icon_color";
            } else {
                cb_IncludeAtt.className = "VIZWeb SH_search_panel_checkbox SH_uncheck_icon_color";
            }
        };

        cb_IncludeAtt.addEventListener('click', function(){
            cbIncludeAtt();
        });

        label_IncludeAtt.addEventListener('click', function(){
            cbIncludeAtt();
        });

        // 검색어 일치 체크박스
        let similarSearchElement = document.createElement('div');
        similarSearchElement.className = "VIZWeb SH_search_panel_checkbox_div";

        let cb_SimilarSearch = document.createElement('div');
        cb_SimilarSearch.id = "cb_SimilarSearch";
        cb_SimilarSearch.className = "VIZWeb SH_search_panel_checkbox SH_uncheck_icon_color";
        cb_SimilarSearch.checked = false;
        similarSearchElement.appendChild(cb_SimilarSearch);

        let label_SimilarSearch = document.createElement('label');
        // label_SimilarSearch.textContent = "검색어 일치";
        label_SimilarSearch.textContent = "Full Mach"; 
        label_SimilarSearch.setAttribute("for", "cb_SimilarSearch");
        label_SimilarSearch.className = "VIZWeb SH_search_panel_checkbox_label";
        similarSearchElement.appendChild(label_SimilarSearch);
        label_SimilarSearch.setAttribute("data-language", "SP0003");

        checkboxArea.appendChild(similarSearchElement);

        let cbsimilarSearch = function(){
            cb_SimilarSearch.checked = !cb_SimilarSearch.checked;

            if(cb_SimilarSearch.checked){
                cb_SimilarSearch.className = "VIZWeb SH_search_panel_checkbox SH_check_icon_color";
            } else {
                cb_SimilarSearch.className = "VIZWeb SH_search_panel_checkbox SH_uncheck_icon_color";
            }
        };

        cb_SimilarSearch.addEventListener('click', function(){
            cbsimilarSearch();
        });

        label_SimilarSearch.addEventListener('click', function(){
            cbsimilarSearch();
        });

        // 결과 내 재검색 체크박스
        let reSearchElement = document.createElement('div');
        reSearchElement.className = "VIZWeb SH_search_panel_checkbox_div";

        let cb_Re_Seach = document.createElement('div');
        cb_Re_Seach.id = "cb_Re_Seach";
        cb_Re_Seach.className = "VIZWeb SH_search_panel_checkbox SH_uncheck_icon_color";
        cb_Re_Seach.checked = false;
        reSearchElement.appendChild(cb_Re_Seach);

        let label_Re_Seach = document.createElement('label');
        // label_Re_Seach.textContent = "결과 내 재검색";
        label_Re_Seach.textContent = "Rescan Results";
        label_Re_Seach.setAttribute("for", "cb_Re_Seach");
        label_Re_Seach.className = "VIZWeb SH_search_panel_checkbox_label";
        reSearchElement.appendChild(label_Re_Seach);
        label_Re_Seach.setAttribute("data-language", "SP0004");
        
        checkboxArea.appendChild(reSearchElement);

        let cbReSearch = function () {
            cb_Re_Seach.checked = !cb_Re_Seach.checked;

            if (cb_Re_Seach.checked) {
                cb_Re_Seach.className = "VIZWeb SH_search_panel_checkbox SH_check_icon_color";
            } else {
                cb_Re_Seach.className = "VIZWeb SH_search_panel_checkbox SH_uncheck_icon_color";
            }
        };

        cb_Re_Seach.addEventListener('click', function(){
            cbReSearch();
        });

        label_Re_Seach.addEventListener('click', function(){
            cbReSearch();
        });

        let tablediv = document.createElement('div');
        tablediv.className = "VIZWeb SH_search_panel_table_div";

        // 결과 테이블
        let table = document.createElement('table');
        table.className = "VIZWeb SH_search_panel_table";
        table.id = "ResultTable";
        let FirstRow = table.insertRow();
        let col1 = FirstRow.insertCell(0);
        col1.className = "VIZWeb SH_search_panel_table_th";
        col1.outerHTML = "<th>No.</th>";
        col1.style.width = "10px";
        let col2 = FirstRow.insertCell(1);
        col2.className = "VIZWeb SH_search_panel_table_th";
        col2.outerHTML = "<th>Name</th>";
        let loadingSpinner = document.createElement('div');
        loadingSpinner.id = "loading";
        loadingSpinner.className = "VIZWeb SH_search_panel_loading";
        loadingSpinner.style = "position:absolute; height : 300px";
        let spinner = document.createElement('div');
        spinner.className = "VIZWeb SH_search_panel_spinner";
        loadingSpinner.appendChild(spinner);
        table.appendChild(loadingSpinner);
        tablediv.appendChild(table);

        let loadingSpinnerShow = function(visible){
            if (visible == true) {
                loadingSpinner.style.display = "block";
            }
            else {
                loadingSpinner.style.display = "none";
            }
        };

        // 데이터 개수
        let DataNumber = document.createElement('label');
        // DataNumber.textContent = "조회 데이터 개수 : 0";
        DataNumber.className = "VIZWeb SH_search_panel_data_num";
        DataNumber.textContent = "Find : 0";

        // 전체 선택/해제 
        let allCheckDataElement = document.createElement('div');
        allCheckDataElement.className = "VIZWeb SH_search_panel_checkbox_div";

        let AllCheckData = document.createElement('div');
        AllCheckData.id = "cb_All_Check";
        AllCheckData.className = "VIZWeb SH_search_panel_checkbox SH_uncheck_icon_color";
        AllCheckData.checked = false;
        allCheckDataElement.appendChild(AllCheckData);

        let label_AllCheckData = document.createElement('label');
        // label_AllCheckData.textContent = "전체 선택";
        label_AllCheckData.textContent = "Select All";
        label_AllCheckData.setAttribute("for", "cb_AllCheckData");
        label_AllCheckData.className = "VIZWeb SH_search_panel_checkbox_label";
        allCheckDataElement.appendChild(label_AllCheckData);
        label_AllCheckData.setAttribute("data-language", "RB0009");

        let setAllCheckData = function(bool){
            if(bool){
                scope.SelectAll(table);
            } else {
                scope.UnselectAll(table);
            }
            scope.SetAllCheck(bool);
        };

        // 전체선택 체크 상태 표시
        this.SetAllCheck = function(bool){
            if(bool){
                AllCheckData.className = "VIZWeb SH_search_panel_checkbox SH_check_icon_color";
            } else {
                AllCheckData.className = "VIZWeb SH_search_panel_checkbox SH_uncheck_icon_color";
            }
        };

        AllCheckData.addEventListener('click', function(){
            AllCheckData.checked = !AllCheckData.checked;
            setAllCheckData(AllCheckData.checked);
        });

        label_AllCheckData.addEventListener('click', function(){
            AllCheckData.checked = !AllCheckData.checked;
            setAllCheckData(AllCheckData.checked);
        });

        // panel 색상 설정
        panel.SetContentBackgroundColorFormRGBA(240, 240, 240, 200);        // Panel Content 배경 색상 설정
        // panel에 element 추가

        let inPanelElement = document.createElement('div');
        inPanelElement.className = "VIZWeb SH_search_panel";
        inPanelElement.appendChild(inputElement);
        inPanelElement.appendChild(bt_ModelSearch);
        inPanelElement.appendChild(document.createElement('br'));
        inPanelElement.appendChild(SearchCondition);
        inPanelElement.appendChild(document.createElement('hr'));
        inPanelElement.appendChild(checkboxArea);
        inPanelElement.appendChild(document.createElement('hr'));
        inPanelElement.appendChild(DataNumber);
        inPanelElement.appendChild(allCheckDataElement);
        inPanelElement.appendChild(tablediv);
        inPanelElement.appendChild(document.createElement('br'));

        panel.SetContent(inPanelElement);

        scope.GetModelSearchPanel = inPanelElement;

        panel.OnCloseButtonEvent(PanelClose);
        panel.SetTitleText("Search");
        panel.Show(false);

        let isPanelShow = 0;

        inputElement.addEventListener('keydown', function (event) {
            // Enter key
            if (event.key === 'Enter') {
                SearchEvent();
            }
        });

        bt_ModelSearch.addEventListener("click", function () {
            SearchEvent();
        });

        let SearchEvent = function(){
            AllCheckData.checked = false;
            AllCheckData.className = "VIZWeb SH_search_panel_checkbox SH_uncheck_icon_color";
            loadingSpinnerShow(true);
            // console.log("마우스 클릭");
            setTimeout(() => {
                SearchModel(inputElement.value, cb_IncludeAtt.checked, cb_SimilarSearch.checked, cb_Re_Seach.checked, table, vizwide3d);
                loadingSpinnerShow(false);    
            }, 50);
        }

        // $("#" + panel.id + "bt_ModelSearch").on('mousedown', function () {
        //     console.log("마우스 다운");
        //     $('#loading').show();
        // });

        // $("#" + panel.id + "bt_ModelSearch").on('click', function () {
        //     console.log("마우스 클릭");
        //     SearchModel(inputElement.value, cb_IncludeAtt.checked, cb_SimilarSearch.checked, cb_Re_Seach.checked, table, vizwide3d);
        //     $('#loading').hide();
        // });

        function onRowClick(event) {
            var tr = this;
            var td = tr.cells[1];
            let id = parseInt(td.getAttribute("value"));
            // 색 변경 - 컨트롤 눌렀을때
            if (event.ctrlKey) {
                if (tr.classList.contains("SH_search_panel_table_tr_click")) {
                    tr.classList.remove("SH_search_panel_table_tr_click");
                } else {
                    tr.classList.add("SH_search_panel_table_tr_click");
                }

                var tableTr = document.getElementsByClassName("SH_search_panel_table_tr_click");
                var selectIDsWithCtrl = [];
                for (var i = 0; i < tableTr.length; i++) {
                    selectIDsWithCtrl.push(parseInt(tableTr[i].cells[1].getAttribute("value")))
                }
                vizwide3d.Object3D.SelectByNodeID(selectIDsWithCtrl, true, false);

                // 테이블 길이가 0이상인 경우 - 컨트롤로 전체 선택 시 전체 선택 콤보박스 체크
                if(table.rows.length > 0){
                    if(selectIDsWithCtrl.length === table.rows.length - 1){
                        AllCheckData.checked = true;
                        AllCheckData.className = "VIZWeb SH_search_panel_checkbox SH_check_icon_color";
                    } else {
                        AllCheckData.checked = false;
                        AllCheckData.className = "VIZWeb SH_search_panel_checkbox SH_uncheck_icon_color";
                    }
                }
            }
            else {
                // 색 변경 - 컨트롤 안눌렀을때
                var tableTr = document.getElementsByClassName("SH_search_panel_table_tr_click");

                // 전체 선택 콤보박스 해제
                AllCheckData.checked = false;
                AllCheckData.className = "VIZWeb SH_search_panel_checkbox SH_uncheck_icon_color";

                for (var i = tableTr.length - 1; i >= 0; i--) {
                    tableTr[i].classList.remove("SH_search_panel_table_tr_click");
                }
                tr.classList.add("SH_search_panel_table_tr_click");
                let ids = [];
                ids.push(id);
                vizwide3d.Object3D.SelectByNodeID(ids, true, false);
            }
        }
        // 더블클릭
        function onRowdblClick(event) {
            vizwide3d.View.ZoomSelectedObject(0, 0.2);  // 선택 모델 박스 줌
        }
        function PanelClose() {
            isPanelShow = 0;
            if(cbClose !== undefined)
                cbClose();
        };

        function SearchModel(SearchString, isIncludeAtt, isMatching, isResearch, Table) {
            if (SearchString == "") {
                // console.log("검색어를 입력해주세요.");
                // if (view.Configuration.Type === VIZCore.Enum.UI_TYPE.RIBBONBAR){
                    vizwide3d.Main.UIManager.ShowMessage("MG0014", true, vizwide3d.UIElement.Enum.STATUS_TYPE.WARNING);
                // }
                return;
            }

            let deleteTableRow = function(table){
                for (let index = table.rows.length - 1 ; index > 0 ; index--) {  
                    table.deleteRow(-1);
                }
            }

            let keys = [];
            if(isIncludeAtt)
                keys = vizwide3d.Object3D.UDA.GetKeys();
            // 결과 내 재검색
            if (isResearch) {
                SearchCondition.textContent += " + " + SearchString;   // 조회 조건 초기화
                var id_arr = new Array();
                var name_arr = new Array();
                for (let i = 0; i < Table.rows.length; i++) {       // 검색 리스트
                    if (i == 0) continue;
                    let NodeName = Table.rows[i].cells[1].textContent;
                    let id = parseInt(Table.rows[i].cells[1].getAttribute("value"));
                    if (NodeName == null || NodeName == "") continue;
                    if (isMatching) {                                    // 검색어 일치
                        if (SearchString == NodeName) {
                            if (!(id_arr.includes(id))) {
                                id_arr.push(parseInt(id));
                                name_arr.push(NodeName);
                            }
                        }
                    }
                    else {                                              // 검색어 포함
                        if (NodeName.includes(SearchString)) {
                            if (!(id_arr.includes(id))) {
                                id_arr.push(parseInt(id));
                                name_arr.push(NodeName);
                            }
                        }
                    }
                }

                // 속성 포함 검색
                if (isIncludeAtt) {
                    let nodes = vizwide3d.Object3D.UDA.GetNodeIDsByValue(SearchString, isMatching);
                    for (let index = 0; index < nodes.length; index++) {
                        let node = vizwide3d.Object3D.FromID(nodes[index]);
                        for (let i = 0; i < Table.rows.length; i++) {
                            let ResultTableId = parseInt(Table.rows[i].cells[1].getAttribute("value"));
                            if (node.id == ResultTableId) {
                                if (!(id_arr.includes(ResultTableId))) {
                                    id_arr.push(ResultTableId);
                                    name_arr.push(Table.rows[i].cells[1].textContent);
                                }
                            }
                        }
                    }
                }
                //$('#' + Table.id + ' tr:not(:first)').remove(); // 첫번째 행 빼고 초기화
                deleteTableRow(Table);
                
                let columnCnt = 2;

                for (let i = 0; i < id_arr.length; i++) {
                    let tr_02 = Table.insertRow();
                    tr_02.className = "VIZWeb SH_search_panel_table_tr";
                    tr_02.onclick = onRowClick;
                    tr_02.ondblclick = onRowdblClick;
                    for (let j = 0; j < columnCnt; j++) {
                        if (j == 0) {
                            let td_03 = tr_02.insertCell(0);
                            td_03.className = "VIZWeb SH_search_panel_table_td";
                            td_03.textContent = i + 1;
                            td_03.setAttribute("value", id_arr[i]);
                        }
                        else {
                            let td_04 = tr_02.insertCell(1);
                            td_04.className = "VIZWeb SH_search_panel_table_td";
                            td_04.textContent = name_arr[i];
                            td_04.setAttribute("value", id_arr[i]);
                        }
                    }
                }
            }
            // 그냥 검색
            else {
                let finalNodes = [];                // 마지막에 결과리스트에 넣을 노드들
                //$('#' + Table.id + ' tr:not(:first)').remove(); // 첫번째 행 빼고 초기화
                deleteTableRow(Table);
                
                // SearchCondition.textContent = "조회 조건 : " + SearchString;   // 조회 조건 초기화
                // SearchCondition.textContent = "Search Word : " + SearchString;   // 조회 조건 초기화
                if(vizwide3d.Configuration.Language === 0) {
                    SearchCondition.textContent = "조회 조건 : " + SearchString;
                } else {
                    SearchCondition.textContent = "Search Word : " + SearchString;
                }
                // 검색어 일치 여부 - True(일치), False(포함)
                finalNodes = vizwide3d.Object3D.Find.QuickSearch(SearchString, isMatching);
                // 속성 포함 검색
                if (isIncludeAtt) {
                    let nodes = vizwide3d.Object3D.UDA.GetNodeIDsByValue(SearchString, isMatching);
                    for (let index = 0; index < nodes.length; index++) {
                        let node = vizwide3d.Object3D.FromID(nodes[index]);
                        if (!(finalNodes.find(x => x.id == node.id))) {
                            finalNodes.push(node);
                        }
                    }
                }
                let columnCnt = 2;
                for (let i = 0; i < finalNodes.length; i++) {
                    let tr_02 = Table.insertRow();
                    tr_02.className = "VIZWeb SH_search_panel_table_tr";
                    tr_02.onclick = onRowClick;
                    tr_02.ondblclick = onRowdblClick;
                    for (let j = 0; j < columnCnt; j++) {
                        if (j == 0) {
                            let td_03 = tr_02.insertCell(0);
                            td_03.className = "VIZWeb SH_search_panel_table_td";
                            td_03.textContent = i + 1;
                            td_03.setAttribute("value", finalNodes[i].id);
                        }
                        else {
                            let td_04 = tr_02.insertCell(1);
                            td_04.className = "VIZWeb SH_search_panel_table_td";
                            td_04.textContent = finalNodes[i].name;
                            td_04.setAttribute("value", finalNodes[i].id);
                        }
                    }
                }
            }

            // DataNumber.textContent = "조회 데이터 개수 : " + (Table.rows.length - 1);
            DataNumber.textContent = "Find : " + (Table.rows.length - 1);
        }

        this.UnselectAll = function (Table) {
            var selectIDs = [];
            for (var i = 0; i < Table.rows.length; i++) {
                var selectID = parseInt(Table.rows[i].cells[1].getAttribute("value"));
                selectIDs.push(selectID);

                Table.rows[i].classList = [];
                if (!(Table.rows[i].classList.contains("SH_search_panel_table_tr"))) {
                    Table.rows[i].classList.add("SH_search_panel_table_tr");
                }
            }
            vizwide3d.Object3D.SelectByNodeID(selectIDs, false, false);
        }

        this.SelectAll = function (Table) {
            var selectIDs = [];
            for (var i = 0; i < Table.rows.length; i++) {
                var selectID = parseInt(Table.rows[i].cells[1].getAttribute("value"));
                selectIDs.push(selectID);

                if (!(Table.rows[i].classList.contains("SH_search_panel_table_tr_click"))) {
                    Table.rows[i].classList.add("SH_search_panel_table_tr_click");
                }
            }
            vizwide3d.Object3D.SelectByNodeID(selectIDs, true, false);
        }

        // ----- Method
        this.ShowPanel = function () {
            if (isPanelShow == 0) {
                panel.Show(true);
                isPanelShow = 1;
            }
            else {
                panel.Show(false);
                isPanelShow = 0;
            }
        };

        this.OnCloseButtonEvent = function(cbclclick) {
            cbClose = cbclclick;
        };
    }
}

export default ModelSearch;

 