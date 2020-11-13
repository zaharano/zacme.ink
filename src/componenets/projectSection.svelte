<script>
import { each } from "svelte/internal";

  import ProjectCard from "./projectCard.svelte";

  export let projects = [
    {
      img: "./assets/Enterprise_HD.jpg",
      tags: ["these", "are", "voyages"],
      title: "Shakar, when the walls fell",
      body: "Communication is not possible. The shuttle has no power. Using the gravitational pull of a star to slingshot back in time?",
      button: {
        txt: "Make it so",
        href: "http://www.startrek.com"
      }
    }
  ];

  function handleClick() {
    console.log("we been clicked")
  }
</script>

{#each projects as project, i}
  <ProjectCard {...project} on:click={handleClick}></ProjectCard>
{/each}