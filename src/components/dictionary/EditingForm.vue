<template>
    <v-card>
        <v-form ref="form" v-model="valid_form">
            <v-card-text class="overflow-y-auto" style="max-height: 450px;">
                <v-container grid-list-md>
                    <div class="headline primary--text mb-5">{{ formTitle }}</div>
                    <template v-if="is_liability">
                        <v-textarea
                            :rules="[rules.required]"
                            rows="1"
                            auto-grow
                            outlined
                            label="Описание по-русски*"
                            v-model="item.text"
                        />
                        <v-textarea
                            :rules="[rules.required]"
                            rows="1"
                            auto-grow
                            outlined
                            label="Описание по-английски*"
                            v-model="item.englishText"
                        />
                    </template>
                    <template v-else-if="is_limitation">
                        <enum-selection
                            :readonly="!is_new"
                            :append-icon="!is_new ? 'lock' : ''"
                            :rules="[rules.required]"
                            v-model="item.kind"
                            :kind="kinds.LimitationKind"
                            label="Вид*"
                        />
                        <enum-selection
                            :rules="[rules.required]"
                            v-model="item.type"
                            :kind="kinds.LimitationType"
                            label="Тип*"
                        />
                        <v-textarea
                            :rules="[rules.required]"
                            outlined
                            rows="1"
                            auto-grow
                            label="Описание по-русски*"
                            v-model="item.text"
                        />
                        <v-textarea
                            :rules="[rules.required]"
                            outlined
                            rows="1"
                            auto-grow
                            label="Описание по-английски*"
                            v-model="item.englishText"
                        />
                    </template>
                    <template v-else-if="is_validator || is_issue_strategy">
                        <v-text-field
                            :rules="[rules.required]"
                            :readonly="readonly"
                            outlined
                            label="Путь к классу*"
                            v-model="item.targetClass"
                        />
                        <v-text-field
                            :rules="[rules.required]"
                            :readonly="readonly"
                            outlined
                            label="Описание*"
                            v-model="item.description"
                        />
                        <template
                            v-if="is_issue_strategy && ((item.parameters && item.parameters.length) || !readonly)">
                            <v-layout
                                mb-2
                                flex-row
                                justify-space-between
                            >
                                <div class="subtitle-2 primary--text mt-2">
                                    Параметры
                                </div>
                                <v-btn
                                    outlined
                                    color="primary"
                                    small
                                    @click="add_issue_strategy_parameter"
                                >
                                    Добавить
                                </v-btn>
                            </v-layout>
                            <v-layout
                                v-for="(parameter, key) in item.parameters"
                                :key="key"
                            >
                                <v-flex md11 pr-1>
                                    <v-layout flex-row>
                                        <v-flex md2 pr-2>
                                            <v-text-field
                                                type="number"
                                                :rules="[issue_strategy_parameter_rules.required, issue_strategy_parameter_rules.order(item.parameters)]"
                                                :readonly="readonly"
                                                outlined
                                                @keydown="cancel_input_point"
                                                label="Порядок*"
                                                @input="sort_issue_strategy_parameters"
                                                v-model="parameter.order"
                                            />
                                        </v-flex>
                                        <v-flex md5 pr-2>
                                            <v-text-field
                                                :rules="[rules.required]"
                                                :readonly="readonly"
                                                outlined
                                                label="Тип*"
                                                v-model="parameter.type"
                                            />
                                        </v-flex>
                                        <v-flex md5 pl-2>
                                            <v-textarea
                                                :rules="[rules.required]"
                                                :readonly="readonly"
                                                outlined
                                                rows="1"
                                                auto-grow
                                                label="Описание*"
                                                v-model="parameter.description"
                                            />
                                        </v-flex>
                                    </v-layout>
                                </v-flex>
                                <v-flex md1 pl-1>
                                    <v-layout justify-end>
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-btn
                                                    class="mt-3"
                                                    v-on="on"
                                                    icon
                                                    @click="delete_issue_strategy_parameter(key)"
                                                >
                                                    <v-icon color="primary">
                                                        delete
                                                    </v-icon>
                                                </v-btn>
                                            </template>
                                            <span>Удалить</span>
                                        </v-tooltip>
                                    </v-layout>
                                </v-flex>
                            </v-layout>
                        </template>
                    </template>
                    <template v-else>
                        <v-text-field
                            :rules="[rules.required]"
                            :readonly="!is_new"
                            outlined
                            :label="code_title"
                            :append-icon="!is_new ? 'lock' : ''"
                            v-model="item.code"
                        />
                        <v-text-field
                            :rules="[rules.required]"
                            outlined
                            :label="name_title"
                            v-model="item.name"
                        />
                    </template>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    @click="close"
                >
                    Отменить
                </v-btn>
                <v-btn
                    color="primary"
                    :disabled="!valid_form"
                    text
                    @click="save"
                >
                    Сохранить
                </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script>
    import EnumSelection from "../basic/EnumSelection";
    import kinds from "../../assets/selections"
    import rules from "../../utils/rules";

    /**
     * Форма создания/редактирования элемента из справочника
     */

    export default {
        name: "DictionaryEditingForm",
        components: {
            EnumSelection
        },
        data() {
            return {
                kinds: kinds,
                rules: rules,
                issue_strategy_parameter_rules: {
                    order: parameters => {
                        let is_find_error = false;
                        let non_duplicate = new Set();
                        parameters.forEach((parameter, index) => {
                            if (is_find_error)
                                return;
                            let order = parseInt(parameter.order);
                            if (!Number.isInteger(order))
                                is_find_error = true;
                            non_duplicate.add(order);
                            if (order !== index)
                                is_find_error = true;
                        });
                        if (non_duplicate.size !== parameters.length)
                            is_find_error = true;
                        return !is_find_error || "Некорректный порядок";
                    },
                    required: value => (!!value || (Number.isInteger(value) && value === 0)) || "Обязательное поле",
                },
                valid_form: false,
                item: null
            }
        },
        computed: {
            formTitle() {
                return !this.is_new ? "Редактирование записи" : "Добавление записи"
            },
            code_title() {
                return this.is_coverage_territory ? "Описание по-английски*" : "Код*"
            },
            name_title() {
                return this.is_coverage_territory ? "Описание по-русски*" : "Описание*"
            },
            is_coverage_territory() {
                return this.dictionary_type === kinds.CoverageTerritory;
            },
            is_liability() {
                return this.dictionary_type === kinds.LiabilityBegins || this.dictionary_type === kinds.LiabilityEnds;
            },
            is_limitation() {
                return this.dictionary_type === kinds.Limitation;
            },
            is_validator() {
                return this.dictionary_type === kinds.Validator;
            },
            is_issue_strategy() {
                return this.dictionary_type === kinds.IssueStrategy;
            },
        },
        methods: {
            add_issue_strategy_parameter() {
                this.item.parameters.push({
                    order: this.item.parameters.length
                });
            },
            delete_issue_strategy_parameter(index) {
                this.item.parameters.splice(index, 1);
                this.item.parameters.forEach((param, index) => param.order = index);
            },
            close() {
                /**
                 * Инициируется когда работа с формой завершена
                 */
                this.$emit("close");
            },
            save() {
                if (this.is_new)
                    this.add_new();
                else
                    this.update_existing();

                this.close();
            },
            update_existing() {
                this.$cargo_adminHost.put(this.service_path, this.item)
                    .then(() => {
                        /**
                         * Инициируется когда сохранение элемента завершено успешно
                         *
                         * @property {object} item
                         */
                        this.$emit("save", this.item);
                    })
                    .catch(error => {
                        /**
                         * Инициируется когда произошла ошибка
                         *
                         * @property {object} error
                         */
                        this.$emit("error", error);
                    })
            },
            add_new() {
                this.$cargo_adminHost.post(this.service_path, this.item)
                    .then(() => this.$emit("save", this.item))
                    .catch(error => this.$emit("error", error))
            },
            sort_issue_strategy_parameters() {
                this.item.parameters.sort((obj1, obj2) => obj1.order - obj2.order);
            },
            cancel_input_point(event) {
                event.key === "." || event.key === ","? event.preventDefault() : false
            },
        },
        props: {
            /**
             * @model
             */
            value: {
                default: null
            },
            is_new: {
                type: Boolean,
                default: true
            },
            /**
             * Полный путь к ресурсу, за исключением типа справочника
             */
            service_path: {
                type: String,
                required: true
            },
            /**
             * Вид справочника из списка "src/assets/selections.json"
             */
            dictionary_type: {
                type: String,
                required: true
            },
            /**
             * Переводит ввод в состояние только для чтения
             */
            readonly: {
                type: Boolean,
                default: true
            }
        },
        created() {
            this.item = this.value;
            if (this.is_issue_strategy)
                this.sort_issue_strategy_parameters();
        },
        watch: {
            item: {
                handler(newValue) {
                    /**
                     * Инициируется когда присваивается значение
                     *
                     * @property {object} new_value
                     */
                    this.$emit("input", newValue);
                },
                deep: true
            },
            value(newValue) {
                if (this.$refs.form)
                    this.$refs.form.resetValidation();
                this.item = newValue;
                if (this.is_issue_strategy)
                    this.sort_issue_strategy_parameters();
            },
        }

    };
</script>
