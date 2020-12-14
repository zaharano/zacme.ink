<script> 
  import { onMount } from 'svelte';
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import { DrawSVGPlugin } from 'gsap/all';
  import { GSDevTools } from "gsap/GSDevTools"
  import { Physics2DPlugin } from "gsap/Physics2DPlugin"
  // import DashedCircle from './dashedCircle.svelte';

  gsap.registerPlugin(
    ScrollTrigger, 
    DrawSVGPlugin,
    GSDevTools,
    Physics2DPlugin
  );

  onMount(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
      trigger: ".venn",
      start: "-40% top",
    }});
    const designIconTL = gsap.timeline();
    const animateIconTL = gsap.timeline();
    const developIconTL = gsap.timeline();
    const magicIconTL = gsap.timeline();

    const transformOrigin = "50% 50%";
    const iconEase = 'power4.out',
          iconDur = .4,
          iconOverlap = '-=.2';

    const iconWord = {
      autoAlpha: 0,
      duration: .2,
      transformOrigin,
      scale: 5,
      ease: "power1.out"
    }

    // pop-in animation for magic icon
    const show = { autoAlpha: 1 };
    const petalFlyer = {
      autoAlpha: 0,
      ease: "power4.out",
      duration: 6, 
      rotate: "random(200, 600)",
      physics2D: {
        velocity: "random(340, 500)",
        gravity: 350,
        angle: "random(-160, 50)",
      },
    };

    gsap.set('.magic-icon-petalbursts', {
      autoAlpha: 0,
    })

    magicIconTL.set('#magic-set', {
      y: 90,
    })
    .from('#magic-icon-wand', {
      x: -20,
      y: 20,
      autoAlpha: 0,
      duration: iconDur,
      ease: iconEase,
    })
    .fromTo('.magic-icon-stems', {
      drawSVG: "0% 0%",
      autoAlpha: 0,
    }, {
      drawSVG: "0% 100%",
      autoAlpha: 1,
      duration: iconDur,
      ease: iconEase,
    }, "flowers")
    .from('.magic-icon-flowers', {
      transformOrigin,
      scale: .1,
      autoAlpha: 0,
      stagger: .2,
      duration: iconDur,
      ease: "elastic.out(1, 0.3)",
    }, "-=.1")
    .set('#burst1', show, "flowers+=.35")
    .to('#burst1 > *', petalFlyer, "flowers+=.35")
    .set('#burst2', show, "flowers+=.55")
    .to('#burst2 > *', petalFlyer, "flowers+=.55")
    .set('#burst3', show, "flowers+=.75")
    .to('#burst3 > *', petalFlyer, "flowers+=.75")
    .from('#magic-word', iconWord, "flowers+=1");

   
    // mirp1 mirp3 <.3 milp5 milp1 <.9 micp4 micp2 <1.5

    // pop-in animation for develop icon
    developIconTL.set('#develop-icon', {
      transformOrigin,
      x: 37,
      y: 30,
    })
    .from('#develop-icon', {
      autoAlpha: 0, 
      scaleX: 0,
      duration: iconDur,
      ease: iconEase,
    })
    .from('#develop-icon', {
      scaleY: .1,
      duration: iconDur/2,
      ease: iconEase,
    })
    .from('#develop-icon-open-bracket', {
      autoAlpha: 0,
      duration: .01,
      delay: .1,
    })
    .from('#develop-icon-slash', {
      autoAlpha: 0,
      duration: .01,
      delay: .2,
    })
    .from('#develop-icon-close-bracket', {
      autoAlpha: 0,
      duration: .01,
      delay: .1,
    })
    .from('#develop-word', iconWord);

    // pop-in animation for Design icon
    designIconTL.from('#design-icon-ruler', {
      x: -40,
      y: 40,
      autoAlpha: 0,
      duration: iconDur,
      ease: iconEase,
    })
    .from('#design-icon-pencil', {
      x: 40,
      y: 40, 
      autoAlpha: 0,
      duration: iconDur,
      ease: iconEase,
    }, iconOverlap)
    .from ('#design-word', iconWord);

    // pop-in animation for Animate icon
    animateIconTL
    .set('.animate-icon-line', {
      drawSVG: '0',
      autoAlpha: 0,
    }, "0")
    .set('#animate-icon-circle', {
      x: -40,
    })
    .from('#animate-icon-circle', {
      autoAlpha: 0,
      duration: iconDur,
      ease: iconEase,
    })
    .to('#animate-icon-circle', {
      x: -50,
      delay: .1,
      scaleX: .8,
      duration: iconDur,
      ease: iconEase,
    }, "<")
    .from('.animate-icon-line', {
      autoAlpha: 0,
      duration: .1,
    }, "circleStart")
    .to('#animate-icon-circle', {
      x:0,
      duration: (iconDur*2),
      ease: iconEase,
    })
    .to('.animate-icon-line', {
      drawSVG: "0 100%",
      stagger: .1,
      duration: .3,
    }, "circleStart+=.2")
    .to('#animate-icon-circle', {
      scaleX: 1.2,
      duration: (iconDur/2),
      ease: "none",
    }, "circleStart")
    .to('#animate-icon-circle', {
      scaleX: 1,
      duration: (iconDur/2),
      ease: "none",
    }, "circleStart+=.2")
    .from('#animate-icon-ghost2', {
      autoAlpha: 0,
      duration: .1,
    }, `circleStart+=${iconDur/3}`)
    .from('#animate-icon-ghost1', {
      autoAlpha: 0,
      duration: .1,
    }, `circleStart+=${(iconDur/3)*2}`)
    .from('#animate-word', iconWord)
    .timeScale(1.4);

    // whole venn circles animation
    const duration = .6,
          innerCircles = {
            autoAlpha: 0,
            duration,
            scale: .5,
            transformOrigin,
            delay: .2,
            ease: "power2.out",
          },
          innerCircleOffset = "-=.6",
          iconOffset = "-=.2",
          moveOffset = "+=.2";
    
    // // bursts version
    // const           burstFrom = {
          //   autoAlpha: 0,
          //   scale: 0.1,
          //   transformOrigin,
          // },
          // burstTo = {
          //   duration: 1.2,
          //   autoAlpha: 0,
          //   scale: 1.4,
          //   rotate: 180,
          //   transformOrigin,
          //   ease: "power3.inOut",
          // },
          // oranges = {
          //   duration,
          //   autoAlpha: 0,
          //   scale: .4,
          //   transformOrigin,
          //   ease: "power2.inOut",
          // },
          // outerCircleOffset = "-=.7",
          // popOffset = "-=.4",
    // tl.fromTo('#orange-b-1', burstFrom, burstTo)
    // .from('#orange-1', oranges, outerCircleOffset)
    // .from('.circle-design', innerCircles, innerCircleOffset)
    // .add(designIconTL, iconOffset)
    // .fromTo('#orange-b-2', burstFrom, burstTo, popOffset)
    // .from('#orange-2', oranges, outerCircleOffset)
    // .from('.circle-animate', innerCircles, innerCircleOffset)
    // .add(animateIconTL, iconOffset)
    // .fromTo('#orange-b-3', burstFrom, burstTo, popOffset)
    // .from('#orange-3', oranges, outerCircleOffset)
    // .from('.circle-develop', innerCircles, innerCircleOffset)
    // .add(developIconTL, iconOffset)

    tl
    .from('.circle-design', innerCircles)
    .add(designIconTL, iconOffset)
    .from('.circle-animate', innerCircles, innerCircleOffset)
    .add(animateIconTL, iconOffset)
    .from('.circle-develop', innerCircles, innerCircleOffset)
    .add(developIconTL, iconOffset)
    .to('.circle-design-w', {
      duration,
      delay: .4,
      y: 80,
    })
    .to('#design-set', {
      duration,
      y: -8
    }, "<")
    .to('.circle-animate-w', {
      duration,
      y: -80,
      x: 95
    }, moveOffset)
    .to('#animate-set', {
      duration,
      y: -20,
      x: 40
    }, "<")
    .to('.circle-develop-w', {
      duration,
      y: -80,
      x: -95
    }, moveOffset)
    .to('#develop-set', {
      duration,
      y: -20,
      x: -40
    }, "<")
    .add(magicIconTL);

    
    //slight parallax to delay scroll?
    // gsap.to(".venn", {
    //   yPercent: 30,
    //   ease: "none",
    //   scrollTrigger: {
    //     trigger: ".venn",
    //     // start: "top bottom", // the default values
    //     // end: "bottom top",
    //     scrub: true
    //   }, 
    // });

    // dev slider
    // GSDevTools.create({animation: tl})
  });
