<template>
    <div class="singer">
        <list-view @select="selectSinger" :data="singers" ref="list" />
        <transition name="slide">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
import { getSingerList } from "api/singer";
import { ERR_OK } from "api/config";
import ListView from "base/listview/listview";
import Singer from "common/js/singer";
import { mapMutations } from "vuex";
import { playlistMixin } from "common/js/mixin";

const HOT_SINGER_LEN = 10;
const HOT_NAME = "热门";

export default {
    mixins: [playlistMixin],
    data() {
        return {
            singers: []
        };
    },
    components: {
        ListView
    },
    created() {
        this._getSingerList();
    },
    methods: {
        selectSinger(singer) {
            this.$router.push({
                path: `/singer/${singer.id}`
            });
            this.setSinger(singer);
        },
        _getSingerList() {
            getSingerList().then(res => {
                if (res.code === ERR_OK) {
                    this.singers = this._normalizeSinger(res.data.list);
                }
            });
        },
        _normalizeSinger(list) {
            let map = {
                hot: {
                    title: HOT_NAME,
                    items: []
                }
            };

            list.forEach((item, index) => {
                if (index < HOT_SINGER_LEN) {
                    map.hot.items.push(
                        new Singer({
                            name: item.Fsinger_name,
                            id: item.Fsinger_mid
                        })
                    );
                }

                const key = item.Findex;

                if (!map[key]) {
                    map[key] = {
                        title: key,
                        items: []
                    };
                }

                map[key].items.push(
                    new Singer({
                        name: item.Fsinger_name,
                        id: item.Fsinger_mid
                    })
                );
            });

            // 得到有序列表
            let ret = [];
            let hot = [];

            for (let key in map) {
                let val = map[key];

                if (val.title.match(/[a-zA-Z]/)) {
                    ret.push(val);
                } else if (val.title === HOT_NAME) {
                    hot.push(val);
                }
            }

            ret.sort((a, b) => a.title.charCodeAt(0) - b.title.charCodeAt(0));

            return hot.concat(ret);
        },
        ...mapMutations({
            setSinger: "SET_SINGER"
        })
    }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.singer {
    position: fixed;
    top: 88px;
    bottom: 0;
    width: 100%;
}

.slide-enter-active, .slide-leave-active {
    transition: all 0.3s;
}

.slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
}
</style>