
import TabPanel from "./TabPanel.js";

class ReviewPanel {
    constructor(view, vizwide3d, VIZCore) {
        let scope = this;

        this.ReviewLayer = new Map(); // key: button_element, content_element

        this.ReivewItems = new Map(); // key: Tab, value: element

        let tapPanel = new TabPanel(view, vizwide3d, VIZCore);

        this.ReviewPanel = undefined;

        this.GetReviewPanel = undefined;    // 패널 안에 들어가는 Element


        let VIZonReviewItems = new Map(); // key: id, value: 

        let CommentItems = new Map(); // key: item, value: comments


        function initElement() {
            let note = tapPanel.GetLayerObj();
            note.id = "Note";
            note.text = "RT0005";

            let measure = tapPanel.GetLayerObj();
            measure.id = "Measure";
            measure.text = "RT0006";

            let userView = tapPanel.GetLayerObj();
            userView.id = "UserView";
            userView.text = "RB0041";

            let tab = tapPanel.GetTabPanelObj();
            tab.id = "Review_Panel";
            tab.title = "Review";
            tab.top = 50;
            tab.left = 400;
            tab.width = 315;
            tab.height = 400;
            tab.usePanel = false;
            tab.layer = [note, measure, userView];

            tapPanel.CreateTabPanel(tab);

            scope.ReviewPanel = tapPanel.TabPanel;

            scope.ReviewLayer = tapPanel.TabPanelLayerMap;

            // let reivewDeleteButton = document.createElement('div');
            // reivewDeleteButton.className = 'VIZWeb SH_tab_title_button SH_title_button SH_delete_icon';
            // reivewDeleteButton.addEventListener('click', function () {
            //     scope.ReviewDelete();
            // });

            // let review = ui_tab.Tab.GetItemObject();
            // review.id = "Review";
            // review.title = "Review";
            // review.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAACMklEQVRYhcVXMW4bMRAcGypSXjp38g8sIE2CpLhit0mlJ9wTLj9QkQfcE+QfXJFugeD8AwWI4VZGHmD94II1lmeCOulIiYYWOPCwJHeWu0NyedX3PS4pM8Vm5hLAGsA8oy/PACoR6Y4Nmlmr4DsACxHZnYvMzAWAzuzexjgwd+DM3OhEEdkc+g/AagCFp9qJSGNRfZly9tr95Fi5L9H2lIRE1Gub+4ux61KgobzIdhgcEJGr3MZjFnU9NeC9ZZbDvrftVMoUQu85wMwLAMsjc1p/Kxr4I4APAJ5s7x+bf9yBFPFW/gDgG4BPAL6k2NhzwFa3GR/+Jh74xtrvCh4eVFNyEglHwBvLfRK4SiwHhrznBFdJikBucJVoDrwHuEpKBH4BuAHwNxe4yhQHWruW9U7/CuAfgJ8APkeC308NiI2Ac+h3Arims5oa81oT6qVxzmVkxYeCafTuvK4/xpn1odJscADAx9SixIBXVna1lrIu6F/at9WxoSMuBVpAdsb0WPCVB3orIlqaLZh5qwvS1sq8WvvdWJu3F4HYqvhe88rMawt35R1QtUVjqas0m62tusEbwVXXDfxILcOIqCaiLREVgV51ZaArVR/oCiLaqZ3XN8kJDvREVI3pD40f0VVOf8pl9EMPohG+PFvYfZ6Uxi9fV1iq1E66A5ZPzePGcuqkMZKVHnhrege+cEe548XJb0Njcx2QrDbd3FbeBH0r0w074azHaY5zIMvr+OyT8GIC4D9ghivn9fYcPwAAAABJRU5ErkJggg==";
            // review.position = 0;
            // review.fix = true;
            // review.content = tapPanel.GetTabPanelElement;
            // review.title_content = reivewDeleteButton;

            // ui_tab.Tab.AddTab(review);

            scope.GetReviewPanel = tapPanel.GetTabPanelElement;

            // review

            deleteReviewPanelItems();
        }

        function deleteReviewPanelItems() {
            let del = document.createElement('div');
            del.className = 'VIZWeb SH_panel_title_button SH_title_button SH_delete_icon';

            scope.ReviewPanel.Element.Title.appendChild(del);

            del.addEventListener('click', function () {
                scope.ReviewDelete();
            });
        }

        this.ReviewDelete = function () {
            // DeleteByID
            scope.ReviewLayer.forEach(function (value, key) {
                if (value.style.display === "block") {
                    if (value.id.includes("UserView")) {
                        let item = scope.ReivewItems.get(value);
                        if (item) {
                            for (let index = 0; index < item.length; index++) {
                                const element = item[index];
                                if (element.ischeck === true) {
                                    let review = vizwide3d.Review.GetReview(element.id);
                                    vizwide3d.Review.DeleteByID(review.id);
                                    if (review.tag.cameraId !== undefined)
                                        vizwide3d.View.DeleteCameraBackupData(review.tag.cameraId);
                                }
                            }
                        }
                    } else if (value.id.includes("Measure")) {
                        let item = scope.ReivewItems.get(value);
                        if (item) {
                            for (let index = 0; index < item.length; index++) {
                                const element = item[index];
                                if (element.ischeck === true) {
                                    let measureId = element.id.replace('MeasureList', '');
                                    vizwide3d.Review.DeleteByID(measureId);
                                }
                            }
                        }
                    } else if (value.id.includes("Note")) {
                        let item = scope.ReivewItems.get(value);
                        if (item) {
                            for (let index = 0; index < item.length; index++) {
                                const element = item[index];
                                if (element.ischeck === true) {
                                    let noteId = element.id.replace('NoteList', '');
                                    vizwide3d.Review.DeleteByID(noteId);
                                }
                            }
                        }
                    }
                }
            });
        }

        // X 버튼 
        this.OnCloseButtonEvent = function(event){
            scope.ReviewPanel.OnCloseButtonEvent(event);
        };

        this.Show = function(bool){
            scope.ReviewPanel.Show(bool);
        };
        

        let OnReviewChanged = function (e) {
            scope.ReivewItems = new Map();
            for (let index = 0; index < tapPanel.TabPanelLayerContent.length; index++) {
                const element = tapPanel.TabPanelLayerContent[index];
                element.innerHTML = '';
            }

            let reivewItems = vizwide3d.Main.Data.Reviews;

            // console.log(reivewItems)
            // addReview(reivewItems);
            // test(reivewItems);

            addReview(reivewItems);

        };

        // 리뷰 변경 이벤트(추가, 삭제)
        vizwide3d.Review.OnReviewChangedEvent(OnReviewChanged);

        // 노트, 측정 추가
        function addReview(items) {
            let noteListElement = document.createElement('div');
            let measureListElement = document.createElement('div');
            let listElement = document.createElement('div');
            let noteItemMap = new Map();
            let noteArray = [];
            let measureItemMap = new Map();
            let measureArray = [];
            let itemMap = new Map();
            let itemArray = [];
            let seqSnapshot = 1;
            for (let index = 0; index < items.length; index++) {
                let review = items[index];
                // 노트랑 측정 구분
                if (vizwide3d.Main.Data.Review.GetReviewType(review.itemType) === 0) {
                    let list = document.createElement('div');
                    list.id = 'NoteList' + review.id;
                    list.className = "VIZWeb SH_review_panel_list SH_review_panel_unclick";
                    list.ischeck = review.selection;

                    let checkbox = document.createElement("div");
                    checkbox.type = "button";
                    checkbox.id = review.id;
                    checkbox.className = "VIZWeb SH_review_panel_checkbox SH_check_icon_color";
                    checkbox.ischeck = review.visible; // 리뷰가 보이는지 보이지 않는지에 따라 변경 되어야함
                    list.appendChild(checkbox);

                    if (!checkbox.ischeck) {
                        checkbox.className = "VIZWeb SH_review_panel_checkbox SH_uncheck_icon_color";
                    } else {
                        checkbox.className = "VIZWeb SH_review_panel_checkbox SH_check_icon_color";
                    }

                    if (list.ischeck) {
                        list.classList.replace("SH_review_panel_unclick", "SH_review_panel_click");
                        // if (!checkbox.ischeck) {
                        //     checkbox.className = "VIZWeb SH_review_panel_checkbox SH_uncheck_icon_white";
                        // } else {
                        //     checkbox.className = "VIZWeb SH_review_panel_checkbox SH_check_icon_white";
                        // }
                    } else {
                        list.classList.replace("SH_review_panel_click", "SH_review_panel_unclick");
                        if (!checkbox.ischeck) {
                            checkbox.className = "VIZWeb SH_review_panel_checkbox SH_uncheck_icon_color";
                        } else {
                            checkbox.className = "VIZWeb SH_review_panel_checkbox SH_check_icon_color";
                        }
                    }

                    let text = "";
                    for (let index = 0; index < review.text.value.length; index++) {
                        const element = review.text.value[index];
                        text += element;
                    }

                    let label = document.createElement('label');
                    label.textContent = text;
                    label.id = 'NoteLabel' + review.id;
                    label.className = "VIZWeb SH_review_panel_checkbox_text";
                    label.ischeck = false;

                    list.appendChild(label);

                    noteListElement.appendChild(list);

                    checkbox.addEventListener('click', function (e) {
                        if (checkbox.ischeck) {
                            vizwide3d.Review.Show(checkbox.id, false);
                            checkbox.className = "VIZWeb SH_review_panel_checkbox SH_uncheck_icon_color";
                        } else {
                            vizwide3d.Review.Show(checkbox.id, true);
                            checkbox.className = "VIZWeb SH_review_panel_checkbox SH_check_icon_color";
                        }
                        checkbox.ischeck = !checkbox.ischeck;
                    });

                    noteArray.push(list);

                    noteItemMap.set(label, list);
                    noteItemMap.set(list, list);
                }
                else if (vizwide3d.Main.Data.Review.GetReviewType(review.itemType) === 1) {
                    // Measure
                    let list = document.createElement('div');
                    list.id = 'MeasureList' + review.id;
                    list.className = "VIZWeb SH_review_panel_list SH_review_panel_unclick";
                    list.ischeck = review.selection;

                    let checkbox = document.createElement("div");
                    checkbox.type = "button";
                    checkbox.id = review.id;
                    checkbox.className = "VIZWeb SH_review_panel_checkbox";
                    checkbox.ischeck = review.visible; // 리뷰가 보이는지 보이지 않는지에 따라 변경 되어야함
                    list.appendChild(checkbox);

                    if (!checkbox.ischeck) {
                        checkbox.className = "VIZWeb SH_review_panel_checkbox SH_uncheck_icon_color";
                    } else {
                        checkbox.className = "VIZWeb SH_review_panel_checkbox SH_check_icon_color";
                    }

                    if (list.ischeck) {
                        list.classList.replace("SH_review_panel_unclick", "SH_review_panel_click");
                        // if (!checkbox.ischeck) {
                        //     checkbox.className = "VIZWeb SH_review_panel_checkbox SH_uncheck_icon_white";
                        // } else {
                        //     checkbox.className = "VIZWeb SH_review_panel_checkbox SH_check_icon_white";
                        // }
                    } else {
                        list.classList.replace("SH_review_panel_click", "SH_review_panel_unclick");
                        if (!checkbox.ischeck) {
                            checkbox.className = "VIZWeb SH_review_panel_checkbox SH_uncheck_icon_color";
                        } else {
                            checkbox.className = "VIZWeb SH_review_panel_checkbox SH_check_icon_color";
                        }
                    }

                    let label = document.createElement('label');

                    let text = "";
                    for (let index = 0; index < review.text.value.length; index++) {
                        const element = review.text.value[index];
                        text += element;
                    }

                    label.textContent = text;
                    label.className = "VIZWeb SH_review_panel_checkbox_text";
                    list.appendChild(label);

                    measureListElement.appendChild(list);

                    checkbox.addEventListener('click', function (e) {
                        if (checkbox.ischeck) {
                            vizwide3d.Review.Show(checkbox.id, false);
                            checkbox.className = "VIZWeb SH_review_panel_checkbox SH_uncheck_icon_color";
                        } else {
                            vizwide3d.Review.Show(checkbox.id, true);
                            checkbox.className = "VIZWeb SH_review_panel_checkbox SH_check_icon_color";
                        }
                        checkbox.ischeck = !checkbox.ischeck;
                    });

                    measureArray.push(list);

                    // measureItemMap.set(checkbox, list);
                    measureItemMap.set(label, list);
                    measureItemMap.set(list, list);
                }
                else if (vizwide3d.Main.Data.Review.GetReviewType(review.itemType) === 2) {
                    // Snapshot
                    //addUserView();
                    let imageCheckBoxDiv = document.createElement('div');
                    imageCheckBoxDiv.id = review.id;
                    imageCheckBoxDiv.className = "VIZWeb SH_review_panel_img_checkbox_div SH_review_panel_img_unclick";
                    //imageCheckBoxDiv.ischeck = false;
                    imageCheckBoxDiv.ischeck = review.selection;

                    if (imageCheckBoxDiv.ischeck) {
                        imageCheckBoxDiv.classList.replace("SH_review_panel_img_unclick", "SH_review_panel_img_click");
                    } else {
                        imageCheckBoxDiv.classList.replace("SH_review_panel_img_click", "SH_review_panel_img_unclick");
                    }

                    let image = document.createElement('div');
                    image.className = "VIZWeb SH_review_panel_img_checkbox";
                    
                    if (review.tag.thumbnail === '' || review.tag.thumbnail === undefined) {
                        review.tag.thumbnail = "iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAB8kAAAfJAEBXLhIAAADzklEQVR4nO2dS3LaQBBA26lUZYmX2eFF9uATmCx67xvgGyScILmBuQHmBs56FiYniHMDcoO4KntSk+ohkpDQ/LplTfWr8sJIGtBDjLp7BubicDiAws8bdSzDW59nQcRFAefKhjFm19d2Z9eBiHMA+AwAy7Gc8MBsAWBtjHluexmtohHRCr4v2wsbK2PMutn4SR+tkpO5J4c1alc0dRc/xnh2r5DrajfSvKJP3gklmprLZtTRdeP7BQAP6ryVOwCYtmxY0rZ/HLsOCuGeWg6wkufGmN+Sr34sIOIlADx3yP7oQj+fhOVBJXdDbno/7ZoZCqGihVDRQqhoIVS0EF7Vu1JAxCsAsH97Y8xeRWeE4lxb5LkFgIlrGRFf6PG1RPhadNdBtZs9ZWmTxmb7/xe7nfZjpVjRJG/XIriJ3b6jboWNkq/otYdkx4S7llOkaLqabwIPu+HsQkq9om8jj2MbG9U4us4lV8MqWggVXYctni5V9KPwcb0UKZoGRb8HHrblTMtL7jps5PHiue9P7oHpQUVzZmNUv1iQxHPY7QvuescgRSUq9Nj+8MomCVwnSV3IHBHvaES6msR8s6/BGCMyui8umiTbGsSMHrJ1BtYrimQOOl1CtOuoVNNmlYdnCVHCaBATTfNGuqppts5Q9AQdEdHURz71VNOWiHgyC7MU2EUj4lcA2Hju/onelOJgFU3dgR3FCGFTomwW0TayQMRdwrcF1hLDS5JkF10J30IL71Xc8FIxsrOK7gjfYrGyH+mNGz3ZRPeEb7FM6coevewsoj3Dt1hEEhr7aUREtqkHyaIDw7dYWBOaytSEKde9IUl0ZPgWC0tC0zL/g+VGHCU6Q/gWS9aE5swkm+yyg0VnCt9SyJLQeMxkyio7SHTm8C2FpIQmYrpYsmxv0UzhWyzRAgIkO7LI9hLNHL7FEpzQREh2JMv2Eb0QCN9i8U5oEiQ7kmT7iB7qpudLb0KTQbIjWnYp0w06E5qMkh1Rskua13GS0DBIdgTLLm0CzTGhYZTsCJJd4kylDdVfJELRCT3P+74dS/1WllT9BUh2b6aq03bz8K6vFRUthIoWQkULoaJ5+eBaV9G8HMM+Fc3LH9e6iual8wcGFSZUtBAqWggVLYSKFkJFC6GihVDRQqhoIVS0ECpaCBUthIoWQkULoaKFUNFCqGghmks46SqSGTHGXLjWmlf0dqwn9QqpuWyKLvaHSQag5rImmn5Va1W4AAlWzQUkT26GtOihyo7Hb+FI+C/7WvvsILa0hmFr9+u1XLUu7nuepMV9lbxowiIBAPwFkGIqLA0rFlAAAAAASUVORK5CYII=";
                    }

                    // image.style.backgroundImage = "url( data:image/png;base64," + review.tag.thumbnail + ")";
                    image.innerHTML = "<img src=data:image/png;base64," + review.tag.thumbnail + " style='width: 85px; height: 85px;'>";

                    imageCheckBoxDiv.appendChild(image);

                    let label = document.createElement('label');

                    if (review.tag.title === undefined || review.tag.title.length <= 0  ) {
                        label.textContent = "Snapshot" + seqSnapshot;
                        seqSnapshot++;
                    } else {
                        label.textContent = review.tag.title;
                    }
                    label.className = "VIZWeb SH_review_panel_img_checkbox_text";
                    imageCheckBoxDiv.appendChild(label);

                    listElement.appendChild(imageCheckBoxDiv);
                    itemArray.push(imageCheckBoxDiv);

                    itemMap.set(image, imageCheckBoxDiv);
                    itemMap.set(image.childNodes[0], imageCheckBoxDiv);
                    itemMap.set(label, imageCheckBoxDiv);
                    itemMap.set(imageCheckBoxDiv, imageCheckBoxDiv);
                }
            }

            // 노트 리스트 선택
            noteListElement.addEventListener('click', function (e) {
                for (let index = 0; index < noteArray.length; index++) {
                    const element = noteArray[index];
                    if (element === noteItemMap.get(e.target)) {
                        if (element.ischeck) {
                            element.style.backgroundColor = '';
                            let noteId = element.id.replace('NoteList', '');
                            vizwide3d.Review.Select(noteId, false);
                        } else {
                            element.style.backgroundColor = '#9ADEE3';
                            let noteId = element.id.replace('NoteList', '');
                            vizwide3d.Review.Select(noteId, true);
                        }
                        element.ischeck = !element.ischeck;
                    }
                }
            });

            // 측정 리스트 선택
            measureListElement.addEventListener('click', function (e) {
                for (let index = 0; index < measureArray.length; index++) {
                    const element = measureArray[index];
                    if (element === measureItemMap.get(e.target)) {
                        if (element.ischeck) {
                            element.style.backgroundColor = '';
                            let noteId = element.id.replace('MeasureList', '');
                            vizwide3d.Review.Select(noteId, false);
                        } else {
                            element.style.backgroundColor = '#9ADEE3';
                            let noteId = element.id.replace('MeasureList', '');
                            vizwide3d.Review.Select(noteId, true);
                        }
                        element.ischeck = !element.ischeck;
                    }
                }
            });

            // // Snapshot 리스트 선택
            listElement.addEventListener('click', function (e) {
                for (let index = 0; index < itemArray.length; index++) {
                    const element = itemArray[index];
                    if (element === itemMap.get(e.target)) {
                        element.style.border = 'solid 2px #36afb8';

                        // 리뷰 반환
                        let review = vizwide3d.Review.GetReview(element.id);
                        element.ischeck = true;
                        if (review !== undefined) {
                            element.ischeck = review.selection;
                            vizwide3d.Review.Select(review.id, true);
                            vizwide3d.Main.Data.Review.RestoreSnapShotReview(review.id);
                        }
                    } else {
                        element.style.border = '';
                        element.ischeck = false;
                        // 리뷰 반환
                        let review = vizwide3d.Review.GetReview(element.id);
                        if (review !== undefined)
                            vizwide3d.Review.Select(review.id, false);
                    }
                }
            });

            for (let index = 0; index < tapPanel.TabPanelLayerContent.length; index++) {
                const element = tapPanel.TabPanelLayerContent[index];
                if (element.id.includes('Note')) {
                    element.appendChild(noteListElement);
                    scope.ReivewItems.set(element, noteArray);
                } else if (element.id.includes('Measure')) {
                    element.appendChild(measureListElement);
                    scope.ReivewItems.set(element, measureArray);
                }
                else if (element.id.includes('UserView')) {
                    element.appendChild(listElement);
                    scope.ReivewItems.set(element, itemArray);
                }
            }
        }

        this.RefreshPanel = function() {
            OnReviewChanged();
        };

        this.SetFocusTab = function(id) {
            tapPanel.SetFocusTab(id);
        };

        let init = function () {
            initElement();
        };

        init();
    }
}
export default ReviewPanel;