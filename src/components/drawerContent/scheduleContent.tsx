import "preact";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
  MutableRef,
} from "preact/hooks";
import { MyContext } from "../content/index";
import MutableArrayDataProvider = require("ojs/ojmutablearraydataprovider");
import AsyncRegExpValidator = require("ojs/ojasyncvalidator-regexp");
import "ojs/ojformlayout";
import "ojs/ojswitch";
import { ojSwitch } from "ojs/ojswitch";
import "ojs/ojlistview";
import { ojListView } from "ojs/ojlistview";
import "ojs/ojinputtext";
import { ojInputText, ojTextArea } from "ojs/ojinputtext";
import "ojs/ojdatetimepicker";
import { KeySetImpl } from "ojs/ojkeyset";
import { IntlDateTimeConverter } from "ojs/ojconverter-datetime";
import "ojs/ojvalidationgroup";
import { ojValidationGroup } from "ojs/ojvalidationgroup";

type Props = {
  data: MutableRef<MutableArrayDataProvider<string, Event>>;
  loadNext: () => void;
};

type Event = {
  name: string;
  startTime: string;
};

const validators = [
  new AsyncRegExpValidator({
    pattern: "[a-zA-Z0-9_ ]{0,}[^-]",
    hint: "can not contain a hyphen (-)",
    messageDetail: "Enter name without hyphen (-)",
  }),
];

const timeConverter = new IntlDateTimeConverter({
  minute: "2-digit",
  hour: "2-digit",
  hour12: false,
  isoStrFormat: "local",
});

