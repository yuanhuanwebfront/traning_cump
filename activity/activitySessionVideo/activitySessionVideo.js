import {getDetailWebInfo} from '../../common/$http';
import {navigateToPath} from "../../common/common";


let wxParseObj = require('../../lib/wxParse/wxParse.js'),
    mySa = require('../../common/sa.js');

Page({
    data: {
        sessionInfo: {}
    },

    onLoad(options) {
        options.activity_course_id = options.activity_id;
        getDetailWebInfo(options, this.handleSessionInfo, 'getActivitySessionInfo');
    },

    handleSessionInfo(data) {
        this.setData({
            videoUrl: data.stream_media_cn,
            sessionName: data.session_name,
            sessionTitle: data.session_title,
            buttonText: data.button_name,
            buttonColor: data.button_color,
            linkType: data.link_type,
            link_content: data.link_content
        });

        wxParseObj.wxParse('templateDetailH5', 'html', data.introduction, this)
    },

    jumpLink() {

        mySa.trackEvent(4, {
            click_id: 1009
        });

        let url = this.data.linkType === 1 ? '../webView/webView?url=' + encodeURI(this.data.link_content) : this.data.link_content;

        navigateToPath(url);

    }

});