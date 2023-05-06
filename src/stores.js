import { writable } from "svelte/store";

export const skill = writable("");
export const projects = writable([
  {
    title: "Music Library Application",
    desc:
      "A simple mock music library and player coded in Vue3, HTML, CSS, and JS.",
    demo: "https://v62igf.csb.app/artist",
    code: "https://github.com/williambeukelman/Music-Library-App",
    image:
      "https://camo.githubusercontent.com/ad0810c98f921ee6571c2274ea4398eb022877d97642ea0b974dd482b16db718/68747470733a2f2f77696c6c69616d6265756b656c6d616e2e6769746875622e696f2f6d757369632d706c617965722d616c62756d732e706e67",
    badges: ["Vue", "Bootstrap"]
  },
  {
    title: "Recyclical Energy",
    desc:
      "A mock business website I designed and coded using Bootstrap in a parallax style.",
    demo: "https://owv4in.csb.app/",
    code: "https://github.com/williambeukelman/Recyclical-Energy-Website/",
    image: "https://williambeukelman.github.io/energy-home.png",
    badges: ["Bootstrap"]
  },
  {
    title: "Twenty Letter Wordle",
    desc:
      "A Svelte application intended to mimic the game of Wordle but with a much longer letter count",
    demo: "https://s9o1y6.csb.app/",
    code: "https://github.com/williambeukelman/Twenty-Letter-Wordle/",
    image:
      "https://williambeukelman.github.io/screenshot-twenty-letter-wordle.png",
    badges: ["Svelte"]
  },
  {
    title: "Sycamore Nursery Website",
    desc: "A fictional nursery website made in javascript and jquery.",
    demo: "https://rgx9lb.csb.app/",
    code: "https://codesandbox.io/s/rgx9lb",
    image: "https://williambeukelman.github.io/screenshot-nursery-website.png",
    badges: ["Javascript", "Jquery"]
  },
  {
    title: "Bike Shop App - Capstone Project",
    desc: "A multiplatform web app, storefront, and ecommerce adminstration tool built together with 9 other students as a capstone class.",
    demo: "https://thebikeshop.app",
    code: "https://github.com/CWI-SWDV-280-Bike-Shop/Bike-Shop",
    image: "",
    badges: ["React-Native", "Mongodb", "Javascript", "ExpressJS", "Docker", "NodeJS"]
  },
  {
    title: "Stellar Explorers Game",
    desc: "Final for game development class, a 3D real-time strategy space exploration game built entirely from stratch using Unity game engine.",
    demo: "https://play.unity.com/mg/other/build-km4",
    code: "",
    image: "",
    badges: ["Csharp", "Unity"]
  },
  {
    title: "Webscraping and Report Generation Project",
    desc: "As part of an internship I made a tool to do web scraping, and report generation for intial data collection efforts for my college.",
    demo: "",
    code: "https://github.com/williambeukelman/python-company-stack-analysis",
    image: "",
    badges: ["Python", "Flask", "Selenium"]
  },
  {
    title: "Data Collection Utility",
    desc: "Myself and another student created this small Flask app as an internal tool for my college's research efforts as part of an internship.",
    demo: "",
    code: "",
    image: "",
    badges: ["Python", "Flask", "Javascript"]
  }
]);
export const icons = writable({
  "Svelte":
    "public/svelte-original.svg",
  "Vue":
    "public/vuejs-original.svg",
  "Bootstrap":
    "public/bootstrap-original.svg",
  "Csharp":
    "public/csharp-original.svg",
  "Flask":
    "public/flask-original.svg",
  "Git":
    "public/git-original.svg",
  "Javascript":
    "public/javascript-original.svg",
  "Jquery":
    "public/jquery-original.svg",
  "Linux":
    "public/linux-plain.svg",
  "Python":
    "public/python-original.svg",
  "Arduino":
    "public/arduino-original.svg",
  "PHP":
    "public/php-original.svg",
  "SQL":
    "public/mysql-original.svg",
  "React-Native":
    "public/react-original.svg",
  "Docker":
    "public/docker-original.svg",
  "ASP.NET":
    "public/dot-net-original.svg",
  "ExpressJS":
    "public/express-original.svg",
  "Mongodb":
    "public/mongodb-original.svg",
  "NodeJS":
    "public/nodejs-original.svg",
  "Selenium":
    "public/selenium-original.svg",
  "Unity":
    "public/unity-original.svg",
});
