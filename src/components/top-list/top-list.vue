<template>
    <transition name="slide">
        <music-list
            :rank="rank"
            :title="title"
            :bg-image="bgImage"
            :songs="songs"
            :loadPercent="loadPercent"
        ></music-list>
    </transition>
</template>

<script>
import MusicList from "components/music-list/music-list";
import { getMusicList } from "api/rank";
import { ERR_OK } from "api/config";
import { songMixin } from "common/js/mixin";
import { mapGetters } from "vuex";

export default {
    mixins: [songMixin],
    components: {
        MusicList
    },
    data() {
        return {
            rank: true
        };
    },
    computed: {
        title() {
            return this.topList.topTitle;
        },
        bgImage() {
            if (this.songs.length) {
                return this.songs[0].image;
            }
        },
        ...mapGetters(["topList"])
    },
    created() {
        this._getMusicList();
    },
    methods: {
        _getMusicList() {
            if (!this.topList || !this.topList.id) {
                this.$router.push("/rank");
                return;
            }
            getMusicList(this.topList.id).then(res => {
                if (res.code === ERR_OK) {
                    this.setListLength(res.songlist);
                    this._normalizeSongs(res.songlist, 'data');
                }
            });
        }
    }
};
</script>

<style>
</style>