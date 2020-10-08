import axios from "axios"
import Vue from "vue"
import router from "../router/router"
import error_handler from "../utils/error_handler";


let server = "http://eltransinternal.skpari.local/";
//let server = "http://localhost:8080/";
let admin = axios.create({
    baseURL: server + "cargoadmin/rest/"
});

let commission = axios.create({
    baseURL: "http://eltransinternal.skpari.local/commissions-rest/commissions/"
});

let attorney = axios.create({
   baseURL: "http://eltransinternal.skpari.local/attorneys/"
});

let money = axios.create({
    baseURL: server + "moneyrest/"
});

let party = axios.create({
    baseURL: "http://podev.skpari.local/parties-rest/rest/"
});

let approval = axios.create({
    baseURL: server + "approval-rest/"
});

let employee = axios.create({
    baseURL: "http://employee.skpari.local/employeeclient/"
});

let general_agreements = axios.create({
    baseURL: "http://romanova-mn:54321/" + "general_agreements/"
});


let auth_interceptor = (config) => {
    config.headers.Authorization = `Bearer ${Vue.prototype.$keycloak.token}`;
    return config;
};

let on_auth_error = (error) => {
    return Promise.reject(error);
};

admin.interceptors.request.use(auth_interceptor, on_auth_error);
money.interceptors.request.use(auth_interceptor, on_auth_error);
commission.interceptors.request.use(auth_interceptor, on_auth_error);
attorney.interceptors.request.use(auth_interceptor, on_auth_error);

let error_handle = error_handler(router);

admin.interceptors.response.use(null, error_handle);
money.interceptors.response.use(null, error_handle);
commission.interceptors.response.use(null, error_handle);
attorney.interceptors.response.use(null, error_handle);

export {commission, attorney, money, admin, approval, employee, party, general_agreements, auth_interceptor, on_auth_error, error_handle}
