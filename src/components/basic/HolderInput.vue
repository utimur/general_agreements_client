<template>
    <div>
        <party-wrapper
            :disabled="disabled || disabled_input"
            :prependIcon="prependIcon"
            :clearable="clearable"
            :hideDetails="hideDetails"
            :required="required"
            :readonly="readonly"
            :simple="false"
            is-bank-account-required
            :include_ids="include_party_ids"
            v-model="id"
            :label="label"
            :role="PARTY_HOLDER_ROLE"
            @select_party="select_party"
            @input="input_party_id"
            @error_send_for_approve="refuse_select"
            @holder_send_for_approve="get_holders"
        >
            <!-- @slot Добавляет элемент вне ввода и после ввода содержимого -->
            <slot name="append" slot="append"/>
        </party-wrapper>

        <v-layout wrap pt-2 px-2 v-if="alert && !readonly">
            <v-flex sm12>
                <v-alert text color="warning" icon="info">
                    {{alert_message}}
                </v-alert>
            </v-flex>
        </v-layout>
    </div>
</template>
<script>
    import PartyWrapper from "./PartyWrapper";
    import {party_roles} from "../../utils/consts";

    /**
     * Поиск и выбор страхователей
     */

    export default {
        name: "HolderInput",
        components: {
            PartyWrapper
        },
        data() {
            return {
                id: null,
                include_party_ids: null,
                alert: false,
                alert_message: "",
                disabled_input: false,
                is_refuse_selecting: false,
                can_select_party: true,
                PARTY_HOLDER_ROLE: party_roles.HOLDER
            }
        },
        watch: {
            value(new_value) {
                this.id = new_value;
            },
            id(new_value) {
                /**
                 * Инициируется когда присваивается значение
                 *
                 * @property {number} new_value
                 */
                this.$emit("input", new_value);
            }
        },
        created() {
            this.id = this.value;
            this.get_holders();
        },
        computed: {
            user_id() {
                return this.$store.getters["cargo/get_user"].id;
            },
        },
        methods: {
            refuse_select(error, id) {
                if (!this.include_party_ids.some(include_id => include_id === id)) {
                    this.id = null;
                    this.alert_message = "Не удалось отправить страхователя на утверждение.";
                    this.alert = true;
                }
                else if (!this.can_select_party){
                    this.alert_message = "Можно выбрать только утвержденного страхователя.";
                    this.alert = true;
                }
            },
            input_party_id(id) {
                if (id && !this.can_select_party) {
                    setTimeout(() => this.id = null, 100);
                    this.alert_message = "Можно выбрать только утвержденного страхователя.";
                    this.alert = true;
                }
                this.can_select_party = true;
            },
            select_party(party) {
                if (this.only_active && !party.roles.some(role => role.role.name === this.PARTY_HOLDER_ROLE))
                    this.can_select_party = false;
                else
                    this.alert = false;
            },
            get_holders() {
                this.$cargo_adminHost.get("/holderManager",
                    {
                        params: {
                            employeeId: this.user_id
                        }
                    })
                    .then(response => {
                        this.include_party_ids = this.get_holder_ids(response.data);
                        if (!this.include_party_ids.length) {
                            this.alert_message = "Вы не закреплены ни за одним страхователем";
                            this.alert = true;
                            this.disabled_input = true;
                        }
                    })
            },
            get_holder_ids(items) {
                let ids = [];
                items.forEach(item => {
                    ids.push(item.holderId)
                });
                return ids;
            },
        },
        props: {
            /**
             * @model
             */
            value: {
                default: null
            },
            /**
             * Название поля ввода
             */
            label: {
                type: String,
                default: "Страхователь"
            },
            /**
             * Добавляет иконку перед вводом
             */
            prependIcon: {
                type: String,
                default: null
            },
            required: {
                type: Boolean,
                default: false
            },
            /**
             * Переводит ввод в состояние только для чтения
             */
            readonly: {
                type: Boolean,
                default: false
            },
            /**
             * Добавить возможность очистки ввода
             */
            clearable: {
                type: Boolean,
                default: false
            },
            /**
             * Скрывает подсказки и ошибки проверки (свойство messages)
             */
            hideDetails: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Boolean,
                default: false
            },
            /**
             * Разрешить выбор только активных страхователей
             */
            only_active: {
                type: Boolean,
                default: true
            }
        },

    }
</script>

<style scoped>
    .pointer {
        cursor: pointer;
    }
</style>