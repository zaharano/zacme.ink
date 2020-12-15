<script>
  import VennAnimation from './vennAnimation.svelte';
  import AbilityAnimation from './abilityAnimation.svelte';
</script>

<section>
  <div class="figrow">
    <p>
      I have a versatile toolbox assembled from a decade of varied work and a love of side projects.
    </p>
    <div class="fig">
      <AbilityAnimation />
    </div>
  </div>

  <div class="figrow rev">
    <p>
      I enjoy playing with the intersections of different tools to find delightful new ways to communicate.
    </p>
    <div class="fig">
      <VennAnimation />
    </div>
  </div>
</section>

<style>
  .figrow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10vh;
  }

  .figrow.rev {
    flex-direction: row-reverse;
  }

  .figrow > .fig {
    width: 55%;
  }

  .figrow > p {
    width: 35%;
    padding: 2rem;
  }
</style>