<template>
    <transition name="confirm-fade">
        <div class="confirm" v-show="showFlag">
            <div class="confirm-content" :style="cstyle">
                <p class="text" v-if="!confirmSlot" v-html="text"></p>
                <slot />
                <div class="bottom"></div>
                <div class="operate">
                    <div @click="cancel" class="operate-btn left">{{cancelBtnText}}</div>
                    <div @click="confirm" class="operate-btn">{{confirmBtnText}}</div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    props: {
        confirmSlot: {
            type: Boolean,
            default: false
        },
        cstyle: {
            type: String,
            default: "width: 270px"
        },
        text: {
            type: String,
            default: ""
        },
        confirmBtnText: {
            type: String,
            default: "确定"
        },
        cancelBtnText: {
            type: String,
            default: "取消"
        }
    },
    data() {
        return {
            showFlag: false
        };
    },
    methods: {
        show() {
            this.showFlag = true;
        },
        hide() {
            this.showFlag = false;
        },
        cancel() {
            this.hide();
        },
        confirm() {
            this.hide();
            this.$emit("confirm");
        }
    }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.confirm {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 998;
    background-color: $color-background-d;

    &.confirm-fade-enter-active {
        animation: confirm-fadein 0.3s;

        .confirm-content {
            animation: confirm-zoom 0.3s;
        }
    }

    .confirm-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 999;
        background: $color-highlight-background;

        // padding-top: 20px;
        .text {
            padding: 19px 15px;
            line-height: 22px;
            text-align: center;
            font-size: $font-size-large;
            color: $color-text-l;
        }

        .bottom {
            width: 100%;
            height: 43px;
        }

        .operate {
            display: flex;
            align-items: center;
            text-align: center;
            font-size: $font-size-large;
            margin-top: 20px;
            position: fixed;
            bottom: 0;
            width: 100%;

            .operate-btn {
                flex: 1;
                line-height: 22px;
                padding: 10px 0;
                border-top: 1px solid $color-background-d;
                color: $color-text-d;

                &.left {
                    border-right: 1px solid $color-background-d;
                }
            }
        }
    }
}

@keyframes confirm-fadein {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

@keyframes confirm-zoom {
    0% {
        transform: scale(0) translate(-50%, -50%);
    }

    50% {
        transform: scale(1.1) translate(-50%, -50%);
    }

    100% {
        transform: scale(1) translate(-50%, -50%);
    }
}
</style>