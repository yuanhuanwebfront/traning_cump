import {getDetailWebInfo} from '../../common/$http';
import {formatTime} from '../../common/common';

let mySa = require('../../common/sa.js');

Page({

    data: {
        showJoinSessionBtn: true,
        showEndSessionBtn: false,
        sessionList: [],
    },

    onLoad() {

        let sid = wx.getStorageSync('sid');
        mySa.trackEvent(11, {page_id: 1001});
        if (!sid) {
            wx.navigateTo({
                url: '../login/login'
            })
        }

    },

    onShow() {
        if (wx.getStorageSync('sid')) {
            getDetailWebInfo({}, this.handleSessionInfo, 'getUserSessionList');
        }
    },

    handleSessionInfo(data) {

        let list = [];

        data.forEach(item => {
            let info = item.o2_session_info,
                obj = {
                    id: info.id,
                    title: info.session_name + (info.periods ? ' 第' + info.periods + '期' : ''),
                    canEnterRoom: info.session_link_type === 21 || info.session_link_type === 3,
                    source_id: info.source_id,
                    session_img: info.after_apply_image,
                    session_all_time: info.session_days,
                    session_start_time: formatTime(info.session_start_time * 1000, 'yyyy-mm-dd'),
                    session_practicing_time: info.pass_days,
                    session_status: (new Date().getTime() / 1000) - info.session_start_time > 0 ? 2 : 1
                };

            if (item.partner_info.partner_team && item.partner_info.partner_team.team_id) {
                obj.team_id = item.partner_info.partner_team.team_id;
            }

            list.push(obj);
        });

        this.setData({
            sessionList: list
        })
    },

    toSessionEndList() {
        wx.navigateTo({
            url: '../../session/sessionEndList/sessionEndList'
        })
    },

    joinSession() {
        wx.switchTab({
            url: '../index/index'
        })
    }


});