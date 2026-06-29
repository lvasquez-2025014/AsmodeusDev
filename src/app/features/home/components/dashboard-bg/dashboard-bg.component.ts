import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-dashboard-bg',
  templateUrl: './dashboard-bg.component.html',
  styleUrls: ['./dashboard-bg.component.css']
})
export class DashboardBgComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) bgCanvas!: ElementRef<HTMLDivElement>;

  private scene: any;
  private camera: any;
  private renderer: any;
  private particles: any;
  private geometry: any;
  private material: any;
  private animationId = 0;
  private clock: any;

  ngAfterViewInit(): void {
    this.clock = new THREE.Clock();
    this.init();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer?.dispose();
    this.geometry?.dispose();
    this.material?.dispose();
  }

  private init(): void {
    const container = this.bgCanvas.nativeElement;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 4;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(this.renderer.domElement);

    const count = 400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const cyan = new THREE.Color('#22d3ee');
    const violet = new THREE.Color('#a78bfa');
    const palette = [cyan, violet];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 25;
      positions[i3 + 1] = (Math.random() - 0.5) * 25;
      positions[i3 + 2] = (Math.random() - 0.5) * 10 - 3;

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 2 + 0.5;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
      },
      vertexShader: `
        attribute float aSize;
        uniform float uTime;
        uniform float uPixelRatio;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = color;
          vec3 pos = position;
          pos.x += sin(uTime * 0.15 + position.y * 0.3) * 0.2;
          pos.y += cos(uTime * 0.1 + position.x * 0.2) * 0.15;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = aSize * uPixelRatio * (2.5 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;

          float dist = length(pos.xy);
          vAlpha = smoothstep(15.0, 5.0, dist) * 0.35;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float glow = 1.0 - smoothstep(0.0, 0.5, d);
          gl_FragColor = vec4(vColor, glow * vAlpha);
        }
      `,
      vertexColors: true,
    });

    this.particles = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.particles);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    const elapsed = this.clock.getElapsedTime();
    this.material.uniforms.uTime.value = elapsed;
    this.particles.rotation.y = elapsed * 0.008;
    this.renderer.render(this.scene, this.camera);
  };
}
