# North-South Superstation Board

A small Python server and Javascript/JQuery client for displaying live data about train departures from North Station and South Station, a la the existing departure boards. The page refreshes every minute.

## Prerequisites

This project requires [Python 3.6.3](https://www.python.org/downloads/) to be installed on your machine.

## Dependencies

The project uses [JQuery 3.2.1](https://code.jquery.com/jquery-3.2.1.js).

## Usage

From the commandline, navigate to the directory where this repo is cloned and run `python server.py`.

Then, go to http://localhost:8000.

## Potential Extensions

* More than basic styling - coloring, outlines
* Usability tweaks
   * Splitting out North Station / South Station departures in to different sections parts of the board, a la Amtrak arrivals on actual boards
   * Limit number of lines visible to only the next hour's worth of departures, so that the page isn't as vertically tall
   * Cross-browser testing
* 30th St. Station-style split-flap animation