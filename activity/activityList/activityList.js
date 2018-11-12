import {getDetailWebInfo} from "../../common/$http";

const mock = {
    list: [{
        image: "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        sessionTitle: "活动标题1",
        subTitle: "活动副标题1",
        price: "10",
        status: 0,
        joinPerson: "100"
    },{
        image: "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        sessionTitle: "活动标题2",
        subTitle: "活动副标题2",
        price: "20",
        status: 1,
        joinPerson: "200"
    },{
        image: "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        sessionTitle: "活动标题3",
        subTitle: "活动副标题2",
        price: "30",
        status: 2,
        joinPerson: "300"
    }]
};



Page({

    data: {
        activityList:[]
    },

    onLoad(){
        this.getActivityList();
    },

    getActivityList(){
        getDetailWebInfo({}, this.handleActivityList, 'getCourseActivityList');
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
                activity_id: item.activity_course_id,
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