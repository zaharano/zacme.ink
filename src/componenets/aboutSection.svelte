<script>
  import SectionHead from './sectionHead.svelte';
</script>

<section>
  <SectionHead id="about" text="About Me" />
  <div id="biorow">
    <div id="imgwrapper">
    </div>
    <div class="bio">
      <p>
        I'm from Oakland, CA (pictured here) and currently living in Brooklyn, NY with my wife and our dog, Frankie. I have a background in editorial and non-profit design, as well as a fair amount of digital marketing type stuff.
      </p>
      <p>
        I have rediscovered my passion for technology and code, something I loved in school but drifted away from afterwards. Nowadays, I spend my time freelancing and playing with creative coding to find weird ways to bring my ideas to life.
      </p>
      <p>
        I enjoy cooking, soccer, going to museums, and trashy genre fiction.
      </p>
    </div>
    
  </div>

  
</section>

<style>
  p { 
    text-align: left;
  }

  #about {
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

  @media (max-width: 900px) {
    #biorow {
      flex-direction: column;
    }
  }

  #biorow > * {
    min-width: 40%;
  }

  #imgwrapper {
    border: var(--border);
    border-bottom: 4px solid var(--gray);
    border-radius: 10px;
    overflow: hidden;
    box-sizing: border-box;
    margin-right: 3rem;
    background-image: url("../assets/me@2x.jpg");
    background-size: cover;
    background-position: center;
    min-height: 500px;
    align-self: stretch;
  }

 

</style>