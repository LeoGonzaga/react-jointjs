/*! JointJS+ v3.6.3 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2022 client IO

 2023-05-08 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_v2.txt
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


import { dia, elementTools, linkTools, shapes } from '@clientio/rappid';

import { RemoveTool } from './remove.tool';

export function addCellTools(cellView: dia.CellView): void {
    if (cellView.model.isLink()) {
        addLinkTools(cellView as dia.LinkView);
    } else {
        addElementTools(cellView as dia.ElementView);
    }
}

export function addElementTools(elementView: dia.ElementView): void {
    const element = elementView.model as shapes.app.Base;
    const padding = element.getBoundaryPadding();
    const toolsView = new dia.ToolsView({
        tools: [
            new elementTools.Boundary({
                useModelGeometry: true,
                padding
            }),
            new RemoveTool({
                x: '100%',
                offset: {
                    x: padding.right,
                    y: -padding.top
                }
            })
        ]
    });
    elementView.addTools(toolsView);
}

export function addLinkTools(linkView: dia.LinkView): void {
    const toolsView = new dia.ToolsView({
        tools: [
            new linkTools.Vertices(),
            new linkTools.SourceArrowhead(),
            new linkTools.TargetArrowhead(),
            new linkTools.Boundary({ padding: 15 }),
            new RemoveTool({ offset: -20, distance: 40 })
        ]
    });
    linkView.addTools(toolsView);
}
