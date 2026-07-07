import { axisBottom } from 'd3-axis';
import { extent, group } from 'd3-array';
import { brushX } from 'd3-brush';
import { scaleOrdinal, scaleTime } from 'd3-scale';
import { schemeAccent } from 'd3-scale-chromatic';
import { select } from 'd3-selection';

import type { InternMap } from 'd3-array';
import type { D3BrushEvent } from 'd3-brush';
import type { ScaleTime } from 'd3-scale';
import type { BaseType, Selection } from 'd3-selection';

import type { ChartContainer, Click, Color, Data, GetterSetter, Highlight, Margin, Options, Text, Timeline, Tooltips } from './contracts';

export { Click, Color, Data, GetterSetter, Highlight, Margin, Text, Timeline, Tooltips };

const colors = scaleOrdinal(schemeAccent);

export function timeline<T extends Data = Data>() {
    const outerWidth = 960;
    const outerHeight = 500;
    const margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
    };
    const width = outerWidth - margin.left - margin.right;
    const height = outerHeight - margin.top - margin.bottom;
    const options: Options = {
        outerWidth: outerWidth,
        outerHeight: outerHeight,
        brushHeight: 50,
        axisHeight: 20,
        width: width,
        height: height,
        margin: margin,
        rowHeight: 20,
        backgroundColor: '#FFFFFF',
        gridColor: '#EAEAEA',
        showTooltips: false,
        xAxis: false,
        xBrush: false,
        data: [],
    };
    let chartContainer: ChartContainer;
    let timelineXScale: ScaleTime<number, number>;
    let brushXScale: ScaleTime<number, number>;

    // Rebuild the main timeline scale, re-applying any active brush zoom (options.currentDomain) so live
    // data or size updates keep the user's selection instead of snapping back to the full extent. The brush
    // band scale (brushXScale) is intentionally left at the full extent so the whole range stays brushable.
    const rebuildTimelineXScale = (): void => {
        timelineXScale = createXScale(options);
        if (options.currentDomain && options.currentDomain.length === 2) {
            timelineXScale.domain(options.currentDomain);
        }
    };

    const timeline: Timeline<T> = {
        width: function(width?: number) {
            if (typeof width === 'number') {
                options.outerWidth = width;
                options.width = options.outerWidth - options.margin.left - options.margin.right;

                if (chartContainer) {
                    rebuildTimelineXScale();
                    brushXScale = createXScale(options);
                    updateChartContainer(chartContainer, options);
                    updateChart(chartContainer.container, timelineXScale, brushXScale, options);
                }
                return timeline;
            } else {
                return options.width;
            }
        } as GetterSetter<Timeline<T>, number>,
        height: function(height?: number) {
            if (typeof height === 'number') {
                options.outerHeight = height;
                options.height = options.outerHeight - options.margin.top - options.margin.bottom;;

                if (chartContainer) {
                    updateChartContainer(chartContainer, options);
                    updateChart(chartContainer.container, timelineXScale, brushXScale, options);
                }
                return timeline;
            } else {
                return options.height;
            }
        } as GetterSetter<Timeline<T>, number>,
        margin: function(margin?: Margin) {
            if (typeof margin === 'object') {
                options.margin = margin;
                options.width = options.outerWidth - options.margin.left - options.margin.right;
                options.height = options.outerHeight - options.margin.top - options.margin.bottom;

                if (chartContainer) {
                    rebuildTimelineXScale();
                    updateChartContainer(chartContainer, options);
                    updateChart(chartContainer.container, timelineXScale, brushXScale, options);
                }
                return timeline;
            } else {
                return options.margin;
            }
        } as GetterSetter<Timeline<T>, Margin>,
        backgroundColor: function(color?: string) {
            if (typeof color === 'string') {
                options.backgroundColor = color;

                if (chartContainer) {
                    updateChartContainer(chartContainer, options);
                }
                return timeline;
            } else {
                return options.backgroundColor;
            }
        } as GetterSetter<Timeline<T>, string>,
        gridColor: function(color?: string) {
            if (typeof color === 'string') {
                options.gridColor = color;

                if (chartContainer) {
                    updateChart(chartContainer.container, timelineXScale, brushXScale, options);
                }
                return timeline;
            } else {
                return options.backgroundColor;
            }
        } as GetterSetter<Timeline<T>, string>,
        nodeColor: function(color: Color<T>) {
            options.nodeColor = color;

            if (chartContainer) {
                updateChartContainer(chartContainer, options);
            }
            return timeline;
        },
        textColor: function(color: Color<T>) {
            options.textColor = color;

            if (chartContainer) {
                updateChartContainer(chartContainer, options);
            }
            return timeline;
        },
        text: function(text: Text<T>) {
            options.text = text;

            if (chartContainer) {
                updateChartContainer(chartContainer, options);
            }
            return timeline;
        },
        tooltips: function(tooltips?: Tooltips<T> | boolean) {
            if (typeof tooltips === 'boolean') {
                options.showTooltips = tooltips;

                if (chartContainer) {
                    updateChartContainer(chartContainer, options);
                }
                return timeline;
            } else if (typeof tooltips === 'function') {
                options.tooltips = tooltips;

                if (chartContainer) {
                    updateChartContainer(chartContainer, options);
                }
                return timeline;
            } else {
                return options.showTooltips;
            }
        } as GetterSetter<Timeline<T>, Tooltips<T> | boolean>,
        xAxis: function (xAxis?: boolean) {
            if (typeof xAxis === 'boolean') {
                options.xAxis = xAxis;

                if (chartContainer) {
                    updateChart(chartContainer.container, timelineXScale, brushXScale, options);
                }
                return timeline;
            } else {
                return options.xAxis;
            }
        } as GetterSetter<Timeline<T>, boolean>,
        xBrush: function (xBrush?: boolean) {
            if (typeof xBrush === 'boolean') {
                options.xBrush = xBrush;

                if (chartContainer) {
                    updateChart(chartContainer.container, timelineXScale, brushXScale, options);
                }
                return timeline;
            } else {
                return options.xBrush;
            }
        } as GetterSetter<Timeline<T>, boolean>,
        click: function (click: Click<T>) {
            if (click) {
                options.click = click;

                if (chartContainer) {
                    updateChart(chartContainer.container, timelineXScale, brushXScale, options);
                }
            }

            return timeline;
        },
        highlight: function (highlight: Highlight<T>) {
            if (highlight) {
                options.highlight = highlight;

                if (chartContainer) {
                    updateChart(chartContainer.container, timelineXScale, brushXScale, options);
                }
            }

            return timeline;
        },
        data: function (data?: T[]) {
            if (!!data && Array.isArray(data)) {
                options.data = data;

                if (chartContainer) {
                    rebuildTimelineXScale();
                    brushXScale = createXScale(options);
                    updateChart(chartContainer.container, timelineXScale, brushXScale, options);
                }
                return timeline;
            } else {
                return options.data;
            }
        } as GetterSetter<Timeline<T>, T[]>,
        render: function (domElement: HTMLElement) {
            if (!chartContainer) {
                chartContainer = createChartContainer(domElement, options);
            }

            if (options.showTooltips && select('#timeline-tooltip').empty()) {
                createTooltipHost();
            }

            rebuildTimelineXScale();
            brushXScale = createXScale(options);
            updateChart(chartContainer.container, timelineXScale, brushXScale, options);

            return timeline;
        },
    };

    return timeline;
}

