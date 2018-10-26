let app = getApp();

import {wxToast, transformRpx, saveImgToLocalPath} from "../../common/common";

let tempImgPath = "";

Page({

    data: {
        imgSrc: ""
    },

    onLoad (){

        let storageInfo = wx.getStorageSync('shareImgInfo');

        this.setData({
            imgSrc: storageInfo.share_main_image
        });

    },


    saveImgPath (){
        saveImgToLocalPath(this.data.imgSrc);
    }



});