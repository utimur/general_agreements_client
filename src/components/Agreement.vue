<template>
    <v-layout justify-space-around class="mb-10">
        <v-flex xs12 md8 lg6 xl4>
            <v-card>
                <v-form ref="form" lazy-validation v-model="form_valid">
                    <v-container>
                        <v-layout flex-row justify-center mb-3>
                            <v-layout justify-self-center justify-end>
                                <h3 class="text-sm-left text-uppercase primaryDark--text">
                                    {{is_general ? general_title : additional_title}}
                                </h3>
                            </v-layout>
                            <v-layout justify-self-end justify-end>
                                <div v-if="!is_new">
                                    <v-btn
                                        v-if="!is_cancelled"
                                        color="error"
                                        small
                                        @click="open_cancel_agreement_modal"
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
                                v-if="is_new && is_general"
                                :rules="[rules.required]"
                                outlined
                                :readonly="readonly"
                                label="Номер документа*"
                                v-model="agreement.number"/>
                            <holder-input
                                v-if="is_general"
                                :only_active="false"
                                required
                                :readonly="!is_new"
                                v-model="agreement.partyId"
                                label="Страхователь*"
                            />
                            <dictionary-selection
                                :class="readonly || (agreement.kindOfInsurances && agreement.kindOfInsurances.length) > 1 ? 'pb-3' : ''"
                                :can_manage="false"
                                :rules="[rules.not_empty_array]"
                                :readonly="!is_new"
                                label="Вид страхования*"
                                :dictionary_type="kinds.KindOfInsurance"
                                :menu-props-bottom="false"
                                multiple
                                multipleLabel="Виды страхования"
                                v-model="agreement.kindOfInsurances"
                            />
                            <date-input
                                :rules="[rules.required]"
                                :readonly="readonly"
                                label="Дата заключения*"
                                :max="agreement.since"
                                v-model="agreement.applied"
                            />
                        </v-layout>
                        <v-layout mb-2>
                            <div class="subtitle-2">Дата действия {{is_general ? 'генерального' : 'дополнительного'}} договора</div>
                        </v-layout>
                        <v-layout>
                            <v-flex mr-2 xs12 md6>
                                <date-input
                                    :rules="[rules.required]"
                                    :readonly="readonly"
                                    label="Начало*"
                                    :min="agreement.applied"
                                    :max="agreement.till"
                                    v-model="agreement.since"/>
                            </v-flex>
                            <v-flex ml-2 xs12 md6>
                                <date-input
                                    :readonly="readonly"
                                    label="Окончания"
                                    @input="input_till_date"
                                    :min="agreement.since"
                                    v-model="agreement.till"/>
                            </v-flex>
                        </v-layout>
                        <v-layout column>
                            <v-checkbox
                                :readonly="readonly"
                                @change="check_auto_renew"
                                v-model="agreement.autoProlongation"
                                label="Автоматическая пролонгация"/>
                            <v-text-field
                                :disabled="!readonly && !agreement.autoProlongation"
                                :rules="agreement.autoProlongation ? [rules.required, rules.non_negative] : []"
                                outlined
                                type="number"
                                :readonly="readonly"
                                label="На сколько дней продлевать"
                                v-model="agreement.prolongationDays"
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
                            <v-expansion-panels accordion class="mt-4 mb-4" v-if="is_general">
                                <v-expansion-panel>
                                    <v-expansion-panel-header class="font-weight-bold">{{ additional_panel_header }}</v-expansion-panel-header>
                                    <v-expansion-panel-content v-if="additional_agreements.length">
                                        <general-agreements-table
                                            :is_general="false"
                                            :general_agreements="additional_agreements"
                                            @delete_agreement="delete_agreement"
                                        />
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </template>
                    </v-container>
                </v-form>

            </v-card>
        </v-flex>
        <template v-if="!agreement.cancelled">
            <v-snackbar
                color="primary"
                :value="snackbar_creating"
                :timeout="-1"
                v-if="snackbar_creating"
            >
                Создание договора
                <template v-slot:action>
                    <v-btn
                        small
                        dark
                        @click="$router.back()"
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
                        Создать
                    </v-btn>
                </template>
            </v-snackbar>
            <v-snackbar
                color="primary"
                :value="snackbar_editing"
                v-if="snackbar_editing && !is_cancelled"
                :timeout="-1"
            >
                Редактировать текущий договор
                <template v-slot:action>
                    <v-btn
                        small
                        dark
                        @click="editing"
                        color="green"
                    >
                        Редактировать
                    </v-btn>
                </template>
            </v-snackbar>
            <v-snackbar
                color="primary"
                :value="snackbar_saving"
                :timeout="-1"
                v-if="snackbar_saving"
            >
                Обновить договор
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
                        @click="update"
                        :disabled="!form_valid"
                        color="green"
                        class="snackbar-btn ml-1"
                    >
                        Сохранить
                    </v-btn>
                </template>
            </v-snackbar>
        </template>
        <v-dialog
            v-model="cancel_agreement_modal"
            max-width="400px"
        >
            <v-card>
                <v-card-title class="headline">Предупреждение</v-card-title>
                <v-card-text>Вы уверены, что хотите расторгнуть договор?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="red darken-1"
                        text
                        @click="cancel_agreement_modal = false"
                    >Отмена</v-btn>
                    <v-btn
                        color="teal darken-1"
                        text
                        @click="cancel_agreement"
                    >
                        Расторгнуть
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <LoadingDialog
            :loading-dialog="loading_dialog"
            :title="loading_label"
            :value="loading_dialog_value"
        />
    </v-layout>