</script>

<!-- role="img" aria-label="[title + description]" -->
<section class="venn">
  <svg width="836" height="761" viewBox="-50 -50 936 861" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="836" height="761" />

    <!-- all the circles -->
    <g id="venn-total"> 
      <circle class="circle-design circle-design-w crawlTrigger" id="fill-1" cx="418" cy="208" vector-effect="non-scaling-stroke" r="200" fill="white" data-key="1"/>
      <circle class="circle-animate circle-animate-w crawlTrigger" id="fill-2" cx="208" vector-effect="non-scaling-stroke" cy="553" r="200" fill="white" data-key="2"/>
      <circle class="circle-develop circle-develop-w crawlTrigger" id="fill-3" cx="628" vector-effect="non-scaling-stroke" cy="553" r="200" fill="white" data-key="3"/>
      <circle class="circle-design circle-design-w" id="line-1" cx="418" cy="208" vector-effect="non-scaling-stroke" r="199.5" stroke="#454545"/>
      <circle class="circle-animate circle-animate-w" id="line-2" cx="208" vector-effect="non-scaling-stroke" cy="553" r="199.5" stroke="#454545"/>
      <circle class="circle-develop circle-develop-w" id="line-3" cx="628" vector-effect="non-scaling-stroke" cy="553" r="199.5" stroke="#454545"/>
      <!-- <circle class="bursts crawling-line" id="orange-b-1" vector-effect="non-scaling-stroke" cx="418" cy="208" r="207.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 10"
      stroke-dashoffset="20px" stroke-width="2"/>
      <circle class="bursts crawling-line" id="orange-b-2" vector-effect="non-scaling-stroke" cx="208" cy="553" r="207.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 10"
      stroke-dashoffset="20px" stroke-width="2"/>
      <circle class="bursts crawling-line" id="orange-b-3" vector-effect="non-scaling-stroke" cx="628" cy="553" r="207.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 10"
      stroke-dashoffset="20px" stroke-width="2"/> -->
      <!-- <circle class="circle-design-w crawler" id="orange-1" vector-effect="non-scaling-stroke" cx="418" cy="208" r="207.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 10"
      stroke-dashoffset="20px" stroke-width="2"/> -->
      <!-- <DashedCircle
        cx="418" cy="208"
        id="orange-1"
        key="0"
        classes="circle-design-w crawler"
      />
      <circle class="circle-animate-w crawler" id="orange-2" vector-effect="non-scaling-stroke" cx="208" cy="553" r="207.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 10"
      stroke-dashoffset="20px" stroke-width="2"/>
      <circle class="circle-develop-w crawler" id="orange-3" vector-effect="non-scaling-stroke" cx="628" cy="553" r="207.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 10"
      stroke-dashoffset="20px" stroke-width="2"/> -->
  <!-- end circles -->
      
  <!-- design icon -->
      <g id="design-set">
        <g id="icon design-icon">
          <g id="design-icon-ruler">
            <path id="Rectangle 6" d="M386.414 193.276L442.276 137.414L451.468 146.607L395.607 202.468L386.414 193.276Z" fill="white" stroke="#454545" stroke-width="2"/>
            <line id="Line 6" x1="394.192" y1="193.983" x2="399.142" y2="198.932" stroke="#454545" stroke-width="2"/>
            <line id="Line 10" x1="408.335" y1="179.841" x2="413.284" y2="184.79" stroke="#454545" stroke-width="2"/>
            <line id="Line 14" x1="422.477" y1="165.698" x2="427.426" y2="170.648" stroke="#454545" stroke-width="2"/>
            <line id="Line 18" x1="436.619" y1="151.556" x2="441.568" y2="156.506" stroke="#454545" stroke-width="2"/>
            <line id="Line 8" x1="401.263" y1="186.912" x2="406.213" y2="191.861" stroke="#454545" stroke-width="2"/>
            <line id="Line 11" x1="415.405" y1="172.77" x2="420.355" y2="177.719" stroke="#454545" stroke-width="2"/>
            <line id="Line 15" x1="429.548" y1="158.627" x2="434.498" y2="163.577" stroke="#454545" stroke-width="2"/>
            <line id="Line 19" x1="443.69" y1="144.485" x2="448.64" y2="149.435" stroke="#454545" stroke-width="2"/>
            <line id="Line 7" x1="399.849" y1="192.569" x2="402.678" y2="195.397" stroke="#454545" stroke-width="2"/>
            <line id="Line 12" x1="413.991" y1="178.426" x2="416.82" y2="181.255" stroke="#454545" stroke-width="2"/>
            <line id="Line 16" x1="428.133" y1="164.284" x2="430.962" y2="167.113" stroke="#454545" stroke-width="2"/>
            <line id="Line 20" x1="442.275" y1="150.142" x2="445.104" y2="152.971" stroke="#454545" stroke-width="2"/>
            <line id="Line 9" x1="406.92" y1="185.497" x2="409.749" y2="188.326" stroke="#454545" stroke-width="2"/>
            <line id="Line 13" x1="421.063" y1="171.355" x2="423.891" y2="174.184" stroke="#454545" stroke-width="2"/>
            <line id="Line 17" x1="435.205" y1="157.213" x2="438.033" y2="160.042" stroke="#454545" stroke-width="2"/>
          </g>
          <g id="design-icon-pencil">
            <path id="Rectangle 7" d="M390.098 141.098L405.419 147.227L449.468 191.276C451.03 192.838 451.03 195.37 449.468 196.933L445.932 200.468C444.37 202.03 441.838 202.03 440.275 200.468L396.226 156.419L390.098 141.098Z" fill="white" stroke="#454545" stroke-width="2"/>
            <path id="Line 4" d="M405.273 147.082L396.081 156.274" stroke="#454545" stroke-width="2"/>
            <path id="Line 5" d="M447.346 189.154L438.154 198.347" stroke="#454545" stroke-width="2"/>
          </g>
        </g>
        <g id="design-word" fill="#454545">
          <path d="M356 238c0-.7 0-1.2.2-1.5l1.3-.3c.4-.2.6-.4.7-.8l.2-1.8v-9.4c0-.7 0-1.2-.2-1.6-.1-.4-.3-.6-.7-.8l-1.3-.3a7 7 0 01-.1-1.6 131.8 131.8 0 006.4 0h2c3.4 0 6.3.6 8.5 1.9 2.2 1.2 3.4 3.4 3.4 6.7 0 3.8-1.3 6.3-3.8 7.6a18 18 0 01-8.2 1.9H356zm8.5-1.6c1.8 0 3.2-.2 4.4-.6a5.3 5.3 0 002.8-2.2c.7-1.1 1.1-2.6 1.1-4.6 0-2.7-.8-4.6-2.5-5.8a10.7 10.7 0 00-6.4-1.7c-1 0-1.7 0-2.2.2v11.9c0 .7 0 1.3.2 1.7.2.4.4.7.8.9l1.8.2zM395.8 232.9a3 3 0 011.6.8c-.5 1.1-.8 2.6-1 4.3h-15.3c0-.7 0-1.2.2-1.5l1.3-.3c.3-.2.5-.4.7-.8l.1-1.8v-9.4c0-.7 0-1.2-.2-1.6-.1-.4-.3-.6-.6-.8l-1.3-.3-.2-1.6a204.6 204.6 0 0014.5 0l.7 4.5a3 3 0 01-1.6.4c-.1-1-.5-1.8-1.3-2.4-.7-.6-2-.9-3.8-.9h-2.9v6.7h1.8c1.3 0 2.2-.2 2.7-.5.5-.2.7-.8.8-1.5.5-.2 1-.3 1.6-.3a43.4 43.4 0 000 6.2c-.6 0-1.2-.1-1.6-.3 0-.7-.3-1.3-.8-1.6-.5-.3-1.4-.4-2.7-.4h-1.8v3.8c0 .7.1 1.3.3 1.7.1.4.4.7.8.9l1.8.2h.2a11 11 0 003.2-.4c.8-.2 1.3-.6 1.7-1 .4-.5.7-1.2 1-2.1zM409.8 238.3a15.2 15.2 0 01-7-1.6c.2-1.6.3-3 .2-4.2.5-.2 1.2-.3 2-.3 0 1.5.5 2.6 1.4 3.3.9.7 2.1 1 3.8 1 1.4 0 2.5-.2 3.3-.7.8-.4 1.2-1 1.2-1.7 0-.5-.2-1-.6-1.3-.4-.4-.9-.7-1.5-1l-2.4-.9-3.6-1.4c-1-.5-1.7-1-2.4-1.8-.6-.8-1-1.8-1-3 0-1.6.7-2.8 1.9-3.7a8.7 8.7 0 015-1.2c1.1 0 2.2 0 3.3.3 1.1.2 2 .5 2.6.8a15 15 0 00.2 3.8c-.5.3-1.1.4-2 .4-.3-1.4-.8-2.3-1.6-2.8-.8-.6-1.7-.9-2.8-.9-1 0-1.9.2-2.6.6-.6.3-1 .9-1 1.6 0 .8.4 1.4 1.2 1.9.8.5 2 1 3.6 1.6 1.4.4 2.5.9 3.4 1.3 1 .5 1.7 1 2.3 1.8a4 4 0 011 2.7c0 1.6-.7 2.9-2 3.9s-3.3 1.5-6 1.5zM423 238c0-.7 0-1.2.2-1.5l1.3-.3c.3-.2.5-.4.7-.8l.1-1.6v-9.6l-.1-1.6c-.2-.4-.4-.6-.7-.8l-1.3-.3-.2-1.6a131.1 131.1 0 008 0l-.1 1.6c-1 .1-1.5.3-1.8.6-.3.4-.4 1-.4 2v9.7c0 1 .1 1.7.4 2 .3.4.9.6 1.8.7v1.6a140.7 140.7 0 00-7.9 0zM446.2 238.3c-2 0-3.9-.4-5.5-1.2a9 9 0 01-3.7-3.3c-.9-1.5-1.3-3.1-1.3-5s.5-3.5 1.6-4.9c1-1.3 2.3-2.4 4-3a14 14 0 015.4-1.1 23.3 23.3 0 017.6 1.3c-.2.9-.3 2.3-.3 4.1-.5.2-1 .3-1.9.3 0-1.5-.5-2.6-1.4-3.2-1-.6-2.2-1-3.8-1-1.6 0-3 .4-4.2 1a6 6 0 00-2.5 2.5 7 7 0 00-.8 3.4 9 9 0 001.9 6 6.8 6.8 0 005.5 2.3 31.5 31.5 0 003-.3c.4 0 .6-.2.8-.5.2-.3.3-.8.3-1.4v-1.1c0-.7 0-1.2-.2-1.5a1 1 0 00-.7-.6l-1.8-.2-.2-1.7a62.2 62.2 0 007.7 0c0 .7 0 1.2-.2 1.7-.4 0-.8 0-1 .2-.2 0-.3.3-.4.6v3.5c0 .3.2.6.4 1-1 .6-2.2 1.1-3.6 1.5-1.4.4-3 .6-4.7.6zM479 220h3c0 .6 0 1.2-.2 1.5-.5.1-.9.2-1.1.4-.3.3-.5.6-.6 1.2l-.1 2.2V238c-.3.2-.8.3-1.5.3l-13-14.3v8.6l.2 2.3c.2.6.4 1 .7 1.2.3.2.8.3 1.4.4l.2 1.6a89.7 89.7 0 00-6.5 0c0-.7 0-1.3.2-1.6.6-.1 1-.2 1.3-.4.3-.3.5-.6.7-1.2l.2-2.3v-10.5l-.7-.4a9 9 0 00-1.5-.2l-.2-1.6a45.5 45.5 0 004.8 0l12 13.5v-8l-.2-2.3c-.2-.6-.4-1-.7-1.2-.3-.2-.8-.3-1.4-.4l-.1-1.6 3 .1z"/>
        </g>
      </g>
