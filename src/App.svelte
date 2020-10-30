<script>
import Header from "./componenets/header.svelte";
import ProjectSection from "./componenets/projectSection.svelte";
import SpeechAnimation from "./componenets/speechAnimation.svelte";
import VennAnimation from "./componenets/vennAnimation.svelte";

// const { projects } = content;
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Vollkorn+SC:wght@600&family=Vollkorn:wght@400;600&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="https://use.typekit.net/plt5xkx.css">
	<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.5.1/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.5.1/ScrollTrigger.min.js"></script>
</svelte:head>

<Header />

<main>
	<SpeechAnimation msg="Hi!"/>
	<h1>My name is Zach. I’m an integrative designer, animator and front-end developer.</h1>
	<VennAnimation />
	<h2>
		My curiousity and appetite for learning new tricks have left me with a versatile set of skills fit for use in solving modern communication problems.
	</h2>
	<h2>
		Check out some of my work!
	</h2>
</main>

<!-- <VennAnimation /> -->



<!-- <ProjectSection projects /> -->

<!-- <Footer /> -->

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 1000px;
		margin: 6rem auto;
	}
</style>