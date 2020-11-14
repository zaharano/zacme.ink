<script>
  import Button from "./button.svelte";
  
  import { fade, fly } from 'svelte/transition';
  let show = true;
  

  export let img = "./assets/Enterprise_HD.jpg";
  export let alt = "The Starship Enterprise";
  export let tags = ["these", "are", "voyages"];
  export let title;
  export let body = "Communication is not possible. The shuttle has no power. Using the gravitational pull of a star to slingshot back in time?";
  export let button = {
      txt: "Make it so",
      href: "http://www.startrek.com"
  };

  const delim = " // ";

</script>

<article 
  on:click="{() => show = !show}">
  <div class="background {show === true ? 'blur' : ''}">
    <img src="{img}" alt="{alt}">
  </div>
  {#if show}
    <div 
      transition:fade
      class="infotainer">
      <div class="tags">
        {#each tags as tag, i}
          <h3>{tag}{#if i < tags.length - 1}&nbsp;&nbsp;//&nbsp;&nbsp;{/if}</h3>
        {/each}
      </div>
      <h2 class="title">{title}</h2>
      <p class="body">{body}</p>
      {#if show}
        <div class="bottom" transition:fly="{{ y: 100, duration: 300 }}">
          <Button {...button} />
        </div>
      {/if}
    </div>
  {/if}
</article>

<style>
  article {
    position: relative;
    box-sizing: border-box;
    border: var(--border);
    border-radius: 10px;
    width: 48%;
    overflow: hidden;
    text-align: left;
  }

  .background {
    position: relative;
    top: 0;
    left: 0;
  }

  .background img {
    width: 105%;
    margin: auto;
  }

  .blur {
    filter: blur(4px);
    border-bottom: 4px solid var(--gray);
  }

  .infotainer {
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    background-color: rgba(255,255,255,.9);
    padding: 2rem;
  }

  .tags {
    margin-bottom: .5rem;
  }
  .tags h3 {
    font-size: 1.3rem;
    display: inline-block;
    color: var(--acct);
    font-family: 'Vollkorn SC', serif;
    font-variant-caps: small-caps;
    -moz-font-feature-settings: "smcp";
    -webkit-font-feature-settings: "smcp";
    font-feature-settings: "smcp";
  }

  .bottom {
    position: relative;
    bottom: 0;
  }
</style>