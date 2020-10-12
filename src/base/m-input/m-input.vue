<template>
    <div class="input-wrapper">
        <label v-if="label">
            {{label}}
            <span v-show="showTip">({{tip}})</span>
        </label>
        <div class="input" @click="foucs">
            <input
                type="text"
                ref="query"
                v-model="query"
                @change="onQueryChange"
                @blur="blur"
                class="box"
                :placeholder="placeholder"
            />
            <i @click="clear" v-show="query" class="icon-dismiss"></i>
        </div>
    </div>
</template>

<script>
import { debounce } from "common/js/util";
export default {
    props: {
        placeholder: {
            type: String,
            default: ""
        },
        label: {
            type: String,
            default: "歌单名称"
        },
        tip: {
            type: String,
            default: "尚未填写"
        }
    },
    data() {
        return {
            query: "",
            showTip: false
        };
    },
    methods: {
        clear() {
            this.query = "";
        },
        setQuery(query) {
            this.query = query;
        },
        foucs() {
            this.$refs.query.focus();
        },
        blur() {
            if(this.query.replace(/\s*/g, "")) {
                this.showTip = false;
            }else {
                this.showTip = true;
            }
        },
        onQueryChange() {
            this.$emit("input", this.query);
        }
    },
    created() {
        this.$watch(
            "query",
            debounce(newQuery => {
                this.$emit("query", newQuery.replace(/\s*/g, ""));
            }, 1000)
        );
    }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.input-wrapper {
    padding: 20px 20px 0;

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

    .input {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        width: 100%;
        padding: 0 6px;
        height: 40px;
        background: $color-background;
        border-radius: 6px;

        .box {
            flex: 1;
            margin: 0 5px;
            line-height: 18px;
            background: $color-background;
            color: $color-text;
            font-size: $font-size-medium;
            outline: 0;

            &::placeholder {
                color: $color-text-d;
            }
        }

        .icon-dismiss {
            font-size: 16px;
            color: $color-highlight-background;
        }
    }
}
</style>