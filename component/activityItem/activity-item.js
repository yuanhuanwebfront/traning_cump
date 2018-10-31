Component({

    options: {
        addGlobalClass: true
    },

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
        toActivityDetail(){
            wx.navigateTo({
                url: '/activity/activityDetail/activityDetail'
            })
        }
    }






});