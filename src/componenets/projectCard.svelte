<script>
  import Button from "./button.svelte";
  import ClickOutside from "./clickOutside.svelte";
  import IntersectionObserver from "./intersectionObserver.svelte"
  import { fade } from "svelte/transition"
  
  export let src = "./assets/Enterprise_HD.jpg";
  export let alt = "The Starship Enterprise";
  export let tags = ["these", "are", "voyages"];
  export let title;
  export let body = "Communication is not possible. The shuttle has no power. Using the gravitational pull of a star to slingshot back in time?";
  export let button = {
      txt: "Make it so",
      href: "http://www.startrek.com"
  };

  // hide the info
  let hide = true;
  function hideOff() {
    hide = false;
  }
  function hideOn() {
    hide = true;
  }

</script>

<!-- IntersectionObserver for defer load imgs and animating in tiles -->
<IntersectionObserver once={true} let:intersecting={intersecting}>
  {#if intersecting}
    <!-- ClickOutside for mobile (pressing outside tile rehides details) -->
    <ClickOutside on:clickoutside={hideOn}>
      <article
      in:fade="{{ delay: 100, duration: 400 }}"
      on:mouseover={hideOff}
      on:mouseleave={hideOn}
      on:click={hideOff}
      class:hide
      >
          <img {src} {alt} class="background" /> 
        <div class="infotainer">
          <div class="tags">
            {#each tags as tag, i}
              <span>{tag}{#if i < tags.length - 1}&nbsp;&nbsp;<em>//</em>&nbsp;&nbsp;{/if}</span>
            {/each}
          </div>
          <div class="details">
            <h2 class="title">{title}</h2>
            <p class="body">{body}</p>
          </div>
          <div class="bottom">
            <Button {...button} />
          </div>
        </div>
      </article>
    </ClickOutside>
  {/if}
</IntersectionObserver>


<style>
  article {
    position: relative;
    box-sizing: border-box;
    border: var(--border);
    border-bottom: 4px solid var(--gray);
    border-radius: 10px;
    height: auto;
    overflow: hidden;
    text-align: left;
    box-shadow: 0 0 30px 0 rgba(0,0,0,.2)
  }

  h2 {
    font-size: 1.6em;
    margin-bottom: 0rem;
  }

  p {
    margin-bottom: 0;
  }

  .background {
    width: 100%;
    margin-bottom: -6px;
    transform: scale(105%);
    filter: blur(6px);
    transition: filter .3s linear;
  }

  .hide .background {
    filter: blur(0px);
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
    padding-bottom: 5%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    transition: opacity .3s linear;
    opacity: 1;
  }

  .hide .infotainer {
    opacity: 0;
  }

  .tags span {
    font-size: 1em;
    display: inline-block;
    font-family: 'Vollkorn SC', serif;
    font-variant-caps: small-caps;
    -moz-font-feature-settings: "smcp";
    -webkit-font-feature-settings: "smcp";
    font-feature-settings: "smcp";
  }

  .tags {
    width: 100%;
    opacity: .6;
  }

  .details {
    width: 100%;
  }

  .bottom {
    width: 100%;
    position: relative;
    display: block;
    transition: transform .15s .15s ease-out;
  }

  .hide .bottom {
    transform: translateY(100%);
  }

  @media (max-width: 480px) { 
    h2 {
      font-size: 1.4em;
    }
    
    article {
      margin-bottom: 1.5em;
    }
  }
</style>