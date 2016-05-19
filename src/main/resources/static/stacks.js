var AddStack = {
  controller: function(args) {
    this.newStackName = m.prop('');
    var addStackDialog = null;

    this.configAddStackDialog = (elem, isInit, context) => {
      addStackDialog = elem;
      componentHandler.upgradeDom();
    }

    this.openAddStackDialog = () => {
      this.newStackName('');
      addStackDialog.showModal();
    };

    this.handleAddStack = () => {
      m.request({method: 'POST',
                 url: '/_/stack',
                 data: {name: this.newStackName()}})
          .then((newStack) => {
        args.stacks(args.stacks().concat([newStack]));
        addStackDialog.close();
        m.redraw(false);
      });
    };

    this.handleCancelAddStack = () => {
      addStackDialog.close();
    };
  },
  view: function(ctrl) {
    return m('div', {'class': 'mdl-cell mdl-cell--12-col-desktop mdl-cell--8-col-tablet mdl-cell--4-col-phone'}, [
      m('button', {'class': 'mdl-button mdl-js-button mdl-button--fab mdl-button--colored',
                   onclick: ctrl.openAddStackDialog},
        m('i', {'class': 'material-icons'}, 'add')),
      m('dialog', {'class': 'mdl-dialog', 'config': ctrl.configAddStackDialog}, [
        m('div', {'class': 'mdl-dialog__content'},
          m('div', {'class': 'mdl-textfield mdl-js-textfield'}, [
            m('input', {'class': 'mdl-textfield__input',
                        'type': 'text', 'id': 'new_stack_name_input',
                        oninput: m.withAttr('value', ctrl.newStackName),
                        value: ctrl.newStackName()}),
            m('label', {'class': 'mdl-textfield__label',
                        'for': 'new_stack_name_input'}, 'Stack name')
          ])),
        m('div', {'class': 'mdl-dialog__actions'}, [
          m('button', {'class': 'mdl-button mdl-js-button',
                       onclick: ctrl.handleAddStack},
            'Add'),
          m('button', {'class': 'mdl-button mdl-js-button close',
                       onclick: ctrl.handleCancelAddStack},
            'Cancel'),
        ])
      ]),
    ]);
  },
};

var StackCard = {
  view: function(ctrl, stack) {
    return m(CardCell, {
      key: stack.key,
      title: stack.name,
      onclick: () => { m.route('/stack/' + stack.key); }
    });
  }
};

var Stacks = {
  controller: function() {
    this.stacks = m.prop([]);
    m.request({method: 'GET', url: '/_/stack'}).then(this.stacks);
  },
  view: function(ctrl) {
    var cells = ctrl.stacks().map((stack) => m(StackCard, stack));
    cells.push(m(AddStack, {key: 'addStackCell', stacks: ctrl.stacks}));

    return m(Page, {
      header: m(HeaderTitle, 'Stacks'),
      body: m(Grid, cells)
    });
  }
};
