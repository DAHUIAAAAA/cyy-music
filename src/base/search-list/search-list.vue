<template>
    <div class="search-list" v-show="searches.length">
        <ul>
            <li
                class="search-item"
                @click="selectItem(item)"
                v-for="(item, index) in searches"
                :key="index"
            >
                <span class="text">{{item}}</span>
                <span class="icon" @click.stop="deleteHistory(item)">
                    <i class="icon-delete"></i>
                </span>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        searches: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        selectItem(item) {
            this.$emit("select", item);
        },
        deleteHistory(item) {
            this.$emit("delete", item);
        }
    }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.search-list {
    .search-item {
        display: flex;
        align-items: center;
        height: 40px;
        overflow: hidden;

        .text {
            flex: 1;
            color: $color-text-l;
        }

        .icon {
            extend-click();

            .icon-delete {
                font-size: $font-size-small;
                color: $color-text-d;
            }
        }
    }
}
</style>