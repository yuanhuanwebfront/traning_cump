import {getSessionDetailInfo, getShareInfo} from "../../common/$http";
import {sendRequest, sortObjectKey, getSign, wxSetNavTitle} from "../../common/common";

let wxParseObj = require('../../lib/wxParse/wxParse.js');
let mySa = require('../../common/sa');

let app = getApp();

let globalSessionId = "";
let globalShareId = "";
let globalO2SessionId = "";

/*
*       user_action_log 逻辑   POST
*
*       1.  播放时长上报 （播放完成才上报）
*
*       进入播放页面记录一个时间戳，播放完成记录一个时间戳 (这个过程上报)
*       获取视频本身的时长， 上面的大于视频时长，上报时长 ---> （视频时长）
*
*       public static final String STATISTIC_PLAYTIME = "statistic/playtime";
*
*       上报失败， 上报失败时间戳 加到参数里面     at_that_time （秒）
*                 播放时长                      play_time  （秒）
*                 计划id                        program_id
*                   课程id                        session_id
*                 第几天的课程                   session_index
*                 课程里面的第几节               sub_session_index
*                 进入播放界面的时间戳           practice_current_time （秒）
*                 是否播放完毕                   is_done  默认为1
*
*
*       2.    视频播放完成跳到打卡页面上报   user/userActionLog
*
*               是不是计划的最后一天
*
*                   不是 --------------------------------------------------|
*                        上报失败时间戳 加到参数里面     at_that_time (秒)   |
*                        计划id                         objid               |
*                        不是最后一天                   type（40）          |
*                        是否完成动作                   is_complete = 1     |
*                        进入播放界面的时间戳            practice_current_time （秒）
*                        todo  partner_info.partner_team.yoga_o2_session_id
*                        训练营课程id                  o2_session_id
*                        课程id                        session_id
*                        第几天的课程                   session_index
*                        课程里面的第几节               sub_session_index
*                       -----------------------------------------------------
*
*                  是   -------------------------------------------------- |
*                        上报失败时间戳 加到参数里面     at_that_time (秒)   |
*                        计划id                        objid               |
*                        是最后一天                     type（65）          |
*                        是否完成动作                   is_complete = 1     |
*                        进入播放界面的时间戳           practice_current_time （秒）
*                        todo  partner_info.partner_team.yoga_o2_session_id
*                        训练营课程id                  o2_session_id
*                       --------------------------------------------------------
*
*
*       3.
*       4.
*       5.
*
*
* */


