import {getDetailWebInfo} from '../../common/$http';
import {formatTime, navigateToPath} from '../../common/common';

let mySa = require('../../common/sa.js');

let GLOBAL_SWIPER = 0;

// status 0 未参加  1 未成功  2 已结束   is_join == 1  已参加

const mock = {
    // 我报名和购买的活动课程列表
    // 课程图片  课程名称  有效期
    // 最多三条（前端页面大于等于三条会只展示两条）
    "mine_activity_list": [{
        "id": 1,
        "session_image": "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        "session_name": "课程名称-1",
        "end_time": "2018-11-2"
    },{
        "id": 2,
        "session_image": "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        "session_name": "课程名称-2",
        "end_time": "2018-11-3"
    },{
        "id": 3,
        "session_image": "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        "session_name": "课程名称-3",
        "end_time": "2018-11-4"
    }],

    // 	配置的活动课程列表
    //  图片 课程标题  课程副标题  课程原价 参加人数  课程状态(0  未参加  1 已参加  2 已购买)
    "activity_list": [{
        "image": "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        "sessionTitle": "活动标题1",
        "subTitle": "活动副标题1",
        "price": "10",
        "joinPerson": "100",
        "status": 0
    }, {
        "image": "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        "sessionTitle": "活动标题2",
        "subTitle": "活动副标题2",
        "price": "20",
        "joinPerson": "200",
        "status": 1
    }, {
        "image": "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        "sessionTitle": "活动标题3",
        "subTitle": "活动副标题3",
        "price": "30",
        "joinPerson": "300",
        "status": 2
    },
        {
        "image": "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        "sessionTitle": "活动标题4",
        "subTitle": "活动副标题4",
        "price": "40",
        "joinPerson": "400",
        "status": 2
    }
    ]
};

Page({

    data: {
        showJoinSessionBtn: true,
        sessionList: [],
        currentSwiper: 0,
        activityList: [],
        mineActivityList: [],
        isCircularSwiper: true
    },

    onLoad() {

        GLOBAL_SWIPER = 0;

        let sid = wx.getStorageSync('sid');

        if (!sid) {
            wx.navigateTo({
                url: '../login/login'
            });
            return;
        }

        mySa.trackEvent(11, {page_id: 1001});

        this.setData({
            mineActivityList: mock.mine_activity_list
        });

    },

    onShow() {
        if (wx.getStorageSync('sid')) {
            getDetailWebInfo({}, this.handleSessionInfo, 'getUserSessionList');
            this.getActivityList();
        }
    },

    handleSessionInfo(data) {

        let list = [];

        data.forEach(item => {
            let info = item.o2_session_info,
                obj = {
                    id: info.id,
                    title: info.session_name + (info.periods ? ' 第' + info.periods + '期' : ''),
                    canEnterRoom: info.session_link_type === 21 || info.session_link_type === 3,
                    source_id: info.source_id,
                    session_img: info.after_apply_image,
                    session_all_time: info.session_days,
                    session_start_time: formatTime(info.session_start_time * 1000, 'yyyy-mm-dd'),
                    session_practicing_time: info.pass_days,
                    session_status: (new Date().getTime() / 1000) - info.session_start_time > 0 ? 2 : 1
                };

            if (item.partner_info.partner_team && item.partner_info.partner_team.team_id) {
                obj.team_id = item.partner_info.partner_team.team_id;
            }

            list.push(obj);
        });

        this.setData({
            sessionList: list
        })
    },

    //  获取活动课程列表
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
                activity_id: item.course_activity_id,
                status: item.user_state
            }
        });
        this.setData({activityList});
        wx.setStorageSync('activityList', activityList);
    },

    //  TODO    获取我的活动课程    暂时没有购买操作  后面再处理

    toMineActivityList(){
        navigateToPath('/activity/activityMine/activityMine');
    },

    toMoreActivity(){
        navigateToPath('/activity/activityList/activityList');
    },

    joinSession() {
        wx.switchTab({
            url: '../index/index'
        })
    },

    changeActivitySwiper(e){
        GLOBAL_SWIPER = e.detail.current;
    },

    changeActivitySwiperByClick(){
        this.setData({
            "currentSwiper": GLOBAL_SWIPER + 1 >= this.data.activityList.length ? 0 : GLOBAL_SWIPER + 1
        })
    }

});