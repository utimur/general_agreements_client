import {common_consts, route_names} from "./consts";

let router;

let error_handle = (error) => {
    if (
        error.request.responseType === 'blob' &&
        error.response.data instanceof Blob &&
        error.response.data.type &&
        error.response.data.type.toLowerCase().indexOf('json') != -1
    ) {
        return transform_blob(error);
    } else {
        return error_processing(error);
    }
};

function error_processing(error) {
    if (error.response &&
        error.response.status === 404
        && !is_getting_file_name_for_general_agreement(error.response.config.url)
        && error.response.data
        && error.response.data.system === common_consts.SYSTEM)
    {
        redirect_to_not_found_page();
    } else if (error.response && error.response.status === 403) {
        redirect_to_no_access_page(error.response.data ? JSON.parse(error.response.data.description) : null);
    } else {
        return Promise.reject(error);
    }
}

async function transform_blob(error) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsText(error.response.data);
        reader.addEventListener('load', () => {
            error.response.data = JSON.parse(reader.result.toString());
            reject(error);
        }, { once: true });
        reader.addEventListener('error', () => {
            reject(error)
        }, { once: true } )
    });
}

function is_getting_file_name_for_general_agreement(url){
   if (url.includes("generalAgreement/getFileName"))
       return true;
}

function redirect_to_not_found_page() {
    router.push({
        name: route_names.NOT_FOUND
    });
}

function redirect_to_no_access_page(employeeIds) {
    router.push({
        name: route_names.NO_ACCESS,
        params: {
            employeeIds: employeeIds
        }
    });
}

function redirect_to_unexpected_error_page() {
    router.push({
        name: route_names.UNEXPECTED
    });
}

export default function (router_param) {
    router = router_param;
    return error_handle;
}