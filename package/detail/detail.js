let app = getApp();
let mySa = require('../../common/sa');
let wxParseObj = require('../../lib/wxParse/wxParse.js');

let pageInfo = {
    isFirstLoad: true
};

let firstListenId = "";

let trackParams = {};
let shareParams = {};

import {formatTime, wxSetNavTitle, renderRebateInfo} from '../../common/common';
import {getDetailWebInfo, getSessionDetailInfo, getYogaSchoolInfo, getShareInfo, transformQrCodeScene} from '../../common/$http';

Page({

    data: {
        id: "",
        activeTab: '0',                         //  导航tab
        detailH5: "",                           //  详情h5
        commentH5: "",                          //  评价h5
        sessionInfo: {},                        //  课程信息
        detailInfo: {},                         //  课表信息
        sessionList: [],                        //  课表列表
        buttonStatus: 0,                        //  按钮状态   为1的时候点击进入报道页面
        buttonDesc: "",                         //  按钮文字
        hasAuditionSession: false,
        hiddenShare: true,                      //  隐藏分享底部弹窗
        showBackBtn: false                      //  是否显示回首页按钮(点击分享的链接显示)
    },

    onLoad(options) {

        let vm = this;

        function initInfo(options){
            let params = {
                session_id: options.session_id,
                session_type: 1
            };

            //  一些全局使用但不setData的数据
            pageInfo = {
                sessionId: options.session_id,
                programId: options.source || '',
                shareManId:  options.invite_euid              //  分享人的uid
            };

            vm.setData({
                showBackBtn: options.isShare || false
            });

            getYogaSchoolInfo(params, vm.handleSessionInfo, 'session/info', true);

        }

        trackParams = {};
        shareParams = {};

        if (options.scene) {
            transformQrCodeScene({user_rebate_qr: options.scene}, initInfo);
        }else{
            initInfo(options);
        }

    },

    onShow() {
        let hasLogin = wx.getStorageSync('sid'),
            params = {
                session_id: pageInfo.sessionId
            };

        if (hasLogin && !app.globalData.hasDetailLoginRefresh && pageInfo.notFirstLoad) {

            getYogaSchoolInfo(params, this.handleSessionInfo, 'session/info');

            app.globalData.hasDetailLoginRefresh = true;

        }

    },

    // 构造富文本内容(详情和评价tab)
    handleWebInfo(data) {

        let templateH5 = data.description_h5,
            detailParams = {
                programId: data.source_id,
                o2_session_id: pageInfo.sessionId
            },
            templateCommentH5 = data.comment_page_h5;

        wxParseObj.wxParse('templateDetailH5', 'html', templateH5, this);
        wxParseObj.wxParse('templateCommentH5', 'html', templateCommentH5, this);

        trackParams = {
            business_type: "O2_camp",
            deal_id: parseInt(pageInfo.sessionId),
            source_id: parseInt(pageInfo.sessionId),
            category_id: data.source_id + '',
            tag_deal_name: 'O2_camp' + pageInfo.sessionId
        };

        mySa.trackEvent(5, trackParams);

        this.setData({
            sessionInfo: {
                banner: data.image,
                sessionName: data.session_name,
                sessionStartTime: formatTime(data.session_start_time * 1000, 'yyyy-mm-dd'),
                reportPersonNum: data.enroll_num_info ? data.enroll_num_info.addon_enroll_num : 0
            }
        });

        getSessionDetailInfo(detailParams, this.handleDetailInfo, 'O2session/detail', true);

    },

    //  构造课表tab内容
    handleDetailInfo(data) {

        let btnSessionWord = "",
            renderList = [];

        pageInfo.programId = data.programId;

        data.day_list.forEach((item, index) => {

            let itemList = [];

            item.forEach(info => {

                let hasAuditionItem = info.link_info_list.find(item => {
                    return item.is_audition === 0;
                });

                info.canMiniAppPlay = (info.link_info_list.length > 0 && !!hasAuditionItem);

                if (info.canMiniAppPlay) {
                    firstListenId = info.sessionId;
                    btnSessionWord = "第" + (index + 1) + "天 " + info.title + " 点击免费试听 >";
                    this.setData({
                        hasAuditionSession: true
                    })
                }

                itemList.push({
                    title: info.title,
                    canMiniAppPlay: info.canMiniAppPlay,
                    action_times: info.action_times,
                    sessionId: info.sessionId
                })

            });

            renderList.push(itemList);

        });

        this.setData({
            btnSessionWord,
            detailInfo: {
                sessionList: renderList
            },
        });

    },

    handleSessionInfo(data) {

        if (!data.id) {
            wx.switchTab({
                url: '../../pages/index/index'
            });
            return;
        }

        let webParams = {
            yoga_o2_session_id: data.id
        };

        pageInfo.sessionId = data.id;

        shareParams.sessionName = data.session_name;
        shareParams.sessionId = data.id;
        shareParams.shareImage = data.share_image;

        //      处理按钮逻辑和本地缓存课程信息
        this.setData({
            buttonDesc: data.user_enroll_status === 1 ? "已购买，立即报到" : data.button_desc,
            buttonStatus: data.user_enroll_status
        });

        pageInfo.notFirstLoad = true;

        //  TODO    根据用户是否购买判断展示 pay_before 还是 pay_after
        if (data.rebate_info.pay_before || data.rebate_info.pay_after) {

            let rebateInfo = renderRebateInfo(data);

            this.setData({
                rebateInfo,
                hasRebate: !!rebateInfo
            })
        }

        //  TODO    根据用户是否登录获取  invite_euid
        if(wx.getStorageSync('sid') && this.data.hasRebate){
            getShareInfo({session_id: data.id}, this.handleShareInfo);
        }

        getDetailWebInfo(webParams, this.handleWebInfo, 'getWebInfo');

        wxSetNavTitle(data.session_name);

    },

    //  处理分享接口的数据
    handleShareInfo (data){
        pageInfo.invite_euid = data.invite_euid;
        wx.setStorageSync('shareImgInfo', data);
    },

    //  -------  切换tab   --------
    switchTab(type) {

        let infoMap = {
            0: 1004,
            1: 1005,
            2: 1006
        };

        mySa.trackEvent(11, {
            page_id: infoMap[type],
            pageinfo: pageInfo.sessionId + ""
        });
        this.setData({
            activeTab: type
        });
    },

    toListenTab() {
        this.switchTab('1');
    },

    changeTab(e) {
        let type = e.target.dataset.type;
        this.switchTab(type);
    },

    //  ---------  跳转页面  ----------
    toHomePage() {
        wx.switchTab({
            url: '../../pages/index/index'
        })
    },

    playVideo(e) {
        wx.navigateTo({
            url: '../../session/sessionVideo/sessionVideo?isFree=1&sessionId=' + e.target.dataset.info.sessionId + "&programId=" + pageInfo.programId + '&session_id=' + pageInfo.sessionId
        })
    },

    goOrderPage(e) {
        let hasLogin = app.checkUserLogin();
        if (hasLogin) {

            let status = e.target.dataset.status;
            if (status === 1) {
                wx.navigateTo({
                    url: "../report/report?session_id=" + pageInfo.sessionId
                })
            } else {
                let newParams = {...trackParams},
                    redirectUrl = '../buy/buy?sessionId=' + pageInfo.sessionId;

                newParams.click_type = 1;
                mySa.trackEvent(6, newParams);

                wx.navigateTo({
                    url: redirectUrl + (pageInfo.shareManId ? '&rebate_id=' + pageInfo.shareManId : '')
                });

            }

        } else {
            wx.navigateTo({
                url: '../../pages/login/login'
            })
        }
    },

    toListenFirstSession() {
        wx.navigateTo({
            url: '../../session/sessionVideo/sessionVideo?isFree=1&sessionId=' + firstListenId + "&programId=" + pageInfo.programId + '&session_id=' + pageInfo.sessionId
        });
    },

    toRulePage() {
        wx.navigateTo({url: '../rule/rule'})
    },

    //  分享逻辑
    onShareAppMessage() {

        let inviteParams = pageInfo.invite_euid ? '&invite_euid=' + pageInfo.invite_euid : '';

        mySa.trackEvent(9, {
            page_id: 1003,
            pageinfo: shareParams.sessionId + ""
        });
        mySa.trackEvent(10, {
            page_id: 1003,
            result: 1,
            share_way: 'weixin_fri'
        });

        return {
            title: '推荐给你一个课程，' + shareParams.sessionName,
            path: 'package/detail/detail?isShare=1&session_id=' + shareParams.sessionId + inviteParams,
            imageUrl: shareParams.shareImage
        }
    },

    showRebateShareArea() {
        let localSid = wx.getStorageSync('sid');

        if (localSid) {
            this.setData({
                hiddenShare: false
            })
        } else {
            wx.navigateTo({
                url: '../../pages/login/login'
            })
        }
    },

    shareImgToSpace(){
        wx.navigateTo({
            url: '../shareFriendSpace/shareFriendSpace'
        })
    },

    hideShare(e) {
        let isHide = e.target.dataset.hide === '1';

        this.setData({
            hiddenShare: isHide
        })
    },

    trackService() {
        let newParams = {...trackParams};
        newParams.click_type = 2;
        mySa.trackEvent(6, newParams);
    }

});