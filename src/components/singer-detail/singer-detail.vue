<template>
    <music-list :songs="songs" :bgImage="bgImage" :title="title" :loadPercent="loadPercent"></music-list>
</template>


<script>
import MusicList from "components/music-list/music-list";
import { getSingerDetail } from "api/singer";
import { getMusicSource } from "api/song";
import { createSong } from "common/js/song";
import { ERR_OK } from "api/config";
import { songMixin } from "common/js/mixin";
import { mapGetters } from "vuex";


export default {
    mixins: [songMixin],
    components: {
        MusicList
    },
    created() {
        this._getSingerDetail();
    },
    methods: {
        _getSingerDetail() {
            if (!this.singer.id) {
                this.$router.push("/singer");
                return;
            }
            getSingerDetail(this.singer.id).then(res => {
                if (res.code === ERR_OK) {
                    this.setListLength(res.data.list);
                    this._normalizeSongs(res.data.list, "musicData");
                }
            });
        }
    },
    computed: {
        title() {
            return this.singer.name;
        },
        bgImage() {
            return this.singer.avatar;
        },
        ...mapGetters(["singer"])
    }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.singer-detail {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: $color-background;
}
</style>