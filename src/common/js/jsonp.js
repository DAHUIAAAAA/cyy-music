import originJsonp from 'jsonp'
import { param } from './util'


export default function jsonp(url, data, options) {
    url += (url.indexOf('?') < 0 ? '?' : '') + param(data);
    return new Promise((resolve, reject) => {
        originJsonp(url, options, (err, res) => {
            if (!err) {
                resolve(res);
            } else {
                reject(err);
            }
        })
    })
}