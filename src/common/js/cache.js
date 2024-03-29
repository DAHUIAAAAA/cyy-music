import storage from 'good-storage';

const SEARCH_KEY = '__search__';
const SEARCH_MAX_LENGTH = 15;

const FAVORITE_KEY = '__favorite__';
const FAVORITE_MAX_LENGTH = 100;

const PLAY_KEY = '__play__';
const PLAY_MAX_LENGTH = 100;

function insertArray(val, arr, compare, maxLen) {
    const index = arr.findIndex(compare);
    if (index >= 0) {
        arr.splice(index, 1);
    }
    arr.unshift(val);
    if (arr.length > maxLen) {
        arr.pop();
    }
}

function deleteFromArray(arr, compare) {
    const index = arr.findIndex(compare);
    if (index > -1) {
        arr.splice(index, 1);
    }
}

export function saveSearch(query) {
    let searches = storage.get(SEARCH_KEY, []);
    insertArray(query, searches, item => item === query, SEARCH_MAX_LENGTH);
    storage.set(SEARCH_KEY, searches);
    return searches;
}

export function loadSearch(query) {
    return storage.get(SEARCH_KEY, []);
}

export function deleteSearch(query) {
    let searches = storage.get(SEARCH_KEY, []);
    deleteFromArray(searches, item => item === query);
    storage.set(SEARCH_KEY, searches);
    return searches;
}

export function clearSearch() {
    storage.remove(SEARCH_KEY);
    return [];
}

export function findFavorite(song) {
    const favoriteSongs = storage.get(FAVORITE_KEY, []);
    return favoriteSongs.findIndex(item => song.id === item.id) > -1;
}

export function saveFavorite(song) {
    let favoriteSongs = storage.get(FAVORITE_KEY, []);
    insertArray(song, favoriteSongs, item => item.id === song.id, FAVORITE_MAX_LENGTH);
    storage.set(FAVORITE_KEY, favoriteSongs);
    return favoriteSongs;
}

export function deleteFavorite(song) {
    let favoriteSongs = storage.get(FAVORITE_KEY, []);
    deleteFromArray(favoriteSongs, item => item.id === song.id);
    storage.set(FAVORITE_KEY, favoriteSongs);
    return favoriteSongs;
}

export function loadFavorite() {
    return storage.get(FAVORITE_KEY, []);
}

export function savePlay(song) {
    let songs = storage.get(PLAY_KEY, []);
    insertArray(song, songs, item => item.id === song.id, PLAY_MAX_LENGTH);
    storage.set(PLAY_KEY, songs);
    return songs;
}

export function loadPlay() {
    return storage.get(PLAY_KEY, []);
}