</template>

<script>
import DictionarySelection from "../components/basic/DictionarySelection";
import LoadingDialog from "../components/basic/LoadingDialog";
import {route_names, kinds_of_insurance} from "../utils/consts";
import {load_parties_detail} from "../utils/load_parties_detail";
import DateInput from "../components/basic/DateInput";
import {format_date} from "../utils/date_util";
import rules from "../utils/rules";
import Kinds from "../assets/selections"
import GeneralAgreementsTable from "../components/GeneralAgreementsTable";
import HolderInput from "../components/basic/HolderInput";

export default {
    name: "GeneralAgreements",
    components: {
        HolderInput,
        GeneralAgreementsTable,
        LoadingDialog,
        DateInput,
        DictionarySelection,
    },
    props: {
        holder_id: {
            default: null
        },
    },
    data() {
        return {
            form_valid: true,
            additional_agreements:[],
            agreement: {kindOfInsurances: []},
            copy_agreement: null,
            readonly: true,
            scan_file: null,
            last_loaded_file_name: "",
            headers: [
                {text: "Номер", value: "number", sortable: false},
                {text: "Страхователь", value: "holderId", sortable: false},
                {text: "Дата заключения", value: "signed", sortable: false},
                {text: "Дата начала/окончания действия", value: "sinceTill", sortable: false},
                {text: "", value: "actions", align: "right", sortable: false},
            ],
            rules: rules,
            kinds: Kinds,
            kinds_of_insurance: kinds_of_insurance,
            snackbar_editing: false,
            snackbar_saving: false,
            snackbar_creating: false,
            loading: false,
            loading_dialog: false,
            loading_dialog_value:0,
            loading_label: null,
            cancel_agreement_modal: false,
        }
    },
    computed: {
        is_new() {
            return !this.agreement.id;
        },
        is_cancelled() {
            return this.agreement.cancelled;
        },

        is_creating_agreement() {
            return this.$route.name === route_names.GENERAL_AGREEMENT_CREATE
        },
        additional_panel_header() {
            return this.additional_agreements.length ? "Список дополнительных договоров" : "Дополнительные договора отсутствуют"
        },

        additional_title() {
            if (this.agreement.id == null)
                return "Создание дополнительного договора";
            else
                return "Дополнительный договор №" + this.agreement.number;
        },
        can_manage() {
            return true;
        },
        general_title() {
            if (this.agreement.id == null)
                return "Создание генерального договора";
            else
                return "Генеральный договор №" + this.agreement.number;
        },

        parties_detail() {
            return this.$store.getters["cargo/get_parties_detail"];
        },
        is_general() {
            if (this.$route.name === route_names.GENERAL_AGREEMENT_CREATE || this.$route.name === route_names.GENERAL_AGREEMENT_DETAIL) {
                return true
            }
            if (this.$route.name === route_names.ADDITIONAL_AGREEMENT_DETAIL || this.$route.name === route_names.ADDITIONAL_AGREEMENT_CREATE) {
                return false
            }
            return false
        },
        get_gen_agreem_id() {
            return this.$store.getters["cargo/get_current_general_agreement_id"]
        }
    },
    mounted() {
        if (this.$route.params.id) {
            this.get_agreement(this.$route.params.id);
        }
        this.route_handler(this.$route)
    },
    watch: {
        "$route.params.id"() {
            if (this.$route.params.id) {
                this.last_loaded_file_name = "";
                this.reset_input_form()
                this.get_agreement(this.$route.params.id);
            }
        },
        "$route"(to) {
            this.route_handler(to)
        },

    },
    methods: {
        open_cancel_agreement_modal() {
            this.cancel_agreement_modal = true
        },
        cancel_agreement() {
            const url = this.is_general
                ? `/cancel/${this.$route.params.id}`
                : `/additionalAgreement/cancel/${this.$route.params.id}`
            this.$general_agreements.post(url, {})
                .catch(error => {
                    this.$emit('show_error_alert', error);
                })
                .then(res => {
                    if (res) {
                        this.agreement.cancelled = true;
                    }
                }).finally(() => this.cancel_agreement_modal = false);
        },
        check_auto_renew(new_value) {
            if (!new_value) {
                this.agreement.renewDays = null;
            }
        },
        input_till_date(new_value) {
            if (!new_value) {
                this.agreement.autoRenew = false;
                this.agreement.renewDays = null;
            }
        },
        set_last_scan_file_name(agreement_id) {
            this.$cargo_adminHost.get(`generalAgreement/getFileName/${agreement_id}`)
                .then(res => {
                    this.last_loaded_file_name = res.data;
                });
        },
        on_all_scans_download() {
            this.download_file(`generalAgreement/getAllScanVersions/${this.agreement.id}`)
        },
        on_scan_download() {
            this.download_file(`generalAgreement/getScan/${this.agreement.id}`)
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
                this.update_scan(this.agreement.id, this.scan_file);
            } else {
                this.create_scan(this.agreement.id, this.scan_file);
            }
        },
        reset_input_form() {
            this.scan_file = null;
            if (this.$refs.scan_upload)
                this.$refs.scan_upload.$refs.input.value = null;
        },
        create_scan(agreement_id, scan_file) {
            let requestConfig = {
                headers: {
                    "Content-Type": "application/octet-stream",
                    "File-Name": encodeURI(this.scan_file.name)
                }
            };
            this.$cargo_adminHost.post(`generalAgreement/createScan/${agreement_id}`, scan_file, requestConfig)
                .then(() => {
                    this.last_loaded_file_name = this.scan_file.name;
                })
                .finally(() => {
                    this.loading_dialog = false;
                    this.reset_input_form();
                });
        },
        update_scan(agreement_id, scan_file) {
            let requestConfig = {
                headers: {
                    "Content-Type": "application/octet-stream",
                    "File-Name": encodeURI(this.scan_file.name)
                }
            };
            this.$cargo_adminHost.put(`generalAgreement/updateScan/${agreement_id}`, scan_file, requestConfig)
                .then(() => {
                    this.last_loaded_file_name = this.scan_file.name;
                })
                .finally(() => {
                    this.loading_dialog = false;
                    this.reset_input_form();
                });
        },

        get_holder_ids(agreements) {
            let ids = [];
            if (agreements)
                agreements.forEach(agreement => ids.push(agreement.holderId));
            return ids;
        },
        form_validate() {
            let validation = this.$refs.form.validate();
            if (!validation)
                this.$emit('show_error_alert', "Не все поля заполнены или заполненны некорректно");
            return validation;
        },
        update() {
            if (!this.form_validate())
                return;
            let url = this.is_general
                    ? '/'
                    : '/additionalAgreement'
            this.$general_agreements.put(url, this.agreement)
                .then(resp => {
                    this.readonly = true;
                    this.snackbar_saving = false
                    this.snackbar_editing = true
                    this.$emit('show_success_alert', "Договор успешно обновлен")
                })
                .catch(error => {
                    this.$emit('show_error_alert', error);
                })
                .finally(() => this.loading_dialog = false);
        },
        save() {
            if (!this.form_validate())
                return;
            this.show_loading_dialog();
            let url = this.is_general
                ? `/create`
                : `agreement/${this.get_gen_agreem_id}/additionalAgreement`
            this.$general_agreements.post(url, this.agreement)
                .then(response => {
                    this.$router.back()
                    this.select(response.data);
                    this.readonly = true;
                    this.$emit('show_success_alert', "Договор успешно создан")
                })
                .catch(error => {
                    this.$emit('show_error_alert', error);
                })
                .finally(() => this.loading_dialog = false);
        },
        select(id) {
            this.$router.push({
                name: route_names.GENERAL_AGREEMENT_DETAIL,
                params: {
                    "id": id
                }
            });
        },
        async get_agreement(id) {
            this.show_loading_dialog("Загрузка");
            const url = this.is_general ? `/getById/${id}` : `/additionalAgreement/${id}`
            this.$general_agreements.get(url)
                .then(response => response.data)
                .then(data => {
                    this.agreement = data;
                    this.agreement.kindOfInsurances = this.agreement.kindOfInsurances.map(kind => {
                        return {...kind, name:kinds_of_insurance[kind.code]}
                    })
                    this.set_last_scan_file_name(id);
                    this.readonly = true;
                    if (this.is_general) {
                        this.additional_agreements = data.additionalAgreements
                        this.$store.commit('cargo/set_current_general_agreement', data);
                    }
                })
                .catch(error => {
                    this.$emit('show_error_alert', error);
                })
                .finally(() => this.loading_dialog = false);
        },
        editing() {
            this.readonly = false
            this.snackbar_editing = false
            this.snackbar_saving = true
        },
        cancel_editing() {
            this.readonly = true
            this.get_agreement(this.$route.params.id).then(() => {
                this.snackbar_editing = true
                this.snackbar_saving = false
            })
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

        show_loading_dialog(title, show_steps) {
            if (title)
                this.loading_label = title;
            else
                this.loading_label = "Обрабатывается";
            if (!show_steps)
                this.loading_dialog_value = 0;
            this.loading_dialog = true;
        },
        route_handler(route) {
            if(route.name === route_names.ADDITIONAL_AGREEMENT_CREATE && !this.$store.getters["cargo/get_current_general_agreement_id"]) {
                this.$router.push({
                    name: route_names.GENERAL_AGREEMENT
                })
            }
            if(route.name === route_names.GENERAL_AGREEMENT_CREATE || route.name === route_names.ADDITIONAL_AGREEMENT_CREATE) {
                if (this.$refs.form)
                    this.$refs.form.resetValidation();
                this.readonly = false
                this.snackbar_creating = true
                this.snackbar_saving = false
                this.snackbar_editing = false
                this.agreement = this.agreement = {
                    partyId: this.partyId,
                    kindOfInsurances: []
                };
                this.reset_input_form()
                console.log('create')
            }
            if (route.name === route_names.ADDITIONAL_AGREEMENT_DETAIL ||  route.name === route_names.GENERAL_AGREEMENT_DETAIL) {
                this.snackbar_saving = false
                this.snackbar_creating = false
                console.log('detail')
                this.snackbar_editing = true
            }
        },
        delete_agreement(id) {
            this.additional_agreements = this.additional_agreements.filter(agr => agr.id !== id)
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
