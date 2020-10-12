<template>
    <div class="upload-audio">
        <label>
            上传音频
            <span>(可多选)</span>
        </label>
        <input
            ref="input"
            class="upload-input"
            type="file"
            accept=".mp3, .mkv, .wma"
            @change="audioChange"
            multiple
        />
        <div class="add-audio" @click="selectAudio">+</div>
        <div class="select-file" v-if="fileList.length">
            <label>已选歌曲</label>
            <scroll class="scroll" :data="fileList">
                <ul class="file-wrapper">
                    <li v-for="(item, index) in fileList">
                        <span>{{item.name}}</span>
                        <div class="clear" @click="clear(index)">
                            <i class="icon-clear"></i>
                        </div>
                    </li>
                </ul>
            </scroll>
        </div>
    </div>
</template>

<script>
import Scroll from "base/scroll/scroll";
import {getUniArr} from "common/js/util";

export default {
    data() {
        return {
            fileList: [],
            preList: []
        };
    },
    components: {
        Scroll
    },
    methods: {
        audioChange() {
            const files = this.$refs.input.files;
            const res = getUniArr(files, this.preList);
            this.preList = res;
            this.fileList = res;
            this.$emit("onAudioChange", res);
        },

        selectAudio() {
            this.$refs.input.dispatchEvent(new MouseEvent("click"));
        },
        clear(index) {
            this.fileList.splice(index, 1);
            this.preList.splice(index, 1);
            this.$emit("onAudioChange", this.fileList);
        }
    }
};
</script>

<style lang="stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

// @import '~common/stylus/icon';
.upload-audio {
    padding: 18px;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;

    label {
        font-size: $font-size-medium-x;
        color: $color-text-d;
        font-weight: bold;
        padding-bottom: 8px;
        display: block;

        span {
            font-weight: normal;
        }
    }

    .upload-input {
        display: none;
    }

    .add-audio {
        height: 30px;
        border: 1px dashed $color-text-d;
        border-radius: 3px;
        font-size: 30px;
        text-align: center;
        line-height: 30px;
        color: $color-text-d;
        padding: 1px;
    }

    .select-file {
        margin-top: 20px;
        margin-bottom: 43px;
        flex: 1;
        overflow: hidden;

        .scroll {
            height: 100%;
            overflow: hidden;
            margin-top: 10px;

            .file-wrapper {
                font-size: $font-size-medium;
                color: $color-text-l;

                li {
                    margin: 10px 0 20px 0;
                    display: flex;

                    span {
                        flex: 1;
                    }

                    .clear {
                        extend-click();

                        .icon-clear {
                            font-size: $font-size-medium;
                            color: $color-text-d;
                        }
                    }
                }
            }
        }
    }
}
</style>