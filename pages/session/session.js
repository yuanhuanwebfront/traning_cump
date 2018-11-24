import {getDetailWebInfo} from '../../common/$http';
import {formatTime, navigateToPath} from '../../common/common';

let mySa = require('../../common/sa.js');

let GLOBAL_SWIPER = 0;

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
        getDetailWebInfo({
            page: 1,
            size: 3
        }, this.handleUserJoinActivityList, 'getUserJoinActivitySessionHaveInHand');
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

    handleUserJoinActivityList(data){
        function formatSession(item){
            return {
                session_image: item.image_phone,
                session_name: item.session_name,
                session_id: item.id,
                activity_id: item.course_activity_id,
                validDate: formatTime(item.valid_date * 1000, 'yyyy-mm-dd'),
            }
        }
        this.setData({
            mineActivityList: data.map(formatSession)
        });
    },

    //  TODO    获取我的活动课程    暂时没有购买操作  后面再处理

    toMineActivityList(){
        navigateToPath('/activity/activityMine/activityMine?type=1');
    },

    toMoreActivity(){
        navigateToPath('/activity/activityList/activityList');
    },

    toWatchVideo(e){
        let {session_id, activity_id} = e.target.dataset.info,
            url = `/activity/activitySessionVideo/activitySessionVideo?session_id=${session_id}&activity_id=${activity_id}`;
        navigateToPath(url)
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