function createTooltipHost(): void {
    // Create tooltip host
    select('body')
        .append('div')
        .attr('id', 'timeline-tooltip')
        .style('position', 'absolute')
        .style('color', 'black')
        .style('background-color', '#FFFFEE')
        .style('border', '1px solid')
        .style('padding', '4px')
        .style('visibility', 'hidden');
}

function createChartContainer(domElement: HTMLElement, options: Options): ChartContainer {
    // Create outer container with margin
    const outerContainer = select(domElement)
        .append('div')
        .attr('id', 'timeline-outer-container');

    // Create chart container
    const container = outerContainer
        .append('div')
        .attr('id', 'timeline-container');

    // Create group container
    container
        .append('div')
        .attr('id', 'timeline-groups');

    const chartContainer = { outerContainer, container };
    updateChartContainer(chartContainer, options);
    return chartContainer;
}

function updateChartContainer(chartContainer: ChartContainer, options: Options): void {
    const { outerContainer, container } = chartContainer;

    outerContainer
        .style('width', `${options.outerWidth}px`)
        .style('height', `${options.outerHeight}px`)
        .style('margin', `${options.margin.top}px ${options.margin.right}px ${options.margin.bottom}px ${options.margin.left}px`);

    container
        .style('width', `${options.width}px`)
        .style('height', `${options.height}px`)
        .style('background-color', options.backgroundColor);
}

