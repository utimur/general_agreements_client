<template>
    <v-layout class="justify-center">
        <v-flex xs12 md6 lg4>
            <v-card>
                <v-card-title>
                    Нет доступа к запрашиваемой странице
                </v-card-title>
                <v-card-text>
                    <v-list v-if="employeeIds.length">
                        <v-subheader class="px-0">
                            Следующий список лиц имеет доступ к запрашиваемой странице:
                        </v-subheader>
                        <v-list-item
                            class="px-0"
                            three-line
                            v-for="(employeeId,key) in employeeIds"
                            :key="key"
                        >
                            <v-list-item-content>
                                <v-list-item-title class="px-0">
                                    {{"- " + get_employee_full_name(employeeId)}}
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                    {{get_employee_position_details(employeeId)}}
                                </v-list-item-subtitle>
                                <v-list-item-subtitle>
                                    {{get_employee_phone(employeeId) }}
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                    <template v-else>
                        Извините, у вас нет доступа к запрашиваемой странице.
                        В случае, если вы уверены, что запрос должен быть обработан, обратитесь в службу поддержки.
                    </template>
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn outlined color="primary" @click="redirect">
                        {{redirect_btn_title}}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-flex>
    </v-layout>

</template>

<script>
    import {load_employees_detail_by_id} from "../../utils/load_employees_detail";

    const HOME_PATH = "/";

    export default {
        name: "NoAccess",
        beforeRouteEnter(to, from, next) {
            next(vm => {
                    if (from.params.hasOwnProperty("id") && from.matched && from.matched.length > 1)
                        vm.redirect_path = from.matched[from.matched.length - 2].path;
                    else
                        vm.redirect_path = from.fullPath;
                }
            )
        },
        data() {
            return {
                redirect_path: HOME_PATH
            }
        },
        computed: {
            employees_detail() {
                return this.$store.getters["cargo/get_employees_detail"];
            },
            redirect_btn_title() {
                return this.redirect_path === HOME_PATH ? "На главную" : "Назад";
            }
        },
        props: {
            employeeIds: {
                type: Array,
                default: () => []
            }
        },
        created() {
            load_employees_detail_by_id(
                this.employeeIds,
                this.$store,
                this.$cargo_employeeHost
            );
        },
        watch: {
            employeeIds(new_value) {
                load_employees_detail_by_id(
                    new_value,
                    this.$store,
                    this.$cargo_employeeHost
                );
            }
        },
        methods: {
            redirect() {
                this.$router.push(this.redirect_path);
            },
            get_employee(id) {
                let employee = this.employees_detail.find(employee => employee.id === id);
                return employee ? employee : null;
            },
            get_employee_full_name(id) {
                let employee = this.get_employee(id);
                return employee ? employee.fullName : "";
            },
            get_employee_position_details(id) {
                let employee = this.get_employee(id);
                return employee ? employee.departmentName + ", " + employee.positionName : "";
            },
            get_employee_phone(id) {
                let employee = this.get_employee(id);
                let phones = employee ? employee.phones : [];
                let phone_str = "";
                phones.forEach(phone => {
                    if (phone.kind === "work")
                        phone_str += "Рабочий номер: " + phone.value + "; ";
                    if (phone.kind === "mobile")
                        phone_str += "Мобильный номер: " + phone.value + "; ";
                });
                return phone_str;
            },
        },
    }
</script>

<style scoped>

</style>