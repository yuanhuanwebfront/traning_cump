let app = getApp();
let shareImage = 'http://qiniucdn.dailyyoga.com.cn/26/8b/268bb7417d51b432419373171220a634.jpeg';

Page({

    onLoad(options) {

        wx.hideShareMenu();

        let actionInfo = wx.getStorageSync('actionInfo'),
            shareInfo = wx.getStorageSync('shareImgInfo');

        this.setData({
            globalQuery: options,
            sessionTitle: actionInfo.title ? '完成训练 ' + actionInfo.title + '！' : '恭喜你，完成训练！去看看其他伙伴的日记吧~',
            sessionName: shareInfo.session_name,
            inviteId: shareInfo.invite_euid
        });
    },

    checkDaily() {
        wx.navigateTo({
            url: '../../other/markDaily/markDaily?tab=class&shareStatus=0&yoga_o2_session_id=' + this.data.globalQuery.o2_session_id
        })
    },

    onShareAppMessage() {
        let inviteParams = this.data.inviteId ? '&invite_euid=' + this.data.inviteId : '',
            imageUrl = wx.getStorageSync('markShareImage'),
            diaryCount = wx.getStorageSync('markShareCount'),
            shareUrl = 'other/markDaily/markDaily?tab=mine&shareStatus=3&yoga_o2_session_id='
                        + this.data.globalQuery.o2_session_id
                        + inviteParams
                        + '&diaryId=' + this.data.globalQuery.id;

        return {
            title: app.globalData.userInfo.nickName + '坚持打卡第' + diaryCount +'天 ' + (this.data.sessionName || ''),
            imageUrl: imageUrl || shareImage,
            path: shareUrl
        }
    }

});