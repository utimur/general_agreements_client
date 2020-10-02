import Vue from "vue"
import Vuex from "vuex"
import cargo from "./cargo_store"

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        cargo: cargo
    },
    getters: {
        navigationItems: state => state.navigationItems
    },
    state: {
        navigationItems: []
    },
    actions: {},
    mutations: {
        setNavigationItems(state, value) {
            state.navigationItems = value
        }
    }
});
