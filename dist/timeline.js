// src/timeline.ts
import { axisBottom } from "d3-axis";
import { extent, group } from "d3-array";
import { brushX } from "d3-brush";
import { scaleOrdinal, scaleTime } from "d3-scale";
import { schemeAccent } from "d3-scale-chromatic";
import { select } from "d3-selection";
import { InternMap } from "d3-array";
var colors = scaleOrdinal(schemeAccent);
var NodeFont = "10px sans-serif";
var measureTextDiv;
function measureText(font, text) {
  if (!measureTextDiv) {
    measureTextDiv = document.createElement("div");
    measureTextDiv.style.visibility = "hidden";
    measureTextDiv.style.display = "inline-block";
    document.body.appendChild(measureTextDiv);
  }
  measureTextDiv.innerText = text;
  measureTextDiv.style.font = font;
  const bounds = measureTextDiv.getBoundingClientRect();
  return { width: bounds.width, height: bounds.height };
}
function timeline() {
  const outerWidth = 960;
  const outerHeight = 500;
  const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };
  const width = outerWidth - margin.left - margin.right;
  const height = outerHeight - margin.top - margin.bottom;
  const options = {
    outerWidth,
    outerHeight,
    brushHeight: 50,
    axisHeight: 20,
    perfTimelineHeight: 100,
    perfTimelineData: {},
    width,
    height,
    margin,
    rowHeight: 20,
    backgroundColor: "#FFFFFF",
    gridColor: "#EAEAEA",
    showTooltips: false,
    xAxis: false,
    xBrush: false,
    data: []
  };
  let chartContainer;
  let timelineXScale;
  let brushXScale;
  const timeline2 = {
    width: function(width2) {
      if (typeof width2 === "number") {
        options.outerWidth = width2;
        options.width = options.outerWidth - options.margin.left - options.margin.right;
        if (chartContainer) {
          timelineXScale = createXScale(options);
          brushXScale = createXScale(options);
          updateChartContainer(chartContainer, options);
          updateChart(chartContainer.container, timelineXScale, brushXScale, options);
        }
        return timeline2;
      } else {
        return options.width;
      }
    },
    height: function(height2) {
      if (typeof height2 === "number") {
        options.outerHeight = height2;
        options.height = options.outerHeight - options.margin.top - options.margin.bottom;
        if (chartContainer) {
          updateChartContainer(chartContainer, options);
          updateChart(chartContainer.container, timelineXScale, brushXScale, options);
        }
        return timeline2;
      } else {
        return options.height;
      }
    },
    margin: function(margin2) {
      if (typeof margin2 === "object") {
        options.margin = margin2;
        options.width = options.outerWidth - options.margin.left - options.margin.right;
        options.height = options.outerHeight - options.margin.top - options.margin.bottom;
        if (chartContainer) {
          timelineXScale = createXScale(options);
          updateChartContainer(chartContainer, options);
          updateChart(chartContainer.container, timelineXScale, brushXScale, options);
        }
        return timeline2;
      } else {
        return options.margin;
      }
    },
    backgroundColor: function(color) {
      if (typeof color === "string") {
        options.backgroundColor = color;
        if (chartContainer) {
          updateChartContainer(chartContainer, options);
        }
        return timeline2;
      } else {
        return options.backgroundColor;
      }
    },
    gridColor: function(color) {
      if (typeof color === "string") {
        options.gridColor = color;
        if (chartContainer) {
          updateChart(chartContainer.container, timelineXScale, brushXScale, options);
        }
        return timeline2;
      } else {
        return options.backgroundColor;
      }
    },
    nodeColor: function(color) {
      options.nodeColor = color;
      if (chartContainer) {
        updateChartContainer(chartContainer, options);
      }
      return timeline2;
    },
    textColor: function(color) {
      options.textColor = color;
      if (chartContainer) {
        updateChartContainer(chartContainer, options);
      }
      return timeline2;
    },
    text: function(text) {
      options.text = text;
      if (chartContainer) {
        updateChartContainer(chartContainer, options);
      }
      return timeline2;
    },
    tooltips: function(tooltips) {
      if (typeof tooltips === "boolean") {
        options.showTooltips = tooltips;
        if (chartContainer) {
          updateChartContainer(chartContainer, options);
        }
        return timeline2;
      } else if (typeof tooltips === "function") {
        options.tooltips = tooltips;
        if (chartContainer) {
          updateChartContainer(chartContainer, options);
        }
        return timeline2;
      } else {
        return options.showTooltips;
      }
    },
    xAxis: function(xAxis) {
      if (typeof xAxis === "boolean") {
        options.xAxis = xAxis;
        if (chartContainer) {
          updateChart(chartContainer.container, timelineXScale, brushXScale, options);
        }
        return timeline2;
      } else {
        return options.xAxis;
      }
    },
    xBrush: function(xBrush) {
      if (typeof xBrush === "boolean") {
        options.xBrush = xBrush;
        if (chartContainer) {
          updateChart(chartContainer.container, timelineXScale, brushXScale, options);
        }
        return timeline2;
      } else {
        return options.xBrush;
      }
    },
    click: function(click) {
      if (click) {
        options.click = click;
        if (chartContainer) {
          updateChart(chartContainer.container, timelineXScale, brushXScale, options);
        }
      }
      return timeline2;
    },
    highlight: function(highlight) {
      if (highlight) {
        options.highlight = highlight;
        if (chartContainer) {
          updateChart(chartContainer.container, timelineXScale, brushXScale, options);
        }
      }
      return timeline2;
    },
    data: function(data) {
      if (!!data && Array.isArray(data)) {
        options.data = data;
        if (chartContainer) {
          timelineXScale = createXScale(options);
          brushXScale = createXScale(options);
          updateChart(chartContainer.container, timelineXScale, brushXScale, options);
        }
        return timeline2;
      } else {
        return options.data;
      }
    },
    perfData: function(data) {
      if (data) {
        options.perfTimelineData = data;
        if (chartContainer) {
          timelineXScale = createXScale(options);
          brushXScale = createXScale(options);
          updateChart(chartContainer.container, timelineXScale, brushXScale, options);
        }
      }
      return timeline2;
    },
    perfHeight: function(height2) {
      if (typeof height2 === "number") {
        options.perfTimelineHeight = height2;
        if (chartContainer) {
          updateChartContainer(chartContainer, options);
          updateChart(chartContainer.container, timelineXScale, brushXScale, options);
        }
      }
      return timeline2;
    },
    render: function(domElement) {
      if (!chartContainer) {
        chartContainer = createChartContainer(domElement, options);
      }
      if (options.showTooltips && select("#timeline-tooltip").empty()) {
        createTooltipHost();
      }
      timelineXScale = createXScale(options);
      brushXScale = createXScale(options);
      updateChart(chartContainer.container, timelineXScale, brushXScale, options);
      return timeline2;
    }
  };
  return timeline2;
}
function createTooltipHost() {
  select("body").append("div").attr("id", "timeline-tooltip").style("position", "absolute").style("color", "black").style("background-color", "#FFFFEE").style("border", "1px solid").style("padding", "4px").style("visibility", "hidden");
}
function createChartContainer(domElement, options) {
  const outerContainer = select(domElement).append("div").attr("id", "timeline-outer-container");
  const container = outerContainer.append("div").attr("id", "timeline-container");
  container.append("div").attr("id", "timeline-groups");
  const chartContainer = { outerContainer, container };
  updateChartContainer(chartContainer, options);
  return chartContainer;
}
function updateChartContainer(chartContainer, options) {
  const { outerContainer, container } = chartContainer;
  outerContainer.style("width", `${options.outerWidth}px`).style("height", `${options.outerHeight}px`).style("margin", `${options.margin.top}px ${options.margin.right}px ${options.margin.bottom}px ${options.margin.left}px`);
  container.style("width", `${options.width}px`).style("height", `${options.height}px`).style("background-color", options.backgroundColor);
}
function createXScale(options) {
  const domainExtent = extent([...options.data.map((d) => new Date(d.start)), ...options.data.map((d) => new Date(d.end ?? ""))]);
  let rangeEnd = options.width - 16;
  const rangeEndMin = rangeEnd / 2;
  const scale = scaleTime().domain(domainExtent).range([16, rangeEnd]);
  for (let i = 0; i < 2; ++i) {
    let textEnd = 0;
    for (let d of options.data) {
      const x = scale(new Date(d.start)) + 4 + measureText(NodeFont, options.text ? options.text(d) : d.name).width;
      if (x >= textEnd)
        textEnd = x;
    }
    if (textEnd <= options.width - 16)
      break;
    rangeEnd -= textEnd - (options.width - 16);
    if (rangeEnd < rangeEndMin)
      rangeEnd = rangeEndMin;
    scale.range([16, rangeEnd]);
  }
  return scale;
}
function normalizeGroupName(group2) {
  return (group2 || "none").toLocaleLowerCase().replaceAll(" ", "-");
}
function getGroupContainerId(group2) {
  return `group-${normalizeGroupName(group2)}-container`;
}
function getGroupSvgId(group2) {
  return `group-${normalizeGroupName(group2)}-svg`;
}
function getPerfChartHeight(options) {
  return options.perfTimelineHeight && Object.keys(options.perfTimelineData).length !== 0 ? options.perfTimelineHeight : 0;
}
function updateChart(chart, timelineXScale, brushXScale, options) {
  const groupMap = group(options.data, (d) => d.group);
  updateGroups(chart, groupMap, options);
  updatePerfBox(chart, groupMap, options);
  updatePerfBoxChart(chart, timelineXScale, groupMap, options);
  updateGridlines(chart, timelineXScale, groupMap, options);
  updateNodes(chart, timelineXScale, groupMap, options);
  updateAxis(chart, timelineXScale, options);
  updateBrush(chart, brushXScale, timelineXScale, groupMap, options);
}
function updateGroups(chart, groupMap, options) {
  const axisHeight = options.xAxis ? options.axisHeight : 0;
  const brushHeight = options.xBrush ? options.brushHeight + axisHeight : 0;
  const perfTimelineHeight = getPerfChartHeight(options);
  const groupHeight = (options.height - brushHeight - axisHeight - perfTimelineHeight * (groupMap.size || 1)) / (groupMap.size || 1);
  chart.select("#timeline-groups").selectAll("div").data(groupMap).join(
    function enter(enter) {
      const group2 = enter.append("div").attr("id", (g) => getGroupContainerId(g[0])).style("border-bottom", (_, index, array) => array.length - 1 === index ? "" : "1px solid").style("width", "100%").style("height", `${groupHeight}px`).style("overflow-y", "auto").style("overflow-x", "hidden");
      enter.each(function(g) {
        select(`#perfbox-${normalizeGroupName(g[0])}`).remove();
        const element = document.querySelector(`#group-${normalizeGroupName(g[0])}-container`);
        const test = document.createElement("span");
        test.id = `perfbox-${normalizeGroupName(g[0])}`;
        element?.insertAdjacentElement("afterend", test);
      });
      const svg = group2.append("svg").attr("id", (g) => getGroupSvgId(g[0])).attr("width", "100%").attr("height", (g) => `${Math.max(groupHeight, g[1].length * options.rowHeight)}px`);
      svg.append("g").attr("class", "group-label").append("text").style("font", "11px sans-serif").attr("transform", "translate(0, 50) rotate(270)").attr("x", groupHeight / 2 * -1).attr("y", 12).text((g) => g[0]).each(function() {
        const self = select(this);
        let textLength = self.node()?.getComputedTextLength();
        let text = self.text();
        while (textLength > groupHeight - 2 * 4 && text.length > 0) {
          text = text.slice(0, -1);
          self.text(text + "...");
          textLength = self.node()?.getComputedTextLength();
        }
      });
      svg.append("g").attr("class", "gridlines");
      return svg;
    },
    function update(update) {
      return update.style("border-bottom", (_, index, array) => array.length - 1 === index ? "" : "1px solid").style("height", `${groupHeight}px`).selectAll("svg").attr("height", (g) => `${Math.max(groupHeight, g[1].length * options.rowHeight)}px`);
    },
    function exit(exit) {
      return exit.remove();
    }
  );
}
function updatePerfBox(chart, groupMap, options) {
  const perfTimelineHeight = getPerfChartHeight(options);
  const perfTimelineData = new InternMap();
  for (const key of Object.keys(options.perfTimelineData)) {
    perfTimelineData.set(key, options.perfTimelineData[key]);
  }
  for (const group2 of Array.from(groupMap.keys())) {
    const id = `#perfbox-${normalizeGroupName(group2)}`;
    if (perfTimelineData.get(group2)) {
      chart.select(id).selectAll(`svg`).data([group2]).join(
        function enter(enter) {
          return enter.append("svg").attr("id", `perfbox-${normalizeGroupName(group2)}-svg`).attr("height", `${perfTimelineHeight}px`).attr("width", "100%");
        },
        function update(update) {
          return update;
        },
        function exit(exit) {
          return exit.remove();
        }
      );
    }
  }
}
function updatePerfBoxChart(chart, timelineXScale, groupMap, options) {
  const perfTimelineData = new InternMap();
  for (const key of Object.keys(options.perfTimelineData)) {
    perfTimelineData.set(key, options.perfTimelineData[key]);
  }
  for (const group2 of Array.from(groupMap.keys())) {
    const svgId = `#perfbox-${normalizeGroupName(group2)}-svg`;
    chart.select(svgId).selectAll("g").data(perfTimelineData.get(group2) ?? []).join(
      function enter(enter) {
        return enter.append("g").each(function() {
          select(this).append("rect");
        });
      },
      function update(update) {
        updatePerfBoxChartBars(chart, timelineXScale, groupMap, options);
        return update;
      },
      function exit(exit) {
        return exit.remove();
      }
    );
  }
}
function updatePerfBoxChartBars(chart, timelineXScale, groupMap, options) {
  const perfTimelineHeight = getPerfChartHeight(options);
  for (const group2 of Array.from(groupMap.keys())) {
    const groupId = `#perfbox-${normalizeGroupName(group2)}-svg`;
    const firstEvent = groupMap.get(group2)?.reduce((previous, current) => {
      return current.start && new Date(current.start) < new Date(previous.start) ? current : previous;
    });
    const svg = chart.select(groupId);
    const svgGroups = chart.select(groupId).selectAll("g");
    svgGroups.attr("transform", (d) => d.start ? `translate(${timelineXScale(d.start + new Date(firstEvent?.start ?? "").getTime())}, 0)` : "");
    const entryHeight = (entry) => Math.max(0, Math.min(1, (entry.taskTime + entry.visualTime + entry.changeDetectionTime + entry.browserRenderTime) / (entry.end - entry.start))) * perfTimelineHeight;
    const intervalNodes = svg.selectAll("g");
    intervalNodes.selectAll("rect").attr("width", (d) => timelineXScale(d.end + new Date(firstEvent?.start ?? "").getTime()) - timelineXScale(d.start + new Date(firstEvent?.start ?? "").getTime())).attr("height", (d) => entryHeight(d)).style("fill", (d) => "orange").style("fill-opacity", (d) => options.highlight && options.highlight(d) !== void 0 ? options.highlight(d) ? 1 : 0.2 : 1).style("stroke", (d) => options.highlight && options.highlight(d) !== void 0 ? options.highlight(d) ? "none" : "black" : "none");
  }
}
function updateGridlines(chart, timelineXScale, groupMap, options) {
  const axisHeight = options.xAxis ? options.axisHeight : 0;
  const brushHeight = options.xBrush ? options.brushHeight + axisHeight : 0;
  const perfTimelineHeight = getPerfChartHeight(options);
  const groupHeight = (options.height - brushHeight - axisHeight - perfTimelineHeight * (groupMap.size || 1)) / (groupMap.size || 1);
  for (const group2 of Array.from(groupMap.keys())) {
    const groupId = `#${getGroupSvgId(group2)}`;
    chart.select(groupId).select(".gridlines").selectAll("line").data(timelineXScale.ticks(20), (d) => d.getTime()).join(
      function enter(enter) {
        return enter.append("line").attr("y1", 0).attr("shape-rendering", "crispEdges").attr("stroke-width", "1px").attr("x1", (d) => timelineXScale(d)).attr("x2", (d) => timelineXScale(d)).attr("y2", Math.max(groupHeight, groupMap.get(group2)?.length * options.rowHeight)).attr("stroke", options.gridColor);
      },
      function update(update) {
        return update.attr("x1", (d) => timelineXScale(d)).attr("x2", (d) => timelineXScale(d)).attr("y2", Math.max(groupHeight, groupMap.get(group2)?.length * options.rowHeight)).attr("stroke", options.gridColor);
      },
      function exit(exit) {
        return exit.remove();
      }
    );
  }
}
function updateNodes(chart, timelineXScale, groupMap, options) {
  const nodeHeight = options.rowHeight * 0.8;
  for (const group2 of Array.from(groupMap.keys())) {
    const groupId = `#${getGroupSvgId(group2)}`;
    const groupData = options.data.filter((d) => d.group === group2);
    chart.select(groupId).selectAll("g.datapoint").data(groupData, (d) => `${d.start.toString()}-${d.id}`).join(
      function enter(enter) {
        return enter.append("g").attr("class", (d) => d.end || d.start === d.end ? "datapoint interval" : "datapoint instant").each(function(d) {
          const node = select(this);
          if (d.end || d.start === d.end) {
            node.append("rect").attr("height", nodeHeight);
            node.append("text").style("font", NodeFont).attr("x", 4).attr("y", 12).text((d2) => options.text ? options.text(d2) : d2.name);
          } else {
            node.append("circle").attr("cx", nodeHeight / 2).attr("cy", nodeHeight / 2).attr("r", 5);
            node.append("text").style("font", NodeFont).attr("x", 16).attr("y", 12).text((d2) => options.text ? options.text(d2) : d2.name);
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
function updateNodeInternal(chart, timelineXScale, groupMap, options) {
  for (const group2 of Array.from(groupMap.keys())) {
    const groupId = `#${getGroupSvgId(group2)}`;
    const svg = chart.select(groupId);
    const svgGroups = chart.select(groupId).selectAll("g.datapoint");
    svgGroups.attr("transform", (d, i) => `translate(${timelineXScale(new Date(d.start).getTime())}, ${(d.track ?? i) * options.rowHeight})`);
    const intervalNodes = svg.selectAll(".interval");
    intervalNodes.selectAll("rect").attr("width", (d) => Math.abs(timelineXScale(new Date(d.end)) - timelineXScale(new Date(d.start)))).style("fill", (d) => options.nodeColor ? options.nodeColor(d) : colors(d.start.toString())).style("fill-opacity", (d) => options.highlight && options.highlight(d) !== void 0 ? options.highlight(d) ? 1 : 0.2 : 1).style("stroke", (d) => options.highlight && options.highlight(d) !== void 0 ? options.highlight(d) ? "none" : "black" : "none");
    const instantNodes = svg.selectAll(".instant");
    instantNodes.selectAll("circle").style("fill", (d) => options.nodeColor ? options.nodeColor(d) : colors(d.start.toString())).style("fill-opacity", (d) => options.highlight && options.highlight(d) !== void 0 ? options.highlight(d) ? 1 : 0.5 : 1).style("stroke", (d) => options.highlight && options.highlight(d) !== void 0 ? options.highlight(d) ? "none" : "black" : "none");
    intervalNodes.selectAll("text").style("fill", (d) => options.textColor ? options.textColor(d) : "black");
    instantNodes.selectAll("text").style("fill", (d) => options.textColor ? options.textColor(d) : "black");
    updateTooltips(svgGroups, groupMap, options);
    updateClickHandler(svgGroups, options, chart, timelineXScale, groupMap);
  }
}
function updateTooltips(svgGroups, groupMap, options) {
  const axisHeight = options.xAxis ? options.axisHeight : 0;
  const brushHeight = options.xBrush ? options.brushHeight + axisHeight : 0;
  const perfTimelineHeight = getPerfChartHeight(options);
  const groupHeight = (options.height - brushHeight - axisHeight - perfTimelineHeight) / (groupMap.size || 1);
  if (options.showTooltips) {
    const tooltip = select("#timeline-tooltip");
    svgGroups.on("mouseover", (event, d) => {
      const x = event.pageX < options.width / 2 ? event.pageX + 10 : event.pageX - 110;
      const y = event.pageY < groupHeight / 2 ? event.pageY + 30 : event.pageY - 30;
      tooltip.html(() => `${d.name}`).style("top", `${y}px`).style("left", `${x}px`).style("visibility", "visible");
    });
    svgGroups.on("mouseout", () => tooltip.style("visibility", "hidden"));
  } else if (options.tooltips && typeof options.tooltips === "function") {
    svgGroups.on("mouseover", function(_, d) {
      options.tooltips?.(this, true, d);
    });
    svgGroups.on("mouseout", function(_, d) {
      options.tooltips?.(this, false, d);
    });
  }
}
function updateClickHandler(svgGroups, options, chart, timelineXScale, groupMap) {
  if (options.click) {
    svgGroups.on(".click", null);
    svgGroups.attr("cursor", "pointer");
    svgGroups.on("click", function(event, d) {
      options.click?.(event, d);
      updateNodeInternal(chart, timelineXScale, groupMap, options);
      updatePerfBox(chart, groupMap, options);
      updatePerfBoxChartBars(chart, timelineXScale, groupMap, options);
    });
  } else {
    svgGroups.attr("cursor", "auto");
    svgGroups.on(".click", null);
  }
}
function updateAxis(chart, timelineXScale, options) {
  if (options.xAxis) {
    let axisContainer = chart.select("#timeline-x-axis");
    if (axisContainer.empty()) {
      axisContainer = chart.append("div").attr("id", "timeline-x-axis").style("width", "100%").style("height", `${options.axisHeight}px`);
    }
    const axisSvg = axisContainer.select("#timeline-x-axis-svg");
    if (!axisSvg.empty()) {
      axisSvg.remove();
    }
    if (options.data.length > 0) {
      const xAxis = axisBottom(timelineXScale).ticks(10);
      axisContainer.append("svg").attr("id", "timeline-x-axis-svg").attr("width", "100%").call(xAxis);
    }
  }
}
function updateBrush(chart, brushXScale, timelineXScale, groupMap, options) {
  if (options.xBrush) {
    const brushHeight = options.brushHeight;
    const rowHeight = Math.min(brushHeight / options.data.length, 20);
    const nodeHeight = rowHeight * 0.8;
    let brushContainer = chart.select("#brush-container");
    const brushAxisSvg = chart.select("#brush-x-axis-svg");
    if (brushContainer.empty()) {
      brushContainer = chart.append("div").attr("id", "brush-container").style("width", "100%").style("height", `${brushHeight}px`);
    }
    let brushSvg = brushContainer.select("#brush-svg");
    if (!brushSvg.empty() && options.data.length < 1) {
      brushSvg.remove();
      if (!brushAxisSvg.empty()) {
        brushAxisSvg.remove();
      }
      return;
    }
    if (brushSvg.empty()) {
      brushSvg = brushContainer.append("svg").attr("id", "brush-svg").attr("width", "100%").attr("height", `${options.data.length * rowHeight}px`);
    }
    const brushGroups = brushSvg.selectAll("g.datapoint").data(options.data, (d) => d.start.toString());
    brushGroups.join(
      function enter(enter) {
        const groups = enter.append("g").attr("class", (d) => d.end ? "datapoint interval" : "datapoint instant").attr("transform", (d, i) => `translate(${brushXScale(new Date(d.start).getTime())}, ${i * rowHeight})`);
        groups.filter((d) => !!d.end).append("rect").attr("height", nodeHeight).attr("width", (d) => Math.abs(brushXScale(new Date(d.end ?? "")) - brushXScale(new Date(d.start)))).style("fill", (d) => options.nodeColor ? options.nodeColor(d) : colors(d.start.toString()));
        groups.filter((d) => !d.end).append("circle").attr("cx", nodeHeight / 2).attr("cy", nodeHeight / 2).attr("r", 2).style("fill", (d) => options.nodeColor ? options.nodeColor(d) : colors(d.start.toString()));
        return groups;
      },
      function update(update) {
        update.attr("transform", (d, i) => `translate(${brushXScale(new Date(d.start).getTime())}, ${i * rowHeight})`);
        update.selectAll("rect").attr("width", (d) => Math.abs(brushXScale(new Date(d.end)) - brushXScale(new Date(d.start)))).style("fill", (d) => options.nodeColor ? options.nodeColor(d) : colors(d.start.toString()));
        update.selectAll("circle").style("fill", (d) => options.nodeColor ? options.nodeColor(d) : colors(d.start.toString()));
        return update;
      },
      function exit(exit) {
        return exit.remove();
      }
    );
    const handleBrush = (event) => {
      if (!event.sourceEvent) {
        return;
      }
      const domain = event.selection === null ? brushXScale.domain() : event.selection.map(brushXScale.invert);
      timelineXScale.domain(domain);
      updateGridlines(chart, timelineXScale, groupMap, options);
      updateNodeInternal(chart, timelineXScale, groupMap, options);
      updatePerfBoxChartBars(chart, timelineXScale, groupMap, options);
      updateAxis(chart, timelineXScale, options);
    };
    const existingBrush = brushSvg.select("#brush-group");
    if (!existingBrush.empty()) {
      existingBrush.remove();
    }
    const brush = brushX().extent([[16, 0], [brushXScale.range()[1], brushHeight]]).on("brush", handleBrush).on("end", handleBrush);
    brushSvg.append("g").attr("id", "brush-group").call(brush);
    if (options.xAxis) {
      let brushAxisContainer = chart.select("#brush-x-axis");
      if (brushAxisContainer.empty()) {
        brushAxisContainer = chart.append("div").attr("id", "brush-x-axis").style("width", "100%").style("height", `${options.axisHeight}px`);
      }
      if (!brushAxisSvg.empty()) {
        brushAxisSvg.remove();
      }
      const xAxis = axisBottom(brushXScale).ticks(10);
      brushAxisContainer.append("svg").attr("id", "brush-x-axis-svg").attr("width", "100%").call(xAxis);
    }
  }
}
export {
  timeline
};
