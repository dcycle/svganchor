svgAnchor
=====

[Click here to see the example](https://dcycle.github.io/svganchor/builder/blend.html)

Have you ever wanted to take a photograph of something (a car, say, or a blender), and have a tool which converts it to an svgAnchor?

This is not that tool! (For that, see tools such as [picsvg.com](https://picsvg.com)).

svgAnchor will help build an simple SVG based on an image **with a set number of elements (a 10-point polygon, an image and circle for example)**, allowing you to create keyframes and blend the results easily.

Example
-----

[Click here to see the example](https://dcycle.github.io/svganchor/builder/blend.html)

I want to take two car models and visualize how the two car models differ over time, by blending them together.

Step 1
-----

Create a YML file which defines what you are modeling, and the elements that make it up (elements are things like wheels, windows, etc.). If you do not have a YML file and want to follow along, you can use the default provided car YML, and move directly to step 2.

[The YML file for cars looks like this](https://dcycle.github.io/svganchor/builder/yml/car/car.yml)

Step 2
-----

Create two (or more) car SVGs using the svgAnchor build tool.

[See the build tool for cars here](https://dcycle.github.io/svganchor/builder/)

If you use Docker, you can also run:

    cd path/to/svg_anchor
    ./scripts/deploy.sh

Then visit http://0.0.0.0:8085/builder.html

Step 3
-----

Copy your code and blend your items together, [like this](https://dcycle.github.io/svganchor/builder/blend.html)

Credits
-----

* Photo of orange car [courtesy of Dan Gold on Unsplash](https://unsplash.com/photos/N7RiDzfF2iw).
* Photo of red car [courtesy of Michael Heuser on Unsplash](https://unsplash.com/photos/kNv2wy40YSs)
