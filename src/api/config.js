export const commonParams = {
    g_tk: 1928093487,
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: 0,
    format: 'jsonp'
};

export const options = {
    param: 'jsonpCallback'
};

export const ERR_OK = 0;

export const img_domain = 'http://hn216.api.yesapi.cn/';

export const secret = {
    app_key: '45F828ADEDF1568300C1046D56D1D949',
    app_secrect: 'zW9ZNJpsdGP7BPmqGuT6UyK5Jpnf7ZNpWZhDorgdIwkjycIIruVgak0nAMvKEfpUjvCGH6wQO'
}

export const img_s = 'App.CDN.UploadImg';

export const base_url = process.env.NODE_ENV === 'production' ? `/api` : 'http://localhost:3000/api';