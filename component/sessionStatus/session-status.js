import {wxToast} from '../../common/common';

Component({
    properties: {
        "sessionInfo": {
            type: Object,
            value: {}
        }
    },
    data: {
        status: {
            1: '待开始',
            2: '进行中',
            3: '已结束'
        },
        statusClass: {
            1: "status-0",
            2: "status-1",
            3: "status-2"
        }
    },

    methods: {
        toMySession(e) {

            let info = e.target.dataset.info,
                status = info.session_status,
                sessionId = info.id,
                programId = info.source_id,
                teamId = info.team_id;

            //  状态 --> 待开始 进入课程主页(报名页)          状态 --> 进行中  课程主页（进行中）
            if (status === 1) {
              if (info.canEnterRoom){
                  wx.navigateTo({
                    url: '../../session/sessionHome/sessionHome?session_id=' + sessionId + "&team_id=" + teamId + "&programId=" + programId
                  })
                }else{
                  wx.navigateTo({
                    url: '../../package/report/report?session_id=' + sessionId
                  })
                }
                
            } else if (status === 2) {
                wx.navigateTo({
                    url: '../../session/sessionHome/sessionHome?session_id=' + sessionId + "&team_id=" + teamId + "&programId=" + programId
                })
            } else if (status === 3) {
                if (info.isOnline) {
                    wx.redirectTo({
                        url: '../../package/detail/detail?id=' + sessionId + '&source=' + programId
                    })
                } else {
                    wxToast('该课程已下线');
                }
            }


        }
    }


});