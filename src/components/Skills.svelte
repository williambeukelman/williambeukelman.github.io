<script>
  import { skill } from "../stores.js";
  import { icons } from "../stores.js";
  let skills = [
    {
      name: "Svelte",
      btn: true,
    },
    {
      name: "Vue",
      btn: true,
    },
    {
      name: "Bootstrap",
      btn: true,
    },
    {
      name: "Csharp",
      btn: false,
    },
    {
      name: "Flask",
      btn: false,
    },
    {
      name: "Git",
      btn: false,
    },
    {
      name: "Javascript",
      btn: true,
    },
    {
      name: "Jquery",
      btn: true,
    },
    {
      name: "Linux",
      btn: false,
    },
    {
      name: "Python",
      btn: false,
    },
    {
      name: "Arduino",
      btn: false,
    },
    {
      name: "PHP",
      btn: false,
    },
    {
      name: "SQL",
      btn: false,
    },
    {
      name: "React-Native",
      btn: false,
    },
    {
      name: "Docker",
      btn: false,
    },
    {
      name: "ASP.NET",
      btn: false,
    },
    {
      name: "ExpressJS",
      btn: false,
    },
    {
      name: "Mongodb",
      btn: false,
    },
    {
      name: "NodeJs",
      btn: false,
    },
    {
      name: "Selenium",
      btn: false,
    },
    {
      name: "Unity",
      btn: false,
    },
  ];
  function updateSkill(value) {
    skill.set(value);
  }
  function scroll() {
    const el = document.querySelector("#projects");
    if (!el) return;
    el.scrollIntoView({
      behavior: "smooth",
    });
  }
</script>

<!-- Skills Section -->
<div class="container section-skills" id="skills">
  <div class="row py-3">
    <div class="col">
      <h1>Skills & Technologies</h1>
      <p>
        Tap an icon below to filter for projects matching a skill or technology.
      </p>
    </div>
  </div>
  <div class="row skill-icons">
    <div class="d-flex gap-3 flex-wrap justify-content-center">
      {#each skills as skill}
        <button
          type="button"
          disabled={!skill.btn}
          class="btn btn-outline-dark"
          on:click={() => {
            updateSkill(skill.name);
            scroll();
          }}
        >
          <div class="skill-card">
            {#if $icons[skill.name]}
              <img src={$icons[skill.name]} alt="{skill.name}-logo" />
            {/if}
            <span class="badge bg-dark">{skill.name}</span>
          </div>
        </button>
      {/each}
      <button
        type="button"
        class="btn btn-dark mx-3"
        on:click={() => updateSkill("")}
      >
        <div class="skill-card">All Projects</div>
      </button>
    </div>
  </div>
</div>

<style>
  /** Temp Mobile dev settings **/
  div.container {
    min-width: 350px;
  }
  .section-skills {
    background: white;
    color: black;
  }
  .skill-card {
    width: 6rem;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0.3rem;
  }
  .skill-card img {
    max-width: 3rem;
    padding: 0.2rem;
  }
  .skill-icons button.btn {
    padding: 0 1rem;
    border: none;
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
