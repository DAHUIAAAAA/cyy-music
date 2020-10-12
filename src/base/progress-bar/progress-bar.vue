<template>
    <div class="progress-bar" ref="progressBar" @click="progressClick">
        <div class="bar-inner">
            <div class="progress" ref="progress"></div>
            <div
                class="progress-btn-wrapper"
                ref="progressBtn"
                @touchstart.prevent="progressTouchStart"
                @touchmove.prevent="progressTouchMove"
                @touchend="progressTouchEnd"
            >
                <div class="progress-btn"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { prefixStyle } from "common/js/dom";

const transform = prefixStyle("transform"),
    BTN_WIDTH = 16;

export default {
    props: {
        percent: {
            type: Number,
            default: 0
        }
    },
    methods: {
        progressClick(e) {
            const rect = this.$refs.progressBar.getBoundingClientRect();
            let offsetWidth = e.pageX - rect.left;

            offsetWidth = this._getLimitOffset(offsetWidth);
            this._offset(offsetWidth);
            this._triggerPercent();
        },
        setProgressOffset(newPercent) {
            if (newPercent < 0 || this.touch.initiated) return;
            const offsetWidth = newPercent * this._getTotalWidth();
            this._offset(offsetWidth);
        },
        progressTouchStart(e) {
            this.touch.initiated = true;
            this.touch.startX = e.touches[0].pageX;
            this.touch.left = this.$refs.progress.clientWidth;
        },
        progressTouchMove(e) {
            if (!this.touch.initiated) return;

            const deltaX = e.touches[0].pageX - this.touch.startX,
                offsetWidth = this._getLimitOffset(this.touch.left + deltaX);
            
            this._offset(offsetWidth);
            this.$emit('percentChanging', this._getPercent());
        },
        progressTouchEnd() {
            this.touch.initiated = false;
            this._triggerPercent();
        },
        _offset(offsetWidth) {
            this.$refs.progress.style.width = `${offsetWidth}px`;
            this.$refs.progressBtn.style[
                transform
            ] = `translate(${offsetWidth}px, 0)`;
        },
        _triggerPercent() {
            this.$emit("percentChange", this._getPercent());
        },
        _getLimitOffset(offsetWidth) {
            const maxOffset = this._getTotalWidth();
            const minOffset = Math.max(offsetWidth, 0);
            return Math.min(maxOffset, minOffset);
        },
        _getPercent() {
            const width = this._getTotalWidth();
            return this.$refs.progress.clientWidth / width;
        },
        _getTotalWidth() {
            return this.$refs.progressBar.clientWidth - BTN_WIDTH;
        }
    },
    created() {
        this.touch = {};
    },
    watch: {
        percent(newPercent) {
            this.setProgressOffset(newPercent);
        }
    }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.progress-bar {
    height: 30px;

    .bar-inner {
        position: relative;
        top: 13px;
        height: 4px;
        background: rgba(0, 0, 0, 0.3);

        .progress {
            position: absolute;
            height: 100%;
            background: $color-theme;
        }

        .progress-btn-wrapper {
            position: absolute;
            left: -8px;
            top: -13px;
            width: 30px;
            height: 30px;

            .progress-btn {
                position: relative;
                top: 7px;
                left: 7px;
                box-sizing: border-box;
                width: 16px;
                height: 16px;
                border: 3px solid $color-text;
                border-radius: 50%;
                background: $color-theme;
            }
        }
    }
}
</style>