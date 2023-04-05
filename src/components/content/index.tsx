import { Counter } from "../counter/index";
import { Time } from "../time/index";
import { h } from "preact";
import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "preact/hooks";
import MutableArrayDataProvider = require("ojs/ojmutablearraydataprovider");
import "ojs/ojdrawerpopup";
import "ojs/ojbutton";
import "ojs/ojswitch";
import "ojs/ojformlayout";
import "ojs/ojinputtext";
import "ojs/ojlistview";
import { ojListView } from "ojs/ojlistview";
import { ojSwitch } from "ojs/ojswitch";
import { ojInputText, ojTextArea } from "ojs/ojinputtext";
import { KeySetImpl, KeySet } from "ojs/ojkeyset";
import AsyncRegExpValidator = require("ojs/ojasyncvalidator-regexp");

type Event = {
  name: string;
  startTime: string;
};

let eventData = [];

const sortEvents = (events) => {
  let data = events.sort((a, b) => {
    if (a.startTime < b.startTime) return -1;
  });
  return data;
};

if (localStorage.length > 0) {
  for (let event in localStorage) {
    let val = localStorage.getItem(event);
    if (typeof val === "string")
      eventData.push({ name: event, startTime: val });
  }
  eventData = sortEvents(eventData);
}

const getCleanEventName = (name) => {
  let parts = name.split("-");
  return parts[0];
};

