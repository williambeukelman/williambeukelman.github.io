<style>
  nav#toggle {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 11;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 1rem;
  }
  nav#scrollTop {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
  }
  nav#scrollTop a {
    background: rgba(0, 0, 0, 0.329);
    border-radius: 1rem;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }
</style>

<script>
  function scrollIntoView({ target }) {
    const el = document.querySelector(target.getAttribute("href"));
    if (!el) return;
    el.scrollIntoView({
      behavior: "smooth"
    });
  }
  let y;
</script>

<svelte:window bind:scrollY={y}/>

<nav class="navbar navbar-dark bg-transparent" id="scrollTop" 
  style="opacity: {0 + (y/window.innerHeight)}">
  <div class="container-fluid">
    <a class="nav-link text-uppercase text-white" href="#top"
    on:click|preventDefault={scrollIntoView}>
      Top
    </a>
  </div>
</nav>

<nav class="navbar navbar-expand-md navbar-dark" id="toggle">
  <div class="container justify-content-end">
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarScroll">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" aria-current="page" href="#skills" 
          on:click|preventDefault={scrollIntoView}>Skills</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#projects"
          on:click|preventDefault={scrollIntoView}>Projects</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#education"
          on:click|preventDefault={scrollIntoView}>Education</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
