<template>
    <v-container>
        <v-data-table
            :headers="headers"
            no-data-text="Список генеральных договоров пуст"
            :footer-props="{
          itemsPerPageText:'',
          itemsPerPageOptions:[5,10,25,50,{text:'Все', value: -1}],
        }"
            :items-per-page="items_per_page"
            :items="general_agreements"
            locale="ru-RU"
            class="elevation-1 tr-pointer">
            <template v-slot:item="{ item}">
                <tr @click="select(item.id)">
                    <td>
                    <span style="white-space: nowrap">
                        {{item.number}}
                    </span>
                    </td>
                    <td v-if="!hide_holder_td">{{ get_holder_name(item.partyId) }}</td>
                    <td>{{ format_date(item.applied)}}</td>
                    <td>
                        {{ format_date(item.since)}} <br/> {{format_date(item.till)}}
                    </td>
                    <td class="text-xs-right">
                        <v-tooltip top>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    icon
                                    class="mr-2"
                                    @click.stop="() => open_delete_modal(item)"
                                    v-on="on">
                                    <v-icon color="primary">
                                        delete
                                    </v-icon>
                                </v-btn>
                            </template>
                            <span>Удалить договор</span>
                        </v-tooltip>
                    </td>
                </tr>
            </template>
            <template v-slot:no-data>
                <v-layout wrap pt-2 px-2 v-if="alert">
                    <v-flex sm12>
                        <v-alert text color="warning" icon="info">
                            Не найдено
                        </v-alert>
                    </v-flex>
                </v-layout>
                <template v-else>
                    Список пуст
                </template>
            </template>

        </v-data-table>
        <v-dialog
            v-model="delete_modal"
            max-width="400px"
        >
            <v-card>
                <v-card-title class="headline">Предупреждение</v-card-title>
                <v-card-text>Вы уверены, что хотите удалить договор?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="red darken-1"
                        text
                        @click="delete_modal = false"
                    >Отмена</v-btn>
                    <v-btn
                        color="teal darken-1"
                        text
                        @click="delete_agreement"
                    >
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>

    import {route_names} from "../utils/consts";
    import {format_date} from "../utils/date_util";

    export default {
        name: "GeneralAgreementsTable",
        components: {},
        data() {
            return {
                delete_modal: false,
                current_agreement: null,
            }
        },
        props: {
            /**
             * Список генеральных договоров
             */
            general_agreements: {
                type: Array,
                default: () => []
            },
            /**
             * Отображать предупреждение,
             * если список генеральных договоров пуст
             */
            alert: {
                type: Boolean,
                default: false
            },
            /**
             * Скрыть столбец с именем страхователя
             */
            hide_holder_td: {
                type: Boolean,
                default: false
            },
            /**
             * Начальное количество записей, для отображения в таблице
             */
            items_per_page: {
                default: 25
            },

            is_general: {
                default: true,
            }
        },
        computed: {

            parties_detail() {
                return this.$store.getters["cargo/get_parties_detail"];
            },
            headers() {
                let headers = [
                    {text: "Номер", value: "number", sortable: false},
                    {text: "Дата заключения", value: "signed", sortable: false},
                    {text: "Дата начала/окончания действия", value: "sinceTill", sortable: false},
                    {text: "", value: "actions", align: "right", sortable: false},
                ];
                if (!this.hide_holder_td)
                    headers.splice(0, 0,
                        {text: "Страхователь", value: "holderId", sortable: false},
                    );
                return headers;
            }
        },
        watch: {},
        created() {
        },
        methods: {
            open_delete_modal(item) {
                this.current_agreement = item
                this.delete_modal = true
            },
            get_holder_name(holder_id) {
                for (let i = 0; i < this.parties_detail.length; i++) {
                    let party = this.parties_detail[i];
                    if (party.id === holder_id)
                        return party.name;
                }
                return "";
            },
            delete_agreement() {
                const url = this.is_general
                    ? `${this.current_agreement.id}`
                    : `additionalAgreement/${this.current_agreement.id}`
                this.$general_agreements.delete(url)
                    .then(() => {
                        this.$emit('delete_agreement', this.current_agreement.id)
                        this.delete_modal = false
                    }).catch((e) => console.log(e))
            },
            select(id) {
                /**
                 * Инициируется когда пользователь
                 * осуществил выбор генерального договора
                 */
                if (this.$route.name === route_names.GENERAL_AGREEMENT_DETAIL) {
                    this.$router.push({
                        name: route_names.ADDITIONAL_AGREEMENT_DETAIL,
                        params: {
                            "id": id
                        }
                    });
                } else {
                    this.$router.push({
                        name: route_names.GENERAL_AGREEMENT_DETAIL,
                        params: {
                            "id": id
                        }
                    });
                }
            },
            format_date
        },
    };
</script>
<style>

</style>
