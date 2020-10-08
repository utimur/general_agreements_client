import Vue from "vue"
import App from "./Root.vue"

import store from "./store/store"
import router from "./router/router"
import VueKeyCloak from "@dsb-norge/vue-keycloak-js"
import {commission, admin, money, party, approval, employee, attorney, general_agreements} from "./http/axios"
import "@mdi/font/css/materialdesignicons.css"
import vuetify from "./plugins/vuetify"
import party_install from "party/src/remote/remote"
import axios from "axios"
import navigation from "./navigation"

store.commit("setNavigationItems", navigation);

Vue.config.productionTip = false;
Vue.prototype.$cargo_adminHost = admin;
Vue.prototype.$money_moneyHost = money;
Vue.prototype.$cargo_moneyHost = money;
Vue.prototype.$cargo_partyHost = party;
Vue.prototype.$cargo_attorneyHost = attorney;
Vue.prototype.$cargo_approvalHost = approval;
Vue.prototype.$cargo_employeeHost = employee;
Vue.prototype.$general_agreements = general_agreements;
Vue.prototype.vuetify = vuetify;
Vue.prototype.$commission_restHost = commission;

axios.get(window.location.origin + "/config.json")
    .then(response => {
        let config = response.data;

        const registriesSocket = 'registriesSocket';
        let registries_socket_address = config.find(item => item.endpoint_name === registriesSocket).address;
        store.commit("cargo/set_registries_socket_address", registries_socket_address);

        party_install(Vue, axios, store, router, config);
    });


Vue.use(VueKeyCloak, {
    init: {
        onLoad: "login-required",
        checkLoginIframe: false
    },
    config: {
        realm: "master",
        url: "http://podev.skpari.local:8180/auth",
        clientId: "pari"
    },
    onReady: () => {
        new Vue({
            store,
            router,
            vuetify,
            render: h => h(App)
        }).$mount("#app");

    }
});

