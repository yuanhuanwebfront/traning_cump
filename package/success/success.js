import {getDetailWebInfo, getShareInfo} from '../../common/$http';
import {formatTime, renderRebateInfo, wxSetNavTitle} from '../../common/common';

let app = getApp();
let pageInfo = {};

let globalSessionId = '';

let mySa = require('../../common/sa');

Page({


    data: {
        pageAllLoad: true
    },

    onLoad(options) {

        globalSessionId = "";

        let params = {...options},
            shareParams = {
                session_id: options.session_id
            };

        wxSetNavTitle('支付成功');

        globalSessionId = options.session_id;

        getDetailWebInfo(params, this.handleInfo, 'getUserSessionPurchaseInfo');

        getShareInfo(shareParams, this.handleShareInfo);

    },

    onUnload() {
        wx.removeStorageSync('shareImgInfo');
    },

    handleInfo(data) {
        if(data.rebate_info && data.rebate_info.pay_after){
            let rebateInfo = renderRebateInfo(data, true);

            this.setData({
                hasRebate: !!rebateInfo,
                rebateInfo: rebateInfo
            })
        }
        this.setData({
            sessionName: data.session_name,
            sessionStartTime: formatTime(data.session_start_time * 1000, 'yyyy-mm-dd'),
            coachName: data.o2_director_info.coach_name,
            coachWxName: data.o2_director_info.coach_webchat_no,
            pageAllLoad: true
        })
    },

    handleShareInfo(data) {
        pageInfo.invite_euid = data.invite_euid;
        wx.setStorageSync('shareImgInfo', data);
    },

    onShareAppMessage() {

        let storageInfo = wx.getStorageSync('shareImgInfo'),
            inviteParams = pageInfo.invite_euid && this.data.rebateInfo ? '&invite_euid=' + pageInfo.invite_euid : '';


        mySa.trackEvent(9, {
            page_id: 1014,
            pageinfo: globalSessionId
        });
        mySa.trackEvent(10, {
            page_id: 1014,
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

    toReport() {
        wx.redirectTo({
            url: '../../package/report/report?session_id=' + globalSessionId
        })
    },

    toRulePage(){
        wx.navigateTo({url: '../rule/rule'})
    }


});