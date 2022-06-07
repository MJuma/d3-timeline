import * as d3 from 'd3';

import type { BaseType, D3BrushEvent, ScaleTime, Selection } from 'd3';
import type { ChartContainer, Click, Color, Data, GetterSetter, Highlight, Margin, Options, Timeline, Tooltips } from './contracts';

const { axisBottom, brushX, extent, group, scaleOrdinal, scaleTime, schemeAccent, select } = d3;
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
        brushHeight: 70,
        width: width,
        height: height,
        margin: margin,
        backgroundColor: '#EEEEEE',
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
            if (width !== undefined) {
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
        .range([16, options.width - 16])
        .nice();
}

function updateChart(chart: Selection<HTMLDivElement, unknown, null, undefined>, timelineXScale: ScaleTime<number, number>, brushXScale: ScaleTime<number, number>, options: Options): void {
    updateGroups(chart, options);
    updateNodes(chart, timelineXScale, options)
    updateAxis(chart, timelineXScale, options);
    updateBrush(chart, brushXScale, timelineXScale, options);
}

function updateGroups(chart: Selection<HTMLDivElement, unknown, null, undefined>, options: Options): void {
    const groupMap = group(options.data, d => d.group);
    const brushHeight = options.xBrush ? options.brushHeight : 0;
    const groupHeight = (options.height - brushHeight) / (groupMap.size || 1);
    const rowHeight = 20;

    chart
        .selectAll('div')
        .data(groupMap)
        .join(
            function enter(enter) {
                return enter
                    // Create group container
                    .append('div')
                        .attr('id', g => `group-${g[0]}-container`)
                        .style('border-bottom', (_, index, array) => array.length - 1 === index ? '' : '1px solid')
                        .style('width', '100%')
                        .style('height', `${groupHeight}px`)
                        .style('overflow-y', 'auto')
                        .style('overflow-x', 'hidden')
                    // Create group svg
                    .append('svg')
                        .attr('id', g => `group-${g[0]}-svg`)
                        .attr('width', '100%')
                        .attr('height', (g) => `${Math.max(groupHeight, g[1].length * rowHeight)}px`);
            },
            function update(update) {
                return update
                    .style('height', `${groupHeight}px`)
                    .selectAll('svg')
                    .attr('height', (g) => `${Math.max(groupHeight, g[1].length * rowHeight)}px`) as Selection<SVGElement, [string, Data[]], HTMLDivElement, unknown>;
            },
            function exit(exit) {
                return exit.remove();
            }
        );
}

function updateNodes(chart: Selection<HTMLDivElement, unknown, null, undefined>, timelineXScale: ScaleTime<number, number>, options: Options): void {
    const groups = Array.from(new Set(options.data.map((d: Data) => d.group)));
    const rowHeight = 20;
    const nodeHeight = rowHeight * 0.8;

    for (const group of groups) {
        const groupId = `#group-${group}-svg`;
        const groupData = options.data.filter(d => d.group === group);

        // Add svg group for each data point in dataset group to svg
        chart.select(groupId)
            .selectAll('g')
            .data(groupData, (d: Data) => d.start)
            .join(
                function enter(enter) {
                    return enter
                        .append('g')
                        .attr('class', (d) => d.end ? 'interval' : 'instant')
                        .each(function(d) {
                            const node = select(this);
                            if (d.end) {
                                // Add rectangle for each interval data point
                                node
                                    .append('rect')
                                    .attr('height', nodeHeight);
                                node
                                    .append('text')
                                    .style('font', '10px sans-serif')
                                    .attr('x', 4)
                                    .attr('y', 12)
                                    .text((d: Data) => d.name);
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
                                    .text((d: Data) => d.name);
                            }
                        });
                },
                function update(update) {
                    updateNodeInternal(chart, timelineXScale, options);
                    return update;
                },
                function exit(exit) {
                    return exit.remove();
                }
            );
    }
}

