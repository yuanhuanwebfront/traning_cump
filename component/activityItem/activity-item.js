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

    methods: {
        toActivityDetail(){
            wx.navigateTo({
                url: '/activity/activityDetail/activityDetail'
            })
        }
    }






});