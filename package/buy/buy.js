import {IS_IOS, formatTime, wxToast, wxSetNavTitle, navigateToPath} from '../../common/common';
import {getYogaSchoolInfo, postCheckout, createPrePayment, getDetailWebInfo} from '../../common/$http';
import AREA from './area';

let mySa = require('../../common/sa');

let track_params = {};

const app = getApp();

// const DERATE_TYPE_UNKNOWN = 'UNKNOWN';
// const DERATE_TYPE_SUB_TOTAL = 'SUB_TOTAL';                   //  原价                1
// const DERATE_TYPE_MEMBER_REWARD = 'MEMBER_REWARD';           //  会员优惠            2
// const DERATE_TYPE_MEMBER_CARD = 'MEMBER_CARD';               //  会员卡优惠          3
// const DERATE_TYPE_REPURCHASED = 'REPURCHASED';               //  老学员复购          4
// const DERATE_TYPE_VOUCHER = 'VOUCHER';                       //  优惠券              5
// const DERATE_TYPE_POINTS = 'POINTS';                         //  瑜币兑换            6
// const DERATE_TYPE_COMBINED_SALE = 'COMBINED_SALE';           //  打包购买            7
// const DERATE_TYPE_COURSE_ACTIVITY = 'COURSE_ACTIVITY';       //  课程优惠            8
// const DERATE_TYPE_WALLET='WALLET';                           //  返利余额支付         9
// const DERATE_TYPE_TOTAL = 'TOTAL';                           //  总价                10

/*
*    step1.   优惠信息分为两种  一种是页面显示的优惠信息，逻辑如下
*             一个是页面上展示的信息，这个信息主要控制页面显示哪种优惠，初始化显示那几种优惠由checkout接口返回
*             第一次请求的时候默认会拉取所有的优惠信息，从而可以确定页面上显示那些优惠  （页面展示判断）
*             此时会缓存checkout接口的请求参数，以后每次切换优惠时，都应该修改的是缓存里面的 discounts_list
*
*    step2.   地址信息
*             初始化的时候先从session/sessionInfo接口里面拉取地址信息，如果有，根据接口数据绘制页面，本地缓存地址信息
*             进入修改地址页面后，直接从缓存中拉取地址信息，绘制编辑地址页面，保存成功后，本地重新缓存地址信息
*             修改地址完成后，回退到购买页，直接从缓存中拉取地址信息，重绘地址信息
*
* */


//  定义页面中使用比较频繁的一些变量
let pageInfo = {
    isFirstEnter: true
};

