/* Created July 16th 2012 by Vlad Yazhbin.  Twitter: [@vla](http://twitter.com/vla)

Slider is a sample game for GameThrone.js, my new HTML5 & Javascript game engine.
Visit [vlad.github.com/gamethrone](http://vlad.github.com/gamethrone) to play Slider or get more examples.

See the README in the GitHub repository for reasons why I made certain coding, algorithm, and UI decisions.
 [github.com/vlad/sliding-puzzle-game](http://github.com/vlad/sliding-puzzle-game)
# Description

**Slider** is a sliding puzzle game where n tiles are laid out on a board x tiles wide and y tiles tall, where n is x * y - 1.
Tiles are numbered from 1 to n, so one possible arrangement is that of increasing order from the top-left to
the bottom-right, leaving the last square on the board empty.  This is the final state.
The player starts with a random arrangement of tiles and must slide tiles around the grid to reach the final state.

# Implementation

 */
function main() {
  // var slider is a Game object and contains objects named board = Board(...), input = GameInput(...), and view = GameHTML5View(...),
// as well as init(...) and newRandomGame(...) functions.
  var slider = new Game({
    // First, board is a new Board object with the following functions:
    board: new Board({
      // board.isTerminal() checks if the current state matches the winning state by simply comparing two corresponding arrays;
      isTerminal: function() {
        return this.squares.join() == this.getWinState().join();
      },
      // board.randomize() repeatedly moves the blank square around the board anywhere except where it just came from;
      randomize: function() {
        var blank = {}, blankIndex = this.squares.indexOf(0)
          , last  = { left: -1, top: -1 }, neighbors, randomNeighbor
          , shuffles = 10 * this.height * this.width
        ;
        if (blankIndex != -1) {
          blank.top = Math.floor(blankIndex / this.height);
          blank.left = blankIndex - blank.top * this.width;

          // We must get a list of neighboring tiles at the blank tile's current location,
          // removing the location of the neighbor it swapped with last.
          for (var i = 0; i < shuffles; i++) {
            neighbors = this.getNeighbors(blank.left, blank.top, { visitDiagonals: false }).filter(function(neighbor) {
              return !(neighbor.left === last.left && neighbor.top === last.top);
            });

            // Then, the blank spot randomly swaps places with one of these neighbors.
            if (neighbors.length > 0) {
              randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
              this.swap(blank.left, blank.top, randomNeighbor.left, randomNeighbor.top);
              last = blank;
              blank = randomNeighbor;
            }
          }
        } else {
          throw Error('Cannot randomize: no empty square');
        }
      },
      // board.reset(...) defines the width and height of the board and sets the initial state to the final state,
      reset: function(width, height) {
        this.height = height;
        this.width = width;
        this.squares = this.getWinState().slice(0);
      },
      // and board.getWinState() returns the final state.
      getWinState: (function() {
        var lastBoardSize, cache;
        return function() {
          // The final state returns a cached result, which is re-calculated only if the board dimensions change.
          // Caching is easy and good because isTerminal() calls this function every time a player slides a tile.
          if (typeof(lastBoardSize) == 'undefined' || this.width * this.height !== lastBoardSize) {
            console.log("Calculating new won state...");
            lastBoardSize = this.width * this.height;
            return cache = new Array(lastBoardSize + 1).join('0').split('').map(function(e, i, a){
              return i < a.length - 1 ? i + 1 : 0
            });
          } else {
            console.log("Using the cached won state...");
            return cache;
          }
        };
      })()
    }),
    // The second object, slider.input = GameInput(...),
    input: new GameInput({
      // has an init() function to give us a chance to store a pointer to the Game object.
      init: function(game) {
        this.game = game;
      },
      // We only need input.onSquareClick(...) because we don't support any other interaction from the player except
      // clicking on a square, for now.
      onSquareClick: function(left, top) {
        var board = this.game.board, view = this.game.view;
        var blank = board.getNeighbors(left, top, { visitDiagonals: false }).filter(function(neighbor) {
          return board.get(neighbor.left, neighbor.top) === 0;
        })[0];
        // If we click any square that has a blank as one of its neighbors,
        if (blank) {
          // we swap the two squares and check if we've reached the final state.
          board.swap(left, top, blank.left, blank.top);
          view.renderSquare(left, top);
          view.renderSquare(blank.left, blank.top);
          if (board.isTerminal()) {
            alert("YOU WON!");
          }
        }
      }
    }),
    // Finally, slider.view = GameHTML5View(...) has methods to draw on a canvas.  Like board and input, view also defines
    //additional functions:
    view: new GameHTML5View({
      // view.calculateSquareSize() enables users to play larger puzzles with smaller-sized squares.
      calculateSquareSize: function() {
        var height = this.canvas.height - 1, width = this.canvas.width - 1;
        this.squareSize = Math.min(Math.floor(width/this.game.board.width), Math.floor(height/this.game.board.height));
      },
      // view.init(...) initializes the canvas and sets up listeners for events that might come from other html
      // elements on the web page, such as button clicks.
      init: function(game, canvasId, events) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.game = game;

        this.attachHTML5Events(events);
      },
      // view.render() draws the game board;
      render: function() {
        var board = this.game.board;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (var top = 0; top < board.height; top++) {
          for (var left = 0; left < board.width; left++) {
            this.renderSquare(left, top);
          }
        }
      },
      // view.renderSquare(...) performs the actual drawing of a square.
      renderSquare: function(left, top) {
        var board    = this.game.board
          , ss       = this.squareSize
          , fontSize = Math.floor(ss / 2.5)
          , value    = board.get(left, top)
        ;
        if (value === 0) {
          this.ctx.clearRect(left * (ss + 1), top * (ss + 1), ss, ss);
        }
        else {
          this.ctx.fillStyle = "#E00078";
          this.ctx.fillRect(left * (ss + 1), top * (ss + 1), ss, ss);
          this.ctx.fillStyle = "#FFD6F5";
          this.ctx.font = fontSize + 'px Arial';
          this.ctx.fillText(value, left * (ss + 1) + (ss - fontSize) / 2 + (value < 10 ? fontSize / 5 : 0),
                                   top  * (ss + 1) + (ss + fontSize) / 2 - 3);
        }
      }
    }),
    //slider.init(...) calls one-time init() routines for its GameHTML5View and GameInput objects, but not for Board,
    // which doesn't have any one-time-only initializations to do.
    init: function(id, externalEvents) {
      this.view.init(this, id, externalEvents);
      this.input.init(this);
    },
    //slider.newRandomGame(...) resets and randomizes the board and redraws the view!
    newRandomGame: function(width, height) {
      this.board.reset(width, height);
      this.board.randomize();
      this.view.calculateSquareSize();
      this.view.render();
    }
  });
  //Now that we created slider as our instance of Game(...), we want to call init(...).  We pass the id of our canvas
  //element, and the functions we want to use to handle interactions on our web page, such as canvas or button clicks.
  slider.init('slider', {
    click: {
      // When the user clicks the canvas element (id: 'canvas'),
      slider: function () {
        var left = Math.floor(event.offsetX / (slider.view.squareSize + 1));
        var top = Math.floor(event.offsetY / (slider.view.squareSize + 1));
        //we automatically trigger input.onSquareClick(...)
        if (slider.board.inbounds(left, top)) {
          slider.input.onSquareClick(left, top);
        }
      },
      // When the user clicks a quick game button (id: 'slider3x3' and similar), we launch a game of that size.
      slider3x3: function() { slider.newRandomGame(3, 3) },
      slider4x4: function() { slider.newRandomGame(4, 4) },
      slider5x5: function() { slider.newRandomGame(5, 5) },
      // Clicking the custom game button creates a new game of user-specified size.
      sliderCustomNew: function() {
        var height = document.getElementById('sliderCustomHeight').value
          ,  width = document.getElementById('sliderCustomWidth').value
        ;
        slider.newRandomGame(width, height);
      }
    }
  });
  // We start a new random game before we leave the main function.
  slider.newRandomGame(3, 3);
}