function createXScale(options: Options): ScaleTime<number, number> {
    // Clamp the width so a momentarily tiny/zero container (e.g. before layout settles) can't produce a
    // negative range end, which would invert the scale and emit a negative-width rect.
    const rangeEnd = Math.max(options.width, 64) - 16;
    return scaleTime()
        .domain(extent([...options.data.map(d => new Date(d.start)), ...options.data.map(d => new Date(d.end))]))
        .range([16, rangeEnd]);
}

function normalizeGroupName(group: string): string {
    return (group || 'none').toLocaleLowerCase().replaceAll(' ', '-');
}

function getGroupContainerId(group: string): string {
    return `group-${normalizeGroupName(group)}-container`;
}

function getGroupSvgId(group: string): string {
    return `group-${normalizeGroupName(group)}-svg`;
}

function updateChart(chart: Selection<HTMLDivElement, unknown, null, undefined>, timelineXScale: ScaleTime<number, number>, brushXScale: ScaleTime<number, number>, options: Options): void {
    const groupMap: InternMap<string, Data[]> = group(options.data, d => d.group);

    updateGroups(chart, groupMap, options);
    updateGridlines(chart, timelineXScale, groupMap, options);
    updateNodes(chart, timelineXScale, groupMap, options);
    updateAxis(chart, timelineXScale, options);
    updateBrush(chart, brushXScale, timelineXScale, groupMap, options);
}

function updateGroups(chart: Selection<HTMLDivElement, unknown, null, undefined>, groupMap: InternMap<string, Data[]>, options: Options): void {
    const axisHeight = options.xAxis ? options.axisHeight : 0;
    const brushHeight = options.xBrush ? options.brushHeight + axisHeight : 0;
    const groupHeight = (options.height - brushHeight - axisHeight) / (groupMap.size || 1);

    chart
        .select('#timeline-groups')
        .selectAll('div')
        .data(groupMap)
        .join(
            function enter(enter) {
                // Create group container
                const group = enter
                    .append('div')
                        .attr('id', g => getGroupContainerId(g[0]))
                        .style('border-bottom', (_, index, array) => array.length - 1 === index ? '' : '1px solid')
                        .style('width', '100%')
                        .style('height', `${groupHeight}px`)
                        .style('overflow-y', 'auto')
                        .style('overflow-x', 'hidden');

                    
                // Create group svg
                const svg = group
                    .append('svg')
                        .attr('id', g => getGroupSvgId(g[0]))
                        .attr('width', '100%')
                        .attr('height', (g) => `${Math.max(groupHeight, g[1].length * options.rowHeight)}px`);

                // Add group name
                svg
                    .append('g')
                    .attr('class', 'group-label')
                    .append('text')
                    .style('font', '11px sans-serif')
                    .attr('transform', 'translate(0, 50) rotate(270)')
                    .attr('x', (groupHeight / 2) * -1)
                    .attr('y', 12)
                    .text((g) => g[0])
                    .each(function() {
                        const self = select(this);
                        let textLength = self.node().getComputedTextLength();
                        let text = self.text();
                        while (textLength > (groupHeight - 2 * 4) && text.length > 0) {
                            text = text.slice(0, -1);
                            self.text(text + '...');
                            textLength = self.node().getComputedTextLength();
                        }
                    });

                // Add gridlines group
                svg
                    .append('g')
                    .attr('class', 'gridlines');

                return svg;
            },
            function update(update) {
                return update
                    .style('border-bottom', (_, index, array) => array.length - 1 === index ? '' : '1px solid')
                    .style('height', `${groupHeight}px`)
                    .selectAll('svg')
                    .attr('height', (g) => `${Math.max(groupHeight, g[1].length * options.rowHeight)}px`) as Selection<SVGElement, [string, Data[]], HTMLDivElement, unknown>;
            },
            function exit(exit) {
                return exit.remove();
            }
        );
}

