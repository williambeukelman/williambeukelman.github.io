import { writable } from "svelte/store";

const projectData = [
  {
    title: "Music Library Application",
    desc:
      "A simple mock music library and player coded in Vue3, HTML, CSS, and JS.",
    demo: "https://v62igf.csb.app/artist",
    code: "https://github.com/williambeukelman/Music-Library-App",
    image:
      "public/screenshots/music-player-albums.png",
    badges: ["Vue", "Bootstrap"]
  },
  {
    title: "Recyclical Energy",
    desc:
      "A mock business website I designed and coded using Bootstrap in a parallax style.",
    demo: "https://owv4in.csb.app/",
    code: "https://github.com/williambeukelman/Recyclical-Energy-Website/",
    image: "public/screenshots/energy-home.png",
    badges: ["Bootstrap"]
  },
  {
    title: "Twenty Letter Wordle",
    desc:
      "A Svelte application intended to mimic the game of Wordle but with a much longer letter count",
    demo: "https://s9o1y6.csb.app/",
    code: "https://github.com/williambeukelman/Twenty-Letter-Wordle/",
    image:
      "public/screenshots/screenshot-twenty-letter-wordle.png",
    badges: ["Svelte"]
  },
  {
    title: "Sycamore Nursery Website",
    desc: "A fictional nursery website made in javascript and jquery.",
    demo: "https://rgx9lb.csb.app/",
    code: "https://codesandbox.io/s/rgx9lb",
    image: "public/screenshots/screenshot-nursery-website.png",
    badges: ["Javascript", "Jquery"]
  },
  {
    title: "Bike Shop App - Capstone Project",
    desc: "A multiplatform web app, storefront, and ecommerce adminstration tool built together with 9 other students as a capstone class.",
    demo: "https://thebikeshop.app",
    code: "https://github.com/CWI-SWDV-280-Bike-Shop/Bike-Shop/tree/main",
    image: "public/screenshots/screenshot_thebikeshop.png",
    badges: ["React-Native", "Mongodb", "Javascript", "ExpressJS", "Docker", "NodeJS"]
  },
  {
    title: "Stellar Explorers Game",
    desc: "Final for game development class, a 3D real-time strategy space exploration game built entirely from stratch using Unity game engine.",
    demo: "https://play.unity.com/mg/other/build-km4",
    code: "",
    image: "public/screenshots/screenshot_stellar_explorers.png",
    badges: ["Csharp", "Unity"]
  },
  {
    title: "Webscraping and Report Generation Project",
    desc: "As part of an internship I made a tool to do web scraping, and report generation for intial data collection efforts for my college.",
    demo: "",
    code: "https://github.com/williambeukelman/python-company-stack-analysis",
    image: "public/screenshots/web_scraper.png",
    badges: ["Python", "Flask", "Selenium"]
  },
  {
    title: "Data Collection Utility",
    desc: "Myself and another student created this small Flask app as an internal tool for my college's research efforts as part of an internship.",
    demo: "",
    code: "",
    image: "public/screenshots/datacollect.png",
    badges: ["Python", "Flask", "Javascript"]
  }
]

const skillData = {
  "Svelte":
  {
    icon: "public/svelte-original.svg",
    count: projectData.filter((e) => e.badges.includes("Svelte")).length,
  },
  "Vue":
  {
    icon: "public/vuejs-original.svg",
    count: projectData.filter((e) => e.badges.includes("Vue")).length,
  },
  "Bootstrap":
  {
    icon: "public/bootstrap-original.svg",
    count: projectData.filter((e) => e.badges.includes("Bootstrap")).length,
  },
  "Csharp":
  {
    icon: "public/csharp-original.svg",
    count: projectData.filter((e) => e.badges.includes("Csharp")).length,
  },
  "Flask":
  {
    icon: "public/flask-original.svg",
    count: projectData.filter((e) => e.badges.includes("Flask")).length,
  },
  "Git":
  {
    icon: "public/git-original.svg",
    count: projectData.filter((e) => e.badges.includes("Git")).length,
  },
  "Javascript":
  {
    icon: "public/javascript-original.svg",
    count: projectData.filter((e) => e.badges.includes("Javascript")).length,
  },
  "Jquery":
  {
    icon: "public/jquery-original.svg",
    count: projectData.filter((e) => e.badges.includes("Jquery")).length,
  },
  "Linux":
  {
    icon: "public/linux-plain.svg",
    count: projectData.filter((e) => e.badges.includes("Linux")).length,
  },
  "Python":
  {
    icon: "public/python-original.svg",
    count: projectData.filter((e) => e.badges.includes("Python")).length,
  },
  "Arduino":
  {
    icon: "public/arduino-original.svg",
    count: projectData.filter((e) => e.badges.includes("Arduino")).length,
  },
  "PHP":
  {
    icon: "public/php-original.svg",
    count: projectData.filter((e) => e.badges.includes("PHP")).length,
  },
  "SQL":
  {
    icon: "public/mysql-original.svg",
    count: projectData.filter((e) => e.badges.includes("SQL")).length,
  },
  "React-Native":
  {
    icon: "public/react-original.svg",
    count: projectData.filter((e) => e.badges.includes("React-Native")).length,
  },
  "Docker":
  {
    icon: "public/docker-original.svg",
    count: projectData.filter((e) => e.badges.includes("Docker")).length,
  },
  "ASP.NET":
  {
    icon: "public/dot-net-original.svg",
    count: projectData.filter((e) => e.badges.includes("ASP.NET")).length,
  },
  "ExpressJS":
  {
    icon: "public/express-original.svg",
    count: projectData.filter((e) => e.badges.includes("ExpressJS")).length,
  },
  "Mongodb":
  {
    icon: "public/mongodb-original.svg",
    count: projectData.filter((e) => e.badges.includes("Mongodb")).length,
  },
  "NodeJS":
  {
    icon: "public/nodejs-original.svg",
    count: projectData.filter((e) => e.badges.includes("NodeJS")).length,
  },
  "Selenium":
  {
    icon: "public/selenium-original.svg",
    count: projectData.filter((e) => e.badges.includes("Selenium")).length,
  },
  "Unity":
  {
    icon: "public/unity-original.svg",
    count: projectData.filter((e) => e.badges.includes("Unity")).length,
  },
}

export const skill = writable("");
export const projects = writable(projectData.reverse());
export const skills = writable(skillData);
