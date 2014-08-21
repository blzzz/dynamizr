# dynamizr

*dynamizr* is a website boilerplate built on top of some Backbone components. It's aim is enhance a page-based web architecture (like a CMS) to dynamically load markup content and JavaScript modules. This let's you increase your sites experience and hopefully makes developing more fun ;)

The idea behind *dynamizr* is to structure all the websites "interactive parts" as __Modules__ (actually extended Backbone Views) and to load them only if demanded (via requirejs): In the configuration file every Module is mapped to a specific selector path (i.e. `#myWidget`), so whenever a selector is located in the documents markup, corresponding Module(s) will be instantiated and thereby associated with the selectors element.

*dynamizr* knowa two types of Modules: __Frontend Modules__, being initally instantiated, and __Page Modules__, being instantiated only in the areas of __Dynamic Sections__. A Dynamic Section is defined by a selector path – whenever a new page gets requested and fetched, the section elements content is being refreshed using AJAX. A Dynamic Sections markup gets parsed for __Page Modules__ every time it refreshes.

By providing __Dynamic Sections__, *dynamizr* selectively refreshes contents by the use of AJAX (prevents the browser to reload). Furthermore every Dynamic Section is mapped to a __Transition Module__ allowing you to add specific animations when moving between pages.     

# Example

## Showcase

The folder `example` represents a scenario with three static HTML files. Just open the first file to navigate between them. Try something like `http://localhost:8888/dynamizr/example/`

There are two *Dynamic Sections* defined (main content and navigation), both using a crossfade transition. Whenever you click in a navigation link the headers background color changes because of a *Frontend Module* injecting this functionality. On Page 2 a gallery is inserted as a *Page Module* which supports Fancybox.

## Explanation

Beneath the html files the `example` folder contains one build.js file, three configuration files and five folders:

- __Configuration Files__
    - __config.js__: the requirejs configuration including paths and dependencies
    - __website.js__: the global website configuration including Module and Dynamic Section definitions
    - __main.js__: the websites kick-off and event flow

- __Module Folders__
    - __modules-fe__: contains example projects *Page Modules* (just one)
    - __modules-pg__: contains example projects *Frontend Modules* (just one)
    - __transitions__: contains example projects *Transition Modules* (just one)
    - 
- __Assets Folders__
    - __libs__: contains JavaScript libraries which are not that bower-friendly, i.e. require.js
    - __css__: contains 
