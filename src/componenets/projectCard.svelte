<script>
  import Button from "./button.svelte";

  export let img = "./assets/Enterprise_HD.jpg";
  export let tags = ["these", "are", "voyages"];
  export let title;
  export let body = "Communication is not possible. The shuttle has no power. Using the gravitational pull of a star to slingshot back in time?";
  export let button = {
      txt: "Make it so",
      href: "http://www.startrek.com"
  };

  const delim = " // ";
</script>

<section>
  <div class="tags">
    {#each tags as tag, i}
      <span>{tag}{#if i < tags.length - 1}{delim}{/if}</span>
    {/each}
  </div>
  <h2 class="title">{title}</h2>
  <p class="body">{body}</p>
  <Button {...button} />
</section>

<style>
  
</style>