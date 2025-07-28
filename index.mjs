import * as cheerio from 'cheerio';

/**
 * Convert a schema URL to a type & context.
 * For example, "http://schema.org/Person" becomes:
 * {
 *     "@type": "Person",
 *     "@context": "http://schema.org/"
 * }
 * @param {string} url - The schema URL to convert.
 * @returns {Object} An object containing "@type" and "@context".
 */
function ldifyUrl( url ) {
    const match = url.match(/^(.+\/)([^\/]+$)/);
    if ( match ) return { "@type": match[2], "@context": match[1] };
    return {};
}

/**
 * Ensure a property is added to an object as an array or a single value.
 * @param {Object} obj - The target object.
 * @param {string} prop - The property name.
 * @param {*} value - The value to inject.
 */
function injectProp( obj, prop, value ) {
    if ( obj[prop] ) {
        if ( Array.isArray( obj[prop] ) ) {
            obj[prop].push( value );
        } else {
            obj[prop] = [ obj[prop], value ];
        }
    } else {
        obj[prop] = value;
    }
}

/**
 * Extract the microdata from an element and its children.
 * The element must have the "itemscope" attribute.
 * Returns an object with the properties defined by the "itemprop" attributes.
 * @param {Object} doc - The Cheerio document object.
 * @param {Object} el - The element to extract data from.
 * @param {Object} obj - The object to populate with extracted data.
 * @returns {Object} The populated object.
 */
function extractThing( doc, el, obj ) {    
    /*
        Get the properties of the thing, but only those that aren't below another itemscope.
        This is to avoid duplicating properties from nested items.
    */
    for ( const prop of doc( "[itemprop]:not(* [itemscope] [itemprop])", el )) {
        const item = doc( prop );
        const propname = item.attr('itemprop');
        injectProp( obj, propname, extractProperty( doc, prop ));
    }

    /*
        If we have an itemid, then we use it to set the @id
        property of the JSON-LD object.
    */
    if ( doc( el ).attr('itemid') ) {
        obj["@id"] = doc( el ).attr('itemid').trim();
    }

    /*
        If we have an id attr on the element, set a magical
        @id property, that upon obversation will return the
        property, and set it as a value. This is because
        HTML/microdata itemid and ids are only sort of the same
        thing, sometimes.
    */
    if (!doc( el ).attr('itemid') && doc(el).attr('id')) {
        Object.defineProperty( obj, "@id", {
            get: (target, prop, receiver ) => {
                const base = doc('base').attr('href') || '';
                const propval = `${base}#${doc( el ).attr('id')}`;
                Object.defineProperty( obj, "@id", {
                    value: propval,
                    enumerable: true
                })
                return propval;
            },
            configurable: true,
            enumerble: false
        })
    }

    if ( doc( el ).attr('itemref') ) {
        // If the element has an "itemref" attribute, extract properties from referenced elements
        const refs = doc( el ).attr('itemref').split(/\s+/);
        for ( const ref of refs ) {
            // Each ref is an ID of an element in the document
            doc( `#${ref}` ).each( ( i, refEl ) => {
                const propname = doc( refEl ).attr('itemprop');
                injectProp( obj, propname, extractProperty( doc, refEl ));
            });
        }
    }

    return obj;
} 

/**
 * Extract the value of a property from an element.
 * If the element has an "itemtype" attribute, it is treated as a nested item.
 * Otherwise, it returns the text content of the element.
 * @param {Object} doc - The Cheerio document object.
 * @param {Object} prop - The property element to extract data from.
 * @returns {*} The extracted property value.
 */
function extractProperty( doc, prop ) {
    const item = doc( prop );
    if ( item.attr('itemtype') ) {
        return extractThing( doc, prop, ldifyUrl( item.attr('itemtype') ) );
    } else {
        switch (item[0].tagName) {
            case 'meta':
                return item.attr('content').trim() || '';
            case 'link':
                return item.attr('href').trim() || '';
            case 'input':
                return item.attr('value').trim() || '';
            case 'select':
                return item.find('[selected]').text().trim() || '';
            default:
                return item.text().trim();
            /* ... there are more of these to support ... */
        }
    }
}

/**
 * Extract microdata from HTML.
 * Takes an HTML string and optionally, either an array with a list of selectors that
 *  limits the selection, or an options object that can contain a limiter property that does the same.
 * The options object can also contain a base property to help fully qualify relative URLs.
 * Returns an array of objects, each representing an item with its properties.
 * @param {string} html - The HTML string to parse.
 * @param {Object|Array} [options] - Optional settings or limiter array.
 * @param {Array} [options.limiter] - Array of selectors to limit the scope.
 * @param {string} [options.base] - Base URL for resolving relative URLs.
 * @returns {Array<Object>} An array of extracted microdata objects.
 */
export function microdata( html, options ) {
    const limiter = ( options && options.limiter ) ? options.limiter : Array.isArray( options ) ? options : [];
    const base    = ( options && options.base ) ? options.base : "";

    const doc = cheerio.load( html );
    const results = [];

    if ( base ) {
        if ( doc('base') ) {
            doc('base').remove();
        }
        doc(`<base href="${base}">`).prependTo('body');
    }

    const selector =  limiter.join("") + '[itemscope]';
   
    doc( selector ).each( ( i, el ) => {
        const item = doc( el );
        const obj = {};
        if ( item.attr('itemtype') ) {
            Object.assign( obj, ldifyUrl( item.attr('itemtype') ) );
        }
        results.push( extractThing( doc, el, obj ) );
    });

    return results;
};
