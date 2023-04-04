import { h } from "preact";
import { useEffect } from "preact/hooks";

type Props = {
  localTime: Date;
};

export function Time(props: Props) {
  const formatDate = (time, timezone) => {
    let dateObj = new Date(time);
    let options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: timezone, // "Europe/Prague"
      hour12: false,
    };
    dateObj.setSeconds(dateObj.getSeconds() + 1);
    return dateObj.toLocaleTimeString(navigator.language, options);
  };

  return (
    <div class="oj-flex oj-sm-flex-direction-column oj-typography-subheading-xl oj-sm-align-items-start clock-time-text">
      <div class="oj-flex">
        <div
          role="img"
          class="oj-flex oj-flex-item oj-icon oj-sm-align-items-centre line-icon"
          title="line"
          alt="lineBreak"
        ></div>
      </div>
      <div class="oj-flex-item">
        <span class="clock-time-text-label2"> LOCAL TIME: </span>
      </div>
      <div class="oj-flex-item">
        <span class="clock-time-text-clock">
          {formatDate(
            props.localTime,
            Intl.DateTimeFormat().resolvedOptions().timeZone
          )}
        </span>
      </div>
    </div>
  );
}