/*

# GameThrone.js

**Game Throne** is a new game engine for board games written in Javascript by Vlad Yazhbin.  Two games are included:
Slider puzzle and Minesweeper, both of which render the game on an HTML5 canvas element.*/

// The **Factory** returns a new object of a given prototype with additional methods on it.
var Factory = function(prototypeObject, methods) {
  for (name in methods) {
    methods[name] = {value: methods[name]};
  }
  return Object.create(prototypeObject, methods);
};

var Board = (function() {
  this.squares = [];
  this.height = 0;
  this.width = 0;

  return function(methods) { return Factory(Board.prototype, methods) };
})();

//**Board** comes with many built-in functions:
Board.prototype = {
  //forEachNeighbor(...) allows users to get neighboring squares in a functional way.
  forEachNeighbor: (function() {
    var neighborOffsets =         [[0, -1], [1, 0], [ 0, 1], [-1,  0]]
      , diagonalNeighborOffsets = [[1, -1], [1, 1], [-1, 1], [-1, -1]]
    ;
    return function(left, top, func, conditions) {
      conditions = conditions || {};
      conditions.visitDiagonals = conditions.visitDiagonals === 'undefined' ? true : conditions.visitDiagonals;

      var testEachNeighbor = function(offset, index, array) {
        if (this.inbounds(left + offset[0], top + offset[1])) {
          func.call(this, left + offset[0], top + offset[1]);
        }
      };

      // Neighbors to the top, right, bottom and left are checked automatically, but diagonal neighbors can be
      // checked as well if {visitDiagonals: true} is passed as a condition.  This is useful in a game like Minesweeper.
      neighborOffsets.forEach(testEachNeighbor, this);
      if (conditions.visitDiagonals) {
        diagonalNeighborOffsets.forEach(testEachNeighbor, this);
      }
    }
  })(),
  //get(...) returns the value of a given square,
  get: function(left, top) {
    if (this.inbounds(left, top)) {
      return this.squares[left + top * this.width];
    } else {
      throw new Error('Cannot return a value at position (' + left + ', ' + top + ') because it is out of bounds');
    }
  },
  //getNeighbors(...) loops through each neighbor and returns the list.
  getNeighbors: function(left, top, conditions) {
    var neighbors = [];
    this.forEachNeighbor(left, top, function(l, t) {
        neighbors.push({left: l, top: t});
    }, conditions);
    return neighbors;
  },
  //grid() prints out the board in text form.
  grid: function() {
    var s = '';
    for (var i = 0; i < this.height; i++) {
      s += this.squares.slice(i * this.width, i * this.width + this.width).join(',') + '\n';
    }
    return s;
  },
  //inbounds(...) returns the validity of square locations.
  inbounds: function(left, top) {
    return top >= 0 && left < this.width && top < this.height && left >= 0;
  },
  //set(...) sets the value of a square at a given location,
  set: function(left, top, value) {
    if (this.inbounds(left, top)) {
      this.squares[left + top * this.width] = value;
    }
  },
  //and swap(...) swaps any two locations with each other.
  swap: function(left, top, left2, top2) {
    var temp = this.get(left, top);
    this.set(left, top, this.get(left2, top2));
    this.set(left2, top2, temp);
  }
};

var Game = function(methods) {
  return Factory(Object, methods);
};

var GameHTML5View = (function() {
  var canvas, ctx, game, squareSize;

  return function(methods) { return Factory(GameHTML5View.prototype, methods) };
})();

// **GameHTML5View** includes the following functions:
GameHTML5View.prototype = {
  // attachHTML5Events(...) adds one or more event listeners in the form of { event_type: {  html_id:  handler(), ... }, ... },
  // such as { click: {'slider': function(...) ...}, ... }
  attachHTML5Events: function(events) {
    for (var type in events) {
      for (var domId in events[type]) {
        this.onHTML5Event(domId, type, events[type][domId]);
      }
    }
  },
  // onHTML5Event(...) sets up each individual listener in the DOM.
  onHTML5Event: function(id, type, func) {
    document.getElementById(id).addEventListener(type, func);
  }
};

var GameInput = (function() {
  var game;

  return function(methods) { return Factory(Object, methods) };
})();
