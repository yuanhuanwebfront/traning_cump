import {wxSetNavTitle} from '../../common/common';
import AREA from '../buy/area';


Page({
    
    data: {
        showPicker: false,
        areaInfo: {},
        areaName: [],
        sessionId: '',
        btnDisable: true,
        areaData: AREA
    },

    onLoad (options){

        let saveAddress = wx.getStorageSync('userAddress');

        wxSetNavTitle("地址修改");

        this.setData({
            ...saveAddress,
            sessionId: options.sessionId
        }, this.checkInfoIsRight)
    },

    setUserName (e){
        this.setData({
            "addressInfo.userName": e.detail.value
        });
        this.checkInfoIsRight();
    },

    setUserPhone (e){
        this.setData({
            "addressInfo.userPhone": e.detail.value
        });
        this.checkInfoIsRight();
    },

    setUserWeChat (e){
        this.setData({
            "addressInfo.userWeChat": e.detail.value
        });
        this.checkInfoIsRight();
    },

    setUserAddress (e){
        this.setData({
            "addressInfo.userAddress": e.detail.value
        })
    },

    showPicker (){
        this.setData({
            showPicker: true
        })
    },

    cancelPicker(e) {
        this.setData({
            showPicker: e.detail
        })
    },

    confirmPicker(e) {
        this.setData({
            showPicker: e.detail.showPicker,
            areaName: e.detail.nameList,
            areaInfo: {
                pId: e.detail.idList[0],
                cId: e.detail.idList[1],
                aId: e.detail.idList[2]
            }
        });
    },

    changeAddressInfo(){

        let storageInfo = {
            addressInfo: this.data.addressInfo,
            areaInfo: this.data.areaInfo,
            areaName: this.data.areaName,
        };

        wx.setStorageSync('userAddress', storageInfo);
        wx.navigateBack(1);

    },

    //  检测用户信息是否正确
    checkInfoIsRight (){
        let info = this.data.addressInfo;
        this.setData({
            btnDisable: (!info.userName || !info.userWeChat || !(/^1[0-9]{10}$/.test(info.userPhone)))
        })
    }
    
});