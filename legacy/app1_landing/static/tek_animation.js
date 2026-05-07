document.addEventListener("DOMContentLoaded", function () {
  (function () {
    const canvas = document.getElementById('bg-animation-canvas');
    const ctx = canvas.getContext('2d');
  
    let width, height;
    let points = [];
    const numPoints = 100;
    const maxDist = 120;
  
    let mouse = { x: null, y: null };
  
    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
  
    function createPoints() {
      points = [];
      for (let i = 0; i < numPoints; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5
        });
      }
    }
  
    function drawPoints() {
      ctx.fillStyle = '#890000'; 
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#E2E6E6';
      ctx.fillStyle = '#E2E6E6';
  
  
      for (let i = 0; i < numPoints; i++) {
        let p1 = points[i];
  
        p1.x += p1.vx;
        p1.y += p1.vy;
  
        // Bounce off edges
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;
  
        // Draw point
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 2, 0, Math.PI * 2);
        ctx.fill();
  
        // Draw lines to nearby points
        for (let j = i + 1; j < numPoints; j++) {
          let p2 = points[j];
          let dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < maxDist) {
            const opacity = 1 - dist / maxDist;
            ctx.strokeStyle = `rgba(226, 230, 230, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
  
        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const mDist = Math.hypot(p1.x - mouse.x, p1.y - mouse.y);
          if (mDist < maxDist) {
            ctx.strokeStyle = 'rgba(226, 230, 230, 0.6)';
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    }
  
    function animate() {
      drawPoints();
      requestAnimationFrame(animate);
    }
  
    // Event listeners
    window.addEventListener('resize', () => {
      resizeCanvas();
      createPoints();
    });
  
    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
});
  
    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });
  
    // Init
    resizeCanvas();
    createPoints();
    animate();
  })();
  
});