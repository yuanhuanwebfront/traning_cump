import {saveImgToLocalPath, formatTime, wxSetNavTitle, renderRebateInfo} from '../../common/common';
import {getShareInfo, getYogaSchoolInfo} from '../../common/$http';

let mySa = require('../../common/sa');

let globalSessionId = "";

let app = getApp();

let pageInfo = {};

Page({

    data: {
        qrCodeImg: "",
        hasReport: false,
        finishLoad: false,
        passDayInfo: "0"
    },

    onLoad(options) {

        globalSessionId = options.session_id;
        pageInfo = {};
        getYogaSchoolInfo(options, this.handleReportInfo, 'session/info');
        getShareInfo(options, this.handleShareInfo);
    },

    onUnload() {
        wx.removeStorageSync('shareImgInfo');
    },

    handleShareInfo(data) {
        pageInfo.invite_euid = data.invite_euid;
        wx.setStorageSync('shareImgInfo', data);
    },

    //  分享
    onShareAppMessage() {

        let storageInfo = wx.getStorageSync('shareImgInfo'),
            inviteParams = pageInfo.invite_euid && this.data.hasRebate ? '&invite_euid=' + pageInfo.invite_euid : '';

        mySa.trackEvent(9, {
            page_id: 1009,
            pageinfo: globalSessionId
        });
        mySa.trackEvent(10, {
            page_id: 1009,
            result: 1,
            share_way: 'weixin_fri'
        });

        return {
            title: app.globalData.userInfo.nickName + '邀你参加' + storageInfo.session_name,
            path: 'package/detail/detail?isShare=1&session_id=' + globalSessionId + inviteParams,
            imageUrl: storageInfo.share_image
        }

    },

    shareImgToSpace() {
        wx.navigateTo({
            url: '../shareFriendSpace/shareFriendSpace'
        })
    },

    handleReportInfo(data) {

        let countNum = data.count_down < 10 ? '0' + data.count_down : data.count_down + '';

        //  TODO    根据用户是否购买判断展示 pay_before 还是 pay_after
        if (data.rebate_info.pay_before || data.rebate_info.pay_after) {

            let rebateInfo = renderRebateInfo(data, true);

            this.setData({
                hasRebate: !!rebateInfo,
                rebateInfo: rebateInfo
            })

        }

        this.setData({
            hasReport: data.user_report,
            qrCodeImg: data.user_report_qr,
            passDayInfo: countNum.split(''),
            sessionStartTime: formatTime(data.session_start_time * 1000, 'yyyy-mm-dd'),
            sessionNotice: data.session_notice,
            finishLoad: true
        });

        mySa.trackEvent(11, {
            page_id: data.user_report ? 1009 : 1008,
            pageInfo: globalSessionId + ''
        });

        wxSetNavTitle(data.session_name);

    },

    saveQrImg() {
        saveImgToLocalPath(this.data.qrCodeImg);
    },

    //  跳转页面
    toRulePage() {
        wx.navigateTo({url: '../rule/rule'})
    }

});