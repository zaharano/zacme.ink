<script>
import Header from "./componenets/header.svelte";
import ProjectSection from "./componenets/projectSection.svelte";
import SpeechAnimation from "./componenets/speechAnimation.svelte";
import TextAnimation from "./componenets/textAnimation.svelte";
import VennAnimation from "./componenets/vennAnimation.svelte";
import Button from "./componenets/button.svelte";

// const { projects } = content;
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Vollkorn+SC:wght@600&family=Vollkorn:wght@400;600&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="https://use.typekit.net/plt5xkx.css">
</svelte:head>

<Header />

<main>
	<section class="hero">
		<SpeechAnimation msg="Hi!"/>
		<TextAnimation />
	</section>
	<VennAnimation />
	<h2>
		My curiousity and appetite for learning new tricks have left me with a versatile set of skills fit for use in solving modern communication problems.
	</h2>
	<h2>
		Check out some of my work!
	</h2>

	<ProjectSection />
	<!-- <Button info={{href: "http://www.google.com", txt: "Butts"}} /> -->

<!-- <ProjectSection projects /> -->

<!-- <Footer /> -->
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 1400px;
		margin: auto;
	}

	.hero {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>