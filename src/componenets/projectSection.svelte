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

<section>
  <h1 id="projects">
		Projects
	</h1>
  {#each projects as project, i}
  <ProjectCard {...project}></ProjectCard>
  {/each} 
</section>

<style>
  section {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    max-width: 1000px;
    margin: auto;
  }
</style>