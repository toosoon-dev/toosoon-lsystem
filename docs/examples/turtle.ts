// import { Vector3 } from 'three';

// export type TurtleParameters = {
//   position?: Vector3;
//   xAxis?: Vector3;
//   yAxis?: Vector3;
//   zAxis?: Vector3;
//   attributes?: { [key: string]: number | string };
// };

// export default class Turtle {
//   position: Vector3;
//   xAxis: Vector3;
//   yAxis: Vector3;
//   zAxis: Vector3;
//   attributes: { [key: string]: number | string };

//   constructor({
//     position = new Vector3(0, 0, 0),
//     xAxis = new Vector3(0, 1, 0),
//     yAxis = new Vector3(1, 0, 0),
//     zAxis = new Vector3(0, 0, -1),
//     attributes = {}
//   }: TurtleParameters = {}) {
//     this.position = position;
//     this.xAxis = xAxis;
//     this.yAxis = yAxis;
//     this.zAxis = zAxis;
//     this.attributes = attributes;
//   }

//   move(step: number) {
//     const partial = this.xAxis.clone().multiplyScalar(step);
//     this.position.addVectors(this.position, partial);
//   }

//   turn(theta: number) {
//     this.xAxis.applyAxisAngle(this.zAxis, theta);
//     this.yAxis.applyAxisAngle(this.zAxis, theta);
//   }

//   pitch(theta: number) {
//     this.xAxis.applyAxisAngle(this.yAxis, theta);
//     this.zAxis.applyAxisAngle(this.yAxis, theta);
//   }

//   roll(theta: number) {
//     this.yAxis.applyAxisAngle(this.xAxis, theta);
//     this.zAxis.applyAxisAngle(this.xAxis, theta);
//   }

//   copy(target: Turtle) {
//     this.position.copy(target.position);
//     this.xAxis.copy(target.xAxis);
//     this.yAxis.copy(target.yAxis);
//     this.zAxis.copy(target.zAxis);
//   }

//   clone() {
//     return new Turtle({
//       position: this.position.clone(),
//       xAxis: this.xAxis.clone(),
//       yAxis: this.yAxis.clone(),
//       zAxis: this.zAxis.clone(),
//       attributes: { ...this.attributes }
//     });
//   }
// }

// const turtle = new Turtle();
// const step = 0.1;
// const theta = Math.PI;

// const system = new LSystem({
//   commands: {
//     f: () => {
//       turtle.move(step);
//     },
//     F: () => {
//       const from = turtle.position.clone();
//       turtle.move(step);
//       const to = turtle.position.clone();
//       // from -> to
//     },
//     '+': () => {
//       turtle.turn(angle);
//     },
//     '-': () => {
//       turtle.turn(-angle);
//     },
//     '\\': () => {
//       turtle.roll(angle);
//     },
//     '/': () => {
//       turtle.roll(-angle);
//     },
//     '&': () => {
//       turtle.pitch(angle);
//     },
//     '^': () => {
//       turtle.pitch(-angle);
//     },
//     '|': () => {
//       turtle.turn(PI);
//     },
//     '!': () => {
//       turtle.decrease(value);
//     },
//     '[': () => {
//       // Push the current state of the turtle onto a pushdown stack.
//       // The information saved on the stack contains the turtle’s position and orientation, and possibly other attributes.
//       stack.push(turtle.clone());
//     },
//     ']': () => {
//       // Pop a state from the stack and make it the current state of the turtle.
//       turtle = stack.pop();
//     },
//     '{': () => {
//       // Start a new polygon by pushing the current polygon on the polygon stack and creating an empty current polygon.
//       polygon = [];
//       polygons.push(polygon);
//     },
//     '}': () => {
//       // Draw the current polygon using the specified vertices, then pop a polygon from the stack and make it the current polygon.
//       polygon = polygons.pop() as Vector3[];
//       // draw current polygon
//     },
//   }
// });
