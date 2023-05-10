/*! JointJS+ v3.6.3 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2022 client IO

 2023-05-08 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_v2.txt
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


import { dia, ui, shapes } from '@clientio/rappid';

import RappidService from 'src/services/rappid.service';
import { SharedEvents } from 'src/rappid/controller';
import { addCellTools } from 'src/rappid/tools';
import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from 'src/theme';
import { stencilConfig } from 'src/rappid/config/stencil.config';
import { ShapeTypesEnum } from 'src/rappid/shapes/app.shapes';
import { PADDING_L } from 'src/theme';

// Selection

export function setSelection(service: RappidService, selection: dia.Cell[]): void {
    const { paper, selection: previousSelection, eventBusService } = service;
    paper.removeTools();
    previousSelection.forEach(cell => {
        const cellView = cell.findView(paper);
        if (cellView) {
            cellView.vel.removeClass('selected');
        }
    });
    service.selection = selection;
    selection.forEach(cell => {
        const cellView = cell.findView(paper);
        if (cellView) {
            cellView.vel.addClass('selected');
            addCellTools(cellView);
        }
    });
    eventBusService.emit(SharedEvents.SELECTION_CHANGED, selection);
}

export function removeSelection(service: RappidService) {
    const { selection, graph } = service;
    if (selection.length === 0) return;
    graph.removeCells(selection);
}

// Zooming

export function zoomAtPoint(service: RappidService, deltaZoom: number, x: number, y: number): void {
    const { scroller } = service;
    scroller.zoom(deltaZoom, {
        min: ZOOM_MIN,
        max: ZOOM_MAX,
        grid: ZOOM_STEP,
        ox: x,
        oy: y
    });
}

export function zoomToFit(service: RappidService) {
    const { scroller } = service;
    scroller.zoomToFit({
        minScale: ZOOM_MIN,
        maxScale: ZOOM_MAX,
        scaleGrid: ZOOM_STEP,
        useModelGeometry: true,
        padding: PADDING_L
    });
}

export function zoomIn(service: RappidService) {
    const { scroller } = service;
    scroller.zoom(ZOOM_STEP, {
        min: ZOOM_MIN,
        max: ZOOM_MAX,
    });
}

export function zoomOut(service: RappidService) {
    const { scroller } = service;
    scroller.zoom(-ZOOM_STEP, {
        min: ZOOM_MIN,
        max: ZOOM_MAX,
    });
}

// Import / Export

export function exportToPNG(service: RappidService): void {
    const { paper } = service;
    paper.hideTools();
    // Dump all views that are not in the viewport
    paper.dumpViews();
    paper.toPNG((dataURL: string): void => {
        paper.showTools();
        openImageDownloadDialog(service, dataURL);
    }, {
        padding: 10,
        useComputedStyles: false
    });
}

export function openImageDownloadDialog(service: RappidService, dataURL: string, fileName: string = 'Rappid'): void {
    const { keyboard, controllers } = service;
    const { keyboard: keyboardCtrl } = controllers;
    keyboardCtrl.stopListening();
    const lightbox = new ui.Lightbox({
        image: dataURL,
        downloadable: true,
        fileName
    });
    lightbox.on('action:close', () => {
        keyboardCtrl.startListening();
    });
    lightbox.listenTo(keyboard, 'escape', () => {
        keyboardCtrl.startListening();
        lightbox.close();
    });
    lightbox.open();
}

export function importGraphFromJSON(service: RappidService, json: any): void {
    setSelection(service, []);
    const { graph, history } = service;
    const shapeTypes = Object.values(ShapeTypesEnum);
    history.reset();
    try {
        if (json.cells.some((cell: any) => !shapeTypes.includes(cell.type))) {
            throw new Error('Invalid JSON: Unknown Cell Type');
        }
        graph.fromJSON(json);
    } catch (e) {
        // Invalid JSON format
    }
}

// Stencil

export function loadStencilShapes(service: RappidService): void {
    const { stencil } = service;
    const stencilShapes = stencilConfig.shapes.map(shape => new shapes.stencil[shape.name](shape));
    stencil.load(stencilShapes);
}

// Paper

export function updateLinksRouting(service: RappidService): void {
    const { paper, graph } = service;
    graph.getLinks().forEach(link => {
        const linkView = link.findView(paper) as dia.LinkView;
        if (linkView) {
            linkView.requestConnectionUpdate();
        }
    });
}

// History

export function undoAction(service: RappidService) {
    const { history } = service;
    history.undo();
}

export function redoAction(service: RappidService) {
    const { history } = service;
    history.redo();
}
