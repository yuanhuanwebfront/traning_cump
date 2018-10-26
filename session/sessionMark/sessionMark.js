import {sendRequest, uploadImage, wxToast} from '../../common/common';
import {diaryRequest, NETWORK_ERROR_MSG} from '../../common/$http';

let app = getApp();

Page({

    data: {
        uploadImageArr: [],
        hasContent: false,
        contentLength: 0,
        dailyText: '',
        globalQuery: {},
        ranking_percentage: 0
    },

    toRank() {
        wx.navigateTo({
            url: '../sessionRank/sessionRank?sessionId=' + this.data.sessionId + "&programId=" + this.data.programId
        })
    },

    onLoad(options) {

        this.setData({
            sessionInfo: wx.getStorageSync('actionInfo'),
            globalQuery: options
        });

    },

    onShow() {
        if (this.data.globalQuery.yoga_o2_session_id) {
            this.getPercentNumber();
        }
    },

    uploadImage() {
        let vm = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            success(res) {

                let imgPath = res.tempFilePaths[0];

                uploadImage(imgPath, res => {
                    vm.setData({
                        uploadImageArr: [res.url_qiniu]
                    })
                });

            }
        })
    },

    getPercentNumber() {
        wx.showLoading({mask: true});
        let vm = this,
            params = {
                yoga_o2_session_id: this.data.globalQuery.yoga_o2_session_id,
                mark_location: this.data.globalQuery.session_id ? 1 : 2
            };

        if (this.data.globalQuery.mark_uid) params.mark_uid = this.data.globalQuery.mark_uid;

        diaryRequest(params, 'getCreateInfo', this.handlePercentInfo, 'GET', reLoginFn);

        function reLoginFn() {
            //    先清除sid和session_key再获取一次session_key再跳到登录页

            wx.showModal({
                title: '提示',
                content: '小程序账号与APP不一致，请重新登录后打卡',
                cancelText: '取消',
                confirmText: '重新登录',
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


        }

    },

    handlePercentInfo(data) {
        this.setData({
            percentNumber: data.ranking_percentage
        })
    },

    setContent(e) {

        let {value} = e.detail;

        if (value.length >= 300) {
            wxToast('打卡日记最多支持300字哦~');
        }

        this.setData({
            hasContent: !!value.trim(),
            dailyText: value,
            contentLength: value.length
        })

    },

    deleteImage(e) {
        this.setData({
            uploadImageArr: []
        });
    },

    submit() {

        let vm = this,
            params = {
                content: this.data.dailyText,
                images: JSON.stringify(this.data.uploadImageArr),
                ...this.data.globalQuery,
            };

        wx.showLoading({mask: true});

        if (this.data.dailyText.trim().length < 5) {
            wxToast('心得少于5个字：请认真填写哦');
            return;
        }

        diaryRequest(params, 'createDiary', res => {
            wx.hideLoading();
            wx.setStorageSync('markShareImage', vm.data.uploadImageArr[0]);
            wx.setStorageSync('markShareCount', res.user_diary_count);
            wx.redirectTo({
                url: '../sessionMarkSuccess/sessionMarkSuccess?session_id=' + this.data.globalQuery.session_id
                + '&o2_session_id=' + this.data.globalQuery.yoga_o2_session_id
                + '&id=' + res.id
                + '&invite_euid=' + res.invite_euid
            });
        });

    }

});