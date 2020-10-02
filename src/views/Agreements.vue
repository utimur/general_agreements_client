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
                                    <v-flex>
                                        <holder-input
                                            :only_active="false"
                                            clearable
                                            hide-details
                                            :readonly="false"
                                            v-model="filter.holderId"
                                            @input="search"
                                            label="Поиск по страхователю"
                                        />
                                    </v-flex>
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
                                />
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-window-item>
            <v-window-item :value="2">
                <v-layout justify-space-around>
                    <v-flex xs12 md8 lg6 xl4>
                        <v-card>
                            <v-form ref="form" lazy-validation v-model="form_valid">
                                <v-container v-if="general_agreement != null">
                                    <v-layout flex-row justify-center mb-3>
                                        <v-layout justify-self-center justify-end>
                                            <h3 class="text-sm-left text-uppercase primaryDark--text">
                                                {{general_title}}
                                            </h3>
                                        </v-layout>
                                        <v-layout justify-self-end justify-end>
                                            <div v-if="!is_new">
                                                <v-btn
                                                    v-if="!is_canceled"
                                                    color="error"
                                                    small
                                                    @click="cancel_general_agreement"
                                                >
                                                    Расторгнуть
                                                </v-btn>
                                                <h3 v-else class="status-border body-1 red--text">
                                                    Расторгнут
                                                </h3>
                                            </div>
                                        </v-layout>
                                    </v-layout>
                                    <v-layout column>
                                        <v-text-field
                                            v-if="is_new"
                                            :rules="[rules.required]"
                                            outlined
                                            :readonly="readonly"
                                            label="Номер документа*"
                                            v-model="general_agreement.number"/>
                                        <holder-input
                                            :only_active="false"
                                            required
                                            :readonly="!is_new"
                                            v-model="general_agreement.holderId"
                                            label="Страхователь*"
                                        />
                                        <dictionary-selection
                                            :class="readonly || general_agreement.kindOfInsuranceList.length > 1 ? 'pb-3' : ''"
                                            :can_manage="false"
                                            :rules="[rules.not_empty_array]"
                                            :readonly="!is_new"
                                            label="Вид страхования*"
                                            :dictionary_type="kinds.KindOfInsurance"
                                            :menu-props-bottom="false"
                                            multiple
                                            multipleLabel="Виды страхования"
                                            v-model="general_agreement.kindOfInsuranceList"
                                        />
                                        <date-input
                                            :rules="[rules.required]"
                                            :readonly="readonly"
                                            label="Дата заключения*"
                                            :max="general_agreement.since"
                                            v-model="general_agreement.signed"
                                        />
                                    </v-layout>
                                    <v-layout mb-2>
                                        <div class="subtitle-2">Дата действия генерального договора</div>
                                    </v-layout>
                                    <v-layout>
                                        <v-flex mr-2 xs12 md6>
                                            <date-input
                                                :rules="[rules.required]"
                                                :readonly="readonly"
                                                label="Начало*"
                                                :min="general_agreement.signed"
                                                :max="general_agreement.till"
                                                v-model="general_agreement.since"/>
                                        </v-flex>
                                        <v-flex ml-2 xs12 md6>
                                            <date-input
                                                :readonly="readonly"
                                                label="Окончания"
                                                @input="input_till_date"
                                                :min="general_agreement.since"
                                                v-model="general_agreement.till"/>
                                        </v-flex>
                                    </v-layout>
                                    <v-layout column>
                                        <v-checkbox
                                            :disabled="!readonly && !general_agreement.till"
                                            :readonly="readonly"
                                            @change="check_auto_renew"
                                            v-model="general_agreement.autoRenew"
                                            label="Автоматическая пролонгация"/>
                                        <v-text-field
                                            :disabled="!readonly && !general_agreement.autoRenew"
                                            :rules="general_agreement.autoRenew ? [rules.required, rules.non_negative] : []"
                                            outlined
                                            type="number"
                                            :readonly="readonly"
                                            label="На сколько дней продлевать"
                                            v-model="general_agreement.renewDays"
                                        />
                                    </v-layout>
                                    <template v-if="!is_new">
                                        <v-layout mb-4 v-if="last_loaded_file_name">
                                            <div class="subtitle-2 scan-filename-title">
                                                Последний загруженный скан:
                                            </div>
                                            <v-tooltip bottom>
                                                <template v-slot:activator="{ on }">
                                                    <span
                                                        class="subtitle-2 scan-filename-small"
                                                        @click="on_scan_download"
                                                        v-on="on"
                                                    >
                                                        {{ last_loaded_file_name }}
                                                    </span>
                                                </template>
                                                <span>Скачать</span>
                                            </v-tooltip>
                                        </v-layout>
                                        <v-layout justify-space-between>
                                            <v-btn
                                                text
                                                small
                                                @click="open_upload_form"
                                                color="primary"
                                            >
                                                Загрузить новый скан
                                            </v-btn>
                                            <v-btn
                                                v-if="last_loaded_file_name"
                                                text
                                                small
                                                @click="on_all_scans_download"
                                                color="primary"
                                            >
                                                Скачать все ранее загруженные сканы
                                            </v-btn>

                                        </v-layout>
                                        <v-file-input
                                            v-model="scan_file"
                                            ref="scan_upload"
                                            @change="on_scan_upload"
                                            v-show="false"
                                        />
                                        <v-expansion-panels accordion class="mt-4 mb-4">
                                            <v-expansion-panel>
                                                <v-expansion-panel-header class="font-weight-bold">{{ additional_panel_header }}</v-expansion-panel-header>
                                                <v-expansion-panel-content v-if="additional_agreements.length">
                                                    <general-agreements-table
                                                        :general_agreements="additional_agreements"
                                                    />
                                                </v-expansion-panel-content>
                                            </v-expansion-panel>
                                        </v-expansion-panels>
                                    </template>
                                </v-container>
                            </v-form>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-window-item>
            <v-window-item :value="3">
                <v-layout justify-space-around>
                    <v-flex xs12 md8 lg6 xl4>
                        <v-card>
                            <v-form ref="form" lazy-validation v-model="form_valid">
                                <v-container v-if="general_agreement != null">
                                    <v-layout flex-row justify-center mb-3>
                                        <v-layout justify-self-center justify-end>
                                            <h3 class="text-sm-left text-uppercase primaryDark--text">
                                                {{general_title}}
                                            </h3>
                                        </v-layout>
                                        <v-layout justify-self-end justify-end>
                                            <div v-if="!is_new">
                                                <v-btn
                                                    v-if="!is_canceled"
                                                    color="error"
                                                    small
                                                    @click="cancel_general_agreement"
                                                >
                                                    Расторгнуть
                                                </v-btn>
                                                <h3 v-else class="status-border body-1 red--text">
                                                    Расторгнут
                                                </h3>
                                            </div>
                                        </v-layout>
                                    </v-layout>
                                    <v-layout column>
                                        <v-text-field
                                            v-if="is_new"
                                            :rules="[rules.required]"
                                            outlined
                                            :readonly="readonly"
                                            label="Номер документа*"
                                            v-model="general_agreement.number"/>
                                        <holder-input
                                            :only_active="false"
                                            required
                                            :readonly="!is_new"
                                            v-model="general_agreement.holderId"
                                            label="Страхователь*"
                                        />
                                        <dictionary-selection
                                            :class="readonly || general_agreement.kindOfInsuranceList.length > 1 ? 'pb-3' : ''"
                                            :can_manage="false"
                                            :rules="[rules.not_empty_array]"
                                            :readonly="!is_new"
                                            label="Вид страхования*"
                                            :dictionary_type="kinds.KindOfInsurance"
                                            :menu-props-bottom="false"
                                            multiple
                                            multipleLabel="Виды страхования"
                                            v-model="general_agreement.kindOfInsuranceList"
                                        />
                                        <date-input
                                            :rules="[rules.required]"
                                            :readonly="readonly"
                                            label="Дата заключения*"
                                            :max="general_agreement.since"
                                            v-model="general_agreement.signed"
                                        />
                                    </v-layout>
                                    <v-layout mb-2>
                                        <div class="subtitle-2">Дата действия генерального договора</div>
                                    </v-layout>
                                    <v-layout>
                                        <v-flex mr-2 xs12 md6>
                                            <date-input
                                                :rules="[rules.required]"
                                                :readonly="readonly"
                                                label="Начало*"
                                                :min="general_agreement.signed"
                                                :max="general_agreement.till"
                                                v-model="general_agreement.since"/>
                                        </v-flex>
                                        <v-flex ml-2 xs12 md6>
                                            <date-input
                                                :readonly="readonly"
                                                label="Окончания"
                                                @input="input_till_date"
                                                :min="general_agreement.since"
                                                v-model="general_agreement.till"/>
                                        </v-flex>
                                    </v-layout>
                                    <v-layout column>
                                        <v-checkbox
                                            :disabled="!readonly && !general_agreement.till"
                                            :readonly="readonly"
                                            @change="check_auto_renew"
                                            v-model="general_agreement.autoRenew"
                                            label="Автоматическая пролонгация"/>
                                        <v-text-field
                                            :disabled="!readonly && !general_agreement.autoRenew"
                                            :rules="general_agreement.autoRenew ? [rules.required, rules.non_negative] : []"
                                            outlined
                                            type="number"
                                            :readonly="readonly"
                                            label="На сколько дней продлевать"
                                            v-model="general_agreement.renewDays"
                                        />
                                    </v-layout>
                                    <template v-if="!is_new">
                                        <v-layout mb-4 v-if="last_loaded_file_name">
                                            <div class="subtitle-2 scan-filename-title">
                                                Последний загруженный скан:
                                            </div>
                                            <v-tooltip bottom>
                                                <template v-slot:activator="{ on }">
                                                    <span
                                                        class="subtitle-2 scan-filename-small"
                                                        @click="on_scan_download"
                                                        v-on="on"
                                                    >
                                                        {{ last_loaded_file_name }}
                                                    </span>
                                                </template>
                                                <span>Скачать</span>
                                            </v-tooltip>
                                        </v-layout>
                                        <v-layout justify-space-between>
                                            <v-btn
                                                text
                                                small
                                                @click="open_upload_form"
                                                color="primary"
                                            >
                                                Загрузить новый скан
                                            </v-btn>
                                            <v-btn
                                                v-if="last_loaded_file_name"
                                                text
                                                small
                                                @click="on_all_scans_download"
                                                color="primary"
                                            >
                                                Скачать все ранее загруженные сканы
                                            </v-btn>

                                        </v-layout>
                                        <v-file-input
                                            v-model="scan_file"
                                            ref="scan_upload"
                                            @change="on_scan_upload"
                                            v-show="false"
                                        />
                                        <v-expansion-panels accordion class="mt-4 mb-4">
                                            <v-expansion-panel>
                                                <v-expansion-panel-header class="font-weight-bold">{{ additional_panel_header }}</v-expansion-panel-header>
                                                <v-expansion-panel-content v-if="additional_agreements.length">
                                                    <general-agreements-table
                                                        :general_agreements="additional_agreements"
                                                    />
                                                </v-expansion-panel-content>
                                            </v-expansion-panel>
                                        </v-expansion-panels>
                                    </template>
                                </v-container>
                            </v-form>
                        </v-card>
                    </v-flex>
                </v-layout>
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
            v-if="is_showing_general_agreement && !is_creating_general_agreement"
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
        <LoadingDialog
            :loading-dialog="loading_dialog"
            :title="loading_label"
            :value="loading_dialog_value"
        />
        <v-snackbar
            color="primary"
            :timeout="-1"
            :value="snackbar_btns"
        >
            Создание генерального договора
            <template v-slot:action>
                <v-btn
                    small
                    dark
                    @click="cancel_editing"
                    color="error"
                    class="snackbar-btn mr-1"
                >
                    Отмена
                </v-btn>
                <v-btn
                    small
                    dark
                    @click="save"
                    :disabled="!form_valid"
                    color="green"
                    class="snackbar-btn ml-1"
                >
                    Сохранить
                </v-btn>
            </template>
        </v-snackbar>
        <v-snackbar
            color="primary"
            :value="snackbar_editing"
        >
            Редактировать текущий договор
            <template v-slot:action>
                <v-btn
                    small
                    dark
                    @click="cancel_editing"
                    color="error"
                    class="snackbar-btn mr-1"
                >
                    Отмена
                </v-btn>
                <v-btn
                    small
                    dark
                    @click="save"
                    :disabled="!form_valid"
                    color="green"
                    class="snackbar-btn ml-1"
                >
                    Сохранить
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script>
    import Kinds from "../assets/selections"
    import DictionarySelection from "../components/basic/DictionarySelection";
    import LoadingDialog from "../components/basic/LoadingDialog";
    import {route_names} from "../utils/consts";
    import {load_parties_detail} from "../utils/load_parties_detail";
    import DateInput from "../components/basic/DateInput";
    import {format_date} from "../utils/date_util";
    import rules from "../utils/rules";
    import PartyWrapper from "../components/basic/PartyWrapper";
    import GeneralAgreementsTable from "../components/GeneralAgreementsTable";
    import HolderInput from "../components/basic/HolderInput";

    export default {
        name: "GeneralAgreement",
        components: {
            HolderInput,
            GeneralAgreementsTable,
            LoadingDialog,
            DateInput,
            DictionarySelection,
        },
        data() {
            return {
                loading: false,
                loading_dialog: false,
                search_alert: false,
                form_valid: true,
                step: 1,
                general_agreements: [],
                additional_agreement: {kindOfInsuranceList: []},
                additional_agreements:[{number: 222, since: '2020-04-05', till: '2020-04-05', signed: '2020-04-05'}],
                general_agreement: null,
                general_agreements_with_status: [],
                general_agreement_status: 'ACTIVE_STATUS',
                copy_general_agreement: null,
                readonly: true,
                alert_type: "success",
                alert_message: "",
                alert: false,
                filter: {},
                scan_file: null,
                last_loaded_file_name: "",
                loading_dialog_value: 0,
                headers: [
                    {text: "Номер", value: "number", sortable: false},
                    {text: "Страхователь", value: "holderId", sortable: false},
                    {text: "Дата заключения", value: "signed", sortable: false},
                    {text: "Дата начала/окончания действия", value: "sinceTill", sortable: false},
                    {text: "", value: "actions", align: "right", sortable: false},
                ],
                rules: rules,
                loading_label: null,
                kinds: Kinds,
                snackbar_editing: false,
            }
        },
        computed: {
            is_new() {
                return !this.general_agreement.id;
            },
            is_canceled() {
                return this.general_agreement.canceled;
            },
            is_searching() {
                return this.step === 1;
            },
            is_creating_general_agreement() {
                return this.$route.name === route_names.GENERAL_AGREEMENT_CREATE
            },
            additional_panel_header() {
                return this.additional_agreements.length ? "Список дополнительных договоров" : "Дополнительные договора отсутствуют"
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
            additional_title() {
                if (this.additional_agreement.id == null)
                    return "Создание дополнительного договора";
                else
                    return "Дополнительный договор №" + this.general_agreement.number;
            },
            can_manage() {
                return true;
            },
            general_title() {
                if (this.general_agreement.id == null)
                    return "Создание генерального договора";
                else
                    return "Генеральный договор №" + this.general_agreement.number;
            },
            snackbar_btns() {
                return !this.readonly && this.is_showing_general_agreement;
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
            }
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
            cancel_general_agreement() {
                this.$cargo_adminHost.get(`/generalAgreement/cancel/${this.general_agreement.id}`)
                    .catch(error => {
                        this.error_handler(error);
                    })
                    .then(res => {
                        if (res) {
                            this.general_agreement.canceled = true;
                        }
                    });
            },
            check_auto_renew(new_value) {
                if (!new_value) {
                    this.general_agreement.renewDays = null;
                }
            },
            input_till_date(new_value) {
                if (!new_value) {
                    this.general_agreement.autoRenew = false;
                    this.general_agreement.renewDays = null;
                }
            },
            set_last_scan_file_name(general_agreement_id) {
                this.$cargo_adminHost.get(`generalAgreement/getFileName/${general_agreement_id}`)
                    .then(res => {
                        this.last_loaded_file_name = res.data;
                    });
            },
            on_all_scans_download() {
                this.download_file(`generalAgreement/getAllScanVersions/${this.general_agreement.id}`)
            },
            on_scan_download() {
                this.download_file(`generalAgreement/getScan/${this.general_agreement.id}`)
            },
            download_file(restURL) {
                this.show_loading_dialog("Скачивание", true);
                let requestConfig = {
                    responseType: "blob",
                    onDownloadProgress:
                        (progressEvent) => this.loading_dialog_value = (progressEvent.loaded / progressEvent.total) * 100,
                };
                this.$cargo_adminHost.get(restURL, requestConfig)
                    .then(res => {
                        const fileName = decodeURI(res.headers["file-name"]).trim();
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", fileName);
                        document.body.appendChild(link);
                        link.click();
                    }).finally(() => this.loading_dialog = false)
            },
            open_upload_form() {
                this.$refs.scan_upload.$refs.input.click();
            },
            on_scan_upload() {
                if (this.scan_file) {
                    if (this.scan_file.size >= 20971520) {    // Число соответствует 20Мб в байтах
                        this.$refs["scan_upload"].errorMessages.push("Размер файла должен быть меньше 20Мб");
                    } else {
                        this.upload_file()
                    }
                }
            },
            upload_file() {
                this.show_loading_dialog("Загрузка");
                if (this.last_loaded_file_name) {
                    this.update_scan(this.general_agreement.id, this.scan_file);
                } else {
                    this.create_scan(this.general_agreement.id, this.scan_file);
                }
            },
            reset_input_form() {
                this.scan_file = null;
                if (this.$refs.scan_upload)
                    this.$refs.scan_upload.$refs.input.value = null;
            },
            create_scan(general_agreement_id, scan_file) {
                let requestConfig = {
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "File-Name": encodeURI(this.scan_file.name)
                    }
                };
                this.$cargo_adminHost.post(`generalAgreement/createScan/${general_agreement_id}`, scan_file, requestConfig)
                    .then(() => {
                        this.last_loaded_file_name = this.scan_file.name;
                    })
                    .finally(() => {
                        this.loading_dialog = false;
                        this.reset_input_form();
                    });
            },
            update_scan(general_agreement_id, scan_file) {
                let requestConfig = {
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "File-Name": encodeURI(this.scan_file.name)
                    }
                };
                this.$cargo_adminHost.put(`generalAgreement/updateScan/${general_agreement_id}`, scan_file, requestConfig)
                    .then(() => {
                        this.last_loaded_file_name = this.scan_file.name;
                    })
                    .finally(() => {
                        this.loading_dialog = false;
                        this.reset_input_form();
                    });
            },

            show_alert() {
                this.search_alert = true;
                setTimeout(() => {
                    this.search_alert = false;
                }, 3000);
            },
            search() {
                this.loading = true;
                this.$cargo_adminHost.post("/generalAgreement/find", this.filter)
                    .then(response => {
                        this.general_agreements = response.data;
                        this.filter_general_agreements_by_status(this.general_agreement_status);
                        if (!this.general_agreements.length)
                            this.show_alert();
                        load_parties_detail(this.get_holder_ids(this.general_agreements), this.$store, this.$cargo_partyHost);
                        console.log(this.general_agreements)
                    })
                    .catch(error => {
                        this.error_handler(error);
                    })
                    .finally(() => this.loading = false);
            },
            get_holder_ids(general_agreements) {
                let ids = [];
                if (general_agreements)
                    general_agreements.forEach(agreement => ids.push(agreement.holderId));
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
                this.$router.push({
                    name: route_names.ADDITIONAL_AGREEMENT_CREATE
                });
            },
            form_validate() {
                let validation = this.$refs.form.validate();
                if (!validation)
                    this.show_error_alert("Не все поля заполнены или заполненны некорректно");
                return validation;
            },
            save() {
                if (!this.form_validate())
                    return;
                this.show_loading_dialog();

                this.$cargo_adminHost.post("/generalAgreement/", this.general_agreement)
                    .then(response => response.data)
                    .then(data => {
                        this.select(data);
                        this.readonly = true;
                        this.show_success_alert("Генеральный договор успешно сохранен");
                    })
                    .catch(error => {
                        this.error_handler(error);
                    })
                    .finally(() => this.loading_dialog = false);
            },
            select(id) {
                this.resetScanFileProps();
                this.$router.push({
                    name: route_names.GENERAL_AGREEMENT_DETAIL,
                    params: {
                        "id": id
                    }
                });
            },
            resetScanFileProps() {
                this.last_loaded_file_name = "";
                this.reset_input_form();
                this.last_loaded_file_name = "";
            },
            get_general_agreement(id) {
                this.show_loading_dialog("Загрузка");
                this.$cargo_adminHost.get("/generalAgreement/" + id)
                    .then(response => response.data)
                    .then(data => {
                        this.general_agreement = data;
                        this.set_last_scan_file_name(id);
                        this.readonly = true;
                    })
                    .catch(error => {
                        this.error_handler(error);
                    })
                    .finally(() => this.loading_dialog = false);
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
                //
                // this.$router.push({
                //     name: route_names.GENERAL_AGREEMENT,
                // });
                this.$router.back()
            },
            route_handler(route) {
                switch (route.name) {
                    case route_names.GENERAL_AGREEMENT:
                        this.step = 1;
                        this.general_agreement = null;
                        this.readonly = true;
                        this.search();
                        break
                    case route_names.GENERAL_AGREEMENT_DETAIL:
                        this.step = 2;
                        setTimeout(() => this.get_general_agreement(this.$route.params.id), 200);
                        break
                    case route_names.GENERAL_AGREEMENT_CREATE:
                        if (this.$refs.form)
                            this.$refs.form.resetValidation();
                        this.step = 2;
                        this.general_agreement = {
                            holderId: this.holder_id,
                            kindOfInsuranceList: []
                        };
                        this.readonly = false;
                        break
                    case route_names.ADDITIONAL_AGREEMENT_CREATE:
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
                        this.general_agreements_with_status = this.general_agreements.filter(ga => ga.canceled);
                        break;
                    case 'ACTIVE_STATUS':
                        this.general_agreements_with_status = this.general_agreements.filter(ga => !ga.canceled);
                        break;
                }
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
