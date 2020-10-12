import Song from 'common/js/song';

export const singer = state => state.singer;
export const banner = state => {
    const banner = state.musicData.focus;
    return banner ? banner : [];
};
export const discList = state => {
    const hotdiss = state.musicData.hotdiss;
    return hotdiss ? hotdiss.list : [];
};

export const fullScreen = state => state.fullScreen;

export const playing = state => state.playing;

export const playlist = state => state.playlist;

export const sequenceList = state => state.sequenceList;

export const mode = state => state.mode;

export const currentIndex = state => state.currentIndex;

export const currentSong = state => state.playlist[state.currentIndex] || {};

export const searchHistory = state => state.searchHistory;

export const playHistory = state => {
    return state.playHistory.map(song => {
        return new Song(song);
    });
};

export const favoriteList = state => {
    return state.favoriteList.map(song => {
        return new Song(song);
    });
};

export const topList = state => state.topList;

export const disc = state => state.disc;

export const uploadList = state => state.uploadList;

export const uploadFileList = state => state.uploadFileList;
