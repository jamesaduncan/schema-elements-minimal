import t from "tap";
import { microdata } from "../index.mjs";

t.test( "simple microdata", ( t ) => {
    t.ok( microdata, "microdata function exists" );
    const results = microdata(`<div itemscope itemtype="http://schema.org/Person">
        <span itemprop="name">John Doe</span>
    </div>`);
    t.ok( Array.isArray( results ), "got an array of results from microdata");
    t.ok( results.length > 0, "got some results from microdata");
    t.equal( results[0].name, "John Doe", "got the correct name from microdata");
    t.equal( results[0]['@type'], "Person", "got the correct type from microdata");
    t.equal( results[0]['@context'], "http://schema.org/", "got the correct context from microdata");
    t.end();
});

t.test("microdata with multiple items", (t) => {
    const results = microdata(`<div itemscope itemtype="http://schema.org/Person">
        <span itemprop="name">John Doe</span>
    </div>
    <div itemscope itemtype="http://schema.org/Person">
        <span itemprop="name">Jane Smith</span>
    </div>`); 
    t.ok( Array.isArray( results ), "got an array of results from microdata");
    t.equal( results.length, 2, "got two items from microdata");
    t.equal( results[0].name, "John Doe", "got the correct name for first item");
    t.equal( results[1].name, "Jane Smith", "got the correct name for second item");
    t.equal( results[1]["@type"], "Person", "got the correct type for second item");
    t.equal( results[1]["@context"], "http://schema.org/", "got the correct context for second item");
    t.end();
});

t.test("microdata with nested items", (t) => {
    const results = microdata(`<article itemscope itemtype="http://schema.org/BlogPosting">
        <h1 itemprop="headline">My Blog Post</h1>
        <div itemprop="author" itemscope itemtype="http://schema.org/Person">
            <span itemprop="name">John Doe</span>
        </div>
        <ul>
            <li itemprop="comment" itemscope itemtype="http://schema.org/Comment">
                <span itemprop="text">Great post!</span>
                <div itemprop="author" itemscope itemtype="http://schema.org/Person">
                    <span itemprop="name">Jane Smith</span>
                </div>
            </li>
        </ul>
    </article>`);
    t.ok( Array.isArray( results ), "got an array of results from microdata");
    t.equal( results.length, 4, "got one item from microdata");
    t.equal( results[0].headline, "My Blog Post", "got the correct headline from microdata");
    t.equal( results[0].author.name, "John Doe", "got the correct author name from microdata");
    t.equal( results[0]['@type'], "BlogPosting", "got the correct type for blog post");
    t.equal( results[0]['@context'], "http://schema.org/", "got the correct context for blog post");
    t.end();
});

t.test("microdata with multiple values for a property", (t) => {
    const results = microdata(`<article itemscope itemtype="http://schema.org/BlogPosting">
        <h1 itemprop="headline">My Blog Post</h1>
        <div itemprop="author" itemscope itemtype="http://schema.org/Person">
            <span itemprop="name">John Doe</span>
        </div>
        <ul>
            <li itemprop="comment" itemscope itemtype="http://schema.org/Comment">
                <span itemprop="text">Great post!</span>
                <div itemprop="author" itemscope itemtype="http://schema.org/Person">
                    <span itemprop="name">Jane Smith</span>
                </div>
            </li>
            <li itemprop="comment" itemscope itemtype="http://schema.org/Comment">
                <span itemprop="text">I didn't like it</span>
                <div itemprop="author" itemscope itemtype="http://schema.org/Person">
                    <span itemprop="name">Abe Downer</span>
                </div>
            </li>
        </ul>
    </article>`);
    t.ok( Array.isArray( results ), "got an array of results from microdata");
    t.end();
});

