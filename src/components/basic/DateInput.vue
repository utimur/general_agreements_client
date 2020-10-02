<template>
    <v-menu
        v-model="menu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
    >
        <template v-slot:activator="{ on }">
            <v-text-field
                :class="styleClass"
                :rules="rules"
                :value="format_date(date)"
                :clearable="clearable && !readonly"
                @click:clear="clear"
                :label="label"
                :hide-details="hideDetails"
                persistent-hint
                :prepend-icon="prependIcon"
                :readonly="true"
                @click="!readonly ? menu = true : ''"
                outlined
            />
        </template>
        <v-date-picker
            v-if="!readonly"
            v-model="date"
            no-title
            :min="min"
            :max="max"
            @input="handleInput"
            :locale="locale"/>
    </v-menu>
</template>

<script>
    import {format_date, format_time} from "../../utils/date_util.js";

    /**
     * Отображение даты в текстовом поле
     * и выбор (по нажатию на поле) в открывающемся меню
     */

    export default {
        name: "DateInput",
        data() {
            return {
                menu: false,
                date: ""
            }
        },
        props: {
            /**
             * Дата в формате "YYYY-MM-DD"
             * @model
             */
            value: {
                required: true
            },
            /**
             * Название поля ввода
             */
            label: {
                type: String,
                default: ""
            },
            locale: {
                type: String,
                default: "ru-RU"
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
             * Правила проверки ввода
             */
            rules: {
                type: Array,
                default: () => []
            },
            /**
             * Скрывает подсказки и ошибки проверки (свойство messages)
             */
            hideDetails: {
                type: Boolean,
                default: false
            },
            /**
             * Добавляет иконку перед вводом
             */
            prependIcon: {
                type: String,
                default: null
            },
            /**
             * Минимальное значение даты
             */
            min: {
                type: String,
                default: null
            },
            /**
             * Максимальное значение даты
             */
            max: {
                type: String,
                default: null
            },
            /**
             * Стиль ввода
             */
            styleClass: {
                type: String,
                default: ""
            },
            /**
             * Вместе с датой вернет и время в формате
             * "YYYY-MM-DDT00:00"
             */
            returnBeginningOfDay: {
                type: Boolean,
                default: false
            },
            /**
             * Вместе с датой вернет и время в формате
             * "YYYY-MM-DDT23:59"
             */
            returnEndOfDay: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            handleInput(newValue) {
                if (this.returnBeginningOfDay)
                    newValue = newValue + "T" + "00:00";
                else if (this.returnEndOfDay)
                    newValue = newValue + "T" + "23:59";
                /**
                 * Инициируется когда присваивается значение
                 * @property {string} new_value
                 */
                this.$emit("input", newValue);
                this.menu = false;
            },
            clear() {
                this.date = undefined;
                this.$emit("input", undefined);
            },
            format_date,
            format_time
        },
        beforeMount() {
            if (this.value)
                this.date = this.value;
            else
                this.date = ""
        },
        watch: {
            value(newValue) {
                this.date = newValue;
            }
        }
    };
</script>
