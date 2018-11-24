import {getDetailWebInfo} from "../../common/$http";
import {formatTime, navigateToPath} from "../../common/common";

let tempList = [];
let pageParams = {
        page: 1,
        size: 10
    },
    mySa = require('../../common/sa.js');

Page({

    data: {
        mineActivityList: []
    },

    onLoad(options) {

        mySa.trackEvent(7, {
            page_id: 1019
        });

        if (options.type) {
            this.setData({isBuyPage: true});
            pageParams.page = 1;
            getDetailWebInfo(pageParams, this.handleMineList, 'getUserJoinActivitySessionHaveInHand');
        } else {
            getDetailWebInfo({}, this.handleMineList, 'getUserJoinActivitySessionList');
        }

    },

    handleMineList(data) {

        let mineActivityList = data.map(item => {
            return {
                id: item.id,
                price: item.price,
                baseEnrollNum: item.base_enroll_num,
                sessionImage: item.image_phone,
                sessionName: item.session_name,
                sessionTitle: item.session_title,
                hasDate: !!item.valid_date,
                validDate: formatTime(item.valid_date * 1000, 'yyyy-mm-dd'),
                activity_id: item.course_activity_id,
                status: item.user_state
            }
        });

        tempList = [...mineActivityList];
        this.setData({
            mineActivityList: [...this.data.mineActivityList, ...tempList]
        });
    },

    onReachBottom() {
        if (tempList.length >= pageParams.size && this.data.isBuyPage) {
            pageParams.page++;
            getDetailWebInfo(pageParams, this.handleMineList, 'getUserJoinActivitySessionHaveInHand');
        }
    },

    toWatchVideo(e) {
        let {id, activity_id} = e.target.dataset.info,
            url = `/activity/activitySessionVideo/activitySessionVideo?session_id=${id}&activity_id=${activity_id}`;
        navigateToPath(url)
    },

    backHome() {
        wx.switchTab({
            url: '/pages/index/index'
        })
    }

});