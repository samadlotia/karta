var AddEditCardsDialog = {
  controller: function(args) {
    this.card = m.prop(null);
    this.front = m.prop('');
    this.back = m.prop('');
    this.autofillChoices = [
      {sourceLang: 'fr', targetLang: 'en'},
    ];
    this.autofillChoice = m.prop(null);
    var dialog = null;
    this.configDialog = (elem) => {
      dialog = elem;
      componentHandler.upgradeDom();
    };
    var frontTextElem = null;
    this.configFrontTextElem = (elem) => {
      frontTextElem = elem;
    };

    var addNewCard = () => {
      m.request({
        method: 'POST',
        url: '/_/card',
        data: {
          deck: args.deckKey,
          front: this.front(),
          back: this.back(),
          score: 0
        }
      }).then((newCard) => {
        args.cards(args.cards().concat([newCard]));
        this.front('');
        this.back('');
        frontTextElem.focus();
      });
    };

    var saveCard = () => {
      m.request({
        method: 'PUT',
        url: '/_/card',
        data: {
          key: this.card().key,
          deck: this.card().deck,
          front: this.front(),
          back: this.back(),
          score: this.card().score,
        }
      }).then((updatedCard) => {
        var card = args.cards().find((card) => card.key == updatedCard.key);
        var cardIndex = args.cards().indexOf(card);
        args.cards().splice(cardIndex, 1, updatedCard);
        this.front('');
        this.back('');
        dialog.close();
      });
    };

    this.handleOk = () => {
      if (this.card()) {
        saveCard();
      } else {
        addNewCard();
      }
    };
    this.handleCancel = () => {
      this.front('');
      this.back('');
      dialog.close();
    };
    this.handleAutofill = () => {
      if (!this.front() || this.back() || !this.autofillChoice()) {
        return;
      }
      m.request({
        method: 'GET',
        url: 'https://www.googleapis.com/language/translate/v2',
        data: {
          'key': 'AIzaSyBQyEkh_jvU5vlxFTrrdk0v_zxpEUC2qjg',
          'source': this.autofillChoice().sourceLang,
          'target': this.autofillChoice().targetLang,
          'q': this.front().split('\n')[0]
        }
      }).then((response) => {
        const translatedText = response.data.translations[0].translatedText;
        this.back(translatedText);
      });
    };
    args.openAddCardsDialogHook((card) => {
      if (card) {
        this.card(card);
        this.front(card.front);
        this.back(card.back);
      } else {
        this.card(null);
      }
      dialog.showModal();
      frontTextElem.focus();
    });
  },
  view: function(ctrl) {
    return m('dialog', {'class': 'mdl-dialog', 'config': ctrl.configDialog}, [
      m('div', {'class': 'mdl-dialog__content'},
        m('form', {'onsubmit': () => false}, [
          m('h5', [
            m('button', {'class': 'mdl-button mdl-js-button mdl-button--icon', onclick: () => ctrl.front('')},
              m('i', {'class': 'material-icons'}, 'clear')),
            'Front']),
          m('div', {'class': 'mdl-textfield mdl-js-textfield'}, [
            m('textarea', {
              'class': 'mdl-textfield__input',
              type: 'text',
              rows: '3',
              oninput: m.withAttr('value', ctrl.front),
              onblur: ctrl.handleAutofill.bind(ctrl),
              config: ctrl.configFrontTextElem
            }, ctrl.front()),
          ]),
          m('div', [
            'Autofill:',
            m('button', {'class': 'mdl-button mdl-js-button', 'id': 'autofill-select'},
              (ctrl.autofillChoice() ?
                (ctrl.autofillChoice().sourceLang + ' → ' + ctrl.autofillChoice().targetLang) :
                'None')),
            m('ul', {'class': 'mdl-menu mdl-js-menu mdl-js-ripple-effect', 'data-mdl-for': 'autofill-select', onclick: () => {}}, 
              [m('li', {'class': 'mdl-menu__item', onclick: () => ctrl.autofillChoice(null)}, 'None')].concat(
                ctrl.autofillChoices.map((choice) =>
                  m('li', {'class': 'mdl-menu__item', onclick: () => ctrl.autofillChoice(choice)}, choice.sourceLang + ' → ' + choice.targetLang))))
          ]),
          m('h5', [
            m('button', {'class': 'mdl-button mdl-js-button mdl-button--icon', onclick: () => ctrl.back('')},
              m('i', {'class': 'material-icons'}, 'clear')),
            'Back']),
          m('div', {'class': 'mdl-textfield mdl-js-textfield'}, [
            m('textarea', {
              'class': 'mdl-textfield__input',
              type: 'text',
              rows: '3',
              oninput: m.withAttr('value', ctrl.back)
            }, ctrl.back()),
          ]),
        ])),
      m('div', {'class': 'mdl-dialog__actions'}, [
        m('button', {'class': 'mdl-button mdl-js-button',
                     onclick: ctrl.handleOk},
          !ctrl.card() ? 'Add & Another' : 'Save'),
        m('button', {'class': 'mdl-button mdl-js-button close',
                     onclick: ctrl.handleCancel},
          !ctrl.card() ? 'Done' : 'Cancel'),
      ])
    ]);
  }
};

