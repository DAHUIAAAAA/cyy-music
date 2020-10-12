<template>
    <div class="music-list">
        <!-- 返回按钮 -->
        <div class="back" @click="back">
            <i class="icon-back"></i>
        </div>
        <!-- 标题 -->
        <h1 class="title" v-html="title"></h1>
        <!-- 背景墙 -->
        <div class="bg-image" :style="bgStyle" ref="bgImage">
            <div class="play-wrapper">
                <div ref="playBtn" v-show="songs.length" class="play" @click="random">
                    <i class="icon-play"></i>
                    <span class="text">随机播放全部</span>
                </div>
            </div>
            <!-- 遮罩层 -->
            <div class="filter" ref="filter"></div>
        </div>
        <!-- 跟随滚动层 -->
        <div class="bg-layer" ref="layer"></div>
        <scroll
            :data="songs"
            @scroll="scroll"
            :listen-scroll="listenScroll"
            :probe-type="probeType"
            class="list"
            ref="scroll"
        >
            <div class="song-list-wrapper">
                <song-list :songs="songs" :rank="rank" @select="selectItem"></song-list>
            </div>
            <div v-show="!songs.length" class="loading-container">
                <loading :title="getPercent()"></loading>
            </div>
        </scroll>
    </div>
</template>

<script>
import Scroll from "base/scroll/scroll";
import SongList from "base/song-list/song-list";
import Loading from "base/loading/loading";
import { prefixStyle } from "common/js/dom";
import { mapActions, mapGetters } from "vuex";
import { playlistMixin } from "common/js/mixin";

const transform = prefixStyle("transform");
const RESERVED_HEIGH = 40; // 保留高度为40px

export default {
    mixins: [playlistMixin],
    components: {
        Scroll,
        SongList,
        Loading
    },
    props: {
        bgImage: {
            type: String,
            default: ""
        },
        songs: {
            type: Array,
            default: () => []
        },
        title: {
            type: String,
            default: ""
        },
        rank: {
            type: Boolean,
            default: false
        },
        loadPercent: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            scrollY: 0
        };
    },
    created() {
        this.probeType = 3;
        this.listenScroll = true;
    },
    mounted() {
        this.imageHeight = this.$refs.bgImage.clientHeight;
        this.$refs.scroll.$el.style.top = `${this.imageHeight}px`;
        this.minTranslateY = -this.imageHeight + RESERVED_HEIGH;
    },
    computed: {
        bgStyle() {
            return `background-image:url(${this.bgImage})`;
        },
        ...mapGetters(["fullScreen"])
    },
    methods: {
        ...mapActions(["selectPlay", "randomPlay"]),
        getPercent() {
            return (this.loadPercent ? this.loadPercent : 0) + '%';
        },
        back() {
            this.$router.back();
        },
        selectItem(item, index) {
            if (!this.songs[index].url) return;
            this.selectPlay({
                list: this.songs,
                index
            });
        },
        random() {
            this.randomPlay({
                list: this.songs
            });
        },
        scroll(pos) {
            this.scrollY = pos.y;
        },
        layerScroll(newY) {
            const layer = this.$refs.layer,
                minTranslateY = this.minTranslateY,
                translateY = Math.max(newY, minTranslateY);

            layer.style[transform] = `translate(0, ${translateY}px)`;
        },
        changeBackgroundStyle(newY) {
            const bgImage = this.$refs.bgImage,
                btn = this.$refs.playBtn,
                filter = this.$refs.filter;

            let zIndex = 0,
                scale = 1, // 图片放大缩小
                blur = 0; // 图片高斯模糊

            const percent = Math.abs(newY / this.imageHeight);

            if (newY > 0) {
                scale = 1 + percent;
                zIndex = 10;
            } else {
                blur = Math.min(20 * percent, 20);
            }

            if (newY <= this.minTranslateY) {
                zIndex = 10;
                bgImage.style.height = RESERVED_HEIGH + "px";
                bgImage.style.paddingTop = 0;
                btn.style.display = "none";
            } else {
                bgImage.style.height = 0;
                bgImage.style.paddingTop = "70%";
                btn.style.display = "block";
            }

            filter.style.backdrop = `blur(${blur}px)`;
            bgImage.style.zIndex = zIndex;
            bgImage.style[transform] = `scale(${scale})`;
        }
    },
    watch: {
        scrollY(newY) {
            this.layerScroll(newY);
            this.changeBackgroundStyle(newY);
        }
    }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.music-list {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: $color-background;

    .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;

        .icon-back {
            display: block;
            padding: 10px;
            font-size: $font-size-large-x;
            color: $color-theme;
        }
    }

    .title {
        position: absolute;
        top: 0;
        left: 10%;
        z-index: 40;
        width: 80%;
        no-wrap();
        text-align: center;
        line-height: 40px;
        font-size: $font-size-large;
        color: $color-text;
    }

    .bg-image {
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 70%;
        transform-origin: top;
        background-size: cover;

        .play-wrapper {
            position: absolute;
            bottom: 20px;
            width: 100%;
            z-index: 50;

            .play {
                box-sizing: border-box;
                width: 135px;
                padding: 7px 0;
                margin: 0 auto;
                text-align: center;
                border: 1px solid $color-theme;
                color: $color-theme;
                border-radius: 100px;
                font-size: 0;

                .icon-play {
                    display: inline-block;
                    vertical-align: middle;
                    margin-right: 6px;
                    font-size: $font-size-medium-x;
                }

                .text {
                    display: inline-block;
                    vertical-align: middle;
                    font-size: $font-size-small;
                }
            }
        }

        .filter {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(7, 17, 27, 0.4);
        }
    }

    .bg-layer {
        position: relative;
        height: 100%;
        background: $color-background;
    }

    .list {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
        background: $color-background;

        .song-list-wrapper {
            padding: 20px 30px;
        }

        .loading-container {
            position: absolute;
            width: 100%;
            top: 50%;
            transform: translateY(-50%);
        }
    }
}
</style>