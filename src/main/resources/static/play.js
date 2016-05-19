var PlayDeck = {
  controller: function() {
    this.deckKey = m.route.param('key');

    this.deckName = '';
    this.stackName = '';
    m.request({method: 'GET', url: '/_/deck/' + this.deckKey}).then((deck) => {
      this.deckName = deck.name;

      m.request({method: 'GET', url: '/_/stack/' + deck.stack}).then((stack) => {
        this.stackName = stack.name;
      });
    });

    var shuffleArray = (array) => {
      var m = array.length;
      while (m) {
        var i = Math.floor(Math.random() * m--);

        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }
      return array;
    };

    var splitArrayIntoChunks = (chunkSize, array) => {
      var chunks = [];
      while (array.length) {
        chunks.push(array.slice(0, chunkSize));
        array = array.slice(chunkSize);
      }
      return chunks;
    };

    this.batchSize = 5;
    this.batches = [];
    this.batchIndex = 0;
    this.cards = [];
    this.cardIndex = 0;
    this.card = null;
    this.showFrontDefault = true;
    this.showFront = this.showFrontDefault;

    this.nextBatch = () => {
      if (this.batches.length == 0 || this.batchIndex == this.batches.length - 1) {
        this.batches = splitArrayIntoChunks(this.batchSize, shuffleArray(this.cards));
        this.batchIndex = 0;
      } else {
        this.batchIndex++;
      }
      this.cardIndex = 0;
      this.card = this.batches[this.batchIndex][this.cardIndex];
      this.showFront = this.showFrontDefault;
    };

    this.nextCard = () => {
      var batch = this.batches[this.batchIndex];
      this.cardIndex = (this.cardIndex + 1) % batch.length;
      this.card = batch[this.cardIndex];
      this.showFront = this.showFrontDefault;
    };

    this.formatCardIndex = () =>
      (this.cardIndex + 1).toString() + ' of ' + this.batches[this.batchIndex].length.toString();

    this.formatBatchIndex = () =>
      (this.batchIndex + 1).toString() + ' of ' + this.batches.length.toString();

    this.flipCard = () => this.showFront = !this.showFront;

    this.cardPrimaryText = () =>
      (this.showFront ? this.card.front : this.card.back).split('\n')[0];

    this.cardSecondaryText = () =>
      (this.showFront ? this.card.front : this.card.back).split('\n').splice(1).filter((s) => s);

    m.request({
        method: 'GET',
        url: '/_/card',
        data: {deck: this.deckKey}
    }).then((cards) => {
      this.cards = cards;
      this.nextBatch();
    });
  },
  view: function(ctrl) {
    var cardView = function() {
      if (!ctrl.card) {
        return [];
      }
      return m('div', {'class': 'mdl-cell mdl-cell--12-col-desktop mdl-cell--8-col-tablet mdl-cell--4-col-phone', style: 'height: calc(100% - 100px);'},
        m('div', {style: 'position: relative; top: 30%; text-align: center;', onclick: () => ctrl.flipCard()}, [
          m('h2',
            ctrl.showFront ? {} : {style: 'font-style: italic'},
            ctrl.cardPrimaryText()),
          m('h6',
            ctrl.cardSecondaryText()),
        ]));
    };
    return m('div', {'class': 'mdl-layout mdl-js-layout mdl-layout--fixed-header', style: 'height: 100vh;'}, [
      m('header', {'class': 'mdl-layout__header'}, [
        m('div', {'class': 'mdl-layout__header-row'}, [
          m(BackBtn, () => { m.route('/deck/' + ctrl.deckKey); }),
          m(HeaderTitle, ctrl.stackName + ': ' + ctrl.deckName),
          m('div', {'class': 'mdl-layout-spacer'}),
          m('nav', {'class': 'mdl-navigation'}, [
            m('button', {'class': 'mdl-button mdl-js-button mdl-button--icon', onclick: () => ctrl.showFrontDefault = !ctrl.showFrontDefault},
              m('i', {'class': 'material-icons'}, ctrl.showFrontDefault ? 'flip_to_front' : 'flip_to_back')),
            m('a', {'class': 'mdl-navigation__link', onclick: () => ctrl.nextBatch()},
              ['Batch (' + ctrl.formatBatchIndex() + ')',
              m('i', {'class': 'material-icons'}, 'arrow_forward')]),
            m('a', {'class': 'mdl-navigation__link', onclick: () => ctrl.nextCard()},
              ['Card (' + ctrl.formatCardIndex() + ')',
              m('i', {'class': 'material-icons'}, 'arrow_forward')]),
          ])
        ])
      ]),
      m('main', {'class': 'mdl-layout__content', style: 'height: 100%'}, cardView())
    ]);
  }
};