var Deck = {
  controller: function() {
    this.deckKey = m.route.param('key');
    this.deckName = '';
    this.stackKey = '';
    this.stackName = '';
    this.cards = m.prop([]);
    this.openAddCardsDialogHook = m.prop(null);

    m.request({method: 'GET', url: '/_/deck/' + this.deckKey}).then((deck) => {
      this.deckName = deck.name;
      this.stackKey = deck.stack;

      m.request({method: 'GET', url: '/_/stack/' + deck.stack}).then((stack) => {
        this.stackName = stack.name;
      });
    });

    m.request({method: 'GET', url: '/_/card', data: {deck: this.deckKey}}).then(this.cards);

    this.deleteCard = (key) => {
      m.request({method: 'DELETE', url: '/_/card', data: {key: key}}).then(() => {
        this.cards(this.cards().filter((card) => card.key !== key));
      });
    };

    this.editCard = (card) => {
      this.openAddCardsDialogHook()(card);
    };
  },
  view: function(ctrl) {
    return m(Page, {
      header: [
        m(BackBtn, () => { m.route('/stack/' + ctrl.stackKey); }),
        m(HeaderTitle, ctrl.stackName + ': ' + ctrl.deckName)
      ],
      body: m('div', {'class': 'mdl-grid'}, [
        m(AddEditCardsDialog, {
          deckKey: ctrl.deckKey,
          cards: ctrl.cards,
          openAddCardsDialogHook: ctrl.openAddCardsDialogHook 
        }),
        m('div', {'class': 'mdl-cell mdl-cell--12-col-desktop mdl-cell--8-col-tablet mdl-cell--4-col-phone'},
          m('table', {'class': 'mdl-data-table mdl-js-data-table mdl-shadow--2dp', style: 'width: 100%;'}, [
            m('thead',
              m('tr', [
                m('th', {'style': 'width: 2em;'}),
                m('th', {'class': 'mdl-data-table__cell--non-numeric'}, 'Front'),
                m('th', {'class': 'mdl-data-table__cell--non-numeric'}, 'Back'),
                m('th', {'style': 'width: 2em;'}),
              ])),
            ctrl.cards().map((card) =>
              m('tr', [
                m('td',
                  m('button', {'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect', onclick: ctrl.editCard.bind(ctrl, card)},
                    m('i', {'class': 'material-icons'}, 'mode_edit'))),
                m('td', {'class': 'mdl-data-table__cell--non-numeric'}, card.front),
                m('td', {'class': 'mdl-data-table__cell--non-numeric'}, card.back),
                m('td',
                  m('button', {'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect', onclick: ctrl.deleteCard.bind(ctrl, card.key)},
                    m('i', {'class': 'material-icons'}, 'delete'))),
              ]))
          ])),
        m('div', {'class': 'mdl-cell mdl-cell--1-col'},
          m('button', {'class': 'mdl-button mdl-js-button mdl-button--fab mdl-button--colored', onclick: () => { ctrl.openAddCardsDialogHook()(null); }},
            m('i', {'class': 'material-icons'}, 'add'))),
        m('div', {'class': 'mdl-cell mdl-cell--1-col'},
          m('button', {'class': 'mdl-button mdl-js-button mdl-button--fab', onclick: () => { if (ctrl.cards().length) { m.route('/play/' + ctrl.deckKey); }}},
            m('i', {'class': 'material-icons'}, 'play_arrow'))),
      ])
    });
  }
};