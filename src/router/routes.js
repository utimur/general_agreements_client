import {route_names} from "../utils/consts";

let Agreements = () => import("../views/Agreements");

export default [
    {
        path: "/cargo",
        name: route_names.CARGO_APP,
        component: () => import("../GeneralAgreementsApp"),
        children: [

            {
                path: "generalAgreement",
                name: route_names.GENERAL_AGREEMENT,
                props: true,
                component: Agreements,
                children: [
                    {
                        path: "create",
                        name: route_names.GENERAL_AGREEMENT_CREATE,
                        component: Agreements
                    },
                    {
                        path: ":id",
                        name: route_names.GENERAL_AGREEMENT_DETAIL,
                        component: Agreements
                    },
                    {
                        path: "additionalAgreement",
                        name: route_names.ADDITIONAL_AGREEMENT,
                        props: true,
                        component: Agreements,
                        children: [
                            {
                                path: "create",
                                name: route_names.ADDITIONAL_AGREEMENT_CREATE,
                                component: Agreements
                            },
                            {
                                path: ":id",
                                name: route_names.ADDITIONAL_AGREEMENT_CREATE,
                                component: Agreements
                            },
                        ]
                    }
                ]
            },
            {
                path: "error",
                name: route_names.ERROR,
                component: () => import("../views/error/Error"),
                children: [
                    {
                        path: "notFound",
                        name: route_names.NOT_FOUND,
                        component: () => import("../views/error/NotFound")
                    },
                    {
                        path: "noAccess",
                        name: route_names.NO_ACCESS,
                        props: true,
                        component: () => import("../views/error/NoAccess")
                    },
                    {
                        path: "unexpectedError",
                        name: route_names.UNEXPECTED,
                        component: () => import("../views/error/UnexpectedError")
                    },
                ]
            }
        ]
    }
]