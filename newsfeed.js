"use strict";

(function () {
  const Keycode = {
    ENTER: 13,
    ESC: 27,
    SPACE: 32,
  };

  const STYLE_URL = '/nf/newsfeed.css';

  const NEWS = [
    {
      'title': 'Новость №1',
      'author': 'Кекс',
      'date': '2021-01-01T08:00',
      'link': '/',
      'isRead': true,
    },
    {
      'title': 'Новость №2',
      'author': 'Шамаханская Царица',
      'date': '2021-03-08T10:30',
      'link': '/',
      'isRead': false,
    },
    {
      'title': 'Новость №3',
      'author': 'Имя Пользователя',
      'date': '2021-04-01T13:45',
      'link': '/',
      'isRead': false,
    },
    {
      'title': 'Новость №4',
      'author': 'ФИО',
      'date': '2021-04-03T18:00',
      'link': '/',
      'isRead': false,
    },
  ];

  const ICON_CODE = `
    <div class="newsfeed__icon" tabindex="0">
      <p class="newsfeed__messages"></p>
    </div>
    `;

  const NEWS_BLOCK_CODE = `
    <h3 class="news-block__title"></h3>
    <p class="news-block__author"></p>
    <time class="news-block__date" datetime=""></time>
    <a href="" class="news-block__link">Подробнее</a>
    <p class="news-block__status"></p>
  `;

  let headBlock = document.querySelector('head');
  let styleLink = document.createElement('link');
  styleLink.setAttribute('rel', 'stylesheet');
  styleLink.setAttribute('href', STYLE_URL);
  headBlock.append(styleLink);


  window.addEventListener('load', function () {
    if (NEWS.length > 0) {
      let bodyBlock = document.querySelector('body');
      let newsNumber = NEWS.length;
      let fragment = document.createDocumentFragment();
      let forwardBtn;
      let backBtn;

      let newsfeedBlock = document.createElement('div');
      fragment.append(newsfeedBlock);
      newsfeedBlock.classList.add('newsfeed');
      newsfeedBlock.innerHTML = ICON_CODE;

      let iconBlock = newsfeedBlock.querySelector('.newsfeed__icon');
      let iconMessages = iconBlock.querySelector('.newsfeed__messages');
      iconMessages.textContent = '' + newsNumber;


      let feedBlock = document.createElement('div');
      newsfeedBlock.append(feedBlock);
      feedBlock.classList.add('newsfeed__feed-block');
      feedBlock.classList.add('nf--hidden');
      bodyBlock.append(fragment);

      let newsFragment = document.createDocumentFragment();
      for (let i = NEWS.length - 1; i >= 0; i--) {
        let newsBlock = document.createElement('div');
        newsBlock.classList.add('feed-block__item', 'news-block');
        newsBlock.innerHTML = NEWS_BLOCK_CODE;
        let newsBlockTitle = newsBlock.querySelector('.news-block__title');
        let newsBlockAuthor = newsBlock.querySelector('.news-block__author');
        let newsBlockDate = newsBlock.querySelector('.news-block__date');
        let newsBlockLink = newsBlock.querySelector('.news-block__link');
        let newsBlockStatus = newsBlock.querySelector('.news-block__status');

        let item = NEWS[i];
        newsBlockTitle.textContent = item.title;
        newsBlockAuthor.textContent = item.author;
        newsBlockDate.setAttribute('datetime', item.date);
        let date = new Date(item.date);
        newsBlockDate.textContent = date.toLocaleString('ru', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        });
        newsBlockLink.setAttribute('href', item.link);
        newsBlockStatus.textContent = item.isRead ? 'Прочитано' : 'Не прочитано';
        if (!item.isRead) {
          newsBlock.classList.add('nf--unread');

          let onNewsBlockMouseenter = function () {
            newsBlock.classList.remove('nf--unread');
            newsBlockStatus.textContent = 'Прочитано';
            newsBlock.removeEventListener('mouseenter', onNewsBlockMouseenter);
          };

          newsBlock.addEventListener('mouseenter', onNewsBlockMouseenter);
        }
        newsFragment.append(newsBlock);
      };


      let hideFeed = function () {
        newsfeedBlock.classList.remove('newsfeed--opened');
        feedBlock.classList.add('nf--hidden');
        iconBlock.classList.remove('nf--hidden');
        document.removeEventListener('keydown', onDocumentKeydown);
        iconBlock.addEventListener('keydown', onIconBlockKeydown);
        if (forwardBtn) {
          forwardBtn.classList.add('nf--hidden');
        }
        if (backBtn) {
          backBtn.classList.add('nf--hidden');
        }
      };

      let newsBlockHeight;
      let startCoord;
      let forwardScrollLimit;
      let backScrollLimit;
      let scrollNews = function (direction) {
        if (feedBlock.style.transform.includes('translateY')) {
          let index = feedBlock.style.transform.indexOf('translateY');
          startCoord = parseInt(feedBlock.style.transform.slice(index + 11));
        } else {
          startCoord = 0;
        }
        let shift;
        let translateValue;
        let currentScrollLimit;
        if (direction === 'forward') {
          translateValue = startCoord - newsBlockHeight;
          currentScrollLimit = forwardScrollLimit;
          shift = -newsBlockHeight;
        } else if (direction === 'back') {
          translateValue = startCoord + newsBlockHeight;
          currentScrollLimit = backScrollLimit;
          shift = newsBlockHeight;
        }
        if (currentScrollLimit > 0) {
          feedBlock.style.transform = `translateY(${translateValue}px)`;
          backScrollLimit -= shift;
          forwardScrollLimit += shift;

          if (backScrollLimit <= 0) {
            backBtn.classList.add('nf--hidden');
          }
          if (forwardScrollLimit <= 0) {
            forwardBtn.classList.add('nf--hidden');
          }
        }
      };

      let onForwardBtnPress = function () {
        scrollNews('forward');

        if (!backBtn) {
          backBtn = document.createElement('button');
          backBtn.setAttribute('type', 'button');
          backBtn.classList.add('newsfeed__btn', 'newsfeed__btn--back');
          let span = document.createElement('span');
          span.innerText = 'Назад';
          span.classList.add('visually-hidden');
          backBtn.append(span);
          newsfeedBlock.append(backBtn);
          backBtn.addEventListener('click', onBackBtnPress);
        } else if (backBtn.classList.contains('nf--hidden')) {
          backBtn.classList.remove('nf--hidden');
        }
      };

      let onBackBtnPress = function () {
        scrollNews('back');

        if (forwardBtn.classList.contains('nf--hidden')) {
          forwardBtn.classList.remove('nf--hidden');
        }
      }

      let showFeed = function () {
        newsfeedBlock.classList.add('newsfeed--opened');
        feedBlock.classList.remove('nf--hidden');
        iconBlock.classList.add('nf--hidden');
        document.addEventListener('keydown', onDocumentKeydown);
        iconBlock.removeEventListener('keydown', onIconBlockKeydown);
        feedBlock.append(newsFragment);

        newsBlockHeight = feedBlock.querySelector('.news-block').clientHeight;


        if (feedBlock.clientHeight > newsfeedBlock.clientHeight) {
          if (!forwardScrollLimit) {
            forwardScrollLimit = feedBlock.clientHeight - newsfeedBlock.clientHeight;
            backScrollLimit = 0;
            if (!forwardBtn) {
              forwardBtn = document.createElement('button');
              forwardBtn.setAttribute('type', 'button');
              forwardBtn.classList.add('newsfeed__btn', 'newsfeed__btn--forward');
              let span = document.createElement('span');
              span.innerText = 'Вперёд';
              span.classList.add('visually-hidden');
              forwardBtn.append(span);
              newsfeedBlock.append(forwardBtn);
              forwardBtn.addEventListener('click', onForwardBtnPress);
            }
          } else {
            if (forwardScrollLimit > 0) {
              forwardBtn.classList.remove('nf--hidden');
            }
            if (backScrollLimit > 0) {
              backBtn.classList.remove('nf--hidden');
            }
          }
        }
      };

      let onDocumentKeydown = function (evt) {
        if (evt.keyCode === Keycode.ESC) {
          hideFeed();
        }
      };

      let onIconBlockKeydown = function (evt) {
        if (evt.keyCode === Keycode.ENTER || evt.keyCode === Keycode.SPACE) {
          showFeed();
        }
      }


      iconBlock.addEventListener('click', showFeed);
      iconBlock.addEventListener('keydown', onIconBlockKeydown);

    }
  });
})();
