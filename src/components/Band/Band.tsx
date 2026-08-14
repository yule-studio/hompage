import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import type { MaterialNode, Object3DNode, Vector2 } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import "./Band.css";

extend({ MeshLineGeometry, MeshLineMaterial });

/**
 * meshline's uniforms are plain THREE.Vector2s, but R3F accepts the array
 * shorthand for anything with a `.set()` — widen those props so the JSX below
 * type-checks the way it runs.
 */
type MeshLineMaterialProps = Omit<
  MaterialNode<MeshLineMaterial, typeof MeshLineMaterial>,
  "resolution" | "repeat"
> & {
  resolution?: Vector2;
  repeat?: Vector2;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>;
      meshLineMaterial: MeshLineMaterialProps;
    }
  }
}

const GLTF_PATH = `${import.meta.env.BASE_URL}assets/kartu.glb`;
const TEXTURE_PATH = `${import.meta.env.BASE_URL}assets/bandd.png`;
/** the glb's baked card face, re-composited with the GitHub avatar as the photo */
const CARD_PATH = `${import.meta.env.BASE_URL}assets/card.png`;

useGLTF.preload(GLTF_PATH);
useTexture.preload(TEXTURE_PATH);
useTexture.preload(CARD_PATH);

type BadgeGLTF = {
  nodes: {
    card: THREE.Mesh;
    clip: THREE.Mesh;
    clamp: THREE.Mesh;
  };
  materials: {
    base: THREE.MeshPhysicalMaterial;
    metal: THREE.MeshStandardMaterial;
  };
};

/**
 * Band — a lanyard ID badge hanging from the top of the hero, draggable with
 * the pointer. The strap is a rope of rapier rigid bodies stitched together by
 * rope joints and drawn as a textured meshline; the card is a glTF model
 * (card + clip + clamp) attached by a spherical joint at its top edge.
 *
 * Ported from portofoliov1's `band/App.js` — same physics constants, camera,
 * lighting and drag behaviour. Desktop only: on <768px the rope is not mounted
 * (the canvas has no pointer events there either).
 */
export default function Band() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="band-wrapper">
      <Canvas
        gl={{ alpha: true }}
        camera={{ position: [0, 0, 13], fov: 25 }}
        style={{
          background: "transparent",
          width: "100%",
          height: "100%",
          pointerEvents: isMobile ? "none" : "auto",
        }}
      >
        <ambientLight intensity={Math.PI} />

        <Scene isMobile={isMobile} />

        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

/**
 * Where the rope is pinned, in world units. The hero canvas is full-viewport
 * like portofoliov1's, so this is its value verbatim — the badge lands in the
 * same place at the same window size.
 */
const ANCHOR: [number, number, number] = [3, 4, 0];

function Scene({ isMobile }: { isMobile: boolean }) {
  return (
    <Physics
      key={isMobile ? "mobile" : "desktop"}
      interpolate
      gravity={[0, -40, 0]}
      timeStep={1 / 60}
    >
      {!isMobile && <Lanyard />}
    </Physics>
  );
}

function Lanyard({ maxSpeed = 50, minSpeed = 10 }) {
  const band = useRef<THREE.Mesh>(null);
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);

  // scratch vectors, reused every frame
  const vec = useRef(new THREE.Vector3()).current;
  const ang = useRef(new THREE.Vector3()).current;
  const rot = useRef(new THREE.Vector3()).current;
  const dir = useRef(new THREE.Vector3()).current;

  // trailing positions for the two middle joints — the rope is drawn through
  // these lerped points so it reads as cloth rather than a rigid chain
  const lerped = useRef<[THREE.Vector3 | null, THREE.Vector3 | null]>([null, null]);

  const segmentProps = {
    type: "dynamic" as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF(GLTF_PATH) as unknown as BadgeGLTF;
  const texture = useTexture(TEXTURE_PATH);
  const cardMap = useTexture(CARD_PATH);
  const { width, height } = useThree((state) => state.size);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  );

  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = dragged ? "grabbing" : "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));

      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());

      const newX = vec.x - dragged.x;
      let newY = vec.y - dragged.y;
      const newZ = vec.z - dragged.z;

      // don't let the card be dragged up past the anchor — it would fold the rope
      if (state.pointer.y < -0.2) newY = card.current.translation().y;

      card.current.setNextKinematicTranslation({ x: newX, y: newY, z: newZ });
    }

    if (fixed.current && j1.current && j2.current && j3.current && card.current) {
      [j1, j2].forEach((ref, i) => {
        const body = ref.current;
        if (!body) return;
        if (!lerped.current[i]) {
          lerped.current[i] = new THREE.Vector3().copy(body.translation());
        }
        const target = lerped.current[i] as THREE.Vector3;
        const d = Math.max(0.1, Math.min(1, target.distanceTo(body.translation() as THREE.Vector3)));
        target.lerp(body.translation() as THREE.Vector3, delta * (minSpeed + d * (maxSpeed - minSpeed)));
      });

      if (lerped.current[0] && lerped.current[1]) {
        curve.points[0].copy(j3.current.translation() as THREE.Vector3);
        curve.points[1].copy(lerped.current[1] as THREE.Vector3);
        curve.points[2].copy(lerped.current[0] as THREE.Vector3);
        curve.points[3].copy(fixed.current.translation() as THREE.Vector3);

        const geometry = band.current?.geometry as MeshLineGeometry | undefined;
        geometry?.setPoints(curve.getPoints(32));
      }

      ang.copy(card.current.angvel() as THREE.Vector3);
      rot.copy(card.current.rotation() as unknown as THREE.Vector3);

      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
    }
  });

  curve.curveType = "chordal";
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  // the glb's UVs assume glTF texture orientation, which TextureLoader doesn't
  // use by default — flip it back so the face lands the right way up
  cardMap.flipY = false;
  cardMap.colorSpace = THREE.SRGBColorSpace;

  return (
    <>
      <group position={ANCHOR}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />

          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              (e.target as Element).releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture(e.pointerId);
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current!.translation() as THREE.Vector3)),
              );
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial {...materials.base} map={cardMap} />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          transparent
          opacity={0.9}
          color="white"
          depthTest={false}
          resolution={[width, height]}
          useMap={1}
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
