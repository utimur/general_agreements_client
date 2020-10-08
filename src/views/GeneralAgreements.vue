<template>
    <v-container fluid>
        <v-snackbar :color="alert_type" :top="true" :timeout="5000" v-model="alert" :type="alert_type">
            {{alert_message}}
            <template v-slot:action>
                <v-btn dark text @click="alert = false">✕</v-btn>
            </template>
        </v-snackbar>
        <v-window v-model="step">
            <v-window-item :value="1">
                <v-layout justify-center>
                    <v-flex xs11 md11 lg9 xl7>
                        <v-card>
                            <v-card-text>
                                <v-layout>
                                    <v-flex pb-2>
                                        <h2 class="text-sm-center text-uppercase primaryDark--text">Генеральные
                                            договоры
                                        </h2>
                                    </v-flex>
                                </v-layout>
                                <v-layout wrap justify-space-around pb-2>
                                    <v-row class="d-flex align-center">
                                        <v-col>
                                            <holder-input
                                                :only_active="false"
                                                clearable
                                                hide-details
                                                :readonly="false"
                                                v-model="filter.partyId"
                                                @input="search_by_holder"
                                                label="Поиск по страхователю"
                                            />
                                        </v-col>
                                        <v-col cols="1">
                                            <v-tooltip bottom >
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-icon
                                                        color="primary"
                                                        dark
                                                        large
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        @click="filter_dialog_visible = true"
                                                    >
                                                        filter_list
                                                    </v-icon>
                                                </template>
                                                <span>Расширенный поиск</span>
                                            </v-tooltip>
                                        </v-col>
                                    </v-row>
                                </v-layout>
                                <v-layout
                                    flex-row
                                    justify-center
                                >
                                    <v-btn-toggle
                                        v-model="general_agreement_status"
                                        tile
                                        color="primary"
                                        group
                                        mandatory
                                    >
                                        <v-btn
                                            small
                                            value="CANCELED_STATUS"
                                        >
                                            Расторгнутые
                                        </v-btn>
                                        <v-btn
                                            small
                                            value="ACTIVE_STATUS"
                                        >
                                            Действующие
                                        </v-btn>

                                    </v-btn-toggle>
                                </v-layout>
                                <general-agreements-table
                                    :general_agreements="general_agreements_with_status"
                                    :alert="search_alert"
                                    @select="resetScanFileProps"
                                    @delete_agreement="delete_agreement"
                                />
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-window-item>
            <v-window-item :value="2">
                <agreement
                    @show_error_alert="show_error_alert"
                    @show_success_alert="show_success_alert"
                />
            </v-window-item>
            <v-window-item :value="3">
                <agreement
                    @show_error_alert="show_error_alert"
                    @show_success_alert="show_success_alert"
                />
            </v-window-item>
        </v-window>
        <v-speed-dial
            class="dial"
            v-if="step === 2 || step === 3"
            :top="true"
            :left="true"
            fixed
            transition="slide-y-reverse-transition"
        >
            <template v-slot:activator>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            v-on="on"
                            @click="back_to_list"
                            color="primary"
                            dark
                            fab
                        >
                            <v-icon>
                                keyboard_backspace
                            </v-icon>
                        </v-btn>
                    </template>
                    <span>Назад</span>
                </v-tooltip>
            </template>
        </v-speed-dial>
        <v-speed-dial
            class="dial"
            :top="true"
            v-if="is_searching"
            right
            fixed
        >
            <template v-slot:activator>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            dark
                            fab
                            @click="create_general_agreement"
                            v-on="on"
                            class="mb-4"
                            color="primary"
                        >
                            <v-icon>
                                add
                            </v-icon>
                        </v-btn>
                    </template>
                    <span>Создать генеральный договор</span>
                </v-tooltip>
            </template>
        </v-speed-dial>
        <v-speed-dial
            class="dial"
            :top="true"
            v-if="(is_showing_general_agreement && !is_creating_general_agreement)
            && ($store.getters['cargo/get_current_general_agreement'] &&  !$store.getters['cargo/get_current_general_agreement'].cancelled)"
            right
            fixed
        >
            <template v-slot:activator>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            dark
                            fab
                            v-on="on"
                            @click="create_additional_agreement"
                            class="mb-4"
                            color="primary"
                        >
                            <v-icon>
                                add
                            </v-icon>
                        </v-btn>
                    </template>
                    <span>Создать дополнительный договор</span>
                </v-tooltip>
            </template>
        </v-speed-dial>
        <filter-dialog
            :value="filter_dialog_visible"
            @hide_filter_dialog="filter_dialog_visible = false"
            @search="search_by_criteria"
        />
        <LoadingDialog
            :loading-dialog="loading_dialog"
            :title="loading_label"
        />
    </v-container>
