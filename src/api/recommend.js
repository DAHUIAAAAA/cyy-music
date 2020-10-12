import jsonp from 'common/js/jsonp';
import { commonParams, options, base_url } from './config';
import axios from 'axios';

export function getMusicData() {
    const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_first_yqq.fcg';

    const data = Object.assign({}, commonParams, {
        g_tk: 1588932357679,
        format: 'jsonp',
        tpl: 'v12',
        page: 'other',
        rnd: 0,
        loginUin: 0,
        hostUin: 0,
        inCharset: 'utf8',
        outCharset: 'GB2312',
        notice: 0,
        platform: 'yqq',
        needNewCode: 0
    });

    return jsonp(url, data, options);
}

function jsonCallback(data) {
    return data;
}

export function getSongList(disstid) {
    const url = base_url + '/getCdInfo';

    const data = Object.assign({}, commonParams, {
        disstid,
        type: 1,
        json: 1,
        utf8: 1,
        onlysong: 0,
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 0
    });

    return new Promise((resolve, reject) => {
        axios.get(url, { params: data }).then(res => {
            const resData = eval(res.data);
            resolve(resData)
        }).catch(err => { 
            console.log(err)
        })
    })
}

