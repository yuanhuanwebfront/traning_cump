import {getOrder} from '../../common/$http';
import {formatTime, wxSetNavTitle} from '../../common/common';

const app = getApp();

Page({

    onLoad (options){

        let params = {
            sid: wx.getStorageSync('sid'),
            order_id: options.orderId
        };

        wxSetNavTitle('订单详情');
        getOrder(params, this.handleOrderInfo, 'classifiedOrderInfo');

    },

    handleOrderInfo (data){

        let mainSession = data.product_list.find(item => {
            return item.source_type === 21;
        });

        if(mainSession){
            data.createTime = formatTime(mainSession.create_time * 1000, 'yyyy-mm-dd');
            data.startTime = formatTime(mainSession.start_time * 1000, 'yyyy-mm-dd');
        }

        data.discount_list.forEach(item => {
          item.disCountValue = item.discount_value.toFixed(2);
        });

        this.setData({
            orderInfo: data,
            userId: app.globalData.userInfo.uid,
            userPhone: data.product_list[0].member_mobile,
            userName: data.product_list[0].member_name
        })
    }

});