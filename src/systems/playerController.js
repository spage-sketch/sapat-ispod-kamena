export default class PlayerController {
  constructor(scene) { this.scene = scene; }

  update(deltaSeconds) {
    const { keys, cursors } = this.scene;
    const hero = this.scene.state.hero;
    let dx = Number(keys.d.isDown || cursors.right.isDown) - Number(keys.a.isDown || cursors.left.isDown);
    let dy = Number(keys.s.isDown || cursors.down.isDown) - Number(keys.w.isDown || cursors.up.isDown);
    if (!dx && !dy) return;

    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;
    hero.faceX = Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0;
    hero.faceY = Math.abs(dy) >= Math.abs(dx) ? Math.sign(dy) : 0;

    const nextX = hero.x + dx * hero.speed * deltaSeconds;
    const nextY = hero.y + dy * hero.speed * deltaSeconds;
    if (this.scene.tileAt(Math.floor(nextX + Math.sign(dx) * .26), Math.floor(hero.y)) !== "#") hero.x = nextX;
    if (this.scene.tileAt(Math.floor(hero.x), Math.floor(nextY + Math.sign(dy) * .26)) !== "#") hero.y = nextY;
  }
}
