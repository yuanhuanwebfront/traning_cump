let sa = require('../lib/sa/sensorsdata.min.js');

const EVENT_CONFIG = {
    1: 'start_action',
    2: 'end_action',
    3: 'exit_action',
    4: 'click_general',
    5: 'view_deal_detail',
    6: 'click_deal_detail',
    7: 'view_deal_order',
    8: 'click_deal_order',
    9: 'share_general',
    10: 'share_success_general',
    11: 'pageview_general',
    12: 'submit_o2_order',
    13: 'purchase_o2_order',
};

const PREFIX_WORD = 'mini_';

function trackEvent(type, detail){
    sa.track(PREFIX_WORD + EVENT_CONFIG[type], detail);
}

module.exports.trackEvent = trackEvent;

