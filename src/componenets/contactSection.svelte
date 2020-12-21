<script>
  import Button from "./button.svelte"
</script>

<section id="contact">
  <h1>Contact Me</h1>
  <h2>
    I'm always interested in hearing about new work!
  </h2>
  <div class="buttonContainer">
    <Button txt="get in touch!" href="mailto:z@zaharano.com" />
  </div>
</section>

<style>
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
		flex-direction: column;
		align-items: center;
    justify-content: center;
    height: calc(100vh - 150px);
	}
</style>