<!-- end design icon -->

<!-- magic icon -->
      <g id="magic-set">
        <g id="icon magic-icon">
          <g id="magic-icon-wand">
            <rect id="Rectangle 12" x="423.142" y="283.363" width="7.48801" height="65.827" rx="1" transform="rotate(39.6594 423.142 283.363)" fill="#454545" stroke="#454545" stroke-width="2"/>
            <rect id="Rectangle 13" x="423.26" y="284.627" width="5.69281" height="4.744" transform="rotate(39.6594 423.26 284.627)" fill="white"/>
          </g>
          <path class="magic-icon-stems" d="M424.079 284C425.845 280.22 427.698 272.5 427.698 268.3C427.698 264.1 426.991 259.48 425.579 257.5" stroke="#454545" stroke-width="2"/>
          <path class="magic-icon-stems" d="M428.366 287.411C431.096 285.176 438.421 282.315 442.624 282.315C447.078 282.315 448.579 282.5 452.079 283" stroke="#454545" stroke-width="2"/>
          <path class="magic-icon-stems" d="M426 286L453.5 253" stroke="#454545" stroke-width="2"/>

          <g id="burst1" class="magic-icon-petalbursts">
            <path d="M440.4 289.665C444.604 296.947 449.801 290.132 451.874 285.814L449.472 281.653C444.696 281.289 436.196 282.382 440.4 289.665Z" class="petal"/>
            <path d="M440.4 273.523C436.196 280.805 444.696 281.898 449.472 281.535L451.875 277.373C449.802 273.056 444.605 266.241 440.4 273.523Z" class="petal"/>
            <path d="M454.362 265.565C445.956 265.565 449.259 273.572 451.961 277.575H456.764C459.466 273.572 462.768 265.565 454.362 265.565Z" class="petal"/>
            <path d="M454.362 298.435C462.768 298.435 459.465 290.007 456.763 285.793H451.96C449.258 290.007 445.956 298.435 454.362 298.435Z" class="petal"/>
            <path d="M468.391 289.665C472.596 282.383 464.095 281.289 459.319 281.653L456.917 285.814C458.99 290.132 464.187 296.947 468.391 289.665Z" class="petal"/>
            <path d="M468.392 273.523C464.187 266.241 458.99 273.056 456.917 277.373L459.32 281.535C464.095 281.898 472.596 280.805 468.392 273.523Z" class="petal"/>
            <path d="M440.4 289.665C444.604 296.947 449.801 290.132 451.874 285.814L449.472 281.653C444.696 281.289 436.196 282.382 440.4 289.665Z" class="petal"/>
            <path d="M440.4 273.523C436.196 280.805 444.696 281.898 449.472 281.535L451.875 277.373C449.802 273.056 444.605 266.241 440.4 273.523Z" class="petal"/>
            <path d="M454.362 265.565C445.956 265.565 449.259 273.572 451.961 277.575H456.764C459.466 273.572 462.768 265.565 454.362 265.565Z" class="petal"/>
            <path d="M454.362 298.435C462.768 298.435 459.465 290.007 456.763 285.793H451.96C449.258 290.007 445.956 298.435 454.362 298.435Z" class="petal"/>
            <path d="M468.391 289.665C472.596 282.383 464.095 281.289 459.319 281.653L456.917 285.814C458.99 290.132 464.187 296.947 468.391 289.665Z" class="petal"/>
            <path d="M468.392 273.523C464.187 266.241 458.99 273.056 456.917 277.373L459.32 281.535C464.095 281.898 472.596 280.805 468.392 273.523Z" class="petal"/>
          </g>

          <g class="magic-icon-flowers">
            <path d="M440.4 289.665C444.604 296.947 449.801 290.132 451.874 285.814L449.472 281.653C444.696 281.289 436.196 282.382 440.4 289.665Z" class="petal"/>
            <path d="M440.4 273.523C436.196 280.805 444.696 281.898 449.472 281.535L451.875 277.373C449.802 273.056 444.605 266.241 440.4 273.523Z" class="petal"/>
            <path d="M454.362 265.565C445.956 265.565 449.259 273.572 451.961 277.575H456.764C459.466 273.572 462.768 265.565 454.362 265.565Z" class="petal"/>
            <path d="M454.362 298.435C462.768 298.435 459.465 290.007 456.763 285.793H451.96C449.258 290.007 445.956 298.435 454.362 298.435Z" class="petal"/>
            <path d="M468.391 289.665C472.596 282.383 464.095 281.289 459.319 281.653L456.917 285.814C458.99 290.132 464.187 296.947 468.391 289.665Z" class="petal"/>
            <path d="M468.392 273.523C464.187 266.241 458.99 273.056 456.917 277.373L459.32 281.535C464.095 281.898 472.596 280.805 468.392 273.523Z" class="petal"/>
            <path d="M459.867 282C459.867 284.841 457.428 287.189 454.362 287.189C451.296 287.189 448.857 284.841 448.857 282C448.857 279.159 451.296 276.811 454.362 276.811C457.428 276.811 459.867 279.159 459.867 282Z" fill="white" stroke="#454545" stroke-width="2"/>
          </g>

          <g id="burst2" class="magic-icon-petalbursts">
            <path d="M405.919 258.928C410.268 266.46 415.643 259.411 417.788 254.945L415.303 250.641C410.363 250.265 401.57 251.396 405.919 258.928Z" class="petal"/>
            <path d="M405.919 242.231C401.571 249.764 410.363 250.895 415.303 250.519L417.788 246.214C415.644 241.748 410.268 234.699 405.919 242.231Z" class="petal"/>
            <path d="M420.361 234C411.666 234 415.082 242.282 417.877 246.423H422.845C425.64 242.282 429.056 234 420.361 234Z" class="petal"/>
            <path d="M420.361 268C429.056 268 425.64 259.282 422.845 254.923H417.877C415.082 259.282 411.666 268 420.361 268Z" class="petal"/>
            <path d="M434.872 258.928C439.221 251.396 430.428 250.265 425.489 250.641L423.003 254.945C425.148 259.411 430.523 266.46 434.872 258.928Z" class="petal"/>
            <path d="M434.873 242.232C430.524 234.699 425.148 241.748 423.004 246.215L425.489 250.519C430.429 250.895 439.221 249.764 434.873 242.232Z" class="petal"/>
            <path d="M405.919 258.928C410.268 266.46 415.643 259.411 417.788 254.945L415.303 250.641C410.363 250.265 401.57 251.396 405.919 258.928Z" class="petal"/>
            <path d="M405.919 242.231C401.571 249.764 410.363 250.895 415.303 250.519L417.788 246.214C415.644 241.748 410.268 234.699 405.919 242.231Z" class="petal"/>
            <path d="M420.361 234C411.666 234 415.082 242.282 417.877 246.423H422.845C425.64 242.282 429.056 234 420.361 234Z" class="petal"/>
            <path d="M420.361 268C429.056 268 425.64 259.282 422.845 254.923H417.877C415.082 259.282 411.666 268 420.361 268Z" class="petal"/>
            <path d="M434.872 258.928C439.221 251.396 430.428 250.265 425.489 250.641L423.003 254.945C425.148 259.411 430.523 266.46 434.872 258.928Z" class="petal"/>
            <path d="M434.873 242.232C430.524 234.699 425.148 241.748 423.004 246.215L425.489 250.519C430.429 250.895 439.221 249.764 434.873 242.232Z" class="petal"/>
          </g>

          <g class="magic-icon-flowers">
            <path d="M405.919 258.928C410.268 266.46 415.643 259.411 417.788 254.945L415.303 250.641C410.363 250.265 401.57 251.396 405.919 258.928Z" class="petal"/>
            <path d="M405.919 242.231C401.571 249.764 410.363 250.895 415.303 250.519L417.788 246.214C415.644 241.748 410.268 234.699 405.919 242.231Z" class="petal"/>
            <path d="M420.361 234C411.666 234 415.082 242.282 417.877 246.423H422.845C425.64 242.282 429.056 234 420.361 234Z" class="petal"/>
            <path d="M420.361 268C429.056 268 425.64 259.282 422.845 254.923H417.877C415.082 259.282 411.666 268 420.361 268Z" class="petal"/>
            <path d="M434.872 258.928C439.221 251.396 430.428 250.265 425.489 250.641L423.003 254.945C425.148 259.411 430.523 266.46 434.872 258.928Z" class="petal"/>
            <path d="M434.873 242.232C430.524 234.699 425.148 241.748 423.004 246.215L425.489 250.519C430.429 250.895 439.221 249.764 434.873 242.232Z" class="petal"/>
            <path d="M426.072 251C426.072 253.949 423.541 256.384 420.361 256.384C417.181 256.384 414.649 253.949 414.649 251C414.649 248.051 417.181 245.615 420.361 245.615C423.541 245.615 426.072 248.051 426.072 251Z" fill="white" stroke="#454545" stroke-width="2"/>
          </g>

          <g id="burst3" class="magic-icon-petalbursts">
            <path d="M434.512 260.793C439.885 270.098 446.525 261.39 449.174 255.873L446.104 250.556C440.002 250.092 429.14 251.489 434.512 260.793Z" class="petal"/>
            <path d="M434.513 240.168C429.141 249.473 440.002 250.87 446.104 250.405L449.174 245.088C446.525 239.571 439.885 230.864 434.513 240.168Z" class="petal"/>
            <path d="M452.353 230C441.612 230 445.832 240.231 449.284 245.346H455.421C458.874 240.231 463.093 230 452.353 230Z" class="petal"/>
            <path d="M452.352 272C463.093 272 458.874 261.231 455.421 255.846H449.284C445.831 261.231 441.612 272 452.352 272Z" class="petal"/>
            <path d="M470.278 260.793C475.65 251.489 464.789 250.092 458.687 250.557L455.617 255.873C458.266 261.39 464.906 270.098 470.278 260.793Z" class="petal"/>
            <path d="M470.279 240.168C464.906 230.864 458.266 239.572 455.617 245.088L458.687 250.405C464.789 250.87 475.651 249.473 470.279 240.168Z" class="petal"/>
            <path d="M434.512 260.793C439.885 270.098 446.525 261.39 449.174 255.873L446.104 250.556C440.002 250.092 429.14 251.489 434.512 260.793Z" class="petal"/>
            <path d="M434.513 240.168C429.141 249.473 440.002 250.87 446.104 250.405L449.174 245.088C446.525 239.571 439.885 230.864 434.513 240.168Z" class="petal"/>
            <path d="M452.353 230C441.612 230 445.832 240.231 449.284 245.346H455.421C458.874 240.231 463.093 230 452.353 230Z" class="petal"/>
            <path d="M452.352 272C463.093 272 458.874 261.231 455.421 255.846H449.284C445.831 261.231 441.612 272 452.352 272Z" class="petal"/>
            <path d="M470.278 260.793C475.65 251.489 464.789 250.092 458.687 250.557L455.617 255.873C458.266 261.39 464.906 270.098 470.278 260.793Z" class="petal"/>
            <path d="M470.279 240.168C464.906 230.864 458.266 239.572 455.617 245.088L458.687 250.405C464.789 250.87 475.651 249.473 470.279 240.168Z" class="petal"/>
          </g>

          <g class="magic-icon-flowers">
            <path d="M434.512 260.793C439.885 270.098 446.525 261.39 449.174 255.873L446.104 250.556C440.002 250.092 429.14 251.489 434.512 260.793Z" class="petal"/>
            <path d="M434.513 240.168C429.141 249.473 440.002 250.87 446.104 250.405L449.174 245.088C446.525 239.571 439.885 230.864 434.513 240.168Z" class="petal"/>
            <path d="M452.353 230C441.612 230 445.832 240.231 449.284 245.346H455.421C458.874 240.231 463.093 230 452.353 230Z" class="petal"/>
            <path d="M452.352 272C463.093 272 458.874 261.231 455.421 255.846H449.284C445.831 261.231 441.612 272 452.352 272Z" class="petal"/>
            <path d="M470.278 260.793C475.65 251.489 464.789 250.092 458.687 250.557L455.617 255.873C458.266 261.39 464.906 270.098 470.278 260.793Z" class="petal"/>
            <path d="M470.279 240.168C464.906 230.864 458.266 239.572 455.617 245.088L458.687 250.405C464.789 250.87 475.651 249.473 470.279 240.168Z" class="petal"/>
            <path d="M459.526 251C459.526 254.713 456.34 257.769 452.353 257.769C448.365 257.769 445.18 254.713 445.18 251C445.18 247.287 448.365 244.231 452.353 244.231C456.34 244.231 459.526 247.287 459.526 251Z" fill="white" stroke="#454545" stroke-width="2"/>
          </g>
        </g>
        <g id="magic-word" fill="#454545">
          <path d="M389.75 372.46c.12.39.18.89.18 1.51a109.03 109.03 0 00-8 0c0-.48.07-.98.19-1.5a3.4 3.4 0 001.62-.44c.28-.24.43-.68.43-1.33 0-.17-.05-.69-.15-1.55l-1.11-8.57-6.41 12.85c-.38.15-.85.22-1.4.22l-6.66-13-1.01 7.6c-.07.65-.11 1.2-.11 1.65 0 .94.16 1.59.47 1.95.33.36.9.56 1.69.61.12.39.18.89.18 1.51a74.61 74.61 0 00-6.66 0c0-.62.06-1.12.18-1.5a2.5 2.5 0 001.33-.44c.34-.24.59-.65.76-1.22.19-.6.35-1.48.47-2.63l1-7.92c.03-.17.04-.41.04-.72 0-.82-.17-1.37-.5-1.66-.32-.29-.87-.43-1.66-.43a6.16 6.16 0 01-.18-1.62 50.06 50.06 0 005.22 0l7.02 13.5 6.66-13.5c1.06.05 1.96.07 2.7.07.58 0 1.44-.02 2.6-.07 0 .7-.07 1.24-.19 1.62-.72 0-1.26.17-1.62.5-.36.31-.54.86-.54 1.62 0 .31.01.57.04.76l1.11 8.5c.15 1.03.3 1.78.44 2.26.16.48.38.82.64 1.01.3.2.7.31 1.23.36zM413.02 372.35c.12.36.18.9.18 1.62-.96-.05-2.2-.07-3.71-.07-1.58 0-2.86.03-3.82.07 0-.74.08-1.28.22-1.62.55-.07.94-.17 1.15-.29a.68.68 0 00.36-.6c0-.22-.12-.6-.36-1.12l-.72-1.55c-3.45 0-6.18.06-8.17.18l-.4.93c-.24.56-.36.99-.36 1.3 0 .67.5 1.06 1.48 1.15.14.44.22.97.22 1.62a57.14 57.14 0 00-5.55 0c0-.57.07-1.11.22-1.62.53-.1.93-.3 1.22-.65.29-.35.67-1.06 1.15-2.12l6.2-13.71c.45-.1.93-.15 1.44-.15l6.62 13.75c.53 1.1.97 1.85 1.33 2.23.39.39.82.6 1.3.65zm-7.42-5.04l-2.16-4.53a24.4 24.4 0 01-1.3-3.03c-.19.6-.43 1.2-.71 1.8l-.5 1.08-2.06 4.68h6.73zM426.56 374.15c-2.06 0-3.89-.4-5.47-1.19a9.04 9.04 0 01-3.7-3.3 9.4 9.4 0 01-1.3-4.94 7.8 7.8 0 011.54-4.9 9.57 9.57 0 014.07-3.1c1.68-.69 3.48-1.04 5.4-1.04 1.47 0 2.86.13 4.18.37 1.34.21 2.47.52 3.38.93-.21.91-.32 2.3-.32 4.14-.43.2-1.05.29-1.84.29-.07-1.51-.56-2.58-1.47-3.2a6.47 6.47 0 00-3.71-.94c-1.66 0-3.06.31-4.21.94a6.07 6.07 0 00-2.52 2.52 7.06 7.06 0 00-.83 3.38c0 2.45.63 4.44 1.9 5.97 1.3 1.54 3.14 2.3 5.51 2.3.75 0 1.32 0 1.73-.03.41-.02.83-.1 1.26-.21.39-.1.66-.28.83-.54.17-.3.25-.76.25-1.4v-1.12c0-.7-.06-1.2-.18-1.48a.99.99 0 00-.72-.61c-.36-.12-.95-.2-1.76-.22a5.33 5.33 0 01-.22-1.65c.55.05 1.86.07 3.93.07 2.04 0 3.3-.02 3.78-.07 0 .67-.06 1.22-.18 1.65-.46.03-.78.1-.98.22-.19.1-.32.29-.4.57-.06.27-.1.7-.1 1.3v.9c0 .55.02 1 .07 1.33.07.31.2.65.36 1.01a12.5 12.5 0 01-3.6 1.51c-1.41.36-2.97.54-4.68.54zM441.87 373.97c0-.74.06-1.28.18-1.62.6-.05 1.05-.14 1.33-.29.32-.14.53-.4.65-.75.12-.36.18-.9.18-1.62v-9.61c0-.7-.06-1.23-.18-1.59a1.2 1.2 0 00-.64-.75 3.81 3.81 0 00-1.34-.3c-.12-.35-.18-.9-.18-1.61a131.1 131.1 0 008 0 6.5 6.5 0 01-.15 1.62c-.86.05-1.45.24-1.76.57-.3.34-.44 1.03-.44 2.06v9.6c0 1.04.15 1.74.44 2.1.3.33.9.53 1.76.57.1.36.14.9.14 1.62a126.15 126.15 0 00-8 0zM472.22 357.05c-.24.91-.36 2.28-.36 4.1-.45.22-1.05.33-1.8.33-.07-1.56-.5-2.65-1.3-3.28-.76-.64-1.88-.97-3.34-.97-2.4 0-4.2.66-5.4 1.98a6.96 6.96 0 00-1.8 4.86c0 1.51.31 2.88.93 4.1a7.25 7.25 0 002.74 2.85c1.2.7 2.62 1.05 4.25 1.05a12.84 12.84 0 005.87-1.33c.14.11.27.3.4.53.11.22.18.42.2.62a20.14 20.14 0 01-3.8 1.72c-1.2.36-2.56.54-4.08.54-1.96 0-3.72-.4-5.25-1.19a8.9 8.9 0 01-4.9-8.17c0-1.94.5-3.6 1.48-4.97a9.08 9.08 0 013.89-3.13c1.63-.7 3.38-1.04 5.25-1.04a19.33 19.33 0 017.02 1.4z"/>
        </g>
      </g>
