import * as cheerio from 'cheerio';

/*
    Convert a schema URL to a type & context.
    For example, "http://schema.org/Person" becomes:
    {
        "@type": "Person",
        "@context": "http://schema.org/"
    }
*/
function ldifyUrl( url ) {
    const match = url.match(/^(.+\/)([^\/]+$)/);
    if ( match ) return { "@type": match[2], "@context": match[1] };
    return {};
}

/*
    Extract the microdata from an element and its children.
    The element must have the "itemscope" attribute.
    Returns an object with the properties defined by the "itemprop" attributes.
*/
function extractThing( doc, el, obj ) {    
    for ( const prop of doc( "[itemprop]:not(* [itemscope] [itemprop])", el )) {
        const item = doc( prop );
        const propname = item.attr('itemprop');

        if ( obj[propname] ) {
            if ( obj[ propname ] && Array.isArray( obj[ propname ] ) ) {
                obj[propname].push( extractProperty( doc, prop ) );
            } else {
                obj[ propname ] = [ obj[ propname ], extractProperty( doc, prop ) ];
            }
        } else {
            obj[ propname ] = extractProperty( doc, prop );
        }
    }

    return obj;
} 

/*
    Extract the value of a property from an element.
    If the element has an "itemtype" attribute, it is treated as a nested item.
    Otherwise, it returns the text content of the element.
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
            default:
                return item.text().trim();
        }
    }
}

/*
    Extract microdata from HTML.
    Returns an array of objects, each representing an item with its properties.
*/
export function microdata( html ) {
    const doc = cheerio.load( html );
    const results = [];

    doc( '[itemscope]' ).each( ( i, el ) => {
        const item = doc( el );
        const obj = {};
        if ( item.attr('itemtype') ) {
            Object.assign( obj, ldifyUrl( item.attr('itemtype') ) );
        }
        results.push( extractThing( doc, el, obj ) );
    });

    return results;
};
