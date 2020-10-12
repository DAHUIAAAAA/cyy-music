import { playMode } from 'common/js/config';
import {
    loadSearch,
    loadFavorite,
    loadPlay
} from 'common/js/cache';

const state = {
    singer: {},
    musicData: {},
    playing: false,
    fullScreen: false,
    playlist: [],
    sequenceList: [],
    topList: [],
    disc: {},
    uploadList: {},
    uploadFileList: [],
    mode: playMode.sequence,
    currentIndex: -1,
    searchHistory: loadSearch(),
    favoriteList: loadFavorite(),
    playHistory: loadPlay()
};

export default state;