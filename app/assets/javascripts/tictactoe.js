var winningCombos = [[[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]], [[0,0],[1,1],[2,2]], [[0,0],[0,1],[0,2]], [[2,0],[2,1],[2,2]], [[1,0],[1,1],[1,2]], [[2,0],[1,1],[0,2]]];

var turn = 0;
var currentGame;


$(function() {
  attachListeners();
})

var attachListeners = function() {
  $("tbody").click(function(event) {
    doTurn(event);
  });
  $("#games").click(function(event) {
    var state = parseState(event)
    swapGame(state, getGameId(event))
  })
  $("#save").click(function() {
    save();
  })
  $("#previous").click(function() {
    getAllGames();
  })
}

var player = function() {
return ( ( turn % 2 == 0 ) ? 'X' : 'O' );
}

var message = function(message) {
  $("#message").text(message);
}

function resetGame() {
  $('td').html("");
  turn = 0;
  currentGame = 0;
}

function updateState(event) {
  $(event.target).text(player());
}

function checkWinner() {
  for(var i = 0; i < winningCombos.length; i++) {
    if(checkCells(winningCombos[i]) == true) {
      message("Player " + player() + " Won!");
      return true;
    }
  }
  return false;
}

var tie = function() {
  var isTie = true;
  $('td').each(function() {
    if ($(this).text().length <= 0) {
      isTie = false;
    }
  });

  if (isTie == true) {
    message("Tie game");
    return isTie;
  }
}

var save = function(resetCurrentGame) {
  var url, method;
  if(currentGame) {
    url = "/games/" + currentGame
    method = "PATCH"
  } else {
    url = "/games"
    method = "POST"
  }

  $.ajax({
    url: url,
    method: method,
    dataType: "json",
    data: {
      game: {
        state: getMarks()
      }
    },
    success: function(data) {
      if(resetCurrentGame) {
        currentGame = undefined;
      } else {
        currentGame = data.game.id;
      }
    }
  })
}

var showGame = function(game) {
  return $('<li>', {'data-state': game.state, 'data-gameid': game.id, text: game.id});
}

var swapGame = function(state, id) {
  placeMarks(state);
  currentGame = id;
  turn = findTurn(state);
}

var findTurn = function(state) {
  var turn = 0;
  state.forEach(function(item) {
    if(item != "") {
      turn += 1;
    }
  })
  return turn;
}

var parseState = function(event) {
  return $(event.target).data("state").split(",")
}
var getGameId = function(event) {
  return $(event.target).data("gameid")
}

var getAllGames = function() {
  $.getJSON("/games").done(function(response) {
    showGames(response.games)
  })
}

var showGames = function(games) {
  var dom = $()
  games.forEach(function(game) {
    dom = dom.add(showGame(game));
  })
  $("#games").html(dom);
}

var placeMarks = function(marks) {
  $("td").each(function(i) {
    $(this).text(marks[i]);
  })
}

var getMarks = function() {
  var marks = []
  $("td").each(function(i) {
    marks.push($(this).text())
  })
  return marks;
}

function doTurn(event) {
  updateState(event);
  if(checkWinner() || tie() ) {
    save(true);
    resetGame();
  } else {
    turn += 1;
  }
}

var parseState = function(event) {
  return $(event.target).data("state").split(",")
}
var getGameId = function(event) {
  return $(event.target).data("gameid")
}

function checkCells(cells) {
  for (var i = 0; i < cells.length; i++) {
    var winningCombo = cells[i];
    var x = winningCombo[0];
    var y = winningCombo[1];
    var selector = $('[data-x="' + x + '"][data-y="' + y + '"]')
    if(noCellMatch(selector)) {
      return false;
    }
  }
  return true;
}

var noCellMatch = function(element) {
  return (element.html() != player())
}
