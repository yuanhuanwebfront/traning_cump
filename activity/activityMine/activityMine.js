import {getDetailWebInfo} from "../../common/$http";

let tempList = [];
let pageParams = {
    page: 1,
    size: 10
};

Page({

    data: {
        mineActivityList: []
    },

    onLoad(options){
        if(options.type){
            this.setData({isBuyPage: true});
            pageParams.page = 1;
            getDetailWebInfo(pageParams, this.handleMineList, 'getUserJoinActivitySessionHaveInHand');
        }else{
            getDetailWebInfo({}, this.handleMineList, 'getUserJoinActivitySessionList');
        }

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
                activity_id: item.course_activity_id,
                status: item.user_state
            }
        });

        tempList = [...mineActivityList];
        this.setData({
            mineActivityList: [...this.data.mineActivityList, ...tempList]
        });
    },

    onReachBottom(){
        if(tempList.length >= pageParams.size && this.data.isBuyPage){
            pageParams.page++;
            getDetailWebInfo(pageParams, this.handleMineList, 'getUserJoinActivitySessionHaveInHand');
        }
    },

    backHome(){
        wx.switchTab({
            url: '/pages/index/index'
        })
    }

});