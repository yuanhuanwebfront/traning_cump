import {sendRequest, wxToast} from './common';

const NETWORK_ERROR_MSG = "网络异常，请重试";

const ERR_FN = function () {
    wx.hideLoading();
    wxToast(NETWORK_ERROR_MSG);
};

function showLoading() {
    wx.showLoading({
        mark: true,
        title: '正在加载'
    })
}

//  请求成功后的回调
function commonHandle(res, callback) {

    wx.hideLoading();

    if (res.data.error_code === 0) {
        callback(res.data.result);
    } else if(res.data.error_code === 999){
        wx.removeStorageSync('sid');
        wx.switchTab({
            url: '/pages/mine/mine'
        });
    } else {
        wxToast(res.data.error_desc || NETWORK_ERROR_MSG);
    }
}

//  获取用户信息  user/
let getUserInfo = function(params, callback){
    sendRequest('GET', 'user/getmeinfo', params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        ERR_FN();
    })
};

//  获取课程视频和学习要点h5   ----  session/getDetailInfo  ---
let getSessionDetail = function(params, callback, nameSpace){
    showLoading();
    sendRequest('GET', `session/${nameSpace}`, params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN();
    })
};

//  首页课程列表   --------  yogao2school/session   ------
let getSessionList = function (params, callback, noNeedLoading) {

    if(!noNeedLoading){
        showLoading();
    }

    sendRequest('GET', 'yogao2school/session/list', params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN();
    })
};

//  获取详情页数据  ------ Yogao2School/Session  -----
let getDetailWebInfo = function (params, callback, nameSpace, method = 'GET') {

    showLoading();
    //  getWebInfo  getUserSessionPurchaseInfo getUserEndSessionList
    sendRequest(method, `Yogao2School/Session/${nameSpace}`, params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN(err);
    })

};

//  获取详情课表数据  -------  Session  ------
let getSessionDetailInfo = function (params, callback, nameSpace, hideLoading) {

    if(!hideLoading) showLoading();

    sendRequest('GET', `Session/${nameSpace}`, params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN();
    })
};

//  获取优惠券列表  ------ mall/voucher -----
let getCouponList = function (params, callback, nameSpace) {

    showLoading();
    //  list    listForProduct
    sendRequest('GET', `mall/voucher/${nameSpace}`, params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN();
    })
};

//  获取返利信息  ---------- user/wallet ------------
let getRebate = function (params, callback, nameSpace) {

    showLoading();

    sendRequest('GET', `user/wallet/${nameSpace}`, params, true).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN();
    })
};

//  获取订单信息  ---------- pay/ ------------
let getOrder = function (params, callback, nameSpace) {

    showLoading();

    sendRequest('GET', `pay/${nameSpace}`, params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN();
    })
};

//  登录步骤  getUserSessionKey(获取sessionKey)   cacheWeiXinMiniAppInfo(获取miniAuth)  loginWeiXinMiniApp(真正的登录)
//  ----   user/thirdparty  -----
let loginStep = function(params, callback, nameSpace){

    let method = 'POST';

    if(nameSpace === 'getUserSessionKey') method = 'GET';

    sendRequest(method, `user/thirdparty/${nameSpace}`, params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN();
    })
};

//  ----  GET    yogao2school/   --------
let getYogaSchoolInfo = function(params, callback, nameSpace, hideLoading){
    if(!hideLoading){
        showLoading();
    }
    sendRequest('GET', `yogao2school/${nameSpace}`, params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN();
    })
};

//  ----  POST  yogao2school/order/checkout
let postCheckout = function(params, callback){
    showLoading();
    sendRequest('POST', 'yogao2school/order/checkout', params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN();
    })
};

//  ----  POST  Pay/createPrePayment
let createPrePayment = function(params, callback){
    showLoading();
    sendRequest('POST', 'Pay/createPrePayment', params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN();
    })
};

//  ----  POST  user/user/setReceivingInformation
let postUserAddressInfo = function(params, callback){
    showLoading();
    sendRequest('POST', 'user/user/setReceivingInformation', params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN();
    })
};

//  ----  GET  Yogao2School/Partner
let getPartnerInfo = function(params, callback, nameSpace, hideLoading){
  if (!hideLoading) showLoading();
    sendRequest('GET', `Yogao2School/Partner/${nameSpace}`, params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN();
    })
};

let getRankInfo = function(params, callback, nameSpace, errorUrl){
    showLoading();
    sendRequest('GET', `Yogao2school/Member/${nameSpace}`, params).then(res => {
        commonHandle(res, callback);
        if(res.data.error_code !== 0){
            wx.switchTab({
                url: errorUrl
            });
        }
    }).catch(err => {
        console.log(err);
        wx.switchTab({
            url: '../pages/index/index'
        });
        ERR_FN();
    })
};

let getShareInfo = function(params, callback){
    sendRequest('GET', 'yogao2school/member/getShareImage', params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN();
    })
};

let transformQrCodeScene = function(params, callback){
    sendRequest('GET', 'yogao2school/member/getWechatMiniAppQrDecrypt', params).then(res => {
        commonHandle(res, callback);
    }).catch(err => {
        console.log(err);
        ERR_FN();
    })
};

let diaryRequest = function(params, namespace, callback, method = 'POST', reLoginFn){
    showLoading();
    sendRequest(method, `Yogao2School/Diary/${namespace}`, params).then(res => {
        //  如果通过小程序进入打卡页面，新增用户不一致逻辑
        if(namespace === 'getCreateInfo' && res.data.error_code === 3025){
            wx.hideLoading();
            if(reLoginFn) reLoginFn();
        }else{
            commonHandle(res, callback);
        }

    }).catch(err => {
        //  创建日记失败后，修改禁用按钮置灰
        if(namespace === 'createDiary'){
            reLoginFn();
        }
        console.log(err);
        ERR_FN();
    })
};


const $http = {

    NETWORK_ERROR_MSG,

    getUserInfo,
    getSessionDetail,
    getSessionList,
    getDetailWebInfo,
    getSessionDetailInfo,

    getCouponList,
    getRebate,
    getOrder,
    loginStep,
    getYogaSchoolInfo,
    postCheckout,
    createPrePayment,
    postUserAddressInfo,
    transformQrCodeScene,
    getPartnerInfo,
    getRankInfo,
    getShareInfo,
    diaryRequest
};


module.exports = $http;