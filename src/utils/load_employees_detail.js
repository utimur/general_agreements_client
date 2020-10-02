let store;
let employee_host;
let employees_detail = [];

export function load_employees_detail_by_id(ids, storeObj, employeeAxios) {
    store = storeObj;
    employee_host = employeeAxios;

    let employee_ids = new Set();
    ids.forEach(id => employee_ids.add(id));

    employee_ids.forEach(employee_id => {
        if (!employees_detail_contain_by_id(employee_id))
            find_employee_by_id(employee_id);
    })
}

export function load_employees_detail_by_login(logins, storeObj, employeeAxios) {
    store = storeObj;
    employee_host = employeeAxios;

    logins.forEach(login => {
        if (!employees_detail_contain_by_login(login))
            find_employee_by_login(login);
    })
}

function employees_detail_contain_by_id(employee_id) {
    return employees_detail.some(employee => employee.id === employee_id);
}


function employees_detail_contain_by_login(login) {
    return employees_detail.some(employee => employee.login === login);
}

function find_employee_by_login(login) {
    employee_host.post("api/employee/getUserByLogin", login, {
            headers: {
                "Content-Type": "text/plain"
            }
        }
    )
        .then(value => {
            add_employee_to_store(value.data);
        })
        .catch(() => {
        });
}

function find_employee_by_id(employee_id) {
    employee_host.post("api/employee/get", {
        id: employee_id
    })
        .then(value => {
            add_employee_to_store(value.data);
        })
        .catch(() => {
        });
}

function get_employee_full_name(employee) {
    return employee.lastName + " "
        + employee.firstName + " "
        + employee.secondName + " "
}

export function add_employee_to_store(employee) {
    employees_detail = store.getters["cargo/get_employees_detail"];
    employees_detail.push(get_employee_detail(employee));
    store.commit("cargo/set_employees_detail", employees_detail);
}

function get_employee_detail(employee) {
    return {
        id: employee.id,
        login: employee.login,
        fullName: get_employee_full_name(employee),
        shortName: get_employee_short_name(employee),
        phones: employee.phone,
        positionName: employee.positionName,
        departmentName: employee.departmentName
    }
}

function get_employee_short_name(employee) {
    return employee.lastName + " "
        + employee.firstName.charAt(0) + "."
        + employee.secondName.charAt(0) + "."
}