import MD5 from '../common/md5';

//  0 测试    1 mirror    2 线上
const DEBUG_TYPE = 0;

const SHOW_HIDDEN_SESSION = false;

//  -------------   测试地址    -----------

const BASE_URL_MAP = {
    0: 'https://test.dailyyoga.com.cn/620_qa/',
    1: 'https://o2o.dailyyoga.com.cn/620mirror/',
    2: 'https://o2o.dailyyoga.com.cn/620/'
};

const GO_URL_MAP = {
    0: 'http://115.29.202.161:28090/api/',
    1: 'https://api.dailyyoga.com.cn/mirror/api/',
    2: 'https://api.dailyyoga.com.cn/api/'
};

const BASE_URL = BASE_URL_MAP[DEBUG_TYPE];
const BASE_GO_URL = GO_URL_MAP[DEBUG_TYPE];

const SIGN_KEY = "2f57cc785fa56cff2449de2938f2dec2";
const IS_IOS = /iOS/.test(wx.getSystemInfoSync().system);

let confirmColor = '#8CA5FF';                   //  确认文字的颜色


//  格式化日期
let formatTime = function (date, format) {

    function addToDouble(num) {
        return num >= 10 ? num : '0' + num;
    }

    let dateInfo = new Date(date),
        year = dateInfo.getFullYear(),
        month = dateInfo.getMonth() + 1,
        day = dateInfo.getDate(),
        hour = dateInfo.getHours(),
        minute = dateInfo.getMinutes(),
        second = dateInfo.getSeconds();

    return format.replace(/yyyy/g, year)
        .replace(/mm/g, addToDouble(month))
        .replace(/dd/g, addToDouble(day))
        .replace(/HH/g, addToDouble(hour))
        .replace(/MM/g, addToDouble(minute))
        .replace(/ss/g, addToDouble(second));
};

//  将rpx单位转换为px
let transformRpx = function (rpxNum) {
    let {screenWidth} = wx.getSystemInfoSync();
    return (screenWidth / 750) * rpxNum;
};

let wxPromise = function (fn) {
    return function (obj = {}) {
        return new Promise((resolve, reject) => {
            obj.success = function (res) {
                resolve(res);
            };

            obj.fail = function (err) {
                reject(err);
            };

            fn(obj);
        });

    }
};

let wxSetNavTitle = function (title) {
    wx.setNavigationBarTitle({
        title
    })
};

let wxToast = function (title, type) {
    wx.showToast({
        title,
        icon: type || 'none'
    })
};

/*
*   @   created by yuanhuan  2018-08-08
*   封装的request方法
*   @params  url (String)     请求的接口地址，必填;
*   @params  method (String)  请求方法(需大写 ep: GET, POST)，必填;
*   @params  data (Object)    请求参数，选填;
*   @params  isGo (Boolean)   是否调用go接口
*   @message_log 2018年9月20日 14:36:09 water 新增用调用隐藏课程 dailyyoga-environ
* */
let sendRequest = function (method = 'GET', url, data, isGo) {

    // 2018年9月20日 14:19:53 water 测试的时候 读取隐藏课程 'dev'; //开发环境字符串 'product';

    let header = {
        "content-type": method === 'POST' ? 'application/x-www-form-urlencoded' : 'application/json',
        "dailyyoga-channel": IS_IOS ? 1000002 : 900002,
        "d-type": IS_IOS ? 2 : 1,
        "dailyyoga-environ": SHOW_HIDDEN_SESSION ? 'dev' : 'product'
    };

    let storageSid = wx.getStorageSync('sid');
    if (storageSid) {
        data.sid = storageSid;
    }
    return new Promise((resolve, reject) => {
        wx.request({
            header,
            method,
            data,
            url: (isGo ? BASE_GO_URL : BASE_URL) + url,
            success: res => {
                resolve(res);
            },
            fail: err => {
                reject(err);
            }
        })
    });

};

let confirmDialog = function (title, content) {
    return new Promise(function (resolve, reject) {
        wx.showModal({
            title,
            content,
            showCancel: false,
            confirmText: '确认',
            confirmColor: confirmColor,
            success: res => {
                if (res.confirm) {
                    resolve()
                }
                if (res.cancel) {
                    reject();
                }
            }
        })
    })
};

//  下载并且保存图片至本地
let saveImgToLocalPath = function (imgUrl) {

    wx.downloadFile({
        url: imgUrl,
        success: res => {
            wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: response => {
                    wxToast('图片已保存至本地');
                },
                fail: err => {
                    wx.getSetting({
                        success: res => {
                            if (!res.authSetting['scope.writePhotosAlbum']) {
                                wx.openSetting();
                            }
                        }
                    })
                }
            })
        },
    });

};

