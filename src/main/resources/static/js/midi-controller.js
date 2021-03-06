var midiApp = angular.module('MidiApp', [])

midiApp.controller('scale-controller', function($scope, $http) {
    $scope.user;

    $scope.maxScaleLevel;
    $scope.currentScale;
    $scope.currentScaleLevel;
    $scope.allScales;
    $scope.scaleScoring = [null, null, null, null, null, null, null, null, null, null];

    $scope.filter;
    $scope.currentAnswer;

    const VF = Vex.Flow;
    $scope.playCounter = 3;


    $scope.onPageLoad = function() {
            $scope.getUser();
    };

    $scope.onGameLoad = function() {
        $http.post("/getUserFromSession.json")
        .then(
            function successCallBack (response) {
                var everything = response.data;
                $scope.user = everything.user;
                $scope.maxScaleLevel = everything.scaleLevel;
                $scope.currentScaleLevel = everything.user.currentScaleLevel;
                $http.post("/getListOfCurrentScales.json", $scope.user)
                .then (
                    function successCallBack(response) {
                        console.log("Received list of scales");
                        $scope.allScales = response.data.myScales;
                        $scope.scaleUserInput();
                    },
                    function errorCallBack(response) {
                        console.log("Unable to get scales");
                    });
            })
    };


    $scope.getUser = function () {
        console.log("getting user from session");
        $http.post("/getUserFromSession.json")
        .then(
            function successCallBack(response) {
                console.log(response.data);
                var everything = response.data;
                $scope.user = everything.user;
                $scope.maxScaleLevel = everything.scaleLevel;
                $scope.currentScaleLevel = everything.user.currentScaleLevel;

                $scope.getListOfScales();
            },
            function errorCallBack(response) {
                console.log("unable to get user");
            });
    };

    $scope.setCurrentScaleLevel = function(scaleLevel) {
        console.log("Setting scale level for user");
        $scope.user.currentScaleLevel = scaleLevel;
        $http.post("/getDesiredScaleLevel.json", $scope.user)
        .then (
            function successCallBack(response) {
                console.log("User updated");
                $scope.currentScaleLevel = response.data;
            },
            function errorCallBack(response) {
                console.log("Unable to update user");
            });
    };

    $scope.getScale = function() {
        console.log("Getting scale");
        $http.post("/getScale.json", $scope.user.currentScaleLevel)
        .then(
            function successCallBack(response) {
                console.log(response.data);
                $scope.currentScale = response.data;
                console.log($scope.currentScale);
            },
            function errorCallBack(response) {
                console.log("Unable to receive scale");
            });
    };

    $scope.scaleUserInput = function() {
    $scope.currentAnswer = null;
    var element;
    element = document.getElementById("boo");
    if (element) {
        element.innerHTML = "";

        $http.post("/getScaleLevel.json", $scope.user)
        .then(function successCallBack(res){
          console.log(res);
          $scope.currentScaleLevel = res.data;
          $http.post("getScale.json", $scope.currentScaleLevel).then(function successCallBack(res){
          $scope.currentScale = res.data;
           var vf = new VF.Factory({renderer: {selector: 'boo'}});
           var score = vf.EasyScore();
           var system = vf.System();
           console.log($scope.currentScale);
           var startNote = teoria.note($scope.currentScale.note + $scope.currentScale.octave);
           console.log(startNote);
           system.addStave({
               voices:[score.voice(score.notes(/*$scope.currentScale.note + $scope.currentScale.octave*/ startNote + '/w'))]
           }).addClef('treble').addTimeSignature('4/4');

           vf.draw();
          }, function errorCallBack(err){
            console.log(err);
          })

        },function errorCallBack(err){
          console.log(err);
        });
        };
    };

    $scope.drawScaleAnswer = function (){
        var initialNote = teoria.note($scope.currentScale.note + $scope.currentScale.octave);
        console.log(initialNote.toString());
        var myScale = initialNote.scale($scope.currentScale.scale);
        console.log(myScale);
        var scaleNotes = [];

        for (var count = 0; count < myScale.scale.length; count++) {
            var newNote = teoria.interval(initialNote, myScale.scale[count]);
//            console.log(newNote.toString());
            scaleNotes.push(newNote);
        }
        var octave = teoria.interval(initialNote, 'P8');
        console.log(octave.toString());
        scaleNotes.push(octave);

        var noteString = scaleNotes[0] + "/q";
        for (var count = 0; count < scaleNotes.length -1; count++) {
            noteString = noteString + ", " + scaleNotes[count +1];
//            console.log(noteString);
        }

       var element;
       element = document.getElementById("boo");
       if (element) {
           element.innerHTML = "";

            console.log(noteString);

            var vf = new VF.Factory({renderer: {selector: 'boo'}});
            var score = vf.EasyScore();
            var system = vf.System();
            if (scaleNotes.length > 6) {

                var first = scaleNotes[0] + "/8, " + scaleNotes[1];
                var second = scaleNotes[2] + "/8, " + scaleNotes[3];
                var third = scaleNotes[4] + "/8, " + scaleNotes[5];
                var fourth = scaleNotes[6] + "/8, " + scaleNotes[7];

                console.log("Before drawing answer");
                system.addStave({voices:[
                    score.voice(
                        score.beam(
                            score.notes(first), {autoStem: true})
                                .concat(score.beam(score.notes(second), {autoStem: true}))
                                .concat(score.beam(score.notes(third), {autoStem: true}))
                                .concat(score.beam(score.notes(fourth), {autoStem: true}))
                        )
                    ]
                }).addClef('treble').addTimeSignature('4/4');
                console.log("After drawing answer");
                vf.draw();
            } else {
                var first = scaleNotes[0] + "/q, " + scaleNotes[1] + ", " + scaleNotes[2];
                var second = scaleNotes[3] + "/q, " + scaleNotes[4] + ", " + scaleNotes[5];
                console.log(first);
                console.log(second);

                system.addStave({voices:[
                    score.voice(
                        score.tuplet(
                                score.notes(first))
                                .concat(score.tuplet(score.notes(second)))
                        )
                    ]
                }).addClef('treble').addTimeSignature('4/4');
                vf.draw();

            }
        }

    };

    $scope.playScale = function() {
        var initialNote = teoria.note($scope.currentScale.note + $scope.currentScale.octave);
        console.log(initialNote.toString());
        var myScale = initialNote.scale($scope.currentScale.scale);
        console.log(myScale);
        var scaleFreq = [];

        for (var count = 0; count < myScale.scale.length; count++) {
            var newNote = teoria.interval(initialNote, myScale.scale[count]);
            newNote = newNote.fq();
            console.log(newNote);
            scaleFreq.push(newNote);
        };
        console.log(scaleFreq);

        var Synth = function(audiolet, frequency) {
            AudioletGroup.apply(this, [audiolet, 0, 1]);

            this.audiolet = new Audiolet();
            this.sine = new Sine(this.audiolet, frequency);
            this.modulator = new Saw(this.audiolet, 2 * frequency);
            this.modulatorMulAdd = new MulAdd(this.audiolet, frequency/2, frequency);

            this.gain = new Gain(this.audiolet);
            this.envelope = new PercussiveEnvelope(this.audiolet, 1, 0.2, 0.5,
                function() {
                    this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
                }.bind(this)
                );

            this.modulator.connect(this.modulatorMulAdd);
            this.modulatorMulAdd.connect(this.sine);
            this.envelope.connect(this.gain, 0, 1);
            this.sine.connect(this.gain);
            this.gain.connect(this.outputs[0]);

        };

        var AudioletApp = function() {
            this.audiolet = new Audiolet();
            if ($scope.currentScale.scale == "major") {
                var audioScale = new MajorScale();
            } else if ($scope.currentScale.scale == "minor") {
                 var audioScale = new MinorScale();
            } else if($scope.currentScale.scale === "dorian") {
                var DorianScale = function() {
                    var degrees = [0, 2, 3, 5, 7, 9, 10];
                    Scale.call(this, degrees);
                }
                extend(DorianScale, Scale);
                audioScale = new DorianScale();
            } else if($scope.currentScale.scale === "phrygian") {
                var PhrygianScale = function() {
                    var degrees = [0, 1, 3, 5, 7, 8, 10];
                    Scale.call(this, degrees);
                }
                extend(PhrygianScale, Scale);
                audioScale = new PhrygianScale();
            } else if($scope.currentScale.scale === "lydian") {
                var LydianScale = function() {
                    var degrees = [0, 2, 4, 6, 7, 9, 11];
                    Scale.call(this, degrees);
                }
                extend(LydianScale, Scale);
                audioScale = new LydianScale();
            } else if ($scope.currentScale.scale === "mixolydian") {
                var MixolydianScale = function() {
                    var degrees = [0, 2, 4, 5, 7, 9, 10];
                    Scale.call(this, degrees);
                }
                extend(MixolydianScale, Scale);
                audioScale = new MixolydianScale;
            } else if ($scope.currentScale.scale === "locrian") {
                var LocrianScale = function() {
                    var degrees = [0, 1, 3, 5, 6, 8, 10];
                    Scale.call(this, degrees);
                }
                extend(LocrianScale, Scale);
                audioScale = new LocrianScale();
            } else if ($scope.currentScale.scale === "majorpentatonic") {
                var MajorPentatonicScale = function() {
                    degrees = [0, 2, 4, 7, 9];
                    Scale.call(this, degrees);
                }
                extend(MajorPentatonicScale, Scale);
                audioScale = new MajorPentatonicScale();
            } else if ($scope.currentScale.scale === "minorpentatonic") {
                var MinorPentatonicScale = function() {
                    degrees = [0, 3, 5, 7, 10];
                    Scale.call(this, degrees);
                }
                extend(MinorPentatonicScale, Scale);
                audioScale = new MinorPentatonicScale();
            }
            var baseFrequency = scaleFreq[0];
            var octave = 0;
            var freq1 = audioScale.getFrequency(0, baseFrequency, octave);
            var freq2 = audioScale.getFrequency(1, baseFrequency, octave);
            var freq3 = audioScale.getFrequency(2, baseFrequency, octave);
            var freq4 = audioScale.getFrequency(3, baseFrequency, octave);
            var freq5 = audioScale.getFrequency(4, baseFrequency, octave);
            var freq6 = audioScale.getFrequency(5, baseFrequency, octave);
            var freq7 = audioScale.getFrequency(6, baseFrequency, octave);
            var freq8 = audioScale.getFrequency(7, baseFrequency, octave);


            var note = new PSequence([440]);

            if($scope.currentScale.scale === "majorpentatonic" || $scope.currentScale.scale === "minorpentatonic") {
                var frequencyPattern = new PSequence([freq1, freq2, freq3, freq4, freq5, freq6], 1);
            }else {
                var frequencyPattern = new PSequence([freq1, freq2, freq3, freq4, freq5, freq6, freq7, freq8], 1);
            }
                var durationPattern = new PChoose([new PSequence([1])], Infinity);

            this.audiolet.scheduler.play([frequencyPattern], durationPattern,
                function(frequency) {
                    var synth = new Synth(this.audiolet, frequency);
                    synth.connect(this.audiolet.output);
                }.bind(this)
                );
        };
        extend (Synth, AudioletGroup);
        this.audioletApp = new AudioletApp();

        $scope.playCounter--;
    };

    $scope.checkScaleAnswer = function(scaleName) {
    console.log(scaleName);
    console.log($scope.currentScale.scale);
        if(scaleName == null){
            console.log("You need to input an answer!");
        } else if ($scope.currentScale.scale === scaleName) {
            console.log("You are the greetest!");
            if ($scope.scaleScoring.length < 10) {
                $scope.scaleScoring.unshift(true);
                $scope.currentAnswer = true;
            } else {
                $scope.scaleScoring.pop();
                $scope.scaleScoring.unshift(true);
                $scope.currentAnswer = true;
            }
        $scope.drawScaleAnswer();
        } else {
            console.log("Blargh");
            if ($scope.scaleScoring.length < 10) {
                $scope.scaleScoring.unshift(false);
                $scope.currentAnswer = false;
            } else {
                $scope.scaleScoring.pop();
                $scope.scaleScoring.unshift(false);
                $scope.currentAnswer = false;
            }
        $scope.drawScaleAnswer();
        }
        function isTrue(value) {
            return value === true;
        };
        console.log($scope.scaleScoring);
        $scope.filter = $scope.scaleScoring.filter(isTrue);
        console.log($scope.filter);
        sessionStorage.setItem('scalePoints', JSON.stringify($scope.scaleScoring));
    };

    $scope.getSession = function() {
        $scope.scaleScoringSession = sessionStorage.getItem('scalePoints');
        if ($scope.scaleScoringSession !== null) {
            $scope.scaleScoring = JSON.parse($scope.scaleScoringSession);
            function isTrue(value) {
                return value === true;
            };
            console.log($scope.scaleScoring);
            $scope.filter = $scope.scaleScoring.filter(isTrue);
        }
    };


    $scope.getListOfScales = function() {
        console.log("Getting list of scales...");
        $http.post("/getListOfCurrentScales.json", $scope.user)
        .then (
            function successCallBack(response) {
                console.log("Received list of scales");
                $scope.allScales = response.data.myScales;
            },
            function errorCallBack(response) {
                console.log("Unable to get scales");
            });
    };

    $scope.nextScaleLevel = function() {
        console.log("Moving to level " + ($scope.maxScaleLevel.levelNumber + 1) + " from " + $scope.maxScaleLevel.levelNumber);
        $http.post("/nextScaleLevel.json", $scope.user)
        .then(
            function successCallBack(response) {
                console.log("We're moving on~~~");
                $scope.maxScaleLevel = response.data;
                console.log($scope.maxScaleLevel);
                $scope.filter = [];
                $scope.scaleScoring = [null, null, null, null, null, null, null, null, null, null];
            },
            function errorCallBack(response) {
                console.log("Could not move to next level");
            });
    };
    $scope.getSession();
});

