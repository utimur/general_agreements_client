export function format_date(datetime) {
    if (!datetime)
        return '';
    let date = new Date(datetime);
    return Intl.DateTimeFormat('ru-RU').format(date);
};

export function format_time(datetime) {
    if (!datetime)
        return '';
    let dateTime = new Date(datetime);
    return new Date(dateTime).toLocaleTimeString("ru-Ru");
};

export function format_datetime(datetime) {
    if (!datetime)
        return '';
    let dateTime = new Date(datetime);
    return dateTime.toLocaleDateString('ru-RU') + ", " + dateTime.toLocaleTimeString('ru-RU').slice(0, 5);
};

export function format_datetime_timezone(datetime) {
    if (!datetime)
        return '';
    return to_calendar_format(datetime) + "T" + format_time(datetime);
};

export function to_calendar_format(datetime) {
    if (!datetime)
        return '';
    let dateTime = new Date(datetime);
    let date_format_str =
        dateTime.getFullYear().toString()
        + "-" +
        ((dateTime.getMonth() + 1).toString().length == 2 ?
            (dateTime.getMonth() + 1).toString() :
            "0" + (dateTime.getMonth() + 1).toString())
        + "-" +
        (dateTime.getDate().toString().length == 2 ?
            dateTime.getDate().toString() :
            "0" + dateTime.getDate().toString())
    return date_format_str;
};