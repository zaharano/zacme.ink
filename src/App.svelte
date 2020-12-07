<script>
import Header from "./componenets/header.svelte";
import Hero from "./componenets/hero.svelte";
import VennAnimation from "./componenets/vennAnimation.svelte";
import ProjectSection from "./componenets/projectSection.svelte";
import Footer from "./componenets/footer.svelte";
import Button from "./componenets/button.svelte";

// const { projects } = content;
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Vollkorn+SC:wght@600&family=Vollkorn:wght@400;600&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="https://use.typekit.net/plt5xkx.css">
</svelte:head>

<Header />

<main id="main">
	<Hero />
	<VennAnimation />
	<section id="bio">
		<h2>
			I have more than 10 years experience working in brand, interactive, and editorial design for a variety of clients. Add a love of side projects, a willingness to take on new challenges, and an appetite for learning new tools and techniques. The result is a very versatile set of skills. I enjoy playing with the intersections of these skills to find delightful new ways to communicate.
		</h2>
		<h2>Here's a bunch of words I know things about:</h2>
	</section>
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
	}

	section {
		max-width: var(--pagewidth);
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