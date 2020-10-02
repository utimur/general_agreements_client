<template>
    <v-layout class="justify-center">
        <v-flex xs12 md6 lg4>
            <v-card>
                <v-card-title>
                    Непредвиденная ошибка
                </v-card-title>
                <v-card-text>
                    Извините, возникла непредвиденная ошибка.
                    Возможно, ваш запрос устарел, либо не может быть обработан.
                    В случае, если вы уверены, что запрос должен быть обработан, обратитесь в службу поддержки
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn outlined color="primary" @click="redirect">
                        {{redirect_btn_title}}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-flex>
    </v-layout>

</template>

<script>
    const HOME_PATH = "/";

    export default {
        name: "UnexpectedError",
        beforeRouteEnter(to, from, next) {
            next(vm => {
                    if (from.params.hasOwnProperty("id") && from.matched && from.matched.length > 1)
                        vm.redirect_path = from.matched[from.matched.length - 2].path;
                    else
                        vm.redirect_path = from.fullPath;
                }
            )
        },
        data() {
            return {
                redirect_path: HOME_PATH
            }
        },
        computed: {
            redirect_btn_title() {
                return this.redirect_path === HOME_PATH ? "На главную" : "Назад";
            }
        },
        methods: {
            redirect() {
                this.$router.push(this.redirect_path);
            }
        }
    }
</script>

<style scoped>

</style>