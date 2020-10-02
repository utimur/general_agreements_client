import Vue from "vue"
import Router from "vue-router"
import Routes from "./routes"
Vue.use(Router);

export default new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/",
            redirect: "/cargo"
        },
        {
            path: "/cargo",
            name: "cargo",
            component: () => import("../views/AppLayout.vue"),
            children: Routes
        }
    ]
})
