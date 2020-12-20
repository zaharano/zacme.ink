<script>
  import { onMount } from 'svelte';
  import { gsap } from "gsap";
  import { fly } from 'svelte/transition';
  import ClickOutside from './clickOutside.svelte';
  import smoothscroll from 'smoothscroll-polyfill';

  smoothscroll.polyfill();

  let open = false;
  let hamburglar;

  const menu = [
    {
      txt: "Home",
      href: "main"
    },
    {
      txt: "Projects",
      href: "projects"
    },
    {
      txt: "Contact",
      href: "contact"
    }
  ]

  function menuAct(t) {
    handleClick();
    let e = document.getElementById(t);
    e.scrollIntoView({
      block: 'start',
      behavior: 'smooth',
      inline: 'start'
    });
  }

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
</script>

<div class="container">
  {#if open}
    <ClickOutside on:clickoutside={handleClick} exclude={[hamburglar]}>
      <nav class="menu" transition:fly="{{ y: 50, duration: 140 }}">
        <ul>
          {#each menu as {txt,href},i}
            {#if open}
              <li in:fly="{{y: -35,duration: 120,delay:i*50+100 }}">
                <button on:click={() => menuAct(href)}>{txt}</button>
              </li>
            {/if}
          {/each}
        </ul>
      </nav>
    </ClickOutside>
  {/if}
  <button 
    class="hamburguesa" 
    on:click={ handleClick } 
    on:mouseenter={playWiggle}
    bind:this={hamburglar}>
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
    pointer-events: all;
  }

  nav {
    background-color: white;
    position: fixed;
    height: 100%;
    width: 100%;
    top: 0;
    right: 0;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
  }

  li button {
    color: var(--gray);
    font-size: clamp(4rem, 6vw, 7rem);
    font-weight: 600;
    margin-bottom: 1rem;
    cursor: pointer;
  }

  button:hover {
    color: var(--acct);
  }

  button.hamburguesa {
    position: absolute;
    top: 1rem;
    right: 1rem;
    cursor: pointer;
  }

  @media (min-width: 760px) { 
    nav {
      max-width: 60rem;
      max-height: 60rem;
      position: absolute;
      padding: 5rem;
      height: inherit;
      width: inherit;
      box-shadow: 0 0 52px -10px rgba(0,0,0,.2);
      border: 1px solid var(--gray);
      border-bottom: 4px solid var(--gray);
    }

    li button {
      font-size: 3rem;
    }
  }
  
</style>