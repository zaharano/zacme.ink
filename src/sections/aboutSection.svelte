<script>
  import SectionHead from '../componenets/sectionHead.svelte';
  import IntersectionObserver from '../componenets/intersectionObserver.svelte';
</script>

<section>
  <IntersectionObserver once={true} let:intersecting top={500}>
    <SectionHead id="about" text="About Me" />
    <div id="biorow">
      <div id="imgwrapper" />
      <div class="bio">
        <p>
          I'm from Oakland, CA, currently living in Brooklyn, NY with my wife
          and our dog. I have a background in editorial and non-profit design,
          as well as a fair amount of digital marketing type stuff.
        </p>
        <p>
          I have rediscovered my passion for technology and code, pursuits I
          relished in school but drifted away from afterwards. Nowadays, I spend
          my time freelancing and playing with creative coding to find weird
          ways to bring my ideas to life.
        </p>
        <p>
          I enjoy cooking, soccer, going to museums, and trashy genre fiction.
        </p>
      </div>
    </div>
  </IntersectionObserver>
</section>

<style>
  p {
    text-align: left;
  }

  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
  }

  #biorow {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #biorow > div {
    min-width: 40%;
  }

  #imgwrapper {
    border: var(--border);
    border-bottom: 4px solid var(--gray);
    border-radius: 10px;
    overflow: hidden;
    box-sizing: border-box;
    margin-right: 3rem;
    background-image: url('../assets/me@2x.jpg');
    background-size: cover;
    background-position: center;
    min-height: 500px;
    align-self: stretch;
  }

  @media (max-width: 1000px) {
    #biorow {
      flex-direction: column;
    }
    #imgwrapper {
      margin-left: 3rem;
      margin-bottom: 2rem;
    }
  }

  @media (max-width: 500px) {
    #imgwrapper {
      margin-left: 1rem;
      margin-right: 1rem;
      margin-bottom: 1rem;
      min-height: 300px;
    }
  }
</style>
