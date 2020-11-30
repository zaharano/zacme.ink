<script>
  import { onMount } from 'svelte';
  import { gsap } from "gsap";
  import { fly } from 'svelte/transition';

  let open = true;

  function handleClick(){
    open = !open
  }

  function playWiggle(){

  }

  onMount(() => {
    const hamTL = gsap.timeline();
    const wiggleTL = gsap.timeline();
  });
</script>

<div class="container">
  {#if open}
    <nav class="menu" transition:fly="{{ y: 50, duration: 120 }}">
      <ul on:click={handleClick}>
        <li><a href="/">Home</a></li>
        <li><a href="/">My Work</a></li>
        <li><a href="/">Contact</a></li>
      </ul>
    </nav>
  {/if}
  <div class="hamburguesa" on:click={handleClick} on:mouseenter={playWiggle}>
    X
    <span class="circle circle-burst"></span>
    <span class="circle circle-crawl"></span>
  </div>
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
    font-size: clamp(3rem, 5vw, 6rem);
    font-weight: 600;
    margin-bottom: 1rem;
  }

  li a {
    color: var(--gray)
  }

  a:hover {
    color: var(--acct);
  }

  div.hamburguesa {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  @media (min-width: 481px) { 
    nav {
      width: 30vw;
      max-width: 60rem;
      height: 40vh;
      max-height: 60rem;
      position: absolute;
    }

    li {
      font-size: clamp(1.5rem, 2vw, 4rem);
    }
  }
  
</style>