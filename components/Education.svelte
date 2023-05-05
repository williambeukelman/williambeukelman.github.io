<style>
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
  .card {
    max-width: 50rem;
  }
  .card-title {
    margin-left: 0;
  }
  .card-body {
    /* padding: 1rem 4rem; */
    text-align: left;
  }
  .icon {
    /* position: absolute;
      left: 1.5rem;
      top: 1rem; */
    display: inline;
    scale: 2;
  }
</style>

<script>
  let windowWidth;
  let certificates = [
    {
      type: "degree",
      title: "Associate of Applied Science  (Software Development)",
      short: "A.A.S",
      institution: "College of Western Idaho",
      subtitle: "Boise, Idaho, 2021 - 2023",
      desc:
        "I am working towards an associate's in software development which includes the study of C#, ASP.NET, Javascript, JS Frameworks, PHP, SQL and more."
    },
    {
      type: "degree",
      title: "Associate of Science",
      short: "A.S",
      institution: "Boise State University",
      subtitle: "Boise, Idaho, 2014 - 2018",
      desc:
        "I received an associate's of science degree from Boise State University in the summer of 2018, with a course study focus on Biology."
    }
  ];
  let award = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-award" viewBox="0 0 16 16">
                          <path d="M9.669.864 8 0 6.331.864l-1.858.282-.842 1.68-1.337 1.32L2.6 6l-.306 1.854 1.337 1.32.842 1.68 1.858.282L8 12l1.669-.864 1.858-.282.842-1.68 1.337-1.32L13.4 6l.306-1.854-1.337-1.32-.842-1.68L9.669.864zm1.196 1.193.684 1.365 1.086 1.072L12.387 6l.248 1.506-1.086 1.072-.684 1.365-1.51.229L8 10.874l-1.355-.702-1.51-.229-.684-1.365-1.086-1.072L3.614 6l-.25-1.506 1.087-1.072.684-1.365 1.51-.229L8 1.126l1.356.702 1.509.229z"/>
                          <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1 4 11.794z"/>
                        </svg> `;
  let degree = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-mortarboard" viewBox="0 0 16 16">
                          <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5ZM8 8.46 1.758 5.965 8 3.052l6.242 2.913L8 8.46Z"/>
                          <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46l-3.892-1.556Z"/>
                        </svg>`;
</script>

<svelte:window bind:innerWidth={windowWidth}/>

<div class="container pb-5" id="education">
  <h1 class="mb-4">Education & Certificates</h1>
  <div class="row gap-2">
    {#each certificates as certificate}
      <div class="col-sm card">
        <div class="card-body">
          {#if windowWidth > 640}
          <h5 class="card-title">
            {#if certificate.type == 'award'}
            <div class="icon">{@html award}</div>
            {:else if certificate.type == 'degree'}
            <div class="icon">{@html degree}</div>
            {/if}
          {certificate.title}</h5>
          {:else}
          <h5 class="card-title">
            {#if certificate.type == 'award'}
            <div class="icon">{@html award}</div>
            {:else if certificate.type == 'degree'}
            <div class="icon">{@html degree}</div>
            {/if}
          {certificate.short}</h5>
          {/if}
          <h6 class="card-subtitle mb-2">{certificate.institution}</h6>
          <h6 class="card-subtitle mb-2 text-muted">{certificate.subtitle}</h6>
          <p class="card-text">{certificate.desc}</p>
        </div>
      </div>
    {/each}
	</div>
</div>