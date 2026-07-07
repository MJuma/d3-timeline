# Changelog

## 1.1.2

### Features

- Preserve the brush zoom across live data and resizes. The brushed time range is tracked as `options.currentDomain` and re-applied whenever the main scale is rebuilt, so streaming in new data or resizing no longer snaps the view back to the full extent.
- Format the x-axis with a time-aware tick formatter so labels read naturally across boundaries (the hour/minute is shown at the boundary and the finer unit in between) instead of repeating ambiguous values.

### Bug Fixes

- Create the brush once and preserve its selection across data refreshes. Previously the brush group was destroyed and recreated on every `data()` change, which interrupted an in-progress drag and rescaled the restored selection, so a dragged range could jump to a much larger area under live data.
- Clamp every rect width with `Math.max(0, …)` (bar rendering and both brush passes), not just the x-scale range, so a momentarily tiny or zero-width container can never emit a negative-width `<rect>`.
- Keep the x-scale width clamp (`Math.max(width, 64)`) from 1.1.1 so a momentarily tiny or zero container can't invert the scale range and emit a negative-width rect.

### Reverts

- Revert the performance-timeline overlay added in 1.1.0. The overlay baked domain-specific concepts into what is meant to be a generic, framework-agnostic timeline: `perfData` / `perfHeight` setters, the `perfTimeline` flag on `Data`, the `perfTimelineData` / `perfTimelineHeight` options, the `PerfTimelineEntry` / `PerfTimelineDataById` types (whose fields referenced Angular change detection), the perf box-chart rendering, and a top-level `eslint-disable @typescript-eslint/no-explicit-any`. Consumers that need a performance overlay should build it on top of the generic timeline rather than in the library.
- Restore the `Timeline<T>` typing that 1.1.0 replaced with `any` (including the generic `timeline<T extends Data = Data>(): Timeline<T>` factory), so consumers keep full type safety.

## 1.1.1

### Bug Fixes

- Clamp the x-scale width (`Math.max(width, 64)`) so a momentarily tiny or zero container can't invert the scale range and emit a negative-width rect.

## 1.1.0

### Features

- Add performance-timeline overlay: `perfData` / `perfHeight` fluent setters, a `perfTimeline` flag on `Data`, `perfTimelineData` / `perfTimelineHeight` options, and `PerfTimelineEntry` / `PerfTimelineDataById` types.

## 1.0.1

### Features

- Expose `PointerEvent` for click events

### Bug Fixes

- Rerender chart when updated data is passed in

## 1.0.0

- Initial release