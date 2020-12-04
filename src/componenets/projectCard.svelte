<script>
  import Button from "./button.svelte";
  
  export let img = "./assets/Enterprise_HD.jpg";
  export let alt = "The Starship Enterprise";
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
>
  <div style="background-image: url('{img}'" class="background {hide === false ? 'blur' : ''}" /> 
  <div 
    class="infotainer"
    class:hide={hide}>
    <div class="tags">
      {#each tags as tag, i}
        <h3>{tag}{#if i < tags.length - 1}&nbsp;&nbsp;//&nbsp;&nbsp;{/if}</h3>
      {/each}
    </div>
    <h2 class="title">{title}</h2>
    <p class="body">{body}</p>
    <div class="bottom" class:hide={hide}>
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

  @media (max-width: 660px) {
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
    z-index: 2;
    background-color: rgba(255,255,255,.85);
    padding: 5%;
    padding-bottom: 2rem;
    transition: opacity .2s linear;
    opacity: 1;
    border-bottom: 4px solid var(--gray);
  }

  .infotainer.hide {
    opacity: 0;
  }

  h2 {
    font-size: 2rem;
  }

  h3 {
    font-size: 1rem;
    display: inline-block;
    color: var(--acct);
    font-family: 'Vollkorn SC', serif;
    font-variant-caps: small-caps;
    -moz-font-feature-settings: "smcp";
    -webkit-font-feature-settings: "smcp";
    font-feature-settings: "smcp";
    margin-bottom: .5rem;

  }

  .bottom {
    position: relative;
    bottom: -1rem;
    display: block;
    transition: transform .2s .2s ease-out;
  }

  .bottom.hide {
    transform: translateY(100px);
  }
</style>