export function ScheduleContent(props: Props) {
  const eventDP = props.data;
  const {
    setName,
    setRealName,
    selectedEvent,
    setSelectedEvent,
    autoLoad,
    setAutoLoad,
    eventNameVal,
    setEventNameVal,
    setEventTime,
    scheduleValue,
    setScheduleValue,
    sortEvents,
    getCleanEventName,
  } = useContext(MyContext);

  const [newEventDate, setNewEventDate] = useState(null);
  const [newEventTime, setNewEventTime] = useState(null);
  const [fetchedEventData, setFetchedEventData] = useState([]);

  const [valid, setValid] = useState(null);
  const valGroup1 = useRef();

  const listAreaRef = useRef(null);

  const importSchedule = () => {
    try {
      let newSchedule = JSON.parse(scheduleValue);
      let tempArray = [...eventDP.current.data];
      let count = eventDP.current.data.length;
  
      for (let i = 0; i < fetchedEventData.length; i++) {
        const event = fetchedEventData[i];
        event.name = event.name + "-" + count;
        localStorage.setItem(event.name, event.startTime);
        tempArray.push(event);
        count++;
      }
  
      // Add the existing events from newSchedule
      for (let i = 0; i < newSchedule.length; i++) {
        const event = newSchedule[i];
        event.name = event.name + "-" + count;
        localStorage.setItem(event.name, event.startTime);
        tempArray.push(event);
        count++;
      }
  
      newSchedule = sortEvents(tempArray);
      eventDP.current.data = newSchedule;
    } catch (error) {
      console.error("Error importing schedule:", error);
    }
  };

  const formatDate = useCallback((data) => {
    let dateObj = new Date(data);
    let options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    return dateObj.toLocaleString("en-US", options);
  }, []);


    // Async Import from File
    const ImportClockJson = async () => {
      try {
        const requestOptions = {
          method: 'GET',
        };
    
        const response = await fetch("", requestOptions);
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const fetchedData = await response.text();
        console.log("fetchedData", fetchedData);
    
        return fetchedData;
      } catch (error) {
        console.error("Error fetching event data:", error.message);
        return null;
      }
    }
    
    const fetchSchedule = async () => {
      try {
        let importData = await ImportClockJson();
        if (importData != null) {
          let newSchedule = JSON.parse(importData);
          let tempArray = [...eventDP.current.data];
    
          for (let event in newSchedule) {
            newSchedule[event].name = newSchedule[event].name + "-" + tempArray.length + 1;
            localStorage.setItem(newSchedule[event].name, newSchedule[event].startTime);
            tempArray.push(newSchedule[event]);
          }
          tempArray = sortEvents(tempArray);
          eventDP.current.data = tempArray;
        }
      } catch (err) {
        console.log("Could not load event file");
      }
      listAreaRef.current.refresh();
    };

    useEffect(() => {
      const fetchSchedule = async () => {
        try {
          // Clear local storage before fetching new data
          localStorage.clear();
          const importData = await ImportClockJson();
          if (importData != null) {
            const newSchedule = JSON.parse(importData);
            let tempArray = [];
            for (let event in newSchedule) {
              if (new Date() < new Date(newSchedule[event].startTime)) {
                tempArray.push(newSchedule[event]);
                localStorage.setItem(
                  newSchedule[event].name,
                  newSchedule[event].startTime
                );
              }
            }
            let newListSorted = sortEvents(tempArray);
            setFetchedEventData(newListSorted);
          }
        } catch (error) {
          console.error("Could not load event file:", error.message);
        }
      };
      fetchSchedule();
    }, []);
  
  const selectedChangedHandler = useCallback(
    (event: ojListView.selectedChanged<Event["name"], Event>) => {
      console.log("Selected: ", event.detail.value);
      if (event.detail.updatedFrom === "internal") {
        setSelectedEvent(event.detail.value);
      }
    },
    [selectedEvent]
  );
  const updateNameVal = (event: ojInputText.valueChanged) => {
    setEventNameVal(event.detail.value);
  };

  const updateNewEventDate = (event) => {
    setNewEventDate(event.detail.value);
  };
  const updateNewEventTime = (event) => {
    setNewEventTime(event.detail.value);
  };

  const _checkValidationGroup = () => {
    const tracker = valGroup1.current as ojValidationGroup;
    if (tracker.valid === "valid") {
      return true;
    } else {
      // show messages on all the components that are invalidHiddden, i.e., the
      // required fields that the user has yet to fill out.
      tracker.showMessages();
      tracker.focusOn("@firstInvalidShown");
      // Context.getPageContext()
      //   .getBusyContext()
      //   .whenReady()
      //   .then(() => tracker.focusOn('@firstInvalidShown'));
      return false;
    }
  };

  const addEvent = () => {
    const valid = _checkValidationGroup();
    if (valid) {
      let tempName = eventNameVal;
      let tempNewDate = newEventDate;
      let tempNewTime = newEventTime;
      let tempArray = [...eventDP.current.data];
      let fullStart = tempNewDate + tempNewTime;
      tempName = tempName += "-" + tempArray.length + 1;
      console.log("name: " + tempName + " : " + fullStart);
      tempArray.push({ name: tempName, startTime: fullStart });
      localStorage.setItem(tempName, fullStart);
      tempArray = sortEvents(tempArray);
      eventDP.current.data = tempArray;
    }
  };

  const updateScheduleVal = (event: ojTextArea.valueChanged) => {
    setScheduleValue(event.detail.value);
  };

  const updateAutoLoad = (event: ojSwitch.valueChanged) => {
    setAutoLoad(event.detail.value);
  };

  useEffect(() => {
    if (selectedEvent) {
      let key: Array<string> = Array.from(
        (selectedEvent as KeySetImpl<Event["name"]>).keys.keys.values()
      );
      if (key.length > 0) {
        eventDP.current
          .fetchByKeys({
            keys: selectedEvent.values(),
          })
          .then((fetchResult) => {
            const iterator = fetchResult.results.values();
            const results = Array.from(iterator);
            console.log("data: ", results[0].data);
            setRealName(results[0].data.name);
            setName(getCleanEventName(results[0].data.name));
            setEventTime(new Date(results[0].data.startTime));
          });
      } else {
        setRealName("No Event");
        setName("No Event");
        setEventTime(new Date("2022-12-25 00:00:00"));
      }
    }
  }, [selectedEvent]);

  const deleteEvent = (event) => {
    let tempArray = [];
    let removedEvent = event.target.id;
    eventDP.current.data.filter((event) => {
      if (event.name !== removedEvent) {
        tempArray.push({ name: event.name, startTime: event.startTime });
      }
    });
    if (tempArray.length === 0) {
      setRealName("No Event");
      setName("No Event");
      setEventTime(new Date("2022-12-25 00:00:00"));
      setSelectedEvent(new KeySetImpl([]));
    } else {
      // Load next available event after deleting the current event
      props.loadNext();
    }
    eventDP.current.data = tempArray;
    localStorage.removeItem(event.target.id);
  };

  const listItemTemplate = useCallback(
    (event: ojListView.ItemTemplateContext<Event["name"], Event>) => {
      return (
        <div class="oj-flex-bar">
          <div class="oj-flex-bar-start oj-flex oj-sm-flex-direction-column">
            <div class="oj-flex-item oj-typography-subheading-sm ">
              {getCleanEventName(event.data.name)}
            </div>
            <div class="oj-flex-item">{formatDate(event.data.startTime)}</div>
          </div>
          <oj-button
            display="icons"
            id={event.data.name}
            onojAction={deleteEvent}
            label="Remove"
            class="oj-flex-bar-end"
            data-oj-clickthrough="disabled">
            <span slot="startIcon" class="oj-ux-ico-close"></span>
          </oj-button>
        </div>
      );
    },
    []
  );

  const noDataTemplate = useCallback(() => {
    return (
      <div>
        <h3 class="oj-typography-heading-sm">No Events available</h3>
        <div>Add an individual event, or import a full schedule below.</div>
      </div>
    );
  }, []);

  return (
    <>
      <h2 class="oj-typography-heading-md">Select active event</h2>
      <oj-form-layout>
        <oj-switch
          labelHint="Auto-load schedule"
          labelEdge="inside"
          value={autoLoad}
          onvalueChanged={updateAutoLoad}></oj-switch>
      </oj-form-layout>
      <oj-list-view
        ref={listAreaRef}
        data={eventDP.current}
        selectionMode="single"
        gridlines={{ item: "visibleExceptLast" }}
        selected={selectedEvent}
        onselectedChanged={selectedChangedHandler}
        class="clock-listview-sizing">
        <template slot="itemTemplate" render={listItemTemplate}></template>
        <template slot="noData" render={noDataTemplate}></template>
      </oj-list-view>

      {/* add event name and event date/time information */}

      <oj-validation-group ref={valGroup1} valid={valid}>
        <oj-form-layout class="oj-sm-margin-4x-top">
          <h2 class="oj-typography-heading-md">Add new event</h2>
          <oj-input-text
            labelHint="Name"
            value={eventNameVal}
            clearIcon="conditional"
            validators={validators}
            required
            help={{
              instruction: "Event names must not contain a dash (-)",
            }}
            onvalueChanged={updateNameVal}></oj-input-text>
          <oj-form-layout direction="row" columns={2}>
            <oj-input-date
              aria-label="event start date"
              labelHint="Event date"
              value={newEventDate}
              required
              onvalueChanged={updateNewEventDate}></oj-input-date>
            <oj-input-time
              aria-label="event start time"
              labelHint="Event time"
              value={newEventTime}
              timePicker={{
                showOn: "focus",
                timeIncrement: "5",
                footerLayout: "",
              }}
              converter={timeConverter}
              required
              help={{
                instruction: "Required format HH:MM (24-hour clock)",
              }}
              onvalueChanged={updateNewEventTime}></oj-input-time>
          </oj-form-layout>
          <oj-button onojAction={addEvent} label="Add event"></oj-button>
        </oj-form-layout>
      </oj-validation-group>
      <oj-form-layout class="oj-sm-margin-4x-top">
        <h2 class="oj-typography-heading-md">Import event schedule</h2>
        <oj-text-area
          rows={10}
          labelHint="Schedule"
          placeholder='[ {"name": "My event", "startTime":"2023-03-19T14:15:00"} ]'
          value={scheduleValue}
          help={{
            instruction:
              'paste array of objects in the format of {"name":"my event", "startTime":"YYYY-MM-DDTHH:MM:SS"}',
          }}
          onvalueChanged={updateScheduleVal}></oj-text-area>
        <oj-button onojAction={importSchedule} label="Import"></oj-button>
      </oj-form-layout>
    </>
  );
}
