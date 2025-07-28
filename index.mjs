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

/* Make sure we do a array or becomes an array style property gathering */
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

/*
    Extract the microdata from an element and its children.
    The element must have the "itemscope" attribute.
    Returns an object with the properties defined by the "itemprop" attributes.
*/
function extractThing( doc, el, obj ) {    
    for ( const prop of doc( "[itemprop]:not(* [itemscope] [itemprop])", el )) {
        const item = doc( prop );
        const propname = item.attr('itemprop');
        injectProp( obj, propname, extractProperty( doc, prop ));
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
            /* ... there are more of these to support ... */
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
