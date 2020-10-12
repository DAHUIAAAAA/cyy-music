import * as types from './mutation-types';
import { getSongUrl } from 'common/js/song';

const mutation = {
    [types.SET_SINGER](state, singer) {
        state.singer = singer;
    },
    [types.SET_MUSICDATA](state, musicData) {
        state.musicData = musicData;
    },
    [types.SET_PLAYING_STATE](state, flag) {
        state.playing = flag;
    },
    [types.SET_FULL_SCREEN](state, flag) {
        state.fullScreen = flag;
    },
    [types.SET_PLAYLIST](state, list) {
        state.playlist = list;
    },
    [types.SET_SEQUENCE_LIST](state, list) {
        state.sequenceList = list;
    },
    [types.SET_PLAY_MODE](state, mode) {
        state.mode = mode;
    },
    [types.SET_CURRENT_INDEX](state, index) {
        state.currentIndex = index;
    },
    [types.SET_SEARCH_HISTORY](state, arr) {
        state.searchHistory = arr;
    },
    [types.SET_FAVORITE_LIST](state, arr) {
        state.favoriteList = arr;
    },
    [types.SET_PLAY_HISTORY](state, arr) {
        state.playHistory = arr;
    },
    [types.SET_SONG_URL](state, url) {
        const index = state.currentIndex;
        const list = state.playlist;
        list[index]['url'] = getSongUrl(url);
    },
    [types.SET_TOP_LIST](state, list) {
        state.topList = list;
    },
    [types.SET_DISC](state, item) {
        state.disc = item;
    },
    [types.SET_UPLOAD_LIST](state, item) {
        state.uploadList = item;
    },
    [types.SET_UPLOAD_FILE_LIST](state, files) {
        const mid = state.uploadList.mid;
        state.uploadFileList[mid] = files;

        const res = Object.assign({}, state.uploadFileList);
        state.uploadFileList = res;
    },
};

export default mutation;