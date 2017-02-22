// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
    var data = {};
    var controller = {
        init: function() {
            this.actions = "button";
            this.state = false;
            this.level = 0;
            this.StrictMode = false;
            this.moves = {
                user: [],
                pc: []
            };
            //set interval to check value
            this.playInterval = 6000;
            view.init();
        },
        power: function(v) {
            this.state = v;
            this.position = -1;

            if (this.state) {
                this.screenOn();
                this.turn = 0
                view.enableDail();
            }
        },
        sound: function(key) {
            switch (key) {
            case 1:
                var audio = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3');
                audio.play();
                break;
            case 2:
                var audio = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3');
                audio.play();
                break;
            case 3:
                var audio = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3');
                audio.play();
                break;
            case 4:
                var audio = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3');
                audio.play();
                break;
            default:
                var audio = new Audio('https://cdn.gomix.com/d7877e8a-d25e-4f15-971f-e734fd29458d%2FWrong-answer-sound-effect%20(1).mp3');
                audio.play();
            }
        },
        initGame: function(randomPlay) {
            setTimeout(function() {
                if (controller.state) {
                    //generate play
                    var randomPlay = controller.generatePlay();
                    //save play
                    controller.moves.pc.push(randomPlay);
                    //updated display
                    view.setScreen(controller.level);
                    //make play
                    controller.makeMove();
                }
            }, 2000);

        },
        makeMove: function() {
            this.turn = 0

            var moves = this.moves.pc;

            if (moves.length > 0) {

                var sequence = Promise.resolve()

                for (var i = 0; i < moves.length; i++) {
                    (function() {
                        // define closure to capture i at each step of loop
                        var capturedindex = i
                        sequence = sequence.then(function() {
                            return controller.displayPlay(moves[capturedindex])
                        }).then(function() {
                            console.log('removeClass' + i + ' ' + Math.random());
                            // ready for user to play
                            console.log('users turn')

                        }).catch(function(err) {
                            console.log('Error ' + err)
                        })
                    }())
                    // invoke closure function immediately
                }
                ;sequence = sequence.then(function() {
                    return new Promise(function(resolve, reject) {
                        controller.turn = 1;
                        view.setWarningNotice("")
                        view.setInfoNotice(" Your Turn!")
                        resolve();
                    }
                    );
                });
            }

            this.countdown = setTimeout(function() {
                if (controller.moves.user.length < 1) {
                    controller.checkPlay(true);
                }
            }, (1000 * controller.moves.pc.length) + controller.playInterval);
        },
        clearCountdown: function() {
            clearTimeout(this.countdown);
        },
        checkPlay: function(nodata) {
            console.log('...checking')
            //clear timer
            this.clearCountdown();

            var userMoves = this.moves.user;
            var pcMoves = this.moves.pc.slice(0, userMoves.length);
            var position = this.position;

            if (this.moves.pc[position] !== this.moves.user[position] || nodata == true) {

                console.log('moves dont match', this.moves.pc[position], this.moves.user[position]);

                // play annoying buzz sound
                this.sound(null);
                //alert on screen
                view.setScreen("!!");
                //replay move
                if (nodata) {
                    view.setWarningNotice("Times up, Try again")
                    view.setInfoNotice("")
                } else {
                    view.setWarningNotice("Wrong button, try again!")
                    view.setInfoNotice("")

                }
                setTimeout(function() {
                    if (controller.StrictMode == true) {
                        console.log("strict mode")
                        controller.moves.user = [];
                        controller.moves.pc = [];
                        controller.level = 0;
                        controller.position = -1;
                        controller.initGame();

                    } else {
                        view.setScreen(controller.level);
                        controller.position = -1;
                        controller.moves.user = [];
                        controller.makeMove();
                    }
                }, 500)

            } else {
                //check if next entry is available
                controller.sound(this.moves.user[position])
                if (this.moves.pc[position + 1] == undefined) {
                    view.setInfoNotice("");
                    view.setWarningNotice("");
                    setTimeout(function() {
                        controller.moves.user = [];
                        this.position = -1;
                        this.level += 1;
                        controller.initGame();
                    });
                }
            }
        },
        displayPlay: function(v) {
            return new Promise(function(resolve, reject) {
                view.updateDail('#pos' + v)
                controller.sound(v)
                setTimeout(function() {
                    $('.dail').removeClass('active');
                }, 500);
                setTimeout(function() {
                    resolve();
                }, 1000);
            }
            )
        },
        userEntry: function(v) {

            this.moves.user.push(v);
            this.position = this.position + 1;
            setTimeout(function() {
                $('.dail').removeClass('active');
                controller.checkPlay(false)
            }, 500);
        },
        generatePlay: function() {
            return Math.ceil(Math.random() * 4);
        },
        screenOn: function() {
            view.setScreen('__');
        },
        getActionButtons: function() {
            return this.actions;
        },
        setStrictMode: function(state) {
            this.StrictMode = state;
        }

    };
    var view = {
        init: function() {
            this.actions()
            this.screenId = "#display";
            this.noticewarning = ".notice.warning";
            this.noticeinfo = ".notice.info";
            view.setScreen();
        },
        actions: function() {
            $(view.getActionButtons()).on('click', function(e) {
                console.log(e.target.id)

                switch (e.target.id) {
                case "state":
                    var elem = $('#' + e.target.id);
                    if (elem.hasClass('off')) {
                        controller.power(true);
                        $('#' + e.target.id).removeClass('off').addClass('on')
                    } else {
                        controller.power(false)
                        $('#' + e.target.id).removeClass('on').addClass('off');
                        view.setScreen("");

                    }
                    break;
                case "start":
                    var elem = $('#' + e.target.id);
                    view.setInfoNotice("")
                    view.setWarningNotice("")
                    controller.level = 0;
                    controller.moves = {
                        user: [],
                        pc: []
                    };
                    controller.clearCountdown();
                    controller.initGame();
                    break;
                case "strict":
                    if (controller.state) {
                        var elem = $('#' + e.target.id);
                        controller.moves = {
                            user: [],
                            pc: []
                        };
                        if (elem.hasClass('off')) {
                            $('#' + e.target.id).removeClass('off').addClass('on')
                            controller.setStrictMode(true);
                        } else {
                            $('#' + e.target.id).removeClass('on').addClass('off');
                            controller.setStrictMode(false);
                        }
                    }
                    break;
                }
            })
        },
        enableDail: function() {
            console.log('enable dail');
            console.log(controller.turn);
            $('.board a').on('click', function() {
                if (controller.turn == 1) {
                    $(this).find('.dail').addClass('active');
                    controller.userEntry($(this).data('pos'));
                }
            });
        },
        disableDail: function() {
            $('.board a').attr('disabled', 'disabled');
        },
        updateDail: function(id) {
            $(id).find('.dail').addClass('active');
        },
        setScreen: function(v) {
            $(this.screenId).val(v);
        },
        setWarningNotice: function(v) {
            $(this.noticewarning).text(v);
        },
        setInfoNotice: function(v) {
            $(this.noticeinfo).text(v);
        },
        getActionButtons: function() {
            return controller.getActionButtons();
        }

    };
    controller.init();
});
