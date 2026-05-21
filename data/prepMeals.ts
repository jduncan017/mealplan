// Hand-authored mapping from prep steps to the recipe slugs they prep.
// Keyed by `${week}:${stepIndex}`.
//
// Each entry can be a flat slug list (whole step belongs to all listed meals)
// or an object with optional `base` text + `segments`. When segments are
// present, deselecting a meal in the prep modal trims that segment from the
// rendered step. The step hides when no meals are selected AND no `base`
// remains.

export type PrepStepSegment = {
  meals: string[];
  text: string;
};

export type PrepStepMapping = {
  meals: string[];
  base?: string;
  segments?: PrepStepSegment[];
};

export const prepStepMeals: Record<string, PrepStepMapping> = {
  // Week 1
  "1:0": {
    meals: ["shredded-chicken-street-tacos", "chicken-enchilada-skillet"],
  },
  "1:1": { meals: ["veggie-egg-muffins"] },
  "1:2": { meals: ["protein-overnight-oats"] },
  "1:3": { meals: [] },
  "1:4": {
    meals: ["shredded-chicken-street-tacos", "chicken-enchilada-skillet"],
    base: "Shred chicken in Instant Pot when done.",
    segments: [
      {
        meals: ["chicken-enchilada-skillet"],
        text: "Portion 2.5 cups for Sat enchilada skillet (fridge).",
      },
      {
        meals: ["shredded-chicken-street-tacos"],
        text: "Reserve the rest for Fri tacos.",
      },
    ],
  },

  // Week 2
  "2:0": { meals: ["stuffed-peppers-with-turkey-and-quinoa"] },
  "2:1": { meals: [] },
  "2:2": {
    meals: [
      "stuffed-peppers-with-turkey-and-quinoa",
      "southwest-quinoa-power-bowl",
    ],
    base: "Cook 2 cups rice for leftovers and bowls.",
    segments: [
      {
        meals: [
          "stuffed-peppers-with-turkey-and-quinoa",
          "southwest-quinoa-power-bowl",
        ],
        text: "Cook 3 cups quinoa (doubles for stuffed peppers + power bowls).",
      },
    ],
  },
  "2:3": {
    meals: ["make-ahead-breakfast-burritos", "veggie-egg-muffins"],
    base: "Breakfast prep.",
    segments: [
      {
        meals: ["make-ahead-breakfast-burritos"],
        text: "Make 6 breakfast burritos and freeze individually wrapped.",
      },
      {
        meals: ["veggie-egg-muffins"],
        text: "Make egg muffins if you want variety (optional).",
      },
    ],
  },
  "2:4": { meals: ["protein-overnight-oats"] },

  // Week 3
  "3:0": {
    meals: ["bbq-pulled-pork-sandwiches-with-slaw", "carnitas-bowls"],
    base: "Instant Pot pulled pork: rub pork, sauté to brown, pressure cook 65 min + 15 min natural release. Freeze 2 cups as Week 3 backup.",
    segments: [
      {
        meals: ["bbq-pulled-pork-sandwiches-with-slaw"],
        text: "Serve tonight as BBQ sandwiches.",
      },
      {
        meals: ["carnitas-bowls"],
        text: "Save 2.5 cups plain pork for Mon carnitas.",
      },
    ],
  },
  "3:1": { meals: ["bbq-pulled-pork-sandwiches-with-slaw"] },
  "3:2": {
    meals: ["chia-pudding-jars", "veggie-egg-muffins", "protein-overnight-oats"],
    base: "While pork runs: breakfast prep.",
    segments: [
      { meals: ["chia-pudding-jars"], text: "Chia pudding x4 jars." },
      { meals: ["veggie-egg-muffins"], text: "Egg muffins batch." },
      { meals: ["protein-overnight-oats"], text: "Overnight oats." },
    ],
  },
  "3:3": {
    meals: ["carnitas-bowls", "mason-jar-cobb-salad"],
    segments: [
      {
        meals: ["carnitas-bowls"],
        text: "Cook 3 cups rice (carnitas bowls, lunch bowls).",
      },
      {
        meals: ["mason-jar-cobb-salad"],
        text: "Prep mason jar cobb salads for Sat.",
      },
    ],
  },
  "3:4": { meals: [] },

  // Week 4
  "4:0": {
    meals: [
      "shredded-chicken-street-tacos",
      "buffalo-chicken-stuffed-sweet-potatoes",
      "chicken-enchilada-skillet",
    ],
    base: "Instant Pot shredded chicken round 2: same method as Week 1. Pressure 15 min + 10 min NR.",
    segments: [
      {
        meals: ["buffalo-chicken-stuffed-sweet-potatoes"],
        text: "Save 2.5 cups for Mon stuffed sweet potatoes.",
      },
      {
        meals: ["chicken-enchilada-skillet"],
        text: "Save 2.5 cups for Tue enchilada skillet.",
      },
      {
        meals: ["shredded-chicken-street-tacos"],
        text: "Use rest tonight for tacos.",
      },
    ],
  },
  "4:1": { meals: ["power-protein-smoothie"] },
  "4:2": { meals: ["air-fryer-turkey-meatballs-with-pasta"] },
  "4:3": { meals: ["southwest-quinoa-power-bowl"] },
  "4:4": {
    meals: ["buffalo-chicken-wrap", "mediterranean-chicken-wrap"],
    base: "Wash greens.",
    segments: [
      {
        meals: ["buffalo-chicken-wrap"],
        text: "Prep buffalo wrap filling (shredded chicken in buffalo sauce jar).",
      },
      {
        meals: ["mediterranean-chicken-wrap"],
        text: "Prep Mediterranean wrap filling (tzatziki jar).",
      },
    ],
  },

  // Week 5
  "5:0": {
    meals: ["bbq-pulled-pork-sandwiches-with-slaw", "carnitas-bowls"],
    base: "Instant Pot pulled pork round 2. Same as Week 3.",
    segments: [
      {
        meals: ["bbq-pulled-pork-sandwiches-with-slaw"],
        text: "Serve tonight BBQ.",
      },
      {
        meals: ["carnitas-bowls"],
        text: "Save 2.5 cups plain for Mon carnitas.",
      },
    ],
  },
  "5:1": { meals: ["make-ahead-breakfast-burritos"] },
  "5:2": {
    meals: [
      "white-bean-and-kale-soup-with-sausage",
      "bbq-pulled-pork-sandwiches-with-slaw",
    ],
    base: "Cook rice.",
    segments: [
      {
        meals: ["white-bean-and-kale-soup-with-sausage"],
        text: "Wash kale for white bean soup Tuesday.",
      },
      {
        meals: ["bbq-pulled-pork-sandwiches-with-slaw"],
        text: "Make slaw.",
      },
    ],
  },
  "5:3": { meals: ["hard-boiled-eggs"] },
  "5:4": { meals: ["chicken-tortilla-soup"] },

  // Week 6 (Jun 1-6, 4 eating days then travel)
  "6:0": { meals: ["veggie-egg-muffins"] },
  "6:1": { meals: ["protein-overnight-oats"] },
  "6:2": { meals: ["greek-yogurt-parfait"] },
  "6:3": { meals: ["hard-boiled-eggs"] },
  "6:4": { meals: ["power-protein-smoothie"] },

  // Week 7 (Tue Jun 9-Sat Jun 13, post-travel mini prep)
  "7:0": { meals: ["veggie-egg-muffins"] },
  "7:1": { meals: ["greek-yogurt-parfait"] },
  "7:2": { meals: ["hard-boiled-eggs"] },

  // Week 8 (Sun Jun 14-Sat Jun 20, full week)
  "8:0": {
    meals: ["mississippi-pot-roast", "beef-barbacoa-tacos"],
    base: "Instant Pot Mississippi Pot Roast: sear chuck roast, add pepperoncini, butter, ranch + au jus packets, broth. Pressure cook 70 min + 15 min natural release. Shred when done.",
    segments: [
      {
        meals: ["mississippi-pot-roast"],
        text: "Serve tonight for Mississippi Pot Roast.",
      },
      {
        meals: ["beef-barbacoa-tacos"],
        text: "Save 3 cups shredded beef in the fridge for Mon Beef Barbacoa Tacos.",
      },
    ],
  },
  "8:1": { meals: ["veggie-egg-muffins"] },
  "8:2": { meals: ["protein-overnight-oats"] },
  "8:3": { meals: ["greek-yogurt-parfait"] },
  "8:4": { meals: ["make-ahead-breakfast-burritos"] },
  "8:5": { meals: ["hard-boiled-eggs"] },

  // Week 9 (Sun Jun 21-Thu Jun 25, then travel)
  "9:0": {
    meals: [
      "shredded-chicken-street-tacos",
      "chicken-enchilada-skillet",
      "buffalo-chicken-stuffed-sweet-potatoes",
      "mediterranean-chicken-wrap",
      "buffalo-chicken-wrap",
    ],
    base: "Instant Pot shredded chicken (big batch): sauté onion + garlic + cumin + chili powder + smoked paprika, add chicken thighs, broth, lime juice. Pressure cook 15 min + 10 min natural release. Shred.",
    segments: [
      {
        meals: ["shredded-chicken-street-tacos"],
        text: "Use 2 cups tonight for Shredded Chicken Street Tacos.",
      },
      {
        meals: ["chicken-enchilada-skillet"],
        text: "Save 2.5 cups for Mon Chicken Enchilada Skillet.",
      },
      {
        meals: ["mediterranean-chicken-wrap"],
        text: "Save 1.5 cups plain for Wed Mediterranean Chicken Wrap.",
      },
      {
        meals: ["buffalo-chicken-stuffed-sweet-potatoes"],
        text: "Save 2 cups for Wed Buffalo Chicken Stuffed Sweet Potatoes (toss with buffalo sauce when ready).",
      },
      {
        meals: ["buffalo-chicken-wrap"],
        text: "Save 1.5 cups for Thu Buffalo Chicken Wrap (toss with buffalo sauce in a jar).",
      },
    ],
  },
  "9:1": { meals: ["veggie-egg-muffins"] },
  "9:2": { meals: ["protein-overnight-oats"] },
  "9:3": { meals: ["greek-yogurt-parfait"] },
  "9:4": { meals: ["hard-boiled-eggs"] },

  // Week 10 (Mon Jun 29-Tue Jun 30, post-travel 2-day mini week)
  "10:0": { meals: [] },
  "10:1": { meals: ["greek-yogurt-parfait"] },
};
