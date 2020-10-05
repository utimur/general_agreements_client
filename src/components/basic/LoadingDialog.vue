<template>
    <v-dialog v-model="loadingDialog" hide-overlay persistent width="300">
        <v-card color="primary" dark>
            <v-card-text class="text-sm-center">
                {{title}}
                <v-progress-linear
                    :value="value"
                    :indeterminate="!value"
                    color="white"
                    class="mb-0"
                >
                </v-progress-linear>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
/**
 * Диалог с progress-linear
 */

export default {
    name: "LoadingDialog",
    data() {
        return {

        }
    },
    computed: {
    },
    methods: {
    },
    props: {
        /**
         * Отображать ли диалоговое окно
         */
        loadingDialog: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: "Обрабатывается"
        },
        /**
         * Процентное значение для текущего прогресса
         */
        value: {
            type: Number,
            default: 0
        }
    },
    watch: {},
    created() {}
};
</script>
