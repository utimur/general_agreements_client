<template>
    <router-view/>
</template>

<script>
    import {approve_kinds, redirect, route_names} from "./utils/consts";

    export default {
        name: "GeneralAgreementsApp",
        watch:{
            "$route"() {
                this.route_handler();
            }
        },
        methods:{
            route_handler() {
                let id = this.$route.query.id;
                let type = this.$route.query.type;
                if (id && type) {
                    switch(type) {
                        case approve_kinds.CONTRACT:
                        case redirect.CONTRACT:
                            this.$router.push({
                                name: route_names.CONTRACT_DETAIL,
                                params: {
                                    "id": id
                                }
                            });
                            break;
                        case redirect.GENERAL_AGREEMENT:
                            this.$router.push({
                                name: route_names.GENERAL_AGREEMENT_DETAIL,
                                params: {
                                    "id": id
                                }
                            });
                            break;
                        case approve_kinds.APPLICATION:
                            this.$router.push({
                                name: route_names.APPLICATION_DETAIL,
                                params: {
                                    "id": id
                                }
                            });
                            break;
                        case approve_kinds.CHANGE_REQUEST:
                            this.$router.push({
                                name: route_names.APPLICATION_REQUEST_TO_CHANGE,
                                params: {
                                    "id": id
                                }
                            });
                            break;
                        case approve_kinds.CANCEL_REQUEST:
                            this.$router.push({
                                name: route_names.APPLICATION_REQUEST_TO_CANCEL,
                                params: {
                                    "id": id
                                }
                            });
                            break;
                        case approve_kinds.APPROVE_HOLDER:
                            this.$router.push({
                                name: route_names.HOLDER_DETAIL,
                                params: {
                                    "id": id
                                }
                            });
                            break;
                    }
                }
            },
        },
        created() {
            this.route_handler();
        }
    };


</script>

<style>
    .v-card {
        border-radius: 10px !important;
    }

    div.v-input.v-input--selection-controls.v-input--checkbox {
        margin-top: 0!important;
    }

    .show-changes.theme--light.v-text-field--outlined fieldset{
        border-color: #ff8300!important
    }
    .show-changes.v-text-field--outlined .v-label{
        color: #e47500!important
    }
    .show-high-priority-changes.theme--light.v-text-field--outlined fieldset{
        border-color: red!important;
    }
    .show-high-priority-changes.v-text-field--outlined .v-label{
        color: red!important
    }
    .dial {
        margin-top: 4em;
    }

    .highlight label, .highlight input, .highlight span, .highlight i, .highlight div.v-select__selection {
        color: #ff8300!important
    }

    .highlight fieldset {
        border-color: #ff8300!important;
        border-width: 1px!important;
    }

    .highlight {
        pointer-events: none;
    }

    .highlight-red label, .highlight-red input, .highlight-red span, .highlight-red i, .highlight-red div.v-select__selection {
        color: #ff0000!important
    }

    .highlight-red fieldset {
        border-color: #ff0000!important;
        border-width: 1px!important;
    }

    .highlight-red {
        pointer-events: none;
    }


    .my-list.v-list-item__subtitle {
        white-space: normal;
    }

    .my-list.v-list-item {
        min-height: 25px;
    }

    .my-list.v-list-item__title {
        white-space: normal;
    }

    .my-select.theme--light.v-select .v-select__selection--disabled {
        color: rgba(0, 0, 0, 0.87)!important;
    }

    .tr-pointer tbody tr {
        cursor: pointer;
    }
</style>
