import {getDetailWebInfo} from "../../common/$http";
let mySa = require('../../common/sa.js');


Page({

    data: {
        activityList:[]
    },

    onLoad(){
        mySa.trackEvent(7, {
            page_id: 1017
        });
        this.getActivityList();
    },

    getActivityList(){
        let existList = wx.getStorageSync('activityList');
        if(existList){
            this.setData({
                activityList: existList
            })
        }else{
            getDetailWebInfo({}, this.handleActivityList, 'getCourseActivityList');
        }

    },

    handleActivityList(data){
        let activityList = data.map(item => {
            return {
                id: item.id,
                price: item.price,
                baseEnrollNum: item.base_enroll_num,
                sessionImage: item.image_phone,
                sessionName: item.session_name,
                sessionTitle: item.session_title,
                activity_id: item.course_activity_id,
                status: item.user_state
            }
        });
        this.setData({activityList});
    },

    toMyActivity(){
        wx.navigateTo({
          url: '/activity/activityMine/activityMine'
        })
    },

    backHome(){
        wx.switchTab({
            url: '/pages/index/index'
        })
    }

});