midiApp.controller('midi-controller', function($scope, $http) {

    $scope.userStatus;
    $scope.user;

    $scope.maxIntervalLevel;
    $scope.currentIntervalLevel
    $scope.initialInterval;
    $scope.allIntervals
    $scope.intervalScoring = [null, null, null, null, null, null, null, null, null, null];

    $scope.isLive = false;
    $scope.filter;
    $scope.currentAnswer;

    const VF = Vex.Flow;
    $scope.frequencies = {};
    $scope.nextNote;
    $scope.playCounter = 3;

    $scope.onPageLoad = function() {
            $scope.getUser();
    };

    $scope.onGameLoad = function() {
        $http.post("/getUserFromSession.json")
        .then(
            function successCallBack(response) {
                var everything = response.data;
                $scope.user = everything.user;
                $scope.maxIntervalLevel = everything.intervalLevel;
                $scope.currentIntervalLevel = everything.user.currentIntervalLevel;
                $scope.getListOfIntervals();
                $http.post("/getListOfIntervals.json", $scope.user)
                .then(
                    function successCallBack(response){
                        console.log("For real getting things");
                        var allIntervals = response.data;
                        $scope.allIntervals = allIntervals.myIntervals;
                        $scope.userInput();
                    },
                    function errorCallBack(response) {
                        console.log("Unable to get intervals");
                    });

            });
    };

    $scope.login = function(loginContainer) {
        console.log(loginContainer);
        $http.post("/login.json", loginContainer)
        .then (
            function successCallBack(response) {
                console.log(response.data);
                console.log("logging in...");
                var userStatus = response.data;
                $scope.userStatus = userStatus;
                if ($scope.userStatus.userStatus == null) {
                console.log(userStatus.errorMessage);
                } else {
                $scope.user = $scope.userStatus.userStatus.user;
                $scope.maxIntervalLevel = $scope.userStatus.userStatus.intervalLevel;

                $scope.isLive = true;
                sessionStorage.setItem('userStatus', JSON.stringify($scope.userStatus));
                }
            },
            function errorCallBack(response) {
                console.log("Unable to log in");
            });
         console.log("done with callback");
    };

    $scope.register = function(registerContainer) {
        console.log(registerContainer);
        $http.post("/register.json", registerContainer)
        .then(
            function successCallBack(response) {
                console.log(response.data);
                console.log("Registering...");
                $scope.user = response.data;
                $scope.isLive = true;
            },
            function errorCallBack(response) {
                console.log("Unable to register");
            });
         console.log("done with callback");
    };

    $scope.logout = function () {
        sessionStorage.clear();
        $scope.isLive = false;
    }

    $scope.getUser = function () {
        console.log("getting user from backend");
        $http.post("/getUserFromSession.json")
        .then(
            function successCallBack(response) {
                console.log(response.data);
                var everything = response.data;
                $scope.user = everything.user;
                $scope.maxIntervalLevel = everything.intervalLevel;
                $scope.currentIntervalLevel = everything.user.currentIntervalLevel;

                $scope.getListOfIntervals();
            },
            function errorCallBack(response) {
                console.log("unable to get user");
            });
    };

    $scope.getIntervalLevel = function() {
        console.log("getting Intervals level");
        console.log($scope.user);
        $http.post("/getIntervalLevel.json", $scope.user)
        .then(
            function successCallBack(response) {
                console.log(response.data);
                $scope.intervalLevel = response.data;
                console.log($scope.intervalLevel);
            },
            function errorCallBack(response) {
                console.log("Could not return level");
            });
    };

    $scope.setCurrentIntervalLevel = function(intLevel) {
        console.log("setting interval level for user");
        $scope.user.currentIntervalLevel = intLevel;
        console.log($scope.user);
        $http.post("/getDesiredLevel.json", $scope.user)
        .then(
            function successCallBack(response) {
                console.log("User updated");
                $scope.currentIntervalLevel = response.data;
                $scope.user.currentIntervalLevel = response.data.levelNumber;
                console.log($scope.currentIntervalLevel);
                sessionStorage.setItem('currentIntervalLevel', JSON.stringify($scope.currentIntervalLevel));
            },
            function errorCallBack(response) {
                console.log("unable to update user");
            });
    };


    $scope.getInitialInterval = function() {
        console.log("Getting initial interval");

        $http.post("/getInterval.json", $scope.currentIntervalLevel)
        .then (
            function successCallBack(response) {
                console.log(response.data);
                $scope.initialInterval = response.data;
                console.log($scope.initialInterval);
            },
            function errorCallBack(response) {
                console.log(response);
                console.log("Unable to receive initial interval");
            });
    };

    $scope.userInput = function() {
    $scope.currentAnswer = null;
    var element;
    element = document.getElementById("boo");
    if (element) {
        element.innerHTML = "";

        $http.post("/getIntervalLevel.json", $scope.user)
        .then(function successCallBack(res){
          console.log(res);
          $scope.currentIntervalLevel = res.data;
          console.log($scope.user);
          console.log($scope.currentIntervalLevel);
          $http.post("getInterval.json", $scope.currentIntervalLevel).then(function successCallBack(res){
          $scope.initialInterval = res.data;
           var vf = new VF.Factory({renderer: {selector: 'boo'}});
           var score = vf.EasyScore();
           var system = vf.System();
           console.log($scope.initialInterval);
           system.addStave({
               voices:[score.voice(score.notes($scope.initialInterval.note + $scope.initialInterval.octave + '/w'))]
           }).addClef('treble').addTimeSignature('4/4');

           vf.draw();
          }, function errorCallBack(err){
            console.log(err);
          })

        },function errorCallBack(err){
          console.log(err);
        });
        };
    };

    $scope.drawIntervalAnswer = function() {
        var initialNote = teoria.note($scope.initialInterval.note + $scope.initialInterval.octave);
        var secondNote = teoria.interval(initialNote, $scope.initialInterval.interval);
//        console.log(initialNote.toString());
//        console.log(secondNote.toString());
        var intervalAnswer = initialNote + "/h, " + secondNote;
//        console.log(intervalAnswer);

        var element;
        element = document.getElementById("boo");
        if (element) {
            element.innerHTML = "";

            var vf = new VF.Factory({renderer: {selector: 'boo'}});
            var score = vf.EasyScore();
            var system = vf.System();
            system.addStave({voices:[
                score.voice(
                    score.notes(intervalAnswer))
                ]
            }).addClef('treble').addTimeSignature('4/4');
            vf.draw();
        }

    };

    $scope.playInterval = function() {
        console.log($scope.initialInterval.note + $scope.initialInterval.octave);
        var noteOut = teoria.note($scope.initialInterval.note + $scope.initialInterval.octave);
        var nextNote = noteOut.interval($scope.initialInterval.interval);
        $scope.nextNote = nextNote.toString();
        console.log(noteOut);
        console.log(nextNote.toString());
        var freq1 = noteOut.fq();
        var freq2 = nextNote.fq();
        console.log("Note 1 freq=" + freq1 + "; Note 2 freq=" + freq2);
        $scope.a4 = noteOut.fq();
        $scope.frequencies = {
            freq1: freq1,
            freq2: freq2
         };
         console.log($scope.frequencies);


        var Synth = function(audiolet, frequency) {
            AudioletGroup.apply(this, [audiolet, 0, 1]);

            this.audiolet = new Audiolet();
            this.sine = new Sine(this.audiolet, frequency);
            this.modulator = new Saw(this.audiolet, 2 * frequency);
            this.modulatorMulAdd = new MulAdd(this.audiolet, frequency/2, frequency);

            this.gain = new Gain(this.audiolet);
            this.envelope = new PercussiveEnvelope(this.audiolet, 1, 0.2, 0.5,
                function() {
                    this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
                }.bind(this)
                );

            this.modulator.connect(this.modulatorMulAdd);
            this.modulatorMulAdd.connect(this.sine);
            this.envelope.connect(this.gain, 0, 1);
            this.sine.connect(this.gain);
            this.gain.connect(this.outputs[0]);

        };

        var AudioletApp = function() {
            this.audiolet = new Audiolet();
            //trying scales
            var interval = new PSequence([$scope.frequencies.freq1, $scope.frequencies.freq2]);

            var durationPattern = new PChoose([new PSequence([2])], Infinity);
            var frequencyPattern = new PSequence([interval], 1);

            this.audiolet.scheduler.play([frequencyPattern], durationPattern,
                function(frequency) {
                    var synth = new Synth(this.audiolet, frequency);
                    synth.connect(this.audiolet.output);
                }.bind(this)
                );
        };

        extend (Synth, AudioletGroup);
        this.audioletApp = new AudioletApp();
        $scope.playCounter--;
    };

    $scope.checkAnswer = function(noteInterval) {
    console.log(noteInterval);
    console.log($scope.initialInterval.interval);
        if(noteInterval == null){
            console.log("You need an answer!");
        } else if ($scope.initialInterval.interval === noteInterval) {
            console.log("You are the greetest!");
            if ($scope.intervalScoring.length < 10) {
                $scope.intervalScoring.unshift(true);
                $scope.currentAnswer = true;
            } else {
                $scope.intervalScoring.pop();
                $scope.intervalScoring.unshift(true);
                $scope.currentAnswer = true;
            }
         $scope.drawIntervalAnswer();
        } else {
            console.log("Blargh");
            if ($scope.intervalScoring.length < 10) {
                $scope.intervalScoring.unshift(false);
                $scope.currentAnswer = false;
            } else {
                $scope.intervalScoring.pop();
                $scope.intervalScoring.unshift(false);
                $scope.currentAnswer = false;
            }
        $scope.drawIntervalAnswer();
        }
        function isTrue(value) {
            return value === true;
        };
        console.log($scope.intervalScoring);
        $scope.filter = $scope.intervalScoring.filter(isTrue);
        console.log($scope.filter);
        sessionStorage.setItem('intervalPoints', JSON.stringify($scope.intervalScoring));
    };


    $scope.getSession = function() {
        $scope.intervalScoringSession = sessionStorage.getItem('intervalPoints');
        if ($scope.intervalScoringSession !== null) {
            $scope.intervalScoring = JSON.parse($scope.intervalScoringSession);
            function isTrue(value) {
                return value === true;
            };
            $scope.filter = $scope.intervalScoring.filter(isTrue);
            $scope.isLive = true;
            console.log($scope.isLive);
        }
    };

    $scope.getSession();

    $scope.checkNoteName = function(noteNotation) {
        console.log(noteNotation);
        console.log($scope.nextNote);
        if ($scope.nextNote === noteNotation) {
            console.log("A winrar is you!");
        } else {
            console.log("I'm sorry, but you're wrong.");
        }
    };

    $scope.nextIntervalLevel = function() {
        console.log("Moving to level " + ($scope.intervalLevel.levelNumber + 1) + " from " + $scope.intervalLevel);
        $http.post("/nextIntervalLevel.json", $scope.user)
        .then(
            function successCallBack(response) {
                console.log("We're moving on~~~");
                $scope.intervalLevel = response.data;
                console.log($scope.intervalLevel);
                $scope.filter = [];
                $scope.intervalScoring = ["blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank"];
            },
            function errorCallBack(response) {
                console.log("Could not move to next level");
            });
    };

    $scope.getListOfIntervals = function() {
        console.log("Getting all of the intervals for your level");
        $http.post("/getListOfIntervals.json", $scope.user)
        .then(
            function successCallBack(response){
                console.log("For real getting things");
                var allIntervals = response.data;
                $scope.allIntervals = allIntervals.myIntervals;
            },
            function errorCallBack(response) {
                console.log("Unable to get intervals");
            });
    };

});


