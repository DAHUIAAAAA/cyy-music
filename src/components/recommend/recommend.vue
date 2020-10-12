<template>
    <div class="recommend">
        <scroll ref="scroll" class="recommend-content" :data="discList">
            <div>
                <!-- 轮播图 -->
                <div v-if="banner.length" class="slider-wrapper" ref="sliderWrapper">
                    <slider>
                        <div v-for="(item, index) in banner" :key="item.index">
                            <a :href="item.jumpurl">
                                <img :src="item.pic" class="needsclick" @load="loadImage" />
                            </a>
                        </div>
                    </slider>
                </div>
                <!-- 热门歌单推荐 -->
                <div class="recommend-list">
                    <h1 class="list-title">热门歌单推荐</h1>
                    <list
                        :list="discList"
                        :imgPath="imgPath"
                        :titlePath="titlePath"
                        :descPath="descPath"
                        @select="selectItem"
                    />
                </div>
                <!-- 加载区 -->
                <div class="loading-container" v-show="!discList.length">
                    <loading></loading>
                </div>
            </div>
        </scroll>
        <router-view></router-view>
    </div>
</template>

<script>
import { getMusicData } from "api/recommend";
import { ERR_OK } from "api/config";
import Slider from "base/slider/slider";
import Scroll from "base/scroll/scroll";
import Loading from "base/loading/loading";
import List from "base/list/list";
import { mapMutations, mapGetters } from "vuex";
import { playlistMixin } from "common/js/mixin";

export default {
    mixins: [playlistMixin],
    components: {
        Slider,
        Scroll,
        Loading,
        List
    },
    data() {
        return {
            imgPath: "imgurl",
            titlePath: "author",
            descPath: "dissname"
        };
    },
    created() {
        this._getData();
    },
    activated() {
        setTimeout(() => {
            this.$refs.slider && this.$refs.slider.refresh();
        }, 20);
    },
    methods: {
        _getData() {
            if (!this.banner.length && !this.discList.length) {
                getMusicData().then(res => {
                    if (res.code === 0) {
                        this.setMusicData(res.data);
                    }
                });
            }
        },
        selectItem(item) {
            this.$router.push({
                path: `/recommend/${item.dissid}`
            });
            this.setDisc(item);
        },
        loadImage() {
            if (!this.checkloaded) {
                this.checkloaded = true;
                setTimeout(() => {
                    this.$refs.scroll.refresh();
                }, 20);
            }
        },
        ...mapMutations({
            setMusicData: "SET_MUSICDATA",
            setDisc: "SET_DISC"
        })
    },
    computed: {
        ...mapGetters(["banner", "discList"])
    }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.recommend {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;

    .recommend-content {
        height: 100%;
        overflow: hidden;

        .slider-wrapper {
            position: relative;
            width: 100%;
            overflow: hidden;
        }

        .recommend-list {
            .list-title {
                height: 65px;
                line-height: 65px;
                text-align: center;
                font-size: $font-size-medium;
                color: $color-theme;
            }
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