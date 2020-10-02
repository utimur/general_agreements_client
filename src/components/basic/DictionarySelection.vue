<template>
    <div>
        <v-layout>
            <v-flex>
                <v-select
                    :dark="dark"
                    :dense="dense"
                    v-if="!multiple || !readonly"
                    ref="menu"
                    :prepend-icon="icon"
                    :append-icon="readonly ? '' : 'arrow_drop_down'"
                    :items="items"
                    :label="label"
                    outlined
                    @change="change_event"
                    :class="hideDetails? 'mb-2 my-select' : 'my-select'"
                    :hide-details="hideDetails"
                    :item-text="name"
                    :item-value="returnValue"
                    :return-object="returnObject"
                    :rules="rules"
                    :menu-props="{top:!menuPropsBottom, bottom: menuPropsBottom, offsetY: true }"
                    :multiple="multiple"
                    :clearable="!readonly"
                    :readonly="readonly"
                    v-model="selection"
                >
                    <template v-slot:prepend-item v-if="can_manage">
                        <v-layout justify-end>
                            <v-btn
                                outlined
                                color="primary"
                                small
                                class="mb-2 mr-2"
                                @click="create_item"
                            >
                                Добавить
                            </v-btn>
                        </v-layout>
                    </template>
                    <template v-if="multiple" v-slot:selection="{ item, index}">
                        <v-chip v-if="index === 0">
                            <span>{{item[name]}}</span>
                        </v-chip>
                        <span
                            v-if="index === 1"
                            class="grey--text caption"
                        >(+{{ selection.length - 1 }})</span>
                    </template>
                    <template v-slot:item="{ index, item }">
                        {{item[name]}}
                        <v-spacer></v-spacer>
                        <v-list-item-action @click.stop v-if="can_manage">
                            <v-btn
                                icon
                                @click.stop.prevent="edit_item(index, item)"
                            >
                                <v-icon color="primary">edit</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </template>
                    <template v-slot:top>
                        <v-dialog v-model="dialog" max-width="700px">
                            <dictionary-editing-form
                                v-model="copy_editable_item"
                                :is_coverage_territory="is_coverage_territory"
                                :is_limitation="is_limitation"
                                :is_liability="is_liability"
                                :is_new="is_new_item"
                                :service_path="service_path"
                                @save="save"
                                @close="close"
                            />
                        </v-dialog>
                    </template>
                </v-select>
            </v-flex>
            <!-- @slot Добавляет элемент вне ввода и после ввода содержимого -->
            <slot name="append"/>
        </v-layout>
        <v-list
            :class="readonly ? 'py-0' : 'pb-0 mt-2'"
            v-if="multiple && (readonly ? selection.length : selection.length > 1)"
            subheader
        >
            <span class="subtitle-2 primary--text">{{multipleLabel}}</span>
            <v-list-item
                class="my-list"
                v-for="(item,i) in selection"
                :key="i"
            >
                <v-list-item-content class="py-0">
                    <v-list-item-title style="font-size:15px">{{"- " + (returnObject ? item[name] : item)}}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>

        <v-dialog v-model="dialog" max-width="700px">
            <dictionary-editing-form
                :readonly="readonly"
                v-model="copy_editable_item"
                :dictionary_type="dictionary_type"
                :is_new="is_new_item"
                :service_path="service_path"
                @save="save"
                @close="close"
            />
        </v-dialog>
    </div>
</template>

