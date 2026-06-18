interface PerfTimelineEntry {
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
declare type PerfTimelineDataById = Record<string, PerfTimelineEntry[]>;
declare type GetterSetter<Getter, Setter> = <Param extends Setter | undefined = undefined>(param?: Param) => Param extends undefined ? Setter : Getter;
interface Timeline<T extends Data> {
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
interface Data {
    name: string;
    start: Date | string;
    end?: Date | string;
    group?: string;
    track?: number;
    perfTimeline?: boolean;
}
declare type Color<T extends Data> = (data: T) => string;
declare type Text<T extends Data> = (data: T) => string;
declare type Click<T extends Data> = (event: PointerEvent, data: T) => void;
declare type Highlight<T extends Data> = (data: T) => boolean;
declare type Tooltips<T extends Data> = (domElement: SVGGElement, visible: boolean, data: T) => void;
declare type Margin = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};

declare function timeline(): any;

export { Click, Color, Data, GetterSetter, Highlight, Margin, PerfTimelineDataById, PerfTimelineEntry, Text, Timeline, Tooltips, timeline };
