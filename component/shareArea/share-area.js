//  分享给好友和分享到朋友圈的组件
//  @method 点击分享朋友圈的函数


Component({

    properties: {
      textColor: {
          type: String,
          value: '#666'
      }
    },

    methods: {
        shareFriend() {
            this.triggerEvent('sharefriend');
        }
    },

    externalClasses: ['share-class']
});