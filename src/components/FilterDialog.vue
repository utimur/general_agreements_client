<template>
    <v-dialog @click:outside="() => close()"  v-model="value" max-width="800px">
        <v-card class="pa-3">
            <v-container>
                <v-row class="d-flex justify-center"><h2 class="primaryDark--text mb-3">Расширенный поиск генеральных договоров</h2></v-row>
                <holder-input
                    hide-details
                    v-model="criteria.partyId"
                />
                <v-row>
                    <v-col cols="6">
                        <v-text-field
                            label="Номер договора"
                            outlined
                            clearable
                            hide-details
                            v-model="criteria.number"
                        />
                    </v-col>
                    <v-col cols="6">
                        <dictionary-selection
                            :can_manage="false"
                            label="Вид страхования*"
                            :dictionary_type="kinds.KindOfInsurance"
                            :menu-props-bottom="false"
                            multiple
                            multipleLabel="Виды страхования"
                            v-model="criteria.kindOfInsuranceList"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-expansion-panels>
                        <v-expansion-panel>
                            <v-expansion-panel-header><h4 class="primaryDark--text">Поиск по дате</h4></v-expansion-panel-header>
                            <v-expansion-panel-content>
                                <v-container class="pa-0">
                                    <v-row class="ml-3">Поиск по дате заключения договора</v-row>
                                    <v-row>
                                        <v-col cols="6">
                                            <date-input
                                                hide-details
                                                label="От"
                                                v-model="criteria.startApplied"
                                            />
                                        </v-col>
                                        <v-col cols="6">
                                            <date-input
                                                hide-details
                                                label="До"
                                                :min="criteria.startApplied"
                                                v-model="criteria.endApplied"
                                            />
                                        </v-col>
                                    </v-row>
                                </v-container>
                                <v-container class="pa-0">
                                    <v-row class="ml-3">Поиск по дате начала действия договора</v-row>
                                    <v-row>
                                        <v-col cols="6">
                                            <date-input
                                                hide-details
                                                label="От"
                                                v-model="criteria.startSince"
                                            />
                                        </v-col>
                                        <v-col cols="6">
                                            <date-input
                                                hide-details
                                                label="До"
                                                :min="criteria.startSince"
                                                v-model="criteria.endSince"
                                            />
                                        </v-col>
                                    </v-row>
                                </v-container>

                                <v-container class="pa-0">
                                    <v-row class="ml-3">Поиск по дате окончания действия договора</v-row>
                                    <v-row>
                                        <v-col cols="6">
                                            <date-input
                                                hide-details
                                                label="От"
                                                v-model="criteria.startTill"
                                            />
                                        </v-col>
                                        <v-col cols="6">
                                            <date-input
                                                hide-details
                                                label="До"
                                                :min="criteria.startTill"
                                                v-model="criteria.endTill"
                                            />
                                        </v-col>
                                    </v-row>
                                </v-container>


                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-row>
            </v-container>
            <v-card-actions>
                <v-row>
                    <v-spacer/>
                    <v-btn text color="red" @click="criteria = Object.assign({}, default_criteria)">Очистить форму</v-btn>
                    <v-btn text color="teal darken-3" @click="search">Поиск договоров</v-btn>
                </v-row>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import HolderInput from "./basic/HolderInput";
import DictionarySelection from "./basic/DictionarySelection";
import rules from "../utils/rules";
import Kinds from "../assets/selections"
import DateInput from "./basic/DateInput";

export default {
    components: {
        HolderInput,
        DictionarySelection,
        DateInput,
    },
    props: {
        value: {
            default: false
        }
    },
    data: () => ({
        rules: rules,
        kinds: Kinds,
        criteria: {
            partyId: null,
            number: null,
            kindOfInsuranceList: [],
            startApplied: null,
            endApplied: null,
            startSince: null,
            endSince: null,
            startTill: null,
            endTill: null,
        }
    }),
    computed: {
        default_criteria() {
           return {
               partyId: null,
               number: null,
               kindOfInsuranceList: [],
               startApplied: null,
               endApplied: null,
               startSince: null,
               endSince: null,
               startTill: null,
               endTill: null,
           }
        },
    },
    watch: {

    },
    methods: {
        close() {
            this.$emit('hide_filter_dialog', false)
        },
        search() {
            this.$emit('search', this.criteria)
        }
    }
}
</script>

<style scoped>

</style>