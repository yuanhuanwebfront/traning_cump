import {getDetailWebInfo} from '../../common/$http';
import {formatTime} from '../../common/common';

let mySa = require('../../common/sa.js');

// status 0 未参加  1 未成功  2 已结束   is_join == 1  已参加

const mock = {
    list: [{
        image: "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        sessionTitle: "活动标题1",
        subTitle: "活动副标题1",
        price: "10",
        joinPerson: "100",
        status: 0
    },{
        image: "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        sessionTitle: "活动标题1",
        subTitle: "活动副标题1",
        price: "10",
        joinPerson: "100",
        status: 1
    },{
        image: "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        sessionTitle: "活动标题1",
        subTitle: "活动副标题1",
        price: "10",
        joinPerson: "100",
        status: 2
    },{
        image: "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        sessionTitle: "活动标题1",
        subTitle: "活动副标题1",
        price: "10",
        joinPerson: "100",
        status: 0,
        is_join: 0
    }],
    myActivityList: [{
        session_image: 'http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg',
        session_name: '已购买课程名称1',
        session_end_time: '2018-11-09'
    },{
        session_image: 'http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg',
        session_name: '已购买课程名称2',
        session_end_time: '2018-12-09'
    }]
};

Page({

    data: {
        showJoinSessionBtn: true,
        sessionList: [],
        currentSwiper: 0,
        activityList: mock.list,
        mineActivityList: mock.myActivityList
    },

    onLoad() {

        let sid = wx.getStorageSync('sid');
        mySa.trackEvent(11, {page_id: 1001});
        if (!sid) {
            wx.navigateTo({
                url: '../login/login'
            })
        }

    },

    onShow() {
        if (wx.getStorageSync('sid')) {
            getDetailWebInfo({}, this.handleSessionInfo, 'getUserSessionList');
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
            sessionList: [] || list
        })
    },

    toSessionEndList() {
        wx.navigateTo({
            url: '../../session/sessionEndList/sessionEndList'
        })
    },

    toMineActivityList(){
      wx.navigateTo({
        url: '/activity/activityMine/activityMine'
      })  
    },

    seeMoreActivity(){
        wx.navigateTo({
            url: '/activity/activityList/activityList'
        })
    },

    joinSession() {
        wx.switchTab({
            url: '../index/index'
        })
    },

    setStatus(){
        let maxLen = this.data.activityList.length,
            nextSwiper = this.data.currentSwiper + 1;
        this.setData({
            "currentSwiper": nextSwiper >= maxLen ? 0 : nextSwiper
        })
    },

    stopTouchEvent(e){
        return false;
    }


});