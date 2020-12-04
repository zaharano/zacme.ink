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
		<!-- old text -->
		<!-- My formal background is in design, but I've been using code to make visuals since scripting geometric plotting on a TI-83 calculator when I was 10. I have a love of side projects, a willingness to take on new challenges, and an appetite for learning new tools and techniques. This makeup has left me with a very versatile set of skills. I enjoy playing with the intersections of these skills to find delightful new ways to communicate. -->
		Finding joy there in the insections.
	</h2>
	<h1>
		Projects
	</h1>
	<ProjectSection />
	<section id="contact">
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

	h2 {
		margin-left: auto;
		margin-right: auto;
		max-width: 1000px;
	}

	.buttonContainer {
		max-width: 20rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#contact {
		margin-top: 5rem;
		margin-bottom: 5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>