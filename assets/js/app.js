/*! Chiba Mine v0.2.0 */
(function () {
  var boardW = 20;
  var boardH = 20;
  var setBomb = 70;
  var cell = [];
  var opened;
  var playing;
  var startTime;
  var resultTime;
  var board = document.getElementById('board');
  var reset = document.getElementById('reset');
  var resultMenu = document.getElementById('result');

  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', function () {
      init();
    }, false);
  } else {
    window.onload = function () {
      init()
    };
  }

  function init() {
    var tr;
    var td;
    opened = 0;
    playing = true;
    board.className = '';
    reset.style.display = 'none';
    resultMenu.style.display = 'none';

    while (board.firstChild) {
      board.removeChild(board.firstChild);
    }

    for (var i = 0; i < boardH; i++) {
      tr = document.createElement('tr');
      cell[i] = [];
      for (var j = 0; j < boardW; j++) {
        td = document.createElement('td');
        td.y = i;
        td.x = j;
        td.bomb = false;
        td.flag = false;
        cell[i][j] = td;

        if (document.addEventListener) {
          td.addEventListener('click', click);
          td.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            flag(e);
          }, false);

          window.onload = function () {
            var touchTimer;

            function touchClear() {
              clearTimeout(touchTimer);
            }

            document.addEventListener('touchstart', function (e) {
              touchTimer = setTimeout(function () {
                flag(e);
                e.preventDefault();
              }, 600);
            }, false);
            document.addEventListener('touchmove', touchClear, false);
            document.addEventListener('touchebd', touchClear, false);
            document.addEventListener("touchcancel", touchClear, false);
          }

        } else {
          td.attachEvent('onclick', click);
          td.attachEvent('oncontextmenu', function (e) {
            e.returnValue = false;
            flag(e);
          });
        }

        tr.appendChild(td);
      }
      board.appendChild(tr);
    }

    initBomb();
    initResult();
  }

  function initBomb() {
    for (var i = 0; i < setBomb; i++) {
      while (true) {
        var x = Math.floor(Math.random() * boardW);
        var y = Math.floor(Math.random() * boardH);
        if (!cell[x][y].bomb) {
          cell[x][y].bomb = true;
          break;
        }
      }
    }
  }

  function click(e) {
    var bombImg = '<img src="assets/images/chiba_bomb.png" alt="Chiba Bomb" width="22" height="22">';
    var src;
    if (opened === 0) {
      startTime = new Date().getTime();
    }

    if (e.srcElement) {
      src = e.srcElement;
    } else {
      src = e.target;
    }
    if (!src.opened && !src.flag && playing) {
      if (src.bomb) {
        for (var i = 0; i < boardH; i++) {
          for (var j = 0; j < boardW; j++) {
            var c = cell[j][i];
            if (c.bomb) {
              c.className = '';
              c.innerHTML = bombImg;
            }
          }
        }
        gameOver();
      } else {
        open(src.x, src.y);
      }
    }
  }

  function open(x, y) {
    for (var j = y - 1; j <= y + 1; j++) {
      for (var i = x - 1; i <= x + 1; i++) {
        if (cell[j] && cell[j][i]) {
          var c = cell[j][i];
          var tipsNum = count(i, j);
          if (c.opened || c.bomb || c.flag) {
            continue;
          }
          flip(c);
          if (tipsNum === 0) {
            open(i, j);
          } else {
            c.innerHTML = tipsNum;
          }
        }
      }
    }
  }

  function count(x, y) {
    var hintNum = 0;
    for (var j = y - 1; j <= y + 1; j++) {
      for (var i = x - 1; i <= x + 1; i++) {
        if (cell[j] && cell[j][i]) {
          if (cell[j][i].bomb)
            hintNum++;
        }
      }
    }
    return hintNum;
  }

  function flip(c) {
    c.className = 'open';
    c.opened = true;
    if (++opened >= (boardW * boardH - setBomb)) {
      gameClear();
      gameOver();
    }
  }

  function flag(e) {
    var src;
    if (e.srcElement) {
      src = e.srcElement;
    } else {
      src = e.target;
    }
    if (!src.opened && playing) {
      toggleFlag(src.x, src.y);
    }
  }

  function toggleFlag(x, y) {
    for (var j = y; j <= y; j++) {
      for (var i = x; i <= x; i++) {
        if (cell[j] && cell[j][i]) {
          var c = cell[j][i];
          if (c.flag) {
            c.flag = false;
            c.className = '';
          } else {
            c.flag = true;
            c.className = 'fa fa-check';
            c.style.display = 'table-cell';
          }
        }
      }
    }
  }

  function gameOver() {
    playing = false;
    board.className = 'game_over';
    reset.style.display = 'block';
    reset.onclick = function () {
      init();
    };
  }

  function gameClear() {
    var finishTime = new Date().getTime();
    resultTime = (finishTime - startTime) / 1000;
    resultMenu.style.display = 'block';
    document.getElementById('result_time').innerHTML = formatTime(resultTime);
    document.getElementById('reset_play').onclick = function () {
      init();
      return false;
    };
    document.getElementById('tweet').onclick = function () {
      tweetPopup();
      return false;
    };
  }

  function tweetPopup() {
    var url = "https://twitter.com/share?";
    url += "text=" + encodeURI(formatTime(resultTime) + "でクリア！ Chiba Mine 地雷女を避けろ！");
    url += "&via=rechiba3";
    url += "&url=" + encodeURI("http://chibagame.rechiba3.net/chibamine/");
    url += "&hashtags=" + encodeURI("てぃばゲー");

    var popW = 550;
    var popH = 420;
    var x = (screen.width - popW) / 2;
    var y = (screen.height - popH) / 2;
    var size = 'width=' + popW;
    size += ',height=' + popH;
    size += ',top=' + y;
    size += ',left=' + x;

    window.open(url, "tweetwin", size);
  }

  function initResult() {
    var message;
    message = '<h1>ゲームクリア！</h1>\n<p><span id="result_time"></span>かけて地雷女から逃げ切りました！</p>\n<ul>\n<li><a id="tweet" href="#"><i class="fa fa-twitter"></i> 結果をつぶやく</a></li>\n<li><a id="reset_play" href="#">もう一度プレイ</a></li>\n</ul>';
    resultMenu.innerHTML = message;

    var w = Math.floor((board.offsetWidth - 340) / 2);
    var h = Math.floor((board.offsetHeight - 174) / 2);
    resultMenu.style.left = w + 'px';
    resultMenu.style.top = h + 'px';
  }

  function formatTime(time) {
    var result = '';
    var hour = Math.floor(time / 3600);
    var minute = Math.floor(time % 3600 / 60);
    var second = Math.floor(time % 60);
    if (hour) result += hour + '時間';
    if (minute) result += minute + '分';
    if (second >= 0) result += second + '秒';
    return result;
  }

})();
