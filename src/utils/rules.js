let rules = {
    non_negative: value => (!value || parseFloat(value) >= 0) || "Значение не может быть отрицательным",
    positive: value => (!value || parseFloat(value) > 0) || "Значение должно быть больше 0",
    required: value => !!value || "Обязательное поле",
    required_or_delete: value => !!value || "Заполните поле или удалите",
    not_empty_array: value => (!!value && !!value.length) || "Обязательное поле",
    tillAfterSince: (since, till) => {
        if (!since || !till)
            return true;
        let tillDate = new Date(till);
        let sinceDate = new Date(since);
        return tillDate >= sinceDate || "Дата конца не может быть раньше даты начала";
    },
    route_start_date: (value, liability_begins, liability_ends) => {
        if (!value)
            return true;
        let start_date = new Date(value);
        if (liability_begins && start_date < new Date(liability_begins))
            return "Дата начала перевозки не может быть меньше даты начала страховой ответственности";
        if (liability_ends && start_date > new Date(liability_ends))
            return "Дата начала перевозки не может быть больше даты конца страховой ответственности";
        return true;
    },
    route_end_date: (value, liability_begins, liability_ends) => {
        if (!value)
            return true;
        let end_date = new Date(value);
        if (liability_ends && end_date > new Date(liability_ends))
            return "Дата окончания перевозки не может быть больше даты конца страховой ответственности";
        if (liability_begins && end_date < new Date(liability_begins))
            return "Дата окончания перевозки не может быть меньше даты начала страховой ответственности";
        return true;
    },
};

export default rules;