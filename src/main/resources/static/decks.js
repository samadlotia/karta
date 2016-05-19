var AddDeck = {
  controller: function(args) {
    this.newDeckName = m.prop('');

    var addDeckDialog = null;
    this.configAddDeckDialog = (elem, isInit, context) => {
      addDeckDialog = elem;
      componentHandler.upgradeDom();
    }

    this.openAddDeckDialog = () => {
      this.newDeckName('');
      addDeckDialog.showModal();
    };

    this.handleAddDeck = () => {
      m.request({method: 'POST',
                 url: '/_/deck',
                 data: {name: this.newDeckName(), stack: args.stackKey}})
          .then((newDeck) => {
        args.decks(args.decks().concat([newDeck]));
        m.redraw(false);
        addDeckDialog.close();
      });
    };

    this.handleCancelAddDeck = () => {
      addDeckDialog.close();
    };
  },
  view: function(ctrl) {
    return m('div', {'class': 'mdl-cell mdl-cell--12-col-desktop mdl-cell--8-col-tablet mdl-cell--4-col-phone'}, [
      m('button', {'class': 'mdl-button mdl-js-button mdl-button--fab mdl-button--colored',
                   onclick: ctrl.openAddDeckDialog},
        m('i', {'class': 'material-icons'}, 'add')),
      m('dialog', {'class': 'mdl-dialog', 'config': ctrl.configAddDeckDialog}, [
        m('div', {'class': 'mdl-dialog__content'},
          m('div', {'class': 'mdl-textfield mdl-js-textfield'}, [
            m('input', {'class': 'mdl-textfield__input',
                        'type': 'text', 'id': 'new_deck_name_input',
                        oninput: m.withAttr('value', ctrl.newDeckName),
                        value: ctrl.newDeckName()}),
            m('label', {'class': 'mdl-textfield__label',
                        'for': 'new_deck_name_input'}, 'Deck name')
          ])),
        m('div', {'class': 'mdl-dialog__actions'}, [
          m('button', {'class': 'mdl-button mdl-js-button',
                       onclick: ctrl.handleAddDeck},
            'Add'),
          m('button', {'class': 'mdl-button mdl-js-button close',
                       onclick: ctrl.handleCancelAddDeck},
            'Cancel'),
        ])
      ]),
    ]);
  },
};

var DeckCard = {
  view: function(ctrl, deck) {
    return m(CardCell, {
      key: deck.key,
      title: deck.name,
      onclick: () => { m.route('/deck/' + deck.key); }
    });
  }
};

var Stack = {
  controller: function() {
    this.key = m.route.param('key');
    this.name = '';
    this.decks = m.prop([]);

    m.request({method: 'GET', url: '/_/stack/' + this.key}).then((stack) => {
      this.name = stack.name;
    });
    
    m.request({method: 'GET', url: '/_/deck', data: {stack: this.key}}).then(this.decks);
  },
  view: function(ctrl) {
    var cells = ctrl.decks().map((deck) => m(DeckCard, deck));
    cells.push(m(AddDeck, {key: 'addDeckCell', decks: ctrl.decks, stackKey: ctrl.key}));
    return m(Page, {
      header: [
        m(BackBtn, () => { m.route('/stack'); }),
        m(HeaderTitle, ctrl.name)
      ],
      body: m(Grid, cells)
    });
  }
};