<script>
  import Navigation from "./components/Navigation.svelte";
  import Header from "./components/Header.svelte";
  import About from "./components/About.svelte";
  import Skills from "./components/Skills.svelte";
  import Projects from "./components/Projects.svelte";
  import Education from "./components/Education.svelte";
  import Footer from "./components/Footer.svelte";
</script>

<style>
  main {
    font-family: sans-serif;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>

<main>
  <Navigation/>
  <Header/>
  <Skills/>
  <Projects/>
  <Education/>
  <Footer/>

</main>