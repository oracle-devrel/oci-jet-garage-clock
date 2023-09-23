import "preact";
import "ojs/ojradioset";

type Props = {
  layout: string;
  panelLayoutChange: (e) => void;
};

type LayoutTypes = {
  value: string;
  label: string;
};

const layoutOptions: Array<LayoutTypes> = [
  { value: "start", label: "Left" },
  { value: "end", label: "Right" },
  { value: "middle", label: "Middle" },
  { value: "both", label: "Left and Right" },
];

export function PanelControls(props: Props) {
  return (
    <>
      <h2 class="oj-typography-heading-md">Select Panel Layout</h2>
      <oj-radioset
        id="layoutoptionsId"
        labelHint="Layout options"
        labelEdge="inside"
        value={props.layout}
        onvalueChanged={props.panelLayoutChange}>
        {/* If you have a small, static set of options, you can use a map() to generate the 
                  oj-option elements.  If the list is dynamic or larger, use the options property and a 
                  DataProvider to setup the options. */}
        {layoutOptions.map((option) => {
          return <oj-option value={option.value}>{option.label}</oj-option>;
        })}
      </oj-radioset>
    </>
  );
}
