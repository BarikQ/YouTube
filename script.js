/* eslint-disable no-use-before-define */
/* eslint-disable prefer-const */
const KEY = 'AIzaSyCinOcle4xOrJxmmOqE3y1vK2y8EJlIFjA';
const KEY2 = 'AIzaSyBe-leRTzB6Xygs7BA-azH_DB1UfBhXwZI';
let prevVal;
let prevPos = 0;
let uploadedVideo = 0;
let videosList = [];
let videoCount = 0;
if (window.innerWidth > 1300) {
  videoCount = 4;
} else if (window.innerWidth > 500) {
  videoCount = 2;
} else videoCount = 1;

function keywordCheck() {
  const KEYWORD = document.querySelector('#searchTxt').value;
  if (KEYWORD === prevVal) return 0;
  if (typeof prevVal !== 'undefined') {
    document.querySelector('#slider').innerHTML = '';
  }
  prevVal = KEYWORD;
  uploadedVideo = 0;
  if (window.innerWidth > 1300) {
    videoCount = 4;
  } else if (window.innerWidth > 500) {
    videoCount = 2;
  } else videoCount = 1;
  document.querySelector('#slider').style.setProperty('--num', videoCount);
  document.querySelector('#slider').style.setProperty('--index', 0);
  return 1;
}

function createURL(param) {
  const KEYWORD = document.querySelector('#searchTxt').value;
  let URL;
  switch (param) {
    case 'search': {
      URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${uploadedVideo +
        15}&q=${KEYWORD}&key=${KEY2}`;
      break;
    }

    case 'stat': {
      const idList = [];
      for (let i = uploadedVideo; i < uploadedVideo + 15; i += 1) {
        idList[i] = videosList[i].id;
      }
      const idString = idList.join(',');
      URL = `https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${idString}&key=${KEY2}`;
      break;
    }

    default:
      break;
  }
  return URL;
}

function requestLoad(param) {
  const URL = createURL(param);
  return fetch(URL);
}

function slideTool() {
  const slider = document.querySelector('#slider');
  let isDown = false;
  let startX;
  let scrollLeft;
  let dx;
  let position = parseInt(slider.style.getPropertyValue('--index'), 10);

  function stop() {
    let label = document.querySelectorAll('.label');
    label[position].style.color = null;
    position = parseInt(slider.style.getPropertyValue('--index'), 10);
    isDown = false;
    dx = slider.style.left;
    dx = dx.match(/-?\d+/g);
    if (dx > 10 && position !== 0) changeSlide(position - 1);
    else if (dx < -10 && position !== 7) changeSlide(position + 1);
    slider.style.left = 0;
  }

  function unify(e) {
    return e.changedTouches ? e.changedTouches[0] : e;
  }

  function move(e) {
    if (!isDown) return;
    e.preventDefault();
    const x = unify(e).clientX;
    const walk = x - startX;
    slider.scrollLeft = scrollLeft - walk;
    slider.style.left = `${walk}px`;
  }

  function lock(e) {
    position = parseInt(slider.style.getPropertyValue('--index'), 10);
    let label = document.querySelectorAll('.label');
    label[position].style.color = 'black';
    isDown = true;
    startX = unify(e).clientX;
  }

  window.addEventListener('mousedown', lock, false);
  window.addEventListener('mousemove', move, false);
  window.addEventListener('mouseup', stop, false);

  slider.addEventListener('touchstart', lock, false);
  slider.addEventListener('touchmove', move, { passive: false });
  slider.addEventListener('touchend', stop, false);
  return 0;
}

function changeSlide(position) {
  const slider = document.querySelector('#slider');
  let label = document.querySelectorAll('.label');
  if (prevPos !== position) {
    label[prevPos].style.background = null;
    label[position].style.background = 'red';
  }
  prevPos = position;
  slider.style.setProperty('--index', position);
  if (!label[position + 1]) search();
  return 0;
}

function createSwitch(length) {
  let slider = document.querySelector('#slider');
  if (document.querySelector('#navButtons')) document.querySelector('#navButtons').remove();
  let navBar = '<section class="navButtons" id="navButtons">';
  for (let i = 0; i < length; i += 1) {
    navBar += `<input type="radio" id="card-${i}">`;
  }
  navBar += '<div class="controls" id="controls">';
  for (let i = 0; i < length; i += 1) {
    navBar += `<label for="card-${i}" class="label" id="label-${i}" onclick="changeSlide(${i})">${i +
      1}</label>`;
  }
  navBar += '</div></section>';
  slider.insertAdjacentHTML('afterend', navBar);
  let label = document.querySelectorAll('.label');
  label[0].style.background = 'red';
  return 0;
}

function createSlider() {
  let slider = document.querySelector('#slider');
  const Num = slider.children.length;
  slider.style.setProperty('--num', Num);
  createSwitch(Num);
  return 0;
}

function draw(list) {
  let slider = document.querySelector('#slider');
  let card = '';
  list.forEach((elem, index) => {
    if (index % videoCount === 0) {
      card += '<div class = "slide">';
    }
    card += `<div class="videoCard" id="videoCard">
        <a href="https://www.youtube.com/watch?v=${elem.id}" target="_blank">
            <h3>${elem.title}</h3>
            <img src="${elem.img}" alt='video preview'>
        </a>
        <ul>
            <li><span>Channel Name:</span> ${elem.author}</li>
            <li><span>Publication Date:</span> ${elem.date.replace(/T.+/g, '')}</li>
            <li><span>Views:</span> ${elem.views}</li>
        </ul>
        <p class="videoDescription">${elem.description}</p>
    </div>`;
    if ((index + 1) % videoCount === 0) {
      card += '</div>';
    }
  });
  slider.innerHTML = card;
  createSlider();
}

function requestExecution() {
  if (keywordCheck() === 0) return 0;

  requestLoad('search')
    .then(res => res.json())
    .then(data => {
      for (let i = uploadedVideo; i < uploadedVideo + 15; i += 1) {
        const video = {};
        video.title = data.items[i].snippet.title;
        video.author = data.items[i].snippet.channelTitle;
        video.description = data.items[i].snippet.description;
        video.img = data.items[i].snippet.thumbnails.medium.url;
        video.date = data.items[i].snippet.publishedAt;
        video.id = data.items[i].id.videoId;
        videosList[i] = video;
      }
      return videosList;
    })
    .then(() => {
      requestLoad('stat')
        .then(res => res.json())
        .then(data => {
          for (let i = uploadedVideo; i < uploadedVideo + 15; i += 1) {
            videosList[i].views = data.items[i - uploadedVideo].statistics.viewCount;
          }
          uploadedVideo += 15;
          draw(videosList);
          return videosList;
        });
    });
  return 1;
}

function search() {
  requestExecution();
  slideTool();
}

window.onload = function drawPage() {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `${'<section id="search" class="search">\n' +
      '<div class="search_content">\n' +
      '<input type="text" class="search_bar" id="searchTxt" placeholder="What do you want to find?">\n' +
      '<button type="submit" onsubmit="search()" id="submit_btn" class="submit_btn">Find It!</button>\n' +
      '</div>\n' +
      '</section>\n' +
      '<div class="check"></div>\n' +
      '<section class="slider" id="slider"></section>\n'}`
  );
  document.querySelector('#submit_btn').addEventListener('click', search);
  document.querySelector('#searchTxt').addEventListener('keypress', event => {
    if (event.code === 'Enter') {
      search();
    }
  });
};
