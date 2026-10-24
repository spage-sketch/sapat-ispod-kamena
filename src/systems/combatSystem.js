import { characters } from "../data/characters.js";

const rules = characters.caveGuardian;

export function createEnemyState() {
  return { x: 15, y: 6, hp: rules.maxHp, alive: true };
}

export function isPlayerAttackReady(now, lastAttack) {
  return now - lastAttack >= rules.playerAttackCooldownMs;
}

export function canPlayerHit(hero, enemy) {
  const dx = enemy.x - hero.x;
  const dy = enemy.y - hero.y;
  const distance = Math.hypot(dx, dy);
  const facingDot = dx * hero.faceX + dy * hero.faceY;
  return distance < rules.playerAttackRange && facingDot > -0.25;
}

export function damageEnemy(enemy) {
  const hp = Math.max(0, enemy.hp - 1);
  return { ...enemy, hp, alive: hp > 0 };
}

export function enemyCanChase(distance) {
  return distance > rules.attackRange && distance < rules.chaseDistance;
}

export function enemyStep(distance, deltaSeconds) {
  return Math.min(rules.speed * deltaSeconds, distance - (rules.attackRange - 0.07));
}

export function enemyCanAttack(distance, now, lastAttack) {
  return distance <= rules.attackRange && now - lastAttack > rules.attackCooldownMs;
}

export function damageHero(hero) {
  return { ...hero, hp: Math.max(0, hero.hp - rules.damage) };
}