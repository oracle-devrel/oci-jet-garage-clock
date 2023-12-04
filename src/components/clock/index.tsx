import { Counter } from "../counter/index";
import { Time } from "../time/index";
import "preact";
import { useEffect, useState } from "preact/hooks";

type Props = {
  name: string;
  autoLoad: boolean;
  eventTime: Date;
  loadNextScheduleItem: () => void;
};
export function Clock(props: Props) {
  /* this state variable holds the master time for both countdown and local clock */
  const [timeNow, setTimeNow] = useState<Date>(new Date());

  /* One timer with one setInterval controls the current time for the clock and countdown.
     This keeps the two timed events synchronized */

  useEffect(() => {
    let timer = setInterval(() => setTimeNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div class="oj-flex-item oj-sm-align-items-center">
        <div
          role="img"
          class="oj-flex oj-flex-item oj-icon clock-tag-icon oj-sm-align-items-centre"
          title="Oracle JET logo"
          alt="Oracle JET logo"></div>
      </div>
      <div class="oj-flex-item oj-sm-flex-items-initial oj-sm-align-items-center oj-typography-heading-md clock-event-container">
        <div class="oj-flex-item oj-sm-flex-items-initial oj-sm-align-items-center clock-time-text-label">
          COUNTDOWN TO:
        </div>
        <div class="oj-flex-item oj-sm-flex-items-initial oj-sm-align-items-center clock-time-text-hero-label">
          {props.name}
        </div>
        {/* Show the countdown to the currently selected event */}
        <Counter
          targetTime={props.eventTime}
          currentTime={timeNow}
          autoLoad={props.autoLoad}
          loadNext={props.loadNextScheduleItem}
        />
        {/* Show the local time */}
        <div class="oj-flex-item oj-sm-flex-items-initial oj-sm-align-items-center clock-time-text-hero-label">
          <Time localTime={timeNow} />
          
        </div>

      </div>
    </>
  );
}
