let globalInterval = null,
    hasGetInfo = false,
    mySa = require('../../common/sa.js'),
    wxParseObj = require('../../lib/wxParse/wxParse.js');

import {getDetailWebInfo, transformQrCodeScene} from '../../common/$http';
import {navigateToPath} from '../../common/common';

Page({

    data: {
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
        activityDetail: {},
        emptyImg: "http://qiniucdn.dailyyoga.com.cn/8c/82/8c82090346ccd81acedc440c76d344e2.png",
        globalShareId: '',
        firstEnter: true
    },

    onLoad(options) {

        let vm = this;

        wx.hideShareMenu();

        mySa.trackEvent(7, {
            page_id: 1018
        });

        globalInterval = null;

        function initInfo(){
            vm.setData({
                globalQuery: options,
                notFirstLoad: false
            });
            if (wx.getStorageSync('sid')) {
                hasGetInfo = true;
                vm.getDetailInfo(options);
            } else {
                navigateToPath('/pages/login/login');
            }
        }

        if(options.scene){
            transformQrCodeScene({user_rebate_qr: options.scene}, initInfo);
        }else{
            initInfo();
        }

    },

    onShow() {
        if (this.data.globalQuery && wx.getStorageSync('sid')) {
            if(this.data.notFirstLoad) this.getDetailInfo(this.data.globalQuery);
        }
        this.countDown();
    },

    getDetailInfo({session_id, activity_id, shareId}) {

        let params = {
                session_id,
                activity_course_id: activity_id
            },
            assistParams = {
                user_share_id: shareId,
                ...params
            };

        getDetailWebInfo(params, data => {
            this.setData({notFirstLoad: true});
            this.handleDetailInfo(data, assistParams)
        }, 'getActivitySessionInfo');

    },

    //  处理用户进入分享的详情页，如何处理详情页弹窗的显示
    //  data.state     0.助力失败   1.助力成功  2.已经助力过了  3.活动已过期
    handleInviteInfo(data) {
        //  state 2  提示已经助力过了
        if (data.state !== 0) {
            this.data.firstEnter = false;
            mySa.trackEvent(7, {
                page_id: 1016
            });
            this.setData({
                showShareInDialog: data.state !== 4,
                inviteInfo: {
                    helpUserName: data.nickname,
                    inviteList: data.invite_list,
                    inviteUserName: data.invite_list[0] && data.invite_list[0].nickname ? data.invite_list[0].nickname : ''
                }
            })
        }
    },

    handleDetailInfo(data, assistParams) {

        let templateH5 = data.session_content,
            fullArr = new Array(data.activity_user_num).fill({});

        wxParseObj.wxParse('templateDetailH5', 'html', templateH5, this);

        this.setData({
            activityDetail: {
                id: data.id,
                sessionImage: data.site_banner_img,
                realPrice: parseInt(data.price),
                joinPerson: data.base_enroll_num,
                end_time: data.end_time,
                wxShareImg: data.wx_applet_img,
                session_title: data.session_name,
                session_subtitle: data.session_title,
                full_person: data.activity_user_num,
                invite_list: data.invite_list,
                status: data.assist_status             //  0 未参与   1 进行中  2  已完成  3 已购买  4 已结束
            },
            allInviteList: fullArr.map((item, idx) => {
                if (data.invite_list[idx]) {
                    return {...data.invite_list[idx]}
                }
            }),
            showEndDialog: data.assist_status === 4
        }, () => {
            this.countDown();
        });

        //  课程没有结束 --- 并且 --- 是从分享卡片进入的 --- 并且 --- 是第一次进来的
        if (data.assist_status !== 4 && assistParams.user_share_id && this.data.firstEnter) {
            getDetailWebInfo(assistParams, this.handleInviteInfo, 'userPowerActivities', 'POST');
        }

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
        globalInterval = null;
    },

    onUnload() {
        clearInterval(globalInterval);
        globalInterval = null;
    },

    onShareAppMessage() {

        let shareId = this.data.globalShareId,
            {activity_id, session_id} = this.data.globalQuery,
            {session_title, wxShareImg} = this.data.activityDetail,
            shareUrl = `/activity/activityDetail/activityDetail?session_id=${session_id}&activity_id=${activity_id}&shareId=${shareId}`;

        this.setData({
            showInviteDialog: false
        });

        mySa.trackEvent(9, {
            page_id: 1020,
            share_way: 'weixin_fri'
        });

        return {
            title: `我正在参加【${session_title}】活动，帮我助力再送你一个权益`,
            path: shareUrl,
            imageUrl: wxShareImg
        }

    },

    openInviteDialog() {

        if(this.data.activityDetail.status === 4){
            return;
        }

        let {activity_id, session_id} = this.data.globalQuery;

        mySa.trackEvent(7, {
            page_id: 1020
        });

        getDetailWebInfo({session_id, activity_course_id: activity_id}, data => {
            this.setData({
                showInviteDialog: true,
                globalShareId: data.user_share_id
            });

        }, 'userShare', 'POST');

    },

    openShareInDialog() {
        this.setData({
            showShareInDialog: true
        })
    },

    //  直接购买或者助力完成免费获得课程
    toBuySession(){

        let {activity_id, session_id} = this.data.globalQuery;
        mySa.trackEvent(6, {
            activity_type: 1,
            activity_id,
            deal_id: session_id
        });
        navigateToPath(`/package/buy/buy?sessionId=${session_id}&activityId=${activity_id}`);
    },

    toWatchSession(){
        let {session_id, activity_id} = this.data.globalQuery,
            url = `/activity/activitySessionVideo/activitySessionVideo?session_id=${session_id}&activity_id=${activity_id}`;
        navigateToPath(url);
    },

    closeDialog(e) {
        let closeStatus = e.target.dataset.close === '1',
            track = e.target.dataset.close;

        if (closeStatus) {
            this.setData({
                showInviteDialog: false,
                showShareInDialog: false,
                showEndDialog: false
            })
        }
        if(track){
            mySa.trackEvent(4, {
                click_id: parseInt(track)
            })
        }

    },

    backHome() {
        wx.switchTab({url: '/pages/index/index'})
    }

});