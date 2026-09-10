/**
 * effects.ts — combat feedback, world-space only.
 *
 * Hit sparks, death debris that arcs and settles, expanding rings for novas
 * and level-ups, and the soft respawn flash. No screen shake, no zoom-punch,
 * no full-screen flash — the camera never knows any of this happened.
 *
 * Particles shrink out instead of fading so they can share materials per
 * colour (no per-particle transparency cost).
 */

import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  settleY: number;
  baseScale: number;
  spin: THREE.Vector3;
}

interface Ring {
  mesh: THREE.Mesh;
  life: number;
  maxLife: number;
  maxR: number;
}

const MAX_PARTICLES = 240;

export class Effects {
  readonly group = new THREE.Group();
  private particles: Particle[] = [];
  private rings: Ring[] = [];
  private sparkGeo = new THREE.OctahedronGeometry(0.09, 0);
  private debrisGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
  private ringGeo = new THREE.RingGeometry(0.85, 1, 40);
  private matCache = new Map<string, THREE.MeshBasicMaterial>();

  private mat(color: string): THREE.MeshBasicMaterial {
    let m = this.matCache.get(color);
    if (!m) {
      m = new THREE.MeshBasicMaterial({ color });
      this.matCache.set(color, m);
    }
    return m;
  }

  /** Small coloured spark burst at a hit point. */
  spark(pos: THREE.Vector3, color = '#f2c14e', count = 6) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= MAX_PARTICLES) return;
      const a = Math.random() * Math.PI * 2;
      const mesh = new THREE.Mesh(this.sparkGeo, this.mat(color));
      mesh.position.copy(pos);
      const life = 0.35 + Math.random() * 0.2;
      this.particles.push({
        mesh,
        vel: new THREE.Vector3(Math.cos(a) * 3.5, 3 + Math.random() * 2.5, Math.sin(a) * 3.5),
        life,
        maxLife: life,
        settleY: pos.y - 0.4,
        baseScale: 1,
        spin: new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6),
      });
      this.group.add(mesh);
    }
  }

  /** Death burst: debris arcs out, settles on the ground, shrinks away. */
  deathBurst(pos: THREE.Vector3, color: string, count = 10, groundY = 0) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= MAX_PARTICLES) return;
      const a = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      const mesh = new THREE.Mesh(this.debrisGeo, this.mat(color));
      mesh.position.copy(pos);
      const life = 0.7 + Math.random() * 0.4;
      this.particles.push({
        mesh,
        vel: new THREE.Vector3(Math.cos(a) * speed, 3.5 + Math.random() * 3, Math.sin(a) * speed),
        life,
        maxLife: life,
        settleY: groundY + 0.07,
        baseScale: 0.8 + Math.random() * 0.7,
        spin: new THREE.Vector3(Math.random() * 8, Math.random() * 8, Math.random() * 8),
      });
      this.group.add(mesh);
    }
  }

  /** Expanding ring anchored to a world position (nova, level-up). */
  ring(pos: THREE.Vector3, color: string, maxR: number, life = 0.6) {
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(this.ringGeo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(pos.x, pos.y + 0.15, pos.z);
    mesh.scale.setScalar(0.01);
    this.rings.push({ mesh, life, maxLife: life, maxR });
    this.group.add(mesh);
  }

  /** Soft respawn flash: one wide ring, one quick vertical column. */
  respawn(pos: THREE.Vector3) {
    this.ring(pos, '#f6f1e4', 6, 0.9);
    const mat = new THREE.MeshBasicMaterial({
      color: '#f6f1e4',
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 5, 14, 1, true), mat);
    mesh.position.set(pos.x, pos.y + 2.5, pos.z);
    this.rings.push({ mesh, life: 0.7, maxLife: 0.7, maxR: 1 });
    this.group.add(mesh);
  }

  update(dt: number) {
    // Particles: gravity arc, settle, shrink out.
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.group.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }
      p.vel.y -= 12 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      if (p.mesh.position.y < p.settleY) {
        p.mesh.position.y = p.settleY;
        p.vel.set(0, 0, 0);
      }
      p.mesh.rotation.x += p.spin.x * dt;
      p.mesh.rotation.y += p.spin.y * dt;
      p.mesh.rotation.z += p.spin.z * dt;
      p.mesh.scale.setScalar(p.baseScale * (p.life / p.maxLife));
    }

    // Rings: expand and fade.
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life -= dt;
      const m = r.mesh.material as THREE.MeshBasicMaterial;
      if (r.life <= 0) {
        this.group.remove(r.mesh);
        m.dispose();
        this.rings.splice(i, 1);
        continue;
      }
      const t = 1 - r.life / r.maxLife;
      const eased = 1 - Math.pow(1 - t, 3);
      r.mesh.scale.setScalar(Math.max(0.01, eased * r.maxR));
      m.opacity = 0.85 * (1 - t);
    }
  }

  dispose() {
    for (const p of this.particles) this.group.remove(p.mesh);
    for (const r of this.rings) {
      this.group.remove(r.mesh);
      (r.mesh.material as THREE.Material).dispose();
    }
    this.particles = [];
    this.rings = [];
    this.sparkGeo.dispose();
    this.debrisGeo.dispose();
    this.ringGeo.dispose();
    for (const m of this.matCache.values()) m.dispose();
  }
}
