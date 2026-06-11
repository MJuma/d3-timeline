import type { Selection } from 'd3-selection';
export interface PerfTimelineEntry {
    start: number;
    end: number;
    taskTime: number;
    visualTime: number;
    changeDetectionTime: number;
    browserRenderTime: number;
    taskCount: number;
    visualCount: number;
    changeDetectionCount: number;
    browserRenderCount: number;
}
export declare type PerfTimelineDataById = Record<string, PerfTimelineEntry[]>;
export declare type Foo<S, D> = <T extends S | undefined = undefined>(someInput?: T) => T extends undefined ? S : D;
export declare type GetterSetter<Getter, Setter> = <Param extends Setter | undefined = undefined>(param?: Param) => Param extends undefined ? Setter : Getter;
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
    perfData: GetterSetter<Timeline<Data>, PerfTimelineDataById>;
    perfHeight: GetterSetter<Timeline<T>, number>;
    render(domElement: HTMLElement): Timeline<T>;
}
export interface Data {
    name: string;
    start: Date | string;
    end?: Date | string;
    group?: string;
    track?: number;
    perfTimeline?: boolean;
}
export interface Options<T extends Data = Data> {
    outerWidth: number;
    outerHeight: number;
    brushHeight: number;
    axisHeight: number;
    perfTimelineHeight: number;
    perfTimelineData: PerfTimelineDataById;
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
export declare type Color<T extends Data> = (data: T) => string;
export declare type Text<T extends Data> = (data: T) => string;
export declare type Click<T extends Data> = (event: PointerEvent, data: T) => void;
export declare type Highlight<T extends Data> = (data: T) => boolean;
export declare type Tooltips<T extends Data> = (domElement: SVGGElement, visible: boolean, data: T) => void;
export declare type Margin = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
export declare type ChartContainer = {
    outerContainer: Selection<HTMLDivElement, unknown, null, undefined>;
    container: Selection<HTMLDivElement, unknown, null, undefined>;
};
