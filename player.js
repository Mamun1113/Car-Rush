import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/FBXLoader.js';

export const player = (() => {

  class Player {
    constructor(params) {
      this.position_ = new THREE.Vector3(0, 0, 0);
      this.rotation_ = 0.0;
      this.velocity_ = 0.0;
      this.playerBox_ = new THREE.Box3();
      this.params_ = params;
      this.LoadModel_();
      this.InitInput_();
    }

    LoadModel_() {
      const loader = new FBXLoader();
      loader.setPath('./3d_models/');
      loader.load('Jeep.fbx', (fbx) => {
        fbx.scale.setScalar(0.8);
        fbx.quaternion.setFromAxisAngle(
          new THREE.Vector3(0, 1, 0), Math.PI / 2);

      this.mesh_ = fbx;
      this.params_.scene.add(this.mesh_);

      fbx.traverse(c => {
        let materials = c.material;
        if (!(c.material instanceof Array)) {
          materials = [c.material];
        }

        for (let m of materials) {
          if (m) {
            m.specular = new THREE.Color(0x000000);
            m.color.offsetHSL(0, 0, 0.25);
          }
        }    
        c.castShadow = true;
        c.receiveShadow = true;
      });

      const m = new THREE.AnimationMixer(fbx);
      this.mixer_ = m;

      for (let i = 0; i < fbx.animations.length; ++i) {
        if (fbx.animations[i].name.includes('Run')) {
          const clip = fbx.animations[i];
          const action = this.mixer_.clipAction(clip);
          action.play();
        }
      }
    });
    }

    InitInput_() {
      this.keys_ = {
          rightarrow: false,
          leftarrow: false,
      };
      this.oldKeys = {...this.keys_};

      document.addEventListener('keydown', (e) => this.OnKeyDown_(e), false);
      document.addEventListener('keyup', (e) => this.OnKeyUp_(e), false);
    }

    OnKeyDown_(event) {
      switch(event.keyCode) {
        case 37:
            this.keys_.leftarrow = true;
            break;
        case 39:
          this.keys_.rightarrow = true;
          break;
      }
    }

    OnKeyUp_(event) {
      switch(event.keyCode) {
        case 37:
          this.keys_.leftarrow = false;
          break;
        case 39:
          this.keys_.rightarrow = false;
          break;
      }
    }

    CheckCollisions_() {
      const colliders = this.params_.world.GetColliders();

      this.playerBox_.setFromObject(this.mesh_);

      for (let c of colliders) {
        const cur = c.collider;

        if (cur.intersectsBox(this.playerBox_)) {
          this.gameOver = true;
        }
      }
    }

    Update(timeElapsed) {

      if (this.keys_.rightarrow ) {
        this.position_.z += 0.05;
        //this.rotation_ -= Math.PI / 2 * timeElapsed;     
      }
      if (this.keys_.leftarrow ) {
        this.position_.z -= 0.05;
        //this.rotation_ += Math.PI / 2 * timeElapsed;
      }

      const acceleration = -75 * timeElapsed;

      this.position_.y += timeElapsed * (
      this.velocity_ + acceleration * 0.5);
      this.position_.y = Math.max(this.position_.y, 0.28);

      this.velocity_ += acceleration;
      this.velocity_ = Math.max(this.velocity_, -100);

      if (this.mesh_) {
        this.mixer_.update(timeElapsed);
        this.mesh_.position.copy(this.position_);
        //this.mesh_.rotation.y = this.rotation_;
        this.CheckCollisions_();
      }
    }
  };

  return {
      Player: Player,
  };
})();