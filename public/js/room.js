var AFRAME = require('aframe');
var client = require('../../app/clients/client.js');


function stringToVector(string) {
    var nums = string.split(' ');
    return {x: parseFloat(nums[0]), y: parseFloat(nums[1]), z: parseFloat(nums[2])};
}

function Room () {
    var player = document.querySelector('#player');
    var table = document.querySelector('#table');
    var cursor = document.querySelector('#cursor');
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
        },
        sitDown() {
            let player = document.querySelector('#player');

            console.log("Sitting down at seat #" + this.data);
            let position = this.el.getAttribute('position');
            let rotation = this.el.getAttribute('rotation');
            let playerHeight = player.getAttribute('position').y;
            let dealtCards = document.querySelector('#dealt-cards');
            let chips = document.querySelector('#chips-' + this.data);
            player.setAttribute('position', new THREE.Vector3(position.x,  playerHeight, position.z));
            player.setAttribute('rotation', new THREE.Vector3(rotation.x, rotation.y, rotation.z));
            dealtCards.setAttribute('rotation', new THREE.Vector3(rotation.x, rotation.y, rotation.z));
            chips.setAttribute('visible', true);
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
            if (this.data.suit != '' && this.data.symbol != '') {
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

                if (symbol == 'J' || symbol == 'Q' || symbol == 'K' || symbol == 'A' ||
                    (symbolNum != null && symbolNum >= 1 && symbolNum <= 10)) {
                }

                else {
                    return;
                }

                if (suit == 'spades' || suit == 'clubs') {
                    ctx.fillStyle = 'black';
                } else if (suit == 'hearts' || suit == 'diamonds') {
                    ctx.fillStyle = 'red';
                } else {
                    return;
                }

                ctx.font = "48px Symbol";

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
            }
        },
        rotate: function () {
            var lastRotation = this.el.getAttribute('rotation');
            this.el.setAttribute('rotation', new THREE.Vector3(0, 0, 0));
        },
        unrotate: function() {
            var lastRotation = this.el.getAttribute('rotation');
            this.el.setAttribute('rotation', new THREE.Vector3(90, 0, 0));

        }
    });

    AFRAME.registerComponent('game-rooms', {
        schema: {
            page: {type: 'number', default: 0},
            perPage: {type: 'number', default: 5}
        },
        raycaster: new THREE.Raycaster(),
        highlighted: null,
        rooms: null,
        init: function () {
            for (let i = 0; i < this.data.perPage; i++) {
                var geometry = new THREE.PlaneGeometry(8, 1);

                var material = new THREE.MeshBasicMaterial({ color: 0xffffff });

                var row = new THREE.Mesh(geometry, material);
                row.position.set(0, -i, 0);
                this.el.setObject3D('row-' + i, row);
            }

            let self = this;
            this.el.addEventListener('raycaster-intersected', function (event) {
                let intersection = event.detail.intersection;
                for (let i = 0; i < 5; i++) {
                    if (intersection.object == self.el.getObject3D('row-' + i)) {
                        self.highlight(i);
                        break;
                    }
                }
            });

            this.el.addEventListener('click', function(event) {
                let roomIndex = self.data.page * self.data.perPage + self.highlighted;
                if (self.highlighted != null) {
                    poker.join(200, roomIndex)
                }
            });

            this.el.addEventListener('raycaster-intersected-cleared', function() {
               self.unhighlight(self.el.highlighted);
            });

            this.updateRoomList();

            this.requestRoomsList();
        },
        tick: function() {
            let rooms = poker.getRooms();
            if (rooms) {
                this.el.setAttribute('visible', true);
                this.updateRoomList(rooms);
            }
        },
        requestRoomsList: function () {
            poker.requestRooms();
        },
        updateRoomList: function(rooms) {
            let roomKeys;
            if (rooms) {
                roomKeys = Object.keys(rooms);
                this.rooms = rooms;
            }
            else
                roomKeys = [];

            let start = this.data.page * this.data.perPage;
            // let end = start + this.data.perPage;
            for (let i = 0; i < this.data.perPage; i++) {
                var key = roomKeys[start + i];
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext("2d");
                canvas.width = 1024;
                canvas.height = 128;
                ctx.font = "48px Symbol";

                // Fill background
                ctx.fillStyle = '#efefe1';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = '#000000';
                if (!i)
                ctx.fillRect(0,0,1024,10);
                ctx.fillRect(0,118,1024,10);
                ctx.fillRect(0, 0, 10, 128);
                ctx.fillRect(1014, 0, 1024, 128);
                let row = this.el.getObject3D('row-' + i);
                if (i < roomKeys.length) {
                    let room = rooms[key];
                    // Draw Top Symbol
                    ctx.fillText(room['playerCount'] + '/' + room['maxPlayerCount'] + ' Players', 50, 64);
                    ctx.fillText(room['type'], 400, 64);
                    ctx.fillText(room['minimum'] + '-' + room['maximum'] + ' Buy In', 700, 64);
                    row.material.map = new THREE.Texture(canvas);
                    row.material.map.needsUpdate = true;
                } else {
                    // Draw Top Symbol
                    row.material.map = new THREE.Texture(canvas);
                    row.material.map.needsUpdate = true;
                }

            }
        },
        highlight: function(i) {
            if (this.highlighted == i) return;
            this.unhighlight();

            let roomIndex = this.data.page * this.data.perPage + i;
            let row = this.el.getObject3D('row-' + i);
            let keys = Object.keys(this.rooms);

            if (roomIndex < keys.length) {
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext("2d");
                canvas.width = 1024;
                canvas.height = 128;
                ctx.font = "48px Symbol";

                // Fill background
                ctx.fillStyle = '#A49480';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = '#000000';
                if (!i)
                    ctx.fillRect(0,0,1024,10);
                ctx.fillRect(0,118,1024,10);
                ctx.fillRect(0, 0, 10, 128);
                ctx.fillRect(1014, 0, 1024, 128);

                let room = this.rooms[keys[roomIndex]];
                // Draw Top Symbol
                ctx.fillText(room['playerCount'] + '/' + room['maxPlayerCount'] + ' Players', 50, 64);
                ctx.fillText(room['type'],400 , 64);
                ctx.fillText(room['minimum'] + '-' + room['maximum'] + ' Buy In', 700, 64);
                row.material.map = new THREE.Texture(canvas);
                row.material.map.needsUpdate = true;
                this.highlighted = i;
            }

        },
        unhighlight: function() {
            if (this.highlighted == null) return;
            let i = this.highlighted;
            let roomIndex = this.data.page * this.data.perPage + i;
            let row = this.el.getObject3D('row-' + i);
            let keys = Object.keys(this.rooms);

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            canvas.width = 1024;
            canvas.height = 128;
            ctx.font = "48px Symbol";

            // Fill background
            ctx.fillStyle = '#efefe1';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (roomIndex < keys.length) {
                ctx.fillStyle = '#000000';
                if (!i)
                    ctx.fillRect(0,0,1024,10);
                ctx.fillRect(0,118,1024,10);
                ctx.fillRect(0, 0, 10, 128);
                ctx.fillRect(1014, 0, 1024, 128);

                let room = this.rooms[keys[roomIndex]];
                // Draw Top Symbol
                ctx.fillText(room['playerCount'] + '/' + room['maxPlayerCount'] + ' Players', 50, 64);
                ctx.fillText(room['type'], 400, 64);
                ctx.fillText(room['minimum'] + '-' + room['maximum'] + ' Buy In', 700, 64);
            }
            row.material.map = new THREE.Texture(canvas);
            row.material.map.needsUpdate = true;
            this.highlighted = null;
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

                currentScale.x = currentScale.x / scale.x;
                currentScale.y = currentScale.y / scale.y;
                currentScale.z = currentScale.z / scale.z;

                currentEl = currentEl.parentNode;
            }

            var sceneScale = stringToVector(this.el.getAttribute('scene-scale'));
            if (sceneScale == null) sceneScale = {x: 1, y: 1, z: 1};
            var newScale = {x: sceneScale.x * currentScale.x, y: sceneScale.y * currentScale.y, z: sceneScale.z * currentScale.z};
            this.el.setAttribute('scale', newScale);
        },
        update: function () {
            this.setWorldScale();
        }
    });

    AFRAME.registerComponent('dealer', {
        schema: {
            seat: {type: 'number', default: -1}
        },
        card0: null,
        card1: null,
        dealt: [],
        messages: [['', 'white'], ['', 'white'], ['', 'white'], ['', 'white'], ['', 'white']],
        init: function() {
            let dealer = this;

            function addMessages(newMessages, colors) {
                for (let i = 0; i < newMessages.length; i++) {
                    dealer.messages.pop();
                    let color = colors && i < colors.length ? colors[i] : 'white';
                    dealer.messages.unshift([newMessages[i], color]);
                }


                for (let j = 0; j < dealer.messages.length; j++) {
                    let announcement = document.querySelector('#announcement-' + j);
                    let message = dealer.messages[j][0];
                    let color = dealer.messages[j][1];
                    announcement.setAttribute('text', {
                        opacity: j != 4 ? 1 : 0.5,
                        width: 5,
                        align: 'center',
                        value: message,
                        color: color
                    });
                }
            }

            poker.on('players\.\\d+', function() {
                let players = poker.state['players'];
                for (let playerSeat in players) {
                    let cardSpawn = document.querySelector('#card-spawn-' + playerSeat.toString());
                    let playerChips = document.querySelector('#chips-' + playerSeat.toString());
                    if (cardSpawn) {
                        playerChips.components['chips'].setAmount(poker.state.players[dealer.data.seat].cash);
                        cardSpawn.setAttribute('visible', true);
                        playerChips.setAttribute('visible', true);
                    }
                    playerChips = document.querySelector('#chips-' + playerSeat.toString());
                }
            });

            poker.on('seat', function() {
                console.log("hasChanged() - Seat has changed");
                if (dealer.data.seat != -1) return;

                let seat = poker.state['seat'];
                let chair = document.querySelector('#chair-' + seat.toString()).components.seat;

                dealer.data.seat = seat;
                chair.sitDown();
            });

            poker.on('hand', function() {
                console.log("hasChanged() - Hand has changed");
                let hand = poker.state['hand'];
                console.log(hand);
                if (hand.length != 0) {
                    let cards = document.querySelector('#cards-' + dealer.data.seat.toString());
                    cards.setAttribute('visible', true);
                    dealer.card0 = document.querySelector('#card-' + dealer.data.seat.toString() + '-0').components.card;
                    dealer.card1 = document.querySelector('#card-' + dealer.data.seat.toString() + '-1').components.card;

                    // console.log(this.card0);
                    dealer.card0.setCard(hand[0][0] == '0' ? '10' : hand[0][0], hand[0][1]);
                    dealer.card1.setCard(hand[1][0] == '0' ? '10' : hand[1][0], hand[1][1]);
                    dealer.card0.rotate();
                    dealer.card1.rotate();
                }
            });

            poker.on('dealt', function() {
                console.log("hasChanged() - Dealt has changed");
                let dealt = poker.state['dealt'];
                if (dealt.length == 0) {
                    let dealtElem0 = document.querySelector('#dealt-card-0');
                    let dealtElem1 = document.querySelector('#dealt-card-1');
                    let dealtElem2 = document.querySelector('#dealt-card-2');
                    let dealtElem3 = document.querySelector('#dealt-card-3');
                    let dealtElem4 = document.querySelector('#dealt-card-4');

                    dealtElem0.setAttribute('visible', false);
                    dealtElem1.setAttribute('visible', false);
                    dealtElem2.setAttribute('visible', false);
                    dealtElem3.setAttribute('visible', false);
                    dealtElem4.setAttribute('visible', false);
                }
                else if (dealt.length == 3) {
                    let dealtElem0 = document.querySelector('#dealt-card-0');
                    let dealtElem1 = document.querySelector('#dealt-card-1');
                    let dealtElem2 = document.querySelector('#dealt-card-2');
                    let dealt0 = dealtElem0.components.card;
                    let dealt1 = dealtElem1.components.card;
                    let dealt2 = dealtElem2.components.card;

                    dealt0.setCard(dealt[0][0], dealt[0][1]);
                    dealt1.setCard(dealt[1][0], dealt[1][1]);
                    dealt2.setCard(dealt[2][0], dealt[2][1]);

                    console.log(dealtElem0);
                    dealtElem0.setAttribute('visible', true);
                    dealtElem1.setAttribute('visible', true);
                    dealtElem2.setAttribute('visible', true);
                    console.log("Flop");
                }

                else if (dealt.length == 4) {
                    let dealtElem3 = document.querySelector('#dealt-card-3');
                    let dealt3 = dealtElem3.components.card;

                    dealt3.setCard(dealt[3][0], dealt[3][1]);

                    dealtElem3.setAttribute('visible', true);
                    console.log("Turn");

                }

                else if (dealt.length == 5) {
                    let dealtElem4 = document.querySelector('#dealt-card-4');
                    let dealt4 = dealtElem4.components.card;

                    dealt4.setCard(dealt[4][0], dealt[4][1]);

                    dealtElem4.setAttribute('visible', true);
                    console.log("River");

                }
            });

            poker.on('messages', function() {
                let newMessages = poker.state['messages'];
                console.log("Got a message: ");
                addMessages(newMessages);
            });

            poker.on('turn', function() {
                let turn = poker.state['turn'];
                let controls = document.querySelector('#controls-' + dealer.data.seat);

                if (turn == dealer.data.seat) {
                    controls.setAttribute('visible', true);
                    addMessages(['Your Turn!'], ['red']);
                }

                else {
                    controls.setAttribute('visible', false);
                    addMessages(['Player ' + turn + '\'s turn'], ['white'])
                }
            });
        },
        tick: function() {
            // if (poker.hasChanged()) {
                // console.log(poker.state);
            // }
            poker.processStateChanges();
        },
        update: function() {

        },
        reset: function() {
            this.card0 = null;
            this.card1 = null;
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
                // console.log(eval(data.press));
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

            let self = this;
            buttonEl.addEventListener('click', function() {
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
            let self = this;
            upEl.addEventListener('mousedown', function() {
                console.log(self.data.values[3]);
                self.data.values[3] = parseInt(self.data.values[3]) + 1;
                displayEl.setAttribute('text', {
                    width: 5,
                    color: '#000000',
                    align: 'center',
                    value: self.data.values[3].toString()
                });
            });

            downEl.addEventListener('mousedown', function() {
                self.data.values[3] = parseInt(self.data.values[3]) - 1;
                displayEl.setAttribute('text', {
                    width: 5,
                    color: '#000000',
                    align: 'center',
                    value: self.data.values[3].toString()
                });
            });
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
            return this.data.values[index];
        },
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
            this.generateChips(0.1, 0.025);
        },
        update: function() {
            this.generateChips(0.1, 0.025);
        },
        loadChipDistribution: function() {
            let chipValues = Object.keys(this.chips);
            let amountLeft = this.el.getAttribute('value');
            let chipCount = 10;
            let chipIndex = 0;

            while (amountLeft > 0) {
                let chip = chipValues[chipIndex];
                this.chips[chip].count = 0;
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
                }
                chipIndex += 1;
            }

        },
        generateChips(r, h) {
            let val = this.el.getAttribute('value');
            if (!val) return;

            this.loadChipDistribution();

            // console.log("generating chips with value of " + val);
            // console.log('this.objectKeys.length: ' + this.objectKeys.length);
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

                for (let i = 0; i < chip.count; i++) {
                    let geometry = new THREE.CylinderGeometry(r, r, h);
                    let material = new THREE.MeshBasicMaterial( {color: '#' + chip.color } );
                    let chipMesh = new THREE.Mesh(geometry, material);
                    chipMesh.position.set(currentPosition.x, currentPosition.y, currentPosition.z);
                    let typeText = 'chip-' + chipValue + "-" + i;
                    this.objectKeys.push(typeText);
                    this.el.setObject3D(typeText, chipMesh);
                    currentPosition.y += h;
                }

                currentPosition.x += (0.75 * 2 * r * directions[directionIndex][0]);
                currentPosition.y = 0;
                currentPosition.z += (0.75 * 2 * r * directions[directionIndex][1]);

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
            this.el.setAttribute('value', x);
            this.generateChips(0.1, 0.025);
        }
    });
}

module.exports = Room;


