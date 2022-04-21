# Invoice Management App

A tool to manage invoices, created for my Portfolio, located at https://www.ethancroft.co.uk.

## Tools and Resources

-   JavaScript
-   Tailwind CSS
-   Webpack
-   [Front End Mentors](https://www.frontendmentor.io) (Design)

## Future Features

-   Writing tests
-   Save an invoice as a draft
-   Save invoice as PDF
-   Sort invoices option (newest to oldest, highest to lowest)
-   Separate views into smaller files

## Review

#### Tailwind

I gave Tailwind, the utility-first CSS framework, a go for this project, as I wanted to get straight into the build. Instead of setting up SCSS with Gulp - which is my go-to when I start a project - I could start building elements with JavaScript, drop the utility classes into them, and see them come to life... quickly.

Tailwind kept me in the JS 'zone' - I didn't need to go back and forth between the HTML, CSS and JavaScript to create elements, and I didn't need to consider BEM, my other go-to when building projects.

While the above saved me time, it wasn't perfect, particularly as the project got bigger. The JavaScript became messy, and more difficult to read and manage. When debugging, elements were not easily identifiable by their class list. If I was using BEM, an icon to a button may be named "button\_\_icon". In Tailwind, it's:

`fa-solid fa-plus bg-white w-[34px] text-purple-600 group-hover:text-purple-500 py-[10px] transition-colors duration-100 rounded-full mr-2 md:mr-4 shrink-0`

There are ways I could've got round this: I could have still named elements using the BEM methodology, but I wasn't keen on having classes that wasn't associated to any CSS. Tailwind also has a components layer, for elements with complicated classes. Instead, for components I reused a lot, I created reusable elements with the necessary HTML classes already set.

A usual side effect of using Tailwind was that it reminded me of the importance of being concise and thoughtful in terms of naming JavaScript variables. Since looking at the HTML classes felt like _gobbledygook_ on first glance, variable names like `fromInputsFieldset`, `fromInputsLegend`, and `fromInputsColumns` helped me quickly differentiate elements from one another in the JavaScript.

#### Pure JavaScript

It was really fun not using a framework to build an app. For me, there's always a level of freedom not using one.

It allowed me to explore different methods of manipulating the DOM, and learn how to manage and track the ever-changing state of an app.

#### MVC

This is my first personal project using an MVC (Model, View, Controller) approach. This was really fun. It was really nice having a clear separation of the data and the view, and to be able to isolate them completely.

There was a small learning curve, but once I got into it, bringing the Model and View together into the Controller was a very satisfying thing!

#### Front End Masters

In the past, my personal projects tend to get held up by the design, before I've even started writing any JavaScript. This time I wanted to do things differently, so I found Front End Masters. Front End Masters gives you a project idea and the design assets for the project, via Figma or Sketch, as it would be in a commercial setting.

For me, this has been a life saver. It has cut out my biggest bottleneck - coming up with the design for my app. I could then concentrate on what I want to work on the most - JavaScript. The designs look great too.
