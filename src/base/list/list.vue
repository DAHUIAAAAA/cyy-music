<template>
    <ul>
        <li @click="selectItem(item)" v-for="(item, index) in list" :key="index" class="item">
            <div class="icon">
                <img width="60" v-lazy="item[imgPath]" />
            </div>
            <div class="text">
                <h2 class="name" v-html="item[titlePath]"></h2>
                <p class="desc" v-html="item[descPath]"></p>
            </div>
        </li>
    </ul>
</template>

<script>
export default {
    props: {
        list: {
            type: Array,
            default: () => {}
        },
        imgPath: {
            type: String,
            default: ""
        },
        titlePath: {
            type: String,
            default: ""
        },
        descPath: {
            type: String,
            default: ""
        }
    },
    methods: {
        selectItem(item) {
            this.$emit('select', item);
        }
    }
};
</script>

<style scoped lang="stylus">
@import '~common/stylus/variable';

.item {
    display: flex;
    box-sizing: border-box;
    align-items: center;
    padding: 0 20px 20px 20px;

    .icon {
        flex: 0 0 60px;
        width: 60px;
        padding-right: 20px;
    }

    .text {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        font-size: $font-size-medium;

        .name {
            margin-bottom: 10px;
            color: $color-text;
        }

        .desc {
            color: $color-text-d;
        }
    }
}
</style>