function updateGridlines(chart: Selection<HTMLDivElement, unknown, null, undefined>, timelineXScale: ScaleTime<number, number>, groupMap: InternMap<string, Data[]>, options: Options): void {
    const axisHeight = options.xAxis ? options.axisHeight : 0;
    const brushHeight = options.xBrush ? options.brushHeight + axisHeight : 0;
    const groupHeight = (options.height - brushHeight - axisHeight) / (groupMap.size || 1);

    for (const group of groupMap.keys()) {
        const groupId = `#${getGroupSvgId(group)}`;

        chart
            .select(groupId)
            .select('.gridlines')
            .selectAll('line')
            .data(timelineXScale.ticks(20), (d: Date) => d.getTime())
            .join(
                function enter(enter) {
                    return enter
                        .append('line')
                        .attr('y1', 0)
                        .attr('shape-rendering', 'crispEdges')
                        .attr('stroke-width', '1px').attr('x1', d => timelineXScale(d))
                        .attr('x2', d => timelineXScale(d))
                        .attr('y2', Math.max(groupHeight, groupMap.get(group).length * options.rowHeight))
                        .attr('stroke', options.gridColor);
                },
                function update(update) {
                    return update
                        .attr('x1', d => timelineXScale(d))
                        .attr('x2', d => timelineXScale(d))
                        .attr('y2', Math.max(groupHeight, groupMap.get(group).length * options.rowHeight))
                        .attr('stroke', options.gridColor);
                },
                function exit(exit) {
                    return exit.remove();
                },
            );
    }
}

function updateNodes(chart: Selection<HTMLDivElement, unknown, null, undefined>, timelineXScale: ScaleTime<number, number>, groupMap: InternMap<string, Data[]>, options: Options): void {
    const nodeHeight = options.rowHeight * 0.8;

    for (const group of groupMap.keys()) {
        const groupId = `#${getGroupSvgId(group)}`;
        const groupData = options.data.filter(d => d.group === group);

        // Add svg group for each data point in dataset group to svg
        chart
            .select(groupId)
            .selectAll('g.datapoint')
            .data(groupData, (d: Data) => d.start.toString())
            .join(
                function enter(enter) {
                    return enter
                        .append('g')
                        .attr('class', (d) => d.end || d.start === d.end ? 'datapoint interval' : 'datapoint instant')
                        .each(function(d) {
                            const node = select(this);
                            if (d.end || d.start === d.end) {
                                // Add rectangle for each interval data point
                                node
                                    .append('rect')
                                    .attr('height', nodeHeight);
                                node
                                    .append('text')
                                    .style('font', '10px sans-serif')
                                    .attr('x', 4)
                                    .attr('y', 12)
                                    .text((d: Data) => options.text ? options.text(d) : d.name);
                            } else {
                                // Add circle for each instant data point
                                node
                                    .append('circle')
                                    .attr('cx', nodeHeight / 2)
                                    .attr('cy', nodeHeight / 2)
                                    .attr('r', 5);
                                node
                                    .append('text')
                                    .style('font', '10px sans-serif')
                                    .attr('x', 16)
                                    .attr('y', 12)
                                    .text((d: Data) => options.text ? options.text(d) : d.name);
                            }
                        });
                },
                function update(update) {
                    updateNodeInternal(chart, timelineXScale, groupMap, options);
                    return update;
                },
                function exit(exit) {
                    return exit.remove();
                }
            );
    }
}

