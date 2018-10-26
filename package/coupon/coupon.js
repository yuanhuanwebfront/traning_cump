import {getCouponList} from '../../common/$http';
import {formatTime, wxSetNavTitle} from '../../common/common';

let app = getApp();

let globalCouponId = "";
let globalMutex = 0;
let globalSelect = false;

Page({

    data: {
        canSelect: false,
        validList: [],
        usedList: [],
        expiredList: []
    },

    onLoad (options){

        let vm = this,
            params = {
                sid: wx.getStorageSync('sid'),
                product_type: 1,
                version: '7.0.0'
            };

        wxSetNavTitle(options.sessionId ? "选择优惠券" : "我的优惠券");

        globalCouponId = options.couponId || 0;
        globalMutex = options.mutex == 1;
        globalSelect = options.canSelect;

        if(options.sessionId){
            params.product_id = options.sessionId;
        }

        this.setData({
            canSelect: options.canSelect || false
        });

        //  如果不是从购买页进来
        if(options.sessionId){
            getCouponList(params, function(data){
                vm.handleCouponList(data, globalCouponId);
            }, 'listForProduct');
        }else{
            getCouponList(params, function(data){
                vm.handleCouponList(data, globalCouponId);
            }, 'list');
        }

    },

    handleCouponList (data, validId){

        function handleItem(item, canUse, validId){
            if(validId){
                item.is_select = (validId == item.id);
            }
            item.canUse = canUse;
            item.couponPrice = parseInt(item.discount);
            item.startTime = formatTime(item.use_start_time * 1000, 'yyyy-mm-dd HH:MM');
            item.endTime = formatTime(item.use_end_time * 1000, 'yyyy-mm-dd HH:MM');
        }


        let hasDisableList = true,
            valid_list = data.available_list || data.valid_list;


        valid_list.forEach(item => {
            handleItem(item, true, validId);
        });

        if(data.expired_list && data.expired_list.length > 0){
            data.expired_list.forEach(item => {
                handleItem(item, false);
                item.expireStatus = 1;
            });
            hasDisableList = false;
        }

        if(data.used_list && data.used_list.length > 0){
            data.used_list.forEach(item => {
                handleItem(item, false);
                item.usedStatus = 1;
            });
            hasDisableList = false;
        }

        if(data.disable_list && data.disable_list.length > 0){
            data.disable_list.forEach(item => {
                handleItem(item, false);
            });
            hasDisableList = false;
        }

        this.setData({
            validList: valid_list,
            usedList: data.used_list || [],
            expiredList: data.expired_list || [],
            disabledList: data.disable_list || [],
            noAnyList: valid_list.length <= 0 && hasDisableList
        })
    },

    chooseCoupon (e){

        let couponItem = e.target.dataset.item;

        this.data.validList.forEach(item => {
            if(item.id === couponItem.id){
                item.is_select = !item.is_select;
            }else{
                item.is_select = false;
            }
        });

        this.setData({
            validList: this.data.validList
        });

        //  如果相同的优惠券，点击取消
        let nowSelectCoupon = this.data.validList.find(item => {
            return item.is_select;
        });

        let storageParams = wx.getStorageSync('checkoutParams');



        storageParams.discounts_list.forEach(item => {

            if(item.code === 'VOUCHER'){
                if(nowSelectCoupon && nowSelectCoupon.id){
                    item.value = nowSelectCoupon.id;
                    item.is_use = 1;
                }else{
                    item.is_use = 0;
                }
            }

            if(item.code === 'POINTS' && globalMutex == 1){
                if(nowSelectCoupon && nowSelectCoupon.id){
                    item.is_use = 0;
                }else{
                    item.is_use = 1;
                }
            }

        });

        wx.setStorageSync('checkoutParams', storageParams);

        wx.navigateBack(1);

    },

    onUnload(){
    //    如果当前用户没有选择任何优惠券，那么返回的应该是 discount_list 的优惠券 is_use 为 0
        if(wx.getStorageSync('checkoutParams')){
            let params = wx.getStorageSync('checkoutParams'),
                chooseCoupon = this.data.validList.find(item => {
                    return item.is_select;
                });

            if(!chooseCoupon){
                params.discounts_list.find(item => {
                    if(item.code === 'VOUCHER'){
                        item.is_use = 0;
                    }
                    wx.setStorageSync('checkoutParams', params);
                })
            }
        }
    }
});