<template>
    <div>
        <v-select
            v-if="!multiple || !readonly"
            class="my-select"
            :prepend-icon="icon"
            :append-icon="readonly ? '' : 'arrow_drop_down'"
            :items="items"
            :label="label"
            outlined
            :multiple="multiple"
            :menu-props="{top:!menuPropsBottom, bottom: menuPropsBottom, offsetY: true }"
            :rules="rules"
            :hide-details="hideDetails"
            :clearable="!readonly"
            :readonly="readonly"
            @change="change_item"
            v-model="selection"
            :dark="dark"
            :dense="dense"
        >
            <template v-if="multiple" v-slot:selection="{ item, index}">
                <v-chip v-if="index === 0">
                    <span>{{item.text}}</span>
                </v-chip>
                <span
                    v-if="index === 1"
                    class="grey--text caption"
                >(+{{ selection.length - 1 }})</span>
            </template>
        </v-select>

        <v-list
            v-if="multiple && (readonly ? selection.length : selection.length > 1)"
            subheader
            class="mt-2"
        >
            <span class="subtitle-2 primary--text">{{multipleLabel}}</span>
            <v-list-item
                class="my-list"
                v-for="(item,i) in selection"
                :key="i"
            >
                <v-list-item-content class="py-0">
                    <v-list-item-title style="font-size:15px">{{"- " + item}}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </div>
</template>

<script>
    import {service_path} from "../../utils/consts";

    /**
     * Выбор элемента или списка элементов
     * из выпадающего списка.
     * Список всех значений загружается из enum на основе
     * свойст endpoint и kind
     */

    export default {
        name: "EnumSelection",
        data() {
            return {
                items: [],
                all_items: [],
                selection: "",
                adminHost: this.$cargo_adminHost
            }
        },
        methods: {
            fetch_selection_data() {
                this.dictionaryEndpoint.get(service_path.ENUM + this.kind)
                    .then(resp => resp.data)
                    .then(data => {
                        this.all_items = data;
                        if (this.all_items) {
                            this.exclude_empty_item(this.all_items);
                            this.load_items();
                        }
                    })
            },
            change_item(new_item) {
                /**
                 * Инициируется когда ввод изменяется
                 * в результате взаимодействия с пользователем
                 *
                 * @property {string} new_item
                 */
                this.$emit("change", new_item);
            },
            exclude_empty_item(items) {
                let empty_item_index = -1;
                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    if (!item.name) {
                        empty_item_index = i;
                        break;
                    }
                }
                items.splice(empty_item_index, 1);
            },
            load_items() {
                if (!this.excludedItems) {
                    this.items = this.all_items;
                    return;
                }
                this.items = [];
                let exluded_items_map = new Set();
                this.excludedItems.forEach(item => exluded_items_map.add(item));
                this.all_items.forEach(item => {
                    if (!exluded_items_map.has(item.text))
                        this.items.push(item);
                })
            }
        },
        props: {
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
             * Вид enum из списка "src/assets/selections.json"
             */
            kind: {
                type: String,
                required: true
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
             * Label для отображения списка элементов
             */
            multipleLabel: {
                type: String,
                default: "Выбранные значения"
            },
            /**
             * Переводит ввод в состояние только для чтения
             */
            readonly: {
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
             * Название поля ввода
             */
            label: {
                type: String,
                default: "Выберите вариант"
            },
            /**
             * Правила проверки ввода
             */
            rules: {
                type: Array,
                default: () => []
            },
            /**
             * Список открывается вниз или вверх
             */
            menuPropsBottom: {
                type: Boolean,
                default: true
            },
            /**
             * Список элементов которые необходимо исключить из выпадающего списка
             */
            excludedItems: {
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
            selection(newValue) {
                /**
                 * Инициируется когда присваивается значение
                 *
                 * @property {string} new_value
                 */
                this.$emit("input", newValue);
            },
            value(newValue) {
                this.selection = newValue;
            },
            excludedItems() {
                this.load_items();
            },
            kind() {
                this.fetch_selection_data();
            }
        },
        created() {
            this.selection = this.value;
            this.fetch_selection_data();
        },
        computed: {
            dictionaryEndpoint() {
                return this.endpoint ? this.endpoint : this.adminHost
            }
        }
    };
</script>

<style>
    .my-list.v-list-item {
        min-height: 30px !important;
    }
</style>