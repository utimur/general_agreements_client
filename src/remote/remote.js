import cargo_store from "../store/cargo_store"
import navigation from "../navigation"
import cargo_routes from "../router/routes"
import error_handler from "../utils/error_handler";

let install = (Vue, axios, store, router, config, user, auth) => {

    if (!axios) {
        console.warn('Please provide an axios');
        return;
    }
    if (!store) {
        console.warn('Please provide a store');
        return;
    }

    if (!router) {
        console.warn('Please provide a router');
        return;
    }

    if (!config) {
        console.warn('Please provide a config');
        return;
    }

    if (!user) {
        console.warn('Please provide user profile');
        return;
    }

    let axios_create = (endpoint_name) => {
        let endpoint = axios.create({
            baseURL: config.find(item => item.endpoint_name === endpoint_name).address
        });

        endpoint.interceptors.request.use(auth, error => {
            return Promise.reject(error)
        });

        return endpoint;
    };

    let admin = axios_create("cargo_adminHost");
    let money = axios_create("cargo_moneyHost");
    let attorney = axios_create("cargo_attorneyHost");
    let party = axios_create("cargo_partyHost");
    let approval = axios_create("cargo_approvalHost");
    let employee = axios_create("cargo_employeeHost");
    let commission = axios_create("commission_restHost");

    let error_handle = error_handler(router);

    admin.interceptors.response.use(null, error_handle);
    money.interceptors.response.use(null, error_handle);

    Vue.prototype.$commission_restHost = commission;
    Vue.prototype.$cargo_adminHost = admin;
    Vue.prototype.$cargo_moneyHost = money;
    Vue.prototype.$cargo_attorneyHost = attorney;
    Vue.prototype.$cargo_partyHost = party;
    Vue.prototype.$cargo_approvalHost = approval;
    Vue.prototype.$cargo_employeeHost = employee;

    store.registerModule("cargo", cargo_store);
    store.commit("cargo/set_user", user); //Достаем текущего пользователя из родительского приложения

    const registriesSocket = 'registriesSocket';
    let registries_socket_address = config.find(item => item.endpoint_name === registriesSocket).address;
    store.commit("cargo/set_registries_socket_address", registries_socket_address);

    let {routes} = router.options;
    let routeData = routes.find(r => r.path === "/");
    routeData.children = cargo_routes;

    router.addRoutes(routeData.children);
};

let set_navigation_items = (store) => {
    store.commit("setNavigationItems", navigation);
};

export {
    set_navigation_items,
    install
}