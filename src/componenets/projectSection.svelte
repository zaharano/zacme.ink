<script>
  import ProjectCard from "./projectCard.svelte";

  export let projects = [
    {
      img: "./assets/Enterprise_HD.jpg",
      tags: ["these", "are", "voyages"],
      title: "Shakar, when the walls fell",
      body: "Communication is not possible. The shuttle has no power. Using the gravitational pull of a star to slingshot back in time? Using the gravitational pull of a star to slingshot back in time?",
      button: {
        txt: "Make it so",
        href: "http://www.startrek.com"
      }
    },
    {
      img: "./assets/Enterprise_HD.jpg",
      tags: ["these", "are", "voyages"],
      title: "Shakar, when the walls fell",
      body: "Communication is not possible. The shuttle has no power. Using the gravitational pull of a star to slingshot back in time?",
      button: {
        txt: "Make it so",
        href: "http://www.startrek.com"
      }
    },
    {
      img: "./assets/Enterprise_HD.jpg",
      tags: ["these", "are"],
      title: "Shakar",
      body: "Thee gravitational pull of a star to slingshot back in time?",
      button: {
        txt: "Make it so",
        href: "http://www.startrek.com"
      }
    }
  ];

</script>

<section id="projects">
  <h1>
		Projects
  </h1>
  <div class="projects">
    {#each projects as project, i}
    <ProjectCard {...project}></ProjectCard>
    {/each} 
  </div>
</section>

<style>
  .projects {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: auto;
  }
</style>