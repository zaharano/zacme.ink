<script>
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import { DrawSVGPlugin } from "gsap/all";
  import { Physics2DPlugin } from "gsap/Physics2DPlugin";
  import IntersectionObserver from "./intersectionObserver.svelte";

  onMount(() => {
    const footflower = gsap.timeline({
      // onComplete: sway,
      paused: true,
      delay: 0.6,
    });

    ScrollTrigger.create({
      trigger: "#footer-pile",
      animation: footflower,
      start: "top bottom",
    });

    // some anim shorteners
    const transformOrigin = "50% 50%";

    gsap.set("#burstPetals", {
      autoAlpha: 0,
    });

    footflower
      .set("#burstPetals", { autoAlpha: 1 }, "<")
      .to("#burstPetals > *", {
        ease: "expo.out",
        duration: 6,
        scale: "random(1, 1.2)",
        rotate: "random(200, 600)",
        physics2D: {
          velocity: "random(200, 300)",
          gravity: 450,
          angle: "random(-130, -30)",
        },
      })
      .to(
        "#burstPetals > *",
        {
          autoAlpha: 0,
          duration: 6,
        },
        "<"
      )
      .fromTo(
        "#footer-stem",
        {
          drawSVG: "0% 0%",
          autoAlpha: 0,
        },
        {
          drawSVG: "0% 100%",
          autoAlpha: 1,
        },
        "<"
      )
      .from(
        "#footer-flower_2",
        {
          transformOrigin,
          delay: 1,
          scale: 0.1,
          autoAlpha: 0,
          ease: "elastic.out(1, 0.3)",
        },
        "<"
      );
  });
</script>

