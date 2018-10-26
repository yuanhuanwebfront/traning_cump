import {getDetailWebInfo} from '../../common/$http'
import {formatTime} from '../../common/common'

let app = getApp();

let pageInfo = {
    listEnd: false,                              //  列表是否加载完成
    currentPage: 1,
    tempList: []
};

Page({

    data: {
        listEnd: false,
        sessionList: [],
        realHeight: wx.getSystemInfoSync().windowHeight
    },

    onLoad() {
        this.loadList();
        wx.setNavigationBarTitle({
            title: "已结束课程"
        })
    },

    loadList() {

        let params = {
            page: pageInfo.currentPage,
            size: 20
        };

        getDetailWebInfo(params, this.handleList, 'getUserEndSessionList');

    },

    handleList(data) {

        let list = [];

        data.forEach(item => {
            let obj = {
                isOnline: item.is_online === 1,
                source_id: item.source_id,
                session_img: item.image_phone,
                session_status: 3,
                session_end_time: formatTime(item.session_end_time * 1000, 'yyyy-mm-dd'),
                id: item.id,
            };
            list.push(obj);
        });

        pageInfo.tempList.push(...list);
        pageInfo.listEnd = data.length < 20;

        this.setData({
            sessionList: pageInfo.tempList
        })

    },

    onReachBottom() {
        if (pageInfo.listEnd) {
            return false;
        } else {
            pageInfo.currentPage++;
            this.loadList();
        }
    }


});