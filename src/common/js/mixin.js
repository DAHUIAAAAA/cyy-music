import { mapGetters, mapMutations, mapActions } from 'vuex';
import { SET_PLAY_MODE } from '../../store/mutation-types';
import { playMode } from 'common/js/config';
import { shuffle } from "common/js/util";
import { getMusicSource } from "api/song";
import { createSong } from "common/js/song";

export const playlistMixin = {
    data() {
        return {
            refreshScreen: false
        }
    },
    computed: {
        ...mapGetters([
            'playlist',
            'fullScreen'
        ])
    },
    mounted() {
        this.handlePlaylist(this.playlist);
    },
    activated() {
        this.handlePlaylist(this.playlist);
    },
    methods: {
        handlePlaylist(playlist) {
            setTimeout(() => {
                const bottom = playlist.length > 0 ? '60px' : '';
                this.$el.style.bottom = bottom;
                if (this.$refs.scroll) {
                    this.$refs.scroll.refresh();
                }
            }, 20);
        }
    },
    watch: {
        fullScreen(newVal) {
            if (!newVal && this.playlist.length && !this.refreshScreen) {
                this.refreshScreen = true;
                this.handlePlaylist(this.playlist);
            }
        }
    }
}

export const searchMixin = {
    data() {
        return {
            query: '',
            refreshDelay: 120
        }
    },
    computed: {
        ...mapGetters([
            'searchHistory'
        ])
    },
    methods: {
        onQueryChange(query) {
            this.query = query;
        },
        saveSearch() {
            this.saveSearchHistory(this.query);
        },
        blurInput() {
            this.$refs.searchBox.blur();
        },
        addQuery(query) {
            this.$refs.searchBox.setQuery(query);
        },
        ...mapActions([
            'saveSearchHistory',
            'deleteSearchHistory'
        ])
    }
}

export const playerMixin = {
    data() {
        return {
            modeNumber: 0
        }
    },
    computed: {
        iconMode() {
            return this.mode === playMode.sequence ?
                'icon-sequence'
                : this.mode === playMode.loop
                    ? 'icon-loop'
                    : 'icon-random'
        },
        favoriteIcon() {
            return this.getFavoriteIcon(this.currentSong);
        },
        ...mapGetters([
            "currentSong",
            "playlist",
            "sequenceList",
            "mode",
            "favoriteList"
        ])
    },
    methods: {
        toggleFavorite(song) {
            if (this.isFavorite(song)) {
                this.deleteFavoriteList(song);
            } else {
                this.saveFavoriteList(song);
            }
        },
        getFavoriteIcon(song) {
            return this.isFavorite(song)
                ? 'icon-favorite'
                : 'icon-not-favorite';
        },
        isFavorite(song) {
            const index = this.favoriteList
                .findIndex(item => item.id === song.id);
            return index > -1;
        },
        changeMode() {
            this.modeNumber++;
            const mode = this.modeNumber % 3;

            this.setPlayMode(mode);

            let list = [];
            if (mode === playMode.random) {
                list = shuffle(this.sequenceList);
            } else {
                list = this.sequenceList;
            }
            this._resetCurrentIndex(list);
            this.setPlaylist(list);
        },
        _resetCurrentIndex(list) {
            const index = list.findIndex(
                item => item.id === this.currentSong.id
            );
            this.setCurrentIndex(index);
        },
        ...mapActions([
            'saveFavoriteList',
            'deleteFavoriteList'
        ]),
        ...mapMutations({
            setPlayingState: "SET_PLAYING_STATE",
            setCurrentIndex: "SET_CURRENT_INDEX",
            setPlayMode: "SET_PLAY_MODE",
            setPlaylist: "SET_PLAYLIST"
        }),
    }

}

export const songMixin = {
    data() {
        return {
            songs: [],
            count: 0,
            listLength: 0
        }
    },
    computed: {
        loadPercent() {
            return Math.floor((this.count / this.listLength) * 100);
        },
    },
    methods: {
        setListLength(list) {
            this.listLength = list.length;
        },
        _normalizeSongs(list, path) {
            let ret = [];
            this.count = 0;

            for (let i = 0; i < list.length; i++) {
                const data = path ? list[i][path] : list[i];
                getMusicSource(data.songmid)
                    .then(res => {
                        this.count++;
                        const url = res.data.req_0.data.midurlinfo[0] &&
                            res.data.req_0.data.midurlinfo[0].purl;
                        if (url) {
                            ret.push(createSong(data, url));
                        }
                        if (this.count === list.length) {
                            this.songs = ret;
                        }
                    })
                    .catch(err => {
                        this.count++;
                        if (this.count === list.length) {
                            this.songs = ret;
                        }
                    });
            }
        }
    }
}