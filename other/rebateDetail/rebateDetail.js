import {getRebate} from '../../common/$http';
import {formatTime, wxSetNavTitle} from '../../common/common';

function handleMoney(money) {
    return (money / 100).toFixed(2);
}

let pageParams = {
    page: 1,
    page_size: 10
};

let tempList = [],
    globalStatus = "",
    globalSid = "",
    listEnd = false;

Page({

    data: {
        detailInfo: {
            totalIncome: 0
        },
        detailList: []
    },

    onLoad(options) {
        globalStatus = options.type;
        globalSid = wx.getStorageSync('sid');
        wxSetNavTitle('返利详情');
        this.initParams();
        this.getDetail();
    },

    onReachBottom() {
        if(!listEnd){
            this.getDetail();
        }
    },

    initParams (){
        pageParams.page = 1;
        tempList = [];
        listEnd = false;
    },

    getDetail() {
        pageParams.source_type = globalStatus;
        pageParams.sid = globalSid || wx.getStorageSync('sid');

        getRebate(pageParams, this.handleRebateDetail, 'changelist');
    },

    handleRebateDetail(data) {

        data.change_list.forEach(item => {
            item.realMoney = handleMoney(item.money);
            item.realDate = item.time ? formatTime(item.time * 1000, 'yyyy-mm-dd') : false;
        });

        tempList = [...tempList, ...data.change_list];

        listEnd = data.change_list.length < pageParams.page_size;
        
        pageParams.page++;

        this.setData({
            infoList: tempList,
            detailInfo: {
                totalIncome: handleMoney(data.total_change),
                type: globalStatus,
            }
        })

    }
});