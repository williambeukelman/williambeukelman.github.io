<style>
  @import url("https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700&display=swap");
  .container-fluid {
    box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px,
      rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
  }
  .projectBox {
    width: 100%;
    overflow-x: scroll;
    scroll-snap-type: mandatory;
    scroll-snap-points-y: repeat(22rem);
    scroll-snap-type: y mandatory;
  }
  .card:first-of-type {
    margin-left: auto;
  }
  .card:last-of-type {
    margin-right: auto;
  }
  .card {
    scroll-snap-align: start;
    min-width: 21.5rem;
    width: 25rem;
    height: 20rem;
    padding: 0;
    overflow: hidden;
    border-radius: 1rem;
    background-color: transparent;
    color: white;
  }
  .card-img-top {
    height: 100%;
    width: 100%;
    z-index: -1;
    filter: blur(1px);
    scale: 1.05;
    transition: all 0.3s linear;
  }
  .card:hover .card-img-top {
    scale: 1.1;
    filter: blur(2px);
    cursor: pointer;
  }
  .card-body {
    background: linear-gradient(to top, black, transparent);
    margin-top: -10rem;
  }
  .card-title {
    font-family: "Roboto Condensed", sans-serif;
    font-size: 1.5rem;
    background: linear-gradient(to left, tomato, blueviolet);
  }
  .langs {
    position: absolute;
    right: 0;
    z-index: 1;
    width: 100%;
    display: flex;
    flex-direction: row-reverse;
  }
  .language-badge {
    max-width: 3rem;
    max-height: 3rem;
    margin: 0.5rem;
    border-bottom: 5px solid white;
  }
  h1::after {
    display: block;
    content: "";
    width: 80%;
    max-width: 35rem;
    margin-top: 0.1rem;
    margin-right: auto;
    margin-left: auto;
    height: 0.3rem;
    border-radius: 0.5rem;
    background: linear-gradient(to right, tomato, blueviolet);
  }
</style>

<script>
  import { scale } from "svelte/transition";
  import { skill } from "../stores.js";
  import { icons } from "../stores.js";
  let screenshot_paper = "/assets/screenshot_paper.png";
  let projects = [
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
    }
  ];
  $: filterProjects =
    $skill === ""
      ? projects
      : projects.filter(item => {
          return item.badges.includes($skill);
          /*.some(badge => {
                      return badge === $skill;
                    });*/
        });
</script>

<!-- Projects Section -->
<div class="container-fluid my-3 p-2" id="projects">
  <h1 class="mb-4">{$skill} Projects</h1>
    <div class="projectBox d-flex gap-2 flex-row justify-content-start">
    {#each filterProjects as project}
      <div class="card mb-4" transition:scale|local>
        <div class="langs">
        {#if project.badges}{#each project.badges as badge} 
          <img class="language-badge" src="{$icons[badge]}" alt="{badge}-logo" />
        {/each}{/if}
        </div>
        <img class="card-img-top" src="{project.image}" alt="project">
        <div class="card-body">
          <h5 class="card-title">{project.title}</h5>
          <p class="card-text">{project.desc}</p>
          {#if project.demo}<a href="{project.demo}" target="_blank" class="btn btn-outline-danger">Demo</a>{/if}
          {#if project.code}<a href="{project.code}" target="_blank" class="btn btn-outline-light">Code</a>{/if}
        </div>
      </div>
    {/each}
  </div>
</div>