const validators = [
  new AsyncRegExpValidator({
    pattern: "[a-zA-Z0-9_ ]{0,}[^-]",
    hint: "can not contain a hyphen (-)",
    messageDetail: "Enter name without hyphen (-)",
  }),
];
export function Content() {
  const eventDP = useRef(
    new MutableArrayDataProvider<Event["name"], Event>(eventData, {
      implicitSort: [{ attribute: "startTime", direction: "ascending" }],
      keyAttributes: "index",
    })
  );

  const [eventTime, setEventTime] = useState<Date>(
    new Date("2022-12-25 00:00:00")
  );
  const [name, setName] = useState<string>("No Event");
  const [realName, setRealName] = useState<string>("");
  const [endOpened, setEndOpened] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [locale, setLocale] = useState<boolean>(false);
  const [autoLoad, setAutoLoad] = useState<boolean>(true);
  const [eventNameVal, setEventNameVal] = useState<string>("");
  const [startTimeVal, setStartTimeVal] = useState<string>("");
  const [scheduleValue, setScheduleValue] = useState<string>("");

  const importSchedule = () => {
    let newSchedule = JSON.parse(scheduleValue);
    let tempArray = [...eventDP.current.data];
    let count = eventDP.current.data.length;
    for (let event in newSchedule) {
      newSchedule[event].name = newSchedule[event].name + "-" + count;
      localStorage.setItem(
        newSchedule[event].name,
        newSchedule[event].startTime
      );
      tempArray.push(newSchedule[event]);
      count++;
    }
    newSchedule = sortEvents(tempArray);
    eventDP.current.data = newSchedule;
  };

  const updateNameVal = (event: ojInputText.valueChanged) => {
    setEventNameVal(event.detail.value);
  };
  const updateStartTimeVal = (event: ojInputText.valueChanged) => {
    setStartTimeVal(event.detail.value);
  };

  const addEvent = () => {
    let tempName = eventNameVal;
    let tempStart = startTimeVal;
    let tempArray = [...eventDP.current.data];
    let startParts = tempStart.split(" ");
    let finalStart = startParts.toString().replace(",", "T");
    tempName = tempName += "-" + tempArray.length + 1;
    console.log("name: " + tempName + " : " + finalStart);

    tempArray.push({ name: tempName, startTime: finalStart });
    localStorage.setItem(tempName, finalStart);
    tempArray = sortEvents(tempArray);
    eventDP.current.data = tempArray;
  };

  /** this state variable holds the master time for both countdown and local clock */
  const [timeNow, setTimeNow] = useState<Date>(new Date());

  /** One timer with one setInterval controls the current time for the clock and countdown.
   * This keeps the two timed events synchronized
   */

  useEffect(() => {
    let timer = setInterval(() => setTimeNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const endToggle = () => {
    endOpened ? setEndOpened(false) : setEndOpened(true);
  };
  const open = () => {
    setEndOpened(true);
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

    return dateObj.toLocaleString(
      locale ? navigator.language : "en-US",
      options
    );
  }, []);

  const updateLocale = (event: ojSwitch.valueChanged) => {
    setLocale(event.detail.value);
  };

  const selectedChangedHandler = useCallback(
    (event: ojListView.selectedChanged<Event["name"], Event>) => {
      console.log("Selected: ", event.detail.value);
      if (event.detail.updatedFrom === "internal") {
        setSelectedEvent(event.detail.value);
      }
    },
    [selectedEvent]
  );

  const updateScheduleVal = (event: ojTextArea.valueChanged) => {
    setScheduleValue(event.detail.value);
  };

  const updateAutoLoad = (event: ojSwitch.valueChanged) => {
    setAutoLoad(event.detail.value);
  };
  const loadNextScheduleItem = async () => {
    let idx = await eventDP.current.data.findIndex(
      (item) => item.name === realName
    );
    let data = await eventDP.current.fetchByOffset({
      offset: 0,
    });
    if (idx + 1 < eventDP.current.data.length) {
      let newKey = data.results[idx + 1].metadata.key;
      setSelectedEvent(new KeySetImpl([newKey]));
    } else {
      setAutoLoad(false);
      setSelectedEvent(new KeySetImpl([]));
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      let key: Array<string> = Array.from(
        (selectedEvent as KeySetImpl<Event["name"]>).keys.keys.values()
      );
      if (key.length > 0) {
        let data = eventDP.current
          .fetchByKeys({
            keys: selectedEvent.values(),
          })
          .then((fetchResult) => {
            const iterator = fetchResult.results.values();
            const results = Array.from(iterator);
            console.log("data: " + results[0].data);
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
      loadNextScheduleItem();
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
            data-oj-clickthrough="disabled"
          >
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
        <h3>No Events available</h3>
        <div>Add an individual event, or import a full schedule below.</div>
      </div>
    );
  }, []);

  const listAreaRef = useRef(null);
  const drawerPopupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        listAreaRef.current &&
        !listAreaRef.current.contains(event.target) &&
        drawerPopupRef.current &&
        !drawerPopupRef.current.contains(event.target) &&
        endOpened
      ) {
        setEndOpened(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [endOpened]);

  return (
    <>
      <div class="oj-flex oj-sm-flex-direction-row oj-sm-12 clock-content-container">
        {/* 4 column panel for times and event data */}
        <div class="oj-flex-item oj-flex oj-sm-flex-direction-column oj-sm-4 oj-sm-margin-2x-left clock-event-panel">
          <div class="oj-flex-item oj-sm-align-items-center">
            <div
              role="img"
              class="oj-flex oj-flex-item oj-icon clock-icon oj-sm-align-items-centre"
              title="Tag Heuer logo"
              alt="Tag Heuer logo"
            ></div>
          </div>
          <div class="oj-flex-item oj-sm-flex-items-initial oj-sm-align-items-center oj-typography-heading-md clock-event-container">
            <div class="oj-flex-item oj-sm-flex-items-initial oj-sm-align-items-center clock-time-text-label">
              COUNTDOWN TO:
            </div>
            <div class="oj-flex-item oj-sm-flex-items-initial oj-sm-align-items-center clock-time-text-hero-label">
              {name}
            </div>
            <Counter
              targetTime={eventTime}
              currentTime={timeNow}
              autoLoad={autoLoad}
              loadNext={loadNextScheduleItem}
            />
            <div class="oj-flex-item oj-sm-flex-items-initial oj-sm-align-items-center clock-time-text-hero-label">
              <Time localTime={timeNow} />
            </div>
          </div>
        </div>

        {/* 8 column panel for video or other content */}
        <div class="oj-flex-item oj-sm-9">
          {/* Add content for the right side panel inside of the below <div> */}
          <div class="oj-flex clock-video-container"></div>
          <div class="oj-flex-item oj-typography-subheading-md oj-flex-bar oj-color-invert footer">
            <div class="oj-flex-bar-end">
              {/* <span class="o-text">POWERED BY</span> */}
              <button class="addbtn2" onClick={open}>
                <div
                  role="img"
                  class="oj-icon oracle-icon"
                  title="oracle logo"
                  alt="Oracle logo"
                ></div>
              </button>
            </div>
          </div>
        </div>
        <span>
          <oj-drawer-popup
            ref={drawerPopupRef}
            class="clock-drawer-end"
            edge="end"
            opened={endOpened}
            autoDismiss="none"
          >
            <div class="clock-drawer-container">
              <div class="oj-flex-bar clock-drawer-header">
                <h6 class="oj-flex-bar-start">Event Settings</h6>
                <oj-button
                  id="endButtonCloser"
                  display="icons"
                  chroming="borderless"
                  class="oj-flex-bar-end"
                  onojAction={endToggle}
                >
                  <span
                    slot="startIcon"
                    class="oj-ux-ico-close"
                  ></span>
                  Close
                </oj-button>
              </div>
              <div class="clock-drawer-header">
                <oj-form-layout>
                  <oj-switch
                    labelHint="Use browser locale"
                    labelEdge="inside"
                    value={locale}
                    onvalueChanged={updateLocale}
                  ></oj-switch>
                  <oj-switch
                    labelHint="Auto-load schedule"
                    labelEdge="inside"
                    value={autoLoad}
                    onvalueChanged={updateAutoLoad}
                  ></oj-switch>
                </oj-form-layout>
                <h4>Select active event</h4>
                <oj-list-view
                  ref={listAreaRef}
                  data={eventDP.current}
                  selectionMode="single"
                  gridlines={{ item: "visibleExceptLast" }}
                  selected={selectedEvent}
                  onselectedChanged={selectedChangedHandler}
                  class="clock-listview-sizing"
                >
                  <template
                    slot="itemTemplate"
                    render={listItemTemplate}
                  ></template>
                  <template slot="noData" render={noDataTemplate}></template>
                </oj-list-view>

                <oj-form-layout class="oj-sm-margin-4x-top">
                  <h4>Add new event</h4>
                  <oj-input-text
                    labelHint="Name"
                    value={eventNameVal}
                    clearIcon="conditional"
                    validators={validators}
                    help={{
                      instruction: "Event names must not contain a dash (-)",
                    }}
                    onvalueChanged={updateNameVal}
                  ></oj-input-text>
                  <oj-input-text
                    labelHint="Start time"
                    placeholder="YYYY-MM-DD HH:MM:SS"
                    help={{
                      instruction:
                        "Required format YYYY-MM-DD<space>HH:MM:SS with one space.",
                    }}
                    value={startTimeVal}
                    clearIcon="conditional"
                    onvalueChanged={updateStartTimeVal}
                  ></oj-input-text>
                  <oj-button
                    onojAction={addEvent}
                    label="Add event"
                  ></oj-button>
                </oj-form-layout>
                <oj-form-layout class="oj-sm-margin-4x-top">
                  <h4>Import event schedule</h4>
                  <oj-text-area
                    rows={10}
                    labelHint="Schedule"
                    placeholder='[ {"name": "My event", "startTime":"2023-03-19T14:15:00"} ]'
                    value={scheduleValue}
                    help={{
                      instruction:
                        'paste array of objects in the format of {"name":"my event", "startTime":"YYYY-MM-DDTHH:MM:SS"}',
                    }}
                    onvalueChanged={updateScheduleVal}
                  ></oj-text-area>
                  <oj-button
                    onojAction={importSchedule}
                    label="Import"
                  ></oj-button>
                </oj-form-layout>
              </div>
            </div>
          </oj-drawer-popup>
        </span>
      </div>
    </>
  );
}
