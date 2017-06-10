var AFRAME = require('aframe');
var html = require('aframe-html-shader');
// var gui = require('./gui.js');
var client = require('../../app/clients/client.js');


function stringToVector(string) {
    var nums = string.split(' ');
    return {x: parseFloat(nums[0]), y: parseFloat(nums[1]), z: parseFloat(nums[2])};
}

window.onload = function () {
    var player = document.querySelector('#player');
    var table = document.querySelector('#table');

    var poker = new client.PokerClient();
    var bet  = poker.bet;
    var call = poker.call;
    var fold = poker.fold;

    var quaternion = new THREE.Quaternion();
    var rotateVector = new THREE.Vector3(0, 0, 1);
    var uvMinVector = new THREE.Vector2();
    var uvMaxVector = new THREE.Vector2();
    var uvScaleVector = new THREE.Vector2();

    AFRAME.registerGeometry('triangle', {
        schema: {
            vertexA: {type: 'vec3', default: {x: 0, y: 0.5, z: 0}},
            vertexB: {type: 'vec3', default: {x: -0.5, y: -0.5, z: 0}},
            vertexC: {type: 'vec3', default: {x: 0.5, y: -0.5, z: 0}}
        },

        init: function (data) {
            var geometry;
            var normal;
            var triangle;
            var uvA;
            var uvB;
            var uvC;

            triangle = new THREE.Triangle();
            triangle.a.set(data.vertexA.x, data.vertexA.y, data.vertexA.z);
            triangle.b.set(data.vertexB.x, data.vertexB.y, data.vertexB.z);
            triangle.c.set(data.vertexC.x, data.vertexC.y, data.vertexC.z);
            normal = triangle.normal();

            // Rotate the 3D triangle to be parallel to XY plane.
            quaternion.setFromUnitVectors(normal, rotateVector);
            uvA = triangle.a.clone().applyQuaternion(quaternion);
            uvB = triangle.b.clone().applyQuaternion(quaternion);
            uvC = triangle.c.clone().applyQuaternion(quaternion);

            // Compute UVs.
            // Normalize x/y values of UV so they are within 0 to 1.
            uvMinVector.set(Math.min(uvA.x, uvB.x, uvC.x), Math.min(uvA.y, uvB.y, uvC.y));
            uvMaxVector.set(Math.max(uvA.x, uvB.x, uvC.x), Math.max(uvA.y, uvB.y, uvC.y));
            uvScaleVector.set(0, 0).subVectors(uvMaxVector, uvMinVector);
            uvA = new THREE.Vector2().subVectors(uvA, uvMinVector).divide(uvScaleVector);
            uvB = new THREE.Vector2().subVectors(uvB, uvMinVector).divide(uvScaleVector);
            uvC = new THREE.Vector2().subVectors(uvC, uvMinVector).divide(uvScaleVector);

            geometry = this.geometry = new THREE.Geometry();
            geometry.vertices.push(triangle.a);
            geometry.vertices.push(triangle.b);
            geometry.vertices.push(triangle.c);
            geometry.faces.push(new THREE.Face3(0, 1, 2, normal));
            geometry.faceVertexUvs[0] = [[uvA, uvB, uvC]];
        }
    });

    AFRAME.registerComponent('seat', {
        schema: {
            type: 'number'
        },
        init: function () {
            var el = this.el;
            // el.addEventListener('click', function (event) {
            //     let position = el.getAttribute('position');
            //     let playerHeight = player.getAttribute('position').y;
            //     // let tablePosition = player.getAttribute('position');
            //
            //     player.setAttribute('position', new THREE.Vector3(position.x,  playerHeight, position.z));
            //     // player.object3D.lookAt(new THREE.Vector3(tablePosition));
            // });
        },
        sitDown() {
            console.log("Sitting down at seat #" + this.data);
            let position = this.el.getAttribute('position');
            let rotation = this.el.getAttribute('rotation');
            let playerHeight = player.getAttribute('position').y;
            let dealtCards = document.querySelector('#dealt-cards');
            let controls = document.querySelector('#controls-' + this.data);
            let chips = document.querySelector('#chips-' + this.data);

            player.setAttribute('position', new THREE.Vector3(position.x,  playerHeight, position.z));
            player.setAttribute('rotation', new THREE.Vector3(rotation.x, rotation.y, rotation.z));
            dealtCards.setAttribute('rotation', new THREE.Vector3(rotation.x, rotation.y, rotation.z));
            controls.setAttribute('visible', true);
            chips.setAttribute('visible', true);
        }
    });


    AFRAME.registerComponent('scene-scale', {
        schema: {
            type: 'vec3',
            default: {x: 1, y: 1, z: 1}
        },
        init: function() {
            this.setWorldScale();
        },
        setWorldScale: function () {
            var currentEl = this.el;
            var currentScale = this.el.getAttribute('scale');
            currentEl = currentEl.parentNode;

            while(currentEl != this.el.sceneEl) {
                let scale = currentEl.getAttribute('scale');
                if (typeof scale == 'string')
                    scale = stringToVector(scale);

                else if (scale == null) {
                    scale = {x: 1, y: 1, z: 1};
                }
                // console.log("scale ", scale);
                // console.log("currentscale ", currentScale);

                currentScale.x = currentScale.x / scale.x;
                currentScale.y = currentScale.y / scale.y;
                currentScale.z = currentScale.z / scale.z;

                currentEl = currentEl.parentNode;
            }

            var sceneScale = stringToVector(this.el.getAttribute('scene-scale'));
            if (sceneScale == null) sceneScale = {x: 1, y: 1, z: 1};
            var newScale = {x: sceneScale.x * currentScale.x, y: sceneScale.y * currentScale.y, z: sceneScale.z * currentScale.z};
            this.el.setAttribute('scale', newScale);

            // console.log("scale ", this.el.getAttribute('scale'));
        },
        update: function () {
            this.setWorldScale();
        }
    });

    AFRAME.registerComponent('dealer', {
        schema: {
            seat: {type: 'number'}
        },
        card0: null,
        card1: null,
        dealt: [],
        init: function() {
            // console.log("init");
        },
        tick: function() {
            var seat = poker.getSeat();
            var hand = poker.getHand();
            var players = poker.getPlayers();
            var state = poker.getState();

            if (seat != null) {
                console.log("Sitting down in seat #" + seat);
                this.data.seat = seat;

                let chair = document.querySelector('#chair-' + seat.toString()).components.seat;
                chair.sitDown();
            }

            if (hand != null) {
                console.log(hand);
                this.card0 = document.querySelector('#card-' + this.data.seat.toString() + '-0').components.card;
                this.card1 = document.querySelector('#card-' + this.data.seat.toString() + '-1').components.card;

                // console.log(this.card0);
                this.card0.setCard(hand[0][0] == '0' ? '10' : hand[0][0], hand[0][1]);
                this.card1.setCard(hand[1][0] == '0' ? '10' : hand[1][0], hand[1][1]);
                this.card0.rotate();
                this.card1.rotate();
            }

            if (players != null) {
                console.log(players);
                for (let playerSeat in players) {
                    // console.log(playerSeat);
                    let cardSpawn = document.querySelector('#card-spawn-' + playerSeat.toString());
                    let playerChips = document.querySelector('#chips-' + playerSeat.toString());
                    console.log(playerChips);
                    if (cardSpawn != null) {
                        cardSpawn.setAttribute('visible', true);
                        playerChips.setAttribute('visible', true);
                    }
                    playerChips = document.querySelector('#chips-' + playerSeat.toString());
                    console.log(playerChips);

                }
            }

            if (state != null) {
                console.log(state);
                let dealtLength = this.dealt.length;
                let chips = document.querySelector('#chips-' + this.data.seat.toString());
                // let playerData = state
                chips.components['chips'].setAmount(state.players[this.data.seat].cash);

                console.log(state.dealt);
                console.log(state['dealt']);
                if (state.dealt.length > dealtLength) {
                    this.dealt = state.dealt;
                    if (dealtLength == 0) {
                        let dealtElem0 = document.querySelector('#dealt-card-0');
                        let dealtElem1 = document.querySelector('#dealt-card-1');
                        let dealtElem2 = document.querySelector('#dealt-card-2');
                        let dealt0 = dealtElem0.components.card;
                        let dealt1 = dealtElem1.components.card;
                        let dealt2 = dealtElem2.components.card;

                        dealt0.setCard(this.dealt[0][0], this.dealt[0][1]);
                        dealt1.setCard(this.dealt[1][0], this.dealt[1][1]);
                        dealt2.setCard(this.dealt[2][0], this.dealt[2][1]);

                        console.log(dealtElem0);
                        dealtElem0.setAttribute('visible', true);
                        dealtElem1.setAttribute('visible', true);
                        dealtElem2.setAttribute('visible', true);
                        console.log("Flop");
                    }

                    else if (dealtLength == 3) {
                        let dealtElem3 = document.querySelector('#dealt-card-3');
                        let dealt3 = dealtElem3.components.card;

                        dealt3.setCard(this.dealt[3][0], this.dealt[3][1]);

                        dealtElem3.setAttribute('visible', true);
                        console.log("Turn");

                    }

                    else if (dealtLength == 4) {
                        let dealtElem4 = document.querySelector('#dealt-card-4');
                        let dealt4 = dealtElem4.components.card;

                        dealt4.setCard(this.dealt[4][0], this.dealt[4][1]);

                        dealtElem4.setAttribute('visible', true);
                        console.log("River");

                    }
                }

                else if (state.dealt.length == 0) {
                    this.dealt = state.dealt;
                    let dealtElem0 = document.querySelector('#dealt-card-0');
                    let dealtElem1 = document.querySelector('#dealt-card-1');
                    let dealtElem2 = document.querySelector('#dealt-card-2');
                    let dealtElem3 = document.querySelector('#dealt-card-3');
                    let dealtElem4 = document.querySelector('#dealt-card-4');
                    // console.log(dealtElem0);
                    dealtElem0.setAttribute('visible', false);
                    dealtElem1.setAttribute('visible', false);
                    dealtElem2.setAttribute('visible', false);
                    dealtElem3.setAttribute('visible', false);
                    dealtElem4.setAttribute('visible', false);
                    // console.log(dealtElem0);
                }
            }
        },
        update: function() {
            // console.log("in update");
            if (this.data.seat !=  null) {
                poker.join(100);
            }
        },
        reset: function() {
            this.card0 = null;
            this.card1 = null;
        }
    });

    AFRAME.registerComponent('card', {
        schema: {
            suit: {type: 'string'},
            symbol: {type: 'string'}
        },
        front: null,
        back: null,
        init: function () {
            var frontMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            var backMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            var geometry = new THREE.PlaneGeometry(1, 1);
            geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, 0.5, 0 ) );

            this.front = new THREE.Mesh(geometry, frontMaterial);
            this.back = new THREE.Mesh(geometry, backMaterial);

            this.el.setObject3D('front', this.front);
            this.el.setObject3D('back', this.back);

            // Set the scale of card mesh to the 1.4/1 ratio of a card
            // TODO Initialize card as PlaneGeometry(1.4, 1)
            this.front.scale.set(1, 1.4, 1);
            this.back.scale.set(1, 1.4, 1);

            // Rotate back side to 180 degrees of front side;
            this.back.rotation.y = Math.PI;
            this.generateFrontImage();
            this.generateBackImage();
        },
        update: function() {
            // this.generateFrontImage();
        },
        setCard: function(symbol, suit) {
            this.data.symbol = symbol;

            switch(suit[0].toUpperCase()) {
                case 'S':
                    this.data.suit = 'spades';
                    break;
                case 'C':
                    this.data.suit = 'clubs';
                    break;
                case 'H':
                    this.data.suit = 'hearts';
                    break;
                case 'D':
                    this.data.suit = 'diamonds';
            }


            this.generateFrontImage();
        },
        generateBackImage: function() {
            // console.log("generate back image");
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");

            canvas.width = 250;
            canvas.height = 350;

            // Fill background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Fill inner layer
            ctx.fillStyle = 'red';
            ctx.fillRect(25, 35, canvas.width - 25 * 2, canvas.height - 35 * 2);

            this.back.material.map = new THREE.Texture(canvas);
            this.back.material.map.needsUpdate = true;
        },
        generateFrontImage: function() {
            // console.log("in");
            if (this.data.suit != '' && this.data.symbol != '') {
                // console.log("generating card image");
                var canvas = document.createElement('canvas');
                canvas.width = 250;
                canvas.height = 350;

                // Fill background
                var ctx = canvas.getContext("2d");
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                let suit = this.data.suit;
                var suitImage = document.querySelector('#' + suit);
                var symbol = this.data.symbol;
                if (symbol.length > 1) {
                    symbol = symbol[1];
                }
                var symbolNum = parseInt(symbol);
                // console.log(symbol);
                // console.log(suit);
                if (symbol == 'J' || symbol == 'Q' || symbol == 'K' || symbol == 'A' ||
                    (symbolNum != null && symbolNum >= 1 && symbolNum <= 10)) {
                }

                else {
                    return;
                }

                // console.log("SYMBOL IS: " + symbol);
                // console.log("SUIT IS: " + suit);
                if (suit == 'spades' || suit == 'clubs') {
                    // console.log("coloring black");
                    ctx.fillStyle = 'black';
                } else if (suit == 'hearts' || suit == 'diamonds') {
                    // console.log("coloring red");
                    ctx.fillStyle = 'red';
                } else {
                    // console.log("Wrong suit.");
                    return;
                }

                ctx.font = "48px Symbol";
                // // Draw Middle Suit
                // ctx.drawImage(suitImage, 96, 42, 96, 96);
                // console.log(suitImage);
                // Draw Top Suit
                ctx.drawImage(suitImage, 24, 64, 48, 48);

                // Draw Top Symbol
                ctx.fillText(symbol, 32, 54);

                ctx.save();

                // Move origin to middle
                ctx.translate(canvas.width / 2, canvas.height / 2);

                // // Draw Middle Suit
                ctx.drawImage(suitImage, -48, -48, 96, 96);

                // Upside-down
                ctx.rotate(Math.PI);

                // Move origin back to 0,0 (now bottom-right corner)
                ctx.translate(-canvas.width / 2, -canvas.height / 2);

                // Draw Bottom Suit
                ctx.drawImage(suitImage, 24, 64, 48, 48);

                // Draw Bottom Symbol
                ctx.fillText(symbol, 32, 54);

                ctx.restore();

                this.front.material.map = new THREE.Texture(canvas);
                this.front.material.map.needsUpdate = true;
                // console.log(this.front.material.map);
                // console.log("done");
            }
        },
        rotate: function () {
            var lastRotation = this.el.getAttribute('rotation');
            // console.log(lastRotation);
            this.el.setAttribute('rotation', new THREE.Vector3(0, 0, 0));
            // console.log(this.el.getAttribute('rotation'));
        },
        unrotate: function() {
            var lastRotation = this.el.getAttribute('rotation');
            this.el.setAttribute('rotation', new THREE.Vector3(90, 0, 0));

        }
    });

    AFRAME.registerComponent('number-picker', {
        schema: {
            value: {type: 'number', default: 100},
            style: {type: 'string', default: 'horizontal'}
        },
        init: function () {
            let displayGeometry = new THREE.PlaneGeometry( 1, 1);
            let pickerGeometry = new THREE.Geometry();

            let pickerPoint0 = new THREE.Vector3(0, 0.5, 0);
            let pickerPoint1 = new THREE.Vector3(-0.5, 0, 0);
            let pickerPoint2 = new THREE.Vector3(0.5, 0, 0);
            let pickerTriangle = new THREE.Triangle(pickerPoint0, pickerPoint1, pickerPoint2);
            let displayMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
            let pickerMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
            let left, display, right;
            let leftElement = document.createElement('a-entity');
            let rightElement = document.createElement('a-entity');
            let data = this.data;
            let el = this.el;
            leftElement.addEventListener('mousedown', function() {
                data.value -= 1;
                el.setAttribute('text', {
                    width: 5,
                    color: '#000000',
                    align: 'center',
                    value: data.value.toString()
                });
            });

            rightElement.addEventListener('mousedown', function() {
                data.value += 1;
                el.setAttribute('text', {
                    width: 5,
                    color: '#000000',
                    align: 'center',
                    value: data.value.toString()
                });
            });

            pickerGeometry.vertices.push(pickerPoint0);
            pickerGeometry.vertices.push(pickerPoint1);
            pickerGeometry.vertices.push(pickerPoint2);
            pickerGeometry.faces.push(new THREE.Face3(0, 1, 2, pickerTriangle.normal()));

            left = new THREE.Mesh(pickerGeometry, pickerMaterial);
            display = new THREE.Mesh( displayGeometry, displayMaterial);
            right = new THREE.Mesh(pickerGeometry, pickerMaterial);

            leftElement.setObject3D('left', left);
            this.el.setObject3D('display', display);
            rightElement.setObject3D('right', right);

            this.el.appendChild(leftElement);
            this.el.appendChild(rightElement);

            if (this.data.style == 'horizontal') {
                left.position.set(-0.55, 0, 0);
                right.position.set(0.55, 0, 0);

                left.rotation.set(0, 0, Math.PI / 2);
                right.rotation.set(0, 0, -Math.PI / 2);
            } else if (this.data.style == 'vertical') {
                left.position.set(0,-0.55, 0);
                right.position.set(0, 0.55, 0);

                // left.rotation.set(0, 0, Math.PI / 2);
                left.rotation.set(0, 0, -Math.PI );
            }

            leftElement.className = 'clickable';
            rightElement.className = 'clickable';
        },
        update: function () {
            this.setValue();
        },
        setValue: function() {
            this.el.setAttribute('text', {
                width: 5,
                color: '#000000',
                align: 'center',
                value: this.data.value.toString()
            });
        }
    });


    AFRAME.registerComponent('button',{
        schema: {
            press: {type: 'string', default: ''},
            text: {type: 'string', default: 'Press'},
            color: {type: 'color', default: '#ADD8E6'}
        },
        init: function() {
            var data = this.data;
            this.el.addEventListener('click', function() {
                // console.log('clicked button');
                // console.log(data.press.substring(1, data.press.length - 1));
                // console.log(eval(data.press.substring(1, data.press.length - 1)));
                console.log(eval(data.press));
            });

            let geometry = new THREE.CylinderGeometry(1, 1, 1);
            let material = new THREE.MeshBasicMaterial( {color: this.data.color });
            let button = new THREE.Mesh(geometry, material);

            this.el.setObject3D('button', button);
            this.el.className += ' clickable';

            var text = document.createElement('a-entity');
            text.setAttribute('text', {
                width: 15,
                color: '#000000',
                align: 'center',
                value: this.data.text
            });

            text.setAttribute('position', new THREE.Vector3(0, 0.5, 0));
            text.setAttribute('rotation', new THREE.Vector3(-90, 0, 0));


            this.el.appendChild(text);
        },
    });

    AFRAME.registerComponent('button-panel', {
        schema: {
            values: {type: 'array', default: "Button1, Button2, Button3, 100"},
            functions: {type: 'array', default: ""},
            color: {type: 'color', default: '#8E236B'},
            widths: {type: 'array', default: "2, 2, 2, 1"},
            heights: {type: 'array', default: "1, 1, 1, 1"},
            borderWidth: {type: 'number', default: 0.1},
            borderHeight: {type: 'number', default: 0.1},
            elements: {type: 'array', default: "button, button, button, picker"}
        },
        init: function () {
            let startX = this.el.getAttribute('position').x;
            for (let i = 0; i < this.data.values.length; i++) {
                let width = parseInt(this.data.widths[i]);
                let height = parseInt(this.data.heights[i]);
                let text = this.data.values[i];
                let func = this.data.functions[i];
                switch(this.data.elements[i].toLowerCase()) {
                    case 'button':
                        this.createButton(startX, width, height, text, func);
                        break;
                    case 'picker':
                        this.createPicker(startX, width, height, text);
                        break;
                }
                if (i + 1 < this.data.values.length)
                    startX += width/2 + (parseInt(this.data.widths[i + 1])/2 + this.data.borderWidth/2);
            }
        },
        createButton: function(x, w, h, text, fn) {
            let position = this.el.getAttribute('position');
            let geometry = new THREE.PlaneGeometry(w, h);
            let material = new THREE.MeshBasicMaterial( this.data.color );
            let outlineMaterial = new THREE.MeshBasicMaterial( {color: 0x000000 });

            let button = new THREE.Mesh(geometry, material);
            let buttonOutline = new THREE.Mesh(geometry, outlineMaterial);

            let buttonEl = document.createElement('a-entity');

            buttonOutline.scale.set(1 + (w * this.data.borderWidth), 1 + (h * this.data.borderHeight), 1);
            buttonOutline.position.z = -0.01;
            // buttonOutline.rotation.y = Math.PI;
            buttonEl.setObject3D('button', button);
            buttonEl.setObject3D('outline', buttonOutline);
            buttonEl.className += ' clickable';
            buttonEl.setAttribute('position', new THREE.Vector3(x, 0, 0));
            buttonEl.setAttribute('text', {
                width: 5,
                color: '#000000',
                align: 'center',
                value: text
            });
            let el = this.el;
            buttonEl.addEventListener('click', function() {
                let self = el.components['button-panel'];
                console.log(self.getValue(4));
                // console.log(el);
                // console.log(el.components);
                // console.log('clicked button');
                // console.log(data.press.substring(1, data.press.length - 1));
                // console.log(eval(data.press.substring(1, data.press.length - 1)));
                // console.log(document.querySelector('#controls-0').getValue(4));
                // console.log("function was " + fn);
                // console.log(eval('this.el.getValue(4)'));
                console.log(fn);
                console.log(eval(fn));
            });
            this.el.appendChild(buttonEl);
        },
        createPicker: function(x, w, h, text) {
            let position = this.el.getAttribute('position');
            let geometry = new THREE.PlaneGeometry(w, h);
            let pickerGeometry = new THREE.Geometry();

            let material = new THREE.MeshBasicMaterial( this.data.color );
            let outlineMaterial = new THREE.MeshBasicMaterial( {color: 0x000000 });
            let pickerMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff /*, side: THREE.DoubleSide */} );

            let displayEl = document.createElement('a-entity');
            let upEl   = document.createElement('a-entity');
            let downEl = document.createElement('a-entity');
            let up, down, display, displayOutline;

            let pickerPoint0 = new THREE.Vector3(0, 0.5, 0);
            let pickerPoint1 = new THREE.Vector3(-0.5, 0, 0);
            let pickerPoint2 = new THREE.Vector3(0.5, 0, 0);
            let pickerTriangle = new THREE.Triangle(pickerPoint0, pickerPoint1, pickerPoint2);

            pickerGeometry.vertices.push(pickerPoint0);
            pickerGeometry.vertices.push(pickerPoint1);
            pickerGeometry.vertices.push(pickerPoint2);
            pickerGeometry.faces.push(new THREE.Face3(0, 1, 2, pickerTriangle.normal()));

            up = new THREE.Mesh(pickerGeometry, pickerMaterial);
            down = new THREE.Mesh(pickerGeometry, pickerMaterial);
            display = new THREE.Mesh(geometry, material);
            displayOutline = new THREE.Mesh(geometry, outlineMaterial);

            up.position.set(0, 0.55, 0);
            down.position.set(0, -0.55, 0);
            down.rotation.set(0, 0, -Math.PI);

            displayOutline.scale.set(1 + (w * this.data.borderWidth), 1 + (h * this.data.borderHeight), 1);
            displayOutline.position.z = -0.01;
            // displayOutline.rotation.y = Math.PI;
            displayEl.setObject3D('button', display);
            displayEl.setObject3D('outline', displayOutline);
            upEl.setObject3D('up', up);
            downEl.setObject3D('down', down);

            displayEl.className += ' clickable';
            upEl.className += ' clickable';
            downEl.className += ' clickable';
            displayEl.setAttribute('position', new THREE.Vector3(x, 0, 0));
            displayEl.setAttribute('text', {
                width: 5,
                color: '#000000',
                align: 'center',
                value: text
            });
            displayEl.appendChild(upEl);
            displayEl.appendChild(downEl);
            this.el.appendChild(displayEl);
        },
        getValue(index) {
            console.log(this.data.values);
            return this.data.values[index];
        }
    });

    AFRAME.registerComponent('chips',{
        schema: {
            value: {type: 'number', default: 0},
            blind: {type: 'number', default: 2},
            minimum: {type: 'number', default: 20}
        },
        chips: {
            1:    {color: 'ffffff', count: 0}, // white
            5:    {color: 'ff2400', count: 0},// red
            10:   {color: '0000ff', count: 0},// blue
            25:   {color: '00ff00', count: 0},// green
            50:   {color: 'ffa500', count: 0},// orange
            100:  {color: '000000', count: 0},// black
            250:  {color: 'ffb6c1', count: 0},// pink
            500:  {color: '551a8b', count: 0}, // purple
            1000: {color: 'ffff00', count: 0}, // yellow
            2000: {color: 'add8e6', count: 0}, // light blue
            5000: {color: 'a52a2a', count: 0} // brown
        },
        objectKeys: [],
        init: function() {
            this.loadChipDistribution();
            this.generateChips(0.1, 0.025);
        },
        update: function() {
            this.loadChipDistribution();
            this.generateChips(0.1, 0.025);
        },
        loadChipDistribution: function() {
            let chipValues = Object.keys(this.chips);
            let amountLeft = this.el.getAttribute('value');
            let chipCount = 10;
            let chipIndex = 0;

            while (amountLeft > 0) {
                let chip = chipValues[chipIndex];
                for (let i = 0; i < chipCount; i++) {
                    let newAmount = amountLeft - chip;
                    if (newAmount < 0) {
                        chipIndex = -1;
                        break;
                    } else {
                        this.chips[chip].count += 1; // Create chip
                        amountLeft = newAmount;
                        if (amountLeft == 0) break;
                    }
                    // console.log(i + " " + this.chips[chip].color);
                }
                chipIndex += 1;
            }

            // console.log(this.chips)
        },
        generateChips(r, h) {
            let val = this.el.getAttribute('value');
            console.log("generating " + val + " value of chips");
            for (let i = 0; i < this.objectKeys.length; i++) {
                this.el.removeObject3D(this.objectKeys[i]);
            }

            this.objectKeys = [];
            let directions = [[1, 1], [-2, 0], [-1, -1], [2, 0]];
            let shiftCount = 0;
            let shiftFactor = 1;
            let directionIndex = 0;
            let currentPosition = {x: 0, y: 0, z: 0};

            for (let chipValue in this.chips) {
                let chip = this.chips[chipValue];
                // console.log(currentPosition);
                // console.log(directionIndex);

                for (let i = 0; i < chip.count; i++) {
                    let geometry = new THREE.CylinderGeometry(r, r, h);
                    let material = new THREE.MeshBasicMaterial( {color: '#' + chip.color });
                    let chipMesh = new THREE.Mesh(geometry, material);
                    chipMesh.position.set(currentPosition.x, currentPosition.y, currentPosition.z);
                    // console.log(currentPosition);
                    let typeText = 'chip-' + chipValue + "-" + i;
                    this.objectKeys.push(typeText);
                    this.el.setObject3D(typeText, chipMesh);
                    currentPosition.y += h;
                    // console.log(i);
                }


                currentPosition.x += (0.75 * 2 * r * directions[directionIndex][0]);
                currentPosition.z += (0.75 * 2 * r * directions[directionIndex][1]);
                currentPosition.y = 0;

                shiftCount += 1;
                if (shiftCount == shiftFactor) {
                    if (directionIndex == 1 || directionIndex == 3) {
                        shiftFactor += 1;
                    }
                    shiftCount = 0;
                    directionIndex += 1;

                    if (directionIndex == directions.length) {
                        directionIndex = 0;
                    }
                }
            }
        },
        setAmount: function(x) {
            console.log(typeof x);
            console.log("Set amount " + x);
            this.el.setAttribute('value', x);
            console.log(this.el.getAttribute('value'));
            this.loadChipDistribution();
            this.generateChips(0.1, 0.025);
        }
    });
};


