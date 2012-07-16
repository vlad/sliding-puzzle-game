Created July 16th 2012 by Vlad Yazhbin.  Twitter: [@vla](http://twitter.com/vla)

**Slider** is a simple game for GameThrone.js, my new HTML5 & Javascript game engine.

Description
===========

**Slider** is a sliding puzzle game where n tiles are laid out on a board x tiles wide and y tiles tall, where n is x * y - 1.
Tiles are numbered from 1 to n, so one possible arrangement is that of increasing order from the top-left to
the bottom-right, leaving the last square on the board empty.  This is the final state.
The player starts with a random arrangement of tiles and must slide tiles around the grid to reach the final state.

Features
========

Code features
-------------

- I use a functional approach to make the code easy to read.
- I created a getNeighbors(...) and *forEachNeighbor(...)* function that I reused heavily.
- I created a system where new objects are extended with additional methods (properties) at run-time by passing them into the new ObjectName(...) call.
- Click event handling in the DOM and canvas drawing is delegated only to the GameHTML5View, so that Game, Board, and Input objects can be used with another platform later.
- I created a system where many event handlers can be initialized at once for specific element ids in the DOM via an object that looks like { click:  { 'dom_id' : function(...), ... } ... } for ease of use

Algorithm features
------------------

- I use a closure to cache the win state on first call and dynamically regenerate it only when the board size changes.
- I compare the current state to the win state by a simple string comparison of two arrays.
- I redraw only the two squares that are swapped.
- I calculate the size of squares based on the width and height of the board, and adjust the font size and location as appropriate.
- I randomize by swapping the blank square with a neighbor except the spot it just came from.

User interface features
-----------------------

- The game board and the three start buttons are designed to fit on a smartphone in portrait mode
- The game board and the entire settings panel show side-by-side on devices with larger screens
- The size of the squares and the font for numbering them change in size as as the board size changes

Annotated Source Code
=====================

http://vlad.github.com/gamethrone/examples/slider/docs/slider.html

Play Slider
===========

http://vlad.github.com/gamethrone/examples/slider
