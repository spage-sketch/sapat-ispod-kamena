# Šapat ispod kamena

Browser-first 2D RPG prototip izrađen s Phaserom 4 i Viteom.

## Pokretanje
U mapi projekta pokreni pnpm run dev i otvori lokalnu adresu koju Vite ispiše. Za razvoj koristi lokalni poslužitelj, ne file:// adresu.

## Igrivi komad
- Izradi lika: odaberi ime i Čuvara ili Tragača.
- Razgovaraj s Elowen u selu i prihvati zadatak.
- Istraži Mjesečevu špilju, porazi čuvara i pokupi odlomak.
- Vrati se Elowen s odlomkom; otključat će ti novi zadatak.
- Ponovno istraži špilju, porazi čuvara i pronađi kamen odjeka, pa ga donesi Elowen.

## Kontrole
WASD ili strelice: kretanje · E: razgovor i prolaz · Space: udarac

## Struktura
- src/main.js: početni zaslon, HUD i povezivanje događaja.
- src/GameScene.js: Phaser prikaz i veza s pravilima igre.
- src/worlds.js: podaci o kartama i položajima.
- src/data/characters.js: podaci o klasama i likovima.
- src/data/items.js: podaci o predmetima.
- src/data/quests.js: tekstovi i prikaz stanja questa.
- src/systems/questSystem.js: prijelazi stanja questa i dijalozi.
- src/systems/combatSystem.js: borbena pravila.
- styles.css: izgled i prilagodba manjim zaslonima.

Zasad je ovo jedna kratka offline pustolovina bez online računa ili multiplayera. Napredak se automatski sprema u lokalnu pohranu preglednika na ovom uređaju; pri sljedećem otvaranju možeš nastaviti spremljenu pustolovinu ili započeti novu.
