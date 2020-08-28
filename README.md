svgAnchor
=====

[Click here to see the example]()

Have you ever wanted to take a photograph of something (a car, say, or a blender), and have a tool which converts it to an svgAnchor?

This is not that tool! (For that, see tools such as [picsvg.com](https://picsvg.com)).

svgAnchor will help build an simple SVG based on an image **with a set number of elements**, allowing you blend the results easily.

Example
-----

[Click here to see the example]()

I want to take two car models, a 1980 Honda Civic, and a 2020 Honda Civic, and visualize how the two car models differ over time, by blending them together.

Step 1
-----

Create a YML file which defines what you are modeling, and the elements that make it up (elements are things like wheels, windows, etc.)

[The YML file for cars looks like this]()

Step 2
-----

Create two (or more) car SVGs using the svgAnchor build tool.

[See the build tool for cars here]()

If you use Docker, you can also run:

    cd path/to/svg_anchor
    ./scripts/deploy.sh

Then visit http://0.0.0.0:8085/builder.html

Step 3
-----

Use the code displayed in the builder to add to the objects folder. If you can have several objects (cars in this case), you can name them 1980civic.txt and 2020civic.txt, [like this]().

Step 4
-----

* To view the 1980 civic, visit [this page]()
* To view the 2020 civic, visit [this page]()
* To see a blend of the two, visit [this page]()

On Docker you can visit http://0.0.0.0:8085/result.html?1980civic

About object description YAML files
-----

You might create a YAML file for a car which works fine but lacks, say, a proper way to make bumpers.

[You might add the bumpers later on](). When you do this, svgAnchor will attempt to still make your old svgs blend with your new ones. But you may still want to modify your old SVGs.

Credits
-----

* Photo of orange car [courtesy of Dan Gold on Unsplash](https://unsplash.com/photos/N7RiDzfF2iw).
* Photo of red car [courtesy of Michael Heuser on Unsplash](https://unsplash.com/photos/kNv2wy40YSs)
