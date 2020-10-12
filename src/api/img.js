import instance from './axios';
import { img_domain, secret, img_s } from './config';
import md5 from 'js-md5';
import { param } from 'common/js/util';

function getSign(params) {
    if (!params.s || !params.app_key) return;

    let sign;

    sign = params.app_key + params.s + params.app_secrect;
    sign = md5(sign);
    sign = sign.toUpperCase();

    params.sign = sign;

    return params;
}

export function uploadImg(file) {
    const params = {
        app_key: secret.app_key,
        app_secrect: secret.app_secrect,
        s: img_s,
    }

    const resParams = getSign(params);

    let fd = new FormData();
    fd.append('file', file);

    const url = img_domain + (img_domain.indexOf('?') > -1 ? '' : '?') + param(params);

    return instance({
        method: 'post',
        url,
        data: fd
    });
}