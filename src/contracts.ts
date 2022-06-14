import type { Selection, } from 'd3-selection';

export type Foo<S, D> = <T extends S | undefined = undefined>(someInput?: T) => T extends undefined ? S : D;
export type GetterSetter<Getter, Setter> = <Param extends Setter | undefined = undefined>(param?: Param) => Param extends undefined ? Setter : Getter;

export interface Timeline<T extends Data> {
    width: GetterSetter<Timeline<T>, number>;
    height: GetterSetter<Timeline<T>, number>;
    margin: GetterSetter<Timeline<T>, Margin>;
    backgroundColor: GetterSetter<Timeline<T>, string>;
    gridColor: GetterSetter<Timeline<T>, string>;
    nodeColor: (color: Color<T>) => Timeline<T>;
    textColor: (color: Color<T>) => Timeline<T>;
    text: (text: Text<T>) => Timeline<T>;
    tooltips: GetterSetter<Timeline<T>, Tooltips<T> | boolean>;
    xAxis: GetterSetter<Timeline<T>, boolean>;
    xBrush: GetterSetter<Timeline<T>, boolean>;
    click: (click: Click<T>) => Timeline<T>;
    highlight: (click: Highlight<T>) => Timeline<T>;
    data: GetterSetter<Timeline<T>, T[]>;
    render(domElement: HTMLElement): Timeline<T>;
}

export interface Data {
    name: string;
    start: Date | string;
    end?: Date | string;
    group?: string;
    track?: number;
}

export interface Options<T extends Data = Data> {
    outerWidth: number;
    outerHeight: number;
    brushHeight: number;
    axisHeight: number;
    width: number;
    height: number;
    margin: Margin;
    rowHeight: number;
    backgroundColor: string;
    gridColor: string;
    nodeColor?: Color<T>;
    textColor?: Color<T>;
    text?: Text<T>;
    showTooltips: boolean;
    tooltips?: Tooltips<T>;
    xAxis: boolean;
    xBrush: boolean;
    data: T[];
    click?: Click<T>;
    highlight?: Highlight<T>;
}

export type Color<T extends Data> = (data: T) => string;
export type Text<T extends Data> = (data: T) => string;
export type Click<T extends Data> = (event: PointerEvent, data: T) => void;
export type Highlight<T extends Data> = (data: T) => boolean;
export type Tooltips<T extends Data> = (domElement: SVGGElement, visible: boolean, data: T) => void;
export type Margin = { top: number, right: number, bottom: number, left: number };

export type ChartContainer = {
    outerContainer: Selection<HTMLDivElement, unknown, null, undefined>;
    container: Selection<HTMLDivElement, unknown, null, undefined>;
}