function updateNodeInternal(chart: Selection<HTMLDivElement, unknown, null, undefined>, timelineXScale: ScaleTime<number, number>, options: Options): void {
    const groups = Array.from(new Set(options.data.map((d: Data) => d.group)));
    const rowHeight = 20;
    for (const group of groups) {
        const groupId = `#group-${group}-svg`;

        const svg = chart
            .select(groupId);

        const svgGroups = chart
            .select(groupId)
            .selectAll<SVGGElement, Data>('g');

        // Set x,y for each data point
        svgGroups
            .attr('transform', (d: Data, i: number) => `translate(${timelineXScale(new Date(d.start).getTime())}, ${i * rowHeight})`);

        // Set width and color for each interval data point
        const intervalNodes = svg
            .selectAll('.interval');
        intervalNodes
            .selectAll('rect')
            .attr('width', (d: Data) => timelineXScale(new Date(d.end)) - timelineXScale(new Date(d.start)))
            .style('fill', (d: Data) => options.nodeColor ? options.nodeColor(d) : colors(d.start))
            .style('fill-opacity', (d: Data) => options.highlight && options.highlight(d) !== undefined ? options.highlight(d) ? 1 : 0.2 : 1)
            .style('stroke', (d: Data) => options.highlight && options.highlight(d) !== undefined ? options.highlight(d) ? 'none' : 'black' : 'none');

        // Set color for each instant data point
        const instantNodes = svg
            .selectAll('.instant');
        instantNodes
            .selectAll('circle')
            .style('fill', (d: Data) => options.nodeColor ? options.nodeColor(d) : colors(d.start))
            .style('fill-opacity', (d: Data) => options.highlight && options.highlight(d) !== undefined? options.highlight(d) ? 1 : 0.5 : 1)
            .style('stroke', (d: Data) => options.highlight && options.highlight(d) !== undefined? options.highlight(d) ? 'none' : 'black' : 'none');

        // Set text color
        intervalNodes
            .selectAll('text')
            .style('fill', (d: Data) => options.textColor ? options.textColor(d) : 'black');
        instantNodes
            .selectAll('text')
            .style('fill', (d: Data) => options.textColor ? options.textColor(d) : 'black');

        updateTooltips(svgGroups, options);
        updateClickHandler(svgGroups, options, chart, timelineXScale);
    }
}

function updateTooltips(svgGroups: Selection<SVGGElement, Data, BaseType, unknown>, options: Options): void {
    const groups = Array.from(new Set(options.data.map((d: Data) => d.group)));
    const brushHeight = options.xBrush ? options.brushHeight : 0;
    const groupHeight = (options.height - brushHeight) / (groups.length || 1);

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

function updateClickHandler(svgGroups: Selection<SVGGElement, Data, BaseType, unknown>, options: Options, foo: any, bar: any): void {
    if (options.click) {
        svgGroups.attr('cursor', 'pointer');
        svgGroups.on('click', (_, d: Data) => {
            options.click(d);
            updateNodeInternal(foo, bar, options);
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

function updateBrush(chart: Selection<HTMLDivElement, unknown, null, undefined>, brushXScale: ScaleTime<number, number>, timelineXScale: ScaleTime<number, number>, options: Options): void {
    if (!options.xBrush) {
        return;
    }

    const brushHeight = options.brushHeight;
    const axisHeight = options.xAxis ? 20 : 0;
    const containerHeight = brushHeight - axisHeight;
    const rowHeight = Math.min(containerHeight / options.data.length, 20);
    const nodeHeight = rowHeight * 0.8;

    // Create brush container
    const brushContainer = chart
        .append('div')
        .attr('id', 'brush-container')
        .style('width', '100%')
        .style('height', `${containerHeight}px`);

    // Create brush svg
    const brushSvg = brushContainer
        .append('svg')
        .attr('id', 'brush-svg')
        .attr('width', '100%')
        .attr('height', `${options.data.length * rowHeight}px`);

    const brushGroups = brushSvg
        .selectAll('g')
        .data(options.data, (d: Data) => d.start);

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
                updateNodeInternal(chart, timelineXScale, options);
                updateAxis(chart, timelineXScale, options);
            };

            // Create brush
            const brush = brushX()
                .extent([[16, 0], [brushXScale.range()[1], containerHeight]])
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
                .style('fill', (d: Data) => options.nodeColor ? options.nodeColor(d) : colors(d.start));

            // Set color for each instant data point
            svgGroups
                .selectAll('circle')
                .style('fill', (d: Data) => options.nodeColor ? options.nodeColor(d) : colors(d.start));

            return undefined;
        },
        function exit(exit) {
            return exit.remove();
        }
    );
}
