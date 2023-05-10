import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Subscription } from "rxjs";

import "src/components/Chatbot/Chatbot.scss";
import RappidService from "src/services/rappid.service";
import JsonEditor from "src/components/Chatbot/JsonEditor/JsonEditor";
import Inspector from "src/components/Chatbot/Inspector/Inspector";
import EventBusServiceContext from "src/services/event-bus-service.context";
import { EventBusService } from "src/services/event-bus.service";
import { SharedEvents } from "src/rappid/controller";
import {
  importGraphFromJSON,
  loadStencilShapes,
  zoomToFit,
} from "src/rappid/actions";
import { STENCIL_WIDTH } from "src/theme";

import exampleGraphJSON from "src/rappid/config/example-graph.json";

const Chatbot = (): ReactElement => {
  const elementRef = useRef(null);
  const toolbarRef = useRef(null);
  const stencilRef = useRef(null);
  const paperRef = useRef(null);

  const [rappid, setRappid] = useState(null);
  const [eventBusService] = useState(new EventBusService());
  const [fileJSON, setFileJSON] = useState(null);
  const [subscriptions] = useState(new Subscription());

  const openFile = useCallback(
    (json: Object): void => {
      setFileJSON(json);
      importGraphFromJSON(rappid, json);
      zoomToFit(rappid);
    },
    [rappid]
  );

  const onStart = useCallback((): void => {
    loadStencilShapes(rappid);
    openFile(exampleGraphJSON);
  }, [rappid, openFile]);

  const onJsonEditorChange = useCallback(
    (json: Object): void => {
      if (rappid) {
        importGraphFromJSON(rappid, json);
      }
    },
    [rappid]
  );

  const onRappidGraphChange = useCallback((json: Object): void => {
    console.log({ onRappidGraphChange });
    setFileJSON(json);
  }, []);

  const setStencilContainerSize = useCallback((): void => {
    stencilRef.current.style.width = `${STENCIL_WIDTH}px`;
  }, []);

  useEffect(() => {
    subscriptions.add(
      eventBusService.on(SharedEvents.GRAPH_CHANGED, (json: Object) =>
        onRappidGraphChange(json)
      )
    );
    subscriptions.add(
      eventBusService.on(SharedEvents.JSON_EDITOR_CHANGED, (json: Object) =>
        onJsonEditorChange(json)
      )
    );
  }, [eventBusService, subscriptions, onRappidGraphChange, onJsonEditorChange]);

  useEffect(() => {
    setRappid(
      new RappidService(
        elementRef.current,
        paperRef.current,
        stencilRef.current,
        toolbarRef.current,
        eventBusService
      )
    );
  }, [eventBusService]);

  useEffect(() => {
    if (!rappid) {
      return;
    }
    setStencilContainerSize();
    onStart();
  }, [rappid, onStart, setStencilContainerSize]);

  useEffect(() => {
    if (!rappid) {
      return;
    }
    return () => {
      subscriptions.unsubscribe();
      rappid.destroy();
    };
  }, [rappid, subscriptions]);

  return (
    <EventBusServiceContext.Provider value={eventBusService}>
      <div ref={elementRef} className="rappid-scope chatbot">
        <div ref={toolbarRef} />
        <div className="side-bar">
          <div
            ref={stencilRef}
            style={{ display: true ? "initial" : "none" }}
            className="stencil-container"
          />
        </div>
        <div className="main-container">
          <div ref={paperRef} className="paper-container" />
        </div>
        <Inspector />
      </div>
    </EventBusServiceContext.Provider>
  );
};

export default Chatbot;
