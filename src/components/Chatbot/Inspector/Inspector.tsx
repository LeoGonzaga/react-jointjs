import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { dia, shapes } from '@clientio/rappid';
import { Subscription } from 'rxjs';

import MessageInspector from 'src/components/Chatbot/Inspector/MessageInspector';
import 'src/components/Chatbot/Inspector/Inspector.scss';
import LinkInspector from 'src/components/Chatbot/Inspector/LinkInspector';
import LabelInspector from 'src/components/Chatbot/Inspector/LabelInspector';
import eventBusServiceContext from 'src/services/event-bus-service.context';
import { SharedEvents } from 'src/rappid/controller';
import { ShapeTypesEnum } from 'src/rappid/shapes/app.shapes';

const Inspector = (): ReactElement => {
    const [cell, setCell] = useState<dia.Cell>(null);
    const [subscriptions] = useState(new Subscription());
    const eventBusService = useContext(eventBusServiceContext);

    const setSelection = (selection: dia.Cell[]): void => {
        const [selectedCell = null] = selection;
        setCell(selectedCell);
    };

    useEffect(() => {
        subscriptions.add(
            eventBusService.on(SharedEvents.SELECTION_CHANGED, (selection: dia.Cell[]) => setSelection(selection))
        );
        return () => {
            subscriptions.unsubscribe();
        };
    }, [eventBusService, subscriptions]);

    const chooseInspector = (): ReactElement => {
        switch (cell.get('type')) {
            case ShapeTypesEnum.MESSAGE:
                return <MessageInspector cell={cell as shapes.app.Message}/>
            case ShapeTypesEnum.LINK:
                return <LinkInspector cell={cell as dia.Link}/>;
            case ShapeTypesEnum.FLOWCHART_START:
                return <LabelInspector cell={cell}/>;
            case ShapeTypesEnum.FLOWCHART_END:
                return <LabelInspector cell={cell}/>;
            default:
                return;
        }
    };

    const emptyInspector = (): ReactElement => {
        return (
            <>
                <h1>Component</h1>
                <label htmlFor="label">Label</label>
                <input disabled id="label"/>
            </>
        );
    };

    return (
        <div className={'chatbot-inspector ' + (!cell ? 'disabled-chatbot-inspector' : '')}>
            {
                cell ? chooseInspector() : emptyInspector()
            }
        </div>
    );
};

export default Inspector;
