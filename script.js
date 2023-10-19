import { Ash } from "./modules/ash.js";

const ash = new Ash();

const launches = [
  {
    title: "My todo list",
    description: "A very simple todo list to do very simple things",
  },
  {
    title: "PhotoMagic",
    description: "A next-gen photo editing tool with AI enhancements",
  },
  {
    title: "TravelMate",
    description:
      "Your one-stop solution for all travel bookings and itineraries",
  },
  {
    title: "Foodie's Delight",
    description: "Discover and order delicacies from around the world",
  },
  {
    title: "FitTrack",
    description: "Track and analyze your fitness journey effectively",
  },
  {
    title: "EcoDrive",
    description: "An app to monitor and reduce your carbon footprint",
  },
  {
    title: "SpaceExplorer",
    description: "Explore the universe from your home with our AR tool",
  },
  {
    title: "ShopEase",
    description: "Experience the future of shopping with AR and VR",
  },
  {
    title: "MusicMingle",
    description:
      "Discover, share, and collaborate on music with artists globally",
  },
  {
    title: "News 360",
    description: "Get 360° perspective on global news without bias",
  },
  {
    title: "RecipeGuru",
    description: "Find, save, and share world-class recipes with ease",
  },
  {
    title: "GameRealm",
    description:
      "Dive deep into the world of gaming with top-tier recommendations",
  },
  {
    title: "EduConnect",
    description: "Collaborative learning made fun and efficient",
  },
  {
    title: "PetPal",
    description: "Connect, adopt, and care for pets in your vicinity",
  },
  {
    title: "HealthMonitor",
    description:
      "Keep an eye on your health metrics and consult doctors online",
  },
  {
    title: "MovieMood",
    description:
      "Watch movies based on your mood and get personalized suggestions",
  },
  {
    title: "StyleSpot",
    description: "Stay ahead in fashion with AI-powered style recommendations",
  },
  {
    title: "SafeSpace",
    description: "An app dedicated to mental health and well-being",
  },
  {
    title: "GigFinder",
    description: "Find freelance gigs in your domain and grow your network",
  },
  {
    title: "GreenGrow",
    description: "Learn and implement sustainable farming techniques at home",
  },
];

function generateLaunchObject(launch, index) {
  return {
    div: [
      {
        h3: launch.title,
        id: `launch-${index + 1}`,
      },
      {
        p: launch.description,
      },
      {
        button: "Like",
        onclick: function () {
          ash.update({
            [`launch-${index + 1}`]: {
              style: "color: green;",
            },
          });
        },
      },
    ],
  };
}

const data = [
  {
    h1: "MiniLaunch",
  },
  {
    p: "Share your project",
  },
  {
    h2: "Recent launches",
  },
  ...launches.map(generateLaunchObject),
];

ash.data = data;
ash.render();
