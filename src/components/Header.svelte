<script>
  let profilePic = "/assets/avatar_sm.png";
</script>

<style>
  /** Temp Mobile dev settings **/
  div.container {
    max-width: 450px;
    min-width: 350px;
  }
  .profile {
    max-width: 12rem;
    background: linear-gradient(0deg, tomato, blueviolet);
    filter: grayscale(0.3);
    outline: 16px inset #404f7387;
    outline-offset: 1rem;
  }
  .section-header {
    background: linear-gradient(-25deg, black, #00022d);
    color: white;
    min-height: 80vh;
  }
  h1 {
    position: relative;
  }
  h1::after {
    display: block;
    content: "";
    width: 80%;
    margin-top: 0.1rem;
    margin-right: auto;
    margin-left: auto;
    height: 0.3rem;
    border-radius: 0.5rem;
    background: linear-gradient(to right, tomato, blueviolet);
  }
  h5 {
    text-transform: uppercase;
    opacity: 0.75;
    line-height: 50%;
  }
  .social-icon {
    width: 3rem;
    filter: invert();
  }
  .border-left {
    border-left: 3px solid white;
  }
</style>

<div class="container-fluid section-header d-flex align-items-center" id="top">
  <div class="container py-3">
    <div class="row">
      <div class="col">
        <img src={profilePic} class="img img-fluid profile rounded-circle" alt="profile">
        <h1>William Beukelman</h1>
        <h5>Aspiring Software Developer</h5>
      </div>
    </div>
    <div class="row py-2 pb-4">
      <div class="col">
        <a href="https://github.com/williambeukelman" target="_blank" class="btn btn-transparent" alt="github">
          <img class="img-fluid social-icon" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="github-logo">
        </a>
        <a href="https://www.linkedin.com/in/williambeuk/" target="_blank" class="btn btn-transparent" alt="linkedin">
          <img class="img-fluid social-icon" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-plain.svg" alt="linkedin-logo">
        </a>
        <a href="https://codesandbox.io/u/williambeukelman" target="_blank" class="btn btn-transparent" alt="codesandbox">
          <img class="img-fluid social-icon" src="https://codesandbox.io/csb-ios.svg" alt="codesandbox-logo">
        </a>
      </div>
    </div>
    <div class="row">
    <h5 class="pb-3">About Me</h5>
    <p class="border-left text-start mx-3">Lifelong interest in all things science, engineering, and computers.
      I am currently pursuing a degree in software development.</p>
    </div>
  </div>
  <!--
  <span class="page-divider">
    <svg>
      <path d="M 205,5 L 1140,5 L 1140,295 L 0,65 L 1140,5 z" id="path59" style="fill:white;stroke:none" />    </svg>
  </span>
  -->
</div>