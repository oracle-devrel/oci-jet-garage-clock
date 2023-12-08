import { Clock } from "../clock/index";
import { PanelControls } from "../drawerContent/PanelControls";
import { ScheduleContent } from "../drawerContent/scheduleContent";
import { createContext } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";
import "ojs/ojdrawerpopup";
import "ojs/ojbutton";
import { ojRadioset } from "ojs/ojradioset";
import MutableArrayDataProvider = require("ojs/ojmutablearraydataprovider");
import { KeySetImpl } from "ojs/ojkeyset";

type LayoutTypes = {
  value: string;
  label: string;
};

export const MyContext = createContext(null);

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

if (sessionStorage.length > 0) {
  for (let event in sessionStorage) {
    let val = sessionStorage.getItem(event);
    if (typeof val === "string")
      eventData.push({ name: event, startTime: val });
  }
  eventData = sortEvents(eventData);
}

const getCleanEventName = (name) => {
  let parts = name.split("-");
  return parts[0];
};

export function Content() {
  const drawerPopupRef = useRef();
  const [endOpened, setEndOpened] = useState<boolean>(false);
  const [layoutPattern, setLayoutPattern] = useState<string>("start");

  const [eventTime, setEventTime] = useState<Date>(
    new Date("2022-12-25 00:00:00")
  );
  const [name, setName] = useState<string>("No Event");
  const [realName, setRealName] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [autoLoad, setAutoLoad] = useState<boolean>(true);
  const [eventNameVal, setEventNameVal] = useState<string>("");
  const [scheduleValue, setScheduleValue] = useState<string>("");

  const open = () => {
    setEndOpened(true);
  };

  const resetDrawerState = () => {
    setEndOpened(false);
  };

  const handlePanelLayoutChange = (
    event: ojRadioset.valueChanged<LayoutTypes["value"], LayoutTypes>
  ) => {
    setLayoutPattern(event.detail.value);
  };

  const eventDP = useRef(
    new MutableArrayDataProvider<Event["name"], Event>(eventData, {
      implicitSort: [{ attribute: "startTime", direction: "ascending" }],
      keyAttributes: "index",
    })
  );

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

  const drawerContext = {
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
  };

  return (
    <div id="master" class="oj-flex oj-sm-flex-direction-column oj-sm-12">
      <div class="oj-flex-bar clock-content-container">
        {(layoutPattern === "start" || layoutPattern === "both") && (
          <div
            id="leftClock"
            class="oj-flex-bar-start oj-sm-3 oj-sm-margin-2x-left clock-event-panel-left">
            <div class="oj-flex-item oj-sm-flex-items-initial oj-sm-align-items-center clock-event-container">
              <Clock
                eventTime={eventTime}
                autoLoad={autoLoad}
                loadNextScheduleItem={loadNextScheduleItem}
                name={name}
              />
            </div>
          </div>
        )}
        {layoutPattern === "middle" && (
          <div
            id="middleClock"
            class="oj-flex-bar-middle oj-sm-6 clock-event-panel-middle oj-sm-align-items-center">
            <div class="oj-flex-item oj-sm-flex-items-initial oj-sm-align-items-center clock-event-container">
              <Clock
                eventTime={eventTime}
                autoLoad={autoLoad}
                loadNextScheduleItem={loadNextScheduleItem}
                name={name}
              />
            </div>
          </div>
        )}

        {(layoutPattern === "end" || layoutPattern === "both") && (
          <div
            id="rightClock"
            class="oj-flex-bar-end oj-sm-3 oj-sm-margin-2x-right clock-event-panel-right">
            <div class="oj-flex-item oj-sm-flex-items-initial oj-sm-align-items-center clock-event-container">
              <Clock
                eventTime={eventTime}
                autoLoad={autoLoad}
                loadNextScheduleItem={loadNextScheduleItem}
                name={name}
              />
            </div>
          </div>
        )}
        <MyContext.Provider value={drawerContext}>
          <span>
            <oj-drawer-popup
              ref={drawerPopupRef}
              class="clock-drawer-end"
              edge="end"
              opened={endOpened}
              onojBeforeClose={resetDrawerState}
              autoDismiss="focus-loss">
              <div class="clock-drawer-container">
                <div class="oj-flex-bar clock-drawer-header">
                  <h1 class="oj-flex-bar-start oj-typography-heading-lg">
                    Event Settings
                  </h1>
                  <oj-button
                    id="endButtonCloser"
                    aria-label="Close drawer"
                    display="icons"
                    chroming="borderless"
                    class="oj-flex-bar-end"
                    onojAction={resetDrawerState}>
                    <span
                      slot="startIcon"
                      class="oj-ux-ico-close clock-drawer-text-color"></span>
                    Close
                  </oj-button>
                </div>
                <div class="clock-drawer-content">
                  <PanelControls
                    layout={layoutPattern}
                    panelLayoutChange={handlePanelLayoutChange}
                  />
                  <ScheduleContent
                    data={eventDP}
                    loadNext={loadNextScheduleItem}
                  />
                </div>
              </div>
            </oj-drawer-popup>
          </span>
        </MyContext.Provider>
      </div>
      <div class="oj-flex-item oj-typography-subheading-md oj-flex-bar oj-color-invert footer ">
        <div class="oj-flex-bar-end">
          <button class="addbtn2" onClick={open} aria-label="Event Settings">
            <div
              role="img"
              class="oj-icon clock-oracle-icon"
              title="powered by oracle cloud"
              alt="Powered by Oracle Cloud logo"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
