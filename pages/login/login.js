import {sendRequest, wxToast, confirmDialog, wxSetNavTitle} from '../../common/common';
import {loginStep} from '../../common/$http';

let sa = require('../../lib/sa/sensorsdata.min.js');
let mySa = require('../../common/sa.js');

let app = getApp(),
    bindConfirm = false,
    phoneNum = "",
    phonePassword = "",
    phoneReg = /^1[0-9]{10}$/;

function checkPhoneValid(){
    return phoneReg.test(phoneNum) && phonePassword.length >= 6;
}

Page({

    data: {
        isPhoneValid: false,
        phoneLogin: false,
        isShowSetting: false,
        miniAuth: '',
        phoneNum: '',
        passInfo: ''
    },

    onLoad (){
        wxSetNavTitle('登录');
    },

    changeSetting(e) {
        let status = e.detail.authSetting['scope.userInfo'];
        this.setData({
            isShowSetting: !status
        });
    },

    setPhone(e) {
        phoneNum = e.detail.value;
        this.setData({
            isPhoneValid: checkPhoneValid()
        })
    },

    setPassword(e) {
        phonePassword = e.detail.value;
        this.setData({
            isPhoneValid: checkPhoneValid()
        })
    },

    loginByPhone() {
        if(this.data.isPhoneValid){
            this.loginApp(this.data.miniAuth, 1, true);
        }
    },

    onGetUserInfo(e) {
        this.renderAuthParams(e.detail, 2);
    },

    onPhoneGetUserInfo(e) {
        this.renderAuthParams(e.detail, 1);
    },

    //  取到用户信息后换取mini_auth
    renderAuthParams(userDetail, type) {
        if (userDetail.userInfo) {

            let params = {
                session_key: wx.getStorageSync('sessionKey')
            };

            app.globalData.wechatInfo = userDetail.userInfo;
            params.encryptedData = userDetail.encryptedData;
            params.iv = userDetail.iv;

            this.verifyUser(params, type);
        } else {
            this.setData({
                isShowSetting: true
            })
        }
    },

    //  调用获取mini_auth接口
    verifyUser(params, type) {
        let vm = this;
        loginStep(params, function(data){
            vm.setData({
                appAuth: data.miniAppAuth
            });
            vm.checkLoginWay(data.miniAppAuth, type);
        }, 'cacheWeiXinMiniAppInfo');
    },

    //  判断登录方式（手机号还是微信）
    checkLoginWay(auth, type) {

        if (type === 2) {
            this.loginApp(auth, type);
        } else {
            this.setData({
                miniAuth: auth,
                phoneLogin: true
            });
        }
    },

    //  调用登录接口
    loginApp(auth, type, isConfirm) {

        wx.showLoading({mask: true});

        let vm = this,
            params = {
                miniAppAuth: auth,
                miniAppAccountType: type
            };

        if (type === 1) {
            params.mobile = phoneNum;
            params.password = phonePassword;
            if (!isConfirm) params.confirm = 1;
        }

        sendRequest('POST', 'user/thirdparty/loginWeiXinMiniApp', params).then(res => {
            wx.hideLoading();
            if (res.data.error_code === 0) {

                if (type === 2) {
                    vm.handleUserInfo(res.data.result.info);
                    wx.navigateBack(1);
                } else {
                    //  手机号第一次登录   判断status为1(绑定一致)还是2(绑定不一致)
                    if (isConfirm) {
                        if (res.data.result.status === 1) {
                            vm.handleUserInfo(res.data.result.info);
                            wx.navigateBack(1);
                        }
                    } else {
                        vm.handleUserInfo(res.data.result.info);
                        if (bindConfirm) {
                            confirmDialog('提示', '已选择手机号登录，如果您需要更改帐户已绑定的微信号，请联系瑜小蜜').then(res => {
                                wx.navigateBack(1);
                            })
                        } else {
                            wx.navigateBack(1);
                        }
                    }
                }

            } else if(res.data.error_code === 1000){
                wx.showModal({
                    title: '提示',
                    content: '你的帐号与当前微信无法绑定，可能无法接收推送消息，是否继续登录？',
                    cancelText: '微信登录',
                    confirmText: '是',
                    confirmColor: '#8CA5FF',
                    success: res => {
                        if (res.confirm) {
                            bindConfirm = true;
                            mySa.trackEvent(4, {
                                page_name: "1013",
                                click_id: 1002
                            });
                            vm.loginApp(this.data.miniAuth, 1);
                        }

                        if (res.cancel) {
                            mySa.trackEvent(4, {
                                page_name: "1013",
                                click_id: 1001
                            });
                            vm.loginApp(this.data.miniAuth, 2);
                        }
                    }
                })
            } else {
                wxToast(res.data.error_desc);
            }
        })
    },

    //  处理用户信息
    handleUserInfo(userInfo) {
        app.globalData.userInfo = userInfo;
        app.globalData.loginStatus = 1;
        sa.login(userInfo.uid);
        wx.setStorageSync('sid', userInfo.sid);
    }

});