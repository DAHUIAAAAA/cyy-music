<template>
    <transition name="slide">
        <music-list :title="title" :bg-image="bgImage" :songs="songs" :loadPercent="loadPercent"></music-list>
    </transition>
</template>

<script>
import MusicList from "components/music-list/music-list";
import { getSongList } from "api/recommend";
import { ERR_OK } from "api/config";
import { mapGetters } from "vuex";
import { songMixin } from "common/js/mixin";

export default {
    mixins: [songMixin],
    components: {
        MusicList
    },
    data() {
        return {
            songs: []
        };
    },
    computed: {
        title() {
            return this.disc.dissname;
        },
        bgImage() {
            return this.disc.imgurl;
        },
        ...mapGetters(["disc"])
    },
    created() {
        this._getSongList();
    },
    methods: {
        _getSongList() {
            if (!this.disc || !this.disc.dissid) {
                this.$router.push("/recommend");
                return;
            }
            getSongList(this.disc.dissid).then(res => {
                if (res.code === ERR_OK) {
                    this.setListLength(res.cdlist[0].songlist);
                    this._normalizeSongs(res.cdlist[0].songlist);
                }
            });
        }
    }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.slide-enter-active, .slide-leave-active {
    transition: all 0.3s;
}

.slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
}
</style>