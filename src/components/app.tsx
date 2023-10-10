import { Content } from "./content/index";
import { registerCustomElement } from "ojs/ojvcomponent";
import "preact";
import { useEffect } from "preact/hooks";
import Context = require("ojs/ojcontext");

export const App = registerCustomElement("app-root", () => {
  useEffect(() => {
    Context.getPageContext().getBusyContext().applicationBootstrapComplete();
  }, []);

  return (
    <div id="appContainer" class="oj-web-applayout-page">
      <Content />
    </div>
  );
});
