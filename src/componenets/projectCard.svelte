<script>
  import Button from "./button.svelte";
  
  export let img = "./assets/Enterprise_HD.jpg";
  // export let alt = "The Starship Enterprise";
  export let tags = ["these", "are", "voyages"];
  export let title;
  export let body = "Communication is not possible. The shuttle has no power. Using the gravitational pull of a star to slingshot back in time?";
  export let button = {
      txt: "Make it so",
      href: "http://www.startrek.com"
  };

  let hide = true;

</script>

<article
  on:mouseenter={() => hide = false}
  on:mouseleave={() => hide = true}
  on:click={() => hide = !hide}
>
  <div style="background-image: url('{img}'" class="background {hide === false ? 'blur' : ''}" /> 
  <div 
    class="infotainer"
    class:hide>
    <div class="tags">
      {#each tags as tag, i}
        <span>{tag}{#if i < tags.length - 1}&nbsp;&nbsp;<em>//</em>&nbsp;&nbsp;{/if}</span>
      {/each}
    </div>
    <div class="beats">
      <h2 class="title">{title}</h2>
      <p class="body">{body}</p>
    </div>
    <div class="bottom" class:hide>
      <Button {...button} />
    </div>
  </div>
</article>

<style>
  article {
    position: relative;
    box-sizing: border-box;
    border: var(--border);
    border-radius: 10px;
    width: 48%;
    height: 25rem;
    overflow: hidden;
    text-align: left;
    margin-bottom: 4%;
  }

  @media (max-width: 1000px) {
    article {
      width: 95%;
      margin-right: auto;
      margin-left: auto;
    }
  }

  .background {
    position: relative;
    background-size: cover;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
  }

  .blur {
    filter: blur(4px);
  }

  .infotainer {
    box-sizing: border-box;
    position: relative;
    top: -102%;
    left: 0;
    width: 100%;
    height: 102%;
    background-color: rgba(255,255,255,.85);
    padding: 5%;
    padding-bottom: 2rem;
    transition: opacity .2s linear;
    opacity: 1;
    border-bottom: 4px solid var(--gray);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }

  .infotainer.hide {
    opacity: 0;
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 0rem;
  }

  .tags span {
    font-size: 1rem;
    display: inline-block;
    font-family: 'Vollkorn SC', serif;
    font-variant-caps: small-caps;
    -moz-font-feature-settings: "smcp";
    -webkit-font-feature-settings: "smcp";
    font-feature-settings: "smcp";
    margin-bottom: .5rem;
  }

  .tags {
    width: 100%;
    opacity: .6;
  }

  .bottom {
    width: 100%;
    position: relative;
    display: block;
    transition: transform .15s .15s ease-out;
  }

  .hide .bottom {
    transform: translateY(100px);
  }
</style>