import {transformRpx, wxSetNavTitle, renderRebateInfo} from '../../common/common';
import {getPartnerInfo, getSessionDetailInfo} from '../../common/$http';

let app = getApp();
let mySa = require('../../common/sa');
let pageInfo = {
    tidbitUrl: '',
    videoContext: null,
    isFirstLoaded: true
};

Page({

    data: {
        allInfoLoaded: false,
        isFistLoadSession: true,
        hasFinishAllSession: false,
        sessionStartTime: "",
        sessionEndTime: "",
        sessionName: "",
        today: "",
        sessionPracticeDays: [],
        programDays: 0,
        programAllCount: 0,
        programProgress: 0,
        sessionList: [],
        showPracticeBtn: true,
        showMarkBtn: true,
        showRankBtn: true,
    },

    onLoad(options) {

        let detailParams = {
                o2_session_id: options.session_id,
                programId: options.programId
            },
            params = {
                o2_session_id: options.session_id,
                // team_id: options.team_id,
                programId: options.programId
            };

        pageInfo.sessionId = options.session_id;
        pageInfo.programId = options.programId;
        pageInfo.teamId = options.team_id;

        mySa.trackEvent(11, {
            page_id: 1007,
            pageinfo: pageInfo.sessionId
        });

        this.renderAllInfo(params, detailParams);

    },

    onShow() {

        if (!this.data.isFistLoadSession) {

            let detailParams = {
                    o2_session_id: pageInfo.sessionId,
                    programId: pageInfo.programId
                },
                params = {
                    o2_session_id: pageInfo.sessionId,
                    programId: pageInfo.programId
                    // team_id: pageInfo.teamId
                };

            this.renderAllInfo(params, detailParams);
        }

    },

    onUnload(){
      wx.removeStorageSync('rebate-info');
    },

    renderAllInfo(partnerParams, detailParams) {
        let vm = this;
        //  o2sessionTaskIndex  taskIndex
        getPartnerInfo(partnerParams, function (data) {
            vm.handlePartnerInfo(data);

            getSessionDetailInfo(detailParams, function (res) {
                vm.handleSessionInfo(res, data.partner_info.o2_session_info.pass_days, detailParams.o2_session_id);
            }, 'O2session/detail');

        }, 'o2sessionTaskIndex', true);

    },

    handlePartnerInfo(data) {

        let info = data.partner_info,
            sessionInfo = info.o2_session_info,
            // rebateInfo = info.partner_info.o2_session_info,
            selectList = [];

        wxSetNavTitle(info.o2_session_info.session_name);

        info.user_session_info.finished_day_list.forEach(item => {
            selectList.push(item.timestamp);
        });

        //    画日历
        this.setData({
            sessionPassDays: info.o2_session_info.pass_days,
            sessionStartTime: info.o2_session_info.session_start_time,
            sessionEndTime: info.o2_session_info.session_end_time,
            sessionToday: info.user_session_info.today_timestamp,
            sessionPracticeDays: selectList,
            programDays: info.o2_session_info.user_keep_days || 0,
            programAllCount: info.partner_team.program_session_count || 0,
            programProgress: (info.o2_session_info.user_keep_days / info.partner_team.program_session_count) * 100,
            hasFinishAllSession: info.o2_session_info.user_keep_days === info.partner_team.program_session_count
        });

        //    根据用户是否购买判断展示 pay_before 还是 pay_after
        pageInfo.categoryId = sessionInfo.category_id;
        pageInfo.periods = sessionInfo.periods;

        if (sessionInfo && sessionInfo.rebate_info && sessionInfo.rebate_info.pay_after) {

            let rebateInfo = renderRebateInfo(sessionInfo);

            if(rebateInfo){
                wx.setStorageSync('rebate-info', rebateInfo);
            }

        }

        //  TODO     判断用户练习和打卡状态  判断显示哪个按钮( 去练习， 去打卡， 查看排行 )
        this.setData({
            showPracticeBtn: !data.today_is_practice && !data.today_is_clock_in,          //    练习按钮（没有练习和打卡）
            showMarkBtn: data.today_is_practice && !data.today_is_clock_in,               //    打卡按钮（只练习没打卡）
            showRankBtn:  data.today_is_practice && data.today_is_clock_in,               //    排行按钮（练习并打卡）
        });

    },

    handleSessionInfo(data, passDays, o2SessionId) {

        let schedule = data.program_schedule,
            sessionList = [];

        data.day_list.forEach((item, sessionIndex) => {

            let itemList = [];

            item.forEach((info, idx) => {

                let obj = {
                    isLastDay: (sessionIndex === (data.day_list.length - 1)) && (idx === (item.length - 1)),
                    title: info.title,
                    session_index: sessionIndex + 1,
                    sub_session_index: idx + 1,
                    sessionId: info.sessionId,
                    sessionTime: info.intensityName,
                    isFinish: info.is_done,
                    linkList: info.link_info_list.filter(video => {
                        return video.link_type === 12;
                    }),
                    o2_session_id: o2SessionId,
                    hasMark: info.is_done === 1
                };

                if (schedule && schedule.status !== 3) {

                    if (schedule.status === 4 || schedule.status === 2) {
                        obj.isLock = false;
                    } else if (schedule.status === 1) {
                        obj.isLock = sessionIndex >= passDays
                    }

                } else {
                    obj.isLock = true;
                }

                itemList.push(obj);

            });

            sessionList.push(itemList);

        });

        let nowDay = passDays > sessionList.length ? sessionList.length : passDays;

        this.setData({
            allInfoLoaded: true,
            hideRankBtn: nowDay < 1,
            sessionName: nowDay >= 1 ? '第' + nowDay + "天 " + sessionList[nowDay - 1][0].title : '还剩1天开课',
            sessionList: sessionList,
            isFistLoadSession: false,
            planName: data.title
        });

        if(passDays > sessionList.length){
            this.setData({
                sessionName: '第' +  passDays + '天 巩固练习'
            })
        }


    },

    playTidbit(e) {
        let vm = this,
            url = e.target.dataset.src;

        vm.playVideo(url);
    },

    changeFullScreen(e) {
        if (pageInfo.videoContext) {
            // pageInfo.videoContext.pause();
        }
    },

    playVideo(videoUrl) {

        pageInfo.tidbitUrl = videoUrl;
        this.setData({
            videoUrl: pageInfo.tidbitUrl
        });

        if (!pageInfo.videoContext) {
            pageInfo.videoContext = wx.createVideoContext('myVideo', this);
            pageInfo.videoContext.requestFullScreen();
            pageInfo.videoContext.play();
        }else{
        	pageInfo.videoContext.requestFullScreen();
            pageInfo.videoContext.play();
        }
    },

    closeVideo(){
        pageInfo.videoContext.exitFullScreen();
    },

    toSessionVideo(e) {

        let {lock, sessionid} = e.currentTarget.dataset;

        let info = e.currentTarget.dataset.info;

        info.programId = pageInfo.programId;
        info.planName = this.data.planName;
        info.categoryId = pageInfo.categoryId;
        info.periods = pageInfo.periods;

        if (!lock) {
            wx.setStorageSync("actionInfo", info);
            wx.navigateTo({
                url: '../sessionVideo/sessionVideo?sessionId=' + sessionid + "&o2_session_id=" + info.o2_session_id + "&session_id=" + pageInfo.sessionId + "&programId=" + pageInfo.programId + "&has_mark=" + (info.hasMark ? 1 : 0)
            })
        }

    },

    toRankPage() {
        wx.navigateTo({
            url: '../sessionRank/sessionRank?session_id=' + pageInfo.sessionId
        })
    },

    toMarkPage(){
        wx.navigateTo({
          url: '../sessionMark/sessionMark?yoga_o2_session_id=' +  pageInfo.sessionId
        })
    },

    jumpToSession() {

        if (this.data.hasFinishAllSession) return;

        let calendarHeight = (this.data.sessionEndTime - this.data.sessionEndTime) / (60 * 60 * 24) / 7 * (transformRpx(48)) + transformRpx(24) + transformRpx(204),
            sessionHeight = this.data.sessionPassDays * transformRpx(212);

        wx.pageScrollTo({
            scrollTop: calendarHeight + sessionHeight,
            duration: 500
        })
    }

});