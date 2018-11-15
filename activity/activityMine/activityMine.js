import {getDetailWebInfo} from "../../common/$http";

Page({

    data: {
        mineActivityList: []
    },

    onLoad(){
        getDetailWebInfo({}, this.handleMineList, 'getUserJoinActivitySessionList');
    },

    handleMineList(data){
        let mineActivityList = data.map(item => {
            return {
                id: item.id,
                price: item.price,
                baseEnrollNum: item.base_enroll_num,
                sessionImage: item.image_phone,
                sessionName: item.session_name,
                sessionTitle: item.session_title,
                activity_id: item.activity_course_id,
                status: item.user_state
            }
        });
        this.setData({mineActivityList});
    },

    backHome(){
        wx.switchTab({
            url: '/pages/index/index'
        })
    }

});