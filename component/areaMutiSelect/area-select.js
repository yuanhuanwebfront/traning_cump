/**
 *  省市区三级联动组件
 *  @prop areaInfo (Object)  是一个有pId, cId, aId三个属性的对象  用于初始化picker里面的三个List
 *  @prop showPicker (Boolean)  控制picker的显示和隐藏
 */


// import area from "../../mock/area";

// let proviceList = [];
// let cityList = [...area[0].citylist];
// let areaAllList = [...(area[0].citylist[0].areaList)];
let proviceList = [],
    cityList = [],
    areaAllList = [],
    tempList = [0, 0, 0];

// area.forEach(item => {
//     proviceList.push({
//         pid: item.pid,
//         pname: item.pname
//     })
// });

//  通过一个 areaInfo 对象来确定 valueList
function getValueListByInfo(areaInfo, area) {
    let valueList = [0, 0, 0];

    if (areaInfo.pId && areaInfo.cId && areaInfo.aId) {

        area.forEach((item, idx) => {
            if (item.pid === areaInfo.pId) {
                valueList[0] = idx;
            }
        });

        area[valueList[0]].citylist.forEach((item, idx) => {
            if (item.cid === areaInfo.cId) {
                valueList[1] = idx;
            }
        });

        area[valueList[0]].citylist[valueList[1]].areaList.forEach((item, idx) => {
            if (item.aid === areaInfo.aId) {
                valueList[2] = idx;
            }
        });

    }
    return valueList;

}

// 通过ValueList来确定pickerList要显示哪些
function setPickerListByValueList(valueList, area) {
    let realList = {
        cityList: area[valueList[0]].citylist,
        areaAllList: area[valueList[0]].citylist[valueList[1]].areaList
    };
    return realList;
}

//  通过valueList获取地区信息(pid + cid + aid 省市区名称)
function getAreaInfoByValueList(valueList, area) {
    let nameList = [],
        idList = [];

    nameList.push(area[valueList[0]].pname, area[valueList[0]].citylist[valueList[1]].cname, area[valueList[0]].citylist[valueList[1]].areaList[valueList[2]].aname);
    idList.push(area[valueList[0]].pid, area[valueList[0]].citylist[valueList[1]].cid, area[valueList[0]].citylist[valueList[1]].areaList[valueList[2]].aid);

    return {
        nameList,
        idList
    }
}


Component({

    properties: {
        areaInfo: {
            type: Object,
            value: {},
            observer(newVal, oldVal) {
                if(newVal.pId && newVal.cId && newVal.aId){
                    this.initList();
                }
            }
        },
        showPicker: {
            type: Boolean,
            value: false
        },

        areaData: {
            type: Object,
            value: {}
        }
    },

    attached() {
        cityList = [...this.data.areaData[0].citylist];
        areaAllList = [...(this.data.areaData[0].citylist[0].areaList)];

        this.data.areaData.forEach(item => {
            proviceList.push({
                pid: item.pid,
                pname: item.pname
            })
        });
        this.setData({
            cityList,
            areaAllList,
            proviceList
        })
        // 根据后台数据确定下拉框当前选项;
        this.initList();
    },

    data: {
        areaList: [0, 0, 0]
    },

    methods: {

        change(e) {
            let changeList = e.detail.value;
            // 省份改变  市区回到开头
            if (tempList[0] !== changeList[0]) {
                changeList[1] = 0;
            }

            if (tempList[1] !== changeList[1]) {
                changeList[2] = 0;
            }

            let sendInfo = setPickerListByValueList([...changeList], this.data.areaData);

            this.setData({
                cityList: sendInfo.cityList,
                areaAllList: sendInfo.areaAllList
            });
            this.setData({
                areaList: changeList
            });
            tempList = [...changeList];
        },

        cancel(e) {
            this.triggerEvent('cancel', false);
        },

        confirm(e) {
            let areaInfo = getAreaInfoByValueList(this.data.areaList, this.data.areaData);
            this.triggerEvent('confirm', {
                showPicker: false,
                nameList: areaInfo.nameList,
                idList: areaInfo.idList
            });
        },

        initList (){
            let initList = getValueListByInfo(this.data.areaInfo, this.data.areaData),
                pickerInfo = setPickerListByValueList(initList, this.data.areaData);
            tempList = [...initList];
            this.setData({
                cityList: pickerInfo.cityList,
                areaAllList: pickerInfo.areaAllList
            });

            this.setData({
                areaList: initList
            })
        }

    },


});