<script>
import Header from "./componenets/header.svelte";
import Footer from "./componenets/footer.svelte";

import Hero from "./sections/hero.svelte";
import ProjectSection from "./sections/projectSection.svelte";
import ContactSection from "./sections/contactSection.svelte";
import FigSection from "./sections/figSection.svelte";
import AboutSection from "./sections/aboutSection.svelte";

import FocusVisible from "focus-visible"

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// make a switch to allow changing this
// implement store subscribed to by components that include motion
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Vollkorn+SC:wght@600&family=Vollkorn:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="https://use.typekit.net/plt5xkx.css">
</svelte:head>

<Header  />
<main id="main">
	<Hero />
	<FigSection />
	<ProjectSection />
	<AboutSection />
	<ContactSection />
</main>
<Footer />

<style>
	main {
		text-align: center;
		margin: auto;
	}

	:global(section) {
		width: var(--pagewidth);
		max-width: 1400px;
		margin-left: auto;
		margin-right: auto;
		padding-left: 1em;
		padding-right: 1em;
		margin-top: 13vh;
	}
</style>