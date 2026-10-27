# Whispers Beneath the Stone

A browser-first 2D RPG prototype built with Phaser 4 and Vite.

## Run the game

From the project folder, run `pnpm run dev` and open the local URL printed by Vite. Use the local server rather than opening `index.html` with `file://`.

## Playable story

- Create a Guardian or Scout and meet Elowen in the village.
- Accept her quest, explore the Moonlit Cave, defeat the guardian, and retrieve the Moonlit Shard.
- Return the shard to Elowen to unlock the Echo Stone quest.
- Search the cave again and bring the Echo Stone back to the village.

## Controls

WASD or arrow keys: move · E: interact / enter · I: inventory · Space: attack

During dialogue, use Space or Enter to continue. Use the on-screen choices to respond.

## Project structure

- `src/main.js`: character creation, HUD, dialogue, inventory UI, and save wiring.
- `src/GameScene.js`: Phaser scene lifecycle and coordination between systems.
- `src/rendering/WorldRenderer.js`: village, cave, entity, and animation rendering.
- `src/systems/playerController.js`: player input, movement, and wall collision.
- `src/systems/interactionSystem.js`: nearby NPC, cave entrance, and crack interactions.
- `src/worlds.js`: maps, world names, and spawn points.
- `src/data/`: characters, items, quests, dialogue, and village art atlas.
- `src/data/npcs.js`: named residents, appearances, and daily routines.
- `src/state/inventory.js`: inventory state and serialization.
- `src/systems/`: save, dialogue, quest, combat, and NPC behavior.
- `styles.css`: responsive interface styles.

The village clock advances one in-game minute per real second while play is active. NPC routines and their ambient dialogue follow the current time and quest state.

## Art assets and licenses

The village currently uses the Gridwright Medieval Village free sample and the Gridwright Top-Down Characters free sample. The samples allow use in personal and commercial games; do not redistribute the asset files as a standalone pack. Source links and the packs' original license/readme files are in `assets/reference-packs/`. The full paid versions are not included.

Additional reference packs are stored locally in `assets/reference-packs/`: LimeZu Serene Village (CC BY 4.0; credit LimeZu when used) and Kenney Roguelike/RPG plus Roguelike Characters (CC0). Those packs are not loaded by the game at this time.

## Save data

This is a short offline adventure with no accounts or multiplayer. Progress, including inventory, is saved in this browser's local storage on this device. On your next visit, continue the saved adventure or start a new one.
