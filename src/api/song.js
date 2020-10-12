import { commonParams, options, base_url } from './config';
import axios from 'axios';
import jsonp from 'common/js/jsonp';

export function getLyric(id, mid) {
  const url = `https://api.darlin.me/music/lyric/${id}/?`;

  return jsonp(url, {}, {param: 'callback'})
};

export function getMusicSource(mid) {
  const url = base_url + '/getSongVkey';


  const data = Object.assign({}, commonParams, {
    songmid: mid,
    g_tk: 5381,
    loginUin: 0,
    hostUin: 0,
    format: 'json',
    platform: 'yqq.json',
    needNewCode: 0,
    data: { "req_0": { "module": "vkey.GetVkeyServer", "method": "CgiGetVkey", "param": { "guid": "9244517832", "songmid": [mid], "songtype": [0], "uin": "0", "loginflag": 1, "platform": "20" } }, "comm": { "uin": 0, "format": "json", "ct": 24, "cv": 0 } }
  });

  return axios.get(url, { params: data });
};