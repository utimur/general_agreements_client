import {route_names} from "../utils/consts";

let GeneralAgreements = () => import("../views/GeneralAgreements");

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
                component: GeneralAgreements,
                children: [
                    {
                        path: "create",
                        name: route_names.GENERAL_AGREEMENT_CREATE,
                        component: GeneralAgreements
                    },
                    {
                        path: ":id",
                        name: route_names.GENERAL_AGREEMENT_DETAIL,
                        component: GeneralAgreements
                    },
                    {
                        path: "additionalAgreement",
                        name: route_names.ADDITIONAL_AGREEMENT,
                        props: true,
                        component: GeneralAgreements,
                        children: [
                            {
                                path: "create",
                                name: route_names.ADDITIONAL_AGREEMENT_CREATE,
                                component: GeneralAgreements
                            },
                            {
                                path: ":id",
                                name: route_names.ADDITIONAL_AGREEMENT_DETAIL,
                                component: GeneralAgreements
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