<template>
    <div class="upload-img">
        <label>
            上传封面图
            <span v-show="tip">({{tip}})</span>
        </label>
        <input
            ref="input"
            class="upload-input"
            type="file"
            accept="image/gif, image/jpeg, image/jpg, image/png, image/svg"
            @change="imgChange"
        />
        <img v-show="false" ref="preImg" :src="preImg" alt />
        <div v-show="imgUrl" class="img-wrapper" @click="selectImg">
            <img ref="img" :src="imgUrl" alt />
        </div>
        <div class="add-img" @click="selectImg" v-show="!imgUrl">+</div>
    </div>
</template>

<script>
const MAX_FILE_SIZE = 2097152;

export default {
    data() {
        return {
            imgUrl: "",
            preImg: "",
            tip: ""
        };
    },
    methods: {
        selectImg() {
            this.$refs.input.dispatchEvent(new MouseEvent("click"));
        },
        imgChange() {
            const file = this.$refs.input.files[0];

            if (file.size > MAX_FILE_SIZE) {
                this.tip = "图片不能超过2M";
                return;
            } else {
                this.tip = "点击图片可重新选择";
            }

            const render = new FileReader();
            render.onload = e => {
                this.preImg = e.target.result;
                this.clipImg(e.target.result);
            };
            render.readAsDataURL(file);

            this.$emit("onImgChange", file);
        },
        clipImg(imgUrl) {
            setTimeout(() => {
                const width = this.$refs.preImg.width,
                    height = this.$refs.preImg.height;

                if (width > height) {
                    this.$refs.img.style.height = "100%";
                } else {
                    this.$refs.img.style.width = "100%";
                }

                this.imgUrl = imgUrl;
            }, 20);
        }
    }
};
</script>

<style lang="stylus">
@import '~common/stylus/variable';

.upload-img {
    margin: 20px;

    label {
        font-size: $font-size-medium-x;
        color: $color-text-d;
        font-weight: bold;
        margin-bottom: 8px;
        display: block;

        span {
            font-weight: normal;
        }
    }

    .upload-input {
        display: none;
    }

    .img-wrapper {
        width: 63px;
        height: 63px;
        line-height: 50px;
        border: 1px solid $color-text-d;
        border-radius: 3px;
        overflow: hidden;
        background: #fff;
        margin-right: 4px;
        display: flex;
        justify-content: center;
    }

    .add-img {
        height: 60px;
        width: 60px;
        border: 1px dashed $color-text-d;
        border-radius: 3px;
        font-size: 30px;
        text-align: center;
        line-height: 60px;
        color: $color-text-d;
        padding: 1px;
        margin: 1px;
    }
}
</style>