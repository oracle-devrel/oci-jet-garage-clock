/**
 * Special thanks to Yaphi Berhanu and Nilson Jacques
 * for their article on JavaScript based countdown timers
 * https://www.sitepoint.com/build-javascript-countdown-timer-no-dependencies/
 */

import { h } from "preact";
import { useState, useEffect, useMemo } from "preact/hooks";

type Props = {
  targetTime: Date;
  loadNext: () => void;
  autoLoad: boolean;
  currentTime: Date;
};

interface date {
  total: number;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

const getTimeRemaining = (targetTime, currentTime) => {
  const total =
    Date.parse(targetTime) - Date.parse(new Date(currentTime).toISOString());
  if (total < 0) {
    return {
      total: 0,
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    };
  }
  const seconds = Math.floor((total / 1000) % 60).toString();
  const minutes = Math.floor((total / 1000 / 60) % 60).toString();
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24).toString();
  const days = Math.floor(total / (1000 * 60 * 60 * 24)).toString();

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
  };
};

export function Counter(props: Props) {
  const [hours, setHours] = useState<string>(null);
  const [minutes, setMinutes] = useState<string>(null);
  const [seconds, setSeconds] = useState<string>(null);

  useEffect(() => {
    if (props.currentTime) {
      const t = getTimeRemaining(props.targetTime, props.currentTime);
      setHours(t.hours.padStart(2, "0"));
      setMinutes(t.minutes.padStart(2, "0"));
      setSeconds(t.seconds.padStart(2, "0"));
      if (t.total <= 0) {
        setHours("00");
        setMinutes("00");
        setSeconds("00");
        if (props.autoLoad) {
          props.loadNext();
        }
      }
    }
  }, [props.targetTime, props.autoLoad, props.currentTime]);

  return (
    <div class="oj-typography-heading-2xl oj-sm-align-items-center oj-sm-justify-content-center">
      <div class="oj-flex oj-sm-12 oj-sm-justify-content-center">
        {/* 5 column panel for spacing */}
        <div class="oj-flex-item oj-sm-3 oj-sm-align-items-center clock-drawer-header">
          {hours}
        </div>
        <div class="oj-flex-item oj-sm-1 oj-sm-align-items-center clock-drawer-header-colon">
          :
        </div>
        <div class="oj-flex-item oj-sm-3 oj-sm-align-items-center clock-drawer-header">
          {minutes}
        </div>
        <div class="oj-flex-item oj-sm-1 oj-sm-align-items-center clock-drawer-header-colon">
          :
        </div>
        <div class="oj-flex-item oj-sm-3 oj-sm-align-items-center clock-drawer-header">
          {seconds}
        </div>
      </div>
      <div class="oj-flex oj-sm-12 oj-sm-justify-content-center">
        {/* 5 column panel for spacing */}
        <div class="oj-flex-item oj-sm-3 oj-sm-align-items-center clock-counter-label">
          HR
        </div>
        <div class="oj-flex-item oj-sm-1 oj-sm-align-items-center clock-drawer-header"></div>
        <div class="oj-flex-item oj-sm-3 oj-sm-align-items-center clock-counter-label">
          MIN
        </div>
        <div class="oj-flex-item oj-sm-1 oj-sm-align-items-center clock-counter-label"></div>
        <div class="oj-flex-item oj-sm-3 oj-sm-align-items-center clock-counter-label">
          SEC
        </div>
      </div>
    </div>
  );
}
