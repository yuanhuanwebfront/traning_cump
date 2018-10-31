let app = getApp();

let mySa = require('../../common/sa.js');

let emptyImg = "http://qiniucdn.dailyyoga.com.cn/8c/82/8c82090346ccd81acedc440c76d344e2.png";

function jumpToLogin(){
    wx.navigateTo({
        url: '../../pages/login/login'
    })
}

let hasGetInfo = false;

Page({

    data: {
        nickName: '点击登录',
        userImg: emptyImg,
        userId: ""
    },

    onLoad(){
        mySa.trackEvent(11, {
            page_id: 1002
        })
    },

    onShow() {
        let vm = this;
        if(app.globalData.userInfo){
            vm.setUserData(app.globalData.userInfo)
        }
    },

    setUserData(userInfo){
        hasGetInfo = true;
        this.setData({
            nickName: userInfo.nickName,
            userId: userInfo.uid,
            userImg: userInfo.logo.small || emptyImg
        });
        app.globalData.userInfo = userInfo;
    },

    imgLogin (){
        let hasLogin = app.checkUserLogin();
        if(!hasLogin){
            jumpToLogin();
        }
    },

    toMySession() {
        let hasLogin = app.checkUserLogin();
        if (hasLogin) {
            wx.switchTab({
                url: '../session/session'
            })
        }else{
            jumpToLogin();
        }
    },

    toMyOrder() {
        this.toOtherPage('../../other/order/order')
    },

    toMyCoupon() {
        this.toOtherPage('../../package/coupon/coupon')
    },

    toMyRebate() {
        this.toOtherPage('../../other/rebate/rebate')
    },

    toMyDaily(){
        this.toOtherPage('../../other/dailyList/dailyList')
    },

    toOtherPage (pageUrl){
        let hasLogin = app.checkUserLogin();
        if (hasLogin) {
            wx.navigateTo({ url: pageUrl })
        }else{
            jumpToLogin();
        }
    }

});