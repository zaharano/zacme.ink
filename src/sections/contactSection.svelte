<script>
  import Button from "../componenets/button.svelte";
  import SectionHead from "../componenets/sectionHead.svelte";
</script>

<section>
  <SectionHead id="contact" text="Contact Me" />
  <h2>I'm always interested in hearing about new work!</h2>
  <div class="buttonContainer">
    <Button txt="get in touch!" href="mailto:hey@zacme.ink" />
  </div>
</section>

<style>
  .buttonContainer {
    max-width: 20rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  section {
    margin-top: 0;
    margin-bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 150px);
  }
</style>
