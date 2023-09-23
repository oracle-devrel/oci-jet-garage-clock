import "preact";

type Props = {
  localTime: Date;
};

export function Time(props: Props) {
  const formatDate = (time, timezone) => {
    let dateObj = new Date(time);
    /**
     * MDN Intl object
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
     */
    let options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: timezone, // "Europe/Prague"
      hour12: false,
    };
    /**
     * adding a second here to align countdown and timer
     */
    dateObj.setSeconds(dateObj.getSeconds() + 1);
    return dateObj.toLocaleTimeString(navigator.language, options);
  };

  return (
    <div class="oj-flex oj-sm-flex-direction-column oj-typography-subheading-xl oj-sm-align-items-start clock-time-text">
      <div class="oj-flex">
        <div
          role="presentation"
          class="oj-flex oj-flex-item oj-icon oj-sm-align-items-centre clock-line-icon"></div>
      </div>
      <div class="oj-flex-item">
        <span class="clock-time-text-label2" id="local-time-label">
          {" "}
          LOCAL TIME:{" "}
        </span>
      </div>
      <div class="oj-flex-item">
        <span class="clock-time-text-clock" aria-labelledby="local-time-label">
          {
            /**
             * Getting default timezone from browser
             */
            formatDate(
              props.localTime,
              Intl.DateTimeFormat().resolvedOptions().timeZone
            )
          }
        </span>
      </div>
    </div>
  );
}