<footer>
  <svg
    id="footer-pile"
    width="297"
    height="115"
    viewBox="0 0 297 115"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <g id="footer-flower" stroke="#454545" stroke-width="2">
        <path id="footer-stem" d="M142.5 92.5c0-30.4 4-46 17-53.5" />
        <g id="footer-flower_2">
          <path
            d="M156 30.2c-6.3.4-17.6-1-12-10.6 5.4-9.5 12.3-.5 15.1 5.1"
            fill="#FFAF66"
          />
          <path
            d="M162 51.2c11 0 6.8-10.4 3.2-15.5H159c-3.5 5.1-7.8 15.5 3.2 15.5z"
            fill="#FFAF66"
          />
          <path
            d="M143.8 40.6c5.5 9.5 12.3.6 15-5l-3.1-5.5c-6.3-.4-17.4 1-11.9 10.5z"
            fill="#FFAF66"
          />
          <path
            d="M144 19.6c-5.6 9.5 5.7 11 12 10.6l3.1-5.5c-2.8-5.6-9.7-14.6-15.2-5z"
            fill="#FFAF66"
          />
          <path
            d="M181.1 41c5.5-9.4-6.2-11.2-12.7-10.9l-3.1 5.4c3 5.9 10.3 15.1 15.8 5.6z"
            fill="#FFAF66"
          />
          <path
            d="M180.4 19.5c-5.5-9.5-12.3-.6-15 5l3.1 5.4c6.3.5 17.4-1 11.9-10.4z"
            fill="#FFAF66"
          />
          <path
            d="M162.1 9c-11 0-6.7 10.3-3.1 15.4h6.3C168.8 19.3 173 9 162 9z"
            fill="#FFAF66"
          />
          <path
            d="M166 24.4c3 1.8 4 5.8 2.1 9.2-2 3.3-6 4.4-9 2.7-3-1.8-4-5.9-2.1-9.2 1.9-3.3 6-4.4 9-2.7z"
            fill="#fff"
          />
        </g>
      </g>
      <g id="burstPetals" fill="#FFAF66" stroke="#454545" stroke-width="2">
        <path d="M137 85.2c-6.3.4-17.6-1-12-10.6 5.4-9.5 12.3-.5 15.1 5.1" />
        <path
          d="M143 106.2c11 0 6.8-10.4 3.2-15.5H140c-3.5 5.1-7.8 15.5 3.2 15.5z"
        />
        <path
          d="M124.8 95.6c5.5 9.5 12.3.6 15-5l-3.1-5.5c-6.3-.4-17.4 1-11.9 10.5z"
        />
        <path
          d="M125 74.6c-5.6 9.5 5.7 11 12 10.6l3.1-5.5c-2.8-5.6-9.7-14.6-15.2-5z"
        />
        <path
          d="M162.1 96c5.5-9.4-6.2-11.2-12.7-10.9l-3.1 5.4c3 5.9 10.3 15.1 15.8 5.6z"
        />
        <path
          d="M161.4 74.5c-5.5-9.5-12.3-.6-15 5l3.1 5.4c6.3.5 17.4-1 11.9-10.4z"
        />
        <path
          d="M143.1 64c-11 0-6.7 10.3-3.1 15.4h6.3C149.8 74.3 154 64 143 64z"
        />
        <path d="M137 85.2c-6.3.4-17.6-1-12-10.6 5.4-9.5 12.3-.5 15.1 5.1" />
        <path
          d="M143 106.2c11 0 6.8-10.4 3.2-15.5H140c-3.5 5.1-7.8 15.5 3.2 15.5z"
        />
        <path
          d="M124.8 95.6c5.5 9.5 12.3.6 15-5l-3.1-5.5c-6.3-.4-17.4 1-11.9 10.5z"
        />
        <path
          d="M125 74.6c-5.6 9.5 5.7 11 12 10.6l3.1-5.5c-2.8-5.6-9.7-14.6-15.2-5z"
        />
        <path
          d="M162.1 96c5.5-9.4-6.2-11.2-12.7-10.9l-3.1 5.4c3 5.9 10.3 15.1 15.8 5.6z"
        />
        <path
          d="M161.4 74.5c-5.5-9.5-12.3-.6-15 5l3.1 5.4c6.3.5 17.4-1 11.9-10.4z"
        />
        <path
          d="M143.1 64c-11 0-6.7 10.3-3.1 15.4h6.3C149.8 74.3 154 64 143 64z"
        />
      </g>
      <g id="pile" fill="#FFAF66" stroke="#454545" stroke-width="2">
        <path
          d="M143 106.2c11 0 6.8-10.4 3.2-15.5H140c-3.5 5.1-7.8 15.5 3.2 15.5z"
        />
        <path
          d="M116.3 107c9.9 4.9 10.5-6.3 9.7-12.5l-5.7-2.8c-5.4 3-13.9 10.5-4 15.3z"
        />
        <path
          d="M175 104.5c8.7-6.7-1-12.2-7-14.1l-5 3.9c.5 6.2 3.4 17 12 10.2z"
        />
        <path
          d="M40.2 95.7c5.6 3.8 11.6 0 14.6-3 .6-.7.5-1.6-.2-2l-2-1.4c-.2-.2-.5-.3-.8-.2-6.8.5-17.9 2.5-11.6 6.6z"
        />
        <path
          d="M165.8 81.7l-1.6.2a2.1 2.1 0 00-1.8 2.8c1.7 4.6 5.5 10.3 12.5 9.6 8.1-.9-1.5-8.3-7.8-12.3-.4-.2-.9-.3-1.3-.3z"
        />
        <path
          d="M124.5 99.5c8.3 2.6 12.8-5.8 14.1-10.3l-4.7-1.5c-6.7 3-17.8 9.3-9.4 11.8z"
        />
        <path
          d="M156 99.3c7.6-.9 9-8.3 8.8-13.3 0-1-1-1.8-2-1.6l-2.4.3a2 2 0 00-1.1.5c-4.8 5.5-11.7 15.1-3.3 14.1z"
        />
        <path
          d="M3.2 98.7c5.8 2.5 9.9-2.3 11.7-5.8.4-.7.1-1.6-.7-2l-2-.8h-.9C5.7 92-3 96 3.2 98.7z"
        />
        <path
          d="M62.3 94.7c5.9 4.2 12.2 1.1 16-2.2 1.3-1 1.2-3-.2-4l-1-.7c-.5-.3-1-.5-1.6-.5-7.7.5-20.1 2.4-13.2 7.4z"
        />
        <path
          d="M234 97.2c10-.8 3.3-7.4-1.7-11-.4-.2-.9-.3-1.3-.2l-4 .3a2 2 0 00-1.8 1.5c-1.2 4-.7 10 8.7 9.4z"
        />
        <path
          d="M183.1 94.7c10.3-1.8 2.3-6.5-3.6-9a3 3 0 00-1.6-.1l-3.2.6a2.8 2.8 0 00-2.4 2.8c0 3.4 2.3 7.2 10.8 5.7z"
        />
        <path
          d="M251 94.3c6.9-2.4.8-5.3-3.5-6.5a2 2 0 00-.7 0l-2.8 1c-.6.1-1 .7-1 1.4.1 2.8 1.8 6.1 8 4z"
        />
        <path
          d="M113.1 98.3c8.1 3 13.3-5 14.8-9.3l-4.6-1.8c-6.7 2.4-18.3 8-10.2 11z"
        />
        <path
          d="M147 96.5c10.7-1.6 1.6-6.9-4.2-9.4l-6.2 1c-1 3.5-.4 10 10.3 8.4z"
        />
        <path
          d="M215.2 95.2c5.9 2.5 10.2-1.9 12.4-5.6.6-1 .1-2.5-1-3l-1.2-.5c-.5-.2-1-.2-1.6 0-6.2 2-15.4 6.3-8.6 9.1z"
        />
        <path
          d="M88.4 95.7c6 3.8 12.3 0 15.6-3.3.7-.7.6-1.7-.3-2.3l-1.9-1.2c-.3-.2-.8-.3-1.2-.3-7.3.7-18.9 3-12.2 7.1z"
        />
        <path d="M148.5 88c-7.2 1.5-1.2 5.5 2.7 7.3l4-.9c.8-2.8.5-8-6.7-6.5z" />
        <path
          d="M152.2 83l-.7.2a1.9 1.9 0 00-1.2 2.6c1.6 3.1 4.8 6.7 9.5 5 5.6-1.8-1.5-5.8-6.2-7.8-.5-.2-1-.3-1.4 0z"
        />
        <path
          d="M204 96.2c7.3-2.3 1.6-5.9-2.8-7.6-.6-.3-1.3-.3-1.9 0l-1.7.5c-1.3.4-2 1.5-2 2.7.2 3.1 2.1 6.4 8.4 4.4z"
        />
        <path
          d="M119.4 89.4c7 4.6 14.5-1.3 17.3-4.8l-4-2.7c-7.4.6-20.4 3-13.3 7.5z"
        />
        <path
          d="M134.6 89.9c7 4.5 14.5-1.4 17.3-4.9l-4-2.6c-7.4.6-20.4 2.9-13.3 7.5z"
        />
        <path
          d="M147.1 87.2c7.1 4.6 14.5-1.3 17.4-4.8l-4.1-2.7c-7.4.6-20.4 2.9-13.3 7.5z"
        />
        <path
          d="M53.1 90.3c-.8 5.6 5.8 5.8 9.2 5.2l.5-3.2c-2.9-3-8.8-7.7-9.7-2z"
        />
        <path
          d="M134.2 84c7 4.7 14.5-1.3 17.3-4.8l-4-2.6c-7.4.6-20.5 2.9-13.3 7.5z"
        />
        <path
          d="M145.2 72.6l-1.4 1a2 2 0 00-.1 3.2c3.6 3.2 10 6.4 15.7 2.3 6.6-4.7-5.4-6.5-13-6.8a2 2 0 00-1.2.3z"
        />
        <path
          d="M151.6 77.9L150 79c-1 .7-1.1 2.2-.2 3 3.7 3.2 10 6.6 15.9 2.4 6.6-4.7-5.5-6.5-13-6.8-.3-.1-.8 0-1.1.3z"
        />
        <path
          d="M151.4 78.4l-1.6 1c-1 .8-1 2.2-.1 3 3.6 3.2 10 6.6 15.8 2.5 6.7-4.7-5.4-6.5-13-6.9-.3 0-.8.1-1.1.4z"
        />
        <path
          d="M279.4 91.4l-1.6 1c-1 .8-1 2.2-.1 3 3.6 3.2 10 6.6 15.8 2.5 6.7-4.7-5.4-6.5-13-6.9-.3 0-.8.1-1.1.4z"
        />
        <path
          d="M127.4 82.8c7.1 4.6 14.6-1.4 17.4-4.8l-4-2.7c-7.4.6-20.4 2.9-13.4 7.5z"
        />
        <path
          d="M145.2 81c8.7-2 2.2-6.6-2.8-9-.6-.2-1.2-.3-1.8-.1l-2.7.6c-1 .3-1.9 1.3-2 2.4-.1 3.6 1.5 8 9.3 6.2z"
        />
        <path
          d="M242.2 92.3c8.8-2.1 2.3-6.7-2.8-9-.5-.3-1.1-.4-1.7-.2l-2.7.6c-1 .3-1.9 1.3-2 2.4-.1 3.7 1.5 8.1 9.2 6.2z"
        />
        <path
          d="M142.2 97.5c6-8-4-10.5-9.8-10.8l-3.4 4.6c1.9 5.4 7.1 14.3 13.2 6.2z"
        />
        <path
          d="M156.6 94.1c5.4 8.5 11.4.1 13.6-5.2l-3-4.8c-5.9-.2-16 1.5-10.6 10z"
        />
      </g>
    </g>
  </svg>

  <div>
    <h3 class="sc">more of my work</h3>
    <ul>
      <li><a href="https://www.behance.net/zernesque">Behance</a></li>
      <li><a href="https://dribbble.com/zernity">Dribbble</a></li>
      <li><a href="https://github.com/zaharano">Github</a></li>
    </ul>
  </div>
  <small class="sc">
    <span>Designed and built by Zachary Hamias Rais-Norman</span> –
    <span>Copyright© 2020 ZACME LLC. It's official.</span>
    <!-- <span>I made this!</span> -->
  </small>
</footer>

<style>
  footer {
    background-color: var(--gray);
    height: 150px;
    margin-top: 1rem;
    border-radius: 10px 10px 0 0;
    padding: 2rem;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
  }

  h3 {
    margin-bottom: 0.5rem;
  }

  svg {
    position: absolute;
    top: -42%;
    overflow: visible;
  }

  li a {
    line-height: 1.4em;
    color: white;
    font-size: 1em;
    cursor: pointer;
  }

  small {
    font-size: 0.6em;
    margin-top: 2rem;
    opacity: 0.6;
  }

  small > span {
    display: inline-block;
  }

  a:hover {
    color: var(--acct);
  }

  /* span {
    display: inline-block;
    background-color: white;
    border-radius: 50%;
    padding: 1rem;
    color: var(--acct);
    transform: translateX(-2em) rotate(45deg) ;
  } */
</style>
