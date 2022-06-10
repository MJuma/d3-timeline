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

    const timeline: Timeline<T> = {
        width: function(width?: number) {
            if (typeof width === 'number') {
                options.outerWidth = width;
                options.width = options.outerWidth - options.margin.left - options.margin.right;

                if (chartContainer) {
                    timelineXScale = createXScale(options);
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
                    timelineXScale = createXScale(options);
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
                return timeline;
            } else {
                return options.data;
            }
        } as GetterSetter<Timeline<T>, T[]>,
        render: function (domElement: HTMLElement) {
            chartContainer = createChartContainer(domElement, options);

            if (options.showTooltips) {
                createTooltipHost();
            }

            timelineXScale = createXScale(options);
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
    return scaleTime()
        .domain(extent([...options.data.map(d => new Date(d.start)), ...options.data.map(d => new Date(d.end))]))
        .range([16, options.width - 16]);
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
    updateNodes(chart, timelineXScale, groupMap, options)
    updateAxis(chart, timelineXScale, options);
    updateBrush(chart, brushXScale, timelineXScale, groupMap, options);
}

function updateGroups(chart: Selection<HTMLDivElement, unknown, null, undefined>, groupMap: InternMap<string, Data[]>, options: Options): void {
    const brushHeight = options.xBrush ? options.brushHeight + (options.xAxis ? 20 : 0) : 0;
    const groupHeight = (options.height - brushHeight - (options.xAxis ? 20 : 0)) / (groupMap.size || 1);

    chart
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
    const brushHeight = options.xBrush ? options.brushHeight + (options.xAxis ? 20 : 0) : 0;
    const groupHeight = (options.height - brushHeight - (options.xAxis ? 20 : 0)) / (groupMap.size || 1);

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
            .attr('width', (d: Data) => timelineXScale(new Date(d.end)) - timelineXScale(new Date(d.start)))
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
    const brushHeight = options.xBrush ? options.brushHeight + (options.xAxis ? 20 : 0) : 0;
    const groupHeight = (options.height - brushHeight - (options.xAxis ? 20 : 0)) / (groupMap.size || 1);

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
        svgGroups.attr('cursor', 'pointer');
        svgGroups.on('click', (_, d: Data) => {
            options.click(d);
            updateNodeInternal(chart, timelineXScale, groupMap, options);
        });
    } else {
        svgGroups.attr('cursor', 'auto');
        svgGroups.on('click', null);
    }
}

function updateAxis(chart: Selection<HTMLDivElement, unknown, null, undefined>, timelineXScale: ScaleTime<number, number>, options: Options): void {
    if (!options.xAxis) {
        return;
    }

    const axisHeight = 20;

    // Create X-Axis
    const xAxis = axisBottom(timelineXScale)
        .ticks(10);

    let axisSvg = chart
        .select<SVGSVGElement>('#x-axis-timeline-svg');

    // Add Axis to chart
    if (axisSvg.empty()) {
        axisSvg = chart
            .append('div')
                .attr('id', 'x-axis-timeline')
                .style('width', '100%')
                .style('height', `${axisHeight}px`)
            .append('svg')
                .attr('id', 'x-axis-timeline-svg')
                .attr('width', '100%');
    }
    axisSvg.call(xAxis);
}

function updateBrush(chart: Selection<HTMLDivElement, unknown, null, undefined>, brushXScale: ScaleTime<number, number>, timelineXScale: ScaleTime<number, number>, groupMap: InternMap<string, Data[]>, options: Options): void {
    if (!options.xBrush) {
        return;
    }

    const brushHeight = options.brushHeight;
    const rowHeight = Math.min(brushHeight / options.data.length, 20);
    const nodeHeight = rowHeight * 0.8;

    // Create brush container
    const brushContainer = chart
        .append('div')
        .attr('id', 'brush-container')
        .style('width', '100%')
        .style('height', `${brushHeight}px`);

    // Create brush svg
    const brushSvg = brushContainer
        .append('svg')
        .attr('id', 'brush-svg')
        .attr('width', '100%')
        .attr('height', `${options.data.length * rowHeight}px`);

    const brushGroups = brushSvg
        .selectAll('g')
        .data(options.data, (d: Data) => d.start.toString());

    brushGroups.join(
        function enter(enter) {
            // Add svg group for each data point in dataset group to svg
            const group = enter
                .append('g')
                .attr('class', (d) => d.end ? 'interval' : 'instant');

            // Add rectangle for each interval data point
            const intervalNodes = select('#brush-container')
                .selectAll('.interval');
            intervalNodes
                .append('rect')
                .attr('height', nodeHeight);

            // Add circle for each instant data point
            const instantNodes = select('#brush-container')
                .selectAll('.instant');
            instantNodes
                .append('circle')
                .attr('cx', nodeHeight / 2)
                .attr('cy', nodeHeight / 2)
                .attr('r', 2);

            const handleBrush = (event: D3BrushEvent<Data>) => {
                if (!event.sourceEvent) {
                    return;
                }

                const domain: Date[] = event.selection === null
                    ? brushXScale.domain()
                    : event.selection.map(brushXScale.invert as any);

                timelineXScale.domain(domain);
                updateGridlines(chart, timelineXScale, groupMap, options);
                updateNodeInternal(chart, timelineXScale, groupMap, options);
                updateAxis(chart, timelineXScale, options);
            };

            // Create brush
            const brush = brushX()
                .extent([[16, 0], [brushXScale.range()[1], brushHeight]])
                .on('brush', handleBrush)
                .on('end', handleBrush);

            // Add brush to band
            brushSvg.append('g')
                .call(brush);

            // Add X-Axis
            if (options.xAxis) {
                const axisHeight = 20;

                // Create X-Axis container
                const xAxisContainer = chart
                    .append('div')
                    .attr('id', 'x-axis-brush')
                    .style('width', '100%')
                    .style('height', `${axisHeight}px`);

                // Create X-Axis
                const xAxis = axisBottom(brushXScale)
                    .ticks(10);

                // Add X-Axis to chart
                xAxisContainer
                    .append('svg')
                    .attr('id', 'x-axis-timeline-svg')
                    .attr('width', '100%')
                    .call(xAxis);
            }

            return group;
        },
        function update() {
            const svgGroups = brushSvg
                .selectAll('.interval, .instant');

            // Set x,y for each data point
            svgGroups
                .attr('transform', (d: Data, i: number) => `translate(${brushXScale(new Date(d.start).getTime())}, ${i * rowHeight})`);

            // Set width and color for each interval data point
            svgGroups
                .selectAll('rect')
                .attr('width', (d: Data) => brushXScale(new Date(d.end)) - brushXScale(new Date(d.start)))
                .style('fill', (d: Data) => options.nodeColor ? options.nodeColor(d) : colors(d.start.toString()));

            // Set color for each instant data point
            svgGroups
                .selectAll('circle')
                .style('fill', (d: Data) => options.nodeColor ? options.nodeColor(d) : colors(d.start.toString()));

            return undefined;
        },
        function exit(exit) {
            return exit.remove();
        }
    );
}
