# dynamizr

*dynamizr* is a website boilerplate built on top of some Backbone components. It's aim is enhance a page-based web architecture (like a CMS) to dynamically load markup content and JavaScript modules. This let's you increase your sites experience and hopefully makes developing more fun ;)

The idea behind *dynamizr* is to structure all the websites "interactive parts" as __Modules__ (actually extended Backbone Views) and to load them only if demanded (via requirejs). In the configuration file every Module is mapped to a specific selector path (i.e. `#myWidget`), so whenever a selector is located in the documents markup, corresponding Module(s) will be instantiated and thereby associated with the selectors element.

*dynamizr* knows two types of Modules: __Frontend Modules__, being initally instantiated, and __Page Modules__, being instantiated only in the areas of __Dynamic Sections__. A Dynamic Section is defined by a selector path – whenever a new page gets requested and fetched, the section elements content is being refreshed using AJAX. A Dynamic Sections markup gets parsed for __Page Modules__ every time it refreshes.

By providing __Dynamic Sections__, *dynamizr* selectively refreshes contents by the use of AJAX (prevents the browser from reloading). Furthermore every Dynamic Section can be mapped to a __Transition Module__ allowing you to orchestrate specific animations when moving between pages.     

# Example

## Showcase

To install the required depencendies use `npm install` and `bower install` in your Terminal.

The folder `example` represents a scenario with three static HTML files. Just open the first file to navigate between them. Try something like `http://localhost:8888/dynamizr/example/`

There are two *Dynamic Sections* defined (main content and navigation), both using a crossfade transition. Whenever you click in a navigation link, the headers background color changes because of a *Frontend Module* which injected this functionality. On Page 2 a gallery is inserted as a *Page Module* which supports Fancybox.

## Project Structure

Beside the html files, the __example__ folder contains one build.js file, three configuration files and five folders:

- __Configuration Files__
    - __config.js__: the requirejs configuration including paths and dependencies
    - __website.js__: the global website configuration including Module and Dynamic Section definitions
    - __main.js__: the websites kick-off and event flow

- __Module Folders__
    - __modules-fe__: contains example projects *Page Modules* (just one)
    - __modules-pg__: contains example projects *Frontend Modules* (just one)
    - __transitions__: contains example projects *Transition Modules* (just one) 
- __Assets Folders__
    - __libs__: contains JavaScript libraries which are not that bower-friendly, i.e. require.js
    - __css__: contains cascading stylesheets

# Overview

While __example__ folder only contains the project specific assets and configurations, the root folders __core__, __managers__ and __prototypes__ are containing *dynamizrs* main file set:

 - __core__: contains the basic files to run the frontend
 - __managers__: contains some helpful managers
 - __prototypes__: contains the prototypes "module" and "transition" to extend project modules from