</template>

<script>
import Kinds from "../assets/selections"
import DictionarySelection from "../components/basic/DictionarySelection";
import LoadingDialog from "../components/basic/LoadingDialog";
import {route_names, search_names} from "../utils/consts";
import {load_parties_detail} from "../utils/load_parties_detail";
import DateInput from "../components/basic/DateInput";
import {format_date} from "../utils/date_util";
import rules from "../utils/rules";
import GeneralAgreementsTable from "../components/GeneralAgreementsTable";
import HolderInput from "../components/basic/HolderInput";
import Agreement from "../components/Agreement";
import FilterDialog from "../components/FilterDialog";

export default {
    name: "GeneralAgreements",
    components: {
        HolderInput,
        GeneralAgreementsTable,
        LoadingDialog,
        Agreement,
        FilterDialog
    },
    data() {
        return {
            filter_dialog_visible: false,
            loading: false,
            loading_dialog: false,
            loading_label: null,
            search_alert: false,
            step: 1,
            general_agreements: [],
            general_agreements_with_status: [],
            general_agreement_status: 'ACTIVE_STATUS',
            alert_type: "success",
            alert_message: "",
            alert: false,
            filter: {},
            loading_dialog_value: 0,
            headers: [
                {text: "Номер", value: "number", sortable: false},
                {text: "Страхователь", value: "partyId", sortable: false},
                {text: "Дата заключения", value: "signed", sortable: false},
                {text: "Дата начала/окончания действия", value: "sinceTill", sortable: false},
                {text: "", value: "actions", align: "right", sortable: false},
            ],
            rules: rules,
            kinds: Kinds,
        }
    },
    computed: {
        is_searching() {
            return this.step === 1;
        },
        is_creating_general_agreement() {
            return this.$route.name === route_names.GENERAL_AGREEMENT_CREATE
        },
        is_showing_general_agreement() {
            return this.step === 2;
        },
        is_creating_additional_agreement() {
            return this.$route.name === route_names.ADDITIONAL_AGREEMENT_CREATE
        },
        is_showing_additional_agreement() {
            return this.$route.name === route_names.ADDITIONAL_AGREEMENT_DETAIL
        },
        can_manage() {
            return true;
        },
        parties_detail() {
            return this.$store.getters["cargo/get_parties_detail"];
        }
    },
    watch: {
        "$route"(to) {
            this.route_handler(to);
        },
        general_agreement_status(newVal) {
            this.filter_general_agreements_by_status(newVal);
        },
    },
    props: {
        holder_id: {
            default: null
        },
        cancel_redirect_params: {
            type: Object,
            default: null
        }
    },
    created() {
        this.route_handler(this.$route);
    },
    methods: {
        reset_input_form() {
            this.scan_file = null;
            if (this.$refs.scan_upload)
                this.$refs.scan_upload.$refs.input.value = null;
        },
        show_alert() {
            this.search_alert = true;
            setTimeout(() => {
                this.search_alert = false;
            }, 3000);
        },
        get_all_agreements() {
            this.loading = true;
            this.$general_agreements.get("/getAll")
                .then(response => {
                    this.general_agreements = response.data;
                    this.filter_general_agreements_by_status(this.general_agreement_status);
                    if (!this.general_agreements.length)
                        this.show_alert();
                    load_parties_detail(this.get_holder_ids(this.general_agreements), this.$store, this.$cargo_partyHost);
                    console.log(this.general_agreements)
                })
                .catch(error => {
                    this.show_error_alert(error)
                })
                .finally(() => this.loading = false);
        },
        search_by_holder() {
            this.loading = true;
            this.$general_agreements.get(`/getByPartyId/${this.filter.partyId}`)
                .then(response => {
                    this.filter_dialog_visible = false
                    this.general_agreements = response.data;
                    this.filter_general_agreements_by_status(this.general_agreement_status);
                    if (!this.general_agreements.length)
                        this.show_alert();
                    load_parties_detail(this.get_holder_ids(this.general_agreements), this.$store, this.$cargo_partyHost);
                })
                .catch(error => {
                    this.show_error_alert(error)
                })
                .finally(() => this.loading = false);
        },
        search_by_criteria(criteria) {
            this.loading = true;
            this.$general_agreements.post(`/agreement/search`, criteria)
                .then(response => {
                    this.filter_dialog_visible = false
                    this.general_agreements = response.data;
                    this.filter_general_agreements_by_status(this.general_agreement_status);
                    if (!this.general_agreements.length)
                        this.show_alert();
                    load_parties_detail(this.get_holder_ids(this.general_agreements), this.$store, this.$cargo_partyHost);
                })
                .catch(error => {
                    this.show_error_alert(error)
                })
                .finally(() => this.loading = false);
        },
        get_holder_ids(general_agreements) {
            let ids = [];
            if (general_agreements)
                general_agreements.forEach(agreement => ids.push(agreement.partyId));
            return ids;
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
        create_general_agreement() {
            this.resetScanFileProps();
            this.$router.push({
                name: route_names.GENERAL_AGREEMENT_CREATE
            });
        },
        create_additional_agreement() {
            this.resetScanFileProps();
            this.$store.commit('cargo/set_current_general_agreement_id', this.$route.params.id)
            this.$router.push({
                name: route_names.ADDITIONAL_AGREEMENT_CREATE
            });
        },

        resetScanFileProps() {
            this.last_loaded_file_name = "";
            this.reset_input_form();
            this.last_loaded_file_name = "";
        },

        cancel_editing() {
            if (this.cancel_redirect_params)
                this.cancel_redirect();
            else
                this.back_to_list();
            this.readonly = true;
        },
        cancel_redirect() {
            this.$router.push({
                name: this.cancel_redirect_params.name,
                params: this.cancel_redirect_params.params
            });
        },
        back_to_list() {
            this.$router.back()
        },
        route_handler(route) {
            switch (route.name) {
                case route_names.GENERAL_AGREEMENT:
                    this.step = 1;
                    this.get_all_agreements()
                    break
                case route_names.GENERAL_AGREEMENT_DETAIL :
                    this.step = 2
                    break
                case route_names.GENERAL_AGREEMENT_CREATE:
                    this.step = 2
                    break
                case route_names.ADDITIONAL_AGREEMENT_CREATE:
                    this.step = 3
                    break
                case route_names.ADDITIONAL_AGREEMENT_DETAIL:
                    this.step = 3
                    break
            }
        },
        show_loading_dialog(title, show_steps) {
            if (title)
                this.loading_label = title;
            else
                this.loading_label = "Обрабатывается";
            if (!show_steps)
                this.loading_dialog_value = 0;
            this.loading_dialog = true;
        },
        filter_general_agreements_by_status(status) {
            switch (status) {
                case 'CANCELED_STATUS':
                    this.general_agreements_with_status = this.general_agreements.filter(ga => ga.cancelled);
                    break;
                case 'ACTIVE_STATUS':
                    this.general_agreements_with_status = this.general_agreements.filter(ga => !ga.cancelled);
                    break;
            }
        },
        delete_agreement(id) {
            this.general_agreements = this.general_agreements.filter(agr => agr.id !== id)
            this.filter_general_agreements_by_status(this.general_agreement_status)
        },
        format_date
    },
};
</script>
<style>
.snackbar-btn {
    width: 100px !important;
}

.important-text-field.theme--light.v-text-field--outlined fieldset {
    border-color: red !important;
}

.important-text-field.v-text-field--outlined .v-label {
    color: red !important
}

.scan-filename-small {
    color: #004D40;
    margin-top: 10px;
}

.scan-filename-small:hover {
    text-decoration: underline;
    cursor: pointer;
}

.scan-filename-title {
    margin: 10px 10px 0px 5px;
}

.scan-input {
    margin-right: 10px;
}

.scan-input:hover {
    cursor: none !important;
}

.status-border {
    border: solid 1px rgb(244, 67, 54);
    border-radius: 5px;
    padding: 2px 5px 2px 5px;
}

</style>
