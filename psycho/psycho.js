window.addEventListener('load', function() {
  const canvas = document.createElement('canvas')
  canvas.style.position = "fixed";
  canvas.style.left = "0px";
  canvas.style.right = "0px";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const limits = {
    x: this.innerWidth,
    y: this.innerHeight,
    rings: 100,
    planets:50,
  };
  const state = {
    start: null,
    previousTime: null,
    rotation: 0.0,
  };
  document.body.appendChild(canvas);
  
  const context = canvas.getContext('2d');

  const Position = function() {
    this.x = (Math.random() * limits.y * 0.4) + limits.x / 2;
    this.y = (Math.random() * limits.y * 0.4) + limits.y / 2;
  };

  const Ring = function() {
    this.radius = 1;
    this.growRate = 1 + Math.random() * 0.1;
    this.growSpeed = Math.random() * 3 + 2.5;
    this.position = new Position();
    this.color = 'rgb('
      + parseInt(Math.random() * 256) + ','
      + parseInt(Math.random() * 256) + ','
      + parseInt(Math.random() * 256)
      + ')';
  };

  const Planet = function() {
    this.radius = 15;
    this.position = 0;

    /*this.color = 'rgb('
      + parseInt(Math.random() * 256) + ','
      + parseInt(Math.random() * 256) + ','
      + parseInt(Math.random() * 256)
      + ')';*/
    
    const octet = parseInt(Math.random() * 128) + 128;
    this.color = 'rgb('
      + octet + ','
      + octet + ','
      + octet
      + ')';
  }

  const PlanetRing = function() {
    this.planets = [];
    this.radius = 0;
    this.speed = Math.random() * 0.003 + 0.00025;
    this.rotation = 0;
  };

  this.addEventListener('resize', function() {
    limits.x = this.innerWidth;
    limits.y = this.innerHeight;
  });

  const rings = [];
  const planets = [];
  const planetsRings = [];

  for (let index = 0; index < limits.rings; index++) {
    rings.push(new Ring());
  }

  for (let i = 0; i < 5; i++) {
    const planetRing = new PlanetRing();
    for (let index = 0; index < limits.planets; index++) {
      const planet = new Planet();
      planetRing.planets.push(planet);
    }
    planetRing.radius = (limits.y * 0.3 + 32) + 32 * i;
    planetsRings.push(planetRing);
  }
  

  const tick = (time) => {
    if (!state.start) {
      state.start = time;
      state.previousTime = time;
    }
    const elapsed = time - state.previousTime;

    if (elapsed >= 15) {
      for (let i = 0; i < planetsRings.length; i++) {
        const ring = planetsRings[i];
        ring.rotation += ring.speed;
        if (ring.rotation >= 1.0) {
          ring.rotation = 0;
        }
      }
      
      render();
      state.previousTime = time;
    }

    this.requestAnimationFrame(tick);
  };

  const PLANET_SIZE = 10;
  const render = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const cx = limits.x / 2;
    const cy = limits.y / 2;

    for (let indexRing = 0; indexRing < planetsRings.length; indexRing++) {
      const ring = planetsRings[indexRing];
      const radius = ring.radius;
      const planets = ring.planets;

      for (let index = 0; index < planets.length; index++) {
        const radians = Math.PI * 2 * (index / planets.length + ring.rotation);
        const depth = Math.cos(radians);
        const x = radius * Math.sin(radians) + cx;
        const y = (32 * depth + cy) + (8 * indexRing);
  
        context.fillStyle = planets[index].color;
        if (depth < 0) {
          context.beginPath();
          context.arc(x, y, 5 , 0, Math.PI * 2);
          context.fill();
        }
      }
  
    }

    context.fillStyle = "#333333";
    context.beginPath();
    context.arc(limits.x / 2, limits.y / 2, limits.y * 0.25, 0, Math.PI * 2);
    context.fill();

    for (let indexRing = 0; indexRing < planetsRings.length; indexRing++) {
      const ring = planetsRings[indexRing];
      const radius = ring.radius;
      const planets = ring.planets;

      context.fillStyle = '#ffffff';
      for (let index = 0; index < planets.length; index++) {
        const radians = Math.PI * 2 * (index / planets.length + ring.rotation);
        const depth = Math.cos(radians);
        const x = radius * Math.sin(radians) + cx;
        const y = (32 * depth + cy) + (8 * indexRing);
  
        context.fillStyle = planets[index].color;
        if (depth >= 0) {
          context.beginPath();
          context.arc(
            x, y,
            5,
            0,
            Math.PI * 2
          );
          context.fill();
        }
      }
    }
  };
  requestAnimationFrame(tick);
});