<script>
  import { onMount } from 'svelte';
  import { gsap } from "gsap";
  import { fly } from 'svelte/transition';

  let open = false;

  function handleClick(){
    open = !open;
    if (open) {
      const tl = gsap.timeline();
      tl.to('#line1', {
        rotate: 225,
        y: 12,
      })
      .to('#line3', {
        rotate: -225,
        y: -12,
      }, "<")
      .to('#line2', {
        opacity: 0,
      }, "<");
    } else {
      const tl = gsap.timeline();
      tl.to('#line1', {
        rotate: 0,
        y: 0,
      })
      .to('#line3', {
        rotate: 0,
        y: 0,
      }, "<")
      .to('#line2', {
        opacity: 1,
      }, "<");
    }
  }

  function playWiggle(){

  }

  onMount(() => {
    gsap.set('#line1', {
      transformOrigin: "50% 50%",
    });
    gsap.set('#line3', {
      transformOrigin: "50% 50%",
    });
  });

  const menu = [
    {
      txt: "Home",
      href: "#"
    },
    {
      txt: "Work",
      href: "#"
    },
    {
      txt: "Contact",
      href: "#"
    }
  ]
</script>

<div class="container">
  {#if open}
    <nav class="menu" transition:fly="{{ y: 50, duration: 120 }}">
      <ul on:click={handleClick}>
        {#each menu as {txt,href},i}
          {#if open}
            <li in:fly="{{y: -35,duration: 100,delay:i*50+100 }}">
              <a {href}>{txt}</a>
            </li>
          {/if}
        {/each}
      </ul>
    </nav>
  {/if}
  <button 
    class="hamburguesa" 
    on:click={ handleClick } 
    on:mouseenter={playWiggle}>
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <g>
        <line id="line3" x1="10" y1="41.5" x2="50" y2="41.5" stroke="#454545"/>
        <line id="line2" x1="10" y1="29.5" x2="50" y2="29.5" stroke="#454545"/>
        <line id="line1" x1="10" y1="17.5" x2="50" y2="17.5" stroke="#454545"/>
      </g>
    </svg>
    <span class="circle circle-burst"></span>
    <span class="circle circle-crawl"></span>
  </button>
</div>

<style>
  .container {
    position: relative;
    right: 1.3em;
    top: -1em;
  }

  nav {
    border: 1px solid var(--gray);
    border-bottom: 4px solid var(--gray);
    background-color: white;
    position: fixed;
    height: 100vh;
    width: 100vw;
    top: 0;
    right: 0;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
  }

  li {
    font-size: clamp(4rem, 6vw, 7rem);
    font-weight: 600;
    margin-bottom: 1rem;
  }

  li a {
    color: var(--gray);
  }

  a:hover {
    color: var(--acct);
  }

  button.hamburguesa {
    position: absolute;
    top: 1rem;
    right: 1rem;
    cursor: pointer;
  }

  @media (min-width: 660px) { 
    nav {
      max-width: 60rem;
      max-height: 60rem;
      position: absolute;
      padding: 5rem;
      height: inherit;
      width: inherit;
      box-shadow: 0 0 52px -10px rgba(0,0,0,.2)
    }

    li {
      font-size: 2rem;
    }
  }
  
</style>