<template>
    <div class="upload-list">
        <div class="icon" @click.stop="addSong">+</div>
        <music-list :bgImage="uploadList.imgUrl" :title="uploadList.title" :songs="songs"></music-list>
        <confirm
            ref="confirm"
            :confirmSlot="true"
            cstyle="width:100%; height:100%;"
            @confirm="confirm"
        >
            <upload-audio @onAudioChange="onAudioChange"></upload-audio>
        </confirm>
    </div>
</template>

<script>
import MusicList from "components/music-list/music-list";
import Confirm from "base/confirm/confirm";
import UploadAudio from "base/upload-audio/upload-audio";
import { mapGetters, mapActions } from "vuex";
import { pushFileToQueue } from "api/upload";

export default {
    data() {
        return {
            songs: [],
            fileList: []
        };
    },
    components: {
        MusicList,
        Confirm,
        UploadAudio
    },
    created() {
        if (!this.uploadList.mid) {
            this.$router.push({
                path: "/upload"
            });
        }
    },
    methods: {
        ...mapActions(["uploadFile"]),
        addSong() {
            this.$refs.confirm.show();
        },
        onAudioChange(files) {
            this.fileList = files;
            this.confirm();
        },
        confirm() {
            this.uploadFile(this.fileList);
            const mid = this.uploadList.mid,
                files = this.uploadFileList[mid];
            pushFileToQueue(mid, files, this);
        }
    },
    computed: {
        ...mapGetters(["uploadList", "uploadFileList"])
    }
};
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable';

.upload-list {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;

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
        z-index: 101;
    }
}
</style>