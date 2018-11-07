//  引入神策
let sa = require('./lib/sa/sensorsdata.min.js');

import {wxPromise, sendRequest} from './common/common';
import {getUserInfo, loginStep} from './common/$http';

let getCode = wxPromise(wx.login);

App({

    globalData: {
        mini_app_source: 2,
        wechatInfo: {},
        userInfo: null,
        jsCode: "",
        hasListLoginRefresh: false, //  列表页是否登录并刷新
        hasDetailLoginRefresh: false, //  详情页是否登录并刷新
        showBackBtn: false
    },

    onLaunch: function () {
        sa.init();

        sa.para.autoTrack.appLaunch = function () {
            return {
                appId: 'wx3895f49172bc98b5',
            }
        };

        //  本地获取session_key
        let vm = this,
            storageKey = wx.getStorageSync('sessionKey'),
            wxCheckSession = wxPromise(wx.checkSession);

        if (storageKey) {
            wxCheckSession().catch(err => {
                vm.getJsCode();
            })
        } else {
            this.getJsCode();
        }

        let sid = wx.getStorageSync('sid');

        if (sid) getUserInfo({sid}, this.setUserData);

        this.retryUploadRecord();

        this.checkUpdate();

    },

    checkUpdate() {
        const updateManager = wx.getUpdateManager();

        updateManager.onCheckForUpdate(() => {

        });

        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })

    },

    setUserData(userInfo) {
        this.globalData.userInfo = userInfo;
        sa.login(userInfo.uid);
    },

    getJsCode(cb) {
        let vm = this;
        getCode().then(res => {
            vm.getSessionKey(res.code, cb);
        })
    },

    //  重新上传用户练习时长和进度
    retryUploadRecord() {

        let practiceTimeArr = wx.getStorageSync('practiceReportArr') || [],
            userActionTimeArr = wx.getStorageSync('userActionArr') || [],
            savePracticeArr = [...practiceTimeArr],
            saveActionArr = [...practiceTimeArr];


        practiceTimeArr.forEach((item, idx) => {

            sendRequest('POST', 'statistic/playtime', item).then(res => {
                if (res.data.error_code === 0) {
                    savePracticeArr.splice(idx, 1);
                    wx.setStorageSync('practiceReportArr', savePracticeArr);
                }
            })

        });

        userActionTimeArr.forEach((item, index) => {
            sendRequest('POST', 'user/userActionLog', item).then(res => {
                if (res.data.error_code === 0) {
                    saveActionArr.splice(index, 1);
                    wx.setStorageSync('userActionArr', saveActionArr);
                }
            })
        });




    },

    //  本地获取sessionKey 判断是否过期  过期需要重新获取
    getSessionKey(code, cb) {
        let vm = this;

        let params = {
            jscode: code,
            mini_app_source: vm.globalData.mini_app_source
        };

        loginStep(params, function (data) {
            wx.setStorageSync('sessionKey', data.session_key);
            wx.setStorageSync('openId', data.openid);
            if (cb && typeof cb === 'function') cb();
        }, 'getUserSessionKey');

    },

    checkUserLogin() {
        return !!wx.getStorageSync('sid');
    }

});