class Magpie {
  static DOME_WIDTH = 15;
  static DOME_HEIGHT = 30;
  static PLATFORM_WIDTH = Magpie.DOME_WIDTH + 3;
  static PLATFORM_HEIGHT = 3;
  static BEAM_WIDTH = 50;
  static BEAM_HEIGHT = 60;
  static WINDOW_WIDTH = Magpie.DOME_WIDTH / 2;
  static WINDOW_HEIGHT = Magpie.DOME_HEIGHT / 4;
  /** Where captured junk sits, in the Magpie's own frame (below the ship). */
  static CARGO_Y = 40;

  physics;
  beam;

  /** If we've caught space junk, use a direct reference to draw it. */
  capturedJunk;

  constructor() {
    this.physics = new Physics();
    this.beam = false;
    this.capturedJunk = null; // intentionally empty
  }

  draw() {
    push();
    drawEverywhere({
      offset: this.physics,
      drawFn: () => {
        if (this.capturedJunk) {
          push();
          rotate(this.physics.rotation);
          translate(0, Magpie.CARGO_Y);
          Junk.drawJunk();
          pop();
        }
        Magpie.drawMagpie({ rotation: this.physics.rotation, beam: this.beam });
        if (game.debug) {
          this.physics.draw();
        }
      },
    });
    pop();
  }

  /** Sets the captured junk to the given one, and turns off the beam. */
  captureJunk(junk) {
    this.capturedJunk = junk;
    this.beam = false;
  }

  static drawMagpie({ rotation, beam }) { //I'm still trying to understand this, the concept of it being "static" instead of "function", why?
  push();
  rotate(rotation);
    if (beam) {
    fill(255, 251, 0, 127);
    triangle(0, 0, Magpie.BEAM_WIDTH / 2, Magpie.BEAM_HEIGHT, -Magpie.BEAM_WIDTH / 2, Magpie.BEAM_HEIGHT);
  }
  rectMode(CENTER);
  fill("#494d5b");
  rect(0, 0, Magpie.DOME_WIDTH, Magpie.DOME_HEIGHT, 8);
  fill("#494d5b");
  rect(
    0,
    Magpie.DOME_HEIGHT / 2,
    Magpie.PLATFORM_WIDTH,
    Magpie.PLATFORM_HEIGHT,
  );

  push();
  rectMode(CORNER);
  fill("#a8fbff");
  const winX = Magpie.DOME_WIDTH / 2 - Magpie.WINDOW_WIDTH;
  const winY = -Magpie.WINDOW_HEIGHT;
  rect(winX, winY, Magpie.WINDOW_WIDTH, Magpie.WINDOW_HEIGHT, 1.5);
  pop();

  pop();
}



  move(delta) {
    this.physics.move(delta, { constrain: true });
    if (this.capturedJunk) {
      // Keep the junk's real position in sync with where it's drawn, so game
      // logic (like the mothership pickup) sees it in the right place. Set up
      // the Magpie's frame, then ask where the cargo spot is on the canvas.
      push();
      translate(this.physics.x, this.physics.y);
      rotate(this.physics.rotation);
      const cargo = worldToScreen(0, Magpie.CARGO_Y);
      pop();
      this.capturedJunk.physics.x = cargo.x;
      this.capturedJunk.physics.y = cargo.y;
    }
  }

  /**
   * True when the beam is on and the given canvas point is inside the beam's
   * triangle.
   **/
  beamContains({ x, y }) {
    // if the beam is off, bail out.
    if (!this.beam) {
      return false;
    }
    let inside = false;
    // the drawEverywhere function doesn't actually have to draw anything! Here
    // we're reusing it with a different 'draw' function that actually tests
    // if the x/y location is inside the beam triangle, and returns true/false.
    drawEverywhere({
      offset: this.physics,
      drawFn: () => {
        rotate(this.physics.rotation);
        // Convert the canvas point into the Magpie's own frame: as if the
        // Magpie sat at (0, 0) pointing up, which is how drawMagpie draws the
        // beam. The beam's top point is at (0, 0) and it widens as y grows.
        const p = screenToWorld(x, y);
        const halfWidth = (p.y / Magpie.BEAM_HEIGHT) * (Magpie.BEAM_WIDTH / 2);
        const withinDepth = p.y >= 0 && p.y <= Magpie.BEAM_HEIGHT;
        if (withinDepth && Math.abs(p.x) <= halfWidth) {
          inside = true;
        }
      },
    });
    return inside;
  }

  /**
   * Set the beam state to on (true) or off (false). We can only turn on the
   * beam if we are not carrying junk.
   **/
    enableBeam(v) {
  if (!v) {this.beam = v;}
  if (!this.capturedJunk) {
    this.beam = v;
  }
}
}