<script>
  import Button from "./button.svelte";
  import ClickOutside from "./clickOutside.svelte";
  
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

  function hideOff() {
    hide = false;
  }

  function hideOn() {
    hide = true;
  }

</script>

<ClickOutside on:clickoutside={hideOn}>
  <article
  on:mouseover={hideOff}
  on:mouseleave={hideOn}
  on:click={hideOff}
  >
    <img src="{img}" alt="{alt}" class="background {hide === false ? 'blur' : ''}" loading="lazy"/> 
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
</ClickOutside>


<style>
  article {
    position: relative;
    box-sizing: border-box;
    border: var(--border);
    border-radius: 10px;
    height: auto;
    overflow: hidden;
    text-align: left;
    box-shadow: 0 0 30px 0 rgba(0,0,0,.2)
  }

  p {
    margin-bottom: 0;
  }

  .background {
    width: 100%;
    margin-bottom: -6px;
    transform: scale(105%);
  }

  .blur {
    filter: blur(4px);
  }

  .infotainer {
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255,255,255,.85);
    padding: 5%;
    padding-bottom: 7%;
    transition: opacity .2s linear;
    opacity: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }

  .infotainer.hide {
    opacity: 0;
  }

  h2 {
    font-size: 1.6rem;
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
  }

  .beats {
    width: 100%;
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