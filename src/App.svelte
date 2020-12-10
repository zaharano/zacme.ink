<script>
import Header from "./componenets/header.svelte";
import Hero from "./componenets/hero.svelte";
import VennAnimation from "./componenets/vennAnimation.svelte";
import ProjectSection from "./componenets/projectSection.svelte";
import Footer from "./componenets/footer.svelte";
import Button from "./componenets/button.svelte";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// make a switch to allow changing this
// implement prop in all components that include motion
// const { projects } = content;
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Vollkorn+SC:wght@600&family=Vollkorn:wght@400;600&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="https://use.typekit.net/plt5xkx.css">
</svelte:head>

<Header  />

<main id="main">
	<Hero />
	<VennAnimation />
	<section id="bio">
		<h2>
			I have a very versatile toolbox collected from a decade of varied experiences and a love of side projects. I enjoy playing with the intersections of these tools to find delightful new ways to communicate.
		</h2>
		<h2>Here's a bunch of words I know things about:</h2>
	</section>
	<ProjectSection />
	<section id="contact">
		<h1>Contact Me</h1>
		<h2>
			I'm always interested in hearing about new work!
		</h2>
		<div class="buttonContainer">
			<Button txt="get in touch!" href="mailto:z@zaharano.com" />
		</div>
	</section>
</main>
<Footer />

<style>
	main {
		text-align: center;
		padding: 1em;
		margin: auto;
	}

	:global(section) {
		width: var(--pagewidth);
		max-width: 1400px;
		margin-left: auto;
		margin-right: auto;
	}

	.buttonContainer {
		max-width: 20rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#contact {
		margin-top: 5rem;
		margin-bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>