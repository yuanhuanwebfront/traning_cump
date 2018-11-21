Component({

    properties: {

        activityInfo: {
            type: Object,
            value: {}
        },

        showSplit: {
            type: Boolean,
            value: true
        }

    },

    data: {
        errorClass: {
            1: "error fail",          //  状态为未成功的class
            2: "error end"            //  状态为已结束的class
        }
    },

    methods: {
        toActivityDetail(e){
            let {activity_id, id} = e.target.dataset.info;
            wx.navigateTo({
                url: '/activity/activityDetail/activityDetail?activity_id=' + activity_id + '&session_id=' + id
            })
        }
    }






});