function updateNodeInternal(chart: Selection<HTMLDivElement, unknown, null, undefined>, timelineXScale: ScaleTime<number, number>, groupMap: InternMap<string, Data[]>, options: Options): void {
    for (const group of groupMap.keys()) {
        const groupId = `#${getGroupSvgId(group)}`;

        const svg = chart
            .select(groupId);

        const svgGroups = chart
            .select(groupId)
            .selectAll<SVGGElement, Data>('g.datapoint');

        // Set x,y for each data point
        svgGroups
            .attr('transform', (d: Data, i: number) => `translate(${timelineXScale(new Date(d.start).getTime())}, ${(d.track ?? i) * options.rowHeight})`);

        // Set width and color for each interval data point
        const intervalNodes = svg
            .selectAll('.interval');
        intervalNodes
            .selectAll('rect')
            // Clamp to >= 0: when a data point's end is effectively equal to its start (e.g. a sub-millisecond
            // interval), floating-point rounding can make end map just left of start, yielding a tiny negative
            // width that SVG rejects ("<rect> attribute width: A negative value is not valid").
            .attr('width', (d: Data) => Math.max(0, timelineXScale(new Date(d.end)) - timelineXScale(new Date(d.start))))
            .style('fill', (d: Data) => options.nodeColor ? options.nodeColor(d) : colors(d.start.toString()))
            .style('fill-opacity', (d: Data) => options.highlight && options.highlight(d) !== undefined ? options.highlight(d) ? 1 : 0.2 : 1)
            .style('stroke', (d: Data) => options.highlight && options.highlight(d) !== undefined ? options.highlight(d) ? 'none' : 'black' : 'none');

        // Set color for each instant data point
        const instantNodes = svg
            .selectAll('.instant');
        instantNodes
            .selectAll('circle')
            .style('fill', (d: Data) => options.nodeColor ? options.nodeColor(d) : colors(d.start.toString()))
            .style('fill-opacity', (d: Data) => options.highlight && options.highlight(d) !== undefined? options.highlight(d) ? 1 : 0.5 : 1)
            .style('stroke', (d: Data) => options.highlight && options.highlight(d) !== undefined? options.highlight(d) ? 'none' : 'black' : 'none');

        // Set text color
        intervalNodes
            .selectAll('text')
            .style('fill', (d: Data) => options.textColor ? options.textColor(d) : 'black');
        instantNodes
            .selectAll('text')
            .style('fill', (d: Data) => options.textColor ? options.textColor(d) : 'black');

        updateTooltips(svgGroups, groupMap, options);
        updateClickHandler(svgGroups, options, chart, timelineXScale, groupMap);
    }
}

function updateTooltips(svgGroups: Selection<SVGGElement, Data, BaseType, unknown>, groupMap: InternMap<string, Data[]>, options: Options): void {
    const axisHeight = options.xAxis ? options.axisHeight : 0;
    const brushHeight = options.xBrush ? options.brushHeight + axisHeight : 0;
    const groupHeight = (options.height - brushHeight - axisHeight) / (groupMap.size || 1);

    if (options.showTooltips) {
        const tooltip = select('#timeline-tooltip');

        svgGroups.on('mouseover', (event, d: Data) => {
            const x = event.pageX < options.width / 2
                ? event.pageX + 10
                : event.pageX - 110;
            const y = event.pageY < groupHeight / 2
                ? event.pageY + 30
                : event.pageY - 30;

            tooltip
                .html(() => `${d.name}`)
                .style('top', `${y}px`)
                .style('left', `${x}px`)
                .style('visibility', 'visible');
        });

        svgGroups.on('mouseout', () => tooltip.style('visibility', 'hidden'));
    } else if (options.tooltips && typeof options.tooltips === 'function') {
        svgGroups.on('mouseover', function (_, d: Data) { options.tooltips(this, true, d); });
        svgGroups.on('mouseout', function (_, d: Data) { options.tooltips(this, false, d); });
    }
}

