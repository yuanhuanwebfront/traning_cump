let app = getApp(),
    globalInterval = null,
    hasGetInfo = false,
    wxParseObj = require('../../lib/wxParse/wxParse.js');

import {getDetailWebInfo} from '../../common/$http';
import {navigateToPath} from '../../common/common';


Page({

    data: {
        sessionImage: 'http://qiniucdn.dailyyoga.com.cn/e2/19/e21918c26897cb13ee79dd28755fd9ac.png',
        sessionInfo: {
            finalPrice: [0, 0],
            dayCount: 0,
            hourCount: 0,
            minuteCount: 0,
            secondCount: 0,
            millsCount: 0
        },
        showInviteDialog: false,
        showShareInDialog: false,
        showEndDialog: false,
        activityClass: {
            0: '',
            1: '',
            2: '',
            4: 'finish-session'
        },
        activityDetail: {}
    },

    onLoad(options) {

        wx.hideShareMenu();

        this.setData({
            globalQuery: options
        });

        globalInterval = null;

        if(wx.getStorageSync('sid')){
            hasGetInfo = true;
            this.getDetailInfo(options);
        }else{
            navigateToPath('/pages/login/login');
        }

    },

    onShow(){
        if(this.data.globalQuery && wx.getStorageSync('sid')){
            if(!hasGetInfo) this.getDetailInfo(this.data.globalQuery);
        }
        this.countDown();
    },

    getDetailInfo({session_id, activity_id, invite_id, id}) {
        let params = {
            session_id,
            activity_course_id: activity_id
        };
        if(invite_id && id){
            //      给别人助力的逻辑
            let assistParams = {
                ...params,
                id,
                session_user_id: invite_id,
            };
            getDetailWebInfo(assistParams, this.handleInviteInfo, 'userPowerActivities');
        }

        getDetailWebInfo(params, this.handleDetailInfo, 'getActivitySessionInfo');


    },

    handleInviteInfo(data){
        //  state 2  提示已经助力过了
        if(data.state !== 0){
            this.setData({
                showShareInDialog: true,
                inviteInfo: {
                    helpUserName: data.FirstName,
                    inviteList: data.invite_list,
                    inviteUserName: data.invite_list[0] && data.invite_list[0].FirstName ? data.invite_list[0].FirstName : ''
                }
            })
        }
    },

    handleDetailInfo(data) {

        let templateH5 = data.introduction,
            fullArr = new Array(data.activity_user_num).fill({});

        wxParseObj.wxParse('templateDetailH5', 'html', templateH5, this);

        this.setData({
            activityDetail: {
                id: data.id,
                sessionImage: data.site_banner_img,
                realPrice: parseInt(data.price),
                joinPerson: data.base_enroll_num,
                end_time: data.end_time,
                session_title: data.session_name,
                session_subtitle: data.session_title,
                full_person: data.activity_user_num,
                invite_list: data.invite_list,
                status: data.status             //  1 进行中  2  已完成  3 已购买  4 已结束
            },
            allInviteList: fullArr.map((item, idx) => {
                if (data.invite_list[idx]) {
                    return {...idx.invite_list[index]}
                }
            }),
            showEndDialog: data.status === 4
        }, () => {
            this.countDown();
        });

    },

    countDown() {

        let vm = this,
            minuteNum = 1000 * 60,
            hourNum = minuteNum * 60,
            dayNum = hourNum * 24,
            endTime = this.data.activityDetail.end_time ? this.data.activityDetail.end_time * 1000 : 0;


        if (endTime - new Date().getTime() <= 0) {
            return false;
        }

        globalInterval = setInterval(() => {

            let nowTimeStamp = endTime - new Date().getTime(),
                dayCount = Math.floor(nowTimeStamp / dayNum),
                hourCount = Math.floor((nowTimeStamp - dayCount * dayNum) / hourNum),
                minuteCount = Math.floor((nowTimeStamp - dayCount * dayNum - hourCount * hourNum) / minuteNum),
                secondCount = Math.floor((nowTimeStamp - dayCount * dayNum - hourCount * hourNum - minuteCount * minuteNum) / 1000),
                millsCount = Math.floor((nowTimeStamp - dayCount * dayNum - hourCount * hourNum - minuteCount * minuteNum - secondCount * 1000) / 100);

            vm.setData({
                'sessionInfo.dayCount': dayCount,
                'sessionInfo.hourCount': hourCount,
                'sessionInfo.minuteCount': minuteCount,
                'sessionInfo.secondCount': secondCount,
                'sessionInfo.millsCount': millsCount
            })


        }, 100)

    },

    onHide() {
        clearInterval(globalInterval);
    },

    onUnload() {
        clearInterval(globalInterval);
    },

    onShareAppMessage(){
        let inviteId = app.globalData.userInfo.uid,
            activityId = this.data.globalQuery.activity_id,
            sessionId = this.data.globalQuery.session_id,
            id = this.data.activityDetail.id,
            shareUrl = `/activity/activityDetail/activityDetail?session_id=${sessionId}&activity_id=${activityId}&invite_id=${inviteId}&id=${id}`;

        getDetailWebInfo({session_id: sessionId}, () => {

        }, 'userShare');

        return {
            title: '来帮我免费得课程吧！',
            path: shareUrl
        }

    },

    openInviteDialog() {
        this.setData({
            showInviteDialog: true
        })
    },

    openShareInDialog() {
        this.setData({
            showShareInDialog: true
        })
    },

    closeDialog(e) {
        let closeStatus = e.target.dataset.close === '1';
        if (closeStatus) {
            this.setData({
                showInviteDialog: false,
                showShareInDialog: false,
                showEndDialog: false
            })
        }

    },

    backHome() {
        wx.switchTab({url: '/pages/index/index'})
    }

});