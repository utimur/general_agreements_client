import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex);

let state = {
    title: "Страхование грузов",
    employees_detail: [],
    parties_detail: [],
    user: {
        id: 612
    },
    copy_value: '',
    copy_agreement: null,
    registries_socket_address: null,
    current_general_agreement_id: null,
    current_general_agreement: null,
};

let getters = {
    get_copy_agreement: state => state.copy_agreement,
    get_copy_value: state => state.copy_value,
    get_user: state => state.user,
    get_employees_detail: state => state.employees_detail,
    get_parties_detail: state => state.parties_detail,
    get_registries_socket_address: state => state.registries_socket_address,
    get_current_general_agreement_id: state => state.current_general_agreement_id,
    get_current_general_agreement: state => state.current_general_agreement,
};

let actions = {};
let mutations = {
    set_copy_agreement(state, value) {
      state.copy_agreement = value;
    },
    set_user(state, value) {
        state.user = value;
    },
    set_copy_value(state, val) {
        state.copy_value = val;
    },
    set_employees_detail(state, value) {
        state.employees_detail = value;
    },
    set_parties_detail(state, value) {
        state.parties_detail = value;
    },
    set_registries_socket_address(state, value) {
        if(!state.registries_socket_address) {
            state.registries_socket_address = value;
        }
    },
    set_current_general_agreement_id(state, value) {
        state.current_general_agreement_id = value
    },
    set_current_general_agreement(state, value) {
        state.current_general_agreement = value
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};
