    const SB_SUN_KG = 1.98847e30, SB_EARTH_KG = 5.9722e24, SB_SUN_RADIUS_KM = 695700;
    const SB_REAL_RADII = { asteroid: 100, moon: 1737.4, mars: 3389.5, earth: 6371, jupiter: 69911, saturn: 58232, hotjup: 75000, comet: 5, reddwarf: 220000, sun: 695700, bluegiant: 4200000, whitedwarf: 6000, neutron: 12, blackhole: 17.72, smbh: 59.07 };
    function sbDisposeVelocityArrow(arrow) {
      // Three.js ArrowHelper shares its cone and line geometries across instances.
      arrow.traverse(node=>node.material?.dispose());
      arrow.removeFromParent();
    }
    function sbPhysicalRadius(b) {
      if (b.kind === 'bh') return 2.95325 * b.mass / SB_SOLAR_M;
      return b.physicalRadiusKm > 0 ? b.physicalRadiusKm * b.radius / b.baseRadius : 0;
    }
    function sbInteractionRadius(b) {
      const radius=sbPhysicalRadius(b);
      return radius > 0 ? radius / SB_SUN_RADIUS_KM * 5.5 : b.radius;
    }
    function sbPhysicalDensity(b) {
      const r = sbPhysicalRadius(b);
      return r > 0 ? (b.mass / SB_SOLAR_M * SB_SUN_KG) / (4 / 3 * Math.PI * (r * 1000) ** 3) / 1000 : null;
    }
    function sbEscapeKms(b) {
      const r = sbPhysicalRadius(b);
      return r > 0 ? Math.sqrt(2 * 6.67430e-11 * (b.mass / SB_SOLAR_M * SB_SUN_KG) / (r * 1000)) / 1000 : null;
    }
    function sbSegmentContact(a0, a1, b0, b1, radius) {
      const dx = a0.x - b0.x, dy = a0.y - b0.y, dz = a0.z - b0.z;
      const vx = a1.x - a0.x - b1.x + b0.x, vy = a1.y - a0.y - b1.y + b0.y, vz = a1.z - a0.z - b1.z + b0.z;
      const c = dx * dx + dy * dy + dz * dz - radius * radius;
      if (c <= 0) return 0;
      const aa = vx * vx + vy * vy + vz * vz;
      if (!aa) return null;
      const bb = 2 * (dx * vx + dy * vy + dz * vz), disc = bb * bb - 4 * aa * c;
      if (disc < 0) return null;
      const t = (-bb - Math.sqrt(disc)) / (2 * aa);
      return t >= 0 && t <= 1 ? t : null;
    }
    function sbBinaryStates(m1, m2, separation, G, center, drift) {
      const total = m1 + m2, omega = G > 0 ? Math.sqrt(G * total / (separation * separation + 1.4) ** 1.5) : 0;
      const r1 = separation * m2 / total, r2 = separation * m1 / total;
      return [
        {pos: center.clone().add(new THREE.Vector3(-r1, 0, 0)), vel: drift.clone().add(new THREE.Vector3(0, 0, r1 * omega))},
        {pos: center.clone().add(new THREE.Vector3(r2, 0, 0)), vel: drift.clone().add(new THREE.Vector3(0, 0, -r2 * omega))}
      ];
    }
    function sbNumberText(value) {
      if (!Number.isFinite(value)) return '未知';
      return value !== 0 && (Math.abs(value) < 0.01 || Math.abs(value) >= 1e6) ? value.toExponential(2) : value.toLocaleString('zh-CN', {maximumFractionDigits: 2});
    }