Page({

    data: {
        isFree: true,
        finishSession: false,
        sessionTitle: '',
        sessionDuration: 0,
        sessionVideo: '',
        hiddenShare: true,
        useActionStartTime: "",                 //      用户进入该页面的时间戳
        hasGetVideoLength: false,
        videoLength: 0,
        isFirstReport: true,
        showMarkDialog: false,
        showRankBtn: false,
        showMarkBtn: false,
        dialogTime: '',
        dialogKcal: ''
    },

    onLoad(options) {

        globalSessionId = "";

        let {isFree, sessionId, programId, o2_session_id} = options,
            rebateInfo = wx.getStorageSync('rebate-info'),
            params = {
                sessionId,
                programId,
                o2_session_id
            };

        wxSetNavTitle('课时详情');

        this.setData({
            isFree: isFree === '1',
            hasMark: options.has_mark == 1,
            globalRankId: options.session_id
        });

        if (rebateInfo) {
            this.setData({
                rebateInfo,
                hasRebate: !!rebateInfo
            })
        }

        wx.showLoading({mask: true});

        globalSessionId = options.sessionId;
        globalShareId = options.session_id;
        globalO2SessionId = o2_session_id;

        mySa.trackEvent(11, {
            page_id: 1010,
            pageinfo: globalSessionId
        });

        getSessionDetailInfo(params, this.handleDetail, 'getSessionInfo');

        if (isFree !== '1') {
            getShareInfo({session_id: globalShareId}, this.handleShareInfo);
        }
    },

    onShow() {

        this.setData({
            useActionStartTime: new Date().getTime() / 1000
        })

    },

    onUnload() {
        this.trackEventByType(3);
        wx.removeStorageSync('actionInfo');
        wx.removeStorageSync('shareImgInfo');
    },

    onHide(){
        this.setData({
            showMarkDialog: false
        });
    },

    handleShareInfo(data) {
        wx.setStorageSync('shareImgInfo', data);
    },

    trackPlay() {

        if (this.data.isFirstReport) {

            if (!this.data.isFree) {
                this.trackEventByType(1);
            }

            this.setData({
                isFirstReport: false
            });

        }
    },

    trackEventByType(eventType) {
        let actionInfo = wx.getStorageSync('actionInfo');

        mySa.trackEvent(eventType, {
            action_type: 'O2_camp',
            action_mediatype: 'media',
            action_name: actionInfo.planName,
            action_project_id: actionInfo.programId,
            action_lesson_id: actionInfo.sessionId + '',
            action_days: actionInfo.session_index,
            play_times: new Date().getTime() / 1000 - this.data.useActionStartTime,
            is_first_train: !!actionInfo.isFinish
        });
    },

    checkVideoPlay(e) {
        if (!this.data.hasGetVideoLength && e.detail.duration) {
            this.setData({
                hasGetVideoLength: true,
                videoLength: e.detail.duration
            });
        }
    },

    handleDetail(data) {
        this.setData({
            calorieRatio: data.calorie_ratio,
            hasSessionMark: data.class_is_clock_in,
            sessionTitle: data.title,
            sessionVideo: this.data.isFree ? data.link_info.link_content : data.stream_media_cn,
            hasStudyNotes: data.study_notes,
            showMarkBtn: !this.data.isFree && data.today_practiced && !data.class_is_clock_in,  //  显示去打卡按钮 （今天练习过且没有打过卡）
            showRankBtn: !this.data.isFree && data.today_practiced && data.class_is_clock_in    //  显示去排行按钮 （今天练习过并打过卡)
        }, () => {
            wx.hideLoading();
        });
        wxParseObj.wxParse('templateStudyH5', 'html', data.study_notes, this);
    },

    watchVideoEnd(e) {

        if (this.data.isFree) return;

        this.setData({
            showMarkBtn: !this.data.hasSessionMark,
            showRankBtn: this.data.hasSessionMark,
            showMarkDialog: true
        });

        this.closeVideo();

        let actionInfo = wx.getStorageSync('actionInfo'),
            endTime = new Date().getTime() / 1000,
            playTime = parseInt(Math.min(...[endTime - this.data.useActionStartTime, this.data.videoLength]));
        console.log(this.data.videoLength);
        this.setData({
          dialogTime: Math.ceil(playTime / 60),
          dialogKcal: Math.ceil((playTime / this.data.videoLength * this.data.calorieRatio) )
        });
         
        //      所有的上报都应该建立在页面进入时
        let params = {
                play_time: playTime,
                program_id: actionInfo.programId,
                session_id: actionInfo.sessionId,
                session_index: actionInfo.session_index,
                sub_session_index: actionInfo.sub_session_index,
                practice_current_time: parseInt(this.data.useActionStartTime),
                sid: wx.getStorageSync('sid'),
                is_done: 1
            },
            actionParams = {
                is_complete: 1,
                o2_session_id: actionInfo.o2_session_id,
                objId: actionInfo.programId,
                practice_current_time: parseInt(this.data.useActionStartTime),
                sid: wx.getStorageSync('sid'),
                type: actionInfo.isLastDay ? '65' : '40'
            };

        if (app.globalData.userInfo.uid) {
            params.uid = app.globalData.userInfo.uid;
            actionParams.uid = app.globalData.userInfo.uid;
        }

        if (!actionInfo.isLastDay) {
            actionParams.session_id = actionInfo.sessionId;
            actionParams.session_index = actionInfo.session_index;
            actionParams.sub_session_index = actionInfo.sub_session_index;
            this.userActionsLog(actionParams);
        } else {
            let newParams = {...actionParams};
            newParams.type = 40;
            newParams.session_id = actionInfo.sessionId;
            newParams.session_index = actionInfo.session_index;
            newParams.sub_session_index = actionInfo.sub_session_index;
            this.userActionsLog(newParams);
            this.userActionsLog(actionParams);
        }

        this.trackEventByType(2);

        this.sendPracticeTime(params);
    },

    closeVideo() {
        let videoContext = wx.createVideoContext('videoInfo', this);

        videoContext.exitFullScreen();
    },

    hideDialog(e){
        let isHide = e.target.dataset.hide === '1';
        this.setData({
            showMarkDialog: !isHide
        })
    },

    showShareArea() {
        this.setData({
            hiddenShare: false
        })
    },

    hideShare() {
        this.setData({
            hiddenShare: true
        })
    },

    sendPracticeTime(params) {
        sendRequest('GET', 'statistic/playtime', params).then(res => {
            if (res.data.error_code !== 0) {
                this.storePracticeInfo(params);
            }
        }).catch(err => {
            this.storePracticeInfo(params);
        })
    },

    userActionsLog(params) {

        let newParams = sortObjectKey(params),
            str = "";

        let paramsArr = Object.keys(newParams);

        paramsArr.forEach(key => {
            str = str + key + ":" + newParams[key]
        });

        str += "h5:" + wx.getStorageSync('sid');

        params.sign = getSign(str);

        sendRequest('POST', 'user/userActionLog', params).then(res => {
            if (res.data.error_code !== 0) {
                this.storeUserActionInfo(params);
            }
        }).catch(err => {
            this.storeUserActionInfo(params);
        })
    },

    storePracticeInfo(params) {
        let practiceReportArr = wx.getStorageSync('practiceReportArr') || [];
        params.at_that_time = new Date().getTime() / 1000;
        practiceReportArr.push(params);
        wx.setStorageSync('practiceReportArr', practiceReportArr);
    },

    storeUserActionInfo(params) {
        let userActionArr = wx.getStorageSync('userActionArr') || [];
        params.at_that_time = new Date().getTime() / 1000;
        userActionArr.push(params);
        wx.setStorageSync('userActionArr', userActionArr);
    },

    shareImgToSpace() {
        wx.navigateTo({
            url: '../../package/shareFriendSpace/shareFriendSpace'
        });
        this.hideShare();
    },

    onShareAppMessage() {

        let storageInfo = wx.getStorageSync('shareImgInfo'),
            inviteParams = storageInfo.invite_euid && this.data.hasRebate ? '&invite_euid=' + storageInfo.invite_euid : '';

        mySa.trackEvent(9, {
            page_id: 1010,
            pageinfo: globalShareId
        });
        mySa.trackEvent(10, {
            page_id: 1010,
            result: 1,
            share_way: 'weixin_fri'
        });

        this.hideShare();

        return {
            title: app.globalData.userInfo.nickName + '邀你参加' + storageInfo.session_name,
            path: 'package/detail/detail?isShare=1&session_id=' + globalShareId + inviteParams,
            imageUrl: storageInfo.share_image
        }

    },

    toRank() {
        wx.navigateTo({
            url: '../sessionRank/sessionRank?session_id=' + this.data.globalRankId
        })
    },

    toRulePage() {
        wx.navigateTo({url: '../../package/rule/rule'})
    },

    toMarkPage(){
        wx.navigateTo({
            url: '../sessionMark/sessionMark?session_id=' + globalSessionId + '&yoga_o2_session_id=' + globalO2SessionId
        });
    },

    bgShareHide(e) {
        let isHide = e.target.dataset.hide;
        if (isHide) {
            this.hideShare();
        }
    }

});