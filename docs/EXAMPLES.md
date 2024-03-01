# Examples

## Turtle graphics

The classic way to use L-Systems is to visualize axioms with turtle graphics. The standard rules, found in Aristid Lindenmayer's and Przemyslaw Prusinkiewicz's classic work [Algorithmic Beauty of Plants](http://algorithmicbotany.org/papers/#abop) (ABOP) can be easily implented this way, to output the fractals onto a Canvas.

### Canvas

```ts
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.translate(canvas.width / 2, canvas.height / 2);

// Initialize a koch curve L-System that uses commands to draw the fractal onto a Canvas
const kochSystem = new LSystem({
  axiom: 'F++F++F',
  productions: { F: 'F-F++F-F' },
  commands: {
    // Draw a line with length relative to the current iteration (half the previous length for each step) and translate the current position to the end of the line
    F: () => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 40 / (koch.iterations + 1));
      ctx.stroke();
      ctx.translate(0, 40 / (koch.iterations + 1));
    },
    // Rotate the canvas by 60 degrees
    '+': () => {
      ctx.rotate(Math.PI / 3);
    },
    // Rotate the canvas by -60 degrees
    '-': () => {
      ctx.rotate(-Math.PI / 3);
    }
  }
});

kochSystem.iterate(3);
kochSystem.run();
```

As this library is not opinionated about what your results should be like, you can write your own commands. Therefore you can draw 2D turtle graphics as seen above, but also 3D ones with WebGL/three.js, or even do other things like creating sound!

### Three.js

#### Turtle class

```ts
import { Vector3 } from 'three';

type TurtleParameters = {
  position?: Vector3;
  xAxis?: Vector3;
  yAxis?: Vector3;
  zAxis?: Vector3;
  attributes?: Record<string, number | string>;
};

class Turtle {
  position: Vector3;
  xAxis: Vector3;
  yAxis: Vector3;
  zAxis: Vector3;
  attributes: Record<string, number | string>;

  constructor({
    position = new Vector3(0, 0, 0),
    xAxis = new Vector3(0, 1, 0),
    yAxis = new Vector3(1, 0, 0),
    zAxis = new Vector3(0, 0, -1),
    attributes = {}
  }: TurtleParameters = {}) {
    this.position = position;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.zAxis = zAxis;
    this.attributes = attributes;
  }

  move(step: number) {
    const vector = this.xAxis.clone().multiplyScalar(step);
    this.position.addVectors(this.position, vector);
  }

  turn(theta: number) {
    this.xAxis.applyAxisAngle(this.zAxis, theta);
    this.yAxis.applyAxisAngle(this.zAxis, theta);
  }

  pitch(theta: number) {
    this.xAxis.applyAxisAngle(this.yAxis, theta);
    this.zAxis.applyAxisAngle(this.yAxis, theta);
  }

  roll(theta: number) {
    this.yAxis.applyAxisAngle(this.xAxis, theta);
    this.zAxis.applyAxisAngle(this.xAxis, theta);
  }

  copy(target: Turtle) {
    this.position.copy(target.position);
    this.xAxis.copy(target.xAxis);
    this.yAxis.copy(target.yAxis);
    this.zAxis.copy(target.zAxis);
  }

  clone() {
    return new Turtle({
      position: this.position.clone(),
      xAxis: this.xAxis.clone(),
      yAxis: this.yAxis.clone(),
      zAxis: this.zAxis.clone(),
      attributes: { ...this.attributes }
    });
  }
}
```

#### Turtle usage

```ts
// Initialize turtle
let turtle = new Turtle();
const stack: Turtle[] = [];

// Initialize polygon
let polygon: Vector3[] = [];
const polygons: Array<Vector3[]> = [];

// System constants
const step = 0.1;
const theta = Math.PI / 6;

const system = new LSystem({
  commands: {
    f: () => {
      turtle.move(step);
    },
    F: () => {
      const from = turtle.position.clone();
      turtle.move(step);
      const to = turtle.position.clone();
      // -> Draw from -> to
    },
    '+': () => {
      turtle.turn(theta);
    },
    '-': () => {
      turtle.turn(-theta);
    },
    '\\': () => {
      turtle.roll(theta);
    },
    '/': () => {
      turtle.roll(-theta);
    },
    '&': () => {
      turtle.pitch(theta);
    },
    '^': () => {
      turtle.pitch(-theta);
    },
    '|': () => {
      turtle.turn(Math.PI);
    },
    '!': () => {
      turtle.decrease(value);
    },
    '[': () => {
      // Push the current state of the turtle onto a pushdown stack
      stack.push(turtle.clone());
    },
    ']': () => {
      // Pop a state from the stack and make it the current state of the turtle
      turtle = stack.pop() as Turtle;
    },
    '{': () => {
      // Start a new polygon by pushing the current polygon on the polygon stack and creating an empty current polygon
      polygons.push(polygon);
      polygon = [];
    },
    '}': () => {
      // Draw the current polygon using the specified vertices, then pop a polygon from the stack and make it the current polygon
      // -> Draw current polygon
      polygon = polygons.pop() as Vector3[];
    },
    '.': () => {
      // Append the new vertex to the current polygon
      const vertex = turtle.position.clone();
      polygon.push(vertex);
    }
  }
});
```
