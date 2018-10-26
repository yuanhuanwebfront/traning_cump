/*
*   一个为了添加微信原生按钮的弹窗组件，组件的确认按钮可以支持各种配置，包括分享，打开设置，打开客服操作
*   @prop   btnType     (String)       按钮类型
*   @prop   title       (String)       弹窗的标题
*   @prop   content     (String)       弹窗的内容
*   @prop   showStatus  (Boolean)      弹窗是否显示
*   @prop   cancelText  (String)       取消按钮文案
*   @prop   confirmText (String)       确认按钮文案
*   @prop   confirmMethod
*/

Component({

    properties: {
        btnType: String,
        title: String,
        content: String,
        showStatus: {
            type: Boolean,
            value: true
        },
        cancelText: {
            type: String,
            value: '取消'
        },
        confirmText: {
            type: String,
            value: '确认'
        }
    },

    methods: {

        cancel (){
            this.setData({
                showStatus: false
            })
        }

    }


});