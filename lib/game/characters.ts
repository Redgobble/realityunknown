export type Character = {
  id: string;
  name: string;
  title: string;
  image: string;
  personality: string;
};

export const CHARACTERS: Character[] = [
  {
    id: "c1",
    name: "The Watcher",
    title: "Keeper of Forgotten Places",
    image: "/assets/character/c1.png",
    personality: "mysterious, calm and observant",
  },
  {
    id: "c2",
    name: "The Archivist",
    title: "Keeper of Memory",
    image: "/assets/character/c2.png",
    personality: "intelligent, curious and precise",
  },
  {
    id: "c3",
    name: "The Explorer",
    title: "Seeker of Hidden Paths",
    image: "/assets/character/c3.png",
    personality: "adventurous, energetic and encouraging",
  },
  {
    id: "c4",
    name: "The Historian",
    title: "Voice of the Past",
    image: "/assets/character/c4.png",
    personality: "wise, thoughtful and fascinated by history",
  },
  {
    id: "c5",
    name: "The Keeper",
    title: "Guardian of Secrets",
    image: "/assets/character/c5.png",
    personality: "serious, mysterious and protective",
  },
  {
    id: "c6",
    name: "The Seeker",
    title: "Hunter of Clues",
    image: "/assets/character/c6.png",
    personality: "sharp, playful and challenging",
  },
  {
    id: "c7",
    name: "The Cartographer",
    title: "Reader of Places",
    image: "/assets/character/c7.png",
    personality: "analytical, patient and curious",
  },
  {
    id: "c8",
    name: "The Storyteller",
    title: "Voice Between Worlds",
    image: "/assets/character/c8.png",
    personality: "warm, dramatic and imaginative",
  },
  {
    id: "c9",
    name: "The Scholar",
    title: "Reader of Forgotten Truths",
    image: "/assets/character/c9.png",
    personality: "academic, calm and insightful",
  },
  {
    id: "c10",
    name: "The Guardian",
    title: "Protector of the Unknown",
    image: "/assets/character/c10.png",
    personality: "brave, direct and protective",
  },
  {
    id: "c11",
    name: "The Wanderer",
    title: "Traveler Without a Map",
    image: "/assets/character/c11.png",
    personality: "free-spirited, curious and mysterious",
  },
  {
    id: "c12",
    name: "The Oracle",
    title: "Listener of Echoes",
    image: "/assets/character/c12.png",
    personality: "cryptic, thoughtful and perceptive",
  },
  {
    id: "c13",
    name: "The Collector",
    title: "Gatherer of Stories",
    image: "/assets/character/c13.png",
    personality: "enthusiastic, clever and fascinated by details",
  },
  {
    id: "c14",
    name: "The Guide",
    title: "Your Companion Beyond the Ordinary",
    image: "/assets/character/c14.png",
    personality: "friendly, wise and encouraging",
  },
  {
    id: "c15",
    name: "The Sentinel",
    title: "Watcher of Hidden Truths",
    image: "/assets/character/c15.png",
    personality: "quiet, intense and perceptive",
  },
];

export function getCharacterForDiscovery(index: number) {
  return CHARACTERS[index % CHARACTERS.length];
}

export function getCharacter(id: string) {
  return CHARACTERS.find((character) => character.id === id);
}