midiApp.controller('chord-controller', function($scope, $http) {

    $scope.playChords = function(chord) {
        var Synth = function(audiolet, frequency) {
            AudioletGroup.call(this, audiolet, 0, 1);
            // Basic wave
            this.saw = new Saw(audiolet, frequency);
            // Gain envelope
            this.gain = new Gain(audiolet);
            this.env = new PercussiveEnvelope(audiolet, .1, .1, 1,
                function() {
                    this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
                }.bind(this)
            );
            this.envMulAdd = new MulAdd(audiolet, 0.3, 0);
            // Main signal path
            this.saw.connect(this.gain);
            this.gain.connect(this.outputs[0]);
            // Envelope
            this.env.connect(this.envMulAdd);
            this.envMulAdd.connect(this.gain, 0, 1);
        };
        extend(Synth, AudioletGroup);

        var SchedulerApp = function() {
            this.audiolet = new Audiolet();

//            if (chord.scale == "major") {
//                this.scale = new MajorScale();
//            } else if (chord.scale == "minor") {
//                this.scale = new MinorScale();
//            }

            this.scale = new MinorScale();

            // I IV V progression
            var chordPattern = new PSequence([[1, 3, 5]
//                                              [3, 5, 7],
//                                              [4, 6, 8]
                                              ]);
            // Play the progression
            this.audiolet.scheduler.play([chordPattern], 1,
                                         this.playChord.bind(this));
        };

        SchedulerApp.prototype.playChord = function(chord) {
            for (var i = 0; i < chord.length; i++) {
                var degree = chord[i];
                var frequency = this.scale.getFrequency(degree, 220, 0);
                var synth = new Synth(this.audiolet, frequency);
                synth.connect(this.audiolet.output);
            }
        };
        var app = new SchedulerApp();
    };

//        $scope.webAudio = function() {
//            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//            oscillator = audioCtx.createOscillator();
//            gainNode = audioCtx.createGain();
//
//            oscillator.connect(gainNode);
//            gainNode.connect(audioCtx.destination);
//
//            oscillator.type = "sine";
//            oscillator.frequency.value = 220;
//            oscillator.start();
//            oscillator.stop(audioCtx.currentTime + .5);
//            $timeout($scope.webAudio, 100);
//        };

});

