/******************************************************************************
* generateTableRow
*
* Parameters:
*   data: An object of train status data
*     TimeStamp: The current time, as Unix epoch. Not used.
*     Origin: The name of the station where the train is supposed to arrive
*     Trip: The ID of the trip this train is running
*     Destination: The name of this station where this trip will terminate
*     ScheduledTime: The time the train is supposed to arrive, as Unix epoch
*     Lateness: How delayed the train is past its scheduled time, in seconds
*     Track: The track where the train is arriving
*     Status: The status of the train (e.g. 'Boarding', 'Late')
*
* Returns: A string of HTML representing a formatted table row ready to be put
*   into the status board
******************************************************************************/
function generateTableRow(data) {
	var time = getFormattedTime(getDate(data.ScheduledTime));
	var origin = data.Origin.replace(/'/g, '').toUpperCase();
	var trip = data.Trip.replace(/'/g, '').toUpperCase();
	var destination = data.Destination.replace(/'/g, '').toUpperCase();

	// If we don't know the track yet, say so
	var track = data.Track.replace(/'/g, '').toUpperCase();
	if (!track) {
		track = 'TBD'
	}

	// If we know exactly how late the train is, say so, otherwiwse
	// just say it's late. Falsy-0 check deliberate ('LATE 0 MIN'
	// looks odd).
	var status = data.Status.replace(/'/g, '').toUpperCase();
	var lateness = Math.floor(data.Lateness / 60);
	if (
		(
			status === 'DELAYED'
			|| status === 'LATE'
		)
		&& lateness
	) {
		// Lateness is given in seconds - use minutes for readability
		status = 'LATE ' + lateness + ' MIN';
	}

	var row = "<tr><td class=\"scheduled-time\">" + time +
	"</td><td class=\"origin\">" + origin + "</td><td class=\"trip\">" + trip +
	"</td><td class=\"destination\">" + destination + "</td><td class=\"class\">" + track +
	"</td><td class=\"status\">" + status + "</td></tr>";

	return row;
};

/******************************************************************************
* getDate
*
* Description: One can directly create a Date from a Unix epoch, but the
*   constructor wants milliseconds, and the epochs are given in seconds.
*   This function exists largely for readability
*
* Parameters:
*   epoch: A Unix epoch
*
* Returns: A Date object representing the given Unix epoch
******************************************************************************/
function getDate(epoch) {
	// Set the date to the epoch Time
	var time = new Date(0);
	// Then add the epoch seconds
	time.setUTCSeconds(epoch);
	return time;
}

/******************************************************************************
* leftPadTwoDigitNumber
*
* Parameters:
*   number: A one or two digit number, such as might be returned from a call
*     to Date.get(Hours|Minutes)
*
* Returns: The number passed in, left-padded with a 0 if it was a single digit
*   number
******************************************************************************/
function leftPadTwoDigitNumber(number) {
	if (number < 10) {
		return '0' + number;
	}
	else {
		return '' + number;
	}
}

/******************************************************************************
* getFormattedTime
*
* Parameters:
*   date: A Date object
*
* Returns: A string representing the time portion of the Date object, formatted
*   as HH:MM AP
******************************************************************************/
function getFormattedTime(date) {
	var timeString = '';
	var hours = date.getHours();
	var minutes = date.getMinutes();
	if (hours % 12) {
		timeString += hours % 12;
	}
	else {
		timeString += '12';
	}
	timeString += ':' + leftPadTwoDigitNumber(minutes) + ' ';
	if (hours < 12) {
		timeString += 'AM';
	}
	else {
		timeString += 'PM';
	}

	return timeString;
}

/******************************************************************************
* getFormattedDate
*
* Paramters:
*   date: A Date object
*
* Returns: A string representing the date portion of the Date object, formatted
*   as MM-DD-YYYY
******************************************************************************/
function getFormattedDate(date) {
	var dateString = '';
	// Months are stored 0-11 for some reason...
	dateString += leftPadTwoDigitNumber(date.getMonth() + 1) + '-';
	// ... but dates aren't.
	dateString += leftPadTwoDigitNumber(date.getDay()) + '-';
	dateString += date.getFullYear();
	return dateString;
}

/******************************************************************************
* getFormattedDay
*
* Paramters:
*   date: A Date object
*
* Returns: A string representing the day-of-week portion of the Date object.
******************************************************************************/
function getFormattedDay(date) {
	// Days of the week are represented 0-6 in Date objects.
	var days = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday'
	];
	return days[date.getDay()];
}

/******************************************************************************
* pollForever
*
* Description: The workhorse function. Every minute, polls the server for a
*   new set of train statuses. If we actually find any, update the board.
*
* Parameters: none
* Returns: none
******************************************************************************/
function pollForever() {
	$.post({
		url: '/poll',
		success: function(response) {
			var data = JSON.parse(response);

			if(data.length) {
				var $table = $(".departures-table");
				var $day = $(".day");
				var $date = $(".date");
				var $time = $(".time");

				var currentTime = getDate(data[0].TimeStamp);
				$day.html(getFormattedDay(currentTime));
				$date.html(getFormattedDate(currentTime));
				$time.html(getFormattedTime(currentTime));

				var rows = [];
				for(var i = 0; i < data.length; i++) {
					var table_row = generateTableRow(data[i])
					rows.push(table_row);
				}

				$table.find('tr:not(:first)').remove();
				$table.append(rows);
			}
		}
	});

	setTimeout(pollForever, 60000);
}

$(document).ready(function() {
	pollForever();
});