//  检测网络类型的弹窗
let checkNetWorkType = function (title, content) {

    return new Promise(function (resolve, reject) {

        wx.getNetworkType({
            success: res => {
                if (res.networkType !== 'wifi') {
                    wx.showModal({
                        title,
                        content,
                        confirmColor,
                        success(info) {
                            if (info.confirm) {
                                resolve();
                            }
                            if (info.cancel) {
                                reject();
                            }
                        }
                    })
                } else {
                    resolve();
                }
            }
        })

    })


};

//  获取签名
let getSign = function (str) {
    return MD5.hexMD5(str);
};

//  将对象属性排序
let sortObjectKey = function (obj) {
    let newKey = Object.keys(obj).sort(),
        newObj = {};

    for (let i = 0; i < newKey.length; i++) {
        newObj[newKey[i]] = obj[newKey[i]];
    }

    return newObj;
};

//  转换通过二维码进入的页面options
let decodeQrCodeScene = function (scene) {

    let sceneStr = decodeURIComponent(scene),
        query = {};

    sceneStr.split('&').forEach(item => {

        let obj = item.split('='),
            key = obj[0],
            val = obj[1];

        query[key] = val;

    });

    return query;
};

//  转换数据并生成返利信息
let renderRebateInfo = function(data, hasBuy){

    let rebateInfo = null;

    function renderDesc(timeStamp) {
        let dateInfo = new Date(timeStamp * 1000),
            month = dateInfo.getMonth() + 1,
            day = dateInfo.getDate(),
            hour = dateInfo.getHours() > 9 ? dateInfo.getHours() : '0' + dateInfo.getHours(),
            minutes = dateInfo.getMinutes() > 9 ? dateInfo.getMinutes() : '0' + dateInfo.getMinutes();

        return month + '月' + day + '日 ' + hour + ":" + minutes;
    }

    if(hasBuy){
        rebateInfo = data.rebate_info.pay_after;
    }else{
        //  购买状态为 2 (未购买 pay_before)  购买状态为1 (已购买 pay_after)
        rebateInfo = data.user_enroll_status === 1 ? data.rebate_info.pay_after : data.rebate_info.pay_before;
    }

    if (rebateInfo && rebateInfo.money) {

        if(!rebateInfo.is_permanently){
            let startTimeDesc = renderDesc(rebateInfo.begin_time),
                endTimeDesc = renderDesc(rebateInfo.end_time);

            rebateInfo.rebateDesc = '限时' + startTimeDesc + ' 至 ' + endTimeDesc;
        }

        rebateInfo.rebatePrice = parseFloat(rebateInfo.money);

    }

    return rebateInfo || false;

};

//  上传本地图片至线上服务器
let uploadImage = function (tempPath, cb) {
    wx.showLoading({title: '正在上传'});
    wx.uploadFile({
        url: 'https://st.dailyyoga.com.cn/pic/upload.php',
        filePath: tempPath,
        name: 'uploadInput',
        header: {
            'content-type': 'multipart/form-data'
        },
        success(res){

            let resData = JSON.parse(res.data);

            cb(resData.result);
        },
        fail(){
            wxToast('上传失败');
        },
        complete(){
            wx.hideLoading();
        }
    })
};

let navigateToPath = function(url){
    wx.navigateTo({url});
};

/*  用户退出当前账号并且重新登录的方法(会打开弹窗并在弹窗的回调中执行退出操作);
*   @params     content         弹窗的提示文案     String
*   @params     confirmText     弹窗确认按钮文案   String
*   @params     app             小程序实例        getApp可获得
*/
let reLogin = function(content, confirmText, app){
    wx.showModal({
        content,
        confirmText,
        title: '提示',
        cancelText: '取消',
        success: res => {
            if (res.confirm) {
                wx.showLoading({mark: true});
                wx.removeStorageSync('sid');
                wx.removeStorageSync('sessionKey');
                wx.hideLoading();
                app.getJsCode(() => {
                    wx.navigateTo({
                        url: '/pages/login/login'
                    })
                });
            }

            if (res.cancel) {
                wx.switchTab({
                    url: '/pages/index/index'
                })
            }


        }
    });
};

const common = {
    IS_IOS,
    SIGN_KEY,
    BASE_URL,
    BASE_GO_URL,
    wxToast,
    wxPromise,
    wxSetNavTitle,
    sendRequest,
    transformRpx,
    confirmDialog,
    saveImgToLocalPath,
    checkNetWorkType,
    formatTime,
    getSign,
    sortObjectKey,
    decodeQrCodeScene,
    renderRebateInfo,
    uploadImage,
    navigateToPath,
    reLogin
};

module.exports = common;