Page({

    data: {

        areaData: AREA,

        showDetailAddress: false,                       //      是否显示详细地址输入框
        hidePointsList: true,                           //      隐藏瑜币选择弹窗
        hideDetailInfo: true,                           //      隐藏明细弹窗
        showAreaPicker: false,                          //      显示地区选择框

        totalPayMoney: 0,                               //       用户实际需要支付的金额

        pointsList: [],                                 //       瑜币弹窗里面的两项
        discountInfo: {},                               //       所有的优惠信息（非弹窗用）
        discountList: [],                               //       所有的优惠明细（弹窗用）
        canUseCoupon: false,                             //       是否可以使用优惠券（第一次进入就可以确定）
        canUsePoints: false,                             //       是否可以使用瑜币  （第一次进入就可以确定）
        discountLoadFinish: false,                      //       返利接口是否初始化完成

        //  用户地址信息
        addressInfo: {
            userName: "",
            userPhone: "",
            userWeChat: "",
            userAddress: ""
        },
        btnDisable: true,

        areaInfo: {},           //  地域信息        pid  cid  rid
        areaName: [],           //  地域名称        省，市，区 字符串

        sessionInfo: {},

        userInfoFull: false
    },

    onLoad(options) {

        this.setData({
            pageQuery: options,
            isActivityEnter: !!options.activityId
        });
        track_params = {};
        pageInfo.sessionId = options.sessionId;

        if(options.rebate_id){
            this.setData({
                invite_euid: options.rebate_id
            })
        }

        //  TODO  如果是课程活动进入，那么吊获取活动课程详情的接口
        if(options.activityId){
            this.getActivitySessionInfo(options);
        }else{
            this.getSessionInfo(options.sessionId);
        }
        wxSetNavTitle('确认订单');
    },

    onShow() {
        let storageParams = wx.getStorageSync('checkoutParams'),
            storageAddress = wx.getStorageSync('userAddress');

        if (!pageInfo.isFirstEnter && storageParams) {

            //  如果从优惠券页面回退回来，发现优惠券选中，那么瑜币不能用
            if (this.data.mutexType === 1) {
                let hasUseCoupon = storageParams.discounts_list.find(item => {
                    return item.code === 'VOUCHER';
                });
                this.data.pointsList[0].isChecked = (hasUseCoupon.is_use != 1);
                this.data.pointsList[1].isChecked = (hasUseCoupon.is_use == 1);
                this.setData({
                    pointsList: this.data.pointsList
                })
            }

            wx.setStorageSync('checkoutParams', storageParams);
            storageParams.product_list = JSON.stringify(storageParams.product_list);
            storageParams.discounts_list = JSON.stringify(storageParams.discounts_list);

            this.resetCheckoutInfo(storageParams);

            if (storageAddress) {
                this.setData({
                    "userInfoFull": true,
                    btnDisable: false,
                    ...storageAddress
                });
            }
        }

    },

    onUnload() {
        //  卸载页面删除checkoutParams
        wx.removeStorageSync('checkoutParams');
        wx.removeStorageSync('userAddress');
    },

    //  获取课程详情
    getSessionInfo() {
        let params = {
            session_id: pageInfo.sessionId,
            sid: wx.getStorageSync('sid')
        };
        getYogaSchoolInfo(params, this.handleSessionInfo, 'session/info');
    },

    //  处理课程详情 (包含地址信息)
    handleSessionInfo(data) {

        //  设置课程信息
        this.setData({
            "showDetailAddress": data.need_detail_address === 1,
            "sessionInfo.sessionName": data.session_name,
            "sessionInfo.sessionPrice": data.price,
            "sessionInfo.sessionImg": data.image_phone,
            "sessionInfo.sessionStartTime": formatTime(data.session_start_time * 1000, 'yyyy-mm-dd'),
            "sessionInfo.sessionAddress": data.address,
            mutexType: data.mutex_type
        });


        //  判断是否存在member_list, 若存在，则用户信息已存在，那么则应该显示获取到的信息
        if (data.member_list && data.member_list[0] && data.member_list[0].province_id && data.member_list[0].region_id && data.member_list[0].area_id) {

            let user = data.member_list[0],
                provinceItem = AREA.find(item => {
                    return item.pid == user.province_id
                }),
                cityItem = provinceItem.citylist.find(item => {
                    return item.cid == user.region_id
                }),
                areaItem = cityItem.areaList.find(item => {
                    return item.aid == user.area_id
                }),
                //  需要缓存到本地然后去修改地址页面直接拿到修改
                saveAddress = {
                    addressInfo: {
                        userName: user.member_name,
                        userPhone: user.member_mobile,
                        userWeChat: user.member_wx_no,
                        userAddress: user.userAddress,
                    },
                    areaName: [provinceItem.pname, cityItem.cname, areaItem.aname],
                    areaInfo: {
                        pId: user.province_id + "",
                        cId: user.region_id + "",
                        aId: user.area_id + ""
                    }
                };

            this.setData({
                userInfoFull: true,
                btnDisable: false,
                ...saveAddress,
            });

            wx.setStorageSync('userAddress', saveAddress);
        }

        //  绘制瑜币抵扣弹窗信息 (默认使用该优惠)
        if (data.max_pay_points && data.max_pay_points > 0) {
            this.data.pointsList[0] = {
                title: '瑜币抵用：可用' + data.max_pay_points + '瑜币抵用' + (data.max_pay_points / 100).toFixed(2),
                isChecked: false,
                usePoints: data.max_pay_points,
                value: 1
            };
            this.data.pointsList[1] = {
                title: '不使用瑜币折扣',
                isChecked: true,
                value: 0
            }
        }

        mySa.trackEvent(7, {
            business_type: 'O2_camp',
            deal_id: data.id,
            category_id: data.category_id + '',
            tag_deal_name: 'O2_camp' + data.id,
            source_id: data.id
        });

        track_params.category_id = data.category_id;

        this.renderTrackSessionInfo(data);

        this.getDiscountInfo(data.id);
    },

    //  获取活动课程详情的信息
    getActivitySessionInfo({sessionId, activityId}){
        let params = {
            session_id: sessionId,
            activity_course_id: activityId
        };
        getDetailWebInfo(params, data => {
            this.handleActivitySessionInfo(data)
        }, 'getActivitySessionInfo');
    },

    //   处理活动课程详情的信息
    handleActivitySessionInfo(data){
        this.setData({
            "showDetailAddress": false,
            "hideAddressDetail": true,                 //  1.3.0 新增活动课程隐藏地址选择器
            "sessionInfo.validDay": data.session_period_validity,
            "sessionInfo.sessionName": data.session_name,
            "sessionInfo.sessionPrice": data.price,
            "sessionInfo.sessionImg": data.image_phone,
            "sessionInfo.sessionStartTime": formatTime(new Date().getTime(), 'yyyy-mm-dd')
        });

        if (data.member_list && data.member_list.member_name && data.member_list.member_mobile) {

            let user = data.member_list,
                //  需要缓存到本地然后去修改地址页面直接拿到修改
                saveAddress = {
                    addressInfo: {
                        userName: user.member_name,
                        userPhone: user.member_mobile,
                        userWeChat: user.member_wx_no,
                        userAddress: user.userAddress,
                    }
                };

            this.setData({
                userInfoFull: true,
                btnDisable: false,
                ...saveAddress,
            });

            wx.setStorageSync('userAddress', saveAddress);
        }
        this.getActivityDiscount();
    },

    //  获取活动课程详情的折扣
    getActivityDiscount(){

        let params = {
            product_id: this.data.pageQuery.sessionId,
            product_type: 13,
            product_list: [{
                "is_main": "1",
                "product_id": this.data.pageQuery.sessionId,
                "product_type": "13",
                "payment_order_type": "13",
                "activity_course_id": this.data.pageQuery.activityId
            }],
            discounts_list: []
        };

        wx.setStorageSync('checkoutActivityParams', {...params});

        params.product_list = JSON.stringify(params.product_list);
        params.discounts_list = JSON.stringify(params.discounts_list);

        postCheckout(params, data => {
            this.handleDiscountInfo(data, true);
        })

    },

    //  生成神策上报参数
    renderTrackSessionInfo(data){

        track_params.action_name = data.session_name;
        track_params.is_main_product = true;
        track_params.action_id = data.id;
        track_params.start_time = formatTime(data.session_start_time * 1000, 'yyyy-mm-dd');
        track_params.action_price = parseInt(data.price);
        track_params.teacher = parseInt(data.o2_coach_id);
        track_params.applicants = parseInt(data.enroll_num_info.addon_enroll_num || 0);
        track_params.teaching_location = data.address;

    },

    //  第一次进入页面获取优惠信息  此时将优惠信息缓存起来。每次更新优惠时，则重新修改参数并缓存
    getDiscountInfo(sessionId) {

        let vm = this,
            checkoutParams = {
                sid: wx.getStorageSync('sid'),
                version: '7.0.0',
                product_id: sessionId,
                product_type: 1,
                product_list: [{
                    "is_main": "1",
                    "product_id": sessionId,
                    "product_type": "1",
                    "payment_order_type": "2"
                }],
                discounts_list: [{
                    "code": "VOUCHER",
                    "is_use": "1",
                    "value": "0"
                }, {
                    "code": "POINTS",
                    "is_use": "1",
                    "value": "0"
                }]
            },
            params = {...checkoutParams};

        wx.setStorageSync('checkoutParams', checkoutParams);

        params.product_list = JSON.stringify(params.product_list);
        params.discounts_list = JSON.stringify(params.discounts_list);

        postCheckout(params, function (data) {
            vm.handleDiscountInfo(data, true)
        });

    },

    //  处理优惠信息 (绘制优惠界面)
    handleDiscountInfo(data, isFirst) {

        let discountsInfo = {};

        data.total_list.forEach(item => {
            discountsInfo[item.code] = item;
        });

        this.renderTrackParamsDiscount(discountsInfo);

        //  如果互斥  那么每一次请求都会判断有没有这种优惠, 只要有就显示
        if (discountsInfo['VOUCHER']) this.setData({canUseCoupon: true});

        if (discountsInfo['POINTS']) {
            this.setData({
                canUsePoints: true
            });
            this.data.pointsList[0].title = '瑜币抵用：可用' + discountsInfo['POINTS'].purchase_discounts_value + '瑜币抵用' + (discountsInfo['POINTS'].purchase_discounts_value / 100).toFixed(2);
            this.data.pointsList[0].usePoints = discountsInfo['POINTS'].purchase_discounts_value;
        }

        if(this.data.pointsList && this.data.pointsList.length > 0){
            this.data.pointsList[0].isChecked = !!discountsInfo['POINTS'];
            this.data.pointsList[1].isChecked = !discountsInfo['POINTS'];
        }

        this.setData({
            pointsList: this.data.pointsList,
        });

        //  修改页面数据
        this.setData({
            discountsInfo,
            discountList: data.total_list,
            discountLoadFinish: true
        });

        pageInfo.isFirstEnter = false;
    },

    //  修改瑜币信息后的操作
    changePoints(e) {

        let vm = this,
            val = e.detail.value;

        let checkoutParams = wx.getStorageSync('checkoutParams');

        checkoutParams.discounts_list.forEach(item => {
            if (item.code === 'POINTS') {
                item.is_use = val;
            }
        });

        let params = {...checkoutParams};

        //   选择瑜币的时候，如果互斥，那么优惠券的选中状态与瑜币的选择状态相反
        if (this.data.mutexType === 1) {
            params.discounts_list.forEach(item => {
                if (item.code === 'POINTS') {
                    item.is_use = val;
                } else {
                    item.is_use = val ? 0 : 1
                }
            })
        }

        params.discounts_list = JSON.stringify(checkoutParams.discounts_list);
        params.product_list = JSON.stringify(checkoutParams.product_list);

        wx.setStorageSync('checkoutParams', checkoutParams);
        this.setData({
            hidePointsList: true
        }, () => {
            vm.resetCheckoutInfo(params);
        })

    },

    resetCheckoutInfo(params) {
        postCheckout(params, this.handleDiscountInfo);
    },

    chooseCoupon() {

        //  获取选择的优惠券id
        let couponItem = this.data.discountList.find(item => {
            return item.sort_order === 5
        });

        let couponId = (couponItem && couponItem.purchase_discounts_value) ? couponItem.purchase_discounts_value : 0;

        wx.navigateTo({
            url: '../coupon/coupon?canSelect=1&couponId=' + couponId + "&sessionId=" + pageInfo.sessionId + "&mutex=" + this.data.mutexType
        });

    },

    //          输入框输入事件  start   ----------------------
    setUserName(e) {
        this.setData({
            "addressInfo.userName": e.detail.value
        });
        this.checkInfoIsRight();
    },

    setUserPhone(e) {
        this.setData({
            "addressInfo.userPhone": e.detail.value
        });
        this.checkInfoIsRight();
    },

    setUserWechat(e) {
        this.setData({
            "addressInfo.userWeChat": e.detail.value
        });
        this.checkInfoIsRight();
    },

    setUserAddress(e) {
        this.setData({
            "addressInfo.userAddress": e.detail.value
        })
    },

    //  /^1[0-9]{10}$/
    checkInfoIsRight() {
        let info = this.data.addressInfo;
        if(this.data.pageQuery.activityId){
            this.setData({
                btnDisable: (!info.userName || !info.userWeChat || !info.userPhone)
            })
        }else{
            this.setData({
                btnDisable: (!info.userName || !info.userWeChat || !info.userPhone || !this.data.areaInfo.pId)
            })
        }

    },

    //          输入框输入事件  end    -----------------------
    cancelPicker(e) {
        this.setData({
            showAreaPicker: e.detail
        })
    },

    confirmPicker(e) {
        this.setData({
            showAreaPicker: e.detail.showPicker,
            areaName: e.detail.nameList,
            areaInfo: {
                pId: e.detail.idList[0],
                cId: e.detail.idList[1],
                aId: e.detail.idList[2]
            }
        }, this.checkInfoIsRight);
    },

    showPicker() {
        this.setData({
            showAreaPicker: true
        })
    },

    payOrder() {

        let vm = this,
            userAddress = this.data.addressInfo,
            areaInfo = this.data.areaInfo;

        if( !(/^1[0-9]{10}$/.test(userAddress.userPhone)) ){
            wxToast('请输入正确的手机号');
            return;
        }

        //  调用preCreatePayment  step1  从缓存中先获取产品信息
        let checkoutDetail = wx.getStorageSync('checkoutParams'),
            checkoutActivityParams = wx.getStorageSync('checkoutActivityParams'),
            commonParams = {
                member_name: userAddress.userName,
                member_mobile: userAddress.userPhone,
                member_wx_no: userAddress.userWeChat,
                partner: IS_IOS ? "121" : "111",
                payment_order_type: 2,
                uid: app.globalData.userInfo.uid,
                sid: wx.getStorageSync('sid'),
                openid: wx.getStorageSync('openId')
            },
            params = {};

        if(this.data.pageQuery.activityId){
            params = {
                ...commonParams,
                source_type: "50003",
                product_id: checkoutActivityParams.product_id,
                product_type: checkoutActivityParams.product_list[0].product_type,
                product_list: JSON.stringify(checkoutActivityParams.product_list),
                payment_order_type: 13
            };
            mySa.trackEvent(8, {
                activity_type: 1,
                activity_id: this.data.pageQuery.activityId,
                click_type: 1
            })
        }else{
            params = {
                ...commonParams,
                source_type: "50001",
                source_id: checkoutDetail.product_id,
                product_id: checkoutDetail.product_id,
                product_list: JSON.stringify(checkoutDetail.product_list),
                product_type: checkoutDetail.product_list[0].product_type,
                address: userAddress.userAddress || "",
                province_id: areaInfo.pId,
                region_id: areaInfo.cId,
                area_id: areaInfo.aId,
                version: '7.0.0'
            };
        }

        if(this.data.invite_euid){
            params.invite_euid = this.data.invite_euid;
            params.source_type = '50002';
        }

        if(this.data.discountsInfo['VOUCHER']){
            params.user_voucher_id = this.data.discountsInfo['VOUCHER'].purchase_discounts_value || 0;
        }
        if(this.data.discountsInfo['POINTS']){
            params.points = this.data.discountsInfo['POINTS'].purchase_discounts_value || 0;
        }

        createPrePayment(params, function(data){
            vm.openWxPay(data, params);
        });

        mySa.trackEvent(8, {
            business_type: 'O2_camp',
            tag_sku_name: 'O2_camp' + checkoutDetail.product_id,
            click_type: 1,
            sku_id: parseInt(checkoutDetail.product_id),
            category_id: track_params.category_id
        })

    },

    //  吊起微信支付
    openWxPay(data, trackParams) {

        let info = data.pay_info,
            sessionId = trackParams.product_id,
            activityId = this.data.pageQuery.activityId,
            activityUrl = `/activity/activitySuccess/activitySuccess?session_id=${sessionId}&activity_id=${activityId}`;

        this.renderTrackParamsAddress(trackParams);

        track_params.order_id = data.out_trade_no;

        //  必须是活动课程进入并且0元购的活动  就可以不走微信支付
        if(this.data.isActivityEnter && this.data.discountsInfo['COURSE_ACTIVITY']){
            wx.redirectTo({url: activityUrl + '&valid_day=' + this.data.sessionInfo.validDay});
        }else{
            wx.requestPayment({
                timeStamp: info.timeStamp + "",
                nonceStr: info.nonceStr,
                package: info.package,
                signType: info.signType,
                paySign: info.paySign,
                success: res => {
                    if(this.data.isActivityEnter){
                        wx.redirectTo({url: activityUrl + '&valid_day=' + this.data.sessionInfo.validDay});
                    }else{
                        wx.redirectTo({
                            url: '../success/success?order_id=' + data.out_trade_no + '&session_id=' + pageInfo.sessionId
                        })
                    }
                },
                fail: err => {
                    wxToast('支付失败');
                }
            });
        }


    },

    renderTrackParamsAddress(info){
        track_params.name = info.member_name;
        track_params.telephone = info.member_mobile;
        track_params.weixin = info.member_wx_no;
        track_params.province = info.province_id;
        track_params.city = info.region_id;
        track_params.area = info.area_id;
    },

    renderTrackParamsDiscount(info){

        track_params.is_vip_discount = !!info[2];

        if(info[4]){
            track_params.is_repurchase = true;
            track_params.repurchase_discount_value = -parseInt(info[4].value);
        }else{
            track_params.is_repurchase = false;
        }

        if(info[5]){
            track_params.is_coupon = true;
            track_params.coupon_value = -parseInt(info[5].value);
        }else{
            track_params.is_coupon = false;
        }

        if(info[6]){
            track_params.is_yubi = true;
            track_params.yubi_value = -parseInt(info[6].value);
            track_params.yubi_num = info[6].purchase_discounts_value;
        }else{
            track_params.is_yubi = false;
        }
    },

    goAddressEdit() {
        wx.navigateTo({
            url: '../address/address?sessionId=' + pageInfo.sessionId
        })
    },

    //  **************  操作界面函数  **************

    showPoints(e) {
        this.setData({
            hidePointsList: e.target.dataset.open === '0'
        })
    },

    closePoints() {
        this.setData({
            hidePointsList: true
        })
    },

    toggleDetail() {
        this.setData({
            hideDetailInfo: !this.data.hideDetailInfo
        })
    },

    closeDetail (e){
        if(e.target.dataset.close){
            this.toggleDetail();
        }
    }

});