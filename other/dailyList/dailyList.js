import {diaryRequest} from '../../common/$http';

let listParams = {
    page: 1,
    page_size: 10
};

let globalInfo = {
    listEnd: false,
    tempList: []
};

Page({

    data: {
        dailyList: []
    },

    onLoad() {
        globalInfo.tempList = [];
        globalInfo.listEnd = false;
        this.getList();
    },

    onReachBottom() {

        if (!globalInfo.listEnd) {
            listParams.page++;
            this.getList();
        }

    },

    getList() {
        diaryRequest(listParams, 'getUserDiaryList', this.handleDailyList, 'GET')
    },

    handleDailyList(data) {

        let listLength = data.list.length;

        globalInfo.listEnd = listLength < listParams.page_size;

        globalInfo.tempList = [...globalInfo.tempList, ...data.list];

        this.setData({
            dailyList: globalInfo.tempList
        })

    },

    toDailyDetail(e) {
        let {id, status} = e.target.dataset;
        wx.navigateTo({
            url: '../markDaily/markDaily?tab=mine&shareStatus=0&yoga_o2_session_id=' + id + '&sessionStatus=' + status
        })
    },

    backHome(){
        wx.switchTab({
            url: '/pages/index/index'
        })
    }

});