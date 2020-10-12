<template>
    <scroll
        ref="suggest"
        class="suggest"
        :data="result"
        :pullup="pullup"
        :beforeScroll="beforeScroll"
        @scrollToEnd="searchMore"
        @beforeScroll="listScroll"
    >
        <ul class="suggest-list">
            <li
                @click="selectItem(item)"
                class="suggest-item"
                v-for="item in result"
                :key="item.singermid || item.songmid"
            >
                <div class="icon">
                    <i :class="getIconCls(item)"></i>
                </div>
                <div class="name">
                    <p class="text" v-html="getDisplayName(item)"></p>
                </div>
            </li>
            <loading v-show="hasMore" />
            <div v-show="!hasMore" class="no-result-wrapper"></div>
        </ul>
    </scroll>
</template>

<script>
import Scroll from "base/scroll/scroll";
import Loading from "base/loading/loading";
import { search } from "api/search";
import { getMusicSource } from "api/song";
import { createSong } from "common/js/song";
import Singer from "common/js/singer";
import { ERR_OK } from "api/config";
import { mapMutations, mapActions} from "vuex";

const TYPE_SINGER = "singer";
const perpage = 20;
// const searchMoreLength = 13;

export default {
    components: {
        Scroll,
        Loading
    },
    props: {
        query: {
            type: String,
            default: ""
        },
        showSinger: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            page: 1,
            firstLoad: true,
            curNum: 0,
            pullup: true,
            beforeScroll: true,
            result: [],
            hasMore: false
        };
    },
    methods: {
        ...mapMutations({
            setSinger: "SET_SINGER"
        }),
        ...mapActions(["insertSong"]),
        listScroll() {
            this.$emit("listScroll");
        },
        search(query) {
            this.page = 1;
            this.hasMore = true;
            search(query, this.page, this.showSinger, perpage).then(res => {
                if (res.code === ERR_OK) {
                    this.result = [];
                    this.firstLoad = true;
                    this.curNum = 0;
                    this._genResult(res.data);
                    this._checkMore(res.data);
                }
            });
        },
        _genResult(data) {
            // debugger
            if (data && data.zhida && data.zhida.singerid && this.page === 1) {
                this.result.push({ ...data.zhida, ...{ type: TYPE_SINGER } });
                if (this.firstLoad) {
                    this.curNum++;
                }
            }
            if (data.song) {
                this._normalizeSongs(data.song.list);
            }
        },
        _firstLoadMore() {
            //解决加载数据没有达到满屏，无法触发searchMore的问题
            const headerHeight = document.querySelector(".m-header")
                    .offsetHeight,
                tabHeight = document.querySelector(".tab").offsetHeight,
                searchBoxHeight = document.querySelector(".search-box-wrapper")
                    .offsetHeight,
                suggestItem = document.querySelectorAll(".suggest-item"),
                suggestItemLength = suggestItem.length,
                suggestItemHeight = suggestItem[0].offsetHeight;
            if (
                headerHeight +
                    tabHeight +
                    searchBoxHeight +
                    suggestItemHeight * suggestItemLength <=
                window.innerHeight
            ) {
                this.searchMore();
            } else {
                this.firstLoad = false;
            }
        },
        _checkMore(data) {
            const song = data.song;
            if (
                !song.list.length ||
                song.curnum + (song.curpage - 1) * perpage >= song.totalnum
            ) {
                this.hasMore = false;
            }
        },
        _normalizeSongs(list) {
            for (let i = 0; i < list.length; i++) {
                const musicData = list[i];
                getMusicSource(musicData.songmid).then(res => {
                    if (this.firstLoad) this.curNum++;
                    const url =
                        res.data.req_0.data.midurlinfo[0] &&
                        res.data.req_0.data.midurlinfo[0].purl;
                    if (url) {
                        this.result.push(createSong(musicData, url));
                    }
                    if (this.curNum === perpage * this.page && this.firstLoad) {
                        this._firstLoadMore();
                    }
                });
            }
        },
        selectItem(item) {
            if (item.type === TYPE_SINGER) {
                const singer = new Singer({
                    id: item.singermid,
                    name: item.singername
                });
                this.setSinger(singer);
                this.$router.push({
                    path: `/search/${singer.id}`
                });
            } else {
                this.insertSong(item);
            }
            this.$emit("select", item);
        },
        getIconCls(item) {
            if (item.type === TYPE_SINGER) {
                return "icon-mine";
            } else {
                return "icon-music";
            }
        },
        getDisplayName(item) {
            if (item.type === TYPE_SINGER) {
                return item.singername;
            } else {
                return `${item.name}-${item.singer}`;
            }
        },
        searchMore() {
            if (!this.hasMore) {
                return;
            }
            this.page++;
            search(this.query, this.page, this.showSinger, perpage).then(
                res => {
                    if (res.code === ERR_OK) {
                        this._genResult(res.data);
                        this._checkMore(res.data);
                    }
                }
            );
        }
    },
    watch: {
        query(newQuery) {
            if (!newQuery) return;
            this.search(newQuery);
        }
    }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.suggest {
    height: 100%;
    overflow: hidden;

    .suggest-list {
        padding: 0 30px;

        .suggest-item {
            display: flex;
            align-items: center;
            padding-bottom: 20px;
        }

        .icon {
            flex: 0 0 30px;
            width: 30px;

            [class^='icon-'] {
                font-size: 14px;
                color: $color-text-d;
            }
        }

        .name {
            flex: 1;
            font-size: $font-size-medium;
            color: $color-text-d;
            overflow: hidden;

            .text {
                no-wrap();
            }
        }
    }

    .no-result-wrapper {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
    }
}
</style>