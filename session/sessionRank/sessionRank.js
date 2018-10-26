import {getRankInfo} from '../../common/$http';
import {formatTime, wxSetNavTitle} from '../../common/common';

let app = getApp();
let globalInfo = {};
let mySa = require('../../common/sa');
let emptyImg = "http://qiniucdn.dailyyoga.com.cn/8c/82/8c82090346ccd81acedc440c76d344e2.png";

Page({

    data: {
        rankClass: {
            0: 'first',
            1: 'second',
            2: 'third'
        },
        rankList: [],
        emptyImg
    },

    onLoad(options) {

        globalInfo = {};
        let params = {
            session_id: options.session_id
        };

        globalInfo.sessionId = options.session_id;

        wxSetNavTitle('班级排行');

        this.setData({
            isShareEnter: options.isShare || false
        });

        mySa.trackEvent(11, {
            page_id: 1012,
            pageinfo: globalInfo.sessionId
        });

        getRankInfo(params, this.handleRankData, 'getUserRankingList', '../../pages/index/index');
    },

    onShareAppMessage() {

        mySa.trackEvent(9, {
            page_id: 1012,
            pageinfo: globalInfo.sessionId
        });
        mySa.trackEvent(10, {
            page_id: 1012,
            result: 1,
            share_way: 'weixin_fri'
        });

        return {
            title: '训练营排行榜出炉，快来看看今天你排第几名',
            path: 'session/sessionRank/sessionRank?isShare=1&session_id=' + globalInfo.sessionId
        }
    },

    toMySession(){
        wx.switchTab({
            url: '../../pages/session/session'
        })
    },

    handleRankData(data) {

        let rankNum = "--",
            updateTime = "",
            noTimeWord = "数据收集中，请稍后再试";

        data.user_session_member_data.rankingData.forEach((item, idx) => {
            if (item.has_own === 1) {
                rankNum = idx + 1;
            }
            item.Thumbnail = item.Thumbnail || emptyImg;
        });

        data.user_practice_data.rankNum = rankNum;

        updateTime = data.user_session_member_data.rankingUpdate;

        this.setData({
            updateTimeInfo: updateTime === 0 ? noTimeWord : "上次更新时间 " + formatTime(updateTime * 1000, 'yyyy-mm-dd HH:MM:ss'),
            userInfo: data.user_practice_data,
            rankList: data.user_session_member_data.rankingData
        });

    }

});