<!-- end magic icon -->

<!-- develop icon -->
      <g id="develop-set">
        <g id="develop-icon">
          <path id="develop-icon-slash" d="M639.477 513.119L625.597 545.97" stroke="#454545" stroke-width="2"/>
          <rect id="develop-icon-screenbox" x="596.06" y="497" width="73.8806" height="60" rx="4" stroke="#454545" stroke-width="2"/>
          <line id="develop-icon-menuline" x1="595.06" y1="505.179" x2="670.94" y2="505.179" stroke="#454545" stroke-width="2"/>
          <circle id="develop-icon-dot1" cx="601.075" cy="501.089" r="1.38806" fill="#454545"/>
          <circle id="develop-icon-dot2" cx="606.627" cy="501.089" r="1.38806" fill="#454545"/>
          <circle id="develop-icon-dot3" cx="612.179" cy="501.089" r="1.38806" fill="#454545"/>
          <path id="develop-icon-open-bracket" d="M617.731 517.746L606.164 529.314L617.731 540.881" stroke="#454545" stroke-width="2"/>
          <path id="develop-icon-close-bracket" d="M645.955 540.881L657.522 529.313L645.955 517.746" stroke="#454545" stroke-width="2"/>
        </g>
        <g id="develop-word" fill="#454545">
          <path d="M557.5 602c0-.7 0-1.2.2-1.5l1.3-.3c.3-.2.5-.4.6-.8.2-.4.3-1 .3-1.8v-9.4c0-.7-.1-1.2-.3-1.6 0-.4-.3-.6-.6-.8l-1.3-.3a7 7 0 01-.2-1.6 131.8 131.8 0 006.5 0h1.9c3.4 0 6.3.6 8.5 1.9 2.3 1.2 3.4 3.4 3.4 6.7 0 3.8-1.3 6.3-3.8 7.6a18 18 0 01-8.2 1.9h-8.3zm8.5-1.6c1.7 0 3.2-.2 4.3-.6a5.3 5.3 0 002.9-2.2c.7-1.1 1-2.6 1-4.6 0-2.7-.8-4.6-2.5-5.8a10.7 10.7 0 00-6.3-1.7c-1 0-1.7 0-2.2.2v11.9c0 .7 0 1.3.2 1.7.1.4.4.7.8.9l1.8.2zM597.2 596.9a3 3 0 011.6.8c-.4 1.1-.7 2.6-1 4.3h-15.3l.2-1.5 1.4-.3c.3-.2.5-.4.6-.8l.2-1.8v-9.4c0-.7 0-1.2-.2-1.6-.2-.4-.4-.6-.7-.8l-1.3-.3-.2-1.6a204.6 204.6 0 0014.6 0c.2 2.3.4 3.8.6 4.5a3 3 0 01-1.6.4c0-1-.5-1.8-1.2-2.4-.8-.6-2-.9-3.9-.9h-2.8v6.7h1.8c1.3 0 2.1-.2 2.6-.5.5-.2.8-.8.8-1.5.5-.2 1.1-.3 1.7-.3a43.4 43.4 0 000 6.2c-.7 0-1.2-.1-1.6-.3 0-.7-.4-1.3-.9-1.6-.5-.3-1.3-.4-2.6-.4h-1.8v3.8c0 .7 0 1.3.2 1.7.2.4.5.7.8.9l1.8.2h.3a11 11 0 003.2-.4c.7-.2 1.3-.6 1.7-1 .3-.5.7-1.2 1-2.1zM619.7 584h3.2l-.1 1.5c-1 .1-1.9 1.1-2.7 3a297 297 0 01-6.6 13.5c-.4.2-.8.2-1.4.2a326.4 326.4 0 00-7.7-15.6c-.2-.4-.5-.6-.7-.8-.2-.2-.5-.3-.9-.3a5 5 0 01-.2-1.6 96.3 96.3 0 008 0c0 .6 0 1.1-.2 1.6-.6 0-1 .1-1.4.3-.3.1-.4.3-.4.7 0 .4.2 1 .7 1.9 1.6 3 3.1 6.1 4.5 9.2 2-3.9 3.4-6.9 4.4-9.1.3-.6.4-1.2.4-1.7 0-.8-.5-1.2-1.5-1.3a5 5 0 01-.2-1.6l2.8.1zM642 596.9a3 3 0 011.6.8c-.5 1.1-.8 2.6-1 4.3h-15.3c0-.7 0-1.2.2-1.5l1.3-.3c.3-.2.5-.4.7-.8l.1-1.8v-9.4c0-.7 0-1.2-.2-1.6-.1-.4-.3-.6-.6-.8l-1.3-.3-.2-1.6a204.6 204.6 0 0014.5 0l.7 4.5a3 3 0 01-1.6.4c-.1-1-.5-1.8-1.3-2.4-.7-.6-2-.9-3.8-.9H633v6.7h1.8c1.2 0 2.1-.2 2.6-.5.5-.2.7-.8.8-1.5.5-.2 1-.3 1.6-.3a43.4 43.4 0 000 6.2c-.6 0-1.1-.1-1.6-.3 0-.7-.3-1.3-.8-1.6-.5-.3-1.4-.4-2.6-.4H633v3.8c0 .7 0 1.3.2 1.7.1.4.4.7.8.9l1.8.2h.2a11 11 0 003.2-.4c.8-.2 1.3-.6 1.7-1 .4-.5.8-1.2 1-2.1zM657.2 600.4c1.1 0 2-.1 2.7-.3.6-.3 1.2-.6 1.6-1.1.4-.5.8-1.2 1.1-2.1a3 3 0 011.6.8c-.4 1.1-.8 2.6-1 4.3H648.5c0-.7 0-1.2.2-1.5l1.3-.3c.3-.2.5-.4.7-.8l.2-1.8v-9.4l-.2-1.6c-.2-.4-.4-.6-.7-.8l-1.3-.3a7 7 0 01-.2-1.6 154.4 154.4 0 008 0c0 .7 0 1.3-.2 1.6-.8.1-1.4.3-1.7.7-.3.3-.4 1-.4 2v9.4c0 .7 0 1.3.2 1.7.1.4.4.7.8.9l1.8.2h.2zM678 602.3c-2 0-3.8-.4-5.4-1.1a8.9 8.9 0 01-3.7-3.3 9 9 0 01-1.3-4.8c0-1.9.4-3.5 1.3-4.9a8.8 8.8 0 013.7-3.3c1.6-.8 3.5-1.2 5.6-1.2 2 0 3.8.4 5.4 1.2a8.8 8.8 0 015 8.1 8.8 8.8 0 01-5 8.2c-1.6.7-3.4 1.1-5.5 1.1zm.6-1.6c2 0 3.5-.7 4.6-2 1.1-1.3 1.7-3 1.7-5.2a9 9 0 00-1-4.1 7 7 0 00-6.3-4c-2 0-3.5.7-4.6 2a7.6 7.6 0 00-1.7 5.1c0 1.6.3 3 1 4.3a7 7 0 006.3 3.9zM701.5 594c1.2 0 2.3-.2 3-.9.9-.6 1.3-1.6 1.3-3s-.5-2.5-1.3-3.3c-.9-.8-2.2-1.2-4-1.2-.4 0-.9 0-1.5.2v11.6c0 1.1.2 1.9.7 2.3.4.5 1.1.7 2.2.8l.2 1.6a117 117 0 00-8.7 0l.1-1.6c.9-.1 1.4-.3 1.7-.6.3-.4.5-1 .5-2.1v-9.6c0-.7 0-1.2-.2-1.6-.1-.4-.3-.6-.6-.8l-1.4-.3-.1-1.6 4.4.1h4.3c2.5 0 4.3.4 5.4 1.5a5 5 0 011.8 4c0 1-.3 2.1-.9 3.1a6 6 0 01-2.4 2.3c-1.1.6-2.4.9-4 .9-.9 0-1.6-.1-2.2-.3v-.7-.8h1.7z"/>
        </g>
      </g>
