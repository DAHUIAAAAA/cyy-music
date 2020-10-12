import * as types from './mutation-types';
import { playMode } from 'common/js/config';
import { shuffle, getUniArr } from 'common/js/util';
import {
    saveSearch,
    deleteSearch,
    clearSearch,
    saveFavorite,
    deleteFavorite,
    savePlay
} from 'common/js/cache';

function findIndex(list, song) {
    return list.findIndex(item => {
        return item.id === song.id;
    })
}

export const selectPlay = function ({ commit, state }, { list, index }) {
    commit(types.SET_SEQUENCE_LIST, list);
    commit(types.SET_PLAYLIST, list);
    commit(types.SET_CURRENT_INDEX, index);
    commit(types.SET_FULL_SCREEN, true);
    commit(types.SET_PLAYING_STATE, true);
};

export const randomPlay = function ({ commit, state }, { list }) {
    let randomList = shuffle(list);
    if (!randomList[0].url) return;
    commit(types.SET_PLAY_MODE, playMode.random);
    commit(types.SET_SEQUENCE_LIST, list);
    commit(types.SET_PLAYLIST, randomList);
    commit(types.SET_CURRENT_INDEX, 0);
    commit(types.SET_FULL_SCREEN, true);
    commit(types.SET_PLAYING_STATE, true);
};

export const insertSong = function ({ commit, state }, song) {
    // console.log(state.playlist.slice())
    let playlist = state.playlist.slice(),
        sequenceList = state.sequenceList.slice(),
        currentIndex = state.currentIndex;

    const currentSong = playlist[currentIndex],
        fpIndex = findIndex(playlist, song);

    // 向当前播放序列中插入歌曲
    currentIndex++;
    playlist.splice(currentIndex, 0, song);
    // 查找播放列表中是否有该歌曲

    if (fpIndex > -1) {  // 如果有该歌曲
        if (fpIndex > currentIndex) {
            playlist.splice(fpIndex + 1, 1);
        } else {
            playlist.splice(fpIndex, 1);
            currentIndex--;
        }
    }

    // 向顺序播放序列插入歌曲
    const currentSIndex = findIndex(sequenceList, currentSong);
    const fsIndex = findIndex(sequenceList, song);

    sequenceList.splice(currentSIndex + 1, 0, song);

    if (fsIndex > -1) {
        if (fsIndex > currentIndex) {
            sequenceList.splice(fsIndex + 1, 1);
        } else {
            sequenceList.splice(fsIndex, 1);
        }
    }

    commit(types.SET_PLAYING_STATE, true);
    commit(types.SET_PLAYLIST, playlist);
    commit(types.SET_SEQUENCE_LIST, sequenceList);
    commit(types.SET_CURRENT_INDEX, currentIndex);
    commit(types.SET_FULL_SCREEN, true);
}

export const deleteSong = function ({ commit, state }, song) {
    let playlist = state.playlist.slice(),
        sequenceList = state.sequenceList.slice(),
        currentIndex = state.currentIndex

    const pIndex = findIndex(playlist, song),
        sIndex = findIndex(sequenceList, song);

    playlist.splice(pIndex, 1);
    sequenceList.slice(sIndex, 1);

    if (currentIndex > pIndex) {
        currentIndex--;
    } else if (currentIndex === playlist.length) {
        currentIndex = 0;
    }

    commit(types.SET_PLAYLIST, playlist);
    commit(types.SET_SEQUENCE_LIST, sequenceList);
    commit(types.SET_CURRENT_INDEX, currentIndex);
    if (!playlist.length) {
        commit(types.SET_PLAYING_STATE, false);
    } else {
        commit(types.SET_PLAYING_STATE, true);
    }
}

export const deleteSongList = function ({ commit }) {
    commit(types.SET_PLAYLIST, []);
    commit(types.SET_CURRENT_INDEX, -1);
    commit(types.SET_SEQUENCE_LIST, []);
    commit(types.SET_PLAYING_STATE, false);
}

export const saveSearchHistory = function ({ commit }, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query));
}

export const deleteSearchHistory = function ({ commit }, query) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query));
}

export const clearSearchHistory = function ({ commit }) {
    commit(types.SET_SEARCH_HISTORY, clearSearch());
}

export const saveFavoriteList = function ({ commit }, song) {
    commit(types.SET_FAVORITE_LIST, saveFavorite(song));
}

export const deleteFavoriteList = function ({ commit }, song) {
    commit(types.SET_FAVORITE_LIST, deleteFavorite(song));
}

export const savePlayHistory = function ({ commit }, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song));
}

export const uploadFile = function ({ commit, state }, files) {
    let mid = state.uploadList.mid,
        list = state.uploadFileList[mid];
        
    files = files.slice();

    if (!list) {
        commit(types.SET_UPLOAD_FILE_LIST, files);
    } else {
        const fileList = state.uploadFileList[mid].slice(),
            uniArr = getUniArr(fileList, files);

        commit(types.SET_UPLOAD_FILE_LIST, uniArr);
    }
}