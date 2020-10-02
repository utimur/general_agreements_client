<template>
    <div>
        <v-snackbar :color="alert_type" :top="true" :timeout="5000" v-model="alert" :type="alert_type">
            {{alert_message}}
            <template v-slot:action>
                <v-btn dark text @click="alert = false">✕</v-btn>
            </template>
        </v-snackbar>
        <v-layout>
            <v-flex>
                <party-input
                    v-if="isPartyInput"
                    @saveWithoutProtectedRoles="approve_holder"
                    @selected="select_party"
                    :disabled="disabled"
                    :prependIcon="prependIcon"
                    :clearable="clearable"
                    :hideDetails="hideDetails"
                    :protectedRoles="protected_roles"
                    :required="required"
                    :readonly="readonly"
                    :includeIds="include_ids"
                    :roleProp="role"
                    :insuranceSystemProp="CARGO"
                    :is-bank-account-required="isBankAccountRequired"
                    v-model="id"
                    :label="label"
                    :simple="simple"
                    @input="input_party_id"
                    :showChooseOfBank="showChooseOfBank"
                />

                <party
                    v-else
                    @save="save"
                    @saveWithoutProtectedRoles="approve_holder"
                    @loadedError="loadedError"
                    @loadedParty="loadedParty"
                    :partyProp="partyProp"
                    :headerText="headerText"
                    :partyId="partyId"
                    :is-bank-account-required="isBankAccountRequired"
                    :simple="simple"
                    :snapshot="!showSnapshotBtn"
                    :showSaveBtn="showSaveBtn"
                    :readonly="readonly"
                    :protectedRoles="protected_roles"
                    :roleProp="role"
                    :insuranceSystemProp="CARGO"
                />
            </v-flex>

            <slot name="append"/>
        </v-layout>

        <loading-dialog :loading-dialog="loading_dialog"/>
    </div>
</template>

<script>
    import LoadingDialog from "./LoadingDialog";
    import {common_consts, party_roles} from "../../utils/consts";

    /**
     * Обертка над party для добавления дополнительной логики
     */

    export default {
        name: "PartyWrapper",
        components: {LoadingDialog},
        data() {
            return {
                id: null,
                protected_roles: [party_roles.HOLDER],
                alert: false,
                alert_type: "error",
                alert_message: "",
                loading_dialog: false,
                CARGO: common_consts.SYSTEM,
            }
        },
        props: {
            /**
             * @model
             */
            value: {
                default: null
            },
            /**
             * Включить проверку полей на обязательность
             */
            simple: {
              type: Boolean,
              default: true
            },
            isBankAccountRequired: {
                type: Boolean,
                default: false
            },
            /**
             * Список id, которые необходимо отображать в поиске
             */
            include_ids: {
                type: Array,
                default: null
            },
            /**
             * Предварительно заполненый контрагент
             */
            partyProp: {
                type: Object,
                default: null,
            },
            partyId: {
                default: null,
            },
            /**
             * Показ кнопки истории
             */
            showSnapshotBtn: {
                default: false,
                type: Boolean
            },
            /**
             * Отображать компонент input для поиска/создания/редактирования
             * контрагента или форму создания/редактирования
             */
            isPartyInput: {
                type: Boolean,
                default: true
            },
            /**
             * Название поля ввода
             */
            label: {
                type: String,
                default: "Контрагент"
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
             * Отображать кнопку "Сохранить"
             */
            showSaveBtn: {
                default: true,
                type: Boolean
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
             * Принимает функцию, которая будет запущена
             * после сохранения контрагента
             */
            save: {
                type: Function,
                default: () => {
                }
            },
            /**
             * Включить обработку ролей (например, для роли страхователя
             * будет выполнена дополнительная логика)
             */
            excludeHandlerRoles: {
                type: Boolean,
                default: false
            },
            headerText: {
                default: "Контрагент",
                type: String
            },
            role: {
                type: String,
                default: null
            },
            /**
             * Отображать банк для выбора
             */
            showChooseOfBank: {
                default: true,
                type: Boolean
            }
        },
        methods: {
            input_party_id(id) {
                this.$emit("input", id);
            },
            select_party(party) {
                this.$emit("select_party", party);
            },
            loadedParty(party) {
                this.$emit("loadedParty", party);
            },
            loadedError(error) {
                this.$emit("loadedError", error);
            },
            show_success_alert(message) {
                this.alert_type = "success";
                this.alert_message = message;
                this.alert = true;
            },
            show_error_alert(message) {
                this.alert_type = "error";
                this.alert_message = message;
                this.alert = true;
            },
            error_handler(error) {
                if (error.response
                    && error.response.status === 400
                    && error.response.data)
                    this.show_error_alert(error.response.data.description);
                else
                    this.show_error_alert("Непредвиденная ошибка");
            },
            approve_holder(partyId, roles) {
                if (this.excludeHandlerRoles || !roles.some(role => role === party_roles.HOLDER))
                    return;
                this.loading_dialog = true;
                this.$cargo_adminHost.post("/holderCreation", {}, {
                    params: {
                        partyId: partyId
                    }
                })
                    .then(response => response.data)
                    .then(() => {
                        this.show_success_alert("Страхователь отправлен на утверждение");
                        this.$emit("holder_send_for_approve");
                    })
                    .catch(error => {
                        this.$emit("error_send_for_approve", error, partyId);
                        this.error_handler(error);
                    })
                    .finally(() => {
                        this.loading_dialog = false;
                    });
            }
        },
        watch: {
            value(new_value) {
                this.id = new_value;
            },
            id(new_value) {
                this.$emit("input", new_value);
            }
        },
        created() {
            this.id = this.value;
        }
    };
</script>
