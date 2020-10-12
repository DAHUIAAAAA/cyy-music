<template>
    <scroll
        ref="scroll"
        class="listview"
        :data="data"
        :listenScroll="listenScroll"
        @scroll="scroll"
        :probeType="probeType"
    >
        <!-- 歌手列表 -->
        <ul>
            <li v-for="(group,index) in data" :key="index" class="list-group" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <li
                        @click="selectItem(item)"
                        v-for="(item,index) in group.items"
                        :key="index"
                        class="list-group-item"
                    >
                        <img class="avatar" v-lazy="item.avatar" />
                        <span class="name">{{item.name}}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <!-- 快速查找 -->
        <div
            class="list-shortcut"
            @touchstart="onShortCutTouchStart"
            @touchmove.stop.prevent="onShortCutTouchMove"
        >
            <ul>
                <li
                    class="item"
                    v-for="(item, index) in shortcutList"
                    :key="index"
                    :data-index="index"
                    :class="{current: currentIndex === index}"
                >{{item}}</li>
            </ul>
        </div>
        <!-- 固定标题 -->
        <div class="list-fixed" ref="fixed" v-show="fixedTitle">
            <div class="fixed-title">{{fixedTitle}}</div>
        </div>
        <!-- 加载条 -->
        <loading v-show="!data.length" class="loading-container" />
    </scroll>
</template>

<script>
import Scroll from "base/scroll/scroll";
import Loading from "base/loading/loading";
import { getData } from "common/js/dom";

const ANCHOR_HEIGHT = 18;

export default {
    data() {
        return {
            currentIndex: 0,
            scrollY: -1
        };
    },
    props: {
        data: {
            type: Array,
            default: () => []
        }
    },
    components: {
        Scroll,
        Loading
    },
    created() {
        this.listenScroll = true;
        this.probeType = 3;
        this.touch = {};
        this.listHeight = [];
    },
    mounted() {
        this.$refs.scroll.refresh();
    },
    activated() {
        this.$refs.scroll.refresh();
    },
    methods: {
        scroll(pos) {
            this.scrollY = pos.y;
        },
        onShortCutTouchStart(e) {
            let anchorIndex = parseInt(getData(e.target, "index")),
                firstTouch = e.touches[0];

            // 获取第一次按下的位置，以计算滑动到哪个区间
            this.touch.y1 = firstTouch.pageY;
            this.touch.anchorIndex = anchorIndex;

            this._scrollTo(anchorIndex);
        },
        onShortCutTouchMove(e) {
            let touch = e.touches[0];

            this.touch.y2 = touch.pageY;

            // 判断手指滑动在哪个索引
            let delta = ((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT) | 0,
                anchorIndex = this.touch.anchorIndex + delta;

            this._scrollTo(anchorIndex);
        },
        _scrollTo(index) {
            if (!index && index !== 0) return;
            if (index < 0) {
                index = 0;
            } else if (index > this.shortcutList.length - 1) {
                index = this.shortcutList.length - 1;
            }

            this.$refs.scroll.scrollToElement(this.$refs.listGroup[index], 0);
            this.currentIndex = index;
        },
        // 计算每个分类的高度
        _calculateHeight() {
            const list = this.$refs.listGroup;
            let height = 0;
            this.listHeight.push(height);
            for (let i = 0; i < list.length; i++) {
                let item = list[i];
                height += item.clientHeight;
                this.listHeight.push(height);
            }
        },
        selectItem(item) {
            this.$emit("select", item);
        }
    },
    computed: {
        shortcutList() {
            return this.data.map(group => group.title.substr(0, 1));
        },
        fixedTitle() {
            if (this.scrollY > 0) return "";
            return this.data[this.currentIndex]
                ? this.data[this.currentIndex].title
                : "";
        }
    },
    watch: {
        data() {
            setTimeout(() => {
                this._calculateHeight();
            }, 20);
        },
        scrollY(newY) {
            const listHeight = this.listHeight;
            // 当在顶部以上滚动时
            if (newY > 0) {
                this.currentIndex = 0;
                return;
            }

            // 当在中间部分滚动时
            for (let i = 0; i < listHeight.length - 1; i++) {
                let minHeight = listHeight[i],
                    maxHeight = listHeight[i + 1];

                if (-newY < maxHeight && -newY >= minHeight) {
                    this.currentIndex = i;
                    return;
                }
            }

            // 当在底部滚动时
            this.currentIndex = this.listHeight - 2;
        }
    }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.listview {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: $color-background;

    .list-group {
        padding-bottom: 30px;

        .list-group-title {
            height: 30px;
            line-height: 30px;
            padding-left: 20px;
            font-size: $font-size-small;
            color: $color-text-l;
            background: $color-highlight-background;
        }

        .list-group-item {
            display: flex;
            align-items: center;
            padding: 20px 0 0 30px;

            .avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
            }

            .name {
                margin-left: 20px;
                color: $color-text-l;
                font-size: $font-size-medium;
            }
        }
    }

    .list-shortcut {
        position: absolute;
        z-index: 30;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        padding: 20px 0;
        border-radius: 10px;
        text-align: center;
        background: $color-background-d;
        font-family: Helvetica;

        .item {
            padding: 3px;
            line-height: 1;
            color: $color-text-l;
            font-size: $font-size-small;

            &.current {
                color: $color-theme;
            }
        }
    }

    .list-fixed {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;

        .fixed-title {
            height: 30px;
            line-height: 30px;
            padding-left: 20px;
            font-size: $font-size-small;
            color: $color-text-l;
            background: $color-highlight-background;
        }
    }

    .loading-container {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
    }
}
</style>