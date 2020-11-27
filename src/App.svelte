<script>
import Header from "./componenets/header.svelte";
import ProjectSection from "./componenets/projectSection.svelte";
import Hero from "./componenets/hero.svelte";
import VennAnimation from "./componenets/vennAnimation.svelte";
import Footer from "./componenets/footer.svelte";

import Button from "./componenets/button.svelte";

// const { projects } = content;
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Vollkorn+SC:wght@600&family=Vollkorn:wght@400;600&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="https://use.typekit.net/plt5xkx.css">
</svelte:head>

<Header />

<main>
	<Hero />
	<VennAnimation />
	<h2>
		My curiousity and appetite for learning new skills have left me with a versatile set of skills fit for use in solving modern communication problems.
	</h2>
	<h2>
		Check out some of my work!
	</h2>

	<ProjectSection />
	<!-- <Button info={{href: "http://www.google.com", txt: "Butts"}} /> -->

<!-- <ProjectSection projects /> -->

</main>
<Footer />


<style>
	main {
		text-align: center;
		/* padding: 1em; */
		margin: auto;
	}

	h2 {
		margin-left: auto;
		margin-right: auto;
		max-width: 1000px;
	}
</style>