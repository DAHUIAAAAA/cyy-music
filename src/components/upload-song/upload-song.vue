<template>
    <div class="upload-song">
        <div class="search-box-wrapper">
            <search-box @query="onQueryChange" placeholder="搜索歌单"></search-box>
        </div>
        <div class="icon" @click.stop="addSongMenu">+</div>
        <scroll class="scroll">
            <list
                :list="list"
                :imgPath="imgPath"
                :titlePath="titlePath"
                :descPath="descPath"
                @select="selectItem"
            />
        </scroll>
        <confirm ref="confirm" :confirmSlot="true" cstyle="width:100%; height:100%;" @confirm="confirm">
            <m-input placeholder="歌单名称" v-model="name" />
            <m-input placeholder="歌单制作者" v-model="maker" />
            <m-input placeholder="歌单描述" v-model="desc" />
            <upload-img @onImgChange="onImgChange"></upload-img>
        </confirm>
        <transition name="slide">
            <router-view />
        </transition>
    </div>
</template>

<script>
import Scroll from "base/scroll/scroll";
import List from "base/list/list";
import Confirm from "base/confirm/confirm";
import SearchBox from "base/search-box/search-box";
import MInput from "base/m-input/m-input";
import UploadImg from "base/upload-img/upload-img";
import { uploadImg } from "api/img";
import { ERR_OK } from "api/config";
import { mapMutations } from "vuex";

export default {
    components: {
        Scroll,
        List,
        Confirm,
        SearchBox,
        MInput,
        UploadImg
    },
    data() {
        return {
            imgPath: "imgUrl",
            titlePath: "title",
            descPath: "desc",
            list: [
                {
                    mid: 503213,
                    imgUrl:
                        "http://qpic.y.qq.com/music_cover/PiajxSqBRaEISibhtdxpkLprufpT7OzywmuYVNIiaMWIeqLv9Eaico0WLA/300?n=1",
                    title: "古韵",
                    desc: "最喜欢的"
                }
            ],
            name: "",
            maker: "",
            desc: ""
        };
    },
    methods: {
        ...mapMutations({
            setUploadList: "SET_UPLOAD_LIST"
        }),
        addSongMenu() {
            this.$refs.confirm.show();
        },
        onQueryChange() {},
        selectItem(item) {
            this.setUploadList(item);
            this.$router.push({ path: `/upload/${item.mid}` });
        },
        onImgChange(file) {
            this.img = img;
        },
        confirm() {
            if (!this.name || !this.maker || !this.desc) return;

            // uploadImg(this.img).then(res => {
            //     if (res.data.data.err_code === ERR_OK) {
            //         uploadSongMenu({
            //             name: this.name,
            //             maker: this.maker,
            //             desc: this.desc,
            //             imgUrl: res.data.data.url
            //         });
            //     }
            // });
        }
    }
};
</script>

<style scoped lang="stylus">
@import '~common/stylus/variable';

.upload-song {
    position: fixed;
    top: 88px;
    bottom: 0;
    width: 100%;

    .scroll {
        position: relative;
        top: 20px;
        left: 0;
        bottom: 0;
        right: 0;
    }

    .search-box-wrapper {
        padding: 20px 20px 0;
    }

    .icon {
        width: 53px;
        height: 53px;
        line-height: 53px;
        text-align: center;
        position: fixed;
        top: 80%;
        right: 10%;
        background: $color-highlight-background;
        color: $color-text-d;
        font-size: 40px;
        border-radius: 30px;
    }

    .slide-enter-active, .slide-leave-active {
        transition: all 0.3s;
    }

    .slide-enter, .slide-leave-to {
        transform: translateX(100%);
    }
}
</style>