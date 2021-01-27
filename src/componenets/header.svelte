<script>
  import Menu from './menu.svelte';
  import { onMount } from 'svelte';
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  onMount(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
      scrub: true,
      trigger: "#speech",
      start: "10% top",
      markers: true,
    }});
    tl.to('.header-bg', {
      autoAlpha: 1,
    })
  });
</script>

<header>
  <div class="header-container">
    <button aria-label=”Home” on:click={() => {document.getElementById('main').scrollIntoView({behavior: 'smooth'})}}>
     <svg class="header-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 111.75 143.68">
       <g id="lines">
         <path vector-effect="non-scaling-stroke" d="M56.06,23.46,34.81,47.1H56.06V72.68H0V49.22L20.34,25.58H0V0H56.06ZM54,1.84H1.69v21.9h22v.92l-22,25.2v21H54V48.94H31.37V48L54,22.82Z" stroke-width="1" />
         <path vector-effect="non-scaling-stroke" d="M111.75,72.68H54.18V0h57.57ZM109.82,1.84H83.93V25.3H82V1.84H56.11v69H82v-24h1.93v24h25.89Z" stroke-width="1" />
         <path vector-effect="non-scaling-stroke" d="M0,71H31.6c14.3,0,24,7.64,24,23v1.47c0,9.39-4.26,15.27-10.38,18.77,2.84,2.11,4.88,5.06,6.39,11.22l4.62,18.22H27.88l-.54-4.79-.8-10.58.36,10.58v4.79H0Zm25.12,70.84V120H27l2.39,21.81H53.89l-4-15.92c-2-7.63-5-9.57-7.54-11.31v-.92c2.39-1.2,11.45-6.81,11.45-18.22V94c0-14.26-9.06-21.16-22.2-21.16H1.78v69ZM22,94.74H32.67v1.84H22Z" stroke-width="1" />
         <path vector-effect="non-scaling-stroke" d="M54.13,71H81.08l3,11.32-.74-6.9V71h28.34v72.68h-27L81.91,133l.55,6.07v4.6H54.13Zm26.49,70.84V128L77,114.51l1.74-.46,7.36,27.79h23.74v-69H85.22v13.8l3.59,13.52-1.75.46L79.7,72.84H56v69Z" stroke-width="1" />
       </g>
       <g id="inside">
         <polygon class="cls-1" points="1.69 1.84 1.69 23.73 23.68 23.73 1.69 49.86 1.69 70.84 54.13 71 54.04 48.94 31.37 48.94 31.37 48.02 54.04 22.82 54.04 1.84 1.69 1.84"/>
         <polygon class="cls-1" points="56.11 1.84 56.11 70.84 82 70.84 82 46.83 83.93 46.83 83.38 71 109.82 70.84 109.82 1.84 83.93 1.84 83.93 25.3 82 25.3 82 1.84 56.11 1.84"/>
         <path class="cls-1" d="M49.89,125.92c-2-7.63-5-9.57-7.54-11.31v-.92c2.39-1.2,11.45-6.81,11.45-18.22V94c0-14.26-9.06-21.16-22.2-21.16H1.78v69H25.12V120H27l2.39,21.81H53.89ZM32.67,96.58H22V94.74H32.67Z"/>
         <polygon class="cls-1" points="80.62 141.84 80.62 128.04 77.04 114.51 78.78 114.06 86.14 141.84 109.88 141.84 109.88 72.84 85.22 72.84 85.22 86.64 88.81 100.16 87.06 100.62 79.7 72.84 55.97 72.84 55.97 141.84 80.62 141.84"/>
       </g>
     </svg>
    </button>
    <Menu />
    <div class="header-bg"></div>
  </div>
</header>

 <style>
  header {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    margin: auto;
    z-index: 1;
    pointer-events: none;
  }

  svg {
    padding: 4px;
  }

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--bg);
    /* box-shadow: 10px 0 30px 0 var(--gray); */
    z-index: -1;
    visibility: hidden;
    pointer-events: all;
    display: inherit;
  }
  
  .header-container {
    box-sizing: border-box;
    padding: 1rem;
    width: 100%;
    max-width: 1700px;
    margin: auto;
    display: flex;
    justify-content: space-between;
  }

  .header-logo {
    z-index: 8;
    height: 55px;
    position: relative;
    will-change: filter, transform;
    transition-property: transform, filter;
    transition-duration: .4s;
    transition-timing-function: var(--timing);
    filter: drop-shadow(0px 0px 0px var(--acctHide));
    pointer-events: all;
  }

  .header-logo #inside {
    fill: none;
  }

  .header-logo:hover {
    transform: translate(4px,-4px);
    filter: drop-shadow(-4px 4px 0px var(--acct));
  }

  .header-logo:hover #inside {
    fill: white;
  }

  @media (min-width: 850px) {
    header {
      background-color: initial;
      box-shadow: initial;
    }
    .header-logo {
      height: 90px;
    }
    .header-container {
      padding: 2rem;
    }
    .header-bg {
      display: none;
    }
  }
 </style>