function updateClickHandler(svgGroups: Selection<SVGGElement, Data, BaseType, unknown>, options: Options, chart: Selection<HTMLDivElement, unknown, null, undefined>, timelineXScale: ScaleTime<number, number>, groupMap: InternMap<string, Data[]>): void {
    if (options.click) {
        svgGroups.on('.click', null);
        svgGroups.attr('cursor', 'pointer');
        svgGroups.on('click', function(event: PointerEvent, d: Data) {
            options.click(event, d);
            updateNodeInternal(chart, timelineXScale, groupMap, options);
        });
    } else {
        svgGroups.attr('cursor', 'auto');
        svgGroups.on('.click', null);
    }
}

// Build a single, consistent label format for every axis tick, chosen from the spacing between ticks. d3's
// default time axis mixes granularities (e.g. "11:25", then ":30", then "11:26"), which is ambiguous - a
// bare ":30" doesn't say which minute it belongs to. Using one format for all ticks makes every label
// self-describing.
function createTimeAxisFormat(scale: ScaleTime<number, number>, tickCount: number): (date: Date) => string {
    const ticks = scale.ticks(tickCount);
    const domain = scale.domain();
    const stepMs = ticks.length >= 2
        ? Math.abs(ticks[1].getTime() - ticks[0].getTime())
        : Math.abs(domain[domain.length - 1].getTime() - domain[0].getTime());
    const pad = (value: number): string => (value < 10 ? '0' : '') + value;

    if (stepMs < 60_000) {
        // Sub-minute ticks: include seconds so e.g. 30s steps read 11:25:00, 11:25:30, 11:26:00.
        return (date) => `${date.getHours()}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }
    if (stepMs < 86_400_000) {
        // Minute-to-hour ticks: hours and minutes are enough.
        return (date) => `${date.getHours()}:${pad(date.getMinutes())}`;
    }
    // Day-or-longer ticks: include the date so labels stay unambiguous across days.
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return (date) => `${months[date.getMonth()]} ${pad(date.getDate())} ${date.getHours()}:${pad(date.getMinutes())}`;
}

function updateAxis(chart: Selection<HTMLDivElement, unknown, null, undefined>, timelineXScale: ScaleTime<number, number>, options: Options): void {
    if (options.xAxis) {
        let axisContainer = chart
            .select('#timeline-x-axis');

        // Create container during first render
        if (axisContainer.empty()) {
            axisContainer = chart
                .append('div')
                .attr('id', 'timeline-x-axis')
                .style('width', '100%')
                .style('height', `${options.axisHeight}px`);
        }

        let axisSvg = axisContainer
            .select('#timeline-x-axis-svg');

        // Remove old Axis Svg
        if (!axisSvg.empty()) {
            axisSvg.remove();
        }

        // Add Axis if data exists
        if (options.data.length > 0) {
            // Create X-Axis
            const xAxis = axisBottom(timelineXScale)
                .ticks(10)
                .tickFormat(createTimeAxisFormat(timelineXScale, 10));
    
            // Add Axis Svg to chart
            axisContainer
                .append('svg')
                    .attr('id', 'timeline-x-axis-svg')
                    .attr('width', '100%')
                .call(xAxis);
        }
    }
}

// State stored on the brush <svg> node so the brush behavior and the user's selection survive data updates.
// Recreating the brush on every data change reset the selection (it jumped/grew as live data streamed in),
// so instead we keep it and only refresh the scales the gesture handler reads (ctx), rebuilding the behavior
// only when the brushable extent width actually changes.
interface BrushContext {
    brushXScale: ScaleTime<number, number>;
    timelineXScale: ScaleTime<number, number>;
    chart: Selection<HTMLDivElement, unknown, null, undefined>;
    groupMap: InternMap<string, Data[]>;
    options: Options;
}

type BrushStateNode = SVGSVGElement & {
    __brushCtx?: BrushContext;
    __brushExtentEnd?: number;
};

function updateBrush(chart: Selection<HTMLDivElement, unknown, null, undefined>, brushXScale: ScaleTime<number, number>, timelineXScale: ScaleTime<number, number>, groupMap: InternMap<string, Data[]>, options: Options): void {
    if (options.xBrush) {
        const brushHeight = options.brushHeight;
        const rowHeight = Math.min(brushHeight / options.data.length, 20);
        const nodeHeight = rowHeight * 0.8;

        let brushContainer = chart
            .select('#brush-container');

        let brushAxisSvg = chart
            .select('#brush-x-axis-svg');

        // Create brush container
        if (brushContainer.empty()) {
            brushContainer = chart
                .append('div')
                .attr('id', 'brush-container')
                .style('width', '100%')
                .style('height', `${brushHeight}px`);
        }

        let brushSvg = brushContainer
            .select('#brush-svg');

        // Remove brush if data is empty
        if (!brushSvg.empty() && options.data.length < 1) {
            brushSvg.remove();

            if (!brushAxisSvg.empty()) {
                brushAxisSvg.remove()
            }

            return;
        }

        if (brushSvg.empty()) {
            // Create brush svg
            brushSvg = brushContainer
                .append('svg')
                .attr('id', 'brush-svg')
                .attr('width', '100%')
                .attr('height', `${options.data.length * rowHeight}px`);
        }

        const brushGroups = brushSvg
            .selectAll('g.datapoint')
            .data(options.data, (d: Data) => d.start.toString());

        brushGroups.join(
            function enter(enter) {
                // Add svg group for each data point in dataset group to svg
                const groups = enter
                    .append('g')
                    .attr('class', (d) => d.end ? 'datapoint interval' : 'datapoint instant')
                    .attr('transform', (d: Data, i: number) => `translate(${brushXScale(new Date(d.start).getTime())}, ${i * rowHeight})`);

                // Add rectangle for each interval data point
                groups
                    .filter((d: Data) => !!d.end)
                    .append('rect')
                    .attr('height', nodeHeight)
                    // Clamp to >= 0 so a near-zero interval can't produce a negative width (see updateNodeInternal).
                    .attr('width', (d: Data) => Math.max(0, brushXScale(new Date(d.end)) - brushXScale(new Date(d.start))))
                    .style('fill', (d: Data) => options.nodeColor ? options.nodeColor(d) : colors(d.start.toString()));

                // Add circle for each instant data point
                groups
                    .filter((d: Data) => !d.end)
                    .append('circle')
                    .attr('cx', nodeHeight / 2)
                    .attr('cy', nodeHeight / 2)
                    .attr('r', 2)
                    .style('fill', (d: Data) => options.nodeColor ? options.nodeColor(d) : colors(d.start.toString()));

                return groups;
            },
            function update(update) {
                // Update x,y for each data point
                update
                    .attr('transform', (d: Data, i: number) => `translate(${brushXScale(new Date(d.start).getTime())}, ${i * rowHeight})`);

                // Update width and color for each interval data point
                update
                    .selectAll('rect')
                    // Clamp to >= 0 so a near-zero interval can't produce a negative width (see updateNodeInternal).
                    .attr('width', (d: Data) => Math.max(0, brushXScale(new Date(d.end)) - brushXScale(new Date(d.start))))
                    .style('fill', (d: Data) => options.nodeColor ? options.nodeColor(d) : colors(d.start.toString()));

                // Update color for each instant data point
                update
                    .selectAll('circle')
                    .style('fill', (d: Data) => options.nodeColor ? options.nodeColor(d) : colors(d.start.toString()));

                return update;
            },
            function exit(exit) {
                return exit.remove();
            }
        );

        const brushSvgNode = brushSvg.node() as BrushStateNode | null;
        if (brushSvgNode) {
            // The gesture handler reads its scales/context from this object. We refresh it on every render so
            // a drag started after live data has arrived still maps through the current scales - without
            // having to recreate the brush (which would clear the selection).
            const ctx: BrushContext = brushSvgNode.__brushCtx ?? (brushSvgNode.__brushCtx = {
                brushXScale, timelineXScale, chart, groupMap, options,
            });
            ctx.brushXScale = brushXScale;
            ctx.timelineXScale = timelineXScale;
            ctx.chart = chart;
            ctx.groupMap = groupMap;
            ctx.options = options;

            const extentEnd = brushXScale.range()[1];
            let brushGroup = brushSvg.select<SVGGElement>('#brush-group');
            // Rebuild the brush only on first render or when the brushable width changes; a plain data update
            // must leave the brush (and the user's selection) untouched so it doesn't jump around.
            const rebuildBrush = brushGroup.empty() || brushSvgNode.__brushExtentEnd !== extentEnd;

            if (rebuildBrush) {
                const handleBrush = (event: D3BrushEvent<Data>) => {
                    if (!event.sourceEvent) {
                        return;
                    }

                    const domain: Date[] = event.selection === null
                        ? ctx.brushXScale.domain()
                        : event.selection.map(ctx.brushXScale.invert as any);

                    // Remember the brushed range (or clear it when the selection is removed) so the detail
                    // view's zoom persists across re-renders triggered by live data or resize.
                    ctx.options.currentDomain = event.selection === null ? undefined : domain;

                    ctx.timelineXScale.domain(domain);
                    updateGridlines(ctx.chart, ctx.timelineXScale, ctx.groupMap, ctx.options);
                    updateNodeInternal(ctx.chart, ctx.timelineXScale, ctx.groupMap, ctx.options);
                    updateAxis(ctx.chart, ctx.timelineXScale, ctx.options);
                };

                const brush = brushX()
                    .extent([[16, 0], [extentEnd, brushHeight]])
                    .on('brush', handleBrush)
                    .on('end', handleBrush);

                if (brushGroup.empty()) {
                    brushGroup = brushSvg.append('g').attr('id', 'brush-group');
                }
                brushSvgNode.__brushExtentEnd = extentEnd;
                brushGroup.call(brush);

                // After a (re)build, reflect any persisted zoom as the selection so a width change keeps the
                // highlighted range on screen. brush.move has no sourceEvent, so handleBrush ignores it.
                if (options.currentDomain && options.currentDomain.length === 2) {
                    brushGroup.call(brush.move, [brushXScale(options.currentDomain[0]), brushXScale(options.currentDomain[1])]);
                }
            }

            // Keep the brush overlay above the re-joined data rects so it keeps receiving pointer events - we
            // no longer remove/re-append the brush group on every render, so raise it explicitly instead.
            if (!brushGroup.empty()) {
                brushGroup.raise();
            }
        }

        // Add X-Axis
        if (options.xAxis) {
            let brushAxisContainer = chart
                .select('#brush-x-axis');

            // Create container on first render
            if (brushAxisContainer.empty()) {
                brushAxisContainer = chart
                    .append('div')
                    .attr('id', 'brush-x-axis')
                    .style('width', '100%')
                    .style('height', `${options.axisHeight}px`);
            }

            // Remove old Axis Svg
            if (!brushAxisSvg.empty()) {
                brushAxisSvg.remove();
            }

            // Create X-Axis
            const xAxis = axisBottom(brushXScale)
                .ticks(10)
                .tickFormat(createTimeAxisFormat(brushXScale, 10));

            // Add X-Axis to chart
            brushAxisContainer
                .append('svg')
                    .attr('id', 'brush-x-axis-svg')
                    .attr('width', '100%')
                .call(xAxis);
        }
    }
}
