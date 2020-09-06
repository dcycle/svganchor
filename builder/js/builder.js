/**
 * The main application.
 *
 * All code required for the application can be obtained using this
 * object. The application is "started" at the very bottom of this file
 * using svgAnchorBuilder.start() when the document is ready.
 */
var svgAnchorBuilder = {

  /**
   * State.
   *
   * Some functions, such as svgAnchorBuilder.sizeAxis(), will require the state
   * to be "running" in order to work. If you call such functions when the state
   * is not "running" you will get an exception.
   *
   * For the state to be running you need to load the YML file, which can be
   * done in the UI or by running:
   *
   * svgAnchorBuilder.loadConfig('yml/car/car.yml', function() { alert('config is loaded!')})
   *
   * @return string
   *   "init" if we do not have all the information we need. "running" if we
   *   do.
   */
  state: function() {
    if (this.config_file == '') {
      return 'init';
    }
    if (this.config_object == {}) {
      return 'init';
    }
    if (this.config_manager_singleton == {}) {
      return 'init';
    }
    if (this.realworldsize == 0) {
      return 'init';
    }
    return 'running';
  },

  /**
   * The config file path, populated by the user during the init phase.
   */
  config_file: '',

  /**
   * The config object loaded from the config YML.
   */
  config_object: {},

  /**
   * The topleft and bottomright of the object on the image, for mapping.
   */
  mapping: {},

  input: function(step, info) {
    return {
      step: step,
      info: info,
      clickImage: function(callback) {
        $("#picture img").off();
        $("#picture img").click(function (e) {
          var posX = $(this).position().left,
              posY = $(this).position().top;

          var tomap = {
            x: Math.floor(e.pageX - posX),
            y: Math.floor(e.pageY - posY),
            image_width: $("#picture img").width(),
            image_height: $("#picture img").height(),
          };

          console.log(74)
          console.log(tomap)

          var mapped = svgAnchorBuilder.sizeAxis().map(tomap);

          console.log(79)
          console.log(mapped)

          callback(mapped);
        });
      },
    };
  },

  onePointInput: function(step, info) {
    var object = Object.create(this.input(step, info));

    object.run = function(callback) {
      that = this;
      $("#instructions_after").html(info.instructions);
      this.clickImage(function(topleft) {
        that.step.set('y', topleft.y);
        that.step.set('x', topleft.x);
        callback();
      });
    };

    return object;
  },

  twoPointInput: function(step, info) {
    var object = Object.create(this.input(step, info));

    object.run = function(callback) {
      that = this;
      $("#instructions_after").html(info.step1instructions);
      this.clickImage(function(topleft) {
        that2 = that;
        $("#instructions_after").html(info.step2instructions);
        that.clickImage(function(botright) {
          that2.step.set('y', topleft.y);
          that2.step.set('x', topleft.x);
          that2.step.set('width', botright.x - topleft.x);
          that2.step.set('height', botright.y - topleft.y);
          callback();
        });
      });
    };

    return object;
  },

  svgBottom: function() {
    return this.sizeAxis().map(this.mapping.bottomright).y;
  },

  /**
   * Map a point on the image to a point on the SVG.
   *
   * @param point
   *   A point which was clicked on an image, for example:
   *   {x: 2, y: 3, image_height: 360, image_width: 640}.
   * @param axis
   *   "horizontal" or "vertical.
   * @param max
   *   The maximum length of objects of this type on the axis.
   * @param real
   *   The real length of this object on the axis.
   * @param svg_height
   *   Number of svg height units, e.g. 100.
   * @param svg_width
   *   Number of svg length units, e.g. 100.
   * @param img_topleft
   *   The topleft on the image.
   * @param img_bottomright
   *   The bottomright on the image.
   *
   * @return object
   *   A point on the SVG canvas, such as {x: 1, y: 3}.
   */
  mapPoint: function(point, axis, max, real, svg_height, svg_width, img_topleft, img_bottomright) {
    switch (axis) {
      case "vertical":
        var _x = "y";
        var _y = "x";
        var _image_width = "image_height";
        var _svg_width = svg_height;
        var _svg_height = svg_width;
        break;
      case "horizontal":
      default:
        var _x = "x";
        var _y = "y";
        var _image_width = "image_width";
        var _svg_width = svg_width;
        var _svg_height = svg_height;
        break;
    }

    // Start by figuring out the point, as a percentage of the total.
    var _point_x = point[_x] / point[_image_width];
    var _point_y = point[_y] / point[_image_width];

    // Figure out what the topleft and bottomright is a percentage
    var _left = img_topleft[_x] / img_topleft[_image_width];
    var _right = img_bottomright[_x] / img_bottomright[_image_width];
    var _top = 0;

    // map our point
    var _point_x_as_percentage = (_point_x - _left) / (_right - _left);
    var _point_y_as_percentage = (_point_y - _top) / (_right - _left);

    // now figure out where this should be on the svg
    var _svg_ratio = (real / max)
    var _svg_margin = (1 - (real / max)) / 2;

    var ret = {}

    ret[_x] = ((_point_x_as_percentage * _svg_ratio) + _svg_margin) * _svg_width;
    ret[_y] = _point_y * _svg_ratio * _svg_height;

    return ret;
  },

  /**
   * The real size in real-world units of this object.
   *
   * For a building in meters with a vertical axis, this might be 400, meaning
   * the building is 400 meters tall. For a car in centimeters with a horizontal
   * axis, this might be 500 meaning the car is 500 cm long.
   */
  realworldsize: 0,

  /**
   * The object used to manage configuration.
   *
   * Obtain this using this.config().
   */
  config_manager_singleton: {},

  /**
   * Obtain a step object which is used to perform a step.
   *
   * A step might be something like "create a circle", "add a point to a path",
   * etc.
   *
   * @param step
   *   key-value pairs which will be used to populate the object..
   *
   * @return object
   *   A step object.
   */
  step: function(step) {
    var candidate = null;
    [
      this.stepTopArc(),
      this.stepLineTo(),
      this.stepImage(),
      this.stepRect(),
      this.stepStartPath(),
    ].forEach(function(item, index) {
      if (item.type() == step.type) {
        candidate = item;
        return false;
      }
    });
    if (candidate == null) {
      throw "unknown step type " + step.type;
    }
    candidate.params = step;
    return candidate;
  },

  /**
   * Displays a second cursor on the screen.
   *
   * You can map it, or change its coordinates.
   *
   * For example:
   *
   * svgAnchorBuilder.displaySecondCursor(function(coords) { return {x: coords.x * 1.5, y: coords.y * 1.5, display: Math.random() <= .5}});
   *
   * (The flickering is caused by the display parameter which randomly shows
   * or hides the cursor.)
   *
   * See https://levelup.gitconnected.com/use-javascript-to-make-an-element-follow-the-cursor-3872307778b4.
   *
   * @param map
   *   A callback which will map the coordinates.
   */
  displaySecondCursor: function(map) {
    $('#second-cursor').show();

    document.addEventListener('mousemove', onMouseMove = (e) =>{
      var coords = map({
        x: e.pageX,
        y: e.pageY,
      });

      if (coords.display) {
        $('#second-cursor').show();
      }
      else {
        $('#second-cursor').hide();
      }

      $('#second-cursor').css('left', coords.x + 'px');
      $('#second-cursor').css('top', coords.y + 'px');
    });
  },

  /**
   * An abstract step type on which other step types are built.
   *
   * @return object
   *   An object to manipulate a step.
   */
  stepAbstract: function() {
    return {

      /**
       * Parameters make up the step description.
       */
      params: {},

      /**
       * Set a parameter and its value.
       */
      set: function(param, value) {
        this.params[param] = value;
        return this;
      },

      /**
       * Run the step: attempt to get values for it.
       *
       * @param info
       *   An object from the YML file which can contain extra information
       *   such as where to get the coordinates, how best to input them.
       * @param callback
       *   What to do when we're finished.
       */
      run: function(info, callback) {
        var text = this.get('instructions');
        var that = this;
        $("#instructions").html(text);

        this.input(info).run(callback);
      },

      input: function(info) {
        info.step1instructions = "Please enter the top left of your image";
        info.step2instructions = "Please enter the bottom right of your image";
        return svgAnchorBuilder.twoPointInput(this, info);
        return {
          run: function(callback) {
            callback();
          }
        }
      },

      /**
       * Get a parameter's value, throw an error if it does not exist.
       */
      get: function(param) {
        if (param in this.params) {
          return this.params[param];
        }
        throw "Required param " + param + " has not been set."
      },

      /**
       * Populate an object's parameters. Fail if some are missing.
       *
       * @param desc
       *   An array of parameters describing this object.
       * @return
       *   This object.
       *
       * @throws error if there is missing information.
       */
      populateDesc: function(desc) {
        this.params = desc;
        this.desc();
        return this;
      },

      /**
       * Return all object parameters. Fail if some are missing.
       *
       * @return
       *   This object description.
       *
       * @throws error if there is missing information.
       */
      desc: function() {
        return Object.assign({
          id: this.get('id'),
          type: this.type(),
        }, this.additionalDesc());
      }
    }
  },

  /**
   * Abstract step for a new element (as opposed to modifying existing).
   */
  stepAddToPath: function() {
    var object = Object.create(this.stepAbstract());

    /**
     * Render this step on a svg.
     *
     * @param selector
     *   A selector such as $('#result svg').
     */
    object.render = function(selector) {
      var pathselector = selector.find('.' + this.get('pathname'));

      var oldpath = pathselector.attr('d');
      var newpath = oldpath + (oldpath ? ' ' : '') + this.newPoints();
      pathselector.attr('d', newpath);
    };

    return object;
  },

  /**
   * Abstract step for a new element (as opposed to modifying existing).
   */
  stepNewElement: function() {
    var object = Object.create(this.stepAbstract());

    /**
     * Render this step on a svg.
     *
     * @param selector
     *   A selector such as $('#result svg').
     */
    object.render = function(selector) {
      var element = document.createElementNS("http://www.w3.org/2000/svg", this.newElementName());

      this.populateElement(element);

      selector.append(element);
    };

    return object;
  },

  /**
   * A step to start a path.
   *
   * For example:
   *
   * svgAnchorBuilder.stepStartPath().set('pathname', 'example').set('x', 10).set('y', 10).set('id', 0).desc();
   *
   * @return object
   *   An object to manipulate a step.
   */
  stepStartPath: function() {
    var object = Object.create(this.stepNewElement());
    object.type = function() {
      return 'start-path';
    };
    object.additionalDesc = function() {
      return {
        pathname: object.get('pathname'),
        x: object.get('x'),
        y: object.get('y')
      };
    };
    object.input = function(info) {
      info.instructions = 'Please enter a point to start the path';
      return svgAnchorBuilder.onePointInput(this, info);
    };
    object.newElementName = function() {
      return 'path';
    };
    object.populateElement = function(element) {
      element.setAttributeNS(null, "d", "M" + object.get('x') + " " + object.get('y'));
      element.setAttributeNS(null, "class", "element " + object.get('pathname'));
    };

    return object;
  },

  /**
   * A step to build a top arc.
   *
   * For example:
   *
   * svgAnchorBuilder.stepTopArc().set('pathname', 'example').set('x', 10).set('y', 10).set('id', 0).desc();
   *
   * @return object
   *   An object to manipulate a step.
   */
  stepTopArc: function() {
    var object = Object.create(this.stepAddToPath());
    object.type = function() {
      return 'top-arc';
    };
    object.additionalDesc = function() {
      return {
        pathname: this.get('pathname'),
        x: this.get('x'),
        y: this.get('y')
      };
    };
    object.newPoints = function() {
      return 'A 1 1 0 0 1 ' + this.get('x') + ' ' + this.get('y');
    };
    return object;
  },

  /**
   * A step to draw a line to a point.
   *
   * @return object
   *   An object to manipulate a step.
   */
  stepLineTo: function() {
    var object = Object.create(this.stepAddToPath());
    object.type = function() {
      return 'line-to';
    };
    object.additionalDesc = function() {
      return {
        pathname: this.get('pathname'),
        x: this.get('x'),
        y: this.get('y')
      };
    };
    object.newPoints = function() {
      return 'L ' + this.get('x') + ' ' + this.get('y');
    };
    return object;
  },

  /**
   * Render an SVG.
   *
   * For example:
   *
   * svgAnchorBuilder.render($('#result svg'), [svgAnchorBuilder.stepStartPath().set('pathname', 'example').set('x', 10).set('y', 10).set('id', 0).desc(), svgAnchorBuilder.stepTopArc().set('pathname', 'example').set('x', 100).set('y', 100).set('id', 0).desc()]);
   *
   * @param selector
   *   A selector such as $('#result svg').
   * @param steps
   *   Steps as an array. See example.
   */
  render: function(selector, steps) {
    steps.forEach(function(item, index) {
      svgAnchorBuilder.step(item).render(selector);
    });
  },

  /**
   * A step to build an image.
   *
   * For example:
   *
   * svgAnchorBuilder.stepImage().set('url', 'yml/car/assets/wheel.png').set('x', 10).set('y', 10).set('width', 100).set('height', 100).set('id', 0).desc();
   *
   * svgAnchorBuilder.stepImage().set('url', 'yml/car/assets/wheel.png').set('x', 10).set('y', 10).set('width', 30).set('height', 10).set('id', 0).render($('#result svg'));
   *
   * @return object
   *   An object to manipulate a step.
   */
  stepImage: function() {
    var object = Object.create(this.stepNewElement());
    object.type = function() {
      return 'image';
    };
    object.newElementName = function() {
      return 'image';
    };
    object.additionalDesc = function() {
      return {
        url: object.get('url'),
        x: object.get('x'),
        y: object.get('y'),
        width: object.get('width'),
        height: object.get('height')
      };
    };
    object.input = function(info) {
      return svgAnchorBuilder.twoPointInput(this, info);
    };
    object.populateElement = function(element) {
      element.setAttributeNS(null, "href", object.get('url'));
      element.setAttributeNS(null, "width", object.get('width'));
      element.setAttributeNS(null, "height", object.get('height'));
      element.setAttributeNS(null, "class", "element");
      element.setAttributeNS(null, "x", object.get('x'));
      element.setAttributeNS(null, "y", object.get('y'));
    };
    return object;
  },

  /**
   * A step to build a rectangle.
   *
   * For example:
   *
   * svgAnchorBuilder.stepRect().set('url', 'yml/car/assets/wheel.png').set('x', 10).set('y', 10).set('width', 100).set('height', 100).set('id', 0).desc();
   *
   * svgAnchorBuilder.stepRect().set('url', 'yml/car/assets/wheel.png').set('x', 10).set('y', 10).set('width', 30).set('height', 10).set('id', 0).render($('#guide'));
   *
   * @return object
   *   An object to manipulate a step.
   */
  stepRect: function() {
    var object = Object.create(this.stepNewElement());
    object.type = function() {
      return 'rect';
    };
    object.newElementName = function() {
      return 'rect';
    };
    object.additionalDesc = function() {
      return {
        x: object.get('x'),
        y: object.get('y'),
        width: object.get('width'),
        height: object.get('height')
      };
    };
    object.populateElement = function(element) {
      element.setAttributeNS(null, "width", object.get('width'));
      element.setAttributeNS(null, "height", object.get('height'));
      element.setAttributeNS(null, "x", object.get('x'));
      element.setAttributeNS(null, "y", object.get('y'));
      element.setAttributeNS(null, "class", "element");
    };
    return object;
  },

  /**
   * A step to build an image.
   *
   * For example:
   *
   * svgAnchorBuilder.stepImage().set('url', 'yml/car/assets/wheel.png').set('x', 10).set('y', 10).set('width', 100).set('height', 100).set('id', 0).desc();
   *
   * svgAnchorBuilder.stepImage().set('url', 'yml/car/assets/wheel.png').set('x', 10).set('y', 10).set('width', 30).set('height', 10).set('id', 0).render($('#result svg'));
   *
   * @return object
   *   An object to manipulate a step.
   */
  stepImage: function() {
    var object = Object.create(this.stepNewElement());
    object.type = function() {
      return 'image';
    };
    object.newElementName = function() {
      return 'image';
    };
    object.additionalDesc = function() {
      return {
        url: object.get('url'),
        x: object.get('x'),
        y: object.get('y'),
        width: object.get('width'),
        height: object.get('height')
      };
    };
    object.populateElement = function(element) {
      element.setAttributeNS(null, "href", object.get('url'));
      element.setAttributeNS(null, "width", object.get('width'));
      element.setAttributeNS(null, "height", object.get('height'));
      element.setAttributeNS(null, "x", object.get('x'));
      element.setAttributeNS(null, "y", object.get('y'));
    };
    return object;
  },

  /**
   * Get a config element, and throw an error if it is not present.
   *
   * Example:
   *
   * Start by making sure svgAnchorBuilder.state() returns 'running'.
   *
   * Then run:
   *
   * svgAnchorBuilder.configAttribute(['meta']);
   * svgAnchorBuilder.configAttribute(['meta', 'version']);
   *
   * @param arr
   *   For example if you want to fetch the value of a: b: c from your YML
   *   config file, the array would be ['a', 'b', 'c'].
   * @param reason
   *   The message to throw if the attribute is not present, for example,
   *   "we need a max length in order to calculate the relative length."
   *
   * @return mixed
   *   The value of the attribute.
   *
   * @throws error
   */
  configAttribute: function(arr, reason) {
    var cursor = this.config_object;
    var exists = true;

    var that = this;
    arr.forEach(function(item, index) {
      if (exists) {
        exists = item in cursor;
        if (exists) {
          cursor = cursor[item];
        }
        else if (that.state() == 'init') {
          throw "Please do not look for config attributes before the application is in a running (initialized) state. You can initialize the app in the UI by loading the config yml file, or by running: svgAnchorBuilder.loadConfig('yml/car/car.yml', function() { alert('config is loaded!')})";
        }
        else {
          throw "while looking for config item [" + arr.join(', ') + "], " + item + " does not exist in config (config is " + JSON.stringify(cursor) + ") (" + reason + ")";
        }
      }
    });

    return cursor;
  },

  /**
   * The preferred way to get an object to manipulate config.
   *
   * Example:
   *
   * Start by making sure svgAnchorBuilder.state() returns 'running'.
   *
   * Then run:
   *
   * svgAnchorBuilder.config().get(['meta'])
   * svgAnchorBuilder.config().get(['meta', 'version'])
   */
  config: function() {
    if ('config' in this.config_manager_singleton) {
      return this.config_manager_singleton;
    }

    this.configAttribute(['meta', 'version'], 'We need the version of the parser to use to determine if this config file is valid.');

    var that = this;
    this.config_manager_singleton = Object.create({
      config: svgAnchorBuilder.config_object,

      /**
       * Wrapper around configAttribute().
       */
      get: function(path) {
        return that.configAttribute(path, 'Please modify requirements() so that we validate that path exists at the start of execution.');
      },

      /**
       * Get the value for each required config attribute to validate the file.
       *
       * @throws error
       */
      validate: function() {
        this.requirements().forEach(function(item, index) {
          that.configAttribute(item.path, item.desc);
        });
      },

      /**
       * Requirements for this version of the config file.
       *
       * @return array
       *   Each element in the array has a path, which itself is an array,
       *   for example if a: b: c, is required in your YML file, the array
       *   would be ['a', 'b', 'c']; and a description, which explains why
       *   that information is required.
       */
      requirements: function() {
        return [
          {
            path: ['meta', 'version'],
            desc: 'The version of the config file parser to be used to parse this file (for example 1).'
          },
          {
            path: ['object', 'image', 'example_url'],
            desc: 'An example URL for your object, ususually included in your object desciption directory, such as "yml/car/assets/orange_car.jpg".',
          },
          {
            path: ['object', 'name'],
            desc: 'An object name, for example "blender" or "car".',
          },
          {
            path: ['relative_size', 'axis'],
            desc: 'the axis to use for the relative size, "horizontal" or "vertical".',
          },
          {
            path: ['relative_size', 'unit'],
            desc: 'The size unit, for example "cm".',
          },
          {
            path: ['relative_size', 'average'],
            desc: 'The average size of your object, for example 500.',
          },
          {
            path: ['relative_size', 'max'],
            desc: 'The maximum size of your object, for example 600. For example if you are building cars, you might decide that your system will not support cars over 600cm in length.',
          }
        ];
      }
    });

    switch (this.config_object.meta.version) {
      case 1:
        return this.config_v1();
      default:
        this.err('Unknown version name in config.');
    }
  },

  /**
   * Version 1 of the config parser.
   *
   * Used by config().
   *
   * Example:
   *
   * svgAnchorBuilder.config_v1().get(['meta']);
   *
   * @return object
   *   Config manipulator.
   */
  config_v1: function() {
    return this.config_manager_singleton;
  },

  /**
   * Start the application on the UI.
   *
   * Part of the GUI initialization process.
   */
  start: function() {
    this.prompt("Please insert the URL for the YML file describing your object", "yml/car/car.yml", "svgAnchorBuilder.loadConfigUI()");
  },

  /**
   * Get an image via the UI.
   *
   * Part of the GUI initialization process.
   */
  promptImage: function() {
    this.prompt("Please insert the URL for an image of your object", this.config().get(['object', 'image', 'example_url']), "svgAnchorBuilder.loadImage()");
  },

  /**
   * Prompt the user for the real-world size of the object.
   */
  promptRealWorldSize: function() {
    this.sizeAxis(this).promptRealWorldSize();
  },

  /**
   * Return an image manipulator based on the size axis.
   *
   * Example:
   *
   * svgAnchorBuilder.loadConfig('yml/car/car.yml', function() { console.log(svgAnchorBuilder.sizeAxis().axisName()); })
   * svgAnchorBuilder.loadConfig('yml/building/building.yml', function() { console.log(svgAnchorBuilder.sizeAxis().axisName()); })
   *
   * Diffent types of objects will have different size axes, for example
   * buildings might be compared by height, and cars might be compared by
   * length. This is defined in the object config's relative_size: axis as
   * being vertical or horizontal.
   *
   * @return object
   */
  sizeAxis: function() {
    switch (this.config().get(['relative_size', 'axis'])) {
      case 'vertical':
        return this.sizeAxisVertical();

      default:
        return this.sizeAxisHorizontal();
    }
  },

  /**
   * Prompt the user to click on the image, returning the location of the click.
   *
   * For example:
   *
   * Start by making sure you have an image on the page.
   *
   * Then:
   *
   * svgAnchorBuilder.imgClickPoint('select a point on the image', function(x) { console.log(x); })
   *
   * Then:
   *
   * Select a point and look at the console. You will see something like:
   *
   * {x: 2, y: 3, image_height: 360, image_width: 640}
   *
   * @param prompt_text
   *   Description of where to click.
   * @param callback
   *   Callback function, which will contain the click location and the image
   *   height and width.
   */
  imgClickPoint: function(prompt_text, callback) {
    $("#instructions").html(prompt_text);
    var that = this;
    $("#picture img").click(function (e) {
      var pos = $(this).position();
      callback({
        x: e.pageX - pos.left,
        y: e.pageY - pos.top,
        image_height: $('#picture img').height(),
        image_width: $('#picture img').width()
      });
    });
  },

  /**
   * Get the basic axis object which can be overridden for horizontal/vertical.
   *
   * @param app
   *   The app singleton, normally the svgAnchorBuilder global object, but
   *   any object can be used.
   *
   * @return object
   */
  sizeAxisSingleton: function() {
    var app = this;
    return this.size_axis_singlton = {
      /**
       * The main app, which will normally be svgAnchorBuilder.
       */
      app: app,

      /**
       * Prompt the user for the real-world size (height or width) of this
       * object.
       */
      promptRealWorldSize: function() {
        this.app.prompt("Please insert the real-world " + this.direction() + " of your object (according to the config file, average objects of this type have a " + this.direction() + " of " + this.app.config().get(['relative_size', 'average']) + " " + this.app.config().get(['relative_size', 'unit']) + ", and the maximum supported " + this.direction() + " is " + app.maxSize() + " " + this.app.config().get(['relative_size', 'unit']) + ")", this.app.config().get(['relative_size', 'average']), "svgAnchorBuilder.loadRealWorldSize()");
      },

      /**
       * Knowing what the real world size of the object is, locate it on image.
       *
       * For example,
       *
       * * our SVG is 100 units wide (which is always the case)
       * * our picture may be, say, 500 pixels side, which may change if the
       *   user repositions the screen.
       * * our real world maximum width for our object is  meters.
       * * our current object is 4 meters long
       *
       * This function will allow the user to click on the leftmost and right-
       * most (or topmost and bottommost) points of the object on the picture.
       *
       * Let's say our axis is horizontal and the user clicks on points:
       *
       * * 40px (which will be construed as 40/500, or 8% of the canvas)
       * * 300px (which will be 60% of the canvas)
       *
       * This information tells us that 52% of the canvas is the equivalent
       * of a 4 meter long object. This information will then be passed to
       * ::selectSize() to set up the mapping with the SVG.
       *
       * @param callback
       *   The callback to call when selecting the size, and computing it,
       *   is done.
       */
      selectSizeUI: function(callback) {
        var obj_name = app.config().get(['object', 'name']);

        var that = this;
        this.app.imgClickPoint("Please click on the topleft point of your " + obj_name, function(topleft) {
          that.app.imgClickPoint("Please click on the bottomright point of your " + obj_name, function(bottomright) {
            that.selectSize(topleft, bottomright);
            callback();
          });;
        });
      },

      /**
       * See more in selectSizeUI(), above.
       *
       * Given a start and end point on the image, as well as the real-world
       * object size, and maximum size of objects of this type, calculate the
       * mapping between the image and the svg for the axis.
       *
       * @param topleft
       *   An object with x, y, image_width, image_height;
       * @param bottomright
       *   An object with x, y, image_width, image_height;
       */
      selectSize: function(topleft, bottomright) {
        this.app.mapping = {
          // For example x might be 10%
          topleft: topleft,
          // For example x might be 90%
          bottomright: bottomright
        };
        mapped_topleft = this.map(topleft);
        mapped_bottomright = this.map(bottomright);

        // show a guide.
        svgAnchorBuilder.stepRect().set('x', mapped_topleft.x).set('y', mapped_topleft.y).set('width', mapped_bottomright.x - mapped_topleft.x).set('height', mapped_bottomright.y - mapped_topleft.y).set('id', 'guide-1').render($('#guide'));

        var that = this;
        svgAnchorBuilder.displaySecondCursor(function(cursor) {
          ret = that.map({
            x: cursor.x - $('#picture').position().left,
            y: cursor.y - $('#picture').position().top,
            image_height: $('#picture img').height(),
            image_width: $('#picture img').width(),
          });

          ret.display = ret.x >= 0 && ret.x <= 100 && ret.y >= 0 && ret.y <= 100;

          // now we have the return as if the total width of the svg is 100
          // we need to figure out what it would be on the real width
          ret.x = ret.x / 100 * $('svg#object').width();
          ret.y = ret.y / 100 * $('svg#object').height();

          // Finally offset the position.
          ret.x += $('svg#object').position().left;
          ret.y += $('svg#object').position().top;

          return ret;
        });
      },

      /**
       * Map a point clicked on the image to a point on the svg.
       *
       * @param point
       *   An object with x, y, image_width, image_height;
       *
       * @return object
       *   An object with x, y on the svg.
       */
      map: function(point) {
        var ret = this.app.mapPoint(point, this.axisName(), this.app.maxSize(), this.app.realworldsize, 100, 100, this.app.mapping.topleft, this.app.mapping.bottomright);

        return ret;
      },
    }
  },

  /**
   * Get a size axis object for objects like buildings.
   *
   * @return object
   */
  sizeAxisVertical: function() {
    var object = Object.create(this.sizeAxisSingleton());
    object.axisName = function() {
      return "vertical";
    };
    object.direction = function() {
      return "height";
    };
    object.directionStart = function() {
      return "lowermost";
    };
    object.getPos = function(point) {
      return point.top;
    };
    object.directionEnd = function() {
      return "uppermost";
    };
    return object;
  },

  /**
   * Get a size axis object for objects like cars.
   *
   * @return object
   */
  sizeAxisHorizontal: function() {
    var object = Object.create(this.sizeAxisSingleton());
    object.direction = function() {
      return "width";
    };
    object.axisName = function() {
      return "horizontal";
    };
    object.directionStart = function() {
      return "leftmost";
    };
    object.getPos = function(point) {
      return point.left;
    };
    object.directionEnd = function() {
      return "rightmost";
    };
    return object;
  },

  /**
   * Get the maximum size in the preferred unit of objects of this type.
   *
   * @return
   *   A max size, for example 600.
   */
  maxSize: function() {
    return this.config().get(['relative_size', 'max']);
  },

  /**
   * Prompt the user for some information.
   *
   * @param message
   *   The prompt message, for example "enter a number between 1 and 10".
   * @param example
   *   A required example, for example 5.
   * @param callback_as_string
   *   A callback to be inserted in code, for example
   *   "svgAnchorBuilder.loadConfigUI()". That callback can retrieve the
   *   entered value by calling this.promptVal();
   */
  prompt: function(message, example, callback_as_string) {
    $("#instructions").html(message);
    $("#instructions_after").html('<input class="prompt" value="' + example + '" type="text" name="prompt"><br><br><button onClick="' + callback_as_string + '">OK</button>')
  },

  /**
   * Meant be used by the callback function used with prompt().
   *
   * That function can call this.promptVal() to get the value of the prompt.
   * Can only be called once, because the value is cleared before it is
   * returned.
   *
   * See the loadConfigUI() function for an example.
   *
   * @return prompt
   *   Value of the previous prompt.
   */
  promptVal: function() {
    var ret = $("#instructions_after input.prompt").val();
    this.clear();
    return ret;
  },

  log: function(text) {
    $('#path .log').append(text + "\n");
  },

  err: function(text) {
    console.error(text);
    $("#error").append('<div class="error">' + text + '</div>');
    console.log(new Error);
    this.log('ERROR: ' + text);
  },

  /**
   * Callback to load config file following a prompt.
   */
  loadConfigUI: function() {
    this.loadConfig(this.promptVal(), function() {
      svgAnchorBuilder.promptImage();
    });
  },

  /**
   * Load the config file.
   *
   * For example:
   *
   * svgAnchorBuilder.loadConfig('yml/car/car.yml', function() { alert('config is loaded!')})
   *
   * @param file
   *   A path to the file.
   * @param callback
   *   What to do when the file is loaded.
   */
  loadConfig: function(file, callback) {
    this.config_file = file;
    this.log('Loading config file ' + this.config_file);
    var that = this;
    $.get(this.config_file, function(response, status) {

      that.log('Loaded config file ' + that.config_file);
      that.log('Parsing config file with jsyaml');
      that.config_object = jsyaml.load(response);

      try {
        that.config().validate();
      }
      catch (err) {
        that.err(err);
        that.start();
        return;
      }

      callback();
    }).fail(function() {
      this.err("The file does not seem to exist ($.get() called the .fail() function)");
      this.start();
    });
  },

  done: function() {
    $("#instructions").html("All done!");
  },

  /**
   * Get information for all required steps.
   *
   * This function is recursive, and each time it is called, it is with one
   * less step.
   *
   * @param steps
   *   Array of steps from the config file.
   */
  addInfo: function(steps) {
    this.clear();
    if (!steps.length) {
      this.done();
      return;
    }
    var step = steps.shift();

    var that = this;
    var step_object = this.step(step);
    step_object.run(step, function() {
      step_object.render($('#result svg'));
      that.addInfo(steps);
    });
  },

  /**
   * Position a vertical line on the drawing, to serve as a grid.
   *
   * @param x
   *   The x location of the vertical line.
   */
  vgrid: function(x) {
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    line.setAttributeNS(null,"x1", x);
    line.setAttributeNS(null,"y1", 0);
    line.setAttributeNS(null,"x2", x);
    line.setAttributeNS(null,"y2", 1000);
    line.setAttributeNS(null,"stroke-width"  ,"2");
    line.setAttributeNS(null,"stroke","blue");

    $('#result svg').append(line);
  },

  /**
   * Reposition coordinates on the canvas.
   *
   * Will return the coordinates of the object as if the image contained an
   * object of the maximum available size.
   *
   * @param x
   *   X coordinates.
   * @param y
   *   Y coordinates.
   *
   * @return object
   *   object with x and y properties.
   */
  reposition: function(x, y) {
    // leftmost is for example 30
    // rightmost is for example 700
    var pixellength = this.rightmost - this.leftmost;
    // pixellength is for example 670
    // reallength is for example 400
    var x2 = (x - this.leftmost) * this.realworldsize / pixellength;

    // we now need to center 400 on the canvas
    // config.largest is the canvas length, e.g. 500
    var margin = (this.maxSize() - this.realworldsize) / 2;

    return {
      x: Math.floor(x2 + margin),
      y: Math.floor(y)
    }
  },

  loadImage: function() {
    this.image = this.promptVal();
    $('#picture').html('<img src="' + this.image + '"/>');
    this.log('Image from ' + this.image);
    this.promptRealWorldSize();
  },

  /**
   * Callback to user prompt to get the real size of an object.
   *
   * For example, if an image represents a blender, which in the real world
   * is 20 cm long, then this will insert 20 in the realworldsize variable, which
   * will allow us then create relative-sized SVGs where larger blenders are
   * larger SVGs.
   */
  loadRealWorldSize: function() {
    this.realworldsize = this.promptVal();
    var that = this;
    this.sizeAxis().selectSizeUI(function() {
      that.addInfo(that.config().get(['steps']));
    });
  },

  clear: function() {
    $("#error").html("");
    $("#instructions").html("");
    $("#instructions_after").html("");
  }

}

/**
 * Start the application. $ will not be defined during unit tests.
 */
if (typeof $ !== "undefined") {
  $(document).ready(function(){
    svgAnchorBuilder.start();
  });
}

// Required for unit tests.
if (typeof module !== "undefined") {
  module.exports = {
    svgAnchorBuilder: svgAnchorBuilder
  }
}
