import Vue from "vue";
import Vuetify from "vuetify/lib";
import VueI18n from "vue-i18n"

Vue.use(Vuetify);
Vue.use(VueI18n);

const messages = {
  ru: {
    $vuetify: {
      close: "Закрыть",
      dataIterator: {
        pageText: "{0}-{1} из {2}",
        noResultsText: "Совпадающих записей не найдено",
        loadingText: "Загрузка данных...",
      },
      dataTable: {
        itemsPerPageText: "Выбрать количество",
        ariaLabel: {
          sortDescending: ": Сортировка по убыванию.",
          sortAscending: ": Сортировка по возрастанию.",
          sortNone: ": Сортировка отсутствует",
        },
        sortBy: "Сортировать по",
      },
      dataFooter: {
        pageText: "{0}-{1} из {2}",
        itemsPerPageText: "Выбрать количество",
        itemsPerPageAll: "Все",
        nextPage: "Следующая страница",
        prevPage: "Предыдущая страница",
        firstPage: "Первая страница",
        lastPage: "Последняя страница",
      },
      datePicker: {
        itemsSelected: "{0} выбрано",
      },
      noDataText: "Список пуст",
      carousel: {
        prev: "Предыдущий",
        next: "Следующий",
      },
      calendar: {
        moreEvents: "Еще {0}",
      },
    },
  },
};

const i18n = new VueI18n({
  locale: "ru",
  messages,
  silentTranslationWarn: true,
});

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#145350",
        primaryDark: "#145356",
        primaryVeryDark: "#145356",
        secondary: "#424242",
        accent: "#f1971b",
        error: "#FF5252",
        info: "#2196F3",
        success: "#4CAF50",
        warning: "#f1971b",
        lightGreen:"#27ff49"
      }
    }
  },
  icons: {
    iconfont: "mdi",
  },
  lang: {
    t: (key, ...params) => i18n.t(key, params),
  },
});
