# D3 Timeline

![GitHub](https://img.shields.io/github/license/mjuma/d3-timeline)
![npm (scoped)](https://img.shields.io/npm/v/@mhjuma/timeline)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/mjuma/d3-timeline)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@mhjuma/timeline)
![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/mjuma/d3-timeline)
![npm](https://img.shields.io/npm/dw/@mhjuma/timeline)

d3 timeline with brush axis.

## Installation

### NPM

```javascript
npm install @mjuma/timeline
```

### CDN

```html
<script type="text/javascript" src="https://unpkg.com/@mhjuma/timeline"></script>
```

## Usage

```ts
const domElement = document.getElementById('app');

const chart = timeline()
    .width(1920)
    .height(1020)
    .data(myData)
    .render(domElement);
```

### Data Contract

The data object passed to the timeline chart must be an array of the following type:

```ts
interface Data {
    name: string;
    start: string;
    end?: string;
    group?: string;
    track?: number;
}
```

Where the `start` and `end` values are either `Date` objects or a `string` that is [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) compliant. 

| Property  | Type                  | Required  | Description                                                   |
|-----------|-----------------------|-----------|---------------------------------------------------------------|
| name      | string                | Yes       | Datapoint label                                               |
| start     | `Date` or `string`    | Yes       | Start time for datapoint                                      |
| end       | `Date` or `string`    | No        | End time for interval datapoint                               |
| group     | `string`              | No        | Group the datapoint belongs to                                |
| track     |`number`               | No        | Track (row) the datapoint will be drawn on within the group   |


Example:

```ts
const myData = [
    {
        name: 'foo',
        start: '2022-01-01T00:00:00.000Z',
        end: '2022-01-10T00:00:00.000Z',
    },
    {
        name: 'foo',
        start: '2022-01-01T00:00:00.000Z',
        end: '2022-01-10T00:00:00.000Z',
    }
];
```

### API

| Function                                                                                              | Description                                                                       | Default                                       |
|------------------------------------------------------------------------------------------------------ |---------------------------------------------------------------------------------- |---------------------------------------------- |
| width(`width?: number`)                                                                               | Chart width in px                                                                 | 960                                           |
| height(`width?: number`)                                                                              | Chart height in px                                                                | 500                                           |
| margin(`margin?: { top: number, right: number, bottom: number, left: number }`)                       | Chart margins in px                                                               | { top: 20, right: 20, bottom: 20, left: 20 }  |
| backgroundColor(`color?: string`)                                                                     | Chart background color                                                            | '#FFFFFF'                                     |
| gridColor(`color?: string`)                                                                           | Gridlines color                                                                   | '#EAEAEA'                                     |
| nodeColor(`color: (d: Data) => string`)                                                               | Callback to set datapoint background color                                        | schemeAccent                                  |
| textColor(`color: (d: Data) => color`)                                                                | Callback to set datapoint text color                                              | 'black'                                       |
| text(`text: (d: Data) => string`)                                                                     | Callback to set datapoint label                                                   | d.name                                        |
| tooltips(`tooltips: boolean or (domElement: SVGGElement, visible: boolean, data: Data) => void`)      | Boolean to show default tooltip or callback to set custom tooltip                 | false                                         |
| xAxis(`xAxis?: boolean`)                                                                              | Boolean to show xAxis for timeline and brush                                      | false                                         |
| xBrush(`xBrush?: boolean`)                                                                            | Boolean to show brush                                                             | false                                         |
| click(`click: (d: Data) => void`)                                                                     | Callback when a datapoint is clicked                                              | undefined                                     |
| highlight(`click: (d: Data) => boolean`)                                                              | Callback to determine if datapoint is highlighted                                 | undefined                                     |
| data(`data: Data[]`)                                                                                  | Data array                                                                        | []                                            |
| render(`domElement: HTMLElement`)                                                                     | Renders the chart                                                                 | undefined                                     |

## Credit

This project was inspired by the following projects:

- [timelines-chart](https://github.com/vasturiano/timelines-chart)
- [Timeline for d3 - proof-of-concept](http://bl.ocks.org/rengel-de/5603464)

## Changelog

[View recent updates](https://github.com/MJuma/d3-timeline/blob/master/CHANGELOG.md)

## License

[MIT](https://github.com/MJuma/d3-timeline/blob/master/LICENSE)