<script>
    import {service_path} from "../../utils/consts"
    import kinds from "../../assets/selections";
    import DictionaryEditingForm from "../dictionary/EditingForm"

    /**
     * Выбор элемента или списка элементов
     * из выпадающего списка.
     * Список всех значений загружается из справочника на основе
     * свойст endpoint и dictionary_type
     */

    export default {
        name: "DictionarySelection",
        components: {
            DictionaryEditingForm,
        },
        data() {
            return {
                dialog: false,
                items: [],
                all_items: [],
                selection: null,
                editable_index: -1,
                editable_item: null,
                copy_editable_item: null,
                adminHost: this.$cargo_adminHost,
            }
        },
        methods: {
            create_item() {
                this.editable_index = -1;
                this.editable_item = null;
                if (this.is_liability)
                    this.copy_editable_item = {
                        begins: this.dictionary_type === kinds.LiabilityBegins
                    };
                else if (this.is_issue_strategy)
                    this.copy_editable_item = {
                        parameters: []
                    };
                else
                    this.copy_editable_item = {};
                this.$refs.menu.isMenuActive = false;
                this.dialog = true;
            },
            edit_item(index, item) {
                this.editable_index = index;
                this.copy_editable_item = JSON.parse(JSON.stringify(item));
                this.editable_item = item;
                this.$refs.menu.isMenuActive = false;
                this.dialog = true;
            },
            save(new_item) {
                this.reload_form(this.editable_item, new_item);
                /**
                 * Инициируется когда редактирование или создание
                 * элемента в справочнике завершилось успешно
                 *
                 * @property {object} editable_item - состояние элемента до редактирования
                 * @property {object} new_item - состояние элемента после редактирования
                 */
                this.$emit("save", this.editable_item, new_item);
                this.close();
            },
            reload_form(old_item, new_item) {
                if (old_item)
                    this.replace_item(old_item, new_item);
                this.fetch_selection_data();
            },
            change_event(item) {
                /**
                 * Инициируется когда ввод изменяется
                 * в результате взаимодействия с пользователем
                 *
                 * @property {} item
                 */
                this.$emit("change", item);
            },
            replace_item(old_item, new_item) {
                let old_item_index = -1;
                if (Array.isArray(this.selection)) {
                    for (let i = 0; i < this.selection.length; i++) {
                        let current_item = this.selection[i];
                        if (current_item[this.name] === old_item[this.name])
                            old_item_index = i;
                    }
                    if (old_item_index > -1)
                        this.selection.splice(old_item_index, 1, new_item);
                } else {
                    if (this.selection && this.selection[this.name] === old_item[this.name])
                        this.selection = new_item;
                }
            },
            close() {
                this.dialog = false;
            },
            fetch_selection_data() {
                this.dictionaryEndpoint.get(this.path_loading_all_items)
                    .then(resp => resp.data)
                    .then(data => {
                        this.all_items = data;
                        this.load_items();
                    })
            },
            load_showing_items() {
                if (!this.showingItems || !this.showingItems.length)
                    return this.all_items;

                if (this.returnObject) {
                    return this.showingItems;
                } else {
                    let items = [];
                    let included_items_map = new Set();
                    this.showingItems.forEach(item => included_items_map.add(item));
                    this.all_items.forEach(item => {
                        if (included_items_map.has(item[this.returnValue]))
                            items.push(item);
                    });
                    return items;
                }
            },
            load_items() {
                this.items = [];
                let showing_items = this.load_showing_items();
                if (!this.excludedItems || !this.excludedItems.length) {
                    this.items = showing_items;
                    return;
                }
                let exluded_items_map = new Set();
                if (this.returnObject) {
                    this.excludedItems.forEach(item => exluded_items_map.add(item[this.name]));
                    showing_items.forEach(item => {
                        if (!exluded_items_map.has(item[this.name]))
                            this.items.push(item);
                    })
                } else {
                    this.excludedItems.forEach(item => exluded_items_map.add(item));
                    showing_items.forEach(item => {
                        if (!exluded_items_map.has(item[this.returnValue]))
                            this.items.push(item);
                    })
                }
            }
        },
        props: {
            /**
             * Регулирует возможность создания и редактирования элементов.
             * Отображение кнопки "Добавить" и иконки редактирования.
             */
            can_manage: {
                type: Boolean,
                default: true
            },
            /**
             * Адрес endpoint.
             * По умолчанию, $cargo_adminHost
             */
            endpoint: {
                type: Function,
                default: null
            },
            icon: {
                type: String,
                default: null
            },
            /**
             * @model
             */
            value: {
                required: true
            },
            /**
             * Переводит ввод в состояние только для чтения
             */
            readonly: {
                type: Boolean,
                default: false
            },
            /**
             * Название поля ввода
             */
            label: {
                type: String,
                default: "Выберите вариант"
            },
            /**
             * Список открывается вниз или вверх
             */
            menuPropsBottom: {
                type: Boolean,
                default: true
            },
            /**
             * Label для отображения списка элементов
             */
            multipleLabel: {
                type: String,
                default: "Выбранные значения"
            },
            /**
             * Нужно ли конвертировать входное значение к числу.
             * Например, в справочнике id может быть числом,
             * а другая модель сохраняет id в виде строки.
             * Selections делают проверку на строгое равенство.
             * Для корректного сравнения может понадобится конвертация.
             */
            is_convert_to_number: {
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
            /**
             * Множественный выбор элементов.
             * Для корреткной работы v-model должен принимать массив.
             */
            multiple: {
                type: Boolean,
                default: false
            },
            /**
             * Правила проверки ввода
             */
            rules: {
                type: Array,
                default: () => []
            },
            /**
             * Вид справочника из списка "src/assets/selections.json"
             */
            dictionary_type: {
                type: String,
                required: true,
            },
            /**
             * Название поля в модели, которое будет отображаться пользователю
             */
            name: {
                type: String,
                default: "name"
            },
            /**
             * Название поля в модели, которое необходимо вернуть
             */
            returnValue: {
                type: String,
                default: "name"
            },
            /**
             * По умолчанию, компонент возвращает весь объект, если необходимо
             * вернуть одно поле, то в этом свойстве проставляется false,
             * а также корректно заполняются свойства name и returnValue
             */
            returnObject: {
                type: Boolean,
                default: true
            },
            /**
             * Список элементов которые необходимо исключить из выпадающего списка,
             * если returnObject === true, ожидается массив объектов,
             * если returnObject === false, массив того типа данных которые находятся
             * в поле returnValue
             */
            excludedItems: {
                type: Array,
                default: null
            },
            /**
             * Список элементов которые необходимо отобразить в списке,
             * если returnObject === true, ожидается массив объектов,
             * если returnObject === false, массив того типа данных которые находятся
             * в поле returnValue
             */
            showingItems: {
                type: Array,
                default: null
            },
            /**
             * Темный стиль
             */
            dark: {
                type: Boolean,
                default: false
            },
            /**
             * Уменьшает высоту ввода
             */
            dense: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            readonly(newValue) {
                if (!newValue)
                    this.fetch_selection_data();
            },
            selection(newValue) {
                /**
                 * Инициируется когда присваивается значение
                 *
                 * @property {} new_value
                 */
                this.$emit("input", newValue);
            },
            value(newValue) {
                if (this.is_convert_to_number)
                    this.selection = parseInt(newValue);
                else
                    this.selection = newValue;
                this.fetch_selection_data();
            },
            excludedItems() {
                this.load_items();
            },
            showingItems() {
                this.load_items();
            },
            dictionary_type() {
                this.fetch_selection_data();
            }
        },
        created() {
            if (this.is_convert_to_number)
                this.selection = parseInt(this.value);
            else
                this.selection = this.value;
            this.fetch_selection_data();
        },
        computed: {
            dictionaryEndpoint() {
                return this.endpoint ? this.endpoint : this.adminHost
            },
            path_loading_all_items() {
                if (this.is_liability)
                    return this.service_path + this.dictionary_type;
                else if (this.is_validator || this.is_issue_strategy)
                    return this.service_path + "getAll";
                return this.service_path;
            },
            service_path() {
                if (this.is_liability)
                    return service_path.LIABILITY;
                else if (this.is_limitation)
                    return service_path.LIMITATION;
                else if (this.is_validator)
                    return service_path.VALIDATOR;
                else if (this.is_issue_strategy)
                    return service_path.ISSUE_STRATEGY;
                return service_path.DICTIONARY + this.dictionary_type + "/";
            },
            is_coverage_territory() {
                return this.dictionary_type === kinds.CoverageTerritory;
            },
            is_liability() {
                return this.dictionary_type === kinds.LiabilityEnds || this.dictionary_type === kinds.LiabilityBegins;
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
            is_new_item() {
                return this.editable_index === -1;
            }
        }
    };
</script>

<style>
    .my-list.v-list-item {
        min-height: 30px !important;
    }
</style>