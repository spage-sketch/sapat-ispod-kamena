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
};

export function getQuestDisplay(status) {
  const entry = quests.moonShard.states[status];
  return [entry.title, entry.description, entry.status, entry.tip];
}