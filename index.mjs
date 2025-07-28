import * as cheerio from 'cheerio';

function ldifyUrl( url ) {
    const match = url.match(/^(.+\/)([^\/]+$)/);
    if ( match ) return { "@type": match[2], "@context": match[1] };
    return {};
}

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

function extractProperty( doc, prop ) {
    const item = doc( prop );
    if ( item.attr('itemtype') ) {
        return extractThing( doc, prop, ldifyUrl( item.attr('itemtype') ) );
    } else {
        /* todo: handle values that are not text, like meta content="..." */
        return item.text().trim();
    }
}

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
