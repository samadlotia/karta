var HeaderTitle = {
  view: function(ctrl, title) {
    return m('span', {'class': 'mdl-layout__title'}, title);
  }
};

var BackBtn = {
  view: function(ctrl, onclick) {
    return m('a', {'class': 'mdl-button mdl-js-button mdl-button--icon', onclick: onclick},
      m('i', {'class': 'material-icons'}, 'arrow_back'));
  }
};

var Page = {
  view: function(ctrl, args) {
    return m('div', {'class': 'mdl-layout mdl-js-layout mdl-layout--fixed-header'}, [
      m('header', {'class': 'mdl-layout__header'}, [
        m('div', {'class': 'mdl-layout__header-row'}, args.header)
      ]),
      m('main', {'class': 'mdl-layout__content'}, args.body)
    ]);
  }
};

var Grid = {
  view: function(ctrl, cells) {
    return m('div', {'class': 'mdl-grid'}, cells);
  }
};

var CardCell = {
  view: function(ctrl, args) {
    return m('div', {'class': 'mdl-cell mdl-cell--4-col-desktop mdl-cell--4-col-tablet mdl-cell--4-col-phone'},
      m('div', {'class': 'mdl-card mdl-shadow--2dp stack', style: 'width: 100%; cursor: pointer;', onclick: args.onclick},
        m('div', {'class': 'mdl-card__title', style: 'padding-top: 20%; justify-content: center;'},
          m('h1', {'class': 'mdl-card__title-text'}, args.title))));
  }
}