# Microdata Library

Microdata Library is a lightweight JavaScript library for working with microdata in HTML documents. It provides simple extractraction of structured data from web pages.

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

### `microdata(html: string): object`

Parses an HTML string containing microdata and returns a structured JavaScript object.

- **Parameters**:
    - `html` (string): The HTML string to parse.
- **Returns**:
    - A JavaScript object representing the structured data.

## Testing

To run the tests, use the following command:

```bash
npm test
```

The tests are located in the `test/` directory, with `test/00-basic.mjs` providing a basic example of how the library works.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.