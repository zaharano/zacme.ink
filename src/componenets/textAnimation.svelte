<script> 
  import { onMount } from 'svelte';
  import { gsap } from "gsap";
  import { TextPlugin } from "gsap/TextPlugin";

  gsap.registerPlugin(TextPlugin);

  const delay = .02,
        duration = .01,
        nudgeAmount = 25,
        nudges = {x:0, y:0};

  onMount(() => {
    // repeat: 1, repeatDelay: 10
    const tlc = gsap.timeline({delay: 2});
    const desTL = gsap.timeline({repeat: 1, repeatDelay: 1, yoyo: true}),
          animTL = gsap.timeline({}),
          codeTL = gsap.timeline({});

    const nudge = function(dim) {
      nudges[dim]++;
    }
    // word 'designer' nudges up and left, guides show up, color picker appear, color changed, yoyo
    // want to refactor this to clean it up, DRY it out
    const desSel = ' .designer';

    desTL.set('.guide-y-ends', {
      autoAlpha: 0
    })
    .set('.guide-x-ends', {
      autoAlpha: 0
    })
    .to(desSel, {
      top: 0
    })
    .add(nudge("y"))
    .to(desSel, {
      duration,
      top: (nudges.y * nudgeAmount * -1),
    })
    .to('.guide-y-line', {
      duration,
      height: nudges.y * nudgeAmount,
    })
    .to('.guide-y-ends', {
      autoAlpha: 1
    })
    .add(nudge("y"))
    .to(desSel, {
      delay,
      duration,
      top: (nudges.y * nudgeAmount * -1),
    })
    .to('.guide-y-line', {
      duration,
      height: nudges.y * nudgeAmount,
    })
    .add(nudge("x"))
    .to(desSel, {
      delay,
      duration,
      left: (nudges.x * nudgeAmount * -1),
    })
    .to('.guide-x-line', {
      duration,
      width: nudges.x * nudgeAmount,
    }).to('.guide-x-ends', {
      autoAlpha: 1
    })
    .add(nudge("x"))
    .to(desSel, {
      delay,
      duration,
      left: (nudges.x * nudgeAmount * -1),
    })
    .to('.guide-x-line', {
      duration,
      width: nudges.x * nudgeAmount,
    })
    .add(nudge("x"))
    .to(desSel, {
      delay: .5,
      duration,
      left: (nudges.x * nudgeAmount * -1),
    })
    .to('.guide-x-line', {
      duration,
      width: nudges.x * nudgeAmount,
    })
    .add(nudge("y"))
    .to(desSel, {
      delay: .5,
      duration,
      top: (nudges.y * nudgeAmount * -1),
    })
    .to('.guide-y-line', {
      duration,
      height: nudges.y * nudgeAmount,
    })

    animTL.to('.animator', {
      delay: .3,
      duration: .2,
      scaleY: 1.2,
      ease: "ease-out",
    })
    .to('.animator', {
      delay: .1,
      duration: 1,
      scaleY: .5,
      ease: "elastic.out(1, 0.3)",
    })
    .to('.animator', {
      delay: .1,
      duration: .2,
      scaleX: 1.2,
      ease: "ease-out",
    })
    .to('.animator', {
      delay: .1,
      duration: 1,
      scaleX: .5,
      ease: "elastic.out(1, 0.3)",
    })
    .to('.animator', {
      delay: .2,
      duration: 1,
      scale: 1,
      rotate: 360,
      ease: "elastic.out(1, 0.3)",
    })

    codeTL.to('.code-open', {
      duration: .4,
      text: "&lt;i",
      ease: "none"
    })
    .to('.code-close', {
      duration: .5,
      text: "&lt;/i",
      ease: "none"
    }, "<")
    .to ('.code-open', {
      delay: .4,
      duration: .1,
      text: "&lt;",
      ease: "none"
    })
    .to('.code-close', {
      duration: .1,
      text: "&lt;/",
      ease: "none"
    }, "<")
    .to ('.code-open', {
      duration: .4,
      text: "&lt;em&gt;",
      ease: "none"
    })
    .to('.code-close', {
      duration: .4,
      text: "&lt;/em&gt;",
      ease: "none"
    }, "<")
    .to('.code-em', {
      delay: .1,
      duration: .1,
      skewX: -20,
      ease: "ease-out"
    })
    .to ('.code-open', {
      delay: 1,
      duration: .4,
      text: "",
      ease: "none"
    })
    .to('.code-close', {
      duration: .4,
      text: "",
      ease: "none"
    }, "<")
    .to('.code-em', {
      duration: .2,
      skewX: 0,
      ease: "ease-out"
    })

    tlc.add(desTL).add(animTL, ">-.5").add(codeTL, ">-.5")

  });
</script>

<h1>
  My name is Zach. I’m an integrative 
    <span class="designer-contain">
      <span class="designer">
        designer,
      </span>
      <div class="guide-wrap" style="right: 70%;bottom: .3em;">
        <div class="guide-y-ends">
          <div class="guide-y-line"></div>
        </div>
      </div>
      <div class="guide-wrap" style="right: .1em;bottom: 80%;">
        <div class="guide-x-ends">
          <div class="guide-x-line"></div>
      </div>
    </span> 
    <span class="animator">
      animator
    </span> and 
    <span class="code">
      <span class="code-open"></span><span class="code-em">front-end developer</span><span class="code-close"></span>
    </span>.
</h1>

<style>
  span {
    position: relative;
    display: inline-block;
  }

  .guide-wrap {
    position: absolute;
    --guides: 2px solid var(--acct);
  }

  .guide-x-ends {
    position: relative;
    border-left: var(--guides);
    border-right: var(--guides);
    height: 10px;
    opacity: 0;
  }
  
  .guide-y-ends {
    position: relative;
    border-top: var(--guides);
    border-bottom: var(--guides);
    width: 10px;
    right: 20px;
    opacity: 0;
  }

  /* figure out getting nudgeAmount into base width/height of thing */
  .guide-x-line {
    border-top: var(--guides);
    width: 10px;
    position: relative;
    top: 4px;
  }
  .guide-y-line {
    border-left: var(--guides);
    height: 10px;
    position: relative;
    left: 4px;
  }

  /* .guide-text {
    color: white;
    font-size: 5px;
  } */

  .code-open, .code-close {
    font-family:'Courier New', Courier, monospace;
    color: purple;
    font-weight: 500;
    font-size: 50%;
    background-color: rgb(230, 230, 230);
    border-radius: 15px;
  }
</style>