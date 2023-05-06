<script>
  import { skill } from "../stores.js";
  import { skills } from "../stores.js";
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
      {#each Object.entries($skills) as [name, skill]}
        <button
          type="button"
          disabled={(skill.count<1)}
          class="btn btn-outline-dark"
          on:click={() => {
            updateSkill(name);
            scroll();
          }}
        >
          <div class="skill-card">
            {#if skill.icon}
              <img src={skill.icon} alt="{name}-logo" />
            {/if}
            <span class="badge bg-dark">{name}</span>
            <!-- <span class="badge bg-dark">{skill.count}</span> -->
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
