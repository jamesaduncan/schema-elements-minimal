# Microdata Minimal

Microdata-Minimal is a lightweight JavaScript library for working with microdata in HTML documents. It provides simple extractraction of structured data from web pages for node.js

## Installation

Install the library using npm:

```bash
npm install microdata-minimal
```

## Usage

Mostly, take a look at the tests.

### Example

```javascript
import { microdata } from './index.mjs';

// Example HTML string with microdata
const html = `
    <div itemscope itemtype="http://schema.org/Person">
        <span itemprop="name">John Doe</span>
    </div>
`;

// Parse the microdata
const data = microdata(html);

console.log(data);
// Output:
// {
//   "@type": "Person",
//   "@context": "http://schema.org/",
//   "name": "John Doe",
// }
```

## API

### microdata

Extract microdata from HTML.
Takes an HTML string and optionally, either an array with a list of selectors that
limits the selection, or an options object that can contain a limiter property that does the same.
The options object can also contain a base property to help fully qualify relative URLs.
Returns an array of objects, each representing an item with its properties.

#### Parameters

*   `html` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The HTML string to parse.
*   `options` **([Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array))?** Optional settings or limiter array.

    *   `options.limiter` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)?** Array of selectors to limit the scope.
    *   `options.base` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Base URL for resolving relative URLs.

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** An array of extracted microdata objects.

## Testing

To run the tests, use the following command:

```bash
npm test
```

The tests are located in the `test/` directory, with `test/00-basic.mjs` providing a basic example of how the library works.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