midiApp.controller('sandbox-controller', function($scope, $http, $timeout) {

//    $scope.synth = new Tone.Synth().toMaster();
    const VF = Vex.Flow;

//    $scope.drawScore = function() {
//        // Create an SVG renderer and attach it to the DIV element named "vex".
//        var div = document.getElementById("vex")
//        var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
//
//        // Configure the rendering context.
//        renderer.resize(500, 500);
//        var context = renderer.getContext();
//        context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");
//
//        // Create a stave of width 400 at position 10, 40 on the canvas.
//        var stave = new VF.Stave(10, 40, 400);
//
//        // Add a clef and time signature.
//        stave.addClef("treble").addTimeSignature("4/4");
//
//        // Connect it to the rendering context and draw!
//        stave.setContext(context).draw();
//
//    }

    $scope.playInterval = function(interval) {
        var synth = new Tone.Synth().toMaster();
        var startNote = teoria.note(interval.startNote + interval.octave);
        //splitting the interval name string to add a "-" so it will be read as descending, instead of ascending by default
        if (interval.direction === "down") {
            var split1 = interval.interval.slice(0,1);
            var split2 = interval.interval.slice(-1);
            var descending = split1 + "-" + split2;
            var secondNote = startNote.interval(descending);
        } else {
            var secondNote = startNote.interval(interval.interval);
        }

        startNote = startNote.toString();
        secondNote = secondNote.toString();
        notesArray = [startNote, secondNote];


        var element = document.getElementById("vex");
        if (element) {
            element.innerHTML = "";

            var renderer = new VF.Renderer(element, VF.Renderer.Backends.SVG);
            renderer.resize(500, 500);
            var context = renderer.getContext();
            context.setFont("Arial", 10, "").setBackgroundFillStyle("#eeed");

            var stave = new VF.Stave(10, 40, 400);

    //        stave.addClef("treble").addTimeSignature("4/4");
            stave.addClef("treble");

            stave.setContext(context).draw();

            var note;
            var octave;
            var accidental;

            var intervalArray = [startNote, secondNote];

            var notes = [];
            for (var count = 0; count < intervalArray.length; count ++) {

                note = intervalArray[count].slice(0, 1);
                octave = intervalArray[count].slice(-1);

                if (intervalArray[count].length > 2) {
                    accidental = intervalArray[count].slice(1, -1);
                    if (accidental === "x") {
                        //vexflow does not understand the double sharp accidental "x"
                        accidental = "##";
                    }
                    notes.push(new VF.StaveNote({clef: "treble", keys: [note + "/" + octave], duration: "h", auto_stem: true})
                    .addAccidental(0, new VF.Accidental(accidental)));
                } else {
                    notes.push(new VF.StaveNote({clef: "treble", keys: [note + "/" + octave], duration:"h", auto_stem: true}));
                }

            }

            var voice = new VF.Voice({num_beats: 4, beat_value: 4});
            voice.addTickables(notes);

            var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 400);
            voice.draw(context, stave);
        }

        switch (interval.playType) {
            case "melodic":
                var synth = new Tone.Synth().toMaster();
                var count = 0;
                $timeout(function playNotes() {
                    synth.triggerAttackRelease(notesArray[count], "4n");
//                    console.log(count);
                    count++;
                    if (count < notes.length){
                        $timeout(playNotes, 500);
                    }
                }, 500);
                break;
            case "harmonic":
                var synth = new Tone.PolySynth(2, Tone.Synth).toMaster();
                synth.triggerAttackRelease([startNote, secondNote], "2n");
                break;
        }
    };

    $scope.playChord = function(inputChord) {
        var baseNote = teoria.note(inputChord.startNote + inputChord.octave);
        if (inputChord.chord !== "fullDim") {
            var chord = baseNote.chord(inputChord.chord);
        }
        var chordArray = [];
        switch (inputChord.chord) {
            case "minMin":
                minor7 = ["P1", "m3", "P5", "m7"];
                for (var count = 0; count < minor7.length; count++) {
                    chordArray.push(teoria.interval(baseNote, minor7[count]).toString());
                }
                break;
            case "fullDim":
                diminished = ["P1", "m3", "d5", "d7"];
                for (var count = 0; count < diminished.length; count++) {
                    chordArray.push(teoria.interval(baseNote, diminished[count]).toString());
                }
                break;
            default:
                for (var count = 0; count < chord.intervals.length; count++) {
                    chordArray.push(teoria.interval(baseNote, chord.intervals[count]).toString());
                }
        }



        var element = document.getElementById("vex");
        if (element) {
            element.innerHTML = "";

            var renderer = new VF.Renderer(element, VF.Renderer.Backends.SVG);
            renderer.resize(500, 500);
            var context = renderer.getContext();
            context.setFont("Arial", 10, "").setBackgroundFillStyle("#eeed");

            var stave = new VF.Stave(10, 40, 400);

            //add option for different clefs (alto, tenor, soprano, bass, etc...)

            stave.addClef("treble");

            stave.setContext(context).draw();

            var note;
            var octave;
            var accidental;

            console.log(chordArray);

            var vexChordArray = [];
            for (var count = 0; count < chordArray.length; count ++) {

                note = chordArray[count].slice(0, 1);
                octave = chordArray[count].slice(-1);

                if (chordArray[count].length > 2) {
                    accidental = chordArray[count].slice(1, -1);
                    if (accidental === "x") {
                        //vexflow does not understand the double sharp accidental "x"
                        accidental = "##";
                    }
//                    console.log(accidental);
                    var newNote = note + accidental + "/" + octave;
                    vexChordArray.push(newNote);
                } else {
                    var newNote = note + "/" + octave;
                    vexChordArray.push(newNote);
                }
            }


            var notes = [
                new VF.StaveNote({clef: "treble", keys: vexChordArray, duration: "w"})
                ];
            for (var count = 0; count < vexChordArray.length; count++){
                if (vexChordArray[count].length > 3) {
                    accidental = vexChordArray[count].slice(1, -2);
                    console.log(vexChordArray[count])
                    console.log(accidental);
                    notes[0] = notes[0].addAccidental(count, new VF.Accidental(accidental));
                }
            }

            console.log(vexChordArray);

            var voice = new VF.Voice({num_beats: 4, beat_value: 4});
            voice.addTickables(notes);

            var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 400);
            voice.draw(context, stave);






        switch (inputChord.playType) {
            case "harmonic":
                if (chordArray.length === 3) {
                    var synth = new Tone.PolySynth(3, Tone.Synth).toMaster();
                    synth.triggerAttackRelease([chordArray[0], chordArray[1], chordArray[2]], "2n");
                } else {
                    var synth = new Tone.PolySynth(4, Tone.Synth).toMaster();
                    synth.triggerAttackRelease([chordArray[0], chordArray[1], chordArray[2], chordArray[3]], "2n");
                }
                break;

            case "melodic":
                var synth = new Tone.Synth().toMaster();
                var count = 0;
                $timeout(function playNotes() {
                    synth.triggerAttackRelease(chordArray[count], "4n");
//                    console.log(count);
                    count++;
                    if (count < chordArray.length){
                        $timeout(playNotes, 500);
                    }
                }, 500);
                break;
        }
//        console.log(notes)

    }

    };

    $scope.playScale = function(inputScale) {
        var root = teoria.note(inputScale.startNote + inputScale.octave);
        var scaleArray = [];
        var synth = new Tone.Synth().toMaster();

        //Teoria does not know what these are, they must manually be programmed
        if(inputScale.name !== "whole-half" && inputScale.name !== "half-whole"){
            var scale = root.scale(inputScale.name);
        }

//        console.log(scale);
        switch (inputScale.name) {
            case "whole-half":
                var wholeHalf = ["P1", "M2", "m3", "P4", "d5", "m6", "M6", "M7", "P8"];
                for (var count = 0; count < wholeHalf.length; count++) {
                    scaleArray.push(root.interval(wholeHalf[count]).toString());
                }
                break;
            case "half-whole":
                var halfWhole = ["P1", "m2", "m3", "M3", "A4", "P5", "M6", "m7", "P8"];
                for (var count = 0; count < halfWhole.length; count++){
                    scaleArray.push(root.interval(halfWhole[count]).toString());
                }
                break;
            default:
                for (var count = 0; count < scale.scale.length; count++) {
                    scaleArray.push(teoria.interval(root, scale.scale[count]).toString());
                }
                scaleArray.push(root.interval("P8").toString());
        }
        console.log(notes);


        var element = document.getElementById("vex");
        if (element) {
            element.innerHTML = "";

            var renderer = new VF.Renderer(element, VF.Renderer.Backends.SVG);
            renderer.resize(900, 500);
            var context = renderer.getContext();
            context.setFont("Arial", 10, "").setBackgroundFillStyle("#eeed");

            var stave = new VF.Stave(10, 40, 800);

            stave.addClef("treble");

            stave.setContext(context).draw();

            var note;
            var octave;
            var accidental;

            var notes = [];
            for (var count = 0; count < scaleArray.length; count ++) {

                note = scaleArray[count].slice(0, 1);
                octave = scaleArray[count].slice(-1);

                if (scaleArray[count].length > 2) {
                    accidental = scaleArray[count].slice(1, -1);
                    if(accidental === "x") {
                        accidental = "##";
                    }
//                    console.log(accidental);
                    notes.push(new VF.StaveNote({clef: "treble", keys: [note + "/" + octave], duration: "q", auto_stem: true})
                    .addAccidental(0, new VF.Accidental(accidental)));
                } else {
                    notes.push(new VF.StaveNote({clef: "treble", keys: [note + "/" + octave], duration:"q", auto_stem: true}));
                }

            }


            if (scaleArray.length === 9) {
                var voice = new VF.Voice({num_beats: 9, beat_value: 4});
            } else if (scaleArray.length === 13) {
                var voice = new VF.Voice({num_beats: 13, beat_value: 4});
            } else if (scaleArray.length === 6) {
                var voice = new VF.Voice({num_beats: 6, beat_value: 4});
            } else if (scaleArray.length === 7) {
                var voice = new VF.Voice({num_beats: 7, beat_value: 4});
            } else {
                var voice = new VF.Voice({num_beats: 8, beat_value: 4});
            }

            voice.addTickables(notes);

            var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 800);
            voice.draw(context, stave);
        }

        var synth = new Tone.Synth().toMaster();
                var count = 0;
                $timeout(function playNotes() {
                    synth.triggerAttackRelease(scaleArray[count], "4n");
        //            console.log(count);
                    count++;
                    if (count < scaleArray.length){
                        $timeout(playNotes, 500);
                    }
                }, 500);


    };

});