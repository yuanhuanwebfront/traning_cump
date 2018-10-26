import {getSessionDetail, getSessionList} from '../../common/$http';

let mySa = require('../../common/sa.js');

let pageParams = {
    page: 1,
    size: 20,
    tag_id: 0,
    session_type: 1
};

let app = getApp();

let tempList = [];

function renderSessionItem(item) {
    return {
        id: item.id,
        source: item.category_id,
        session_name: item.session_name,
        image_phone: item.image_phone,
        notice_list: item.notice_list,
        enrollNum: item.enroll_num_info.addon_enroll_num
    }
}

Page({

    data: {
        activeTag: 0,
        listEnd: false,
        tagList: [],
        swiperList: [],
        sessionList: [],
        isFirstEnter: true,
        showGuideDialog: false
    },

    onLoad: function () {
        mySa.trackEvent(11, {page_id: 1000});
        this.setData({
            showGuideDialog: !wx.getStorageSync('hideGuideDialog')
        });
        this.initHomePage();
    },

    onShow() {
        let hasLogin = wx.getStorageSync('sid');
        if (hasLogin && !app.globalData.hasListLoginRefresh && !this.data.isFirstEnter) {
            this.getSessionList(true);
            app.globalData.hasListLoginRefresh = true;
        }
    },

    onPullDownRefresh() {
        this.getSessionList(true, true);
    },

    onReachBottom() {
        if (!this.data.listEnd) {
            pageParams.page++;
            this.getSessionList();
        }
    },

    onTabItemTap() {
        mySa.trackEvent(4, {
            page_name: "1000",
            click_id: 1000
        })
    },

    onShareAppMessage() {
        return {
            title: '给你推荐一个超赞的学瑜伽小程序',
            path: '/pages/index/index',
            imageUrl: ''
        }
    },

    initHomePage() {

        let sid = wx.getStorageSync('sid'),
            params = {
                tag_id: 0,
                session_type: 1,
            };

        if (sid) params.sid = sid;

        getSessionDetail(params, this.handleHomePage, 'session/yogaO2SchoolList')

    },

    handleHomePage(data) {

        data.yogao2school_list = data.yogao2school_list.map(renderSessionItem);

        tempList = [...data.yogao2school_list];

        this.setData({
            swiperList: data.banner_list,
            tagList: data.tag_list,
            sessionList: tempList,
            listEnd: data.yogao2school_list.length < 20,
            isFirstEnter: false
        });

    },

    //  获取课程列表数据  isRefresh 是否重新刷新列表
    getSessionList(isRefresh, noNeedRefresh) {

        let sid = wx.getStorageSync('sid');
        pageParams.tag_id = this.data.activeTag;

        if (isRefresh) {
            tempList = [];
            pageParams.page = 1;
        }

        if (sid) pageParams.sid = sid;
        getSessionList(pageParams, this.handleSessionList, noNeedRefresh);

    },

    handleSessionList(data) {

        data = data.map(renderSessionItem);

        tempList = [...tempList, ...data];

        this.setData({
            sessionList: tempList,
            listEnd: data.length < 20
        });
        wx.stopPullDownRefresh();
    },

    //  切换tab
    changeTab(e) {

        let tagId = e.target.dataset.id ? parseInt(e.target.dataset.id) : '';

        if (this.data.activeTag === tagId) return;

        this.setData({
            activeTag: tagId
        });

        pageParams.tag_id = tagId;

        this.getSessionList(true);

    },

    //  跳到课程详情页
    goDetail(e) {
        let detail = e.target.dataset.session;
        wx.navigateTo({
            url: '../../package/detail/detail?session_id=' + detail.id + '&source=' + detail.source
        })
    },

    toBannerPage(e) {

        //  跳转类型   1 (外链)  100(小程序内部页)

        let info = e.target.dataset.info,
            linkType = info.sourceType,
            contentUrl = info.content_url;

        if (linkType === 1) {
            let url = encodeURI(contentUrl);
            wx.navigateTo({
                url: '../webView/webView?url=' + url
            });
        } else if (linkType === 100) {
            wx.navigateTo({
                url: contentUrl
            })
        }
    },

    closeDialog(e) {
        wx.setStorageSync('hideGuideDialog', true);
        this.setData({
            showGuideDialog: false
        })
    }

});