<script>
  import VennAnimation from "../componenets/vennAnimation.svelte";
  import AbilityAnimation from "../componenets/abilityAnimation.svelte";
</script>

<section>
  <div class="figrow">
    <p>
      I have a versatile toolbox assembled from a decade of varied work and a
      love of side projects.
    </p>
    <div class="fig">
      <AbilityAnimation />
    </div>
  </div>

  <div class="figrow rev">
    <p>
      I enjoy playing with the intersections of different tools to find
      delightful new ways to communicate.
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
    text-align: left;
  }

  .figrow:last-of-type {
    margin-bottom: inherit;
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

  p {
    font-size: calc(1vw + 1em);
    font-size: clamp(1.6rem, 1.8vw, 2.4rem);
  }

  @media (max-width: 1100px) {
    .figrow {
      flex-direction: column;
    }
    .figrow.rev {
      flex-direction: column;
    }
    .figrow > .fig {
      width: 92%;
    }
    .figrow > p {
      width: 75%;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .figrow:first-of-type > p {
      padding-top: 0;
    }
  }
</style>
