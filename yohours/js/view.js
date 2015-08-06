/*
 * This file is part of YoHours.
 * 
 * YoHours is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * 
 * YoHours is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with YoHours.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * YoHours
 * Web interface to make opening hours data for OpenStreetMap the easy way
 * Author: Adrien PAVIE
 *
 * View JS classes
 */
YoHours.view = {
/*
 * ========== CLASSES ==========
 */
/**
 * WeekView, view class for week display
 * @param mainView The main view
 */
WeekView: function(mainView) {
//ATTRIBUTES
	/** The mainview object **/
	var _mainView = mainView;
	
	/** This object **/
	var _self = this;

//OTHER METHODS
	this.init = function() {
		$("#calendar").fullCalendar({
			header: {
				left: '',
				center: '',
				right: ''
			},
			defaultView: 'agendaWeek',
			editable: true,
			columnFormat: 'dddd',
			timeFormat: 'HH:mm',
			axisFormat: 'HH:mm',
			allDayText: '24/24',
			slotDuration: '00:15:00',
			firstDay: 1,
			eventOverlap: false,
			selectable: true,
			selectHelper: true,
			selectOverlap: false,
			select: function(start, end) {
				//Add event to week intervals
				var minStart = parseInt(start.format("H")) * 60 + parseInt(start.format("m"));
				var minEnd = parseInt(end.format("H")) * 60 + parseInt(end.format("m"));
				var weekId = controller.newInterval(
					new YoHours.model.Interval(
						swDayToMwDay(start.format("d")),
						swDayToMwDay(end.format("d")),
						minStart,
						minEnd
					)
				);
				
				//Add event on calendar
				eventData = {
					id: weekId,
					start: start,
					end: end
				};
				$('#calendar').fullCalendar('renderEvent', eventData, true);
			},
			eventClick: function(calEvent, jsEvent, view) {
				controller.removeInterval(calEvent._id);
				$('#calendar').fullCalendar('removeEvents', calEvent._id);
			},
			eventResize: function(event, delta, revertFunc, jsEvent, ui, view) {
				var minStart = parseInt(event.start.format("H")) * 60 + parseInt(event.start.format("m"));
				var minEnd = parseInt(event.end.format("H")) * 60 + parseInt(event.end.format("m"));
				controller.editInterval(
					event.id,
					new YoHours.model.Interval(
						swDayToMwDay(event.start.format("d")),
						swDayToMwDay(event.end.format("d")),
						minStart,
						minEnd
					)
				);
			},
			eventDrop: function(event, delta, revertFunc, jsEvent, ui, view) {
				var minStart = parseInt(event.start.format("H")) * 60 + parseInt(event.start.format("m"));
				var minEnd = parseInt(event.end.format("H")) * 60 + parseInt(event.end.format("m"));
				controller.editInterval(
					event.id,
					new YoHours.model.Interval(
						swDayToMwDay(event.start.format("d")),
						swDayToMwDay(event.end.format("d")),
						minStart,
						minEnd
					)
				);
			}
		});
	};
},


/**
 * The opening hours text input field
 */
HoursInputView: function(main) {
//ATTRIBUTES
	/** The main view **/
	var _mainView = main;

	/** The input field **/
	var _field = $("#oh");

//MODIFIERS
	/**
	 * Changes the input value
	 */
	this.setValue = function(val) {
		if(val != _field.val()) {
			_field.val(val);
		}
	};
	
	/**
	 * Sets if the contained value is correct or not
	 */
	this.setValid = function(valid) {
		if(valid) {
			$("#oh-form").removeClass("has-error");
		}
		else {
			$("#oh-form").addClass("has-error");
		}
	};
	
	this.changed = function() {
		_mainView.getController().showHours(_field.val());
	};

//CONSTRUCTOR
	_field.bind("input propertychange", this.changed.bind(this));
},


/**
 * MainView, view class for the main page
 * @param ctrl The MainController
 */
MainView: function(ctrl) {
//ATTRIBUTES
	/** The application controller **/
	var _ctrl = ctrl;
	
	/** The week view **/
	var _weekView = new YoHours.view.WeekView(this);
	
	/** The hours input view **/
	var _hoursInputView = new YoHours.view.HoursInputView(this);
	
	/** The help dialog **/
	var _helpView;
	
	/** This object **/
	var _self = this;

//ACCESSORS
	/**
	 * @return The hours input view
	 */
	this.getHoursInputView = function() {
		return _hoursInputView;
	};
	
	this.getController = function() {
		return _ctrl;
	};

//OTHER METHODS
	/**
	 * Initializes the view
	 */
	this.init = function() {
		_hoursInputView.setValue("");
		_weekView.init();
		
		//Init help dialog
		_helpView = $("#help").dialog({
			autoOpen: false,
			resizable: false,
			width: 400,
			height: 200
		});
		$("#help-link").click(function() { _helpView.dialog("open"); });
		
		$("#oh-clear").click(function() { _ctrl.clearIntervals(); });
	};
	
	/**
	 * Refreshes the view
	 */
	this.refresh = function() {
		_hoursInputView.setValue(_ctrl.getOpeningHours());
	};
}

};