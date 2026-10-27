export const quests = {
  moonShard: {
    id: "moon-shard",
    states: {
      waiting: { title: "Mirna dolina", description: "Razgovaraj s Elowen pokraj stare staze.", status: "ZADATAK ČEKA", tip: "Priđi Elowen i pritisni E da započneš razgovor." },
      active: { title: "Odlomak mjesečine", description: "U špilji pronađi odlomak. Čuvar ga neće lako prepustiti.", status: "U TIJEKU", tip: "Porazi čuvara i pokupi odlomak." },
      carrying: { title: "Povratak Elowen", description: "Odlomak je pronađen. Vrati se čuvarici staze.", status: "PREDMET PRONAĐEN", tip: "Vrati se u selo i razgovaraj s Elowen." },
      complete: { title: "Dolina je sigurna", description: "Elowen je preuzela odlomak. Dobar posao!", status: "ZAVRŠENO", tip: "Pustolovina je završena — možeš još istraživati špilju." },
    },
    dialogue: {
      greeting: [
        "Dobro došao, {heroName}. Iz špilje se noću čuje čudno pjevanje.",
        "Ondje je ostao odlomak mjesečine, važan za zaštitu naše doline.",
        "Možeš li ga pronaći? Uđi kroz stari prolaz i vrati mi ga.",
      ],
      completion: [
        "Vratio si odlomak! Svjetlo se opet vratilo u dolinu.",
        "Hvala ti, pustolove. Neka ti putovi budu mirni.",
      ],
      active: ["Odlomak je još u špilji. Čuvaj se čuvara!"],
      complete: ["Dolina je sigurna, zahvaljujući tebi."],
      recovered: ["Pronašao si odlomak mjesečine! Vrati se u selo i predaj ga Elowen."],
    },
  },
  stoneEcho: {
    id: "stone-echo",
    states: {
      active: { title: "Odjek iz dubine", description: "Elowen je čula novi odjek iz špilje. Pronađi njegov izvor.", status: "U TIJEKU", tip: "Vrati se u špilju i pronađi kamen koji odjekuje." },
      carrying: { title: "Kamen koji odjekuje", description: "Pronašao si tajanstveni kamen. Odnesi ga Elowen.", status: "PREDMET PRONAĐEN", tip: "Vrati se u selo i razgovaraj s Elowen." },
      complete: { title: "Odjek je utihnuo", description: "Elowen je preuzela kamen i špilja je napokon tiha.", status: "ZAVRŠENO", tip: "Pustolovina je završena — možeš još istraživati." },
    },
    dialogue: {
      greeting: ["Odlomak je zaštitio dolinu, {heroName}, ali iz dubine špilje sada dopire novi odjek.", "Pronađi njegov izvor i donesi mi ga."],
      active: ["Odjek još dolazi iz dubine špilje. Pronađi kamen koji ga stvara."],
      completion: ["To je izvor odjeka. Sada napokon možemo mirno spavati.", "Hvala ti, {heroName}. Dolina ti duguje još jednu uslugu."],
      complete: ["Špilja je tiha. Hvala ti, {heroName}."],
      recovered: ["Pronašao si kamen koji odjekuje! Vrati se u selo i predaj ga Elowen."],
    },
  },
};

export function getQuestDisplay(questId, status) {
  // Keep the original one-argument call compatible with existing call sites.
  if (status === undefined) {
    status = questId;
    questId = "moonShard";
  }
  const entry = quests[questId].states[status];
  return [entry.title, entry.description, entry.status, entry.tip];
}
