import {getDetailWebInfo} from '../../common/$http';

let wxParseObj = require('../../lib/wxParse/wxParse.js');

Page({
    data: {
        sessionInfo: {}
    },

    onLoad(options){
        options.activity_course_id = options.activity_id;
        getDetailWebInfo(options, this.handleSessionInfo, 'getActivitySessionInfo');
    },


    handleSessionInfo(data){
        this.setData({
            videoUrl: data.stream_media_cn,
            sessionName: data.session_name,
            sessionTitle: data.session_title
        });

        wxParseObj.wxParse('templateDetailH5', 'html', data.session_content, this)
    }


});