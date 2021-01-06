<script>


</script>

<section id="about">
  <h1 class="shed">
    About Me
  </h1>
  <div id="biorow">
    <div id="imgwrapper">
      <img src="./assets/me@2x.jpg" alt="It's-a-me, Zach-a-ry">
    </div>
    <p>
      Originally from <em>Oakland</em>, CA, currently living in <em>Brooklyn</em>, NY with my wife and our dog, Frankie! I have a background in editorial and non-profit design work, as well as a fair amount of digital marketing type design-y stuff. After some years of doing all that professionally, I decided to pivot towards my passion for technology and code, something I loved in school but got away from afterwards. Nowadays, I spend my time freelancing and playing with creative coding to find weird ways to bring my ideas to life.
    </p>
  </div>

  
</section>

<style>
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

  #biorow > * {
    width: 45%;
  }

  #imgwrapper {
    border: var(--border);
    border-bottom: 4px solid var(--gray);
    border-radius: 10px;
    overflow: hidden;
    width: auto;
    box-sizing: border-box;

  }
  
  img {
    max-height: 25rem;
  }

</style>