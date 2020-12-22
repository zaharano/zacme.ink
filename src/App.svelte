<script>
import Header from "./componenets/header.svelte";
import Hero from "./componenets/hero.svelte";
import ProjectSection from "./componenets/projectSection.svelte";
import ContactSection from "./componenets/contactSection.svelte";
import Footer from "./componenets/footer.svelte";
import FigSection from "./componenets/figSection.svelte";
import FocusVisible from "focus-visible"

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// make a switch to allow changing this
// implement store in all components that include motion
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
	}
</style>