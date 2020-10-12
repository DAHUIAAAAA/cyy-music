<template>
    <div class="player" v-show="playlist.length">
        <transition
            name="normal"
            @enter="enter"
            @after-enter="afterEnter"
            @leave="leave"
            @after-leave="afterLeave"
        >
            <!-- 全屏播放器 -->
            <div class="normal-player" v-show="fullScreen">
                <div class="background">
                    <img width="100%" height="100%" :src="songImage" @error="errorLoadImg" alt />
                </div>
                <div class="top">
                    <div class="back" @click="back">
                        <i class="icon-back"></i>
                    </div>
                    <h1 class="title" v-html="currentSong.name"></h1>
                    <h2 class="subtitle" v-html="currentSong.singer"></h2>
                </div>
                <div
                    class="middle"
                    @touchstart.prevent="middleTouchStart"
                    @touchmove.prevent="middleTouchMove"
                    @touchend="middleTouchEnd"
                >
                    <!-- 左侧cd部分 -->
                    <div class="middle-l" ref="middleL">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd" ref="imageWrapper">
                                <img
                                    class="image"
                                    :src="currentSong.image"
                                    @error="errorLoadImg"
                                    ref="image"
                                />
                            </div>
                        </div>
                        <div class="playing-lyric-wrapper">
                            <div class="playing-lyric">{{playingLyric}}</div>
                        </div>
                    </div>
                    <!-- 右侧歌词部分 -->
                    <scroll
                        class="middle-r"
                        ref="lyricList"
                        :data="currentLyric && currentLyric.lines"
                    >
                        <div class="lyric-wrapper">
                            <div class="lyric-wrapper">
                                <p
                                    ref="lyricLine"
                                    class="text"
                                    :class="{'current': currentLineNum === index}"
                                    v-for="(line, index) in currentLyric.lines"
                                    :key="line.key"
                                >{{line.txt}}</p>
                            </div>
                        </div>
                    </scroll>
                </div>
                <div class="bottom">
                    <div class="dot-wrapper">
                        <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
                        <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
                    </div>
                    <!-- 进度条 -->
                    <div class="progress-wrapper">
                        <span class="time time-l">{{format(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar
                                :percent="percent"
                                ref="progressBar"
                                @percentChange="onProgressBarChange"
                                @percentChanging="onProgressBarChanging"
                            ></progress-bar>
                        </div>
                        <span class="time time-r">{{format(currentSong.duration)}}</span>
                    </div>
                    <!-- 播放、倒退、前进等图标 -->
                    <div class="operators">
                        <div class="icon i-left">
                            <i :class="iconMode" @click="changeMode"></i>
                        </div>
                        <div class="icon i-left" :class="disableCls">
                            <i class="icon-prev" @click="prev"></i>
                        </div>
                        <div class="icon i-center" :class="disableCls">
                            <i :class="playIcon" @click="togglePlaying"></i>
                        </div>
                        <div class="icon i-right" :class="disableCls">
                            <i class="icon-next" @click="next"></i>
                        </div>
                        <div class="icon i-right">
                            <i
                                class="icon-not-favorite"
                                :class="favoriteIcon"
                                @click="toggleFavorite(currentSong)"
                            ></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <!-- 迷你播放器 -->
        <transition name="mini">
            <div class="mini-player" v-show="!fullScreen" @click="open">
                <div class="icon">
                    <img width="40" height="40" :src="songImage" @error="errorLoadImg" alt />
                </div>
                <div class="text">
                    <h2 class="name" v-html="currentSong.name"></h2>
                    <p class="desc" v-html="currentSong.singer"></p>
                </div>
                <div class="control">
                    <progress-circle :radius="radius" :percent="percent">
                        <i class="icon-mini" :class="miniIcon" @click.stop="togglePlaying"></i>
                    </progress-circle>
                </div>
                <div class="control" @click.stop="showPlaylist">
                    <i class="icon-playlist"></i>
                </div>
            </div>
        </transition>
        <playlist ref="playlist"></playlist>
        <audio
            :src="currentSong.url"
            @canplay="ready"
            @ended="end"
            @timeupdate="updateTime"
            @error="audioError"
            ref="audio"
        ></audio>
    </div>
</template>

<script>
import Scroll from "base/scroll/scroll";
import ProgressBar from "base/progress-bar/progress-bar";
import ProgressCircle from "base/progress-circle/progress-circle";
import Playlist from "components/playlist/playlist";
import { mapGetters, mapMutations, mapActions } from "vuex";
import { playMode } from "common/js/config";
import { prefixStyle } from "common/js/dom";
import { decode } from "common/js/util";
import Lyric from "common/js/lyric";
import animations from "create-keyframe-animation";
import { getLyric } from "api/song";
import { playerMixin } from "common/js/mixin";
import { getMusicSource } from "api/song";
import { findFavorite } from "common/js/cache";

const transform = prefixStyle("transform"),
    transitionDuration = prefixStyle("transitionDuration");

export default {
    mixins: [playerMixin],
    components: {
        ProgressBar,
        ProgressCircle,
        Scroll,
        Playlist
    },
    data() {
        return {
            currentTime: 0,
            songReady: false,
            radius: 32,
            playingLyric: "",
            currentLyric: {},
            currentShow: "cd",
            currentLineNum: 0,
            defaultImg: require("common/image/default.png")
        };
    },
    created() {
        this.modeNumber = 0;
    },
    computed: {
        playIcon() {
            return this.playing ? "icon-pause" : "icon-play";
        },
        percent() {
            return this.currentTime / this.currentSong.duration;
        },
        miniIcon() {
            return this.playing ? "icon-pause-mini" : "icon-play-mini";
        },
        disableCls() {
            return this.songReady ? "" : "disable";
        },
        songImage() {
            return this.currentSong.image
                ? this.currentSong.image
                : this.defaultImg;
        },
        ...mapGetters(["fullScreen", "playing", "currentIndex"])
    },
    methods: {
        ...mapMutations({
            setFullScreen: "SET_FULL_SCREEN",
            setSongUrl: "SET_SONG_URL"
        }),
        ...mapActions(["savePlayHistory"]),
        audioError(e) {
            // url过期, 重新获取
            getMusicSource(this.currentSong.mid).then(res => {
                const url = res.data.req_0.data.midurlinfo[0].purl;
                this.setSongUrl(url);
                this.savePlayHistory(this.currentSong);
                if (findFavorite(this.currentSong)) {
                    this.saveFavoriteList(this.currentSong);
                }
            });
        },
        showPlaylist() {
            this.$refs.playlist.show();
        },
        errorLoadImg(e) {
            e.target.src = this.defaultImg;
        },

        onProgressBarChange(percent) {
            const currentTime = this.currentSong.duration * percent;
            this.currentTime = this.$refs.audio.currentTime = currentTime;
            if (!this.playing) this.togglePlaying();
            if (this.currentLyric) this.currentLyric.play(currentTime * 1000);
        },
        onProgressBarChanging(percent) {
            this.currentTime = this.currentTime * percent;
        },
        updateTime(e) {
            this.currentTime = e.target.currentTime;
        },
        togglePlaying() {
            if (!this.songReady) return;
            const audio = this.$refs.audio;
            this.setPlayingState(!this.playing);
            if (this.currentLyric.togglePlay) {
                this.currentLyric.togglePlay();
            }
        },
        _getPosAndScale() {
            const paddingLeft = 40,
                paddingBottom = 30,
                paddingTop = 80,
                targetWidth = 40,
                width = window.innerWidth * 0.8,
                x = -(window.innerWidth / 2 - paddingLeft),
                y = window.innerHeight - paddingTop - width / 2 - paddingBottom,
                scale = targetWidth / width;

            return {
                x,
                y,
                scale
            };
        },
        enter(el, done) {
            const { x, y, scale } = this._getPosAndScale();

            const animation = {
                0: {
                    transform: `translate(${x}px, ${y}px) scale(${scale})`
                },
                60: {
                    transform: `translate(0,0,0) scale(1.1)`
                },
                100: {
                    transform: `translate(0,0,0) scale(1)`
                }
            };

            animations.registerAnimation({
                name: "move",
                animation,
                presets: {
                    duration: 400,
                    easing: "linear"
                }
            });

            animations.runAnimation(this.$refs.cdWrapper, "move", done);
        },
        afterEnter() {
            // 取消动画
            animations.unregisterAnimation("move");
            this.$refs.cdWrapper.style.animation = "";
        },
        leave(el, done) {
            this.$refs.cdWrapper.style.transition = "all 0.4s";

            const { x, y, scale } = this._getPosAndScale();
            this.$refs.cdWrapper.style[
                transform
            ] = `translate(${x}px, ${y}px) scale(${scale})`;

            this.$refs.cdWrapper.addEventListener("transitionend", () => {
                done();
            });
        },
        afterLeave() {
            this.$refs.cdWrapper.style.transition = "";
            this.$refs.cdWrapper.style[transform] = "";
        },
        prev() {
            if (!this.songReady) return;
            let index = this.currentIndex - 1;
            if (index === -1) index = this.playlist.length - 1;
            this.setCurrentIndex(index);
            if (!this.playing) this.togglePlaying();
        },
        next() {
            if (!this.songReady) return;
            let index = this.currentIndex + 1;
            if (index === this.playlist.length) index = 0;
            this.setCurrentIndex(index);
            if (!this.playing) this.togglePlaying();
        },
        back() {
            this.setFullScreen(false);
        },
        open() {
            this.setFullScreen(true);
        },
        ready() {
            clearTimeout(this.timer);
            this.songReady = true;
            this.canLyricPlay = true;
            this.savePlayHistory(this.currentSong);
            this.$refs.audio.play();
            if (this.currentLyric.lines) {
                this.currentLyric.play(this.currentTime * 1000);
            }
        },
        end() {
            if (this.mode === playMode.loop) {
                this.loop();
            } else {
                this.next();
            }
        },
        loop() {
            this.$refs.audio.currentTime = 0;
            this.$refs.audio.play();
        },
        format(time) {
            time = time | 0;
            const minutes = (time / 60) | 0,
                seconds = this._pad(time % 60);

            return `${minutes}:${seconds}`;
        },
        _pad(time) {
            let len = time.toString().length;

            if (len < 2) {
                return "0" + time;
            } else {
                return time;
            }
        },
        _getLyric() {
            const song = this.currentSong;

            getLyric(song.id, song.mid).then(res => {
                if (res.lyric) {
                    const lyric = decode(res.lyric);
                    this.currentLyric = new Lyric(lyric, this.handleLyric);
                    if (this.canLyricPlay) {
                        this.currentLyric.play(this.currentTime * 1000);
                        if (!this.playing) this.currentLyric.togglePlay();
                    }
                }
            });
        },
        handleLyric({ lineNum, txt }) {
            this.currentLineNum = lineNum;

            if (lineNum > 5) {
                const lineEl = this.$refs.lyricLine[lineNum - 5];
                this.$refs.lyricList.scrollToElement(lineEl, 1000);
            } else {
                this.$refs.lyricList.scrollTo(0, 0, 1000);
            }

            this.playingLyric = txt;
        },
        middleTouchStart(e) {
            this.touch = {};
            this.touch.initated = true;
            const touch = e.touches[0];
            this.touch.startX = touch.pageX;
            this.touch.startY = touch.pageY;
        },
        middleTouchMove(e) {
            if (!this.touch.initated) return;

            const touch = e.touches[0],
                deltaX = touch.pageX - this.touch.startX,
                deltaY = touch.pageY - this.touch.startY;

            if (Math.abs(deltaY) > Math.abs(deltaX)) return;

            const left = this.currentShow === "cd" ? 0 : -window.innerWidth,
                offsetWidth = Math.min(
                    0,
                    Math.max(-window.innerWidth, left + deltaX)
                );

            this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
            this.$refs.lyricList.$el.style[transitionDuration] = 0;
            this.$refs.lyricList.$el.style[
                transform
            ] = `translate(${offsetWidth}px, 0)`;
            this.$refs.middleL.style[transitionDuration] = 0;
            this.$refs.middleL.style.opacity = 1 - this.touch.percent;
        },
        middleTouchEnd() {
            let opacity, offsetWidth;

            if (this.currentShow === "cd") {
                if (this.touch.percent > 0.1) {
                    opacity = 0;
                    offsetWidth = -window.innerWidth;
                    this.currentShow = "lyric";
                } else {
                    opacity = 1;
                    offsetWidth = 0;
                }
            } else {
                if (this.touch.percent < 0.9) {
                    opacity = 1;
                    offsetWidth = 0;
                    this.currentShow = "cd";
                } else {
                    opacity = 0;
                    offsetWidth = -window.innerWidth;
                }
            }

            const duration = 300;
            this.$refs.lyricList.$el.style[transitionDuration] =
                duration + "ms";
            this.$refs.middleL.style[transitionDuration] = duration + "ms";
            this.$refs.lyricList.$el.style[
                transform
            ] = `translate(${offsetWidth}px, 0)`;
            this.$refs.middleL.style.opacity = opacity;
            this.touch.initated = false;
        }
    },
    watch: {
        currentSong(newSong, oldSong) {
            if (!newSong.id || !newSong.url || newSong.id === oldSong.id)
                return;

            this.songReady = false;
            this.canLyricPlay = false;

            if (this.currentLyric.lines) {
                this.currentLyric.stop();
                this.currentLyric = {};
                this.currentTime = 0;
                this.playingLyric = "";
                this.currentLineNum = 0;
            }
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.songReady = true;
            }, 5000);
            this._getLyric();
        },
        playing(newPlaying) {
            const audio = this.$refs.audio,
                cdImage = this.$refs.image;

            this.$nextTick(() => {
                if (newPlaying) {
                    audio.play();
                    cdImage.style["animationPlayState"] = "running";
                } else {
                    audio.pause();
                    cdImage.style["animationPlayState"] = "paused";
                }
            });
        }
    }
};
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

@keyframes cdRotate {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.player {
    touch-action: none;

    .normal-player {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 150;
        background: $color-background;

        .background {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.6;
            filter: blur(20px);
        }

        .top {
            position: relative;
            margin-bottom: 25px;

            .back {
                position: absolute;
                top: 0;
                left: 6px;
                z-index: 50;

                .icon-back {
                    display: block;
                    padding: 9px;
                    font-size: $font-size-large-x;
                    color: $color-theme;
                    transform: rotate(-90deg);
                }
            }

            .title {
                width: 70%;
                margin: 0 auto;
                line-height: 40px;
                text-align: center;
                no-wrap();
                font-size: $font-size-large;
                color: $color-text;
            }

            .subtitle {
                line-height: 20px;
                text-align: center;
                font-size: $font-size-medium;
                color: $color-text;
            }
        }

        .middle {
            position: fixed;
            width: 100%;
            top: 80px;
            bottom: 170px;
            white-space: nowrap;
            font-size: 0;

            .middle-l {
                display: inline-block;
                vertical-align: top;
                position: relative;
                width: 100%;
                height: 0;
                padding-top: 80%;

                .cd-wrapper {
                    position: absolute;
                    left: 10%;
                    top: 0;
                    width: 80%;
                    height: 100%;

                    .cd {
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;

                        &.play {
                            animation: rotate 20s linear infinite;
                        }

                        &.pause {
                            animation-play-state: paused;
                        }

                        .image {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            border-radius: 50%;
                            box-sizing: border-box;
                            border: 10px solid hsla(0, 0%, 100%, 0.1);
                            animation: cdRotate 30s infinite linear;
                        }
                    }
                }

                .playing-lyric-wrapper {
                    width: 80%;
                    margin: 30px auto 0 auto;
                    overflow: hidden;
                    text-align: center;

                    .playing-lyric {
                        height: 20px;
                        line-height: 20px;
                        font-size: $font-size-medium;
                        color: $color-text-l;
                    }
                }
            }

            .middle-r {
                display: inline-block;
                vertical-align: top;
                width: 100%;
                height: 100%;
                overflow: hidden;

                .lyric-wrapper {
                    width: 80%;
                    margin: 0 auto;
                    overflow: hidden;
                    text-align: center;

                    .text {
                        line-height: 32px;
                        color: $color-text-l;
                        font-size: $font-size-medium;

                        &.current {
                            color: $color-text;
                        }
                    }
                }
            }
        }

        .bottom {
            position: absolute;
            bottom: 50px;
            width: 100%;

            .dot-wrapper {
                text-align: center;
                font-size: 0;

                .dot {
                    display: inline-block;
                    vertical-align: middle;
                    margin: 0 4px;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: $color-text-l;

                    &.active {
                        width: 20px;
                        border-radius: 5px;
                        background: $color-text-ll;
                    }
                }
            }

            .progress-wrapper {
                display: flex;
                align-items: center;
                width: 80%;
                margin: 0px auto;
                padding: 10px 0;

                .time {
                    color: $color-text;
                    font-size: $font-size-small;
                    flex: 0 0 30px;
                    line-height: 30px;
                    width: 30px;

                    &.time-l {
                        text-align: left;
                    }

                    &.time-r {
                        text-align: right;
                    }
                }

                .progress-bar-wrapper {
                    flex: 1;
                }
            }

            .operators {
                display: flex;
                align-items: center;

                .icon {
                    flex: 1;
                    color: $color-theme;

                    &.disable {
                        color: $color-theme-d;
                    }

                    i {
                        font-size: 30px;
                    }
                }

                .i-left {
                    text-align: right;
                }

                .i-center {
                    padding: 0 20px;
                    text-align: center;

                    i {
                        font-size: 40px;
                    }
                }

                .i-right {
                    text-align: left;
                }

                .icon-favorite {
                    color: $color-sub-theme;
                }
            }
        }

        &.normal-enter-active, &.normal-leave-active {
            transition: all 0.4s;

            .top, .bottom {
                transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
            }
        }

        &.normal-enter, &.normal-leave-to {
            opacity: 0;

            .top {
                transform: translate(0, -100px);
            }

            .bottom {
                transform: translate(0, 100px);
            }
        }
    }

    .mini-player {
        display: flex;
        align-items: center;
        position: fixed;
        left: 0;
        bottom: 0;
        z-index: 180;
        width: 100%;
        height: 60px;
        background: $color-highlight-background;

        &.mini-enter-active, &.mini-leave-active {
            transition: all 0.4s;
        }

        &.mini-enter, &.mini-leave-to {
            opacity: 0;
        }

        .icon {
            flex: 0 0 40px;
            width: 40px;
            padding: 0 10px 0 20px;

            img {
                border-radius: 50%;

                &.play {
                    animation: rotate 10s linear infinite;
                }

                &.pause {
                    animation-play-state: paused;
                }
            }
        }

        .text {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            line-height: 20px;
            overflow: hidden;

            .name {
                margin-bottom: 2px;
                no-wrap();
                font-size: $font-size-medium;
                color: $color-text;
            }

            .desc {
                no-wrap();
                font-size: $font-size-small;
                color: $color-text-d;
            }
        }

        .control {
            flex: 0 0 30px;
            width: 30px;
            padding: 0 10px;

            .icon-play-mini, .icon-pause-mini, .icon-playlist {
                font-size: 30px;
                color: $color-theme-d;
            }

            .icon-mini {
                font-size: 32px;
                position: absolute;
                left: 0;
                top: 0;
            }
        }
    }
}

@keyframes rotate {
    0% {
        transform: rotate(0);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>