<!-- end develop icon -->

      <g id="animate-set">
        <g id="icon animate-icon">
          <path id="animate-icon-ghost1" d="M203 512C195.374 515.139 190 522.688 190 531.5C190 540.312 195.374 547.861 203 551" stroke="#454545" stroke-width="2" stroke-linecap="round"/>
          <path id="animate-icon-ghost2" d="M197 512C189.374 515.139 184 522.688 184 531.5C184 540.312 189.374 547.861 197 551" stroke="#454545" stroke-width="2" stroke-linecap="round"/>
          <path id="animate-icon-circle" d="M240 531C240 543.171 230.354 553 218.5 553C206.646 553 197 543.171 197 531C197 518.829 206.646 509 218.5 509C230.354 509 240 518.829 240 531Z" fill="white" stroke="#454545" stroke-width="2" />
          <g>
            <path class="animate-icon-line" d="M180 532L161 532" stroke="#454545" stroke-width="2" stroke-linecap="round"/>
            <path class="animate-icon-line" d="M181 525L168 525" stroke="#454545" stroke-width="2" stroke-linecap="round"/>
            <path class="animate-icon-line" d="M181 540L171 540" stroke="#454545" stroke-width="2" stroke-linecap="round"/>
          </g>
        </g>
          <g id="animate-word" fill="#454545">
            <path d="M145.7 599.5l.2 1.6a77.1 77.1 0 00-7.6 0c0-.8.1-1.3.3-1.6l1.1-.3c.2-.2.4-.4.4-.6l-.4-1.2-.7-1.5c-3.5 0-6.2 0-8.2.2l-.4.9-.3 1.3c0 .7.4 1 1.4 1.2.2.4.2 1 .2 1.6a57.1 57.1 0 00-5.5 0c0-.6 0-1.1.2-1.6a2 2 0 001.2-.7c.3-.4.7-1 1.2-2.1L135 583a7 7 0 011.4-.2l6.7 13.8 1.3 2.2c.4.4.8.6 1.3.7zm-7.4-5l-2.2-4.6-1.3-3a14 14 0 01-1.2 2.8l-2 4.7h6.7zM167.7 583h3c0 .6 0 1.2-.2 1.5l-1.1.4c-.3.3-.5.6-.6 1.2l-.1 2.2V601c-.3.2-.8.3-1.5.3l-13-14.3v8.6c0 1 .1 1.8.3 2.3.1.6.3 1 .6 1.2l1.4.4.2 1.6a89.7 89.7 0 00-6.5 0c0-.7 0-1.3.2-1.6.6-.1 1-.2 1.3-.4.3-.3.5-.6.7-1.2l.2-2.3v-10.5l-.7-.4a9 9 0 00-1.5-.2l-.2-1.6a45.5 45.5 0 004.8 0l12 13.5v-8c0-1 0-1.8-.2-2.3-.2-.6-.4-1-.7-1.2-.3-.2-.8-.3-1.4-.4l-.1-1.6 3 .1zM176.2 601l.1-1.5 1.4-.3c.3-.2.5-.4.6-.8l.2-1.6v-9.6c0-.7 0-1.2-.2-1.6-.1-.4-.3-.6-.6-.8l-1.4-.3-.1-1.6a131.1 131.1 0 008 0l-.2 1.6c-.9.1-1.5.3-1.8.6-.3.4-.4 1-.4 2v9.7c0 1 .1 1.7.4 2 .3.4 1 .6 1.8.7l.1 1.6a140.7 140.7 0 00-8 0zM215.6 599.6l.2 1.5a109 109 0 00-8 0c0-.5 0-1 .2-1.5.8-.1 1.3-.3 1.6-.5.3-.2.4-.7.4-1.3l-.1-1.6-1.1-8.5-6.4 12.8a4 4 0 01-1.4.2l-6.7-13-1 7.6-.1 1.7c0 1 .1 1.6.4 2 .4.3 1 .5 1.7.6.2.3.2.8.2 1.5a93.7 93.7 0 00-6.6 0l.1-1.5a2.2 2.2 0 002-1.7c.3-.6.5-1.5.6-2.6l1-8v-.7c0-.8-.1-1.3-.5-1.6-.3-.3-.8-.5-1.6-.5l-.2-1.6a50 50 0 005.2 0l7 13.5 6.7-13.5a60.8 60.8 0 005.3 0c0 .7 0 1.3-.2 1.6-.7 0-1.2.2-1.6.6-.4.3-.5.8-.5 1.6v.7l1.1 8.5.4 2.3c.2.5.4.8.7 1l1.2.4zM238.9 599.5l.2 1.6a77.1 77.1 0 00-7.6 0c0-.8.1-1.3.3-1.6l1.1-.3c.2-.2.4-.4.4-.6l-.4-1.2-.7-1.5c-3.5 0-6.2 0-8.2.2l-.4.9-.3 1.3c0 .7.4 1 1.4 1.2.2.4.2 1 .2 1.6a57.1 57.1 0 00-5.5 0c0-.6 0-1.1.2-1.6a2 2 0 001.2-.7c.3-.4.7-1 1.2-2.1l6.2-13.7a7 7 0 011.4-.2l6.7 13.8 1.3 2.2c.4.4.8.6 1.3.7zm-7.4-5l-2.2-4.6-1.3-3a14 14 0 01-1.2 2.8l-2 4.7h6.7zM258.3 583c0 1.2 0 2.8.3 4.6-.6.2-1.1.3-1.8.3 0-1.1-.4-2-1-2.5-.5-.6-1.4-.9-2.6-.9h-1.6V597l.2 1.7.7.7 1.7.3.1 1.5a167.6 167.6 0 00-8.8 0c0-.7 0-1.3.2-1.5.7 0 1.3-.2 1.6-.3.4-.2.7-.4.8-.8.2-.3.2-.9.2-1.6v-12.4H247a5 5 0 00-2.3.4c-.5.3-.9.6-1.1 1l-.6 2c-.8 0-1.3 0-1.7-.3.4-1.6.5-3.2.5-4.7a282.6 282.6 0 0016.6 0zM277.6 595.9a3 3 0 011.6.8c-.4 1.1-.7 2.6-1 4.3H263l.1-1.5 1.4-.3c.3-.2.5-.4.6-.8l.2-1.8v-9.4c0-.7 0-1.2-.2-1.6-.1-.4-.4-.6-.7-.8l-1.3-.3-.1-1.6a204.6 204.6 0 0014.5 0c.2 2.3.5 3.8.6 4.5a3 3 0 01-1.6.4c0-1-.5-1.8-1.2-2.4-.8-.6-2-.9-3.9-.9h-2.8v6.7h1.8c1.3 0 2.2-.2 2.6-.5.5-.2.8-.8.8-1.5.6-.2 1.1-.3 1.7-.3a43.4 43.4 0 000 6.2c-.7 0-1.2-.1-1.6-.3 0-.7-.4-1.3-.9-1.6-.4-.3-1.3-.4-2.6-.4h-1.8v3.8c0 .7 0 1.3.2 1.7.2.4.5.7.8.9l1.8.2h.3a11 11 0 003.2-.4c.7-.2 1.3-.6 1.7-1 .3-.5.7-1.2 1-2.1z"/>
        </g>
      </g>
    </g>
  </svg>
  <div class="figcapbox">
    <p class="figcap"><span>figure 1:</span> finding magic in the middle</p>
  </div>
</section>

<style>
  section {
    /* margin-top: -17vh; */
    width: 100%;
    max-width: initial;
    
  }

  svg {
    height: auto;
    width: 96vw;
    max-height: 100vh;
    background-size: 30px 30px;
    background-image: radial-gradient(circle, var(--gray) 1px, rgba(0, 0, 0, 0) 0px);
    background-attachment: fixed;
    backface-visibility: hidden;

  }

  .figcapbox {
    position: relative;
    top: -100px;
    left: 30%;
    display: inline-block;
  }

  .figcap {
    font-style: italic;
    padding: .5rem 1rem;
    background-color: white;
    border-radius: 20px;
    border: var(--border);
  }

  :global(.orngLine) {
    /* transition: opacity .1s var(--timing);
    opacity: 1; */
    stroke: var(--acct);
  }

  .petal {
    fill: var(--acct);
    stroke: var(--gray);
    stroke-width: 2;
  }

  @media (max-width: 900px) {
    section {
      margin-left: -1em;
    }
  }
</style>